        // ===== BẢNG KỸ SƯ kiểu THE SIMS 4 (G 18/10 "research about the Sim 4 all the bars then apply to engineer by add new button at bottom with list of bars"):
        //  nút ◆ "Kỹ sư" ở thanh dưới → bảng: cảm xúc + moodlet · NHU CẦU · KỸ NĂNG cấp 1–10 · QUAN HỆ với pet · HIỆU SUẤT công việc. Mô hình (bảng tốc độ,
        //  moodlet, tua lịch, kỹ năng) là của kỹ sư: engineer/mind/needs.js — bảng chỉ đọc qua mặt ENGINEER.needs, bấm thanh = ENGINEER.askNeed(k) (01/11
        //  đợt 10); vẽ lại mỗi giây khi mô hình báo tin 'engNeeds' ----
        const simUI = { panel: null, open: false };   // khung DOM (dựng lần đầu bấm) · bảng đang mở · chữ báo lệnh 3 s (msg) · thanh vừa bấm (cmdNeed)
        const simColor = v => v >= 70 ? '#2f5f22' : v >= 45 ? '#5a671d' : v >= 25 ? '#786017' : v >= 12 ? '#774515' : '#6f251d';   // G 18/10: mọi màu trong bảng tối 50%
        function simBar(icon, label, right = '') {
          const row = document.createElement('div'); row.className = 'sim-bar';
          row.innerHTML = `<i class="ti ${icon}"></i><span class="sim-lab">${label}</span><span class="sim-r">${right}</span><span class="sim-track"><span class="sim-fill"></span></span>`;
          return { row, fill: row.querySelector('.sim-fill'), r: row.querySelector('.sim-r') };
        }
        function simBuild() {   // dựng bảng 1 lần (lần đầu bấm nút)
          const P = document.getElementById('simPanel'); if (!P) return null;
          const U = { P, emo: P.querySelector('#simEmo'), doing: P.querySelector('#simDoing'), plum: P.querySelector('#simPlumbob'), moods: P.querySelector('#simMoods'), needs: {}, skills: {}, dog: null, job: null };
          const grid = P.querySelector('#simNeeds'); for (const [k, lab, icon] of ENGINEER.needs.list) { const b = simBar(icon, lab); grid.append(b.row); U.needs[k] = b;
            b.row.classList.add('sim-cmd'); listen(b.row, 'click', () => simCommand(k)); }   // bảng điều khiển ngược: bấm thanh ⇒ kỹ sư đi lấp nhu cầu (engineer/mind/autonomy.js)
          const sk = P.querySelector('#simSkills'); for (const [k, lab, icon] of ENGINEER.needs.skillList) { const b = simBar(icon, lab); sk.append(b.row); U.skills[k] = b; }
          const rel = P.querySelector('#simRel'); U.dog = simBar('ti-paw', 'Pet'); U.job = simBar('ti-briefcase', 'Hiệu suất hôm nay'); rel.append(U.dog.row, U.job.row);
          listen(P.querySelector('#simClose'), 'click', () => { simToggle(false); CAMF.o = null; });
          return U;
        }
        function simRender() {
          const U = simUI.panel; if (!U) return;
          const N = ENGINEER.needs, E = N.emotion(), [ename, ecol] = N.emoName[E.emo];
          U.emo.textContent = (E.w >= 3 && E.emo !== 'fine' ? 'Rất ' + ename.toLowerCase() : ename); U.plum.style.background = ecol;
          U.doing.textContent = simUI.msg || N.doing() + (ENGINEER.asked || N.autoCmd ? ' · theo lệnh' : N.auto ? ' · tự chọn' : '');   // lệnh: bấm dụng cụ / bảng Tools (ENGINEER.asked) hoặc bấm thanh nhu cầu
          U.moods.replaceChildren(...E.L.slice(0, 6).map(m => { const c = document.createElement('span'); c.className = 'sim-mood'; c.style.borderColor = N.emoName[m.emo][1]; c.textContent = m.name + ' +' + m.w; c.title = N.emoName[m.emo][0]; return c; }));
          for (const [k] of N.list) { const v = N.level(k) ?? 60, b = U.needs[k]; b.fill.style.width = v.toFixed(1) + '%'; b.fill.style.background = simColor(v); b.row.title = Math.round(v) + '/100 · bấm: Engineer đi lấp nhu cầu này'; b.row.classList.toggle('sim-go', !!N.autoCmd && simUI.cmdNeed === k); }
          for (const { k, h, p } of N.skills()) {   // kỹ năng: giờ luyện → phần đã qua của cấp hiện tại (engineer/mind/needs.js)
            const b = U.skills[k]; b.r.textContent = ''; b.fill.style.width = (p * 100).toFixed(1) + '%'; b.fill.style.background = '#35536c'; b.row.title = h.toFixed(1) + ' giờ luyện';
          }
          const fr = N.friend();
          U.dog.r.textContent = ''; U.dog.fill.style.width = fr.toFixed(1) + '%'; U.dog.fill.style.background = '#2f5f22'; U.dog.row.title = 'Tình bạn ' + Math.round(fr) + '/100';
          const perf = N.perf(E.emo);
          U.job.r.textContent = perf >= 1 ? '✓' : ''; U.job.fill.style.width = (perf * 100).toFixed(1) + '%'; U.job.fill.style.background = perf >= 1 ? '#71581e' : '#2f5f22';   // G 22/10: bỏ chữ cấp, chức danh, mức quan hệ — chỉ còn thanh
          U.job.row.title = Math.round(perf * 100) + '% (Tập trung khi làm: +15%)';
        }
        function simCommand(k) {   // bấm thanh nhu cầu: giao việc (theo lệnh) hoặc báo lý do 3 s
          const why = ENGINEER.askNeed(k); simUI.cmdNeed = k; simUI.msg = why || '→ ' + ENGINEER.actLabel(ENGINEER.needs.auto) + ' (theo lệnh)';
          clearTimeout(simUI.msgT); simUI.msgT = setTimeout(() => { simUI.msg = ''; simRender(); }, why ? 3000 : 2200); simRender();
        }
        function simToggle(on = !simUI.open) {
          if (on && !simUI.panel) simUI.panel = simBuild(); if (!simUI.panel) return;
          if (on) ENGINEER.needs.start();   // bấm trước nhịp đầu: tua lịch ngay
          simUI.open = on; simUI.panel.P.hidden = !on; document.getElementById('btnSim')?.classList.toggle('active', on); if (on) simRender(); engTabs();   // thẻ Nhu cầu của khung #engPanel
        }
        { const b = document.getElementById('btnSim'); if (b) listen(b, 'click', () => { simToggle(); if (simUI.open) camFollow(ENGINEER.object); else CAMF.o = null; }); }   // mở bảng ⇒ camera lướt tới + theo kỹ sư (ui/follow-tags.js)
        worldHear('engNeeds', () => { if (simUI.open) simRender(); });   // mô hình vừa tính (1 lần / giây — engineer/mind/needs.js)
