"""
Create 07-RoleForm-Edit and 07-RoleForm-Create screens in Penpot Sandbox.
Uses transit+json REST API. Based on 07-role-form-spec.md.

Pages:
  07-RoleForm-Edit    — Form with pre-filled data + status toggle + 24 scope chips
  07-RoleForm-Create  — Empty form, no toggle, empty scopes area
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
# COLORS & CONSTANTS
# ═══════════════════════════════════════════

BLUE = "#2E86C1"
BLUE_LT = "#E3F2FD"
BLUE_HOVER = "#256FA0"
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"
INFO_BG = "#F0F8FF"
SCOPE_BG = "#F4F4F2"
SCOPE_BD = "#E0E0DE"

T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"

# Badge colors
BA_T = "#1E7A42"
BA_BG = "#E8F8EF"
BA_BD = "#B5E8C9"

BI_T = "#6C757D"
BI_BG = "#F4F4F2"
BI_BD = "#E0E0DE"

# Sidebar items for Admin context (Perfis e Permissoes active)
SIDEBAR_ADMIN = [
    ("Dashboard", False),
    ("Usuários", False),
    ("Perfis e Permissões", True),
    ("Empresas", False),
]
SIDEBAR_PROC = [
    ("Solicitações", False),
    ("Aprovações", False),
]

SCOPES = [
    "admin:backoffice:read", "admin:backoffice:write",
    "case:instance:read", "case:instance:write",
    "integration:service:read", "integration:service:write",
    "mcp:agent:read", "mcp:agent:write",
    "movement:approval:read", "movement:approval:write",
    "movement:rule:read", "movement:rule:write",
    "org:unit:read", "org:unit:write",
    "params:routine:read", "params:routine:write",
    "process:cycle:read", "process:cycle:write",
    "tenants:tenant:read", "tenants:tenant:write",
    "users:role:read", "users:role:write",
    "users:user:read", "users:user:write",
]


# ═══════════════════════════════════════════
# SHARED BUILDERS
# ═══════════════════════════════════════════

def build_topbar(changes, frame_id, page_id, breadcrumb_last="Editar"):
    fid = frame_id
    pid = page_id

    # Background
    tb_bg = uid()
    changes.append(add_obj(tb_bg, fid, fid,
        make_rect(tb_bg, "TopbarBG", 0, 0, 1440, 64, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Logo
    logo = uid()
    changes.append(add_obj(logo, fid, fid,
        make_rect(logo, "LogoIcon", 24, 12, 40, 40, BLUE, fid, fid, radius=10), pid))
    a1 = uid()
    changes.append(add_obj(a1, fid, fid,
        make_text(a1, "LogoA1", 30, 18, 28, 20, "A1", 16, 800, WHITE, fid, fid), pid))

    # Title
    ga1 = uid()
    changes.append(add_obj(ga1, fid, fid,
        make_text(ga1, "GrupoA1", 76, 14, 80, 18, "Grupo A1", 14, 800, T1, fid, fid), pid))
    pi = uid()
    changes.append(add_obj(pi, fid, fid,
        make_text(pi, "PortalInterno", 76, 34, 100, 14, "PORTAL INTERNO", 10, 600, T4, fid, fid,
                  uppercase=True, letter_spacing=1.2), pid))

    # Separator
    sep = uid()
    changes.append(add_obj(sep, fid, fid,
        make_rect(sep, "TopbarSep", 188, 20, 1, 24, BORDER, fid, fid), pid))

    # Breadcrumb: Administração › Perfis e Permissões › {last}
    bx = 201
    bc1 = uid()
    changes.append(add_obj(bc1, fid, fid,
        make_text(bc1, "BC-Admin", bx, 24, 95, 16, "Administração", 13, 400, T4, fid, fid), pid))
    bx += 99
    bcs1 = uid()
    changes.append(add_obj(bcs1, fid, fid,
        make_text(bcs1, "BC-Sep1", bx, 24, 10, 16, "›", 13, 400, T6, fid, fid), pid))
    bx += 14
    bc2 = uid()
    changes.append(add_obj(bc2, fid, fid,
        make_text(bc2, "BC-Perfis", bx, 24, 130, 16, "Perfis e Permissões", 13, 400, T4, fid, fid), pid))
    bx += 134
    bcs2 = uid()
    changes.append(add_obj(bcs2, fid, fid,
        make_text(bcs2, "BC-Sep2", bx, 24, 10, 16, "›", 13, 400, T6, fid, fid), pid))
    bx += 14
    bc3 = uid()
    changes.append(add_obj(bc3, fid, fid,
        make_text(bc3, "BC-Last", bx, 24, 80, 16, breadcrumb_last, 13, 700, T1, fid, fid), pid))

    # Right side: Bell + Empresa
    bell = uid()
    changes.append(add_obj(bell, fid, fid,
        make_rect(bell, "BellIcon", 1310, 23, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
    notif_dot = uid()
    changes.append(add_obj(notif_dot, fid, fid,
        make_rect(notif_dot, "NotifDot", 1326, 21, 7, 7, "#E74C3C", fid, fid, radius=4), pid))
    emp = uid()
    changes.append(add_obj(emp, fid, fid,
        make_text(emp, "TopbarEmpresa", 1340, 24, 100, 16, "Empresa: A1 Engenharia", 12, 500, T3, fid, fid), pid))


def build_sidebar(changes, frame_id, page_id):
    fid = frame_id
    pid = page_id

    sb_bg = uid()
    changes.append(add_obj(sb_bg, fid, fid,
        make_rect(sb_bg, "SidebarBG", 0, 64, 240, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # ADMINISTRAÇÃO
    cat1 = uid()
    changes.append(add_obj(cat1, fid, fid,
        make_text(cat1, "Cat-Admin", 28, 88, 200, 12, "ADMINISTRAÇÃO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))

    y = 108
    for label, active in SIDEBAR_ADMIN:
        mid = uid()
        if active:
            bg_id = uid()
            changes.append(add_obj(bg_id, fid, fid,
                make_rect(bg_id, f"MenuBG-{label}", 16, y, 208, 40, BLUE_LT, fid, fid, radius=6), pid))
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, BLUE, fid, fid, opacity=0.4, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y + 10, 160, 20, label, 13, 700, BLUE, fid, fid), pid))
        else:
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y + 10, 160, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # PROCESSOS
    y += 12
    cat2 = uid()
    changes.append(add_obj(cat2, fid, fid,
        make_text(cat2, "Cat-Processos", 28, y, 200, 12, "PROCESSOS", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 20

    for label, active in SIDEBAR_PROC:
        mid = uid()
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y + 10, 160, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # Footer: UserBlock
    foot_border = uid()
    changes.append(add_obj(foot_border, fid, fid,
        make_rect(foot_border, "SidebarFootBorder", 0, 864, 240, 1, BORDER, fid, fid), pid))
    av = uid()
    changes.append(add_obj(av, fid, fid,
        make_rect(av, "UserAvatar", 16, 876, 32, 32, BLUE, fid, fid, radius=16), pid))
    av_txt = uid()
    changes.append(add_obj(av_txt, fid, fid,
        make_text(av_txt, "AvatarText", 22, 884, 20, 14, "AE", 11, 700, WHITE, fid, fid), pid))
    un = uid()
    changes.append(add_obj(un, fid, fid,
        make_text(un, "UserName", 56, 876, 170, 14, "Administrador ECF", 12, 700, T1, fid, fid), pid))
    ue = uid()
    changes.append(add_obj(ue, fid, fid,
        make_text(ue, "UserEmail", 56, 893, 170, 13, "admin@a1.com.br", 11, 400, T4, fid, fid), pid))


def build_content_area(changes, frame_id, page_id):
    """ContentArea background."""
    fid = frame_id
    pid = page_id
    ct = uid()
    changes.append(add_obj(ct, fid, fid,
        make_rect(ct, "ContentAreaBG", 240, 64, 1200, 836, BG_PAGE, fid, fid), pid))


def build_back_link(changes, fid, pid, x, y):
    """BackLink: ← Voltar para lista."""
    arrow = uid()
    changes.append(add_obj(arrow, fid, fid,
        make_text(arrow, "BackArrow", x, y, 16, 16, "←", 13, 600, BLUE, fid, fid), pid))
    txt = uid()
    changes.append(add_obj(txt, fid, fid,
        make_text(txt, "BackLinkText", x + 22, y, 120, 16, "Voltar para lista", 13, 600, BLUE, fid, fid), pid))


def build_form_field(changes, fid, pid, x, y, w, label_text, value_text="", placeholder=""):
    """Input field with label. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 12, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    iy = y + 20
    inp = uid()
    changes.append(add_obj(inp, fid, fid,
        make_rect(inp, f"Input-{label_text}", x, iy, w, 48, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))
    if value_text:
        vt = uid()
        changes.append(add_obj(vt, fid, fid,
            make_text(vt, f"InputVal-{label_text}", x + 14, iy + 14, w - 28, 20,
                      value_text, 14, 400, T1, fid, fid), pid))
    elif placeholder:
        pt = uid()
        changes.append(add_obj(pt, fid, fid,
            make_text(pt, f"InputPH-{label_text}", x + 14, iy + 14, w - 28, 20,
                      placeholder, 14, 400, T6, fid, fid), pid))
    return iy + 48


def build_textarea_field(changes, fid, pid, x, y, w, label_text, value_text="", placeholder=""):
    """Textarea field with label. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 12, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    iy = y + 20
    inp = uid()
    changes.append(add_obj(inp, fid, fid,
        make_rect(inp, f"Textarea-{label_text}", x, iy, w, 80, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))
    if value_text:
        vt = uid()
        changes.append(add_obj(vt, fid, fid,
            make_text(vt, f"TextareaVal-{label_text}", x + 14, iy + 12, w - 28, 56,
                      value_text, 14, 400, T1, fid, fid, line_height=1.5), pid))
    elif placeholder:
        pt = uid()
        changes.append(add_obj(pt, fid, fid,
            make_text(pt, f"TextareaPH-{label_text}", x + 14, iy + 12, w - 28, 56,
                      placeholder, 14, 400, T6, fid, fid, line_height=1.5), pid))
    return iy + 80


def build_toggle(changes, fid, pid, x, y, is_on=True):
    """Toggle switch with label. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, "ToggleLabel-STATUS", x, y + 3, 60, 12, "STATUS", 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    track_color = BLUE if is_on else BORDER
    track = uid()
    changes.append(add_obj(track, fid, fid,
        make_rect(track, "ToggleTrack", x + 70, y, 40, 22, track_color, fid, fid, radius=11), pid))
    thumb_x = x + 90 if is_on else x + 72
    thumb = uid()
    changes.append(add_obj(thumb, fid, fid,
        make_rect(thumb, "ToggleThumb", thumb_x, y + 2, 18, 18, WHITE, fid, fid, radius=9), pid))
    label_text = "Ativo" if is_on else "Inativo"
    lbl = uid()
    changes.append(add_obj(lbl, fid, fid,
        make_text(lbl, "ToggleStatusLabel", x + 118, y + 3, 60, 16, label_text, 13, 500, T2, fid, fid), pid))
    return y + 22


def build_separator(changes, fid, pid, x, y, w):
    """Horizontal separator."""
    sep = uid()
    changes.append(add_obj(sep, fid, fid,
        make_rect(sep, "Separator", x, y, w, 1, BORDER, fid, fid), pid))


def build_scope_chips(changes, fid, pid, x, y, w, scopes):
    """Scope chips in flex-wrap layout. Returns bottom y."""
    chip_x = x
    chip_y = y
    chip_h = 28
    gap = 8
    max_x = x + w

    for scope_text in scopes:
        # Estimate chip width: ~7px per char + 12px padding each side + 24px for × button
        chip_w = len(scope_text) * 7 + 24 + 24
        if chip_x + chip_w > max_x and chip_x > x:
            chip_x = x
            chip_y += chip_h + gap

        cid = uid()
        changes.append(add_obj(cid, fid, fid,
            make_rect(cid, f"Chip-{scope_text}", chip_x, chip_y, chip_w, chip_h, SCOPE_BG, fid, fid,
                      radius=6, strokes=stroke_border(SCOPE_BD, 1, "inner")), pid))
        ct = uid()
        changes.append(add_obj(ct, fid, fid,
            make_text(ct, f"ChipText-{scope_text}", chip_x + 12, chip_y + 6, chip_w - 40, 16,
                      scope_text, 12, 500, T3, fid, fid), pid))
        cx = uid()
        changes.append(add_obj(cx, fid, fid,
            make_text(cx, f"ChipX-{scope_text}", chip_x + chip_w - 22, chip_y + 6, 16, 16,
                      "×", 12, 600, T4, fid, fid), pid))

        chip_x += chip_w + gap

    return chip_y + chip_h


def build_empty_scopes(changes, fid, pid, x, y, w):
    """Empty scopes state with dashed border. Returns bottom y."""
    h = 100
    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "EmptyScopesBG", x, y, w, h, WHITE, fid, fid,
                  radius=10, strokes=stroke_dashed(BORDER, 2, "inner")), pid))
    # Icon placeholder
    ico = uid()
    changes.append(add_obj(ico, fid, fid,
        make_rect(ico, "EmptyScopesIcon", x + w // 2 - 20, y + 16, 40, 40, SCOPE_BG, fid, fid, radius=20), pid))
    # Text
    txt = uid()
    changes.append(add_obj(txt, fid, fid,
        make_text(txt, "EmptyScopesText", x + 40, y + 64, w - 80, 28,
                  "Nenhum escopo adicionado ainda.\nUtilize o campo abaixo para adicionar permissões.",
                  13, 400, T4, fid, fid, line_height=1.5), pid))
    return y + h


def build_add_scope_row(changes, fid, pid, x, y, w):
    """Add scope input + button row. Returns bottom y."""
    btn_w = 110
    inp_w = w - btn_w - 12
    # Input
    inp = uid()
    changes.append(add_obj(inp, fid, fid,
        make_rect(inp, "AddScopeInput", x, y, inp_w, 42, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    ph = uid()
    changes.append(add_obj(ph, fid, fid,
        make_text(ph, "AddScopePH", x + 14, y + 12, inp_w - 28, 18,
                  "domínio:entidade:ação", 13, 400, T6, fid, fid), pid))
    # Button
    btn = uid()
    changes.append(add_obj(btn, fid, fid,
        make_rect(btn, "BtnAdicionar", x + inp_w + 12, y, btn_w, 42, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    bt = uid()
    changes.append(add_obj(bt, fid, fid,
        make_text(bt, "BtnAdicionarText", x + inp_w + 30, y + 12, btn_w - 36, 18,
                  "Adicionar", 13, 600, T3, fid, fid), pid))
    return y + 42


def build_info_box(changes, fid, pid, x, y, w):
    """Info box with blue background. Returns bottom y."""
    h = 48
    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, "InfoBoxBG", x, y, w, h, INFO_BG, fid, fid, radius=8), pid))
    # Info icon placeholder
    ico = uid()
    changes.append(add_obj(ico, fid, fid,
        make_rect(ico, "InfoIcon", x + 16, y + 14, 16, 16, BLUE, fid, fid, opacity=0.3, radius=8), pid))
    txt = uid()
    changes.append(add_obj(txt, fid, fid,
        make_text(txt, "InfoBoxText", x + 42, y + 10, w - 58, 28,
                  "Os escopos definem quais ações este perfil pode executar no sistema. Utilize o formato domínio:entidade:ação (ex: users:user:read).",
                  13, 400, BLUE, fid, fid, line_height=1.5), pid))
    return y + h


def build_badge(changes, fid, pid, x, y, text, variant="active"):
    """Status badge. Returns right edge x."""
    w = len(text) * 7 + 20
    if variant == "active":
        bg_c, bd_c, txt_c = BA_BG, BA_BD, BA_T
    else:
        bg_c, bd_c, txt_c = BI_BG, BI_BD, BI_T
    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_rect(bg, f"Badge-{text}", x, y, w, 22, bg_c, fid, fid,
                  radius=11, strokes=stroke_border(bd_c, 1, "inner")), pid))
    bt = uid()
    changes.append(add_obj(bt, fid, fid,
        make_text(bt, f"BadgeText-{text}", x + 10, y + 4, w - 20, 12,
                  text, 10, 700, txt_c, fid, fid, uppercase=True), pid))
    return x + w


# ═══════════════════════════════════════════
# PAGE 1: 07-RoleForm-Edit
# ═══════════════════════════════════════════

page1_id = uid()
frame1_id = uid()

changes_p1_setup = [add_page_change(page1_id, "07-RoleForm-Edit")]
send_changes(changes_p1_setup, "Page 07-RoleForm-Edit")

changes_p1 = []

# Main frame
changes_p1.append(add_obj(frame1_id, ROOT, ROOT,
    make_frame(frame1_id, "07-RoleForm-Edit", 0, 0, 1440, 900, BG_PAGE), page1_id))

# Topbar
build_topbar(changes_p1, frame1_id, page1_id, breadcrumb_last="Editar")

# Sidebar
build_sidebar(changes_p1, frame1_id, page1_id)

# ContentArea
build_content_area(changes_p1, frame1_id, page1_id)

# Send shell (topbar + sidebar + content bg)
send_changes(changes_p1, "Edit: AppShell")

# Content elements
changes_p1c = []
fid = frame1_id
pid = page1_id

# Content starts at x=272 (240 sidebar + 32 padding), y=96 (64 topbar + 32 padding)
cx = 272
cy = 96

# BackLink
build_back_link(changes_p1c, fid, pid, cx, cy)
cy += 32  # 16px margin-bottom + 16px

# PageHeader title row with badge
title = uid()
changes_p1c.append(add_obj(title, fid, fid,
    make_text(title, "PageTitle", cx, cy, 200, 34, "Editar Perfil", 28, 800, T1, fid, fid,
              letter_spacing=-1), pid))
build_badge(changes_p1c, fid, pid, cx + 210, cy + 4, "ATIVO", "active")
cy += 38

# Description
desc = uid()
changes_p1c.append(add_obj(desc, fid, fid,
    make_text(desc, "PageDesc", cx, cy, 400, 18, "Altere as propriedades e permissões deste perfil.", 14, 400, T4, fid, fid), pid))
cy += 30

# FormCard background
card_x = cx
card_y = cy
card_w = 720
# We'll calculate total card height later, estimate ~700px for edit mode
card_h = 740

card = uid()
changes_p1c.append(add_obj(card, fid, fid,
    make_rect(card, "FormCard", card_x, card_y, card_w, card_h, WHITE, fid, fid,
              radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

# Inside card: padding 32px
fx = card_x + 32
fy = card_y + 32
fw = card_w - 64  # 656px

# NOME field
fy = build_form_field(changes_p1c, fid, pid, fx, fy, fw, "NOME", value_text="Super Administrador")
fy += 20  # margin between fields

# DESCRIÇÃO textarea
fy = build_textarea_field(changes_p1c, fid, pid, fx, fy, fw, "DESCRIÇÃO",
    value_text="Acesso total a todos os módulos do sistema. Perfil destinado a administradores com controle completo.")
fy += 20

# Toggle STATUS
fy = build_toggle(changes_p1c, fid, pid, fx, fy, is_on=True)
fy += 28  # margin before separator

# Separator
build_separator(changes_p1c, fid, pid, fx, fy, fw)
fy += 29  # 1px + 28px margin

send_changes(changes_p1c, "Edit: Content top")

# Scopes section
changes_p1s = []

# Section header
sec_label = uid()
changes_p1s.append(add_obj(sec_label, fid, fid,
    make_text(sec_label, "ScopeSectionLabel", fx, fy, 200, 12, "ESCOPOS E PERMISSÕES", 11, 700, T4, fid, fid,
              uppercase=True, letter_spacing=1), pid))
scope_count = uid()
changes_p1s.append(add_obj(scope_count, fid, fid,
    make_text(scope_count, "ScopeCount", fx + fw - 150, fy, 150, 14, "24 escopos atribuídos", 12, 500, T4, fid, fid), pid))
fy += 28

# Scope chips
fy = build_scope_chips(changes_p1s, fid, pid, fx, fy, fw, SCOPES)
fy += 16

send_changes(changes_p1s, "Edit: Scope chips")

# Add scope row + info + footer
changes_p1f = []

# Add scope row
fy = build_add_scope_row(changes_p1f, fid, pid, fx, fy, fw)
fy += 16

# InfoBox
fy = build_info_box(changes_p1f, fid, pid, fx, fy, fw)
fy += 28

# Separator
build_separator(changes_p1f, fid, pid, fx, fy, fw)
fy += 29

# Footer buttons
btn_save = uid()
changes_p1f.append(add_obj(btn_save, fid, fid,
    make_rect(btn_save, "BtnSalvar", fx, fy, 160, 44, BLUE, fid, fid, radius=8), pid))
btn_save_txt = uid()
changes_p1f.append(add_obj(btn_save_txt, fid, fid,
    make_text(btn_save_txt, "BtnSalvarText", fx + 20, fy + 13, 120, 18, "Salvar Alterações", 13, 700, WHITE, fid, fid), pid))

btn_cancel = uid()
changes_p1f.append(add_obj(btn_cancel, fid, fid,
    make_rect(btn_cancel, "BtnCancelar", fx + 172, fy, 100, 44, WHITE, fid, fid,
              radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
btn_cancel_txt = uid()
changes_p1f.append(add_obj(btn_cancel_txt, fid, fid,
    make_text(btn_cancel_txt, "BtnCancelarText", fx + 192, fy + 13, 60, 18, "Cancelar", 13, 600, T3, fid, fid), pid))

send_changes(changes_p1f, "Edit: Footer")

print("\n--- Page 1 (Edit) complete ---\n")


# ═══════════════════════════════════════════
# PAGE 2: 07-RoleForm-Create
# ═══════════════════════════════════════════

page2_id = uid()
frame2_id = uid()

changes_p2_setup = [add_page_change(page2_id, "07-RoleForm-Create")]
send_changes(changes_p2_setup, "Page 07-RoleForm-Create")

changes_p2 = []

# Main frame
changes_p2.append(add_obj(frame2_id, ROOT, ROOT,
    make_frame(frame2_id, "07-RoleForm-Create", 0, 0, 1440, 900, BG_PAGE), page2_id))

# Topbar
build_topbar(changes_p2, frame2_id, page2_id, breadcrumb_last="Novo")

# Sidebar
build_sidebar(changes_p2, frame2_id, page2_id)

# ContentArea
build_content_area(changes_p2, frame2_id, page2_id)

send_changes(changes_p2, "Create: AppShell")

# Content elements
changes_p2c = []
fid = frame2_id
pid = page2_id

cx = 272
cy = 96

# BackLink
build_back_link(changes_p2c, fid, pid, cx, cy)
cy += 32

# PageHeader (no badge)
title = uid()
changes_p2c.append(add_obj(title, fid, fid,
    make_text(title, "PageTitle", cx, cy, 200, 34, "Novo Perfil", 28, 800, T1, fid, fid,
              letter_spacing=-1), pid))
cy += 38

# Description
desc = uid()
changes_p2c.append(add_obj(desc, fid, fid,
    make_text(desc, "PageDesc", cx, cy, 450, 18, "Defina o nome, descrição e permissões do novo perfil.", 14, 400, T4, fid, fid), pid))
cy += 30

# FormCard
card_x = cx
card_y = cy
card_w = 720
card_h = 560  # shorter since no scopes and no toggle

card = uid()
changes_p2c.append(add_obj(card, fid, fid,
    make_rect(card, "FormCard", card_x, card_y, card_w, card_h, WHITE, fid, fid,
              radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

fx = card_x + 32
fy = card_y + 32
fw = card_w - 64

# NOME field (empty)
fy = build_form_field(changes_p2c, fid, pid, fx, fy, fw, "NOME", placeholder="Nome do perfil")
fy += 20

# DESCRIÇÃO textarea (empty)
fy = build_textarea_field(changes_p2c, fid, pid, fx, fy, fw, "DESCRIÇÃO",
    placeholder="Descreva as responsabilidades e o nível de acesso deste perfil...")
fy += 28

# Separator (no toggle in create mode)
build_separator(changes_p2c, fid, pid, fx, fy, fw)
fy += 29

# Section header
sec_label = uid()
changes_p2c.append(add_obj(sec_label, fid, fid,
    make_text(sec_label, "ScopeSectionLabel", fx, fy, 200, 12, "ESCOPOS E PERMISSÕES", 11, 700, T4, fid, fid,
              uppercase=True, letter_spacing=1), pid))
scope_count = uid()
changes_p2c.append(add_obj(scope_count, fid, fid,
    make_text(scope_count, "ScopeCount", fx + fw - 150, fy, 150, 14, "0 escopos atribuídos", 12, 500, T4, fid, fid), pid))
fy += 28

send_changes(changes_p2c, "Create: Content top")

# Empty scopes + add row + info + footer
changes_p2f = []

# Empty state
fy = build_empty_scopes(changes_p2f, fid, pid, fx, fy, fw)
fy += 16

# Add scope row
fy = build_add_scope_row(changes_p2f, fid, pid, fx, fy, fw)
fy += 16

# InfoBox
fy = build_info_box(changes_p2f, fid, pid, fx, fy, fw)
fy += 28

# Separator
build_separator(changes_p2f, fid, pid, fx, fy, fw)
fy += 29

# Footer buttons
btn_create = uid()
changes_p2f.append(add_obj(btn_create, fid, fid,
    make_rect(btn_create, "BtnCriar", fx, fy, 130, 44, BLUE, fid, fid, radius=8), pid))
btn_create_txt = uid()
changes_p2f.append(add_obj(btn_create_txt, fid, fid,
    make_text(btn_create_txt, "BtnCriarText", fx + 20, fy + 13, 90, 18, "Criar Perfil", 13, 700, WHITE, fid, fid), pid))

btn_cancel = uid()
changes_p2f.append(add_obj(btn_cancel, fid, fid,
    make_rect(btn_cancel, "BtnCancelar", fx + 142, fy, 100, 44, WHITE, fid, fid,
              radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
btn_cancel_txt = uid()
changes_p2f.append(add_obj(btn_cancel_txt, fid, fid,
    make_text(btn_cancel_txt, "BtnCancelarText", fx + 162, fy + 13, 60, 18, "Cancelar", 13, 600, T3, fid, fid), pid))

send_changes(changes_p2f, "Create: Footer")

print("\n--- Page 2 (Create) complete ---")
print("\nAll done! 2 pages created in Penpot sandbox.")
