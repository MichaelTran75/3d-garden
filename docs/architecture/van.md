# Xe nhà

<!-- toc -->
- Mã · 2.0 KB
- Bẫy · 3.5 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã
- Tệp + đv xe: `van/README.md` · động cơ, gầm: van-engine.md · dựng transit.bin: `src/tools/transit/`
- `van/body/transit.js`: vỏ code `transitBody` = va chạm (`core/collide.js` quét lúc khởi động), dựng trước GLB; `TR`: sàn `TR.yIn`, L4 đuôi +`TR.ext` sau `TR.cut`; lòng vỏ GLB `TR_IN` / `trInW` / `trInCeil`
- `van/body/transit-glb.js`: `transitGlb()` nạp `src/models/transit.bin` (cục bộ: `window.__vanBin`), bỏ XOR, gộp theo (bản lề, nút, vai trò, lớp), ẩn vỏ / táp-lô / bánh code; `l4()` giãn L4; `ledFront`. Lớp `paint` kem bán trong suốt · `paintO` đục · `paintIn` vỏ trong (`xrayHide`); nét viền `edge()` = con mặt vỏ
- `van/body/xray.js`: `setCaravanXray`, `xrayAdopt`; vỏ 25 % (`xrayOf`), nét giữ, `xrayHide` ẩn hẳn
- `van/body/van-doors.js`: cửa trước + ca-pô, `vanPartToggle`, lò xo `vanPartsTick`; nút GLB `extras.pivot` (bản lề) + `extras.btn` (tay nắm, logo); đóng = đích lố vào khung ⇒ nảy rồi nằm
- `van/interior/caravan.js`: nội thất, mái, bạt, `macbookPro()`, `studyChairRig`, `studyBoard`, `bathRig` · cạnh: `galley-fx.js` (khói ống bếp), `radio.js` (nhãn 📻 `H.claim` ⇒ bảng dò đài thật Radio Browser, nhiễu Web Audio theo lệch đài)
- `van/face.js`: mặt `VAN`, lối duy nhất cho đơn vị khác
- `ui/hover-select.js`: rê = chọn; vật tự xin `H.add(root, { on, n, click, skip, picks, tag, led })` (dịch vụ 'hover'); tia × hộp bao trong hệ vật; `n` bỏ nút quay lưng camera; `picks` = vùng rê to hơn nút. Viền = 3 con của lưới gốc ở lớp `LAYER_SHARP` (cả mảnh đã gộp lượt vẽ)
- `engineer/mind/schedule.js`: `studyChairAt(off, sx, sw)` lăn / xoay ghế bàn học → `STUDY_SEAT` ⇒ người theo ghế
- Khác: `ui/follow-tags.js` (nhãn "Click"), `engineer/tasks/laptop-work.js`, `engineer/tasks/routine-fx.js` (`laptopScreenTick`), `engineer/tasks/van-nav.js`

## Bẫy
- `bakeStatic(g)` cuối `caravan()` gộp xuyên nhóm theo vật liệu ⇒ nhóm dời / ẩn riêng cần `userData.noBake` (cả vỏ code)
- Gai lốp: `bakeStatic(wheels)` gộp sẵn trước bộ gộp lượt vẽ
- Đổi số đo thân: sửa vỏ code (va chạm) + GLB; dùng số đo có tên (`TR.yIn`, `trXE`, `bathRig`, `kitDx`), không số cứng
- transit.bin giữ XOR (giấy phép)
- Nội thất theo lòng vỏ GLB `TR_IN`, không `TR.inW` / `TR.ceil`; vách ngang cắt theo lòng (`xWall`)
- Mũi + cửa cabin phải `paintO`
- Giãn L4: không cắt ngang nét vát góc ô kính (qua 2,65); dải ô kính cắt 2,455 / 2,765; không thêm tam giác lật ở lớp có nét viền
- Lật trái–phải: chữ / logo lật lại tại chỗ; nút lật ⇒ đảo thứ tự đỉnh; bánh dùng lại quay π, không lật
- `src/tools/transit/vanbuild.js`: kính ô cửa phẳng; `clearIn` bỏ gờ vỏ trong ô kính; ô kính vách −z theo 2 ô dập (Kombi) vỏ mẫu, tìm bằng vòng biên mảnh dập chiếu (z, y), không theo gờ gấp. Lớp vật liệu mới ⇒ `ORDER` (`vanwrite.js`)
- Bản lề cửa trước ngoài da cửa 6 mm (sát hơn ⇒ cắt mép vè)
- Viền rê: kiểm độ sâu + nhích 6 cm về camera (`HOV_VS`); mặt nạ nhích 10 cm (`HOV_MASK`)
- Nhiều hộp trúng ⇒ vật nhỏ nhất; `hovUse` bỏ lưới cộng sáng, vô hình, InstancedMesh; logo `skip` đế đen
- LED ban ngày: chuỗi quầng nhỏ dọc dải, không 1 quầng to
- `addLabel` vẽ chữ lúc tạo ⇒ tỉ lệ thẻ (`T.k`, `it.btk`, `tagK`) tính trước
- Chân chống bạt vào `obstacleCoords` (không ⇒ `colSlide` trượt qua lại); bạt chỉ trên đoạn mui cao thẳng; `rotation.x` dương hạ mép +z (`awTilt` +0,16)
- Tập giấy bị gộp lượt vẽ ⇒ `padP` (toạ độ xe) + `VAN.object.localToWorld`; ma trận ghế / bảng: `updateWorldMatrix` trước
- Tay đổi đích lướt từ chỗ đang ở (`lapFrom`)
- Mặt dán cách mặt dưới < ~1 mm ⇒ `polygonOffset` + cách ≥ 0,3 mm
- UV `ShapeGeometry` = toạ độ hình (m) ⇒ repeat 1/W, 1/D, offset ½; logo lưng nắp laptop xoay π quanh pháp tuyến
- Radio: mở khoá âm thanh ngay trong lần bấm; chỉ luồng https MP3 / AAC
- Thử khói ống bếp: Worker `nature/fluids.js` giải ≤ 0,1 s / lượt (dt dồn) ⇒ tua nhanh phải chờ Worker mỗi khung; trang ẩn (rAF dừng, canvas 0 × 0) ⇒ thử headless
- `VAN_LINES.onShell` gán trong `van/body/xray.js` (sau `ui/labels-controls.js`, TDZ) ⇒ kiểm có rồi gọi.
- Vỏ xe mờ 0 ⇒ ẩn, vẫn bấm trúng xe; vách phòng tắm (`userData.vanWall`) không theo thanh.
- `roofVent` (`van/interior/caravan.js`): đế theo mặt mui (`trRoofY`, khum `TR_DROP`, tâm = TB 5 điểm), không thì hở.
- Sóng radio `#rWave` (van/interior/radio.js): hoạt cảnh tổng hợp; luồng đài khác nguồn nối Web Audio (AnalyserNode) bị tắt tiếng (CORS)
- Bồn cầu, kệ ấm (van/interior/tiny-living.js): mẫu tham khảo chỉ để đo, không chép lưới; dựng bằng khối ở `src/tools/tinyliving/` (README); bản lề nắp trước mặt két 3 cm ⇒ nắp mở 1,62 rad không xuyên két
- Nét viền xe: `vanLine(m)` (`core/axes-pin-bake.js`); draw-batch gộp theo thuộc tính vật liệu ⇒ vật liệu chung đổi độ mờ ăn cả nét công trình

## Số đo chuẩn
- Đổi bố trí trong xe ⇒ kiểm tra kỹ sư cả ngày (`src/tools/engineer-audit/`): mọi trạm chạy, 0 kẹt
