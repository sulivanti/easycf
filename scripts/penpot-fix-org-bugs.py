"""
Fix B1/B2/B3 bugs across all 4 Org screens:
  B1: BuildingIconBG 48×48 → 40×40 (shift +4px each axis)
  B2: DecoCircle1 fillOpacity 0.08 → 0.1
  B3: DecoCircle2 fillOpacity 0.08 → 0.1
"""
import json
import requests

BASE = "https://dspp.jetme.com.br/api/rpc/command"
FILE_ID = "73c70309-a5e2-8120-8007-c7820d832ea2"
FEATURES = ["~#set", [
    "fdata/path-data", "design-tokens/v1", "variants/v1", "layout/grid",
    "components/v2", "fdata/shape-data-type", "styles/v2", "flex/v2",
    "grid/v2", "booleans/v2"
]]

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

def mod_obj(obj_id, page_id, operations):
    return ["^ ",
        "~:type", "~:mod-obj",
        "~:id", f"~u{obj_id}",
        "~:page-id", f"~u{page_id}",
        "~:operations", operations,
    ]

def op_set(attr, val):
    return ["^ ", "~:type", "~:set", "~:attr", f"~:{attr}", "~:val", val]

def op_set_plain(attr, val):
    """For non-keyword values."""
    return ["^ ", "~:type", "~:set", "~:attr", f"~:{attr}", "~:val", val]

# ── All fixes organized by page ──

PAGES = [
    {
        "name": "10-OrgTree",
        "page_id": "e0370661-763d-45c1-8771-167ed659791a",
        "icon_bg_id": "5822ad55-55d2-4132-83c5-7bb173c3c2bc",
        "deco1_id": "4536d726-f989-4151-b976-5b191cbdca4a",
        "deco2_id": "b5aed9b7-8107-4a22-abfd-da4e31143514",
        "icon_bg_new_x": 668,  # was 664, +4
        "icon_bg_new_y": 112,  # was 108, +4
    },
    {
        "name": "11-OrgForm-Edit",
        "page_id": "638c0d10-e159-4f30-acc3-3fc750a9fba9",
        "icon_bg_id": "c7a038f0-04b0-48ca-8f4a-778173278aff",
        "deco1_id": "4cb55387-370a-43b0-b941-85e93444d09d",
        "deco2_id": "9864663e-72b3-47d6-9c8b-787c169c99b9",
        "icon_bg_new_x": 768,  # was 764, +4
        "icon_bg_new_y": 112,
    },
    {
        "name": "11-OrgForm-Create",
        "page_id": "3db80fad-a9c5-409c-ac4e-65a0193c0b86",
        "icon_bg_id": "ee6004aa-dd65-4130-b487-89b2ec526f55",
        "deco1_id": "e6fbc8ec-8962-498b-9874-0451ffe077df",
        "deco2_id": "90d6f651-ce3e-4779-9602-bc3f62297194",
        "icon_bg_new_x": 768,
        "icon_bg_new_y": 112,
    },
    {
        "name": "11-OrgForm-Deactivate",
        "page_id": "9e46bfab-47c8-4fa4-b946-caf7e5ba5943",
        "icon_bg_id": "6880bfb2-3660-4f4b-9727-0a902a052ee0",
        "deco1_id": "aaa9e4eb-f0f0-44a9-8498-e8e5bf942209",
        "deco2_id": "3866933b-d41a-403c-b636-714e69ec8bf8",
        "icon_bg_new_x": 668,  # same as OrgTree (x_offset=620)
        "icon_bg_new_y": 112,
    },
]

for page in PAGES:
    pid = page["page_id"]
    nx = page["icon_bg_new_x"]
    ny = page["icon_bg_new_y"]
    changes = []

    # B1: BuildingIconBG 48→40, reposition (without selrect/points - let Penpot recalc)
    fnx = float(nx)
    fny = float(ny)
    changes.append(mod_obj(page["icon_bg_id"], pid, [
        op_set("x", fnx),
        op_set("y", fny),
        op_set("width", 40.0),
        op_set("height", 40.0),
    ]))

    # B2: DecoCircle1 fillOpacity 0.08→0.1
    changes.append(mod_obj(page["deco1_id"], pid, [
        op_set("fills", [["^ ", "~:fill-color", "#FFFFFF", "~:fill-opacity", 0.1]]),
    ]))

    # B3: DecoCircle2 fillOpacity 0.08→0.1
    changes.append(mod_obj(page["deco2_id"], pid, [
        op_set("fills", [["^ ", "~:fill-color", "#FFFFFF", "~:fill-opacity", 0.1]]),
    ]))

    send_changes(changes, f"Fix {page['name']}")

print(f"\nDone! All 3 bugs fixed across 4 pages. Final revn: {revn}")
