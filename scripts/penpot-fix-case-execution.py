"""
FIX: Delete empty 80-Case pages and recreate with correct parent hierarchy.
The original script used parent=ROOT for first-level children, making them
siblings of the frame instead of children. This script fixes that.
"""
import json
import uuid
import requests

BASE = "https://dspp.jetme.com.br/api/rpc/command"
FILE_ID = "73c70309-a5e2-8120-8007-c7820d832ea2"
FEATURES = ["~#set", [
    "fdata/path-data", "design-tokens/v1", "variants/v1", "layout/grid",
    "components/v2", "fdata/shape-data-type", "styles/v2", "flex/v2",
    "grid/v2", "booleans/v2"
]]
ROOT = "00000000-0000-0000-0000-000000000000"

session = requests.Session()

# ── Login ──
resp = session.post(f"{BASE}/login-with-password",
    headers={"Content-Type": "application/transit+json"},
    data=json.dumps(["^ ", "~:email", "clauded@jetme.com.br", "~:password", "Claude-Desktop"]))
assert resp.status_code == 200, f"Login failed: {resp.text[:200]}"
print("Login OK")

# ── Get revn ──
resp = session.post(f"{BASE}/get-file",
    headers={"Content-Type": "application/transit+json", "Accept": "application/transit+json"},
    data=json.dumps(["^ ", "~:id", f"~u{FILE_ID}", "~:features", FEATURES]))
assert resp.status_code == 200
text = resp.text
revn_idx = text.find('"~:revn"')
revn = int(text[revn_idx:revn_idx+30].split(",")[1].strip())
print(f"Current revn: {revn}")

# ═══════════════════════════════════════════
# HELPERS
# ═══════════════════════════════════════════

def uid():
    return str(uuid.uuid4())

def selrect(x, y, w, h):
    return ["^ ", "~:x", x, "~:y", y, "~:width", w, "~:height", h,
            "~:x1", x, "~:y1", y, "~:x2", x+w, "~:y2", y+h]

def points(x, y, w, h):
    return [
        ["^ ", "~:x", x, "~:y", y],
        ["^ ", "~:x", x+w, "~:y", y],
        ["^ ", "~:x", x+w, "~:y", y+h],
        ["^ ", "~:x", x, "~:y", y+h],
    ]

IDENTITY = ["^ ", "~:a", 1, "~:b", 0, "~:c", 0, "~:d", 1, "~:e", 0, "~:f", 0]

def make_frame(fid, name, x, y, w, h, fill="#FFFFFF"):
    return ["^ ",
        "~:id", f"~u{fid}", "~:type", "~:frame", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{ROOT}", "~:frame-id", f"~u{ROOT}",
        "~:fills", [["^ ", "~:fill-color", fill, "~:fill-opacity", 1]],
        "~:strokes", [],
        "~:shapes", [],
    ]

def make_rect(rid, name, x, y, w, h, fill, parent, frame,
              opacity=1, radius=0, r1=None, r2=None, r3=None, r4=None,
              strokes=None):
    obj = ["^ ",
        "~:id", f"~u{rid}", "~:type", "~:rect", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{parent}", "~:frame-id", f"~u{frame}",
        "~:fills", [["^ ", "~:fill-color", fill, "~:fill-opacity", opacity]],
        "~:strokes", strokes if strokes else [],
    ]
    if radius > 0:
        obj.extend(["~:rx", radius, "~:ry", radius])
    if r1 is not None:
        obj.extend(["~:r1", r1, "~:r2", r2, "~:r3", r3, "~:r4", r4])
    return obj

def make_text(tid, name, x, y, w, h, text, font_size, font_weight, color,
              parent, frame, italic=False, uppercase=False,
              letter_spacing=0, line_height=1.3):
    leaf = ["^ ",
        "~:text", text,
        "~:font-id", "plusjakartasans",
        "~:font-family", "Plus Jakarta Sans",
        "~:font-variant-id", str(font_weight),
        "~:font-size", str(font_size),
        "~:font-weight", str(font_weight),
        "~:font-style", "normal",
        "~:line-height", str(line_height),
        "~:letter-spacing", str(letter_spacing),
        "~:fill-color", color,
        "~:fill-opacity", 1,
        "~:text-transform", "uppercase" if uppercase else "none",
    ]
    content = ["^ ",
        "~:type", "root",
        "~:children", [
            ["^ ", "~:type", "paragraph-set", "~:children", [
                ["^ ", "~:type", "paragraph", "~:children", [leaf]]
            ]]
        ]
    ]
    return ["^ ",
        "~:id", f"~u{tid}", "~:type", "~:text", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{parent}", "~:frame-id", f"~u{frame}",
        "~:fills", [],
        "~:strokes", [],
        "~:content", content,
    ]

def stroke_border(color="#E8E8E6", width=1, alignment="inner", opacity=1):
    return [["^ ",
        "~:stroke-style", "~:solid",
        "~:stroke-alignment", f"~:{alignment}",
        "~:stroke-width", width,
        "~:stroke-color", color,
        "~:stroke-opacity", opacity,
    ]]

def add_obj(oid, parent, frame, obj, page_id):
    return ["^ ",
        "~:type", "~:add-obj",
        "~:id", f"~u{oid}",
        "~:page-id", f"~u{page_id}",
        "~:parent-id", f"~u{parent}",
        "~:frame-id", f"~u{frame}",
        "~:obj", obj,
    ]

def add_page_change(page_id, name):
    return ["^ ",
        "~:type", "~:add-page",
        "~:id", f"~u{page_id}",
        "~:name", name,
    ]

def del_page_change(page_id):
    return ["^ ",
        "~:type", "~:del-page",
        "~:id", f"~u{page_id}",
    ]

def send_changes(changes, label):
    global revn
    body = ["^ ",
        "~:id", f"~u{FILE_ID}",
        "~:session-id", f"~u{FILE_ID}",
        "~:revn", revn,
        "~:vern", 0,
        "~:features", FEATURES,
        "~:changes", changes,
    ]
    resp = session.post(f"{BASE}/update-file",
        headers={"Content-Type": "application/transit+json"},
        data=json.dumps(body))
    if resp.status_code == 200:
        revn += 1
        print(f"  {label}: OK (revn={revn})")
        return True
    else:
        print(f"  {label}: FAILED - {resp.text[:500]}")
        return False

# ═══════════════════════════════════════════
# COLORS
# ═══════════════════════════════════════════

BLUE = "#2E86C1"
BLUE_LT = "#E3F2FD"
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"
BORDER_LT = "#F0F0EE"
T1 = "#111111"; T2 = "#333333"; T3 = "#555555"; T4 = "#888888"; T5 = "#AAAAAA"; T6 = "#CCCCCC"
ERR = "#E74C3C"; SUCCESS = "#27AE60"; WARN = "#E67E22"; WARN_BG = "#FFF3E0"
AMBER_T = "#B8860B"; AMBER_BG = "#FFF3E0"; AMBER_BD = "#FFE0B2"
GREEN = "#1E7A42"; GREEN_LT = "#E8F8EF"; GREEN_BD = "#B5E8C9"
FAFAFA = "#FAFAFA"; BLUE_BD = "#B5D4F0"


# ═══════════════════════════════════════════
# DELETE OLD PAGES
# ═══════════════════════════════════════════

OLD_PAGES = [
    "21a8aad6-7fe7-4655-a07c-8e6584d23ed0",
    "8112e528-06a1-4dc7-8de3-a3eb7104a1cb",
    "e85cbc8c-884d-400b-9df0-d67909de64f2",
    "f16c48a0-24f5-4576-86c6-65b17187d736",
    "ab77d770-2a10-49f6-bdb3-96054228109d",
    "a3a15a2b-42a8-4856-82aa-1a25fb0d17d0",
    "61a718c5-251f-4cd9-ada2-ca7cef2b4618",
]

print("\n=== Deleting old pages ===")
for pid in OLD_PAGES:
    if send_changes([del_page_change(pid)], f"del-page {pid[:8]}"):
        pass
    else:
        print(f"  Warning: could not delete page {pid[:8]}, may not exist")


# ═══════════════════════════════════════════
# SHARED BUILDERS — FIXED: use frame_id as parent for first-level children
# ═══════════════════════════════════════════

def build_topbar(frame_id, breadcrumb_items):
    """Build topbar — all objects are children of frame_id."""
    ops = []
    tb_id = uid()
    # FIX: parent=frame_id (not ROOT)
    ops.append((tb_id, frame_id, frame_id,
        make_rect(tb_id, "Topbar", 0, 0, 1440, 64, WHITE, frame_id, frame_id,
                  strokes=stroke_border(BORDER, 1, "inner"))))

    logo_id = uid()
    ops.append((logo_id, tb_id, frame_id,
        make_rect(logo_id, "Logo", 24, 12, 40, 40, BLUE, tb_id, frame_id, radius=10)))
    logo_t = uid()
    ops.append((logo_t, logo_id, frame_id,
        make_text(logo_t, "LogoText", 30, 20, 28, 20, "A1", 16, 800, WHITE, logo_id, frame_id)))

    cn = uid()
    ops.append((cn, tb_id, frame_id,
        make_text(cn, "CompanyName", 76, 14, 80, 16, "Grupo A1", 14, 800, T1, tb_id, frame_id)))
    cs = uid()
    ops.append((cs, tb_id, frame_id,
        make_text(cs, "CompanySub", 76, 32, 100, 12, "PORTAL INTERNO", 10, 600, T4, tb_id, frame_id,
                  uppercase=True, letter_spacing=1.2)))

    sep = uid()
    ops.append((sep, tb_id, frame_id,
        make_rect(sep, "Separator", 184, 20, 1, 24, BORDER, tb_id, frame_id)))

    bx = 197
    for i, (label, is_active) in enumerate(breadcrumb_items):
        if i > 0:
            chev = uid()
            ops.append((chev, tb_id, frame_id,
                make_text(chev, "BcChev", bx, 23, 10, 16, "›", 13, 400, T6, tb_id, frame_id)))
            bx += 16
        bc = uid()
        color = T1 if is_active else T4
        weight = 700 if is_active else 400
        ops.append((bc, tb_id, frame_id,
            make_text(bc, f"Bc-{label}", bx, 23, len(label)*8, 16, label, 13, weight, color, tb_id, frame_id)))
        bx += len(label) * 8 + 8

    un = uid()
    ops.append((un, tb_id, frame_id,
        make_text(un, "UserName", 1280, 16, 90, 14, "Admin ECF", 12, 700, T1, tb_id, frame_id)))
    ue = uid()
    ops.append((ue, tb_id, frame_id,
        make_text(ue, "UserEntity", 1280, 32, 90, 12, "A1 Engenharia", 10, 400, T4, tb_id, frame_id)))
    av = uid()
    ops.append((av, tb_id, frame_id,
        make_rect(av, "Avatar", 1380, 12, 40, 40, "#F0F0EE", tb_id, frame_id, radius=20,
                  strokes=stroke_border(BORDER, 2))))
    avt = uid()
    ops.append((avt, av, frame_id,
        make_text(avt, "AvatarText", 1388, 22, 24, 16, "AE", 13, 700, T3, av, frame_id)))

    return ops


def build_sidebar(frame_id, active_item="Casos"):
    ops = []
    sb_id = uid()
    # FIX: parent=frame_id
    ops.append((sb_id, frame_id, frame_id,
        make_rect(sb_id, "Sidebar", 0, 64, 240, 836, WHITE, frame_id, frame_id,
                  strokes=stroke_border(BORDER, 1, "inner"))))

    items = [
        ("ADMINISTRAÇÃO", [("Usuários", False), ("Perfis e Permissões", False)]),
        ("ORGANIZAÇÃO", [("Estrutura Org.", False)]),
        ("PROCESSOS", [("Modelagem", False), ("Casos", active_item == "Casos")]),
        ("APROVAÇÃO", [("Movimentos", False)]),
    ]

    y = 88
    for cat_name, cat_items in items:
        ct = uid()
        ops.append((ct, sb_id, frame_id,
            make_text(ct, f"Cat-{cat_name}", 28, y, 200, 12, cat_name, 9, 700, T5, sb_id, frame_id,
                      uppercase=True, letter_spacing=1.4)))
        y += 20
        for item_name, is_active in cat_items:
            item_id = uid()
            if is_active:
                ops.append((item_id, sb_id, frame_id,
                    make_rect(item_id, f"SbItem-{item_name}-bg", 16, y, 208, 36, BLUE_LT, sb_id, frame_id, radius=6)))
                it = uid()
                ops.append((it, item_id, frame_id,
                    make_text(it, f"SbItem-{item_name}", 44, y+9, 160, 16, item_name, 13, 700, BLUE, item_id, frame_id)))
            else:
                it = uid()
                ops.append((it, sb_id, frame_id,
                    make_text(it, f"SbItem-{item_name}", 44, y+9, 160, 16, item_name, 13, 500, T4, sb_id, frame_id)))
            y += 38
        y += 12

    ft_line = uid()
    ops.append((ft_line, sb_id, frame_id,
        make_rect(ft_line, "SbFooterLine", 0, 868, 240, 1, BORDER, sb_id, frame_id)))
    dot = uid()
    ops.append((dot, sb_id, frame_id,
        make_rect(dot, "SbDot", 16, 882, 8, 8, SUCCESS, sb_id, frame_id, radius=4)))
    ft_t = uid()
    ops.append((ft_t, sb_id, frame_id,
        make_text(ft_t, "SbFooterText", 32, 878, 120, 14, "Servidor Online", 12, 400, T4, sb_id, frame_id)))

    return ops


def build_content_area(frame_id):
    ca_id = uid()
    # FIX: parent=frame_id
    obj = make_rect(ca_id, "ContentArea", 240, 64, 1200, 836, BG_PAGE, frame_id, frame_id)
    return ca_id, [(ca_id, frame_id, frame_id, obj)]


def build_case_header(frame_id, ca_id, active_tab="Gates"):
    ops = []

    hc_id = uid()
    ops.append((hc_id, ca_id, frame_id,
        make_rect(hc_id, "HeaderCard", 264, 88, 1152, 90, WHITE, ca_id, frame_id, radius=12,
                  strokes=stroke_border(BORDER))))

    cc = uid()
    ops.append((cc, hc_id, frame_id,
        make_text(cc, "CaseCode", 288, 108, 180, 22, "CASO-2026-0042", 20, 700, T1, hc_id, frame_id)))

    sb_id = uid()
    ops.append((sb_id, hc_id, frame_id,
        make_rect(sb_id, "StatusBadge", 480, 110, 110, 22, AMBER_BG, hc_id, frame_id, radius=4,
                  strokes=stroke_border(AMBER_BD))))
    sbt = uid()
    ops.append((sbt, sb_id, frame_id,
        make_text(sbt, "StatusText", 490, 113, 90, 14, "EM ANDAMENTO", 10, 700, AMBER_T, sb_id, frame_id,
                  uppercase=True, letter_spacing=0.3)))

    btn_susp = uid()
    ops.append((btn_susp, hc_id, frame_id,
        make_rect(btn_susp, "BtnSuspender", 1288, 100, 80, 36, WHITE, hc_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    bst = uid()
    ops.append((bst, btn_susp, frame_id,
        make_text(bst, "BtnSuspText", 1296, 110, 64, 14, "Suspender", 12, 600, T3, btn_susp, frame_id)))

    btn_canc = uid()
    ops.append((btn_canc, hc_id, frame_id,
        make_rect(btn_canc, "BtnCancelar", 1376, 100, 72, 36, WHITE, hc_id, frame_id, radius=8,
                  strokes=stroke_border(ERR))))
    bct = uid()
    ops.append((bct, btn_canc, frame_id,
        make_text(bct, "BtnCancText", 1384, 110, 56, 14, "Cancelar", 12, 600, ERR, btn_canc, frame_id)))

    stages = [("Abertura", T4, 500), ("Revisão", T1, 700), ("Aprovação N2", T5, 500)]
    sx = 288
    for i, (label, color, weight) in enumerate(stages):
        if i > 0:
            ch = uid()
            ops.append((ch, hc_id, frame_id,
                make_text(ch, "StageChev", sx, 148, 10, 16, "›", 13, 400, T6, hc_id, frame_id)))
            sx += 16
        st = uid()
        ops.append((st, hc_id, frame_id,
            make_text(st, f"Stage-{label}", sx, 148, len(label)*8+4, 16, label, 13, weight, color, hc_id, frame_id)))
        sx += len(label)*8 + 12

    # Progress bar — parent=ca_id (content area)
    py = 192
    seg_w = 380
    colors_p = [SUCCESS, BLUE, BORDER]
    labels_p = ["Abertura", "Revisão", "Aprovação N2"]
    for i, (c, lbl) in enumerate(zip(colors_p, labels_p)):
        seg_id = uid()
        ops.append((seg_id, ca_id, frame_id,
            make_rect(seg_id, f"ProgSeg-{lbl}", 264 + i*seg_w + i*4, py, seg_w, 8, c, ca_id, frame_id, radius=4)))

    # Tab bar
    ty = 216
    tab_line = uid()
    ops.append((tab_line, ca_id, frame_id,
        make_rect(tab_line, "TabLine", 264, ty+42, 1152, 1, BORDER, ca_id, frame_id)))

    tab_names = ["Gates", "Atribuições", "Timeline"]
    tx = 264
    for tname in tab_names:
        tt = uid()
        is_active = tname == active_tab
        ops.append((tt, ca_id, frame_id,
            make_text(tt, f"Tab-{tname}", tx, ty+12, len(tname)*9, 16, tname, 13,
                      700 if is_active else 600,
                      BLUE if is_active else T4,
                      ca_id, frame_id)))
        if is_active:
            tab_under = uid()
            ops.append((tab_under, ca_id, frame_id,
                make_rect(tab_under, f"TabUnder-{tname}", tx, ty+40, len(tname)*9, 2, BLUE, ca_id, frame_id)))
        tx += len(tname)*9 + 40

    return ops


# ═══════════════════════════════════════════
# PAGE 1: 80-CaseList
# ═══════════════════════════════════════════

def build_case_list(page_id):
    frame_id = uid()
    ops = []

    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CaseList", 0, 0, 1440, 900, BG_PAGE)))

    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", True)]))
    ops.extend(build_sidebar(frame_id))

    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)

    # Page header
    ph_t = uid()
    ops.append((ph_t, ca_id, frame_id,
        make_text(ph_t, "PageTitle", 264, 88, 200, 28, "Casos", 24, 800, T1, ca_id, frame_id)))
    ph_d = uid()
    ops.append((ph_d, ca_id, frame_id,
        make_text(ph_d, "PageDesc", 264, 120, 400, 16, "Gerencie os casos de execução do seu tenant", 13, 400, T4, ca_id, frame_id)))

    btn_id = uid()
    ops.append((btn_id, ca_id, frame_id,
        make_rect(btn_id, "BtnNovoCaso", 1320, 84, 96, 40, BLUE, ca_id, frame_id, radius=8)))
    btn_t = uid()
    ops.append((btn_t, btn_id, frame_id,
        make_text(btn_t, "BtnNovoCasoText", 1328, 96, 80, 16, "+ Novo Caso", 13, 700, WHITE, btn_id, frame_id)))

    # Filter bar
    fy = 148
    filters = [
        ("SelectCiclo", 264, 200, "Ciclo: Todos"),
        ("SelectStatus", 476, 160, "Status: Todos"),
        ("SelectEstagio", 648, 180, "Estágio: Todos"),
    ]
    for fname, fx, fw, placeholder in filters:
        fid = uid()
        ops.append((fid, ca_id, frame_id,
            make_rect(fid, fname, fx, fy, fw, 40, WHITE, ca_id, frame_id, radius=8,
                      strokes=stroke_border(BORDER))))
        ft = uid()
        ops.append((ft, fid, frame_id,
            make_text(ft, f"{fname}Text", fx+12, fy+12, fw-24, 16, placeholder, 12, 500, T2, fid, frame_id)))

    tg_id = uid()
    ops.append((tg_id, ca_id, frame_id,
        make_rect(tg_id, "Toggle", 840, fy+10, 36, 20, BORDER, ca_id, frame_id, radius=10)))
    tg_t = uid()
    ops.append((tg_t, ca_id, frame_id,
        make_text(tg_t, "ToggleLabel", 884, fy+12, 160, 14, "Minha responsabilidade", 12, 500, T3, ca_id, frame_id)))

    dr_id = uid()
    ops.append((dr_id, ca_id, frame_id,
        make_rect(dr_id, "DateRange", 1056, fy, 160, 40, WHITE, ca_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    dr_t = uid()
    ops.append((dr_t, dr_id, frame_id,
        make_text(dr_t, "DateRangeText", 1068, fy+12, 120, 16, "Período", 12, 500, T2, dr_id, frame_id)))

    sb_id2 = uid()
    ops.append((sb_id2, ca_id, frame_id,
        make_rect(sb_id2, "SearchBar", 1228, fy, 188, 40, WHITE, ca_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    sb_t = uid()
    ops.append((sb_t, sb_id2, frame_id,
        make_text(sb_t, "SearchText", 1264, fy+12, 140, 16, "Buscar por código...", 12, 400, T6, sb_id2, frame_id)))

    # Table card
    tbl_y = 204
    tbl_id = uid()
    ops.append((tbl_id, ca_id, frame_id,
        make_rect(tbl_id, "TableCard", 264, tbl_y, 1152, 420, WHITE, ca_id, frame_id, radius=12,
                  strokes=stroke_border(BORDER))))

    th_id = uid()
    ops.append((th_id, tbl_id, frame_id,
        make_rect(th_id, "TableHeader", 264, tbl_y, 1152, 44, FAFAFA, tbl_id, frame_id,
                  r1=12, r2=12, r3=0, r4=0, strokes=stroke_border(BORDER_LT))))

    cols = [("CÓDIGO", 284, 140), ("CICLO", 424, 160), ("ESTÁGIO ATUAL", 584, 160),
            ("STATUS", 744, 130), ("RESPONSÁVEL", 874, 150), ("CRIADO EM", 1024, 120), ("AÇÕES", 1144, 80)]
    for col_name, cx, cw in cols:
        ct = uid()
        ops.append((ct, th_id, frame_id,
            make_text(ct, f"TH-{col_name}", cx, tbl_y+14, cw, 14, col_name, 10, 700, T4, th_id, frame_id,
                      uppercase=True, letter_spacing=0.8)))

    rows = [
        ("CASO-2026-0042", "Onboarding v2.1", "Revisão", "EM ANDAMENTO", "ip", "Ana Oliveira", "30 mar 2026", "3"),
        ("CASO-2026-0041", "Compliance 2026", "Aprovação N2", "EM ANDAMENTO", "ip", "Marcos Silva", "28 mar 2026", "1"),
        ("CASO-2026-0040", "Onboarding v2.1", "Encerramento", "CONCLUÍDO", "done", "Julia Lima", "25 mar 2026", None),
        ("CASO-2026-0039", "Compliance 2026", "Abertura", "ABERTO", "open", "Pedro Mendes", "22 mar 2026", None),
        ("CASO-2026-0038", "Onboarding v2.1", "Revisão", "CANCELADO", "cancel", "Ana Oliveira", "20 mar 2026", None),
        ("CASO-2026-0037", "Auditoria Q1", "Abertura", "EM ESPERA", "hold", "Carlos Ferreira", "18 mar 2026", None),
    ]
    badge_colors = {
        "open": (BLUE, BLUE_LT, BLUE_BD),
        "ip": (AMBER_T, AMBER_BG, AMBER_BD),
        "done": (GREEN, GREEN_LT, GREEN_BD),
        "cancel": (T4, BG_PAGE, BORDER),
        "hold": (WARN, WARN_BG, AMBER_BD),
    }

    for ri, (code, ciclo, estagio, status_text, status_key, resp_name, date, pending) in enumerate(rows):
        ry = tbl_y + 44 + ri * 52
        row_id = uid()
        ops.append((row_id, tbl_id, frame_id,
            make_rect(row_id, f"Row-{ri}", 264, ry, 1152, 52, WHITE, tbl_id, frame_id, opacity=0,
                      strokes=stroke_border(BORDER_LT))))

        ct = uid()
        ops.append((ct, tbl_id, frame_id,
            make_text(ct, f"Code-{ri}", 284, ry+18, 140, 16, code, 13, 600, T2, tbl_id, frame_id)))
        ct2 = uid()
        ops.append((ct2, tbl_id, frame_id,
            make_text(ct2, f"Ciclo-{ri}", 424, ry+18, 160, 16, ciclo, 13, 500, T1, tbl_id, frame_id)))
        ct3 = uid()
        ops.append((ct3, tbl_id, frame_id,
            make_text(ct3, f"Estagio-{ri}", 584, ry+18, 160, 16, estagio, 13, 500, T1, tbl_id, frame_id)))

        bc_text, bc_bg, bc_bd = badge_colors[status_key]
        badge_id = uid()
        ops.append((badge_id, tbl_id, frame_id,
            make_rect(badge_id, f"Badge-{ri}", 744, ry+15, len(status_text)*7+20, 22, bc_bg, tbl_id, frame_id,
                      radius=4, strokes=stroke_border(bc_bd))))
        bt = uid()
        ops.append((bt, badge_id, frame_id,
            make_text(bt, f"BadgeText-{ri}", 754, ry+18, len(status_text)*7, 14, status_text, 10, 700, bc_text, badge_id, frame_id,
                      uppercase=True, letter_spacing=0.3)))

        ct4 = uid()
        ops.append((ct4, tbl_id, frame_id,
            make_text(ct4, f"Resp-{ri}", 874, ry+18, 150, 16, resp_name, 13, 500, T1, tbl_id, frame_id)))
        ct5 = uid()
        ops.append((ct5, tbl_id, frame_id,
            make_text(ct5, f"Date-{ri}", 1024, ry+18, 120, 14, date, 12, 400, T4, tbl_id, frame_id)))

        if pending:
            pb_id = uid()
            ops.append((pb_id, tbl_id, frame_id,
                make_rect(pb_id, f"PendingBadge-{ri}", 1184, ry+16, 20, 20, ERR, tbl_id, frame_id, radius=10)))
            pbt = uid()
            ops.append((pbt, pb_id, frame_id,
                make_text(pbt, f"PendingText-{ri}", 1188, ry+19, 12, 14, pending, 10, 700, WHITE, pb_id, frame_id)))

    tf_y = tbl_y + 44 + len(rows)*52
    tf_id = uid()
    ops.append((tf_id, tbl_id, frame_id,
        make_rect(tf_id, "TableFooter", 264, tf_y, 1152, 52, WHITE, tbl_id, frame_id,
                  r1=0, r2=0, r3=12, r4=12, strokes=stroke_border(BORDER_LT))))
    tft = uid()
    ops.append((tft, tf_id, frame_id,
        make_text(tft, "LoadMore", 780, tf_y+17, 100, 16, "Carregar mais", 13, 600, BLUE, tf_id, frame_id)))

    return frame_id, ops


# ═══════════════════════════════════════════
# PAGE 2: 80-CasePanel-Gates
# ═══════════════════════════════════════════

def build_case_panel_gates(page_id):
    frame_id = uid()
    ops = []
    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CasePanel-Gates", 0, 0, 1440, 900, BG_PAGE)))
    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", False), ("CASO-2026-0042", True)]))
    ops.extend(build_sidebar(frame_id))
    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)
    ops.extend(build_case_header(frame_id, ca_id, "Gates"))

    gy = 276
    gates = [
        ("Documentação Completa", "DOCUMENT", "RESOLVIDO", "resolved", False),
        ("Aprovação do Gestor", "APPROVAL", "PENDENTE", "pending", True),
        ("Checklist de Conformidade", "CHECKLIST", "PENDENTE", "pending", False),
    ]
    gate_badge_colors = {
        "resolved": (GREEN, GREEN_LT, GREEN_BD),
        "pending": (AMBER_T, AMBER_BG, AMBER_BD),
    }

    for gi, (gname, gtype, gstatus, gkey, has_actions) in enumerate(gates):
        gc_h = 70 if not has_actions else 100
        if gname == "Checklist de Conformidade":
            gc_h = 160
        gc_id = uid()
        ops.append((gc_id, ca_id, frame_id,
            make_rect(gc_id, f"GateCard-{gi}", 264, gy, 1152, gc_h, WHITE, ca_id, frame_id, radius=10,
                      strokes=stroke_border(BORDER))))
        gn = uid()
        ops.append((gn, gc_id, frame_id,
            make_text(gn, f"GateName-{gi}", 284, gy+16, 300, 18, gname, 14, 600, T1, gc_id, frame_id)))
        gt = uid()
        ops.append((gt, gc_id, frame_id,
            make_text(gt, f"GateType-{gi}", 284, gy+36, 100, 12, gtype, 9, 700, T4, gc_id, frame_id,
                      uppercase=True, letter_spacing=0.8)))
        bc_text, bc_bg, bc_bd = gate_badge_colors[gkey]
        gb_id = uid()
        ops.append((gb_id, gc_id, frame_id,
            make_rect(gb_id, f"GateBadge-{gi}", 1340, gy+16, len(gstatus)*7+20, 22, bc_bg, gc_id, frame_id,
                      radius=4, strokes=stroke_border(bc_bd))))
        gbt = uid()
        ops.append((gbt, gb_id, frame_id,
            make_text(gbt, f"GateBadgeText-{gi}", 1350, gy+19, len(gstatus)*7, 14, gstatus, 10, 700, bc_text, gb_id, frame_id,
                      uppercase=True, letter_spacing=0.3)))
        if has_actions:
            br_id = uid()
            ops.append((br_id, gc_id, frame_id,
                make_rect(br_id, "BtnResolver", 284, gy+60, 80, 36, BLUE, gc_id, frame_id, radius=8)))
            brt = uid()
            ops.append((brt, br_id, frame_id,
                make_text(brt, "BtnResolverText", 296, gy+70, 56, 14, "Resolver", 12, 700, WHITE, br_id, frame_id)))
            bd_id = uid()
            ops.append((bd_id, gc_id, frame_id,
                make_rect(bd_id, "BtnDispensar", 372, gy+60, 86, 36, WHITE, gc_id, frame_id, radius=8,
                          strokes=stroke_border(BORDER))))
            bdt = uid()
            ops.append((bdt, bd_id, frame_id,
                make_text(bdt, "BtnDispensarText", 382, gy+70, 66, 14, "Dispensar", 12, 600, T3, bd_id, frame_id)))
        if gname == "Checklist de Conformidade":
            checks = [
                ("Formulário preenchido", True), ("Documentos digitalizados", True),
                ("Assinaturas coletadas", True), ("Validação técnica", False), ("Aprovação financeira", False),
            ]
            cy = gy + 60
            for ci, (ctext, checked) in enumerate(checks):
                cb_id = uid()
                fill_c = BLUE if checked else WHITE
                ops.append((cb_id, gc_id, frame_id,
                    make_rect(cb_id, f"Check-{ci}", 284, cy, 16, 16, fill_c, gc_id, frame_id, radius=3,
                              strokes=stroke_border(BLUE if checked else BORDER))))
                if checked:
                    ck_t = uid()
                    ops.append((ck_t, cb_id, frame_id,
                        make_text(ck_t, f"CheckMark-{ci}", 287, cy+1, 10, 14, "✓", 10, 700, WHITE, cb_id, frame_id)))
                cl = uid()
                ops.append((cl, gc_id, frame_id,
                    make_text(cl, f"CheckLabel-{ci}", 308, cy, 300, 16, ctext, 13, 500, T1 if checked else T4, gc_id, frame_id)))
                cy += 24
        gy += gc_h + 12

    tb_id = uid()
    ops.append((tb_id, ca_id, frame_id,
        make_rect(tb_id, "BtnTransition", 1220, gy+8, 196, 44, BORDER, ca_id, frame_id, radius=8)))
    tbt = uid()
    ops.append((tbt, tb_id, frame_id,
        make_text(tbt, "BtnTransText", 1232, gy+22, 172, 16, "Avançar para Aprovação N2", 13, 700, T5, tb_id, frame_id)))

    return frame_id, ops


# ═══════════════════════════════════════════
# PAGE 3: 80-CasePanel-Assignments
# ═══════════════════════════════════════════

def build_case_panel_assignments(page_id):
    frame_id = uid()
    ops = []
    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CasePanel-Assignments", 0, 0, 1440, 900, BG_PAGE)))
    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", False), ("CASO-2026-0042", True)]))
    ops.extend(build_sidebar(frame_id))
    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)
    ops.extend(build_case_header(frame_id, ca_id, "Atribuições"))

    ay = 276
    assignments = [
        ("Revisor Técnico", "Ana Oliveira", "AO", False),
        ("Aprovador N2", None, None, True),
        ("Analista de Conformidade", "Marcos Silva", "MS", False),
    ]
    for ai, (role, person, initials, unassigned) in enumerate(assignments):
        ac_h = 92 if person else 76
        ac_id = uid()
        ops.append((ac_id, ca_id, frame_id,
            make_rect(ac_id, f"AssignCard-{ai}", 264, ay, 1152, ac_h, WHITE, ca_id, frame_id, radius=10,
                      strokes=stroke_border(BORDER))))
        if unassigned:
            rl_id = uid()
            ops.append((rl_id, ac_id, frame_id,
                make_rect(rl_id, f"RedBorder-{ai}", 264, ay, 3, ac_h, ERR, ac_id, frame_id,
                          r1=10, r2=0, r3=0, r4=10)))
        rn = uid()
        ops.append((rn, ac_id, frame_id,
            make_text(rn, f"Role-{ai}", 284, ay+16, 300, 18, role, 14, 600, T1, ac_id, frame_id)))
        if person:
            av_id = uid()
            ops.append((av_id, ac_id, frame_id,
                make_rect(av_id, f"AssignAvatar-{ai}", 284, ay+40, 28, 28, BLUE, ac_id, frame_id, radius=14)))
            avt = uid()
            ops.append((avt, av_id, frame_id,
                make_text(avt, f"AssignInitials-{ai}", 289, ay+47, 18, 12, initials, 10, 700, WHITE, av_id, frame_id)))
            pn = uid()
            ops.append((pn, ac_id, frame_id,
                make_text(pn, f"AssignName-{ai}", 320, ay+46, 200, 16, person, 13, 500, T2, ac_id, frame_id)))
            ra = uid()
            ops.append((ra, ac_id, frame_id,
                make_text(ra, f"Reatribuir-{ai}", 284, ay+72, 80, 14, "Reatribuir", 12, 600, BLUE, ac_id, frame_id)))
        else:
            wt = uid()
            ops.append((wt, ac_id, frame_id,
                make_text(wt, f"UnassignWarn-{ai}", 284, ay+38, 250, 14, "Obrigatório — não atribuído", 12, 500, ERR, ac_id, frame_id)))
            at = uid()
            ops.append((at, ac_id, frame_id,
                make_text(at, f"Atribuir-{ai}", 284, ay+58, 60, 14, "Atribuir", 12, 700, BLUE, ac_id, frame_id)))
        ay += ac_h + 12

    tb_id = uid()
    ops.append((tb_id, ca_id, frame_id,
        make_rect(tb_id, "BtnTransition", 1220, ay+8, 196, 44, BORDER, ca_id, frame_id, radius=8)))
    tbt = uid()
    ops.append((tbt, tb_id, frame_id,
        make_text(tbt, "BtnTransText", 1232, ay+22, 172, 16, "Avançar para Aprovação N2", 13, 700, T5, tb_id, frame_id)))

    return frame_id, ops


# ═══════════════════════════════════════════
# PAGE 4: 80-CasePanel-Timeline
# ═══════════════════════════════════════════

def build_case_panel_timeline(page_id):
    frame_id = uid()
    ops = []
    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CasePanel-Timeline", 0, 0, 1440, 900, BG_PAGE)))
    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", False), ("CASO-2026-0042", True)]))
    ops.extend(build_sidebar(frame_id))
    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)
    ops.extend(build_case_header(frame_id, ca_id, "Timeline"))

    ty = 280
    events = [
        ("Caso criado", "30 mar 2026 — 09:15 · Pedro Mendes", "Caso aberto a partir do ciclo Onboarding v2.1", BLUE),
        ("Transição para \"Revisão\"", "30 mar 2026 — 10:02 · Ana Oliveira", "Estágio alterado de Abertura para Revisão", SUCCESS),
        ("Gate \"Documentação\" resolvido", "30 mar 2026 — 14:30 · Ana Oliveira", "Todos os documentos foram verificados e validados", SUCCESS),
        ("Evidência anexada", "31 mar 2026 — 08:45 · Ana Oliveira", "Arquivo: relatorio_tecnico_v3.pdf (2.4 MB)", T6),
        ("Observação do gestor", "31 mar 2026 — 09:10 · Marcos Silva", "Verificar se o item 4.2 do checklist atende à norma ISO 9001.", T6),
    ]
    for ei, (title, meta, desc, dot_color) in enumerate(events):
        is_last = ei == len(events) - 1
        dot_id = uid()
        ops.append((dot_id, ca_id, frame_id,
            make_rect(dot_id, f"TlDot-{ei}", 284, ty, 12, 12, dot_color, ca_id, frame_id, radius=6)))
        if not is_last:
            line_id = uid()
            ops.append((line_id, ca_id, frame_id,
                make_rect(line_id, f"TlLine-{ei}", 289, ty+16, 2, 52, BORDER, ca_id, frame_id)))
        tt = uid()
        ops.append((tt, ca_id, frame_id,
            make_text(tt, f"TlTitle-{ei}", 312, ty-2, 500, 16, title, 13, 600, T1, ca_id, frame_id)))
        mt = uid()
        ops.append((mt, ca_id, frame_id,
            make_text(mt, f"TlMeta-{ei}", 312, ty+16, 400, 14, meta, 11, 400, T4, ca_id, frame_id)))
        dt = uid()
        ops.append((dt, ca_id, frame_id,
            make_text(dt, f"TlDesc-{ei}", 312, ty+32, 600, 14, desc, 12, 400, T3, ca_id, frame_id)))
        ty += 68

    return frame_id, ops


# ═══════════════════════════════════════════
# PAGE 5: 80-CaseList-Drawer
# ═══════════════════════════════════════════

def build_case_list_drawer(page_id):
    frame_id = uid()
    ops = []
    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CaseList-Drawer", 0, 0, 1440, 900, BG_PAGE)))
    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", True)]))
    ops.extend(build_sidebar(frame_id))
    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)

    # Dimmed content
    dim = uid()
    ops.append((dim, ca_id, frame_id,
        make_rect(dim, "DimmedContent", 240, 64, 1200, 836, T1, ca_id, frame_id, opacity=0.3)))

    # Drawer panel
    ov_id = uid()
    ops.append((ov_id, frame_id, frame_id,
        make_rect(ov_id, "DrawerPanel", 960, 0, 480, 900, WHITE, frame_id, frame_id)))

    dh_id = uid()
    ops.append((dh_id, ov_id, frame_id,
        make_rect(dh_id, "DrawerHeader", 960, 0, 480, 64, WHITE, ov_id, frame_id,
                  strokes=stroke_border(BORDER))))
    dht = uid()
    ops.append((dht, dh_id, frame_id,
        make_text(dht, "DrawerTitle", 984, 22, 200, 20, "Novo Caso", 18, 700, T1, dh_id, frame_id)))
    dx = uid()
    ops.append((dx, dh_id, frame_id,
        make_text(dx, "DrawerClose", 1408, 22, 20, 20, "✕", 16, 400, T4, dh_id, frame_id)))

    # Drawer body fields
    fy = 88
    fields = [
        ("CICLO", "select", "Selecione um ciclo publicado...", 42),
        ("DESCRIÇÃO", "textarea", "Descreva o objetivo deste caso...", 100),
        ("PRIORIDADE", "radio", None, 90),
        ("OBSERVAÇÕES INICIAIS", "textarea", "Observações opcionais...", 80),
    ]
    for fi, (label, ftype, placeholder, fh) in enumerate(fields):
        fl = uid()
        ops.append((fl, ov_id, frame_id,
            make_text(fl, f"DwLabel-{fi}", 984, fy, 400, 12, label, 10, 700, T4, ov_id, frame_id,
                      uppercase=True, letter_spacing=0.8)))
        fy += 18
        if ftype in ("select", "textarea"):
            ff = uid()
            ops.append((ff, ov_id, frame_id,
                make_rect(ff, f"DwInput-{fi}", 984, fy, 432, fh, WHITE, ov_id, frame_id, radius=8,
                          strokes=stroke_border(BORDER))))
            if placeholder:
                fp = uid()
                ops.append((fp, ff, frame_id,
                    make_text(fp, f"DwPlaceholder-{fi}", 998, fy+12, 400, 16, placeholder, 14, 400, T6, ff, frame_id)))
        elif ftype == "radio":
            radios = [("Normal", True), ("Alta", False), ("Urgente", False)]
            ry = fy
            for ri, (rlabel, checked) in enumerate(radios):
                rc = uid()
                fill_r = BLUE if checked else WHITE
                ops.append((rc, ov_id, frame_id,
                    make_rect(rc, f"Radio-{ri}", 984, ry, 16, 16, fill_r, ov_id, frame_id, radius=8,
                              strokes=stroke_border(BLUE if checked else BORDER))))
                rl = uid()
                color_r = ERR if rlabel == "Urgente" else T2
                ops.append((rl, ov_id, frame_id,
                    make_text(rl, f"RadioLabel-{ri}", 1008, ry, 200, 16, rlabel, 13, 500, color_r, ov_id, frame_id)))
                ry += 26
            fh = len(radios) * 26
        fy += fh + 16

    df_id = uid()
    ops.append((df_id, ov_id, frame_id,
        make_rect(df_id, "DrawerFooter", 960, 828, 480, 72, WHITE, ov_id, frame_id,
                  strokes=stroke_border(BORDER))))
    bc_id = uid()
    ops.append((bc_id, df_id, frame_id,
        make_rect(bc_id, "BtnDrawerCancel", 1308, 844, 80, 40, WHITE, df_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    bct = uid()
    ops.append((bct, bc_id, frame_id,
        make_text(bct, "BtnDwCancelText", 1320, 856, 56, 16, "Cancelar", 13, 600, T3, bc_id, frame_id)))
    bo_id = uid()
    ops.append((bo_id, df_id, frame_id,
        make_rect(bo_id, "BtnAbrirCaso", 1396, 844, 90, 40, BLUE, df_id, frame_id, radius=8)))
    bot = uid()
    ops.append((bot, bo_id, frame_id,
        make_text(bot, "BtnAbrirText", 1406, 856, 70, 16, "Abrir Caso", 13, 700, WHITE, bo_id, frame_id)))

    return frame_id, ops


# ═══════════════════════════════════════════
# PAGE 6: 80-CasePanel-CancelModal
# ═══════════════════════════════════════════

def build_cancel_modal(page_id):
    frame_id = uid()
    ops = []
    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CasePanel-CancelModal", 0, 0, 1440, 900, BG_PAGE)))
    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", False), ("CASO-2026-0042", True)]))
    ops.extend(build_sidebar(frame_id))
    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)

    ov = uid()
    ops.append((ov, frame_id, frame_id,
        make_rect(ov, "ModalOverlay", 0, 0, 1440, 900, T1, frame_id, frame_id, opacity=0.3)))

    mc_id = uid()
    ops.append((mc_id, frame_id, frame_id,
        make_rect(mc_id, "ModalCard", 510, 300, 420, 220, WHITE, frame_id, frame_id, radius=12)))

    wi = uid()
    ops.append((wi, mc_id, frame_id,
        make_rect(wi, "WarningIcon", 696, 324, 48, 48, WARN_BG, mc_id, frame_id, radius=24)))
    wit = uid()
    ops.append((wit, wi, frame_id,
        make_text(wit, "WarningSymbol", 710, 334, 20, 24, "⚠", 20, 400, WARN, wi, frame_id)))

    mt = uid()
    ops.append((mt, mc_id, frame_id,
        make_text(mt, "ModalTitle", 610, 384, 220, 22, "Cancelar caso?", 18, 700, T1, mc_id, frame_id)))
    mm = uid()
    ops.append((mm, mc_id, frame_id,
        make_text(mm, "ModalMsg", 540, 412, 360, 32,
                  "Deseja cancelar o caso CASO-2026-0042? Esta ação não pode ser desfeita.",
                  13, 400, T3, mc_id, frame_id)))

    btn_back = uid()
    ops.append((btn_back, mc_id, frame_id,
        make_rect(btn_back, "BtnVoltar", 624, 460, 80, 40, WHITE, mc_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    bbt = uid()
    ops.append((bbt, btn_back, frame_id,
        make_text(bbt, "BtnVoltarText", 640, 472, 48, 16, "Voltar", 13, 600, T3, btn_back, frame_id)))
    btn_danger = uid()
    ops.append((btn_danger, mc_id, frame_id,
        make_rect(btn_danger, "BtnCancelarCaso", 716, 460, 120, 40, ERR, mc_id, frame_id, radius=8)))
    bdt = uid()
    ops.append((bdt, btn_danger, frame_id,
        make_text(bdt, "BtnCancelarText", 726, 472, 100, 16, "Cancelar Caso", 13, 700, WHITE, btn_danger, frame_id)))

    return frame_id, ops


# ═══════════════════════════════════════════
# PAGE 7: 80-CasePanel-WaiveModal
# ═══════════════════════════════════════════

def build_waive_modal(page_id):
    frame_id = uid()
    ops = []
    ops.append((frame_id, ROOT, ROOT,
        make_frame(frame_id, "80-CasePanel-WaiveModal", 0, 0, 1440, 900, BG_PAGE)))
    ops.extend(build_topbar(frame_id, [("Processos", False), ("Casos", False), ("CASO-2026-0042", True)]))
    ops.extend(build_sidebar(frame_id))
    ca_id, ca_ops = build_content_area(frame_id)
    ops.extend(ca_ops)

    ov = uid()
    ops.append((ov, frame_id, frame_id,
        make_rect(ov, "ModalOverlay", 0, 0, 1440, 900, T1, frame_id, frame_id, opacity=0.3)))

    mc_id = uid()
    ops.append((mc_id, frame_id, frame_id,
        make_rect(mc_id, "ModalCard", 510, 260, 420, 310, WHITE, frame_id, frame_id, radius=12)))

    si = uid()
    ops.append((si, mc_id, frame_id,
        make_rect(si, "ShieldIcon", 696, 284, 48, 48, WARN_BG, mc_id, frame_id, radius=24)))
    sit = uid()
    ops.append((sit, si, frame_id,
        make_text(sit, "ShieldSymbol", 710, 294, 20, 24, "🛡", 20, 400, WARN, si, frame_id)))

    mt = uid()
    ops.append((mt, mc_id, frame_id,
        make_text(mt, "ModalTitle", 610, 344, 220, 22, "Dispensar gate?", 18, 700, T1, mc_id, frame_id)))
    mm = uid()
    ops.append((mm, mc_id, frame_id,
        make_text(mm, "ModalMsg", 540, 372, 360, 32,
                  "Deseja dispensar o gate Aprovação do Gestor? Informe o motivo abaixo.",
                  13, 400, T3, mc_id, frame_id)))

    ml = uid()
    ops.append((ml, mc_id, frame_id,
        make_text(ml, "MotivoLabel", 534, 416, 200, 12, "MOTIVO DA DISPENSA", 10, 700, T4, mc_id, frame_id,
                  uppercase=True, letter_spacing=0.8)))
    mf = uid()
    ops.append((mf, mc_id, frame_id,
        make_rect(mf, "MotivoTextarea", 534, 434, 372, 80, WHITE, mc_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    mp = uid()
    ops.append((mp, mf, frame_id,
        make_text(mp, "MotivoPlaceholder", 546, 446, 340, 14,
                  "Descreva o motivo da dispensa (mín. 20 caracteres)...",
                  13, 400, T6, mf, frame_id)))
    mc = uid()
    ops.append((mc, mc_id, frame_id,
        make_text(mc, "CharCounter", 846, 518, 60, 12, "0 / 20 mín.", 11, 400, T4, mc_id, frame_id)))

    btn_back = uid()
    ops.append((btn_back, mc_id, frame_id,
        make_rect(btn_back, "BtnVoltar", 624, 536, 80, 40, WHITE, mc_id, frame_id, radius=8,
                  strokes=stroke_border(BORDER))))
    bbt = uid()
    ops.append((bbt, btn_back, frame_id,
        make_text(bbt, "BtnVoltarText", 640, 548, 48, 16, "Voltar", 13, 600, T3, btn_back, frame_id)))
    btn_disp = uid()
    ops.append((btn_disp, mc_id, frame_id,
        make_rect(btn_disp, "BtnDispensarGate", 716, 536, 130, 40, BLUE, mc_id, frame_id, radius=8)))
    bdt = uid()
    ops.append((bdt, btn_disp, frame_id,
        make_text(bdt, "BtnDispText", 726, 548, 110, 16, "Dispensar Gate", 13, 700, WHITE, btn_disp, frame_id)))

    return frame_id, ops


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════

pages = [
    ("80-CaseList", build_case_list),
    ("80-CasePanel-Gates", build_case_panel_gates),
    ("80-CasePanel-Assignments", build_case_panel_assignments),
    ("80-CasePanel-Timeline", build_case_panel_timeline),
    ("80-CaseList-Drawer", build_case_list_drawer),
    ("80-CasePanel-CancelModal", build_cancel_modal),
    ("80-CasePanel-WaiveModal", build_waive_modal),
]

total_objects = 0

for page_name, builder in pages:
    print(f"\n{'='*50}")
    print(f"Creating page: {page_name}")
    print(f"{'='*50}")

    page_id = uid()
    if not send_changes([add_page_change(page_id, page_name)], f"add-page {page_name}"):
        continue

    frame_id, all_ops = builder(page_id)

    changes = []
    for (oid, parent, frame, obj) in all_ops:
        changes.append(add_obj(oid, parent, frame, obj, page_id))

    batch_size = 40
    for i in range(0, len(changes), batch_size):
        batch = changes[i:i+batch_size]
        label = f"{page_name} [{i+1}-{min(i+batch_size, len(changes))}]"
        if not send_changes(batch, label):
            print(f"FAILED batch {label}")
            break

    total_objects += len(all_ops)
    print(f"  Objects: {len(all_ops)}")

print(f"\n{'='*50}")
print(f"DONE — {len(pages)} pages, {total_objects} objects")
print(f"Final revn: {revn}")
