        // ===== KỸ SƯ PHẢN ỨNG VỚI MÔI TRƯỜNG — tự chủ đợt 2 (G 18/10 "react with weather và react with environment such as chim chóc, lá rơi, cây cỏ, bướm,
        //  thỏ trong bán kính 6 voxel square") =====
        //  Tầm nhận biết ENV_R = 6 voxel (6 × BLOCK 0,6 = 3,6 đv) quanh kỹ sư, chỉ khi ở ngoài trời. Mỗi 0,25 s chấm điểm thứ đáng chú ý nhất: độ hấp dẫn
        //  của loài × gần × trước mặt × lạ (vừa nhìn con đó trong 25 s thì còn 30% — quen dần, không nhìn chằm chằm), nhìn theo 2–5 s rồi thôi:
        //   · CHIM SẺ đậu dưới cỏ trong tầm lúc đang đi ⇒ khựng lại 3–5 s cho chim ăn tiếp (người đứng yên thì chim chỉ bay khi < 1 m — animals/songbird.js);
        //   · BƯỚM lượn tới trong tầm tay khi đứng yên / ngồi nghỉ ⇒ chìa tay, bướm đáp lên mu bàn tay 3–6 s, khép mở cánh rồi bay đi. ~1/4 số lần bướm chọn
        //     điểm bay mới thì chọn quanh người đang ở ngoài trời (bướm hay sà quanh người — áo sáng màu, mồ hôi) — animals/insects.js nextButterflyTarget;
        //   · THỎ trong tầm ⇒ ngồi xổm thật chậm (1,6 s) xem thỏ gặm 6–9 s, không lại gần · GÀ chạy toán loạn vì mình ⇒ bật cười;
        //   · ONG bay sát mặt (< 0,7) ⇒ phẩy tay xua · ĐOM ĐÓM chớp gần ⇒ nhìn theo;
        //   · CÂY CỎ: đang đi sát ô có hoa dại (meadow.flowerNear) ⇒ ngồi xổm cúi ngửi hoa (tối đa 1 lần / 2 phút);
        //   · THỜI TIẾT thêm (ngoài mưa / sét / gió / nóng lạnh ở engineer/reactions.js): cầu vồng ở đập ⇒ chỉ tay · hoàng hôn (mặt trời 0,5–6° buổi chiều)
        //     ⇒ đứng lại ngắm 8 s, mỗi ngày 1 lần · trăng lên ⇒ ngẩng nhìn.
        //  Mỗi phản ứng lấp Tò mò + Giải trí một chút (ui/sim-needs.js). Gọi: envTick (cuối engReactPre) · envHold (engReactHold) · envArms (engReactArms) ----
        const ENV_R = 6 * BLOCK, ENV_STOP = new Set([...RX_STOP, 'explore']);
        const ENV = { t: 0, tgt: null, seen: new Map(), bf: null, nx: {}, sunset: '', moon: '' };
        const _evA = new THREE.Vector3(), _evB = new THREE.Vector3(), _evC = new THREE.Vector3(), _evD = new THREE.Vector3(), _evQ = new THREE.Quaternion();
        Object.assign(RX_GP, { finger: 3, point: 3 });
        Object.assign(RX_TXT, {
          bird: ['Suỵt, chim sẻ đang kiếm ăn, đứng yên cho nó ăn.', 'Chim sẻ nhảy lóc cóc ngay cạnh chân.'],
          bfly: ['Bướm đậu lên tay luôn!', 'Đứng yên nào… bướm đậu rồi.'],
          bunny: ['Thỏ ra gặm cỏ kìa, ngồi xuống xem cho nó khỏi sợ.', 'Thỏ con, mũi khụt khịt dễ thương ghê.'],
          hen: ['Gà chạy toán loạn, mình có làm gì đâu!', 'Ha ha, gà hoảng hốt thế.'],
          bee: ['Ong bay sát mặt, xua nhẹ thôi.'], fly: ['Đom đóm lập loè ngay trước mặt.'],
          flower: ['Hoa dại thơm nhẹ.', 'Bông hoa bé xíu mà thơm ghê.'],
          rainbow: ['Cầu vồng trên đập kìa!', 'Có cầu vồng, phải ghi vào nhật ký trại.'],
          sunset: ['Hoàng hôn đẹp quá, đứng ngắm một lát.', 'Mặt trời sắp lặn, trời nhuộm cam hết rồi.'],
          moon: ['Trăng lên rồi.', 'Trăng sáng quá, khỏi cần đèn pin.']
        });
        const envNeed = (c, f) => { if (!sim.n || sim.n.curiosity === undefined) return; sim.n.curiosity = Math.min(100, sim.n.curiosity + c); sim.n.fun = Math.min(100, (sim.n.fun ?? 60) + f); };
        const envPos = T => T.kind === 'bunny' ? T.o.g.position : T.kind === 'bird' ? T.o.root.position : T.o.g.position;
        const envAlive = T => T.kind === 'bunny' ? daytimeAnimals.visible && !T.o.shelter : T.kind === 'bfly' || T.kind === 'bee' ? liveWeather.wildlifeAwake && T.o.g.visible : T.kind === 'hen' ? T.o.level === 'ground' : T.kind === 'fly' ? !liveWeather.wildlifeAwake : true;
        function envScan(e, t) {   // thứ đáng nhìn nhất trong tầm 6 voxel (null nếu không có)
          const g = e.g.position, yaw = e.g.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw);
          let best = null, bs = 0;
          const cand = (kind, o, p, w) => {
            const dx = p.x - g.x, dz = p.z - g.z, d = Math.hypot(dx, dz); if (d > ENV_R || Math.abs(p.y - g.y) > 4) return;
            const fr = d > 1e-3 ? (dx * fx + dz * fz) / d : 1; if (fr < -0.3 && d > 1.2) return;   // sau lưng thì không thấy (sát người thì nghe thấy)
            const s0 = ENV.seen.get(o), s = w * (1.3 - d / ENV_R) * (0.75 + 0.25 * fr) * (s0 !== undefined && t - s0 < 25 ? 0.3 : 1);
            if (s > bs) { bs = s; best = { kind, o }; }
          };
          for (const b of [songbird, ...flock.birds, ...nestPairs.flat()]) { const S = b.state; if (S.st !== 'sleep' && !(S.at && S.at.local)) cand('bird', b, b.root.position, S.st === 'fly' ? 0.9 : S.at && S.at.kind === 'ground' ? 1.3 : 0.8); }
          if (liveWeather.wildlifeAwake && daytimeAnimals.visible) {
            for (const bf of butterflies) if (bf.mode === 'nav') cand('bfly', bf, bf.g.position, 1.25);
            for (const b of bees) if (b.g.visible) cand('bee', b, b.g.position, 0.5);
          }
          if (daytimeAnimals.visible) for (const b of bunnies) if (!b.shelter) cand('bunny', b, b.g.position, 1.6);
          for (const h of chickens.list) if (h.level === 'ground') cand('hen', h, h.g.position, h.st === 'flee' ? 1.4 : 0.7);
          if (!liveWeather.wildlifeAwake) for (const f of fireflies) if (f.fl < 0.3) cand('fly', f, f.g.position, 0.8);
          return best;
        }
        function envStart(e, n, t, onFoot) {   // bắt đầu chú ý tới n: nhìn + (tuỳ loài) đứng lại / ngồi xổm / cười / xua tay
          const k = n.kind, o = n.o; if (rxGazeFree(e) < 0.3) return;   // đang bận tay bận mắt (ăn, câu giật cá, cắt cỏ…): bỏ qua
          ENV.tgt = { kind: k, o, until: t + 2 + 3 * Math.random(), prio: k === 'bunny' || k === 'bfly' ? 2.6 : 2.3 };
          envNeed(1.5, 0.5);
          const canHold = onFoot && ENV_STOP.has(e.phase) && !RX.hold && !rxRaining(), hf = rxHands(e);
          if (k === 'bird' && o.state.at && o.state.at.kind === 'ground' && e.walking && canHold && t >= (ENV.nx.bird || 0)) {
            RX.hold = { k: 'still', t: 0, dur: 3 + 2 * Math.random(), o }; ENV.nx.bird = t + 60; ENV.tgt.until = t + RX.hold.dur; rxSay('bird', RX_TXT.bird, 'Chim sẻ', false);
          } else if (k === 'bunny') {
            if (canHold && t >= (ENV.nx.bunny || 0)) { RX.hold = { k: 'crouch', t: 0, dur: 6 + 3 * Math.random(), o }; ENV.nx.bunny = t + 90; ENV.tgt.until = t + RX.hold.dur; }
            rxSay('bunny', RX_TXT.bunny, 'Thỏ', false);
          } else if (k === 'hen' && o.st === 'flee') { rxGest('laugh', 1.3); rxSay('hen', RX_TXT.hen, 'Gà', false); }
          else if (k === 'bee') {
            e.head.getWorldPosition(_evA);
            if (_evA.distanceTo(o.g.position) < 0.7 && hf[0] && rxTeaLeft(e) > 2) { rxGest('wave', 1.6); rxLookAway(e, o.g.position, 3.5, 1.4); rxSay('bee', RX_TXT.bee, 'Ong', false); }
          } else if (k === 'fly') rxSay('fly', RX_TXT.fly, 'Đom đóm', false);
        }
        function envReset() {
          ENV.tgt = null; if (ENV.bf) envBflyLeave(ENV.bf.bf);
          const H = RX.hold; if (H && (H.k === 'still' || H.k === 'crouch' || H.k === 'flower' || H.k === 'sunset')) rxHoldEnd();
        }
        // ---- mỗi khung (cuối engReactPre, chỉ khi ngoài trời) ----
        function envTick(e, dt, t, onFoot, seated) {
          if (t >= ENV.t) {
            ENV.t = t + 0.25;
            if (!ENV.tgt || t > ENV.tgt.until) { if (ENV.tgt) { ENV.seen.set(ENV.tgt.o, t); ENV.tgt = null; } const n = envScan(e, t); if (n) envStart(e, n, t, onFoot); }
          }
          const T = ENV.tgt;
          if (T) { if (!envAlive(T)) { ENV.seen.set(T.o, t); ENV.tgt = null; } else rxLook('env', T.prio, 0.3, envPos(T)); }
          // bướm trong tầm tay khi đứng yên / ngồi nghỉ (tay rảnh) ⇒ chìa tay mời bướm đậu
          if (T && T.kind === 'bfly' && !ENV.bf && !RX.gest && t >= (ENV.nx.bfly || 0) && !rxRaining() && (onFoot ? !e.walking && RX.still > 0.6 : seated && (e.phase === 'shelter' || (e.phase === 'tea' && e.teaIdle))) && rxHands(e)[0] && rxTeaLeft(e) > 6) {
            e.arms[0].getWorldPosition(_evA); const dur = Math.min(9.5, rxTeaLeft(e) - 0.5);   // uống trà: xong trước khi tay phải với cốc
            if (_evA.distanceTo(T.o.g.position) < 1.3 && rxGest('finger', dur)) { ENV.bf = { bf: T.o, st: 'to', k: 0, dur: Math.min(3 + 3 * Math.random(), dur - 2.5) }; T.o.mode = 'hand'; T.until = t + dur; }
          }
          envWeather(e, t, onFoot);
          envFlower(e, t, onFoot);
        }
        function envFlower(e, t, onFoot) {   // đi ngang hoa dại ⇒ ngồi xổm ngửi
          if (!onFoot || !e.walking || RX.hold || !ENV_STOP.has(e.phase) || t < (ENV.nx.flower || 0) || rxRaining() || sunElevSin < 0.02 || !meadow.flowerNear) return;   // tối thì không thấy hoa
          ENV.nx.flower = t + 1.5;
          const g = e.g.position, yaw = e.g.rotation.y, f = meadow.flowerNear(g.x + Math.sin(yaw) * 0.7, g.z + Math.cos(yaw) * 0.7, 0.9);
          if (!f || Math.random() > 0.4) return;
          ENV.nx.flower = t + 120; RX.hold = { k: 'flower', t: 0, dur: 4.4, p: new THREE.Vector3(f[0], f[1] + 0.12, f[2]) }; rxSay('flower', RX_TXT.flower, 'Cây cỏ', false); envNeed(2, 1);
        }
        function envWeather(e, t, onFoot) {   // cầu vồng · hoàng hôn · trăng lên
          const free = rxGazeFree(e), day = new Date().toDateString(); if (free < 0.3) return;
          e.head.getWorldPosition(_evC);
          if (damRainbow && damRainbow.visible && rainbowMats.length && rainbowMats[0].opacity > 0.12 && t >= (ENV.nx.rainbow || 0)) {
            ENV.nx.rainbow = t + 1200; damRainbow.getWorldPosition(_evA); _evA.y += 6;
            rxLook('rainbow', 3.4, 4, _evA); if (rxHands(e)[0] && rxTeaLeft(e) > 3.5) rxGest('point', 3, { p: _evA.clone() });
            rxSay('rainbow', RX_TXT.rainbow, 'Cầu vồng', false); envNeed(3, 3);
          }
          const el = Math.asin(Math.max(-1, Math.min(1, sunElevSin))) * 180 / Math.PI;
          if (ENV.sunset !== day && liveWeather.localHour > 15 && el > 0.5 && el < 6 && !rxRaining() && free > 0.6) {
            const w = liveWeather.state, cur = w.fresh ? w.data?.current : null; if (cur && Number.isFinite(cur.cloud_cover) && cur.cloud_cover > 85) return;
            ENV.sunset = day; const sp = _evA.copy(_wp).multiplyScalar(60).add(_evC);
            if (onFoot && ENV_STOP.has(e.phase) && !RX.hold && !e.seatCtl) RX.hold = { k: 'sunset', t: 0, dur: 8, p: sp.clone() };
            rxLook('sunset', 3.2, 8, sp); rxSay('sunset', RX_TXT.sunset, 'Hoàng hôn', false); envNeed(3, 3);
          }
          if (ENV.moon !== day && liveWeather.localHour > 17 && _mp.y > 0.15 && nightFactor > 0.6 && !rxRaining() && free > 0.6) {
            ENV.moon = day; rxLook('moon', 3, 4, _evA.copy(_mp).multiplyScalar(60).add(_evC)); rxSay('moon', RX_TXT.moon, 'Trăng', false);
          }
        }
        // ---- đứng lại vì môi trường (engReactHold đã cho đứng yên, chân chạm đất): khựng chân · ngồi xổm xem thỏ · ngửi hoa · ngắm hoàng hôn ----
        function envHold(e, H, dt, t) {
          const g = e.g, gp = g.position;
          if (H.k === 'still') { if (H.o.state.st === 'fly' && H.t < H.dur - 0.8) H.t = H.dur - 0.8; }   // chim bay rồi thì đi tiếp sau 0,8 s
          else if (H.k === 'crouch' || H.k === 'flower') {
            const p = H.k === 'flower' ? H.p : H.o.g.position, yt = Math.atan2(p.x - gp.x, p.z - gp.z);
            g.rotation.y += Math.atan2(Math.sin(yt - g.rotation.y), Math.cos(yt - g.rotation.y)) * Math.min(1, dt * (H.k === 'crouch' ? 1.5 : 3));
            const slow = H.k === 'crouch' ? 1.6 : 0.8, k = 0.85 * rxSS(H.t, 0, slow) * (1 - rxSS(H.t, H.dur - slow * 0.7, H.dur));   // xem thỏ: hạ người thật chậm cho thỏ khỏi giật mình
            e.noFootIK = true; gp.y -= 0.24 * CAMP_SCALE * ENGINEER_SIZE * k;
            e.legs[0].rotation.x = e.legs[1].rotation.x = -1.05 * k; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.75 * k;
            if (H.k === 'flower') {   // cúi ngửi: gập người về phía bông hoa giữa chừng, hít một hơi (vai nhô lên)
              const sn = rxSS(H.t, 1.0, 1.7) * (1 - rxSS(H.t, 2.9, 3.5)); e.lean = (0.14 + 0.3 * sn) * k;
              rxLook('flower', 3.3, 0.3, H.p);
            } else e.lean = 0.12 * k;
          } else if (H.k === 'sunset') {
            const yt = Math.atan2(H.p.x - gp.x, H.p.z - gp.z); g.rotation.y += Math.atan2(Math.sin(yt - g.rotation.y), Math.cos(yt - g.rotation.y)) * Math.min(1, dt * 1.5);
          }
          if (H.t >= H.dur) rxHoldEnd();
        }
        // ---- đích tay của cử chỉ môi trường (engReactArms, default) ----
        function envArms(e, G, w, u, ax) {
          if (G.k === 'finger') {   // chìa tay phải ra trước ngang ngực, lòng tay ngửa, ngón duỗi về trước — chỗ đáp cho bướm
            const p = engBodyW(e, -0.2, 1.7, 0.44, _evA), q = aimQ(_evQ, _rxUp, _evB.copy(ax.f).negate());
            rxHand(e, 0, p, q, w); rxPole(e, 0, -1, -0.7, 0);
          } else if (G.k === 'point') {   // chỉ tay về điểm p: cánh tay gần duỗi, ngón theo hướng nhìn
            e.arms[0].getWorldPosition(_evA); const d = _evB.copy(G.p).sub(_evA).normalize(), palm = _evC.set(0, -1, 0).addScaledVector(d, d.y).normalize();
            rxHand(e, 0, _evD.copy(_evA).addScaledVector(d, 0.46 * e.g.scale.y / 0.79), aimQ(_evQ, palm, _evA.copy(d).negate()), w);
          }
        }
        // ---- BƯỚM ĐẬU TAY (animals/insects.js gọi trước bflyShelter khi bf.mode === 'hand'): bay tới mu bàn tay · đậu, khép mở cánh · bay đi ----
        function envBflyHand(bf, dt, t) {
          const B = ENV.bf; if (!B || B.bf !== bf) { bf.mode = 'fromPerch'; bf.vis.copy(bf.g.position); return false; }
          const e = engObj, G = RX.gest;
          if (liveWeather.state.raining) { ENV.bf = null; bf.mode = 'toPerch'; bf.vis.copy(bf.g.position); if (G && G.k === 'finger') rxGestEnd(G); return false; }   // mưa: đi trú như mọi con
          if (!G || G.k !== 'finger' || !e.handW || !rxOutside(e)) { envBflyLeave(bf); return false; }
          B.k += dt; e.wrists[0].updateWorldMatrix(true, false); const hp = e.wrists[0].localToWorld(_evD.set(0, 0.02, 0.055));   // giữa lòng bàn tay chữ C (+z cổ tay), nhỉnh lên
          if (B.st === 'to') {
            const p = bf.g.position, dx = hp.x - p.x, dy = hp.y - p.y, dz = hp.z - p.z, dd = Math.hypot(dx, dy, dz);
            if (dd < 0.02 && G.w > 0.95) { B.st = 'on'; B.k = 0; rxSay('bfly', RX_TXT.bfly, 'Bướm', false); envNeed(4, 4); }
            else if (B.k > 6) { envBflyLeave(bf); return false; }
            else {
              const s = Math.min(dd, bf.spd * (dd < 0.4 ? 0.6 : 1.2) * dt), wob = Math.min(1, dd * 1.2);   // lượn vòng nhỏ, sát tay thì vào thẳng, chậm lại
              p.set(p.x + dx / dd * s + Math.cos(t * 2.3 + bf.ph) * 0.006 * wob, p.y + dy / dd * s + Math.sin(t * 3.7 + bf.ph) * 0.01 * wob, p.z + dz / dd * s);
              let turn = Math.atan2(dx, dz) - bf.g.rotation.y; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); bf.g.rotation.y += turn * Math.min(1, dt * 5);
              bflyFlap(bf, dt, dd < 0.3 ? 0.8 : 1.1);
            }
          } else {   // đậu: theo tay, cánh khép dựng rồi thỉnh thoảng mở phẳng phơi nắng
            bf.g.position.copy(hp); bf.g.rotation.y += 0.15 * dt;
            const o = Math.pow(0.5 + 0.5 * Math.sin(B.k * 1.7 + bf.ph), 3), a = 1.3 - 1.15 * o;
            bf.wL.rotation.z = a; bf.wR.rotation.z = -a; bf.wL.userData.hind.rotation.z = bf.wR.userData.hind.rotation.z = 0;
            if (B.k > B.dur) { envBflyLeave(bf); return false; }
          }
          return true;
        }
        function envBflyLeave(bf) {   // bay đi: về lại đường bay cũ (bflyShelter 'fromPerch'), 40 s sau mới mời bướm khác
          ENV.bf = null; ENV.nx.bfly = RX.t + 40; if (bf.mode === 'hand') { bf.mode = 'fromPerch'; bf.vis.copy(bf.g.position); }
          const G = RX.gest; if (G && G.k === 'finger') rxGestEnd(G);
        }
        function envBflyLure(bf) {   // animals/insects.js nextButterflyTarget: ~1/4 số lần chọn điểm bay quanh kỹ sư đang ở ngoài trời (cách 0,6–1,8 đv, ngang ngực – đầu)
          const e = engObj; if (!e || !rxOutside(e) || liveWeather.state.raining || Math.random() > 0.25 || !flightNav) return false;
          const p = e.g.position; if (Math.hypot(p.x - bf.pos.x, p.z - bf.pos.z) > 30) return false;
          for (let k = 0; k < 12; k++) {
            const a = Math.random() * TAU, r = 0.6 + Math.random() * 1.2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
            _evD.set(x, flightNav.ground(x, z) + 1.1 + Math.random() * 0.8, z); flightNav.snapToVoxel(_evD, _evD);
            if (flightNav.pointClear(_evD) && _evD.distanceToSquared(bf.pos) > 4) { bf.target.copy(_evD); return true; }
          }
          return false;
        }
