        // ===== KỸ SƯ CẢM NHẬN THỜI TIẾT (G 22/10 "research about human behaviour about weather: apply to engineer when temperature change, hot, cold, rainning…") =====
        //  Nghiên cứu:
        //   · NHIỆT ĐỘ CẢM NHẬN — nhiệt độ biểu kiến Steadman (Cục Khí tượng Úc, "Norms of apparent temperature", 1994): AT = Ta + 0,348·e − 0,70·v + 0,70·Q/(v + 10)
        //     − 4,25 (e: áp suất hơi nước hPa từ độ ẩm Open-Meteo, v: gió m/s tại người, Q: bức xạ hấp thụ — ngoài nắng ≈ 0,2 × bức xạ sóng ngắn, trong bóng = 0).
        //     Cộng thêm: nhiệt cơ thể theo việc (ngồi −1 · đi +1,5 · đi vội +2,5 · lao động chân tay +3,5), hơ lửa (≤ +6 trong 3 m), trong xe kín gió (+1,5, đêm +3,5),
        //     áo ướt bay hơi (−4 × độ ướt). CẢM GIÁC = AT trễ τ 4 phút (da, cơ thể cần thời gian nóng lên / nguội đi).
        //   · ĐIỀU NHIỆT BẰNG HÀNH VI: lạnh ⇒ co người giảm diện tích da (khom, khép tay, khoanh tay ôm người), xoa tay, hà hơi, tìm nguồn nhiệt; nóng ⇒ quạt, lau mồ
        //     hôi, tìm bóng râm, uống nước. Đi bộ nhanh hơn ở 2 đầu nhiệt (< 10 °C, > 30 °C — cho mau khỏi chỗ khó chịu).
        //   · ALLIESTHESIA (de Dear): kích thích kéo cơ thể về trung tính thì dễ chịu — đang nóng gặp gió mát / vào bóng râm, đang lạnh được hơ ấm ⇒ thở phào;
        //     ngược lại đang dễ chịu bước ra chỗ lạnh ⇒ rùng mình "brr", ra nắng gắt ⇒ nheo mắt che nắng.
        //   · TÂM TRẠNG (Keller 2005): trời dễ chịu + ở ngoài ≥ 30 phút ⇒ vui hơn; nóng bức, rét, ướt ⇒ khó chịu (moodlet ở ui/sim-needs.js).
        //   · Thấy được: mồ hôi nhỏ giọt khi nóng mà vận động / đứng nắng · hơi thở thành khói khi ≤ 10 °C · áo, quần, tóc sẫm màu khi ướt mưa rồi khô dần.
        //  Cử chỉ + dáng: engineer/mind/reactions.js (rxWeather) · đi tìm bóng râm / đứng gần lửa: engineer/mind/loop-update.js (wander) ----
        const WX = { ta: 25, eV: 20, rad: 0, cloud: 50, at: 25, body: null, wet: 0, hotK: 0, coldK: 0, sun: 0, act: 0, outT: 0, envT: 0, ev: {}, drinkT: 0, wetLook: -1, mats: null };
        const _wxA = new THREE.Vector3(), _wxSp = new THREE.Color(0x8a8a8a);
        function wxEnv() {   // mỗi 10 s: nhiệt độ, áp suất hơi nước, mây, bức xạ sóng ngắn giờ hiện tại (như engContext — engineer/mind/thoughts.js)
          const st = liveWeather.state, cur = st.data?.current, ta = Number.isFinite(st.temperature) ? st.temperature : 25, rh = Number.isFinite(cur?.relative_humidity_2m) ? cur.relative_humidity_2m : 70;
          WX.ta = ta; WX.eV = rh / 100 * 6.105 * Math.exp(17.27 * ta / (237.7 + ta)); WX.cloud = Number.isFinite(cur?.cloud_cover) ? cur.cloud_cover : 50;
          let rad = null; const hr = st.data?.hourly;
          if (cur && Array.isArray(hr?.time)) { const i = hr.time.findIndex(x => x.slice(0, 13) === cur.time.slice(0, 13)); const v = i >= 0 ? hr.shortwave_radiation?.[i] : null; if (Number.isFinite(v)) rad = v; }
          WX.rad = rad ?? Math.max(0, 910 * Math.max(0, sunElevSin) - 30) * (1 - 0.75 * Math.pow(WX.cloud / 100, 3.4));
        }
        const WX_WORK = new Set(['trim', 'garden', 'apple', 'wood', 'grab', 'plant', 'toPlant']);   // lao động chân tay
        function wxTick(e, dt, t, out) {   // mỗi khung (engReactPre, cả khi ở trong xe)
          if (t >= WX.envT) { WX.envT = t + 10; wxEnv(); }
          const g = e.g.position, dry = out && rxDry(g), rain = rxRaining() || rainK > 0.25;
          const Q = out && !dry && sunElevSin > 0.05 ? 0.2 * WX.rad : 0, v = out ? Math.max(0.3, (dry ? 0.5 : 1) * RX.wm) : 0.1;   // gió tại người (m/s): dưới bạt còn nửa, trong xe gần lặng
          const s = e.seat && e.seat.st, sit = (s && s !== 'go' && s !== 'leave' && s !== 'stood') || e.phase === 'nap' || e.phase === 'stars';
          WX.act = WX_WORK.has(e.phase) ? 3.5 : e.walking ? (e.spd > 1.3 ? 2.5 : 1.5) : sit ? -1 : 0;
          let fire = 0;
          if (out) {   // bức xạ nhiệt của lửa trại / lò chiminea trong 3 m
            const fk = campfireLevel(liveWeather.localHour) * campRain.flameK, d = Math.hypot(pf.x - g.x, pf.z - g.z), dc = chiminea.g.position.distanceTo(g);
            if (fk > 0.2 && d < 3.2) fire = 6 * fk * (1 - d / 3.2) ** 2;
            if (chiminea.lit() > 0.2 && dc < 3) fire = Math.max(fire, 5 * chiminea.lit() * (1 - dc / 3) ** 2);
          }
          if (out && rain && !dry) WX.wet = Math.min(1, WX.wet + dt * Math.max(0.15, rainK) / 25);   // mưa to ~25 s là ướt sũng
          else WX.wet = Math.max(0, WX.wet - dt * (1 + (Q > 50 ? 2 : 0) + 0.3 * v + (fire > 1 ? 1 : 0) + (out ? 0 : 0.5)) / 600);   // khô ~10 phút, nắng / gió / lửa nhanh hơn
          const at = WX.ta + 0.348 * WX.eV - 0.70 * v + 0.70 * Q / (v + 10) - 4.25 + (out ? 0 : 1.5 + 2 * nightFactor) + WX.act + fire - 4 * WX.wet;
          if (WX.body === null) WX.body = at;
          const prev = WX.body; WX.at = at; WX.body += (at - WX.body) * (1 - Math.exp(-dt / 240)); WX.sun = Q;
          WX.hotK = rxSS(WX.body, 28, 34); WX.coldK = 1 - rxSS(WX.body, 13, 20);
          WX.outT = out && !rain && liveWeather.wildlifeAwake ? WX.outT + dt : Math.max(0, WX.outT - dt * 3);
          if (e.phase === 'drink') WX.drinkT = t;
          else if (out && WX.hotK > 0.5 && e.phase === 'wander' && t - WX.drinkT > 300) { e.phase = 'drink'; e.timer = 9; WX.drinkT = t; rxSay('thirst', RX_TXT.thirst, 'Trời nóng', false); }   // nóng: 5 phút uống nước 1 lần
          // ALLIESTHESIA: môi trường lệch hẳn khỏi cảm giác hiện tại (vào bóng râm, gặp gió, đứng cạnh lửa, bước ra chỗ lạnh / nắng gắt)
          if (out && Math.abs(at - prev) < 40) {
            const d = at - WX.body;
            if (t >= (WX.ev.relief || 0) && ((WX.body >= 29 && d <= -4) || (WX.body <= 18 && d >= 4))) { WX.ev.relief = t + 240; rxWxEvent(e, WX.body >= 29 ? 'cool' : 'warm'); }
            else if (t >= (WX.ev.shock || 0) && ((WX.body >= 21 && WX.body <= 28 && d <= -5) || (WX.body <= 28 && d >= 6 && Q > 80))) { WX.ev.shock = t + 300; rxWxEvent(e, d < 0 ? 'brr' : 'glare'); }
          }
          if (Math.abs(WX.wet - WX.wetLook) >= 0.02) wxWetLook();
          wxFxTick(e, dt, t, out);
        }
        function wxWetLook() {   // áo phản quang, quần, tóc ướt: sẫm tới 40% + bóng hơn (vật liệu riêng của kỹ sư — không gộp lượt vẽ)
          if (!WX.mats) { WX.mats = []; const seen = new Set(); engObj.g.traverse(o => { const m = o.isMesh && o.material; if (!m || Array.isArray(m) || seen.has(m) || !m.color) return; const h = m.color.getHex();
            if (h === 0xf08c00 || h === 0x3a4a63 || h === 0x4a3423) { seen.add(m); WX.mats.push([m, m.color.clone(), m.specular ? m.specular.clone() : null]); } }); }
          const w = WX.wetLook = WX.wet;
          for (const [m, c, sp] of WX.mats) { m.color.copy(c).multiplyScalar(1 - 0.4 * w); if (sp) m.specular.copy(sp).lerp(_wxSp, 0.6 * w); }
        }
        const wxFx = (() => {   // giọt mồ hôi · làn hơi thở (sprite, chỉ khi ở ngoài trời)
          const tex = draw => { const c = document.createElement('canvas'); c.width = c.height = 32; draw(c.getContext('2d')); return new THREE.CanvasTexture(c); };
          const dropT = tex(x => { const gr = x.createRadialGradient(16, 19, 1, 16, 19, 10); gr.addColorStop(0, 'rgba(240,250,255,1)'); gr.addColorStop(1, 'rgba(150,205,240,0.2)'); x.fillStyle = gr; x.beginPath(); x.moveTo(16, 3); x.quadraticCurveTo(26, 19, 16, 29); x.quadraticCurveTo(6, 19, 16, 3); x.fill(); });
          const puffT = tex(x => { const gr = x.createRadialGradient(16, 16, 1, 16, 16, 15); gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); });
          const mk = (map, n, name, life) => Array.from({ length: n }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; s.name = name; s.userData.noBatch = true; scene.add(s); return { s, t: life, v: new THREE.Vector3(), k: 0 }; });
          return { drops: mk(dropT, 5, 'Giọt mồ hôi kỹ sư', 0.9), puffs: mk(puffT, 3, 'Hơi thở kỹ sư', 1.6), dT: 0, pT: 0 };
        })();
        function wxFxTick(e, dt, t, out) {
          const F = wxFx, vis = out && e.g.visible !== false, S = e.g.scale.y;
          // mồ hôi: nóng + (đứng nắng / vận động) ⇒ giọt từ thái dương rơi theo trọng lực
          if (vis && WX.hotK > 0.35 && (WX.sun > 60 || WX.act > 1) && (F.dT -= dt) <= 0) {
            F.dT = 0.5 + Math.random() * 0.7 / WX.hotK; const d = F.drops.find(q => q.t >= 0.9);
            if (d) { e.head.updateWorldMatrix(true, false); e.head.localToWorld(d.s.position.set((Math.random() < 0.5 ? -1 : 1) * 0.2, 0.05 + Math.random() * 0.08, 0.1)); d.v.set(0, -0.15, 0); d.t = 0; d.s.visible = true; }
          }
          for (const d of F.drops) if (d.s.visible) { d.t += dt; d.v.y -= 2.4 * dt; d.s.position.addScaledVector(d.v, dt); d.s.material.opacity = 1 - d.t / 0.9; d.s.scale.set(0.07 * S, 0.1 * S, 1); if (d.t >= 0.9 || !vis) { d.s.visible = false; d.t = 0.9; } }
          // hơi thở hoá khói: ≤ 10 °C (rõ dần tới 4 °C), mỗi ~3,6 s thở ra 1 làn từ miệng — bay tới trước, theo gió, nở ra rồi tan
          const bk = vis ? 1 - rxSS(WX.ta, 4, 10) : 0;
          if (bk > 0.05 && (F.pT -= dt) <= 0) {
            F.pT = 3.2 + Math.random() * 0.8; const p = F.puffs.find(q => q.t >= 1.6), y = e.g.rotation.y;
            if (p) { e.head.updateWorldMatrix(true, false); e.head.localToWorld(p.s.position.set(0, -0.08, 0.27)); p.v.set(Math.sin(y) * 0.35 + RX.wv.x * 0.2, 0.06, Math.cos(y) * 0.35 + RX.wv.z * 0.2); p.t = 0; p.k = bk; p.s.visible = true; }
          }
          for (const p of F.puffs) if (p.s.visible) { p.t += dt; p.s.position.addScaledVector(p.v, dt); p.v.multiplyScalar(Math.exp(-dt * 1.2)); const u = p.t / 1.6; p.s.scale.setScalar((0.2 + 0.55 * u) * S); p.s.material.opacity = 0.85 * p.k * Math.sin(Math.PI * Math.min(1, u * 1.3)) * (1 - 0.6 * u); if (p.t >= 1.6 || !vis) { p.s.visible = false; p.t = 1.6; } }
        }
        function wxShadeSpot(e) {   // nóng + nắng: điểm trống dưới mái bạt hiên xe để đứng tránh nắng (null nếu không có)
          if (!RX_AW || WX.hotK < 0.35 || sunElevSin < 0.15) return null;
          for (let k = 0; k < 12; k++) {
            const w = caravanObj.localToWorld(_wxA.set(RX_AW.x0 + Math.random() * (RX_AW.x1 - RX_AW.x0), 0, RX_AW.z0 + 0.3 + Math.random() * (RX_AW.z1 - RX_AW.z0 - 0.6)));
            if (ENG_PROPS.some(o => Math.hypot(w.x - o.x, w.z - o.z) < o.r + 0.5) || !engLineClearOfSeats(e.g.position.x, e.g.position.z, w.x, w.z)) continue;
            return new THREE.Vector3(w.x, 0, w.z);
          }
          return null;
        }
        function wxNeeds(dt) {   // giờ trong cảnh — nóng: mồ hôi ⇒ tắm rửa tụt thêm ≤ 2,5/giờ, mệt nhanh hơn; lạnh: tốn sức giữ ấm (ui/sim-needs.js)
          const n = sim.n; if (!n || !Number.isFinite(n.hygiene)) return;
          n.hygiene = Math.max(0, n.hygiene - 2.5 * WX.hotK * dt); n.energy = Math.max(0, n.energy - (1.0 * WX.hotK + 0.8 * WX.coldK) * dt);
        }
        function wxMoods(L) {   // moodlet theo cảm nhận thời tiết (ui/sim-needs.js simEmotion)
          if (WX.hotK > 0.45) L.push({ name: WX.hotK > 0.8 ? 'Nóng bức' : 'Nóng nực', emo: 'uncomfortable', w: WX.hotK > 0.8 ? 2 : 1 });
          if (WX.coldK > 0.45) L.push({ name: WX.coldK > 0.8 ? 'Rét buốt' : 'Lạnh run', emo: 'uncomfortable', w: WX.coldK > 0.8 ? 2 : 1 });
          if (WX.wet > 0.3) L.push({ name: 'Ướt mưa', emo: 'uncomfortable', w: 1 });
          if (WX.outT >= 1800 && WX.body >= 20 && WX.body <= 27 && WX.wet < 0.1) L.push({ name: 'Trời đẹp', emo: 'happy', w: 1 });   // Keller 2005: thời tiết dễ chịu + ở ngoài ≥ 30 phút
        }
