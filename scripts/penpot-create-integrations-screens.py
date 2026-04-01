"""
Create 50-Integrations screens in Penpot Sandbox.
Uses transit+json REST API. Based on 50-integrations-spec.

Pages:
  50-IntegrationEditor  — Editor de Rotinas (UX-INTEG-001)
  50-IntegrationMonitor — Monitor de Integrações (UX-INTEG-002)
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
assert resp.status_code == 200, f"get-file failed: {resp.text[:200]}"
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
              letter_spacing=0, line_height=1.3, text_opacity=1):
    font_variant_id = str(font_weight)
    leaf = ["^ ",
        "~:text", text,
        "~:font-id", "plusjakartasans",
        "~:font-family", "Plus Jakarta Sans",
        "~:font-variant-id", font_variant_id,
        "~:font-size", str(font_size),
        "~:font-weight", str(font_weight),
        "~:font-style", "italic" if italic else "normal",
        "~:line-height", str(line_height),
        "~:letter-spacing", str(letter_spacing),
        "~:fill-color", color,
        "~:fill-opacity", text_opacity,
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
WHITE = "#FFFFFF"
BG = "#F5F5F3"
BORDER = "#E8E8E6"
BORDER_LT = "#F0F0EE"
RO_BG = "#F8F8F6"
T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"
RED = "#E74C3C"
DANGER = "#C0392B"
GREEN = "#27AE60"
GREEN_TXT = "#1E7A42"
GREEN_BG = "#E8F8EF"
GREEN_BD = "#B5E8C9"
AMBER_TXT = "#B8860B"
AMBER_BG = "#FFF3E0"
AMBER_BD = "#FFE0B2"
RED_LT = "#FFEBEE"
RED_BD = "#F5C6CB"
TABLE_HEADER_BG = "#FAFAFA"
BLUE_BD = "#B8D9F2"


# ═══════════════════════════════════════════
# SHARED: AppShell builder (Topbar + Sidebar)
# ═══════════════════════════════════════════

def build_appshell(frame_id, page_id, bc_parent="Integração", bc_active="Protheus"):
    """Returns list of changes for topbar + sidebar."""
    changes = []

    # ── Topbar ──
    tb_id = uid()
    tb = make_rect(tb_id, "Topbar", 0, 0, 1440, 64, WHITE, frame_id, frame_id,
                   strokes=stroke_border(BORDER, 1, "inner"))
    changes.append(add_obj(tb_id, frame_id, frame_id, tb, page_id))

    # Logo
    logo_id = uid()
    logo = make_rect(logo_id, "Logo", 24, 12, 40, 40, BLUE, tb_id, frame_id, radius=10)
    changes.append(add_obj(logo_id, tb_id, frame_id, logo, page_id))
    logo_txt = uid()
    changes.append(add_obj(logo_txt, tb_id, frame_id,
        make_text(logo_txt, "LogoText", 30, 20, 28, 20, "A1", 16, 800, WHITE, tb_id, frame_id),
        page_id))

    # Brand
    brand_n = uid()
    changes.append(add_obj(brand_n, tb_id, frame_id,
        make_text(brand_n, "BrandName", 76, 14, 100, 18, "Grupo A1", 14, 800, T1, tb_id, frame_id),
        page_id))
    brand_s = uid()
    changes.append(add_obj(brand_s, tb_id, frame_id,
        make_text(brand_s, "BrandSub", 76, 34, 120, 14, "PORTAL INTERNO", 10, 600, T4, tb_id, frame_id,
                  uppercase=True, letter_spacing=1.2),
        page_id))

    # Separator
    sep_id = uid()
    sep = make_rect(sep_id, "Separator", 204, 20, 1, 24, BORDER, tb_id, frame_id)
    changes.append(add_obj(sep_id, tb_id, frame_id, sep, page_id))

    # Breadcrumb
    bc1 = uid()
    changes.append(add_obj(bc1, tb_id, frame_id,
        make_text(bc1, "BC-Parent", 218, 23, 90, 18, bc_parent, 13, 400, T4, tb_id, frame_id),
        page_id))
    bc_sep = uid()
    changes.append(add_obj(bc_sep, tb_id, frame_id,
        make_text(bc_sep, "BC-Sep", 312, 23, 12, 18, "›", 13, 400, T6, tb_id, frame_id),
        page_id))
    bc2 = uid()
    changes.append(add_obj(bc2, tb_id, frame_id,
        make_text(bc2, "BC-Active", 328, 23, 160, 18, bc_active, 13, 700, T1, tb_id, frame_id),
        page_id))

    # Right side
    user_name = uid()
    changes.append(add_obj(user_name, tb_id, frame_id,
        make_text(user_name, "UserName", 1290, 18, 100, 16, "Admin ECF", 12, 600, T2, tb_id, frame_id),
        page_id))
    tenant_name = uid()
    changes.append(add_obj(tenant_name, tb_id, frame_id,
        make_text(tenant_name, "TenantName", 1290, 36, 100, 14, "A1 Engenharia", 11, 400, T4, tb_id, frame_id),
        page_id))
    avatar_id = uid()
    av = make_rect(avatar_id, "Avatar", 1396, 16, 32, 32, BLUE, tb_id, frame_id, radius=16)
    changes.append(add_obj(avatar_id, tb_id, frame_id, av, page_id))
    av_txt = uid()
    changes.append(add_obj(av_txt, tb_id, frame_id,
        make_text(av_txt, "AvatarText", 1400, 22, 24, 16, "AE", 11, 700, WHITE, tb_id, frame_id),
        page_id))

    # ── Sidebar ──
    sb_id = uid()
    sb = make_rect(sb_id, "Sidebar", 0, 64, 240, 836, WHITE, frame_id, frame_id,
                   strokes=stroke_border(BORDER, 1, "inner"))
    changes.append(add_obj(sb_id, frame_id, frame_id, sb, page_id))

    # Sidebar categories and items
    y_pos = 88
    sidebar_items = [
        ("APROVAÇÃO", [("Movimentos Controlados", False)]),
        ("INTEGRAÇÃO", [("Protheus", True), ("MCP Agentes", False)]),
    ]

    for cat_label, items in sidebar_items:
        cat_id = uid()
        changes.append(add_obj(cat_id, sb_id, frame_id,
            make_text(cat_id, f"Cat-{cat_label}", 28, y_pos, 200, 14, cat_label, 9, 700, T5, sb_id, frame_id,
                      uppercase=True, letter_spacing=1.4),
            page_id))
        y_pos += 22

        for item_label, is_active in items:
            item_bg_id = uid()
            item_fill = BLUE_LT if is_active else WHITE
            item_bg = make_rect(item_bg_id, f"SB-{item_label}-bg", 16, y_pos, 208, 36, item_fill, sb_id, frame_id, radius=6)
            changes.append(add_obj(item_bg_id, sb_id, frame_id, item_bg, page_id))

            item_txt = uid()
            item_color = BLUE if is_active else T4
            item_weight = 700 if is_active else 500
            changes.append(add_obj(item_txt, sb_id, frame_id,
                make_text(item_txt, f"SB-{item_label}", 44, y_pos + 9, 170, 18, item_label, 13, item_weight, item_color, sb_id, frame_id),
                page_id))
            y_pos += 38

        y_pos += 12

    # Sidebar footer
    footer_y = 864
    dot_id = uid()
    dot = make_rect(dot_id, "StatusDot", 16, footer_y, 8, 8, GREEN, sb_id, frame_id, radius=4)
    changes.append(add_obj(dot_id, sb_id, frame_id, dot, page_id))
    footer_txt = uid()
    changes.append(add_obj(footer_txt, sb_id, frame_id,
        make_text(footer_txt, "StatusText", 32, footer_y - 2, 120, 14, "Servidor Online", 12, 400, T4, sb_id, frame_id),
        page_id))

    return changes, sb_id, tb_id


def build_table_header(columns, x, y, w, parent, frame, page_id):
    """columns: list of (label, col_x, col_w)"""
    changes = []
    hdr_id = uid()
    hdr = make_rect(hdr_id, "TableHeader", x, y, w, 44, TABLE_HEADER_BG, parent, frame,
                    strokes=stroke_border(BORDER_LT, 1, "inner"))
    changes.append(add_obj(hdr_id, parent, frame, hdr, page_id))
    for label, col_x, col_w in columns:
        tid = uid()
        changes.append(add_obj(tid, hdr_id, frame,
            make_text(tid, f"TH-{label}", x + 20 + col_x, y + 16, col_w, 14, label,
                      10, 700, T4, hdr_id, frame, uppercase=True, letter_spacing=0.8),
            page_id))
    return changes, hdr_id


# ═══════════════════════════════════════════
# PAGE 1: 50-IntegrationEditor
# ═══════════════════════════════════════════

print("\n=== PAGE 1: 50-IntegrationEditor ===")
p1_id = uid()
send_changes([add_page_change(p1_id, "50-IntegrationEditor")], "Add page 50-IntegrationEditor")

# Frame
f1_id = uid()
f1 = make_frame(f1_id, "50-IntegrationEditor", 0, 0, 1440, 900, BG)
send_changes([add_obj(f1_id, ROOT, ROOT, f1, p1_id)], "Frame IntegrationEditor")

# AppShell
appshell_changes, sb1_id, tb1_id = build_appshell(f1_id, p1_id, "Integração", "Protheus")
for i in range(0, len(appshell_changes), 40):
    batch = appshell_changes[i:i+40]
    send_changes(batch, f"AppShell P1 batch {i//40+1}")

# ── Content Header (240,64, 1200×64) ──
ch_id = uid()
ch = make_rect(ch_id, "ContentHeader", 240, 64, 1200, 64, WHITE, f1_id, f1_id,
               strokes=stroke_border(BORDER, 1, "inner"))
ch_changes = [add_obj(ch_id, f1_id, f1_id, ch, p1_id)]

# Title
ch_title = uid()
ch_changes.append(add_obj(ch_title, ch_id, f1_id,
    make_text(ch_title, "CH-Title", 264, 72, 400, 22, "CTB-001 — Lançamento Contábil", 18, 700, T1, ch_id, f1_id),
    p1_id))

# Draft badge
badge_id = uid()
badge_bg = make_rect(badge_id, "DraftBadge", 264 + 340, 76, 56, 20, AMBER_BG, ch_id, f1_id, radius=4,
                     strokes=stroke_border(AMBER_BD))
ch_changes.append(add_obj(badge_id, ch_id, f1_id, badge_bg, p1_id))
badge_txt = uid()
ch_changes.append(add_obj(badge_txt, ch_id, f1_id,
    make_text(badge_txt, "DraftText", 264 + 346, 78, 44, 16, "Draft", 11, 600, AMBER_TXT, ch_id, f1_id),
    p1_id))

# Right buttons
# "Testar HML" secondary
btn_test_id = uid()
btn_test = make_rect(btn_test_id, "BtnTestarHML", 1100, 76, 100, 36, WHITE, ch_id, f1_id, radius=8,
                     strokes=stroke_border(BORDER))
ch_changes.append(add_obj(btn_test_id, ch_id, f1_id, btn_test, p1_id))
btn_test_txt = uid()
ch_changes.append(add_obj(btn_test_txt, ch_id, f1_id,
    make_text(btn_test_txt, "BtnTestarText", 1110, 84, 80, 18, "Testar HML", 12, 600, T2, ch_id, f1_id),
    p1_id))

# "Publicar" primary
btn_pub_id = uid()
btn_pub = make_rect(btn_pub_id, "BtnPublicar", 1210, 76, 90, 36, BLUE, ch_id, f1_id, radius=8)
ch_changes.append(add_obj(btn_pub_id, ch_id, f1_id, btn_pub, p1_id))
btn_pub_txt = uid()
ch_changes.append(add_obj(btn_pub_txt, ch_id, f1_id,
    make_text(btn_pub_txt, "BtnPublicarText", 1224, 84, 66, 18, "Publicar", 12, 700, WHITE, ch_id, f1_id),
    p1_id))

# "Nova Versão" outline
btn_nv_id = uid()
btn_nv = make_rect(btn_nv_id, "BtnNovaVersao", 1310, 76, 110, 36, WHITE, ch_id, f1_id, radius=8,
                   strokes=stroke_border(BLUE))
ch_changes.append(add_obj(btn_nv_id, ch_id, f1_id, btn_nv, p1_id))
btn_nv_txt = uid()
ch_changes.append(add_obj(btn_nv_txt, ch_id, f1_id,
    make_text(btn_nv_txt, "BtnNVText", 1320, 84, 90, 18, "Nova Versão", 12, 600, BLUE, ch_id, f1_id),
    p1_id))

send_changes(ch_changes, "Content header")

# ── Routine List (240,128, 280×772) ──
rl_id = uid()
rl = make_rect(rl_id, "RoutineList", 240, 128, 280, 772, WHITE, f1_id, f1_id,
               strokes=stroke_border(BORDER, 1, "inner"))
rl_changes = [add_obj(rl_id, f1_id, f1_id, rl, p1_id)]

# ListHeader
lh_id = uid()
lh = make_rect(lh_id, "ListHeader", 240, 128, 280, 48, WHITE, rl_id, f1_id,
               strokes=stroke_border(BORDER_LT, 1, "inner"))
rl_changes.append(add_obj(lh_id, rl_id, f1_id, lh, p1_id))
lh_txt = uid()
rl_changes.append(add_obj(lh_txt, lh_id, f1_id,
    make_text(lh_txt, "ListTitle", 260, 140, 120, 18, "Rotinas", 14, 700, T1, lh_id, f1_id),
    p1_id))
# "+" button
plus_id = uid()
plus_bg = make_rect(plus_id, "BtnPlus", 488, 136, 28, 28, BLUE, lh_id, f1_id, radius=6)
rl_changes.append(add_obj(plus_id, lh_id, f1_id, plus_bg, p1_id))
plus_txt = uid()
rl_changes.append(add_obj(plus_txt, lh_id, f1_id,
    make_text(plus_txt, "PlusText", 494, 138, 16, 20, "+", 16, 700, WHITE, lh_id, f1_id),
    p1_id))

# Search
search_id = uid()
search_bg = make_rect(search_id, "SearchInput", 252, 184, 256, 36, WHITE, rl_id, f1_id, radius=6,
                      strokes=stroke_border(BORDER))
rl_changes.append(add_obj(search_id, rl_id, f1_id, search_bg, p1_id))
search_txt = uid()
rl_changes.append(add_obj(search_txt, rl_id, f1_id,
    make_text(search_txt, "SearchPlaceholder", 264, 192, 220, 18, "Buscar rotina...", 13, 400, T6, rl_id, f1_id),
    p1_id))

send_changes(rl_changes, "Routine list header + search")

# Routine items
routines = [
    {"code": "CTB-001", "status": "DRAFT", "status_type": "amber", "sub": "Protheus HML → /WSRESTPV001", "active": True},
    {"code": "FIN-002", "status": "PUBLISHED", "status_type": "green", "sub": "Protheus PROD → /WSRESTPV002", "active": False},
    {"code": "EST-001", "status": "DRAFT", "status_type": "amber", "sub": "Protheus HML → /WSRESTPV003", "active": False},
]

item_y = 228
for rt in routines:
    items_changes = []
    item_id = uid()
    item_fill = BLUE_LT if rt["active"] else WHITE
    item_bg = make_rect(item_id, f"RoutineItem-{rt['code']}", 248, item_y, 264, 72, item_fill, rl_id, f1_id, radius=8,
                        strokes=stroke_border(BLUE_BD if rt["active"] else BORDER_LT))
    items_changes.append(add_obj(item_id, rl_id, f1_id, item_bg, p1_id))

    # Code
    code_id = uid()
    items_changes.append(add_obj(code_id, item_id, f1_id,
        make_text(code_id, "Code", 260, item_y + 10, 100, 18, rt["code"], 13, 700, T1 if rt["active"] else T2, item_id, f1_id),
        p1_id))

    # Status badge
    st_bg_color = AMBER_BG if rt["status_type"] == "amber" else GREEN_BG
    st_bd_color = AMBER_BD if rt["status_type"] == "amber" else GREEN_BD
    st_txt_color = AMBER_TXT if rt["status_type"] == "amber" else GREEN_TXT
    st_id = uid()
    st_rect = make_rect(st_id, "StatusBadge", 380, item_y + 10, 72, 18, st_bg_color, item_id, f1_id, radius=4,
                        strokes=stroke_border(st_bd_color))
    items_changes.append(add_obj(st_id, item_id, f1_id, st_rect, p1_id))
    st_txt_id = uid()
    items_changes.append(add_obj(st_txt_id, item_id, f1_id,
        make_text(st_txt_id, "StatusText", 386, item_y + 12, 60, 14, rt["status"], 9, 700, st_txt_color, item_id, f1_id, uppercase=True),
        p1_id))

    # Sub
    sub_id = uid()
    items_changes.append(add_obj(sub_id, item_id, f1_id,
        make_text(sub_id, "Sub", 260, item_y + 36, 240, 16, rt["sub"], 11, 400, T4, item_id, f1_id),
        p1_id))

    send_changes(items_changes, f"Routine {rt['code']}")
    item_y += 80

# ── Editor Pane (520,128, 920×772) ──
ep_id = uid()
ep = make_rect(ep_id, "EditorPane", 520, 128, 920, 772, BG, f1_id, f1_id)
ep_changes = [add_obj(ep_id, f1_id, f1_id, ep, p1_id)]

# Tab bar
tab_id = uid()
tab_bar = make_rect(tab_id, "TabBar", 520, 128, 920, 44, WHITE, ep_id, f1_id,
                    strokes=stroke_border(BORDER, 1, "inner"))
ep_changes.append(add_obj(tab_id, ep_id, f1_id, tab_bar, p1_id))

# Tab 1 active
tab1_txt = uid()
ep_changes.append(add_obj(tab1_txt, tab_id, f1_id,
    make_text(tab1_txt, "Tab1", 540, 140, 140, 18, "Configuração HTTP", 13, 700, BLUE, tab_id, f1_id),
    p1_id))
# Active underline
tab1_line = uid()
tab1_line_r = make_rect(tab1_line, "Tab1Line", 540, 168, 140, 3, BLUE, tab_id, f1_id)
ep_changes.append(add_obj(tab1_line, tab_id, f1_id, tab1_line_r, p1_id))

# Tab 2
tab2_txt = uid()
ep_changes.append(add_obj(tab2_txt, tab_id, f1_id,
    make_text(tab2_txt, "Tab2", 700, 140, 110, 18, "Mapeamentos", 13, 500, T4, tab_id, f1_id),
    p1_id))

# Tab 3
tab3_txt = uid()
ep_changes.append(add_obj(tab3_txt, tab_id, f1_id,
    make_text(tab3_txt, "Tab3", 830, 140, 90, 18, "Parâmetros", 13, 500, T4, tab_id, f1_id),
    p1_id))

send_changes(ep_changes, "Editor pane + tabs")

# ── Tab content: Configuração HTTP ──
tc_changes = []
form_x = 540
form_y = 192

# Row 1: SERVIÇO DE DESTINO + MÉTODO HTTP
lbl1 = uid()
tc_changes.append(add_obj(lbl1, ep_id, f1_id,
    make_text(lbl1, "LblServico", form_x, form_y, 200, 14, "SERVIÇO DE DESTINO", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))
inp1_id = uid()
inp1 = make_rect(inp1_id, "InputServico", form_x, form_y + 18, 560, 40, WHITE, ep_id, f1_id, radius=8,
                 strokes=stroke_border(BORDER))
tc_changes.append(add_obj(inp1_id, ep_id, f1_id, inp1, p1_id))
inp1_txt = uid()
tc_changes.append(add_obj(inp1_txt, inp1_id, f1_id,
    make_text(inp1_txt, "InputServicoText", form_x + 12, form_y + 28, 200, 18, "Protheus HML — REST", 13, 500, T1, inp1_id, f1_id),
    p1_id))

lbl1b = uid()
tc_changes.append(add_obj(lbl1b, ep_id, f1_id,
    make_text(lbl1b, "LblMetodo", form_x + 580, form_y, 160, 14, "MÉTODO HTTP", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))
inp1b_id = uid()
inp1b = make_rect(inp1b_id, "InputMetodo", form_x + 580, form_y + 18, 160, 40, WHITE, ep_id, f1_id, radius=8,
                  strokes=stroke_border(BORDER))
tc_changes.append(add_obj(inp1b_id, ep_id, f1_id, inp1b, p1_id))
inp1b_txt = uid()
tc_changes.append(add_obj(inp1b_txt, inp1b_id, f1_id,
    make_text(inp1b_txt, "InputMetodoText", form_x + 592, form_y + 28, 80, 18, "POST", 13, 500, T1, inp1b_id, f1_id),
    p1_id))

send_changes(tc_changes, "Form row 1")

# Row 2: ENDPOINT TEMPLATE
tc2 = []
r2_y = form_y + 76
lbl2 = uid()
tc2.append(add_obj(lbl2, ep_id, f1_id,
    make_text(lbl2, "LblEndpoint", form_x, r2_y, 200, 14, "ENDPOINT TEMPLATE", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))
inp2_id = uid()
inp2 = make_rect(inp2_id, "InputEndpoint", form_x, r2_y + 18, 740, 40, WHITE, ep_id, f1_id, radius=8,
                 strokes=stroke_border(BORDER))
tc2.append(add_obj(inp2_id, ep_id, f1_id, inp2, p1_id))
inp2_txt = uid()
tc2.append(add_obj(inp2_txt, inp2_id, f1_id,
    make_text(inp2_txt, "InputEndpointText", form_x + 12, r2_y + 28, 400, 18, "/WSRESTPV001/lancamento", 13, 500, T1, inp2_id, f1_id),
    p1_id))
hint_id = uid()
tc2.append(add_obj(hint_id, ep_id, f1_id,
    make_text(hint_id, "EndpointHint", form_x, r2_y + 62, 500, 14, "Preview: /WSRESTPV001/[resolvido em runtime]", 11, 400, T4, ep_id, f1_id,
              italic=True),
    p1_id))

send_changes(tc2, "Form row 2 - endpoint")

# Row 3: TIMEOUT + RETRY MAX + RETRY BACKOFF
tc3 = []
r3_y = r2_y + 90

lbl3a = uid()
tc3.append(add_obj(lbl3a, ep_id, f1_id,
    make_text(lbl3a, "LblTimeout", form_x, r3_y, 200, 14, "TIMEOUT (MS)", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))
inp3a_id = uid()
inp3a = make_rect(inp3a_id, "InputTimeout", form_x, r3_y + 18, 200, 40, WHITE, ep_id, f1_id, radius=8,
                  strokes=stroke_border(BORDER))
tc3.append(add_obj(inp3a_id, ep_id, f1_id, inp3a, p1_id))
inp3a_txt = uid()
tc3.append(add_obj(inp3a_txt, inp3a_id, f1_id,
    make_text(inp3a_txt, "TimeoutText", form_x + 12, r3_y + 28, 80, 18, "30000", 13, 500, T1, inp3a_id, f1_id),
    p1_id))

lbl3b = uid()
tc3.append(add_obj(lbl3b, ep_id, f1_id,
    make_text(lbl3b, "LblRetryMax", form_x + 220, r3_y, 160, 14, "RETRY MAX", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))
inp3b_id = uid()
inp3b = make_rect(inp3b_id, "InputRetryMax", form_x + 220, r3_y + 18, 160, 40, WHITE, ep_id, f1_id, radius=8,
                  strokes=stroke_border(BORDER))
tc3.append(add_obj(inp3b_id, ep_id, f1_id, inp3b, p1_id))
inp3b_txt = uid()
tc3.append(add_obj(inp3b_txt, inp3b_id, f1_id,
    make_text(inp3b_txt, "RetryMaxText", form_x + 232, r3_y + 28, 80, 18, "3", 13, 500, T1, inp3b_id, f1_id),
    p1_id))

lbl3c = uid()
tc3.append(add_obj(lbl3c, ep_id, f1_id,
    make_text(lbl3c, "LblRetryBackoff", form_x + 400, r3_y, 200, 14, "RETRY BACKOFF (MS)", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))
inp3c_id = uid()
inp3c = make_rect(inp3c_id, "InputRetryBackoff", form_x + 400, r3_y + 18, 200, 40, WHITE, ep_id, f1_id, radius=8,
                  strokes=stroke_border(BORDER))
tc3.append(add_obj(inp3c_id, ep_id, f1_id, inp3c, p1_id))
inp3c_txt = uid()
tc3.append(add_obj(inp3c_txt, inp3c_id, f1_id,
    make_text(inp3c_txt, "BackoffText", form_x + 412, r3_y + 28, 80, 18, "1000", 13, 500, T1, inp3c_id, f1_id),
    p1_id))

send_changes(tc3, "Form row 3 - timeout/retry")

# Row 4: DISPARAR QUANDO + tags
tc4 = []
r4_y = r3_y + 76

lbl4 = uid()
tc4.append(add_obj(lbl4, ep_id, f1_id,
    make_text(lbl4, "LblDisparar", form_x, r4_y, 200, 14, "DISPARAR QUANDO", 10, 700, T4, ep_id, f1_id,
              uppercase=True, letter_spacing=0.8),
    p1_id))

# Multi-select area with tags
ms_id = uid()
ms = make_rect(ms_id, "MultiSelect", form_x, r4_y + 18, 740, 44, WHITE, ep_id, f1_id, radius=8,
               strokes=stroke_border(BORDER))
tc4.append(add_obj(ms_id, ep_id, f1_id, ms, p1_id))

tags = ["Criar Registro", "Atualizar Registro", "Excluir Registro"]
tag_x = form_x + 8
for tag_label in tags:
    tag_bg_id = uid()
    tag_w = len(tag_label) * 7 + 20
    tag_bg = make_rect(tag_bg_id, f"Tag-{tag_label}", tag_x, r4_y + 28, tag_w, 24, BLUE_LT, ms_id, f1_id, radius=4,
                       strokes=stroke_border(BLUE_BD))
    tc4.append(add_obj(tag_bg_id, ms_id, f1_id, tag_bg, p1_id))
    tag_txt_id = uid()
    tc4.append(add_obj(tag_txt_id, ms_id, f1_id,
        make_text(tag_txt_id, f"TagText-{tag_label}", tag_x + 8, r4_y + 31, tag_w - 16, 16, tag_label, 11, 600, BLUE, ms_id, f1_id),
        p1_id))
    tag_x += tag_w + 8

send_changes(tc4, "Form row 4 - disparar quando")

# Save button
tc5 = []
r5_y = r4_y + 82
btn_save_id = uid()
btn_save = make_rect(btn_save_id, "BtnSalvar", form_x, r5_y, 180, 40, BLUE, ep_id, f1_id, radius=8)
tc5.append(add_obj(btn_save_id, ep_id, f1_id, btn_save, p1_id))
btn_save_txt = uid()
tc5.append(add_obj(btn_save_txt, btn_save_id, f1_id,
    make_text(btn_save_txt, "BtnSalvarText", form_x + 16, r5_y + 10, 150, 18, "Salvar configuração", 13, 700, WHITE, btn_save_id, f1_id),
    p1_id))

send_changes(tc5, "Save button")

print("PAGE 1 DONE\n")


# ═══════════════════════════════════════════
# PAGE 2: 50-IntegrationMonitor
# ═══════════════════════════════════════════

print("\n=== PAGE 2: 50-IntegrationMonitor ===")
p2_id = uid()
send_changes([add_page_change(p2_id, "50-IntegrationMonitor")], "Add page 50-IntegrationMonitor")

# Frame
f2_id = uid()
f2 = make_frame(f2_id, "50-IntegrationMonitor", 0, 0, 1440, 900, BG)
send_changes([add_obj(f2_id, ROOT, ROOT, f2, p2_id)], "Frame IntegrationMonitor")

# AppShell
as2, _, _ = build_appshell(f2_id, p2_id, "Integração", "Monitor")
for i in range(0, len(as2), 40):
    send_changes(as2[i:i+40], f"AppShell P2 batch {i//40+1}")

# ── Content area ──
ct_id = uid()
ct = make_rect(ct_id, "ContentArea", 240, 64, 1200, 836, BG, f2_id, f2_id)
ct_changes = [add_obj(ct_id, f2_id, f2_id, ct, p2_id)]

# Page header
ph_title = uid()
ct_changes.append(add_obj(ph_title, ct_id, f2_id,
    make_text(ph_title, "PageTitle", 264, 88, 400, 30, "Monitor de Integrações", 24, 800, T1, ct_id, f2_id),
    p2_id))
ph_desc = uid()
ct_changes.append(add_obj(ph_desc, ct_id, f2_id,
    make_text(ph_desc, "PageDesc", 264, 122, 500, 18, "Acompanhe chamadas e reprocesse itens em DLQ", 13, 400, T4, ct_id, f2_id),
    p2_id))

# Atualizando badge
upd_id = uid()
ct_changes.append(add_obj(upd_id, ct_id, f2_id,
    make_text(upd_id, "UpdatingBadge", 1320, 96, 110, 16, "Atualizando...", 12, 500, BLUE, ct_id, f2_id),
    p2_id))

send_changes(ct_changes, "Content header")

# ── 4 Metric Cards ──
card_w = 270
card_gap = 16
card_y = 152
card_x_start = 264

metrics = [
    {"title": "Taxa de Sucesso", "value": "98.5%", "color": GREEN_TXT, "bg": GREEN_BG, "extra": "progress_bar"},
    {"title": "Total (24h)", "value": "1.247", "color": T1, "bg": WHITE, "extra": None},
    {"title": "Em DLQ", "value": "3", "color": RED, "bg": RED_LT, "extra": "requer atenção"},
    {"title": "Latência Média", "value": "340ms", "color": T1, "bg": WHITE, "extra": None},
]

mc_changes = []
for idx, m in enumerate(metrics):
    cx = card_x_start + idx * (card_w + card_gap)
    card_id = uid()
    card_bg = make_rect(card_id, f"MetricCard-{m['title']}", cx, card_y, card_w, 100, m["bg"], ct_id, f2_id, radius=12,
                        strokes=stroke_border(BORDER))
    mc_changes.append(add_obj(card_id, ct_id, f2_id, card_bg, p2_id))

    # Title
    mt_id = uid()
    mc_changes.append(add_obj(mt_id, card_id, f2_id,
        make_text(mt_id, "MetricTitle", cx + 20, card_y + 16, 200, 16, m["title"], 12, 500, T4, card_id, f2_id),
        p2_id))

    # Value
    mv_id = uid()
    mc_changes.append(add_obj(mv_id, card_id, f2_id,
        make_text(mv_id, "MetricValue", cx + 20, card_y + 40, 200, 32, m["value"], 28, 800, m["color"], card_id, f2_id),
        p2_id))

    # Extra
    if m["extra"] == "progress_bar":
        pb_bg_id = uid()
        pb_bg = make_rect(pb_bg_id, "ProgressBG", cx + 20, card_y + 78, 230, 6, "#E0E0E0", card_id, f2_id, radius=3)
        mc_changes.append(add_obj(pb_bg_id, card_id, f2_id, pb_bg, p2_id))
        pb_fill_id = uid()
        pb_fill = make_rect(pb_fill_id, "ProgressFill", cx + 20, card_y + 78, 227, 6, GREEN, card_id, f2_id, radius=3)
        mc_changes.append(add_obj(pb_fill_id, card_id, f2_id, pb_fill, p2_id))
    elif m["extra"] == "requer atenção":
        ex_id = uid()
        mc_changes.append(add_obj(ex_id, card_id, f2_id,
            make_text(ex_id, "ExtraText", cx + 20, card_y + 76, 150, 14, "requer atenção", 11, 400, RED, card_id, f2_id),
            p2_id))

send_changes(mc_changes, "Metric cards")

# ── Filters row ──
filter_y = card_y + 120
fl_changes = []

filters = [
    ("Todas as rotinas", 264, 160),
    ("Status", 264 + 176, 100),
    ("Serviço", 264 + 292, 100),
]
for f_label, f_x, f_w in filters:
    f_id = uid()
    f_rect = make_rect(f_id, f"Filter-{f_label}", f_x, filter_y, f_w, 36, WHITE, ct_id, f2_id, radius=6,
                       strokes=stroke_border(BORDER))
    fl_changes.append(add_obj(f_id, ct_id, f2_id, f_rect, p2_id))
    f_txt = uid()
    fl_changes.append(add_obj(f_txt, f_id, f2_id,
        make_text(f_txt, f"FilterText-{f_label}", f_x + 12, filter_y + 9, f_w - 24, 18, f_label, 12, 500, T2, f_id, f2_id),
        p2_id))

# Correlation ID input
ci_id = uid()
ci = make_rect(ci_id, "InputCorrelation", 264 + 408, filter_y, 180, 36, WHITE, ct_id, f2_id, radius=6,
               strokes=stroke_border(BORDER))
fl_changes.append(add_obj(ci_id, ct_id, f2_id, ci, p2_id))
ci_txt = uid()
fl_changes.append(add_obj(ci_txt, ci_id, f2_id,
    make_text(ci_txt, "CorrelationPlaceholder", 264 + 420, filter_y + 9, 150, 18, "Correlation ID", 12, 400, T6, ci_id, f2_id),
    p2_id))

# Limpar link
limpar_id = uid()
fl_changes.append(add_obj(limpar_id, ct_id, f2_id,
    make_text(limpar_id, "LimparLink", 264 + 608, filter_y + 9, 60, 18, "Limpar", 12, 600, BLUE, ct_id, f2_id),
    p2_id))

send_changes(fl_changes, "Filters row")

# ── Log Table ──
tbl_y = filter_y + 52
tbl_x = 264
tbl_w = 1152

tbl_id = uid()
tbl = make_rect(tbl_id, "LogTable", tbl_x, tbl_y, tbl_w, 320, WHITE, ct_id, f2_id, radius=12,
                strokes=stroke_border(BORDER))
tbl_changes = [add_obj(tbl_id, ct_id, f2_id, tbl, p2_id)]

# Table header
log_cols = [
    ("STATUS", 0, 80), ("ROTINA", 100, 100), ("TIMESTAMP", 220, 80),
    ("DURAÇÃO", 320, 70), ("RETRY", 410, 60), ("HTTP", 490, 50), ("AÇÕES", 560, 50)
]
hdr_changes, hdr_id = build_table_header(log_cols, tbl_x, tbl_y, tbl_w, tbl_id, f2_id, p2_id)
tbl_changes.extend(hdr_changes)

send_changes(tbl_changes, "Log table + header")

# Table rows
log_rows = [
    {"status": "SUCCESS", "st_bg": GREEN_BG, "st_bd": GREEN_BD, "st_txt": GREEN_TXT,
     "routine": "CTB-001 v3", "timestamp": "há 5min", "duration": "340ms",
     "retry": "1 de 3", "http": "200", "http_color": GREEN_TXT},
    {"status": "FAILED", "st_bg": RED_LT, "st_bd": RED_BD, "st_txt": RED,
     "routine": "EST-001 v2", "timestamp": "há 15min", "duration": "5200ms",
     "retry": "3 de 3", "http": "500", "http_color": RED},
    {"status": "DLQ", "st_bg": RED, "st_bd": DANGER, "st_txt": WHITE,
     "routine": "FIN-002 v1", "timestamp": "há 2h", "duration": "15230ms",
     "retry": "3 de 3", "http": "503", "http_color": RED},
    {"status": "RUNNING", "st_bg": BLUE_LT, "st_bd": BLUE_BD, "st_txt": BLUE,
     "routine": "CTB-002 v1", "timestamp": "há 1min", "duration": "—",
     "retry": "1 de 3", "http": "—", "http_color": T4},
]

row_y = tbl_y + 44
for r in log_rows:
    rc = []
    row_id = uid()
    row_bg = make_rect(row_id, f"Row-{r['routine']}", tbl_x, row_y, tbl_w, 52, WHITE, tbl_id, f2_id,
                       strokes=stroke_border(BORDER_LT, 1, "inner"))
    rc.append(add_obj(row_id, tbl_id, f2_id, row_bg, p2_id))

    rx = tbl_x + 20

    # Status badge
    st_id = uid()
    st_w = max(len(r["status"]) * 8 + 16, 60)
    st_rect = make_rect(st_id, "StatusBadge", rx, row_y + 16, st_w, 20, r["st_bg"], row_id, f2_id, radius=4,
                        strokes=stroke_border(r["st_bd"]))
    rc.append(add_obj(st_id, row_id, f2_id, st_rect, p2_id))
    st_txt = uid()
    rc.append(add_obj(st_txt, row_id, f2_id,
        make_text(st_txt, "StatusText", rx + 6, row_y + 18, st_w - 12, 16, r["status"], 10, 700, r["st_txt"], row_id, f2_id, uppercase=True),
        p2_id))

    # Routine
    rt_id = uid()
    rc.append(add_obj(rt_id, row_id, f2_id,
        make_text(rt_id, "Routine", rx + 100, row_y + 17, 100, 18, r["routine"], 13, 500, T1, row_id, f2_id),
        p2_id))

    # Timestamp
    ts_id = uid()
    rc.append(add_obj(ts_id, row_id, f2_id,
        make_text(ts_id, "Timestamp", rx + 220, row_y + 17, 80, 18, r["timestamp"], 12, 400, T4, row_id, f2_id),
        p2_id))

    # Duration
    dur_id = uid()
    rc.append(add_obj(dur_id, row_id, f2_id,
        make_text(dur_id, "Duration", rx + 320, row_y + 17, 70, 18, r["duration"], 12, 400, T3, row_id, f2_id),
        p2_id))

    # Retry
    ret_id = uid()
    rc.append(add_obj(ret_id, row_id, f2_id,
        make_text(ret_id, "Retry", rx + 410, row_y + 17, 60, 18, r["retry"], 12, 400, T4, row_id, f2_id),
        p2_id))

    # HTTP
    http_id = uid()
    rc.append(add_obj(http_id, row_id, f2_id,
        make_text(http_id, "HTTP", rx + 490, row_y + 17, 50, 18, r["http"], 12, 700, r["http_color"], row_id, f2_id),
        p2_id))

    send_changes(rc, f"Row {r['routine']}")
    row_y += 52

# Table footer
ft_changes = []
ft_id = uid()
ft = make_rect(ft_id, "TableFooter", tbl_x, row_y, tbl_w, 48, WHITE, tbl_id, f2_id,
               strokes=stroke_border(BORDER_LT, 1, "inner"),
               r1=0, r2=0, r3=12, r4=12)
ft_changes.append(add_obj(ft_id, tbl_id, f2_id, ft, p2_id))
ft_txt1 = uid()
ft_changes.append(add_obj(ft_txt1, ft_id, f2_id,
    make_text(ft_txt1, "FooterCount", tbl_x + 20, row_y + 16, 300, 16, "Exibindo 25 de 1.247 chamadas", 12, 400, T4, ft_id, f2_id),
    p2_id))
ft_txt2 = uid()
ft_changes.append(add_obj(ft_txt2, ft_id, f2_id,
    make_text(ft_txt2, "LoadMore", tbl_x + 900, row_y + 16, 120, 16, "Carregar mais", 12, 600, BLUE, ft_id, f2_id),
    p2_id))

send_changes(ft_changes, "Table footer")

print("PAGE 2 DONE\n")

print("\n=== ALL PAGES CREATED SUCCESSFULLY ===")
