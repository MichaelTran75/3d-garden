# Chim: cò, chim sẻ

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.5 KB
- Cò · 0.5 KB
- Chim sẻ · 1.1 KB
- Bẫy · 1.8 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã

- `animals/storks/storks.js` — 3 cò trắng (`updateStorkLife`); dáng đứng = biến dạng lưới bay (`poseStandingStork`).
- `animals/sparrows/songbird.js` — `makeSparrow(brain, size, plum)` (hình + phản xạ chung), con ở trại, 2 hộp tổ (`makeNestBox` → `nestPairs`), đàn 5 `flock`, `updateSparrows`.
- `animals/sparrows/gang.js` — bầy 6 `sparrowGang` theo `SPARROW_CAST` (`think`, `doAct` / `nextAct`, `flee` / `alarm` / `mob`, ve vãn `display`). `face.js`: `worldSee('sparrows').all()`.

## Cò

- Lội (`b.state` 'wade', máy pha `b.fg`): walk → wait (đứng rình) → strike (trúng ~1 lần / 3) → swallow; greet; rest: đứng 1 chân (`b.oneLeg`), rụt cổ, rỉa lông, duỗi cánh. Cất cánh chỉ từ walk / wait khi đã hạ chân.
- `poseStandingStork`: mọi đỉnh lưới bay phải thuộc 1 nhánh — `part` 1: z < 17,2 (hoặc họng y < 4) thu về ức, z > 17,2 theo cổ; vòng gốc cổ (z < 18) co về tiết diện ống cổ, xoay nửa góc cổ (`c2`, `s2`).

## Chim sẻ

- Cánh: nhóm "bên" lật gương (`side.scale.x = s`), vai / cổ tay viết cho cánh PHẢI (sải +x, mép trước +z, lưng +y); xếp ⇄ xoè = `slerp(qFold, qOpen)`; cánh `wingGrid` cong vồng; vỗ 9–16 Hz.
- Chỗ đậu: `branchPerches` lọc đoạn cành ghi lúc dựng (`segs` của `recTree` / `natTree`; cây táo `userData.limbs`, rừng `treeCoords[i].V.segs`); điểm = mặt trên cành.
- Hộp tổ: chim đậu que / trong hộp ghim theo hộp mỗi khung (`B.at.local`); hộp treo cành là con lắc theo `windAt`.
- Đàn 5: `depart(kind, play)` xếp lộ trình từng con (vòng lượn chung `'air'` → chỗ đáp riêng); 1 con hoảng ⇒ cả đàn bay.
- `makeSparrow`: liếc rồi giữ đầu (`glance` / `aim`, `B.gaze`), đuổi chơi `sally`, né `sparrowFlush`. `updateSparrows` 2 lần/s: cảnh giác `B.vig` theo số chim trong 2,5 m, `nGrp` → `B.fid`.
- Bầy 6: việc theo trọng số tính cách × môi trường × bạn (`COOL`); mối nguy 5 lần/s, gấu mèo ⇒ `mob`; báo động lan 8 m + `flock.scare` / `hear`. Ép việc khi thử: `sparrowGang.dbg`.

## Bẫy

- Lật gương bằng `scale.x = −s` ngay trên nhóm vai ⇒ 2 cánh xuyên thân, chéo chữ X, khi đậu chĩa qua đầu.
- Cánh rộng phải co dây cung khi gập (`W.sh.scale.z` 0,62), không thì thành tấm to chìa trên lưng.
- Mái hộp tổ chữ Λ: tấm phía +z `rotation.x = +0,36`; lật dấu thành chữ V.
- Đừng đặt chỗ đậu bằng toạ độ đoán theo cỡ cây (cây đổi hình là chim lơ lửng).
- Gió cảnh đã thu nhỏ cho hình ảnh: đổi ra m/s bằng `sceneWind.ms / sceneWind.U` trước khi so ngưỡng.
- Chú thích `//` giữa dòng nuốt câu lệnh / nhánh `else { … }` phía sau (chim dưới đất hết nhảy, `B.yaw` đổi mỗi khung = lắc đầu); build.py chặn (`SWALLOW`, `CLOSE`) — đưa câu lệnh lên trước chú thích.
- Cất cánh / đáp phải xoá việc dở dưới đất (`B.hop`, tắm, ve vãn…).
- Ve vãn: chim mái chỉ mổ đuổi con đã đứng dưới đất (nhắm con đang bay ⇒ nó đáp lệch 2 m). Trốn: đợi 5–35 s tính TỪ LÚC ĐÁP.
- Thêm nhóm chim: cập nhật cả `sparrowRoots()` (lô vẽ 'Chim sẻ' + va chạm), `worldSee('sparrows').all()` và `SPA.all` (chỉ dựng 1 lần).
- Lô 'Chim sẻ' không cắt theo khung nhìn (chim bay khắp nơi). Cò `noBatch` (thân biến dạng theo nhịp vỗ; đặt ở core/draw-batch.js).
- Cò lội: `b.footMix = 0` (không lẫn độ lệch chân đậu cành). Đứng 1 chân: đích chân phải (−15, −9), bàn chân gập NGƯỢC sát bụng, cao hơn khớp (đích thấp hơn thì cẳng chĩa xuống như đang bước).
- Thử: khoá thời tiết bằng getter trên `liveWeather.state` (gán thường bị src/js/weather.js ghi đè).

## Số đo chuẩn

- Chân chim đậu cách trục cành = bán kính cành, sai ≤ 1,2 cm.
