# Vẽ, hiệu năng, RAM, bóng, chất liệu

<!-- toc -->
- Mã · 0.4 KB
- Vẽ và hiệu năng · 0.9 KB
- RAM · 0.7 KB
- Chất liệu · 0.4 KB
- Bóng góc nướng sẵn · 1.2 KB
- Khu trại render thật · 0.7 KB
- Bẫy · 1.0 KB
<!-- /toc -->

## Mã

- `core/boot.js`: renderer, `pxCap()`
- `core/draw-batch.js`: gộp vẽ `batchDraws`, `batchClear`, `batchCtlState`
- `core/mem-trim.js`: `memTrim()`
- `loop/close-up.js`: `adaptResolution`, `smallShadow`
- `core/surface-style.js`: `surfaceStyle()`
- `core/ao-bake.js`: `aoBake()` ← `van/interior/caravan.js`, `camp/realism.js`
- `van/interior/env-map.js`: ảnh môi trường xe

## Vẽ và hiệu năng

- Gộp: cùng kiểu vật liệu → 1 `SkinnedMesh`; mảnh gốc vẫn là vật thật
- Không gộp: trong suốt (trừ mảnh phẳng 1 vật: `batchClear`), phát sáng, `onBeforeCompile` riêng, Sprite, Instanced, `layers.mask ≠ 1`, `userData.noBatch`
- Lúc chạy đổi màu / độ mờ / version vật liệu / hình ⇒ mảnh tự tách
- Xin lô: `worldJoin('drawBatch', thứ tự, B => B.draws(tên, gốc))`; còn lại → "Cảnh tĩnh"
- Lớp: 0 cảnh · 2 trời đêm · 29 nét (lens.md) · 31 mảnh gốc đã gộp
- `adaptResolution`: > 22 ms suốt 1,5 s ⇒ DPR ×0,85; < 17,8 ms suốt 4 s ⇒ ×1,1 (≤ `pxCap()`); hạ không nhanh hơn ⇒ trả; trang thử: `window.__resLock = true`
- `smallShadow` (dương xỉ, nấm): bật khi khung `fitSunShadow` ≤ 92,8 đv, tắt > 104; chỉ đổi `castShadow`
- gzip ≤ `BUDGET_KB` (build.py dừng)

## RAM

- `pxCap(w, h)` = min(DPR, 1,6, √(`PX_MAX` / điểm CSS)), `PX_MAX` = 2048 × 1080 ← lúc tạo, `resize()` (ui/xray-lifecycle.js), `adaptResolution`
- Khung vẽ ≈ điểm ảnh × ~36 B (MSAA 4×) ⇒ ~80 MB ở `PX_MAX`
- `memTrim()` 1 lần khi `COL.ready`, trừ xe van: lưới vỏ `aBk` bỏ mảng sau khi lên GPU (Chọn: `mtRaycast`); canvas tĩnh (≥ 64 × 64, `version` ≤ 1) → 1 × 1 (`mtCanvasFree`)
- Canvas đã thu: vẽ lại ⇒ tự trả cỡ; vẫn báo `width / height` gốc; trạng thái context chụp LÚC TRẢ; vẽ liên tục ⇒ `userData.live` trên texture
- Bảng cỏ (nature/meadow.js) CSR; `leafPts` Float32Array x, y, z liền

## Chất liệu

- `surfaceStyle(mat, kind)` nối `onBeforeCompile`: thủ tục theo toạ độ thế giới; chân tường tối theo độ cao trên đất (ảnh độ cao `cowY`)
- Chèn ở `fog_vertex` (shader gió THAY `project_vertex`); gọi SAU `windShader`; khoá chương trình nối `|sf`
- Vỏ `bark` đọc `aBk` (`taperTube`, `barkTubes`, `bkAttr`); nhiễu quanh thân tuần hoàn `sfNw`

## Bóng góc nướng sẵn

- `aoBake(gốc, opt)` xếp hàng, chạy sau vẽ ≤ `AO_MS` ms / khung; opt, cách tính, `AO_*`: đầu tệp
- Mảnh trong lô: `userData.aoGeo` → `batchAoRefresh` dựng lại lô; mảnh tự vẽ chỉ khi mọi lưới cùng vật liệu đều nướng (`userData.aoOwn`)
- `skip`: bỏ nhận, vẫn chắn; trong suốt không chắn; mất ngữ cảnh ⇒ tự nướng lại
- Lưới vỏ đã trim: `aoVox` bỏ qua ⇒ cần chắn thì `aoVoxNow` lúc dựng (`opt.occ`)
- Tầm / độ đậm lớn ⇒ sàn xám đều
- Chẻ: sai số / √ độ chói; không chẻ mặt úp, mặt khuất, vật liệu tối
- Xe: `vanFrameTick` gọi 1 lần (lần đầu xem xuyên / zoom ≥ ×8 gần xe), hộp `VAN_AO_BOX`
- Ảnh môi trường xe: toàn cảnh 64 × 32 → PMREM → 1 render target chung; `vanEnvTick()` nướng lại vào CÙNG target
- envMap phải có TỪ LÚC TẠO (gán sau ⇒ biên dịch lại, tách lô); nửa dưới ảnh môi trường sáng, trung tính
- Kim loại `vanMetal()` / `VAN_CHROME`; sắt sơn mờ giữ `metalMat`; gỗ bóng MeshStandard điện môi ⇒ sáng ×2 ⇒ cần lớp phủ bóng riêng

## Khu trại render thật

- `CAMP_AO`: 3 cụm, nướng lần đầu nhìn cận (zoom ≥ ×8, cách cụm < 14 đv) sau khi mẫu tải; mặt đất cũng chắn (`ground`)
- `floor` → tấm phủ `groundContact.drape` + cỏ tối `meadow.shade`, thông số `CAMP_FLOOR`; đêm nhạt theo `nightFactor`, cụm lửa trại tắt hẳn
- `campNoAo` (lòng bếp, đèn lồng) không nhận; đồ hay mang đi (xô, cần câu, máy cắt cỏ) ngoài cụm
- Không dùng `groundContact.add` (tối đều); k / cỏ tối quá tay ⇒ quầng đen quanh đá
- Cỏ quanh trại = thảm meadow.js, KHÔNG `vegPools.blade`
- Dò (docs/ao-probe/, camp-probe/): đo xe ⇒ chặn trại `CAMP_AO.forEach(C => C.asked = true)`; đo trại ⇒ `vanAoAsked = true`

## Bẫy

- Vật mang đi / đổi cha / biến dạng lúc chạy (que cá) → `userData.noBatch = true` (còn trong lô ⇒ mất khi lô bị loại theo khung nhìn)
- Bật / tắt bóng: đổi `castShadow`, không `material.needsUpdate` (tách khỏi lô)
- uuid three ăn `Math.random` (cả vật liệu độ sâu có `map` + `alphaTest`) ⇒ đồ three mới tạo trong dãy riêng (`aoRnd`, `venvRnd`), thay vật liệu 1 : 1 tại chỗ
- `smallShadow`: vật mới đổ bóng khung đầu (`warm`) ⇒ vật liệu độ sâu biên dịch lúc mở trang
- Công cụ đo gán lượt bóng cây rừng (`buildVegPool`) cho nature/grass-scatter.js; cỏ, hoa, rêu không đổ bóng
- Vật ẩn lúc dựng: `compileAsync` không biên dịch sẵn
- GitHub Pages không COOP/COEP ⇒ không SharedArrayBuffer; worker chuyển giao ArrayBuffer
- Lưới chung mảng với lưới vỏ đã trim (viền chọn táo già): có lại ngữ cảnh phải ẩn, không ⇒ lỗi `byteLength` dừng trang
