        // ---- rải ngẫu nhiên hoa khắp đồng (búi cỏ gai cũ đã thay bằng thảm cỏ nature/meadow.js) ----
        for (let n = 0, ft = 0; n < 140 && ft < 12000; ft++) {
          const i = 3 + (Math.random() * (GX - 6) | 0), j = 3 + (Math.random() * (GZ - 6) | 0);
          if (!freeTree(i, j)) continue;
          const px = wx(i), py = surfaceY(i, j), pz = wz(j), rot = Math.random() * 6.28;
          if (deadLogOut(px, pz, 0.2)) continue;   // không mọc xuyên khúc gỗ chết
          addFlower(px, py, pz, rot);
          n++;
        }

        // ---- hoa quanh chân các tua-bin gió ----
        for (const c of windCells) {
          const ci = c[0] * S, cj = c[1] * S;
          for (let n = 0; n < 8; n++) {
            const ang = Math.random() * 6.283, rad = 1.6 + Math.random() * 8.5, i = Math.round(ci + Math.cos(ang) * rad), j = Math.round(cj + Math.sin(ang) * rad);
            if (i < 2 || j < 2 || i >= GX - 2 || j >= GZ - 2 || !freeTree(i, j) || deadLogOut(wx(i), wz(j), 0.2)) continue;
            addFlower(wx(i), surfaceY(i, j), wz(j), Math.random() * 6.283);
          }
        }

        // ---- rải cỏ + hoa quanh 1 tâm (gộp các khối rải tay lặp lại → data-driven, tái dùng cho cụm mới) ----
        //   flat: cao độ cố định · null → bám mặt đất qua cowY
        function scatterPatch(cx, cz, grass, flowers, spread, flat) {
          const yy = (x, z) => flat != null ? flat : cowY(Math.round(x2gi(x)), Math.round(z2gj(z)));
          for (let n = 0; n < grass; n++) { const px = cx + (Math.random() - 0.5) * spread, pz = cz + (Math.random() - 0.5) * spread; if (deadLogOut(px, pz, 0.2)) continue; addGrassTuft(px, yy(px, pz), pz, Math.random() * 6.283, 0.85 + Math.random() * 0.8); }
          for (let n = 0; n < flowers; n++) { const px = cx + (Math.random() - 0.5) * spread, pz = cz + (Math.random() - 0.5) * spread; if (deadLogOut(px, pz, 0.2)) continue; addFlower(px, yy(px, pz), pz, Math.random() * 6.283); }
        }
        scatterPatch(X0 + 100, Z0 + 113, 6, 3, 1.5, 7.2);   // quanh khúc gỗ chết
        scatterPatch(X0 + 116, Z0 + 54, 0, 5, 3, null);     // ven đường, chỉ hoa

        // Cỏ thủy sinh theo yêu cầu tại x=-6.9, y=1.2, z=95.7 (đặt trên đỉnh khối hộp y=1.2 và tăng scale để nổi rõ)
        addGrassTuft(-6.9, 1.2, 95.7, Math.random() * 6.283, 2.5);
        addGrassTuft(-7.2, 1.2, 95.9, Math.random() * 6.283, 2.2);
        addGrassTuft(-6.6, 1.2, 95.5, Math.random() * 6.283, 2.4);

        // Hoa và cỏ theo yêu cầu của anh G xung quanh vị trí thế giới x = X0 + 102, z = Z0 + 105. Lưới này đè lên khúc gỗ chết (nature/forest.js) ⇒ điểm nào nằm
        // dưới thân gỗ thì dời ra sát chân gỗ phía gần nhất (cỏ, hoa mọc men theo thân gỗ), bỏ 1/2 cho khỏi thành hàng dày (G 15/10: cỏ, hoa mọc xuyên gỗ)
        for (let dx = -1.2; dx <= 1.2; dx += 0.4) {
          for (let dz = -1.2; dz <= 1.2; dz += 0.4) {
            let px = X0 + 102 + dx + (Math.random() - 0.5) * 0.25;
            let pz = Z0 + 105 + dz + (Math.random() - 0.5) * 0.25;
            const out = deadLogOut(px, pz, 0.18 + Math.random() * 0.3);
            if (out) { if (Math.random() < 0.5) continue; px = out[0]; pz = out[1]; }
            const ni = Math.round(x2gi(px));
            const nj = Math.round(z2gj(pz));
            const py = surfaceY(ni, nj);
            addGrassTuft(px, py, pz, Math.random() * 6.283, 0.9 + Math.random() * 0.6);
            if (Math.random() < 0.45) {
              addFlower(px, py, pz, Math.random() * 6.283);
            }
          }
        }

        // (thảm cỏ phủ 45% đất: nature/meadow.js — lá mảnh dày, màu gốc = màu đất, pháp tuyến chĩa lên, LOD theo mức phóng)

        for (const k in vegPools) buildVegPool(vegPools[k]);
        _forestVariants.length = 0;   // dựng toàn bộ InstancedMesh cỏ/cây/hoa sau khi gom xong


