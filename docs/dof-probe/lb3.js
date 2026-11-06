// ống kính: thời gian lệnh vẽ (render + readPixels đồng bộ) — lensRender vs renderer.render ở sa bàn ×6 / ×24 và bám kỹ sư ×30
simSetup(); const LENS = __ev('LENS'), R = __dbg.renderer, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), out = {};
runFor(3, +window.__hourOverride);
const tp = __ev('appleTrees')[2].position, p = new Uint8Array(4);
const T = (f, n) => { f(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); const t0 = performance.now(); for (let i = 0; i < n; i++) { f(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); } return +((performance.now() - t0) / n).toFixed(2); };
const meas = nm => { const a = [], b = []; for (let k = 0; k < 3; k++) { a.push(T(() => lr(0), 25)); b.push(T(() => R.render(sc, cam), 25)); } a.sort((x, y) => x - y); b.sort((x, y) => x - y); out[nm] = { lens: a[1], plain: b[1], d: +(a[1] - b[1]).toFixed(2), s: +LENS.s.toFixed(2) }; };
for (const z of [6, 24]) { __dbg.view(tp.x, tp.y + 1, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(120); meas('z' + z); }
__ev('camFollow(ENGINEER.object, 30, { exact: true })'); __dbg.frames(160); meas('f30');
out.err = gl.getError(); return out;
