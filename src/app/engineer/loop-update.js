          if (engObj) {
            const e = engObj;
            // rời pha trà giữa chừng (tối, đổi việc): cốc về vòng tay vịn
            if (e.teaT !== undefined && e.phase !== 'tea') teaRelease(e);
            engPoseBegin(e);   // trả tư thế đích frame trước
            updateEngineerWeatherThought();
            const hh = liveWeather.localHour; // One Pleiku clock for sky, animals and the engineer.
            const isSleeping = hh >= 21.0 || hh < 6.0;
            vanDoorsTick(dt);
            if (isSleeping) {
              resetFishingBite(); studyLaptop.target = 0; e.seat = null; e.act = 'sleep'; e.phase = 'van'; e.inVan = true; e.van = null; e.enter = null;
              if (studyChairRig.off) studyChairAt(0);   // (đã đẩy ghế vào trước khi lên giường)
              if (e.g.parent !== caravanObj) {
                caravanObj.add(e.g);
                e.g.scale.setScalar(ENGINEER_BASE_SCALE); // The scaled van supplies the single 0.90 factor while sleeping.
                e.g.position.fromArray(caravanObj.userData.interior.sleepPosition);   // tư thế nằm, chăn, thở, trở mình: engSleepTick (engineer/sleep.js)
                e.arms[0].rotation.set(0, 0, 0); e.arms[1].rotation.set(0, 0, 0);
                e.rodGrp.visible = false; groundRod.visible = true;
                checkBubbleSprite.visible = false;
                // ngủ: mũ để cuối giường, khăn trên giá, đồ cầm tay cất, ghế đẩu kéo ra, cửa phòng tắm & nắp bồn cầu đóng, tắt nước
                engHelmet(e, 'bed'); e.towel.visible = false; VBATH.towel.visible = true;
                e.dish = null; kitchenReset(); engDishShow(e);
                for (const k in e.props) e.props[k].visible = false; if (e.clip) e.clip.visible = false;
                stoolAt(VSTOOL.rest); VAN_DOORS.entry.target = VAN_DOORS.wc.target = 0; LID.target = 0; showerFx.on = false; VBATH.tapWater.visible = false; chipsBag.visible = false;
              }
              engSleepTick(e, dt, t, hh);
              fishLine.visible = false; bobber.visible = false;
              zzzGroup.visible = true;
              for (const z of zzzs) {
                const p = (t * 0.42 + z.ph) % 1.0;
                z.m.position.set(caravanObj.userData.interior.sleepHead[0] + Math.sin(t * 1.8 + z.ph) * 0.25, 4.0 + p * 3.6, caravanObj.userData.interior.sleepHead[2]);
                z.m.material.opacity = (1 - p) * 0.85;
                z.m.scale.setScalar((0.5 + p * 0.95) * 1.2);
              }
              sleepSprite.visible = true;
              const wakeSeconds = (6 * 3600 - Math.round(hh * 3600) + 86400) % 86400;
              const h = Math.floor(wakeSeconds / 3600), m = Math.floor((wakeSeconds % 3600) / 60), s = wakeSeconds % 60;
              const timeStr = `Sleep: ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
              if (timeStr !== lastSleepStr) {   // chuỗi chỉ đổi 1 lần/giây → không vẽ lại canvas mỗi frame
                lastSleepStr = timeStr;
                sleepCtx.clearRect(0, 0, 256, 64);
                sleepCtx.font = '26px Outfit, sans-serif'; sleepCtx.fillStyle = '#ffd34a'; sleepCtx.textAlign = 'center'; sleepCtx.textBaseline = 'middle';
                sleepCtx.fillText(timeStr, 128, 32); sleepTex.needsUpdate = true;
              }
              napFx.update(dt, t, null); musicFx.update(dt, t, false); laptopScreenTick(t, false);
            } else {
              if (e.g.parent === caravanObj) { engSleepEnd(e); engWake(e); }   // 06:00: mặt thức, gấp chăn, ngồi dậy ở mép giường
              zzzGroup.visible = false;
              sleepSprite.visible = false;
              // ---- lịch cả ngày: việc theo giờ (mưa thì việc ngoài trời trống vào hiên) · mở trang giữa chừng thì đặt sẵn ở chỗ đang làm ----
              const act = engWantAct(e, hh);
              if (!e.act) engSpawn(e, act); else if (act !== e.act) engSetAct(e, act);
              const H = e.hold || (e.hold = {}); for (const k in H) H[k] = false;
              e.armsBusy = false; grill.update(dt, hh);
              if (e.dish && e.dish.at === 'camp' && !['eat', 'eatFish', 'tossFish', 'tea', 'toChair'].includes(e.phase)) e.dish.at = 'hand';   // hết bữa tối: nhấc chảo khỏi bàn trà mang vào rửa
              if (e.dish && e.dish.at === 'hand' && !e.inVan && e.phase !== 'van' && e.act !== 'dinner' && e.dish.food < 0.05 && e.dish.kind !== 'pan') e.dish = null;
              e.headRollT = 0;
              // ---- dùng ghế ngoài trời: việc mới không cần chiếc ghế đang ngồi → đứng dậy rồi rời ghế theo làn trước, không đi xuyên ghế ----
              const outSeat = e.inVan ? null : engPhaseSeat(e.phase);
              const leavingSeat = !e.inVan && engSeatGuard(e, outSeat, e.phase === 'van' ? dogDoorFar : engPhaseGoal(e, outSeat), dt, t);
              const fishing = e.phase === 'fish' && !leavingSeat && !e.inVan;
              if (!fishing) resetFishingBite();
              e.rodGrp.visible = fishing; groundRod.visible = !fishing; fishLine.visible = fishing; bobber.visible = fishing;   // không câu → cần nằm dưới đất cạnh ghế
              engPetting = false; e.teaIdle = false;
              if (leavingSeat) { /* engSeatGuard: đứng dậy + rời ghế, đã đặt vị trí + dáng */ }
              else if (engReactHold(e, dt, t)) { /* phản ứng: đứng lại khi mưa bắt đầu · ngồi xổm xoa đầu chó (engineer/reactions.js) */ }
              else if (e.inVan) engVan(e, dt, t, act);          // trong xe: bàn học, bàn ăn, phòng tắm, giường…
              else if (e.phase === 'van') engEnterVan(e, dt, t);   // việc trong xe: đi tới cửa hông, bước lên
              else if (e.phase === 'toShelter') {          // mưa: về ghế cắm trại dưới mái hiên (vào thẳng từ phía trước ghế)
                if (engUseSeat(e, CAMP_SEAT, dt, t)) { e.phase = 'shelter'; e.timer = 0; }
              }
              else if (e.phase === 'shelter') {            // ngồi yên dưới mái hiên chừng nào còn mưa, cẳng chân buông đung đưa nhẹ
                if (engUseSeat(e, CAMP_SEAT, dt, t)) {
                  e.seatLean = 0.02; e.seatSwing = 0.05;
                  e.arms[0].rotation.x = -0.22; e.arms[1].rotation.x = -0.25;
                  e.head.rotation.x = 0.06 + Math.sin(t * 0.6) * 0.025;
                }
              }
              else if (e.phase === 'fish') {               // ngồi ghế xếp, thư giãn buông cần câu cá bên hồ (đã ngồi hẳn từ pha 'toFish')
                if (engUseSeat(e, FISH_SEAT, dt, t)) {
                  e.timer -= dt;
                  e.seatLean = angling.active ? angling.lean : 0.07; e.seatSwing = 0;   // gập thân theo động tác: canh phao đổ tới · giật/dìu ngồi thẳng · thả cá cúi nhìn
                  e.arms[0].rotation.x = -0.15; e.arms[1].rotation.x = -1.02;         // tư thế nghỉ (lớp câu cá ghi đè từng khung, ghi ngược để thôi câu không giật)
                  e.head.rotation.x = 0.3;
                  e.fishBiteK = 1;                                                    // quăng · canh phao · giật · dìu · thả cá: chạy sau lớp tư thế
                  if (e.timer <= 0 || e.act !== 'fish') {
                    angling.stopReq = true;                                           // hết giờ: đang dìu thì dìu xong, thu dây về rồi mới đứng dậy
                    if (angling.stage === 'done' || !angling.active || e.timer < -45) {
                      e.phase = e.act === 'fish' ? 'toChair' : engPhaseFor(e.act); e.timer = 0; resetFishingBite();
                      if (grill.st === 'bucket') { grill.toHand(e); e.phase = 'toPlant'; }   // lấy con cá rô trong xô, mang về bếp xiên que cắm nướng
                      e.rodGrp.visible = false; groundRod.visible = true; fishLine.visible = false; bobber.visible = false;
                    }
                  }
                }
              }
              else if (e.phase === 'toChair') {            // về ghế cắm trại (né bếp lửa), vào thẳng từ phía trước, quay lưng, ngồi → ăn / trà / đọc sách tuỳ việc
                if (engUseSeat(e, CAMP_SEAT, dt, t)) {
                  e.phase = engChairPhase(e, e.act); e.readPh = Math.random() * 9; idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 4000);
                  if (e.act === 'dinner') { if (!e.dish || e.dish.kind !== 'pan') e.dish = { kind: 'pan', food: 1 }; e.dish.at = 'camp'; e.eatT0 = e.timer; }   // đặt chảo cơm chiên lên bàn trà
                }
              }
              else if (e.phase === 'eat') {                // ăn trưa / tối: bưng chảo tay trái, thìa tay phải xúc → đưa lên → vào miệng → nhai (engEatRice)
                if (engUseSeat(e, CAMP_SEAT, dt, t)) {
                  e.timer -= dt;
                  if (e.dish && e.eatT0 > 0) e.dish.food = Math.max(0, e.timer / e.eatT0);   // cơm trong chảo vơi dần
                  e.arms[0].rotation.x = -1.2; e.arms[1].rotation.x = -0.9;                 // góc tay thẳng ước lượng (IK + hướng cổ tay ghi đè)
                  engEatRice(e, dt, t);
                  if (e.timer <= 0) { if (e.dish) e.dish.at = 'camp'; e.phase = 'tea'; e.timer = e.actLeft + 60; }   // ăn xong đặt chảo lại bàn trà, ngồi uống trà tới hết giờ
                }
              }
              else if (e.phase === 'eatFish') { if (engUseSeat(e, CAMP_SEAT, dt, t)) { e.arms[0].rotation.x = e.arms[1].rotation.x = -1.3; engEatFish(e, dt, t); } }   // 2 tay cầm que cá như bắp ngô
              else if (e.phase === 'tossFish') { if (engUseSeat(e, CAMP_SEAT, dt, t)) engTossFish(e, dt, t); }
              else if (e.phase === 'toGrill' || e.phase === 'grab' || e.phase === 'toPlant' || e.phase === 'plant') engGrillPhase(e, dt, t);   // lấy que cá nướng · xiên & cắm cá mới
              else if (e.phase === 'tea') {                // nhấp trà thư giãn, ngả lưng nhẹ; hết giờ: nghỉ trưa thì chợp mắt luôn trên ghế, dạo trại thì đứng dậy đi tiếp
                if (engUseSeat(e, CAMP_SEAT, dt, t)) {
                  e.timer -= dt; e.arms[0].rotation.x = e.arms[1].rotation.x = -0.6;
                  // với cốc trong vòng tay vịn → thổi → nhấp → 2 tay ôm cốc → nhấp → đặt lại (engineer/meal-read.js); hết giờ: chờ đặt cốc xuống rồi mới đứng dậy
                  const teaIdle = e.teaIdle = engTea(e, dt, t);
                  if (e.timer <= 0 && teaIdle) {
                    if (e.act === 'rest') e.phase = 'nap';
                    else if (e.act === 'outdoor') { e.phase = 'wander'; e.timer = 90; e.wanderTgt = null; e.wanderTmr = 0; }
                    else e.timer = 600;
                  }
                }
              }
              else if (e.phase === 'nap') {                // ngủ trưa trên ghế: ngả lưng, đầu gục nghiêng, tay buông trên đùi, thở chậm
                if (engUseSeat(e, CAMP_SEAT, dt, t)) {
                  e.seatLean = -0.1 + Math.sin(t * 1.3) * 0.012; e.seatSwing = 0;
                  e.arms[0].rotation.x = -0.42; e.arms[1].rotation.x = -0.45;
                  e.head.rotation.x = 0.45; e.headRollT = 0.24;
                }
              }
              else if (e.phase === 'read') {               // đọc sách to (gấp đôi) bằng 2 tay trước ngực · tay phải lật trang ~40 s/lần · tay trái bốc khoai ~20 s/lần (engRead)
                if (engUseSeat(e, CAMP_SEAT, dt, t)) { e.arms[0].rotation.x = e.arms[1].rotation.x = -1.2; engRead(e, dt, t); }
              }
              else if (e.phase === 'wander') {             // đứng dậy, đi lang thang ngẫu nhiên quanh trại
                e.timer -= dt; e.wanderTmr -= dt;
                if (!e.wanderTgt || e.wanderTmr <= 0) {   // điểm lang thang quanh bếp lửa, không rơi vào ghế / xô / bàn trà
                  e.wanderTgt = e.g.position.clone();   // không tìm được điểm sạch thì đứng chờ lượt chọn sau
                  for (let k = 0; k < 10; k++) {
                    const a = Math.random() * 6.283, r = 2.2 + Math.random() * 3.4, x = pf.x + Math.cos(a) * r, z = pf.z + Math.sin(a) * r;
                    if (ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.7) || !engLineClearOfSeats(e.g.position.x, e.g.position.z, x, z)) continue;
                    e.wanderTgt.set(x, 0, z); break;
                  }
                  e.wanderTmr = 3 + Math.random() * 3.5;
                }
                engStep(e, e.wanderTgt, dt, t, pf, FIRE_AVOID_R);
                if (e.timer <= 0) { e.phase = 'drink'; e.timer = 9; idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 2000); }
              }
              else if (e.phase === 'drink') {              // đứng lại, mở chai nước ngửa cổ uống 2 ngụm
                e.timer -= dt; H.bottle = true;
                const k = 9 - e.timer, up = Math.min(1, k / 0.8, Math.max(0, (9 - k - 0.2) / 0.8)), gulp = up > 0.95 ? Math.sin(t * 7) * 0.04 : 0;
                e.legs[0].rotation.x = e.legs[1].rotation.x = 0; e.knees[0].rotation.x = e.knees[1].rotation.x = 0;
                e.arms[0].rotation.x = -2.35 * up + gulp; e.arms[1].rotation.x = -0.1;                        // đưa chai lên, đáy chai chếch cao
                e.head.rotation.x = -0.38 * up + gulp;                                                         // ngửa cổ, yết hầu nhấp nhô
                e.lean = -0.06 * up;                                                                           // ngả nhẹ ra sau khi tu chai
                if (e.timer <= 0) { e.phase = dogPettable() ? 'toDog' : (e.loopN = (e.loopN || 0) + 1) % 2 ? 'toMast' : 'toChair'; e.timer = 0; if (e.phase === 'toDog') idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 3000); }
              }
              else if (e.phase === 'toDog') {              // ra chỗ chó nằm cạnh bếp lửa
                if (!dogPettable()) e.phase = 'toMast';
                else { const dp = dogObj.position, ax = e.g.position.x - dp.x, az = e.g.position.z - dp.z, al = Math.hypot(ax, az) || 1;
                  _petTgt.set(dp.x + ax / al * 0.75, 0, dp.z + az / al * 0.75);
                  if (engStep(e, _petTgt, dt, t, pf, 1.05, null)) { e.phase = 'pet'; e.timer = 18; } }   // né lòng bếp lửa
              }
              else if (e.phase === 'pet') {                // ngồi xổm vuốt lưng chó, chó vẫy đuôi lia lịa
                e.timer -= dt;
                const k = Math.min(1, (18 - e.timer) / 0.6, Math.max(0, e.timer / 0.6)), dp = dogObj.position;
                e.g.rotation.y = Math.atan2(dp.x - e.g.position.x, dp.z - e.g.position.z);
                e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET - 0.28 * CAMP_SCALE * ENGINEER_SIZE * k;   // hạ người ngồi xổm (gập gối theo cỡ người)
                e.legs[0].rotation.x = -1.3 * k; e.legs[1].rotation.x = -1.2 * k; e.knees[0].rotation.x = 2.0 * k; e.knees[1].rotation.x = 1.9 * k;
                e.arms[0].rotation.x = (-0.62 + Math.sin(t * 4) * 0.16) * k; e.arms[1].rotation.x = -0.15 * k;   // tay vuốt dọc lưng chó
                e.head.rotation.x = 0.3 * k; e.lean = 0.2 * k;                                                // cúi người về phía chó
                engPetting = k > 0.5;
                if (e.timer <= 0 || !dogPettable()) { e.phase = (e.loopN = (e.loopN || 0) + 1) % 2 ? 'toMast' : 'toChair'; engPetting = false; }
              }
              else if (e.phase === 'apple') {              // hái táo bằng sào rút: nhắm · luồn rổ · vặn bứt · lấy quả bỏ giỏ · xách giỏ về (engineer/apple-pick.js)
                if (applePick.update(e, dt, t)) e.doneAct = e.onceKey;
              }
              else if (e.phase === 'toMast') {             // đi tới cột khí tượng
                if (engStep(e, e.wp[2], dt, t, pf, FIRE_AVOID_R, mastField)) { e.phase = 'check'; e.timer = 40; }
              }
              else if (e.phase === 'check') {              // đứng kiểm tra cột khí tượng: ngẩng đầu nhìn cột, đưa bảng ghi chép lên
                e.timer -= dt;
                e.g.rotation.y = Math.atan2(wmast.g.position.x - e.g.position.x, wmast.g.position.z - e.g.position.z);
                e.head.rotation.x = -0.45 + Math.sin(t * 1.4) * 0.12; e.lean = -0.04;   // ngửa nhìn đỉnh cột
                e.arms[1].rotation.x = -1.5 + Math.sin(t * 2.2) * 0.18; e.arms[0].rotation.x = -0.2;
                e.legs[0].rotation.x = 0; e.legs[1].rotation.x = 0;
                e.knees[0].rotation.x = 0; e.knees[1].rotation.x = 0;
                if (e.timer <= 0) e.phase = 'toChair';
              }
              else {                                       // 'toFish' → vào làn phía sau–trái ghế câu, quay lưng, lùi, ngồi
                if (engUseSeat(e, FISH_SEAT, dt, t)) { e.phase = 'fish'; e.timer = e.act === 'fish' ? e.actLeft : 90; }
              }
              if (grill.st === 'held' && !['grab', 'eatFish', 'tossFish'].includes(e.phase)) engCarryFish(e);   // đi đường: que cá dựng đứng tay phải
              if (grill.st === 'carried') { const ax = engAxesW(e); engHandSet(e, 1, engBodyW(e, 0.32, 1.38, 0.32, _grT), aimQ(_mrQ, ax.f, _mrUp)); }   // cá rô sống tay trái
              const fishInHand = ['held', 'carried', 'plant'].includes(grill.st);
              // ---- đồ cầm tay theo việc đang làm (bảng ghi chép chỉ cầm khi đi ngoài trời, tay rảnh) ----
              const atSeat = !!e.seat && (e.seat.st === 'back' || e.seat.st === 'sit' || e.seat.st === 'seated' || e.seat.st === 'rise');   // tay cần nắm tay vịn
              const P = e.props;
              P.spoon.visible = !!H.spoon; P.cup.visible = !!H.cup; P.bottle.visible = !!H.bottle; P.book.visible = !!H.book; P.chip.visible = !!H.chip;
              P.chopsticks.visible = !!H.chop; P.knife.visible = !!H.knife; P.spatula.visible = !!H.spatula;
              if (H.coke && !P.coke) engHandCoke(e);
              if (P.coke) P.coke.visible = !!H.coke;
              if (caravanObj.userData.interior.studyCoke) caravanObj.userData.interior.studyCoke.visible = !H.coke;   // lon trên bàn ẩn khi đang cầm
              if (!H.book) P.bookLeaf.visible = false;
              const Dsh = e.dish, dishHand = !!Dsh && Dsh.at === 'hand';
              P.handBowl.visible = (dishHand && Dsh.kind !== 'pan') || !!H.sip; P.handPan.visible = dishHand && Dsh.kind === 'pan';
              setFood(P.handBowl.userData.food, Dsh && Dsh.kind === 'udon' ? Dsh.food : 0, 0.022); setFood(P.handPan.userData.food, dishHand && Dsh.kind === 'pan' ? Dsh.food : 0, 0);
              if (dishHand && !e.armsBusy && !e.seatCtl) {   // bưng bát hai tay trước bụng · cầm cán chảo một tay
                const rt = e.armRollT || (e.armRollT = [0, 0]);
                if (Dsh.kind === 'pan') e.arms[1].rotation.x = -0.8;
                else { e.arms[0].rotation.x = e.arms[1].rotation.x = -0.85; rt[0] = 0.28; rt[1] = -0.28; }
              }
              engDishShow(e); kitchenTick(dt, t);
              if (e.clip) e.clip.visible = !e.inVan && e.phase !== 'van' && !fishing && !atSeat && !H.pole && e.phase !== 'apple' && !H.spoon && !H.cup && !H.bottle && !H.book && !dishHand && e.phase !== 'pet' && !fishInHand;
              chipsBag.visible = e.phase === 'read' && !e.inVan && !leavingSeat;
              const atDesk = e.inVan && !!e.van && e.van.station === 'desk';
              studyLaptop.target = atDesk && (e.van.st === 'sit' || e.van.st === 'scoot' || e.van.st === 'work') ? 1 : 0;
              laptopScreenTick(t, atDesk && e.act === 'music');
              musicFx.update(dt, t, atDesk && e.act === 'music' && e.van.st === 'work' && studyLaptop.open > 0.85);
              napFx.update(dt, t, e.phase === 'nap' && !leavingSeat && !e.inVan ? e : null);
              if (!(e.inVan && e.van && e.van.station === 'shower')) showerFx.on = false;
              updateEngineerIdleThought();
              drawEngineerLabel(t);
            }
            showerFx.update(dt);
            engReactPre(e, dt, t);  // phản ứng với cảnh: mưa, sét, gió, chó, lá rơi, khói — nghiêng người, tốc độ (engineer/reactions.js)
            engPoseEnd(e, dt, t);   // hiển thị tư thế đã làm mượt
            engFootIK(e, dt);       // IK: bàn chân bám đúng mặt đất voxel, hông hạ theo chân thấp
            engReactPost(e, dt, t); // phản ứng: quay đầu nhìn, nhịp cử chỉ (trước engSeatPost — nơi áp góc quay đầu)
            engSeatPost(e, dt);     // dang tay tới tay vịn · đầu quay dẫn hướng · đám mây suy nghĩ đứng thẳng trên hông
            if (e.fishBiteK !== undefined) { if (e.phase === 'fish') updateFishingBite(e, dt, t, e.fishBiteK); e.fishBiteK = undefined; }
            splashFx.update(dt);   // giật cần + dây câu tính SAU khi tư thế đã mượt → đầu dây luôn khớp ngọn cần
            engReactArms(e, dt, t); // phản ứng: đích tay cử chỉ — sau khi đầu đã quay / cúi xong khung này
            engArmPost(e, dt);      // khuỷu tay + cổ tay (IK 2 đoạn giữ đúng chỗ bàn tay) · eo vặn theo nhịp bước
            applePick.tick(e, dt);  // sào, quả trong rổ / tay / giỏ theo bàn tay đã đặt xong · quả trên cây đung đưa
            if (e.act === 'sleep' && e.g.parent === caravanObj) engSleepPost(e);   // chăn phủ theo thân đã hiển thị (engineer/sleep.js)
          }
