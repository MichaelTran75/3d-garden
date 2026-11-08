# Drone

> Ghi cho AI sửa mã: hiện trạng + bẫy. Lịch sử ở git. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.4 KB
- Chạy thế nào · 0.4 KB
- Bẫy · 0.6 KB
<!-- /toc -->

## Mã

- `engineer/tasks/drone.js` — tất cả: nạp mẫu, máy trạng thái `D.st`, bay, cầm, camera, bản nhẹ.
- Gọi việc: lịch 15:20 (`engineer/mind/schedule.js`), nút Tools (`ui/tools-panel.js`, lý do chặn ở `engineer/mind/offers.js`), bấm vật (`ui/xray-lifecycle.js`).
- Mẫu `src/models/dji-mini3.glb` (CC-BY, Marco Workspace). Nút: `Drone`{Prop×4, Camera} · `RC`{StickL/R, Screen}.

## Chạy thế nào

- `D.st`: toTable → grab → carry → place → back → ready → arm → flying → land → fetch → pick → home → park.
- Bay `plan()`: lên 40 m → 1 vòng `rimPath()` quanh đảo (cách mép 18 m) → về → hạ.
- Đậu bàn: `park()`; xa thì bản nhẹ (`droneLodBuild`, `lodTick`: > 48 px đầy đủ, ≤ 40 px nhẹ).
- Màn tay cầm: `rt` vẽ trong `droneToy.render()`; khung trên đầu: `fScene` → `frameRT`.

## Bẫy

- Tay cầm: cần ở TRÊN, màn ở DƯỚI.
- Đặt vật theo cổ tay ở đầu `render()` (`placeHeld`), không trong `update()`.
- Đặt lên bàn bằng toạ độ bàn + đáy lưới thật (`restOn`), không dùng hộp bao cả nhóm.
- Khi vẽ `rt`: ẩn tay cầm, khung, `labelGroup`; tắt shadowMap.autoUpdate.
- Dừng giữa chừng phải qua `park()` (trả cánh, tắt đèn).
- Đĩa mờ cánh: ẩn hẳn khi độ mờ 0.
- Tạo lưới mới làm lệch `Math.random` ⇒ cố định quanh `attach()`.
- Chờ `COL.ready` rồi mới đổi bản nhẹ.
