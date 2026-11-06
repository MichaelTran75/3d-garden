// cường độ mờ thang 0–100 % (100 % = trần cũ 3,2 % chiều cao khung = 2 × LENS_MAX 0,016): đọc vòng nhoè có dấu từ LENS.ha (nửa phân giải)
// ra mỗi góc: trung bình, p95, lớn nhất, % diện tích theo nấc 0 / 0–25 / 25–50 / 50–75 / 75–100 + ảnh bật/tắt
simSetup(); const LENS = __ev('LENS'), lnU = __ev('lnU'), R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), shots = [], out = {};
runFor(3, +window.__hourOverride || 11);
const find = n => { let r = null; sc.traverse(o => { if (!r && o.name && o.name.startsWith(n)) r = o; }); return r; };
const pole = find('Cột điện #1'), tp = __ev('appleTrees')[2].position;
const hide = () => sc.traverse(o => { if (o.isSprite && o.visible) o.visible = false; });
const stat = () => { const rt = LENS.ha, w = rt.width, h = rt.height, p = new Uint8Array(w * h * 4); R.readRenderTargetPixels(rt, 0, 0, w, h, p);
  const ref = 0.032 * LENS.h, cm = lnU.uCm.value, v = new Float32Array(w * h), bins = [0, 0, 0, 0, 0]; let sum = 0;
  for (let i = 0; i < w * h; i++) { const c = Math.abs((p[i * 4 + 3] / 255 - 0.5) * 2 * cm), q = Math.min(100, 100 * c / ref); v[i] = q; sum += q; bins[q < 1 ? 0 : q < 25 ? 1 : q < 50 ? 2 : q < 75 ? 3 : 4]++; }
  const s = Array.from(v).sort((a, b) => a - b), n = w * h;
  return { mean: +(sum / n).toFixed(1), p95: +s[Math.floor(n * 0.95)].toFixed(1), max: +s[n - 1].toFixed(1), bins: bins.map(b => +(100 * b / n).toFixed(1)), ref: +ref.toFixed(2), uMax: +lnU.uMax.value.toFixed(2), uCm: +cm.toFixed(2) }; };
const shoot = nm => { hide(); lr(0); shots.push([nm + '_on.png', dom.toDataURL('image/png')]); out[nm] = stat(); };
for (const [nm, z] of [['p6', 6], ['p24', 24]]) { __dbg.view(pole.position.x, 5, pole.position.z, -1.82, 0.9, z); __dbg.frames(150); shoot(nm); }
for (const [nm, z] of [['a3', 3], ['a12', 12], ['a30', 30]]) { __dbg.view(tp.x, 5, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(150); shoot(nm); }
__ev('camFollow(ENGINEER.object, 30, { exact: true })'); __dbg.frames(170); shoot('f30');
out.err = gl.getError(); out.shots = shots; return out;
