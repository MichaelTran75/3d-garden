# Động cơ xe, khung gầm

<!-- toc -->
- Mã · 1.8 KB
- Bẫy · 1.1 KB
- Số đo chuẩn · 0.1 KB
<!-- /toc -->

## Mã
- Vỏ xe, ca-pô, rê chuột: van.md · dựng lại mẫu: `src/tools/engine/`, `src/tools/chassis/`
- `van/body/transit-glb.js`: `engine()` nạp `src/models/engine.glb`, đặt theo `ENG_AT`
- `van/engine/engine-run.js`: `ENG_V`, `engineToggle(on, noX)`, `engineClick`, `engineSeen`, `engineTick`. Cơ cấu V6 60° = con `vanGlb.engineSrc` (hệ mẫu), tạo lần nổ máy đầu; vỏ máy mờ 25 %. `engineSeen()` = xem xuyên hoặc ca-pô mở; `engineToggle` tự bật xem xuyên, tắt máy trả lại
- `van/engine/engine-holo.js`: hình nổi `engHolo` = `VAN.holo` (`warm`, `start`, `tick`, `stop`): Ford 3.5L EcoBoost V6 thế hệ 2, 14 bộ phận tách rời (`H.order` = thứ tự tháo) × 3–7 chi tiết con (67), mỗi chi tiết 1 khối kín 1 màu hệ (`holoMat`); trục khuỷu theo `ENG_V`. Nhãn ngoài 2 cột + đường dẫn (`layout()`); lúc hiện `declutter()` giấu nhãn khác (Sprite / Line `depthTest false` hoặc `userData.label` → lớp 31; nhãn mới phải theo dấu này), `stop()` trả lại
- `engineer/tasks/engine-check.js`: `engineJob`, pha 'engine' (`engineer/mind/task-table.js`); nút nổ máy `engineTool` (`ui/xray-lifecycle.js`). `J.st`: ra đầu xe → chìa sau logo mở ca-pô (`VAN.openHood`) → ghế bậc `stool` `HOME` → `FRONT` → trèo → xem → hình nổi → nổ máy 30 s (`VAN.runEngine`) → đóng ca-pô (nếu tự mở) → cất ghế. Trên ghế: `J.on`, chân đặt bậc qua `engSupports` (chỉ `FRONT`) + `e.footPlan`. Cắt ngang: `idle()` (đang trên ghế ⇒ xuống đất 1 khung)
- `van/body/chassis.js`: khung gầm `src/models/chassis.glb` (toạ độ = đv xe ⇒ gắn thẳng `caravanObj`; L4: đỉnh x > 2,8 lùi `TR.ext`) + hộp số code

## Bẫy
- Hình nổi dựng từng chi tiết, không cắt lưới quét engine.glb theo vùng
- `VAN.holo.warm()` mỗi khung 1 bộ phận lúc kỹ sư ra đầu xe
- Hình nổi ≥ 1,55 trên đầu (trên bong bóng suy nghĩ)
- Hông ⇄ đầu xe: `vanWalk` qua góc (−4,05; ±1,65), tới góc bật `J.cn` đi thẳng
- Nhấc / đặt ghế (`lift`): đứng lùi 0,42, cúi gập eo, chân thẳng
- Ghế quay quanh tâm mặt trên (`blend`), rời đất rồi mới xoay
- Ôm ghế: lưng ghế áp bụng, bậc ra trước
- Trèo lên: nhấc rồi mới đưa chân tới, gót nhấc lúc đạp; xuống: lùi, mũi chạm trước
- `FRONT`: lưng ghế cách cản 10 cm; cúi xem ≤ 0,42
- Kỹ sư nổ máy khi ca-pô mở: `noX` (không tự bật xem xuyên)
- Khung gầm L4: vị trí lượng tử int16 + ma trận nút ⇒ đổi Float32 trước khi giãn
- engine.glb V6 60° (mỗi hàng 3 cổ xả / bugi), không V8; `ENG_V` theo đó
- Giảm lưới engine.glb: trọng số màu cao ⇒ giảm không nổi; dùng `w` trong README + `MS.useExperimentalFeatures = true`

## Số đo chuẩn
- Ghế trong tay: lệch điểm nắm ≤ 5 cm (ôm, đặt, cất), ≤ 12 cm lúc vừa nhấc xoay
