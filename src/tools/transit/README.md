# Dựng lại `src/models/transit.bin`

Mẫu gốc: ["Ford Transit L2H2"](https://sketchfab.com/3d-models/ford-transit-l2h2-7ba3c31431f34104902c5efcc112d4af) của geyges, giấy phép Sketchfab Standard. Tệp gốc (9,7 MB) không nằm trong repo; tải từ Sketchfab về máy.

1. Làm một thư mục làm việc, chép vào đó `study.html`, `devserver.py`, 3 tệp `van*.js`; đặt mẫu gốc ở `transit-glb/ford_transit_l2h2.glb`.
2. `python3 devserver.py 8777 <thư mục làm việc>` rồi mở `http://localhost:8777/study.html?f=transit-glb/ford_transit_l2h2.glb`.
3. Trong console của trang:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
for (const f of ['vanbuild.js', 'vanwrite.js', 'vanpreview.js']) { const s = document.createElement('script'); s.src = '/' + f; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await vanBuild();               // cắt, lật, kéo dài L3, khoét cửa sổ, cửa lùa mở → window.__van
await vanWrite('transit.bin');  // giảm lưới, nén, XOR → <thư mục làm việc>/shots/transit.bin
await vanPreview();             // (tuỳ chọn) xem bản mới cạnh mẫu gốc; vanShots2(tên, góc nhìn) chụp lưới ảnh
```

4. Chép `shots/transit.bin` vào `src/models/`, chạy `python3 build.py --check`.

Các tham số chính nằm đầu `vanbuild.js` (nhát cắt L3, bộ phận bỏ, cửa sổ nhà xe, độ mở cửa lùa) và `vanwrite.js` (sai số giảm lưới theo lớp vật liệu).
`transit.bin` là GLB đã XOR theo dòng xorshift32 (cùng dòng với `transitGlb` trong `src/app/van/transit.js`): giấy phép Standard cho dùng mẫu trong trang nhưng không cho tách ra, đăng lại hay phát tán.
