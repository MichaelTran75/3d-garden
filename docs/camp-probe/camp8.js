// đêm lửa trại: trước nướng · sau nướng (tấm phủ hiện) · sau nướng (tấm phủ ẩn) — tách phần tấm phủ với phần màu đỉnh
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, S = __dbg.scene, shots = [], out = {}, H = +window.__hourOverride;
R.setPixelRatio(1); runFor(3, H); __ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
for (const o of S.children) { if (o.isSprite) o.visible = false; if (/Cây|Tree/.test(o.name) && !/Cần câu/.test(o.name)) o.visible = false; }
const o = S.getObjectByName('Bếp lửa trại (Campfire)'), P = new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3());
const shot = k => { __dbg.view(P.x, P.y, P.z, Math.PI * 0.27, 0.9, 80); __dbg.frames(3); shots.push([`n${k}.png`, dom.toDataURL('image/png')]); };
shot('1off');
__ev('for (const C of CAMP_AO) { C.go = true; campAoAsk(C); }');
__ev('while (AOB.job || AOB.q.length) { if (!AOB.job) { const [r, o] = AOB.done.get(AOB.q.shift()); AOB.job = aoJob(r, o); } if (AOB.job.next().done) AOB.job = null; }');
shot('2on');
const CA = __ev('CAMP_AO'), fm = CA.find(C => /lửa trại/.test(C.key)).floorMesh; out.op = CA.map(C => [C.key, C.floorMesh && +C.floorMesh.material.opacity.toFixed(3)]); out.nf = __ev('nightFactor');
fm.visible = false; shot('3noov'); fm.visible = true;
out.shots = shots; return out;
