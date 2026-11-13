# Kỹ sư: bản đồ tệp

Mọi tệp ghép 1 khối theo `src/app/manifest.txt` (không import/export).

## body/: thân, chuyển động, không chọn việc

- `constants` vật liệu, cỡ người · `model` hình · `instance-gait` tạo kỹ sư, nhịp bước · `face` nét mặt, khẩu hình, tay nắm / mở · `footprints` dấu chân đất ướt
- `body/pose-ik-walk.js`: tư thế lò xo, IK chân, đi né vật cản, bậc voxel (`engStep`, `engField`)
- `body/seats.js`: ngồi, đứng dậy, rời ghế

## mind/: chọn việc, phản ứng

- `mind/hours.js` ENG_HOURS: khung giờ được phép (sửa giờ ở đây); lịch, tự chủ, Tools, bấm vật đều hỏi `engHourOk(việc, giờ)`; lệnh ngoài khung bỏ trước khi bắt đầu, đã bắt đầu thì làm nốt
- Khung: ngắm sao sau 19:00 · câu cá 06:30–19:30 · chăm luống 06:48–17:36 (lệnh tới 18:18) · cắt cỏ sau mưa 06:40–17:20 (lệnh tới 18:12)
- `mind/schedule.js`: lịch `ENG_DAY` (giờ Pleiku), bảng việc `ENG_ACTS`, pha `engPhaseFor`, chọn việc `engWantAct`, ngồi ghế cắm trại làm gì bao lâu `engChairPhase`, đặt chỗ khi mở trang `engSpawn`
- `mind/needs.js`: nhu cầu kiểu The Sims 4: bảng tốc độ `SIM_NEEDS`, `SIM_DO`, moodlet, tua lịch, kỹ năng; mặt `needs`; bảng Kỹ sư ui/sim-needs.js chỉ vẽ
- `mind/autonomy.js`: tự chủ theo nhu cầu (`AUTO_ACTS`: hệ số lấp nhu cầu, thời lượng)
- `mind/offers.js`: việc nhận theo lệnh người xem, sẽ làm gì / vì sao chưa (mặt `offer(k)`)
- `mind/task-table.js`: `ENG_JOBS` việc dùng dụng cụ
- `mind/loop-update.js`: điều phối mỗi khung (dưới)
- Suy nghĩ: `thoughts` (câu theo việc), `weather-notice` (nhận xét thời tiết: chấm 5 chỉ số → nhớ → gộp → ghép câu), `thought-bubble`. Phản ứng cảnh, môi trường, thời tiết: `mind/reactions.js` (mưa, gió, chó, lá), `env-react`, `weather-feel`

## engineer/face.js

- Mặt công khai: đơn vị khác chỉ đọc qua `worldSee('engineer')`: chỗ đứng, đầu, ghế, việc, cỡ người, lưỡi câu, màu mũ… (docs/architecture/engine.md)
- UI đọc nhu cầu + việc nhận làm, giao việc: `ENGINEER.needs / offer(k) / ask(k) / asked / askNeed(k)`
- Kỹ sư đụng xe / trại chỉ qua chỗ chạm: núm bếp `VAN.kitchen`, báo món `VAN.dish`, phòng tắm `VAN.bath`

## tasks/: 1 tệp 1 việc, giờ theo ENG_DAY

- `tasks/sleep.js`: ngủ 21:45–06:00 (`engNightTick`, trở mình, chăn)
- `tasks/van-stations.js`: vệ sinh 06:00 · 10:45 · 16:00 (wc, lau bồn, lavabo); ăn sáng 06:12, trưa 11:25 (bàn trong xe), rửa bát; tắm 18:00; 21:42 ngồi mép giường tháo mũ. Đi trong xe: `tasks/van-nav.js`
- `tasks/cooking.js`: nấu udon 10:55, chiên cơm 16:45; `engVan` điều phối các trạm (cả ăn sáng, trưa)
- `tasks/camp-routine.js` (việc quanh ghế cắm trại): dạo trại 06:40 · 16:35 (cột khí tượng → trà → dạo → uống nước → vuốt chó); nghỉ 12:15 · 15:50 (tea → nap: trà, ngủ trưa trên ghế); ăn tối 17:15, cá nướng (+ `tasks/meal-read.js`; que + cá là đồ trại `camp/grill.js`, chạm qua `CAMP.grill`); câu cá 18:03 (+ `tasks/angling.js`); đọc sách, ăn khoai 19:30 (+ `tasks/meal-read.js` `engRead`); mưa trú dưới hiên
- `tasks/laptop-work.js`: nghiên cứu bàn học 07:15–10:45 · 13:00–15:20; học bài, nghe nhạc 20:00
- `tasks/drone.js`: bay 15:20 (gió > 9 m/s ⇒ nghỉ)
- `tasks/apple-pick.js`: hái táo 16:10 (+ ăn táo trong ngày)
- `tasks/sky-watch.js`: ngắm sao 20:42–21:42 (trời quang; không thì đọc tiếp); mưa ra mép bạt ngắm mưa
- `tasks/trim-grass.js`: cắt cỏ khi cỏ ráo sau mưa
- `tasks/campfire-keep.js`: lửa trại theo nhiệt độ (trạng thái bếp `campFire` ở `camp/chairs-lantern-fire.js`): > 30 °C xô nước + que cời ra dập; < 28 °C (hoặc cá cần nướng: lửa nhỏ) que mồi, quẹt diêm nhóm
- `tasks/carrot-garden.js`: chăm luống cà rốt
- Nhu cầu thấp ⇒ đi lấp (`mind/autonomy.js`), dạo khám phá `tasks/explore.js`
- Lệnh Tools / bấm vật: kiểm tra máy xe `tasks/engine-check.js`; ghế đọc sách, bỏ củi lò `tasks/tool-jobs.js`

## Thêm việc dùng dụng cụ

1. `tasks/<việc>.js`: `update(e, dt, t)` (trả `true` khi xong), cần thì `idle()`, `tick()`
2. 1 dòng `ENG_JOBS`
3. 1 dòng `ENG_ACTS` + pha ở `engPhaseFor`
4. Khung giờ ENG_HOURS
5. Bấm được: 1 dòng `ENG_OFFERS` + 1 dòng TL_ITEMS `ui/tools-panel.js` (icon, tên, nút)
6. Ghi tệp vào `manifest.txt`

## Mỗi khung (`mind/loop-update.js`)

1. `engPoseBegin`: trả tư thế đích khung trước
2. Ngủ `engNightTick`, hoặc chọn việc `engWantAct` → `engSetAct`
3. Ưu tiên: rời ghế `engSeatGuard` > giữ người lại `engReactHold` > trong xe `engVan` / tới xe `engEnterVan` > dụng cụ `ENG_JOBS[pha].run` > quanh trại `engCampPhase`
4. Đồ cầm tay theo việc
5. `engReactPre` → `engPoseEnd` (dáng mượt) → `engFootIK` → `engReactPost` (quay đầu, nhịp cử chỉ) → `engSeatPost` (tay vịn) → `updateFishingBite` (pha 'fish') → `engReactArms` (đích tay cử chỉ) → `engArmPost` (IK khuỷu / cổ tay) → `engFace.tick`
6. `ENG_JOBS[*].tick` (đồ cầm theo bàn tay đã đặt: sào + quả `applePick.tick`, thảm + kính…), `lapHeldTick`, `engDishPose`, `engSleepPost`
7. `ENG_JOBS[*].idle`: việc bị cắt ngang
