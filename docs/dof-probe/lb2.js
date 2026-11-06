// ống kính: chụp bản đồ vòng nhoè (alpha của LENS.ha — CoC có dấu) + độ phủ tiền cảnh (alpha LENS.hb) ở sa bàn ×12 / ×3 ⇒ thấy chỗ CoC nhảy (vách đất / mặt nước)
simSetup(); const LENS = __ev('LENS'), lnU = __ev('lnU'), R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), shots = [], out = {};
runFor(3, +window.__hourOverride);
const tp = __ev('appleTrees')[2].position;
const rt2png = (rt, nm, ch) => {   // kênh ch (3 = alpha) → ảnh xám; ch = -1 ⇒ RGB
  const w = rt.width, h = rt.height, px = new Uint8Array(w * h * 4); R.readRenderTargetPixels(rt, 0, 0, w, h, px);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), im = x.createImageData(w, h);
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const s = ((h - 1 - y) * w + i) * 4, d = (y * w + i) * 4;
    if (ch < 0) { im.data[d] = px[s]; im.data[d + 1] = px[s + 1]; im.data[d + 2] = px[s + 2]; } else { const v = px[s + ch]; im.data[d] = im.data[d + 1] = im.data[d + 2] = v; } im.data[d + 3] = 255; }
  x.putImageData(im, 0, 0); shots.push([nm, c.toDataURL('image/png')]);
};
for (const z of [12, 3]) {
  __dbg.view(tp.x, tp.y + 1, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(120); sc.traverse(o => { if (o.isSprite) o.visible = false; });
  lr(0); shots.push([`z${z}_on.png`, dom.toDataURL('image/png')]);
  rt2png(LENS.ha, `z${z}_coc.png`, 3); rt2png(LENS.hb, `z${z}_near.png`, 3); rt2png(LENS.hb, `z${z}_blur.png`, -1);
  out['z' + z] = { mx: lnU.uMax.value, rg: lnU.uRg.value, k: lnU.uK.value, sa: lnU.uSa.value, zf: lnU.uZf.value, nr: lnU.uNr.value, fr: lnU.uFr.value };
}
out.err = gl.getError(); out.shots = shots; return out;
