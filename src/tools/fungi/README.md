# Dựng lại `src/models/fungi.bin`

Giấy phép Sketchfab Standard: dùng trong trang, không cho tải nguyên mẫu ⇒ GLB XOR dòng xorshift32 (hạt 0x2545F491), như `transit.bin`. Mẫu gốc ngoài repo:

- `bracket` (nấm giá quét 3D, bỏ mảnh vỏ cây) ← ["Big mushroom - #AgisoftNatureChallenge"](https://sketchfab.com/3d-models/big-mushroom-agisoftnaturechallenge-95bbb65f57d34a55affdc22b7824e432), Zacxophone.
- `fly` (nấm đỏ chấm trắng), `cluster` (cụm nấm nâu) ← ["Low Poly Mushroom Pack"](https://sketchfab.com/3d-models/low-poly-mushroom-pack-d9a02f54d9854c4bbf95986c189e23c2), EarlyMorrow3D (19 loại, 3 hàng).

1. Đặt `mush-big/big.glb`, `mush-pack/pack.glb` trong thư mục gốc của `devserver.py` (`../transit/`).
2. Mở `http://localhost:8777/study.html?f=mush-pack/pack.glb`, console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/fungibuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await fungiBuild({});           // bracket 2,6k tam giác (ngang 0,3 m) · fly 2,0k · cluster 1,3k
await fungiWrite('fungi.bin');  // → shots/fungi.bin (~83 KB)
```

3. Chép `shots/fungi.bin` vào `src/models/`.

- Nút: gốc = tâm đáy, +Y lên, mét; `extras.r` (bán kính ngang), `extras.h` (cao). Trang: `src/app/nature/fungi.js`.
- Cách tách (ngưỡng màu, mảnh liền, chọn theo hàng): đầu `fungibuild.js`.
