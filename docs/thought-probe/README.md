# Bộ thử nhận xét thời tiết của kỹ sư

Mã: `src/app/engineer/mind/weather-notice.js` (lõi `WXN`). Kiến trúc: `docs/architecture/engineer.md`.

- `node --test docs/thought-probe/unit.cjs`: 7 bài (quét 6000 số đo ngẫu nhiên: câu trọn, không sót ngoặc nhọn, ≤ 118 ký tự; ngày thường im; trong xe; độ quen; câu cặp; thiếu số đo; số suy ra)
- `node docs/thought-probe/sample.cjs [hạt]`: câu mẫu 12 kịch bản × 6 việc, kèm chỉ số : mức : giai đoạn + độ dài. Sửa mảnh câu xong đọc lại bằng mắt
- `AUD=<repo> SHOT=page.png node docs/thought-probe/page.cjs gN.html <giờ> docs/thought-probe/page-probe.js <thư mục ra>`: trang debug (`src/tools/debug/mkdbg.py`), khoá thời tiết 5 kịch bản, đọc `wxnObs` + kế hoạch + câu; ép nảy ý 10 lần liên tiếp (câu đầu là nhận xét, sau đó câu theo việc); ảnh cả trang có bong bóng
- `load.cjs`: nạp phần lõi (trước dòng nối vào cảnh) trong node:vm, bộ sinh số có hạt, số đo mẫu `base()`

Bẫy: `wxLock` chỉ khoá trường được đưa ⇒ đưa đủ `temperature`, `windSpeed`, `windGusts`, `windDirection`, `raining`, `thunder`, `fresh`, `data` (`current` + `hourly` 48 giờ, `utc_offset_seconds` 25200). Trong trang độ quen tính theo giờ thật ⇒ ép nảy ý liên tiếp chỉ ra 1 nhận xét; muốn nhận xét nữa gọi `WXN.reset()`.
