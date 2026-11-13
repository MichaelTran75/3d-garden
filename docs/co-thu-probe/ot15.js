simSetup(); const THREE = __dbg.THREE, R = __dbg.renderer, S = __dbg.scene, shots = [], out = {}, H = +window.__hourOverride;
out.pre = __ev(`(() => { const g = oldTreeGroup, mb = g.userData.mainBranches, o = {}; g.updateMatrixWorld(true);
  o.hive = hiveWorldPos.toArray().map(q => +q.toFixed(2)); o.nmb = mb.length;
  o.bf = butterflies.map((bf, k) => { const br = mb[1 + (k % 4)], f = 0.3 + 0.35 * ((k / 4) | 0) + 0.1 * (k % 2), sf = f * (br.length - 1), i0 = Math.min(br.length - 2, Math.floor(sf));
    const P = br[i0].clone().lerp(br[i0 + 1], sf - i0).applyMatrix4(g.matrixWorld); return [Math.abs(bf.perch.y - (P.y + 0.35)) < 1e-3 ? 'MISS' : 'hit', +(bf.perch.y - P.y).toFixed(2), +Math.hypot(bf.perch.x - P.x, bf.perch.z - P.z).toFixed(2)]; });
  return o; })()`);
wxLock({ raining: true, thunder: false, windSpeed: 2 });
runFor(CFG_T(), H); for (const o of S.children) if (o.isSprite) o.visible = false;
function CFG_T() { return (window.__otCfg && window.__otCfg.t) || 260; }
out.storks = __ev(`(() => { const g = oldTreeGroup, L = g.userData.leafPts, v = new THREE.Vector3(); g.updateMatrixWorld(true);
  return storksGroup.children.map(m => { const p = m.position; let n = 0, near = 9; for (let i = 0; i < L.length; i += 3) { v.set(L[i], L[i + 1], L[i + 2]).applyMatrix4(g.matrixWorld); const h = Math.hypot(v.x - p.x, v.z - p.z), dy = v.y - p.y; if (h < 0.5 && Math.abs(dy) < 1) n++; const d = Math.hypot(h, dy); if (d < near) near = d; }
    return { p: p.toArray().map(q => +q.toFixed(2)), leavesIn: n, nearLeaf: +near.toFixed(2) }; }); })()`);
const orig = R.render; let f = 0; R.render = () => {};
try { while (f < 400) { __dbg.frames(1); f++; if (f >= 25 && __ev('SKY.stat') && !__ev('AOB.job') && !__ev('AOB.q.length') && !__ev('SKY.pre.length + SKY.pend.length')) break; } } finally { R.render = orig; }
await new Promise(r => setTimeout(r, 1000)); window.__hourOverride = H; __dbg.frames(2);
for (const [n, th, ph, z] of [['st_a', 0.8, 1.2, 26], ['st_b', 0.8 + Math.PI / 2, 1.25, 26], ['st_c', 0.8 + Math.PI, 1.15, 26], ['st_top', 0.8, 0.5, 22]]) { __dbg.view(-39.5, 11.3, 7.9, th, ph, z); __dbg.frames(1); shots.push([n + '.png', __dbg.snap()]); }
return { shots, out };
