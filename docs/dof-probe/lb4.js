// ống kính: thời gian lệnh vẽ, xen kẽ bật / tắt 8 lần × 20 khung trong CÙNG một lần tải (trung vị từng phía + trung vị hiệu từng cặp) — sa bàn ×6 / ×24 / ×30, bám kỹ sư ×30
simSetup(); const LENS = __ev('LENS'), R = __dbg.renderer, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), out = {};
runFor(3, +window.__hourOverride);
const tp = __ev('appleTrees')[2].position, p = new Uint8Array(4), md = a => { const b = [...a].sort((x, y) => x - y); return +b[b.length >> 1].toFixed(2); };
const T = (f, n) => { f(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); const t0 = performance.now(); for (let i = 0; i < n; i++) { f(); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, p); } return (performance.now() - t0) / n; };
const meas = nm => { const a = [], b = [], d = []; for (let k = 0; k < 8; k++) { const x = T(() => lr(0), 20), y = T(() => R.render(sc, cam), 20); a.push(x); b.push(y); d.push(x - y); } out[nm] = { lens: md(a), plain: md(b), d: md(d) }; };
for (const z of [6, 24, 30]) { __dbg.view(tp.x, tp.y + 1, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(120); meas('z' + z); }
__ev('camFollow(ENGINEER.object, 30, { exact: true })'); __dbg.frames(160); meas('f30');
out.err = gl.getError(); return out;
