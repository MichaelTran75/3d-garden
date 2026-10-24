# Xe van: muốn sửa phần nào thì mở tệp nào

G 24/10: "organise folder files for van". Mọi tệp vẫn ghép chung một khối mã theo `src/app/manifest.txt`. Chỉ đổi chỗ để dễ tìm, thứ tự ghép không đổi.

Đơn vị và trục của xe (đv xe): 1,1 đv = 1 m. Mũi xe hướng −X, cửa lùa ở +Z. Cầu trước ở x −2,12, cầu sau ở x 2,03, tâm bánh y 0,44, sàn trong xe y 0,83 (xem `TR` trong `body/transit.js`).

| Thư mục | Tệp | Nội dung |
|---|---|---|
| `body/` | `shell-cab.js` | Vật liệu xe, dùng chung cho cả trại |
| | `transit.js` | Vỏ Ford Transit L3H2 dựng bằng code (bản tạm, dùng cho va chạm), cabin lái, bánh, tủ bếp; bảng số đo `TR` |
| | `transit-glb.js` | Mẫu GLB Transit dùng nguyên (`models/transit.bin`), gộp theo lớp vật liệu; nạp động cơ `models/engine.glb` vào khoang máy (`ENG_AT`) |
| | `van-doors.js` | Cửa trước và ca-pô: bấm tay nắm hoặc logo để mở, đóng |
| | `chassis.js` | Khung gầm GAZ-69 (`models/chassis.glb`) và hộp số dựng bằng code |
| `interior/` | `caravan.js` | Nội thất: giường, bàn học, bàn ăn, phòng tắm, bạt hiên, đèn lồng treo |
| | `kitchen.js`, `kitchen-props.js` | Bếp: chậu, thớt, bếp ga, lò. Đồ bếp: bát udon, chảo |
| | `desk-lamp-soda-breakfast.js` | Đèn bàn, lon nước ngọt, đồ ăn sáng |
| | `tiny-living.js` | Bồn cầu và kệ treo ấm trà (`models/tinyliving.glb`) |
| | `sleep-fx.js` | Chữ Zzz và bảng đếm ngược giấc ngủ |
| | `radio.js` | Radio táp-lô, dò đài AM / FM thật |
| `engine/` | `engine-run.js` | Bấm động cơ: vỏ máy mờ đi, cơ cấu V6 dựng bằng code chạy, máy rung (`ENG_V`) |
| | `engine-holo.js` | Hình động cơ nổi ×3 khi kỹ sư kiểm tra máy |

Chi tiết `engine-holo.js`:
- Từ 24/10 khuya dựng bằng code theo Ford 3.5L EcoBoost V6 thế hệ 2: 14 bộ phận, 67 chi tiết con, mỗi chi tiết một khối kín riêng (không cắt lưới quét nữa).
- Bộ phận tách rời, mỗi bộ phận tách tiếp thành chi tiết con.
- Màu theo hệ thống của động cơ.
- Nhãn xếp ngoài hình, nối bằng đường dẫn.
- Lúc hình đang hiện thì giấu mọi nhãn khác.

Việc kỹ sư làm với xe nằm ở `src/app/engineer/tasks/`: đi lại trong xe (`van-nav.js`), các trạm (`van-stations.js`), nấu ăn (`cooking.js`), kiểm tra máy (`engine-check.js`).
