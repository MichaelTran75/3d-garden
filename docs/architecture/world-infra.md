# Hạ tầng: điện, nước, đập thủy điện, cống, đường

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 1.1 KB
- Điện, nước · 0.6 KB
- Đập, tổ máy · 0.4 KB
- Cống · 0.4 KB
- Chuồng bò, chó lùa bò · 0.5 KB
- Bẫy · 2.3 KB
<!-- /toc -->

## Mã

- `world/substation-bess.js` — trạm biến áp, cột `poleAt` (`opts.tx`: máy biến áp treo cột), `wire()` → `links`, néo `poleGuys()`, `gridDefs`, `buildingTies`.
- `world/water-pump.js` (sau `world/rowboat.js`) — `waterPump`: trạm bơm, ống DN75 lên tháp nước, `level()`, `ditch`. Mẫu: `src/tools/pump/`.
- `world/solar-buildings-road.js` `waterSilo()` — tháp nước 50% trong suốt, `userData.level(L)`.
- `world/hydro-dam.js` — nhà máy đập (`damPH`). `world/hydro-turbine.js` (sau `nature/moss-lawn.js`) — `hydroTurbine`: tổ máy Francis, mặt cắt, hạt nước, mô phỏng; `click`, `inPH`, `setRun`. Mẫu: `src/tools/turbine/`.
- `world/storm-drain.js` (sau `world/water-pump.js`) — `stormDrain`: giếng thăm, hố thu, nhánh nhà, cửa xả; `tick`, `toggle`, `net`.
- `nature/ferns.js` (sau `world/storm-drain.js`) — dương xỉ vách bờ, lá rời rải như cỏ. Mẫu: `src/tools/fern/`.
- `cowHut` (`animals/cows/herd-hut.js`), chó lùa bò (`animals/dog/brain.js`), quạt mui xe `roofVent` (`van/interior/caravan.js`), bấm vật `ui/hover-select.js`.

## Điện, nước

- Cột: 2 pha ở đầu xà, pha giữa trên sứ đỉnh cột. `poleGuys()`: cột lệch lực (tổng hướng dây ≥ 0,7) thêm néo cách 3,2 m, né nước / đường / dốc.
- Ống: bơm → chui ngầm ngay ngoài bệ → trồi lên ngoài ban công đông tháp → qua mái nón vào bồn.
- Bơm chạy 8:00–16:30 khi `sunElevSin` > 0,02, bồn < 95%; `level()` theo mùa (đỉnh ngày 258) + nhịp ngày.
- Ống ngầm: ô cách tuyến < 0,42 m thành 'Đất trong suốt trên ống ngầm' + 'Rãnh ống ngầm (tường + đáy)'.

## Đập, tổ máy

- Vỏ nhà máy (`damPH`, nhóm `ph`) mờ 25%: không ghi độ sâu, không đổ bóng, không gộp / bake.
- Mặt cắt `clippingPlanes` quay theo camera; rotor không cắt.
- Mô phỏng kiểu HYGOV: mở cánh → kích từ → hoà lưới → nhận tải; nước thấp ⇒ dừng, chạy đà, phanh.
- `click()`: xa thì `focus()`, đang xem gần thì dừng / chạy lại.

## Cống

- Nắp lộ theo `KEEP`, chỉ chúng vào `COVERS` (cỏ chừa qua `drCover`); thân hố + ống luôn đủ (`STR`, `SEG`).
- Mưa: `F.q` bám `rainK` ⇒ van lật (con lắc, bước ≤ 8 ms), tia nước, `fluids.splash`.
- Bấm cửa xả ⇒ `toggle()`: đất quanh tuyến mờ, rãnh, mặt đường trong suốt theo `DRAIN_BAND`, cỏ trong dải ẩn (`uDrOn`).

## Chuồng bò, chó lùa bò

- Mái chuồng `noBake` + `noBatch`; `roofToggle()` mờ 50% / đặc lại; vùng rê = tấm tôn `roofSheet`.
- Mưa + ban ngày + bò ngoài bãi (`herdOut`) ⇒ chó: alert → `herdPick` → outrun → `herdLift` → fetch → hold → `herdDone` → toDoor → toStep → shakeOff → vào xe; tạnh ⇒ `herdEnd` + herdHome.
- Bò tự đọc mặt chó (`cowHerdSense`): `cowWaitDog` giữ bò chờ, `cowLetGo` thả về; bước lái × `c.push`.

## Bẫy

- Cột không cắm trong nền nhà (xuyên mái). `poleGuys()` chạy sau khi nối hết dây; giữ `conn`.
- Quạt mui: đế theo mặt mui (`trRoofY`, khum `TR_DROP`, tâm = trung bình 5 điểm), không thì hở.
- `core/collide.js` voxel hoá cả ống nổi: cao hơn ngưỡng bước `lo` (bò 0,3·S, hươu 0,35) là hàng rào mà bản đồ đường của bò không biết ⇒ kẹt.
- Ống ngầm đổi bậc ô: ống đứng nằm trong ô CAO, cách ranh 0,3.
- `ditchBuild` chạy ở khung đầu (`nature/meadow.js` đứng sau); cần cả tường + đáy rãnh (ô phẳng không có thân ⇒ hổng); mặt mờ vào `terrainMeshes`, vật liệu vào `wetMats`.
- Tháp nước: giữ lượt BackSide (1) → nước (2) → FrontSide (3); mái 2 mặt thì nhìn từ trên ≈ 75% đục; vỏ, nước, kim `noBake`.
- `clone()` vật liệu mất `onBeforeCompile`: dựng mới (diềm mái chuồng `surfaceStyle`) hoặc nối chuỗi + đổi `customProgramCacheKey` (mặt đường của cống).
- Chó không ghi trường của bò; bò dùng chung `herdAvail` với chó ⇒ khung đầu mưa bò không về rồi quay lại.
- Chó giữ va chạm khi 'herd' và 'toDoor' còn xa cửa xe > 4 m; outrun không tiến ⇒ bảng DP; trần 120 s / nhóm, 480 s / lượt.
- Tổ máy quay hiển thị ≤ ¼ bước cực mỗi khung (`SLOW`), quá thì thấy quay ngược.
- Ô đất trong nhà máy thu về 1 điểm nhưng giữ vị trí (bảng tra theo ô vẫn đúng); cỏ mềm né qua `hydroTurbine.inPH`.
- Cửa ống hút phải chìm dưới mặt nước hạ lưu.
- Dải xem cống: nửa bề rộng ≥ 1,25 × độ sâu đỉnh ống (`bandW`), hẹp thì nhìn xiên bị đất che; chừa trạm biến áp, đập, nền nhà; tắt thì trả ma trận đã lưu; mặt đường thôi đổ bóng.
- Dương xỉ: `colorMask` không ghi alpha canvas (mép alpha-to-coverage làm thủng nền trang).
- URL mẫu (`HT_GLB`, `FERN_GLB`): `file://` chặn fetch tệp cục bộ ⇒ ngoài localhost đọc bản trên Pages; mẫu chưa đăng chỉ thấy ở localhost.
- `MODELS_KB` (`build.py`) chặn tổng cỡ `models/`; thêm mẫu thì nâng có chủ ý.
