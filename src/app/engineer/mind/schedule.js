        // ---- bàn học trong caravan (nghiên cứu ban ngày, học bài buổi tối): lối giữa → sau ghế → kéo ghế ra → vòng ra trước → ngồi, mở laptop ----
        const engStudyPts = (() => {
          const ch = caravanObj.userData.interior.study.chair.center, cx = ch[0], cz = ch[1];
          return { cx, cz, aisle: vanPt(1.30, TR.yIn, 0.12), yaw: caravanObj.rotation.y + Math.PI };   // ghế quay về −Z cục bộ (mặt bàn)
        })();
        // ghế bàn học: lối đi Transit hẹp ⇒ đứng cạnh ghế, xoay ghế về phía mình, ngồi rồi xoay về bàn (engineer/tasks/van-stations.js stDesk)
        const STUDY_PULL = 0.1, STUDY_FZ = 0.37;   // ghế lùi 10 cm khi xoay (tay vịn khỏi vướng mép bàn)
        const STUDY_SEAT = makeSeat({ name: 'study', indoor: true, pos: new THREE.Vector3(), yaw: engStudyPts.yaw, seatZ: 0, standZ: STUDY_FZ * CAMP_SCALE, contactZ: 0.09,
          seatDrop: 0.56, legs: [-1.48, -1.44], knees: [0.98, 0.94], arm: null, ground: () => dogInside.y });   // ghế thấp hơn ghế xếp: cẳng chân chếch ra trước dưới gầm bàn
        function studyChairAt(off, sx = studyChairRig.sx, sw = studyChairRig.sw) {   // ghế văn phòng: lăn dọc trục trước–sau (off) + ngang (sx) (đv xe), xoay mâm sw (rad)
          const R = studyChairRig; R.off = off; R.sx = sx; R.sw = sw;                  // + cập nhật mô tả ghế (vị trí, hướng) cho bộ điều khiển ngồi: người xoay / lăn theo ghế
          if (R.obj) { R.obj.position.z = R.home + off; R.obj.position.x = sx; R.swivel.rotation.y = sw; }
          STUDY_SEAT.pos.copy(vanPt(engStudyPts.cx + sx, TR.yIn, engStudyPts.cz + off));
          const y = engStudyPts.yaw + sw, C = STUDY_SEAT; C.yaw = y; C.fx = Math.sin(y); C.fz = Math.cos(y); C.xx = Math.cos(y); C.xz = -Math.sin(y);
        }
        studyChairAt(0);
        // ====== LỊCH SINH HOẠT CẢ NGÀY CỦA KỸ SƯ (theo giờ Pleiku thật) ======
        //  06:00 dậy, ngồi mép giường rồi đi vệ sinh · 06:12 ăn sáng ở bàn vuông trong xe (ngũ cốc, sữa, cà phê), ăn xong rửa bát · 06:40 ra trại:
        //  cột khí tượng, trà, dạo, uống nước, vuốt chó · 07:15–10:45 nghiên cứu ở bàn học · 10:45 vệ sinh · 10:55 nấu udon · 11:25 ăn udon ở bàn vuông,
        //  rửa bát · 12:15 trà rồi ngủ trưa trên ghế · 13:00–16:00 nghiên cứu · 16:00 vệ sinh · 16:10 ra cây táo hái 3 quả bằng sào, ăn hết trong ngày (engineer/tasks/apple-pick.js) · 16:35 dạo trại · 16:45 chiên cơm trứng · 17:15 bưng chảo
        //  ra hiên ăn tối · 18:00 mang chảo vào rửa, tắm — cả việc 3 phút (G 14/10) · 18:03 câu cá · 19:30 đọc sách, ăn khoai tây chiên
        //  20:00 học bài, laptop mở nhạc · 20:42 ngắm sao 1 tiếng (trời quang; mây / mưa thì đọc sách) · 21:42 ngồi mép giường tháo mũ · 21:45 ngủ (ENG_SLEEP_H).
        //  Mưa: việc ngoài trời trống (dạo trại, câu cá) đổi sang ngồi dưới hiên; ăn, nghỉ, đọc sách vốn đã dưới hiên nên giữ nguyên.
        //  Việc có điểm dừng (vệ sinh, tắm, nấu, ăn trong xe): xong sớm thì sang luôn việc kế tiếp; hết giờ mà chưa xong thì làm nốt rồi mới đi.
        const ENG_DAY = [[0, 'sleep'], [ENG_WAKE_H, 'toilet'], [6.2, 'breakfast'], [6 + 40 / 60, 'outdoor'], [7.25, 'research'], [10.75, 'toilet'], [10 + 55 / 60, 'cook'], [11 + 25 / 60, 'lunch'],
          [12.25, 'rest'], [13, 'research'], [15 + 20 / 60, 'drone'], [15 + 50 / 60, 'rest'], [16, 'toilet'], [16 + 10 / 60, 'apples'], [16 + 35 / 60, 'outdoor'], [16.75, 'cook'], [17.25, 'dinner'], [18, 'shower'], [18 + 3 / 60, 'fish'],
          [19.5, 'read'], [20, 'music'], [ENG_SLEEP_H - 1.05, 'stars'], [ENG_SLEEP_H - 0.05, 'bedtime'], [ENG_SLEEP_H, 'sleep']];   // 20:42–21:42 ngắm sao nếu trời quang (engineer/tasks/sky-watch.js), không thì đọc tiếp
        const ENG_ACTS = {
          sleep: { van: 1, label: 'Ngủ' }, toilet: { van: 1, once: 1, label: 'Vệ sinh', plan: ['wc', 'cleanWc', 'sink'] },
          breakfast: { van: 1, once: 1, label: 'Ăn sáng', plan: ['table', 'dishes'] }, research: { van: 1, label: 'Nghiên cứu', plan: ['desk'] },
          cook: { van: 1, once: 1, label: 'Nấu ăn', plan: ['stove'] }, lunch: { van: 1, once: 1, label: 'Ăn trưa', plan: ['table', 'dishes'] },
          shower: { van: 1, once: 1, label: 'Tắm', plan: ['shelfOff', 'shower', 'towel', 'cleanBath', 'shelfOn'] },
          music: { van: 1, label: 'Học bài, nghe nhạc', plan: ['desk'] }, bedtime: { van: 1, label: 'Chuẩn bị ngủ', plan: ['bed'] },
          outdoor: { label: 'Dạo quanh trại' }, apples: { once: 1, label: 'Hái táo' }, rest: { label: 'Nghỉ trưa' }, dinner: { label: 'Ăn tối' },
          fish: { label: 'Câu cá' }, read: { label: 'Đọc sách' }, shelter: { label: 'Trú mưa dưới hiên' }, drone: { once: 1, label: 'Bay drone khảo sát' }, engine: { label: 'Kiểm tra máy xe' },
          snack: { van: 1, label: 'Ăn nhẹ', plan: ['table', 'dishes'] }, pet: { label: 'Chơi với chó' }, explore: { label: 'Đi dạo khám phá' },   // việc tự chủ (engineer/mind/autonomy.js)
          trim: { label: 'Cắt cỏ quanh trại' },   // sau mưa, cỏ ráo (engineer/tasks/trim-grass.js)
          eatApple: { label: 'Ăn táo' },   // giỏ còn táo hái hôm nay: ra giỏ lấy 1 quả, về ghế ăn (engineer/tasks/apple-pick.js eat / eatWant)
          stars: { label: 'Ngắm sao' }, rainwatch: { label: 'Ngắm mưa' }, garden: { label: 'Chăm luống cà rốt' },   // tự chủ đợt 2 (engineer/tasks/sky-watch.js, carrot-garden.js)
          chair: { label: 'Ngồi đọc sách, uống trà' }, wood: { label: 'Bỏ củi vào lò' },   // chỉ theo lệnh bảng Tools / bấm ghế, lò (engineer/tasks/tool-jobs.js)
          fire: { label: 'Dập / nhóm lửa trại' }   // > 30 °C dập, < 28 °C (hoặc cần nướng cá) nhóm lại (engineer/tasks/campfire-keep.js)
        };
        function engScheduleAt(h) {
          let k = 0; for (let i = 1; i < ENG_DAY.length; i++) if (h >= ENG_DAY[i][0]) k = i;
          const end = k + 1 < ENG_DAY.length ? ENG_DAY[k + 1][0] : 24, n = (k + 1) % ENG_DAY.length;
          return { k, act: ENG_DAY[k][1], end, left: (end - h) * 3600, next: ENG_DAY[n][1], nextEnd: n + 1 < ENG_DAY.length ? ENG_DAY[n + 1][0] : 24 };
        }
        let engForceAct = null;   // người xem bấm dụng cụ (ui/xray-lifecycle.js): 'drone' (▶ Chơi) · 'apples' (Hái táo) · 'engine' (▶ Khởi động máy) · 'trim' — hoặc bảng Tools (ui/tools-panel.js): + 'stars', 'fish' — làm ngay việc này, xong thì về lịch cũ
        // việc 1-lần đã xong hôm nay: khoá việc@giờ-hết-khung@ngày (G 24/10: tập hợp thay 1 khoá — việc kế xong sớm không xoá dấu việc trước)
        const engDone = (e, key) => e.doneAct === key || (!!e.doneSet && e.doneSet.has(key));
        function engMarkDone(e) { if (!e.onceKey) return; e.doneAct = e.onceKey; (e.doneSet || (e.doneSet = new Set())).add(e.onceKey); }
        const ENG_WANT_HOLD = new Set(['garden', 'trim', 'eatApple']);   // việc tự chọn (chăm luống, cắt cỏ, ăn táo) vừa bắt đầu: giữ ≥ 20 s
        function engWantAct(e, hh) {   // việc cần làm lúc này (đặt e.actLeft = số giây còn lại của khung giờ) · đang nằm ngắm sao mà việc đổi: giữ 'stars' tới khi cất thảm xong
          let a = engWantAct0(e, hh);
          if (a !== e.act && ENG_WANT_HOLD.has(e.act) && clock.elapsedTime - (e.actT0 || 0) < 20 && !liveWeather.state.raining && !engForceAct) { a = e.act; e.actLeft = Math.max(e.actLeft || 0, 60); }   // G 24/10: điều kiện muốn tắt giữa lúc còn đang đứng dậy khỏi ghế (thỏ thôi ăn) ⇒ trước: đứng lên 3 s rồi ngồi lại, nhấp nhổm
          if (a !== 'stars' && skyWatch.busy()) { skyWatch.stop(); e.actLeft = 120; return 'stars'; }
          return a;
        }
        function engWantAct0(e, hh) {
          if (engForceAct === 'apples' && !applePick.canPick()) engForceAct = null;   // giỏ còn táo chưa ăn: không hái lại
          if (ENG_CMD_HOURS[engForceAct] && !engHourOk(ENG_CMD_HOURS[engForceAct], hh)) {   // lệnh ngoài khung giờ (vd ngắm sao trước 19:00 — engineer/mind/hours.js): bỏ; việc đã bắt đầu thì làm nốt
            const started = engForceAct === 'stars' ? skyWatch.busy() : engForceAct === 'garden' ? gardenJob.busy() : engForceAct === 'trim' ? trimJob.busy() : e.phase === 'fish';
            if (!started) engForceAct = null; }
          if (engForceAct) { const w = liveWeather.state; if ((w.raining && engForceAct !== 'chair' && engForceAct !== 'wood') || (engForceAct === 'drone' && (w.windSpeed || 0) / 3.6 > 9)) engForceAct = null; else { e.actLeft = 900; return engForceAct; } }   // mưa: huỷ việc ngoài trời (ghế dưới bạt, lò thì vẫn làm)
          const s = engScheduleAt(hh); let act = s.act, left = s.left;
          const napping = e.phase === 'nap';   // đang ngủ trưa trên ghế (G 24/10: trước bị gọi dậy chăm luống 4 lần, vuốt chó 1 lần trong 45 phút nghỉ trưa)
          { const fw = napping && !fireJob.busy() ? null : fireWant(e, hh, act); if (fw) { e.actLeft = 600; return fw; } }   // lửa trại theo nhiệt độ: > 30 °C dập · < 28 °C hoặc cá cần nướng thì nhóm (engineer/tasks/campfire-keep.js)
          { const tw = napping && !trimJob.busy() ? null : trimWant(e, hh, act); if (tw) { e.actLeft = 900; return tw; } }   // sau mưa cỏ ráo: phát cỏ quanh trại (engineer/tasks/trim-grass.js)
          if (act === 'stars' && !skyWatch.want(hh)) act = 'read';   // mây / mưa / đã ngắm: đọc sách tiếp dưới hiên
          { const gw = napping ? null : gardenWant(e, hh, act); if (gw) { e.actLeft = 600; return gw; } }   // luống cà rốt: trồng lại hố trống, tưới, xem thỏ ăn (engineer/tasks/carrot-garden.js)
          if (ENG_ACTS[act].once) {   // xong sớm ⇒ sang luôn việc kế; việc kế cũng 1-lần (nấu → ăn trưa) thì giữ khoá CỦA NÓ: làm xong là đánh dấu ngay
            const day = new Date().toDateString(); let k = s.k;   // (theo ngày: hôm sau vẫn đi vệ sinh, vẫn tắm) · trước: khoá chỉ đặt khi tới giờ khung ⇒ ăn trưa xong 11:22 đứng không trong xe tới 11:25
            for (let n = 0; n < 4; n++) {
              const a = ENG_DAY[k][1], end = k + 1 < ENG_DAY.length ? ENG_DAY[k + 1][0] : 24, key = a + '@' + end + '@' + day;
              if (!ENG_ACTS[a].once) break;
              if (!engDone(e, key)) { if (e.onceKey !== key) { e.onceKey = key; e.onceEnd = end; } break; }
              k = (k + 1) % ENG_DAY.length;
            }
            act = ENG_DAY[k][1]; left = ((k + 1 < ENG_DAY.length ? ENG_DAY[k + 1][0] : 24) - hh) * 3600;
          } else if (e.act && ENG_ACTS[e.act].once && e.onceKey && !engDone(e, e.onceKey) && e.onceKey.startsWith(e.act + '@') && hh < e.onceEnd + 0.2 && hh > e.onceEnd - 1) { act = e.act; left = 0; }
          if (act === 'apples' && !applePick.canPick()) act = 'outdoor';   // táo hôm qua còn trong giỏ / cây hết quả trong tầm: thay hái bằng dạo trại
          if ((act === 'outdoor' || act === 'fish' || act === 'apples' || act === 'drone') && liveWeather.state.fresh && liveWeather.state.raining) act = 'shelter';
          if (act === 'drone' && (liveWeather.state.windSpeed || 0) / 3.6 > 9) act = 'rest';   // gió > 9 m/s: drone 249 g không bay (engineer/tasks/drone.js)
          { const ea = napping ? null : applePick.eatWant(e, hh, act); if (ea) { e.actLeft = 600; return ea; } }   // táo hái hôm nay phải ăn trong ngày (engineer/tasks/apple-pick.js)
          const au = autoWant(e, hh, act); if (au) { e.actLeft = Math.max(30, AUTO.until - clock.elapsedTime); return au; }   // tự chủ theo nhu cầu / lệnh bấm thanh (engineer/mind/autonomy.js)
          e.actLeft = Math.max(0, left); return act;
        }
        const engPhaseFor = act => ENG_ACTS[act].van ? 'van' : act === 'dinner' && grill.st === 'ready' ? 'toGrill' : act === 'dinner' && grill.st !== 'held' && chiminea.oven.fish.ready() >= 0 ? 'toSmokerOut' : act === 'fish' ? 'toFish' : act === 'apples' ? 'apple' : act === 'eatApple' ? 'appleEat' : act === 'drone' ? 'drone' : act === 'engine' ? 'engine' : act === 'trim' ? 'trim' : act === 'stars' ? 'stars' : act === 'rainwatch' ? 'rainwatch' : act === 'garden' ? 'garden' : act === 'wood' ? 'wood' : act === 'fire' ? 'fire' : act === 'pet' ? 'toDog' : act === 'explore' ? 'explore' : act === 'outdoor' ? 'toMast' : act === 'shelter' ? 'toShelter' : 'toChair';
        function engChairPhase(e, act) {   // đã ngồi ghế cắm trại: làm gì, bao lâu
          if (act === 'dinner' && grill.st === 'held') { e.timer = e.eatLen = 76; return 'eatFish'; }   // cầm que cá nướng về: ăn cá trước (8 miếng), rồi mới ăn cơm chiên
          if (act === 'lunch' || act === 'dinner') { e.timer = Math.max(60, Math.min(1200, e.actLeft - 900)); return 'eat'; }
          if (act === 'rest') { e.timer = Math.max(30, Math.min(720, e.actLeft - 1200)); return 'tea'; }
          if (act === 'read') return 'read';
          if (act === 'chair') { e.timer = 600; e.rtK = 25; e.rtTea = false; return 'read'; }   // Tools "Ghế cắm trại": đọc sách xen uống trà 10 phút (chairTea, engineer/tasks/tool-jobs.js)
          if (act === 'shelter') return 'shelter';
          e.timer = 150; return 'tea';   // dạo trại: ngồi nghỉ chân uống trà
        }
        function engSetAct(e, act) {
          e.act = act; e.actT0 = clock.elapsedTime;
          if (e.phase === 'fish') { e.timer = Math.min(e.timer, 0); return; }   // đang câu: thu dây, dìu cá xong mới đổi việc (nhánh câu tự chuyển)
          e.phase = engPhaseFor(act); e.timer = 0; e.wanderTgt = null; e.wanderTmr = 0;
        }
        function engSpawn(e, act) {   // mở trang giữa chừng một việc: đặt kỹ sư sẵn ở chỗ đang làm
          e.act = act; e.phase = engPhaseFor(act); e.timer = 0; e.enter = null;
          const A = ENG_ACTS[act];
          if (A.van) {
            const V = e.van = engVanNew('hall'); e.inVan = true; V.act = act; V.plan = A.plan || []; V.idx = 0;
            const at = (node, station, st) => { V.node = node; V.station = station; V.st = st; };
            if (act === 'research' || act === 'music') { studyChairAt(0, 0, 0); e.seat = engNewSeat(STUDY_SEAT, 'seated'); at('mid', 'desk', 'work'); studyLaptop.open = 1; }
            else if (act === 'breakfast' || act === 'lunch') {
              stoolAt(STOOL_IN); e.seat = engNewSeat(STOOL_SEAT, 'seated'); at('tbl', 'table', 'eat');
              e.dish = { kind: act === 'lunch' ? 'udon' : 'cereal', at: 'table', food: 1 }; V.t0 = clock.elapsedTime; V.f0 = 1; V.dur = Math.max(90, Math.min(act === 'lunch' ? 900 : 720, e.actLeft - 150));
            }
            else if (act === 'cook') { at('stove', 'stove', null); e.g.position.set(VN.stove.x, VAN_FLOOR - ENG_FEET, VN.stove.z); e.g.rotation.set(0, VY.pz, 0); }
            else if (act === 'bedtime') { e.seat = engNewSeat(BED_SEAT, 'seated'); at('bed', 'bed', 'seated'); V.k = 3; engHelmet(e, 'bed'); }
            else if (act === 'toilet') { e.seat = engNewSeat(TOILET_SEAT, 'seated'); LID.k = LID.target = 1; at('wcIn', 'wc', 'seated'); V.until = clock.elapsedTime + Math.max(30, Math.min(240, e.actLeft - 75)); }
            else if (act === 'shower') {
              engHelmet(e, 'shelf'); at('wcIn', 'shower', 'wash'); V.idx = 1; V.until = clock.elapsedTime + Math.max(60, Math.min(600, e.actLeft - 130)); showerFx.on = true; showerFx.steam = 0.6;
              e.g.position.set(SHOWER_SPOT.x, VAN_FLOOR - ENG_FEET, SHOWER_SPOT.z); e.g.rotation.set(0, VY.nz, 0);
            }
          } else if (act === 'dinner' || act === 'rest' || act === 'read' || act === 'shelter') {
            e.seat = engNewSeat(CAMP_SEAT, 'seated'); e.phase = engChairPhase(e, act);
            if (act === 'dinner') { e.dish = { kind: 'pan', at: 'camp', food: 1 }; e.eatT0 = e.timer; }
          } else if (act === 'fish') { e.seat = engNewSeat(FISH_SEAT, 'seated'); e.phase = 'fish'; e.timer = e.actLeft; }
          // dạo trại: xuất phát trước cửa xe (wp[0]) như cũ
        }
