"""
Create 06-UserForm screens in Penpot Sandbox.
Uses transit+json REST API. Based on 06-user-form-spec.md.

Pages:
  06-UserForm      — Create mode (new user form)
  06-UserForm-Edit — Edit mode (edit existing user)
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

T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"

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

def build_topbar(changes, frame_id, page_id, breadcrumb_items):
    """Add topbar. breadcrumb_items = list of (text, is_active) tuples."""
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

    # Breadcrumb
    bx = 201
    for i, (text, is_active) in enumerate(breadcrumb_items):
        if i > 0:
            # separator ›
            bcs = uid()
            changes.append(add_obj(bcs, fid, fid,
                make_text(bcs, f"BC-Sep{i}", bx, 24, 10, 16, "›", 13, 400, T6, fid, fid), pid))
            bx += 14
        bc = uid()
        color = T1 if is_active else T4
        weight = 700 if is_active else 400
        tw = len(text) * 7 + 4
        changes.append(add_obj(bc, fid, fid,
            make_text(bc, f"BC-{text}", bx, 24, tw, 16, text, 13, weight, color, fid, fid), pid))
        bx += tw + 4

    # Bell icon
    bell = uid()
    changes.append(add_obj(bell, fid, fid,
        make_rect(bell, "icon-bell", 1320, 23, 18, 18, T4, fid, fid, opacity=0.3, radius=2), pid))
    dot = uid()
    changes.append(add_obj(dot, fid, fid,
        make_rect(dot, "NotifDot", 1335, 20, 7, 7, RED, fid, fid, radius=3.5,
                  strokes=stroke_border("#FFFFFF", 1.5, "outer")), pid))

    # Company text
    emp = uid()
    changes.append(add_obj(emp, fid, fid,
        make_text(emp, "Empresa", 1350, 26, 140, 14, "Empresa: A1 Engenharia", 12, 500, T3, fid, fid), pid))


def build_sidebar(changes, frame_id, page_id):
    """Add sidebar (240×836) starting at y=64."""
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
    for label, active in SIDEBAR_ITEMS:
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
    ub_border = uid()
    changes.append(add_obj(ub_border, fid, fid,
        make_rect(ub_border, "UserBlockBorder", 0, 864, 240, 1, BORDER, fid, fid), pid))
    av = uid()
    changes.append(add_obj(av, fid, fid,
        make_rect(av, "Avatar", 16, 876, 32, 32, BLUE, fid, fid, radius=16), pid))
    ae = uid()
    changes.append(add_obj(ae, fid, fid,
        make_text(ae, "AvatarText", 21, 882, 22, 14, "AE", 11, 700, WHITE, fid, fid), pid))
    un = uid()
    changes.append(add_obj(un, fid, fid,
        make_text(un, "UserName", 58, 876, 160, 15, "Administrador ECF", 12, 700, T1, fid, fid), pid))
    ue = uid()
    changes.append(add_obj(ue, fid, fid,
        make_text(ue, "UserEmail", 58, 893, 160, 14, "admin@a1.com.br", 11, 400, T4, fid, fid), pid))


def build_form_input(changes, fid, pid, x, y, w, label_text, value_text, is_placeholder=True, has_icon=False):
    """Add a form field (label + input). Returns bottom y."""
    # Label
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 14, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))

    # Input background
    iy = y + 22
    iid = uid()
    changes.append(add_obj(iid, fid, fid,
        make_rect(iid, f"Input-{label_text}", x, iy, w, 48, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Icon placeholder (envelope for email)
    text_x = x + 14
    if has_icon:
        icon = uid()
        changes.append(add_obj(icon, fid, fid,
            make_rect(icon, f"Icon-{label_text}", x + 14, iy + 15, 18, 18, T6, fid, fid,
                      opacity=0.5, radius=2), pid))
        text_x = x + 44

    # Value/placeholder text
    vid = uid()
    color = T6 if is_placeholder else T1
    changes.append(add_obj(vid, fid, fid,
        make_text(vid, f"Value-{label_text}", text_x, iy + 14, w - (text_x - x) - 14, 20,
                  value_text, 14, 400, color, fid, fid), pid))

    return iy + 48  # bottom of input


def build_form_select(changes, fid, pid, x, y, w, label_text, value_text, is_placeholder=True):
    """Add a select field (label + select box + chevron). Returns bottom y."""
    # Label
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 14, label_text, 11, 700, T2, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))

    # Select background
    sy = y + 22
    sid = uid()
    changes.append(add_obj(sid, fid, fid,
        make_rect(sid, f"Select-{label_text}", x, sy, w, 48, WHITE, fid, fid,
                  radius=10, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Value text
    vid = uid()
    color = T6 if is_placeholder else T1
    changes.append(add_obj(vid, fid, fid,
        make_text(vid, f"Value-{label_text}", x + 14, sy + 14, w - 42, 20,
                  value_text, 14, 400, color, fid, fid), pid))

    # Chevron placeholder (small rect)
    chev = uid()
    changes.append(add_obj(chev, fid, fid,
        make_rect(chev, f"Chevron-{label_text}", x + w - 28, sy + 17, 14, 14, T4, fid, fid,
                  opacity=0.3, radius=2), pid))

    return sy + 48


def build_form_card(changes, frame_id, page_id, mode="create"):
    """Build the form card for create or edit mode."""
    fid = frame_id
    pid = page_id

    # Content area background
    ca_bg = uid()
    changes.append(add_obj(ca_bg, fid, fid,
        make_rect(ca_bg, "ContentAreaBG", 240, 64, 1200, 836, BG_PAGE, fid, fid), pid))

    # FormCard - positioned at x=272 (240+32), y=96 (64+32)
    card_x = 272
    card_y = 96
    card_w = 680
    pad = 36

    # Card background — estimate height based on mode
    card_h = 580 if mode == "create" else 660
    card_bg = uid()
    changes.append(add_obj(card_bg, fid, fid,
        make_rect(card_bg, "FormCardBG", card_x, card_y, card_w, card_h, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Inner content area
    ix = card_x + pad  # 308
    iy = card_y + pad  # 132
    iw = card_w - pad * 2  # 608

    # Title
    if mode == "create":
        title_text = "Novo Usuário"
        desc_text = "Preencha os dados para criar um novo usuário."
    else:
        title_text = "Editar Usuário"
        desc_text = "Atualize os dados do usuário."

    tid = uid()
    changes.append(add_obj(tid, fid, fid,
        make_text(tid, "FormTitle", ix, iy, iw, 34, title_text, 28, 800, T1, fid, fid,
                  letter_spacing=-1, line_height=1.2), pid))

    did = uid()
    changes.append(add_obj(did, fid, fid,
        make_text(did, "FormDesc", ix, iy + 40, iw, 18, desc_text, 14, 400, T4, fid, fid), pid))

    # ── Campo Nome (mt:28 from desc) ──
    cy = iy + 40 + 18 + 28
    if mode == "create":
        bottom = build_form_input(changes, fid, pid, ix, cy, iw, "NOME COMPLETO", "Nome do usuário", is_placeholder=True)
    else:
        bottom = build_form_input(changes, fid, pid, ix, cy, iw, "NOME COMPLETO", "Marcos Silva", is_placeholder=False)

    # ── Campo Email (mt:20) ──
    cy = bottom + 20
    if mode == "create":
        bottom = build_form_input(changes, fid, pid, ix, cy, iw, "E-MAIL CORPORATIVO",
                                  "usuario@grupoa1.com.br", is_placeholder=True, has_icon=True)
    else:
        bottom = build_form_input(changes, fid, pid, ix, cy, iw, "E-MAIL CORPORATIVO",
                                  "marcos.silva@a1.com.br", is_placeholder=False, has_icon=True)

    # ── LinhaSelects (mt:20, 2× select side by side, gap 16) ──
    cy = bottom + 20
    sel_w = 296
    if mode == "create":
        build_form_select(changes, fid, pid, ix, cy, sel_w, "PERFIL", "Selecione o perfil", is_placeholder=True)
        build_form_select(changes, fid, pid, ix + sel_w + 16, cy, sel_w, "EMPRESA", "Selecione a empresa", is_placeholder=True)
    else:
        build_form_select(changes, fid, pid, ix, cy, sel_w, "PERFIL", "Administrador", is_placeholder=False)
        build_form_select(changes, fid, pid, ix + sel_w + 16, cy, sel_w, "EMPRESA", "A1 Engenharia", is_placeholder=False)
    bottom = cy + 22 + 48  # label height + input height

    if mode == "create":
        # ── InfoConvite (mt:20) ──
        cy = bottom + 20
        info_bg = uid()
        changes.append(add_obj(info_bg, fid, fid,
            make_rect(info_bg, "InfoConviteBG", ix, cy, iw, 44, INFO_BG, fid, fid, radius=8), pid))

        # Info icon placeholder
        info_ico = uid()
        changes.append(add_obj(info_ico, fid, fid,
            make_rect(info_ico, "InfoIcon", ix + 16, cy + 14, 16, 16, INFO_TEXT, fid, fid,
                      opacity=0.4, radius=8), pid))

        info_txt = uid()
        changes.append(add_obj(info_txt, fid, fid,
            make_text(info_txt, "InfoText", ix + 40, cy + 14, iw - 56, 16,
                      "Um convite será enviado por e-mail para ativação da conta.",
                      13, 400, INFO_TEXT, fid, fid), pid))
        bottom = cy + 44

        # ── Separador (mt:28) ──
        cy = bottom + 28
    else:
        # ── CampoStatus (mt:20, between selects and separator) ──
        cy = bottom + 20

        # Label
        slid = uid()
        changes.append(add_obj(slid, fid, fid,
            make_text(slid, "Label-STATUS", ix, cy, iw, 14, "STATUS", 11, 700, T2, fid, fid,
                      uppercase=True, letter_spacing=0.8), pid))

        ty = cy + 22

        # Toggle track (40×22, r:11, blue)
        track = uid()
        changes.append(add_obj(track, fid, fid,
            make_rect(track, "ToggleTrack", ix, ty, 40, 22, BLUE, fid, fid, radius=11), pid))

        # Toggle thumb (18×18, white, right position = x + 20)
        thumb = uid()
        changes.append(add_obj(thumb, fid, fid,
            make_rect(thumb, "ToggleThumb", ix + 20, ty + 2, 18, 18, WHITE, fid, fid, radius=9), pid))

        # "Ativo" text
        atv = uid()
        changes.append(add_obj(atv, fid, fid,
            make_text(atv, "ToggleLabel", ix + 50, ty + 2, 60, 18, "Ativo", 13, 500, T2, fid, fid), pid))

        bottom = ty + 22

        # ── Separador (mt:28) ──
        cy = bottom + 28

    sep = uid()
    changes.append(add_obj(sep, fid, fid,
        make_rect(sep, "Separador", ix, cy, iw, 1, BORDER, fid, fid), pid))
    bottom = cy + 1

    if mode == "edit":
        # ── BotãoResetar (mt:20) ──
        cy = bottom + 20
        rst_w = 120
        rst_h = 40
        rst_bg = uid()
        changes.append(add_obj(rst_bg, fid, fid,
            make_rect(rst_bg, "BtnResetarBG", ix, cy, rst_w, rst_h, WHITE, fid, fid,
                      radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
        rst_txt = uid()
        changes.append(add_obj(rst_txt, fid, fid,
            make_text(rst_txt, "BtnResetarText", ix + 14, cy + 11, rst_w - 28, 18,
                      "Resetar Senha", 13, 500, T3, fid, fid), pid))
        bottom = cy + rst_h

    # ── BotõesAção (mt:20, aligned right) ──
    cy = bottom + 20
    btn_h = 44

    # Salvar button (rightmost)
    if mode == "create":
        save_text = "Salvar"
        save_w = 90
    else:
        save_text = "Salvar Alterações"
        save_w = 150

    save_x = ix + iw - save_w
    save_bg = uid()
    changes.append(add_obj(save_bg, fid, fid,
        make_rect(save_bg, "BtnSalvarBG", save_x, cy, save_w, btn_h, BLUE, fid, fid, radius=8), pid))
    save_txt = uid()
    changes.append(add_obj(save_txt, fid, fid,
        make_text(save_txt, "BtnSalvarText", save_x + 12, cy + 13, save_w - 24, 18,
                  save_text, 13, 700, WHITE, fid, fid), pid))

    # Cancelar button
    cancel_w = 100
    cancel_x = save_x - cancel_w - 12
    cancel_bg = uid()
    changes.append(add_obj(cancel_bg, fid, fid,
        make_rect(cancel_bg, "BtnCancelarBG", cancel_x, cy, cancel_w, btn_h, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    cancel_txt = uid()
    changes.append(add_obj(cancel_txt, fid, fid,
        make_text(cancel_txt, "BtnCancelarText", cancel_x + 12, cy + 13, cancel_w - 24, 18,
                  "Cancelar", 13, 600, T3, fid, fid), pid))

    # Update card height to match actual content
    actual_h = (cy + btn_h) - card_y + pad
    return actual_h


# ═══════════════════════════════════════════
# PAGE 1: 06-UserForm (Create Mode)
# ═══════════════════════════════════════════

print("\n-- Page 1: 06-UserForm (Create) --")
page1_id = uid()
frame1_id = uid()

changes1 = [
    add_page_change(page1_id, "06-UserForm"),
    add_obj(frame1_id, ROOT, ROOT,
        make_frame(frame1_id, "06-UserForm", 0, 0, 1440, 900, BG_PAGE), page1_id),
]

# Topbar with breadcrumb
build_topbar(changes1, frame1_id, page1_id,
    [("Início", False), ("Usuários", False), ("Novo", True)])

# Sidebar
build_sidebar(changes1, frame1_id, page1_id)

# Form card (create mode)
build_form_card(changes1, frame1_id, page1_id, mode="create")

send_changes(changes1, "Page 06-UserForm (Create)")


# ═══════════════════════════════════════════
# PAGE 2: 06-UserForm-Edit (Edit Mode)
# ═══════════════════════════════════════════

print("\n-- Page 2: 06-UserForm-Edit --")
page2_id = uid()
frame2_id = uid()

changes2 = [
    add_page_change(page2_id, "06-UserForm-Edit"),
    add_obj(frame2_id, ROOT, ROOT,
        make_frame(frame2_id, "06-UserForm-Edit", 0, 0, 1440, 900, BG_PAGE), page2_id),
]

# Topbar with breadcrumb
build_topbar(changes2, frame2_id, page2_id,
    [("Início", False), ("Usuários", False), ("Marcos Silva", True)])

# Sidebar
build_sidebar(changes2, frame2_id, page2_id)

# Form card (edit mode)
build_form_card(changes2, frame2_id, page2_id, mode="edit")

send_changes(changes2, "Page 06-UserForm-Edit")


# ═══════════════════════════════════════════
# REPORT
# ═══════════════════════════════════════════

print("\nDone! Created 2 pages:")
print("  1. 06-UserForm (Create mode)")
print("  2. 06-UserForm-Edit (Edit mode)")
print(f"  File: {FILE_ID}")
print(f"  Final revn: {revn}")
