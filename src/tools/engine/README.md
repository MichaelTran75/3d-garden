# Dựng lại `src/models/engine.glb`

Mẫu: ["Nelson Racing Engine B"](https://sketchfab.com/3d-models/nelson-racing-engine-b-d6049e7c74544f13b3247f7c597837fc), Rudy, CC-BY-4.0; 73 MB, 1,9 triệu tam giác, màu đỉnh; không trong repo.

1. `devserver.py` + `study.html` của `../transit/`, mở `http://localhost:8777/study.html?f=engine-glb/nelson_racing_engine_b.glb`, console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready; MS.useExperimentalFeatures = true;
{ const s = document.createElement('script'); s.src = '/engbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await engBuild({ tris: 26000, err: 0.015, w: [0.05, 0.05, 0.05, 0.02, 0.02, 0.02] });   // gộp, hàn, giảm lưới giữ màu → ~36k tam giác
await engWrite('engine.glb');                                                              // → shots/engine.glb (~235 KB)
```

2. `shots/engine.glb` → `src/models/`. Đặt trong xe (vị trí, góc, tỉ lệ): `engine()` + `ENG_AT`, `src/app/van/body/transit-glb.js`.
