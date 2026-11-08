# Côn trùng, ong, gấu mèo, thỏ, hươu, cá, bướm

<!-- toc -->
- Côn trùng · 0.4 KB
- Ong · 0.7 KB
- Gấu mèo · 1.4 KB
- Thỏ, cá, hươu · 0.5 KB
- Bẫy · 2.3 KB
- Số đo chuẩn · 0.2 KB
<!-- /toc -->

## Côn trùng
- `animals/_lib/insect-flight.js`: lưới bay ong, bướm `refreshFlightNavigation` (vật cản `flightRoots` + `worldJoin('flight')`); trong vật cản ≥ 2 s ⇒ `insectUnstick`; mỗi con cấp `reroute()`, `navReset()`.
- `animals/insects/butterflies.js`: hoa văn `bflyTex`, trú mưa `bflyShelter`.
- `animals/insects/fireflies.js`: mỗi con 1 nhịp nháy riêng.

## Ong
- `animals/bees/hive.js`: tổ giỏ rơm `beehive`, 6 ong bay quanh `FLY`; ra tổ khi `beeWeatherOK()`: khô, 6:20–18:00, gió < 24 km/h, ≥ 12 °C.
- `animals/bees/bees.js`: kiếm mật, kho mật hoa, hoa trong `BEE_RANGE` quanh tổ; `beeTick` pha `b.ph2`: fly → land → feed → takeoff; về: land vành giỏ → crawlIn (ẩn) → inside → crawlOut.
- Về tổ nhắm `hiveWorldPos` (`placeHiveNav`); A* bí ≥ 2 s ⇒ `beeRelay` (chặng giữa `b.via`).
- Gộp vẽ (render.md): thân ong quanh tổ → 'Động vật ban ngày', cánh → `B.clear('Cánh ong', …)`; vẽ riêng: vỏ rơm, bánh sáp, ô + ong bò, nét viền.

## Gấu mèo
- `animals/raccoon/`: `body.js` (hang `racMouth`, `racInside`; va chạm), `brain.js`, `face.js` (`climbing`, `swipe`).
- Hang = lòng gỗ rỗng (`nature/forest.js` `hollowMat`): `den` → `exit` → `peek` → `out`; về `toMouth` → `enter` → `den`; đi `crawl(Q, speed, dt)`.
- Trèo táo già `ft3` = `appleTrees[2]` (`worldPlace('oldAppleTree')`) khi nhìn cận ≥ 1,5 s (`closeUp()`) hoặc tin `appleTreeTap` (`B.call` hạn 90 s); nghỉ `climbCD`.
- `climb.js`: `plan()` chọn quả rìa tán phía camera; `buildPath`: thân chiếu tia vào vỏ, cành theo `userData.limbs`; mount → up → reach → sit → eat → turn → down (chúc đầu) → dismount (`end`); chân trụ giữ tham số đường, IK `rig.free`; tới gốc: `navBlocked()` + `buildFlowField`.
- Cây: rê ⇒ viền chỉ thân (bản sao vô hình `ft3Trunk`, raycast rỗng, `pickSkip`; vỏ gộp cả cành); bấm ⇒ bảng 'jobs' "Gấu mèo ăn táo" (`choices` `{ lab, plan, why, run }`) ⇒ `camFollow` + `worldTell('appleTreeTap', ft3)`; `ft3Hole` khoét ô nhìn xuyên tán (`uHole`) quanh con đang trèo.
- `glb.js`: `SkinnedMesh` da `models/raccoon.glb` theo toạ độ bind (nghịch đảo `boneInverses`), không dáng nút mẫu; xương = khung hành vi (hông, L1/L2, `ankleH`, cổ, đầu, đuôi mềm) đặt theo khớp mẫu.

## Thỏ, cá, hươu
- `animals/bunny/` `bunnyTick`: `bunnyRain` → `bunnyDogNear` → `bunnyBed` → `bunnyLife` (`life.js`; true = tự lo dáng): alert → thump / flee về nấp `bunRefuge` → hide → peek; look, groom, trưa shade → loaf / flop, binky. Nhảy, lái `b.want`: bunny-movement.md.
- `animals/fish/fish.js` `fishLife`: lat → c (uốn chữ C) → burst → hide; graze; beg `FL_BEG`.
- Hươu `animals/deer-crab/deer-crab.js` `stagTick`: browse, graze, scan, groom, bed; alert → stamp (`rig.free[0]`) → flee `stagFlee` → look.

## Bẫy
- `scale.x` âm (lật gương): xoay trong nhóm lật ⇒ 2 bên cùng góc (đom đóm, cánh sau bướm); xoay ở / trên nút lật ⇒ `wR = −wL` (ong, cánh trước bướm).
- Lưới chép (lượt độ sâu, phủ thân cây…) dưới gốc vật cản bay cần `userData.noFlight` (thiếu ⇒ hộp bao trùm tổ).
- `hiveWorldPos` = ô bay trống (`flightNav.pointClear`), không dưới đất; dựng lại lưới bay ⇒ tìm lại.
- Bỏ dở hoa (đêm, trở trời, `navReset`) ⇒ `cancelBeeNectar`, không thì rò `reserved`.
- hive.js trước bees.js (manifest), gọi `createBee()` nhờ hoisting ⇒ giữ `function` tự đủ, không đọc `const` cấp tệp bees.js.
- Viền tổ: `noBatch` + `renderOrder 10` + `depthWrite: false` (lô đổi thứ tự hoà màu). Vách ô 1 mặt / bánh. Vỏ rơm cần 2 lượt: cấm `forceSinglePass`.
- Gộp vẽ: mảnh định thức < 0 đảo chiều tam giác, kể cả trong suốt 2 mặt; lô dùng dãy ngẫu nhiên riêng, không `Math.random` chung.
- Gấu mèo trong gỗ: `crawl`, không `move()` (`racAvoidLog` đẩy ra vỏ). Trạng thái chui hang mới ⇒ thêm vào regex `mask` (body.js). `B.k` +1 đúng 1 lần / khung (2 ⇒ trượt chân).
- Mở trang lúc ngủ: gấu mèo ở `racInside`, mặt ra miệng.
- Lòng gỗ cần `shade` (tối theo sâu) + đáy lót đất che cỏ cắt vào (trục dốc).
- `angOf` (climb.js) cùng chiều `applyAxisAngle(UP, +θ)`; `−θ` ⇒ mép vùng cấm đối xứng.
- Bờ đông sông: nền san (`padH` ≠ null) bị `ffBlocked` cấm hết ⇒ dùng `navBlocked()`.
- Vá shader lá 1 cây ⇒ đổi `customProgramCacheKey`.
- `bunnyDogNear`: chó tiến lại = vận tốc chó chiếu về thỏ, không phải khoảng cách co. Sợ xong hồi `L.cd`. Mối nguy vào khoảng bỏ chạy ⇒ bỏ cả đào / gặm củ.
- Trạng thái sợ mới (life.js) ⇒ thêm vào regex chặn `bunnyBed` (body.js).
- Thử: khoá thời tiết bằng getter trên `liveWeather.state` (gán thường bị src/js/weather.js ghi đè); mưa ⇒ gấu mèo về hang.
- Thỏ: mọi lối bỏ dở bữa gọi `bunnyDropCarrot` (lưới an toàn `bunnyTick0`), không thì ngậm củ đi nhảy.
- Bộ khác giành dáng thỏ gọi `bunnyUpright`.

## Số đo chuẩn
- Ong: mưa ⇒ 8 con vào tổ ≤ 30 s; bay 15 phút: 0 con bị chặn.
- Gấu mèo (bấm cây, đứng bên kia khúc gỗ): tới gốc ≤ ~21 s, không kẹt.
