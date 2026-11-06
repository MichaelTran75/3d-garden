        // ===== GẤU MÈO: HÀNH VI + VẬN ĐỘNG (G 13/10: "research and improve racoon behaviour and movement") =====
        //  Tập tính (Procyon lotor): hoạt động CHẠNG VẠNG → ĐÊM, ban ngày ngủ trong hang (ở đây: khúc gỗ rỗng); kiếm ăn bằng mũi + TAY trước rất khéo
        //  (cào bới, lật đất, cầm thức ăn bằng 2 tay); hay ĐỨNG THẲNG trên 2 chân sau nhìn quanh khi nghe động; ngồi xổm ôm thức ăn mà gặm;
        //  bới được mồi (ấu trùng, giun) thì ngồi xổm 2 tay ôm mà gặm; gặp chó / người lại gần thì bỏ chạy về hang.
        //  (Hang khúc gỗ ở bờ bên kia sông, bờ cao ~4 m so với mặt nước ⇒ không sang trại, không ra mép nước "rửa" thức ăn được.) Mắt phản quang ban đêm (tapetum lucidum).
        //  Vận động: chân sau dài hơn chân trước ⇒ mông cao, lưng gù; đi tà tà, 2 chân cùng bên gần như cùng nhịp (gần kiểu "đi lạc đà") ⇒ thân lắc ngang;
        //  đi cả bàn chân; chạy nước kiệu khi vội; bỏ chạy thì phi nhảy (bound). Dùng chung bộ chân IK với chó (animals/_lib/quadruped.js).
        const racField = buildFlowField(racApproach.x, racApproach.z);   // bảng đường về điểm trước hang (dời từ engineer/body/seats.js 01/11)
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
          const tail = makeSoftTail(U.tailHost, { base: new THREE.Vector3(0, 0, 0), dir: new THREE.Vector3(-1, -0.2, 0).normalize(), n: 7, len: 0.046 * s, w: 0.12 * s, mat: U.ringB, stiff: [0.3, 0.1] });
          tail.segs.forEach((m, i) => { m.material = i % 2 || i === tail.segs.length - 1 ? U.ringA : U.ringB; });   // đuôi rậm 7 khoanh đen–xám, ngọn đen (theo mẫu)
          // ---- trạng thái ----
          const B = { st: 'den', t: 0, k: 0, v: 0, want: 0, gait: 'walk', tgt: new THREE.Vector3(), has: false, mode: 'walk', look: null, headP: null, dig: 0, apple: null, n: 0, ate: '', fled: false, call: 0 };   // fled: đang chạy trốn ⇒ bò vào hang nhanh · call: hạn chót đi trèo cây khi người xem bấm cây táo già
          const active = () => { const hh = liveWeather.localHour; return !liveWeather.state.raining && ((hh >= 16.5 && hh < 22.5) || (hh >= 4.5 && hh < 7)); };
          const set = (st, t) => { B.st = st; B.k = 0; B.t = t || 0; B.has = false; };
          const climb = makeRaccoonClimb({ B, rig, P, damp, tail, set: (st, tt) => set(st, tt), H0 });   // trèo cây táo hái ăn (animals/raccoon/climb.js)
          // G 04/11 "khi click vào cây táo thì gấu mèo leo lên hái táo và ăn táo": tin 'appleTreeTap' (người xem bấm cây táo già — nature/forest.js) ⇒ gấu mèo tự quyết
          //  đi trèo trong 90 s tới (B.call = hạn chót): đang ngủ trong hang thì dậy bò ra (cả ban ngày, lúc mưa), đang về hang thì quay ra; gặp nguy (chó, người)
          //  thì bỏ ý định, chạy về hang như thường; đang tới gốc / đang trên cây thì thôi
          worldHear('appleTreeTap', T => { if (T === appleTrees[2] && B.st !== 'toTree' && B.st !== 'climb') B.call = true; });
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
            if (racCol) { const s = Math.hypot(nx - p.x, nz - p.z), mv = colSlide(racCol, p.x, p.z, Math.atan2(nz - p.z, nx - p.x), s, dt); if (!mv) { B.v *= 0.4; return 0; } nx = mv[0]; nz = mv[1]; }   // vật cản thật (core/collide.js)
            const d = Math.hypot(nx - p.x, nz - p.z); p.x = nx; p.z = nz; return d;
          }
          function threat() {   // chó đang ở ngoài trong 4 m · người đi tới trong 2,8 m
            const p = O.position;
            const D = worldSee('dog'), E = worldSee('engineer');   // chó, người nhìn từ ngoài (core/world.js)
            if (D && !D.shelter && D.pos.distanceTo(p) < 4) return D.pos;
            if (E && E.out && E.pos.distanceTo(p) < 2.8) return E.pos;
            return null;
          }
          function crawl(Q, speed, dt) {   // bò thẳng tới Q trên đáy lòng gỗ (= mặt đất, nature/forest.js) / ngoài bãi: quay mặt trước (≤ 2,6 rad/s, trong gỗ thì quay đầu
            //  tại chỗ) rồi mới bò. Trước đây: trườn theo kịch bản từ điểm đầu, quay ngoắt 1 khung, B.k tăng 2 lần/khung ⇒ đi gấp đôi tốc độ chân bước (trượt chân)
            const p = O.position, dx = Q.x - p.x, dz = Q.z - p.z, d = Math.hypot(dx, dz);
            let dy = yawOf(dx, dz) - O.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
            if (d > 0.05) O.rotation.y += Math.max(-2.6 * dt, Math.min(2.6 * dt, dy));
            const st = Math.min(d, (d > 0.05 && Math.abs(dy) > 0.6 ? 0 : speed) * dt);
            if (d > 1e-4) { p.x += dx / d * st; p.z += dz / d * st; } p.y = cowY(p.x, p.z);
            B.v = B.want = st / dt; return d - st < 0.02;
          }
          function behave(dt, t) {
            const p = O.position, hh = liveWeather.localHour, th = ['den', 'exit', 'enter', 'climb'].includes(B.st) ? null : threat();   // trên cây: gặp nguy thì ở yên trên cây
            B.look = null; B.headP = null; B.dig = 0; B.mode = 'walk'; B.k += dt; B.t -= dt;
            if (B.call === true) B.call = t + 90;   // tin bấm cây vừa tới (worldHear ở trên): hạn chót theo đồng hồ cảnh
            const call = B.call > t;
            if (B.st === 'peek' && (th || (!active() && !call))) { B.fled = !!th; if (th) B.call = 0; set('enter'); }   // đang ló đầu ở miệng gỗ: có động / hết giờ ⇒ lùi vào luôn
            else if (B.st === 'out' && th && Math.hypot(p.x - racMouth.x, p.z - racMouth.z) < 1.2) { B.fled = true; B.call = 0; set('toMouth'); }   // vừa bước ra: quay lại chui vào (move() đẩy điểm trong gỗ ra ngoài vỏ)
            else if (th && !['flee', 'toMouth', 'enter', 'den', 'exit'].includes(B.st)) { B.call = 0; set('flee'); }
            else if (call && !B.fled && (B.st === 'toMouth' || B.st === 'enter')) set(B.st === 'toMouth' && Math.hypot(p.x - racMouth.x, p.z - racMouth.z) > 1.2 ? 'stand' : 'exit', 1);   // đang về hang mà người xem bấm cây ⇒ quay lại (đã ở miệng / trong gỗ thì bò ra miệng trước)
            if (!active() && !call && ['forage', 'dig', 'stand', 'chase', 'toTree'].includes(B.st)) set('home');
            const from = call ? ['forage', 'dig', 'stand', 'eat', 'chase', 'home', 'out'] : ['forage', 'dig', 'stand', 'eat'];   // bấm cây lúc vừa bò ra: ra khỏi vỏ gỗ là đi luôn (khỏi ra tận chỗ ra vào)
            if ((call || (climb.closeUp() > 1.5 && active() && t > (B.climbCD || 0))) && from.includes(B.st) && (B.st !== 'out' || (Math.hypot(p.x - racMouth.x, p.z - racMouth.z) > 1.1 && !racAvoidLog(p.x, p.z)))
              && t > (B.climbTry || 0) && p.distanceTo(appleTrees[2].position) < 25) {   // người xem bấm cây / zoom cận nhìn ≥ 1,5 s ⇒ trèo cây táo hái ăn
              B.climbTry = t + 5; if (climb.plan()) { climb.goal(); set('toTree', 30); }
            }
            switch (B.st) {
              // HANG = lòng khúc gỗ (animals/dog-raccoon.js racInside sâu 3,4 m · racMouth 0,3 m trong miệng to): ngủ trong gỗ → bò ra miệng → LÓ ĐẦU ngó quanh 1,6–2,6 s
              //  (đánh hơi trước khi ra, có động thì lùi vào) → bước ra bãi; về: tới chỗ ra vào ngoài bãi → bò vào miệng → vào sâu ngủ. Chạy trốn: bò vào nhanh
              case 'den': O.visible = false; B.want = B.v = 0; if ((active() && B.t <= 0) || call) { set('exit'); O.visible = true; } return 0;   // người xem bấm cây táo ⇒ dậy ngay
              case 'exit': if (crawl(racMouth, call ? 0.6 : 0.45, dt)) set('peek', call ? 0.9 : 1.6 + Math.random()); return B.v * dt;   // người xem bấm cây: bò ra nhanh, ló đầu ngắn
              case 'peek': {   // đứng ở miệng gỗ, ngóc đầu, ngó trái phải ra phía bãi
                B.want = 0; B.headP = 0.15; const a = -O.rotation.y + 0.7 * Math.sin(B.k * 2.1); B.look = _hp.set(p.x + 2 * Math.cos(a), p.y + 0.25, p.z + 2 * Math.sin(a));
                if (B.t <= 0) set('out');
                B.v = 0; return 0;   // không qua move(): racAvoidLog đẩy điểm trong lòng gỗ ra ngoài vỏ
              }
              case 'out': if (crawl(racApproach, 0.55, dt)) set('stand', 2.5); return B.v * dt;
              case 'toMouth': if (crawl(racMouth, B.fled ? 1.6 : 0.6, dt)) set('enter'); return B.v * dt;
              case 'enter': if (crawl(racInside, B.fled ? 1.2 : 0.5, dt)) { B.fled = false; set('den', active() ? 40 + Math.random() * 60 : 0); } return B.v * dt;
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
                B.want = 0; B.mode = 'stand'; B.headP = 0.1; const E = worldSee('engineer'); B.look = E && !E.inVan ? _hp.copy(E.pos).setY(E.pos.y + 1) : null;
                if (B.t <= 0) set('forage');
                break;
              }
              case 'chase': {   // vồ ong bướm bay thấp (ban ngày / chạng vạng còn sâu bọ)
                const q = B.prey && B.prey.g.position; B.look = q;
                if (!q || B.t <= 0) { set('forage'); break; }
                steer(q.x, q.z, 1.5, dt, null, 0.3);
                if (q.distanceTo(p) < 1.1 && !(B.swipe && B.swipe.prey === B.prey && t < B.swipe.t + 8)) { B.swipe = { prey: B.prey, t }; B.pounce = 0.5; }   // vồ trúng tầm: con mồi tự thấy cú vồ (mặt gấu mèo: swipe) mà bay đi · 8 s mới vồ lại con đó
                break;
              }
              case 'eat': {   // ngồi xổm, 2 tay đưa mồi lên miệng gặm, đầu gật nhẹ theo nhịp nhai
                B.want = 0; B.mode = 'sit'; B.headP = -0.2 + 0.05 * Math.abs(Math.sin(t * 9));
                if (B.t <= 0) set('forage');
                break;
              }
              case 'toTree': {   // tới gốc cây táo phía đã chọn, quay mặt vào thân rồi bám lên
                const g = climb.goal(), c = appleTrees[2].position; B.headP = 0.1; B.look = _hp.copy(g).setY(g.y + 1.5);
                if (Math.hypot(g.x - p.x, g.z - p.z) > 0.14) {
                  // đi VÒNG thân cây tới phía bám (đi thẳng thì đâm vào gốc): bước 0,7 rad trên vòng 1,25 m quanh tâm; cung ngắn mà đi qua phía khúc gỗ thì đi cung kia
                  let tx = g.x, tz = g.z; const ar = Math.atan2(p.z - c.z, p.x - c.x); let da = Math.atan2(Math.sin(Math.atan2(g.z - c.z, g.x - c.x) - ar), Math.cos(Math.atan2(g.z - c.z, g.x - c.x) - ar));
                  if (Math.abs(da) > 0.45 && Math.hypot(p.x - c.x, p.z - c.z) < 2.2) {
                    const dl = Math.atan2(Math.sin(climb.logAng() - ar), Math.cos(climb.logAng() - ar)); if (Math.sign(dl) === Math.sign(da) && Math.abs(dl) < Math.abs(da) + 1) da -= Math.sign(da) * 2 * Math.PI;
                    const a = ar + Math.sign(da) * Math.min(0.7, Math.abs(da)); tx = c.x + 1.25 * Math.cos(a); tz = c.z + 1.25 * Math.sin(a);
                  }
                  steer(tx, tz, 0.7, dt, climb.C.field, 0.12); if (B.t <= 0) { B.climbCD = t + 60; set('forage'); } break;
                }
                B.want = 0; let dy = climb.face() - O.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); O.rotation.y += Math.max(-2 * dt, Math.min(2 * dt, dy));
                if (Math.abs(dy) < 0.12) { B.v = 0; B.call = 0; set('climb'); climb.start(t); }
                break;
              }
              case 'climb': B.want = B.v = 0; return 0;   // trên cây: climb.update lo vị trí + dáng
              case 'flee': {   // bỏ chạy (phi nhảy) về cửa hang rồi chui vào
                if (steer(racApproach.x, racApproach.z, 2.6, dt, racField, 0.35)) { B.fled = true; set('toMouth'); }
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
          if (active()) { O.visible = true; O.position.set(racApproach.x, cowY(racApproach.x, racApproach.z), racApproach.z); set('forage'); }
          else { O.position.set(racInside.x, cowY(racInside.x, racInside.z), racInside.z); O.rotation.y = yawOf(racMouth.x - racInside.x, racMouth.z - racInside.z); set('den'); }   // ngủ trong lòng gỗ, đầu quay ra miệng (trước 04/11: để ở gốc toạ độ ⇒ chạng vạng bò 22 m từ giữa bãi về miệng gỗ)
          return {
            update(dt, t) {
              dt = Math.min(dt, 0.05);
              const dist = behave(dt, t), inLog = B.st === 'exit' || B.st === 'enter';
              climb.tick(dt, t);
              if (!O.visible) return;
              if (B.st === 'climb') { climb.update(dt, t); return; }
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
              const flex = B.gait === 'gallop' && sp > 0.1 ? 0.11 * Math.sin(2 * Math.PI * psi + 0.6) : 0; U.fore.rotation.z += (-flex - U.fore.rotation.z) * Math.min(1, dt * 14); U.aft.rotation.z = -U.fore.rotation.z;   // phi nhảy: lưng cong khi gom chân, duỗi khi vươn
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
            state: B, rig, tail, climb   // tail: animals/raccoon/glb.js đổi hướng + dài theo đuôi mẫu GLB · climb: trèo cây táo
          };
        })();
        worldTick('wild', 50, (dt, t) => { if (raccoonObj) raccoonBrain.update(dt, t); });   // MỖI KHUNG (sổ tick core/world.js): gấu mèo — chạng vạng → đêm, kiếm ăn, cào bới, đứng 2 chân, trộm táo, bỏ chạy về hang
