"""
Fix: Apply 3 corrections from validation report for 30-MovimentosLista.
1. PageTitle letter-spacing → -1
2. TH-* letter-spacing → 0.8 (8 objects)
3. Add 8th data row (Cancelado status)
"""
import json, uuid, requests

BASE = "https://dspp.jetme.com.br/api/rpc/command"
FILE_ID = "73c70309-a5e2-8120-8007-c7820d832ea2"
FEATURES = ["~#set", [
    "fdata/path-data", "design-tokens/v1", "variants/v1", "layout/grid",
    "components/v2", "fdata/shape-data-type", "styles/v2", "flex/v2",
    "grid/v2", "booleans/v2"
]]
ROOT = "00000000-0000-0000-0000-000000000000"
IDENTITY = ["^ ", "~:a", 1, "~:b", 0, "~:c", 0, "~:d", 1, "~:e", 0, "~:f", 0]

PAGE_ID = "589d47d6-f0d4-4dfa-b7a4-459aa341383c"
FRAME_ID = "eee72fbb-97a0-4138-921b-b41b9c698c35"

session = requests.Session()

# Login
resp = session.post(f"{BASE}/login-with-password",
    headers={"Content-Type": "application/transit+json"},
    data=json.dumps(["^ ", "~:email", "clauded@jetme.com.br", "~:password", "Claude-Desktop"]))
assert resp.status_code == 200, f"Login failed: {resp.text[:200]}"
print("Login OK")

# Get revn
resp = session.post(f"{BASE}/get-file",
    headers={"Content-Type": "application/transit+json", "Accept": "application/transit+json"},
    data=json.dumps(["^ ", "~:id", f"~u{FILE_ID}", "~:features", FEATURES]))
assert resp.status_code == 200
text = resp.text
revn_idx = text.find('"~:revn"')
revn = int(text[revn_idx:revn_idx+30].split(",")[1].strip())
print(f"Current revn: {revn}")


def uid():
    return str(uuid.uuid4())

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


def make_text_content(text_str, font_size, font_weight, color, letter_spacing=0,
                      italic=False, uppercase=False, line_height=1.3):
    """Build text content structure for mod-obj replacement."""
    leaf = ["^ ",
        "~:text", text_str,
        "~:font-id", "plusjakartasans",
        "~:font-family", "Plus Jakarta Sans",
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
    return ["^ ",
        "~:type", "root",
        "~:children", [
            ["^ ", "~:type", "paragraph-set", "~:children", [
                ["^ ", "~:type", "paragraph", "~:children", [leaf]]
            ]]
        ]
    ]


def mod_obj_content(obj_id, page_id, new_content):
    """mod-obj change to replace text content."""
    return ["^ ",
        "~:type", "~:mod-obj",
        "~:page-id", f"~u{page_id}",
        "~:id", f"~u{obj_id}",
        "~:operations", [
            ["^ ", "~:type", "~:set", "~:attr", "~:content", "~:val", new_content]
        ]
    ]


# ═══════════════════════════════════════════
# Correction 1: PageTitle letter-spacing → -1
# ═══════════════════════════════════════════

print("\n=== Correction 1: PageTitle letter-spacing -> -1 ===")
page_title_id = "01d1dcb6-d1c5-40b7-b693-72427608dfbf"
new_content = make_text_content(
    "Movimentos Controlados", 28, 800, "#111111",
    letter_spacing=-1, line_height=1.2
)
changes = [mod_obj_content(page_title_id, PAGE_ID, new_content)]
send_changes(changes, "Fix PageTitle ls=-1")


# ═══════════════════════════════════════════
# Correction 2: TH letter-spacing → 0.8
# ═══════════════════════════════════════════

print("\n=== Correction 2: TH letter-spacing -> 0.8 ===")
th_objects = [
    ("0611e670-3eda-4bba-9ed4-ab73113aee70", "STATUS"),
    ("9b5a136e-b14f-46b8-8be5-e8e4d9e3eadd", "TIPO"),
    ("2e0c0e03-8bea-4e64-b2a7-a8e439fce9e8", "NÚMERO"),
    ("ad6a6b4e-28f4-483f-a2e4-a8cd2a0fc92d", "SOLICITANTE"),
    ("1ef6d35d-7ae8-414e-a14f-7f3a66f7f5e4", "VALOR R$"),
    ("05f23f03-73e1-4dce-b2b1-b9e49f5e7f9a", "DATA"),
    ("74001add-b1f5-4da3-86dd-5f61c56e0b7f", "EMPRESA"),
    ("c1d33f9f-d2b7-4a10-ae00-fb1f8e49d5d1", "AÇÕES"),
]

changes = []
for obj_id, col_name in th_objects:
    new_content = make_text_content(
        col_name, 11, 600, "#111111",
        letter_spacing=0.8, uppercase=True
    )
    changes.append(mod_obj_content(obj_id, PAGE_ID, new_content))

send_changes(changes, "Fix TH ls=0.8 (8 objects)")


# ═══════════════════════════════════════════
# Correction 3: Add 8th row (Pendente extra)
# ═══════════════════════════════════════════

print("\n=== Correction 3: Add 8th data row ===")

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

def make_rect(rid, name, x, y, w, h, fill, parent, frame, opacity=1, radius=0, strokes=None):
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
    return obj

def make_text(tid, name, x, y, w, h, text_str, font_size, font_weight, color,
              parent, frame, italic=False, uppercase=False,
              letter_spacing=0, line_height=1.3, text_opacity=1):
    leaf = ["^ ",
        "~:text", text_str,
        "~:font-id", "plusjakartasans",
        "~:font-family", "Plus Jakarta Sans",
        "~:font-variant-id", str(font_weight),
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

def stroke_border(color="#E8E8E6", width=1, alignment="inner"):
    return [["^ ",
        "~:stroke-style", "~:solid",
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

# Row 8 position: after 7 rows of 44px each, starting at table header
# Table header y was at tabs_y+40+48 area. The 7th row ends at some y.
# From the script: row_y starts at tbl_y + 32, each row 44px
# tbl_y = sr_y + 48 = (tabs_y + 40) + 48 = (76+64+8+40)+48 = 276
# Actually let me calculate: cy=76, bottom=76+64=140, tabs_y=148, sr_y=148+40=188, tbl_y=188+48=236
# row_y starts at 236+32=268, 7 rows = 268 + 7*44 = 268+308 = 576
row_y = 576  # y position for 8th row

fid = FRAME_ID
pid = PAGE_ID
numero = "REQ-2026-00155"

changes = []

# Row bg
rbg = uid()
changes.append(add_obj(rbg, fid, fid,
    make_rect(rbg, f"Row-{numero}", 264, row_y, 1152, 44, "#FFFFFF", fid, fid,
              strokes=stroke_border("#E8E8E6", 1, "inner")), pid))

# Status: Pendente
badge_bg = uid()
changes.append(add_obj(badge_bg, fid, fid,
    make_rect(badge_bg, "Badge-Pendente8", 268, row_y + 11, 60, 22, "#fef3c7", fid, fid, radius=11), pid))
badge_txt = uid()
changes.append(add_obj(badge_txt, fid, fid,
    make_text(badge_txt, "BadgeTxt-Pendente8", 276, row_y + 15, 44, 14, "Pendente", 10, 700, "#b45309", fid, fid), pid))

# Tipo
tt = uid()
changes.append(add_obj(tt, fid, fid,
    make_text(tt, f"Tipo-{numero}", 348, row_y + 13, 110, 18, "Requisição", 13, 500, "#111111", fid, fid), pid))

# Número
nt = uid()
changes.append(add_obj(nt, fid, fid,
    make_text(nt, f"Num-{numero}", 462, row_y + 13, 120, 18, numero, 13, 700, "#2E86C1", fid, fid), pid))

# Solicitante
st = uid()
changes.append(add_obj(st, fid, fid,
    make_text(st, f"Sol-{numero}", 586, row_y + 13, 130, 18, "Roberto Almeida", 13, 400, "#888888", fid, fid), pid))

# Valor
vt = uid()
changes.append(add_obj(vt, fid, fid,
    make_text(vt, f"Val-{numero}", 720, row_y + 13, 90, 18, "15.200,00", 13, 700, "#111111", fid, fid), pid))

# Data
dt = uid()
changes.append(add_obj(dt, fid, fid,
    make_text(dt, f"Data-{numero}", 814, row_y + 13, 80, 18, "12/03/2026", 11, 400, "#888888", fid, fid), pid))

# Empresa
et = uid()
changes.append(add_obj(et, fid, fid,
    make_text(et, f"Emp-{numero}", 898, row_y + 13, 120, 18, "A1 Industrial", 13, 400, "#111111", fid, fid), pid))

# Actions: Aprovar + Rejeitar
ab = uid()
changes.append(add_obj(ab, fid, fid,
    make_rect(ab, f"BtnAprovar-{numero}", 1028, row_y + 8, 60, 28, "#FFFFFF", fid, fid,
              radius=6, strokes=stroke_border("#16a34a", 1, "inner")), pid))
abt = uid()
changes.append(add_obj(abt, fid, fid,
    make_text(abt, f"BtnAprovarTxt-{numero}", 1036, row_y + 13, 44, 18, "Aprovar", 11, 600, "#16a34a", fid, fid), pid))
rb = uid()
changes.append(add_obj(rb, fid, fid,
    make_rect(rb, f"BtnRejeitar-{numero}", 1094, row_y + 8, 60, 28, "#FFFFFF", fid, fid,
              radius=6, strokes=stroke_border("#dc2626", 1, "inner")), pid))
rbt = uid()
changes.append(add_obj(rbt, fid, fid,
    make_text(rbt, f"BtnRejeitarTxt-{numero}", 1101, row_y + 13, 44, 18, "Rejeitar", 11, 600, "#dc2626", fid, fid), pid))

send_changes(changes, "Add 8th row (REQ-2026-00155)")


# ═══════════════════════════════════════════
# Update footer text to reflect 8 rows
# ═══════════════════════════════════════════

print("\n=== Update footer count ===")
# Need to find and update the footer text. Using mod-obj to change content.
# Footer text object was created with name "FooterText"
# We need to search for it. Let's use the get-file data we already have.
import re

# Find FooterText object ID
ft_idx = text.find("FooterText")
if ft_idx > 0:
    chunk = text[max(0,ft_idx-200):ft_idx]
    uuids = re.findall(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", chunk)
    if uuids:
        footer_id = uuids[-1]
        print(f"  Found FooterText: {footer_id}")
        new_content = make_text_content(
            "Exibindo 8 de 42 movimentos", 11, 400, "#888888"
        )
        changes = [mod_obj_content(footer_id, PAGE_ID, new_content)]
        send_changes(changes, "Update footer to 8/42")
    else:
        print("  WARNING: FooterText UUID not found, skipping")
else:
    print("  WARNING: FooterText not found in file data, skipping")


print("\n=== ALL CORRECTIONS APPLIED ===")
print(f"Final revn: {revn}")
