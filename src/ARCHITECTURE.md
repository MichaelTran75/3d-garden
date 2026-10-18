# Kiến trúc 3D garden — đọc trước khi sửa

Ghi chú khái niệm cho người (và AI) đọc lại mã sau một thời gian: cảnh chạy thế nào mỗi khung, vật lý, gộp lượt vẽ,
cận cảnh, hiệu năng, cách thử và các bẫy đã dính. Chi tiết từng tệp: `README.md` (bảng thư mục) và `src/app/manifest.txt`.

## 1. Mã nguồn và dựng trang

- Chỉ sửa trong `src/`. `src/app/**.js` được **nối nguyên văn** theo `src/app/manifest.txt` thành một hàm `build()` duy nhất:
  mọi tệp dùng chung một phạm vi biến, không `import`/`export`. Tệp sau dùng được hằng/hàm của tệp trước; khai báo hàm (`function f`)
  được kéo lên đầu nên gọi được từ tệp đứng trước. **Trùng tên biến giữa hai tệp = lỗi cú pháp** → đặt tên nháp có tiền tố riêng
  (`_aV`, `_rfE`, `_cuX`…).
- `python3 build.py --check`: dựng `index.html` + `css/` + `js/` (trang GitHub Pages) và `../3D garden.html` (bản một tệp để thử/gỡ lỗi),
  kiểm cú pháp bằng node, kiểm **ngân sách gzip** (`BUDGET_KB`: app.js 440 KB, tổng 460 KB — 14/10 380/400 → 400/420, 15/10 420/440, 17/10 G nâng 440/460 khi dựng lại xe Transit; đang dùng ~415/430).
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
- Chuyển IK ↔ FK: trọng số `e.reachW` hoà 7/s; khi < 0,999 cực khuỷu trượt dần về phía khuỷu của tư thế FK cùng θ, α (17/10) ⇒ lúc tắt / bật hẳn
  IK khuỷu không nhảy. Tay về FK giữa chừng thì **đặt lại lò xo góc vai** của lớp tư thế (`e.pose.shown/raw[4 + i]`, xem `lapFKBase`): việc dùng IK lâu
  (gõ phím) không ghi góc vai nên lò xo còn giữ góc FK cũ (lúc nhích ghế) ⇒ lần uống coke đầu tay vọt 12 cm trong 1 khung. Tư thế IK giơ tay quá đầu
  (đan tay sau gáy) đọc lại góc Euler ra số rác ⇒ không chuyển thẳng sang FK từ đó, hạ tay về trước.
- Tay đi từ chỗ cũ tới đích mới: nội suy từ ĐIỂM XUẤT PHÁT ĐÃ GHI (`lapFrom`) theo smoothstep; `đích.lerp(e.handW, 1 − sw)` mỗi khung thì dồn
  ~70% quãng vào 0,13 s đầu (tay giật).

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
  ~1.500–1.900 đỉnh / mẫu (cũ ~1.900), ~16 điểm tán. Cây táo, anh đào, cành khúc gỗ vẫn dùng dáng `recTree` cũ (hộp tổ treo đúng 1 cành đã đo, táo,
  hoa dọc cành phụ thuộc vị trí cành) — nhưng lưới giờ là ống cong liền (`barkTubes`, gạch dưới).
- **Cành = ống cong liền** (`barkTubes(L, o)` ở nature/flowers-trees.js, G 17/10 khoanh "chỗ gấp" thân cây táo rồi "render cho cây cổ thụ luôn"):
  dùng cho recTree (táo, anh đào, cành khúc gỗ) + cây cổ thụ + cây con. Dựng 2 bước: (1) chạy đệ quy như cũ, CHỈ ghi bản ghi cành `{ P, R, par, kids,
  atEnd, root, pr, pT }` (điểm gấp khúc giữ nguyên thứ tự rnd() ⇒ táo, hoa, hộp tổ, tổ ong, chỗ chim / cò / bướm đậu không đổi); (2) gom CHUỖI: cành
  mẹ nối liền với cành con thẳng hướng nhất mọc ở ngọn (lệch < 60°) ⇒ 1 ống qua chỗ chẻ; mỗi chuỗi = Catmull–Rom hướng tâm qua điểm gấp, vòng mặt
  cắt theo khung vận chuyển song song, pháp tuyến tính từ lưới, vòm khép ngọn. Đầu chuỗi: 0 gốc (cắm đất `sink`, loe `flare` theo `lobes` múi) ·
  1 mọc ở ngọn mẹ (lùi 1,4 bán kính VÀO LÒNG mẹ, cùng hướng mẹ, 96% bán kính, rồi uốn 1 chiều) — khung mặt cắt, toạ độ vân và pháp tuyến hoà dần
  từ cành mẹ ⇒ vết nứt chạy liền qua đường tách · 2 mọc ngang giữa cành (cắm từ tim mẹ, cổ cành phình 30% ra ngoài mặt mẹ). Vỏ trong suốt ⇒
  `barkMesh` thêm bản CHỈ GHI ĐỘ SÂU vẽ trước (renderOrder −0,5, cùng chương trình shader ⇒ cùng độ sâu) ⇒ chỉ lớp vỏ ngoài cùng được tô.
  `segs[8–10]` = điểm giữa thật trên đường cong (chim đậu đúng mặt cành, lệch TB 0,2 cm). Hộp vật cản bay TỪNG ĐOẠN (`geo.userData.flightBounds`
  → `bakedFlightBounds`; bản độ sâu `noFlight`) — 1 lưới cả cây mà không có hộp từng đoạn thì bản đồ bay lấy 1 hộp bao cả tán (ong / bướm không vào
  được hoa dưới cây). Số cạnh / vòng theo cỡ thế giới (`wS`): táo 75k → 25k
  tam giác, anh đào 57k → 28k, cổ thụ + cây con ~95k như cũ (cộng lượt độ sâu ⇒ cả khung +~1%). **Bẫy** (đã dính): ép cành con đi qua tâm đầu
  cành mẹ ⇒ đường cong chữ S lòi ra phía đối diện thành gờ ngang; 4 cành con cùng trồi ở 1 độ cao ⇒ vệt vòng ngang (hết nhờ chuỗi liền + hoà
  pháp tuyến / vân); vật liệu trong suốt chồng 2 lớp ở đoạn lồng nhau ⇒ vệt đậm (lượt độ sâu); `material.clone()` chết vì userData vòng tròn
  (treeWind ⇄ depthMat) ⇒ tạm gỡ userData khi clone. Soi chuỗi: vá `barkTubes` qua `__ev` để tô màu đỉnh theo chuỗi (scratchpad `forkshot.js`).
- **Thân sợi bện** (`o.rope` của `barkTubes`, `ropeChain` / `ropeAt` cùng tệp — G 18/10 "study [Pohutukawa tree closeup, b_nealie, CC-BY-4.0]
  and fine grain cây cổ thụ 100%"): cắt lát bản quét theo độ cao (đv cm, thân r 1,4–1,8 m) → mặt cắt lệch bậc 2–3 ~10–20%, 5–7 múi lớn 6–10%,
  9–16 sợi nhỏ 3–5%, rãnh sâu tới 40% r; pha các bậc điều hoà trôi theo độ cao ⇒ cả bó XOẮN ~0,5 rad/m. Dựng: chuỗi cành bán kính ≥ `minR` (0,3 m)
  có N sợi (thân 12, cành 4–7) mặt cắt bán nguyệt dính nhau ⇒ rãnh hẹp sâu ở chỗ 2 sợi gặp; tâm sợi trôi theo độ xoắn + uốn lượn, sợi phồng xẹp
  theo chiều dài, 2–3 gờ phụ trong mỗi sợi; độ sâu giảm theo bán kính vòng (cành mảnh trơn như cũ), tăng ×2,5 ở bạnh gốc; múi bạnh = sống sợi
  loe ra (`0,2 + 0,8·mb^1,8`). Thân có u lồi (`trunk.burls`) + 1 hốc mục (`trunk.cav`, lõm 50% r, gờ liền sẹo). Lưới: thân ~83 cạnh, vòng ~7 cm
  (cổ thụ 37k → 88k đỉnh vỏ). Thuộc tính `aBd` (0 = cành thường · 0,02–1 = độ sâu rãnh · tới 1,49 = lòng hốc; `bkAttr` cũng ghi aBd = 0 — thiếu thì bakeStatic không gộp được với ống barkTubes cùng vật liệu, lỗi mergeGeometries) → shader vỏ (nhánh `uSfOld`):
  đáy rãnh tối, sống sợi mòn sáng, lòng hốc gần đen, thớ sợi dài mảnh chạy theo độ xoắn (vân `aBk.x` đã cộng độ xoắn). Độ sáng trung bình vỏ
  đo giữ như bản cũ (~79), độ tương phản tăng (lệch chuẩn 21 → 23). Bẫy thử: `helpers.js` trong scratchpad ẩn cây cổ thụ (`ot.visible = false`).
- **Rễ bò mặt đất cây cổ thụ** (`oldTreeRoots`, cuối nature/old-tree.js — G 18/10 "nghiên cứu cách rễ mọc trồi lên mặt đất … tránh rễ rời rạc và ko kết
  nối"). Học: rễ chính 4–11 cái mọc từ bạnh gốc, nằm ngang trong ~30 cm đất mặt, lộ ra khi đất mòn / nén / rễ già to; thuôn rất nhanh ngay ngoài chân
  thân (vùng thuôn nhanh — ZRT, 2–3 m còn 2–5 cm), gần gốc lớn lệch lên trên (tiết diện chữ T / I, Nicoll & Ray 1996). Dựng: (1) đo bán kính chân
  thân theo góc trên lưới vỏ đã dựng (đỉnh cao 0,05–0,55 trên đất, 72 ô góc, ô trống nội suy) → đỉnh cục bộ = múi bạnh → rễ chính (to theo độ nhô
  múi) + rễ phụ chen vào khe > 45°; múi tì sát đá thì bỏ. (2) Rễ bắt đầu TRONG lòng thân (0,55 bán kính chân thân, cao 0,42) như cành mọc ngang của
  barkTubes: `pr` = quãng tới mặt thân, `pT` = trục thân ngả ⇒ cổ rễ phình + pháp tuyến hoà theo mặt thân. (3) Đường đi: 2 sóng sin + trôi chậm;
  điểm kế lấn vòng ôm của đá / gốc cây con thì chiếu ra mép và bẻ hướng theo (ôm mép đá), rời đá thì dần về hướng cũ; trước mép nước 0,3 thì dừng.
  (4) Độ lộ e = (tâm − đất) / r giảm ĐƠN ĐIỆU: 0,3 → −0,35 rồi cắm dốc ~35° (quãng 2,2 r) xuống −2 ⇒ phần nổi là 1 dải liền, ngọn tù chui vào đất;
  bán kính thuôn còn 50% (rễ mảnh nằm dưới đất); gợn ±0,1 r chỉ khi e > −0,2. (5) Rễ con tách ở đoạn mẹ còn lộ (e > −0,45, mẹ ≥ 0,12), mọc từ TIM rễ
  mẹ đúng độ cao đó (e đầu của con = tâm mẹ / r con). (6) Rễ sau gặp rễ trước (khác mẹ) ở đoạn còn lộ thì vắt qua bên trên (2 ống chạm nhau, nhô dần
  ±0,5) — đoạn đã chìm thì luồn dưới. Bản trước (rễ bắt đầu cách tâm 0,95, lặn ngẫu nhiên rồi trồi, chui dưới đá) ⇒ nhiều khúc rời lơ lửng.
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
- Bê con (G 17/10 "mở rộng chuồng bò cho thêm bò con", cows-hut.js): 2 bê (`cow(k)` thu 0,5 so với mẹ, đầu ×1,22, giấu `udder`) đẩy vào CHUNG mảng
  `cows` ⇒ có va chạm, về chuồng (`cowHome`), dáng (`cowPose`), cùng `cowRig` (bộ chân dùng chung). Chuồng dựng theo `n = cows.length` ⇒ tự rộng thêm
  (4 → 6 ô, 6 → 9 m; máng nước, kiện rơm, hộp tổ vách tây theo `cowHut.W`); ô bê sát ô mẹ (gán `stall` theo thứ tự mẹ → bê). Bê ra khỏi chuồng thì về
  bãi của mẹ (cow-routing.js dùng `homeField` của mẹ). Hành vi bê `calfFree` (thay `cowFreeTick` khi `c.dam`): theo mẹ (chỗ cạnh hông–sau, xa > 4 m
  thì nước kiệu) · tập gặm khi mẹ gặm · nằm sát mẹ (mẹ nằm ⇒ 75%) · BÚ khi `milk` ≥ 1 (đói sữa ~15 phút cảnh, bú 2–4 phút): tới hông sau của mẹ, đứng
  song song NGƯỢC CHIỀU, đầu ngoảnh vào bầu vú, húc lên từng đợt, đuôi ngoe nguẩy (`ps.swat` ngắn), bỏ va chạm với mẹ (`col.ghost`, `cowUnstick` bỏ
  qua); mẹ đứng yên ngoảnh lại ngửi con (đầu cổ chiều về bê: `hx` = −0,85·sign(z cục bộ của bê)) · CHƠI (chiều 15–18:30 hay hơn): chạy vòng quanh mẹ
  + nhảy hất chân sau (`c.buck` → `cowPose`: mông bật 0,1, chúc 0,38). `cowNear` không bắt chước bê. Quy ước hướng cổ: `hx` > 0 quay đầu về −z cục bộ.
- Cò (`animals/storks.js`): lưới đỉnh GLB ⇒ chân biến dạng theo **2 đoạn cứng** (`storkLegSolve`: hông → khớp cổ chân gập RA SAU → bàn), mọi dáng
  (đứng, đậu cành, chùn khi đáp) đi qua IK; `storkWalk`: bàn chân trụ cố định khi lội / chạy lấy đà, thân hạ 5 đv khi đi, **gật đầu kiểu chim**
  (đẩy 35% / giữ 65% mỗi bước, đầu đứng yên trong không gian lúc giữ — Necker 2007), mỗi bước đặt chân → gợn nước.
- Cò kiếm ăn dưới nước (`wade`, storks.js, G 17/10 "research about 3 con cò behavior, then improve their movements"): máy pha `b.fg` theo chiến
  thuật chim lội "đi chậm – đứng rình" (Kushlan 1976; cò trắng — Cramp & Simmons): walk (vài bước ~0,35 m/s) → wait (đứng im 1,5–5 s, cổ vươn chúc
  nhìn nước) → strike (lao mỏ 0,18 s · giữ 0,22 s · rút 0,45 s; trúng 1/3) → swallow (ngửa mỏ, hất đầu 2 lần, cá biến mất) · rest 25–65 s mỗi
  1–2,5 phút: ĐỨNG 1 CHÂN (`b.oneLeg` → `poseStandingStork`: chân phải đích (−15, −9) — bàn chân gập NGƯỢC lên sát bụng, cao hơn khớp; đích −36 cũ
  cho cẳng chĩa xuống như đang bước), rụt cổ (sleep 0,42), rỉa lông từng đợt 3,5 s (sleep dao động 0,6–0,82), duỗi cánh 1 lần (wingSpread 0,55).
  Trong lúc lội `b.footMix = 0` (không lẫn độ lệch chân đậu cành khi sleep > 0). Cất cánh chỉ khi đang walk / wait và đã hạ chân. Thử: scratchpad
  `storktest.js` (`skTrace`, `skShots` — góc ngang th = −yaw, cắt vật chắn `snap(400 − 2,2)`).
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
  chân chim, gần ngang (|dy| < 0,6), giữa tán, xếp gần thân trước; điểm = mặt trên cành (recTree: điểm giữa thật trên ống cong `segs[8–10]`).
  Đo: chân chim cách trục cành = bán kính (sai ≤ 1,2 cm; recTree từ 17/10 TB 0,2 cm).
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
- Chất liệu công trình + vỏ cây (`core/surface-style.js`, G 17/10 học 2 GLB "Inakaya" + "Forest House"): `surfaceStyle(mat, kind)` nối thêm vào
  `onBeforeCompile` (kind: concrete · stucco · boards · woodAO · bark) — shader thủ tục theo toạ độ thế giới: loang tông lớn, mạch cốp pha + ố + vệt
  chảy + rêu chân (bê tông), lốm đốm + vệt nước mưa (vữa), mạch ván + tông từng tấm + thớ (ván), CHÂN TƯỜNG TỐI + ÁM NÂU theo độ cao trên mặt đất
  (ẢNH ĐỘ CAO ĐỊA HÌNH GX × GZ float dựng 1 lần từ cowY ⇒ 1 vật liệu dùng chung nhiều nhà vẫn đúng chân từng nhà), bump theo đạo hàm màn hình.
  Vỏ cây đọc thuộc tính `aBk` = (quanh thân 0–bm, dọc thân m, bm): `taperTube` (cây rừng, 2 thành phần ⇒ bm = 1) nhân đôi cột đường may + pháp
  tuyến theo bán kính, `barkTubes` (bm = số lần lặp 12 rãnh ≈ chu vi thật / 0,9 m ⇒ thân cổ thụ ~120 rãnh như thật; cành con ở ngọn dùng bm của mẹ),
  `bkAttr(geo, L)` cho khúc gỗ — rãnh nứt dọc = đường đồng mức của nhiễu kéo dài theo thân (2 lớp), nứt ngang chia mảng, địa y đốm tròn, rêu gốc;
  nhiễu quanh thân TUẦN HOÀN (`sfNw`, chu kỳ 12·bm ô) ⇒ không lộ đường may. **Bẫy**: shader gió THAY `#include <project_vertex>` ⇒ chèn vị trí ở `fog_vertex`, lấy ngược từ mvPosition; `windShader` GHI ĐÈ
  onBeforeCompile (không nối) ⇒ gọi surfaceStyle SAU windShader; khoá chương trình nối khoá cũ (`|sf` + kind). Vật liệu có shader riêng không gộp lượt vẽ.
- Drone đồ chơi (`engineer/drone.js`, G 17/10): drone + tay cầm là MẪU GLB dùng nguyên — "DJI Mini 3 Drone with Remote Controller" (Marco Workspace,
  CC-BY-4.0), G "lấy 100% ra sử dụng, ko phải vẽ lại" ⇒ ngoại lệ đầu tiên của luật "mọi vật dựng bằng code" (sau đó: xe Transit 18/10, xem mục xe nhà). Tệp `src/models/dji-mini3.glb` (build.py chép
  nguyên byte sang `models/`, trần `MODELS_KB` 1500 → 2200 từ 18/10, không tính vào ngân sách gzip); trang nạp SAU khi cảnh chạy bằng GLTFLoader + MeshoptDecoder (esm.sh
  three@0.160.0), địa chỉ tuyệt đối Pages (bản một tệp / Wix cũng nạp được), bản debug đặt `window.__droneGlb`. Mẫu gốc 27 MB, 433k tam giác, 1 lưới liền
  ⇒ đã xử lý 1 lần (không có trong repo): tách phần theo vùng nối + màu (thân drone · 4 cánh quanh đúng trục mô-tơ (PCA lá cánh) · thân tay cầm · 2 cần ·
  ô màn), giảm lưới meshoptimizer, lượng tử hoá KHR_mesh_quantization + nén EXT_meshopt_compression, ảnh JPEG 1024/512 (chất lượng 0,88) ⇒ 1,4 MB.
  Giảm lưới (G 17/10 "remote control sao nhìn xấu thế" — bản đầu 13k tam giác cho tay cầm, chỉ xét hình học ⇒ mặt méo cục, ảnh vân bị kéo nhoè, cần
  méo): tay cầm 136k → 40k và thân drone 296k → 39k bằng `simplifyWithAttributes` (trọng số u, v = 1, pháp tuyến 0,3; cần `useExperimentalFeatures`)
  ⇒ gần như không phân biệt với mẫu gốc; 2 cần giữ nguyên lưới gốc (2,35k mỗi cần); cánh quạt ~3k (giữ UV). Ảnh vân gốc chỉ 1024 px ⇒ nhoè là do
  lưới, không phải do ảnh. Cây nút: `Drone` {DroneBody, PropFL/FR/RL/RR (trục y = trục mô-tơ, `userData.r`), Camera} và `RC` {RCBody, StickL, StickR (gốc = chân cần),
  Screen (`userData.w/h` ô màn 0,1248 × 0,0521 m)}; đơn vị m, drone mũi +z gốc đáy càng; tay cầm DJI RC: 2 CẦN Ở TRÊN, MÀN Ở DƯỚI (ảnh núi trên màn
  gốc chỉ đứng thẳng theo chiều này) — mặt +Y, phía cần −Z (xa người cầm), phía màn +Z, PHẢI người cầm = +X (StickL = cần trái: ga + xoay Mode 2).
  **Bẫy** (bản 17/10 tối): suy chiều tay cầm theo "màn ở trên" ⇒ lộn ngược ở khung, trong tay, trên bàn và cần nghiêng sai bên. `attach()`: hạ kim loại 0,25 (cảnh không có ảnh môi trường), noBatch, cánh quay trong nhóm con,
  đĩa mờ + đèn tự thêm, gimbal tại nút Camera, màn sống `ScreenLive` (rt 768 × 320 = tỉ lệ màn, ống kính ~82° ngang) phủ ô Screen. Càng không gập
  (`setFold` chỉ giữ nhịp). Mẫu chưa nạp / lỗi mạng ⇒ `update()` trả true ngay (bỏ lượt bay hôm đó).
  Việc `drone` 15:20 (once; mưa ⇒ trú hiên, gió > 9 m/s ⇒ nghỉ; xong sớm ⇒ `rest` tới 16:00). Máy trạng thái `D.st`: toTable → grab → carry → place
  (ngồi xổm) → back (lùi 2,8 m) → ready (bật máy, chờ vệ tinh) → arm (CSC) → flying → land → fetch → pick → home → park. Lộ trình (`plan()`, mỗi điểm có
  `name` hiện trên OSD): cất 1,2 m → 12 m → lên thẳng 40 m (đồi cao nhất y 31, mây ~82) → 1 VÒNG QUANH ĐẢO (G 17/10 "drone bay 1 vòng quanh land")
  → về điểm nhà ở 40 m → xuống thẳng 14 m → 1,2 m → hạ; cả chuyến ~172 s. Vòng quanh đảo = `rimPath()`: hình chữ nhật đảo (hộp bao `terrainMeshes`,
  x ±122,4 · z ±110,4) nở ra m = 18 m — 4 cạnh thẳng + 4 góc cung tròn, tham số theo độ dài cung (1.044 m, luôn cách mép đúng 18 m); BAY NGOÀI MÉP vì 6
  tua-bin đứng sát mép bắc (đỉnh cánh y 60–72, cánh thò ra ngoài mép ~5 m) ⇒ đo khe hở cánh ≥ 12 m. Điểm dẫn chạy dọc đường với v = 10 m/s (chế độ
  thường của Mini 3) khi drone bám kịp (≤ 20 m; bám ổn định cách ~14 m), nhập vòng ở điểm gần nhất (`near`), xong khi đi đủ `tot`; mặt + camera hướng
  tâm đảo (kiểu POI) ⇒ lúc ra mép là cú lùi xa, màn tay cầm thấy cả đảo xoay dần. Bay: vận tốc mong muốn → gia tốc ≤ 3 m/s² → nghiêng thân theo gia
  tốc + vào gió, yaw ≤ 1,2 rad/s, gimbal bù nghiêng; cần Mode 2 suy từ lệnh (`stickPose`).
  Nhãn chỉ drone (`tagUpdate()` đầu `render()`, G 17/10 "leader line và label chỉ xuống trên drone"): `addLabel` của cảnh (chữ động "Drone DJI Mini 3 ·
  40 m" = độ cao so với điểm nhà) + đường dẫn xuống tâm thân + vòng tròn đánh dấu (chỉ khi drone < 14 px), nhưng CỠ CỐ ĐỊNH TRÊN MÀN HÌNH (thẻ 24 px,
  đường dẫn 60 px — đổi theo `(camera.right − camera.left) / camera.zoom / W()`); hiện từ lúc drone nằm trên cỏ tới lúc nhặt lên; nằm trong `labelGroup`
  (nút "Nhãn" tắt cùng). Tạo ở lần cần đầu tiên vì labels-controls.js chạy SAU drone.js (`labelGroup` còn TDZ lúc dựng).
  Ảnh camera: `rt` vẽ trong `droneToy.render()` NGAY TRƯỚC lượt vẽ chính (main-loop-rest), 1/3 khung (cảm ứng 1/5), chỉ khi 1 trong 2 màn (khung trên đầu · tay cầm trong tay) nằm trong khung nhìn và cao ≥ 40 px (bản đầu chỉ xét khung ⇒ zoom thẳng vào tay kỹ sư thì màn tay cầm đứng hình / đen); tắt
  shadowMap.autoUpdate trong lượt đó, ẩn khung trên đầu (`bub`) + drone + tay cầm (màn tay cầm đọc chính `rt` ⇒ vòng lặp khung) + `labelGroup` (ống kính thật
  không thấy nhãn; nhãn vẽ đè mọi thứ nên lọt vào ảnh).
  KHUNG TAY CẦM trên đầu kỹ sư khi bay (G 17/10: lúc đầu khung nằm trong bong bóng suy nghĩ; sau đó "remove bong bóng thought… chỉ để remote control
  frame, x2 bigger" ⇒ bỏ mây + 3 chấm, khung to gấp đôi): bản sao nút RC (ẩn màn sống) trong cảnh riêng `fScene` (đèn bán cầu + nắng), camera trực
  giao úp mặt (rotation (π/2, 0, 0) ⇒ phải người cầm sang phải ảnh, phía cần lên trên) + ảnh môi trường phòng studio (RoomEnvironment → PMREM,
  CHỈ cho `fScene`; đèn bán cầu + nắng 1,2) ⇒ nhựa trắng sạch, cần / nút ánh kim nhẹ, vẽ vào `frameRT` 1024 × 678 MSAA (cảm ứng 2 mẫu) nền trong
  suốt (premultipliedAlpha) bằng `renderFrame()` cùng nhịp ảnh camera — 2 cần trong khung nghiêng theo lệnh · ảnh camera (`rt` 768 × 320) + OSD
  (canvas 1024 × 428, vẽ ở toạ độ 512 × 214 với setTransform ×2) đặt đúng ô màn trong khung (`fOff`) · rộng màn = 4 × màn laptop thế giới (khung
  ~2,0 × 1,33 đv, kỹ sư cao ~3,5 đv); đáy khung cách đỉnh mũ ~0,25. `frameDirty`: khung vẽ ngay lần đầu hiện, KHÔNG chờ luật 50 px (bẫy bản có mây:
  zoom vừa phải thì khung trống, chỉ thấy mây). Bong bóng thời tiết cũ (`checkBubbleSprite`) ẩn suốt pha drone.
  Chỗ để trên bàn (`tableLay()`, TOẠ ĐỘ BÀN: x dọc bàn, z ngang, ghế cắm trại phía +z đầu tây): drone (càng mở ~0,42 × 0,44 m) nửa ĐÔNG (0,2; −0,01),
  tay cầm ngửa góc tây mép −z (−0,2; −0,19); ca nấu (−0,3; 0,03), chảo (−0,12; 0,06, cán về phía ghế), gói khoai tây (−0,25; 0,2) ở nửa tây gần ghế
  (đã đo hộp bao từng món trong toạ độ bàn: không chồng nhau, không thò mép). `restOn(o, y)`: ĐÁY LƯỚI THẬT (`Box3.setFromObject(o, true)`) chạm mặt bàn
  (nhóm rỗng thì bỏ qua). Lấy / cất: vai cao hơn mặt bàn ~0,73 m mà tay dài 0,57 m, vòng né bàn (ENG_PROPS r 0,66 + 0,32) giữ người cách tâm bàn
  ~0,85 m ⇒ `tableReach()`: bước sát tới (0; −W/2 − 0,32) rồi gập eo (`e.lean` 0,65 → lớp tư thế gập ở eo ~0,7 rad), với tới MÉP VẬT phía người
  (`nearPt`) — đo sai lệch cổ tay ≤ 1 mm. Xách khi đi (`hold` → `placeHeld()` ở ĐẦU `render()`): drone tay trái dựng đứng bụng quay vào đùi, tay cầm
  tay phải nắm đầu phải buông dọc thân. **Bẫy**: đặt vật theo cổ tay ngay trong `update()` ⇒ lệch ~0,4 m (lúc đó tay còn ở dáng đầu khung; đung đưa
  + IK chạy sau) — phải đặt sau khi tư thế cuối khung xong. Bàn trà (`campTable`) 0,825 × 0,6 × 0,5625 m, ghi `userData.top` / `size`.
- Kỹ sư làm việc trên laptop (`engineer/laptop-work.js`, G 17/10 "research about engineer using laptop: behaviour, motion, movement"): việc nhỏ
  `type` (2 tay trên bàn phím, nảy 4–7 Hz lệch pha, đợt gõ 4,4 s, với Enter mượt) · `read` (kê cổ tay, có lúc sang trackpad cuộn) · `point` (rê + nhấn
  trackpad) · `think` (chống cằm, nhìn đi chỗ khác) · `rest` (đan tay sau gáy: đường cong kê cổ tay → cạnh thái dương → sau gáy, khuỷu dang) ·
  `stretch` (~7 phút, FK từ đúng tư thế tay trên máy) · uống coke (~3 phút, CHỈ khi 2 tay đang trên máy). Tay = IK lên điểm thật của MacBook
  (`lapPt`, toạ độ MBP: +x phải người ngồi, +z về phía người); bàn tay chữ C dọc cẳng tay, xoay quanh cẳng tay cho miệng chữ C úp vào trong – xuống
  (`lapHandQ` → `e.handQ`), nâng tâm tay bằng điểm thấp nhất của lưới tay (`lapClawLow`, 153 đỉnh) ⇒ móng vừa chạm mặt phím. Laptop dời ra cách mép
  bàn ~4 cm (bản cũ: vai cách hàng phím 0,62 m > tầm tay 0,57 m). Hết giờ / bấm "Chơi": `lapDone` (stDesk) uống nốt ngụm, hạ tay về kê cổ tay rồi
  mới nhích ghế. Đo (scratchpad `lapwork.js`: `lwGallery`, `lwRun`): sai lệch IK 0 cm, 10 phút tay ≤ 1,7 m/s, không NaN.
- Ghế văn phòng + bảng ghim + ghi chú (G 17/10 "macbook 30% bigger, add wall board và office chair, research how office chair work…"): dựng bằng code
  theo GLB "60's Office Props" (SeanNicolas, CC-BY-NC, chỉ đo). Ghế (van/caravan.js): chân sao 5 nhánh + bánh, ben hơi, mâm XOAY, lưng NGẢ (nhóm
  `studyChairRig.base / swivel / back`, mỗi nhóm gộp lưới riêng); mặt đệm giữ cao 0,4875 đv. `studyChairAt(off, sx, sw)` (engineer/schedule.js) lăn
  dọc (off) / ngang (sx) + xoay (sw) và CẬP NHẬT `STUDY_SEAT.pos / yaw / fx fz xx xz` ⇒ người xoay, lăn theo ghế. Lưng ngả theo `e.seatLean` < 0,
  nghĩ / đọc thì xoay nhẹ qua lại. Bảng bần 0,72 × 0,5 đv treo vách phòng tắm (x 2,86 đv xe) giữa bàn và cửa lùa, mép dưới hơn mặt bàn 9 cm.
  Việc nhỏ `note` (laptop-work.js, ~8%, 9,4 s): viết giấy dán bên phải laptop (tay phải) → xoay ghế −0,95 rad + lăn 0,17 đv (đầu gối không chạm
  chân bàn / vách) → ghim (tay phải tới `studyBoard.slots`, ấn 1,5 cm, giấy hiện + đinh) → đọc lướt → lăn, xoay về; mỗi bước tay đi mượt 0,7 s từ
  chỗ đang ở (bản đầu nhảy đích ⇒ tay 19 m/s). Laptop × `LAP_K` 1,3 (drone.js chia lại để khung tay cầm giữ cỡ). **Bẫy**: tập giấy tĩnh bị GỘP LƯỢT
  VẼ ⇒ rời cây cảnh, `getWorldPosition` trả toạ độ xe — lưu `padP` (toạ độ xe) rồi `caravanObj.localToWorld`; ma trận nhóm ghế cũ khi chạy không vẽ
  (noRender) ⇒ `updateWorldMatrix` trước khi đọc. Đo: IK 0 cm, tay ≤ 1,35 m/s, không NaN.
- Nút "▶ Chơi" drone (G 17/10 "click to the drone/rc to select play then engineer will come and use drone"): bấm drone / tay cầm (khi nằm trên bàn)
  ⇒ bảng `#toolPop` (page.html, xử lý ở ui/xray-lifecycle.js — danh sách `TOOLS`, chung kiểu `.panel`); chặn kèm lý do: ngủ 21–6 h, mưa, gió > 9 m/s, đang bay, mẫu chưa
  tải. Bấm Chơi ⇒ `engForceAct = 'drone'` (engineer/schedule.js, `engWantAct` trả 'drone' trước lịch) ⇒ đổi việc như thường (đứng dậy, ra xe, tới bàn
  trà, bay 1 vòng ~165 s, cất) ⇒ xong thì xoá, về lịch cũ; chỉ đánh dấu xong việc 1-lần khi đang trong khung `drone@` của lịch. Tới giờ ngủ xoá lệnh.
  Bấm drone có xe van phía sau không bật xem xuyên xe.
- Bấm giỏ táo / sào hái trái → "🍎 Hái táo" (G 17/10 "làm tương tự cho hái táo"): cùng bảng `#toolPop` (mục `TOOLS` thứ 2), `engForceAct = 'apples'`.
  Giỏ đang ở cạnh bàn trà (lượt trước) ⇒ `applePick` thêm pha `toBasket` → `liftT` (cúi xách) → `bring` (xách ra chỗ đứng hái) → `setB` (đặt bên phải)
  rồi mới cầm sào. Giỏ chứa 9 quả (3 đáy + 1 giữa + 3 sát thành + 2 chất ngọn); mỗi lượt ≤ 4 quả, `avail()` = số quả lượt tới sẽ hái. Chỉ 1 chỗ đứng
  cố định/ngày (`plan`, 6 quả trong tầm sào) ⇒ sau lịch 16:10 (4 quả) bấm thêm chỉ còn 2, rồi báo "hết táo trong tầm sào" tới 5:00 sáng.
- Cột điện (`poleAt`, world/substation-bess.js, G 17/10 "improve cột điện structure", học cột trong GLB "Inakaya"): cột bê tông thuôn Ø 0,36 → 0,2 m +
  mố + nắp đỉnh; xà 2,7 m + 2 thanh chống chéo + đai ôm; 2 pha trên sứ có tán ở 2 đầu xà, pha giữa trên sứ ĐỈNH CỘT (bản cũ: thân cột vươn qua xà, dây
  pha giữa chui qua thân); bu lông leo so le; biển cấm trèo (polygonOffset); `opts.tx` máy biến áp treo cột (cột 3, 4, 5 — có nhánh vào nhà, dây nối
  lên 2 pha). `wire()` ghi `links` ⇒ `poleGuys()` (cuối tệp, sau khi nối hết dây) thêm dây néo + ống bảo vệ vàng cho cột lệch lực (tổng hướng dây ≥ 0,7),
  neo cách 3,2 m, né nước / đường (thử lệch ±20°, ±40°). Điểm nối dây (conn) giữ nguyên. Cột 3, 5 dời ra mép đông 2 nhà (bản cũ cắm trong nền nhà ⇒
  xuyên mái); cột 5 giờ có dây vào Nhà thiết bị (`buildingTies[2]` trước bỏ trống).
- Xe nhà = FORD TRANSIT L3H2 (G 17/10 khuya, đo GLB "Ford Transit L2H2" — geyges, Sketchfab Standard; từ 18/10 vỏ code chỉ là bản tạm trước khi mẫu GLB
  nạp xong + lớp va chạm, xem mục dưới): van/transit.js dựng vỏ từ bảng số đo
  (bắn tia quanh mẫu): `TR_SEC` mặt cắt thân theo độ cao (gờ vai 1,54–1,63, khum trên vai), `TR_ROOF` đỉnh mui theo x (mui cao H2 vươn qua cabin),
  `TR_DROP` mui khum + bo góc, `TR_MUI` mũi xe đo dày (41 hàng độ cao × 25 tia, mã vật liệu từng ô ⇒ đề can bám mặt: ga-lăng bát giác + logo, đèn pha + viền LED, đèn sương mù) và `TR_WS` kính chắn gió
  + trụ A. Vách hông = 1 tấm (x, y) chia tam giác có điểm Steiner (`ShapeUtils.triangulateShape`, lỗ 1 điểm = Steiner) rồi uốn `z = trSideZ(x, y)`
  ⇒ khoét được hốc bánh, kính cabin, cửa lùa, cửa sổ nhà xe mà vẫn giữ gờ vai. Vỏ 2 lớp (lớp trong lùi T theo pháp tuyến) như vỏ cũ.
  Tỉ lệ **1,1 đv/m theo người** (kỹ sư cao 1,95 đv kể cả mũ ≈ 1,75 m; bản xe cũ to quá cỡ ~1,22). L3 = L2 + 0,45 m chèn giữa cửa lùa và hốc sau.
  Khoang: sàn `TR.yIn` 0,83 (cũ 1,07 — mọi `vanPt(…, 1.07, …)` đổi sang `TR.yIn`), trần ~2,90, lòng z ±0,98, x −0,58 → 2,99. Bố trí giữ như cũ
  nhưng gọn: bàn ăn 0,55 × 0,42 ở nửa trước ô cửa lùa · giường 2,0 × 0,84 · bàn học 0,85 · bếp giữ dài 1,82 (lấn 14 cm ô cửa) · phòng tắm ướt
  0,72 (bồn cầu gọn sát vách −z, rèm kính mờ = "cửa WC", lavabo sau vách lùi x 2,535). Lối đi giường ↔ tủ bếp chỉ ~0,52 ⇒ bàn học đổi kịch bản:
  đứng cạnh ghế (phía đầu giường) xoay ghế về mình, ngồi, xoay về bàn rồi nhích vào (`stDesk`: toSide → swing → toStand → turn → sit → swivelIn →
  scoot → work …). Vách ngang trong xe (`xWall`) cắt theo lòng xe để không thò qua vách khum / góc mui. Ổ chó trú mưa: sàn cabin giữa 2 đế ghế.
  Bẫy: cột chống bạt nằm trên đường thẳng tới `dogDoorFar` ⇒ `colSlide` trượt qua lại tại chỗ (kỹ sư kẹt ngoài xe) — bạt kéo dài ra trước x −1,15.
  Bạt (18/10, G khoanh 3 chỗ): tấm bạt từng nghiêng NGƯỢC (`rotation.x` −0,16 ⇒ mép ngoài CAO hơn — three.js xoay x dương hạ mép +z) nên hở với hộp
  cuốn lẫn thanh trước ⇒ +0,16; hộp cuốn tới −1,15 thò khỏi chỗ mui cao hạ xuống kính lái ⇒ cả bộ bạt x −0,75 … 2,9 (mép mui x −0,75 ở y 2,72 = đáy
  hộp); chân chống ngay dưới 2 đầu thanh trước, vào `obstacleCoords` (r 0,12) — giả lập 6 lần vào xe trong ngày không kẹt, cột trước cách lối ≥ 1.
  Gai lốp 192 mảnh để bộ gộp lượt vẽ tách ⇒ hiện màu trắng: `bakeStatic(wheels)` trước.
  Nét viền (line-art) vỏ code: `bakeStatic(g)` cuối caravan() gộp LineSegments không phân vai trò ⇒ nét của vỏ code từng bị kéo ra khỏi nhóm vỏ, còn
  hiện thành các đường kẻ ngang vô nghĩa trên thân GLB sau khi vỏ code bị ẩn (G 18/10) ⇒ `shell.userData.noBake = true` ngay sau `bakeStatic(shell)`.
- Xe nhà dùng NGUYÊN MẪU GLB (G 18/10 "nếu xe van copy đc thì mang vào luôn khỏi vẽ lại rồi modified"): `src/models/transit.bin` = "Ford Transit L2H2"
  (geyges, Sketchfab Standard) đã sửa bằng `src/tools/transit/` (chạy trong trang study.html, xem README ở đó): giữ vỏ ngoài + cabin, bỏ khoang hàng +
  băng ghế đôi; đổi đv xe X = 0,0272 − 1,1·z (z < −0,1 dời −0,45 m), Y = 0,1128 + 1,1·y + 0,06·smoothstep(1,9, 2,4, y), **Z = −1,1·x** (LẬT: mẫu tay lái
  thuận, xe mình tay lái nghịch kiểu Úc — đảo thứ tự đỉnh; logo Ford, chữ TRANSIT, logo vô-lăng lật lại quanh tâm của chúng cho đọc đúng). L3 chèn
  GIỮA Ô CỬA LÙA (z = −0,1): ô cửa của mẫu chỉ 0,95 m (X −0,655 … 0,39) ⇒ thành 1,40 m (X −0,655 … 0,885) khớp `TR.door` của nội thất; cửa lùa kéo
  dài cùng nhát cắt, đặt thế mở (+1,63 X, ra ngoài 8,5 cm; mép gập trong lấn vào vỏ / ray / ốp / lốp thì ép phẳng). Cửa sổ nhà xe khoét thẳng vào vỏ
  ngoài + vỏ trong (`cutHoles`: tam giác ∖ đa giác lồi = các mảnh nửa mặt phẳng) + kính, viền cao su, má cửa. **Theo khung xe** (G 18/10 "rebuild lại glass
  window theo frame của xe"): vỏ ngoài 'body' của mẫu panel van có sẵn 2 ô dập của bản Kombi ở vách −z — vòng biên mảnh dập (cạnh biên, không phải gờ gấp;
  vẽ cạnh mặt hông ra mặt phẳng (z, y) mới thấy): ô sau cột C → cột D (z −0,42 … −2,02, y 1,42–1,47 … 2,16–2,18, góc dưới-sau vát (−1,79, 1,47) → (−2,02, 1,66)),
  ô trước cột B → cột C (z −0,42 … 0,55, y 1,39–1,42 … 2,13–2,16, góc trên-trước cắt (0,47, 2,13) → (0,52, 2,08)); 2 ô chung đường nối z −0,42 ⇒ chừa dải cột
  2 × 3 cm; `fillet` bo góc 7 cm; đổi sang đv xe qua MX/MY ⇒ ô sau X 1,02 … 2,74, ô trước X −0,57 … 0,95, Y ~1,64 … 2,54. Ô sau phủ cả phòng tắm ⇒ kính cắt ở
  vách tắm X 2,27, phần sau kính mờ (`windowParts(..., split)`). Kính PHẲNG (mặt phẳng bình phương nhỏ nhất qua mép lỗ, lùi thêm chỗ mặt phẳng nhô ra ngoài vỏ — lệch ≤ 1,5 cm): kính quạt theo mặt vỏ cong làm tam giác gãy góc ⇒ nét viền (EdgesGeometry 30°) vẽ thành vệt toả từ tâm kính (G 18/10 "remove những chi tiết thừa"). Lòng ô kính sạch (`clearIn`): bỏ mọi mảnh vỏ còn lại có tâm trong ô và trong chiều dày vách (|Z| > 0,7) — gờ / mép / khung ô cũ của vỏ trong 'boot_side' không hướng ra ngoài nên cutHoles không cắt, nhìn qua kính thành khung bo góc mờ (G "remove các frame cũ này để kính đc trong hơn"; bỏ 347 mảnh boot_side + 41 body + 50 cửa lùa). Cửa lùa: không có ô dập ở mặt ngoài; kính theo ô khung trong của cửa (z −0,26 … 0,60), cao bằng
  ô đối diện (y 1,42 … 2,15). Vách +z không khoét (cửa lùa GLB dài 1,74 mở ra che đoạn X 0,9 … 2,65). Trước đó: 3 ô bo tròn tự đặt trên giường / bàn / phòng tắm. 1 ghế lái dùng 2 lần (ghế phụ = nút scale z −1), 1 bánh dùng 4 lần (quay π, không lật),
  bánh ×1,096 cho lốp chạm đất khi tâm Y 0,44 (gầm nâng như vỏ code). Hàn đỉnh → giảm lưới meshoptimizer (khoá mép, sai số tuyệt đối 0,8–1,2 mm, lốp
  4 mm) → lượng tử hoá + meshopt → GLB → **XOR dòng xorshift32** (như cat.bin của Hidden Library: giấy phép Standard không cho để mẫu thành 1 tệp mở
  được) ⇒ 77k tam giác (chạy 115k sau khi nhân ghế, bánh, cửa trước), 548 KB. Chạy (`transitGlb`, **van/transit-glb.js** — tách khỏi van/transit.js 18/10,
  transit.js còn vỏ code): nạp SAU khi cảnh chạy (địa chỉ tuyệt đối Pages,
  bản debug `window.__vanBin`), bỏ XOR, GLTFLoader + MeshoptDecoder, nướng ma trận nút vào hình (nút lật ⇒ đảo đỉnh), gộp theo (vai trò xem xuyên,
  lớp vật liệu) ⇒ 25 lượt vẽ; dùng vật liệu vỏ code (`M.body` kem bán trong suốt cho khoang ở; mũi + 2 cửa cabin lớp `paintO` sơn đục — bán trong
  suốt làm lộ ruột khoang máy thành vệt loang). Nạp xong ẩn nhóm vỏ code / Táp-lô / Nội thất cabin / Bánh xe; giữ thảm sàn cabin (nhóm cab), biển số
  Jade (nhóm riêng noBake, biển sau dời ra cửa sau GLB X 3,174), thang leo nóc (nhóm noBake, +0,105). `xrayAdopt()` (ui/xray-lifecycle.js) đưa vỏ GLB
  vào danh sách xem xuyên. Vỏ code giữ làm bản tạm trước khi nạp + làm lớp va chạm (core/collide.js đọc lúc khởi động — cùng số đo). **Bẫy**:
  `bakeStatic(g)` cuối caravan() gộp xuyên nhóm theo vật liệu ⇒ nhóm nào cần dời / ẩn riêng về sau phải `userData.noBake`.
  Động cơ (18/10, G "research about new glb và apply van engine to the model"): `src/models/engine.glb` = "Nelson Racing Engine B" (Rudy, CC-BY-4.0;
  lưới quét AI 1,9 triệu tam giác + màu đỉnh, 20 khúc chia theo giới hạn 65k đỉnh — không phải bộ phận) → gộp, hàn theo vị trí, `simplifyWithAttributes`
  (màu ×0,05, pháp tuyến ×0,02 — trọng số màu cao thì giảm không nổi; cần `MS.useExperimentalFeatures = true`) → 36k tam giác, sai lệch ~1,4 cm, 235 KB
  (src/tools/engine/). Nạp ngay sau vỏ GLB (cùng GLTFLoader), `engine()` thêm vào nhóm 'keep' (thấy khi xem xuyên; mũi sơn đục che lúc thường):
  Đặt DỌC, quay −90° quanh Y, `ENG_AT` (x −2,64, đáy cacte y 0,55, tỉ lệ 0,902 đv/đv mẫu = 0,82 thật) — X −2,98 … −2,30, rộng ±0,44, nắp máy 1,18.
  Mẫu là **V6 60°** (mỗi hàng 3 cổ xả / bugi, nắp xupap x ±0,15 y 0,52 ⇒ trục khuỷu y 0,18, hàng ±30°) — chú thích cũ gọi V8 là nhầm.
  **Máy chạy** (`van/engine-run.js`, G 18/10 "khi click vào engine thì engine running animation, 75% engine transparent để nhìn thấy v6 engine"):
  `engineClick(hits)` (gọi trong pointerup của xray-lifecycle trước khi bật xem xuyên) — tia bỏ qua mặt vỏ ('shell') + nét viền, chạm động cơ trước nội
  thất ⇒ `engineToggle()`: đề máy kèm TỰ XEM XUYÊN (tắt máy thì trả lại nếu do máy bật), vỏ máy mờ còn 25%, hiện cơ cấu dựng bằng code TRONG toạ độ mẫu
  (con của nhóm mẫu ⇒ theo đúng góc / tỉ lệ): trục khuỷu 6 chốt lệch 60° (`ψ = β − θnổ`, nổ đều 120°, thứ tự 1-2-3-4-5-6), piston + tay biên theo
  `s = r cos a + √(l² − r² sin² a)` (r 43 mm, l 150 mm), 2 trục cam ½ tốc độ, 12 xupap theo kỳ (xả 170–370°, nạp 350–550° của chu kỳ 720°),
  ống lót mờ, bánh đà + puli có vạch, chớp lửa nổ 55° sau điểm chết trên kỳ nổ; InstancedMesh cho piston / tay biên / lửa / xupap. Quay chậm để mắt theo
  kịp: đề 1,4 vòng/s → nổ → 5 → 3 vòng/s; tắt: giảm dần. Rung theo nhịp nổ (3 lần / vòng). `engineTick(dt, t)` cuối main-loop-rest.
  **Nét viền xe GLB** (G 18/10 "bring back van border art line 100% visible"): `edge(mesh, geo, lineDark)` cho các lớp `LINE_CLS` (sơn, nhựa đen,
  kính, đèn, mạ) — con của mặt vỏ nên còn khi xem xuyên (~29k đoạn). **Xem xuyên** (ui/xray-lifecycle.js) đổi từ ẩn hẳn sang mặt vỏ còn 25% (`xrayOf`:
  1 bản mờ / vật liệu) + nét viền 100%; vỏ trong khoang hàng (lớp `paintIn` = boot_side + boot_roof, `userData.xrayHide`) ẩn hẳn ⇒ nội thất rõ 100%.
  **Cửa trước + ca-pô bấm mở** (G 18/10 "các điểm này là các nút, hover thì white border outline, click vào cửa thì cửa mở, click vào logo ford thì nắp
  capo mở, tất cả rất nhịp nhàng"): vanbuild tách cửa 13 (cửa lái −Z, có ổ khoá; cửa 14 bỏ — cửa phụ = ảnh gương, như ghế) + tay nắm ngoài `Object_37`,
  ca-pô (hood + 2 khe gió Gird01/Gird02 + detal9), logo (Ford + Blue03 + Logo_base). Bản lề: cửa = trục đứng 3,5 cm sau mép trước, ngoài da cửa 6 mm
  (X −1,975, Z ∓1,121 — mở không cắt mép vè); ca-pô = trục ngang 1 cm sau mép sau, 2,5 cm dưới đỉnh (X −2,30, Y 1,614). Lưới bộ phận ghi theo toạ độ
  từ bản lề; nút GLB `FrontDoorR/L` (extras.pivot 'door', L = scale z −1), `Hood` (pivot 'hood'), nút bấm `HandleR/L` (con của cửa, extras.btn = tên
  cửa), `Logo` (btn 'Hood'). `attach()` gộp theo (bản lề, nút bấm, vai trò, lớp) ⇒ nhóm đặt ở bản lề, nút bấm lồng trong ⇒ `vanPartsInit()`.
  **van/van-doors.js**: bộ phận + lò xo; rê chuột / bấm qua bộ chọn chung **ui/hover-select.js** (xem gạch dưới). Bấm tay nắm / logo (`hovClick` đầu pointerup):
  lò xo tắt dần a'' = w²(đích − a) − 2zw·a' (240 bước/s): cửa — tay nắm bật 7 mm, sau 0,12 s đích 66° (w 5,2, z 0,72 ⇒ lố 68,4° rồi về, như dây hãm);
  đóng đích −0,15 rad ⇒ chạm khung còn đà, nảy 22% rồi lò xo êm về 0. Ca-pô — logo lún 4 mm, bật chốt 3° (w 15), sau 0,48 s nâng 52° (w 3,5, z 0,92 ⇒
  ~1,9 s, không lố); đóng đích −0,12. `vanPartsTick(dt)` trước renderer.render (loop/main-loop-rest.js). Kỹ sư đang kiểm tra máy thì logo không nhận bấm.
  **Rê chuột = chọn** (ui/hover-select.js, G 18/10 "hover over the engine then white border line select … drone, remote, giỏ táo, tool, cần câu, laptop, kitchen,
  chiminea"): `hovAdd(root, { on, n, click, skip, pad })` — tay nắm 2 cửa, logo, động cơ, drone, tay cầm, giỏ, sào, cần câu (đất + tay), chiminea; laptop + bếp chỉ
  khi xem xuyên; động cơ khi xem xuyên hoặc ca-pô mở > 17° (`engineSeen`). Dò = tia × hộp bao trong hệ của vật (đo lại ≤ 1 lần/giây — vật cử động, GLB nạp sau),
  nhiều hộp trúng thì vật NHỎ nhất (laptop nằm trong hộp to của bếp), `n` bỏ nút quay lưng camera. Viền: mỗi lưới thêm 3 con dùng chung hình (tạo lần rê đầu):
  mặt nạ stencil (MeshBasic colorWrite false, Replace, polygonOffset) + quầng tối 4,5 px α 0,42 + viền trắng 3 px (ShaderMaterial: dời đỉnh uPx điểm ảnh ra xa
  đoạn trục dọc vật uA–uB — toạ độ thế giới, đổi mỗi khung; stencil NotEqual; renderOrder 1e6+). **Bẫy**: viền bỏ kiểm độ sâu thì vật che phía trước (cỏ trước
  giỏ, ấm trước tay cầm, NÉT VIỀN vỏ xe trước động cơ — LineSegments ghi độ sâu) thành vệt trắng hình vật che ⇒ kiểm độ sâu nhưng nhích đỉnh 6 cm về phía
  camera (`m.z += 0.06` hệ nhìn) — vẫn đè được mặt sát nút (nan ga-lăng quanh logo). Mảnh gộp lượt vẽ (lớp ẩn 31) có con ở lớp 0 nên viền vẫn hiện; con
  `hovFx/pickSkip/noBatch/xray 'ui'`, raycast rỗng. Bỏ lưới cộng sáng (lửa), vô hình, InstancedMesh; động cơ chỉ viền vỏ máy (`skip` khác engineMat).
  **Vùng rê lớn hơn nút** (G 18/10 "hover lên cánh cửa thì tay cầm show white border line, hover tới nắp capo thì show logo white border line và đèn led
  sáng"): `hovAdd(root, { picks: [{o, n, on}] })` — mỗi vùng có hộp bao riêng trong hệ của nó, hướng mặt ngoài n theo hệ của chính vùng (cửa mở thì quay theo);
  viền vẫn vẽ ở root. Tay nắm: vùng = tay nắm + cả cánh cửa; logo: vùng = logo + nắp ca-pô khi đang đóng (n chếch lên–ra trước, bỏ khi nhìn từ đuôi xe). Bấm vào
  vùng nào cũng mở / đóng. **Dải LED chạy ban ngày** (G 18/10 "a thấy có sẵn thiết kế đèn led, sao em ko làm cho nó sáng"): mẫu có sẵn 2 dải trong đèn pha —
  viền chữ C `headlamplamp_glass_white1` (vật liệu bóng) + dải cong dưới `headlamplamp_glass_white2` (vật liệu kính trong — gộp chung lớp lens nên trước không sáng
  được) ⇒ vanbuild cho cả 2 lớp riêng **'drl'** (vanwrite ORDER thêm drl). transit-glb.js `ledFront`: lưới drl MeshBasic xám 0x8f979e lúc tắt; rê ca-pô / logo
  (`HOV.hover.led`) ⇒ trắng + chuỗi quầng cộng sáng nhỏ (0,12) rải dọc chính 2 dải (đỉnh cách nhau ≥ 3 cm, ≤ 30 / bên, 1 vật liệu chung) ⇒ cả dải toả sáng.
  **Bẫy**: 1 quầng to ở góc đèn thành đốm chói che chi tiết; quầng đặt ở tâm cụm đèn thì vỏ đèn che. Chú thích cuối dòng giữa 1 dòng lệnh dài sẽ nuốt phần sau.
  **Bấm động cơ** (G "click to the engine show the button start engine"): `engineClick` chỉ chặn bật/tắt xem xuyên; bảng dụng cụ (`engineTool` trong TOOLS,
  `vis: engineSeen`, objs thêm khi máy nạp) hiện "▶ Khởi động máy" → `engForceAct = 'engine'`. **Kỹ sư kiểm tra máy** (engineer/engine-check.js, pha
  'engine', ENG_ACTS.engine): đi tới đứng X −3,62 trước ba-đờ-xốc (đang ở hông xe thì nhắm góc đầu xe (−4,05, ±1,65) trước — hết lệnh góc khi X < −3,45),
  bước nốt vào chỗ → tra chìa sau logo (tay phải, Transit Mk8 mở ca-pô bằng chìa sau logo) → `vanPartToggle(hood)` → 2 tay theo mép trước ca-pô tới 35° →
  cúi 0,55 xem khoang (tay trái mép ga-lăng, tay phải dò nắp máy) 6,4 s → giơ chìa khoá điều khiển (hộp đen ở e.wrists[0]) bấm `engineToggle(true, noX)` (không
  tự xem xuyên vì ca-pô mở) → xem máy 28,3 s → bấm tắt (chạy đúng 30 s) → chờ 2,2 s → 2 tay kéo mép ca-pô xuống, buông ở ~15° (chỉ khi chính kỹ sư mở).
  Cắt ngang (mưa, ngủ, đổi việc): `engineJob.idle()` cuối loop-update (tắt máy, đóng ca-pô nếu đã mở, cất chìa). Bảng ghi chép ẩn trong pha này; 5 câu suy nghĩ
  'engine' (thoughts.js). Thử: $SP/engtest.js engJobShots (tua theo pha, máy chạy 29,93 s).
  **Tự chủ theo nhu cầu — đợt 1** (engineer/autonomy.js, G 18/10 "bảng điều khiển ngược (nếu a chủ động play) và vẫn để engineer automate … curiosity bar";
  đợt 2: phản ứng môi trường 6 ô + ngắm sao / ngắm mưa / trồng cà rốt; đợt 3: mạng nơ-ron nhỏ thay luật — dạy ≤ 5 phút / mạng). Lịch ENG_DAY vẫn là khung ngày;
  `engWantAct` (sau engForceAct) hỏi `autoWant(e, hh, sched)`: giờ RẢNH (outdoor, rest, read, music, fish) mỗi phút chấm điểm AUTO_ACTS — Σ hệ số × (1 − nhu
  cầu/100)², ±10% ngẫu nhiên, việc của lịch +0,15 giữ chỗ, ngưỡng 0,4; nhu cầu < 15 trong giờ cho phép chen (thêm nghiên cứu, trú mưa) ⇒ autoFix(k); 21:00–6:00 tắt.
  Bấm thanh nhu cầu (ui/sim-needs.js `simCommand` → `autoCommand(k)`) = việc theo lệnh (AUTO.cmd) chạy tới khi xong / hết thời lượng. Việc mới: snack (ăn nhẹ:
  trạm bàn tự bày bát ngũ cốc), pet (pha toDog → pet), explore (exploreJob: 2 điểm không qua nước — cây anh đào, trạm khí tượng mini, đèn đường, trạm biến áp, cột
  điện #1–2, xưởng bảo trì, móc hộp tổ, cột khí tượng; đứng cách vật cản gần nhất r + 1, ngẩng nhìn, đưa bảng kẹp ghi). Xong: autoDone (kế hoạch trong xe xong —
  cooking.js, hết vuốt chó, hết dạo) + lấp thêm 1 lần (vuốt chó +15 Giao tiếp, dạo +20 Tò mò, ăn nhẹ +10), nghỉ 4 phút mới chọn tiếp. Nhu cầu thứ 7 **Tò mò**
  (cạn 7/giờ; lấp: dạo khám phá 130/giờ, kiểm tra máy 60, drone 40, đọc 30, đi lại 15, hái táo 15, câu 10). Giả lập 1 ngày: 10 lần tự đổi việc, thấp nhất Đói 15.
  **Nhãn theo vật** (ui/follow-tags.js, G 18/10 "add leader và label vào engineer, racoon, con hươu"): FTAGS = kỹ sư (chữ = việc đang làm từ bảng Kỹ sư:
  SIM_DO[simDoing(e)].lab; đỉnh = đầu + 0,3), gấu mèo, hươu (đỉnh = hộp bao đo 1 lần). Như nhãn drone: addLabel(dynamic) + thẻ 34 px / đường dẫn 64 px cố định trên
  màn hình (upp = bề ngang khung trực giao / zoom / W()), ẩn theo vật (hovShown), trong labelGroup (nút "Nhãn"). **Bẫy**: addLabel đã vẽ chữ lúc tạo ⇒ phải tính
  tỉ lệ thẻ T.k ngay khi tạo, không chỉ khi chữ đổi (thiếu ⇒ thẻ co thành vạch).
  **Chú thích "Bấm vào đây"** (G 18/10 "add leader horizontal line và label (click here) vào các điểm button như logo và tay cầm"): vật chọn được có `tag: true`
  (logo, 2 tay nắm — van/van-doors.js) ⇒ `btnTagsTick`: thẻ addLabel 26 px + đường dẫn 64 px NẰM NGANG trên màn hình (trục phải của camera), thẻ phía ngược tâm xe;
  chỉ hiện khi 1 đv > ~33 px (upp < 0,03) và mặt nút (rp.n, hệ của nút) quay về camera. **Camera theo kỹ sư** (G "when click vào kỹ sư, camera will move to him"):
  nút "Kỹ sư" mở bảng ⇒ `camFollow(engObj.g)`: điểm nhìn `target` lướt 1,2 s (smoothstep), zoom ≥ 18, rồi bám theo (lerp 3/s); kéo phải / phím di chuyển / nút về
  mặc định / đóng bảng ⇒ thôi theo. `camFollowTick` trước khi vẽ (loop/main-loop-rest.js).
  **G 18/10 chiều** ("remove anteng thừa; cho ống khói nhỏ đi 30%; thay text kỹ sư = 👷🏻‍♂️"): bỏ anten roi đứng 0,6 m dựng bằng code trên nóc (van/caravan.js
  `whip`) — anten xiên còn lại là của mẫu GLB Transit. Lò chiminea: mọi lưới thêm sau thân (cổ, ống, chụp, tay cầm) gom vào nhóm `chim` thu ×0,7 (`CH`) quanh chân
  ống trên mái; miệng khói `smokeTop` + bán kính cửa hút / nắp của nguồn khói nhân theo CH. Nút "Kỹ sư" trên thanh công cụ: chữ → `<span class="tb-emoji">` 👷🏻‍♂️
  cỡ 17 px như biểu tượng; nhãn trên đầu kỹ sư cũng đổi tiền tố thành 👷🏻‍♂️. **Bẫy màu emoji trong nhãn canvas**: texture nhãn (`addLabel`) không gắn sRGB
  mà bộ vẽ xuất sRGB ⇒ mã hoá 2 lần — chữ đen không sao, nền / chấm màu hơi nhạt (giữ nguyên như cũ), emoji bạc trắng. `fillLabelText` (ui/labels-controls.js)
  vẽ riêng đoạn emoji (`\p{Extended_Pictographic}` + modifier/ZWJ) qua canvas phụ, đổi điểm ảnh sRGB → tuyến tính (bảng 256 mức) rồi mới dán ⇒ ra đúng màu.
- **Máy cắt cỏ đeo lưng + kỹ sư phát cỏ sau mưa** (G 18/10 "sau trời mưa em cho engineer grass trimming quanh chỗ camping" + mẫu GLB):
  · Mẫu "Grass Trimmer Machine" (Xorshift, CC-BY-4.0, ghi công ở dock) → `src/models/trimmer.glb` 68 KB, 4,8k tam giác (`src/tools/trimmer/`: tách 4 bộ phận
  pack / starter / shaft / blade, hàn đỉnh theo VỊ TRÍ + bỏ tam giác trùng — tay cầm vòng 2.304 tam giác là 2 lớp mặt ngược nhau, hàn theo (vị trí, pháp tuyến)
  thì mọi cạnh là biên ⇒ giảm lưới bị khoá — rồi pháp tuyến gãy 34°; bỏ ống mềm và vòng dây ga sau đầu ống; mét ×0,24; điểm cầm nắm trong extras).
  · `camp/trimmer.js` (trimKit): chỗ để phía đông đống củi (ba lô đứng, đệm lưng quay về bếp lửa; cần gác đầu sau lên mặt đống củi, lưỡi chạm cỏ). Ba lô / cần
  matrixAutoUpdate false, đặt mỗi khung SAU khi tay giải IK (`trimKit.tick` ở loop/main-loop-rest.js): ba lô trên lưng = ma trận eo × (0, 0,28, −0,165) bù tỉ lệ
  người; đeo / tháo = nội suy vị trí + slerp giữa chỗ để và lưng (packU). Ống mềm vẽ lại mỗi khung (Bézier ra khỏi máy → vào trục ống, võng 0,18 m, 16 × 6).
  Ly hợp ly tâm: ga > 0,35 lưỡi mới quay; quay nhanh ⇒ đĩa mờ + lưỡi mờ dần. Lưỡi quay thêm −0,24 rad quanh trục X cục bộ (ống cầm dốc ~45° thay vì 23,6°
  thiết kế ⇒ lưỡi gần nằm ngang). Dây giật = ống trụ 4 mm giữa lỗ dây và tay phải. Vụn cỏ 220 lá dẹt (văng trái lưỡi, cản gió, nằm trên cỏ rồi teo), khói xả 8 cụm.
  Rê chuột / bấm: hovAdd đăng ký SAU khi mẫu nạp, picks theo hộp riêng ba lô / cần (hộp chung cả bộ bị kéo về gốc toạ độ bởi dây giật đang ẩn + hộp bao cũ của
  ống mềm — **bẫy**: lưới động phải computeBoundingBox mỗi lần đổi đỉnh, lưới ẩn ở gốc phải bỏ khỏi hộp dò). Bảng "▶ Cắt cỏ" trong TOOLS (ui/xray-lifecycle.js).
  · `engineer/trim-grass.js`: TRIM.pend khi mưa ≥ 2 phút rồi tạnh; trimWant (đầu engWantAct, trước tầng tự chủ): cỏ ráo (sceneWet < 0,15 — ban ngày khô sau ~5
  phút), 6:40–17:20, chen giờ rảnh / nghiên cứu, vòng cỏ đã cắt ≥ 60% thì thôi; đang làm dở thì làm cho xong (mưa lại: tự thôi cắt, cất máy đúng quy trình).
  Quy trình: giật dây (lần 1 hắt hơi, lần 2 nổ) → quay lưng ngồi xuống xỏ quai, đứng lên → nhấc cần khỏi đống củi → các vòng quanh bếp lửa bán kính 3,5 / 4,6 /
  5,7 / 6,8 m (điểm cách 0,45 m, chừa vật cản ≥ 0,6 m + nước + chỗ không cỏ, đoạn ≥ 4 điểm, nối đoạn gần nhất) đi 0,22 m/s, chu kỳ lia 1,7 s (phải → trái sát
  đất ga lớn 1 s, nhấc nhẹ quay về 0,7 s), eo vặn ±0,42 rad + ống ±0,14 → về chỗ để, tắt máy, dựa cần, tháo ba lô, lau mồ hôi. Tay LEGO ngắn (vai → tâm tay
  0,54 m): tay ga ở toạ độ eo (−0,06, 1,58, 0,12), tay trái nắm góc trên–trái tay cầm vòng (gần nhất với vai trái). Con vật trong 1,9 m trước mặt ⇒ đợi (ra khi
  > 2,4 m đủ 1 s — có trễ, không chập chờn), quá 6 s bỏ ~2 m đường. Đi xa (ra chỗ để, tới đầu đoạn, về) dùng bảng BFS buildFlowField (không có thì kẹt sau xe).
  · `nature/meadow.js` cutAt(x, z, r): ô có tâm trong tầm lưỡi ⇒ lá 3–5 cm, mất hoa, đất dưới ô sáng + ngả vàng xanh (thấy cả khi nhìn xa lá đã ẩn); ô đang
  hiện ghi thẳng thuộc tính instance (slot ghi trong cull). grassNear / cutFrac cho lập vòng và điều kiện. Mô phỏng: cả việc ~5,3 phút, cắt ~56% vành 3,2–7,4 m.
- **Dấu chân trên đất ướt** (G 18/10 "trời mưa xong mà engineer cắt cỏ, thì đi có dấu chân 2-3 bước", `engineer/footprints.js`): độ ẩm ĐẤT `footprints.soil`
  tách khỏi độ ướt MẶT cỏ sceneWet (khô sau ~5 phút): mưa ngấm nhanh (~2 phút đẫm), tạnh khô chậm (ngày ~50 phút, đêm ~2,5 giờ) ⇒ lúc cắt cỏ sau mưa đất còn
  mềm. Bàn chân chuyển từ vung → trụ (engWalkFeet: F.sw true → false) ⇒ 1 dấu đế ủng có gai (canvas, màu bùn, polygonOffset, không ghi độ sâu) ở F.w + 3,6 cm
  về mũi, đúng hướng F.fx/F.fz, chân trái lật gương (DoubleSide). 6 dấu xoay vòng; độ đậm theo thứ hạng mới → cũ [0,78, 0,62, 0,42], thứ 4 mờ hẳn ⇒ vệt 2–3 bước;
  đứng yên > 20 s thì nhạt dần. Không in trong xe / đường nhựa / mép nước; cỏ cao che dấu như thật, cỏ vừa cắt thì rõ.
- **Gà mái × 3** (G 18/10 "add 3 chickens" + mẫu GLB, `animals/chickens.js`): "Chicken - rigged" (Maf'j Alvarez, CC-BY-4.0, ghi công ở dock) → `src/models/chicken.glb`
  152 KB (`src/tools/chicken/`: 7 lưới da gộp 1 + màu đỉnh, khớp / trọng số uint8, lược khung 5.710 → 1.411, bỏ rãnh đứng yên). Mỗi con SkeletonUtils.clone +
  AnimationMixer; hoạt cảnh lặp hoà trọng số (dt × 7), hoạt cảnh 1 lần (ngồi xuống / đứng dậy) phát lại, giữ khung cuối. **Bẫy**: 'walking' của mẫu có
  chuyển động gốc (thân tiến 0,23 m / 1,583 s) ⇒ trừ dời tuyến tính khỏi rãnh vị trí khi nạp + đẩy con gà 0,145 m/s × timeScale (chia cỡ con) ⇒ bàn chân trụ
  đứng yên trên đất. Tập tính: vùng kiếm ăn quanh (pf + 3,0; −4,8) bán kính 3,2 m, đàn giữ ≤ 2,6 m; ~54% mổ (3–8 s, 1,3–1,6 lần / s), ~33% đi 0,3–1,6 m
  (0,12–0,22 m/s), ~13% ngó quanh; sau mưa mổ nhiều hơn; cỏ quanh vùng vừa phát (cutFrac > 0,3) ⇒ chọn đích trên chỗ đã cắt (sâu bọ). Sợ: kỹ sư < 1,4 m (đứng
  1,0), máy cắt cỏ nổ < 4,5 m quanh người VÀ < 3,2 m quanh lưỡi (chạy 3,5–4,5 m), chó chạy (> 0,6 m/s) < 2 m, gấu mèo < 2,5 m — mô phỏng cắt cỏ: gà luôn
  ≥ 3 m tới lưỡi đang quay, kỹ sư đợi gà ~24 s / lượt. Trưa 12:00–13:30 ngồi nghỉ; mưa / 18:15–5:50 về dưới bạt hiên đuôi xe (vanPt(2,35, 0, 1,55)…) ngồi ngủ.
  Né vật cản: đẩy ra + trượt vòng (bên lệch của đích) + CHẶN CỨNG ngoài r + 0,14 (bản đầu chỉ đẩy ⇒ gà đi xuyên lò chiminea); 30 phút mô phỏng: lọt 0.
  Trim job (engineer/trim-grass.js animalNear) tính cả gà.
- **Chim sẻ theo cấu trúc mẫu "Flying Bird"** (G 18/10 "study glb small bird then apply to our small bird structure (keep our colourful bird)",
  animals/songbird.js makeSparrow): mẫu của sandeep.s (CC-BY-4.0) CHỈ ĐO, không đưa vào trang — thân thon tiết diện bát giác, rộng / dài ~0,3, đuôi
  ~40% chiều dài, cánh 1 tấm cong vồng (camber ~4°), mép trước xuôi mạnh ở nửa ngoài, sải / dài 1,27; hoạt cảnh 1 s = 2 nhịp (lớn −27° → +49°,
  nhỏ → +21°), xuôi sau 17° ở đỉnh → 26° ở đáy, thân nhấp nhô ±1%. Áp vào chim sẻ (giữ màu + tập tính): thân = loft bát giác 6 trạm (thay quả trứng
  0,34 × 0,36 × 0,56), đầu 0,25 × 0,24 × 0,28, mỏ 0,13, đuôi 0,41 chẻ nhẹ, cánh = lưới cong vồng (wingGrid: mép trước / sau theo sải, cung lưng
  0,035 → 0,025) vẫn 2 đốt — cánh tay 0,26 (dây cung 0,29) + bàn cánh 0,36 mép trước xuôi tới đầu nhọn; vỗ: nâng 0,195 + 0,715 cos(pha) (+52° / −30°,
  trước +79° / −59°), xuôi 0,30 + 0,16·(cánh xuống); thân nhấp nhô 0,018 sin(pha). Gập cánh khi đậu: dây cung co 62% (W.sh.scale.z) — cánh rộng mà
  không co thì thành tấm to chìa trên lưng. Tần số vỗ giữ của chim sẻ thật (13–16 Hz, mẫu 2 Hz).
- **Chuồng gà + gà theo mặt trời / trú mưa** (G 18/10 "add chuồng gà nhỏ tại x61 z91 … 75% transparent, only line border art visible 100%; … back to chuồng
  khi mặt trời lặn, ra ngoài kiếm ăn khi mặt trời mọc, biết kiếm chỗ tránh mưa near by under cover"): `camp/chicken-coop.js` — toạ độ trang X = x − X0,
  Z = z − Z0 (loop/main-loop-rest.js, ô toạ độ khi rê chuột) ⇒ đặt (X0 + 61,4; Z0 + 91) trên khoảnh phẳng giữa bậc cao tây / bậc thấp đông, cửa quay
  nam–đông nam (YAW 0,42). Nhà 1,0 × 0,7 m trên chân 0,5 m (gà 0,44 m chui gầm), mái tôn Λ, cửa chui 0,26 × 0,34 + cửa tự động trượt dọc, ván 34° có
  nẹp, sào cao 0,26 m (3 chỗ), ổ đẻ. Mọi mặt opacity 0,25 + depthWrite false, nét EdgesGeometry lineDark đục 100%. Điểm cho gà: rampFoot / rampTop / entry /
  perch[i].below|on / under[3] / legs. **Bẫy**: obstacleCoords phải có y + h (lưới bay ong / bướm dựng hộp từ đây — thiếu ⇒ hộp NaN, lỗi "Không tìm được
  điểm bay an toàn cho bướm", cả cảnh không dựng); vật cản chuồng gắn cờ `coop` ⇒ gà bỏ vòng này (chỉ né 4 chân). animals/chickens.js: roostTime =
  chiều sunElevSin < 0,06 (~17:09, lặn ~17:24) · sáng < 0,03 (ra ~5:50, mọc ~5:42) — đọc mặt trời thật nên theo mùa. Tối: về chân ván (con trước còn trên ván
  / ở cửa thì xếp hàng), lối định sẵn [đỉnh ván → trong cửa → dưới sào → nhảy lên sào] đi 0,16 m/s (quay xong mới bước), ngồi ngủ; cả 3 lên sào ⇒ cửa hạ.
  Sáng: cửa mở, từng con cách ~4 s đứng dậy, lối ngược ra, kiếm ăn quanh tâm cách cửa 3,5 m. Mưa ban ngày: mỗi con tới điểm trú gần nhất (gầm chuồng · bạt
  hiên đuôi xe · gốc 2 cây táo — điểm thứ i cho con thứ i), đứng / ngồi chờ tạnh. Trưa ra gầm chuồng nghỉ. Độ cao dưới đất làm mượt (bậc voxel 0,6 m thành
  cú nhảy). Mở trang lúc đêm: gà đã trên sào. Mô phỏng: 17:09 cả đàn vào trong 41 s, cửa đóng; 5:50 ra hết trong ~12 s; mưa: 2 con gầm chuồng, 1 con chỗ
  khác gần hơn. Bảng việc dụng cụ (#toolPop) nền 75% (G "make these background 75% visible") — luật chung `.panel … 0,5 !important` ở cuối app.css nên
  phải `#toolPop.panel { … !important }`.
- **Gà to 10 %, thỏ nhỏ 10 %, chữ "Kỹ sư" → "Engineer", cây táo dời** (G 18/10 "Make the chicken 10% bigger; cho thỏ nhỏ lại 10%, thay toàn bộ từ
  Kỹ sư = Engineer, move cây táo tới x62 z90"): gà ×1,1 (cao 0,40 → 0,44 m) ⇒ chuồng nâng chân 0,45 → 0,5 m, cửa chui 0,24 × 0,30 → 0,26 × 0,34 (sàn
  0,53 m, sào 0,79 m — gà ngồi trên sào đỉnh ~1,1 m, mái tại sào 1,25 m). Thỏ 0,8³ × 0,9 (animals/deer-crab-bunny.js; khối va chạm đo lúc dựng nên theo
  cỡ mới). Mọi chữ hiện ra (bảng chỉ số, chú thích nút, ý nghĩ, tên vật, aria-label, page.html) "Kỹ sư" → "Engineer"; nút thanh công cụ vẫn là
  👷🏻‍♂️; chú thích trong mã giữ tiếng Việt. Cây táo ft1 (nature/forest.js) đặt thẳng ở trang (62; 90): gốc ở góc sau–phải chuồng gà (toạ độ chuồng
  (0,96; −0,67), cách vách 0,3–0,46 m), tán che chuồng; mọi thứ đọc ft1 (vật cản thân, hái táo, chỗ trú mưa của gà, appleTrees) dựng SAU dòng dời.
- **Bàn ghế trà dưới bạt · đường nối đập · đập làm lại** (G 18/10 "move the chair and table under cover · Connect the road · do the research, study and
  improve the dam structure"). (1) camp/chairs-lantern-fire.js đặt ghế + bàn theo toạ độ cục bộ xe (campLocal): bạt x −0,75 … 2,9 · z 1,06 … 3,4, cửa lùa
  x −0,55 … 0,83; ghế (1,5; 2,3) quay ra ngoài, tâm cách trục cửa 1,09 m (vòng ENG_PROPS 0,75 + 0,32 không đẩy người ra vào cửa); bàn (2,42; 2,0) dọc thân
  xe, −z của bàn quay ra ngoài ⇒ chỗ đứng đặt drone vẫn dưới bạt. drone.js tableLay + routine-fx.js gói khoai lật x theo phía ghế (drone nửa XA ghế).
  Thỏ trú mưa khe sau bàn vanPt(2,3; 1,45); gà bỏ chỗ trú dưới bạt (vòng né bàn ghế + 0,45 m phủ hết) — còn gầm chuồng + gốc táo. (2) world/solar-
  buildings-road.js: roadLine(stations, fix) dựng 1 tuyến; nhánh nối từ mép nhựa góc đường (roadCornerX + 1,6) thẳng về đông tới đầu chiếu nghỉ dốc đập bờ
  trái (chiếu nghỉ dời endZ về trục roadCornerZ ở world/hydro-dam.js), cao hơn đường chính 3 mm ở miệng nối, lấn 2 cm lên chiếu nghỉ; roadContains +
  roadSurfaceAt (street-lamps.js) đọc cả userData.road.branch. freeTree (nature/flowers-trees.js) né đường + mặt đập (cây rừng rải ngẫu nhiên từng mọc giữa
  đường). (3) world/hydro-dam.js theo USBR Design of Small Dams: mặt cắt trọng lực (thượng lưu đứng, hạ lưu 0,75 : 1) đùn bằng prism(); 3 khoang tràn đỉnh
  ogee WES (Hs 1,6) xuống bể tiêu năng (đáy 2,7 > đáy sông cao nhất 2,64, mố nhám, ngưỡng cuối, tường hướng dòng); trụ pin mũi bán trụ + khe phai + gối
  quay; cửa van cung = cung tròn tâm gối quay (aT phải trừ 2π, không thì quay vòng 320°), mở hé 0,12 rad, nhà tời + cáp trên cầu; khoang 4 = nhà máy lòng
  sông (đầu nước ~3,2 m ⇒ tổ máy bóng đèn): lưới chắn rác, gian máy, 2 cửa ống hút, máy biến áp trên đỉnh; bỏ 2 tháp lấy nước. Nước tràn: fallBlocks có
  path (z, y) bám mặt ogee, màn nước liền trong mờ phủ mặt tràn, rồi tấm nước trườn dưới mặt hạ lưu / bọt cuộn nước nhảy (loop/main-loop.js).
- Laptop nhấp nháy phím (17/10): mặt phím chỉ cao hơn mặt đế 0,05 mm, nhỏ hơn 1 bước độ sâu của camera trực giao (gần 0,1 – xa 4.000 m ⇒ ~0,24 mm);
  đế gộp lượt vẽ (vị trí qua ma trận xương trong shader) còn mặt phím vẽ riêng ⇒ thắng thua đổi theo góc nhìn. Sửa: mặt phím / logo / kính / màn
  `polygonOffset` + cách ≥ 0,3 mm. **Quy tắc**: mặt dán (decal) nằm sát mặt khác dưới ~1 mm thì luôn dùng polygonOffset.
- Chó (G 17/10 "remove its motion đứng 1 chỗ xoay vòng"): bỏ xoay 1–2 vòng trước khi nằm (`'circle'` giờ chỉ xoay ngắn ≤ 2 s quay mặt về bếp lửa).
  Xoay thật sự là do KẸT: bảng DP chung ô 0,6 m dẫn qua khe 12 cm giữa lò chiminea và đống củi (đích nằm sát vòng tránh bếp lửa ⇒ vùng luôn-mở
  quanh đích nới tới 2,2 m) và `ffDir` ở ô cấm chỉ sang ô rẻ nhất 5×5 xuyên qua đống củi. Sửa: `dogNavBuild` (lớp va chạm xong) dựng lưới cấm từ
  va chạm thật quanh trại ± 40 m (ô có ≥ 2/5 điểm chạm vật tầm thân chó), `buildFlowField(…, unR 0,5)`; `ffDir` ở ô cấm chọn ô KỀ trước; điểm đánh hơi
  thử trên lớp va chạm + tối đa 12 s; chạy vòng 4 s không lại gần bãi thì thôi; lưới an toàn > 5,5 rad / 3 s tại chỗ ⇒ đi xuyên 1,5 s. Đo bằng
  `spinScan` (scratchpad): xoay > 230° / 6 s mà dịch < 0,5 m — trước 62 lần / 25 phút, sau 0 (chỉ còn quay đầu 250° lúc hết chạy vòng).
- Chó lên / xuống bậc cửa xe (`shelterTick`, dog-brain.js, G 17/10 "improve dog physic, correct step and movement"): bậc dưới 0,25 m (lộ ra sâu 0,21 m),
  bậc trên 0,48 m (sâu 0,45 m), sàn 0,96 m — chân chó 0,26 m. Bản cũ đứng chờ ngay chỗ bậc (`dogDoorStep` nằm trên bậc trên ⇒ thân xuyên 2 bậc) rồi
  1 vòng cung đất → sàn (xuyên bậc). Thử đi bộ lên với mặt đặt chân `stairY` (đúng từng bàn chân) ⇒ thân dựng ~50°, ngực xuyên mép sàn ⇒ bỏ. Giờ: đứng
  chờ `dogStairA` (cách mép bậc dưới 0,42 m) → quay vào trục cửa → nhún (`'crouch'`) → `stairHop` lên bậc trên `dogStairT` (đáp gọn 4 chân) → ngó vào →
  nhún → bật vào sàn; ra thì ngược lại. Quỹ đạo lên: cao theo 1 − (1 − u)², ngang theo u² (vượt mép bậc / ngưỡng ngay trước mũi); xuống: ngang
  1 − (1 − u)², cao u² + vồng 0,28 (chân sau qua ngưỡng rồi mới hạ). Thân ngóc khi bật (`B.slope`), chúc khi rơi; chân co (`rig.plant`) lúc bay.
  Đo (scratchpad `dogstair.js`: `dsTrace2`, `dsPhaseShots`): chân trụ lệch mặt bậc 0 mm, chân lúc bay không xuống dưới mặt bậc, bụng cách mép ≥ 10,6 cm.
  Trong lúc đi trú, lớp va chạm của chó TẮT (`!dogRain.st`) ⇒ lộ trình quanh bậc phải tự đúng hình học.
- Chó khi người xem zoom cận (`watchTick` trong animals/dog-brain.js, G 17/10 "khi close up vào chú chó… dog behaviour"): "cận" = chó dài
  ≥ 120 px trên màn hình (`dogLen / upp`) + đầu trong 60% giữa khung ≥ 0,5 s; rời khung > 1,2 s thì thôi (`DW` — `dogBrain.watch`). Theo trạng thái lúc
  bắt đầu: `stand` (đánh hơi / về chỗ / theo chủ: TẠM DỪNG `behave` — khựng 0,7 s, dựng tai quay nhìn, nghiêng đầu 2 bên, rồi ngồi nhìn 55% / cúi chào
  mời chơi / bước lại gần ~0,7 m rồi ngồi; người xem sau lưng thì xoay thân) · `lie` (ngẩng nhìn, đuôi đập đất, không lim dim) · `peek` (đang ngủ:
  giật 1 tai, hé mắt ngóc đầu nhìn ~3 s rồi ngủ tiếp, 14 s/lần, ẩn Zzz) · `glance` (đang chạy vòng / uống / đống củi / dậy: liếc 1,4 s). Bị nhìn > 9 s:
  mỗi 7 s nhìn tránh + liếm mép (lưỡi `U.tongue`) + cụp tai. Đuôi lệch phải (`B.wagB` < 0 = phải thân), nghiêng đầu `P.tilt` (head.rotation.x),
  mắt chớp 2,5–6,5 s + nhắm khi `B.dozing` (scale.y `U.eyes`). Nguồn: Call 2003, Gácsi 2004, Kaminski 2017, Sommese 2022, Quaranta 2007,
  Horowitz 2009, Firnkes 2017, Nagasawa 2015. Bẫy thử: máy ảnh bám theo hướng chó ⇒ chó quay mãi đuổi máy ảnh — giữ hướng máy ảnh cố định
  (scratchpad `dogwatch.js`: dwView/dwRun/dwShots/dwAway).
- Vỏ cây theo bản quét (G 17/10 "seriously study this render, then apply to cây cổ thụ, cây táo và blossom" — "Tree 3D Scan - Retopo", grafi,
  CC-BY-4.0, chỉ xem): ảnh vân bản quét = nền xám nâu nứt sâu + ĐỊA Y VẢY xám trắng–xanh loang mảng (~35%, không vào rãnh, mép lấm tấm) + chấm ĐỊA Y
  VÀNG thưa + tảo lục; cành non xám sáng, nhẵn, có MẮT CÀNH u lên. Làm trong shader vỏ (core/surface-style.js, kind 5): `aBk.z` = bm + phần lẻ
  BÁN KÍNH (× 0,5 m, barkTubes) ⇒ `thin` cho cành non; `uSfL` = `mat.userData.sfL` (cổ thụ 1,25 · táo 1 · anh đào 0,55 · cành chết 0,35). Mắt cành:
  barkTubes phình bán kính +18% ~30 cm một (cành < 7 cm, băm theo chiều dài, KHÔNG gọi rnd() ⇒ táo / hoa / tổ / chỗ đậu không đổi). Bẫy: mảng nhiễu
  quanh thân phải có chu kỳ NGUYÊN (12·hệ số nguyên) mới không lộ đường may; tần số dọc thân thấp ⇒ địa y thành vệt dọc (bản đầu) — dọc ×4.
- Ảnh vân vỏ THẬT từ bản quét (G 17/10 "file glb đó là 3D hay chỉ là ảnh, nếu 3D thì apply vào luôn"): GLB là 3D (cây non 2 m, 22k tam giác, trơ
  cành) nhưng chi tiết vỏ nằm ở 3 ảnh vân ⇒ dáng cây mình giữ, lấy ẢNH VÂN: 4 dải vỏ thân trong atlas 1024² ghép ngang thành ô 160 × 480
  (`src/models/bark-scan.jpg`, 35 KB, cắt trong trình duyệt — dữ liệu tải về không chạy Python có PIL). Tải sau khi cảnh chạy (`sfBarkTex`,
  `window.__barkTex` cho bản debug, địa chỉ tuyệt đối Pages); vật liệu có `userData.sfTex` (cổ thụ, táo, anh đào) đọc ảnh theo `aBk` (3 ô quanh mỗi
  bm, ~0,75 m dọc / ô, lặp gương dọc), nhuộm `sfTint` (anh đào nâu đỏ); cổ thụ `sfDk` nhuộm mảng địa y sáng thành nâu đen (G muốn) nhưng giữ vân;
  độ lồi = độ sáng ảnh (sfBump). Chưa tải / lỗi ⇒ vân thủ tục cũ.
  G 17/10 khuya: "cây cổ thụ render tệ, nhìn giả, sửa lại về render cũ" ⇒ cổ thụ + cây con + cành chết dùng `userData.sfOld` (nhánh shader vân BẢN
  TRƯỚC: rãnh + đốm địa y nhỏ + rêu gốc, màu 0x4a3420), `nodes: false` trong barkTubes (không mắt cành). Ảnh quét chỉ còn ở cây táo + anh đào.
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

## 9b. Giao diện: thanh tổng quan + chỉ số kỹ sư

- **Thanh tổng quan tối giản** (src/page.html `#weather-dock`, css, js/weather.js — G 18/10 "minimalism cái bảng này"): 1 dải trên cùng, không viền,
  không vạch chia: GHC + công suất · giờ cảnh (`#clock`, dòng ngày "17/10 · Pleiku") · biểu tượng + nhiệt độ hiện tại (`#weather-now-temp`) + ô chọn
  thành phố trong suốt · 5 ngày (chỉ thứ + biểu tượng + nhiệt độ cao; ngày, nhiệt độ thấp, mô tả ở chú thích `title`) · nút ⓘ (`<details class="dock-more">`)
  mở chi tiết nhà máy, trạng thái dữ liệu + ↻, ghi công (Open-Meteo, drone, xe). Màn ≤ 760 px: dải xuống hàng, 5 ngày dàn đều hàng dưới. Giữ nguyên
  mọi id mà weather.js ghi (`weather-status`, `weather-refresh`, `weather-dock[data-stale]` …); `#pickPanel` theo đó đưa lên 76 px.
- **Thanh nút tối giản** (footer `.toolbar`, G 18/10 "minimalism các nút này trừ kỹ sư text"): 1 viên thuốc nền 50%, nút chỉ có biểu tượng, tên ở
  `title` + `aria-label` (`tbIcon(b, icon, label)` ở ui/labels-controls.js — mọi chỗ đổi trạng thái nút xoay / nhãn / trời gọi hàm này thay vì ghi
  innerHTML kèm chữ); riêng `#btnSim` (`.tb-text`) giữ chữ "Kỹ sư"; % zoom chỉ còn ở chú thích (`#zoomPct span` ẩn, updateZoomPct ghi title).
- **Chỉ số kỹ sư kiểu The Sims 4** (`ui/sim-needs.js`, nút `#btnSim` "◆ Kỹ sư" trên thanh dưới, bảng `#simPanel` góc dưới phải — G 18/10 "research
  about the Sim 4 all the bars then apply to engineer"): cảm xúc (viên kim cương đổi màu) + moodlet, 6 nhu cầu, 5 kỹ năng cấp 1–10, tình bạn với
  pet (G 18/10: chữ "chó" trong bảng → "Pet"), hiệu suất công việc hôm nay + chức danh. Mỗi giây (`simNeedsTick(t)` cuối main-loop-rest) đọc việc ĐANG LÀM thật (`simDoing`: giờ ngủ, trạm
  trong xe `e.van.station`, pha `e.phase`) → cộng / trừ theo `SIM_NEEDS` (cạn / giờ) + `SIM_DO` (việc → +/giờ, moodlet khi làm, moodlet sau khi xong).
  Mở trang hoặc giờ nhảy > 12 phút: `simInit(h)` tua lịch `ENG_DAY` (`simSched`) từ 21:00 tới giờ hiện tại, bước 2 phút. Tốc độ đã cân để 1 ngày
  theo lịch gần hoà (Giải trí 9/h, Giao tiếp 5/h, Đói 15/h …; tính cách ngầm kiểu Sims 4 Geek · Dog Lover · Loves Outdoors — KHÔNG hiện chữ: nghiên cứu
  có vui, việc ngoài trời có pet bên cạnh +7 giao tiếp). Cảm xúc = tổng trọng số moodlet lớn nhất (≥ 3 "Rất …"). Kỹ năng / tình bạn / cấp bậc: số ngày ở trại × giờ
  theo lịch + giờ đã làm hôm nay (tất định). Kiểm cả ngày: `__ev('simInit(h)')` rồi đọc `sim.n`, `simEmotion()`.

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
- **Chú thích // chèn giữa dòng nuốt câu lệnh phía sau** (18/10, 4 chỗ): `…setScalar(1.1);   // ghi chú scene.add(g);` ⇒ gà không bao giờ vào cảnh;
  chim sẻ mất `bodyP.scale.setScalar(P.fluff.x)` (hết xù lông khi ngủ / lạnh); engineer/drone.js `park()` mất `bub.visible = false;
  phoneM.color.setScalar(0)` (từ 29183c3: màn tay cầm trên bàn sáng mãi, dừng giữa chừng thì khung camera treo trên đầu) và `sizeBubble()` mất
  `SH = SW * SCR.h / SCR.w` (từ 19d8dbb: hình camera trong khung bẹp còn 52 % chiều cao); fishing/angling.js mất `anglingEvent('bite', 0.55)` (từ
  3a78d71: ý nghĩ "cá rỉa mồi" không bao giờ nảy). build.py giờ DỪNG khi chú thích cuối dòng kết thúc bằng 1 câu lệnh ASCII (`swallowed()`: `a.b(…);` /
  `a = …;`, ngoặc cân; chữ Việt có dấu nên văn xuôi không bị bắt nhầm). Thêm ghi chú thì đặt SAU câu lệnh cuối cùng của dòng.
