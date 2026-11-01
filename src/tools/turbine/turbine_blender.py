# Blender (nền): tổ máy thủy điện "Hydrogenerator | Old work" (TadenStar, CC-BY-4.0) → mảng lưới từng phần ra .npz cho turbinepack.py
#  · chỉ lấy cụm lắp đủ Rotor_Collect (Rotor_Cut là bản cắt nửa, rotor khuyết 130° — quay sẽ lộ khe); bỏ nắp mặt cắt 'Cut', Obmotka_rotora_1 (231°, trùng
#    Obmotka_rotora_2), Obmotka_statora (nửa vòng)
#  · đổi về mét thật, trục quay = gốc toạ độ (x = z = 0), Y lên (hệ glTF)
#  · tách: 'rotor' (Rotor_Full + Obmotka_rotora_2 + Rotor_turbine + vành đai bánh xe công tác nằm trong 'turbina'), 'vane' (1 cánh hướng nước mẫu, gốc = trục
#    xoay cánh; 18 cánh còn lại bị bỏ, trang dựng lại bằng InstancedMesh), 'stat' (mọi phần đứng yên)
#  · giảm lưới (Decimate gộp mặt phẳng rồi collapse theo tỉ lệ từng phần), màu mặt = ảnh màu vật liệu lấy mẫu ở tâm UV từng tam giác (sRGB → tuyến tính)
import bpy, bmesh, sys, math, numpy as np
from mathutils import Matrix
argv = sys.argv[sys.argv.index('--') + 1:]
src, out = argv[0], argv[1]
SCL = 0.14567972719669342                 # tỉ lệ gốc Sketchfab (mét thật → đơn vị glTF)
AX = (5.11957, 0.00001)                   # trục quay cụm Rotor_Collect, hệ glTF (x, z)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)

def under(ob, name):
    p = ob.parent
    while p:
        if p.name.startswith(name): return True
        p = p.parent
    return False
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
keep = [o for o in meshes if under(o, 'Rotor_Collect') and not o.name.startswith(('Cut_', 'Obmotka_rotora_1', 'Obmotka_statora'))]
for o in meshes:
    if o not in keep: bpy.data.objects.remove(o, do_unlink=True)
# mét thật, trục ở gốc: glTF (x, y, z) = Blender (x, −y, z)·(Z lên) — đổi trực tiếp trên ma trận thế giới
T = Matrix.Scale(1 / SCL, 4) @ Matrix.Translation((-AX[0], AX[1], 0))   # Blender y = −glTF z
for o in keep:
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = T @ mw
bpy.ops.object.select_all(action='DESELECT')
for o in keep: o.select_set(True)
bpy.context.view_layer.objects.active = keep[0]
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in keep:   # hàn đỉnh trùng (mẫu gốc tách đỉnh theo UV / pháp tuyến)
    bm = bmesh.new(); bm.from_mesh(o.data); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=2e-4); bm.to_mesh(o.data); bm.free()

def loose(o):   # tách mảnh liền → danh sách object
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.mesh.separate(type='LOOSE'); return [x for x in bpy.context.selected_objects]
def info(o):
    V = np.array([v.co[:] for v in o.data.vertices]); r = np.hypot(V[:, 0], V[:, 1])
    return V, r, len(o.data.polygons)
def join(objs, name):
    objs = [x for x in objs if x]
    if not objs: return None
    bpy.ops.object.select_all(action='DESELECT')
    for x in objs: x.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    if len(objs) > 1: bpy.ops.object.join()
    objs[0].name = name; return objs[0]

parts = {'rotor': [], 'stat': [], 'vane': []}   # (object, tỉ lệ giảm lưới)
vanes, stems, band = [], [], []
for o in list(keep):
    nm = o.name
    if nm.startswith(('Rotor_Full', 'Obmotka_rotora_2', 'Rotor_turbine')):
        parts['rotor'].append((o, 0.5 if nm.startswith('Rotor_Full') else 0.12 if nm.startswith('Obmotka') else 0.75)); continue
    if nm.startswith(('turbina', 'hull_dwn004')):   # thân tua-bin: tách vành đai bánh xe (quay), cánh hướng nước, trục cánh
        rest = []
        for x in loose(o):
            V, r, nf = info(x); z0, z1 = V[:, 2].min(), V[:, 2].max()
            if z1 <= 2.4 and z0 >= 1.0 and r.max() <= 3.05 and r.min() >= 1.3 and nf > 300: band.append(x)
            elif z0 >= 3.3 and z1 <= 4.5 and r.min() >= 3.0 and r.max() <= 4.2 and nf < 200: vanes.append(x)
            else:
                if z0 >= 4.35 and z1 <= 5.85 and r.min() >= 3.3 and r.max() <= 3.9 and nf < 100: stems.append(V[:, :2].mean(0))
                if np.linalg.norm(V.max(0) - V.min(0)) < 0.3: bpy.data.objects.remove(x, do_unlink=True); continue   # bu-lông, chốt nhỏ (< 0,3 m): giảm lưới mạnh thành cục méo
                rest.append(x)
        parts['stat'].append((join(rest, nm.split('_')[0] + '_rest'), 0.5)); continue
    ratio = 0.2
    if nm.startswith('Stator_obmotki'): ratio = 0.17
    if nm.startswith('Vtulka'): ratio = 0.15
    parts['stat'].append((o, ratio))
print('BAND', len(band), 'VANES', len(vanes), 'STEMS', len(stems))
for b in band: parts['rotor'].append((b, 0.3))
# cánh mẫu: mảnh có nhiều tam giác nhất trong nhóm cánh hướng nước (cánh nguyên, không bị mặt cắt chia đôi); trục xoay = tâm trục cánh gần nhất
vanes.sort(key=lambda x: -len(x.data.polygons)); tv = vanes[0]
V, r, nf = info(tv); vc = V[:, :2].mean(0); vang = math.atan2(vc[1], vc[0])
st = min(stems, key=lambda s: abs(((math.atan2(s[1], s[0]) - vang + math.pi) % (2 * math.pi)) - math.pi))
pivot = (float(st[0]), float(st[1]))
print('VANE tris', nf, 'centre', vc, 'pivot', pivot, 'pivot r', math.hypot(*pivot), 'pivot angle', math.degrees(math.atan2(pivot[1], pivot[0])))
for x in vanes[1:]: bpy.data.objects.remove(x, do_unlink=True)
parts['vane'].append((tv, 1.0))

dg = bpy.context.evaluated_depsgraph_get()
imgs = {}
def tex(mat):   # ảnh màu gốc (numpy, sRGB 0..1) + hệ số màu
    if mat.name in imgs: return imgs[mat.name]
    bsdf = next((n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED'), None); im, fac = None, (1, 1, 1)
    if bsdf:
        inp = bsdf.inputs['Base Color']; fac = tuple(inp.default_value[:3])
        node = inp.links[0].from_node if inp.is_linked else None
        while node and node.type != 'TEX_IMAGE':
            nxt = [l.from_node for s in node.inputs for l in s.links]; node = nxt[0] if nxt else None
        if node and node.image:
            w, h = node.image.size; px = np.empty(w * h * 4, np.float32); node.image.pixels.foreach_get(px); im = px.reshape(h, w, 4)[..., :3]
            if node.image.colorspace_settings.name != 'sRGB': im = np.where(im <= 0.0031308, im * 12.92, 1.055 * np.power(im, 1 / 2.4) - 0.055)
    imgs[mat.name] = (im, fac); return imgs[mat.name]
lin = lambda c: np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
res = {}
for part, objs in parts.items():
    P, N, C, I = [], [], [], []
    for o, ratio in objs:
        if o is None: continue
        if ratio < 1:
            md = o.modifiers.new('pl', 'DECIMATE'); md.decimate_type = 'DISSOLVE'; md.angle_limit = math.radians(1.0)
            mt = o.modifiers.new('tri', 'TRIANGULATE')
            md2 = o.modifiers.new('dec', 'DECIMATE'); md2.decimate_type = 'COLLAPSE'; md2.use_collapse_triangulate = True
            # tỉ lệ collapse tính trên số tam giác sau khi gộp mặt phẳng: đích = tỉ lệ × số tam giác gốc
            n0 = sum(len(p.vertices) - 2 for p in o.data.polygons); dg.update()
            ev = o.evaluated_get(dg); n1 = sum(len(p.vertices) - 2 for p in ev.data.polygons); md2.ratio = min(1.0, ratio * n0 / max(1, n1))
        else:
            o.modifiers.new('tri', 'TRIANGULATE')
        dg.update(); ev = o.evaluated_get(dg); me = ev.to_mesh()
        me.set_sharp_from_angle(angle=math.radians(35)); me.calc_loop_triangles()
        cn = me.corner_normals; uvl = me.uv_layers[0].data if me.uv_layers else None
        key = {}; base = len(P)
        for lt in me.loop_triangles:
            mat = o.material_slots[lt.material_index].material if o.material_slots else None
            col = np.array((0.6, 0.6, 0.6))
            if mat:
                im, fac = tex(mat); col = np.array(fac)
                if im is not None and uvl:
                    u = sum(uvl[li].uv[0] for li in lt.loops) / 3; v = sum(uvl[li].uv[1] for li in lt.loops) / 3
                    h, w = im.shape[:2]; col = im[int(min(h - 1, max(0, (v % 1) * h))), int(min(w - 1, max(0, (u % 1) * w)))] * np.array(fac)
            cl = tuple(np.round(lin(np.clip(col, 0, 1)) * 255).astype(int))
            for li in lt.loops:
                vi = me.loops[li].vertex_index; n = cn[li].vector
                k = (vi, round(n.x, 2), round(n.y, 2), round(n.z, 2), cl)
                if k not in key:
                    key[k] = len(P) - base; p = me.vertices[vi].co
                    P.append((p.x, p.z, -p.y)); N.append((n.x, n.z, -n.y)); C.append(cl)
                I.append(base + key[k])
        print('PART', part, o.name, 'tris', len(me.loop_triangles))
        ev.to_mesh_clear()
    res[part + '_P'] = np.array(P, np.float32); res[part + '_N'] = np.array(N, np.float32); res[part + '_C'] = np.array(C, np.uint8); res[part + '_I'] = np.array(I, np.uint32)
    print('TOTAL', part, 'verts', len(P), 'tris', len(I) // 3)
# trục xoay cánh (hệ glTF: x, −y_Blender)
res['pivot'] = np.array([pivot[0], -pivot[1]], np.float32)
np.savez(out, **res)
