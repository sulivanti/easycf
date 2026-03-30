"""
Create 05-UsersList screens in Penpot Sandbox.
Uses transit+json REST API. Based on 05-users-list-spec.md.

Pages:
  05-UsersList          — Main user listing with dropdown open on row 1
  05-UsersList-Dropdowns — Showcase of 4 dropdown variants by status
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
# HELPERS (from penpot-create-login-v3.py)
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

def shadow_drop(color="#000000", opacity=0.1, blur=16, spread=0, offset_x=0, offset_y=4):
    return [["^ ",
        "~:id", f"~u{uid()}",
        "~:style", "~:drop-shadow",
        "~:color", ["^ ", "~:color", color, "~:opacity", opacity],
        "~:offset-x", offset_x,
        "~:offset-y", offset_y,
        "~:blur", blur,
        "~:spread", spread,
        "~:hidden", False,
    ]]

def make_rect_with_shadow(rid, name, x, y, w, h, fill, parent, frame,
                          opacity=1, radius=0, strokes=None,
                          shadow_color="#000000", shadow_opacity=0.1,
                          shadow_blur=16, shadow_offset_y=4):
    obj = ["^ ",
        "~:id", f"~u{rid}", "~:type", "~:rect", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{parent}", "~:frame-id", f"~u{frame}",
        "~:fills", [["^ ", "~:fill-color", fill, "~:fill-opacity", opacity]],
        "~:strokes", strokes if strokes else [],
        "~:shadow", shadow_drop(shadow_color, shadow_opacity, shadow_blur, 0, 0, shadow_offset_y),
    ]
    if radius > 0:
        obj.extend(["~:rx", radius, "~:ry", radius])
    return obj

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
# COLORS & CONSTANTS
# ═══════════════════════════════════════════

BLUE = "#2E86C1"
BLUE_LT = "#E3F2FD"
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"
BORDER_LT = "#F0F0EE"
RED = "#E74C3C"
DANGER = "#C0392B"
GREEN = "#1E7A42"
GREEN_LT = "#E8F8EF"

T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"

# Badge colors
BADGE = {
    "ATIVO":     {"text": "#1E7A42", "bg": "#E8F8EF", "border": "#B5E8C9"},
    "INATIVO":   {"text": "#6C757D", "bg": "#F4F4F2", "border": "#E0E0DE"},
    "BLOQUEADO": {"text": "#C0392B", "bg": "#FFEBEE", "border": "#F5C6CB"},
    "PENDENTE":  {"text": "#B8860B", "bg": "#FFF3E0", "border": "#FFE0B2"},
}

# Column widths and X offsets (inside table at padding 20px)
COL_WIDTHS = [110, 140, 220, 150, 150, 130, 80]
COL_HEADERS = ["STATUS", "NOME", "E-MAIL", "PERFIL", "EMPRESA", "ÚLTIMO ACESSO", "AÇÕES"]

# Table data
TABLE_DATA = [
    ("ATIVO",     "Marcos Silva",  "marcos.silva@a1.com.br",  "Administrador", "A1 Engenharia", "27/03/2026"),
    ("ATIVO",     "Ana Oliveira",  "ana.oliveira@a1.com.br",  "Operador",      "A1 Industrial", "26/03/2026"),
    ("INATIVO",   "Julia Lima",    "julia.lima@a1.com.br",    "Operador",      "A1 Agro",       "15/02/2026"),
    ("BLOQUEADO", "Pedro Mendes",  "pedro.mendes@a1.com.br",  "Operador",      "A1 Industrial", "01/01/2026"),
]

# Sidebar menu items
SIDEBAR_ITEMS = [
    ("Dashboard",    False),
    ("Usuários",     True),
    ("Perfis",       False),
    ("Empresas",     False),
]
SIDEBAR_ITEMS_PROCESSOS = [
    ("Solicitações", False),
    ("Aprovações",   False),
]


# ═══════════════════════════════════════════
# HIGH-LEVEL BUILDERS
# ═══════════════════════════════════════════

def add_topbar(changes, frame_id, page_id):
    """Add the full topbar (1440×64) to the frame."""
    fid = frame_id
    pid = page_id

    # Topbar background
    tb_bg = uid()
    changes.append(add_obj(tb_bg, fid, fid,
        make_rect(tb_bg, "TopbarBG", 0, 0, 1440, 64, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Logo icon (40×40 blue rounded rect)
    logo = uid()
    changes.append(add_obj(logo, fid, fid,
        make_rect(logo, "LogoIcon", 24, 12, 40, 40, BLUE, fid, fid, radius=10), pid))

    # "A1" text on logo
    a1 = uid()
    changes.append(add_obj(a1, fid, fid,
        make_text(a1, "LogoA1", 30, 18, 28, 20, "A1", 16, 800, WHITE, fid, fid), pid))

    # "Grupo A1"
    ga1 = uid()
    changes.append(add_obj(ga1, fid, fid,
        make_text(ga1, "GrupoA1", 76, 14, 80, 18, "Grupo A1", 14, 800, T1, fid, fid), pid))

    # "PORTAL INTERNO"
    pi = uid()
    changes.append(add_obj(pi, fid, fid,
        make_text(pi, "PortalInterno", 76, 34, 100, 14, "PORTAL INTERNO", 10, 600, T4, fid, fid,
                  uppercase=True, letter_spacing=1.2), pid))

    # Separator
    sep = uid()
    changes.append(add_obj(sep, fid, fid,
        make_rect(sep, "TopbarSep", 188, 20, 1, 24, BORDER, fid, fid), pid))

    # Breadcrumb "Início"
    bc1 = uid()
    changes.append(add_obj(bc1, fid, fid,
        make_text(bc1, "BC-Inicio", 201, 24, 40, 16, "Início", 13, 400, T4, fid, fid), pid))

    # Breadcrumb separator "›"
    bcs = uid()
    changes.append(add_obj(bcs, fid, fid,
        make_text(bcs, "BC-Sep", 245, 24, 10, 16, "›", 13, 400, T6, fid, fid), pid))

    # Breadcrumb "Usuários" (active)
    bc2 = uid()
    changes.append(add_obj(bc2, fid, fid,
        make_text(bc2, "BC-Usuarios", 259, 24, 60, 16, "Usuários", 13, 700, T1, fid, fid), pid))

    # Bell icon placeholder (rect 18×18)
    bell = uid()
    changes.append(add_obj(bell, fid, fid,
        make_rect(bell, "icon-bell", 1320, 23, 18, 18, T4, fid, fid, opacity=0.3, radius=2), pid))

    # Notification dot
    dot = uid()
    changes.append(add_obj(dot, fid, fid,
        make_rect(dot, "NotifDot", 1335, 20, 7, 7, RED, fid, fid, radius=4), pid))

    # "Empresa: A1 Engenharia"
    emp = uid()
    changes.append(add_obj(emp, fid, fid,
        make_text(emp, "Empresa", 1350, 26, 140, 14, "Empresa: A1 Engenharia", 12, 500, T3, fid, fid), pid))


def add_sidebar(changes, frame_id, page_id):
    """Add the full sidebar (240×836) starting at y=64."""
    fid = frame_id
    pid = page_id

    # Sidebar background
    sb_bg = uid()
    changes.append(add_obj(sb_bg, fid, fid,
        make_rect(sb_bg, "SidebarBG", 0, 64, 240, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # "ADMINISTRAÇÃO" label
    cat1 = uid()
    changes.append(add_obj(cat1, fid, fid,
        make_text(cat1, "Cat-Admin", 28, 88, 200, 12, "ADMINISTRAÇÃO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))

    # Menu items - ADMINISTRAÇÃO
    y = 108
    for label, active in SIDEBAR_ITEMS:
        mid = uid()
        if active:
            # Active item background
            bg_id = uid()
            changes.append(add_obj(bg_id, fid, fid,
                make_rect(bg_id, f"MenuBG-{label}", 16, y, 208, 40, BLUE_LT, fid, fid, radius=6), pid))
            # Icon placeholder
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, BLUE, fid, fid, opacity=0.4, radius=2), pid))
            # Text
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 700, BLUE, fid, fid), pid))
        else:
            # Icon placeholder
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
            # Text
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # "PROCESSOS" label
    y += 12
    cat2 = uid()
    changes.append(add_obj(cat2, fid, fid,
        make_text(cat2, "Cat-Processos", 28, y, 200, 12, "PROCESSOS", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 20

    for label, active in SIDEBAR_ITEMS_PROCESSOS:
        mid = uid()
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # User block at bottom
    # Border top
    ub_border = uid()
    changes.append(add_obj(ub_border, fid, fid,
        make_rect(ub_border, "UserBlockBorder", 0, 864, 240, 1, BORDER, fid, fid), pid))

    # Avatar circle
    av = uid()
    changes.append(add_obj(av, fid, fid,
        make_rect(av, "Avatar", 16, 876, 32, 32, BLUE, fid, fid, radius=16), pid))

    # "AE" on avatar
    ae = uid()
    changes.append(add_obj(ae, fid, fid,
        make_text(ae, "AvatarText", 21, 882, 22, 14, "AE", 11, 700, WHITE, fid, fid), pid))

    # User name
    un = uid()
    changes.append(add_obj(un, fid, fid,
        make_text(un, "UserName", 58, 876, 160, 15, "Administrador ECF", 12, 700, T1, fid, fid), pid))

    # User email
    ue = uid()
    changes.append(add_obj(ue, fid, fid,
        make_text(ue, "UserEmail", 58, 893, 160, 14, "admin@a1.com.br", 11, 400, T4, fid, fid), pid))


def add_badge(changes, x, y, status, parent, frame, page_id):
    """Add a status badge (ATIVO/INATIVO/BLOQUEADO/PENDENTE)."""
    colors = BADGE[status]
    text_len = len(status) * 6.5 + 20  # approximate width
    bw = max(text_len, 60)
    bh = 22

    bg = uid()
    changes.append(add_obj(bg, parent, frame,
        make_rect(bg, f"Badge-{status}", x, y, bw, bh, colors["bg"], parent, frame,
                  radius=11, strokes=stroke_border(colors["border"], 1, "inner")),
        page_id))

    txt = uid()
    changes.append(add_obj(txt, parent, frame,
        make_text(txt, f"BadgeText-{status}", x + 10, y + 4, bw - 20, 14,
                  status, 10, 700, colors["text"], parent, frame,
                  uppercase=True, letter_spacing=0.3),
        page_id))


def add_table_row(changes, row_idx, data, table_x, table_y, parent, frame, page_id,
                  is_active_row=False):
    """Add one table row. data = (status, name, email, perfil, empresa, ultimo_acesso)."""
    row_h = 52
    header_h = 44
    y = table_y + header_h + row_idx * row_h
    x = table_x

    # Row background (highlight if active)
    if is_active_row:
        rbg = uid()
        changes.append(add_obj(rbg, parent, frame,
            make_rect(rbg, f"RowBG-{row_idx}", x, y, 1136, row_h, "#FAFBFC", parent, frame),
            page_id))

    # Row bottom border
    if row_idx < len(TABLE_DATA) - 1:
        rb = uid()
        changes.append(add_obj(rb, parent, frame,
            make_rect(rb, f"RowBorder-{row_idx}", x, y + row_h - 1, 1136, 1, BORDER_LT, parent, frame),
            page_id))

    # Cell positions (with 20px padding inside table)
    cx = x + 20
    cy_text = y + 18  # vertically centered text
    cy_badge = y + 15  # badge slightly higher

    status, name, email, perfil, empresa, acesso = data

    # Col 1: Status badge
    add_badge(changes, cx, cy_badge, status, parent, frame, page_id)
    cx += COL_WIDTHS[0]

    # Col 2: Name (link style)
    n_id = uid()
    changes.append(add_obj(n_id, parent, frame,
        make_text(n_id, f"Name-{row_idx}", cx, cy_text, COL_WIDTHS[1], 16,
                  name, 13, 600, BLUE, parent, frame),
        page_id))
    cx += COL_WIDTHS[1]

    # Col 3: Email
    e_id = uid()
    changes.append(add_obj(e_id, parent, frame,
        make_text(e_id, f"Email-{row_idx}", cx, cy_text, COL_WIDTHS[2], 16,
                  email, 13, 400, T3, parent, frame),
        page_id))
    cx += COL_WIDTHS[2]

    # Col 4: Perfil
    p_id = uid()
    changes.append(add_obj(p_id, parent, frame,
        make_text(p_id, f"Perfil-{row_idx}", cx, cy_text, COL_WIDTHS[3], 16,
                  perfil, 13, 400, T3, parent, frame),
        page_id))
    cx += COL_WIDTHS[3]

    # Col 5: Empresa
    emp_id = uid()
    changes.append(add_obj(emp_id, parent, frame,
        make_text(emp_id, f"Empresa-{row_idx}", cx, cy_text, COL_WIDTHS[4], 16,
                  empresa, 13, 400, T3, parent, frame),
        page_id))
    cx += COL_WIDTHS[4]

    # Col 6: Último Acesso
    a_id = uid()
    changes.append(add_obj(a_id, parent, frame,
        make_text(a_id, f"Acesso-{row_idx}", cx, cy_text, COL_WIDTHS[5], 16,
                  acesso, 13, 400, T3, parent, frame),
        page_id))
    cx += COL_WIDTHS[5]

    # Col 7: Actions "•••"
    act_id = uid()
    act_color = BLUE if is_active_row else T4
    act_weight = 700 if is_active_row else 400
    changes.append(add_obj(act_id, parent, frame,
        make_text(act_id, f"Actions-{row_idx}", cx + 20, cy_text, 40, 16,
                  "•••", 18, act_weight, act_color, parent, frame),
        page_id))

    return y + row_h  # return bottom y for dropdown positioning


def add_dropdown_item(changes, x, y, w, text, style, parent, frame, page_id):
    """Add a dropdown menu item. style = 'primary'|'primary-green'|'normal'|'danger'."""
    item_h = 36

    if style == "primary":
        bg_color, text_color, text_weight = BLUE_LT, BLUE, 600
    elif style == "primary-green":
        bg_color, text_color, text_weight = GREEN_LT, GREEN, 600
    elif style == "danger":
        bg_color, text_color, text_weight = WHITE, DANGER, 400
    else:  # normal
        bg_color, text_color, text_weight = WHITE, T3, 400

    # Item background
    bg = uid()
    changes.append(add_obj(bg, parent, frame,
        make_rect(bg, f"DDItem-{text}", x, y, w, item_h, bg_color, parent, frame,
                  radius=6, opacity=1 if style in ("primary", "primary-green") else 0),
        page_id))

    # Icon placeholder (16×16 rect)
    ico = uid()
    changes.append(add_obj(ico, parent, frame,
        make_rect(ico, f"icon-{text}", x + 12, y + 10, 16, 16, text_color, parent, frame,
                  opacity=0.35, radius=2),
        page_id))

    # Text
    txt = uid()
    changes.append(add_obj(txt, parent, frame,
        make_text(txt, f"DDText-{text}", x + 36, y + 9, w - 48, 18,
                  text, 13, text_weight, text_color, parent, frame),
        page_id))

    return y + item_h


def add_dropdown_separator(changes, x, y, w, parent, frame, page_id):
    """Add a dropdown separator line."""
    sep = uid()
    changes.append(add_obj(sep, parent, frame,
        make_rect(sep, "DDSep", x + 8, y + 4, w - 16, 1, BORDER, parent, frame),
        page_id))
    return y + 9


def add_dropdown_menu(changes, x, y, items, parent, frame, page_id, name="DropdownMenu"):
    """
    Add a complete dropdown menu.
    items = list of (text, style) or 'separator'
    """
    w = 190
    padding = 6

    # Calculate height
    h = padding * 2
    for item in items:
        if item == "separator":
            h += 9
        else:
            h += 36

    # Dropdown background with shadow
    dd_bg = uid()
    changes.append(add_obj(dd_bg, parent, frame,
        make_rect_with_shadow(dd_bg, name, x, y, w, h, WHITE, parent, frame,
                              radius=8, strokes=stroke_border(BORDER, 1, "inner"),
                              shadow_opacity=0.1, shadow_blur=16, shadow_offset_y=4),
        page_id))

    # Items
    cy = y + padding
    for item in items:
        if item == "separator":
            cy = add_dropdown_separator(changes, x, cy, w, parent, frame, page_id)
        else:
            text, style = item
            cy = add_dropdown_item(changes, x + padding, cy, w - padding * 2,
                                   text, style, parent, frame, page_id)


# ═══════════════════════════════════════════
# PAGE 1: 05-UsersList
# ═══════════════════════════════════════════

print("\n=== Creating page 05-UsersList ===")

page1_id = uid()
frame1_id = uid()

changes1 = [
    add_page_change(page1_id, "05-UsersList"),
    add_obj(frame1_id, ROOT, ROOT,
        make_frame(frame1_id, "05-UsersList", 0, 0, 1440, 900, BG_PAGE), page1_id),
]

# ── Topbar ──
add_topbar(changes1, frame1_id, page1_id)

# ── Sidebar ──
add_sidebar(changes1, frame1_id, page1_id)

# ── Content Area ──
# Content area background
ca_bg = uid()
changes1.append(add_obj(ca_bg, frame1_id, frame1_id,
    make_rect(ca_bg, "ContentAreaBG", 240, 64, 1200, 836, BG_PAGE, frame1_id, frame1_id),
    page1_id))

# -- Page Header --
# "Usuários" title
title = uid()
changes1.append(add_obj(title, frame1_id, frame1_id,
    make_text(title, "PageTitle", 272, 96, 300, 34,
              "Usuários", 28, 800, T1, frame1_id, frame1_id,
              letter_spacing=-1, line_height=1.21),
    page1_id))

# Description
desc = uid()
changes1.append(add_obj(desc, frame1_id, frame1_id,
    make_text(desc, "PageDesc", 272, 134, 500, 18,
              "Gerencie os acessos, permissões e status dos usuários da plataforma.",
              14, 400, T4, frame1_id, frame1_id),
    page1_id))

# Button "+ Novo Usuário"
btn_bg = uid()
changes1.append(add_obj(btn_bg, frame1_id, frame1_id,
    make_rect(btn_bg, "BtnNovo", 1300, 96, 140, 40, BLUE, frame1_id, frame1_id, radius=8),
    page1_id))
btn_txt = uid()
changes1.append(add_obj(btn_txt, frame1_id, frame1_id,
    make_text(btn_txt, "BtnNovoText", 1312, 104, 120, 16,
              "+ Novo Usuário", 13, 700, WHITE, frame1_id, frame1_id),
    page1_id))

# -- Search Bar (mt:24px from desc bottom ~152) --
search_y = 168

# Search input background
si_bg = uid()
changes1.append(add_obj(si_bg, frame1_id, frame1_id,
    make_rect(si_bg, "SearchInput", 272, search_y, 520, 42, WHITE, frame1_id, frame1_id,
              radius=8, strokes=stroke_border(BORDER, 1, "inner")),
    page1_id))

# Search icon placeholder
si_ico = uid()
changes1.append(add_obj(si_ico, frame1_id, frame1_id,
    make_rect(si_ico, "icon-search", 286, search_y + 12, 18, 18, T6, frame1_id, frame1_id,
              opacity=0.5, radius=2),
    page1_id))

# Search placeholder text
si_txt = uid()
changes1.append(add_obj(si_txt, frame1_id, frame1_id,
    make_text(si_txt, "SearchPlaceholder", 314, search_y + 12, 460, 18,
              "Buscar por nome ou e-mail...", 13, 400, T6, frame1_id, frame1_id),
    page1_id))

# "Busca Avançada" link
ba = uid()
changes1.append(add_obj(ba, frame1_id, frame1_id,
    make_text(ba, "BuscaAvancada", 808, search_y + 12, 110, 18,
              "Busca Avançada", 13, 600, BLUE, frame1_id, frame1_id),
    page1_id))

# Filter group (right-aligned)
fl_label = uid()
changes1.append(add_obj(fl_label, frame1_id, frame1_id,
    make_text(fl_label, "FiltrarPor", 1240, search_y + 14, 70, 14,
              "Filtrar por:", 12, 400, T4, frame1_id, frame1_id),
    page1_id))

# Select "Todos os Status"
sel_bg = uid()
changes1.append(add_obj(sel_bg, frame1_id, frame1_id,
    make_rect(sel_bg, "SelectFilter", 1316, search_y + 3, 160, 36, WHITE, frame1_id, frame1_id,
              radius=6, strokes=stroke_border(BORDER, 1, "inner")),
    page1_id))

sel_txt = uid()
changes1.append(add_obj(sel_txt, frame1_id, frame1_id,
    make_text(sel_txt, "SelectText", 1328, search_y + 11, 110, 16,
              "Todos os Status", 12, 500, T2, frame1_id, frame1_id),
    page1_id))

# Chevron icon placeholder
sel_chev = uid()
changes1.append(add_obj(sel_chev, frame1_id, frame1_id,
    make_rect(sel_chev, "icon-chevron", 1454, search_y + 14, 10, 10, T4, frame1_id, frame1_id,
              opacity=0.4, radius=1),
    page1_id))

# -- Table --
table_y = search_y + 58  # mt:16px from search bar
table_x = 272
table_w = 1136

# Table container background
tbl_bg = uid()
changes1.append(add_obj(tbl_bg, frame1_id, frame1_id,
    make_rect(tbl_bg, "TableBG", table_x, table_y, table_w, 252, WHITE, frame1_id, frame1_id,
              radius=10, strokes=stroke_border(BORDER, 1, "inner")),
    page1_id))

# Table header row
header_y = table_y
header_h = 44

# Header bottom border
hb = uid()
changes1.append(add_obj(hb, frame1_id, frame1_id,
    make_rect(hb, "HeaderBorder", table_x, header_y + header_h - 1, table_w, 1, BORDER, frame1_id, frame1_id),
    page1_id))

# Header cells
hx = table_x + 20
for i, header in enumerate(COL_HEADERS):
    h_id = uid()
    changes1.append(add_obj(h_id, frame1_id, frame1_id,
        make_text(h_id, f"TH-{header}", hx, header_y + 16, COL_WIDTHS[i], 14,
                  header, 11, 700, T4, frame1_id, frame1_id,
                  uppercase=True, letter_spacing=0.5),
        page1_id))
    hx += COL_WIDTHS[i]

# Table rows
for idx, row_data in enumerate(TABLE_DATA):
    is_active = (idx == 0)  # First row has dropdown open
    add_table_row(changes1, idx, row_data, table_x, table_y,
                  frame1_id, frame1_id, page1_id, is_active_row=is_active)

# -- Dropdown on row 1 (Marcos Silva - ATIVO) --
# Position: anchored to "•••" of row 1, right-aligned
dd_x = table_x + table_w - 200  # right-aligned
dd_y = table_y + header_h + 52 + 4  # below first row

dropdown_items_ativo = [
    ("Editar", "primary"),
    ("Resetar senha", "normal"),
    "separator",
    ("Desativar", "danger"),
    ("Bloquear", "danger"),
]
add_dropdown_menu(changes1, dd_x, dd_y, dropdown_items_ativo,
                  frame1_id, frame1_id, page1_id, "DD-Ativo")

# -- Pagination --
pag_y = table_y + 264  # below table

pag_info = uid()
changes1.append(add_obj(pag_info, frame1_id, frame1_id,
    make_text(pag_info, "PagInfo", 272, pag_y, 200, 16,
              "Exibindo 4 de 128 usuários", 12, 400, T4, frame1_id, frame1_id),
    page1_id))

# "Carregar mais resultados" button
pag_btn_bg = uid()
changes1.append(add_obj(pag_btn_bg, frame1_id, frame1_id,
    make_rect(pag_btn_bg, "BtnCarregarMais", 1280, pag_y - 6, 196, 36, WHITE, frame1_id, frame1_id,
              radius=6, strokes=stroke_border(BORDER, 1, "inner")),
    page1_id))

pag_btn_txt = uid()
changes1.append(add_obj(pag_btn_txt, frame1_id, frame1_id,
    make_text(pag_btn_txt, "BtnCarregarMaisText", 1292, pag_y + 2, 172, 16,
              "Carregar mais resultados", 12, 500, T2, frame1_id, frame1_id),
    page1_id))

# Send page 1
send_changes(changes1, "Page 05-UsersList")


# ═══════════════════════════════════════════
# PAGE 2: 05-UsersList-Dropdowns
# ═══════════════════════════════════════════

print("\n=== Creating page 05-UsersList-Dropdowns ===")

page2_id = uid()
frame2_id = uid()

changes2 = [
    add_page_change(page2_id, "05-UsersList-Dropdowns"),
    add_obj(frame2_id, ROOT, ROOT,
        make_frame(frame2_id, "05-UsersList-Dropdowns", 0, 0, 1000, 500, WHITE), page2_id),
]

# Title
sh_title = uid()
changes2.append(add_obj(sh_title, frame2_id, frame2_id,
    make_text(sh_title, "ShowcaseTitle", 48, 32, 600, 30,
              "Menu de Ações por Status", 24, 800, T1, frame2_id, frame2_id,
              letter_spacing=-0.5),
    page2_id))

# 4 columns: ATIVO, INATIVO, BLOQUEADO, PENDENTE
col_w = 210
col_gap = 24
start_x = 48
start_y = 80

dropdown_configs = [
    ("ATIVO", [
        ("Editar", "primary"),
        ("Resetar senha", "normal"),
        "separator",
        ("Desativar", "danger"),
        ("Bloquear", "danger"),
    ]),
    ("INATIVO", [
        ("Reativar", "primary-green"),
        ("Editar", "normal"),
        "separator",
        ("Bloquear", "danger"),
    ]),
    ("BLOQUEADO", [
        ("Desbloquear", "primary-green"),
        ("Editar", "normal"),
        "separator",
        ("Desativar", "danger"),
    ]),
    ("PENDENTE", [
        ("Reenviar convite", "primary"),
        ("Editar", "normal"),
        "separator",
        ("Cancelar convite", "danger"),
        ("Bloquear", "danger"),
    ]),
]

for col_idx, (status, items) in enumerate(dropdown_configs):
    cx = start_x + col_idx * (col_w + col_gap)

    # Badge
    add_badge(changes2, cx + 60, start_y, status, frame2_id, frame2_id, page2_id)

    # Dropdown
    add_dropdown_menu(changes2, cx, start_y + 36, items,
                      frame2_id, frame2_id, page2_id, f"DD-{status}")

# Send page 2
send_changes(changes2, "Page 05-UsersList-Dropdowns")

print("\nDone! Both pages created successfully.")
