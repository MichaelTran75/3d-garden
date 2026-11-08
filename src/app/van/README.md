# Xe van

- Mọi tệp ghép 1 khối mã theo `src/app/manifest.txt` (không import/export)
- Đv xe: 1,1 đv = 1 m; mũi −X, cửa lùa +Z; cầu trước x −2,12, cầu sau x 2,03, tâm bánh y 0,44, sàn trong y 0,83 (`TR` trong `body/transit.js`)
- L4 dài 6,70 m: đuôi +`TR.ext` 0,792 đv (0,72 m) sau hốc bánh sau, chiều dài cơ sở giữ. GLB giãn lúc gắn (`l4()` trong `body/transit-glb.js`); khung gầm giãn trong `body/chassis.js`
- Phần thêm: bàn học (`L4_DESK`) dài tới vách (1,53 m); phòng tắm 0,70 m (`bathRig` trong `interior/caravan.js`): vách phẳng `BATH_X` 2,99, cửa lùa giữa, bồn cầu vách −z, lavabo vách +z, khăn trên cửa sau; mặt bếp nối tới vách bằng tủ kéo hẹp (`motorhomeKitchen(…, ext)` trong `interior/kitchen.js`); lối đi phòng tắm kỹ sư đọc `bathRig` (`engineer/tasks/van-nav.js`)
- Chi tiết + bẫy: `docs/architecture/van.md`

## body/
- `shell-cab.js`: vật liệu riêng xe (thân, mui, sọc, lốp, vành, bạt hiên); chung xe + trại (xám tối, khung ghế): `src/app/core/palette.js`; trại: `src/app/camp/materials.js`
- `transit.js`: vỏ Ford Transit L4H2 code (tạm, va chạm), cabin lái, bánh, tủ bếp; số đo `TR`
- `transit-glb.js`: GLB Transit dùng nguyên (`models/transit.bin`), gộp theo lớp vật liệu; nạp động cơ `models/engine.glb` vào khoang máy (`ENG_AT`)
- `van-doors.js`: cửa trước + ca-pô, bấm tay nắm / logo
- `xray.js`: vỏ GLB `caravanShell` còn 25% (`setCaravanXray`), độ mờ theo thanh nét viền (`VAN_LINES.onShell`); bảng ngoài chỉ gọi `VAN.setXray(on)`, đọc `VAN.xray`
- `chassis.js`: khung gầm GAZ-69 (`models/chassis.glb`) + hộp số code

## interior/
- `caravan.js`: giường, bàn học, bàn ăn, phòng tắm, bạt hiên, đèn lồng treo. `vanFrameTick` (sổ tick `things`, cuối `loop/main-loop.js`): đèn bạt hiên theo trời, đèn bàn, laptop, cửa lùa + nắp bồn cầu (`vanBathTick` ở `face.js`)
- `bath-fx.js`: vòi sen (tia nước, hơi mờ kính + vách, sàn ướt tự khô); ngẫu nhiên riêng `mulberry32` ⇒ không lệch đơn vị khác. `vanLateTick` (sổ tick `late`, đầu `loop/main-loop-rest.js`, ngay sau lượt người): bếp → vòi sen
- `env-map.js`: ảnh môi trường cho kim loại, gương, kính trong xe (toàn cảnh 64 × 32 → PMREM, ~0,34 MB GPU), nướng lại theo đèn trời / ngày đêm; `vanMetal`, crôm chung `VAN_CHROME`
- `kitchen.js`: chậu, thớt, bếp ga, lò; đồ bếp (bát udon, chảo, lon nước): `src/app/props/kitchen-props.js`
- `galley-fx.js`: bếp tự chạy theo lửa đang cháy: lửa ga, hơi nồi + tô udon (mặt đá, bàn ăn), đèn + quạt hút mùi, khói ống bếp (Navier–Stokes, thêm 25 s sau tắt lửa); người chỉ vặn núm, nhấc nồi, hất chảo, báo món (`VAN.kitchen`, `VAN.dish`)
- `desk-lamp-soda-breakfast.js`
- `tiny-living.js`: bồn cầu + kệ treo ấm trà (`models/tinyliving.glb`)
- `radio.js`: táp-lô, dò đài AM / FM thật

## engine/
- `engine-run.js`: bấm động cơ ⇒ vỏ máy mờ, cơ cấu V6 code chạy, máy rung (`ENG_V`)
- `engine-holo.js`: hình động cơ nổi ×3 khi kỹ sư kiểm tra máy → `docs/architecture/van-engine.md`

## Gốc van/
- `face.js`: mặt công khai `VAN` (`core/world.js`); đơn vị khác chỉ đọc / chạm xe qua đây (docs/architecture/engine.md). Có: thân xe, toạ độ xe → thế giới, lối cửa lùa (xa · bậc · trong), ổ chó, số đo `TR`, bạt hiên, máy nổ. Chạm: `mount` gắn đồ vào thân, bàn học (nắp laptop, ghế xoay, bảng ghim), ca-pô + nổ máy, hình động cơ nổi, nội thất (`inside` số đo, `bath` phòng tắm: cửa lùa + nắp bồn cầu tự chạy, `stool`, `bed`, `deskCoke`), bếp `kitchen` (núm quá nửa vòng ⇒ họng tự bén lửa), món `dish`, bát bàn ăn `tableBowl`. Bảng người xem: `xray` / `setXray(on)`, `engineSeen()` / `engineClick(hits)`
- `door-field.js`: bảng đường tới lối cửa lùa (`VAN.doorField`), dựng sau khi đủ lưới vật cản

## Kỹ sư
- `src/app/engineer/tasks/`: đi trong xe `van-nav.js`, trạm `van-stations.js`, nấu `cooking.js`, kiểm tra máy `engine-check.js`
- Thò vào `VAN.object` (userData, getObjectByName, traverse…) = "đi xuyên mặt" ⇒ bộ kiểm ranh giới chặn khi dựng
