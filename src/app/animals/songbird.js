        // ===== CHIM SẺ (G 14/10) — dựng bằng code theo tỉ lệ + màu đo từ mẫu "Bird 5 - Animated Low Poly" (WildPoly3D, Sketchfab, CC-BY-NC-4.0;
        //      chỉ đo: dài mỏ→đuôi 1 · sải cánh ~1,4 · lưng nâu, bụng kem, mỏ ô-liu sẫm, chân xám; nhịp bay mẫu 0,8 s, hạ cánh 0,57 s).
        //  Tập tính chim sẻ nhỏ: đậu thì ngoái đầu giật cục (đổi hướng nhìn 0,3–1,5 s/lần), vẫy đuôi, rỉa lông; dưới đất NHẢY 2 CHÂN, mổ nhanh
        //  1–3 cú rồi NGẨNG ĐẦU canh chừng (chim sẻ ngẩng nhiều lần, mỗi lần ngắn); bay "vỗ – xếp cánh" (vài nhịp vỗ nhanh rồi gập cánh rơi
        //  theo quán tính ⇒ đường bay nhấp nhô); cất cánh nhún rồi bật, hạ cánh xoè đuôi, ngửa thân, duỗi chân. Ngủ: xù lông, ngoái đầu rúc mỏ.
        //  · Con ở trại: thanh treo đèn lồng → (thỉnh thoảng) xuống cỏ kiếm ăn → cây táo → nóc xe → dây điện 110 kV → về; 19:00–05:45 / mưa
        //    ngủ trên chạc cây táo sát thân. · Cặp làm tổ ở HỘP TỔ TREO dưới cành cây táo (từ 15/10; dựng theo mẫu "Bird the nest Home Building",
        //    adventurer, CC-BY-4.0 — chỉ đo; vách trong 50%, nét viền hiện rõ): ngày kiếm mồi quanh bãi bò, ngậm sâu bay về, đậu que trước lỗ, chui vào
        //    mớm cho 2 chim non (non ngóc đầu há mỏ), chui ra bay đi; tối 2 con chui vào hộp ngủ. Người / chó lại gần lúc đang dưới đất thì bay sớm.
        function makeSparrow(brain) {
          const SC = 0.18, up = new THREE.Vector3(0, 1, 0);
          const vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), lam = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
          const BROWN = new THREE.Color(0xa8754f), CREAM = new THREE.Color(0xf1e6cc), DARK = 0x4a3328;
          const paint = (geo, f) => { const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const k = f(p.getX(i), p.getY(i), p.getZ(i)); c.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
          const root = new THREE.Group(); root.name = 'Chim sẻ'; root.scale.setScalar(SC); scene.add(root);
          const bodyP = new THREE.Group(); bodyP.position.y = 0.26; root.add(bodyP);   // gốc = điểm chân bám
          const mesh = (geo, m, par, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; par.add(o); return o; };
          const bodyG = new THREE.SphereGeometry(0.5, 10, 7); bodyG.scale(0.34, 0.36, 0.56);
          mesh(paint(bodyG, (x, y, z) => y > -0.04 + 0.05 * z ? BROWN : CREAM), vc, bodyP);
          const head = new THREE.Group(); head.position.set(0, 0.13, 0.25); bodyP.add(head);
          const headG = new THREE.SphereGeometry(0.5, 9, 7); headG.scale(0.29, 0.28, 0.31);
          mesh(paint(headG, (x, y, z) => y > 0.0 - 0.05 * z ? BROWN : CREAM), vc, head, 0, 0.06, 0.03);
          const beakG = new THREE.ConeGeometry(0.042, 0.11, 6); beakG.rotateX(Math.PI / 2); mesh(beakG, lam(0x4a4630), head, 0, 0.04, 0.22);
          const food = mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 5).rotateZ(Math.PI / 2), lam(0x7d9a3a), head, 0, 0.035, 0.27); food.visible = false;   // sâu ngậm ngang mỏ
          const eyes = [-1, 1].map(s => mesh(new THREE.SphereGeometry(0.03, 6, 5), lam(0x0d0d0d), head, s * 0.12, 0.09, 0.1));
          const wingShape = (pts) => { const sh = new THREE.Shape(); pts.forEach(([x, z], i) => i ? sh.lineTo(x, z) : sh.moveTo(x, z)); const g = new THREE.ShapeGeometry(sh); g.rotateX(Math.PI / 2); return g; };
          const armG = wingShape([[0, 0.07], [0.2, 0.06], [0.21, -0.14], [0.11, -0.17], [0, -0.15]]);   // cánh tay: vai → cổ tay 0,2
          const handG = wingShape([[0, 0.06], [0.13, 0.045], [0.3, -0.005], [0.27, -0.055], [0.22, -0.075], [0.2, -0.1], [0.14, -0.12], [0.12, -0.14], [0, -0.14]]);   // bàn cánh: lông sơ cấp nhọn, mép sau so le
          const wingM = new THREE.MeshLambertMaterial({ color: 0x9c6c48, side: THREE.DoubleSide, flatShading: true }), handM = new THREE.MeshLambertMaterial({ color: DARK, side: THREE.DoubleSide, flatShading: true });
          // G 15/10 "fix the wing": cánh cũ gắn nhầm vai (scale.x = −s ⇒ 2 cánh cắm xuyên thân, bắt chéo chữ X khi bay; khi đậu chĩa ra TRƯỚC qua đầu).
          // Giờ: nhóm "bên" lật gương (scale.x = s), mọi góc khớp viết cho cánh PHẢI (sải +x, mép trước +z, mặt lưng +y) ⇒ 2 cánh luôn đối xứng.
          const wings = [-1, 1].map(s => {   // vai → cánh tay (nâu, vạch kem) → bàn cánh (lông sơ cấp nâu sẫm)
            const side = new THREE.Group(); side.scale.x = s; bodyP.add(side);
            const sh = new THREE.Group(); sh.position.set(0.13, 0.1, 0.1); side.add(sh);
            mesh(armG, wingM, sh); mesh(new THREE.BoxGeometry(0.17, 0.004, 0.024), lam(0xefe4c8), sh, 0.1, 0.005, -0.03);
            const wr = new THREE.Group(); wr.position.x = 0.2; sh.add(wr); mesh(handG, handM, wr);
            return { sh, wr };
          });
          // cánh XẾP (theo dáng đậu của mẫu): sải chĩa ra SAU, hơi lên + vào trong (đầu cánh bắt chéo trên phao câu), mặt lưng quay ra ngoài–lên ôm sườn
          const qFold = (() => { const x = new THREE.Vector3(-0.07, 0.1, -1).normalize(), y = new THREE.Vector3(1, 0.55, 0); y.addScaledVector(x, -y.dot(x)).normalize(); return new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, new THREE.Vector3().crossVectors(x, y))); })();
          const qOpen = new THREE.Quaternion(), _we = new THREE.Euler();
          const tail = new THREE.Group(); tail.position.set(0, 0.02, -0.26); bodyP.add(tail);
          mesh(wingShape([[-0.045, 0], [0.045, 0], [0.075, -0.3], [0, -0.33], [-0.075, -0.3]]), new THREE.MeshLambertMaterial({ color: 0x6b4a36, side: THREE.DoubleSide }), tail);
          const legs = [-1, 1].map(s => {   // cẳng chân xám + 3 ngón trước 1 ngón sau (bám cành)
            const lg = new THREE.Group(); lg.position.set(s * 0.055, -0.14, 0.03); bodyP.add(lg);
            const parts = [new THREE.CylinderGeometry(0.011, 0.013, 0.12, 5).translate(0, -0.06, 0)];
            for (const a of [-0.45, 0, 0.45]) parts.push(new THREE.BoxGeometry(0.012, 0.01, 0.075).translate(0, -0.12, 0.035).rotateY(a * 0.6));
            parts.push(new THREE.BoxGeometry(0.012, 0.01, 0.05).translate(0, -0.12, -0.025));
            mesh(mergeGeometries(parts), lam(0x4a4a4a), lg); return lg;
          });
          root.traverse(o => { if (o.isMesh) o.userData.noBatch = true; });   // bay khắp nơi ⇒ không gộp lượt vẽ (lô bị loại theo khung nhìn ở chỗ cũ)
          // ---- trạng thái + lò xo dáng ----
          const spr = x => ({ x, v: 0 }), damp = (S, tg, w, dt) => { const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = S.x - tg, tp = (S.v + w * c) * dt; S.v = (S.v - w * tp) * ex; S.x = tg + (c + tp) * ex; return S.x; };
          const P = { pitch: spr(-0.45), wing: spr(0), tailP: spr(0), tailS: spr(0), hy: spr(0), hp: spr(0), fluff: spr(1), tuck: spr(0), legs: spr(1), crouch: spr(0) };
          const B = { st: 'perch', at: null, T: 10, k: 0, hyT: 0, hpT: 0, hT: 0, flick: 3, preen: 0, flapPh: 0, A: new THREE.Vector3(), Bp: new THREE.Vector3(), c1: new THREE.Vector3(), c2: new THREE.Vector3(), dur: 1, yaw: 0, hop: null, peck: 0, nPeck: 0, scan: 0, carry: false };
          const tmp = new THREE.Vector3(), _p = new THREE.Vector3(), _q = new THREE.Vector3();
          const S = {
            root, state: B,
            land(w) { B.at = w; root.position.copy(w.p); B.yaw = w.yaw; B.st = w.kind === 'ground' ? 'forage' : w.sleep ? 'sleep' : 'perch'; B.k = 0; B.T = w.T ?? 8; B.scan = 0.4; },
            flyTo(w) {
              B.st = 'fly'; B.k = 0; B.to = w; B.A.copy(root.position); B.Bp.copy(w.p);
              const d = B.A.distanceTo(B.Bp), dir = tmp.subVectors(B.Bp, B.A).setY(0).normalize();
              B.dur = Math.max(0.9, d / 4.2 + 0.4);
              B.c1.copy(B.A).addScaledVector(up, 0.3 + 0.1 * d).addScaledVector(dir, 0.25 * d); B.c2.copy(B.Bp).addScaledVector(up, 0.25 + 0.08 * d).addScaledVector(dir, -0.22 * d);
            },
            hopTo(w, dur = 0.35) { B.st = 'shuffle'; B.k = 0; B.to = w; B.A.copy(root.position); B.dur = dur; B.yaw = Math.atan2(w.p.x - B.A.x, w.p.z - B.A.z); },   // nhảy ngắn (que đậu ↔ trong hộp tổ)
            update(dt, t) {
              dt = Math.min(dt, 0.05); B.k += dt;
              let flap = 0, legsOut = 1, pitchT = -0.45, wingT = 0, tailST = 0, crouchT = 0, fluffT = 1, tuckT = 0;
              brain.tick(S, dt);
              if (B.st === 'fly') {
                const u = Math.min(1, B.k / B.dur), s = u * u * (3 - 2 * u), v = (x, o) => { const q = 1 - x; return o.copy(B.A).multiplyScalar(q * q * q).addScaledVector(B.c1, 3 * q * q * x).addScaledVector(B.c2, 3 * q * x * x).addScaledVector(B.Bp, x * x * x); };
                v(s, _p); v(Math.min(1, s + 0.02), _q);
                const ph = (B.k % 0.55) / 0.55, bounding = u > 0.18 && u < 0.78, flapping = !bounding || ph < 0.55;   // vỗ – xếp cánh: 0,3 s vỗ rồi 0,25 s gập cánh
                if (bounding) _p.y += 0.05 * Math.sin(ph * TAU - 0.6) * Math.min(1, (u - 0.18) / 0.1) * Math.min(1, (0.78 - u) / 0.1);
                root.position.copy(_p);
                const dx = _q.x - _p.x, dz = _q.z - _p.z, dh = Math.hypot(dx, dz);
                if (dh > 1e-4) B.yaw = Math.atan2(dx, dz);
                const flare = Math.max(0, (u - 0.8) / 0.2);
                pitchT = Math.max(-0.5, Math.min(0.5, -Math.atan2(_q.y - _p.y, Math.max(1e-3, dh)) * 0.6)) - 0.75 * flare - 0.3 * Math.max(0, 1 - u / 0.12);
                wingT = flapping ? 1 : 0.15; flap = flapping ? (u < 0.15 ? 16 : u > 0.8 ? 9 : 13) : 0;
                legsOut = u < 0.12 ? 1 - u / 0.12 : u > 0.82 ? 1 : 0; tailST = Math.max(flare, u < 0.12 ? 0.6 : 0);
                if (u >= 1) { S.land(B.to); P.crouch.x = 0.6; brain.landed?.(S); }
              } else if (B.st === 'shuffle') {
                const u = Math.min(1, B.k / B.dur); root.position.lerpVectors(B.A, B.to.p, u); root.position.y += Math.sin(Math.PI * u) * 0.04; crouchT = 0.2;
                if (u >= 1) { S.land(B.to); brain.landed?.(S); }
              } else if (B.st === 'perch' || B.st === 'sleep') {
                if (B.st === 'sleep') { fluffT = 1.18; tuckT = 1; pitchT = -0.2; legsOut = 0.3; }
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
                if (B.hop) {
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
                  if (isWater(Math.round(x2gi(b.x)), Math.round(z2gj(b.z))) || cowHutRect && b.x > cowHutRect.x0 && b.x < cowHutRect.x1 && b.z > cowHutRect.z0 && b.z < cowHutRect.z1) B.yaw += Math.PI; else { b.y = cowY(b.x, b.z); B.hop = { a, b, k: -0.07, n }; }
                }
                if (!B.hop) root.position.y = g;
                const e = engObj && !engObj.inVan && engObj.g.parent === scene ? engObj.g.position : null;
                const near = (e && Math.hypot(e.x - root.position.x, e.z - root.position.z) < 1.3) || (!dogRain.st && Math.hypot(dogObj.position.x - root.position.x, dogObj.position.z - root.position.z) < 1.6);
                if (near || B.k > B.T) brain.next(S, near);
              }
              B.carry = B.carry && B.st !== 'sleep'; food.visible = B.carry;
              // ---- dáng (lò xo) ----
              damp(P.pitch, pitchT, 10, dt); damp(P.wing, wingT, 18, dt); damp(P.tailS, tailST, 10, dt); damp(P.fluff, fluffT, 2, dt); damp(P.tuck, tuckT, 1.5, dt); damp(P.legs, legsOut, 12, dt); damp(P.crouch, crouchT, 14, dt);
              damp(P.tailP, 0, 22, dt); damp(P.hy, B.st === 'fly' ? 0 : B.hyT, 30, dt); damp(P.hp, B.st === 'fly' ? 0 : B.hpT, 26, dt);
              let dy = B.yaw - root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); root.rotation.y += dy * Math.min(1, dt * (B.st === 'fly' ? 10 : 14));
              bodyP.rotation.x = P.pitch.x; bodyP.position.y = 0.26 - 0.06 * P.crouch.x; bodyP.scale.setScalar(P.fluff.x);
              const tk = P.tuck.x;   // ngủ: ngoái đầu ra sau, rúc mỏ vào lông vai, nhắm mắt
              head.rotation.set(-P.pitch.x * 0.7 + P.hp.x * (1 - tk) + 0.35 * tk, P.hy.x * (1 - tk) + 2.7 * tk, 0.25 * Math.sin(t * 0.7) * (1 - tk) * (B.st === 'perch' ? 1 : 0));
              head.position.set(0, 0.13 - 0.05 * tk, 0.25 - 0.12 * tk); for (const e of eyes) e.visible = tk < 0.5;
              if (flap > 0) B.flapPh += dt * flap * TAU;
              // vỗ (theo nhịp bay của mẫu): đỉnh +79° gần chạm nhau trên lưng → đáy −59° dưới bụng; pha vỗ lên bàn cánh gập ra sau, bàn cánh trễ pha sau cánh tay
              const w = P.wing.x, ph = B.flapPh, up = Math.max(0, -Math.sin(ph));
              qOpen.setFromEuler(_we.set(0, 0.12 + 0.25 * up, 0.17 + 1.2 * Math.cos(ph), 'ZYX'));
              for (const W of wings) {   // xếp ⇄ xoè: nội suy cầu giữa 2 hướng vai (không đi qua thân)
                W.sh.quaternion.slerpQuaternions(qFold, qOpen, w);
                W.wr.rotation.set(0, 0.12 + (0.6 * up - 0.12) * w, -0.22 + (0.3 * Math.sin(ph) + 0.22) * w);
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
            roost: () => { tree.updateMatrixWorld(true); return { p: tree.localToWorld(new THREE.Vector3(0.18 * treeS, 1.78 * treeS, 0.08 * treeS)), yaw: Math.random() * TAU, kind: 'roost', sleep: true }; },   // chạc cây sát thân, trong tán
            roof: () => ({ p: caravanObj.localToWorld(new THREE.Vector3(2.2 + Math.random() * 0.3, 3.75, 0.95 + Math.random() * 0.2)), yaw: caravanObj.rotation.y + Math.PI + (Math.random() - 0.5), kind: 'roof', T: 6 + Math.random() * 10 }),
            wire: () => {   // dây pha giữa nhịp cột 1 → cổng néo trạm (Bézier bậc 2 võng 0,3 như world/substation-bess.js)
              const a = gridPoles[0], b = subTie.e, t = 0.35 + Math.random() * 0.3, m = a.clone().lerp(b, 0.5); m.y -= 0.3;
              const p = a.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(m, 2 * t * (1 - t)).addScaledVector(b, t * t);
              return { p, yaw: Math.atan2(b.x - a.x, b.z - a.z) + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2, kind: 'wire', T: 8 + Math.random() * 10 };
            },
            ground: () => {
              const c = LG.getWorldPosition(tmp2);
              for (let k = 0; k < 20; k++) {
                const a = Math.random() * TAU, r = 1.4 + Math.random() * 2.6, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
                if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3) || ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.25)) continue;
                return { p: new THREE.Vector3(x, cowY(x, z), z), yaw: Math.random() * TAU, kind: 'ground', T: 12 + Math.random() * 12 };
              }
              return W.home();
            }
          };
          const ROUTE = ['home', 'ground', 'apple', 'roof', 'wire'];
          const bird = makeSparrow({
            tick(S, dt) { const B = S.state; if (!sparrowAwake() && B.st !== 'fly' && B.at && B.at.kind !== 'roost') S.flyTo(W.roost()); else if (sparrowAwake() && B.st === 'sleep') { B.st = 'perch'; B.T = 4 + Math.random() * 4; B.k = 0; } },
            next(S) { const B = S.state; if (!sparrowAwake()) return; const kind = B.at.kind === 'roost' ? 'home' : ROUTE[(ROUTE.indexOf(B.at.kind) + 1) % ROUTE.length]; S.flyTo(W[kind === 'ground' && Math.random() < 0.4 ? 'apple' : kind]()); }   // "thỉnh thoảng" mới xuống cỏ
          });
          bird.land(sparrowAwake() ? W.home() : W.roost());
          return bird;
        })();
        // ---- HỘP TỔ TREO dưới cành ngang cây táo gần lều (G 15/10 khoanh ảnh — khớp 7 quả táo trong ảnh ⇒ cây appleTrees[1], nhìn hướng θ 72°, cành Ø 5 cm
        //      cao 4,5 m). Dựng theo mẫu "Bird the nest Home Building" (adventurer, CC-BY-4.0 — chỉ đo): ván thông vân gỗ, mặt trước khoét lỗ tròn + que đậu,
        //      mái tôn 2 mái; vách 50% trong suốt (thấy chim trong tổ), nét viền đen hiện rõ. Treo bằng dây thép từ khoen đỉnh mái lên móc vắt qua cành;
        //      đung đưa như con lắc theo gió tại chỗ (+ cú hích khi chim đáp que đậu) ----
        const nestBox = (() => {
          const g = new THREE.Group(); g.name = 'Hộp tổ chim sẻ (Nest box)';
          const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
          c.fillStyle = '#c8894b'; c.fillRect(0, 0, 128, 128);
          for (let k = 0; k < 60; k++) { const x = Math.random() * 128; c.strokeStyle = `rgba(${Math.random() < 0.5 ? '120,70,30' : '230,180,120'},${0.25 + Math.random() * 0.3})`; c.lineWidth = 0.6 + Math.random() * 1.4; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 6, 40, x - 6, 90, x + (Math.random() - 0.5) * 8, 128); c.stroke(); }   // vân gỗ dọc ván
          const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
          const wood = new THREE.MeshLambertMaterial({ map: tx, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
          const tin = new THREE.MeshLambertMaterial({ color: 0x9aa1a5, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide });
          const Wd = 0.26, Dp = 0.26, Hh = 0.32, th = 0.02, DROP = 0.62;   // DROP: tâm cành → đáy hộp
          const pnl = (w, h, d, x, y, z, m = wood) => { const o = bx(w, h, d, m, false, true, lineDark); o.position.set(x, y, z); g.add(o); return o; };
          pnl(Wd + 2 * th, th, Dp, 0, th / 2, 0);   // đáy
          pnl(th, Hh, Dp, Wd / 2 + th / 2, Hh / 2, 0);   // vách sau
          for (const s of [-1, 1]) pnl(Wd, Hh, th, 0, Hh / 2, s * (Dp / 2 - th / 2));   // 2 vách bên
          {   // mặt trước có lỗ tròn Ø 7 cm ở 2/3 chiều cao
            const sh = new THREE.Shape(); sh.moveTo(-Dp / 2, 0); sh.lineTo(Dp / 2, 0); sh.lineTo(Dp / 2, Hh + 0.04); sh.lineTo(0, Hh + 0.09); sh.lineTo(-Dp / 2, Hh + 0.04); sh.closePath();
            const hole = new THREE.Path(); hole.absarc(0, Hh * 0.68, 0.036, 0, TAU, true); sh.holes.push(hole);
            const fg = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false, curveSegments: 16 }); fg.rotateY(-Math.PI / 2); fg.translate(-Wd / 2, 0, 0);
            const f = new THREE.Mesh(fg, wood); edge(f, fg, lineDark); g.add(f);
          }
          for (const s of [-1, 1]) { const r = pnl(Wd + 0.1, 0.012, Dp / 2 + 0.07, 0, Hh + 0.07, s * (Dp / 4 + 0.02), tin); r.rotation.x = -s * 0.36; }   // mái tôn 2 mái
          const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), new THREE.MeshLambertMaterial({ color: 0x7a5232 })); peg.rotation.z = Math.PI / 2; peg.position.set(-Wd / 2 - 0.04, Hh * 0.68 - 0.06, 0); g.add(peg);   // que đậu dưới lỗ
          // khoen trên nóc mái + dây thép lên móc vắt qua cành (móc nằm trong mặt phẳng vuông góc cành)
          const steel = new THREE.MeshLambertMaterial({ color: 0x6d7175 });
          const eye = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.003, 4, 10), steel); eye.position.y = Hh + 0.125; g.add(eye);
          const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.0025, 0.0025, DROP - 0.04 - (Hh + 0.135), 4), steel); wire.position.y = (DROP - 0.04 + Hh + 0.135) / 2; g.add(wire);
          // chim non: 2 cục lông xám, mỏ vàng há ra đòi ăn khi bố mẹ vào tổ
          const chicks = [-1, 1].map(s => {
            const c0 = new THREE.Group(); c0.position.set(0.065, th, s * 0.05); g.add(c0);
            const b0 = new THREE.Mesh(new THREE.SphereGeometry(0.038, 8, 6), new THREE.MeshLambertMaterial({ color: 0x8f877d })); b0.position.y = 0.035; c0.add(b0);
            const hd = new THREE.Group(); hd.position.set(-0.02, 0.07, 0); c0.add(hd);
            hd.add(new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 6), new THREE.MeshLambertMaterial({ color: 0x9a9188 })));
            const bk = new THREE.Mesh(new THREE.ConeGeometry(0.014, 0.03, 6), new THREE.MeshLambertMaterial({ color: 0xf2c94a })); bk.rotation.z = Math.PI / 2; bk.position.x = -0.03; hd.add(bk);
            return { hd, bk };
          });
          // điểm treo: cành ngang G khoanh — toạ độ cục bộ cây (−0,548; 5,038; 1,628), hướng cành theo đoạn (−0,52; 5,04; 1,59) → (−0,64; 5,02; 1,77)
          const tree = appleTrees[1] || appleTrees[0]; tree.updateMatrixWorld(true);
          const piv = new THREE.Group(); piv.name = 'Móc treo hộp tổ'; tree.localToWorld(piv.position.set(-0.548, 5.038, 1.628)); scene.add(piv);
          const bDir = tree.localToWorld(new THREE.Vector3(-0.64, 5.02, 1.77)).sub(tree.localToWorld(new THREE.Vector3(-0.52, 5.04, 1.59))).normalize();
          const hook = new THREE.Mesh(new THREE.TorusGeometry(0.038, 0.0035, 4, 14, 4.4), steel); hook.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), bDir); hook.rotateZ(-0.6); piv.add(hook);
          const YAW = 1.885; g.position.y = -DROP; g.rotation.y = YAW; piv.add(g);   // lỗ tổ quay về hướng G nhìn
          piv.traverse(o => { if (o.isMesh || o.isLineSegments) o.userData.noBatch = true; });
          const sw = { x: 0, z: 0, vx: 0, vz: 0 }, _w = new THREE.Vector3(), base = piv.position.clone();
          const local = (x, y, z) => new THREE.Vector3(x, y, z), fy = a => Math.atan2(Math.cos(YAW) * a, -Math.sin(YAW) * a);   // hướng chim nhìn theo trục x cục bộ hộp (±1)
          const W = (lp, yaw, kind, o) => { piv.updateMatrixWorld(true); return { p: g.localToWorld(lp.clone()), local: lp, yaw, kind, ...o }; };
          return {
            g, piv, chicks, pos: base,
            peg: () => W(local(-Wd / 2 - 0.055, Hh * 0.68 - 0.055, 0), fy(1), 'peg', { T: 0.6 + Math.random() * 0.6 }),
            inside: (i, sleep) => W(local(-0.045, th, (i ? 1 : -1) * 0.06), fy(-1), 'nest', { feed: !sleep, sleep, T: 3 + Math.random() * 3 }),
            kick(v) { const a = Math.random() * TAU; sw.vx += v * Math.cos(a); sw.vz += v * Math.sin(a); },
            update(dt) {   // con lắc 2 trục: dây + hộp ≈ 0,8 m tới trọng tâm (ω₀ ≈ 3,5 rad/s), tắt dần ζ 0,08; gió đẩy theo |u|·u
              windAt(base.x, base.y, base.z, 4.5, _w);
              const w0 = 3.5, k = 0.03, ex = k * Math.abs(_w.x) * _w.x, ez = k * Math.abs(_w.z) * _w.z;
              for (let h = Math.min(dt, 0.05), n = Math.ceil(h / 0.0167), s = h / n, i = 0; i < n; i++) {
                sw.vx += (-w0 * w0 * (sw.x - ex) - 2 * 0.08 * w0 * sw.vx) * s; sw.x += sw.vx * s;
                sw.vz += (-w0 * w0 * (sw.z - ez) - 2 * 0.08 * w0 * sw.vz) * s; sw.z += sw.vz * s;
              }
              piv.rotation.set(-sw.z, 0, sw.x);
            }
          };
        })();
        // ---- cặp chim làm tổ: kiếm mồi quanh bãi bò ⇄ bay về hộp tổ trên cây táo mớm cho chim non; tối vào hộp ngủ ----
        const nestPair = [0, 1].map(i => {
          const bird = makeSparrow({
            tick(S) {
              const B = S.state; if (B.st === 'fly' || B.st === 'shuffle') return;
              if (!sparrowAwake()) { if (!B.at || B.at.kind === 'ground' || B.at.kind === 'perchOut') S.flyTo(nestBox.peg()); else if (B.at.kind === 'peg') S.hopTo(nestBox.inside(i, true)); else if (B.at.kind === 'nest' && !B.at.sleep) S.land(nestBox.inside(i, true)); }
              else if (B.st === 'sleep') { B.st = 'perch'; B.at = nestBox.inside(i, false); B.T = 2 + Math.random() * 6; B.k = 0; }
            },
            landed(S) { if (S.state.at.kind === 'peg') nestBox.kick(0.12); },   // chim đáp que đậu: hộp lắc nhẹ
            next(S, flushed) {
              const B = S.state; if (!sparrowAwake()) return;
              if (B.at.kind === 'ground') { if (!flushed || Math.random() < 0.5) B.carry = !flushed; S.flyTo(nestBox.peg()); }   // kiếm được mồi → ngậm về tổ
              else if (B.at.kind === 'peg') S.hopTo(nestBox.inside(i, false));
              else if (B.at.kind === 'nest') { B.carry = false; S.hopTo({ ...nestBox.peg(), kind: 'perchOut', T: 0.4 }); }
              else {   // từ que đậu bay ra bãi bò kiếm mồi (quanh 1 con bò, tránh chuồng và nước; bãi bò cách cây táo ~25–50 m — trong tầm kiếm ăn của chim sẻ)
                for (let k = 0; k < 20; k++) {
                  const cw = cows[(Math.random() * cows.length) | 0], a = Math.random() * TAU, r = 1.2 + Math.random() * 2.5, x = cw.x + Math.cos(a) * r, z = cw.z + Math.sin(a) * r;
                  if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || (cowHutRect && x > cowHutRect.x0 && x < cowHutRect.x1 && z > cowHutRect.z0 && z < cowHutRect.z1) || Math.hypot(x - nestBox.pos.x, z - nestBox.pos.z) > 70) continue;
                  S.flyTo({ p: new THREE.Vector3(x, cowY(x, z), z), yaw: Math.random() * TAU, kind: 'ground', T: 6 + Math.random() * 10 }); return;
                }
                S.state.k = 0;
              }
            }
          });
          if (sparrowAwake()) bird.land(i ? nestBox.peg() : nestBox.inside(i, false)); else bird.land(nestBox.inside(i, true));
          return bird;
        });
        function updateSparrows(dt, t) {
          nestBox.update(dt); nestBox.piv.updateMatrixWorld(true);
          songbird.update(dt, t);
          for (const b of nestPair) {
            b.update(dt, t); const B = b.state;
            if (B.at && B.at.local && (B.st === 'perch' || B.st === 'sleep')) nestBox.g.localToWorld(b.root.position.copy(B.at.local));   // đậu que / trong hộp: theo hộp đung đưa
          }
          const feeding = nestPair.some(b => b.state.at && b.state.at.kind === 'nest' && b.state.at.feed && b.state.st === 'perch');
          nestBox.chicks.forEach((c, i) => {   // chim non: bố mẹ vào tổ thì ngóc đầu, há mỏ, lắc; bình thường thu lu lim dim
            const k = feeding ? 1 : 0; c.hd.position.y = 0.07 + 0.03 * k + 0.008 * k * Math.sin(t * 14 + i * 2); c.hd.rotation.z = -0.5 * k + 0.12 * k * Math.sin(t * 11 + i);
            c.bk.scale.set(1, 1 + 0.6 * k, 1 + 0.6 * k);
          });
        }
