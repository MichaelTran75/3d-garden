        // ---- hoa kiểu MINECRAFT: 6 loài (poppy · dandelion · oxeye daisy · allium · tulip · cornflower) ghép từ cube instanced ----
        const _mcTulip = [0xd6683e, 0xe08baf, 0xE2D6C0, 0xc22f34].map(c => new THREE.Color(c));
        const _mcCol = {
          poppy: new THREE.Color(0xc22f2c), poppyEye: new THREE.Color(0x241d16),
          dand: new THREE.Color(0xf7d23c),
          daisy: new THREE.Color(0xE2D6C0), daisyEye: new THREE.Color(0xe8b520),
          allium: new THREE.Color(0xc48bdd),
          corn: new THREE.Color(0x5670e0)
        };
        function addFlower(px, py, pz, rotY) {
          if (!roadContains(px, pz, .35)) flowerCoords.push(new THREE.Vector3(px, py + 0.5, pz));
          const scl = (0.9 + Math.random() * 0.6) * 0.7; vegGroup(px, py, pz, rotY, scl);
          const kind = (Math.random() * 6) | 0, cube = vegPools.fcube;
          const tall = kind === 3;                                                                       // allium: thân cao đặc trưng
          vegPush(vegPools.stem, _vp.set(0, tall ? 0.45 : 0.35, 0), _vqI, _vs.set(1, tall ? 1.3 : 1, 1));
          const hy = tall ? 1.02 : 0.8;                                                                  // độ cao đầu hoa
          if (kind === 0 || kind === 4) {                                                                // poppy / tulip: 4 cánh dựng quanh thành chén
            const pc = kind === 0 ? _mcCol.poppy : _mcTulip[(Math.random() * 4) | 0], ph = kind === 0 ? 0.17 : 0.24;
            for (let p = 0; p < 4; p++) {
              const a = p / 4 * 6.283; _ve.set(0, -a, 0); _vq.setFromEuler(_ve);
              vegPush(cube, _vp.set(Math.cos(a) * 0.1, hy, Math.sin(a) * 0.1), _vq, _vs.set(0.035, ph, 0.17), pc);
            }
            if (kind === 0) vegPush(cube, _vp.set(0, hy - 0.05, 0), _vqI, _vs.set(0.13, 0.05, 0.13), _mcCol.poppyEye);   // nhuỵ đen trong lòng poppy
            else vegPush(cube, _vp.set(0, hy - ph / 2 + 0.02, 0), _vqI, _vs.set(0.14, 0.04, 0.14), pc);                  // đáy chén tulip
          } else if (kind === 1 || kind === 3) {                                                         // dandelion / allium: pom-pom cube tròn
            const pc = kind === 1 ? _mcCol.dand : _mcCol.allium;
            vegPush(cube, _vp.set(0, hy + 0.02, 0), _vqI, _vs.set(0.16, 0.16, 0.16), pc);
            for (const o of [[0.09, 0, 0], [-0.09, 0, 0], [0, 0.09, 0], [0, -0.09, 0], [0, 0, 0.09], [0, 0, -0.09]])
              vegPush(cube, _vp.set(o[0], hy + 0.02 + o[1], o[2]), _vqI, _vs.set(0.1, 0.1, 0.1), pc);
          } else if (kind === 2) {                                                                       // oxeye daisy: 8 cánh dẹt toả tròn + nhuỵ vàng
            for (let p = 0; p < 8; p++) {
              const a = p / 8 * 6.283; _ve.set(0, -a, 0.06); _vq.setFromEuler(_ve);
              vegPush(cube, _vp.set(Math.cos(a) * 0.14, hy, Math.sin(a) * 0.14), _vq, _vs.set(0.16, 0.02, 0.07), _mcCol.daisy);
            }
            vegPush(cube, _vp.set(0, hy + 0.015, 0), _vqI, _vs.set(0.11, 0.05, 0.11), _mcCol.daisyEye);
          } else {                                                                                       // cornflower: chùm cube xanh biếc nghiêng ngẫu nhiên
            for (let p = 0; p < 6; p++) {
              const a = p / 6 * 6.283; _ve.set((Math.random() - 0.5) * 0.7, Math.random() * 6.283, (Math.random() - 0.5) * 0.7); _vq.setFromEuler(_ve);
              vegPush(cube, _vp.set(Math.cos(a) * 0.07, hy + (p % 2) * 0.04, Math.sin(a) * 0.07), _vq, _vs.set(0.08, 0.08, 0.08), _mcCol.corn);
            }
            vegPush(cube, _vp.set(0, hy + 0.05, 0), _vqI, _vs.set(0.09, 0.09, 0.09), _mcCol.corn);
          }
          for (const la of [0.7, 3.8]) { _ve.set(0.55, la, 0); _vq.setFromEuler(_ve); vegPush(vegPools.blade, _vp.set(Math.cos(la) * 0.08, 0.22, Math.sin(la) * 0.08), _vq, _vs.set(2.2, 0.4, 2.2), bladeGreenCols[1]); }   // 2 lá cỏ ôm gốc kiểu Minecraft
        }

        // ---- trees ---- (tree() giữ cho cây ăn quả; cây rải nền → addTreeInst để instancing)
        function tree(type, s) {
          const g = new THREE.Group(); const lm = leafMats[Math.floor(Math.random() * leafMats.length)];
          if (type === 0) {
            const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.135 * s, 0.21 * s, 1.76 * s, 7), trunkMat); tr.position.y = 0.88 * s; g.add(tr);
            for (let i = 0; i < 4; i++) { const r = (1.6 - i * 0.32) * s; const cone = new THREE.Mesh(new THREE.ConeGeometry(r, 2.31 * s, 9), lm); cone.position.y = (1.87 + i * 1.21) * s; cone.castShadow = true; g.add(cone); }
          }
          else {
            const tr = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.21 * s, 2.31 * s, 7), trunkMat); tr.position.y = 1.155 * s; g.add(tr);
            const blobs = [[0, 3.2, 0, 1.7], [0.85, 2.7, 0.42, 1.25], [-0.75, 2.8, -0.4, 1.3], [0.3, 3.8, -0.25, 1.1]];
            for (const b of blobs) { const sph = new THREE.Mesh(new THREE.IcosahedronGeometry(b[3] * s, 1), lm); sph.position.set(b[0] * s, b[1] * s * 1.1, b[2] * s); sph.scale.y = 1.012; sph.castShadow = true; g.add(sph); }
          } return g;
        }
        function freeTree(i, j) {
          if (isWater(i, j)) return false;
          if (padH(i, j) !== null) return false;
          if (j < 11 * S && Math.abs(i - riverC(j)) < 13 * S) return false;
          // không cho cây mọc trong bán kính 18m quanh khu caravan (X0 + 74, Z0 + 103)
          const tx = wx(i), tz = wz(j);
          if (Math.hypot(tx - (X0 + 74), tz - (Z0 + 103)) < 18) return false;
          return true;
        }
        const treeCoords = [];   // cây rừng đặt SAU khi dựng mẫu nhánh đệ quy (xem bên dưới, sau recTree)

        // ---- CÂY ĐỆ QUY (fractal): grow() tự rẽ 2-3 nhánh mỗi cấp — giảm dần dài/bán kính, lá & quả
        //      mọc tự nhiên ở cành TẬN CÙNG (không hardcode cấp nhánh). Seeded RNG (mulberry32) để cây
        //      TÁI SINH Y HỆT mỗi lần tải → nút "Chọn" vẫn chỉnh được từng tán như cây cổ thụ. ----
        function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let z = Math.imul(a ^ a >>> 15, 1 | a); z = (z + Math.imul(z ^ z >>> 7, 61 | z)) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; }; }
        const _rtUp = new THREE.Vector3(0, 1, 0), _rtA = new THREE.Vector3(), _rtB = new THREE.Vector3(), _rtAx = new THREE.Vector3();
        function recTree(g, o) {   // o: seed·s·barkMat·trunkLen·trunkR·maxDepth·nMin/nMax·lenK·radK·spread·upBias·recursiveLeaves
          const rnd = mulberry32(o.seed), tips = [];
          const flowerPts = [];
          const limb = (a, b, r1, r2) => { const d = b.clone().sub(a), L = d.length(); const m = new THREE.Mesh(new THREE.CylinderGeometry(r2, r1, L, 7), o.barkMat); m.position.copy(a).addScaledVector(d, 0.5); m.quaternion.setFromUnitVectors(_rtUp, d.normalize()); m.castShadow = true; m.receiveShadow = true; g.add(m); };

          // Hàm đệ quy bẻ cong cành (Midpoint Displacement) áp dụng cho recTree
          const crookedLimb = (a, b, r1, r2, depth = 0, maxDepth = (o.limbMaxDepth != null ? o.limbMaxDepth : 2)) => {
            const d = b.clone().sub(a), L = d.length();
            if (depth >= maxDepth || L < 0.1 || r1 < 0.012) {
              limb(a, b, r1, r2);
              return;
            }
            const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5);
            const dir = d.clone().normalize();
            let tAxis = (Math.abs(dir.y) > 0.9) ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
            const p1 = new THREE.Vector3().crossVectors(dir, tAxis).normalize();
            const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
            const jF = L * 0.14, ang = rnd() * 6.283;
            mid.addScaledVector(p1, Math.cos(ang) * jF).addScaledVector(p2, Math.sin(ang) * jF);
            const midR = (r1 + r2) * 0.5;
            crookedLimb(a, mid, r1, midR, depth + 1, maxDepth);

            const js = new THREE.Mesh(new THREE.SphereGeometry(midR, 6, 6), o.barkMat);
            js.position.copy(mid); js.castShadow = true; js.receiveShadow = true; g.add(js);

            crookedLimb(mid, b, midR, r2, depth + 1, maxDepth);
          };

          (function grow(a, dir, len, r, depth) {
            const b = a.clone().addScaledVector(dir, len);
            if (depth > 0) { b.x += (rnd() - 0.5) * len * 0.3; b.z += (rnd() - 0.5) * len * 0.3; }   // thân chính thẳng, nhánh con xiêu vẹo
            crookedLimb(a, b, r, r * o.radK);

            const jsNode = new THREE.Mesh(new THREE.SphereGeometry(r * o.radK, 6, 6), o.barkMat);
            jsNode.position.copy(b); jsNode.castShadow = true; jsNode.receiveShadow = true; g.add(jsNode);

            // Mọc hoa đệ quy dọc theo cành (ngoại trừ thân chính sát đất)
            if (o.recursiveLeaves && depth > 0) {
              const count = depth === 1 ? 4 : (depth === 2 ? 8 : (depth === 3 ? 15 : 22));
              const clumpR = len * 0.45;
              for (let i = 0; i < count; i++) {
                const t = i / (count - 1 || 1);
                const pt = new THREE.Vector3().lerpVectors(a, b, t);
                const theta = rnd() * 6.283, ph = Math.acos(2 * rnd() - 1);
                const dist = clumpR * Math.cbrt(rnd());
                const px = pt.x + dist * Math.sin(ph) * Math.cos(theta);
                const py = pt.y + dist * Math.cos(ph) * 0.8;
                const pz = pt.z + dist * Math.sin(ph) * Math.sin(theta);
                flowerPts.push([px, py, pz]);
              }
            }

            if (depth >= o.maxDepth || r * o.radK < 0.012 * o.s) { tips.push(b); return; }           // BASE CASE: đủ sâu / cành quá mảnh
            const n = (depth === 0 && o.firstSplitN) ? o.firstSplitN : o.nMin + ((rnd() * (o.nMax - o.nMin + 1)) | 0);
            for (let k = 0; k < n; k++) {                                                            // BƯỚC ĐỆ QUY: rẽ 2-3 nhánh quanh trục cha
              _rtA.set(1, 0, 0); if (Math.abs(dir.x) > 0.9) _rtA.set(0, 0, 1);
              _rtB.crossVectors(dir, _rtA).normalize(); _rtAx.crossVectors(dir, _rtB).normalize();
              const az = (k / n + rnd() * 0.35) * 6.283;                                             // chia đều quanh trục + jitter → tán toả tròn
              _rtAx.multiplyScalar(Math.cos(az)).addScaledVector(_rtB, Math.sin(az)).normalize();

              // Narrower angle (góc hẹp lại) for first split (depth === 0)
              const angleFactor = (depth === 0) ? 0.48 * (0.75 + rnd() * 0.5) : (0.6 + rnd() * 0.8);
              const nd = dir.clone().applyAxisAngle(_rtAx, o.spread * angleFactor);
              nd.y += o.upBias; nd.normalize();

              // Different lengths (độ ngắn dài khác nhau) for first split
              const lengthFactor = (depth === 0) ? (0.6 + rnd() * 0.6) : (0.75 + rnd() * 0.5);
              grow(b, nd, len * o.lenK * lengthFactor, r * (depth === 0 && o.rootK ? o.rootK : o.radK), depth + 1);   // rootK (tùy chọn): thân giữ to, nhánh cấp 1 đột ngột nhỏ (cây cổ thụ)
            }
          })(new THREE.Vector3(0, 0, 0), _rtUp.clone(), o.trunkLen, o.trunkR, 0);
          return { tips, rnd, flowerPts };
        }
        function cloudPts(rnd, cx2, cy2, cz2, r, n, pts) { for (let i = 0; i < n; i++) { const rr = r * Math.cbrt(rnd()), th = rnd() * 6.283, ph = Math.acos(2 * rnd() - 1); pts.push([cx2 + rr * Math.sin(ph) * Math.cos(th), cy2 + rr * Math.cos(ph) * 0.8, cz2 + rr * Math.sin(ph) * Math.sin(th)]); } }
