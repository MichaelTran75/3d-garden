# Dựng lại `app/core/constellation-lines.js`

Nét nối 88 chòm sao cho trời đêm (`app/core/constellations.js`).

## Nguồn

- **Nét nối + điểm đặt tên:** `data/constellations.lines.json` và `data/constellations.json` của [d3-celestial](https://github.com/ofrohn/d3-celestial) (Olaf Frohn).
  - Hình chòm theo bản đồ chòm sao IAU (Sky & Telescope), có vài chỗ tác giả sửa.
  - Giấy phép BSD-3-Clause, Copyright (c) 2015 Olaf Frohn. Thông báo bản quyền được chép nguyên vào khối `/* */` của tệp ra; trang có dòng ghi công "Chòm sao: d3-celestial".
  - Bản tải về không lưu trong repo.
- **Tên tiếng Việt:** cột "Tên Hán Việt" của bảng [Danh sách chòm sao](https://vi.wikipedia.org/wiki/Danh_sách_chòm_sao) (Wikipedia tiếng Việt). Có 2 chỗ sửa:
  - Libra: bảng ghi Thiên Xứng nhưng liên kết tới bài Thiên Bình ⇒ dùng **Thiên Bình**;
  - Sagittarius: bảng ghi Cung Thủ, bài về chòm lấy tên **Nhân Mã** ⇒ dùng Nhân Mã. Centaurus vẫn là Bán Nhân Mã.
- **Sao để khớp:** `STAR_BSC5` trong `app/core/star-catalog.js` (Yale BSC5, 2 887 sao tới cấp 5,5).

## Chạy

```
python3 -I pack.py <constellations.lines.json> <constellations.json> ../../app/core/star-catalog.js ../../app/core/constellation-lines.js
```

`LICENSE` của d3-celestial phải nằm cùng thư mục với `constellations.lines.json`.

## Cách đóng gói

- Mỗi đỉnh nét nối khớp sao gần nhất trong danh mục (≤ 0,15°) ⇒ lấy đúng toạ độ đã lượng tử của sao đó, nét chạm đúng tâm chấm sao, kèm cấp sao để chừa khe.
  - Kết quả: 882 / 884 đỉnh khớp, lệch xa nhất 0,017°.
  - 2 đỉnh không có sao trong danh mục, giữ toạ độ của d3-celestial, cấp 6:
    - Nam Miện: η² CrA (282,40°, −43,43°), mờ hơn 5,5 nên không có trong danh mục; sao vẽ gần nhất là η¹ CrA, cách 0,27°.
    - Anh Tiên, 1 góc vòng đầu Medusa (44,92°, +41,03°): không có sao sáng hơn 5,5 trong 1,39° (gần nhất π Per). Có thể là sao mờ trong hình gốc hoặc lỗi số liệu
      của d3-celestial.
- Nhị phân base64:
  - mỗi chòm 1 byte số đường gấp khúc;
  - mỗi đường 1 byte số đỉnh;
  - mỗi đỉnh 4 byte little-endian: xích kinh 14 bit (360°/16384), xích vĩ 13 bit (180°/8191, từ −90°), cấp sao 4 bit (0,5 từ −1,5).
- `CONST_INFO`: mã IAU, tên Hán Việt, tên La-tinh, hạng 1–3, xích kinh / xích vĩ điểm đặt tên. Xếp theo tên La-tinh, cùng thứ tự với `CONST_LINES`.
- Kết quả: 5 032 ký tự base64, tệp 12,6 KB.
