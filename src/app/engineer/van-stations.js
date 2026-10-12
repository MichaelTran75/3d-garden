        // ---- các "trạm" trong xe: mỗi trạm có nút vào/ra và máy trạng thái riêng; keep = việc hiện tại còn cần trạm này
        //      (hết cần thì tự gỡ ra: nhích ghế, đứng dậy, đẩy ghế vào… rồi trả 'released' khi đã đứng ở nút) ----
        const stDesk = { node: 'mid', tick(e, V, dt, t, keep) {   // bàn học: nghiên cứu ban ngày · học bài nghe nhạc buổi tối
          const g = e.g, P = engStudyPts, C = STUDY_SEAT, off = studyChairRig.off;
          const face = (dx, dz, k = 8) => { let d = Math.atan2(dx, dz) - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * k); };
          const walkIn = (Q, spd = 0.85) => {   // đi trong xe: thẳng tới điểm
            const dx = Q.x - g.position.x, dz = Q.z - g.position.z, dd = Math.hypot(dx, dz);
            if (dd < 0.03) { g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); e.vel = 0; return true; }
            e.vel = Math.min(spd, (e.vel || 0) + 2.4 * dt, dd * 1.6 + 0.05);
            const st = Math.min(dd, e.vel * dt); g.position.x += dx / dd * st; g.position.z += dz / dd * st; face(dx, dz);
            g.position.y = VAN_FLOOR - ENG_FEET + engGait(e, st) * CAMP_SCALE; e.walking = true; return false;
          };
          const vp = (x, z) => vanPt(x, 1.07, z);
          const backPt = o => vp(P.cx, P.cz + o + 0.52), leftBack = o => vp(P.cx - 0.57, P.cz + o + 0.52), leftFront = o => vp(P.cx - 0.57, P.cz + o - STUDY_FZ), standPt = o => vp(P.cx, P.cz + o - STUDY_FZ);
          const drag = (from, to, fwd) => {   // nắm đỉnh tựa lưng: kéo ghế ra (lùi bước) / đẩy ghế vào (tiến bước)
            V.k = Math.min(1, V.k + dt / 1.6);
            const o2 = from + (to - from) * minJerk(segK(V.k, 0.18, 0.92)), grip = minJerk(segK(V.k, 0, 0.2)) * (1 - minJerk(segK(V.k, 0.9, 1)));
            const tg = backPt(o2), st = Math.hypot(tg.x - g.position.x, tg.z - g.position.z);
            g.position.x = tg.x; g.position.z = tg.z; e.vel = Math.min(0.5, st / Math.max(dt, 1e-3));
            g.position.y = VAN_FLOOR - ENG_FEET + engGait(e, fwd ? st : -st) * CAMP_SCALE; e.walking = st > 1e-4;
            face(Math.sin(P.yaw), Math.cos(P.yaw));
            e.arms[0].rotation.x = e.arms[1].rotation.x = -0.62 * grip; e.lean = 0.1 * grip; e.head.rotation.x = 0.3 * grip;
            studyChairAt(o2); return V.k >= 1;
          };
          if (!V.st) V.st = off > 0.4 ? 'aroundL' : 'toBack';
          if (!keep) {   // việc khác: chưa kịp ngồi thì quay ra (ghế đã kéo thì đẩy vào), đang ngồi thì nhích ghế ra rồi đứng dậy
            if (V.st === 'toBack') return 'released';
            if (V.st === 'aroundL' || V.st === 'aroundF') V.st = 'outB';
            else if (V.st === 'toStand' || V.st === 'turn') V.st = 'outF';
            else if (V.st === 'work') { V.st = 'unscoot'; V.k = 0; }
          }
          if (V.st === 'toBack') { if (walkIn(backPt(off), 0.6)) { V.st = 'pull'; V.k = 0; V.dragFrom = off; } }
          else if (V.st === 'pull') { if (drag(V.dragFrom, STUDY_PULL, false)) V.st = keep ? 'aroundL' : 'push0'; }
          else if (V.st === 'push0') { V.st = 'push'; V.k = 0; V.dragFrom = off; }
          else if (V.st === 'aroundL') { if (walkIn(leftBack(off), 0.6)) V.st = 'aroundF'; }   // vòng bên trái ghế (phía đuôi giường)
          else if (V.st === 'aroundF') { if (walkIn(leftFront(off), 0.6)) V.st = 'toStand'; }
          else if (V.st === 'toStand') { if (walkIn(standPt(off), 0.45)) V.st = 'turn'; }   // đi ngang vào khoảng trước mặt ghế
          else if (V.st === 'turn') { if (engSeatTurn(e, P.yaw, dt, vanFloor)) { e.seat = engNewSeat(C, 'sit'); engSeatStartSit(e, C, e.seat); V.st = 'sit'; } }
          else if (V.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, e.seat, dt, t)) { e.seat.st = 'seated'; V.st = 'scoot'; V.k = 0; } }
          else if (V.st === 'scoot' || V.st === 'unscoot') {   // nhích cả ghế vào sát bàn · hết giờ: nhích ra để còn chỗ đứng dậy
            V.k = Math.min(1, V.k + dt / 2.2); const m = minJerk(V.k), into = V.st === 'scoot';
            studyChairAt(into ? STUDY_PULL * (1 - m) : 0.5 * m); engScootPose(e, C, e.seat, V.k, dt, t);
            if (V.k >= 1) { if (into) V.st = 'work'; else { engSeatStartRise(e, C, e.seat); V.st = 'rise'; } }
          }
          else if (V.st === 'work') {
            e.seatCtl = true; engSeatHold(e, C, e.seat, dt, t);
            const rt = e.armRollT || (e.armRollT = [0, 0]);
            if (e.act === 'music') {   // học bài với nhạc: gật gù theo nhịp ~87 bpm, lắc nhẹ đầu; mỗi 30 s ngả lưng gõ nhịp lên mép bàn
              const beat = t * Math.PI * 2 * 1.45, cyc = (t + V.ph) % 30, rel = cyc > 21;
              e.seatLean = rel ? -0.07 : 0.09; e.headRollT = Math.sin(beat / 2) * 0.07;
              e.head.rotation.x = (rel ? 0.02 : 0.22) + Math.sin(beat) * 0.06;
              if (rel) { e.arms[0].rotation.x = -0.95 + Math.max(0, Math.sin(beat)) * 0.14; e.arms[1].rotation.x = -0.95 + Math.max(0, Math.sin(beat + Math.PI)) * 0.14; }
              else { const tap = (t % 6) < 3.8 ? 0.05 : 0; e.arms[0].rotation.x = -1.1 + Math.sin(t * 11) * tap; e.arms[1].rotation.x = -1.1 + Math.sin(t * 11 + 1.7) * tap; }
            } else {   // nghiên cứu: gõ phím, thỉnh thoảng ngả lưng nhìn màn hình suy nghĩ; ~7 phút vươn vai 1 lần, ~1 phút đan tay sau gáy 1 lần
              const cyc = (t + V.ph) % 400, cyc2 = (t + V.ph * 0.7) % 63;
              if (cyc < 5.5) {
                const k = Math.min(1, Math.sin(Math.PI * cyc / 5.5) * 1.6);
                e.seatLean = -0.12 * k; e.arms[0].rotation.x = e.arms[1].rotation.x = -0.45 - 2.45 * k; e.head.rotation.x = 0.05 - 0.3 * k;
              } else if (cyc2 < 8) {
                const k = Math.min(1, Math.sin(Math.PI * cyc2 / 8) * 2.5);
                e.seatLean = -0.1 * k + 0.1 * (1 - k); e.arms[0].rotation.x = e.arms[1].rotation.x = -1.1 - 1.5 * k; rt[0] = -0.55 * k; rt[1] = 0.55 * k; e.head.rotation.x = 0.24 - 0.26 * k;
              } else {
                const pause = (t % 11) < 2.2, tap = pause ? 0 : 0.06;
                e.seatLean = pause ? -0.05 : 0.1;
                e.arms[0].rotation.x = pause ? -0.55 : -1.1 + Math.sin(t * 13) * tap;
                e.arms[1].rotation.x = pause ? -0.6 : -1.1 + Math.sin(t * 13 + 1.7) * tap;
                e.head.rotation.x = pause ? 0.05 + Math.sin(t * 0.8) * 0.04 : 0.18 + Math.sin(t * 0.7) * 0.03;
              }
            }
          }
          else if (V.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, e.seat, dt, t)) { e.seat = null; V.st = 'outF'; } }
          else if (V.st === 'outF') { if (walkIn(leftFront(off), 0.55)) V.st = 'outB'; }
          else if (V.st === 'outB') { if (walkIn(leftBack(off), 0.6)) V.st = 'toBack2'; }
          else if (V.st === 'toBack2') { if (walkIn(backPt(off), 0.5)) { V.st = 'push'; V.k = 0; V.dragFrom = off; } }
          else if (V.st === 'push') { if (drag(V.dragFrom, 0, true)) V.st = 'toAisle'; }
          else if (V.st === 'toAisle') { if (walkIn(P.aisle)) return 'released'; }
          return 'busy';
        } };
        const stTable = { node: 'tbl', tick(e, V, dt, t, keep) {   // bàn vuông: lách vào giữa ghế đẩu và mép bàn → ngồi → nhích ghế vào → ăn (sáng: ngũ cốc + cà phê · trưa: udon) → ăn xong cầm bát đứng dậy
          const C = STOOL_SEAT, s = e.seat, meal = e.act === 'lunch' ? 'udon' : 'cereal', H = e.hold;
          if (!V.st) V.st = 'face';
          if (V.st === 'face') { if (!keep) return 'released'; if (engSeatTurn(e, VY.pz, dt, vanFloor)) V.st = 'in'; }
          else if (V.st === 'in' || V.st === 'out') {
            if (V.st === 'in' && !keep) V.st = 'out';
            if (vanSideStep(e, V.st === 'in' ? TABLE_STAND : VN.tbl, VY.pz, dt)) {
              if (V.st === 'out') return 'released';
              e.seat = engNewSeat(C, 'sit'); engSeatStartSit(e, C, e.seat); V.st = 'sit';
            }
          }
          else if (V.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, s, dt, t)) { s.st = 'seated'; V.st = 'scoot'; V.k = 0; } }
          else if (V.st === 'scoot' || V.st === 'unscoot') {
            const into = V.st === 'scoot'; V.k = Math.min(1, V.k + dt / 2.0); const m = minJerk(V.k);
            stoolAt(into ? VSTOOL.rest + (STOOL_IN - VSTOOL.rest) * m : STOOL_IN + (VSTOOL.rest - STOOL_IN) * m); engScootPose(e, C, s, V.k, dt, t);
            if (V.k >= 1) {
              if (into) {   // đặt bát lên bàn: bát udon bưng từ bếp sang · bữa sáng bày sẵn bát ngũ cốc
                if (!e.dish || e.dish.kind !== meal) e.dish = { kind: meal, food: 1 };
                e.dish.at = 'table'; V.st = 'eat'; V.t0 = clock.elapsedTime; V.f0 = e.dish.food || 1;
                V.dur = Math.max(90, Math.min(meal === 'udon' ? 900 : 720, e.actLeft - 150));
              } else { if (e.dish && e.dish.at === 'table') e.dish.at = 'hand'; engSeatStartRise(e, C, s); V.st = 'rise'; }   // cầm bát theo
            }
          }
          else if (V.st === 'eat') {
            const D = e.dish, k = (clock.elapsedTime - V.t0) / V.dur;
            if (D) D.food = Math.max(0, V.f0 * (1 - k));
            if (!keep || k >= 1) { V.st = 'unscoot'; V.k = 0; }
            else {
              e.seatCtl = true; e.seatLean = 0.12; engSeatHold(e, C, s, dt, t);
              const rt = e.armRollT || (e.armRollT = [0, 0]);
              if (meal === 'udon') {   // đũa gắp sợi lên miệng, húp sột soạt; ~22 s nâng bát hai tay húp nước dùng
                H.chop = true; const ct = (t + V.ph) % 22, sip = ct > 18 ? Math.sin(Math.PI * (ct - 18) / 4) : 0;
                if (sip > 0.05) { H.sip = true; H.chop = false; e.arms[0].rotation.x = e.arms[1].rotation.x = -0.75 - sip * 0.85; rt[0] = 0.3 * sip; rt[1] = -0.3 * sip; e.head.rotation.x = 0.1 - sip * 0.25; }
                else {
                  const bt = (t + V.ph) % 3.8, dip = bt < 1.2, lift = bt >= 1.2 && bt < 1.9, slurp = bt >= 1.9 && bt < 2.9;
                  const toMouth = dip ? 0 : lift ? (bt - 1.2) / 0.7 : slurp ? 1 : Math.max(0, 1 - (bt - 2.9) / 0.9);
                  e.arms[0].rotation.x = -0.85 - toMouth * 0.75 + (dip ? Math.sin(bt * 8) * 0.05 : 0); e.arms[1].rotation.x = -0.6;
                  e.head.rotation.x = (dip ? 0.32 : 0.12) + (slurp ? Math.sin(t * 14) * 0.03 : 0);
                }
              } else {   // ngũ cốc: xúc thìa (tay phải) · ~19 s nhấp cà phê (tay trái) · nhai gật gù
                H.spoon = H.cup = true;
                const sc = (t + V.ph) % 19, sip = sc > 15 ? Math.sin(Math.PI * (sc - 15) / 4) : 0;
                const bt = (t + V.ph) % 3.6, scoop = bt < 1.2, lift = bt >= 1.2 && bt < 1.8, chew = bt >= 1.8;
                const toMouth = sip > 0 ? 0 : scoop ? 0 : lift ? (bt - 1.2) / 0.6 : Math.max(0, 1 - (bt - 1.8) / 0.9);
                e.arms[0].rotation.x = -0.8 - toMouth * 0.8 + (scoop && !sip ? Math.sin(bt * 9) * 0.05 : 0);
                e.arms[1].rotation.x = -0.45 - sip * 1.1;
                e.head.rotation.x = (scoop && !sip ? 0.3 : 0.08) - sip * 0.22 + (chew ? Math.abs(Math.sin(t * 9)) * 0.04 : 0);
              }
            }
          }
          else if (V.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, s, dt, t)) { e.seat = null; V.st = 'out'; } }
          return 'busy';
        } };
        const stBed = { node: 'bed', tick(e, V, dt, t, keep) {   // mép giường: 20:57 ngồi tháo mũ chờ giờ ngủ · 06:00 vừa dậy ngồi vươn vai rồi đứng lên
          const C = BED_SEAT, s = e.seat;
          if (!V.st) V.st = 'face';
          if (V.st === 'face') { if (!keep) return 'released'; if (engSeatTurn(e, VY.pz, dt, vanFloor)) { e.seat = engNewSeat(C, 'sit'); engSeatStartSit(e, C, e.seat); V.st = 'sit'; } }
          else if (V.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, s, dt, t)) { s.st = 'seated'; V.st = 'seated'; V.k = 0; } }
          else if (V.st === 'seated') {
            V.k += dt; e.seatCtl = true; e.seatLean = 0.12; engSeatHold(e, C, s, dt, t);
            if (V.k < 0) {   // vừa thức: vươn vai, ngáp
              const k = Math.min(1, Math.sin(Math.PI * Math.min(1, (V.k + 6) / 4.5)) * 1.5);
              e.seatLean = 0.12 - 0.2 * k; e.arms[0].rotation.x = e.arms[1].rotation.x = -0.5 - 2.4 * k; e.head.rotation.x = 0.15 - 0.4 * k;
            } else {
              const lift = segK(V.k, 0.6, 1.4) * (1 - segK(V.k, 1.9, 2.8));   // tháo mũ bảo hộ đặt cuối giường
              e.arms[0].rotation.x = e.arms[1].rotation.x = -0.55 - lift * 2.2; e.head.rotation.x = 0.2 - lift * 0.15;
              if (keep && V.k > 1.5 && e.helmet.visible) engHelmet(e, 'bed');
              if (!keep && V.k > 0) { if (!e.helmet.visible) engHelmet(e, 'head'); engSeatStartRise(e, C, s); V.st = 'rise'; }
            }
          }
          else if (V.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, s, dt, t)) { e.seat = null; return 'released'; } }
          return 'busy';
        } };
        const stWc = { node: 'wcIn', tick(e, V, dt, t, keep) {   // buồng WC: lật nắp → quay lưng → ngồi (khuỷu tì đùi) → đứng dậy → đậy nắp, bấm xả → ra
          const C = TOILET_SEAT, s = e.seat;
          if (!V.st) V.st = 'go';
          if (!keep && (V.st === 'go' || V.st === 'face')) { LID.target = 0; V.st = 'back'; }
          if (!keep && V.st === 'seated') V.until = 0;
          if (V.st === 'go') { if (vanWalkTo(e, TOILET_STAND, dt, 0.4)) V.st = 'face'; }
          else if (V.st === 'face') {
            LID.target = 1;
            if (engSeatTurn(e, VY.pz, dt, vanFloor) && LID.k >= 1) { e.seat = engNewSeat(C, 'sit'); engSeatStartSit(e, C, e.seat); V.st = 'sit'; }
          }
          else if (V.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, s, dt, t)) { s.st = 'seated'; V.st = 'seated'; V.until = clock.elapsedTime + Math.max(35, Math.min(240, e.actLeft - 75)); } }
          else if (V.st === 'seated') {
            e.seatCtl = true; e.seatLean = 0.3; engSeatHold(e, C, s, dt, t);
            e.arms[0].rotation.x = -0.62; e.arms[1].rotation.x = -0.58; e.head.rotation.x = 0.28 + Math.sin(t * 0.4) * 0.04;
            if (clock.elapsedTime >= V.until) { engSeatStartRise(e, C, s); V.st = 'rise'; }
          }
          else if (V.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, s, dt, t)) { e.seat = null; V.st = 'turn'; } }
          else if (V.st === 'turn') { if (engSeatTurn(e, VY.nz, dt, vanFloor)) { V.st = 'flush'; V.k = 0; } }
          else if (V.st === 'flush') {
            V.k += dt; const r = segK(V.k, 0, 0.7) * (1 - segK(V.k, 1.5, 2.2));
            if (V.k > 0.3) LID.target = 0;
            e.arms[0].rotation.x = -1.25 * r; e.lean = 0.22 * r; e.head.rotation.x = 0.3 * r;
            if (V.k > 2.4) V.st = 'back';
          }
          else if (V.st === 'back') { if (vanWalkTo(e, VN.wcIn, dt, 0.4)) return 'released'; }
          return 'busy';
        } };
        const stSink = { node: 'sink', tick(e, V, dt, t, keep) {   // lavabo: mở vòi, xoa tay, tắt vòi, liếc gương, vẩy tay
          if (!V.st) V.st = 'face';
          if (V.st === 'face') { if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'wash'; V.k = 0; } }
          else {
            V.k += dt; const k = V.k, on = k > 0.8 && k < 12.5, rt = e.armRollT || (e.armRollT = [0, 0]);
            VBATH.tapWater.visible = on; if (on) VBATH.tapWater.scale.set(1 + Math.sin(t * 40) * 0.15, 1, 1 + Math.cos(t * 37) * 0.15);
            const reach = segK(k, 0, 0.7) * (1 - segK(k, 13, 13.8)), rub = on ? Math.sin(t * 8) * 0.1 : 0;
            e.arms[0].rotation.x = -0.95 * reach + rub; e.arms[1].rotation.x = -0.95 * reach - rub; rt[0] = 0.2 * reach; rt[1] = -0.2 * reach;
            e.lean = 0.16 * reach; e.head.rotation.x = k > 12.6 && k < 14.6 ? -0.12 : 0.32 * reach;
            if (k > 13.8 && k < 15) e.arms[0].rotation.x = e.arms[1].rotation.x = -0.35 + Math.sin(t * 30) * 0.12;
            if (k > 15.2) { VBATH.tapWater.visible = false; return 'released'; }
          }
          return 'busy';
        } };
        const stShelf = on => ({ node: 'shelf', tick(e, V, dt, t, keep) {   // kệ cạnh cửa phòng tắm: tháo mũ đặt lên kệ / lấy mũ trên kệ đội lại
          if (!V.st) V.st = 'face';
          if (V.st === 'face') { if (!keep && !on) return 'released'; if (engSeatTurn(e, VY.nx, dt, vanFloor)) { V.st = 'do'; V.k = 0; } }
          else {
            V.k += dt; const k = V.k;
            const head = on ? segK(k, 0.65, 1.1) * (1 - segK(k, 1.35, 1.9)) : segK(k, 0, 0.55) * (1 - segK(k, 0.7, 1.1));
            const shelf = on ? segK(k, 0, 0.5) * (1 - segK(k, 0.65, 1.0)) : segK(k, 0.75, 1.2) * (1 - segK(k, 1.45, 1.9));
            e.arms[0].rotation.x = e.arms[1].rotation.x = -2.7 * head - 1.15 * shelf; e.head.rotation.x = 0.12 * shelf - 0.05 * head;
            if (on) { if (k > 0.55 && VBATH.shelfHelmet.visible) { VBATH.shelfHelmet.visible = false; } if (k > 1.15 && !e.helmet.visible) engHelmet(e, 'head'); }
            else { if (k > 0.6 && e.helmet.visible) { e.helmet.visible = false; e.hair.visible = true; } if (k > 1.25 && !VBATH.shelfHelmet.visible) engHelmet(e, 'shelf'); }
            if (k > 2.0) return 'released';
          }
          return 'busy';
        } });
        const stShower = { node: 'wcIn', tick(e, V, dt, t, keep) {   // vòi sen: mở nước → gội đầu, kỳ tay, ngửa mặt hứng nước → tắt nước, vẩy đầu → ra
          if (!V.st) V.st = 'go';
          if (!keep) { if (V.st === 'go' || V.st === 'face') V.st = 'back'; else if (V.st === 'wash') { V.st = 'tapOff'; V.k = 0; } }
          if (V.st === 'go') { if (vanWalkTo(e, SHOWER_SPOT, dt, 0.4)) V.st = 'face'; }
          else if (V.st === 'face') { if (engSeatTurn(e, VY.nz, dt, vanFloor)) { V.st = 'tapOn'; V.k = 0; } }
          else if (V.st === 'tapOn' || V.st === 'tapOff') {
            V.k += dt; const r = segK(V.k, 0, 0.6) * (1 - segK(V.k, 1.0, 1.6));
            e.arms[0].rotation.x = -1.15 * r; e.lean = 0.12 * r; e.head.rotation.x = 0.25 * r;
            if (V.k > 0.6) showerFx.on = V.st === 'tapOn';
            if (V.k > 1.7) {
              if (V.st === 'tapOn') { V.st = 'wash'; V.until = clock.elapsedTime + Math.max(60, Math.min(600, e.actLeft - 130)); }
              else { V.st = 'drip'; V.k = 0; }
            }
          }
          else if (V.st === 'wash') {
            VAN_DOORS.wc.target = 0; showerFx.on = true;
            const ph = (t + V.ph) % 24, rt = e.armRollT || (e.armRollT = [0, 0]);
            if (ph < 9) { e.arms[0].rotation.x = -2.5 + Math.sin(t * 7) * 0.16; e.arms[1].rotation.x = -2.55 - Math.sin(t * 7) * 0.16; e.head.rotation.x = 0.18; e.headRollT = Math.sin(t * 1.7) * 0.08; }
            else if (ph < 17) { e.arms[0].rotation.x = -0.95 + Math.sin(t * 6) * 0.22; e.arms[1].rotation.x = -0.75; rt[0] = 0.35; rt[1] = -0.1; e.head.rotation.x = 0.3; }
            else { e.arms[0].rotation.x = -0.25; e.arms[1].rotation.x = -0.25; e.head.rotation.x = -0.32; e.lean = -0.04; }
            if (clock.elapsedTime >= V.until) { V.st = 'tapOff'; V.k = 0; }
          }
          else if (V.st === 'drip') { V.k += dt; VAN_DOORS.wc.target = 0; e.headYawT = Math.sin(t * 15) * 0.35 * Math.max(0, 1 - V.k / 1.6); if (V.k > 2.6) V.st = 'back'; }
          else if (V.st === 'back') { if (vanWalkTo(e, VN.wcIn, dt, 0.4)) return 'released'; }
          return 'busy';
        } };
        const stTowel = { node: 'towel', tick(e, V, dt, t, keep) {   // khăn trên vách WC: lấy khăn vắt cổ → lau tóc, lau mặt → treo khăn lại
          if (!V.st) V.st = 'face';
          if (!keep && V.st === 'dry') { V.st = 'hang'; V.k = 0; }
          if (V.st === 'face') { if (!keep && !e.towel.visible) return 'released'; if (engSeatTurn(e, VY.nz, dt, vanFloor)) { V.st = e.towel.visible ? 'hang' : 'take'; V.k = 0; } }
          else if (V.st === 'take' || V.st === 'hang') {
            V.k += dt; const r = segK(V.k, 0, 0.7) * (1 - segK(V.k, 1.1, 1.8));
            e.arms[0].rotation.x = e.arms[1].rotation.x = -0.9 * r; e.lean = 0.3 * r; e.head.rotation.x = 0.3 * r;
            if (V.k > 0.8) { const take = V.st === 'take'; e.towel.visible = take; VBATH.towel.visible = !take; }
            if (V.k > 1.9) { if (V.st === 'take') { V.st = 'dry'; V.k = 0; } else return 'released'; }
          }
          else {
            V.k += dt;
            if (V.k < 30) { e.arms[0].rotation.x = -2.55 + Math.sin(t * 8) * 0.18; e.arms[1].rotation.x = -2.55 - Math.sin(t * 8) * 0.18; e.head.rotation.x = 0.25; e.headRollT = Math.sin(t * 2.2) * 0.12; }
            else { e.arms[0].rotation.x = -1.9 + Math.sin(t * 6) * 0.15; e.arms[1].rotation.x = -1.6; e.head.rotation.x = -0.1; }
            if (V.k > 50) { V.st = 'hang'; V.k = 0; }
          }
          return 'busy';
        } };
