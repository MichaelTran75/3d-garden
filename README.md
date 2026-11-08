# GHC · Thủy điện Gia Lai — vườn năng lượng tái tạo 3D

Cảnh three.js (WebGL): thủy điện, cánh đồng pin mặt trời, tua-bin gió, trạm khí tượng với thời tiết Open-Meteo thật, mặt trời theo mùa ở Pleiku.
Kỹ sư sinh hoạt theo lịch cả ngày (bấm drone hoặc tay cầm trên bàn trà rồi chọn "▶ Chơi" để gọi kỹ sư ra bay; bấm giỏ hoặc sào cạnh cây táo rồi chọn "Hái táo"); đàn bò, chó, cò, chim sẻ, ong, bướm sống quanh trại.

Trang: https://michaeltran75.github.io/3d-garden/ (nhúng Wix bằng iframe).

## Sửa ở đâu

Chỉ sửa trong `src/`. Đọc `src/ARCHITECTURE.md` trước — chỉ mục ngắn (khung hình, vật lý, bẫy, bản đồ khu → tài liệu); rồi chỉ mở đúng tệp khu cần trong `docs/architecture/`.
Mỗi tác tử (kỹ sư, từng loài thú) và mỗi vật (xe, trại, đồ câu, luống) là một đơn vị độc lập: đơn vị khác chỉ đọc mặt công khai của nó qua `worldSee` (`src/app/core/world.js`, docs/architecture/engine.md); `build.py --check` dừng nếu có chỗ dính mới.

| Thư mục / tệp | Nội dung |
|---|---|
| `src/page.html`, `src/css/` | khung trang, giao diện |
| `src/js/` | thời tiết Open-Meteo, dẫn đường bay cho ong và bướm |
| `src/app/manifest.txt` | thứ tự ghép các mảnh mã cảnh (mỗi dòng một tệp, kèm mô tả) |
| `src/app/core/` | khởi động, bầu trời, mặt trời và mặt trăng, trời đêm, va chạm, gộp lượt vẽ, chất liệu bề mặt, tiện ích dùng chung (`helpers.js`), mặt đứng `cowY` (`ground.js`), dẫn đường flow field (`flow-field.js`) |
| `src/app/world/` | thủy điện, tua-bin, pin mặt trời, nhà, đường, trạm biến áp, đèn đường, xuồng |
| `src/app/nature/` | gió, cây, cỏ hoa, mưa, mặt nước, khói, đầm sen |
| `src/app/animals/` | bò, hươu, chó, gấu mèo, cò, chim sẻ (16 con: trại, 2 cặp làm tổ, đàn 5, bầy 6 trống / mái quanh trại — `sparrow-gang.js`), cá koi, ong, bướm |
| `src/app/engineer/` | kỹ sư: `body/` (dáng, bước, ghế, mặt) · `mind/` (giờ giấc `hours.js`, lịch, nhu cầu, bảng việc, điều phối) · `tasks/` (mỗi tệp một việc) — bản đồ: `engineer/README.md` |
| `src/app/van/` | xe van: `body/` (vỏ, cửa, khung gầm) · `interior/` (nội thất, bếp, radio) · `engine/` (động cơ chạy, hình nổi Ford 3.5L EcoBoost dựng bằng code) — bản đồ: `van/README.md` |
| `src/app/camp/` | đồ cắm trại |
| `src/app/props/` | xưởng dựng đồ vật (hàm thuần): bát, chảo, lon nước, mũ LEGO, cần câu, xô — mỗi đơn vị dựng bản riêng của mình |
| `src/app/ui/`, `src/app/loop/` | điều khiển camera, nhãn, vòng lặp khung hình |
| `src/models/` | mẫu dùng nguyên (drone + tay cầm DJI Mini 3, xe Ford Transit, động cơ trong khoang máy, khung gầm GAZ-69, gấu mèo, ảnh vân vỏ cây cắt từ bản quét), trang tải sau khi cảnh chạy |
| `src/tools/` | công cụ dựng lại mẫu dùng nguyên (`transit/` → `transit.bin` · `engine/` → `engine.glb` · `chassis/` → `chassis.glb`) · `engineer-audit/`: kiểm tra hành vi kỹ sư cả ngày, liệt kê lỗi theo giờ · `boundaries/`: kiểm ranh giới đơn vị (`check.py`, `baseline.json`) |

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
- `build.py --check` báo lỗi khi vượt ngân sách gzip: `js/app.js` ≤ 2048 KB, cả trang ≤ 2075 KB; thư mục `models/` ≤ 3,9 MB (chưa nén, không tính vào ngân sách gzip).
- Trên máy, `build.py` còn dựng bản một tệp `../3D garden.html` cho bộ test `../tests/` (mốc: 19 đạt, 0 lỗi).

## Nhúng vào Wix

*Thêm → Nhúng mã → Nhúng trang web* rồi dán đường dẫn trên, hoặc *Nhúng HTML*:

```html
<iframe src="https://michaeltran75.github.io/3d-garden/" style="width:100%;height:100%;border:0" allow="fullscreen" loading="lazy" title="GHC · Vườn năng lượng 3D"></iframe>
```

## Mô hình

Phần lớn vật thể dựng bằng code three.js. Các mẫu sau dùng nguyên (tệp ở `src/models/`, cách dựng lại ở `src/tools/<tên>/README.md`):

- Drone và tay cầm: ["DJI Mini 3 Drone with Remote Controller"](https://sketchfab.com/3d-models/dji-mini-3-drone-with-remote-controller-24ce5dcfced44e3d9da46167da720603) của [Marco Workspace](https://sketchfab.com/MarcoWorkspace), giấy phép [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Đã sửa: tách thân, cánh quạt, tay cầm, cần điều khiển thành phần riêng; giảm lưới; nén (`src/models/dji-mini3.glb`).
- Xe nhà (vỏ ngoài, cabin, bánh): ["Ford Transit L2H2"](https://sketchfab.com/3d-models/ford-transit-l2h2-7ba3c31431f34104902c5efcc112d4af) của [geyges](https://sketchfab.com/geyges), giấy phép [Sketchfab Standard](https://sketchfab.com/licenses). Đã sửa: bỏ khoang hàng và băng ghế đôi; lật ra tay lái nghịch (logo, chữ lật lại cho đọc đúng); kéo dài thành L3 (+0,45 m giữa ô cửa lùa); nâng mui 6 cm; khoét cửa sổ nhà xe; cửa lùa đặt ở thế mở; cửa trước, ca-pô tách ra để bấm mở (cửa phụ dùng ảnh gương cửa lái); giảm lưới; nén; tô màu trong code (`src/models/transit.bin`). Theo giấy phép này mẫu chỉ được dùng trong trang, không được tách ra, đăng lại hay phát tán; `transit.bin` không phải tệp mẫu mở được.
- Động cơ trong khoang máy xe: ["Nelson Racing Engine B"](https://sketchfab.com/3d-models/nelson-racing-engine-b-d6049e7c74544f13b3247f7c597837fc) của [Rudy](https://sketchfab.com/Rudy27), giấy phép [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Đã sửa: gộp 20 khúc lưới, giảm 1,9 triệu → 36 nghìn tam giác (giữ màu đỉnh), đặt gốc ở đáy cacte, nén; trong cảnh thu 82% và đặt dọc trong khoang máy (`src/models/engine.glb`).
- Vân vỏ cây anh đào: ảnh vân cắt từ ["Tree 3D Scan - Retopo"](https://sketchfab.com/3d-models/tree-3d-scan-retopo-9e6778e11ad2413dab940e23bb0b89df) của [grafi](https://sketchfab.com/zdenkoroman), giấy phép [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/). Đã sửa: ghép 4 dải vỏ thân thành 1 ô lặp 160 × 480 (`src/models/bark-scan.jpg`).
- Khung gầm xe: ["GAZ-69 Vehicle Chassis / Frame"](https://sketchfab.com/3d-models/gaz-69-vehicle-chassis-frame-e67d8918300f4aaeaa783a6e3b7053be) của Peter Gatchev, CC-BY-4.0 (`chassis.glb`).
- Gà: ["Chicken - rigged"](https://sketchfab.com/3d-models/chicken-rigged-6e3b93c078114c52bfe4cfa08b9843eb) của Maf'j Alvarez, CC-BY-4.0 (`chicken.glb`).
- Gấu mèo: "Low-poly Racoon Run Animation" của avatrass, CC-BY-4.0 (`raccoon.glb`).
- Sách, tạp chí trên kệ xe: ["Books and magazines"](https://sketchfab.com/3d-models/books-and-magazines-d0b76eada5bd495abcdfb2b20e6f7ee6) của Naira, CC-BY-4.0 (`books.glb`).
- Dương xỉ vách bờ: ["Realistic HD Common polypody fern (25/55)"](https://sketchfab.com/3d-models/realistic-hd-common-polypody-fern-2555-899bc51fa8b6440c87f7e74e60c16ef7) của PlantCatalog, CC-BY-4.0 (`fern.glb`).
- Tổ máy thủy điện: ["Hydrogenerator | Old work"](https://sketchfab.com/3d-models/hydrogenerator-old-work-630a3b2be6904bb1a5ec813a2c0a848f) của TadenStar, CC-BY-4.0 (`turbine.glb`).
- Máy bơm: ["P-0301 B"](https://sketchfab.com/3d-models/p-0301-b-8fc4bc4bc44e423b98add2acde561995) của athar_faz, CC-BY-4.0 (`pump.glb`).
- Máy cắt cỏ: ["Grass Trimmer Machine"](https://sketchfab.com/3d-models/grass-trimmer-machine-0f57fcf619a94150afc5202689fc0309) của Xorshift, CC-BY-4.0 (`trimmer.glb`).
- Nấm: ["Big mushroom - #AgisoftNatureChallenge"](https://sketchfab.com/3d-models/big-mushroom-agisoftnaturechallenge-95bbb65f57d34a55affdc22b7824e432) của Zacxophone và ["Low Poly Mushroom Pack"](https://sketchfab.com/3d-models/low-poly-mushroom-pack-d9a02f54d9854c4bbf95986c189e23c2) của EarlyMorrow3D, giấy phép Sketchfab Standard (`fungi.bin`, không phải tệp mẫu mở được, như `transit.bin`).
- Kính thiên văn: ["Telescope"](https://sketchfab.com/3d-models/telescope-fd6863dd22874707b99b00af620fdfcc) của sieminskaola, CC-BY-4.0 (`telescope.glb`).
- Thiên hà mini: ["Need some space?"](https://sketchfab.com/3d-models/need-some-space-d6521362b37b48e3a82bce4911409303) của Loïc Norgeot, CC-BY-4.0 (`galaxy.glb`).
- Ảnh mặt trăng, Ngân Hà, hố đen, sao Mộc: ["Moon"](https://sketchfab.com/3d-models/moon-4db2273f6dd943b8ad7fa5e3b1b2431a) của Akshat, ["Milky Way Skybox HDRI panorama"](https://sketchfab.com/3d-models/milky-way-skybox-hdri-panorama-b57711d6a450410ca612c4a36f08ce21) của Aliaksandr.melas, ["Blackhole"](https://sketchfab.com/3d-models/blackhole-74cbeaeae2174a218fe9455d77902b5c) của rubykamen, ["jupiter"](https://sketchfab.com/3d-models/jupiter-c5275eb96af245e4a8453837ac728a62) của Mieke Roth, đều CC-BY-4.0 (`moon.jpg`, `milkyway.jpg`, `blackhole.jpg`, `jupiter.jpg`).
- Nét chòm sao: dữ liệu [d3-celestial](https://github.com/ofrohn/d3-celestial) của Olaf Frohn, BSD-3-Clause (`src/tools/constellations/`).

Các mẫu sau chỉ dùng để đo dáng, tỉ lệ hoặc học kiểu vẽ:

- Thân sợi bện của cây cổ thụ (mặt cắt, độ xoắn, rãnh, bạnh gốc): "Pohutukawa tree closeup" của b_nealie (CC-BY-4.0)
- Cò: `Stork.glb` trong bộ ví dụ three.js (MIT)
- Cá koi: "Koi Fish" của Xfdfgd (CC-BY-4.0)
- Chim sẻ: "Bird 5 - Animated Low Poly" của WildPoly3D (CC-BY-NC-4.0)
- Xuồng gỗ: "Boat" của DJMaesen (CC-BY-4.0)
- Hộp tổ chim: "Bird the nest Home Building" của adventurer (CC-BY-4.0)
- Ong: "Bee (Low Poly)" của EsiHere (CC-BY-4.0)
- Tổ ong giỏ rơm: "Hive" của Matt LeMoine (CC-BY-4.0)
- Đom đóm: "Metal FireFly Final" của PJ (CC-BY-4.0)
- Chim sẻ bay: "Flying Bird" của sandeep.s (CC-BY-4.0)
- Thân cây rừng: "Tree Scan Free" của Epic_Tree_Store (CC-BY-4.0)
- Bồn cầu, kệ treo ấm trà trong xe: "TinyLivingPack" của Irene (đo kích thước; `tinyliving.glb` dựng lại bằng khối, `src/tools/tinyliving/`)
- Bóng đèn sợi đốt: "Incandescent Light Bulb" của AleixoAlonso (CC-BY-4.0)
- Lò chiminea (chiều cao): "Rustic chimenea" của archiesmitham (CC-BY-NC-SA-4.0)
- Cành cây rừng: "Low Poly Tree Scene Free" của Nicholas-3D (CC-BY-4.0)
- Laptop: "MacBook Pro 2021" của KangaroOz 3D (CC-BY-NC)
- Ghế văn phòng, bảng ghim: "60's Office Props" của SeanNicolas (CC-BY-NC-4.0)
- Drone dựng bằng code: "Drone" của Kira (CC-BY-4.0)
- Chất liệu công trình và cột điện: "Inakaya" của Jellepostma (CC-BY-4.0); chất liệu công trình còn học "Forest House" của peachyroyalty (CC-BY-NC-4.0)

Bướm vẽ theo hình thái và hoa văn của 5 loài thật ở Tây Nguyên.
