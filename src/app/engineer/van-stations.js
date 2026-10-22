        // ---- các "trạm" trong xe: mỗi trạm có nút vào/ra và máy trạng thái riêng; keep = việc hiện tại còn cần trạm này
        //      (hết cần thì tự gỡ ra: nhích ghế, đứng dậy, đẩy ghế vào… rồi trả 'released' khi đã đứng ở nút) ----
        const stDesk = { node: 'mid', tick(e, V, dt, t, keep) {   // bàn học: nghiên cứu ban ngày · học bài nghe nhạc buổi tối
          // lối đi trong Transit chỉ ~0,55 m (giường ↔ tủ bếp) ⇒ không vòng ra sau ghế được: đứng cạnh ghế phía đầu giường, nắm tay vịn XOAY ghế về phía mình
          // (lăn lùi 10 cm cho tay vịn khỏi vướng mép bàn), quay lưng ngồi xuống, xoay cả người + ghế về bàn rồi nhích vào; hết giờ làm ngược lại, trả ghế về
          const g = e.g, P = engStudyPts, C = STUDY_SEAT, R = studyChairRig, SW = Math.PI / 2, OUT = STUDY_PULL;
          const face = (dx, dz, k = 8) => { let d = Math.atan2(dx, dz) - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * k); };
          const walkIn = (Q, spd = 0.85) => {   // đi trong xe: thẳng tới điểm
            const dx = Q.x - g.position.x, dz = Q.z - g.position.z, dd = Math.hypot(dx, dz);
            if (dd < 0.03) { g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); e.vel = 0; return true; }
            e.vel = Math.min(spd, (e.vel || 0) + 2.4 * dt, dd * 1.6 + 0.05);
            const st = Math.min(dd, e.vel * dt); g.position.x += dx / dd * st; g.position.z += dz / dd * st; face(dx, dz);
            g.position.y = VAN_FLOOR - ENG_FEET + engGait(e, st) * CAMP_SCALE; e.walking = true; return false;
          };
          const vp = (x, z) => vanPt(x, TR.yIn, z);
          const sidePt = () => vp(P.cx - 0.5, P.cz + 0.1), standPt = () => vp(P.cx - STUDY_FZ, P.cz + R.off);   // cạnh ghế (đầu giường) · trước mặt ghế đã xoay về −x
          const turnChair = (o0, o1, s0, s1, dur, grip) => {   // lăn + xoay mâm ghế: đứng thì 2 tay nắm tay vịn kéo xoay, ngồi thì người xoay theo ghế
            V.k = Math.min(1, V.k + dt / dur); const m = minJerk(V.k);
            studyChairAt(o0 + (o1 - o0) * m, 0, s0 + (s1 - s0) * m);
            if (grip) { const r = Math.sin(Math.PI * Math.min(1, V.k * 1.1)); e.arms[0].rotation.x = e.arms[1].rotation.x = -0.8 * r; e.lean = 0.2 * r; e.head.rotation.x = 0.32 * r; }
            return V.k >= 1;
          };
          if (!V.st) V.st = 'toSide';
          if (!keep) {   // việc khác: chưa ngồi thì trả ghế rồi đi; đang ngồi thì làm xong động tác, lùi ghế, xoay ra, đứng dậy
            if (V.st === 'toSide') return 'released';
            if (V.st === 'faceChair' || V.st === 'swing' || V.st === 'toStand' || V.st === 'turn') V.st = 'outS';
            else if (V.st === 'work' && lapDone(e, V)) { V.st = 'unscoot'; V.k = 0; }   // nghiên cứu: hạ tay về máy trước (engineer/laptop-work.js)
          }
          if (V.st === 'toSide') { if (walkIn(sidePt(), 0.6)) V.st = 'faceChair'; }
          else if (V.st === 'faceChair') { if (engSeatTurn(e, VY.px, dt, vanFloor)) { V.st = 'swing'; V.k = 0; } }
          else if (V.st === 'swing') { if (turnChair(0, OUT, 0, SW, 1.5, true)) V.st = 'toStand'; }
          else if (V.st === 'toStand') { if (walkIn(standPt(), 0.4)) V.st = 'turn'; }
          else if (V.st === 'turn') { if (engSeatTurn(e, C.yaw, dt, vanFloor)) { e.seat = engNewSeat(C, 'sit'); engSeatStartSit(e, C, e.seat); V.st = 'sit'; } }
          else if (V.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, e.seat, dt, t)) { e.seat.st = 'seated'; V.st = 'swivelIn'; V.k = 0; } }
          else if (V.st === 'swivelIn' || V.st === 'swivelOut') {   // ngồi xoay cả ghế (chân đẩy sàn): về bàn · quay ra lối đi
            const into = V.st === 'swivelIn'; e.seatCtl = true; engSeatHold(e, C, e.seat, dt, t);
            if (turnChair(OUT, OUT, into ? SW : 0, into ? 0 : SW, 1.8, false)) { if (into) { V.st = 'scoot'; V.k = 0; } else { engSeatStartRise(e, C, e.seat); V.st = 'rise'; } }
          }
          else if (V.st === 'scoot' || V.st === 'unscoot') {   // nhích cả ghế vào sát bàn · hết giờ: nhích ra để còn chỗ xoay
            V.k = Math.min(1, V.k + dt / 2.0); const m = minJerk(V.k), into = V.st === 'scoot';
            studyChairAt(into ? OUT * (1 - m) : OUT * m, 0, 0); engScootPose(e, C, e.seat, V.k, dt, t);
            if (V.k >= 1) { if (into) V.st = 'work'; else { V.st = 'swivelOut'; V.k = 0; } }
          }
          else if (V.st === 'work') {
            e.seatCtl = true; engSeatHold(e, C, e.seat, dt, t);
            const rt = e.armRollT || (e.armRollT = [0, 0]), sipT = (t + V.ph * 3.1) % 190;
            if (e.act !== 'music') lapWork(e, V, dt, t, rt);   // nghiên cứu: gõ phím · đọc · rê – bấm trackpad · chống cằm nghĩ · đan tay sau gáy · vươn vai · uống coke (engineer/laptop-work.js)
            else if (sipT < 7.4) engCokeSip(e, sipT, t, rt);   // ~3 phút một lần: uống coke
            else {   // học bài với nhạc: gật gù theo nhịp ~87 bpm, lắc nhẹ đầu; mỗi 30 s ngả lưng gõ nhịp lên mép bàn
              const beat = t * Math.PI * 2 * 1.45, cyc = (t + V.ph) % 30, rel = cyc > 21;
              e.seatLean = rel ? -0.07 : 0.09; e.headRollT = Math.sin(beat / 2) * 0.07;
              e.head.rotation.x = (rel ? 0.02 : 0.22) + Math.sin(beat) * 0.06;
              if (rel) { e.arms[0].rotation.x = -0.95 + Math.max(0, Math.sin(beat)) * 0.14; e.arms[1].rotation.x = -0.95 + Math.max(0, Math.sin(beat + Math.PI)) * 0.14; }
              else { const tap = (t % 6) < 3.8 ? 0.05 : 0; e.arms[0].rotation.x = -1.1 + Math.sin(t * 11) * tap; e.arms[1].rotation.x = -1.1 + Math.sin(t * 11 + 1.7) * tap; }
            }
          }
          else if (V.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, e.seat, dt, t)) { e.seat = null; V.st = 'outS'; } }
          else if (V.st === 'outS') { if (walkIn(sidePt(), 0.5)) V.st = 'faceBack'; }
          else if (V.st === 'faceBack') { if (engSeatTurn(e, VY.px, dt, vanFloor)) { V.st = 'swingBack'; V.k = 0; V.from = [R.off, R.sw]; } }
          else if (V.st === 'swingBack') { if (turnChair(V.from[0], 0, V.from[1], 0, 1.4, true)) V.st = 'toAisle'; }   // trả ghế về sát bàn, quay vào bàn
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
              e.seatCtl = true;
              if (meal === 'udon') {   // ~22 s nâng bát hai tay húp nước dùng (giữ dáng cũ), còn lại gắp đũa bằng IK
                const ct = (t + V.ph * 1.7) % 22, sip = ct < 3.3 ? Math.sin(Math.PI * ct / 3.3) : 0, rt = e.armRollT || (e.armRollT = [0, 0]);
                if (sip > 0.05) { H.sip = true; H.chop = false; e.seatLean = 0.12; engSeatHold(e, C, s, dt, t); e.arms[0].rotation.x = e.arms[1].rotation.x = -0.75 - sip * 0.85; rt[0] = 0.3 * sip; rt[1] = -0.3 * sip; e.head.rotation.x = 0.1 - sip * 0.25; }
                else { H.sip = false; engEatAtTable(e, t, V.ph, 'udon'); engSeatHold(e, C, s, dt, t); }
              } else { engEatAtTable(e, t, V.ph, 'cereal'); engSeatHold(e, C, s, dt, t); }   // ngũ cốc: thìa + cốc cà phê, IK tay theo điểm thật (engineer/meal-read.js)
            }
          }
          else if (V.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, s, dt, t)) { e.seat = null; V.st = 'out'; } }
          return 'busy';
        } };
        const stBed = { node: 'bed', tick(e, V, dt, t, keep) {   // mép giường: 21:42 ngồi tháo mũ chờ giờ ngủ · 06:00 vừa dậy ngồi vươn vai rồi đứng lên
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
        const ENG_WC_SIT = 30, ENG_SHOWER_WASH = 45, ENG_TOWEL_DRY = 35;   // G 13/10: ngồi WC đúng 30 s · G 14/10: cả việc tắm (rửa chảo + tắm + lau + đội mũ) 3 phút ⇒ nước chảy 45 s, lau khô 35 s
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
          else if (V.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, s, dt, t)) { s.st = 'seated'; V.st = 'seated'; V.until = clock.elapsedTime + ENG_WC_SIT; } }
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
              if (V.st === 'tapOn') { V.st = 'wash'; V.until = clock.elapsedTime + ENG_SHOWER_WASH; }
              else { V.st = 'drip'; V.k = 0; }
            }
          }
          else if (V.st === 'wash') {
            VAN_DOORS.wc.target = 0; showerFx.on = true; VBATH.wet = 1;   // sàn buồng tắm ướt (dọn: stCleanBath)
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
        // ---- DỌN NHÀ VỆ SINH / NHÀ TẮM sau khi dùng (G 21/10): nếp sống xe van (phòng tắm ướt, bồn cầu cassette) — đi xong cọ lòng bồn bằng chổi rồi xả, tắm xong
        //      gạt nước kính + sàn về phễu thoát cho khô nhanh, đỡ mốc. Đồ cầm tay: gắn vào cổ tay phải (attach giữ cỡ thế giới), xong trả về chỗ cũ ----
        const ENG_CLEAN_WC = 6, ENG_SQUEEGEE = 8;
        function bathHold(e, o, on) { if (on) { e.wrists[0].attach(o); o.position.set(0, -0.3, 0.03); o.rotation.set(0, 0, 0); } else { VBATH.group.attach(o); o.position.copy(o.userData.home.p); o.quaternion.copy(o.userData.home.q); } }
        const stCleanWc = { node: 'wcIn', tick(e, V, dt, t, keep) {   // lật nắp → cầm chổi → cọ lòng bồn (vòng tròn) → cắm chổi lại → đậy nắp, xả → ra
          if (!V.st) V.st = 'go';
          const hold = VBATH.brush.parent !== VBATH.group;
          if (!keep && V.st !== 'flush' && V.st !== 'back') { if (hold) bathHold(e, VBATH.brush, false); LID.target = 0; V.st = 'back'; }
          if (V.st === 'go') { if (vanWalkTo(e, TOILET_STAND, dt, 0.4)) V.st = 'face'; }
          else if (V.st === 'face') { LID.target = 1; if (engSeatTurn(e, VY.nz, dt, vanFloor) && LID.k >= 1) { V.st = 'take'; V.k = 0; } }
          else if (V.st === 'take' || V.st === 'put') {
            V.k += dt; const r = segK(V.k, 0, 0.6) * (1 - segK(V.k, 0.9, 1.5)), take = V.st === 'take';
            e.arms[0].rotation.x = -0.55 * r; e.lean = 0.45 * r; e.head.rotation.x = 0.4 * r;
            if (V.k > 0.6 && hold !== take) bathHold(e, VBATH.brush, take);
            if (V.k > 1.6) { V.k = 0; if (take) V.st = 'scrub'; else { V.st = 'flush'; LID.target = 0; } }
          }
          else if (V.st === 'scrub') {
            V.k += dt; const rt = e.armRollT || (e.armRollT = [0, 0]);
            e.lean = 0.62; e.head.rotation.x = 0.5; e.arms[0].rotation.x = -0.5 + Math.sin(t * 9) * 0.18; rt[0] = Math.cos(t * 9) * 0.25; e.arms[1].rotation.x = -0.3;
            if (V.k > ENG_CLEAN_WC) { V.st = 'put'; V.k = 0; }
          }
          else if (V.st === 'flush') { V.k += dt; const r = segK(V.k, 0, 0.7) * (1 - segK(V.k, 1.5, 2.2)); e.arms[0].rotation.x = -1.25 * r; e.lean = 0.22 * r; e.head.rotation.x = 0.3 * r; if (V.k > 2.4) V.st = 'back'; }
          else if (V.st === 'back') { if (vanWalkTo(e, VN.wcIn, dt, 0.4)) return 'released'; }
          return 'busy';
        } };
        const stCleanBath = { node: 'shelf', tick(e, V, dt, t, keep) {   // lấy gạt trên vách lùi → gạt kính rèm (nét dọc, hết mờ hơi) → gạt sàn về phễu (khô) → treo lại
          if (!V.st) V.st = 'face';
          const hold = VBATH.squee.parent !== VBATH.group;
          if (!keep && !['ret', 'face2', 'hang'].includes(V.st)) V.st = hold ? 'ret' : 'done';
          if (V.st === 'done') return 'released';
          if (V.st === 'face' || V.st === 'face2') { if (engSeatTurn(e, VY.nx, dt, vanFloor)) { V.st = V.st === 'face' ? 'take' : 'hang'; V.k = 0; } }
          else if (V.st === 'take' || V.st === 'hang') {
            V.k += dt; const r = segK(V.k, 0, 0.5) * (1 - segK(V.k, 0.8, 1.3)), take = V.st === 'take';
            e.arms[0].rotation.x = -1.3 * r; e.head.rotation.x = -0.05 * r;
            if (V.k > 0.5 && hold !== take) bathHold(e, VBATH.squee, take);
            if (V.k > 1.4) { if (!take) return 'released'; V.st = 'go'; V.k = 0; }
          }
          else if (V.st === 'go') { if (vanWalkTo(e, SHOWER_SPOT, dt, 0.4)) V.st = 'faceGlass'; }
          else if (V.st === 'faceGlass') { if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'glass'; V.k = 0; } }
          else if (V.st === 'glass') {   // kính rèm: nét dọc trên → dưới
            V.k += dt; const u = (V.k % 1.6) / 1.6; e.arms[0].rotation.x = -2.6 + 1.9 * u; e.head.rotation.x = -0.2 + 0.4 * u; e.headYawT = Math.sin(V.k * 0.8) * 0.3;
            showerFx.steam = Math.max(0, showerFx.steam - dt / 4);
            if (V.k > ENG_SQUEEGEE * 0.5) V.st = 'faceFloor';
          }
          else if (V.st === 'faceFloor') { if (engSeatTurn(e, VY.nz, dt, vanFloor)) { V.st = 'floor'; V.k = 0; } }
          else if (V.st === 'floor') {   // sàn: cúi gạt từ góc về phễu thoát
            V.k += dt; const u = (V.k % 1.4) / 1.4; e.lean = 0.55; e.head.rotation.x = 0.5; e.arms[0].rotation.x = -0.35 - 0.5 * (1 - u);
            VBATH.wet = Math.max(0, VBATH.wet - dt / (ENG_SQUEEGEE * 0.5));
            if (V.k > ENG_SQUEEGEE * 0.5) V.st = 'ret';
          }
          else if (V.st === 'ret') { if (vanWalkTo(e, VN.shelf, dt, 0.4)) V.st = 'face2'; }
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
            if (V.k < ENG_TOWEL_DRY * 0.6) { e.arms[0].rotation.x = -2.55 + Math.sin(t * 8) * 0.18; e.arms[1].rotation.x = -2.55 - Math.sin(t * 8) * 0.18; e.head.rotation.x = 0.25; e.headRollT = Math.sin(t * 2.2) * 0.12; }   // lau tóc
            else { e.arms[0].rotation.x = -1.9 + Math.sin(t * 6) * 0.15; e.arms[1].rotation.x = -1.6; e.head.rotation.x = -0.1; }   // lau mặt
            if (V.k > ENG_TOWEL_DRY) { V.st = 'hang'; V.k = 0; }
          }
          return 'busy';
        } };
