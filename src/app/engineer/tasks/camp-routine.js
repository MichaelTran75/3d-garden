        // ===== QUANH TRẠI (G 24/10 "sắp xếp lại files hành vi, để dễ chỉnh sửa": tách khỏi bộ điều phối engineer/mind/loop-update.js) =====
        //  Các pha ngoài trời không dùng dụng cụ: trú mưa dưới hiên (cứ 4–7 phút ra mép bạt ngắm mưa) · câu cá ở ghế xếp bên hồ · về ghế cắm trại → ăn / cá nướng /
        //  trà / ngủ trưa / đọc sách · dạo trại → uống nước → vuốt chó → cột khí tượng. Ngồi ghế làm gì, bao lâu: engChairPhase (engineer/mind/schedule.js).
        //  Việc dùng dụng cụ (táo, sao, drone, cắt cỏ…) ở bảng ENG_JOBS (engineer/mind/task-table.js). ----
        function engCampPhase(e, dt, t) {
          const H = e.hold;
          if (e.phase === 'toShelter') {          // mưa: về ghế cắm trại dưới mái hiên (vào thẳng từ phía trước ghế)
            if (engUseSeat(e, CAMP_SEAT, dt, t)) { e.phase = 'shelter'; e.timer = 0; }
          }
          else if (e.phase === 'shelter') {            // ngồi yên dưới mái hiên chừng nào còn mưa, cẳng chân buông đung đưa nhẹ · cứ 4–7 phút ra mép bạt ngắm mưa
            if (engUseSeat(e, CAMP_SEAT, dt, t)) {
              e.seatLean = 0.02; e.seatSwing = 0.05;
              e.arms[0].rotation.x = -0.22; e.arms[1].rotation.x = -0.25;
              e.head.rotation.x = 0.06 + Math.sin(t * 0.6) * 0.025;
              e.rwT = (e.rwT || 0) + dt; if (e.rwNext === undefined) e.rwNext = 240 + 180 * Math.random();
              if (e.rwT > e.rwNext && !RX.gest) { e.rwT = 0; e.rwNext = undefined; e.phase = 'rainwatch'; skyWatch.rainStart(); }
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
                  if (engForceAct === 'fish') engForceAct = null;                 // câu theo lệnh bảng Tools (ui/tools-panel.js): xong thì về lịch
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
              // với cốc trong vòng tay vịn → thổi → nhấp → 2 tay ôm cốc → nhấp → đặt lại (engineer/tasks/meal-read.js); hết giờ: chờ đặt cốc xuống rồi mới đứng dậy
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
            if (engUseSeat(e, CAMP_SEAT, dt, t)) { if (e.act === 'chair') chairTea(e, dt, t); else { e.arms[0].rotation.x = e.arms[1].rotation.x = -1.2; engRead(e, dt, t); } }   // 'chair': bảng Tools / bấm ghế (engineer/tasks/tool-jobs.js)
          }
          else if (e.phase === 'wander') {             // đứng dậy, đi lang thang ngẫu nhiên quanh trại
            e.timer -= dt; e.wanderTmr -= dt;
            if (!e.wanderTgt || e.wanderTmr <= 0) {   // điểm lang thang quanh bếp lửa, không rơi vào ghế / xô / bàn trà
              e.wanderTgt = e.g.position.clone();   // không tìm được điểm sạch thì đứng chờ lượt chọn sau
              const shade = wxShadeSpot(e), warmUp = WX.coldK > 0.4 && campfireLevel(liveWeather.localHour) * campRain.flameK > 0.25;   // nóng + nắng: đứng dưới mái bạt · lạnh mà lửa đang cháy: quanh quẩn sát bếp (engineer/mind/weather-feel.js)
              if (shade) e.wanderTgt.copy(shade);
              else for (let k = 0; k < 10; k++) {
                const a = Math.random() * 6.283, r = warmUp ? 1.7 + Math.random() * 0.9 : 2.2 + Math.random() * 3.4, x = pf.x + Math.cos(a) * r, z = pf.z + Math.sin(a) * r;
                if (ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.7) || !engLineClearOfSeats(e.g.position.x, e.g.position.z, x, z) || engNavBlocked(x, z)) continue;   // ô vật cản thật (lò chiminea, đống củi, máy cắt cỏ, cửa xe): G 24/10 kiểm tra thấy chọn điểm sát lò rồi đâm vào
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
            if (e.timer <= 0 || !dogPettable()) { e.phase = (e.loopN = (e.loopN || 0) + 1) % 2 ? 'toMast' : 'toChair'; engPetting = false; autoDone('pet'); }
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
        }
