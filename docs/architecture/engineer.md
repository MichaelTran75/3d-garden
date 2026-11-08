# Kỹ sư

<!-- toc -->
- Mã · 0.9 KB
- Tay · 1.3 KB
- Mặt · 0.4 KB
- Việc · 0.9 KB
- Câu cá (`tasks/angling.js`) · 0.5 KB
- Phản ứng · 0.4 KB
- Bẫy · 3.3 KB
- Số đo chuẩn · 0.2 KB
<!-- /toc -->

## Mã

- `engineer/README.md`: bản đồ tệp `body/` · `mind/` · `tasks/`, lịch, thứ tự khung, thêm việc
- `engineer/face.js`: mặt (`worldSee('engineer')`); kỹ sư chạm xe / trại qua `VAN.*`, `CAMP.*` (engine.md)
- `engineer/body/pose-ik-walk.js`: lớp tư thế, IK chân (walking.md), IK tay `engArmSolve`, `engArmPost`, `engWristPeg`
- `body/model.js`: mảnh LEGO cứng, đầu Euler `YXZ`; gốc `YXZ` ở `body/instance-gait.js`
- `engineer/body/face.js` `engFace.tick`: mặt in, khẩu hình, chớp, dáng `BODY`, tay nắm `GRIP`
- `engineer/mind/`: `schedule.js` (`engWantAct`), `hours.js`, `task-table.js` (`ENG_JOBS`), `reactions.js`, `env-react.js`, `weather-feel.js` (`WX`)
- `engineer/tasks/`: 1 tệp 1 việc; trạm trong xe `VAN_STATIONS` (`tasks/cooking.js`); `engHandFor` (`tasks/meal-read.js`)
- Đo: `src/tools/engineer-audit/` (tua cả ngày, bắt lỗi)

## Tay

- Pha đặt mỗi khung `e.reachT[i]` (điểm thế giới), `e.handQ[i]` (hướng khung cổ tay), `e.elbowPole[i]` (hướng khuỷu); `engArmPost` giải, ghi `e.handW`, xoá cả ba
- `e.gripReq[i]` cũng xoá mỗi khung
- `engHandFor(e, i, q, local, p)`: điểm đồ trong khung cổ tay (`SPOON_TIP`, `CUP_LIP`, `APPLE_L`, `CK_EDGE`…) tới p, hướng q
- Cổ tay = chốt LEGO (`engWristPeg`, `ENG_WRIST_PEG`); tay không cầm lệch ≤ `ENG_WRIST_SWING`
- Cúi: cả thân nghiêng −0,1…0,12 rad, dư vào `e.waistBend` (cúi tới ×1,6); ghế (`direct`) nghiêng cả thân
- `aimQ(dir, up)`: +y = hướng tay → khuỷu; `up` = trời khi khuỷu dưới tay ⇒ bàn tay lật 120–172° ⇒ `engWristUp(e, i, dir)` (ngược `e.foreW[i]`): 10–50°. Lưới tay xoay β quanh lỗ tay; vòng tay quanh thanh cầm (trục x cổ tay dọc thanh)
- Vòng tay chữ C quanh quai cần cẳng tay ⊥ trục cốc; cực khuỷu mặc định ⇒ cổ tay gập 137° ⇒ `teaElbow`: khuỷu trên vòng IK sát +y cổ tay chúc ~40° theo trục cốc, cực trượt mượt
- IK tay kẹp vai–tay ≥ 0,3 đv (~25 cm): đường thẳng tay vịn → môi lướt sát vai ⇒ giật ⇒ cho đường phình ra trước

## Mặt

- Mặt in vẽ lại canvas chỉ khi tham số đổi
- Lớp sau đè trước: cảm xúc → thời tiết → mệt → việc → suy nghĩ → cử chỉ / giật mình → ngáp / thở dài → ăn uống → nói → chớp; lớp đặt độ mở mắt bỏ mắt cười lớp dưới
- Tay nắm (morph lưới tay): `e.gripReq` > cầm đồ > gõ phím > cử chỉ > với tới > thả lỏng

## Việc

- `ENG_JOBS` mỗi pha 1 dòng: `run` mỗi khung, `tick` sau IK tay, `idle` khi bị cắt ngang
- `engWantAct0`: `engForceAct` → `fireWant` → `trimWant` → `gardenWant` → `eatWant` → `autoWant` → lịch
- Trạm trong xe `{ node, tick(e, V, dt, t, keep) }` trả `'released'` khi xong
- Thái hành (`tasks/cooking.js` pha `chop`): `engHandFor(e, 0, aimQ(+x tủ bếp, trời), CK_EDGE, điểm cắt)`; tay trái cách lưỡi `CK_GAP`; bó hành `VAN.kitchen.bundle(zc)`; đường cắt `VAN.kitchen.CUT`
- Trà `engTea`: cốc `CAMP.teaCup`, khung nắm `TEA_GQ`, rời pha giữa chừng `teaRelease`
- Laptop: `lapPt`, `lapHandQ`, `lapClawLow`, `lapFrom`, `lapFKBase`, `lapDone`
- Ngủ `tasks/sleep.js` (`engSleepTick`, `engSleepPost`); ngắm sao `skyWatch` (`tasks/sky-watch.js`)
- Cắt cỏ: máy `camp/trimmer.js` (`worldTick('tools')`, sau IK tay), việc `tasks/trim-grass.js`, cỏ `nature/meadow.js` `cutAt`

## Câu cá (`tasks/angling.js`)
- 120 Hz `anglingPhysStep` (bước cố định, ARCHITECTURE mục "Vật lý"): cần uốn → ngọn `_aTip` → cá → phao + mồi Verlet → lực dây `A.T`; NaN ⇒ đặt lại ở đầu `updateFishingBite`
- Vẽ nội suy `alpha`: `rodFlexPose(alpha)` (`X.thp → X.th`), `_aTipR`, `_dF`/`_dB` (`Fp→F`, `Bp→B`), `_dM` (`Mp→M`); quán tính gốc `rodFlexAcc(rod, dt)` theo khung
- Như nhau 15 / 60 / 144 fps (phao 0,42 · lực dây 0,178)

## Phản ứng

- `engReactHold` đứng lại · `engReactPre` trước `engPoseEnd` (`wxTick`, `envTick`) · `engReactPost` sau IK chân, trước `engSeatPost` · `engReactArms` sau `engSeatPost`, trước `engArmPost`
- `WX` = nhiệt độ biểu kiến + việc + lửa + trong xe − ướt; thân trễ 240 s → `hotK`, `coldK`
- Lá trên người: `q.st = 6`, `water-leaves.js` gọi `q.hold` mỗi khung; `q.rxNo` chặn bắt lại 4 s

## Bẫy

- Đọc đồ cầm giữa khung: sau khi tay đó giải (câu cá: `engArmSolve(e, 1)` rồi đọc ngọn cần) hoặc `e.handW[i]`. Trước IK ⇒ lệch: `engEatRice` đọc lòng chảo `P.handPan.localToWorld` khi tay trái còn góc ước lượng (`arms[1].rotation.x = −0,9`) ⇒ thìa không xuống chảo; đúng: từ đích tay kia cùng khung (`pan`, `qPan`)
- Ma trận đồ đang gắn cổ tay đọc trước `engArmPost` = tư thế `engPoseBegin` vừa trả ⇒ đích lệch 0,55 m, kẹt. Cốc trà: chỉ đọc cốc khi còn trong vòng tay vịn; lúc cầm dùng đích lưu khi nắm (`e.teaG0`/`e.teaQ0`) hoặc tư thế dự định (quai từ `qL`)
- Vectơ đích: vùng nhớ riêng (`A.rh`), không biến nháp chung (bị ghi đè trong khung)
- Đồ dài (dao, sào, xẻng, đũa, cán chảo): đặt cả hướng `e.handQ` (`ckTool`, `ckGrip`, `tasks/cooking.js`); IK chỉ lo vị trí
- Đưa điểm đồ (quả, đầu thìa) tới đích, không tâm bàn tay
- Tay về FK giữa chừng: đặt lại lò xo vai `e.pose.shown/raw[4 + i]` (`lapFKBase`), không thì vọt
- IK tay quá đầu đọc lại ra Euler rác: hạ tay rồi mới FK (`lapDone`)
- Chặng tay mới nội suy từ điểm xuất phát đã ghi (`lapFrom`); `đích.lerp(e.handW, …)` mỗi khung ⇒ giật
- Tay mảnh cứng, không da: sửa khớp, không skin weight
- Đồ (laptop, cốc) trong tầm tay thật; ngoài tầm IK duỗi vẫn hụt
- Đích tay cử chỉ tính sau khi đầu quay / cúi (`engReactArms`); sớm ⇒ tay lơ lửng cách mũ
- Cử chỉ lúc uống trà xong trước khi với cốc (`rxTeaLeft`)
- Pha ngồi ghế mới khai trong `engPhaseSeat` (`body/seats.js`); thiếu ⇒ `engSeatGuard` bắt đứng dậy mỗi khung
- Trạm trong xe bị ngắt (`keep` false): trả đồ cầm ngay (`bathHold`)
- Gốc `YXZ`: nằm ngửa `rotation.x = −π/2`; trục thân trên nệm: nghiêng 0,25, ngửa 0,15 (nửa bề ngang / dày thân)
- Pha nằm bị cắt ngang ⇒ `rotation.x`, `pose.rawRX` về 0
- Đổi việc khi thảm còn trải: giữ `'stars'`, gọi `skyWatch.stop()` cho cuộn xong
- Dò lại chỗ thảm: `skyWatch.findSpot()` (kính dời theo, bỏ vật cản cũ)
- `ENG_SLIM` thu mảnh thân, khớp giữ tỉ lệ (méo ⇒ tay gập co); vai / hông ghi cứng nhân `ENG_SLIM`
- Đồ ẩn / hiện (chăn gấp): `userData.noBake` + `noBatch`
- `VAN.awning` dò bạt theo cỡ hình: đổi cỡ bạt ⇒ sửa chỗ dò, không thì `rxDry` sai
- Lá đậu mũ: xét mỗi khung (0,15 s/lần lọt)
- Sợi khói: toạ độ tính từ gốc nguồn `S.mesh.position` (`rxSmokeAt`)
- Chỗ chó ngồi khi xoa đầu: không lọc `envFree` (vùng tránh cột khí tượng ⇒ hỏng)
- Lưới động: `computeBoundingBox` mỗi lần đổi đỉnh; lưới ẩn ở gốc toạ độ bỏ khỏi hộp dò rê chuột
- GLB tải về: hàn đỉnh theo vị trí + bỏ tam giác 2 lớp trước khi giảm lưới (`src/tools/trimmer/`)
- Việc đi xa: truyền `buildFlowField` cho `engStep` (dự phòng bảng riêng chưa dựng / không nối; thiếu ⇒ kẹt sau xe); dưới mái bạt null (walking.md)

## Số đo chuẩn

- Thái hành (`docs/chop-probe/chop.js`): 0 khung lưỡi cách tay trái < 4 mm
- Ăn ở bàn: vai dạng ≤ 30°
- Cử chỉ ngồi: IK lệch ≤ 1,2 cm
