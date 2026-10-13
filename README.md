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
| `src/app/core/` | khởi động, bầu trời, mặt trời/mặt trăng, mặt nước, địa hình; **gộp lượt vẽ** (`draw-batch.js`) |
| `src/app/world/` | thủy điện, tua-bin, pin mặt trời, nhà, đường, trạm biến áp, cột khí tượng, đèn đường |
| `src/app/nature/` | gió, cây, rừng, cỏ hoa, lá rơi, mây, **mưa trên GPU** (`clouds-rain.js`), **chất lỏng** (`fluids.js`: nước nông + sợi khói bếp lửa, chạy ở luồng phụ), **đầm sen** (`lotus.js`) |
| `src/app/animals/` | cá, bò, hươu, cua, thỏ, chó, gấu mèo, ong bướm, cò |
| `src/app/engineer/` | **kỹ sư**: hình người (`model.js`), tư thế + IK, ngồi ghế, suy nghĩ, lịch cả ngày (`schedule.js`), đi lại + các trạm trong xe, nấu ăn, cập nhật mỗi khung hình (`loop-update.js`) |
| `src/app/van/` | **xe van**: cabin, vỏ, nội thất (`caravan.js`), bếp, đồ bếp, đèn bàn, lon nước, Zzz |
| `src/app/camp/` | ghế, đèn lồng, lửa trại, ấm, bàn trà |
| `src/app/fishing/` | cần câu, xô, câu cá |
| `src/app/ui/`, `src/app/loop/` | nhãn, điều khiển camera, xem xuyên xe; vòng lặp khung hình |

Các mảnh trong `src/app/` được **nối nguyên văn** theo `manifest.txt` thành một khối script, dùng chung một phạm vi biến
(không `import`/`export`) — nên giữ đúng thứ tự trong manifest; thêm tệp mới thì ghi thêm một dòng vào manifest.

`index.html`, `css/`, `js/` là tệp **dựng ra** từ `src/` — đừng sửa tay.

## Hiệu năng (đọc trước khi thêm vật mới)

- **Gộp lượt vẽ** (`core/draw-batch.js`, chạy một lần sau khi dựng xong cảnh): mọi Mesh/nét viền thường được gộp theo kiểu vật liệu thành vài
  lưới "skinning cứng" — mảnh gốc vẫn nằm trong cây đối tượng (xoay, dời, ẩn/hiện, công cụ Chọn đều như cũ) nhưng không tự vẽ.
  Vật mới dựng lúc mở trang **tự được gộp**, không cần làm gì (vật tạo thêm lúc đang chạy thì tự vẽ như thường). Code đổi màu/độ mờ vật liệu, thay hình, thay vật liệu lúc chạy thì mảnh đó tự tách ra vẽ riêng.
  Hình biến dạng đỉnh mỗi khung (vd. thân cá uốn) nên gắn `userData.noBatch = true` cho khỏi tốn công gộp.
- Ô đất phẳng chỉ vẽ mặt trên + mặt đáy; texture mây tính ở luồng phụ (Web Worker); shader biên dịch song song trước khung đầu.
- **Chất lỏng** (`nature/fluids.js`, Web Worker dựng từ Blob): sông/hồ là lưới nước nông (Saint-Venant) trùng ô địa hình — mặt nước, lá, cá, phao
  đều đọc cùng số liệu (`waterSurfaceY`, `waterFlow`). Vật mới chạm nước thì gọi `fluids.splash(x, z, bánKính, cườngĐộ)`.
  Khói bếp lửa là `fluids.addSmoke(cfg, look)` — cùng kỹ thuật luồng khói động cơ của `airport-gate`: Navier–Stokes đối xứng trục
  quanh cột khí nóng (lưới so le, lực nổi, nhớt rối theo tầng, SOR) + hạt rối Langevin + gió thật, vẽ thành dải sợi khói mép mềm dựng sẵn trong
  luồng phụ. Mỗi khung đặt `base`, `heat`, `smoke`, `rate`, `steam`, `zF`, `spout` (vòi ấm). Thử ngoài trình duyệt: `kernel.smokeState()`.
- `build.py --check` có **ngân sách dung lượng nén** (`BUDGET_KB`): `js/app.js` ≤ 380 KB gzip, cả trang ≤ 400 KB — vượt thì Actions báo lỗi.

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
