# Dựng lại `src/models/fungi.bin`

Hai mẫu gốc (không nằm trong repo, mỗi mẫu 1 thư mục riêng), cùng giấy phép **Sketchfab Standard** — dùng trong trang được nhưng không để người khác tải
nguyên mẫu ra ⇒ tệp là GLB đã XOR theo dòng xorshift32 (hạt 0x2545F491), như `transit.bin`:

- ["Big mushroom - #AgisoftNatureChallenge"](https://sketchfab.com/3d-models/big-mushroom-agisoftnaturechallenge-95bbb65f57d34a55affdc22b7824e432) của Zacxophone —
  nấm giá chụp quét 3D mọc trên mảnh vỏ cây: 5 lưới, 500k tam giác, ảnh 1024² 562 KB, 15,5 MB.
- ["Low Poly Mushroom Pack"](https://sketchfab.com/3d-models/low-poly-mushroom-pack-d9a02f54d9854c4bbf95986c189e23c2) của EarlyMorrow3D — 19 loại nấm xếp 3 hàng,
  2 lưới 17k tam giác, tô màu bằng 1 ảnh bảng màu nhỏ.

1. Đặt mẫu: `mush-big/big.glb`, `mush-pack/pack.glb` trong thư mục gốc của `devserver.py` (xem `../transit/`).
2. Mở `http://localhost:8777/study.html?f=mush-pack/pack.glb`, trong console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/fungibuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await fungiBuild({});           // bracket 2,6k tam giác (ngang 0,3 m) · fly 2,0k · cluster 1,3k
await fungiWrite('fungi.bin');  // → shots/fungi.bin (~83 KB)
```

3. Chép `shots/fungi.bin` vào `src/models/`.

Cách tách (chi tiết ở đầu `fungibuild.js`): nấm giá bỏ mảnh vỏ theo màu ảnh ở tâm UV từng tam giác (sáng ≥ 0,33, hoặc nâu vành mũ ≥ 0,2 ở dải trên),
giữ mảnh liền ≥ 2%, nới 1 vòng lấp mép, giảm lưới không khoá biên, màu đỉnh = trung bình 5 × 5 texel (sRGB → tuyến tính), mặt dưới tối kéo về màu kem.
2 nấm nhỏ tách theo mảnh liền + gom hộp bao chồng nhau, chọn theo vị trí trên bảng (hàng 2 cx −0,832: nấm đỏ chấm trắng; hàng 3 cx −0,373: cụm nấm nâu).
3 nút `bracket`, `fly`, `cluster`: gốc = tâm đáy, +Y lên, đơn vị mét; `extras.r` (bán kính ngang), `extras.h` (cao). Trang: `src/app/nature/fungi.js`.
