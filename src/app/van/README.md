# Xe van: muốn sửa phần nào thì mở tệp nào

G 24/10: "organise folder files for van". Mọi tệp vẫn ghép chung một khối mã theo `src/app/manifest.txt`. Chỉ đổi chỗ để dễ tìm, thứ tự ghép không đổi.

Đơn vị và trục của xe (đv xe): 1,1 đv = 1 m. Mũi xe hướng −X, cửa lùa ở +Z. Cầu trước ở x −2,12, cầu sau ở x 2,03, tâm bánh y 0,44, sàn trong xe y 0,83 (xem `TR` trong `body/transit.js`).

Từ 01/11 xe là bản L4 dài 6,70 m: đuôi xe dài thêm `TR.ext` 0,792 đv (0,72 m) sau hốc bánh sau, chiều dài cơ sở giữ nguyên. Mẫu GLB giãn lúc gắn (`l4()` trong `body/transit-glb.js`), khung gầm giãn trong `body/chassis.js`. Phần thêm cho bàn học rộng hơn (`L4_DESK`) và phòng tắm dài 1,07 m (`bathRig` trong `interior/caravan.js`). Tối 01/11 vách phòng tắm thành 1 mặt phẳng thẳng (`BATH_X` 2,99, cửa lùa giữa), phòng tắm gọn 0,70 m: bồn cầu vách −z, lavabo vách +z, khăn trên cửa sau; bàn học dài tới vách (1,53 m), mặt bếp nối dài tới vách bằng tủ kéo hẹp (`motorhomeKitchen(…, ext)` trong `interior/kitchen.js`). Nút lối đi phòng tắm của kỹ sư đọc số đo từ `bathRig` (`engineer/tasks/van-nav.js`). Chi tiết ở `src/ARCHITECTURE.md`, gạch "Xe L4H2 dài 6,70 m".

| Thư mục | Tệp | Nội dung |
|---|---|---|
| `body/` | `shell-cab.js` | Vật liệu riêng của xe (thân, mui, sọc, lốp, vành, bạt hiên). Vật liệu xe + trại cùng dùng (xám tối, khung ghế) ở `src/app/core/palette.js`, vật liệu trại ở `src/app/camp/materials.js` |
| | `transit.js` | Vỏ Ford Transit L4H2 (dài 6,70 m từ 01/11) dựng bằng code (bản tạm, dùng cho va chạm), cabin lái, bánh, tủ bếp; bảng số đo `TR` |
| | `transit-glb.js` | Mẫu GLB Transit dùng nguyên (`models/transit.bin`), gộp theo lớp vật liệu; nạp động cơ `models/engine.glb` vào khoang máy (`ENG_AT`) |
| | `van-doors.js` | Cửa trước và ca-pô: bấm tay nắm hoặc logo để mở, đóng |
| | `xray.js` | Xem xuyên (01/11, dời từ `ui/xray-lifecycle.js`): mặt vỏ GLB `caravanShell` còn 25% khi bật (`setCaravanXray`), độ mờ theo thanh nét viền (`VAN_LINES.onShell`); bảng ngoài chỉ gọi `VAN.setXray(on)`, đọc `VAN.xray` |
| | `chassis.js` | Khung gầm GAZ-69 (`models/chassis.glb`) và hộp số dựng bằng code |
| `interior/` | `caravan.js` | Nội thất: giường, bàn học, bàn ăn, phòng tắm, bạt hiên, đèn lồng treo. Mỗi khung `vanFrameTick` (sổ tick lượt `things`, cuối `loop/main-loop.js`): đèn bạt hiên tự sáng theo trời như đèn trại, đèn bàn, laptop, cửa lùa + nắp bồn cầu (`vanBathTick` ở `face.js`) |
| | `bath-fx.js` | Vòi sen của xe: tia nước, hơi nước mờ kính + vách, sàn ướt tự khô; số ngẫu nhiên riêng (`mulberry32`) nên tắm không làm lệch đơn vị khác. Có `vanLateTick` (sổ tick lượt `late`, đầu `loop/main-loop-rest.js`, ngay sau lượt người): bếp rồi vòi sen |
| | `kitchen.js` | Bếp: chậu, thớt, bếp ga, lò. Đồ bếp (bát udon, chảo, lon nước) dựng bằng hàm ở `src/app/props/kitchen-props.js` |
| | `galley-fx.js` | Bếp tự chạy theo lửa đang cháy: lửa ga nhảy, hơi nồi + tô udon (mặt đá, bàn ăn), đèn + quạt máy hút mùi, khói ống bếp (sợi khói Navier–Stokes, chạy thêm 25 s sau khi tắt lửa). Người chỉ vặn núm, nhấc nồi, hất chảo, báo món (`VAN.kitchen`, `VAN.dish`) |
| | `desk-lamp-soda-breakfast.js` | Đèn bàn, lon nước ngọt, đồ ăn sáng |
| | `tiny-living.js` | Bồn cầu và kệ treo ấm trà (`models/tinyliving.glb`) |
| | `radio.js` | Radio táp-lô, dò đài AM / FM thật |
| `engine/` | `engine-run.js` | Bấm động cơ: vỏ máy mờ đi, cơ cấu V6 dựng bằng code chạy, máy rung (`ENG_V`) |
| | `engine-holo.js` | Hình động cơ nổi ×3 khi kỹ sư kiểm tra máy |
| (gốc `van/`) | `face.js` | MẶT CÔNG KHAI của xe (`VAN` trong `core/world.js`): thân xe, đổi toạ độ xe → thế giới, lối cửa lùa (xa · bậc · trong), ổ chó, số đo `TR`, bạt hiên, máy nổ; chỗ chạm: gắn đồ vào thân xe `mount`, bàn học (nắp laptop, ghế xoay, bảng ghim), ca-pô + nổ máy, hình động cơ nổi, nội thất (`inside` số đo, `bath` phòng tắm — cửa lùa + nắp bồn cầu xe tự chạy, `stool`, `bed`, `deskCoke`), bếp `kitchen` (núm vặn quá nửa vòng thì họng tự bén lửa), món ăn `dish`, bát trên bàn ăn `tableBowl`; cho bảng người xem: xem xuyên `xray` / `setXray(on)`, máy `engineSeen()` / `engineClick(hits)` — đơn vị khác chỉ đọc / chạm xe qua đây (ARCHITECTURE mục 1b) |
| | `door-field.js` | Bảng đường tới lối cửa lùa (`VAN.doorField`), dựng sau khi có lưới vật cản đầy đủ |

Chi tiết `engine-holo.js`:
- Từ 24/10 khuya dựng bằng code theo Ford 3.5L EcoBoost V6 thế hệ 2: 14 bộ phận, 67 chi tiết con, mỗi chi tiết một khối kín riêng (không cắt lưới quét nữa).
- Bộ phận tách rời, mỗi bộ phận tách tiếp thành chi tiết con.
- Màu theo hệ thống của động cơ.
- Nhãn xếp ngoài hình, nối bằng đường dẫn.
- Lúc hình đang hiện thì giấu mọi nhãn khác.

Việc kỹ sư làm với xe nằm ở `src/app/engineer/tasks/`: đi lại trong xe (`van-nav.js`), các trạm (`van-stations.js`), nấu ăn (`cooking.js`), kiểm tra máy (`engine-check.js`). Kỹ sư chỉ đọc / chạm xe qua mặt `VAN` — thò vào `VAN.object` (userData, getObjectByName, traverse…) là chỗ dính "đi xuyên mặt", bộ kiểm ranh giới chặn khi dựng.
