# Thử và gỡ lỗi

<!-- toc -->
- Mã · 1.4 KB
- Cách thử · 0.3 KB
- Bẫy · 7.8 KB
- Bẫy hành vi kỹ sư · 1.2 KB
<!-- /toc -->

## Mã

- `src/tools/debug/` mkdbg.py + dbg-hook.js: `window.__dbg` (view, frames, snap, engObj, clock…), `window.__ev(mã)` chạy trong build(), `window.__hourOverride`; đầu dò ev4.cjs, lệnh mẫu `docs/html-text-probe/README.md`.
- `src/tools/debug/flickprobe.js` (đầu dò ev4): nhấp nháy khi camera trượt — dời camera đúng 1 px / khung, so khung đã dời; biến thể tắt ống kính / bật AO; ảnh nóng. Đổi gì khoá lưới màn hình (½ phân giải, Bayer, ô) phải đo lại
- `src/tools/engineer-audit/` (README): kỹ sư cả ngày; harness.js: simSetup, runFor, envTo, wxLock, audRun. `--probe stepprobe.js` + `stepsum.py`: bước đi kỹ sư + chó (lấn vật, xuyên, kẹt, nhảy vị trí), so 2 lần chạy.
- `src/tools/debug/quadprobe.js` (chèn vào trang gỡ lỗi): 4 chân xoay tại chỗ. `quadTurn(tên, {w, ang})` ép xoay qua `rig.step`, `quadWatch(giờ, giây, tên)` chạy tự nhiên, chia theo loại (đứng / xoay / đi) + dải tốc độ xoay; `each(i, obj)` chụp hình giữa cú xoay. Con vật đang nằm ⇒ `notReady`, hàng ép xoay vô nghĩa. Không gieo hạt ⇒ so vài lượt.
- Đo theo việc: `docs/*-probe/`. Test: `node --test ../tests/garden-flight.test.cjs` (ngoài repo) · `node --test docs/physics-probe/unit.cjs` (vật lý chung, không trình duyệt).

## Cách thử

- `simSetup()`: `clock.getDelta` trả `clock.__dt` (mặc định 1/20) ⇒ bước cố định.
- Thử dt: `clock.__dt` = 1/15, 1/60, 1/144; `clock.__dt = 0` vô ích (`loop()` đổi 0 → 1/60).
- Câu cá 150 s: `fishLinePos` khớp khoen / ngọn cần, sai số = 0.

## Bẫy

- `__dbg.frames(n)` gọi `loop()` không ts ⇒ bỏ `adaptResolution`.
- Pane trình duyệt ẩn ⇒ rAF dừng.
- Dựng lại lỗi chó (ép trạng thái, đặt chỗ): đặt `window.__hourOverride` giờ ngày + `wxLock` khô, chạy tới khi `dogRain.st` rỗng. Đêm / mưa ⇒ `shelterTick` giữ chó trong xe, trạng thái ép bị bỏ qua (0 lượt về chỗ nằm, giống lỗi kẹt).
- Tự gọi `__dbg.frames` sau khi tua không vẽ: thay `renderer.render` bằng hàm rỗng như các hàm chạy của harness (vẽ lại ⇒ lỗi `computeBoundingSphere`, mảng đỉnh đã giải phóng).
- `audRun`, `quadWatch` kết thúc bằng `__hourOverride = undefined` ⇒ đo / chụp sau đó phải đặt lại giờ.
- `__ev` chỉ thấy tên cấp `build()`; tên trong hàm kín (hằng của não chó) không với tới ⇒ đo qua `dogBrain.rig`, `dogObj`.
- Trượt chân nhịp nhanh: đo bàn chân vẽ ra lệch điểm ghim `F.w`, không đo quãng dời giữa 2 khung (20 hình/s, chân trụ 2–3 khung ⇒ số ảo). Lỗi lúc mở trang: ghi từ rAF đầu tiên, harness vào sau đã lỡ.
- Cỡ bò ngẫu nhiên mỗi lần mở; con vật đang nằm ⇒ `notReady`: so tổng vài lượt, không so 1 hàng.
- Chụp con vật: `__dbg.view` hướng = −`rotation.y` (chính diện) / ± π/2 (ngang), φ ≥ 1,3 bị bậc đất che; ẩn con khác; ảnh đầu của lượt có khi trắng.
- Đổi gì trong xe / lô gộp: đo lượt vẽ cả khung + số mảnh rời lô + số chương trình, cùng góc, trước – sau (1 vật liệu vá sau khi dựng lô ⇒ hàng chục mảnh tự vẽ lại, không báo lỗi).
- `stepprobe.js` đếm cả lưới `Bóng tiếp đất · …` (bóng tiếp đất, phẳng sát mặt đất) như vật: chân đứng trên bóng = "lấn" ⇒ lọc hàng đó trước khi so tổng.
- Xem cắt lớp trong xe (ẩn vỏ, kéo mặt cắt gần): giữ lưới lô `Gộp vẽ · …` hiện; ẩn theo tên / theo vai ⇒ mọi mảnh đã gộp biến mất, tưởng chi tiết chưa dựng.
- `stepprobe.js` so điểm thân với cột va chạm 0,125 m: cọc mảnh 1 cm (chân giá treo) ⇒ số "chân trong vật" lớn hơn mức lấn thật.
- Đo kỹ sư trong xe: để tự vào tư thế thật (`runFor` tới giờ ngồi bàn). Ép vị trí ở độ cao đứng ⇒ che lỗi gốc thân lúc ngồi.
- Đặt kỹ sư vào chỗ khác trong đầu dò: bỏ ghế (`e.seat = null`, `e.seatCtl = false`, `e.nav = null`) + đặt cả lớp dáng `e.pose` (`rawPos`, `pos`, `rawYaw`, `yaw`; `pv`, `yv` = 0). Chỉ đặt `e.g.position` ⇒ `engPoseBegin` trả về chỗ cũ ngay khung sau. Vị trí vẽ ra trễ sau vị trí thật 1 lò xo.
- Nhấp nháy `flickprobe` ở góc sàn: trị số đổi theo điều kiện lượt chạy (10 lần giữa 2 lượt) ⇒ trước – sau đo cùng một đợt, không so với số ghi cũ.
- Gấu mèo trèo: bắt đầu bằng `raccoonBrain.climbCD = 0` + `worldTell('appleTreeTap', appleTrees[2])`; đo điểm thân với vỏ dựng lại (`barkGeo()`), chia theo pha `climb.C.ph`. Lấy mẫu 0,67 s trùng nhịp bước ⇒ đo mọi khung. Ảnh zoom 90 quá nhỏ để xét chỗ chạm ⇒ zoom 300, 2 góc (ngang + chính diện). Số "trong vỏ" gồm cả cành con mảnh cắt ngang.
- Nước: `runFor` chạy đồng bộ ⇒ Worker không trả lời kịp, mặt nước đứng yên; đo / chụp nước bằng vòng `__dbg.frames(1); await sleep(6)`. Kiểm `fluids.threaded()` trước khi đo thời gian khung.
- Nước biến mất trong ảnh, console sạch = mực NaN từ nhân. Thử nhân ngoài trình duyệt: lưới thử phải có ô nước trên hàng / cột biên; nửa-float 64512 (−Inf) / mũ 31 = nhân nổ.
- Gió cành cổ thụ: zoom mặc định cây chỉ vài chục px, dịch chuyển dưới 1 px ⇒ xét ở zoom ≥ 9; khung đơn không thấy gì ⇒ ảnh hiệu 2 khung cách 1/3 s hoặc dải khung. Nối cành: nhân `B.amp` × 6 rồi chụp. So thời gian khung: bật / tắt `tw.bghOff` trong cùng trang (2 trang khác nhau lệch tới 0,4 ms do nhiễu)
- Xương cành anh đào: kiểm `aBr` trên cả 3 lưới (vỏ, hoa, lá); khớp liền: nhân `b.amp` × 30 (góc chạm kẹp 0,35 rad) rồi chụp. Gió lên chậm sau `wxLock` ⇒ chạy 600–700 khung trước khi đo biên độ. So thời gian khung: `tw.rigOff` trong cùng trang; so cả trang: mở thêm trang `?rig=off` (lệch tới 1 ms do nhiễu ⇒ chỉ tin số chương trình, số lưới). `info.render.calls` sau hậu kỳ không dùng được ⇒ đếm lưới trong cảnh
- Nhấp nháy vật mảnh (thân cây): chỉ số cả khung quá loãng ⇒ đo trong mặt nạ = điểm ảnh đổi khi ẩn vật; ‰ điểm mặt nạ đổi sau khi dời camera 1 px. Nguồn đã gặp: độ sâu lượt trước ≠ lượt màu (⇒ `polygonOffset`), `dFdx` của bậc độ cao gắt đổi theo cặp ô 2×2 (⇒ gradient giải tích, render.md). Biến thể biên dịch lại shader không hoàn tác được ⇒ 1 góc nhìn / lượt chạy
- So hình 2 trang: bóng mây ngẫu nhiên mỗi lần mở ⇒ ánh sáng lệch, tưởng shader đổi. `wxLock` `cloudCover: 0` trước + sau `runFor`, ẩn mây, kiểm 1 điểm nền trùng màu rồi mới so
- Xương cành cổ thụ: so với trang `?rig=off` (bản `bough`); khớp: nhân `rig.amp` × 5 rồi chụp. `wxLock` chỉ khoá trường được đưa ⇒ đo gió đưa đủ `raining`, `thunder`, `windSpeed`, `windGusts`, `windDirection`, `cloudCover`, `fresh`; gió không gieo hạt ⇒ so hiệu dụng trên ~900 khung
- Nhận xét thời tiết của kỹ sư: `docs/thought-probe` (`unit.cjs` 7 bài trong node, `sample.cjs` in câu mẫu theo kịch bản × việc để đọc, `page.cjs` + `page-probe.js` khoá thời tiết trong trang thật). Chữ bong bóng là lớp HTML ⇒ `__dbg.snap()` không thấy, chụp cả trang bằng `SHOT=`
- RAM: `docs/ram-probe` (README): heap + ArrayBuffer sau GC, lấy mẫu heap theo dòng, đếm GL. Lá rêu chỉ hiện khi zoom gần (> 9 điểm / đv) ⇒ kiểm bỏ mảng sau khi đã zoom vào
- Xương cành táo: ảnh cây cần zoom + chờ DOF ổn vài khung; số chương trình so tại cùng điểm của đầu dò (tăng dần theo cảnh). Quả theo cành: so `rigAt` với đỉnh lưới đã dời
- Chụp canvas: lấy `toDataURL` ngay sau `__dbg.frames(1)` trong cùng tác vụ (sau `await` ⇒ ảnh trắng); tên ảnh trả về phải có `.jpg`
- Khu cá koi: nhìn từ trên `view(X0 + 73, lakeY, Z0 + 113, 3.9, 0.25, 22)`, chếch `(…, 5.4, 0.7, 30)`; 7 con đầu = hồ dưới. Vật chìm: so với ảnh đã ẩn lưới (mặt nước gần đục, sâu > 1,2 m không thấy)
- Số đo koi chia theo dáng (cruise / hover / nibble / sip / `L:` + trạng thái `fishLife` / leaf); chạy ngẫu nhiên ⇒ phép đo cặp cá lặp ≥ 3 lượt. Hướng con đứng yên: ghi cả `C.om` lẫn tốc độ quay thật (bộ khác ghi `f.ang`)
- Câu cá trong đầu dò: `engForceAct = 'fish'`, ghi bước nhảy mỗi khung của cá mắc câu theo pha
- Dựng hỏng ⇒ trang cũ còn nguyên, `mkdbg.py` vẫn báo ok ⇒ đọc đầu nhật ký dựng trước khi tin trang gỡ lỗi mới
- Mây mờ dần theo zoom camera (1,3 → 2,6 mất hẳn) ⇒ chụp mây ở zoom ≤ 1,28 rồi cắt ảnh. Hình + số mây ngẫu nhiên mỗi lần mở ⇒ so vài đám, cùng giờ, không so 1 đám; lượt vẽ lệch vài đơn vị theo số mây.

## Bẫy hành vi kỹ sư

- Đi chéo: ô góc chênh ≤ 1 voxel với cả 2 đầu (`engCornerOk`, BFS + `engDir`); chỉ so ô đi ⇒ đứng ì.
- Chênh > 1 voxel: chặn bước (cả đích gần); vòng cắt cỏ bỏ điểm lệch mặt trại, ngắt đoạn giữa 2 điểm liền.
- Đích < 0,6 m (cắt cỏ, hái táo) không tính kẹt.
- `stuck` + `struggle` lặp cạnh lan can / rào mỏng (mặt đập): bảng đi xuyên tường giữa 2 tâm ô ⇒ cạnh cấm `navEdges` (`walking.md`).
- Dạo trại: đích ngoài ô cấm (`engNavBlocked`); khám phá: chỉ điểm tới được (`engField`).
- Việc 1-lần xong sớm ⇒ khoá việc kế (`e.doneSet`, `engMarkDone`), không chờ giờ khung.
- `AUTO_ABSORB` (ngủ trưa, câu, ăn): chỉ nhu cầu < 15 gọi đi; nghiên cứu: chỉ nhu cầu thân thể (`AUTO_BODY`).
- Việc tự chọn mới bắt đầu giữ ≥ 20 s (`ENG_WANT_HOLD`), không thì đứng dậy ngồi lại.
- Ngắm sao ≥ 19:00 (`ENG_HOURS.stars`, `skyWatch.update` chặn); lệnh ngoài giờ bỏ khi chưa bắt đầu (`ENG_CMD_HOURS`).
- Mây dày buổi tối ⇒ đọc sách thay ngắm sao: đúng.
