# GHC · Thủy điện Gia Lai — vườn năng lượng tái tạo 3D

Cảnh three.js (WebGL): thủy điện, cánh đồng pin mặt trời, tua-bin gió, trạm khí tượng với thời tiết Open-Meteo thật,
mặt trời mọc/lặn theo mùa ở Pleiku, kỹ sư sinh hoạt theo lịch cả ngày (nghiên cứu, nấu udon, tắm, câu cá…), đàn bò, chó, cò, ong bướm.
Trang: https://michaeltran75.github.io/3d-garden/ (nhúng Wix bằng iframe).

## Sửa ở đâu

Mã nguồn nằm trong `src/` — đây là nơi duy nhất cần sửa (ngay trên web GitHub cũng được):

| Thư mục / tệp | Nội dung |
|---|---|
| `src/page.html` | khung trang + giao diện (4 chỗ trống `@@CSS@@ @@WEATHER@@ @@FLIGHT@@ @@APP@@`) |
| `src/css/app.css` | kiểu giao diện |
| `src/js/weather.js` | thời tiết Open-Meteo + đồng hồ Pleiku |
| `src/js/flight-nav.js` | dẫn đường bay cho ong, bướm |
| `src/app/manifest.txt` | **thứ tự** ghép các mảnh mã cảnh chính (kèm mô tả từng tệp) |
| `src/app/core/` | khởi động, bầu trời, mặt trời/mặt trăng, địa hình |
| `src/app/world/` | thủy điện, tua-bin, pin mặt trời, nhà, đường, trạm biến áp, cột khí tượng, đèn đường |
| `src/app/nature/` | gió, cây, rừng, cỏ hoa, mặt nước, lá rơi, mây mưa |
| `src/app/animals/` | cá, bò, hươu, cua, thỏ, chó, gấu mèo, ong bướm, cò |
| `src/app/engineer/` | **kỹ sư**: hình người (`model.js`), tư thế + IK, ngồi ghế, suy nghĩ, lịch cả ngày (`schedule.js`), đi lại + các trạm trong xe, nấu ăn, cập nhật mỗi khung hình (`loop-update.js`) |
| `src/app/van/` | **xe van**: cabin, vỏ, nội thất (`caravan.js`), bếp, đồ bếp, đèn bàn, lon nước, Zzz |
| `src/app/camp/` | ghế, đèn lồng, lửa trại, ấm, bàn trà |
| `src/app/fishing/` | cần câu, xô, câu cá |
| `src/app/ui/`, `src/app/loop/` | nhãn, điều khiển camera, xem xuyên xe; vòng lặp khung hình |

Các mảnh trong `src/app/` được **nối nguyên văn** theo `manifest.txt` thành một khối script, dùng chung một phạm vi biến
(không `import`/`export`) — nên giữ đúng thứ tự trong manifest; thêm tệp mới thì ghi thêm một dòng vào manifest.

`index.html`, `css/`, `js/` là tệp **dựng ra** từ `src/` — đừng sửa tay.

## Dựng & đưa lên

- Sửa trên web GitHub: commit vào `src/` → GitHub Actions (`.github/workflows/build.yml`) tự chạy `build.py --check`, commit tệp đã dựng, Pages cập nhật sau ~1–2 phút.
- Trên máy: `./preview.sh` (xem thử) · `./publish.sh "mô tả"` (kéo bản mới · dựng · commit · push).
  Trên máy `build.py` còn dựng bản một tệp tự chứa `../3D garden.html` (cho bộ test `../tests/` và nhúng Wix kiểu HTML),
  và sẽ báo lỗi nếu tệp đó bị sửa tay sau lần dựng trước.

Nhúng vào Wix: *Thêm → Nhúng mã → Nhúng trang web* rồi dán đường dẫn trên, hoặc *Nhúng HTML* với:

```html
<iframe src="https://michaeltran75.github.io/3d-garden/" style="width:100%;height:100%;border:0" allow="fullscreen" loading="lazy" title="GHC · Vườn năng lượng 3D"></iframe>
```

## Mô hình

Mọi vật thể trong cảnh đều dựng bằng code three.js (hình hộp, khối tiện, đùn biên dạng, ống) và nhãn vẽ bằng canvas —
không nhúng lưới hay ảnh tải từ ngoài. Riêng đàn cò dựng theo số đo của mẫu `Stork.glb` trong bộ ví dụ three.js (MIT).
