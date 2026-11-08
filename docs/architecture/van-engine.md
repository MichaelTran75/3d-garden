# Động cơ xe, khung gầm, hình nổi kiểm tra máy

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.7 KB
- Chạy thế nào · 1.1 KB
- Bẫy · 1.7 KB
- Số đo chuẩn · 0.2 KB
<!-- /toc -->

## Mã

- Vỏ xe, ca-pô, rê chuột: xem van.md.
- `van/engine/engine-run.js` — máy chạy: `ENG_V`, `engineToggle(on, noX)`, `engineClick`, `engineSeen`, `engineTick`.
- `van/engine/engine-holo.js` — hình nổi `engHolo` = `VAN.holo` (`warm`, `start`, `tick`, `stop`).
- `van/body/transit-glb.js` — `engine()`: nạp `src/models/engine.glb`, đặt theo `ENG_AT`.
- `engineer/tasks/engine-check.js` — `engineJob`, pha 'engine' (`engineer/mind/task-table.js`); nút nổ máy `engineTool` (`ui/xray-lifecycle.js`).
- `van/body/chassis.js` — khung gầm `src/models/chassis.glb` + hộp số dựng bằng code.
- Dựng lại mẫu: README trong `src/tools/engine/`, `src/tools/chassis/`.

## Chạy thế nào

- Máy: cơ cấu V6 60° dựng trong hệ mẫu engine.glb (con của `vanGlb.engineSrc`), tạo lần đầu nổ máy; vỏ máy mờ còn 25 %. `engineSeen()` = xem xuyên hoặc ca-pô mở; `engineToggle` tự bật xem xuyên, tắt máy thì trả lại.
- Kiểm tra (`J.st`): ra đầu xe → chìa sau logo mở ca-pô (`VAN.openHood`) → mang ghế bậc `stool` từ `HOME` ra `FRONT` → trèo → xem → hình nổi → nổ máy 30 s (`VAN.runEngine`) → đóng ca-pô (chỉ khi tự mở) → cất ghế. Trên ghế: `J.on`, chân đặt bậc qua `engSupports` (chỉ ở `FRONT`) + `e.footPlan`. Cắt ngang: `idle()` (đang trên ghế thì tụt xuống đất 1 khung).
- Hình nổi: Ford 3.5L EcoBoost V6, 14 bộ phận (`H.order` = thứ tự tháo) × 3–7 chi tiết con, mỗi chi tiết 1 khối kín 1 màu hệ (`holoMat`), trục khuỷu theo `ENG_V`. Nhãn ngoài 2 cột (`layout()`); lúc hiện `declutter()` giấu nhãn khác (lớp 31), `stop()` trả lại.
- Khung gầm: toạ độ GLB = đv xe ⇒ gắn thẳng `caravanObj`; L4: đỉnh x > 2,8 lùi `TR.ext`.

## Bẫy

- Đừng tách hình nổi bằng cắt lưới quét engine.glb theo vùng: mép răng cưa, mảnh vụn, 1 chi tiết 2 màu, chi tiết nhỏ mất.
- Dựng cả hình nổi một lần thì giật: `VAN.holo.warm()` mỗi khung 1 bộ phận lúc kỹ sư ra đầu xe.
- Hình nổi thấp hơn 1,55 trên đầu thì bong bóng suy nghĩ đè đáy hình.
- Hông xe ⇄ đầu xe: `vanWalk` qua góc (−4,05; ±1,65), tới góc bật `J.cn` đi thẳng — không thì lượn quanh góc tới hết giờ.
- Nhấc / đặt ghế (`lift`): đứng lùi 0,42, cúi gập eo chân thẳng — ngồi xổm thì gối cắm vào mặt ghế, tay hụt.
- Ghế quay quanh tâm mặt trên (`blend`), rời đất rồi mới xoay — quay quanh gốc thì 2 mép văng kéo tay, góc ghế quét qua chân.
- Ôm ghế: lưng ghế áp bụng, bậc ra trước — ngược lại bậc dưới đâm vào đùi.
- Trèo: lên thì nhấc rồi mới đưa chân tới, gót nhấc lúc đạp; xuống lùi, mũi chạm trước.
- `FRONT` lưng ghế cách cản 10 cm, cúi xem ≤ 0,42 — sát / sâu hơn thì bụng lẹm vào ga-lăng.
- Kỹ sư nổ máy khi ca-pô mở phải `noX`, không thì tự bật xem xuyên.
- Khung gầm L4: vị trí lượng tử int16 + ma trận nút ⇒ đổi Float32 trước khi giãn.
- engine.glb là V6 60° (mỗi hàng 3 cổ xả / bugi), không phải V8 — cơ cấu `ENG_V` theo đó.
- Giảm lưới engine.glb: trọng số màu cao thì giảm không nổi — dùng `w` trong README + `MS.useExperimentalFeatures = true`.
- Chèn `//` giữa dòng nuốt lệnh phía sau; chú thích để cuối dòng (build.py dò `SWALLOW`).

## Số đo chuẩn

- Ghế trong tay: lệch điểm nắm ≤ 5 cm (ôm, đặt, cất), ≤ 12 cm lúc vừa nhấc xoay.
- Máy chạy đúng 30 s mỗi lần kiểm tra.
