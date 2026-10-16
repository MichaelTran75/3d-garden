# Kiến trúc 3D garden — đọc trước khi sửa

Ghi chú khái niệm cho người (và AI) đọc lại mã sau một thời gian: cảnh chạy thế nào mỗi khung, vật lý, gộp lượt vẽ,
cận cảnh, hiệu năng, cách thử và các bẫy đã dính. Chi tiết từng tệp: `README.md` (bảng thư mục) và `src/app/manifest.txt`.

## 1. Mã nguồn và dựng trang

- Chỉ sửa trong `src/`. `src/app/**.js` được **nối nguyên văn** theo `src/app/manifest.txt` thành một hàm `build()` duy nhất:
  mọi tệp dùng chung một phạm vi biến, không `import`/`export`. Tệp sau dùng được hằng/hàm của tệp trước; khai báo hàm (`function f`)
  được kéo lên đầu nên gọi được từ tệp đứng trước. **Trùng tên biến giữa hai tệp = lỗi cú pháp** → đặt tên nháp có tiền tố riêng
  (`_aV`, `_rfE`, `_cuX`…).
- `python3 build.py --check`: dựng `index.html` + `css/` + `js/` (trang GitHub Pages) và `../3D garden.html` (bản một tệp để thử/gỡ lỗi),
  kiểm cú pháp bằng node, kiểm **ngân sách gzip** (`BUDGET_KB`: app.js 400 KB, tổng 420 KB — nâng từ 380/400 ngày 14/10 khi thêm chim sẻ + xuồng; 15/10 G nâng lên 420/440; đang dùng ~398/413).
- `js/app.js` trên web **bỏ mọi dòng chỉ có chú thích** (`// …`) → nhẹ hơn ~13%. Chú thích cuối dòng vẫn giữ. Bản một tệp giữ nguyên.
  ⇒ Đừng chèn `//` vào GIỮA một dòng có nhiều lệnh (phần sau bị nuốt) và đừng để dòng dữ liệu bắt đầu bằng `//` trong chuỗi `` ` ` ``.
- `./publish.sh "mô tả"`: kéo bản mới, dựng, commit, push; GitHub Actions dựng lại Pages. Wix nhúng trang Pages bằng iframe.

## 2. Một khung hình (loop/main-loop.js → main-loop-rest.js)

1. `dt = min(getDelta, 0.05) || 1/60` — khung đầu `Clock.getDelta()` trả 0; **không hệ nào được nhận dt = 0**.
2. `adaptResolution(ts)` (chỉ khi khung do rAF gọi), camera theo `theta/phi/radius/target`, gió cảnh, mây, nước…
3. Kỹ sư (engineer/loop-update.js): pha việc ghi **góc tay thẳng** → `engPoseEnd` (làm mượt) → `engFootIK` → `engSeatPost` →
   `updateFishingBite` (câu cá) → `engArmPost` (IK khuỷu/cổ tay) → `applePick.tick`.
4. Thú, côn trùng, `updateDrawBatches`, `fluids.update` (Worker).
5. `updateSky()` (mặt trời/trăng thật) → `nightSky.update` (nền trời đêm) → `fitSunShadow()` → `updateCloseLod()` → `renderer.render`.

## 3. Vật lý và thời gian

- **Bước cố định** (`core/fixed-step.js`, "Fix Your Timestep"): `fixedSteps(S, dt, h, step)` dồn dt vào `S.acc`, đủ `h` thì gọi
  `step(h)`; trả `alpha = dư / h` để **vẽ nội suy** giữa trạng thái bước trước và bước mới. Trần 0,1 s/khung (máy quá chậm thì
  cảnh chậm lại, không tính bù vô tận). Kết quả giống nhau ở 15, 60, 144 hình/giây (đã đo: phao treo 0,42 · lực dây 0,178 ở cả 3).
- Hệ đang dùng bước cố định:
  - Câu cá 120 Hz (`anglingPhysStep`): cần uốn → ngọn vật lý `_aTip` → cá giằng co → phao + mồi Verlet → lực dây `A.T`.
    Vẽ: `rodFlexPose(alpha)` (góc đoạn cần nội suy `X.thp → X.th`), `_aTipR` (ngọn để vẽ), `_dF/_dB` (phao/mồi = `Fp→F`, `Bp→B`),
    `_dM` (miệng cá `Mp→M`). Quán tính gốc cần `rodFlexAcc(rod, dt)` tính theo khung vì tay chỉ đổi dáng mỗi khung.
  - Đuôi chó/gấu mèo 240 Hz (`updateSoftTail`, vẽ `Q→P`), tai thỏ 120 Hz (`bunnyEars`).
  - Nước nông + khói ở Worker có bước riêng (60 bước/s) — xem README mục "Chất lỏng".
- Mẫu khi thêm hệ mới: giữ "trạng thái trước" (Verlet có sẵn `prev`), bước vật lý chỉ đọc trạng thái vật lý, phần vẽ đọc bản nội suy;
  đừng chia cho dt ở chỗ dt có thể = 0; gặp NaN thì tự đặt lại (như khối "NaN lọt vào" đầu `updateFishingBite`).
- Làm mượt tư thế dùng `engSpring` (dạng SmoothDamp, ổn định ở mọi dt) — không cần bước cố định.
- Vật lý "giả" cho rẻ: gió cây/cỏ trong shader (`nature/wind-physics.js`), lò xo cho chuyển động phụ, IK cho tay chân.

## 4. Tay kỹ sư (IK)

- Mọi pha ghi góc vai của **tay thẳng** (tâm bàn tay cách vai 0,66). `engArmSolve(e, i, dt)` giải IK 2 khớp chính xác cho 1 tay,
  mỗi khung 1 lần (`e.armDone`), `engArmPost` giải tay còn lại. Đích: `e.reachT[i]` (điểm thế giới), hướng bàn tay `e.handQ[i]`.
- **Đọc vị trí đồ cầm tay giữa khung chỉ đúng sau khi tay đó đã giải** (câu cá gọi `engArmSolve(e, 1)` trước khi đọc ngọn cần —
  thiếu bước này dây câu lệch khỏi cần 0,74 đv). Hoặc dùng `e.handW[i]` (tâm bàn tay cuối khung trước).
- Vector đích phải là vùng nhớ riêng (vd `A.rh`), không dùng biến nháp dùng chung bị ghi đè sau trong khung.

## 5. Vẽ và hiệu năng

- **Gộp lượt vẽ** (`core/draw-batch.js`): mảnh tĩnh và mảnh chuyển động cứng được gộp theo loại vật liệu thành `SkinnedMesh`
  (mỗi mảnh gốc = 1 xương); mảnh gốc ẩn ở lớp 31. Đổi màu/vật liệu/hình lúc chạy → mảnh tự tách ra vẽ riêng.
  - Vật dựng sẵn mà bị **mang đi xa** (que cá) → `userData.noBatch = true` (lô bị loại theo khung nhìn ở chỗ cũ).
  - Vật liệu có `onBeforeCompile` riêng thì không được gộp (tốn thêm lượt vẽ).
  - Mảnh có `userData.lodHi` (cận cảnh) được đổi hình tạm: tự vẽ khi dùng bản nhiều cạnh, lùi xa thì về lại lô.
- Lớp: 0 = cảnh; 2 = nền trời đêm (camera chính bật, camera phụ như bản đồ mặt chắn mưa không thấy); 31 = mảnh gốc đã gộp.
- Ngân sách tham khảo: ~250–450 lượt vẽ, ~1,8–2,4 triệu tam giác ở toàn cảnh; mật độ điểm ảnh tối đa 1,6.
  **Đo thật 16/10** (toàn cảnh mặc định, 10:00): lượt chính 1,76 triệu + lượt bóng 1,29 triệu tam giác (trước khi sửa: 2,12 + 1,88), 779 + 306 lượt vẽ.
  Lớn nhất: khối đất đủ 6 mặt (21k + 11k ô × 12 tam giác, cả 2 lượt) · cây rừng natTree (~150 cây × 2,4–3,4k) · 2 cây táo cạnh trại (cành
  35–41k/cây) · anh đào ~100k. Đàn chim sẻ ~280 lượt vẽ (mảnh nhỏ không gộp). Mô phỏng (mọi hành vi) chỉ ~0,4 ms/khung — nút thắt là GPU.
  Cách đo: bọc `renderer.renderBufferDirect`, lấy chênh `info.render.triangles` mỗi lệnh (`scene` = null ⇒ lượt bóng); lô gộp chia lại theo
  `userData.batchSrc.recs`. Đã cắt: lá phẳng lục giác `leafHexGeo` (24 → 4 tam giác/lá) và ô đất phẳng không đổ bóng (`flatTopGeo` chỉ mặt trên).
  **Khối đất chỉ dựng mặt lộ ra + chia ô lớn** (16/10, `core/sky-sun-moon.js` `terrFaces`, `core/terrain.js`): mọi mặt khối đất là 1 hình chung (mặt +y
  của hộp, giữ 24 đỉnh) xoay bằng `FACE_R[f]` về hướng mặt — BoxGeometry dựng mọi mặt cùng kiểu UV nên trùng khít từng đỉnh (sai số 0). Ô mặt đất
  không phẳng: mặt trên + mặt bên giáp ô thấp hơn / nước / mép; thân cột: mặt bên giáp cột thấp hơn (giữ chiều cao thân cũ ⇒ texture y hệt);
  đáy sông: mặt trên + mặt bên giáp đáy thấp hơn. Không mặt đáy nào. Bản đồ chia `TERR_CHUNK` = 6 × 6 ô lớn, mỗi ô lớn 1 InstancedMesh / loại
  (vật liệu × đổ bóng). Đo: toàn cảnh 3,05 → 2,49 triệu tam giác (2 lượt), +~120 lượt vẽ cùng vật liệu (~1,3 µs CPU/lượt); cận cảnh địa hình
  vẽ còn ~1/3 (4 × 4: ~1/2, 8 × 8: ~1/5 nhưng toàn cảnh +250 lượt). A/B cùng phiên lệch ≤ 0,014/255; tia rê chuột trùng 100%.
  Bẫy so 2 bản dựng: three.js lấy `Math.random` cho uuid mỗi vật/hình/vật liệu ⇒ thêm lưới làm lệch dãy ngẫu nhiên sau đó (cây, bò đặt khác).
  **Dung lượng (16/10):** build.py bỏ cả chú thích CUỐI DÒNG cho trang web (`js_scan`: bộ tách từ tối giản — chuỗi, template `${}` (không đụng
  chữ template ⇒ shader GLSL giữ nguyên), regex đoán theo ký tự trước). Mỗi lần dựng kiểm: chuỗi token trước = sau, rồi `node --check`. app.js
  gzip 420 → 359 KB. Viết chú thích cuối dòng thoải mái; bản một tệp (thử, gỡ lỗi) vẫn giữ chú thích.
- **Độ phân giải tự điều chỉnh** (`loop/close-up.js`, `DRES`): khung chậm (> 22 ms) 1,5 s → hạ mật độ điểm ảnh ×0,85; nhanh
  (< 17,8 ms) 4 s → nâng ×1,1; sàn 0,6. Hạ mà không nhanh lên ≥ 8% (màn 30 Hz, nghẽn CPU) → trả lại, thôi thử 60 s.
  Trang thử đặt `window.__resLock = true` để ảnh chụp giữ cỡ.
- Shader biên dịch song song trước khung đầu (`compileAsync`); vật tạo lúc dựng với `visible = true` thì được biên dịch sẵn.
- GitHub Pages không đặt được header COOP/COEP → **không có SharedArrayBuffer**. Worker trao dữ liệu bằng chuyển giao ArrayBuffer.

## 6. Cận cảnh

- `fitSunShadow()`: khung chụp bóng nắng ôm vùng đất đang thấy (cỡ theo zoom và góc chúc, nấc ×1,25, tâm bám lưới điểm bóng,
  độ lệch bias co theo cỡ điểm bóng). Toàn cảnh: 116 đv như cũ; zoom 22: ~10–16 đv ⇒ bóng sắc gấp ~10 lần.
  **Hướng nắng = `sun.position − sun.target.position`** — đích nắng di chuyển, đừng coi `sun.position` là hướng.
- `updateCloseLod()`: ~300 vật tròn (trụ, nón, cầu, xuyến, tiện, viên nang) quanh kỹ sư, khu cắm trại, xe đổi sang bản ×3 cạnh
  khi bán kính > 13 điểm ảnh (< 9 thì trả). Chỉ nhận hình còn nguyên như lúc tạo (so đỉnh với bản dựng lại từ `.parameters`),
  bỏ vật liệu `flatShading`. Thêm vùng mới: gọi `registerCloseLod(root)`.

## 7. Gió và cây (3 tầng gió, 3 tầng cây)

- **Gió = bản đồ NS × profile log + nhiễu tổng hợp.** `windVec(p, zu)` (GPU, `WIND_GLSL_COMMON`) và `windAt(x, y, z, zu)` (CPU) cho cùng kết quả:
  - **Bản đồ gió** (`uWMap`, `windMap`, `windMapSample`): Navier–Stokes không nén 2D ở lát cắt 4 đv trên mặt đất, lưới 2,4 đv
    (102 × 92) phủ cả đảo, giải ở luồng phụ (`nature/fluids.js` mục 3, 20 bước/s, ~2,8 ms/bước). Giải theo **đơn vị chuẩn hoá**
    (gió tự do = 1, chỉ đổi hướng) ⇒ gió mạnh/yếu đi thì bản đồ đúng ngay. Mỗi ô: (gió TB x, z đã gồm hướng · hệ số nhiễu loạn · |gió|).
  - Vật cản (`nature/wind-field.js`, dựng 1 lần lúc tạo cảnh): nhà/xe/đập/bồn = cản gần kín theo phần cao chạm lát cắt; tán rừng
    (khối tán instanced), cây cổ thụ, anh đào, táo = cản thưa (tối đa 0,3/đv); pin mặt trời gần như không cản. Độ phơi gió: cao hơn
    mặt bằng quanh ~14 đv thì gió mạnh hơn ~4,5%/đv, mặt nước +12%.
  - Phục hồi sau vật cản: trộn động lượng từ trên cao sau ~16 đv (`lrec`), như hàng chắn gió thật (lặng nhất 3–5 H, hồi 10–30 H).
  - **Nhiễu tổng hợp** 6 mode Fourier (von Kármán, trôi theo gió) chồng lên, biên độ × hệ số nhiễu loạn của bản đồ.
- **Cây có mô hình thân** (`makeTreeWind`: cây cổ thụ, anh đào): thân = lò xo 2 chiều; **3 cành ghép** (tần số 1,15× / 2,1× / 3,4× thân,
  khối lượng 18% / 10% / 5%) bị gió ở từng phía tán đẩy và bị thân giật ⇒ lắc lệch pha thân, hút năng lượng của thân (giảm chấn đa
  cộng hưởng). Bước cố định 120 Hz (`treeStep`), vẽ nội suy (`uBend`, `uBr[3]`). Lá: ngả theo gió tại lá + rung.
  Cây rừng, cỏ, hoa: tựa tĩnh theo gió tại chỗ (đã đọc bản đồ gió ⇒ khuất gió thì đứng yên hơn).
- **Lá rụng theo độ rung** (`updateLeafFall`): cây có mô hình thân bứt lá theo `tw.shake` (gia tốc tuyệt đối lớn nhất của cành,
  giữ đỉnh 0,4 s) vượt `o.shake0` + lực gió `tw.F`; rừng + cây táo dùng chung đàn lá `forestLeafCtl` (60 lá): mỗi khung thử 4 điểm tán
  trong vùng đang nhìn, bứt lá khi (lực gió)² × (gió tại chỗ / gió nền tại chỗ − 1,25)^1,5 lớn ⇒ cơn giật lướt qua rừng làm lá rụng thành đợt.
  Đo được (lá/phút): gió 8 km/h — cổ thụ 9, anh đào 10, rừng 11; 20 km/h — 23, 35, 68; 35 km/h — 28, 39, 76.
- **Cây rừng: cành tự nhiên** (`natTree`, `recTree(g, { natural: true, … })`, G 15/10 học GLB "Low Poly Tree Scene Free"): thân chính tới ngọn, gốc trơn
  ~1/5, 10–13 cành bên rải dọc thân theo góc vàng 137,5°, dưới xoè ~70° (`angTaper`) rồi uốn cong lên (`bend`, hướng sáng), dưới dài – trên ngắn;
  mỗi cành bên 3–4 cành con, cành con chẻ đôi ở đầu; mỗi cành = 1 ống cong liền thuôn dần (`taperTube`, khung vận chuyển song song) — không khớp cầu.
  ~1.500–1.900 đỉnh / mẫu (cũ ~1.900), ~16 điểm tán. Cây táo, anh đào, cành khúc gỗ vẫn dùng `recTree` cũ (hộp tổ treo đúng 1 cành đã đo, táo,
  hoa dọc cành phụ thuộc vị trí cành).
- **Thảm cỏ** (`nature/meadow.js`): cỏ mềm = 45% ô đất theo ngưỡng điểm nhiễu, KHÔNG mọc trên nền san phẳng (`padH`). **Thảm cỏ ngắn**
  (`LAWNS`, G 15/10: bãi khúc gỗ chết + 2 gốc cây, nằm trên nền san phẳng): ô trong elip mép loang luôn có cỏ, kể cả trên nền san
  phẳng; lá 9–15 cm, mảnh hơn 40%, 3 bản/ô; đánh dấu bằng độ tươi +2 trong `aCell.z` (shader: `lawn = step(1.5, aCell.z)`, gốc lá tối
  hơn, ngọn sáng hơn); nền dưới nhuộm xanh đậm (`_lawnTint`) loang ra mép — chỉ lá ngắn cùng màu nền thì zoom thường không thấy gì.
  Ô cỏ mềm sẵn có trong vùng giữ lá cao; RNG riêng (`lrnd`) + ngưỡng chọn ô giữ nguyên ⇒ cỏ chỗ khác y như cũ. Lõi rỗng khúc gỗ bỏ trống.
- **Mưa dập lửa trại → lò chiminea** (G 15/10): `campRain` (`camp/chairs-lantern-fire.js`): `heat` lụi theo `rainK` (τ 60 s / cường độ), ngọn lửa
  `flameK` = smoothstep(heat 0,45→0,9), than `emberK` (0,03→0,55), hơi dập `quench`, khói gỗ ướt `smolder` (phai τ 20 phút); tạnh + `sceneWet` < 0,6
  thì nhen lại (τ 4 phút). main-loop nhân `fireScale` với `flameK`, vật liệu than / vết nứt với `emberK`; hơi + khói âm ỉ nhân cỡ đống lửa theo
  giờ (ngày chỉ còn than 5% thì ít — bản đầu cho hơi dập ban ngày trùm cả khung hình). Lò `camp/chiminea.js` (hover 67, 100, cửa quay về ghế
  cắm trại, ống khói 1,32 m, cao tổng ~2,1 m) CHỈ cháy khi mưa (`rainK > 0,05`; ≥ 55%, tối theo lịch lửa trại; bén τ 40 s, tàn τ 150 s). Đèn lò luôn bật (cường độ 0
  khi tắt) để số đèn không đổi ⇒ không biên dịch lại shader.
- **Khói sợi Navier–Stokes NHIỀU NGUỒN** (`nature/fluids.js`): `fluids.addSmoke(cfg, look)` trả nguồn có `id` (0 lửa trại · 1 ống khói lò chiminea ·
  2 ống bếp xe); luồng phụ giữ `SMS[id]`, mỗi bước chỉ tính nguồn đang `on` (tắt = không tốn CPU). **Ống khói có nón** (`cfg.inlet` r miệng ống +
  `cfg.lid` {r, z0, z1}): đáy miền = miệng ống (khí phụt lên theo `draft`), nón = ô ĐẶC trong lưới (chiếu áp suất bỏ ô đặc + Neumann quanh nón,
  `lidZero` xoá vận tốc qua mặt nón) ⇒ khói dội vào mặt dưới nón, toả ra theo khe, vòng qua mép rồi mới bốc; hạt không bao giờ vào nón. Đo
  (Node, `lidtest.js` trích `fluidKernel`): khe dưới nón u tới 1,95 m/s, trong nón 0, hạt ngay trên nón đều ở r ≥ bán kính nón; ~2,3 ms/bước.
  Thử khói Worker: `simC` (MessageChannel, không bị bóp khi pane ẩn), `__ev('rainTarget = () => 0.8')`.
- Gỡ lỗi: `fluids.windCfg()` (lưới vật cản, độ phơi), `windMap` (dữ liệu half-float, đọc bằng `halfF`), `oldTreeWind.shake`.
  Luồng phụ trả kết quả bất đồng bộ ⇒ trang thử phải chờ (`simA`, `await`) thì bản đồ mới về; `sim2` chạy đồng bộ thì bản đồ đứng yên.
  Thử bộ giải không vật cản (drag = 0, expo = 1) phải ra gió đều đúng bằng gió tự do.

## 8. Đi lại: bàn chân trụ cố định (thú 4 chân, cò, kỹ sư)

Nguyên tắc chung: **nhịp chân theo QUÃNG ĐƯỜNG** (pha tăng = quãng / sải) ⇒ không trượt; bàn chân trụ là **điểm thế giới cố định**, chân vung
theo cung tới điểm đáp dự đoán; chân giải **IK 2 đoạn** tới điểm đó; thân **theo chỗ chân đứng** (đất TB dưới chân trước / sau → cao + chúc/ngóc,
lò xo) ⇒ lên bậc voxel 0,6 đv thì chân trước lên trước, thân ngóc dần, không "nhảy bậc".

- **`quadRig`** (`animals/quadruped.js`, chó · gấu mèo · bò · hươu): dáng `{off[4], duty, stride, lift, vRef}` (vRef: sải co giãn √(v/vRef));
  v < 0 = đi lùi; `L.bend` (+1 khớp giữa chĩa trước, −1 chĩa sau), `L.ankleH` (khớp cổ chân cao hơn đế ⇒ IK nhắm cổ chân, móng phẳng ngay dưới);
  hông dạng/khép ≤ 20° theo độ lệch ngang; IK đọc **vị trí hông thật** + bù lắc ngang của thân; `R.fk[i] = {a, b, p, w}` hoà góc gập sẵn (bò nằm);
  `R.support(i)` = đất chân i đang / sắp đứng; nhích chân khi đứng (`settleT`), **bước bắt kịp** khi ngoặt gắt (chân trụ bị bỏ > 0,6 sải / lệch ngang).
- Bò (`cowPose`): đi 4 phách trình tự bên, chạm đất 65%, sải ~1,15 thân/chu kỳ; khớp vai/hông nằm TRONG thân (cao hơn mặt bụng 0,25) cho cung
  chân đủ dài; nảy theo con lắc ngược (vai / hông cao nhất giữa pha trụ), thân lắc về 2 chân cùng bên đang trụ, đầu gật 2 lần/chu kỳ; nằm = QUỲ chân
  trước trước, đứng dậy = NHỔM MÔNG trước (nghiên cứu tập tính bò); đuôi = chuỗi hạt XPBD (`makeSoftTail`, có `T.kick` để phẩy ruồi).
  Móng (`COW_HOOF_GEO`, 16/10): 2 móng chẻ thấp mặt trước vát ~55°, rộng bằng ống chân, + 2 móng huyền, 1 lưới dùng chung; cổ chân trắng. Đừng
  phủ khối đen lên cổ chân (trước đây cục đen cao 0,24 rộng hơn chân ⇒ như đi guốc). Đế vẫn ở −0,15 (`ankleH`).
  Hàm dựng chung `cloveHoofGeo(o)` (cows-hut.js) — hươu (16/10) dùng bộ thông số thon nhọn hơn (móng hẹp, mũi nhọn), cổ chân lông nâu, đế −0,08.
  Hươu (`stagTick`) cùng khung như bò. Gấu mèo: sải ngắn hợp chân ngắn, đi khom, quay ≤ 150°/s.
- Hành vi bò ngoài bãi (`cowFreeTick`, `animals/cows-hut.js`, 15/10): máy trạng thái graze / rest / stand / walk / drink / shade / flee. `cowChoose`
  cân theo giờ (`cowGrazeDrive`: sáng & chiều 0,85, trưa 0,1) + bắt chước con gần nhất < 7 m (mức kéo nhân theo nhịp giờ — không thì trưa vẫn
  gặm cả đàn) + trưa nóng ≥ 28 °C tìm bóng cây (`cowShadeSpot`). Đo: 7 h gặm 91%; 12 h 30 nằm 54% / gặm 23%. Nhai lại 55 s mỗi viên (2,5 s cuối
  nuốt – ợ, cổ vươn); trước khi nằm cúi đánh hơi 3 s; người / chó < 3,5 m thì đứng dậy bỏ đi. Uống như thật (OSU Extension: 2–5 lần/ngày,
  1–4 phút/lần): `c.thirst` +1 sau ~4 giờ thả bãi → `hutField` (vòng sông) ra máng, uống 1–2,5 phút từng đợt (`c.sip`, ngẩng lên giữa các đợt), rồi
  `mode 'leave'` về bãi quen (`cowHome`); kẹt 4 phút thì thôi. **Bẫy đã dính**: đi máng bằng đường thẳng ⇒ 1 con bên kia sông đứng chết 58 m.
- **Người xem zoom cận** (`cowWatch(dt)`, gọi trong main-loop trước vòng bò): `camera.zoom ≥ 7` + con bò gần giữa khung (NDC ±0,6) ≥ 1,2 s, đang
  đứng hẳn / nằm hẳn ⇒ `c.watch` 2,5–4 s: ngẩng đầu, quay cổ (và xoay dần thân nếu đứng) nhìn về phía máy ảnh, vẫn nhai; hết nhìn mà khát
  ≥ 0,35 và máng ≤ 35 m thì `cowGoDrink` = dồn cữ uống sắp tới lên sớm (tổng số lần uống/ngày vẫn như thật). Máng giữa khung ≥ 1,5 s ⇒ con GẦN
  máng nhất trong số con sắp tới cữ ra uống (chọn con khát nhất thì có khi đi 30 m, người xem chờ gần 1 phút). Mỗi lần nhìn 1 phản ứng,
  rời khung ≥ 8 s mới tính lại (`c.seenDone`, `cowSeen`). Không xét vật che (bò khuất dưới tán cây vẫn tính).
- **Cổ bò** (`U.neck`, khớp N trong ngực, thứ tự Euler YZX): trước đây đầu chỉ gật quanh gáy ⇒ mõm gặm cỏ lơ lửng ~0,6 m. Hành vi đặt đích mõm
  `c.reach` (cao trên đất ngay dưới mõm: cỏ 0,02, đánh hơi 0,08) hoặc `c.reachY` (tuyệt đối: mặt nước máng −3 cm, đỉnh đống cỏ khô của ô
  `stall.hay`); `cowPose` đọc điểm mũi-dưới mõm (`matrixWorld` khung trước) rồi hạ / nâng `P.nk` (≤ 1,2/s, cổ tới −68°) ⇒ tự khớp cỡ con, dốc
  đất; không đích thì ngóc (1,6/s). Quét đầu khi gặm = xoay cổ quanh N (`hx`), đầu chỉ nghiêng 0,35·hx; giật cắn `c.bite` cộng thẳng, không qua
  lò xo. Hàm `U.jaw` há–ngậm + nghiến ngang 1,1 lần/s theo `c.chew`; tai giật đuổi ruồi, đuôi phẩy dày hơn khi nóng + nắng. Máng nước = đáy +
  4 thành (khối đặc cũ che mất mặt nước).
- Cò (`animals/storks.js`): lưới đỉnh GLB ⇒ chân biến dạng theo **2 đoạn cứng** (`storkLegSolve`: hông → khớp cổ chân gập RA SAU → bàn), mọi dáng
  (đứng, đậu cành, chùn khi đáp) đi qua IK; `storkWalk`: bàn chân trụ cố định khi lội / chạy lấy đà, thân hạ 5 đv khi đi, **gật đầu kiểu chim**
  (đẩy 35% / giữ 65% mỗi bước, đầu đứng yên trong không gian lúc giữ — Necker 2007), mỗi bước đặt chân → gợn nước.
- Kỹ sư (`engWalkFeet` + `engFootIK`): gót chạm (mũi hếch 13°) → cả bàn → nhón gót lăn qua mũi (32°); chậu hông hạ 3 cm + nảy ±2 cm (cao nhất
  giữa pha 1 chân), lắc ngang, xoay ±4°, nghiêng ±2,5°; ngực vặn/nghiêng ngược (`e.pelvisYaw/List` → eo). Hông dạng/khép + xoay trong/ngoài
  (thứ tự Euler hông **XZY**: xoay quanh trục chân trước, rồi dạng, rồi vung). `e.walkW` hoà IK đi bộ (đủ trọng số ngay, không chờ IK địa hình).
- **Cúi người = gập EO**: lớp tư thế chỉ cho ≤ 0,12 rad nghiêng cả thân, phần dư ×1,6 thành `e.waistBend` (eo) — trừ bộ điều khiển ghế.
- **Nấu ăn bằng IK tay** (`engineer/cooking.js`: `ckHand`, `ckLook`): tay tới đúng núm ga (núm xoay ¼ vòng), mép bếp, quai nồi, cán chảo
  (chảo ở họng trước–trái để tay trái nắm cán, tay phải cầm xẻng), thớt, móc treo; đầu cúi nhìn chỗ tay làm. Khói ống bếp (`ventSmoke`): hạt có
  lực nổi nguội dần + gió thật (`windAt`), thoát ở ống khói mái xe (`caravanObj.userData.chimneyTop`); máy hút mùi chạy thêm 25 s sau khi tắt lửa.
- Chim sẻ (`animals/songbird.js`): cánh = nhóm "bên" lật gương (`scale.x = ±1`) + vai/cổ tay viết cho cánh PHẢI (sải +x, mép trước +z, mặt lưng +y);
  xếp ⇄ xoè = `slerp` giữa hướng vai xếp (`qFold`: sải ra sau, mặt lưng quay ra ngoài) và hướng vai đang vỗ (+79° → −59°, bàn cánh gập ra sau
  pha vỗ lên). **Bẫy đã dính**: lật gương bằng `scale.x = −s` ngay trên nhóm vai ⇒ 2 cánh cắm xuyên thân, bắt chéo chữ X, khi đậu chĩa qua đầu.
  2 hộp tổ `makeNestBox(hang)` → `nestBoxes` [vách tây chuồng bò, treo cành táo (`piv` ở tâm cành, con lắc 2 trục theo `windAt`)], mỗi hộp 1 cặp
  (`nestPairs`); chim đậu que / trong hộp được ghim lại theo hộp mỗi khung (`at.local`). Mái hộp chữ Λ: tấm mái phía +z quay `rotation.x = +0,36`.
  Đàn 5 chim sẻ nhỏ (`flock`, G 15/10): `makeSparrow(brain, size)` dùng chung, 1 bộ điều khiển đàn — `depart(kind, play)` xếp lộ trình từng con
  (vòng lượn chung kiểu `'air'` → chỗ đáp riêng: bãi cỏ / hàng trên dây điện / tán cây ngủ), cất cánh lệch 0–0,55 s; điểm `'air'` không đáp:
  `flyTo` nối tiếp tiếp tuyến (`c1` theo hướng `A − c2` cũ), tắt xoè đuôi / duỗi chân. 1 con hoảng (`next(S, scared)`) ⇒ cả đàn bay. Đo: đàn tản ≤ 2,5 m.
- Chuồng bò, phần mái chìa tây (`EXT` 0,8): xà đầu trước/sau VƯƠN tới kèo mép mái + thanh chống góc từ cột góc lên dưới xà (tam giác cứng);
  bản trước 2 thanh chống lơ lửng, đâm ra ngoài mép mái.
- Côn trùng (`animals/insects.js`): ong (`createBee`, cánh 2 cặp; nhóm cánh tự lật gương `scale.x` ⇒ vòng lặp đặt `wR = −wL`), đom đóm
  (`createFirefly`: cánh cứng + cánh màng trong nhóm "bên" lật gương ⇒ 2 bên CÙNG góc; nháy `fp/per/fl`, ghép xung kéo pha con gần ≤ 5 đv),
  bướm (`butterfly(sp)` + `bflyTex`: canvas hoa văn theo loài, UV = toạ độ hình cánh qua `repeat/offset`; `bflyFlap` vỗ – lượn, cánh sau trễ pha).
  Tổ ong (`animals/beehive.js`): vỏ `LatheGeometry` 13 vòng rơm (rãnh sắc ⇒ `EdgesGeometry(…, 35°)` ra nét vòng), 5 bánh sáp `ShapeGeometry`
  + ~1.700 ô lăng trụ lục giác 1 `InstancedMesh`, ong bò = `InstancedMesh` cập nhật ma trận mỗi khung (`beehive.update`). Treo thẳng từ
  `hiveAnchor` (Object3D trên cành cây con, `nature/old-tree.js`). Bánh sáp + ô đục 75% (không ghi độ sâu); NÉT VIỀN trong 50% (G 15/10) = vật liệu nét
  `transparent` + `depthWrite: false` + `renderOrder 10` ⇒ vẽ sau mọi lớp trong suốt (vỏ rơm 25%, bánh 50%) nên không bị mờ, vẫn bị vật đặc che;
  vách ô chỉ vẽ 1 mặt mỗi bánh, màu nâu sáp 0x4d2f0c (2 mặt × 5 bánh nét xanh đen chồng lệch nhau thành lưới rối).
  Đèn chuồng bò: `cowHut.lampTick(dt, đêm)` (vật liệu + con lắc dây).
- Ong (`beeTick`, `animals/insects.js`): pha `b.ph2` = fly → land (khoảng cách tới điểm chạm giảm theo hàm mũ τ 0,16 s — ong giữ tốc độ giãn ảnh
  không đổi khi hạ cánh) → feed (đậu `flower.top`, xếp cánh, bò vòng, giỏ phấn `b.pollen` to dần) → takeoff; về tổ: land vành miệng giỏ → crawlIn
  (ẩn) → inside → crawlOut. Chỉ ra tổ khi khô, 6:20–18:00, gió < 24 km/h, ≥ 12 °C (ngưỡng UMaine Extension); gió tại chỗ đẩy dạt khi bay. **Bẫy đã dính**: `hiveWorldPos`
  phải là ô bay trống (`flightNav.pointClear`) — điểm sát tán cây cổ thụ bị chặn ⇒ ong kẹt cả ngày không về được tổ.
  Trong tổ: 3 con nhảy lắc đuôi (góc chạy = hướng đồng hoa − hướng mặt trời, "lên" trên bánh = phía mặt trời).
  Quanh tổ: 6 ong `createBee()` thu 0,27 (`FLY` trong `animals/beehive.js`, gọi được dù insects.js nằm sau vì khai báo hàm được kéo lên đầu phạm vi):
  orbit (vòng cung nửa dưới giỏ, phần lớn quay đầu nhìn tổ) → land (vỏ giỏ, `surf(a, y)` = điểm + pháp tuyến) → perch (bò / quạt cánh) → takeoff;
  `beeWeatherOK()` dùng chung với ong kiếm mồi — trở trời thì đáp sát miệng giỏ rồi ẩn (`in`).
- Ăn ở bàn vuông trong xe (`engEatAtTable(e, t, ph, meal)`, `engineer/meal-read.js`): mọi đầu dụng cụ đặt bằng IK theo điểm thật — thìa
  (`SPOON_TIP`) / đũa (`CHOP_TIP`) chấm vào bát (`VCEREAL`/`VTUDON`, chỗ chấm đổi mỗi miếng) rồi tới `engMouthW`; vành cốc (`CUP_LIP`) từ chỗ nghỉ
  trên bàn lên môi theo 1 cung liền (cốc nghiêng dần). Pha mỗi miếng ngũ cốc: với 0,6 · xúc 0,6 · đưa lên 0,7 · vào miệng 0,35 · rút 0,35 ·
  về 0,8 · nhai ~2 s; udon: gắp chấm 2 lần · kéo sợi · tới miệng · húp · về; tay trái giữ vành bát. `e.elbowPole` (vectơ cực khuỷu, hệ eo,
  xoá mỗi khung trong `engArmPost`): ăn dùng `EAT_POLE` ⇒ khuỷu khép, đo được vai dạng ≤ 18° (nghiên cứu ≤ 30°); mặc định IK dang ra 0,6.
- Uống trà ở ghế cắm trại (`engTea(e, dt, t)`, `engineer/meal-read.js`; cốc `campTeaCup` ở `camp/chairs-lantern-fire.js`): cốc men trắng nằm
  trong vòng khay cốc tay vịn trái (bàn trà cách vai ~1 m, ngoài tầm với 0,57 m; ca đen trên bàn là ca nấu). Chu kỳ ~30,7 s theo bài thử uống nước
  (Alt Murphy 2006: với 1,2 · đưa lên 1,15 · uống 1,7 · đưa về 1,8 · thả 1,0 s): với → luồn tay vào quai → nâng (vòng ra trước) → thổi 1 s → nhấp
  (vành chạm môi dưới, cốc xoay quanh điểm chạm tới 26–29°, ngửa đầu nhẹ) → hạ trước ngực, tay phải áp hông cốc (2 tay ôm) → nhấp lần 2 → đặt lại
  → tay về đùi 10 s. Cầm: cốc thành con cổ tay với khung nắm cố định `TEA_GQ` (vòng chữ C quanh thanh đứng của quai); vị trí cổ tay giải ngược
  từ điểm cốc cần tới (`teaWrist`). Đặt xuống: cốc đứng thẳng, giữ hướng quai ⇒ lần với sau khớp đúng. Hết giờ chờ cốc về vòng mới đứng dậy;
  rời pha giữa chừng (tối) thì `teaRelease` trả cốc về vòng. Đo: cốc không nhảy (0 mm lúc cầm/đặt), IK lệch 0 mm, cổ tay trái 26–51°, phải 4–8° khi ôm.
- Chim sẻ (`animals/songbird.js`, 16/10): 10 con (trại · 2 cặp hộp tổ · đàn 5) GỘP thành 1 lô 'Chim sẻ' (~280 → vài lượt vẽ; lô gộp không cắt theo
  khung nhìn nên bay xa vẫn đúng). Bay 2,94 m/s (−30%). Lớp phản xạ dùng chung trong `makeSparrow`: đuổi chơi (`sally`: lá / cánh hoa đang rơi từ
  `cherryCtl`/`forestLeafCtl`, bướm — ngoái nhìn trong 4 m, ~0,45 lần/s khi trong 3 m thì bay ra vờn ~1 s rồi về chỗ cũ) · gió thật m/s tại chỗ
  chim = vector gió cảnh × `sceneWind.ms / sceneWind.U` (gió cảnh đã thu nhỏ ~3–4×): quay đón gió từ 2,5 m/s (thanh đèn / dây: 1 trong 2 hướng
  vuông thanh), thu mình áp lông từ 6 m/s, bay dạt theo gió, > 9 m/s không lượn nghỉ cánh · mưa ban ngày trú mà không ngủ: xù lông, rũ nước
  5–13 s/lần; tạnh mà đất ướt (`sceneWet` > 0,3): tắm, rũ mình · né (`sparrowFlush`): người đang đi 2 m (ngồi 1 m), chó 2,2 m (chạy 3,2 m), gấu
  mèo, cò 3 m; bò bước sát 0,9 m thì nhảy tránh · đàn ~30% xuống kiếm ăn quanh chân bò. Thử: `spSim` (scratchpad `sptest.js`); khoá thời tiết
  bằng getter trên `liveWeather.state` (gán thường bị module thời tiết ghi đè).
- Chỗ đậu trên CÀNH THẬT (16/10): `recTree`/`natTree` ghi `segs` (đoạn cành [a, b, r1, r2], toạ độ cây) → cây táo `userData.limbs`, biến thể rừng
  `_forestVariants[k].segs`; `treeCoords` có `V` (biến thể) + `rot` (`addTreeInst` trả biến thể). `branchPerches` (songbird.js) lọc đoạn bán kính vừa
  chân chim, gần ngang (|dy| < 0,6), giữa tán, xếp gần thân trước; điểm = mặt trên cành. Đo: chân chim cách trục cành = bán kính (sai ≤ 1,2 cm).
  Đừng đặt chỗ đậu bằng toạ độ đoán theo cỡ cây (cây đổi hình là lơ lửng).
- Độ cao mặt đứng `cowY` (cows-hut.js) cho MỌI con vật + kỹ sư: đập → `damDeckY` · đường nội bộ → `roadSurfaceAt` (đường đắp cao hơn ô đất tới
  1,3 m — trước đây thú đi trên đường bị lún) · còn lại ô đất. `envFree(x, z)`: lưới 0,25 m bị chắn (vật cản đăng ký + đồ trại + nước), tự dựng lại khi
  có vật cản đăng ký thêm — chim sẻ dùng cho chỗ đáp / bước nhảy. Đo va chạm 9 phút (bò, chó, gấu mèo, chim dưới đất, 28 thú ban ngày): 0 lần lấn
  sâu (chó "trong" xe caravan = đang vào xe trú, đúng kịch bản). Bán kính trong `obstacleCoords` là bán kính NÊN TRÁNH (đã nới) — đừng dùng chặn cứng
  cho chó/gấu mèo (chúng cố ý tới sát cửa xe, khúc gỗ).
- Chó chạy vòng 'zoom' (`animals/dog-brain.js`, 16/10): trước đây vòng R 2,4 m quanh `pf` (lửa trại) luồn qua khe 0,9 m giữa lò chiminea và
  đống củi ⇒ trông như xoay tại chỗ. `zoomCenter()` (tìm 1 lần, dò 3,5–14 m quanh `restP`, 36 hướng): dải chạy R 2,2 ± 0,6 m phải `envFree`, ngoài
  đường, chênh ≤ 0,7 m (quanh trại là đất bậc thang — đòi ≤ 0,5 m thì không còn chỗ nào); TRONG vòng không có vật cản nào; tâm cách gốc táo ≥ 4 m,
  ngoài tán anh đào; chấm điểm = khoảng cách + 0,12·số điểm qua bậc + 3 nếu ghế cắm trại không nhìn thấy (lệch hướng ghế > 1,3 rad) + 1,2/m nếu
  gần gốc táo < 5,4 m. **Bẫy đã dính**: bản đầu chỉ dò các vòng tròn ⇒ tâm cách gốc táo 0,98 m, chó chạy vòng quanh gốc cây. Đo: tâm ≈ (74,3; 92,5)
  (bãi cỏ giữa cây táo và anh đào, trước–trái ghế), cách gốc táo 4,2 m. Hết giờ chỉ đếm khi đã ở trên vòng (`dc ≤ ZR + 0,8`).
- **Kỹ sư phản ứng với cảnh** (`engineer/reactions.js`, G 16/10): lớp phủ lên việc đang làm, không đổi lịch. 4 lời gọi trong loop-update:
  `engReactHold` (đứng lại thay việc: mưa bắt đầu, ngồi xổm xoa đầu chó) · `engReactPre` (trước `engPoseEnd`: sự kiện, gió, tốc độ `e.spd`,
  nghiêng người) · `engReactPost` (sau IK chân, TRƯỚC `engSeatPost`: nhìn = `e.headYawT` + độ cúi cộng vào đầu đã làm mượt, nhịp cử chỉ) ·
  `engReactArms` (SAU `engSeatPost`, trước `engArmPost`: đích tay IK). **Bẫy đã dính**: tính đích tay "úp mũ" trước khi đầu quay/cúi xong khung đó
  ⇒ tay lơ lửng cách mũ ~0,17 (đứng xem trạm ngửa nhìn đỉnh cột). Đầu xoay thứ tự `YXZ` (model.js) — quay rồi mới cúi, quay xa mà cúi không bị
  nghiêng lệch. Cử chỉ hoà với đích tay của việc đang làm (`rxHand`): uống trà chỉ được dùng tay lúc tay nghỉ trên đùi và phải xong trước khi
  chu kỳ trà với cốc (`rxTeaLeft`), không thì tay giật về cốc. Đo IK cả 8 cử chỉ ngồi ≤ 1,2 cm; giữ mũ khi đứng lệch ≤ 3 mm.
  · Mưa: `rxRaining()` = cờ lịch (`liveWeather.state.raining`); bắt đầu mưa khi đang đứng/đi ngoài mái (`rxDry`: hình chữ nhật mái bạt, hệ toạ độ
  xe, tìm theo hình hộp 0,04 × 2,4) ⇒ đứng 2,7 s ngẩng nhìn trời, ngửa tay → đi vội ×1,55 (khom, cúi đầu, tay phải úp mũ, tay trái ôm bảng áp ngực).
  · Gió tại đầu (m/s thật): nghiêng đón gió > 2,2 m/s · giữ mũ khi giật ≥ 4,3 m/s và ≥ 1,2× nền 8 s (+0,3) hoặc ≥ 6,5 · ngược gió chậm tới −20%.
  Đo 16/10 (gió 10 m 17 km/h, giật 32): ở cột khí tượng trung bình 2,2 m/s, giật tối đa 4,6; ghế cắm trại (xe che) ~1 m/s.
  · Lá rơi: dùng chung hạt lá rơi (`cherryCtl`, `forestLeafCtl`, `oldTreeLeafCtl`); trạng thái hạt mới **6 = đang ở trên người** (`water-leaves.js`
  gọi `q.hold(p, q)` lấy vị trí/hướng — trả false thì rơi tiếp); `q.rxNo` = 4 s không bắt / không đậu lại (lá vừa phủi rơi xuống lại bị bắt).
  Đậu trên mũ phải xét MỖI KHUNG (xét 0,15 s/lần thì lá rơi lọt qua khe). Quanh trại không có tán rừng trong 9 m; cánh hoa anh đào (gió đông)
  bay qua cột khí tượng ~4,7 cánh/phút trong 4 m, ghế câu ~2/phút, ghế cắm trại ~0 ⇒ bắt được cánh hoa hiếm, nhìn theo thì thường.
  · Khói: đo trên sợi khói NS thật (`rxSmokeAt`: toạ độ điểm sợi khói tính TỪ GỐC NGUỒN `S.mesh.position`). Khói nóng bốc nhanh: chỉ xuống ngang
  mặt trong ~1,2 m cuối gió của lửa trại (gió 9–20 km/h) ⇒ chỉ khi đứng sát lửa (lấy/cắm que cá) mới ho, ngoảnh đi; ngồi ghế không bao giờ dính.
  · Chó chủ dừng: `dogBrain.state.patAt` (chỗ ngồi: thử các hướng, chỉ loại nước / đất chênh / vật nhỏ thật — kỹ sư xem trạm đứng ngay tâm vùng tránh
  2 m của cột khí tượng nên lọc theo `envFree` thì luôn hỏng) → chó tới ngồi, `patReady` → ngồi xổm (như hái táo) xoa đầu, `engPetting` ⇒ chó vẫy tít.
  · Thử: scratchpad `reacttest.js` (`wxLock` khoá thời tiết bằng getter, `rxTrace`, `rxGallery` ép 1 cử chỉ + đo IK, `rxPetal`/`rxHatPetal`).
  · Đi kèm: `chiminea` trả `smoke` + `lit()`; miếng khoai lúc đọc sách trước đây không gắn vào tay (dòng `arms[1].add(chip)` bị nuốt vào chú thích).
- Khói ống bếp xe (`engineer/cooking.js`, 16/10 "giống khói lửa trại, −70%"): dens 0,8 + độ đục 0,6 như lửa trại (trước 1,3 × 0,75), màu xám khói
  (ngả trắng hơi khi luộc), số hạt thả × 0,3, bốc nhờ hơi nóng (draft 0 — dòng gán draft cũ bị nuốt vào chú thích). Bướm bay × 0,7 (`spd`).
  Bẫy thử khói NS: Worker giải tối đa 0,1 s mỗi lượt và cộng dồn dt khi bận ⇒ vòng mô phỏng chạy nhanh (simC) làm khói gần như đứng yên; phải chờ
  Worker trả kết quả sau mỗi khung (scratchpad `smoketest2.js` · `simW`: đợi phiên bản vị trí hạt tăng). Pane ẩn thì `requestAnimationFrame` không chạy.
- Nền trời (`core/night-sky.js`, 16/10): BỎ lớp mây nền (đã có mây khối voxel 3D). Độ phủ mây thật `uCloud` chỉ làm mờ đều sao + Ngân Hà
  (× (1 − 0,9·uCloud)). Lưu ý: màu hồng của trời hoàng hôn lúc âm u trước đây là do lớp mây nền phủ kín, tô theo ánh ráng — giờ lộ màu chạng vạng gốc.
- Laptop bàn học (G 17/10): MacBook Pro 16" 2021 dựng bằng code (`macbookPro()` ở van/caravan.js — kích thước thật × 1,11, mặt đế 1 canvas
  1024 × 714 vẽ phím / loa / trackpad, ảnh phát sáng riêng chỉ chữ phím = đèn nền bàn phím). Màn 512 × 331 (tỉ lệ 1,547) vẽ 8 hình/giây khi nắp mở
  (`laptopScreenTick`, engineer/routine-fx.js): hình nền vẽ sẵn 1 lần, thanh menu + tai thỏ, Dock, cửa sổ "GHC · Vận hành" (số MW theo nắng / mây /
  gió thật, lịch sử 30 s có sẵn khi mở máy), Ghi chú đang gõ, con trỏ chuột lượn hiện nhãn giá trị, thông báo 45 s/lần, màn khoá 1,8 s khi vừa mở nắp,
  buổi tối cửa sổ Nhạc. Bẫy: UV của ShapeGeometry = toạ độ hình (m) ⇒ texture repeat 1/W, 1/D, offset ½; logo lưng nắp xoay π quanh pháp tuyến.
- Kỹ sư ngủ (`engineer/sleep.js`, G 17/10): `engSleepTick` (trước engPoseEnd) đặt đích khớp + điểm đặt bàn tay (`reachT`) theo LỊCH TƯ THẾ mỗi đêm
  (`sleepPlan(day)`: nghiêng trái mặt ra phòng → ngửa → nghiêng phải…, 35–70 phút/lần, trở mình 4 s lăn quanh trục thân `rotation.x` của gốc), thở
  12–15 lần/phút (REM 25 phút cuối mỗi chu kỳ 90 phút: nhanh hơn + giật cổ chân), cử động nhỏ 4 phút/lần, mặt in "ngủ" (đổi `map` của đầu).
  `engSleepPost` (sau engArmPost) phủ chăn: lưới 27 × 17 trên nệm, cao = mặt trên các khối thân / đùi / cẳng / giày (chân khối vuông: bán kính phủ
  0,19 vì góc khối), làm mềm 2 lượt, mép trước rủ xuống. Chăn gấp cuối giường (`interior.duvet`) không gộp tĩnh để ẩn / hiện được. **Bẫy**: gốc
  kỹ sư thứ tự Euler 'YXZ' (yaw 0 ⇒ Rx·Rz đúng); nằm nghiêng trục thân phải cao hơn nệm nửa bề ngang thân, bản cũ lún 20 cm vào nệm.
- Chó (G 17/10 "remove its motion đứng 1 chỗ xoay vòng"): bỏ xoay 1–2 vòng trước khi nằm (`'circle'` giờ chỉ xoay ngắn ≤ 2 s quay mặt về bếp lửa).
  Xoay thật sự là do KẸT: bảng DP chung ô 0,6 m dẫn qua khe 12 cm giữa lò chiminea và đống củi (đích nằm sát vòng tránh bếp lửa ⇒ vùng luôn-mở
  quanh đích nới tới 2,2 m) và `ffDir` ở ô cấm chỉ sang ô rẻ nhất 5×5 xuyên qua đống củi. Sửa: `dogNavBuild` (lớp va chạm xong) dựng lưới cấm từ
  va chạm thật quanh trại ± 40 m (ô có ≥ 2/5 điểm chạm vật tầm thân chó), `buildFlowField(…, unR 0,5)`; `ffDir` ở ô cấm chọn ô KỀ trước; điểm đánh hơi
  thử trên lớp va chạm + tối đa 12 s; chạy vòng 4 s không lại gần bãi thì thôi; lưới an toàn > 5,5 rad / 3 s tại chỗ ⇒ đi xuyên 1,5 s. Đo bằng
  `spinScan` (scratchpad): xoay > 230° / 6 s mà dịch < 0,5 m — trước 62 lần / 25 phút, sau 0 (chỉ còn quay đầu 250° lúc hết chạy vòng).
- Gấu mèo: thân 2 nửa `U.fore`/`U.aft` gập quanh giữa lưng khi phi nhảy (hông chân vẫn gắn `torso` ⇒ IK không đổi).
- Đo được (trượt TB của bàn chân trụ, đv/khung ở 30 hình/giây): bò 0,0003–0,0007 · hươu 0,0003 · cò 0,0013 · gấu mèo ~0,003 (ngoặt gắt) ·
  kỹ sư ~0,003 (chưa tính lúc ngoặt). Thử: `slipTest`/`ikErr` (công cụ nháp) — đọc `rig.feet`, so điểm đế thật với `F.w`.

## 8b. Va chạm với môi trường (core/collide.js, G 17/10 "nghiên cứu game engine làm physic…")

Game engine KHÔNG cho nhân vật / thú đi bằng vật lý vật rắn: nhân vật là khối động học (capsule) "đẩy thử rồi trượt dọc" (collide and slide),
va chạm dùng hình đơn giản / lưới va chạm riêng, chân đặt bằng tia dò + IK, navmesh dựng bằng voxel hoá (Recast). Cảnh này làm đúng cách đó, tự viết
(Rapier / Jolt / Ammo nặng hàng trăm KB nén — gấp nhiều lần phần còn trống; lại chỉ giải vật rắn).
- **Dựng**: `colCollect` gom mọi lưới tĩnh (bỏ con vật, người, chim, côn trùng, cá, địa hình khối, cỏ, nước, hiệu ứng, cánh đồng pin, kho pin) →
  `colBuildTick(4 ms/khung)` raster từng tam giác (cắt đa giác theo hàng z rồi cột x — như Recast) thành khoảng đặc [y0, y1] trong cột ô
  `COL.C` 0,125 m, gộp khoảng chồng; bỏ tam giác cao hơn mặt đất `COL_TOP` 2,6 m, dưới đất, mặt nằm ngang TRÙNG mặt cowY (mặt đường, mặt đập —
  còn thành bên đường đắp); CÂY giữ tam giác trong ~0,7 m quanh gốc (thân) + cây rừng giữ thêm cành thấp < 1,75 m vào LỚP CÀNH. Nén `colPack`: mỗi ô
  4 m = off (Uint16) + y (Int16, cm). Đo 17/10: ~150 nghìn tam giác, 53 nghìn cột, ~1,6 MB, xong ~1 s sau khi mở trang (pane ẩn thì phải gọi khung thủ công).
  4 lớp (`mask` bit 0–3): chung · xe van · chuồng bò · cành thấp — kỹ sư / chó vào xe, bò vào ô chuồng / tới máng đi lộ trình riêng thì bỏ lớp tương ứng;
  lớp cành chỉ bò dùng (hươu rúc dưới tán ăn lá, người không bị cành chặn).
- **Thử bước** `colStepOK(M, x0, z0, x1, z1, ang)`: dấu chân elip (`colFH`: nửa dài a theo mũi, nửa rộng b, tâm lệch `ox` theo mũi — `colDims` lấy từ khối
  thân lớn nhất; chó ox 0,11: ngực + cổ thò trước gốc) trong dải cao [đất + lo, đất + hi] (lo = bậc bước qua được, hi = lưng). Điểm = ĐỘ LẤN có trọng số
  (mẫu càng gần tâm elip càng nặng): được đi nếu không vướng hoặc không lấn sâu hơn — trượt dọc mặt vật được, đi xuyên cột mảnh thì không, lọt sẵn vào
  trong thì thoát ra được. Con ↔ con: `colMoverHits` (mỗi elip ≈ 3 hình tròn), `ignore`: chó ↔ kỹ sư lúc vuốt / xoa đầu.
  `colSlide`: thẳng → lệch ±0,4 / ±0,8 / ±1,2 rad → bước ngang 90° (bị chặn thẳng mặt: cột mảnh, chân mái hiên xe 12 cm — mọi hướng còn thành phần
  tiến đều lấn sâu hơn). Kẹt liền > 1,5 s ⇒ cho xuyên 2 s (`ghost`); `colTick` (main-loop, mỗi khung) đếm lùi lượt xuyên THEO THỜI GIAN, hết giờ mà
  thân còn trong vật thì đi nốt (≤ 2 s). `colTurnOK`: xoay tại chỗ cũng thử (thân dài 1,9 m của bò quét vào cây / con bên cạnh) — cho chạm nhẹ (≤ 4% dấu
  chân, ≤ 5 cm với con khác). `colPushOut` ("depenetration"): thân lấn > 8% vào vật ⇒ đẩy dần ra phía thoáng (≤ 0,6 m/s) — bò (`cowUnstick`), hươu.
  Gắn vào: bò (`cowSteer` + nhìn trước 1,2 m lái vòng kiểu Reynolds, `cowWander`), hươu, chó (`move`, `dogTurn`), gấu mèo (`move`), thỏ, cò lội (chỉ
  tránh nhau), kỹ sư (`engStep`; sát bậc cửa xe 1,3 m thì bỏ lớp xe). Lộ trình riêng không thử: chó ra vào xe (`dogRain`), bò lùi ra khỏi ô (lần lượt
  4,5 s / con, lùi tới khi đầu ra khỏi mép ô 0,9 m, có con đi ngang sau đuôi thì chờ), làn vào ghế của kỹ sư, gấu mèo trong khúc gỗ + đoạn miệng hang.
- **Mặt đứng** `colWalkY(x, z, ref, up)`: đất cowY hoặc đỉnh khoảng đặc cao nhất ≤ ref + up (lớp 0–2) — chân bò lên sàn chuồng (sàn cao hơn đất 14 cm),
  chân chó trên đống củi. `colTopAt`: đỉnh thấp có khoảng thoáng phía trên (tìm chỗ đứng lên được).
- **Bộ chân 4 chi**: bàn chân trụ ngoài tầm với (hông → điểm đặt > 97% chiều dài chân) mà về "nhà" thì với tới ⇒ bước bắt kịp ngay. Chó đứng thấp 5%
  (hông 92% chiều dài chân; trước 99% — đo 86% lần chân trụ lệch > 3 cm, trung bình 13 cm); bò gặm cỏ nhích chậm bỏ chân lại 0,8 m.
- **Tương tác** (bước 3): bò GÃI NGỨA vào thân cây (`cowRubTree`: cây ≤ 14 m chưa con nào gãi, bán kính thân đo trên lớp va chạm ở độ cao vai; tới điểm
  chờ Q cách chỗ cọ 1,7 m dọc tiếp tuyến → xoay song song → đi thẳng dọc thân cây tới khi vai chạm vỏ → cọ 0,33 lần/s 12–25 s, nghiêng mình, cổ ngoảnh vào
  cây) · chó NHẢY LÊN ĐỐNG CỦI (`dogPerchSpot`: đống củi dựng ngẫu nhiên mỗi lần mở trang ⇒ chọn chỗ 4 góc dấu chân chênh ít nhất ≤ 25 cm; tới điểm bật
  thoáng gần nhất, nhún, bật vòng cung, đứng / ngồi ngó, nhảy xuống) · chó nằm ở chỗ TRỐNG quanh chủ đang ngồi (`dogLieSpot`) · máng nước 2 chỗ, con thứ ba
  chờ · bóng cây cho bò cách thân 2,2 m, chỗ đứng trống thật.
- **Đo** (scratchpad `colaudit.js`: tia trong thân ↔ lưới tĩnh thật, đoạn chân, bàn chân ↔ đất, hộp thân con ↔ con; `colRun` chạy đồng bộ theo lát
  ≤ 30 s mỗi lần gọi — chạy nền dài thì trang tự nạp lại; `colBoot`, `colSum`, `dogTrace` / `cowTrace` / `exitTrace` / `pairProbe` / `dogProbe`).
  4800 mẫu sáng–chiều–tối (cây rừng ngẫu nhiên nên mỗi lần nạp khác nhau): trước bước 2 kẹt 482 lần / 70 phút; bản nháp đầu của bước 2–3 kẹt 34,
  hươu lấn thân cây 0,63 m, bò 0,84 m, chó chạm đồ trại ~180 mẫu; bản 17/10 sau cùng kẹt 4, chó 0 mẫu, lấn thân lớn nhất 0,37 m. Còn: cò chồng nhau khi
  BAY theo đàn, chân bò chạm mép bệ tua-bin #3 / vách ô chuồng (đứng trong ô), hươu ăn lá thân trên chạm cành (cố ý: dải hươu ≤ 1,35 m).
  **Bẫy đã dính**: (1) cây rừng rải NGẪU NHIÊN mỗi lần mở trang (`freeTree`) trước khi dựng chuồng ⇒ có lần 1 cây mọc xuyên ô chuồng — `freeTree` loại vùng
  chuồng + sân + máng; đống củi cũng ngẫu nhiên. (2) Thân cây trên lớp va chạm RỖNG (chỉ voxel hoá mặt vỏ) ⇒ dò bán kính thân từ trong ra phải tìm vòng
  trống ĐẦU TIÊN SAU KHI ĐÃ GẶP VỎ (bản đầu lấy luôn vòng 0,15 m trong lõi ⇒ chỗ cọ nằm trong thân cây gốc to, bò lấn 0,86 m). (3) Lượt xuyên trước chỉ
  giảm khi con vật đang bước ⇒ bò đứng gặm cỏ giữ lượt xuyên cả phút, xoay tự do vào thân cây. (4) Đang quay sang hướng mới (130° mất ~2 s) mà tính là
  "kẹt" ⇒ đi xuyên. (5) Dải cao của bò lấy đỉnh thân theo hệ toạ độ của THÂN (0,96) thay vì độ cao so với đất ⇒ chỉ tới 1,13–1,26 m, lưng bò ~1,6–1,8 m.
  (6) Điểm đánh hơi / bát nước / vòng chạy của chó chọn theo bảng né cũ (không có lò chiminea; bát cách vòng ghế 11 cm; vòng chạy đi thẳng qua khe 10 cm giữa
  ghế và bàn) ⇒ chó kẹt / xoay mãi — giờ thử trên lớp va chạm, bát sang phía bắc bậc cửa, ra vòng chạy theo bảng DP. Bài thử khi pane ẩn: lớp va chạm
  chỉ dựng khi có khung ⇒ gọi `colBuildTick(50)` tới `COL.ready`; trang mở lúc đêm thì chó đang trong xe (`dogRain`).

## 9. Bầu trời

- `core/sky-sun-moon.js`: mặt trời/mặt trăng vị trí thật Pleiku, là vật 3D trên "vòm" bán kính 150 quanh đảo + đường chấm quỹ đạo
  trong ngày. `sceneDay/sunEq/moonEq/hourAngle/horiz/skyDir` dùng chung.
- `core/night-sky.js`: nền trời đêm vẽ trước cảnh, chiếu nổi tâm ở chân trời theo hướng camera; **đường chân trời neo vào đáy khối đảo** (góc đáy
  thấp nhất trên màn hình, `islandBase` đo 1 lần từ `terrainMeshes`) ⇒ đảo đậu đúng trên chân trời ở mọi góc xoay/zoom/kéo (camera trực giao không có
  điểm tụ nên dời đảo xuống chỉ khớp ở một mức zoom); zoom gần thì chân trời nằm ngay dưới mép màn hình; sao Yale BSC5
  (`core/star-catalog.js`) quay theo giờ sao; Ngân Hà, chạng vạng, trăng, mây thật, sao băng + lịch mưa sao băng.
  API gỡ lỗi: `nightSky.U`, `nightSky.lim`, `nightSky.meteors`, `nightSky.spawn(row|null)`.

## 10. Thử và gỡ lỗi

- Bản gỡ lỗi: `make_debug.py` chèn `window.__dbg` (view, frames, snap, xray, engObj, clock…) và `window.__ev(code)` (đánh giá
  trong phạm vi `build()`). Tua nhanh: vá `clock.getDelta` trả `clock.__dt` (mặc định 1/20) + `window.__hourOverride` cho giờ cảnh.
  Các công cụ này nằm ở thư mục nháp của phiên làm việc (bị xoá giữa các phiên — dựng lại từ lịch sử phiên).
- `__dbg.frames(1)` gọi thẳng `loop()` (không có ts ⇒ bỏ qua bộ điều chỉnh độ phân giải). Pane trình duyệt ẩn ⇒ rAF dừng.
- Mẫu kiểm: chạy câu cá 150 s và so `fishLinePos` với vị trí khoen/ngọn thật (sai số phải = 0), đặt `clock.__dt = 0` một khung để thử
  NaN, đổi `clock.__dt` = 1/15, 1/60, 1/144 để thử tính độc lập tốc độ khung.
- `node --test ../tests/garden-flight.test.cjs`: mốc 14 đạt / 5 lỗi có sẵn từ trước.

## 11. Bẫy đã dính

- dt = 0 ở khung đầu → chia cho dt → NaN lan vĩnh viễn (mất đầu, mất thân cần).
- Khói NS lưới ô nhỏ (ống khói 3,2 cm, ống bếp 1,8 cm): khuếch tán HIỆN chỉ ổn định khi dt·ν/H² ≤ ~0,2 — ν rối chạm trần 0,045 thì trường
  khói nổ (±60) sau ~100 bước. Nguồn có `inlet` kẹp `nuMax = 0,18·H²·30`; lửa trại (ô 8 cm) giữ trần cũ. Ống nhỏ: khói vào miền phải là NỒNG ĐỘ
  của khí thải (max), cộng dồn theo dt thì gần như không thấy khói.
- Rải cỏ / hoa theo toạ độ tay không biết có vật nằm đè ⇒ cụm lưới 7×7 quanh (X0 + 102, Z0 + 105) mọc xuyên khúc gỗ chết (G 15/10). Mọi chỗ rải
  trong `nature/grass-scatter.js` giờ qua `deadLogOut(x, z, lề)` (trục thân gỗ `deadLog` tính từ chính ma trận nhóm khúc gỗ, `nature/forest.js`):
  điểm dưới thân gỗ → dời ra sát chân gỗ hoặc bỏ. Thêm cụm rải mới gần vật nằm trên đất thì làm tương tự.
- `new THREE.Color(hex)` ở r160 đã đổi sRGB → tuyến tính; đừng gọi thêm `convertSRGBToLinear()`.
- Đọc vị trí đồ cầm tay trước khi giải IK tay → lệch.
  Cùng họ (G 15/10, ăn cơm chảo ở ghế cắm trại): `engEatRice` đọc lòng chảo bằng `P.handPan.localToWorld` lúc tay trái còn ở góc ước lượng
  trước IK (loop-update đặt `arms[1].rotation.x = −0,9`) ⇒ "lòng chảo" ngang miệng, thìa không bao giờ xuống chảo, tay phải kẹt trên mặt.
  Đúng: tính từ ĐÍCH của tay kia trong cùng khung (chảo ngang tại `pan`, hướng `qPan`).
- Khung cổ tay đặt bằng `aimQ(dir, up)`: +y cổ tay = hướng tay → KHUỶU. Lấy `up` = trời khi khuỷu ở dưới tay (đưa thìa lên miệng) ⇒ bàn tay lật
  gập ngược 120–172°. Dùng `engWristUp(e, i, dir)` (ngược `e.foreW[i]` = hướng cẳng tay của lần giải IK trước): cổ tay còn 10–50°.
- Đọc ma trận thế giới của đồ ĐANG GẮN vào cổ tay giữa khung (trước `engArmPost`) = đọc tư thế vừa bị `engPoseBegin` trả về ⇒ đích tay lệch
  0,55 m rồi kẹt luôn (đích = chính vị trí sai). Cốc trà (G 15/10): chỉ đọc cốc khi nó còn nằm trong vòng tay vịn; lúc cầm dùng đích lưu khi nắm
  (`e.teaG0`/`e.teaQ0`) hoặc tư thế dự định (hướng quai khi đặt xuống tính từ `qL`, không từ ma trận cốc).
- Vòng tay chữ C dựng đứng quanh quai đòi cẳng tay ⊥ trục cốc; cực khuỷu mặc định (chĩa xuống) làm khuỷu tụt dưới bàn tay ⇒ cổ tay gập 137°;
  ép cổ tay thẳng tuyệt đối thì khuỷu giơ ngang đầu lúc uống. `teaElbow` chọn điểm khuỷu trên vòng IK sát hướng +y cổ tay chúc ~40° theo trục cốc
  (khuỷu buông thấp, cổ tay gập vừa phải), cực trượt mượt để khuỷu không giật khi đổi pha.
- IK tay kẹp khoảng vai–tay ≥ 0,3 đv (~25 cm): đường thẳng tay vịn → môi lướt cách vai 16 cm ⇒ tay đứng lại rồi giật bắt kịp. Cho đường phình ra trước.
- Vật bị mang đi xa nhưng vẫn nằm trong lô gộp → biến mất khi lô bị loại theo khung nhìn.
- Dời đích nắng mà vẫn coi `sun.position` là hướng → sai hướng bóng/ánh vàng ngọn cỏ.
- Bản đồ gió giải theo tốc độ thật rồi chia cho gió tự do lúc đó → khi gió đổi tốc độ, luồng khí trong lưới chưa kịp theo (vài chục giây) ⇒ tỉ số sai (> 1 khắp nơi). Giải theo đơn vị chuẩn hoá.
- Biên của bộ giải: áp suất ở mép gió vào phải ∂p/∂n = 0 (mép gió ra p = 0) + vùng đệm vài ô, không thì sọc số dọc mép.
- Chân duỗi gần thẳng khi đứng (hông cao ≈ tổng chiều dài chân) ⇒ không còn tầm với cho sải ⇒ IK bị kẹp, bàn chân trụ trượt. Hạ thân / nâng khớp
  hông vào trong thân / rút sải cho tới khi chân còn ~5% chùng ở đầu–cuối pha trụ (đo: khoảng cách hông → điểm đặt so với L1 + L2).
- IK chân bỏ qua lắc ngang của thân / không cho dạng hông ⇒ bàn chân trượt ngang theo nhịp lắc. Bàn chân đang "nhích về chỗ" lúc bắt đầu đi
  từng bị bỏ quên (chân duỗi dài ra sau) — nhánh settle phải chạy cả khi đang đi.
