        // ĐƯỜNG TRÈO CỦA GẤU MÈO: dãy điểm trên MẶT VỎ THẬT quanh trục thân → chuỗi cành (hệ cây), tính 1 lần lúc lập kế hoạch.
        // Mặt vỏ = lưới vỏ dựng lại trên CPU (`userData.barkGeo`, lưới đang vẽ đã giải phóng mảng đỉnh) + lưới ô `triGrid`: tia từ ngoài bắn vào trục ⇒ lớp vỏ ngoài cùng.
        // Góc lăn quanh trục chọn bằng quy hoạch động: cành nghiêng ⇒ lên mặt trên (trọng lực); cành dựng ⇒ mặt nào cũng được; chỗ thân mình vướng cành khác / quả khác
        // (khoảng hở tới các ống cành `capsule`) ⇒ né; lăn nhanh, nhảy sang mặt cành khác ⇒ phạt. Chạc dày cành: mặt trên của cành dựng chĩa VÀO lòng chạc (gỗ đặc) ⇒ đi mặt ngoài rồi lăn dần lên.
        function raccoonRoute(Tr, G, geo, chain, kq, n0, target) {   // geo: lưới vỏ CPU (người gọi dựng 1 lần cho mọi đường thử)
          const V = THREE.Vector3, segs = G.segs, DS = 0.05, K = 16, HB = 0.34, TUBE = 0.9, LAT = 0.16, dPh = 2 * Math.PI / K, cl = (x, a, b) => Math.max(a, Math.min(b, x));
          // 1) trục: thân rồi chuỗi cành (đầu, giữa đường cong thật, cuối), bán kính ống = bán kính đoạn × TUBE
          const cp = [], cr = [], ids = G.trunk.concat(chain);
          ids.forEach((si, n) => {
            const g = segs[si], a = new V(g[0], g[1], g[2]), b = new V(g[3], g[4], g[5]), m = g.length > 10 ? new V(g[8], g[9], g[10]) : a.clone().lerp(b, 0.5);
            let pts = [[a, g[6]], [m, (g[6] + g[7]) / 2], [b, g[7]]];
            if (n === ids.length - 1 && kq < 1) pts = kq <= 0.5 ? [pts[0], [a.clone().lerp(m, kq / 0.5), g[6] + (g[7] - g[6]) * kq]] : [pts[0], pts[1], [m.clone().lerp(b, (kq - 0.5) / 0.5), g[6] + (g[7] - g[6]) * kq]];
            pts.forEach(([p, r], q) => { if (cp.length && (q === 0 || p.distanceTo(cp[cp.length - 1]) < 1e-4)) return; cp.push(p); cr.push(r * TUBE); });
          });
          const lc = [0]; for (let i = 1; i < cp.length; i++) lc.push(lc[i - 1] + cp[i].distanceTo(cp[i - 1]));
          const Lc = lc[lc.length - 1], N = Math.max(8, Math.ceil(Lc / DS) + 1), C = [], Rr = [], sFork = lc[Math.min(lc.length - 1, 2 * G.trunk.length)];
          for (let i = 0, q = 1; i < N; i++) { const s = Lc * i / (N - 1); while (q < lc.length - 1 && lc[q] < s) q++; const f = cl((s - lc[q - 1]) / Math.max(1e-6, lc[q] - lc[q - 1]), 0, 1); C.push(cp[q - 1].clone().lerp(cp[q], f)); Rr.push(cr[q - 1] + (cr[q] - cr[q - 1]) * f); }
          const blur = (A, n, mix) => { for (let it = 0; it < n; it++) { let p = mix(A[0]); for (let i = 1; i < A.length - 1; i++) { const c = mix(A[i]); A[i] = mix(p, A[i], A[i + 1]); p = c; } } };
          blur(C, 2, (a, b, c) => b ? a.clone().add(c).addScaledVector(b, 2).multiplyScalar(0.25) : a.clone()); blur(Rr, 3, (a, b, c) => b === undefined ? a : (a + 2 * b + c) / 4);
          const T = C.map((c, i) => C[Math.min(N - 1, i + 1)].clone().sub(C[Math.max(0, i - 1)]).normalize()), E1 = [], E2 = [];
          for (let i = 0, e = n0.clone(); i < N; i++) { e = e.clone().addScaledVector(T[i], -e.dot(T[i])).normalize(); E1.push(e); E2.push(new V().crossVectors(T[i], e)); }
          // 2) ống cành cả cây (2 nửa / đoạn) + quả khác còn trên cây: khoảng hở cho thân mình + đuôi
          const cap = [];
          for (const g of segs) { const hm = g.length > 10, mx = hm ? g[8] : (g[0] + g[3]) / 2, my = hm ? g[9] : (g[1] + g[4]) / 2, mz = hm ? g[10] : (g[2] + g[5]) / 2, rm = (g[6] + g[7]) / 2 * TUBE; cap.push(g[0], g[1], g[2], mx, my, mz, g[6] * TUBE, rm, mx, my, mz, g[3], g[4], g[5], rm, g[7] * TUBE); }
          for (const ap of Tr.userData.apples) if (ap !== target && ap.on) cap.push(ap.home.x, ap.home.y, ap.home.z, ap.home.x, ap.home.y, ap.home.z, Tr.userData.appleR, Tr.userData.appleR);
          const sd1 = (c, x, y, z) => { const ax = cap[c], ay = cap[c + 1], az = cap[c + 2], dx = cap[c + 3] - ax, dy = cap[c + 4] - ay, dz = cap[c + 5] - az, L2 = dx * dx + dy * dy + dz * dz, k = L2 > 1e-10 ? cl(((x - ax) * dx + (y - ay) * dy + (z - az) * dz) / L2, 0, 1) : 0;
            return Math.hypot(x - ax - dx * k, y - ay - dy * k, z - az - dz * k) - (cap[c + 6] + (cap[c + 7] - cap[c + 6]) * k); };
          const sd = (L, x, y, z) => { let b = 9; for (let n = 0; n < L.length; n++) { const d = sd1(L[n], x, y, z); if (d < b) b = d; } return b; };
          const near = []; for (let i = 0; i < N; i += 3) { const L = [], c = C[i]; for (let q = 0; q < cap.length; q += 8) if (sd1(q, c.x, c.y, c.z) < Rr[i] + 0.85) L.push(q); near.push(L); }
          const nearOf = i => near[Math.min(near.length - 1, i / 3 | 0)];
          // 3) mặt vỏ: tia từ ngoài (bán kính ống + HB) vào trục
          const box = [9, 9, 9, -9, -9, -9];
          for (const c of C) { box[0] = Math.min(box[0], c.x - 0.9); box[1] = Math.min(box[1], c.y - 0.9); box[2] = Math.min(box[2], c.z - 0.9); box[3] = Math.max(box[3], c.x + 0.9); box[4] = Math.max(box[4], c.y + 0.9); box[5] = Math.max(box[5], c.z + 0.9); }
          const grid = triGrid(geo.attributes.position.array, geo.index.array, 0.2, box), _d = new V(), _l = new V(), _p = new V();
          const dir = (i, ph, o) => o.copy(E1[i]).multiplyScalar(Math.cos(ph)).addScaledVector(E2[i], Math.sin(ph));
          const rho = (i, d) => { const Rs = Rr[i] + HB, c = C[i], t = grid.ray(c.x + d.x * Rs, c.y + d.y * Rs, c.z + d.z * Rs, -d.x, -d.y, -d.z, Rs); return t < 0 ? Rr[i] : Rs - t; };
          // 4) giá từng (mẫu, góc lăn) rồi quy hoạch động
          const cost = [], rhoT = [];
          for (let i = 0; i < N; i++) {
            const cs = new Float32Array(K), rs = new Float32Array(K), c = C[i], L = nearOf(i), t = T[i], incl = Math.sqrt(Math.max(0, 1 - t.y * t.y)), gI = cl((incl - 0.3) / 0.45, 0, 1) * (i >= N - 12 ? 3 : 1);
            for (let k = 0; k < K; k++) {
              dir(i, k * dPh, _d); const r = rs[k] = rho(i, _d), Rs = Rr[i] + HB; let w = 0;
              if (sd(L, c.x + _d.x * Rs, c.y + _d.y * Rs, c.z + _d.z * Rs) < 0.01) w += 30;   // gốc tia nằm trong gỗ khác
              _p.copy(c).addScaledVector(_d, r + 0.13); w += 25 * Math.max(0, 0.10 - sd(L, _p.x, _p.y, _p.z)) / 0.10;   // thân
              _l.crossVectors(t, _d); for (const sg of [-0.11, 0.11]) w += 12 * Math.max(0, 0.03 - sd(L, _p.x + _l.x * sg, _p.y + _l.y * sg, _p.z + _l.z * sg)) / 0.03;   // 2 bên sườn
              _p.copy(c).addScaledVector(_d, r + 0.27); w += 25 * Math.max(0, 0.06 - sd(L, _p.x, _p.y, _p.z)) / 0.06;   // lưng / đầu
              w += 10 * Math.max(0, r - Rr[i] - 0.1) / 0.1;   // đứng trên mặt cành khác
              if (incl > 0.05) w += 6 * gI * (1 - (_d.y - t.y * _d.dot(t)) / incl) / 2;   // trọng lực: lên mặt trên
              cs[k] = w;
            }
            cost.push(cs); rhoT.push(rs);
          }
          let prev = new Float64Array(K).fill(1e9); prev[0] = cost[0][0]; const back = [null];
          for (let i = 1; i < N; i++) {
            const cur = new Float64Array(K), bk = new Int8Array(K), dR = Rr[i] - Rr[i - 1];
            for (let k = 0; k < K; k++) { let best = 1e9;
              for (let dk = -1; dk <= 1; dk++) { const k0 = (k - dk + K) % K; if (prev[k0] >= 1e9) continue; const r0 = rhoT[i - 1][k0], r1 = rhoT[i][k], lat = dk ? (r0 + r1) * 0.5 * dPh / DS : 0, w = prev[k0] + 0.5 * lat * lat + 1.5 * Math.abs(dk) + 100 * Math.max(0, Math.abs(r1 - r0 - dR) - 0.02); if (w < best) { best = w; bk[k] = dk; } }
              cur[k] = Math.min(1e9, best + cost[i][k]); }
            back.push(bk); prev = cur;
          }
          let kEnd = 0; for (let k = 1; k < K; k++) if (prev[k] < prev[kEnd]) kEnd = k;
          const ks = new Int16Array(N); ks[N - 1] = kEnd; for (let i = N - 1; i > 0; i--) ks[i - 1] = ks[i] - back[i][((ks[i] % K) + K) % K];
          const ph = Array.from(ks, k => (k - ks[0]) * dPh); blur(ph, 4, (a, b, c) => b === undefined ? a : (a + 2 * b + c) / 4);
          // 5) điểm mặt vỏ dưới thân + chỗ đặt chân 2 bên (FL: phía t × n, FR: phía kia)
          const P = [], Nn = [], Rp = [], FL = [], FR = [], NL = [], NR = [], _g = new V(), _h = new V();
          for (let i = 0; i < N; i++) {
            dir(i, ph[i], _d); const r = rho(i, _d), lat = Math.min(LAT, 0.85 * r), eps = cl(0.06 / Math.max(r, 0.02), 0.12, 0.6);
            P.push(C[i].clone().addScaledVector(_d, r)); Nn.push(_d.clone()); Rp.push(r);
            for (const sg of [1, -1]) {   // chỗ đặt chân: tia lệch góc del; trúng vỏ cành khác / hụt (lệch > 0,08 so với dưới thân) ⇒ thu chân vào gần đường
              let f = null, n = null;
              for (let m = 1; m > 0.2 && !f; m *= 0.5) {
                const del = Math.asin(Math.min(0.95, m * lat / Math.max(r, 0.02))); dir(i, ph[i] + sg * del, _l); const rf = rho(i, _l); if (Math.abs(rf - r) > 0.08) continue;
                f = C[i].clone().addScaledVector(_l, rf); n = _l.clone();
                dir(i, ph[i] + sg * (del + eps), _g); const rb = rho(i, _g); dir(i, ph[i] + sg * (del - eps), _h); const ra = rho(i, _h);   // tiếp tuyến ngang của mặt vỏ quanh chỗ đặt chân
                n.lat = Math.abs(rb - rf) < 0.08 && Math.abs(ra - rf) < 0.08 ? _g.clone().multiplyScalar(rb).addScaledVector(_h, -ra) : null;
              }
              if (!f) { f = P[i].clone(); n = _d.clone(); n.lat = null; }
              (sg > 0 ? FL : FR).push(f); (sg > 0 ? NL : NR).push(n);
            }
          }
          for (const [F, Nf] of [[FL, NL], [FR, NR]]) {   // pháp tuyến THẬT của vỏ tại chỗ đặt chân (tiếp tuyến dọc × ngang); gãy > 60° so với hướng kính ⇒ giữ hướng kính
            for (let i = 0; i < N; i++) { const n = Nf[i]; if (!n.lat) continue;
              _g.copy(F[Math.min(N - 1, i + 1)]).sub(F[Math.max(0, i - 1)]); if (_g.length() > 6 * DS) _g.copy(T[i]);
              _h.crossVectors(_g, n.lat); const l = _h.length(); if (l < 1e-8) continue; _h.multiplyScalar((_h.dot(n) < 0 ? -1 : 1) / l); if (_h.dot(n) > 0.5) n.copy(_h); }
            blur(Nf, 1, (a, b, c) => b ? a.clone().add(c).addScaledVector(b, 2).normalize() : a.clone());
          }
          blur(P, 2, (a, b, c) => b ? a.clone().add(c).addScaledVector(b, 2).multiplyScalar(0.25) : a.clone());
          const L = [0]; for (let i = 1; i < N; i++) L.push(L[i - 1] + P[i].distanceTo(P[i - 1]));
          const Tg = P.map((p, i) => P[Math.min(N - 1, i + 1)].clone().sub(P[Math.max(0, i - 1)]).normalize()), total = L[N - 1], S = G.S;
          { const a1 = 0.045 / S, a2 = 0.022 / S, hi = 0.05 / S;   // bàn chân không lún gờ vỏ: 4 tia quanh chỗ đặt (dọc ± 0,045 m, ngang ± 0,022 m) theo −pháp tuyến; vỏ nhô khỏi mặt đế ⇒ nâng chỗ đặt (≤ 0,03 m)
            for (const [F, Nf] of [[FL, NL], [FR, NR]]) for (let i = 0; i < N; i++) { const f = F[i], n = Nf[i]; _g.copy(T[i]).addScaledVector(n, -T[i].dot(n)).normalize(); _h.crossVectors(n, _g); let up = 0;
              for (const [x, y] of [[a1, 0], [-a1, 0], [0, a2], [0, -a2]]) { const t = grid.ray(f.x + _g.x * x + _h.x * y + n.x * hi, f.y + _g.y * x + _h.y * y + n.y * hi, f.z + _g.z * x + _h.z * y + n.z * hi, -n.x, -n.y, -n.z, hi); if (t >= 0 && hi - t > up) up = hi - t; }
              f.addScaledVector(n, Math.min(up, 0.03 / S)); } }
          let iS = 0; while (iS < N - 1 && P[iS].y < 0.42 / S) iS++;
          const iF = cl(Math.round(sFork / Lc * (N - 1)), 0, N - 1), uStart = L[iS], nG = new V(Nn[iS].x, 0, Nn[iS].z).normalize();   // nG: mặt bám lúc rời đất
          function pushOut(u, p, pad) {   // đẩy điểm (hệ cây) ra khỏi các ống cành gần đoạn đường quanh u
            const L2 = nearOf(cl(Math.round(u / total * (N - 1)), 0, N - 1));
            for (let n = 0; n < L2.length; n++) { const d = sd1(L2[n], p.x, p.y, p.z) - pad; if (d >= 0) continue;
              const c = L2[n], ax = cap[c], ay = cap[c + 1], az = cap[c + 2], dx = cap[c + 3] - ax, dy = cap[c + 4] - ay, dz = cap[c + 5] - az, l2 = dx * dx + dy * dy + dz * dz, k = l2 > 1e-10 ? cl(((p.x - ax) * dx + (p.y - ay) * dy + (p.z - az) * dz) / l2, 0, 1) : 0;
              _p.set(p.x - ax - dx * k, p.y - ay - dy * k, p.z - az - dz * k); const len = _p.length(); if (len > 1e-6) p.addScaledVector(_p, -d / len); }
          }
          const iOf = u => cl(Math.round(u / total * (N - 1)), 0, N - 1), sdAt = (u, p) => sd(nearOf(iOf(u)), p.x, p.y, p.z);   // khoảng hở từ điểm (hệ cây) tới các ống cành quanh u
          blur(Rp, 2, (a, b, c) => b === undefined ? a : (a + 2 * b + c) / 4);
          const _gp = new V(), dsA = Lc / (N - 1);
          const gap = (u, p, o) => {   // điểm p (hệ cây) cách vỏ thật bao xa, đo từ trục cành quanh u theo đúng hướng của p (bảng bán kính K hướng / mẫu trục ⇒ thân méo, gốc loe cũng đúng); o = hướng ra
            let i = iOf(u); for (let n = 0; n < 2; n++) i = cl(i + Math.round(_gp.copy(p).sub(C[i]).dot(T[i]) / dsA), 0, N - 1);
            _gp.copy(p).sub(C[i]); _gp.addScaledVector(T[i], -_gp.dot(T[i])); const rad = _gp.length(), a = Math.atan2(_gp.dot(E2[i]), _gp.dot(E1[i])) / dPh, k0 = Math.floor(a), f = a - k0, rs = rhoT[i];
            if (o) o.copy(_gp).multiplyScalar(1 / Math.max(1e-6, rad));
            return rad - (rs[((k0 % K) + K) % K] * (1 - f) + rs[(((k0 + 1) % K) + K) % K] * f);
          };
          return { P, N: Nn, R: Rp, iOf, sdAt, L, Tg, FL, FR, NL, NR, gap, total, uTrunk: L[iF], uStart, uEnd: Math.max(uStart + 0.5, total - 0.2 / S), n: nG, r0: Math.hypot(P[0].x, P[0].z), pushOut, score: prev[kEnd], roll: ph[N - 1] };
        }
