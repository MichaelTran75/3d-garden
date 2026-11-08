# Dựng lại `src/models/pump.glb`

Gốc: ["P-0301 B"](https://sketchfab.com/3d-models/p-0301-b-8fc4bc4bc44e423b98add2acde561995), athar_faz, CC-BY-4.0; ngoài repo. Mô tả lưới, màu đỉnh: đầu `pumpbuild.js`.

- `pump` = `MOTOR_B` + `PAKU_MOTOR` (bỏ mảnh lơ lửng ở khớp ống đo) + `motor2` + `TENGAH_PUTIH` + `TENGAH` + `TENGAH3` (bỏ cần cao 1,9 m); bỏ `motor1`.
- `valve` = `LUBEOIL VALVE_3`.
- Tên lưới sau GLTFLoader: dấu cách → `_`, bỏ dấu chấm (vd `Circle.011` → `Circle011`).

1. `study.html` + `devserver.py` của `../transit/`; mẫu trong thư mục riêng, vd `pipe-glb/pipe.glb`.
2. Mở `http://localhost:8777/study.html?f=pipe-glb/pipe.glb`, console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/pumpbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await pumpBuild({ scale: 0.36, ratio: 0.4, err: 0.01 });   // ~3,5k tam giác (bơm 2,9k · van 0,6k)
await pumpWrite('pump.glb');                               // → shots/pump.glb (~45 KB)
```

3. Chép `shots/pump.glb` vào `src/models/`. `study.html` không có bộ giải meshopt ⇒ xem tệp nén bằng trang có `setMeshoptDecoder`.

- `pump`: gốc = tâm đáy cụm, trục bơm dọc +Z, động cơ −Z, 2 họng ±X, mét × 0,36.
- `valve`: gốc = tâm hộp bao, ống dọc X, vô-lăng +Y, mét.
- Điểm neo `extras`: `pump.inX` / `outX` (tâm mặt bích họng +X / −X), `len`, `motorY0`, `motorZ`, `caseY0`, `top` · `valve.half`, `wheelY`, `bodyY`. Đọc ở `src/app/world/water-pump.js`; đổi mẫu ⇒ sửa hằng `A` ở đó (lệch ⇒ console cảnh báo).
