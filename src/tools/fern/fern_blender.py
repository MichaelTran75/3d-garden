# Blender (nền): nạp mẫu dương xỉ, bỏ thân rễ, giảm lưới lá (Decimate collapse), xuất đỉnh / pháp tuyến / UV / chỉ số theo hệ glTF (Y lên) ra .npz
import bpy, sys, numpy as np
argv = sys.argv[sys.argv.index('--') + 1:]
src, out, ratio = argv[0], argv[1], float(argv[2])
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=src)
dg = bpy.context.evaluated_depsgraph_get()
res = {}
for ob in list(bpy.context.scene.objects):
    if ob.type != 'MESH': continue
    if 'root' in ob.name.lower(): continue
    md = ob.modifiers.new('dec', 'DECIMATE'); md.decimate_type = 'COLLAPSE'; md.ratio = ratio; md.use_collapse_triangulate = True
    dg.update(); ev = ob.evaluated_get(dg); me = ev.to_mesh(); me.calc_loop_triangles()
    M = ob.matrix_world; R = M.to_3x3().inverted().transposed()
    uvl = me.uv_layers[0].data
    key, P, N, UV, I = {}, [], [], [], []
    for lt in me.loop_triangles:
        for li in lt.loops:
            v = me.loops[li].vertex_index; u = uvl[li].uv; k = (v, round(u[0], 5), round(u[1], 5))
            if k not in key:
                key[k] = len(P); p = M @ me.vertices[v].co; n = (R @ me.loops[li].normal).normalized()
                P.append((p.x, p.z, -p.y)); N.append((n.x, n.z, -n.y)); UV.append((u[0], 1.0 - u[1]))   # Blender Z lên → glTF Y lên · UV Blender lật v
            I.append(key[k])
    nm = ob.name.split('_')[-2]
    res[nm + '_P'] = np.array(P, np.float32); res[nm + '_N'] = np.array(N, np.float32); res[nm + '_UV'] = np.array(UV, np.float32); res[nm + '_I'] = np.array(I, np.uint32)
    print('MESH', ob.name, nm, 'verts', len(P), 'tris', len(I) // 3)
    ev.to_mesh_clear()
np.savez(out, **res)
