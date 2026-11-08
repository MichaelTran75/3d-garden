// góc lb1.js (điểm nhìn nâng lên gốc cây táo + 1 m) ×24 / ×30: ảnh bật + bản đồ vòng nhoè như pt2.js ⇒ xem vì sao lb-prof đo diện tích mờ giảm ở góc này
simSetup(); const LENS = __ev('LENS'), lnU = __ev('lnU'), R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), shots = [], out = {};
runFor(3, +window.__hourOverride || 11);
const tp = __ev('appleTrees')[2].position, px = new Uint8Array(4);
const cocPng = nm => { const rt = LENS.ha, w = rt.width, h = rt.height, p = new Uint8Array(w * h * 4); R.readRenderTargetPixels(rt, 0, 0, w, h, p);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), im = x.createImageData(w, h), cm = lnU.uCm ? lnU.uCm.value : lnU.uMax.value, sc8 = cm / 16;
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const s = ((h - 1 - y) * w + i) * 4, d = (y * w + i) * 4, v = Math.max(-1, Math.min(1, (p[s + 3] / 255 - 0.5) * 2 * sc8));
    im.data[d] = v > 0 ? 255 : 255 * (1 + v); im.data[d + 1] = 255 * (1 - Math.abs(v)); im.data[d + 2] = v < 0 ? 255 : 255 * (1 - v); im.data[d + 3] = 255; }
  x.putImageData(im, 0, 0); shots.push([nm, c.toDataURL('image/png')]); };
for (const z of [24, 30]) { __dbg.view(tp.x, tp.y + 1, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(120); sc.traverse(o => { if (o.isSprite && o.visible) o.visible = false; });
  lr(0); shots.push([`z${z}_on.png`, dom.toDataURL('image/png')]); cocPng(`z${z}_coc.png`);
  let af = null; if (LENS.fa && lnU.uHs) { R.readRenderTargetPixels(LENS.fa, 0, 0, 1, 1, px); const d = 255 / 256 * (px[0] / 255 / 16777216 + px[1] / 255 / 65536 + px[2] / 255 / 256 + px[3] / 255); af = +((d - 0.5) * 2 * lnU.uHs.value).toFixed(2); }
  out['z' + z] = { rg: +lnU.uRg.value.toFixed(2), afRel: af }; }
out.err = gl.getError(); out.shots = shots; return out;
