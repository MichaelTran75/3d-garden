// thời gian tính sẵn bóng trời cho lá rêu (moss-lawn skyOnLayer): chạy lại lượt lớp A + B đồng bộ (chép mảng, trả lại sau), đếm lượt nhường + ms; số lá trong 2 hộp
simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, dom = R.domElement, S = __dbg.scene, shots = [], out = {}, H = +window.__hourOverride;
R.setPixelRatio(1); runFor(3, H); __ev('lensRender = dt => renderer.render(scene, camera)'); __ev('vanAoAsked = true');
for (const o of S.children) if (o.isSprite) o.visible = false;
await new Promise(r => setTimeout(r, 50));
const isNew = __ev('typeof OT_SHADE !== "undefined"'); out.isNew = isNew;
const T = S.getObjectByName('Cây cổ thụ (Old Tree)'), P = T.getWorldPosition(new THREE.Vector3()), gy = __ev(`cowY(${P.x}, ${P.z})`);
__dbg.view(P.x, gy + 0.5, P.z, Math.PI * 0.27, 0.9, 16);
const orig = R.render; let f = 0; R.render = () => {};
try { while (f < 900) { __dbg.frames(1); f++; if (isNew ? (__ev('SKY.stat') && __ev('SKY_U.uSkB.value') && !__ev('AOB.job') && !__ev('AOB.q.length') && !__ev('SKY.pre.length + SKY.pend.length') && f >= 25) : f >= 25) break; } } finally { R.render = orig; }
out.frames = f; await new Promise(r => setTimeout(r, 1700)); __dbg.frames(2);
if (!isNew) return { isNew };
const ML = __ev('mossLawn'), geos = ML.meshes.map(m => m.geometry); geos.forEach(g => { g.userData.skB = 0; });
const S2 = __ev('SKY'), bak = geos.map(g => g.attributes.aSk.array.slice());
for (const id of ['A', 'B']) {   // lớp A nhân dồn vào x ⇒ chép lại mảng rồi trả về sau khi đo
  geos.forEach(g => { g.userData['sk' + id] = 0; }); const t0 = performance.now(), g = S2.cb[0](id); let n = 0; if (g) while (!g.next().done) n++;
  out['ms' + id] = +(performance.now() - t0).toFixed(1); out['yields' + id] = n; }
geos.forEach((g, i) => { g.attributes.aSk.array.set(bak[i]); g.attributes.aSk.needsUpdate = true; });
let inA = 0, inB = 0, blades = 0; for (const geo of geos) { const D = geo.attributes.aSk.array; blades += geo.attributes.aSk.count; for (let j = 0; j < D.length; j += 2) { if (D[j] < 255) inA++; if (D[j + 1] < 255) inB++; } }
out.blades = blades; out.shadedA = inA; out.shadedB = inB; out.cb = S2.cb.length; out.err = R.getContext().getError(); return out;
