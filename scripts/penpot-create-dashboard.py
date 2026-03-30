"""
Create 02-Dashboard screen in Penpot Sandbox.
Uses transit+json REST API. Based on 02-dashboard-spec.md.

Pages:
  02-Dashboard — Metric cards + Donut chart + Activity list
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
    leaf = ["^ ",
        "~:text", text,
        "~:font-id", "plusjakartasans",
        "~:font-family", "Plus Jakarta Sans",
        "~:font-variant-id", str(font_weight),
        "~:font-size", str(font_size),
        "~:font-weight", str(font_weight),
        "~:font-style", "normal",
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
        headers={"Content-Type": "application/transit+json", "Accept": "application/transit+json"},
        data=json.dumps(body))
    if resp.status_code == 200:
        revn += 1
        print(f"  [{label}] OK (revn → {revn})")
    else:
        print(f"  [{label}] FAIL {resp.status_code}: {resp.text[:300]}")
    return resp.status_code == 200


# ═══════════════════════════════════════════
# CREATE PAGE
# ═══════════════════════════════════════════

PAGE_ID = uid()
print(f"\n── Creating page 02-Dashboard (page_id: {PAGE_ID}) ──")
send_changes([add_page_change(PAGE_ID, "02-Dashboard")], "add-page")


# ═══════════════════════════════════════════
# FRAME: 02-Dashboard (1440×900)
# ═══════════════════════════════════════════

frame_id = uid()
frame_obj = make_frame(frame_id, "02-Dashboard", 0, 0, 1440, 900, "#F5F5F3")

print(f"\n── Building 02-Dashboard objects ──")

changes = []

# 1. Root frame
changes.append(add_obj(frame_id, ROOT, ROOT, frame_obj, PAGE_ID))

# ─── TOPBAR ───
tb_id = uid()
tb_obj = make_rect(tb_id, "Topbar", 0, 0, 1440, 64, "#FFFFFF", frame_id, frame_id,
                   strokes=stroke_border("#E8E8E6", 1, "inner"))
changes.append(add_obj(tb_id, frame_id, frame_id, tb_obj, PAGE_ID))

# Logo
logo_id = uid()
logo_obj = make_rect(logo_id, "Logo", 24, 12, 40, 40, "#2E86C1", tb_id, frame_id, radius=10)
changes.append(add_obj(logo_id, tb_id, frame_id, logo_obj, PAGE_ID))

logo_txt_id = uid()
logo_txt = make_text(logo_txt_id, "LogoText", 24, 20, 40, 24, "A1", 16, 800, "#FFFFFF", tb_id, frame_id)
changes.append(add_obj(logo_txt_id, tb_id, frame_id, logo_txt, PAGE_ID))

# App name
appname_id = uid()
appname = make_text(appname_id, "AppName", 76, 16, 100, 18, "Grupo A1", 14, 800, "#111111", tb_id, frame_id)
changes.append(add_obj(appname_id, tb_id, frame_id, appname, PAGE_ID))

apptag_id = uid()
apptag = make_text(apptag_id, "AppTag", 76, 36, 120, 14, "PORTAL INTERNO", 10, 600, "#888888",
                   tb_id, frame_id, uppercase=True, letter_spacing=1.2)
changes.append(add_obj(apptag_id, tb_id, frame_id, apptag, PAGE_ID))

# Separator
sep_id = uid()
sep_obj = make_rect(sep_id, "TopSep", 200, 20, 1, 24, "#E8E8E6", tb_id, frame_id)
changes.append(add_obj(sep_id, tb_id, frame_id, sep_obj, PAGE_ID))

# Breadcrumb
bc1_id = uid()
bc1 = make_text(bc1_id, "BcInicio", 213, 24, 44, 16, "Início", 13, 400, "#888888", tb_id, frame_id)
changes.append(add_obj(bc1_id, tb_id, frame_id, bc1, PAGE_ID))

bc_sep_id = uid()
bc_sep = make_text(bc_sep_id, "BcSep", 261, 24, 10, 16, "›", 13, 400, "#CCCCCC", tb_id, frame_id)
changes.append(add_obj(bc_sep_id, tb_id, frame_id, bc_sep, PAGE_ID))

bc2_id = uid()
bc2 = make_text(bc2_id, "BcDashboard", 275, 24, 80, 16, "Dashboard", 13, 700, "#111111", tb_id, frame_id)
changes.append(add_obj(bc2_id, tb_id, frame_id, bc2, PAGE_ID))

# Right side: user info + avatar
uname_id = uid()
uname = make_text(uname_id, "UserName", 1248, 16, 130, 16, "Administrador ECF", 12, 700, "#111111", tb_id, frame_id)
changes.append(add_obj(uname_id, tb_id, frame_id, uname, PAGE_ID))

ulevel_id = uid()
ulevel = make_text(ulevel_id, "UserLevel", 1270, 34, 108, 14, "Acesso Nível 5", 10, 400, "#888888", tb_id, frame_id)
changes.append(add_obj(ulevel_id, tb_id, frame_id, ulevel, PAGE_ID))

av_id = uid()
av_obj = make_rect(av_id, "Avatar", 1388, 12, 40, 40, "#F0F0EE", tb_id, frame_id,
                   radius=20, strokes=stroke_border("#E8E8E6", 2, "inner"))
changes.append(add_obj(av_id, tb_id, frame_id, av_obj, PAGE_ID))

av_txt_id = uid()
av_txt = make_text(av_txt_id, "AvatarText", 1388, 22, 40, 20, "AE", 13, 700, "#555555", tb_id, frame_id)
changes.append(add_obj(av_txt_id, tb_id, frame_id, av_txt, PAGE_ID))

# ─── SIDEBAR ───
sb_id = uid()
sb_obj = make_rect(sb_id, "Sidebar", 0, 64, 240, 836, "#FFFFFF", frame_id, frame_id,
                   strokes=stroke_border("#E8E8E6", 1, "inner"))
changes.append(add_obj(sb_id, frame_id, frame_id, sb_obj, PAGE_ID))

# Sidebar category
sb_cat1_id = uid()
sb_cat1 = make_text(sb_cat1_id, "SbCatAdmin", 28, 88, 190, 12, "ADMINISTRAÇÃO", 9, 700, "#AAAAAA",
                    sb_id, frame_id, uppercase=True, letter_spacing=1.4)
changes.append(add_obj(sb_cat1_id, sb_id, frame_id, sb_cat1, PAGE_ID))

# Dashboard active item
sb_dash_bg_id = uid()
sb_dash_bg = make_rect(sb_dash_bg_id, "SbDashBg", 16, 106, 208, 38, "#E3F2FD", sb_id, frame_id, radius=6)
changes.append(add_obj(sb_dash_bg_id, sb_id, frame_id, sb_dash_bg, PAGE_ID))

sb_dash_id = uid()
sb_dash = make_text(sb_dash_id, "SbDashText", 44, 116, 160, 16, "Dashboard", 13, 700, "#2E86C1", sb_id, frame_id)
changes.append(add_obj(sb_dash_id, sb_id, frame_id, sb_dash, PAGE_ID))

# Other sidebar items
sb_items = [("Usuários", 150), ("Perfis", 174), ("Empresas", 198)]
for name, yy in sb_items:
    sid = uid()
    st = make_text(sid, f"Sb{name}", 44, yy, 160, 16, name, 13, 500, "#888888", sb_id, frame_id)
    changes.append(add_obj(sid, sb_id, frame_id, st, PAGE_ID))

sb_cat2_id = uid()
sb_cat2 = make_text(sb_cat2_id, "SbCatProc", 28, 232, 190, 12, "PROCESSOS", 9, 700, "#AAAAAA",
                    sb_id, frame_id, uppercase=True, letter_spacing=1.4)
changes.append(add_obj(sb_cat2_id, sb_id, frame_id, sb_cat2, PAGE_ID))

sb_items2 = [("Solicitações", 252), ("Aprovações", 276)]
for name, yy in sb_items2:
    sid = uid()
    st = make_text(sid, f"Sb{name}", 44, yy, 160, 16, name, 13, 500, "#888888", sb_id, frame_id)
    changes.append(add_obj(sid, sb_id, frame_id, st, PAGE_ID))

# Sidebar footer
sb_foot_sep_id = uid()
sb_foot_sep = make_rect(sb_foot_sep_id, "SbFootSep", 0, 864, 240, 1, "#E8E8E6", sb_id, frame_id)
changes.append(add_obj(sb_foot_sep_id, sb_id, frame_id, sb_foot_sep, PAGE_ID))

sb_av_id = uid()
sb_av = make_rect(sb_av_id, "SbAvatar", 16, 876, 32, 32, "#2E86C1", sb_id, frame_id, radius=16)
changes.append(add_obj(sb_av_id, sb_id, frame_id, sb_av, PAGE_ID))

sb_av_txt_id = uid()
sb_av_txt = make_text(sb_av_txt_id, "SbAvatarTxt", 16, 882, 32, 20, "AE", 11, 700, "#FFFFFF", sb_id, frame_id)
changes.append(add_obj(sb_av_txt_id, sb_id, frame_id, sb_av_txt, PAGE_ID))

sb_un_id = uid()
sb_un = make_text(sb_un_id, "SbUserName", 56, 878, 170, 14, "Administrador ECF", 12, 700, "#111111", sb_id, frame_id)
changes.append(add_obj(sb_un_id, sb_id, frame_id, sb_un, PAGE_ID))

sb_ue_id = uid()
sb_ue = make_text(sb_ue_id, "SbUserEmail", 56, 894, 170, 14, "admin@a1.com.br", 11, 400, "#888888", sb_id, frame_id)
changes.append(add_obj(sb_ue_id, sb_id, frame_id, sb_ue, PAGE_ID))

# ─── Send batch 1: frame + topbar + sidebar ───
print(f"  Batch 1: {len(changes)} objects (frame + topbar + sidebar)")
ok1 = send_changes(changes, "batch-1-shell")

# ═══════════════════════════════════════════
# BATCH 2: CONTENT AREA
# ═══════════════════════════════════════════
changes2 = []

# Content area background
ct_id = uid()
ct_obj = make_rect(ct_id, "ContentArea", 240, 64, 1200, 836, "#F5F5F3", frame_id, frame_id)
changes2.append(add_obj(ct_id, frame_id, frame_id, ct_obj, PAGE_ID))

# Page header
title_id = uid()
title = make_text(title_id, "Title", 272, 96, 400, 34, "Dashboard", 28, 800, "#111111",
                  ct_id, frame_id, letter_spacing=-1, line_height=1.2)
changes2.append(add_obj(title_id, ct_id, frame_id, title, PAGE_ID))

desc_id = uid()
desc = make_text(desc_id, "Desc", 272, 134, 700, 20,
                 "Visão geral em tempo real dos processos e agentes do sistema.",
                 14, 400, "#888888", ct_id, frame_id)
changes2.append(add_obj(desc_id, ct_id, frame_id, desc, PAGE_ID))

# ─── METRIC CARDS ───
# 4 cards, width = (1136 - 60) / 4 = 269, gap 20, y=178
CARD_W = 269
CARD_H = 130
CARD_Y = 178
CARD_GAP = 20
CARD_X_START = 272

cards_data = [
    ("Processos Ativos", "PROCESSOS ATIVOS", "12", "#111111", "#2E86C1", "Em execução"),
    ("Aprovações Pendentes", "APROVAÇÕES PENDENTES", "08", "#E67E22", "#E67E22", "Aguardando revisão"),
    ("Usuários Ativos", "USUÁRIOS ATIVOS", "47", "#111111", "#27AE60", "Base cadastrada"),
    ("Agentes MCP", "AGENTES MCP", "05", "#27AE60", "#27AE60", "Online e operando"),
]

for i, (card_name, label_text, value, val_color, dot_color, indicator) in enumerate(cards_data):
    cx = CARD_X_START + i * (CARD_W + CARD_GAP)

    cid = uid()
    c_obj = make_rect(cid, f"Card-{card_name}", cx, CARD_Y, CARD_W, CARD_H, "#FFFFFF",
                      ct_id, frame_id, radius=16, strokes=stroke_border("#E8E8E6"))
    changes2.append(add_obj(cid, ct_id, frame_id, c_obj, PAGE_ID))

    # Label
    lid = uid()
    l_obj = make_text(lid, f"Card{i+1}Label", cx+24, CARD_Y+24, CARD_W-48, 12,
                      label_text, 10, 700, "#888888", cid, frame_id,
                      uppercase=True, letter_spacing=1)
    changes2.append(add_obj(lid, cid, frame_id, l_obj, PAGE_ID))

    # Value
    vid = uid()
    v_obj = make_text(vid, f"Card{i+1}Value", cx+24, CARD_Y+44, 100, 40,
                      value, 36, 800, val_color, cid, frame_id, line_height=1.1)
    changes2.append(add_obj(vid, cid, frame_id, v_obj, PAGE_ID))

    # Dot
    did = uid()
    d_obj = make_rect(did, f"Card{i+1}Dot", cx+24, CARD_Y+98, 8, 8, dot_color,
                      cid, frame_id, radius=4)
    changes2.append(add_obj(did, cid, frame_id, d_obj, PAGE_ID))

    # Indicator text
    iid = uid()
    i_obj = make_text(iid, f"Card{i+1}Ind", cx+38, CARD_Y+94, 200, 14,
                      indicator, 11, 400, "#AAAAAA", cid, frame_id)
    changes2.append(add_obj(iid, cid, frame_id, i_obj, PAGE_ID))

print(f"  Batch 2: {len(changes2)} objects (content area + metric cards)")
ok2 = send_changes(changes2, "batch-2-content")

# ═══════════════════════════════════════════
# BATCH 3: DONUT CARD + ACTIVITIES CARD
# ═══════════════════════════════════════════
changes3 = []

# Second row: 5fr(465) + 7fr(651), gap 20, y=332
ROW2_Y = 332
DONUT_W = 465
DONUT_H = 320
ACT_W = 651
DONUT_X = 272
ACT_X = 272 + DONUT_W + 20  # 757

# ─── DONUT CARD ───
donut_card_id = uid()
donut_card = make_rect(donut_card_id, "CardDonut", DONUT_X, ROW2_Y, DONUT_W, DONUT_H,
                       "#FFFFFF", ct_id, frame_id, radius=16, strokes=stroke_border("#E8E8E6"))
changes3.append(add_obj(donut_card_id, ct_id, frame_id, donut_card, PAGE_ID))

# Donut title
dt_id = uid()
dt = make_text(dt_id, "DonutTitle", DONUT_X+24, ROW2_Y+24, 300, 18,
               "Distribuição por Status", 14, 700, "#111111", donut_card_id, frame_id)
changes3.append(add_obj(dt_id, donut_card_id, frame_id, dt, PAGE_ID))

# Donut circle background (placeholder)
donut_bg_id = uid()
donut_bg = make_rect(donut_bg_id, "DonutBg", DONUT_X+40, ROW2_Y+66, 144, 144, "#F0F0EE",
                     donut_card_id, frame_id, radius=72)
changes3.append(add_obj(donut_bg_id, donut_card_id, frame_id, donut_bg, PAGE_ID))

# Donut segments (simplified as colored arcs — using quarter-circle rects as visual hints)
# Green segment (40%) — top-left area
seg_green_id = uid()
seg_green = make_rect(seg_green_id, "SegGreen-40%", DONUT_X+40, ROW2_Y+66, 72, 72, "#27AE60",
                      donut_card_id, frame_id, opacity=0.85,
                      r1=72, r2=0, r3=0, r4=0)
changes3.append(add_obj(seg_green_id, donut_card_id, frame_id, seg_green, PAGE_ID))

# Amber segment (25%)
seg_amber_id = uid()
seg_amber = make_rect(seg_amber_id, "SegAmber-25%", DONUT_X+112, ROW2_Y+66, 72, 72, "#E67E22",
                      donut_card_id, frame_id, opacity=0.85,
                      r1=0, r2=72, r3=0, r4=0)
changes3.append(add_obj(seg_amber_id, donut_card_id, frame_id, seg_amber, PAGE_ID))

# Red segment (20%)
seg_red_id = uid()
seg_red = make_rect(seg_red_id, "SegRed-20%", DONUT_X+112, ROW2_Y+138, 72, 72, "#E74C3C",
                    donut_card_id, frame_id, opacity=0.85,
                    r1=0, r2=0, r3=72, r4=0)
changes3.append(add_obj(seg_red_id, donut_card_id, frame_id, seg_red, PAGE_ID))

# Blue segment (15%)
seg_blue_id = uid()
seg_blue = make_rect(seg_blue_id, "SegBlue-15%", DONUT_X+40, ROW2_Y+138, 72, 72, "#2E86C1",
                     donut_card_id, frame_id, opacity=0.85,
                     r1=0, r2=0, r3=0, r4=72)
changes3.append(add_obj(seg_blue_id, donut_card_id, frame_id, seg_blue, PAGE_ID))

# Donut center overlay (white circle to create ring effect)
donut_center_id = uid()
donut_center = make_rect(donut_center_id, "DonutCenter", DONUT_X+62, ROW2_Y+88, 100, 100, "#FFFFFF",
                         donut_card_id, frame_id, radius=50)
changes3.append(add_obj(donut_center_id, donut_card_id, frame_id, donut_center, PAGE_ID))

# Center text
dc_num_id = uid()
dc_num = make_text(dc_num_id, "DonutNum", DONUT_X+84, ROW2_Y+116, 56, 30,
                   "72", 24, 800, "#111111", donut_card_id, frame_id)
changes3.append(add_obj(dc_num_id, donut_card_id, frame_id, dc_num, PAGE_ID))

dc_lbl_id = uid()
dc_lbl = make_text(dc_lbl_id, "DonutLabel", DONUT_X+84, ROW2_Y+148, 56, 12,
                   "TOTAL", 9, 700, "#AAAAAA", donut_card_id, frame_id,
                   uppercase=True, letter_spacing=1)
changes3.append(add_obj(dc_lbl_id, donut_card_id, frame_id, dc_lbl, PAGE_ID))

# ─── DONUT LEGEND ───
legend_x = DONUT_X + 210
legend_items = [
    ("Concluído", "40%", "#27AE60"),
    ("Andamento", "25%", "#E67E22"),
    ("Atrasado",  "20%", "#E74C3C"),
    ("Planejado", "15%", "#2E86C1"),
]
for j, (leg_name, leg_pct, leg_color) in enumerate(legend_items):
    ly = ROW2_Y + 80 + j * 28

    ld_id = uid()
    ld = make_rect(ld_id, f"LegDot-{leg_name}", legend_x, ly+4, 8, 8, leg_color,
                   donut_card_id, frame_id, radius=4)
    changes3.append(add_obj(ld_id, donut_card_id, frame_id, ld, PAGE_ID))

    ln_id = uid()
    ln = make_text(ln_id, f"LegName-{leg_name}", legend_x+16, ly, 90, 16,
                   leg_name, 12, 400, "#555555", donut_card_id, frame_id)
    changes3.append(add_obj(ln_id, donut_card_id, frame_id, ln, PAGE_ID))

    lp_id = uid()
    lp = make_text(lp_id, f"LegPct-{leg_name}", legend_x+110, ly, 40, 16,
                   leg_pct, 12, 700, "#111111", donut_card_id, frame_id)
    changes3.append(add_obj(lp_id, donut_card_id, frame_id, lp, PAGE_ID))

# ─── ACTIVITIES CARD ───
act_card_id = uid()
act_card = make_rect(act_card_id, "CardAtividades", ACT_X, ROW2_Y, ACT_W, DONUT_H,
                     "#FFFFFF", ct_id, frame_id, radius=16, strokes=stroke_border("#E8E8E6"))
changes3.append(add_obj(act_card_id, ct_id, frame_id, act_card, PAGE_ID))

# Activity header
at_id = uid()
at = make_text(at_id, "ActTitle", ACT_X+24, ROW2_Y+24, 250, 18,
               "Atividades Recentes", 14, 700, "#111111", act_card_id, frame_id)
changes3.append(add_obj(at_id, act_card_id, frame_id, at, PAGE_ID))

al_id = uid()
al = make_text(al_id, "ActLink", ACT_X+ACT_W-104, ROW2_Y+26, 80, 12,
               "VER TUDO", 10, 700, "#2E86C1", act_card_id, frame_id,
               uppercase=True, letter_spacing=1)
changes3.append(add_obj(al_id, act_card_id, frame_id, al, PAGE_ID))

# Activity items
activities = [
    ("#27AE60", "Carlos Silva", " aprovou o processo ", "PR-0042", False, "Hoje, 14:32"),
    ("#2E86C1", "Ana Martins", " criou nova modelagem ", "MOD-018", False, "Hoje, 11:15"),
    ("#E67E22", "Agente DocParser", " processou 24 documentos em lote", None, False, "Hoje, 09:48"),
    ("#E74C3C", "Sistema", " detectou falha crítica no agente ", "MCP-003", True, "Ontem, 18:20"),
]

for k, (dot_c, actor, desc_text, badge, is_danger, time_text) in enumerate(activities):
    ay = ROW2_Y + 66 + k * 62

    # Dot
    ad_id = uid()
    ad = make_rect(ad_id, f"Act{k+1}Dot", ACT_X+24, ay+6, 8, 8, dot_c,
                   act_card_id, frame_id, radius=4)
    changes3.append(add_obj(ad_id, act_card_id, frame_id, ad, PAGE_ID))

    # Actor name (bold)
    an_id = uid()
    an = make_text(an_id, f"Act{k+1}Name", ACT_X+40, ay, 130, 16,
                   actor, 13, 700, "#111111", act_card_id, frame_id)
    changes3.append(add_obj(an_id, act_card_id, frame_id, an, PAGE_ID))

    # Description
    adesc_id = uid()
    adesc = make_text(adesc_id, f"Act{k+1}Desc", ACT_X+172, ay, 350, 16,
                      desc_text.strip(), 13, 400, "#555555", act_card_id, frame_id)
    changes3.append(add_obj(adesc_id, act_card_id, frame_id, adesc, PAGE_ID))

    # Badge (if present)
    if badge:
        badge_bg_color = "#FFEBEE" if is_danger else "#F5F5F3"
        badge_txt_color = "#C0392B" if is_danger else "#333333"
        badge_x = ACT_X + 530

        bb_id = uid()
        bb = make_rect(bb_id, f"Act{k+1}Badge", badge_x, ay-1, 64, 18, badge_bg_color,
                       act_card_id, frame_id, radius=4)
        changes3.append(add_obj(bb_id, act_card_id, frame_id, bb, PAGE_ID))

        bt_id = uid()
        bt = make_text(bt_id, f"Act{k+1}BadgeTxt", badge_x+6, ay+1, 52, 14,
                       badge, 10, 700, badge_txt_color, act_card_id, frame_id)
        changes3.append(add_obj(bt_id, act_card_id, frame_id, bt, PAGE_ID))

    # Timestamp
    tm_id = uid()
    tm = make_text(tm_id, f"Act{k+1}Time", ACT_X+40, ay+20, 120, 14,
                   time_text, 11, 400, "#AAAAAA", act_card_id, frame_id)
    changes3.append(add_obj(tm_id, act_card_id, frame_id, tm, PAGE_ID))

print(f"  Batch 3: {len(changes3)} objects (donut + activities)")
ok3 = send_changes(changes3, "batch-3-row2")

# ═══════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════
total = len(changes) + len(changes2) + len(changes3)
print(f"\n═══════════════════════════════════════════")
print(f" 02-Dashboard created!")
print(f" Page: 02-Dashboard ({PAGE_ID})")
print(f" Frame: 02-Dashboard ({frame_id})")
print(f" Objects: {total}")
print(f" Batches: 3 (shell:{len(changes)}, content:{len(changes2)}, row2:{len(changes3)})")
print(f" Status: {'ALL OK' if (ok1 and ok2 and ok3) else 'SOME FAILURES'}")
print(f"═══════════════════════════════════════════")
