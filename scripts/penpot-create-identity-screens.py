"""
Create 40-Identity screens in Penpot Sandbox.
Uses transit+json REST API. Based on 40-identity-spec.md.

Pages:
  40-Identity-Scopes          — View 1: Lista de escopos organizacionais (UX-IDN-001)
  40-Identity-ScopeDrawer     — View 1 + Drawer Atribuir Escopo aberto
  40-Identity-Shares          — View 2: Tab Meus Compartilhamentos (UX-IDN-002)
  40-Identity-DelegationDrawer— View 2: Tab Delegações + Drawer Nova Delegação
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
BLUE_HOVER = "#256FA0"
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
WARN = "#E67E22"
GREEN = "#27AE60"
GREEN_BG = "#E8F8EF"
GREEN_BD = "#B5E8C9"
GREEN_TXT = "#1E7A42"
WARN_BG = "#FFF3E0"
WARN_BD = "#FFE0B2"
TABLE_HEADER_BG = "#FAFAFA"
PILL_BLUE_BD = "#B8D9F2"


# ═══════════════════════════════════════════
# SHARED: AppShell builder (Topbar + Sidebar)
# ═══════════════════════════════════════════

def build_appshell(frame_id, page_id, sidebar_active="Identidade Avançada"):
    """Returns list of (change, label) for topbar + sidebar."""
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
        make_text(bc1, "BC-Org", 218, 23, 90, 18, "Organização", 13, 400, T4, tb_id, frame_id),
        page_id))
    bc_sep = uid()
    changes.append(add_obj(bc_sep, tb_id, frame_id,
        make_text(bc_sep, "BC-Sep", 312, 23, 12, 18, "›", 13, 400, T6, tb_id, frame_id),
        page_id))
    bc2 = uid()
    changes.append(add_obj(bc2, tb_id, frame_id,
        make_text(bc2, "BC-Active", 328, 23, 160, 18, "Identidade Avançada", 13, 700, T1, tb_id, frame_id),
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
    y_pos = 88  # start after topbar + padding
    sidebar_items = [
        ("ADMINISTRAÇÃO", [("Usuários", False), ("Perfis e Permissões", False)]),
        ("ORGANIZAÇÃO", [("Estrutura Org.", False), ("Departamentos", False), ("Identidade Avançada", True)]),
        ("PROCESSOS", [("Modelagem", False)]),
    ]

    for cat_label, items in sidebar_items:
        cat_id = uid()
        changes.append(add_obj(cat_id, sb_id, frame_id,
            make_text(cat_id, f"Cat-{cat_label}", 28, y_pos, 200, 14, cat_label, 9, 700, T5, sb_id, frame_id,
                      uppercase=True, letter_spacing=1.4),
            page_id))
        y_pos += 22

        for item_label, is_active in items:
            active = (item_label == sidebar_active)
            item_bg_id = uid()
            item_fill = BLUE_LT if active else WHITE
            item_bg = make_rect(item_bg_id, f"SB-{item_label}-bg", 16, y_pos, 208, 36, item_fill, sb_id, frame_id, radius=6)
            changes.append(add_obj(item_bg_id, sb_id, frame_id, item_bg, page_id))

            item_txt = uid()
            item_color = BLUE if active else T4
            item_weight = 700 if active else 500
            changes.append(add_obj(item_txt, sb_id, frame_id,
                make_text(item_txt, f"SB-{item_label}", 44, y_pos + 9, 170, 18, item_label, 13, item_weight, item_color, sb_id, frame_id),
                page_id))
            y_pos += 38

        y_pos += 12  # gap between categories

    # Sidebar footer
    footer_y = 864  # near bottom: 64 + 836 - 36
    dot_id = uid()
    dot = make_rect(dot_id, "StatusDot", 16, footer_y, 8, 8, GREEN, sb_id, frame_id, radius=4)
    changes.append(add_obj(dot_id, sb_id, frame_id, dot, page_id))
    footer_txt = uid()
    changes.append(add_obj(footer_txt, sb_id, frame_id,
        make_text(footer_txt, "StatusText", 32, footer_y - 2, 120, 14, "Servidor Online", 12, 400, T4, sb_id, frame_id),
        page_id))

    return changes, sb_id, tb_id


# ═══════════════════════════════════════════
# SHARED: Table header builder
# ═══════════════════════════════════════════

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
# SHARED: Table row builders
# ═══════════════════════════════════════════

def build_v1_row(row_data, x, y, w, parent, frame, page_id):
    """Build a View 1 (Scopes) table row. row_data: dict with name, initials, email, av_color, scope_primary, scopes_extra, status, status_type"""
    changes = []
    row_id = uid()
    row = make_rect(row_id, f"Row-{row_data['name']}", x, y, w, 56, WHITE, parent, frame,
                    strokes=stroke_border(BORDER_LT, 1, "inner"))
    changes.append(add_obj(row_id, parent, frame, row, page_id))

    cx = x + 20

    # Avatar
    av_id = uid()
    av = make_rect(av_id, "Avatar", cx, y + 12, 32, 32, row_data.get('av_color', BLUE), row_id, frame, radius=16)
    changes.append(add_obj(av_id, row_id, frame, av, page_id))
    av_txt = uid()
    changes.append(add_obj(av_txt, row_id, frame,
        make_text(av_txt, "AvatarInitials", cx + 6, y + 18, 20, 14, row_data['initials'], 11, 700, WHITE, row_id, frame),
        page_id))

    # Name + email
    name_id = uid()
    changes.append(add_obj(name_id, row_id, frame,
        make_text(name_id, "Name", cx + 42, y + 12, 160, 18, row_data['name'], 13, 600, T1, row_id, frame),
        page_id))
    email_id = uid()
    changes.append(add_obj(email_id, row_id, frame,
        make_text(email_id, "Email", cx + 42, y + 32, 160, 16, row_data['email'], 12, 400, T4, row_id, frame),
        page_id))

    # Scope primary pill
    pill_x = cx + 220
    pill_id = uid()
    pill = make_rect(pill_id, "ScopePrimary", pill_x, y + 16, 120, 24, BLUE_LT, row_id, frame, radius=6,
                     strokes=stroke_border(PILL_BLUE_BD))
    changes.append(add_obj(pill_id, row_id, frame, pill, page_id))
    pill_txt = uid()
    changes.append(add_obj(pill_txt, row_id, frame,
        make_text(pill_txt, "ScopeText", pill_x + 8, y + 20, 70, 16, row_data['scope_primary'], 11, 600, BLUE, row_id, frame),
        page_id))
    badge_id = uid()
    badge = make_rect(badge_id, "BadgePrimary", pill_x + 82, y + 18, 34, 16, BLUE, row_id, frame, radius=4)
    changes.append(add_obj(badge_id, row_id, frame, badge, page_id))
    badge_txt = uid()
    changes.append(add_obj(badge_txt, row_id, frame,
        make_text(badge_txt, "BadgeText", pill_x + 83, y + 20, 32, 12, "PRIMARY", 9, 700, WHITE, row_id, frame, uppercase=True),
        page_id))

    # Extra scopes
    extra_x = cx + 420
    for i, scope in enumerate(row_data.get('scopes_extra', [])):
        sp_id = uid()
        sp = make_rect(sp_id, f"Scope-{scope}", extra_x + i * 90, y + 16, 82, 24, BG, row_id, frame, radius=6,
                       strokes=stroke_border(BORDER))
        changes.append(add_obj(sp_id, row_id, frame, sp, page_id))
        sp_txt = uid()
        changes.append(add_obj(sp_txt, row_id, frame,
            make_text(sp_txt, f"ScopeText-{scope}", extra_x + i * 90 + 8, y + 20, 66, 16, scope, 11, 600, T3, row_id, frame),
            page_id))

    # Status badge
    status_x = cx + 720
    st = row_data.get('status_type', 'active')
    st_colors = {
        'active': (GREEN_TXT, GREEN_BG, GREEN_BD),
        'warn': (WARN, WARN_BG, WARN_BD),
        'expired': (T4, BG, BORDER),
    }
    st_col, st_bg, st_bd = st_colors.get(st, st_colors['active'])
    st_id = uid()
    st_rect = make_rect(st_id, "StatusBadge", status_x, y + 18, 66, 20, st_bg, row_id, frame, radius=4,
                        strokes=stroke_border(st_bd))
    changes.append(add_obj(st_id, row_id, frame, st_rect, page_id))
    st_txt = uid()
    changes.append(add_obj(st_txt, row_id, frame,
        make_text(st_txt, "StatusText", status_x + 6, y + 21, 54, 14, row_data['status'], 10, 700, st_col, row_id, frame, uppercase=True),
        page_id))

    # Action icons (placeholders)
    act_x = cx + 820
    edit_id = uid()
    edit = make_rect(edit_id, "BtnEdit", act_x, y + 18, 20, 20, WHITE, row_id, frame, radius=4,
                     strokes=stroke_border(T4, 1, "center"))
    changes.append(add_obj(edit_id, row_id, frame, edit, page_id))
    rev_id = uid()
    rev = make_rect(rev_id, "BtnRevoke", act_x + 28, y + 18, 20, 20, WHITE, row_id, frame, radius=4,
                    strokes=stroke_border(T4, 1, "center"))
    changes.append(add_obj(rev_id, row_id, frame, rev, page_id))

    return changes


def build_v2_row(row_data, x, y, w, parent, frame, page_id):
    """View 2 shares table row. row_data: name, initials, av_color, scope, tipo, validade, status, status_type"""
    changes = []
    row_id = uid()
    row = make_rect(row_id, f"Row-{row_data['name']}", x, y, w, 52, WHITE, parent, frame,
                    strokes=stroke_border(BORDER_LT, 1, "inner"))
    changes.append(add_obj(row_id, parent, frame, row, page_id))

    cx = x + 20

    # Avatar small
    av_id = uid()
    av = make_rect(av_id, "Avatar", cx, y + 12, 28, 28, row_data.get('av_color', BLUE), row_id, frame, radius=14)
    changes.append(add_obj(av_id, row_id, frame, av, page_id))
    av_txt = uid()
    changes.append(add_obj(av_txt, row_id, frame,
        make_text(av_txt, "Initials", cx + 5, y + 18, 18, 12, row_data['initials'], 10, 700, WHITE, row_id, frame),
        page_id))

    # Name
    name_id = uid()
    changes.append(add_obj(name_id, row_id, frame,
        make_text(name_id, "Name", cx + 36, y + 17, 140, 18, row_data['name'], 13, 500, T1, row_id, frame),
        page_id))

    # Scope/Resource
    scope_id = uid()
    changes.append(add_obj(scope_id, row_id, frame,
        make_text(scope_id, "Scope", cx + 200, y + 17, 180, 18, row_data['scope'], 13, 500, T2, row_id, frame),
        page_id))

    # Tipo
    tipo_id = uid()
    changes.append(add_obj(tipo_id, row_id, frame,
        make_text(tipo_id, "Tipo", cx + 400, y + 19, 100, 16, row_data['tipo'], 12, 400, T3, row_id, frame),
        page_id))

    # Validade
    val_id = uid()
    changes.append(add_obj(val_id, row_id, frame,
        make_text(val_id, "Validade", cx + 520, y + 19, 120, 16, row_data['validade'], 12, 400, T4, row_id, frame),
        page_id))

    # Status
    st = row_data.get('status_type', 'active')
    st_colors = {
        'active': (GREEN_TXT, GREEN_BG, GREEN_BD),
        'warn': (WARN, WARN_BG, WARN_BD),
        'expired': (T4, BG, BORDER),
    }
    st_col, st_bg, st_bd = st_colors.get(st, st_colors['active'])
    st_id = uid()
    st_rect = make_rect(st_id, "StatusBadge", cx + 660, y + 16, 66, 20, st_bg, row_id, frame, radius=4,
                        strokes=stroke_border(st_bd))
    changes.append(add_obj(st_id, row_id, frame, st_rect, page_id))
    st_txt = uid()
    changes.append(add_obj(st_txt, row_id, frame,
        make_text(st_txt, "StatusText", cx + 666, y + 19, 54, 14, row_data['status'], 10, 700, st_col, row_id, frame, uppercase=True),
        page_id))

    # Action (revoke)
    rev_id = uid()
    rev = make_rect(rev_id, "BtnRevoke", cx + 750, y + 16, 20, 20, WHITE, row_id, frame, radius=4,
                    strokes=stroke_border(T4, 1, "center"))
    changes.append(add_obj(rev_id, row_id, frame, rev, page_id))

    return changes


# ═══════════════════════════════════════════
# PAGE 1: 40-Identity-Scopes
# ═══════════════════════════════════════════

print("\n=== PAGE 1: 40-Identity-Scopes ===")
p1_id = uid()
send_changes([add_page_change(p1_id, "40-Identity-Scopes")], "Add page 40-Identity-Scopes")

# Frame
f1_id = uid()
f1 = make_frame(f1_id, "40-Identity-Scopes", 0, 0, 1440, 900, BG)
changes_p1 = [add_obj(f1_id, ROOT, ROOT, f1, p1_id)]
send_changes(changes_p1, "Frame Scopes")

# AppShell
appshell_changes, sb1_id, tb1_id = build_appshell(f1_id, p1_id)
# Send in batches of 40
for i in range(0, len(appshell_changes), 40):
    batch = appshell_changes[i:i+40]
    send_changes(batch, f"AppShell batch {i//40+1}")

# Content area
ct_id = uid()
ct = make_rect(ct_id, "ContentArea", 240, 64, 1200, 836, BG, f1_id, f1_id)
changes_ct = [add_obj(ct_id, f1_id, f1_id, ct, p1_id)]

# Page header
ph_title = uid()
changes_ct.append(add_obj(ph_title, ct_id, f1_id,
    make_text(ph_title, "PageTitle", 264, 88, 400, 30, "Escopo Organizacional", 24, 800, T1, ct_id, f1_id),
    p1_id))
ph_desc = uid()
changes_ct.append(add_obj(ph_desc, ct_id, f1_id,
    make_text(ph_desc, "PageDesc", 264, 122, 500, 18, "Gerencie os vínculos de escopo organizacional dos usuários", 13, 400, T4, ct_id, f1_id),
    p1_id))

# Button Atribuir Escopo
btn_id = uid()
btn = make_rect(btn_id, "BtnAtribuir", 1280, 88, 160, 40, BLUE, ct_id, f1_id, radius=8)
changes_ct.append(add_obj(btn_id, ct_id, f1_id, btn, p1_id))
btn_txt = uid()
changes_ct.append(add_obj(btn_txt, ct_id, f1_id,
    make_text(btn_txt, "BtnAtribuirText", 1290, 98, 140, 18, "+ Atribuir Escopo", 13, 700, WHITE, ct_id, f1_id),
    p1_id))

# SearchBar
search_id = uid()
search = make_rect(search_id, "SearchBar", 264, 154, 320, 40, WHITE, ct_id, f1_id, radius=8,
                   strokes=stroke_border(BORDER))
changes_ct.append(add_obj(search_id, ct_id, f1_id, search, p1_id))
search_txt = uid()
changes_ct.append(add_obj(search_txt, ct_id, f1_id,
    make_text(search_txt, "SearchPlaceholder", 302, 164, 260, 18, "Buscar por nome ou e-mail...", 13, 400, T6, ct_id, f1_id),
    p1_id))

# Filters
f_tipo = uid()
f_tipo_r = make_rect(f_tipo, "FilterTipo", 1218, 154, 120, 36, WHITE, ct_id, f1_id, radius=6,
                     strokes=stroke_border(BORDER))
changes_ct.append(add_obj(f_tipo, ct_id, f1_id, f_tipo_r, p1_id))
f_tipo_t = uid()
changes_ct.append(add_obj(f_tipo_t, ct_id, f1_id,
    make_text(f_tipo_t, "FilterTipoText", 1228, 162, 100, 16, "Todos os Tipos", 12, 500, T2, ct_id, f1_id),
    p1_id))

f_status = uid()
f_status_r = make_rect(f_status, "FilterStatus", 1348, 154, 92, 36, WHITE, ct_id, f1_id, radius=6,
                       strokes=stroke_border(BORDER))
changes_ct.append(add_obj(f_status, ct_id, f1_id, f_status_r, p1_id))
f_status_t = uid()
changes_ct.append(add_obj(f_status_t, ct_id, f1_id,
    make_text(f_status_t, "FilterStatusText", 1356, 162, 80, 16, "Todos", 12, 500, T2, ct_id, f1_id),
    p1_id))

send_changes(changes_ct, "Content header + search + filters")

# Table card
tbl_id = uid()
tbl = make_rect(tbl_id, "TableCard", 264, 206, 1152, 400, WHITE, ct_id, f1_id, radius=12,
                strokes=stroke_border(BORDER))
tbl_changes = [add_obj(tbl_id, ct_id, f1_id, tbl, p1_id)]

# Table header
v1_cols = [("USUÁRIO", 0, 200), ("ESCOPO PRINCIPAL", 220, 180), ("ESCOPOS ADICIONAIS", 420, 200),
           ("STATUS", 720, 80), ("AÇÕES", 820, 60)]
hdr_changes, hdr_id = build_table_header(v1_cols, 264, 206, 1152, tbl_id, f1_id, p1_id)
tbl_changes.extend(hdr_changes)
send_changes(tbl_changes, "Table card + header")

# Table rows
v1_rows = [
    {"name": "Marcos Silva", "initials": "MS", "email": "marcos.silva@a1.com.br", "av_color": BLUE,
     "scope_primary": "Diretoria", "scopes_extra": ["Engenharia", "Operações"], "status": "ATIVO", "status_type": "active"},
    {"name": "Ana Oliveira", "initials": "AO", "email": "ana.oliveira@a1.com.br", "av_color": GREEN,
     "scope_primary": "Eng. Civil", "scopes_extra": ["Projetos"], "status": "ATIVO", "status_type": "active"},
    {"name": "Julia Lima", "initials": "JL", "email": "julia.lima@a1.com.br", "av_color": "#8E44AD",
     "scope_primary": "A1 Industrial", "scopes_extra": [], "status": "ATIVO", "status_type": "active"},
    {"name": "Pedro Mendes", "initials": "PM", "email": "pedro.mendes@a1.com.br", "av_color": "#1ABC9C",
     "scope_primary": "Produção", "scopes_extra": ["Logística", "Qualidade"], "status": "EXPIRA 3D", "status_type": "warn"},
    {"name": "Carlos Ferreira", "initials": "CF", "email": "carlos.ferreira@a1.com.br", "av_color": WARN,
     "scope_primary": "Diretoria", "scopes_extra": [], "status": "EXPIRADO", "status_type": "expired"},
]

for i, row_data in enumerate(v1_rows):
    row_y = 250 + i * 56  # after header
    row_changes = build_v1_row(row_data, 264, row_y, 1152, tbl_id, f1_id, p1_id)
    send_changes(row_changes, f"Row {i+1}: {row_data['name']}")

# Table footer
ft_id = uid()
ft = make_rect(ft_id, "TableFooter", 264, 530, 1152, 52, WHITE, tbl_id, f1_id,
               strokes=stroke_border(BORDER_LT, 1, "inner"))
ft_changes = [add_obj(ft_id, tbl_id, f1_id, ft, p1_id)]
ft_txt = uid()
ft_changes.append(add_obj(ft_txt, tbl_id, f1_id,
    make_text(ft_txt, "LoadMore", 660, 546, 120, 18, "Carregar mais", 13, 600, BLUE, tbl_id, f1_id),
    p1_id))
send_changes(ft_changes, "Table footer")


# ═══════════════════════════════════════════
# PAGE 2: 40-Identity-ScopeDrawer
# ═══════════════════════════════════════════

print("\n=== PAGE 2: 40-Identity-ScopeDrawer ===")
p2_id = uid()
send_changes([add_page_change(p2_id, "40-Identity-ScopeDrawer")], "Add page ScopeDrawer")

# Frame
f2_id = uid()
f2 = make_frame(f2_id, "40-Identity-ScopeDrawer", 0, 0, 1440, 900, BG)
send_changes([add_obj(f2_id, ROOT, ROOT, f2, p2_id)], "Frame ScopeDrawer")

# AppShell
as2, _, _ = build_appshell(f2_id, p2_id)
for i in range(0, len(as2), 40):
    send_changes(as2[i:i+40], f"AppShell P2 batch {i//40+1}")

# Content (dimmed)
ct2_id = uid()
ct2 = make_rect(ct2_id, "ContentArea", 240, 64, 1200, 836, BG, f2_id, f2_id, opacity=0.5)
ct2_changes = [add_obj(ct2_id, f2_id, f2_id, ct2, p2_id)]

# Title (dimmed content)
ph2_t = uid()
ct2_changes.append(add_obj(ph2_t, ct2_id, f2_id,
    make_text(ph2_t, "PageTitle", 264, 88, 400, 30, "Escopo Organizacional", 24, 800, T1, ct2_id, f2_id),
    p2_id))
ph2_d = uid()
ct2_changes.append(add_obj(ph2_d, ct2_id, f2_id,
    make_text(ph2_d, "PageDesc", 264, 122, 500, 18, "Gerencie os vínculos de escopo organizacional dos usuários", 13, 400, T4, ct2_id, f2_id),
    p2_id))

# Simplified table placeholder
tbl2_id = uid()
tbl2 = make_rect(tbl2_id, "TableCard", 264, 206, 1152, 300, WHITE, ct2_id, f2_id, radius=12,
                 strokes=stroke_border(BORDER))
ct2_changes.append(add_obj(tbl2_id, ct2_id, f2_id, tbl2, p2_id))

send_changes(ct2_changes, "Content P2 dimmed")

# Drawer overlay
overlay_id = uid()
overlay = make_rect(overlay_id, "DrawerOverlay", 240, 64, 1200, 836, "#000000", f2_id, f2_id, opacity=0.3)
send_changes([add_obj(overlay_id, f2_id, f2_id, overlay, p2_id)], "Drawer overlay")

# Drawer panel
dr_id = uid()
dr = make_rect(dr_id, "DrawerPanel", 960, 0, 480, 900, WHITE, f2_id, f2_id)
dr_changes = [add_obj(dr_id, f2_id, f2_id, dr, p2_id)]

# Drawer header
drh_id = uid()
drh = make_rect(drh_id, "DrawerHeader", 960, 0, 480, 64, WHITE, dr_id, f2_id,
                strokes=stroke_border(BORDER, 1, "inner"))
dr_changes.append(add_obj(drh_id, dr_id, f2_id, drh, p2_id))
drh_txt = uid()
dr_changes.append(add_obj(drh_txt, dr_id, f2_id,
    make_text(drh_txt, "DrawerTitle", 984, 22, 350, 22, "Atribuir Escopo Organizacional", 18, 700, T1, dr_id, f2_id),
    p2_id))
# Close button placeholder
close_id = uid()
close = make_rect(close_id, "BtnClose", 1408, 20, 24, 24, WHITE, dr_id, f2_id, radius=4,
                  strokes=stroke_border(T4, 1, "center"))
dr_changes.append(add_obj(close_id, dr_id, f2_id, close, p2_id))

send_changes(dr_changes, "Drawer header")

# Drawer body
drb_changes = []

# Field: USUÁRIO
lbl_user = uid()
drb_changes.append(add_obj(lbl_user, dr_id, f2_id,
    make_text(lbl_user, "LabelUsuario", 984, 88, 120, 14, "USUÁRIO", 10, 700, T4, dr_id, f2_id,
              uppercase=True, letter_spacing=0.8),
    p2_id))
input_user = uid()
inp_u = make_rect(input_user, "InputUsuario", 984, 108, 432, 42, WHITE, dr_id, f2_id, radius=8,
                  strokes=stroke_border(BORDER))
drb_changes.append(add_obj(input_user, dr_id, f2_id, inp_u, p2_id))
inp_u_txt = uid()
drb_changes.append(add_obj(inp_u_txt, dr_id, f2_id,
    make_text(inp_u_txt, "InputUserValue", 998, 118, 400, 20, "Ana Oliveira", 14, 500, T1, dr_id, f2_id),
    p2_id))

# Field: TIPO DE ESCOPO
lbl_tipo = uid()
drb_changes.append(add_obj(lbl_tipo, dr_id, f2_id,
    make_text(lbl_tipo, "LabelTipo", 984, 166, 150, 14, "TIPO DE ESCOPO", 10, 700, T4, dr_id, f2_id,
              uppercase=True, letter_spacing=0.8),
    p2_id))

# Radio: Principal
r1_circle = uid()
r1_c = make_rect(r1_circle, "RadioPrimary", 984, 188, 18, 18, WHITE, dr_id, f2_id, radius=9,
                 strokes=stroke_border(BORDER, 2))
drb_changes.append(add_obj(r1_circle, dr_id, f2_id, r1_c, p2_id))
r1_txt = uid()
drb_changes.append(add_obj(r1_txt, dr_id, f2_id,
    make_text(r1_txt, "RadioPrimaryText", 1008, 189, 160, 18, "Principal (PRIMARY)", 13, 500, T2, dr_id, f2_id),
    p2_id))

# Radio: Secundário (checked)
r2_circle = uid()
r2_c = make_rect(r2_circle, "RadioSecondary", 1180, 188, 18, 18, WHITE, dr_id, f2_id, radius=9,
                 strokes=stroke_border(BLUE, 2))
drb_changes.append(add_obj(r2_circle, dr_id, f2_id, r2_c, p2_id))
r2_dot = uid()
r2_d = make_rect(r2_dot, "RadioDot", 1184, 192, 10, 10, BLUE, dr_id, f2_id, radius=5)
drb_changes.append(add_obj(r2_dot, dr_id, f2_id, r2_d, p2_id))
r2_txt = uid()
drb_changes.append(add_obj(r2_txt, dr_id, f2_id,
    make_text(r2_txt, "RadioSecondaryText", 1204, 189, 180, 18, "Secundário (SECONDARY)", 13, 500, T2, dr_id, f2_id),
    p2_id))

send_changes(drb_changes, "Drawer fields: Usuario + Tipo")

# Field: ÁREA ORGANIZACIONAL (tree)
tree_changes = []
lbl_area = uid()
tree_changes.append(add_obj(lbl_area, dr_id, f2_id,
    make_text(lbl_area, "LabelArea", 984, 224, 200, 14, "ÁREA ORGANIZACIONAL", 10, 700, T4, dr_id, f2_id,
              uppercase=True, letter_spacing=0.8),
    p2_id))

tree_id = uid()
tree = make_rect(tree_id, "TreeSelector", 984, 244, 432, 260, WHITE, dr_id, f2_id, radius=8,
                 strokes=stroke_border(BORDER))
tree_changes.append(add_obj(tree_id, dr_id, f2_id, tree, p2_id))

# Tree nodes
tree_nodes = [
    ("Grupo A1", 0, 700, T1, False),
    ("A1 Engenharia", 24, 600, T2, False),
    ("Diretoria", 48, 500, T2, True),  # selected
    ("Engenharia Civil", 48, 500, T2, False),
    ("Projetos Especiais", 48, 500, T2, False),
    ("Infraestrutura", 72, 500, T3, False),
    ("A1 Industrial", 24, 600, T2, False),
    ("A1 Agro", 24, 600, T2, False),
]

for i, (label, indent, weight, color, selected) in enumerate(tree_nodes):
    node_y = 252 + i * 30
    if selected:
        sel_bg = uid()
        sel_r = make_rect(sel_bg, f"NodeBg-{label}", 984, node_y, 432, 28, BLUE_LT, tree_id, f2_id)
        tree_changes.append(add_obj(sel_bg, tree_id, f2_id, sel_r, p2_id))
    # Checkbox
    chk_id = uid()
    chk_fill = BLUE if selected else WHITE
    chk = make_rect(chk_id, f"Chk-{label}", 996 + indent, node_y + 6, 16, 16, chk_fill, tree_id, f2_id, radius=4,
                    strokes=stroke_border(BLUE if selected else BORDER, 2))
    tree_changes.append(add_obj(chk_id, tree_id, f2_id, chk, p2_id))
    # Label
    node_txt = uid()
    node_color = BLUE if selected else color
    tree_changes.append(add_obj(node_txt, tree_id, f2_id,
        make_text(node_txt, f"Node-{label}", 1020 + indent, node_y + 5, 200, 18, label, 13, weight, node_color, tree_id, f2_id),
        p2_id))

send_changes(tree_changes, "Tree selector")

# Field: VÁLIDO ATÉ
val_changes = []
lbl_val = uid()
val_changes.append(add_obj(lbl_val, dr_id, f2_id,
    make_text(lbl_val, "LabelValidade", 984, 520, 200, 14, "VÁLIDO ATÉ (OPCIONAL)", 10, 700, T4, dr_id, f2_id,
              uppercase=True, letter_spacing=0.8),
    p2_id))
input_val = uid()
inp_v = make_rect(input_val, "InputValidade", 984, 540, 432, 42, WHITE, dr_id, f2_id, radius=8,
                  strokes=stroke_border(BORDER))
val_changes.append(add_obj(input_val, dr_id, f2_id, inp_v, p2_id))
inp_v_txt = uid()
val_changes.append(add_obj(inp_v_txt, dr_id, f2_id,
    make_text(inp_v_txt, "InputValPlaceholder", 998, 550, 200, 20, "dd/mm/aaaa", 14, 400, T6, dr_id, f2_id),
    p2_id))

# Drawer footer
drf_id = uid()
drf = make_rect(drf_id, "DrawerFooter", 960, 828, 480, 72, WHITE, dr_id, f2_id,
                strokes=stroke_border(BORDER, 1, "inner"))
val_changes.append(add_obj(drf_id, dr_id, f2_id, drf, p2_id))

btn_cancel = uid()
btn_c = make_rect(btn_cancel, "BtnCancelar", 1276, 844, 80, 40, WHITE, dr_id, f2_id, radius=8,
                  strokes=stroke_border(BORDER))
val_changes.append(add_obj(btn_cancel, dr_id, f2_id, btn_c, p2_id))
btn_c_txt = uid()
val_changes.append(add_obj(btn_c_txt, dr_id, f2_id,
    make_text(btn_c_txt, "CancelarText", 1284, 854, 66, 18, "Cancelar", 13, 600, T3, dr_id, f2_id),
    p2_id))

btn_vincular = uid()
btn_v = make_rect(btn_vincular, "BtnVincular", 1364, 844, 72, 40, BLUE, dr_id, f2_id, radius=8)
val_changes.append(add_obj(btn_vincular, dr_id, f2_id, btn_v, p2_id))
btn_v_txt = uid()
val_changes.append(add_obj(btn_v_txt, dr_id, f2_id,
    make_text(btn_v_txt, "VincularText", 1374, 854, 52, 18, "Vincular", 13, 700, WHITE, dr_id, f2_id),
    p2_id))

send_changes(val_changes, "Validade + footer")


# ═══════════════════════════════════════════
# PAGE 3: 40-Identity-Shares
# ═══════════════════════════════════════════

print("\n=== PAGE 3: 40-Identity-Shares ===")
p3_id = uid()
send_changes([add_page_change(p3_id, "40-Identity-Shares")], "Add page Shares")

# Frame
f3_id = uid()
f3 = make_frame(f3_id, "40-Identity-Shares", 0, 0, 1440, 900, BG)
send_changes([add_obj(f3_id, ROOT, ROOT, f3, p3_id)], "Frame Shares")

# AppShell
as3, _, _ = build_appshell(f3_id, p3_id)
for i in range(0, len(as3), 40):
    send_changes(as3[i:i+40], f"AppShell P3 batch {i//40+1}")

# Content
ct3_id = uid()
ct3 = make_rect(ct3_id, "ContentArea", 240, 64, 1200, 836, BG, f3_id, f3_id)
ct3_changes = [add_obj(ct3_id, f3_id, f3_id, ct3, p3_id)]

# Page header
ph3_t = uid()
ct3_changes.append(add_obj(ph3_t, ct3_id, f3_id,
    make_text(ph3_t, "PageTitle", 264, 88, 500, 30, "Compartilhamentos e Delegações", 24, 800, T1, ct3_id, f3_id),
    p3_id))
ph3_d = uid()
ct3_changes.append(add_obj(ph3_d, ct3_id, f3_id,
    make_text(ph3_d, "PageDesc", 264, 122, 500, 18, "Gerencie compartilhamentos de acesso e delegações de escopo", 13, 400, T4, ct3_id, f3_id),
    p3_id))

# Button
btn3_id = uid()
btn3 = make_rect(btn3_id, "BtnNovo", 1240, 88, 200, 40, BLUE, ct3_id, f3_id, radius=8)
ct3_changes.append(add_obj(btn3_id, ct3_id, f3_id, btn3, p3_id))
btn3_txt = uid()
ct3_changes.append(add_obj(btn3_txt, ct3_id, f3_id,
    make_text(btn3_txt, "BtnNovoText", 1250, 98, 180, 18, "+ Novo Compartilhamento", 13, 700, WHITE, ct3_id, f3_id),
    p3_id))

# Tab bar
tab_y = 154
tab_bar_id = uid()
tab_bar = make_rect(tab_bar_id, "TabBar", 264, tab_y, 1152, 44, BG, ct3_id, f3_id,
                    strokes=stroke_border(BORDER, 2, "inner"))
ct3_changes.append(add_obj(tab_bar_id, ct3_id, f3_id, tab_bar, p3_id))

# Tab active
tab1_id = uid()
tab1_bg = make_rect(tab1_id, "TabActive", 264, tab_y, 210, 44, BG, tab_bar_id, f3_id,
                    strokes=stroke_border(BLUE, 2, "inner"))
ct3_changes.append(add_obj(tab1_id, tab_bar_id, f3_id, tab1_bg, p3_id))
tab1_txt = uid()
ct3_changes.append(add_obj(tab1_txt, tab_bar_id, f3_id,
    make_text(tab1_txt, "Tab1Text", 284, tab_y + 13, 180, 18, "Meus Compartilhamentos", 13, 700, BLUE, tab_bar_id, f3_id),
    p3_id))

# Tab inactive 2
tab2_txt = uid()
ct3_changes.append(add_obj(tab2_txt, tab_bar_id, f3_id,
    make_text(tab2_txt, "Tab2Text", 494, tab_y + 13, 160, 18, "Minhas Delegações", 13, 500, T4, tab_bar_id, f3_id),
    p3_id))

# Tab inactive 3
tab3_txt = uid()
ct3_changes.append(add_obj(tab3_txt, tab_bar_id, f3_id,
    make_text(tab3_txt, "Tab3Text", 674, tab_y + 13, 150, 18, "Acessos Recebidos", 13, 500, T4, tab_bar_id, f3_id),
    p3_id))

send_changes(ct3_changes, "Content P3 header + tabs")

# Table
tbl3_id = uid()
tbl3 = make_rect(tbl3_id, "TableCard", 264, 214, 1152, 340, WHITE, ct3_id, f3_id, radius=12,
                 strokes=stroke_border(BORDER))
tbl3_changes = [add_obj(tbl3_id, ct3_id, f3_id, tbl3, p3_id)]

v2_cols = [("COMPARTILHADO COM", 0, 180), ("ESCOPO / RECURSO", 200, 180),
           ("TIPO", 400, 100), ("VALIDADE", 520, 120), ("STATUS", 660, 80), ("AÇÕES", 750, 60)]
hdr3_changes, hdr3_id = build_table_header(v2_cols, 264, 214, 1152, tbl3_id, f3_id, p3_id)
tbl3_changes.extend(hdr3_changes)
send_changes(tbl3_changes, "Table P3 + header")

# Shares rows
v2_rows = [
    {"name": "Ana Oliveira", "initials": "AO", "av_color": GREEN, "scope": "Relatórios Diretoria",
     "tipo": "Leitura", "validade": "até 15 abr 2026", "status": "ATIVO", "status_type": "active"},
    {"name": "Julia Lima", "initials": "JL", "av_color": "#8E44AD", "scope": "Dashboard Operacional",
     "tipo": "Leitura + Edição", "validade": "EXPIRA EM 3D", "status": "ATIVO", "status_type": "active"},
    {"name": "Pedro Mendes", "initials": "PM", "av_color": "#1ABC9C", "scope": "Relatórios Produção",
     "tipo": "Leitura", "validade": "até 30 mar 2026", "status": "EXPIRADO", "status_type": "expired"},
    {"name": "Carlos Ferreira", "initials": "CF", "av_color": WARN, "scope": "Contratos Engenharia",
     "tipo": "Leitura", "validade": "até 01 jun 2026", "status": "ATIVO", "status_type": "active"},
]

for i, row_data in enumerate(v2_rows):
    row_y = 258 + i * 52
    row_changes = build_v2_row(row_data, 264, row_y, 1152, tbl3_id, f3_id, p3_id)
    send_changes(row_changes, f"Share row {i+1}: {row_data['name']}")

# Footer
ft3_id = uid()
ft3 = make_rect(ft3_id, "TableFooter", 264, 466, 1152, 52, WHITE, tbl3_id, f3_id,
                strokes=stroke_border(BORDER_LT, 1, "inner"))
ft3_changes = [add_obj(ft3_id, tbl3_id, f3_id, ft3, p3_id)]
ft3_txt = uid()
ft3_changes.append(add_obj(ft3_txt, tbl3_id, f3_id,
    make_text(ft3_txt, "LoadMore", 660, 482, 120, 18, "Carregar mais", 13, 600, BLUE, tbl3_id, f3_id),
    p3_id))
send_changes(ft3_changes, "Table P3 footer")


# ═══════════════════════════════════════════
# PAGE 4: 40-Identity-DelegationDrawer
# ═══════════════════════════════════════════

print("\n=== PAGE 4: 40-Identity-DelegationDrawer ===")
p4_id = uid()
send_changes([add_page_change(p4_id, "40-Identity-DelegationDrawer")], "Add page DelegationDrawer")

# Frame
f4_id = uid()
f4 = make_frame(f4_id, "40-Identity-DelegationDrawer", 0, 0, 1440, 900, BG)
send_changes([add_obj(f4_id, ROOT, ROOT, f4, p4_id)], "Frame DelegationDrawer")

# AppShell
as4, _, _ = build_appshell(f4_id, p4_id)
for i in range(0, len(as4), 40):
    send_changes(as4[i:i+40], f"AppShell P4 batch {i//40+1}")

# Content (dimmed)
ct4_id = uid()
ct4 = make_rect(ct4_id, "ContentArea", 240, 64, 1200, 836, BG, f4_id, f4_id, opacity=0.5)
ct4_changes = [add_obj(ct4_id, f4_id, f4_id, ct4, p4_id)]

# Title
ph4_t = uid()
ct4_changes.append(add_obj(ph4_t, ct4_id, f4_id,
    make_text(ph4_t, "PageTitle", 264, 88, 500, 30, "Compartilhamentos e Delegações", 24, 800, T1, ct4_id, f4_id),
    p4_id))

# Tabs (Delegações active)
tab4_y = 154
tab4_bar = uid()
tab4_b = make_rect(tab4_bar, "TabBar", 264, tab4_y, 1152, 44, BG, ct4_id, f4_id,
                   strokes=stroke_border(BORDER, 2, "inner"))
ct4_changes.append(add_obj(tab4_bar, ct4_id, f4_id, tab4_b, p4_id))
t4_1 = uid()
ct4_changes.append(add_obj(t4_1, tab4_bar, f4_id,
    make_text(t4_1, "Tab1", 284, tab4_y + 13, 180, 18, "Meus Compartilhamentos", 13, 500, T4, tab4_bar, f4_id),
    p4_id))
t4_2_bg = uid()
t4_2_r = make_rect(t4_2_bg, "TabDelegActive", 474, tab4_y, 160, 44, BG, tab4_bar, f4_id,
                   strokes=stroke_border(BLUE, 2, "inner"))
ct4_changes.append(add_obj(t4_2_bg, tab4_bar, f4_id, t4_2_r, p4_id))
t4_2 = uid()
ct4_changes.append(add_obj(t4_2, tab4_bar, f4_id,
    make_text(t4_2, "Tab2Active", 494, tab4_y + 13, 140, 18, "Minhas Delegações", 13, 700, BLUE, tab4_bar, f4_id),
    p4_id))
t4_3 = uid()
ct4_changes.append(add_obj(t4_3, tab4_bar, f4_id,
    make_text(t4_3, "Tab3", 654, tab4_y + 13, 150, 18, "Acessos Recebidos", 13, 500, T4, tab4_bar, f4_id),
    p4_id))

# Section: Delegações Dadas
sec_title = uid()
ct4_changes.append(add_obj(sec_title, ct4_id, f4_id,
    make_text(sec_title, "SecTitle", 264, 214, 200, 22, "Delegações Dadas", 16, 700, T1, ct4_id, f4_id),
    p4_id))

# Mini table placeholder
mini_tbl = uid()
mini_t = make_rect(mini_tbl, "DelegTable", 264, 244, 1152, 100, WHITE, ct4_id, f4_id, radius=12,
                   strokes=stroke_border(BORDER))
ct4_changes.append(add_obj(mini_tbl, ct4_id, f4_id, mini_t, p4_id))

# One row placeholder
d_row_txt = uid()
ct4_changes.append(add_obj(d_row_txt, ct4_id, f4_id,
    make_text(d_row_txt, "DelegRow", 284, 290, 400, 18, "Ana Oliveira — identity:read, identity:write — 01/04-15/04/2026", 12, 400, T2, ct4_id, f4_id),
    p4_id))

send_changes(ct4_changes, "Content P4 dimmed + tabs + deleg")

# Drawer overlay
ov4_id = uid()
ov4 = make_rect(ov4_id, "DrawerOverlay", 240, 64, 1200, 836, "#000000", f4_id, f4_id, opacity=0.3)
send_changes([add_obj(ov4_id, f4_id, f4_id, ov4, p4_id)], "Overlay P4")

# Drawer panel
dr4_id = uid()
dr4 = make_rect(dr4_id, "DrawerPanel", 960, 0, 480, 900, WHITE, f4_id, f4_id)
dr4_changes = [add_obj(dr4_id, f4_id, f4_id, dr4, p4_id)]

# Header
drh4_id = uid()
drh4 = make_rect(drh4_id, "DrawerHeader", 960, 0, 480, 64, WHITE, dr4_id, f4_id,
                 strokes=stroke_border(BORDER, 1, "inner"))
dr4_changes.append(add_obj(drh4_id, dr4_id, f4_id, drh4, p4_id))
drh4_txt = uid()
dr4_changes.append(add_obj(drh4_txt, dr4_id, f4_id,
    make_text(drh4_txt, "DrawerTitle", 984, 22, 300, 22, "Nova Delegação", 18, 700, T1, dr4_id, f4_id),
    p4_id))
close4 = uid()
close4_r = make_rect(close4, "BtnClose", 1408, 20, 24, 24, WHITE, dr4_id, f4_id, radius=4,
                     strokes=stroke_border(T4, 1, "center"))
dr4_changes.append(add_obj(close4, dr4_id, f4_id, close4_r, p4_id))

# Banner info
banner4 = uid()
banner4_r = make_rect(banner4, "BannerInfo", 984, 80, 432, 40, BLUE_LT, dr4_id, f4_id, radius=8,
                      strokes=stroke_border(PILL_BLUE_BD))
dr4_changes.append(add_obj(banner4, dr4_id, f4_id, banner4_r, p4_id))
banner4_txt = uid()
dr4_changes.append(add_obj(banner4_txt, dr4_id, f4_id,
    make_text(banner4_txt, "BannerText", 1000, 88, 400, 24, "Os escopos delegados não podem ser re-delegados pelo beneficiário.", 12, 500, BLUE, dr4_id, f4_id),
    p4_id))

send_changes(dr4_changes, "Drawer P4 header + banner")

# Drawer body fields
drb4 = []

# DELEGADO
lbl4_del = uid()
drb4.append(add_obj(lbl4_del, dr4_id, f4_id,
    make_text(lbl4_del, "LabelDelegado", 984, 136, 120, 14, "DELEGADO", 10, 700, T4, dr4_id, f4_id,
              uppercase=True, letter_spacing=0.8),
    p4_id))
inp4_del = uid()
inp4_d = make_rect(inp4_del, "InputDelegado", 984, 156, 432, 42, WHITE, dr4_id, f4_id, radius=8,
                   strokes=stroke_border(BORDER))
drb4.append(add_obj(inp4_del, dr4_id, f4_id, inp4_d, p4_id))
inp4_d_txt = uid()
drb4.append(add_obj(inp4_d_txt, dr4_id, f4_id,
    make_text(inp4_d_txt, "DelegadoValue", 998, 166, 400, 20, "Julia Lima", 14, 500, T1, dr4_id, f4_id),
    p4_id))

# ESCOPOS A DELEGAR
lbl4_esc = uid()
drb4.append(add_obj(lbl4_esc, dr4_id, f4_id,
    make_text(lbl4_esc, "LabelEscopos", 984, 214, 200, 14, "ESCOPOS A DELEGAR", 10, 700, T4, dr4_id, f4_id,
              uppercase=True, letter_spacing=0.8),
    p4_id))

scope_list = uid()
scope_l = make_rect(scope_list, "ScopeList", 984, 234, 432, 200, WHITE, dr4_id, f4_id, radius=8,
                    strokes=stroke_border(BORDER))
drb4.append(add_obj(scope_list, dr4_id, f4_id, scope_l, p4_id))

scopes = [
    ("identity:read", True, False),
    ("identity:write", True, False),
    ("org:read", False, False),
    ("identity:approve", False, True),
    ("identity:execute", False, True),
    ("identity:sign", False, True),
]

for i, (scope_name, checked, disabled) in enumerate(scopes):
    sy = 242 + i * 30
    # Checkbox
    sc_chk = uid()
    chk_fill = BLUE if checked else WHITE
    chk_opacity = 0.4 if disabled else 1
    sc_c = make_rect(sc_chk, f"Chk-{scope_name}", 996, sy + 4, 16, 16, chk_fill, scope_list, f4_id, radius=4,
                     strokes=stroke_border(BLUE if checked else BORDER, 2), opacity=chk_opacity)
    drb4.append(add_obj(sc_chk, scope_list, f4_id, sc_c, p4_id))
    # Label
    sc_txt = uid()
    sc_color = T2 if not disabled else T5
    drb4.append(add_obj(sc_txt, scope_list, f4_id,
        make_text(sc_txt, f"Scope-{scope_name}", 1020, sy + 3, 200, 18, scope_name, 13, 500, sc_color, scope_list, f4_id),
        p4_id))

send_changes(drb4, "Drawer P4 delegado + escopos")

# PERÍODO + MOTIVO + Footer
drb4b = []

lbl4_per = uid()
drb4b.append(add_obj(lbl4_per, dr4_id, f4_id,
    make_text(lbl4_per, "LabelPeriodo", 984, 450, 120, 14, "PERÍODO", 10, 700, T4, dr4_id, f4_id,
              uppercase=True, letter_spacing=0.8),
    p4_id))

inp4_ini = uid()
inp4_i = make_rect(inp4_ini, "InputInicio", 984, 470, 210, 42, WHITE, dr4_id, f4_id, radius=8,
                   strokes=stroke_border(BORDER))
drb4b.append(add_obj(inp4_ini, dr4_id, f4_id, inp4_i, p4_id))
inp4_i_t = uid()
drb4b.append(add_obj(inp4_i_t, dr4_id, f4_id,
    make_text(inp4_i_t, "InicioValue", 998, 480, 180, 20, "01/04/2026", 14, 500, T1, dr4_id, f4_id),
    p4_id))

inp4_fim = uid()
inp4_f = make_rect(inp4_fim, "InputFim", 1206, 470, 210, 42, WHITE, dr4_id, f4_id, radius=8,
                   strokes=stroke_border(BORDER))
drb4b.append(add_obj(inp4_fim, dr4_id, f4_id, inp4_f, p4_id))
inp4_f_t = uid()
drb4b.append(add_obj(inp4_f_t, dr4_id, f4_id,
    make_text(inp4_f_t, "FimValue", 1220, 480, 180, 20, "15/04/2026", 14, 500, T1, dr4_id, f4_id),
    p4_id))

# MOTIVO
lbl4_mot = uid()
drb4b.append(add_obj(lbl4_mot, dr4_id, f4_id,
    make_text(lbl4_mot, "LabelMotivo", 984, 528, 120, 14, "MOTIVO", 10, 700, T4, dr4_id, f4_id,
              uppercase=True, letter_spacing=0.8),
    p4_id))
ta4 = uid()
ta4_r = make_rect(ta4, "TextareaMotivo", 984, 548, 432, 80, WHITE, dr4_id, f4_id, radius=8,
                  strokes=stroke_border(BORDER))
drb4b.append(add_obj(ta4, dr4_id, f4_id, ta4_r, p4_id))
ta4_txt = uid()
drb4b.append(add_obj(ta4_txt, dr4_id, f4_id,
    make_text(ta4_txt, "MotivoValue", 998, 558, 400, 60, "Férias do titular — cobertura temporária de escopos de identidade", 14, 500, T1, dr4_id, f4_id),
    p4_id))

# Footer
drf4 = uid()
drf4_r = make_rect(drf4, "DrawerFooter", 960, 828, 480, 72, WHITE, dr4_id, f4_id,
                   strokes=stroke_border(BORDER, 1, "inner"))
drb4b.append(add_obj(drf4, dr4_id, f4_id, drf4_r, p4_id))

btn4_c = uid()
btn4_cr = make_rect(btn4_c, "BtnCancelar", 1248, 844, 80, 40, WHITE, dr4_id, f4_id, radius=8,
                    strokes=stroke_border(BORDER))
drb4b.append(add_obj(btn4_c, dr4_id, f4_id, btn4_cr, p4_id))
btn4_ct = uid()
drb4b.append(add_obj(btn4_ct, dr4_id, f4_id,
    make_text(btn4_ct, "CancelarText", 1256, 854, 66, 18, "Cancelar", 13, 600, T3, dr4_id, f4_id),
    p4_id))

btn4_s = uid()
btn4_sr = make_rect(btn4_s, "BtnCriarDelegacao", 1336, 844, 100, 40, BLUE, dr4_id, f4_id, radius=8)
drb4b.append(add_obj(btn4_s, dr4_id, f4_id, btn4_sr, p4_id))
btn4_st = uid()
drb4b.append(add_obj(btn4_st, dr4_id, f4_id,
    make_text(btn4_st, "CriarText", 1344, 854, 86, 18, "Criar Delegação", 13, 700, WHITE, dr4_id, f4_id),
    p4_id))

send_changes(drb4b, "Drawer P4 periodo + motivo + footer")

print("\n=== DONE! All 4 pages created successfully ===")
