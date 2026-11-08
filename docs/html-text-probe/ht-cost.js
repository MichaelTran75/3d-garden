// Giá vẽ lại từng ô chữ ở góc kỹ sư (×22, ×30): [zoom, tên, cỡ canvas, ms có tone, ms bỏ tone, ms chỉ đọc + ghi điểm ảnh], rồi giá 1 khung "zoom vừa dừng"
// (mọi ô vẽ lại, tối đa HT_REDRAW). Bỏ tone đo ~0 vì canvas GPU vẽ trễ — số thật của ô tone là cột đầu.
const d = __dbg, cam = d.camera, wait = ms => new Promise(r => setTimeout(r, ms)), step = async n => { for (let i = 0; i < n; i++) { await wait(50); d.frames(1); } };
const out = { st: [] }, HT = __ev('HT'), draw = __ev('htDraw');
for (let i = 0; i < 30; i++) d.frames(1);
const E = __ev('engObj').g.position;
for (const z of [22, 30]) {
  d.view(E.x, E.y + 1, E.z, 0.75, 0.95, z); __ev('viewTick(0)'); cam.updateMatrixWorld(true); await step(20);
  const vis = HT.list.filter(e => e.o && e.o.on);
  for (const e of vis) {
    const t0 = performance.now(); for (let k = 0; k < 5; k++) draw(e, e.dw, e.dh); const t1 = performance.now();
    const tn = e.tone; e.tone = false; for (let k = 0; k < 5; k++) draw(e, e.dw, e.dh); const t2 = performance.now(); e.tone = tn;
    for (let k = 0; k < 5; k++) { const im = e.o.x.getImageData(0, 0, e.o.c.width, e.o.c.height); e.o.x.putImageData(im, 0, 0); } const t3 = performance.now();
    out.st.push([z, e.sp.name, e.o.c.width + 'x' + e.o.c.height, +((t1 - t0) / 5).toFixed(2), +((t2 - t1) / 5).toFixed(2), +((t3 - t2) / 5).toFixed(2)]);
  }
  for (const e of vis) e.dw += 5; const t0 = performance.now(); HT.still = 1; HT.zoom = cam.zoom; __ev('htmlTextTick()'); out.st.push([z, 'khung zoom dừng (ms)', +(performance.now() - t0).toFixed(2)]);
}
return out;
