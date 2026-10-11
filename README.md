# GHC · Thủy điện Gia Lai — vườn năng lượng tái tạo 3D

Cảnh three.js (WebGL): thủy điện, cánh đồng pin mặt trời, tua-bin gió, trạm khí tượng với thời tiết Open-Meteo thật,
mặt trời mọc/lặn theo mùa ở Pleiku, kỹ sư cắm trại câu cá, đàn bò, chó, cò, ong bướm.
Trang: https://michaeltran75.github.io/3d-garden/ (nhúng Wix bằng iframe).

| Tệp | Nội dung |
|---|---|
| `index.html` | khung trang + giao diện |
| `css/app.css` | kiểu giao diện |
| `js/weather.js` | thời tiết Open-Meteo + đồng hồ Pleiku |
| `js/flight-nav.js` | dẫn đường bay cho ong, bướm |
| `js/app.js` | dựng cảnh + toàn bộ hoạt cảnh |

Bản gốc để sửa là tệp một-file `../3D garden.html` (test: `node --test ../tests/garden-flight.test.cjs`).
Các tệp trong thư mục này do `build.py` tách ra — đừng sửa tay.

- Xem trên máy: `./preview.sh`
- Đưa lên mạng: `./publish.sh "mô tả"` (tách lại + commit + push)

Nhúng vào Wix: *Thêm → Nhúng mã → Nhúng trang web* rồi dán đường dẫn trên, hoặc *Nhúng HTML* với:

```html
<iframe src="https://michaeltran75.github.io/3d-garden/" style="width:100%;height:100%;border:0" allow="fullscreen" loading="lazy" title="GHC · Vườn năng lượng 3D"></iframe>
```

## Mô hình

Mọi vật thể trong cảnh đều dựng bằng code three.js (hình hộp, khối tiện, đùn biên dạng, ống) và nhãn vẽ bằng canvas —
không nhúng lưới hay ảnh tải từ ngoài. Riêng đàn cò dựng theo số đo của mẫu `Stork.glb` trong bộ ví dụ three.js (MIT).
