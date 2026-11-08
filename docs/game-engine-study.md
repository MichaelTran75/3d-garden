# Học từ game engine

> Ghi cho AI sửa mã: việc còn đáng làm, xếp theo lợi ÷ công. Chỉ mục: [ARCHITECTURE](../src/ARCHITECTURE.md). Bộ đo: [perf-probe](perf-probe/README.md).

## Nghẽn ở đâu

- GPU tô màu: tam giác < 1 px của cây rừng × mọi đèn trong shader × bóng mềm vẽ lại mỗi khung. Hạ độ phân giải, bớt draw call chưa giúp (trừ trên điện thoại); AI + thú rẻ.

## Nên làm

1. **LOD cây rừng theo nấc zoom** — 12 biến thể `recTree` (`nature/forest.js`; InstancedMesh dựng ở `world/street-lamps.js`). Camera trực giao ⇒ đổi geometry cả 12 theo nấc zoom, có trễ như `loop/close-up.js`. `colCollect` nhận cây rừng là InstancedMesh > 1000 đỉnh: va chạm phải dựng từ bản cao.
2. **Bóng nắng vẽ thưa** — tắt `renderer.shadowMap.autoUpdate`; `needsUpdate` khi `fitSunShadow` đổi nấc / dời ô, mặt trời lệch quá ngưỡng, hoặc mỗi 2 khung khi có vật động. Gà, chim sẻ dùng bóng đĩa.
3. **Bể đèn cố định** — mọi đèn đang hiện (cả intensity 0) nằm trong shader mọi vật liệu chiếu sáng. Giữ 3–4 PointLight gán cho nguồn gần tâm nhìn, còn lại giả bằng emissive + quầng (đèn: grep `PointLight` / `SpotLight`). Đổi số đèn là biên dịch lại mọi shader ⇒ giữ số cố định.
4. **Nấm: raycast → bản đồ độ cao** — `ground()` (`nature/fungi.js`) raycast không BVH mỗi lần thử `spots()`: nặng nhất lúc mở trang. Chụp độ cao 1 lần từ trên (cùng gốc tia `C.y + 1.2`), giữ cờ đất trống (màu `0x3d3024`).
5. **Thả RAM** — `mossCrevice` (`nature/moss-lawn.js`) không ai gọi mà closure giữ lưới 180 × 50 × 180 (~21 MB). Mở rộng `core/mem-trim.js` cho lưới không cần raycast / va chạm / sửa đỉnh (vd. `nature/ferns.js`).
6. **Ảnh GLB → KTX2 ASTC** (`src/tools/glb-compress`) — nhẹ 4–8 lần trên GPU; `KTX2Loader` r160 nạp thẳng ASTC, chỉ cần `zstddec`; máy không có ASTC giữ ảnh hiện có.
7. **HUD `?prof`** — draw call lượt chính / bóng, tam giác, ms từng lượt `worldTick`, `renderer.info.memory`, heap (từ `perf-probe/prof-instr.js`).
8. **Bậc chất lượng** (sau 1–3, cạnh `adaptResolution`) — chọn 3 bậc từ 2–3 s đo khung (không đọc được GPU / RAM); núm: LOD rừng, nhịp bóng, số đèn, mật độ cỏ, số thú, nhịp AI thú xa.
9. **Lớp "chạm để vào"** (`loop/lifecycle.js`) — WebKit giữ rAF 30 fps ở iframe khác nguồn tới lần chạm đầu, âm thanh cũng chờ chạm; đo trên trang Wix thật trước.
10. **Ẩn đồ < 1 px ở zoom xa** (cả nội thất xe) — có lợi sau 1–3 hoặc trên điện thoại; dùng lại khung LOD có trễ của `loop/close-up.js`.
11. **`matrixAutoUpdate = false`** cho nhóm chắc chắn tĩnh (nhà, rào, đá): hàng nghìn vật đứng yên vẫn tính ma trận. Không áp tự động: dời bằng mã mà quên `updateMatrix()` là sai chỗ.
12. **Âm thanh nền theo mô phỏng** (cần 9) — gió (`uWMap`), mưa, sông; vòng lặp ngắn thay PCM dài; iOS cần `audioSession.type = 'playback'`.
13. **Vườn liên tục giữa lần ghé** — hạt giống + giờ thật + thời tiết + vài thay đổi, chạy bù khi mở; thay đổi cần giữ gửi Wix qua `postMessage` (WebKit xoá storage iframe bên thứ ba).
14. **Sống động** — đồ vật khai báo chỗ dùng + giữ chỗ (`worldPlace`, `core/world.js`); tín hiệu có bán kính, phai dần qua `worldTell` / `worldHear`.
15. **Sau khi nâng three.js** — tone mapping Neutral / AgX + LUT theo giờ; lưới probe SH (`LightProbeGridWebGL`) × màu trời.

## Không nên làm

- Đổi engine (xuất web Unity / Godot / Unreal): bỏ toàn bộ mã; bản web nặng, không hợp iframe Wix.
- `WebGPURenderer`: còn thử nghiệm, nhiều mesh thì CPU chậm hơn WebGL, phải viết lại `onBeforeCompile` / `ShaderMaterial` bằng TSL.
- Instancing thú, `BatchedMesh`: draw call chưa phải nút thắt; `core/draw-batch.js` đã gộp đồ tĩnh.
- `SharedArrayBuffer`, dời AI sang luồng phụ: cần cả chuỗi khung (gồm Wix) cross-origin isolated, AI rẻ; giữ cách chuyển ArrayBuffer như `nature/fluids.js`.
- TAA thay MSAA: TAA của `WebGLRenderer` không có vector chuyển động ⇒ cỏ lay bóng ma.
- Nâng three.js lẫn với việc khác: tách riêng, có ảnh so sánh.

## Bẫy

- Nâng three.js: đổi cùng lúc mọi URL `three@0.160.0`; `stencil` mặc định tắt mà `ui/hover-select.js` cần (đặt ở `core/boot.js`); `PCFSoftShadowMap` ngừng dùng; xem lại vá `<tonemapping_fragment>`, `inverseTransformDirection` (`core/sky-shade.js`), PMREM (`van/interior/env-map.js`).
- Đo: `renderer.info` (`__info()`) bị xoá sau lượt bóng nên thiếu draw call bóng; timer query GPU gần như không có ⇒ A/B tắt từng phần, theo cặp, camera đứng yên, trung vị.
