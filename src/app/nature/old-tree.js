        // ---- CÂY CỔ THỤ mọc tự nhiên (thân xoắn · vài nhánh gỗ chết · tán lá xum xuê) tại góc (89, 7, 117) ----
        // ---- 3 TẢNG ĐÁ HỘC PHỦ RÊU (1 Lớn · 1 Vừa · 1 Nhỏ) + NỀN ĐẤT quanh gốc cây ----
        //  cùng kiểu đá hộc chân cửa xả (world/storm-drain.js) — lưới cầu
        //  20 mặt chia 1 lần, mỗi đỉnh co giãn ngẫu nhiên 0,8–1,12 ⇒ khối đá vỡ góc cạnh, mặt phẳng (flatShading), cùng vật liệu đá xám nâu; rêu = thảm rêu dùng chung
        //  (core/surface-style.js mossCoat) như mũ rêu đá hộc: lượng rêu từng đỉnh (aRk) — mũ trên nóc, sườn khuất nắng, chân sát đất ẩm; lá rêu mọc theo
        //  (nature/moss-lawn.js). Giữ chỗ + cỡ + độ lún của 3 tảng trước (granite bo tròn, hạt fenspat, địa y vẽ trong shader — đã bỏ). Rễ cổ thụ lách theo
        //  vòng ôm đo thật ở mặt đất từng tảng (oldTreeStones); nấm (nature/fungi.js) tìm nhóm này theo vị trí (nhóm không tên) ----
        const oldTreeStones = [];
        (function stoneRing() {
          const g = new THREE.Group(); g.position.set(X0 + 89, 7.0, Z0 + 117); scene.add(g); flightRoots.push(g);
          const dirtMatRound = new THREE.MeshLambertMaterial({ color: 0x3d3024 });   // đất bùn đậm quanh gốc
          // Nền đất nâu sẫm tròn quanh gốc
          const dirtDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.5, 0.12, 16), dirtMatRound);
          dirtDisc.position.y = 0.06; dirtDisc.receiveShadow = true; g.add(dirtDisc);
          const h3 = (i, j, k) => { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
          const vn3 = (x, y, z) => { const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), u = x - i, v = y - j, w = z - k, a = u * u * (3 - 2 * u), b = v * v * (3 - 2 * v), c = w * w * (3 - 2 * w), l = (o, p, q) => h3(i + o, j + p, k + q);
            return ((l(0, 0, 0) * (1 - a) + l(1, 0, 0) * a) * (1 - b) + (l(0, 1, 0) * (1 - a) + l(1, 1, 0) * a) * b) * (1 - c) + ((l(0, 0, 1) * (1 - a) + l(1, 0, 1) * a) * (1 - b) + (l(0, 1, 1) * (1 - a) + l(1, 1, 1) * a) * b) * c; };
          const fbm = (x, y, z) => 0.55 * vn3(x, y, z) + 0.3 * vn3(x * 2.1 + 5.2, y * 2.1, z * 2.1 + 1.7) + 0.15 * vn3(x * 4.3 + 9.1, y * 4.3 + 3.3, z * 4.3);
          const groundAt = (x, z) => cowY(g.position.x + x, g.position.z + z) - g.position.y + 0.12 * Math.max(0, Math.min(1, (2.5 - Math.hypot(x, z)) / 0.3));   // + nền đất (trụ r 2,2 → 2,5)
          const rnd = mulberry32(8890), NO = SF_NO.value, ss = THREE.MathUtils.smoothstep, tmp = new THREE.Vector3(), nrm = new THREE.Vector3();
          // [x, z, bán trục a (ngang x) · b (cao) · c (ngang z), phần lún, hướng] — giữ chỗ + cỡ 3 hòn cũ (rễ đã lách quanh)
          const SPEC = [[0.3, 1.25, 1.0, 0.74, 0.86, 0.3, 0.5], [1.5, -0.4, 0.66, 0.46, 0.56, 0.3, 1.9], [-1.35, 0.5, 0.42, 0.28, 0.36, 0.32, -0.8]];
          const POS = [], NRM = [], RK = [], IDX = [];
          SPEC.forEach(([sx, sz, A, B, C, bur, yaw], n) => {
            // lưới cầu 20 mặt chia 1 lần như đá hộc cửa xả (gộp đỉnh trùng ⇒ có chỉ số cho lá rêu), co giãn từng đỉnh 0,8–1,12 theo băm toạ độ (+ số tảng: 3 hình khác nhau)
            const ico = new THREE.IcosahedronGeometry(1, 1), Pi = ico.attributes.position, key = new Map(), D = [], T = [];
            for (let i = 0; i < Pi.count; i++) { const k = Math.round(Pi.getX(i) * 1e4) + ',' + Math.round(Pi.getY(i) * 1e4) + ',' + Math.round(Pi.getZ(i) * 1e4); let id = key.get(k); if (id === undefined) { id = D.length / 3; key.set(k, id); D.push(Pi.getX(i), Pi.getY(i), Pi.getZ(i)); } T.push(id); }
            ico.dispose();
            const rot = new THREE.Quaternion().setFromEuler(new THREE.Euler((rnd() - 0.5) * 0.2, yaw, (rnd() - 0.5) * 0.2)), nV = D.length / 3, L = new Float32Array(nV * 3);
            for (let i = 0; i < nV; i++) {
              const x = D[i * 3], y = D[i * 3 + 1], z = D[i * 3 + 2], h = Math.abs(Math.sin(x * 12.9898 + y * 78.233 + z * 37.719 + n * 3.7) * 43758.5453) % 1, k = 0.8 + 0.32 * h;
              tmp.set(x * k * A, y * k * B, z * k * C).applyQuaternion(rot); L[i * 3] = tmp.x; L[i * 3 + 1] = tmp.y; L[i * 3 + 2] = tmp.z;
            }
            let y0 = Infinity, y1 = -Infinity; for (let i = 0; i < nV; i++) { y0 = Math.min(y0, L[i * 3 + 1]); y1 = Math.max(y1, L[i * 3 + 1]); }
            const gy = groundAt(sx, sz), cy = gy - y0 - bur * (y1 - y0);   // lún ~30% chiều cao vào đất
            const geo = new THREE.BufferGeometry(); for (let i = 0; i < nV; i++) { L[i * 3] += sx; L[i * 3 + 1] += cy; L[i * 3 + 2] += sz; }
            geo.setAttribute('position', new THREE.BufferAttribute(L, 3)); geo.setIndex(T); geo.computeVertexNormals();
            const Nn = geo.attributes.normal, base = POS.length / 3; let foot = 0;
            for (let i = 0; i < nV; i++) {
              const x = L[i * 3], y = L[i * 3 + 1], z = L[i * 3 + 2], hA = y - groundAt(x, z); nrm.fromBufferAttribute(Nn, i);
              if (hA > -0.05 && hA < 0.12) foot = Math.max(foot, Math.hypot(x - sx, z - sz));   // vòng ôm ở mặt đất cho rễ
              const pt = fbm(x * 1.1 + 20, y * 1.1, z * 1.1), up = ss(nrm.y, 0.15, 0.7), north = Math.max(0, nrm.x * NO.x + nrm.z * NO.y) * (1 - Math.abs(nrm.y));
              let mo = up * ss(pt + 0.22 * up, 0.34, 0.56);   // mũ rêu trên nóc (như đá hộc: mặt hướng trời, loang)
              mo = Math.max(mo, 0.8 * north * ss(pt, 0.38, 0.58));   // sườn khuất nắng
              mo = Math.max(mo, (1 - ss(hA, 0.04, 0.32)) * ss(fbm(x * 2.3 + 40, y * 2.3, z * 2.3), 0.36, 0.6));   // chân sát đất ẩm
              POS.push(x, y, z); NRM.push(nrm.x, nrm.y, nrm.z); RK.push(Math.min(1, mo));
            }
            for (let t = 0; t < T.length; t += 3) { const a = T[t], b = T[t + 1], c = T[t + 2]; if (Math.max(L[a * 3 + 1], L[b * 3 + 1], L[c * 3 + 1]) < groundAt(L[a * 3], L[a * 3 + 2]) - 0.12) continue; IDX.push(base + a, base + b, base + c); }   // bỏ tam giác chôn hẳn
            geo.dispose(); oldTreeStones.push({ x: sx, z: sz, r: foot || Math.max(A, C) });
          });
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute(POS, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(NRM, 3));
          geo.setAttribute('aRk', new THREE.Float32BufferAttribute(RK, 1)); geo.setIndex(IDX); geo.computeBoundingSphere();
          // vật liệu đá hộc cửa xả (bản sao) + thảm rêu như mũ rêu đá hộc (nature/bank-moss.js)
          const rockMat = skyShadeMat(mossCoat(stormDrain.mats.stone.clone(), 'otRk2', { vHead: 'attribute float aRk; varying float vMk;', vMain: ' vMk = aRk;', fHead: 'varying float vMk;',
            sq: '(abs(vMcN.y) > 0.6 ? vMcP.xz : abs(vMcN.x) > abs(vMcN.z) ? vMcP.zy : vMcP.xy)', mo: 'smoothstep(0.3, 0.6, vMk + 0.25 * (sfMossCu(mcQ, mcF) - 0.45))' }), 'otRock', { cav: 0.5, cavP: true });   // + bóng trời dưới tán, kẽ đá – thân (core/sky-shade.js)
          const rocks = new THREE.Mesh(geo, rockMat); rocks.name = 'Đá hộc phủ rêu quanh gốc cổ thụ'; rocks.castShadow = rocks.receiveShadow = true;
          Object.assign(rocks.userData, { noBake: true, noBatch: true, rockMoss: true }); g.add(rocks);   // giữ thuộc tính aRk (lá rêu đọc lượng rêu từng đỉnh)
          bakeStatic(g);
        })();

        // ---- CÂY CỔ THỤ — GIỮ DÁNG GỐC (đẹp nhất): thân xoắn + cành tay vươn ra sông · cành con mảnh 1/3 · LÁ HEXAGON (đĩa 6 cạnh giống lá cây táo, instanced) ----
        let oldTreeGroup;
        (function oldTree() {
          const g = new THREE.Group(); g.position.set(X0 + 89, 7, Z0 + 117); g.scale.setScalar(2.76); g.rotation.set(0, 0, 0.62); g.name = 'Cây cổ thụ (Old Tree)'; scene.add(g);   // ngả thân về phía dòng sông (-x)
          oldTreeGroup = g;
          // vỏ, rễ, cây con, lá đều đặc (trước: vỏ 0,935 · cây con 0,715 · lá 0,836) ⇒ bỏ luôn lượt độ sâu của vỏ trong suốt
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x4a3420 }), deadMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
          barkMat.userData.sfOld = deadMat.userData.sfOld = 1; deadMat.userData.sfMoss = 0.35;   // cổ thụ bản mới trông giả, trả về bản cũ: vân vỏ bản trước (không ảnh quét, không địa y loang)   // vết loang trên thân cổ thụ màu NÂU ĐEN (không xám trắng)
          // cây cổ thụ: thân to, tán nặng → dao động riêng chậm ~0,32 Hz, cản nhỏ (gỗ già ít tắt dần); cành xa thân rung ~1 Hz
          const RIG = TREE_RIG_ON;   // xương cành (nature/wind-physics.js): 1 xương / cành chính + 1 xương / chùm cành cấp 1; ?rig=off ⇒ gió theo cành kiểu cũ (bough + spray)
          const tw = makeTreeWind(RIG ? { freq: 0.32, zeta: 0.08, lean: 0.45, branchAmp: 0.07, sway: 0.5, rig: { amp: 0.085, grow: 2.6, freq: 6 } } : { freq: 0.32, zeta: 0.08, lean: 0.45, branchAmp: 0.07, bough: 0.05, spray: [0.3, 0.2], sway: 0.5 });
          windShader(barkMat, tw, 0); windShader(deadMat, tw, 0); g.userData.treeWind = tw;
          surfaceStyle(barkMat, 'bark'); surfaceStyle(deadMat, 'bark'); skyShadeMat(barkMat, 'bark', { cav: 0.6, vtx: true }); skyShadeMat(deadMat, 'bark', { cav: 0.6, vtx: true });   // vân vỏ (core/surface-style.js) — SAU shader gió (windShader ghi đè onBeforeCompile) · bóng trời dưới tán + hốc khuất (core/sky-shade.js) sau cùng
          const leafCols = [0x4e7a39, 0x5e8c44, 0x6fa052, 0x42692f, 0x567f3a, 0x4e7a39, 0x5e8c44, 0x6fa052, 0x42692f, 0x567f3a, 0xe5b82c];
          const rnd = mulberry32(7777), deadTips = [];
          const up = new THREE.Vector3(0, 1, 0), V = (x, y, z) => new THREE.Vector3(x, y, z);

          const storkBranchPieces = []; let storkBranchSegment = -1;
          g.userData.storkBranchPieces = storkBranchPieces;
          // CÀNH = BẢN GHI điểm gấp khúc (lưới ống cong liền dựng 1 lần ở cuối bằng barkTubes — làm tương tự cho cổ thụ sau khi sửa chỗ gấp
          // cây táo: bản cũ là trụ 7 cạnh + quả cầu ở mọi khớp, 6 cầu dẹt làm bạnh gốc). Thứ tự gọi rnd() giữ nguyên ⇒ dáng cây, lá, chỗ cò/bướm đậu không đổi
          const LB = [], LD = [];   // cành vỏ nâu · cành gỗ chết
          const mkLimb = (list, a, r, par, atEnd, pr, pT) => { const l = { P: [a], R: [r], par, kids: [], atEnd, pr, pT }; list.push(l); if (par) par.kids.push(l); return l; };
          const limb = (a, b, r1, r2, L) => {
            L.P.push(b); L.R.push(r2);
            if (storkBranchSegment >= 0) storkBranchPieces.push({ a: a.toArray(), b: b.toArray(), r1, r2, segment: storkBranchSegment });
          };

          // Hàm vẽ cành đệ quy bẻ cong tự nhiên (Recursive Midpoint Displacement) — bản quét "Tree Scan Free": cành già GẬP KHUỶU (đoạn thẳng → gập 30–60°
          // → đoạn thẳng: ngọn cũ chết, cành bên thay ngọn) ⇒ cấp 1 lệch 24% (gập ~50°), cấp 2 chỉ 7% (bản cũ 15% cả 2 cấp: lượn đều); thân + cành sông (cò đậu)
          // giữ như cũ. ln = độ dài bản cũ (con = 0,522 × mẹ) để quyết định chia tiếp y như cũ ⇒ cùng số lần rnd() — lá, chỗ cò / bướm đậu không đổi
          const crookedLimb = (a, b, r1, r2, L, depth = 0, maxDepth = 2, ln) => {
            const d = new THREE.Vector3().subVectors(b, a), len = d.length(); ln = ln ?? len;
            if (depth >= maxDepth || ln < 0.12 || r1 < 0.015) return limb(a, b, r1, r2, L);
            const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5), dir = d.clone().normalize();
            let tAxis = (Math.abs(dir.y) > 0.9) ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
            const p1 = new THREE.Vector3().crossVectors(dir, tAxis).normalize();
            const p2 = new THREE.Vector3().crossVectors(dir, p1).normalize();
            const jF = len * (L === TR || storkBranchSegment >= 0 ? 0.15 : depth ? 0.07 : 0.24), ang = rnd() * 6.283;
            mid.addScaledVector(p1, Math.cos(ang) * jF).addScaledVector(p2, Math.sin(ang) * jF);
            const midR = (r1 + r2) * 0.5;
            crookedLimb(a, mid, r1, midR, L, depth + 1, maxDepth, ln * 0.52202);
            crookedLimb(mid, b, midR, r2, L, depth + 1, maxDepth, ln * 0.52202);
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

          // cành vươn ra sông (dựng tay; các cành chính khác: tán kiểu bonsai bên dưới)
          const branches = [
            [V(-0.1, 1.7, 0.25), V(-1.1, 2.3, 0.45), V(-2.2, 2.8, 0.6), V(-3.4, 3.1, 0.55), V(-4.8, 3.25, 0.4)]
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

          let RV = null;   // cành sông: cành mẹ + bán kính + điểm, cho phần nối tiếp kiểu bonsai
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
            RV = { L: BL, r: rbs, br };
          }
          // ---- TÁN KIỂU BONSAI ----
          // Dựng trong hệ ĐỨNG W (y = phương thẳng đứng thật; nhóm ngả quanh z) rồi đổi về toạ độ nhóm ⇒ tầng lá nằm ngang thật.
          // Ngọn sống nối tiếp thân, uốn dần về thẳng đứng; mỗi khúc uốn 1 cành chính ở MẶT NGOÀI khúc uốn, so le quanh thân, càng cao càng ngắn + mảnh.
          // Cành chính: rời thân hơi ngóc, võng xuống dưới ngang, đầu ngóc lại; gấp khúc trái phải; 1/4 sát thân để trần. Cành cấp 2 / 3 xoè quạt ngang, so le.
          // RNG riêng ⇒ thân, cành sông, chỗ cò đậu không đổi. Cành gỗ chết = ngọn cũ đứng cạnh ngọn sống: cành + tầng lá tránh vùng x −1,0…−0,6 · z −0,35…0,3 trên h 3
          const cT = Math.cos(g.rotation.z), sT = Math.sin(g.rotation.z), toL = v => V(v.x * cT + v.y * sT, v.y * cT - v.x * sT, v.z), toW = v => V(v.x * cT - v.y * sT, v.x * sT + v.y * cT, v.z);
          const bR = mulberry32(7801), pads = [], twigs = [], crownLines = [], hz = az => V(Math.cos(az), 0, Math.sin(az)), turn = (d, a) => V(d.x * Math.cos(a) - d.z * Math.sin(a), 0, d.x * Math.sin(a) + d.z * Math.cos(a));
          const wLimb = (par, P, R, atEnd, pr, pT) => { const L = mkLimb(LB, toL(P[0]), R[0], par, atEnd, pr, pT && toL(pT)); L.clean = true; for (let i = 1; i < P.length; i++) { L.P.push(toL(P[i])); L.R.push(R[i]); } return L; };
          const off = (a, d, f, s, w, h) => a.clone().addScaledVector(d, f).addScaledVector(s, w).add(V(0, h, 0));
          let padV = 0.5, upK = 1, nBough = 0;   // tầng lá: cao / bán kính ngang · mức ngóc đầu cành con
          // cành cấp 2 (lvl 1) + cấp 3 (lvl 2): 3 đoạn gấp nhẹ, ngọn ngóc lên; mỗi ngọn = 1 cụm lá
          function spray(par, a, dir, len, r, pr, pT, atEnd, lvl, rh) {
            const s = V(-dir.z, 0, dir.x), w = 0.13 * len * (bR() < 0.5 ? 1 : -1), u = upK * len;
            const P = [a, off(a, dir, 0.36 * len, s, w, 0.02 * u), off(a, dir, 0.7 * len, s, -0.7 * w, 0.045 * u), off(a, dir, len, s, 0.25 * w, 0.14 * u)], R = [r, r * 0.74, r * 0.5, r * 0.26];
            const L = wLimb(par, P, R, atEnd, pr, pT); L.sp = lvl; for (let i = lvl > 1 ? 0 : 1; i < 3; i++) twigs.push([P[i], P[i + 1], 0.2 + 0.22 * rh, L, i]);
            if (lvl < 2 && len > 0.38) {
              let sd = w > 0 ? 1 : -1;
              for (let j = 1; j <= 2; j++, sd = -sd) { const tg = P[j + 1].clone().sub(P[j - 1]), th = tg.clone().setY(0).normalize();
                spray(L, P[j], turn(th, sd * (0.8 + bR() * 0.35)), len * (0.5 - 0.1 * j) * (0.85 + bR() * 0.3), R[j] * 0.55, R[j], tg.normalize(), false, lvl + 1, rh * 0.9); }
              if (len > 0.8) { const m = P[2].clone().lerp(P[3], 0.45), tg = P[3].clone().sub(P[2]), th = tg.clone().setY(0).normalize();
                spray(L, m, turn(th, sd * (0.8 + bR() * 0.3)), len * 0.24 * (0.85 + bR() * 0.3), (R[2] + R[3]) * 0.27, (R[2] + R[3]) * 0.5, tg.normalize(), false, lvl + 1, rh * 0.85); }
            }
            pads.push({ p: P[3], rh, rv: rh * padV, L, i: 3 });
          }
          function bough(par, base, az, len, r, drop, sg, pr, pT, atEnd) {
            const d = hz(az), s = V(-d.z, 0, d.x), T = [0.16, 0.38, 0.6, 0.8, 1], H = [0.07, 0.035 - 0.5 * drop, -drop, -1.05 * drop, -0.7 * drop], Z = [0.07, -0.11, 0.095, -0.07, 0.03], RR = [0.86, 0.66, 0.48, 0.33, 0.2];
            const P = [base], R = [r]; for (let i = 0; i < 5; i++) { P.push(off(base, d, len * T[i], s, sg * len * Z[i], len * H[i])); R.push(r * RR[i]); }
            const L = wLimb(par, P, R, !!atEnd, pr, pT), rh = 0.4 + 0.05 * len; L.bg = ++nBough; crownLines.push(L.P.map(v => v.clone())); for (let i = 2; i < 5; i++) twigs.push([P[i], P[i + 1], 0.42, L, i]);
            { const m = P[1].clone().lerp(P[2], 0.5), tg = P[2].clone().sub(P[1]), th = tg.clone().setY(0).normalize();   // cành cấp 2 đầu tiên: giữa đoạn, phía đối diện khúc gấp kế
              spray(L, m, turn(th, sg * (0.95 + bR() * 0.2)), len * 0.36 * (0.9 + bR() * 0.2), (R[1] + R[2]) * 0.24, (R[1] + R[2]) * 0.5, tg.normalize(), false, 1, rh); }
            for (let i = 2; i <= 4; i++) { const tg = P[i + 1].clone().sub(P[i - 1]), th = tg.clone().setY(0).normalize(), sd = Math.sign(Z[i - 1]) * sg;   // mặt ngoài từng khúc gấp
              spray(L, P[i], turn(th, sd * (0.95 + bR() * 0.2)), len * [0.42, 0.34, 0.26][i - 2] * (0.9 + bR() * 0.2), R[i] * 0.5, R[i], tg.normalize(), false, 1, rh); }
            const te = P[5].clone().sub(P[4]).setY(0).normalize();   // đầu cành chẻ đôi
            for (const k of [-1, 1]) spray(L, P[5], turn(te, k * (0.5 + bR() * 0.2)), len * 0.17 * (0.9 + bR() * 0.2), R[5] * 0.8, undefined, undefined, true, 1, rh * 0.9);
            return L;
          }
          { // cành thấp nhất: trên thân, ngược phía thân ngả
            const tk = trunkAt(2.12); bough(TR, toW(getTrunkPoint(2.12)), -0.55, 3.4, 0.17, 0.1, 1, tk.r, toW(tk.d));
            // ngọn sống [h, x, z, r, lệch ra phía cành] + cành ở khúc đó [hướng, dài, bán kính, võng]
            const AX = [[2.85, -1.93, 0.24, 0.235, 0.16, 1.75, 2.9, 0.15, 0.07], [3.4, -1.98, 0.16, 0.19, 0.13, -2.5, 2.5, 0.13, 0.08], [3.92, -1.85, 0.26, 0.15, 0.11, 0.75, 2.0, 0.11, 0.08],
              [4.4, -1.72, 0.14, 0.115, 0.09, 3.0, 1.5, 0.09, 0.07], [4.82, -1.66, 0.22, 0.085, 0.07, -0.9, 1.05, 0.07, 0.05], [5.2, -1.69, 0.18, 0.06, 0]];
            const P = [toW(trunk[4])], R = [0.27]; for (const n of AX) { P.push(V(n[1], n[0], n[2]).addScaledVector(hz(n[5] || 0), n[4])); R.push(n[3]); }
            const LD0 = wLimb(TR, P, R, true); for (let i = 2; i < 6; i++) twigs.push([P[i], P[i + 1], 0.4, LD0, i]);
            for (let i = 0; i < 5; i++) { const n = AX[i]; bough(LD0, P[i + 1], n[5], n[6], n[7], n[8], i % 2 ? 1 : -1, R[i + 1], P[i + 2].clone().sub(P[i]).normalize()); }
            // đỉnh tán: vòm tròn — 5 cành ngắn toả quanh ngọn + 1 ngọn giữa
            padV = 0.8; const E = P[6], a0 = bR() * 6.2832;
            const top = [E, off(E, hz(a0), 0.04, up, 0, 0.2), off(E, hz(a0 + 2), 0.03, up, 0, 0.4)]; const TL = wLimb(LD0, top, [0.055, 0.034, 0.012], true); pads.push({ p: top[2], rh: 0.5, rv: 0.42, L: TL, i: 2 });
            for (let k = 0; k < 5; k++) spray(LD0, E, hz(a0 + k * 1.2566 + (bR() - 0.5) * 0.3), 0.55 + bR() * 0.15, 0.04, undefined, undefined, true, 1, 0.5);
          }
          { // cành sông: đoạn to dựng tay (cò đậu) nối liền 1 cành chính vươn ngang ra mặt nước; 1 cành cấp 2 sát thân ở phía khuất (chỗ cò đứng để trống)
            const B = RV.br.map(toW), te = B[4].clone().sub(B[3]).setY(0).normalize(), tg = B[2].clone().sub(B[0]), th = tg.clone().setY(0).normalize(); padV = 0.45;
            spray(RV.L, B[1], turn(th, 1.1), 0.95, RV.r[1] * 0.42, RV.r[1], tg.normalize(), false, 1, 0.5);
            const rb = bough(RV.L, B[4], Math.atan2(te.z, te.x), 3.0, RV.r[4], 0.06, -1, undefined, undefined, true);
            RV.L.bg = rb.bg; RV.L.bgn = rb; rb.bgc = RV.L;   // đoạn dựng tay + cành nối tiếp = 1 cành chính cho gió
          }
          g.userData.mainBranches = [branches[0].map(v => v.clone()), ...crownLines];   // đường tâm cành sông + cành chính của tán (toạ độ nhóm) — bướm đậu trú mưa dùng cành 1–4
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
          for (const tp of deadTips) refineTerminalTwig(tp);
          // CÀNH GAI NGẮN dọc cành (bản quét "Tree Scan Free": cành già mọc dày cành con ngắn mảnh, chĩa gần vuông góc, gập 1 khuỷu — dáng "xơ xác" của cây già)
          // RNG riêng ⇒ dáng, lá, chỗ đậu không đổi; cắm từ tim cành mẹ ra như cành mọc ngang (barkTubes kind 2)
          const spR = mulberry32(7791);
          for (const L of LB.slice()) {
            if (L === TR || L.clean || L.R[0] < 0.03 || L.R[0] > 0.1) continue;   // cành vừa và nhỏ trong tán (cành to sát thân thì không — thành gạc hươu)
            for (let i = 0; i < L.P.length - 1; i++) {
              const a = L.P[i], dd = L.P[i + 1].clone().sub(a), sl = dd.length(); dd.normalize();
              for (let t = spR() * 0.3; t < sl; t += 0.22 + spR() * 0.3) {
                const r = L.R[i] + (L.R[i + 1] - L.R[i]) * t / sl, p = a.clone().addScaledVector(dd, t), ln = 0.1 + spR() * 0.18;
                const dir = V(spR() - 0.5, spR() - 0.5, spR() - 0.5).cross(dd).normalize().multiplyScalar(0.85).addScaledVector(dd, 0.45).add(V(0, 0.3, 0)).normalize();
                const k = p.clone().addScaledVector(dir, ln * 0.55), S = mkLimb(LB, p, Math.min(0.011, 0.35 * r), L, false, r, dd);
                S.P.push(k, k.clone().addScaledVector(dir.add(V(spR() - 0.5, spR() * 0.6 - 0.1, spR() - 0.5).multiplyScalar(0.7)).normalize(), ln * 0.45)); S.R.push(0.007, 0.0035);
              }
            }
          }
          // GIÓ THEO CÀNH (nature/wind-physics.js brMix / brBytes): mỗi điểm cành mang W = [cành chính 1…, vị trí dọc cành chính 0…1, pha chùm cành con 1…255, vị trí dọc chùm, hệ số chùm].
          //  Cành chính: vị trí = phần cung từ gốc cành. Cành mọc trên cành khác: lấy trị tại chỗ cắm (đi cùng cành mẹ, không rách chỗ nối). Chùm cấp 2: pha riêng, cấp 3 + gai nối tiếp.
          //  Thân, ngọn sống, mấu: 0 (chỉ theo thân). LB theo thứ tự tạo ⇒ cành mẹ luôn xong trước.
          const wMix = RIG ? rigMix : brMix, wBytes = RIG ? rigBytes : brBytes;
          { const arc = P => { const a = [0]; for (let i = 1; i < P.length; i++) a.push(a[i - 1] + P[i].distanceTo(P[i - 1])); return a; }, tot = P => arc(P).pop(), q = new THREE.Vector3(), ab = new THREE.Vector3();
            const at = (M, p) => { let bd = 1e9, bi = 0, bt = 0; for (let i = 0; i < M.P.length - 1; i++) { const a = M.P[i]; ab.subVectors(M.P[i + 1], a); const t = Math.min(1, Math.max(0, q.subVectors(p, a).dot(ab) / ab.lengthSq())), d = q.copy(a).addScaledVector(ab, t).distanceTo(p); if (d < bd) { bd = d; bi = i; bt = t; } } return wMix(M.W[bi], M.W[bi + 1], bt); };
            let nz = 0; const lines = [], bones = [{ o: TR.P[0], t: TR.P[TR.P.length - 1], par: 0, d: 0 }], bgBone = {}, rigLines = [], ease = s => s * (2 - s);
            for (const L of LB) { const A = arc(L.P), len = A[A.length - 1], a0 = L.par && L.par.W ? at(L.par, L.P[0]) : [0, 0, 0, 0, 0];
              if (RIG) {   // W = [xương, trọng số dọc cành s(2 − s), xương mẹ, độ chùng = 1 − trọng số của cành mẹ tại chỗ cắm]
                if (L.bg) { const pre = L.bgc ? tot(L.bgc.P) : 0, all = pre + len + (L.bgn ? tot(L.bgn.P) : 0);
                  if (!bgBone[L.bg]) { bgBone[L.bg] = bones.length; bones.push({ o: (L.bgc || L).P[0], t: (L.bgn || L).P[(L.bgn || L).P.length - 1], par: 0, d: 1 }); }
                  L.W = A.map(a => [bgBone[L.bg], ease((pre + a) / all), 0, 0, 0]); (rigLines[L.bg - 1] = rigLines[L.bg - 1] || { P: [], W: [] }).P.push(...L.P); rigLines[L.bg - 1].W.push(...L.W);
                  if (!L.bgc) lines[L.bg - 1] = (L.bgn ? [...L.P, ...L.bgn.P.slice(1)] : L.P).map(v => v.clone()); }
                else if (L.sp === 1) { const sl = a0[0] ? Math.round(255 * (1 - a0[1])) / 255 : 0, b = bones.length; bones.push({ o: L.P[0], t: L.P[L.P.length - 1], par: a0[0], d: 2, pw: 1 - sl, fq: 2.5 }); L.W = A.map(a => [b, ease(a / len), a0[0], sl, 0]); }
                else L.W = A.map(() => a0.slice());
                continue; }
              if (L.bg) { const pre = L.bgc ? tot(L.bgc.P) : 0, all = pre + len + (L.bgn ? tot(L.bgn.P) : 0); L.W = A.map(a => [L.bg, (pre + a) / all, 0, 0, 0]); if (!L.bgc) lines[L.bg - 1] = (L.bgn ? [...L.P, ...L.bgn.P.slice(1)] : L.P).map(v => v.clone()); }
              else if (L.sp === 1) { const z = 1 + (nz++ * 37) % 255, ks = 1 / Math.sqrt(len * 1.6); L.W = A.map(a => [a0[0], a0[1], z, a * ks, ks]); }
              else L.W = A.map(a => [a0[0], a0[1], a0[2], a0[2] ? a0[3] + a * a0[4] : 0, a0[4]]); }
            g.userData.boughs = lines; if (RIG) { g.userData.rigLimbs = bones; g.userData.rigLines = rigLines; } }
          // SỢI BỆN kiểu thân pohutukawa (nature/flowers-trees.js ropeChain/ropeAt): 12 sợi to nhỏ xoắn 0,5 rad/m, rãnh sâu ~21% r (gốc ×2,5) · u lồi + 1 hốc mục trên thân
          //  (s: m dọc thân tính từ chân cắm đất 1,37 m · góc quanh thân: 0 = +x, −π/2 = +z cục bộ; hốc quay về hướng nhìn mặc định +x+z)
          const ROPE = { minR: 0.3, nTrunk: 12, D: 0.26, twist: 0.5, trunk: { burls: [[2.25, 2.2, 0.32, 0.1], [4.7, 0.5, 0.3, 0.08], [5.9, -2.5, 0.38, 0.09], [3.3, -0.9, 0.22, 0.07], [6.4, 2.7, 0.55, 0.16]], cav: [5.2, -0.9, 0.45, 0.32] } };   // bướu cuối = khớp chạc phình ở mặt ngoài chỗ thân gập (bản quét Tree Scan Free)
          const OT = { flare: 0.5, flareH: 0.85, lobes: 6, sink: 0.55, wS: 2.76 * 0.9, segMax: 12, nodes: false, rope: ROPE, br: !RIG, rig: RIG };   // bạnh 6 múi ~2 m như 6 cầu dẹt cũ (đá cuội quanh gốc còn lộ) · gốc cắm sâu: thân ngả 35° ⇒ mép trên vòng chân thân vẫn chạm đất
          g.add(...barkMesh(barkTubes(LB, OT), barkMat)); g.add(...barkMesh(barkTubes(LD, OT), deadMat));
          // TÁN LÁ: mỗi ngọn cành 1 đám lá rải đều TRONG KHỐI bầu dục (kiểu tán táo: cloudPts), tâm nhô trên ngọn cành; mỗi đám = 1 khối chính + 2 khối con lệch tâm
          //  (viền không tròn đều). Đám kề nhau chồng lên nhau thành 1 tầng / cành chính; bán kính ngang CLOUD × rh, cao = ngang × min(1,15, 0,8 + 0,6 × padV), tâm nâng lệch nhau 0,15–0,55 × cao ⇒ đám gần tròn, không thành tầng dẹt
          //  (dáng bonsai giữ nhờ cành + khe giữa tầng, không nhờ cụm lá dẹt). Lá lẻ dọc cành con: rải trong ống quanh cành. RNG riêng; tránh cành gỗ chết
          const pts = [], ptW = [], LEAF_MAX = 14500, TW = 2000, CLOUD = 1.6;
          { const sR = mulberry32(7811), nearDead = l => { for (let i = 0; i < dead.length - 1; i++) { const a = dead[i], b = dead[i + 1], ab = b.clone().sub(a), k = Math.min(1, Math.max(0, l.clone().sub(a).dot(ab) / ab.lengthSq())); if (a.clone().addScaledVector(ab, k).distanceTo(l) < 0.34) return true; } return false; };
            const put = (w, W) => { const l = toL(w); if (!nearDead(l)) { pts.push([l.x, l.y, l.z]); wBytes(W, ptW); } };
            const ball = (cx, cy, cz, rh, rv, n, W) => { for (let i = 0; i < n; i++) { const a = sR() * 6.2832, ct = 2 * sR() - 1, st = Math.sqrt(1 - ct * ct), k = Math.cbrt(sR()); put(V(cx + rh * st * Math.cos(a) * k, cy + rv * ct * k, cz + rh * st * Math.sin(a) * k), W); } };
            const len = twigs.reduce((q, t) => q + t[0].distanceTo(t[1]), 0);
            for (const [a, b, w, L, li] of twigs) { const n = Math.round(TW * a.distanceTo(b) / len); for (let i = 0; i < n; i++) { const f = sR(), q = a.clone().lerp(b, f), an = sR() * 6.2832, r = w * Math.sqrt(sR()); put(V(q.x + r * Math.cos(an), q.y + w * (0.9 * sR() - 0.3), q.z + r * Math.sin(an)), wMix(L.W[li], L.W[li + 1], f)); } }
            const left = LEAF_MAX - pts.length, sum = pads.reduce((q, t) => q + t.rh * t.rh * t.rv, 0);
            for (const t of pads) { const n = Math.floor(left * t.rh * t.rh * t.rv / sum), rh = CLOUD * t.rh, rv = rh * Math.min(1.15, 0.8 + 0.6 * t.rv / t.rh), W = t.L.W[t.i], cy = t.p.y + (0.15 + 0.4 * sR()) * rv;
              ball(t.p.x, cy, t.p.z, rh, rv, Math.round(n * 0.56), W);
              for (let j = 0; j < 2; j++) { const an = sR() * 6.2832, d = rh * (0.45 + 0.4 * sR()), q = 0.5 + 0.2 * sR(); ball(t.p.x + d * Math.cos(an), cy + rv * (0.9 * sR() - 0.35), t.p.z + d * Math.sin(an), rh * q, rv * q, Math.round(n * 0.22), W); } } }
          tuftInstanced(g, rnd, pts, leafHexGeo(0.05), leafCols, 1, 0.7, tw, 0.04).geometry.setAttribute('aBr', new THREE.InstancedBufferAttribute(Uint8Array.from(ptW), 4, true));   // lá cây cổ thụ đặc
          g.userData.leafPts = Float32Array.from(pts.flat());   // lá vàng rụng sinh từ chính các chùm lá (toạ độ cục bộ) — mảng số x, y, z liền (bản [x, y, z] từng điểm tốn ~1 MB)

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
          const barkMat = new THREE.MeshLambertMaterial({ color: 0x4a3420 }); barkMat.userData.sfOld = 1; surfaceStyle(barkMat, 'bark'); skyShadeMat(barkMat, 'bark', { cav: 0.6, vtx: true });   // vân vỏ như cây mẹ (bản cũ) + bóng trời, hốc khuất
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
          tuftInstanced(g, rnd, sLeafPts, leafHexGeo(0.05), leafCols, 1);   // lá cây con đặc
          // ---- điểm treo TỔ ONG trên cành cây con (tổ ong giỏ rơm dựng ở animals/bees/hive.js, treo thẳng đứng từ điểm này) ----
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
            geo: new THREE.CylinderGeometry(0.045 * 2.3, 0.045 * 2.3, 0.0015 * 2.3, 6), opacity: 1, color: () => Math.random() < 0.85 ? 0xe5b82c : 0x5e8c44,   // 85% lá vàng, 15% lá xanh
            scale: NATURE_SCALE, tw: oldTreeWind, g: 3.5, vTerm: 0.7, flutA: 0.7, flutW: [2.2, 3.2], tumble: 0.35, tumbleW: [6, 10], slideU: 0.6, rate0: 0.05, rateK: 3.0, shake0: 0.012, restLife: [12, 24], floatLife: [30, 55], sinkP: 0.35, sinkV: [0.06, 0.1], leeway: 0.03 });
        }

        // ---- RỄ BÒ MẶT ĐẤT quanh gốc cây cổ thụ (ảnh gốc pohutukawa; rễ liền mạch, không rời rạc). Học: rễ chính (4–11, cây già nhiều hơn) mọc từ BẠNH GỐC (root collar · trunk flare) toả gần như nằm ngang trong lớp đất mặt
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
          const mat = new THREE.MeshLambertMaterial({ color: 0x4a3420 }); mat.userData.sfOld = 1; mat.userData.sfMoss = 1.35; mat.userData.sfTop = 1.6; surfaceStyle(mat, 'bark'); skyShadeMat(mat, 'bark', { cav: 0.6, vtx: true });   // sát đất cả rễ ⇒ rêu gốc phủ kín nếu để mặc định (rêu trên rễ nổi: sfMoss 1,35, phủ mặt trên sfTop 1,6)
          const rnd = mulberry32(4242), V = (x, y, z) => new THREE.Vector3(x, y, z), L = [], SAMP = [], STEP = 0.26, KE = 0.5, EM = -0.35, E1 = -2.0;   // rễ thuôn còn 50% ở đoạn nổi · nổi e 0,3 → −0,35 rồi cắm DỐC (~35°, quãng ~2,2 r) xuống −2 r · SAMP: mẫu các rễ đã dựng (rễ sau vắt qua)
          const water = (x, z) => isWater(Math.round(x2gi(cx + x)), Math.round(z2gj(cz + z)));
          const ground = (x, z) => cowY(cx + x, cz + z) - gy + 0.12 * Math.max(0, Math.min(1, (2.5 - Math.hypot(x, z)) / 0.3));   // + nền đất quanh gốc (stoneRing: trụ r 2,2 → 2,5, cao 0,12)
          // vòng ôm (x, z, r): 3 tảng đá của stoneRing (bán kính đo ở mặt đất — oldTreeStones) + gốc cây con (x + 2)
          const OBST = [...oldTreeStones.map(t => [t.x, t.z, t.r]), [2.0, 0.0, 0.42]];
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
            const T0 = P[1].clone().sub(P[0]).normalize(), l = { P, R, E, par, kids: [], atEnd: false, pr: par ? pr : sO * Math.max(0.35, T0.clone().cross(pT).length()), pT };
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
          // ---- VÙNG THUÔN NHANH rõ hơn: rễ lộ trên mặt đất chủ yếu là đoạn 1–2 m quanh gốc — ở đó tiết diện
          //      lớn nhất rồi thuôn rất nhanh (ISA 2015 "Tree root to stem tissue transition"; UMN "Root systems: the forgotten 50%"; Dobson ở trên) ⇒ nhân bán kính ×1,45 ở mặt
          //      thân → ×1 cách ~2 m; tâm dời theo r·e (đoạn nổi vẫn nổi, đoạn chìm vẫn chìm). Giữ nguyên đường đi + số rễ (dãy ngẫu nhiên không đổi) ----
          for (const l of L) for (let i = 0; i < l.P.length; i++) {
            const p = l.P[i], b = Math.floor((Math.atan2(p.z, p.x) / 6.2832 + 1) * NB) % NB, out = Math.max(0, Math.hypot(p.x, p.z) - at(b)), f = 1 + 0.45 * Math.exp(-out / 0.7);
            p.y += l.R[i] * (f - 1) * l.E[i]; l.R[i] *= f;
          }
          g.add(...barkMesh(barkTubes(L, { wS: 1, flare: 0, nodes: false, rope: { minR: 0.12, nTrunk: 6, D: 0.22, twist: 0.15 } }), mat));   // vỏ rễ nhẵn hơn thân (rãnh sợi 0,45 → 0,22, xoắn 0,35 → 0,15 — rễ to ra thì rãnh cũ sâu như thân)
          g.userData.roots = { lobes: lobes.map(p => [+((p.b + 0.5) / NB * 360).toFixed(0), +p.rr.toFixed(2), +p.pr.toFixed(3)]), n: L.length };
          bakeStatic(g);
        })();
