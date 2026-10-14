        // ===== GẤU MÈO: HÀNH VI + VẬN ĐỘNG (G 13/10: "research and improve racoon behaviour and movement") =====
        //  Tập tính (Procyon lotor): hoạt động CHẠNG VẠNG → ĐÊM, ban ngày ngủ trong hang (ở đây: khúc gỗ rỗng); kiếm ăn bằng mũi + TAY trước rất khéo
        //  (cào bới, lật đất, cầm thức ăn bằng 2 tay); hay ĐỨNG THẲNG trên 2 chân sau nhìn quanh khi nghe động; ngồi xổm ôm thức ăn mà gặm;
        //  bới được mồi (ấu trùng, giun) thì ngồi xổm 2 tay ôm mà gặm; gặp chó / người lại gần thì bỏ chạy về hang.
        //  (Hang khúc gỗ ở bờ bên kia sông, bờ cao ~4 m so với mặt nước ⇒ không sang trại, không ra mép nước "rửa" thức ăn được.) Mắt phản quang ban đêm (tapetum lucidum).
        //  Vận động: chân sau dài hơn chân trước ⇒ mông cao, lưng gù; đi tà tà, 2 chân cùng bên gần như cùng nhịp (gần kiểu "đi lạc đà") ⇒ thân lắc ngang;
        //  đi cả bàn chân; chạy nước kiệu khi vội; bỏ chạy thì phi nhảy (bound). Dùng chung bộ chân IK với chó (animals/quadruped.js).
        const raccoonBrain = (() => {
          const O = raccoonObj, U = O.userData, s = U.s, H0 = U.H0;
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _hp = new THREE.Vector3();
          const spr = x => ({ x, v: 0 });
          function damp(S, target, w, dt) { const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = S.x - target, tmp = (S.v + w * c) * dt; S.v = (S.v - w * tmp) * ex; S.x = target + (c + tmp) * ex; return S.x; }
          const yawOf = (dx, dz) => Math.atan2(-dz, dx), fwd = () => _b.set(Math.cos(O.rotation.y), 0, -Math.sin(O.rotation.y));
          const GAITS = {
            walk: { off: [0, 0.5, 0.08, 0.58], duty: 0.62, stride: 0.25, lift: 0.04, vRef: 0.6 },   // sải vừa tầm chân ngắn (chân trước 0,15): bước ngắn, nhanh — chân với tới, không trượt
            trot: { off: [0, 0.5, 0.5, 0], duty: 0.45, stride: 0.42, lift: 0.05, vRef: 1.2 },
            gallop: { off: [0.5, 0.56, 0, 0.06], duty: 0.3, stride: 0.7, lift: 0.07, vRef: 2.4 }
          };
          const P = { h: spr(H0), pitch: spr(-0.16), stand: spr(0), sit: spr(0), roll: spr(0), hp: spr(0), hy: spr(0), bank: spr(0), tp: spr(0), gy: null, yaw0: 0, turn: 0 };
          function homeLocal(L, out) {
            const hx = L.hip.position.x, hz = L.hip.position.z, st = P.stand.x, si = P.sit.x, n = Math.max(0, 1 - st - si);
            if (L.front) return out.set((hx + 0.01 * s) * n + 0.08 * s * (st + si), 0, hz);
            return out.set((hx - 0.01 * s) * n + (-0.01 * s) * st + 0.06 * s * si, 0, hz * (n + st + 1.2 * si));
          }
          const rig = quadRig(O, { legs: U.legs, gaits: GAITS, home: homeLocal, ground: (x, z) => cowY(x, z), size: 0.2, settleT: 0.18, settleLift: 0.03 });
          const tail = makeSoftTail(U.tailHost, { base: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(-1, -0.28, 0).normalize(), n: 6, len: 0.05 * s, w: 0.1 * s, mat: U.ringB, stiff: [0.3, 0.1] });
          tail.segs.forEach((m, i) => { m.material = i % 2 ? U.ringB : U.ringA; });   // đuôi khoanh đen–xám, ngọn đen
          // ---- trạng thái ----
          const B = { st: 'den', t: 0, k: 0, v: 0, want: 0, gait: 'walk', tgt: new THREE.Vector3(), has: false, mode: 'walk', look: null, headP: null, dig: 0, apple: null, n: 0, ate: '' };
          const active = () => { const hh = liveWeather.localHour; return !liveWeather.state.raining && ((hh >= 16.5 && hh < 22.5) || (hh >= 4.5 && hh < 7)); };
          const set = (st, t) => { B.st = st; B.k = 0; B.t = t || 0; B.has = false; };
          const randPt = () => { for (let k = 0; k < 12; k++) { const a = Math.random() * 6.2832, r = 2 + Math.random() * 6, x = racHome.x + Math.cos(a) * r, z = racHome.z + Math.sin(a) * r; if (isWater(Math.round(x2gi(x)), Math.round(z2gj(z))) || racAvoidLog(x, z) || obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3)) continue; return _a.set(x, 0, z).clone(); } return new THREE.Vector3(racApproach.x, 0, racApproach.z); };
          function steer(tx, tz, speed, dt, field, stopR = 0.1) {
            const p = O.position, dx = tx - p.x, dz = tz - p.z, dd = Math.hypot(dx, dz);
            if (dd < stopR) { B.want = 0; return true; }
            let ux = dx / dd, uz = dz / dd;
            if (field && dd > 1.4) { const f = ffDir(field, p.x, p.z); if (f) { ux = f.x; uz = f.z; } }
            const rep = (ox, oz, rr) => { const fx = p.x - ox, fz = p.z - oz, fd = Math.hypot(fx, fz); if (fd >= rr || fd < 1e-4) return; const k = (rr - fd) / rr; ux += fx / fd * k * 2.4 - fz / fd * k * 1.4; uz += fz / fd * k * 2.4 + fx / fd * k * 1.4; };
            for (const o of obstacleCoords) if (Math.hypot(tx - o.x, tz - o.z) > o.r + 0.5) rep(o.x, o.z, o.r + 0.25);
            rep(pf.x, pf.z, FIRE_AVOID_R * 0.7);
            const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
            let dy = yawOf(ux, uz) - O.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
            const mt = (B.v < 0.4 ? 2.6 : 2.2) * dt; O.rotation.y += Math.max(-mt, Math.min(mt, dy * Math.min(1, dt * 7)));   // quay ≤ 150°/giây: chân kịp bước theo
            B.want = speed * Math.max(0.25, Math.cos(dy)) * Math.min(1, 0.35 + dd / 0.6); return false;
          }
          function move(dt) {
            const acc = B.want > B.v ? 3.5 : 6; B.v += Math.max(-acc * dt, Math.min(acc * dt, B.want - B.v));
            if (B.v < 1e-3) { B.v = 0; return 0; }
            const f = fwd(), p = O.position; let nx = p.x + f.x * B.v * dt, nz = p.z + f.z * B.v * dt;
            const push = racAvoidLog(nx, nz); if (push) { nx = push[0]; nz = push[1]; }
            if (isWater(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { B.v = 0; return 0; }
            const d = Math.hypot(nx - p.x, nz - p.z); p.x = nx; p.z = nz; return d;
          }
          function threat() {   // chó đang ở ngoài trong 4 m · người đi tới trong 2,8 m
            const p = O.position;
            if (!dogRain.st && dogObj.position.distanceTo(p) < 4) return dogObj.position;
            if (engObj && !engObj.inVan && engObj.g.parent === scene && engObj.g.position.distanceTo(p) < 2.8) return engObj.g.position;
            return null;
          }
          function crawl(A, Bp, dur, dt, onGround) {   // trườn thẳng giữa 2 điểm theo kịch bản (trong lòng khúc gỗ / ra miệng gỗ)
            B.k += dt; const f = Math.min(1, B.k / dur), p = O.position;
            p.x = A.x + (Bp.x - A.x) * f; p.z = A.z + (Bp.z - A.z) * f; p.y = onGround ? cowY(p.x, p.z) : A.y + (Bp.y - A.y) * f;
            O.rotation.y = yawOf(Bp.x - A.x, Bp.z - A.z); B.v = (Math.hypot(Bp.x - A.x, Bp.z - A.z) / dur); B.want = B.v;
            return f >= 1;
          }
          function behave(dt, t) {
            const p = O.position, hh = liveWeather.localHour, th = B.st === 'den' || B.st === 'exit' || B.st === 'enter' ? null : threat();
            B.look = null; B.headP = null; B.dig = 0; B.mode = 'walk'; B.k += dt; B.t -= dt;
            if (th && !['flee', 'toMouth', 'enter', 'den', 'exit'].includes(B.st)) set('flee');
            if (!active() && ['forage', 'dig', 'stand', 'chase'].includes(B.st)) set('home');
            switch (B.st) {
              case 'den': O.visible = false; B.want = B.v = 0; if (active() && B.t <= 0) { set('exit'); O.visible = true; } return 0;
              case 'exit': if (crawl(racInside, racMouth, 4, dt, false)) set('out'); B.k += 0; return B.v * dt;
              case 'out': { const A = { x: racMouth.x, z: racMouth.z }, Bp = { x: racApproach.x, z: racApproach.z }; if (crawl(A, Bp, 3, dt, true)) set('stand', 2.5); return B.v * dt; }
              case 'toMouth': { const A = { x: racApproach.x, z: racApproach.z }, Bp = { x: racMouth.x, z: racMouth.z }; if (crawl(A, Bp, 2.4, dt, true)) set('enter'); return B.v * dt; }
              case 'enter': if (crawl(racMouth, racInside, 4, dt, false)) set('den', active() ? 40 + Math.random() * 60 : 0); return B.v * dt;
              case 'forage': {   // đi tà tà mũi sát đất; tới chỗ có mùi thì cào bới hoặc đứng lên nhìn quanh
                B.headP = -0.4;
                if (!B.has) { B.tgt.copy(randPt()); B.has = true; }
                if (steer(B.tgt.x, B.tgt.z, 0.6, dt, null, 0.25)) { if (Math.random() < 0.3) set('stand', 2 + Math.random() * 1.5); else set('dig', 2 + Math.random() * 2.5); }
                if (liveWeather.wildlifeAwake && t > (B.chaseCD || 0)) for (const bf of [...butterflies, ...bees]) if (bf.g.position.distanceTo(p) < 3 && bf.g.position.y - p.y < 1.2) { B.prey = bf; B.chaseCD = t + 25 + Math.random() * 15; set('chase', 3); break; }   // thỉnh thoảng vồ con bay thấp
                break;
              }
              case 'dig': {   // 2 tay trước cào đất luân phiên, mũi dí sát
                B.want = 0; B.mode = 'dig'; B.dig = 1; B.headP = -0.75;
                if (B.t <= 0) { B.n++; set(Math.random() < 0.45 ? 'eat' : B.n % 4 === 0 ? 'stand' : 'forage', 3 + Math.random() * 2); }   // bới được mồi thì ngồi ăn
                break;
              }
              case 'stand': {   // đứng thẳng 2 chân sau, tay buông trước ngực, ngó quanh
                B.want = 0; B.mode = 'stand'; B.headP = 0.1; B.look = engObj && !engObj.inVan ? _hp.copy(engObj.g.position).setY(engObj.g.position.y + 1) : null;
                if (B.t <= 0) set('forage');
                break;
              }
              case 'chase': {   // vồ ong bướm bay thấp (ban ngày / chạng vạng còn sâu bọ)
                const q = B.prey && B.prey.g.position; B.look = q;
                if (!q || B.t <= 0) { set('forage'); break; }
                steer(q.x, q.z, 1.5, dt, null, 0.3);
                if (q.distanceTo(p) < 1.1 && t >= (B.prey.scaredUntil || 0)) { B.prey.scaredUntil = t + 8; if (B.prey.state === 'foraging') { cancelBeeNectar(B.prey); pickBeeFlowerTarget(B.prey.pos, B.prey.target); B.prey.hoverTmr = 0; } else if (typeof nextButterflyTarget === 'function' && butterflies.includes(B.prey)) nextButterflyTarget(B.prey); B.pounce = 0.5; }
                break;
              }
              case 'eat': {   // ngồi xổm, 2 tay đưa mồi lên miệng gặm, đầu gật nhẹ theo nhịp nhai
                B.want = 0; B.mode = 'sit'; B.headP = -0.2 + 0.05 * Math.abs(Math.sin(t * 9));
                if (B.t <= 0) set('forage');
                break;
              }
              case 'flee': {   // bỏ chạy (phi nhảy) về cửa hang rồi chui vào
                if (steer(racApproach.x, racApproach.z, 2.6, dt, racField, 0.35)) set('toMouth');
                break;
              }
              case 'home': {
                if (steer(racApproach.x, racApproach.z, 1.0, dt, racField, 0.35)) set('toMouth');
                break;
              }
            }
            return move(dt);
          }
          // khởi động: đang giờ hoạt động thì đã ở ngoài kiếm ăn
          if (active()) { O.visible = true; O.position.set(racApproach.x, cowY(racApproach.x, racApproach.z), racApproach.z); set('forage'); } else set('den');
          return {
            update(dt, t) {
              dt = Math.min(dt, 0.05);
              const dist = behave(dt, t), inLog = B.st === 'exit' || B.st === 'enter';
              if (!O.visible) return;
              const sp = B.v;
              if (B.gait === 'walk' && sp > 0.95) B.gait = 'trot'; else if (B.gait === 'trot' && sp < 0.75) B.gait = 'walk'; else if (B.gait === 'trot' && sp > 2.1) B.gait = 'gallop'; else if (B.gait === 'gallop' && sp < 1.8) B.gait = 'trot';
              if (!inLog) {   // thân theo chỗ chân đứng: đất TB dưới 2 chân trước / 2 chân sau → độ cao + chúc/ngóc (lên bậc: chân trước lên trước, thân ngóc dần) — không nhảy bậc
                const yF = (rig.support(0) + rig.support(1)) / 2, yH = (rig.support(2) + rig.support(3)) / 2, ref = cowY(O.position.x, O.position.z), gy = Math.abs((yF + yH) / 2 - ref) < 1.5 ? (yF + yH) / 2 : ref;   // chân chưa đặt (vừa ra khỏi hang) ⇒ lấy đất tại chỗ
                if (!P.gy || Math.abs(P.gy.x - gy) > 1.5) P.gy = spr(gy);
                O.position.y = damp(P.gy, gy, 9, dt);
                damp(P.tp, Math.max(-0.45, Math.min(0.45, Math.atan2(yF - yH, 0.27 * s * O.scale.y))), 7, dt);
              } else { P.gy = null; P.tp.x = P.tp.v = 0; }
              if (B.pounce > 0) { B.pounce -= dt; O.position.y += Math.sin(Math.max(0, Math.min(1, (0.5 - B.pounce) / 0.5)) * Math.PI) * 0.35; }
              // dáng: lưng gù (mông cao) khi đi · đứng 2 chân · ngồi xổm ăn
              const stT = B.mode === 'stand' ? 1 : 0, siT = B.mode === 'sit' ? 1 : 0, psi = rig.psi;
              damp(P.stand, stT, 5, dt); damp(P.sit, siT, 5, dt);
              const pitchT = -0.16 * (1 - stT - siT) + 1.25 * stT + 0.95 * siT + (B.mode === 'dig' ? -0.18 : 0) + (B.gait === 'gallop' && sp > 0.1 ? 0.15 * Math.cos(2 * Math.PI * psi) : 0);
              const crouch = (B.gait === 'walk' ? 0.016 : 0.026) * s * Math.min(1, sp / 0.3) * (1 - stT - siT);   // đi khom thấp (dáng gù của gấu mèo) ⇒ chân đủ với tới điểm đặt, bàn chân trụ không trượt
              const hT = H0 * (1 - stT - siT) + 0.325 * s * stT + 0.205 * s * siT - (B.mode === 'dig' ? 0.03 * s : 0) - crouch + (sp > 0.1 && B.gait === 'gallop' ? 0.025 * s * Math.sin(2 * Math.PI * psi) : 0);
              const bob = sp > 0.06 && B.gait !== 'gallop' ? 0.007 * s * Math.cos(4 * Math.PI * psi) : 0;   // nảy 2 lần/chu kỳ khi đi / kiệu (con lắc ngược)
              damp(P.pitch, pitchT + P.tp.x, 8, dt); damp(P.h, hT + bob, 8, dt);
              U.torso.position.y = P.h.x; U.torso.rotation.z = P.pitch.x;
              damp(P.roll, sp > 0.05 && B.gait === 'walk' ? 0.07 * Math.sin(2 * Math.PI * psi) : 0, 12, dt);   // lắc ngang khi đi tà tà (2 chân cùng bên gần cùng nhịp)
              let yr = O.rotation.y - P.yaw0; yr = Math.atan2(Math.sin(yr), Math.cos(yr)); P.yaw0 = O.rotation.y; P.turn += (yr / Math.max(dt, 1e-3) - P.turn) * Math.min(1, dt * 6);
              damp(P.bank, Math.max(-0.16, Math.min(0.16, -P.turn * sp * 0.06)), 8, dt); U.torso.rotation.x = P.roll.x + P.bank.x;   // nghiêng vào khúc cua khi chạy (như chó)
              // tay: đứng thì buông trước ngực · cào đất luân phiên · ôm táo trước miệng
              const free = rig.free, hipF = U.legs[0].hip.position, pc = Math.cos(P.pitch.x), ps = Math.sin(P.pitch.x);
              const shX = hipF.x * pc - hipF.y * ps, shY = P.h.x + hipF.x * ps + hipF.y * pc;
              for (let i = 0; i < 2; i++) {
                const sd = i ? -1 : 1;
                if (B.mode === 'stand' && P.stand.x > 0.5) free[i] = (free[i] || new THREE.Vector3()).set(shX + 0.06 * s, shY - 0.11 * s, sd * 0.06 * s);
                else if (B.mode === 'sit' && P.sit.x > 0.5) free[i] = (free[i] || new THREE.Vector3()).set(shX + 0.09 * s, shY + 0.02 * s + 0.012 * s * Math.sin(t * 9), sd * 0.03 * s);   // 2 tay ôm mồi trước miệng
                else if (B.mode === 'dig') { const ph = t * 9 + i * Math.PI; free[i] = (free[i] || new THREE.Vector3()).set(0.2 * s + 0.04 * s * Math.sin(ph), 0.015 * s + 0.03 * s * Math.max(0, Math.cos(ph)), sd * 0.07 * s); }
                else free[i] = null;
              }
              // đầu: nhìn đích / cúi mũi; giữ gần ngang khi thân dựng
              let hp = B.headP != null ? B.headP : 0, hy = 0;
              if (B.look) { O.worldToLocal(_a.copy(B.look)); hy = Math.max(-0.9, Math.min(0.9, Math.atan2(-_a.z, Math.max(0.05, _a.x)))); }
              if (sp > 0.06 && B.gait === 'walk') hp += 0.05 * Math.cos(4 * Math.PI * psi);   // đầu nhấp theo nhịp chân trước
              hp -= P.pitch.x * 0.85; damp(P.hp, hp, 7, dt); damp(P.hy, hy + (B.mode === 'dig' ? 0.2 * Math.sin(t * 6) : 0), 6, dt);
              U.neck.rotation.set(0, P.hy.x * 0.6, P.hp.x * 0.7); U.head.rotation.set(0, P.hy.x * 0.4, P.hp.x * 0.3);
              U.ears.forEach((ep, i) => { ep.rotation.z = -Math.min(0.5, sp * 0.18); });
              rig.step(dt, dist, sp, B.gait, P.h.x, P.pitch.x, P.stand.x + P.sit.x > 0.05);
              for (const e of U.eyes) e.visible = nightFactor > 0.7;   // mắt phản quang khi trời tối
              updateSoftTail(tail, dt, sp > 0.05 ? 0.12 * Math.sin(2 * Math.PI * psi) : 0, 0);
            },
            state: B, rig
          };
        })();
