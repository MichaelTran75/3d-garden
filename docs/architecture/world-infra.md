# Hạ tầng

<!-- toc -->
- Điện · 0.4 KB
- Nước · 1.1 KB
- Đập, tổ máy · 0.9 KB
- Đường · 0.2 KB
- Cống · 0.8 KB
- Mẫu GLB · 0.2 KB
<!-- /toc -->

## Điện
- `world/substation-bess.js`: trạm biến áp, cột `poleAt` (`opts.tx` = biến áp treo cột), `wire()` → `links`, `gridDefs`, `buildingTies`.
- Cột: 2 pha đầu xà, pha giữa sứ đỉnh; không cắm trong nền nhà (xuyên mái).
- `poleGuys()` sau khi nối hết dây (giữ `conn`): tổng hướng dây ≥ 0,7 ⇒ néo cách 3,2 m, né nước/đường/dốc.

## Nước
- `world/water-pump.js` (sau `world/rowboat.js`): trạm bơm `waterPump`, ống DN75 lên tháp, `level()`, `ditch`; mẫu `src/tools/pump/`.
- Bơm 8:00–16:30, `sunElevSin` > 0,02, bồn < 95%; `level()` theo mùa (đỉnh ngày 258) + nhịp ngày.
- Ống: bơm → ngầm ngay ngoài bệ → trồi ngoài ban công đông tháp → mái nón → bồn.
- Ô cách tuyến ngầm < 0,42 m → 'Đất trong suốt trên ống ngầm' + 'Rãnh ống ngầm (tường + đáy)'.
- Đổi bậc ô: ống đứng trong ô cao, cách ranh 0,3.
- `ditchBuild` chạy khung đầu (`nature/meadow.js` sau); cần cả tường + đáy (thiếu ⇒ hổng); mặt mờ → `terrainMeshes`, vật liệu → `wetMats`.
- `core/collide.js` voxel hoá cả ống nổi: cao > ngưỡng bước `lo` (bò 0,3·S, hươu 0,35) ⇒ rào mà bản đồ đường bò không biết ⇒ kẹt.
- Tháp `waterSilo()` (`world/solar-buildings-road.js`): trong suốt 50%, `userData.level(L)`; vỏ, nước, kim `noBake`.
- Tháp: giữ lượt BackSide (1) → nước (2) → FrontSide (3); mái 2 mặt ⇒ nhìn trên ≈ 75% đục.

## Đập, tổ máy
- `world/hydro-dam.js`: vỏ nhà máy `damPH` (nhóm `ph`) mờ 25%, không ghi độ sâu, không bóng, không gộp/bake.
- Van cung đập: `aT` trừ 2π, không thì quay 320°.
- `world/hydro-turbine.js` (sau `nature/moss-lawn.js`): `hydroTurbine` tổ máy Francis; `click`, `inPH`, `setRun`; mẫu `src/tools/turbine/`.
- Mặt cắt `clippingPlanes` quay theo camera; rotor không cắt.
- Mô phỏng kiểu HYGOV: mở cánh → kích từ → hoà lưới → nhận tải; nước thấp ⇒ dừng, chạy đà, phanh.
- `click()`: xa ⇒ `focus()`; đang xem gần ⇒ dừng/chạy lại.
- Quay hiển thị ≤ ¼ bước cực/khung (`SLOW`), quá ⇒ trông quay ngược.
- Ô đất trong nhà máy thu về 1 điểm, giữ vị trí (bảng tra theo ô vẫn đúng); cỏ mềm né qua `hydroTurbine.inPH`.
- Cửa ống hút chìm dưới mặt nước hạ lưu.

## Đường
- `campusRoad.userData.road` (`world/solar-buildings-road.js`): `stations`, `branch`; 2 tuyến: theo đường ⇒ lặp cả 2, không nối cuối tuyến này với đầu tuyến kia; nhánh nổi 3 mm ở miệng nối.

## Cống
- `world/storm-drain.js` (sau `world/water-pump.js`): `stormDrain` giếng thăm, hố thu, nhánh nhà, cửa xả; `tick`, `toggle`, `net`.
- Nắp lộ theo `KEEP`, chỉ chúng vào `COVERS` (cỏ chừa qua `drCover`); thân hố + ống luôn đủ (`STR`, `SEG`).
- Mưa: `F.q` bám `rainK` ⇒ van lật (con lắc, bước ≤ 8 ms), tia nước, `fluids.splash`.
- Bấm cửa xả ⇒ `toggle()`: đất quanh tuyến mờ, rãnh; mặt đường trong suốt theo `DRAIN_BAND`, thôi đổ bóng; cỏ trong dải ẩn (`uDrOn`); tắt ⇒ trả ma trận đã lưu.
- Nửa rộng dải `bandW` ≥ 1,25 × sâu đỉnh ống (hẹp ⇒ nhìn xiên bị đất che); chừa trạm biến áp, đập, nền nhà.
- Mặt đường: `clone()` mất `onBeforeCompile` ⇒ nối chuỗi + đổi `customProgramCacheKey`.

## Mẫu GLB
- `HT_GLB`, `FERN_GLB`: `file://` chặn fetch ⇒ ngoài localhost đọc bản Pages; mẫu chưa đăng chỉ có ở localhost.
- `MODELS_KB` (`build.py`) chặn tổng cỡ `models/`; thêm mẫu ⇒ nâng có chủ ý.
