        // ===== GẤU MÈO TRÈO CÂY TÁO HÁI ĂN (G 24/10 khuya "study and research gấu mèo behaviour, và add thêm trèo cây hái táo ăn khi close up view nhìn gấu mèo") =====
        //  Tập tính: trèo rất giỏi (vuốt không thu, chi trước khoẻ), ban đêm hay trèo cây ăn quả (táo); xuống cây thường CHÚC ĐẦU nhờ xoay bàn chân sau ~180°;
        //  tay trước rất nhạy nhưng không có ngón cái đối ⇒ ôm thức ăn bằng 2 tay, gặm từng miếng nhỏ; gặp nguy thì ở yên trên cây (không bỏ chạy xuống).
        //  Kịch bản (chỉ khi người xem ZOOM CẬN nhìn gấu mèo ≥ 1,5 s — con vật dài ≥ 80 điểm ảnh, nằm trong khung): tới gốc cây táo già cạnh hang (appleTrees[2])
        //  → bám lên thân (thân dựng dần thẳng đứng, 2 tay lên trước) → trèo thân (4 chân bám vỏ, nhịp chân lần lượt) → qua mép ngọn thân vào chạc → men lên cành
        //  (lưng theo mặt trên cành, chân khép theo cỡ cành) → dừng sát quả, thò 1 tay vặt → ngồi trên cành 2 tay ôm táo gặm (quả nhỏ dần) → thả lõi rơi →
        //  quay đầu, xuống cành, xuống thân CHÚC ĐẦU (bàn chân sau quay ngược) → xuống đất đi tiếp. Quả mọc lại sau 25 phút.
        //  Đường trèo = dãy điểm MẶT VỎ trong hệ cây (thân: chiếu tia vào vỏ thật ở mặt đã chọn; cành: đường tâm + bán kính theo userData.limbs), làm mượt Chaikin.
        //  Bàn chân bám = (tham số đường, lệch ngang) giữ cố định khi trụ ⇒ không trượt; IK bằng rig.free (toạ độ gấu mèo). Gọi từ animals/raccoon-brain.js ----
        function makeRaccoonClimb(ctx) {   // ctx: B (trạng thái), rig, P (lò xo dáng), damp, tail, set, H0
          const Tr = appleTrees[2], O = raccoonObj, U = O.userData, s = U.s, { B, rig, P, damp } = ctx;
          const UP = new THREE.Vector3(0, 1, 0), RMIN = 0.02, REACH = 0.3, STRIDE = 0.17, DUTY = 0.62, OFF = [0, 0.5, 0.72, 0.22], V_UP = 0.3, V_BR = 0.26, V_DN = 0.26, RESPAWN = 25 * 60;   // RMIN: cành mảnh nhất đi được (bán kính, m)
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _n = new THREE.Vector3(), _t = new THREE.Vector3(), _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
          const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _q2 = new THREE.Quaternion(), ray = new THREE.Raycaster(); ray.layers.enableAll();
          const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); }, cl = (x, a, b) => Math.max(a, Math.min(b, x));
          const C = { on: false, ph: '', k: 0, u: 0, dir: 1, path: null, ap: null, hold: false, grabI: 0, feet: [0, 1, 2, 3].map(() => ({ u: 0, sw: false, u0: 0, u1: 0, lift: 0, w: new THREE.Vector3() })), psi: 0, cuT: 0, core: null, eaten: [], p0: new THREE.Vector3(), q0: new THREE.Quaternion(), g0: [0, 1, 2, 3].map(() => new THREE.Vector3()), field: null, goal: new THREE.Vector3(), bite: 1, t0: 0 };
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
            const barks = []; Tr.traverse(o => { if (!o.isMesh || o.isInstancedMesh) return; for (let p = o; p && p !== Tr; p = p.parent) if (p.name === 'Quả táo') return; barks.push(o); });
            const fruit = Tr.children.find(o => o.name === 'Quả táo');
            return (G = { segs, pred, trunk, top, from, len, barks, fruit, S: Tr.scale.x });
          }
          const vec = (g, o) => new THREE.Vector3(g[o], g[o + 1], g[o + 2]);
          function logSide() {   // hướng từ thân cây tới trục khúc gỗ chết (hệ cây) — mặt trèo tránh phía này
            const D = deadLog, P0 = Tr.position, ux = D.bx - D.ax, uz = D.bz - D.az; let k = ((P0.x - D.ax) * ux + (P0.z - D.az) * uz) / (ux * ux + uz * uz); k = cl(k, 0, 1);
            _a.set(D.ax + ux * k - P0.x, 0, D.az + uz * k - P0.z).normalize().applyAxisAngle(UP, -Tr.rotation.y); return _a.clone();
          }
          // ---- chọn quả: cành đủ to (bán kính ≥ 2 cm) có điểm cách quả ≤ 30 cm; ưu tiên quả RÌA TÁN (xa trục thân — người xem nhìn cận thấy rõ, quả sát thân bị lá
          //  dày che): điểm = 0,5 × quãng cành từ chạc + 3 × khoảng với − 1,5 × khoảng cách ngang tới trục thân (tính tới 3,2 m) ----
          function plan() {
            const g = graph(), S = g.S, apples = Tr.userData.apples; let best = null;
            for (const ap of apples) {
              if (!ap.on || ap.raccoon) continue; const p = ap.home;
              for (let j = 0; j < g.segs.length; j++) {
                const sg = g.segs[j]; if (g.trunk.includes(j) || Math.min(sg[6], sg[7]) * S < RMIN) continue;
                const ax = sg[0], ay = sg[1], az = sg[2], dx = sg[3] - ax, dy = sg[4] - ay, dz = sg[5] - az, L2 = dx * dx + dy * dy + dz * dz;
                const k = cl(((p.x - ax) * dx + (p.y - ay) * dy + (p.z - az) * dz) / L2, 0, 1), d = Math.hypot(ax + dx * k - p.x, ay + dy * k - p.y, az + dz * k - p.z) * S;
                if (d > REACH) continue; const sc = 0.5 * (g.from(j) + Math.sqrt(L2) * k) * S + 3 * d - 1.5 * Math.min(3.2, Math.hypot(p.x, p.z) * S);
                if (!best || sc < best.sc) best = { sc, ap, j, k };
              }
            }
            if (!best) return false;
            C.ap = best.ap; C.path = buildPath(best.j, best.k); return true;
          }
          function trunkSurf(n, h) {   // điểm mặt vỏ thân ở độ cao h, phía n (hệ cây): chiếu tia ngang vào vỏ thật
            const g = graph(); Tr.localToWorld(_a.copy(n).multiplyScalar(3).setY(h)); _b.copy(n).negate().transformDirection(Tr.matrixWorld);
            ray.set(_a, _b); const hit = ray.intersectObjects(g.barks, false)[0];
            return hit ? Tr.worldToLocal(hit.point.clone()) : n.clone().multiplyScalar(0.3).setY(h);
          }
          function buildPath(j, kq) {
            const g = graph(), segs = g.segs, S = g.S, chain = []; for (let i = j; i >= 0 && i !== g.top; i = g.pred[i]) chain.unshift(i);
            const fork = vec(segs[g.top], 3), hTop = fork.y, f0 = segs[chain[0]];
            const n = new THREE.Vector3(f0[3] - f0[0], 0, f0[5] - f0[2]); if (n.lengthSq() < 1e-6) n.set(1, 0, 0); n.normalize();
            const lg = logSide(), ang = Math.atan2(n.x * lg.z - n.z * lg.x, n.dot(lg)), MIN = 1.25;   // ≥ 72° khỏi khúc gỗ
            if (Math.abs(ang) < MIN) n.copy(lg).applyAxisAngle(UP, -(ang >= 0 ? MIN : -MIN)).normalize();
            const Pp = [], Nn = [], Rr = [];
            for (let h = 0.04; h <= hTop - 0.32; h += 0.12) { Pp.push(trunkSurf(n, h)); Nn.push(n.clone()); Rr.push(9); }
            Pp.push(fork.clone().addScaledVector(n, 0.17).setY(hTop - 0.05)); Nn.push(n.clone().add(UP).normalize()); Rr.push(9);   // mép ngọn thân
            Pp.push(fork.clone().setY(hTop + 0.03)); Nn.push(UP.clone()); Rr.push(9);   // lòng chạc
            chain.forEach((ci, idx) => {
              const sg = segs[ci], a = vec(sg, 0), b0 = vec(sg, 3), last = idx === chain.length - 1, b = last ? a.clone().lerp(b0, kq) : b0;
              _t.subVectors(b, a); if (_t.lengthSq() < 1e-8) return; _t.normalize();
              const up = UP.clone().addScaledVector(_t, -_t.y); if (up.lengthSq() < 0.02) up.copy(n); up.normalize();
              for (const f of [0.5, 1]) { const r = sg[6] + (sg[7] - sg[6]) * (last ? f * kq : f); Pp.push(a.clone().lerp(b, f).addScaledVector(up, r)); Nn.push(up.clone()); Rr.push(r * S); }
            });
            for (let it = 0; it < 2; it++) {   // Chaikin: bo góc (giữ 2 đầu)
              const P2 = [Pp[0]], N2 = [Nn[0]], R2 = [Rr[0]];
              for (let i = 0; i < Pp.length - 1; i++) for (const w of [0.25, 0.75]) { P2.push(Pp[i].clone().lerp(Pp[i + 1], w)); N2.push(Nn[i].clone().lerp(Nn[i + 1], w).normalize()); R2.push(Rr[i] + (Rr[i + 1] - Rr[i]) * w); }
              P2.push(Pp[Pp.length - 1]); N2.push(Nn[Nn.length - 1]); R2.push(Rr[Rr.length - 1]); Pp.length = 0; Nn.length = 0; Rr.length = 0; Pp.push(...P2); Nn.push(...N2); Rr.push(...R2);
            }
            const L = [0]; for (let i = 1; i < Pp.length; i++) L.push(L[i - 1] + Pp[i].distanceTo(Pp[i - 1]));
            const Tg = Pp.map((p, i) => Pp[Math.min(Pp.length - 1, i + 1)].clone().sub(Pp[Math.max(0, i - 1)]).normalize());
            let iTop = 0; while (iTop < Pp.length - 1 && Pp[iTop].y < hTop - 0.3) iTop++;
            const total = L[L.length - 1], uStart = (() => { let i = 0; while (i < Pp.length - 1 && Pp[i].y < 0.42 / S) i++; return L[i]; })();
            return { P: Pp, N: Nn, R: Rr, L, Tg, total, uTrunk: L[iTop], uStart, uEnd: Math.max(uStart + 0.5, total - 0.2 / S), n, r0: Math.hypot(Pp[0].x, Pp[0].z) };
          }
          function sample(u, oP, oN, oT, oR) {   // tham số đường (đv cây) → điểm mặt vỏ, pháp tuyến, tiếp tuyến (THẾ GIỚI), bán kính cành (m)
            const Q = C.path, L = Q.L; u = cl(u, 0, Q.total); let lo = 0, hi = L.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L[m] <= u) lo = m; else hi = m; }
            const f = (u - L[lo]) / Math.max(1e-6, L[hi] - L[lo]);
            oP.lerpVectors(Q.P[lo], Q.P[hi], f); Tr.localToWorld(oP);
            if (oN) oN.lerpVectors(Q.N[lo], Q.N[hi], f).transformDirection(Tr.matrixWorld);
            if (oT) oT.lerpVectors(Q.Tg[lo], Q.Tg[hi], f).transformDirection(Tr.matrixWorld);
            return oR ? Q.R[lo] + (Q.R[hi] - Q.R[lo]) * f : 0;
          }
          function frame(u, dir, oP, oQ) {   // thân trên vỏ: x = hướng đi theo đường, y = pháp tuyến vỏ
            sample(u, oP, _n, _t); _x.copy(_t).multiplyScalar(dir); _y.copy(_n).addScaledVector(_x, -_n.dot(_x)).normalize(); _z.crossVectors(_x, _y);
            return oQ.setFromRotationMatrix(_m.makeBasis(_x, _y, _z));
          }
          const W = () => O.scale.x, hipU = i => U.legs[i].hip.position.x * W() / graph().S, side = i => Math.sign(U.legs[i].hip.position.z) || 1;
          function footW(i, u, lift, out) {   // điểm bám bàn chân i ở tham số u (thế giới) + cổ chân nhô khỏi vỏ
            const R = sample(u, out, _n, _t, true), lat = side(i) * Math.min(0.055, 0.75 * R), drop = R > Math.abs(lat) ? R - Math.sqrt(R * R - lat * lat) : 0;
            _z.crossVectors(_t.multiplyScalar(C.dir), _n).normalize();
            return out.addScaledVector(_z, lat).addScaledVector(_n, (U.legs[i].ankleH || 0) * W() - drop + lift);
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
          function pawFlat(i, flip) {   // bàn chân áp phẳng mặt vỏ (theo IK) — flip: bàn chân sau quay ngược khi xuống chúc đầu
            const L = U.legs[i], c = L.hip.rotation.z + U.torso.rotation.z + L.knee.rotation.z;
            if (flip) L.paw.rotation.set(0, Math.PI, c); else L.paw.rotation.set(0, 0, -c);
          }
          function holdApple() {   // táo giữa 2 bàn tay trước (hơi nhô ra trước)
            if (!C.hold || !C.ap) return; const A = C.ap.g;
            U.legs[0].paw.getWorldPosition(_a); U.legs[1].paw.getWorldPosition(_b); A.position.lerpVectors(_a, _b, C.ph === 'reach' ? (C.grabI ? 1 : 0) : 0.5);
            A.scale.setScalar(C.bite); A.rotation.y += 0.01;
          }
          function grab() { const A = C.ap.g; scene.attach(A); C.hold = true; C.ap.raccoon = true; C.ap.on = false; C.bite = 1; }
          function dropCore() {   // thả lõi táo rơi xuống đất
            C.hold = false; C.core = { g: C.ap.g, v: new THREE.Vector3((Math.random() - 0.5) * 0.4, 0.4, (Math.random() - 0.5) * 0.4), rest: 0 };
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
          }
          function end(t) {   // xuống tới đất: trả gấu mèo về dáng đi đất
            C.on = false; rig.free.fill(null); U.legs.forEach(L => L.paw.rotation.set(0, 0, 0)); const yaw = Math.atan2(-C.path.nW.z, C.path.nW.x);
            O.quaternion.identity(); O.rotation.set(0, yaw, 0); O.position.y = cowY(O.position.x, O.position.z); P.gy = null; rig.reset();
            B.climbCD = t + 90; ctx.set('forage');
          }
          // ---- mỗi khung khi đang trèo (thay phần dáng đi đất của raccoonBrain.update) ----
          function update(dt, t) {
            C.t0 = t; C.k += dt; const k = C.k, S = graph().S, H0 = ctx.H0;
            let hT = 0.72 * H0, pT = 0, look = null, headP = 0;
            if (C.ph === 'mount') {   // dựng thân lên thân cây: tay trước bám trước, chân sau rời đất sau
              const e = ease(k / 1.1); frame(C.u, 1, _a, _q); O.position.lerpVectors(C.p0, _a, e); O.quaternion.slerpQuaternions(C.q0, _q, e);
              C.feet.forEach((F, i) => { const kk = i < 2 ? ease(k / 0.65) : ease((k - 0.45) / 0.65); footW(i, F.u, 0, _b); F.w.lerpVectors(C.g0[i], _b, kk).addScaledVector(_n.set(0, 1, 0), Math.sin(Math.PI * kk) * 0.06); });
              hT = H0 + (0.72 * H0 - H0) * e; if (k >= 1.1) setPh('up');
            } else if (C.ph === 'up' || C.ph === 'down') {
              const Q = C.path, v = C.ph === 'down' ? V_DN : (C.u < Q.uTrunk ? V_UP : V_BR), du = C.dir * v * dt / S;
              C.u = cl(C.u + du, Q.uStart, Q.uEnd); gait(du); frame(C.u, C.dir, O.position, _q); O.quaternion.slerp(_q, Math.min(1, dt * 12));
              C.feet.forEach((F, i) => footW(i, F.u, F.lift, F.w));
              look = C.ph === 'up' && C.ap ? C.ap.g.getWorldPosition(_c).clone() : null; headP = C.ph === 'down' ? 0.25 : 0.1;
              if (C.ph === 'up' && C.u >= Q.uEnd - 1e-4) setPh('reach');
              if (C.ph === 'down' && C.u <= Q.uStart + 1e-4) { setPh('dismount'); C.p0.copy(O.position); C.q0.copy(O.quaternion); C.feet.forEach((F, i) => C.g0[i].copy(F.w)); }
            } else if (C.ph === 'reach') {   // thò tay gần quả nhất ra vặt
              settle(dt); frame(C.u, 1, O.position, _q); O.quaternion.slerp(_q, Math.min(1, dt * 10)); C.feet.forEach((F, i) => footW(i, F.u, F.lift, F.w));
              const ap = C.ap.g.getWorldPosition(_c); if (k < dt * 1.5) C.grabI = O.worldToLocal(_a.copy(ap)).z * side(0) > 0 ? 0 : 1;
              const i = C.grabI, kk = ease(k / 0.6); C.feet[i].w.lerp(ap, kk); look = ap.clone(); headP = -0.2;
              if (k >= 0.6 && !C.hold) grab();
              if (k >= 1.0) setPh('sit');
            } else if (C.ph === 'sit' || C.ph === 'eat') {   // ngồi trên cành, 2 tay ôm táo trước miệng gặm
              sample(C.path.uEnd, _a, _n, _t); _x.copy(_t).setY(0); if (_x.lengthSq() < 1e-4) _x.copy(C.path.nW); _x.normalize(); _z.crossVectors(_x, UP);
              _q.setFromRotationMatrix(_m.makeBasis(_x, UP, _z)); O.position.lerp(_a, Math.min(1, dt * 6)); O.quaternion.slerp(_q, Math.min(1, dt * (C.ph === 'sit' ? 3 : 8)));
              hT = 0.205 * s; pT = 0.95;
              for (const i of [2, 3]) footW(i, C.feet[i].u, 0, C.feet[i].w);
              const hipF = U.legs[0].hip.position, pc = Math.cos(P.pitch.x), ps = Math.sin(P.pitch.x), shX = hipF.x * pc - hipF.y * ps, shY = P.h.x + hipF.x * ps + hipF.y * pc;
              for (const i of [0, 1]) { const sd = side(i); O.localToWorld(C.feet[i].w.set(shX + 0.09 * s, shY + 0.02 * s + (C.ph === 'eat' ? 0.012 * s * Math.sin(t * 9) : 0), sd * 0.03 * s)); }
              headP = -0.2 + (C.ph === 'eat' ? 0.06 * Math.abs(Math.sin(t * 8)) : 0);
              if (C.ph === 'sit' && k >= 0.9) setPh('eat');
              if (C.ph === 'eat') { C.bite = Math.max(0.32, 1 - 0.68 * Math.floor(k / 1.6) / 7); if (k >= 12) { dropCore(); setPh('turn'); C.dir = -1; C.feet.forEach((F, i) => { F.sw = true; F.k = -i * 0.18; F.u0 = F.u; F.u1 = C.u - hipU(i); C.g0[i].copy(F.w); }); } }
            } else if (C.ph === 'turn') {   // quay đầu trên cành: dáng ngồi → bám cành chúc đầu về phía thân
              frame(C.u, -1, _a, _q); O.position.lerp(_a, Math.min(1, dt * 6)); O.quaternion.slerp(_q, Math.min(1, dt * 3.5));
              C.feet.forEach((F, i) => { F.k += dt / 0.35; const kk = ease(F.k); F.u = F.u0 + (F.u1 - F.u0) * kk; footW(i, F.u, Math.sin(Math.PI * cl(F.k, 0, 1)) * 0.04, _b); F.w.lerpVectors(C.g0[i], _b, kk); if (F.k >= 1) F.sw = false; });   // từ chỗ cũ (tay đang ôm táo) về chỗ bám mới
              if (k >= 1.5) { C.feet.forEach(F => { F.sw = false; F.lift = 0; }); setPh('down'); }
            } else if (C.ph === 'dismount') {   // chúc đầu xuống đất, thân hạ ngang, đi ra xa gốc
              const e = ease(k / 1.2), Q = C.path; Tr.localToWorld(_a.copy(Q.n).multiplyScalar(Q.r0 + 0.5 / S).setY(0)); _a.y = cowY(_a.x, _a.z);
              _q.setFromAxisAngle(UP, Math.atan2(-C.path.nW.z, C.path.nW.x)); O.position.lerpVectors(C.p0, _a, e); O.quaternion.slerpQuaternions(C.q0, _q, e);
              C.feet.forEach((F, i) => { const kk = i < 2 ? ease(k / 0.7) : ease((k - 0.5) / 0.7); O.updateMatrixWorld(true); const hx = U.legs[i].hip.position.x, hz = U.legs[i].hip.position.z;
                _b.set(hx, 0, hz); O.localToWorld(_b); _b.y = cowY(_b.x, _b.z) + (U.legs[i].ankleH || 0) * W(); F.w.lerpVectors(C.g0[i], _b, kk).addScaledVector(UP, Math.sin(Math.PI * kk) * 0.05); });
              hT = 0.72 * H0 + (H0 - 0.72 * H0) * e; if (k >= 1.25) { end(t); return; }
            }
            damp(P.h, hT, 8, dt); damp(P.pitch, pT, 8, dt); U.torso.position.y = P.h.x; U.torso.rotation.set(0, 0, P.pitch.x); U.fore.rotation.z = U.aft.rotation.z = 0;
            O.updateMatrixWorld(true); setFeetFree();
            // đầu: nhìn quả / theo đường; đuôi buông theo trọng lực (đuôi mềm)
            let hy = 0; if (look) { O.worldToLocal(_a.copy(look)); hy = cl(Math.atan2(-_a.z, Math.max(0.05, _a.x)), -0.9, 0.9); }
            damp(P.hp, headP - P.pitch.x * 0.85, 7, dt); damp(P.hy, hy, 6, dt); U.neck.rotation.set(0, P.hy.x * 0.6, P.hp.x * 0.7); U.head.rotation.set(0, P.hy.x * 0.4, P.hp.x * 0.3);
            rig.step(dt, 0, 0, 'walk', P.h.x, P.pitch.x, true);
            sample(C.u, _a, null, _t); const flipR = C.ph === 'down' && Math.abs(_t.y) > 0.55;   // xuống đoạn dốc chúc đầu: bàn chân sau quay ngược
            for (let i = 0; i < 4; i++) if (!(C.hold && i < 2) && !(C.ph === 'reach' && i === C.grabI)) pawFlat(i, i >= 2 && flipR);
            holdApple();
            for (const e of U.eyes) e.visible = nightFactor > 0.7;
            if (ctx.tail) updateSoftTail(ctx.tail, dt, 0.06 * Math.sin(t * 1.3), 0);
          }
          // ---- mỗi khung (kể cả lúc không trèo): đếm nhìn cận, lõi táo rơi, táo mọc lại ----
          function tick(dt, t) {
            C.t0 = t; C.cuT = closeUp() ? C.cuT + dt : 0;
            if (C.core) { const c = C.core, g = c.g; if (!c.rest) { c.v.y -= 9.8 * dt; g.position.addScaledVector(c.v, dt); g.rotation.x += dt * 6; const gy = cowY(g.position.x, g.position.z) + 0.03; if (g.position.y <= gy) { g.position.y = gy; c.rest = t; } } else if (t - c.rest > 45) { g.visible = false; C.core = null; } }
            for (let i = C.eaten.length - 1; i >= 0; i--) if (t >= C.eaten[i].at && !(C.core && C.core.g === C.eaten[i].ap.g)) { respawn(C.eaten[i].ap); C.eaten.splice(i, 1); }
          }
          // ---- đi tới gốc (trạng thái 'toTree' của raccoonBrain): true = tới nơi ----
          function goal() {
            const Q = C.path; Tr.localToWorld(C.goal.copy(Q.n).multiplyScalar(Q.r0 + 0.3 / graph().S).setY(0)); C.goal.y = cowY(C.goal.x, C.goal.z);
            Q.nW = Q.n.clone().transformDirection(Tr.matrixWorld).setY(0).normalize(); if (!C.field) C.field = buildFlowField(C.goal.x, C.goal.z); return C.goal;
          }
          return {
            C, tick, update, start, plan: () => { C.field = null; return plan(); }, goal, logAng: () => { const P0 = Tr.position, D = deadLog, ux = D.bx - D.ax, uz = D.bz - D.az, k = cl(((P0.x - D.ax) * ux + (P0.z - D.az) * uz) / (ux * ux + uz * uz), 0, 1); return Math.atan2(D.az + uz * k - P0.z, D.ax + ux * k - P0.x); }, closeUp: () => C.cuT, face: () => { const n = C.path.nW; return Math.atan2(n.z, -n.x); }   // face: hướng nhìn vào thân cây
          };
        }
