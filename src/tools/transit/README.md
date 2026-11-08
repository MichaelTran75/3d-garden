# Dựng lại `src/models/transit.bin`

Mẫu: ["Ford Transit L2H2"](https://sketchfab.com/3d-models/ford-transit-l2h2-7ba3c31431f34104902c5efcc112d4af), geyges, Sketchfab Standard: dùng trong trang, cấm tách, đăng lại, phát tán ⇒ `transit.bin` = GLB XOR dòng xorshift32 (cùng dòng `transitGlb`, `src/app/van/body/transit-glb.js`). 9,7 MB, không trong repo.

1. Chép `study.html`, `devserver.py`, 3 tệp `van*.js` + mẫu vào thư mục làm việc; `python3 devserver.py 8777 <thư mục làm việc>`, mở `http://localhost:8777/study.html?f=transit-glb/ford_transit_l2h2.glb`, console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
for (const f of ['vanbuild.js', 'vanwrite.js', 'vanpreview.js']) { const s = document.createElement('script'); s.src = '/' + f; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await vanBuild();               // cắt, lật, kéo dài L3, khoét cửa sổ, cửa lùa mở → window.__van
await vanWrite('transit.bin');  // giảm lưới, nén, XOR → <thư mục làm việc>/shots/transit.bin
await vanPreview();             // (tuỳ chọn) xem bản mới cạnh mẫu gốc; vanShots2(tên, góc nhìn) chụp lưới ảnh
```

2. `shots/transit.bin` → `src/models/`; `python3 build.py --check`.

- Tham số đầu `vanbuild.js`: nhát cắt L3, bộ phận bỏ, cửa sổ nhà xe, độ mở cửa lùa, bộ phận cử động + bản lề · `vanwrite.js`: sai số giảm lưới theo lớp vật liệu, nút GLB.
- Bộ phận cử động (lưới riêng, toạ độ từ bản lề): cửa trước 13 + tay nắm `Object_37`, ca-pô + khe gió, logo Ford. Nút GLB `FrontDoorR/L`, `Hood` (`extras.pivot`); `HandleR/L`, `Logo` (`extras.btn` = tên nút nó mở). Trang: nhóm quay ở `transit-glb.js`, bấm mở `van-doors.js` (cùng thư mục).
