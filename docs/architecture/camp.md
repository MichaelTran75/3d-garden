# Khu trại

<!-- toc -->
- Bếp, ghế, đèn · 1.4 KB
- Lò chiminea · 0.9 KB
- Kỹ sư, que cá · 0.6 KB
<!-- /toc -->

## Bếp, ghế, đèn
- `core/site.js`: `CAMP_SCALE`, tâm bếp `pf`, `CAMP_K`, né lửa `FIRE_AVOID_R`.
- `camp/chairs-lantern-fire.js`: ghế, bàn trà (`campLocal` cục bộ xe), lửa trại `campfire()`, `campFire`, `campRainTick`, đèn lồng `lanternsTick`, chỗ lò (`CHIM_P`, `CHIM_AIM`, `WOOD_SIDE`, `chimLocal`), mặt `CAMP`.
- `CAMP_K` thu cả cụm bếp: 'Lòng bếp' × `CAMP_PIT`, giá treo, que cá `CAMP_FISH`. Đổi cỡ bếp chỉ qua `CAMP_K`.
- `FIRE_AVOID_R` theo chân giá treo xa nhất; mọi tác tử cùng né.
- Cỡ cá đọc `CAMP.fishK`, không ghi số.
- Que cá nhỏ ⇒ chỗ cầm thấp: `engGrillPhase` nhích sát + gập eo + khuỵu; đổi cỡ ⇒ đo lại tầm tay.
- `campFire` {out: kỹ sư đã dập, small: lửa nhỏ nướng cá, douse}. `campFire.out` ⇒ `campRainTick` không tự nhen lại.
- Cá chín chỉ khi `CAMP.fireRain.emberK` > 0,2.
- Ghế (1,45; 1,82), bàn (2,55; 2,0) cục bộ xe; tay vịn + cốc tới x 2,01, bàn từ 2,09: giữ khe.
- Ghế cách bậc cửa ~1 m (vòng né `PROPS` không chắn cửa).
- `lanternLit` bật khi `sunElevSin` < 0,05, tắt khi > 0,1; mờ dần `lanternK`.
- Đèn lồng tắt = cường độ 0 + `bulbOffMat`; không bỏ đèn (đổi số đèn ⇒ biên dịch lại mọi vật liệu).
- Đèn lồng bạt hiên thuộc xe; `lanBody`: `core/axes-pin-bake.js`.

## Lò chiminea
- `camp/chiminea.js`: lò + lò nướng bên (`oven`: heat, temp, open, fish…), `see()`, `addWood()`, `update(dt, t)`.
- Dãy lò trước ghế + bàn, cửa nhắm `CHIM_AIM`; lò nướng nóng theo lửa lò (`OV`), vỉ 3 cá hun.
- `WOOD_SIDE` −1: củi −x, lò nướng +x (`OS`), máy cắt cỏ sau đống củi; lật `WOOD_SIDE` = lật cả ba, không sửa riêng.
- Lò + củi ngoài bạt; chỗ bỏ củi cách cột góc bạt ≥ 0,65 m.
- Xem xuyên bạt chỉ mờ 25%: chỗ trông trống có thể dưới bạt ⇒ kiểm chỗ đặt ở cả hai chế độ.
- Lò dựng bằng `bakeStatic`: phần động (bản lề `ohinge`, kim nhiệt kế, lửa, hơi ấm, nét viền) phải `userData.noBake`.
- Tua `__dbg.frames` thiếu `simSetup()` ⇒ dt = giờ thật, lò gần như không nóng; dùng `simSetup()` hoặc `chiminea.update(1, t)`.

## Kỹ sư, que cá
- `engineer/tasks/campfire-keep.js` (`fireNeed`), `smoker.js` (`smokePhase`), `meal-read.js` (`engGrillPhase`); `camp/grill.js` que cá `CAMP.grill`; `camp/trimmer.js` máy cắt cỏ, chỗ cất `planHome`.
- Dập > 30 °C, nhóm < 28 °C, 28–30 giữ.
- Chỗ dội nước lệch hướng xô ~29° (trùng ⇒ vòng đẩy quanh xô đẩy qua lại, kẹt).
- Thử chỗ đứng: bỏ chính vòng bếp, né 4 chân giá treo ≥ 0,32 m.
- Chỗ nhóm `LIGHT_D` = `FIRE_AVOID_R` + 0,05 (sát hơn ⇒ đầu chúi qua ấm).
- Cả cảnh 1 mô hình cá: que bếp lửa có cá ⇒ cá rô không cắn câu.
