# Côn trùng, ong, gấu mèo, thỏ, hươu, cá, bướm

<!-- toc -->
- Côn trùng · 0.4 KB
- Ong · 0.7 KB
- Gấu mèo · 3.0 KB
- Thỏ, cá, hươu · 2.1 KB
- Bẫy · 3.5 KB
- Số đo chuẩn · 1.2 KB
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
- `climb.js`: `plan()` chọn quả rìa tán phía camera (thử ≤ 4 quả, lấy quả tay với tới); `buildPath` → `raccoonRoute`; mount → up → reach → sit → eat → turn → down (chúc đầu, chậm hơn lên) → dismount (`end`); tới gốc: `navBlocked()` + `buildFlowField`.
- `route.js` `raccoonRoute`: đường trên vỏ thật, tính 1 lần / lượt trèo. Vỏ = `userData.barkGeo()` (dựng lại trên CPU, `keepBark` ở `fruitTree`) + `triGrid` (`_lib/tri-grid.js`, tia từ ngoài vào trục). Góc lăn quanh trục: quy hoạch động 16 hướng (cành nghiêng ⇒ mặt trên; thân / sườn / lưng vướng ống cành `userData.limbs` hay quả khác ⇒ né). Trả `P` (điểm bụng), `N`, `Tg`, `R` (bán kính vỏ thật), `FL` / `FR` + `NL` / `NR` (chỗ bám 2 bên, lệch `LAT`; 4 tia quanh chỗ đặt ⇒ nâng lên gờ vỏ ≤ 0,03 m), `gap(u, p, o)` (điểm cách vỏ thật bao xa: bảng bán kính 16 hướng / mẫu trục ⇒ thân méo, gốc loe đúng), `sdAt` (ống cành quanh `u`), `pushOut`.
- Dáng trèo: thân sát vỏ (`HC` × cao đứng), `frame()` = dây cung hông → vai + nâng khi vỏ gồ; chân trụ giữ tham số đường `F.u` (không trượt), nhịp chéo `OFF` + `DUTY` (≥ 3 chân bám); IK `rig.free`, `rig.abMax` nới góc dạng; `pawFlat` áp lòng bàn theo pháp tuyến chỗ bám, xuống thì bàn sau quay ngược.
- Không xuyên: `barkGap` = `route.gap`. Đuôi mềm `tail.push = tailPush` (vỏ → ống cành → vỏ, đệm 0,058 m = bán kính đuôi); đầu `headFree` (góc ngẩng gần nhất mà sọ + mõm hở vỏ / cành); cổ chân `footOut` lúc lên / xuống cây; quả trong tay `holdApple`.
- Quay đầu trên cành (`turn`): xoay quanh pháp tuyến vỏ về phía thoáng hơn (`turnSide`, đo ống cành 4 điểm dọc thân); mỗi chân 2 bước (sang ngang chỗ hông, rồi tới chỗ bám mới), lệch nhau `T_AT`.
- Cây: rê ⇒ viền chỉ thân (bản sao vô hình `ft3Trunk`, raycast rỗng, `pickSkip`; vỏ gộp cả cành); bấm ⇒ bảng 'jobs' "Gấu mèo ăn táo" (`choices` `{ lab, plan, why, run }`) ⇒ `camFollow` + `worldTell('appleTreeTap', ft3)`; `ft3Hole` khoét ô nhìn xuyên tán (`uHole`) quanh con đang trèo.
- `glb.js`: `SkinnedMesh` da `models/raccoon.glb` theo toạ độ bind (nghịch đảo `boneInverses`), không dáng nút mẫu; xương = khung hành vi (hông, L1/L2, `ankleH`, cổ, đầu, đuôi mềm) đặt theo khớp mẫu.

## Thỏ, cá, hươu
- `animals/bunny/` `bunnyTick`: `bunnyRain` → `bunnyDogNear` → `bunnyBed` → `bunnyLife` (`life.js`; true = tự lo dáng): alert → thump / flee về nấp `bunRefuge` → hide → peek; look, groom, trưa shade → loaf / flop, binky. Nhảy, lái `b.want`: bunny-movement.md.
- `animals/fish/fish.js` `fishLife`: lat → c (uốn chữ C) → burst → hide; graze; beg `FL_BEG`. Thứ tự `fishWanderTick`: `fishLife` → tranh lá rơi → `fishCruise`.
- `animals/fish/cruise.js` `fishCruise` (trạng thái `f.C`): cruise (quẫy – lướt tới điểm hẹn, 3 râu dò bờ, nước nông hơn `KOI_MIN_DEPTH` không vào) → hover (lơ lửng giữa đường / dưới lá sen) / nibble (rỉa cụm cây) / sip (ngoi lên đớp mặt nước rồi lặn). Điểm hẹn `koiWaypoint`: nước thoáng `koiOpen`, đáy `koiBed`, hoặc 1 điểm trong `KOI_SPOTS` (mặt cá `spot(S)`: cây thuỷ sinh `kind: 'plant'`, lá sen `kind: 'pad'`).
- Thân cá: `swim(t, wob, amp)` sóng chạy đầu → đuôi, biên độ theo tốc độ + lúc rẽ; nhóm xoay thứ tự 'YZX' (chúi / ngóc theo vận tốc đứng `f.vyS`, nghiêng khi rẽ). `fishSwimStep`: vận tốc đứng có trần, gặp bậc đáy thì nâng trước khi tới.
- Tránh nhau: nhìn trước 0,8 m + ½ thân ⇒ chậm lại + rẽ; gần < 0,55 m ⇒ tách tầng nước `sepY` ± 0,16; `fishBodyHit` (cùng tầng, đang tiến lại, < 0,22 m) chặn bước tới — dùng cho cruise + mọi dáng `fishSwimStep` chậm (`chaseV` < 1: tranh lá, ủi đáy, đón người). Cú lao giật mình không chặn.
- Rỉa cây: điểm hẹn = rìa cụm phía con cá (`S.r` + 0,45), đặt lại mỗi khung ⇒ không bơi xuyên cụm; tới gần chậm dần; `nibble` quay mặt vào cụm (lệch < 0,5 rad) rồi mới nhích tới + mổ (`P.nudge`, bọt); đang rỉa: đàn không kéo hướng, cụm bên cạnh không đẩy.
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
- Lưới vỏ đang vẽ đã giải phóng mảng đỉnh (`mem-trim`): đường trèo / đầu dò đọc `barkGeo()`, không raycast lưới vẽ.
- Vỏ thân méo (bán kính 0,13–0,65 m cùng một độ cao): khoảng hở tính theo trụ tròn ⇒ đuôi / đầu / chân lún mặt lồi, treo ở mặt lõm ⇒ dùng `route.gap`. Chỗ bám 1 tia ⇒ bàn chân lún gờ vỏ cạnh đó.
- Tán = bụi cành con: không thể hở mọi cành mảnh; `raccoonRoute` né ống ≥ `RMIN`, cành mảnh cắt ngang người là phần dư chấp nhận.
- Đích `rig.free` ngang / trên hông (tay ôm táo): góc dạng chân nhảy dấu ⇒ `quadruped.js` chặn mẫu số khi `abMax` bật. `abMax`, `tail.push` phải trả về lúc `end`.
- `angOf` (climb.js) cùng chiều `applyAxisAngle(UP, +θ)`; `−θ` ⇒ mép vùng cấm đối xứng.
- Bờ đông sông: nền san (`padH` ≠ null) bị `ffBlocked` cấm hết ⇒ dùng `navBlocked()`.
- Vá shader lá 1 cây ⇒ đổi `customProgramCacheKey`.
- `bunnyDogNear`: chó tiến lại = vận tốc chó chiếu về thỏ, không phải khoảng cách co. Sợ xong hồi `L.cd`. Mối nguy vào khoảng bỏ chạy ⇒ bỏ cả đào / gặm củ.
- Trạng thái sợ mới (life.js) ⇒ thêm vào regex chặn `bunnyBed` (body.js).
- Thử: khoá thời tiết bằng getter trên `liveWeather.state` (gán thường bị src/js/weather.js ghi đè); mưa ⇒ gấu mèo về hang.
- Thỏ: mọi lối bỏ dở bữa gọi `bunnyDropCarrot` (lưới an toàn `bunnyTick0`), không thì ngậm củ đi nhảy.
- Bộ khác giành dáng thỏ gọi `bunnyUpright`.
- Cá: `fishLife` (đàn) cũng ghi `f.ang` tới 0,8 rad/s ⇒ dáng đứng cần quay mặt phải tắt kéo đàn, không thì lệnh rẽ bị triệt. Con đang tranh lá / trong `fishLife` giữ `f.C` cũ (không chạy) ⇒ đọc `f.C` phải kiểm `C.fr`.
- Cá cắn câu, pha 'approach': nội suy theo `A.time / A.approachDuration` ngay trong khung (hệ số khung trước ⇒ cá nháy tới mồi 1 khung).

## Số đo chuẩn
- Ong: mưa ⇒ 8 con vào tổ ≤ 30 s; bay 15 phút: 0 con bị chặn.
- Gấu mèo (bấm cây, đứng bên kia khúc gỗ): tới gốc ≤ ~21 s, không kẹt.
- Koi (10 con, 120 s): 0 khung ra khỏi nước / vào đáy / nhảy vị trí; cặp cách < 0,12 m (3D): 0 trong 6 lượt; chia dáng ≈ cruise 0,6 · ủi đáy 0,2 · hover 0,1 · nibble 0,05 · sip 0,04. Rỉa cây (7200 khung): 9–10 lượt, 22–26 cú mổ, lệch hướng lúc mổ trung vị 0,06 rad (lớn nhất 0,48), miệng cách rìa cụm trung vị −0,05 m, 0 khung bơi xuyên cụm. Câu cá 150 s: đủ pha, NaN 0, cá mắc câu nhảy ≤ 0,18 m / khung.
- Gấu mèo trèo (6 lượt, 4 hướng camera, mọi khung, điểm thân với vỏ dựng lại): sâu nhất / tỉ lệ khung > 5 mm. Thân lên cành 10 mm / 0 %; thân xuống cành 37 mm / 0 %; đầu lên thân 43 mm / 4 %; bàn chân lên thân 57 mm / 14 %, lên cành 35 mm / 6 %, xuống 65–77 mm / 8–9 %; đuôi lên thân 4 %, lên cành 1 %, xuống 0 %, ngồi ăn ≤ 19 mm / 15 % (1 trong 6 lượt); quay đầu thân 12 mm / 0 %, đầu 49 mm / 11 %. Chân trụ trượt ≤ 15 mm lúc trèo. Bụng cách vỏ trung bình 43–47 mm.
