# Vẽ, hiệu năng, RAM, bóng, chất liệu

<!-- toc -->
- Mã · 0.6 KB
- Vẽ và hiệu năng · 0.9 KB
- RAM · 2.2 KB
- Chất liệu · 1.0 KB
- Ánh sáng phòng kín · 3.6 KB
- Bóng góc nướng sẵn · 1.2 KB
- Khí quyển · 1.0 KB
- Bóng góc màn hình · 1.3 KB
- Khu trại render thật · 0.7 KB
- Bẫy · 1.8 KB
<!-- /toc -->

## Mã

- `core/boot.js`: renderer, `pxCap()`
- `core/draw-batch.js`: gộp vẽ `batchDraws`, `batchClear`, `batchCtlState`
- `core/mem-trim.js`: `memTrim()`
- `loop/close-up.js`: `adaptResolution`, `smallShadow`
- `core/surface-style.js`: `surfaceStyle()`
- `core/ao-bake.js`: `aoBake()` ← `van/interior/caravan.js`, `camp/realism.js`
- `core/atmosphere.js`: `ATM` (`p` thông số, `k` đầu dò), `atmTick()` ← loop/main-loop-rest.js
- `core/ao-screen.js`: `AO`, `aoRun()`, `aoWeight()`, `AO_MARK` ← `lensRender` (core/lens.js)
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
- `memTrim()` 1 lần khi `COL.ready` + `groundContact.idle()` (cắt lát bóng tiếp đất đọc mảng đỉnh vỏ cây; trim trước ⇒ `getX` trên mảng null, hàng đợi bóng đứng), trừ xe van: lưới vỏ `aBk` bỏ mảng sau khi lên GPU (Chọn: `mtRaycast`); canvas tĩnh (≥ 64 × 64, `version` ≤ 1) → 1 × 1 (`mtCanvasFree`)
- Canvas đã thu: vẽ lại ⇒ tự trả cỡ; vẫn báo `width / height` gốc; trạng thái context chụp LÚC TRẢ; vẽ liên tục ⇒ `userData.live` trên texture
- Bảng cỏ (nature/meadow.js) CSR; `leafPts` Float32Array x, y, z liền
- Số RAM (khung 1512 × 860 DPR 2, trưa, sau GC; đo `docs/ram-probe`): JS heap 62 MB, ArrayBuffer 105 MB; GL bộ đệm 70 + ảnh 67 + độ sâu bóng 16 MB. Còn giữ trên CPU, lớn nhất: ma trận + màu mặt địa hình 12,3 MB (169 267 mặt × 76 B; Chọn + dựng lại cần), mảng theo ô lưới 12 MB, dương xỉ 10,8 MB, lá rêu 8,2 MB tới khi vẽ, bảng cỏ 7 + lá cỏ 5,9 MB, canvas chưa thu 11,8 MB. Bản đồ bóng 2048² = 16 MB màu + 16 MB độ sâu
- Bẫy RAM: khối dựng `(() => { … return { tick } })()` giữ mọi biến có hàm con nhắc tới (1 ngữ cảnh chung, kể cả hàm con đã hết dùng) ⇒ mảng dựng lớn phải `length = 0` / `= null` trước `return` (ground-moss.md); lấy mẫu heap chỉ ra dòng cấp phát
- Địa hình theo diện tích: cột 0,6 m, 408 × 368 cột kể lề `MX` / `MZ`, vẽ bằng mặt lộ (87 InstancedMesh, không vào lô gộp) ≈ 25 MB CPU + 12–15 MB GPU cho diện tích hiện tại, chưa kể cỏ / cây / rêu đặt lên. Bóng nắng phủ ±116 m ⇒ 11,3 cm / điểm ở góc nhìn xa; đất rộng hơn ⇒ thưa hơn, hoặc 4096² (+96 MB). `cx = GX / 2`: đổi `GX` / `GZ` ⇒ `wx(i)` của cùng chỉ số dời, chỗ neo bằng chỉ số ô (core/terrain.js) lệch chỗ neo bằng toạ độ

## Chất liệu

- `surfaceStyle(mat, kind)` nối `onBeforeCompile`: thủ tục theo toạ độ thế giới; chân tường tối theo độ cao trên đất (ảnh độ cao `cowY`)
- Chèn ở `fog_vertex` (shader gió THAY `project_vertex`); gọi SAU `windShader`; khoá chương trình nối `|sf`
- Vỏ `bark` đọc `aBk` (`taperTube`, `barkTubes`, `bkAttr`); nhiễu quanh thân tuần hoàn `sfNw`
- Gồ vỏ: `sfBumpG(n, sp, g)` nhận gradient màn hình của độ cao; `sfBump(n, sp, h)` = `sfBumpG` với `dFdx / dFdy(h)`. Vỏ táo: khe nứt (bậc cao gắt) lấy gradient giải tích `sfHd` (`sfApple(…, out g)` + `sfSd` đạo hàm smoothstep, đổi sang màn hình bằng `dFdx / dFdy` của toạ độ vỏ, mịn); phần độ cao mịn `sfHg` vẫn `dFdx`. Thêm lớp độ cao gắt ⇒ cộng gradient vào `sfHd`, không đưa vào `sfHg`
- Bẫy: chuỗi GLSL dùng chung không kết thúc bằng chú thích `//` (`mossCoat` nối `o.fHead` cùng dòng ⇒ khai báo bị nuốt, lỗi biên dịch)

## Ánh sáng phòng kín

- `core/room-light.js`: `roomLitMat(mat, kiểu)` nối `onBeforeCompile`; bộ gộp (`buildBatchMesh`) gắn cho mọi vật liệu lô có sáng ⇒ cả cảnh mang đoạn mã, ngoài hộp phòng mặt nạ `vlIn` = 0, không đổi gì
- Chủ phòng đặt `ROOM_LIT.glsl` (`vlIn(q)` hộp phòng, `vlOpen(q, n)` độ hở ra trời), `uVlInv` (thế giới → hệ phòng, mỗi khung), `uVlLamp`, `uVlK.y` (đèn 0–1). Hiện 1 phòng: lòng xe (`van/interior/van-light.js`)
- Ngày: sáng trời / nền trong phòng × `uVlK.x` (0,6), về 1 theo `vlOpen` (cửa sổ, cửa lùa, kính lái). Đêm: ánh hắt ấm từ `uVlLamp`, giảm theo khoảng cách + hướng mặt, cộng vào sáng gián tiếp
- Vân thủ tục theo toạ độ phòng, `userData.vk` của vật liệu gốc: 1 gỗ, 2 sàn ván (mặt ngang; mặt đứng = gỗ), 3 vải, 4 gạch. `vk` nằm trong khoá gộp `batchMatKey` ⇒ lô riêng. Vân mờ dần theo `fwidth` (`vlFade`) ⇒ xa không lấm tấm
- Vân gỗ `VLIT_KIND[1]`: 1,8 × `vlWood` − 0,8. Biên độ chỉnh ở zoom thường (chỉ thấy khi cận ⇒ vô ích); đổi ⇒ đo lại nhấp nháy
- Vật tự vẽ (`noBatch`, bản nhiều cạnh `lodHi`, kỹ sư): `roomLitTree(gốc | hàm trả gốc, skip, own)` xếp hàng lúc nạp; `roomLitReady()` vá 1 lần ngay trước khi dựng lô (`core/draw-batch.js`). Vật liệu chỉ mang bản vá phòng (`roomLitPure`) vẫn gộp được. Vật liệu còn dùng ở mảnh ngoài phòng ⇒ vá bản chép, mảnh ngoài giữ gốc. Bỏ: trong suốt, tự sáng, PBR lẻ (`vlPlain`)
- Xe: `roomLitTree(caravanObj, bỏ vỏ + mặt trong + mảnh ngoài hộp, vanOwnDrawn)`, `vanOwnShadow()` bật `receiveShadow` cho đồ tự vẽ trong hộp. Kỹ sư: `roomLitTree(() => engObj.g)`; `vanLightTick` bật `receiveShadow` khi kỹ sư trong `vanRoomBox`, ra ngoài trả giá trị cũ (`userData.rsOut`)
- Đo (góc xuyên vỏ, 10 h / 20 h, tắt ống kính): chương trình 199 (không vá đồ tự vẽ + người: 189), lượt vẽ 674 (693: vật liệu chỉ mang bản vá phòng nay gộp được), khung 10,8–10,9 ms nhanh nhất (11,2; trung vị dao động 12–16 theo máy), nhấp nháy trượt 1 px cùng lô 0,48 / 0,24 / 5,84 / 0,13 ‰ (0,50 / 0,24 / 5,86 / 0,13)
- Bẫy: `core/` không gọi tên của xe (build chặn chỗ dính) ⇒ phần riêng xe ở `van-light.js`; `room-light.js` đứng trước `van-light.js` trong manifest (`const ROOM_LIT`, TDZ)
- Bẫy: vá sau khi lô dựng ⇒ `version` vật liệu đổi ⇒ lô tách mảnh; vật nạp sau (GLB sách, tạp chí) ⇒ `roomLitMat` lúc tạo. Vật liệu `onBeforeCompile` riêng cần `roomLitMat` lúc tạo (vách phòng tắm đã có). Chó, vật nuôi khác chưa nhận
- Bẫy: sổ đã vá = WeakMap `_vlOwn`, không cờ `userData` (`clone()` chép `userData`, không chép `onBeforeCompile`). `_vlWait` khai `var` không gán: tệp đứng trước `room-light.js` trong manifest vẫn gọi `roomLitTree` được
- Bẫy: bật `receiveShadow` cho kỹ sư mọi lúc ⇒ ngoài trời thêm lượt lấy bóng + đổi hình; chỉ bật trong hộp phòng
- Bẫy: gốc thân kỹ sư lúc ngồi bàn ≈ 0,37 (dưới sàn 0,83, dưới đáy hộp 0,6) ⇒ thử hộp cho kỹ sư nâng y lên 0,7, chỉ chặn dưới 0,15; thử thẳng `vanRoomBox(gốc)` ⇒ ngồi không bao giờ nhận bóng
- Bẫy: `clone()` mất `onBeforeCompile` ⇒ vá sau khi clone; khoá chương trình nối `|vl<kiểu>`

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

## Khí quyển

- Ánh trời: `ATM.probe` (LightProbe SH9) = trời mô hình − (hemi + amb); mặt ngửa sáng như cũ, chỉ đổi màu + hướng (về phía mặt trời ấm, ngược xanh, mặt úp nhận đất hắt); chiếu lại khi đèn trời đổi (~0,05 ms)
- Không `scene.environment`: cảnh chủ yếu Lambert; bóng trời dưới tán (`skyShadeMat`) nhân luôn phần probe
- Sương thấp: thay mảnh `fog_*` của three; mật độ mũ theo độ cao trên `lakeY` (`mist` / m, bề dày `mistH`), tích phân dọc tia trực giao; giờ (đọng từ tối, dày nhất rạng sáng, tan 7–9,5 h) × độ ẩm thật; dày nhất: mặt sông ~23 %, sườn +2 m ~5 %, cao nguyên ~1 %
- Màu sương: mặt trắng `mistA` dưới ánh trời + `mistSun` × nắng → ACES trên CPU (`atmAces`) → sRGB (sương trộn sau tone map)
- Sương xa (near / far cũ) ấm thêm về phía mặt trời thấp (`haze`)
- Đo (vẽ + chờ GPU, 1979 × 1117): ≈ 0 ms

## Bóng góc màn hình

- TẮT mặc định (`AO.k` = 0 ⇒ không lượt, không RAM): camera trượt ⇒ cỏ, lá, thân mảnh, nét viền nhấp nháy. Đo dời camera 1 px / khung (‰ điểm lệch > 6/255, ống kính bật): cỏ ×10 1,3 → 5,3, táo già ×14 2,6 → 8,7, xe ×20 2,1 → 3,7. Bật lại cần tích luỹ theo thời gian (chiếu lại khung trước + kẹp lân cận)
- GTAO nửa phân giải trên độ sâu khung tạm của ống kính (lens.md): 2 lát × 6 bước, Bayer 4 × 4, mờ 4 × 4 giữ mép, phóng theo độ sâu
- Chỉ khi ống kính bật: độ mạnh `AO.k` × min(bán kính 6 → 12 px, `LENS.s`) ⇒ hiện dần ×2 → ×3; nhìn gần thẳng xuống (ống kính tắt) không có
- Chỉ che ánh gián tiếp: trọng số = ánh trời / (ánh trời + nắng), nắng từ bản đồ bóng đèn chính + N·L ⇒ đất giữa nắng tối ít, bóng râm / đêm đủ; sương phía trước, sương xa ⇒ mờ dần
- Cỏ meadow: lượt (1) `AO_MARK` = 1 ⇒ lá ghi độ cao trên đất vào alpha; (0) cộng độ cao / sin góc cúi vào khoảng cách ⇒ lá không che, nhận AO của đất
- Đo: +0,2–0,7 ms khi ống kính bật, 0 khi tắt; RAM +3,5 MB (`hz` R32F + `ha`, `hb`)

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
- Sương: uniform chung là đối tượng thường `{x, y, z, w}` (cloneUniforms giữ tham chiếu ⇒ 1 lần ghi / khung); ShaderMaterial tự khai `fogColor` (trăng, mây) không có uniform mới ⇒ sương cũ
- AO + MSAA: alpha gộp trung bình 4 mẫu, độ sâu lấy 1 mẫu ⇒ mép lá hạ sai, cỏ loang lổ ⇒ (0) ô 2 × 2 có điểm alpha = 1 thì chỉ dùng điểm đó, cả 4 có lá thì điểm alpha thấp nhất
- Vật liệu đục ghi alpha < 1 vào khung tạm ⇒ AO coi là lá (quét `AO_MARK` = 0: 0 điểm); vẽ thẳng ra màn hình phải `AO_MARK` = 0
- Vẽ cỏ ở lượt riêng sau ảnh độ sâu ⇒ cỏ đè tán cây bán trong suốt; vẽ qua khung tạm chỉ để AO ⇒ +4 ms ở ×1,5
