# Khu trại: bàn ghế, lửa trại, lò chiminea, đèn lồng

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.8 KB
- Chạy thế nào · 0.7 KB
- Bẫy · 3.1 KB
<!-- /toc -->

## Mã

- `core/site.js` — `CAMP_SCALE`, tâm bếp `pf`, `CAMP_K`, vòng né lửa `FIRE_AVOID_R`.
- `camp/chairs-lantern-fire.js` — ghế + bàn trà (`campLocal`: toạ độ cục bộ xe), lửa trại `campfire()`, `campFire`, `campRainTick`, đèn lồng `lanternsTick`, chỗ đặt lò (`CHIM_P`, `CHIM_AIM`, `WOOD_SIDE`, `chimLocal`); mặt công khai `CAMP`.
- `camp/chiminea.js` — lò + lò nướng ghép bên (`oven`: heat, temp, open, fish…), `see()`, `addWood()`, `update(dt, t)`.
- `camp/grill.js` — que cá (`CAMP.grill`); `camp/trimmer.js` — máy cắt cỏ, chỗ cất `planHome`.
- Kỹ sư: `engineer/tasks/campfire-keep.js` (`fireNeed`), `smoker.js` (`smokePhase`), `meal-read.js` (`engGrillPhase`). Đèn lồng bạt hiên thuộc xe; bộ đèn `lanBody`: `core/axes-pin-bake.js`.

## Chạy thế nào

- `CAMP_K` thu cả cụm bếp: lòng bếp (nhóm 'Lòng bếp' × `CAMP_PIT`), giá treo, que cá (`CAMP_FISH`); `FIRE_AVOID_R` theo chân giá treo xa nhất, mọi tác tử cùng né.
- `campFire` { out: kỹ sư đã dập, small: lửa nhỏ nướng cá, douse }. Kỹ sư dập > 30 °C, nhóm < 28 °C, 28–30 giữ nguyên.
- Dãy lò trước ghế + bàn, cửa nhắm `CHIM_AIM`; `WOOD_SIDE` −1: củi −x cục bộ, lò nướng +x (`OS`), máy cắt cỏ sau lưng đống củi. Lò nướng nóng theo lửa lò (`OV`), vỉ 3 cá hun.
- Đèn lồng: `lanternLit` bật khi `sunElevSin` < 0,05, tắt khi > 0,1 (trễ), mờ dần `lanternK`.

## Bẫy

- Ghế (1,45; 1,82), bàn (2,55; 2,0) cục bộ xe: tay vịn + cốc trà tới x 2,01, bàn từ 2,09 — giữ khe; ghế cách bậc cửa ~1 m để vòng né ghế (`PROPS`) không chắn cửa.
- Lò + củi để ngoài bạt (ống khói nóng, tàn lửa); chỗ đứng bỏ củi cách cột góc bạt ≥ 0,65 m.
- Bạt hiên che vật sát xe ở nhiều góc nhìn; ở chế độ xem xuyên bạt chỉ mờ 25% nên chỗ trông như bãi trống có thể nằm dưới bạt — kiểm chỗ đặt ở cả hai.
- Lật `WOOD_SIDE` là lật cả lò nướng, đống củi, chỗ cất máy cắt cỏ; đừng sửa riêng một chỗ.
- Đổi cỡ bếp chỉ qua `CAMP_K`; cỡ cá đọc `CAMP.fishK`, không ghi số. Que cá nhỏ ⇒ chỗ cầm thấp: `engGrillPhase` nhích sát + gập eo + khuỵu — đổi cỡ phải đo lại tầm tay.
- Đèn lồng tắt = cường độ 0 + bóng `bulbOffMat`; đừng bỏ đèn (đổi số đèn ⇒ mọi vật liệu biên dịch lại).
- `campFire.out` ⇒ `campRainTick` không tự nhen lại như sau mưa. Cá chỉ chín khi `CAMP.fireRain.emberK` > 0,2.
- Chỗ đứng dội nước lệch hướng xô ~29° (trùng hướng thì vòng đẩy quanh xô đẩy kỹ sư qua lại, kẹt). Thử chỗ đứng phải bỏ chính vòng bếp (không thì hướng nào cũng vướng), né 4 chân giá treo ≥ 0,32 m; chỗ nhóm `LIGHT_D` = `FIRE_AVOID_R` + 0,05 (sát hơn thì đầu chúi qua ấm).
- Lò dựng bằng `bakeStatic`: phần động (bản lề `ohinge`, kim nhiệt kế, lửa, hơi ấm, nét viền) phải `userData.noBake`.
- Tua bằng `__dbg.frames` mà không `simSetup()`: dt là giờ thật (rất nhỏ) ⇒ lò gần như không nóng; dùng `simSetup()` hoặc gọi thẳng `chiminea.update(1, t)`.
- Cả cảnh 1 mô hình cá: que bếp lửa có cá thì cá rô không cắn câu.
- Cửa van cung đập (`world/hydro-dam.js`): `aT` phải trừ 2π, không thì quay vòng 320°.
- Đường có 2 tuyến (`campusRoad.userData.road`: `stations`, `branch`): thứ gì theo đường lặp cả 2, không nối trạm cuối tuyến này với đầu tuyến kia; nhánh nổi 3 mm ở miệng nối. `freeTree` né đường + mặt đập.
- `VAN_LINES.onShell` gán trong `van/body/xray.js`, sau `ui/labels-controls.js` (TDZ) ⇒ gọi phải kiểm có. Vỏ mờ 0 thì ẩn nhưng vẫn bấm trúng xe; vách phòng tắm (`userData.vanWall`) không theo thanh.
- Thỏ: mọi lối bỏ dở bữa gọi `bunnyDropCarrot` (lưới an toàn ở `bunnyTick0`), không thì ngậm củ đi nhảy; `bunnyDogNear` đo vận tốc CHÓ chiếu về thỏ (khoảng cách co lại thì tính cả thỏ tự lại gần); bộ khác giành dáng gọi `bunnyUpright`.
- Cỏ ven đường (`nature/meadow.js`) dùng RNG riêng (`mulberry32(2610)`, `2611`); lớp mới cũng phải RNG riêng, không thì thảm cỏ cũ đổi.
- Vỏ táo: `sfARidge` (`core/surface-style.js`) phải y hệt `appleRidge` (`nature/flowers-trees.js`), băm số nguyên 32 bit; sửa một bên phải sửa bên kia.
