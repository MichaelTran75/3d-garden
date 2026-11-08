# Đi lại, va chạm

<!-- toc -->
- Mã · 0.7 KB
- Chạy thế nào · 1.1 KB
- Bẫy · 1.8 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã

- `animals/_lib/quadruped.js` `quadRig`: 4 chân (chó, gấu mèo, bò, hươu); bò `cowPose` `animals/cows/herd-hut.js`; móng `cloveHoofGeo` `animals/_lib/hoof.js`
- Cò `animals/storks/storks.js`: `storkLegSolve`, `storkWalk`
- `engineer/body/pose-ik-walk.js`: `engWalkFeet`, `engFootIK`, `engLegSolve`, đường đi `engNavBuild`, `engField`, `engDir`, `engStep`. Gờ 1 khối, bậc cửa xe: `engineer/body/ledge.js`
- `core/ground.js` `cowY` · `core/world.js` `envFree`, `PROPS`, `NAV_MARKS` · `core/helpers.js` `obstacleCoords`
- `core/collide.js` `COL`: `loop/main-loop.js` gọi `colBuildTick(4)` tới `COL.ready`, rồi `colTick`, `colMeshTick`
- Đo: `src/tools/debug/walkprobe.js` `walkRun`, `src/tools/engineer-audit/`

## Chạy thế nào

- Chân: nhịp theo quãng đường; chân trụ ghim điểm thế giới; chân vung tới điểm đáp dự đoán; IK 2 đoạn; thân theo chân
- `e.footPlan = {p, fp}`: pha tự đặt 2 bàn chân kỹ sư; xong gán null
- Mặt đứng `cowY`: mặt đập → mặt đường → ô đất. `engGroundY` = max(`cowY`, `engSupports`), chỉ cho IK chân + kiểm bước kỹ sư. `colWalkY`: thêm đỉnh khoảng đặc ≤ ref + up (sàn chuồng, đống củi)
- `engNavBuild`: ô cấm ±45 m quanh xe từ `colHit`. `engField`: BFS chênh ≤ `ENG_STEP_MAX` (1 voxel). `engStep`: theo `engDir` khi đích > 1,2 và nối được; kẹt 2,5 s ⇒ đi vòng; gờ 0,3–0,7 ⇒ `ledge.js`
- Va chạm kiểu Recast: tam giác lưới tĩnh → khoảng đặc [y0, y1] mỗi cột ô 0,125 m, ≤ `COL_TOP` trên đất. Bit `mask`: 0 chung · 1 xe · 2 chuồng · 3 cành thấp (chỉ bò) · 4 thỏ
- Đơn vị tự khai `worldJoin('collide', …)`: `C.mover`, `C.dims`, `C.mesh`, `C.moving` (thân động, ngoài lớp tĩnh). `colStepOK`: đi nếu không lấn sâu hơn. `colSlide`: kẹt > 1,5 s ⇒ `ghost` 2 s

## Bẫy

- Không thêm thư viện vật lý (Rapier / Jolt / Ammo)
- `obstacleCoords.r` đã nới (nên tránh): không chặn cứng chó / gấu mèo bằng nó
- Vật nhỏ (đống củi, lò) ngoài `ENG_NAV`: lối cạnh bếp lửa hẹp ⇒ kẹt
- Đường kỹ sư / chó dựng từ va chạm thật (`ENG_NAV`, `dogNavBuild`), không lưới chung (vật cản tròn ⇒ cửa xe bị cấm)
- Bảng riêng đi bằng `engDir`, không `ffDir` (đứng ì sau vách). Đi chéo: so ô góc với cả ô đi lẫn ô tới (`engCornerOk`)
- Dưới mái bạt không truyền bảng chung cho `engStep` (sai hướng)
- Móng bò: không phủ khối đen lên cổ chân; đế −0,15 (`ankleH`)
- Cây rừng rải ngẫu nhiên mỗi lần mở: khu mới chừa trong `freeTree` (`nature/flowers-trees.js`). Đống củi ngẫu nhiên: chỗ đứng trên đó dò lúc chạy
- Thân cây trên lớp va chạm rỗng: dò bán kính lấy vòng trống đầu tiên sau vỏ
- Lượt xuyên đếm theo thời gian (`colTick`), không theo bước; đang quay không tính kẹt
- Dải cao `hi` tính từ mặt đất, không toạ độ thân
- Đích thú (đánh hơi, bát nước, vòng chạy): thử trên lớp va chạm
- `cowY` lúc dựng: chỉ từ tệp sau `core/ground.js` (manifest)
- Thử không khung hình: `colBuildTick(50)` tới `COL.ready`. Mở trang lúc đêm ⇒ chó trong xe
- Chân gần thẳng khi đứng ⇒ hết tầm với ⇒ IK kẹp, chân trụ trượt: hạ thân / dời khớp hông / rút sải tới khi còn ~5 % chùng đầu–cuối pha trụ (đo hông → điểm đặt so với L1 + L2)
- IK chân bỏ lắc ngang thân / không dạng hông ⇒ chân trượt ngang. Nhánh settle chạy cả khi đang đi

## Số đo chuẩn

- Trượt TB chân trụ (đv/khung, 30 hình/s): bò, hươu ≤ 0,0007 · cò ≤ 0,0013 · gấu mèo, kỹ sư ~0,003 (lúc ngoặt)
