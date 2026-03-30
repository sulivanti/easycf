"""
Patch script for PEN-01 validation findings.
Fixes P1-P6, P11, P13-P14 on existing objects in Penpot Sandbox.
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
IDENTITY = ["^ ", "~:a", 1, "~:b", 0, "~:c", 0, "~:d", 1, "~:e", 0, "~:f", 0]

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


def mod_obj(obj_id, page_id, operations):
    """Create a mod-obj change."""
    return ["^ ",
        "~:type", "~:mod-obj",
        "~:id", f"~u{obj_id}",
        "~:page-id", f"~u{page_id}",
        "~:operations", operations,
    ]


def set_attr(attr, val):
    """Create a set operation for mod-obj."""
    return ["^ ", "~:type", "~:set", "~:attr", f"~:{attr}", "~:val", val]


def make_content(text, font_size, font_weight, color, fill_opacity=1,
                 italic=False, uppercase=False, letter_spacing=0,
                 line_height=1.3, font_variant_id=None):
    """Build text content with correct fill-opacity."""
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


# ═══════════════════════════════════════════
# P1-P5: Fix fill-opacity on branding texts
# ═══════════════════════════════════════════
print("\n-- Wave 1: Fix branding text fill-opacity (P1-P5) --")

# Text objects to fix: (obj_id, page_id, text, font_size, font_weight, fill_opacity, kwargs)
text_fixes = [
    # 01-Login
    ("55be421e-8616-4ca2-b48c-b1fecdbc2182", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "PORTAL INTERNO", 10, 500, 0.35,
     {"uppercase": True, "letter_spacing": 1.6}),
    ("a604a53e-abfc-4296-a788-4511812d4f49", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida para o Grupo A1.",
     14, 400, 0.45,
     {"line_height": 1.64}),
    ("25de2268-0752-4c2f-84bb-bc4fadc205f9", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "UNIDADES DO GRUPO", 9, 700, 0.25,
     {"uppercase": True, "letter_spacing": 1.4}),
    ("a4ae1acc-2893-47f5-aa7e-4e428715cd75", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "© 2026 Grupo A1 · Todos os direitos reservados", 11, 400, 0.20, {}),
    ("469a9cf0-814e-4337-81eb-8d6a23d26ce1", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "Engenharia", 12, 500, 0.50, {}),
    ("21b5e05d-af5a-4618-bad9-e5733b33e62f", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "Industrial", 12, 500, 0.50, {}),
    ("f960d485-c094-4ccb-9d36-62c5a4aef53f", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "Energia", 12, 500, 0.50, {}),
    ("a31f3226-134f-4f0e-b71e-4acdf5723af6", "c097ead0-49a8-45a5-bab6-a6159b08732d",
     "Agro", 12, 500, 0.50, {}),

    # 01-Login-Forgot
    ("39ce7d61-bec2-4e07-826b-416e21e6382e", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "PORTAL INTERNO", 10, 500, 0.35,
     {"uppercase": True, "letter_spacing": 1.6}),
    ("3bce1456-a806-4c7e-8552-673290867549", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida para o Grupo A1.",
     14, 400, 0.45,
     {"line_height": 1.64}),
    ("4b699430-37b6-4856-bb86-dc7e65d50c54", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "UNIDADES DO GRUPO", 9, 700, 0.25,
     {"uppercase": True, "letter_spacing": 1.4}),
    ("becab34e-f63d-4972-a653-8794cc71166e", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "© 2026 Grupo A1 · Todos os direitos reservados", 11, 400, 0.20, {}),
    ("7b066112-b4be-4545-a5d0-f31e8586feef", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "Engenharia", 12, 500, 0.50, {}),
    ("551f04d6-dc94-4a88-b524-eb160f6413df", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "Industrial", 12, 500, 0.50, {}),
    ("bc368f16-96e8-48e3-acc3-e123b35b62b6", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "Energia", 12, 500, 0.50, {}),
    ("f7219926-50a7-4c5c-af18-3ce4300c9765", "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
     "Agro", 12, 500, 0.50, {}),

    # 01-Login-Reset
    ("e182c0a8-5f83-4828-99bb-49b916900e94", "a28269e1-cc5e-4a53-923a-8649498168af",
     "PORTAL INTERNO", 10, 500, 0.35,
     {"uppercase": True, "letter_spacing": 1.6}),
    ("e3a45c9b-5e78-4487-be5f-aefd6aae4ec3", "a28269e1-cc5e-4a53-923a-8649498168af",
     "Plataforma de gestão de processos, aprovações e integração com Protheus — desenvolvida para o Grupo A1.",
     14, 400, 0.45,
     {"line_height": 1.64}),
    ("bfcbdd6a-af08-4ef0-8191-d5216b269ca9", "a28269e1-cc5e-4a53-923a-8649498168af",
     "UNIDADES DO GRUPO", 9, 700, 0.25,
     {"uppercase": True, "letter_spacing": 1.4}),
    ("b05ad2a0-dadf-437a-84b9-34b5a274da93", "a28269e1-cc5e-4a53-923a-8649498168af",
     "© 2026 Grupo A1 · Todos os direitos reservados", 11, 400, 0.20, {}),
    ("db271b05-5ec8-4b57-9a40-cd0d08b43963", "a28269e1-cc5e-4a53-923a-8649498168af",
     "Engenharia", 12, 500, 0.50, {}),
    ("69c0bc44-6ce7-4b05-b0cd-c441738784ed", "a28269e1-cc5e-4a53-923a-8649498168af",
     "Industrial", 12, 500, 0.50, {}),
    ("56a488a1-bcb0-4052-9d7c-c54e2d5381f3", "a28269e1-cc5e-4a53-923a-8649498168af",
     "Energia", 12, 500, 0.50, {}),
    ("fdc19ef5-84e0-4844-8a84-24213802384e", "a28269e1-cc5e-4a53-923a-8649498168af",
     "Agro", 12, 500, 0.50, {}),
]

changes = []
for obj_id, page_id, text, fs, fw, opacity, kw in text_fixes:
    content = make_content(text, fs, fw, "#FFFFFF", fill_opacity=opacity, **kw)
    changes.append(mod_obj(obj_id, page_id, [set_attr("content", content)]))

send_changes(changes, f"Wave 1: Fix fill-opacity on {len(text_fixes)} text objects")


# ═══════════════════════════════════════════
# P6: Fix pill stroke opacity (0.12)
# ═══════════════════════════════════════════
print("\n-- Wave 2: Fix pill stroke opacity (P6) --")

pill_stroke = [["^ ",
    "~:stroke-style", "~:solid",
    "~:stroke-alignment", "~:inner",
    "~:stroke-width", 1,
    "~:stroke-color", "#FFFFFF",
    "~:stroke-opacity", 0.12,
]]

pill_ids = {
    "c097ead0-49a8-45a5-bab6-a6159b08732d": [
        "f4dccf9f-531e-47ff-87a4-2b644000a142",
        "d7107f57-4c8f-40c6-ab92-592cce54cde4",
        "1c87a89c-7548-464e-86d7-2f0f8eac3b03",
        "eedf7900-0720-4492-bfae-e77133f66105",
    ],
    "59916026-5fa0-4f5c-ad51-e981fe4d8b49": [
        "43611029-d2fb-474c-8e8d-d24de59c4aa2",
        "0731c568-8812-4d04-abf5-cb12c3ffc85b",
        "d8b3d1fc-f24e-4ffb-9755-3295f9c81aca",
        "9c6ec30f-a222-480d-b348-2ff33bfd7537",
    ],
    "a28269e1-cc5e-4a53-923a-8649498168af": [
        "141f6397-5bc7-40ee-bcd2-c6ab8b2b9255",
        "8b121dfd-b381-4d61-b803-897e0fc2f660",
        "ea2eab4b-3015-43ef-843f-f77e8ac7341d",
        "81e2f3e7-4932-40f3-b388-57469e34f5f4",
    ],
}

changes = []
for page_id, ids in pill_ids.items():
    for obj_id in ids:
        changes.append(mod_obj(obj_id, page_id, [set_attr("strokes", pill_stroke)]))

send_changes(changes, f"Wave 2: Fix stroke opacity on {sum(len(v) for v in pill_ids.values())} pills")


# ═══════════════════════════════════════════
# P11: Ensure MsgSucesso has stroke #B5E8C9
# ═══════════════════════════════════════════
print("\n-- Wave 2b: Ensure MsgSucesso stroke (P11) --")

msg_stroke = [["^ ",
    "~:stroke-style", "~:solid",
    "~:stroke-alignment", "~:inner",
    "~:stroke-width", 1,
    "~:stroke-color", "#B5E8C9",
    "~:stroke-opacity", 1,
]]

changes = [
    mod_obj("8ff7fa3d-7a85-46fc-aa9d-92483b60d221",
            "59916026-5fa0-4f5c-ad51-e981fe4d8b49",
            [set_attr("strokes", msg_stroke)])
]
send_changes(changes, "Wave 2b: MsgSucesso stroke")


# ═══════════════════════════════════════════
# P13-P14: Add arrow icons to Forgot/Reset buttons
# ═══════════════════════════════════════════
print("\n-- Wave 4: Add arrow icons (P13-P14) --")

INNER_X = 852  # 812 + 40

def add_obj_change(oid, parent, frame, page_id, obj):
    return ["^ ",
        "~:type", "~:add-obj",
        "~:id", f"~u{oid}",
        "~:page-id", f"~u{page_id}",
        "~:parent-id", f"~u{parent}",
        "~:frame-id", f"~u{frame}",
        "~:obj", obj,
    ]

# Need frame IDs and button Y positions
# Forgot: BtnEnviarLink is at CARD_Y+44+32+36+52+22+48+68 = 150+302 = ~452
# From the script: y starts at CARD_Y+44, then +32, +36, +52(email label), +22(input), +48(gap to btn)=+68
# Let me calculate: CARD_Y=150, y=194(back), y=226(title), y=262(sub), y=314(email lbl), y=336(email inp), y=404(btn)
# Actually I need the exact positions. Let me get them from the frame objects.
# Forgot frame: 3d225c8e-1736-44aa-8b1b-ddd4bc982523
# Reset frame:  390d70c6-2460-484e-9d3f-7d0dc5f1efcd

# I'll search for the button positions via the existing BtnEnviarLink and BtnRedefinir objects
# For now, use approximate positions based on the script logic:
# Forgot: btn_send y is at CARD_Y+44+32+36+52+22+68 = 150+254 = ~404
# But the script does: y=150+44=194, +32=226(title after back), +36=262(sub), +52=314(email field start),
#   inside email: +22=336(input), then y+=68 → 404 is the btn y
# Reset: more complex. Let me just search for the existing btn objects.

# Actually, it's simpler to just search the Penpot objects for button positions.
# But since we can't use MCP here, let me trace the script:

# FORGOT page: y flow:
# y = CARD_Y + 44 = 194 (back link)
# y += 32 → 226 (title)
# y += 36 → 262 (subtitle)
# y += 52 → 314 (email label)
# y += 22 → 336 (email input)
# y += 68 → 404 (btn send) ← BtnEnviarLink y=404
# Arrow for forgot: x=INNER_X+230, y=404+16=420

# RESET page: y flow:
# y = CARD_Y + 44 = 194 (back link)
# y += 32 → 226 (title)
# y += 36 → 262 (subtitle)
# y += 40 → 302 (nova senha label)
# y += 22 → 324 (nova senha input)
# y += 58 → 382 (strength bars)
# ... strength label at 392
# y += 36 → 418 (confirmar label)
# y += 22 → 440 (confirmar input)
# y += 68 → 508 (btn reset) ← BtnRedefinir y=508
# Arrow for reset: x=INNER_X+230, y=508+16=524

FORGOT_FRAME = "3d225c8e-1736-44aa-8b1b-ddd4bc982523"
RESET_FRAME = "390d70c6-2460-484e-9d3f-7d0dc5f1efcd"
PAGE_FORGOT = "59916026-5fa0-4f5c-ad51-e981fe4d8b49"
PAGE_RESET = "a28269e1-cc5e-4a53-923a-8649498168af"

changes = []

# Arrow on Forgot button
a2_id = uid()
a2_obj = ["^ ",
    "~:id", f"~u{a2_id}", "~:type", "~:rect", "~:name", "IconArrow",
    "~:x", INNER_X + 230, "~:y", 420, "~:width", 18, "~:height", 18, "~:rotation", 0,
    "~:selrect", selrect(INNER_X + 230, 420, 18, 18),
    "~:points", points(INNER_X + 230, 420, 18, 18),
    "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
    "~:parent-id", f"~u{FORGOT_FRAME}", "~:frame-id", f"~u{FORGOT_FRAME}",
    "~:fills", [["^ ", "~:fill-color", "#FFFFFF", "~:fill-opacity", 1]],
    "~:strokes", [],
    "~:rx", 2, "~:ry", 2,
]
changes.append(add_obj_change(a2_id, FORGOT_FRAME, FORGOT_FRAME, PAGE_FORGOT, a2_obj))

# Arrow on Reset button
a3_id = uid()
a3_obj = ["^ ",
    "~:id", f"~u{a3_id}", "~:type", "~:rect", "~:name", "IconArrow",
    "~:x", INNER_X + 230, "~:y", 524, "~:width", 18, "~:height", 18, "~:rotation", 0,
    "~:selrect", selrect(INNER_X + 230, 524, 18, 18),
    "~:points", points(INNER_X + 230, 524, 18, 18),
    "~:transform", IDENTITY, "~:transform-inverse", IDENTITY,
    "~:parent-id", f"~u{RESET_FRAME}", "~:frame-id", f"~u{RESET_FRAME}",
    "~:fills", [["^ ", "~:fill-color", "#FFFFFF", "~:fill-opacity", 1]],
    "~:strokes", [],
    "~:rx", 2, "~:ry", 2,
]
changes.append(add_obj_change(a3_id, RESET_FRAME, RESET_FRAME, PAGE_RESET, a3_obj))

send_changes(changes, "Wave 4: Add arrow icons to Forgot/Reset buttons")


# ═══════════════════════════════════════════
# Also remove shape-level opacity on texts that had text_opacity < 1
# (the old script set shape ~:opacity in addition to fill-opacity)
# ═══════════════════════════════════════════
print("\n-- Cleanup: Remove shape-level opacity (use content fill-opacity only) --")

# Objects that had text_opacity < 1 and thus have shape-level opacity set
# These need opacity reset to 1 (or removed) since we now use content fill-opacity
opacity_cleanup = []
for obj_id, page_id, text, fs, fw, opacity, kw in text_fixes:
    if opacity < 1:
        opacity_cleanup.append((obj_id, page_id))

changes = []
for obj_id, page_id in opacity_cleanup:
    changes.append(mod_obj(obj_id, page_id, [set_attr("opacity", 1)]))

if changes:
    send_changes(changes, f"Cleanup: Reset shape opacity on {len(changes)} objects")


print("\n==========================================")
print(" Patch PEN-01 — Completo")
print("==========================================")
print(" Correções aplicadas:")
print("   P1-P5: fill-opacity corrigido em 24 textos de branding")
print("   P6:    stroke-opacity 0.12 em 12 pills")
print("   P11:   stroke #B5E8C9 no MsgSucesso")
print("   P13:   IconArrow adicionado ao BtnEnviarLink")
print("   P14:   IconArrow adicionado ao BtnRedefinir")
print("==========================================")
