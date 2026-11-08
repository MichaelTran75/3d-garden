# Hệ biogas

## Mã
- `camp/biogas.js`: IIFE `biogas`; nhóm `gA` túi ủ, `gB` khí, `gC` bã, `gS` trạm men, `fence`, `link` (ống về xe).
- Cuối tệp `worldPlace('biogas', …)`: `face` chỉ đọc (`pos`, `gasL`, `pressure`, `digestateL`, `slurryC`); tick `update` (things 40), `tagTick` (viewer 60: `partsTick`, `holoTick`); `hover.root = sys` (không gồm rào, ống); `job` (`pick`, `close`, `dock`, `popAt`, `choices`, `msg`).
- Nền hạ 1 bậc: `bioPadVF` + `getVoxelHeight` (`core/sky-sun-moon.js`).
- Bảng việc: `ui/xray-lifecycle.js` (dịch vụ `jobs`). `ui/tools-panel.js` mở Tools/Engineer ⇒ đóng bảng `dock`.
- Chữ bảng, thẻ số: lớp chữ HTML (`docs/html-text-layer.md`).

## Đặt chỗ, tỉ lệ
- Tâm khu rào `V.toWorld(0.17, 0, -9.22)` (`V = worldSee('van')`), xoay `V.yaw` (song song xe, phía −z xe).
- Cả nhóm thu `SC = 0.72`; toạ độ mã = bản vẽ chưa thu ⇒ × 0,72 mới ra số thật. Áp (6/12 cm nước, ngưỡng 11,5) đã là số thật.
- Trục cục bộ: +X dọc rãnh về đuôi xe, +Z về thân xe; `ground(x, z)` = mặt đất tại điểm cục bộ.
- Ống về xe tính qua `vP` (toạ độ xe) ⇒ dời hệ vẫn tới đúng cổng.
- Nền độ cao 10 (khu xe 11): chữ nhật theo xe dọc −2,7…3,5 m, ngang 6…10 m; viền 1 ô thấp hơn 9 đắp lên 9.
- Ô trũng sát cổng xả (trông như hố vuông) lấp bằng `VOXEL_H_OVERRIDES['83,144']`; sửa địa hình quanh xe ⇒ xem lại.
- Né khu rào: `obstacleCoords`, `PROPS`, `NAV_MARKS`; cỏ cắt sát trong rào + dọc ống (`meadow.cutAt`).
- Cây/hoa né nền: `freeTree` (`nature/flowers-trees.js`) chặn nền + 4,5 m (rải ngẫu nhiên mỗi lần mở trang; thiếu ⇒ có lần mọc trong rào).

## Bộ phận (`PARTS`)
Số theo dòng chảy; chung cho thẻ số, dòng bảng, hologram.
1. Hố nạp (A): phễu HDPE, cửa lật, tay quay khuấy; măng sông ống bồn cầu vách +x.
2. Túi ủ PE (A): `tube` trong rãnh; mặt dịch `YL` 3 cm dưới đất, chỉ vòm khí nhô lên.
3. Nhà kính ủ ấm (A): vòm polycarbonate, vách hồi, xà.
4. Túi chứa khí (B): `bag` + ván, bao cát (`wgt`), phồng/xẹp theo khí.
5. Lọc H₂S (B): nhóm `gF`, 3 cốc (tách ẩm · ô-xít sắt · than), cổng thử giấy chì.
6. Ống gas về bếp xe (B): van 1 chiều, chặn lửa, van khoá.
7. Hộp than khử mùi (B): nhóm `gV`, cột nước (ống nhúng ngập 12 cm), ống thoát cao, lõi than; bọt `bub` khi xả.
8. Hố ra + bơm tay (C).
9. Túi bã kín (C): `digBag` 45 L trên xe đẩy, camlock; nhãn `digTop` nổi theo mặt túi.
10. Thùng men vi sinh (trạm men): thùng 20 L, tủ trên cột, bơm nhu động, pin mặt trời, đèn `ledG`/`ledO`.

- Dựng, không đánh số: bẫy nước ngưng, áp kế (`man`), ống bồn cầu, cổng xả két (`po`), ống gas chôn (vệt đất `strip`), rào.
- Màu khối: `PCOL` (vòng số, bảng), `HCOL` (hologram, sáng hơn).

## Đường ống
- Ống bồn cầu nổi, không chôn: mặt dịch 3 cm dưới đất ⇒ ống chôn ngập dịch, lắng, tắc.
- Tâm ống vào hộp `YIN` cao hơn `YL`; `prof(s)` dốc liên tục, đổ 45° qua mép bậc, không đoạn ngang/võng; gối cách ≤ 0,95 đv.
- Tuyến ống bồn cầu: 2 đoạn thẳng vuông góc + cút cong dài 90° (`RB`), không đoạn chéo.
- Cọc rào 2 đầu ở z −0,75 / 0 / 0,75 cho ống lọt giữa; dời cọc/ống phải giữ khe.
- Ống không xuyên vỏ xe: cổng xả két dưới gầm, ống gas vào sàn qua bích.
- Gas dốc liên tục về túi ủ/túi khí/hộp bẫy; 2 điểm thấp, mỗi điểm 1 hộp (trước túi khí; đầu đoạn chôn: `gasLowAtBoard`); võng ⇒ đọng nước ngưng, bịt ống.
- Ống ra (hologram 8) dốc lên tới mép tràn: mép ống quyết định mặt dịch.

## Mô phỏng
- `profile()` mỗi 600 s chạy 30 ngày theo phút, lấy ngày cuối ⇒ `B.prof.out[phút]` = khí dùng được (L).
- Bể `Ts` = trời + 4 °C; sinh = 95 L/ngày × `KH` (≈ 0,85, lưu `HRT` 22 ngày) × f(Ts) (= 1 ở 25 °C).
- Bếp 3 L/phút: 07:00 10 phút (cần ≥ 20 L), 18:30 tới 30 phút, chừa `RES` 40 L.
- `press(S)` cm nước: vòm (`DOME` 7 L) 0 → 6 · túi (tới `BAGF` 120 L) 6 · đầy (`CAP` 131 L) 6 → 12. `B.pk > 11.5` ⇒ xả, có bọt.
- Men 09:00: 1 L (Ts < 15 °C: 4 L), 750 s/L; đèn xanh nháy, cam khi bể lạnh. Bã ~17 L/ngày.

## Dựng, vẽ
- Túi, vòm, áp kế chỉ đặt lại khi số đổi; `B.bk`, `B.pk` tới đích ⇒ gán đúng đích (ma trận yên, lô gộp khỏi tải lại). Túi bã bậc 0,6 L.
- Mảnh mới dùng lại vật liệu `M` (gộp lượt vẽ); mảnh đổi mỗi khung (đèn, bọt) đặt `userData.noBatch`.
- Giữ tiền tố tên nhóm "Hệ biogas"/"Biogas": `core/collide.js` theo tên đưa đồ `noCollide` của hệ vào lớp va chạm riêng thỏ.
- `core/labels.js` sau `camp/biogas.js` trong manifest ⇒ `addLabel`, `labelGroup` chỉ dùng lúc chạy, không lúc dựng.
- Cuối lúc dựng `g.updateMatrixWorld(true)`: dịch vụ `jobs` đo hộp bấm trước khung vẽ đầu.

## Nhãn
- Thường: 1 nhãn `addLabel` "♻ Biogas · … L khí", chỉ khi 1 px < 0,06 đv; ẩn khi bảng mở.
- Bảng mở + 1 px < 0,045 đv + `labelGroup` hiện + tâm hệ trong khung ⇒ 10 thẻ `partCard`, hai cột hai bên hệ; bộ phận ngoài khung ⇒ ẩn thẻ.
- Mỗi cột 1 đoạn số liền tăng dần, bước `PD` 27 px; `pLay` thử 6 cách chia, chọn ít dây cắt rồi dây ngắn; giữ cách đang dùng (`PSP`) trừ khi hơn rõ. Thẻ không lấn cột phải.
- Dây cắt nhau: chấp nhận (số theo dòng chảy); không xếp theo độ cao.
- Đầu dây = vòng số màu khối Ø 15 px trên bộ phận; dây `PL` (WebGL, trong `labelGroup`) nâu mờ 55 %.
- Rê thẻ/vòng: thẻ sẫm, sáng dòng cùng số, dây trắng, vòng ×1,3, con trỏ tay; bấm = bấm dòng.

## Bảng + hologram
- `holoOpen` ⇒ bảng 330 × 406 px × `holoS()` (0,78…1) đúng chỗ `#engPanel` (phải 18, đáy 64; màn ≤ 700 px: 12 · 88): `holoLay`.
- `dock` đóng Tools/Engineer, thôi bám kỹ sư; bảng việc ngay trên bảng (`holoPopAt`).
- Bảng = 1 canvas `htBox` (`holoDraw`, cột phải `HSPEC`). Mở: `scaleY` từ mép dưới + in dần (`mask-image`), xong bỏ co giãn; đóng mờ 0,3 s.
- Bấm dòng/thẻ ⇒ `holoPick(k)`; bấm lại ⇒ tắt. Mở bảng ⇒ mặc định bộ phận 7 (`HTHAN`), hiện sau 0,3 s.
- Đóng bảng việc (×, chọn việc, bấm chỗ khác: `tShut`) ⇒ `job.close` → `holoClose`. `shownInScene(g)` sai ⇒ chỉ ẩn.
- `hpBuild(k)` lần chọn đầu (giữ ở `HG.hp`): chép mảnh theo `HPICK[k]`, `hpMerge` ⇒ 1 lưới mặt + 1 lưới nét; thêm phần khuất: ống nạp, giỏ, cánh khuấy (1); thành hố, ống ra (8).
- Bộ phận 5: màu vật liệu `HPC`; mảnh khác màu không chồng: vạch đỏ = vòng mảnh, hạt sắt trên đoạn đã đen.
- Bộ phận 7: nước + bọt (`hpWater`), kính lúp chai (`hpDet`). Bọt `bub` chạy cứng y 0,25 → 0,40 (miệng ống nhúng → mặt nước): đổi cột nước ⇒ sửa theo. Xả 11/s, nghỉ 2,4/s, theo đồng hồ thật, không theo khung.
- Kính lúp ẩn khi chỗ < 90 px hoặc phóng < 1,6 lần.
- `HPICK` chọn mảnh theo tâm hộp bao (cục bộ, chưa thu SC) ⇒ dời mảnh có thể rơi khỏi/lọt vào hologram; 5, 7 theo nhóm `gF`, `gV`.
- Cỡ px cố định: 88 % dải sát trái bảng (màn hẹp: dải trên bảng), tính bề quét khi xoay + góc cúi camera (`hpExt`), scale lại mỗi khung. Camera không dời.
- Dựng từ dưới lên 0,7 s, hiện/tắt 0,25 s, tự xoay ~21 s/vòng; kéo xoay tay, thả 1,5 s tự xoay lại.
- Cỡ px ⇒ zoom xa to ra trong cảnh: vertex shader kẹp độ sâu `HZC` khỏi bị mặt gần/xa cắt (không kiểm sâu nên vô hại).
- Vật hologram qua `hpQ` (không cắt khung, raycast rỗng, `noBatch`/`noBake`/`noCollide`/`pickSkip`); thiếu ⇒ bị gộp, bấm trúng.
- `HG.grp` ở `sharpRoots` (không mờ ống kính); bảng, hologram không theo nút "Nhãn".
- Lớp chữ không nhận chuột: bấm/rê/kéo trên bảng, hologram, thẻ do `holoHit` bắt ở pha capture trên `container` + `stopPropagation`; thiếu ⇒ camera xoay, bảng việc đóng.
- Vừa vào bảng: `pointerleave` giả (`HG.fake`), giấu `pin` (ghim thả địa hình), `clearGlow()`.
- Bảng vẽ lại chỉ khi khoá `HG.key` đổi (xét mỗi 0,5 s): chữ sống mới phải vào khoá; `htSize` true (đổi cỡ/dpr) ⇒ xoá khoá. Thẻ vẽ lại khi `o.d !== htDpr()`.
- Bảng, thẻ vẽ thẳng màu, không `htTone`; nền thẻ `#e0ddd5` = màu nhãn cảnh đo trên màn.
- Trang debug thiếu symlink `css/` cạnh trang ⇒ khung vẽ cao theo nội dung, bảng sai bố cục.
- Chưa xong: điện thoại — bảng việc đè hệ, nhãn; khung thấp — bảng việc sang trái bảng (`holoPopAt`), đè dải hologram.

## Số đo chuẩn
- Ống bồn cầu: dốc nhỏ nhất ≥ 4 %, không chạm đất.
- Cả 10 hologram lọt 88 % dải, không bị cắt; zoom ×15 → ×60 giữ chỗ + cỡ px; camera, zoom đứng yên khi mở/chọn/đóng bảng.
