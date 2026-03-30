"""
Create 3 AppShell screens in Penpot (Producao-ecf project).
Uses transit+json REST API for write operations.
"""
import json
import uuid
import requests

BASE = "https://dspp.jetme.com.br/api/rpc/command"
FILE_ID = "73c70309-a5e2-8120-8007-c78275c46198"
PAGE_ID = "73c70309-a5e2-8120-8007-c78275c46199"
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

# ── Helpers ──
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

def make_rect(rid, name, x, y, w, h, fill, parent, frame, opacity=1, radius=0):
    obj = ["^ ",
        "~:id", f"~u{rid}", "~:type", "~:rect", "~:name", name,
        "~:x", x, "~:y", y, "~:width", w, "~:height", h, "~:rotation", 0,
        "~:selrect", selrect(x, y, w, h), "~:points", points(x, y, w, h),
        "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
        "~:parent-id", f"~u{parent}", "~:frame-id", f"~u{frame}",
        "~:fills", [["^ ", "~:fill-color", fill, "~:fill-opacity", opacity]],
        "~:strokes", [],
    ]
    if radius > 0:
        obj.extend(["~:rx", radius, "~:ry", radius])
    return obj

def add_obj(oid, parent, frame, obj):
    return ["^ ",
        "~:type", "~:add-obj",
        "~:id", f"~u{oid}",
        "~:page-id", f"~u{PAGE_ID}",
        "~:parent-id", f"~u{parent}",
        "~:frame-id", f"~u{frame}",
        "~:obj", obj,
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
        print(f"  {label}: FAILED - {resp.text[:300]}")
        return False

# ==========================================════════════════════════
# FRAME 1: AppShell — Sidebar Collapsed (1440x900)
# ==========================================════════════════════════
print("\n-- Frame 1: AppShell - Sidebar Collapsed --")
f1 = uid()
changes = []

# Frame itself
changes.append(add_obj(f1, ROOT, ROOT, make_frame(f1, "AppShell - Sidebar Collapsed", 0, 0, 1440, 900, "#f8fafc")))

# Content area (behind sidebar/topbar)
c1_content = uid()
changes.append(add_obj(c1_content, f1, f1, make_rect(c1_content, "Content Area", 64, 64, 1376, 836, "#f8fafc", f1, f1)))

# Topbar
c1_topbar = uid()
changes.append(add_obj(c1_topbar, f1, f1, make_rect(c1_topbar, "Topbar", 0, 0, 1440, 64, "#FFFFFF", f1, f1)))

# Topbar border-b
c1_tb_border = uid()
changes.append(add_obj(c1_tb_border, f1, f1, make_rect(c1_tb_border, "Topbar Border-b", 0, 63, 1440, 1, "#e2e8f0", f1, f1)))

# Logo bg (blue)
c1_logo = uid()
changes.append(add_obj(c1_logo, f1, f1, make_rect(c1_logo, "Logo A1 (blue)", 19, 19, 26, 26, "#2563eb", f1, f1, radius=5)))

# Profile avatar
c1_avatar = uid()
changes.append(add_obj(c1_avatar, f1, f1, make_rect(c1_avatar, "Profile Avatar", 1394, 17, 30, 30, "#2563eb", f1, f1, radius=15)))

# Breadcrumb hint rectangles
c1_bc1 = uid()
changes.append(add_obj(c1_bc1, f1, f1, make_rect(c1_bc1, "Breadcrumb / Dashboard", 84, 26, 80, 12, "#1e293b", f1, f1, radius=2)))

# Profile name hint
c1_pname = uid()
changes.append(add_obj(c1_pname, f1, f1, make_rect(c1_pname, "Profile Name", 1330, 22, 56, 8, "#1e293b", f1, f1, radius=2)))
c1_ptenant = uid()
changes.append(add_obj(c1_ptenant, f1, f1, make_rect(c1_ptenant, "Profile Tenant", 1340, 34, 46, 6, "#64748b", f1, f1, radius=2)))

# Sidebar
c1_sidebar = uid()
changes.append(add_obj(c1_sidebar, f1, f1, make_rect(c1_sidebar, "Sidebar", 0, 64, 64, 836, "#FFFFFF", f1, f1)))

# Sidebar border-r
c1_sb_border = uid()
changes.append(add_obj(c1_sb_border, f1, f1, make_rect(c1_sb_border, "Sidebar Border-r", 63, 64, 1, 836, "#e2e8f0", f1, f1)))

# Sidebar active item bg (blue-50)
c1_active = uid()
changes.append(add_obj(c1_active, f1, f1, make_rect(c1_active, "Sidebar Active BG", 8, 80, 48, 36, "#eff6ff", f1, f1, radius=6)))

# Sidebar icons (4 placeholder squares)
icons = [
    ("Icon Dashboard (active)", 22, 88, "#2563eb"),
    ("Icon Users", 22, 128, "#94a3b8"),
    ("Icon Shield", 22, 164, "#94a3b8"),
    ("Icon Building", 22, 200, "#94a3b8"),
    ("Icon Activity", 22, 244, "#94a3b8"),
    ("Icon Settings", 22, 280, "#94a3b8"),
]
for name, ix, iy, color in icons:
    iid = uid()
    changes.append(add_obj(iid, f1, f1, make_rect(iid, name, ix, iy, 20, 20, color, f1, f1, radius=3)))

# Content placeholder card
c1_card = uid()
changes.append(add_obj(c1_card, f1, f1, make_rect(c1_card, "Content Card", 88, 88, 600, 200, "#FFFFFF", f1, f1, radius=10)))

send_changes(changes, "Frame 1 - AppShell Collapsed")

# ==========================================════════════════════════
# FRAME 2: AppShell — Sidebar Expanded (1440x900)
# ==========================================════════════════════════
print("\n-- Frame 2: AppShell - Sidebar Expanded --")
f2 = uid()
changes = []

changes.append(add_obj(f2, ROOT, ROOT, make_frame(f2, "AppShell - Sidebar Expanded", 1540, 0, 1440, 900, "#f8fafc")))

# Content area
c2_content = uid()
changes.append(add_obj(c2_content, f2, f2, make_rect(c2_content, "Content Area", 1764, 64, 1216, 836, "#f8fafc", f2, f2)))

# Topbar
c2_topbar = uid()
changes.append(add_obj(c2_topbar, f2, f2, make_rect(c2_topbar, "Topbar", 1540, 0, 1440, 64, "#FFFFFF", f2, f2)))
c2_tb_border = uid()
changes.append(add_obj(c2_tb_border, f2, f2, make_rect(c2_tb_border, "Topbar Border-b", 1540, 63, 1440, 1, "#e2e8f0", f2, f2)))

# Logo
c2_logo = uid()
changes.append(add_obj(c2_logo, f2, f2, make_rect(c2_logo, "Logo A1 (blue)", 1559, 19, 26, 26, "#2563eb", f2, f2, radius=5)))

# Profile
c2_avatar = uid()
changes.append(add_obj(c2_avatar, f2, f2, make_rect(c2_avatar, "Profile Avatar", 2934, 17, 30, 30, "#2563eb", f2, f2, radius=15)))
c2_bc = uid()
changes.append(add_obj(c2_bc, f2, f2, make_rect(c2_bc, "Breadcrumb / Dashboard", 1624, 26, 80, 12, "#1e293b", f2, f2, radius=2)))

# Sidebar expanded (224px wide)
c2_sidebar = uid()
changes.append(add_obj(c2_sidebar, f2, f2, make_rect(c2_sidebar, "Sidebar Expanded", 1540, 64, 224, 836, "#FFFFFF", f2, f2)))
c2_sb_border = uid()
changes.append(add_obj(c2_sb_border, f2, f2, make_rect(c2_sb_border, "Sidebar Border-r", 1763, 64, 1, 836, "#e2e8f0", f2, f2)))

# Section label placeholder
c2_section = uid()
changes.append(add_obj(c2_section, f2, f2, make_rect(c2_section, "Section: ADMINISTRACAO", 1550, 76, 100, 8, "#cbd5e1", f2, f2, radius=2)))

# Sidebar items with labels
sidebar_items = [
    ("Dashboard (active)", 1548, 92, True),
    ("Usuarios", 1548, 132, False),
    ("Perfis e Permissoes", 1548, 164, False),
    ("Filiais", 1548, 196, False),
]
for name, sx, sy, active in sidebar_items:
    # Active bg
    if active:
        abg = uid()
        changes.append(add_obj(abg, f2, f2, make_rect(abg, f"Active BG - {name}", sx, sy, 208, 36, "#eff6ff", f2, f2, radius=6)))
    # Icon
    iid = uid()
    color = "#2563eb" if active else "#94a3b8"
    changes.append(add_obj(iid, f2, f2, make_rect(iid, f"Icon {name}", sx+10, sy+8, 20, 20, color, f2, f2, radius=3)))
    # Label placeholder
    lid = uid()
    lcolor = "#2563eb" if active else "#64748b"
    changes.append(add_obj(lid, f2, f2, make_rect(lid, f"Label {name}", sx+38, sy+12, 90, 12, lcolor, f2, f2, radius=2)))

# Section divider
c2_div = uid()
changes.append(add_obj(c2_div, f2, f2, make_rect(c2_div, "Section Divider", 1556, 238, 196, 1, "#f1f5f9", f2, f2)))

# Second section label
c2_sec2 = uid()
changes.append(add_obj(c2_sec2, f2, f2, make_rect(c2_sec2, "Section: ORGANIZACAO", 1550, 248, 90, 8, "#cbd5e1", f2, f2, radius=2)))

# More items
for i, (name, sy) in enumerate([("Estrutura Org.", 264), ("Escopos", 296), ("Compartilhamentos", 328)]):
    iid = uid()
    changes.append(add_obj(iid, f2, f2, make_rect(iid, f"Icon {name}", 1558, 1540+sy-1540+sy, 20, 20, "#94a3b8", f2, f2, radius=3)))
    lid = uid()
    changes.append(add_obj(lid, f2, f2, make_rect(lid, f"Label {name}", 1586, 1540+sy-1540+sy+4, 100, 12, "#64748b", f2, f2, radius=2)))

# Content card
c2_card = uid()
changes.append(add_obj(c2_card, f2, f2, make_rect(c2_card, "Content Card", 1788, 88, 600, 200, "#FFFFFF", f2, f2, radius=10)))

send_changes(changes, "Frame 2 - AppShell Expanded")

# ==========================================════════════════════════
# FRAME 3: Login Page (1440x900)
# ==========================================════════════════════════
print("\n-- Frame 3: Login Page --")
f3 = uid()
changes = []

changes.append(add_obj(f3, ROOT, ROOT, make_frame(f3, "Login Page (unified)", 3080, 0, 1440, 900, "#FFFFFF")))

# LEFT: Branding panel (580x900, dark)
c3_brand = uid()
changes.append(add_obj(c3_brand, f3, f3, make_rect(c3_brand, "Branding Panel (dark)", 3080, 0, 580, 900, "#111111", f3, f3)))

# Branding logo (orange - kept for branding)
c3_logo = uid()
changes.append(add_obj(c3_logo, f3, f3, make_rect(c3_logo, "Logo A1 (orange brand)", 3152, 64, 36, 36, "#F58C32", f3, f3, radius=7)))

# Brand name placeholder
c3_bname = uid()
changes.append(add_obj(c3_bname, f3, f3, make_rect(c3_bname, "Grupo A1", 3196, 70, 70, 14, "#FFFFFF", f3, f3, radius=2)))
c3_bsub = uid()
changes.append(add_obj(c3_bsub, f3, f3, make_rect(c3_bsub, "Portal Interno", 3196, 88, 60, 8, "#555555", f3, f3, radius=2)))

# Hero text placeholders
c3_hero1 = uid()
changes.append(add_obj(c3_hero1, f3, f3, make_rect(c3_hero1, "Hero: Solucoes", 3152, 340, 300, 40, "#FFFFFF", f3, f3, radius=3)))
c3_hero2 = uid()
changes.append(add_obj(c3_hero2, f3, f3, make_rect(c3_hero2, "Hero: para a", 3152, 390, 180, 40, "#FFFFFF", f3, f3, radius=3)))
c3_hero3 = uid()
changes.append(add_obj(c3_hero3, f3, f3, make_rect(c3_hero3, "Hero: industria.", 3152, 440, 280, 40, "#FFFFFF", f3, f3, radius=3)))

# Orange accent bar (branding)
c3_bar = uid()
changes.append(add_obj(c3_bar, f3, f3, make_rect(c3_bar, "Accent Bar (orange brand)", 3152, 510, 48, 3, "#F58C32", f3, f3)))

# Subtitle
c3_desc = uid()
changes.append(add_obj(c3_desc, f3, f3, make_rect(c3_desc, "Description text", 3152, 530, 360, 36, "#475569", f3, f3, radius=2)))

# Unit pills
for i, sx in enumerate([3152, 3244, 3320, 3384]):
    pid = uid()
    changes.append(add_obj(pid, f3, f3, make_rect(pid, f"Unit Pill {i+1}", sx, 780, 70, 32, "#111111", f3, f3, radius=20)))
    # Pill border
    bid = uid()
    changes.append(add_obj(bid, f3, f3, make_rect(bid, f"Unit Pill Border {i+1}", sx, 780, 70, 32, "#2A2A2A", f3, f3, opacity=0.3, radius=20)))

# RIGHT: Login form panel
c3_form_bg = uid()
changes.append(add_obj(c3_form_bg, f3, f3, make_rect(c3_form_bg, "Login Form BG", 3660, 0, 860, 900, "#FFFFFF", f3, f3)))

# Title
c3_title = uid()
changes.append(add_obj(c3_title, f3, f3, make_rect(c3_title, "Title: Bem-vindo de volta", 3820, 240, 240, 24, "#1e293b", f3, f3, radius=2)))
c3_sub = uid()
changes.append(add_obj(c3_sub, f3, f3, make_rect(c3_sub, "Subtitle", 3820, 272, 280, 14, "#64748b", f3, f3, radius=2)))

# Email input
c3_elabel = uid()
changes.append(add_obj(c3_elabel, f3, f3, make_rect(c3_elabel, "Label: E-MAIL", 3820, 330, 50, 10, "#334155", f3, f3, radius=2)))
c3_einput = uid()
changes.append(add_obj(c3_einput, f3, f3, make_rect(c3_einput, "Email Input", 3820, 348, 340, 48, "#f8fafc", f3, f3, radius=8)))
# Input border
c3_eiborder = uid()
changes.append(add_obj(c3_eiborder, f3, f3, make_rect(c3_eiborder, "Email Input Border", 3820, 348, 340, 48, "#e2e8f0", f3, f3, opacity=0.5, radius=8)))

# Password input
c3_plabel = uid()
changes.append(add_obj(c3_plabel, f3, f3, make_rect(c3_plabel, "Label: SENHA", 3820, 412, 44, 10, "#334155", f3, f3, radius=2)))
# Forgot password link (blue!)
c3_forgot = uid()
changes.append(add_obj(c3_forgot, f3, f3, make_rect(c3_forgot, "Forgot Link (blue)", 4090, 412, 80, 10, "#2563eb", f3, f3, radius=2)))
c3_pinput = uid()
changes.append(add_obj(c3_pinput, f3, f3, make_rect(c3_pinput, "Password Input", 3820, 430, 340, 48, "#f8fafc", f3, f3, radius=8)))
c3_piborder = uid()
changes.append(add_obj(c3_piborder, f3, f3, make_rect(c3_piborder, "Password Input Border", 3820, 430, 340, 48, "#e2e8f0", f3, f3, opacity=0.5, radius=8)))

# Checkbox + remember me
c3_check = uid()
changes.append(add_obj(c3_check, f3, f3, make_rect(c3_check, "Checkbox", 3820, 494, 16, 16, "#2563eb", f3, f3, radius=3)))
c3_remember = uid()
changes.append(add_obj(c3_remember, f3, f3, make_rect(c3_remember, "Manter conectado", 3844, 496, 100, 12, "#64748b", f3, f3, radius=2)))

# CTA Button (BLUE - not orange!)
c3_cta = uid()
changes.append(add_obj(c3_cta, f3, f3, make_rect(c3_cta, "CTA Entrar (blue)", 3820, 530, 340, 52, "#2563eb", f3, f3, radius=8)))
# CTA text placeholder
c3_ctatext = uid()
changes.append(add_obj(c3_ctatext, f3, f3, make_rect(c3_ctatext, "CTA Text: Entrar", 3950, 548, 60, 16, "#FFFFFF", f3, f3, radius=2)))

send_changes(changes, "Frame 3 - Login Page")

print("\n==========================================")
print(" /penpot push-component - Relatorio")
print("==========================================")
print(f" Projeto:    Producao-ecf")
print(f" Arquivo:    {FILE_ID}")
print(f" Modo:       producao")
print("------------------------------------------")
print(" Frames criados:")
print("   1. AppShell - Sidebar Collapsed (1440x900)")
print("   2. AppShell - Sidebar Expanded  (1440x900)")
print("   3. Login Page (unified)         (1440x900)")
print("------------------------------------------")
print(f" Operacoes:  3 frames + ~60 shapes")
print(f" Status:     verificar acima")
print("==========================================")
