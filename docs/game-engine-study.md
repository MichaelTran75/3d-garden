# Học từ game engine

Việc còn đáng làm, xếp theo lợi ÷ công. Bộ đo: perf-probe/README.md.

## Nghẽn

- GPU tô màu: tam giác < 1 px của rừng × mọi đèn trong shader × bóng mềm vẽ lại mỗi khung
- Hạ độ phân giải, bớt draw call chưa giúp (trừ điện thoại); AI + thú rẻ

## Nên làm

1. LOD rừng theo nấc zoom, có trễ như `loop/close-up.js`: 12 biến thể `recTree` (`nature/forest.js`, InstancedMesh ở `world/street-lamps.js`); `colCollect` nhận InstancedMesh > 1000 đỉnh ⇒ va chạm dựng từ bản cao
2. Bóng nắng thưa: tắt `renderer.shadowMap.autoUpdate`; `needsUpdate` khi `fitSunShadow` đổi nấc / dời ô, nắng lệch quá ngưỡng, mỗi 2 khung khi có vật động; gà, chim sẻ bóng đĩa
3. Bể đèn cố định 3–4 PointLight gán nguồn gần tâm nhìn, còn lại emissive + quầng (grep `PointLight` / `SpotLight`); mọi đèn hiện (cả intensity 0) vào shader mọi vật liệu, đổi số ⇒ biên dịch lại
4. Nấm: `ground()` (`nature/fungi.js`) raycast không BVH mỗi lần thử `spots()`, nặng nhất lúc mở trang ⇒ chụp độ cao 1 lần từ trên (gốc tia `C.y + 1.2`), giữ cờ đất trống (màu `0x3d3024`)
5. Thả RAM: `mossCrevice` (`nature/moss-lawn.js`) không ai gọi, closure giữ 180 × 50 × 180 (~21 MB); `core/mem-trim.js` thêm lưới không cần raycast / va chạm / sửa đỉnh (vd. `nature/ferns.js`)
6. GLB → KTX2 ASTC (`src/tools/glb-compress`): GPU nhẹ 4–8 lần; `KTX2Loader` r160 nạp thẳng, chỉ cần `zstddec`; không ASTC ⇒ giữ ảnh cũ
7. HUD `?prof`: draw call lượt chính / bóng, tam giác, ms từng lượt `worldTick`, `renderer.info.memory`, heap (`perf-probe/prof-instr.js`)
8. Bậc chất lượng (sau 1–3, cạnh `adaptResolution`): 3 bậc từ 2–3 s đo khung (không đọc được GPU / RAM); núm: LOD rừng, nhịp bóng, số đèn, mật độ cỏ, số thú, nhịp AI thú xa
9. Lớp "chạm để vào" (`loop/lifecycle.js`): WebKit giữ rAF 30 fps ở iframe khác nguồn tới lần chạm đầu, âm thanh cũng chờ chạm; đo trên trang Wix thật trước
10. Ẩn đồ < 1 px ở zoom xa (cả nội thất xe), lợi sau 1–3 / điện thoại; khung trễ như 1
11. `matrixAutoUpdate = false` cho nhóm chắc tĩnh (nhà, rào, đá); không áp tự động (dời bằng mã quên `updateMatrix()` ⇒ sai chỗ)
12. Âm thanh nền theo mô phỏng (cần 9): gió (`uWMap`), mưa, sông; vòng lặp ngắn thay PCM dài; iOS cần `audioSession.type = 'playback'`
13. Vườn liên tục giữa lần ghé: hạt giống + giờ thật + thời tiết + vài thay đổi, chạy bù khi mở; thay đổi gửi Wix qua `postMessage` (WebKit xoá storage iframe bên thứ ba)
14. Sống động: đồ vật khai báo chỗ dùng + giữ chỗ (`worldPlace`, `core/world.js`); tín hiệu có bán kính, phai dần (`worldTell` / `worldHear`)
15. Sau nâng three.js: tone mapping Neutral / AgX + LUT theo giờ; lưới probe SH (`LightProbeGridWebGL`) × màu trời

## Không nên

- Đổi engine (xuất web Unity / Godot / Unreal): bỏ hết mã; bản web nặng, không hợp iframe Wix
- `WebGPURenderer`: thử nghiệm; nhiều mesh ⇒ CPU chậm hơn WebGL; viết lại `onBeforeCompile` / `ShaderMaterial` bằng TSL
- Instancing thú, `BatchedMesh`: draw call chưa nghẽn; `core/draw-batch.js` đã gộp đồ tĩnh
- `SharedArrayBuffer`, AI sang luồng phụ: cần cả chuỗi khung (gồm Wix) cross-origin isolated; giữ chuyển ArrayBuffer như `nature/fluids.js`
- TAA thay MSAA: `WebGLRenderer` không có vector chuyển động ⇒ cỏ lay bóng ma
- Nâng three.js lẫn việc khác: tách riêng, có ảnh so sánh

## Bẫy

- Nâng three.js: đổi cùng lúc mọi URL `three@0.160.0`; `stencil` mặc định tắt mà `ui/hover-select.js` cần (đặt ở `core/boot.js`); `PCFSoftShadowMap` ngừng dùng; xem lại vá `<tonemapping_fragment>`, `inverseTransformDirection` (`core/sky-shade.js`), PMREM (`van/interior/env-map.js`)
- Đo: `renderer.info` (`__info()`) xoá sau lượt bóng ⇒ thiếu draw call bóng; timer query GPU gần như không có ⇒ A/B tắt từng phần, theo cặp, camera đứng yên, trung vị
