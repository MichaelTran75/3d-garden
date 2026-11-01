# Đóng gói models/turbine.glb từ turbine_blender.py (.npz): 3 nút 'rotor' · 'stat' · 'vane', đơn vị mét thật, trục quay = (0, y, 0), đáy cụm y = 0
#  · màu: mỗi tam giác lấy màu gần nhất trong bảng màu chung (gộp sắc gần nhau); màu đỉnh = màu xuất hiện nhiều nhất ở các tam giác quanh đỉnh
#  · đỉnh hàn lại chỉ theo vị trí (lưới 2 mm), KHÔNG có pháp tuyến: trang vẽ flatShading (pháp tuyến mặt tính trong shader) — tách đỉnh theo pháp tuyến / màu
#    làm số đỉnh gấp 3 · KHR_mesh_quantization: vị trí int16, màu uint8
#  · cánh hướng nước: gốc = trục xoay cánh, extras: góc từng cánh, góc mở mẫu, góc đóng kín (thử chồng lấn với cánh kề)
import json, struct, sys, math
sys.path.append('/Users/michaeltran/Library/Python/3.9/lib/python/site-packages')
import numpy as np
npz, out = sys.argv[1], sys.argv[2]
d = np.load(npz)
y0 = min(d[k + '_P'][:, 1].min() for k in ('rotor', 'stat', 'vane'))
PAL = []
def snap(C):   # gộp màu: khoảng cách < 14 (thang 0..255 tuyến tính) dùng chung 1 màu
    out = np.empty_like(C)
    for i, c in enumerate(C.astype(int)):
        for p in PAL:
            if np.abs(p - c).max() < 14: out[i] = p; break
        else: PAL.append(c); out[i] = c
    return out
def weld(P, N, C, I):
    T = I.reshape(-1, 3); Ct = snap(C[T[:, 0]])   # màu theo tam giác (3 góc cùng màu)
    kp = np.round(P / 2e-3).astype(np.int64); _, first, inv = np.unique(kp, axis=0, return_index=True, return_inverse=True); inv = inv.ravel()
    J = inv[T]; J = J[(J[:, 0] != J[:, 1]) & (J[:, 1] != J[:, 2]) & (J[:, 0] != J[:, 2])]
    votes = [dict() for _ in range(len(first))]
    for t in range(len(T)):
        c = tuple(Ct[t])
        for v in inv[T[t]]: votes[v][c] = votes[v].get(c, 0) + 1
    Cv = np.array([max(vt, key=vt.get) for vt in votes], np.uint8)
    return P[first], None, Cv, J.ravel()
parts = {}
for k in ('rotor', 'stat', 'vane'):
    P, N, C, I = d[k + '_P'].astype(np.float64), d[k + '_N'].astype(np.float64), d[k + '_C'], d[k + '_I']
    P[:, 1] -= y0; parts[k] = weld(P, N, C, I)
# cánh: dời về trục xoay; tìm góc đóng kín (xoay quanh trục cánh tới khi chạm cánh kề, bước 20°)
pv = d['pivot'].astype(np.float64)   # (x, z) hệ glTF
VP = parts['vane'][0].copy(); VP[:, 0] -= pv[0]; VP[:, 2] -= pv[1]
pa = math.atan2(pv[1], pv[0]); R = math.hypot(*pv)
def ring(rot):   # đa giác chiếu (x, z) của cánh mẫu xoay rot quanh trục cánh, đặt ở cánh gốc và cánh kế (+20°)
    c, s = math.cos(rot), math.sin(rot); X = VP[:, 0] * c - VP[:, 2] * s; Z = VP[:, 0] * s + VP[:, 2] * c
    a = np.c_[X + pv[0], Z + pv[1]]; e = math.radians(20); ce, se = math.cos(e), math.sin(e)
    return a, np.c_[a[:, 0] * ce - a[:, 1] * se, a[:, 0] * se + a[:, 1] * ce]
def gap(rot):
    a, b = ring(rot); D = np.hypot(a[:, None, 0] - b[None, :, 0], a[:, None, 1] - b[None, :, 1]); return D.min()
best = {}
for sg in (1, -1):
    for deg in np.arange(0, 70, 0.5):
        if gap(sg * math.radians(deg)) < 0.03: best[sg] = deg; break
# chiều đóng: chiều chạm cánh kề sớm hơn (cánh nằm ngang theo phương tiếp tuyến)
sg = min(best, key=best.get) if best else 1; closeDeg = best.get(sg, 35.0)
print('vane pivot r %.3f angle %.1f°, close direction %+d, close at %.1f° (gap test), other dir %s' % (R, math.degrees(pa), sg, closeDeg, best.get(-sg)))
parts['vane'] = (VP, *parts['vane'][1:])
blob, views, acc, meshes, nodes = bytearray(), [], [], [], []
def view(b, target=None, stride=None):
    while len(blob) % 4: blob.append(0)
    v = {'buffer': 0, 'byteOffset': len(blob), 'byteLength': len(b)}
    if target: v['target'] = target
    if stride: v['byteStride'] = stride
    blob.extend(b); views.append(v); return len(views) - 1
pad4 = lambda A, w: np.concatenate([A, np.zeros((len(A), w - A.shape[1]), A.dtype)], 1)
stat = {}
def mesh_node(name, P, N, C, I, extras):   # N bỏ (flatShading)
    lo, hi = P.min(0), P.max(0); ctr = (lo + hi) / 2; s = (hi - lo).max() / 2
    Q = np.round((P - ctr) / s * 32767).astype(np.int16)
    Qc = np.c_[C.astype(np.uint8), np.full(len(C), 255, np.uint8)]
    I = I.astype(np.uint16 if len(P) < 65536 else np.uint32); n = len(Q); a0 = len(acc)
    acc.extend([{'bufferView': view(pad4(Q, 4).tobytes(), 34962, 8), 'componentType': 5122, 'normalized': True, 'count': n, 'type': 'VEC3', 'min': [int(x) for x in Q.min(0)], 'max': [int(x) for x in Q.max(0)]},
                {'bufferView': view(Qc.tobytes(), 34962, 4), 'componentType': 5121, 'normalized': True, 'count': n, 'type': 'VEC4'},
                {'bufferView': view(I.tobytes(), 34963), 'componentType': 5123 if I.dtype == np.uint16 else 5125, 'count': len(I), 'type': 'SCALAR'}])
    meshes.append({'name': name, 'primitives': [{'attributes': {'POSITION': a0, 'COLOR_0': a0 + 1}, 'indices': a0 + 2, 'material': 0}]})
    nodes.append({'name': name, 'children': [len(nodes) + 1], 'extras': extras})
    nodes.append({'name': name + '_q', 'mesh': len(meshes) - 1, 'translation': [float(x) for x in ctr], 'scale': [float(s)] * 3})
    stat[name] = (n, len(I) // 3); return len(nodes) - 2
Pr, Ps = parts['rotor'][0], parts['stat'][0]
top = float(max(Pr[:, 1].max(), Ps[:, 1].max())); rad = float(np.hypot(Ps[:, 0], Ps[:, 2]).max())
roots = [mesh_node('rotor', *parts['rotor'], {}), mesh_node('stat', *parts['stat'], {'top': top, 'radius': rad}),
         mesh_node('vane', *parts['vane'], {'r': R, 'a0': math.degrees(pa), 'n': 18, 'pitch': 20, 'closeDir': sg, 'closeDeg': float(closeDeg), 'y0': float(-y0)})]
J = {'asset': {'version': '2.0', 'generator': 'src/tools/turbine/turbinepack.py', 'extras': {'title': 'Hydrogenerator | Old work', 'author': 'TadenStar (https://sketchfab.com/tadenstar)',
       'license': 'CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)', 'source': 'https://sketchfab.com/3d-models/hydrogenerator-old-work-630a3b2be6904bb1a5ec813a2c0a848f',
       'note': 'Modified: assembled group only, section caps and duplicate windings removed, guide vanes reduced to one template, decimated, texture colours baked to vertex colours, quantised'}},
     'extensionsUsed': ['KHR_mesh_quantization'], 'extensionsRequired': ['KHR_mesh_quantization'],
     'scene': 0, 'scenes': [{'nodes': roots}], 'nodes': nodes, 'meshes': meshes, 'accessors': acc, 'bufferViews': views, 'buffers': [{'byteLength': 0}],
     'materials': [{'name': 'turbine', 'pbrMetallicRoughness': {'baseColorFactor': [1, 1, 1, 1], 'metallicFactor': 0, 'roughnessFactor': 0.7}, 'doubleSided': True}]}
while len(blob) % 4: blob.append(0)
J['buffers'][0]['byteLength'] = len(blob)
js = json.dumps(J, separators=(',', ':')).encode(); js += b' ' * (-len(js) % 4)
glb = struct.pack('<III', 0x46546C67, 2, 12 + 8 + len(js) + 8 + len(blob)) + struct.pack('<II', len(js), 0x4E4F534A) + js + struct.pack('<II', len(blob), 0x004E4942) + bytes(blob)
open(out, 'wb').write(glb)
print('turbine.glb', len(glb), 'B ·', {k: '%d đỉnh / %d tam giác' % v for k, v in stat.items()}, '· bảng màu', len(PAL), '· cao %.2f m · bán kính %.2f m' % (top, rad))
