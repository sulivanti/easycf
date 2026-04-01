"""
Create 5 missing 40-Identity frames in Penpot Sandbox.
Uses transit+json REST API. Based on 40-identity-spec.md.

Pages:
  40-Identity-Delegations    — View 2, Tab 2: Minhas Delegações
  40-Identity-Received       — View 2, Tab 3: Acessos Recebidos
  40-Identity-ShareDrawer    — View 2, Tab 1 + Drawer Novo Compartilhamento
  40-Identity-RevokeModal    — View 2, Tab 1 + Modal Revogar Compartilhamento
  40-Identity-RemoveScopeModal — View 1 + Modal Remover Escopo PRIMARY
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
RED_BG = "#FFEBEE"


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
# SHARED: View 2 page header + tab bar
# ═══════════════════════════════════════════

def build_v2_header_tabs(ct_id, frame_id, page_id, active_tab=1, show_button=True, button_text="+ Novo Compartilhamento"):
    """Build page header + tab bar for View 2. Returns changes list."""
    changes = []

    # Page header
    ph_t = uid()
    changes.append(add_obj(ph_t, ct_id, frame_id,
        make_text(ph_t, "PageTitle", 264, 88, 500, 30, "Compartilhamentos e Delegações", 24, 800, T1, ct_id, frame_id),
        page_id))
    ph_d = uid()
    changes.append(add_obj(ph_d, ct_id, frame_id,
        make_text(ph_d, "PageDesc", 264, 122, 500, 18, "Gerencie compartilhamentos de acesso e delegações de escopo", 13, 400, T4, ct_id, frame_id),
        page_id))

    # Button
    if show_button:
        btn_id = uid()
        btn_w = len(button_text) * 9 + 40
        btn = make_rect(btn_id, "BtnNovo", 1440 - btn_w - 24, 88, btn_w, 40, BLUE, ct_id, frame_id, radius=8)
        changes.append(add_obj(btn_id, ct_id, frame_id, btn, page_id))
        btn_txt = uid()
        changes.append(add_obj(btn_txt, ct_id, frame_id,
            make_text(btn_txt, "BtnNovoText", 1440 - btn_w - 14, 98, btn_w - 20, 18, button_text, 13, 700, WHITE, ct_id, frame_id),
            page_id))

    # Tab bar
    tab_y = 154
    tab_bar_id = uid()
    tab_bar = make_rect(tab_bar_id, "TabBar", 264, tab_y, 1152, 44, BG, ct_id, frame_id,
                        strokes=stroke_border(BORDER, 2, "inner"))
    changes.append(add_obj(tab_bar_id, ct_id, frame_id, tab_bar, page_id))

    tabs = [
        ("Meus Compartilhamentos", 264, 210),
        ("Minhas Delegações", 474, 160),
        ("Acessos Recebidos", 634, 150),
    ]

    for i, (label, tx, tw) in enumerate(tabs):
        tab_num = i + 1
        is_active = (tab_num == active_tab)

        if is_active:
            tab_bg_id = uid()
            tab_bg = make_rect(tab_bg_id, f"Tab{tab_num}Active", tx, tab_y, tw, 44, BG, tab_bar_id, frame_id,
                               strokes=stroke_border(BLUE, 2, "inner"))
            changes.append(add_obj(tab_bg_id, tab_bar_id, frame_id, tab_bg, page_id))

        tab_txt = uid()
        tab_color = BLUE if is_active else T4
        tab_weight = 700 if is_active else 500
        changes.append(add_obj(tab_txt, tab_bar_id, frame_id,
            make_text(tab_txt, f"Tab{tab_num}Text", tx + 20, tab_y + 13, tw - 40, 18, label, 13, tab_weight, tab_color, tab_bar_id, frame_id),
            page_id))

    return changes, tab_bar_id


# ═══════════════════════════════════════════
# SHARED: Delegation table row builder
# ═══════════════════════════════════════════

def build_deleg_row(row_data, x, y, w, parent, frame, page_id, show_actions=True):
    """Delegation table row. row_data: name, initials, av_color, scopes, periodo, motivo"""
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

    # Scopes (as pills)
    scopes_x = cx + 200
    for i, scope in enumerate(row_data.get('scopes', [])):
        pill_id = uid()
        pill_w = len(scope) * 7 + 16
        pill = make_rect(pill_id, f"Scope-{scope}", scopes_x + i * (pill_w + 6), y + 16, pill_w, 22, BLUE_LT, row_id, frame,
                         radius=6, strokes=stroke_border(PILL_BLUE_BD))
        changes.append(add_obj(pill_id, row_id, frame, pill, page_id))
        pill_txt = uid()
        changes.append(add_obj(pill_txt, row_id, frame,
            make_text(pill_txt, f"ScopeText-{scope}", scopes_x + i * (pill_w + 6) + 8, y + 19, pill_w - 16, 16, scope, 11, 600, BLUE, row_id, frame),
            page_id))

    # Período
    per_id = uid()
    changes.append(add_obj(per_id, row_id, frame,
        make_text(per_id, "Periodo", cx + 500, y + 19, 140, 16, row_data.get('periodo', ''), 12, 400, T4, row_id, frame),
        page_id))

    # Motivo
    mot_id = uid()
    changes.append(add_obj(mot_id, row_id, frame,
        make_text(mot_id, "Motivo", cx + 660, y + 19, 140, 16, row_data.get('motivo', ''), 12, 400, T3, row_id, frame),
        page_id))

    # Actions
    if show_actions:
        rev_id = uid()
        rev = make_rect(rev_id, "BtnRevoke", cx + 820, y + 16, 20, 20, WHITE, row_id, frame, radius=4,
                        strokes=stroke_border(T4, 1, "center"))
        changes.append(add_obj(rev_id, row_id, frame, rev, page_id))

    return changes


# ═══════════════════════════════════════════
# SHARED: Received shares/delegations row builder
# ═══════════════════════════════════════════

def build_received_row(row_data, x, y, w, parent, frame, page_id, columns_type="shares"):
    """Received table row. columns_type: 'shares' or 'delegations'"""
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

    # Name (Concedente / Delegado)
    name_id = uid()
    changes.append(add_obj(name_id, row_id, frame,
        make_text(name_id, "Name", cx + 36, y + 17, 140, 18, row_data['name'], 13, 500, T1, row_id, frame),
        page_id))

    if columns_type == "shares":
        # Escopo/Recurso
        scope_id = uid()
        changes.append(add_obj(scope_id, row_id, frame,
            make_text(scope_id, "Scope", cx + 200, y + 17, 180, 18, row_data.get('scope', ''), 13, 500, T2, row_id, frame),
            page_id))
        # Ações Permitidas
        acoes_id = uid()
        changes.append(add_obj(acoes_id, row_id, frame,
            make_text(acoes_id, "Acoes", cx + 400, y + 19, 180, 16, row_data.get('acoes', ''), 12, 400, T3, row_id, frame),
            page_id))
        # Válido Até
        val_id = uid()
        changes.append(add_obj(val_id, row_id, frame,
            make_text(val_id, "Validade", cx + 660, y + 19, 120, 16, row_data.get('validade', ''), 12, 400, T4, row_id, frame),
            page_id))
    else:
        # Scopes (as pills)
        scopes_x = cx + 200
        for i, scope in enumerate(row_data.get('scopes', [])):
            pill_id = uid()
            pill_w = len(scope) * 7 + 16
            pill = make_rect(pill_id, f"Scope-{scope}", scopes_x + i * (pill_w + 6), y + 16, pill_w, 22, BLUE_LT, row_id, frame,
                             radius=6, strokes=stroke_border(PILL_BLUE_BD))
            changes.append(add_obj(pill_id, row_id, frame, pill, page_id))
            pill_txt = uid()
            changes.append(add_obj(pill_txt, row_id, frame,
                make_text(pill_txt, f"ScopeText-{scope}", scopes_x + i * (pill_w + 6) + 8, y + 19, pill_w - 16, 16, scope, 11, 600, BLUE, row_id, frame),
                page_id))
        # Período
        per_id = uid()
        changes.append(add_obj(per_id, row_id, frame,
            make_text(per_id, "Periodo", cx + 500, y + 19, 140, 16, row_data.get('periodo', ''), 12, 400, T4, row_id, frame),
            page_id))

    return changes


# ═══════════════════════════════════════════
# SHARED: Banner builder
# ═══════════════════════════════════════════

def build_banner(text, x, y, w, parent, frame, page_id, bg=None, border_color=None, text_color=None):
    """Build info banner. Returns changes list."""
    bg = bg or BLUE_LT
    border_color = border_color or PILL_BLUE_BD
    text_color = text_color or BLUE
    changes = []
    banner_id = uid()
    banner = make_rect(banner_id, "Banner", x, y, w, 40, bg, parent, frame, radius=8,
                       strokes=stroke_border(border_color))
    changes.append(add_obj(banner_id, parent, frame, banner, page_id))
    banner_txt = uid()
    changes.append(add_obj(banner_txt, banner_id, frame,
        make_text(banner_txt, "BannerText", x + 16, y + 10, w - 32, 20, text, 12, 500, text_color, banner_id, frame),
        page_id))
    return changes


# ═══════════════════════════════════════════
# PAGE C1: 40-Identity-Delegations (Tab 2)
# ═══════════════════════════════════════════

print("\n=== PAGE C1: 40-Identity-Delegations ===")
c1_page = uid()
send_changes([add_page_change(c1_page, "40-Identity-Delegations")], "Add page Delegations")

# Frame
c1_frame = uid()
c1_f = make_frame(c1_frame, "40-Identity-Delegations", 0, 0, 1440, 900, BG)
send_changes([add_obj(c1_frame, ROOT, ROOT, c1_f, c1_page)], "Frame Delegations")

# AppShell
as_c1, _, _ = build_appshell(c1_frame, c1_page)
for i in range(0, len(as_c1), 40):
    send_changes(as_c1[i:i+40], f"AppShell C1 batch {i//40+1}")

# Content area
ct_c1 = uid()
ct_c1_r = make_rect(ct_c1, "ContentArea", 240, 64, 1200, 836, BG, c1_frame, c1_frame)
c1_changes = [add_obj(ct_c1, c1_frame, c1_frame, ct_c1_r, c1_page)]
send_changes(c1_changes, "ContentArea C1")

# Header + Tabs (Tab 2 active, button "+ Nova Delegação")
hdr_changes, _ = build_v2_header_tabs(ct_c1, c1_frame, c1_page, active_tab=2, show_button=True, button_text="+ Nova Delegação")
send_changes(hdr_changes, "Header + Tabs C1")

# Section: Delegações Dadas
c1_body = []
sec1_title = uid()
c1_body.append(add_obj(sec1_title, ct_c1, c1_frame,
    make_text(sec1_title, "SecTitleDadas", 264, 214, 200, 22, "Delegações Dadas", 16, 700, T1, ct_c1, c1_frame),
    c1_page))

# Table Dadas
tbl_d = uid()
tbl_d_r = make_rect(tbl_d, "TableDadas", 264, 244, 1152, 200, WHITE, ct_c1, c1_frame, radius=12,
                    strokes=stroke_border(BORDER))
c1_body.append(add_obj(tbl_d, ct_c1, c1_frame, tbl_d_r, c1_page))

# Table header
deleg_cols = [("DELEGADO", 0, 180), ("ESCOPOS", 200, 200), ("PERÍODO", 500, 140),
              ("MOTIVO", 660, 140), ("AÇÕES", 820, 60)]
hdr_d_changes, _ = build_table_header(deleg_cols, 264, 244, 1152, tbl_d, c1_frame, c1_page)
c1_body.extend(hdr_d_changes)
send_changes(c1_body, "Section Dadas header")

# Rows Dadas
deleg_dadas_rows = [
    {"name": "Ana Oliveira", "initials": "AO", "av_color": GREEN,
     "scopes": ["identity:read", "identity:write"], "periodo": "01/04 – 15/04/2026", "motivo": "Férias do titular"},
    {"name": "Pedro Mendes", "initials": "PM", "av_color": "#1ABC9C",
     "scopes": ["org:read"], "periodo": "10/04 – 30/04/2026", "motivo": "Projeto especial"},
]

for i, row_data in enumerate(deleg_dadas_rows):
    row_y = 288 + i * 52
    row_changes = build_deleg_row(row_data, 264, row_y, 1152, tbl_d, c1_frame, c1_page, show_actions=True)
    send_changes(row_changes, f"Deleg Dada row {i+1}: {row_data['name']}")

# Section: Delegações Recebidas (mt:24px from table bottom)
c1_sec2 = []
sec2_title = uid()
c1_sec2.append(add_obj(sec2_title, ct_c1, c1_frame,
    make_text(sec2_title, "SecTitleRecebidas", 264, 468, 250, 22, "Delegações Recebidas", 16, 700, T1, ct_c1, c1_frame),
    c1_page))

# Banner re-delegação
banner_changes = build_banner("Escopos obtidos por delegação não podem ser re-delegados.", 264, 498, 1152, ct_c1, c1_frame, c1_page)
c1_sec2.extend(banner_changes)

# Table Recebidas
tbl_r = uid()
tbl_r_r = make_rect(tbl_r, "TableRecebidas", 264, 550, 1152, 150, WHITE, ct_c1, c1_frame, radius=12,
                    strokes=stroke_border(BORDER))
c1_sec2.append(add_obj(tbl_r, ct_c1, c1_frame, tbl_r_r, c1_page))

# Table header (sem AÇÕES)
deleg_recv_cols = [("DELEGADO", 0, 180), ("ESCOPOS", 200, 200), ("PERÍODO", 500, 140), ("MOTIVO", 660, 140)]
hdr_r_changes, _ = build_table_header(deleg_recv_cols, 264, 550, 1152, tbl_r, c1_frame, c1_page)
c1_sec2.extend(hdr_r_changes)
send_changes(c1_sec2, "Section Recebidas header + banner")

# Row Recebida
recv_row = {"name": "Marcos Silva", "initials": "MS", "av_color": BLUE,
            "scopes": ["process:read"], "periodo": "05/04 – 20/04/2026", "motivo": "Cobertura férias"}
row_changes = build_deleg_row(recv_row, 264, 594, 1152, tbl_r, c1_frame, c1_page, show_actions=False)
send_changes(row_changes, "Deleg Recebida row 1")


# ═══════════════════════════════════════════
# PAGE C2: 40-Identity-Received (Tab 3)
# ═══════════════════════════════════════════

print("\n=== PAGE C2: 40-Identity-Received ===")
c2_page = uid()
send_changes([add_page_change(c2_page, "40-Identity-Received")], "Add page Received")

# Frame
c2_frame = uid()
c2_f = make_frame(c2_frame, "40-Identity-Received", 0, 0, 1440, 900, BG)
send_changes([add_obj(c2_frame, ROOT, ROOT, c2_f, c2_page)], "Frame Received")

# AppShell
as_c2, _, _ = build_appshell(c2_frame, c2_page)
for i in range(0, len(as_c2), 40):
    send_changes(as_c2[i:i+40], f"AppShell C2 batch {i//40+1}")

# Content area
ct_c2 = uid()
ct_c2_r = make_rect(ct_c2, "ContentArea", 240, 64, 1200, 836, BG, c2_frame, c2_frame)
send_changes([add_obj(ct_c2, c2_frame, c2_frame, ct_c2_r, c2_page)], "ContentArea C2")

# Header + Tabs (Tab 3 active, SEM botão primário)
hdr_c2, _ = build_v2_header_tabs(ct_c2, c2_frame, c2_page, active_tab=3, show_button=False)
send_changes(hdr_c2, "Header + Tabs C2")

# Banner info global
c2_body = []
banner_info = build_banner("Estes acessos são temporários e expiram automaticamente.", 264, 214, 1152, ct_c2, c2_frame, c2_page)
c2_body.extend(banner_info)

# Section: Compartilhamentos Recebidos
sec_shares_title = uid()
c2_body.append(add_obj(sec_shares_title, ct_c2, c2_frame,
    make_text(sec_shares_title, "SecTitleSharesRecv", 264, 270, 300, 22, "Compartilhamentos Recebidos", 16, 700, T1, ct_c2, c2_frame),
    c2_page))

# Table Compartilhamentos Recebidos
tbl_sr = uid()
tbl_sr_r = make_rect(tbl_sr, "TableSharesRecv", 264, 300, 1152, 200, WHITE, ct_c2, c2_frame, radius=12,
                     strokes=stroke_border(BORDER))
c2_body.append(add_obj(tbl_sr, ct_c2, c2_frame, tbl_sr_r, c2_page))

shares_recv_cols = [("CONCEDENTE", 0, 180), ("ESCOPO / RECURSO", 200, 180),
                    ("AÇÕES PERMITIDAS", 400, 200), ("VÁLIDO ATÉ", 660, 120)]
hdr_sr_changes, _ = build_table_header(shares_recv_cols, 264, 300, 1152, tbl_sr, c2_frame, c2_page)
c2_body.extend(hdr_sr_changes)
send_changes(c2_body, "Banner + Section Shares Recebidos header")

# Rows Compartilhamentos Recebidos
shares_recv_rows = [
    {"name": "Marcos Silva", "initials": "MS", "av_color": BLUE,
     "scope": "Relatórios Diretoria", "acoes": "Leitura", "validade": "15 abr 2026"},
    {"name": "Carlos Ferreira", "initials": "CF", "av_color": WARN,
     "scope": "Dashboard Operacional", "acoes": "Leitura + Edição", "validade": "30 mai 2026"},
]

for i, row_data in enumerate(shares_recv_rows):
    row_y = 344 + i * 52
    row_changes = build_received_row(row_data, 264, row_y, 1152, tbl_sr, c2_frame, c2_page, columns_type="shares")
    send_changes(row_changes, f"Share Recv row {i+1}: {row_data['name']}")

# Section: Delegações Recebidas (mt:24px)
c2_sec2 = []
sec_deleg_title = uid()
c2_sec2.append(add_obj(sec_deleg_title, ct_c2, c2_frame,
    make_text(sec_deleg_title, "SecTitleDelegRecv", 264, 524, 250, 22, "Delegações Recebidas", 16, 700, T1, ct_c2, c2_frame),
    c2_page))

# Banner re-delegação
banner_redeleg = build_banner("Escopos obtidos por delegação não podem ser re-delegados.", 264, 554, 1152, ct_c2, c2_frame, c2_page)
c2_sec2.extend(banner_redeleg)

# Table Delegações Recebidas
tbl_dr = uid()
tbl_dr_r = make_rect(tbl_dr, "TableDelegRecv", 264, 606, 1152, 150, WHITE, ct_c2, c2_frame, radius=12,
                     strokes=stroke_border(BORDER))
c2_sec2.append(add_obj(tbl_dr, ct_c2, c2_frame, tbl_dr_r, c2_page))

deleg_recv_cols2 = [("DELEGADO", 0, 180), ("ESCOPOS", 200, 200), ("PERÍODO", 500, 140), ("MOTIVO", 660, 140)]
hdr_dr_changes, _ = build_table_header(deleg_recv_cols2, 264, 606, 1152, tbl_dr, c2_frame, c2_page)
c2_sec2.extend(hdr_dr_changes)
send_changes(c2_sec2, "Section Deleg Recebidas C2")

# Row Delegação Recebida
deleg_recv_row = {"name": "Ana Oliveira", "initials": "AO", "av_color": GREEN,
                  "scopes": ["identity:read"], "periodo": "01/04 – 15/04/2026", "motivo": "Cobertura férias"}
row_changes = build_deleg_row(deleg_recv_row, 264, 650, 1152, tbl_dr, c2_frame, c2_page, show_actions=False)
send_changes(row_changes, "Deleg Recv row 1 C2")


# ═══════════════════════════════════════════
# PAGE C3: 40-Identity-ShareDrawer
# ═══════════════════════════════════════════

print("\n=== PAGE C3: 40-Identity-ShareDrawer ===")
c3_page = uid()
send_changes([add_page_change(c3_page, "40-Identity-ShareDrawer")], "Add page ShareDrawer")

# Frame
c3_frame = uid()
c3_f = make_frame(c3_frame, "40-Identity-ShareDrawer", 0, 0, 1440, 900, BG)
send_changes([add_obj(c3_frame, ROOT, ROOT, c3_f, c3_page)], "Frame ShareDrawer")

# AppShell
as_c3, _, _ = build_appshell(c3_frame, c3_page)
for i in range(0, len(as_c3), 40):
    send_changes(as_c3[i:i+40], f"AppShell C3 batch {i//40+1}")

# Content (dimmed with Tab 1)
ct_c3 = uid()
ct_c3_r = make_rect(ct_c3, "ContentArea", 240, 64, 1200, 836, BG, c3_frame, c3_frame, opacity=0.3)
c3_dim = [add_obj(ct_c3, c3_frame, c3_frame, ct_c3_r, c3_page)]

# Dimmed title
ph_c3 = uid()
c3_dim.append(add_obj(ph_c3, ct_c3, c3_frame,
    make_text(ph_c3, "PageTitle", 264, 88, 500, 30, "Compartilhamentos e Delegações", 24, 800, T1, ct_c3, c3_frame),
    c3_page))

# Dimmed tabs (Tab 1 showing as active)
tab_y = 154
tab_bar_c3 = uid()
tab_bar_c3_r = make_rect(tab_bar_c3, "TabBar", 264, tab_y, 1152, 44, BG, ct_c3, c3_frame,
                          strokes=stroke_border(BORDER, 2, "inner"))
c3_dim.append(add_obj(tab_bar_c3, ct_c3, c3_frame, tab_bar_c3_r, c3_page))
tab1_c3 = uid()
c3_dim.append(add_obj(tab1_c3, tab_bar_c3, c3_frame,
    make_text(tab1_c3, "Tab1", 284, tab_y + 13, 180, 18, "Meus Compartilhamentos", 13, 700, BLUE, tab_bar_c3, c3_frame),
    c3_page))

# Dimmed table placeholder
tbl_c3_dim = uid()
tbl_c3_dim_r = make_rect(tbl_c3_dim, "TableCard", 264, 214, 1152, 300, WHITE, ct_c3, c3_frame, radius=12,
                          strokes=stroke_border(BORDER))
c3_dim.append(add_obj(tbl_c3_dim, ct_c3, c3_frame, tbl_c3_dim_r, c3_page))
send_changes(c3_dim, "Content C3 dimmed")

# Drawer overlay
ov_c3 = uid()
ov_c3_r = make_rect(ov_c3, "DrawerOverlay", 0, 0, 1440, 900, "#000000", c3_frame, c3_frame, opacity=0.3)
send_changes([add_obj(ov_c3, c3_frame, c3_frame, ov_c3_r, c3_page)], "Overlay C3")

# Drawer panel
dr_c3 = uid()
dr_c3_r = make_rect(dr_c3, "DrawerPanel", 960, 0, 480, 900, WHITE, c3_frame, c3_frame)
dr_c3_changes = [add_obj(dr_c3, c3_frame, c3_frame, dr_c3_r, c3_page)]

# Drawer header
drh_c3 = uid()
drh_c3_r = make_rect(drh_c3, "DrawerHeader", 960, 0, 480, 64, WHITE, dr_c3, c3_frame,
                      strokes=stroke_border(BORDER, 1, "inner"))
dr_c3_changes.append(add_obj(drh_c3, dr_c3, c3_frame, drh_c3_r, c3_page))
drh_c3_txt = uid()
dr_c3_changes.append(add_obj(drh_c3_txt, dr_c3, c3_frame,
    make_text(drh_c3_txt, "DrawerTitle", 984, 22, 350, 22, "Novo Compartilhamento", 18, 700, T1, dr_c3, c3_frame),
    c3_page))
close_c3 = uid()
close_c3_r = make_rect(close_c3, "BtnClose", 1408, 20, 24, 24, WHITE, dr_c3, c3_frame, radius=4,
                        strokes=stroke_border(T4, 1, "center"))
dr_c3_changes.append(add_obj(close_c3, dr_c3, c3_frame, close_c3_r, c3_page))
send_changes(dr_c3_changes, "Drawer C3 header")

# Drawer body fields
drb_c3 = []
field_y = 88  # starting y inside drawer body

# Field 1: BENEFICIÁRIO (autocomplete)
lbl_benef = uid()
drb_c3.append(add_obj(lbl_benef, dr_c3, c3_frame,
    make_text(lbl_benef, "LabelBeneficiario", 984, field_y, 150, 14, "BENEFICIÁRIO", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
inp_benef = uid()
inp_benef_r = make_rect(inp_benef, "InputBeneficiario", 984, field_y + 20, 432, 42, WHITE, dr_c3, c3_frame, radius=8,
                         strokes=stroke_border(BORDER))
drb_c3.append(add_obj(inp_benef, dr_c3, c3_frame, inp_benef_r, c3_page))
inp_benef_txt = uid()
drb_c3.append(add_obj(inp_benef_txt, dr_c3, c3_frame,
    make_text(inp_benef_txt, "BenefValue", 998, field_y + 30, 400, 20, "Ana Oliveira", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

# Field 2: TIPO DE RECURSO (select)
field_y += 78
lbl_tipo = uid()
drb_c3.append(add_obj(lbl_tipo, dr_c3, c3_frame,
    make_text(lbl_tipo, "LabelTipoRecurso", 984, field_y, 180, 14, "TIPO DE RECURSO", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
inp_tipo = uid()
inp_tipo_r = make_rect(inp_tipo, "SelectTipoRecurso", 984, field_y + 20, 432, 42, WHITE, dr_c3, c3_frame, radius=8,
                        strokes=stroke_border(BORDER))
drb_c3.append(add_obj(inp_tipo, dr_c3, c3_frame, inp_tipo_r, c3_page))
inp_tipo_txt = uid()
drb_c3.append(add_obj(inp_tipo_txt, dr_c3, c3_frame,
    make_text(inp_tipo_txt, "TipoValue", 998, field_y + 30, 400, 20, "Relatório", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

send_changes(drb_c3, "Drawer C3 fields 1-2")

# Field 3: RECURSO (autocomplete)
drb_c3b = []
field_y += 78
lbl_recurso = uid()
drb_c3b.append(add_obj(lbl_recurso, dr_c3, c3_frame,
    make_text(lbl_recurso, "LabelRecurso", 984, field_y, 120, 14, "RECURSO", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
inp_recurso = uid()
inp_recurso_r = make_rect(inp_recurso, "InputRecurso", 984, field_y + 20, 432, 42, WHITE, dr_c3, c3_frame, radius=8,
                           strokes=stroke_border(BORDER))
drb_c3b.append(add_obj(inp_recurso, dr_c3, c3_frame, inp_recurso_r, c3_page))
inp_recurso_txt = uid()
drb_c3b.append(add_obj(inp_recurso_txt, dr_c3, c3_frame,
    make_text(inp_recurso_txt, "RecursoValue", 998, field_y + 30, 400, 20, "Relatórios Diretoria", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

# Field 4: AÇÕES PERMITIDAS (multiselect)
field_y += 78
lbl_acoes = uid()
drb_c3b.append(add_obj(lbl_acoes, dr_c3, c3_frame,
    make_text(lbl_acoes, "LabelAcoes", 984, field_y, 180, 14, "AÇÕES PERMITIDAS", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
inp_acoes = uid()
inp_acoes_r = make_rect(inp_acoes, "MultiSelectAcoes", 984, field_y + 20, 432, 42, WHITE, dr_c3, c3_frame, radius=8,
                         strokes=stroke_border(BORDER))
drb_c3b.append(add_obj(inp_acoes, dr_c3, c3_frame, inp_acoes_r, c3_page))
inp_acoes_txt = uid()
drb_c3b.append(add_obj(inp_acoes_txt, dr_c3, c3_frame,
    make_text(inp_acoes_txt, "AcoesValue", 998, field_y + 30, 400, 20, "Leitura", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

# Field 5: MOTIVO (textarea 80px)
field_y += 78
lbl_motivo = uid()
drb_c3b.append(add_obj(lbl_motivo, dr_c3, c3_frame,
    make_text(lbl_motivo, "LabelMotivo", 984, field_y, 120, 14, "MOTIVO", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
ta_motivo = uid()
ta_motivo_r = make_rect(ta_motivo, "TextareaMotivo", 984, field_y + 20, 432, 80, WHITE, dr_c3, c3_frame, radius=8,
                         strokes=stroke_border(BORDER))
drb_c3b.append(add_obj(ta_motivo, dr_c3, c3_frame, ta_motivo_r, c3_page))
ta_motivo_txt = uid()
drb_c3b.append(add_obj(ta_motivo_txt, dr_c3, c3_frame,
    make_text(ta_motivo_txt, "MotivoValue", 998, field_y + 30, 400, 60, "Acesso necessário para revisão trimestral", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

send_changes(drb_c3b, "Drawer C3 fields 3-5")

# Field 6: AUTORIZADO POR (autocomplete + badge info)
drb_c3c = []
field_y += 116  # textarea is 80px + spacing
lbl_autoriz = uid()
drb_c3c.append(add_obj(lbl_autoriz, dr_c3, c3_frame,
    make_text(lbl_autoriz, "LabelAutorizado", 984, field_y, 180, 14, "AUTORIZADO POR", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
inp_autoriz = uid()
inp_autoriz_r = make_rect(inp_autoriz, "InputAutorizado", 984, field_y + 20, 432, 42, WHITE, dr_c3, c3_frame, radius=8,
                           strokes=stroke_border(BORDER))
drb_c3c.append(add_obj(inp_autoriz, dr_c3, c3_frame, inp_autoriz_r, c3_page))
inp_autoriz_txt = uid()
drb_c3c.append(add_obj(inp_autoriz_txt, dr_c3, c3_frame,
    make_text(inp_autoriz_txt, "AutorizValue", 998, field_y + 30, 400, 20, "Admin ECF (você)", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

# Badge info auto-autorizar
badge_info_changes = build_banner("Você possui permissão para auto-autorizar.", 984, field_y + 68, 432, dr_c3, c3_frame, c3_page)
drb_c3c.extend(badge_info_changes)

# Field 7: VÁLIDO ATÉ (datepicker)
field_y += 124
lbl_validade = uid()
drb_c3c.append(add_obj(lbl_validade, dr_c3, c3_frame,
    make_text(lbl_validade, "LabelValidade", 984, field_y, 120, 14, "VÁLIDO ATÉ", 10, 700, T4, dr_c3, c3_frame,
              uppercase=True, letter_spacing=0.8),
    c3_page))
inp_validade = uid()
inp_validade_r = make_rect(inp_validade, "InputValidade", 984, field_y + 20, 432, 42, WHITE, dr_c3, c3_frame, radius=8,
                            strokes=stroke_border(BORDER))
drb_c3c.append(add_obj(inp_validade, dr_c3, c3_frame, inp_validade_r, c3_page))
inp_validade_txt = uid()
drb_c3c.append(add_obj(inp_validade_txt, dr_c3, c3_frame,
    make_text(inp_validade_txt, "ValidadeValue", 998, field_y + 30, 200, 20, "15/04/2026", 14, 500, T1, dr_c3, c3_frame),
    c3_page))

send_changes(drb_c3c, "Drawer C3 fields 6-7")

# Drawer footer
drf_c3 = []
drf_c3_id = uid()
drf_c3_r = make_rect(drf_c3_id, "DrawerFooter", 960, 828, 480, 72, WHITE, dr_c3, c3_frame,
                      strokes=stroke_border(BORDER, 1, "inner"))
drf_c3.append(add_obj(drf_c3_id, dr_c3, c3_frame, drf_c3_r, c3_page))

btn_cancel_c3 = uid()
btn_cancel_c3_r = make_rect(btn_cancel_c3, "BtnCancelar", 1276, 844, 80, 40, WHITE, dr_c3, c3_frame, radius=8,
                             strokes=stroke_border(BORDER))
drf_c3.append(add_obj(btn_cancel_c3, dr_c3, c3_frame, btn_cancel_c3_r, c3_page))
btn_cancel_c3_t = uid()
drf_c3.append(add_obj(btn_cancel_c3_t, dr_c3, c3_frame,
    make_text(btn_cancel_c3_t, "CancelarText", 1284, 854, 66, 18, "Cancelar", 13, 600, T3, dr_c3, c3_frame),
    c3_page))

btn_criar_c3 = uid()
btn_criar_c3_r = make_rect(btn_criar_c3, "BtnCriar", 1364, 844, 72, 40, BLUE, dr_c3, c3_frame, radius=8)
drf_c3.append(add_obj(btn_criar_c3, dr_c3, c3_frame, btn_criar_c3_r, c3_page))
btn_criar_c3_t = uid()
drf_c3.append(add_obj(btn_criar_c3_t, dr_c3, c3_frame,
    make_text(btn_criar_c3_t, "CriarText", 1378, 854, 46, 18, "Criar", 13, 700, WHITE, dr_c3, c3_frame),
    c3_page))

send_changes(drf_c3, "Drawer C3 footer")


# ═══════════════════════════════════════════
# PAGE C4: 40-Identity-RevokeModal
# ═══════════════════════════════════════════

print("\n=== PAGE C4: 40-Identity-RevokeModal ===")
c4_page = uid()
send_changes([add_page_change(c4_page, "40-Identity-RevokeModal")], "Add page RevokeModal")

# Frame
c4_frame = uid()
c4_f = make_frame(c4_frame, "40-Identity-RevokeModal", 0, 0, 1440, 900, BG)
send_changes([add_obj(c4_frame, ROOT, ROOT, c4_f, c4_page)], "Frame RevokeModal")

# AppShell
as_c4, _, _ = build_appshell(c4_frame, c4_page)
for i in range(0, len(as_c4), 40):
    send_changes(as_c4[i:i+40], f"AppShell C4 batch {i//40+1}")

# Content (dimmed — Tab 1 view)
ct_c4 = uid()
ct_c4_r = make_rect(ct_c4, "ContentArea", 240, 64, 1200, 836, BG, c4_frame, c4_frame, opacity=0.3)
c4_dim = [add_obj(ct_c4, c4_frame, c4_frame, ct_c4_r, c4_page)]

ph_c4 = uid()
c4_dim.append(add_obj(ph_c4, ct_c4, c4_frame,
    make_text(ph_c4, "PageTitle", 264, 88, 500, 30, "Compartilhamentos e Delegações", 24, 800, T1, ct_c4, c4_frame),
    c4_page))

# Dimmed tabs (Tab 1 active)
tab_bar_c4 = uid()
tab_bar_c4_r = make_rect(tab_bar_c4, "TabBar", 264, 154, 1152, 44, BG, ct_c4, c4_frame,
                          strokes=stroke_border(BORDER, 2, "inner"))
c4_dim.append(add_obj(tab_bar_c4, ct_c4, c4_frame, tab_bar_c4_r, c4_page))
tab1_c4 = uid()
c4_dim.append(add_obj(tab1_c4, tab_bar_c4, c4_frame,
    make_text(tab1_c4, "Tab1", 284, 167, 180, 18, "Meus Compartilhamentos", 13, 700, BLUE, tab_bar_c4, c4_frame),
    c4_page))

# Dimmed table placeholder
tbl_c4_dim = uid()
tbl_c4_dim_r = make_rect(tbl_c4_dim, "TableCard", 264, 214, 1152, 300, WHITE, ct_c4, c4_frame, radius=12,
                          strokes=stroke_border(BORDER))
c4_dim.append(add_obj(tbl_c4_dim, ct_c4, c4_frame, tbl_c4_dim_r, c4_page))
send_changes(c4_dim, "Content C4 dimmed")

# Modal overlay
ov_c4 = uid()
ov_c4_r = make_rect(ov_c4, "ModalOverlay", 0, 0, 1440, 900, "#000000", c4_frame, c4_frame, opacity=0.3)
send_changes([add_obj(ov_c4, c4_frame, c4_frame, ov_c4_r, c4_page)], "Modal Overlay C4")

# Modal card (420px centered)
modal_x = (1440 - 420) // 2  # 510
modal_y = (900 - 280) // 2   # 310
modal_c4 = uid()
modal_c4_r = make_rect(modal_c4, "ModalCard", modal_x, modal_y, 420, 280, WHITE, c4_frame, c4_frame, radius=12)
c4_modal = [add_obj(modal_c4, c4_frame, c4_frame, modal_c4_r, c4_page)]

# Warning icon (48x48 circle, bg #FFF3E0)
icon_x = modal_x + (420 - 48) // 2  # centered
icon_y = modal_y + 24
warn_icon = uid()
warn_icon_r = make_rect(warn_icon, "WarningIcon", icon_x, icon_y, 48, 48, WARN_BG, modal_c4, c4_frame, radius=24)
c4_modal.append(add_obj(warn_icon, modal_c4, c4_frame, warn_icon_r, c4_page))
# Warning symbol text
warn_sym = uid()
c4_modal.append(add_obj(warn_sym, warn_icon, c4_frame,
    make_text(warn_sym, "WarnSymbol", icon_x + 14, icon_y + 12, 20, 24, "!", 22, 700, WARN, warn_icon, c4_frame),
    c4_page))

# Title
title_y = icon_y + 64
title_c4 = uid()
c4_modal.append(add_obj(title_c4, modal_c4, c4_frame,
    make_text(title_c4, "ModalTitle", modal_x + 24, title_y, 372, 24, "Revogar compartilhamento?", 18, 700, T1, modal_c4, c4_frame),
    c4_page))

# Message
msg_y = title_y + 32
msg_c4 = uid()
c4_modal.append(add_obj(msg_c4, modal_c4, c4_frame,
    make_text(msg_c4, "ModalMsg", modal_x + 24, msg_y, 372, 40,
              "Confirma revogação deste compartilhamento? O acesso de Ana Oliveira será removido imediatamente.",
              13, 400, T3, modal_c4, c4_frame),
    c4_page))

# Buttons row
btn_y = msg_y + 56
# Cancelar
btn_cancel_c4 = uid()
btn_cancel_c4_r = make_rect(btn_cancel_c4, "BtnCancelar", modal_x + 110, btn_y, 90, 40, WHITE, modal_c4, c4_frame, radius=8,
                             strokes=stroke_border(BORDER))
c4_modal.append(add_obj(btn_cancel_c4, modal_c4, c4_frame, btn_cancel_c4_r, c4_page))
btn_cancel_c4_t = uid()
c4_modal.append(add_obj(btn_cancel_c4_t, modal_c4, c4_frame,
    make_text(btn_cancel_c4_t, "CancelarText", modal_x + 120, btn_y + 11, 70, 18, "Cancelar", 13, 600, T3, modal_c4, c4_frame),
    c4_page))

# Revogar
btn_revoke_c4 = uid()
btn_revoke_c4_r = make_rect(btn_revoke_c4, "BtnRevogar", modal_x + 212, btn_y, 90, 40, RED, modal_c4, c4_frame, radius=8)
c4_modal.append(add_obj(btn_revoke_c4, modal_c4, c4_frame, btn_revoke_c4_r, c4_page))
btn_revoke_c4_t = uid()
c4_modal.append(add_obj(btn_revoke_c4_t, modal_c4, c4_frame,
    make_text(btn_revoke_c4_t, "RevogarText", modal_x + 222, btn_y + 11, 70, 18, "Revogar", 13, 700, WHITE, modal_c4, c4_frame),
    c4_page))

send_changes(c4_modal, "Modal C4 card + content")


# ═══════════════════════════════════════════
# PAGE C5: 40-Identity-RemoveScopeModal
# ═══════════════════════════════════════════

print("\n=== PAGE C5: 40-Identity-RemoveScopeModal ===")
c5_page = uid()
send_changes([add_page_change(c5_page, "40-Identity-RemoveScopeModal")], "Add page RemoveScopeModal")

# Frame
c5_frame = uid()
c5_f = make_frame(c5_frame, "40-Identity-RemoveScopeModal", 0, 0, 1440, 900, BG)
send_changes([add_obj(c5_frame, ROOT, ROOT, c5_f, c5_page)], "Frame RemoveScopeModal")

# AppShell
as_c5, _, _ = build_appshell(c5_frame, c5_page)
for i in range(0, len(as_c5), 40):
    send_changes(as_c5[i:i+40], f"AppShell C5 batch {i//40+1}")

# Content dimmed (View 1 — Escopo Organizacional)
ct_c5 = uid()
ct_c5_r = make_rect(ct_c5, "ContentArea", 240, 64, 1200, 836, BG, c5_frame, c5_frame, opacity=0.3)
c5_dim = [add_obj(ct_c5, c5_frame, c5_frame, ct_c5_r, c5_page)]

ph_c5 = uid()
c5_dim.append(add_obj(ph_c5, ct_c5, c5_frame,
    make_text(ph_c5, "PageTitle", 264, 88, 400, 30, "Escopo Organizacional", 24, 800, T1, ct_c5, c5_frame),
    c5_page))
ph_c5_d = uid()
c5_dim.append(add_obj(ph_c5_d, ct_c5, c5_frame,
    make_text(ph_c5_d, "PageDesc", 264, 122, 500, 18, "Gerencie os vínculos de escopo organizacional dos usuários", 13, 400, T4, ct_c5, c5_frame),
    c5_page))

# Dimmed table placeholder
tbl_c5_dim = uid()
tbl_c5_dim_r = make_rect(tbl_c5_dim, "TableCard", 264, 206, 1152, 300, WHITE, ct_c5, c5_frame, radius=12,
                          strokes=stroke_border(BORDER))
c5_dim.append(add_obj(tbl_c5_dim, ct_c5, c5_frame, tbl_c5_dim_r, c5_page))
send_changes(c5_dim, "Content C5 dimmed")

# Modal overlay
ov_c5 = uid()
ov_c5_r = make_rect(ov_c5, "ModalOverlay", 0, 0, 1440, 900, "#000000", c5_frame, c5_frame, opacity=0.3)
send_changes([add_obj(ov_c5, c5_frame, c5_frame, ov_c5_r, c5_page)], "Modal Overlay C5")

# Modal card (420px centered)
modal5_x = (1440 - 420) // 2  # 510
modal5_y = (900 - 300) // 2   # 300
modal_c5 = uid()
modal_c5_r = make_rect(modal_c5, "ModalCard", modal5_x, modal5_y, 420, 300, WHITE, c5_frame, c5_frame, radius=12)
c5_modal = [add_obj(modal_c5, c5_frame, c5_frame, modal_c5_r, c5_page)]

# Warning icon (48x48 circle, bg #FFEBEE — vermelho)
icon5_x = modal5_x + (420 - 48) // 2
icon5_y = modal5_y + 24
warn_icon5 = uid()
warn_icon5_r = make_rect(warn_icon5, "WarningIcon", icon5_x, icon5_y, 48, 48, RED_BG, modal_c5, c5_frame, radius=24)
c5_modal.append(add_obj(warn_icon5, modal_c5, c5_frame, warn_icon5_r, c5_page))
warn_sym5 = uid()
c5_modal.append(add_obj(warn_sym5, warn_icon5, c5_frame,
    make_text(warn_sym5, "WarnSymbol", icon5_x + 14, icon5_y + 12, 20, 24, "!", 22, 700, RED, warn_icon5, c5_frame),
    c5_page))

# Title
title5_y = icon5_y + 64
title_c5 = uid()
c5_modal.append(add_obj(title_c5, modal_c5, c5_frame,
    make_text(title_c5, "ModalTitle", modal5_x + 24, title5_y, 372, 24, "Remover área principal?", 18, 700, T1, modal_c5, c5_frame),
    c5_page))

# Message
msg5_y = title5_y + 32
msg_c5 = uid()
c5_modal.append(add_obj(msg_c5, modal_c5, c5_frame,
    make_text(msg_c5, "ModalMsg", modal5_x + 24, msg5_y, 372, 52,
              "Ao remover a área principal, processos vinculados a este usuário podem perder contexto organizacional.",
              13, 400, T3, modal_c5, c5_frame),
    c5_page))

# Buttons row
btn5_y = msg5_y + 68
# Cancelar
btn_cancel_c5 = uid()
btn_cancel_c5_r = make_rect(btn_cancel_c5, "BtnCancelar", modal5_x + 60, btn5_y, 90, 40, WHITE, modal_c5, c5_frame, radius=8,
                             strokes=stroke_border(BORDER))
c5_modal.append(add_obj(btn_cancel_c5, modal_c5, c5_frame, btn_cancel_c5_r, c5_page))
btn_cancel_c5_t = uid()
c5_modal.append(add_obj(btn_cancel_c5_t, modal_c5, c5_frame,
    make_text(btn_cancel_c5_t, "CancelarText", modal5_x + 70, btn5_y + 11, 70, 18, "Cancelar", 13, 600, T3, modal_c5, c5_frame),
    c5_page))

# Remover mesmo assim
btn_remove_c5 = uid()
btn_remove_c5_r = make_rect(btn_remove_c5, "BtnRemover", modal5_x + 164, btn5_y, 190, 40, RED, modal_c5, c5_frame, radius=8)
c5_modal.append(add_obj(btn_remove_c5, modal_c5, c5_frame, btn_remove_c5_r, c5_page))
btn_remove_c5_t = uid()
c5_modal.append(add_obj(btn_remove_c5_t, modal_c5, c5_frame,
    make_text(btn_remove_c5_t, "RemoverText", modal5_x + 174, btn5_y + 11, 170, 18, "Remover mesmo assim", 13, 700, WHITE, modal_c5, c5_frame),
    c5_page))

send_changes(c5_modal, "Modal C5 card + content")


print("\n=== DONE! All 5 missing pages created successfully ===")
