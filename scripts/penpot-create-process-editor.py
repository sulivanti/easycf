"""
Create 70-ProcessEditor screens in Penpot Sandbox.
Uses transit+json REST API. Based on 70-process-editor-spec-claude-desktop.md.

Pages:
  70-ProcessEditor          — Canvas with swimlanes, stage nodes, edges
  70-StageConfigPanel       — Canvas + 480px side panel (tab Informacoes)
  70-ProcessEditor-Empty    — Empty canvas state
  70-ProcessEditor-Readonly — Readonly with banner + faded nodes
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
# COLORS
# ═══════════════════════════════════════════

BLUE = "#2E86C1"
BLUE_LT = "#E3F2FD"
BLUE_DK = "#1A5F8B"
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"
GREEN = "#27AE60"
ORANGE = "#F39C12"
ORANGE_DK = "#E67E22"
ORANGE_LT = "#FFF3E0"
ORANGE_BD = "#FFE0B2"
PURPLE = "#8E44AD"
PURPLE_LT = "#F3E5F5"
SWIMLANE_1 = "#F0F7FF"
SWIMLANE_2 = "#FFF8F0"
SWIMLANE_BORDER = "#E0E8F0"
MINIMAP_BG = "#FAFAFA"
DRAFT_T = "#B8860B"
DRAFT_BG = "#FFF3E0"
DRAFT_BD = "#FFE0B2"
PUB_T = "#1E7A42"
PUB_BG = "#E8F8EF"
PUB_BD = "#B5E8C9"

T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"


# ═══════════════════════════════════════════
# SHARED BUILDERS
# ═══════════════════════════════════════════

def build_topbar(changes, fid, pid, breadcrumb_items=None):
    """Topbar with Process Editor breadcrumb."""
    if breadcrumb_items is None:
        breadcrumb_items = [("Processos", False), ("Modelagem", False), ("Editor", True)]

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
    for i, (label, active) in enumerate(breadcrumb_items):
        if i > 0:
            bcs = uid()
            changes.append(add_obj(bcs, fid, fid,
                make_text(bcs, f"BC-Sep{i}", bx, 24, 10, 16, ">", 13, 400, T6, fid, fid), pid))
            bx += 14
        bc = uid()
        w = len(label) * 8 + 10
        changes.append(add_obj(bc, fid, fid,
            make_text(bc, f"BC-{label}", bx, 24, w, 16, label, 13,
                      700 if active else 400, T1 if active else T4, fid, fid), pid))
        bx += w + 4

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


def build_sidebar_process(changes, fid, pid):
    """Sidebar with Modelagem active under PROCESSOS."""
    sb_bg = uid()
    changes.append(add_obj(sb_bg, fid, fid,
        make_rect(sb_bg, "SidebarBG", 0, 64, 240, 836, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    cat1 = uid()
    changes.append(add_obj(cat1, fid, fid,
        make_text(cat1, "Cat-Admin", 28, 88, 200, 12, "ADMINISTRACAO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))

    y = 108
    for label in ["Usuarios", "Perfis e Permissoes"]:
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y+11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        mid = uid()
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y+10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    y += 12
    cat2 = uid()
    changes.append(add_obj(cat2, fid, fid,
        make_text(cat2, "Cat-Org", 28, y, 200, 12, "ORGANIZACAO", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 20
    for label in ["Estrutura Org.", "Departamentos"]:
        ico = uid()
        changes.append(add_obj(ico, fid, fid,
            make_rect(ico, f"icon-{label}", 28, y+11, 18, 18, T4, fid, fid, opacity=0.25, radius=2), pid))
        mid = uid()
        changes.append(add_obj(mid, fid, fid,
            make_text(mid, f"Menu-{label}", 56, y+10, 150, 20, label, 13, 500, T4, fid, fid), pid))
        y += 42

    y += 12
    cat3 = uid()
    changes.append(add_obj(cat3, fid, fid,
        make_text(cat3, "Cat-Processos", 28, y, 200, 12, "PROCESSOS", 9, 700, T5, fid, fid,
                  uppercase=True, letter_spacing=1.4), pid))
    y += 20
    bg_id = uid()
    changes.append(add_obj(bg_id, fid, fid,
        make_rect(bg_id, "MenuBG-Modelagem", 16, y, 208, 40, BLUE_LT, fid, fid, radius=6), pid))
    ico = uid()
    changes.append(add_obj(ico, fid, fid,
        make_rect(ico, "icon-Modelagem", 28, y+11, 18, 18, BLUE, fid, fid, opacity=0.4, radius=2), pid))
    mid = uid()
    changes.append(add_obj(mid, fid, fid,
        make_text(mid, "Menu-Modelagem", 56, y+10, 150, 20, "Modelagem", 13, 700, BLUE, fid, fid), pid))

    foot_border = uid()
    changes.append(add_obj(foot_border, fid, fid,
        make_rect(foot_border, "SidebarFootBorder", 0, 864, 240, 1, BORDER, fid, fid), pid))
    dot = uid()
    changes.append(add_obj(dot, fid, fid,
        make_rect(dot, "GreenDot", 28, 884, 8, 8, GREEN, fid, fid, radius=4), pid))
    ftxt = uid()
    changes.append(add_obj(ftxt, fid, fid,
        make_text(ftxt, "ServerOnline", 44, 880, 120, 16, "Servidor Online", 12, 400, T4, fid, fid), pid))


def build_editor_toolbar(changes, fid, pid, ox, oy, status="DRAFT"):
    """Top toolbar with cycle name, status badge, and action buttons."""
    tb = uid()
    changes.append(add_obj(tb, fid, fid,
        make_rect(tb, "EditorToolbarBG", ox, oy, 1200, 56, WHITE, fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))

    cn = uid()
    changes.append(add_obj(cn, fid, fid,
        make_text(cn, "CycleName", ox+24, oy+18, 200, 22, "Ciclo de Compras v2", 18, 700, T1, fid, fid), pid))

    if status == "DRAFT":
        badge_bg = uid()
        changes.append(add_obj(badge_bg, fid, fid,
            make_rect(badge_bg, "StatusBadgeBG", ox+240, oy+19, 52, 20, DRAFT_BG, fid, fid,
                      radius=4, strokes=stroke_border(DRAFT_BD, 1, "inner")), pid))
        badge_t = uid()
        changes.append(add_obj(badge_t, fid, fid,
            make_text(badge_t, "StatusBadgeText", ox+248, oy+22, 36, 14, "DRAFT", 10, 700, DRAFT_T, fid, fid,
                      uppercase=True), pid))
    else:
        badge_bg = uid()
        changes.append(add_obj(badge_bg, fid, fid,
            make_rect(badge_bg, "StatusBadgeBG", ox+240, oy+19, 74, 20, PUB_BG, fid, fid,
                      radius=4, strokes=stroke_border(PUB_BD, 1, "inner")), pid))
        badge_t = uid()
        changes.append(add_obj(badge_t, fid, fid,
            make_text(badge_t, "StatusBadgeText", ox+248, oy+22, 58, 14, "PUBLISHED", 10, 700, PUB_T, fid, fid,
                      uppercase=True), pid))

    bx = ox + 1200
    bx -= 44
    btn_o = uid()
    changes.append(add_obj(btn_o, fid, fid,
        make_rect(btn_o, "BtnOverflow", bx, oy+10, 36, 36, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    btn_o_t = uid()
    changes.append(add_obj(btn_o_t, fid, fid,
        make_text(btn_o_t, "BtnOverflowText", bx+10, oy+16, 16, 20, "...", 16, 600, T3, fid, fid), pid))

    bx -= 88
    btn_p = uid()
    changes.append(add_obj(btn_p, fid, fid,
        make_rect(btn_p, "BtnPublish", bx, oy+10, 80, 36, BLUE, fid, fid, radius=8), pid))
    btn_p_t = uid()
    changes.append(add_obj(btn_p_t, fid, fid,
        make_text(btn_p_t, "BtnPublishText", bx+12, oy+20, 56, 16, "Publicar", 13, 700, WHITE, fid, fid), pid))

    bx -= 76
    btn_s = uid()
    changes.append(add_obj(btn_s, fid, fid,
        make_rect(btn_s, "BtnSave", bx, oy+10, 68, 36, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    btn_s_t = uid()
    changes.append(add_obj(btn_s_t, fid, fid,
        make_text(btn_s_t, "BtnSaveText", bx+12, oy+20, 44, 16, "Salvar", 13, 600, T3, fid, fid), pid))


def build_stage_node(changes, fid, pid, x, y, name, gates=0, roles=0,
                     is_initial=False, selected=False, faded=False):
    """Stage node 180x72 with name and badges."""
    border_color = BLUE_DK if selected else BLUE
    border_width = 2 if selected else 1
    node_opacity = 0.7 if faded else 1

    node_bg = uid()
    changes.append(add_obj(node_bg, fid, fid,
        make_rect(node_bg, f"StageNode-{name}", x, y, 180, 72, WHITE, fid, fid,
                  opacity=node_opacity, radius=12,
                  strokes=stroke_border(border_color, border_width, "inner")), pid))

    nt = uid()
    changes.append(add_obj(nt, fid, fid,
        make_text(nt, f"StageName-{name}", x+12, y+12, 156, 18, name, 13, 600, T1, fid, fid,
                  text_opacity=node_opacity), pid))

    bx = x + 12
    by = y + 40
    if gates > 0:
        gb = uid()
        changes.append(add_obj(gb, fid, fid,
            make_rect(gb, f"GatesBadgeBG-{name}", bx, by, 50, 18, BG_PAGE, fid, fid,
                      radius=4, opacity=node_opacity), pid))
        gt = uid()
        changes.append(add_obj(gt, fid, fid,
            make_text(gt, f"GatesBadge-{name}", bx+6, by+4, 38, 12, f"{gates} gates", 9, 700, T4, fid, fid,
                      text_opacity=node_opacity), pid))
        bx += 54

    if roles > 0:
        rb = uid()
        changes.append(add_obj(rb, fid, fid,
            make_rect(rb, f"RolesBadgeBG-{name}", bx, by, 52, 18, BG_PAGE, fid, fid,
                      radius=4, opacity=node_opacity), pid))
        rt = uid()
        changes.append(add_obj(rt, fid, fid,
            make_text(rt, f"RolesBadge-{name}", bx+6, by+4, 40, 12, f"{roles} papeis", 9, 700, T4, fid, fid,
                      text_opacity=node_opacity), pid))
        bx += 56

    if is_initial:
        ib = uid()
        changes.append(add_obj(ib, fid, fid,
            make_rect(ib, f"InitialBadge-{name}", bx, by, 44, 18, BLUE_LT, fid, fid,
                      radius=4, opacity=node_opacity), pid))
        it = uid()
        changes.append(add_obj(it, fid, fid,
            make_text(it, f"InitialText-{name}", bx+6, by+4, 32, 12, "Inicial", 9, 700, BLUE, fid, fid,
                      text_opacity=node_opacity), pid))


def build_edge(changes, fid, pid, x1, y1, x2, y2, color=T4):
    """Edge line with arrow indicator."""
    lx = min(x1, x2)
    ly = min(y1, y2)
    w = abs(x2 - x1)
    h = abs(y2 - y1)
    if w < 2:
        w = 2
    if h < 2:
        h = 2
    line = uid()
    if abs(x2 - x1) >= abs(y2 - y1):
        changes.append(add_obj(line, fid, fid,
            make_rect(line, "Edge", lx, ly, w, 2, color, fid, fid), pid))
    else:
        changes.append(add_obj(line, fid, fid,
            make_rect(line, "Edge", lx, ly, 2, h, color, fid, fid), pid))
    arr = uid()
    changes.append(add_obj(arr, fid, fid,
        make_rect(arr, "EdgeArrow", x2-3, y2-3, 6, 6, color, fid, fid, radius=3), pid))


def build_gate_diamond(changes, fid, pid, x, y):
    """Gate diamond 24x24."""
    gd = uid()
    changes.append(add_obj(gd, fid, fid,
        make_rect(gd, "GateDiamond", x, y, 24, 24, ORANGE, fid, fid,
                  radius=4, strokes=stroke_border(ORANGE_DK, 1, "inner")), pid))
    gt = uid()
    changes.append(add_obj(gt, fid, fid,
        make_text(gt, "GateDiamondIcon", x+7, y+5, 10, 14, "G", 10, 700, WHITE, fid, fid), pid))


def build_minimap(changes, fid, pid, x, y):
    """MiniMap 120x80."""
    mm_bg = uid()
    changes.append(add_obj(mm_bg, fid, fid,
        make_rect(mm_bg, "MiniMapBG", x, y, 120, 80, MINIMAP_BG, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    vp = uid()
    changes.append(add_obj(vp, fid, fid,
        make_rect(vp, "MiniMapViewport", x+15, y+10, 50, 30, BLUE, fid, fid,
                  opacity=0.1, radius=2, strokes=stroke_border(BLUE, 1, "inner")), pid))
    for nx, ny in [(x+20, y+20), (x+45, y+20), (x+70, y+35), (x+85, y+50)]:
        mn = uid()
        changes.append(add_obj(mn, fid, fid,
            make_rect(mn, "MiniNode", nx, ny, 12, 6, BLUE, fid, fid, opacity=0.5, radius=2), pid))


def build_zoom_controls(changes, fid, pid, x, y):
    """Zoom +/- buttons."""
    zp_bg = uid()
    changes.append(add_obj(zp_bg, fid, fid,
        make_rect(zp_bg, "ZoomPlusBG", x, y, 36, 36, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    zp_t = uid()
    changes.append(add_obj(zp_t, fid, fid,
        make_text(zp_t, "ZoomPlusText", x+10, y+8, 16, 20, "+", 16, 700, T3, fid, fid), pid))
    zm_bg = uid()
    changes.append(add_obj(zm_bg, fid, fid,
        make_rect(zm_bg, "ZoomMinusBG", x, y+40, 36, 36, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    zm_t = uid()
    changes.append(add_obj(zm_t, fid, fid,
        make_text(zm_t, "ZoomMinusText", x+10, y+48, 16, 20, "-", 16, 700, T3, fid, fid), pid))


def build_readonly_banner(changes, fid, pid, ox, oy, w=1200):
    """Readonly banner 44px blue."""
    bb = uid()
    changes.append(add_obj(bb, fid, fid,
        make_rect(bb, "ReadonlyBannerBG", ox, oy, w, 44, BLUE_LT, fid, fid), pid))
    ico = uid()
    changes.append(add_obj(ico, fid, fid,
        make_rect(ico, "ReadonlyInfoIcon", ox + w//2 - 180, oy+14, 16, 16, BLUE, fid, fid,
                  opacity=0.4, radius=8), pid))
    bt = uid()
    changes.append(add_obj(bt, fid, fid,
        make_text(bt, "ReadonlyBannerText", ox + w//2 - 160, oy+13, 260, 18,
                  "Este ciclo esta publicado. Crie um Fork para editar.", 13, 500, BLUE, fid, fid), pid))
    fb = uid()
    changes.append(add_obj(fb, fid, fid,
        make_rect(fb, "BtnForkBG", ox + w//2 + 110, oy+8, 52, 28, WHITE, fid, fid,
                  radius=6, opacity=0, strokes=stroke_border(BLUE, 1, "inner")), pid))
    ft = uid()
    changes.append(add_obj(ft, fid, fid,
        make_text(ft, "BtnForkText", ox + w//2 + 120, oy+13, 32, 18, "Fork", 12, 700, BLUE, fid, fid), pid))


def build_form_field(changes, fid, pid, x, y, label_text, value_text, w=432):
    """Form field with label and input. Returns bottom y."""
    lid = uid()
    changes.append(add_obj(lid, fid, fid,
        make_text(lid, f"Label-{label_text}", x, y, w, 12, label_text, 10, 700, T4, fid, fid,
                  uppercase=True, letter_spacing=0.8), pid))
    inp = uid()
    changes.append(add_obj(inp, fid, fid,
        make_rect(inp, f"Input-{label_text}", x, y+18, w, 42, WHITE, fid, fid,
                  radius=8, strokes=stroke_border(BORDER, 1, "inner")), pid))
    vt = uid()
    changes.append(add_obj(vt, fid, fid,
        make_text(vt, f"Value-{label_text}", x+14, y+29, w-28, 20, value_text, 14, 500, T1, fid, fid), pid))
    return y + 76


# ═══════════════════════════════════════════
# PAGE 1: 70-ProcessEditor
# ═══════════════════════════════════════════

page1_id = uid()
changes_p1 = [add_page_change(page1_id, "70-ProcessEditor")]
send_changes(changes_p1, "Page 70-ProcessEditor")

frame1_id = uid()
changes = [add_obj(frame1_id, ROOT, ROOT,
    make_frame(frame1_id, "70-ProcessEditor", 0, 0, 1440, 900, BG_PAGE), page1_id)]
send_changes(changes, "Frame 70-ProcessEditor")

changes = []
build_topbar(changes, frame1_id, page1_id)
send_changes(changes, "P1 Topbar")

changes = []
build_sidebar_process(changes, frame1_id, page1_id)
send_changes(changes, "P1 Sidebar")

changes = []
build_editor_toolbar(changes, frame1_id, page1_id, 240, 64, "DRAFT")
send_changes(changes, "P1 EditorToolbar")

# Swimlanes
changes = []
content_bg = uid()
changes.append(add_obj(content_bg, frame1_id, frame1_id,
    make_rect(content_bg, "ContentAreaBG", 240, 120, 1200, 780, BG_PAGE, frame1_id, frame1_id), page1_id))

sl1 = uid()
changes.append(add_obj(sl1, frame1_id, frame1_id,
    make_rect(sl1, "Swimlane-Solicitacao", 240, 120, 1200, 330, SWIMLANE_1, frame1_id, frame1_id), page1_id))
sl1_label = uid()
changes.append(add_obj(sl1_label, frame1_id, frame1_id,
    make_text(sl1_label, "SwimlaneLbl-Solicitacao", 256, 132, 120, 14, "SOLICITACAO", 11, 700, T4, frame1_id, frame1_id,
              uppercase=True, letter_spacing=0.8), page1_id))

sl2 = uid()
changes.append(add_obj(sl2, frame1_id, frame1_id,
    make_rect(sl2, "Swimlane-Aprovacao", 240, 450, 1200, 330, SWIMLANE_2, frame1_id, frame1_id,
              strokes=stroke_border(SWIMLANE_BORDER, 1, "inner")), page1_id))
sl2_label = uid()
changes.append(add_obj(sl2_label, frame1_id, frame1_id,
    make_text(sl2_label, "SwimlaneLbl-Aprovacao", 256, 462, 100, 14, "APROVACAO", 11, 700, T4, frame1_id, frame1_id,
              uppercase=True, letter_spacing=0.8), page1_id))
send_changes(changes, "P1 Swimlanes")

# Nodes in Swimlane 1
changes = []
build_stage_node(changes, frame1_id, page1_id, 320, 190, "Preenchimento", gates=2, roles=3, is_initial=True)
build_stage_node(changes, frame1_id, page1_id, 600, 190, "Revisao", gates=1, roles=2)
build_edge(changes, frame1_id, page1_id, 500, 225, 600, 225)
send_changes(changes, "P1 Swimlane1 Nodes")

# Nodes in Swimlane 2
changes = []
build_stage_node(changes, frame1_id, page1_id, 320, 510, "Aprovacao N1", gates=1, roles=1)
build_stage_node(changes, frame1_id, page1_id, 650, 510, "Aprovacao N2", gates=1, roles=1)
build_edge(changes, frame1_id, page1_id, 500, 545, 560, 545)
build_gate_diamond(changes, frame1_id, page1_id, 564, 533)
build_edge(changes, frame1_id, page1_id, 592, 545, 650, 545)
send_changes(changes, "P1 Swimlane2 Nodes")

# Cross-swimlane edge: Revisao -> Aprovacao N1
changes = []
ev1 = uid()
changes.append(add_obj(ev1, frame1_id, frame1_id,
    make_rect(ev1, "EdgeVert-Cross", 689, 262, 2, 248, T4, frame1_id, frame1_id), page1_id))
ea = uid()
changes.append(add_obj(ea, frame1_id, frame1_id,
    make_rect(ea, "EdgeArrow-Cross", 687, 507, 6, 6, T4, frame1_id, frame1_id, radius=3), page1_id))
send_changes(changes, "P1 Cross Edge")

# MiniMap + Zoom
changes = []
build_minimap(changes, frame1_id, page1_id, 1304, 804)
build_zoom_controls(changes, frame1_id, page1_id, 256, 804)
send_changes(changes, "P1 MiniMap+Zoom")


# ═══════════════════════════════════════════
# PAGE 2: 70-StageConfigPanel
# ═══════════════════════════════════════════

page2_id = uid()
changes = [add_page_change(page2_id, "70-StageConfigPanel")]
send_changes(changes, "Page 70-StageConfigPanel")

frame2_id = uid()
changes = [add_obj(frame2_id, ROOT, ROOT,
    make_frame(frame2_id, "70-StageConfigPanel", 0, 0, 1440, 900, BG_PAGE), page2_id)]
send_changes(changes, "Frame 70-StageConfigPanel")

changes = []
build_topbar(changes, frame2_id, page2_id)
send_changes(changes, "P2 Topbar")

changes = []
build_sidebar_process(changes, frame2_id, page2_id)
send_changes(changes, "P2 Sidebar")

changes = []
build_editor_toolbar(changes, frame2_id, page2_id, 240, 64, "DRAFT")
send_changes(changes, "P2 EditorToolbar")

# Canvas (simplified behind panel)
changes = []
content_bg2 = uid()
changes.append(add_obj(content_bg2, frame2_id, frame2_id,
    make_rect(content_bg2, "ContentAreaBG", 240, 120, 1200, 780, BG_PAGE, frame2_id, frame2_id), page2_id))
sl1_2 = uid()
changes.append(add_obj(sl1_2, frame2_id, frame2_id,
    make_rect(sl1_2, "Swimlane-Solicitacao", 240, 120, 720, 780, SWIMLANE_1, frame2_id, frame2_id), page2_id))
sl1l_2 = uid()
changes.append(add_obj(sl1l_2, frame2_id, frame2_id,
    make_text(sl1l_2, "SwimlaneLbl-Solicitacao", 256, 132, 120, 14, "SOLICITACAO", 11, 700, T4, frame2_id, frame2_id,
              uppercase=True, letter_spacing=0.8), page2_id))
build_stage_node(changes, frame2_id, page2_id, 320, 190, "Preenchimento", gates=2, roles=3, is_initial=True, selected=True)
build_stage_node(changes, frame2_id, page2_id, 600, 190, "Revisao", gates=1, roles=2)
build_edge(changes, frame2_id, page2_id, 500, 225, 600, 225)
send_changes(changes, "P2 Canvas")

# Panel overlay (480px: x=960)
changes = []
panel_x = 960
panel_bg = uid()
changes.append(add_obj(panel_bg, frame2_id, frame2_id,
    make_rect(panel_bg, "PanelBG", panel_x, 64, 480, 836, WHITE, frame2_id, frame2_id), page2_id))

# Panel header
ph_border = uid()
changes.append(add_obj(ph_border, frame2_id, frame2_id,
    make_rect(ph_border, "PanelHeaderBorder", panel_x, 64, 480, 64, WHITE, frame2_id, frame2_id,
              strokes=stroke_border(BORDER, 1, "inner")), page2_id))
ph_title = uid()
changes.append(add_obj(ph_title, frame2_id, frame2_id,
    make_text(ph_title, "PanelTitle", panel_x+24, 86, 280, 20, "STG-001 — Preenchimento", 16, 700, T1, frame2_id, frame2_id), page2_id))
as_t = uid()
changes.append(add_obj(as_t, frame2_id, frame2_id,
    make_text(as_t, "AutoSaveText", panel_x+380, 92, 40, 14, "Salvo", 11, 500, GREEN, frame2_id, frame2_id), page2_id))
cb = uid()
changes.append(add_obj(cb, frame2_id, frame2_id,
    make_rect(cb, "BtnClose", panel_x+436, 86, 20, 20, T4, frame2_id, frame2_id,
              opacity=0.3, radius=2), page2_id))
cb_t = uid()
changes.append(add_obj(cb_t, frame2_id, frame2_id,
    make_text(cb_t, "BtnCloseX", panel_x+440, 86, 12, 18, "x", 16, 600, T4, frame2_id, frame2_id), page2_id))
send_changes(changes, "P2 Panel Header")

# Tab bar
changes = []
tab_y = 128
tab_border = uid()
changes.append(add_obj(tab_border, frame2_id, frame2_id,
    make_rect(tab_border, "TabBarBorder", panel_x, tab_y, 480, 44, WHITE, frame2_id, frame2_id,
              strokes=stroke_border(BORDER, 1, "inner")), page2_id))

tabs = [("Informacoes", True), ("Gates", False), ("Papeis", False), ("Transicoes", False)]
tx = panel_x + 24
for label, active in tabs:
    tw = len(label) * 8 + 20
    tt = uid()
    changes.append(add_obj(tt, frame2_id, frame2_id,
        make_text(tt, f"Tab-{label}", tx, tab_y+14, tw, 18, label, 13, 600,
                  BLUE if active else T4, frame2_id, frame2_id), page2_id))
    if active:
        tab_line = uid()
        changes.append(add_obj(tab_line, frame2_id, frame2_id,
            make_rect(tab_line, f"TabLine-{label}", tx, tab_y+40, tw, 2, BLUE, frame2_id, frame2_id), page2_id))
    tx += tw + 8
send_changes(changes, "P2 Tabs")

# Panel body - Informacoes tab
changes = []
body_y = 196
fy = body_y
fy = build_form_field(changes, frame2_id, page2_id, panel_x+24, fy, "NOME", "Preenchimento")
fy = build_form_field(changes, frame2_id, page2_id, panel_x+24, fy, "DESCRICAO", "Etapa de preenchimento inicial")
fy = build_form_field(changes, frame2_id, page2_id, panel_x+24, fy, "MACROETAPA", "Solicitacao")
fy = build_form_field(changes, frame2_id, page2_id, panel_x+24, fy, "POSICAO (ORDEM)", "1", w=120)

# Toggles
toggle_y = fy + 8
tog1 = uid()
changes.append(add_obj(tog1, frame2_id, frame2_id,
    make_rect(tog1, "ToggleInicial", panel_x+24, toggle_y, 36, 20, BLUE, frame2_id, frame2_id, radius=10), page2_id))
tog1k = uid()
changes.append(add_obj(tog1k, frame2_id, frame2_id,
    make_rect(tog1k, "ToggleInicialKnob", panel_x+42, toggle_y+2, 16, 16, WHITE, frame2_id, frame2_id, radius=8), page2_id))
tog1t = uid()
changes.append(add_obj(tog1t, frame2_id, frame2_id,
    make_text(tog1t, "ToggleInicialLabel", panel_x+68, toggle_y+2, 100, 16, "Estagio Inicial", 12, 500, T3, frame2_id, frame2_id), page2_id))

tog2 = uid()
changes.append(add_obj(tog2, frame2_id, frame2_id,
    make_rect(tog2, "ToggleTerminal", panel_x+200, toggle_y, 36, 20, BORDER, frame2_id, frame2_id, radius=10), page2_id))
tog2k = uid()
changes.append(add_obj(tog2k, frame2_id, frame2_id,
    make_rect(tog2k, "ToggleTerminalKnob", panel_x+204, toggle_y+2, 16, 16, WHITE, frame2_id, frame2_id, radius=8), page2_id))
tog2t = uid()
changes.append(add_obj(tog2t, frame2_id, frame2_id,
    make_text(tog2t, "ToggleTerminalLabel", panel_x+244, toggle_y+2, 110, 16, "Estagio Terminal", 12, 500, T3, frame2_id, frame2_id), page2_id))
send_changes(changes, "P2 Panel Body")


# ═══════════════════════════════════════════
# PAGE 3: 70-ProcessEditor-Empty
# ═══════════════════════════════════════════

page3_id = uid()
changes = [add_page_change(page3_id, "70-ProcessEditor-Empty")]
send_changes(changes, "Page 70-ProcessEditor-Empty")

frame3_id = uid()
changes = [add_obj(frame3_id, ROOT, ROOT,
    make_frame(frame3_id, "70-ProcessEditor-Empty", 0, 0, 1440, 900, BG_PAGE), page3_id)]
send_changes(changes, "Frame 70-ProcessEditor-Empty")

changes = []
build_topbar(changes, frame3_id, page3_id)
send_changes(changes, "P3 Topbar")

changes = []
build_sidebar_process(changes, frame3_id, page3_id)
send_changes(changes, "P3 Sidebar")

changes = []
build_editor_toolbar(changes, frame3_id, page3_id, 240, 64, "DRAFT")
send_changes(changes, "P3 EditorToolbar")

# Empty canvas
changes = []
content_bg3 = uid()
changes.append(add_obj(content_bg3, frame3_id, frame3_id,
    make_rect(content_bg3, "ContentAreaBG", 240, 120, 1200, 780, BG_PAGE, frame3_id, frame3_id), page3_id))

dashed_x = 240 + (1200 - 400) // 2
dashed_y = 120 + (780 - 200) // 2
dr = uid()
changes.append(add_obj(dr, frame3_id, frame3_id,
    make_rect(dr, "EmptyDashedRect", dashed_x, dashed_y, 400, 200, WHITE, frame3_id, frame3_id,
              opacity=0, radius=12, strokes=stroke_dashed("#CCCCCC", 2, "inner")), page3_id))

fi = uid()
changes.append(add_obj(fi, frame3_id, frame3_id,
    make_rect(fi, "EmptyFlowIcon", dashed_x+176, dashed_y+50, 48, 48, T6, frame3_id, frame3_id,
              opacity=0.3, radius=8), page3_id))

em = uid()
changes.append(add_obj(em, frame3_id, frame3_id,
    make_text(em, "EmptyText", dashed_x+20, dashed_y+120, 360, 20,
              "Clique duas vezes para criar o primeiro estagio", 16, 600, T4, frame3_id, frame3_id), page3_id))
send_changes(changes, "P3 EmptyCanvas")


# ═══════════════════════════════════════════
# PAGE 4: 70-ProcessEditor-Readonly
# ═══════════════════════════════════════════

page4_id = uid()
changes = [add_page_change(page4_id, "70-ProcessEditor-Readonly")]
send_changes(changes, "Page 70-ProcessEditor-Readonly")

frame4_id = uid()
changes = [add_obj(frame4_id, ROOT, ROOT,
    make_frame(frame4_id, "70-ProcessEditor-Readonly", 0, 0, 1440, 900, BG_PAGE), page4_id)]
send_changes(changes, "Frame 70-ProcessEditor-Readonly")

changes = []
build_topbar(changes, frame4_id, page4_id)
send_changes(changes, "P4 Topbar")

changes = []
build_sidebar_process(changes, frame4_id, page4_id)
send_changes(changes, "P4 Sidebar")

changes = []
build_editor_toolbar(changes, frame4_id, page4_id, 240, 64, "PUBLISHED")
send_changes(changes, "P4 EditorToolbar PUBLISHED")

# Readonly banner
changes = []
build_readonly_banner(changes, frame4_id, page4_id, 240, 120, 1200)
send_changes(changes, "P4 ReadonlyBanner")

# Canvas with faded nodes
changes = []
content_bg4 = uid()
changes.append(add_obj(content_bg4, frame4_id, frame4_id,
    make_rect(content_bg4, "ContentAreaBG", 240, 164, 1200, 736, BG_PAGE, frame4_id, frame4_id), page4_id))

sl1_4 = uid()
changes.append(add_obj(sl1_4, frame4_id, frame4_id,
    make_rect(sl1_4, "Swimlane-Solicitacao", 240, 164, 1200, 330, SWIMLANE_1, frame4_id, frame4_id), page4_id))
sl1l_4 = uid()
changes.append(add_obj(sl1l_4, frame4_id, frame4_id,
    make_text(sl1l_4, "SwimlaneLbl-Solicitacao", 256, 176, 120, 14, "SOLICITACAO", 11, 700, T4, frame4_id, frame4_id,
              uppercase=True, letter_spacing=0.8), page4_id))

sl2_4 = uid()
changes.append(add_obj(sl2_4, frame4_id, frame4_id,
    make_rect(sl2_4, "Swimlane-Aprovacao", 240, 494, 1200, 330, SWIMLANE_2, frame4_id, frame4_id,
              strokes=stroke_border(SWIMLANE_BORDER, 1, "inner")), page4_id))
sl2l_4 = uid()
changes.append(add_obj(sl2l_4, frame4_id, frame4_id,
    make_text(sl2l_4, "SwimlaneLbl-Aprovacao", 256, 506, 100, 14, "APROVACAO", 11, 700, T4, frame4_id, frame4_id,
              uppercase=True, letter_spacing=0.8), page4_id))
send_changes(changes, "P4 Swimlanes")

# Faded nodes
changes = []
build_stage_node(changes, frame4_id, page4_id, 320, 234, "Preenchimento", gates=2, roles=3, is_initial=True, faded=True)
build_stage_node(changes, frame4_id, page4_id, 600, 234, "Revisao", gates=1, roles=2, faded=True)
build_edge(changes, frame4_id, page4_id, 500, 269, 600, 269)

build_stage_node(changes, frame4_id, page4_id, 320, 554, "Aprovacao N1", gates=1, roles=1, faded=True)
build_stage_node(changes, frame4_id, page4_id, 650, 554, "Aprovacao N2", gates=1, roles=1, faded=True)
build_edge(changes, frame4_id, page4_id, 500, 589, 560, 589)
build_gate_diamond(changes, frame4_id, page4_id, 564, 577)
build_edge(changes, frame4_id, page4_id, 592, 589, 650, 589)
send_changes(changes, "P4 Faded Nodes")

# MiniMap + Zoom
changes = []
build_minimap(changes, frame4_id, page4_id, 1304, 804)
build_zoom_controls(changes, frame4_id, page4_id, 256, 804)
send_changes(changes, "P4 MiniMap+Zoom")


print("\nAll 4 pages created successfully!")
print(f"  Pages: 70-ProcessEditor, 70-StageConfigPanel, 70-ProcessEditor-Empty, 70-ProcessEditor-Readonly")
print(f"  File: {FILE_ID}")
