        // ===== RADIO TÁP-LÔ (G 19/10 "add leader line & radio label vào van dash board with animation music note khi radio on; … function để dò đài AM FM realtime
        //  khi click vào"): đầu radio trên cụm điều khiển giữa của mẫu Transit (mặt nghiêng ~30°, x −1,66 toạ độ xe — đo bằng tia vào lưới GLB), màn chữ. Nhãn
        //  "📻 Radio" + đường dẫn khi zoom gần (đang phát: dải sóng · tần số · tên đài). Bấm vào NHÃN (G 19/10: thay cho bấm táp-lô) ⇒ bật + bảng dò đài bung ra từ nhãn. ĐÀI THẬT phát trực
        //  tiếp: danh sách Radio Browser (dịch vụ mở, CORS) — chỉ nguồn https MP3 / AAC; tên / thẻ có tần số (91.0 FM, AM 675) thì đặt đúng chỗ, đài khác rải đều
        //  trên thang FM 87,5–108 (bước 0,1) / AM 531–1602 kHz (bước 9). Dò = kéo vạch hoặc ◀◀ ▶▶ quét từng nấc tới đài kế; giữa 2 đài là tiếng nhiễu (Web Audio:
        //  AM lọc thấp lạo xạo, FM rít), lại gần đài nhiễu nhỏ dần + tiếng đài to dần. Đang phát: nốt nhạc bay lên từ táp-lô ----
        const radio = (() => {
          const g = new THREE.Group(); g.name = 'Radio táp-lô'; g.position.set(-1.662, 1.585, 0); g.rotation.z = 0.53; caravanObj.add(g);   // +X cục bộ = mặt máy (về phía ghế)
          const lam = c => new THREE.MeshLambertMaterial({ color: c });
          const body = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.075, 0.2), lam(0x2a2d30)); body.position.x = -0.008; g.add(body);
          const cv = document.createElement('canvas'); cv.width = 256; cv.height = 64; const cx = cv.getContext('2d'), tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.11, 0.0275), new THREE.MeshBasicMaterial({ map: tex })); scr.rotation.y = Math.PI / 2; scr.position.set(0.0025, 0.012, 0); g.add(scr);
          for (const z of [-0.075, 0.075]) { const k = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, 0.012, 12), lam(0x8d9194)); k.rotation.z = Math.PI / 2; k.position.set(0.004, -0.012, z); g.add(k); }
          const BAND = { FM: { lo: 875, hi: 1080, bw: 1.6, u: 'MHz', f: n => (n / 10).toFixed(1).replace('.', ',') }, AM: { lo: 59, hi: 178, bw: 1.0, u: 'kHz', f: n => String(n * 9) } };   // nấc: FM 0,1 MHz · AM 9 kHz
          const R = { on: false, band: 'FM', n: { FM: 910, AM: 75 }, st: { FM: [], AM: [] }, cur: null, s: 0, seek: 0, seekT: 0, idle: 0, loaded: 0, ac: null, ng: null, lp: null, notes: [], nt: 0, eq: [0, 0, 0, 0, 0, 0, 0], amp: 0, et: 0, play: false };
          const audio = new Audio(); audio.preload = 'none';
          audio.addEventListener('error', () => { if (R.cur && audio.getAttribute('src')) { R.cur.bad = 1; R.cur = null; } });
          function draw() {   // màn chữ: tắt = tối · bật = dải + tần số + cột sóng (đang phát: 7 cột nhảy theo nhịp · đang dò: vạch sóng tín hiệu)
            cx.fillStyle = '#0d1012'; cx.fillRect(0, 0, 256, 64);
            if (R.on) { const B = BAND[R.band]; cx.fillStyle = '#ffb347'; cx.font = '600 34px Inter, system-ui, Arial'; cx.textBaseline = 'middle'; cx.fillText(R.band + ' ' + B.f(R.n[R.band]), 14, 34);
              if (R.play) for (let i = 0; i < 7; i++) { const h = 4 + 40 * R.eq[i]; cx.fillRect(190 + i * 9, 54 - h, 6, h); }
              else { for (let i = 0; i < 4; i++) { cx.globalAlpha = R.s > i / 4 ? 1 : 0.25; cx.fillRect(200 + i * 11, 44 - i * 8, 7, 8 + i * 8); } cx.globalAlpha = 1; } }
            tex.needsUpdate = true;
          }
          draw();
          // ---- danh sách đài thật (1 lần, lúc bật lần đầu) ----
          async function load() {
            if (R.loaded) return; R.loaded = 1; let L = [];
            for (const h of ['de1', 'nl1', 'at1']) { try { const r = await fetch('https://' + h + '.api.radio-browser.info/json/stations/search?countrycode=VN&hidebroken=true&order=clickcount&reverse=true&limit=80'); if (r.ok) { L = await r.json(); break; } } catch (e) { L = []; } }
            const free = [], used = { FM: new Set(), AM: new Set() };
            for (const s of L) {
              if (!/^https:/.test(s.url_resolved || '') || !/mp3|aac/i.test(s.codec || '')) continue;
              const t = s.name + ' ' + s.tags, st = { name: s.name.trim().slice(0, 32), url: s.url_resolved, news: /news|talk|tin|thời sự|vov1/i.test(t) };
              const fm = t.match(/(?:^|[^\d.,])(\d{2,3}[.,]\d)(?!\d)/), am = t.match(/(\d{3,4})\s*(?:khz)?\s*am\b|\bam\s*(\d{3,4})/i), f = fm && parseFloat(fm[1].replace(',', '.')), a = am && +(am[1] || am[2]);
              if (f >= 87.5 && f <= 108 && !used.FM.has(Math.round(f * 10))) { st.n = Math.round(f * 10); used.FM.add(st.n); R.st.FM.push(st); }
              else if (a >= 531 && a <= 1602 && !used.AM.has(Math.round(a / 9))) { st.n = Math.round(a / 9); used.AM.add(st.n); R.st.AM.push(st); }
              else free.push(st);
            }
            free.sort((p, q) => q.news - p.news);
            const place = (b, list) => { const B = BAND[b]; list.forEach((st, i) => { let n = Math.round(B.lo + (B.hi - B.lo) * (i + 0.5) / list.length); while (used[b].has(n) || used[b].has(n - 1) || used[b].has(n + 1)) n = n >= B.hi ? B.lo : n + 1; st.n = n; used[b].add(n); R.st[b].push(st); }); };
            const nAM = Math.max(0, Math.min(free.length >> 2, 6 - R.st.AM.length)); place('AM', free.slice(0, nAM)); place('FM', free.slice(nAM, nAM + 30));
            for (const b of ['FM', 'AM']) R.st[b].sort((p, q) => p.n - q.n);
            ui.name.textContent = R.st.FM.length + R.st.AM.length ? '' : 'Không tải được danh sách đài';
          }
          // ---- tiếng nhiễu (Web Audio) ----
          function audioOn() {
            if (!R.ac) { const A = window.AudioContext || window.webkitAudioContext; if (!A) return; const ac = R.ac = new A(), n = ac.sampleRate * 2, b = ac.createBuffer(1, n, ac.sampleRate), d = b.getChannelData(0);
              for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
              const src = ac.createBufferSource(); src.buffer = b; src.loop = true; R.lp = ac.createBiquadFilter(); R.ng = ac.createGain(); R.ng.gain.value = 0; src.connect(R.lp).connect(R.ng).connect(ac.destination); src.start(); }
            R.ac.resume();
            audio.src = 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQIAAACAgA=='; audio.play().catch(() => {});   // mở khoá phát (đang trong lần bấm)
          }
          // ---- bảng dò đài ----
          const ui = {}; const pop = document.createElement('div'); pop.className = 'ui panel'; pop.id = 'radioPop'; pop.style.display = 'none';
          pop.innerHTML = '<div class="ph">📻 Radio<button id="rOff" title="Tắt">⏻</button></div><div class="rb"><button data-b="AM">AM</button><button data-b="FM">FM</button></div>'
            + '<div id="rName"></div><canvas id="rWave" width="420" height="48"></canvas><div class="rl"><i class="ti ti-radio"></i><input id="rDial" type="range" step="1"><output id="rFreq"></output></div><div class="rb"><button id="rDn">◀◀</button><button id="rUp">▶▶</button><button id="rX">✕</button></div>';   // thanh dò tối giản như thanh nét viền xe (G 19/10)
          container.appendChild(pop); const wv = pop.querySelector('#rWave'), wx = wv.getContext('2d'); for (const k of ['rOff', 'rFreq', 'rName', 'rDial', 'rDn', 'rUp', 'rX']) ui[k.slice(1).toLowerCase()] = pop.querySelector('#' + k); ui.name = pop.querySelector('#rName');
          const setBand = b => { R.band = b; const B = BAND[b]; ui.dial.min = B.lo; ui.dial.max = B.hi; ui.dial.value = R.n[b]; R.lp.type = b === 'AM' ? 'lowpass' : 'bandpass'; R.lp.frequency.value = b === 'AM' ? 2200 : 5200;
            for (const x of pop.querySelectorAll('[data-b]')) x.classList.toggle('on', x.dataset.b === b); };
          for (const x of pop.querySelectorAll('[data-b]')) listen(x, 'click', () => { setBand(x.dataset.b); R.seek = 0; });
          listen(ui.dial, 'input', () => { R.n[R.band] = +ui.dial.value; R.seek = 0; });
          listen(ui.dn, 'click', () => { R.seek = -1; R.seekT = 0; }); listen(ui.up, 'click', () => { R.seek = 1; R.seekT = 0; });
          const power = on => { R.on = on; if (!on) { R.seek = 0; R.cur = null; audio.pause(); audio.removeAttribute('src'); audio.load(); if (R.ng) R.ng.gain.value = 0; pop.style.display = 'none'; } draw(); };
          function wave(t) {   // SÓNG ÂM trong bảng (G 20/10 "add wave animation vào đài radio"): 3 lớp sóng mượt to nhỏ theo nhịp khi đang phát · rung nhiễu lăn tăn khi
            //  đang dò giữa 2 đài · phẳng khi tắt. Hoạt cảnh tổng hợp — không đọc âm thanh thật (nối luồng đài khác nguồn vào Web Audio sẽ bị tắt tiếng)
            const W = wv.width, H = wv.height, nz = R.on ? 1 - R.s : 0; wx.clearRect(0, 0, W, H);
            R.amp += ((R.play ? 0.3 + 0.7 * Math.abs(Math.sin(t * 2.3) * Math.sin(t * 0.71 + 1)) : 0) - R.amp) * 0.15;
            for (let L = 2; L >= 0; L--) {
              wx.beginPath(); wx.lineWidth = L ? 2 : 3; wx.strokeStyle = ['#e0662b', 'rgba(224,102,43,0.45)', 'rgba(60,60,60,0.35)'][L];
              for (let x = 0; x <= W; x += 4) { const u = x / W, y = H / 2 + Math.sin(Math.PI * u) * H * 0.44 * (R.amp * (1 - 0.3 * L) * Math.sin(u * (9 + 5 * L) + t * (5 + 2.3 * L) + L * 2) + 0.35 * nz * (Math.random() - 0.5)); x ? wx.lineTo(x, y) : wx.moveTo(x, y); }
              wx.stroke();
            }
          }
          listen(ui.off, 'click', () => power(false)); listen(ui.x, 'click', () => { pop.style.display = 'none'; });   // ✕: đóng bảng, radio vẫn phát · ⏻: tắt
          function open(e, lw = 0, lh = 0) {   // e: điểm bấm (clientX/Y) · lw, lh: cỡ nhãn trên màn hình ⇒ bảng BUNG RA từ nhãn (G 19/10 "click vào label radio thì label expand thành bảng")
            audioOn(); if (!R.ac) return; load(); if (!R.on) { R.on = true; setBand(R.band); }
            const r = dom.getBoundingClientRect(), x = e ? e.clientX : r.left + r.width / 2, y = e ? e.clientY : r.top + r.height / 2;
            pop.style.display = ''; const L = Math.min(r.width - 230, Math.max(8, x - r.left - 105)), T = Math.min(r.height - 220, Math.max(8, y - r.top - 16)); pop.style.left = L + 'px'; pop.style.top = T + 'px'; draw();
            if (lw) { pop.style.transformOrigin = (x - r.left - L) + 'px ' + (y - r.top - T) + 'px'; pop.animate([{ transform: 'scale(' + Math.min(1, lw / pop.offsetWidth) + ',' + Math.min(1, lh / pop.offsetHeight) + ')', opacity: 0.5 }, { transform: 'none', opacity: 1 }], { duration: 240, easing: 'cubic-bezier(.2,.8,.2,1)' }); }
          }
          function tagClick(e) {   // bấm trúng nhãn 📻 (sprite) ⇒ mở bảng từ nhãn; true = đã xử lý (hovClick bỏ qua bấm xe / máy)
            if (!tag || !tag.sprite.visible || !labelGroup.visible) return false;
            const r = dom.getBoundingClientRect(), upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), v = _p.copy(tag.sprite.position).project(camera);
            const cx = r.left + (v.x + 1) / 2 * r.width, cy = r.top + (1 - v.y) / 2 * r.height, w = tag.sprite.scale.x / upp, h = tag.sprite.scale.y / upp;
            if (Math.abs(e.clientX - cx) > w / 2 || Math.abs(e.clientY - cy) > h / 2) return false;
            open({ clientX: cx, clientY: cy }, w, h); return true;
          }
          // ---- nhãn + đường dẫn, nốt nhạc ----
          let tag = null, tagK = 1; const _p = new THREE.Vector3();
          const glyph = s => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.font = '700 50px system-ui, Arial'; x.textAlign = 'center'; x.textBaseline = 'middle';
            x.lineWidth = 6; x.strokeStyle = '#fff8ec'; x.strokeText(s, 32, 34); x.fillStyle = '#e0662b'; x.fillText(s, 32, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
          const NT = [glyph('♪'), glyph('♫')];
          for (let i = 0; i < 6; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: NT[i % 2], transparent: true, depthTest: false, depthWrite: false })); s.renderOrder = 21; s.visible = false; s.userData.life = 0; labelGroup.add(s); R.notes.push(s); }
          function tick(dt) {
            const upp = (camera.right - camera.left) / camera.zoom / Math.max(1, W()), B = BAND[R.band];
            if (R.on) {
              if (R.seek) { R.seekT -= dt; if (R.seekT <= 0) { R.seekT = 0.06; let n = R.n[R.band] + R.seek; if (n > B.hi) n = B.lo; if (n < B.lo) n = B.hi; R.n[R.band] = n; ui.dial.value = n; if (R.st[R.band].some(s => s.n === n && !s.bad)) R.seek = 0; } }
              const n = R.n[R.band]; let best = null, bd = 9; for (const s of R.st[R.band]) { const d = Math.abs(s.n - n); if (d < bd && !s.bad) { bd = d; best = s; } }
              const s = best && bd < B.bw ? 1 - bd / B.bw : 0; R.s += (s - R.s) * Math.min(1, dt * 8);
              if (s > 0 && best !== R.cur) { R.cur = best; audio.src = best.url; audio.play().catch(() => {}); }
              if (R.cur) { audio.volume = Math.min(1, R.s * 1.1); if (s === 0 && (R.idle += dt) > 0.6) { R.cur = null; R.idle = 0; audio.pause(); audio.removeAttribute('src'); audio.load(); } else if (s > 0) R.idle = 0; }
              if (R.ng) R.ng.gain.setTargetAtTime(0.11 * (1 - R.s) * (R.band === 'AM' ? 1.4 : 1), R.ac.currentTime, 0.05);
              const txt = B.f(n); if (ui.freq.textContent !== txt) { ui.freq.textContent = txt; draw(); }
              const nm = R.cur && R.s > 0.4 ? R.cur.name : R.st.FM.length + R.st.AM.length ? '· · · nhiễu · · ·' : ui.name.textContent; if (ui.name.textContent !== nm) ui.name.textContent = nm;
            }
            const pl = R.on && !!R.cur && R.s > 0.4 && !audio.paused; if (pl !== R.play) { R.play = pl; draw(); }
            if (pl && (R.et -= dt) <= 0) { R.et = 0.08; for (let i = 0; i < 7; i++) R.eq[i] += (Math.random() * (1 - Math.abs(i - 3) * 0.1) - R.eq[i]) * 0.6; draw(); }   // cột sóng táp-lô ~12 lần/giây
            if (pop.style.display !== 'none') wave(clock.elapsedTime);
            const show = hovShown(caravanObj) && (upp < 0.05 || R.on && upp < 0.12);
            if (!tag && show) { tag = addLabel('📻 Radio', '#e0662b', new THREE.Vector3(), new THREE.Vector3(), true, undefined, true); }
            if (tag) {
              tag.sprite.visible = tag.line.visible = show; const playing = R.on && R.cur && R.s > 0.4 && !audio.paused;
              const txt = R.on ? '📻 ' + R.band + ' ' + B.f(R.n[R.band]) + (playing ? ' · ' + R.cur.name : '') : '📻 Radio'; if (txt !== tag.text) tag.update(txt); tagK = tag.sprite.scale.x / tag.sprite.scale.y;
              scr.getWorldPosition(_p); const h = 30 * upp, lead = 56 * upp;
              tag.sprite.scale.set(h * tagK, h, 1); tag.sprite.position.set(_p.x, _p.y + lead + h / 2, _p.z);
              const pa = tag.line.geometry.attributes.position; pa.setXYZ(0, _p.x, _p.y + lead, _p.z); pa.setXYZ(1, _p.x, _p.y + 4 * upp, _p.z); pa.needsUpdate = true; tag.line.geometry.computeBoundingSphere();
              if (playing && show && (R.nt -= dt) <= 0) { R.nt = 0.45; const q = R.notes.find(o => o.userData.life <= 0); if (q) { q.userData.life = 2.2; q.userData.x = (Math.random() < 0.5 ? -1 : 1) * (12 + 22 * Math.random()); q.userData.ph = Math.random() * 6; q.visible = true; } }
              for (const q of R.notes) { const u = q.userData; if (u.life <= 0) continue; u.life -= dt; const k = 1 - u.life / 2.2;   // nốt bay lên 2 bên đường dẫn (dưới nhãn), lắc nhẹ, mờ dần
                q.position.set(_p.x + (u.x + 6 * Math.sin(u.ph + k * 7)) * upp, _p.y + (6 + 42 * k) * upp, _p.z); q.scale.setScalar(26 * upp); q.material.opacity = Math.sin(Math.PI * Math.min(1, k * 1.15)); if (u.life <= 0) q.visible = false; }
            }
          }
          return { tick, open, tagClick, power, state: R, g };
        })();
