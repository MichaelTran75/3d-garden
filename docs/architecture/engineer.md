# Kỹ sư

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.0 KB
- Tay · 0.7 KB
- Mặt · 0.4 KB
- Việc · 1.0 KB
- Phản ứng · 0.4 KB
- Bẫy · 3.3 KB
- Số đo chuẩn · 0.2 KB
<!-- /toc -->

## Mã

- `engineer/README.md` — bản đồ tệp `body/` · `mind/` · `tasks/`, lịch ngày, thứ tự mỗi khung, cách thêm việc.
- `engineer/face.js` — mặt công khai: đơn vị khác chỉ đọc kỹ sư qua `worldSee('engineer')`; kỹ sư chạm xe / trại qua `VAN.*`, `CAMP.*` (xem engine.md).
- `engineer/body/pose-ik-walk.js` — lớp tư thế, IK chân (walking.md), IK tay `engArmSolve`, `engArmPost`, `engWristPeg`. `body/model.js`: mảnh LEGO cứng, đầu Euler `YXZ`; gốc `YXZ` ở `body/instance-gait.js`.
- `engineer/body/face.js` — `engFace.tick`: mặt in, khẩu hình, chớp, dáng `BODY`, tay nắm `GRIP`.
- `engineer/mind/` — `schedule.js` (`engWantAct`), `hours.js`, `task-table.js` (`ENG_JOBS`), `reactions.js`, `env-react.js`, `weather-feel.js` (`WX`).
- `engineer/tasks/` — mỗi tệp một việc; trạm trong xe `VAN_STATIONS` (`tasks/cooking.js`); `engHandFor` (`tasks/meal-read.js`).
- Đo: `src/tools/engineer-audit/` (tua cả ngày, bắt lỗi), `docs/chop-probe/`.

## Tay

- Pha đặt mỗi khung `e.reachT[i]` (điểm thế giới), `e.handQ[i]` (hướng khung cổ tay), `e.elbowPole[i]` (hướng khuỷu); `engArmPost` giải nốt, ghi `e.handW` rồi xoá cả ba. `e.gripReq[i]` cũng đặt lại mỗi khung.
- `engHandFor(e, i, q, local, p)`: đặt điểm của đồ trong khung cổ tay (`SPOON_TIP`, `CUP_LIP`, `APPLE_L`, `CK_EDGE`…) vào p, hướng q.
- Cổ tay = chốt LEGO (`engWristPeg`, `ENG_WRIST_PEG`); tay không cầm lệch ≤ `ENG_WRIST_SWING`.
- Cúi người: cả thân nghiêng −0,1…0,12 rad, phần dư vào `e.waistBend` (cúi tới ×1,6); bộ điều khiển ghế (`direct`) giữ nghiêng cả thân.

## Mặt

- Mặt in vẽ lại canvas chỉ khi tham số đổi. Lớp sau đè lớp trước: cảm xúc → thời tiết → mệt → việc → suy nghĩ → cử chỉ / giật mình → ngáp / thở dài → ăn uống → nói → chớp; lớp đặt độ mở mắt thì bỏ mắt cười lớp dưới.
- Tay nắm (morph lưới tay): `e.gripReq` > cầm đồ > gõ phím > cử chỉ > với tới > thả lỏng.

## Việc

- Việc dụng cụ: mỗi pha một dòng `ENG_JOBS` (`run` mỗi khung, `tick` sau IK tay, `idle` khi bị cắt ngang). `engWantAct0`: `engForceAct` → `fireWant` → `trimWant` → `gardenWant` → `eatWant` → `autoWant` → lịch.
- Trạm trong xe `{ node, tick(e, V, dt, t, keep) }` trả `'released'` khi xong.
- Thái hành (`tasks/cooking.js` pha `chop`): `engHandFor(e, 0, aimQ(+x tủ bếp, trời), CK_EDGE, điểm cắt)`, tay trái cách lưỡi `CK_GAP`, bó hành `VAN.kitchen.bundle(zc)`, đường cắt `VAN.kitchen.CUT`.
- Trà `engTea` (cốc `CAMP.teaCup`, khung nắm `TEA_GQ`; rời pha giữa chừng `teaRelease`). Laptop: `lapPt`, `lapHandQ`, `lapClawLow`, `lapFrom`, `lapFKBase`, `lapDone`.
- Ngủ `tasks/sleep.js` (`engSleepTick`, `engSleepPost`); ngắm sao `skyWatch` (`tasks/sky-watch.js`); cắt cỏ: máy `camp/trimmer.js` (đặt ở `worldTick('tools')`, sau IK tay), việc `tasks/trim-grass.js`, cỏ `nature/meadow.js` `cutAt`.

## Phản ứng

- `engReactHold` (đứng lại) · `engReactPre` (trước `engPoseEnd`; `wxTick`, `envTick`) · `engReactPost` (sau IK chân, trước `engSeatPost`) · `engReactArms` (sau `engSeatPost`, trước `engArmPost`).
- `WX`: nhiệt độ biểu kiến + việc + lửa + trong xe − ướt, thân trễ 240 s → `hotK`, `coldK`.
- Lá trên người: `q.st = 6`, `water-leaves.js` gọi `q.hold` mỗi khung; `q.rxNo` chặn bắt lại 4 s.

## Bẫy

- Đọc vị trí đồ cầm giữa khung chỉ đúng sau khi tay đó đã giải (câu cá gọi `engArmSolve(e, 1)` trước khi đọc ngọn cần), hoặc dùng `e.handW[i]`.
- Vectơ đích là vùng nhớ riêng (vd `A.rh`), không dùng biến nháp chung bị ghi đè trong khung.
- Đồ dài (dao, sào, xẻng) phải đặt cả HƯỚNG (`e.handQ`); IK chỉ lo vị trí. Đặt điểm của đồ (quả, đầu thìa) tới đích, không đặt tâm bàn tay.
- Tay về FK giữa chừng: đặt lại lò xo góc vai `e.pose.shown/raw[4 + i]` (`lapFKBase`), không thì tay vọt.
- IK giơ tay quá đầu đọc lại ra góc Euler rác: hạ tay rồi mới sang FK (`lapDone`).
- Chặng tay mới nội suy từ điểm xuất phát đã ghi (`lapFrom`); `đích.lerp(e.handW, …)` mỗi khung ⇒ tay giật.
- Tay là mảnh cứng, không có da: sửa khớp, không thêm skin weight.
- Đặt đồ (laptop, cốc) trong tầm tay thật: ngoài tầm thì IK duỗi thẳng vẫn hụt.
- Đích tay cử chỉ tính sau khi đầu quay / cúi xong (`engReactArms`); sớm hơn ⇒ tay lơ lửng cách mũ.
- Cử chỉ lúc uống trà phải xong trước khi tay với cốc (`rxTeaLeft`).
- Pha mới ngồi ghế phải khai trong `engPhaseSeat` (`body/seats.js`), thiếu thì `engSeatGuard` bắt đứng dậy mỗi khung.
- Trạm trong xe bị ngắt (`keep` false): trả đồ cầm ngay (`bathHold`).
- Gốc Euler `YXZ`: nằm ngửa `rotation.x = −π/2`; nằm nghiêng trục thân cao hơn nệm nửa bề ngang thân (0,25), ngửa nửa bề dày (0,15). Pha nằm bị cắt ngang trả `rotation.x`, `pose.rawRX` về 0.
- Đổi việc khi thảm còn trải: giữ `'stars'`, gọi `skyWatch.stop()` cho cuộn thảm xong.
- Dò lại chỗ thảm phải qua `skyWatch.findSpot()` (kính dời theo, bỏ vật cản cũ của kính).
- `ENG_SLIM` thu mảnh thân, khớp KHÔNG đổi tỉ lệ (khớp méo ⇒ tay gập bị co); vai / hông ghi cứng phải nhân `ENG_SLIM`.
- Đồ phải ẩn / hiện (chăn gấp) đặt `userData.noBake` + `noBatch`.
- `VAN.awning` dò tấm bạt theo cỡ hình: đổi cỡ bạt mà không sửa chỗ dò thì `rxDry` luôn sai.
- Lá đậu trên mũ phải xét MỖI KHUNG (0,15 s/lần thì lọt).
- Sợi khói: toạ độ điểm tính từ gốc nguồn `S.mesh.position` (`rxSmokeAt`).
- Chỗ chó ngồi khi xoa đầu: đừng lọc theo `envFree` (đứng trong vùng tránh của cột khí tượng ⇒ luôn hỏng).
- Lệnh viết sau `//` cùng dòng bị nuốt vào chú thích: xuống dòng.
- Lưới động phải `computeBoundingBox` mỗi lần đổi đỉnh; lưới ẩn ở gốc toạ độ phải bỏ khỏi hộp dò rê chuột.
- GLB tải về: hàn đỉnh theo vị trí + bỏ tam giác 2 lớp trước khi giảm lưới (`src/tools/trimmer/`).
- Việc đi xa truyền bảng `buildFlowField` cho `engStep`: dự phòng khi bảng riêng chưa dựng / không nối tới (thiếu ⇒ kẹt sau xe); dưới mái bạt truyền null (walking.md).
- Nét viền xe dùng `vanLine(m)` (`core/axes-pin-bake.js`): draw-batch gộp theo thuộc tính vật liệu, vật liệu chung thì đổi độ mờ ăn cả nét công trình.

## Số đo chuẩn

- Thái hành (`docs/chop-probe/chop.js`): 0 khung lưỡi cách tay trái < 4 mm.
- Ăn ở bàn: vai dạng ≤ 30°. Cử chỉ ngồi: IK lệch ≤ 1,2 cm.
