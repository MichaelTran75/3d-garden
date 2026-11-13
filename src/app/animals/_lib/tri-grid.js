        // LƯỚI TAM GIÁC TRÊN CPU: bắn tia ngắn vào lưới tam giác thô (mảng đỉnh + chỉ số), không cần Mesh, không nạp GPU.
        // Ô đều `cell`; `box` [x0, y0, z0, x1, y1, z1] (tuỳ chọn) ⇒ chỉ giữ tam giác chạm hộp. Tia đi ô theo DDA, thử cả 2 mặt tam giác.
        function triGrid(pos, idx, cell, box) {
          const inv = 1 / cell, cells = new Map(), key = (i, j, k) => (i + 512) + (j + 512) * 1024 + (k + 512) * 1048576, fl = Math.floor;
          let kept = 0;
          for (let t = 0; t < idx.length; t += 3) {
            const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
            const x0 = Math.min(pos[a], pos[b], pos[c]), x1 = Math.max(pos[a], pos[b], pos[c]), y0 = Math.min(pos[a + 1], pos[b + 1], pos[c + 1]), y1 = Math.max(pos[a + 1], pos[b + 1], pos[c + 1]), z0 = Math.min(pos[a + 2], pos[b + 2], pos[c + 2]), z1 = Math.max(pos[a + 2], pos[b + 2], pos[c + 2]);
            if (box && (x1 < box[0] || x0 > box[3] || y1 < box[1] || y0 > box[4] || z1 < box[2] || z0 > box[5])) continue;
            kept++;
            for (let i = fl(x0 * inv); i <= fl(x1 * inv); i++) for (let j = fl(y0 * inv); j <= fl(y1 * inv); j++) for (let k = fl(z0 * inv); k <= fl(z1 * inv); k++) {
              const q = key(i, j, k); let L = cells.get(q); if (!L) cells.set(q, L = []); L.push(t);
            }
          }
          function ray(ox, oy, oz, dx, dy, dz, tMax) {   // d đơn vị → khoảng tới mặt gần nhất trong [0, tMax], −1 nếu không trúng
            let i = fl(ox * inv), j = fl(oy * inv), k = fl(oz * inv), best = -1;
            const si = dx > 0 ? 1 : -1, sj = dy > 0 ? 1 : -1, sk = dz > 0 ? 1 : -1;
            const ti = Math.abs(dx) > 1e-9 ? cell / Math.abs(dx) : Infinity, tj = Math.abs(dy) > 1e-9 ? cell / Math.abs(dy) : Infinity, tk = Math.abs(dz) > 1e-9 ? cell / Math.abs(dz) : Infinity;
            let ni = ti === Infinity ? Infinity : ((dx > 0 ? (i + 1) * cell - ox : ox - i * cell)) / Math.abs(dx), nj = tj === Infinity ? Infinity : ((dy > 0 ? (j + 1) * cell - oy : oy - j * cell)) / Math.abs(dy), nk = tk === Infinity ? Infinity : ((dz > 0 ? (k + 1) * cell - oz : oz - k * cell)) / Math.abs(dz);
            for (let tin = 0, guard = 0; tin <= tMax && guard < 256; guard++) {
              const L = cells.get(key(i, j, k));
              if (L) for (let n = 0; n < L.length; n++) {   // Möller–Trumbore
                const t = L[n], a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
                const e1x = pos[b] - pos[a], e1y = pos[b + 1] - pos[a + 1], e1z = pos[b + 2] - pos[a + 2], e2x = pos[c] - pos[a], e2y = pos[c + 1] - pos[a + 1], e2z = pos[c + 2] - pos[a + 2];
                const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x, det = e1x * px + e1y * py + e1z * pz;
                if (det > -1e-12 && det < 1e-12) continue;
                const id = 1 / det, sx = ox - pos[a], sy = oy - pos[a + 1], sz = oz - pos[a + 2], u = (sx * px + sy * py + sz * pz) * id;
                if (u < 0 || u > 1) continue;
                const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x, v = (dx * qx + dy * qy + dz * qz) * id;
                if (v < 0 || u + v > 1) continue;
                const tt = (e2x * qx + e2y * qy + e2z * qz) * id;
                if (tt >= 0 && tt <= tMax && (best < 0 || tt < best)) best = tt;
              }
              const tout = Math.min(ni, nj, nk);
              if (best >= 0 && best <= tout) break;
              if (ni <= nj && ni <= nk) { i += si; ni += ti; } else if (nj <= nk) { j += sj; nj += tj; } else { k += sk; nk += tk; }
              tin = tout;
            }
            return best;
          }
          return { ray, kept, cells: cells.size };
        }
