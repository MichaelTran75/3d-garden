        // ---- bàn học trong caravan (nghiên cứu ban ngày, học bài buổi tối): lối giữa → sau ghế → kéo ghế ra → vòng ra trước → ngồi, mở laptop ----
        const engStudyPts = (() => {
          const ch = caravanObj.userData.interior.study.chair.center, cx = ch[0], cz = ch[1];
          return { cx, cz, aisle: vanPt(1.45, 1.07, 0.25), yaw: caravanObj.rotation.y + Math.PI };   // ghế quay về −Z cục bộ (mặt bàn)
        })();
        // ghế bàn học: khe mép ghế–mép bàn chỉ 17,5 cm (đv xe), giữa đuôi giường và ghế 62 cm < bề ngang vai kỹ sư ⇒ đứng sau ghế nắm tựa lưng KÉO GHẾ RA
        // 55 cm (ra lối đi), vòng bên trái ra trước mặt ghế, quay lưng, ngồi xuống rồi nhích cả ghế vào sát bàn; hết giờ: nhích ghế ra, đứng dậy, vòng ra sau, đẩy ghế vào
        const STUDY_PULL = 0.45, STUDY_FZ = 0.37;
        const STUDY_SEAT = makeSeat({ name: 'study', indoor: true, pos: new THREE.Vector3(), yaw: engStudyPts.yaw, seatZ: 0, standZ: STUDY_FZ * CAMP_SCALE, contactZ: 0.09,
          seatDrop: 0.56, legs: [-1.48, -1.44], knees: [0.98, 0.94], arm: null, ground: () => dogInside.y });   // ghế thấp hơn ghế xếp: cẳng chân chếch ra trước dưới gầm bàn
        function studyChairAt(off) {   // dời ghế bàn học dọc trục trước–sau của nó (đv xe) + cập nhật mô tả ghế cho bộ điều khiển ngồi
          studyChairRig.off = off; if (studyChairRig.obj) studyChairRig.obj.position.z = studyChairRig.home + off;
          STUDY_SEAT.pos.copy(vanPt(engStudyPts.cx, 1.07, engStudyPts.cz + off));
        }
        studyChairAt(0);
        // ====== LỊCH SINH HOẠT CẢ NGÀY CỦA KỸ SƯ (theo giờ Pleiku thật) ======
        //  06:00 dậy, ngồi mép giường rồi đi vệ sinh · 06:12 ăn sáng ở bàn vuông trong xe (ngũ cốc, sữa, cà phê), ăn xong rửa bát · 06:40 ra trại:
        //  cột khí tượng, trà, dạo, uống nước, vuốt chó · 07:15–10:45 nghiên cứu ở bàn học · 10:45 vệ sinh · 10:55 nấu udon · 11:25 ăn udon ở bàn vuông,
        //  rửa bát · 12:15 trà rồi ngủ trưa trên ghế · 13:00–16:00 nghiên cứu · 16:00 vệ sinh · 16:10 ra cây táo hái 4 quả bằng sào (engineer/apple-pick.js) · 16:35 dạo trại · 16:45 chiên cơm trứng · 17:15 bưng chảo
        //  ra hiên ăn tối · 18:00 mang chảo vào rửa, tắm — cả việc 3 phút (G 14/10) · 18:03 câu cá · 19:30 đọc sách, ăn khoai tây chiên
        //  20:30 học bài, laptop mở nhạc · 20:57 ngồi mép giường tháo mũ · 21:00 ngủ.
        //  Mưa: việc ngoài trời trống (dạo trại, câu cá) đổi sang ngồi dưới hiên; ăn, nghỉ, đọc sách vốn đã dưới hiên nên giữ nguyên.
        //  Việc có điểm dừng (vệ sinh, tắm, nấu, ăn trong xe): xong sớm thì sang luôn việc kế tiếp; hết giờ mà chưa xong thì làm nốt rồi mới đi.
        const ENG_DAY = [[0, 'sleep'], [6, 'toilet'], [6.2, 'breakfast'], [6 + 40 / 60, 'outdoor'], [7.25, 'research'], [10.75, 'toilet'], [10 + 55 / 60, 'cook'], [11 + 25 / 60, 'lunch'],
          [12.25, 'rest'], [13, 'research'], [15 + 20 / 60, 'drone'], [15 + 50 / 60, 'rest'], [16, 'toilet'], [16 + 10 / 60, 'apples'], [16 + 35 / 60, 'outdoor'], [16.75, 'cook'], [17.25, 'dinner'], [18, 'shower'], [18 + 3 / 60, 'fish'],
          [19.5, 'read'], [20.5, 'music'], [20.95, 'bedtime'], [21, 'sleep']];
        const ENG_ACTS = {
          sleep: { van: 1, label: 'Ngủ' }, toilet: { van: 1, once: 1, label: 'Vệ sinh', plan: ['wc', 'sink'] },
          breakfast: { van: 1, once: 1, label: 'Ăn sáng', plan: ['table', 'dishes'] }, research: { van: 1, label: 'Nghiên cứu', plan: ['desk'] },
          cook: { van: 1, once: 1, label: 'Nấu ăn', plan: ['stove'] }, lunch: { van: 1, once: 1, label: 'Ăn trưa', plan: ['table', 'dishes'] },
          shower: { van: 1, once: 1, label: 'Tắm', plan: ['shelfOff', 'shower', 'towel', 'shelfOn'] },
          music: { van: 1, label: 'Học bài, nghe nhạc', plan: ['desk'] }, bedtime: { van: 1, label: 'Chuẩn bị ngủ', plan: ['bed'] },
          outdoor: { label: 'Dạo quanh trại' }, apples: { once: 1, label: 'Hái táo' }, rest: { label: 'Nghỉ trưa' }, dinner: { label: 'Ăn tối' },
          fish: { label: 'Câu cá' }, read: { label: 'Đọc sách' }, shelter: { label: 'Trú mưa dưới hiên' }, drone: { once: 1, label: 'Bay drone khảo sát' }
        };
        function engScheduleAt(h) {
          let k = 0; for (let i = 1; i < ENG_DAY.length; i++) if (h >= ENG_DAY[i][0]) k = i;
          const end = k + 1 < ENG_DAY.length ? ENG_DAY[k + 1][0] : 24, n = (k + 1) % ENG_DAY.length;
          return { act: ENG_DAY[k][1], end, left: (end - h) * 3600, next: ENG_DAY[n][1], nextEnd: n + 1 < ENG_DAY.length ? ENG_DAY[n + 1][0] : 24 };
        }
        let engForceAct = null;   // người xem bấm "▶ Chơi" trên drone / tay cầm (ui/xray-lifecycle.js): làm ngay việc này, xong thì về lịch cũ
        function engWantAct(e, hh) {   // việc cần làm lúc này (đặt e.actLeft = số giây còn lại của khung giờ)
          if (engForceAct === 'drone') { const w = liveWeather.state; if (w.raining || (w.windSpeed || 0) / 3.6 > 9) engForceAct = null; else { e.actLeft = 900; return 'drone'; } }
          const s = engScheduleAt(hh); let act = s.act, left = s.left;
          if (ENG_ACTS[act].once) {
            const key = act + '@' + s.end + '@' + new Date().toDateString();   // theo ngày: hôm sau vẫn đi vệ sinh, vẫn tắm
            if (e.doneAct === key) { act = s.next; left = (s.nextEnd - hh) * 3600; }
            else if (e.onceKey !== key) { e.onceKey = key; e.onceEnd = s.end; }
          } else if (e.act && ENG_ACTS[e.act].once && e.onceKey && e.doneAct !== e.onceKey && e.onceKey.startsWith(e.act + '@') && hh < e.onceEnd + 0.2 && hh > e.onceEnd - 1) { act = e.act; left = 0; }
          if ((act === 'outdoor' || act === 'fish' || act === 'apples' || act === 'drone') && liveWeather.state.fresh && liveWeather.state.raining) act = 'shelter';
          if (act === 'drone' && (liveWeather.state.windSpeed || 0) / 3.6 > 9) act = 'rest';   // gió > 9 m/s: drone 249 g không bay (engineer/drone.js)
          e.actLeft = Math.max(0, left); return act;
        }
        const engPhaseFor = act => ENG_ACTS[act].van ? 'van' : act === 'dinner' && grill.st === 'ready' ? 'toGrill' : act === 'fish' ? 'toFish' : act === 'apples' ? 'apple' : act === 'drone' ? 'drone' : act === 'outdoor' ? 'toMast' : act === 'shelter' ? 'toShelter' : 'toChair';
        function engChairPhase(e, act) {   // đã ngồi ghế cắm trại: làm gì, bao lâu
          if (act === 'dinner' && grill.st === 'held') { e.timer = e.eatLen = 76; return 'eatFish'; }   // cầm que cá nướng về: ăn cá trước (8 miếng), rồi mới ăn cơm chiên
          if (act === 'lunch' || act === 'dinner') { e.timer = Math.max(60, Math.min(1200, e.actLeft - 900)); return 'eat'; }
          if (act === 'rest') { e.timer = Math.max(30, Math.min(720, e.actLeft - 1200)); return 'tea'; }
          if (act === 'read') return 'read';
          if (act === 'shelter') return 'shelter';
          e.timer = 150; return 'tea';   // dạo trại: ngồi nghỉ chân uống trà
        }
        function engSetAct(e, act) {
          e.act = act;
          if (e.phase === 'fish') { e.timer = Math.min(e.timer, 0); return; }   // đang câu: thu dây, dìu cá xong mới đổi việc (nhánh câu tự chuyển)
          e.phase = engPhaseFor(act); e.timer = 0; e.wanderTgt = null; e.wanderTmr = 0;
        }

