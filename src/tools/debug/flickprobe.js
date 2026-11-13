// ĐO NHẤP NHÁY KHI CAMERA TRƯỢT (đầu dò cho ev4.cjs): dời camera trực giao đúng 1 điểm ảnh / khung ⇒ ảnh đúng ra chỉ dời 1 px; so khung i với khung i − 1
// đã dời ⇒ phần chênh = nhấp nháy (xử lý khoá lưới màn hình: ảnh ½ phân giải, mẫu Bayer, ô). Cần CFG khai báo trước tệp:
//   { echo "const CFG = { views: ['van20', 'camp10'], vars: { on: {}, off: { lens: 0 } } };"; cat src/tools/debug/flickprobe.js; } > /tmp/p.js
//   SHOTS=… node src/tools/debug/ev4.cjs dbg.html src/tools/engineer-audit/harness.js 12.5 /tmp/p.js
// CFG: views (van20, camp5, camp10, over3, tree14) · vars { tên: { lens: 0 ⇒ vẽ thẳng, ao: k ⇒ AO.k } } · n khung (10) · th ngưỡng độ sáng (6/255)
//   · heat ⇒ ảnh nóng PNG (đỏ = điểm nhấp nháy ≥ 2 lần) · mode 'look' ⇒ chỉ chụp PNG mỗi biến thể · hour (12,5)
// Ra: flick = ‰ điểm ảnh lệch > th mỗi khung (trung bình), hot2 = ‰ điểm nhấp nháy ≥ 2 lần. Số tham chiếu: docs/architecture/lens.md, render.md
const E = __ev, D = __dbg, C = D.clock, R = D.renderer, gl = R.getContext(), T = E('THREE'), cam = D.camera, shots = [], out = [];
simSetup();
window.__lrOrig = window.__lrOrig || E('lensRender');
const set = v => { E('lensRender = window.__lrOrig'); E('AO').k = v && v.ao ? v.ao : 0; if (v && v.lens === 0) E('lensRender = function (dt) { renderer.render(scene, camera); }'); };
const v2 = new T.Vector2(); R.getDrawingBufferSize(v2); const W = v2.x, H = v2.y, N = CFG.n || 10, TH = CFG.th || 6;
const pf = E('pf'), van = D.caravanObj.position.clone(), A = Math.PI * 0.27;
let tree = null; try { tree = E('ft3').getWorldPosition(new T.Vector3()); } catch (e) {}
const VIEWS = { van20: [van.x, van.y + 1, van.z, A, 0.9, 20], camp5: [pf.x, pf.y, pf.z, A, 0.9, 5], camp10: [pf.x, pf.y, pf.z, A, 0.9, 10], over3: [pf.x, pf.y, pf.z, A, 0.9, 3],
  ...(tree ? { tree14: [tree.x, tree.y + 2.5, tree.z, A, 0.9, 14] } : {}) };
const lum = (p, i) => (p[i] * 54 + p[i + 1] * 183 + p[i + 2] * 19) >> 8;
window.__hourOverride = CFG.hour || 12.5;
for (const vn of (CFG.views || Object.keys(VIEWS))) {
  const b = VIEWS[vn]; if (!b) continue;
  D.view(...b); C.__dt = 1 / 20; D.frames(30); C.__dt = 1e-4;   // ổn định rồi gần như dừng thời gian (gió, con vật không đổi giữa các khung)
  const upp = (cam.right - cam.left) / cam.zoom / W, rx = new T.Vector3().setFromMatrixColumn(cam.matrixWorld, 0);
  for (const [k, v] of Object.entries(CFG.vars || { on: {}, off: { lens: 0 } })) {
    set(v); D.view(...b); D.frames(4);
    if (CFG.mode === 'look') { shots.push([`${window.__shotDir}/${CFG.tag || ''}${vn}-${k}.png`, R.domElement.toDataURL('image/png')]); continue; }
    let prev = null, dir = 0; const heat = new Uint8Array(W * H), per = [];
    for (let i = 0; i < N; i++) {
      D.view(b[0] + rx.x * upp * i, b[1] + rx.y * upp * i, b[2] + rx.z * upp * i, b[3], b[4], b[5]); D.frames(1);
      const px = new Uint8Array(W * H * 4); gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, px);
      if (prev) {
        if (!dir) { let sp = 0, sm = 0; for (let y = 8; y < H - 8; y += 7) for (let x = 8; x < W - 8; x += 5) { const i0 = (y * W + x) * 4; sp += Math.abs(lum(px, i0) - lum(prev, i0 + 4)); sm += Math.abs(lum(px, i0) - lum(prev, i0 - 4)); } dir = sp <= sm ? 1 : -1; }   // chiều dời trên ảnh
        let n = 0;
        for (let y = 4; y < H - 4; y++) for (let x = 4; x < W - 4; x++) { const j = y * W + x, i0 = j * 4; if (Math.abs(lum(px, i0) - lum(prev, i0 + 4 * dir)) > TH) { n++; if (heat[j] < 255) heat[j]++; } }
        per.push(n);
      }
      prev = px;
    }
    let hot = 0; for (let j = 0; j < W * H; j++) if (heat[j] >= 2) hot++;
    const pm = per.map(n => n / (W * H) * 1000).sort((x, y) => x - y);   // trung vị: bỏ khung lệch cả ảnh (đổi nắng / mây giữa chừng)
    out.push({ vn, k, flick: +pm[pm.length >> 1].toFixed(2), hot2: +(hot / (W * H) * 1000).toFixed(2) });
    if (CFG.heat) {
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const s = y * W + x, d = ((H - 1 - y) * W + x) * 4, g = lum(prev, s * 4) * 0.45, h = heat[s] >= 2;   // readPixels lật trục y
        im.data[d] = h ? 255 : g; im.data[d + 1] = h ? 30 : g; im.data[d + 2] = h ? 30 : g; im.data[d + 3] = 255; }
      cx.putImageData(im, 0, 0); shots.push([`${window.__shotDir}/${CFG.tag || ''}${vn}-${k}-heat.png`, cv.toDataURL('image/png')]);
    }
  }
}
set(null); C.__dt = 1 / 20;
return { shots, out, W, H };
