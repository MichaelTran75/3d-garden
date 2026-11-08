// mờ theo độ sâu (cột điện phía trước rõ hơn cây phía sau): ảnh bật / tắt + bản đồ vòng nhoè (alpha LENS.ha, đỏ = sau tiêu cự, xanh = trước)
// ở góc cột 1 đứng trước cây anh đào (×6 / ×12 / ×24, điểm nhìn ở độ cao 5 m như lúc kéo màn hình thật), góc cây táo ×3 / ×12 / ×30 (cũng 5 m) + bám kỹ sư ×30
simSetup(); const THREE = __ev('THREE'), LENS = __ev('LENS'), lnU = __ev('lnU'), R = __dbg.renderer, dom = R.domElement, gl = R.getContext(), sc = __ev('scene'), cam = __ev('camera'), lr = __ev('lensRender'), shots = [], out = {};
runFor(3, +window.__hourOverride || 11);
const find = n => { let r = null; sc.traverse(o => { if (!r && o.name && o.name.startsWith(n)) r = o; }); return r; };
const pole = find('Cột điện #1'), cherry = find('Cây anh đào'), at = __ev('appleTrees'), tp = at[2].position, dir = new THREE.Vector3(), px = new Uint8Array(4);
const hide = () => sc.traverse(o => { if (o.isSprite && o.visible) o.visible = false; });
const cocPng = nm => { const rt = LENS.ha, w = rt.width, h = rt.height, p = new Uint8Array(w * h * 4); R.readRenderTargetPixels(rt, 0, 0, w, h, p);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'), im = x.createImageData(w, h), cm = lnU.uCm ? lnU.uCm.value : lnU.uMax.value, sc8 = cm / 16;   // thang chung: 16 px vòng nhoè = đậm hẳn
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) { const s = ((h - 1 - y) * w + i) * 4, d = (y * w + i) * 4, v = Math.max(-1, Math.min(1, (p[s + 3] / 255 - 0.5) * 2 * sc8));
    im.data[d] = v > 0 ? 255 : 255 * (1 + v); im.data[d + 1] = 255 * (1 - Math.abs(v)); im.data[d + 2] = v < 0 ? 255 : 255 * (1 - v); im.data[d + 3] = 255; }
  x.putImageData(im, 0, 0); shots.push([nm, c.toDataURL('image/png')]); };
const scr = p => { const v = p.clone().project(cam); return [+((v.x + 1) / 2 * 100).toFixed(1), +((1 - v.y) / 2 * 100).toFixed(1)]; };
const dep = p => +(p.clone().sub(cam.position).dot(cam.getWorldDirection(dir))).toFixed(2);
const shoot = nm => {
  hide(); lr(0); shots.push([nm + '_on.png', dom.toDataURL('image/png')]); cocPng(nm + '_coc.png'); R.render(sc, cam); shots.push([nm + '_off.png', dom.toDataURL('image/png')]);
  let af = null; if (LENS.fa) { R.readRenderTargetPixels(LENS.fa, 0, 0, 1, 1, px); const d = 255 / 256 * (px[0] / 255 / 16777216 + px[1] / 255 / 65536 + px[2] / 255 / 256 + px[3] / 255); af = lnU.uHs ? +((d - 0.5) * 2 * lnU.uHs.value).toFixed(2) : +(cam.near + d * (cam.far - cam.near)).toFixed(2); }
  out[nm] = { zoom: cam.zoom, s: +LENS.s.toFixed(2), m: +LENS.m.toFixed(2), rg: +lnU.uRg.value.toFixed(2), mx: +lnU.uMax.value.toFixed(2), hT: lnU.uHt ? +lnU.uHt.value.toFixed(2) : null, afRel: af,
    poleBase: scr(pole.position), poleTop: scr(pole.position.clone().setY(pole.position.y + 12)), cherry: scr(cherry.position), dPole: dep(pole.position), dPoleTop: dep(pole.position.clone().setY(pole.position.y + 12)), dCherry: dep(cherry.position.clone().setY(cherry.position.y + 5)) };
};
for (const [nm, z] of [['p6', 6], ['p12', 12], ['p24', 24]]) { __dbg.view(pole.position.x, 5, pole.position.z, -1.82, 0.9, z); __dbg.frames(150); shoot(nm); }
for (const [nm, z] of [['a3', 3], ['a12', 12], ['a30', 30]]) { __dbg.view(tp.x, 5, tp.z, Math.PI * 0.27, 0.9, z); __dbg.frames(150); shoot(nm); }
__ev('camFollow(ENGINEER.object, 30, { exact: true })'); __dbg.frames(170); shoot('f30');
out.err = gl.getError(); out.shots = shots; return out;
