# Côn trùng, ong, gấu mèo, thỏ, hươu, cá, bướm

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.0 KB
- Ong · 0.6 KB
- Gấu mèo · 1.0 KB
- Thỏ, cá, hươu · 0.4 KB
- Bẫy · 3.3 KB
- Số đo chuẩn · 0.2 KB
<!-- /toc -->

## Mã

- `animals/_lib/insect-flight.js` — lưới bay ong + bướm: `refreshFlightNavigation` (vật cản = `flightRoots` + `worldJoin('flight')`), gỡ kẹt `insectUnstick`; mỗi con cấp `reroute()` / `navReset()`.
- `animals/bees/hive.js` — tổ giỏ rơm `beehive`, 6 ong bay quanh (`FLY`), `beeWeatherOK()` · `animals/bees/bees.js` — ong kiếm mật, kho mật hoa, `beeTick`.
- `animals/insects/butterflies.js` (hoa văn `bflyTex`, trú mưa `bflyShelter`) · `animals/insects/fireflies.js` (mỗi con 1 nhịp nháy, không đồng bộ).
- `animals/raccoon/` — `body.js` (hang `racMouth` / `racInside`, va chạm), `brain.js`, `climb.js`, `glb.js` (da `models/raccoon.glb`), `face.js` (`climbing`, `swipe`).
- `nature/forest.js` — cây táo già `ft3` (`worldPlace('oldAppleTree')`), khúc gỗ chết rỗng (`hollowMat`).
- `animals/bunny/` (`life.js` tập tính; nhảy né vật: bunny-movement.md) · `animals/fish/fish.js` (`fishLife`) · `animals/deer-crab/deer-crab.js` (`stagTick`).

## Ong

- `beeTick`, pha `b.ph2`: fly → land → feed → takeoff; về tổ: land vành giỏ → crawlIn (ẩn) → inside → crawlOut. Ra tổ khi `beeWeatherOK()` (khô, 6:20–18:00, gió < 24 km/h, ≥ 12 °C).
- Về tổ nhắm `hiveWorldPos` (`placeHiveNav`); A* bí ≥ 2 s ⇒ `beeRelay` (chặng trung gian `b.via`); kẹt trong vật cản ≥ 2 s ⇒ `insectUnstick`. Hoa trong `BEE_RANGE` quanh tổ.
- Gộp vẽ: thân ong bay quanh tổ → 'Động vật ban ngày'; cánh → `B.clear('Cánh ong', …)` (xem render.md). Tự vẽ: vỏ rơm, bánh sáp, ô + ong bò, nét viền.

## Gấu mèo

- Hang = lòng khúc gỗ: `den` → `exit` → `peek` → `out`; về `toMouth` → `enter` → `den`; di chuyển bằng `crawl(Q, speed, dt)`.
- Trèo cây táo già (`appleTrees[2]`): nhìn cận ≥ 1,5 s (`closeUp()`) hoặc tin `appleTreeTap` (`B.call` hạn 90 s); nghỉ `climbCD`. `climb.js`: `plan()` chọn quả rìa tán phía camera; `buildPath` (thân chiếu tia vào vỏ, cành theo `userData.limbs`); mount → up → reach → sit → eat → turn → down chúc đầu → dismount (`end`); chân trụ giữ tham số đường, IK `rig.free`; tới gốc theo `navBlocked()` + `buildFlowField`.
- Cây: rê ⇒ viền chỉ thân; bấm ⇒ bảng 'jobs' "Gấu mèo ăn táo" (`choices` `{ lab, plan, why, run }`) ⇒ `camFollow` + `worldTell('appleTreeTap', ft3)`; `ft3Hole` khoét ô nhìn xuyên tán (`uHole`) quanh con đang trèo.
- `glb.js`: `SkinnedMesh` từ đỉnh bind của mẫu, xương = khung hành vi (hông, L1/L2, `ankleH`, cổ, đầu, đuôi mềm đặt theo khớp mẫu).

## Thỏ, cá, hươu

- Thỏ `bunnyTick`: `bunnyRain` → `bunnyDogNear` → `bunnyBed` → `bunnyLife` (true = tự lo dáng): alert → thump / flee về chỗ nấp (`bunRefuge`) → hide → peek; look, groom, trưa shade → loaf / flop, binky.
- Cá `fishLife`: lat → c (uốn chữ C) → burst → hide; graze; beg (`FL_BEG`). Hươu `stagTick`: browse, graze, scan, groom, bed; alert → stamp (`rig.free[0]`) → flee (`stagFlee`) → look.

## Bẫy

- Lật gương `scale.x` âm: nút xoay nằm TRONG nhóm lật ⇒ 2 bên cùng góc (đom đóm, cánh sau bướm); xoay ở chính nút lật hoặc trên nó ⇒ bên phải góc đối `wR = −wL` (ong, cánh trước bướm).
- Lưới chép từ lưới thật (lượt độ sâu, lớp phủ thân cây…) dưới gốc vật cản bay phải `userData.noFlight`, không thì hộp bao bản sao thành khối trùm tổ, ong kẹt cả ngày.
- `hiveWorldPos` phải là ô bay trống (`flightNav.pointClear`), không dưới đất; lưới bay dựng lại ⇒ tìm lại.
- Bỏ dở hoa (đêm, trở trời, `navReset`) phải `cancelBeeNectar`, không thì `reserved` của hoa rò.
- hive.js đứng trước bees.js trong manifest, gọi `createBee()` nhờ hoisting ⇒ giữ nó là `function` tự đủ, không đọc `const` cấp tệp của bees.js.
- Nét viền tổ: `noBatch` + `renderOrder 10` + `depthWrite: false` (gộp lô đổi thứ tự hoà màu); vách ô 1 mặt mỗi bánh (2 mặt thành lưới rối). Vỏ rơm khối kín cần 2 lượt: đừng `forceSinglePass`.
- Gộp vẽ: mảnh soi gương (định thức < 0) phải đảo chiều tam giác cả khi trong suốt 2 mặt (không thì cánh phải sáng như mặt dưới); dựng lô bằng dãy ngẫu nhiên riêng (ăn `Math.random` chung ⇒ ong, đom đóm, chim lệch).
- Gấu mèo trong gỗ đi bằng `crawl`, KHÔNG qua `move()` (`racAvoidLog` đẩy điểm trong gỗ ra ngoài vỏ). Thêm trạng thái chui hang ⇒ thêm vào regex `mask` va chạm (body.js). `B.k` tăng đúng 1 lần / khung (2 lần = trượt chân).
- Mở trang lúc gấu mèo ngủ: đặt ở `racInside`, mặt ra miệng (không ở gốc toạ độ).
- Lòng gỗ tối dần theo độ sâu (`shade`) + đáy lót đất che mặt cỏ cắt vào lòng gỗ (trục dốc); thiếu thì miệng gỗ như mặt cắt đặc + mảng xanh.
- `angOf` (climb.js) đo cùng chiều `applyAxisAngle(UP, +θ)`; viết `−θ` là sang mép vùng cấm đối xứng.
- Bờ đông sông nằm trên nền san (`padH` ≠ null) mà `ffBlocked` cấm hết ⇒ bảng dẫn đường chung rỗng; phải dùng `navBlocked()`, không thì kẹt sau khúc gỗ.
- Da GLB lấy toạ độ bind (nghịch đảo `boneInverses`), không lấy dáng nút của mẫu.
- Vỏ cây là 1 lưới gộp cả cành ⇒ viền thân dùng bản sao vô hình (`ft3Trunk`, raycast rỗng, `pickSkip`). Vá shader lá riêng 1 cây phải đổi `customProgramCacheKey`.
- Thỏ: "đang tiến lại" = vận tốc của CHÓ chiếu về thỏ (`bunnyDogNear`), không phải khoảng cách co lại (thỏ tự nhảy lại gần cũng bị tính). Thiếu hồi `L.cd` sau mỗi lần sợ ⇒ giật ↔ ngó mỗi giây khi chó đứng mép tầm. Đang đào / gặm củ vẫn phải bỏ khi mối nguy vào khoảng bỏ chạy.
- Thêm trạng thái sợ ở life.js ⇒ thêm vào regex chặn `bunnyBed` (body.js). Lái thỏ qua `b.want`, đừng xoay thẳng thân (hop.js chọn hướng né lúc chạm đất).
- Thử: mưa thật ⇒ gấu mèo về hang, ong ở tổ — khoá thời tiết bằng getter trên `liveWeather.state` (gán thường bị src/js/weather.js ghi đè).

## Số đo chuẩn

- Ong: mưa ⇒ cả 8 con vào tổ ≤ 30 s; 15 phút bay không con nào bị chặn.
- Gấu mèo (bấm cây, đứng bên kia khúc gỗ): tới gốc ≤ ~21 s, không kẹt.
