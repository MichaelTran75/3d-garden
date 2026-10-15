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
- Laptop bàn học: `laptopDash(t)` vẽ bảng vận hành chạy (~6 hình/giây, chỉ khi nắp mở) — số MW theo nắng / mây / gió thật.
- Gấu mèo: thân 2 nửa `U.fore`/`U.aft` gập quanh giữa lưng khi phi nhảy (hông chân vẫn gắn `torso` ⇒ IK không đổi).
- Đo được (trượt TB của bàn chân trụ, đv/khung ở 30 hình/giây): bò 0,0003–0,0007 · hươu 0,0003 · cò 0,0013 · gấu mèo ~0,003 (ngoặt gắt) ·
  kỹ sư ~0,003 (chưa tính lúc ngoặt). Thử: `slipTest`/`ikErr` (công cụ nháp) — đọc `rig.feet`, so điểm đế thật với `F.w`.

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
