# Đóng gói models/fern.glb từ lưới lá đã giảm (fern_blender.py → fronds.npz) + ảnh lá gốc (README.md)
#  · 3 lưới lá gộp 1 (màu đỉnh = sắc từng lưới), gốc toạ độ: giữa bề ngang khóm, mặt tường z = 0, +Z = ra khỏi tường, +Y = lên
#  · KHR_mesh_quantization: vị trí int16 (nút giải lượng tử đồng đều), pháp tuyến int8, UV uint16 — u về [0, 1) theo từng tam giác
#  · ảnh lá 1024² → 512² WebP có alpha, màu loang ra vùng trong suốt (mipmap không viền đen)
import json, struct, sys, io
import site; sys.path.append(site.getusersitepackages())   # chạy bằng -I: numpy / PIL nằm ở site-packages của người dùng
import numpy as np
from PIL import Image, ImageFilter
npz, png, out = sys.argv[1], sys.argv[2], sys.argv[3]
d = np.load(npz)
TINT = {'01a': (255, 255, 255), '01b': (232, 236, 226), '01c': (255, 236, 178)}   # 01c: lá già ngả vàng
P, N, UV, C, I = [], [], [], [], []
for k in ('01a', '01b', '01c'):
    p, n, uv, ix = d[k + '_P'], d[k + '_N'], d[k + '_UV'], d[k + '_I'].reshape(-1, 3)
    sh = np.floor(uv[ix, 0].mean(1))   # mỗi tam giác: dời u về [0, 1) (ảnh lặp ngang 4 lá)
    key, rows = {}, []
    tri = np.zeros_like(ix)
    for t in range(len(ix)):
        for c in range(3):
            v = int(ix[t, c]); kk = (v, int(sh[t]))
            if kk not in key: key[kk] = len(rows); rows.append(kk)
            tri[t, c] = key[kk] + len(P)
    for v, s in rows:
        P.append(p[v]); N.append(n[v]); UV.append((uv[v, 0] - s, uv[v, 1])); C.append(TINT[k] + (255,))
    I.append(tri.ravel())
P, N, UV, C, I = np.array(P, np.float64), np.array(N, np.float64), np.array(UV, np.float64), np.array(C, np.uint8), np.concatenate(I).astype(np.uint16)
assert UV.min() > -0.01 and UV.max() < 1.01, (UV.min(0), UV.max(0))   # mép ô ảnh: sai số làm tròn ≤ 0,2 %
cx, cy = (P[:, 0].min() + P[:, 0].max()) / 2, (P[:, 1].min() + P[:, 1].max()) / 2
P -= (cx, cy, 0)
lo, hi = P.min(0), P.max(0); ctr = (lo + hi) / 2; s = (hi - lo).max() / 2
Q = np.round((P - ctr) / s * 32767).astype(np.int16)
Qn = np.round(N / np.maximum(1e-9, np.linalg.norm(N, axis=1, keepdims=True)) * 127).astype(np.int8)
Quv = np.round(np.clip(UV, 0, 1) * 65535).astype(np.uint16)
# ảnh: 512², loang màu lá ra vùng trong suốt
im = Image.open(png).convert('RGBA').resize((512, 512), Image.LANCZOS); a = np.asarray(im).astype(np.float32) / 255
rgb, al = a[..., :3], a[..., 3:]
acc, w = rgb * (al > 0.5), (al > 0.5).astype(np.float32)
for r in (2, 4, 8, 16, 32):
    f = lambda x: np.asarray(Image.fromarray((x * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255
    bw = f(w[..., 0])[..., None]; bc = np.stack([f(acc[..., c] / 1.0) for c in range(3)], -1)
    fill = np.where(bw > 1e-3, bc / np.maximum(bw, 1e-3), 0); hole = w[..., 0] < 0.5
    rgb = np.where(hole[..., None] & (bw > 1e-3), fill, rgb); acc = np.where(hole[..., None], rgb * (bw > 1e-3), acc); w = np.maximum(w, (bw > 1e-3).astype(np.float32))
img = Image.fromarray(np.concatenate([np.clip(rgb, 0, 1) * 255, al * 255], -1).astype(np.uint8))
buf = io.BytesIO(); img.save(buf, 'WEBP', quality=80, alpha_quality=80, method=6); webp = buf.getvalue()
# GLB
blob, views = bytearray(), []
def view(b, target=None, stride=None):
    while len(blob) % 4: blob.append(0)
    v = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(b)}
    if target: v['target'] = target
    if stride: v['byteStride'] = stride
    blob.extend(b); views.append(v); return len(views) - 1
pad4 = lambda A, w: np.concatenate([A, np.zeros((len(A), w - A.shape[1]), A.dtype)], 1)
vP = view(pad4(Q, 4).tobytes(), 34962, 8); vN = view(pad4(Qn, 4).tobytes(), 34962, 4); vT = view(Quv.tobytes(), 34962, 4); vC = view(C.tobytes(), 34962, 4)
vI = view(I.tobytes(), 34963); vImg = view(webp)
nv = len(Q)
J = {
  'asset': {'version': '2.0', 'generator': 'src/tools/fern/fernpack.py', 'copyright': 'Realistic HD Common polypody fern (2555) — PlantCatalog (Sketchfab), CC-BY-4.0'},
  'extensionsUsed': ['KHR_mesh_quantization', 'EXT_texture_webp'], 'extensionsRequired': ['KHR_mesh_quantization', 'EXT_texture_webp'],
  'scene': 0, 'scenes': [{'nodes': [0]}],
  'nodes': [{'name': 'fern', 'mesh': 0, 'translation': [float(x) for x in ctr], 'scale': [float(s)] * 3,
             'extras': {'w': float(hi[0] - lo[0]), 'h': float(hi[1] - lo[1]), 'd': float(hi[2]), 'tris': int(len(I) // 3)}}],
  'meshes': [{'name': 'fern', 'primitives': [{'attributes': {'POSITION': 0, 'NORMAL': 1, 'TEXCOORD_0': 2, 'COLOR_0': 3}, 'indices': 4, 'material': 0}]}],
  'materials': [{'name': 'frond', 'pbrMetallicRoughness': {'baseColorTexture': {'index': 0}, 'metallicFactor': 0, 'roughnessFactor': 1}, 'alphaMode': 'MASK', 'alphaCutoff': 0.5, 'doubleSided': True}],
  'textures': [{'sampler': 0, 'extensions': {'EXT_texture_webp': {'source': 0}}}],
  'samplers': [{'magFilter': 9729, 'minFilter': 9987, 'wrapS': 33071, 'wrapT': 33071}],
  'images': [{'bufferView': vImg, 'mimeType': 'image/webp'}],
  'accessors': [
    {'bufferView': vP, 'componentType': 5122, 'normalized': True, 'count': nv, 'type': 'VEC3', 'min': [int(x) for x in Q.min(0)], 'max': [int(x) for x in Q.max(0)]},
    {'bufferView': vN, 'componentType': 5120, 'normalized': True, 'count': nv, 'type': 'VEC3'},
    {'bufferView': vT, 'componentType': 5123, 'normalized': True, 'count': nv, 'type': 'VEC2'},
    {'bufferView': vC, 'componentType': 5121, 'normalized': True, 'count': nv, 'type': 'VEC4'},
    {'bufferView': vI, 'componentType': 5123, 'count': len(I), 'type': 'SCALAR'}],
  'bufferViews': views, 'buffers': [{'byteLength': 0}]}
while len(blob) % 4: blob.append(0)
J['buffers'][0]['byteLength'] = len(blob)
js = json.dumps(J, separators=(',', ':')).encode()
js += b' ' * (-len(js) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob)
open(out, 'wb').write(glb)
print('fern.glb', len(glb), 'B · đỉnh', nv, '· tam giác', len(I) // 3, '· ảnh', len(webp), 'B · khóm', np.round(hi - lo, 3))
