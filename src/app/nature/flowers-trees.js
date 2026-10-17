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
          const scl = (0.9 + Math.random() * 0.6) * 0.7; vegGroup(px, py, pz, rotY, scl);
          const kind = (Math.random() * 6) | 0, cube = vegPools.fcube;
          const tall = kind === 3;                                                                       // allium: thân cao đặc trưng
          if (!roadContains(px, pz, .35)) { const f = new THREE.Vector3(px, py + 0.5, pz); f.top = py + scl * ((tall ? 1.02 : 0.8) + [-0.02, 0.17, 0.045, 0.17, -0.06, 0.1][kind]); flowerCoords.push(f); }   // top: chỗ ong đáp (lòng chén poppy/tulip · đỉnh búp · nhuỵ cúc)
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
          // chuồng bò (ghim 54, 49) + sân trước chuồng + máng nước bên đông: G 17/10 đo được 1 cây rừng mọc xuyên ô chuồng số 2 (cây rải ngẫu nhiên mỗi lần mở trang)
          if (tx > X0 + 49 && tx < X0 + 62.5 && tz > Z0 + 45.5 && tz < Z0 + 55) return false;
          return true;
        }
        const treeCoords = [];   // cây rừng đặt SAU khi dựng mẫu nhánh đệ quy (xem bên dưới, sau recTree)

        // ---- CÂY ĐỆ QUY (fractal): grow() tự rẽ 2-3 nhánh mỗi cấp — giảm dần dài/bán kính, lá & quả
        //      mọc tự nhiên ở cành TẬN CÙNG (không hardcode cấp nhánh). Seeded RNG (mulberry32) để cây
        //      TÁI SINH Y HỆT mỗi lần tải → nút "Chọn" vẫn chỉnh được từng tán như cây cổ thụ. ----
        function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let z = Math.imul(a ^ a >>> 15, 1 | a); z = (z + Math.imul(z ^ z >>> 7, 61 | z)) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; }; }
        const _rtUp = new THREE.Vector3(0, 1, 0), _rtA = new THREE.Vector3(), _rtB = new THREE.Vector3(), _rtAx = new THREE.Vector3();
        // ---- CÂY ĐỆ QUY KIỂU TỰ NHIÊN (o.natural — G 15/10 "learn this glb natural tree branch then improve our recursive"; mẫu "Low Poly Tree Scene Free",
        //      Nicholas-3D, CC-BY-4.0 — chỉ đo dáng cành): THÂN CHÍNH chạy suốt tới ngọn (ưu thế ngọn), gốc trơn ~1/4 chiều cao rồi CÀNH BÊN rải dọc thân,
        //      xoay quanh trục theo GÓC VÀNG 137,5° (cành không chồng lên nhau), xoè ~50° rồi UỐN CONG VƯƠN LÊN (hướng sáng); cành dưới dài – cành trên ngắn
        //      ⇒ tán chóp / trứng; cành bên lại mọc cành con, cành con chẻ 2 nhánh nhọn ở đầu. Mỗi cành là 1 ỐNG CONG LIỀN thuôn dần (vòng 6 cạnh, khung vận
        //      chuyển song song) hơi gấp khúc — không còn khớp cầu che chỗ nối. Cành con ≤ ~60% bán kính cành mẹ tại chỗ mọc. ----
        const _ntN = new THREE.Vector3(), _ntB = new THREE.Vector3(), _ntT = new THREE.Vector3(), _ntX = new THREE.Vector3();
        function taperTube(pts, rad, seg) {   // ống cong qua pts, bán kính rad[i], khép ngọn bằng 1 đỉnh; pháp tuyến hướng ra ngoài
          // aBk = (quanh thân 0–1, dọc thân m) cho vân vỏ cây (core/surface-style.js) ⇒ cột đường may nhân đôi, pháp tuyến tính theo bán kính (không lộ đường may)
          const n = pts.length, P = [], N = [], B = [], I = [], S1 = seg + 1; let len = 0;
          _ntT.subVectors(pts[1], pts[0]).normalize(); _ntN.set(1, 0, 0); if (Math.abs(_ntT.x) > 0.9) _ntN.set(0, 0, 1);
          for (let i = 0; i < n; i++) {
            if (i) len += pts[i].distanceTo(pts[i - 1]);
            _ntT.subVectors(pts[Math.min(n - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize();
            _ntN.addScaledVector(_ntT, -_ntN.dot(_ntT)).normalize(); _ntB.crossVectors(_ntT, _ntN);
            for (let k = 0; k <= seg; k++) { const an = k / seg * 6.2832, c = Math.cos(an), s = Math.sin(an), nx = _ntN.x * c + _ntB.x * s, ny = _ntN.y * c + _ntB.y * s, nz = _ntN.z * c + _ntB.z * s;
              P.push(pts[i].x + nx * rad[i], pts[i].y + ny * rad[i], pts[i].z + nz * rad[i]); N.push(nx, ny, nz); B.push(k / seg, len); }
          }
          for (let i = 0; i < n - 1; i++) for (let k = 0; k < seg; k++) { const a = i * S1 + k, b = a + 1; I.push(a, b, a + S1, b, b + S1, a + S1); }
          const e = pts[n - 1]; P.push(e.x + _ntT.x * rad[n - 1], e.y + _ntT.y * rad[n - 1], e.z + _ntT.z * rad[n - 1]); N.push(_ntT.x, _ntT.y, _ntT.z); B.push(0.5, len + rad[n - 1]);
          for (let k = 0; k < seg; k++) I.push((n - 1) * S1 + k, (n - 1) * S1 + k + 1, n * S1);
          const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
          geo.setAttribute('aBk', new THREE.Float32BufferAttribute(B, 2)); geo.setIndex(I); return geo;
        }
        function bkAttr(geo, L) {   // ống / cầu có uv: aBk = (u quanh thân, v × chiều dài m + lệch ngẫu nhiên) — vân vỏ cây
          const uv = geo.attributes.uv, B = new Float32Array(uv.count * 3), o = (L * 73.1) % 7;
          for (let i = 0; i < uv.count; i++) { B[i * 3] = uv.getX(i); B[i * 3 + 1] = uv.getY(i) * L + o; B[i * 3 + 2] = 1; }
          geo.setAttribute('aBk', new THREE.BufferAttribute(B, 3)); return geo;
        }
        function natTree(g, o) {   // o: seed·barkMat·height·trunkR·bole·nLat0[min,max]·ang0·angTaper (cành dưới xoè ngang hơn)·latLen·bend·nLat1[min,max]·ang1·subLen·maxDepth·tipK·childK·gnarl·leafP
          const rnd = mulberry32(o.seed), tips = [], segs = [], seg = o.seg || 6, R = (m) => m[0] + ((rnd() * (m[1] - m[0] + 1)) | 0);
          const branch = (a, dir, len, r0, depth) => {
            const NS = depth ? 4 : 6, pts = [a.clone()], rad = [r0], d = dir.clone().normalize(), p = a.clone(), gn = o.gnarl * (depth ? 1 : 0.35), bend = depth ? o.bend / depth : 0.04;
            for (let s = 1; s <= NS; s++) {
              d.lerp(_rtUp, bend / NS).normalize();                                                        // hướng sáng: cành cong dần lên
              d.x += (rnd() - 0.5) * gn; d.z += (rnd() - 0.5) * gn; d.y += (rnd() - 0.5) * gn * 0.4; d.normalize();   // gấp khúc nhẹ
              p.addScaledVector(d, len / NS); pts.push(p.clone()); rad.push(r0 * (1 - (1 - o.tipK) * s / NS));
            }
            const m = new THREE.Mesh(taperTube(pts, rad, seg), o.barkMat); m.castShadow = true; m.receiveShadow = true; g.add(m);
            // đoạn cành (cho chim đậu đúng trên cành)
            for (let s = 0; s < NS; s++) segs.push([pts[s].x, pts[s].y, pts[s].z, pts[s + 1].x, pts[s + 1].y, pts[s + 1].z, rad[s], rad[s + 1]]);
            const end = pts[NS];
            if (depth === 0 || depth === 1 || rnd() < (o.leafP ?? 0.35)) tips.push(end.clone());           // điểm tán lá: ngọn thân, đầu cành cấp 1, ~1/3 đầu cành cấp 2
            if (depth >= o.maxDepth || r0 * o.tipK < 0.004) return;
            const at = (t, outP, outT) => { const f = t * NS, i = Math.min(NS - 1, f | 0), u = f - i; outP.lerpVectors(pts[i], pts[i + 1], u); outT.subVectors(pts[i + 1], pts[i]).normalize(); return rad[i] + (rad[i + 1] - rad[i]) * u; };
            const P = new THREE.Vector3(), T = new THREE.Vector3();
            if (depth >= 2) {   // cành con: chẻ 2 nhánh nhọn ở đầu
              for (const sgn of [-1, 1]) { at(0.92, P, T); _ntX.set(1, 0, 0); if (Math.abs(T.x) > 0.9) _ntX.set(0, 0, 1); _ntX.crossVectors(T, _ntX).normalize();
                branch(P, T.clone().applyAxisAngle(_ntX, sgn * (0.42 + 0.2 * rnd())), len * (0.32 + 0.12 * rnd()), rad[NS - 1] * 0.8, depth + 1); }
              return;
            }
            const n = R(depth ? o.nLat1 : o.nLat0), t0 = depth ? 0.3 : o.bole, az0 = rnd() * 6.2832;
            for (let k = 0; k < n; k++) {
              const t = t0 + (k + 0.25 + 0.5 * rnd()) / n * (0.94 - t0), r = at(t, P, T), tn = (t - t0) / (0.94 - t0);
              _ntN.set(1, 0, 0); if (Math.abs(T.x) > 0.9) _ntN.set(0, 0, 1); _ntN.crossVectors(T, _ntN).normalize(); _ntB.crossVectors(T, _ntN);
              const az = az0 + k * 2.39996 + (rnd() - 0.5) * 0.5;                                                       // góc vàng quanh cành mẹ
              _ntX.copy(_ntN).multiplyScalar(Math.cos(az)).addScaledVector(_ntB, Math.sin(az));
              const ang = (depth ? o.ang1 : o.ang0 * (1 + (o.angTaper || 0) * (0.5 - tn))) * (0.85 + 0.3 * rnd()), cl = len * (depth ? o.subLen : o.latLen) * (1 - (depth ? 0.45 : 0.62) * tn) * (0.8 + 0.4 * rnd());   // dưới dài – trên ngắn
              branch(P, T.clone().applyAxisAngle(_ntX, ang), cl, Math.min(r * o.childK, r0 * 0.6), depth + 1);
            }
          };
          branch(new THREE.Vector3(0, 0, 0), _rtUp, o.height, o.trunkR, 0);
          return { tips, rnd, flowerPts: [], segs };
        }
        // ---- CÀNH CÂY = ỐNG CONG LIỀN (G 17/10 khoanh "chỗ gấp" trên thân cây táo: thân cũ là các khúc trụ thẳng 7 cạnh nối bằng quả cầu ở mỗi khúc gấp
        //      ⇒ gãy góc, mép trụ lòi ra, vân vỏ bắt đầu lại ở từng khúc (vệt địa y lặp đúng chỗ khớp), vật liệu trong suốt lộ quả cầu thành đốm tối trong
        //      thân). barkTubes dùng chung cho recTree (táo, anh đào, cành khúc gỗ) và cây cổ thụ: điểm gấp khúc vẫn tính y như cũ (cùng thứ tự rnd() ⇒
        //      cành, táo, hoa, hộp tổ, tổ ong, chỗ chim/cò/bướm đậu không đổi) rồi luồn ĐƯỜNG CONG Catmull–Rom hướng tâm qua các điểm đó, mặt cắt theo khung
        //      vận chuyển song song, pháp tuyến tính từ chính lưới (không lộ đường may).
        //      Chỗ chẻ nhánh làm như cây thật mọc: thân chạy LIỀN vào cành con thẳng hướng nhất (lệch < 60°) — 1 ống qua chỗ chẻ, không có mép; cành con
        //      còn lại bắt đầu TRONG LÒNG cành mẹ (lùi 1,4 bán kính, cùng hướng mẹ, nhỏ hơn 4%) rồi uốn 1 chiều sang hướng riêng ⇒ tách khỏi sườn thân
        //      theo đường xiên. Cành mọc ngang giữa thân (cây cổ thụ): cắm từ tim thân ra, gốc cành phình 30% (cổ cành). Gốc thân loe theo múi (bạnh rễ).
        //      Vân vỏ dọc thân tính liền 1 mạch theo cả chuỗi. Bản đầu (đầu cành mẹ khép vòm, 4 cành con cùng mọc ra ở 1 độ cao) còn gờ ngang ở nách cành ----
        const _crV = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        function crPt(P0, P1, P2, P3, t, out) {   // Catmull–Rom hướng tâm (α = 0,5; Barry–Goldman) trên đoạn P1→P2, t 0–1
          const t1 = Math.sqrt(P0.distanceTo(P1)) + 1e-6, t2 = t1 + Math.sqrt(P1.distanceTo(P2)) + 1e-6, t3 = t2 + Math.sqrt(P2.distanceTo(P3)) + 1e-6, u = t1 + (t2 - t1) * t;
          const [A1, A2, A3, B1, B2] = _crV;
          A1.copy(P0).multiplyScalar((t1 - u) / t1).addScaledVector(P1, u / t1);
          A2.copy(P1).multiplyScalar((t2 - u) / (t2 - t1)).addScaledVector(P2, (u - t1) / (t2 - t1));
          A3.copy(P2).multiplyScalar((t3 - u) / (t3 - t2)).addScaledVector(P3, (u - t2) / (t3 - t2));
          B1.copy(A1).multiplyScalar((t2 - u) / t2).addScaledVector(A2, u / t2);
          B2.copy(A2).multiplyScalar((t3 - u) / (t3 - t1)).addScaledVector(A3, (u - t1) / (t3 - t1));
          return out.copy(B1).multiplyScalar((t2 - u) / (t2 - t1)).addScaledVector(B2, (u - t1) / (t2 - t1));
        }
        // L: cành theo thứ tự dựng (mẹ trước con) { P: điểm gấp, R: bán kính, par, kids, atEnd (mọc ở ngọn cành mẹ), root (gốc cắm đất), pr (bán kính mẹ
        //    chỗ mọc ngang), pT (hướng cành mẹ chỗ đó) } · o: flare (độ loe gốc, 0,6) · flareH (cao loe × bán kính gốc, 1,1) · lobes (số múi, 5) · sink (gốc cắm
        //    đất, 0,1) · wS (tỉ lệ ra thế giới ⇒ số
        //    cạnh, số vòng, 0,9) · segMax (14) → 1 BufferGeometry (position · normal · uv · aBk)
        function barkTubes(L, o = {}) {
          const P = [], N = [], UV = [], BK = [], I = [], FB = [], F = o.flare ?? 0.6, lobes = o.lobes ?? 5, wS = o.wS ?? 0.9;
          const T = new THREE.Vector3(), Nf = new THREE.Vector3(), Bf = new THREE.Vector3(), q = new THREE.Vector3();
          for (const me of L) {   // cành con nối tiếp = thẳng hướng nhất trong các cành mọc ở ngọn (lệch < 60°)
            let best = null, bd = 0.5; const n = me.P.length, d = T.subVectors(me.P[n - 1], me.P[n - 2]).normalize().clone();
            for (const k of me.kids) if (k.atEnd) { const c = q.subVectors(k.P[1], k.P[0]).normalize().dot(d); if (c > bd) { bd = c; best = k; } }
            if (best) { me.main = best; best.cont = true; }
          }
          let ci = 0;
          for (const head of L) {
            if (head.cont) continue;
            const ch = [head]; while (ch[ch.length - 1].main) ch.push(ch[ch.length - 1].main);
            const C = [], R = [], ends = [];
            ch.forEach((l, i) => { for (let j = i ? 1 : 0; j < l.P.length; j++) { C.push(l.P[j].clone()); R.push(l.R[j]); } ends.push(C.length - 1); });
            // đầu chuỗi: 0 gốc cắm đất 0,1 · 1 mọc ở ngọn cành mẹ (lùi vào lòng mẹ, cùng hướng mẹ) · 2 mọc ngang (cắm từ tim cành mẹ ra, cổ cành phình)
            const r0 = R[0], kind = head.root ? 0 : head.par && head.atEnd ? 1 : 2;
            let T0;
            if (kind === 0) { T0 = _rtUp.clone(); C.unshift(C[0].clone().addScaledVector(T0, -(o.sink ?? 0.1))); R.unshift(r0); for (let i = 0; i < ends.length; i++) ends[i]++; }
            else if (kind === 1) { T0 = head.par.Te.clone(); C[0].addScaledVector(T0, -1.4 * r0); R[0] = 0.96 * r0; }
            else T0 = q.subVectors(C[1], C[0]).normalize().clone();
            // chỗ nối liền mà cành con nhỏ hẳn (thân cổ thụ → cành ngọn): thuôn dần qua 2 đoạn thay vì thắt cổ chai ngay sau chỗ nối
            for (let i = 0; i < ch.length - 1; i++) { const e = ends[i]; R[e] = Math.min(R[e], 0.5 * (R[e - 1] + R[e + 1])); }
            const n = C.length, last = C[n - 1], dl = T.subVectors(last, C[n - 2]).normalize().clone();
            const Q = [C[0].clone().addScaledVector(T0, -(kind === 1 ? 1.4 * r0 : C[0].distanceTo(C[1]))), ...C, last.clone().addScaledVector(dl, last.distanceTo(C[n - 2]))];
            const S = [], SR = [], cI = [];
            for (let j = 0; j < n - 1; j++) {
              // số vòng / đoạn theo cỡ thật: thân 4 · cành 3 · cành nhỏ 2 · ngọn mảnh 1 (đoạn ngọn Bézier đã đủ mịn) — đoạn đầu cành con dày hơn (chỗ tách)
              const rw = R[j] * wS, k = rw >= 0.12 ? 4 : rw >= 0.035 ? 3 : rw >= 0.015 ? 2 : 1; cI.push(S.length);
              const ts = j === 0 && kind === 0 ? [0] : j === 1 && kind === 0 ? [0, 0.06, 0.14, 0.25, 0.4, 0.6, 0.8]
                : j === 0 && kind ? (rw >= 0.09 ? [0, 0.12, 0.26, 0.42, 0.6, 0.8] : rw >= 0.03 ? [0, 0.2, 0.4, 0.65] : [0, 0.35, 0.7]) : Array.from({ length: k }, (_, i) => i / k);
              for (const t of ts) { S.push(crPt(Q[j], Q[j + 1], Q[j + 2], Q[j + 3], t, new THREE.Vector3())); SR.push(R[j] + (R[j + 1] - R[j]) * t); }
            }
            cI.push(S.length); S.push(last.clone()); SR.push(R[n - 1]);
            // hướng thật ở ngọn từng cành trong chuỗi ⇒ cành con mọc ở đó đi tiếp theo hướng này
            ch.forEach((l, i) => { const e = ends[i]; l.Te = C[e].clone().sub(crPt(Q[e - 1], Q[e], Q[e + 1], Q[e + 2], 0.995, T)).normalize(); });
            // đoạn cành cho chim đậu (o.segs, cành ghi s0 = chỉ số đoạn đầu): thêm điểm giữa THẬT trên đường cong [8–10] — đường cong lệch dây cung tới ~2,5 cm
            if (o.segs) ch.forEach((l, i) => { if (l.s0 === undefined) return; const cs = i ? ends[i - 1] : kind === 0 ? 1 : 0;
              for (let p = 0; p < l.P.length - 1; p++) { const sg = o.segs[l.s0 + p], j = cs + p; if (!sg) continue; q.set((sg[0] + sg[3]) / 2, (sg[1] + sg[4]) / 2, (sg[2] + sg[5]) / 2); let bd = Infinity;
                for (let t = 0.2; t <= 0.8; t += 0.05) { crPt(Q[j], Q[j + 1], Q[j + 2], Q[j + 3], t, T); const dd = T.distanceToSquared(q); if (dd < bd) { bd = dd; sg[8] = T.x; sg[9] = T.y; sg[10] = T.z; } } } });
            const tE = ch[ch.length - 1].Te, nRing = S.length, rb = SR[nRing - 1], hc = 0.7 * rb;   // vòm khép ngọn chuỗi (cao 0,7 bán kính)
            for (const ph of [0.55, 1.05]) { S.push(last.clone().addScaledVector(tE, hc * Math.sin(ph))); SR.push(rb * Math.cos(ph)); }
            const tip = last.clone().addScaledVector(tE, hc), M = S.length, seg = Math.max(5, Math.min(o.segMax ?? 14, Math.round(4 + r0 * wS * 45))), S1 = seg + 1;
            // khung vận chuyển song song + lưới đỉnh (gốc thân: bạnh múi tắt dần theo độ cao · cành mọc ngang: cổ cành phình ra ngoài mặt cành mẹ)
            const G = [], tan = S.map((s, i) => i >= nRing - 1 ? tE.clone() : new THREE.Vector3().subVectors(S[Math.min(M - 1, i + 1)], S[Math.max(0, i - 1)]).normalize());
            // cành con mọc ở ngọn: khung mặt cắt + toạ độ vân vỏ NỐI TỪ cành mẹ ⇒ vân chạy liền qua đường tách
            const pf = kind === 1 && head.par.fr; if (pf) Nf.copy(pf.N); else { Nf.set(1, 0, 0); if (Math.abs(tan[0].x) > 0.9) Nf.set(0, 0, 1); }
            const y0 = head.P[0].y, H = (o.flareH ?? 1.1) * r0, sIn = head.pr != null ? head.pr / Math.max(0.35, head.pT ? q.crossVectors(T0, head.pT).length() : 1) : 1.5 * r0, len = [0], FN = [];   // sIn: quãng từ tim cành mẹ ra tới mặt vỏ
            for (let i = 0; i < M; i++) {
              if (i) len.push(len[i - 1] + S[i].distanceTo(S[i - 1]));
              Nf.addScaledVector(tan[i], -Nf.dot(tan[i])).normalize(); Bf.crossVectors(tan[i], Nf); FN.push(Nf.clone());
              const fl = kind === 0 && i < nRing ? F * Math.exp(-Math.max(0, S[i].y - y0) / H) : 0, col = kind === 2 && i < nRing ? 1 + 0.3 * Math.exp(-Math.max(0, len[i] - sIn) / (1.5 * r0)) : 1;
              const rw = SR[i] * wS, nq = len[i] * wS / 0.3 + ci * 0.37, nd = rw < 0.07 && Math.abs(Math.sin(Math.floor(nq) * 78.233) * 43758.55) % 1 > 0.3 ? 0.18 * (1 - rw / 0.07) * Math.exp(-((((nq % 1) - 0.5) * 7) ** 2)) : 0;   // mắt cành u lên ~30 cm một (cành non — bản quét)
              for (let k = 0; k < seg; k++) { const a = k / seg * 6.2832, c = Math.cos(a), s = Math.sin(a), r = SR[i] * col * (1 + nd) * (1 + fl * (0.72 + 0.28 * Math.cos(lobes * a + 0.7)));
                G.push(new THREE.Vector3(S[i].x + (Nf.x * c + Bf.x * s) * r, S[i].y + (Nf.y * c + Bf.y * s) * r, S[i].z + (Nf.z * c + Bf.z * s) * r)); }
            }
            // hộp bao TỪNG ĐOẠN (bản đồ bay của ong / bướm: 1 lưới cả cây mà chỉ có 1 hộp thì chặn kín cả tán — bản cũ có hộp từng trụ / cầu đã gộp)
            for (let j = 0; j < n; j++) { const i0 = cI[j], i1 = j < n - 1 ? cI[j + 1] : M - 1, b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
              for (let i = i0; i <= i1; i++) for (let k = 0; k < seg; k++) { const v = G[i * seg + k]; b[0] = Math.min(b[0], v.x); b[1] = Math.min(b[1], v.y); b[2] = Math.min(b[2], v.z); b[3] = Math.max(b[3], v.x); b[4] = Math.max(b[4], v.y); b[5] = Math.max(b[5], v.z); }
              if (j === n - 1) { b[0] = Math.min(b[0], tip.x); b[1] = Math.min(b[1], tip.y); b[2] = Math.min(b[2], tip.z); b[3] = Math.max(b[3], tip.x); b[4] = Math.max(b[4], tip.y); b[5] = Math.max(b[5], tip.z); }
              FB.push(...b); }
            const base = P.length / 3, off = pf ? pf.along - 1.4 * r0 : (ci * 7.31 + 3.7) % 11, tot = len[M - 1] + hc * 0.3, nv = new THREE.Vector3(), da = new THREE.Vector3(), ds = new THREE.Vector3(); ci++;
            const bm = pf ? pf.bm : Math.max(1, Math.round(6.2832 * r0 * wS / 0.9)), vK = wS / 0.9;   // vân: 12 rãnh / ~0,9 m chu vi thật · dọc thân theo m thật
            ch.forEach((l, i) => { const j = cI[ends[i]]; l.fr = { N: FN[j], along: len[j] + off, bm }; });
            // gốc cành con: pháp tuyến hoà dần từ pháp tuyến mặt cành mẹ (hướng xuyên tâm trục mẹ) ⇒ không lộ nếp gấp sáng tối ở đường tách
            const bA = kind === 1 ? head.par.P[head.par.P.length - 1] : kind === 2 && head.pT ? head.P[0] : null, bT = kind === 1 ? T0 : head.pT, w0 = kind === 1 ? r0 : 0.8 * sIn, w1 = kind === 1 ? 3.4 * r0 : sIn + 2.2 * r0;
            const Bp = pf ? new THREE.Vector3().crossVectors(T0, pf.N) : null;
            for (let i = 0; i < M; i++) for (let k = 0; k <= seg; k++) {
              const kk = k % seg, g0 = G[i * seg + kk];
              da.subVectors(G[i * seg + (kk + 1) % seg], G[i * seg + (kk + seg - 1) % seg]);
              ds.subVectors(i < M - 1 ? G[(i + 1) * seg + kk] : tip, G[Math.max(0, i - 1) * seg + kk]);
              nv.crossVectors(da, ds).normalize(); if (nv.dot(q.subVectors(g0, S[i])) < 0) nv.negate();
              let bu = k / seg;
              if (bA && len[i] < w1) {
                const w = Math.max(0, Math.min(1, (len[i] - w0) / (w1 - w0))), sw = w * w * (3 - 2 * w); q.subVectors(g0, bA); q.addScaledVector(bT, -q.dot(bT)).normalize(); nv.multiplyScalar(sw).addScaledVector(q, 1 - sw).normalize();
                // vân vỏ: toạ độ quanh trục cành MẸ tại đỉnh này (nối liền vết nứt qua đường tách), hoà dần sang toạ độ riêng
                if (pf) { const up = Math.atan2(q.dot(Bp), q.dot(pf.N)) / 6.2832 + 1, u1 = up + Math.round(bu - up); bu = u1 + (bu - u1) * sw; }
              }
              P.push(g0.x, g0.y, g0.z); N.push(nv.x, nv.y, nv.z); UV.push(k / seg, len[i] / tot); BK.push(bu * bm, (len[i] + off) * vK, bm - 0.49 + Math.min(0.98, SR[i] * wS * 2));   // phần lẻ: bán kính (shader: cành non)
            }
            P.push(tip.x, tip.y, tip.z); N.push(tE.x, tE.y, tE.z); UV.push(0.5, 1); BK.push(0.5 * bm, (len[M - 1] + hc * 0.3 + off) * vK, bm - 0.49 + Math.min(0.98, rb * wS * 2));
            for (let i = 0; i < M - 1; i++) for (let k = 0; k < seg; k++) { const a = base + i * S1 + k, b = a + 1; I.push(a, b, a + S1, b, b + S1, a + S1); }
            for (let k = 0; k < seg; k++) I.push(base + (M - 1) * S1 + k, base + (M - 1) * S1 + k + 1, base + M * S1);
          }
          const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3));
          geo.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); geo.setAttribute('aBk', new THREE.Float32BufferAttribute(BK, 3)); geo.setIndex(I);
          geo.userData.flightBounds = new Float64Array(FB); return geo;
        }
        const _barkDepth = new WeakMap();   // vật liệu vỏ → bản chỉ ghi độ sâu
        function barkMesh(geo, mat) {   // → [mesh] · vỏ trong suốt: thêm bản CHỈ GHI ĐỘ SÂU vẽ trước (cùng shader ⇒ cùng độ sâu) ⇒ chỉ lớp vỏ ngoài cùng được tô
          // (cành con chui ra từ lòng cành mẹ, đoạn thân lồng nhau không còn chồng 2 lớp mờ thành vệt đậm ở đường tách); bóng đổ chỉ tính bản thật
          const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
          if (geo.userData.flightBounds) bakedFlightBounds.set(geo, geo.userData.flightBounds);   // vật cản bay theo từng đoạn cành (insects.js)
          if (!mat.transparent) return [m];
          let dm = _barkDepth.get(mat);
          if (!dm) {   // gió / vân vỏ gắn vào vật liệu SAU khi dựng cây (anh đào) ⇒ gọi móc của vật liệu thật lúc biên dịch
            const ud = mat.userData; mat.userData = {}; dm = mat.clone(); mat.userData = ud; _barkDepth.set(mat, dm); dm.colorWrite = false;   // userData có thể vòng tròn (treeWind ⇄ depthMat) ⇒ không cho clone() sao chép
            dm.onBeforeCompile = (sh, r) => mat.onBeforeCompile(sh, r); dm.customProgramCacheKey = () => mat.customProgramCacheKey();
          }
          const d = new THREE.Mesh(geo, dm); d.renderOrder = m.renderOrder - 0.5; d.name = 'Vỏ cây (lượt độ sâu)'; d.raycast = () => {};
          d.userData.noBatch = true; d.userData.noCollide = true; d.userData.noBake = true; d.userData.noFlight = true; return [d, m];
        }
        function recTree(g, o) {   // o: seed·s·barkMat·trunkLen·trunkR·maxDepth·nMin/nMax·lenK·radK·spread·upBias·recursiveLeaves·flare (bạnh gốc, mặc định 0,6)  (o.natural → natTree)
          if (o.natural) return natTree(g, o);
          const rnd = mulberry32(o.seed), tips = [], segs = [], limbs = [];
          const flowerPts = [];

          // Hàm đệ quy bẻ cong cành (Midpoint Displacement): chỉ ghi điểm gấp khúc P / bán kính R (lưới dựng sau ở barkTubes); segs = đoạn thẳng như cũ (chim đậu)
          const crookedLimb = (a, b, r1, r2, P, R, depth = 0, maxDepth = (o.limbMaxDepth != null ? o.limbMaxDepth : 2)) => {
            const d = b.clone().sub(a), L = d.length();
            if (depth >= maxDepth || L < 0.1 || r1 < 0.012) {
              segs.push([a.x, a.y, a.z, b.x, b.y, b.z, r1, r2]); P.push(b); R.push(r2);
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
            crookedLimb(a, mid, r1, midR, P, R, depth + 1, maxDepth);
            crookedLimb(mid, b, midR, r2, P, R, depth + 1, maxDepth);
          };

          (function grow(a, dir, len, r, depth, par) {
            const b = a.clone().addScaledVector(dir, len);
            if (depth > 0) { b.x += (rnd() - 0.5) * len * 0.3; b.z += (rnd() - 0.5) * len * 0.3; }   // thân chính thẳng, nhánh con xiêu vẹo
            const me = { P: [a], R: [r], par, kids: [], atEnd: true, root: !par, s0: segs.length }; crookedLimb(a, b, r, r * o.radK, me.P, me.R); limbs.push(me); if (par) par.kids.push(me);

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
              grow(b, nd, len * o.lenK * lengthFactor, r * (depth === 0 && o.rootK ? o.rootK : o.radK), depth + 1, me);   // rootK (tùy chọn): thân giữ to, nhánh cấp 1 đột ngột nhỏ (cây cổ thụ)
            }
          })(new THREE.Vector3(0, 0, 0), _rtUp.clone(), o.trunkLen, o.trunkR, 0, null);
          g.add(...barkMesh(barkTubes(limbs, Object.assign({ segs }, o)), o.barkMat));
          return { tips, rnd, flowerPts, segs };
        }
        function cloudPts(rnd, cx2, cy2, cz2, r, n, pts) { for (let i = 0; i < n; i++) { const rr = r * Math.cbrt(rnd()), th = rnd() * 6.283, ph = Math.acos(2 * rnd() - 1); pts.push([cx2 + rr * Math.sin(ph) * Math.cos(th), cy2 + rr * Math.cos(ph) * 0.8, cz2 + rr * Math.sin(ph) * Math.sin(th)]); } }
