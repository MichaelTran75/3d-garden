        // ===== GẤU MÈO TRÈO CÂY TÁO HÁI ĂN (nghiên cứu tập tính gấu mèo, thêm trèo cây hái táo khi cận cảnh) =====
        //  Tập tính: trèo rất giỏi (vuốt không thu, chi trước khoẻ), ban đêm hay trèo cây ăn quả (táo); xuống cây thường CHÚC ĐẦU nhờ xoay bàn chân sau ~180°;
        //  tay trước rất nhạy nhưng không có ngón cái đối ⇒ ôm thức ăn bằng 2 tay, gặm từng miếng nhỏ; gặp nguy thì ở yên trên cây (không bỏ chạy xuống).
        //  Kịch bản (khi người xem ZOOM CẬN nhìn gấu mèo ≥ 1,5 s — con vật dài ≥ 80 điểm ảnh, nằm trong khung; hoặc BẤM cây táo già —, tin 'appleTreeTap',
        //  animals/raccoon/brain.js): tới gốc cây táo già cạnh hang (appleTrees[2])
        //  → bám lên thân (thân dựng dần thẳng đứng, 2 tay lên trước) → trèo thân (bụng sát vỏ, chân dạng ôm thân, nhịp chéo luôn ≥ 3 chân bám) → qua chạc → men lên cành
        //  (đường tự lăn quanh cành tới mặt không vướng cành khác, ưu tiên mặt trên) → dừng sát quả, thò 1 tay chạm vỏ quả, vặt → ngồi trên cành 2 tay ôm táo gặm
        //  (quả nhỏ dần) → thả lõi rơi → quay đầu, xuống cành, xuống thân CHÚC ĐẦU (bàn chân sau quay ngược, chậm hơn lúc lên) → xuống đất đi tiếp. Quả mọc lại sau 25 phút.
        //  Đường trèo = dãy điểm trên VỎ THẬT trong hệ cây (animals/raccoon/route.js: lưới vỏ dựng lại trên CPU lúc lập đường, không đọc lưới đã nạp GPU): điểm bụng,
        //  pháp tuyến, 2 dãy điểm bám trái / phải. Bàn chân bám = tham số đường, giữ cố định khi trụ ⇒ không trượt; IK bằng rig.free (toạ độ gấu mèo),
        //  rig.abMax nới góc dạng chân lúc ôm thân; đuôi mềm bị đẩy khỏi ống cành (tail.push). Gọi từ animals/raccoon/brain.js ----
        function makeRaccoonClimb(ctx) {   // ctx: B (trạng thái), rig, P (lò xo dáng), damp, tail, set, H0
          const Tr = appleTrees[2], O = raccoonObj, U = O.userData, s = U.s, { B, rig, P, damp } = ctx;
          const UP = new THREE.Vector3(0, 1, 0), RMIN = 0.02, REACH = 0.3, ARM = 0.23, STRIDE = 0.2, DUTY = 0.76, OFF = [0.01, 0.51, 0.76, 0.26], V_UP = 0.3, V_BR = 0.26, V_DN = 0.2, V_DB = 0.17, RESPAWN = 25 * 60, HC = 0.36, TM = 1.4, TT = 2, T_AT = [0, 0.15, 0.3, 0.45];   // RMIN: cành mảnh nhất đi được (bán kính, m); ARM: tay với (m); nhịp chéo, luôn ≥ 3 chân bám (DUTY, OFF); xuống chậm hơn lên (V_DN thân, V_DB cành)
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3(), _t = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3(), _fa = new THREE.Vector3(), _fb = new THREE.Vector3(), _fc = new THREE.Vector3();
          const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
          const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }, cl = (x, a, b) => Math.max(a, Math.min(b, x));
          const C = { on: false, ph: '', k: 0, ho: new THREE.Vector3(), u: 0, dir: 1, path: null, ap: null, hold: false, grabI: 0, feet: [0, 1, 2, 3].map(() => ({ u: 0, sw: false, u0: 0, u1: 0, lift: 0, w: new THREE.Vector3() })), psi: 0, cuT: 0, core: null, eaten: [], p0: new THREE.Vector3(), q0: new THREE.Quaternion(), g0: [0, 1, 2, 3].map(() => new THREE.Vector3()), field: null, goal: new THREE.Vector3(), bite: 1, t0: 0 };
          // ---- đồ thị cành của cây (một lần): đoạn → đoạn mẹ (đầu đoạn = cuối đoạn mẹ), chuỗi thân từ gốc tới chạc ----
          let G = null;
          function graph() {
            if (G) return G;
            Tr.updateMatrixWorld(true);
            const segs = Tr.userData.limbs, key = (x, y, z) => x.toFixed(4) + ',' + y.toFixed(4) + ',' + z.toFixed(4), byEnd = new Map();
            segs.forEach((g, i) => byEnd.set(key(g[3], g[4], g[5]), i));
            const pred = segs.map(g => { const j = byEnd.get(key(g[0], g[1], g[2])); return j === undefined ? -1 : j; }), kids = segs.map(() => []);
            pred.forEach((p, i) => { if (p >= 0) kids[p].push(i); });
            const trunk = []; let i = pred.indexOf(-1); while (i >= 0) { trunk.push(i); i = kids[i].length === 1 ? kids[i][0] : -1; }
            const top = trunk[trunk.length - 1], dist = new Float32Array(segs.length).fill(-1), len = j => Math.hypot(segs[j][3] - segs[j][0], segs[j][4] - segs[j][1], segs[j][5] - segs[j][2]);
            const from = j => { if (dist[j] >= 0) return dist[j]; const p = pred[j]; return (dist[j] = p < 0 || p === top || trunk.includes(p) ? 0 : from(p) + len(p)); };
            const fruit = Tr.children.find(o => o.name === 'Quả táo');
            return (G = { segs, pred, trunk, top, from, len, fruit, S: Tr.scale.x });
          }
          const vec = (g, o) => new THREE.Vector3(g[o], g[o + 1], g[o + 2]);
          function logSide() {   // hướng từ thân cây tới trục khúc gỗ chết (hệ cây) — mặt trèo tránh phía này
            const D = deadLog, P0 = Tr.position, ux = D.bx - D.ax, uz = D.bz - D.az; let k = ((P0.x - D.ax) * ux + (P0.z - D.az) * uz) / (ux * ux + uz * uz); k = cl(k, 0, 1);
            _a.set(D.ax + ux * k - P0.x, 0, D.az + uz * k - P0.z).normalize().applyAxisAngle(UP, -Tr.rotation.y); return _a.clone();
          }
          // ---- chọn quả: cành đủ to (bán kính ≥ 2 cm) có điểm cách quả ≤ 30 cm; ưu tiên quả RÌA TÁN (xa trục thân — người xem nhìn cận thấy rõ, quả sát thân bị lá
          //  dày che) và ở PHÍA NGƯỜI XEM (bấm cây từ xa — quả bên kia tán bị cả tán che): điểm = 0,5 × quãng cành từ chạc + 3 × khoảng với − 1,5 × khoảng
          //  cách ngang tới trục thân (tính tới 3,2 m) − 2 × cos góc (hướng quả, hướng camera) quanh trục thân ----
          const _cam = new THREE.Vector3();
          function plan() {
            const g = graph(), S = g.S, apples = Tr.userData.apples, cand = [];
            _cam.copy(camera.position).sub(Tr.position).setY(0); if (_cam.lengthSq() > 1e-8) _cam.normalize().applyAxisAngle(UP, -Tr.rotation.y);   // hướng tới người xem (hệ cây)
            for (const ap of apples) {
              if (!ap.on || ap.raccoon) continue; const p = ap.home, pr = Math.hypot(p.x, p.z), face = pr > 1e-4 ? (p.x * _cam.x + p.z * _cam.z) / pr : 0; let best = null;
              for (let j = 0; j < g.segs.length; j++) {
                const sg = g.segs[j]; if (g.trunk.includes(j) || Math.min(sg[6], sg[7]) * S < RMIN) continue;
                const ax = sg[0], ay = sg[1], az = sg[2], dx = sg[3] - ax, dy = sg[4] - ay, dz = sg[5] - az, L2 = dx * dx + dy * dy + dz * dz;
                const k = cl(((p.x - ax) * dx + (p.y - ay) * dy + (p.z - az) * dz) / L2, 0, 1), d = Math.hypot(ax + dx * k - p.x, ay + dy * k - p.y, az + dz * k - p.z) * S;
                if (d > REACH) continue; const sc = 0.5 * (g.from(j) + Math.sqrt(L2) * k) * S + 3 * d - 1.5 * Math.min(3.2, pr * S) - 2 * face + 3 * Math.max(0, Math.abs(dy) / Math.sqrt(L2) - 0.6);   // cành cuối dựng đứng: khó ngồi ăn
                if (!best || sc < best.sc) best = { sc, ap, j, k };
              }
              if (best) cand.push(best);
            }
            if (!cand.length || !Tr.userData.barkGeo) return false;
            cand.sort((a, b) => a.sc - b.sc); const geo = Tr.userData.barkGeo(); let pick = null;
            for (let n = 0; n < Math.min(4, cand.length); n++) {   // thử tối đa 4 quả điểm cao nhất: lấy quả đầu tiên tay với tới từ chỗ dừng (vai ở cuối đường)
              const c = cand[n]; C.path = c.Q = buildPath(c.j, c.k, c.ap, geo);
              sample(c.Q.uEnd + hipU(0), _a, _n); _a.addScaledVector(_n, 0.17 * W()); Tr.localToWorld(_b.copy(c.ap.home));
              c.miss = _a.distanceTo(_b) - Tr.userData.appleR * S - ARM;
              if (!pick || c.miss < pick.miss) pick = c; if (c.miss <= 0) break;
            }
            C.ap = pick.ap; C.path = pick.Q; return true;
          }
          function buildPath(j, kq, ap, geo) {   // chuỗi cành từ chạc tới cành đích + mặt bám dưới gốc ⇒ đường trên vỏ thật (animals/raccoon/route.js)
            const g = graph(), segs = g.segs, S = g.S, chain = []; for (let i = j; i >= 0 && i !== g.top; i = g.pred[i]) chain.unshift(i);
            const f0 = segs[chain[0]], n = new THREE.Vector3(f0[3] - f0[0], 0, f0[5] - f0[2]); if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize();
            const lg = logSide(), MIN = 1.25, angOf = a => Math.atan2(a.x * lg.z - a.z * lg.x, a.dot(lg)), ang = angOf(n);   // ≥ 72° khỏi khúc gỗ
            if (Math.abs(ang) < MIN) n.copy(lg).applyAxisAngle(UP, ang >= 0 ? MIN : -MIN).normalize();   // mép vùng cấm CÙNG phía (angOf đo đúng chiều applyAxisAngle)
            // mặt bám dưới gốc quay về PHÍA NGƯỜI XEM nếu được (mặt sau thì thân cây che con vật): hướng camera, hoặc mép vùng cấm khúc gỗ gần camera nhất — chỗ bám
            //  dưới gốc (~0,9 m) phải là đất khô, ngang gốc (bờ sông ngay sau cây). Lên cao đường tự lăn quanh thân tới mặt ngoài của cành đích
            { const c = _cam.clone(), ac = angOf(c); if (Math.abs(ac) < MIN) c.copy(lg).applyAxisAngle(UP, ac >= 0 ? MIN : -MIN);
              Tr.localToWorld(_a.copy(c).multiplyScalar(0.9 / S).setY(0));
              if (c.lengthSq() > 0.5 && !isWater(Math.round(x2gi(_a.x)), Math.round(z2gj(_a.z))) && Math.abs(cowY(_a.x, _a.z) - Tr.position.y) < 0.4) n.copy(c).normalize(); }
            return raccoonRoute(Tr, g, geo, chain, kq, n, ap);
          }
          let _f = 0;
          function at(u) { const L = C.path.L; let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= u) lo = m; else hi = m; } _f = (u - L[lo]) / Math.max(1e-6, L[lo + 1] - L[lo]); return lo; }
          function sample(u, oP, oN, oT) {   // tham số đường (đv cây) → điểm mặt vỏ, pháp tuyến, tiếp tuyến (THẾ GIỚI)
            const Q = C.path, lo = at(u = cl(u, 0, Q.total)), f = _f;
            oP.lerpVectors(Q.P[lo], Q.P[lo + 1], f); Tr.localToWorld(oP);
            if (oN) oN.lerpVectors(Q.N[lo], Q.N[lo + 1], f).transformDirection(Tr.matrixWorld);
            if (oT) oT.lerpVectors(Q.Tg[lo], Q.Tg[lo + 1], f).transformDirection(Tr.matrixWorld);
          }
          const W = () => O.scale.x, hipU = i => U.legs[i].hip.position.x * W() / graph().S, side = i => Math.sign(U.legs[i].hip.position.z) || 1, BX = [-0.21, -0.07, 0.03, 0.2];
          function frame(u, dir, oP, oQ) {   // thân trên vỏ: x = dây cung hông → vai (2 đầu cùng cách vỏ), y = pháp tuyến vỏ; vỏ gồ giữa thân ⇒ nâng thân cho bụng khỏi chạm
            const hb = hipU(2), hf = hipU(0), k = W() / graph().S;
            sample(u + dir * hb, _fa, _y); sample(u + dir * hf, _fb, _z); sample(u, _fc, _n); _n.add(_y).add(_z);   // pháp tuyến = trung bình hông / giữa / vai: thân không lắc theo từng gờ vỏ
            _x.subVectors(_fb, _fa).normalize(); _y.copy(_n).addScaledVector(_x, -_n.dot(_x)).normalize(); _z.crossVectors(_x, _y);
            oP.lerpVectors(_fa, _fb, -hb / (hf - hb)); let lift = 0;
            for (const bx of BX) { sample(u + dir * bx * k, _fc); const h = _fc.sub(oP).dot(_y); if (h > lift) lift = h; }
            oP.addScaledVector(_y, Math.min(0.12, lift));
            return oQ.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
          }
          function footW(i, u, lift, out, lfIn) {   // điểm bám bàn chân i ở tham số u (thế giới): mặt vỏ thật bên trái / phải đường + cổ chân nhô khỏi vỏ theo pháp tuyến tại chỗ bám
            const Q = C.path, lf = lfIn === undefined ? side(i) * C.dir > 0 : lfIn, A = lf ? Q.FL : Q.FR, An = lf ? Q.NL : Q.NR, lo = at(u = cl(u, 0, Q.total)), f = _f;
            out.lerpVectors(A[lo], A[lo + 1], f); Tr.localToWorld(out); _n.lerpVectors(An[lo], An[lo + 1], f).transformDirection(Tr.matrixWorld);
            const F = C.feet[i]; (F.n || (F.n = new THREE.Vector3())).copy(_n);   // pháp tuyến vỏ tại chỗ bám: bàn chân áp theo (pawFlat)
            return out.addScaledVector(_n, (U.legs[i].ankleH || 0) * W() + lift);
          }
          function gait(du) {   // nhịp chân trèo: chân trụ giữ nguyên chỗ bám, chân vung tới chỗ bám mới phía trước
            const S = graph().S; C.psi += Math.abs(du) * S / STRIDE;
            C.feet.forEach((F, i) => {
              const ph = (C.psi + OFF[i]) % 1, sw = ph >= DUTY, home = C.u + C.dir * hipU(i);
              if (sw && !F.sw) { F.sw = true; F.u0 = F.u; F.u1 = home + C.dir * 0.55 * STRIDE / S; }
              if (F.sw) { const k = sw ? (ph - DUTY) / (1 - DUTY) : 1; F.u = F.u0 + (F.u1 - F.u0) * ease(k); F.lift = Math.sin(Math.PI * k) * 0.035; if (!sw) { F.sw = false; F.lift = 0; } }
            });
          }
          function settle(dt) {   // đứng yên trên cây: chân lệch chỗ nhà thì nhích từng chân
            const S = graph().S; let busy = C.feet.some(F => F.sw);
            C.feet.forEach((F, i) => {
              const home = C.u + C.dir * hipU(i);
              if (F.sw) { F.k = (F.k || 0) + dt / 0.25; F.u = F.u0 + (F.u1 - F.u0) * ease(F.k); F.lift = Math.sin(Math.PI * Math.min(1, F.k)) * 0.03; if (F.k >= 1) { F.sw = false; F.lift = 0; } }
              else if (!busy && Math.abs(F.u - home) > 0.25 * STRIDE / S) { F.sw = true; F.k = 0; F.u0 = F.u; F.u1 = home; busy = true; }
            });
          }
          // ---- nhìn cận: con vật dài ≥ 80 điểm ảnh và nằm trong khung ----
          function closeUp() {
            if (!O.visible) return false;
            const ppu = renderer.domElement.clientHeight * camera.zoom / (camera.top - camera.bottom);
            if (ppu * 0.5 < 80) return false;
            _a.copy(O.position).project(camera); return Math.abs(_a.x) < 0.85 && Math.abs(_a.y) < 0.85;
          }
          function setFeetFree() { C.feet.forEach((F, i) => { rig.free[i] = (rig.free[i] || new THREE.Vector3()).copy(O.worldToLocal(_c.copy(F.w))); }); }
          function pawFlat(i, flip, w) {   // bàn chân áp mặt vỏ tại chỗ bám: đế ⟂ pháp tuyến vỏ, ngón theo hướng thân — flip: bàn chân sau quay ngược khi xuống chúc đầu; w: trộn từ dáng đi đất
            const L = U.legs[i], n = C.feet[i].n; if (!n || w <= 0) return;
            _x.set(flip ? -1 : 1, 0, 0).applyQuaternion(O.quaternion); _x.addScaledVector(n, -_x.dot(n)); if (_x.lengthSq() < 1e-6) return; _x.normalize(); _z.crossVectors(_x, n);
            _q.setFromRotationMatrix(_m.makeBasis(_x, n, _z)); L.knee.getWorldQuaternion(_q2); _q.premultiply(_q2.invert());
            if (w < 1) L.paw.quaternion.slerp(_q, w); else L.paw.quaternion.copy(_q);
          }
          function holdApple(dt) {   // táo giữa 2 bàn tay trước (hơi nhô ra trước)
            if (!C.hold || !C.ap) return; const A = C.ap.g;
            U.legs[0].paw.getWorldPosition(_a); U.legs[1].paw.getWorldPosition(_b);
            const w = C.ph === 'reach' ? 0 : C.ph === 'sit' ? ease(C.k / 0.5) : 1;   // 1 tay cầm (quả lệch khỏi bàn tay đúng như lúc chạm) → 2 tay ôm
            _c.copy(C.grabI ? _b : _a).add(C.ho); _a.lerp(_b, 0.5); _c.lerp(_a, w); A.position.lerp(_c, Math.min(1, dt * 12));
            A.scale.setScalar(C.bite); A.rotation.y += 0.01;
          }
          function grab() { const A = C.ap.g; scene.attach(A); C.hold = true; C.ap.raccoon = true; C.ap.on = false; C.bite = 1; }
          function dropCore() {   // thả lõi táo rơi xuống đất
            const g = C.ap.g, B = looseBody(0.03, { e: 0.28, mu: 0.6, rr: 0.16 });   // lõi táo: nảy thấp trên đất mềm, lăn một quãng ngắn rồi nằm (rơi xuống hồ thì nổi)
            B.p.copy(g.position); B.p0.copy(B.p); B.q.copy(g.quaternion); B.q0.copy(B.q); B.v.set((Math.random() - 0.5) * 0.4, 0.4, (Math.random() - 0.5) * 0.4); B.w.set(6, 0, (Math.random() - 0.5) * 3);
            C.hold = false; C.core = { g, B, rest: 0 };
            C.eaten.push({ ap: C.ap, at: C.t0 + RESPAWN });
          }
          function respawn(ap) {   // táo mọc lại trên cành cũ
            const g = graph(); g.fruit.add(ap.g); ap.g.position.copy(ap.home); ap.g.rotation.set(0, ap.rot, 0); ap.g.scale.setScalar(1); ap.g.visible = true; ap.on = true; ap.raccoon = false;
          }
          function setPh(ph) { C.ph = ph; C.k = 0; }
          function start(t) {   // đã tới gốc cây: bắt đầu bám lên thân
            C.on = true; C.dir = 1; C.u = C.path.uStart; C.psi = 0; setPh('mount'); C.p0.copy(O.position); C.q0.copy(O.quaternion);
            rig.feet.forEach((F, i) => C.g0[i].copy(F.w).addScaledVector(UP, (U.legs[i].ankleH || 0) * W()));
            C.feet.forEach((F, i) => { F.u = C.u + hipU(i); F.sw = false; F.lift = 0; });
            rig.abMax = 1.1; if (ctx.tail) ctx.tail.push = tailPush;   // ôm thân: chân dạng rộng hơn lúc đi đất; đuôi không xuyên cành
          }
          const _tp = new THREE.Vector3(), _h1 = new THREE.Vector3(), _h2 = new THREE.Vector3(), _h3 = new THREE.Vector3(), _h4 = new THREE.Vector3();
          function barkGap(u, p) { return C.path.gap(u, p, _tp); }   // điểm (hệ cây) cách vỏ thật quanh u bao xa, theo đúng hướng nhìn từ trục cành (route.js gap); _tp = hướng ra (đơn vị)
          function tailPush(p) {   // đốt đuôi: tâm cách vỏ thật ≥ bán kính ống đuôi + ngoài các ống cành khác
            const Q = C.path, S = graph().S; Tr.worldToLocal(p);
            const g = barkGap(C.u - C.dir * 0.3, p) - 0.058 / S; if (g < 0) p.addScaledVector(_tp, -g);
            Q.pushOut(C.u - C.dir * 0.2, p, 0.058 / S); const g2 = barkGap(C.u - C.dir * 0.3, p) - 0.058 / S; if (g2 < 0) p.addScaledVector(_tp, -g2); Tr.localToWorld(p);
          }
          function footOut(w, u, i) { const S = graph().S; Tr.worldToLocal(w); const g = barkGap(u, w) - (U.legs[i].ankleH || 0) * W() * 0.9 / S; if (g < 0) w.addScaledVector(_tp, -g); Tr.localToWorld(w); }   // cổ chân lúc lên / xuống cây: không cắt qua gốc loe
          function turnSide() {   // chiều quay đầu trên cành (+1 / −1): phía thoáng hơn cho mũi + mông lúc thân nằm ngang cành
            const Q = C.path, S = graph().S, w = W(); sample(C.u, _h1, _h2, _h3); _h3.cross(_h2).normalize();   // _h3 = T × N
            const cg = g => { let m = 9; for (const d of [0.28, 0.16, -0.14, -0.24]) { _h4.copy(_h1).addScaledVector(_h3, g * d * w).addScaledVector(_h2, 0.1 * w); Tr.worldToLocal(_h4); m = Math.min(m, Q.sdAt(C.u, _h4)); } return m; };
            return cg(1) >= cg(-1) ? 1 : -1;
          }
          function headFree(a0) {   // góc ngẩng đầu (so với thân) gần a0 nhất mà sọ + mõm không chạm vỏ / cành khác: thử lệch dần 2 phía, giữ góc lệch cũ khi còn hở
            const Q = C.path, S = graph().S, k = s * W(), uH = cl(C.u + C.dir * 0.3 * W() / S, 0, Q.total); U.neck.getWorldPosition(_h1); U.torso.getWorldQuaternion(_q2);
            _h2.set(1, 0, 0).applyQuaternion(_q2); _h3.set(0, 1, 0).applyQuaternion(_q2);
            const pt = (a, x, y) => { const c7 = Math.cos(0.7 * a), s7 = Math.sin(0.7 * a), ca = Math.cos(a), sa = Math.sin(a), px = 0.07 * c7 - 0.05 * s7 + x * ca - y * sa, py = 0.07 * s7 + 0.05 * c7 + x * sa + y * ca;
              _h4.copy(_h1).addScaledVector(_h2, px * k).addScaledVector(_h3, py * k); Tr.worldToLocal(_h4); return Math.min(Q.sdAt(uH, _h4), barkGap(uH, _h4)) * S; };
            const gap = d => Math.min(pt(a0 + d, 0.01, 0) - 0.07 * k, pt(a0 + d, 0.095, -0.022) - 0.036 * k);
            const g0 = gap(0); if (g0 > 0.012) { C.hOff = 0; return a0; }
            if (C.hOff && gap(C.hOff) > 0.004) return a0 + C.hOff;
            let best = 0, bs = g0; for (const d of [0.3, -0.3, 0.6, -0.6, 0.9, -0.9]) { const g = gap(d); if (g > 0.008) { best = d; break; } if (g > bs + 0.01) { bs = g; best = d; } }
            C.hOff = best; return a0 + best;
          }
          function end(t) {   // xuống tới đất: trả gấu mèo về dáng đi đất
            C.on = false; rig.free.fill(null); rig.abMax = 0; if (ctx.tail) ctx.tail.push = null; U.legs.forEach(L => L.paw.rotation.set(0, 0, 0)); const yaw = Math.atan2(-C.path.nW.z, C.path.nW.x);
            O.quaternion.identity(); O.rotation.set(0, yaw, 0); O.position.y = cowY(O.position.x, O.position.z); P.gy = null; rig.reset();
            B.climbCD = t + 90; ctx.set('forage');
          }
          // ---- mỗi khung khi đang trèo (thay phần dáng đi đất của raccoonBrain.update) ----
          function update(dt, t) {
            C.t0 = t; C.k += dt; const k = C.k, S = graph().S, H0 = ctx.H0;
            let hT = HC * H0, pT = 0, look = null, headP = 0;
            if (C.ph === 'mount') {   // dựng thân lên thân cây: tay trước bám trước, chân sau rời đất sau
              const e = ease(k / TM); frame(C.u, 1, _a, _q); O.position.lerpVectors(C.p0, _a, e); O.quaternion.slerpQuaternions(C.q0, _q, e);
              C.feet.forEach((F, i) => { const kk = i < 2 ? ease(k / TM / 0.85) : ease((k / TM - 0.3) / 0.7); footW(i, F.u, 0, _b); F.w.lerpVectors(C.g0[i], _b, kk).addScaledVector(_n.set(0, 1, 0), Math.sin(Math.PI * kk) * 0.06); footOut(F.w, F.u, i); F.pw = kk; });   // chân đi cùng nhịp với thân (đích trong tầm chân suốt lúc dựng người)
              hT = H0 + (HC * H0 - H0) * e; if (k >= TM) setPh('up');
            } else if (C.ph === 'up' || C.ph === 'down') {
              const Q = C.path, v = C.ph === 'down' ? (C.u < Q.uTrunk ? V_DN : V_DB) : (C.u < Q.uTrunk ? V_UP : V_BR), du = C.dir * v * dt / S;
              C.u = cl(C.u + du, Q.uStart, Q.uEnd); gait(du); frame(C.u, C.dir, O.position, _q); O.quaternion.slerp(_q, Math.min(1, dt * 12));
              C.feet.forEach((F, i) => footW(i, F.u, F.lift, F.w));
              look = C.ph === 'up' && C.ap ? C.ap.g.getWorldPosition(_c).clone() : null; headP = C.ph === 'down' ? 0.25 : 0.1;
              sample(C.u + C.dir * 0.3 * W() / S, _fc); headP += cl((_fc.sub(O.position).dot(_y) / W() - 0.02) * 4, -0.25, 0.9);   // vỏ phía trước gồ lên ⇒ ngẩng đầu, hụt xuống ⇒ cúi
              if (C.ph === 'up' && C.u >= Q.uEnd - 1e-4) setPh('reach');
              if (C.ph === 'down' && C.u <= Q.uStart + 1e-4) { setPh('dismount'); C.p0.copy(O.position); C.q0.copy(O.quaternion); C.feet.forEach((F, i) => C.g0[i].copy(F.w)); }
            } else if (C.ph === 'reach') {   // thò tay gần quả nhất ra vặt
              settle(dt); frame(C.u, 1, O.position, _q); O.quaternion.slerp(_q, Math.min(1, dt * 10)); C.feet.forEach((F, i) => footW(i, F.u, F.lift, F.w));
              const ap = C.ap.g.getWorldPosition(_c); if (k < dt * 1.5) C.grabI = O.worldToLocal(_a.copy(ap)).z * side(0) > 0 ? 0 : 1;
              const i = C.grabI, kk = ease(k / 0.6); look = ap.clone(); headP = -0.2;
              if (!C.hold) { U.legs[i].hip.getWorldPosition(_b).sub(ap).normalize(); C.ho.copy(_b).multiplyScalar(-(Tr.userData.appleR * S + 0.012)); }   // tay chạm vỏ quả phía vai, không chọc vào ruột quả
              C.feet[i].w.lerp(_b.copy(C.hold ? C.ap.g.position : ap).sub(C.ho), kk);
              if (k >= 0.6 && !C.hold) grab();
              if (k >= 1.0) { setPh('sit'); for (const j of [0, 1]) C.g0[j].copy(C.feet[j].w); }
            } else if (C.ph === 'sit' || C.ph === 'eat') {   // ngồi trên cành, 2 tay ôm táo trước miệng gặm
              sample(C.path.uEnd, _a, _n, _t); _y.copy(UP).add(_n).normalize(); _x.copy(_t).addScaledVector(_y, -_t.dot(_y)); if (_x.lengthSq() < 1e-4) _x.copy(C.path.nW); _x.normalize(); _z.crossVectors(_x, _y);
              _q.setFromRotationMatrix(_m.makeBasis(_x, _y, _z)); O.position.lerp(_a, Math.min(1, dt * 6)); O.quaternion.slerp(_q, Math.min(1, dt * (C.ph === 'sit' ? 3 : 8)));
              hT = 0.205 * s; pT = 0.95;
              for (const i of [2, 3]) footW(i, C.feet[i].u, 0, C.feet[i].w);
              const hipF = U.legs[0].hip.position, pc = Math.cos(P.pitch.x), ps = Math.sin(P.pitch.x), shX = hipF.x * pc - hipF.y * ps, shY = P.h.x + hipF.x * ps + hipF.y * pc;
              const gap = Math.max(0.03 * s, 0.8 * C.bite * Tr.userData.appleR * S / W()), kIn = C.ph === 'sit' ? ease(k / 0.5) : 1;   // 2 tay ôm 2 bên quả (quả nhỏ dần ⇒ tay khép dần)
              for (const i of [0, 1]) { O.localToWorld(_b.set(shX + 0.09 * s, shY + 0.02 * s + (C.ph === 'eat' ? 0.012 * s * Math.sin(t * 9) : 0), side(i) * gap)); C.feet[i].w.lerpVectors(C.g0[i], _b, kIn); }
              headP = -0.2 + (C.ph === 'eat' ? 0.06 * Math.abs(Math.sin(t * 8)) : 0);
              if (C.ph === 'sit' && k >= 0.9) setPh('eat');
              if (C.ph === 'eat') { C.bite = Math.max(0.32, 1 - 0.68 * Math.floor(k / 1.6) / 7); if (k >= 12) { dropCore(); setPh('turn'); C.dir = -1; C.feet.forEach((F, i) => { F.sw = true; F.u0 = F.u; F.u1 = C.u - hipU(i); C.g0[i].copy(F.w); }); C.q0.copy(O.quaternion); C.tg = turnSide(); } }
            } else if (C.ph === 'turn') {   // quay đầu trên cành: xoay quanh pháp tuyến vỏ về phía thoáng (không lộn qua lưng); chân bước 2 nhịp: về dưới hông lúc thân nằm ngang cành, rồi tới chỗ bám chúc đầu
              const x = k / TT, g = C.tg, kS = W() / S; frame(C.u, -1, _a, _q); O.position.lerp(_a, Math.min(1, dt * 6));
              _q.multiply(_q2.setFromAxisAngle(UP, g * Math.PI * (1 - ease(x)))); O.quaternion.slerpQuaternions(C.q0, _q, ease(x / 0.35));
              C.feet.forEach((F, i) => { const a = T_AT[i] * 0.4, kA = ease((x - a) / 0.3), kB = ease((x - 0.5 - a) / 0.3), uM = C.u - g * U.legs[i].hip.position.z * kS;
                footW(i, uM, Math.sin(Math.PI * kA) * 0.04, _b, (i < 2 ? g : -g) > 0); F.w.lerpVectors(C.g0[i], _b, kA); F.u = F.u0 + (uM - F.u0) * kA;
                if (kB > 0) { footW(i, F.u1, Math.sin(Math.PI * kB) * 0.04, _b); F.w.lerp(_b, kB); F.u = uM + (F.u1 - uM) * kB; } });
              if (k >= TT) { C.feet.forEach(F => { F.sw = false; F.lift = 0; F.u = F.u1; }); setPh('down'); }
            } else if (C.ph === 'dismount') {   // chúc đầu xuống đất, thân hạ ngang, đi ra xa gốc
              const e = ease(k / TM), Q = C.path; Tr.localToWorld(_a.copy(Q.n).multiplyScalar(Q.r0 + 0.5 / S).setY(0)); _a.y = cowY(_a.x, _a.z);
              _q.setFromAxisAngle(UP, Math.atan2(-C.path.nW.z, C.path.nW.x)); O.position.lerpVectors(C.p0, _a, e); O.quaternion.slerpQuaternions(C.q0, _q, e);
              C.feet.forEach((F, i) => { const kk = i < 2 ? ease(k / TM / 0.85) : ease((k / TM - 0.3) / 0.7); O.updateMatrixWorld(true); const hx = U.legs[i].hip.position.x, hz = U.legs[i].hip.position.z;
                _b.set(hx, 0, hz); O.localToWorld(_b); _b.y = cowY(_b.x, _b.z) + (U.legs[i].ankleH || 0) * W(); F.w.lerpVectors(C.g0[i], _b, kk).addScaledVector(UP, Math.sin(Math.PI * kk) * 0.05); footOut(F.w, F.u, i); F.pw = 1 - kk; });
              hT = HC * H0 + (H0 - HC * H0) * e; if (k >= TM + 0.05) { end(t); return; }
            }
            damp(P.h, hT, 8, dt); damp(P.pitch, pT, 8, dt); U.torso.position.y = P.h.x; U.torso.rotation.set(0, 0, P.pitch.x); U.fore.rotation.z = U.aft.rotation.z = 0;
            O.updateMatrixWorld(true); setFeetFree();
            // đầu: nhìn quả / theo đường; đuôi buông theo trọng lực (đuôi mềm)
            let hy = 0; if (look) { O.worldToLocal(_a.copy(look)); hy = cl(Math.atan2(-_a.z, Math.max(0.05, _a.x)), -0.9, 0.9); }
            damp(P.hp, headFree(headP - P.pitch.x * 0.85), 7, dt); damp(P.hy, hy, 6, dt); U.neck.rotation.set(0, P.hy.x * 0.6, P.hp.x * 0.7); U.head.rotation.set(0, P.hy.x * 0.4, P.hp.x * 0.3);
            rig.step(dt, 0, 0, 'walk', P.h.x, P.pitch.x, true);
            sample(C.u, _a, null, _t); const flipR = C.ph === 'down' && Math.abs(_t.y) > 0.55;   // xuống đoạn dốc chúc đầu: bàn chân sau quay ngược
            for (let i = 0; i < 4; i++) if (!(C.hold && i < 2) && !(C.ph === 'reach' && i === C.grabI)) pawFlat(i, i >= 2 && flipR, C.ph === 'mount' || C.ph === 'dismount' ? C.feet[i].pw : 1);
            holdApple(dt);
            for (const e of U.eyes) e.visible = nightFactor > 0.7;
            if (ctx.tail) updateSoftTail(ctx.tail, dt, 0.06 * Math.sin(t * 1.3), 0);
          }
          // ---- mỗi khung (kể cả lúc không trèo): đếm nhìn cận, lõi táo rơi, táo mọc lại ----
          function tick(dt, t) {
            C.t0 = t; C.cuT = closeUp() ? C.cuT + dt : 0;
            if (C.core) { const c = C.core, B = c.B; looseTick(B, dt, c.g); if (!c.rest && (B.rest || B.wet)) c.rest = t; if (c.rest && t - c.rest > 45) { c.g.visible = false; C.core = null; } }
            for (let i = C.eaten.length - 1; i >= 0; i--) if (t >= C.eaten[i].at && !(C.core && C.core.g === C.eaten[i].ap.g)) { respawn(C.eaten[i].ap); C.eaten.splice(i, 1); }
          }
          // ---- lưới cấm đường tới gốc (bấm cây lúc gấu mèo đứng bên kia khúc gỗ ⇒ đi thẳng, racAvoidLog đẩy ra, kẹt tới hết giờ). Cả bờ đông sông
          //  (hang, cây táo già) nằm trên nền san solar (padH) mà lưới chung ffBlocked cấm hết ⇒ bảng chung ở đây rỗng. Lưới riêng trong 30 m quanh cây (gấu
          //  mèo chỉ ra cây khi < 25 m): nước + vòng vật cản (obstacleCoords, r + 0,3 như lưới chung) + KHÚC GỖ CHẾT (< 1,1 m quanh trục — vòng đẩy racAvoidLog
          //  1,0 m) + ô cấm chung không phải nền san; ngoài cửa sổ cấm hết. Dựng 1 lần ----
          let navB = null;
          function navBlocked() {
            if (navB) return navB;
            navB = new Uint8Array(FF_N).fill(1); const c = Tr.position, R0 = 30, D = deadLog, ux = D.bx - D.ax, uz = D.bz - D.az, L2 = ux * ux + uz * uz;
            const i0 = Math.max(0, Math.floor(x2gi(c.x - R0))), i1 = Math.min(GX - 1, Math.ceil(x2gi(c.x + R0))), j0 = Math.max(0, Math.floor(z2gj(c.z - R0))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(c.z + R0)));
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
              const n = i + j * GX, x = wx(i), z = wz(j), k = cl(((x - D.ax) * ux + (z - D.az) * uz) / L2, 0, 1);
              navB[n] = isWater(i, j) || (ffBlocked[n] && padH(i, j) === null) || Math.hypot(D.ax + ux * k - x, D.az + uz * k - z) < 1.1 ? 1 : 0;
            }
            for (const ob of obstacleCoords) {
              const rr = ob.r + 0.3;
              for (let j = Math.max(j0, Math.floor(z2gj(ob.z - rr))); j <= Math.min(j1, Math.ceil(z2gj(ob.z + rr))); j++)
                for (let i = Math.max(i0, Math.floor(x2gi(ob.x - rr))); i <= Math.min(i1, Math.ceil(x2gi(ob.x + rr))); i++) if (Math.hypot(wx(i) - ob.x, wz(j) - ob.z) < rr) navB[i + j * GX] = 1;
            }
            return navB;
          }
          // ---- đi tới gốc (trạng thái 'toTree' của raccoonBrain): true = tới nơi ----
          function goal() {
            const Q = C.path; Tr.localToWorld(C.goal.copy(Q.n).multiplyScalar(Q.r0 + 0.3 / graph().S).setY(0)); C.goal.y = cowY(C.goal.x, C.goal.z);
            Q.nW = Q.n.clone().transformDirection(Tr.matrixWorld).setY(0).normalize(); if (!C.field) C.field = buildFlowField(C.goal.x, C.goal.z, navBlocked()); return C.goal;
          }
          return {
            C, tick, update, start, plan: () => { C.field = null; return plan(); }, goal, logAng: () => { const P0 = Tr.position, D = deadLog, ux = D.bx - D.ax, uz = D.bz - D.az, k = cl(((P0.x - D.ax) * ux + (P0.z - D.az) * uz) / (ux * ux + uz * uz), 0, 1); return Math.atan2(D.az + uz * k - P0.z, D.ax + ux * k - P0.x); }, closeUp: () => C.cuT, face: () => { const n = C.path.nW; return Math.atan2(n.z, -n.x); }   // face: hướng nhìn vào thân cây
          };
        }
