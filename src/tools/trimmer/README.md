# Dựng lại `src/models/trimmer.glb`

Mẫu: ["Grass Trimmer Machine"](https://sketchfab.com/3d-models/grass-trimmer-machine-0f57fcf619a94150afc5202689fc0309), Xorshift, CC-BY-4.0; máy cắt cỏ đeo lưng: 42 lưới, 15,8k tam giác, 7 màu phẳng, không texture, 741 KB; không trong repo.

1. `devserver.py` + `study.html` của `../transit/`, mẫu trong thư mục riêng; mở `http://localhost:8777/study.html?f=dl-trimmer/grass_trimmer_machine.glb`, console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/trimbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await trimBuild({ ratio: 0.3, err: 0.02 });   // tách 4 bộ phận, hàn đỉnh, bỏ tam giác 2 lớp, giảm lưới, pháp tuyến gãy 34° → ~4,8k tam giác
await trimWrite('trimmer.glb');               // → shots/trimmer.glb (~68 KB)
```

2. `shots/trimmer.glb` → `src/models/`.

- 4 nút: `pack` (ba lô máy, con `starter`), `shaft` (cần, con `blade`); mét (×0,24 / đv mẫu); màu đỉnh; điểm cầm nắm trong `extras` nút, đọc ở `src/app/camp/trimmer.js`.
- Bỏ ống mềm truyền động + vòng dây ga sau đầu ống; trang vẽ lại ống mềm mỗi khung theo vị trí cần.
