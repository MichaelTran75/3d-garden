        // ===== TỰ CHỦ THEO NHU CẦU — đợt 1 (G 18/10 "bảng điều khiển ngược (nếu a chủ động play) và vẫn để engineer automate … thêm curiosity bar … dành thời gian đi dạo
        //  to full fill curiosity"; đợt 3 thay luật chọn việc dưới đây bằng mạng nơ-ron nhỏ). Lịch ENG_DAY vẫn là khung ngày; tầng tự chủ chen vào:
        //   · giờ RẢNH (dạo trại, nghỉ trưa, đọc, nghe nhạc, câu cá): mỗi phút chấm điểm các việc có thể làm — điểm = Σ hệ số × (1 − nhu cầu/100)² (nhu cầu càng
        //     thấp càng gấp), +10% ngẫu nhiên, việc đang làm được cộng giữ chỗ; điểm > 0,4 (≈ có nhu cầu dưới ~37%); xong việc tự chọn thì nghỉ 4 phút mới chọn tiếp; việc ngắn (vuốt chó, dạo khám phá, ăn nhẹ) cộng thêm 1 lần khi xong thì bỏ việc của lịch làm việc đó trong một khoảng;
        //   · nhu cầu < 15% (và việc lịch đang làm cho phép chen: nghiên cứu, đọc, nhạc, trà, câu, dạo) ⇒ đi lấp nhu cầu đó ngay;
        //   · NGƯỜI XEM BẤM thanh nhu cầu trên bảng Kỹ sư (ui/sim-needs.js) ⇒ kỹ sư làm việc lấp nhu cầu đó ngay (theo lệnh), xong thì tự chủ tiếp.
        //  Việc có điểm dừng (ăn nhẹ ở bàn, vệ sinh, tắm, vuốt chó, đi dạo khám phá) báo xong qua autoDone; việc còn lại hết thời lượng thì trả về lịch.
        //  ĐI DẠO KHÁM PHÁ (lấp Tò mò): ghé 2 công trình / cây quanh trại đi bộ tới được (không qua nước): đứng ngắm, ngẩng nhìn, ghi chép vào bảng kẹp ----
        const AUTO = { act: null, until: 0, cmd: false, next: 0, seen: [] };
        const AUTO_ACTS = {   // việc → hệ số lấp từng nhu cầu · thời lượng tối đa (s) · ngoài trời (mưa thì bỏ)
          snack: { n: { hunger: 1 }, dur: 480 }, toilet: { n: { bladder: 1.1 }, dur: 300 }, shower: { n: { hygiene: 1, fun: 0.1 }, dur: 700 },
          rest: { n: { energy: 1, fun: 0.2 }, dur: 900 }, read: { n: { fun: 0.6, curiosity: 0.5 }, dur: 900 }, music: { n: { fun: 0.7, social: 0.3 }, dur: 900 },
          fish: { n: { fun: 0.8, curiosity: 0.3, social: 0.2 }, dur: 900, out: 1 }, pet: { n: { social: 1, fun: 0.4 }, dur: 150, out: 1 },
          explore: { n: { curiosity: 1, fun: 0.3 }, dur: 720, out: 1 }, outdoor: { n: { social: 0.4, fun: 0.3, curiosity: 0.4 }, dur: 600, out: 1 },
          stars: { n: { curiosity: 0.8, fun: 0.6, energy: 0.5 }, dur: 1500, out: 1 }, rainwatch: { n: { fun: 0.7, energy: 0.2, curiosity: 0.2 }, dur: 150 }, garden: { n: { fun: 0.5, curiosity: 0.4, social: 0.2 }, dur: 420, out: 1 } };   // đợt 2: ngắm sao (tối, quang) · ngắm mưa (đang mưa) · chăm luống
        const AUTO_BODY = new Set(['hunger', 'bladder', 'energy', 'hygiene']), AUTO_ABSORB = new Set(['nap', 'fish', 'eat', 'eatFish']), AUTO_LEISURE = new Set(['read', 'music', 'rest', 'outdoor', 'explore', 'fish']), AUTO_FREE = new Set(['outdoor', 'rest', 'read', 'music', 'fish', 'shelter']), AUTO_BREAK = new Set(['research', 'outdoor', 'rest', 'read', 'music', 'fish', 'shelter']);
        function autoOk(act, hh) {   // việc làm được lúc này (mưa: bỏ việc ngoài trời · câu cá chỉ trước 19:30 · vuốt chó khi chó ở bếp lửa)
          const D = AUTO_ACTS[act]; if (D.out && liveWeather.state.raining) return false;
          if (act === 'fish' && !engHourOk('fish', hh)) return false; if (act === 'pet' && !dogPettable()) return false;
          if (act === 'stars') return skyWatch.want(hh); if (act === 'rainwatch') return !!liveWeather.state.raining;
          if (act === 'garden') return engHourOk('garden', hh) && clock.elapsedTime >= gardenJob.next && (carrotBed.empty().length > 0 || carrotBed.dry() || carrotBed.eating());
          return true;
        }
        function autoFix(k, hh) {   // việc lấp nhu cầu k (bấm thanh / nhu cầu cạn)
          const rain = liveWeather.state.raining, dark = engHourOk('dark', hh);
          return { hunger: 'snack', bladder: 'toilet', energy: 'rest', hygiene: 'shower', fun: rain ? 'rainwatch' : skyWatch.want(hh) ? 'stars' : dark ? 'music' : 'fish',
            social: dogPettable() ? 'pet' : 'outdoor', curiosity: rain ? 'read' : skyWatch.want(hh) ? 'stars' : dark ? 'read' : 'explore' }[k];
        }
        function autoWant(e, hh, sched) {   // engWantAct (engineer/mind/schedule.js): việc tự chủ thay việc của lịch, hoặc null
          if (!engAwake(hh) || sched === 'sleep' || sched === 'bedtime') { AUTO.act = null; AUTO.cmd = false; return null; }
          const now = clock.elapsedTime;
          if (AUTO.act && !AUTO.cmd && sched === 'stars' && AUTO_LEISURE.has(AUTO.act)) AUTO.act = null;   // tới giờ ngắm sao (trời quang): việc giải trí tự chọn nhường chỗ
          if (AUTO.act && now < AUTO.until && (AUTO.cmd || autoOk(AUTO.act, hh))) return AUTO.act;
          if (AUTO.act) { AUTO.act = null; AUTO.cmd = false; AUTO.next = now + 240; }   // hết thời lượng / trời đổi: nghỉ 4 phút rồi mới chọn việc khác (đỡ đổi việc liên tục)
          if (now < AUTO.next || sim.hour === null) return null; AUTO.next = now + 60;
          const n = sim.n;
          if (AUTO_BREAK.has(sched)) for (const [k] of SIM_NEEDS) if ((n[k] ?? 100) < 15 && (sched !== 'research' || AUTO_BODY.has(k))) { const a = autoFix(k, hh); if (a && a !== sched && autoOk(a, hh)) return autoStart(a, false); }   // đang nghiên cứu: chỉ nhu cầu thân thể gọi đi (G 24/10: trước tò mò cạn là bỏ bàn đi dạo — vừa mở trang đã đi)
          if (!AUTO_FREE.has(sched) || AUTO_ABSORB.has(e.phase)) return null;   // ngủ trưa, ngồi câu, đang ăn: việc tự chọn không gọi dậy (chỉ nhu cầu cạn < 15 ở trên)
          let best = null, bu = 0.4;
          for (const a in AUTO_ACTS) { if (!autoOk(a, hh)) continue; const D = AUTO_ACTS[a]; let u = 0;
            for (const k in D.n) u += D.n[k] * ((100 - (n[k] ?? 100)) / 100) ** 2; u *= 1 + 0.1 * Math.random(); if (a === sched) u += 0.15;
            if (u > bu) { bu = u; best = a; } }
          return best && best !== sched ? autoStart(best, false) : null;
        }
        function autoStart(a, cmd) { AUTO.act = a; AUTO.cmd = cmd; AUTO.until = clock.elapsedTime + AUTO_ACTS[a].dur; return a; }
        const AUTO_BONUS = { pet: { social: 15, fun: 5 }, explore: { curiosity: 20 }, snack: { hunger: 10 }, rainwatch: { fun: 8 }, garden: { fun: 6, curiosity: 6 } };   // việc ngắn có điểm dừng: lấp thêm 1 lần khi xong (vuốt chó chỉ ~20 s)
        function autoDone(a) {
          if (AUTO.act !== a) return; const B = AUTO_BONUS[a]; if (B) for (const k in B) sim.n[k] = Math.min(100, (sim.n[k] ?? 60) + B[k]);
          AUTO.act = null; AUTO.cmd = false; AUTO.next = clock.elapsedTime + 240;
        }
        function autoCommand(k) {   // bấm thanh nhu cầu: trả lời lý do không làm được, hoặc '' khi đã giao việc
          const hh = liveWeather.localHour; if (!engAwake(hh)) return 'Engineer đang ngủ (21:45 – 6:00).';
          if (engForceAct) return 'Engineer đang làm việc anh vừa gọi.';
          if (trimJob.busy()) return 'Engineer đang cắt cỏ, xong việc này đã.';
          const a = autoFix(k, hh); if (!a) return ''; autoStart(a, true); return '';
        }
