          if (engObj) {
            const e = engObj;
            // rời pha trà giữa chừng (tối, đổi việc): cốc về vòng tay vịn
            if (e.teaT !== undefined && e.phase !== 'tea' && !(e.rtTea && e.phase === 'read' && e.act === 'chair')) { teaRelease(e); e.rtTea = false; }   // (ghế theo lệnh: nhấp trà giữa lúc đọc — engineer/tasks/tool-jobs.js chairTea)
            engPoseBegin(e);   // trả tư thế đích frame trước
            updateEngineerWeatherThought();
            const hh = liveWeather.localHour; // One Pleiku clock for sky, animals and the engineer.
            const isSleeping = !engAwake(hh);
            vanDoorsTick(dt);
            if (isSleeping) engNightTick(e, dt, t, hh);   // ngủ trong xe: lên giường, cất đồ, Zzz + bảng đếm tới giờ thức (engineer/tasks/sleep.js)
            else {
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
              else if (engReactHold(e, dt, t)) { /* phản ứng: đứng lại khi mưa bắt đầu · ngồi xổm xoa đầu chó (engineer/mind/reactions.js) */ }
              else if (e.inVan) engVan(e, dt, t, act);          // trong xe: bàn học, bàn ăn, phòng tắm, giường…
              else if (e.phase === 'van') engEnterVan(e, dt, t);   // việc trong xe: đi tới cửa hông, bước lên
              else if (ENG_JOBS[e.phase]) ENG_JOBS[e.phase].run(e, dt, t);   // việc dùng dụng cụ: táo, sao, luống, củi, drone, dạo khám phá, máy xe, cắt cỏ, ngắm mưa (engineer/mind/task-table.js)
              else engCampPhase(e, dt, t);   // quanh trại: trú mưa, câu cá, ghế cắm trại (ăn, cá nướng, trà, ngủ trưa, đọc), dạo, uống nước, vuốt chó, cột khí tượng (engineer/tasks/camp-routine.js)
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
              if (e.clip) e.clip.visible = !e.inVan && e.phase !== 'van' && !fishing && !atSeat && !H.pole && (!ENG_JOBS[e.phase] || !!ENG_JOBS[e.phase].clip) && !H.spoon && !H.cup && !H.bottle && !H.book && !dishHand && e.phase !== 'pet' && !fishInHand;
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
            engReactPre(e, dt, t);  // phản ứng với cảnh: mưa, sét, gió, chó, lá rơi, khói — nghiêng người, tốc độ (engineer/mind/reactions.js)
            engPoseEnd(e, dt, t);   // hiển thị tư thế đã làm mượt
            engFootIK(e, dt);       // IK: bàn chân bám đúng mặt đất voxel, hông hạ theo chân thấp
            engReactPost(e, dt, t); // phản ứng: quay đầu nhìn, nhịp cử chỉ (trước engSeatPost — nơi áp góc quay đầu)
            engSeatPost(e, dt);     // dang tay tới tay vịn · đầu quay dẫn hướng · đám mây suy nghĩ đứng thẳng trên hông
            if (e.fishBiteK !== undefined) { if (e.phase === 'fish') updateFishingBite(e, dt, t, e.fishBiteK); e.fishBiteK = undefined; }
            splashFx.update(dt);   // giật cần + dây câu tính SAU khi tư thế đã mượt → đầu dây luôn khớp ngọn cần
            engReactArms(e, dt, t); // phản ứng: đích tay cử chỉ — sau khi đầu đã quay / cúi xong khung này
            engArmPost(e, dt);      // khuỷu tay + cổ tay (IK 2 đoạn giữ đúng chỗ bàn tay) · eo vặn theo nhịp bước
            engFace.tick(e, dt, t); // nét mặt in, nói có khẩu hình, chớp mắt, dáng theo cảm xúc, bàn tay nắm / mở (engineer/body/face.js)
            for (const k in ENG_JOBS) if (ENG_JOBS[k].tick) ENG_JOBS[k].tick(e, dt, t);   // đồ cầm theo bàn tay đã đặt xong: sào + quả, cuộn thảm + kính, bay xới + bình tưới, củi (engineer/mind/task-table.js)
            lapHeldTick(e);         // tờ giấy dán trong tay khi đi ghim lên bảng (engineer/tasks/laptop-work.js)
            if (e.act === 'sleep' && e.g.parent === caravanObj) engSleepPost(e);   // chăn phủ theo thân đã hiển thị (engineer/tasks/sleep.js)
            for (const k in ENG_JOBS) if (e.phase !== k && ENG_JOBS[k].idle) ENG_JOBS[k].idle(e);   // việc bị cắt ngang (mưa, hết giờ, lệnh khác, vào giường): cất đồ về chỗ, về dáng đứng
          }
