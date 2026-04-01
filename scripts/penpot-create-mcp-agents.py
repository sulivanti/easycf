"""
Create 60-MCP-Agents screens in Penpot Sandbox.
Uses transit+json REST API. Based on 60-mcp-agents-spec.md.

Pages:
  60-MCP-Agents          — View1, tab Agentes active
  60-MCP-Catalogo        — View1, tab Catálogo de Ações active
  60-MCP-Permissoes      — View1, tab Permissões active
  60-MCP-Monitor         — View2, Monitor de Execuções
  60-MCP-Drawer          — View1 + Drawer Create overlay
  60-MCP-Modal-ApiKey    — Modal API Key
  60-MCP-Modal-Revogar   — Modal Revogar Agente
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
              letter_spacing=0, line_height=1.3, font_family="Plus Jakarta Sans",
              font_id="plusjakartasans"):
    leaf = ["^ ",
        "~:text", text,
        "~:font-id", font_id,
        "~:font-family", font_family,
        "~:font-variant-id", str(font_weight),
        "~:font-size", str(font_size),
        "~:font-weight", str(font_weight),
        "~:font-style", "italic" if italic else "normal",
        "~:line-height", str(line_height),
        "~:letter-spacing", str(letter_spacing),
        "~:fill-color", color,
        "~:fill-opacity", 1,
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
# COLORS
# ═══════════════════════════════════════════

BLUE = "#2E86C1"
BLUE_LT = "#E3F2FD"
BLACK = "#111111"
BG_PAGE = "#F5F5F3"
WHITE = "#FFFFFF"
BORDER = "#E8E8E6"
BORDER_LT = "#F0F0EE"
RO_BG = "#F8F8F6"
T1 = "#111111"
T2 = "#333333"
T3 = "#555555"
T4 = "#888888"
T5 = "#AAAAAA"
T6 = "#CCCCCC"
ERR = "#E74C3C"
DANGER = "#C0392B"
SUCCESS = "#27AE60"
AMBER = "#F39C12"
GREEN_T = "#1E7A42"
GREEN_BG = "#E8F8EF"
GREEN_BD = "#B5E8C9"
RED_T = "#C0392B"
RED_BG = "#FFEBEE"
RED_BD = "#F5C6CB"
PEND_T = "#B8860B"
PEND_BG = "#FFF3E0"
PEND_BD = "#FFE0B2"
INACT_T = "#888888"
INACT_BG = "#F5F5F3"
INACT_BD = "#E8E8E6"
EVENT_T = "#6C757D"
EVENT_BG = "#F4F4F2"
EVENT_BD = "#E0E0DE"
TABLE_HEAD = "#FAFAFA"


# ═══════════════════════════════════════════
# SHARED ELEMENTS BUILDER
# ═══════════════════════════════════════════

def build_topbar(frame_id, page_id, parent_id, x0, y0, breadcrumb_mid="Integração", breadcrumb_active="MCP Agentes"):
    """Build shared topbar (64px high). Returns list of changes."""
    changes = []
    # Topbar bg
    tb = uid()
    changes.append(add_obj(tb, parent_id, frame_id,
        make_rect(tb, "Topbar", x0, y0, 1440, 64, WHITE, parent_id, frame_id,
                  strokes=stroke_border(BORDER, 1, "inner")), page_id))
    # Logo
    lg = uid()
    changes.append(add_obj(lg, tb, frame_id,
        make_rect(lg, "Logo", x0+24, y0+12, 40, 40, BLUE, tb, frame_id, radius=10), page_id))
    lt = uid()
    changes.append(add_obj(lt, lg, frame_id,
        make_text(lt, "LogoText", x0+32, y0+20, 24, 20, "A1", 16, 800, WHITE, lg, frame_id), page_id))
    # Company name
    cn = uid()
    changes.append(add_obj(cn, tb, frame_id,
        make_text(cn, "CompanyName", x0+72, y0+14, 100, 18, "GRUPO A1", 14, 800, T1, tb, frame_id), page_id))
    cs = uid()
    changes.append(add_obj(cs, tb, frame_id,
        make_text(cs, "CompanySub", x0+72, y0+34, 120, 14, "PORTAL INTERNO", 10, 600, T4, tb, frame_id,
                  uppercase=True, letter_spacing=1.2), page_id))
    # Separator
    sp = uid()
    changes.append(add_obj(sp, tb, frame_id,
        make_rect(sp, "TbSep", x0+200, y0+20, 1, 24, BORDER, tb, frame_id), page_id))
    # Breadcrumb
    b1 = uid()
    changes.append(add_obj(b1, tb, frame_id,
        make_text(b1, "BcMid", x0+216, y0+24, 80, 18, breadcrumb_mid, 13, 400, T4, tb, frame_id), page_id))
    bx = uid()
    changes.append(add_obj(bx, tb, frame_id,
        make_text(bx, "BcSep", x0+296, y0+24, 12, 18, "›", 13, 400, T6, tb, frame_id), page_id))
    ba = uid()
    changes.append(add_obj(ba, tb, frame_id,
        make_text(ba, "BcActive", x0+312, y0+24, 120, 18, breadcrumb_active, 13, 700, T1, tb, frame_id), page_id))
    # Right side - user
    un = uid()
    changes.append(add_obj(un, tb, frame_id,
        make_text(un, "UserName", x0+1280, y0+16, 100, 16, "Admin ECF", 12, 700, T1, tb, frame_id), page_id))
    ue = uid()
    changes.append(add_obj(ue, tb, frame_id,
        make_text(ue, "UserOrg", x0+1280, y0+34, 100, 14, "A1 Engenharia", 10, 400, T4, tb, frame_id), page_id))
    av = uid()
    changes.append(add_obj(av, tb, frame_id,
        make_rect(av, "Avatar", x0+1388, y0+12, 40, 40, "#F0F0EE", tb, frame_id, radius=20,
                  strokes=stroke_border(BORDER, 2)), page_id))
    at = uid()
    changes.append(add_obj(at, tb, frame_id,
        make_text(at, "AvatarText", x0+1396, y0+22, 24, 18, "AE", 13, 700, T3, av, frame_id), page_id))
    return changes

def build_sidebar(frame_id, page_id, parent_id, x0, y0):
    """Build sidebar (240x836). Returns list of changes."""
    changes = []
    sb = uid()
    changes.append(add_obj(sb, parent_id, frame_id,
        make_rect(sb, "Sidebar", x0, y0, 240, 836, WHITE, parent_id, frame_id,
                  strokes=stroke_border(BORDER, 1, "inner")), page_id))
    # Category: APROVAÇÃO
    ca = uid()
    changes.append(add_obj(ca, sb, frame_id,
        make_text(ca, "CatAprovacao", x0+28, y0+24, 200, 12, "APROVAÇÃO", 9, 700, T5, sb, frame_id,
                  uppercase=True, letter_spacing=1.4), page_id))
    # Item: Movimentos Controlados
    mi = uid()
    changes.append(add_obj(mi, sb, frame_id,
        make_rect(mi, "ItemMovimentos", x0+16, y0+44, 208, 38, WHITE, sb, frame_id, radius=6), page_id))
    mt = uid()
    changes.append(add_obj(mt, mi, frame_id,
        make_text(mt, "ItemMovimentosText", x0+40, y0+54, 180, 16, "Movimentos Controlados", 13, 500, T4, mi, frame_id), page_id))
    # Category: INTEGRAÇÃO
    ci = uid()
    changes.append(add_obj(ci, sb, frame_id,
        make_text(ci, "CatIntegracao", x0+28, y0+100, 200, 12, "INTEGRAÇÃO", 9, 700, T5, sb, frame_id,
                  uppercase=True, letter_spacing=1.4), page_id))
    # Item: Protheus (inactive)
    pi = uid()
    changes.append(add_obj(pi, sb, frame_id,
        make_rect(pi, "ItemProtheus", x0+16, y0+120, 208, 38, WHITE, sb, frame_id, radius=6), page_id))
    pt = uid()
    changes.append(add_obj(pt, pi, frame_id,
        make_text(pt, "ItemProtheusText", x0+40, y0+130, 180, 16, "Protheus", 13, 500, T4, pi, frame_id), page_id))
    # Item: MCP Agentes (ACTIVE)
    ai = uid()
    changes.append(add_obj(ai, sb, frame_id,
        make_rect(ai, "ItemMCPAgentes", x0+16, y0+162, 208, 38, BLUE_LT, sb, frame_id, radius=6), page_id))
    at_txt = uid()
    changes.append(add_obj(at_txt, ai, frame_id,
        make_text(at_txt, "ItemMCPAgentesText", x0+40, y0+172, 180, 16, "MCP Agentes", 13, 700, BLUE, ai, frame_id), page_id))
    # Footer
    ft = uid()
    changes.append(add_obj(ft, sb, frame_id,
        make_rect(ft, "SbFooter", x0, y0+796, 240, 40, WHITE, sb, frame_id,
                  strokes=stroke_border(BORDER, 1, "inner")), page_id))
    dot = uid()
    changes.append(add_obj(dot, ft, frame_id,
        make_rect(dot, "DotOnline", x0+16, y0+812, 8, 8, SUCCESS, ft, frame_id, radius=4), page_id))
    ftx = uid()
    changes.append(add_obj(ftx, ft, frame_id,
        make_text(ftx, "ServerOnline", x0+30, y0+808, 120, 14, "Servidor Online", 12, 400, T4, ft, frame_id), page_id))
    return changes

def build_search_bar(frame_id, page_id, parent_id, x0, y0, w=320, placeholder="Buscar por nome ou código..."):
    """Build search bar. Returns (changes, search_id)."""
    changes = []
    si = uid()
    changes.append(add_obj(si, parent_id, frame_id,
        make_rect(si, "SearchBar", x0, y0, w, 40, WHITE, parent_id, frame_id,
                  radius=8, strokes=stroke_border(BORDER)), page_id))
    st = uid()
    changes.append(add_obj(st, si, frame_id,
        make_text(st, "SearchPlaceholder", x0+38, y0+12, w-50, 16, placeholder, 13, 400, T6, si, frame_id), page_id))
    return changes, si

def build_filter_select(frame_id, page_id, parent_id, x0, y0, label="Todos os Status", w=180):
    """Build filter dropdown. Returns changes."""
    changes = []
    fi = uid()
    changes.append(add_obj(fi, parent_id, frame_id,
        make_rect(fi, f"Filter-{label}", x0, y0, w, 40, WHITE, parent_id, frame_id,
                  radius=8, strokes=stroke_border(BORDER)), page_id))
    ft = uid()
    changes.append(add_obj(ft, fi, frame_id,
        make_text(ft, f"FilterText-{label}", x0+12, y0+12, w-30, 16, label, 12, 500, T2, fi, frame_id), page_id))
    return changes

def build_badge(frame_id, page_id, parent_id, x0, y0, text, txt_color, bg_color, bd_color, w=None):
    """Build status badge. Returns changes."""
    changes = []
    bw = w or (len(text) * 7 + 16)
    bi = uid()
    changes.append(add_obj(bi, parent_id, frame_id,
        make_rect(bi, f"Badge-{text}", x0, y0, bw, 22, bg_color, parent_id, frame_id,
                  radius=4, strokes=stroke_border(bd_color)), page_id))
    bt = uid()
    changes.append(add_obj(bt, bi, frame_id,
        make_text(bt, f"BadgeText-{text}", x0+8, y0+5, bw-16, 12, text, 10, 700, txt_color, bi, frame_id,
                  uppercase=True, letter_spacing=0.3), page_id))
    return changes


# ═══════════════════════════════════════════
# PAGE 1: 60-MCP-Agents (View1, tab Agentes)
# ═══════════════════════════════════════════
print("\n=== Page 1: 60-MCP-Agents ===")
p1 = uid()
send_changes([add_page_change(p1, "60-MCP-Agents")], "add-page")

f1 = uid()
changes = [add_obj(f1, ROOT, ROOT, make_frame(f1, "60-MCP-Agents", 0, 0, 1440, 900, BG_PAGE), p1)]
send_changes(changes, "frame")

# Topbar
changes = build_topbar(f1, p1, f1, 0, 0)
send_changes(changes, "topbar")

# Sidebar
changes = build_sidebar(f1, p1, f1, 0, 64)
send_changes(changes, "sidebar")

# Content area
ct = uid()
changes = [add_obj(ct, f1, f1,
    make_rect(ct, "ContentArea", 240, 64, 1200, 836, BG_PAGE, f1, f1), p1)]

# Page header
ph_t = uid()
changes.append(add_obj(ph_t, ct, f1,
    make_text(ph_t, "PageTitle", 264, 88, 400, 28, "MCP Agentes", 24, 800, T1, ct, f1), p1))
ph_d = uid()
changes.append(add_obj(ph_d, ct, f1,
    make_text(ph_d, "PageDesc", 264, 120, 400, 16, "Gerencie agentes MCP, ações e permissões", 13, 400, T4, ct, f1), p1))

# Button "+ Criar Agente"
btn = uid()
changes.append(add_obj(btn, ct, f1,
    make_rect(btn, "BtnCriar", 1300, 88, 128, 40, BLUE, ct, f1, radius=8), p1))
btnt = uid()
changes.append(add_obj(btnt, btn, f1,
    make_text(btnt, "BtnCriarText", 1310, 100, 108, 16, "+ Criar Agente", 13, 700, WHITE, btn, f1), p1))

# Tab bar
tb_bg = uid()
changes.append(add_obj(tb_bg, ct, f1,
    make_rect(tb_bg, "TabBarLine", 264, 162, 1152, 2, BORDER, ct, f1), p1))
# Tab active: Agentes
tab1 = uid()
changes.append(add_obj(tab1, ct, f1,
    make_rect(tab1, "TabAgentes", 264, 140, 90, 24, BLUE, ct, f1, r1=6, r2=6, r3=0, r4=0), p1))
tab1t = uid()
changes.append(add_obj(tab1t, tab1, f1,
    make_text(tab1t, "TabAgentesText", 274, 144, 70, 16, "Agentes", 13, 700, WHITE, tab1, f1), p1))
# Tab inactive: Catálogo
tab2 = uid()
changes.append(add_obj(tab2, ct, f1,
    make_text(tab2, "TabCatalogo", 370, 144, 130, 16, "Catálogo de Ações", 13, 500, T4, ct, f1), p1))
# Tab inactive: Permissões
tab3 = uid()
changes.append(add_obj(tab3, ct, f1,
    make_text(tab3, "TabPermissoes", 520, 144, 100, 16, "Permissões", 13, 500, T4, ct, f1), p1))

send_changes(changes, "content-header+tabs")

# Toolbar (search + filters)
changes = []
sc, _ = build_search_bar(f1, p1, ct, 264, 180)
changes.extend(sc)
changes.extend(build_filter_select(f1, p1, ct, 600, 180, "Todos os Status"))
changes.extend(build_filter_select(f1, p1, ct, 796, 180, "Todos os Owners"))
send_changes(changes, "toolbar")

# Agents Table
changes = []
tbl = uid()
changes.append(add_obj(tbl, ct, f1,
    make_rect(tbl, "AgentsTable", 264, 236, 1152, 560, WHITE, ct, f1,
              radius=12, strokes=stroke_border(BORDER)), p1))

# Table header
thbg = uid()
changes.append(add_obj(thbg, tbl, f1,
    make_rect(thbg, "TableHeaderBg", 264, 236, 1152, 44, TABLE_HEAD, tbl, f1,
              r1=12, r2=12, r3=0, r4=0, strokes=stroke_border(BORDER_LT, 1, "inner")), p1))

cols = [("CÓDIGO", 284, 80), ("NOME", 384, 200), ("TIPO", 604, 100), ("STATUS", 724, 100),
        ("API KEY", 844, 140), ("AÇÕES", 1040, 100)]
for cname, cx, cw in cols:
    ci = uid()
    changes.append(add_obj(ci, thbg, f1,
        make_text(ci, f"TH-{cname}", cx, 250, cw, 14, cname, 10, 700, T4, thbg, f1,
                  uppercase=True, letter_spacing=0.8), p1))
send_changes(changes, "table-header")

# Table rows
rows_data = [
    ("AGENT-01", "Agente Comercial", "AUTOMATION", "ACTIVE", "sk-...a3f4", False),
    ("AGENT-02", "Agente Financeiro", "MONITORING", "ACTIVE", "sk-...b7e2", False),
    ("AGENT-03", "Agente RH", "AUTOMATION", "PENDING", "sk-...c1d5", False),
    ("AGENT-04", "Agente Logística", "REPORTING", "REVOGADO", "sk-...d9f8", True),
    ("AGENT-05", "Agente Suporte", "AUTOMATION", "ACTIVE", "sk-...e2a1", False),
    ("AGENT-06", "Agente Marketing", "MONITORING", "INACTIVE", "—", False),
]
badge_styles = {
    "ACTIVE": (GREEN_T, GREEN_BG, GREEN_BD),
    "REVOGADO": (RED_T, RED_BG, RED_BD),
    "PENDING": (PEND_T, PEND_BG, PEND_BD),
    "INACTIVE": (INACT_T, INACT_BG, INACT_BD),
}

for i, (code, name, tipo, status, apikey, revoked) in enumerate(rows_data):
    changes = []
    ry = 280 + i * 52
    row = uid()
    row_opacity = 0.5 if revoked else 1
    changes.append(add_obj(row, tbl, f1,
        make_rect(row, f"Row-{code}", 264, ry, 1152, 52, WHITE, tbl, f1,
                  opacity=row_opacity, strokes=stroke_border(BORDER_LT, 1, "inner")), p1))
    # Code
    rc = uid()
    changes.append(add_obj(rc, row, f1,
        make_text(rc, f"Code-{code}", 284, ry+18, 80, 16, code, 13, 600, T2, row, f1), p1))
    # Name
    rn = uid()
    changes.append(add_obj(rn, row, f1,
        make_text(rn, f"Name-{name}", 384, ry+18, 200, 16, name, 13, 500, T1, row, f1), p1))
    # Tipo badge
    changes.extend(build_badge(f1, p1, row, 604, ry+16, tipo, EVENT_T, EVENT_BG, EVENT_BD))
    # Status badge
    bt, bg, bd = badge_styles.get(status, (INACT_T, INACT_BG, INACT_BD))
    changes.extend(build_badge(f1, p1, row, 724, ry+16, status, bt, bg, bd))
    # API Key
    rk = uid()
    changes.append(add_obj(rk, row, f1,
        make_text(rk, f"ApiKey-{code}", 844, ry+20, 140, 14, apikey, 12, 400, T4, row, f1,
                  font_family="Courier New", font_id="couriernew"), p1))
    # Action icons placeholder
    act = uid()
    changes.append(add_obj(act, row, f1,
        make_rect(act, f"Actions-{code}", 1040, ry+18, 16, 16, T4, row, f1, opacity=0.3, radius=2), p1))
    act2 = uid()
    changes.append(add_obj(act2, row, f1,
        make_rect(act2, f"Actions2-{code}", 1064, ry+18, 16, 16, T4, row, f1, opacity=0.3, radius=2), p1))
    act3 = uid()
    changes.append(add_obj(act3, row, f1,
        make_rect(act3, f"Actions3-{code}", 1088, ry+18, 16, 16, T4, row, f1, opacity=0.3, radius=2), p1))
    send_changes(changes, f"row-{code}")

# Table footer
changes = []
tf_line = uid()
changes.append(add_obj(tf_line, tbl, f1,
    make_rect(tf_line, "TableFooter", 264, 592, 1152, 52, WHITE, tbl, f1,
              r1=0, r2=0, r3=12, r4=12), p1))
tf_link = uid()
changes.append(add_obj(tf_link, tf_line, f1,
    make_text(tf_link, "LoadMore", 780, 608, 120, 16, "Carregar mais", 13, 600, BLUE, tf_line, f1), p1))
send_changes(changes, "table-footer")


# ═══════════════════════════════════════════
# PAGE 2: 60-MCP-Catalogo (View1, tab Catálogo)
# ═══════════════════════════════════════════
print("\n=== Page 2: 60-MCP-Catalogo ===")
p2 = uid()
send_changes([add_page_change(p2, "60-MCP-Catalogo")], "add-page")

f2 = uid()
changes = [add_obj(f2, ROOT, ROOT, make_frame(f2, "60-MCP-Catalogo", 0, 0, 1440, 900, BG_PAGE), p2)]
send_changes(changes, "frame")
changes = build_topbar(f2, p2, f2, 0, 0)
send_changes(changes, "topbar")
changes = build_sidebar(f2, p2, f2, 0, 64)
send_changes(changes, "sidebar")

# Content
ct2 = uid()
changes = [add_obj(ct2, f2, f2,
    make_rect(ct2, "ContentArea", 240, 64, 1200, 836, BG_PAGE, f2, f2), p2)]
# Header
ph2t = uid()
changes.append(add_obj(ph2t, ct2, f2,
    make_text(ph2t, "PageTitle", 264, 88, 400, 28, "MCP Agentes", 24, 800, T1, ct2, f2), p2))
ph2d = uid()
changes.append(add_obj(ph2d, ct2, f2,
    make_text(ph2d, "PageDesc", 264, 120, 400, 16, "Gerencie agentes MCP, ações e permissões", 13, 400, T4, ct2, f2), p2))
# Tab bar
tb2_bg = uid()
changes.append(add_obj(tb2_bg, ct2, f2,
    make_rect(tb2_bg, "TabBarLine", 264, 162, 1152, 2, BORDER, ct2, f2), p2))
tab2_1 = uid()
changes.append(add_obj(tab2_1, ct2, f2,
    make_text(tab2_1, "TabAgentes", 274, 144, 70, 16, "Agentes", 13, 500, T4, ct2, f2), p2))
tab2_2 = uid()
changes.append(add_obj(tab2_2, ct2, f2,
    make_rect(tab2_2, "TabCatalogo", 360, 140, 148, 24, BLUE, ct2, f2, r1=6, r2=6, r3=0, r4=0), p2))
tab2_2t = uid()
changes.append(add_obj(tab2_2t, tab2_2, f2,
    make_text(tab2_2t, "TabCatalogoText", 370, 144, 128, 16, "Catálogo de Ações", 13, 700, WHITE, tab2_2, f2), p2))
tab2_3 = uid()
changes.append(add_obj(tab2_3, ct2, f2,
    make_text(tab2_3, "TabPermissoes", 524, 144, 100, 16, "Permissões", 13, 500, T4, ct2, f2), p2))
send_changes(changes, "content-header+tabs")

# Toolbar
changes = []
sc2, _ = build_search_bar(f2, p2, ct2, 264, 180, placeholder="Buscar ação...")
changes.extend(sc2)
changes.extend(build_filter_select(f2, p2, ct2, 600, 180, "Todos os Tipos"))
changes.extend(build_filter_select(f2, p2, ct2, 796, 180, "Todas as Políticas"))
# Button "+ Nova Ação"
btn2 = uid()
changes.append(add_obj(btn2, ct2, f2,
    make_rect(btn2, "BtnNovaAcao", 1316, 180, 100, 36, WHITE, ct2, f2,
              radius=8, strokes=stroke_border(BLUE)), p2))
btn2t = uid()
changes.append(add_obj(btn2t, btn2, f2,
    make_text(btn2t, "BtnNovaAcaoText", 1326, 190, 80, 16, "+ Nova Ação", 13, 600, BLUE, btn2, f2), p2))
send_changes(changes, "toolbar")

# Action cards (3-column grid)
actions_data = [
    ("process:case:create", "Criar Processo", "Cria um novo processo no sistema", "DIRECT", ["process:case:write"]),
    ("process:case:read", "Consultar Processo", "Lê dados de um processo existente", "DIRECT", ["process:case:read"]),
    ("org:unit:list", "Listar Unidades", "Lista unidades organizacionais", "DIRECT", ["org:unit:read"]),
    ("movement:approve", "Aprovar Movimento", "Aprova um movimento controlado", "CONTROLLED", ["movement:approve"]),
    ("report:generate", "Gerar Relatório", "Gera relatório consolidado", "EVENT_ONLY", ["report:write"]),
    ("notification:send", "Enviar Notificação", "Envia notificação por e-mail", "DIRECT", ["notification:send"]),
]
policy_styles = {
    "DIRECT": (GREEN_T, GREEN_BG, GREEN_BD),
    "CONTROLLED": (PEND_T, PEND_BG, PEND_BD),
    "EVENT_ONLY": (EVENT_T, EVENT_BG, EVENT_BD),
}

for i, (acode, aname, adesc, apolicy, ascopes) in enumerate(actions_data):
    changes = []
    col = i % 3
    row_idx = i // 3
    cx = 264 + col * 388
    cy = 236 + row_idx * 200
    card = uid()
    changes.append(add_obj(card, ct2, f2,
        make_rect(card, f"ActionCard-{acode}", cx, cy, 372, 180, WHITE, ct2, f2,
                  radius=12, strokes=stroke_border(BORDER)), p2))
    # Code
    ac = uid()
    changes.append(add_obj(ac, card, f2,
        make_text(ac, f"ACode-{acode}", cx+20, cy+20, 200, 14, acode, 11, 600, T2, card, f2,
                  font_family="Courier New", font_id="couriernew"), p2))
    # Policy badge
    pt, pbg, pbd = policy_styles.get(apolicy, (EVENT_T, EVENT_BG, EVENT_BD))
    changes.extend(build_badge(f2, p2, card, cx+260, cy+18, apolicy, pt, pbg, pbd))
    # Name
    an = uid()
    changes.append(add_obj(an, card, f2,
        make_text(an, f"AName-{aname}", cx+20, cy+48, 332, 20, aname, 16, 600, T1, card, f2), p2))
    # Desc
    ad = uid()
    changes.append(add_obj(ad, card, f2,
        make_text(ad, f"ADesc-{aname}", cx+20, cy+72, 332, 16, adesc, 12, 400, T4, card, f2), p2))
    # Scope chips
    for j, scope in enumerate(ascopes):
        sc_x = cx + 20 + j * 140
        chip = uid()
        changes.append(add_obj(chip, card, f2,
            make_rect(chip, f"ScopeChip-{scope}", sc_x, cy+100, 130, 20, BG_PAGE, card, f2, radius=4), p2))
        sct = uid()
        changes.append(add_obj(sct, chip, f2,
            make_text(sct, f"ScopeText-{scope}", sc_x+8, cy+104, 114, 12, scope, 10, 500, T3, chip, f2), p2))
    send_changes(changes, f"action-card-{acode}")


# ═══════════════════════════════════════════
# PAGE 3: 60-MCP-Permissoes (View1, tab Permissões)
# ═══════════════════════════════════════════
print("\n=== Page 3: 60-MCP-Permissoes ===")
p3 = uid()
send_changes([add_page_change(p3, "60-MCP-Permissoes")], "add-page")

f3 = uid()
changes = [add_obj(f3, ROOT, ROOT, make_frame(f3, "60-MCP-Permissoes", 0, 0, 1440, 900, BG_PAGE), p3)]
send_changes(changes, "frame")
changes = build_topbar(f3, p3, f3, 0, 0)
send_changes(changes, "topbar")
changes = build_sidebar(f3, p3, f3, 0, 64)
send_changes(changes, "sidebar")

# Content
ct3 = uid()
changes = [add_obj(ct3, f3, f3,
    make_rect(ct3, "ContentArea", 240, 64, 1200, 836, BG_PAGE, f3, f3), p3)]
ph3t = uid()
changes.append(add_obj(ph3t, ct3, f3,
    make_text(ph3t, "PageTitle", 264, 88, 400, 28, "MCP Agentes", 24, 800, T1, ct3, f3), p3))
ph3d = uid()
changes.append(add_obj(ph3d, ct3, f3,
    make_text(ph3d, "PageDesc", 264, 120, 400, 16, "Gerencie agentes MCP, ações e permissões", 13, 400, T4, ct3, f3), p3))
# Tab bar
tb3_bg = uid()
changes.append(add_obj(tb3_bg, ct3, f3,
    make_rect(tb3_bg, "TabBarLine", 264, 162, 1152, 2, BORDER, ct3, f3), p3))
tab3_1 = uid()
changes.append(add_obj(tab3_1, ct3, f3,
    make_text(tab3_1, "TabAgentes", 274, 144, 70, 16, "Agentes", 13, 500, T4, ct3, f3), p3))
tab3_2 = uid()
changes.append(add_obj(tab3_2, ct3, f3,
    make_text(tab3_2, "TabCatalogo", 370, 144, 130, 16, "Catálogo de Ações", 13, 500, T4, ct3, f3), p3))
tab3_3 = uid()
changes.append(add_obj(tab3_3, ct3, f3,
    make_rect(tab3_3, "TabPermissoes", 516, 140, 104, 24, BLUE, ct3, f3, r1=6, r2=6, r3=0, r4=0), p3))
tab3_3t = uid()
changes.append(add_obj(tab3_3t, tab3_3, f3,
    make_text(tab3_3t, "TabPermissoesText", 526, 144, 84, 16, "Permissões", 13, 700, WHITE, tab3_3, f3), p3))
send_changes(changes, "content-header+tabs")

# Permissions Matrix
changes = []
mx = uid()
changes.append(add_obj(mx, ct3, f3,
    make_rect(mx, "PermissionsMatrix", 264, 180, 1152, 520, WHITE, ct3, f3,
              radius=12, strokes=stroke_border(BORDER)), p3))

# Matrix header
mhbg = uid()
changes.append(add_obj(mhbg, mx, f3,
    make_rect(mhbg, "MatrixHeaderBg", 264, 180, 1152, 80, RO_BG, mx, f3,
              r1=12, r2=12, r3=0, r4=0), p3))

# Empty corner cell
ec = uid()
changes.append(add_obj(ec, mhbg, f3,
    make_rect(ec, "MatrixCorner", 264, 180, 200, 80, RO_BG, mhbg, f3), p3))

# Action headers (rotated text placeholder — shown as vertical text)
action_headers = ["case:create", "case:read", "case:update", "unit:list", "unit:delete", "approve", "report", "notify"]
for j, ah in enumerate(action_headers):
    ax = 474 + j * 70
    aht = uid()
    changes.append(add_obj(aht, mhbg, f3,
        make_text(aht, f"MH-{ah}", ax, 200, 60, 50, ah, 10, 600, T4, mhbg, f3), p3))
send_changes(changes, "matrix-header")

# Matrix rows
agents_mx = [
    ("AGENT-01 — Agente Comercial", [1,1,1,1,0,0,0,1]),
    ("AGENT-02 — Agente Financeiro", [0,1,0,1,0,1,1,0]),
    ("AGENT-03 — Agente RH", [1,1,1,0,0,0,0,0]),
    ("AGENT-04 — Agente Logística", [0,0,0,1,0,0,1,0]),  # revoked
    ("AGENT-05 — Agente Suporte", [1,1,0,1,0,0,0,1]),
]
for i, (agent_label, perms) in enumerate(agents_mx):
    changes = []
    my = 260 + i * 44
    is_revoked = i == 3
    mrow = uid()
    changes.append(add_obj(mrow, mx, f3,
        make_rect(mrow, f"MRow-{i}", 264, my, 1152, 44, WHITE, mx, f3,
                  opacity=0.4 if is_revoked else 1, strokes=stroke_border(BORDER_LT, 1, "inner")), p3))
    # Agent label
    ml = uid()
    changes.append(add_obj(ml, mrow, f3,
        make_text(ml, f"MLabel-{i}", 276, my+14, 188, 16, agent_label, 12, 600, T2, mrow, f3), p3))
    # Checkboxes
    for j, perm in enumerate(perms):
        cbx = 484 + j * 70
        cb = uid()
        if perm:
            changes.append(add_obj(cb, mrow, f3,
                make_rect(cb, f"CB-{i}-{j}", cbx, my+14, 16, 16, BLUE, mrow, f3,
                          radius=4), p3))
        else:
            changes.append(add_obj(cb, mrow, f3,
                make_rect(cb, f"CB-{i}-{j}", cbx, my+14, 16, 16, WHITE, mrow, f3,
                          radius=4, strokes=stroke_border(BORDER)), p3))
    send_changes(changes, f"matrix-row-{i}")


# ═══════════════════════════════════════════
# PAGE 4: 60-MCP-Monitor (View2)
# ═══════════════════════════════════════════
print("\n=== Page 4: 60-MCP-Monitor ===")
p4 = uid()
send_changes([add_page_change(p4, "60-MCP-Monitor")], "add-page")

f4 = uid()
changes = [add_obj(f4, ROOT, ROOT, make_frame(f4, "60-MCP-Monitor", 0, 0, 1440, 900, BG_PAGE), p4)]
send_changes(changes, "frame")
changes = build_topbar(f4, p4, f4, 0, 0, breadcrumb_active="Monitor MCP")
send_changes(changes, "topbar")
changes = build_sidebar(f4, p4, f4, 0, 64)
send_changes(changes, "sidebar")

# Content
ct4 = uid()
changes = [add_obj(ct4, f4, f4,
    make_rect(ct4, "ContentArea", 240, 64, 1200, 836, BG_PAGE, f4, f4), p4)]
ph4t = uid()
changes.append(add_obj(ph4t, ct4, f4,
    make_text(ph4t, "PageTitle", 264, 88, 500, 28, "Monitor de Execuções MCP", 24, 800, T1, ct4, f4), p4))
ph4d = uid()
changes.append(add_obj(ph4d, ct4, f4,
    make_text(ph4d, "PageDesc", 264, 120, 500, 16, "Acompanhe em tempo real as execuções dos agentes", 13, 400, T4, ct4, f4), p4))
send_changes(changes, "content-header")

# Metric Cards
metric_data = [
    ("TOTAL (24H)", "1.247", T1, None, None),
    ("TAXA DE SUCESSO", "94.2%", AMBER, 0.942, AMBER),
    ("PENDENTES", "12", AMBER, None, None),
    ("BLOQUEADOS", "3", ERR, None, None),
]
changes = []
for i, (label, value, color, bar_pct, bar_color) in enumerate(metric_data):
    mx = 264 + i * 288
    mc = uid()
    changes.append(add_obj(mc, ct4, f4,
        make_rect(mc, f"MetricCard-{label}", mx, 150, 272, 100, WHITE, ct4, f4,
                  radius=12, strokes=stroke_border(BORDER)), p4))
    ml = uid()
    changes.append(add_obj(ml, mc, f4,
        make_text(ml, f"MetricLabel-{label}", mx+20, 170, 232, 12, label, 11, 600, T4, mc, f4,
                  uppercase=True, letter_spacing=0.5), p4))
    mv = uid()
    changes.append(add_obj(mv, mc, f4,
        make_text(mv, f"MetricValue-{label}", mx+20, 192, 232, 32, value, 28, 800, color, mc, f4), p4))
    if bar_pct is not None:
        # Progress bar background
        bb = uid()
        changes.append(add_obj(bb, mc, f4,
            make_rect(bb, f"BarBg-{label}", mx+20, 232, 232, 4, BORDER_LT, mc, f4, radius=2), p4))
        # Progress bar fill
        bf = uid()
        changes.append(add_obj(bf, mc, f4,
            make_rect(bf, f"BarFill-{label}", mx+20, 232, int(232 * bar_pct), 4, bar_color, mc, f4, radius=2), p4))

# Escalation badge on Bloqueados card
eb = uid()
changes.append(add_obj(eb, ct4, f4,
    make_rect(eb, "EscalationBadge", 264 + 3*288 + 100, 196, 82, 20, ERR, ct4, f4, radius=10), p4))
ebt = uid()
changes.append(add_obj(ebt, eb, f4,
    make_text(ebt, "EscBadgeText", 264 + 3*288 + 108, 200, 66, 12, "2 Escaladas", 10, 700, WHITE, eb, f4), p4))
send_changes(changes, "metric-cards")

# Filter bar
changes = []
sc4, _ = build_search_bar(f4, p4, ct4, 264, 266, w=280, placeholder="Buscar por correlation ID...")
changes.extend(sc4)
changes.extend(build_filter_select(f4, p4, ct4, 560, 266, "Agente", w=160))
changes.extend(build_filter_select(f4, p4, ct4, 736, 266, "Ação", w=160))
changes.extend(build_filter_select(f4, p4, ct4, 912, 266, "Status", w=160))
# Date inputs
di1 = uid()
changes.append(add_obj(di1, ct4, f4,
    make_rect(di1, "DateFrom", 1088, 266, 140, 40, WHITE, ct4, f4, radius=8, strokes=stroke_border(BORDER)), p4))
di1t = uid()
changes.append(add_obj(di1t, di1, f4,
    make_text(di1t, "DateFromText", 1100, 278, 116, 16, "31/03/2026", 12, 500, T2, di1, f4), p4))
di2 = uid()
changes.append(add_obj(di2, ct4, f4,
    make_rect(di2, "DateTo", 1236, 266, 140, 40, WHITE, ct4, f4, radius=8, strokes=stroke_border(BORDER)), p4))
di2t = uid()
changes.append(add_obj(di2t, di2, f4,
    make_text(di2t, "DateToText", 1248, 278, 116, 16, "31/03/2026", 12, 500, T2, di2, f4), p4))
send_changes(changes, "filter-bar")

# Split View: Executions Table (60%) + Detail Panel (40%)
changes = []
# Executions Table
etbl = uid()
changes.append(add_obj(etbl, ct4, f4,
    make_rect(etbl, "ExecutionsTable", 264, 322, 691, 520, WHITE, ct4, f4,
              r1=12, r2=0, r3=0, r4=12, strokes=stroke_border(BORDER)), p4))

# Table header
ethbg = uid()
changes.append(add_obj(ethbg, etbl, f4,
    make_rect(ethbg, "ExecTableHeader", 264, 322, 691, 44, TABLE_HEAD, etbl, f4,
              r1=12, r2=0, r3=0, r4=0, strokes=stroke_border(BORDER_LT, 1, "inner")), p4))
ecols = [("AGENTE", 284, 100), ("AÇÃO", 394, 130), ("STATUS", 534, 80),
         ("INÍCIO", 624, 120), ("DURAÇÃO", 754, 60), ("RESULTADO", 824, 120)]
for cname, cx, cw in ecols:
    ci = uid()
    changes.append(add_obj(ci, ethbg, f4,
        make_text(ci, f"ETH-{cname}", cx, 336, cw, 14, cname, 10, 700, T4, ethbg, f4,
                  uppercase=True, letter_spacing=0.8), p4))
send_changes(changes, "exec-table-header")

# Execution rows
exec_rows = [
    ("AGENT-01", "process:case:create", "SUCESSO", "31/03 14:32:01", "245ms", "Processo criado: PROC-0042", False),
    ("AGENT-02", "org:unit:list", "SUCESSO", "31/03 14:30:15", "89ms", "12 unidades retornadas", False),
    ("AGENT-03", "org:unit:delete", "BLOQUEADO", "31/03 14:28:55", "12ms", "Escopo bloqueado", True),
    ("AGENT-01", "movement:approve", "PENDENTE", "31/03 14:25:30", "—", "Aguardando aprovação", False),
    ("AGENT-05", "report:generate", "SUCESSO", "31/03 14:20:00", "1.2s", "Relatório PDF gerado", False),
    ("AGENT-02", "notification:send", "FALHOU", "31/03 14:18:45", "3.4s", "Timeout SMTP", False),
]
exec_badge = {
    "SUCESSO": (GREEN_T, GREEN_BG, GREEN_BD),
    "BLOQUEADO": (RED_T, RED_BG, RED_BD),
    "PENDENTE": (PEND_T, PEND_BG, PEND_BD),
    "FALHOU": (ERR, RED_BG, RED_BD),
}

for i, (agent, action, status, time, dur, result, escalation) in enumerate(exec_rows):
    changes = []
    ry = 366 + i * 52
    row = uid()
    row_strokes = stroke_border(BORDER_LT, 1, "inner")
    if escalation:
        row_strokes = stroke_border(ERR, 3, "inner")
    changes.append(add_obj(row, etbl, f4,
        make_rect(row, f"ExecRow-{i}", 264, ry, 691, 52, WHITE, etbl, f4,
                  strokes=row_strokes), p4))
    # Agent
    ra = uid()
    changes.append(add_obj(ra, row, f4,
        make_text(ra, f"ExAgent-{i}", 284, ry+18, 100, 16, agent, 13, 600, T2, row, f4), p4))
    # Action
    rac = uid()
    changes.append(add_obj(rac, row, f4,
        make_text(rac, f"ExAction-{i}", 394, ry+18, 130, 16, action, 13, 500, T1, row, f4,
                  font_family="Courier New", font_id="couriernew"), p4))
    # Status badge
    bt, bg, bd = exec_badge.get(status, (INACT_T, INACT_BG, INACT_BD))
    changes.extend(build_badge(f4, p4, row, 534, ry+16, status, bt, bg, bd))
    # Escalation badge
    if escalation:
        changes.extend(build_badge(f4, p4, row, 534, ry+36, "Escalada", WHITE, ERR, DANGER, w=66))
    # Time
    rt = uid()
    changes.append(add_obj(rt, row, f4,
        make_text(rt, f"ExTime-{i}", 624, ry+20, 120, 14, time, 12, 400, T4, row, f4), p4))
    # Duration
    rd = uid()
    changes.append(add_obj(rd, row, f4,
        make_text(rd, f"ExDur-{i}", 754, ry+20, 60, 14, dur, 12, 400, T4, row, f4), p4))
    # Result
    rr = uid()
    r_color = ERR if status in ("BLOQUEADO", "FALHOU") else T4
    changes.append(add_obj(rr, row, f4,
        make_text(rr, f"ExResult-{i}", 824, ry+20, 120, 14, result, 12, 400, r_color, row, f4), p4))
    send_changes(changes, f"exec-row-{i}")

# Detail Panel
changes = []
dp = uid()
changes.append(add_obj(dp, ct4, f4,
    make_rect(dp, "DetailPanel", 955, 322, 461, 520, WHITE, ct4, f4,
              r1=0, r2=12, r3=12, r4=0, strokes=stroke_border(BORDER)), p4))

# Detail header
dph = uid()
changes.append(add_obj(dph, dp, f4,
    make_rect(dph, "DetailHeader", 955, 322, 461, 56, WHITE, dp, f4,
              r1=0, r2=12, r3=0, r4=0, strokes=stroke_border(BORDER, 1, "inner")), p4))
dpht = uid()
changes.append(add_obj(dpht, dph, f4,
    make_text(dpht, "DetailTitle", 975, 340, 200, 20, "Detalhe da Execução", 16, 700, T1, dph, f4), p4))
# Close btn placeholder
dpc = uid()
changes.append(add_obj(dpc, dph, f4,
    make_rect(dpc, "BtnFechar", 1388, 341, 18, 18, T4, dph, f4, opacity=0.3, radius=2), p4))

# Escalation alert
alert = uid()
changes.append(add_obj(alert, dp, f4,
    make_rect(alert, "EscalationAlert", 975, 394, 421, 56, RED_BG, dp, f4,
              radius=8, strokes=stroke_border(RED_BD)), p4))
alt_t = uid()
changes.append(add_obj(alt_t, alert, f4,
    make_text(alt_t, "AlertTitle", 991, 402, 389, 14, "TENTATIVA DE ESCALADA DE PRIVILÉGIO", 11, 700, DANGER, alert, f4,
              uppercase=True), p4))
alt_d = uid()
changes.append(add_obj(alt_d, alert, f4,
    make_text(alt_d, "AlertDesc", 991, 420, 389, 14, "Escopo tentado: org:unit:delete", 12, 400, DANGER, alert, f4), p4))

# Status badge (large)
changes.extend(build_badge(f4, p4, dp, 975, 466, "BLOQUEADO", RED_T, RED_BG, RED_BD, w=120))
send_changes(changes, "detail-panel-header")

# Detail sections
changes = []
sections = [
    ("AGENTE", 500, [("Código", "AGENT-03"), ("Nome", "Agente RH"), ("Owner", "carlos.rh@a1.com.br")]),
    ("AÇÃO", 610, [("Código", "org:unit:delete"), ("Política", "CONTROLLED"), ("Tipo", "write")]),
    ("EXECUÇÃO", 720, [("Correlation ID", "corr-7f8a9b..."), ("Início", "31/03/2026 14:28:55"), ("Duração", "12ms")]),
]
for sec_title, sy, fields in sections:
    st = uid()
    changes.append(add_obj(st, dp, f4,
        make_text(st, f"Sec-{sec_title}", 975, sy, 421, 12, sec_title, 10, 700, T4, dp, f4,
                  uppercase=True, letter_spacing=0.8), p4))
    for j, (flabel, fvalue) in enumerate(fields):
        fy = sy + 20 + j * 28
        fl = uid()
        changes.append(add_obj(fl, dp, f4,
            make_text(fl, f"FLabel-{flabel}", 975, fy, 120, 14, flabel, 11, 500, T4, dp, f4), p4))
        fv = uid()
        changes.append(add_obj(fv, dp, f4,
            make_text(fv, f"FValue-{fvalue}", 1120, fy, 256, 14, fvalue, 13, 500, T2, dp, f4), p4))
send_changes(changes, "detail-sections")


# ═══════════════════════════════════════════
# PAGE 5: 60-MCP-Drawer (Create Agent)
# ═══════════════════════════════════════════
print("\n=== Page 5: 60-MCP-Drawer ===")
p5 = uid()
send_changes([add_page_change(p5, "60-MCP-Drawer")], "add-page")

f5 = uid()
changes = [add_obj(f5, ROOT, ROOT, make_frame(f5, "60-MCP-Drawer", 0, 0, 1440, 900, BG_PAGE), p5)]
send_changes(changes, "frame")
changes = build_topbar(f5, p5, f5, 0, 0)
send_changes(changes, "topbar")
changes = build_sidebar(f5, p5, f5, 0, 64)
send_changes(changes, "sidebar")

# Background content (dimmed)
changes = []
ct5 = uid()
changes.append(add_obj(ct5, f5, f5,
    make_rect(ct5, "ContentArea", 240, 64, 1200, 836, BG_PAGE, f5, f5, opacity=0.5), p5))

# Drawer overlay
ovl = uid()
changes.append(add_obj(ovl, f5, f5,
    make_rect(ovl, "DrawerOverlay", 0, 0, 1440, 900, "#000000", f5, f5, opacity=0.3), p5))

# Drawer panel
dr = uid()
changes.append(add_obj(dr, f5, f5,
    make_rect(dr, "DrawerPanel", 960, 0, 480, 900, WHITE, f5, f5), p5))

# Drawer header
drh = uid()
changes.append(add_obj(drh, dr, f5,
    make_rect(drh, "DrawerHeader", 960, 0, 480, 64, WHITE, dr, f5,
              strokes=stroke_border(BORDER, 1, "inner")), p5))
drht = uid()
changes.append(add_obj(drht, drh, f5,
    make_text(drht, "DrawerTitle", 984, 22, 300, 22, "Criar Agente", 18, 700, T1, drh, f5), p5))
# Close button
drc = uid()
changes.append(add_obj(drc, drh, f5,
    make_rect(drc, "DrawerClose", 1412, 22, 20, 20, T4, drh, f5, opacity=0.3, radius=2), p5))
send_changes(changes, "drawer-header")

# Drawer body - form fields
changes = []
fields = [
    ("CÓDIGO", 88, "AGENT-07", False),
    ("NOME", 164, "Agente de Exemplo", False),
    ("OWNER", 240, "Buscar usuário...", True),
    ("ESCOPOS PERMITIDOS", 316, "", False),
]
for flabel, fy, fplaceholder, is_placeholder in fields:
    # Label
    fl = uid()
    changes.append(add_obj(fl, dr, f5,
        make_text(fl, f"Label-{flabel}", 984, fy, 432, 12, flabel, 10, 700, T4, dr, f5,
                  uppercase=True, letter_spacing=0.8), p5))
    # Input
    fi = uid()
    changes.append(add_obj(fi, dr, f5,
        make_rect(fi, f"Input-{flabel}", 984, fy+18, 432, 42, WHITE, dr, f5,
                  radius=8, strokes=stroke_border(BORDER)), p5))
    if fplaceholder:
        ft = uid()
        changes.append(add_obj(ft, fi, f5,
            make_text(ft, f"InputText-{flabel}", 998, fy+30, 404, 18,
                      fplaceholder, 14, 400 if is_placeholder else 500,
                      T6 if is_placeholder else T1, fi, f5), p5))

# Scope chips area
chips_bg = uid()
changes.append(add_obj(chips_bg, dr, f5,
    make_rect(chips_bg, "ScopesArea", 984, 334, 432, 60, WHITE, dr, f5,
              radius=8, strokes=stroke_border(BORDER)), p5))
# Example chips
chip1 = uid()
changes.append(add_obj(chip1, chips_bg, f5,
    make_rect(chip1, "Chip1", 992, 342, 140, 24, BLUE_LT, chips_bg, f5, radius=4), p5))
chip1t = uid()
changes.append(add_obj(chip1t, chip1, f5,
    make_text(chip1t, "Chip1Text", 1000, 348, 116, 14, "process:case:read", 11, 500, BLUE, chip1, f5), p5))
chip2 = uid()
changes.append(add_obj(chip2, chips_bg, f5,
    make_rect(chip2, "Chip2", 1140, 342, 140, 24, BLUE_LT, chips_bg, f5, radius=4), p5))
chip2t = uid()
changes.append(add_obj(chip2t, chip2, f5,
    make_text(chip2t, "Chip2Text", 1148, 348, 116, 14, "process:case:write", 11, 500, BLUE, chip2, f5), p5))
send_changes(changes, "drawer-fields")

# Drawer footer
changes = []
drf = uid()
changes.append(add_obj(drf, dr, f5,
    make_rect(drf, "DrawerFooter", 960, 828, 480, 72, WHITE, dr, f5,
              strokes=stroke_border(BORDER, 1, "inner")), p5))
# Cancel button
bc = uid()
changes.append(add_obj(bc, drf, f5,
    make_rect(bc, "BtnCancelar", 1268, 844, 80, 40, WHITE, drf, f5,
              radius=8, strokes=stroke_border(BORDER)), p5))
bct = uid()
changes.append(add_obj(bct, bc, f5,
    make_text(bct, "BtnCancelarText", 1278, 856, 60, 16, "Cancelar", 13, 600, T3, bc, f5), p5))
# Save button
bs = uid()
changes.append(add_obj(bs, drf, f5,
    make_rect(bs, "BtnSalvar", 1360, 844, 72, 40, BLUE, drf, f5, radius=8), p5))
bst = uid()
changes.append(add_obj(bst, bs, f5,
    make_text(bst, "BtnSalvarText", 1374, 856, 44, 16, "Salvar", 13, 700, WHITE, bs, f5), p5))
send_changes(changes, "drawer-footer")


# ═══════════════════════════════════════════
# PAGE 6: 60-MCP-Modal-ApiKey
# ═══════════════════════════════════════════
print("\n=== Page 6: 60-MCP-Modal-ApiKey ===")
p6 = uid()
send_changes([add_page_change(p6, "60-MCP-Modal-ApiKey")], "add-page")

f6 = uid()
changes = [add_obj(f6, ROOT, ROOT, make_frame(f6, "60-MCP-Modal-ApiKey", 0, 0, 1440, 900, BG_PAGE), p6)]
send_changes(changes, "frame")

# Overlay
changes = []
ovl6 = uid()
changes.append(add_obj(ovl6, f6, f6,
    make_rect(ovl6, "ModalOverlay", 0, 0, 1440, 900, "#000000", f6, f6, opacity=0.3), p6))

# Modal card
mc6 = uid()
changes.append(add_obj(mc6, f6, f6,
    make_rect(mc6, "ModalCard", 460, 220, 520, 440, WHITE, f6, f6, radius=12), p6))

# Icon placeholder (key icon)
ki = uid()
changes.append(add_obj(ki, mc6, f6,
    make_rect(ki, "IconKey", 696, 244, 48, 48, PEND_BG, mc6, f6, radius=24), p6))

# Title
mt6 = uid()
changes.append(add_obj(mt6, mc6, f6,
    make_text(mt6, "ModalTitle", 560, 304, 320, 22, "Chave de API Gerada", 18, 700, T1, mc6, f6), p6))

# Warning
mw = uid()
changes.append(add_obj(mw, mc6, f6,
    make_text(mw, "ModalWarning", 500, 334, 440, 16, "Esta chave será exibida apenas uma vez. Copie-a agora.", 13, 600, ERR, mc6, f6), p6))

# API Key field
akf = uid()
changes.append(add_obj(akf, mc6, f6,
    make_rect(akf, "ApiKeyField", 484, 366, 472, 48, RO_BG, mc6, f6,
              radius=8, strokes=stroke_border(BORDER)), p6))
akt = uid()
changes.append(add_obj(akt, akf, f6,
    make_text(akt, "ApiKeyText", 498, 380, 340, 18, "sk-mcp-a1b2c3d4e5f6...****", 14, 500, T1, akf, f6,
              font_family="Courier New", font_id="couriernew"), p6))
# Copy button
cpb = uid()
changes.append(add_obj(cpb, akf, f6,
    make_rect(cpb, "BtnCopiar", 892, 374, 52, 30, WHITE, akf, f6,
              radius=6, strokes=stroke_border(BLUE)), p6))
cpt = uid()
changes.append(add_obj(cpt, cpb, f6,
    make_text(cpt, "BtnCopiarText", 900, 382, 36, 14, "Copiar", 12, 700, BLUE, cpb, f6), p6))

# Checkbox row
cbr = uid()
changes.append(add_obj(cbr, mc6, f6,
    make_rect(cbr, "Checkbox", 484, 430, 16, 16, WHITE, mc6, f6,
              radius=4, strokes=stroke_border(BORDER)), p6))
cbt = uid()
changes.append(add_obj(cbt, mc6, f6,
    make_text(cbt, "CheckboxLabel", 508, 430, 400, 16, "Copiei e armazenei a chave com segurança", 13, 500, T2, mc6, f6), p6))

# Close button (disabled state)
clb = uid()
changes.append(add_obj(clb, mc6, f6,
    make_rect(clb, "BtnFechar", 484, 470, 472, 40, BORDER, mc6, f6, radius=8), p6))
clt = uid()
changes.append(add_obj(clt, clb, f6,
    make_text(clt, "BtnFecharText", 680, 482, 80, 16, "Fechar", 13, 700, T6, clb, f6), p6))
send_changes(changes, "modal-api-key")


# ═══════════════════════════════════════════
# PAGE 7: 60-MCP-Modal-Revogar
# ═══════════════════════════════════════════
print("\n=== Page 7: 60-MCP-Modal-Revogar ===")
p7 = uid()
send_changes([add_page_change(p7, "60-MCP-Modal-Revogar")], "add-page")

f7 = uid()
changes = [add_obj(f7, ROOT, ROOT, make_frame(f7, "60-MCP-Modal-Revogar", 0, 0, 1440, 900, BG_PAGE), p7)]
send_changes(changes, "frame")

# Overlay
changes = []
ovl7 = uid()
changes.append(add_obj(ovl7, f7, f7,
    make_rect(ovl7, "ModalOverlay", 0, 0, 1440, 900, "#000000", f7, f7, opacity=0.3), p7))

# Modal card
mc7 = uid()
changes.append(add_obj(mc7, f7, f7,
    make_rect(mc7, "ModalCard", 480, 220, 480, 420, WHITE, f7, f7, radius=12), p7))

# Warning icon
wi = uid()
changes.append(add_obj(wi, mc7, f7,
    make_rect(wi, "IconWarning", 696, 244, 48, 48, RED_BG, mc7, f7, radius=24), p7))

# Title
mt7 = uid()
changes.append(add_obj(mt7, mc7, f7,
    make_text(mt7, "ModalTitle", 580, 304, 280, 22, "Revogar agente?", 18, 700, T1, mc7, f7), p7))

# Message
mm = uid()
changes.append(add_obj(mm, mc7, f7,
    make_text(mm, "ModalMsg", 520, 334, 400, 32,
              "Revogar o agente Agente Comercial? Esta ação é irreversível.", 13, 400, T3, mc7, f7), p7))

# Motivo label
ml7 = uid()
changes.append(add_obj(ml7, mc7, f7,
    make_text(ml7, "LabelMotivo", 504, 380, 432, 12, "MOTIVO DA REVOGAÇÃO", 10, 700, T4, mc7, f7,
              uppercase=True, letter_spacing=0.8), p7))

# Textarea
ta = uid()
changes.append(add_obj(ta, mc7, f7,
    make_rect(ta, "TextareaMotivo", 504, 398, 432, 80, WHITE, mc7, f7,
              radius=8, strokes=stroke_border(BORDER)), p7))
tap = uid()
changes.append(add_obj(tap, ta, f7,
    make_text(tap, "TextareaPlaceholder", 518, 412, 404, 18,
              "Informe o motivo (mínimo 10 caracteres)...", 14, 400, T6, ta, f7), p7))

# Buttons row
bc7 = uid()
changes.append(add_obj(bc7, mc7, f7,
    make_rect(bc7, "BtnCancelar", 610, 498, 100, 40, WHITE, mc7, f7,
              radius=8, strokes=stroke_border(BORDER)), p7))
bct7 = uid()
changes.append(add_obj(bct7, bc7, f7,
    make_text(bct7, "BtnCancelarText", 625, 510, 70, 16, "Cancelar", 13, 600, T3, bc7, f7), p7))

br7 = uid()
changes.append(add_obj(br7, mc7, f7,
    make_rect(br7, "BtnRevogar", 724, 498, 200, 40, ERR, mc7, f7, radius=8), p7))
brt7 = uid()
changes.append(add_obj(brt7, br7, f7,
    make_text(brt7, "BtnRevogarText", 740, 510, 168, 16, "Revogar definitivamente", 13, 700, WHITE, br7, f7), p7))
send_changes(changes, "modal-revogar")


print("\n=== DONE ===")
print(f"Final revn: {revn}")
print("Pages created: 7")
