        // ---- CÂY CỔ THỤ mọc tự nhiên (thân xoắn · vài nhánh gỗ chết · tán lá xum xuê) tại góc (89, 7, 117) ----
        // ---- CỤM 3 ĐÁ CUỘI ĐA GIÁC (1 Lớn · 1 Vừa · 1 Nhỏ) + NỀN ĐẤT quanh gốc cây ----
        (function stoneRing() {
          const g = new THREE.Group(); g.position.set(X0 + 89, 7.0, Z0 + 117); scene.add(g); flightRoots.push(g);
          const dirtMatRound = new THREE.MeshLambertMaterial({ color: 0x3d3024 });   // đất bùn đậm quanh gốc
          const rockMat = new THREE.MeshLambertMaterial({ color: 0x827b72, flatShading: true });   // đá ấm đa giác góc cạnh
          // Nền đất nâu sẫm tròn quanh gốc
          const dirtDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.12, 16), dirtMatRound);
          dirtDisc.position.y = 0.06; dirtDisc.receiveShadow = true; g.add(dirtDisc);
          // Đúng 3 hòn đá (1 Lớn, 1 Vừa, 1 Nhỏ)
          const geo = new THREE.DodecahedronGeometry(0.85, 0);
          const stones = [
            { pos: [0.3, 0.42, 1.25], sc: [1.45, 0.95, 1.3], rot: [0.4, 0.8, -0.2] },      // 1 LỚN (Big)
            { pos: [1.5, 0.34, -0.4], sc: [1.0, 0.7, 0.9], rot: [-0.3, 1.4, 0.5] },       // 1 VỪA (Medium)
            { pos: [-1.35, 0.26, 0.5], sc: [0.62, 0.45, 0.58], rot: [0.6, -0.7, 0.2] }     // 1 NHỎ (Small)
          ];
          for (const s of stones) {
            const m = new THREE.Mesh(geo, rockMat); m.position.set(...s.pos); m.scale.set(...s.sc); m.rotation.set(...s.rot);
            m.castShadow = true; m.receiveShadow = true; g.add(m);
          }
          bakeStatic(g);
        })();

        // ---- CÂY CỔ THỤ — GIỮ DÁNG GỐC (đẹp nhất): thân xoắn + cành tay vươn ra sông · cành con mảnh 1/3 · LÁ HEXAGON (đĩa 6 cạnh giống lá cây táo, instanced) ----
        let oldTreeGroup;
        (function oldTree() {
          const g = new THREE.Group(); g.position.set(X0 + 89, 7, Z0 + 117); g.scale.setScalar(2.76); g.rotation.set(0, 0, 0.62); g.name = 'Cây cổ thụ (Old Tree)'; scene.add(g);   // ngả thân về phía dòng sông (-x)
          oldTreeGroup = g;
          const TOP = 0.85;
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x4a3420, transparent: true, opacity: TOP }), deadMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: TOP });
          barkMat.userData.sfOld = deadMat.userData.sfOld = 1;   // G 17/10 "cây cổ thụ render tệ, nhìn giả, sửa lại về render cũ": vân vỏ bản trước (không ảnh quét, không địa y loang)   // G 17/10: vết loang trên thân cổ thụ màu NÂU ĐEN (không xám trắng)
          // cây cổ thụ: thân to, tán nặng → dao động riêng chậm ~0,32 Hz, cản nhỏ (gỗ già ít tắt dần); cành xa thân rung ~1 Hz
          const tw = makeTreeWind({ freq: 0.32, zeta: 0.08, lean: 0.45, branchAmp: 0.07 });
          windShader(barkMat, tw, 0); windShader(deadMat, tw, 0); g.userData.treeWind = tw;
          surfaceStyle(barkMat, 'bark'); surfaceStyle(deadMat, 'bark');   // vân vỏ (core/surface-style.js) — SAU shader gió (windShader ghi đè onBeforeCompile)
          const leafCols = [0x4e7a39, 0x5e8c44, 0x6fa052, 0x42692f, 0x567f3a, 0x4e7a39, 0x5e8c44, 0x6fa052, 0x42692f, 0x567f3a, 0xe5b82c];
          const rnd = mulberry32(7777), tips = [], deadTips = [];
          const up = new THREE.Vector3(0, 1, 0), V = (x, y, z) => new THREE.Vector3(x, y, z);

          const storkBranchPieces = []; let storkBranchSegment = -1;
          g.userData.storkBranchPieces = storkBranchPieces;
          // CÀNH = BẢN GHI điểm gấp khúc (lưới ống cong liền dựng 1 lần ở cuối bằng barkTubes — G 17/10 "render cho cây cổ thụ luôn" sau khi sửa chỗ gấp
          // cây táo: bản cũ là trụ 7 cạnh + quả cầu ở mọi khớp, 6 cầu dẹt làm bạnh gốc). Thứ tự gọi rnd() giữ nguyên ⇒ dáng cây, lá, chỗ cò/bướm đậu không đổi
          const LB = [], LD = [];   // cành vỏ nâu · cành gỗ chết
          const mkLimb = (list, a, r, par, atEnd, pr, pT) => { const l = { P: [a], R: [r], par, kids: [], atEnd, pr, pT }; list.push(l); if (par) par.kids.push(l); return l; };
          const limb = (a, b, r1, r2, L) => {
            L.P.push(b); L.R.push(r2);
            if (storkBranchSegment >= 0) storkBranchPieces.push({ a: a.toArray(), b: b.toArray(), r1, r2, segment: storkBranchSegment });
          };

          // Hàm vẽ cành đệ quy bẻ cong tự nhiên (Recursive Midpoint Displacement)
          const crookedLimb = (a, b, r1, r2, L, depth = 0, maxDepth = 2) => {
            const d = new THREE.Vector3().subVectors(b, a), len = d.length();
            if (depth >= maxDepth || len < 0.12 || r1 < 0.015) return limb(a, b, r1, r2, L);
            const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), dir = d.clone().normalize();
            let tAxis = (Math.abs(dir.y) > 0.9) ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            const p1 = new THREE.Vector3().crossVectors(dir, tAxis).normalize();
            const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
            const jF = len * 0.15, ang = rnd() * 6.283;
            mid.addScaledVector(p1, Math.cos(ang) * jF).addScaledVector(p2, Math.sin(ang) * jF);
            const midR = (r1 + r2) * 0.5;
            crookedLimb(a, mid, r1, midR, L, depth + 1, maxDepth);
            crookedLimb(mid, b, midR, r2, L, depth + 1, maxDepth);
          };

          // thân gỗ xoắn (DÁNG GỐC hand-crafted — dáng đẹp nhất, không đệ quy); bạnh gốc 6 múi = ống loe ở chân thân (barkTubes)
          const trunk = [V(0, 0, 0), V(0.12, 0.85, 0.12), V(-0.18, 1.7, 0.28), V(0.22, 2.4, 0.1), V(0.06, 3.0, 0.22)];

          const getTrunkPoint = (y) => {
            if (y <= 0.85) return new THREE.Vector3().lerpVectors(trunk[0], trunk[1], y / 0.85);
            if (y <= 1.7) return new THREE.Vector3().lerpVectors(trunk[1], trunk[2], (y - 0.85) / 0.85);
            if (y <= 2.4) return new THREE.Vector3().lerpVectors(trunk[2], trunk[3], (y - 1.7) / 0.7);
            return new THREE.Vector3().lerpVectors(trunk[3], trunk[4], Math.min(1, (y - 2.4) / 0.6));
          };

          const TR = mkLimb(LB, trunk[0], 0.6, null, false); TR.root = true;
          let r = 0.6;
          for (let i = 0; i < trunk.length - 1; i++) { crookedLimb(trunk[i], trunk[i + 1], r, r * 0.85, TR); r *= 0.85; }
          const trunkAt = (y) => { const i = y <= 0.85 ? 0 : y <= 1.7 ? 1 : y <= 2.4 ? 2 : 3, f = Math.min(1, Math.max(0, (y - trunk[i].y) / (trunk[i + 1].y - trunk[i].y)));   // bán kính + hướng thân ở độ cao y
            return { r: 0.6 * Math.pow(0.85, i) * (1 - 0.15 * f), d: trunk[i + 1].clone().sub(trunk[i]).normalize() }; };

          // 5 cành chính vươn rộng ra sông
          const branches = [
            [V(-0.1, 1.7, 0.25), V(-1.1, 2.3, 0.45), V(-2.2, 2.8, 0.6), V(-3.4, 3.1, 0.55), V(-4.8, 3.25, 0.4)],
            [V(0.2, 2.2, 0.1), V(0.95, 2.7, -0.15), V(1.85, 3.15, -0.05), V(2.85, 3.4, 0.2)],
            [V(0.1, 2.4, 0.2), V(0.35, 3.0, -0.9), V(0.55, 3.55, -1.75)],
            [V(0.06, 3.0, 0.22), V(0.18, 3.65, 0.25), V(0.35, 4.35, 0.2)],
            [V(0.1, 2.6, 0.2), V(1.2, 3.2, 0.8), V(2.1, 3.7, 1.3)]
          ];

          // Snap branches' start point to trunk line
          branches.forEach(br => {
            br[0].copy(getTrunkPoint(br[0].y));
          });

          branches.forEach((br, bIdx) => {
            const scale = (bIdx === 0) ? 0.248 : 0.75; // Nhánh sông ngắn thêm 20% (0.31 * 0.8 = 0.248)
            for (let i = 1; i < br.length; i++) {
              const vec = br[i].clone().sub(br[i - 1]);
              vec.multiplyScalar(scale);
              if (bIdx === 0) vec.y += 0.32;   // Uốn ngóc đầu lên sông nhiều hơn
              br[i] = br[i - 1].clone().add(vec);
            }
          });

          g.userData.mainBranches = branches.map(br => br.map(v => v.clone()));   // đường tâm 5 cành chính (toạ độ cục bộ) — chỗ bướm đậu trú mưa
          // NHÁNH MỚI ĐỆ QUY mọc tiếp từ đầu mỗi cành chính — đường kính nhỏ dần ×0.6/cấp giống cây táo,
          // hướng bị ghìm ngang (dir.y ≤ 0.5) để tán tỏa rộng mà KHÔNG tăng chiều cao cây
          // par/atEnd/pr/pT: cành mẹ · mọc ở NGỌN cành mẹ (chỗ chẻ ⇒ nối liền / tách dần) hay mọc ngang giữa cành (cắm từ tim ra, cổ cành) · bán kính + hướng mẹ ở đó
          function sprout(a, dir, len, r, depth, bIdx, isSide = false, par = null, atEnd = true, pr, pT) {
            const b = a.clone().addScaledVector(dir, len);
            b.x += (rnd() - 0.5) * len * 0.3; b.z += (rnd() - 0.5) * len * 0.3;
            const L = mkLimb(LB, a, r, par, atEnd, pr, pT);
            crookedLimb(a, b, r, r * 0.54, L); // Đường kính nhỏ hơn 10% (0.6 * 0.9 = 0.54)
            if (depth >= 3 || r * 0.54 < 0.008) { tips.push({ pos: b, bIdx, isSide, from: a.clone(), dir: dir.clone(), radius: r, limb: L }); return; }
            const n = 2 + ((rnd() * 2) | 0);
            for (let k = 0; k < n; k++) {
              const nd = dir.clone().add(V((rnd() - 0.5) * 1.5, (rnd() - 0.4) * 0.6, (rnd() - 0.5) * 1.5)).normalize();
              if (nd.y > 0.5 || nd.y < 0) { nd.y = Math.max(0, Math.min(0.5, nd.y)); nd.normalize(); }   // không chúc xuống (cành sông khỏi chọc nước) · không vọt cao
              sprout(b, nd, len * 0.875 * (0.75 + rnd() * 0.5), r * 0.54, depth + 1, bIdx, isSide, L, true); // 25% longer (0.7 * 1.25 = 0.875)
            }
          }
          for (let bIdx = 0; bIdx < branches.length; bIdx++) {
            const br = branches[bIdx];
            let rb = (bIdx === 0) ? 0.237 : 0.182; const rbs = [rb];
            // cành chính: cành 3 mọc đúng NGỌN thân ⇒ thân chạy liền vào cành; cành khác cắm ngang từ tim thân ra (cổ cành phình thay quả cầu cũ)
            const tk = trunkAt(br[0].y), BL = mkLimb(LB, br[0], rb, TR, br[0].distanceTo(trunk[4]) < 1e-6, tk.r, tk.d);

            for (let i = 0; i < br.length - 1; i++) {
              storkBranchSegment = bIdx === 0 ? i : -1;
              crookedLimb(br[i], br[i + 1], rb, rb * 0.78, BL);
              storkBranchSegment = -1;
              rb *= 0.78; rbs.push(rb);
            }
            const e = br[br.length - 1], d0 = e.clone().sub(br[br.length - 2]).normalize();
            sprout(e, d0, 0.62 * 1.25, rb * 0.9, 0, bIdx, false, BL, true); // 25% longer, 10% thinner

            // Sinh thêm nhánh đệ quy phụ từ giữa thân của cành chính (trừ cành hướng ra sông bIdx === 0)
            if (bIdx !== 0 && br.length >= 3) {
              const jointsToSprout = br.length > 3 ? [1, 2] : [1];
              for (const idx of jointsToSprout) {
                const midPt = br[idx];
                const d_mid = midPt.clone().sub(br[idx - 1]).normalize();
                const numSprouts = idx === 1 ? 2 : 3;
                for (let k = 0; k < numSprouts; k++) {
                  const sideDir = d_mid.clone().add(V((rnd() - 0.5) * 2.2, 0.2 + rnd() * 0.4, (rnd() - 0.5) * 2.2)).normalize();
                  sprout(midPt, sideDir, 0.42 * (0.8 + rnd() * 0.4) * 1.25, rbs[idx] * 0.55 * 0.9, 1, bIdx, true, BL, false, rbs[idx], d_mid); // 25% longer, 10% thinner
                }
              }
            }

            // Phục hồi cành phụ cho cành vươn sông (bIdx === 0), cũng ngắn đi 20%
            if (bIdx === 0) {
              if (br.length > 3) {
                const midPt = br[2];
                const d_mid = midPt.clone().sub(br[1]).normalize();
                const sideDir = d_mid.clone().add(V((rnd() - 0.5) * 1.6, 0.38, (rnd() - 0.5) * 1.6)).normalize();
                sprout(midPt, sideDir, 0.52 * 1.25 * 0.8, rbs[2] * 0.8 * 0.9, 1, bIdx, true, BL, false, rbs[2], d_mid);
              }
              if (br.length > 2) {
                const lowPt = br[1];
                const d_low = lowPt.clone().sub(br[0]).normalize();
                const riverDir = d_low.clone().add(V(-1.2, -0.15, (rnd() - 0.5) * 1.4)).normalize();
                sprout(lowPt, riverDir, 0.48 * 1.25 * 0.8, rbs[1] * 0.85 * 0.9, 1, bIdx, true, BL, false, rbs[1], d_low);
              }
            }
          }
          // nhánh GỖ CHẾT trắng (đặc trưng cây già) — giữ tay
          const dead = [V(0.22, 2.4, 0.1), V(0.95, 3.0, -0.25), V(1.55, 3.6, -0.1), V(1.95, 4.0, 0.1)];
          const tk3 = trunkAt(2.4), DL = mkLimb(LD, dead[0], 0.2, null, false, tk3.r, tk3.d);   // cắm ngang vào thân (lưới riêng — vật liệu gỗ chết)
          let rd = 0.2; for (let i = 0; i < dead.length - 1; i++) { crookedLimb(dead[i], dead[i + 1], rd, rd * 0.68, DL); rd *= 0.68; }
          function deadTwig(a, b, r1, r2, atEnd, pr, pT) {
            const L = mkLimb(LD, a, r1, DL, atEnd, pr, pT);
            crookedLimb(a, b, r1, r2, L);
            deadTips.push({ from: a.clone(), pos: b, dir: b.clone().sub(a).normalize(), radius: r1, limb: L });
          }
          deadTwig(V(1.55, 3.6, -0.1), V(1.9, 4.3, -0.35), 0.09, 0.025, false, 0.2 * 0.68 * 0.68, dead[2].clone().sub(dead[1]).normalize());
          deadTwig(V(1.95, 4.0, 0.1), V(2.4, 4.5, 0.3), 0.08, 0.025, true);

          // Refine only terminal twigs after the seeded scaffold has been generated.
          // A separate seed keeps the trunk, larger limbs and foliage random sequence unchanged.
          const tipRnd = mulberry32(7781);
          function refineTerminalTwig(tp) {
            const a = tp.from, axis = tp.pos.clone().sub(a), originalLength = axis.length();
            const factor = 0.50 + tipRnd() * 0.16;
            const end = a.clone().addScaledVector(axis, factor), length = originalLength * factor;
            const along = axis.clone().normalize();
            const across = new THREE.Vector3().crossVectors(along, Math.abs(along.y) > 0.9 ? V(1, 0, 0) : up).normalize();
            const c1 = a.clone().addScaledVector(tp.dir, length * 0.32);
            const c2 = end.clone().addScaledVector(along, -length * 0.28)
              .addScaledVector(across, (tipRnd() - 0.5) * length * 0.14);
            c2.y += length * (0.025 + tipRnd() * 0.04);
            const curve = new THREE.CubicBezierCurve3(a.clone(), c1, c2, end);
            // cành ngọn = đường cong Bézier thuôn nhọn (7 điểm) thay cho các điểm gấp khúc của cành đó — vẫn nằm trong chuỗi ống liền với cành mẹ
            const L = tp.limb, steps = 6; L.P = [L.P[0]]; L.R = [tp.radius];
            for (let i = 1; i <= steps; i++) { const t = i / steps; L.P.push(curve.getPoint(t)); L.R.push(tp.radius * (0.10 + 0.90 * Math.pow(1 - t, 1.15))); }
            tp.pos.copy(end); // Leaf clusters and falling-leaf origins follow the shorter twig.
          }
          for (const tp of tips) refineTerminalTwig(tp);
          for (const tp of deadTips) refineTerminalTwig(tp);
          const OT = { flare: 0.42, flareH: 0.7, lobes: 6, sink: 0.55, wS: 2.76 * 0.9, segMax: 12, nodes: false };   // bạnh 6 múi ~2 m như 6 cầu dẹt cũ (đá cuội quanh gốc còn lộ) · gốc cắm sâu: thân ngả 35° ⇒ mép trên vòng chân thân vẫn chạm đất
          g.add(...barkMesh(barkTubes(LB, OT), barkMat)); g.add(...barkMesh(barkTubes(LD, OT), deadMat));
          // ---- LÁ HEXAGON chỉ tập trung ở vùng cành đệ quy sub-branches và mở rộng không gian tán lá ----
          const pts = [];
          for (const tp of tips) {
            const isRiver = (tp.bIdx === 0);
            const radius = isRiver ? 1.1 : 1.62;   // các cành còn lại tăng phủ 30% (1.25 * 1.3 ≈ 1.62)
            let count = isRiver ? 70 : 140;       // cành sông giảm mật độ lá 50% (140 * 0.5 = 70)
            if (tp.isSide) {
              count = Math.round(count * 0.8);  // Giảm 20% mật độ lá quanh các nhánh phụ mới đệ quy
            }
            cloudPts(rnd, tp.pos.x, tp.pos.y + 0.08, tp.pos.z, radius, count, pts);
          }
          tuftInstanced(g, rnd, pts, leafHexGeo(0.05), leafCols, 0.76, 0.7, tw, 0.04);   // lá cây cổ thụ trong suốt hơn 10% (0.85 * 0.9 = 0.76)
          g.userData.leafPts = pts;   // lá vàng rụng sinh từ chính các chùm lá (toạ độ cục bộ)

          bakeStatic(g);
        })();

        // ---- THÂN CÂY PHỤ NHỎ HƠN mọc từ gốc tại x91 y7 z117 ----
        (function smallSubTree() {
          const g = new THREE.Group(); g.name = 'Cây con (Small Sub-Tree)';
          g.position.set(X0 + 91, 7.0, Z0 + 117); g.scale.set(1.705, 1.86, 1.705); g.rotation.set(0.1, 0, 0.35); // Gốc to 10% (1.55*1.1=1.705), cao thêm 20% (1.55*1.2=1.86)
          if (oldTreeGroup) {
            oldTreeGroup.attach(g);
          } else {
            scene.add(g);
          }
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x4a3420, transparent: true, opacity: 0.65 }); barkMat.userData.sfOld = 1; surfaceStyle(barkMat, 'bark');   // vân vỏ như cây mẹ (bản cũ)
          const leafCols = [0x4e7a39, 0x5e8c44, 0x6fa052, 0x42692f];
          const V = (x, y, z) => new THREE.Vector3(x, y, z);

          // cành = bản ghi điểm gấp khúc, lưới ống liền dựng ở cuối (barkTubes) — như cây mẹ; thứ tự rnd() giữ nguyên ⇒ dáng + điểm treo tổ ong không đổi
          const LB = [], mkLimb = (a, r, par, atEnd, pr, pT) => { const l = { P: [a], R: [r], par, kids: [], atEnd, pr, pT }; LB.push(l); if (par) par.kids.push(l); return l; };
          const limb = (a, b, r1, r2, L) => { L.P.push(b); L.R.push(r2); };

          const rnd = mulberry32(1234);
          // Hàm vẽ cành đệ quy bẻ cong tự nhiên (Recursive Midpoint Displacement)
          const crookedLimb = (a, b, r1, r2, L, depth = 0, maxDepth = 2) => {
            const d = new THREE.Vector3().subVectors(b, a), len = d.length();
            if (depth >= maxDepth || len < 0.12 || r1 < 0.015) return limb(a, b, r1, r2, L);
            const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), dir = d.clone().normalize();
            let tAxis = (Math.abs(dir.y) > 0.9) ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            const p1 = new THREE.Vector3().crossVectors(dir, tAxis).normalize();
            const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
            const jF = len * 0.15, ang = rnd() * 6.283;
            mid.addScaledVector(p1, Math.cos(ang) * jF).addScaledVector(p2, Math.sin(ang) * jF);
            const midR = (r1 + r2) * 0.5;
            crookedLimb(a, mid, r1, midR, L, depth + 1, maxDepth);
            crookedLimb(mid, b, midR, r2, L, depth + 1, maxDepth);
          };

          const trunk = [V(0, 0, 0), V(0.15, 0.7, 0.1), V(-0.1, 1.4, 0.2), V(0.2, 2.1, 0.15)];
          const TR = mkLimb(trunk[0], 0.21, null, false); TR.root = true;
          let r = 0.21;   // đường kính thân nhỏ đi 50% (0.42 → 0.21)
          for (let i = 0; i < trunk.length - 1; i++) { crookedLimb(trunk[i], trunk[i + 1], r, r * 0.82, TR); r *= 0.82; }
          const tDir = (i) => trunk[i + 1].clone().sub(trunk[i - 1]).normalize();   // hướng thân ở khớp tay i
          const sBranches = [
            [V(-0.1, 1.4, 0.2), V(-0.8, 1.9, 0.4), V(-1.6, 2.3, 0.5)],
            [V(0.2, 2.1, 0.15), V(0.9, 2.6, -0.2), V(1.6, 3.0, -0.1)],
            [V(0.2, 2.1, 0.15), V(-0.2, 2.7, 0.6), V(-0.5, 3.2, 0.9)]
          ];
          // ---- NHÁNH ĐỆ QUY NHỎ: từ đầu mỗi cành chính rẽ tiếp 2-3 nhánh con mỗi cấp (dài & bán kính ×0.7) → tán rậm, tự nhiên như cây cổ thụ ----
          const sTips = [];
          function sSprout(a, dir, len, rr, depth, par, atEnd = true, pr, pT) {
            const b = a.clone().addScaledVector(dir, len);
            b.x += (rnd() - 0.5) * len * 0.3; b.z += (rnd() - 0.5) * len * 0.3;
            const L = mkLimb(a, rr, par, atEnd, pr, pT);
            crookedLimb(a, b, rr, rr * 0.7, L);
            if (depth >= 3 || rr * 0.7 < 0.012) { sTips.push(b); return; }
            const n = 2 + ((rnd() * 2) | 0);
            for (let k = 0; k < n; k++) {
              const nd = dir.clone().add(V((rnd() - 0.5) * 1.4, (rnd() - 0.25) * 0.7, (rnd() - 0.5) * 1.4)).normalize();
              if (nd.y < 0) { nd.y = 0; nd.normalize(); }   // không chúc xuống đất
              sSprout(b, nd, len * 0.7 * (0.75 + rnd() * 0.4), rr * 0.7, depth + 1, L, true);
            }
          }
          // ---- NHÁNH PHỤ TRÊN THÂN CHÍNH (Trunk side branches) ----
          const tBranchDir1 = V(-0.6, 0.4, -0.6).normalize();
          sSprout(trunk[1], tBranchDir1, 0.45, 0.11, 0, TR, false, 0.21 * 0.82, tDir(1));
          const tBranchDir2 = V(0.6, 0.3, 0.5).normalize();
          sSprout(trunk[2], tBranchDir2, 0.38, 0.08, 0, TR, false, 0.21 * 0.82 * 0.82, tDir(2));

          for (const br of sBranches) {
            let rb = 0.11;   // cành nhỏ theo thân (nhỏ đi 50%: 0.22 → 0.11)
            // mọc ở ngọn thân (2 cành chẻ đôi) ⇒ 1 cành chạy liền thân, cành kia tách dần · cành mọc giữa thân cắm ngang (cổ cành thay quả cầu cũ)
            const atTop = br[0].distanceTo(trunk[3]) < 1e-6, BL = mkLimb(br[0], rb, TR, atTop, atTop ? undefined : 0.21 * 0.82 * 0.82, atTop ? undefined : tDir(2));
            for (let i = 0; i < br.length - 1; i++) {
              crookedLimb(br[i], br[i + 1], rb, rb * 0.76, BL);

              // Thêm nhánh đệ quy nhỏ vào thân giữa của nhánh chính (khớp br[1])
              if (i === 0) {
                const dMid = br[1].clone().sub(br[0]).normalize();
                const sideDir = dMid.clone().add(V((rnd() - 0.5) * 1.6, 0.3, (rnd() - 0.5) * 1.6)).normalize();
                if (sideDir.y < 0) sideDir.y = 0.1;
                sideDir.normalize();
                sSprout(br[1], sideDir, 0.38, rb * 0.76, 0, BL, false, rb * 0.76, dMid);
              }

              rb *= 0.76;
            }
            const e = br[br.length - 1], d0 = e.clone().sub(br[br.length - 2]).normalize();
            sSprout(e, d0, 0.5, rb, 0, BL, true);   // nối nhánh đệ quy theo hướng cành chính
          }
          g.add(...barkMesh(barkTubes(LB, { flare: 0.5, sink: 0.25, wS: 1.75 * 0.9, nodes: false }), barkMat));   // cây con giữ cỡ thế giới ~1,75 × NATURE_SCALE khi gắn vào cây mẹ
          // ---- TÁN LÁ HEXAGON x3 rậm hơn — gom ở đầu các nhánh đệ quy (đĩa lá 6 cạnh instanced, giống cây cổ thụ) ----
          const sLeafPts = [];
          const perTip = Math.max(20, Math.round(810 / sTips.length));   // tổng ~810 điểm lá = gấp 3 lần trước (3 cụm × 90 = 270)
          for (const tp of sTips) cloudPts(rnd, tp.x, tp.y + 0.05, tp.z, 0.55, perTip, sLeafPts);
          tuftInstanced(g, rnd, sLeafPts, leafHexGeo(0.05), leafCols, 0.85);
          // ---- điểm treo TỔ ONG trên cành cây con (tổ ong giỏ rơm dựng ở animals/beehive.js, treo thẳng đứng từ điểm này) ----
          const hiveAnchor = new THREE.Object3D(); hiveAnchor.position.set(-3.4425, 3.5108, 0.3995); g.add(hiveAnchor); g.userData.hiveAnchor = hiveAnchor;

          bakeStatic(g);
        })();

        if (oldTreeGroup) {
          oldTreeGroup.scale.multiplyScalar(NATURE_SCALE);
          const subtree = oldTreeGroup.getObjectByName('Cây con (Small Sub-Tree)');
          if (subtree && subtree.parent === oldTreeGroup) subtree.position.multiplyScalar(1 / NATURE_SCALE);
          oldTreeGroup.updateMatrixWorld(true);
          oldTreeWind = oldTreeGroup.userData.treeWind; finalizeTreeWind(oldTreeWind, oldTreeGroup);   // gốc/chiều cao/tán đo SAU khi thu theo NATURE_SCALE
          oldTreeLeafCtl = makeLeafFall({ name: 'Lá cây cổ thụ rụng theo gió', group: oldTreeGroup, pts: oldTreeGroup.userData.leafPts, n: 16,
            geo: new THREE.CylinderGeometry(0.045 * 2.3, 0.045 * 2.3, 0.0015 * 2.3, 6), opacity: 0.76, color: () => Math.random() < 0.85 ? 0xe5b82c : 0x5e8c44,   // 85% lá vàng, 15% lá xanh
            scale: NATURE_SCALE, tw: oldTreeWind, g: 3.5, vTerm: 0.7, flutA: 0.7, flutW: [2.2, 3.2], tumble: 0.35, tumbleW: [6, 10], slideU: 0.6, rate0: 0.05, rateK: 3.0, shake0: 0.012, restLife: [12, 24], floatLife: [30, 55], sinkP: 0.35, sinkV: [0.06, 0.1], leeway: 0.03 });
        }

