// đo thái hành: lưỡi dao (cạnh dưới, 21 điểm) so với mọi đỉnh lưới bàn tay trái; mũi / gót lưỡi so với mặt thớt; chụp ảnh
const d = __dbg, T = d.THREE, e = d.engObj, ev = __ev, TAG = window.__TAG || 'chop', SH = window.__shotDir + '/';
simSetup();
ev(`(() => { const e = engObj; engForceAct = 'lunch'; engSpawn(e, 'lunch'); const V = e.van; e.seat = null; e.seatCtl = null;
  V.node = 'board'; V.station = 'stove'; V.idx = 0; V.plan = ['stove']; V.recipe = 'udon'; V.T = 900; V.chopped = false; V.st = 'boardFace'; V.k = 0;
  e.g.position.set(VN.board.x, VAN_FLOOR - ENG_FEET, VN.board.z); e.g.rotation.set(0, VY.pz, 0); if (e.pose) { e.pose.rawPos.copy(e.g.position); e.pose.pos.copy(e.g.position); e.pose.rawYaw = e.pose.yaw = VY.pz; e.pose.pv = [0, 0, 0]; e.pose.yv = 0; } })()`);
const R = d.renderer, orig = R.render, P = e.props, K = ev('VKIT'), rows = [], shots = [];
const blade = P.knife.children[1], WP = ev('engWristParts');
const handVerts = (W) => { const out = []; const h = WP(W).hand || W; h.updateMatrixWorld(true); h.traverse(o => { if (o.isMesh && o.geometry && o.visible) { const p = o.geometry.attributes.position; for (let i = 0; i < p.count; i += 1) out.push(new T.Vector3().fromBufferAttribute(p, i).applyMatrix4(o.matrixWorld)); } }); return out; };
const edge = () => { const pts = []; for (let i = 0; i <= 20; i++) pts.push(new T.Vector3(0, -0.03, -0.1 + 0.2 * i / 20).applyMatrix4(blade.matrixWorld)); return pts; };
const bladeAll = () => { const pts = []; for (let i = 0; i <= 20; i++) for (const y of [-0.03, 0, 0.03]) pts.push(new T.Vector3(0, y, -0.1 + 0.2 * i / 20).applyMatrix4(blade.matrixWorld)); return pts; };
const kl = p => K.toLocal ? K.toLocal(p.clone()) : p;
let Hm = null, t0 = null, shotI = 0; const snapAt = window.__SNAP || [3, 20, 38];
const shoot = (name, VV) => { d.scene.updateMatrixWorld(true); const c = blade.getWorldPosition(new T.Vector3()); const ax = ev('engAxesW')(e), fv = ax.f.clone().multiplyScalar(VV[0]).addScaledVector(ax.r, VV[1]), th = Math.atan2(fv.z, fv.x); const cam = d.camera, fw = cam.right - cam.left; d.view(c.x, c.y, c.z, th, VV[2], fw / (0.6 * Hm)); R.render = orig; shots.push([SH + TAG + '-' + name + '.png', d.snap(ev('radius') - 1.0)]); R.render = () => {}; };
d.xray(true);
runFor(46, 12.6, tt => {
  const V = e.van; if (!V) return; d.scene.updateMatrixWorld(true);
  if (Hm === null) { const h = e.head.getWorldPosition(new T.Vector3()).y, a = Math.min(e.ankles[0].getWorldPosition(new T.Vector3()).y, e.ankles[1].getWorldPosition(new T.Vector3()).y); Hm = (h - a) * 1.12; }
  if (V.st !== 'chop') { rows.push({ st: V.st }); return; }
  if (t0 === null) t0 = tt; const k = tt - t0;
  const HV = handVerts(e.wrists[1]), BE = bladeAll(), EG = edge();
  let dmin = 1e9, pen = 0; for (const b of BE) for (const h of HV) { const dd = b.distanceTo(h); if (dd < dmin) dmin = dd; }
  // dao "cắt vào" tay: điểm cạnh lưỡi thấp hơn đỉnh lưới tay gần nó (theo phương ngang 2 cm)
  for (const b of EG) for (const h of HV) if (Math.hypot(b.x - h.x, b.z - h.z) < 0.02 && b.y < h.y) pen = Math.max(pen, h.y - b.y);
  const lo = Math.min(...EG.map(p => p.y)), top = ev('VKIT.TOP') + 0.022 + ev('VAN_FLOOR') * 0;
  const tip = EG[20], heel = EG[0], hr = (WP(e.wrists[0]).hand || e.wrists[0]).getWorldPosition(new T.Vector3()), hl = (WP(e.wrists[1]).hand || e.wrists[1]).getWorldPosition(new T.Vector3());
  rows.push({ st: 'chop', k, dmin, pen, lo, tip, heel, hr, hl });
  if (shotI < snapAt.length && k >= snapAt[shotI]) { for (const [n, VV] of [['C', [-0.9, -0.35, 0.95]], ['D', [-0.35, 0.9, 0.7]], ['E', [-0.6, 0, 0.35]]]) shoot('k' + snapAt[shotI] + n, VV); shotI++; }
});
R.render = orig;
const m = 1.75 / Hm, C = rows.filter(r => r.st === 'chop' && r.k > 1), cm = x => +(x * m * 100).toFixed(1);
const q = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; };
const out = { H: +Hm.toFixed(3), frames: C.length, states: [...new Set(rows.map(r => r.st))] };
out.bladeToLeftHand_cm = { min: cm(q(C.map(r => r.dmin), 0)), p05: cm(q(C.map(r => r.dmin), .05)), p50: cm(q(C.map(r => r.dmin), .5)) };
out.framesBladeInsideHand = C.filter(r => r.dmin < 0.004 / m).length;   // dưới 4 mm người thật
out.framesEdgeOverHandBelowTop = C.filter(r => r.pen > 0).length;
// theo thời gian: mỗi 4 s
out.byTime = []; for (let s = 1; s < 41; s += 4) { const W = C.filter(r => r.k >= s && r.k < s + 4); if (W.length) out.byTime.push([s, cm(Math.min(...W.map(r => r.dmin))), W.filter(r => r.dmin < 0.004 / m).length + '/' + W.length]); }
const top = ev('VKIT.TOP') + 0.022; out.edgeLowest_above_board_cm = { min: cm(q(C.map(r => r.lo - top), 0)), p50: cm(q(C.map(r => r.lo - top), .5)) };
const r5 = C[Math.floor(C.length / 2)]; out.sample = { tip: r5.tip.toArray().map(v => +v.toFixed(3)), heel: r5.heel.toArray().map(v => +v.toFixed(3)), hr: r5.hr.toArray().map(v => +v.toFixed(3)), hl: r5.hl.toArray().map(v => +v.toFixed(3)) };
out.shots = shots; return out;
