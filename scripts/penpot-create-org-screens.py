"""
Create 10-OrgTree and 11-OrgForm screens in Penpot Sandbox.
Uses transit+json REST API. Based on 10-org-tree-spec.md and 11-org-form-spec.md.

Pages:
  10-OrgTree            — Split-panel: tree 380px + detail flex
  11-OrgForm-Edit       — FormPanel 480px replaces tree + detail visible
  11-OrgForm-Create     — FormPanel 480px create mode + detail visible
  11-OrgForm-Deactivate — Modal overlay over OrgTree
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
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"
RED = "#E74C3C"
INFO_BG = "#F0F8FF"
INFO_TEXT = "#2E86C1"
GREEN = "#27AE60"
GREEN_BG = "#E8F8EF"
GREEN_BD = "#B5E8C9"
GREEN_TXT = "#1E7A42"
RO_BG = "#F8F8F6"
RO_BORDER = "#F0F0EE"
WARN_BG = "#FFF3E0"
WARN_TXT = "#B8860B"
ALERT_BG = "#FFEBEE"

T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"

# Sidebar items for Org context
SIDEBAR_ADMIN = [
    ("Usuarios", False),
    ("Perfis e Permissoes", False),
]
SIDEBAR_ORG = [
    ("Estrutura Org.", True),
]
SIDEBAR_PROC = [
    ("Modelagem", False),
]


# ═══════════════════════════════════════════
# SHARED BUILDERS
# ═══════════════════════════════════════════

def build_topbar(changes, frame_id, page_id):
    """Topbar with Org breadcrumb."""
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

    # Breadcrumb: Organizacao > Estrutura Organizacional
    bx = 201
    bc1 = uid()
    changes.append(add_obj(bc1, fid, fid,
        make_text(bc1, "BC-Org", bx, 24, 80, 16, "Organização", 13, 400, T4, fid, fid), pid))
    bx += 84
    bcs = uid()
    changes.append(add_obj(bcs, fid, fid,
        make_text(bcs, "BC-Sep", bx, 24, 10, 16, "›", 13, 400, T6, fid, fid), pid))
    bx += 14
    bc2 = uid()
    changes.append(add_obj(bc2, fid, fid,
        make_text(bc2, "BC-Est", bx, 24, 180, 16, "Estrutura Organizacional", 13, 700, T1, fid, fid), pid))

    # Right side: Admin ECF / A1 Engenharia + Avatar
    un = uid()
    changes.append(add_obj(un, fid, fid,
        make_text(un, "TopbarUser", 1290, 16, 100, 15, "Admin ECF", 12, 700, T1, fid, fid), pid))
    ue = uid()
    changes.append(add_obj(ue, fid, fid,
        make_text(ue, "TopbarEmpresa", 1290, 34, 100, 14, "A1 Engenharia", 10, 400, T4, fid, fid), pid))

    # Avatar
    av_bg = uid()
    changes.append(add_obj(av_bg, fid, fid,
        make_rect(av_bg, "AvatarBG", 1394, 12, 40, 40, "#F0F0EE", fid, fid, radius=20,
                  strokes=stroke_border(BORDER, 2, "inner")), pid))
    av_txt = uid()
    changes.append(add_obj(av_txt, fid, fid,
        make_text(av_txt, "AvatarText", 1402, 20, 24, 16, "AE", 13, 700, T3, fid, fid), pid))


def build_sidebar(changes, frame_id, page_id):
    """Sidebar with Org variant: Estrutura Org. active, footer with green dot."""
    fid = frame_id
    pid = page_id

    sb_bg = uid()
    changes.append(add_obj(sb_bg, fid, fid,
        make_rect(sb_bg, "SidebarBG", 0, 64, 240, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # ADMINISTRACAO
    cat1 = uid()
    changes.append(add_obj(cat1, fid, fid,
        make_text(cat1, "Cat-Admin", 28, 88, 200, 12, "ADMINISTRAÇÃO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))

    y = 108
    for label, active in SIDEBAR_ADMIN:
        mid = uid()
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # ORGANIZACAO
    y += 12
    cat2 = uid()
    changes.append(add_obj(cat2, fid, fid,
        make_text(cat2, "Cat-Org", 28, y, 200, 12, "ORGANIZAÇÃO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 20

    for label, active in SIDEBAR_ORG:
        mid = uid()
        if active:
            bg_id = uid()
            changes.append(add_obj(bg_id, fid, fid,
                make_rect(bg_id, f"MenuBG-{label}", 16, y, 208, 40, BLUE_LT, fid, fid, radius=6), pid))
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, BLUE, fid, fid, opacity=0.4, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 700, BLUE, fid, fid), pid))
        else:
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # PROCESSOS
    y += 12
    cat3 = uid()
    changes.append(add_obj(cat3, fid, fid,
        make_text(cat3, "Cat-Processos", 28, y, 200, 12, "PROCESSOS", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 20

    for label, active in SIDEBAR_PROC:
        mid = uid()
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y + 11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y + 10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    # Footer: green dot + "Servidor Online"
    foot_border = uid()
    changes.append(add_obj(foot_border, fid, fid,
        make_rect(foot_border, "SidebarFootBorder", 0, 864, 240, 1, BORDER, fid, fid), pid))
    dot = uid()
    changes.append(add_obj(dot, fid, fid,
        make_rect(dot, "GreenDot", 28, 884, 8, 8, GREEN, fid, fid, radius=4), pid))
    ftxt = uid()
    changes.append(add_obj(ftxt, fid, fid,
        make_text(ftxt, "ServerOnline", 44, 880, 120, 16, "Servidor Online", 12, 400, T4, fid, fid), pid))


def build_readonly_field(changes, fid, pid, x, y, w, label_text, value_text):
    """ReadOnly field with subtle bg. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"ROLabel-{label_text}", x, y, w, 12, label_text, 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    vy = y + 18
    vid = uid()
    changes.append(add_obj(vid, fid, fid,
        make_rect(vid, f"ROBg-{label_text}", x, vy, w, 42, RO_BG, fid, fid,
                  radius=8, strokes=stroke_border(RO_BORDER, 1, "inner")), pid))
    vt = uid()
    changes.append(add_obj(vt, fid, fid,
        make_text(vt, f"ROVal-{label_text}", x + 14, vy + 11, w - 28, 20,
                  value_text, 14, 500, T1, fid, fid), pid))
    return vy + 42


def build_readonly_field_locked(changes, fid, pid, x, y, w, label_text, value_text):
    """ReadOnly field with lock icon for form panels. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"ROLabel-{label_text}", x, y, w, 14, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    vy = y + 22
    vid = uid()
    changes.append(add_obj(vid, fid, fid,
        make_rect(vid, f"ROBg-{label_text}", x, vy, w, 42, RO_BG, fid, fid,
                  radius=8, strokes=stroke_border(RO_BORDER, 1, "inner")), pid))
    vt = uid()
    changes.append(add_obj(vt, fid, fid,
        make_text(vt, f"ROVal-{label_text}", x + 14, vy + 11, w - 42, 20,
                  value_text, 14, 500, T1, fid, fid), pid))
    # Lock icon (small rect placeholder)
    lock = uid()
    changes.append(add_obj(lock, fid, fid,
        make_rect(lock, f"Lock-{label_text}", x + w - 26, vy + 14, 14, 14, T5, fid, fid,
                  opacity=0.5, radius=2), pid))
    return vy + 42


def build_form_input(changes, fid, pid, x, y, w, label_text, value_text, is_placeholder=True):
    """Editable form field. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 14, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    iy = y + 22
    iid = uid()
    changes.append(add_obj(iid, fid, fid,
        make_rect(iid, f"Input-{label_text}", x, iy, w, 48, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))
    vid = uid()
    color = T6 if is_placeholder else T1
    changes.append(add_obj(vid, fid, fid,
        make_text(vid, f"Value-{label_text}", x + 14, iy + 14, w - 28, 20,
                  value_text, 14, 400, color, fid, fid), pid))
    return iy + 48


def build_detail_panel(changes, frame_id, page_id, x_offset=620,
                       edit_btn_disabled=False, new_btn_disabled=False):
    """Build the full detail panel (header + dados + tags + metrics).
    x_offset: left edge of detail panel (620 for tree, 720 for form).
    """
    fid = frame_id
    pid = page_id
    dx = x_offset  # detail panel x start
    dw = 1440 - dx  # available width
    pad = 24

    # Detail panel background
    dp_bg = uid()
    changes.append(add_obj(dp_bg, fid, fid,
        make_rect(dp_bg, "DetailPanelBG", dx, 64, dw, 836, BG_PAGE, fid, fid), pid))

    # ── Header Card ──
    hx = dx + pad
    hy = 64 + pad
    hw = dw - pad * 2

    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "DetailHeaderBG", hx, hy, hw, 90, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Building icon bg
    ico_bg = uid()
    changes.append(add_obj(ico_bg, fid, fid,
        make_rect(ico_bg, "BuildingIconBG", hx + 20, hy + 20, 48, 48, BG_PAGE, fid, fid, radius=10), pid))
    # Building icon placeholder
    ico = uid()
    changes.append(add_obj(ico, fid, fid,
        make_rect(ico, "BuildingIcon", hx + 32, hy + 32, 24, 24, T4, fid, fid, opacity=0.3, radius=2), pid))

    # Name
    nm = uid()
    changes.append(add_obj(nm, fid, fid,
        make_text(nm, "DetailName", hx + 84, hy + 18, 300, 30, "A1 Engenharia", 24, 800, T1, fid, fid,
                  line_height=1.2), pid))

    # Badge ATIVO
    badge_bg = uid()
    changes.append(add_obj(badge_bg, fid, fid,
        make_rect(badge_bg, "BadgeActiveBG", hx + 84, hy + 52, 52, 20, GREEN_BG, fid, fid,
                  radius=10, strokes=stroke_border(GREEN_BD, 1, "inner")), pid))
    badge_txt = uid()
    changes.append(add_obj(badge_txt, fid, fid,
        make_text(badge_txt, "BadgeActiveText", hx + 92, hy + 55, 36, 12, "ATIVO", 10, 700, GREEN_TXT, fid, fid,
                  uppercase=True, letter_spacing=0.3), pid))

    # Code
    code = uid()
    changes.append(add_obj(code, fid, fid,
        make_text(code, "DetailCode", hx + 144, hy + 55, 100, 14, "Cód: UN-0012", 12, 400, T4, fid, fid), pid))

    # Buttons (right side)
    btn_right_edge = hx + hw - 20

    # Primary button: + Nova Subdivisao
    nova_w = 160
    nova_x = btn_right_edge - nova_w
    nova_bg = uid()
    nova_fill = BLUE
    nova_opacity = 0.4 if new_btn_disabled else 1
    changes.append(add_obj(nova_bg, fid, fid,
        make_rect(nova_bg, "BtnNovaBG", nova_x, hy + 25, nova_w, 40, nova_fill, fid, fid,
                  radius=8, opacity=nova_opacity), pid))
    nova_txt = uid()
    changes.append(add_obj(nova_txt, fid, fid,
        make_text(nova_txt, "BtnNovaText", nova_x + 12, hy + 35, nova_w - 24, 18,
                  "+ Nova Subdivisão", 13, 700, WHITE, fid, fid,
                  text_opacity=nova_opacity), pid))

    # Secondary button: Editar Dados
    edit_w = 130
    edit_x = nova_x - edit_w - 12
    edit_bg = uid()
    edit_opacity = 0.4 if edit_btn_disabled else 1
    changes.append(add_obj(edit_bg, fid, fid,
        make_rect(edit_bg, "BtnEditarBG", edit_x, hy + 25, edit_w, 40, WHITE, fid, fid,
                  radius=8, opacity=edit_opacity,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))
    # Pencil icon placeholder
    pencil = uid()
    changes.append(add_obj(pencil, fid, fid,
        make_rect(pencil, "PencilIcon", edit_x + 14, hy + 37, 16, 16, T3, fid, fid,
                  opacity=0.3 * edit_opacity, radius=2), pid))
    edit_txt = uid()
    changes.append(add_obj(edit_txt, fid, fid,
        make_text(edit_txt, "BtnEditarText", edit_x + 36, hy + 35, edit_w - 50, 18,
                  "Editar Dados", 13, 600, T3, fid, fid,
                  text_opacity=edit_opacity), pid))

    # ── Dados Cadastrais Card ──
    cy = hy + 90 + 20
    card_x = hx
    card_w = hw

    dc_bg = uid()
    changes.append(add_obj(dc_bg, fid, fid,
        make_rect(dc_bg, "DadosCadBG", card_x, cy, card_w, 280, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Section label
    sl = uid()
    changes.append(add_obj(sl, fid, fid,
        make_text(sl, "SecDadosCad", card_x + 24, cy + 24, 200, 12, "DADOS CADASTRAIS", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))

    # Row 1: CNPJ + Razao Social
    fy = cy + 52
    col_w = (card_w - 24 * 2 - 16) // 2
    build_readonly_field(changes, fid, pid, card_x + 24, fy, col_w, "CNPJ", "12.345.678/0001-90")
    build_readonly_field(changes, fid, pid, card_x + 24 + col_w + 16, fy, col_w, "RAZÃO SOCIAL", "A1 Engenharia e Construções Civis Ltda")

    # Row 2: Filial + Responsavel + Telefone
    fy += 76
    col_w3 = (card_w - 24 * 2 - 16 * 2) // 3
    build_readonly_field(changes, fid, pid, card_x + 24, fy, col_w3, "FILIAL", "São Paulo - SP")
    build_readonly_field(changes, fid, pid, card_x + 24 + col_w3 + 16, fy, col_w3, "RESPONSÁVEL", "Marcos Silva")
    build_readonly_field(changes, fid, pid, card_x + 24 + (col_w3 + 16) * 2, fy, col_w3, "TELEFONE", "(11) 3456-7890")

    # Row 3: Email
    fy += 76
    build_readonly_field(changes, fid, pid, card_x + 24, fy, card_w - 48, "E-MAIL DE CONTATO", "contato@a1engenharia.com.br")

    # ── Departamentos Card ──
    cy2 = cy + 280 + 20

    dept_bg = uid()
    changes.append(add_obj(dept_bg, fid, fid,
        make_rect(dept_bg, "DeptCardBG", card_x, cy2, card_w, 120, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

    dl = uid()
    changes.append(add_obj(dl, fid, fid,
        make_text(dl, "SecDept", card_x + 24, cy2 + 24, 250, 12, "DEPARTAMENTOS VINCULADOS", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))
    # "Ver todos (12)" link
    vt_link = uid()
    changes.append(add_obj(vt_link, fid, fid,
        make_text(vt_link, "VerTodos", card_x + card_w - 120, cy2 + 24, 96, 14, "Ver todos (12)", 12, 600, BLUE, fid, fid), pid))

    # Tags
    tags = ["Diretoria", "Engenharia Civil", "Projetos Especiais", "Recursos Humanos", "Jurídico"]
    tx = card_x + 24
    ty = cy2 + 52
    for tag_text in tags:
        tw = len(tag_text) * 8 + 32
        tbg = uid()
        changes.append(add_obj(tbg, fid, fid,
            make_rect(tbg, f"Tag-{tag_text}", tx, ty, tw, 36, WHITE, fid, fid,
                      radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
        tt = uid()
        changes.append(add_obj(tt, fid, fid,
            make_text(tt, f"TagText-{tag_text}", tx + 16, ty + 9, tw - 32, 18,
                      tag_text, 13, 500, T2, fid, fid), pid))
        tx += tw + 8

    # "+ Novo Departamento" dashed tag
    add_tw = 170
    if tx + add_tw > card_x + card_w - 24:
        tx = card_x + 24
        ty += 44
    add_bg = uid()
    changes.append(add_obj(add_bg, fid, fid,
        make_rect(add_bg, "TagAdd", tx, ty, add_tw, 36, WHITE, fid, fid,
                  radius=6, strokes=stroke_dashed(T6, 1, "inner")), pid))
    add_txt = uid()
    changes.append(add_obj(add_txt, fid, fid,
        make_text(add_txt, "TagAddText", tx + 16, ty + 9, add_tw - 32, 18,
                  "+ Novo Departamento", 13, 400, T4, fid, fid), pid))

    # ── Metric Cards ──
    cy3 = cy2 + 120 + 20
    mc_w = (card_w - 20) // 2

    # Card azul: Colaboradores Totais
    mc_blue_bg = uid()
    changes.append(add_obj(mc_blue_bg, fid, fid,
        make_rect(mc_blue_bg, "MCBlueBG", card_x, cy3, mc_w, 140, BLUE, fid, fid, radius=16), pid))
    mcb_label = uid()
    changes.append(add_obj(mcb_label, fid, fid,
        make_text(mcb_label, "MCBlueLabel", card_x + 24, cy3 + 24, mc_w - 48, 12,
                  "COLABORADORES TOTAIS", 10, 700, WHITE, fid, fid,
                  uppercase=True, letter_spacing=1, text_opacity=0.8), pid))
    mcb_val = uid()
    changes.append(add_obj(mcb_val, fid, fid,
        make_text(mcb_val, "MCBlueVal", card_x + 24, cy3 + 44, mc_w - 48, 40,
                  "156", 36, 800, WHITE, fid, fid), pid))
    mcb_sub = uid()
    changes.append(add_obj(mcb_sub, fid, fid,
        make_text(mcb_sub, "MCBlueSub", card_x + 24, cy3 + 92, mc_w - 48, 14,
                  "14 novos nos últimos 30 dias", 11, 400, WHITE, fid, fid,
                  text_opacity=0.7), pid))
    # Decorative circles
    deco1 = uid()
    changes.append(add_obj(deco1, fid, fid,
        make_rect(deco1, "DecoCircle1", card_x + mc_w - 60, cy3 + 60, 70, 70, WHITE, fid, fid,
                  opacity=0.08, radius=35), pid))
    deco2 = uid()
    changes.append(add_obj(deco2, fid, fid,
        make_rect(deco2, "DecoCircle2", card_x + mc_w - 30, cy3 + 40, 70, 70, WHITE, fid, fid,
                  opacity=0.08, radius=35), pid))

    # Card branco: Projetos em Execucao
    mc_wx = card_x + mc_w + 20
    mc_white_bg = uid()
    changes.append(add_obj(mc_white_bg, fid, fid,
        make_rect(mc_white_bg, "MCWhiteBG", mc_wx, cy3, mc_w, 140, WHITE, fid, fid,
                  radius=16, strokes=stroke_border(BORDER, 1, "inner")), pid))
    mcw_label = uid()
    changes.append(add_obj(mcw_label, fid, fid,
        make_text(mcw_label, "MCWhiteLabel", mc_wx + 24, cy3 + 24, mc_w - 48, 12,
                  "PROJETOS EM EXECUÇÃO", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))
    mcw_val = uid()
    changes.append(add_obj(mcw_val, fid, fid,
        make_text(mcw_val, "MCWhiteVal", mc_wx + 24, cy3 + 44, mc_w - 48, 40,
                  "28", 36, 800, T1, fid, fid), pid))

    # Progress bar
    pb_y = cy3 + 96
    pb_w = mc_w - 48
    pb_bg_id = uid()
    changes.append(add_obj(pb_bg_id, fid, fid,
        make_rect(pb_bg_id, "ProgressBarBG", mc_wx + 24, pb_y, pb_w, 6, BORDER, fid, fid, radius=3), pid))
    pb_fill = uid()
    fill_w = int(pb_w * 0.7)
    changes.append(add_obj(pb_fill, fid, fid,
        make_rect(pb_fill, "ProgressBarFill", mc_wx + 24, pb_y, fill_w, 6, BLUE, fid, fid, radius=3), pid))
    pb_label = uid()
    changes.append(add_obj(pb_label, fid, fid,
        make_text(pb_label, "ProgressLabel", mc_wx + 24 + pb_w - 60, pb_y + 10, 60, 14,
                  "70% Meta", 11, 400, T4, fid, fid), pid))


def build_tree_panel(changes, frame_id, page_id):
    """Build the tree panel (380px) with title, search, and tree nodes."""
    fid = frame_id
    pid = page_id
    tx = 240  # starts after sidebar
    tw = 380
    pad = 20

    # Panel background
    tp_bg = uid()
    changes.append(add_obj(tp_bg, fid, fid,
        make_rect(tp_bg, "TreePanelBG", tx, 64, tw, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    ix = tx + pad
    iy = 64 + pad
    iw = tw - pad * 2  # 340

    # Title
    title = uid()
    changes.append(add_obj(title, fid, fid,
        make_text(title, "TreeTitle", ix, iy, iw, 20, "Estrutura de Unidades", 16, 800, T1, fid, fid), pid))
    desc = uid()
    changes.append(add_obj(desc, fid, fid,
        make_text(desc, "TreeDesc", ix, iy + 24, iw, 16, "Navegue pela hierarquia do grupo", 12, 400, T4, fid, fid), pid))

    # Search bar
    sy = iy + 24 + 16 + 16
    search_bg = uid()
    changes.append(add_obj(search_bg, fid, fid,
        make_rect(search_bg, "SearchBG", ix, sy, iw, 40, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    # Search icon placeholder
    search_ico = uid()
    changes.append(add_obj(search_ico, fid, fid,
        make_rect(search_ico, "SearchIcon", ix + 12, sy + 12, 16, 16, T6, fid, fid, opacity=0.5, radius=8), pid))
    search_txt = uid()
    changes.append(add_obj(search_txt, fid, fid,
        make_text(search_txt, "SearchPlaceholder", ix + 38, sy + 11, iw - 52, 18,
                  "Buscar unidade ou depto...", 13, 400, T6, fid, fid), pid))

    # ── Tree Nodes ──
    ny = sy + 40 + 16

    # Back icon (small rect placeholder) + Building icon + "Grupo A1"
    back_ico = uid()
    changes.append(add_obj(back_ico, fid, fid,
        make_rect(back_ico, "BackIcon", ix, ny + 2, 14, 14, T4, fid, fid, opacity=0.4, radius=2), pid))
    root_bld = uid()
    changes.append(add_obj(root_bld, fid, fid,
        make_rect(root_bld, "RootBuilding", ix + 22, ny, 16, 16, T4, fid, fid, opacity=0.3, radius=2), pid))
    root_name = uid()
    changes.append(add_obj(root_name, fid, fid,
        make_text(root_name, "RootName", ix + 46, ny - 1, 200, 20, "Grupo A1", 14, 700, T1, fid, fid), pid))

    # Expanded children (ml:24)
    cx = ix + 24
    ny += 26

    # Selected node: A1 Engenharia
    sel_bg = uid()
    changes.append(add_obj(sel_bg, fid, fid,
        make_rect(sel_bg, "SelNodeBG", cx, ny, iw - 24, 36, BLUE_LT, fid, fid, radius=6), pid))
    # Chevron (rotated down)
    sel_chev = uid()
    changes.append(add_obj(sel_chev, fid, fid,
        make_rect(sel_chev, "SelChevron", cx + 12, ny + 12, 12, 12, BLUE, fid, fid, opacity=0.5, radius=2), pid))
    sel_bld = uid()
    changes.append(add_obj(sel_bld, fid, fid,
        make_rect(sel_bld, "SelBuilding", cx + 32, ny + 10, 16, 16, BLUE, fid, fid, opacity=0.4, radius=2), pid))
    sel_name = uid()
    changes.append(add_obj(sel_name, fid, fid,
        make_text(sel_name, "SelNodeName", cx + 56, ny + 9, 200, 18, "A1 Engenharia", 13, 700, BLUE, fid, fid), pid))

    # Children leaves
    ny += 40
    children = ["Diretoria", "Engenharia Civil", "Projetos Especiais"]
    for child in children:
        # Dot
        dot = uid()
        changes.append(add_obj(dot, fid, fid,
            make_rect(dot, f"Dot-{child}", cx + 44, ny + 6, 8, 8, T4, fid, fid, radius=4), pid))
        # Name
        cn = uid()
        changes.append(add_obj(cn, fid, fid,
            make_text(cn, f"Child-{child}", cx + 60, ny, 200, 18, child, 13, 400, T3, fid, fid), pid))
        ny += 26

    # Collapsed node: A1 Industrial
    ny += 8
    ind_chev = uid()
    changes.append(add_obj(ind_chev, fid, fid,
        make_rect(ind_chev, "IndChevron", cx + 12, ny + 4, 12, 12, T4, fid, fid, opacity=0.4, radius=2), pid))
    ind_bld = uid()
    changes.append(add_obj(ind_bld, fid, fid,
        make_rect(ind_bld, "IndBuilding", cx + 32, ny + 2, 16, 16, T4, fid, fid, opacity=0.3, radius=2), pid))
    ind_name = uid()
    changes.append(add_obj(ind_name, fid, fid,
        make_text(ind_name, "IndNodeName", cx + 56, ny + 1, 200, 18, "A1 Industrial", 13, 500, T3, fid, fid), pid))

    # Collapsed node: A1 Energia
    ny += 28
    en_chev = uid()
    changes.append(add_obj(en_chev, fid, fid,
        make_rect(en_chev, "EnChevron", cx + 12, ny + 4, 12, 12, T4, fid, fid, opacity=0.4, radius=2), pid))
    en_bld = uid()
    changes.append(add_obj(en_bld, fid, fid,
        make_rect(en_bld, "EnBuilding", cx + 32, ny + 2, 16, 16, T4, fid, fid, opacity=0.3, radius=2), pid))
    en_name = uid()
    changes.append(add_obj(en_name, fid, fid,
        make_text(en_name, "EnNodeName", cx + 56, ny + 1, 200, 18, "A1 Energia", 13, 500, T3, fid, fid), pid))


def build_form_panel_header(changes, fid, pid, x, y, w, title_text):
    """Build FormPanel header: back arrow + title + close X. Returns bottom y."""
    # Header background
    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "FormHeaderBG", x, y, w, 64, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Back arrow placeholder
    back = uid()
    changes.append(add_obj(back, fid, fid,
        make_rect(back, "BtnBack", x + 20, y + 16, 32, 32, WHITE, fid, fid, radius=6), pid))
    back_ico = uid()
    changes.append(add_obj(back_ico, fid, fid,
        make_text(back_ico, "BackArrow", x + 27, y + 20, 18, 20, "←", 18, 400, T4, fid, fid), pid))

    # Title
    title = uid()
    changes.append(add_obj(title, fid, fid,
        make_text(title, "FormTitle", x + 64, y + 22, w - 128, 22, title_text, 18, 700, T1, fid, fid), pid))

    # Close X button
    close_bg = uid()
    changes.append(add_obj(close_bg, fid, fid,
        make_rect(close_bg, "BtnClose", x + w - 52, y + 16, 32, 32, WHITE, fid, fid, radius=6), pid))
    close_ico = uid()
    changes.append(add_obj(close_ico, fid, fid,
        make_text(close_ico, "CloseX", x + w - 45, y + 20, 18, 20, "×", 18, 400, T4, fid, fid), pid))

    return y + 64


def build_form_panel_footer(changes, fid, pid, x, y, w, primary_text="Salvar"):
    """Build FormPanel footer with Cancelar + primary button."""
    # Footer background
    ftr_bg = uid()
    changes.append(add_obj(ftr_bg, fid, fid,
        make_rect(ftr_bg, "FormFooterBG", x, y, w, 72, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Primary button (right)
    pri_w = len(primary_text) * 9 + 48
    pri_x = x + w - 24 - pri_w
    pri_bg = uid()
    changes.append(add_obj(pri_bg, fid, fid,
        make_rect(pri_bg, "BtnPrimaryBG", pri_x, y + 14, pri_w, 44, BLUE, fid, fid, radius=8), pid))
    pri_txt = uid()
    changes.append(add_obj(pri_txt, fid, fid,
        make_text(pri_txt, "BtnPrimaryText", pri_x + 12, y + 27, pri_w - 24, 18,
                  primary_text, 13, 700, WHITE, fid, fid), pid))

    # Cancel button
    can_w = 100
    can_x = pri_x - can_w - 12
    can_bg = uid()
    changes.append(add_obj(can_bg, fid, fid,
        make_rect(can_bg, "BtnCancelBG", can_x, y + 14, can_w, 44, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    can_txt = uid()
    changes.append(add_obj(can_txt, fid, fid,
        make_text(can_txt, "BtnCancelText", can_x + 12, y + 27, can_w - 24, 18,
                  "Cancelar", 13, 600, T3, fid, fid), pid))


# ═══════════════════════════════════════════
# PAGE 1: 10-OrgTree
# ═══════════════════════════════════════════

print("\n-- Page 1: 10-OrgTree --")
page1_id = uid()
frame1_id = uid()

changes1 = [
    add_page_change(page1_id, "10-OrgTree"),
    add_obj(frame1_id, ROOT, ROOT,
        make_frame(frame1_id, "10-OrgTree", 0, 0, 1440, 900, BG_PAGE), page1_id),
]

build_topbar(changes1, frame1_id, page1_id)
build_sidebar(changes1, frame1_id, page1_id)
build_tree_panel(changes1, frame1_id, page1_id)
build_detail_panel(changes1, frame1_id, page1_id, x_offset=620)

send_changes(changes1, "Page 10-OrgTree")


# ═══════════════════════════════════════════
# PAGE 2: 11-OrgForm-Edit
# ═══════════════════════════════════════════

print("\n-- Page 2: 11-OrgForm-Edit --")
page2_id = uid()
frame2_id = uid()

changes2 = [
    add_page_change(page2_id, "11-OrgForm-Edit"),
    add_obj(frame2_id, ROOT, ROOT,
        make_frame(frame2_id, "11-OrgForm-Edit", 0, 0, 1440, 900, BG_PAGE), page2_id),
]

build_topbar(changes2, frame2_id, page2_id)
build_sidebar(changes2, frame2_id, page2_id)

# FormPanel 480px replacing tree
fp_x = 240
fp_w = 480
fp_y = 64

# Panel background
fp_bg = uid()
changes2.append(add_obj(fp_bg, frame2_id, frame2_id,
    make_rect(fp_bg, "FormPanelBG", fp_x, fp_y, fp_w, 836, WHITE, frame2_id, frame2_id,
              strokes=stroke_border(BORDER, 1, "inner")), page2_id))

# Header
body_y = build_form_panel_header(changes2, frame2_id, page2_id, fp_x, fp_y, fp_w, "Editar Unidade")

# Body content
bx = fp_x + 24
by = body_y + 24
bw = fp_w - 48  # 432

# ReadOnly: Codigo
by = build_readonly_field_locked(changes2, frame2_id, page2_id, bx, by, bw, "CÓDIGO", "UN-0012")
by += 20

# Editable: Nome
by = build_form_input(changes2, frame2_id, page2_id, bx, by, bw, "NOME DA UNIDADE", "A1 Engenharia", is_placeholder=False)
by += 20

# ReadOnly: Nivel
by = build_readonly_field_locked(changes2, frame2_id, page2_id, bx, by, bw, "NÍVEL", "N2 — Regional")
by += 20

# ReadOnly: Unidade Pai
by = build_readonly_field_locked(changes2, frame2_id, page2_id, bx, by, bw, "UNIDADE PAI", "Grupo A1")
by += 24

# Separator
sep = uid()
changes2.append(add_obj(sep, frame2_id, frame2_id,
    make_rect(sep, "Separator1", bx, by, bw, 1, BORDER, frame2_id, frame2_id), page2_id))
by += 1 + 24

# Section: DADOS CADASTRAIS
sec = uid()
changes2.append(add_obj(sec, frame2_id, frame2_id,
    make_text(sec, "SecDadosCad", bx, by, bw, 12, "DADOS CADASTRAIS", 10, 700, T4, frame2_id, frame2_id,
              uppercase=True, letter_spacing=1), page2_id))
by += 28

# Editable fields
by = build_form_input(changes2, frame2_id, page2_id, bx, by, bw, "CNPJ", "12.345.678/0001-90", is_placeholder=False)
by += 16
by = build_form_input(changes2, frame2_id, page2_id, bx, by, bw, "RAZÃO SOCIAL", "A1 Engenharia e Construções Civis Ltda", is_placeholder=False)
by += 16

# Row: Filial + Responsavel
half_w = (bw - 12) // 2
build_form_input(changes2, frame2_id, page2_id, bx, by, half_w, "FILIAL", "São Paulo - SP", is_placeholder=False)
by = build_form_input(changes2, frame2_id, page2_id, bx + half_w + 12, by, half_w, "RESPONSÁVEL", "Marcos Silva", is_placeholder=False)
by += 16

by = build_form_input(changes2, frame2_id, page2_id, bx, by, bw, "TELEFONE", "(11) 3456-7890", is_placeholder=False)
by += 16
by = build_form_input(changes2, frame2_id, page2_id, bx, by, bw, "E-MAIL DE CONTATO", "contato@a1engenharia.com.br", is_placeholder=False)
by += 24

# Separator 2
sep2 = uid()
changes2.append(add_obj(sep2, frame2_id, frame2_id,
    make_rect(sep2, "Separator2", bx, by, bw, 1, BORDER, frame2_id, frame2_id), page2_id))
by += 1 + 24

# Section: STATUS
sec_st = uid()
changes2.append(add_obj(sec_st, frame2_id, frame2_id,
    make_text(sec_st, "SecStatus", bx, by, bw, 12, "STATUS", 10, 700, T4, frame2_id, frame2_id,
              uppercase=True, letter_spacing=1), page2_id))
by += 24

# Toggle
track = uid()
changes2.append(add_obj(track, frame2_id, frame2_id,
    make_rect(track, "ToggleTrack", bx, by, 40, 22, BLUE, frame2_id, frame2_id, radius=11), page2_id))
thumb = uid()
changes2.append(add_obj(thumb, frame2_id, frame2_id,
    make_rect(thumb, "ToggleThumb", bx + 20, by + 2, 18, 18, WHITE, frame2_id, frame2_id, radius=9), page2_id))
tog_lbl = uid()
changes2.append(add_obj(tog_lbl, frame2_id, frame2_id,
    make_text(tog_lbl, "ToggleLabel", bx + 50, by + 2, 60, 18, "Ativo", 13, 500, T2, frame2_id, frame2_id), page2_id))

# Footer
footer_y = fp_y + 836 - 72
build_form_panel_footer(changes2, frame2_id, page2_id, fp_x, footer_y, fp_w, "Salvar Alterações")

# Detail panel (visible, edit button disabled)
build_detail_panel(changes2, frame2_id, page2_id, x_offset=720, edit_btn_disabled=True)

send_changes(changes2, "Page 11-OrgForm-Edit")


# ═══════════════════════════════════════════
# PAGE 3: 11-OrgForm-Create
# ═══════════════════════════════════════════

print("\n-- Page 3: 11-OrgForm-Create --")
page3_id = uid()
frame3_id = uid()

changes3 = [
    add_page_change(page3_id, "11-OrgForm-Create"),
    add_obj(frame3_id, ROOT, ROOT,
        make_frame(frame3_id, "11-OrgForm-Create", 0, 0, 1440, 900, BG_PAGE), page3_id),
]

build_topbar(changes3, frame3_id, page3_id)
build_sidebar(changes3, frame3_id, page3_id)

# FormPanel 480px
fp3_x = 240
fp3_w = 480
fp3_y = 64

fp3_bg = uid()
changes3.append(add_obj(fp3_bg, frame3_id, frame3_id,
    make_rect(fp3_bg, "FormPanelBG", fp3_x, fp3_y, fp3_w, 836, WHITE, frame3_id, frame3_id,
              strokes=stroke_border(BORDER, 1, "inner")), page3_id))

# Header
body3_y = build_form_panel_header(changes3, frame3_id, page3_id, fp3_x, fp3_y, fp3_w, "Nova Subdivisão")

# Body
bx3 = fp3_x + 24
by3 = body3_y + 24
bw3 = fp3_w - 48

# InfoBox
info_bg = uid()
changes3.append(add_obj(info_bg, frame3_id, frame3_id,
    make_rect(info_bg, "InfoBoxBG", bx3, by3, bw3, 52, INFO_BG, frame3_id, frame3_id, radius=8), page3_id))
info_ico = uid()
changes3.append(add_obj(info_ico, frame3_id, frame3_id,
    make_rect(info_ico, "InfoIcon", bx3 + 16, by3 + 18, 16, 16, BLUE, frame3_id, frame3_id,
              opacity=0.4, radius=8), page3_id))
info_txt = uid()
changes3.append(add_obj(info_txt, frame3_id, frame3_id,
    make_text(info_txt, "InfoText", bx3 + 40, by3 + 14, bw3 - 56, 24,
              "A nova subdivisão será criada como filha de A1 Engenharia (N2).",
              13, 400, BLUE, frame3_id, frame3_id, line_height=1.5), page3_id))
by3 += 52 + 20

# ReadOnly: Unidade Pai
by3 = build_readonly_field_locked(changes3, frame3_id, page3_id, bx3, by3, bw3, "UNIDADE PAI", "A1 Engenharia")
by3 += 20

# ReadOnly: Nivel
by3 = build_readonly_field_locked(changes3, frame3_id, page3_id, bx3, by3, bw3, "NÍVEL", "N3 — Unidade")
by3 += 20

# Editable: Nome
by3 = build_form_input(changes3, frame3_id, page3_id, bx3, by3, bw3, "NOME DA SUBDIVISÃO", "Nome da subdivisão", is_placeholder=True)
by3 += 24

# Separator
sep3 = uid()
changes3.append(add_obj(sep3, frame3_id, frame3_id,
    make_rect(sep3, "Separator1", bx3, by3, bw3, 1, BORDER, frame3_id, frame3_id), page3_id))
by3 += 1 + 24

# Section: DADOS CADASTRAIS (opcional)
sec3 = uid()
changes3.append(add_obj(sec3, frame3_id, frame3_id,
    make_text(sec3, "SecDadosOpt", bx3, by3, bw3, 12, "DADOS CADASTRAIS (opcional)", 10, 700, T4, frame3_id, frame3_id,
              uppercase=True, letter_spacing=1), page3_id))
by3 += 28

# Optional fields
by3 = build_form_input(changes3, frame3_id, page3_id, bx3, by3, bw3, "CNPJ", "CNPJ da subdivisão", is_placeholder=True)
by3 += 16
by3 = build_form_input(changes3, frame3_id, page3_id, bx3, by3, bw3, "RAZÃO SOCIAL", "Razão social", is_placeholder=True)
by3 += 16
by3 = build_form_input(changes3, frame3_id, page3_id, bx3, by3, bw3, "RESPONSÁVEL", "Nome do responsável", is_placeholder=True)

# Footer
footer3_y = fp3_y + 836 - 72
build_form_panel_footer(changes3, frame3_id, page3_id, fp3_x, footer3_y, fp3_w, "Criar Subdivisão")

# Detail panel (visible, new btn disabled)
build_detail_panel(changes3, frame3_id, page3_id, x_offset=720, new_btn_disabled=True)

send_changes(changes3, "Page 11-OrgForm-Create")


# ═══════════════════════════════════════════
# PAGE 4: 11-OrgForm-Deactivate
# ═══════════════════════════════════════════

print("\n-- Page 4: 11-OrgForm-Deactivate --")
page4_id = uid()
frame4_id = uid()

changes4 = [
    add_page_change(page4_id, "11-OrgForm-Deactivate"),
    add_obj(frame4_id, ROOT, ROOT,
        make_frame(frame4_id, "11-OrgForm-Deactivate", 0, 0, 1440, 900, BG_PAGE), page4_id),
]

# Full OrgTree state visible behind modal
build_topbar(changes4, frame4_id, page4_id)
build_sidebar(changes4, frame4_id, page4_id)
build_tree_panel(changes4, frame4_id, page4_id)
build_detail_panel(changes4, frame4_id, page4_id, x_offset=620)

# Overlay
overlay = uid()
changes4.append(add_obj(overlay, frame4_id, frame4_id,
    make_rect(overlay, "ModalOverlay", 0, 0, 1440, 900, "#000000", frame4_id, frame4_id,
              opacity=0.4), page4_id))

# Modal (480px, centered)
modal_w = 480
modal_h = 340
modal_x = (1440 - modal_w) // 2
modal_y = (900 - modal_h) // 2

modal_bg = uid()
changes4.append(add_obj(modal_bg, frame4_id, frame4_id,
    make_rect(modal_bg, "ModalBG", modal_x, modal_y, modal_w, modal_h, WHITE, frame4_id, frame4_id,
              radius=16), page4_id))

# Alert icon
alert_y = modal_y + 32
alert_bg = uid()
changes4.append(add_obj(alert_bg, frame4_id, frame4_id,
    make_rect(alert_bg, "AlertIconBG", modal_x + (modal_w - 48) // 2, alert_y, 48, 48, ALERT_BG, frame4_id, frame4_id,
              radius=24), page4_id))
alert_ico = uid()
changes4.append(add_obj(alert_ico, frame4_id, frame4_id,
    make_rect(alert_ico, "AlertIcon", modal_x + (modal_w - 24) // 2, alert_y + 12, 24, 24, RED, frame4_id, frame4_id,
              opacity=0.6, radius=2), page4_id))

# Title
mt_y = alert_y + 48 + 16
m_title = uid()
changes4.append(add_obj(m_title, frame4_id, frame4_id,
    make_text(m_title, "ModalTitle", modal_x + 32, mt_y, modal_w - 64, 24,
              "Desativar unidade?", 20, 700, T1, frame4_id, frame4_id), page4_id))

# Description
md_y = mt_y + 32
m_desc = uid()
changes4.append(add_obj(m_desc, frame4_id, frame4_id,
    make_text(m_desc, "ModalDesc", modal_x + 50, md_y, 380, 50,
              "A unidade A1 Engenharia será desativada. Todas as subdivisões vinculadas também serão afetadas.",
              14, 400, T3, frame4_id, frame4_id, line_height=1.6), page4_id))

# Warning box
mw_y = md_y + 58
warn_bg = uid()
changes4.append(add_obj(warn_bg, frame4_id, frame4_id,
    make_rect(warn_bg, "WarnBoxBG", modal_x + 32, mw_y, modal_w - 64, 44, WARN_BG, frame4_id, frame4_id,
              radius=8), page4_id))
warn_ico = uid()
changes4.append(add_obj(warn_ico, frame4_id, frame4_id,
    make_rect(warn_ico, "WarnIcon", modal_x + 48, mw_y + 14, 16, 16, "#E67E22", frame4_id, frame4_id,
              opacity=0.5, radius=2), page4_id))
warn_txt = uid()
changes4.append(add_obj(warn_txt, frame4_id, frame4_id,
    make_text(warn_txt, "WarnText", modal_x + 72, mw_y + 13, modal_w - 120, 18,
              "3 subdivisões e 156 colaboradores serão impactados.", 13, 400, WARN_TXT, frame4_id, frame4_id), page4_id))

# Buttons
mb_y = mw_y + 44 + 24
btn_w = 180
gap = 12
total_btns_w = btn_w * 2 + gap
btns_x = modal_x + (modal_w - total_btns_w) // 2

# Cancelar
can_bg = uid()
changes4.append(add_obj(can_bg, frame4_id, frame4_id,
    make_rect(can_bg, "ModalBtnCancelBG", btns_x, mb_y, btn_w, 44, WHITE, frame4_id, frame4_id,
              radius=8, strokes=stroke_border(BORDER, 1, "inner")), page4_id))
can_txt = uid()
changes4.append(add_obj(can_txt, frame4_id, frame4_id,
    make_text(can_txt, "ModalBtnCancelText", btns_x + 12, mb_y + 13, btn_w - 24, 18,
              "Cancelar", 13, 600, T3, frame4_id, frame4_id), page4_id))

# Desativar (red)
des_x = btns_x + btn_w + gap
des_bg = uid()
changes4.append(add_obj(des_bg, frame4_id, frame4_id,
    make_rect(des_bg, "ModalBtnDangerBG", des_x, mb_y, btn_w, 44, RED, frame4_id, frame4_id,
              radius=8), page4_id))
des_txt = uid()
changes4.append(add_obj(des_txt, frame4_id, frame4_id,
    make_text(des_txt, "ModalBtnDangerText", des_x + 12, mb_y + 13, btn_w - 24, 18,
              "Desativar", 13, 700, WHITE, frame4_id, frame4_id), page4_id))

send_changes(changes4, "Page 11-OrgForm-Deactivate")


# ═══════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════

print("\nDone! Created 4 pages:")
print("  1. 10-OrgTree (split-panel: tree + detail)")
print("  2. 11-OrgForm-Edit (form panel + detail)")
print("  3. 11-OrgForm-Create (form panel + detail)")
print("  4. 11-OrgForm-Deactivate (modal overlay)")
print(f"  File: {FILE_ID}")
print(f"  Final revn: {revn}")
