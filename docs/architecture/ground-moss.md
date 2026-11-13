# Mặt đất: cỏ, rêu, nấm, đá

<!-- toc -->
- Mã · 0.9 KB
- Cỏ · 0.6 KB
- Rêu · 0.9 KB
- Nấm · 0.4 KB
- Bẫy · 1.7 KB
<!-- /toc -->

## Mã

- `nature/meadow.js`: cỏ mềm, thảm ngắn `LAWNS`, khảm cao / thấp `patchK`, bãi phân `DUNG`, LOD
- `nature/moss-lawn.js`: `mossCrevice` (ảnh 3D hốc khuất `SF_CV`), `mossLawn` (lá rêu), `mossTick`
- `core/surface-style.js`: rêu chung `SF_MOSS` (`sfMossCu`, `sfMossT`), `mossCoat(mat, key, o)`, `mossBladeSrc`; chân tường `SF_WALLMO` (`sfWallMo`); đập `sfOldMo`
- `nature/bank-moss.js`: rêu vách bờ dương xỉ, tường đầu cửa xả, đá hộc · `nature/dam-moss.js`: vật liệu đập riêng
- `nature/old-tree.js` `stoneRing`: 3 đá hộc quanh gốc cổ thụ (`aRk`; `oldTreeStones` = vòng ôm cho rễ)
- `nature/fungi.js`: nấm (`src/models/fungi.bin` ← `src/tools/fungi/`), `fungi.glow` · `nature/grass-scatter.js`: hoa, cuối tệp `buildVegPool`
- `nature/ferns.js` (sau `world/storm-drain.js`): dương xỉ vách bờ, lá rời rải như cỏ; mẫu `src/tools/fern/`

## Cỏ

- Cỏ mềm 45 % ô đất (ngưỡng phân vị); không mọc nền san phẳng (`padH`) trừ thảm ngắn
- `LAWNS`: độ tươi +2 trong `aCell.z` (shader `lawn = step(1.5, aCell.z)`); nền nhuộm `_lawnTint` (lá ngắn cùng màu nền ⇒ zoom thường không thấy)
- `patchK` nhân chiều cao ô + màu nền ⇒ khảm vẫn thấy khi lá ẩn theo LOD
- Rải cỏ / hoa theo toạ độ tay ⇒ mọc xuyên vật nằm ⇒ mọi chỗ rải `nature/grass-scatter.js` qua `deadLogOut(x, z, lề)` (trục `deadLog` từ ma trận nhóm gỗ, `nature/forest.js`); cụm mới gần vật nằm: làm tương tự.

## Rêu

- Lá rêu = lá thảm cỏ ngắn; nguồn: lưới rêu mặt trên (`sfTop` / `sfOld`, ≤ 3,2 m trên đất), tường `sfK` 1–4 (dải 2 m sát đất), đập (`sfOldMo`, trên mặt nước theo `sfWater`), đá `userData.rockMoss` (`aRk`), `mossBladeSrc`
- Lượng rêu tại gốc lá tính 1 lần lúc dựng trên GPU (Points → `readRenderTargetPixels`), giữ lá chỗ có rêu
- Ô 16 m (cắt theo khung nhìn); ẩn / thưa theo zoom như cỏ (`mossTick`); bóng trời tính sẵn `aSk` (trees-wind.md)
- `mossCoat`: `o.mo` lượng rêu, `o.sq` toạ độ đệm, `o.tint` màu thêm trước rêu; `fwidth` toạ độ đệm tính NGOÀI nhánh
- Rêu công trình > 1 điểm ảnh ở zoom thường (~0,3–0,6 m / điểm ảnh): dải chân tường 10–85 cm
- Không rêu mái / mặt trên công trình, mặt đường đập (`concreteDark`); đập dùng bản sao `concreteMat` riêng

## Nấm

- 3 InstancedMesh (nấm giá, nấm đỏ, cụm nấm nâu) đặt bằng tia dò lúc dựng, trước mem-trim; ma trận = chỗ đặt × `mesh.matrix`
- `computeBoundingSphere()` sau `setMatrixAt` (không ⇒ bị cắt khỏi khung nhìn)
- `fungi.glow(nightFactor, t)` mỗi khung: emissive + quầng cho cụm nấm nâu, nấm giá; nấm đỏ không

## Bẫy

- Lá rêu dùng `aMk`, không `aBk` (`core/mem-trim.js` coi `aBk` = lưới vỏ, bỏ mảng CPU)
- moss-lawn.js: 2 khối dựng trả về hàm (`tick`, hàm lấy mẫu hốc) ⇒ mảng dựng nào có hàm con nhắc tới đều sống suốt phiên. Cuối khối xoá tay: danh sách ứng viên + lá giữ lại `R / Nn / Bk / Q / KR / KN / KM / KQ` `.length = 0` (≈ 100 MB JS heap), `mossCrevice` `S = Q = D = T = null` (≈ 20 MB); hàm lấy mẫu hốc đọc ảnh 3D ô 16 cm. Thêm mảng dựng mới ⇒ thêm vào dòng xoá
- Thuộc tính từng lá (`aRoot`, `aNrm`, `aMr`, `aMo`, `aSk`): 2 lớp bóng trời ghi xong (`skDone`) ⇒ `onUpload(freeAfterUpload)`; ô chưa từng vẽ còn giữ mảng (≈ 8 MB cả 39 ô, 242 118 lá). Đọc lại trên CPU sau đó = null. Mất ngữ cảnh GPU sau khi đã bỏ ⇒ lá rêu ẩn tới khi mở lại trang (`lost`)
- Lượng rêu viết 2 nơi cùng `SF_NOISE`: `sfMo` shader vỏ + lượt GPU moss-lawn.js ⇒ sửa cả hai; không tính CPU (nhiễu băm sin lệch GPU)
- Lá vách bờ, đá đọc cùng bản đồ / `aRk` với màu: đổi màu rêu ⇒ đổi nguồn lá
- Nguồn lá, nấm, cỏ mới: RNG riêng, thêm SAU nguồn hiện có (như 8181, 8282, `lrnd`, `drnd`; cỏ ven đường `mulberry32(2610)`, `2611`) ⇒ vị trí cũ giữ
- `sfMoss` > 1 (rễ 1,35) ⇒ hệ số `mix` màu rêu kẹp ≤ 1
- Đá hộc gốc cổ thụ `noBake`, `noBatch` (giữ `aRk` cho lá rêu)
- `addGrassTuft` chỉ nhận trước `buildVegPool` ⇒ fungi.js trước grass-scatter.js; bank-moss.js sau ferns.js (`ferns.P`, `stormDrain.rip`)
- Dương xỉ: `colorMask` không ghi alpha canvas (mép alpha-to-coverage thủng nền trang)
