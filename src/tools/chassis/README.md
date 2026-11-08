# Dựng lại `src/models/chassis.glb`

Mẫu: ["GAZ-69 Vehicle Chassis / Frame"](https://sketchfab.com/3d-models/gaz-69-vehicle-chassis-frame-e67d8918300f4aaeaa783a6e3b7053be), Peter Gatchev, CC-BY-4.0; 53 lưới, ~526k tam giác, 33 MB, 3 vật liệu, 9 ảnh vân PNG gỉ sét; không trong repo.

## Giữ / bỏ
- Giữ: khung `SK_Chassis_Frame`, cầu trước + sau, 4 nhíp lá, 2 cặp giảm xóc, hộp số phụ `TranspherBox`, các-đăng + khớp chữ thập, moay-ơ tang trống, cụm lái
- Bỏ: lốp, vành (Transit có bánh), cản trước + biển số (`Fender`), 2 cần số (thò lên cabin)

## Sửa cho Transit L3H2
- Đích (đv xe, `TR` trong `van/body/transit.js`): cầu trước x −2,12, cầu sau x 2,03, tâm bánh y 0,44, bánh z ±0,955
- Xe L4H2: GLB không đổi; lúc nạp `van/body/chassis.js` lùi đỉnh x > 2,8 thêm `TR.ext` 0,792 đv (chỉ 2 thanh dọc vắt qua)
- Dài: chèn 1,262 m ở mặt cắt Z −0,68 mẫu (chỉ 2 thanh dọc qua) ⇒ cơ sở 2,51 → 3,77 m
  - Vật cứng (cầu, nhíp, khớp chữ thập, giảm xóc, moay-ơ) dời nguyên khối theo tâm; khung giãn theo đỉnh
  - Ống các-đăng sau `Cardans008` cắt riêng ở −1,0: đầu trước bám khớp, đầu sau theo cầu; khớp `Cardans007` giữ chỗ
  - Đuôi sau cầu sau co còn 0,9
  - Bẫy: cắt ở Z −0,875 xuyên tấm ốp thanh ngang (Z −0,95…−0,79) ⇒ tấm phẳng 1,4 m giữa khung
- Ngang: ×1,1 rồi lật trái ↔ phải (tay lái nghịch ⇒ hộp lái bên phải −Z); 2 thanh dọc + nhíp, giảm xóc trước nở ±0,12 m, chuyển dần Z 0,75 → 0,95 (chừa V6 rộng ±0,44)
- Cao: tâm cầu (Y 0,4285 mẫu) → y 0,44; khung + hộp số phụ hạ 9 cm (nóc khung 0,817 < sàn trong 0,83); nhíp, giảm xóc, các-đăng bẹt dần: đầu bám cầu giữ, đầu bám khung hạ theo khung
- Màu đỉnh từ ảnh vân màu: thu 128², gộp 16 bậc sRGB, → tuyến tính, ×1,5
- Không lưu pháp tuyến: trang tô phẳng (flatShading) ⇒ tệp nhẹ ~70%

## Chạy
1. Mẫu ở `gaz-glb/gaz69.glb` trong thư mục phục vụ; server có `/upload`: `devserver.py` của `../transit/`.
2. Mở `gazview.html` (thư mục này), console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/chassisbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await chassisBuild({ levels: 16 });   // ~12k tam giác
await chassisWrite('chassis.glb');    // → shots/chassis.glb (~62 KB)
```

3. `shots/chassis.glb` → `src/models/`.

## Dùng trong cảnh
- `src/app/van/body/chassis.js` gắn thẳng nút `chassis` vào `caravanObj` (toạ độ = đv xe)
- Lambert, màu đỉnh, tô phẳng; xem xuyên vẫn hiện (`xray = 'keep'`)
- Ẩn cầu tạm `Cầu bánh xe` (`van/interior/caravan.js`)
- Hộp số code: chuông ly hợp + thân + đuôi, từ đuôi động cơ (x −2,31, y 0,71) tới khớp các-đăng đầu vào hộp số phụ (x −1,17, y 0,54, z 0,15)
- `extras` nút `chassis`: `axleF`, `axleR`, `wheelY`, `dz`, `drop`, `spread`; cầu lệch `TR.xF` / `TR.xR` ⇒ cảnh báo console
