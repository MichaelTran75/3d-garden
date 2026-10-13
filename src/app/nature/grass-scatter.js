        // ---- rải ngẫu nhiên hoa + cỏ khắp đồng (instanced → dày thêm nhưng vẫn ít draw call) ----
        for (let n = 0, ft = 0; n < 340 && ft < 12000; ft++) {
          const i = 3 + (Math.random() * (GX - 6) | 0), j = 3 + (Math.random() * (GZ - 6) | 0);
          if (!freeTree(i, j)) continue;
          const px = wx(i), py = surfaceY(i, j), pz = wz(j), rot = Math.random() * 6.28;
          Math.random() < 0.4 ? addFlower(px, py, pz, rot) : addGrassTuft(px, py, pz, rot, 0.8 + Math.random() * 0.9);   // ~40% hoa · 60% cỏ
          n++;
        }

        // ---- cỏ + hoa quanh chân các tua-bin gió (1 vòng gộp: ~75% cỏ · 25% hoa) ----
        for (const c of windCells) {
          const ci = c[0] * S, cj = c[1] * S;
          for (let n = 0; n < 30; n++) {
            const ang = Math.random() * 6.283, rad = 1.6 + Math.random() * 8.5, i = Math.round(ci + Math.cos(ang) * rad), j = Math.round(cj + Math.sin(ang) * rad);
            if (i < 2 || j < 2 || i >= GX - 2 || j >= GZ - 2 || !freeTree(i, j)) continue;
            Math.random() < 0.25 ? addFlower(wx(i), surfaceY(i, j), wz(j), Math.random() * 6.283) : addGrassTuft(wx(i), surfaceY(i, j), wz(j), Math.random() * 6.283, 0.85 + Math.random() * 0.8);
          }
        }

        // ---- rải cỏ + hoa quanh 1 tâm (gộp các khối rải tay lặp lại → data-driven, tái dùng cho cụm mới) ----
        //   flat: cao độ cố định · null → bám mặt đất qua cowY
        function scatterPatch(cx, cz, grass, flowers, spread, flat) {
          const yy = (x, z) => flat != null ? flat : cowY(Math.round(x2gi(x)), Math.round(z2gj(z)));
          for (let n = 0; n < grass; n++) { const px = cx + (Math.random() - 0.5) * spread, pz = cz + (Math.random() - 0.5) * spread; addGrassTuft(px, yy(px, pz), pz, Math.random() * 6.283, 0.85 + Math.random() * 0.8); }
          for (let n = 0; n < flowers; n++) { const px = cx + (Math.random() - 0.5) * spread, pz = cz + (Math.random() - 0.5) * spread; addFlower(px, yy(px, pz), pz, Math.random() * 6.283); }
        }
        scatterPatch(X0 + 100, Z0 + 113, 6, 3, 1.5, 7.2);   // quanh khúc gỗ chết
        scatterPatch(X0 + 116, Z0 + 54, 0, 5, 3, null);     // ven đường, chỉ hoa

        // ---- cỏ ở những vùng trũng nhất ----
        const lowCandidates = [];
        for (let i = 2; i < GX - 2; i += 2) {
          for (let j = 2; j < GZ - 2; j += 2) {
            if (!isWater(i, j) && padH(i, j) === null) {
              lowCandidates.push({ i, j, h: terr(i, j) });
            }
          }
        }
        lowCandidates.sort((a, b) => a.h - b.h);
        const numLowGrass = Math.min(400, lowCandidates.length);
        for (let n = 0; n < numLowGrass; n++) {
          const c = lowCandidates[n];
          addGrassTuft(wx(c.i), surfaceY(c.i, c.j), wz(c.j), Math.random() * 6.283, 0.7 + Math.random() * 0.7);
        }

        // Cỏ thủy sinh theo yêu cầu tại x=-6.9, y=1.2, z=95.7 (đặt trên đỉnh khối hộp y=1.2 và tăng scale để nổi rõ)
        addGrassTuft(-6.9, 1.2, 95.7, Math.random() * 6.283, 2.5);
        addGrassTuft(-7.2, 1.2, 95.9, Math.random() * 6.283, 2.2);
        addGrassTuft(-6.6, 1.2, 95.5, Math.random() * 6.283, 2.4);

        // Hoa và cỏ theo yêu cầu của anh G xung quanh vị trí thế giới x = X0 + 102, z = Z0 + 105
        for (let dx = -1.2; dx <= 1.2; dx += 0.4) {
          for (let dz = -1.2; dz <= 1.2; dz += 0.4) {
            const px = X0 + 102 + dx + (Math.random() - 0.5) * 0.25;
            const pz = Z0 + 105 + dz + (Math.random() - 0.5) * 0.25;
            const ni = Math.round(x2gi(px));
            const nj = Math.round(z2gj(pz));
            const py = surfaceY(ni, nj);
            addGrassTuft(px, py, pz, Math.random() * 6.283, 0.9 + Math.random() * 0.6);
            if (Math.random() < 0.45) {
              addFlower(px, py, pz, Math.random() * 6.283);
            }
          }
        }

        // ---- THẢM CỎ PHỦ 45% ĐẤT (G 13/10: "research and improve grass, add more grass (45% of the land)") ----
        //  Cỏ ngoài tự nhiên mọc LOANG theo mảng (vài mét) do ẩm đất, ánh sáng, giẫm đạp: dày & cao gần nước, thưa dưới tán, trụi trên lối mòn và quanh
        //  bếp lửa / cửa xe (đất nện); không mọc trên đường nhựa, bệ bê tông, gốc cây. Điểm mỗi ô = nhiễu fbm 2 tầng (mảng 3–10 m)
        //  + ẩm (khoảng cách tới nước, loang BFS) − giẫm đạp; lấy NGƯỠNG phân vị để đúng 45% số ô đất có cỏ. Mỗi ô 1 bụi 3 lá (vegPools.sod),
        //  cao 0,16–0,42 đv theo điểm, xoay & lệch ngẫu nhiên trong ô; gió uốn dọc lá (grassWindShader, sóng honami).
        {
          const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.545; return s - Math.floor(s); };
          const vnoise = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); return (hsh(xi, zi) * (1 - u) + hsh(xi + 1, zi) * u) * (1 - v) + (hsh(xi, zi + 1) * (1 - u) + hsh(xi + 1, zi + 1) * u) * v; };
          const rnd = mulberry32(4545), N = GX * GZ;
          const wd = new Uint8Array(N).fill(255), q = new Int32Array(N); let qh = 0, qt = 0;   // khoảng cách (ô) tới nước gần nhất, tối đa 40
          for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) if (isWater(i, j)) { wd[i + j * GX] = 0; q[qt++] = i + j * GX; }
          while (qh < qt) { const c = q[qh++], d = wd[c] + 1; if (d > 40) continue; const ci = c % GX, cj = (c / GX) | 0;
            for (const n of [ci > 0 ? c - 1 : -1, ci < GX - 1 ? c + 1 : -1, cj > 0 ? c - GX : -1, cj < GZ - 1 ? c + GX : -1]) if (n >= 0 && wd[n] > d) { wd[n] = d; q[qt++] = n; } }
          const camps = [[pf.x, pf.z, 3.2], [vanPt(0.33, 0, 2.6).x, vanPt(0.33, 0, 2.6).z, 1.8]];   // đất nện quanh bếp lửa · trước cửa xe
          let land = 0; const cand = [];
          for (let j = 4; j < GZ - 4; j++) for (let i = 4; i < GX - 4; i++) {
            if (isWater(i, j)) continue; land++;
            if (padH(i, j) !== null || !freeTree(i, j)) continue;
            const x = wx(i), z = wz(j);
            let sc = 0.62 * vnoise(i * 0.045, j * 0.045) + 0.38 * vnoise(i * 0.14 + 17, j * 0.14 + 5) + 0.28 * Math.exp(-wd[i + j * GX] / 9);
            for (const [cx, cz, r] of camps) { const d = Math.hypot(x - cx, z - cz); if (d < r) sc -= 0.8 * (1 - d / r); }
            cand.push(sc, i, j);
          }
          const want = Math.round(0.45 * land), nC = cand.length / 3, scores = new Float32Array(nC);
          for (let k = 0; k < nC; k++) scores[k] = cand[k * 3];
          const sorted = Float32Array.from(scores).sort(), thr = nC > want ? sorted[nC - want] : -1e9, top = sorted[nC - 1] || 1;
          let placed = 0;
          for (let k = 0; k < nC; k++) {
            const sc = scores[k]; if (sc < thr) continue;
            const i = cand[k * 3 + 1], j = cand[k * 3 + 2], dens = Math.min(1, (sc - thr) / Math.max(1e-3, top - thr));
            const px = wx(i) + (rnd() - 0.5) * BLOCK * 0.9, pz = wz(j) + (rnd() - 0.5) * BLOCK * 0.9, h = 0.16 + 0.26 * Math.pow(dens, 0.7) * (0.75 + 0.5 * rnd());
            vegGroup(px, surfaceY(i, j), pz, rnd() * 6.283, 1);
            vegPush(vegPools.sod, _vp.set(0, h / 2, 0), _vqI, _vs.set(0.9 + 0.5 * rnd(), h, 0.9 + 0.5 * rnd()), bladeGreenCols[(rnd() * bladeGreenCols.length) | 0]);
            placed++;
          }
          window.__grassCover = { land, placed, frac: placed / land };   // (đo kiểm: tỉ lệ đất có cỏ)
        }

        for (const k in vegPools) buildVegPool(vegPools[k]);
        _forestVariants.length = 0;   // dựng toàn bộ InstancedMesh cỏ/cây/hoa sau khi gom xong


