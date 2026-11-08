# GHC · Thủy điện Gia Lai — vườn năng lượng tái tạo 3D

Cảnh three.js (WebGL): thủy điện, pin mặt trời, tua-bin gió, trạm khí tượng (Open-Meteo thật), mặt trời theo mùa ở Pleiku; kỹ sư sống theo lịch cả ngày, bò, chó, cò, chim sẻ, ong, bướm quanh trại.
Trang: https://michaeltran75.github.io/3d-garden/ · Mã: `src/` (kiến trúc: `src/ARCHITECTURE.md`); `index.html`, `css/`, `js/`, `models/` là tệp dựng, đừng sửa tay.

## Dựng, đăng
- Xem: `./preview.sh` · Dựng + kiểm: `python3 build.py --check` (ngân sách gzip `BUDGET_KB`, `MODELS_KB` đầu build.py) · Đăng: `./publish.sh "mô tả"`.
- Commit vào `src/` trên web GitHub ⇒ Actions tự dựng. Trên máy build.py dựng thêm `../3D garden.html` cho `../tests/` (mốc 19 đạt / 0 lỗi).
- Wix: Nhúng mã → Nhúng trang web (dán link trên) hoặc Nhúng HTML:

```html
<iframe src="https://michaeltran75.github.io/3d-garden/" style="width:100%;height:100%;border:0" allow="fullscreen" loading="lazy" title="GHC · Vườn năng lượng 3D"></iframe>
```

## Mô hình
Phần lớn dựng bằng code three.js. Mẫu dùng nguyên (`src/models/`, dựng lại: `src/tools/<tên>/README.md`):
- Drone + tay cầm: ["DJI Mini 3 Drone with Remote Controller"](https://sketchfab.com/3d-models/dji-mini-3-drone-with-remote-controller-24ce5dcfced44e3d9da46167da720603) — [Marco Workspace](https://sketchfab.com/MarcoWorkspace), [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/); đã sửa: tách thân / cánh / tay cầm / cần thành phần riêng, giảm lưới, nén (`dji-mini3.glb`).
- Xe nhà (vỏ, cabin, bánh): ["Ford Transit L2H2"](https://sketchfab.com/3d-models/ford-transit-l2h2-7ba3c31431f34104902c5efcc112d4af) — [geyges](https://sketchfab.com/geyges), [Sketchfab Standard](https://sketchfab.com/licenses); đã sửa: bỏ khoang hàng + ghế đôi, tay lái nghịch (logo, chữ lật lại), kéo dài L3 (+0,45 m), nâng mui 6 cm, khoét cửa sổ, cửa lùa mở, tách cửa trước + ca-pô, giảm lưới, nén, tô màu trong code (`transit.bin`). Theo giấy phép: chỉ dùng trong trang, không tách ra, đăng lại hay phát tán; `transit.bin` không phải tệp mẫu mở được.
- Động cơ: ["Nelson Racing Engine B"](https://sketchfab.com/3d-models/nelson-racing-engine-b-d6049e7c74544f13b3247f7c597837fc) — [Rudy](https://sketchfab.com/Rudy27), [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/); đã sửa: gộp 20 lưới, 1,9 triệu → 36 nghìn tam giác (giữ màu đỉnh), gốc ở đáy cacte, nén; trong cảnh thu 82 %, đặt dọc (`engine.glb`).
- Vân vỏ cây anh đào: cắt từ ["Tree 3D Scan - Retopo"](https://sketchfab.com/3d-models/tree-3d-scan-retopo-9e6778e11ad2413dab940e23bb0b89df) — [grafi](https://sketchfab.com/zdenkoroman), [CC-BY-4.0](http://creativecommons.org/licenses/by/4.0/); đã sửa: ghép 4 dải vỏ thành 1 ô lặp 160 × 480 (`bark-scan.jpg`).
- Khung gầm: ["GAZ-69 Vehicle Chassis / Frame"](https://sketchfab.com/3d-models/gaz-69-vehicle-chassis-frame-e67d8918300f4aaeaa783a6e3b7053be) — Peter Gatchev, CC-BY-4.0 (`chassis.glb`).
- Gà: ["Chicken - rigged"](https://sketchfab.com/3d-models/chicken-rigged-6e3b93c078114c52bfe4cfa08b9843eb) — Maf'j Alvarez, CC-BY-4.0 (`chicken.glb`).
- Gấu mèo: "Low-poly Racoon Run Animation" — avatrass, CC-BY-4.0 (`raccoon.glb`).
- Sách, tạp chí trên kệ xe: ["Books and magazines"](https://sketchfab.com/3d-models/books-and-magazines-d0b76eada5bd495abcdfb2b20e6f7ee6) — Naira, CC-BY-4.0 (`books.glb`).
- Dương xỉ vách bờ: ["Realistic HD Common polypody fern (25/55)"](https://sketchfab.com/3d-models/realistic-hd-common-polypody-fern-2555-899bc51fa8b6440c87f7e74e60c16ef7) — PlantCatalog, CC-BY-4.0 (`fern.glb`).
- Tổ máy thủy điện: ["Hydrogenerator | Old work"](https://sketchfab.com/3d-models/hydrogenerator-old-work-630a3b2be6904bb1a5ec813a2c0a848f) — TadenStar, CC-BY-4.0 (`turbine.glb`).
- Máy bơm: ["P-0301 B"](https://sketchfab.com/3d-models/p-0301-b-8fc4bc4bc44e423b98add2acde561995) — athar_faz, CC-BY-4.0 (`pump.glb`).
- Máy cắt cỏ: ["Grass Trimmer Machine"](https://sketchfab.com/3d-models/grass-trimmer-machine-0f57fcf619a94150afc5202689fc0309) — Xorshift, CC-BY-4.0 (`trimmer.glb`).
- Nấm: ["Big mushroom - #AgisoftNatureChallenge"](https://sketchfab.com/3d-models/big-mushroom-agisoftnaturechallenge-95bbb65f57d34a55affdc22b7824e432) — Zacxophone, ["Low Poly Mushroom Pack"](https://sketchfab.com/3d-models/low-poly-mushroom-pack-d9a02f54d9854c4bbf95986c189e23c2) — EarlyMorrow3D, Sketchfab Standard (`fungi.bin`, không phải tệp mẫu mở được).
- Kính thiên văn: ["Telescope"](https://sketchfab.com/3d-models/telescope-fd6863dd22874707b99b00af620fdfcc) — sieminskaola, CC-BY-4.0 (`telescope.glb`).
- Thiên hà mini: ["Need some space?"](https://sketchfab.com/3d-models/need-some-space-d6521362b37b48e3a82bce4911409303) — Loïc Norgeot, CC-BY-4.0 (`galaxy.glb`).
- Ảnh trăng, Ngân Hà, hố đen, sao Mộc: ["Moon"](https://sketchfab.com/3d-models/moon-4db2273f6dd943b8ad7fa5e3b1b2431a) — Akshat, ["Milky Way Skybox HDRI panorama"](https://sketchfab.com/3d-models/milky-way-skybox-hdri-panorama-b57711d6a450410ca612c4a36f08ce21) — Aliaksandr.melas, ["Blackhole"](https://sketchfab.com/3d-models/blackhole-74cbeaeae2174a218fe9455d77902b5c) — rubykamen, ["jupiter"](https://sketchfab.com/3d-models/jupiter-c5275eb96af245e4a8453837ac728a62) — Mieke Roth; CC-BY-4.0 (`moon.jpg`, `milkyway.jpg`, `blackhole.jpg`, `jupiter.jpg`).
- Nét chòm sao: [d3-celestial](https://github.com/ofrohn/d3-celestial) — Olaf Frohn, BSD-3-Clause (`src/tools/constellations/`).

Chỉ dùng để đo dáng, tỉ lệ, học kiểu vẽ:
- Cổ thụ (thân sợi bện): "Pohutukawa tree closeup" — b_nealie (CC-BY-4.0) · Thân cây rừng: "Tree Scan Free" — Epic_Tree_Store (CC-BY-4.0) · Cành cây rừng: "Low Poly Tree Scene Free" — Nicholas-3D (CC-BY-4.0)
- Cò: `Stork.glb`, ví dụ three.js (MIT) · Cá koi: "Koi Fish" — Xfdfgd (CC-BY-4.0) · Chim sẻ: "Bird 5 - Animated Low Poly" — WildPoly3D (CC-BY-NC-4.0); bay: "Flying Bird" — sandeep.s (CC-BY-4.0)
- Ong: "Bee (Low Poly)" — EsiHere (CC-BY-4.0) · Tổ ong giỏ rơm: "Hive" — Matt LeMoine (CC-BY-4.0) · Đom đóm: "Metal FireFly Final" — PJ (CC-BY-4.0) · Hộp tổ chim: "Bird the nest Home Building" — adventurer (CC-BY-4.0)
- Xuồng: "Boat" — DJMaesen (CC-BY-4.0) · Bóng đèn: "Incandescent Light Bulb" — AleixoAlonso (CC-BY-4.0) · Chiminea (chiều cao): "Rustic chimenea" — archiesmitham (CC-BY-NC-SA-4.0)
- Bồn cầu, kệ ấm trà trong xe: "TinyLivingPack" — Irene (đo kích thước; `tinyliving.glb` dựng lại bằng khối, `src/tools/tinyliving/`)
- Laptop: "MacBook Pro 2021" — KangaroOz 3D (CC-BY-NC) · Ghế văn phòng, bảng ghim: "60's Office Props" — SeanNicolas (CC-BY-NC-4.0) · Drone dựng bằng code: "Drone" — Kira (CC-BY-4.0)
- Chất liệu công trình, cột điện: "Inakaya" — Jellepostma (CC-BY-4.0), "Forest House" — peachyroyalty (CC-BY-NC-4.0)
- Bướm: hình thái, hoa văn 5 loài thật ở Tây Nguyên.
