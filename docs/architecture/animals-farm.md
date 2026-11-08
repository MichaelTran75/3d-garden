# Bò, gà, chó

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.6 KB
- Chạy thế nào · 0.5 KB
- Bẫy · 3.6 KB
<!-- /toc -->

## Mã

- `animals/cows/herd-hut.js` — bò + bê `cows`, chuồng `cowHut`; lượt `beasts`: `cowWatch` → `cowHome` / `cowFreeTick` (bê `calfFree`) → `cowPose`. `cows/routing.js`: `hutField`, `homeField`.
- `animals/chickens/chickens.js` — 3 gà GLB (`src/models/chicken.glb`, dựng bằng `src/tools/chicken/`): `steer`, `wingTick`, `roostTime`. Chuồng: `camp/chicken-coop.js`.
- `animals/dog/brain.js` — `behave`, `shelterTick` (hiên `DOG_PORCH` → bậc → xe), `watchTick`, `zoomCenter`; `dog/shelter.js`: `dogLie`, `dogRain`.
- Va chạm thú: `core/collide.js`; dẫn đường: `core/flow-field.js`.

## Chạy thế nào

- Bò: hành vi đặt đích mõm (`c.reach` cao trên đất / `c.reachY` tuyệt đối), `cowPose` hạ cổ tới khi chạm. `hx` > 0 = đầu quay về −z cục bộ.
- Bê nằm CHUNG mảng `cows` (va chạm, chuồng, dáng); chuồng dựng theo `cows.length`.
- Gà: cào → lùi → nhìn → mổ 1–2 vòng `'pecking'` → ngẩng; tối (`roostTime`, mặt trời thật) lên sào. Cỡ gà ×1,1 khớp `LEG` / `HOLE` của chuồng.

## Bẫy

- Bò ra máng từ xa phải theo `hutField`; đi thẳng ⇒ con bên kia sông đứng chết.
- `hutField` dồn về GIỮA cửa: ≤ 3 m tới cửa phải đi thẳng tới chỗ chờ ô mình (leg `'wait'`, vào theo số = ô + 1), không thì con ô ngoài cùng đứng mãi.
- Zoom máng: gọi con GẦN máng nhất trong số sắp tới cữ, không phải con khát nhất.
- Đừng gật đầu bò quanh gáy (mõm lơ lửng). `c.bite` cộng thẳng, không qua lò xo.
- Máng nước = đáy + 4 thành; khối đặc che mặt nước.
- Mái chìa chuồng bò (`EXT`): xà đầu vươn tới kèo mép + chống góc từ cột góc; không để chống lơ lửng / đâm ra ngoài mái.
- Bê bú: bỏ va chạm với mẹ (`col.ghost`, `cowUnstick` bỏ qua); `cowNear` không bắt chước bê.
- Thân dài (a > 1,5 b) là siêu elip u⁴ + v⁴ (elip để góc thân lấn cây); dấu chân bò phủ cả cổ + đầu; lưới thật còn lấn thì `colMeshTick` đẩy ra.
- `dogLie` (−0,8 rad, 1,8 m) đã quét không lấn chân giá treo / đống củi — dời phải quét lại.
- Cò đứng (`poseStandingStork`, animals/storks/storks.js): thân bay (phần 1, z < 17,2 + họng y < 4) thu về lưng, không thì vai thò thành vạt; `storkMaterial` 2 mặt.
- Clip `'walking'` của gà có chuyển động gốc: trừ dời khỏi rãnh vị trí lúc nạp, tốc độ phát = v / (`V_CLIP` × cỡ con), không thì trượt chân.
- Gà né vật: chỉ đẩy ra thì xuyên lò ⇒ chặn cứng ngoài r + 0,14.
- `obstacleCoords` phải có `y` + `h` (lưới bay ong / bướm; thiếu ⇒ NaN, cả cảnh không dựng). Cờ `coop` ⇒ gà chui gầm, chỉ né 4 chân.
- Cánh gà: gắn cứng 1 xương (spine_00 xoay 56–91°) hay neo cụm đỉnh da đều lệch ⇒ chép trọng số 4 đỉnh da gần nhất + xương đại diện ngoài cây cảnh (tự đặt `matrixWorld`); bên phải lật toạ độ, không scale âm; `wingTick` chạy SAU khi đặt vị trí / hướng gà.
- Xoay xương chân (cào, co, nhún): cộng SAU `mixer.update`.
- Gà lên > 0,95 m / xuống > 2,2 m / chỗ đáp không đứng được = vật cản.
- Dời cây táo `ft1` (nature/forest.js): mọi thứ đọc `ft1` phải dựng SAU dòng dời.
- Chú thích `//` giữa dòng từng nuốt `startPath`: ghi chú đặt sau câu lệnh cuối (`build.py` `swallowed()` chặn).
- `#toolPop.panel` phải `!important` — luật `.panel` chung cuối `src/css/app.css` thắng.
- Chữ hiện ra gọi người là "Engineer"; chú thích mã vẫn tiếng Việt.
- Đồ cầm (xẻng, đũa, cán chảo): đặt cả hướng cổ tay (`ckTool`, `ckGrip` — engineer/tasks/cooking.js), không thì xẻng chĩa ngang.
- `zoomCenter`: dò cả TRONG vòng + cách gốc táo ≥ `ZR` + 1,8 (chỉ dò dải chạy ⇒ chó chạy quanh gốc cây); giờ chạy chỉ trừ khi đã trên vòng.
- Chó xoay tại chỗ = kẹt khe (bảng ô 0,6 m lọt khe 12 cm): dùng `dogBlk` từ va chạm thật (`dogNavBuild`); `ffDir` ở ô cấm chọn ô KỀ trước; quay > 5,5 rad / 3 s tại chỗ ⇒ xuyên 1,5 s.
- Bậc cửa xe: chó NHẢY (`stairHop`; đi bộ thì ngực xuyên sàn), chờ ở `dogStairA`, không ở `VAN.doorStep` (xuyên 2 bậc). Lúc trú mưa va chạm chó tắt (`!dogRain.st`) ⇒ lộ trình phải tự đúng hình học.
- Thử chó khi zoom cận: giữ hướng máy ảnh cố định — bám hướng chó thì chó quay mãi.
