# Dựng lại `src/models/pump.glb`

Mẫu gốc: ["P-0301 B"](https://sketchfab.com/3d-models/p-0301-b-8fc4bc4bc44e423b98add2acde561995) của athar_faz, giấy phép CC-BY-4.0
(cụm bơm công nghiệp trên khung đế 17 × 14,6 m: 93 lưới, ~136k tam giác, mọi vật liệu xám 0,8, không texture, 6,8 MB). Tệp gốc không nằm trong repo.

Chỉ lấy 2 cụm:

- `pump`: bơm ly tâm vỏ tách đôi (`MOTOR_B`) + vòng bu-lông mặt ghép (`PAKU_MOTOR`, bỏ mảnh lơ lửng ở khớp ống đo) + gối đỡ đầu trục (`motor2`)
  + chụp khớp nối (`TENGAH_PUTIH`) + động cơ điện hình trụ (`TENGAH`) + hộp đầu trục (`TENGAH3`, bỏ cần đứng cao 1,9 m). Bỏ bó ống đo nhỏ (`motor1`).
- `valve`: van chặn nhỏ có vô-lăng (`LUBEOIL VALVE_3`).

Tên lưới sau khi GLTFLoader nạp: dấu cách → `_`, bỏ dấu chấm (vd `Circle.011` → `Circle011`).

1. Dùng `study.html` + `devserver.py` của `../transit/`; đặt mẫu gốc trong một thư mục riêng, vd `pipe-glb/pipe.glb`.
2. Mở `http://localhost:8777/study.html?f=pipe-glb/pipe.glb`, trong console:

```js
const mo = await import('https://esm.sh/meshoptimizer@0.21.0'); window.MS = mo.MeshoptSimplifier; window.MSE = mo.MeshoptEncoder; await MS.ready; await MSE.ready;
window.BGU = await import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js');
{ const s = document.createElement('script'); s.src = '/pumpbuild.js'; document.head.appendChild(s); await new Promise(r => s.onload = r); }
await pumpBuild({ scale: 0.36, ratio: 0.4, err: 0.01 });   // ~3,5k tam giác (bơm 2,9k · van 0,6k)
await pumpWrite('pump.glb');                               // → shots/pump.glb (~45 KB)
```

3. Chép `shots/pump.glb` vào `src/models/`. `study.html` không có bộ giải meshopt — xem thử tệp đã nén bằng trang có `setMeshoptDecoder`.

Kết quả: nút `pump` (gốc = tâm đáy cụm, trục bơm dọc +Z, động cơ phía −Z, 2 họng bơm hướng ±X, đơn vị mét × 0,36) và `valve` (gốc = tâm hộp bao,
ống dọc X, vô-lăng +Y, đơn vị mét). Màu đỉnh tự gán: vỏ + gối đỡ xanh dương, bu-lông thép sẫm, chụp khớp nối vàng an toàn, động cơ xám xanh, vô-lăng đỏ.
Điểm neo trong `extras`: `pump.inX` / `outX` (tâm mặt bích họng +X / −X), `len`, `motorY0`, `motorZ`, `caseY0`, `top` · `valve.half`, `wheelY`, `bodyY`
(đọc ở `src/app/world/water-pump.js`; đổi mẫu thì cập nhật hằng `A` ở đó — trang cảnh báo trong console nếu lệch).
