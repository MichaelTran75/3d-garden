        // ==== DẪN ĐƯỜNG FLOW FIELD (dời NGUYÊN VĂN từ cuối animals/dog-raccoon.js: chó, gấu mèo, thỏ, bò, kỹ sư, luống cà rốt, máy cắt cỏ cùng dùng) ====
        // Đứng ngay trước animals/dog-raccoon.js (sau camp/chicken-coop.js): lưới cấm ffBlocked rasterize obstacleCoords + khung chuồng bò cowHutRect NGAY LÚC
        // dựng ⇒ phải sau MỌI tệp đăng ký vật cản trước đó (chuồng gà là tệp cuối) — dời sớm hơn thì lưới thiếu vật cản, đổi đường đi. Vật cản đăng ký sau
        // (ghế: engineer/body/seats.js tự ghi thêm ô cấm; kính thiên văn, luống cà rốt) không vào lưới này — như trước.
        /* ===== FLOW FIELD (Dijkstra map / DP): bảng khoảng-cách-BFS tới từng ĐÍCH CỐ ĐỊNH trên lưới voxel.
           Địa hình tĩnh → tabulate 1 LẦN lúc build (memoization); mỗi frame agent chỉ đọc gradient 8 ô quanh mình
           rồi bước xuống dốc → tự luồn lách qua vật cản theo đường ngắn nhất, không còn kẹt loop.
           Áp cho agent CÓ ĐÍCH: kỹ sư, gấu mèo, chó, bò về chuồng / bãi quen, thỏ về hang / trú mưa, việc vườn (cà rốt, cắt cỏ);
           lúc lang thang không đích (bò gặm · thỏ · cá · bướm) vẫn né cục bộ như cũ. ===== */
        const FF_N = GX * GZ, ffBlocked = new Uint8Array(FF_N);
        for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) ffBlocked[i + j * GX] = (isWater(i, j) || padH(i, j) !== null) ? 1 : 0;
        for (const ob of obstacleCoords) {   // rasterize vòng tròn vật cản vào lưới cấm
          const rr = ob.r + 0.3, i0 = Math.max(0, Math.floor(x2gi(ob.x - rr))), i1 = Math.min(GX - 1, Math.ceil(x2gi(ob.x + rr)));
          const j0 = Math.max(0, Math.floor(z2gj(ob.z - rr))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(ob.z + rr)));
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) if (Math.hypot(wx(i) - ob.x, wz(j) - ob.z) < rr) ffBlocked[i + j * GX] = 1;
        }
        // đơn vị tự chặn ô (worldJoin('flowField', thứ tự, F => F.blockRect({ x0, x1, z0, z1 }))): chuồng bò…
        worldServe('flowField', { blockRect: r => { const i0 = Math.max(0, Math.floor(x2gi(r.x0))), i1 = Math.min(GX - 1, Math.ceil(x2gi(r.x1))), j0 = Math.max(0, Math.floor(z2gj(r.z0))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(r.z1)));
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) ffBlocked[i + j * GX] = 1; } });
        function buildFlowField(tx, tz, blocked = ffBlocked, unR, X) {   // BFS 8 hướng loang từ đích: dist[ô] = số bước ngắn nhất tới đích (65535 = không tới được)
          //  X (tuỳ chọn, thỏ — animals/bunny/hop.js bunNav): { h: cao đất từng ô (NaN: không xét), up / dn: bậc lên / xuống tối đa giữa 2 ô kề, e: bit cạnh bị chặn
          //  (1 → +x · 2 → +z · 4 → +x+z · 8 → +x−z, ghi ở ô đầu cạnh) } — bước từ ô n sang ô c phải qua được
          const dist = new Uint16Array(FF_N).fill(65535), q = new Int32Array(FF_N); let qh = 0, qt = 0;
          let unblockR = unR ?? 0.9;   // quanh đích luôn mở 1 vòng nhỏ (đích có thể nằm trong vòng cấm của chính nó, vd cột khí tượng) · unR: lưới cấm dựng từ va chạm thật thì chỉ mở vòng nhỏ
          if (unR === undefined) for (const ob of obstacleCoords) { const d = Math.hypot(tx - ob.x, tz - ob.z); if (d < ob.r + 0.3) unblockR = Math.max(unblockR, ob.r + 0.45); }
          const s0 = Math.round(x2gi(tx)) + Math.round(z2gj(tz)) * GX; dist[s0] = 0; q[qt++] = s0;
          while (qh < qt) {
            const c = q[qh++], ci = c % GX, cj = (c / GX) | 0, dc = dist[c] + 1;
            for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
              if (!di && !dj) continue;
              const ni = ci + di, nj = cj + dj;
              if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue;
              const n = ni + nj * GX;
              if (dist[n] !== 65535) continue;
              if (blocked[n] && Math.hypot(wx(ni) - tx, wz(nj) - tz) > unblockR) continue;
              if (X && (X.h[c] - X.h[n] > X.up || X.h[n] - X.h[c] > X.dn || X.e[di > 0 || (!di && dj > 0) ? c : n] & (!dj ? 1 : !di ? 2 : di * dj > 0 ? 4 : 8))) continue;
              dist[n] = dc; q[qt++] = n;
            }
          }
          return dist;
        }
        const _ffV = new THREE.Vector3();
        function ffDir(field, x, z) {   // gradient dốc-xuống của bảng DP tại (x,z): so 8 ô quanh mình, cộng vector về các ô rẻ hơn
          const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z));
          if (gi < 1 || gj < 1 || gi >= GX - 1 || gj >= GZ - 1) return null;
          const c = gi + gj * GX, here = field[c], E = field.e;   // field.e (tuỳ chọn, navEdges): không cộng hướng sang ô kề bên kia tường mỏng
          if (here >= 65535) {   // lỡ cắt góc vào ô cấm (hoặc đang đứng trong chuồng): hướng về ô đi được gần nhất có giá rẻ nhất — ô KỀ trước (vòng 2 chỉ khi
            // quanh mình không còn ô nào đi được): trước đây lấy ô rẻ nhất trong 5×5 ⇒ chó kẹt sát lò chiminea bị chỉ thẳng qua đống củi sang ô rẻ phía sau, xoay mãi
            let best = 65535, bi = 0, bj = 0;
            for (let rr = 1; rr <= 2 && best >= 65535; rr++) for (let dj = -rr; dj <= rr; dj++) for (let di = -rr; di <= rr; di++) { const ni = gi + di, nj = gj + dj; if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue; const v = field[ni + nj * GX]; if (v < best) { best = v; bi = di; bj = dj; } }
            if (best >= 65535) return null; const L = Math.hypot(bi, bj); return _ffV.set(bi / L, 0, bj / L);
          }
          let vx = 0, vz = 0;
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
            if (!di && !dj) continue;
            const n = (gi + di) + (gj + dj) * GX, d = field[n];
            if (d >= here || (E && ffEdge(E, c, n, di, dj))) continue;
            const w = (here - d) / Math.hypot(di, dj);
            vx += di * w; vz += dj * w;
          }
          const L = Math.hypot(vx, vz); if (L < 1e-4) return null;
          return _ffV.set(vx / L, 0, vz / L);
        }
        const ffEdge = (E, c, n, di, dj) => E[di > 0 || (!di && dj > 0) ? c : n] & (!dj ? 1 : !di ? 2 : di * dj > 0 ? 4 : 8);   // cạnh ô c → ô kề n = c + (di, dj) bị chặn? (bit như X.e của buildFlowField)
        // Tường mỏng (lan can đập, rào trạm điện) nằm giữa 2 tâm ô 0,6 m: phép thử ô (≥ 2 / 5 mẫu quanh tâm) không thấy ⇒ bảng đường đi xuyên tường, thân trượt dọc tường mãi.
        // navEdges: lưới 0,1 m (6 điểm / ô) đọc va chạm thật (colHit, dải lo … hi trên đất); điểm trống = đĩa bán kính rad đặt tâm ở đó không lấn vật. Cạnh giữa 2 ô mở bị chặn
        // khi 2 điểm neo (điểm trống gần tâm ô nhất) không nối được qua các điểm trống trong hộp 2 tâm ± mg điểm. Nối 4 hướng: bước 0,1 m < cột va chạm 0,125 m ⇒ không lọt tường chéo.
        // Ô chật (đĩa không đặt được quanh tâm) xét theo điểm. 1 cạnh thẳng của ô vuông 4 tâm bị chặn ⇒ chặn cả 2 đường chéo (không cắt góc quanh đầu tường). Trả Uint8Array bit cạnh (như X.e).
        // B: ô cấm (cạnh chạm ô cấm không xét) · i0 … j1: vùng ô · H: cao đất từng ô (không đưa ⇒ cowY) · rad: bán kính thân. Bẫy: rad 0 ⇒ cột cuối lan can nằm trong hộp vẫn để cạnh mở,
        // thân to hơn khe trượt qua lại dọc tường; colSlide luôn tìm được bước nên không báo kẹt. Khe hẹp hơn thân (góc rào trạm điện – tường đập 0,54 m) cũng đóng ⇒ đi vòng.
        function navEdges(B, mask, lo, hi, i0, i1, j0, j1, H, rad = 0, mg = 3) {
          const E = new Uint8Array(FF_N), a0 = (i0 - 1) * 6, b0 = (j0 - 1) * 6, W = (i1 - i0 + 3) * 6, D = (j1 - j0 + 3) * 6, u = BLOCK / 6, X0 = wx(0), Z0 = wz(0), G = H || new Float32Array(FF_N).fill(NaN);
          const P = new Uint8Array(W * D), F = rad > 0 ? new Uint8Array(W * D) : P, rr = rad / u, R = Math.ceil(rr);   // P: điểm lấn vật · F: đĩa bán kính rad đặt tâm ở điểm này lấn vật
          for (let q = 0; q < D; q++) {
            const j = Math.min(GZ - 1, Math.max(0, Math.round((q + b0) / 6)));
            for (let p = 0; p < W; p++) {
              const i = Math.min(GX - 1, Math.max(0, Math.round((p + a0) / 6))), n = i + j * GX; let g = G[n]; if (g !== g) g = G[n] = cowY(wx(i), wz(j));
              if (!colHit(mask, X0 + (p + a0) * u, Z0 + (q + b0) * u, g + lo, g + hi)) continue;
              P[p + q * W] = 1;
              if (rad > 0) for (let db = -R; db <= R; db++) for (let da = -R; da <= R; da++) { const pp = p + da, qq = q + db; if (da * da + db * db <= rr * rr && pp >= 0 && qq >= 0 && pp < W && qq < D) F[pp + qq * W] = 1; }
            }
          }
          const AN = [0, 0, 1, 0, -1, 0, 0, 1, 0, -1, 1, 1, -1, 1, 1, -1, -1, -1, 2, 0, -2, 0, 0, 2, 0, -2], S = new Uint8Array(400), Q = new Int16Array(400);
          const free = (T, a, b) => { const p = a - a0, q = b - b0; return p >= 0 && q >= 0 && p < W && q < D && !T[p + q * W]; };
          const anchor = (T, i, j) => { for (let k = 0; k < AN.length; k += 2) if (free(T, i * 6 + AN[k], j * 6 + AN[k + 1])) return k; return -1; };
          const joined = (i, j, di, dj) => {
            let T = F, s = anchor(T, i, j), t = anchor(T, i + di, j + dj);
            if (s < 0 || t < 0) { if (T === P) return false; T = P; s = anchor(T, i, j); t = anchor(T, i + di, j + dj); if (s < 0 || t < 0) return false; }   // ô chật (đĩa không đặt được quanh tâm): xét theo điểm
            let ok = !s && !t; for (let k = 0; k < 6 && ok; k++) ok = free(T, i * 6 + di * (k + 1), j * 6 + dj * k) && free(T, i * 6 + di * (k + 1), j * 6 + dj * (k + 1));
            if (ok) return true;
            const A0 = Math.min(i, i + di) * 6 - mg, B0 = Math.min(j, j + dj) * 6 - mg, w = (di ? 6 : 0) + 2 * mg + 1, h = (dj ? 6 : 0) + 2 * mg + 1;
            const s0 = i * 6 + AN[s] - A0 + (j * 6 + AN[s + 1] - B0) * w, Tg = (i + di) * 6 + AN[t] - A0 + ((j + dj) * 6 + AN[t + 1] - B0) * w;
            S.fill(0, 0, w * h); let qh = 0, qt = 0; Q[qt++] = s0; S[s0] = 1;
            while (qh < qt) {
              const c = Q[qh++]; if (c === Tg) return true; const ca = c % w, cb = (c / w) | 0;
              for (let k = 0; k < 4; k++) { const na = ca + (k === 0) - (k === 1), nb = cb + (k === 2) - (k === 3); if (na < 0 || nb < 0 || na >= w || nb >= h) continue; const m = na + nb * w; if (S[m] || !free(T, na + A0, nb + B0)) continue; S[m] = 1; Q[qt++] = m; }
            }
            return false;
          };
          const DIR = [1, 0, 0, 1, 1, 1, 1, -1];
          for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
            const n = i + j * GX; if (B[n]) continue;
            for (let k = 0; k < 4; k++) { const di = DIR[2 * k], dj = DIR[2 * k + 1], ni = i + di, nj = j + dj; if (ni > i1 || nj < j0 || nj > j1 || B[ni + nj * GX]) continue; if (!joined(i, j, di, dj)) E[n] |= 1 << k; }
          }
          for (let j = j0; j < j1; j++) for (let i = i0; i < i1; i++) { const n = i + j * GX; if ((E[n] & 3) || (E[n + GX] & 1) || (E[n + 1] & 2)) { E[n] |= 4; E[n + GX] |= 8; } }   // 1 cạnh thẳng của ô vuông 4 tâm bị chặn ⇒ chặn cả 2 đường chéo (không cắt góc quanh đầu tường)
          return E;
        }
