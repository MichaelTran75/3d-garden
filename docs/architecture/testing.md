# Thử và gỡ lỗi

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.6 KB
- Cách thử · 0.4 KB
- Bẫy · 0.1 KB
- Bẫy hành vi kỹ sư · 1.3 KB
<!-- /toc -->

## Mã

- `src/tools/debug/` — `mkdbg.py` + `dbg-hook.js` dựng trang gỡ lỗi: `window.__dbg` (`view`, `frames`, `snap`, `engObj`, `clock`…), `window.__ev(mã)` chạy trong `build()`, giờ ép `window.__hourOverride`; đầu dò `ev4.cjs` (lệnh mẫu: `docs/html-text-probe/README.md`).
- `src/tools/engineer-audit/` — kỹ sư cả ngày; `harness.js`: `simSetup`, `runFor`, `envTo`, `wxLock`, `audRun`; cách chạy: README ở đó. Bộ đo theo việc: `docs/*-probe/`. Test: `node --test ../tests/garden-flight.test.cjs` (ngoài repo).

## Cách thử

- `simSetup()` cho `clock.getDelta` trả `clock.__dt` (mặc định 1/20): đồng hồ ảo bước cố định, tua nhanh.
- Độc lập tốc độ khung: `clock.__dt` = 1/15, 1/60, 1/144. `clock.__dt = 0` không thử được dt = 0: `loop()` đổi dt 0 thành 1/60.
- Câu cá 150 s: `fishLinePos` khớp khoen / ngọn cần thật, sai số phải = 0.

## Bẫy

- `__dbg.frames(n)` gọi thẳng `loop()` không ts ⇒ bỏ qua `adaptResolution`. Pane trình duyệt ẩn ⇒ rAF dừng.

## Bẫy hành vi kỹ sư

- Đi chéo: ô góc chênh ≤ 1 voxel với CẢ hai đầu (`engCornerOk`, BFS lẫn `engDir`); chỉ so ô xuất phát ⇒ ô có số bước mà không hướng nào đi được, đứng ì.
- Gờ / hố > 1 voxel chặn mọi bước, cả khi đích gần; vòng cắt cỏ bỏ điểm lệch mặt trại > 1 voxel, ngắt đoạn khi 2 điểm liền chênh > 1 voxel.
- Đích < 0,6 m không tính kẹt (cắt cỏ, hái táo), không thì cứ đứng nhìn quanh rồi đi vòng.
- Dạo trại không chọn đích ở ô cấm (`engNavBlocked`); dạo khám phá chỉ chọn điểm tới được (`engField`).
- Việc 1-lần xong sớm: khoá việc kế bằng `e.doneSet` (`engMarkDone`), không chờ giờ khung.
- Ngủ trưa, ngồi câu, đang ăn: việc tự chọn không gọi đi (`AUTO_ABSORB`), chỉ nhu cầu < 15; đang nghiên cứu: chỉ nhu cầu thân thể (`AUTO_BODY`).
- Việc tự chọn vừa bắt đầu giữ ≥ 20 s (`ENG_WANT_HOLD`), không thì đứng dậy rồi ngồi lại.
- Ngắm sao chỉ sau 19:00 (`ENG_HOURS.stars`); lệnh ngoài giờ bỏ trước khi bắt đầu (`ENG_CMD_HOURS`), `skyWatch.update` cũng chặn.
- Mây dày buổi tối ⇒ đọc sách thay ngắm sao: đúng, không phải lỗi.
