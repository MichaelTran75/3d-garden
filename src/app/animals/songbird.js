        // ===== CHIM SẺ (G 14/10) — dựng bằng code theo tỉ lệ + màu đo từ mẫu "Bird 5 - Animated Low Poly" (WildPoly3D, Sketchfab, CC-BY-NC-4.0;
        //      chỉ đo: dài mỏ→đuôi 1 · sải cánh ~1,4 · lưng nâu, bụng kem, mỏ ô-liu sẫm, chân xám; nhịp bay mẫu 0,8 s, hạ cánh 0,57 s).
        //  Tập tính chim sẻ nhỏ: đậu thì ngoái đầu giật cục (đổi hướng nhìn 0,3–1,5 s/lần), vẫy đuôi, rỉa lông; dưới đất NHẢY 2 CHÂN, mổ nhanh
        //  1–3 cú rồi NGẨNG ĐẦU canh chừng (chim sẻ ngẩng nhiều lần, mỗi lần ngắn); bay "vỗ – xếp cánh" (vài nhịp vỗ nhanh rồi gập cánh rơi
        //  theo quán tính ⇒ đường bay nhấp nhô); cất cánh nhún rồi bật, hạ cánh xoè đuôi, ngửa thân, duỗi chân. Ngủ: xù lông, ngoái đầu rúc mỏ.
        //  · Con ở trại: thanh treo đèn lồng → (thỉnh thoảng) xuống cỏ kiếm ăn → cây táo → nóc xe → dây điện 110 kV → về; 19:00–05:45 / mưa
        //    ngủ trên chạc cây táo sát thân. · 2 cặp làm tổ, mỗi cặp 1 HỘP TỔ (vách tây chuồng bò · treo cành cây táo; dựng theo mẫu "Bird the nest
        //    Home Building", adventurer, CC-BY-4.0 — chỉ đo; vách trong 50%, nét viền hiện rõ): ngày kiếm mồi quanh bãi bò, ngậm sâu bay về, đậu que trước lỗ, chui vào
        //    mớm cho 2 chim non (non ngóc đầu há mỏ), chui ra bay đi; tối 2 con chui vào hộp ngủ. Người / chó lại gần lúc đang dưới đất thì bay sớm.
        // ---- KÍCH THÍCH QUANH CHIM SẺ (G 16/10): vật bay lượn để đuổi chơi (lá / cánh hoa đang rơi, bướm) · con vật cần né · gió tại chỗ ----
        //  Chim sẻ nhà kiếm ăn cả kiểu "lao bắt" côn trùng bay (sally); chim non hay đuổi vật rơi lấp lửng — ở đây đuổi chơi rồi về chỗ cũ.
        //  Khoảng cách bỏ chạy (flight initiation): người ĐANG ĐI tới 2 m (ngồi yên chỉ 1 m — chim quanh trại đã quen), chó 2,2 m (chạy 3,2 m),
        //  gấu mèo 3 m, cò dưới đất 3 m; bò bước sát 0,9 m thì chỉ nhảy tránh (chim sẻ hay kiếm hạt rơi quanh chân gia súc).
        const _spT = new THREE.Vector3(), _spW = new THREE.Vector3(), SPA = { dogV: 0, engV: 0, dp: new THREE.Vector3(), ep: new THREE.Vector3(), init: false };
        // 1 lần/khung: tốc độ chó, người (từ vị trí khung trước)
        function sparrowAnimTick(dt) {
          const k = 1 / Math.max(dt, 1e-3), e = engObj ? engObj.g.position : SPA.ep;
          if (SPA.init) { SPA.dogV = SPA.dp.distanceTo(dogObj.position) * k; SPA.engV = SPA.ep.distanceTo(e) * k; }
          SPA.dp.copy(dogObj.position); SPA.ep.copy(e); SPA.init = true;
        }
        // vật bay lượn gần nhất trong bán kính r → { at() = vị trí (null khi hết bay) }
        function sparrowToy(p, r) {
          let best = null, bd = r;
          for (const L of [cherryCtl, forestLeafCtl, oldTreeLeafCtl]) if (L && L.o.group?.visible !== false) for (const q of L.parts) if (q.st === 1) { const d = q.p.distanceTo(p); if (d < bd) { bd = d; best = { at: () => q.st === 1 ? q.p : null }; } }
          for (const bf of butterflies) if (bf.mode !== 'perched' && bf.g.visible) { const d = bf.pos.distanceTo(p); if (d < bd) { bd = d; best = { at: () => bf.mode !== 'perched' && bf.g.visible ? bf.pos : null }; } }
          return best;
        }
        // 'fly' (bay đi) · 'hop' (nhảy tránh bò) · null; sparrowFlush.from = nguồn
        function sparrowFlush(p) {
          const h = (q) => Math.hypot(q.x - p.x, q.z - p.z), R = sparrowFlush;
          if (engObj && !engObj.inVan && engObj.g.parent === scene && h(engObj.g.position) < (SPA.engV > 0.3 ? 2 : 1)) { R.from = engObj.g.position; return 'fly'; }
          if (!dogRain.st && h(dogObj.position) < (SPA.dogV > 1.5 ? 3.2 : 2.2)) { R.from = dogObj.position; return 'fly'; }
          if (raccoonObj && raccoonObj.visible && h(raccoonObj.position) < 3) { R.from = raccoonObj.position; return 'fly'; }
          for (const c of storksGroup.children) { c.getWorldPosition(_spT); if (Math.abs(_spT.y - p.y) < 1.5 && h(_spT) < 3) { R.from = _spT; return 'fly'; } }
          for (const c of cows) if (h(c) < 0.9) { R.from = c; return 'hop'; }
          return null;
        }
        // CHỖ ĐẬU TRÊN CÀNH THẬT (G 16/10: chim trú mưa lơ lửng cạnh thân cây — điểm cũ là toạ độ đoán theo cỡ cây, không nằm trên cành nào):
        //  đọc đoạn cành cây ghi lúc dựng (recTree / natTree: [a, b, r1, r2]); giữ đoạn có bán kính vừa chân chim, gần ngang, ở giữa tán (lá che phía
        //  trên), gần thân (trú mưa); điểm = MẶT TRÊN cành, chim đứng vuông góc cành. Xếp theo độ kín (gần thân, cao trong dải) → chọn các chỗ cách nhau.
        function branchPerches(segs, toWorld, rS, o) {
          const out = [], a = new THREE.Vector3(), b = new THREE.Vector3(), d = new THREE.Vector3(), top = Math.max(...segs.map(s => Math.max(s[1], s[4])));
          for (const s of segs) {
            const r = 0.5 * (s[6] + s[7]) * rS, ym = 0.5 * (s[1] + s[4]);
            if (r < o.rMin || r > o.rMax || ym < o.y0 * top || ym > o.y1 * top) continue;
            toWorld(a.set(s[0], s[1], s[2])); toWorld(b.set(s[3], s[4], s[5])); d.subVectors(b, a); const L = d.length(); if (L < 0.1) continue; d.divideScalar(L);
            if (Math.abs(d.y) > 0.6) continue;
            const m = s.length > 8 ? toWorld(new THREE.Vector3(s[8], s[9], s[10])) : a.clone().lerp(b, 0.5); m.y += r;   // [8–10]: điểm giữa thật trên cành cong (recTree)
            out.push({ p: m, yaw: Math.atan2(d.x, d.z) + Math.PI / 2, score: Math.hypot(s[0] + s[3], s[2] + s[5]) / Math.max(top, 1e-3) - ym / top });
          }
          out.sort((x, y) => x.score - y.score); return out;
        }
        function pickPerches(list, n, gap) {   // n chỗ đầu danh sách, cách nhau ≥ gap
          const res = []; for (const c of list) { if (res.every(q => q.p.distanceTo(c.p) >= gap)) res.push(c); if (res.length >= n) break; }
          while (res.length < n && list.length) res.push(list[res.length % list.length]); return res;
        }
        function makeSparrow(brain, size = 1) {
          const SC = 0.18 * size, up = new THREE.Vector3(0, 1, 0);
          const vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), lam = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
          const BROWN = new THREE.Color(0xa8754f), CREAM = new THREE.Color(0xf1e6cc), DARK = 0x4a3328;
          const paint = (geo, f) => { const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const k = f(p.getX(i), p.getY(i), p.getZ(i)); c.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
          const root = new THREE.Group(); root.name = 'Chim sẻ'; root.scale.setScalar(SC); scene.add(root);
          const bodyP = new THREE.Group(); bodyP.position.y = 0.26; root.add(bodyP);   // gốc = điểm chân bám
          const mesh = (geo, m, par, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
          // G 18/10 "study glb small bird then apply to our small bird structure (keep our colourful bird)": CẤU TRÚC theo mẫu "Flying Bird" (sandeep.s,
          //  CC-BY-4.0 — chỉ đo): thân thon tiết diện bát giác vát cạnh (ngực sâu, thon dần về gốc đuôi; rộng / dài thân 0,3 như mẫu, trước là quả trứng 0,6),
          //  đầu nhỏ, mỏ thon dài, đuôi dài hẹp chẻ nhẹ, cánh RỘNG CONG VỒNG (mép trước thẳng ở cánh tay rồi xuôi mạnh ra sau ở bàn cánh, mép sau cong, đầu cánh
          //  nhọn; sải / dài 1,27 như mẫu), nhịp vỗ theo mẫu (đỉnh +52° → đáy −30°, xuôi sau 17° ở đỉnh → 26° ở đáy, thân nhấp nhô theo nhịp). GIỮ màu chim
          //  sẻ của mình (lưng nâu, bụng kem, vạch kem, bàn cánh nâu sẫm, mỏ ô-liu) và mọi tập tính; cánh vẫn 2 đốt (cánh tay + bàn cánh) để gập khi đậu.
          const loft = (st, n = 8) => {   // st: [z, nửa rộng, nửa cao, tâm y] từ trước ra sau · lưng nâu (nửa trên + sườn), bụng kem
            const P = [], C = [], I = [], col = sa => sa > -0.3 ? BROWN : CREAM;
            st.forEach(([z, w, h, c]) => { for (let k = 0; k < n; k++) { const a = (k + 0.5) / n * TAU, sa = Math.sin(a); P.push(Math.cos(a) * w, c + sa * h, z); const q = col(sa); C.push(q.r, q.g, q.b); } });
            for (let i = 0; i < st.length - 1; i++) for (let k = 0; k < n; k++) { const a = i * n + k, b = i * n + (k + 1) % n; I.push(a, a + n, b, b, a + n, b + n); }
            const cap = (j, dz, flip) => { const f = P.length / 3, [z, , , c] = st[j]; P.push(0, c, z + dz); C.push(BROWN.r, BROWN.g, BROWN.b); for (let k = 0; k < n; k++) { const a = j * n + k, b = j * n + (k + 1) % n; if (flip) I.push(f, b, a); else I.push(f, a, b); } };
            cap(0, 0.03, false); cap(st.length - 1, -0.03, true);
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
          };
          const wingGrid = (le, te, cam, nz = 3) => {   // mặt cánh cong vồng: mép trước le / mép sau te ([x, z] theo sải), cung lưng cao cam (nhỏ dần ra đầu cánh)
            const P = [], I = [], n = le.length;
            for (let i = 0; i < n; i++) for (let j = 0; j <= nz; j++) { const u = j / nz, x = le[i][0] + (te[i][0] - le[i][0]) * u, z = le[i][1] + (te[i][1] - le[i][1]) * u; P.push(x, cam * (1 - 0.6 * i / (n - 1)) * Math.sin(Math.PI * Math.pow(u, 0.85)), z); }
            for (let i = 0; i < n - 1; i++) for (let j = 0; j < nz; j++) { const a = i * (nz + 1) + j, c = a + nz + 1; I.push(a, a + 1, c, a + 1, c + 1, c); }
            const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setIndex(I); g.computeVertexNormals(); return g;
          };
          mesh(loft([[0.2, 0.09, 0.09, 0.1], [0.12, 0.14, 0.14, 0.05], [0.02, 0.16, 0.16, 0.02], [-0.08, 0.15, 0.145, 0.025], [-0.17, 0.11, 0.1, 0.045], [-0.25, 0.05, 0.045, 0.06]]), vc, bodyP);
          const head = new THREE.Group(); head.position.set(0, 0.13, 0.25); bodyP.add(head);
          const headG = new THREE.SphereGeometry(0.5, 8, 6); headG.scale(0.25, 0.24, 0.28);
          mesh(paint(headG, (x, y, z) => y > 0.0 - 0.05 * z ? BROWN : CREAM), vc, head, 0, 0.06, 0.03);
          const beakG = new THREE.ConeGeometry(0.034, 0.13, 6); beakG.rotateX(Math.PI / 2); mesh(beakG, lam(0x4a4630), head, 0, 0.045, 0.2);
          const food = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 5).rotateZ(Math.PI / 2), lam(0x7d9a3a), head, 0, 0.035, 0.27); food.visible = false;   // sâu ngậm ngang mỏ
          const eyes = [-1, 1].map(s => mesh(new THREE.SphereGeometry(0.027, 6, 5), lam(0x0d0d0d), head, s * 0.105, 0.085, 0.09));
          const wingShape = (pts) => { const sh = new THREE.Shape(); pts.forEach(([x, z], i) => i ? sh.lineTo(x, z) : sh.moveTo(x, z)); const g = new THREE.ShapeGeometry(sh); g.rotateX(Math.PI / 2); return g; };
          const armG = wingGrid([[0, 0.075], [0.09, 0.08], [0.18, 0.075], [0.26, 0.07]], [[0, -0.19], [0.09, -0.215], [0.18, -0.225], [0.26, -0.22]], 0.035);   // cánh tay: vai → cổ tay 0,26, dây cung 0,29 (lông thứ cấp)
          const handG = wingGrid([[0, 0.07], [0.12, 0.045], [0.22, -0.01], [0.3, -0.075], [0.36, -0.13]], [[0, -0.22], [0.12, -0.215], [0.22, -0.195], [0.3, -0.165], [0.36, -0.135]], 0.025);   // bàn cánh: mép trước xuôi mạnh ra sau, đầu cánh nhọn (lông sơ cấp)
          const wingM = new THREE.MeshLambertMaterial({ color: 0x9c6c48, side: THREE.DoubleSide, flatShading: true }), handM = new THREE.MeshLambertMaterial({ color: DARK, side: THREE.DoubleSide, flatShading: true });
          // G 15/10 "fix the wing": cánh cũ gắn nhầm vai (scale.x = −s ⇒ 2 cánh cắm xuyên thân, bắt chéo chữ X khi bay; khi đậu chĩa ra TRƯỚC qua đầu).
          // Giờ: nhóm "bên" lật gương (scale.x = s), mọi góc khớp viết cho cánh PHẢI (sải +x, mép trước +z, mặt lưng +y) ⇒ 2 cánh luôn đối xứng.
          const wings = [-1, 1].map(s => {   // vai → cánh tay (nâu, vạch kem) → bàn cánh (lông sơ cấp nâu sẫm)
            const side = new THREE.Group(); side.scale.x = s; bodyP.add(side);
            const sh = new THREE.Group(); sh.position.set(0.12, 0.13, 0.1); side.add(sh);
            mesh(armG, wingM, sh); mesh(new THREE.BoxGeometry(0.21, 0.005, 0.026), lam(0xefe4c8), sh, 0.125, 0.037, -0.05);   // vạch kem trên lưng cánh tay
            const wr = new THREE.Group(); wr.position.x = 0.26; sh.add(wr); mesh(handG, handM, wr);
            return { sh, wr };
          });
          // cánh XẾP (theo dáng đậu của mẫu): sải chĩa ra SAU, hơi lên + vào trong (đầu cánh bắt chéo trên phao câu), mặt lưng quay ra ngoài–lên ôm sườn
          const qFold = (() => { const x = new THREE.Vector3(-0.07, 0.1, -1).normalize(), y = new THREE.Vector3(1, 0.55, 0); y.addScaledVector(x, -y.dot(x)).normalize(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, new THREE.Vector3().crossVectors(x, y))); })();
          const qOpen = new THREE.Quaternion(), _we = new THREE.Euler();
          const tail = new THREE.Group(); tail.position.set(0, 0.05, -0.24); bodyP.add(tail);
          mesh(wingShape([[-0.045, 0], [0.045, 0], [0.065, -0.36], [0.03, -0.41], [0, -0.38], [-0.03, -0.41], [-0.065, -0.36]]),   // đuôi dài hẹp, chẻ nhẹ (mẫu: đuôi ~40% chiều dài)
          new THREE.MeshLambertMaterial({ color: 0x6b4a36, side: THREE.DoubleSide }), tail);
          const legs = [-1, 1].map(s => {   // cẳng chân xám + 3 ngón trước 1 ngón sau (bám cành)
            const lg = new THREE.Group(); lg.position.set(s * 0.055, -0.14, 0.03); bodyP.add(lg);
            const parts = [new THREE.CylinderGeometry(0.011, 0.013, 0.12, 5).translate(0, -0.06, 0)];
            for (const a of [-0.45, 0, 0.45]) parts.push(new THREE.BoxGeometry(0.012, 0.01, 0.075).translate(0, -0.12, 0.035).rotateY(a * 0.6));
            parts.push(new THREE.BoxGeometry(0.012, 0.01, 0.05).translate(0, -0.12, -0.025));
            mesh(mergeGeometries(parts), lam(0x4a4a4a), lg); return lg;
          });
          // (G 16/10) GỘP LƯỢT VẼ cả 10 con thành 1 lô 'Chim sẻ' (core/draw-batch.js): lô gộp không bị cắt theo khung nhìn (frustumCulled = false), mỗi
          // mảnh vẫn là "xương" đọc ma trận của chính nó ⇒ bay khắp nơi vẫn đúng; ~280 lượt vẽ (15 mảnh × 10 con × 2 lượt) → vài lượt
          // ---- trạng thái + lò xo dáng ----
          const spr = x => ({ x, v: 0 }), damp = (S, tg, w, dt) => { const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = S.x - tg, tp = (S.v + w * c) * dt; S.v = (S.v - w * tp) * ex; S.x = tg + (c + tp) * ex; return S.x; };
          const P = { pitch: spr(-0.45), wing: spr(0), tailP: spr(0), tailS: spr(0), hy: spr(0), hp: spr(0), fluff: spr(1), tuck: spr(0), legs: spr(1), crouch: spr(0) };
          const B = { st: 'perch', at: null, T: 10, k: 0, hyT: 0, hpT: 0, hT: 0, flick: 3, preen: 0, flapPh: 0, A: new THREE.Vector3(), Bp: new THREE.Vector3(), c1: new THREE.Vector3(), c2: new THREE.Vector3(), dur: 1, yaw: 0, hop: null, peck: 0, nPeck: 0, scan: 0, carry: false };
          const tmp = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Vector3();
          const S = {
            root, state: B,
            land(w) { B.at = w; root.position.copy(w.p); B.yaw = w.yaw; B.st = w.kind === 'ground' ? 'forage' : w.sleep ? 'sleep' : 'perch'; B.k = 0; B.T = w.T ?? 8; B.scan = 0.4; },
            flyTo(w) {
              const air0 = B.at && B.at.kind === 'air';   // đang bay qua điểm trên không (đàn lượn): nối tiếp hướng bay, không cất cánh lại
              B.fromAir = air0; B.st = 'fly'; B.k = 0; B.to = w; B.A.copy(root.position); B.Bp.copy(w.p);
              const d = B.A.distanceTo(B.Bp), dir = tmp.subVectors(B.Bp, B.A).setY(0).normalize();
              // G 16/10: bay chậm 30% (4,2 → 2,94 m/s) · G 17/10: chậm thêm 30% (2,94 → 2,06 m/s; nhịp vỗ cánh giữ nguyên)
              B.dur = Math.max(1.86, d / 2.06 + 0.79);
              if (air0) B.c1.copy(B.A).addScaledVector(_q.subVectors(B.A, B.c2).normalize(), 0.33 * d); else B.c1.copy(B.A).addScaledVector(up, 0.3 + 0.1 * d).addScaledVector(dir, 0.25 * d);
              B.c2.copy(B.Bp).addScaledVector(up, (w.kind === 'air' ? 0.05 : 0.25) + 0.08 * d).addScaledVector(dir, -0.22 * d);
            },
            hopTo(w, dur = 0.35) { B.st = 'shuffle'; B.k = 0; B.to = w; B.A.copy(root.position); B.dur = dur; B.yaw = Math.atan2(w.p.x - B.A.x, w.p.z - B.A.z); },   // nhảy ngắn (que đậu ↔ trong hộp tổ)
            update(dt, t) {
              dt = Math.min(dt, 0.05); B.k += dt;
              let flap = 0, legsOut = 1, pitchT = -0.45, wingT = 0, tailST = 0, crouchT = 0, fluffT = 1, tuckT = 0;
              brain.tick(S, dt);
              // gió tại chỗ chim (0,5 s/lần, độ cao trên mặt đất)
              if ((B.windT = (B.windT ?? Math.random() * 0.5) - dt) <= 0) { B.windT = 0.5; const p = root.position; windAt(p.x, p.y, p.z, Math.max(0.3, p.y - cowY(p.x, p.z)), _spW); B.wx = _spW.x; B.wz = _spW.z; }
              // gió thật (m/s) tại chỗ chim: vector gió cảnh đã thu nhỏ cho hình ảnh ⇒ đổi theo tỉ lệ tốc độ thời tiết (sceneWind.ms) / hệ số cảnh (U)
              const wind = Math.hypot(B.wx || 0, B.wz || 0) * sceneWind.ms / Math.max(0.05, sceneWind.U);
              if (B.st === 'fly') {
                const u = Math.min(1, B.k / B.dur), s = u * u * (3 - 2 * u), v = (x, o) => { const q = 1 - x; return o.copy(B.A).multiplyScalar(q * q * q).addScaledVector(B.c1, 3 * q * q * x).addScaledVector(B.c2, 3 * q * x * x).addScaledVector(B.Bp, x * x * x); };
                v(s, _p); v(Math.min(1, s + 0.02), _q);
                // gió đẩy dạt giữa đường (2 đầu đúng chỗ cất/đáp) · gió mạnh > 9 m/s: vỗ liên tục, không xếp cánh lượn
                { const dr = 0.15 * Math.sin(Math.PI * u) * Math.min(1, B.dur / 2); _p.x += (B.wx || 0) * dr; _p.z += (B.wz || 0) * dr; _q.x += (B.wx || 0) * dr; _q.z += (B.wz || 0) * dr; }
                const ph = ((B.k + (S.ph || 0)) % 0.55) / 0.55, bounding = u > 0.18 && u < 0.78 && wind < 9, flapping = !bounding || ph < 0.55, air1 = B.to.kind === 'air';   // vỗ – xếp cánh: 0,3 s vỗ rồi 0,25 s gập cánh
                if (bounding) _p.y += 0.05 * Math.sin(ph * TAU - 0.6) * Math.min(1, (u - 0.18) / 0.1) * Math.min(1, (0.78 - u) / 0.1);
                root.position.copy(_p);
                const dx = _q.x - _p.x, dz = _q.z - _p.z, dh = Math.hypot(dx, dz);
                if (dh > 1e-4) B.yaw = Math.atan2(dx, dz);
                const flare = air1 ? 0 : Math.max(0, (u - 0.8) / 0.2);
                pitchT = Math.max(-0.5, Math.min(0.5, -Math.atan2(_q.y - _p.y, Math.max(1e-3, dh)) * 0.6)) - 0.75 * flare - (B.fromAir ? 0 : 0.3 * Math.max(0, 1 - u / 0.12));
                wingT = flapping ? 1 : 0.15; flap = flapping ? (u < 0.15 ? 16 : u > 0.8 ? 9 : 13) : 0;
                legsOut = u < 0.12 && !B.fromAir ? 1 - u / 0.12 : u > 0.82 && !air1 ? 1 : 0; tailST = Math.max(flare, u < 0.12 && !B.fromAir ? 0.6 : 0);
                if (u >= 1) { S.land(B.to); P.crouch.x = 0.6; brain.landed?.(S); }
              } else if (B.st === 'sally') {
                // đuổi chơi: lướt tới vật bay (2,4 m/s), lượn vờn quanh, mổ hụt, rồi bay về chỗ cũ
                const Z = B.sal, tp = Z.toy.at(); Z.k += dt;
                if (!tp || Z.k > Z.T + 1.5 || (Z.play && Z.k - Z.play > Z.T)) S.flyTo(Z.home);
                else {
                  if (!Z.play && Z.k > 0.2 && tp.distanceTo(root.position) < 0.3) Z.play = Z.k;
                  const a = Z.o + Z.k * 5, goal = _q.copy(tp).add(tmp.set(Math.cos(a) * 0.18, -0.04 + 0.05 * Math.sin(Z.k * 7), Math.sin(a) * 0.18)), d = goal.distanceTo(root.position);
                  root.position.lerp(goal, Math.min(1, (Z.play ? 6 : 2.4 / Math.max(d, 0.05)) * dt));
                  const gy = cowY(root.position.x, root.position.z) + 0.12; if (root.position.y < gy) root.position.y = gy;
                  B.yaw = Math.atan2(tp.x - root.position.x, tp.z - root.position.z); pitchT = -0.35; wingT = 1; flap = 18; legsOut = 0.35; tailST = 0.7;
                  B.hyT = 0; B.hpT = Math.sin(Z.k * 9) > 0.85 ? 0.9 : 0.1;
                }
              } else if (B.st === 'shuffle') {
                const u = Math.min(1, B.k / B.dur); root.position.lerpVectors(B.A, B.to.p, u); root.position.y += Math.sin(Math.PI * u) * 0.04; crouchT = 0.2;
                if (u >= 1) { S.land(B.to); brain.landed?.(S); }
              } else if (B.st === 'perch' || B.st === 'sleep') {
                if (B.st === 'sleep') {
                  // trú mưa ban ngày: xù lông, thu cổ nhưng còn thức, liếc quanh, thỉnh thoảng rũ nước; đêm: ngủ rúc mỏ
                  const h = liveWeather.localHour, wetDay = liveWeather.state.raining && h >= 5.75 && h < 19;
                  fluffT = wetDay ? 1.15 : 1.18; tuckT = wetDay ? 0.25 : 1; pitchT = -0.2; legsOut = 0.3;
                  if (wetDay) { if ((B.shakeT = (B.shakeT ?? 3) - dt) <= 0) { B.shakeT = 5 + Math.random() * 8; B.shk = 0.45; } if ((B.hT -= dt) <= 0) { B.hT = 1 + Math.random() * 2.5; B.hyT = (Math.random() - 0.5) * 1.4; B.hpT = -0.1; } }
                }
                else {   // ngoái đầu giật cục · vẫy đuôi · thỉnh thoảng rỉa lông
                  if ((B.hT -= dt) <= 0) { B.hT = 0.3 + Math.random() * 1.2; B.hyT = (Math.random() - 0.5) * 2.4; B.hpT = (Math.random() - 0.5) * 0.6; }
                  if ((B.flick -= dt) <= 0) { B.flick = 2 + Math.random() * 4; P.tailP.v -= 9; }
                  if ((B.preen -= dt) <= 0 && Math.random() < dt * 0.05) B.preen = 1.6;
                  if (B.preen > 0) { B.preen -= dt; B.hyT = 2.2 * Math.sign(B.hyT || 1); B.hpT = 0.5; }
                  if (B.at && B.at.feed) { B.hyT = 0; B.hpT = 0.55 + 0.25 * Math.sin(t * 9); }   // trong tổ: cúi mớm mồi
                  if (B.k > B.T) brain.next(S);
                }
              } else if (B.st === 'forage') {   // nhảy 2 chân · mổ 1–3 cú · ngẩng canh chừng
                pitchT = -0.15; const g = cowY(root.position.x, root.position.z);
                // mưa tạnh, đất còn ướt: tắm vũng nước (cúi ngực, rung cánh xoè nhanh, đuôi xoè, nhúng đầu), cuối cùng rũ mình
                if (!B.bath && !liveWeather.state.raining && sceneWet > 0.3 && (B.bathCd = (B.bathCd ?? 4) - dt) <= 0 && Math.random() < dt * 0.1) { B.bath = 3 + Math.random() * 1.5; B.bathCd = 25 + Math.random() * 30; B.hop = null; B.nPeck = 0; }
                if (B.bath > 0) {
                  B.bath -= dt; crouchT = 0.75; pitchT = 0.35; wingT = 0.35; flap = 22; tailST = 0.5; B.hyT = 0; B.hpT = 0.8 + 0.3 * Math.sin(t * 18);
                  if (B.bath <= 0) { B.bath = 0; B.shk = 0.5; B.scan = 0.6; }
                } else if (B.hop) {
                  B.hop.k += dt; const q = Math.max(0, Math.min(1, B.hop.k / 0.15));
                  root.position.lerpVectors(B.hop.a, B.hop.b, q); root.position.y = B.hop.a.y + (B.hop.b.y - B.hop.a.y) * q + Math.sin(Math.PI * q) * 0.045;
                  legsOut = 1 - 0.5 * Math.sin(Math.PI * q);
                  if (q >= 1) { B.hop.n--; P.crouch.x = 0.35; if (B.hop.n > 0) { B.hop.a.copy(root.position); B.hop.b.copy(B.hop.a).add(tmp.set(Math.sin(B.yaw), 0, Math.cos(B.yaw)).multiplyScalar(0.07 + Math.random() * 0.06)); B.hop.b.y = cowY(B.hop.b.x, B.hop.b.z); B.hop.k = -0.06; } else { B.hop = null; B.nPeck = 1 + (Math.random() * 3 | 0); B.peck = 0; } }
                } else if (B.nPeck > 0) {   // mổ: đầu chúc nhanh rồi ngóc
                  B.peck += dt; const q = (B.peck % 0.28) / 0.28; B.hpT = q < 0.3 ? 1.25 : 0.5; B.hyT = 0; pitchT = 0.15; crouchT = 0.25;
                  if (B.peck > 0.28 * B.nPeck) { B.nPeck = 0; B.scan = 0.4 + Math.random() * 1.0; }
                } else if (B.scan > 0) {   // ngẩng đầu canh chừng, liếc 2 bên
                  B.scan -= dt; if ((B.hT -= dt) <= 0) { B.hT = 0.25 + Math.random() * 0.4; B.hyT = (Math.random() - 0.5) * 2; B.hpT = -0.2; }
                } else {
                  B.yaw += (Math.random() - 0.5) * 1.6; const n = 1 + (Math.random() * 3 | 0), a = root.position.clone(), b = a.clone().add(tmp.set(Math.sin(B.yaw), 0, Math.cos(B.yaw)).multiplyScalar(0.08 + Math.random() * 0.06));
                  if (!envFree(b.x, b.z) || cowHutRect && b.x > cowHutRect.x0 && b.x < cowHutRect.x1 && b.z > cowHutRect.z0 && b.z < cowHutRect.z1) B.yaw += Math.PI;   // nước / vật cản / chuồng: quay lại else { b.y = cowY(b.x, b.z); B.hop = { a, b, k: -0.07, n }; }
                }
                if (!B.hop) root.position.y = g;
                const fl = B.bath ? null : sparrowFlush(root.position), near = fl === 'fly';
                if (fl === 'hop' && !B.hop) {
                  // bò bước sát: 2 cú nhảy tránh ra
                  const f = sparrowFlush.from; B.yaw = Math.atan2(root.position.x - f.x, root.position.z - f.z); B.nPeck = 0;
                  const a = root.position.clone(), b2 = a.clone().add(tmp.set(Math.sin(B.yaw), 0, Math.cos(B.yaw)).multiplyScalar(0.14)); b2.y = cowY(b2.x, b2.z); if (envFree(b2.x, b2.z)) B.hop = { a, b: b2, k: 0, n: 2 };
                }
                if (near || B.k > B.T) brain.next(S, near);
              }
              // ---- ĐUỔI CHƠI vật bay lượn: lá / cánh hoa đang rơi, bướm lướt qua trong 4 m → ngoái nhìn theo; ~0,45 lần/s khi còn trong 3 m thì bay ra vờn ----
              if ((B.st === 'perch' || B.st === 'forage') && !B.carry && !B.bath && !(B.at && (B.at.kind === 'nest' || B.at.kind === 'peg' || B.at.kind === 'perchOut'))) {
                if ((B.toyT = (B.toyT ?? Math.random() * 0.3) - dt) <= 0) { B.toyT = 0.3; B.toy = sparrowToy(root.position, 4); }
                const tp = B.toy && B.toy.at();
                if (tp) {
                  const dx = tp.x - root.position.x, dz = tp.z - root.position.z, dh = Math.hypot(dx, dz); let ry = Math.atan2(dx, dz) - root.rotation.y; ry = Math.atan2(Math.sin(ry), Math.cos(ry));
                  B.hyT = Math.max(-2.2, Math.min(2.2, ry)); B.hpT = Math.max(-0.7, Math.min(1, -Math.atan2(tp.y - root.position.y - 0.05, dh)));
                  if (dh < 3 && Math.random() < dt * 0.45) { B.sal = { toy: B.toy, home: B.at, k: 0, T: 0.8 + Math.random() * 0.7, o: Math.random() * TAU, play: 0 }; B.st = 'sally'; B.k = 0; B.toy = null; }
                }
              }
              // ---- ĐÓN GIÓ: đậu / kiếm ăn / ngủ thì quay mặt vào gió (lông áp, cất cánh ngược gió); trên dây chọn 1 trong 2 hướng vuông dây gần gió nhất;
              //      (thanh treo đèn cũng vậy); gió mạnh thu mình thấp, áp lông ----
              if (wind > 2.5 && (B.st === 'perch' || B.st === 'sleep' || B.st === 'forage') && B.at && !B.at.local) {
                // quay đón gió từ ~2,5 m/s (hẳn từ 7 m/s); thu mình, áp lông từ 6 m/s
                const k = Math.min(1, (wind - 2.5) / 4.5), kc = Math.min(1, Math.max(0, (wind - 6) / 6)), wy = Math.atan2(-B.wx, -B.wz);
                if (B.at.kind === 'wire' || B.at.kind === 'home') { const a = B.at.yaw; B.yaw = Math.abs(Math.atan2(Math.sin(wy - a), Math.cos(wy - a))) < Math.PI / 2 ? a : a + Math.PI; }
                else if (!B.hop) { let d = wy - B.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); B.yaw += d * Math.min(1, dt * (0.4 + 2 * k)); }
                crouchT = Math.max(crouchT, 0.35 * kc); fluffT = Math.min(fluffT, 1 - 0.07 * kc);
              }
              B.carry = B.carry && B.st !== 'sleep'; food.visible = B.carry;
              // ---- dáng (lò xo) ----
              damp(P.pitch, pitchT, 10, dt); damp(P.wing, wingT, 18, dt); damp(P.tailS, tailST, 10, dt); damp(P.fluff, fluffT, 2, dt); damp(P.tuck, tuckT, 1.5, dt); damp(P.legs, legsOut, 12, dt); damp(P.crouch, crouchT, 14, dt);
              damp(P.tailP, 0, 22, dt); damp(P.hy, B.st === 'fly' ? 0 : B.hyT, 30, dt); damp(P.hp, B.st === 'fly' ? 0 : B.hpT, 26, dt);
              let dy = B.yaw - root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); root.rotation.y += dy * Math.min(1, dt * (B.st === 'fly' ? 10 : 14));
              // rũ nước: lắc thân + đầu nhanh ~0,5 s
              const shk = B.shk > 0 ? (B.shk -= dt, Math.sin(B.shk * 70) * Math.min(1, B.shk / 0.12)) : 0;
              bodyP.rotation.x = P.pitch.x; bodyP.rotation.z = 0.28 * shk; bodyP.position.y = 0.26 - 0.06 * P.crouch.x + 0.018 * Math.sin(B.flapPh) * P.wing.x; bodyP.scale.setScalar(P.fluff.x);   // thân nhấp nhô theo nhịp vỗ (mẫu)
              const tk = P.tuck.x;   // ngủ: ngoái đầu ra sau, rúc mỏ vào lông vai, nhắm mắt
              head.rotation.set(-P.pitch.x * 0.7 + P.hp.x * (1 - tk) + 0.35 * tk, P.hy.x * (1 - tk) + 2.7 * tk + 0.6 * shk, 0.25 * Math.sin(t * 0.7) * (1 - tk) * (B.st === 'perch' ? 1 : 0));
              head.position.set(0, 0.13 - 0.05 * tk, 0.25 - 0.12 * tk); for (const e of eyes) e.visible = tk < 0.5;
              if (flap > 0) B.flapPh += dt * flap * TAU;
              // vỗ theo mẫu "Flying Bird" (G 18/10): đỉnh +52° → đáy −30° (mẫu +49° / −27°; trước: +79° / −59°), cánh xuôi sau 17° ở đỉnh → 26° ở đáy;
              //  pha vỗ lên bàn cánh gập nhẹ ra sau, bàn cánh trễ pha sau cánh tay (mặt cánh uốn sóng như mẫu)
              const w = P.wing.x, ph = B.flapPh, up = Math.max(0, -Math.sin(ph)), dn = 0.5 - 0.5 * Math.cos(ph);
              qOpen.setFromEuler(_we.set(0, 0.3 + 0.16 * dn, 0.195 + 0.715 * Math.cos(ph), 'ZYX'));
              for (const W of wings) {   // xếp ⇄ xoè: nội suy cầu giữa 2 hướng vai (không đi qua thân)
                W.sh.quaternion.slerpQuaternions(qFold, qOpen, w); W.sh.scale.z = 0.62 + 0.38 * w;   // gập: lông chồng lên nhau ⇒ cánh hẹp lại (cánh rộng kiểu mẫu chỉ xoè khi bay)
                W.wr.rotation.set(0, 0.12 + (0.45 * up - 0.12) * w, -0.22 + (0.26 * Math.sin(ph) + 0.22) * w);
              }
              tail.rotation.set(-0.15 + P.tailP.x * 0.06 - 0.25 * P.tailS.x, 0, 0); tail.scale.x = 1 + 0.8 * P.tailS.x;
              for (const L of legs) { L.rotation.x = (1 - P.legs.x) * 1.2 - P.pitch.x * P.legs.x; L.scale.setScalar(0.35 + 0.65 * P.legs.x); }
            }
          };
          return S;
        }
        const sparrowAwake = () => { const h = liveWeather.localHour; return h >= 5.75 && h < 19 && !liveWeather.state.raining; };
        // ---- con ở trại: vòng thanh treo đèn → cỏ → cây táo → nóc xe → dây điện; đêm ngủ trên chạc cây táo ----
        const songbird = (() => {
          const LG = lanternObj.g, LY = LG.rotation.y, tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
          const tree = appleTrees[1] || appleTrees[0], treeS = tree.userData.appleR / (0.12 * 0.8);
          const W = {
            home: () => ({ p: LG.localToWorld(new THREE.Vector3(0, 2.525, 0.12 + Math.random() * 0.32)), yaw: LY + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2, kind: 'home', T: 12 + Math.random() * 18 }),
            apple: () => { tree.updateMatrixWorld(true); const A = tree.userData.apples, a = A[(Math.random() * A.length) | 0]; return { p: tree.localToWorld(a.home.clone().add(tmp.set(0, 0.28 * treeS + 0.02, 0))), yaw: Math.random() * TAU, kind: 'apple', T: 6 + Math.random() * 10 }; },
            // chạc cành thật sát thân, giữa tán (lá che mưa) — 3 chỗ kín nhất, chọn ngẫu nhiên
            roost: () => { if (!W._perch) { tree.updateMatrixWorld(true); W._perch = pickPerches(branchPerches(tree.userData.limbs, v => tree.localToWorld(v), tree.scale.x, { rMin: 0.012, rMax: 0.07, y0: 0.4, y1: 0.85 }), 3, 0.25); }
              const c = W._perch[(Math.random() * W._perch.length) | 0]; return { p: c.p.clone(), yaw: c.yaw + (Math.random() < 0.5 ? 0 : Math.PI), kind: 'roost', sleep: true }; },
            roof: () => ({ p: caravanObj.localToWorld(new THREE.Vector3(1.9 + Math.random() * 0.25, 2.965, -0.15 + Math.random() * 0.25)), yaw: caravanObj.rotation.y + Math.PI + (Math.random() - 0.5), kind: 'roof', T: 6 + Math.random() * 10 }),
            wire: () => {   // dây pha giữa nhịp cột 1 → cổng néo trạm (Bézier bậc 2 võng 0,3 như world/substation-bess.js)
              const a = gridPoles[0], b = subTie.e, t = 0.35 + Math.random() * 0.3, m = a.clone().lerp(b, 0.5); m.y -= 0.3;
              const p = a.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(m, 2 * t * (1 - t)).addScaledVector(b, t * t);
              return { p, yaw: Math.atan2(b.x - a.x, b.z - a.z) + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2, kind: 'wire', T: 8 + Math.random() * 10 };
            },
            ground: () => {
              const c = LG.getWorldPosition(tmp2);
              for (let k = 0; k < 20; k++) {
                const a = Math.random() * TAU, r = 1.4 + Math.random() * 2.6, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
                if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || !envFree(x, z) || obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3) || ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.25)) continue;
                return { p: new THREE.Vector3(x, cowY(x, z), z), yaw: Math.random() * TAU, kind: 'ground', T: 12 + Math.random() * 12 };
              }
              return W.home();
            }
          };
          const ROUTE = ['home', 'ground', 'apple', 'roof', 'wire'];
          const bird = makeSparrow({
            // mưa lại lúc đang đậu ở chỗ trú: chuyển về tư thế trú (xù lông, rũ nước) chứ không đứng đậu thường
            tick(S, dt) { const B = S.state; if (!sparrowAwake() && B.st !== 'fly' && B.at && B.at.kind !== 'roost') S.flyTo(W.roost()); else if (!sparrowAwake() && B.st === 'perch' && B.at && B.at.kind === 'roost') B.st = 'sleep'; else if (sparrowAwake() && B.st === 'sleep') { B.st = 'perch'; B.T = 4 + Math.random() * 4; B.k = 0; } },
            next(S) { const B = S.state; if (!sparrowAwake()) return; const kind = B.at.kind === 'roost' ? 'home' : ROUTE[(ROUTE.indexOf(B.at.kind) + 1) % ROUTE.length]; S.flyTo(W[kind === 'ground' && Math.random() < 0.4 ? 'apple' : kind]()); }   // "thỉnh thoảng" mới xuống cỏ
          });
          bird.land(sparrowAwake() ? W.home() : W.roost());
          return bird;
        })();
        // ---- 2 HỘP TỔ chim sẻ, mỗi hộp 1 cặp (G 15/10): ① bắt vào vách tây chuồng bò, dưới phần mái chìa (≈ toạ độ góc (50,7; 47,6)) · ② TREO dưới cành
        //      ngang cây táo gần lều (cành G khoanh ảnh — khớp 7 quả táo ⇒ cây appleTrees[1], nhìn hướng θ 72°, cành Ø 5 cm cao 4,5 m).
        //      Hộp dựng theo mẫu "Bird the nest Home Building" (adventurer, CC-BY-4.0 — chỉ đo): ván thông vân gỗ, mặt trước khoét lỗ tròn + que đậu,
        //      mái tôn 2 mái chữ Λ; vách 50% trong suốt (thấy chim trong tổ), nét viền đen hiện rõ. Hộp treo: dây thép từ khoen nóc mái lên móc vắt
        //      qua cành, đung đưa như con lắc theo gió (+ cú hích khi chim đáp que đậu). Hộp bắt vách: tấm ván lót sau lưng vít vào thanh giằng vách ----
        function makeNestBox(hang) {
          const g = new THREE.Group(); g.name = 'Hộp tổ chim sẻ (Nest box)';
          const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
          c.fillStyle = '#c8894b'; c.fillRect(0, 0, 128, 128);
          for (let k = 0; k < 60; k++) { const x = Math.random() * 128; c.strokeStyle = `rgba(${Math.random() < 0.5 ? '120,70,30' : '230,180,120'},${0.25 + Math.random() * 0.3})`; c.lineWidth = 0.6 + Math.random() * 1.4; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 6, 40, x - 6, 90, x + (Math.random() - 0.5) * 8, 128); c.stroke(); }   // vân gỗ dọc ván
          const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
          const wood = new THREE.MeshLambertMaterial({ map: tx, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
          const tin = new THREE.MeshLambertMaterial({ color: 0x9aa1a5, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
          const Wd = 0.26, Dp = 0.26, Hh = 0.32, th = 0.02, DROP = 0.62;   // DROP: tâm cành → đáy hộp (hộp treo)
          const pnl = (w, h, d, x, y, z, m = wood) => { const o = bx(w, h, d, m, false, true, lineDark); o.position.set(x, y, z); g.add(o); return o; };
          pnl(Wd + 2 * th, th, Dp, 0, th / 2, 0);   // đáy
          pnl(th, Hh, Dp, Wd / 2 + th / 2, Hh / 2, 0);   // vách sau
          for (const s of [-1, 1]) pnl(Wd, Hh, th, 0, Hh / 2, s * (Dp / 2 - th / 2));   // 2 vách bên
          {   // mặt trước có lỗ tròn Ø 7 cm ở 2/3 chiều cao, đỉnh hồi nhọn
            const sh = new THREE.Shape(); sh.moveTo(-Dp / 2, 0); sh.lineTo(Dp / 2, 0); sh.lineTo(Dp / 2, Hh + 0.04); sh.lineTo(0, Hh + 0.09); sh.lineTo(-Dp / 2, Hh + 0.04); sh.closePath();
            const hole = new THREE.Path(); hole.absarc(0, Hh * 0.68, 0.036, 0, TAU, true); sh.holes.push(hole);
            const fg = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 16 }); fg.rotateY(-Math.PI / 2); fg.translate(-Wd / 2, 0, 0);
            const f = new THREE.Mesh(fg, wood); edge(f, fg, lineDark); g.add(f);
          }
          for (const s of [-1, 1]) { const r = pnl(Wd + 0.1, 0.012, Dp / 2 + 0.07, 0, Hh + 0.07, s * (Dp / 4 + 0.02), tin); r.rotation.x = s * 0.36; }   // mái tôn 2 mái chữ Λ (mép ngoài thấp, nóc giữa cao) — bản cũ lật dấu thành chữ V
          const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), new THREE.MeshLambertMaterial({ color: 0x7a5232 })); peg.rotation.z = Math.PI / 2; peg.position.set(-Wd / 2 - 0.04, Hh * 0.68 - 0.06, 0); g.add(peg);   // que đậu dưới lỗ
          const chicks = [-1, 1].map(s => {   // chim non: 2 cục lông xám, mỏ vàng há ra đòi ăn khi bố mẹ vào tổ
            const c0 = new THREE.Group(); c0.position.set(0.065, th, s * 0.05); g.add(c0);
            const b0 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), new THREE.MeshLambertMaterial({ color: 0x8f877d })); b0.position.y = 0.035; c0.add(b0);
            const hd = new THREE.Group(); hd.position.set(-0.02, 0.07, 0); c0.add(hd);
            hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), new THREE.MeshLambertMaterial({ color: 0x9a9188 })));
            const bk = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 6), new THREE.MeshLambertMaterial({ color: 0xf2c94a })); bk.rotation.z = Math.PI / 2; bk.position.x = -0.03; hd.add(bk);
            return { hd, bk };
          });
          const piv = new THREE.Group(); scene.add(piv); let YAW = 0;
          if (hang) {   // điểm treo: cành ngang G khoanh — toạ độ cục bộ cây (−0,548; 5,038; 1,628), hướng cành theo đoạn (−0,52; 5,04; 1,59) → (−0,64; 5,02; 1,77)
            const steel = new THREE.MeshLambertMaterial({ color: 0x6d7175 });
            const eye = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.003, 4, 10), steel); eye.position.y = Hh + 0.135; g.add(eye);   // khoen nóc mái
            const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, DROP - 0.04 - (Hh + 0.145), 4), steel); wire.position.y = (DROP - 0.04 + Hh + 0.145) / 2; g.add(wire);
            const tree = appleTrees[1] || appleTrees[0]; tree.updateMatrixWorld(true); piv.name = 'Móc treo hộp tổ'; tree.localToWorld(piv.position.set(-0.548, 5.038, 1.628));
            const bDir = tree.localToWorld(new THREE.Vector3(-0.64, 5.02, 1.77)).sub(tree.localToWorld(new THREE.Vector3(-0.52, 5.04, 1.59))).normalize();
            const hook = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0035, 4, 14, 4.4), steel); hook.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), bDir); hook.rotateZ(-0.6); piv.add(hook);
            YAW = 1.885; g.position.y = -DROP;   // lỗ tổ quay về hướng G nhìn
          } else {   // bắt vách tây chuồng bò: lưng hộp tựa thanh giằng vách (x = −W/2 − 0,13), lỗ quay sang tây, đáy cao 1,85 m, lùi 0,55 m khỏi góc sau
            pnl(0.02, Hh + 0.26, 0.12, Wd / 2 + th + 0.012, Hh / 2 + 0.06, 0, new THREE.MeshLambertMaterial({ color: 0x6e5236 }));   // ván lót lưng vít vào giằng vách
            piv.name = 'Hộp tổ vách chuồng bò'; piv.position.set(cowHut.x - cowHut.W / 2 - 0.13 - 0.035 - Wd / 2 - th, cowHut.y + 1.85, cowHut.z - cowHut.D / 2 + 0.55);
          }
          g.rotation.y = YAW; piv.add(g);
          piv.traverse(o => { if (o.isMesh || o.isLineSegments) o.userData.noBatch = true; });
          const sw = { x: 0, z: 0, vx: 0, vz: 0 }, _w = new THREE.Vector3(), base = piv.position.clone();
          const fy = a => Math.atan2(Math.cos(YAW) * a, -Math.sin(YAW) * a);   // hướng chim nhìn theo trục x cục bộ hộp (±1)
          const W = (lp, yaw, kind, o) => { piv.updateMatrixWorld(true); return { p: g.localToWorld(lp.clone()), local: lp, yaw, kind, ...o }; };
          return {
            g, piv, chicks, pos: base,
            peg: () => W(new THREE.Vector3(-Wd / 2 - 0.055, Hh * 0.68 - 0.055, 0), fy(1), 'peg', { T: 0.6 + Math.random() * 0.6 }),
            inside: (i, sleep) => W(new THREE.Vector3(-0.045, th, (i ? 1 : -1) * 0.06), fy(-1), 'nest', { feed: !sleep, sleep, T: 3 + Math.random() * 3 }),
            kick(v) { if (!hang) return; const a = Math.random() * TAU; sw.vx += v * Math.cos(a); sw.vz += v * Math.sin(a); },
            update(dt) {   // hộp treo: con lắc 2 trục — dây + hộp ≈ 0,8 m tới trọng tâm (ω₀ ≈ 3,5 rad/s), tắt dần ζ 0,08; gió đẩy theo |u|·u
              if (!hang) return;
              windAt(base.x, base.y, base.z, 4.5, _w);
              const w0 = 3.5, k = 0.03, ex = k * Math.abs(_w.x) * _w.x, ez = k * Math.abs(_w.z) * _w.z;
              for (let h = Math.min(dt, 0.05), n = Math.ceil(h / 0.0167), s = h / n, i = 0; i < n; i++) {
                sw.vx += (-w0 * w0 * (sw.x - ex) - 2 * 0.08 * w0 * sw.vx) * s; sw.x += sw.vx * s;
                sw.vz += (-w0 * w0 * (sw.z - ez) - 2 * 0.08 * w0 * sw.vz) * s; sw.z += sw.vz * s;
              }
              piv.rotation.set(-sw.z, 0, sw.x);
            }
          };
        }
        const nestBoxes = [makeNestBox(false), makeNestBox(true)];
        // ---- mỗi hộp 1 cặp chim: kiếm mồi quanh bãi bò ⇄ bay về hộp mớm cho chim non; tối vào hộp ngủ ----
        const nestPairs = nestBoxes.map(box => [0, 1].map(i => {
          const bird = makeSparrow({
            tick(S) {
              const B = S.state; if (B.st === 'fly' || B.st === 'shuffle') return;
              if (!sparrowAwake()) { if (!B.at || B.at.kind === 'ground' || B.at.kind === 'perchOut') S.flyTo(box.peg()); else if (B.at.kind === 'peg') S.hopTo(box.inside(i, true)); else if (B.at.kind === 'nest' && !B.at.sleep) S.land(box.inside(i, true)); }
              else if (B.st === 'sleep') { B.st = 'perch'; B.at = box.inside(i, false); B.T = 2 + Math.random() * 6; B.k = 0; }
            },
            landed(S) { if (S.state.at.kind === 'peg') box.kick(0.12); },   // chim đáp que đậu: hộp treo lắc nhẹ
            next(S, flushed) {
              const B = S.state; if (!sparrowAwake()) return;
              if (B.at.kind === 'ground') { if (!flushed || Math.random() < 0.5) B.carry = !flushed; S.flyTo(box.peg()); }   // kiếm được mồi → ngậm về tổ
              else if (B.at.kind === 'peg') S.hopTo(box.inside(i, false));
              else if (B.at.kind === 'nest') { B.carry = false; S.hopTo({ ...box.peg(), kind: 'perchOut', T: 0.4 }); }
              else {   // từ que đậu bay ra bãi bò kiếm mồi (quanh 1 con bò, tránh chuồng và nước; cây táo cách bãi bò ~25–50 m — trong tầm kiếm ăn của chim sẻ)
                for (let k = 0; k < 20; k++) {
                  const cw = cows[(Math.random() * cows.length) | 0], a = Math.random() * TAU, r = 1.2 + Math.random() * 2.5, x = cw.x + Math.cos(a) * r, z = cw.z + Math.sin(a) * r;
                  if (!envFree(x, z) || (cowHutRect && x > cowHutRect.x0 && x < cowHutRect.x1 && z > cowHutRect.z0 && z < cowHutRect.z1) || Math.hypot(x - box.pos.x, z - box.pos.z) > 70) continue;
                  S.flyTo({ p: new THREE.Vector3(x, cowY(x, z), z), yaw: Math.random() * TAU, kind: 'ground', T: 6 + Math.random() * 10 }); return;
                }
                S.state.k = 0;
              }
            }
          });
          if (sparrowAwake()) bird.land(i ? box.peg() : box.inside(i, false)); else bird.land(box.inside(i, true));
          return bird;
        }));
        // ---- ĐÀN 5 CHIM SẺ NHỎ (G 15/10 "add 4-5 more small bird, cho chúng đi chơi và bay theo nhóm"): chim sẻ ngoài mùa làm tổ sống bầy, kiếm ăn dưới
        //      đất theo nhóm, con nào cũng thay nhau ngẩng canh chừng; 1 con hoảng (người / chó lại gần) là cả đàn vụt bay. Cả đàn 1 bộ điều khiển: cất cánh
        //      lệch nhau 0–0,55 s (con đầu bay, đàn bám theo), cùng 1 đường bay (mỗi con lệch ±0,35 m, lệch pha vỗ cánh; đàn tản ~2–3 m); ~1/2 số lần "đi chơi": lượn 1 vòng
        //      trên không (5–7 điểm quanh tâm, cao 3–6 m, nối tiếp tiếp tuyến) rồi mới đáp. Ngày: bãi cỏ (nhảy – mổ 20–40 s) ⇄ dây điện (đậu thành hàng
        //      cách ~0,22 m, 12–25 s); tối / mưa: ngủ trong tán cây rừng gần trại ----
        const flock = (() => {
          const F = { T: 3, night: null, stage: 0 }, rnd = Math.random, _v = new THREE.Vector3();
          const birds = [0, 1, 2, 3, 4].map(() => { const b = makeSparrow({ tick(S) { if (sparrowAwake() && S.state.st === 'sleep') { S.state.st = 'perch'; S.state.k = 0; } }, next(S, scared) { if (scared) F.T = Math.min(F.T, 0); },
            landed(S) { if (S.state.at.kind === 'air' && S.route.length) S.flyTo(S.route.shift()); } }, 0.8 + 0.12 * rnd()); b.ph = rnd(); b.route = []; b.go = null; return b; });
          const okGround = (x, z) => { const i = Math.round(x2gi(x)), j = Math.round(z2gj(z)); return i > 3 && j > 3 && i < GX - 3 && j < GZ - 3 && !isWater(i, j) && envFree(x, z) && !obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.5)
            && !(cowHutRect && x > cowHutRect.x0 - 1 && x < cowHutRect.x1 + 1 && z > cowHutRect.z0 - 1 && z < cowHutRect.z1 + 1) && !(engObj && Math.hypot(x - engObj.g.position.x, z - engObj.g.position.z) < 6); };
          const roostTree = treeCoords.reduce((a, t) => Math.hypot(t.x - pf.x, t.z - pf.z) < Math.hypot(a.x - pf.x, a.z - pf.z) ? t : a, treeCoords[0]);
          const spots = (kind) => {   // 5 chỗ đáp cho cả đàn
            // ~30% lần: quanh chân 1 con bò (hạt cỏ rơi, côn trùng bò làm bay lên)
            if (kind === 'ground') {
              const cw = rnd() < 0.3 && cows.length ? cows[(rnd() * cows.length) | 0] : null, c = cw ? _v.set(cw.x, 0, cw.z) : birds[0].root.position;
              for (let k = 0; k < 40; k++) { const a = rnd() * TAU, r = cw ? 1.5 + rnd() * 2 : 8 + rnd() * 30, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (!okGround(x, z)) continue;
                return birds.map((b, i) => { const aa = i * 1.26 + rnd() * 0.6, rr = 0.25 + 0.6 * rnd(), px = x + Math.cos(aa) * rr, pz = z + Math.sin(aa) * rr; return { p: new THREE.Vector3(px, cowY(px, pz), pz), yaw: rnd() * TAU, kind: 'ground', T: 1e9 }; }); }
              return spots('wire');
            }
            if (kind === 'wire') {   // dây pha giữa nhịp cột 1 → cổng néo trạm (như con chim ở trại), cả đàn đậu thành hàng
              const a = gridPoles[0], b = subTie.e, m = a.clone().lerp(b, 0.5); m.y -= 0.3; const L = a.distanceTo(b), t0 = 0.3 + 0.4 * rnd();
              return birds.map((_, i) => { const t = t0 + (i - 2) * (0.2 + 0.04 * rnd()) / L; return { p: a.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(m, 2 * t * (1 - t)).addScaledVector(b, t * t), yaw: Math.atan2(b.x - a.x, b.z - a.z) + Math.PI / 2 + (rnd() < 0.3 ? Math.PI : 0), kind: 'wire', T: 1e9 }; });
            }
            // ngủ / trú mưa trên cành thật của cây rừng gần trại (biến thể + góc xoay + cỡ của đúng cây đó): 5 chỗ kín, cách nhau ≥ 0,3 m
            if (!F.perch) { const T = roostTree, sN = (T.s || 2) * NATURE_SCALE, c = Math.cos(T.rot || 0), s = Math.sin(T.rot || 0);
              const toW = v => { const x = v.x * sN, y = v.y * sN * 0.875, z = v.z * sN; return v.set(T.x + x * c + z * s, T.y + y, T.z - x * s + z * c); };
              F.perch = T.V ? pickPerches(branchPerches(T.V.segs, toW, sN, { rMin: 0.012, rMax: 0.09, y0: 0.35, y1: 0.8 }), 5, 0.3) : null; }
            return birds.map((_, i) => { const P = F.perch && F.perch[i % F.perch.length]; return P ? { p: P.p.clone(), yaw: P.yaw + (rnd() < 0.5 ? 0 : Math.PI), kind: 'roost', sleep: true } : { p: new THREE.Vector3(roostTree.x, roostTree.y + 4, roostTree.z), yaw: rnd() * TAU, kind: 'roost', sleep: true }; });
          };
          function depart(kind, play) {   // xếp lộ trình từng con: (vòng lượn chung) → chỗ đáp riêng; lệch giờ cất cánh
            const S = spots(kind), loop = [];
            if (play) { const c = _v.copy(birds[0].root.position).lerp(S[2].p, 0.5), R = 5 + rnd() * 4, h = Math.max(c.y, S[2].p.y) + 3 + rnd() * 3, a0 = rnd() * TAU, n = 5 + ((rnd() * 3) | 0);
              for (let k = 0; k < n; k++) { const a = a0 + k / n * TAU * 1.1; loop.push([c.x + Math.cos(a) * R, h + Math.sin(k * 1.7) * 0.8, c.z + Math.sin(a) * R]); } }
            birds.forEach((b, i) => {
              const o = [(rnd() - 0.5) * 0.7, (rnd() - 0.5) * 0.6, (rnd() - 0.5) * 0.7];
              b.route = loop.map(q => ({ p: new THREE.Vector3(q[0] + o[0], q[1] + o[1], q[2] + o[2]), yaw: 0, kind: 'air' })).concat([S[i]]);
              b.go = i ? 0.05 + 0.1 * i + 0.1 * rnd() : 0;
            });
          }
          // mở trang: ngày thì đang kiếm ăn ở 1 bãi cỏ, đêm thì đã ngủ trong cây
          { const S = spots(sparrowAwake() ? 'ground' : 'roost'); birds.forEach((b, i) => b.land(S[i])); F.night = !sparrowAwake(); }
          return { birds, update(dt, t) {
            const awake = sparrowAwake(), busy = birds.some(b => b.go !== null || b.state.st === 'fly');
            if (!busy) {
              F.T -= dt;
              if (!awake && !F.night) { F.night = true; depart('roost', false); }
              else if (awake && (F.night || F.T <= 0)) {   // dậy / tới lúc đổi chỗ / bị hoảng: cả đàn đi
                F.night = false; const g = F.stage++ % 2 === 0; depart(g ? 'wire' : 'ground', rnd() < 0.5); F.T = g ? 12 + rnd() * 13 : 20 + rnd() * 20;
              }
            }
            for (const b of birds) { if (b.go !== null && (b.go -= dt) <= 0) { b.go = null; b.flyTo(b.route.shift()); } b.update(dt, t); }
          } };
        })();
        function updateSparrows(dt, t) {
          sparrowAnimTick(dt);
          for (const box of nestBoxes) { box.update(dt); box.piv.updateMatrixWorld(true); }
          songbird.update(dt, t); flock.update(dt, t);
          nestPairs.forEach((pair, n) => {
            const box = nestBoxes[n];
            for (const b of pair) {
              b.update(dt, t); const B = b.state;
              if (B.at && B.at.local && (B.st === 'perch' || B.st === 'sleep')) box.g.localToWorld(b.root.position.copy(B.at.local));   // đậu que / trong hộp: theo hộp đung đưa
            }
            const k = pair.some(b => b.state.at && b.state.at.kind === 'nest' && b.state.at.feed && b.state.st === 'perch') ? 1 : 0;
            box.chicks.forEach((c, i) => {   // chim non: bố mẹ vào tổ thì ngóc đầu, há mỏ, lắc; bình thường thu lu lim dim
              c.hd.position.y = 0.07 + 0.03 * k + 0.008 * k * Math.sin(t * 14 + i * 2 + n); c.hd.rotation.z = -0.5 * k + 0.12 * k * Math.sin(t * 11 + i + n);
              c.bk.scale.set(1, 1 + 0.6 * k, 1 + 0.6 * k);
            });
          });
        }
