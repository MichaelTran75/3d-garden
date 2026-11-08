# Kiểm tra hành vi kỹ sư cả ngày

Chromium ẩn tua nhanh cả ngày; ghi đổi việc (giờ, chỗ) + lỗi kèm giờ.

```bash
cd 3d-garden && python3 build.py && node src/tools/engineer-audit/run.cjs --pool 4
```

- Mặc định 8 đoạn, ~15 phút: 5 đoạn ngày quang 05:54 → 21:54 (từ 17:54 khoá trời quang, thử ngắm sao); mưa 14:00 → 15:00; lệnh Tools ngắm sao 10:00, 18:36, 19:06.
- Đoạn riêng: `segs.json` = `[{ name, h0, h1, wx, at: [[giờ, mã JS], …] }]`.
- Ra `$TMPDIR/engineer-audit/<đoạn>.json` (`--out` đổi); cuối tự chạy `summary.py <out>`: lỗi theo giờ; thêm `--info` chuỗi việc, `--tr` từng chuyển trạng thái.
- Playwright: tự lấy bản mới nhất trong `~/.npm/_npx`, hoặc `PLAYWRIGHT_PATH`.
- `make-debug.py` dựng bản gỡ lỗi: `window.__dbg`, `window.__ev(mã)` (chạy trong `build()`), giờ `window.__hourOverride`, mẫu từ `/models`.

## Lỗi (`harness.js` audRun)

- `exception` · `NaN` · `starsBefore19` · `onceAbandoned` (việc 1-lần bỏ dở)
- `teleport`: > 0,9 m / khung
- `stuck`: bước không tiến 2,5 s ⇒ đứng nhìn quanh
- `struggle`: 30 s chân bước, đi < 0,6 m
- `insideObstacle`: trong vật cản tầm thân
- `floating` / `sunk`: lệch mặt đất > 0,65 m (> 1 bậc voxel)
- `forceStale`: lệnh Tools treo > 25 phút (ngắm sao > 65)
- `leftover`: đồ việc trước (drone, thảm, máy cắt cỏ…) còn chạy sau khi đổi việc
- `info` (không phải lỗi): việc theo lịch, tự chủ, mốc xong
