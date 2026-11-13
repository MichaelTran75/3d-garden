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
- `dishBusy`: bát / chảo trên tay khi làm việc khác (ngoài trời chỉ được bưng khi về ghế ăn / vào xe; trong xe không cầm cùng cốc, sách, lon)
- `info` (không phải lỗi): việc theo lịch, tự chủ, mốc xong

## Bước đi, lấn vật (`stepprobe.js`, `stepsum.py`)

```bash
node src/tools/engineer-audit/run.cjs --pool 4 --out <out> --probe stepprobe.js && python3 src/tools/engineer-audit/stepsum.py <out>/step
```

- Kỹ sư + chó, 10 lần / giây khi đi: lưới điểm trong từng khối thân (thân, chân, tay, đồ cầm, đuôi) có nằm trong khoảng đặc lớp va chạm không ⇒ đợt lấn theo vật × trạng thái × phần thân; lượt xuyên (`ghost`), khung kẹt, nhảy vị trí; đợt thân chụp 2 góc
- `stepsum.py <trước>/step <sau>/step`: thêm bảng so. So bằng số điểm lưới; cột fp dùng `colFH` của app ⇒ đổi nghĩa khi đổi dấu chân
- Chạm có chủ ý (ngồi ghế, chó trên đống củi) tách riêng (`MEANT`)
- Vết từng khung quanh 1 điểm: đoạn có `probe: { fine: { a: 'eng' | 'dog', x, z, r, max } }`
- Bẫy: không dựng lại trang khi đang chạy; tên vật = vật gần nhất ⇒ cột bạt, bậc cửa mang tên vật kề; cây + củi ngẫu nhiên mỗi lần mở ⇒ so 2 lượt theo tỉ lệ, không theo từng đợt
