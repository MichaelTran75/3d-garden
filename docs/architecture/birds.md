# Chim: cò, chim sẻ

<!-- toc -->
- Mã · 0.4 KB
- Cò · 0.8 KB
- Chim sẻ · 1.2 KB
- Bẫy · 1.2 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã
- `animals/storks/storks.js`: 3 cò trắng `updateStorkLife`.
- `animals/sparrows/songbird.js`: `makeSparrow(brain, size, plum)` (hình + phản xạ chung), con ở trại, 2 hộp tổ (`makeNestBox` → `nestPairs`), đàn 5 `flock`, `updateSparrows`.
- `animals/sparrows/gang.js`: bầy 6 `sparrowGang` theo `SPARROW_CAST` (`think`, `doAct` / `nextAct`, `flee` / `alarm` / `mob`, ve vãn `display`). `face.js`: `worldSee('sparrows').all()`.

## Cò
- Lội (`b.state` 'wade', pha `b.fg`): walk → wait (rình) → strike (trúng ~1/3) → swallow; greet; rest: 1 chân (`b.oneLeg`), rụt cổ, rỉa lông, duỗi cánh. Cất cánh chỉ từ walk / wait khi đã hạ chân.
- Dáng đứng `poseStandingStork` = biến dạng lưới bay, mỗi đỉnh thuộc 1 nhánh: `part` 1 z < 17,2 (hoặc họng y < 4) thu về lưng sát ức (không thì vai thò thành vạt), z > 17,2 theo cổ; vòng gốc cổ (z < 18) co về tiết diện ống cổ, xoay nửa góc cổ (`c2`, `s2`). `storkMaterial` 2 mặt.
- Lượn cột khí nóng `animals/storks/storks.js` (`STK_T`, `stkLift`, `stkC1`): gần cột (< 2,6 R) xoắn tiếp tuyến cùng chiều cột (nhắm tâm ⇒ rẽ ngược, lật); vào 'circle' ở 1,35 R (R + 1,5 ⇒ kẹt vòng ngoài vì lái trễ).

## Chim sẻ
- Cánh: lật gương ở nhóm "bên" (`side.scale.x = s`), không `scale.x = −s` ngay trên nhóm vai (2 cánh xuyên thân, chéo X); vai, cổ tay viết cho cánh phải (sải +x, mép trước +z, lưng +y); xếp ⇄ xoè = `slerp(qFold, qOpen)`; `wingGrid` cong vồng; vỗ 9–16 Hz.
- Chỗ đậu: `branchPerches` lọc đoạn cành ghi lúc dựng (`segs` của `recTree` / `natTree`; táo `userData.limbs`, rừng `treeCoords[i].V.segs`); điểm = mặt trên cành.
- Hộp tổ: chim đậu que / trong hộp ghim theo hộp mỗi khung (`B.at.local`); hộp treo cành = con lắc theo `windAt`.
- Đàn 5: `depart(kind, play)` xếp lộ trình từng con (vòng lượn chung `'air'` → chỗ đáp riêng); 1 con hoảng ⇒ cả đàn bay.
- `makeSparrow`: liếc rồi giữ đầu (`glance` / `aim`, `B.gaze`), đuổi chơi `sally`, né `sparrowFlush`. `updateSparrows` 2 lần/s: cảnh giác `B.vig` theo số chim trong 2,5 m, `nGrp` → `B.fid`.
- Bầy 6: việc theo trọng số tính cách × môi trường × bạn (`COOL`); mối nguy 5 lần/s, gấu mèo ⇒ `mob`; báo động lan 8 m + `flock.scare` / `hear`. Ép việc khi thử: `sparrowGang.dbg`.

## Bẫy
- Cánh rộng co dây cung khi gập (`W.sh.scale.z` 0,62).
- Mái hộp tổ chữ Λ: tấm +z `rotation.x = +0,36` (lật dấu ⇒ chữ V).
- Đừng đặt chỗ đậu theo toạ độ đoán từ cỡ cây (cây đổi hình ⇒ chim lơ lửng).
- Gió cảnh đã thu nhỏ cho hình: đổi ra m/s = `sceneWind.ms / sceneWind.U` trước khi so ngưỡng.
- Cất cánh / đáp xoá việc dở dưới đất (`B.hop`, tắm, ve vãn…).
- Ve vãn: chim mái chỉ mổ đuổi con đã đứng dưới đất. Trốn: đợi 5–35 s tính từ lúc đáp.
- Thêm nhóm chim ⇒ cập nhật `sparrowRoots()` (lô vẽ 'Chim sẻ' + va chạm), `worldSee('sparrows').all()`, `SPA.all` (dựng 1 lần).
- Lô 'Chim sẻ' không cắt theo khung nhìn (chim bay khắp nơi). Cò `noBatch` (thân biến dạng theo nhịp vỗ; đặt ở core/draw-batch.js).
- Cò lội: `b.footMix = 0` (không lẫn độ lệch chân đậu cành). Đứng 1 chân: đích chân phải (−15, −9), bàn chân gập ngược sát bụng, cao hơn khớp.
- Thử: khoá thời tiết bằng getter trên `liveWeather.state` (gán thường bị src/js/weather.js ghi đè).

## Số đo chuẩn
- Chân chim đậu cách trục cành = bán kính cành, sai ≤ 1,2 cm.
