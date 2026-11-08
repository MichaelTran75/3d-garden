# Drone

<!-- toc -->
- Mã · 0.3 KB
- Chạy thế nào · 0.4 KB
- Bẫy · 0.5 KB
<!-- /toc -->

## Mã

- `engineer/tasks/drone.js`: tất cả
- Gọi: lịch 15:20 `engineer/mind/schedule.js` · Tools `ui/tools-panel.js` (lý do chặn `engineer/mind/offers.js`) · bấm vật `ui/xray-lifecycle.js`
- `src/models/dji-mini3.glb` (CC-BY, Marco Workspace): `Drone`{Prop×4, Camera} · `RC`{StickL/R, Screen}

## Chạy thế nào

- `D.st`: toTable → grab → carry → place → back → ready → arm → flying → land → fetch → pick → home → park
- `plan()`: lên 40 m → 1 vòng `rimPath()` cách mép đảo 18 m → về → hạ
- Đậu bàn `park()`; bản nhẹ `droneLodBuild`, `lodTick`: > 48 px đầy đủ, ≤ 40 px nhẹ
- Màn tay cầm `rt` vẽ trong `droneToy.render()`; khung trên đầu `fScene` → `frameRT`

## Bẫy

- Tay cầm: cần trên, màn dưới
- Vật theo cổ tay: đặt đầu `render()` (`placeHeld`), không `update()`
- Lên bàn: toạ độ bàn + đáy lưới thật (`restOn`), không hộp bao nhóm
- Vẽ `rt`: ẩn tay cầm, khung, `labelGroup`; tắt shadowMap.autoUpdate
- Dừng giữa chừng: `park()` (trả cánh, tắt đèn)
- Đĩa mờ cánh: độ mờ 0 ⇒ ẩn hẳn
- Tạo lưới mới lệch `Math.random` ⇒ cố định quanh `attach()`
- Đổi bản nhẹ sau `COL.ready`
