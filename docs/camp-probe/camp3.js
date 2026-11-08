// khu trại trước / sau TRONG CÙNG 1 LẦN NẠP (mây, nắng giống nhau): ảnh "trước" (tắt tấm bóng tiếp đất trại, chưa nướng) → nướng đồng bộ (không chạy khung) → ảnh "sau"
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, shots = [], out = {}, H = +window.__hourOverride, tag = 'e' + H;
R.setPixelRatio(1);
runFor(3, H);
__ev('lensRender = dt => renderer.render(scene, camera)');
const S = __dbg.scene, AOB = __ev('AOB'); __ev('vanAoAsked = true');
for (const o of S.children) { if (o.isSprite) o.visible = false; if (/Cây|Tree/.test(o.name) && !/Cần câu/.test(o.name)) o.visible = false; }
const ov = S.children.filter(o => /^Bóng tiếp đất · (Lò|Bếp lửa|Ghế câu)/.test(o.name)); out.ov = ov.map(o => o.name);
const ctrOf = n => { const o = S.getObjectByName(n); return o && new THREE.Box3().setFromObject(o).getCenter(new THREE.Vector3()); };
const spots = (window.__campSpots || [['lo', 'Đống củi (Woodpile)', 70], ['ghe', 'Ghế cắm trại (Camp Chair)', 80], ['lua', 'Bếp lửa trại (Campfire)', 80], ['cau', 'Ghế câu cá (Fishing Chair)', 70], ['toan', [-55.6, 7.0, -10.0], 30]]).map(([n, w, z]) => [n, Array.isArray(w) ? new THREE.Vector3(...w) : ctrOf(w), z]);
out.st = []; const sun = S.children.find(o => o.isDirectionalLight);
const st = k => { let cs = 0; S.traverse(o => { if ((o.isMesh || o.isSkinnedMesh) && o.castShadow && o.visible) cs++; }); out.st.push([k, sun.intensity.toFixed(3), sun.shadow.camera.right.toFixed(1), sun.position.toArray().map(v => v.toFixed(1)).join(','), cs, R.info.render.calls, __ev('hemi.intensity').toFixed(3)]); };
const shoot = k => { for (const [n, p, z] of spots) { if (!p) continue; __dbg.view(p.x, p.y, p.z, Math.PI * 0.27, 0.9, z); __dbg.frames(window.__nf || 2); st(k + n); shots.push([`${tag}${k}_${n}.png`, dom.toDataURL('image/png')]); } };
for (const o of ov) o.visible = false; __dbg.frames(2); shoot('off');
__ev('for (const C of CAMP_AO) { C.go = true; campAoAsk(C); }');
const t0 = performance.now(); out.ao = [];
__ev('while (AOB.job || AOB.q.length) { if (!AOB.job) { const [r, o] = AOB.done.get(AOB.q.shift()); AOB.job = aoJob(r, o); } if (AOB.job.next().done) { AOB.job = null; window.__aoS = (window.__aoS || []).concat([{ ...AOB.stat, top: undefined }]); } }');
out.ao = window.__aoS; out.bakeMs = Math.round(performance.now() - t0); out.floor = __ev('CAMP_AO').map(C => [C.key, !!C.floorMesh, C.grass, C.floorMesh && C.floorMesh.material.map.image.width + "×" + C.floorMesh.material.map.image.height]);
for (const o of ov) o.visible = true; __dbg.frames(2); shoot('on');
out.size = [dom.width, dom.height]; out.mem = { ...R.info.memory }; out.progs = R.info.programs.length; out.err = R.getContext().getError();
out.shots = shots; return out;
