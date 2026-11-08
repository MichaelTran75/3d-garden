# Bò, gà, chó

<!-- toc -->
- Mã · 0.6 KB
- Chạy thế nào · 0.4 KB
- Chuồng, chó lùa bò · 0.8 KB
- Bẫy · 2.6 KB
<!-- /toc -->

## Mã
- `animals/cows/herd-hut.js`: bò + bê `cows`, chuồng `cowHut`; lượt `beasts`: `cowWatch` → `cowHome` / `cowFreeTick` (bê `calfFree`) → `cowPose`. `cows/routing.js`: `hutField`, `homeField`.
- `animals/chickens/chickens.js`: 3 gà GLB (`src/models/chicken.glb`, dựng bằng `src/tools/chicken/`), `steer`, `wingTick`, `roostTime`. Chuồng `camp/chicken-coop.js`.
- `animals/dog/brain.js`: `behave`, `shelterTick` (hiên `DOG_PORCH` → bậc → xe), `watchTick`, `zoomCenter`; `dog/shelter.js`: `dogLie`, `dogRain`.
- Va chạm thú `core/collide.js`, dẫn đường `core/flow-field.js`.

## Chạy thế nào
- Bò: hành vi đặt đích mõm (`c.reach` cao trên đất / `c.reachY` tuyệt đối), `cowPose` hạ cổ tới khi chạm. `hx` > 0 = đầu quay về −z cục bộ.
- Bê chung mảng `cows` (va chạm, chuồng, dáng); chuồng dựng theo `cows.length`.
- Gà: cào → lùi → nhìn → mổ 1–2 vòng `'pecking'` → ngẩng; tối (`roostTime`, mặt trời thật) lên sào. Cỡ ×1,1 khớp `LEG`, `HOLE` của chuồng.

## Chuồng, chó lùa bò
- `cowHut` (`animals/cows/herd-hut.js`): mái `noBake` + `noBatch`; `roofToggle()` mờ 50%/đặc; vùng rê = tôn `roofSheet`.
- Diềm mái `surfaceStyle`: dựng vật liệu mới (`clone()` mất `onBeforeCompile`).
- `animals/dog/brain.js`: mưa + ngày + bò ngoài bãi (`herdOut`) ⇒ alert → `herdPick` → outrun → `herdLift` → fetch → hold → `herdDone` → toDoor → toStep → shakeOff → vào xe; tạnh ⇒ `herdEnd` + herdHome.
- Chó giữ va chạm khi 'herd' và 'toDoor' cách cửa xe > 4 m; outrun không tiến ⇒ bảng DP; trần 120 s/nhóm, 480 s/lượt.
- Bò đọc mặt chó (`cowHerdSense`): `cowWaitDog` giữ chờ, `cowLetGo` thả; bước lái × `c.push`. Chó không ghi trường bò.
- Bò dùng chung `herdAvail` với chó ⇒ khung đầu mưa bò không về rồi quay lại.

## Bẫy
- Bò ra máng từ xa theo `hutField` (đi thẳng ⇒ con bên kia sông kẹt).
- `hutField` dồn về giữa cửa ⇒ ≤ 3 m tới cửa đi thẳng tới chỗ chờ ô mình (leg `'wait'`, vào theo số = ô + 1).
- Zoom máng: gọi con gần máng nhất trong số sắp tới cữ, không phải con khát nhất.
- Đừng gật đầu bò quanh gáy (mõm lơ lửng). `c.bite` cộng thẳng, không qua lò xo.
- Máng nước = đáy + 4 thành (khối đặc che mặt nước).
- Mái chìa chuồng bò `EXT`: xà đầu vươn tới kèo mép, chống góc từ cột góc, không lơ lửng / đâm ra ngoài mái.
- Bê bú: bỏ va chạm với mẹ (`col.ghost`, `cowUnstick` bỏ qua); `cowNear` không bắt chước bê.
- Thân dài (a > 1,5 b) = siêu elip u⁴ + v⁴ (elip ⇒ góc thân lấn cây); dấu chân bò phủ cả cổ + đầu; lưới thật còn lấn ⇒ `colMeshTick` đẩy ra.
- `dogLie` (−0,8 rad, 1,8 m) đã quét không lấn chân giá treo, đống củi; dời ⇒ quét lại.
- Clip gà `'walking'` có chuyển động gốc: lúc nạp trừ dời khỏi rãnh vị trí; tốc độ phát = v / (`V_CLIP` × cỡ con).
- Gà né vật: chặn cứng ngoài r + 0,14 (chỉ đẩy ra ⇒ xuyên lò).
- `obstacleCoords` cần `y` + `h` (lưới bay ong / bướm; thiếu ⇒ NaN, cả cảnh không dựng). Cờ `coop` ⇒ gà chui gầm, chỉ né 4 chân.
- Cánh gà: chép trọng số 4 đỉnh da gần nhất + xương đại diện ngoài cây cảnh (tự đặt `matrixWorld`); gắn cứng 1 xương (spine_00 xoay 56–91°) hay neo cụm đỉnh da đều lệch. Bên phải lật toạ độ, không scale âm. `wingTick` chạy sau khi đặt vị trí, hướng gà.
- Xoay xương chân (cào, co, nhún) cộng sau `mixer.update`.
- Gà lên > 0,95 m / xuống > 2,2 m / chỗ đáp không đứng được = vật cản.
- `zoomCenter`: dò cả trong vòng, cách gốc táo ≥ `ZR` + 1,8 (chỉ dò dải chạy ⇒ chó chạy quanh gốc cây); giờ chạy chỉ trừ khi đã trên vòng.
- Chó xoay tại chỗ = kẹt khe (bảng ô 0,6 m lọt khe 12 cm): dùng `dogBlk` từ va chạm thật (`dogNavBuild`); `ffDir` ở ô cấm chọn ô kề trước; quay > 5,5 rad / 3 s tại chỗ ⇒ xuyên 1,5 s.
- Bậc cửa xe: chó nhảy `stairHop` (đi bộ ⇒ ngực xuyên sàn), chờ ở `dogStairA`, không ở `VAN.doorStep` (xuyên 2 bậc). Trú mưa tắt va chạm chó (`!dogRain.st`) ⇒ lộ trình tự đúng hình học.
- Thử chó zoom cận: giữ hướng máy ảnh cố định (bám hướng chó ⇒ chó quay mãi).
