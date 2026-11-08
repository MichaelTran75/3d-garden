# Dựng lại `app/core/constellation-lines.js`

## Nguồn
- Nét + điểm đặt tên: `data/constellations.lines.json`, `data/constellations.json` của [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn); hình chòm theo bản đồ IAU (Sky & Telescope), vài chỗ tác giả sửa; bản tải không lưu trong repo.
- BSD-3-Clause, Copyright (c) 2015 Olaf Frohn: thông báo chép nguyên vào khối `/* */` tệp ra; trang ghi công "Chòm sao: d3-celestial".
- Tên: cột "Tên Hán Việt" bảng [Danh sách chòm sao](https://vi.wikipedia.org/wiki/Danh_sách_chòm_sao) (Wikipedia tiếng Việt). Sửa: Libra ⇒ Thiên Bình (bảng ghi Thiên Xứng, liên kết bài Thiên Bình); Sagittarius ⇒ Nhân Mã (bảng ghi Cung Thủ, bài chòm tên Nhân Mã); Centaurus vẫn Bán Nhân Mã.
- Sao khớp: `STAR_BSC5` trong `app/core/star-catalog.js` (Yale BSC5, 2 887 sao tới cấp 5,5).

## Chạy
```
python3 -I pack.py <constellations.lines.json> <constellations.json> ../../app/core/star-catalog.js ../../app/core/constellation-lines.js
```
- `LICENSE` của d3-celestial phải cùng thư mục với `constellations.lines.json`.

## Đóng gói
- Đỉnh khớp sao gần nhất trong danh mục (≤ 0,15°) ⇒ lấy toạ độ lượng tử của sao đó (nét chạm tâm chấm) + cấp sao (chừa khe).
- 882/884 đỉnh khớp, lệch xa nhất 0,017°. 2 đỉnh không khớp giữ toạ độ d3-celestial, cấp 6:
  - Nam Miện η² CrA (282,40°, −43,43°): mờ hơn 5,5; sao vẽ gần nhất η¹ CrA cách 0,27°.
  - Anh Tiên, góc vòng đầu Medusa (44,92°, +41,03°): không sao sáng hơn 5,5 trong 1,39° (gần nhất π Per); có thể sao mờ trong hình gốc hoặc lỗi số liệu d3-celestial.
- `CONST_LINES` base64: mỗi chòm 1 byte số đường gấp khúc; mỗi đường 1 byte số đỉnh; mỗi đỉnh 4 byte LE: xích kinh 14 bit (360°/16384), xích vĩ 13 bit (180°/8191, từ −90°), cấp sao 4 bit (0,5 từ −1,5).
- `CONST_INFO`: mã IAU, tên Hán Việt, tên La-tinh, hạng 1–3, xích kinh/xích vĩ điểm đặt tên; xếp theo tên La-tinh, cùng thứ tự `CONST_LINES`.
- Ra: 5 032 ký tự base64, tệp 12,6 KB.
