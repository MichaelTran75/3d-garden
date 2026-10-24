# Dựng lại `src/models/chassis.glb`

Mẫu gốc: ["GAZ-69 Vehicle Chassis / Frame"](https://sketchfab.com/3d-models/gaz-69-vehicle-chassis-frame-e67d8918300f4aaeaa783a6e3b7053be) của Peter Gatchev, giấy phép CC-BY-4.0.

- 53 lưới, khoảng 526k tam giác, 33 MB.
- 3 vật liệu, dùng 9 ảnh vân PNG có vết gỉ sét.
- Tệp gốc không nằm trong repo.

Lý do chọn mẫu: xe nhà di động kiểu overland hay được độ 4×4 với cầu liền và nhíp lá, giống bộ độ Quigley cho Ford van. Vì vậy lắp nguyên bộ gầm GAZ-69: khung thang, 2 cầu, 4 nhíp, hộp số phụ, các-đăng.

## Giữ, bỏ, sửa

**Giữ:**
- khung `SK_Chassis_Frame`
- cầu trước, cầu sau
- 4 nhíp lá
- 2 cặp giảm xóc
- hộp số phụ `TranspherBox`
- các-đăng và khớp chữ thập
- moay-ơ có tang trống
- cụm lái

**Bỏ:** lốp, vành (xe Transit đã có bánh), cản trước kèm biển số (`Fender`), 2 cần số (sẽ thò lên cabin).

**Sửa cho vừa Transit L3H2.** Đơn vị của xe: 1,1 đơn vị (đv) = 1 m. Mũi xe hướng −X, cửa lùa ở +Z. Cầu trước ở x −2,12, cầu sau ở x 2,03, tâm bánh y 0,44, bánh xe ở z ±0,955 (xem `TR` trong `van/transit.js`).

- **Dài:** chèn 1,262 m ở mặt cắt Z −0,68 của mẫu, chỗ chỉ có 2 thanh dọc đi qua. Nhờ vậy chiều dài cơ sở 2,51 m thành 3,77 m.
  - Vật cứng (cầu, nhíp, khớp chữ thập, giảm xóc, moay-ơ) dời nguyên khối theo vị trí tâm của nó.
  - Khung giãn theo từng đỉnh.
  - Ống các-đăng sau `Cardans008` có mặt cắt riêng ở −1,0, để đầu trước bám khớp còn đầu sau theo cầu. Khớp `Cardans007` giữ nguyên chỗ.
  - Đoạn đuôi sau cầu sau co lại còn 0,9.
  - **Bẫy:** cắt ở Z −0,875 thì xuyên qua tấm ốp của thanh ngang (Z −0,95 tới −0,79), tạo ra một tấm phẳng dài 1,4 m giữa khung.
- **Ngang:** nhân 1,1 rồi lật trái sang phải. Xe ở đây tay lái nghịch, nên hộp lái nằm bên phải (−Z). Hai thanh dọc, nhíp và giảm xóc trước nở thêm ±0,12 m, chuyển dần từ Z 0,75 tới 0,95, để chừa chỗ cho động cơ V6 rộng ±0,44.
- **Cao:**
  - Tâm cầu (Y 0,4285 của mẫu) đặt vào y 0,44.
  - Khung và hộp số phụ hạ 9 cm. Nóc khung còn 0,817, thấp hơn sàn trong xe (0,83).
  - Nhíp, giảm xóc và các-đăng bẹt dần theo độ cao: đầu bám cầu giữ nguyên, đầu bám khung hạ theo khung.
- **Màu:** lấy màu đỉnh từ ảnh vân màu (thu ảnh còn 128², gộp thành 16 bậc sRGB, đổi sang tuyến tính, nhân 1,5).
- **Pháp tuyến:** không lưu. Trang tô phẳng (flatShading), nhờ đó tệp nhẹ đi khoảng 70%.

## Chạy

1. Đặt mẫu gốc ở `gaz-glb/gaz69.glb` trong thư mục phục vụ. Dùng server có `/upload`: `devserver.py` của `../transit/`.
2. Mở `gazview.html` (thư mục này), rồi chạy trong console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/chassisbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await chassisBuild({ levels: 16 });   // ~12k tam giác
await chassisWrite('chassis.glb');    // → shots/chassis.glb (~62 KB)
```

3. Chép `shots/chassis.glb` vào `src/models/`.

## Dùng trong cảnh

`src/app/van/chassis.js` gắn thẳng nút `chassis` vào `caravanObj`, vì toạ độ đã là đơn vị của xe.

- Vật liệu Lambert, màu đỉnh, tô phẳng. Vẫn hiện khi xem xuyên (`xray = 'keep'`).
- Ẩn cầu tạm `Cầu bánh xe` trong `van/caravan.js`.
- Hộp số dựng bằng code: chuông ly hợp, thân và đuôi hộp số, nối từ đuôi động cơ (x −2,31, y 0,71) tới khớp các-đăng đầu vào hộp số phụ (x −1,17, y 0,54, z 0,15).
- `extras` của nút `chassis` có `axleF`, `axleR`, `wheelY`, `dz`, `drop`, `spread`. Nếu cầu lệch khỏi `TR.xF` hoặc `TR.xR`, trang cảnh báo trong console.
