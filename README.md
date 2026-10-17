# GHC · Thủy điện Gia Lai — vườn năng lượng tái tạo 3D

Cảnh three.js (WebGL): thủy điện, cánh đồng pin mặt trời, tua-bin gió, trạm khí tượng với thời tiết Open-Meteo thật, mặt trời theo mùa ở Pleiku.
Kỹ sư sinh hoạt theo lịch cả ngày (bấm drone hoặc tay cầm trên bàn trà rồi chọn "▶ Chơi" để gọi kỹ sư ra bay; bấm giỏ hoặc sào cạnh cây táo rồi chọn "Hái táo"); đàn bò, chó, cò, chim sẻ, ong, bướm sống quanh trại.

Trang: https://michaeltran75.github.io/3d-garden/ (nhúng Wix bằng iframe).

## Sửa ở đâu

Chỉ sửa trong `src/`. Đọc `src/ARCHITECTURE.md` trước: khung hình chạy gì, vật lý, IK, va chạm, gộp lượt vẽ, cách thử và các bẫy đã gặp.

| Thư mục / tệp | Nội dung |
|---|---|
| `src/page.html`, `src/css/` | khung trang, giao diện |
| `src/js/` | thời tiết Open-Meteo, dẫn đường bay cho ong và bướm |
| `src/app/manifest.txt` | thứ tự ghép các mảnh mã cảnh (mỗi dòng một tệp, kèm mô tả) |
| `src/app/core/` | khởi động, bầu trời, mặt trời và mặt trăng, trời đêm, va chạm, gộp lượt vẽ, chất liệu bề mặt |
| `src/app/world/` | thủy điện, tua-bin, pin mặt trời, nhà, đường, trạm biến áp, đèn đường, xuồng |
| `src/app/nature/` | gió, cây, cỏ hoa, mưa, mặt nước, khói, đầm sen |
| `src/app/animals/` | bò, hươu, chó, gấu mèo, cò, chim sẻ, cá koi, ong, bướm |
| `src/app/engineer/` | kỹ sư: dáng người, tư thế, lịch ngày, ăn, ngủ, câu cá, hái táo, drone |
| `src/app/van/`, `camp/`, `fishing/` | xe van, đồ cắm trại, cần câu |
| `src/app/ui/`, `src/app/loop/` | điều khiển camera, nhãn, vòng lặp khung hình |
| `src/models/` | mẫu dùng nguyên (drone + tay cầm DJI Mini 3, ảnh vân vỏ cây cắt từ bản quét), trang tải sau khi cảnh chạy |

Các mảnh trong `src/app/` được nối nguyên văn theo `manifest.txt` thành một khối script, dùng chung phạm vi biến (không `import`/`export`).
Thêm tệp mới thì thêm một dòng vào manifest, đúng thứ tự.

`index.html`, `css/`, `js/`, `models/` là tệp dựng ra từ `src/`, đừng sửa tay.

Khi thêm vật mới:
- Vật dựng lúc mở trang tự được gộp lượt vẽ. Vật biến dạng mỗi khung hoặc bị mang đi xa chỗ cũ thì gắn `userData.noBatch = true`.
- Vật chạm nước thì gọi `fluids.splash(x, z, bánKính, cườngĐộ)`.

## Dựng và đưa lên

- Xem thử trên máy: `./preview.sh`
- Đăng: `./publish.sh "mô tả"` (kéo bản mới, dựng, kiểm ngân sách, commit, push). Pages cập nhật sau khoảng 1 phút.
- Sửa ngay trên web GitHub: commit vào `src/`, GitHub Actions tự dựng.
- `build.py --check` báo lỗi khi vượt ngân sách gzip: `js/app.js` ≤ 420 KB, cả trang ≤ 440 KB; thư mục `models/` ≤ 1,5 MB (chưa nén, không tính vào ngân sách gzip).
- Trên máy, `build.py` còn dựng bản một tệp `../3D garden.html` cho bộ test `../tests/` (mốc: 14 đạt, 5 lỗi có sẵn).

## Nhúng vào Wix

*Thêm → Nhúng mã → Nhúng trang web* rồi dán đường dẫn trên, hoặc *Nhúng HTML*:

```html
<iframe src="https://michaeltran75.github.io/3d-garden/" style="width:100%;height:100%;border:0" allow="fullscreen" loading="lazy" title="GHC · Vườn năng lượng 3D"></iframe>
```

## RC prompt

Dán vào một phiên Claude mới (hoặc phiên Remote Control) để làm tiếp dự án, thay dòng cuối bằng việc cần làm:

```text
Dự án 3d-garden (repo MichaelTran75/3d-garden, trang https://michaeltran75.github.io/3d-garden/): cảnh three.js r160 một trang.
Trước khi sửa, đọc README.md rồi src/ARCHITECTURE.md.
Quy tắc:
- Chỉ sửa trong src/. index.html, css/, js/, models/ là tệp dựng ra. Tệp mới trong src/app/ phải thêm vào src/app/manifest.txt đúng thứ tự.
- Mã src/app/ nối thành một phạm vi biến: không import/export; không chèn chú thích // giữa một dòng nhiều lệnh (nuốt phần sau).
- Mọi vật dựng bằng code three.js. GLB hoặc ảnh mẫu chỉ dùng để đo, không nhúng; mẫu mới ghi công vào mục Mô hình của README. Ngoại lệ: drone + tay cầm DJI (src/models/dji-mini3.glb) và ảnh vân vỏ cây từ bản quét (src/models/bark-scan.jpg) — G cho dùng nguyên.
- Giữ ngân sách gzip của python3 build.py --check (js/app.js ≤ 420 KB, cả trang ≤ 440 KB); muốn nâng thì hỏi trước.
- Cây, cành, lá dùng rnd() có hạt giống: giữ đúng thứ tự gọi rnd() để táo, hoa, tổ, chỗ chim đậu không đổi chỗ.
- Không viết lại lịch sử git.
Kiểm tra: ./preview.sh để xem; nếu có ../tests thì chạy node --test ../tests/garden-flight.test.cjs (mốc 14 đạt, 5 lỗi có sẵn).
Đăng: ./publish.sh "mô tả thay đổi".
Trả lời bằng tiếng Việt; khi đổi hình ảnh thì gửi ảnh chụp trước và sau.
Việc cần làm: ...
```

## Mô hình

Mọi vật thể dựng bằng code three.js, nhãn vẽ bằng canvas, trừ hai mẫu dùng nguyên:

- Drone và tay cầm: ["DJI Mini 3 Drone with Remote Controller"](https://sketchfab.com/3d-models/dji-mini-3-drone-with-remote-controller-24ce5dcfced44e3d9da46167da720603) của [Marco Workspace](https://sketchfab.com/MarcoWorkspace), giấy phép [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Đã sửa: tách thân, cánh quạt, tay cầm, cần điều khiển thành phần riêng; giảm lưới; nén (`src/models/dji-mini3.glb`).
- Vân vỏ cây cổ thụ, cây táo, anh đào: ảnh vân cắt từ ["Tree 3D Scan - Retopo"](https://sketchfab.com/3d-models/tree-3d-scan-retopo-9e6778e11ad2413dab940e23bb0b89df) của [grafi](https://sketchfab.com/zdenkoroman), giấy phép [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Đã sửa: ghép 4 dải vỏ thân thành 1 ô lặp 160 × 480 (`src/models/bark-scan.jpg`).

Các mẫu sau chỉ dùng để đo dáng, tỉ lệ hoặc học kiểu vẽ:

- Cò: `Stork.glb` trong bộ ví dụ three.js (MIT)
- Cá koi: "Koi Fish" của Xfdfgd (CC-BY-4.0)
- Chim sẻ: "Bird 5 - Animated Low Poly" của WildPoly3D (CC-BY-NC-4.0)
- Xuồng gỗ: "Boat" của DJMaesen (CC-BY-4.0)
- Hộp tổ chim: "Bird the nest Home Building" của adventurer (CC-BY-4.0)
- Ong: "Bee (Low Poly)" của EsiHere (CC-BY-4.0)
- Tổ ong giỏ rơm: "Hive" của Matt LeMoine (CC-BY-4.0)
- Đom đóm: "Metal FireFly Final" của PJ (CC-BY-4.0)
- Gấu mèo: "Low-poly Racoon Run Animation" của avatrass (CC-BY-4.0)
- Bóng đèn sợi đốt: "Incandescent Light Bulb" của AleixoAlonso (CC-BY-4.0)
- Lò chiminea (chiều cao): "Rustic chimenea" của archiesmitham (CC-BY-NC-SA-4.0)
- Cành cây rừng: "Low Poly Tree Scene Free" của Nicholas-3D (CC-BY-4.0)
- Laptop: "MacBook Pro 2021" của KangaroOz 3D (CC-BY-NC)
- Ghế văn phòng, bảng ghim: "60's Office Props" của SeanNicolas (CC-BY-NC-4.0)
- Drone (bản dựng bằng code trước 17/10): "Drone" của Kira (CC-BY-4.0)
- Chất liệu công trình và cột điện: "Inakaya" của Jellepostma (CC-BY-4.0); chất liệu công trình còn học "Forest House" của peachyroyalty (CC-BY-NC-4.0)

Bướm vẽ theo hình thái và hoa văn của 5 loài thật ở Tây Nguyên.
