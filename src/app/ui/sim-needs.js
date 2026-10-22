        // ===== CHỈ SỐ KỸ SƯ kiểu THE SIMS 4 (G 18/10 "research about the Sim 4 all the bars then apply to engineer by add new button at bottom with list of
        //  bars"): nút ◆ "Kỹ sư" ở thanh dưới → bảng: cảm xúc + moodlet · 6 NHU CẦU · KỸ NĂNG cấp 1–10 · QUAN HỆ với chó · HIỆU SUẤT công việc.
        //  Học Sims 4: 6 nhu cầu Đói · Vệ sinh · Năng lượng · Tắm rửa · Giải trí · Giao tiếp, thanh xanh → vàng → cam → đỏ. Tụt thấp sinh moodlet xấu 2 bậc
        //  (+1 rồi +3 — Đói / Mắc tiểu / Mệt → Không thoải mái, Hôi → Ngượng ngùng, thiếu vui → Căng thẳng, thiếu giao tiếp → Buồn); việc đang làm và việc vừa
        //  xong sinh moodlet tốt (làm việc → Tập trung, tắm → Sảng khoái…); CẢM XÚC = cảm xúc có tổng trọng số moodlet lớn nhất (không có ⇒ Bình thường),
        //  tổng ≥ 3 "Rất …"; viên kim cương (plumbob) đổi màu theo cảm xúc. Tốc độ cạn (giờ trong game, ước tính cộng đồng): đói 4–6 h · vệ sinh 8–12 ·
        //  năng lượng 14–20 · giải trí 7–10 · giao tiếp 8–15 · tắm rửa 24–36. Kỹ năng 10 cấp (mỗi cấp cần nhiều giờ hơn); quan hệ −100…100: Người quen
        //  −20…39 · Bạn 40–59 · Bạn tốt 60–80 · Bạn thân > 80; công việc: thanh hiệu suất đầy + đủ kỹ năng thì lên chức, làm việc khi Tập trung thì nhanh đầy.
        //  Áp vào kỹ sư: mỗi giây đọc việc ĐANG LÀM THẬT (lịch e.act · pha e.phase · trạm trong xe e.van.station) → cộng / trừ theo bảng tốc độ (giờ thật =
        //  giờ trong cảnh, như lịch kỹ sư). Mở trang (hoặc giờ nhảy > 12 phút): tua lịch ENG_DAY từ 21:00 hôm trước tới giờ hiện tại theo bước 2 phút để có
        //  trạng thái ban đầu. Kỹ năng, quan hệ, cấp bậc tính theo số ngày ở trại + giờ đã làm hôm nay (tất định: ai xem cũng như nhau) ----
        const SIM_NEEDS = [   // khoá · nhãn · icon · cạn / giờ khi thức · khi ngủ (âm = hồi)
          ['hunger', 'Đói', 'ti-tools-kitchen-2', 15, 3], ['bladder', 'Vệ sinh', 'ti-droplet', 10, 3], ['energy', 'Năng lượng', 'ti-bolt', 5.2, -12.5],
          ['hygiene', 'Tắm rửa', 'ti-bath', 3.3, 1], ['fun', 'Giải trí', 'ti-mood-happy', 9, 1], ['social', 'Giao tiếp', 'ti-messages', 5, 1],
          ['curiosity', 'Tò mò', 'ti-compass', 7, 1]];   // cân cho 1 ngày theo lịch ~hoà · Tò mò (G 18/10 "thêm curiosity bar"): lấp bằng đi dạo khám phá, đọc, drone, kiểm tra máy
        const SIM_DO = {   // việc → (nhu cầu: +/giờ) · nhãn đang làm · moodlet khi đang làm [tên, cảm xúc, trọng số] · moodlet sau khi xong [tên, cảm xúc, trọng số, giờ]
          sleep: { lab: 'Đang ngủ' }, eat: { hunger: 320, fun: 8, lab: 'Đang ăn', after: ['Bữa ăn ngon', 'happy', 1, 3] },
          toilet: { bladder: 2400, lab: 'Đi vệ sinh' }, shower: { hygiene: 2400, fun: 6, lab: 'Đang tắm', after: ['Sảng khoái', 'energized', 1, 4] },
          wash: { hygiene: 120, lab: 'Rửa ráy, rửa bát' }, clean: { hygiene: 30, fun: -2, lab: 'Dọn nhà vệ sinh, nhà tắm', after: ['Phòng tắm sạch sẽ', 'happy', 1, 2] }, work: { fun: 8, social: 4, energy: -2, lab: 'Nghiên cứu ở bàn học', mood: ['Đang tập trung', 'focused', 2] },
          explore: { curiosity: 130, fun: 12, social: 4, lab: 'Đi dạo khám phá', mood: ['Tò mò khám phá', 'inspired', 1], after: ['Mở mang tầm mắt', 'inspired', 1, 2] },   // Mọt công nghệ: việc máy tính có vui · nhắn nhóm kỹ thuật
          music: { fun: 28, social: 12, lab: 'Học bài, nghe nhạc', mood: ['Nhạc hay', 'happy', 1] }, read: { fun: 20, social: 7, curiosity: 30, lab: 'Đọc sách', mood: ['Đắm chìm trang sách', 'inspired', 1] },
          fish: { fun: 24, hygiene: -2, social: 7, curiosity: 10, lab: 'Câu cá', mood: ['Thư thái bên hồ', 'happy', 1] }, tea: { energy: 5, fun: 10, bladder: -14, social: 7, lab: 'Uống trà', after: ['Trà nóng', 'happy', 1, 1] },   // việc ngoài trời: chó quanh quẩn bên cạnh (+7 giao tiếp)
          nap: { energy: 22, lab: 'Chợp mắt', after: ['Chợp mắt ngon', 'energized', 1, 2] }, pet: { social: 80, fun: 25, lab: 'Vuốt ve pet', after: ['Pet quấn quýt', 'happy', 1, 3] },
          drone: { fun: 45, social: 7, curiosity: 40, lab: 'Bay drone', mood: ['Hào hứng', 'playful', 2], after: ['Bay drone đã tay', 'playful', 1, 2] },
          appleEat: { hunger: 160, fun: 10, lab: 'Ăn táo', after: ['Táo giòn ngọt', 'happy', 1, 2] },
          apples: { fun: 16, hunger: 20, hygiene: -2, social: 7, curiosity: 15, lab: 'Hái táo', after: ['Táo ngọt', 'happy', 1, 2] }, cook: { fun: 10, hygiene: -2, lab: 'Nấu ăn', mood: ['Bếp thơm', 'inspired', 1] },
          sit: { energy: 2, lab: 'Ngồi nghỉ' }, engine: { fun: 10, curiosity: 60, lab: 'Kiểm tra máy xe' },
          trim: { energy: -14, hygiene: -16, fun: 6, curiosity: 6, lab: 'Cắt cỏ quanh trại', mood: ['Lao động chân tay', 'focused', 1], after: ['Trại gọn gàng', 'happy', 1, 4] }, walk: { fun: 2, social: 7, curiosity: 15, lab: 'Đi lại' },
          stars: { fun: 34, curiosity: 55, energy: 10, lab: 'Ngắm sao', mood: ['Bầu trời đầy sao', 'inspired', 1], after: ['Thấy sao băng', 'happy', 1, 2] },
          rainwatch: { fun: 22, energy: 6, curiosity: 8, lab: 'Ngắm mưa', mood: ['Nghe mưa rơi', 'happy', 1] },
          wood: { fun: 8, hygiene: -4, lab: 'Bỏ củi vào lò' },
          garden: { fun: 18, curiosity: 16, social: 6, hygiene: -6, lab: 'Chăm luống cà rốt', mood: ['Tay lấm đất', 'focused', 1], after: ['Luống xanh tốt', 'happy', 1, 3] }, shelter: { fun: -3, lab: 'Trú mưa dưới hiên', mood: ['Mưa rả rích', 'sad', 1] }
        };
        const SIM_OUT = new Set(['fish', 'walk', 'tea', 'drone', 'apples', 'pet']);   // tính cách ngầm (Sims 4 Geek · Dog Lover · Loves Outdoors) chỉ chỉnh tốc độ, không hiện chữ (G 18/10)
        const SIM_EMO = {   // cảm xúc Sims 4 → tên + màu viên kim cương
          fine: ['Bình thường', '#6c6a61'], happy: ['Vui vẻ', '#47651e'], focused: ['Tập trung', '#453668'], energized: ['Tràn đầy năng lượng', '#794d17'],
          inspired: ['Hứng khởi', '#1f5b6b'], playful: ['Vui đùa', '#795a1d'], uncomfortable: ['Không thoải mái', '#4d452d'], tense: ['Căng thẳng', '#70381d'],
          sad: ['Buồn', '#273f68'], embarrassed: ['Ngượng ngùng', '#6c3b54']
        };
        const SIM_LOW = { hunger: ['Đói bụng', 'Đói cồn cào', 'uncomfortable'], bladder: ['Mắc tiểu', 'Mắc tiểu lắm', 'uncomfortable'], energy: ['Mệt mỏi', 'Kiệt sức', 'uncomfortable'],
          hygiene: ['Hơi hôi', 'Bốc mùi', 'embarrassed'], fun: ['Cần giải trí', 'Chán ngấy', 'tense'], social: ['Cô đơn', 'Rất cô đơn', 'sad'], curiosity: ['Thèm khám phá', 'Bứt rứt muốn đi', 'tense'] };
        const SIM_SKILLS = [   // khoá · nhãn · icon · việc cộng giờ · ngày bắt đầu ở trại
          ['logic', 'Nghiên cứu (Logic)', 'ti-flask', 'work', '2026-10-05'], ['fishing', 'Câu cá', 'ti-fish', 'fish', '2026-10-05'], ['cooking', 'Nấu ăn', 'ti-chef-hat', 'cook', '2026-10-05'],
          ['gardening', 'Làm vườn', 'ti-plant-2', ['apples', 'trim', 'garden'], '2026-10-17'], ['drone', 'Điều khiển drone', 'ti-drone', 'drone', '2026-10-17']];
        const SIM_LV = [0, 2, 5, 10, 17, 27, 40, 56, 76, 100];   // giờ tích luỹ để đạt cấp 1…10
        const SIM_JOB = ['Thực tập sinh', 'Kỹ thuật viên', 'Engineer tập sự', 'Engineer', 'Engineer chính', 'Trưởng nhóm kỹ thuật', 'Chuyên gia', 'Chuyên gia cao cấp', 'Trưởng phòng kỹ thuật', 'Giám đốc kỹ thuật'];
        const SIM_DOG0 = '2026-10-05', SIM_WORK_DAY = 5.8;   // giờ nghiên cứu theo lịch / ngày ⇒ hiệu suất 100%
        const sim = { n: {}, moods: [], doing: 'walk', hour: null, today: {}, day: '', perDay: null, panel: null, open: false, last: 0 };
        function simDoing(e) {   // việc đang làm thật → lớp việc của bảng tốc độ
          const hh = liveWeather.localHour; if (hh >= ENG_SLEEP_H || hh < 6) return 'sleep';
          const V = e.inVan && e.van, st = V && V.station, ph = e.phase;
          if (V) {
            if (st === 'wc') return 'toilet'; if (st === 'cleanWc' || st === 'cleanBath') return 'clean'; if (st === 'shower' || st === 'towel') return 'shower'; if (st === 'sink' || st === 'dishes') return 'wash';
            if (st === 'table') return 'eat'; if (st === 'desk') return e.act === 'music' ? 'music' : 'work'; if (st === 'stove') return 'cook'; if (st === 'bed') return 'sit';
            return 'walk';
          }
          return ph === 'eat' || ph === 'eatFish' ? 'eat' : ph === 'fish' ? 'fish' : ph === 'read' ? 'read' : ph === 'tea' || ph === 'drink' ? 'tea' : ph === 'nap' ? 'nap'
            : ph === 'pet' ? 'pet' : ph === 'drone' ? 'drone' : ph === 'apple' ? 'apples' : ph === 'appleEat' ? 'appleEat' : ph === 'engine' ? 'engine' : ph === 'trim' ? 'trim' : ph === 'explore' ? 'explore' : ph === 'shelter' ? 'shelter' : ph === 'stars' ? 'stars' : ph === 'rainwatch' ? 'rainwatch' : ph === 'garden' ? 'garden' : ph === 'wood' ? 'wood' : 'walk';
        }
        function simSched(h) {   // việc theo LỊCH ENG_DAY (tua lúc mở trang): việc của khung giờ + phút đã qua trong khung
          const s = engScheduleAt(h), a = s.act; let t0 = 0; for (const [x, act] of ENG_DAY) if (x <= h && act === a) t0 = x; const m = (h - t0) * 60;
          return a === 'sleep' ? 'sleep' : a === 'toilet' ? (m < 4 ? 'toilet' : 'wash') : a === 'breakfast' || a === 'lunch' ? (m < 15 ? 'eat' : m < 20 ? 'wash' : 'walk')
            : a === 'dinner' ? (m < 20 ? 'eat' : 'sit') : a === 'outdoor' ? (m < 5 ? 'pet' : m < 17 ? 'tea' : 'walk') : a === 'research' ? 'work' : a === 'rest' ? (m < 12 ? 'tea' : 'nap')
            : a === 'read' ? (m < 5 ? 'eat' : 'read') : a === 'bedtime' ? 'sit' : a === 'apples' ? 'apples' : SIM_DO[a] ? a : 'walk';
        }
        function simStep(doing, dt, h) {   // dt giờ trong cảnh
          const D = SIM_DO[doing] || {}, sl = doing === 'sleep';
          for (const [k, , , wake, slp] of SIM_NEEDS) sim.n[k] = Math.max(0, Math.min(100, sim.n[k] - (sl ? slp : wake) * dt + (D[k] || 0) * dt));
          sim.today[doing] = (sim.today[doing] || 0) + dt;
          for (const m of sim.moods) m.left -= dt; sim.moods = sim.moods.filter(m => m.left > 0);
          if (doing !== sim.doing) {   // việc vừa xong ⇒ moodlet "sau khi"
            const A = SIM_DO[sim.doing]; if (A && A.after && !(sim.doing === 'eat' && sim.n.hunger < 60)) { const [name, emo, w, dur] = A.after; sim.moods = sim.moods.filter(m => m.name !== name); sim.moods.push({ name, emo, w, left: dur }); }
            if (sim.doing === 'sleep' && sim.n.energy > 75) { sim.moods = sim.moods.filter(m => m.name !== 'Ngủ ngon'); sim.moods.push({ name: 'Ngủ ngon', emo: 'energized', w: 1, left: 4 }); }
            sim.doing = doing;
          }
        }
        function simMood(name, emo, w, hours) { sim.moods = sim.moods.filter(m => m.name !== name); sim.moods.push({ name, emo, w, left: hours }); }   // moodlet có hạn (vd. thở phào khi mát / ấm lại — engineer/reactions.js)
        function simInit(h) {   // tua lịch từ giờ ngủ hôm trước (ENG_SLEEP_H) tới giờ h (bước 2 phút)
          sim.n = { hunger: 45, bladder: 55, energy: 18, hygiene: 75, fun: 55, social: 45, curiosity: 60 }; sim.moods = []; sim.today = {}; sim.doing = 'sleep';
          const span = (h - ENG_SLEEP_H + 24) % 24, st = 1 / 30;
          for (let x = 0; x < span; x += st) { const hx = (ENG_SLEEP_H + x) % 24; if (hx < st) sim.today = {}; simStep(simSched(hx), Math.min(st, span - x), hx); }
          sim.hour = h;
        }
        function simPerDay() {   // giờ / ngày theo lịch cho từng việc (kỹ năng)
          const d = {}; for (let x = 0; x < 24; x += 1 / 30) { const a = simSched(x); d[a] = (d[a] || 0) + 1 / 30; } return d;
        }
        const simDays = since => Math.max(0, Math.floor((Date.parse(new Date().toISOString().slice(0, 10)) - Date.parse(since)) / 864e5));
        function simEmotion() {   // moodlet = nhu cầu thấp + việc đang làm + việc vừa xong → cảm xúc trội
          const L = [];
          for (const [k] of SIM_NEEDS) { const v = sim.n[k], s = SIM_LOW[k]; if (v < 12) L.push({ name: s[1], emo: s[2], w: 3 }); else if (v < 30) L.push({ name: s[0], emo: s[2], w: 1 }); }
          const D = SIM_DO[sim.doing]; if (D && D.mood) L.push({ name: D.mood[0], emo: D.mood[1], w: D.mood[2] });
          if (SIM_OUT.has(sim.doing) && engObj && !engObj.inVan && !liveWeather.state.raining) L.push({ name: 'Thích ngoài trời', emo: 'happy', w: 1 });   // tính cách Thích ngoài trời
          wxMoods(L);   // nóng nực · lạnh run · ướt mưa · trời đẹp (engineer/weather-feel.js)
          for (const m of sim.moods) L.push(m);
          const sum = {}; for (const m of L) sum[m.emo] = (sum[m.emo] || 0) + m.w;
          let best = 'fine', bw = 0; for (const k in sum) if (sum[k] > bw) { bw = sum[k]; best = k; }
          return { L, emo: best, w: bw };
        }
        const simColor = v => v >= 70 ? '#2f5f22' : v >= 45 ? '#5a671d' : v >= 25 ? '#786017' : v >= 12 ? '#774515' : '#6f251d';   // G 18/10: mọi màu trong bảng tối 50%
        function simBar(icon, label, right = '') {
          const row = document.createElement('div'); row.className = 'sim-bar';
          row.innerHTML = `<i class="ti ${icon}"></i><span class="sim-lab">${label}</span><span class="sim-r">${right}</span><span class="sim-track"><span class="sim-fill"></span></span>`;
          return { row, fill: row.querySelector('.sim-fill'), r: row.querySelector('.sim-r') };
        }
        function simBuild() {   // dựng bảng 1 lần (lần đầu bấm nút)
          const P = document.getElementById('simPanel'); if (!P) return null;
          const U = { P, emo: P.querySelector('#simEmo'), doing: P.querySelector('#simDoing'), plum: P.querySelector('#simPlumbob'), moods: P.querySelector('#simMoods'), needs: {}, skills: {}, dog: null, job: null };
          const grid = P.querySelector('#simNeeds'); for (const [k, lab, icon] of SIM_NEEDS) { const b = simBar(icon, lab); grid.append(b.row); U.needs[k] = b;
            b.row.classList.add('sim-cmd'); listen(b.row, 'click', () => simCommand(k)); }   // bảng điều khiển ngược: bấm thanh ⇒ kỹ sư đi lấp nhu cầu (engineer/autonomy.js)
          const sk = P.querySelector('#simSkills'); for (const [k, lab, icon] of SIM_SKILLS) { const b = simBar(icon, lab); sk.append(b.row); U.skills[k] = b; }
          const rel = P.querySelector('#simRel'); U.dog = simBar('ti-paw', 'Pet'); U.job = simBar('ti-briefcase', 'Hiệu suất hôm nay'); rel.append(U.dog.row, U.job.row);
          listen(P.querySelector('#simClose'), 'click', () => { simToggle(false); CAMF.o = null; });
          return U;
        }
        function simRender() {
          const U = sim.panel; if (!U) return;
          const E = simEmotion(), [ename, ecol] = SIM_EMO[E.emo];
          U.emo.textContent = (E.w >= 3 && E.emo !== 'fine' ? 'Rất ' + ename.toLowerCase() : ename); U.plum.style.background = ecol;
          U.doing.textContent = sim.msg || (SIM_DO[simDoing(engObj)]?.lab || '') + (engForceAct || AUTO.cmd && AUTO.act ? ' · theo lệnh' : AUTO.act ? ' · tự chọn' : '');   // lệnh: bấm dụng cụ / bảng Tools (engForceAct) hoặc bấm thanh nhu cầu
          U.moods.replaceChildren(...E.L.slice(0, 6).map(m => { const c = document.createElement('span'); c.className = 'sim-mood'; c.style.borderColor = SIM_EMO[m.emo][1]; c.textContent = m.name + ' +' + m.w; c.title = SIM_EMO[m.emo][0]; return c; }));
          for (const [k] of SIM_NEEDS) { const v = sim.n[k] ?? 60, b = U.needs[k]; b.fill.style.width = v.toFixed(1) + '%'; b.fill.style.background = simColor(v); b.row.title = Math.round(v) + '/100 · bấm: Engineer đi lấp nhu cầu này'; b.row.classList.toggle('sim-go', AUTO.cmd && !!AUTO.act && sim.cmdNeed === k); }
          if (!sim.perDay) sim.perDay = simPerDay();
          for (const [k, , , doing, since] of SIM_SKILLS) {
            const h = [].concat(doing).reduce((a, d) => a + simDays(since) * (sim.perDay[d] || 0) + (sim.today[d] || 0), 0); let lv = 1;   // kỹ năng có thể cộng nhiều việc (Làm vườn: hái táo + cắt cỏ) while (lv < 10 && h >= SIM_LV[lv]) lv++;
            const p = lv >= 10 ? 1 : (h - SIM_LV[lv - 1]) / (SIM_LV[lv] - SIM_LV[lv - 1]), b = U.skills[k];
            b.r.textContent = ''; b.fill.style.width = (p * 100).toFixed(1) + '%'; b.fill.style.background = '#35536c'; b.row.title = h.toFixed(1) + ' giờ luyện';
          }
          const d = simDays(SIM_DOG0), fr = Math.min(100, 45 + 2.4 * d + 0.5 * 60 * (sim.today.pet || 0)), tier = fr > 80 ? 'Bạn thân' : fr >= 60 ? 'Bạn tốt' : fr >= 40 ? 'Bạn' : fr >= -20 ? 'Người quen' : 'Không ưa';
          U.dog.r.textContent = ''; U.dog.fill.style.width = fr.toFixed(1) + '%'; U.dog.fill.style.background = '#2f5f22'; U.dog.row.title = 'Tình bạn ' + Math.round(fr) + '/100';
          const lv = Math.min(10, 3 + Math.floor(d / 5)), focus = E.emo === 'focused' ? 1.15 : 1, perf = Math.min(1, (sim.today.work || 0) / SIM_WORK_DAY * focus);
          U.job.r.textContent = perf >= 1 ? '✓' : ''; U.job.fill.style.width = (perf * 100).toFixed(1) + '%'; U.job.fill.style.background = perf >= 1 ? '#71581e' : '#2f5f22';   // G 22/10: bỏ chữ cấp, chức danh, mức quan hệ — chỉ còn thanh
          U.job.row.title = Math.round(perf * 100) + '% (Tập trung khi làm: +15%)';
        }
        function simCommand(k) {   // bấm thanh nhu cầu: giao việc (theo lệnh) hoặc báo lý do 3 s
          const why = autoCommand(k); sim.cmdNeed = k; sim.msg = why || '→ ' + ENG_ACTS[AUTO.act].label + ' (theo lệnh)';
          clearTimeout(sim.msgT); sim.msgT = setTimeout(() => { sim.msg = ''; simRender(); }, why ? 3000 : 2200); simRender();
        }
        function simToggle(on = !sim.open) {
          if (on && !sim.panel) sim.panel = simBuild(); if (!sim.panel) return;
          if (on && sim.hour === null) simInit(liveWeather.localHour);   // bấm trước nhịp đầu: tua lịch ngay
          sim.open = on; sim.panel.P.hidden = !on; document.getElementById('btnSim')?.classList.toggle('active', on); if (on) simRender();
        }
        { const b = document.getElementById('btnSim'); if (b) listen(b, 'click', () => { simToggle(); if (sim.open) camFollow(engObj.g); else CAMF.o = null; }); }   // mở bảng ⇒ camera lướt tới + theo kỹ sư (ui/follow-tags.js)
        function simNeedsTick(t) {   // gọi mỗi khung (main-loop-rest) — tính 1 lần / giây
          if (t - sim.last < 1 || !engObj) return; sim.last = t;
          const h = liveWeather.localHour, day = new Date().toDateString();
          if (sim.hour === null) simInit(h);
          let dt = h - sim.hour; if (dt < -12) dt += 24;
          if (dt < 0 || dt > 0.2) simInit(h); else if (dt > 0) { if (sim.hour > h) sim.today = {}; simStep(simDoing(engObj), dt, h); wxNeeds(dt); }   // nóng / lạnh: tụt thêm (engineer/weather-feel.js)   // qua nửa đêm: giờ hôm nay về 0
          if (day !== sim.day) { sim.day = day; sim.perDay = null; }
          sim.hour = h; if (sim.open) simRender();
        }
