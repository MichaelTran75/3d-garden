# Giao diện: thanh tổng quan, bảng Engineer, nhãn

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.9 KB
- Chạy thế nào · 0.6 KB
- Bẫy · 1.5 KB
<!-- /toc -->

## Mã

- `src/page.html`, `src/css/app.css`, `src/js/weather.js` — thanh trên `#weather-dock`; thanh nút `.toolbar`; khung `#engPanel` 2 thẻ: Tools `#toolsPanel` · Nhu cầu `#simPanel`.
- `ui/labels-controls.js` — `tbIcon`, `updateZoomPct`, `pickRay`.
- `ui/tools-panel.js` — `TL_ITEMS`, `toolsShow`, `engTabs`, `toolsTick`; bấm ⇒ `ENGINEER.ask(k)` → `engForceAct`. Lý do chưa làm: `offerBusy()`, `ENG_OFFERS` (`engineer/mind/offers.js`).
- `ui/sim-needs.js` + `engineer/mind/needs.js` (`SIM_NEEDS`, `SIM_DO`, `simInit`, `simNeedsTick`) — chỉ số kiểu The Sims.
- `ui/xray-lifecycle.js` — bấm dụng cụ trong cảnh: `TOOLS`, `#toolPop`, dịch vụ 'jobs' (`jobBox`). Rê / bấm vật: `hovAdd` (`ui/hover-select.js`).
- Nhãn kỹ sư = dòng đầu bong bóng: `drawEngineerLabel` (`engineer/mind/thought-bubble.js`). Lớp chữ: xem html-text-layer.md.

## Chạy thế nào

- Việc giao mới: 1 dòng `ENG_OFFERS` + 1 dòng `TL_ITEMS` + điểm kết thúc ở `engineer/mind/task-table.js`.
- `engWantAct0`: lệnh ngoài `ENG_CMD_HOURS` bỏ nếu chưa bắt đầu; mưa huỷ lệnh trừ danh sách việc khô; gió > 9 m/s huỷ drone.
- Ghế 'chair' → 'read' + trà (`e.rtTea`); củi 'wood' → `woodJob` → `CHIMINEA.addWood()`; Farming 'pull' xong vào 'plant' với `J.k = 0.6`; hái táo: giỏ xa ⇒ toBasket → liftT → bring → setB, `canPick()` chỉ khi giỏ rỗng.
- `simNeedsTick` đọc việc đang làm thật; giờ nhảy > 12 phút ⇒ `simInit(h)` tua lịch từ `ENG_SLEEP_H`.

## Bẫy

- Giữ mọi id mà `weather.js` ghi (`weather-status`, `weather-refresh`, `data-stale`).
- Đổi nút thanh dưới qua `tbIcon()`, không ghi innerHTML kèm chữ; riêng `#btnSim` giữ chữ.
- `.tb-eng:has(:focus-visible)` là luật riêng (trình duyệt không hiểu `:has` chỉ bỏ luật đó). Nút Tools chỉ hiện khi rê / Tab: nó đè thanh trượt nét viền xe.
- Màn ≤ 700 px: bảng `bottom: 88px`, thấp hơn thì thanh trượt đè dòng cuối.
- Lưới đã gộp lượt vẽ nằm lớp `HIDE_LAYER` (31): tia bấm phải bật lớp đó (`pickRay`); dụng cụ bấm qua hộp vô hình `jobBox`.
- Việc theo lệnh thiếu điểm kết thúc ⇒ `engForceAct` treo, kỹ sư kẹt việc mãi.
- "· theo lệnh" phải xét `ENGINEER.asked`, không chỉ lệnh tự chủ.
- Đầu `loop-update.js` trả cốc về tay vịn khi pha ≠ 'tea' ⇒ giữ ngoại lệ `e.rtTea` + 'read' + 'chair'.
- Chỗ đứng lấy củi dò vòng quanh đống, ngoài `FIRE_AVOID_R`; lấy thẳng hướng cửa lò ⇒ vào vùng cấm, kẹt.
- Đom đóm (`animals/insects/fireflies.js`): mỗi con một nhịp, không ghép pha — cả đàn không cùng sáng cùng tắt.
- Playwright: `pauseScene()` trước hover / click, không thì chờ quá giờ; chờ trang sẵn sàng luôn có hạn + đọc lỗi console (lỗi lúc dựng ⇒ treo mãi).
- Thử ngắm sao: mây thật hay dày ⇒ khoá `cloud_cover` thấp (`wxLock`, `src/tools/engineer-audit/`).
