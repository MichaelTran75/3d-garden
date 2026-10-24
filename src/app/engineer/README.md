# Kỹ sư: muốn sửa hành vi nào thì mở tệp nào

G 24/10: "sắp xếp lại files hành vi, để dễ chỉnh sửa". Mọi tệp vẫn ghép chung một khối mã theo `src/app/manifest.txt` (không import/export). Chỉ đổi chỗ để dễ tìm, thứ tự ghép không đổi.

## 3 thư mục

| Thư mục | Vai trò | Tệp |
|---|---|---|
| `body/` | Thân thể và chuyển động. Không quyết định làm gì | `constants` (vật liệu, cỡ người) · `model` (hình) · `instance-gait` (tạo kỹ sư, nhịp bước) · `pose-ik-walk` (tư thế lò xo, IK chân, đi bộ né vật cản, bậc voxel) · `seats` (ngồi / đứng dậy / rời ghế) · `face` (nét mặt, khẩu hình, tay nắm / mở) · `footprints` (dấu chân trên đất ướt) |
| `mind/` | Đầu óc: chọn việc, phản ứng | `hours` (**giờ giấc: sửa giờ ở đây**) · `schedule` (lịch cả ngày `ENG_DAY`, bảng việc `ENG_ACTS`, chọn việc `engWantAct`, đặt chỗ khi mở trang `engSpawn`) · `autonomy` (nhu cầu kiểu The Sims) · `task-table` (bảng việc dùng dụng cụ `ENG_JOBS`) · `loop-update` (bộ điều phối mỗi khung) · `thoughts`, `thought-bubble` (suy nghĩ) · `reactions`, `env-react`, `weather-feel` (phản ứng với cảnh, môi trường, thời tiết) |
| `tasks/` | Mỗi tệp một việc | xem bảng dưới |

## Một ngày (`mind/schedule.js` ENG_DAY, giờ Pleiku)

| Giờ | Việc | Tệp làm việc đó |
|---|---|---|
| 21:45 – 06:00 | Ngủ | `tasks/sleep.js` (`engNightTick`, trở mình, chăn) |
| 06:00 · 10:45 · 16:00 | Vệ sinh | `tasks/van-stations.js` (trạm wc, lau bồn, lavabo) · đi trong xe `tasks/van-nav.js` |
| 06:12 · 11:25 | Ăn sáng · ăn trưa (bàn trong xe), rửa bát | `tasks/van-stations.js` · `tasks/cooking.js` (`engVan` điều phối các trạm) |
| 06:40 · 16:35 | Dạo trại: cột khí tượng → trà → dạo → uống nước → vuốt chó | `tasks/camp-routine.js` |
| 07:15 – 10:45 · 13:00 – 15:20 | Nghiên cứu ở bàn học | `tasks/laptop-work.js` |
| 10:55 · 16:45 | Nấu udon · chiên cơm | `tasks/cooking.js` |
| 12:15 · 15:50 | Nghỉ: trà rồi ngủ trưa trên ghế | `tasks/camp-routine.js` (tea → nap) |
| 15:20 | Bay drone (gió > 9 m/s thì nghỉ) | `tasks/drone.js` |
| 16:10 | Hái táo (+ ăn táo trong ngày) | `tasks/apple-pick.js` |
| 17:15 | Ăn tối ở ghế cắm trại, cá nướng | `tasks/camp-routine.js` + `tasks/meal-read.js` |
| 18:00 | Tắm | `tasks/van-stations.js` |
| 18:03 | Câu cá | `tasks/camp-routine.js` + `fishing/angling.js` |
| 19:30 | Đọc sách, ăn khoai | `tasks/camp-routine.js` + `tasks/meal-read.js` (`engRead`) |
| 20:00 | Học bài, nghe nhạc | `tasks/laptop-work.js` |
| 20:42 – 21:42 | Ngắm sao (trời quang), không thì đọc tiếp | `tasks/sky-watch.js` |
| 21:42 | Ngồi mép giường tháo mũ | `tasks/van-stations.js` |

Ngoài lịch: mưa thì trú dưới hiên và ra mép bạt ngắm mưa (`tasks/camp-routine.js`, `tasks/sky-watch.js`) · cỏ ráo sau mưa thì cắt cỏ (`tasks/trim-grass.js`) · lửa trại theo nhiệt độ: > 30 °C xách xô nước + que cời ra dập, < 28 °C (hoặc cá cần nướng: lửa nhỏ) lấy que mồi, quẹt diêm nhóm lại (`tasks/campfire-keep.js`, trạng thái bếp `campFire` ở `camp/chairs-lantern-fire.js`) · chăm luống cà rốt (`tasks/carrot-garden.js`) · nhu cầu thấp thì đi lấp (`mind/autonomy.js`), dạo khám phá (`tasks/explore.js`) · lệnh bảng Tools / bấm vật: kiểm tra máy xe (`tasks/engine-check.js`), ghế đọc sách, bỏ củi lò (`tasks/tool-jobs.js`).

## Khung giờ được phép (`mind/hours.js` ENG_HOURS)

Lịch, tầng tự chủ, bảng Tools và bấm vật trong cảnh đều hỏi `engHourOk(việc, giờ)`. Ngắm sao chỉ sau 19:00. Câu cá 06:30 – 19:30. Chăm luống 06:48 – 17:36 (theo lệnh tới 18:18). Cắt cỏ sau mưa 06:40 – 17:20 (theo lệnh tới 18:12). Lệnh ngoài khung giờ bị bỏ trước khi bắt đầu; việc đã bắt đầu thì làm nốt.

## Muốn sửa … thì mở …

- **Đổi giờ:** khung được phép ở `mind/hours.js`; lịch theo giờ ở `ENG_DAY` (`mind/schedule.js`).
- **Thêm việc dùng dụng cụ:**
  1. Viết `tasks/<việc>.js` có `update(e, dt, t)` (trả `true` khi xong), và nếu cần thêm `idle()` và `tick()`.
  2. Thêm 1 dòng `ENG_JOBS` (`mind/task-table.js`).
  3. Thêm 1 dòng `ENG_ACTS` và pha ở `engPhaseFor` (`mind/schedule.js`).
  4. Thêm khung giờ ở `mind/hours.js`.
  5. Muốn bấm được thì thêm dòng ở `ui/tools-panel.js` TL_ITEMS.
  6. Ghi tệp vào `manifest.txt`.
- **Việc quanh ghế cắm trại** (ăn, trà, đọc, dạo, vuốt chó, câu cá, trú mưa): `tasks/camp-routine.js`. Ngồi ghế làm gì, bao lâu: `engChairPhase` (`mind/schedule.js`).
- **Đi lại, né vật cản, bậc voxel:** `engStep` và `engField` (`body/pose-ik-walk.js`).
- **Ngồi xuống, đứng dậy:** `body/seats.js`. Phản ứng với mưa, gió, chó, lá: `mind/reactions.js`.
- **Nhu cầu, tự chủ:** `mind/autonomy.js` (`AUTO_ACTS`: hệ số lấp nhu cầu, thời lượng).

## Thứ tự mỗi khung (`mind/loop-update.js`)

1. Trả tư thế đích của khung trước (`engPoseBegin`).
2. Ngủ (`engNightTick`), hoặc chọn việc (`engWantAct` → `engSetAct`).
3. Chạy việc theo thứ tự ưu tiên:
   1. Rời ghế (`engSeatGuard`).
   2. Phản ứng giữ người lại (`engReactHold`).
   3. Trong xe (`engVan`), hoặc đi tới xe (`engEnterVan`).
   4. Việc dụng cụ: `ENG_JOBS[pha].run`.
   5. Quanh trại: `engCampPhase`.
4. Đồ cầm tay theo việc.
5. Dáng mượt, IK chân, quay đầu, tay vịn, câu cá, cử chỉ, IK tay, nét mặt.
6. `ENG_JOBS[*].tick`: đồ cầm theo bàn tay.
7. `ENG_JOBS[*].idle` cho việc không phải pha hiện tại, tức việc bị cắt ngang.
