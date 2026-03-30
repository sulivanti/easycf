"""
Create 3 Login screens in Penpot Sandbox — each on its own page.
Uses transit+json REST API. Based on 01-login-spec-v3.md.

Pages:
  01-Login        — Main login form
  01-Login-Forgot — Password recovery
  01-Login-Reset  — Password reset with strength meter
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

def make_gradient_rect(rid, name, x, y, w, h, stops, parent, frame,
                       sx=0.5, sy=0, ex=0.5, ey=1, radius=0, opacity=1):
    """Create a rect with linear gradient fill."""
    gradient_stops = []
    for offset, color, op in stops:
        gradient_stops.append(["^ ", "~:offset", offset, "~:color", color, "~:opacity", op])
    obj = ["^ ",
        "~:id", f"~u{rid}", "~:type", "~:rect", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{parent}", "~:frame-id", f"~u{frame}",
        "~:fills", [["^ ",
            "~:fill-color-gradient", ["^ ",
                "~:type", "~:linear",
                "~:start-x", sx, "~:start-y", sy,
                "~:end-x", ex, "~:end-y", ey,
                "~:width", 1,
                "~:stops", gradient_stops,
            ],
            "~:fill-opacity", opacity,
        ]],
        "~:strokes", [],
    ]
    if radius > 0:
        obj.extend(["~:rx", radius, "~:ry", radius])
    return obj

def _text_content(text, font_size, font_weight, color,
                  italic=False, uppercase=False, letter_spacing=0,
                  line_height=1.3, font_variant_id=None, fill_opacity=1):
    """Build the nested transit content structure for a text shape."""
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
        "~:fill-opacity", fill_opacity,
        "~:text-transform", "uppercase" if uppercase else "none",
    ]
    return ["^ ",
        "~:type", "root",
        "~:children", [
            ["^ ", "~:type", "paragraph-set", "~:children", [
                ["^ ", "~:type", "paragraph", "~:children", [leaf]]
            ]]
        ]
    ]

def make_text(tid, name, x, y, w, h, text, font_size, font_weight, color,
              parent, frame, italic=False, uppercase=False,
              letter_spacing=0, line_height=1.3, text_opacity=1,
              font_variant_id=None):
    """Create a text shape with proper transit content structure."""
    content = _text_content(text, font_size, font_weight, color,
                            italic=italic, uppercase=uppercase,
                            letter_spacing=letter_spacing,
                            line_height=line_height,
                            font_variant_id=font_variant_id,
                            fill_opacity=text_opacity)
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
    """Return a strokes list for a simple solid border."""
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
# BRANDING PANEL (reused across all 3 pages)
# ═══════════════════════════════════════════

def add_branding_panel(changes, frame_id, page_id):
    """Add the full left branding panel (604×900) to changes list."""
    fid = frame_id
    pid = page_id

    # Background gradient rect 604×900 — 175deg approx: sx=0.5 sy=0 ex=0.45 ey=1
    bg = uid()
    changes.append(add_obj(bg, fid, fid,
        make_gradient_rect(bg, "BrandingBG", 0, 0, 604, 900,
            [(0, "#1a2318", 1), (1, "#111111", 1)],
            fid, fid, sx=0.5, sy=0, ex=0.45, ey=1),
        pid))

    # ── Logo group ──
    # Logo icon 44×44 gradient
    logo_icon = uid()
    changes.append(add_obj(logo_icon, fid, fid,
        make_gradient_rect(logo_icon, "LogoIcon", 56, 40, 44, 44,
            [(0, "#F5A04E", 1), (1, "#F58C32", 1)],
            fid, fid, sx=0, sy=0, ex=1, ey=1, radius=8),
        pid))

    # "A1" text on logo
    a1 = uid()
    changes.append(add_obj(a1, fid, fid,
        make_text(a1, "LogoText A1", 64, 49, 28, 24,
            "A1", 18, 800, "#FFFFFF", fid, fid, italic=True),
        pid))

    # "Grupo A1"
    gname = uid()
    changes.append(add_obj(gname, fid, fid,
        make_text(gname, "Grupo A1", 112, 44, 80, 18,
            "Grupo A1", 15, 700, "#FFFFFF", fid, fid, line_height=1.2),
        pid))

    # "PORTAL INTERNO"
    psub = uid()
    changes.append(add_obj(psub, fid, fid,
        make_text(psub, "PORTAL INTERNO", 112, 64, 100, 12,
            "PORTAL INTERNO", 10, 500, "#FFFFFF", fid, fid,
            uppercase=True, letter_spacing=1.6, text_opacity=0.35),
        pid))

    # ── Tagline block (vertically centered ~y:340) ──
    tagline = uid()
    changes.append(add_obj(tagline, fid, fid,
        make_text(tagline, "Tagline", 56, 320, 420, 150,
            "Soluções\npara a\nindústria.", 42, 800, "#FFFFFF", fid, fid,
            italic=True, letter_spacing=-1.2, line_height=1.12),
        pid))

    # Description
    desc = uid()
    changes.append(add_obj(desc, fid, fid,
        make_text(desc, "Description", 56, 490, 380, 46,
            "Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida para o Grupo A1.",
            14, 400, "#FFFFFF", fid, fid, line_height=1.64, text_opacity=0.45),
        pid))

    # Orange accent bar
    bar = uid()
    changes.append(add_obj(bar, fid, fid,
        make_rect(bar, "AccentBar", 56, 556, 56, 4, "#F58C32", fid, fid, radius=2),
        pid))

    # ── Footer branding ──
    # "UNIDADES DO GRUPO"
    ulabel = uid()
    changes.append(add_obj(ulabel, fid, fid,
        make_text(ulabel, "UNIDADES DO GRUPO", 56, 756, 130, 12,
            "UNIDADES DO GRUPO", 9, 700, "#FFFFFF", fid, fid,
            uppercase=True, letter_spacing=1.4, text_opacity=0.25),
        pid))

    # 4 Pills
    pills_data = [
        ("Engenharia", 56, 80),
        ("Industrial", 152, 70),
        ("Energia", 238, 62),
        ("Agro", 316, 48),
    ]
    for pill_text, px, pw in pills_data:
        # Pill border rect
        pr = uid()
        changes.append(add_obj(pr, fid, fid,
            make_rect(pr, f"Pill {pill_text}", px, 780, pw, 32, "#000000", fid, fid,
                      opacity=0, radius=20,
                      strokes=stroke_border("#FFFFFF", 1, "inner", 0.12)),
            pid))
        # The stroke opacity needs special handling — use fill-opacity 0 to make transparent
        # and put a low-opacity white border. Let's use a simpler approach:
        # just the border rect with 0 fill + stroke

        # Pill text
        pt = uid()
        changes.append(add_obj(pt, fid, fid,
            make_text(pt, f"PillText {pill_text}", px + 16, 786, pw - 32, 16,
                pill_text, 12, 500, "#FFFFFF", fid, fid, text_opacity=0.5),
            pid))

    # Copyright
    copy = uid()
    changes.append(add_obj(copy, fid, fid,
        make_text(copy, "Copyright", 56, 826, 300, 14,
            "© 2026 Grupo A1 · Todos os direitos reservados",
            11, 400, "#FFFFFF", fid, fid, text_opacity=0.2),
        pid))


# ═══════════════════════════════════════════
# FORM PANEL BACKGROUND (reused)
# ═══════════════════════════════════════════

def add_form_panel_bg(changes, frame_id, page_id):
    """Right panel background #F5F5F3 836×900."""
    bg = uid()
    changes.append(add_obj(bg, frame_id, frame_id,
        make_rect(bg, "FormPanelBG", 604, 0, 836, 900, "#F5F5F3", frame_id, frame_id),
        page_id))


# ═══════════════════════════════════════════
# CARD FOOTER (reused)
# ═══════════════════════════════════════════

def add_card_footer(changes, frame_id, page_id, card_x, footer_y, card_inner_w=340):
    """Add the card footer with 'Conexão segura' and 'Suporte'."""
    fid = frame_id
    pid = page_id

    # Top border line
    fl = uid()
    changes.append(add_obj(fl, fid, fid,
        make_rect(fl, "FooterLine", card_x, footer_y, card_inner_w, 1, "#E8E8E6", fid, fid),
        pid))

    # Shield icon placeholder
    shield = uid()
    changes.append(add_obj(shield, fid, fid,
        make_rect(shield, "IconShield", card_x, footer_y + 20, 14, 14, "#AAAAAA", fid, fid, radius=2),
        pid))

    # "Conexão segura (TLS)"
    tls = uid()
    changes.append(add_obj(tls, fid, fid,
        make_text(tls, "Conexão segura (TLS)", card_x + 20, footer_y + 20, 130, 16,
            "Conexão segura (TLS)", 12, 500, "#AAAAAA", fid, fid),
        pid))

    # Info icon placeholder
    info = uid()
    changes.append(add_obj(info, fid, fid,
        make_rect(info, "IconInfo", card_x + card_inner_w - 70, footer_y + 20, 14, 14, "#AAAAAA", fid, fid, radius=7),
        pid))

    # "Suporte"
    sup = uid()
    changes.append(add_obj(sup, fid, fid,
        make_text(sup, "Suporte", card_x + card_inner_w - 50, footer_y + 20, 50, 16,
            "Suporte", 12, 500, "#AAAAAA", fid, fid),
        pid))


# ═══════════════════════════════════════════
# Step 2: Create 3 pages
# ═══════════════════════════════════════════
print("\n-- Creating 3 pages --")
page1_id = uid()
page2_id = uid()
page3_id = uid()

pages_changes = [
    add_page_change(page1_id, "01-Login"),
    add_page_change(page2_id, "01-Login-Forgot"),
    add_page_change(page3_id, "01-Login-Reset"),
]
send_changes(pages_changes, "Create 3 pages")


# ═══════════════════════════════════════════
# Step 3: Page 01-Login
# ═══════════════════════════════════════════
print("\n-- Page: 01-Login --")
f1 = uid()
changes = []

# Frame 1440×900
changes.append(add_obj(f1, ROOT, ROOT,
    make_frame(f1, "01-Login", 0, 0, 1440, 900), page1_id))

# Branding panel (left)
add_branding_panel(changes, f1, page1_id)

# Form panel background (right)
add_form_panel_bg(changes, f1, page1_id)

# ── Card Login ──
# Card: 420 wide, centered in 836px panel → x = 604 + (836-420)/2 = 604+208 = 812
CARD_X = 812
CARD_Y = 150
CARD_W = 420
INNER_X = CARD_X + 40  # padding 40px sides
INNER_W = 340

# Card background
card = uid()
changes.append(add_obj(card, f1, f1,
    make_rect(card, "CardLogin", CARD_X, CARD_Y, CARD_W, 620, "#FFFFFF", f1, f1,
              radius=16, strokes=stroke_border("#E8E8E6")),
    page1_id))

# "Bem-vindo de volta"
y = CARD_Y + 44
t_title = uid()
changes.append(add_obj(t_title, f1, f1,
    make_text(t_title, "Bem-vindo de volta", INNER_X, y, INNER_W, 30,
        "Bem-vindo de volta", 24, 800, "#111111", f1, f1,
        letter_spacing=-0.5, line_height=1.25),
    page1_id))

# "Acesse o portal do Grupo A1"
y += 36
t_sub = uid()
changes.append(add_obj(t_sub, f1, f1,
    make_text(t_sub, "Subtítulo", INNER_X, y, INNER_W, 20,
        "Acesse o portal do Grupo A1", 14, 400, "#888888", f1, f1, line_height=1.43),
    page1_id))

# ── Email field ──
y += 40
lbl_email = uid()
changes.append(add_obj(lbl_email, f1, f1,
    make_text(lbl_email, "Label Email", INNER_X, y, INNER_W, 14,
        "E-MAIL CORPORATIVO", 11, 700, "#333333", f1, f1,
        uppercase=True, letter_spacing=0.8, line_height=1.27),
    page1_id))

y += 22
# Input bg
inp_email = uid()
changes.append(add_obj(inp_email, f1, f1,
    make_rect(inp_email, "InputEmail", INNER_X, y, INNER_W, 48, "#FFFFFF", f1, f1,
              radius=10, strokes=stroke_border("#E8E8E6")),
    page1_id))

# Envelope icon placeholder
env_icon = uid()
changes.append(add_obj(env_icon, f1, f1,
    make_rect(env_icon, "IconEnvelope", INNER_X + 14, y + 15, 18, 18, "#CCCCCC", f1, f1, radius=2),
    page1_id))

# Placeholder text
ph_email = uid()
changes.append(add_obj(ph_email, f1, f1,
    make_text(ph_email, "Placeholder Email", INNER_X + 44, y + 14, 200, 20,
        "seu@grupoa1.com.br", 14, 400, "#CCCCCC", f1, f1),
    page1_id))

# ── Password field ──
y += 68
# Label row: "SENHA" left + "Esqueci minha senha" right
lbl_pwd = uid()
changes.append(add_obj(lbl_pwd, f1, f1,
    make_text(lbl_pwd, "Label Senha", INNER_X, y, 60, 14,
        "SENHA", 11, 700, "#333333", f1, f1,
        uppercase=True, letter_spacing=0.8, line_height=1.27),
    page1_id))

link_forgot = uid()
changes.append(add_obj(link_forgot, f1, f1,
    make_text(link_forgot, "Link Esqueci", INNER_X + 200, y, 140, 16,
        "Esqueci minha senha", 12, 600, "#F58C32", f1, f1, line_height=1.33),
    page1_id))

y += 22
# Password input
inp_pwd = uid()
changes.append(add_obj(inp_pwd, f1, f1,
    make_rect(inp_pwd, "InputSenha", INNER_X, y, INNER_W, 48, "#FFFFFF", f1, f1,
              radius=10, strokes=stroke_border("#E8E8E6")),
    page1_id))

# Lock icon
lock_icon = uid()
changes.append(add_obj(lock_icon, f1, f1,
    make_rect(lock_icon, "IconLock", INNER_X + 14, y + 15, 18, 18, "#CCCCCC", f1, f1, radius=2),
    page1_id))

# Placeholder
ph_pwd = uid()
changes.append(add_obj(ph_pwd, f1, f1,
    make_text(ph_pwd, "Placeholder Senha", INNER_X + 44, y + 14, 200, 20,
        "Digite sua senha", 14, 400, "#CCCCCC", f1, f1),
    page1_id))

# Eye icon
eye_icon = uid()
changes.append(add_obj(eye_icon, f1, f1,
    make_rect(eye_icon, "IconEye", INNER_X + INNER_W - 32, y + 15, 18, 18, "#AAAAAA", f1, f1, radius=2),
    page1_id))

# ── Checkbox ──
y += 64
chk_box = uid()
changes.append(add_obj(chk_box, f1, f1,
    make_rect(chk_box, "CheckboxBox", INNER_X, y, 16, 16, "#FFFFFF", f1, f1,
              radius=3, strokes=stroke_border("#E8E8E6", 1.5)),
    page1_id))

chk_txt = uid()
changes.append(add_obj(chk_txt, f1, f1,
    make_text(chk_txt, "Manter conectado", INNER_X + 24, y - 1, 120, 18,
        "Manter conectado", 13, 400, "#555555", f1, f1),
    page1_id))

# ── Button Entrar ──
y += 36
btn_enter = uid()
changes.append(add_obj(btn_enter, f1, f1,
    make_rect(btn_enter, "BtnEntrar", INNER_X, y, INNER_W, 50, "#2E86C1", f1, f1, radius=10),
    page1_id))

btn_txt = uid()
changes.append(add_obj(btn_txt, f1, f1,
    make_text(btn_txt, "BtnEntrar Text", INNER_X + 130, y + 15, 60, 20,
        "Entrar", 15, 700, "#FFFFFF", f1, f1),
    page1_id))

# Arrow icon placeholder
arrow = uid()
changes.append(add_obj(arrow, f1, f1,
    make_rect(arrow, "IconArrow", INNER_X + 200, y + 16, 18, 18, "#FFFFFF", f1, f1, radius=2),
    page1_id))

# ── Divider "OU CONTINUE COM" ──
y += 74
div_left = uid()
changes.append(add_obj(div_left, f1, f1,
    make_rect(div_left, "DividerLeft", INNER_X, y, 100, 1, "#E8E8E6", f1, f1),
    page1_id))

div_txt = uid()
changes.append(add_obj(div_txt, f1, f1,
    make_text(div_txt, "OU CONTINUE COM", INNER_X + 108, y - 7, 124, 14,
        "OU CONTINUE COM", 11, 600, "#AAAAAA", f1, f1,
        uppercase=True, letter_spacing=0.8),
    page1_id))

div_right = uid()
changes.append(add_obj(div_right, f1, f1,
    make_rect(div_right, "DividerRight", INNER_X + 240, y, 100, 1, "#E8E8E6", f1, f1),
    page1_id))

# ── Microsoft button ──
y += 24
btn_ms = uid()
changes.append(add_obj(btn_ms, f1, f1,
    make_rect(btn_ms, "BtnMicrosoft", INNER_X, y, INNER_W, 48, "#FFFFFF", f1, f1,
              radius=10, strokes=stroke_border("#E8E8E6")),
    page1_id))

# MS Logo — 4 squares 8×8 gap 2px, centered
ms_cx = INNER_X + 110
ms_cy = y + 16
ms_colors = [
    ("MS Red", 0, 0, "#F25022"),
    ("MS Green", 10, 0, "#7FBA00"),
    ("MS Blue", 0, 10, "#00A4EF"),
    ("MS Yellow", 10, 10, "#FFB900"),
]
for ms_name, dx, dy, mc in ms_colors:
    msid = uid()
    changes.append(add_obj(msid, f1, f1,
        make_rect(msid, ms_name, ms_cx + dx, ms_cy + dy, 8, 8, mc, f1, f1),
        page1_id))

ms_txt = uid()
changes.append(add_obj(ms_txt, f1, f1,
    make_text(ms_txt, "Entrar com Microsoft", ms_cx + 28, y + 14, 160, 20,
        "Entrar com Microsoft", 14, 600, "#333333", f1, f1),
    page1_id))

# ── "Primeiro acesso? Solicite ao administrador" ──
y += 68
fa1 = uid()
changes.append(add_obj(fa1, f1, f1,
    make_text(fa1, "Primeiro acesso?", INNER_X + 60, y, 100, 18,
        "Primeiro acesso?", 13, 400, "#888888", f1, f1),
    page1_id))

fa2 = uid()
changes.append(add_obj(fa2, f1, f1,
    make_text(fa2, "Solicite ao administrador", INNER_X + 162, y, 160, 18,
        "Solicite ao administrador", 13, 700, "#333333", f1, f1),
    page1_id))

# ── Footer ──
y += 40
add_card_footer(changes, f1, page1_id, INNER_X, y, INNER_W)

send_changes(changes, "Page 01-Login content")


# ═══════════════════════════════════════════
# Step 4: Page 01-Login-Forgot
# ═══════════════════════════════════════════
print("\n-- Page: 01-Login-Forgot --")
f2 = uid()
changes = []

changes.append(add_obj(f2, ROOT, ROOT,
    make_frame(f2, "01-Login-Forgot", 0, 0, 1440, 900), page2_id))

add_branding_panel(changes, f2, page2_id)
add_form_panel_bg(changes, f2, page2_id)

# Card
card2 = uid()
changes.append(add_obj(card2, f2, f2,
    make_rect(card2, "CardForgot", CARD_X, CARD_Y, CARD_W, 520, "#FFFFFF", f2, f2,
              radius=16, strokes=stroke_border("#E8E8E6")),
    page2_id))

y = CARD_Y + 44

# "← Voltar ao login"
back_icon = uid()
changes.append(add_obj(back_icon, f2, f2,
    make_rect(back_icon, "IconArrowLeft", INNER_X, y, 16, 16, "#888888", f2, f2, radius=2),
    page2_id))

back_txt = uid()
changes.append(add_obj(back_txt, f2, f2,
    make_text(back_txt, "Voltar ao login", INNER_X + 20, y, 100, 16,
        "Voltar ao login", 13, 600, "#888888", f2, f2),
    page2_id))

# "Esqueceu a senha?"
y += 32
t2_title = uid()
changes.append(add_obj(t2_title, f2, f2,
    make_text(t2_title, "Esqueceu a senha?", INNER_X, y, INNER_W, 30,
        "Esqueceu a senha?", 24, 800, "#111111", f2, f2,
        letter_spacing=-0.5, line_height=1.25),
    page2_id))

y += 36
t2_sub = uid()
changes.append(add_obj(t2_sub, f2, f2,
    make_text(t2_sub, "Subtítulo Forgot", INNER_X, y, INNER_W, 40,
        "Informe seu e-mail corporativo e enviaremos um link para redefinição.",
        14, 400, "#888888", f2, f2, line_height=1.43),
    page2_id))

# Email field (same as login)
y += 52
lbl_email2 = uid()
changes.append(add_obj(lbl_email2, f2, f2,
    make_text(lbl_email2, "Label Email", INNER_X, y, INNER_W, 14,
        "E-MAIL CORPORATIVO", 11, 700, "#333333", f2, f2,
        uppercase=True, letter_spacing=0.8, line_height=1.27),
    page2_id))

y += 22
inp_email2 = uid()
changes.append(add_obj(inp_email2, f2, f2,
    make_rect(inp_email2, "InputEmail", INNER_X, y, INNER_W, 48, "#FFFFFF", f2, f2,
              radius=10, strokes=stroke_border("#E8E8E6")),
    page2_id))

env_icon2 = uid()
changes.append(add_obj(env_icon2, f2, f2,
    make_rect(env_icon2, "IconEnvelope", INNER_X + 14, y + 15, 18, 18, "#CCCCCC", f2, f2, radius=2),
    page2_id))

ph_email2 = uid()
changes.append(add_obj(ph_email2, f2, f2,
    make_text(ph_email2, "Placeholder Email", INNER_X + 44, y + 14, 200, 20,
        "seu@grupoa1.com.br", 14, 400, "#CCCCCC", f2, f2),
    page2_id))

# Button "Enviar link"
y += 68
btn_send = uid()
changes.append(add_obj(btn_send, f2, f2,
    make_rect(btn_send, "BtnEnviarLink", INNER_X, y, INNER_W, 50, "#2E86C1", f2, f2, radius=10),
    page2_id))

btn_send_txt = uid()
changes.append(add_obj(btn_send_txt, f2, f2,
    make_text(btn_send_txt, "BtnEnviarLink Text", INNER_X + 120, y + 15, 100, 20,
        "Enviar link", 15, 700, "#FFFFFF", f2, f2),
    page2_id))

# Arrow icon on button
arrow2 = uid()
changes.append(add_obj(arrow2, f2, f2,
    make_rect(arrow2, "IconArrow", INNER_X + 230, y + 16, 18, 18, "#FFFFFF", f2, f2, radius=2),
    page2_id))

# Success message
y += 66
suc_bg = uid()
changes.append(add_obj(suc_bg, f2, f2,
    make_rect(suc_bg, "MsgSucesso BG", INNER_X, y, INNER_W, 64, "#E8F8EF", f2, f2,
              radius=8, strokes=stroke_border("#B5E8C9")),
    page2_id))

suc_txt = uid()
changes.append(add_obj(suc_txt, f2, f2,
    make_text(suc_txt, "MsgSucesso Text", INNER_X + 16, y + 14, INNER_W - 32, 36,
        "Se o e-mail estiver cadastrado, você receberá um link de redefinição em instantes. Verifique sua caixa de entrada e spam.",
        13, 400, "#1E7A42", f2, f2, line_height=1.5),
    page2_id))

# Footer
y += 80
add_card_footer(changes, f2, page2_id, INNER_X, y, INNER_W)

send_changes(changes, "Page 01-Login-Forgot content")


# ═══════════════════════════════════════════
# Step 5: Page 01-Login-Reset
# ═══════════════════════════════════════════
print("\n-- Page: 01-Login-Reset --")
f3 = uid()
changes = []

changes.append(add_obj(f3, ROOT, ROOT,
    make_frame(f3, "01-Login-Reset", 0, 0, 1440, 900), page3_id))

add_branding_panel(changes, f3, page3_id)
add_form_panel_bg(changes, f3, page3_id)

# Card
card3 = uid()
changes.append(add_obj(card3, f3, f3,
    make_rect(card3, "CardReset", CARD_X, CARD_Y, CARD_W, 540, "#FFFFFF", f3, f3,
              radius=16, strokes=stroke_border("#E8E8E6")),
    page3_id))

y = CARD_Y + 44

# "← Voltar ao login"
back_icon3 = uid()
changes.append(add_obj(back_icon3, f3, f3,
    make_rect(back_icon3, "IconArrowLeft", INNER_X, y, 16, 16, "#888888", f3, f3, radius=2),
    page3_id))

back_txt3 = uid()
changes.append(add_obj(back_txt3, f3, f3,
    make_text(back_txt3, "Voltar ao login", INNER_X + 20, y, 100, 16,
        "Voltar ao login", 13, 600, "#888888", f3, f3),
    page3_id))

# "Redefinir senha"
y += 32
t3_title = uid()
changes.append(add_obj(t3_title, f3, f3,
    make_text(t3_title, "Redefinir senha", INNER_X, y, INNER_W, 30,
        "Redefinir senha", 24, 800, "#111111", f3, f3,
        letter_spacing=-0.5, line_height=1.25),
    page3_id))

y += 36
t3_sub = uid()
changes.append(add_obj(t3_sub, f3, f3,
    make_text(t3_sub, "Subtítulo Reset", INNER_X, y, INNER_W, 20,
        "Crie uma nova senha segura para sua conta.",
        14, 400, "#888888", f3, f3, line_height=1.43),
    page3_id))

# ── NOVA SENHA field ──
y += 40
lbl_new = uid()
changes.append(add_obj(lbl_new, f3, f3,
    make_text(lbl_new, "Label Nova Senha", INNER_X, y, INNER_W, 14,
        "NOVA SENHA", 11, 700, "#333333", f3, f3,
        uppercase=True, letter_spacing=0.8, line_height=1.27),
    page3_id))

y += 22
inp_new = uid()
changes.append(add_obj(inp_new, f3, f3,
    make_rect(inp_new, "InputNovaSenha", INNER_X, y, INNER_W, 48, "#FFFFFF", f3, f3,
              radius=10, strokes=stroke_border("#E8E8E6")),
    page3_id))

lock3 = uid()
changes.append(add_obj(lock3, f3, f3,
    make_rect(lock3, "IconLock", INNER_X + 14, y + 15, 18, 18, "#CCCCCC", f3, f3, radius=2),
    page3_id))

ph_new = uid()
changes.append(add_obj(ph_new, f3, f3,
    make_text(ph_new, "Placeholder Nova Senha", INNER_X + 44, y + 14, 200, 20,
        "Mínimo 8 caracteres", 14, 400, "#CCCCCC", f3, f3),
    page3_id))

eye3 = uid()
changes.append(add_obj(eye3, f3, f3,
    make_rect(eye3, "IconEye", INNER_X + INNER_W - 32, y + 15, 18, 18, "#AAAAAA", f3, f3, radius=2),
    page3_id))

# Strength bars (4 bars, 2 red, 1 orange, 1 default = "Razoável")
y += 58
bar_w = (INNER_W - 12) / 4  # ~82px each, gap 4px
bar_colors = ["#E74C3C", "#E67E22", "#E67E22", "#E8E8E6"]
for i, bc in enumerate(bar_colors):
    bx = INNER_X + i * (bar_w + 4)
    bid = uid()
    changes.append(add_obj(bid, f3, f3,
        make_rect(bid, f"StrengthBar{i+1}", bx, y, bar_w, 3, bc, f3, f3, radius=2),
        page3_id))

str_label = uid()
changes.append(add_obj(str_label, f3, f3,
    make_text(str_label, "Razoável", INNER_X, y + 10, 60, 14,
        "Razoável", 11, 400, "#AAAAAA", f3, f3),
    page3_id))

# ── CONFIRMAR SENHA field ──
y += 36
lbl_confirm = uid()
changes.append(add_obj(lbl_confirm, f3, f3,
    make_text(lbl_confirm, "Label Confirmar", INNER_X, y, INNER_W, 14,
        "CONFIRMAR SENHA", 11, 700, "#333333", f3, f3,
        uppercase=True, letter_spacing=0.8, line_height=1.27),
    page3_id))

y += 22
inp_confirm = uid()
changes.append(add_obj(inp_confirm, f3, f3,
    make_rect(inp_confirm, "InputConfirmar", INNER_X, y, INNER_W, 48, "#FFFFFF", f3, f3,
              radius=10, strokes=stroke_border("#E8E8E6")),
    page3_id))

lock4 = uid()
changes.append(add_obj(lock4, f3, f3,
    make_rect(lock4, "IconLock2", INNER_X + 14, y + 15, 18, 18, "#CCCCCC", f3, f3, radius=2),
    page3_id))

ph_confirm = uid()
changes.append(add_obj(ph_confirm, f3, f3,
    make_text(ph_confirm, "Placeholder Confirmar", INNER_X + 44, y + 14, 200, 20,
        "Repita a nova senha", 14, 400, "#CCCCCC", f3, f3),
    page3_id))

# Button "Redefinir"
y += 68
btn_reset = uid()
changes.append(add_obj(btn_reset, f3, f3,
    make_rect(btn_reset, "BtnRedefinir", INNER_X, y, INNER_W, 50, "#2E86C1", f3, f3, radius=10),
    page3_id))

btn_reset_txt = uid()
changes.append(add_obj(btn_reset_txt, f3, f3,
    make_text(btn_reset_txt, "BtnRedefinir Text", INNER_X + 125, y + 15, 90, 20,
        "Redefinir", 15, 700, "#FFFFFF", f3, f3),
    page3_id))

# Arrow icon on button
arrow3 = uid()
changes.append(add_obj(arrow3, f3, f3,
    make_rect(arrow3, "IconArrow", INNER_X + 230, y + 16, 18, 18, "#FFFFFF", f3, f3, radius=2),
    page3_id))

# Footer
y += 66
add_card_footer(changes, f3, page3_id, INNER_X, y, INNER_W)

send_changes(changes, "Page 01-Login-Reset content")


# ═══════════════════════════════════════════
# Report
# ═══════════════════════════════════════════
print("\n==========================================")
print(" Login v3 — Relatório")
print("==========================================")
print(f" Projeto:    Sandbox")
print(f" Arquivo:    {FILE_ID}")
print("------------------------------------------")
print(" Páginas criadas:")
print(f"   1. 01-Login         (page: {page1_id})")
print(f"   2. 01-Login-Forgot  (page: {page2_id})")
print(f"   3. 01-Login-Reset   (page: {page3_id})")
print("------------------------------------------")
print(" Elementos por página:")
print("   01-Login:       ~50 shapes (branding + card completo)")
print("   01-Login-Forgot: ~30 shapes (branding + card forgot)")
print("   01-Login-Reset:  ~35 shapes (branding + card reset)")
print("==========================================")
