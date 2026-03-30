"""Fix: re-send the failed batch for 30-BuscaAvancadaRegras (result rows)."""
import json, uuid, re, requests

BASE = "https://dspp.jetme.com.br/api/rpc/command"
FILE_ID = "73c70309-a5e2-8120-8007-c7820d832ea2"
FEATURES = ["~#set", ["fdata/path-data","design-tokens/v1","variants/v1","layout/grid",
    "components/v2","fdata/shape-data-type","styles/v2","flex/v2","grid/v2","booleans/v2"]]
IDENTITY = ["^ ","~:a",1,"~:b",0,"~:c",0,"~:d",1,"~:e",0,"~:f",0]

session = requests.Session()
resp = session.post(f"{BASE}/login-with-password",
    headers={"Content-Type": "application/transit+json"},
    data=json.dumps(["^ ","~:email","clauded@jetme.com.br","~:password","Claude-Desktop"]))
assert resp.status_code == 200, "Login failed"
print("Login OK")

resp = session.post(f"{BASE}/get-file",
    headers={"Content-Type": "application/transit+json", "Accept": "application/transit+json"},
    data=json.dumps(["^ ","~:id",f"~u{FILE_ID}","~:features",FEATURES]))
assert resp.status_code == 200
text = resp.text
revn_idx = text.find('"~:revn"')
revn = int(text[revn_idx:revn_idx+30].split(",")[1].strip())
print(f"revn: {revn}")

# Find page_id and frame_id for BuscaAvancadaRegras
idx = text.find("30-BuscaAvancadaRegras")
assert idx > 0, "Page not found"

# Page ID is before the name
chunk_before = text[max(0,idx-300):idx]
uuids_before = re.findall(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", chunk_before)
page_id = uuids_before[-1] if uuids_before else None
print(f"page_id: {page_id}")

# Frame ID - search for it by finding the frame object on that page
# Look for frame type near BuscaAvancadaRegras
chunk_around = text[max(0,idx-500):idx+500]
# Find all UUIDs
all_uuids = re.findall(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", chunk_around)
# The frame_id is typically the first UUID associated with the frame object
# Let's search for "FilterPanel" which was in batch 1 (successful)
fp_idx = text.find("FilterPanel")
if fp_idx > 0:
    fp_chunk = text[fp_idx-200:fp_idx]
    fp_uuids = re.findall(r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}", fp_chunk)
    # The parent-id or frame-id of FilterPanel should be our frame
    # Look for the frame-id pattern
    frame_id = fp_uuids[-2] if len(fp_uuids) >= 2 else fp_uuids[-1]
else:
    frame_id = all_uuids[1] if len(all_uuids) > 1 else all_uuids[0]

print(f"frame_id: {frame_id}")

# Helpers
def uid():
    return str(uuid.uuid4())

def selrect(x,y,w,h):
    return ["^ ","~:x",x,"~:y",y,"~:width",w,"~:height",h,"~:x1",x,"~:y1",y,"~:x2",x+w,"~:y2",y+h]

def points(x,y,w,h):
    return [["^ ","~:x",x,"~:y",y],["^ ","~:x",x+w,"~:y",y],["^ ","~:x",x+w,"~:y",y+h],["^ ","~:x",x,"~:y",y+h]]

def make_rect(rid,name,x,y,w,h,fill,parent,frame,opacity=1,radius=0,strokes=None):
    obj = ["^ ","~:id",f"~u{rid}","~:type","~:rect","~:name",name,
        "~:x",x,"~:y",y,"~:width",w,"~:height",h,"~:rotation",0,
        "~:selrect",selrect(x,y,w,h),"~:points",points(x,y,w,h),
        "~:transform",IDENTITY,"~:transform-inverse",IDENTITY,
        "~:parent-id",f"~u{parent}","~:frame-id",f"~u{frame}",
        "~:fills",[["^ ","~:fill-color",fill,"~:fill-opacity",opacity]],
        "~:strokes",strokes if strokes else []]
    if radius > 0:
        obj.extend(["~:rx",radius,"~:ry",radius])
    return obj

def make_text(tid,name,x,y,w,h,text_str,font_size,font_weight,color,parent,frame):
    leaf = ["^ ","~:text",text_str,"~:font-id","plusjakartasans","~:font-family","Plus Jakarta Sans",
        "~:font-variant-id",str(font_weight),"~:font-size",str(font_size),"~:font-weight",str(font_weight),
        "~:font-style","normal","~:line-height","1.3","~:letter-spacing","0",
        "~:fill-color",color,"~:fill-opacity",1,"~:text-transform","none"]
    content = ["^ ","~:type","root","~:children",[["^ ","~:type","paragraph-set","~:children",[["^ ","~:type","paragraph","~:children",[leaf]]]]]]
    return ["^ ","~:id",f"~u{tid}","~:type","~:text","~:name",name,
        "~:x",x,"~:y",y,"~:width",w,"~:height",h,"~:rotation",0,
        "~:selrect",selrect(x,y,w,h),"~:points",points(x,y,w,h),
        "~:transform",IDENTITY,"~:transform-inverse",IDENTITY,
        "~:parent-id",f"~u{parent}","~:frame-id",f"~u{frame}",
        "~:fills",[],"~:strokes",[],"~:content",content]

def stroke_border(color="#E8E8E6",width=1,alignment="inner"):
    return [["^ ","~:stroke-style","~:solid","~:stroke-alignment",f"~:{alignment}","~:stroke-width",width,"~:stroke-color",color,"~:stroke-opacity",1]]

def add_obj(oid,parent,frame,obj,pid):
    return ["^ ","~:type","~:add-obj","~:id",f"~u{oid}","~:page-id",f"~u{pid}","~:parent-id",f"~u{parent}","~:frame-id",f"~u{frame}","~:obj",obj]

# Build missing objects
T1 = "#111111"
T4 = "#888888"
BLUE = "#2E86C1"
BORDER = "#E8E8E6"
WHITE = "#FFFFFF"
CW = 1200
fid = frame_id
pid = page_id

changes = []

# Limpar Filtros link
btn_y = 148 + 184 + 12
lf = uid()
changes.append(add_obj(lf, fid, fid,
    make_text(lf, "LimparFiltros", 288, btn_y + 10, 100, 18, "Limpar Filtros", 12, 500, BLUE, fid, fid), pid))

# Pesquisar button
pb = uid()
changes.append(add_obj(pb, fid, fid,
    make_rect(pb, "BtnPesquisar", 1340, btn_y, 100, 40, BLUE, fid, fid, radius=6), pid))
pbt = uid()
changes.append(add_obj(pbt, fid, fid,
    make_text(pbt, "BtnPesquisarTxt", 1356, btn_y + 10, 70, 20, "Pesquisar", 13, 600, WHITE, fid, fid), pid))

# Status bar
sb_y = btn_y + 56
sb = uid()
changes.append(add_obj(sb, fid, fid,
    make_text(sb, "ResultStatus", 264, sb_y, 300, 16, "Resultados: 3 regras encontradas", 12, 600, T1, fid, fid), pid))

# Result rows (fixed: using hex color instead of rgba)
row_y = sb_y + 24
row_texts = [
    "Pedido Compra | CREATE | R$ 10.000 | 3 niveis",
    "Nota Fiscal | CREATE | R$ 50.000 | 2 niveis",
    "Contrato | CREATE | R$ 100.000 | 4 niveis",
]
for i in range(3):
    rbg = uid()
    changes.append(add_obj(rbg, fid, fid,
        make_rect(rbg, f"ResultRow-{i}", 264, row_y, CW - 48, 44, "#FEFCE8", fid, fid,
                  strokes=stroke_border(BORDER, 1, "inner")), pid))
    rt = uid()
    changes.append(add_obj(rt, fid, fid,
        make_text(rt, f"ResultTxt-{i}", 276, row_y + 13, 800, 18, row_texts[i], 13, 500, T1, fid, fid), pid))
    row_y += 44

# Send
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
    print(f"Fix OK (revn={revn+1})")
else:
    print(f"Fix FAILED: {resp.text[:500]}")
