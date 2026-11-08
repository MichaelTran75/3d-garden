# Mặt đất: cỏ, rêu, nấm, đá

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.9 KB
- Cỏ · 0.3 KB
- Rêu · 0.6 KB
- Nấm · 0.3 KB
- Bẫy · 1.7 KB
- Ngoài mặt đất · 0.6 KB
<!-- /toc -->

## Mã

- `nature/meadow.js` — cỏ mềm, thảm ngắn `LAWNS`, khảm cao / thấp `patchK` + bãi phân `DUNG`, LOD.
- `nature/moss-lawn.js` — `mossCrevice` (ảnh 3D hốc khuất `SF_CV`), `mossLawn` (lá rêu), `mossTick`.
- `core/surface-style.js` — rêu chung `SF_MOSS` (`sfMossCu`, `sfMossT`), `mossCoat(mat, key, o)`, `mossBladeSrc`; chân tường `SF_WALLMO` (`sfWallMo`); đập `sfOldMo`.
- `nature/bank-moss.js` — bản đồ rêu vách bờ dương xỉ, tường đầu cửa xả, đá hộc. `nature/dam-moss.js` — vật liệu đập riêng.
- `nature/old-tree.js` `stoneRing` — 3 đá hộc quanh gốc cổ thụ (`aRk`, `oldTreeStones` = vòng ôm cho rễ).
- `nature/fungi.js` — nấm (`src/models/fungi.bin`, dựng ở `src/tools/fungi/`), `fungi.glow`. `nature/grass-scatter.js` — hoa, cuối tệp `buildVegPool`.

## Cỏ

- Cỏ mềm 45 % ô đất (ngưỡng phân vị), không mọc trên nền san phẳng (`padH`) trừ thảm ngắn. Thảm ngắn `LAWNS`: độ tươi +2 trong `aCell.z` (shader `lawn = step(1.5, aCell.z)`), nền nhuộm `_lawnTint`.
- `patchK` nhân chiều cao ô + màu nền ⇒ khảm vẫn thấy khi lá đã ẩn theo LOD.

## Rêu

- Lá rêu = lá thảm cỏ ngắn. Nguồn: lưới có rêu mặt trên (`sfTop` / `sfOld`, ≤ 3,2 m trên đất), tường `sfK` 1–4 (dải 2 m sát đất), đập (`sfOldMo`, trên mặt nước theo `sfWater`), đá `userData.rockMoss` (`aRk`), `mossBladeSrc`.
- Lượng rêu tại gốc lá tính 1 lần lúc dựng trên GPU (Points → `readRenderTargetPixels`), giữ lá chỗ có rêu. Chia ô 16 m (cắt theo khung nhìn); ẩn / thưa theo zoom như cỏ (`mossTick`); bóng trời tính sẵn `aSk` (trees-wind.md).
- `mossCoat`: `o.mo` lượng rêu, `o.sq` toạ độ đệm, `o.tint` màu thêm trước rêu.

## Nấm

- 3 InstancedMesh (nấm giá, nấm đỏ, cụm nấm nâu) đặt bằng tia dò lúc dựng, trước mem-trim; ma trận bản = chỗ đặt × `mesh.matrix`.
- `fungi.glow(nightFactor, t)` mỗi khung: emissive + quầng cho cụm nấm nâu, nấm giá; nấm đỏ không phát quang.

## Bẫy

- Thuộc tính lá rêu là `aMk`, đừng đặt `aBk`: `core/mem-trim.js` coi lưới có `aBk` là lưới vỏ, bỏ mảng CPU.
- Lượng rêu viết 2 nơi: `sfMo` của shader vỏ và lượt GPU trong moss-lawn.js (cùng `SF_NOISE`); sửa một thì sửa cả hai. Đừng tính trên CPU (nhiễu băm sin lệch GPU).
- Lá vách bờ, đá đọc cùng bản đồ / `aRk` với màu: đổi màu rêu thì đổi nguồn lá theo.
- Nguồn lá, nấm, cỏ mới: RNG riêng, thêm SAU nguồn hiện có (như 8181, 8282, `lrnd`, `drnd`) ⇒ vị trí hiện có giữ nguyên.
- `sfMoss` > 1 (rễ 1,35) ⇒ hệ số `mix` màu rêu phải kẹp ≤ 1.
- `mossCoat`: `fwidth` của toạ độ đệm tính NGOÀI nhánh.
- Đá hộc gốc cổ thụ `noBake`, `noBatch` để giữ `aRk` cho lá rêu.
- Lá ngắn cùng màu nền thì zoom thường không thấy: thảm phải nhuộm nền.
- Rêu công trình phải to hơn 1 điểm ảnh ở zoom thường (~0,3–0,6 m / điểm ảnh): dải chân tường cao 10–85 cm.
- Không rêu mái / mặt trên công trình, không rêu mặt đường đập (`concreteDark`); đập dùng bản sao `concreteMat` riêng.
- InstancedMesh: `computeBoundingSphere()` sau `setMatrixAt`, không thì bị cắt khỏi khung nhìn.
- Chú thích `//` để CUỐI dòng: chèn giữa dòng nuốt câu sau (mọi nấm về ma trận đơn vị, không hiện); `swallowed()` của build.py không bắt mọi ca (câu bắt đầu bằng `M[k]`).
- `addGrassTuft` chỉ nhận trước `buildVegPool` ⇒ fungi.js đứng trước grass-scatter.js; bank-moss.js đứng sau ferns.js (`ferns.P`, `stormDrain.rip`).

## Ngoài mặt đất

- Sóng radio `#rWave` (van/interior/radio.js) là hoạt cảnh tổng hợp: luồng đài khác nguồn nối vào Web Audio (AnalyserNode) bị tắt tiếng (CORS).
- Bồn cầu, kệ ấm (van/interior/tiny-living.js): mẫu tham khảo chỉ để đo, không chép lưới; hình dựng bằng khối ở `src/tools/tinyliving/` (README); bản lề nắp trước mặt két 3 cm để nắp mở 1,62 rad không xuyên két.
- Xách kính thiên văn (engineer/tasks/sky-watch.js): `telHand` trước IK, `telTick` sau IK; màn `attach` vào kính.
