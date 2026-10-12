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

        // ---- THẢM CỎ LÔNG HEO: cỏ li ti ngắn phủ ~1/3 bản đồ bằng VALUE-NOISE (không lưu mảng, dùng lại pool 'blade' → 0 draw call thêm) ----
        {
          const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.545; return s - Math.floor(s); };   // hash 0..1 mỗi mắt lưới
          const vnoise = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); return (hsh(xi, zi) * (1 - u) + hsh(xi + 1, zi) * u) * (1 - v) + (hsh(xi, zi + 1) * (1 - u) + hsh(xi + 1, zi + 1) * u) * v; };   // value noise mượt 0..1 → mảng loang tự nhiên
          const rnd = mulberry32(9999);
          for (let i = 4; i < GX - 4; i += 2) for (let j = 4; j < GZ - 4; j += 2) {
            if (vnoise(i * 0.06, j * 0.06) < 0.62 || isWater(i, j) || padH(i, j) !== null || !freeTree(i, j)) continue;   // ngưỡng 0.62 ≈ 32.8% ≈ 1/3 bản đồ · bỏ nước/bệ/khu cấm
            const nB = rnd() < 0.5 ? 2 : 1;   // 50% ô mọc 2 cọng → tổng số cỏ +50%
            for (let b = 0; b < nB; b++) {
              const px = wx(i) + (rnd() - 0.5) * BLOCK, pz = wz(j) + (rnd() - 0.5) * BLOCK;
              const h = (0.15 + rnd() * 0.1) * 0.75;   // thấp đi 25% (cao ~0.11-0.19)
              vegGroup(px, surfaceY(i, j), pz, rnd() * 6.28, 1);
              vegPush(vegPools.blade, _vp.set(0, h / 2, 0), _vqI, _vs.set(0.25, h, 0.25), bladeGreenCols[(rnd() * bladeGreenCols.length) | 0]);   // thân mảnh 1/2 (rộng ×0.25) · gốc chạm đất
            }
          }
        }

        for (const k in vegPools) buildVegPool(vegPools[k]);
        _forestVariants.length = 0;   // dựng toàn bộ InstancedMesh cỏ/cây/hoa sau khi gom xong

        const lotuses = [];
        const padMat = new THREE.MeshLambertMaterial({ color: 0x4f944f }), lp1 = new THREE.MeshLambertMaterial({ color: 0xf3aecb }), lp2 = new THREE.MeshLambertMaterial({ color: 0xe884b0 }), lcen = new THREE.MeshLambertMaterial({ color: 0xe8d572 });
        function lotus() {
          const g = new THREE.Group();
          const pad = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 0.07, 14), padMat); pad.position.y = 0.04; pad.receiveShadow = true; g.add(pad);
          for (let layer = 0; layer < 2; layer++) {
            const r = 0.42 - layer * 0.16, pm = layer ? lp2 : lp1, n = 6;
            for (let p = 0; p < n; p++) {
              const pv = new THREE.Group(); pv.rotation.y = layer * 0.5 + p / n * 6.283;
              const pe = new THREE.Mesh(new THREE.ConeGeometry(0.17 - layer * 0.03, 0.52 - layer * 0.1, 5), pm); pe.scale.z = 0.12; pe.castShadow = true; pe.position.set(r, 0.26 + layer * 0.13, 0); pe.rotation.z = -0.72 + layer * 0.22; pv.add(pe); g.add(pv);   // ép mỏng cánh sen thành lá dẹt (z 1→0.12)
            }
          }
          const ce = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.17, 0.24, 8), lcen); ce.position.y = 0.42; g.add(ce); return g;
        }
        // hồ hạ lưu — nơi có cá (dùng lakeY khai báo cùng resTopY/downY)
        for (const off of [[0, 0], [3.6, 2.2], [-3.2, 2.6]]) { const g = lotus(); g.position.set(X0 + 73 + off[0], lakeY, Z0 + 113 + off[1]); g.rotation.y = Math.random() * 6.28; scene.add(g); lotuses.push({ g, base: lakeY, ph: Math.random() * 6 }); }   // hoa sen về tọa độ góc (73, _, 113)

