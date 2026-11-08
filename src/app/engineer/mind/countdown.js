        // ĐỒNG HỒ ĐẾM NGƯỢC MỖI VIỆC: còn bao lâu xong việc đang làm,
        //  hiện "icon m:ss" chữ vàng trên đầu (cùng kiểu đếm ngược câu cá — engineer/mind/thought-bubble.js) · bay drone: góc OSD khung camera (engineer/tasks/drone.js).
        //  Ước lượng = min(HẠN: hết khung giờ / lệnh nghiên cứu, đọc sách / thời lượng tự chủ, CHỖ DỪNG của việc): việc lặp tính theo phần còn lại (quả táo, điểm cỏ,
        //  điểm bay, hố trồng, lượt tưới); việc ngồi theo đồng hồ của chính nó (e.timer, V.until, V.t0 + V.dur, nồi / chảo); còn lại theo bảng giây đo sẵn từ đầu
        //  mỗi bước tới lúc xong (đầu dò tools/engineer-audit 05/11, lệnh gọi từ bàn học) — bước không có trong bảng thì đếm tiếp từ lần neo trước.
        //  Số hiện chạy đều 1 s/s, lệch ước lượng thì trôi dần về (không nhảy số). Không hiện: ngủ (bảng giờ dậy riêng — engineer/tasks/sleep-fx.js),
        //  trú mưa (không biết lúc tạnh), câu cá (đếm ngược + trạng thái cá có sẵn).
        const ENG_CD_ICON = { cook: '🍳', breakfast: '🥣', lunch: '🍜', dinner: '🍽️', snack: '🥪', toilet: '🚻', shower: '🚿', wash: '🧼', research: '💻', music: '🎧',
          deskread: '📖', read: '📖', chair: '📖', bedtime: '🛏️', outdoor: '🚶', rest: '☕', drone: '🚁', apples: '🍎', eatApple: '🍏', trim: '✂️', garden: '🥕',
          engine: '🔧', stars: '🔭', rainwatch: '🌧️', fire: '🔥', wood: '🪵', smoke: '🐟', explore: '🧭', pet: '🐕' };
        const ENG_CD_SLOT = new Set(['research', 'music', 'deskread', 'read', 'rest', 'outdoor', 'bedtime', 'pet', 'explore', 'rainwatch']);   // việc kéo tới hết khung giờ / lệnh / tự chủ (+ bữa tối theo lịch)
        const ENG_CD_TYP = { toilet: 86.5, wash: 32, fire: 37, wood: 28, engine: 183.5, drone: 238.5, apples: 96.5, garden: 62, trim: 290.5, cook: e => 15 + cdCookLeft(e, null, 0),
          breakfast: 750, lunch: 800, snack: 520, shower: 124, eatApple: 60, smoke: 745, explore: 120, pet: 60, chair: 610, rainwatch: 110, dinner: 400, stars: 3600 };   // cả việc (s): lúc chưa có bước nào để neo
        // giây từ lúc VÀO bước tới lúc xong việc (đo 05/11) · trong xe: 'trạm.bước'
        const ENG_CD_TL = {
          engine: { idle: 170.5, walk: 165.5, near: 160.5, key: 159.5, lift: 158, fetch: 155.5, fetchN: 153, pick: 152, carry: 150.5, carryN: 146.5, set: 146, up: 144.5,
            check: 142, holo: 136, start: 46.5, watch: 45, stop: 16.5, cool: 15, close: 13, down: 10.5, grab: 8, back: 6.5, backN: 2.5, stow: 2 },
          drone: { idle: 225.5, toTable: 220.5, grab: 218, carry: 216, place: 201, back: 196.5, ready: 194.5, arm: 189, land: 22, fetch: 15, pick: 13, home: 9.5, park: 2 },
          apples: { idle: 89.5, walk: 80, grab: 56.5, stow: 13.5, 'lift-b': 12, carry: 10.5, put: 1.5 },
          trim: { back: 15.5, stop: 9, lay: 7.5, doff: 5, wipe: 2.5 },
          garden: { toCan: 20, pickCan: 16.5, toCanBack: 3, putCan: 1.5 },
          toilet: { 'wc.go': 74, 'wc.face': 73.5, 'wc.sit': 72, 'wc.rise': 39.5, 'wc.turn': 37.5, 'wc.flush': 35.5, 'wc.back': 33, 'cleanWc.go': 32.5, 'cleanWc.face': 32,
            'cleanWc.take': 30.5, 'cleanWc.scrub': 28.5, 'cleanWc.put': 22.5, 'cleanWc.flush': 21, 'cleanWc.back': 18.5, 'sink.face': 16.5, 'sink.wash': 15.5 },
          wash: { 'sink.face': 16, 'sink.wash': 15 },
          fire: { 'fire.idle': 18, 'fire.toKit': 17.5, 'fire.grab': 14, 'fire.toFire': 12.5, 'fire.pour': 11, 'fire.stir': 9.5, 'fire.pour2': 6, 'fire.check': 4.5, 'fire.toKitBack': 2.5, 'fire.put': 1 },   // dập lửa
          wood: { 'wood.idle': 8, 'wood.toPile': 7.5, 'wood.pick': 5.5, 'wood.carry': 4, 'wood.feed': 3.5 },
          eatApple: { 'eat.go': 50, 'eat.take': 47, 'eat.sit': 45.5, 'eat.bite': 37, 'eat.toss': 4.5 }
        };
        const CD_MEAL_PRE = { '': 7.5, face: 7, in: 6, sit: 4, scoot: 2 }, CD_MEAL_POST = { 'table.unscoot': 35.5, 'table.rise': 33.5, 'table.out': 31.5, 'dishes.face': 25.5, 'dishes.wash': 24, 'dishes.stow': 2 };
        const CD_UDON_BOIL = new Set(['boil', 'toBoard', 'boardFace', 'knifeTake', 'chop', 'knifeBack', 'backStove', 'backFace']), CD_UDON_END = { off: 10, bowl: 8.5, pour: 6.5, garnish: 3, take: 1.5 };
        const CD_RICE_PRE = { toPeg: 25, pegFace: 23.5, takePan: 22, toStove: 20.5, stoveFace: 19, place: 17.5, panOn: 16, heat: 14.5, add: 2.5 };   // tới lúc bắt đầu chiên
        const CD_APPLE = { look: 14, aim: 13, cup: 11.5, twist: 10.5, retract: 9.5, plant: 8, take: 7, inspect: 6, drop: 3.5, lift: 1 }, CD_APPLE_N = 3;   // 1 quả (giây từ bước tới quả kế) · N_PICK (engineer/tasks/apple-pick.js)
        const CD_SHOWER_AFTER = 9, CD_TOWEL_AFTER = 27;   // tắt nước, vẩy đầu → khăn · treo khăn, lau nhà tắm, lấy mũ (giây)
        const CD_STARS_POST = { lie: 50, up: 48, off: 43, roll: 38, back: 25, put: 1.5 }, CD_STARS_PRE = { };   // từ lúc dậy (nằm: đang đẩy màn về) tới lúc cất thảm xong
        const CD_TRIM_PRE = { toStart: 15, start: 12, toDon: 6.5, don: 6, toGrab: 2.5, grab: 2 }, CD_TRIM_PT = 2, CD_TRIM_SEG = 2;   // chuẩn bị: tới lúc cắt · giây / điểm cắt (cách 0,45 m) · giây / đoạn
        const _cdA = new THREE.Vector3();
        function cdDroneFly(D) {   // giây bay còn lại: quãng tới từng điểm bay / tốc độ + tăng tốc, hãm, treo (fly() — engineer/tasks/drone.js)
          let s = 0, x = D.pos.x, y = D.pos.y, z = D.pos.z;
          for (let i = D.wi; i < D.wp.length; i++) {
            const W = D.wp[i], v = W.v || 4.5;
            if (W.loop) {   // vòng quanh đảo: tới điểm dẫn + phần vòng còn lại, xong vòng về lại điểm đầu vòng
              const R = W.loop, started = W.s !== undefined, lead = started ? W.s : (W.cdS ??= R.near(_cdA.set(x, y, z))), n = started ? W.n : 0;   // W.s: điểm dẫn (đã cộng W.n)
              R.at(lead, _cdA); s += Math.max(0, Math.hypot(_cdA.x - x, _cdA.z - z) - 14) / v + (R.tot - n) / v;
              R.at(lead - n, _cdA); x = _cdA.x; z = _cdA.z;
            } else {
              s += Math.hypot(W.p.x - x, W.p.y - y, W.p.z - z) / v + 2 + v / 6 + Math.max(0, (W.hover || 0) - (i === D.wi ? W.hold || 0 : 0));
              x = W.p.x; y = W.p.y; z = W.p.z;
            }
          }
          return s;
        }
        function cdTrimLeft(J, sub) {   // điểm cỏ chưa cắt (đoạn đang cắt + các đoạn sau) → giây · 'go': đang tới đầu đoạn mới (J.wi còn của đoạn trước)
          let n = 0; for (let i = J.si; i < J.segs.length; i++) n += J.segs[i].length - (i === J.si && sub !== 'go' && sub !== 'toStart' ? Math.min(J.wi, J.segs[i].length) : 0);
          return n * CD_TRIM_PT + (J.segs.length - J.si) * CD_TRIM_SEG + ENG_CD_TL.trim.back;
        }
        // việc → hàm ước lượng giây còn lại theo trạng thái thật (null: không biết ở bước này — dùng bảng ENG_CD_TL hoặc đếm tiếp từ lần neo trước)
        const ENG_CD_FN = {
          cook: (e, sub, k, now) => e.van && e.van.station === 'stove' && e.van.T ? cdCookLeft(e, e.van, k, now) : null,
          breakfast: cdMeal, lunch: cdMeal, snack: cdMeal,
          toilet: (e, sub, k, now) => sub === 'wc.seated' && e.van.until ? e.van.until - now + 39.5 : null,
          shower: (e, sub, k, now) => sub === 'shower.wash' && e.van.until ? e.van.until - now + CD_SHOWER_AFTER + ENG_TOWEL_DRY + CD_TOWEL_AFTER : sub === 'towel.dry' ? ENG_TOWEL_DRY - k + CD_TOWEL_AFTER : null,
          drone: (e, sub) => sub === 'flying' ? cdDroneFly(droneToy.state) + ENG_CD_TL.drone.land : null,
          apples: (e, sub, k) => {
            const St = applePick.state, c = CD_APPLE[sub]; if (c === undefined) return null;
            const done = sub === 'lift' || (sub === 'drop' && St.k > 1.35);   // quả đang hái đã vào giỏ (St.picked đã cộng)
            return c - k + Math.max(0, CD_APPLE_N - St.picked - (done ? 0 : 1)) * CD_APPLE.look + ENG_CD_TL.apples.stow;
          },
          trim: (e, sub, k) => {
            const J = trimJob.state; if (!J.segs) return null;
            if (CD_TRIM_PRE[sub] !== undefined) return CD_TRIM_PRE[sub] - k + cdTrimLeft(J, 'go');
            return sub === 'go' || sub === 'go2' || sub === 'cut' || sub === 'wait' ? cdTrimLeft(J, sub) : null;
          },
          garden: (e, sub, k) => {
            const J = gardenJob.state, water = ENG_CD_TL.garden.toCan;
            if (sub === 'toSlot' || sub === 'plant') return Math.max(1, (sub === 'toSlot' ? 11 : 5) - k) + Math.max(0, J.list.length - J.n - 1) * 9 + water;
            if (sub === 'toPour' || sub === 'pour') return Math.max(1, (sub === 'toPour' ? 6 : 4) - k) + Math.max(0, 1 - J.n) * 5 + 3;
            return null;
          },
          stars: (e, sub, k) => {   // nằm tới lúc còn 1 phút của khung giờ (theo lệnh: 65 phút) rồi dậy cất kính, cuốn thảm
            const S = skyWatch.state, post = CD_STARS_POST[sub]; if (sub === 'lie' && S.stop) return post; if (post !== undefined && sub !== 'lie') return post - k;
            const lie = engForceAct === 'stars' ? 3900 - (sub === 'lie' ? S.k : 0) : e.actLeft - 60;
            return Math.max(0, lie) + CD_STARS_POST.up + (sub === 'lie' ? 0 : CD_STARS_PRE[sub] ?? 0);
          },
          chair: (e, sub) => e.phase === 'read' && e.timer > 0 ? e.timer : null,
          smoke: (e, sub) => e.phase === 'eatFish' && e.timer > 0 ? e.timer + 1.5 : null,   // chờ cá chín khói (~8 phút): theo bảng cả việc
          dinner: (e, sub) => e.phase === 'eatFish' && e.timer > 0 ? e.timer + 1.5 + 300 : e.phase === 'eat' && e.timer > 0 ? e.timer : null   // ăn tối theo lệnh: cá (76 s) rồi cơm
        };
        function cdCookLeft(e, V, k, now) {   // nấu ở bếp (engineer/tasks/cooking.js stStove) · V = null: chưa tới bếp — món + thời lượng tính như lúc tới bếp
          const udon = (V ? V.recipe : engMealPick || (liveWeather.localHour < 14 ? 'udon' : 'rice')) === 'udon';
          const T = V ? V.T : udon ? Math.max(420, Math.min(1320, e.actLeft - 100)) : Math.max(300, Math.min(840, e.actLeft - 100)), st = V ? V.st || '' : '';
          if (udon) {
            if (CD_UDON_BOIL.has(st) && V.boilDur) return V.t0 + V.boilDur - now + 2.5 + T * 0.5 + 10;
            if (st === 'noodles') return 2.5 - k + T * 0.5 + 10;
            if (st === 'stir' && V.stirDur) return V.t0 + V.stirDur - now + 10;
            if (CD_UDON_END[st] !== undefined) return CD_UDON_END[st] - k;
            return (st === 'on' ? 1.5 : 3) - k + T * 0.9 + 12.5;   // tới bếp, bật lửa
          }
          if (st === 'fry' && V.fryDur) return V.t0 + V.fryDur - now + 3;
          if (st === 'off' || st === 'take') return (st === 'off' ? 3 : 1.5) - k;
          return (CD_RICE_PRE[st] ?? 27) - k + Math.max(120, T - 60) + 3;
        }
        function cdMeal(e, sub, k, now) {   // bữa ở bàn vuông trong xe: ăn tới V.t0 + V.dur, rồi đứng dậy rửa bát (~35 s)
          const V = e.van; if (!V) return null;
          if (sub === 'table.eat' && V.dur) return V.t0 + V.dur - now + CD_MEAL_POST['table.unscoot'];
          if (CD_MEAL_POST[sub] !== undefined) return CD_MEAL_POST[sub] - k;
          if (V.station === 'table' && CD_MEAL_PRE[V.st || ''] !== undefined)   // chưa ngồi: thời lượng ăn tính như lúc ngồi (engineer/tasks/van-stations.js)
            return CD_MEAL_PRE[V.st || ''] - k + Math.max(90, Math.min(e.act === 'lunch' ? 900 : 720, e.actLeft - 150)) + CD_MEAL_POST['table.unscoot'];
          return null;
        }
        const cdSub = e => {   // bước con đang làm: 'trạm.bước' trong xe · trạng thái việc có dụng cụ · không thì pha
          const p = e.phase, V = e.inVan && e.van;
          if (V) return (V.station || '') + '.' + (V.st || '');
          return p === 'drone' ? droneToy.state.st : p === 'apple' ? applePick.state.st : p === 'trim' ? trimJob.state.st : p === 'garden' ? gardenJob.state.st
            : p === 'engine' ? engineJob.state.st : p === 'stars' ? skyWatch.state.st : p === 'fire' ? 'fire.' + fireJob.state.st : p === 'wood' ? 'wood.' + woodJob.state.st
            : p === 'appleEat' ? 'eat.' + (applePick.state.eat ? applePick.state.eat.st : '') : p;
        };
        function cdCap(e, act, now) {   // hạn của việc: lệnh nghiên cứu 20 phút / đọc sách 10 phút · thời lượng tự chủ · hết khung giờ (việc theo lịch kéo dài)
          if (engForceAct === act) return act === 'research' ? 1200 - (now - engForceT0) : act === 'deskread' ? 600 - (now - engForceT0) : Infinity;
          if (AUTO.act === act && now < AUTO.until) return AUTO.until - now;
          return ENG_CD_SLOT.has(act) || act === 'dinner' ? e.actLeft : Infinity;
        }
        const CD = { act: null, sub: null, subT0: 0, est: NaN, estT: 0, show: NaN, t: 0 };
        function engCountdown(e) {   // → { icon, sec } · null: không đếm (ngủ, trú mưa, câu cá, việc không rõ hạn)
          const act = e.act, now = clock.elapsedTime;
          if (!act || !ENG_CD_ICON[act] || e.phase === 'fish' || e.phase === 'shelter' || e.phase === 'toShelter') { CD.act = null; return null; }
          if (act !== CD.act) { const y = ENG_CD_TYP[act]; CD.act = act; CD.sub = null; CD.est = typeof y === 'function' ? y(e) : y ?? NaN; CD.estT = e.actT0 ?? now; CD.show = NaN; }
          const sub = cdSub(e); if (sub !== CD.sub) { CD.sub = sub; CD.subT0 = now; }
          let est;
          if (ENG_CD_SLOT.has(act) || (act === 'dinner' && engForceAct !== act)) est = cdCap(e, act, now);   // việc theo khung giờ: hết khung là thôi (lệnh không hạn: không đếm)
          else {
            const f = ENG_CD_FN[act], tl = ENG_CD_TL[act], k = now - CD.subT0;
            let n = f ? f(e, sub, k, now) : null;
            if (n == null && tl && tl[sub] !== undefined) n = tl[sub] - k;
            if (n != null && Number.isFinite(n)) { CD.est = n; CD.estT = now; }
            est = Math.min(cdCap(e, act, now), CD.est - (now - CD.estT));
          }
          if (!Number.isFinite(est) || est < -4) { CD.show = NaN; return null; }   // quá giờ ước lượng mà chưa xong (việc dài hơn bảng): ẩn, không đứng "1s"
          if (!Number.isFinite(CD.show)) CD.show = est;
          else { const dt = Math.max(0, now - CD.t); CD.show -= dt; const d = est - CD.show; if (Math.abs(d) > 30) CD.show = est; else if (Math.abs(d) > 0.5) CD.show += d * Math.min(1, dt * 0.6); }   // đổi hạn hẳn (lệnh mới): nhảy luôn
          CD.t = now;
          return { icon: ENG_CD_ICON[act], sec: Math.max(1, Math.ceil(CD.show)), est };
        }
