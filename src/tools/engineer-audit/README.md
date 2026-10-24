# Kiểm tra hành vi kỹ sư cả ngày

G 24/10: "engineer đang bị lỗi, liệt kê lỗi task theo thời gian". Bộ này tua nhanh cả ngày trong trình duyệt ẩn. Nó ghi lại kỹ sư đổi việc lúc nào, ở đâu, và bắt các lỗi kèm giờ xảy ra.

## Chạy

```bash
cd 3d-garden && python3 build.py && node src/tools/engineer-audit/run.cjs --pool 4
```

- Mặc định chạy 8 đoạn giờ:
  - 5 đoạn ngày quang, từ 05:54 tới 21:54. Từ 17:54 trời bị khoá quang để thử ngắm sao.
  - Chiều mưa từ 14:00 tới 15:00.
  - Lệnh Tools ngắm sao lúc 10:00, 18:36 và 19:06.

  Chạy mất khoảng 15 phút. Muốn chạy đoạn giờ riêng thì đưa tệp `segs.json`, dạng `[{ name, h0, h1, wx, at: [[giờ, mã JS], …] }]`.
- Kết quả nằm ở `$TMPDIR/engineer-audit/<đoạn>.json`, đổi chỗ bằng `--out`. Chạy xong, `summary.py` tự in bảng lỗi theo giờ. Thêm `--info` để xem chuỗi việc, `--tr` để xem từng chuyển trạng thái.
- Cần Playwright: lấy từ `~/.npm/_npx`, hoặc đặt biến `PLAYWRIGHT_PATH`.

## Lỗi bắt được (`harness.js` audRun)

| Loại | Nghĩa |
|---|---|
| `exception` | Khung hình ném lỗi |
| `NaN` | Toạ độ hỏng |
| `teleport` | Nhảy hơn 0,9 m trong 1 khung |
| `stuck` | Bước đi không tiến 2,5 s, phải đứng nhìn quanh |
| `struggle` | 30 s chân bước mà không đi xa quá 0,6 m |
| `insideObstacle` | Đứng trong vật cản ở tầm thân người |
| `floating` / `sunk` | Lệch mặt đất hơn 0,65 m (hơn 1 bậc voxel) |
| `starsBefore19` | Ngắm sao trước 19:00 |
| `forceStale` | Lệnh Tools treo quá 25 phút (ngắm sao: quá 65 phút) |
| `leftover` | Đồ của việc trước (drone, thảm, máy cắt cỏ…) còn chạy khi đã sang việc khác |
| `onceAbandoned` | Việc 1-lần bị bỏ dở |

Riêng `info` không phải lỗi: nó ghi việc theo lịch, việc tự chủ, mốc xong việc.

Bản gỡ lỗi do `make-debug.py` dựng. Nó chèn `window.__dbg` và `window.__ev(mã)` để chạy mã trong phạm vi `build()`, cho giờ cảnh theo `window.__hourOverride`, và nạp mẫu 3D từ `/models`.
