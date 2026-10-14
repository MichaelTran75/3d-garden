        // ===== CHIM SẺ (G 14/10) — dựng bằng code theo tỉ lệ + màu đo từ mẫu "Bird 5 - Animated Low Poly" (WildPoly3D, Sketchfab, CC-BY-NC-4.0;
        //      chỉ đo: dài mỏ→đuôi 1 · sải cánh ~1,4 · lưng nâu, bụng kem, mỏ ô-liu sẫm, chân xám; nhịp bay mẫu 0,8 s, hạ cánh 0,57 s).
        //  Tập tính chim sẻ nhỏ: đậu thì ngoái đầu giật cục (đổi hướng nhìn 0,3–1,5 s/lần), vẫy đuôi, rỉa lông; dưới đất NHẢY 2 CHÂN, mổ nhanh
        //  1–3 cú rồi NGẨNG ĐẦU canh chừng (chim sẻ ngẩng nhiều lần, mỗi lần ngắn); bay "vỗ – xếp cánh" (vài nhịp vỗ nhanh rồi gập cánh rơi
        //  theo quán tính ⇒ đường bay nhấp nhô); cất cánh nhún rồi bật, hạ cánh xoè đuôi, ngửa thân, duỗi chân. Ngủ trong tán dày sát thân cây,
        //  xù lông, ngoái đầu rúc mỏ vào lông vai. Lộ trình ngày: thanh treo đèn lồng → (thỉnh thoảng) xuống cỏ kiếm ăn → cây táo → nóc xe →
        //  dây điện 110 kV → về thanh treo đèn; người / chó lại gần lúc đang dưới đất thì bay sớm. Sau 19:00 (hoặc mưa) về cây táo ngủ, 05:45 dậy.
        const songbird = (() => {
          const SC = 0.18, up = new THREE.Vector3(0, 1, 0);
          const vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), lam = c => new THREE.MeshLambertMaterial({ color: c, flatShading: true });
          const BROWN = new THREE.Color(0xa8754f), CREAM = new THREE.Color(0xf1e6cc), DARK = 0x4a3328;
          const paint = (geo, f) => { const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const k = f(p.getX(i), p.getY(i), p.getZ(i)); c.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
          const root = new THREE.Group(); root.name = 'Chim sẻ'; root.scale.setScalar(SC); scene.add(root);
          const bodyP = new THREE.Group(); bodyP.position.y = 0.26; root.add(bodyP);   // gốc = điểm chân bám
          const mesh = (geo, m, par, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; o.userData.noBatch = true; par.add(o); return o; };
          const bodyG = new THREE.SphereGeometry(0.5, 10, 7); bodyG.scale(0.34, 0.36, 0.56);
          const body = mesh(paint(bodyG, (x, y, z) => y > -0.04 + 0.05 * z ? BROWN : CREAM), vc, bodyP);
          const head = new THREE.Group(); head.position.set(0, 0.13, 0.25); bodyP.add(head);
          const headG = new THREE.SphereGeometry(0.5, 9, 7); headG.scale(0.29, 0.28, 0.31);
          mesh(paint(headG, (x, y, z) => y > 0.0 - 0.05 * z ? BROWN : CREAM), vc, head, 0, 0.06, 0.03);
          const beakG = new THREE.ConeGeometry(0.042, 0.11, 6); beakG.rotateX(Math.PI / 2); mesh(beakG, lam(0x4a4630), head, 0, 0.04, 0.22);
          const eyes = [-1, 1].map(s => mesh(new THREE.SphereGeometry(0.03, 6, 5), lam(0x0d0d0d), head, s * 0.12, 0.09, 0.1));
          const wingShape = (pts) => { const sh = new THREE.Shape(); pts.forEach(([x, z], i) => i ? sh.lineTo(x, z) : sh.moveTo(x, z)); const g = new THREE.ShapeGeometry(sh); g.rotateX(Math.PI / 2); return g; };
          const armG = wingShape([[0, 0.06], [0.22, 0.05], [0.22, -0.16], [0.12, -0.19], [0, -0.17]]);
          const handG = wingShape([[0, 0.05], [0.16, 0.03], [0.27, -0.02], [0.25, -0.07], [0.19, -0.1], [0.12, -0.15], [0, -0.16]]);
          const wings = [-1, 1].map(s => {   // vai → cánh tay (nâu, vạch kem) → bàn cánh (lông cánh sơ cấp nâu sẫm); s = −1 trái(+x)… gương: scale.x
            const sh = new THREE.Group(); sh.position.set(s * 0.15, 0.09, 0.1); sh.scale.x = -s; bodyP.add(sh);
            mesh(armG, new THREE.MeshLambertMaterial({ color: 0x9c6c48, side: THREE.DoubleSide, flatShading: true }), sh);
            const bar = mesh(new THREE.BoxGeometry(0.2, 0.004, 0.025), lam(0xefe4c8), sh, 0.11, 0.004, -0.04);
            const wr = new THREE.Group(); wr.position.x = 0.21; sh.add(wr);
            mesh(handG, new THREE.MeshLambertMaterial({ color: DARK, side: THREE.DoubleSide, flatShading: true }), wr);
            return { sh, wr, s, bar };
          });
          const tail = new THREE.Group(); tail.position.set(0, 0.02, -0.26); bodyP.add(tail);
          const tailG = wingShape([[-0.045, 0], [0.045, 0], [0.075, -0.3], [0, -0.33], [-0.075, -0.3]]); tailG.rotateY(0); mesh(tailG, new THREE.MeshLambertMaterial({ color: 0x6b4a36, side: THREE.DoubleSide }), tail);
          const legs = [-1, 1].map(s => {   // cẳng chân xám + 3 ngón trước 1 ngón sau (bám cành)
            const lg = new THREE.Group(); lg.position.set(s * 0.055, -0.14, 0.03); bodyP.add(lg);
            const parts = [new THREE.CylinderGeometry(0.011, 0.013, 0.12, 5).translate(0, -0.06, 0)];
            for (const a of [-0.45, 0, 0.45]) parts.push(new THREE.BoxGeometry(0.012, 0.01, 0.075).translate(0, -0.12, 0.035).rotateY(a * 0.6));
            parts.push(new THREE.BoxGeometry(0.012, 0.01, 0.05).translate(0, -0.12, -0.025));
            mesh(mergeGeometries(parts), lam(0x4a4a4a), lg); return lg;
          });
          root.traverse(o => { if (o.isMesh) o.userData.noBatch = true; });
          // ---- điểm đậu (thế giới) ----
          const LG = lanternObj.g, LY = LG.rotation.y;
          const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();
          const sitHome = () => ({ p: LG.localToWorld(new THREE.Vector3(0, 2.525, 0.12 + Math.random() * 0.32)), yaw: LY + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2, kind: 'home' });
          const tree = appleTrees[1] || appleTrees[0], treeS = tree.userData.appleR / (0.12 * 0.8);
          const sitApple = () => { tree.updateMatrixWorld(true); const A = tree.userData.apples, a = A[(Math.random() * A.length) | 0]; return { p: tree.localToWorld(a.home.clone().add(tmp.set(0, 0.28 * treeS + 0.02, 0))), yaw: Math.random() * TAU, kind: 'apple' }; };
          const roost = () => { tree.updateMatrixWorld(true); return { p: tree.localToWorld(new THREE.Vector3(0.18 * treeS, 1.78 * treeS, 0.08 * treeS)), yaw: Math.random() * TAU, kind: 'roost' }; };   // chạc cây sát thân, trong tán
          const sitRoof = () => ({ p: caravanObj.localToWorld(new THREE.Vector3(2.2 + Math.random() * 0.3, 3.75, 0.95 + Math.random() * 0.2)), yaw: caravanObj.rotation.y + Math.PI + (Math.random() - 0.5), kind: 'roof' });
          const sitWire = () => {   // dây pha giữa nhịp cột 1 → cổng néo trạm (Bézier bậc 2 võng 0,3 như world/substation-bess.js)
            const a = gridPoles[0], b = subTie.e, t = 0.35 + Math.random() * 0.3, m = a.clone().lerp(b, 0.5); m.y -= 0.3;
            const p = a.clone().multiplyScalar((1 - t) * (1 - t)).addScaledVector(m, 2 * t * (1 - t)).addScaledVector(b, t * t);
            return { p, yaw: Math.atan2(b.x - a.x, b.z - a.z) + (Math.random() < 0.5 ? 1 : -1) * Math.PI / 2, kind: 'wire' };
          };
          const sitGround = () => {
            const c = LG.getWorldPosition(tmp2);
            for (let k = 0; k < 20; k++) {
              const a = Math.random() * TAU, r = 1.4 + Math.random() * 2.6, x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r;
              if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3) || ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.25)) continue;
              return { p: new THREE.Vector3(x, cowY(x, z), z), yaw: Math.random() * TAU, kind: 'ground' };
            }
            return sitHome();
          };
          // ---- trạng thái + lò xo dáng ----
          const spr = x => ({ x, v: 0 }), damp = (S, tg, w, dt) => { const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = S.x - tg, tp = (S.v + w * c) * dt; S.v = (S.v - w * tp) * ex; S.x = tg + (c + tp) * ex; return S.x; };
          const P = { pitch: spr(-0.45), wing: spr(0), tailP: spr(0), tailS: spr(0), hy: spr(0), hp: spr(0), fluff: spr(1), tuck: spr(0), legs: spr(1), crouch: spr(0) };
          const B = { st: 'perch', at: null, T: 10, k: 0, next: 0, hyT: 0, hpT: 0, hT: 0, flick: 3, preen: 0, flapPh: 0, A: new THREE.Vector3(), Bp: new THREE.Vector3(), c1: new THREE.Vector3(), c2: new THREE.Vector3(), dur: 1, yaw: 0, dYaw: 0, hop: null, peck: 0, nPeck: 0, scan: 0, vy: 0 };
          const ROUTE = ['home', 'ground', 'apple', 'roof', 'wire'];
          const awake = () => { const h = liveWeather.localHour; return h >= 5.75 && h < 19 && !liveWeather.state.raining; };
          const pick = kind => kind === 'home' ? sitHome() : kind === 'ground' ? sitGround() : kind === 'apple' ? sitApple() : kind === 'roof' ? sitRoof() : kind === 'wire' ? sitWire() : roost();
          function land(w) { B.at = w; root.position.copy(w.p); B.yaw = w.yaw; B.st = w.kind === 'ground' ? 'forage' : 'perch'; B.k = 0; B.T = w.kind === 'home' ? 12 + Math.random() * 18 : w.kind === 'ground' ? 12 + Math.random() * 12 : w.kind === 'wire' ? 8 + Math.random() * 10 : 6 + Math.random() * 10; B.scan = 0.4; }
          function flyTo(w) {
            B.st = 'fly'; B.k = 0; B.to = w; B.A.copy(root.position); B.Bp.copy(w.p);
            const d = B.A.distanceTo(B.Bp), dir = tmp.subVectors(B.Bp, B.A).setY(0).normalize();
            B.dur = Math.max(0.9, d / 4.2 + 0.4);
            B.c1.copy(B.A).addScaledVector(up, 0.3 + 0.1 * d).addScaledVector(dir, 0.25 * d); B.c2.copy(B.Bp).addScaledVector(up, 0.25 + 0.08 * d).addScaledVector(dir, -0.22 * d);
          }
          const bez = (u, out) => { const v = 1 - u; return out.copy(B.A).multiplyScalar(v * v * v).addScaledVector(B.c1, 3 * v * v * u).addScaledVector(B.c2, 3 * v * u * u).addScaledVector(B.Bp, u * u * u); };
          const start = awake() ? sitHome() : roost(); land(start); if (start.kind === 'roost') B.st = 'sleep';
          const _p = new THREE.Vector3(), _q = new THREE.Vector3();
          return {
            root, state: B,
            update(dt, t) {
              dt = Math.min(dt, 0.05); B.k += dt;
              const day = awake();
              // ---- hành vi ----
              if (!day && B.st !== 'fly' && B.at && B.at.kind !== 'roost') flyTo(roost());
              if (day && B.st === 'sleep') { B.st = 'perch'; B.T = 4 + Math.random() * 4; B.k = 0; }
              let flap = 0, legsOut = 1, pitchT = -0.45, wingT = 0, tailST = 0, crouchT = 0, fluffT = 1, tuckT = 0;
              if (B.st === 'fly') {
                const u = Math.min(1, B.k / B.dur), s = u * u * (3 - 2 * u);
                bez(s, _p); bez(Math.min(1, s + 0.02), _q);
                const ph = (B.k % 0.55) / 0.55, bounding = u > 0.18 && u < 0.78;   // vỗ – xếp cánh: 0,3 s vỗ rồi 0,25 s gập cánh
                const flapping = !bounding || ph < 0.55;
                if (bounding) _p.y += 0.05 * Math.sin(ph * TAU - 0.6) * Math.min(1, (u - 0.18) / 0.1) * Math.min(1, (0.78 - u) / 0.1);
                root.position.copy(_p);
                const dx = _q.x - _p.x, dz = _q.z - _p.z, dh = Math.hypot(dx, dz);
                if (dh > 1e-4) B.yaw = Math.atan2(dx, dz);
                const flare = Math.max(0, (u - 0.8) / 0.2);
                pitchT = Math.max(-0.5, Math.min(0.5, -Math.atan2(_q.y - _p.y, Math.max(1e-3, dh)) * 0.6)) - 0.75 * flare - 0.3 * Math.max(0, 1 - u / 0.12);
                wingT = flapping ? 1 : 0.15; flap = flapping ? (u < 0.15 ? 16 : u > 0.8 ? 9 : 13) : 0;
                legsOut = u < 0.12 ? 1 - u / 0.12 : u > 0.82 ? 1 : 0; tailST = Math.max(flare, u < 0.12 ? 0.6 : 0);
                if (u >= 1) { land(B.to); B.k = 0; P.crouch.x = 0.6; if (B.to.kind === 'roost' && !day) B.st = 'sleep'; }
              } else if (B.st === 'perch' || B.st === 'sleep') {
                if (B.st === 'sleep') { fluffT = 1.18; tuckT = 1; pitchT = -0.2; legsOut = 0.3; }
                else {
                  // ngoái đầu giật cục · vẫy đuôi · thỉnh thoảng rỉa lông
                  if ((B.hT -= dt) <= 0) { B.hT = 0.3 + Math.random() * 1.2; B.hyT = (Math.random() - 0.5) * 2.4; B.hpT = (Math.random() - 0.5) * 0.6; }
                  if ((B.flick -= dt) <= 0) { B.flick = 2 + Math.random() * 4; P.tailP.v -= 9; }
                  if ((B.preen -= dt) <= 0 && Math.random() < dt * 0.05) B.preen = 1.6;
                  if (B.preen > 0) { B.preen -= dt; B.hyT = 2.2 * Math.sign(B.hyT || 1); B.hpT = 0.5; }
                  if (B.k > B.T && day) {
                    const kind = B.at.kind === 'roost' ? 'home' : ROUTE[(ROUTE.indexOf(B.at.kind) + 1) % ROUTE.length];
                    flyTo(pick(kind === 'ground' && Math.random() < 0.4 ? 'apple' : kind));   // "thỉnh thoảng" mới xuống cỏ
                  }
                }
              } else if (B.st === 'forage') {   // nhảy 2 chân · mổ 1–3 cú · ngẩng canh chừng
                pitchT = -0.15; const g = cowY(root.position.x, root.position.z);
                if (B.hop) {
                  B.hop.k += dt; const q = Math.min(1, B.hop.k / 0.15);
                  root.position.lerpVectors(B.hop.a, B.hop.b, q); root.position.y = B.hop.a.y + (B.hop.b.y - B.hop.a.y) * q + Math.sin(Math.PI * q) * 0.045;
                  legsOut = 1 - 0.5 * Math.sin(Math.PI * q); crouchT = 0;
                  if (q >= 1) { B.hop.n--; P.crouch.x = 0.35; if (B.hop.n > 0) { B.hop.a.copy(root.position); B.hop.b.copy(B.hop.a).add(tmp.set(Math.sin(B.yaw), 0, Math.cos(B.yaw)).multiplyScalar(0.07 + Math.random() * 0.06)); B.hop.b.y = cowY(B.hop.b.x, B.hop.b.z); B.hop.k = -0.06; } else { B.hop = null; B.nPeck = 1 + (Math.random() * 3 | 0); B.peck = 0; } }
                } else if (B.nPeck > 0) {   // mổ: đầu chúc nhanh 0,08 s rồi ngóc
                  B.peck += dt; const q = (B.peck % 0.28) / 0.28; B.hpT = q < 0.3 ? 1.25 : 0.5; B.hyT = 0; pitchT = 0.15; crouchT = 0.25;
                  if (B.peck > 0.28 * B.nPeck) { B.nPeck = 0; B.scan = 0.4 + Math.random() * 1.0; }
                } else if (B.scan > 0) {   // ngẩng đầu canh chừng, liếc 2 bên
                  B.scan -= dt; if ((B.hT -= dt) <= 0) { B.hT = 0.25 + Math.random() * 0.4; B.hyT = (Math.random() - 0.5) * 2; B.hpT = -0.2; }
                } else {
                  B.yaw += (Math.random() - 0.5) * 1.6; const n = 1 + (Math.random() * 3 | 0), a = root.position.clone(), b = a.clone().add(tmp.set(Math.sin(B.yaw), 0, Math.cos(B.yaw)).multiplyScalar(0.08 + Math.random() * 0.06));
                  if (isWater(Math.round(x2gi(b.x)), Math.round(z2gj(b.z)))) B.yaw += Math.PI; else { b.y = cowY(b.x, b.z); B.hop = { a, b, k: -0.07, n }; }
                }
                if (!B.hop) root.position.y = g;
                const e = engObj && !engObj.inVan && engObj.g.parent === scene ? engObj.g.position : null;
                const near = (e && Math.hypot(e.x - root.position.x, e.z - root.position.z) < 1.3) || (!dogRain.st && Math.hypot(dogObj.position.x - root.position.x, dogObj.position.z - root.position.z) < 1.6);
                if (near || B.k > B.T) flyTo(pick(near ? 'apple' : 'apple'));
              }
              // ---- dáng (lò xo) ----
              damp(P.pitch, pitchT, 10, dt); damp(P.wing, wingT, 18, dt); damp(P.tailS, tailST, 10, dt); damp(P.fluff, fluffT, 2, dt); damp(P.tuck, tuckT, 1.5, dt); damp(P.legs, legsOut, 12, dt); damp(P.crouch, crouchT, 14, dt);
              damp(P.tailP, 0, 22, dt); damp(P.hy, B.st === 'fly' ? 0 : B.hyT, 30, dt); damp(P.hp, B.st === 'fly' ? 0 : B.hpT, 26, dt);
              let dy = B.yaw - root.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); root.rotation.y += dy * Math.min(1, dt * (B.st === 'fly' ? 10 : 14));
              bodyP.rotation.x = P.pitch.x; bodyP.position.y = 0.26 - 0.06 * P.crouch.x; bodyP.scale.setScalar(P.fluff.x);
              const tk = P.tuck.x;   // ngủ: ngoái đầu ra sau, rúc mỏ vào lông vai, nhắm mắt
              head.rotation.set(-P.pitch.x * 0.7 + P.hp.x * (1 - tk) + 0.35 * tk, P.hy.x * (1 - tk) + 2.7 * tk, 0.25 * Math.sin(t * 0.7) * (1 - tk) * (B.st === 'perch' ? 1 : 0));
              head.position.set(0, 0.13 - 0.05 * tk, 0.25 - 0.12 * tk); for (const e of eyes) e.visible = tk < 0.5;
              if (flap > 0) B.flapPh += dt * flap * TAU;
              const w = P.wing.x, beat = Math.sin(B.flapPh) * w;
              for (const W of wings) {   // gập: cánh xuôi dọc thân, đầu cánh chéo trên đuôi · xoè: dang ngang + vỗ quanh trục dọc thân
                W.sh.rotation.set(0.1 * (1 - w), W.s * (1 - w) * 1.45, -W.s * (beat * 1.0 + 0.15 * w) - W.s * 0.25 * (1 - w));
                W.wr.rotation.set(0, W.s * (1 - w) * 0.35, -W.s * Math.max(0, -beat) * 0.6);
              }
              tail.rotation.set(-0.15 + P.tailP.x * 0.06 - 0.25 * P.tailS.x, 0, 0); tail.scale.x = 1 + 0.8 * P.tailS.x;
              for (const L of legs) { L.rotation.x = (1 - P.legs.x) * 1.2 - P.pitch.x * P.legs.x; L.scale.setScalar(0.35 + 0.65 * P.legs.x); }
              root.visible = true;
            }
          };
        })();
