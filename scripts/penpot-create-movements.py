"""
Create 30-Movements screens in Penpot Sandbox (8 views/pages).
Uses transit+json REST API. Based on 30-movements-spec.md.

Pages:
  30-MovimentosLista         — View ① Main list with tabs + DataTable
  30-MovimentoDetalhe        — View ② Detail with ApprovalChain + Timeline
  30-CadastroMovimento       — View ③ New movement form + Rules preview
  30-RegrasLista             — View ④ Approval rules list
  30-BuscaAvancadaRegras     — View ⑤ Advanced search with filters
  30-NovaRegra               — View ⑥ Rule creation with chain builder
  30-EditarRegra             — View ⑦ Rule edit with stats
  30-Historico               — View ⑧ Audit history with expandable rows
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
              letter_spacing=0, line_height=1.3, text_opacity=1,
              font_variant_id=None):
    if font_variant_id is None:
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
    obj = ["^ ",
        "~:id", f"~u{tid}", "~:type", "~:text", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{parent}", "~:frame-id", f"~u{frame}",
        "~:fills", [],
        "~:strokes", [],
        "~:content", content,
    ]
    return obj

def stroke_border(color="#E8E8E6", width=1, alignment="inner", opacity=1):
    return [["^ ",
        "~:stroke-style", "~:solid",
        "~:stroke-alignment", f"~:{alignment}",
        "~:stroke-width", width,
        "~:stroke-color", color,
        "~:stroke-opacity", opacity,
    ]]

def stroke_dashed(color="#CCCCCC", width=1, alignment="inner"):
    return [["^ ",
        "~:stroke-style", "~:dashed",
        "~:stroke-alignment", f"~:{alignment}",
        "~:stroke-width", width,
        "~:stroke-color", color,
        "~:stroke-opacity", 1,
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
# COLORS (from spec — spec takes priority)
# ═══════════════════════════════════════════

BLUE = "#2E86C1"
BLUE_LT = "#E3F2FD"
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"

T1 = "#111111"       # text-primary
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"       # text-auxiliary
T5 = "#AAAAAA"
T6 = "#CCCCCC"       # text-placeholder

SUCCESS = "#16a34a"
SUCCESS_BG = "#f0fdf4"
ERROR = "#dc2626"
ERROR_BG = "#fef2f2"
WARNING = "#ca8a04"
WARNING_BG = "#fefce8"

# StatusBadge colors
BADGE_PENDING_BG = "#fef3c7"
BADGE_PENDING_TXT = "#b45309"
BADGE_APPROVED_BG = "#d1fae5"
BADGE_APPROVED_TXT = "#047857"
BADGE_REJECTED_BG = "#fee2e2"
BADGE_REJECTED_TXT = "#b91c1c"
BADGE_OVERRIDE_BG = "#f3e8ff"
BADGE_OVERRIDE_TXT = "#7e22ce"
BADGE_AUTO_BG = "#dbeafe"
BADGE_AUTO_TXT = "#1d4ed8"

# Sidebar items for Approval context
SIDEBAR_APPROVAL = [
    ("Movimentos Controlados", True),
    ("Regras de Aprovação", False),
    ("Histórico", False),
]
SIDEBAR_INTEGRATION = [
    ("Protheus Sync", False),
    ("Logs", False),
]


# ═══════════════════════════════════════════
# SHARED BUILDERS
# ═══════════════════════════════════════════

def build_topbar(changes, frame_id, page_id, breadcrumb_items):
    """Topbar 52px with breadcrumb."""
    fid = frame_id
    pid = page_id

    # Background
    tb_bg = uid()
    changes.append(add_obj(tb_bg, fid, fid,
        make_rect(tb_bg, "TopbarBG", 0, 0, 1440, 52, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Logo A1
    logo = uid()
    changes.append(add_obj(logo, fid, fid,
        make_rect(logo, "LogoIcon", 16, 10, 32, 32, BLUE, fid, fid, radius=6), pid))
    a1 = uid()
    changes.append(add_obj(a1, fid, fid,
        make_text(a1, "LogoA1", 20, 14, 24, 20, "A1", 14, 800, WHITE, fid, fid, italic=True), pid))

    # Breadcrumb
    bx = 64
    for i, item in enumerate(breadcrumb_items):
        is_last = (i == len(breadcrumb_items) - 1)
        bc = uid()
        weight = 600 if is_last else 400
        color = T1 if is_last else T4
        changes.append(add_obj(bc, fid, fid,
            make_text(bc, f"BC-{i}", bx, 20, 120, 14, item, 11, weight, color, fid, fid), pid))
        bx += len(item) * 6.5 + 8
        if not is_last:
            sep = uid()
            changes.append(add_obj(sep, fid, fid,
                make_text(sep, f"BC-Sep-{i}", bx, 20, 8, 14, "/", 11, 400, BORDER, fid, fid), pid))
            bx += 14

    # Avatar
    av_bg = uid()
    changes.append(add_obj(av_bg, fid, fid,
        make_rect(av_bg, "AvatarBG", 1388, 8, 36, 36, BLUE, fid, fid, radius=18), pid))
    av_txt = uid()
    changes.append(add_obj(av_txt, fid, fid,
        make_text(av_txt, "AvatarText", 1395, 16, 22, 14, "AE", 12, 700, WHITE, fid, fid), pid))


def build_sidebar(changes, frame_id, page_id, active_item="Movimentos Controlados"):
    """Sidebar 240px with Approval context."""
    fid = frame_id
    pid = page_id

    sb_bg = uid()
    changes.append(add_obj(sb_bg, fid, fid,
        make_rect(sb_bg, "SidebarBG", 0, 52, 240, 848, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    y = 76

    # APROVAÇÃO section
    cat1 = uid()
    changes.append(add_obj(cat1, fid, fid,
        make_text(cat1, "Cat-Aprovacao", 24, y, 200, 10, "APROVAÇÃO", 9, 700, T6, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 22

    for label, _ in SIDEBAR_APPROVAL:
        is_active = (label == active_item)
        mid = uid()
        if is_active:
            bg_id = uid()
            changes.append(add_obj(bg_id, fid, fid,
                make_rect(bg_id, f"MenuBG-{label}", 12, y, 216, 36, BLUE_LT, fid, fid, radius=6), pid))
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 24, y + 9, 18, 18, BLUE, fid, fid, opacity=0.4, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 50, y + 8, 160, 20, label, 13, 700, BLUE, fid, fid), pid))
        else:
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 24, y + 9, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 50, y + 8, 160, 20, label, 13, 500, T4, fid, fid), pid))
        y += 40

    # INTEGRAÇÃO section
    y += 16
    cat2 = uid()
    changes.append(add_obj(cat2, fid, fid,
        make_text(cat2, "Cat-Integracao", 24, y, 200, 10, "INTEGRAÇÃO", 9, 700, T6, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 22

    for label, _ in SIDEBAR_INTEGRATION:
        mid = uid()
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 24, y + 9, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 50, y + 8, 160, 20, label, 13, 500, T4, fid, fid), pid))
        y += 40

    # Footer
    foot_border = uid()
    changes.append(add_obj(foot_border, fid, fid,
        make_rect(foot_border, "SidebarFootBorder", 0, 870, 240, 1, BORDER, fid, fid), pid))
    dot = uid()
    changes.append(add_obj(dot, fid, fid,
        make_rect(dot, "GreenDot", 24, 886, 8, 8, SUCCESS, fid, fid, radius=4), pid))
    ftxt = uid()
    changes.append(add_obj(ftxt, fid, fid,
        make_text(ftxt, "ServerOnline", 40, 882, 120, 16, "Servidor Online", 12, 400, T4, fid, fid), pid))


def build_status_badge(changes, fid, pid, x, y, label, variant):
    """StatusBadge. Returns badge width."""
    colors = {
        "warning":  (BADGE_PENDING_BG, BADGE_PENDING_TXT),
        "success":  (BADGE_APPROVED_BG, BADGE_APPROVED_TXT),
        "error":    (BADGE_REJECTED_BG, BADGE_REJECTED_TXT),
        "purple":   (BADGE_OVERRIDE_BG, BADGE_OVERRIDE_TXT),
        "info":     (BADGE_AUTO_BG, BADGE_AUTO_TXT),
    }
    bg_color, txt_color = colors.get(variant, (BG_PAGE, T4))
    w = max(len(label) * 6 + 16, 60)
    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, f"Badge-{label}", x, y, w, 22, bg_color, fid, fid, radius=11), pid))
    txt = uid()
    changes.append(add_obj(txt, fid, fid,
        make_text(txt, f"BadgeTxt-{label}", x + 8, y + 4, w - 16, 14, label, 10, 700, txt_color, fid, fid), pid))
    return w


def build_page_header(changes, fid, pid, title, subtitle, btn_text=None):
    """PageHeader in content area. Returns bottom y."""
    cx = 264  # content x + padding
    cy = 76   # content y + padding

    t = uid()
    changes.append(add_obj(t, fid, fid,
        make_text(t, "PageTitle", cx, cy, 700, 34, title, 28, 800, T1, fid, fid, line_height=1.2), pid))

    s = uid()
    changes.append(add_obj(s, fid, fid,
        make_text(s, "PageSubtitle", cx, cy + 40, 700, 18, subtitle, 13, 400, T4, fid, fid), pid))

    if btn_text:
        bw = len(btn_text) * 8 + 40
        bx = 1440 - 24 - bw
        bb = uid()
        changes.append(add_obj(bb, fid, fid,
            make_rect(bb, "BtnPrimary", bx, cy, bw, 40, BLUE, fid, fid, radius=6), pid))
        bt = uid()
        changes.append(add_obj(bt, fid, fid,
            make_text(bt, "BtnPrimaryText", bx + 20, cy + 10, bw - 40, 20, btn_text, 13, 600, WHITE, fid, fid), pid))

    return cy + 64


def build_form_input(changes, fid, pid, x, y, w, label_text, placeholder, is_placeholder=True):
    """Form input field. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 14, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    iy = y + 20
    iid = uid()
    changes.append(add_obj(iid, fid, fid,
        make_rect(iid, f"Input-{label_text}", x, iy, w, 40, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    vid = uid()
    color = T6 if is_placeholder else T1
    changes.append(add_obj(vid, fid, fid,
        make_text(vid, f"Value-{label_text}", x + 12, iy + 10, w - 24, 20,
                  placeholder, 13, 400, color, fid, fid), pid))
    return iy + 48


def build_select(changes, fid, pid, x, y, w, label_text, value):
    """Select dropdown. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 14, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    iy = y + 20
    iid = uid()
    changes.append(add_obj(iid, fid, fid,
        make_rect(iid, f"Select-{label_text}", x, iy, w, 40, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    vid = uid()
    changes.append(add_obj(vid, fid, fid,
        make_text(vid, f"SelectVal-{label_text}", x + 12, iy + 10, w - 36, 20,
                  value, 13, 400, T1, fid, fid), pid))
    # Chevron placeholder
    ch = uid()
    changes.append(add_obj(ch, fid, fid,
        make_rect(ch, f"Chevron-{label_text}", x + w - 24, iy + 16, 10, 8, T4, fid, fid, opacity=0.3), pid))
    return iy + 48


# ═══════════════════════════════════════════
# PAGE BUILDERS
# ═══════════════════════════════════════════

# Content area: x=240, y=52, w=1200, h=848
CX = 240
CY = 52
CW = 1200
CH = 848


def build_view1_lista(frame_id, page_id):
    """View ① — Movimentos Lista"""
    fid = frame_id
    pid = page_id
    changes = []

    # Content BG
    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Movimentos Controlados"])
    build_sidebar(changes, fid, pid, "Movimentos Controlados")

    # PageHeader
    bottom = build_page_header(changes, fid, pid,
        "Movimentos Controlados",
        "Gerencie e aprove as solicitações pendentes no sistema.",
        "Novo Movimento")

    # Tabs
    tabs_y = bottom + 8
    tab_names = [("Pendentes", True), ("Aprovados", False), ("Rejeitados", False), ("Todos", False)]
    tx = 264
    for tab_name, is_active in tab_names:
        tw = len(tab_name) * 8 + 24
        if is_active:
            # Active tab with underline
            tt = uid()
            changes.append(add_obj(tt, fid, fid,
                make_text(tt, f"Tab-{tab_name}", tx, tabs_y, tw, 20, tab_name, 13, 600, BLUE, fid, fid), pid))
            tl = uid()
            changes.append(add_obj(tl, fid, fid,
                make_rect(tl, f"TabLine-{tab_name}", tx, tabs_y + 24, tw, 2, BLUE, fid, fid), pid))
            # Badge "8"
            badge_x = tx + tw + 4
            bbg = uid()
            changes.append(add_obj(bbg, fid, fid,
                make_rect(bbg, "BadgePendCount", badge_x, tabs_y + 1, 20, 18, BLUE, fid, fid, radius=9), pid))
            btxt = uid()
            changes.append(add_obj(btxt, fid, fid,
                make_text(btxt, "BadgePendNum", badge_x + 6, tabs_y + 3, 10, 14, "8", 10, 700, WHITE, fid, fid), pid))
            tx += tw + 32
        else:
            tt = uid()
            changes.append(add_obj(tt, fid, fid,
                make_text(tt, f"Tab-{tab_name}", tx, tabs_y, tw, 20, tab_name, 13, 500, T4, fid, fid), pid))
            tx += tw + 8

    # Tab divider line
    tdl = uid()
    changes.append(add_obj(tdl, fid, fid,
        make_rect(tdl, "TabDivider", 264, tabs_y + 26, CW - 48, 1, BORDER, fid, fid), pid))

    # SearchBar + Actions row
    sr_y = tabs_y + 40
    # Search input
    si_bg = uid()
    changes.append(add_obj(si_bg, fid, fid,
        make_rect(si_bg, "SearchInput", 264, sr_y, 256, 36, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    si_ico = uid()
    changes.append(add_obj(si_ico, fid, fid,
        make_rect(si_ico, "SearchIcon", 274, sr_y + 10, 16, 16, T4, fid, fid, opacity=0.3, radius=2), pid))
    si_txt = uid()
    changes.append(add_obj(si_txt, fid, fid,
        make_text(si_txt, "SearchPlaceholder", 298, sr_y + 8, 210, 20, "Buscar por número ou solicitante...", 12, 400, T6, fid, fid), pid))

    # Busca Avançada link
    ba = uid()
    changes.append(add_obj(ba, fid, fid,
        make_text(ba, "BuscaAvancadaLink", 530, sr_y + 8, 110, 20, "Busca Avançada", 12, 600, BLUE, fid, fid), pid))

    # Ações em Lote button (right)
    al_bg = uid()
    changes.append(add_obj(al_bg, fid, fid,
        make_rect(al_bg, "BtnAcoesLote", 1320, sr_y, 96, 36, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    al_txt = uid()
    changes.append(add_obj(al_txt, fid, fid,
        make_text(al_txt, "BtnAcoesLoteText", 1328, sr_y + 8, 80, 20, "Ações em Lote ▾", 11, 500, T1, fid, fid), pid))

    # DataTable
    tbl_y = sr_y + 48

    # Table header
    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "TableHeaderBG", 264, tbl_y, CW - 48, 32, BG_PAGE, fid, fid), pid))

    cols = [
        ("STATUS", 264, 80), ("TIPO", 348, 110), ("NÚMERO", 462, 120),
        ("SOLICITANTE", 586, 130), ("VALOR R$", 720, 90), ("DATA", 814, 80),
        ("EMPRESA", 898, 120), ("AÇÕES", 1022, 130),
    ]
    for col_name, col_x, col_w in cols:
        ct = uid()
        changes.append(add_obj(ct, fid, fid,
            make_text(ct, f"TH-{col_name}", col_x, tbl_y + 8, col_w, 14, col_name, 11, 600, T1, fid, fid,
                      uppercase=True, letter_spacing=0.5), pid))

    # Table rows (sample data)
    rows_data = [
        ("Pendente", "warning", "Pedido Compra", "PED-2026-00421", "Carlos Silva", "45.000,00", "12/03/2026", "A1 Engenharia", True),
        ("Pendente", "warning", "Nota Fiscal", "NF-2026-01892", "Ana Costa", "128.500,00", "11/03/2026", "A1 Energia", True),
        ("Pendente", "warning", "Ordem Serviço", "OS-2026-00334", "Pedro Santos", "22.000,00", "11/03/2026", "A1 Industrial", True),
        ("Aprovado", "success", "Pedido Compra", "PED-2026-00420", "Maria Oliveira", "8.900,00", "10/03/2026", "A1 Engenharia", False),
        ("⚡ Auto", "info", "Contrato", "CTR-2026-00089", "João Lima", "4.500,00", "10/03/2026", "A1 Agro", False),
        ("Rejeitado", "error", "Pedido Compra", "PED-2026-00419", "Lucia Pereira", "250.000,00", "09/03/2026", "A1 Engenharia", False),
        ("Override", "purple", "Nota Fiscal", "NF-2026-01890", "Admin ECF", "180.000,00", "08/03/2026", "A1 Energia", False),
    ]

    row_y = tbl_y + 32
    for status, variant, tipo, numero, solicitante, valor, data, empresa, can_act in rows_data:
        row_h = 44
        row_opacity = 1.0 if can_act else 0.7

        # Row bg (alternating white)
        rbg = uid()
        changes.append(add_obj(rbg, fid, fid,
            make_rect(rbg, f"Row-{numero}", 264, row_y, CW - 48, row_h, WHITE, fid, fid,
                      strokes=stroke_border(BORDER, 1, "inner"), opacity=row_opacity), pid))

        # Status badge
        build_status_badge(changes, fid, pid, 268, row_y + 11, status, variant)

        # Tipo
        tt = uid()
        changes.append(add_obj(tt, fid, fid,
            make_text(tt, f"Tipo-{numero}", 348, row_y + 13, 110, 18, tipo, 13, 500, T1, fid, fid,
                      text_opacity=row_opacity), pid))
        # Número (clickable)
        nt = uid()
        changes.append(add_obj(nt, fid, fid,
            make_text(nt, f"Num-{numero}", 462, row_y + 13, 120, 18, numero, 13, 700, BLUE, fid, fid,
                      text_opacity=row_opacity), pid))
        # Solicitante
        st = uid()
        changes.append(add_obj(st, fid, fid,
            make_text(st, f"Sol-{numero}", 586, row_y + 13, 130, 18, solicitante, 13, 400, T4, fid, fid,
                      text_opacity=row_opacity), pid))
        # Valor
        vt = uid()
        changes.append(add_obj(vt, fid, fid,
            make_text(vt, f"Val-{numero}", 720, row_y + 13, 90, 18, valor, 13, 700, T1, fid, fid,
                      text_opacity=row_opacity), pid))
        # Data
        dt = uid()
        changes.append(add_obj(dt, fid, fid,
            make_text(dt, f"Data-{numero}", 814, row_y + 13, 80, 18, data, 11, 400, T4, fid, fid,
                      text_opacity=row_opacity), pid))
        # Empresa
        et = uid()
        changes.append(add_obj(et, fid, fid,
            make_text(et, f"Emp-{numero}", 898, row_y + 13, 120, 18, empresa, 13, 400, T1, fid, fid,
                      text_opacity=row_opacity), pid))

        # Actions
        if can_act:
            # Aprovar button
            ab = uid()
            changes.append(add_obj(ab, fid, fid,
                make_rect(ab, f"BtnAprovar-{numero}", 1028, row_y + 8, 60, 28, WHITE, fid, fid,
                          radius=6, strokes=stroke_border(SUCCESS, 1, "inner")), pid))
            abt = uid()
            changes.append(add_obj(abt, fid, fid,
                make_text(abt, f"BtnAprovarTxt-{numero}", 1036, row_y + 13, 44, 18, "Aprovar", 11, 600, SUCCESS, fid, fid), pid))
            # Rejeitar button
            rb = uid()
            changes.append(add_obj(rb, fid, fid,
                make_rect(rb, f"BtnRejeitar-{numero}", 1094, row_y + 8, 60, 28, WHITE, fid, fid,
                          radius=6, strokes=stroke_border(ERROR, 1, "inner")), pid))
            rbt = uid()
            changes.append(add_obj(rbt, fid, fid,
                make_text(rbt, f"BtnRejeitarTxt-{numero}", 1101, row_y + 13, 44, 18, "Rejeitar", 11, 600, ERROR, fid, fid), pid))
        else:
            # Processed text
            pt = uid()
            processed_txt = f"Aprovado" if variant == "success" else ("Rejeitado" if variant == "error" else "Processado")
            changes.append(add_obj(pt, fid, fid,
                make_text(pt, f"Processed-{numero}", 1032, row_y + 13, 120, 18, processed_txt, 11, 400, T4, fid, fid,
                          italic=True), pid))

        row_y += row_h

    # Footer
    foot_y = row_y + 8
    foot_txt = uid()
    changes.append(add_obj(foot_txt, fid, fid,
        make_text(foot_txt, "FooterText", 264, foot_y, 300, 16, "Exibindo 7 de 42 movimentos", 11, 400, T4, fid, fid), pid))
    pag_txt = uid()
    changes.append(add_obj(pag_txt, fid, fid,
        make_text(pag_txt, "PaginationText", 1340, foot_y, 80, 16, "página 1 / 2", 11, 400, T4, fid, fid), pid))

    return changes


def build_view2_detalhe(frame_id, page_id):
    """View ② — Movimento Detalhe (two-column)"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Movimentos", "PED-2026-00421"])
    build_sidebar(changes, fid, pid, "Movimentos Controlados")

    # Two columns: left 2/3 (~780px), right 1/3 (~396px)
    left_x = 264
    left_w = 776
    right_x = 1052
    right_w = 372

    # ── Header Card ──
    hc_y = 76
    hc_h = 140
    hc = uid()
    changes.append(add_obj(hc, fid, fid,
        make_rect(hc, "HeaderCard", left_x, hc_y, left_w, hc_h, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Code + Badge
    code = uid()
    changes.append(add_obj(code, fid, fid,
        make_text(code, "MovCode", left_x + 20, hc_y + 16, 200, 24, "PED-2026-00421", 20, 800, T1, fid, fid), pid))
    build_status_badge(changes, fid, pid, left_x + 210, hc_y + 19, "Pendente", "warning")

    # Description
    desc = uid()
    changes.append(add_obj(desc, fid, fid,
        make_text(desc, "MovDesc", left_x + 20, hc_y + 48, 500, 18, "Pedido de Compra — Material Elétrico Subestação Norte", 13, 400, T4, fid, fid), pid))

    # Value (right-aligned)
    val = uid()
    changes.append(add_obj(val, fid, fid,
        make_text(val, "MovValor", left_x + left_w - 180, hc_y + 12, 160, 30, "R$ 45.000,00", 24, 800, T1, fid, fid), pid))

    # Grid 4 cols: Solicitante, Empresa, Tipo, Regra
    grid_y = hc_y + 80
    grid_items = [
        ("Solicitante", "Carlos Silva"),
        ("Empresa", "A1 Engenharia"),
        ("Tipo", "Pedido Compra"),
        ("Regra Aplicada", "REG-003"),
    ]
    gx = left_x + 20
    for label, value in grid_items:
        gl = uid()
        changes.append(add_obj(gl, fid, fid,
            make_text(gl, f"GridL-{label}", gx, grid_y, 170, 12, label, 10, 700, T4, fid, fid,
                      uppercase=True, letter_spacing=0.8), pid))
        gv = uid()
        color = BLUE if label == "Regra Aplicada" else T1
        changes.append(add_obj(gv, fid, fid,
            make_text(gv, f"GridV-{label}", gx, grid_y + 16, 170, 18, value, 13, 500, color, fid, fid), pid))
        gx += 185

    # ── Approval Chain ──
    chain_y = hc_y + hc_h + 16
    chain_title = uid()
    changes.append(add_obj(chain_title, fid, fid,
        make_text(chain_title, "ChainTitle", left_x, chain_y, 300, 20, "Cadeia de Aprovação", 16, 800, T1, fid, fid), pid))
    chain_y += 32

    chain_levels = [
        ("Nível 1 — Gerente de Compras", "Aprovado", SUCCESS_BG, SUCCESS, "Carlos Ferreira • 11/03 14:22"),
        ("Nível 2 — Diretor Financeiro", "Aguardando", WARNING_BG, WARNING, "Aguardando desde 11/03 14:23"),
        ("Nível 3 — VP Operações", "Bloqueado", BG_PAGE, T4, "Bloqueado até Nível 2"),
    ]
    for lvl_name, lvl_status, lvl_bg, lvl_color, lvl_detail in chain_levels:
        # Level card
        lc = uid()
        changes.append(add_obj(lc, fid, fid,
            make_rect(lc, f"Chain-{lvl_name}", left_x, chain_y, left_w, 60, lvl_bg, fid, fid,
                      radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
        # Circle indicator
        ci = uid()
        changes.append(add_obj(ci, fid, fid,
            make_rect(ci, f"ChainDot-{lvl_name}", left_x + 16, chain_y + 18, 24, 24, lvl_color, fid, fid, radius=12), pid))
        # Level name
        ln = uid()
        changes.append(add_obj(ln, fid, fid,
            make_text(ln, f"ChainName-{lvl_name}", left_x + 52, chain_y + 12, 500, 18, lvl_name, 13, 700, T1, fid, fid), pid))
        # Detail
        ld = uid()
        changes.append(add_obj(ld, fid, fid,
            make_text(ld, f"ChainDetail-{lvl_name}", left_x + 52, chain_y + 34, 500, 16, lvl_detail, 11, 400, T4, fid, fid), pid))
        chain_y += 64
        # Connector
        if lvl_status != "Bloqueado":
            conn = uid()
            changes.append(add_obj(conn, fid, fid,
                make_rect(conn, f"Connector", left_x + 26, chain_y, 2, 16, BORDER, fid, fid), pid))
            chain_y += 20

    # Action buttons
    btn_y = chain_y + 16
    # Aprovar
    ab = uid()
    changes.append(add_obj(ab, fid, fid,
        make_rect(ab, "BtnAprovar", left_x, btn_y, 140, 44, SUCCESS, fid, fid, radius=6), pid))
    abt = uid()
    changes.append(add_obj(abt, fid, fid,
        make_text(abt, "BtnAprovarTxt", left_x + 36, btn_y + 12, 80, 20, "Aprovar", 14, 600, WHITE, fid, fid), pid))
    # Rejeitar
    rb = uid()
    changes.append(add_obj(rb, fid, fid,
        make_rect(rb, "BtnRejeitar", left_x + 156, btn_y, 140, 44, ERROR, fid, fid, radius=6), pid))
    rbt = uid()
    changes.append(add_obj(rbt, fid, fid,
        make_text(rbt, "BtnRejeitarTxt", left_x + 192, btn_y + 12, 80, 20, "Rejeitar", 14, 600, WHITE, fid, fid), pid))

    # ── Override Panel ──
    ov_y = btn_y + 60
    ov = uid()
    changes.append(add_obj(ov, fid, fid,
        make_rect(ov, "OverridePanel", left_x, ov_y, left_w, 150, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))
    ovt = uid()
    changes.append(add_obj(ovt, fid, fid,
        make_text(ovt, "OverrideTitle", left_x + 20, ov_y + 16, 400, 20, "Override Administrativo", 14, 700, T1, fid, fid), pid))
    # Alert box
    alert = uid()
    changes.append(add_obj(alert, fid, fid,
        make_rect(alert, "AlertBox", left_x + 20, ov_y + 44, left_w - 40, 32, WARNING_BG, fid, fid,
                  radius=6, strokes=stroke_border("#fde68a", 1, "inner")), pid))
    alert_txt = uid()
    changes.append(add_obj(alert_txt, fid, fid,
        make_text(alert_txt, "AlertText", left_x + 36, ov_y + 51, left_w - 72, 16, "Esta ação será registrada no log de auditoria", 11, 500, WARNING, fid, fid), pid))
    # TextArea placeholder
    ta = uid()
    changes.append(add_obj(ta, fid, fid,
        make_rect(ta, "TextAreaOverride", left_x + 20, ov_y + 84, left_w - 160, 44, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    ta_txt = uid()
    changes.append(add_obj(ta_txt, fid, fid,
        make_text(ta_txt, "TextAreaPlaceholder", left_x + 32, ov_y + 96, 400, 16, "Justificativa (mín. 20 caracteres)", 12, 400, T6, fid, fid), pid))
    # Counter
    cnt = uid()
    changes.append(add_obj(cnt, fid, fid,
        make_text(cnt, "CharCounter", left_x + 20, ov_y + 132, 120, 14, "0/20 caracteres mínimos", 10, 400, WARNING, fid, fid), pid))
    # Override button (disabled)
    ovb = uid()
    changes.append(add_obj(ovb, fid, fid,
        make_rect(ovb, "BtnOverride", left_x + left_w - 160, ov_y + 88, 140, 36, WARNING, fid, fid,
                  radius=6, opacity=0.5), pid))
    ovbt = uid()
    changes.append(add_obj(ovbt, fid, fid,
        make_text(ovbt, "BtnOverrideTxt", left_x + left_w - 142, ov_y + 96, 110, 18, "Aplicar Override", 11, 600, WHITE, fid, fid), pid))

    # ── Timeline (right column) ──
    tl_bg = uid()
    changes.append(add_obj(tl_bg, fid, fid,
        make_rect(tl_bg, "TimelineBG", right_x, 76, right_w, CH - 48, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))
    tl_title = uid()
    changes.append(add_obj(tl_title, fid, fid,
        make_text(tl_title, "TimelineTitle", right_x + 20, 92, 200, 20, "Timeline", 14, 800, T1, fid, fid), pid))

    events = [
        ("Movimento criado", "#E3F2FD", "12/03 09:15 • Carlos Silva"),
        ("Motor avaliou", "#E3F2FD", "REG-003 • 3 níveis"),
        ("Nível 1 aprovado", SUCCESS_BG, "11/03 14:22 • Carlos Ferreira"),
        ("Nível 2 pendente", WARNING_BG, "Aguardando desde 11/03 14:23"),
        ("Nível 3 bloqueado", BG_PAGE, "Bloqueado até Nível 2"),
    ]
    ey = 124
    for evt_name, dot_color, evt_detail in events:
        # Dot
        ed = uid()
        changes.append(add_obj(ed, fid, fid,
            make_rect(ed, f"TLDot-{evt_name}", right_x + 20, ey + 2, 10, 10, dot_color, fid, fid, radius=5), pid))
        # Connector line
        if evt_name != "Nível 3 bloqueado":
            ecl = uid()
            changes.append(add_obj(ecl, fid, fid,
                make_rect(ecl, f"TLLine-{evt_name}", right_x + 24, ey + 14, 2, 32, BORDER, fid, fid), pid))
        # Event name
        en = uid()
        changes.append(add_obj(en, fid, fid,
            make_text(en, f"TLName-{evt_name}", right_x + 40, ey, 300, 16, evt_name, 12, 600, T1, fid, fid), pid))
        # Event detail
        edt = uid()
        changes.append(add_obj(edt, fid, fid,
            make_text(edt, f"TLDetail-{evt_name}", right_x + 40, ey + 18, 300, 14, evt_detail, 11, 400, T4, fid, fid), pid))
        ey += 48

    return changes


def build_view3_cadastro(frame_id, page_id):
    """View ③ — Cadastro de Movimento (two-column form + preview)"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Movimentos", "Novo Movimento"])
    build_sidebar(changes, fid, pid, "Movimentos Controlados")

    build_page_header(changes, fid, pid,
        "Novo Movimento",
        "Registre um novo movimento para aprovação no sistema.")

    # Two columns
    left_x = 264
    left_w = 776
    right_x = 1052
    right_w = 372
    form_y = 148

    # Form card
    fc = uid()
    changes.append(add_obj(fc, fid, fid,
        make_rect(fc, "FormCard", left_x, form_y, left_w, 640, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    fx = left_x + 24
    fy = form_y + 20
    fw_half = (left_w - 72) // 2

    # Row 1: Tipo + Operação
    fy = build_select(changes, fid, pid, fx, fy, fw_half, "Tipo de Objeto", "Pedido Compra")
    fy2 = build_select(changes, fid, pid, fx + fw_half + 24, form_y + 20, fw_half, "Operação", "CREATE")
    fy = max(fy, fy2) + 8

    # Row 2: Número + Valor
    fy_start = fy
    fy = build_form_input(changes, fid, pid, fx, fy, fw_half, "Número do Documento", "PED-2026-00422")
    fy2 = build_form_input(changes, fid, pid, fx + fw_half + 24, fy_start, fw_half, "Valor R$", "0,00")
    fy = max(fy, fy2) + 8

    # Row 3: Empresa + Solicitante
    fy_start = fy
    fy = build_select(changes, fid, pid, fx, fy, fw_half, "Empresa", "A1 Engenharia")
    fy2 = build_form_input(changes, fid, pid, fx + fw_half + 24, fy_start, fw_half, "Solicitante", "Buscar usuário...")
    fy = max(fy, fy2) + 8

    # Row 4: Origem + Data
    fy_start = fy
    fy = build_select(changes, fid, pid, fx, fy, fw_half, "Origem", "PORTAL")
    fy2 = build_form_input(changes, fid, pid, fx + fw_half + 24, fy_start, fw_half, "Data", "29/03/2026", is_placeholder=False)
    fy = max(fy, fy2) + 8

    # Row 5: Descrição (full width)
    fy = build_form_input(changes, fid, pid, fx, fy, left_w - 48, "Descrição / Objeto", "Material elétrico para subestação...")
    fy += 8

    # Row 6: Observações (textarea placeholder)
    fy = build_form_input(changes, fid, pid, fx, fy, left_w - 48, "Observações", "Notas adicionais...")
    fy += 8

    # Upload zone
    uz_label = uid()
    changes.append(add_obj(uz_label, fid, fid,
        make_text(uz_label, "Label-Anexos", fx, fy, 200, 14, "ANEXOS", 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    fy += 20
    uz = uid()
    changes.append(add_obj(uz, fid, fid,
        make_rect(uz, "UploadZone", fx, fy, left_w - 48, 60, WHITE, fid, fid,
                  radius=6, strokes=stroke_dashed(BORDER, 1)), pid))
    uz_txt = uid()
    changes.append(add_obj(uz_txt, fid, fid,
        make_text(uz_txt, "UploadText", fx + 16, fy + 20, left_w - 80, 20, "Arraste arquivos ou clique para selecionar (PDF, XLSX, JPG, PNG — máx 10MB)", 12, 400, T4, fid, fid), pid))
    fy += 76

    # Buttons
    cancel_bg = uid()
    changes.append(add_obj(cancel_bg, fid, fid,
        make_rect(cancel_bg, "BtnCancel", fx, fy, 100, 40, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    cancel_txt = uid()
    changes.append(add_obj(cancel_txt, fid, fid,
        make_text(cancel_txt, "BtnCancelTxt", fx + 20, fy + 10, 60, 20, "Cancelar", 13, 500, T1, fid, fid), pid))
    submit_bg = uid()
    changes.append(add_obj(submit_bg, fid, fid,
        make_rect(submit_bg, "BtnSubmit", fx + 116, fy, 180, 40, BLUE, fid, fid, radius=6), pid))
    submit_txt = uid()
    changes.append(add_obj(submit_txt, fid, fid,
        make_text(submit_txt, "BtnSubmitTxt", fx + 140, fy + 10, 140, 20, "Registrar Movimento", 13, 600, WHITE, fid, fid), pid))

    # ── Preview Motor de Regras (right column) ──
    pv = uid()
    changes.append(add_obj(pv, fid, fid,
        make_rect(pv, "PreviewPanel", right_x, form_y, right_w, 300, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))
    pv_title = uid()
    changes.append(add_obj(pv_title, fid, fid,
        make_text(pv_title, "PreviewTitle", right_x + 20, form_y + 16, 300, 18, "Simulação Motor de Regras", 14, 700, T1, fid, fid), pid))

    # Rule matched card
    rule_card = uid()
    changes.append(add_obj(rule_card, fid, fid,
        make_rect(rule_card, "RuleCard", right_x + 16, form_y + 48, right_w - 32, 80, BLUE_LT, fid, fid,
                  radius=8), pid))
    rule_name = uid()
    changes.append(add_obj(rule_name, fid, fid,
        make_text(rule_name, "RuleName", right_x + 32, form_y + 60, 300, 16, "REG-003 — Compras > R$ 10.000", 12, 600, BLUE, fid, fid), pid))
    rule_chain = uid()
    changes.append(add_obj(rule_chain, fid, fid,
        make_text(rule_chain, "RuleChain", right_x + 32, form_y + 80, 300, 14, "Cadeia: 3 níveis • Gerente → Diretor → VP", 11, 400, T4, fid, fid), pid))

    # Time estimate card
    time_card = uid()
    changes.append(add_obj(time_card, fid, fid,
        make_rect(time_card, "TimeCard", right_x + 16, form_y + 140, right_w - 32, 50, WARNING_BG, fid, fid,
                  radius=8), pid))
    time_txt = uid()
    changes.append(add_obj(time_txt, fid, fid,
        make_text(time_txt, "TimeText", right_x + 32, form_y + 152, 300, 16, "Tempo estimado: 2-5 dias úteis", 12, 500, WARNING, fid, fid), pid))

    return changes


def build_view4_regras_lista(frame_id, page_id):
    """View ④ — Regras Lista"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Regras de Aprovação"])
    build_sidebar(changes, fid, pid, "Regras de Aprovação")

    bottom = build_page_header(changes, fid, pid,
        "Regras de Aprovação",
        "Configure as regras do motor de aprovação.",
        "Nova Regra")

    # Busca Avançada button (outline, left of Nova Regra)
    ba_bg = uid()
    changes.append(add_obj(ba_bg, fid, fid,
        make_rect(ba_bg, "BtnBuscaAvancada", 1440 - 24 - 120 - 12 - 140, 76, 140, 40, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    ba_txt = uid()
    changes.append(add_obj(ba_txt, fid, fid,
        make_text(ba_txt, "BtnBuscaAvancadaTxt", 1440 - 24 - 120 - 12 - 126, 86, 112, 20, "Busca Avançada", 13, 500, T1, fid, fid), pid))

    # DataTable
    tbl_y = bottom + 8
    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "TableHeaderBG", 264, tbl_y, CW - 48, 32, BG_PAGE, fid, fid), pid))

    cols = [
        ("STATUS", 264, 70), ("OBJETO", 338, 110), ("OPERAÇÃO", 452, 80),
        ("THRESHOLD R$", 536, 100), ("ORIGENS", 640, 180), ("NÍVEIS", 824, 60), ("AÇÕES", 888, 260),
    ]
    for col_name, col_x, col_w in cols:
        ct = uid()
        changes.append(add_obj(ct, fid, fid,
            make_text(ct, f"TH-{col_name}", col_x, tbl_y + 8, col_w, 14, col_name, 11, 600, T1, fid, fid,
                      uppercase=True, letter_spacing=0.5), pid))

    rules_data = [
        ("Ativa", "success", "Pedido Compra", "CREATE", "10.000,00", "PROTHEUS, PORTAL", "3", True),
        ("Ativa", "success", "Nota Fiscal", "CREATE", "50.000,00", "PROTHEUS, API", "2", True),
        ("Ativa", "success", "Pedido Compra", "UPDATE", "25.000,00", "PORTAL", "2", True),
        ("Inativa", "neutral", "Ordem Serviço", "CREATE", "5.000,00", "PORTAL, ⚡ AUTO", "1", False),
        ("Ativa", "success", "Contrato", "CREATE", "100.000,00", "PROTHEUS, PORTAL, API", "4", True),
    ]

    row_y = tbl_y + 32
    for status, variant, objeto, operacao, threshold, origens, niveis, is_active in rules_data:
        row_h = 44
        row_opacity = 1.0 if is_active else 0.6

        rbg = uid()
        changes.append(add_obj(rbg, fid, fid,
            make_rect(rbg, f"RuleRow-{objeto}-{operacao}", 264, row_y, CW - 48, row_h, WHITE, fid, fid,
                      strokes=stroke_border(BORDER, 1, "inner"), opacity=row_opacity), pid))

        # Status badge
        badge_variant = "success" if status == "Ativa" else "warning"
        build_status_badge(changes, fid, pid, 268, row_y + 11, status, badge_variant if is_active else "warning")

        tt = uid()
        changes.append(add_obj(tt, fid, fid,
            make_text(tt, f"Obj-{objeto}-{operacao}", 338, row_y + 13, 110, 18, objeto, 13, 500, T1, fid, fid), pid))
        ot = uid()
        changes.append(add_obj(ot, fid, fid,
            make_text(ot, f"Op-{objeto}-{operacao}", 452, row_y + 13, 80, 18, operacao, 13, 500, T1, fid, fid), pid))
        tht = uid()
        changes.append(add_obj(tht, fid, fid,
            make_text(tht, f"Thr-{objeto}-{operacao}", 536, row_y + 13, 100, 18, threshold, 13, 700, T1, fid, fid), pid))
        ort = uid()
        changes.append(add_obj(ort, fid, fid,
            make_text(ort, f"Orig-{objeto}-{operacao}", 640, row_y + 13, 180, 18, origens, 12, 400, T4, fid, fid), pid))

        # Níveis badge
        nb = uid()
        changes.append(add_obj(nb, fid, fid,
            make_rect(nb, f"NivBadge-{objeto}", 828, row_y + 10, 24, 24, BLUE, fid, fid, radius=12), pid))
        nt = uid()
        changes.append(add_obj(nt, fid, fid,
            make_text(nt, f"NivTxt-{objeto}", 835, row_y + 14, 12, 16, niveis, 11, 700, WHITE, fid, fid), pid))

        # Actions
        eb = uid()
        changes.append(add_obj(eb, fid, fid,
            make_rect(eb, f"BtnEditar-{objeto}", 892, row_y + 8, 56, 28, WHITE, fid, fid,
                      radius=6, strokes=stroke_border(BLUE, 1, "inner")), pid))
        ebt = uid()
        changes.append(add_obj(ebt, fid, fid,
            make_text(ebt, f"BtnEditarTxt-{objeto}", 902, row_y + 13, 36, 18, "Editar", 11, 600, BLUE, fid, fid), pid))

        toggle_label = "Desativar" if is_active else "Ativar"
        toggle_color = ERROR if is_active else SUCCESS
        tb = uid()
        changes.append(add_obj(tb, fid, fid,
            make_rect(tb, f"BtnToggle-{objeto}", 956, row_y + 8, 72, 28, WHITE, fid, fid,
                      radius=6, strokes=stroke_border(toggle_color, 1, "inner")), pid))
        tbt = uid()
        changes.append(add_obj(tbt, fid, fid,
            make_text(tbt, f"BtnToggleTxt-{objeto}", 964, row_y + 13, 56, 18, toggle_label, 11, 600, toggle_color, fid, fid), pid))

        row_y += row_h

    return changes


def build_view5_busca_avancada(frame_id, page_id):
    """View ⑤ — Busca Avançada Regras"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Regras", "Busca Avançada"])
    build_sidebar(changes, fid, pid, "Regras de Aprovação")

    build_page_header(changes, fid, pid,
        "Busca Avançada — Regras",
        "Filtre regras de aprovação por múltiplos critérios.")

    # Filter panel (8 fields, grid 4 cols)
    fp_y = 148
    fp = uid()
    changes.append(add_obj(fp, fid, fid,
        make_rect(fp, "FilterPanel", 264, fp_y, CW - 48, 180, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    fx = 288
    fy = fp_y + 16
    fw = 260

    # Row 1: 4 selects
    build_select(changes, fid, pid, fx, fy, fw, "Tipo de Objeto", "Todos")
    build_select(changes, fid, pid, fx + fw + 16, fy, fw, "Tipo de Operação", "Todos")
    build_select(changes, fid, pid, fx + (fw + 16) * 2, fy, fw, "Status", "Todos")
    build_select(changes, fid, pid, fx + (fw + 16) * 3, fy, fw - 40, "Origem", "Todos")

    fy += 76
    # Row 2: 4 inputs
    build_form_input(changes, fid, pid, fx, fy, fw, "Threshold Mínimo R$", "0,00")
    build_form_input(changes, fid, pid, fx + fw + 16, fy, fw, "Threshold Máximo R$", "999.999,99")
    build_form_input(changes, fid, pid, fx + (fw + 16) * 2, fy, fw, "Nº Níveis (mín)", "1")
    build_select(changes, fid, pid, fx + (fw + 16) * 3, fy, fw - 40, "Tipo Aprovador", "Todos")

    # Buttons row
    btn_y = fp_y + 184 + 12
    # Limpar Filtros link
    lf = uid()
    changes.append(add_obj(lf, fid, fid,
        make_text(lf, "LimparFiltros", 288, btn_y + 10, 100, 18, "Limpar Filtros", 12, 500, BLUE, fid, fid), pid))
    # Pesquisar button
    pb = uid()
    changes.append(add_obj(pb, fid, fid,
        make_rect(pb, "BtnPesquisar", 1340, btn_y, 100, 40, BLUE, fid, fid, radius=6), pid))
    pbt = uid()
    changes.append(add_obj(pbt, fid, fid,
        make_text(pbt, "BtnPesquisarTxt", 1356, btn_y + 10, 70, 20, "Pesquisar", 13, 600, WHITE, fid, fid), pid))

    # Status bar
    sb_y = btn_y + 56
    sb = uid()
    changes.append(add_obj(sb, fid, fid,
        make_text(sb, "ResultStatus", 264, sb_y, 300, 16, "Resultados: 3 regras encontradas", 12, 600, T1, fid, fid), pid))

    # Simplified result rows (highlighted)
    row_y = sb_y + 24
    for i in range(3):
        rbg = uid()
        changes.append(add_obj(rbg, fid, fid,
            make_rect(rbg, f"ResultRow-{i}", 264, row_y, CW - 48, 44, "#FEFCE8" if i < 3 else WHITE, fid, fid,
                      strokes=stroke_border(BORDER, 1, "inner")), pid))
        rt = uid()
        row_texts = ["Pedido Compra • CREATE • R$ 10.000 • 3 níveis", "Nota Fiscal • CREATE • R$ 50.000 • 2 níveis", "Contrato • CREATE • R$ 100.000 • 4 níveis"]
        changes.append(add_obj(rt, fid, fid,
            make_text(rt, f"ResultTxt-{i}", 276, row_y + 13, 800, 18, row_texts[i], 13, 500, T1, fid, fid), pid))
        row_y += 44

    return changes


def build_view6_nova_regra(frame_id, page_id):
    """View ⑥ — Nova Regra (two-column: config + chain builder)"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Regras", "Nova Regra"])
    build_sidebar(changes, fid, pid, "Regras de Aprovação")

    build_page_header(changes, fid, pid,
        "Nova Regra de Aprovação",
        "Configure os critérios e a cadeia de aprovação.")

    left_x = 264
    left_w = 560
    right_x = 840
    right_w = 584
    form_y = 148

    # ── Left: ControlRuleEditor ──
    fc = uid()
    changes.append(add_obj(fc, fid, fid,
        make_rect(fc, "RuleEditorCard", left_x, form_y, left_w, 400, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    fx = left_x + 24
    fy = form_y + 20
    fw_half = (left_w - 72) // 2

    fy = build_select(changes, fid, pid, fx, fy, fw_half, "Tipo de Objeto", "Selecione...")
    build_select(changes, fid, pid, fx + fw_half + 24, form_y + 20, fw_half, "Operação", "CREATE")
    fy += 8
    fy = build_form_input(changes, fid, pid, fx, fy, left_w - 48, "Threshold R$", "0,00")
    fy += 8

    # Origens checkboxes
    ol = uid()
    changes.append(add_obj(ol, fid, fid,
        make_text(ol, "Label-Origens", fx, fy, 200, 14, "ORIGENS", 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    fy += 22
    origins = ["PROTHEUS", "PORTAL", "API", "⚡ AUTO"]
    ox = fx
    for orig in origins:
        cb = uid()
        changes.append(add_obj(cb, fid, fid,
            make_rect(cb, f"CB-{orig}", ox, fy, 16, 16, WHITE, fid, fid,
                      radius=4, strokes=stroke_border(BORDER, 1, "inner")), pid))
        ct = uid()
        changes.append(add_obj(ct, fid, fid,
            make_text(ct, f"CBTxt-{orig}", ox + 22, fy, 80, 16, orig, 12, 400, T1, fid, fid), pid))
        ox += 120
    fy += 36

    # Toggle
    tl = uid()
    changes.append(add_obj(tl, fid, fid,
        make_text(tl, "Label-Require", fx, fy, 200, 14, "REQUER APROVAÇÃO", 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    toggle_bg = uid()
    changes.append(add_obj(toggle_bg, fid, fid,
        make_rect(toggle_bg, "ToggleBG", fx + 200, fy - 2, 40, 20, BLUE, fid, fid, radius=10), pid))
    toggle_dot = uid()
    changes.append(add_obj(toggle_dot, fid, fid,
        make_rect(toggle_dot, "ToggleDot", fx + 222, fy, 16, 16, WHITE, fid, fid, radius=8), pid))
    fy += 36

    # Impact preview card
    imp = uid()
    changes.append(add_obj(imp, fid, fid,
        make_rect(imp, "ImpactCard", fx, fy, left_w - 48, 50, BLUE_LT, fid, fid, radius=8), pid))
    imp_txt = uid()
    changes.append(add_obj(imp_txt, fid, fid,
        make_text(imp_txt, "ImpactText", fx + 16, fy + 16, left_w - 80, 16, "Esta regra afetará ~15 movimentos/mês", 12, 500, BLUE, fid, fid), pid))

    # ── Right: ApprovalRuleChain builder ──
    rc = uid()
    changes.append(add_obj(rc, fid, fid,
        make_rect(rc, "ChainBuilderCard", right_x, form_y, right_w, 560, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    rc_title = uid()
    changes.append(add_obj(rc_title, fid, fid,
        make_text(rc_title, "ChainBuilderTitle", right_x + 20, form_y + 16, 300, 20, "Cadeia de Aprovação", 14, 800, T1, fid, fid), pid))
    rc_link = uid()
    changes.append(add_obj(rc_link, fid, fid,
        make_text(rc_link, "AddNivelLink", right_x + right_w - 120, form_y + 18, 100, 16, "Adicionar Nível", 12, 600, BLUE, fid, fid), pid))

    # Level 1 card
    lv1_y = form_y + 48
    lv1 = uid()
    changes.append(add_obj(lv1, fid, fid,
        make_rect(lv1, "Level1Card", right_x + 16, lv1_y, right_w - 32, 140, BG_PAGE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    # Badge
    lb1 = uid()
    changes.append(add_obj(lb1, fid, fid,
        make_rect(lb1, "Level1Badge", right_x + 28, lv1_y + 12, 60, 22, BLUE_LT, fid, fid, radius=11), pid))
    lb1t = uid()
    changes.append(add_obj(lb1t, fid, fid,
        make_text(lb1t, "Level1BadgeTxt", right_x + 38, lv1_y + 16, 40, 14, "Nível 1", 10, 700, BLUE, fid, fid), pid))
    # Fields grid 2x2
    lvx = right_x + 28
    lvy = lv1_y + 44
    lvw = (right_w - 80) // 2
    build_select(changes, fid, pid, lvx, lvy, lvw, "Tipo Aprovador", "ROLE")
    build_select(changes, fid, pid, lvx + lvw + 16, lvy, lvw, "Entidade", "Gerente Compras")

    # Placeholder dashed card
    ph_y = lv1_y + 160
    ph = uid()
    changes.append(add_obj(ph, fid, fid,
        make_rect(ph, "PlaceholderLevel", right_x + 16, ph_y, right_w - 32, 60, WHITE, fid, fid,
                  radius=8, strokes=stroke_dashed(BORDER, 1)), pid))
    ph_txt = uid()
    changes.append(add_obj(ph_txt, fid, fid,
        make_text(ph_txt, "PlaceholderText", right_x + 40, ph_y + 20, right_w - 80, 18, "Clique em Adicionar Nível", 12, 400, T6, fid, fid), pid))

    return changes


def build_view7_editar_regra(frame_id, page_id):
    """View ⑦ — Editar Regra (like View ⑥ + stats + pre-filled chain)"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Regras", "Editar REG-003"])
    build_sidebar(changes, fid, pid, "Regras de Aprovação")

    # Header with badge
    cx = 264
    cy = 76
    t = uid()
    changes.append(add_obj(t, fid, fid,
        make_text(t, "PageTitle", cx, cy, 300, 34, "Editar Regra REG-003", 28, 800, T1, fid, fid, line_height=1.2), pid))
    build_status_badge(changes, fid, pid, cx + 320, cy + 6, "Ativa", "success")

    # Desativar button (right)
    db = uid()
    changes.append(add_obj(db, fid, fid,
        make_rect(db, "BtnDesativar", 1300, cy, 116, 40, WHITE, fid, fid,
                  radius=6, strokes=stroke_border(ERROR, 1, "inner")), pid))
    dbt = uid()
    changes.append(add_obj(dbt, fid, fid,
        make_text(dbt, "BtnDesativarTxt", 1312, cy + 10, 92, 20, "Desativar Regra", 12, 600, ERROR, fid, fid), pid))

    # Stats cards (grid 3 cols)
    stats_y = cy + 50
    stats = [
        ("Acionamentos", "127", T1),
        ("Aprovados", "98", SUCCESS),
        ("Rejeitados", "14", ERROR),
    ]
    sx = cx
    sw = 250
    for stat_label, stat_val, stat_color in stats:
        sc = uid()
        changes.append(add_obj(sc, fid, fid,
            make_rect(sc, f"StatCard-{stat_label}", sx, stats_y, sw, 64, WHITE, fid, fid,
                      radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
        sl = uid()
        changes.append(add_obj(sl, fid, fid,
            make_text(sl, f"StatLabel-{stat_label}", sx + 16, stats_y + 12, 200, 14, stat_label, 11, 600, T4, fid, fid,
                      uppercase=True, letter_spacing=0.5), pid))
        sv = uid()
        changes.append(add_obj(sv, fid, fid,
            make_text(sv, f"StatVal-{stat_label}", sx + 16, stats_y + 32, 200, 24, stat_val, 22, 800, stat_color, fid, fid), pid))
        sx += sw + 16

    # Two-column below stats
    left_x = 264
    left_w = 560
    right_x = 840
    right_w = 584
    form_y = stats_y + 80

    # ── Left: ControlRuleEditor (pre-filled) ──
    fc = uid()
    changes.append(add_obj(fc, fid, fid,
        make_rect(fc, "RuleEditorCard", left_x, form_y, left_w, 280, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    fx = left_x + 24
    fy = form_y + 20
    fw_half = (left_w - 72) // 2

    fy = build_select(changes, fid, pid, fx, fy, fw_half, "Tipo de Objeto", "Pedido Compra")
    build_select(changes, fid, pid, fx + fw_half + 24, form_y + 20, fw_half, "Operação", "CREATE")
    fy += 8
    fy = build_form_input(changes, fid, pid, fx, fy, left_w - 48, "Threshold R$", "10.000,00", is_placeholder=False)
    fy += 8

    # Origens
    ol = uid()
    changes.append(add_obj(ol, fid, fid,
        make_text(ol, "Label-Origens", fx, fy, 200, 14, "ORIGENS", 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    fy += 22
    origins = [("PROTHEUS", True), ("PORTAL", True), ("API", False), ("⚡ AUTO", False)]
    ox = fx
    for orig, checked in origins:
        cb = uid()
        cb_fill = BLUE if checked else WHITE
        changes.append(add_obj(cb, fid, fid,
            make_rect(cb, f"CB-{orig}", ox, fy, 16, 16, cb_fill, fid, fid,
                      radius=4, strokes=stroke_border(BORDER if not checked else BLUE, 1, "inner")), pid))
        ct = uid()
        changes.append(add_obj(ct, fid, fid,
            make_text(ct, f"CBTxt-{orig}", ox + 22, fy, 80, 16, orig, 12, 400, T1, fid, fid), pid))
        ox += 120

    # ── Right: Pre-filled chain (3 levels) ──
    rc = uid()
    changes.append(add_obj(rc, fid, fid,
        make_rect(rc, "ChainBuilderCard", right_x, form_y, right_w, 480, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    rc_title = uid()
    changes.append(add_obj(rc_title, fid, fid,
        make_text(rc_title, "ChainBuilderTitle", right_x + 20, form_y + 16, 300, 20, "Cadeia de Aprovação", 14, 800, T1, fid, fid), pid))
    rc_link = uid()
    changes.append(add_obj(rc_link, fid, fid,
        make_text(rc_link, "AddNivelLink", right_x + right_w - 120, form_y + 18, 100, 16, "Adicionar Nível", 12, 600, BLUE, fid, fid), pid))

    levels = [
        ("Nível 1", "ROLE", "Gerente Compras", "ALL", "24h"),
        ("Nível 2", "ROLE", "Diretor Financeiro", "ANY", "48h"),
        ("Nível 3", "ORG_LEVEL", "VP Operações", "ALL", "72h"),
    ]

    lv_y = form_y + 48
    for lvl_name, tipo, entidade, criterio, timeout in levels:
        lc = uid()
        changes.append(add_obj(lc, fid, fid,
            make_rect(lc, f"LevelCard-{lvl_name}", right_x + 16, lv_y, right_w - 32, 120, BG_PAGE, fid, fid,
                      radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
        # Badge
        lb = uid()
        changes.append(add_obj(lb, fid, fid,
            make_rect(lb, f"LevelBadge-{lvl_name}", right_x + 28, lv_y + 12, 60, 22, BLUE_LT, fid, fid, radius=11), pid))
        lbt = uid()
        changes.append(add_obj(lbt, fid, fid,
            make_text(lbt, f"LevelBadgeTxt-{lvl_name}", right_x + 38, lv_y + 16, 40, 14, lvl_name, 10, 700, BLUE, fid, fid), pid))

        # Mini info
        info_txt = uid()
        changes.append(add_obj(info_txt, fid, fid,
            make_text(info_txt, f"LevelInfo-{lvl_name}", right_x + 28, lv_y + 44, right_w - 60, 16, f"{tipo} • {entidade}", 12, 500, T1, fid, fid), pid))
        info2 = uid()
        changes.append(add_obj(info2, fid, fid,
            make_text(info2, f"LevelInfo2-{lvl_name}", right_x + 28, lv_y + 66, right_w - 60, 14, f"Critério: {criterio} • Timeout: {timeout}", 11, 400, T4, fid, fid), pid))

        # Reorder/delete buttons
        del_btn = uid()
        changes.append(add_obj(del_btn, fid, fid,
            make_rect(del_btn, f"BtnDel-{lvl_name}", right_x + right_w - 60, lv_y + 12, 20, 20, ERROR, fid, fid,
                      radius=4, opacity=0.6), pid))

        lv_y += 136

    return changes


def build_view8_historico(frame_id, page_id):
    """View ⑧ — Histórico"""
    fid = frame_id
    pid = page_id
    changes = []

    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "ContentBG", CX, CY, CW, CH, BG_PAGE, fid, fid), pid))

    build_topbar(changes, fid, pid, ["Aprovação", "Histórico"])
    build_sidebar(changes, fid, pid, "Histórico")

    build_page_header(changes, fid, pid,
        "Histórico de Aprovações",
        "Log de auditoria com todas as ações realizadas no módulo.")

    # Inline filters (1 row)
    flt_y = 148
    flt_bg = uid()
    changes.append(add_obj(flt_bg, fid, fid,
        make_rect(flt_bg, "FilterRowBG", 264, flt_y, CW - 48, 48, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))

    fx = 276
    # Search input (flex-1 simulated)
    si = uid()
    changes.append(add_obj(si, fid, fid,
        make_rect(si, "SearchInput", fx, flt_y + 8, 300, 32, BG_PAGE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    si_txt = uid()
    changes.append(add_obj(si_txt, fid, fid,
        make_text(si_txt, "SearchPH", fx + 12, flt_y + 14, 280, 20, "Buscar no histórico...", 12, 400, T6, fid, fid), pid))
    fx += 316

    # Ação select (160px)
    sa = uid()
    changes.append(add_obj(sa, fid, fid,
        make_rect(sa, "SelectAcao", fx, flt_y + 8, 140, 32, BG_PAGE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    sat = uid()
    changes.append(add_obj(sat, fid, fid,
        make_text(sat, "SelectAcaoTxt", fx + 10, flt_y + 14, 120, 20, "Ação ▾", 12, 400, T1, fid, fid), pid))
    fx += 156

    # Usuário select
    su = uid()
    changes.append(add_obj(su, fid, fid,
        make_rect(su, "SelectUser", fx, flt_y + 8, 140, 32, BG_PAGE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    sut = uid()
    changes.append(add_obj(sut, fid, fid,
        make_text(sut, "SelectUserTxt", fx + 10, flt_y + 14, 120, 20, "Usuário ▾", 12, 400, T1, fid, fid), pid))
    fx += 156

    # DateRange (2 inputs + "até")
    d1 = uid()
    changes.append(add_obj(d1, fid, fid,
        make_rect(d1, "DateFrom", fx, flt_y + 8, 120, 32, BG_PAGE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    d1t = uid()
    changes.append(add_obj(d1t, fid, fid,
        make_text(d1t, "DateFromTxt", fx + 10, flt_y + 14, 100, 20, "01/03/2026", 12, 400, T1, fid, fid), pid))
    fx += 126
    ate = uid()
    changes.append(add_obj(ate, fid, fid,
        make_text(ate, "AteTxt", fx, flt_y + 14, 24, 20, "até", 12, 400, T4, fid, fid), pid))
    fx += 30
    d2 = uid()
    changes.append(add_obj(d2, fid, fid,
        make_rect(d2, "DateTo", fx, flt_y + 8, 120, 32, BG_PAGE, fid, fid,
                  radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
    d2t = uid()
    changes.append(add_obj(d2t, fid, fid,
        make_text(d2t, "DateToTxt", fx + 10, flt_y + 14, 100, 20, "29/03/2026", 12, 400, T1, fid, fid), pid))
    fx += 136

    # Filtrar button
    fb = uid()
    changes.append(add_obj(fb, fid, fid,
        make_rect(fb, "BtnFiltrar", fx, flt_y + 8, 76, 32, BLUE, fid, fid, radius=6), pid))
    fbt = uid()
    changes.append(add_obj(fbt, fid, fid,
        make_text(fbt, "BtnFiltrarTxt", fx + 16, flt_y + 14, 48, 20, "Filtrar", 12, 600, WHITE, fid, fid), pid))

    # DataTable
    tbl_y = flt_y + 64

    # Table header
    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "TableHeaderBG", 264, tbl_y, CW - 48, 32, BG_PAGE, fid, fid), pid))

    cols = [
        ("", 264, 24), ("DATA/HORA", 292, 100), ("USUÁRIO", 396, 130),
        ("MOVIMENTO", 530, 120), ("AÇÃO", 654, 100), ("NÍVEL", 758, 60), ("DETALHES", 822, 330),
    ]
    for col_name, col_x, col_w in cols:
        if col_name:
            ct = uid()
            changes.append(add_obj(ct, fid, fid,
                make_text(ct, f"TH-{col_name}", col_x, tbl_y + 8, col_w, 14, col_name, 11, 600, T1, fid, fid,
                          uppercase=True, letter_spacing=0.5), pid))

    # Sample rows
    history_data = [
        ("12/03 14:22", "Carlos Ferreira", "PED-2026-00421", "Aprovação", "success", "Nível 1", "Aprovado conforme política de compras"),
        ("12/03 09:15", "Carlos Silva", "PED-2026-00421", "Criação", "info", "—", "Movimento registrado via Portal"),
        ("11/03 16:45", "Ana Costa", "NF-2026-01892", "Aprovação", "success", "Nível 2", "Nota fiscal aprovada — valor dentro do threshold"),
        ("11/03 10:30", "Admin ECF", "NF-2026-01890", "Override", "purple", "—", "Override administrativo — urgência operacional"),
        ("10/03 14:00", "Sistema", "CTR-2026-00089", "⚡ Auto", "info", "—", "Auto-aprovado: valor < R$ 5.000 (REG-001)"),
        ("09/03 11:20", "Lucia Pereira", "PED-2026-00419", "Rejeição", "error", "Nível 2", "Rejeitado: orçamento do trimestre excedido"),
    ]

    row_y = tbl_y + 32
    for data_hora, usuario, movimento, acao, variant, nivel, detalhes in history_data:
        row_h = 44

        rbg = uid()
        changes.append(add_obj(rbg, fid, fid,
            make_rect(rbg, f"HRow-{movimento}-{acao}", 264, row_y, CW - 48, row_h, WHITE, fid, fid,
                      strokes=stroke_border(BORDER, 1, "inner")), pid))

        # Expand chevron placeholder
        ch = uid()
        changes.append(add_obj(ch, fid, fid,
            make_rect(ch, f"Chevron-{movimento}", 270, row_y + 16, 10, 12, T4, fid, fid, opacity=0.3), pid))

        # Data/hora
        dht = uid()
        changes.append(add_obj(dht, fid, fid,
            make_text(dht, f"DH-{movimento}-{acao}", 292, row_y + 13, 100, 18, data_hora, 11, 400, T4, fid, fid), pid))

        # Usuário (avatar + name)
        av = uid()
        changes.append(add_obj(av, fid, fid,
            make_rect(av, f"UAv-{usuario}", 396, row_y + 10, 24, 24, BLUE_LT, fid, fid, radius=12), pid))
        ut = uid()
        changes.append(add_obj(ut, fid, fid,
            make_text(ut, f"UName-{usuario}", 426, row_y + 13, 100, 18, usuario, 12, 500, T1, fid, fid), pid))

        # Movimento (clickable)
        mt = uid()
        changes.append(add_obj(mt, fid, fid,
            make_text(mt, f"Mov-{movimento}", 530, row_y + 13, 120, 18, movimento, 12, 700, BLUE, fid, fid), pid))

        # Ação badge
        build_status_badge(changes, fid, pid, 654, row_y + 11, acao, variant)

        # Nível
        nt = uid()
        changes.append(add_obj(nt, fid, fid,
            make_text(nt, f"Nivel-{movimento}-{acao}", 758, row_y + 13, 60, 18, nivel, 12, 400, T4, fid, fid), pid))

        # Detalhes (truncated)
        det = uid()
        changes.append(add_obj(det, fid, fid,
            make_text(det, f"Det-{movimento}-{acao}", 822, row_y + 13, 330, 18, detalhes[:50], 12, 400, T4, fid, fid), pid))

        row_y += row_h

    # Footer
    foot_y = row_y + 8
    foot_txt = uid()
    changes.append(add_obj(foot_txt, fid, fid,
        make_text(foot_txt, "FooterText", 264, foot_y, 300, 16, "Exibindo 6 de 234 registros", 11, 400, T4, fid, fid), pid))
    pag_txt = uid()
    changes.append(add_obj(pag_txt, fid, fid,
        make_text(pag_txt, "PaginationText", 1340, foot_y, 80, 16, "página 1 / 8", 11, 400, T4, fid, fid), pid))

    return changes


# ═══════════════════════════════════════════
# MAIN EXECUTION
# ═══════════════════════════════════════════

pages = [
    ("30-MovimentosLista", build_view1_lista),
    ("30-MovimentoDetalhe", build_view2_detalhe),
    ("30-CadastroMovimento", build_view3_cadastro),
    ("30-RegrasLista", build_view4_regras_lista),
    ("30-BuscaAvancadaRegras", build_view5_busca_avancada),
    ("30-NovaRegra", build_view6_nova_regra),
    ("30-EditarRegra", build_view7_editar_regra),
    ("30-Historico", build_view8_historico),
]

frame_ids = {}
page_ids = {}

print("\n=== Creating 8 pages ===")

for page_name, builder in pages:
    page_id = uid()
    frame_id = uid()
    page_ids[page_name] = page_id
    frame_ids[page_name] = frame_id

    # Step 1: Create page
    page_changes = [add_page_change(page_id, page_name)]
    if not send_changes(page_changes, f"Page {page_name}"):
        print(f"  ABORT: Failed to create page {page_name}")
        continue

    # Step 2: Add frame
    frame_obj = make_frame(frame_id, page_name, 0, 0, 1440, 900, BG_PAGE)
    frame_changes = [add_obj(frame_id, ROOT, ROOT, frame_obj, page_id)]
    if not send_changes(frame_changes, f"Frame {page_name}"):
        print(f"  ABORT: Failed to create frame for {page_name}")
        continue

    # Step 3: Build all elements
    print(f"  Building elements for {page_name}...")
    all_changes = builder(frame_id, page_id)

    # Batch in groups of 40
    batch_size = 40
    for i in range(0, len(all_changes), batch_size):
        batch = all_changes[i:i + batch_size]
        batch_num = i // batch_size + 1
        total_batches = (len(all_changes) + batch_size - 1) // batch_size
        if not send_changes(batch, f"  {page_name} batch {batch_num}/{total_batches} ({len(batch)} ops)"):
            print(f"  WARNING: Batch {batch_num} failed for {page_name}")
            break

    print(f"  {page_name}: {len(all_changes)} objects created")

print("\n=== DONE ===")
print(f"Total pages: {len(pages)}")
print(f"Final revn: {revn}")
