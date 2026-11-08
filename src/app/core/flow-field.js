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
          const here = field[gi + gj * GX];
          if (here >= 65535) {   // lỡ cắt góc vào ô cấm (hoặc đang đứng trong chuồng): hướng về ô đi được gần nhất có giá rẻ nhất — ô KỀ trước (vòng 2 chỉ khi
            // quanh mình không còn ô nào đi được): trước đây lấy ô rẻ nhất trong 5×5 ⇒ chó kẹt sát lò chiminea bị chỉ thẳng qua đống củi sang ô rẻ phía sau, xoay mãi
            let best = 65535, bi = 0, bj = 0;
            for (let rr = 1; rr <= 2 && best >= 65535; rr++) for (let dj = -rr; dj <= rr; dj++) for (let di = -rr; di <= rr; di++) { const ni = gi + di, nj = gj + dj; if (ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue; const v = field[ni + nj * GX]; if (v < best) { best = v; bi = di; bj = dj; } }
            if (best >= 65535) return null; const L = Math.hypot(bi, bj); return _ffV.set(bi / L, 0, bj / L);
          }
          let vx = 0, vz = 0;
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
            if (!di && !dj) continue;
            const d = field[(gi + di) + (gj + dj) * GX];
            if (d >= here) continue;
            const w = (here - d) / Math.hypot(di, dj);
            vx += di * w; vz += dj * w;
          }
          const L = Math.hypot(vx, vz); if (L < 1e-4) return null;
          return _ffV.set(vx / L, 0, vz / L);
        }
