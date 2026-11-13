        // ---- CÁ KOI BƠI THƯỜNG NGÀY: nhánh lang thang của fishWanderTick (animals/fish/fish.js) ----
        //  · tốc độ: quẫy – lướt (đuôi quẫy tăng tốc, rồi thân duỗi lướt chậm dần theo lực cản ∝ v²); nhịp đuôi theo tốc độ, ≈ 0,6 thân / nhịp
        //  · hướng: điểm hẹn trong vùng quen (có khi theo điểm hẹn của con khác) + nhiễu; tốc độ xoay có quán tính; nghiêng thân vào cua, uốn thân theo chiều rẽ
        //  · bờ: 3 râu dò (thẳng, ± 37°) lái về phía nước mở; tâm thân + mũi không vào ô đất / ô nước nông hơn KOI_MIN_DEPTH
        //  · độ sâu: đích đổi chậm, tốc độ đứng ≤ 0,12 m/s, chúi / ngóc theo tốc độ đứng; bậc đáy phía trước cao hơn ⇒ nổi lên trước khi tới
        //  · nghỉ lơ lửng (giữa đường, dưới lá sen), rỉa cụm cây thuỷ sinh, ngoi lên đớp mặt nước
        // Trạng thái: f.C. Tập tính khác (fishLife, đuổi lá, câu) chen vào ⇒ khung đầu quay lại tự khớp vị trí / tốc độ đang có (koiTick lệch)
        const KOI_SPOTS = [];   // chỗ ghé + vật cản mềm dưới nước: { x, z, r, top, kind: 'plant' | 'pad', nudge?(k) } — nature/water-plants.js điền
        const KOI_MIN_DEPTH = 0.55;
        let koiTick = 0;
        const koiOpen = (x, z) => { const i = Math.round(x2gi(x)), j = Math.round(z2gj(z)); return waterCell(i, j) && waterBaseY(j) - riverBedY(i, j) >= KOI_MIN_DEPTH; };
        const koiWrap = a => { while (a > Math.PI) a -= TAU; while (a < -Math.PI) a += TAU; return a; };
        const koiRnd = (a, b) => a + Math.random() * (b - a), koiCl = (v, a, b) => v < a ? a : v > b ? b : v;
        const koiBed = (x, z, or) => { const i = Math.round(x2gi(x)), j = Math.round(z2gj(z)); return waterCell(i, j) ? riverBedY(i, j) : or; };
        function koiLeave(f, C) { if (C.spot && C.spot.by === f) C.spot.by = null; C.spot = null; }
        function koiWaypoint(f, C) {
          koiLeave(f, C); C.tW = koiRnd(6, 14); const lvl = f.base.y + 0.62, hh = liveWeather.localHour, noon = hh > 11 && hh < 15;
          if (KOI_SPOTS.length && Math.random() < (noon ? 0.4 : 0.28)) {   // ghé cụm cây / bóng lá sen (trưa nắng: hay tìm bóng hơn)
            const S = KOI_SPOTS[(Math.random() * KOI_SPOTS.length) | 0];
            if (S !== C.lastSpot && !S.by && Math.hypot(S.x - f.base.x, S.z - f.base.z) < f.rad + 4 && Math.abs(waterBaseY(Math.round(z2gj(S.z))) - lvl) < 0.8) {
              const pl = S.kind === 'plant', a = pl ? Math.atan2(f.cz - S.z, f.cx - S.x) + koiRnd(-0.7, 0.7) : Math.random() * TAU, d = pl ? S.r + 0.45 : S.r * 0.4 * Math.random(), x = S.x + Math.cos(a) * d, z = S.z + Math.sin(a) * d;
              if (koiOpen(x, z)) { C.spot = C.lastSpot = S; S.by = f; C.wx = x; C.wz = z; C.tW = 24; return; }
            }
          }
          if (Math.random() < 0.35) {   // đi cùng: lấy điểm hẹn của một con cùng mặt nước, lệch ~1 m
            const o = fishies[(Math.random() * fishies.length) | 0], O = o.C;
            if (o !== f && O && !O.spot && Math.abs(o.base.y - f.base.y) < 0.8) {
              const a = Math.random() * TAU, x = O.wx + Math.cos(a) * 1.1, z = O.wz + Math.sin(a) * 1.1;
              if (koiOpen(x, z) && Math.hypot(x - f.base.x, z - f.base.z) < f.rad + 2) { C.wx = x; C.wz = z; return; }
            }
          }
          for (let n = 0; n < 8; n++) {
            const a = Math.random() * TAU, r = f.rad * Math.sqrt(Math.random()), x = f.base.x + Math.cos(a) * r, z = f.base.z + Math.sin(a) * r;
            if (koiOpen(x, z) && Math.hypot(x - f.cx, z - f.cz) > 1.2) { C.wx = x; C.wz = z; return; }
          }
          C.wx = f.base.x; C.wz = f.base.z;
        }
        function fishCruise(f, dt, t) {
          const C = f.C || (f.C = { v: f.vmag * 0.7, om: 0, omS: 0, n: 0, kick: 1, tK: koiRnd(0.5, 1.5), amp: 1, rate: 1, roll: 0, vy: 0, y: f.g.position.y, yT: f.base.y, tY: 0, mode: 'cruise', tM: 0, tB: 1,
            side: Math.random() < 0.5 ? -1 : 1, blk: 0, tSip: koiRnd(15, 110), fr: -9, a0: f.ang, wx: f.base.x, wz: f.base.z, tW: 0, spot: null, lastSpot: null });
          if (C.fr !== koiTick - 1) {   // vừa rời tập tính khác: giữ chỗ, độ sâu, tốc độ đang có rồi lướt tiếp
            C.v = Math.min(f.chaseV > 0 ? f.chaseV : C.v, 1.4); C.y = f.g.position.y; C.vy = koiCl(f.vyS || 0, -0.3, 0.3); C.om = C.omS = 0; C.a0 = f.ang; C.mode = 'cruise'; C.kick = 0; C.tK = 0.6; C.tY = 0; koiWaypoint(f, C);
          }
          C.fr = koiTick;
          const vT = f.vmag * (f.vk || 1), ci = Math.round(x2gi(f.cx)), cj = Math.round(z2gj(f.cz)), wet = waterCell(ci, cj), surf = waterBaseY(cj), bed = wet ? riverBedY(ci, cj) : C.y - 0.3, open = wet && surf - bed >= KOI_MIN_DEPTH;
          const wary = f.L && f.L.wary > 0, S = C.spot;
          // --- việc đang làm ---
          let dx = C.wx - f.cx, dz = C.wz - f.cz, dW = Math.hypot(dx, dz);
          let vGoal = vT, pitchGoal = null, yGoal, topGap = 0.12, still = false;
          C.tW -= dt;
          if (C.mode === 'cruise') {
            if (S && S.kind === 'plant') {   // cụm cây: điểm hẹn luôn ở rìa phía mình ⇒ tới nơi mặt đã hướng vào cụm, không bơi xuyên cụm; tới gần thì chậm lại
              const ex = f.cx - S.x, ez = f.cz - S.z, k = (S.r + 0.45) / (Math.hypot(ex, ez) || 1), x = S.x + ex * k, z = S.z + ez * k;
              if (koiOpen(x, z)) { C.wx = x; C.wz = z; dx = x - f.cx; dz = z - f.cz; dW = Math.hypot(dx, dz); }
              vGoal = Math.min(vGoal, 0.1 + dW * 0.5);
            }
            if (dW < (S ? 0.35 : 0.7) || C.tW <= 0) {
              if (S && dW < 0.35) { C.mode = S.kind === 'plant' ? 'nibble' : 'hover'; C.tM = S.kind === 'plant' ? koiRnd(3, 6.5) : koiRnd(5, 11); C.tB = 0.6; if (S.kind === 'pad') C.yT = surf - koiRnd(0.26, 0.4); }
              else if (open && !wary && Math.random() < 0.2) { C.mode = 'hover'; C.tM = koiRnd(2.5, 7); koiLeave(f, C); }
              else koiWaypoint(f, C);
            }
            if ((C.tSip -= dt) <= 0 && open && !wary && !C.spot) { C.mode = 'sip'; C.tM = 7; }
          } else if ((C.tM -= dt) <= 0 || wary || !open) { C.mode = 'cruise'; C.kick = 1; C.tK = koiRnd(0.8, 1.5); C.tY = 0; C.tSip = Math.max(C.tSip, koiRnd(20, 60)); koiWaypoint(f, C); }
          if (C.mode === 'hover') { vGoal = 0.03; still = true; }
          else if (C.mode === 'nibble' && C.spot) {
            const P = C.spot; still = true; pitchGoal = -0.24; dx = P.x - f.cx; dz = P.z - f.cz; C.yT = P.top - 0.1;
            const gap = Math.hypot(dx, dz) - P.r - f.mouth.x, face = Math.abs(koiWrap(Math.atan2(dz, dx) - f.ang)) < 0.5;   // miệng cách rìa cụm
            vGoal = face && gap > 0.05 ? 0.1 : 0;   // quay mặt vào rồi mới nhích tới sát rìa cụm
            if ((C.tB -= dt) <= 0) {   // mổ một cái: nhích tới, cụm cây rung, thỉnh thoảng nhả bọt
              if (!face) C.tB = 0.3;
              else {
                C.tB = koiRnd(1.1, 2.3); if (gap > -0.05) C.v += 0.1; if (P.nudge) P.nudge(1);
                if (Math.random() < 0.35) waterFx.bubbles(f.cx + Math.cos(f.ang) * f.mouth.x, C.y, f.cz + Math.sin(f.ang) * f.mouth.x, 1);
              }
            }
          } else if (C.mode === 'sip') {   // ngoi lên đớp mặt nước rồi lặn lại
            const top = waterSurfaceY(f.cx, f.cz); vGoal = 0.22; pitchGoal = 0.3; topGap = 0.05; C.yT = top;
            if (C.y + Math.sin(f.pitch || 0) * f.mouth.x > top - 0.015) {   // miệng chạm mặt nước
              const mx = f.mouth.x * Math.cos(f.pitch || 0);
              waterFx.ring(f.cx + Math.cos(f.ang) * mx, surf, f.cz + Math.sin(f.ang) * mx, 0.16);
              C.mode = 'cruise'; C.yT = surf - koiRnd(0.5, 0.95); C.tY = 5; C.kick = 1; C.tK = 1.2;
              C.tSip = koiRnd(45, 130) * ((liveWeather.state.temperature ?? 24) > 24 ? 0.6 : 1);   // nước ấm ít oxy hơn ⇒ ngoi thường hơn
            }
          }
          // --- hướng: điểm hẹn + nhiễu, râu dò bờ, cụm cây ---
          const hx = Math.cos(f.ang), hz = Math.sin(f.ang), Lk = Math.min(0.7 + C.v * 1.5, Math.max(0.3, dW));   // sát điểm hẹn: râu ngắn lại (điểm hẹn cạnh bờ vẫn tới được)
          C.n += -C.n / 3 * dt + 0.55 * Math.sqrt(dt) * (Math.random() + Math.random() + Math.random() - 1.5) * 2;
          let omT, turnK = 1, sepY = 0;
          if (!open) omT = koiCl(koiWrap(Math.atan2(f.base.z - f.cz, f.base.x - f.cx) - f.ang) * 2, -2.4, 2.4);   // lạc vào chỗ nông (sau cú lao, sau khi được thả): về vùng quen
          else {
            const a1 = f.ang - 0.65, a2 = f.ang + 0.65;
            const fr = still || (koiOpen(f.cx + hx * Lk, f.cz + hz * Lk) && koiOpen(f.cx + hx * Lk * 0.5, f.cz + hz * Lk * 0.5));   // đang đứng (nghỉ, rỉa cây): không dò bờ
            const lf = still || koiOpen(f.cx + Math.cos(a1) * Lk * 0.8, f.cz + Math.sin(a1) * Lk * 0.8), rt = still || koiOpen(f.cx + Math.cos(a2) * Lk * 0.8, f.cz + Math.sin(a2) * Lk * 0.8);
            if (!fr) {
              if (lf !== rt) C.side = rt ? 1 : -1;
              omT = C.side * 2.3;
              if ((C.blk += dt) > 1.5) { C.blk = 0; C.mode = 'cruise'; koiWaypoint(f, C); }
            } else {
              C.blk = Math.max(0, C.blk - dt);
              omT = C.mode === 'hover' ? C.n * 0.25 : koiCl(koiWrap(Math.atan2(dz, dx) + (still ? 0 : C.n) - f.ang) * 1.3, -1.3, 1.3);
              if (!lf) omT += 1; if (!rt) omT -= 1;
              if (!still) for (const P of KOI_SPOTS) {   // cụm cây: lách qua bên (trừ cụm đang ghé); đang đứng thì cụm bên cạnh không đẩy hướng
                if (P.kind !== 'plant' || P === C.spot || C.y > P.top + 0.08) continue;
                const ex = P.x - f.cx, ez = P.z - f.cz, al = ex * hx + ez * hz, la = ez * hx - ex * hz, R = P.r + 0.2;
                if (al > -R * 0.5 && al < Lk + R && Math.abs(la) < R) omT -= (la >= 0 ? 1 : -1) * 1.6 * (1 - Math.max(0, al) / (Lk + R));
              }
              if (!still) for (const o of fishies) {   // con khác ngay trước mũi, cùng tầng nước: chậm lại, lách sang bên
                const oy = o.g.position.y; if (o === f || o.cx === undefined || Math.abs(oy - C.y) > 0.16) continue;
                const ex = o.cx - f.cx, ez = o.cz - f.cz, al = ex * hx + ez * hz, la = ez * hx - ex * hz, d = Math.hypot(ex, ez);
                if (al > 0.05 && al < 0.8 + f.len * 0.5 && Math.abs(la) < 0.26) { vGoal = Math.min(vGoal, vT * 0.5); omT += la >= 0 ? -0.9 : 0.9; }
                if (d < 0.55) { const k = 1 - d / 0.55; sepY += ((C.y - oy) || (f.ph - o.ph)) > 0 ? 0.16 * k : -0.16 * k; omT += (la >= 0 ? -1.4 : 1.4) * k; if (al > 0 && d < 0.34) vGoal = Math.min(vGoal, vT * 0.12); }   // sát nhau: tách tầng + rẽ ra
              }
              turnK = C.mode === 'nibble' ? 0.7 : 0.35 + 0.65 * Math.min(1, C.v / Math.max(0.05, vT));   // rỉa cây: xoay tại chỗ bằng vây ngực, quay mặt vào cụm
            }
          }
          omT = koiCl(omT, -2.4, 2.4) * turnK;
          C.om += (omT - C.om) * (1 - Math.exp(-dt / 0.35));
          f.ang += C.om * dt;
          const omM = koiCl(koiWrap(f.ang - C.a0) / Math.max(1e-4, dt), -4, 4); C.a0 = f.ang;   // tốc độ xoay thật (gồm cả phần bơi theo đàn sửa hướng)
          C.omS += (omM - C.omS) * Math.min(1, dt * 5);
          // --- tốc độ: quẫy – lướt ---
          let ampGoal, rateGoal;
          if (still) { C.v += (vGoal - C.v) * (1 - Math.exp(-dt / 0.9)); ampGoal = 0.24; rateGoal = 0.6; C.kick = 0; }
          else {
            C.tK -= dt;
            if (C.kick) { C.v += (vGoal * 1.35 - C.v) * (1 - Math.exp(-dt / 0.45)); if (C.tK <= 0) { C.kick = 0; C.tK = koiRnd(1.2, 3.2); } }
            else {
              C.v -= C.v * C.v / (2.4 * Math.max(0.1, vGoal)) * dt;
              if (C.v < vGoal * 0.62 || (C.tK <= 0 && C.v < vGoal * 1.1) || (Math.abs(omT) > 1.1 && C.v < vGoal)) { C.kick = 1; C.tK = koiRnd(0.8, 1.7); }
            }
            ampGoal = C.kick ? 1 : 0.14; rateGoal = C.kick ? Math.max(0.85, C.v / (0.6 * f.len) / 1.035) : 0.4;
          }
          C.amp += (ampGoal - C.amp) * Math.min(1, dt * (C.kick ? 7 : 3)); C.rate += (rateGoal - C.rate) * Math.min(1, dt * 5);
          // --- tiến: tâm thân + mũi phải ở nước mở ---
          const h2x = Math.cos(f.ang), h2z = Math.sin(f.ang), st = C.v * dt, nx = f.cx + h2x * st, nz = f.cz + h2z * st, ns = 0.32 * f.len / 0.66;
          const hit = fishBodyHit(f, nx, nz, C.y);   // chờ rẽ / tách tầng xong
          if (!open) { if (!wet || C.blk > 2.5 || waterCell(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { f.cx = nx; f.cz = nz; } else C.blk += dt; }   // kẹt ở mép nông quá 2,5 s: cho băng qua
          else if (!hit && koiOpen(nx, nz) && koiOpen(nx + h2x * ns, nz + h2z * ns) && koiBed(nx, nz, bed) + 0.08 <= C.y) { f.cx = nx; f.cz = nz; }   // bậc đáy cao hơn thân: nổi lên đã
          else C.v *= Math.exp(-dt * 4);
          // --- độ sâu ---
          if (C.mode === 'cruise' && (C.tY -= dt) <= 0) { C.tY = koiRnd(5, 12); C.yT = surf - (0.25 + Math.pow(Math.random(), 1.6) * Math.min(1.3, Math.max(0, surf - bed - 0.6))); }
          yGoal = C.yT + (C.mode === 'cruise' ? (f.dz || 0) : 0);
          const vyT = koiCl((yGoal - C.y) * 0.7, -0.12, 0.12) * (C.mode === 'sip' ? 1.6 : 1) + sepY;
          C.vy += (vyT - C.vy) * (1 - Math.exp(-dt / 0.7));
          const floor = Math.max(bed, koiBed(f.cx + h2x * Lk, f.cz + h2z * Lk, bed), koiBed(f.cx + h2x * Lk * 0.5, f.cz + h2z * Lk * 0.5, bed)) + 0.16;
          if (C.y < floor) C.vy = Math.max(C.vy, Math.min(0.6, (floor - C.y) * 3));   // bậc đáy cao hơn ở trước mặt: nổi lên sớm
          C.y += C.vy * dt;
          C.y = Math.min(waterSurfaceY(f.cx, f.cz) - topGap, Math.max(bed + 0.08, C.y));
          const pT = pitchGoal ?? koiCl(Math.atan2(C.vy, Math.max(0.18, C.v)) * 0.8, -0.3, 0.3);
          f.pitch = (f.pitch || 0) + (pT - (f.pitch || 0)) * Math.min(1, dt * 2.5);
          // --- đặt thân ---
          f.dy = C.y - f.base.y; f.chaseV = C.v; f.vyS = C.vy;
          f.wob += (koiCl(C.omS * 0.8, -1.1, 1.1) - f.wob) * Math.min(1, dt * 6);
          f.roll = C.roll += (koiCl(C.omS * C.v * 0.4, -0.28, 0.28) - C.roll) * Math.min(1, dt * 4);
          f.g.position.set(f.cx, C.y, f.cz); f.g.rotation.set(C.roll, -f.ang, f.pitch);   // thứ tự 'YZX': x = nghiêng quanh trục thân
          f.swT = (f.swT ?? t) + dt * C.rate; f.swim(f.swT, f.wob, C.amp);
        }
