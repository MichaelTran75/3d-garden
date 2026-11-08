        // ===== THỎ NHẢY CÓ KẾ HOẠCH (docs/bunny-movement.md) =====
        //  Đo trước khi sửa (thỏ nhảy thẳng vào 21 cọc rào biogas + lang thang 8 × 90 s): thân lấn khối đặc 5,6 % thời gian, lấn cọc tới 8,8 cm, 68 lần quay ngoắt
        //  > 57° trong 1 khung. Gốc: (1) dấu chân va chạm chung (core/collide.js colFootHits) với thân thỏ a 0,16 · b 0,12 chỉ còn 5 điểm cách nhau 12–16 cm ⇒ cọc
        //  4 cm lọt giữa các điểm; đầu + mông nằm ngoài dấu chân · (2) chỉ thử từng bước 8 mm mỗi khung ⇒ lao thẳng vào vật rồi mới quay 130–190° tức thì ·
        //  (3) bay suốt chu kỳ (không có lúc chạm đất), đỉnh 33 cm > cao thân 28 cm, đổi hướng giữa không trung, khựng giữa không trung khi vướng.
        //  Cách làm (thỏ thật + AI game): mỗi cú là 1 sự kiện đạn đạo — PHA CHẠM ĐẤT (gập người, xoay hướng ≤ 7 rad/s) rồi PHA BAY (vận tốc ngang không đổi,
        //  cao = nội suy mặt đứng lúc bật → mặt đứng chỗ đáp + ½gT²u(1−u), core/gravity.js). Chỉ lúc chạm đất mới LẬP KẾ HOẠCH, kiểu "context steering" (Fray, Game AI Pro 2):
        //  thử các hướng quanh hướng muốn (gần hướng muốn trước, giữ bên đã né lần trước ⇒ không lắc), hướng được khi XOAY tại chỗ không quệt vật, CẢ ĐƯỜNG BAY
        //  (mẫu 6 cm) + chỗ đáp thoáng, và nhìn trước thêm 1 cú ("râu dò" của Reynolds) ⇒ rẽ sớm, men theo vật như thỏ chạy dọc hàng rào. Không cú nào được ⇒ xoay
        //  tại chỗ về hướng thoáng xa nhất · lỡ nằm trong vật (bị đặt vào) ⇒ bò dần ra · không còn lượt "xuyên" sau 1,5 s kẹt (chỉ còn van an toàn: kẹt liền > 8 s).
        //  (docs/bunny-movement.md):
        //   · thử va chạm theo Ô CON 3,1 cm (core/collide.js colSub) thay vì ô 12,5 cm ⇒ đi sát cọc mảnh như thỏ thật, không rẽ sớm 6–20 cm;
        //   · lớp va chạm RIÊNG THỎ (lớp 4): ống + dây rào biogas, vách trong suốt (chuồng gà, nhà kính, rào trạm biến áp), chi tiết < 4 cm — trước thỏ đi xuyên;
        //   · viên nang to bằng lưới thỏ: R 0,32 → 0,37 (đùi ±13,8 cm; mông + đuôi, mũi nằm trong);
        //   · ĐỨNG trên mặt vật (bunSup): 4 chân cùng 1 mặt (đất hoặc đỉnh vật ≤ 0,65 m có đáy < đất + 0,49 m — gốc cây, bục, ván, bậc; mặt bàn / sàn chuồng gà trên chân thì không:
        //     thỏ chui gầm được, không "đứng" lên mặt trên đầu) ⇒ nhảy lên / xuống vật như lên bậc đất; chân vắt qua
        //     mép vật thì không đáp (trước: cấm đặt chân lên mọi vật thấp); không đứng trên luống / lòng bếp (ô 2 của lưới dẫn đường);
        //   · kẹt kẽ: xoay quanh MÔNG rồi quanh ĐẦU (thỏ thật trụ chân sau / chân trước, đầu kia quét) trước khi cuộn người (lưới thỏ không cuộn ⇒ đầu / mông lấn vật);
        //   · bảng dẫn đường biết bậc nào qua được (lên ≤ 0,65, xuống ≤ 1,25 — trước bậc ≥ 1,1 m vẫn được dẫn qua rồi kẹt) và không cho đi qua dây / vách lớp 4.
        //   · trần thấp (gầm bàn trà chỗ trú mưa 0,54 m, sàn chuồng gà 0,51 m): nhảy thấp lại cho tai khỏi đâm trần · lỡ nằm trong vật: bò ra về phía ngược vật (trước: chỗ thoáng gần nhất ⇒ có lúc bò xuyên qua ống mảnh).
        const BHOP = { A: -0.32, B: 0.40, R: 0.37, YAW: 7, UP: 0.65, DOWN: 1.25, STEP: 0.06, GAP: 0.45, g: null, o: null, lv: true };   // viên nang theo hệ mô hình thỏ (× scale) · xoay rad/s khi chạm đất · bậc lên / xuống tối đa (m — bậc đất vườn 0,6 m: thỏ thật nhảy cao ~0,6–0,9 m) · khe bay qua tối đa (m)
        const BHOP_OFF = [0]; for (let k = 1; k <= 15; k++) BHOP_OFF.push(k * 0.21, -k * 0.21);   // các hướng thử quanh hướng muốn (±3,15 rad, bước 12°)
        const bunWrap = a => Math.atan2(Math.sin(a), Math.cos(a));
        function bunSeg(ax, az, dx, dz, L2, px, pz) {   // khoảng cách² từ đoạn a → a + d tới điểm p (ô vuông: lọc ô 12,5 cm với bán kính + nửa đường chéo — không sót; ô con 3,1 cm với bán kính + nửa cạnh — đúng khi thân song song cạnh ô, góc ô lấn ≤ 0,65 cm; gọn hơn đo đúng tới cạnh ô)
          const u = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / L2)), x = ax + dx * u - px, z = az + dz * u - pz; return x * x + z * z;
        }
        function bunFree(b, x, z, ang, mk, k = 1, air, y = cowY(x, z), acc) {   // viên nang thân thỏ tại (x, z) hướng ang thoáng trong dải [y + lo, y + hi] (y: mặt đứng) — mọi ô con 3,1 cm cách trục < R · k < 1: thân cuộn lại · air: bay ngang qua (bỏ thử vách bậc) · acc [Σx, Σz, n]: cộng dồn tâm các ô con bị lấn (bunDepen) thay vì dừng ở ô đầu
          if (!COL.ready) return true;
          const s = b.g.scale.x, A = BHOP.A * s * k, B = BHOP.B * s * k, R = BHOP.R * s, C = COL.C, Rc = (R + C * 0.71) ** 2, Rs = (R + C / 8) ** 2, ca = Math.cos(ang), sa = Math.sin(ang);
          const ax = x + ca * A, az = z + sa * A, dx = ca * (B - A), dz = sa * (B - A), bx = ax + dx, bz = az + dz, L2 = dx * dx + dz * dz, lo = y + b.col.lo, hi = y + b.col.hi;
          if (!air) { const mx = (ax + bx) / 2, mz = (az + bz) / 2; for (const [px, pz] of [[bx + ca * R, bz + sa * R], [ax - ca * R, az - sa * R], [mx - sa * R, mz + ca * R], [mx + sa * R, mz - ca * R]]) if (cowY(px, pz) > lo) return false; }   // đầu / mông / 2 sườn không thò vào vách bậc đất (bậc vườn 0,6 m dựng đứng)
          const i0 = Math.floor((Math.min(ax, bx) - R) / C), i1 = Math.floor((Math.max(ax, bx) + R) / C), j0 = Math.floor((Math.min(az, bz) - R) / C), j1 = Math.floor((Math.max(az, bz) + R) / C);
          for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
            const cx = (i + 0.5) * C, cz = (j + 0.5) * C, m = bunSeg(ax, az, dx, dz, L2, cx, cz) < Rc && colSub(mk, cx, cz, lo, hi);   // cột 12,5 cm trong tầm → ô con có vật
            if (m) for (let q = 0; q < 16; q++) { const px = (i + ((q & 3) + 0.5) / 4) * C, pz = (j + ((q >> 2) + 0.5) / 4) * C; if (m >> q & 1 && bunSeg(ax, az, dx, dz, L2, px, pz) < Rs) { if (!acc) return false; acc[0] += px; acc[1] += pz; acc[2]++; } }
          }
          return !acc || !acc[2];
        }
        function bunSup(b, x, z, ang, y0, up = BHOP.UP) {   // mặt đứng dưới chân (mông → ngực, 2 bên ±5 cm): đất hoặc đỉnh vật ≤ y0 + up (lớp chung + chuồng + lớp riêng thỏ — không đứng lên xe; bỏ mặt có đáy cao hơn đất 0,49 m: mặt bàn, sàn chuồng gà — cột giữa hộp chỉ còn mặt trên vì mặt đáy sát đất bị bỏ lúc dựng, nên ngưỡng phải ≥ vật đứng lên được) → độ cao · BHOP.lv: mọi chân cùng mặt (lệch < 4 cm so với đất từng chân — dốc không tính; vắt qua mép vật / luống thì không)
          const s = b.g.scale.x, ca = Math.cos(ang), sa = Math.sin(ang); let e0 = 9, e1 = -9;
          for (const u of [-0.3, 0, 0.26]) for (const w of [-0.13, 0.13]) { const px = x + (ca * u - sa * w) * s, pz = z + (sa * u + ca * w) * s, e = colWalkY(px, pz, y0, up, 21, 0.49) - cowY(px, pz); e0 = Math.min(e0, e); e1 = Math.max(e1, e); }
          BHOP.lv = e1 - e0 < 0.04; return cowY(x, z) + e1;
        }
        function bunSpot(b, x, z, ang, mk, y0) {   // đứng / đáp được tại (x, z) → độ cao mặt đứng (false: không): trên cạn, mọi chân cùng mặt, bậc / vật vừa sức (so với mặt lúc bật y0), không đứng trên luống / lòng bếp, thân thoáng, không đè con khác
          if (!bunOK(x, z)) return false;
          const y = bunSup(b, x, z, ang, y0); if (!BHOP.lv || y - y0 > BHOP.UP || y0 - y > BHOP.DOWN) return false;
          if (y > cowY(x, z) + 0.03 && BUN_NAV && BUN_NAV[Math.round(x2gi(x)) + Math.round(z2gj(z)) * GX] === 2) return false;
          return bunFree(b, x, z, ang, mk, 1, 0, y) && !(COL.movers.length > 1 && colMoverHits(b.col, x, z, ang) > 0.02) ? y : false;
        }
        function bunRay(b, a, cap, mk, pv, kk) {   // xoay quanh điểm cách tâm pv trên trục thân (0 tâm · âm mông · dương đầu) sang hướng a không quệt vật (kk 1: thân thẳng, mẫu 0,25 rad · 0,6: cuộn),
          //  rồi dò chỗ đáp mẫu 6 cm theo a, tối đa cap → chỗ đáp xa nhất (−1: không xoay được) · BHOP.o: tâm sau khi xoay · BHOP.g: khe [g0, g1] không đáp được mà bay qua được
          //  (vách bậc đất, mép vật: thân bay trên mặt cao hơn của 2 bờ, ≤ 0,45 m)
          const d0 = bunWrap(a - b.ang), n = Math.floor(Math.abs(d0) / (kk < 1 ? 0.5 : 0.25)), y0 = b.sy, px = b.x + Math.cos(b.ang) * pv, pz = b.z + Math.sin(b.ang) * pv;
          for (let k = 1; k <= n; k++) { const t = b.ang + d0 * k / (n + 1); if (!bunFree(b, px - Math.cos(t) * pv, pz - Math.sin(t) * pv, t, mk, kk, 0, y0)) return -1; }
          const ox = px - Math.cos(a) * pv, oz = pz - Math.sin(a) * pv, ca = Math.cos(a), sa = Math.sin(a); BHOP.o = [ox, oz];
          if ((Math.abs(d0) > 0.05 || pv) && !(bunOK(ox, oz) && bunFree(b, ox, oz, a, mk, 1, 0, y0))) return -1;   // xoay xong thân thẳng vẫn thoáng
          let s = 0, q = 0, g = null, ys = y0;
          while (q < cap - 1e-6) {
            q = Math.min(cap, q + BHOP.STEP); const y = bunSpot(b, ox + ca * q, oz + sa * q, a, mk, y0);
            if (y !== false) {
              if (q - s > BHOP.STEP + 1e-6) { for (let r = s + BHOP.STEP; r < q - 1e-6; r += BHOP.STEP) if (!bunFree(b, ox + ca * r, oz + sa * r, a, mk, 1, 1, Math.max(ys, y))) { BHOP.g = g; return s; } g = [s, q]; }
              s = q; ys = y;
            } else if (g || q - s >= BHOP.GAP) break;
          }
          BHOP.g = g; return s;
        }
        const bunFit = (L, g) => g && L > g[0] + 1e-6 && L < g[1] - 1e-6 ? g[1] : L;   // sải rơi vào khe ⇒ nhảy vọt qua (đáp sau khe, ≤ 0,45 m xa hơn)
        function bunRoom(b, a, s, mk, kk) {   // chỗ đáp còn xoay được ≥ 0,6 rad về 1 bên (thân thẳng / cuộn như lượt thử) — khỏi đáp vào kẽ chỉ còn đường lùi
          const x = BHOP.o[0] + Math.cos(a) * s, z = BHOP.o[1] + Math.sin(a) * s, y = bunSup(b, x, z, a, b.sy);
          return bunFree(b, x, z, a + 0.6, mk, kk, 0, y) || bunFree(b, x, z, a - 0.6, mk, kk, 0, y);
        }
        function bunBack(b, s, mk) {   // lùi s (giữ hướng thân) theo đường vừa tới — thoáng cả đường
          const ca = Math.cos(b.ang), sa = Math.sin(b.ang), n = Math.ceil(s / BHOP.STEP);
          for (let k = 1; k <= n; k++) { const q = s * k / n; if (bunSpot(b, b.x - ca * q, b.z - sa * q, b.ang, mk, b.sy) === false) return false; }
          return true;
        }
        function bunPlan(b, want, L, look, mk) {   // → [hướng, sải, điểm xoay] — hướng gần hướng muốn nhất mà bay được cả sải (+ nhìn trước 1 cú) · sải âm: lùi · null: không cách nào
          const H = b.hp, bk = H.bk > 0 && H.bk--, sc = b.g.scale.x; bunNav();
          for (const [pv, kk] of [[0, 1], [BHOP.A * sc, 1], [BHOP.B * sc, 1], [0, 0.6]]) {   // lượt 1: xoay quanh tâm, thân thẳng · không được thì lùi ra · lượt 2, 3 (kẹt kẽ): trụ mông / trụ đầu mà xoay (thỏ thật trụ chân sau hoặc chân trước, đầu kia quét) · lượt 4: cuộn người (lưới thỏ không cuộn ⇒ đầu / mông lấn vật — chỉ khi hết cách)
            const sd = H.sd || 1; let t1 = null, t2 = null, bestOpen = -1;
            for (const o0 of BHOP_OFF) {
              const a = want + o0 * sd; if (bk && !pv && kk === 1 && Math.abs(bunWrap(a - H.ba)) < 0.6) continue;   // vừa lùi khỏi ngõ cụt hướng này: 2 lượt sau khỏi lao lại (trước tới 18 cm ↔ lùi 18 cm mãi) — chỉ lượt xoay quanh tâm
              const f = bunRay(b, a, L + look, mk, pv, kk), h = bunFit(L, BHOP.g);
              if (f > bestOpen) { bestOpen = f; H.open = a; }
              if (f >= L + look - 1e-6) { if (o0) H.sd = Math.sign(o0 * sd); return [a, h, pv]; }   // cả cú này + cú sau đều thoáng
              if (!t1 && f >= Math.min(L, 0.12) && bunRoom(b, a, Math.min(h, f), mk, kk)) { if (f >= h - 1e-6) t1 = [a, h, o0]; else if (!t2) t2 = [a, f, o0]; }   // cú này được (cú sau vướng) · cú ngắn — chỗ đáp phải còn xoay được
            }
            const P = t1 || t2; if (P) { if (P[2]) H.sd = Math.sign(P[2] * sd); return [P[0], P[1], pv]; }
            if (!pv && kk === 1) for (const s of [0.18, 0.1]) if (bunBack(b, s, mk)) { H.bk = 2; H.ba = b.ang; return [b.ang, -s, 0]; }   // kẹt trong kẽ: lùi ra (như thỏ thật) rồi mới xoay
          }
          return null;
        }
        function bunTurn(b, d, p) { b.x += p * (Math.cos(b.ang) - Math.cos(b.ang + d)); b.z += p * (Math.sin(b.ang) - Math.sin(b.ang + d)); b.ang += d; }   // xoay d quanh điểm cách tâm p trên trục thân (giữ yên điểm đó)
        function bunDepen(b, dt, mk) {   // lỡ nằm trong vật (bị đặt vào / vật mới dựng) mà không cú nào thoát được: bò thẳng tới chỗ thoáng GẦN NHẤT ≤ 0,4 m/s — tìm 1 lần, giữ đích tới khi tới (trước tìm lại mỗi khung ⇒ 2 khung chọn 2 hướng ngược, lắc 5 mm mãi) · true khi đang bò
          const H = b.hp, A = [0, 0, 0]; if (bunFree(b, b.x, b.z, b.ang, mk, 1, 0, b.sy, A)) { H.dp = null; return false; }
          let D = H.dp;
          if (!D || !bunFree(b, D[0], D[1], b.ang, mk)) {   // thoát VỀ PHÍA NGƯỢC vật — từ trọng tâm các ô con bị lấn ra tâm thân, ±45° trước (trước: chỗ thoáng gần nhất mọi hướng ⇒ đặt lên ống mảnh thì bò XUYÊN qua ống, lấn 22 → 85 đỉnh)
            D = H.dp = null; const e = A[2] ? Math.atan2(b.z - A[1] / A[2], b.x - A[0] / A[2]) : b.ang;
            for (const W of [5, 16]) for (let r = 0.03; r < 0.61 && !D; r += 0.03) for (let k = 0; k < W; k++) { const a = e + (k & 1 ? -1 : 1) * (k + 1 >> 1) * Math.PI / 8, x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r; if (bunOK(x, z) && bunFree(b, x, z, b.ang, mk)) { D = H.dp = [x, z]; break; } }
            if (!D) return false;
          }
          const dx = D[0] - b.x, dz = D[1] - b.z, d = Math.hypot(dx, dz), m = Math.min(d, 0.4 * dt); b.x += dx / d * m; b.z += dz / d * m; if (m >= d) H.dp = null; return true;
        }
        let BUN_NAV = null, BUN_NX = null;
        function bunNav() {   // lưới cấm + bảng dẫn đường về hang / trú mưa theo VA CHẠM THẬT (như chó, animals/dog/brain.js dogNavBuild) — dựng 1 lần khi lớp va chạm xong: bảng gốc (core/flow-field.js) dựng trước hệ biogas, khối xe… ⇒ dẫn thỏ thẳng vào ngõ cụt · → lưới (null: chưa có lớp va chạm)
          if (BUN_NAV || !COL.ready) return BUN_NAV;   //  ô: 1 cấm · 2 vật thấp phủ gần kín (luống, lòng bếp — cấm đi qua lẫn đứng lên) · BUN_NX: cao đất từng ô (bậc lên ≤ 0,65 / xuống ≤ 1,25) + cạnh giữa 2 ô cắt dây / vách lớp thỏ
          const D = bunnyBurrow.door, S = bunnyShelter, K7 = BUN_NAV = ffBlocked.slice(), X = BUN_NX = { h: new Float32Array(FF_N).fill(NaN), e: new Uint8Array(FF_N), up: BHOP.UP, dn: BHOP.DOWN }, m = 30, i0 = Math.max(0, Math.floor(x2gi(Math.min(D.x, S.x) - m))), i1 = Math.min(GX - 2, Math.ceil(x2gi(Math.max(D.x, S.x) + m))), j0 = Math.max(1, Math.floor(z2gj(Math.min(D.z, S.z) - m))), j1 = Math.min(GZ - 2, Math.ceil(z2gj(Math.max(D.z, S.z) + m)));
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
            const n = i + j * GX, x = wx(i), z = wz(j), g = X.h[n] = cowY(x, z); let k = 0, kl = 0;
            for (const [dx, dz] of [[0, 0], [0.16, 0], [-0.16, 0], [0, 0.16], [0, -0.16]]) { if (colHit(23, x + dx, z + dz, g + 0.12, g + 0.5)) k++; else if (colHit(23, x + dx, z + dz, g + 0.03, g + 0.12)) kl++; }
            K7[n] = k >= 2 || isWater(i, j) || padH(i, j) !== null ? 1 : k + kl >= 3 ? 2 : 0;   // vật thấp phủ gần kín ô (luống cà rốt, lòng bếp lửa): đi vòng · vật thấp mảnh (ván, mép đường) để bunHop nhảy qua
            const t4 = (px, pz) => COL.L[4].has(Math.floor(px / 4) * 65536 + Math.floor(pz / 4));   // ô 4 m có vật lớp thỏ
            [[1, 0], [0, 1], [1, 1], [1, -1]].forEach(([a, c], q) => { const ex = wx(i + a) - x, ez = wz(j + c) - z, L = Math.hypot(ex, ez); if (t4(x, z) || t4(x + ex, z + ez)) for (let u = 0.03; u < L; u += 0.0625) { const px = x + ex * u / L, pz = z + ez * u / L, gy = cowY(px, pz); if (colHit(16, px, pz, gy + 0.12, gy + 0.5)) { X.e[n] |= 1 << q; break; } } });   // dây rào, ống trên gối, vách trong suốt: lưới 0,6 m không thấy vật mảnh ⇒ chặn CẠNH cắt qua nó
          }
          bunnyField.set(buildFlowField(S.x, S.z, K7, 1.2, X)); bunnyBurrow.field.set(buildFlowField(D.x, D.z, K7, 0.5, X)); return K7;   // trú mưa: quanh chỗ trú mở 1,2 m (sát vách xe, thỏ bỏ lớp xe ở đó)
        }
        function bunArc(H, a, h, Tf) {   // thời gian bay tối thiểu để đường đạn đạo vượt mặt đất dọc đường (giữa thân + chân trước / sau 8 cm) và đỉnh vật (≤ mặt cao hơn của 2 đầu + 13 cm — vật thấp, mép gốc cây khi nhảy lên): ½gT²u(1−u) ≥ cao − dây cung y0→y1 + 1 cm (≤ 0,9 s ~ cao 1 m)
          const ca = Math.cos(a), sa = Math.sin(a), n = Math.ceil(Math.abs(h) / 0.04), top = Math.max(H.y0, H.y1);
          for (let i = 1; i < n; i++) { const u = i / n; let m = -1e9; for (const o of [-0.08, 0, 0.08]) { const x = H.x0 + ca * (h * u + o), z = H.z0 + sa * (h * u + o); m = Math.max(m, Math.abs(o) < 0.06 ? colWalkY(x, z, top, 0.13, 23) : cowY(x, z)); } const d = m + 0.01 - H.y0 - (H.y1 - H.y0) * u; if (d > 0) Tf = Math.max(Tf, Math.sqrt(2 * d / (GRAV * u * (1 - u)))); }
          return Math.min(Tf, 0.9);
        }
        // 1 khung nhảy theo hướng muốn `want` với tốc độ trung bình v (m/s), hz cú/giây · o: { dd: còn bao xa tới đích (cú cuối đáp đúng đích, không nhìn quá đích),
        //  free: bỏ va chạm (sát đích có vật) } → độ cao thân so với ĐẤT dưới chân (âm = đang gập người lấy đà; đứng trên vật: + cao mặt vật). Tự đặt b.x, b.z, b.ang,
        //  b.hop (pha bay 0…1, 0 khi chạm đất), b.sy (mặt đứng — animals/bunny/body.js đo lại mỗi khung khi không bay).
        function bunHop(b, dt, want, v, hz, o) {
          const T = 1 / hz, H = b.hp || (b.hp = { ph: 'st', s: 0, Ts: 0.12, sd: 1, stuck: 0, fr: -9, plan: null, pt: 0, open: b.ang });
          if (H.fr !== b.fr - 1 || dt <= 0) { H.ph = 'st'; H.s = 0; H.Ts = 0.12; H.plan = null; H.stuck = 0; }   // khung trước không nhảy (mới bắt đầu / bị cắt ngang): đứng lấy đà ngắn tại chỗ
          H.fr = b.fr;   // b.fr: số khung của chú thỏ (bunnyTick đếm)
          if (b.sy === undefined) b.sy = cowY(b.x, b.z);
          const apex = 0.07 + 0.04 * Math.max(0, Math.min(1, (v - 0.5) / 1.1)), Tf = Math.min(0.8 * T, Math.sqrt(8 * apex / GRAV));   // đỉnh 7 cm khi kiếm ăn → 11 cm khi chạy (thỏ chạy sải dài, bay lâu hơn)
          if (H.ph === 'fl') {
            H.u += dt / H.Tf;
            if (H.u < 1) { b.x = H.x0 + (H.x1 - H.x0) * H.u; b.z = H.z0 + (H.z1 - H.z0) * H.u; b.hop = H.u; return H.y0 + (H.y1 - H.y0) * H.u + hopLift(H.u, H.Tf) - cowY(b.x, b.z); }
            b.x = H.x1; b.z = H.z1; b.sy = H.y1; b.hop = 0; H.ph = 'st'; H.s = 0; H.Ts = Math.max(0.08, T - H.Tf); H.plan = null;   // đáp: chạm đúng chỗ + mặt đã thử
          }
          // ---- pha chạm đất: lập kế hoạch cú tới (khi mới đáp, hoặc hướng muốn đã đổi > 0,3 rad lúc sắp bật) → xoay về hướng đó → hết pha thì bật ----
          H.s += dt; b.hop = 0;
          const mk = (b.col ? b.col.mask() : 7) | 16, free = !b.col || (o && o.free) || b.col.ghost > 0, dd = o && o.dd !== undefined ? o.dd : 1e9, ys = () => b.sy - cowY(b.x, b.z);
          const L = Math.min(v * T, dd), look = Math.min(v * T * (v > 1 ? 1.5 : 1), Math.max(0, dd - L));
          if (!H.plan || (H.s >= H.Ts && Math.abs(bunWrap(want - H.want0)) > 0.3)) { H.plan = free ? [want, L, 0] : bunPlan(b, want, L, look, mk); H.want0 = want; }
          if (!free && !H.plan && bunDepen(b, dt, mk)) { H.stuck += dt; H.pt = 0; return ys(); }   // không cú nào thoát (đang lấn vật): bò ra trước đã
          const P = H.plan, pv = P ? P[2] : 0, ta = P ? P[0] : H.open, da = bunWrap(ta - b.ang), st = BHOP.YAW * (1 + Math.max(0, Math.min(1, (v - 0.5) / 1.1))) * dt, ds = Math.max(-st, Math.min(st, da)), sc = b.g.scale.x;   // xoay nhanh dần theo tốc độ: 7 rad/s kiếm ăn → 14 rad/s chạy trốn (zíc-zắc ±0,45 rad mỗi cú không làm chậm)
          if (P || free) bunTurn(b, ds, pv);   // xoay theo kế hoạch (đã thử cả vòng xoay quanh điểm trụ)
          else R: for (const d of [ds, -ds]) for (const p of [0, BHOP.A * sc, BHOP.B * sc]) { bunTurn(b, d, p); if (bunFree(b, b.x, b.z, b.ang, mk, 1, 0, b.sy)) break R; bunTurn(b, -d, p); }   // tìm chỗ thoáng: chỉ xoay khi thân thẳng không quệt vật (quanh tâm / mông / đầu)
          const k = Math.min(1, H.s / H.Ts); H.pt = -0.06 * Math.sin(Math.PI * k);   // gập người: chúc mũi khi vừa đáp, ngóc lên lúc đạp
          if (P && H.s >= H.Ts && Math.abs(bunWrap(P[0] - b.ang)) < 0.12 && Math.abs(P[1]) > 1e-3) {   // bật: bay đúng đường đã thử (sải âm: cú lùi nhỏ)
            bunTurn(b, bunWrap(P[0] - b.ang), pv); H.ph = 'fl'; H.u = 0;
            H.x0 = b.x; H.z0 = b.z; H.x1 = b.x + Math.cos(P[0]) * P[1]; H.z1 = b.z + Math.sin(P[0]) * P[1]; H.y0 = b.sy; H.y1 = free ? cowY(H.x1, H.z1) : bunSup(b, H.x1, H.z1, P[0], b.sy); H.stuck = 0; H.pt = 0;
            H.Tf = bunArc(H, P[0], P[1], Tf * Math.sqrt(Math.max(0.35, Math.abs(P[1]) / Math.max(1e-3, v * T))));   // cú ngắn bay thấp + nhanh hơn · qua mép bậc / lên vật: vọt cao đủ vượt mép
            let ap = GRAV * H.Tf * H.Tf / 8; if (!free) while (ap > 0.01 && !bunFree(b, (H.x0 + H.x1) / 2, (H.z0 + H.z1) / 2, P[0], mk, 1, 1, Math.max(H.y0, H.y1) + ap)) H.Tf = Math.sqrt(8 * (ap /= 2) / GRAV);   // trần thấp (gầm bàn trà ở chỗ trú mưa 0,54 m, sàn chuồng gà 0,51 m) ⇒ nhảy thấp lại cho tai (0,47 m) khỏi đâm trần
            return ys();
          }
          if (!P && H.s >= H.Ts) { H.stuck += dt; if (H.s > H.Ts + 0.35) { H.plan = null; H.s = H.Ts; } if (H.stuck > 8 && b.col) { b.col.ghost = 2; H.stuck = 0; } }   // không cú nào ổn: xoay về chỗ thoáng, thử lại · kẹt liền > 8 s: van an toàn
          return ys() - 0.012 * Math.sin(Math.PI * k);   // thân hạ 1,2 cm giữa pha chạm đất
        }
        const bunAir = b => !!(b.hp && b.hp.ph === 'fl' && b.fr - b.hp.fr <= 1);   // đang bay dở (đừng cắt ngang cú nhảy)
