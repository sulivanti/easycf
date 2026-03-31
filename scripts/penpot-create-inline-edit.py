"""
Create 10-OrgDetail-View and 10-OrgDetail-Edit screens in Penpot.
Ref: 10-org-detail-inline-edit-spec.md, UX-001-M02.

Pages (separate per feedback):
  10-OrgDetail-View  — Detail panel in view mode (ReadOnlyFields)
  10-OrgDetail-Edit  — Detail panel in inline edit mode (inputs, blue header)
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
# HELPERS (same as penpot-create-org-screens.py)
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
GREEN = "#27AE60"
GREEN_BG = "#E8F8EF"
GREEN_BD = "#B5E8C9"
GREEN_TXT = "#1E7A42"
RO_BG = "#F8F8F6"
RO_BORDER = "#F0F0EE"

T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"

SIDEBAR_ADMIN = [("Usuarios", False), ("Perfis e Permissoes", False)]
SIDEBAR_ORG = [("Estrutura Org.", True)]
SIDEBAR_PROC = [("Modelagem", False)]


# ═══════════════════════════════════════════
# SHARED BUILDERS
# ═══════════════════════════════════════════

def build_topbar(changes, fid, pid):
    tb_bg = uid()
    changes.append(add_obj(tb_bg, fid, fid,
        make_rect(tb_bg, "TopbarBG", 0, 0, 1440, 64, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))
    logo = uid()
    changes.append(add_obj(logo, fid, fid,
        make_rect(logo, "LogoIcon", 24, 12, 40, 40, BLUE, fid, fid, radius=10), pid))
    a1 = uid()
    changes.append(add_obj(a1, fid, fid,
        make_text(a1, "LogoA1", 30, 18, 28, 20, "A1", 16, 800, WHITE, fid, fid), pid))
    ga1 = uid()
    changes.append(add_obj(ga1, fid, fid,
        make_text(ga1, "GrupoA1", 76, 14, 80, 18, "Grupo A1", 14, 800, T1, fid, fid), pid))
    pi = uid()
    changes.append(add_obj(pi, fid, fid,
        make_text(pi, "PortalInterno", 76, 34, 100, 14, "PORTAL INTERNO", 10, 600, T4, fid, fid,
                  uppercase=True, letter_spacing=1.2), pid))
    sep = uid()
    changes.append(add_obj(sep, fid, fid,
        make_rect(sep, "TopbarSep", 188, 20, 1, 24, BORDER, fid, fid), pid))
    bx = 201
    bc1 = uid()
    changes.append(add_obj(bc1, fid, fid,
        make_text(bc1, "BC-Org", bx, 24, 80, 16, "Organização", 13, 400, T4, fid, fid), pid))
    bcs = uid()
    changes.append(add_obj(bcs, fid, fid,
        make_text(bcs, "BC-Sep", bx+84, 24, 10, 16, "›", 13, 400, T6, fid, fid), pid))
    bc2 = uid()
    changes.append(add_obj(bc2, fid, fid,
        make_text(bc2, "BC-Est", bx+98, 24, 180, 16, "Estrutura Organizacional", 13, 700, T1, fid, fid), pid))
    un = uid()
    changes.append(add_obj(un, fid, fid,
        make_text(un, "TopbarUser", 1290, 16, 100, 15, "Admin ECF", 12, 700, T1, fid, fid), pid))
    ue = uid()
    changes.append(add_obj(ue, fid, fid,
        make_text(ue, "TopbarEmpresa", 1290, 34, 100, 14, "A1 Engenharia", 10, 400, T4, fid, fid), pid))
    av_bg = uid()
    changes.append(add_obj(av_bg, fid, fid,
        make_rect(av_bg, "AvatarBG", 1394, 12, 40, 40, "#F0F0EE", fid, fid, radius=20,
                  strokes=stroke_border(BORDER, 2, "inner")), pid))
    av_txt = uid()
    changes.append(add_obj(av_txt, fid, fid,
        make_text(av_txt, "AvatarText", 1402, 20, 24, 16, "AE", 13, 700, T3, fid, fid), pid))


def build_sidebar(changes, fid, pid):
    sb_bg = uid()
    changes.append(add_obj(sb_bg, fid, fid,
        make_rect(sb_bg, "SidebarBG", 0, 64, 240, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))
    cat1 = uid()
    changes.append(add_obj(cat1, fid, fid,
        make_text(cat1, "Cat-Admin", 28, 88, 200, 12, "ADMINISTRAÇÃO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y = 108
    for label, active in SIDEBAR_ADMIN:
        mid = uid()
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y+11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y+10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42
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
                make_rect(ico, f"icon-{label}", 28, y+11, 18, 18, BLUE, fid, fid, opacity=0.4, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y+10, 150, 20, label, 13, 700, BLUE, fid, fid), pid))
        else:
            ico = uid()
            changes.append(add_obj(ico, fid, fid,
                make_rect(ico, f"icon-{label}", 28, y+11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
            changes.append(add_obj(mid, fid, fid,
                make_text(mid, f"Menu-{label}", 56, y+10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42
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
            make_rect(ico, f"icon-{label}", 28, y+11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y+10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42
    foot_border = uid()
    changes.append(add_obj(foot_border, fid, fid,
        make_rect(foot_border, "SidebarFootBorder", 0, 864, 240, 1, BORDER, fid, fid), pid))
    dot = uid()
    changes.append(add_obj(dot, fid, fid,
        make_rect(dot, "GreenDot", 28, 884, 8, 8, GREEN, fid, fid, radius=4), pid))
    ftxt = uid()
    changes.append(add_obj(ftxt, fid, fid,
        make_text(ftxt, "ServerOnline", 44, 880, 120, 16, "Servidor Online", 12, 400, T4, fid, fid), pid))


def build_tree_panel(changes, fid, pid):
    """Tree panel 380px — same in both View and Edit states."""
    tx = 240
    tw = 380
    pad = 20
    tp_bg = uid()
    changes.append(add_obj(tp_bg, fid, fid,
        make_rect(tp_bg, "TreePanelBG", tx, 64, tw, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))
    ix = tx + pad
    iy = 64 + pad
    iw = tw - pad * 2
    title = uid()
    changes.append(add_obj(title, fid, fid,
        make_text(title, "TreeTitle", ix, iy, iw, 20, "Estrutura de Unidades", 16, 800, T1, fid, fid), pid))
    desc = uid()
    changes.append(add_obj(desc, fid, fid,
        make_text(desc, "TreeDesc", ix, iy+24, iw, 16, "Navegue pela hierarquia do grupo", 12, 400, T4, fid, fid), pid))
    sy = iy + 56
    sbg = uid()
    changes.append(add_obj(sbg, fid, fid,
        make_rect(sbg, "SearchBG", ix, sy, iw, 40, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    sico = uid()
    changes.append(add_obj(sico, fid, fid,
        make_rect(sico, "SearchIcon", ix+12, sy+12, 16, 16, T6, fid, fid, opacity=0.5, radius=8), pid))
    stxt = uid()
    changes.append(add_obj(stxt, fid, fid,
        make_text(stxt, "SearchPlaceholder", ix+38, sy+11, iw-52, 18,
                  "Buscar unidade ou depto...", 13, 400, T6, fid, fid), pid))
    ny = sy + 56
    cx = ix
    # Root: Grupo A1
    root_bld = uid()
    changes.append(add_obj(root_bld, fid, fid,
        make_rect(root_bld, "RootBuilding", cx, ny, 16, 16, T4, fid, fid, opacity=0.3, radius=2), pid))
    root_name = uid()
    changes.append(add_obj(root_name, fid, fid,
        make_text(root_name, "RootName", cx+24, ny-1, 200, 20, "Grupo A1", 14, 700, T1, fid, fid), pid))
    ny += 26
    cx2 = ix + 24
    # Selected: A1 Engenharia (blue bg)
    sel_bg = uid()
    changes.append(add_obj(sel_bg, fid, fid,
        make_rect(sel_bg, "SelNodeBG", cx2, ny, iw-24, 36, BLUE_LT, fid, fid, radius=6), pid))
    sel_chev = uid()
    changes.append(add_obj(sel_chev, fid, fid,
        make_text(sel_chev, "SelChevron", cx2+10, ny+9, 12, 12, "v", 12, 500, BLUE, fid, fid), pid))
    sel_ico = uid()
    changes.append(add_obj(sel_ico, fid, fid,
        make_rect(sel_ico, "SelIcon", cx2+28, ny+10, 16, 16, BLUE, fid, fid, opacity=0.4, radius=2), pid))
    sel_txt = uid()
    changes.append(add_obj(sel_txt, fid, fid,
        make_text(sel_txt, "SelName", cx2+52, ny+9, 200, 18, "A1 Engenharia", 13, 700, BLUE, fid, fid), pid))
    ny += 42
    # Child nodes (dots)
    children = ["Diretoria Comercial", "Diretoria Tecnica", "Administrativo"]
    for child in children:
        dot = uid()
        changes.append(add_obj(dot, fid, fid,
            make_rect(dot, f"Dot-{child}", cx2+32, ny+6, 8, 8, T4, fid, fid, radius=4), pid))
        nt = uid()
        changes.append(add_obj(nt, fid, fid,
            make_text(nt, f"Node-{child}", cx2+48, ny, 200, 18, child, 13, 400, T3, fid, fid), pid))
        ny += 30
    # Collapsed sibling: Construtora Beta
    ny += 6
    col_chev = uid()
    changes.append(add_obj(col_chev, fid, fid,
        make_text(col_chev, "ColChevron", cx2+10, ny+1, 12, 12, ">", 12, 500, T4, fid, fid), pid))
    col_ico = uid()
    changes.append(add_obj(col_ico, fid, fid,
        make_rect(col_ico, "ColIcon", cx2+28, ny, 16, 16, T4, fid, fid, opacity=0.3, radius=2), pid))
    col_txt = uid()
    changes.append(add_obj(col_txt, fid, fid,
        make_text(col_txt, "ColName", cx2+52, ny, 200, 18, "Construtora Beta", 13, 500, T3, fid, fid), pid))


def build_readonly_field(changes, fid, pid, x, y, w, label_text, value_text):
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
        make_text(vt, f"ROVal-{label_text}", x+14, vy+11, w-28, 20,
                  value_text, 14, 500, T1, fid, fid), pid))
    return vy + 42


def build_readonly_field_locked(changes, fid, pid, x, y, w, label_text, value_text):
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
        make_text(vt, f"ROVal-{label_text}", x+14, vy+11, w-42, 20,
                  value_text, 14, 500, T1, fid, fid), pid))
    lock = uid()
    changes.append(add_obj(lock, fid, fid,
        make_rect(lock, f"Lock-{label_text}", x+w-26, vy+14, 14, 14, T5, fid, fid,
                  opacity=0.5, radius=2), pid))
    return vy + 42


def build_edit_input(changes, fid, pid, x, y, w, label_text, value_text, is_placeholder=False, required=False):
    """Inline edit input with blue border (UX-001-M02)."""
    lid = uid()
    req_mark = " *" if required else ""
    # Label in same style as RO but for edit
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"EditLabel-{label_text}", x, y, w, 12,
                  label_text + req_mark, 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    # Red asterisk (if required, added separately for color)
    if required:
        ast = uid()
        changes.append(add_obj(ast, fid, fid,
            make_text(ast, f"Asterisk-{label_text}", x+w-16, y, 16, 12,
                      "*", 10, 700, RED, fid, fid), pid))
    iy = y + 18
    # Input bg with blue border
    iid = uid()
    changes.append(add_obj(iid, fid, fid,
        make_rect(iid, f"EditInput-{label_text}", x, iy, w, 42, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BLUE, 2, "inner")), pid))
    # Value text
    color = T6 if is_placeholder else T1
    weight = 400 if is_placeholder else 500
    vid = uid()
    changes.append(add_obj(vid, fid, fid,
        make_text(vid, f"EditVal-{label_text}", x+14, iy+11, w-28, 20,
                  value_text, 14, weight, color, fid, fid), pid))
    return iy + 42


# ═══════════════════════════════════════════
# DETAIL PANEL SHARED — Header Card
# ═══════════════════════════════════════════

def build_detail_header(changes, fid, pid, dx, is_editing=False):
    """Header card with unit info + action buttons (View or Edit mode)."""
    pad = 24
    hw = 1440 - dx - pad * 2
    hx = dx + pad
    hy = 64 + pad

    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "DetailHeaderBG", hx, hy, hw, 90, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))
    # Building icon
    ico_bg = uid()
    changes.append(add_obj(ico_bg, fid, fid,
        make_rect(ico_bg, "BuildingIconBG", hx+20, hy+20, 48, 48, BG_PAGE, fid, fid, radius=10), pid))
    ico = uid()
    changes.append(add_obj(ico, fid, fid,
        make_rect(ico, "BuildingIcon", hx+32, hy+32, 24, 24, T4, fid, fid, opacity=0.3, radius=2), pid))
    # Name
    nm = uid()
    changes.append(add_obj(nm, fid, fid,
        make_text(nm, "DetailName", hx+84, hy+18, 300, 30, "A1 Engenharia", 24, 800, T1, fid, fid,
                  line_height=1.2), pid))
    # Badge
    badge_bg = uid()
    changes.append(add_obj(badge_bg, fid, fid,
        make_rect(badge_bg, "BadgeActiveBG", hx+84, hy+52, 52, 20, GREEN_BG, fid, fid,
                  radius=10, strokes=stroke_border(GREEN_BD, 1, "inner")), pid))
    badge_txt = uid()
    changes.append(add_obj(badge_txt, fid, fid,
        make_text(badge_txt, "BadgeActiveText", hx+92, hy+55, 36, 12, "ATIVO", 10, 700, GREEN_TXT, fid, fid,
                  uppercase=True, letter_spacing=0.3), pid))
    # Code
    code = uid()
    changes.append(add_obj(code, fid, fid,
        make_text(code, "DetailCode", hx+144, hy+55, 100, 14, "Cód: UN-0012", 12, 400, T4, fid, fid), pid))

    btn_right = hx + hw - 20

    if is_editing:
        # "Salvar Alteracoes" (primary)
        save_w = 170
        save_x = btn_right - save_w
        save_bg = uid()
        changes.append(add_obj(save_bg, fid, fid,
            make_rect(save_bg, "BtnSalvarBG", save_x, hy+25, save_w, 40, BLUE, fid, fid, radius=8), pid))
        check = uid()
        changes.append(add_obj(check, fid, fid,
            make_text(check, "BtnCheckIcon", save_x+14, hy+35, 16, 18, "✓", 13, 700, WHITE, fid, fid), pid))
        save_txt = uid()
        changes.append(add_obj(save_txt, fid, fid,
            make_text(save_txt, "BtnSalvarText", save_x+34, hy+35, save_w-48, 18,
                      "Salvar Alterações", 13, 700, WHITE, fid, fid), pid))
        # "Cancelar" (secondary)
        cancel_w = 110
        cancel_x = save_x - cancel_w - 12
        cancel_bg = uid()
        changes.append(add_obj(cancel_bg, fid, fid,
            make_rect(cancel_bg, "BtnCancelarBG", cancel_x, hy+25, cancel_w, 40, WHITE, fid, fid,
                      radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
        cancel_txt = uid()
        changes.append(add_obj(cancel_txt, fid, fid,
            make_text(cancel_txt, "BtnCancelarText", cancel_x+16, hy+35, cancel_w-32, 18,
                      "Cancelar", 13, 600, T3, fid, fid), pid))
    else:
        # "+ Nova Subdivisao" (primary)
        nova_w = 160
        nova_x = btn_right - nova_w
        nova_bg = uid()
        changes.append(add_obj(nova_bg, fid, fid,
            make_rect(nova_bg, "BtnNovaBG", nova_x, hy+25, nova_w, 40, BLUE, fid, fid, radius=8), pid))
        nova_txt = uid()
        changes.append(add_obj(nova_txt, fid, fid,
            make_text(nova_txt, "BtnNovaText", nova_x+12, hy+35, nova_w-24, 18,
                      "+ Nova Subdivisão", 13, 700, WHITE, fid, fid), pid))
        # "Editar Dados" (secondary)
        edit_w = 130
        edit_x = nova_x - edit_w - 12
        edit_bg = uid()
        changes.append(add_obj(edit_bg, fid, fid,
            make_rect(edit_bg, "BtnEditarBG", edit_x, hy+25, edit_w, 40, WHITE, fid, fid,
                      radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
        pencil = uid()
        changes.append(add_obj(pencil, fid, fid,
            make_rect(pencil, "PencilIcon", edit_x+14, hy+37, 16, 16, T3, fid, fid,
                      opacity=0.3, radius=2), pid))
        edit_txt = uid()
        changes.append(add_obj(edit_txt, fid, fid,
            make_text(edit_txt, "BtnEditarText", edit_x+36, hy+35, edit_w-50, 18,
                      "Editar Dados", 13, 600, T3, fid, fid), pid))

    return hy + 90 + 20  # return next y


# ═══════════════════════════════════════════
# DETAIL PANEL — Dados Cadastrais (View)
# ═══════════════════════════════════════════

def build_dados_view(changes, fid, pid, dx, cy):
    """Dados Cadastrais card in VIEW mode — ReadOnlyFields."""
    pad = 24
    card_x = dx + pad
    card_w = 1440 - dx - pad * 2

    dc_bg = uid()
    changes.append(add_obj(dc_bg, fid, fid,
        make_rect(dc_bg, "DadosCadBG", card_x, cy, card_w, 280, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))
    # Header
    sl = uid()
    changes.append(add_obj(sl, fid, fid,
        make_text(sl, "SecDadosCad", card_x+24, cy+24, 200, 12, "DADOS CADASTRAIS", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))

    fy = cy + 52
    col_w = (card_w - 48 - 16) // 2
    build_readonly_field(changes, fid, pid, card_x+24, fy, col_w, "CNPJ", "12.345.678/0001-90")
    build_readonly_field(changes, fid, pid, card_x+24+col_w+16, fy, col_w, "RAZÃO SOCIAL", "A1 Engenharia Ltda")

    fy += 76
    build_readonly_field(changes, fid, pid, card_x+24, fy, col_w, "FILIAL", "São Paulo - SP")
    build_readonly_field(changes, fid, pid, card_x+24+col_w+16, fy, col_w, "RESPONSÁVEL", "Marcos Silva")

    fy += 76
    build_readonly_field(changes, fid, pid, card_x+24, fy, col_w, "TELEFONE", "(11) 3456-7890")
    build_readonly_field(changes, fid, pid, card_x+24+col_w+16, fy, col_w, "E-MAIL", "contato@a1eng.com.br")

    return cy + 280 + 20


# ═══════════════════════════════════════════
# DETAIL PANEL — Dados Cadastrais (Edit)
# ═══════════════════════════════════════════

def build_dados_edit(changes, fid, pid, dx, cy):
    """Dados Cadastrais card in EDIT mode — inputs with blue border, blue header."""
    pad = 24
    card_x = dx + pad
    card_w = 1440 - dx - pad * 2
    card_h = 360  # taller for Nome field + inputs

    dc_bg = uid()
    changes.append(add_obj(dc_bg, fid, fid,
        make_rect(dc_bg, "DadosCadEditBG", card_x, cy, card_w, card_h, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))

    # Header — BLUE (edit mode)
    hdr_bg = uid()
    changes.append(add_obj(hdr_bg, fid, fid,
        make_rect(hdr_bg, "DadosCadEditHeader", card_x, cy, card_w, 48, BLUE_LT, fid, fid,
                  r1=12, r2=12, r3=0, r4=0), pid))
    # Pencil icon placeholder
    pencil = uid()
    changes.append(add_obj(pencil, fid, fid,
        make_rect(pencil, "EditPencilIcon", card_x+24, cy+17, 14, 14, BLUE, fid, fid,
                  opacity=0.6, radius=2), pid))
    sl = uid()
    changes.append(add_obj(sl, fid, fid,
        make_text(sl, "SecDadosCadEdit", card_x+44, cy+18, 300, 12,
                  "DADOS CADASTRAIS — EDITANDO", 10, 700, BLUE, fid, fid,
                  uppercase=True, letter_spacing=1), pid))

    # Fields
    fy = cy + 64
    col_w = (card_w - 48 - 16) // 2

    # Nome (full width, required)
    build_edit_input(changes, fid, pid, card_x+24, fy, card_w-48,
                     "NOME DA SUBDIVISÃO", "A1 Engenharia", required=True)

    fy += 72
    # CNPJ (1fr) + Razao Social (2fr) — using equal cols for simplicity
    col_w3_1 = (card_w - 48 - 16) // 3
    col_w3_2 = col_w3_1 * 2
    build_edit_input(changes, fid, pid, card_x+24, fy, col_w3_1,
                     "CNPJ", "00.000.000/0000-00", is_placeholder=True)
    build_edit_input(changes, fid, pid, card_x+24+col_w3_1+16, fy, col_w3_2,
                     "RAZÃO SOCIAL", "A1 Engenharia e Construções Civis Ltda")

    fy += 72
    build_edit_input(changes, fid, pid, card_x+24, fy, col_w,
                     "FILIAL", "São Paulo - SP")
    build_edit_input(changes, fid, pid, card_x+24+col_w+16, fy, col_w,
                     "RESPONSÁVEL", "Marcos Silva")

    fy += 72
    build_edit_input(changes, fid, pid, card_x+24, fy, col_w,
                     "TELEFONE", "(00) 00000-0000", is_placeholder=True)
    build_edit_input(changes, fid, pid, card_x+24+col_w+16, fy, col_w,
                     "E-MAIL", "contato@empresa.com", is_placeholder=True)

    return cy + card_h + 20


# ═══════════════════════════════════════════
# HIERARCHY CARD (Edit only, UX-001-M02 M05)
# ═══════════════════════════════════════════

def build_hierarchy_card(changes, fid, pid, dx, cy):
    """Hierarchy card with locked fields — only in edit mode."""
    pad = 24
    card_x = dx + pad
    card_w = 1440 - dx - pad * 2
    card_h = 100

    hc_bg = uid()
    changes.append(add_obj(hc_bg, fid, fid,
        make_rect(hc_bg, "HierarchyCardBG", card_x, cy, card_w, card_h, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))
    # Header
    hl = uid()
    changes.append(add_obj(hl, fid, fid,
        make_text(hl, "SecHierarchy", card_x+24, cy+16, 200, 12, "HIERARQUIA", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))

    col_w = (card_w - 48 - 16) // 2
    build_readonly_field_locked(changes, fid, pid, card_x+24, cy+38, col_w,
                                "UNIDADE PAI", "Grupo A1")
    build_readonly_field_locked(changes, fid, pid, card_x+24+col_w+16, cy+38, col_w,
                                "NÍVEL", "N2 — Diretoria")

    return cy + card_h + 20


# ═══════════════════════════════════════════
# DEPARTAMENTOS + METRICS (shared)
# ═══════════════════════════════════════════

def build_departamentos(changes, fid, pid, dx, cy):
    pad = 24
    card_x = dx + pad
    card_w = 1440 - dx - pad * 2

    dept_bg = uid()
    changes.append(add_obj(dept_bg, fid, fid,
        make_rect(dept_bg, "DeptCardBG", card_x, cy, card_w, 120, WHITE, fid, fid,
                  radius=12, strokes=stroke_border(BORDER, 1, "inner")), pid))
    dl = uid()
    changes.append(add_obj(dl, fid, fid,
        make_text(dl, "SecDept", card_x+24, cy+24, 250, 12, "DEPARTAMENTOS VINCULADOS", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))
    vt_link = uid()
    changes.append(add_obj(vt_link, fid, fid,
        make_text(vt_link, "VerTodos", card_x+card_w-120, cy+24, 96, 14, "Ver todos (12)", 12, 600, BLUE, fid, fid), pid))
    tags = ["Diretoria", "Engenharia Civil", "Projetos Especiais", "RH"]
    tx = card_x + 24
    ty = cy + 52
    for t in tags:
        tw = len(t) * 8 + 32
        tbg = uid()
        changes.append(add_obj(tbg, fid, fid,
            make_rect(tbg, f"Tag-{t}", tx, ty, tw, 36, WHITE, fid, fid,
                      radius=6, strokes=stroke_border(BORDER, 1, "inner")), pid))
        tt = uid()
        changes.append(add_obj(tt, fid, fid,
            make_text(tt, f"TagText-{t}", tx+16, ty+9, tw-32, 18, t, 13, 500, T2, fid, fid), pid))
        tx += tw + 8
    return cy + 120 + 20


def build_metrics(changes, fid, pid, dx, cy):
    pad = 24
    card_x = dx + pad
    card_w = 1440 - dx - pad * 2
    mc_w = (card_w - 20) // 2

    mc_blue_bg = uid()
    changes.append(add_obj(mc_blue_bg, fid, fid,
        make_rect(mc_blue_bg, "MCBlueBG", card_x, cy, mc_w, 140, BLUE, fid, fid, radius=16), pid))
    mcb_label = uid()
    changes.append(add_obj(mcb_label, fid, fid,
        make_text(mcb_label, "MCBlueLabel", card_x+24, cy+24, mc_w-48, 12,
                  "COLABORADORES TOTAIS", 10, 700, WHITE, fid, fid,
                  uppercase=True, letter_spacing=1, text_opacity=0.8), pid))
    mcb_val = uid()
    changes.append(add_obj(mcb_val, fid, fid,
        make_text(mcb_val, "MCBlueVal", card_x+24, cy+44, mc_w-48, 40,
                  "156", 36, 800, WHITE, fid, fid), pid))

    mc_wx = card_x + mc_w + 20
    mc_white_bg = uid()
    changes.append(add_obj(mc_white_bg, fid, fid,
        make_rect(mc_white_bg, "MCWhiteBG", mc_wx, cy, mc_w, 140, WHITE, fid, fid,
                  radius=16, strokes=stroke_border(BORDER, 1, "inner")), pid))
    mcw_label = uid()
    changes.append(add_obj(mcw_label, fid, fid,
        make_text(mcw_label, "MCWhiteLabel", mc_wx+24, cy+24, mc_w-48, 12,
                  "PROJETOS EM EXECUÇÃO", 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=1), pid))
    mcw_val = uid()
    changes.append(add_obj(mcw_val, fid, fid,
        make_text(mcw_val, "MCWhiteVal", mc_wx+24, cy+44, mc_w-48, 40,
                  "28", 36, 800, T1, fid, fid), pid))


# ═══════════════════════════════════════════
# PAGE 1: 10-OrgDetail-View
# ═══════════════════════════════════════════

print("\n=== PAGE 1: 10-OrgDetail-View ===")
page1_id = uid()
frame1_id = uid()
dx = 620  # detail panel x (after sidebar 240 + tree 380)

changes = [add_page_change(page1_id, "10-OrgDetail-View")]
send_changes(changes, "Create page 10-OrgDetail-View")

changes = [add_obj(frame1_id, ROOT, ROOT,
    make_frame(frame1_id, "10-OrgDetail-View", 0, 0, 1440, 900, BG_PAGE), page1_id)]
send_changes(changes, "Create frame")

changes = []
build_topbar(changes, frame1_id, page1_id)
send_changes(changes, "Topbar")

changes = []
build_sidebar(changes, frame1_id, page1_id)
send_changes(changes, "Sidebar")

changes = []
build_tree_panel(changes, frame1_id, page1_id)
send_changes(changes, "Tree panel")

changes = []
# Detail panel bg
dp_bg = uid()
changes.append(add_obj(dp_bg, frame1_id, frame1_id,
    make_rect(dp_bg, "DetailPanelBG", dx, 64, 1440-dx, 836, BG_PAGE, frame1_id, frame1_id), page1_id))
send_changes(changes, "Detail bg")

changes = []
cy = build_detail_header(changes, frame1_id, page1_id, dx, is_editing=False)
send_changes(changes, "Detail header (View)")

changes = []
cy = build_dados_view(changes, frame1_id, page1_id, dx, cy)
send_changes(changes, "Dados Cadastrais (View)")

changes = []
cy = build_departamentos(changes, frame1_id, page1_id, dx, cy)
send_changes(changes, "Departamentos")

changes = []
build_metrics(changes, frame1_id, page1_id, dx, cy)
send_changes(changes, "Metrics")


# ═══════════════════════════════════════════
# PAGE 2: 10-OrgDetail-Edit
# ═══════════════════════════════════════════

print("\n=== PAGE 2: 10-OrgDetail-Edit ===")
page2_id = uid()
frame2_id = uid()

changes = [add_page_change(page2_id, "10-OrgDetail-Edit")]
send_changes(changes, "Create page 10-OrgDetail-Edit")

changes = [add_obj(frame2_id, ROOT, ROOT,
    make_frame(frame2_id, "10-OrgDetail-Edit", 0, 0, 1440, 900, BG_PAGE), page2_id)]
send_changes(changes, "Create frame")

changes = []
build_topbar(changes, frame2_id, page2_id)
send_changes(changes, "Topbar")

changes = []
build_sidebar(changes, frame2_id, page2_id)
send_changes(changes, "Sidebar")

changes = []
build_tree_panel(changes, frame2_id, page2_id)
send_changes(changes, "Tree panel (still visible!)")

changes = []
dp_bg2 = uid()
changes.append(add_obj(dp_bg2, frame2_id, frame2_id,
    make_rect(dp_bg2, "DetailPanelBG", dx, 64, 1440-dx, 836, BG_PAGE, frame2_id, frame2_id), page2_id))
send_changes(changes, "Detail bg")

changes = []
cy = build_detail_header(changes, frame2_id, page2_id, dx, is_editing=True)
send_changes(changes, "Detail header (Edit)")

changes = []
cy = build_dados_edit(changes, frame2_id, page2_id, dx, cy)
send_changes(changes, "Dados Cadastrais — EDITANDO")

changes = []
cy = build_hierarchy_card(changes, frame2_id, page2_id, dx, cy)
send_changes(changes, "Hierarquia card (locked)")

changes = []
cy = build_departamentos(changes, frame2_id, page2_id, dx, cy)
send_changes(changes, "Departamentos")

changes = []
build_metrics(changes, frame2_id, page2_id, dx, cy)
send_changes(changes, "Metrics")


print("\n✅ Done! Pages created:")
print(f"  10-OrgDetail-View: page={page1_id}, frame={frame1_id}")
print(f"  10-OrgDetail-Edit: page={page2_id}, frame={frame2_id}")
