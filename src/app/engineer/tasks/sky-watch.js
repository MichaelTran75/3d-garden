        // ===== NGẮM SAO + NGẮM MƯA — tự chủ đợt 2 (G 18/10 "ngắm sao, ngắm mưa") =====
        //  NGẮM SAO (pha 'stars', lịch 20:42–21:42 — 1 tiếng trước giờ ngủ 21:45 — hoặc việc tự chủ khi trời tối hẳn): mặt trời < −8°, không mưa, mây < 60%, tới 21:43. Kỹ sư lấy
        //  tấm thảm xốp cuộn dựng ở góc bạt (cạnh cửa lùa) → xách ra bãi cỏ trống phía nam bếp lửa (dò 1 lần: đất phẳng dưới cả tấm thảm, cách vật cản
        //  ≥ 1,3, cách cây ≥ 5 cho thoáng trời, chân quay ra xa lửa) → cúi đặt cuộn ở đầu thảm, đẩy cho cuộn lăn trải ra → bước lên giữa thảm → ngồi xổm
        //  → ngồi bệt (2 tay chống sau) → ngả lưng nằm ngửa, 2 tay gối sau đầu, gối trái co, ~40 s đổi chân co → đảo mắt khắp trời, thở chậm; SAO BĂNG
        //  (core/night-sky.js meteors) đủ sáng ⇒ quay đầu theo vệt + giơ tay phải chỉ, "Sao băng kìa!" → hết giờ / mây kéo tới / mưa: ngồi dậy, đứng lên,
        //  bước ra đầu thảm, cúi cuộn thảm lại, xách về dựng chỗ cũ. Đang nằm mà lịch đổi việc thì engWantAct giữ 'stars' tới khi cất thảm xong.
        //  Tư thế nằm: kỹ sư xoay thứ tự YXZ (instance-gait) ⇒ rotation.x = −π/2 là ngửa mặt lên trời quanh trục ngang thân; gốc toạ độ tính ngược từ
        //  điểm hông (hông = điểm xoay của dáng ngồi / nằm) để ngồi xuống, ngả lưng quanh hông như người thật.
        //  KÍNH THIÊN VĂN + MÀN HÌNH + THIÊN HÀ MINI + CHÓ (G 19/10 "add glb telescope và gắn thêm ipad size screen at the back so engineer vừa nằm vừa xem,
        //  khi nằm xem thì trên đầu engineer hiện lên miniature galaxy rotate, zoom in and out slowly như đang dò tìm ngôi sao cho đến khi hết ngắm sao; khi
        //  ngắm sao thì chó cũng ra nằm bên cạnh"): mẫu "Telescope" (sieminskaola, CC-BY-4.0) dựng lại bằng src/tools/stargaze/ → models/telescope.glb 59 KB
        //  (kính khúc xạ trên chân ba càng cao 1,40 m, 3,9k tam giác màu đỉnh, điểm neo trong extras), ×1,1 đv/m — G 20/10 "cất kính, khi nào ngắm sao mới đem ra": cất trong
        //  xe; lấy thảm ở cửa xe thì cầm luôn kính tay phải, xách chéo (ống trước, chân ra sau) → đặt xuống chỗ dựng → trải thảm … cuộn thảm → nhấc kính → xách về cất ('tset' / 'tgo' / 'tget'); chỗ dựng cạnh đầu thảm phía trống hơn,
        //  đuôi ống (chỗ thị kính) quay về mặt người nằm. Màn hình cỡ iPad 11" (24,8 × 17,9 cm) trên tay đỡ từ đuôi ống, mặt màn hướng về mắt người nằm: ảnh
        //  kính đang dò (trường sao trôi, ô ngắm đỏ chế độ đêm, thiên hà đích nét dần khi khoá) — canvas 256 × 176 vẽ 8 lần/giây lúc nằm, thôi thì tắt màn.
        //  Nằm thì cứ vài nhịp đảo mắt lại quay đầu xem màn hình. THIÊN HÀ MINI: mẫu "Need some space?" (Loïc Norgeot, CC-BY-4.0) → models/galaxy.glb 76 KB
        //  (10k điểm màu; tâm lõi, mặt đĩa XZ, bán kính 90% = 1) — đám điểm cộng sáng trên đầu kỹ sư khi nằm: tự quay; cứ ~15 s chọn 1 sao trong nhánh xoắn,
        //  phóng to chậm quanh nó (sao đích dời về giữa khối cầu cắt), dừng ngắm, thu nhỏ về toàn cảnh — như đang dò tìm; màn hình kính dò theo cùng nhịp.
        //  MÀN KÉO TRƯỚC MẶT + CHẠM ĐỂ DÒ (G 23/10 "animation phía trên telescope, x2 bigger; engineer dùng tay adjust the screen để nhìn thoả mái thay vì quay sang
        //  1 bên, face down to his eye; touch the screen to remote rotate the telescope slowly"): ống kính tách khỏi chân + giá lúc nạp (tam giác trong ống trụ r < 13 cm
        //  quanh trục đuôi → miệng) để xoay GOTO quanh khớp ngay trên đầu giá (phương vị · độ cao, ≤ 4°/s, tăng tốc / hãm êm như giá GOTO thật); màn trên TAY ĐỠ 2
        //  KHÚC gắn đầu giá (không theo ống). Nằm xong: tay phía kính nắm mép dưới màn kéo về trên mặt ~0,38 m, mặt màn úp xuống thẳng mắt, đỉnh màn về phía đỉnh đầu
        //  ⇒ nhìn thẳng, không phải quay đầu; mỗi lần dò sao mới: giơ tay chạm màn (vòng sóng chạm) ⇒ ống từ từ xoay tới đích, màn lia theo; trước khi dậy đẩy màn về.
        //  THIÊN HÀ MINI lên phía trên kính, to gấp đôi.
        //  NGÂN HÀ MINI (G 23/10 "add new animation milkway to ngắm sao, slowly rotate and search"): ảnh toàn cảnh "Milky Way Skybox HDRI panorama"
        //  (Aliaksandr.melas, CC-BY-4.0; mẫu chỉ là quả cầu + ảnh 1024² ép vuông) → models/milkyway.jpg 1024 × 512, 85 KB. Quả cầu ảnh nổi Ø 1,1 cùng chỗ thiên hà
        //  mini, THAY PHIÊN mỗi lượt dò (lượt đầu mỗi buổi là Ngân Hà, lõi thiên hà; đổi lượt mờ chéo ~2 s). Chờ chạm: cầu tự quay chậm (0,12 rad/s) quanh trục
        //  nghiêng, ô ngắm đỏ lượn quanh giữa. Chạm màn: ô ngắm rời chỗ cũ, đi xoắn ốc (3,2 vòng, bán kính 0,42 rad thu về 0) tới 1 trong 14 điểm sáng trên dải
        //  Ngân Hà (dò sẵn từ ảnh) theo đúng tiến độ ống xoay; cầu quay theo giữ ô ngắm ở giữa, ảnh phóng dần ×3,6 quanh ô ngắm → khoá (ô ngắm thu nhỏ, nhịp)
        //  → thu nhỏ, lại tự quay. Màn iPad cùng lượt hiện ảnh Ngân Hà thật quanh ô ngắm, chữ TRACKING SGR A* (lõi) / HIP ….
        //  HỐ ĐEN MINI (G 23/10 "nén tiếp blackhole vào trong telescope"): mẫu "Blackhole" (rubykamen, CC-BY-4.0) 8,4 MB — 17 lưới ~220k tam giác: cầu lõi đen + ~12
        //  lớp vỏ cầu chiếu ảnh đĩa từ trên xuống, xoay theo hoạt cảnh 10 s (giả vòng sáng quanh bóng) + đĩa phẳng — chỉ giữ ẢNH ĐĨA (màu nền × alpha + ảnh phát
        //  sáng) → models/blackhole.jpg 512², 22 KB; hố đen dựng lại bằng shader dò tia bẻ cong ánh sáng (bhMat): đĩa nghiêng, ảnh đĩa phía sau vòng qua đỉnh
        //  bóng, vòng photon, phía lao tới sáng hơn. Lượt thứ 2 của vòng Ngân Hà → hố đen → thiên hà mini; dò: ô ngắm xoắn ốc về giữa, đĩa nghiêng dần gần cạnh,
        //  phóng ×1,8 vào bóng. Màn iPad vẽ hình hố đen đơn giản cùng góc nghiêng, chữ TRACKING M87* / CYG X-1 ….
        //  KÍNH NGHIỆP DƯ + LASER (G 24/10 "vị trí engineer nằm nên gần telescope; research private hobby telescope system, improve detail, add laser tracking"):
        //  tâm chân kính cách trục thảm 1,0 → 0,72 (càng gần nhất cách mép thảm ~3 cm). Mẫu sẵn có: ống khúc xạ + vòng ôm, ống chỉnh nét + gương chéo + thị kính,
        //  kính tìm trên giá kẹp, giá xích đạo có đối trọng, chân ba càng. Thêm (telKit) theo thói quen người chơi kính: BÚT LASER XANH 532 nm trong giá kẹp cạnh
        //  ống (thay / phụ kính tìm — mắt nhạy nhất ở màu lục nên tia thấy rõ ban đêm), ĐAI SƯỞI CHỐNG SƯƠNG quanh ống che sương + hộp điều khiển trên càng + dây,
        //  BÌNH ĐIỆN 12 V dưới chân ở khe xa người nằm + dây lên đầu giá, KHAY THỊ KÍNH tam giác giữa 3 càng + 3 thị kính. TIA LASER bám theo trục quang khi dò /
        //  khoá (bật tắt êm 0,12 s, tắt khi không dò — quy tắc an toàn: chỉ bật khi cần, không chiếu xuống dưới chân trời), dải sáng lục yếu dần theo khoảng cách.
        //  Giá GoTo cân chỉnh 2 SAO mỗi buổi: 2 lần chạm đầu = "ALIGN 1/2", "ALIGN 2/2" trên màn iPad, sau đó mới GOTO đích; màn có đèn báo LASER.
        //  ỐNG ×2 · LASER ĐÚNG TRỤC · 75 – 80° · LẮP RÁP · JUPITER (G 24/10 "ống kính x2 bigger, make sure laser align with kính, add them jupiter, remove ống ngắm trên
        //  blackhole, hướng lên trời 75 – 80°, moving slower, màn hình x1.5, research engineer lắp ráp + căn chỉnh trước khi nằm"): ống ×2 trên CỘT NỐI 0,46 (đuôi ống ×2
        //  sụt 0,45 khi chĩa 80° — cột cho đuôi qua trên đầu giá), khớp tách phương vị (azJ, cột quay) / độ cao (TEL.tube); laser + phụ kiện ống theo TRỤC QUANG THẬT đo
        //  từ lưới (điểm neo mẫu lệch 4°); đích GOTO cao 75 – 80°, phương vị đổi 0,35 – 0,9 rad, ≤ 2,3°/s; màn iPad ×1,5; hố đen không còn ô ngắm; JUPITER (Mieke Roth,
        //  CC-BY-4.0 → models/jupiter.jpg 1024 × 512, 76 KB) thành lượt thứ 3: Ngân Hà → hố đen → Jupiter → thiên hà mini. Chuỗi LẮP RÁP + CĂN CHỈNH: xem asmStep.
        //  CHÓ: kỹ sư bước lên thảm ⇒ chó (kể cả đang ngủ trong xe) ra nằm sát thảm phía bên kia, song song chủ, lim dim; sao băng thì ngẩng nhìn theo;
        //  chủ ngồi dậy thì về chỗ (đêm: vào xe) — animals/dog-brain.js 'stars'.
        //  NGẮM MƯA (pha 'rainwatch'): đang trú mưa dưới hiên, cứ 4–7 phút đứng dậy ra mép trước bạt (trong vùng khô) đứng 70–110 s: nhìn mưa ngoài
        //  hồ, ngẩng nhìn mép bạt nhỏ giọt, ngửa tay hứng mưa, khoanh tay; rồi về ghế. Cũng là việc tự chủ khi mưa (lấp Giải trí) ----
        const skyWatch = (() => {
          const ML = 1.75, MW = 0.85, R0 = 0.07, RMIN = 0.012, HY = ENG_HIP_Y * engObj.g.scale.y;   // thảm xốp (đv): dài · rộng · bán kính cuộn · hông trên gốc khi đứng
          const S = { st: 'idle', k: 0, u: 0, roll: 'home', spot: null, stop: false, done: -1e9, seen: new WeakSet(), pt: null, gz: { y: 0, p: 0.15, t: 0 }, leg: 1, legT: 0, spin: 0 };
          const UP = new THREE.Vector3(0, 1, 0), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _mw = new THREE.Vector3(), _v2 = new THREE.Vector2(), _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), _q3 = new THREE.Quaternion();
          // ---- thảm: tấm sọc xanh (canvas 16 × 64) + cuộn trụ ----
          const cv = document.createElement('canvas'); cv.width = 16; cv.height = 64; const cx = cv.getContext('2d');
          for (let i = 0; i < 64; i += 8) { cx.fillStyle = i % 16 ? '#3d6f90' : '#2c5877'; cx.fillRect(0, i, 16, 8); }
          cx.fillStyle = '#d8c9a2'; cx.fillRect(0, 0, 1, 64); cx.fillRect(15, 0, 1, 64);   // viền may 2 mép dọc
          const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter;
          const mat = new THREE.Group(); mat.name = 'Thảm ngắm sao'; scene.add(mat);
          const sheetGeo = new THREE.PlaneGeometry(MW, ML); sheetGeo.rotateX(-Math.PI / 2); sheetGeo.translate(0, 0, ML / 2);   // đầu thảm ở gốc, trải theo +z
          const sheet = new THREE.Mesh(sheetGeo, new THREE.MeshLambertMaterial({ map: tex })); sheet.position.y = 0.012; sheet.receiveShadow = true; mat.add(sheet); mat.visible = false;
          const roll = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, MW, 14), new THREE.MeshLambertMaterial({ color: 0x35627f })); roll.name = 'Thảm ngắm sao (cuộn)'; roll.castShadow = true; scene.add(roll);
          for (const o of [mat, sheet, roll]) o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true;
          // chỗ dựng cuộn thảm: sát vách xe, bên trái cửa lùa, dưới bạt · chỗ đứng lấy (0,55 trước cuộn)
          const HOME = vanPt(-0.62, 0, 1.22), HOME_ST = vanPt(-0.62, 0, 1.8); HOME.y = cowY(HOME.x, HOME.z);
          const homeRoll = () => { roll.position.set(HOME.x, HOME.y + MW / 2, HOME.z); roll.quaternion.identity(); roll.scale.set(R0, 1, R0); roll.visible = true; };
          homeRoll(); ENG_PROPS.push({ x: HOME.x, z: HOME.z, r: 0.12 });
          // ---- kính thiên văn + màn hình + thiên hà mini (xem đầu tệp) ----
          const TEL = { g: null, scr: null, holo: null, an: null, sd: 1, out: false, lift: 0, mv: 0, sc: new THREE.Vector3(), dog: null, scrOn: false, scrT: 0, op: 0, ph: 'out', pk: 0, e: 0, sl: 1, z: 1, tgt: new THREE.Vector3(), from: new THREE.Vector3(), v: [1.5, 1, 1.5, 1], n: 0,
            tube: null, az: 0, alt: 0, azT: 0, altT: 0, slV: 0, sl0: 1, inDur: 6.5, tapReq: false, touch: -1, tx: 0.5, ty: 0.55, sv: 0, viewP: null, viewQ: null, restP: null, restQ: null, arm: null,
            mw: null, mode: 'mw', mwA: 1, mi: -1, mt: new THREE.Vector3(), mr: new THREE.Vector3(0, 0, 1), mr0: new THREE.Vector3(), hp: new THREE.Vector3(),
            bh: null, bhA: 0, galA: 0, bhRoll: 0, bhTilt: 0.45, bro: new THREE.Vector2(), laser: null, las: 0, al: 0,
            azJ: null, tubeS: null, mntP: null, tubeOn: false, hold: 0, holdM: new THREE.Matrix4(), hand: false, legs: null, cwP: null, eyeP: null, penP: null,   // ống ×2: khớp phương vị · ống · tư thế trên giá · đã lắp · đang bê (ma trận thế giới) · tay chỉnh
            jup: null, jupA: 0, ji: -1, jspin: 0, js0: null, js1: 0 };   // Jupiter: độ hiện · đích · góc tự quay   // laser: miệng phát + trục (hệ khớp) · độ bật · lượt cân chỉnh   // hố đen: độ hiện · cuộn / nghiêng đĩa (màn iPad vẽ theo) · ô ngắm (toạ độ tấm, mượt)   // Ngân Hà: lượt đang chiếu · độ hiện · đích · ô ngắm (hệ cầu)
          const scv = document.createElement('canvas'); scv.width = 256; scv.height = 176; const scx = scv.getContext('2d'), scTex = new THREE.CanvasTexture(scv); scTex.colorSpace = THREE.SRGBColorSpace; scTex.userData.live = 1;
          const SCR_ST = Array.from({ length: 170 }, () => [Math.random() * 3, Math.random() * 2, Math.pow(Math.random(), 3.2)]);   // trường sao ảo 3 × 2 màn (x, y, độ sáng)
          function screenDraw(t) {   // màn kính: tắt = đen bóng · bật = trường sao trôi theo hướng kính, ô ngắm đỏ, thiên hà đích, chữ trạng thái
            const W = 256, H = 176; scTex.needsUpdate = true;
            if (!TEL.scrOn) { scx.fillStyle = '#121418'; scx.fillRect(0, 0, W, H); scx.fillStyle = 'rgba(255,255,255,0.05)'; scx.fillRect(0, 0, W * 0.55, H * 0.4); return; }
            const V = TEL.v, k = TEL.sl, md = TEL.mwA > 0.5 && TEL.mwImg ? 'mw' : TEL.bhA > 0.5 && TEL.bhImg ? 'bh' : TEL.jupA > 0.5 && TEL.jupImg ? 'jup' : 'gal', mw = md === 'mw', z = mw ? 1 + 2.6 * TEL.e : md === 'bh' ? 1 + 0.8 * TEL.e : md === 'jup' ? 1 + 1.2 * TEL.e : 1 + (TEL.z - 1) * 0.9;
            if (mw) {   // Ngân Hà: ảnh thật quanh ô ngắm (ảnh trụ đẳng chữ nhật: 1 điểm ảnh ngang = 1 điểm ảnh dọc về góc), phóng cùng quả cầu
              const R = TEL.mr, I = TEL.mwImg, iw = I.width, ih = I.height, sw = iw * 0.16 / z, sh = sw * H / W;
              const sx = ((Math.atan2(-R.x, R.z) / TAU + 0.5) * iw - sw / 2 + iw) % iw, sy = Math.max(0, Math.min(ih - sh, Math.acos(Math.max(-1, Math.min(1, R.y))) / Math.PI * ih - sh / 2)), w1 = Math.min(sw, iw - sx);
              scx.drawImage(I, sx, sy, w1, sh, 0, 0, W * w1 / sw, H); if (w1 < sw) scx.drawImage(I, 0, sy, sw - w1, sh, W * w1 / sw, 0, W - W * w1 / sw, H);   // qua mép ảnh: vẽ 2 khúc
            } else if (md === 'jup') {   // Jupiter: nửa cầu đang quay về người xem (cắt ảnh trụ quanh kinh tuyến giữa, lật dọc: mép trên ảnh là cực nam) trong đĩa tròn + 4 trăng thẳng hàng
              scx.fillStyle = '#04050a'; scx.fillRect(0, 0, W, H); const I = TEL.jupImg, iw = I.width, ih = I.height, R = 30 * z, uf = (((0.25 - TEL.jspin / TAU) % 1) + 1) % 1;
              scx.save(); scx.translate(W / 2, H / 2 - R * Math.sin((JUP_T[Math.max(0, TEL.ji)][1] - 0.5) * Math.PI) * TEL.e); scx.beginPath(); scx.arc(0, 0, R, 0, TAU); scx.clip(); scx.scale(-1, -1);
              const sx = (((uf - 0.25) % 1) + 1) % 1 * iw, sw = iw / 2, w1 = Math.min(sw, iw - sx); scx.drawImage(I, sx, 0, w1, ih, -R, -R, 2 * R * w1 / sw, 2 * R); if (w1 < sw) scx.drawImage(I, 0, 0, sw - w1, ih, -R + 2 * R * w1 / sw, -R, 2 * R * (sw - w1) / sw, 2 * R);
              const lg = scx.createRadialGradient(0, 0, R * 0.6, 0, 0, R); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(0,0,0,0.55)'); scx.fillStyle = lg; scx.fillRect(-R, -R, 2 * R, 2 * R); scx.restore();
              if (TEL.jup) TEL.jup.userData.moons.forEach((m, i) => { const x = m.position.x / 0.42 * 30, d = m.position.z; if (Math.abs(x) < 30 && d < 0) return; scx.globalAlpha = 1 - TEL.e; scx.fillStyle = '#f2eee2'; scx.beginPath(); scx.arc(W / 2 + x, H / 2 + m.position.y / 0.42 * 30, 1.6, 0, TAU); scx.fill(); scx.globalAlpha = 1; });
            } else if (md === 'bh') {   // hố đen: hình vẽ đơn giản cùng góc nghiêng / phóng với ảnh nổi — đĩa elip (ảnh đĩa quay) · vòng cung ảnh đĩa phía sau qua đỉnh bóng · bóng đen · vòng photon · nửa đĩa phía trước
              scx.fillStyle = '#04050a'; scx.fillRect(0, 0, W, H); const I = TEL.bhImg, R = 62 * z, rs = R * 0.31, sq = Math.max(0.12, Math.sin(TEL.bhTilt));
              const disc = () => { scx.save(); scx.scale(1, sq); scx.rotate(t * 0.3); scx.drawImage(I, -R * 1.064, -R * 1.064, R * 2.128, R * 2.128); scx.restore(); };   // ảnh: ρ 0,47 = mép đĩa ⇒ nửa cạnh ảnh = R / 0,94
              scx.save(); scx.translate(W / 2, H / 2); scx.rotate(-TEL.bhRoll); scx.globalCompositeOperation = 'lighter'; disc();
              scx.lineWidth = rs * 0.38; scx.strokeStyle = 'rgba(255,214,150,0.55)'; scx.beginPath(); scx.ellipse(0, 0, rs * 1.45, rs * 1.3, 0, Math.PI, TAU); scx.stroke();
              scx.globalCompositeOperation = 'source-over'; scx.fillStyle = '#000'; scx.beginPath(); scx.arc(0, 0, rs, 0, TAU); scx.fill();
              scx.globalCompositeOperation = 'lighter'; scx.lineWidth = 1.6; scx.strokeStyle = 'rgba(255,240,215,0.9)'; scx.beginPath(); scx.arc(0, 0, rs * 1.04, 0, TAU); scx.stroke();
              scx.beginPath(); scx.rect(-W, 0, 2 * W, H); scx.clip(); disc(); scx.restore(); scx.globalCompositeOperation = 'source-over';
            } else {
              const bg = scx.createRadialGradient(W / 2, H / 2, 10, W / 2, H / 2, W * 0.62); bg.addColorStop(0, '#16285a'); bg.addColorStop(1, '#070d24'); scx.fillStyle = bg; scx.fillRect(0, 0, W, H);
              const vx = V[0] + (V[2] - V[0]) * k, vy = V[1] + (V[3] - V[1]) * k, sc = W * 0.55 * z, wr = (a, m) => a - m * Math.round(a / m);
              for (const [x, y, b] of SCR_ST) { const px = W / 2 + wr(x - vx, 3) * sc, py = H / 2 + wr(y - vy, 2) * sc; if (px < -4 || px > W + 4 || py < -4 || py > H + 4) continue;
                scx.globalAlpha = 0.35 + 0.65 * b; scx.fillStyle = b > 0.6 ? '#fff4dc' : '#dfe8ff'; scx.beginPath(); scx.arc(px, py, (0.9 + 2.2 * b) * Math.sqrt(z), 0, TAU); scx.fill(); }
              const gx = W / 2 + wr(V[2] - vx, 3) * sc, gy = H / 2 + wr(V[3] - vy, 2) * sc, gr = 9 * z;   // thiên hà đích: lõi sáng + đĩa nghiêng mờ
              scx.save(); scx.translate(gx, gy); scx.rotate(0.6 + t * 0.02); scx.scale(1, 0.45); const gd = scx.createRadialGradient(0, 0, 0, 0, 0, gr * 2.2);
              gd.addColorStop(0, 'rgba(255,246,222,0.95)'); gd.addColorStop(0.18, 'rgba(220,214,255,0.45)'); gd.addColorStop(1, 'rgba(120,130,200,0)'); scx.globalAlpha = 1; scx.fillStyle = gd; scx.beginPath(); scx.arc(0, 0, gr * 2.2, 0, TAU); scx.fill(); scx.restore();
            }
            scx.globalAlpha = 1; scx.strokeStyle = scx.fillStyle = '#ff5a48'; scx.lineWidth = 2; const lk = TEL.ph === 'lock';
            scx.beginPath(); scx.arc(W / 2, H / 2, lk ? 13 + Math.sin(t * 6) : 18, 0, TAU); scx.stroke();
            for (const [a, b, c, d] of [[-34, 0, -8, 0], [8, 0, 34, 0], [0, -34, 0, -8], [0, 8, 0, 34]]) { scx.beginPath(); scx.moveTo(W / 2 + a, H / 2 + b); scx.lineTo(W / 2 + c, H / 2 + d); scx.stroke(); }
            scx.font = 'bold 13px monospace'; const alg = TEL.al > 0 && TEL.al < 3 && (TEL.ph === 'in' || lk); scx.fillText(alg ? 'ALIGN ' + TEL.al + '/2  ' + (lk ? 'OK' : Math.round(k * 100) + '%') : lk ? 'TRACKING  ' + (mw ? (TEL.mi ? 'HIP ' + (11767 + TEL.mi * 7393 % 88000) : 'SGR A*') : md === 'bh' ? BH_N[TEL.n % BH_N.length] : md === 'jup' ? 'JUPITER' + (TEL.ji ? '' : ' · GRS') : 'NGC ' + (1000 + TEL.n * 377 % 7000)) : TEL.ph === 'in' ? 'GOTO  ' + Math.round(k * 100) + '%' : 'SCAN', 8, 16); scx.fillText('x' + (z * 40).toFixed(0), W - 38, H - 9);
            if (TEL.las > 0.5) { scx.fillStyle = '#3cff6a'; scx.beginPath(); scx.arc(W - 54, 12, 4, 0, TAU); scx.fill(); scx.fillText('LASER', W - 46, 16); scx.fillStyle = '#ff5a48'; }   // đèn báo laser đang bật
            if (TEL.touch >= 0 && TEL.touch < 0.7) { const u = TEL.touch / 0.7; scx.globalAlpha = 1 - u; scx.strokeStyle = '#ffd2a0'; scx.lineWidth = 3; scx.beginPath(); scx.arc(TEL.tx * W, (1 - TEL.ty) * H, 6 + 34 * u, 0, TAU); scx.stroke(); scx.globalAlpha = 1; }   // vòng sóng chỗ ngón tay chạm
          }
          screenDraw(0);
          const holoU = { uZ: { value: 1 }, uC: { value: new THREE.Vector3() }, uQ: { value: new THREE.Vector4(0, 0, 0, 1) }, uR: { value: 1.15 }, uPx: { value: 1 }, uOp: { value: 0 } };
          const holoMat = new THREE.ShaderMaterial({ uniforms: holoU, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: `uniform float uZ, uR, uPx, uOp; uniform vec3 uC; uniform vec4 uQ; varying vec3 vC; varying float vA;
              void main() { vec3 p = (position * uQ.w + uQ.xyz - uC) * uZ; vA = uOp * (1.0 - smoothstep(uR * 0.72, uR, length(p))); vC = color.rgb;
                vec4 mv = modelViewMatrix * vec4(p, 1.0); gl_Position = projectionMatrix * mv;
                float ps = uPx * sqrt(uZ) * projectionMatrix[1][1] * (projectionMatrix[2][3] < -0.5 ? 1.0 / -mv.z : 1.0); gl_PointSize = max(1.0, ps); vA *= min(1.0, ps * ps);   // điểm nhỏ hơn 1 px: mờ theo diện tích phủ
                if (vA < 0.003) gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }`,
            fragmentShader: `varying vec3 vC; varying float vA; void main() { vec2 q = gl_PointCoord - 0.5; float r = dot(q, q); if (r > 0.25) discard; gl_FragColor = vec4(vC, vA * (1.0 - 3.2 * r)); }` });
          // NGÂN HÀ MINI (xem đầu tệp): mặt trong quả cầu = bầu trời nhìn từ tâm (ảnh trụ đẳng chữ nhật, u = atan(−x, z)) · co góc quanh ô ngắm uF ⇒ phóng to uZ lần
          //  · mặt ngoài chỉ lưới 30° + viền sáng. Lấy mẫu textureGrad với đạo hàm u không gãy ở mép ảnh (chọn u hoặc u lệch nửa vòng, cái nào đạo hàm nhỏ hơn)
          const MW_T = [[0.521, 0.519], [0.765, 0.511], [0.449, 0.522], [0.69, 0.515], [0.19, 0.507], [0.857, 0.507], [0.102, 0.503], [0.948, 0.499], [0.616, 0.521], [0.338, 0.521], [0.533, 0.593], [0.63, 0.661], [0.029, 0.499], [0.754, 0.704]];   // đích dò [u, v từ mép trên]: điểm sáng nhất mỗi vùng 70 px trên ảnh (lõi thiên hà đầu tiên)
          const mwDir = (u, v, o) => { const ph = (u - 0.5) * TAU, th = v * Math.PI; return o.set(-Math.sin(th) * Math.sin(ph), Math.cos(th), Math.sin(th) * Math.cos(ph)); };
          const MW_AX = new THREE.Vector3(0.38, 1, 0.22).normalize(), mwU = { uMap: { value: null }, uOp: { value: 0 }, uZ: { value: 1 }, uF: { value: new THREE.Vector3(0, 0, 1) }, uRet: { value: 0 }, uRr: { value: 0.16 }, uT: { value: 0 } };
          const mwMat = new THREE.ShaderMaterial({ uniforms: mwU, side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
            vertexShader: `varying vec3 vP, vN, vV; void main() { vP = position; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = -mv.xyz; gl_Position = projectionMatrix * mv; }`,
            fragmentShader: `#define PI 3.141592653589793
              uniform sampler2D uMap; uniform float uOp, uZ, uRet, uRr, uT; uniform vec3 uF; varying vec3 vP, vN, vV;
              float ln(float x) { return 1.0 - min(abs(fract(x + 0.5) - 0.5) / max(fwidth(x), 1e-4), 1.0); }
              void main() {
                vec3 d = normalize(vP), N = normalize(vN), V = isOrthographic ? vec3(0.0, 0.0, 1.0) : normalize(vV), hc = vec3(0.45, 0.85, 1.0);
                float rim = pow(1.0 - abs(dot(N, V)), 2.5), g = max(ln(asin(clamp(d.y, -1.0, 1.0)) * 6.0 / PI), ln(atan(d.x, d.z) * 6.0 / PI) * (1.0 - smoothstep(0.8, 0.97, abs(d.y))));
                if (gl_FrontFacing) { gl_FragColor = vec4(hc * (0.06 * g + 0.2 * rim), uOp); return; }
                float cz = clamp(dot(d, uF), -1.0, 1.0), th = acos(cz); vec3 ax = d - uF * cz; float al = length(ax); ax = al > 1e-5 ? ax / al : vec3(0.0);
                float t2 = th / uZ; vec3 s = uF * cos(t2) + ax * sin(t2);
                float u = atan(-s.x, s.z) / (2.0 * PI) + 0.5, v = acos(clamp(s.y, -1.0, 1.0)) / PI, u2 = fract(u + 0.5) - 0.5;
                vec2 gx = vec2(abs(dFdx(u)) < abs(dFdx(u2)) ? dFdx(u) : dFdx(u2), -dFdx(v)), gy = vec2(abs(dFdy(u)) < abs(dFdy(u2)) ? dFdy(u) : dFdy(u2), -dFdy(v));
                vec3 c = pow(textureGrad(uMap, vec2(u, 1.0 - v), gx, gy).rgb, vec3(1.7)) * 2.1 * (0.88 + 0.12 * sin(gl_FragCoord.y * 1.7 - uT * 6.0));
                vec3 e1 = normalize(abs(uF.y) < 0.95 ? cross(uF, vec3(0.0, 1.0, 0.0)) : cross(uF, vec3(1.0, 0.0, 0.0))), e2 = cross(uF, e1);
                float w = fwidth(th) * 1.2 + 0.003, ps = atan(dot(ax, e2), dot(ax, e1)), dl = abs(mod(ps + 0.25 * PI, 0.5 * PI) - 0.25 * PI);
                float ret = max(1.0 - smoothstep(0.0, w, abs(th - uRr)), (1.0 - smoothstep(0.0, w, th * sin(dl))) * step(0.45 * uRr, th) * step(th, 1.9 * uRr));
                gl_FragColor = vec4(c + hc * (0.05 * g + 0.12 * rim) + vec3(1.0, 0.36, 0.28) * ret * uRet, uOp);
              }` });
          // HỐ ĐEN MINI (xem đầu tệp): tấm vuông luôn quay về camera; mỗi điểm ảnh bắn 1 tia (camera trực giao: tia song song) vào hệ hố đen (r_s = 1, đĩa trên mặt XZ,
          //  quay quanh +Y), tích phân đường đi ánh sáng Schwarzschild bằng gia tốc tương đương −1,5 h² r⃗ / r⁵ (đúng mặt cầu photon r = 1,5, bóng b = 2,6). Tia cắt mặt
          //  đĩa (2,6 – 8,4) cộng màu ảnh đĩa (Doppler g³: phía lao tới sáng hơn · đỏ hấp dẫn √(1 − 1/r)), rơi vào chân trời ⇒ bóng đen che nền, thoát ⇒ trong suốt
          //  ⇒ ảnh đĩa phía sau tự bẻ thành vòng cung qua đỉnh + dưới bóng, vòng photon mảnh tự hiện. Hoà màu nhân sẵn alpha (ONE, 1 − alpha): đĩa cộng sáng, bóng che tối
          const BH_N = ['M87*', 'CYG X-1', 'GAIA BH1', 'V404 CYG', 'GRS 1915+105', 'TON 618'];   // chữ TRACKING trên màn iPad
          const bhU = { uMap: { value: null }, uOp: { value: 0 }, uVL: { value: new THREE.Matrix3() }, uQ: { value: 9.5 }, uT: { value: 0 }, uSize: { value: 0.7 } };   // G 24/10: bỏ ô ngắm trên hố đen
          const bhMat = new THREE.ShaderMaterial({ uniforms: bhU, transparent: true, depthWrite: false, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
            vertexShader: `uniform float uSize; varying vec2 vQ; void main() { vQ = position.xy; vec4 mv = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0); mv.xy += position.xy * uSize; gl_Position = projectionMatrix * mv; }`,
            fragmentShader: `uniform sampler2D uMap; uniform float uOp, uQ, uT; uniform mat3 uVL; varying vec2 vQ;
              const float RIN = 2.6, ROUT = 8.4;
              vec4 disk(vec3 q, vec3 v) {
                float r = length(q.xz); if (r < RIN || r > ROUT) return vec4(0.0);
                float a = atan(q.z, q.x) + uT * 0.3; vec3 c = texture2D(uMap, 0.5 + vec2(cos(a), sin(a)) * r * (0.47 / ROUT)).rgb;
                float b = 0.32 * sqrt(RIN / r), g = sqrt(1.0 - b * b) / (1.0 - b * dot(normalize(vec3(q.z, 0.0, -q.x)), -normalize(v)));
                float k = g * g * g * sqrt(1.0 - 1.0 / r) * smoothstep(RIN, RIN + 0.5, r) * (1.0 - smoothstep(ROUT - 1.5, ROUT, r));
                return vec4(c * k, min(1.0, max(c.r, max(c.g, c.b)) * k));
              }
              void main() {
                vec2 Q = vQ * uQ;
                vec3 col = vec3(0.0); float tr = 1.0, sh = 0.0;
                if (length(Q) < ROUT + 1.0) {
                  vec3 p = uVL * vec3(Q, 14.0), v = uVL * vec3(0.0, 0.0, -1.0), L = cross(p, v); float h2 = dot(L, L);
                  for (int i = 0; i < 160; i++) {
                    float r2 = dot(p, p), r = sqrt(r2);
                    if (r < 1.0) { sh = 1.0; break; }
                    if (r > 15.0 && dot(p, v) > 0.0) break;
                    float dt = clamp(0.1 * (r - 0.9), 0.025, 0.7); vec3 pn = p + v * dt; v -= 1.5 * h2 * p / (r2 * r2 * r) * dt;
                    if (p.y * pn.y < 0.0) { vec4 dc = disk(mix(p, pn, p.y / (p.y - pn.y)), v); col += tr * dc.rgb; tr *= 1.0 - 0.85 * dc.a; if (tr < 0.03) break; }
                    p = pn;
                  }
                }
                float vg = 1.0 - smoothstep(0.78, 1.0, length(vQ));   // mép tấm: mờ tròn (phóng to thì ảnh đĩa tràn ra ngoài tấm vuông)
                gl_FragColor = vec4((1.0 - exp(-col * 1.2)) * vg * uOp, (0.88 * sh * tr + 0.55 * (1.0 - tr)) * vg * uOp);   // nén sáng mềm: giữ màu vàng cam, không cháy trắng
              }` });
          // JUPITER MINI (xem đầu tệp): quả cầu ảnh "jupiter" (Mieke Roth, CC-BY-4.0 — ảnh màu 1024 × 512, mép trên là cực NAM) luôn quay xích đạo về người xem
          //  (như nhìn qua kính), tự quay 1 vòng / 50 s (thật 9,9 giờ), tối dần về mép · 4 trăng Galileo trên mặt phẳng xích đạo nghiêng 4° ⇒ thấy gần thẳng hàng như qua kính
          //  nghiệp dư: bán kính quỹ đạo nén 1,5 / 1,9 / 2,4 / 3,0 R (thật 5,9 / 9,4 / 15 / 26 R), chu kỳ 12 / 24 / 48 / 113 s giữ cộng hưởng Laplace 1 : 2 : 4 (Callisto 9,4)
          //  · dò: quay đích (lượt đầu VẾT ĐỎ LỚN) về giữa theo tiến độ ống, phóng ×2,2 và dời cho đích vào giữa, trăng mờ đi; hoà nhân sẵn alpha, ghi độ sâu (trăng sau hành tinh bị che)
          const JUP_T = [[0.625, 0.36], [0.3, 0.27], [0.86, 0.31], [0.12, 0.63], [0.47, 0.56], [0.7, 0.71], [0.2, 0.44]];   // [u, v từ mép trên ảnh]: Vết Đỏ Lớn, các vết bão sáng / tối
          const JUP_M = [[0.62, 12, 0.03, 0xe8d27a], [0.78, 24, 0.026, 0xf4f1ea], [0.98, 48, 0.04, 0xbab1a2], [1.25, 113, 0.037, 0x8e877c]];   // Io · Europa · Ganymede · Callisto: quỹ đạo (đv), chu kỳ (s), bán kính, màu
          const jupU = { uMap: { value: null }, uOp: { value: 0 }, uT: { value: 0 } };
          const jupMat = new THREE.ShaderMaterial({ uniforms: jupU, transparent: true, depthWrite: true, blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor,
            vertexShader: `varying vec2 vU; varying vec3 vN; void main() { vU = uv; vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
            fragmentShader: `uniform sampler2D uMap; uniform float uOp, uT; varying vec2 vU; varying vec3 vN;
              void main() { float mu = max(0.0, vN.z), lim = 0.35 + 0.65 * pow(mu, 0.55);
                vec3 c = texture2D(uMap, vec2(vU.x, 1.0 - vU.y)).rgb * lim * (0.92 + 0.08 * sin(gl_FragCoord.y * 1.7 - uT * 6.0)) + vec3(0.45, 0.85, 1.0) * 0.12 * pow(1.0 - mu, 3.0);
                gl_FragColor = vec4(c * uOp, 0.9 * uOp); }` });
          function jupTick(dt, t) {   // Jupiter mini: chờ — tự quay, trăng chạy · dò — quay đích về giữa + phóng · khoá — giữ · thu — quay tiếp
            const J = TEL.jup; if (!J) return; jupU.uOp.value = TEL.op * TEL.jupA; J.visible = jupU.uOp.value > 0.005; if (!J.visible) return;
            const e = TEL.e, ph = TEL.ph, [ut, vt] = JUP_T[Math.max(0, TEL.ji)], lat = (vt - 0.5) * Math.PI; jupU.uT.value = t;
            if (ph === 'in') { if (TEL.js0 == null) { TEL.js0 = TEL.jspin; let g = TAU * (0.25 - ut); while (g < TEL.js0 + 1.9) g += TAU; while (g > TEL.js0 + 1.9 + TAU) g -= TAU; TEL.js1 = g; } TEL.jspin = TEL.js0 + (TEL.js1 - TEL.js0) * sm(TEL.sl); }
            else if (ph !== 'lock') { TEL.js0 = null; TEL.jspin += dt * TAU / 50; }
            const P = J.userData.planet, Rs = 0.42 * (1 + 1.2 * e); P.rotation.y = TEL.jspin; P.scale.setScalar(Rs);
            J.quaternion.copy(camera.quaternion).multiply(_q.setFromAxisAngle(_a.set(0, 0, 1), 0.05));   // xích đạo quay về người xem, trục nghiêng 3°
            J.position.copy(TEL.hp).addScaledVector(_b.set(0, 1, 0).applyQuaternion(camera.quaternion), -Rs * Math.sin(lat) * e);   // phóng: dời cho đích vào giữa
            J.userData.moons.forEach((m, i) => { const [a, T, r] = JUP_M[i], th = J.userData.ph0[i] + t * TAU / T; m.position.set(a * Math.cos(th), a * Math.sin(th) * 0.07, a * Math.sin(th)); m.scale.setScalar(r); m.material.opacity = jupU.uOp.value * (1 - e); m.visible = m.material.opacity > 0.01; });
          }
          // ỐNG ×2 + CỘT NỐI (G 24/10 "ống kính thiên văn x2 bigger, make sure laser align with kính, hướng lên trời 75 – 80°, moving slower"): TRỤC QUANG THẬT đo từ
          //  lưới ống (tâm vòng tròn khớp các lát cắt phần ống trước + phần sau — 2 đoạn song song, lệch nhau 2 cm), dốc 29,3° lúc nghỉ; 2 điểm neo 'front' − 'back' của mẫu
          //  lệch trục thật 4° ⇒ tia laser cũ chệch ~5 m ở 70 m. Ống phóng ×2 quanh điểm kẹp TUBE_MNT (trên trục cách tâm lát trước 0,45 về đuôi, dưới trục 0,09 = đáy vòng ôm
          //  ×2). Chĩa 80°: đuôi ống ×2 sụt 0,45 dưới khớp ⇒ CỘT NỐI cao 0,46 (pier extension — người chơi kính lắp để ống dài không đập vào chân ba càng gần thiên đỉnh)
          const TUBE_K = 2, TUBE_R = 0.46, TUBE_AX = new THREE.Vector3(0.0073, 0.4899, -0.8717).normalize(), TUBE_C0 = new THREE.Vector3(0.0012, 1.2818, -0.5031);
          const TUBE_UP = new THREE.Vector3(0, 1, 0).addScaledVector(TUBE_AX, -TUBE_AX.y).normalize(), TUBE_SD = new THREE.Vector3().crossVectors(TUBE_AX, TUBE_UP), TUBE_E0 = Math.asin(TUBE_AX.y);
          const TUBE_MNT = TUBE_C0.clone().addScaledVector(TUBE_AX, -0.45).addScaledVector(TUBE_UP, -0.09), TEL_V = 0.01, TEL_A = 0.00625;   // GOTO chậm: ≤ 0,01 rad/s (0,57°/s), gia tốc 0,00625 (G 24/10 "moving slower" rồi "slower 75%": 0,07 → 0,04 → 0,01)
          const altOf = deg => deg * Math.PI / 180 - TUBE_E0;   // góc khớp độ cao cho độ cao thật (độ) của trục quang
          function telSplit(g) {   // ỐNG KÍNH tách khỏi chân + giá để xoay GOTO: tam giác có cả 3 đỉnh trong ống trụ r < 13 cm quanh trục đuôi → miệng (đo: ống + vòng ôm; giá đỡ nằm dưới)
            const tel = g.getObjectByName('telescope'), A = TEL.an; let mesh = null; tel.traverse(o => { if (o.isMesh) mesh = o; }); if (!mesh) return;
            g.updateMatrixWorld(true); const M = new THREE.Matrix4().copy(tel.matrixWorld).invert().multiply(mesh.matrixWorld), nm = new THREE.Matrix3().getNormalMatrix(M);   // hệ lưới → hệ kính (mét mẫu)
            const G = mesh.geometry, P = G.attributes.position, N = G.attributes.normal, C = G.attributes.color, I = G.index, v = new THREE.Vector3(), w = new THREE.Vector3();
            const back = new THREE.Vector3(...A.back), dir = new THREE.Vector3(...A.front).sub(back), L = dir.length(); dir.normalize();
            const PV = TEL.pv = new THREE.Vector3(A.base[0], 1.1, A.base[2]);   // khớp xoay ngay trên đầu giá (trục ống đi qua phía trên tâm chân ở cao 1,17)
            const inTube = i => { v.fromBufferAttribute(P, i).applyMatrix4(M); w.copy(v).sub(back); const t = w.dot(dir); return t > -0.12 && t < L + 0.05 && w.addScaledVector(dir, -t).length() < 0.13; };
            const parts = [[], []]; for (let k = 0; k < I.count; k += 3) { const a = I.getX(k), b = I.getX(k + 1), c = I.getX(k + 2); parts[inTube(a) && inTube(b) && inTube(c) ? 1 : 0].push(a, b, c); }
            const build = (ids, off) => { const pos = [], nor = [], col = [];
              for (const i of ids) { v.fromBufferAttribute(P, i).applyMatrix4(M).sub(off); pos.push(v.x, v.y, v.z); w.fromBufferAttribute(N, i).applyMatrix3(nm).normalize(); nor.push(w.x, w.y, w.z); col.push(C.getX(i), C.getY(i), C.getZ(i)); }
              const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); gg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3)); gg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); return gg; };
            const base = new THREE.Mesh(build(parts[0], new THREE.Vector3()), mesh.material), tube = new THREE.Mesh(build(parts[1], PV), mesh.material);
            base.name = 'Chân + giá kính'; tube.name = 'Ống kính';
            const azG = new THREE.Group(), altG = new THREE.Group(), tubeS = new THREE.Group(); azG.name = 'Khớp phương vị (GOTO)'; altG.name = 'Khớp độ cao (GOTO)'; tubeS.name = 'Ống kính ×2';
            azG.position.copy(PV); altG.position.set(0, TUBE_R, 0); tubeS.scale.setScalar(TUBE_K); tubeS.position.copy(TUBE_MNT).sub(PV).multiplyScalar(-TUBE_K); tubeS.add(tube); altG.add(tubeS); azG.add(altG);
            TEL.mntP = tubeS.position.clone(); tubeS.visible = false;   // tư thế ống trên giá (hệ khớp độ cao) · ống cất trong xe tới khi lắp
            for (const m of [base, tube, azG, altG, tubeS]) { m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; if (m.isMesh) m.castShadow = true; }
            mesh.parent.remove(mesh); mesh.geometry.dispose(); tel.add(base, azG); TEL.tube = altG; TEL.azJ = azG; TEL.tubeS = tubeS;
          }
          // TIA LASER (xem đầu tệp): dải luôn rộng ~6 điểm ảnh trên màn (nở ngang trong vertex shader theo hướng tia trên màn), cộng sáng; tán xạ khí quyển yếu dần theo
          //  khoảng cách (e^(−s/30)), lấp lánh nhẹ; lõi Gauss ~2 điểm ảnh + quầng mờ (nửa bề ngang dải 3,2 điểm ảnh). Bật lúc dò / khoá (TEL.las), chỉ khi trời tối và ống ngẩng trên chân trời
          const beamU = { uO: { value: new THREE.Vector3() }, uD: { value: new THREE.Vector3(0, 1, 0) }, uLen: { value: 70 }, uW: { value: 3 }, uRes: { value: new THREE.Vector2(1, 1) }, uOn: { value: 0 }, uT: { value: 0 } };
          const beam = (() => { const N = 8, S = [], X = [], I = []; for (let i = 0; i <= N; i++) for (const x of [-1, 1]) { S.push(i / N); X.push(x); }
            for (let i = 0; i < N; i++) I.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
            const gg = new THREE.BufferGeometry(); gg.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(S.length * 3), 3)); gg.setAttribute('aS', new THREE.Float32BufferAttribute(S, 1)); gg.setAttribute('aX', new THREE.Float32BufferAttribute(X, 1)); gg.setIndex(I);
            const m = new THREE.Mesh(gg, new THREE.ShaderMaterial({ uniforms: beamU, side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,   // 2 mặt: chiều quấn tam giác trên màn đổi theo hướng tia
              vertexShader: `attribute float aS, aX; uniform vec3 uO, uD; uniform float uLen, uW; uniform vec2 uRes; varying float vS, vX;
                void main() { vec3 p = uO + uD * (aS * uLen); vec4 a = projectionMatrix * viewMatrix * vec4(p, 1.0), b = projectionMatrix * viewMatrix * vec4(p + uD * 0.5, 1.0);
                  vec2 dv = (b.xy / b.w - a.xy / a.w) * uRes, dd = length(dv) > 1e-4 ? normalize(dv) : vec2(1.0, 0.0);
                  a.xy += vec2(-dd.y, dd.x) * aX * uW * 2.0 / uRes * a.w; vS = aS; vX = aX; gl_Position = a; }`,
              fragmentShader: `uniform float uOn, uT, uLen; varying float vS, vX;
                void main() { float s = vS * uLen, I = uOn * exp(-s / 30.0) * (0.86 + 0.14 * sin(uT * 23.0 + s * 0.7));
                  gl_FragColor = vec4(vec3(0.25, 1.0, 0.35) * (exp(-vX * vX * 7.0) + 0.35 * exp(-vX * vX * 1.6)) * I, 1.0); }` }));
            m.name = 'Tia laser xanh'; m.frustumCulled = false; m.visible = false; m.raycast = () => {}; m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; scene.add(m); return m; })();
          function telKit(tel) {   // PHỤ KIỆN KÍNH NGHIỆP DƯ (xem đầu tệp) — hệ mẫu (mét); trên ống: hệ khớp (= hệ mẫu − PV)
            const A = TEL.an, PV = TEL.pv, J = TEL.tubeS, back = new THREE.Vector3(...A.back), dir = TUBE_AX, Y = new THREE.Vector3(0, 1, 0);
            const up = TUBE_UP, sd = TUBE_SD, tF = 0.136;   // sd: bên phải ống (nhìn từ đuôi) · tF: miệng ống (tham số trục từ TUBE_C0)
            const blk = new THREE.MeshLambertMaterial({ color: 0x1a1b1e }), alu = new THREE.MeshLambertMaterial({ color: 0x9aa1a6 }), tank = new THREE.MeshLambertMaterial({ color: 0x2b2d31 }), rd = new THREE.MeshLambertMaterial({ color: 0x8e2a1f });
            const cyl = (r, l, m, n = 10, open = false) => new THREE.Mesh(new THREE.CylinderGeometry(r, r, l, n, 1, open), m);
            const put = (o, p, d, par) => { o.position.copy(p); if (d) o.quaternion.setFromUnitVectors(Y, d); o.castShadow = true; o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; par.add(o); return o; };
            const wire = (pts, par) => { const c = new THREE.CatmullRomCurve3(pts), l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(c.getPoints(24)), new THREE.LineBasicMaterial({ color: 0x111214 })); l.userData.noBatch = l.userData.noBake = l.userData.noCollide = true; l.raycast = () => {}; par.add(l); return l; };
            // bút laser xanh 532 nm trong giá kẹp: thân Ø 22 mm dài 0,13 SONG SONG TRỤC QUANG THẬT, 2 vòng kẹp nhôm + chân đế xuống vòng ôm sau (lệch phải-trên, cách trục 0,135)
            const on = up.clone().multiplyScalar(0.09).addScaledVector(sd, 0.1), onN = on.clone().normalize(), pA = TUBE_C0.clone().addScaledVector(dir, -0.48), pL = pA.clone().add(on).sub(PV);
            put(cyl(0.011, 0.13, blk), pL, dir, J); for (const k of [-0.04, 0.04]) put(cyl(0.016, 0.012, alu), pL.clone().addScaledVector(dir, k), dir, J);
            put(new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.03, 0.05), alu), pA.clone().addScaledVector(onN, 0.112).sub(PV), onN, J);
            put(cyl(0.006, 0.004, rd, 8), pL.clone().addScaledVector(dir, -0.067), dir, J);   // nút bấm đỏ ở đuôi bút
            TEL.laser = { pE: pL.clone().addScaledVector(dir, 0.066), dir: dir.clone() }; TEL.penP = pL.clone().add(PV); TEL.eyeP = back.clone().addScaledVector(up, 0.09);   // miệng phát tia (hệ ống) · hướng = trục quang · bút + thị kính (hệ mẫu)
            // đai sưởi chống sương quanh ống che sương (đêm Pleiku ẩm) + hộp điều khiển kẹp trên đầu giá + dây
            const P = J.children.find(o => o.isMesh).geometry.attributes.position, v = new THREE.Vector3(); let rF = 0.06;
            for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).add(PV).sub(TUBE_C0); const t = v.dot(dir); if (t > tF - 0.12 && t < tF - 0.02) rF = Math.max(rF, v.addScaledVector(dir, -t).length()); }
            const pS = TUBE_C0.clone().addScaledVector(dir, tF - 0.075).sub(PV); put(cyl(rF + 0.004, 0.035, blk, 20, true), pS, dir, J).material = new THREE.MeshLambertMaterial({ color: 0x1a1b1e, side: THREE.DoubleSide });
            // chân: tâm, góc 3 càng ở mặt đất (cụm đỉnh y < 0,05), bán kính càng theo cao độ (0,036 ở đầu giá 0,95 → chân)
            const base = tel.children.find(o => o.name === 'Chân + giá kính'), B = base.geometry.attributes.position, cx = A.base[0], cz = A.base[2], ang = [];
            for (let i = 0; i < B.count; i++) { v.fromBufferAttribute(B, i); if (v.y < 0.05) ang.push(Math.atan2(v.x - cx, v.z - cz)); }
            const legs = []; for (const a of ang) { const g = legs.find(L2 => Math.abs(Math.atan2(Math.sin(a - L2.a), Math.cos(a - L2.a))) < 0.6); if (g) { g.s += Math.sin(a); g.c += Math.cos(a); g.n++; g.a = Math.atan2(g.s, g.c); } else legs.push({ a, s: Math.sin(a), c: Math.cos(a), n: 1 }); }
            legs.sort((p1, p2) => p2.n - p1.n); legs.length = Math.min(3, legs.length); const rAt = y => 0.036 + (0.278 - 0.036) * (1 - y / 0.95);
            TEL.legs = legs; TEL.legPt = (i, y) => new THREE.Vector3(cx + Math.sin(legs[i].a) * rAt(y), y, cz + Math.cos(legs[i].a) * rAt(y));   // điểm trên càng i ở cao y (hệ mẫu)
            { const c = new THREE.Vector3(); let n = 0; for (let i = 0; i < B.count; i++) { v.fromBufferAttribute(B, i); if (v.y > 0.55 && v.y < 0.95 && Math.hypot(v.x - cx, v.z - cz) > 0.1) { c.add(v); n++; } }
              TEL.cwP = n ? c.divideScalar(n) : new THREE.Vector3(cx + 0.12, 0.75, cz); }   // quả đối trọng (giá xích đạo): tâm các đỉnh lệch tâm 0,55 – 0,95
            // CỘT NỐI (pier extension) từ đỉnh đầu giá lên khớp độ cao + đầu alt-az GoTo (hộp động cơ, quay theo phương vị) + ray đuôi én dưới ống
            const yTop = PV.y + TUBE_R; put(cyl(0.032, yTop - 1.03, alu, 14), new THREE.Vector3(PV.x, (yTop + 1.03) / 2 - 0.05, PV.z), null, tel);
            put(cyl(0.05, 0.03, blk, 14), new THREE.Vector3(PV.x, 1.045, PV.z), null, tel);   // vòng kẹp chân cột
            put(new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.085, 0.13), blk), new THREE.Vector3(0, TUBE_R - 0.06, 0), null, TEL.azJ);
            put(cyl(0.018, 0.02, rd, 10), new THREE.Vector3(0.06, TUBE_R - 0.06, 0), new THREE.Vector3(1, 0, 0), TEL.azJ);   // núm khoá đỏ
            put(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.016, 0.3), alu), new THREE.Vector3(0, 0.006, 0), null, TEL.tube).quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), dir);
            if (legs.length === 3) {
              // khay thị kính tam giác giữa 3 càng (cao 0,42) + 3 thị kính đứng trong lỗ
              const yT = 0.42, tri = put(cyl(rAt(yT) - 0.004, 0.012, alu, 3), new THREE.Vector3(cx, yT, cz), null, tel); tri.rotation.y = legs[0].a;
              for (const L2 of legs) { const a = L2.a + Math.PI / 3, r = 0.055; put(cyl(0.017, 0.05, blk, 10), new THREE.Vector3(cx + Math.sin(a) * r, yT + 0.031, cz + Math.cos(a) * r), null, tel); }
              // bình điện 12 V dưới chân, ở khe giữa 2 càng xa đầu người nằm nhất (hệ mẫu: +z = về phía đầu) + dây lên đầu giá
              let gb = null, gz = 9; for (let i = 0; i < 3; i++) { const a1 = legs[i].a, a2 = legs[(i + 1) % 3].a, m = Math.atan2(Math.sin(a1) + Math.sin(a2), Math.cos(a1) + Math.cos(a2)); if (Math.cos(m) < gz) { gz = Math.cos(m); gb = m; } }
              const pT = new THREE.Vector3(cx + Math.sin(gb) * 0.13, 0.11, cz + Math.cos(gb) * 0.13), bx = put(new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.12), tank), pT, null, tel); bx.rotation.y = gb;
              put(new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.05, 0.004), rd), pT.clone().add(new THREE.Vector3(Math.sin(gb) * 0.061, 0.04, Math.cos(gb) * 0.061)), null, tel).rotation.y = gb;   // nhãn đỏ mặt ngoài
              const lg = legs.reduce((q, L2) => Math.abs(Math.atan2(Math.sin(L2.a - gb), Math.cos(L2.a - gb))) < Math.abs(Math.atan2(Math.sin(q.a - gb), Math.cos(q.a - gb))) ? L2 : q, legs[0]);
              wire([pT.clone().setY(0.22), new THREE.Vector3(cx + Math.sin(lg.a) * rAt(0.35), 0.35, cz + Math.cos(lg.a) * rAt(0.35)), new THREE.Vector3(cx + Math.sin(lg.a) * rAt(0.75), 0.75, cz + Math.cos(lg.a) * rAt(0.75)), new THREE.Vector3(cx, 0.97, cz)], tel);
              // hộp điều khiển sưởi trên càng gần nhất + dây theo ống lên đai (dây đi tới khớp rồi dọc ống — vẽ 2 khúc: chân → đầu giá, đầu giá → đai trên ống)
              const lc = legs.find(L2 => L2 !== lg) || legs[0], pC = new THREE.Vector3(cx + Math.sin(lc.a) * (rAt(0.7) + 0.02), 0.7, cz + Math.cos(lc.a) * (rAt(0.7) + 0.02));
              put(new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.09, 0.03), blk), pC, null, tel).rotation.y = lc.a;
              wire([pC.clone().setY(0.75), new THREE.Vector3(cx, 0.9, cz), new THREE.Vector3(cx, 1.02, cz)], tel);
              wire([TUBE_MNT.clone().sub(PV), TUBE_C0.clone().addScaledVector(dir, -0.2).addScaledVector(up, -0.075).sub(PV), pS.clone().addScaledVector(up, -(rF + 0.006))], J);
            }
          }
          function telArm(a, b, m) {   // đoạn trụ đơn vị m nối a → b (hệ kính)
            const d = _b.subVectors(b, a), L = d.length(); m.position.copy(a).addScaledVector(d, 0.5); m.scale.set(1, Math.max(1e-3, L), 1); if (L > 1e-5) m.quaternion.setFromUnitVectors(UP, d.multiplyScalar(1 / L));
          }
          function telGoto() {   // chạm màn: chọn đích mới (đổi ≥ 0,3 rad), ống xoay tới · thiên hà mini phóng dần vào sao đích / Ngân Hà: ô ngắm dò xoắn ốc tới điểm sáng · màn lia theo tiến độ xoay
            let az, al; do { az = Math.max(-1, Math.min(1, TEL.azT + (Math.random() < 0.5 ? -1 : 1) * (0.15 + 0.2 * Math.random()))); al = altOf(75 + 5 * Math.random()); } while (Math.abs(az - TEL.azT) < 0.12);   // chĩa cao 75 – 80°, phương vị đổi 0,15 – 0,35 rad (xoay chậm ⇒ bước ngắn: mỗi lượt dò 15 – 40 s)
            TEL.azT = az; TEL.altT = al; TEL.sl0 = Math.max(1e-3, Math.hypot(TEL.azT - TEL.az, TEL.altT - TEL.alt)); TEL.inDur = Math.max(6.5, TEL.sl0 / TEL_V + 3.5);
            if (TEL.mode === 'jup') { let ji; do ji = TEL.ji < 0 ? 0 : (Math.random() * JUP_T.length) | 0; while (ji === TEL.ji); TEL.ji = ji; } TEL.js0 = null;   // Jupiter (chỉ lượt Jupiter): lượt đầu mỗi buổi = Vết Đỏ Lớn
            const H = TEL.holo, P = H.geometry.attributes.position, Q = holoU.uQ.value;   // chọn sao đích trong nhánh xoắn (0,3 – 0,9 bán kính)
            for (let i = 0; i < 40; i++) { const j = (Math.random() * P.count) | 0; TEL.tgt.set(P.getX(j), P.getY(j), P.getZ(j)).multiplyScalar(Q.w).add(_a.set(Q.x, Q.y, Q.z)); const r = Math.hypot(TEL.tgt.x, TEL.tgt.z); if (r > 0.3 && r < 0.9) break; }
            let mi; do mi = TEL.mi < 0 ? 0 : (Math.random() * MW_T.length) | 0; while (mi === TEL.mi);   // Ngân Hà: lượt đầu dò lõi thiên hà, sau đó điểm sáng khác lượt trước
            TEL.mi = mi; mwDir(MW_T[mi][0], MW_T[mi][1], TEL.mt); TEL.mr0.copy(TEL.mr);
            TEL.al = Math.min(3, (TEL.al || 0) + 1);   // 2 lượt đầu mỗi buổi = cân chỉnh 2 sao (giá GoTo), sau đó mới GOTO đích
            TEL.ph = 'in'; TEL.pk = 0; TEL.n++; TEL.v[0] = TEL.v[2]; TEL.v[1] = TEL.v[3]; TEL.v[2] = Math.random() * 3; TEL.v[3] = Math.random() * 2;
          }
          const TEL_OFF = 0.72;   // tâm chân kính cách trục thảm (G 24/10 "vị trí engineer nằm nên gần telescope": 1,0 → 0,72 — càng gần nhất cách mép thảm ~0,03)
          function telPlace() {   // dựng kính cạnh đầu thảm (phía trống hơn), màn hình hướng về mắt người nằm, chỗ nằm của chó phía bên kia
            const P = spot(), A = TEL.an; if (!P || !TEL.g) return;
            const head = P.c.clone().addScaledVector(P.f, -0.72), clr = sd => { const x = head.x + P.f.x * 0.12 + P.side.x * sd * TEL_OFF, z = head.z + P.f.z * 0.12 + P.side.z * sd * TEL_OFF; let m = 9; for (const o of obstacleCoords) m = Math.min(m, Math.hypot(o.x - x, o.z - z) - o.r); for (const o of ENG_PROPS) m = Math.min(m, Math.hypot(o.x - x, o.z - z) - o.r); return m; };
            TEL.sd = clr(1) >= clr(-1) ? 1 : -1;
            const base = head.clone().addScaledVector(P.f, 0.12).addScaledVector(P.side, TEL.sd * TEL_OFF), yaw = Math.atan2(head.x - base.x, head.z - base.z), g = TEL.g;
            g.rotation.y = yaw; g.scale.setScalar(1.1); const ob = new THREE.Vector3(...A.base).multiplyScalar(1.1).applyAxisAngle(UP, yaw);
            g.position.set(base.x - ob.x, cowY(base.x, base.z), base.z - ob.z); g.updateMatrixWorld(true);
            for (const [L, o] of [[ENG_PROPS, TEL.propR], [obstacleCoords, TEL.obsR]]) { const i = o ? L.indexOf(o) : -1; if (i >= 0) L.splice(i, 1); }   // đặt lại (chỗ thảm đổi): bỏ vật cản cũ của kính
            ENG_PROPS.push(TEL.propR = { x: base.x, z: base.z, r: 0.36 }); obstacleCoords.push(TEL.obsR = { x: base.x, y: g.position.y, z: base.z, r: 0.38, h: 1.7 });   // vòng chân ba càng ~0,31 (×1,1)
            const eye = head.clone(); eye.y = P.c.y + 0.17;
            // màn: tay đỡ từ đuôi ống chúc xuống, tâm màn cao 0,72 cách chân kính 0,45 về phía đầu người nằm; mặt màn quay về đầu, chúc 6° (người nằm nghiêng
            //  đầu sang là xem được; camera nhìn từ trên vẫn thấy mặt màn — hướng thẳng vào mắt thì màn chúc gần như úp xuống, nhìn từ trên chỉ thấy lưng)
            TEL.sc.set(base.x + (head.x - base.x) * 0.45, P.c.y + 0.72, base.z + (head.z - base.z) * 0.45);
            const scr = TEL.scr; scr.position.copy(TEL.sc); scr.lookAt(_a.set(head.x, TEL.sc.y - 0.1 * Math.hypot(head.x - TEL.sc.x, head.z - TEL.sc.z), head.z)); scene.add(scr); scr.updateMatrixWorld(true);
            TEL.p0 = g.position.clone(); TEL.q0 = g.quaternion.clone(); TEL.grip = new THREE.Vector3(A.base[0], 0.9, A.base[2]).multiplyScalar(1.1); TEL.base = base.clone();   // đầu chân kính (chỗ cầm)
            TEL.drop = base.clone().add(_a.subVectors(head, base).setY(0).normalize().multiplyScalar(0.6)); g.visible = false;   // chỗ đứng đặt / nhấc kính (giữa kính và đầu thảm) · cất trong xe tới khi ngắm sao
            g.attach(scr); TEL.restP = scr.position.clone(); TEL.restQ = scr.quaternion.clone(); TEL.sv = 0; TEL.viewP = null;   // tư thế nghỉ của màn trong hệ kính (đi theo kính khi xách)
            if (!TEL.arm) { const am = new THREE.MeshLambertMaterial({ color: 0x1c1d20 }), seg = () => new THREE.Mesh(new THREE.CylinderGeometry(0.0105, 0.0105, 1, 7), am), jnt = r => new THREE.Mesh(new THREE.SphereGeometry(r, 8, 6), am);
              TEL.arm = { a1: seg(), a2: seg(), j0: jnt(0.022), j1: jnt(0.018), j2: jnt(0.016), B: new THREE.Vector3(A.base[0], 0.95, A.base[2]) };   // tay đỡ 2 khúc: khớp gốc trên đầu giá · khuỷu · khớp sau lưng màn (hệ kính)
              for (const k of ['a1', 'a2', 'j0', 'j1', 'j2']) { const m = TEL.arm[k]; m.castShadow = true; m.userData.noBatch = m.userData.noBake = m.userData.noCollide = true; g.add(m); } }
            TEL.dog = null; dogSpotOf();
          }
          function dogSpotOf() {   // chỗ nằm của chó: sát mép thảm phía không có kính, ngang ngực chủ, đầu về phía đầu thảm, hơi quay vào chủ
            const P = spot(); if (!P) return null;
            return TEL.dog || (TEL.dog = { x: P.c.x - P.side.x * TEL.sd * 0.82 - P.f.x * 0.15, z: P.c.z - P.side.z * TEL.sd * 0.82 - P.f.z * 0.15, yaw: Math.atan2(-P.f.x, -P.f.z) - TEL.sd * 0.25 });
          }
          {   // màn hình iPad: khung nhôm tối + mặt kính (canvas) + tay đỡ (trụ cao 1, kéo dài tới đuôi ống)
            const scr = new THREE.Group(); scr.name = 'Màn hình kính thiên văn';
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.272, 0.196, 0.008), new THREE.MeshLambertMaterial({ color: 0x2a2c30 })); scr.add(body);
            const face = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.174), new THREE.MeshBasicMaterial({ map: scTex, toneMapped: false })); face.position.z = 0.0045; scr.add(face);
            const hold = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.07, 0.014), new THREE.MeshLambertMaterial({ color: 0x1c1d20 })); hold.position.z = -0.011; scr.add(hold);   // đế kẹp sau lưng màn (nối khớp tay đỡ)
            scr.traverse(o => { o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; if (o.isMesh) o.castShadow = true; });
            scr.scale.setScalar(1.5); TEL.scr = scr;   // G 24/10 "màn hình x1.5 bigger": 0,41 × 0,29 (cỡ iPad 13" + viền)
          }
          { const TEL_GLB = window.__teleGlb || 'https://michaeltran75.github.io/3d-garden/models/telescope.glb', GAL_GLB = window.__galGlb || 'https://michaeltran75.github.io/3d-garden/models/galaxy.glb';   // đường dẫn tuyệt đối: bản một tệp nhúng Wix cũng nạp được
            ldTrack(Promise.all([import('https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js'), import('https://esm.sh/three@0.160.0/examples/jsm/libs/meshopt_decoder.module.js')])
              .then(([{ GLTFLoader }, { MeshoptDecoder }]) => { const L = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder); return Promise.all([L.loadAsync(TEL_GLB), L.loadAsync(GAL_GLB)]); })
              .then(ldAfter).then(([tg, gg]) => {
                const g = new THREE.Group(); g.name = 'Kính thiên văn (Telescope)'; TEL.an = tg.scene.getObjectByName('telescope').userData; g.add(tg.scene);
                g.traverse(o => { o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; if (o.isMesh) { o.material = new THREE.MeshLambertMaterial({ vertexColors: true }); o.castShadow = true; } });
                scene.add(g); TEL.g = g; telSplit(g); telKit(g.getObjectByName('telescope')); telPlace();
                let pts = null; gg.scene.traverse(o => { if (o.isPoints) pts = o; });
                holoU.uQ.value.set(pts.position.x, pts.position.y, pts.position.z, pts.scale.x);   // phép giải lượng tử (int16 chuẩn hoá → toạ độ mẫu) làm trong shader
                const H = new THREE.Points(pts.geometry, holoMat); H.name = 'Thiên hà mini'; H.frustumCulled = false; H.visible = false; H.scale.setScalar(0.6); H.rotation.x = 0.42; H.userData.noBatch = H.userData.noCollide = true;
                scene.add(H); TEL.holo = H;
              }).catch(err => console.warn('kính thiên văn / thiên hà:', err)));
            const M = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 40), mwMat); M.name = 'Ngân Hà mini'; M.frustumCulled = false; M.visible = false; M.scale.setScalar(0.55); M.raycast = () => {};
            M.quaternion.setFromAxisAngle(_a.set(1, 0, 0.3).normalize(), 0.45); M.userData.noBatch = M.userData.noBake = M.userData.noCollide = true; scene.add(M); TEL.mw = M;
            ldTrack(new Promise(ldR => new THREE.TextureLoader().load(window.__mwJpg || 'https://michaeltran75.github.io/3d-garden/models/milkyway.jpg', tx => { tx.wrapS = THREE.RepeatWrapping; tx.anisotropy = 4; mwU.uMap.value = tx; TEL.mwImg = tx.image; ldR(); }, undefined, err => { console.warn('Ngân Hà:', err); ldR(); })));
            const BH = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), bhMat); BH.name = 'Hố đen mini'; BH.frustumCulled = false; BH.visible = false; BH.raycast = () => {};
            BH.userData.noBatch = BH.userData.noBake = BH.userData.noCollide = true; scene.add(BH); TEL.bh = BH;
            ldTrack(new Promise(ldR => new THREE.TextureLoader().load(window.__bhJpg || 'https://michaeltran75.github.io/3d-garden/models/blackhole.jpg', tx => { tx.anisotropy = 4; bhU.uMap.value = tx; TEL.bhImg = tx.image; ldR(); }, undefined, err => { console.warn('Hố đen:', err); ldR(); })));
            { const J = new THREE.Group(), pl = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 32), jupMat); J.name = 'Jupiter mini'; pl.name = 'Jupiter'; J.add(pl); J.visible = false;
              J.userData.planet = pl; J.userData.ph0 = JUP_M.map(() => Math.random() * TAU); J.userData.moons = JUP_M.map(([, , , c]) => { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 12, 8), new THREE.MeshBasicMaterial({ color: c, transparent: true, depthWrite: false, toneMapped: false })); J.add(m); return m; });
              J.traverse(o => { o.frustumCulled = false; o.raycast = () => {}; o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; }); scene.add(J); TEL.jup = J; }
            ldTrack(new Promise(ldR => new THREE.TextureLoader().load(window.__jupJpg || 'https://michaeltran75.github.io/3d-garden/models/jupiter.jpg', tx => { tx.anisotropy = 4; jupU.uMap.value = tx; TEL.jupImg = tx.image; ldR(); }, undefined, err => { console.warn('Jupiter:', err); ldR(); })));
          }
          function telTick(e, dt, t) {   // mỗi khung: kính xách / đặt theo bàn tay phải, màn kính bật khi nằm, thiên hà mini trên đầu (tự quay + nhịp dò tìm), màn kính dò theo
            if (!TEL.g || !TEL.p0) return;
            const G = TEL.g; G.visible = TEL.out;
            if (TEL.out && TEL.lift > 0.001) {   // TEL.lift: 0 đứng trên chỗ dựng · 1 xách chéo trong tay phải (ống trước, chân ra sau)
              e.wrists[0].updateWorldMatrix(true, false); e.wrists[0].localToWorld(_b.set(0, -0.02, 0.05));
              _q.setFromAxisAngle(UP, e.g.rotation.y + Math.PI).multiply(_q2.setFromAxisAngle(_c.set(1, 0, 0), -0.95)); G.quaternion.copy(TEL.q0).slerp(_q, TEL.lift);
              _c.copy(TEL.grip).applyQuaternion(TEL.q0).add(TEL.p0).lerp(_b, TEL.lift); G.position.copy(_c).sub(_a.copy(TEL.grip).applyQuaternion(G.quaternion)); TEL.mv = 1;
            } else if (TEL.mv) { TEL.mv = 0; G.position.copy(TEL.p0); G.quaternion.copy(TEL.q0); }
            if (TEL.tube) {   // GOTO: ống xoay chậm tới đích (phương vị · độ cao), tăng tốc / hãm êm, ≤ 0,04 rad/s (2,3°/s) — chỉ khi ống đã lắp, tay không đang chỉnh
              const da = TEL.azT - TEL.az, dl = TEL.altT - TEL.alt, d = Math.hypot(da, dl), mot = TEL.tubeOn && !TEL.hand;
              TEL.slV = mot && d > 1e-4 ? Math.min(TEL_V, TEL.slV + dt * TEL_A, Math.sqrt(2 * TEL_A * d)) : 0; if (mot && d > 1e-4) { const k = Math.min(d, TEL.slV * dt) / d; TEL.az += da * k; TEL.alt += dl * k; }
              TEL.azJ.rotation.y = TEL.az; TEL.tube.rotation.x = TEL.alt;
              const TS = TEL.tubeS; TS.visible = TEL.tubeOn || TEL.hold > 0;   // ống: trên giá (TEL.mntP) · đang bê / đang lắp (TEL.holdM thế giới, update() tính cùng khung với tay)
              if (TEL.hold > 0) { TEL.tube.updateWorldMatrix(true, false); _m4.copy(TEL.tube.matrixWorld).invert().multiply(TEL.holdM).decompose(TS.position, TS.quaternion, TS.scale); }
              else { TS.position.copy(TEL.mntP); TS.quaternion.identity(); TS.scale.setScalar(TUBE_K); }
            }
            if (TEL.scr && TEL.restP) {   // màn: nghỉ (hệ kính) ↔ trước mặt người nằm (thế giới) theo TEL.sv; vòng cung nhấc lên giữa đường · tay đỡ 2 khúc tới lưng màn
              const scr = TEL.scr, sv = sm(TEL.sv);
              if (sv > 1e-3 && TEL.viewP) { const vp = G.worldToLocal(_b.copy(TEL.viewP)); scr.position.copy(TEL.restP).lerp(vp, sv); scr.position.y += 0.12 * Math.sin(Math.PI * sv);
                scr.quaternion.copy(TEL.restQ).slerp(_q.copy(G.quaternion).invert().multiply(TEL.viewQ), sv); }
              else { scr.position.copy(TEL.restP); scr.quaternion.copy(TEL.restQ); }
              scr.updateMatrix(); scr.updateMatrixWorld(true); scr.getWorldPosition(TEL.sc);
              const R = TEL.arm; if (R) {
                const B = R.B, Sx = _c.set(0, 0, -0.025).applyQuaternion(scr.quaternion).add(scr.position), d = _a.subVectors(Sx, B), dd = d.length(), l = 0.62 / G.scale.x;
                const E = R.E || (R.E = new THREE.Vector3()); E.copy(B).addScaledVector(d, 0.5);
                if (dd < 2 * l) { const up = _b.set(0, 1, 0).addScaledVector(d, -d.y / (dd * dd)).normalize(); E.addScaledVector(up, Math.sqrt(l * l - dd * dd / 4)); }   // khuỷu nhô lên như tay đèn bàn
                telArm(B, E, R.a1); telArm(E, Sx, R.a2); R.j0.position.copy(B); R.j1.position.copy(E); R.j2.position.copy(Sx);
              }
            }
            TEL.touch = TEL.touch >= 0 ? TEL.touch + dt : -1; if (TEL.touch > 0.8) TEL.touch = -1;
            { const asmL = S.st === 'tfnd' && S.k > 1.4 && S.k < 4.2 && Math.sin(S.k * 5) > -0.4;   // căn kính tìm / laser khi lắp: chớp từng nhát
              const on = ((S.st === 'lie' && TEL.op > 0.5 && (TEL.ph === 'in' || TEL.ph === 'lock')) || asmL) && nightFactor > 0.4 && !!TEL.laser && TEL.tubeOn;   // laser: chỉ bật lúc dò / khoá / căn, trời tối (an toàn: tắt khi không cần, không chiếu xuống dưới chân trời)
              TEL.las += ((on ? 1 : 0) - TEL.las) * Math.min(1, dt * 8); beam.visible = TEL.las > 0.01 && G.visible;
              if (beam.visible) { const J = TEL.tubeS; J.updateWorldMatrix(true, false); J.localToWorld(beamU.uO.value.copy(TEL.laser.pE)); beamU.uD.value.copy(TEL.laser.dir).transformDirection(J.matrixWorld);
                beamU.uOn.value = TEL.las * (beamU.uD.value.y > 0.03 ? 1 : 0); beamU.uT.value = t; renderer.getDrawingBufferSize(beamU.uRes.value); beamU.uW.value = 3.2 * renderer.getPixelRatio(); } }
            const lying = S.st === 'down' || S.st === 'lie', on = S.st === 'lie' && S.k > 1.5;
            if (lying !== TEL.scrOn) { TEL.scrOn = lying; screenDraw(t); }
            TEL.op += ((on ? 1 : 0) - TEL.op) * (1 - Math.exp(-dt * (on ? 0.7 : 2.2)));
            const H = TEL.holo, M = TEL.mw; if (!H) return;
            if (TEL.op <= 0.01) { H.visible = M.visible = false; TEL.ph = 'out'; TEL.pk = 0; TEL.e = 0; TEL.z = 1; TEL.bh.visible = false; if (TEL.jup) TEL.jup.visible = false; TEL.mode = mwU.uMap.value ? 'mw' : bhU.uMap.value ? 'bh' : 'gal'; for (const m of ['mw', 'bh', 'jup', 'gal']) TEL[m + 'A'] = TEL.mode === m ? 1 : 0; TEL.mi = TEL.ji = -1; TEL.al = 0; return; }   // mỗi buổi: lượt đầu Ngân Hà
            const hp = (TEL.tube || G).getWorldPosition(TEL.hp); hp.y += 2.2; H.position.copy(hp); M.position.copy(hp); H.rotation.y += dt * 0.14;   // trên đầu kính (G 23/10) — cao 2,2 trên khớp: ống ×2 chĩa 80° lên tới ~1,3
            TEL.pk += dt; const sm2 = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
            if (TEL.ph === 'out' && TEL.pk > 3.5) TEL.tapReq = true;   // tới lúc dò sao mới: chờ người nằm chạm màn (scrHand → telGoto)
            else if (TEL.ph === 'in' && TEL.pk > TEL.inDur && TEL.slV === 0) { TEL.ph = 'lock'; TEL.pk = 0; }
            else if (TEL.ph === 'lock' && TEL.pk > 3.2) { TEL.ph = 'back'; TEL.pk = 0; }
            else if (TEL.ph === 'back' && TEL.pk > 5) { TEL.ph = 'out'; TEL.pk = 0; const ok = { mw: !!mwU.uMap.value, bh: !!bhU.uMap.value, jup: !!jupU.uMap.value, gal: true }, O = ['mw', 'bh', 'jup', 'gal']; let i = O.indexOf(TEL.mode); do i = (i + 1) % 4; while (!ok[O[i]]); TEL.mode = O[i]; }   // hết lượt: Ngân Hà → hố đen → Jupiter → thiên hà mini → …
            TEL.e = TEL.ph === 'in' ? sm2(TEL.pk / TEL.inDur) : TEL.ph === 'lock' ? 1 : TEL.ph === 'back' ? 1 - sm2(TEL.pk / 5) : 0;
            TEL.sl = TEL.ph === 'in' ? 1 - Math.min(1, Math.hypot(TEL.azT - TEL.az, TEL.altT - TEL.alt) / TEL.sl0) : 1;   // màn kính lia theo đúng tiến độ ống xoay, giữ đích khi thu nhỏ
            TEL.z = 1 + 2.4 * TEL.e; holoU.uZ.value = TEL.z; holoU.uC.value.copy(TEL.tgt).multiplyScalar(TEL.e);   // sao đích dời dần về giữa khi phóng to
            for (const m of ['mw', 'bh', 'jup', 'gal']) TEL[m + 'A'] += ((TEL.mode === m ? 1 : 0) - TEL[m + 'A']) * (1 - Math.exp(-dt * 1.4));   // đổi lượt: mờ chéo ~2 s
            holoU.uOp.value = 0.5 * TEL.op * TEL.galA; H.visible = holoU.uOp.value > 0.005; holoU.uPx.value = 0.0084 * renderer.domElement.height / 2;   // to gấp đôi ⇒ hạt gấp đôi
            mwTick(dt, t); bhTick(dt, t); jupTick(dt, t);
            if (TEL.scrOn && (TEL.scrT -= dt) <= 0) { TEL.scrT = 0.12; screenDraw(t); }
          }
          function bhTick(dt, t) {   // hố đen mini: chờ — đĩa lắc chậm (cuộn ±0,3 rad, nghiêng 17–34° so với mặt màn hình) · dò — theo tiến độ ống,
            //  đĩa nghiêng dần về gần cạnh (8°) cho thấy rõ vòng cung trên bóng, phóng ×1,8 (G 24/10: không còn ô ngắm). Hệ hố đen tính theo camera (ảnh nổi luôn quay về người xem)
            const B = TEL.bh, ph = TEL.ph, e = TEL.e; bhU.uOp.value = TEL.op * TEL.bhA; B.visible = bhU.uOp.value > 0.005; if (!B.visible) return;
            B.position.copy(TEL.hp); bhU.uT.value = t; bhU.uQ.value = 9.5 / (1 + 0.8 * e);
            const roll = TEL.bhRoll = 0.3 * Math.sin(t * 0.13) * (1 - e), tilt = TEL.bhTilt = (0.45 + 0.15 * Math.sin(t * 0.09)) * (1 - e) + 0.14 * e;
            const n = _a.set(Math.sin(roll) * Math.cos(tilt), Math.cos(roll) * Math.cos(tilt), Math.sin(tilt)), x = _b.set(0, 0, 1).cross(n).normalize(), z = _c.crossVectors(x, n);
            bhU.uVL.value.set(x.x, x.y, x.z, n.x, n.y, n.z, z.x, z.y, z.z);   // hàng = trục hệ hố đen trong hệ camera ⇒ nhân = đổi hệ camera → hệ hố đen
          }
          function mwTick(dt, t) {   // Ngân Hà mini: chờ — tự quay chậm, ô ngắm lượn quanh giữa · dò — ô ngắm rời chỗ cũ rồi xoắn ốc thu về đích theo tiến độ ống xoay, cầu quay giữ ô ngắm ở giữa
            const M = TEL.mw, Q = M.quaternion, R = TEL.mr, ph = TEL.ph; mwU.uOp.value = 0.9 * TEL.op * TEL.mwA; M.visible = mwU.uOp.value > 0.005; if (!M.visible) return;
            const C = _c.set(0, 0, -1).applyQuaternion(camera.quaternion);   // hướng nhìn camera = điểm giữa mặt trong phía xa (camera trực giao: mọi tia song song)
            if (ph === 'in' || ph === 'lock') {
              if (ph === 'in') {   // vòng xoắn quanh đích: bán kính 0,42 rad thu về 0, 3,2 vòng khi ống xoay tới nơi · 1/3 đầu trượt từ ô ngắm cũ vào vòng xoắn
                const s = TEL.sl, T = TEL.mt, e1 = _a.set(0, 1, 0).cross(T); if (e1.lengthSq() < 1e-6) e1.set(1, 0, 0); e1.normalize(); const e2 = _b.crossVectors(T, e1);
                const ro = 0.42 * Math.pow(1 - s, 1.3), ps = 1.3 + 3.2 * TAU * s, sp = _mw.copy(e1).multiplyScalar(Math.cos(ps)).addScaledVector(e2, Math.sin(ps)).multiplyScalar(Math.sin(ro)).addScaledVector(T, Math.cos(ro)).normalize();
                _q.setFromUnitVectors(TEL.mr0, sp); R.copy(TEL.mr0).applyQuaternion(_q2.identity().slerp(_q, sm(Math.min(1, s * 3))));
              } else R.copy(TEL.mt);
              _q.setFromUnitVectors(_a.copy(R).applyQuaternion(Q), C); Q.premultiply(_q2.identity().slerp(_q, 1 - Math.exp(-dt * 2.4)));   // cầu quay theo, ô ngắm về giữa
            } else {
              Q.premultiply(_q.setFromAxisAngle(MW_AX, dt * 0.12));
              const D = _b.copy(C).addScaledVector(_a.set(1, 0, 0).applyQuaternion(camera.quaternion), 0.22 * Math.sin(t * 0.23)).addScaledVector(_a.set(0, 1, 0).applyQuaternion(camera.quaternion), 0.16 * Math.sin(t * 0.17 + 1)).normalize();
              R.lerp(D.applyQuaternion(_q.copy(Q).invert()), 1 - Math.exp(-dt * 0.8)).normalize();
            }
            Q.normalize(); mwU.uF.value.copy(R); mwU.uZ.value = 1 + 2.6 * TEL.e; mwU.uT.value = t;
            mwU.uRet.value = ph === 'lock' ? 1 : ph === 'in' ? 0.85 : 0.4 + 0.1 * Math.sin(t * 2.4); mwU.uRr.value = ph === 'lock' ? 0.13 + 0.015 * Math.sin(t * 6) : 0.16;   // khoá: ô ngắm thu nhỏ, nhịp
          }
          // ---- chỗ trải thảm: bãi cỏ trống quanh bếp lửa (dò 1 lần) ----
          function findSpot() {
            let best = null, bs = -1e9;
            for (let a = 0; a < 72; a++) for (let r = 4; r <= 8; r += 0.5) {
              const an = a / 72 * TAU, x = pf.x + Math.cos(an) * r, z = pf.z + Math.sin(an) * r, yaw = Math.atan2(x - pf.x, z - pf.z), fx = Math.sin(yaw), fz = Math.cos(yaw), y0 = cowY(x, z);
              let ok = true;
              for (let u = -1.15; u <= 1.15 && ok; u += 0.23) for (let v = -0.55; v <= 0.55; v += 0.275) { const px = x + fx * u + fz * v, pz = z + fz * u - fx * v; if (Math.abs(cowY(px, pz) - y0) > 0.02 || isWater(Math.round(x2gi(px)), Math.round(z2gj(pz)))) { ok = false; break; } }
              if (!ok || rxDry(_a.set(x, y0, z))) continue;
              let clr = 99; for (const o of obstacleCoords) clr = Math.min(clr, Math.hypot(o.x - x, o.z - z) - o.r); for (const o of ENG_PROPS) clr = Math.min(clr, Math.hypot(o.x - x, o.z - z) - o.r);
              let tr = 99; for (const t of treeCoords) tr = Math.min(tr, Math.hypot(t.x - x, t.z - z)); for (const t of appleTrees) tr = Math.min(tr, Math.hypot(t.position.x - x, t.position.z - z));
              if (clr < 1.3 || tr < 5) continue;
              const s = Math.min(clr, 2.6) - 0.35 * Math.abs(r - 4.5); if (s > bs) { bs = s; best = { c: new THREE.Vector3(x, y0, z), yaw, f: new THREE.Vector3(fx, 0, fz) }; }
            }
            if (!best) return null;
            const c = best.c, f = best.f; best.head = c.clone().addScaledVector(f, -ML / 2); best.unroll = c.clone().addScaledVector(f, -ML / 2 - 0.42); best.on = c.clone().addScaledVector(f, 0.18);
            best.side = new THREE.Vector3(f.z, 0, -f.x); return best;
          }
          const spot = () => S.spot === null ? (S.spot = findSpot() || false) : S.spot;
          const cloud = () => { const w = liveWeather.state, c = w.fresh ? w.data?.current : null; return c && Number.isFinite(c.cloud_cover) ? c.cloud_cover / 100 : 0.3; };
          const ok = hh => engHourOk('stars', hh) && sunElevSin < -0.139 && !liveWeather.state.raining && cloud() < 0.6 && !!spot();   // tối hẳn (mặt trời < −8°), trời quang
          // ---- tư thế đứng → ngồi xổm → ngồi bệt → nằm ngửa theo s (0 – 1): khoá [hông trên đất, gập thân rx, hông phải/trái, gối phải/trái, dời hông dọc thảm] ----
          const KEY = [[0, HY - ENG_FEET, 0, 0, 0, 0, 0, 0.18], [0.3, 0.36, 0.32, -1.75, -1.75, 2.25, 2.25, 0.18], [0.6, 0.1, -0.32, -1.25, -1.3, 1.6, 1.7, 0.1], [1, 0.125, -Math.PI / 2, -0.04, -0.95, 0.08, 1.55, 0.1]];   // nằm: hông lệch 0,1 về phía chân ⇒ cả người nằm gọn trên thảm 1,75
          const sm = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          function pose(e, s) {   // đặt gốc, xoay, khớp chân theo s; trả lại [i khoá, tỉ lệ trong đoạn]
            let i = 0; while (i < KEY.length - 2 && s > KEY[i + 1][0]) i++;
            const A = KEY[i], B = KEY[i + 1], u = sm((s - A[0]) / (B[0] - A[0])), L = j => A[j] + (B[j] - A[j]) * u;
            const P = S.spot, g = e.g, rx = L(2), yaw = P.yaw, h = L(1), al = L(7);
            g.rotation.set(rx, yaw, 0);
            const hip = _a.copy(P.c).addScaledVector(P.f, al); hip.y = P.c.y + h + (s > 0.6 ? 0.012 * (1 - Math.abs(rx + Math.PI / 2) / 1.25) : 0);
            g.position.set(hip.x - Math.sin(yaw) * HY * Math.sin(rx), hip.y - HY * Math.cos(rx), hip.z - Math.cos(yaw) * HY * Math.sin(rx));
            const kL = S.legK ?? 0, legs = [L(3), L(4)], knees = [L(5), L(6)];   // nằm lâu: đổi chân co (S.legK 0 → 1 mượt)
            if (s >= 0.999) { legs[0] = -0.04 + (-0.95 + 0.04) * kL; legs[1] = -0.95 + (0.95 - 0.04) * kL; knees[0] = 0.08 + (1.55 - 0.08) * kL; knees[1] = 1.55 - (1.55 - 0.08) * kL; }
            for (let j = 0; j < 2; j++) { e.legs[j].rotation.x = legs[j]; e.knees[j].rotation.x = knees[j]; }
            e.noFootIK = true; e.seatCtl = true; e.armsBusy = true; e.vel = 0;
            return [i, u];
          }
          function hands(e, s, t) {   // tay: buông → chống sau lưng trên thảm → gối sau đầu (+ chỉ sao băng tay phải)
            if (s < 0.3) return;
            const P = S.spot, ax = engAxesW(e), wPlant = sm((s - 0.32) / 0.2) * (1 - sm((s - 0.66) / 0.24)), wHead = sm((s - 0.72) / 0.26);
            for (let i = 0; i < 2; i++) {
              const sd = i ? 1 : -1;   // tay phải (0) bên phải thân = −side
              let p = null, q = null;
              if (wHead > 0.001) {   // 2 tay đan sau gáy: bàn tay sau đầu, khuỷu xoè ra hai bên
                p = engBodyW(e, sd * 0.15, 2.0, -0.17, i ? _b : _c); p.y = Math.max(p.y, P.c.y + 0.05 + 0.4 * (1 - wHead)); q = aimQ(i ? _q2 : _q, _a.copy(ax.r).multiplyScalar(sd), ax.f);   // lót dưới gáy, không lún xuống đất
                (e.elbowPole || (e.elbowPole = [null, null]))[i] = (S.poles || (S.poles = [new THREE.Vector3(-1, 0.25, 0.55), new THREE.Vector3(1, 0.25, 0.55)]))[i];
              }
              if (wPlant > 0.001) {   // chống tay trên thảm phía sau hông, ngón chỉ về đầu thảm
                const pp = _a.copy(P.c).addScaledVector(P.f, -0.38).addScaledVector(P.side, -sd * 0.28); pp.y = P.c.y + 0.035;
                if (p) p.lerp(pp, wPlant); else p = (i ? _b : _c).copy(pp);
                const qq = aimQ(_q3, _a.set(0, -1, 0), P.f); q = q ? q.slerp(qq, wPlant) : qq;
              }
              if (p) { if (i === 0 && S.pt && S.pt.w > 0.01) continue; if (S.sc && S.sc.i === i && S.sc.w > 0.01) continue; engHandSet(e, i, p, q); }
            }
          }
          function scrHand(e, dt, t) {   // nằm: kéo màn về trước mặt (tay phía kính) · chạm màn ra lệnh dò · đẩy màn về — true khi màn đã về chỗ nghỉ (được dậy)
            const C = S.sc || (S.sc = { st: 'rest', k: 0, w: 0, i: TEL.sd < 0 ? 0 : 1 }), P = S.spot; C.k += dt; const k = C.k, i = C.i, sd = i ? 1 : -1;
            if (!TEL.scr || !TEL.restP) return true;
            const nape = engBodyW(e, sd * 0.15, 2.0, -0.17, _c), go2 = st => { C.st = st; C.k = 0; };
            const grip = () => TEL.scr.localToWorld(_b.set(0, -0.098, 0.004)), face = () => TEL.scr.localToWorld(_b.set(-sd * 0.05, -0.02, 0.012));   // mép dưới giữa màn · điểm chạm trên mặt màn (lệch về phía tay)
            let p = null, w = 0;
            if (C.st === 'rest' && !S.stop && S.st === 'lie' && S.k > 2.5) {   // chỗ màn trước mặt: cách mắt 0,38 theo hướng mặt (ngả 0,2 rad về phía chân), mặt màn úp xuống, đỉnh về phía đỉnh đầu
              const a = 0.2, E = _a.copy(P.c).addScaledVector(P.f, -0.7); E.y = P.c.y + 0.2; const d = _b.set(0, Math.cos(a), 0).addScaledVector(P.f, Math.sin(a));
              TEL.viewP = (TEL.viewP || new THREE.Vector3()).copy(E).addScaledVector(d, 0.38);
              const zN = d.clone().negate(), yT = new THREE.Vector3(0, Math.sin(a), 0).addScaledVector(P.f, -Math.cos(a)), xR = new THREE.Vector3().crossVectors(yT, zN);
              TEL.viewQ = (TEL.viewQ || new THREE.Quaternion()).setFromRotationMatrix(new THREE.Matrix4().makeBasis(xR, yT, zN)); go2('pull'); C.w = 0; return false;   // khung sau mới bắt đầu với tay (k tính lại từ 0)
            }
            if (C.st === 'pull' || C.st === 'push') {   // với tới mép màn (0,7 s) → nắm kéo / đẩy (1,3 s) → buông, tay về gáy (0,6 s)
              const f = C.st === 'pull'; w = sm(k / 0.7) * (1 - sm((k - 2.0) / 0.6)); TEL.sv = f ? sm((k - 0.7) / 1.3) : 1 - sm((k - 0.7) / 1.3);
              p = (C.p || (C.p = new THREE.Vector3())).copy(grip()); if (k > 2.6) go2(f ? 'view' : 'rest');
            } else if (C.st === 'view' && TEL.tapReq && S.st === 'lie' && !S.stop) go2('tap');
            else if (C.st === 'tap') {   // giơ tay (0,45 s) → ấn ngón vào màn (0,15 s) → rụt về
              w = sm(k / 0.45) * (1 - sm((k - 0.62) / 0.45)); p = (C.p || (C.p = new THREE.Vector3())).copy(face());
              if (k > 0.5 && TEL.tapReq) { TEL.tapReq = false; TEL.touch = 0; TEL.tx = 0.5 - sd * 0.2; TEL.ty = 0.42; telGoto(); }
              if (k > 1.1) go2('view');
            }
            if (S.stop && (C.st === 'view')) go2('push');
            C.w = w;
            if (p && w > 0.01) {   // bàn tay: gáy → điểm đích, lòng bàn tay hướng về mặt màn
              const n = _a.set(0, 0, -1).applyQuaternion(TEL.scr.getWorldQuaternion(_q2)), q = aimQ(_q2, n, _b.copy(P.f).negate());
              engHandSet(e, i, nape.lerp(p, w), q); if (e.gripReq) e.gripReq[i] = C.st === 'tap' ? 0.25 : 0.9 * w;
            }
            return C.st === 'rest';
          }
          function gaze(e, dt, t) {   // nằm: đảo mắt quanh trời mỗi 5–11 s, ~45% số lần quay sang xem màn hình kính 7–13 s · sao băng: quay theo vệt
            const G = S.gz; G.t -= dt;
            if (G.t <= 0 && !S.pt) { G.scr = !!TEL.g && Math.random() < (TEL.sv > 0.9 ? 0.7 : 0.45); G.t = G.scr ? 7 + 6 * Math.random() : 5 + 6 * Math.random(); G.ty = (Math.random() - 0.5) * 1.3; G.tp = 0.22 + 0.35 * Math.random(); }
            if (S.sc && S.sc.w > 0.05) { G.scr = true; G.t = Math.max(G.t, 1); }   // đang với tay chạm / kéo màn: nhìn màn
            let ty = G.ty ?? 0, tp = G.tp ?? 0.35;   // nằm: cằm hơi thu (tay lót gáy, mũ không cấn đất)
            const dir = S.pt && S.pt.dir ? S.pt.dir : G.scr && TEL.g ? _c.subVectors(TEL.sc, e.head.getWorldPosition(_b)).normalize() : null;
            if (dir) {   // hướng vệt sao băng / màn hình trong khung thân (thân ngửa: +z thân = trời)
              e.spine.getWorldQuaternion(_q2).invert(); const d = _a.copy(dir).applyQuaternion(_q2);
              ty = Math.max(-0.9, Math.min(0.9, Math.atan2(d.x, d.z))); tp = Math.max(0.2, Math.min(0.7, 0.3 + Math.atan2(-d.y, Math.hypot(d.x, d.z))));
            }
            G.y += (ty - G.y) * (1 - Math.exp(-dt * 2.2)); G.p += (tp - G.p) * (1 - Math.exp(-dt * 2.2));
            e.headYawT = G.y; e.head.rotation.x = G.p;
          }
          function meteors(e, dt, t) {   // sao băng mới đủ sáng ⇒ chỉ tay theo vệt 2,6 s
            const M = nightSky.meteors;
            if (!S.pt) for (const m of M) {
              if (S.seen.has(m)) continue; S.seen.add(m);
              if (m.m > nightSky.lim - 0.8 || m.t > m.dur * 0.6) continue;   // mờ quá / sắp tắt: mắt kịp thấy cũng không kịp chỉ
              const arm = clock.elapsedTime - (S.ptAt ?? -1e9) > 45; if (arm) S.ptAt = clock.elapsedTime;   // chỉ tay tối đa 1 lần / 45 s; vệt khác chỉ quay đầu nhìn theo
              S.pt = { m, k: 0, w: 0, arm, dir: new THREE.Vector3() }; S.nMet = (S.nMet || 0) + 1;
              if (arm) { rxSay('meteor', ['Sao băng kìa!', 'Sao băng! Ước kịp không nhỉ…', 'Thêm một vệt sao băng nữa.'], 'Ngắm sao', true); envNeed(5, 4); } break;
            }
            const P = S.pt; if (!P) return;
            P.k += dt; const m = P.m, kk = Math.min(1, (m.t || 0) / m.dur); P.dir.copy(m.d0).lerp(m.d1, Math.min(1, kk + 0.15)).normalize();
            P.w = P.arm ? sm(P.k / 0.45) * (1 - sm((P.k - 2.1) / 0.5)) : 0;
            if (P.w > 0.01) {   // tay phải rời gáy, duỗi chỉ theo vệt
              e.arms[0].getWorldPosition(_a); const d = P.dir, palm = _b.set(0, -1, 0).addScaledVector(d, d.y); if (palm.lengthSq() < 1e-4) palm.copy(S.spot.f); palm.normalize();
              const head = engBodyW(e, -0.15, 2.0, -0.17, _c), tip = _a.clone().addScaledVector(d, 0.45 * e.g.scale.y / 0.79);
              engHandSet(e, 0, head.lerp(tip, P.w), aimQ(_q, palm, _a.copy(d).negate()));
            }
            if (P.k > 2.6) S.pt = null;
          }
          const fields = new Map(), fieldOf = p => { let f = fields.get(p); if (!f) fields.set(p, f = buildFlowField(p.x, p.z)); return f; };   // bảng dẫn đường tới từng đích (dựng lần đầu cần)
          function walkTo(e, p, dt, t) { return engStep(e, p, dt, t, pf, FIRE_AVOID_R, rxDry(e.g.position) || rxDry(p) ? null : fieldOf(p)); }   // dưới bạt: né cục bộ (ô lưới quanh xe bị chặn)
          function crouch(e, sq, at) {   // cúi / ngồi xổm nhặt – đặt (như hái táo): hạ hông, gập gối, cúi người, nhìn chỗ tay
            e.noFootIK = true; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.22 * CAMP_SCALE * ENGINEER_SIZE * sq;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -0.95 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.6 * sq; e.lean = 0.12 * sq; e.spineT = { x: 0.35 * sq, y: 0 };
            if (at) { e.g.rotation.y += Math.atan2(Math.sin(Math.atan2(at.x - e.g.position.x, at.z - e.g.position.z) - e.g.rotation.y), Math.cos(Math.atan2(at.x - e.g.position.x, at.z - e.g.position.z) - e.g.rotation.y)) * 0.15; rxLook('job', 3.5, 0.3, at); }
          }
          const go = st => { S.st = st; S.k = 0; };
          function setRoll(u) {   // cuộn đang trải: u = phần đã trải (0 – 1); cuộn lăn dọc thảm, bán kính nhỏ dần
            const P = S.spot; S.u = u; mat.visible = u > 0.002; sheet.scale.z = Math.max(0.002, u);
            const r = Math.sqrt(RMIN * RMIN + (R0 * R0 - RMIN * RMIN) * (1 - u)), p = _a.copy(P.head).addScaledVector(P.f, u * ML);
            S.spin = u * ML / Math.max(r, 0.02);
            roll.position.set(p.x, P.c.y + r + 0.004, p.z); roll.scale.set(r, 1, r); roll.visible = u < 0.995;
            roll.quaternion.setFromUnitVectors(UP, P.side).premultiply(_q.setFromAxisAngle(P.side, S.spin));
          }
          function telHand(e) {   // trước IK: tay phải cầm đầu chân kính — bên hông khi xách, đưa ra chỗ dựng khi đặt / nhấc
            if (!TEL.p0 || !TEL.out || TEL.lift <= 0.001) return;
            const p = engBodyW(e, -0.36, 1.05, 0.1, _b); if (TEL.lift < 1) p.lerp(_c.copy(TEL.grip).applyQuaternion(TEL.q0).add(TEL.p0), 1 - TEL.lift);
            engHandSet(e, 0, p, aimQ(_q, _a.set(Math.sin(e.g.rotation.y), 0, Math.cos(e.g.rotation.y)), UP)); e.armsBusy = true;
          }
          // LẮP RÁP + CĂN CHỈNH (G 24/10 "research engineer lắp ráp kính thiên văn + căn chỉnh, trước khi nằm enjoy ngắm sao") — theo trình tự người chơi kính xích đạo:
          //  đặt chân ba càng, chỉnh thăng bằng (vặn khoá càng, nhìn bọt thuỷ đầu giá) → lắp quả đối trọng → về xe lấy ống (2 chuyến: chân + thảm trước, ống sau; cuộn thảm
          //  để sẵn ở đầu thảm) → đặt ống lên ray đuôi én trên cột nối, khoá ốc → cân bằng (tay trượt ống trong vòng ôm, chỉnh quả đối trọng) → căn trục cực (ngồi xổm nhìn
          //  qua ống ngắm cực về phía bắc — Bắc Cực Tinh cao 14° ở Pleiku) → căn kính tìm + bút laser với ống chính trên 1 sao sáng (~40°: tay đưa ống, mắt vào thị kính,
          //  laser chớp từng nhát) → trải thảm, nằm (ống nguội dần trong lúc đó — kính khúc xạ cần 30 – 60 phút) → 2 lần chạm đầu trên màn = cân chỉnh 2 sao của giá GoTo
          const ASM = { tlvl: [3.4, 'tcw'], tcw: [2.6, 'tfe'], tota: [3.2, 'tbal'], tbal: [3.0, 'tpol'], tpol: [3.4, 'tfnd'], tfnd: [4.8, 'go'] };   // giây · bước sau
          const _h0 = new THREE.Vector3(), _h1 = new THREE.Vector3(), _h2 = new THREE.Vector3(), _h3 = new THREE.Vector3(), _hp = new THREE.Vector3(), _hpb = new THREE.Vector3(), _hs = new THREE.Vector3(), _hs2 = new THREE.Vector3();
          const _hq0 = new THREE.Quaternion(), _hq1 = new THREE.Quaternion(), _hqa = new THREE.Quaternion(), _hqb = new THREE.Quaternion(), _hm = new THREE.Matrix4(), _hk = new THREE.Matrix4(), _hn = new THREE.Matrix4(), _hr = new THREE.Matrix4();
          const onTube = (M, p, out) => out.copy(p).sub(TEL.pv).applyMatrix4(M);   // điểm hệ mẫu trên ống → thế giới theo ma trận ống M
          const telMount = () => { TEL.tubeOn = true; TEL.hold = 0; TEL.hand = false; };
          function reach(e, i, p, w) {   // tay i (0 phải · 1 trái) với tới p (thế giới) theo w từ chỗ buông bên hông
            const b = engBodyW(e, i ? 0.3 : -0.3, 1.0, 0.12, i ? _h1 : _h0).lerp(p, w);
            engHandSet(e, i, b, aimQ(i ? _hq1 : _hq0, _hs.set(Math.sin(e.g.rotation.y), -0.35, Math.cos(e.g.rotation.y)).normalize(), UP));
          }
          function heldM(e, out) {   // ống bê ngang bên hông phải: trục quang theo hướng mặt, mặt trên ống lên trời, giữa ống ở hông phải hơi trước
            const f = _h2.set(Math.sin(e.g.rotation.y), 0, Math.cos(e.g.rotation.y)), sc = TUBE_K * TEL.g.scale.x;
            _hn.makeBasis(TUBE_AX, TUBE_UP, TUBE_SD).invert(); out.makeBasis(f, UP, _h3.crossVectors(f, UP)).multiply(_hn);   // quay: trục quang → f, mặt trên → lên
            const c = engBodyW(e, -0.32, 1.05, 0.18, _hp), mid = _hs.copy(TUBE_C0).addScaledVector(TUBE_AX, -0.27).sub(TEL.pv).multiplyScalar(sc).applyMatrix4(_hr.extractRotation(out));
            return out.scale(_h3.set(sc, sc, sc)).setPosition(c.sub(mid));
          }
          function mountM(out) { TEL.tube.updateWorldMatrix(true, false); return out.compose(TEL.mntP, _hqa.identity(), _h3.setScalar(TUBE_K)).premultiply(TEL.tube.matrixWorld); }   // ống trên giá (thế giới)
          function blendM(A, B, u, out) { A.decompose(_hp, _hqa, _hs); B.decompose(_hpb, _hqb, _hs2); return out.compose(_hp.lerp(_hpb, u), _hqa.slerp(_hqb, u), _hs.lerp(_hs2, u)); }
          function tubeHands(e, M, w, sl = 0) {   // 2 tay đỡ dưới ống: dưới vòng ôm sau · giữa ống (sl: trượt dọc ống)
            reach(e, 0, onTube(M, _h2.copy(TUBE_C0).addScaledVector(TUBE_AX, -0.5 + sl).addScaledVector(TUBE_UP, -0.085), _h2), w);
            reach(e, 1, onTube(M, _h3.copy(TUBE_C0).addScaledVector(TUBE_AX, -0.12 + sl).addScaledVector(TUBE_UP, -0.075), _h3), w);
          }
          function tubeCarry(e) { heldM(e, TEL.holdM); TEL.hold = 1; tubeHands(e, TEL.holdM, 1); e.armsBusy = true; }
          function asmStep(e, dt, t, k) {   // 1 bước lắp ráp tại chỗ đặt kính (đứng ở TEL.drop, quay về chân kính)
            const st = S.st, [dur, nx] = ASM[st], tel = TEL.g.getObjectByName('telescope'), w = sm(k / 0.5) * (1 - sm((k - dur + 0.5) / 0.5));
            if (S.stop) { telMount(); go('go'); return; }
            engStandStill(e); e.armsBusy = true; const yt = Math.atan2(TEL.base.x - e.g.position.x, TEL.base.z - e.g.position.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * Math.min(1, dt * 4);
            if (st === 'tlvl') {   // thăng bằng: ngồi thấp, 2 tay vặn khoá 2 càng gần nhất (càng nhích lên xuống), cuối cùng nhìn bọt thuỷ đầu giá
              crouch(e, 0.9 * sm(k / 0.6) * (1 - sm((k - dur + 0.6) / 0.6)), null);
              if (!S.legN) S.legN = [0, 1, 2].sort((a, b) => tel.localToWorld(TEL.legPt(a, 0.3)).distanceTo(e.g.position) - tel.localToWorld(TEL.legPt(b, 0.3)).distanceTo(e.g.position)).slice(0, 2);
              for (let i = 0; i < 2; i++) reach(e, i, tel.localToWorld(TEL.legPt(S.legN[i], 0.3 + 0.03 * Math.sin(k * 4 + i * 2))), w);
              rxLook('job', 3.5, 0.3, k < dur - 1 ? tel.localToWorld(TEL.legPt(S.legN[0], 0.3)) : tel.localToWorld(_h2.set(TEL.pv.x, 1.04, TEL.pv.z)));
            } else if (st === 'tcw') {   // quả đối trọng: cúi, 2 tay đẩy quả nặng lên thanh rồi vặn ốc chặn
              crouch(e, 0.4 * w, null); const c = tel.localToWorld(_h2.copy(TEL.cwP)); c.y += 0.04 * Math.sin(Math.min(1, k / (dur - 0.6)) * Math.PI);
              reach(e, 0, _h3.copy(c).addScaledVector(_hs2.set(Math.cos(e.g.rotation.y), 0, -Math.sin(e.g.rotation.y)), -0.05), w); reach(e, 1, _hpb.copy(c).addScaledVector(_hs2, 0.05), w); rxLook('job', 3.5, 0.3, c);
            } else if (st === 'tota') {   // đặt ống lên ray đuôi én trên cột nối: nâng từ hông lên, đặt vào, khoá ốc
              const u = sm((k - 0.3) / 2.3); heldM(e, _hm); mountM(_hk); blendM(_hm, _hk, u, TEL.holdM); TEL.hold = 1; tubeHands(e, TEL.holdM, 1);
              rxLook('job', 3.5, 0.3, onTube(TEL.holdM, _hpb.copy(TUBE_MNT), _hpb)); if (k > dur - 0.3) { telMount(); go(nx); return; }
            } else if (st === 'tbal') {   // cân bằng: tay trượt ống trong vòng ôm tới lui rồi buông thử; tay phải chỉnh quả đối trọng
              const w2 = 1 - sm((k - dur + 0.5) / 0.5), sl = 0.05 * Math.sin(k * 2.6) * (1 - sm((k - 1.5) / 0.4)); TEL.tubeS.updateWorldMatrix(true, false); const M = TEL.tubeS.matrixWorld;
              if (k < 1.9) tubeHands(e, M, w2, sl);
              else { reach(e, 0, tel.localToWorld(_h2.copy(TEL.cwP)), w2); reach(e, 1, onTube(M, _h3.copy(TUBE_C0).addScaledVector(TUBE_AX, -0.12).addScaledVector(TUBE_UP, -0.075), _h3), w2 * (1 - sm((k - 1.9) / 0.6))); }
              rxLook('job', 3.5, 0.3, k < 1.9 ? onTube(M, _hpb.copy(TUBE_MNT), _hpb) : tel.localToWorld(_hpb.copy(TEL.cwP)));
            } else if (st === 'tpol') {   // căn trục cực: ngồi xổm cạnh đầu giá, nhìn qua ống ngắm cực về phía bắc (−z, Bắc Cực Tinh cao 14°), tay vặn núm
              crouch(e, 0.6 * w, null); const hd = tel.localToWorld(_h2.set(TEL.pv.x, 1.0, TEL.pv.z)); reach(e, 0, hd, 0.9 * w);
              rxLook('job', 3.5, 0.3, k < 1.2 ? hd : _h3.set(hd.x, hd.y + Math.tan(14 * Math.PI / 180) * 10, hd.z - 10));
            } else if (st === 'tfnd') {   // căn kính tìm + bút laser: tay đưa ống tới 1 sao sáng cao (~68° — gần vùng sẽ dò, lượt GOTO đầu khỏi xoay xa), mắt vào thị kính, tay trái vặn ốc giá kẹp bút, laser chớp từng nhát (telTick)
              if (!S.fz) S.fz = [TEL.az, TEL.alt]; TEL.hand = true; const u = sm(k / 1.3); TEL.az = S.fz[0] * (1 - u); TEL.alt = S.fz[1] + (altOf(68) - S.fz[1]) * u; TEL.azT = TEL.az; TEL.altT = TEL.alt;
              TEL.tube.updateWorldMatrix(true, true); const M = TEL.tubeS.matrixWorld;
              reach(e, 1, onTube(M, _h2.copy(TEL.penP), _h2), w); reach(e, 0, onTube(M, _h3.copy(TEL.eyeP).addScaledVector(TUBE_AX, 0.06), _h3), 0.8 * w);
              rxLook('job', 3.5, 0.3, onTube(M, _hpb.copy(TEL.eyeP), _hpb));
            }
            if (k > dur) { if (st === 'tfnd') { TEL.hand = false; S.fz = null; } go(nx); }
          }
          function update(e, dt, t) {   // pha 'stars' · xong (thảm đã cất) thì đặt S.done
            const P = spot(); if (!P) { S.st = 'idle'; return true; }
            S.k += dt; const k = S.k; telHand(e);
            if (S.st === 'idle' && !engHourOk('stars', liveWeather.localHour)) return true;   // chặn tận gốc: ngoài khung giờ (trước 19:00 — engineer/mind/hours.js) không bắt đầu, dù ai gọi (G 24/10 "loop ngắm sao cả ngày": trang xem thử giao lệnh liên tục)
            if (S.st === 'idle') { S.stop = false; S.nMet = 0; mat.position.copy(P.head); mat.rotation.y = P.yaw; go(S.roll === 'home' ? 'fetch' : 'go'); }
            if (S.roll === 'hand' && (S.st === 'go' || S.st === 'back')) { e.arms[1].rotation.x = 0.06; (e.armRollT || (e.armRollT = [0, 0]))[1] = 0.14; e.armsBusy = true; }
            switch (S.st) {
              case 'fetch': if (S.stop) { go('idle'); return true; } if (walkTo(e, HOME_ST, dt, t)) go('pick'); else if (k > 60) { go('idle'); return true; } break;
              case 'pick': case 'put': {   // cúi lấy / dựng cuộn thảm ở góc bạt
                engStandStill(e); const sq = sm(k / 0.6) * (1 - sm((k - 0.9) / 0.6)); crouch(e, sq, HOME); e.armsBusy = true;
                engHandSet(e, 1, _b.set(HOME.x, HOME.y + MW * 0.55, HOME.z), aimQ(_q, _a.subVectors(HOME, e.g.position).setY(0).normalize(), UP));
                if (k > 0.8) { if (S.st === 'pick') { S.roll = 'hand'; if (TEL.p0 && !TEL.out) { TEL.out = true; TEL.lift = 1; } } else { TEL.out = false; TEL.lift = 0; TEL.tubeOn = false; TEL.hold = 0; if (S.roll === 'hand') { S.roll = 'home'; homeRoll(); } } }   // lấy chân kính (ống để lại, lắp sau) cùng cuộn thảm · cất cả 2
                if (k > 1.5) { if (S.st === 'pick') go('go'); else { go('idle'); S.done = clock.elapsedTime; return true; } }
                break;
              }
              case 'go': { const tc = TEL.out && TEL.lift > 0.5 && !S.stop; if (walkTo(e, S.stop ? HOME_ST : tc ? TEL.drop : P.unroll, dt, t)) go(S.stop ? 'put' : tc ? 'tset' : 'unroll'); else if (k > 90) go('back'); break; }   // xách kính: đặt kính trước rồi mới trải thảm
              case 'tset': case 'tget': {   // đặt kính xuống chỗ dựng / nhấc kính lên: quay về phía kính, khuỵu nhẹ, tay phải đưa đầu chân kính
                engStandStill(e); const yt = Math.atan2(TEL.base.x - e.g.position.x, TEL.base.z - e.g.position.z); e.g.rotation.y += Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)) * Math.min(1, dt * 5);
                const u = sm((k - 0.3) / 1.1); TEL.lift = S.st === 'tset' ? 1 - u : u; crouch(e, 0.3 * Math.sin(Math.PI * Math.min(1, k / 1.7)), null);
                if (k > 1.7) { if (S.st === 'tset' && !TEL.tubeOn && TEL.legs) { S.roll = 'ground'; setRoll(0); S.legN = null; S.fz = null; go('tlvl'); }   // chân đã đặt: để cuộn thảm ở đầu thảm, bắt đầu lắp ráp
                  else { if (S.st === 'tset' && !TEL.tubeOn) telMount(); go(S.st === 'tset' ? 'go' : 'back'); } }
                break;
              }
              case 'tgo': if (walkTo(e, TEL.drop, dt, t) || k > 30) go('tget'); break;
              case 'tlvl': case 'tcw': case 'tota': case 'tbal': case 'tpol': case 'tfnd': asmStep(e, dt, t, k); break;
              case 'tfe': if (S.stop) { telMount(); go('go'); break; } if (walkTo(e, HOME_ST, dt, t)) go('tpk'); else if (k > 60) { telMount(); go('go'); } break;   // về xe lấy ống
              case 'tpk': {   // cúi lấy ống trong cửa xe, bê ngang bên hông
                engStandStill(e); const sq = sm(k / 0.6) * (1 - sm((k - 0.9) / 0.6)); crouch(e, sq, HOME); e.armsBusy = true;
                if (k > 0.8) tubeCarry(e); else reach(e, 0, _h2.set(HOME.x, HOME.y + 0.25, HOME.z), sm(k / 0.6));
                if (k > 1.5) go('tca'); break;
              }
              case 'tca': tubeCarry(e); if (S.stop) { telMount(); go('go'); break; } if (walkTo(e, TEL.drop, dt, t)) go('tota'); else if (k > 60) { telMount(); go('go'); } break;   // bê ống về chỗ dựng
              case 'unroll': case 'roll': {   // cúi ở đầu thảm: đặt cuộn đẩy cho lăn trải ra · cuộn lại kéo về tay
                engStandStill(e); const yt = P.yaw, dy = Math.atan2(Math.sin(yt - e.g.rotation.y), Math.cos(yt - e.g.rotation.y)); e.g.rotation.y += dy * Math.min(1, dt * 5);
                const sq = sm(k / 0.6) * (1 - sm((k - 2.5) / 0.6)); crouch(e, sq, null); e.armsBusy = true; rxLook('job', 3.5, 0.3, _a.copy(P.c));
                if (S.st === 'unroll') { if (k > 0.55) { if (S.roll !== 'mat') for (let u = -0.8; u <= 0.81; u += 0.32) meadow.cutAt(P.c.x + P.f.x * u, P.c.z + P.f.z * u, 0.5);   // cỏ dưới thảm rạp xuống (không đâm xuyên thảm)
                  S.roll = 'mat'; setRoll(sm((k - 0.7) / 1.8)); } }
                else { setRoll(1 - sm((k - 0.5) / 1.8)); if (k > 2.4) { S.roll = 'hand'; mat.visible = false; } }
                if (S.roll === 'mat' && S.u < 0.35) { const rp = roll.position; engHandSet(e, 0, _b.set(rp.x, rp.y + roll.scale.x + 0.03, rp.z), aimQ(_q, _a.set(0, -1, 0), P.f)); engHandSet(e, 1, _c.copy(_b).addScaledVector(P.side, 0.18), aimQ(_q2, _a.set(0, -1, 0), P.f)); }
                if (k > 3.1) go(S.st === 'unroll' ? (S.stop ? 'roll' : 'step') : TEL.out && TEL.lift < 0.5 ? 'tgo' : 'back');
                break;
              }
              case 'step': if (S.stop) { go('roll'); break; } if (walkTo(e, P.on, dt, t)) go('turn'); else if (k > 20) go('turn'); break;
              case 'turn': {   // đứng giữa thảm quay mặt về phía chân thảm
                engStandStill(e); const dy = Math.atan2(Math.sin(P.yaw - e.g.rotation.y), Math.cos(P.yaw - e.g.rotation.y)); e.g.rotation.y += dy * Math.min(1, dt * 4);
                e.g.position.x += (P.on.x - e.g.position.x) * Math.min(1, dt * 4); e.g.position.z += (P.on.z - e.g.position.z) * Math.min(1, dt * 4);
                if (k > 0.9 && Math.abs(dy) < 0.05) { go('down'); S.legK = 0; S.leg = 1; }
                break;
              }
              case 'down': case 'up': {
                const s = S.st === 'down' ? Math.min(1, k / 5) : Math.max(0, 1 - k / 4.5);
                pose(e, s); hands(e, s, t); e.head.rotation.x = s < 0.3 ? 0.3 * sm(s / 0.3) : s < 0.6 ? 0.3 - 0.4 * sm((s - 0.3) / 0.3) : -0.1 + 0.4 * sm((s - 0.6) / 0.4); e.headYawT = 0;   // ngồi → nằm: cằm thu dần
                if (S.st === 'down' && s >= 1) { go('lie'); S.gz.y = 0; S.gz.p = 0.3; S.gz.t = 2; S.gz.ty = 0; S.gz.tp = 0.35; S.legT = 30 + 20 * Math.random(); }
                if (S.st === 'up' && s <= 0) { e.g.rotation.x = 0; e.seatCtl = false; go('off'); }
                break;
              }
              case 'lie': {
                pose(e, 1); hands(e, 1, t); const scrHome = scrHand(e, dt, t); gaze(e, dt, t); meteors(e, dt, t);
                S.legT -= dt; if (S.legT <= 0) { S.leg = -S.leg; S.legT = 35 + 25 * Math.random(); }   // đổi chân co
                S.legK = (S.legK ?? 0) + ((S.leg < 0 ? 1 : 0) - (S.legK ?? 0)) * (1 - Math.exp(-dt * 1.6));
                const U = e.g.userData, br = Math.sin(t * 0.21 * TAU); if (U.torso) U.torso.scale.set(1 + 0.01 * br, 1, 1 + 0.025 * br);   // thở chậm
                const why = S.stop ? 'việc khác' : !ok(liveWeather.localHour) ? 'trời' : (e.actLeft || 0) < 60 ? 'hết giờ' : k > 3900 ? 'đủ lâu' : '';
                if (why) { S.why0 = S.why0 || why; S.stop = true; TEL.tapReq = false; TEL.azT = TEL.altT = 0;   // dậy: đẩy màn về chỗ trước · ống quay về chỗ cũ
                  if (scrHome) { if (U.torso) U.torso.scale.set(1, 1, 1); S.pt = null; S.why = S.why0; S.why0 = null; e.headYawT = 0; S.sc = null; go('up'); } }
                break;
              }
              case 'off': if (walkTo(e, P.unroll, dt, t)) go('roll'); else if (k > 20) go('roll'); break;
              case 'back': if (walkTo(e, HOME_ST, dt, t)) go('put'); else if (k > 90) { S.roll = 'home'; homeRoll(); TEL.out = false; TEL.lift = 0; TEL.tubeOn = false; TEL.hold = 0; go('idle'); S.done = clock.elapsedTime; return true; } break;
            }
            return false;
          }
          function tick(e, dt, t) {   // sau IK tay: kính / màn / thiên hà mini · cuộn thảm theo bàn tay trái khi xách
            telTick(e, dt, t);
            if (S.roll !== 'hand') return;
            e.wrists[1].updateWorldMatrix(true, false); const p = e.wrists[1].localToWorld(_a.set(0, -0.01, 0.05));
            const f = _b.set(Math.sin(e.g.rotation.y), 0, Math.cos(e.g.rotation.y));
            roll.position.copy(p); roll.scale.set(R0, 1, R0); roll.quaternion.setFromUnitVectors(UP, f); roll.visible = true; mat.visible = false;
          }
          function idle(e) {   // pha bị cắt ngang (ngủ 21:00, mở trang…): thảm về chỗ, dáng đứng
            if (S.st === 'idle') return;
            const lay = S.st === 'down' || S.st === 'lie' || S.st === 'up';
            S.st = 'idle'; S.roll = 'home'; S.pt = null; S.stop = false; homeRoll(); mat.visible = false; S.done = clock.elapsedTime; TEL.out = false; TEL.lift = 0; TEL.tubeOn = false; TEL.hold = 0; TEL.hand = false; S.fz = null;
            S.sc = null; TEL.sv = 0; TEL.tapReq = false; TEL.az = TEL.alt = TEL.azT = TEL.altT = TEL.slV = 0; TEL.ph = 'out'; TEL.pk = 0;
            if (lay && e) { e.g.rotation.x = 0; if (e.pose) e.pose.rawRX = 0; const U = e.g.userData; if (U.torso) U.torso.scale.set(1, 1, 1); }
          }
          // ---- NGẮM MƯA ----
          const RW = { st: 'go', k: 0, dur: 90, act: null, at: 0 };
          const rwSpot = (() => { const z = RX_AW ? RX_AW.z1 - 0.3 : 2.95; return vanPt(0.0, 0, z); })(), rwYaw = caravanObj.rotation.y;   // trước cửa lùa, cách đèn lồng treo (x 1,1) 1,1 đv
          function rainStart() { RW.st = 'go'; RW.k = 0; RW.act = null; RW.at = 0; }
          function rain(e, dt, t) {   // pha 'rainwatch': true = xong (tạnh / đủ giờ)
            if (!liveWeather.state.raining) return true;
            RW.k += dt;
            if (RW.st === 'go') { if (walkTo(e, rwSpot, dt, t)) { RW.st = 'watch'; RW.k = 0; RW.dur = 70 + 40 * Math.random(); RW.at = 0; } else if (RW.k > 40) return true; return false; }
            engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET;
            const dy = Math.atan2(Math.sin(rwYaw + (RW.yo || 0) - e.g.rotation.y), Math.cos(rwYaw + (RW.yo || 0) - e.g.rotation.y)); e.g.rotation.y += dy * Math.min(1, dt * 2);
            if (RW.k >= RW.at) {   // việc vặt kế tiếp: nhìn mưa ngoài hồ · ngẩng nhìn mép bạt nhỏ giọt · hứng mưa · khoanh tay
              const r = Math.random(); RW.act = r < 0.35 ? 'look' : r < 0.55 ? 'drip' : r < 0.75 ? 'palm' : 'fold'; RW.at = RW.k + (RW.act === 'fold' ? 9 : 5 + 3 * Math.random()); RW.yo = (Math.random() - 0.5) * 0.7;
              const yw = rwYaw + RW.yo, h = e.g.position;
              if (RW.act === 'look') rxLook('rain', 2.8, 5, _a.set(h.x + Math.sin(yw) * 7, h.y + 1.2, h.z + Math.cos(yw) * 7));
              else if (RW.act === 'drip') rxLook('rain', 2.8, 3, vanPt((Math.random() - 0.5) * 0.8, 2.25, RX_AW ? RX_AW.z1 + 0.12 : 3.4));
              else if (RW.act === 'palm' && rxHands(e)[0]) rxGest('palm', 2.8);
              if (RW.act !== 'fold' && Math.random() < 0.3) rxSay('rainwatch', ['Mưa rơi lộp độp trên bạt, nghe vui tai.', 'Mặt hồ sủi bọt li ti dưới mưa.', 'Đất ướt thơm mùi ngai ngái.', 'Nước nhỏ giọt từ mép bạt thành hàng.'], 'Ngắm mưa', false);
            }
            if (RW.act === 'fold' && !RX.gest) {   // khoanh tay trước ngực
              const ax = engAxesW(e), w = sm((RW.k - (RW.at - 9)) / 0.6) * (1 - sm((RW.k - RW.at + 0.6) / 0.6));
              if (w > 0.02) { e.armsBusy = true; engHandSet(e, 0, engBodyW(e, 0.15, 1.46, 0.21, _a), aimQ(_q, _b.copy(ax.f).negate(), ax.r)); engHandSet(e, 1, engBodyW(e, -0.15, 1.5, 0.23, _c), aimQ(_q2, _b.copy(ax.f).negate(), _a.copy(ax.r).negate())); }
            }
            return RW.k > RW.dur;
          }
          return { update, tick, idle, rain, rainStart, ok, want: hh => ok(hh) && clock.elapsedTime - S.done > 1800, busy: () => S.st !== 'idle', stop() { S.stop = true; }, goal: () => (S.spot && S.spot.unroll) || HOME_ST, rwSpot, state: S, findSpot: () => {   // dò lại chỗ thảm ⇒ kính dời theo (luôn cạnh đầu thảm, cách người nằm ≤ 4 voxel)
              for (const [L, o] of [[ENG_PROPS, TEL.propR], [obstacleCoords, TEL.obsR]]) { const i = o ? L.indexOf(o) : -1; if (i >= 0) L.splice(i, 1); } TEL.propR = TEL.obsR = null;
              S.spot = null; const P = spot(); if (P && TEL.g && TEL.an && S.st === 'idle') { const scr = TEL.scr; if (scr && scr.parent) scr.parent.remove(scr); scr.position.set(0, 0, 0); scr.quaternion.identity(); scr.scale.setScalar(1.5); telPlace(); } return P; },
            dogWant: () => engObj.phase === 'stars' && (S.st === 'step' || S.st === 'turn' || S.st === 'down' || S.st === 'lie') && !!dogSpotOf(), dogSpot: dogSpotOf, tel: TEL };   // chó ra nằm cạnh khi chủ lên thảm (animals/dog-brain.js 'stars')
        })();
