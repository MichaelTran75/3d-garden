# Thử và gỡ lỗi

<!-- toc -->
- Mã · 0.5 KB
- Cách thử · 0.3 KB
- Bẫy · 0.1 KB
- Bẫy hành vi kỹ sư · 1.0 KB
<!-- /toc -->

## Mã

- `src/tools/debug/` mkdbg.py + dbg-hook.js: `window.__dbg` (view, frames, snap, engObj, clock…), `window.__ev(mã)` chạy trong build(), `window.__hourOverride`; đầu dò ev4.cjs, lệnh mẫu `docs/html-text-probe/README.md`.
- `src/tools/engineer-audit/` (README): kỹ sư cả ngày; harness.js: simSetup, runFor, envTo, wxLock, audRun.
- Đo theo việc: `docs/*-probe/`. Test: `node --test ../tests/garden-flight.test.cjs` (ngoài repo).

## Cách thử

- `simSetup()`: `clock.getDelta` trả `clock.__dt` (mặc định 1/20) ⇒ bước cố định.
- Thử dt: `clock.__dt` = 1/15, 1/60, 1/144; `clock.__dt = 0` vô ích (`loop()` đổi 0 → 1/60).
- Câu cá 150 s: `fishLinePos` khớp khoen / ngọn cần, sai số = 0.

## Bẫy

- `__dbg.frames(n)` gọi `loop()` không ts ⇒ bỏ `adaptResolution`.
- Pane trình duyệt ẩn ⇒ rAF dừng.

## Bẫy hành vi kỹ sư

- Đi chéo: ô góc chênh ≤ 1 voxel với cả 2 đầu (`engCornerOk`, BFS + `engDir`); chỉ so ô đi ⇒ đứng ì.
- Chênh > 1 voxel: chặn bước (cả đích gần); vòng cắt cỏ bỏ điểm lệch mặt trại, ngắt đoạn giữa 2 điểm liền.
- Đích < 0,6 m (cắt cỏ, hái táo) không tính kẹt.
- Dạo trại: đích ngoài ô cấm (`engNavBlocked`); khám phá: chỉ điểm tới được (`engField`).
- Việc 1-lần xong sớm ⇒ khoá việc kế (`e.doneSet`, `engMarkDone`), không chờ giờ khung.
- `AUTO_ABSORB` (ngủ trưa, câu, ăn): chỉ nhu cầu < 15 gọi đi; nghiên cứu: chỉ nhu cầu thân thể (`AUTO_BODY`).
- Việc tự chọn mới bắt đầu giữ ≥ 20 s (`ENG_WANT_HOLD`), không thì đứng dậy ngồi lại.
- Ngắm sao ≥ 19:00 (`ENG_HOURS.stars`, `skyWatch.update` chặn); lệnh ngoài giờ bỏ khi chưa bắt đầu (`ENG_CMD_HOURS`).
- Mây dày buổi tối ⇒ đọc sách thay ngắm sao: đúng.
