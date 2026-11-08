# Dựng lại `src/models/telescope.glb`, `galaxy.glb`, `moon.jpg`, `milkyway.jpg`, `blackhole.jpg`, `jupiter.jpg`

Mẫu gốc (không nằm trong repo, mỗi mẫu 1 thư mục riêng):

- ["Telescope"](https://sketchfab.com/3d-models/telescope-fd6863dd22874707b99b00af620fdfcc) của sieminskaola, CC-BY-4.0 — 2 lưới 9,6k tam giác: lưới ảnh màu (ánh sáng nướng sẵn, unlit) + vỏ viền đen phồng ra, ảnh 1024² 440 KB.
- ["Need some space?"](https://sketchfab.com/3d-models/need-some-space-d6521362b37b48e3a82bce4911409303) của Loïc Norgeot, CC-BY-4.0 — đám 50k điểm màu (POINTS).
- ["Moon"](https://sketchfab.com/3d-models/moon-4db2273f6dd943b8ad7fa5e3b1b2431a) của Akshat, CC-BY-4.0 — chỉ dùng ảnh bề mặt 1024 × 512 (bản đồ trụ đẳng chữ nhật).
- ["Milky Way Skybox HDRI panorama"](https://sketchfab.com/3d-models/milky-way-skybox-hdri-panorama-b57711d6a450410ca612c4a36f08ce21) của Aliaksandr.melas, CC-BY-4.0 — quả cầu 559 đỉnh + ảnh PNG 1024² (trụ đẳng chữ nhật bị ép vuông); chỉ dùng ảnh.
- ["Blackhole"](https://sketchfab.com/3d-models/blackhole-74cbeaeae2174a218fe9455d77902b5c) của rubykamen, CC-BY-4.0 — 8,4 MB: cầu lõi đen + ~12 lớp vỏ cầu chiếu ảnh đĩa (17 lưới, ~220k tam giác, hoạt cảnh xoay 10 s) + đĩa phẳng; chỉ dùng ảnh đĩa.
- ["jupiter"](https://sketchfab.com/3d-models/jupiter-c5275eb96af245e4a8453837ac728a62) của Mieke Roth, CC-BY-4.0 — quả cầu 2048 đỉnh + 3 ảnh 1024 × 512 (màu JPEG, 2 PNG phụ); chỉ dùng ảnh màu (mép trên ảnh là cực NAM).

1. Chạy `devserver.py` (gốc = thư mục chứa các mẫu + `skybuild.js`), mở 1 trang bất kỳ của server (vd `treeview.html`), trong console:

```js
{ const s = document.createElement('script'); s.src = '/skybuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await skyBuild({ tele: '/telescope-2-glb/telescope-2.glb', gal: '/galaxy-glb/galaxy.glb', ratio: 0.4, err: 0.004, n: 10000 });
await skyWrite();   // → shots/telescope.glb (~57 KB, 3,9k tam giác) + shots/galaxy.glb (~74 KB, 10k điểm)
```

2. Ảnh trăng: tách ảnh nhúng trong GLB, thu 512 × 256 xám, JPEG chất lượng 82 (~32 KB) → `moon.jpg`.
3. Ảnh Ngân Hà: tách ảnh PNG nhúng trong GLB, thu 1024 × 512 (Lanczos — trả lại tỉ lệ 2 : 1 của ảnh trụ), JPEG chất lượng 85, lũy tiến (~85 KB) → `milkyway.jpg`.
   14 đích dò trong `MW_T` (sky-watch.js): làm mờ Gauss 2,5 px ảnh độ sáng, lấy đỉnh cục bộ (cửa sổ 25 px, sáng ≥ 0,25) trong dải v 0,22–0,8, giữ đỉnh sáng nhất mỗi vùng cách nhau ≥ 70 px.
4. Ảnh hố đen: tách ảnh 0 (màu nền đĩa, RGBA PNG) + ảnh 1 (phát sáng, JPEG) trong GLB, thu 512², trộn `phát sáng × alpha + màu nền × alpha × 0,35`
   (vật liệu gốc: phát sáng + màu nền dưới ánh sáng môi trường; nhân sẵn alpha ⇒ nền đen = trong suốt khi cộng sáng), JPEG 82 lũy tiến (~22 KB) → `blackhole.jpg`.
   Ánh xạ trong shader: bán kính ảnh ρ 0,47 = mép ngoài đĩa 8,4 r_s, ρ 0,145 = mép trong 2,6 r_s (bán kính vỏ cầu trong mẫu).
5. Ảnh Jupiter: tách ảnh màu (ảnh 0) trong GLB, giữ 1024 × 512, JPEG 72 lũy tiến (~76 KB) → `jupiter.jpg`. Đích dò `JUP_T` (sky-watch.js) đọc tay trên ảnh: Vết Đỏ Lớn (0,625; 0,36) + vài vết bão.
6. Chép 6 tệp vào `src/models/`.

Điểm neo kính (mét, hệ mẫu) nằm trong `extras` của nút `telescope`: `base` (tâm chân trên đất), `back` (đuôi ống — chỗ thị kính), `front` (miệng kính vật), `axis`, `top`.
Đọc ở `src/app/engineer/tasks/sky-watch.js` (đặt kính cạnh đầu thảm, màn hình trên tay đỡ từ `back`). Thiên hà: tâm lõi ở gốc, mặt đĩa XZ, bán kính 90% điểm = 1;
vị trí int16 chuẩn hoá — phép giải lượng tử làm trong shader (`uQ`).
