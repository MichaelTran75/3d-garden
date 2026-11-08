// Giá htmlTextTick lúc đứng yên (300 lần), zoom từng khung (co giãn ảnh cũ, chưa vẽ lại: cỡ vẽ dw ≠ cỡ hiện sw), 2 khung sau khi dừng (vẽ lại đúng cỡ),
// số ô DOM, và nút "Nhãn" tắt ⇒ các nhãn ẩn (bong bóng kỹ sư nằm ngoài labelGroup: vẫn hiện như cũ).
const d = __dbg, cam = d.camera, wait = ms => new Promise(r => setTimeout(r, ms)), step = async n => { for (let i = 0; i < n; i++) { await wait(50); d.frames(1); } };
const out = {}, HT = __ev('HT'), tick = __ev('htmlTextTick');
for (let i = 0; i < 30; i++) d.frames(1);
const E = __ev('engObj').g.position; d.view(E.x, E.y + 1, E.z, 0.75, 0.95, 22); __ev('viewTick(0)'); await step(12);
let t0 = performance.now(); for (let i = 0; i < 300; i++) tick(); out.tickIdleMs = +((performance.now() - t0) / 300).toFixed(4);
const draws = () => HT.list.filter(e => e.o && e.o.on).map(e => [e.sp.name.slice(0, 22), Math.round(e.dw), Math.round(e.o.sw), e.o.c.width]);
t0 = performance.now(); let z = 22; for (let i = 0; i < 20; i++) { z *= 1.03; cam.zoom = z; cam.updateProjectionMatrix(); d.frames(1); } out.zoomFrameMs = +((performance.now() - t0) / 20).toFixed(2);
out.during = draws();
d.frames(2); out.after = draws();
out.sprites = HT.list.length; out.domBoxes = document.querySelectorAll('.html-text > div').length;
__ev('labelGroup').visible = false; d.frames(1); out.labelsOff = HT.list.filter(e => e.o && e.o.on).map(e => e.sp.name.slice(0, 30));
__ev('labelGroup').visible = true; d.frames(1);
return out;
