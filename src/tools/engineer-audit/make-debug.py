#!/usr/bin/env python3
# bản gỡ lỗi của "3D garden.html": make-debug.py <bản một tệp> <ra.html> — chèn window.__dbg (view, frames, engObj, clock…), window.__ev(mã) chạy trong phạm vi build(),
#  giờ cảnh theo window.__hourOverride, mẫu nạp từ /models (engineer-audit/run.cjs)
import sys, pathlib
src_path, out_path = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
src = src_path.read_text(encoding='utf-8')
anchor = "window.__info = () => renderer.info.render;"
assert src.count(anchor) == 1
hook = anchor + """
        window.__ev = (code) => eval(code);
        window.__dbg = { THREE, scene, camera, renderer, target, get wmast() { return typeof wmast === 'undefined' ? null : wmast; }, surfaceY, worldCell, wx, wz, x2gi, z2gj, X0, Z0, S, BLOCK, obstacleCoords, flightRoots,
          view(tx, ty, tz, th, ph, zoom) { target.set(tx, ty, tz); tTheta = theta = th; tPhi = phi = ph; autoRotate = false; camera.zoom = zoom; camera.updateProjectionMatrix(); },
          frames(n = 1) { suspended = false; for (let i = 0; i < n; i++) { loop(); if (frameId) { cancelAnimationFrame(frameId); frameId = 0; } } suspended = true; return renderer.info.render; },
          get engObj() { return engObj; }, get storkDef() { return storkDefinition; }, get storkParts() { return storkParts; }, get birds() { return birds; }, get clock() { return clock; }, get caravanObj() { return caravanObj; }, get dogObj() { return dogObj; },
          xray(on) { setCaravanXray(on); return caravanShell.length; },
          snap(near = 0.1) { camera.near = near; camera.updateProjectionMatrix(); camera.position.set(target.x + radius * Math.sin(phi) * Math.cos(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.sin(theta)); camera.lookAt(target); scene.updateMatrixWorld(); renderer.render(scene, camera); const url = renderer.domElement.toDataURL('image/png'); camera.near = 0.1; camera.updateProjectionMatrix(); return url; } };"""
src = src.replace('get localHour() { return localHour; }', 'get localHour() { return window.__hourOverride ?? localHour; }')
src = src.replace('get wildlifeAwake() { return localHour >= 6 && localHour < 18.5; }', 'get wildlifeAwake() { const h = window.__hourOverride ?? localHour; return h >= 6 && h < 18.5; }')
out_path.write_text(src.replace(anchor, hook), encoding='utf-8')

# mẫu nạp từ máy (server của run.cjs phục vụ /models = src/models) + mốc thời gian dựng xong (__tBuilt) cho trình chạy chờ
s = out_path.read_text(encoding='utf-8')
a = "function build(THREE, mergeGeometries) {"; assert s.count(a) == 1
models = {'__racGlb': 'raccoon.glb', '__droneGlb': 'dji-mini3.glb', '__barkTex': 'bark-scan.jpg', '__vanBin': 'transit.bin', '__engineGlb': 'engine.glb', '__trimGlb': 'trimmer.glb', '__chickGlb': 'chicken.glb',
          '__teleGlb': 'telescope.glb', '__galGlb': 'galaxy.glb', '__moonJpg': 'moon.jpg', '__mwJpg': 'milkyway.jpg', '__bhJpg': 'blackhole.jpg', '__jupJpg': 'jupiter.jpg',
          '__tlGlb': 'tinyliving.glb', '__pumpGlb': 'pump.glb', '__fungiBin': 'fungi.bin', '__chassisGlb': 'chassis.glb'}
s = s.replace(a, a + ' window.__tBuild0 = performance.now(); ' + ' '.join(f"window.{k} = window.{k} || '/models/{v}';" for k, v in models.items()), 1)
d = "        // biên dịch shader SONG SONG"; assert s.count(d) == 1
s = s.replace(d, "        window.__tBuilt = performance.now();\n" + d)
out_path.write_text(s, encoding='utf-8')
print('wrote', out_path)
