# Đóng gói models/books.glb từ "Books and magazines" (Naira, CC-BY-4.0 — README.md)
#  · mỗi cuốn 1 nút (tên = tên vật liệu gốc: book002…book01, magaz1, magazstack1), gốc nút = giữa đáy cuốn, dịch nút = chỗ cũ trong cụm
#  · Z-lên cm của tệp gốc → Y-lên m (gốc Sketchfab_model xoay −90° quanh X), bỏ tiếp tuyến
#  · chỉ giữ ảnh màu (bỏ pháp tuyến / AO / độ nhám / specular), ảnh WebP: sách 256², chồng tạp chí 512²
# python3 -I bookpack.py <books_and_magazines.glb> <ra: models/books.glb>
import json, struct, sys, io
sys.path.append('/Users/michaeltran/Library/Python/3.9/lib/python/site-packages')
import numpy as np
from PIL import Image
src, out = sys.argv[1], sys.argv[2]
b = open(src, 'rb').read()
L = struct.unpack('<I', b[12:16])[0]; J = json.loads(b[20:20 + L]); BIN = b[20 + L + 8:]
CT = {5120: np.int8, 5121: np.uint8, 5122: np.int16, 5123: np.uint16, 5125: np.uint32, 5126: np.float32}
NC = {'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4}
def acc(i):
    a = J['accessors'][i]; v = J['bufferViews'][a['bufferView']]; n, dt = NC[a['type']], np.dtype(CT[a['componentType']])
    st = v.get('byteStride', n * dt.itemsize); off = v.get('byteOffset', 0) + a.get('byteOffset', 0)
    raw = np.frombuffer(BIN, np.uint8, a['count'] * st, off).reshape(a['count'], st)[:, :n * dt.itemsize]
    return raw.copy().view(dt).reshape(a['count'], n).astype(np.float64 if dt == np.float32 else dt)
def image(i):
    im = J['images'][i]; v = J['bufferViews'][im['bufferView']]; return Image.open(io.BytesIO(BIN[v.get('byteOffset', 0):v.get('byteOffset', 0) + v['byteLength']])).convert('RGB')
blob, views, accs, nodes, meshes, mats, texs, imgs = bytearray(), [], [], [], [], [], [], []
def view(by, target=None):
    while len(blob) % 4: blob.append(0)
    v = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(by)}
    if target: v['target'] = target
    blob.extend(by); views.append(v); return len(views) - 1
def put(A, ct, typ, target, minmax=False):
    a = {'bufferView': view(A.tobytes(), target), 'componentType': ct, 'count': len(A), 'type': typ}
    if minmax: a['min'] = A.min(0).tolist(); a['max'] = A.max(0).tolist()
    accs.append(a); return len(accs) - 1
for m in J['meshes']:
    for p in m['primitives']:
        mt = J['materials'][p['material']]; name = mt['name']
        P = acc(p['attributes']['POSITION']); N = acc(p['attributes']['NORMAL']); T = acc(p['attributes']['TEXCOORD_0']); I = acc(p['indices']).ravel()
        P = np.stack([P[:, 0], P[:, 2], -P[:, 1]], 1) * 0.01; N = np.stack([N[:, 0], N[:, 2], -N[:, 1]], 1)
        lo, hi = P.min(0), P.max(0); base = np.array([(lo[0] + hi[0]) / 2, lo[1], (lo[2] + hi[2]) / 2]); P -= base
        N /= np.maximum(1e-9, np.linalg.norm(N, axis=1, keepdims=True))
        side = 512 if name == 'magazstack1' else 256
        im = image(J['textures'][mt['pbrMetallicRoughness']['baseColorTexture']['index']]['source']).resize((side, side), Image.LANCZOS)
        buf = io.BytesIO(); im.save(buf, 'WEBP', quality=82, method=6)
        imgs.append({'bufferView': view(buf.getvalue()), 'mimeType': 'image/webp'}); texs.append({'sampler': 0, 'extensions': {'EXT_texture_webp': {'source': len(imgs) - 1}}})
        mats.append({'name': name, 'pbrMetallicRoughness': {'baseColorTexture': {'index': len(texs) - 1}, 'metallicFactor': 0, 'roughnessFactor': 0.8}, 'doubleSided': True})
        attrs = {'POSITION': put(P.astype(np.float32), 5126, 'VEC3', 34962, True), 'NORMAL': put(N.astype(np.float32), 5126, 'VEC3', 34962), 'TEXCOORD_0': put(T.astype(np.float32), 5126, 'VEC2', 34962)}
        meshes.append({'name': name, 'primitives': [{'attributes': attrs, 'indices': put(I.astype(np.uint16 if len(P) < 65536 else np.uint32), 5123 if len(P) < 65536 else 5125, 'SCALAR', 34963), 'material': len(mats) - 1}]})
        nodes.append({'name': name, 'mesh': len(meshes) - 1, 'translation': base.round(5).tolist()})
        print('%-12s %4d đỉnh  %.3f × %.3f × %.3f m  ảnh %d KB' % (name, len(P), *(hi - lo), len(buf.getvalue()) // 1024))
while len(blob) % 4: blob.append(0)
G = {'asset': {'version': '2.0', 'generator': 'src/tools/books/bookpack.py', 'copyright': 'Books and magazines — Naira (Sketchfab), CC-BY-4.0'},
     'extensionsUsed': ['EXT_texture_webp'], 'extensionsRequired': ['EXT_texture_webp'], 'scene': 0, 'scenes': [{'nodes': list(range(len(nodes)))}],
     'nodes': nodes, 'meshes': meshes, 'materials': mats, 'textures': texs, 'images': imgs, 'samplers': [{'magFilter': 9729, 'minFilter': 9987}],
     'accessors': accs, 'bufferViews': views, 'buffers': [{'byteLength': len(blob)}]}
js = json.dumps(G, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob)
open(out, 'wb').write(glb); print(out, len(glb) // 1024, 'KB')
