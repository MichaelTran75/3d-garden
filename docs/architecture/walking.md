# Đi lại, va chạm

<!-- toc -->
- Mã · 1.0 KB
- Chạy thế nào · 3.6 KB
- Vật rời · 1.6 KB
- Bẫy · 9.1 KB
- Số đo chuẩn · 2.8 KB
<!-- /toc -->

## Mã

- `animals/_lib/quadruped.js` `quadRig`: 4 chân (chó, gấu mèo, bò, hươu); bò `cowPose` `animals/cows/herd-hut.js`; móng `cloveHoofGeo` `animals/_lib/hoof.js`
- Cò `animals/storks/storks.js`: `storkLegSolve`, `storkWalk`
- `engineer/body/pose-ik-walk.js`: `engWalkFeet`, `engFootIK`, `engLegSolve`, đường đi `engNavBuild`, `engField`, `engDir`, `engStep`, đoạn cuối `engNearGo` (`ENG_NEAR`), `engPoseClear`. Gờ 1 khối, bậc cửa xe: `engineer/body/ledge.js`
- `core/ground.js` `cowY` · `core/world.js` `envFree`, `PROPS`, `NAV_MARKS` · `core/helpers.js` `obstacleCoords`
- `core/collide.js` `COL`: `loop/main-loop.js` gọi `colBuildTick(4)` tới `COL.ready`, rồi `colTick`, `colMeshTick`
- Đo: `src/tools/debug/walkprobe.js` `walkRun`, `src/tools/debug/quadprobe.js` `quadTurn` / `quadWatch` (4 chân xoay tại chỗ), `src/tools/engineer-audit/` (`stepprobe.js` + `stepsum.py`: kỹ sư, chó lấn / xuyên vật cả ngày)

## Chạy thế nào

- Chân: nhịp theo quãng đường; chân trụ ghim điểm thế giới; chân vung tới điểm đáp dự đoán; IK 2 đoạn; thân theo chân
- `e.footPlan = {p, fp}`: pha tự đặt 2 bàn chân kỹ sư; xong gán null
- Mặt đứng `cowY`: mặt đập → mặt đường → ô đất. `engGroundY` = max(`cowY`, `engSupports`), chỉ cho IK chân + kiểm bước kỹ sư. `colWalkY`: thêm đỉnh khoảng đặc ≤ ref + up (sàn chuồng, đống củi)
- `engNavBuild`: ô cấm ±45 m quanh xe từ `colHit` + cạnh cấm `ENG_NAV.e`. `engField`: BFS chênh ≤ `ENG_STEP_MAX` (1 voxel), bỏ cạnh cấm (`ffEdge`); `engDir` cũng bỏ. `engStep`: theo `engDir` khi đích > 1,2 và nối được; kẹt 2,5 s ⇒ đi vòng; gờ 0,3–0,7 ⇒ `ledge.js`
- Cạnh cấm `navEdges(B, mask, lo, hi, vùng ô, H, rad)` (`core/flow-field.js`): lưới 0,1 m đọc `colHit`; cạnh giữa 2 ô mở bị chặn khi đĩa bán kính `rad` không đi được từ ô này sang ô kia trong hộp 2 tâm ± 0,3 m; 1 cạnh thẳng bị chặn ⇒ chặn 2 đường chéo của ô vuông 4 tâm đó. Kỹ sư `rad` 0,24 (`ENG_NAV.e`) · chó 0,17 (`dogNX.e`: vào `buildFlowField` qua `X`, `ffDir` qua `field.e`). ~45 ms / vùng kỹ sư
- Va chạm kiểu Recast: tam giác lưới tĩnh → khoảng đặc [y0, y1] mỗi cột ô 0,125 m, ≤ `COL_TOP` trên đất. Bit `mask`: 0 chung · 1 xe · 2 chuồng · 3 cành thấp (chỉ bò) · 4 thỏ
- Đơn vị tự khai `worldJoin('collide', …)`: `C.mover`, `C.dims`, `C.mesh`, `C.moving` (thân động, ngoài lớp tĩnh). `colStepOK`: đi nếu không lấn sâu hơn. `colSlide`: kẹt > 1,5 s ⇒ `ghost` 2 s
- Dấu chân `colFH(M, …)`: `M.round` ⇒ đĩa r = `a` (kỹ sư 0,24) · `M.caps` [lệch dọc mũi, r, …] ⇒ chuỗi đĩa (chó 4 đĩa r 0,17) · còn lại hộp `a` × `b`. `M.noGo` [{x, z, r}]: vùng tròn cấm ngoài lớp ô, cộng 20 × độ sâu tâm đĩa (chó: lòng bếp `FIRE_AVOID_R`; `dogNavBuild` cấm luôn ô trong vùng)
- Kỹ sư, đích ≤ 2,4 m mà đường thẳng vướng ⇒ `engNearGo`: bảng mịn ô 0,1 m quanh đích (ô đi được = đĩa thân không chạm gì), nhắm ô xa nhất còn thấy thẳng; null ⇒ `engStep` đi như cũ. `engPoseClear`: hình vẽ trễ sau vị trí va chạm ~0,25 m, lấn sâu hơn ⇒ kéo về phía vị trí va chạm
- Chó (`animals/dog/brain.js`): `yawStep` quay có kiểm khi đi (góc quay làm dấu chân lấn sâu hơn ⇒ thử nửa góc, không được thì giữ hướng) · `dogTurn(đích, k, mx)` xoay tại chỗ: dò cả cung tới đích (mẫu 0,12 rad) — cung ngắn chỉ sượt vành (≤ `TURN_GRAZE` 0,55 = 1 đĩa áp mặt phẳng, ≤ 5 điểm vành) ⇒ đi; vướng ⇒ cung dài bên kia; cả 2 vướng ⇒ quay tới sát vật rồi giữ hướng. Ngưỡng cả cung = max(giá lúc chọn, giá đang đứng, sượt); chiều đã chọn nhớ trong `turnArc` tới khi đổi chỗ / đổi đích / việc khác xoay chó; `mx` = trần rad mỗi lần gọi, cung dài thêm trần 3,2 rad/s · `steer`: `yawStep` bị từ chối + đích lệch > 1 rad ⇒ đứng lại, `dogTurn` chọn cung trống (≤ 2,5 s; không xoay nổi 0,4 s ⇒ thôi, nghỉ 6 s) · `unstick`: muốn đi mà dời < 0,15 m / 1,2 s ⇒ `backUp` lùi 0,9 s dọc thân (`backOK`: bước lùi sượt vành ≤ `TURN_GRAZE` hoặc không sâu hơn; chân bước lùi), rồi lệch ≤ 0,9 rad sang bên trống ~1,6 s; lần 2 trong 8 s đổi bên; lần 3 `ghost` 1,5 s

## Vật rời

- `core/gravity.js`: `GRAV` 9,81 · `fallStep(p, v, h, drag, g)` nghiệm đúng 1 bước ⇒ cùng quỹ đạo mọi fps, khớp `launchV` (ném T giây tới đích đúng T giây); cản tuyến tính, tới hạn g / drag · `hopLift` cung nhảy thỏ
- Dùng `fallStep`: cá ném lò, giọt vòi sen / lá sen / câu / cống, vụn cỏ máy cắt (drag 2,6), đất gà bới, mồ hôi kỹ sư; thỏ rơi khỏi mép cùng công thức (`animals/bunny/body.js`)
- `looseBody(r, { e, mu, rr, mask })` + `looseTick(B, dt, obj)`: 120 Hz (`fixedSteps`, `PHYS_H`), `obj` đặt nội suy, trả true khi nằm yên. Dùng: lõi táo gấu mèo (`animals/raccoon/climb.js`), táo rụng (`nature/apple-drop.js`). `rough` > 0: cú nảy lệch ngang 1 phần xung lượng, hướng băm từ chỗ chạm (cùng chỗ rơi ⇒ cùng đường nảy)
- `looseStep`: rơi → trần → vách (gỡ từng trục, dội `e`) → sàn → nảy (`e`, ma sát `mu`; chạm dưới `LOOSE_VB` thôi nảy) → lăn (dốc 5/7·g, cản `rr`·g, bậc ≤ `LOOSE_UP`) → nằm yên (hết đà / kẹt 0,25 s / 12 s); ô nước ⇒ `waterFx.ring`, nổi, không lên bờ; NaN ⇒ về vị trí bước trước
- Sàn `colRestY(x, z, ref, up, mask)`: `cowY` hoặc đỉnh khoảng đặc phủ đúng ô con 3,1 cm (`colBit`). `mask` 7 = chung + xe + chuồng
- Đo: `node --test docs/physics-probe/unit.cjs` (node:vm, địa hình giả) · `node docs/physics-probe/drop.cjs <url trang mkdbg> <thư mục ra>` (cảnh thật: thả rải, 20 / 60 / 144 fps, giá / bước, camera, tick hỏng, lõi táo + ảnh; `ONLY=`, `SEED=`)

## Bẫy

- Không thêm thư viện vật lý (Rapier / Jolt / Ammo)
- `obstacleCoords.r` đã nới (nên tránh): không chặn cứng chó / gấu mèo bằng nó
- Vật nhỏ (đống củi, lò) ngoài `ENG_NAV`: lối cạnh bếp lửa hẹp ⇒ kẹt
- Giá treo nồi + lòng bếp: `engStep` đi theo bảng thì đẩy mềm khỏi vòng `engFireRings` (lòng bếp `FIRE_AVOID_R`, mỗi chân chữ A 0,70 quanh giữa 2 cọc), như `PROPS`. Không cấm ô ở đó: lối bếp – đống củi còn ≈ 0,6 m. Bảng gần `engNear` thêm phạt mềm r 0,52 quanh giữa 2 cọc mỗi khung (cọc mảnh 1 cm: ô sát cọc đi được ⇒ tay vung sượt cọc)
- Đường kỹ sư / chó dựng từ va chạm thật (`ENG_NAV`, `dogNavBuild`), không lưới chung (vật cản tròn ⇒ cửa xe bị cấm)
- Bảng riêng đi bằng `engDir`, không `ffDir` (đứng ì sau vách). Đi chéo: so ô góc với cả ô đi lẫn ô tới (`engCornerOk`)
- Dưới mái bạt không truyền bảng chung cho `engStep` (sai hướng)
- Móng bò: không phủ khối đen lên cổ chân; đế −0,15 (`ankleH`)
- Cây rừng rải ngẫu nhiên mỗi lần mở: khu mới chừa trong `freeTree` (`nature/flowers-trees.js`). Đống củi ngẫu nhiên: chỗ đứng trên đó dò lúc chạy
- Thân cây trên lớp va chạm rỗng: dò bán kính lấy vòng trống đầu tiên sau vỏ
- Lượt xuyên đếm theo thời gian (`colTick`), không theo bước; đang quay không tính kẹt
- `colSlide` bước ngang 90° được ⇒ `M.stuck` = 0: vật tới – lui trong hốc không bao giờ tính kẹt ⇒ phải đo quãng dời thật (chó `unstick`; bò, hươu chưa có)
- Quay có kiểm trong khe hẹp: mọi góc bị từ chối + bước tới bị chặn ⇒ đứng ì; cần lối lùi (`backUp`)
- Xoay tại chỗ kiểm bằng dấu chân nới lề: góc hẹp từ chối mọi góc ⇒ thú giữ hướng lúc tới. Kiểm đúng dấu chân, cho sượt vành (`dogTurn`)
- `dogTurn`: chọn chiều lại mỗi khung ⇒ lắc qua lại quanh 180° · chỉ cho bước không sâu hơn bước trước ⇒ kẹt ở gờ nhỏ giữa cung (giá 1,0 giữa 0,9 và 0,6) · ngưỡng sượt ngay mức vành chạm (0,45 so với mẫu 0,40–0,50) ⇒ kẹt theo pha lấy mẫu: đặt giữa 2 mức (0,5 vành · 0,775 điểm nửa bán kính)
- Xoay tại chỗ (`quadRig`, không đi, không đổi dáng, tốc độ xoay > `TURN_ON` 0,35 rad/s): 2 cặp chân chéo (`mate`) thay nhau bước; điểm đáp = chỗ "nhà" xoay tới trước nửa cung trụ; thời gian bước co theo tốc độ xoay, ≥ `TURN_TMIN` 0,5 × `settleT`; cặp vừa bước nhường cặp đang chờ (`lastPair`); chân hết tầm với nhấc ngay; ≤ 2 chân trên không
- Xoay nhanh hơn mức bước 0,5 × `settleT` theo kịp ⇒ chân trụ bị kéo lê: giới hạn ở nơi gọi (chó `TURN_W` 3,5 rad/s trong `dogTurn`; bò ≤ 1,4, hươu ≤ 1,6, gấu mèo ≤ 2,6 tự nhiên, chưa cần)
- Bắt đầu xoay khi 2 chân đang trên không / ngay sau dáng nằm ⇒ chân thứ 3 lê vài khung
- Vừa nhích vừa xoay gắt (`o.pivot`, chỉ chó bật): tốc độ bàn chân do xoay × `pivot` > tốc độ đi ⇒ bước kiểu xoay tại chỗ, điểm đáp cộng nửa quãng đi (`lead`); vào 0,8 / ra 1,25. Nhịp theo quãng đường (chu kỳ = sải / tốc độ ≈ 3 s lúc nhích 0,13 m/s) không kịp cú xoay ⇒ chân trụ bị bỏ lại, lê
- Quãng trụ = duty × sải phải ≤ 2 × tầm với ngang (chó: hông 0,245, chân 0,264 ⇒ 0,196 m); dài hơn ⇒ IK kẹp tầm, bàn chân lê. Chó đi / kiệu có `vRef` 1,4 / 2,0 (đi chậm bước ngắn); trần quay lúc nhích (v < 0,4) = `TURN_W`
- Nhịp nhanh (kiệu, phi): điểm đáp `td` kẹp trong tầm với tính từ hông lúc đáp; chân trụ sắp hết tầm nhấc sớm (`up`), pha vung tính từ pha lúc nhấc (`F.p0`, `F.pp`) ⇒ không giật về trước. IK: dạng hông kẹp ±0,35 rad, gập kẹp 0,15 (L1 + L2)
- Chó phi: thân nhún `-0,03 s cos 4π(ψ + 0,07)`, hạ 0,02 s, chúc 0,12 cos 2πψ (`animals/dog/brain.js` `body`): thân đứng yên + chân duỗi hết ⇒ bàn chân rời điểm đặt
- Còn (chó): vừa đi vừa ngoặt ở trần quay ⇒ chân trụ lê 1–1,6 cm / khung (60 hình/s), 2–5 cm / lần, ~0,4 % khung trụ. Đã thử, không lợi: điểm đáp dẫn trước theo góc quay · hạ thân khi ngoặt. Chân trụ trong tầm vẫn trôi ~0,002 (đi) / 0,005 (kiệu)
- Thân bò / hươu trên bậc đất 0,6 m: cao độ cặp chân = `rig.pairY(i, j, dư)` (2 chân gần bằng ⇒ trung bình; lệch bậc ⇒ chân thấp + độ dư tầm với 0,04–0,05 × cỡ); cao độ thân = min(trước − s, sau + s), s = sin(góc chúc đang có) × nửa sải; hạ nhanh hơn nâng. Lấy trung bình 4 chân + góc chúc kẹp ±0,42 ⇒ chân thấp không với tới đất, treo lơ lửng, xoay theo thân
- Con thấp hơn bậc (bê, chân ≈ 0,49 m < bậc 0,6 m): 1 chân trên 1 chân dưới ⇒ thân theo chân thấp, chân kia gập vào ngực, bàn chân chìm trong bậc, có lúc đứng vậy > 10 s. `o.split` (bò `0,75 × cỡ`): điểm đặt lệch mức quá `split` so với chân cùng đầu thân ⇒ kéo về mức đất dưới điểm giữa cặp (`fit`, 2 chân cùng 1 phép chọn); đang đi, chân kia còn trụ mức cũ ⇒ nhấc cùng (`F.hop`, pha mượn `F.dp`, muộn nhất 40 % nhịp vung): cả cặp qua bậc 1 nhịp. `F.hy` = mức đất chỗ "nhà" chưa chỉnh; đất phẳng không dò thêm
- Còn: hụt nhỏ lúc bê chạy theo mẹ / chơi trên đất phẳng, vài lần ngắn ở mép bậc (≤ 1,2 s); bụng bê chạm mép bậc 0,6 m (góc chúc kẹp ±0,42). Gấu mèo, chó, hươu không `split`
- Đổi điểm đáp / ngưỡng xoay: đo cả 4 loài, 2 chiều (`quadprobe.js`)
- Bước lùi chỉ so "không sâu hơn" (`colStepOK`): đĩa lấy mẫu ⇒ giá nhảy 0,1 → 0,2 sau 2 cm ⇒ lùi huỷ ở khung 2, thú rung tại chỗ tới khi xuyên; cho sượt vành (`backOK`)
- Quay khi đi bị từ chối ở góc chữ L (thành + khối bậc): bước tới cũng chặn ⇒ rung tại chỗ; đứng lại xoay bằng `dogTurn` (`B.pv`), không được thì `unstick`
- Vật tròn thấp hơn dải `lo` của dấu chân (than, đá lòng bếp) không có trong lớp ô ⇒ khai `M.noGo`; chỉ đẩy lái (`rep`) thì thú vẫn đứng giữa bếp
- Ô `ENG_NAV` / `dogBlk` 0,6 m lấy 5 mẫu quanh tâm: tường mỏng (lan can mặt đập, rào trạm điện) lọt giữa 2 tâm ô ⇒ bảng đi xuyên tường, thân trượt tới – lui dọc tường mãi (`colSlide` luôn tìm được bước ⇒ không tính kẹt, không xuyên). Chặn bằng cạnh cấm `navEdges` theo bán kính thân: `rad` 0 ⇒ cột cuối lan can nằm trong hộp vẫn để cạnh mở; thiếu luật đường chéo ⇒ cắt góc quanh đầu tường
- Cạnh cấm đóng cả khe hẹp hơn thân (góc rào trạm điện – tường đập 0,54 m, thân 0,48) ⇒ đi vòng; đổi `rad` / dời rào ⇒ đếm lại ô tới được (không được mất ô)
- Không thêm vật nhỏ vào lưới ô (cửa xe bị cấm) — đoạn cuối dùng `ENG_NEAR`
- `stepsum.py` cột fp đo bằng `colFH` của app ⇒ đổi nghĩa khi đổi dấu chân / `noGo`; so trước – sau bằng số điểm lưới lọt trong vật
- Dải cao `hi` tính từ mặt đất, không toạ độ thân
- Đích thú (đánh hơi, bát nước, vòng chạy): thử trên lớp va chạm
- `cowY` lúc dựng: chỉ từ tệp sau `core/ground.js` (manifest)
- Thử không khung hình: `colBuildTick(50)` tới `COL.ready`. Mở trang lúc đêm ⇒ chó trong xe
- Chân gần thẳng khi đứng ⇒ hết tầm với ⇒ IK kẹp, chân trụ trượt: hạ thân / dời khớp hông / rút sải tới khi còn ~5 % chùng đầu–cuối pha trụ (đo hông → điểm đặt so với L1 + L2)
- IK chân bỏ lắc ngang thân / không dạng hông ⇒ chân trượt ngang. Nhánh settle chạy cả khi đang đi
- Vật rời nằm ở đỉnh cột va chạm (dải y mọi tam giác cắt cột) ⇒ trên mặt dốc / vật cao hẹp: cao hơn mặt nhìn thấy (thân lò chiminea tới 0,68)
- Lớp va chạm chỉ tới `COL_TOP` trên đất: mái cao hơn không đỡ vật rời. Vật rời sinh trong khối đặc ⇒ rơi xuyên xuống đất
- Mái xe + bạt: đặc trong lớp xe, không trả lời tia Raycaster ⇒ đo khe bằng tia ở đó vô nghĩa (xem ảnh). Vỏ cây sau `COL.ready`: tia trúng hộp thay thế, không `face`
- Lớp va chạm khác nhau giữa các lần mở trang (cây, củi ngẫu nhiên): so 2 phép đo trong cùng 1 lần mở
- Vật nổi chìm 6/10 thân ⇒ đáy thấp hơn `cowY` ô nước một chút: không phải lọt đất

## Số đo chuẩn

- Trượt TB chân trụ (đv/khung, 30 hình/s): bò, hươu ≤ 0,0007 · cò ≤ 0,0013 · gấu mèo, kỹ sư ~0,003 (lúc ngoặt)
- Cả ngày 8 đoạn (`stepprobe.js`, lượt đo có ≥ 2 điểm lưới trong vật khi đi / đứng): kỹ sư thân 0,11 % · chân 0,78 % · tay 0,16 % · đồ cầm 0,09 %, 0 lượt xuyên; chó thân 0,03 % · chân 0,06 % · đuôi 0,02 %, 2 lượt xuyên (chỗ trống, không lấn vật). Không gieo hạt ngẫu nhiên ⇒ dao động giữa các lượt
- Chó xoay tại chỗ ở hiên (2,86 rad, ≤ 2,2 rad/s): chân trụ trượt tổng 0,08 m, ≤ 0,006 m / khung (20 hình/s)
- Xoay tại chỗ tự nhiên, 5 mốc giờ × 420 s (`quadWatch`, trượt TB m / chân trụ / khung, 20 hình/s): chó 0,0017–0,0022 · bò 0,0006–0,0015 · hươu 0,0004–0,0010; gấu mèo không xoay tại chỗ ngoài dáng
- Cả ngày, có vòng đẩy `engFireRings`: giá treo nồi `outdoor wander · leg` ×32 / 12,7 s → ×1 / 0,0 s, khung kẹt 71 → 45; `dinner grab` giữ nguyên. Tổng % của lượt đo có hàng `Bóng tiếp đất · …` (lưới bóng nằm sát đất) lớn hơn thật ⇒ so từng cụm, bỏ hàng đó
- Chó đi tự nhiên, 2 mốc giờ × 420 s (`quadWatch` hàng walk, 20 hình/s): trượt TB 0,0022 m / chân trụ / khung; kiệu 0,0050
- Chó ép phi / kiệu / đi (20 hình/s, trượt TB m / chân trụ / khung · khung > 0,03): phi 0,012 · 366; kiệu 0,0056 · 31; đi 0,0037 · 36. Không kẹp tầm đáp: phi 0,029 · 930
- Bê trên bậc đất, 3 mốc giờ × 400 s, 2 bê: mẫu chân trụ hụt > 0,06 × cỡ 2,7 % (không `split`: 5,0 %); khung hụt > 15 cm 0,24 % (0,76 %); lần dài nhất 1,2 s (8,8–14 s). Bò lớn 0,1–1,0 %, hươu 0,15–0,4 %. Cỡ bò ngẫu nhiên mỗi lần mở ⇒ so tổng vài lượt
- Ép xoay π (`quadTurn`, trượt tổng m, chiều + / −): gấu mèo 2,2 rad/s 0,018 / 0,014 · 3,2: 0,025 / 0,015 · 9: 0,154 / 0,044; bò 1: 0,000 / 0,005 · 2,2: 0,097 / 0,023 · 3,2: 0,454 / 0,116; hươu 1: 0,007 / 0,005 · 2,2: 0,057 / 0,018 · 3,2: 0,035 / 0,016
- Táo rụng (ép rụng 35 quả, 3 cây): rơi 1,9–6,9 m, chạm đất 0,72–1,13 s, nảy 3 lần (4 nếu xuống bậc), nảy đầu 0,12–0,30 m, lăn 0,18–1,09 m, nằm yên sau 1,3–2,4 s; 20 / 60 / 144 fps trùng nhau. Tự nhiên: ~1 quả / phút / cây trong khung, cách ≥ 6 s, zoom xa 0 quả
- Vật rời `drop.cjs` hạt 7, 970 vật: 0 trong khối đặc, 0 chưa nằm yên, 1 dừng theo hạn 12 s; nằm yên trung vị 2,1 s; lệch 20 / 60 / 144 fps = 0; ~0,3 µs / bước
- Lõi táo: rơi 5,05 m trong 1,05 s, nảy 0,43 → 0,06 m, nằm yên 1,85 s, lăn trung vị 0,24 m
