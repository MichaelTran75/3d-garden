# Vẽ, hiệu năng, RAM, bóng, chất liệu

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.4 KB
- Vẽ và hiệu năng · 1.0 KB
- RAM · 0.5 KB
- Chất liệu công trình + vỏ cây · 0.4 KB
- Bóng góc nướng sẵn · 0.9 KB
- Khu trại render thật · 0.5 KB
- Bẫy · 2.7 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã

- `core/boot.js` — renderer, `pxCap()`.
- `core/draw-batch.js` — gộp lượt vẽ (`batchDraws`, `batchClear`, `batchCtlState`).
- `core/mem-trim.js` — `memTrim()`.
- `loop/close-up.js` — `adaptResolution`, `smallShadow`.
- `core/surface-style.js` — `surfaceStyle()`.
- `core/ao-bake.js` — `aoBake()`, dùng ở `van/interior/caravan.js`, `camp/realism.js`.
- `van/interior/env-map.js` — ảnh môi trường xe.

## Vẽ và hiệu năng

- Gộp vẽ: mảnh cùng kiểu vật liệu → 1 `SkinnedMesh` (mảnh = 1 xương, màu vào màu đỉnh); mảnh gốc vẫn là vật thật, nằm lớp ẩn 31.
- Không gộp: trong suốt (trừ mảnh phẳng 1 vật — `batchClear`), phát sáng, `onBeforeCompile` riêng, Sprite, Instanced, `layers.mask ≠ 1`, `userData.noBatch`. Đổi màu / độ mờ / version vật liệu / hình lúc chạy ⇒ mảnh tự tách.
- Xin lô: `worldJoin('drawBatch', thứ tự, B => B.draws(tên, gốc))`; còn lại vào lô "Cảnh tĩnh".
- Lớp: 0 cảnh · 2 nền trời đêm · 29 lớp nét (lens.md) · 31 mảnh gốc đã gộp.
- `adaptResolution`: khung > 22 ms suốt 1,5 s ⇒ mật độ điểm ảnh ×0,85, < 17,8 ms suốt 4 s ⇒ ×1,1 (≤ `pxCap()`); hạ mà không nhanh hơn ⇒ trả lại. Trang thử: `window.__resLock = true`.
- Bóng dương xỉ, nấm (`smallShadow`): `fitSunShadow` bật khi khung bóng ≤ 92,8 đv, tắt khi > 104; chỉ đổi `castShadow`.

## RAM

- `pxCap(w, h)` = min(DPR, 1,6, √(`PX_MAX` / điểm CSS)), `PX_MAX` = 2048 × 1080; dùng lúc tạo, trong `resize()` (ui/xray-lifecycle.js) và `adaptResolution`.
- `memTrim()` 1 lần khi `COL.ready`, trừ xe van: lưới vỏ cây (`aBk`) bỏ mảng sau khi lên GPU, Chọn bằng `mtRaycast`; canvas tĩnh (≥ 64 × 64, `version` ≤ 1) thu về 1 × 1 (`mtCanvasFree`), vẽ lại thì tự trả cỡ.
- Bảng cỏ (nature/meadow.js) dạng CSR; điểm lá (`leafPts`) là Float32Array x, y, z liền.

## Chất liệu công trình + vỏ cây

- `surfaceStyle(mat, kind)` nối vào `onBeforeCompile`: shader thủ tục theo toạ độ thế giới, chân tường tối theo độ cao trên đất (ảnh độ cao từ `cowY`) ⇒ dùng chung nhiều nhà.
- Vỏ cây (`bark`) đọc thuộc tính `aBk` (`taperTube`, `barkTubes`, `bkAttr`); nhiễu quanh thân tuần hoàn (`sfNw`) ⇒ không lộ đường may.

## Bóng góc nướng sẵn

- `aoBake(gốc, opt)` xếp hàng, chạy sau khi vẽ ≤ `AO_MS` ms / khung; tuỳ chọn, cách tính, hằng `AO_*`: chú thích đầu tệp.
- Mảnh trong lô: `userData.aoGeo` ⇒ `batchAoRefresh` dựng lại lô (màu đỉnh × hệ số sáng). Mảnh tự vẽ chỉ khi mọi lưới cùng vật liệu đều được nướng (`userData.aoOwn`).
- `skip` chỉ bỏ mảnh nhận, vẫn chắn (vỏ xe); mặt trong suốt mờ không chắn. Mất ngữ cảnh ⇒ tự nướng lại.
- Xe: `vanFrameTick` gọi 1 lần (lần đầu xem xuyên hoặc zoom ≥ ×8 gần xe), hộp `VAN_AO_BOX`.
- Ảnh môi trường xe: toàn cảnh 64 × 32 tính bằng JS → PMREM → 1 render target dùng chung, `vanEnvTick()` nướng lại vào CÙNG target; kim loại dùng `vanMetal()` / `VAN_CHROME`, sắt sơn mờ giữ `metalMat`.

## Khu trại render thật

- `CAMP_AO`: 3 cụm, nướng lần đầu nhìn cận (zoom ≥ ×8, cách cụm < 14 đv) sau khi mẫu tải; mặt đất cũng chắn (`ground`).
- `floor` → tấm phủ bóng góc mặt đất (`groundContact.drape`) + cỏ tối (`meadow.shade`), thông số `CAMP_FLOOR`; đêm nhạt theo `nightFactor`, cụm lửa trại tắt hẳn. `campNoAo` (lòng bếp, đèn lồng) không nhận.
- Đồ hay mang đi (xô, cần câu, máy cắt cỏ) không vào cụm.

## Bẫy

- Vật mang đi / đổi cha lúc chạy (que cá, camp/grill.js) → `userData.noBatch = true`.
- Đừng bật / tắt bóng bằng `material.needsUpdate` (tách mảnh khỏi lô) — đổi `castShadow`.
- uuid của three ăn `Math.random` (cả vật liệu độ sâu khi có `map` + `alphaTest`) ⇒ đồ three mới làm lệch dãy ngẫu nhiên của cảnh ⇒ tạo trong dãy riêng (`aoRnd`, `venvRnd`), đổi vật liệu 1 : 1 tại chỗ.
- `smallShadow`: vật mới vẫn đổ bóng 1 khung đầu (`warm`) ⇒ vật liệu độ sâu biên dịch lúc mở trang, dãy ngẫu nhiên không lệch.
- Lượt bóng công cụ đo gán cho nature/grass-scatter.js là cây rừng (vòng `buildVegPool`); cỏ, hoa, rêu vốn không đổ bóng.
- Vật ẩn lúc dựng không được `compileAsync` biên dịch sẵn.
- GitHub Pages không có COOP/COEP ⇒ không SharedArrayBuffer; worker chuyển giao ArrayBuffer.
- Lưới dùng chung mảng với lưới vỏ đã trim (viền chọn thân táo già) ⇒ có lại ngữ cảnh phải ẩn, không thì lỗi `byteLength` dừng trang.
- Canvas đã thu vẫn báo `width / height` gốc; trạng thái context chụp LÚC TRẢ cỡ, không lúc thu. Canvas vẽ lại liên tục: `userData.live` trên texture.
- Lưới vỏ đã trim ⇒ `aoVox` bỏ qua; cần chắn thì `aoVoxNow` lúc dựng cảnh (`opt.occ`).
- surfaceStyle: shader gió THAY `project_vertex` ⇒ chèn ở `fog_vertex`; `windShader` GHI ĐÈ onBeforeCompile ⇒ gọi `surfaceStyle` SAU; khoá chương trình nối vào khoá sẵn có (`|sf`).
- Bóng góc: tầm / độ đậm lớn ⇒ sàn xám đều; sai số chẻ cố định ⇒ thừa đỉnh ⇒ sai số / √ độ chói, không chẻ mặt úp, mặt khuất, vật liệu tối.
- envMap phải có TỪ LÚC TẠO (gán sau ⇒ biên dịch lại, lô đẩy mảnh ra). Nửa dưới ảnh môi trường phải sáng, trung tính: kim loại đứng soi sàn (sàn nâu ⇒ inox thành đồng thau).
- Gỗ bóng bằng MeshStandard điện môi ⇒ sáng gấp đôi (ánh môi trường cộng hemi + amb); cần lớp phủ bóng riêng.
- Khu trại: `groundContact.add` ⇒ vệt rộng tối đều, mất tương phản nắng; k / cỏ tối quá tay ⇒ quầng đen quanh đá, vệt đen sau ghế câu. Bóng góc không chắn ánh lửa ⇒ đêm nhạt tấm phủ.
- Cỏ quanh trại là thảm cỏ meadow.js, KHÔNG phải `vegPools.blade`.
- Dò bóng góc (docs/ao-probe/, camp-probe/): đo xe thì chặn trại (`CAMP_AO.forEach(C => C.asked = true)`), đo trại thì `vanAoAsked = true`.

## Số đo chuẩn

- Khung vẽ ≈ điểm ảnh × ~36 B (MSAA 4×) ⇒ ~80 MB ở trần `PX_MAX`.
- gzip ≤ `BUDGET_KB` (build.py dừng nếu vượt).
