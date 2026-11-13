        // ==== CHI TIẾT CABIN + GẦM FORD TRANSIT (thứ xe thật có mà mẫu GLB thiếu) ====
        //  cabDetail(cab, van) gọi trong transitCab lúc dựng xe ⇒ mảnh vào lô gộp lượt vẽ của xe (không thêm lượt vẽ). Mỗi nhóm × màu gộp 1 lưới.
        //  Toạ độ đo trên cabin GLB (tay lái nghịch: ghế lái −z; 1 cm = 0,011) ⇒ nhóm cabin ẩn tới khi GLB gắn xong (cabDetailJoin — van/body/transit-glb.js).
        //  Mọi lưới noCollide. Nhóm gầm nằm thẳng dưới gốc xe: theo vai xem xuyên của vỏ, bám thùng dầu / ống xả / lốp dự phòng sẵn có ('Gầm xe').
        //  Chừa lối giữa 2 ghế (|z| < 0,22: ổ chó) và tay nắm vàng cửa lùa (z ≥ 0,85).
        let cabKit = null;
        function cabDetailJoin() { if (cabKit) cabKit.visible = true; }
        function cabDetail(cab, van) {
          if (!mergeGeometries) return;
          const bins = new Map(), st = [new THREE.Matrix4()], M4 = new THREE.Matrix4(), E = new THREE.Euler(), Q = new THREE.Quaternion(), P = new THREE.Vector3(), D = new THREE.Vector3(),
            ONE = new THREE.Vector3(1, 1, 1), UP = new THREE.Vector3(0, 1, 0), H = Math.PI / 2;
          const RUB = 0x1e2022, RIB = 0x34383a, DK = 0x2b2e30, MID = 0x4a4e50, LT = 0x8b8f92, CHR = 0xb9bcbe, EXH = 0x8d949a, EX2 = 0x6f757a, RED = 0xc22a1f, GRN = 0x2e8b4f, WHT = 0xf0efe9,
            BLU = 0x2b63c9, CURT = 0x5f7482, CUP = 0xe9e3d5, LID = 0x3a2c22, TAN = 0xa67c52, NAVY = 0x2f4f8f, YEL = 0xe5c33a, VIS = 0xd7e83a, CASE = 0x1c1c1e, SCR = 0x27313a, AMB = 0xf2a21b;
          let grp = 0;   // 0 cabin, 1 gầm
          const put = (geo, col, x, y, z, rx = 0, ry = 0, rz = 0, q = null) => {   // đặt hình vào khung đang mở (Euler XYZ: xoay z trước, x sau) rồi xếp vào giỏ nhóm × màu
            geo.applyMatrix4(M4.compose(P.set(x, y, z), q || Q.setFromEuler(E.set(rx, ry, rz)), ONE).premultiply(st[st.length - 1]));
            const k = grp + '|' + col; let b = bins.get(k); if (!b) bins.set(k, b = { grp, col, list: [] }); b.list.push(geo); return geo;
          };
          const at = (x, y, z, rx, ry, rz, fn) => { st.push(new THREE.Matrix4().compose(P.set(x, y, z), Q.setFromEuler(E.set(rx, ry, rz)), ONE).premultiply(st[st.length - 1])); fn(); st.pop(); };
          const B = (col, w, h, d, x, y, z, rx, ry, rz) => put(new THREE.BoxGeometry(w, h, d), col, x, y, z, rx, ry, rz);
          const C = (col, rt, rb, h, x, y, z, rx, ry, rz, seg = 10) => put(new THREE.CylinderGeometry(rt, rb, h, seg), col, x, y, z, rx, ry, rz);   // trục y; rz = H ⇒ đầu trên quay về −x; rx = H ⇒ về +z
          const Sp = (col, r, x, y, z) => put(new THREE.SphereGeometry(r, 8, 6), col, x, y, z);
          const T = (col, R, r, x, y, z, rx, ry, rz, seg = 12) => put(new THREE.TorusGeometry(R, r, 5, seg), col, x, y, z, rx, ry, rz);   // trục z
          const rod = (col, r, a, b, seg = 6) => {
            D.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = D.length(); Q.setFromUnitVectors(UP, D.multiplyScalar(1 / L));
            return put(new THREE.CylinderGeometry(r, r, L, seg), col, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2, 0, 0, 0, Q);
          };
          const path = (col, r, pts, seg = 6) => { for (let i = 0; i + 1 < pts.length; i++) rod(col, r, pts[i], pts[i + 1], seg); };
          const drape = (col, cx, cz, y0, y1, ax, az, amp, waist, top = 1) => {   // bó vải: trụ elip 8 nếp, thắt quanh độ cao waist, thu dần lên đỉnh (top)
            const g = new THREE.CylinderGeometry(1, 1, 1, 24, 10), p = g.attributes.position, h = y1 - y0;
            for (let i = 0; i < p.count; i++) {
              const x = p.getX(i), z = p.getZ(i), t = p.getY(i) + 0.5, u = (y0 + t * h - waist) / 0.13;
              const k = (1 + amp * Math.cos(8 * Math.atan2(x, z))) * (1 - 0.34 * Math.exp(-u * u)) * (1 - (1 - top) * Math.max(0, (t - 0.6) / 0.4));
              p.setXYZ(i, x * ax * k, t * h, z * az * k);
            }
            g.computeVertexNormals(); return put(g, col, cx, y0, cz);
          };

          // thảm cao su 2 chỗ để chân (trên thảm sàn y 0,842): viền nổi, 9 gân ngang; bên lái thêm tấm gót
          for (const s of [-1, 1]) {
            const zc = s * 0.475;
            B(RUB, 0.68, 0.008, 0.45, -1.80, 0.846, zc);
            for (const e of [-1, 1]) { B(RUB, 0.68, 0.006, 0.012, -1.80, 0.853, zc + e * 0.219); B(RUB, 0.012, 0.006, 0.426, -1.80 + e * 0.334, 0.853, zc); }
            for (let i = 0; i < 9; i++) B(RIB, 0.014, 0.005, 0.40, -2.08 + 0.07 * i, 0.8525, zc);
          }
          B(DK, 0.20, 0.007, 0.24, -1.85, 0.8535, -0.50); for (let i = 0; i < 6; i++) B(RIB, 0.006, 0.003, 0.22, -1.925 + 0.03 * i, 0.8585, -0.50);
          // nẹp bậc lên xuống 2 cửa trước (mặt bậc y 0,60–0,61)
          for (const s of [-1, 1]) { B(MID, 0.45, 0.012, 0.075, -1.245, 0.607, s * 0.861); for (let i = 0; i < 7; i++) B(LT, 0.012, 0.003, 0.065, -1.44 + 0.065 * i, 0.6145, s * 0.861); }
          // trụ B (ốp nghiêng 0,204 rad): ray chỉnh cao đai an toàn sau khoen đai của GLB + nút trượt; móc áo phía trên
          for (const s of [-1, 1]) {
            at(-0.80, 2.05, s * 0.883, -s * 0.204, 0, 0, () => { B(DK, 0.05, 0.34, 0.012, 0, 0, 0); B(MID, 0.03, 0.03, 0.014, 0, 0.14, -s * 0.003); });
            at(-0.86, 2.32, s * 0.826, -s * 0.204, 0, 0, () => { B(DK, 0.025, 0.035, 0.008, 0, 0, 0); rod(DK, 0.004, [0, -0.005, 0], [0, 0.012, -s * 0.03], 5); Sp(DK, 0.006, 0, 0.012, -s * 0.03); });
          }
          // hàng 5 nút dưới màn hình (dải phẳng x −1,716…−1,719, y 1,61–1,65): giữa là nút đèn khẩn cấp
          for (let i = -2; i <= 2; i++) { B(DK, 0.006, 0.022, 0.03, -1.714, 1.63, i * 0.036); if (i) B(WHT, 0.002, 0.004, 0.012, -1.7105, 1.63, i * 0.036); }
          put(new THREE.CylinderGeometry(0.008, 0.008, 0.002, 3), RED, -1.7105, 1.628, 0, -H, 0, H);
          // ổ khoá điện bên phải cột lái + chìa, vòng, móc khoá
          C(CHR, 0.016, 0.016, 0.012, -1.78, 1.43, -0.623, H, 0, 0); C(CASE, 0.011, 0.011, 0.004, -1.78, 1.43, -0.630, H, 0, 0);
          B(RUB, 0.008, 0.03, 0.03, -1.78, 1.43, -0.648); T(CHR, 0.011, 0.0015, -1.78, 1.408, -0.655, 0, 0, 0, 10);
          B(RUB, 0.026, 0.045, 0.012, -1.78, 1.372, -0.655); B(AMB, 0.02, 0.03, 0.004, -1.772, 1.378, -0.664, 0, 0, 0.3);
          // khe nắp hộp găng tay (mặt cong đo bằng tia: x = gA(y) − 0,068 (z − 0,28)); hõm sẵn có ở z 0,40–0,44 là chốt mở
          const gA = y => y < 1.30 ? -1.729 + (y - 1.25) * 0.5 : y < 1.35 ? -1.704 + (y - 1.30) * 0.24 : y < 1.40 ? -1.692 + (y - 1.35) * 0.14 : -1.685 + (y - 1.40) * 0.1;
          const gf = (y, z) => [gA(y) - 0.068 * (z - 0.28) + 0.001, y, z];
          for (const y of [1.275, 1.44]) rod(DK, 0.002, gf(y, 0.32), gf(y, 0.68), 4);
          for (const z of [0.32, 0.68]) path(DK, 0.002, [1.275, 1.30, 1.35, 1.40, 1.44].map(y => gf(y, z)), 4);
          // cổng USB đôi cạnh khe 12 V
          B(RUB, 0.004, 0.018, 0.04, -1.654, 1.475, -0.022); for (const e of [-1, 1]) B(LT, 0.002, 0.005, 0.011, -1.6515, 1.475, -0.022 + e * 0.009);
          // khay mặt táp-lô: sổ + bút (bên phụ), kính râm gập (khay giữa), khăn lau (bên lái)
          at(-2.12, 1.566, 0.47, 0, 0.2, 0, () => { B(TAN, 0.14, 0.012, 0.10, 0, 0.006, 0); B(CASE, 0.012, 0.0125, 0.101, 0.045, 0.006, 0); rod(BLU, 0.004, [-0.05, 0.016, -0.03], [0.06, 0.016, 0.02]); });
          at(-2.20, 1.612, 0.06, 0, 0.15, 0, () => {
            for (const e of [-1, 1]) B(LID, 0.003, 0.03, 0.044, 0, 0.017, e * 0.026);
            B(CASE, 0.004, 0.005, 0.012, 0, 0.027, 0); B(CASE, 0.004, 0.004, 0.10, -0.006, 0.029, 0); B(CASE, 0.004, 0.004, 0.10, -0.011, 0.024, 0);
          });
          B(YEL, 0.10, 0.015, 0.09, -2.10, 1.573, -0.48, 0, -0.15, 0);
          // điện thoại dẫn đường kẹp cửa gió giữa (bên phụ, nghiêng về ghế lái) + tẩu sạc 12 V + dây
          at(-1.695, 1.675, 0.215, 0, 0.35, 0, () => {
            B(CASE, 0.012, 0.165, 0.08, 0, 0, 0); B(SCR, 0.002, 0.15, 0.07, 0.0065, 0, 0);
            B(GRN, 0.0015, 0.022, 0.066, 0.0078, 0.062, 0); B(BLU, 0.0015, 0.10, 0.008, 0.0078, -0.012, 0.004, 0.25, 0, 0); B(WHT, 0.0015, 0.012, 0.012, 0.0082, -0.05, 0.016, 0.785, 0, 0);
            for (const e of [-1, 1]) B(DK, 0.02, 0.022, 0.006, -0.004, -0.01, e * 0.043);
            Sp(DK, 0.012, -0.02, 0, 0);
          });
          rod(DK, 0.007, [-1.7138, 1.675, 0.2219], [-1.79, 1.638, 0.20]);
          C(DK, 0.011, 0.011, 0.03, -1.667, 1.472, 0.155, 0, 0, H, 8); C(MID, 0.013, 0.013, 0.008, -1.650, 1.472, 0.155, 0, 0, H, 8);
          path(CASE, 0.0025, [[-1.695, 1.594, 0.215], [-1.652, 1.545, 0.20], [-1.638, 1.495, 0.172], [-1.646, 1.472, 0.155]], 5);
          // khay cốc: cốc cà phê giấy (ô z 0,127), bình giữ nhiệt (ô z −0,008); đáy khay y 1,314
          C(CUP, 0.031, 0.024, 0.10, -1.61, 1.364, 0.127, 0, 0, 0, 12); C(TAN, 0.0295, 0.0267, 0.04, -1.61, 1.36, 0.127, 0, 0, 0, 12);
          C(LID, 0.032, 0.032, 0.006, -1.61, 1.417, 0.127, 0, 0, 0, 12); C(LID, 0.026, 0.03, 0.006, -1.61, 1.423, 0.127, 0, 0, 0, 12);
          C(CHR, 0.029, 0.027, 0.115, -1.61, 1.3715, -0.008, 0, 0, 0, 12); C(CASE, 0.03, 0.03, 0.02, -1.61, 1.439, -0.008, 0, 0, 0, 12);
          // kệ trần (sàn kệ y 2,415, gờ sau che tới 2,44): bên lái chồng bản đồ + ví giấy tờ, hộp khăn giấy; bên phụ túi cứu thương, áo phản quang gấp
          B(NAVY, 0.16, 0.028, 0.24, -1.25, 2.429, -0.58); B(RED, 0.15, 0.024, 0.22, -1.245, 2.455, -0.585, 0, 0.08, 0); B(YEL, 0.152, 0.008, 0.03, -1.245, 2.455, -0.50, 0, 0.08, 0);
          B(TAN, 0.14, 0.012, 0.20, -1.25, 2.473, -0.57, 0, -0.1, 0);
          B(WHT, 0.13, 0.07, 0.12, -1.25, 2.45, -0.38); B(BLU, 0.132, 0.02, 0.122, -1.25, 2.44, -0.38); B(CASE, 0.03, 0.002, 0.07, -1.25, 2.4855, -0.38);
          B(GRN, 0.13, 0.09, 0.20, -1.25, 2.46, 0.58);
          B(WHT, 0.05, 0.002, 0.016, -1.25, 2.5055, 0.58); B(WHT, 0.016, 0.002, 0.05, -1.25, 2.5055, 0.58); B(WHT, 0.002, 0.05, 0.016, -1.1845, 2.475, 0.58); B(WHT, 0.002, 0.016, 0.05, -1.1845, 2.475, 0.58);
          B(VIS, 0.13, 0.06, 0.17, -1.25, 2.445, 0.39); B(LT, 0.132, 0.012, 0.172, -1.25, 2.455, 0.39);
          // bình chữa cháy nằm ngang trước chân ghế phụ (trục z, van về phía cửa), 2 đai thép + đế
          at(-1.455, 0.905, 0.50, H, 0, 0, () => {
            C(RED, 0.042, 0.042, 0.17, 0, 0, 0, 0, 0, 0, 12); C(RED, 0.042, 0.03, 0.015, 0, -0.0925, 0, 0, 0, 0, 12); C(RED, 0.022, 0.042, 0.03, 0, 0.10, 0, 0, 0, 0, 12);
            C(WHT, 0.0428, 0.0428, 0.06, 0, -0.012, 0, 0, 0, 0, 12); for (const y of [-0.062, 0.06]) C(CHR, 0.0436, 0.0436, 0.008, 0, y, 0, 0, 0, 0, 12);
            C(CHR, 0.014, 0.014, 0.02, 0, 0.125, 0, 0, 0, 0, 8); B(DK, 0.03, 0.03, 0.03, 0, 0.15, 0);
            B(DK, 0.06, 0.012, 0.014, -0.035, 0.156, 0); B(MID, 0.05, 0.008, 0.012, -0.03, 0.169, 0); T(YEL, 0.008, 0.0015, 0.004, 0.166, -0.012, 0, H, 0, 8);
            C(WHT, 0.01, 0.01, 0.006, 0, 0.15, -0.018, H, 0, 0, 8);
            rod(RUB, 0.006, [0.02, 0.14, -0.012], [0.04, 0.02, -0.025]);
            B(DK, 0.06, 0.20, 0.006, 0, 0, 0.045);
          });
          // rèm ngăn cabin – khoang ở: ray thép theo trần (3 đoạn) + 3 tai treo, khoen, 2 bó rèm kéo sát vách có dây buộc (bên lái đứng trên mặt tủ bếp)
          const RX = -0.605, railY = z => 2.69 - Math.max(0, Math.abs(z) - 0.45) * 0.237;
          path(CHR, 0.007, [[RX, railY(0.83), -0.83], [RX, 2.69, -0.45], [RX, 2.69, 0.45], [RX, railY(0.83), 0.83]], 8);
          for (const z of [-0.83, 0.83]) C(DK, 0.013, 0.013, 0.012, RX, railY(z), z, H, 0, 0, 8);
          for (const z of [-0.45, 0, 0.45]) rod(CHR, 0.004, [RX, 2.69, z], [RX, z ? 2.715 : 2.745, z], 5);
          for (let i = 0; i < 6; i++) for (const z of [0.675 + 0.022 * i, -0.73 - 0.018 * i]) T(CHR, 0.013, 0.0025, RX, railY(z), z, 0, 0, 0, 10);
          drape(CURT, -0.615, 0.73, 0.86, railY(0.73) - 0.012, 0.03, 0.06, 0.2, 1.75, 0.8); drape(TAN, -0.615, 0.73, 1.732, 1.768, 0.024, 0.048, 0, 99);
          drape(CURT, -0.615, -0.79, 1.40, railY(0.79) - 0.012, 0.03, 0.058, 0.2, 1.95, 0.72); drape(TAN, -0.615, -0.79, 1.932, 1.968, 0.024, 0.0465, 0, 99);
          // cây thơm treo gương trong
          rod(WHT, 0.0015, [-1.61, 2.17, -0.015], [-1.61, 2.075, -0.015], 4);
          for (const [rb, h, y] of [[0.02, 0.035, 2.058], [0.028, 0.04, 2.03]]) put(new THREE.CylinderGeometry(0.003, rb, h, 4).scale(0.15, 1, 1), GRN, -1.61, y, -0.015);
          B(TAN, 0.003, 0.012, 0.01, -1.61, 2.004, -0.015);

          grp = 1;
          // gầm: đai thép + ốc xả thùng dầu; ống xả thêm ống xuống từ máy, đoạn mềm, bầu lọc hạt (DPF), bầu giảm thanh, 3 giá treo cao su, đuôi mạ; mâm + thanh giữ lốp dự phòng
          for (const x of [-0.42, 0.02]) { B(CHR, 0.035, 0.005, 0.516, x, 0.3365, -0.62); for (const z of [-0.8755, -0.3645]) B(CHR, 0.035, 0.14, 0.005, x, 0.407, z); }
          C(CHR, 0.012, 0.012, 0.01, -0.2, 0.334, -0.62, 0, 0, 0, 6);
          const EY = 0.40, EZ = -0.35, down = [[-0.15, EY, EZ], [-0.7, EY, -0.30], [-1.25, 0.43, -0.22], [-1.65, 0.46, -0.20]];
          path(EXH, 0.032, down, 8); Sp(EXH, 0.033, ...down[1]); Sp(EXH, 0.033, ...down[2]);
          rod(EX2, 0.04, [-0.92, 0.412, -0.268], [-1.085, 0.421, -0.244], 8);
          const can = (x0, x1, r) => {
            C(EX2, r, r, x1 - x0, (x0 + x1) / 2, EY, EZ, 0, 0, H); C(EX2, 0.035, r, 0.05, x0 - 0.025, EY, EZ, 0, 0, H); C(EX2, r, 0.035, 0.05, x1 + 0.025, EY, EZ, 0, 0, H);
            for (const x of [x0 + 0.04, x1 - 0.04]) C(CHR, r + 0.003, r + 0.003, 0.014, x, EY, EZ, 0, 0, H);
          };
          can(0.28, 0.62, 0.07); can(1.45, 1.75, 0.075);
          for (const x of [0.9, 2.5, 3.2]) { rod(DK, 0.005, [x, EY + 0.03, EZ], [x, 0.56, EZ - 0.03], 5); B(RUB, 0.03, 0.035, 0.02, x, 0.50, EZ - 0.016); }
          C(CHR, 0.04, 0.04, 0.10, 3.53, EY, EZ, 0, 0, H); C(CASE, 0.031, 0.031, 0.002, 3.581, EY, EZ, 0, 0, H);
          C(LT, 0.21, 0.21, 0.012, 3.392, 0.336, 0, 0, 0, 0, 16); C(DK, 0.07, 0.07, 0.02, 3.392, 0.326, 0);
          for (let i = 0; i < 5; i++) C(CHR, 0.008, 0.008, 0.01, 3.392 + 0.045 * Math.cos(i * 1.2566), 0.3215, 0.045 * Math.sin(i * 1.2566), 0, 0, 0, 6);
          B(DK, 0.05, 0.01, 0.60, 3.392, 0.312, 0);

          const kit = new THREE.Group(), und = new THREE.Group();
          kit.name = 'Chi tiết cabin'; und.name = 'Chi tiết gầm'; kit.userData.xray = 'keep'; kit.userData.noBake = und.userData.noBake = true; kit.visible = false;
          for (const b of bins.values()) {
            const mat = new THREE.MeshLambertMaterial({ color: b.col }); if (b.col === CURT) mat.userData.vk = 3;   // vân vải (core/room-light.js)
            const m = new THREE.Mesh(mergeGeometries(b.list, false), mat); for (const g of b.list) g.dispose();
            m.name = (b.grp ? und : kit).name + ' · ' + b.col.toString(16); m.castShadow = m.receiveShadow = true; m.userData.noCollide = true; (b.grp ? und : kit).add(m);
          }
          cab.add(kit); van.add(und); cabKit = kit;
        }
