        // ===== HỆ BIOGAS ỐNG MỀM (Flexible Tubular Biodigester) — vật riêng: men vi sinh (booster), khử mùi. Toạ độ trong mã giữ bản vẽ gốc, cả nhóm thu
        //  đều SC = 0,8 × 0,9 = 0,72 quanh tâm ⇒ kích thước thật = số trong mã × 0,72, thể tích × 0,37. Khu rào 4,1 × 2,2 m song song xe,
        //  phía không có cửa lùa (−z xe), trên nền hạ 1 bậc san phẳng riêng
        //  độ cao 10 (y 6,0 — khu xe 11, y 6,6; core/sky-sun-moon.js getVoxelHeight), tâm cách trục xe 8,3 m, ngang tâm xe. Ống bồn cầu ~8,3 m:
        //  thẳng ra vuông góc hông xe, đổ 45° qua mép bậc, cút cong dài 90°, thẳng vào măng sông vách hộp nạp; cổng xả két dưới gầm (bích bu lông, van
        //  lưỡi tay kéo T, camlock, chạc 45°); ống gas chôn ~6,4 m hình L song song ống bồn cầu, lên dốc về xe (điểm thấp + hộp xả nước ngưng ở đầu bảng thiết bị). Bóng xe chỉ che ~5 %
        //  nắng (từ ~15:30), túi khí cách bếp xe ~8,3 m. Số liệu, cách tính, nguồn: docs/biogas-design.md. Ba khối theo bản thiết kế (số thật, đã nhân 0,72):
        //   A  túi ủ màng PE chu vi 1,44 m (Ø 0,46) trong rãnh lót vải địa 2,9 × 0,36 × 0,36 m, viền tà vẹt, nhà kính polycarbonate; ống vào / ra ngập dưới mặt dịch
        //      = khoá nước (chặn mùi, chặn khí); 0,34 m³ dịch, lưu ~22 ngày ở 15 L/ngày (dưới bảng GE). Mặt dịch 3 cm dưới mặt đất ⇒ chỉ vòm khí nhô lên
        //   B  túi chứa khí áp thấp (PVC "red mud" ~0,11 m³, ván + ~16 kg bao cát ⇒ ~6 cm cột nước), van an toàn cột nước 12 cm (xả lên ống
        //      thoát cao, ra qua lõi than chóp vòm), bẫy nước ngưng, lọc khí 3 cấp (tách ẩm · ô-xít sắt · than), áp kế chữ U, van một chiều + chặn lửa ⇒ ống gas vàng chôn chung rãnh với ống bồn cầu, khớp nối nhanh ở xe
        //   C  túi bã kín 45 L trên xe đẩy, bơm tay màng từ hố ra (khớp camlock, không hở) — bã KHÔNG vô trùng, chở đi xử lý tiếp
        //   + trạm men vi sinh (booster): thùng 20 L dịch men (bã hoạt tính hồi lưu từ hố ra), bơm nhu động 12 V 80 mL/phút pin mặt trời, 09:00 mỗi sáng bơm 1 L (bể < 15 °C: 4 L) vào hố nạp
        //  Mỗi khung: khí trữ theo giờ (sinh theo nhiệt độ bể, nấu sáng 7:00 + tối 18:30) ⇒ túi khí phồng / xẹp, vòm ống, áp kế, bọt chai an toàn khi đầy; đèn trạm
        //  men; túi bã đầy dần (~3 lần/tuần). Bấm ⇒ bảng số liệu sống + 2 việc hệ tự làm + bảng danh sách bộ phận;
        //  bấm 1 dòng ⇒ HOLOGRAM 3D bộ phận đó (vừa dải cạnh bảng, cỡ không theo zoom, camera đứng yên, bộ phận 7 có nước + bọt khí). Nhãn: bình thường chỉ 1 nhãn "♻ Biogas";
        //  bấm vào hệ (mở bảng) ⇒ 10 nhãn số bộ phận chính. Bảng + hologram đổi sang màu nhãn: thẻ be viền nâu sẫm, chữ đen, vòng số màu khối.
        //  Đường ống không ứ đọng, không bốc mùi: ống bồn cầu đi nổi lộ trên gối đỡ (không gờ đất che), dốc đều vào hộp nạp xây nổi (không còn
        //  đoạn chôn ngập dịch), két xe xả dồn 1 lần/ngày, chạc thông tắc + đầu nối vòi ở xe; đường gas không còn chỗ võng, bẫy nước ở đúng điểm thấp nhất.
        //  Trục cục bộ trùng trục xe (xoay theo xe, thu 0,72 thay vì 0,9): +X dọc rãnh về đuôi xe, +Z ngang về phía thân xe ----
        const biogas = (() => {
          const V = worldSee('van');
          const C = V.toWorld(0.17, 0, -9.22); C.y = cowY(C.x, C.z);   // tâm khu rào theo toạ độ xe (đv xe 0,9 m): sau tâm xe 0,15 m, ra phía −z 8,3 m — giữa nền hạ 1 bậc
          const ROT = V.yaw, cR = Math.cos(ROT), sR = Math.sin(ROT);   // song song với xe
          const SC = 0.72;   // (0,8) rồi nhỏ thêm 10 % (× 0,9): thu đều quanh tâm (chân vẫn trên đất); ống về xe tính qua worldToLocal ⇒ vẫn tới đúng chỗ trên xe
          const g = new THREE.Group(); g.name = 'Hệ biogas ống mềm'; g.position.copy(C); g.rotation.y = ROT; g.scale.setScalar(SC); scene.add(g); g.updateMatrixWorld(true);
          const sys = new THREE.Group(); sys.name = 'Biogas: thiết bị'; g.add(sys);
          const gA = new THREE.Group(), gB = new THREE.Group(), gS = new THREE.Group(), gC = new THREE.Group(), fence = new THREE.Group(), link = new THREE.Group();
          gA.name = 'Biogas A: túi ủ'; gB.name = 'Biogas B: khí'; gS.name = 'Biogas: trạm men vi sinh'; gC.name = 'Biogas C: túi bã'; fence.name = 'Biogas: hàng rào'; link.name = 'Biogas: ống về xe';
          sys.add(gA, gB, gS, gC); g.add(fence, link);
          const lam = c => new THREE.MeshLambertMaterial({ color: c }), pho = (c, s) => new THREE.MeshPhongMaterial({ color: c, shininess: s, specular: 0x2a2a2a });
          const M = {
            film: pho(0x2b2e31, 38), redmud: pho(0x8a4632, 22), dig: pho(0x3d553b, 26), wood: lam(0x8a6844), post: lam(0x7a5b3d), felt: lam(0xb8b4aa), soil: lam(0x6b5440), pale: lam(0xc4d8de),
            conc: lam(0xa8a49b), pvc: lam(0xe4e0d4), gas: lam(0xe0b43a), steel: lam(0x9aa3a8), dark: lam(0x3a3d40), white: lam(0xeceae4), brass: lam(0xc49a3c),
            burlap: lam(0xb39a6c), rust: lam(0xa8582a), lever: lam(0xc8402a), hoseB: lam(0x3d7fc4), hoseD: lam(0x4f5a34), cable: lam(0x232323), ply: lam(0xc9a774), alu: lam(0xc4c8cc),
            cells: pho(0x1d2a44, 70), water: pho(0x6aa7c8, 60), tray: lam(0x2c2e30), hd: pho(0x3d4349, 26), lg: pho(0xd8dbd6, 18), grn: lam(0x56a35e),
            glass: new THREE.MeshPhongMaterial({ color: 0xdfeef4, transparent: true, opacity: 0.26, shininess: 90, side: THREE.DoubleSide, depthWrite: false }),
            clear: new THREE.MeshPhongMaterial({ color: 0xe8f2f4, transparent: true, opacity: 0.35, shininess: 90, depthWrite: false }),
            ledG: new THREE.MeshBasicMaterial({ color: 0x46ff6a }), ledO: new THREE.MeshBasicMaterial({ color: 0xffa52e }),
          };
          M.gravel = new THREE.MeshLambertMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); let q = 7;   // nền sỏi: đốm sáng tối (giả ngẫu nhiên cố định)
            const r = () => (q = q * 16807 % 2147483647) / 2147483647; x.fillStyle = '#9b968a'; x.fillRect(0, 0, 64, 64);
            for (let i = 0; i < 260; i++) { const v = 112 + r() * 118 | 0; x.fillStyle = 'rgb(' + v + ',' + (v - 4) + ',' + (v - 13) + ')'; x.beginPath(); x.ellipse(r() * 64, r() * 64, 0.8 + r() * 1.7, 0.6 + r() * 1.2, r() * 3, 0, 7); x.fill(); }
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 2.5); t.anisotropy = 4; return t; })() });
          const add = (geo, mat, x, y, z, par, sh = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = sh; m.receiveShadow = true; par.add(m); return m; };
          const box = (w, h, d, mat, x, y, z, par, sh) => add(new THREE.BoxGeometry(w, h, d), mat, x, y, z, par, sh);
          const cyl = (r, h, mat, x, y, z, par, sh, seg = 12) => add(new THREE.CylinderGeometry(r, r, h, seg), mat, x, y, z, par, sh);
          const hose = (pts, r, mat, par) => { const cv = new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(p[0], p[1], p[2])), false, 'centripetal');
            const m = new THREE.Mesh(new THREE.TubeGeometry(cv, Math.max(8, pts.length * 7), r, 6, false), mat); m.castShadow = true; m.userData.noCollide = true; par.add(m); return m; };
          const valve = (x, y, z, ry, par) => { const v = new THREE.Group(); v.position.set(x, y, z); v.rotation.y = ry; par.add(v);   // van bi: thân đồng + cần gạt đỏ
            add(new THREE.SphereGeometry(0.022, 10, 8), M.brass, 0, 0, 0, v).scale.set(1.3, 1, 1); box(0.09, 0.012, 0.022, M.lever, 0.035, 0.03, 0, v); return v; };
          const pillow = (rx, ry, rz) => { const q = new THREE.SphereGeometry(1, 22, 12), P = q.attributes.position, f = (v, e) => Math.sign(v) * Math.pow(Math.abs(v), e);   // gối: cầu ép về hộp
            for (let i = 0; i < P.count; i++) P.setXYZ(i, f(P.getX(i), 0.45) * rx, f(P.getY(i), 0.8) * ry, f(P.getZ(i), 0.45) * rz); q.computeVertexNormals(); return q; };
          const ground = (x, z) => (cowY(C.x + SC * (x * cR + z * sR), C.z + SC * (z * cR - x * sR)) - C.y) / SC;   // mặt đất tại điểm cục bộ (x, z) → y cục bộ (nhóm xoay ROT + thu SC)
          // ---- A · TÚI Ủ trong rãnh ----
          const TX0 = -1.95, TX1 = 2.05, TZ = -0.45, TL = TX1 - TX0, TR_ = 0.32, YL = -0.04, TXM = (TX0 + TX1) / 2;   // rãnh dọc X · tâm Z · dài 4,0 (thật 2,9 m) · bán kính ống · mặt dịch
          for (const s of [-1, 1]) { box(TL + 0.36, 0.13, 0.12, M.wood, TXM, 0.065, TZ + s * 0.39, gA); box(TL + 0.2, 0.012, 0.06, M.felt, TXM, 0.006, TZ + s * 0.305, gA, false); }   // tà vẹt dọc + mép vải địa lót rãnh
          for (const x of [TX0 - 0.12, TX1 + 0.12]) box(0.12, 0.13, 0.66, M.wood, x, 0.065, TZ, gA);   // tà vẹt 2 đầu rãnh
          const tubeGeo = new THREE.CapsuleGeometry(TR_, TL - 2 * TR_, 6, 22); tubeGeo.rotateZ(Math.PI / 2);
          const tube = add(tubeGeo, M.film, TXM, YL, TZ, gA); tube.scale.set(1, 0.55, 0.92); tube.name = 'Túi ủ màng PE (khối A)';
          const lid = (x, w, y0 = 0) => { box(w, 0.07, w, M.conc, x, y0 + 0.035, TZ, gA); box(w * 0.5, 0.025, 0.04, M.dark, x, y0 + 0.082, TZ, gA); };   // nắp bê tông có gioăng + tay nắm
          const OX = TX0 - 0.5; lid(OX, 0.5);   // hố ra: nắp bê tông có gioăng ngang mặt đất
          // ---- HỐ NẠP HIỆN ĐẠI: phễu nhựa HDPE đúc liền bo góc, cao ngang gối 32 cm (cũ: hộp bê tông
          //  33 × 33 cm nổi 14 cm) ⇒ đổ rác bếp không phải cúi sát đất; nắp xám nhạt + gioăng kín mùi, cửa lật nửa trước (giỏ lọc rác bên dưới), tay quay cánh khuấy
          //  nửa sau, cửa sổ mức dịch + nhãn ở mặt trước (+z, phía xe), mặt −z: đầu nối ống men + ốc siết dây đo nhiệt; bệ bê tông mỏng. Cỡ 37 × 45 × 32 cm thật (+ nắp 3 cm) ----
          const IX = 2.54, IW = 0.26, ID = 0.31, IH = 0.44, gI = new THREE.Group(); gI.name = 'Biogas: hố nạp'; gA.add(gI);   // tâm · nửa rộng x · nửa sâu z · cao mép thân
          const rbox = (w, h, d, r, mat, x, y, z, par, sh) => { const q = new THREE.Shape(), a = w / 2 - r, b = d / 2 - r; q.absarc(a, b, r, 0, 1.571); q.absarc(-a, b, r, 1.571, 3.142); q.absarc(-a, -b, r, 3.142, 4.712); q.absarc(a, -b, r, 4.712, 6.283);
            const e = new THREE.ExtrudeGeometry(q, { depth: h, bevelEnabled: false, curveSegments: 3 }); e.rotateX(-Math.PI / 2); return add(e, mat, x, y, z, par, sh); };   // hộp bo 4 góc đứng, đáy ở y
          box(2 * IW + 0.05, 0.04, 2 * ID + 0.12, M.conc, IX - 0.025, 0.02, TZ, gI, false);   // bệ
          rbox(2 * IW, IH - 0.04, 2 * ID, 0.07, M.hd, IX, 0.04, TZ, gI); rbox(2 * IW + 0.024, 0.012, 2 * ID + 0.024, 0.08, M.dark, IX, IH, TZ, gI, false); rbox(2 * IW + 0.04, 0.045, 2 * ID + 0.04, 0.085, M.lg, IX, IH + 0.012, TZ, gI);   // thân · gioăng · nắp
          rbox(0.36, 0.014, 0.22, 0.04, M.hd, IX, IH + 0.057, TZ + 0.13, gI, false); box(0.16, 0.02, 0.024, M.steel, IX, IH + 0.081, TZ + 0.21, gI, false); box(0.38, 0.01, 0.014, M.dark, IX, IH + 0.06, TZ + 0.015, gI, false);   // cửa lật rác bếp · tay nắm · bản lề
          cyl(0.045, 0.03, M.dark, IX, IH + 0.072, TZ - 0.15, gI, false); box(0.17, 0.016, 0.03, M.steel, IX + 0.07, IH + 0.095, TZ - 0.15, gI, false); cyl(0.016, 0.07, M.lever, IX + 0.145, IH + 0.135, TZ - 0.15, gI, false, 8);   // tay quay khuấy
          box(0.06, 0.26, 0.008, M.clear, IX - 0.17, 0.23, TZ + ID + 0.004, gI, false); box(0.046, 0.1, 0.006, M.dig, IX - 0.17, 0.15, TZ + ID + 0.002, gI, false);   // cửa sổ mức dịch (ống nạp ngập, dịch đứng ~1/3)
          for (let i = 0; i < 4; i++) box(0.018, 0.004, 0.004, M.dark, IX - 0.13, 0.13 + i * 0.06, TZ + ID + 0.006, gI, false);
          box(0.17, 0.09, 0.006, M.white, IX + 0.01, 0.3, TZ + ID + 0.003, gI, false); box(0.17, 0.018, 0.007, M.gas, IX + 0.01, 0.336, TZ + ID + 0.004, gI, false);   // nhãn: dải vàng + chữ (nạp ≤ 15 L/ngày, không hoá chất)
          for (const [x, c] of [[IX + 0.1, M.hoseB], [IX - 0.08, M.dark]]) cyl(0.018, 0.03, c, x, 0.34, TZ - ID - 0.012, gI, false, 8).rotation.x = Math.PI / 2;   // đầu nối ống men · ốc siết dây đo nhiệt
          const HR = 0.52, HL = TL + 0.3;   // nhà kính: vòm bán kính · dài
          const hoopGeo = new THREE.TorusGeometry(HR, 0.011, 4, 18, Math.PI);
          for (let i = 0; i <= 5; i++) add(hoopGeo, M.steel, TXM - HL / 2 + i * HL / 5, 0, TZ, gA).rotation.y = Math.PI / 2;
          box(HL, 0.018, 0.018, M.steel, TXM, HR, TZ, gA);   // xà nóc
          const coverGeo = new THREE.CylinderGeometry(HR, HR, HL, 20, 1, true, 0, Math.PI); coverGeo.rotateZ(Math.PI / 2);
          const cover = add(coverGeo, M.glass, TXM, 0, TZ, gA, false); cover.name = 'Nhà kính polycarbonate (ủ ấm bể)';
          // ---- B · KHÍ: cửa thoát đỉnh túi → tê van an toàn → bẫy nước ngưng → van bi → túi chứa → lọc H2S → áp kế → van một chiều + chặn lửa → về xe ----
          const GX = -0.35;   // cửa thoát khí giữa đỉnh túi (bích 2 vòng đệm cao su)
          const flange = cyl(0.06, 0.016, M.dark, GX, 0.1, TZ, gA), riser = cyl(0.014, 1, M.gas, GX, 0.2, TZ, gA);   // ống đứng co dãn theo vòm (cập nhật mỗi khung)
          hose([[GX, 0.32, TZ], [GX, 0.36, TZ + 0.14], [GX - 0.14, 0.4, 0.06], [-0.68, 0.48, 0.42], [-0.86, 0.56, 0.6]], 0.013, M.gas, gB);   // cửa thoát → van chai nước: lên dốc liên tục (nước ngưng chảy về túi ủ, không chỗ võng)
          // ---- (7) VAN AN TOÀN NƯỚC + LỌC THAN KIỂU MỚI: cột acrylic trong có thang khắc (vạch đỏ = ống nhúng
          //  ngập 12 cm — áp không thu theo cỡ), nắp ren có nút châm nước, van xả đáy; khí xả lên ống thoát, ra qua LÕI THAN HOẠT TÍNH thay được ở đầu ống (kiểu lọc mùi
          //  ống thông hơi bể phốt, như Orenco CF3: thân PVC trắng Ø 9 × 22 cm, chóp vòm đen Ø 14 cm có khe) có lưới chặn lửa, đai chỉ thị xanh; cột thép thay cọc gỗ ----
          const RX = -0.86, RZ = 0.6, VZ = RZ - 0.06, gV = new THREE.Group(); gV.name = 'Biogas: van an toàn nước + lọc than'; gB.add(gV);
          box(0.05, 1.1, 0.05, M.steel, RX, 0.55, RZ - 0.15, gV); box(0.14, 0.012, 0.14, M.steel, RX, 0.006, RZ - 0.15, gV, false);   // cột thép vuông + đế
          for (const y of [0.27, 0.49, 0.85, 1.05]) box(0.026, 0.024, 0.1, M.steel, RX, y, RZ - 0.1, gV, false);   // đai giữ cột nước · ống thoát
          cyl(0.056, 0.31, M.clear, RX, 0.385, RZ, gV, false, 16); cyl(0.051, 0.18, M.water, RX, 0.315, RZ, gV, false, 16); cyl(0.009, 0.3, M.gas, RX, 0.39, RZ, gV, false, 8);   // ống acrylic · nước · ống nhúng
          for (const y of [0.22, 0.545]) cyl(0.063, 0.03, M.hd, RX, y, RZ, gV, true, 16);   // nắp đáy · nắp đỉnh ren (tê khí + ống xả xuyên nắp)
          box(0.016, 0.27, 0.004, M.white, RX, 0.385, RZ + 0.058, gV, false); for (let i = 0; i < 6; i++) box(i % 2 ? 0.008 : 0.014, 0.003, 0.003, M.dark, RX - 0.002, 0.27 + i * 0.03, RZ + 0.061, gV, false);   // thang khắc
          box(0.03, 0.006, 0.006, M.lever, RX, 0.405, RZ + 0.062, gV, false); cyl(0.012, 0.02, M.lever, RX + 0.03, 0.57, RZ + 0.02, gV, false, 8);   // vạch đỏ mực nước · nút châm nước
          cyl(0.009, 0.05, M.brass, RX + 0.075, 0.22, RZ, gV, false, 8).rotation.z = Math.PI / 2; box(0.032, 0.006, 0.012, M.lever, RX + 0.095, 0.236, RZ, gV, false);   // van xả đáy
          hose([[RX, 0.56, RZ], [RX, 0.66, RZ - 0.03], [RX, 0.76, VZ]], 0.008, M.dark, gV); cyl(0.014, 0.36, M.pvc, RX, 0.94, VZ, gV);   // khí xả: ống mềm lên ống thoát cứng
          cyl(0.0625, 0.3, M.pvc, RX, 1.25, VZ, gV, true, 16); cyl(0.064, 0.025, M.grn, RX, 1.33, VZ, gV, false, 16); cyl(0.064, 0.05, M.hd, RX, 1.19, VZ, gV, false, 16); cyl(0.058, 0.012, M.steel, RX, 1.406, VZ, gV, false, 16);   // lõi than · đai chỉ thị · nhãn · lưới chặn lửa
          add(new THREE.SphereGeometry(0.097, 16, 6, 0, 6.283, 0, 1.15), M.hd, RX, 1.385, VZ, gV);   // chóp vòm, khe thoát ở mép
          const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.009, 6, 4), M.white, 4); bub.visible = false; bub.frustumCulled = false; bub.name = 'Bọt khí chai an toàn'; gB.add(bub); const _bm = new THREE.Matrix4();   // bọt khí khi xả áp (1 lượt vẽ)
          hose([[-0.86, 0.56, 0.6], [-0.66, 0.3, 0.64], [-0.4, 0.045, 0.66], [-0.12, 0.055, 0.72], [0.12, 0.066, 0.84], [0.25, 0.076, 0.88]], 0.013, M.gas, gB);   // xuống điểm THẤP NHẤT (hộp bẫy) rồi lên dần tới túi
          box(0.16, 0.03, 0.16, M.conc, -0.4, 0.015, 0.66, gB, false); box(0.08, 0.012, 0.025, M.dark, -0.4, 0.036, 0.71, gB, false); valve(-0.35, 0.05, 0.62, 0.6, gB);   // BẪY NƯỚC NGƯNG ở điểm thấp nhất trước túi
          //  khí: tê chĩa xuống, chân ống ngập ~16 cm (= áp tối đa 12 cm + 30 %, Energypedia) trong hộp sỏi ⇒ tự tràn, không phải đổ; van bi để xả tay hằng tuần (sổ tay GE)
          valve(-0.08, 0.058, 0.735, -0.3, gB);   // van bi sau van an toàn
          const BAG_RY = 0.18, bagX = 0.95, bagZ = 0.88;   // TÚI CHỨA KHÍ ~0,11 m³ thật (1,04 × 0,58 m, cao 0,26 khi đầy) trên tấm lót
          box(1.6, 0.01, 0.95, M.felt, bagX, 0.005, bagZ, gB, false);
          const bag = add(pillow(0.72, BAG_RY, 0.4), M.redmud, bagX, BAG_RY, bagZ, gB); bag.name = 'Túi chứa khí áp thấp (khối B)';
          const wgt = new THREE.Group(); wgt.position.set(bagX, 2 * BAG_RY, bagZ); gB.add(wgt);   // ván + 3 bao cát (~16 kg trên 0,26 m²) tạo áp ~6 cm nước, nổi theo mặt túi
          box(0.9, 0.02, 0.46, M.ply, 0, 0.01, 0, wgt);
          for (const x of [-0.3, 0, 0.3]) add(pillow(0.13, 0.05, 0.1), M.burlap, x, 0.065, 0, wgt);
          const BX = 2.42, BZ = 1.2, FZ = BZ + 0.05;   // BẢNG THIẾT BỊ (mặt quay về phía xe)
          for (const x of [BX - 0.33, BX + 0.33]) box(0.06, 0.85, 0.06, M.post, x, 0.425, BZ - 0.045, gB);
          box(0.74, 0.5, 0.025, M.ply, BX, 0.55, BZ - 0.005, gB);
          // ---- (5) LỌC KHÍ 3 CẤP KIỂU MỚI: 3 cốc lọc treo dưới đầu đúc trên 1 thanh ray, khí đi trái → phải, khí vào đầu cốc
          //  xuống ống giữa rồi đi NGƯỢC LÊN qua lớp vật liệu: ① tách ẩm (cốc trong, nước ngưng đọng đáy, van xả tay) ② hạt ô-xít sắt khử H₂S (cốc trong thấy hạt nâu cam;
          //  đen dần từ đáy lên = sắp hết, thay lõi) ③ than hoạt tính tẩm kiềm (cốc đen) bắt nốt H₂S + mùi. Thay ống trong nhồi bông sắt nằm ngang ----
          const gF = new THREE.Group(); gF.name = 'Biogas: lọc khí 3 cấp'; gB.add(gF); box(0.4, 0.02, 0.02, M.steel, BX - 0.08, 0.74, FZ - 0.03, gF, false);   // thanh ray
          let px = -0.27; const cup = (x, r, h, mat) => { const w = 2 * r + 0.012; box(w, 0.05, 0.07, M.hd, BX + x, 0.705, FZ, gF); cyl(r, h, mat, BX + x, 0.68 - h / 2, FZ, gF, true, 14); cyl(r + 0.006, 0.02, M.hd, BX + x, 0.672, FZ, gF, false, 14);   // đầu đúc · cốc · vòng siết
            cyl(0.011, x - w / 2 - px, M.gas, BX + (px + x - w / 2) / 2, 0.705, FZ, gF, false, 8).rotation.z = Math.PI / 2; px = x + w / 2; };   // ống nối từ đầu trước
          cup(-0.2, 0.032, 0.13, M.clear); cyl(0.028, 0.025, M.water, BX - 0.2, 0.563, FZ, gF, false, 12); cyl(0.008, 0.04, M.brass, BX - 0.2, 0.531, FZ, gF, false, 8); box(0.03, 0.006, 0.01, M.lever, BX - 0.185, 0.516, FZ, gF, false);   // ① + nước ngưng + van xả
          cup(-0.08, 0.05, 0.26, M.clear); cyl(0.045, 0.16, M.rust, BX - 0.08, 0.575, FZ, gF, false, 14); cyl(0.0455, 0.05, M.dark, BX - 0.08, 0.47, FZ, gF, false, 14); add(new THREE.TorusGeometry(0.051, 0.0025, 4, 24), M.lever, BX - 0.08, 0.6, FZ, gF, false).rotation.x = Math.PI / 2;   // ② ~0,5 L hạt · đoạn đã đen ở đáy · vạch đỏ thay lõi
          cup(0.04, 0.034, 0.16, M.dark); cyl(0.035, 0.03, M.white, BX + 0.04, 0.6, FZ, gF, false, 14);   // ③ + nhãn
          cyl(0.011, 0.11 - px, M.gas, BX + (px + 0.11) / 2, 0.705, FZ, gF, false, 8).rotation.z = Math.PI / 2; cyl(0.007, 0.03, M.brass, BX + 0.095, 0.725, FZ, gF, false, 8); cyl(0.009, 0.008, M.lever, BX + 0.095, 0.742, FZ, gF, false, 8);   // ống ra + cổng thử giấy chì axetat (nắp đỏ)
          box(0.1, 0.4, 0.006, M.white, BX + 0.24, 0.5, BZ + 0.012, gB);   // ÁP KẾ chữ U (thang 0–20 cm)
          const man = []; for (const s of [-1, 1]) man.push(cyl(0.0065, 1, M.water, BX + 0.24 + s * 0.025, 0.41, BZ + 0.03, gB, false, 8));
          hose([[BX + 0.215, 0.68, BZ + 0.03], [BX + 0.215, 0.33, BZ + 0.03], [BX + 0.24, 0.31, BZ + 0.03], [BX + 0.265, 0.33, BZ + 0.03], [BX + 0.265, 0.68, BZ + 0.03]], 0.008, M.clear, gB).castShadow = false;   // ống chữ U trong
          cyl(0.0065, 0.03, M.water, BX + 0.24, 0.312, BZ + 0.03, gB, false, 8).rotation.z = Math.PI / 2;
          cyl(0.02, 0.07, M.brass, BX + 0.09, 0.47, FZ, gB); cyl(0.011, 0.04, M.gas, BX + 0.09, 0.42, FZ, gB);   // van một chiều + đoạn nối
          const arr = cyl(0.028, 0.09, M.dark, BX + 0.09, 0.36, FZ, gB); for (const y of [-0.025, 0, 0.025]) cyl(0.04, 0.006, M.steel, 0, y, 0, arr, false);   // chặn lửa (lưới tản nhiệt)
          hose([[bagX + 0.73, 0.08, bagZ], [1.98, 0.1, 1.04], [BX - 0.27, 0.3, FZ], [BX - 0.27, 0.705, FZ]], 0.012, M.gas, gB);   // túi → lọc: lên dốc liên tục (bản trước võng ~1 cm sau đầu nối túi = chỗ đọng nước)
          hose([[BX + 0.11, 0.705, FZ], [BX + 0.15, 0.62, FZ], [BX + 0.09, 0.55, FZ], [BX + 0.09, 0.5, FZ]], 0.011, M.gas, gB);   // lọc → van một chiều
          hose([[BX + 0.15, 0.62, FZ], [BX + 0.21, 0.7, BZ + 0.03], [BX + 0.215, 0.68, BZ + 0.03]], 0.004, M.dark, gB);   // nhánh áp kế
          hose([[BX + 0.09, 0.31, FZ], [BX + 0.12, 0.2, FZ + 0.02], [BX + 0.3, 0.1, FZ + 0.06], [BX + 0.36, -0.03, FZ + 0.1]], 0.012, M.gas, gB);   // chặn lửa → xuống rãnh về xe
          valve(BX + 0.13, 0.2, FZ + 0.03, 0.4, gB);
          // ---- TRẠM MEN VI SINH (booster) ----
          // (10) KIỂU MỚI: thùng HDPE trắng có áo cách nhiệt, dải mức trong khắc vạch, nắp vặn + van thở; tủ điều khiển IP65
          //  trên cột nhôm: màn hình (nhiệt bể · giờ liều · lít), 2 đèn trạng thái, đầu bơm nhu động 80 mL/phút lộ ra (rô-to + vòng ống — không chạm dịch, tự mồi, đếm liều theo vòng),
          //  hộp ắc quy dưới tủ, tấm pin ~10 W trên đỉnh cột, dây đo nhiệt thả vào hố nạp. Thùng 20 L, lưới lọc dưới nắp (hạt bã không tắc ống bơm)
          const DX = 2.42, DZ = -1.2;
          cyl(0.185, 0.5, M.hoseD, DX, 0.25, DZ, gS, true, 18); cyl(0.192, 0.3, M.lg, DX, 0.26, DZ, gS, true, 18); cyl(0.14, 0.04, M.hd, DX, 0.52, DZ, gS, true, 16); cyl(0.015, 0.03, M.hd, DX + 0.08, 0.55, DZ - 0.05, gS, false, 8);   // thùng · áo · nắp · van thở
          box(0.03, 0.4, 0.006, M.clear, DX, 0.25, DZ + 0.196, gS, false); box(0.022, 0.24, 0.004, M.dig, DX, 0.15, DZ + 0.195, gS, false); for (let i = 0; i < 5; i++) box(0.014, 0.003, 0.004, M.dark, DX + 0.022, 0.1 + i * 0.08, DZ + 0.197, gS, false);   // dải mức
          box(0.045, 0.8, 0.045, M.alu, 2.72, 0.4, -1.3, gS); box(0.13, 0.01, 0.13, M.alu, 2.72, 0.005, -1.3, gS, false);   // cột nhôm + đế
          box(0.17, 0.2, 0.09, M.lg, 2.72, 0.45, -1.23, gS); box(0.15, 0.17, 0.006, M.hd, 2.72, 0.45, -1.183, gS, false); box(0.1, 0.045, 0.004, M.cells, 2.72, 0.5, -1.179, gS, false);   // tủ IP65 · mặt · màn hình
          for (const [x, w] of [[2.695, 0.03], [2.735, 0.02], [2.76, 0.012]]) box(w, 0.012, 0.002, M.ledG, x, 0.5, -1.176, gS, false);   // số trên màn hình (vạch sáng)
          cyl(0.04, 0.02, M.hd, 2.72, 0.405, -1.172, gS, false, 16).rotation.x = Math.PI / 2; add(new THREE.TorusGeometry(0.028, 0.006, 6, 16), M.hoseB, 2.72, 0.405, -1.16, gS, false); cyl(0.042, 0.006, M.clear, 2.72, 0.405, -1.156, gS, false, 16).rotation.x = Math.PI / 2;   // đầu bơm nhu động: thân · vòng ống · nắp trong
          box(0.12, 0.08, 0.08, M.hd, 2.72, 0.3, -1.24, gS);   // hộp ắc quy 12 V
          const ledG = add(new THREE.SphereGeometry(0.011, 8, 6), M.ledG, 2.785, 0.535, -1.18, gS, false), ledO = add(new THREE.SphereGeometry(0.011, 8, 6), M.ledO, 2.785, 0.51, -1.18, gS, false);
          const pv = new THREE.Group(); pv.position.set(2.72, 0.82, -1.3); pv.rotation.z = -0.26; gS.add(pv);   // tấm pin ~10 W nghiêng 15° về nam (−z thế giới)
          box(0.46, 0.025, 0.34, M.alu, 0, 0, 0, pv); box(0.42, 0.006, 0.3, M.cells, 0, 0.014, 0, pv);
          hose([[DX + 0.04, 0.54, DZ], [DX + 0.13, 0.58, DZ + 0.02], [2.66, 0.45, -1.16], [2.69, 0.415, -1.16]], 0.007, M.hoseB, gS);   // hút dịch men
          hose([[2.75, 0.395, -1.16], [2.8, 0.05, -1.0], [2.78, 0.03, -0.75], [IX + 0.1, 0.34, TZ - ID - 0.03]], 0.008, M.hoseB, gS);   // bơm → hố nạp (đầu nối vách −z)
          hose([[2.76, 0.35, -1.25], [2.84, 0.04, -1.05], [2.6, 0.2, -0.86], [IX - 0.08, 0.34, TZ - ID - 0.03]], 0.004, M.cable, gS);   // dây đo nhiệt độ thả vào hố nạp (qua vách −z, né măng sông ống bồn cầu ở vách +x)
          hose([[OX + 0.05, 0.08, TZ - 0.2], [OX + 0.15, 0.02, -1.12], [-1.5, 0.02, -1.14], [1.6, 0.02, -1.14], [2.15, 0.08, -1.17], [2.2, 0.5, -1.18], [2.3, 0.575, -1.19], [DX - 0.06, 0.55, DZ + 0.01]], 0.011, M.hoseD, gS);   // hồi lưu bã hoạt tính về thùng men
          // ---- C · TÚI BÃ: bơm tay màng trên hố ra (2 ngả: ra túi · hồi lưu về thùng men) → khớp camlock → túi kín 45 L trong khay trên xe đẩy ----
          cyl(0.055, 0.14, M.dark, OX + 0.1, 0.15, TZ + 0.12, gC); box(0.36, 0.022, 0.022, M.steel, OX + 0.26, 0.24, TZ + 0.12, gC).rotation.z = 0.25;
          const KX = -2.02, KZ = 0.82, KY = 0.3;   // xe đẩy: dài theo Z, tay kéo về cửa rào
          box(0.66, 0.035, 1.0, M.steel, KX, KY, KZ, gC);
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) cyl(0.11, 0.05, M.dark, KX + sx * 0.37, 0.11, KZ + sz * 0.36, gC, true, 14).rotation.z = Math.PI / 2;
          for (const sz of [-1, 1]) { box(0.8, 0.02, 0.02, M.steel, KX, 0.11, KZ + sz * 0.36, gC); box(0.6, 0.17, 0.02, M.steel, KX, 0.2, KZ + sz * 0.36, gC); }   // trục bánh + thanh đỡ sàn
          hose([[KX, KY, KZ + 0.5], [KX, KY + 0.12, KZ + 0.62], [KX, KY + 0.38, KZ + 0.66]], 0.014, M.steel, gC); box(0.3, 0.03, 0.03, M.dark, KX, KY + 0.4, KZ + 0.66, gC);
          box(0.6, 0.1, 0.94, M.tray, KX, KY + 0.067, KZ, gC);   // khay hứng tràn
          const DIG_RY = 0.15, digBag = add(pillow(0.27, DIG_RY, 0.44), M.dig, KX, KY + 0.04 + DIG_RY, KZ, gC); digBag.name = 'Túi bã kín 45 L (khối C)';
          const digTop = new THREE.Group(); digTop.position.set(KX, KY + 0.04 + 2 * DIG_RY, KZ); gC.add(digTop); box(0.2, 0.006, 0.13, M.gas, 0, 0.003, -0.05, digTop);   // nhãn vàng "bã không vô trùng" nổi theo mặt túi
          cyl(0.03, 0.05, M.alu, KX, KY + 0.12, KZ - 0.47, gC).rotation.x = Math.PI / 2;   // khớp camlock
          hose([[OX + 0.1, 0.22, TZ + 0.12], [OX + 0.22, 0.25, TZ + 0.5], [KX - 0.05, 0.3, KZ - 0.62], [KX, KY + 0.12, KZ - 0.5]], 0.016, M.hoseD, gC);
          // ---- HÀNG RÀO cọc gỗ + 2 dây thép, cửa phía xe đẩy; biển cấm lửa ----
          const FX = 2.85, FZ_ = 1.5, posts = [];
          const bottom = [FX, 1.9, 0.95, 0, -0.8, -1.55, -2.45, -FX];
          for (let i = 0; i <= 6; i++) posts.push([FX - i * FX / 3, -FZ_]);
          for (const x of bottom) posts.push([x, FZ_]);
          for (const sx of [-1, 1]) for (const z of [-0.75, 0, 0.75]) posts.push([sx * FX, z]);   // cọc 2 đầu cách đều 0,75 (cũ ±0,5: cọc −0,5 sát ống bồn cầu vào hộp nạp ở z −0,45)
          for (const [x, z] of posts) box(0.055, 0.95, 0.055, M.post, x, 0.475, z, fence);
          const run = pts => { for (let i = 0; i + 1 < pts.length; i++) for (const h of [0.42, 0.82]) {   // dây thép = thanh mảnh có chiếu sáng (đường kẻ không nhận đèn ⇒ đêm sáng trắng)
            const [x0, z0] = pts[i], [x1, z1] = pts[i + 1], w = box(Math.hypot(x1 - x0, z1 - z0), 0.007, 0.007, M.steel, (x0 + x1) / 2, h, (z0 + z1) / 2, fence, false); w.rotation.y = Math.atan2(-(z1 - z0), x1 - x0); w.userData.noCollide = true; } };
          run([[-1.55, FZ_], [-0.8, FZ_], [0, FZ_], [FX, FZ_], [FX, -FZ_], [-FX, -FZ_], [-FX, FZ_], [-2.45, FZ_]]);
          for (const y of [0.25, 0.8]) box(0.86, 0.04, 0.03, M.wood, -2.0, y, FZ_, fence); for (const x of [-2.41, -1.59]) box(0.04, 0.59, 0.03, M.wood, x, 0.525, FZ_, fence);   // cửa rào khép: 2 thanh ngang + 2 thanh đứng
          box(0.98, 0.035, 0.03, M.wood, -2.0, 0.525, FZ_, fence).rotation.z = 0.56;   //   + thanh chéo
          const signTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 176; const x = c.getContext('2d');
            x.fillStyle = '#f2c230'; x.fillRect(0, 0, 256, 176); x.lineWidth = 10; x.strokeStyle = '#1d1d1d'; x.strokeRect(5, 5, 246, 166);
            x.beginPath(); x.moveTo(40, 72); x.lineTo(64, 28); x.lineTo(88, 72); x.closePath(); x.fillStyle = '#1d1d1d'; x.fill(); x.fillStyle = '#f2c230'; x.fillRect(61, 42, 6, 16); x.fillRect(61, 62, 6, 6);
            x.fillStyle = '#1d1d1d'; x.textAlign = 'left'; x.font = '800 40px Inter, system-ui, Arial'; x.fillText('BIOGAS', 98, 66);
            x.textAlign = 'center'; x.font = '700 30px Inter, system-ui, Arial'; x.fillText('CẤM LỬA · 3 m', 128, 112); x.font = '600 19px Inter, system-ui, Arial'; x.fillText('bã ủ KHÔNG vô trùng', 128, 148);
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
          add(new THREE.PlaneGeometry(0.36, 0.25), new THREE.MeshLambertMaterial({ map: signTex }), -1.55, 0.7, FZ_ + 0.035, fence, false);
          // ---- ỐNG VỀ XE. Ống bồn cầu ~80 mm (bản vẽ 110 × 0,72 ≈ 3", cỡ
          //  cổng xả két xe nhà di động) KHÔNG chôn: mặt dịch chỉ 3 cm dưới đất ⇒ ống chôn nằm dưới mép tràn, ngập dịch quanh năm = 6 m bể lắng (tắc, thối). Ống đi
          //  nổi trên mặt đất, dốc đều từ xe về hộp nạp xây nổi (~11 % từ khi đặt cạnh xe: đoạn ngắn, két xả dồn cả khối nước), để lộ trên gối đỡ cọc (không gờ đất che); tâm ống vào hộp cao hơn mặt dịch ~10 cm. Ở xe: van
          //  xả két (tay kéo đỏ) → camlock → chạc 45° có nắp thông tắc + đầu nối vòi tráng ống, rồi chạy nổi. Két xe đóng van, xả dồn 1 lần/ngày (khối nước lớn cuốn
          //  chất rắn; để van mở thì nước chảy hết, chất rắn nằm lại). Ống gas ½" chôn trong rãnh lớp cát, dốc ≥ 1 % về hộp xả nước ngưng ở điểm thấp
          //  duy nhất của đoạn chôn (cùng nền: sát xe; hệ ở nền thấp hơn: đầu bảng thiết bị) ----
          const vP = (x, y, z) => g.worldToLocal(V.toWorld(x, y, z)).toArray(), TW = V.bath.twcX - 0.05, YO = 0.36;   // TW: ngay dưới bồn cầu · YO: tâm cổng xả (đv xe: đáy két 0,32, sàn 0,55)
          const g2 = vP(2.75, -0.05, -1.4), A0 = vP(TW, YO, -1.35), U = [0, -1];   // A0: miệng chạc 45° = đầu ống nổi · U: hướng ống ra khỏi xe (vuông góc thân xe)
          // ---- CỔNG XẢ KÉT ĐEN dưới gầm: két ~45 L treo 2 đai thép dưới sàn, giữa bánh sau và đuôi xe — ống
          //  KHÔNG chui qua vỏ xe. Từ mặt két ra phía hệ: cổ két → cặp bích 4 bu lông + gioăng → van lưỡi 3" (tay kéo chữ T đỏ: kéo về đuôi xe là mở) →
          //  camlock (tháo khi xe chạy) → chạc 45° nhánh chĩa ngược dòng (nắp ren thông tắc + đầu nối vòi tráng ống) → ống nổi. Dựng theo đv xe (0,9 m) ----
          const po = new THREE.Group(); po.name = 'Biogas: cổng xả két xe'; link.add(po);
          { const o = new THREE.Vector3(...vP(TW, YO, -0.9)), b = (x, y, z) => new THREE.Vector3(...vP(TW + x, YO + y, -0.9 + z)).sub(o);
            new THREE.Matrix4().makeBasis(b(1, 0, 0), b(0, 1, 0), b(0, 0, 1)).setPosition(o).decompose(po.position, po.quaternion, po.scale); }   // trục po = trục xe, gốc = tâm cổng trên mặt két
          const zr = m => { m.rotation.x = Math.PI / 2; return m; };   // trụ nằm dọc z (chiều dòng chảy)
          box(0.6, 0.23, 0.45, M.tray, 0, 0.075, 0.225, po);   // két đen: đáy 0,32, nóc sát sàn 0,55
          for (const x of [-0.2, 0.2]) { box(0.03, 0.012, 0.47, M.steel, x, -0.046, 0.225, po, false); box(0.03, 0.245, 0.008, M.steel, x, 0.077, -0.006, po, false); }   // 2 đai thép treo két vào sàn
          zr(cyl(0.05, 0.07, M.tray, 0, 0, -0.035, po));   // cổ két
          zr(cyl(0.08, 0.012, M.steel, 0, 0, -0.076, po)); zr(cyl(0.075, 0.006, M.dark, 0, 0, -0.085, po, false)); zr(cyl(0.08, 0.012, M.steel, 0, 0, -0.094, po));   // cặp bích + gioăng
          for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; zr(cyl(0.01, 0.05, M.steel, 0.064 * Math.cos(a), 0.064 * Math.sin(a), -0.085, po, false, 6)); }   // 4 bu lông
          box(0.25, 0.14, 0.05, M.dark, 0.05, 0, -0.125, po);   // thân van lưỡi (hộp lưỡi trượt về phía đuôi xe)
          for (const x of [-1, 1]) for (const y of [-1, 1]) zr(cyl(0.011, 0.016, M.steel, x * 0.056, y * 0.056, -0.157, po, false, 6));   //   + 4 đầu bu lông xiết bích van (mặt ngoài)
          cyl(0.009, 0.13, M.steel, 0.24, 0, -0.125, po, false, 6).rotation.z = Math.PI / 2; box(0.026, 0.12, 0.032, M.lever, 0.31, 0, -0.125, po);   // cần van + tay kéo chữ T đỏ
          zr(cyl(0.062, 0.06, M.alu, 0, 0, -0.18, po)); zr(cyl(0.053, 0.05, M.alu, 0, 0, -0.235, po));   // camlock: đầu cái + đầu đực
          for (const s of [-1, 1]) { box(0.022, 0.03, 0.022, M.alu, s * 0.066, 0, -0.163, po, false); box(0.013, 0.013, 0.1, M.alu, s * 0.077, 0, -0.205, po, false).rotation.y = s * 0.28; }   //   + 2 tai + 2 cần khoá
          zr(cyl(0.05, 0.18, M.pvc, 0, 0, -0.36, po));   // thân chạc 45°
          { const br = (r, h, k, m) => { const c = cyl(r, h, m, 0, k * 0.7071, -0.4 + k * 0.7071, po); c.rotation.x = Math.PI / 4; return c; };   // nhánh chĩa lên, ngược dòng
            br(0.043, 0.13, 0.065, M.pvc); br(0.051, 0.026, 0.143, M.dark); br(0.013, 0.05, 0.18, M.brass); }   //   nhánh · nắp ren thông tắc · đầu nối vòi tráng ống
          // ---- TUYẾN ỐNG BỒN CẦU: 2 đoạn thẳng vuông góc nối bằng 1 cút cong dài 90° — đoạn 1 thẳng ra từ hông
          //  xe (vuông góc thân xe) qua mép bậc, đoạn 2 thẳng vào vách hộp nạp (vuông góc vách); không đoạn chéo, không đi sát cọc rào ----
          const RB = 0.36, XO = A0[0], XB = XO - RB, ZB = TZ + RB, XD = IX + IW + 0.04;   // cút cong dài: bán kính tâm 0,36 (26 cm ≈ 3,3 × cỡ ống) · XD: đầu ống lọt trong măng sông
          const L1 = A0[2] - ZB, LA = Math.PI * RB / 2, L3 = XB - XD, LT = L1 + LA + L3;   // s: từ miệng chạc (cao Y0) tới hộp nạp (tâm ống YIN)
          const pAt = s => { if (s <= L1) return [XO, 0, A0[2] - s]; if (s <= L1 + LA) { const t = -(s - L1) / RB; return [XB + RB * Math.cos(t), 0, ZB + RB * Math.sin(t)]; } return [XB - (s - L1 - LA), 0, TZ]; };
          const YIN = 0.1, Y0 = A0[1], Sb = pAt(0.5);
          //  hệ ở nền thấp hơn xe 1 bậc (0,6 m) ⇒ ống chạy nền trên dốc ≥ 4 % tới quá mép bậc 15 cm, đổ xuống 45°, rồi dốc 4 % tới hộp nạp: không đoạn nằm ngang,
          //  không chỗ võng. Cùng nền thì dốc đều như cũ
          let sE = -1, gU = 0; for (let s = 0; s <= LT; s += 0.05) { const p = pAt(s), y = ground(p[0], p[2]); if (y > YIN + 0.4) { sE = s; gU = Math.max(gU, y); } }
          let s1 = -1, sD = -1;   // đầu / cuối đoạn đổ 45° qua mép bậc
          const prof = (() => { if (sE < 0) return s => Y0 - (Y0 - YIN) * s / LT;
            s1 = sE + 0.15; const YE = Math.min(Y0 - 0.01 * s1, Math.max(gU + 0.105, Y0 - 0.04 * s1)), k = 0.04;
            sD = Math.max(s1, Math.min(LT, s1 + YE - YIN, (YE + s1 - YIN - k * LT) / (1 - k))); const yD = YE - (sD - s1);
            return s => s <= s1 ? Y0 - (Y0 - YE) * s / s1 : s <= sD ? YE - (s - s1) : yD - (yD - YIN) * (s - sD) / Math.max(1e-6, LT - sD); })();
          const PROF_S = s1 < 0 ? [] : [s1, sD];   // chỗ gãy dốc (giữ đúng hình khi nối đường cong)
          // ---- ĐẦU VÀO HỘP NẠP: măng sông xuyên vách +x (bích ép + gioăng cao su, 4 bu lông), ống lọt vào măng sông vuông góc vách, sâu ~4 cm; cọc rào dời ra ----
          { const gIn = new THREE.Group(); gIn.name = 'Biogas: măng sông vào hộp nạp'; gA.add(gIn); const xr = m => { m.rotation.z = Math.PI / 2; return m; }, xw = IX + IW;   // trụ nằm dọc x · mặt vách
            xr(cyl(0.098, 0.008, M.dark, xw + 0.004, YIN, TZ, gIn, false)); xr(cyl(0.094, 0.014, M.steel, xw + 0.015, YIN, TZ, gIn));   // gioăng + bích ép
            for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2; xr(cyl(0.008, 0.03, M.steel, xw + 0.022, YIN + 0.08 * Math.sin(a), TZ + 0.08 * Math.cos(a), gIn, false, 6)); }   // 4 bu lông
            xr(cyl(0.066, 0.07, M.pvc, xw + 0.057, YIN, TZ, gIn)); xr(cyl(0.07, 0.012, M.dark, xw + 0.094, YIN, TZ, gIn, false)); }   // măng sông + vòng gioăng miệng
          hose([vP(2.75, 0.53, -0.85), vP(2.75, 0.47, -0.98), vP(2.75, 0.4, -1.2), vP(2.75, 0.2, -1.36), g2], 0.012, M.gas, link);   // ống gas: từ sàn xe (bích xuyên sàn, không chui vỏ) xuống rãnh
          { const p = vP(2.75, 0.535, -0.85); box(0.1, 0.012, 0.1, M.steel, p[0], p[1], p[2], link, false); cyl(0.022, 0.022, M.brass, p[0], p[1] - 0.017, p[2], link, false, 6); }   // bích xuyên sàn + đai ốc đồng (vào tủ bếp)
          const gasQ = vP(2.75, 0.24, -1.36); valve(gasQ[0], gasQ[1], gasQ[2], 0, link); cyl(0.02, 0.05, M.brass, gasQ[0], gasQ[1] - 0.08, gasQ[2], link);   // van khoá ngoài xe + khớp nối nhanh
          const NP = [-U[1], U[0]], dg = (g2[0] - Sb[0]) * NP[0] + (g2[2] - Sb[2]) * NP[1], sd = Math.sign(dg) || 1, ko = Math.max(0.16, 0.62 - Math.abs(dg));
          const gasLowAtBoard = ground(g2[0], g2[2]) > ground(BX + 0.36, FZ + 0.1) + 0.3;   // nền xe cao hơn nền hệ ⇒ ống gas chôn lên dốc về xe, điểm thấp ở đầu bảng thiết bị
          const DB = gasLowAtBoard ? [BX + 0.36, FZ_ + 0.16] : [g2[0] + NP[0] * sd * ko, g2[2] + NP[1] * sd * ko];   // ngoài rào, cạnh chỗ ống gas xuống đất · cùng nền: sát xe, lệch khỏi tuyến ống bồn cầu
          { const y = ground(DB[0], DB[1]); box(0.2, 0.03, 0.2, M.conc, DB[0], y + 0.015, DB[1], link, false); box(0.1, 0.012, 0.03, M.dark, DB[0], y + 0.036, DB[1], link, false); }   // hộp van xả nước ngưng ở điểm thấp đường gas chôn
          const strip = (a, b, w) => { const dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz), ry = Math.atan2(-dz, dx), N = Math.max(1, Math.ceil(L / 0.02)), at = t => [a[0] + dx * t, a[2] + dz * t];
            const put = (x, y, z, l, h) => { const s = box(l, h, w, M.soil, x, y, z, link, false); s.rotation.y = ry; s.userData.noCollide = true; };
            const cut = [0], ys = [ground(a[0], a[2])];   // chia vệt theo bậc địa hình: mỗi đoạn một độ cao, vách bậc phủ 1 tấm đất đứng (rãnh ống đi xuống theo vách)
            for (let k = 1; k <= N; k++) { const [x, z] = at(k / N), y = ground(x, z); if (Math.abs(y - ys[ys.length - 1]) > 0.3) { cut.push((k - 0.5) / N); ys.push(y); } }
            cut.push(1);
            for (let r = 0; r < ys.length; r++) { const t0 = cut[r], t1 = cut[r + 1], n = Math.max(1, Math.ceil(L * (t1 - t0) / 0.8));
              for (let i = 0; i < n; i++) { const [x, z] = at(t0 + (t1 - t0) * (i + 0.5) / n); put(x, ys[r] + 0.009, z, L * (t1 - t0) / n + 0.02, 0.025); }
              if (r) { const [x, z] = at(t0), h = Math.abs(ys[r] - ys[r - 1]); put(x, Math.min(ys[r], ys[r - 1]) + h / 2 + 0.009, z, 0.05, h + 0.025); } } };
          const GK = [g2[0], 0, FZ + 0.1];   // góc rãnh gas: chạy song song ống bồn cầu (vuông góc thân xe) rồi rẽ vuông vào bảng thiết bị
          strip([g2[0], 0, g2[2]], GK, 0.2); strip(GK, [BX + 0.36, 0, FZ + 0.1], 0.2);   // vệt đất lấp ống gas chôn xe → bảng thiết bị, hình L (nền hạ 1 bậc: lên dốc về xe)
          // ---- ỐNG BỒN CẦU ĐỂ LỘ (bỏ ốp, để lộ ống): ống nổi trên gối đỡ cọc gỗ + đai ôm, dốc đều về hộp nạp. Gối cách đều
          //  trong từng đoạn (≤ 0,95 = 0,68 m): nền trên tới mép bậc · chân bậc tới giữa cút · giữa đoạn vào hộp. Ống PVC lộ nắng phải sơn phủ ----
          { const imp = [-0.02, ...PROF_S, L1, LT]; for (let i = 1; i <= 8; i++) imp.push(L1 + LA * i / 8);   // mẫu bắt buộc: chỗ gãy dốc, cút (8 khúc), 2 đầu
            const S = imp.concat(); for (let s = 0.45; s < LT; s += 0.5) if (imp.every(q => Math.abs(q - s) > 0.12)) S.push(s); S.sort((a, b) => a - b);   //   + mẫu thường ~0,5
            hose(S.map(s => { const p = pAt(s); return [p[0], prof(s), p[2]]; }), 0.055, M.pvc, link);
            const fill = (a, b) => { if (b - a < 0.3) return [a]; const n = Math.ceil((b - a) / 0.95 - 1e-6), r = []; for (let i = 0; i <= n; i++) r.push(a + (b - a) * i / n); return r; };   // gối cách đều, ≤ 0,95
            const sBm = L1 + LA / 2;   // giữa cút
            const SP = PROF_S.length ? [...fill(0.55, s1 - 0.2), ...fill(sD + 0.15, sBm)] : fill(0.55, sBm);   // đoạn đổ: 1 gối trên mép bậc, 1 gối chân bậc
            SP.push(L1 + LA + L3 / 2);   //   + giữa đoạn thẳng vào hộp nạp
            for (const s of SP) {
              const q = pAt(s), a = pAt(s - 0.1), b = pAt(s + 0.1), y = prof(s), gy = ground(q[0], q[2]), h = y - 0.055 - gy + 0.06;
              if (h > 0.03) box(0.035, h, 0.035, M.post, q[0], gy - 0.06 + h / 2, q[2], link, false);
              const r = add(new THREE.TorusGeometry(0.058, 0.006, 4, 12, Math.PI), M.steel, q[0], y, q[2], link, false);   // đai ôm nửa vòng trên ống
              r.rotation.y = Math.atan2(b[0] - a[0], b[2] - a[2]); }   // cọc gỗ đóng xuống đất 6 cm
          }
          // ---- CHI TIẾT THÊM (thêm chi tiết): đồ thật của một hệ ống mềm đang chạy — vách hồi nhà kính (đầu nạp có khung cửa thăm hố, đầu ra cột giữa),
          //  xà dọc hông chống gió, chân vòm cắm ống cọc; mép hàn túi khí + 2 đầu nối có đai siết; cọc đỡ ống gas giữ dốc về bẫy nước; nắp chai an toàn; mái tôn
          //  che bảng thiết bị (nắng làm giòn ống trong, mưa vào áp kế) + nền sỏi; vòi xả đáy + ống thăm mức + dây pin ở trạm men; xô rác bếp có nắp + que khuấy
          //  cạnh hố nạp; bình chữa cháy bột cạnh cửa; bản lề + chốt cửa. Dùng lại vật liệu (gộp lượt vẽ) trừ nền sỏi ----
          const clampR = (x, y, z, r, ax, par) => { const m = add(new THREE.TorusGeometry(r, 0.005, 4, 12), M.steel, x, y, z, par, false); if (ax === 'x') m.rotation.y = Math.PI / 2; else if (ax === 'y') m.rotation.x = Math.PI / 2; return m; };   // đai siết ống
          const stake = (x, z, h, par) => { box(0.022, h, 0.022, M.post, x, h / 2, z, par, false); box(0.05, 0.01, 0.024, M.dark, x, h - 0.005, z, par, false); };   // cọc gỗ + đệm đỡ ống
          const endGeo = new THREE.CircleGeometry(HR, 18, 0, Math.PI);
          for (const s of [-1, 1]) add(endGeo, M.glass, TXM + s * HL / 2, 0, TZ, gA, false).rotation.y = Math.PI / 2;   // 2 vách hồi polycarbonate (giữ ấm cả đầu ống)
          const XE = TXM + HL / 2;
          for (const dz of [-0.16, 0.16]) box(0.016, 0.42, 0.016, M.steel, XE, 0.21, TZ + dz, gA, false);
          box(0.016, 0.016, 0.34, M.steel, XE, 0.42, TZ, gA, false); box(0.016, HR, 0.016, M.steel, TXM - HL / 2, HR / 2, TZ, gA, false);   // khung cửa đầu nạp · cột giữa đầu ra
          for (const s of [-1, 1]) box(HL, 0.014, 0.014, M.steel, TXM, HR * 0.64, TZ + s * HR * 0.77, gA, false);   // xà dọc hông
          for (let i = 0; i <= 5; i++) for (const s of [-1, 1]) box(0.034, 0.05, 0.034, M.dark, TXM - HL / 2 + i * HL / 5, 0.025, TZ + s * HR, gA, false);   // chân vòm cắm ống cọc
          add(pillow(0.74, 0.016, 0.42), M.rust, 0, 0, 0, bag, false);   // mép hàn quanh túi khí (con của túi ⇒ dẹt theo túi)
          for (const s of [-1, 1]) { cyl(0.019, 0.07, M.gas, bagX + s * 0.75, 0.075, bagZ, gB, false, 10).rotation.z = Math.PI / 2; clampR(bagX + s * 0.775, 0.075, bagZ, 0.022, 'x', gB); }   // 2 đầu nối túi + đai siết
          const gxClamp = clampR(GX, 0.3, TZ, 0.018, 'y', gA); clampR(BX - 0.27, 0.62, FZ, 0.017, 'y', gB);
          stake(-0.68, 0.42, 0.467, gB); stake(-0.12, 0.72, 0.042, gB); stake(0.12, 0.84, 0.053, gB);   // cọc / đệm đỡ ống gas: ống võng thì đọng nước giữa chừng
          const roof = box(0.88, 0.014, 0.34, M.steel, BX, 0.872, BZ + 0.06, gB); roof.rotation.x = -0.18;   // mái tôn che bảng thiết bị, dốc ra sau
          for (const x of [-0.3, -0.1, 0.1, 0.3]) box(0.012, 0.012, 0.34, M.steel, BX + x, 0.884, BZ + 0.06, gB, false).rotation.x = -0.18;   // gân tôn
          box(0.98, 0.012, 0.52, M.gravel, BX, 0.006, BZ + 0.02, gB, false); box(0.68, 0.012, 0.5, M.gravel, 2.5, 0.006, -1.22, gS, false);   // nền sỏi: thoát nước, khỏi bùn chân bảng + trạm men
          cyl(0.012, 0.06, M.brass, DX - 0.2, 0.06, DZ, gS, false, 8).rotation.z = Math.PI / 2; box(0.012, 0.035, 0.008, M.lever, DX - 0.225, 0.085, DZ, gS, false);   // vòi xả đáy thùng men (lấy mẫu, súc rửa)
          hose([[2.7, 0.79, -1.27], [2.68, 0.7, -1.26], [2.68, 0.55, -1.25]], 0.004, M.cable, gS);   // dây pin xuống tủ
          const bkt = new THREE.Group(); bkt.position.set(IX + 0.16, 0, TZ + 0.68); gA.add(bkt);   // xô ~10 L có nắp: rác bếp băm nhỏ trước khi nạp (thêm C, bớt amoniac) + que khuấy
          add(new THREE.CylinderGeometry(0.125, 0.1, 0.25, 14), M.dig, 0, 0.125, 0, bkt); cyl(0.13, 0.02, M.dark, 0, 0.26, 0, bkt, false, 14);
          add(new THREE.TorusGeometry(0.115, 0.005, 4, 12, Math.PI), M.steel, 0, 0.26, 0, bkt, false);   // quai
          box(0.024, 0.62, 0.02, M.wood, 0, 0.249, 0.145, bkt).rotation.x = -0.638; box(0.09, 0.15, 0.012, M.wood, 0, 0.064, 0.282, bkt, false).rotation.x = -0.638;   // que khuấy dựa miệng xô
          const ext = new THREE.Group(); ext.position.set(-0.8, 0, FZ_ + 0.08); fence.add(ext);   // BÌNH CHỮA CHÁY bột ~1 kg treo cột cạnh cửa (cháy khí: khoá van trước, rồi mới xịt)
          cyl(0.045, 0.24, M.lever, 0, 0.32, 0, ext, true, 12); add(new THREE.SphereGeometry(0.045, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.lever, 0, 0.44, 0, ext, false);
          cyl(0.0455, 0.07, M.white, 0, 0.31, 0, ext, false, 12);   // nhãn hướng dẫn
          box(0.026, 0.045, 0.026, M.dark, 0, 0.49, 0, ext, false); box(0.075, 0.008, 0.018, M.dark, 0.022, 0.515, 0, ext, false);   // van + cò bóp
          hose([[0.012, 0.495, 0.01], [0.05, 0.46, 0.035], [0.056, 0.36, 0.048], [0.05, 0.27, 0.046]], 0.006, M.cable, ext);   // vòi phun
          box(0.07, 0.024, 0.03, M.steel, 0, 0.37, -0.05, ext, false);   // đai treo
          for (const y of [0.3, 0.75]) box(0.05, 0.03, 0.04, M.dark, -2.43, y, FZ_, fence, false);   // bản lề cửa
          box(0.06, 0.02, 0.03, M.steel, -1.57, 0.55, FZ_ + 0.02, fence, false);   // chốt cửa
          // ---- dọn chỗ: cỏ cắt sát dưới thiết bị + dọc rãnh ống · vật cản (người, chó, gà, bướm né khu rào) · lưới dẫn đường kỹ sư ----
          const W_ = (x, z) => g.localToWorld(new THREE.Vector3(x, 0, z));
          for (let x = -2.7; x <= 2.71; x += 0.45) for (let z = -1.35; z <= 1.36; z += 0.45) { const w = W_(x, z); meadow.cutAt(w.x, w.z, 0.3 * SC); }
          for (const [a, b, r] of [[pAt(0), pAt(L1), 0.3], [pAt(L1), pAt(L1 + LA / 2), 0.3], [pAt(L1 + LA / 2), pAt(L1 + LA), 0.3], [pAt(L1 + LA), [IX + 0.25, 0, TZ], 0.3], [[g2[0], 0, g2[2]], GK, 0.22], [GK, [BX + 0.36, 0, FZ + 0.1], 0.22]]) { const L = Math.hypot(b[0] - a[0], b[2] - a[2]);   // dải cỏ cắt dọc ống nổi rộng hơn vệt ống gas
            for (let u = 0; u <= L; u += 0.4) { const w = W_(a[0] + (b[0] - a[0]) * u / L, a[2] + (b[2] - a[2]) * u / L); meadow.cutAt(w.x, w.z, r * SC); } }
          for (const x of [-2.1, -0.7, 0.7, 2.1]) for (const z of [-0.75, 0.75]) { const w = W_(x, z); obstacleCoords.push({ x: w.x, y: C.y, z: w.z, r: 0.95 * SC, h: SC }); PROPS.push({ x: w.x, z: w.z, r: 0.9 * SC }); }
          for (let x = -2.7; x <= 2.71; x += 0.6) for (let z = -1.35; z <= 1.36; z += 0.54) { const w = W_(x, z); NAV_MARKS.push({ x: w.x, z: w.z, r: 0.3 * SC, nav: true }); }   // toạ độ qua W_ đã gồm SC; bán kính (thế giới) nhân tay
          for (const o of [ledG, ledO, bub]) o.userData.noBatch = true;   // nháy mỗi khung: vẽ riêng (phần khác chỉ dời / co dãn khi số đổi — vẫn gộp lượt vẽ)
          g.traverse(o => { if (o.isMesh) o.userData.noBake = true; });
          // ---- MÔ PHỎNG (đủ để nhìn đúng, không phải mô hình động học; số thật sau khi thu 0,72). Khí DÙNG ĐƯỢC S (L): vòm ống chỉ nén / giãn chút ít (~7 L từ 0
          //  lên 6 cm nước), phần còn lại vào túi ở áp ván + cát 6 cm (113 L); túi đầy thì áp lên tới van chai 12 cm (+11 L) rồi xả. Khí sinh theo nhiệt độ bể và
          //  lượng nạp; bể nhỏ ⇒ dịch lưu ngắn (~22 ngày) ⇒ ủ chưa hết: hệ số dòng nút 1 − e^(−k·HRT), k ≈ 0,08/ngày, so với bể chuẩn 48 ngày ⇒ ×0,85. Nấu sáng 7:00
          //  10 phút, tối 18:30 dùng phần dư tới 30 phút nhưng chừa 40 L dự trữ ⇒ bình thường không phải xả CH₄. Mỗi 10 phút tính lại 30 ngày theo phút, lấy ngày cuối ----
          const DOME = 7, BAGF = 120, CAP = 131, RES = 40, HRT = 22, KH = (1 - Math.exp(-0.08 * HRT)) / (1 - Math.exp(-0.08 * 48));
          const B = { S: 0, p: 0, bk: 0.5, pk: 6, bkS: -1, pkS: -1, fS: -1, Ts: 26, prof: null, profAt: -1e9, dose: 0, doseAt: null, lastHr: null, digBase: null, swapT: 0, swapFrom: 0 };
          function profile() {
            const air = liveWeather.state.temperature ?? 22, Ts = Math.max(4, Math.min(38, air + 4)), f = Math.max(0.12, Math.min(1.25, 0.25 + 0.05 * (Ts - 10)));   // nhà kính + rãnh: bể ấm hơn khí trời ~4 °C (nền hạ 1 bậc cách xe 8,3 m: bóng xe chỉ che ~5 % nắng)
            const prod = 95 * KH * f, per = prod / 1440, out = new Float32Array(1440); let s = 55, cook = 0;   // bể chuẩn 95 L/ngày ở 25 °C: 2 người (40–60 L) + ~0,5 kg rác bếp ⇒ bể nhỏ ~80
            for (let d = 0; d < 30; d++) for (let m = 0; m < 1440; m++) {
              s = Math.min(CAP, s + per);
              const want = m >= 420 && m < 430 ? 20 : m >= 1110 && m < 1140 ? RES : -1;   // bếp 3 L/phút cần ≥ 20 L (đủ áp) · bữa tối chừa RES
              if (want >= 0 && s - 3 >= want) { s -= 3; if (d === 29) cook++; }
              if (d === 29) out[m] = s;
            }
            return { Ts, prod, out, cook };
          }
          const press = S => S < DOME ? 6 * S / DOME : S < BAGF ? 6 : 6 + 6 * Math.min(1, (S - BAGF) / (CAP - BAGF));   // cm nước: vòm chưa căng ⇒ áp tụt · túi giữa chừng ⇒ áp ván + cát · túi đầy ⇒ lên tới van 12 cm
          const days = () => Date.now() / 864e5;
          function digL() { if (B.digBase === null) B.digBase = days() - (days() + 1.2) % 2.65; const L = Math.min(45, (days() - B.digBase) * 17); return B.swapT > 0 ? B.swapFrom * B.swapT / 1.6 : L; }   // ~17 L/ngày ra (theo lượng nạp, không theo cỡ bể) ⇒ túi 45 L thay ~3 lần/tuần
          function update(dt, t) {
            const now = clock.elapsedTime, hr = liveWeather.localHour;
            if (!B.prof || now - B.profAt > 600) { B.prof = profile(); B.profAt = now; B.Ts = B.prof.Ts; }
            const S = B.prof.out[Math.min(1439, Math.max(0, Math.floor(hr * 60)))], p = press(S), bf = Math.max(0, Math.min(1, (S - DOME) / (BAGF - DOME))), k = Math.min(1, dt * 0.8);
            B.S = S; B.p = p; B.bk = Math.abs(bf - B.bk) < 0.003 ? bf : B.bk + (bf - B.bk) * k; B.pk = Math.abs(p - B.pk) < 0.03 ? p : B.pk + (p - B.pk) * k;   // tới đích thì dừng: ma trận không đổi ⇒ lô vẽ gộp khỏi tải lại
            if (B.bk !== B.bkS || B.pk !== B.pkS) {   // túi khí + ván cát, vòm ống, cửa thoát, áp kế: chỉ đặt lại khi số đổi
              B.bkS = B.bk; B.pkS = B.pk; bag.scale.y = 0.12 + 0.88 * B.bk; bag.position.y = BAG_RY * bag.scale.y; wgt.position.y = 2 * BAG_RY * bag.scale.y;
              const sy = 0.47 + 0.013 * B.pk, top = YL + TR_ * sy; tube.scale.y = sy; flange.position.y = top + 0.006; riser.position.y = (top + 0.32) / 2; riser.scale.y = 0.32 - top;
              for (let i = 0; i < 2; i++) { const h = Math.max(0.01, 0.18 + (i ? 1 : -1) * B.pk / 200); man[i].scale.y = h; man[i].position.y = 0.32 + h / 2; }   // nhánh gas tụt, nhánh hở dâng: chênh = áp
            }
            const vent = B.pk > 11.5; bub.visible = vent;
            if (vent) { for (let i = 0; i < 4; i++) { const u = (now * 1.6 + i / 4) % 1; bub.setMatrixAt(i, _bm.makeTranslation(RX + 0.012 * Math.sin(i * 2.3 + now * 5), 0.25 + 0.15 * u, RZ + 0.012 * Math.cos(i * 1.7 + now * 4))); } bub.instanceMatrix.needsUpdate = true; }
            if (B.lastHr !== null && B.lastHr < 9 && hr >= 9) { B.dose = doseL() * 750; B.doseAt = 9; }   // 09:00 mỗi sáng: bơm 1 L men (bể < 15 °C: 4 L) · 80 mL/phút ⇒ 750 s mỗi lít
            B.lastHr = hr; B.dose = Math.max(0, B.dose - dt);
            const on = B.dose > 0 ? now * 4 % 1 < 0.5 : now % 2.4 < 0.14, cold = B.Ts < 15; ledG.visible = on && !cold; ledO.visible = on && cold;   // đèn xanh nháy · cam = bể lạnh
            if (B.swapT > 0 && (B.swapT -= dt) <= 0) { B.swapT = 0; B.digBase = days(); }
            const f = Math.round(digL() / 0.6) * 0.6 / 45;   // túi bã: bậc 0,6 L (~50 phút) ⇒ ít khi đặt lại
            if (f !== B.fS) { B.fS = f; digBag.scale.y = 0.15 + 0.85 * f; digBag.position.y = KY + 0.04 + DIG_RY * digBag.scale.y; digTop.position.y = KY + 0.04 + 2 * DIG_RY * digBag.scale.y; }
          }
          const hhmm = h => String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.floor(h % 1 * 60)).padStart(2, '0');
          const doseL = () => B.Ts < 15 ? 4 : 1, doseTxt = () => B.doseAt !== null ? hhmm(B.doseAt) : liveWeather.localHour >= 9 ? '09:00 hôm nay' : '09:00 hôm qua';
          function msg() {
            if (!B.prof) return '';
            return 'Bể ủ ~' + Math.round(B.Ts) + ' °C · sinh ~' + Math.round(B.prof.prod) + ' L khí/ngày (đủ nấu ~' + B.prof.cook + ' phút) · đang trữ ' + Math.round(B.S / 10) * 10 + ' L (túi ' + Math.round(B.bk * 100) + '%) · áp '
              + B.p.toFixed(1).replace('.', ',') + ' cm nước' + (B.p > 11.5 ? ' — đầy: chai an toàn đang xả qua hộp than' : '') + ' · túi bã ' + Math.round(digL()) + '/45 L · men vi sinh: liều cuối '
              + doseTxt() + (B.Ts < 15 ? ' · bể lạnh: sinh khí chậm, cần ủ ấm thêm' : '');
          }
          const choices = [
            { lab: 'Bơm men vi sinh ngay', plan: () => 'Bơm nhu động đẩy ' + doseL() + ' L dịch men (bã hoạt tính hồi lưu) từ thùng 20 L vào hố nạp, ~' + Math.round(doseL() * 12.5) + ' phút', why: () => B.dose > 0 ? 'Bơm đang chạy (còn ' + Math.ceil(B.dose / 60) + ' phút)' : '',
              run: () => { B.dose = doseL() * 750; B.doseAt = liveWeather.localHour; } },
            { lab: 'Thay túi bã (khối C)', plan: () => 'Khoá van, tháo khớp camlock, đẩy túi ' + Math.round(digL()) + ' L đi xử lý tiếp, lắp túi 45 L mới',
              why: () => B.swapT > 0 ? 'Đang thay túi' : digL() < 6 ? 'Túi bã mới có ' + Math.round(digL()) + ' L' : '', run: () => { B.swapFrom = digL(); B.swapT = 1.6; } },
          ];
          // ---- nhãn "♻ Biogas · … L khí" + đường dẫn khi zoom gần (như nhãn radio) ----
          let tag = null, tagK = 1; const _tp = new THREE.Vector3();
          function tagTick() {
            const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), show = shownInScene(g) && upp < 0.06 && !HG.on;   // hologram mở ⇒ thôi nhãn tên (bảng đã ghi)
            partsTick(upp); holoTick(upp);
            if (!tag && show) tag = addLabel('♻ Biogas', '#5a8f3a', new THREE.Vector3(), new THREE.Vector3(), true, undefined, true);
            if (!tag) return; tag.sprite.visible = tag.line.visible = show; if (!show) return;
            const txt = '♻ Biogas · ' + Math.round(B.S / 10) * 10 + ' L khí'; if (txt !== tag.text) tag.update(txt); tagK = tag.sprite.scale.x / tag.sprite.scale.y;
            g.localToWorld(_tp.set(TXM, HR + 0.02, TZ)); const h = 30 * upp, lead = 56 * upp;
            tag.sprite.scale.set(h * tagK, h, 1); tag.sprite.position.set(_tp.x, _tp.y + lead + h / 2, _tp.z);
            const pa = tag.line.geometry.attributes.position; pa.setXYZ(0, _tp.x, _tp.y + lead, _tp.z); pa.setXYZ(1, _tp.x, _tp.y + 4 * upp, _tp.z); pa.needsUpdate = true; tag.line.geometry.computeBoundingSphere();
          }
          // ---- NHÃN SỐ TỪNG BỘ PHẬN: số theo đường đi chất thải → khí → bã → men → an
          //  toàn; thẻ nhỏ (cao 21 px, chữ ~11 px, vòng số màu theo khối) xếp 2 cột hai bên hệ trên màn hình. mỗi cột là 1 đoạn số liền, tăng dần từ trên xuống, bước đều 27 px, 2 cột cùng tâm dọc (tâm các điểm neo); chia ở đâu (4…6 thẻ
          //  cột trái, lệch khỏi 5 / 5 thì bị trừ điểm) và số nhỏ bên nào thì thử cả 6 cách, lấy cách ít chỗ dây cắt nhau nhất rồi dây ngắn nhất (giữ cách cũ trừ khi
          //  cách mới rõ hơn ⇒ xoay camera thẻ không nhảy cột); thẻ không lấn cột phải (bảng việc + bảng danh sách). Thứ tự số ≠ thứ tự chỗ trên màn hình ⇒ đo
          //  9 hướng nhìn: dây cắt nhau 3…7 chỗ (xếp theo độ cao như cũ: 0) ⇒ điểm neo là VÒNG SỐ màu khối ngay trên bộ phận (Ø 15 px) thay chấm trắng, dây nâu mờ
          //  55 % ⇒ không cần lần theo dây. Bấm thẻ / vòng số = bấm dòng cùng số trong bảng ⇒ hologram (bấm lại ⇒ tắt); rê chuột: thẻ nền sẫm + dòng bảng sáng +
          //  dây trắng rõ + vòng số to 1,3 · đang xem hologram: thẻ viền màu khối. Nhãn số CHỈ hiện khi bảng danh sách mở
          //  (bấm vào hệ; 1 px < 0,045 đv) và tâm hệ trong khung — bình thường cả hệ chỉ còn nhãn "♻ Biogas"; nằm trong labelGroup ⇒ nút "Nhãn" tắt cùng. 10 thẻ + 10 vòng số + nét = 21 lượt vẽ, chỉ lúc hiện. Điểm neo = Object3D rỗng gắn vào mảnh (túi khí, túi bã: nổi
          //  theo mặt túi) ----
          const pinO = (par, x, y, z) => { const o = new THREE.Object3D(); o.position.set(x, y, z); par.add(o); return o; };
          const PCOL = { A: '#3f7a2e', B: '#c27a12', C: '#6e5a2c', S: '#2c65b0' };   // khối A · khí (B) · bã (C) · men
          const PARTS = [   // chỉ giữ nhãn của hệ, bỏ chi tiết phụ: 10 bộ phận chính theo dòng chảy (bỏ ống bồn cầu, cửa khí, van chai nước,
            //  bẫy nước, áp kế, van 1 chiều, pin mặt trời, rào — vẫn có trong bảng bấm + docs)
            ['Hố nạp', 'A', pinO(gA, IX, IH + 0.08, TZ)],
            ['Túi ủ PE', 'A', pinO(gA, TXM + 0.9, 0.12, TZ)],
            ['Nhà kính ủ ấm', 'A', pinO(gA, TXM - 1.1, HR * 0.87, TZ + HR * 0.5)],
            ['Túi chứa khí', 'B', pinO(wgt, 0.38, 0.01, 0.12)],
            ['Lọc H₂S', 'B', pinO(gB, BX - 0.08, 0.735, FZ)],
            ['Ống gas về bếp xe', 'B', pinO(gB, BX + 0.33, 0.01, FZ + 0.09)],   // chỗ ống vàng chui xuống rãnh chôn
            ['Hộp than khử mùi', 'B', pinO(gB, RX, 1.27, VZ + 0.065)],
            ['Hố ra + bơm tay', 'C', pinO(gC, OX + 0.1, 0.22, TZ + 0.12)],
            ['Túi bã kín', 'C', pinO(digTop, 0.1, 0.01, 0.12)],
            ['Thùng men vi sinh', 'S', pinO(gS, DX, 0.45, DZ)],
          ];
          const PH = 21, PD = PH + 6, PSIDE = 26, PMK = 15;   // px CSS: cao thẻ · bước dọc (khe 6 px, dễ bấm) · cách điểm neo ngoài cùng · đường kính vòng số trên bộ phận
          let PT = null, PL = null, PSP = ''; const _pv = new THREE.Vector3(), _pc = new THREE.Color();
          const mixHex = (a, b, k) => '#' + [1, 3, 5].map(i => Math.round(parseInt(a.slice(i, i + 2), 16) * (1 - k) + parseInt(b.slice(i, i + 2), 16) * k).toString(16).padStart(2, '0')).join('');
          // thẻ số, vòng số, bảng danh sách: ô HTML của LỚP CHỮ HTML (core/html-text.js), biogas tự tính chỗ trên màn hình
          function partCard(i, txt, col) {   // thẻ be như nhãn cảnh, vòng số màu khối, chữ đen · 3 dáng (vẽ lại lúc đổi): 0 thường · 1 rê chuột (nền sẫm) · 2 đang xem hologram (viền dày + nền ngả màu khối)
            const o = htBox(1000), mo = htBox(1001), H = 56, f = '600 30px Inter, system-ui, Arial', PAP = '#e0ddd5';   // nền = màu thẻ cũ đo trên màn (WebGL không gắn sRGB) ⇒ nhìn như nhãn cảnh
            o.x.font = f; const w = Math.ceil(o.x.measureText(txt).width) + 76;
            const draw = st => {   // vẽ theo đơn vị cũ (cao 56), nhân theo cỡ canvas thật
              htSize(o, PH * w / H, PH); const x = o.x; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, o.c.width, o.c.height); x.setTransform(o.c.width / w, 0, 0, o.c.height / H, 0, 0);
              rr(x, 2.5, 2.5, w - 5, H - 5, 25.5); x.fillStyle = st === 2 ? mixHex(PAP, col, 0.3) : st === 1 ? '#cbc5b8' : PAP; x.fill();
              x.lineWidth = st === 2 ? 5 : st === 1 ? 3.5 : 2.5; x.strokeStyle = st === 2 ? col : '#4b4a46'; x.stroke();
              x.beginPath(); x.arc(28, H / 2, 20, 0, 7); x.fillStyle = col; x.fill();
              x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '700 ' + (i < 9 ? 27 : 23) + 'px Inter, system-ui, Arial'; x.fillText(String(i + 1), 28, H / 2 + 1);
              x.fillStyle = '#000000'; x.textAlign = 'left'; x.font = f; x.fillText(txt, 58, H / 2 + 2);
            };
            const drawM = s => {   // VÒNG SỐ ngay trên bộ phận (thay chấm neo trắng): số trùng thẻ ⇒ dây có cắt nhau vẫn đọc ra bộ phận nào · s: đường kính px CSS
              htSize(mo, s, s); const x = mo.x, k = mo.c.width / 40; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, mo.c.width, mo.c.height); x.setTransform(k, 0, 0, k, 0, 0);
              x.beginPath(); x.arc(20, 20, 16.5, 0, 7); x.fillStyle = col; x.fill(); x.lineWidth = 3.5; x.strokeStyle = '#ffffff'; x.stroke();
              x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '800 ' + (i < 9 ? 21 : 17) + 'px Inter, system-ui, Arial'; x.fillText(String(i + 1), 20, 21.5);
            };
            draw(0);
            return { o, mo, k: w / H, st: 0, ms: 0, draw, drawM, in: false, wp: new THREE.Vector3(), n: new THREE.Vector3(), sx: 0, sy: 0, r: null, m: null, ll: 0, lw: 0, ly: 0, ex: 0, ey: 0 };
          }
          const ccw = (ax, ay, bx, by, px, py) => (bx - ax) * (py - ay) - (by - ay) * (px - ax);
          const segX = (s, t) => ccw(s[0], s[1], s[2], s[3], t[0], t[1]) * ccw(s[0], s[1], s[2], s[3], t[2], t[3]) < 0 && ccw(t[0], t[1], t[2], t[3], s[0], s[1]) * ccw(t[0], t[1], t[2], t[3], s[2], s[3]) < 0;   // 2 dây cắt nhau
          function pLay(A, B, ym, x0, x1, Hd, xMax, put) {   // cột trái A, cột phải B (thứ tự số, bước đều PD, cùng tâm dọc ym) ⇒ giá = số chỗ dây cắt nhau × 1000 + tổng dài dây (px); put: ghi chỗ vào thẻ
            const sg = [];
            for (const [col, s] of [[A, -1], [B, 1]]) {
              const n = col.length; if (!n) continue;
              const top = Math.max(PH / 2 + 6, Math.min(Hd - PH / 2 - 6 - (n - 1) * PD, ym - (n - 1) * PD / 2));   // cả cột lọt khung
              col.forEach((T, j) => {
                const y = top + j * PD, w = PH * T.k, l = Math.max(6, Math.min(xMax - w, s < 0 ? x0 - PSIDE - w : x1 + PSIDE));   // cột trái canh phải, cột phải canh trái; không lấn cột phải màn hình
                const ex = Math.max(l, Math.min(l + w, T.sx)), ey = T.sx > l && T.sx < l + w ? y + Math.sign(T.sy - y) * PH / 2 : y;   // đầu dây = điểm mép thẻ gần điểm neo nhất
                sg.push([ex, ey, T.sx, T.sy]); if (put) { T.ll = l; T.lw = w; T.ly = y; T.ex = ex; T.ey = ey; }
              });
            }
            let c = 0; for (let i = 0; i < sg.length; i++) { c += Math.hypot(sg[i][2] - sg[i][0], sg[i][3] - sg[i][1]); for (let j = i + 1; j < sg.length; j++) if (segX(sg[i], sg[j])) c += 1000; }
            return c;
          }
          function partsTick(upp) {
            let on = HG.on && upp < 0.045 && labelGroup.visible && shownInScene(g);   // chỉ khi đã bấm vào hệ (bảng mở): đối chiếu số với danh sách
            if (on) { g.localToWorld(_pv.set(0, 0.3, 0)).project(camera); on = Math.abs(_pv.x) < 1 && Math.abs(_pv.y) < 1 && _pv.z > -1 && _pv.z < 1; }   // tâm hệ trong khung
            if (!PT) { if (!on) return;
              PT = PARTS.map(([txt, k], i) => partCard(i, txt, PCOL[k]));
              const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(PT.length * 6), 3)); lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(PT.length * 8), 4));   // màu + độ đục từng dây
              PL = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthTest: false })); PL.renderOrder = 19; PL.frustumCulled = false; PL.userData.noBatch = true; PL.userData.ck = ''; PL.name = 'Biogas: đường dẫn nhãn số'; labelGroup.add(PL); }
            PL.visible = on; if (!on) { for (const T of PT) { htShow(T.o, false); htShow(T.mo, false); T.r = T.m = null; } return; }
            const Wd = Math.max(1, W()), Hd = Math.max(1, Hv()), xMax = holoLay(Wd, Hd).R.x - 8; let x0 = 1e9, x1 = -1e9;
            PT.forEach((T, i) => { PARTS[i][2].getWorldPosition(T.wp); T.n.copy(T.wp).project(camera); T.sx = (T.n.x + 1) / 2 * Wd; T.sy = (1 - T.n.y) / 2 * Hd; T.r = T.m = null;
              T.in = Math.abs(T.n.x) < 1 && Math.abs(T.n.y) < 1 && Math.abs(T.n.z) < 1; if (!T.in) { htShow(T.o, false); htShow(T.mo, false); } if (T.in) { x0 = Math.min(x0, T.sx); x1 = Math.max(x1, T.sx); } });   // zoom sát: bộ phận ra ngoài khung thì thôi nhãn
            const pa = PL.geometry.attributes.position, pc = PL.geometry.attributes.color;
            PT.forEach((T, i) => { if (!T.in) { pa.setXYZ(2 * i, T.wp.x, T.wp.y, T.wp.z); pa.setXYZ(2 * i + 1, T.wp.x, T.wp.y, T.wp.z); } });   // dây của nhãn đã thôi: co về 1 điểm
            const V = PT.filter(T => T.in), n = V.length;   // thẻ đang hiện, theo số
            if (n) {
              const ym = V.reduce((m, T) => m + T.sy, 0) / n, kLo = n < 3 ? 0 : Math.max(1, Math.round(n / 2) - 1), kHi = n < 3 ? n : Math.min(n - 1, Math.round(n / 2) + 1);
              let best = null, cur = null;
              for (let k = kLo; k <= kHi; k++) for (const o of [0, 1]) {   // k thẻ số nhỏ · o 0: số nhỏ cột trái · 1: cột phải; lệch khỏi chia đôi ⇒ cộng 200 px / thẻ
                const lo = V.slice(0, k), hi = V.slice(k), C = { c: pLay(o ? hi : lo, o ? lo : hi, ym, x0, x1, Hd, xMax) + Math.abs(k - n / 2) * 200, k, o, key: n + ':' + k + ':' + o };
                if (!best || C.c < best.c) best = C; if (C.key === PSP) cur = C; }
              const U = cur && cur.c <= best.c + 250 ? cur : best; PSP = U.key;   // giữ cách chia cũ trừ khi cách mới bớt được chỗ cắt hoặc dây ngắn hơn > 250 px ⇒ xoay camera thẻ không nhảy cột liên tục
              const lo = V.slice(0, U.k), hi = V.slice(U.k); pLay(U.o ? hi : lo, U.o ? lo : hi, ym, x0, x1, Hd, xMax, true);
              for (const T of V) {
                if (T.o.d !== htDpr()) T.draw(T.st); htAt(T.o, T.ll, T.ly - PH / 2); htShow(T.o, true); T.r = [T.ll, T.ly - PH / 2, T.lw, PH];   // T.r, T.m: ô bấm thẻ, vòng số (holoHit)
                const i = PT.indexOf(T), mk = (i === HG.sel || i === HG.hov ? 1.3 : 1) * PMK; if (T.ms !== mk || T.mo.d !== htDpr()) { T.ms = mk; T.drawM(mk); } htAt(T.mo, T.sx - mk / 2, T.sy - mk / 2); htShow(T.mo, true); T.m = [T.sx - mk / 2, T.sy - mk / 2, mk, mk];   // vòng số: to 1,3 lần khi rê / đang xem
                _pv.set(T.ex / Wd * 2 - 1, 1 - T.ey / Hd * 2, T.n.z).unproject(camera); pa.setXYZ(2 * i, _pv.x, _pv.y, _pv.z); pa.setXYZ(2 * i + 1, T.wp.x, T.wp.y, T.wp.z);
              }
            }
            pa.needsUpdate = true;
            const ck = HG.sel + ',' + HG.hov;   // dáng thẻ + màu dây: đổi khi dòng chọn / dòng rê đổi
            if (ck !== PL.userData.ck) { PL.userData.ck = ck;
              PT.forEach((T, i) => { const st = i === HG.sel ? 2 : i === HG.hov ? 1 : 0; if (st !== T.st) { T.st = st; T.draw(st); }
                _pc.set(st ? '#ffffff' : '#3a3530'); const a = st ? 1 : 0.55; pc.setXYZW(2 * i, _pc.r, _pc.g, _pc.b, a); pc.setXYZW(2 * i + 1, _pc.r, _pc.g, _pc.b, a); });   // dây thường nâu sẫm mờ 55 % (cắt nhau đỡ rối) · thẻ đang rê / đang xem: trắng rõ
              pc.needsUpdate = true; }
          }
          // ---- BẢNG DANH SÁCH + HOLOGRAM 3D TỪNG BỘ PHẬN. Bấm hệ ⇒ bảng góc phải dưới (BỐ CỤC dưới đây), cùng màu nhãn
          //  (thẻ be #e2d6c0 viền #4b4a46, chữ đen, vòng số trắng trên màu khối PCOL; đã bỏ đầu chiếu, cột sáng, tia quét, vạch quét, chớp nhiễu của bảng), bung
          //  ra rồi in dần từ trên xuống: chấm xanh + tên hệ (bỏ chữ "LIVE", góc phải chỉ còn chấm xanh) · 4 số sống (bể, khí trữ, áp, sinh / ngày) · 10 bộ phận đánh số khớp nhãn số (số đo / trạng thái sống bên phải) ·
          //  phụ kiện an toàn + đo · dòng gợi ý. Bấm 1 dòng ⇒ HOLOGRAM 3D bộ phận đó cạnh bảng: chép hình các mảnh thật (2 hố thêm thành hố + ống ngập dưới mặt dịch
          //  — ngoài cảnh chôn dưới đất nên không vẽ), mặt trong suốt màu khối của nhãn (bản sáng HCOL) sáng dần về phía viền theo góc nhìn + nét cạnh, dựng dần từ dưới lên,
          //  xoay chậm (kéo để xoay tay), đứng sát cạnh trái bảng; bấm lại dòng đó (hoặc nhãn số đó) ⇒ tắt, dòng khác ⇒ đổi. hologram tự co giãn chiếm 88 % dải cạnh bảng, cỡ
          //  trên màn hình cố định (zoom camera không đổi cỡ); mở bảng, chọn / bỏ chọn dòng ⇒ camera ĐỨNG YÊN (bỏ lướt camera cho vừa hệ, zoom theo hologram và soi gần
          //  bộ phận nhỏ của bản 07/11); bộ phận 7 có nước trong chai an toàn + bọt khí sủi lên (hpWater). Bảng 330 × 406 px CSS × 0,78…1 theo chiều cao khung, vẽ bằng canvas HTML
          //  đúng điểm ảnh màn hình (LỚP CHỮ HTML), không theo nút "Nhãn". BỐ CỤC: bảng neo GÓC PHẢI DƯỚI đúng chỗ khung #engPanel (.sim-panel: cách phải 18, đáy 64 px; màn ≤ 700 px: 12 · 88), mở ⇒ đóng
          //  thẻ Tools / Engineer (job.dock — giao diện lo: cùng chỗ thì đóng nhau như 2 thẻ đó) + thôi bám kỹ sư; anh mở lại 1 thẻ đó ⇒ bảng biogas đóng. Bảng việc HTML (bơm men, thay túi
          //  bã) lên NGAY TRÊN bảng, canh mép phải (job.popAt) ⇒ cột phải màn hình là của 2 bảng; hologram ở dải sát cạnh trái bảng (cao bằng bảng, chừa thanh nét
          //  viền xe + thanh nút). Bấm / rê / kéo trên bảng + hologram + nhãn số không lọt xuống cảnh (bắt ở pha capture của #scene; vừa vào bảng ⇒ báo pointerleave
          //  cho khung vẽ để tắt viền rê chuột + toạ độ, giấu ghim thả 7 m của core). Đóng bảng (nút ×, chọn việc, bấm chỗ khác) ⇒ thu bảng + hologram. Dựng lần bấm
          //  đầu; hologram mỗi bộ phận dựng lần chọn đầu, gộp 1 lưới mặt + 1 lưới nét ⇒ mở bảng 1 lượt vẽ, xem hologram thêm 2 (bộ phận 7: + nước, viền mặt nước, bọt = 5) ----
          const HG = { on: false, t0: 0, tc: 0, lt: 0, grp: null, pb: null, cv: null, key: '', kAt: -9, rect: null, hrect: null,
            sel: -1, hov: -1, cur: null, curSet: null, inP: false, fake: false, down: null, hp: [], hs: null, ht: 0, hk: -9, hu: null, hmF: null, hmL: null, hmW: null, hmWL: null, hmB: null, yaw: 0, spinAt: -9 };
          const PW = 330, PHH = 406, TM = 80, BM = 64, GAP = 16, HY0 = 105, HRH = 21.5, holoS = () => Math.max(0.78, Math.min(1, (Hv() - 120) / 860));   // bảng: rộng · cao (px CSS, trước khi nhân cỡ) · lề trên (thanh thời tiết) · lề dưới (thanh nút) · khe · đỉnh dòng bộ phận đầu · bước dòng · cỡ theo chiều cao khung
          function holoLay(Wd, Hd) {   // BỐ CỤC lúc bảng mở (px trong khung vẽ): R bảng góc phải dưới (= chỗ #engPanel) · H dải hologram sát trái bảng, cao bằng bảng; màn hẹp (bảng gần hết bề ngang) ⇒ dải trên bảng, hologram đè lên cảnh
            const nw = Wd <= 700, s = Math.min(holoS(), (Wd - 24) / PW), w = PW * s, h = PHH * s, x = Wd - (nw ? 12 : 18) - w, y = Math.max(8, Hd - (nw ? 88 : BM) - h), R = { x, y, w, h, s }, xl = x - GAP;
            if (xl - 8 < 1.1 * h) return { R, H: { x: 8, y: TM, w: Wd - 16, h: Math.max(80, y - GAP - TM) } };
            const hw = Math.min(xl - 8, 2.6 * h); return { R, H: { x: xl - hw, y, w: hw, h: Math.max(80, Math.min(h, Hd - 108 - y)) } };   // cao bằng bảng, chừa thanh nét viền xe (đỉnh ~ đáy khung − 105 px)
          }
          const HCOL = { A: '#6fe08a', B: '#ffb84d', C: '#d9b27a', S: '#72b8ff' };   // màu hologram theo khối: cùng sắc với vòng số PCOL, sáng hơn để hình trong suốt còn rõ trên cỏ
          const INK = '#000000', INK2 = '#4b4a46', INK3 = '#6b665c', PAPER = '#e2d6c0';   // màu nhãn cảnh (core/labels.js addLabel solid): chữ · viền + chữ phụ · chữ nhạt · nền be
          const rgbaOf = (h, a) => 'rgba(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',') + ',' + a + ')';
          const HSPEC = [   // cột phải từng dòng, cùng thứ tự PARTS
            () => '15 L/ngày + men ' + doseL() + ' L',
            () => '0,34 m³ · lưu ~' + HRT + ' ngày',
            () => 'bể ' + Math.round(B.Ts) + ' °C' + (B.Ts < 15 ? ' · lạnh, cần ủ' : ' · ấm hơn trời 4 °C'),
            () => Math.round(B.S / 5) * 5 + ' L · túi ' + Math.round(B.bk * 100) + '%',
            () => 'ô-xít sắt · đen tới vạch đỏ ⇒ thay',
            () => B.p.toFixed(1).replace('.', ',') + ' cm nước · nấu ~' + (B.prof ? B.prof.cook : 0) + ' ph',
            () => B.p > 11.5 ? 'đang xả qua than' : 'nghỉ · xả khi > 12 cm',
            () => '~17 L/ngày ra',
            () => Math.round(digL()) + ' / 45 L',
            () => B.dose > 0 ? 'đang bơm · ' + Math.ceil(B.dose / 60) + ' phút' : 'liều ' + doseTxt(),
          ];
          const wrapTxt = (x, t, X, Y, mw, lh) => { let ln = ''; for (const wd of t.split(' ')) { const s2 = ln ? ln + ' ' + wd : wd; if (ln && x.measureText(s2).width > mw) { x.fillText(ln, X, Y); Y += lh; ln = wd; } else ln = s2; } if (ln) x.fillText(ln, X, Y); return Y; };
          const mTxt = d => d < 1 ? Math.round(d * 100) + ' cm' : d.toFixed(1).replace('.', ',') + ' m';
          function holoDraw() {
            const x = HG.pb.x, w = PW, h = PHH, F = 'px Inter, system-ui, Arial', line = (y, a) => { x.beginPath(); x.moveTo(14, y); x.lineTo(w - 14, y); x.strokeStyle = rgbaOf(INK2, a); x.lineWidth = 1; x.stroke(); };
            x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, HG.cv.width, HG.cv.height); x.setTransform(HG.cv.width / w, 0, 0, HG.cv.height / h, 0, 0);   // đơn vị px bảng gốc 330 × 406, nhân theo canvas thật (cỡ × dpr)
            rr(x, 1.5, 1.5, w - 3, h - 3, 9); x.fillStyle = PAPER; x.fill(); x.lineWidth = 1.6; x.strokeStyle = INK2; x.stroke();   // thẻ be viền nâu sẫm như nhãn cảnh
            x.textBaseline = 'alphabetic'; x.textAlign = 'left';
            x.beginPath(); x.arc(21, 23, 6, 0, 7); x.fillStyle = '#5a8f3a'; x.fill();   // chấm xanh như nhãn "♻ Biogas"
            x.fillStyle = INK; x.font = '700 15' + F; x.fillText('♻ HỆ BIOGAS ỐNG MỀM', 33, 28);
            x.fillStyle = INK2; x.font = '500 10' + F; x.fillText('Flexible Tubular Biodigester · 10 bộ phận chính', 14, 43);
            x.beginPath(); x.arc(w - 19, 22, 4.5, 0, 7); x.fillStyle = PCOL.A; x.fill();   // góc phải chỉ còn chấm xanh
            const st = [['BỂ Ủ', Math.round(B.Ts) + ' °C'], ['KHÍ TRỮ', Math.round(B.S / 5) * 5 + ' L'], ['ÁP', B.p.toFixed(1).replace('.', ',') + ' cm'], ['SINH / NGÀY', Math.round(B.prof ? B.prof.prod : 0) + ' L']], tw = (w - 28 - 18) / 4;
            st.forEach(([k, v], i) => { const x0 = 14 + i * (tw + 6); rr(x, x0, 53, tw, 38, 5); x.fillStyle = rgbaOf(INK2, 0.08); x.fill(); x.lineWidth = 1; x.strokeStyle = rgbaOf(INK2, 0.4); x.stroke();
              x.textAlign = 'left'; x.fillStyle = INK3; x.font = '700 8' + F; x.fillText(k, x0 + 7, 65); x.fillStyle = INK; x.font = '700 14' + F; x.fillText(v, x0 + 7, 84); });
            const y0 = HY0, rh = HRH; line(y0 - 5, 0.4);
            PARTS.forEach(([name, k], i) => { const y = y0 + i * rh + rh / 2, on = i === HG.sel;
              if (on || i === HG.hov) { rr(x, 9, y - rh / 2 + 1, w - 18, rh - 2, 5); x.fillStyle = on ? rgbaOf(PCOL[k], 0.2) : rgbaOf(INK2, 0.1); x.fill(); if (on) { x.lineWidth = 1.2; x.strokeStyle = PCOL[k]; x.stroke(); } }   // dòng đang xem hologram (màu khối) · dòng dưới con trỏ
              else if (i % 2 === 0) { x.fillStyle = rgbaOf(INK2, 0.06); x.fillRect(10, y - rh / 2, w - 20, rh); }
              x.beginPath(); x.arc(24, y, 8, 0, 7); x.fillStyle = PCOL[k]; x.fill();   // vòng số = vòng số trên nhãn (canvas DOM ⇒ dùng thẳng mã màu sRGB)
              x.fillStyle = '#ffffff'; x.textAlign = 'center'; x.font = '800 ' + (i < 9 ? 10 : 9) + F; x.fillText(String(i + 1), 24, y + 3.5);
              x.textAlign = 'left'; x.fillStyle = INK; x.font = '600 11.5' + F; x.fillText(name, 38, y + 4);
              x.textAlign = 'right'; x.fillStyle = INK2; x.font = '500 10.5' + F; x.fillText(HSPEC[i](), w - 14, y + 4); });
            const ya = y0 + 10 * rh + 7; line(ya, 0.4);
            x.textAlign = 'left'; x.fillStyle = INK3; x.font = '700 8' + F; x.fillText('PHỤ KIỆN AN TOÀN · ĐO', 14, ya + 15);
            x.fillStyle = '#2e2d2a'; x.font = '500 10' + F; wrapTxt(x, 'van an toàn 12 cm · bẫy nước ngưng · áp kế chữ U · van 1 chiều + chặn lửa · pin mặt trời 10 W · bình chữa cháy', 14, ya + 30, w - 28, 13.5);
            const yf = h - 24, P = HG.sel >= 0 && HG.hp[HG.sel]; line(yf, 0.3); x.font = '600 10' + F;   // dòng cuối: gợi ý · đang xem
            if (P) { x.fillStyle = PCOL[PARTS[HG.sel][1]]; x.fillText('◆', 14, yf + 15); x.fillStyle = INK; x.fillText(' Hologram · ' + (HG.sel + 1) + ' ' + PARTS[HG.sel][0], 14 + x.measureText('◆').width, yf + 15); x.textAlign = 'right'; x.fillStyle = INK2; x.fillText('cỡ thật ' + mTxt(P.dim), w - 14, yf + 15); }
            else { x.fillStyle = INK3; x.fillText('▶ Bấm một dòng ⇒ hologram 3D bộ phận đó', 14, yf + 15); }
          }
          const HZC = 'gl_Position.z = clamp(gl_Position.z, -0.999 * gl_Position.w, 0.999 * gl_Position.w);';   // hologram co giãn theo zoom (cỡ px cố định) ⇒ zoom xa thì to ra trong cảnh: kẹp độ sâu cho khỏi bị mặt phẳng gần / xa cắt (không kiểm sâu nên vô hại)
          function holoBuild() {
            HG.grp = new THREE.Group(); HG.grp.name = 'Biogas: bảng danh sách + hologram'; HG.grp.visible = false; scene.add(HG.grp); sharpRoots.push(HG.grp);   // lớp nét (core/lens.js)
            HG.pb = htBox(2000); HG.cv = HG.pb.c;   // BẢNG: canvas 2D trong lớp chữ HTML (rõ như bảng Tools), không còn mặt phẳng WebGL
            HG.grp.userData.noBatch = HG.grp.userData.noBake = HG.grp.userData.noCollide = true;
            HG.hu = { uT: { value: 0 }, uA: { value: 0 }, uRev: { value: 1 }, uY: { value: new THREE.Vector2(-1, 1) }, uC: { value: new THREE.Color(HCOL.A) }, uF: { value: 0.06 } };   // hologram bộ phận: mỗi lúc 1 cái ⇒ chung 1 bộ uniform · uC màu khối (holoPick đặt)
            HG.hmF = new THREE.ShaderMaterial({ uniforms: HG.hu, transparent: true, depthTest: false, depthWrite: false, side: THREE.DoubleSide,
              vertexShader: 'varying vec3 vN; varying float vY; void main() { vN = normalize(normalMatrix * normal); vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); ' + HZC + ' }',
              fragmentShader: `uniform float uT, uA, uRev, uF; uniform vec2 uY; uniform vec3 uC; varying vec3 vN; varying float vY;
                void main() {
                  float h = (vY - uY.x) / (uY.y - uY.x); if (h > uRev) discard;                       // dựng dần từ dưới lên
                  float fr = 1.0 - abs(normalize(vN).z);                                             // camera trực giao nhìn theo trục z ⇒ mặt nghiêng (viền) sáng, mặt chính diện trong
                  float sc = 0.8 + 0.2 * sin(gl_FragCoord.y * 1.3 - uT * 6.0);                       // vạch quét ngang trôi lên
                  float ed = uRev < 0.999 ? exp(-pow((uRev - h) * 40.0, 2.0)) : 0.0;                 // vạch sáng ở mép đang dựng
                  vec3 col = mix(uC, mix(uC, vec3(1.0), 0.65), min(1.0, fr * 0.55 + ed));            // màu khối của nhãn, viền ngả trắng
                  gl_FragColor = vec4(col, clamp((uF + 0.5 * fr * fr) * sc + ed * 0.5, 0.0, 1.0) * uA);   // uF: nền đục (vỏ 0,06 · nước 0,2)
                  #include <colorspace_fragment>
                }` });
            HG.hmL = new THREE.ShaderMaterial({ uniforms: HG.hu, transparent: true, depthTest: false, depthWrite: false,
              vertexShader: 'varying float vY; void main() { vY = position.y; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); ' + HZC + ' }',
              fragmentShader: 'uniform float uT, uA, uRev; uniform vec2 uY; uniform vec3 uC; varying float vY; void main() { if ((vY - uY.x) / (uY.y - uY.x) > uRev) discard;\n'
                + 'gl_FragColor = vec4(mix(uC, vec3(1.0), 0.4), 0.8 * uA * (0.92 + 0.08 * sin(uT * 23.0)));\n#include <colorspace_fragment>\n}' });   // nét cạnh: màu khối ngả trắng
            const cap = { capture: true }, at = e => { const r = dom.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
            listen(container, 'pointerdown', e => {   // trên bảng / hologram: giữ cú bấm lại (camera không xoay, bảng việc không đóng)
              if (!HG.on || e.target !== dom) return; const [x, y] = at(e), hh = holoHit(x, y); if (hh < 0) return;
              e.stopPropagation(); e.preventDefault(); if (e.button === 0) HG.down = { hh, x, y, yaw: HG.yaw };
            }, cap);
            listen(container, 'pointermove', e => {
              if (!HG.on || e.target !== dom) return; const [x, y] = at(e);
              if (HG.down) { e.stopPropagation(); if (e.buttons === 0) HG.down = null; else if (HG.down.hh === 11) { HG.yaw = HG.down.yaw + (x - HG.down.x) * 0.012; HG.spinAt = clock.elapsedTime; } holoCursor(); return; }   // kéo trên hologram ⇒ xoay tay
              if (e.buttons !== 0) return;   // đang kéo camera từ ngoài vào: để yên
              const hh = holoHit(x, y), hv = hh < 0 ? -1 : hh < 10 ? hh : hh >= 20 ? hh - 20 : -1;   // dòng bảng hoặc nhãn số cùng số: sáng cả hai
              if (hv !== HG.hov) { HG.hov = hv; HG.key = ''; }
              HG.cur = hh === 11 ? 'grab' : hv >= 0 ? 'pointer' : null; holoCursor();
              if (hh < 0) { HG.inP = false; return; }
              e.stopPropagation();
              if (!HG.inP) { HG.inP = true; HG.fake = true; dom.dispatchEvent(new PointerEvent('pointerleave')); HG.fake = false; pin.visible = false; clearGlow(); }   // vừa vào bảng: khung vẽ coi như chuột đã rời (tắt viền rê chuột, toạ độ, ghim thả 7 m của core đứng sau bảng)
            }, cap);
            listen(container, 'pointerup', e => {
              if (!HG.down || e.target !== dom) return; e.stopPropagation(); const d = HG.down, [x, y] = at(e); HG.down = null; holoCursor();
              const k = d.hh < 10 ? d.hh : d.hh >= 20 ? d.hh - 20 : -1;
              if (k >= 0 && Math.hypot(x - d.x, y - d.y) < 6 && holoHit(x, y) === d.hh) holoPick(k === HG.sel ? -1 : k);   // bấm dòng bảng / nhãn số: xem / tắt hologram
            }, cap);
            listen(dom, 'pointerleave', () => { if (HG.fake) return; HG.inP = false; HG.cur = null; HG.down = null; holoCursor(); if (HG.hov >= 0) { HG.hov = -1; HG.key = ''; } });
          }
          function holoHit(x, y) {   // −1 ngoài · 0…9 dòng bộ phận · 10 chỗ khác trên bảng · 11 trên hologram · 20…29 nhãn số trong cảnh: thẻ hoặc vòng số (ô nới 2 px)
            const R = HG.rect, S = HG.hrect;
            if (R && x >= R.x && x <= R.x + R.w && y >= R.y && y <= R.y + R.h) { const u = (x - R.x) / R.s, i = Math.floor(((y - R.y) / R.s - HY0) / HRH); return u > 9 && u < PW - 9 && i >= 0 && i < 10 ? i : 10; }
            if (PT && HG.rect) for (const key of ['r', 'm']) for (let i = 0; i < PT.length; i++) { const q = PT[i][key]; if (q && x >= q[0] - 2 && x <= q[0] + q[2] + 2 && y >= q[1] - 2 && y <= q[1] + q[3] + 2) return 20 + i; }   // thẻ trước, rồi vòng số trên bộ phận
            return S && x >= S.x && x <= S.x + S.w && y >= S.y && y <= S.y + S.h ? 11 : -1;
          }
          function holoCursor() {   // con trỏ: tay trên dòng bảng, bàn tay mở trên hologram, nắm khi kéo; chỉ trả lại con trỏ do mình đặt
            const c = HG.down && HG.down.hh === 11 ? 'grabbing' : HG.cur;
            if (c) { if (dom.style.cursor !== c) dom.style.cursor = c; HG.curSet = c; } else if (HG.curSet) { if (dom.style.cursor === HG.curSet) dom.style.cursor = ''; HG.curSet = null; }
          }
          function holoQuiet() { HG.rect = HG.hrect = null; HG.cur = null; HG.down = null; holoCursor(); if (HG.hov >= 0) { HG.hov = -1; HG.key = ''; } }   // bảng ẩn / đóng: thôi nhận bấm
          const HPICK = [   // mảnh thật của từng bộ phận, cùng thứ tự PARTS (c: tâm hộp bao trong toạ độ cục bộ hệ chưa thu SC · q: khối A / B / trạm men / C chứa mảnh)
            (m, c, q) => q === gA && c.x > 2.21,   // 1 phễu HDPE + bệ + nắp, cửa lật, tay quay, cửa sổ mức, măng sông ống bồn cầu, xô rác bếp (+ ống nạp, giỏ lọc, cánh khuấy — dựng thêm)
            m => m === tube || m === flange || m === riser || m === gxClamp,   // 2 túi ủ màng PE + bích cửa khí + ống đứng + đai
            (m, c) => m.parent === gA && m !== gxClamp && (m.material === M.glass || m.material === M.steel || m.material === M.dark && c.y < 0.06 && Math.abs(c.z - TZ) > 0.4),   // 3 nhà kính: vòm, xà, vách hồi, khung cửa, chân cọc
            (m, c, q) => q === gB && c.x > 0.15 && c.x < 1.85 && c.z > 0.35 && c.z < 1.45,   // 4 túi khí + mép hàn, ván + bao cát, tấm lót, 2 đầu nối + đai
            m => inG(m, gF),   // 5 lọc khí 3 cấp: ray, 3 đầu đúc + cốc, vật liệu lọc, van xả, ống nối
            (m, c, q) => q === gB && c.x > 2.45 && c.x < 2.8 && c.y < 0.5 && Math.abs(c.z - FZ) < 0.15 && ![M.water, M.clear, M.white, M.post].includes(m.material),   // 6 van 1 chiều, chặn lửa, ống xuống rãnh + van khoá
            m => inG(m, gV),   // 7 cột nước an toàn + nắp + thang khắc + van xả, ống thoát, lõi than + chóp, cột thép
            (m, c, q) => (q === gA || q === gC) && c.x < -2.15 && c.z < -0.1,   // 8 nắp hố ra + bơm tay màng (+ thành hố, ống ra — dựng thêm)
            (m, c, q) => q === gC && c.z > 0.3,   // 9 túi bã + nhãn + khay + xe đẩy + khớp camlock
            (m, c, q) => q === gS && c.z < -0.95,   // 10 thùng men + áo + nắp + dải mức, tủ điều khiển + màn hình + đầu bơm nhu động, ắc quy, pin mặt trời, vòi xả, nền sỏi
          ];
          const inG = (m, G) => { for (; m; m = m.parent) if (m === G) return true; return false; };
          // hologram bộ phận k tô thêm màu theo vật liệu thật (cùng dựng dần / mờ dần với vỏ): nước ngưng xanh,
          //  hạt ô-xít sắt cam, đoạn đã đen + cốc than xám than, ống khí vàng (đường khí đi), đồng thau (van xả, cổng thử), đỏ (vạch thay lõi, tay van, nắp cổng thử) — [vật liệu, màu, độ đục]
          const HPC = { 4: [[M.water, '#5cc8ff', 0.32], [M.rust, '#ff9440', 0.5], [M.dark, '#3a414b', 0.55], [M.gas, '#ffd23a', 0.32], [M.brass, '#ffc24a', 0.5], [M.lever, '#ff4a3a', 0.65]] };
          const HEDGE = [30, 12, 30, 22, 30, 30, 30, 30, 30, 30];   // ngưỡng góc nét cạnh (°): túi ủ trơn ⇒ hạ thấp để còn vân dọc ống
          const _hm = new THREE.Matrix4(), _hi = new THREE.Matrix4(), _hbb = new THREE.Box3(), _hc = new THREE.Vector3(), _hup = new THREE.Vector3(0, 1, 0);
          const hpQ = o => { o.frustumCulled = false; o.raycast = () => {}; Object.assign(o.userData, { noBatch: true, noBake: true, noCollide: true, pickSkip: true }); return o; };   // vật hologram: không cắt khung, không bấm trúng, không gộp / nướng / va chạm
          function hpMerge(list, ang, c) {   // gộp [hình, ma trận] (toạ độ cục bộ hệ, chưa thu SC) ⇒ 1 lưới mặt + 1 lưới nét, dời c về gốc (không có c ⇒ tâm hộp bao)
            let nv = 0, ne = 0; const FG = [], EG = [];
            for (const [G, M4] of list) { const f = (G.index ? G.toNonIndexed() : G.clone()).applyMatrix4(M4), e = new THREE.EdgesGeometry(G, ang).applyMatrix4(M4);
              FG.push(f); EG.push(e); nv += f.attributes.position.count; ne += e.attributes.position.count; }
            const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), lp = new Float32Array(ne * 3); let o = 0;
            for (const f of FG) { pos.set(f.attributes.position.array, o); if (f.attributes.normal) nor.set(f.attributes.normal.array, o); o += f.attributes.position.count * 3; f.dispose(); }
            o = 0; for (const e of EG) { lp.set(e.attributes.position.array, o); o += e.attributes.position.count * 3; e.dispose(); }
            const fg = new THREE.BufferGeometry(), lg = new THREE.BufferGeometry(); fg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); fg.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
            fg.computeBoundingBox(); if (!c) c = fg.boundingBox.getCenter(new THREE.Vector3()); fg.translate(-c.x, -c.y, -c.z); lg.translate(-c.x, -c.y, -c.z);
            return [fg, lg, c];
          }
          const hpAdd = (par, fg, lg) => { const fm = hpQ(new THREE.Mesh(fg, HG.hmF)), lm = hpQ(new THREE.LineSegments(lg, HG.hmL)); fm.renderOrder = 21; lm.renderOrder = 22; par.add(fm, lm); };
          function hpBuild(k) {   // gộp hình các mảnh của bộ phận k thành hologram: grp hộp chứa (gốc thế giới) ⊃ hm hologram chính (đặt, xoay, co giãn mỗi khung — holoTick), tâm hộp bao về gốc
            g.updateMatrixWorld(true); _hi.copy(g.matrixWorld).invert(); const src = []; let wat = null, dip = null;   // bộ phận 7: hộp bao nước chai an toàn (vẽ riêng màu nước — hpWater) · ống nhúng
            sys.traverse(m => {
              if (!m.isMesh || m.isInstancedMesh || m.userData.hovFx) return;
              let q = m; while (q.parent && q.parent !== sys) q = q.parent;
              const G = m.geometry; if (!G.boundingBox) G.computeBoundingBox(); _hm.multiplyMatrices(_hi, m.matrixWorld); _hbb.copy(G.boundingBox).applyMatrix4(_hm).getCenter(_hc);
              if (!HPICK[k](m, _hc, q)) return;
              if (k === HTHAN && m.material === M.water) { wat = _hbb.clone(); return; }
              if (k === HTHAN && m.material === M.gas) dip = _hbb.clone();
              src.push([G, _hm.clone(), _hbb.clone(), m.material]); });   // [hình, ma trận, hộp bao] (hộp: chọn mảnh cho kính lúp chai)
            const pipeG = (a, b, r) => { const d = b.clone().sub(a); return [new THREE.CylinderGeometry(r, r, d.length(), 10, 1, true), new THREE.Matrix4().compose(a.clone().add(b).multiplyScalar(0.5), new THREE.Quaternion().setFromUnitVectors(_hup, d.normalize()), new THREE.Vector3(1, 1, 1))]; };
            if (k === 0) {   // trong phễu: ống nạp 4" từ đáy phễu chéo xuống, miệng dưới ngập dưới mặt dịch trong túi ủ (khoá nước) · ống bồn cầu xuyên vách +x ·
              //  giỏ lọc rác dưới cửa lật (nhấc ra rửa) · trục + cánh khuấy dưới tay quay (đánh tan rác bếp với nước xả trước khi trôi xuống)
              src.push(pipeG(new THREE.Vector3(TX1 - 0.12, YL - 0.1, TZ), new THREE.Vector3(IX - 0.06, 0.06, TZ), 0.045), pipeG(new THREE.Vector3(IX + IW, YIN, TZ), new THREE.Vector3(IX + IW - 0.09, YIN - 0.005, TZ), 0.04),
                [new THREE.CylinderGeometry(0.1, 0.07, 0.2, 12, 1, true), new THREE.Matrix4().makeTranslation(IX, IH - 0.1, TZ + 0.13)], pipeG(new THREE.Vector3(IX, IH + 0.06, TZ - 0.15), new THREE.Vector3(IX, 0.1, TZ - 0.15), 0.01),
                [new THREE.BoxGeometry(0.22, 0.07, 0.012), new THREE.Matrix4().makeTranslation(IX, 0.15, TZ - 0.15)]);
            }
            if (k === 7) {   // hố ra: hố xây (0,32 × 0,36 m thật) dưới nắp, bơm tay hút từ đáy + ống ra từ đầu túi ủ dốc LÊN tới mép tràn (= mặt dịch); bã tràn xuống hố, bơm sang túi mỗi sáng
              src.push([new THREE.BoxGeometry(0.44, 0.5, 0.44), new THREE.Matrix4().makeTranslation(OX, -0.25, TZ)], pipeG(new THREE.Vector3(TX0 + 0.12, YL - 0.1, TZ), new THREE.Vector3(OX + 0.16, YL, TZ), 0.045));
            }
            const [fg, lg, c] = hpMerge(src, HEDGE[k]), sz = fg.boundingBox.getSize(new THREE.Vector3()), pos = fg.attributes.position.array;
            let r2 = 0; for (let i = 0; i < pos.length; i += 3) r2 = Math.max(r2, pos[i] * pos[i] + pos[i + 2] * pos[i + 2]);   // bán kính quét khi xoay quanh trục đứng
            const grp = hpQ(new THREE.Group()), hm = hpQ(new THREE.Group()); grp.name = 'Biogas: hologram ' + (k + 1) + ' · ' + PARTS[k][0]; grp.visible = false;
            hpAdd(hm, fg, lg); grp.add(hm); HG.grp.add(grp);
            for (const [mt, col, f] of HPC[k] || []) { const L = src.filter(s => s[3] === mt); if (!L.length) continue; const [cf, cl] = hpMerge(L, 89, c); cl.dispose();   // lớp màu vật liệu đè lên vỏ hologram
              const u = Object.assign({}, HG.hu, { uC: { value: new THREE.Color(col) }, uF: { value: f } }), cm = hpQ(new THREE.Mesh(cf, HG.hmF.clone())); cm.material.uniforms = u; cm.renderOrder = 21.3; hm.add(cm); }
            const P = { grp, hm, rxz: Math.sqrt(r2), ysz: sz.y, dim: Math.max(sz.x, sz.y, sz.z) * SC, n: src.length, fx: null, det: null };   // fx: chuyển động riêng mỗi khung (bọt khí) · det: kính lúp
            if (wat) hpWater(P, wat, dip, c, src);
            return P;
          }
          function hpWater(P, wb, db, c, src) {
            //  nước trong chai an toàn màu nước, đục hơn vỏ hologram + viền mặt nước sáng; bọt khí thoát ở miệng dưới ống nhúng (ngập 12 cm thật), bám quanh ống nổi lên,
            //  lắc ngang, nở dần, vỡ ở mặt nước. Đang xả (áp > 11,5 cm) ⇒ sủi dày + nhanh như thật; lúc nghỉ vẫn sủi thưa, chậm để minh hoạ đường khí: qua nước ⇒ hộp than ⇒ ống thoát.
            //  Chai chỉ ~1/4 chiều cao bộ phận (ống thoát cao 1,1 m) ⇒ trên hologram chính chai rộng ~20 px: thêm KÍNH LÚP — chai + ống nhúng + nắp + nước + bọt to gấp ~3,5
            //  trong vòng tròn bên trái (chỗ trống của dải), cùng góc xoay, dây chỉ tới chai trên hologram chính (hpDet)
            if (!HG.hmW) {   // dựng 1 lần: nước + mặt nước chung bộ uniform hologram (dựng dần, mờ dần), chỉ khác màu + độ đục
              const u = Object.assign({}, HG.hu, { uC: { value: new THREE.Color('#5cc8ff') }, uF: { value: 0.2 } });
              HG.hmW = HG.hmF.clone(); HG.hmW.uniforms = u; HG.hmWL = HG.hmL.clone(); HG.hmWL.uniforms = u;
              HG.hmB = new THREE.ShaderMaterial({ uniforms: { uA: HG.hu.uA, uRev: HG.hu.uRev, uY: HG.hu.uY, uC: { value: new THREE.Color('#ecfbff') } }, transparent: true, depthTest: false, depthWrite: false,
                vertexShader: 'varying vec3 vN; varying float vY; void main() { vec4 p = instanceMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vY = p.y; gl_Position = projectionMatrix * modelViewMatrix * p; ' + HZC + ' }',
                fragmentShader: 'uniform float uA, uRev; uniform vec2 uY; uniform vec3 uC; varying vec3 vN; varying float vY; void main() { if ((vY - uY.x) / (uY.y - uY.x) > uRev) discard; float fr = 1.0 - abs(normalize(vN).z);\n'
                  + 'gl_FragColor = vec4(uC, (0.25 + 0.75 * fr * fr) * uA);\n#include <colorspace_fragment>\n}' });   // bọt: lõi trong, viền sáng như màng bóng
              HG.hmD = new THREE.LineBasicMaterial({ color: '#ffd9a0', transparent: true, depthTest: false, depthWrite: false });   // vòng kính lúp + dây chỉ (màu khối B ngả trắng)
            }
            const r = (wb.max.x - wb.min.x) / 2, x = (wb.max.x + wb.min.x) / 2 - c.x, z = (wb.max.z + wb.min.z) / 2 - c.z, y0 = wb.min.y - c.y, y1 = wb.max.y - c.y;   // khối nước (toạ độ hình, tâm hộp bao về gốc)
            const wg = new THREE.CylinderGeometry(r, r, y1 - y0, 28, 1); wg.translate(x, (y0 + y1) / 2, z);
            const sp = []; for (let i = 0; i < 40; i++) for (const a of [i, i + 1]) sp.push(x + r * Math.cos(a * Math.PI / 20), y1, z + r * Math.sin(a * Math.PI / 20));   // viền mặt nước
            const slg = new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute(sp, 3)), sg = new THREE.SphereGeometry(1, 12, 8), NB = 14;
            const wet = par => { const wm = hpQ(new THREE.Mesh(wg, HG.hmW)), wl = hpQ(new THREE.LineSegments(slg, HG.hmWL)), bm = hpQ(new THREE.InstancedMesh(sg, HG.hmB, NB));   // nước + mặt nước + bọt vào 1 nhóm
              wm.renderOrder = 20.5; bm.renderOrder = 21.5; wl.renderOrder = 22; par.add(wm, wl, bm); return bm; };   // nước dưới vỏ chai + ống nhúng, bọt trên ống, viền mặt nước cùng lớp nét cạnh
            const bm = wet(P.hm), _m = new THREE.Matrix4(), bt = new Float32Array(NB).fill(-9), bj = new Int32Array(NB), Q = { e: 0, j: 0, t: 0 };
            const rt = db ? (db.max.x - db.min.x) / 2 : 0.009, yb = db ? db.min.y - c.y : y0 + 0.04;   // ống nhúng: bán kính · miệng dưới
            const ax = x + c.x, az = z + c.z, nb = src.filter(s => s[2] && (s[2].getCenter(_hc), Math.hypot(_hc.x - ax, _hc.z - az) < 0.07 && _hc.y < wb.max.y + 0.15));   // mảnh quanh trục chai: vỏ, nắp, ống nhúng (không cọc, giá, ống lên hộp than)
            const [dfg, dlg] = hpMerge(nb, 30, c), bb = new THREE.Box3(); let dr = r; nb.forEach(s => { bb.union(s[2]); dr = Math.max(dr, s[2].max.x - ax, ax - s[2].min.x, s[2].max.z - az, az - s[2].min.z); });
            const det = hpQ(new THREE.Group()), inn = hpQ(new THREE.Group()); inn.position.set(-x, c.y - (bb.min.y + bb.max.y) / 2, -z); det.add(inn); hpAdd(inn, dfg, dlg);   // xoay quanh trục chai
            wet(inn).instanceMatrix = bm.instanceMatrix;   // bọt kính lúp = bọt hologram chính (chung ma trận)
            const cl = hpQ(new THREE.LineSegments(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(98 * 3), 3)), HG.hmD)); cl.renderOrder = 22;
            P.grp.add(det, cl); P.det = { g: det, cl, r: dr, h: bb.max.y - bb.min.y, rw: r, wc: new THREE.Vector3(x, (y0 + y1) / 2, z) };
            P.fx = now => {   // theo đồng hồ thật (không kẹp khung): khung chậm vẫn đủ bọt, rải tuổi đều; vừa hiện lại ⇒ dòng bọt đã chạy sẵn
              const vent = B.pk > 11.5, lam = vent ? 11 : 2.4, T = vent ? 0.75 : 1.15;   // bọt / s · thời gian nổi (s)
              Q.e += lam * Math.min(2, Math.max(0, now - Q.t)); Q.t = now; while (Q.e >= 1) { Q.e -= 1; const i = ++Q.j % NB; bt[i] = now - Q.e / lam; bj[i] = Q.j; }
              for (let i = 0; i < NB; i++) {
                const u = (now - bt[i]) / T, j = bj[i];
                if (!(u >= 0 && u < 1)) { bm.setMatrixAt(i, _m.makeScale(0, 0, 0)); continue; }
                const rb = 0.007 * (0.75 + 0.5 * (j * 0.618 % 1)) * (0.85 + 0.4 * u) * Math.min(1, (1 - u) / 0.07), a = j * 2.4 + 0.5 * Math.sin(now * 6 + j);   // bọt ~5 mm thật · cỡ riêng mỗi bọt · nở khi lên · vỡ ở mặt
                const d = Math.min(r - rb - 0.003, rt + rb + 0.003 + 0.016 * u + 0.004 * Math.sin(u * 17 + j));   // cách trục ống: bám ống rồi tản dần, lắc ngang
                bm.setMatrixAt(i, _m.makeScale(rb, rb, rb).setPosition(x + d * Math.cos(a), yb + (y1 - yb - rb) * u, z + d * Math.sin(a)));
              }
              bm.instanceMatrix.needsUpdate = true;
            };
          }
          function hpDet(P, st, xl, pk, upp, z, Wd, Hd) {   // KÍNH LÚP chai an toàn trong chỗ trống bên trái hologram chính (xl: mép trái nó, px): cỡ px cố định như hologram, vòng bao trọn hình
            //  ở mọi góc xoay + dây chỉ tới chai trên hologram chính; chỗ hẹp quá (< 90 px) hoặc phóng không tới 1,6 lần ⇒ ẩn. Trả ô kéo xoay [x, y, cạnh]
            const D = P.det, de = hpExt(D.r, D.h), m = Math.min(xl - 18 - st.x, st.h) - 22, pd = Math.min(m / Math.hypot(de[0], de[1]), pk * 6);
            D.g.visible = D.cl.visible = m > 90 && pd > pk * 1.6; if (!D.g.visible) return null;
            const R = Math.hypot(de[0], de[1]) * pd / 2 + 9, cx = xl - 18 - R, cy = st.y + st.h / 2;
            D.g.position.set(cx / Wd * 2 - 1, 1 - cy / Hd * 2, z).unproject(camera); D.g.rotation.set(0, ROT + HG.yaw, 0); D.g.scale.setScalar(pd * upp);
            P.hm.updateMatrixWorld(); P.hm.localToWorld(_hq.copy(D.wc)).project(camera); const bx = (_hq.x + 1) / 2 * Wd, by = (1 - _hq.y) / 2 * Hd, a = Math.atan2(by - cy, bx - cx), e = D.rw * pk + 4;   // chai trên hologram chính (px)
            const pa = D.cl.geometry.attributes.position, put = (i, px, py) => { _hq.set(px / Wd * 2 - 1, 1 - py / Hd * 2, z).unproject(camera); pa.setXYZ(i, _hq.x, _hq.y, _hq.z); };
            for (let i = 0; i < 48; i++) for (const j of [0, 1]) { const t = (i + j) / 24 * Math.PI; put(2 * i + j, cx + R * Math.cos(t), cy + R * Math.sin(t)); }
            put(96, cx + R * Math.cos(a), cy + R * Math.sin(a)); put(97, bx - e * Math.cos(a), by - e * Math.sin(a));   // dây chỉ: mép vòng → sát chai
            pa.needsUpdate = true; HG.hmD.opacity = 0.7 * HG.hu.uA.value;
            return [cx - R, cy - R, 2 * R];
          }
          function hpExt(r, h) {   // bề ngang · cao lớn nhất trên màn hình (đv hình) của khối bán kính quét r, cao h khi xoay quanh trục đứng, camera trực giao chúc xuống
            const sE = Math.max(0.05, Math.min(1, -camera.getWorldDirection(_hr).y)), cE = Math.sqrt(1 - sE * sE);
            return [2 * r, h * cE + 2 * r * sE];
          }
          const HTHAN = 6;   // dòng 7 Hộp than khử mùi: hologram mặc định khi mở bảng + có nước / bong bóng (hpBuild)
          function holoPick(k) {   // chọn dòng k ⇒ hologram bộ phận đó (k < 0: tắt) ·: camera đứng yên, hologram tự vừa dải cạnh bảng (holoTick)
            const now = clock.elapsedTime; HG.key = '';
            if (k < 0) { if (HG.sel >= 0) HG.hk = now; HG.sel = -1; return; }   // tắt: mờ dần
            const P = HG.hp[k] || (HG.hp[k] = hpBuild(k)); if (HG.hs && HG.hs !== P) HG.hs.grp.visible = false;   // đổi dòng: cái cũ tắt ngay, cái mới dựng từ dưới lên
            HG.sel = k; HG.hs = P; HG.ht = now; HG.yaw = 0; HG.spinAt = -9; HG.hu.uC.value.set(HCOL[PARTS[k][1]]);   // hologram mang màu khối của nhãn số
          }
          const _hn = new THREE.Vector3(), _hr = new THREE.Vector3(), _hq = new THREE.Vector3();
          const hEase = v => { v = Math.max(0, Math.min(1, v)); return v * v * (3 - 2 * v); };
          function holoOpen() {
            if (!HG.grp) holoBuild(); const now = clock.elapsedTime, fresh = !HG.on && !HG.grp.visible;
            if (fresh) { HG.t0 = now; HG.key = ''; } HG.on = true; HG.grp.visible = true;   // camera đứng yên
            if (HG.sel < 0) { holoPick(HTHAN); if (fresh) HG.ht = now + 0.3; }   // hologram Hộp than khử mùi (nước + bong bóng) dựng ngay sau khi bảng bung xong
          }
          function holoClose() { if (!HG.on) return; HG.on = false; HG.tc = clock.elapsedTime; holoQuiet(); }
          function holoPopAt(Wd, Hd, w, h) {   // chỗ bảng việc HTML (job.popAt — ui/xray-lifecycle.js showToolPop): ngay trên bảng, canh mép phải; không đủ cao ⇒ sát trái bảng, canh đáy
            const R = holoLay(Wd, Hd).R, y = R.y - GAP - h;
            return y >= 8 ? [R.x + R.w - w, y] : [Math.max(8, R.x - GAP - w), Math.max(8, R.y + R.h - h)];
          }
          function holoTick(upp) {
            if (!HG.grp || !HG.grp.visible) return;
            const now = clock.elapsedTime, ta = now - HG.t0, kc = HG.on ? 1 : 1 - hEase((now - HG.tc) / 0.3), dt = Math.min(0.1, Math.max(0, now - HG.lt)), P = HG.hs; HG.lt = now;
            if (kc <= 0) { HG.grp.visible = false; htShow(HG.pb, false); holoQuiet(); if (P) P.grp.visible = false; HG.hs = null; HG.sel = HG.hov = -1; return; }   // đóng hẳn: lần mở sau bắt đầu lại
            const vis = shownInScene(g);   // bảng neo góc phải dưới, không theo hệ ⇒ chỉ giấu khi hệ không thuộc cảnh đang xem
            if (!vis) { htShow(HG.pb, false); holoQuiet(); if (P) P.grp.visible = false; return; }
            const Wd = Math.max(1, W()), Hd = Math.max(1, Hv()), Lo = holoLay(Wd, Hd), R = Lo.R, z = Math.max(-0.95, Math.min(0.95, g.localToWorld(_hn.set(0, 0.3, 0)).project(camera).z));   // độ sâu hologram: ngang tâm hệ, kẹp trong khung nhìn (không kiểm sâu, lớp nét)
            if (htSize(HG.pb, R.w, R.h)) HG.key = '';   // đổi cỡ khung / màn hình khác dpr ⇒ vẽ lại chữ đúng điểm ảnh
            if (now - HG.kAt > 0.5 || !HG.key) { HG.kAt = now; const k = HSPEC.map(f => f()).join('|') + '|' + Math.round(B.Ts) + '|' + Math.round(B.S / 5) + '|' + B.p.toFixed(1) + '|' + (B.prof ? Math.round(B.prof.prod) : 0) + '|' + HG.sel + '|' + HG.hov;
              if (k !== HG.key) { HG.key = k; holoDraw(); } }   // chữ chỉ vẽ lại khi số / dòng chọn / dòng rê đổi
            const pu = hEase((ta - 0.05) / 0.26) * kc, rev = Math.min(1, Math.max(0, (ta - 0.25) / 0.75)), glt = now % 5.3 < 0.07;   // bảng bung · in chữ · chớp nhiễu (chỉ hologram; bảng như nhãn thì đứng yên)
            const pb = HG.pb, sb = pb.b.style, op = (hEase(ta / 0.2) * kc).toFixed(3), mk = rev < 1 ? 'linear-gradient(to bottom, #000 ' + (rev * 100 - 1.5).toFixed(1) + '%, rgba(0,0,0,0.22) ' + (rev * 100).toFixed(1) + '%)' : 'none';
            htAt(pb, R.x, R.y, pu < 1 ? ' scaleY(' + Math.max(0.02, pu).toFixed(3) + ')' : ''); htShow(pb, true);   // bung từ mép dưới lên (gốc biến hình = giữa mép dưới); mở xong ⇒ bỏ co giãn, chữ 1:1 điểm ảnh
            if (op !== pb.op) { pb.op = op; sb.opacity = op; }
            if (mk !== pb.mk) { pb.mk = mk; sb.webkitMaskImage = sb.maskImage = mk; }   // in dần từ trên xuống: phần chưa in mờ 22 %
            HG.rect = HG.on && pu >= 1 ? R : null; HG.hrect = null;
            const hv = P ? (HG.sel >= 0 ? hEase((now - HG.ht) / 0.25) : 1 - hEase((now - HG.hk) / 0.25)) * kc : 0;   // hologram: hiện 0,25 s · tắt mờ 0,25 s
            if (P && hv <= 0) { P.grp.visible = false; if (HG.sel < 0) HG.hs = null; }
            if (P && hv > 0) {
              if (!(HG.down && HG.down.hh === 11) && now - HG.spinAt > 1.5) HG.yaw += dt * 0.3;   // xoay chậm ~21 s / vòng; vừa kéo tay ⇒ chờ 1,5 s
              const st = Lo.H, ex = hpExt(P.rxz, P.ysz), pk = Math.min(st.w * 0.88 / ex[0], st.h * 0.88 / ex[1]), e = [ex[0] * pk, ex[1] * pk], lt = st.x + st.w <= R.x + 1, rt = st.x >= R.x + R.w - 1;   // pk: px / đv hình ⇒ hologram chiếm 88 % dải, cỡ trên màn hình KHÔNG theo zoom camera · sát cạnh trái bảng (khe 16 + 12 px)
              const sx = lt ? st.x + st.w - Math.min(st.w, e[0] + 24) / 2 : rt ? st.x + Math.min(st.w, e[0] + 24) / 2 : Math.max(st.x + e[0] / 2, Math.min(st.x + st.w - e[0] / 2, R.x + R.w / 2));
              const sy = lt || rt ? st.y + st.h / 2 : st.y + Math.min(st.h, e[1] + 24) / 2;
              P.hm.position.set(sx / Wd * 2 - 1, 1 - sy / Hd * 2, z).unproject(camera); P.hm.rotation.set(0, ROT + HG.yaw, 0); P.hm.scale.setScalar(pk * upp); P.grp.visible = true;   // đv thế giới / đv hình = px / đv hình × đv thế giới / px
              HG.hu.uT.value = now; HG.hu.uA.value = hv * (glt ? 0.75 : 1); HG.hu.uRev.value = HG.sel >= 0 ? Math.min(1, (now - HG.ht) / 0.7) : 1; HG.hu.uY.value.set(-P.ysz / 2 - 1e-3, P.ysz / 2 + 1e-3);
              if (P.fx) P.fx(now);
              const dk = P.det && hpDet(P, st, sx - e[0] / 2, pk, upp, z, Wd, Hd), x0 = dk ? dk[0] : sx - e[0] / 2, y0 = Math.min(sy - e[1] / 2, dk ? dk[1] : 1e9), y1 = Math.max(sy + e[1] / 2, dk ? dk[1] + dk[2] : 0);
              if (HG.on) HG.hrect = { x: x0, y: y0, w: sx + e[0] / 2 - x0, h: y1 - y0 };   // ô kéo xoay: hologram + kính lúp
            }
            holoCursor();
          }
          g.updateMatrixWorld(true);   // ma trận thế giới mọi mảnh con ngay lúc dựng: hộp bấm (dịch vụ 'jobs' đo hộp bao trước khung vẽ đầu) cần đúng chỗ
          return { C, g, sys, B, boxes: [gA, gB, gS, gC], update, tagTick, msg, choices, digL, holo: { open: holoOpen, close: holoClose, pick: holoPick, popAt: holoPopAt, state: HG } };
        })();
        worldPlace('biogas', {
          face: {   // MẶT CÔNG KHAI (chỉ đọc): tâm khu rào (thế giới) · khí đang trữ (L) · áp (cm nước) · túi bã (L) · nhiệt độ bể (°C)
            get pos() { return biogas.C; }, get gasL() { return biogas.B.S; }, get pressure() { return biogas.B.p; }, get digestateL() { return biogas.digL(); }, get slurryC() { return biogas.B.Ts; },
          },
          tick: [['things', 40, (dt, t) => biogas.update(dt, t)], ['viewer', 60, () => biogas.tagTick()]],   // MỖI KHUNG: túi khí, vòm, áp kế, bọt xả, đèn men, túi bã · nhãn
          hover: { root: biogas.sys },   // rê chuột: viền trắng (không gồm hàng rào, ống về xe)
          job: { box: biogas.boxes, title: 'Hệ biogas ống mềm', get msg() { return biogas.msg(); }, choices: biogas.choices, pick: () => biogas.holo.open(), close: () => biogas.holo.close(), dock: true, popAt: (W, H, w, h) => biogas.holo.popAt(W, H, w, h) },   // bấm ⇒ số liệu sống + 2 việc hệ tự làm (bảng việc ngay trên bảng danh sách góc phải dưới) + hologram danh sách; đóng bảng ⇒ tắt hologram
        });
