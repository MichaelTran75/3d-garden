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
          const TOP = 0.935;   // G 18/10 "cây cổ thụ 10% more visible": vỏ 0,85 → 0,935 (lá 0,76 → 0,836, cây con theo cùng tỉ lệ)
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

          // mấu cành cũ đã cưa / gãy, vỏ liền thành gờ tròn (thân pohutukawa trong bản quét có vài mấu như vậy) — số cố định, không lấy rnd() ⇒ dáng cũ giữ nguyên
          for (const [y, ang, r] of [[1.15, 0.9, 0.11], [1.95, -2.3, 0.085]]) {
            const tk = trunkAt(y), a = getTrunkPoint(y), d = V(Math.cos(ang), 0.45, Math.sin(ang)).normalize(), L = mkLimb(LB, a, r, TR, false, tk.r, tk.d);
            crookedLimb(a, a.clone().addScaledVector(d, tk.r + 0.26), r, r * 0.8, L, 0, 1);
          }
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
          // SỢI BỆN kiểu thân pohutukawa (nature/flowers-trees.js ropeChain/ropeAt): 12 sợi to nhỏ xoắn 0,5 rad/m, rãnh sâu ~21% r (gốc ×2,5) · u lồi + 1 hốc mục trên thân
          //  (s: m dọc thân tính từ chân cắm đất 1,37 m · góc quanh thân: 0 = +x, −π/2 = +z cục bộ; hốc quay về hướng nhìn mặc định +x+z)
          const ROPE = { minR: 0.3, nTrunk: 12, D: 0.26, twist: 0.5, trunk: { burls: [[2.25, 2.2, 0.32, 0.1], [4.7, 0.5, 0.3, 0.08], [5.9, -2.5, 0.38, 0.09], [3.3, -0.9, 0.22, 0.07]], cav: [5.2, -0.9, 0.45, 0.32] } };
          const OT = { flare: 0.5, flareH: 0.85, lobes: 6, sink: 0.55, wS: 2.76 * 0.9, segMax: 12, nodes: false, rope: ROPE };   // bạnh 6 múi ~2 m như 6 cầu dẹt cũ (đá cuội quanh gốc còn lộ) · gốc cắm sâu: thân ngả 35° ⇒ mép trên vòng chân thân vẫn chạm đất
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
          tuftInstanced(g, rnd, pts, leafHexGeo(0.05), leafCols, 0.836, 0.7, tw, 0.04);   // lá cây cổ thụ trong suốt hơn 10% (0.85 * 0.9 = 0.76)
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
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x4a3420, transparent: true, opacity: 0.715 }); barkMat.userData.sfOld = 1; surfaceStyle(barkMat, 'bark');   // vân vỏ như cây mẹ (bản cũ)
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
          g.add(...barkMesh(barkTubes(LB, { flare: 0.5, sink: 0.25, wS: 1.75 * 0.9, nodes: false, rope: { minR: 0.3, nTrunk: 6, D: 0.13, twist: 0.5, trunk: { burls: [[1.1, 1.0, 0.18, 0.08]] } } }), barkMat));   // sợi bện như thân mẹ (nhẹ hơn)   // cây con giữ cỡ thế giới ~1,75 × NATURE_SCALE khi gắn vào cây mẹ
          // ---- TÁN LÁ HEXAGON x3 rậm hơn — gom ở đầu các nhánh đệ quy (đĩa lá 6 cạnh instanced, giống cây cổ thụ) ----
          const sLeafPts = [];
          const perTip = Math.max(20, Math.round(810 / sTips.length));   // tổng ~810 điểm lá = gấp 3 lần trước (3 cụm × 90 = 270)
          for (const tp of sTips) cloudPts(rnd, tp.x, tp.y + 0.05, tp.z, 0.55, perTip, sLeafPts);
          tuftInstanced(g, rnd, sLeafPts, leafHexGeo(0.05), leafCols, 0.935);
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
            geo: new THREE.CylinderGeometry(0.045 * 2.3, 0.045 * 2.3, 0.0015 * 2.3, 6), opacity: 0.836, color: () => Math.random() < 0.85 ? 0xe5b82c : 0x5e8c44,   // 85% lá vàng, 15% lá xanh
            scale: NATURE_SCALE, tw: oldTreeWind, g: 3.5, vTerm: 0.7, flutA: 0.7, flutW: [2.2, 3.2], tumble: 0.35, tumbleW: [6, 10], slideU: 0.6, rate0: 0.05, rateK: 3.0, shake0: 0.012, restLife: [12, 24], floatLife: [30, 55], sinkP: 0.35, sinkV: [0.06, 0.1], leeway: 0.03 });
        }

        // ---- RỄ BÒ MẶT ĐẤT quanh gốc cây cổ thụ (G 18/10 ảnh gốc pohutukawa; dựng lại 18/10 "nghiên cứu cách rễ mọc trồi lên mặt đất … tránh rễ rời rạc
        //      và ko kết nối"). Học: rễ chính (4–11, cây già nhiều hơn) mọc từ BẠNH GỐC (root collar · trunk flare) toả gần như nằm ngang trong lớp đất mặt
        //      ~30 cm (nhiều ô-xy), lộ lên khi đất mòn / bị nén / rễ già to ra; ngay ngoài chân thân rễ thuôn rất nhanh (vùng thuôn nhanh — ZRT: cách gốc 2–3 m
        //      chỉ còn 2–5 cm, Dobson) và lớn lệch lên trên (tiết diện chữ T / I gần gốc — Nicoll & Ray 1996) ⇒ gờ cao sát chân thân rồi chìm dần vào đất; gặp
        //      đá thì lách / ôm theo mặt đá; rễ con tách ra từ rễ mẹ. Bản trước: rễ bắt đầu cách tâm 0,95 (không bám múi bạnh), lặn ngẫu nhiên rồi trồi, chui
        //      dưới đá ⇒ nhiều khúc rời lơ lửng. Bây giờ: mỗi rễ chính mọc từ 1 MÚI BẠNH THẬT (đo bán kính chân thân theo góc trên lưới vỏ đã dựng), bắt đầu
        //      TRONG LÒNG THÂN như cành mọc ngang (barkTubes: cổ rễ phình + pháp tuyến hoà theo mặt thân quanh trục ngả 35°); độ lộ e = (tâm − mặt đất) / r
        //      giảm ĐƠN ĐIỆU tới chìm hẳn ⇒ phần nổi là 1 dải liền từ chân thân (gợn nhẹ chỉ khi còn lộ nhiều, tắt trước khi chìm); lách đá + gốc cây con theo
        //      mép (điểm kế lấn vòng ôm thì chiếu ra mép, hướng đi bẻ theo); tới gần nước thì chìm hết trước mép nước; rễ con tách ở đoạn rễ mẹ còn lộ, mọc từ
        //      TIM rễ mẹ ở đúng độ cao đó. Nhóm riêng theo toạ độ thế giới (đất quanh gốc phẳng + nền đất 0,12 của stoneRing), KHÔNG gắn shader gió ----
        (function oldTreeRoots() {
          const cx = X0 + 89, cz = Z0 + 117, gy = cowY(cx, cz), g = new THREE.Group(); g.name = 'Rễ cây cổ thụ'; g.position.set(cx, gy, cz); scene.add(g); flightRoots.push(g);
          const mat = new THREE.MeshLambertMaterial({ color: 0x4a3420, transparent: true, opacity: 0.935 }); mat.userData.sfOld = 1; mat.userData.sfMoss = 0.15; surfaceStyle(mat, 'bark');   // sát đất cả rễ ⇒ rêu gốc phủ kín nếu để mặc định
          const rnd = mulberry32(4242), V = (x, y, z) => new THREE.Vector3(x, y, z), L = [], SAMP = [], STEP = 0.26, KE = 0.5, EM = -0.35, E1 = -2.0;   // rễ thuôn còn 50% ở đoạn nổi · nổi e 0,3 → −0,35 rồi cắm DỐC (~35°, quãng ~2,2 r) xuống −2 r · SAMP: mẫu các rễ đã dựng (rễ sau vắt qua)
          const water = (x, z) => isWater(Math.round(x2gi(cx + x)), Math.round(z2gj(cz + z)));
          const ground = (x, z) => cowY(cx + x, cz + z) - gy + 0.12 * Math.max(0, Math.min(1, (2.5 - Math.hypot(x, z)) / 0.3));   // + nền đất quanh gốc (stoneRing: trụ r 2,2 → 2,5, cao 0,12)
          // vòng ôm (x, z, r): 3 đá của stoneRing (12 mặt r 0,85 × tỉ lệ ⇒ ~0,8 bán kính ngoại tiếp) + gốc cây con (x + 2)
          const OBST = [[0.3, 1.25, 1.02], [1.5, -0.4, 0.68], [-1.35, 0.5, 0.42], [2.0, 0.0, 0.42]];
          // ---- múi bạnh THẬT: bán kính chân thân theo góc (đỉnh lưới vỏ cao 0,05–0,55 trên đất; ô trống giữa 2 vòng lưới nội suy) → đỉnh cục bộ = chỗ rễ chính chui ra ----
          const NB = 72, rho = new Float32Array(NB), v = V(0, 0, 0), sub = oldTreeGroup.getObjectByName('Cây con (Small Sub-Tree)');
          oldTreeGroup.updateMatrixWorld(true);
          oldTreeGroup.traverse(o => {
            if (!o.isMesh || o.isInstancedMesh || !o.material || !o.material.colorWrite || !o.material.color || o.material.color.getHex() !== 0x4a3420) return; for (let p = o; p; p = p.parent) if (p === sub) return;
            const P = o.geometry.attributes.position;
            for (let i = 0; i < P.count; i++) { v.fromBufferAttribute(P, i).applyMatrix4(o.matrixWorld); const y = v.y - gy; if (y < 0.05 || y > 0.55) continue;
              const x = v.x - cx, z = v.z - cz, d = Math.hypot(x, z); if (d > 3.5) continue; const b = Math.floor((Math.atan2(z, x) / 6.2832 + 1) * NB) % NB; if (d > rho[b]) rho[b] = d; }
          });
          for (let b = 0; b < NB; b++) if (!rho[b]) { let l = 1, r = 1; while (!rho[(b - l + NB) % NB] && l < NB) l++; while (!rho[(b + r) % NB] && r < NB) r++; rho[b] = ((rho[(b - l + NB) % NB] || 1.4) * r + (rho[(b + r) % NB] || 1.4) * l) / (l + r); }
          const at = b => { b = ((b % NB) + NB) % NB; return (rho[(b + NB - 1) % NB] + 2 * rho[b] + rho[(b + 1) % NB]) / 4; }, peaks = [];
          for (let b = 0; b < NB; b++) { let mx = true, mn = 9; for (let k = 1; k <= 2; k++) if (at(b - k) > at(b) || at(b + k) > at(b)) mx = false; for (let k = -5; k <= 5; k++) mn = Math.min(mn, at(b + k)); if (mx) peaks.push({ b, rr: at(b), pr: at(b) - mn }); }
          peaks.sort((a, b) => b.pr - a.pr);
          const lobes = []; for (const p of peaks) { if (lobes.length >= 11) break; if (!lobes.some(q => Math.min(Math.abs(q.b - p.b), NB - Math.abs(q.b - p.b)) < 4)) lobes.push(p); }
          const axis = V(0, 1, 0).applyQuaternion(oldTreeGroup.quaternion).normalize();   // trục thân ngả về sông ⇒ pháp tuyến chỗ nối hoà theo mặt thân thật
          // 1 rễ: x, z, y0 (độ cao tâm điểm đầu so với đất gốc) · a hướng · len (tới khi chìm hẳn) · r0 · sX (đoạn còn trong lòng thân / rễ mẹ) · zrt (quãng thuôn nhanh)
          function root(x, z, y0, a, len, r0, sX, zrt, par, pr, pT, depth) {
            const rAt = s => s <= sX ? r0 : r0 * (KE + (1 - KE) * Math.exp(-(s - sX) / zrt));   // rễ lộ là đoạn to (trong vùng thuôn nhanh) — rễ mảnh đã nằm dưới đất
            // (1) đường đi trên mặt bằng: 2 sóng sin + trôi chậm, lách vật cản, dừng trước nước
            const pts = [[x, z, 0]], ph1 = rnd() * 6.28, ph2 = rnd() * 6.28, A1 = 0.12 + 0.1 * rnd(), A2 = 0.05 + 0.04 * rnd(), dr = (rnd() - 0.5) * 0.08; let s = 0, steer = 0, hd = a;
            while (s < len) {
              const s1 = s + STEP; hd = a + A1 * Math.sin(s1 * 0.9 + ph1) + A2 * Math.sin(s1 * 2.3 + ph2) + dr * s1 + steer;
              let nx = x + Math.cos(hd) * STEP, nz = z + Math.sin(hd) * STEP, hit = false;
              for (const [ox, oz, orr] of OBST) { const ex = nx - ox, ez = nz - oz, d = Math.hypot(ex, ez), need = orr + 0.6 * rAt(s1); if (d < need) { nx = ox + ex / (d || 1) * need; nz = oz + ez / (d || 1) * need; hit = true; } }
              if (hit) { const h2 = Math.atan2(nz - z, nx - x); steer += Math.atan2(Math.sin(h2 - hd), Math.cos(h2 - hd)); hd = h2; } else steer *= 0.96;   // bám mép đá rồi dần trở về hướng cũ (ôm ra sau đá)
              if (water(nx + Math.cos(hd) * 0.3, nz + Math.sin(hd) * 0.3)) break;   // mép nước: rễ dừng (đã chìm hẳn ở điểm cuối — xem (2))
              x = nx; z = nz; s = s1; pts.push([x, z, s]);
            }
            if (pts.length < 3) return null;
            { const sE0 = pts[pts.length - 1][2], D = Math.max(0.2, Math.min(0.5, 2.2 * rAt(sE0))), fine = [pts[0]];   // đoạn cắm xuống đất: chia nhỏ 3 lần cho đường cong cắm đủ mịn
              for (let i = 1; i < pts.length; i++) { const [ax, az, as] = pts[i - 1], [bx2, bz, bs] = pts[i], m = bs > sE0 - D - 0.01 ? 3 : 1; for (let k = 1; k <= m; k++) { const t = k / m; fine.push([ax + (bx2 - ax) * t, az + (bz - az) * t, as + (bs - as) * t]); } }
              pts.length = 0; pts.push(...fine); pts.D = D; }
            const n = pts.length;
            // (2) độ cao: e giảm đơn điệu — nổi e0 → em tới chỗ cắm (cách ngọn ~2,2 r), rồi cắm dốc ~35° xuống E1 (ngọn tù chui vào đất, không thuôn thành gai);
            //     trong lòng thân hạ dần từ y0 xuống mặt bạnh
            const sE = pts[n - 1][2], sO = Math.min(sX, sE * 0.5), gX = ground(pts[0][0], pts[0][1]), e0 = sX > 0 ? 0.3 : Math.max(E1 + 0.5, (y0 - gX) / r0), em = Math.min(EM, e0 - 0.2);
            const P = [], R = [], E = [];
            for (const [px, pz, ps] of pts) {
              const sD = Math.max(sO + 0.1, sE - pts.D), w = Math.max(0, Math.min(1, (ps - sD) / Math.max(0.05, sE - sD))), r = rAt(ps), gd = ground(px, pz);
              const e = ps < sD ? e0 + (em - e0) * Math.max(0, ps - sO) / Math.max(0.1, sD - sO) : em + (E1 - em) * w * w * (3 - 2 * w);
              let y = gd + r * e + 0.1 * r * Math.sin(ps * 2.6 + ph1) * Math.max(0, e + 0.2);   // gợn nhẹ khi còn lộ nhiều — tắt trước khi chìm (không trồi lại)
              if (ps < sO) { const k = ps / sO, yO = ground(px, pz) + r0 * e0; y = yO + (y0 - yO) * (1 - k) * (1 - k); }   // trong lòng thân: từ chỗ khởi đầu hạ dần ra mặt bạnh
              P.push(V(px, y, pz)); R.push(r * (1 + (r0 > 0.15 ? 0.1 : 0.05) * Math.sin(ps * 2.9 + ph2) * Math.min(1, Math.max(0, ps - sO) / 0.4))); E.push(e);   // phồng xẹp dọc rễ
            }
            // rễ sau gặp rễ trước (khác mẹ) ở đoạn còn lộ ⇒ vắt qua bên trên (2 ống chạm nhau), nhô dần trong ±0,5 — đoạn đã chìm thì luồn dưới (không trồi lại)
            { const need = new Float32Array(n);
              for (let i = 0; i < n; i++) { if (E[i] < -0.8 || pts[i][2] < sO + 0.1) continue; const p = P[i], r = R[i];
                for (const q of SAMP) { if (q.l === par) continue; const dh = Math.hypot(p.x - q.x, p.z - q.z), rr = r + q.r; if (dh >= rr * 0.95) continue; const yq = q.y + Math.sqrt(rr * rr - dh * dh) * 0.85; if (yq - p.y > need[i]) need[i] = yq - p.y; } }
              const W = Math.round(0.5 / STEP); for (let i = 0; i < n; i++) { let lf = 0; for (let j = Math.max(0, i - 2 * W); j <= Math.min(n - 1, i + 2 * W); j++) if (need[j] > 0) lf = Math.max(lf, need[j] * Math.max(0, 1 - Math.abs(pts[i][2] - pts[j][2]) / 0.5)); P[i].y += lf; } }
            const T0 = P[1].clone().sub(P[0]).normalize(), l = { P, R, par, kids: [], atEnd: false, pr: par ? pr : sO * Math.max(0.35, T0.clone().cross(pT).length()), pT };
            L.push(l); if (par) par.kids.push(l);
            for (let i = 0; i < n; i++) if (E[i] > -1 && pts[i][2] > sO) SAMP.push({ x: P[i].x, z: P[i].z, y: P[i].y, r: R[i], l });
            // (3) rễ con: tách ở đoạn rễ mẹ còn lộ (e > −0,35), mọc từ tim rễ mẹ, lệch 0,5–0,85 rad
            let k1 = 0; for (let i = 0; i < n; i++) if (pts[i][2] > sO && E[i] > -0.45) k1 = i;
            const k0 = P.findIndex((_, i) => pts[i][2] > sO + 0.35), span = k1 - k0;
            const nb = depth === 0 ? (r0 > 0.2 ? 2 + (rnd() < 0.4 ? 1 : 0) : 1 + (rnd() < 0.5 ? 1 : 0)) : depth === 1 && span > 3 && rnd() < 0.5 ? 1 : 0;
            if (k0 > 0 && span >= 3) for (let b = 0, sd = rnd() < 0.5 ? -1 : 1; b < nb; b++, sd = -sd) {   // rễ con chỉ tách khỏi đoạn mẹ còn to (rễ mảnh nằm dưới đất)
              const k = Math.min(n - 2, k0 + Math.round(span * ((b + 0.15 + 0.7 * rnd()) / nb))), p = P[k], tg = P[k + 1].clone().sub(P[k - 1]).normalize();
              if (R[k] < 0.12) continue; const ha = Math.atan2(tg.z, tg.x) + sd * (0.5 + 0.5 * rnd()), rc = Math.min(0.8 * R[k], Math.max(0.09, (0.6 + 0.15 * rnd()) * R[k])), lc = Math.max(1.0, (sE - pts[k][2]) * (0.6 + 0.35 * rnd()) + 0.6);
              root(p.x, p.z, p.y, ha, lc, rc, 0, zrt * 0.7, l, R[k], tg, depth + 1);
            }
            return l;
          }
          // rễ chính ở các múi (to theo độ nhô của múi) + rễ phụ nhỏ hơn chen vào khe > 45° giữa 2 múi (cây già: rễ dày đặc, đè lên nhau như ảnh pohutukawa)
          const starts = lobes.map(p => ({ a: (p.b + 0.5) / NB * 6.2832, rr: p.rr, r0: Math.min(0.28, 0.17 + 0.25 * Math.min(1, p.pr / 0.4) + 0.04 * rnd()) })).sort((p, q) => p.a - q.a);
          for (let i = 0, m = starts.length; i < m; i++) { const A = starts[i], B = starts[(i + 1) % m], gap = ((B.a - A.a) + 6.2832) % 6.2832 || 6.2832;
            for (let k = 1, nk = Math.floor(gap / 0.8); k <= nk; k++) { const a = A.a + gap * k / (nk + 1), b = Math.floor(a / 6.2832 * NB) % NB; starts.push({ a, rr: at(b), r0: 0.14 + 0.04 * rnd() }); } }
          for (const st of starts) {
            const ca = Math.cos(st.a), sa = Math.sin(st.a), rX = st.rr;   // góc · bán kính chân thân tại chỗ rễ chui ra
            if (OBST.some(([ox, oz, orr]) => Math.hypot(ca * rX - ox, sa * rX - oz) < orr + 0.05)) continue;   // tì sát đá: rễ không chui ra được
            root(ca * rX * 0.55, sa * rX * 0.55, 0.42, st.a + (rnd() - 0.5) * 0.2, (st.r0 > 0.15 ? 2.2 : 1.5) + 1.8 * rnd(), st.r0, rX * 0.45, 1.0, null, 0, axis, 0);
          }
          g.add(...barkMesh(barkTubes(L, { wS: 1, flare: 0, nodes: false, rope: { minR: 0.12, nTrunk: 6, D: 0.45, twist: 0.35 } }), mat));
          g.userData.roots = { lobes: lobes.map(p => [+((p.b + 0.5) / NB * 360).toFixed(0), +p.rr.toFixed(2), +p.pr.toFixed(3)]), n: L.length };
          bakeStatic(g);
        })();
