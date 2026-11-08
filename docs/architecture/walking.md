# Đi lại: chân, mặt đứng, va chạm

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.8 KB
- Chạy thế nào · 1.2 KB
- Bẫy · 1.7 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã

- `animals/_lib/quadruped.js` — `quadRig`: chân 4 chi (chó, gấu mèo, bò, hươu); bò `cowPose` (`animals/cows/herd-hut.js`), móng `cloveHoofGeo` (`animals/_lib/hoof.js`).
- `animals/storks/storks.js` — `storkLegSolve`, `storkWalk`.
- `engineer/body/pose-ik-walk.js` — `engWalkFeet`, `engFootIK`, `engLegSolve`; đường đi `engNavBuild`, `engField`, `engDir`, `engStep`. Gờ 1 khối, bậc cửa xe: `engineer/body/ledge.js`.
- `core/ground.js` `cowY` · `core/world.js` `envFree` · `core/helpers.js` `obstacleCoords`, `PROPS`, `NAV_MARKS`.
- `core/collide.js` — lớp va chạm `COL`; `loop/main-loop.js` gọi `colBuildTick(4)` tới `COL.ready`, rồi `colTick`, `colMeshTick`.
- Đo: `src/tools/debug/walkprobe.js` (`walkRun`), `src/tools/engineer-audit/`.

## Chạy thế nào

- Chân: nhịp theo QUÃNG ĐƯỜNG, chân trụ là điểm thế giới cố định, chân vung tới điểm đáp dự đoán, IK 2 đoạn, thân theo chỗ chân đứng. Kỹ sư: `e.footPlan = {p, fp}` cho pha tự đặt 2 bàn chân, xong gán null.
- Mặt đứng `cowY`: mặt đập → mặt đường → ô đất. `engGroundY` = max(`cowY`, `engSupports`) chỉ cho IK chân + kiểm bước kỹ sư. `colWalkY`: thêm đỉnh khoảng đặc ≤ ref + up (sàn chuồng, đống củi).
- Kỹ sư: `engNavBuild` dựng ô cấm ±45 m quanh xe từ `colHit` thật; `engField` BFS chênh ≤ `ENG_STEP_MAX` (1 voxel); `engStep` theo `engDir` khi đích > 1,2 và nối được, kẹt 2,5 s thì đi vòng; gờ 0,3–0,7 ⇒ `ledge.js`.
- Va chạm (kiểu Recast): tam giác lưới tĩnh → khoảng đặc [y0, y1] cột ô 0,125 m, ≤ `COL_TOP` trên đất. `mask`: bit 0 chung · 1 xe · 2 chuồng · 3 cành thấp (chỉ bò) · 4 riêng thỏ.
- Đơn vị tự khai `worldJoin('collide', …)`: `C.mover`, `C.dims`, `C.mesh`, `C.moving` (thân động, không vào lớp tĩnh). `colStepOK`: đi được nếu không lấn sâu hơn; `colSlide`: kẹt > 1,5 s ⇒ `ghost` 2 s.

## Bẫy

- Đừng thêm thư viện vật lý (Rapier / Jolt / Ammo: hàng trăm KB nén, chỉ giải vật rắn).
- `obstacleCoords.r` là bán kính NÊN TRÁNH (đã nới): đừng chặn cứng chó / gấu mèo bằng nó; đừng đưa vật nhỏ (đống củi, lò) vào `ENG_NAV` (lối hẹp ⇒ kẹt).
- Đường đi kỹ sư / chó dựng từ va chạm thật (`ENG_NAV`, `dogNavBuild`): lưới chung vẽ vật cản bằng vòng tròn ⇒ cửa xe thành ô cấm.
- Bảng riêng đi bằng `engDir`, không `ffDir` (chỉ vào ô sau vách ⇒ đứng ì); đi chéo so ô góc với CẢ ô đi lẫn ô tới (`engCornerOk`).
- Dưới mái bạt đừng truyền bảng chung cho `engStep` (ô quanh xe bị chặn ⇒ sai hướng).
- Móng bò: đừng phủ khối đen lên cổ chân; đế −0,15 (`ankleH`).
- Cây rừng rải ngẫu nhiên mỗi lần mở trang: khu mới phải chừa vùng trong `freeTree` (`nature/flowers-trees.js`). Đống củi cũng ngẫu nhiên: chỗ đứng trên đó dò lúc chạy.
- Thân cây trên lớp va chạm RỖNG: dò bán kính lấy vòng trống đầu tiên SAU khi gặp vỏ.
- Lượt xuyên đếm theo thời gian (`colTick`), không theo bước; đang quay sang hướng mới không tính kẹt.
- Dải cao `hi` tính từ mặt đất, không theo toạ độ thân.
- Đích của thú (đánh hơi, bát nước, vòng chạy) phải thử trên lớp va chạm.
- `cowY` lúc dựng cảnh chỉ gọi được từ tệp sau `core/ground.js` trong manifest.
- Thử không có khung hình: gọi `colBuildTick(50)` tới `COL.ready`. Mở trang lúc đêm thì chó đang trong xe.

## Số đo chuẩn

- Trượt TB bàn chân trụ (đv/khung, 30 hình/s): bò, hươu ≤ 0,0007 · cò ≤ 0,0013 · gấu mèo, kỹ sư ~0,003 (lúc ngoặt).
