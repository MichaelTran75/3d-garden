// ống kính (core/lens.js): ảnh BẬT / TẮT cùng một khung (không chạy thêm khung giữa 2 ảnh) ở sa bàn ×3 / ×6 / ×12 / ×24 (góc 0,9) + bám kỹ sư ×30
// ⇒ lb-prof.py đo độ mờ hiệu dụng theo từng dải hàng (σ Gauss khớp năng lượng cạnh) — thấy chỗ chuyển nét → mờ có thành "đường biên" không
simSetup(); const LENS = __ev('LENS'), lnU = __ev('lnU'), R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), shots = [], out = {};
runFor(3, +window.__hourOverride);
const tp = __ev('appleTrees')[2].position, Z = (window.__lbZ || '3,6,12,24,30').split(',').map(Number);
const hide = () => sc.traverse(o => { if (o.isSprite && o.visible) o.visible = false; });   // nhãn / bong bóng (lớp nét, giống nhau ở 2 ảnh) ⇒ làm lệch số đo
const grab = nm => shots.push([nm, dom.toDataURL('image/png')]);
const pair = nm => {
  hide(); lr(0); grab(nm + '_on.png'); R.render(sc, cam); grab(nm + '_off.png');
  out[nm] = { s: +LENS.s.toFixed(3), m: +LENS.m.toFixed(3), ...(lnU.uSa ? { sa: +lnU.uSa.value.toFixed(3), sw: +lnU.uSw.value.toFixed(3) } : { hT: +lnU.uHt.value.toFixed(2) }), rg: +lnU.uRg.value.toFixed(3), k: +lnU.uK.value.toFixed(4), mx: +lnU.uMax.value.toFixed(2), zoom: +cam.zoom.toFixed(2), w: LENS.w, h: LENS.h, ...(window.__lbX ? __ev(window.__lbX) : {}) };
};
for (const z of Z) { __dbg.view(tp.x, tp.y + 1, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(120); pair('z' + z); }
if (!window.__lbNoF) { __ev('camFollow(ENGINEER.object, 30, { exact: true })'); __dbg.frames(160); pair('f30'); }
out.err = gl.getError(); out.shots = shots; return out;
