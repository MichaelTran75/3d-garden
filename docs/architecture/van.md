# Xe nhà: vỏ GLB, nội thất, bàn học, radio

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.1 KB
- Chạy thế nào · 1.2 KB
- Bẫy · 3.5 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã

- Bản đồ tệp: `van/README.md`. Động cơ, khung gầm, kiểm tra máy: xem van-engine.md.
- `van/body/transit.js` — vỏ code `transitBody` (bản tạm + va chạm), số đo `TR`, lòng vỏ GLB `TR_IN` / `trInW` / `trInCeil`.
- `van/body/transit-glb.js` — `transitGlb()`: nạp `src/models/transit.bin`, gộp theo (bản lề, nút, vai trò, lớp); `l4()` giãn L4; `ledFront`.
- `van/body/van-doors.js` — cửa trước + ca-pô (`vanPartToggle`, lò xo `vanPartsTick`) · `van/body/xray.js` — xem xuyên (`setCaravanXray`, `xrayAdopt`).
- `van/interior/caravan.js` — nội thất, mái, bạt; `macbookPro()`, `studyChairRig`, `studyBoard`, `bathRig` · `radio.js`, `galley-fx.js` (khói ống bếp) cùng thư mục.
- `van/face.js` — mặt `VAN`: đơn vị khác chỉ đọc / chạm xe qua đây.
- Ngoài xe: `ui/hover-select.js` (rê = chọn), `ui/follow-tags.js` (nhãn "Click"), `engineer/mind/schedule.js` (`studyChairAt`), `engineer/tasks/laptop-work.js`, `engineer/tasks/routine-fx.js` (`laptopScreenTick`), `engineer/tasks/van-nav.js`.
- Dựng lại transit.bin: `src/tools/transit/README.md`.

## Chạy thế nào

- Đv xe: 1,1 đv = 1 m, mũi −X, cửa lùa +Z, sàn `TR.yIn`. L4: đuôi thêm `TR.ext` sau `TR.cut`.
- Vỏ code dựng trước, là lớp va chạm (`core/collide.js` quét lúc khởi động); GLB nạp sau (thử cục bộ: `window.__vanBin`), bỏ XOR, rồi ẩn vỏ / táp-lô / bánh code.
- Lớp `paint` kem bán trong suốt, `paintO` đục, `paintIn` vỏ trong (`xrayHide`); nét viền `edge()` là con mặt vỏ. Xem xuyên: vỏ 25 % (`xrayOf`), nét giữ, `xrayHide` ẩn hẳn.
- Cửa / ca-pô: nút GLB `extras.pivot` (bản lề) + `extras.btn` (tay nắm, logo), lò xo; đóng = đích lố vào khung ⇒ nảy rồi nằm.
- Rê: vật tự xin `H.add(root, { on, n, click, skip, picks, tag, led })` (dịch vụ 'hover'); tia × hộp bao trong hệ vật; `n` bỏ nút quay lưng camera; `picks` = vùng rê to hơn nút. Viền = 3 con của lưới gốc ở lớp `LAYER_SHARP` (cả mảnh đã gộp lượt vẽ).
- Ghế bàn học: lăn / xoay qua `studyChairAt(off, sx, sw)` (cập nhật `STUDY_SEAT` ⇒ người theo ghế).
- Radio: bấm nhãn 📻 (`H.claim`) ⇒ bảng dò đài; đài thật Radio Browser, nhiễu Web Audio theo độ lệch đài.

## Bẫy

- `bakeStatic(g)` cuối `caravan()` gộp xuyên nhóm theo vật liệu ⇒ nhóm cần dời / ẩn riêng phải `userData.noBake` (vỏ code thiếu ⇒ vạch ngang trên thân GLB).
- Gai lốp: `bakeStatic(wheels)` trước, không thì bộ gộp lượt vẽ tách ra, hiện trắng.
- Đổi số đo thân: sửa cả vỏ code (va chạm) lẫn GLB.
- transit.bin phải giữ lớp XOR: giấy phép mẫu không cho phát tán tệp mở được.
- Nội thất bám lòng vỏ GLB `TR_IN`, không theo `TR.inW` / `TR.ceil` (đồ thò ra ngoài vỏ); vách ngang cắt theo lòng (`xWall`).
- Mũi + cửa cabin phải `paintO` đục: bán trong suốt lộ khoang máy thành vệt loang.
- Giãn L4: đừng cắt ngang nét vát góc ô kính (vắt qua 2,65) — dải ô kính cắt ở 2,455 / 2,765; không thêm tam giác lật ở lớp có nét viền.
- Lật trái–phải: chữ / logo lật lại tại chỗ, nút lật ⇒ đảo thứ tự đỉnh; bánh dùng lại quay π, không lật.
- Kính ô cửa (`src/tools/transit/vanbuild.js`) phải PHẲNG, kính cong ⇒ nét viền vệt toả; `clearIn` bỏ gờ vỏ trong ô kính. Ô kính vách −z theo 2 ô dập (bản Kombi) của vỏ mẫu: tìm bằng vòng biên mảnh dập chiếu lên mặt (z, y), không phải gờ gấp.
- Lớp vật liệu mới trong transit.bin phải thêm vào `ORDER` (`vanwrite.js` cùng thư mục).
- Bản lề cửa trước ngoài da cửa 6 mm, sát hơn thì cửa mở cắt mép vè.
- Viền rê kiểm độ sâu + nhích 6 cm về camera (`HOV_VS`), bỏ kiểm ⇒ vật che thành vệt trắng; mặt nạ nhích 10 cm (`HOV_MASK`), không thì cỏ / rêu sát vỏ làm viền lấm tấm.
- Nhiều hộp trúng ⇒ chọn vật nhỏ nhất (laptop trong hộp bếp); `hovUse` bỏ lưới cộng sáng, vô hình, InstancedMesh; logo `skip` đế đen (viền phình).
- LED ban ngày: chuỗi quầng nhỏ dọc dải — 1 quầng to ở góc thành đốm chói, ở tâm cụm thì vỏ đèn che.
- `addLabel` vẽ chữ ngay lúc tạo ⇒ tính tỉ lệ thẻ (`T.k`, `it.btk`, `tagK`) khi tạo, không thì thẻ co thành vạch.
- Chân chống bạt phải vào `obstacleCoords`, không thì `colSlide` trượt qua lại tại cột; bạt chỉ trên đoạn mui cao thẳng.
- three.js `rotation.x` dương hạ mép +z (bạt `awTilt` +0,16).
- Dùng số đo có tên (`TR.yIn`, `trXE`, `bathRig`, `kitDx`), không ghi số cứng.
- Tập giấy bị gộp lượt vẽ ⇒ dùng `padP` (toạ độ xe) + `VAN.object.localToWorld`.
- Đọc ma trận ghế / bảng: `updateWorldMatrix` trước.
- Tay đổi đích phải lướt từ chỗ đang ở (`lapFrom`), nhảy đích ⇒ tay vọt.
- Mặt dán cách mặt dưới < ~1 mm ⇒ `polygonOffset` + cách ≥ 0,3 mm, không thì nhấp nháy.
- UV `ShapeGeometry` = toạ độ hình (m) ⇒ repeat 1/W, 1/D, offset ½; logo lưng nắp laptop xoay π quanh pháp tuyến.
- Radio: mở khoá âm thanh NGAY trong lần bấm (ngoài thao tác người dùng play() bị chặn); chỉ luồng https MP3 / AAC (trang https chặn luồng http).
- Chú thích `//` giữa dòng nuốt lệnh phía sau — để cuối dòng (build.py dò `SWALLOW`).
- Thử khói ống bếp: Worker `nature/fluids.js` giải ≤ 0,1 s / lượt, dt dồn ⇒ tua nhanh thì khói như đứng, chờ Worker mỗi khung. Trang ẩn: rAF dừng, canvas 0 × 0 ⇒ thử bằng trình duyệt headless.

## Số đo chuẩn

- Đổi bố trí trong xe: kiểm tra kỹ sư cả ngày (`src/tools/engineer-audit/`) — mọi trạm chạy, 0 kẹt.
