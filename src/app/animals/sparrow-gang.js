        // ===== BẦY 6 CHIM SẺ NHÀ QUANH TRẠI (G 24/10 "Add 6 more small birds, research and study small bird behaviour, hạn chế chim lắc đầu qua lại nhiều,
        //      more react to the environment, each birb each behaviour react, but when come together … what they do in group") =====
        //  3 trống + 3 mái (makeSparrow plum), mỗi con 1 tính cách (SPARROW_CAST). Sống quanh trại: cỏ quanh bếp lửa, luống cà rốt, mép mui xe, thanh cuốn bạt
        //  hiên, 2 cây táo; tối ngủ chung cây rừng sát trại với đàn 5 con. Nghiên cứu đã áp dụng (nguồn: src/ARCHITECTURE.md):
        //   · ÁNH NHÌN: liếc nhanh rồi giữ yên đầu (makeSparrow glance) — cho cả 16 con.
        //   · CẢNH GIÁC THEO CỠ BẦY: bầy càng đông thì mỗi con ngẩng canh càng ngắn, càng thưa và mổ nhiều hơn; giảm tới ~4–5 con thì chững (chim sẻ nhà,
        //     Studd & cs. 1983 — B.vig tính trong updateSparrows). Bầy đông bỏ chạy sớm hơn khi người lại gần (Harkin & cs. 2000) ⇒ B.fid nhân theo cỡ bầy.
        //   · BÁO ĐỘNG LAN: 1 con vụt bay vì mối nguy ⇒ con trong 8 m bay theo sau 0,06–0,4 s (con bám bầy nhanh hơn), cùng về 1 chỗ trú; đàn 5 con kiếm ăn
        //     gần đó cũng bay. Ở chỗ trú nhìn chằm chằm mối nguy; con bạo dạn quay lại kiếm ăn trước, con nhút nhát đợi lâu.
        //   · THEO BẠN (local enhancement): thấy bạn đang ăn / tắm / phơi nắng thì muốn làm theo, sà xuống cạnh; con nhút nhát bám đúng bạn quen.
        //   · THỨ BẬC: chim mái trội ở chỗ ăn và chỗ tắm bụi; giữa chim trống, yếm đen to thường trội hơn ("huy hiệu địa vị" — tổng hợp 2018 cho thấy
        //     mối liên hệ này yếu, nên chỉ cộng nhẹ). Đứng sát nhau quá (< 14 cm): con dưới nhảy né, con trên chúi đầu há mỏ doạ.
        //   · TẮM BỤI CHUNG ở luống cà rốt khi đất khô (thợ vườn hay than chim sẻ bới luống): nằm bẹp, xù lông, cánh quạt bụi, lắc mình; con trội chiếm hố.
        //   · TỤ TẬP RÍU RÍT 18:15–19:00 trên cành ngoài cây ngủ ("social singing") rồi chui vào trong ngủ chung; sáng dậy ríu rít 1 lúc mới tản đi.
        //   · VE VÃN TẬP THỂ (vùng nhiệt đới sinh sản quanh năm; ôn đới chỉ xuân hè): vài chim trống xù ngực, xệ cánh run, vểnh xoè đuôi, nhảy vòng quanh 1 chim
        //     mái và kêu liên hồi; chim mái mổ đuổi rồi bay đi, các chim trống bay theo.
        //   · MÔI TRƯỜNG: nóng ≥ 31 °C ngoài nắng há mỏ thở dốc, hé cánh cho thoáng, tìm bóng cây; sáng mát có nắng thì phơi nắng (xù lông, xệ cánh, xoè đuôi,
        //     quay lưng về mặt trời); rét ≤ 14 °C xù lông thu chân; uống ở máng bò: chấm mỏ múc rồi ngửa cổ nuốt; sau mưa uống vũng nước; sét đánh ⇒ cả bầy
        //     lủi vào tán cây; drone bay (vật bay trên đầu như chim săn) ⇒ lủi vào tán, nhìn theo; máy cắt cỏ / máy xe nổ ⇒ tránh xa, cỏ vừa cắt lộ sâu bọ
        //     ⇒ ra mổ; kỹ sư ngồi ăn ở ghế ⇒ con bạo dạn xuống nhặt vụn quanh chân ghế; gấu mèo lúc chạng vạng ⇒ đậu cao cách 3–7 m kêu báo động, giật đuôi,
        //     nhìn chằm chằm (con nhút nhát chỉ trốn).
        const SPARROW_CAST = [   // sex · bib: yếm (0–1) · bold: bạo dạn · social: bám bầy · rank: thứ bậc (chim mái +0,35 ở chỗ ăn / tắm) · like: sở thích · buddy: bạn quen
          { name: 'Trống đầu đàn', sex: 'm', bib: 1, bold: 0.75, social: 0.6, rank: 0.8, like: 'sing' },
          { name: 'Mái đầu đàn', sex: 'f', bold: 0.6, social: 0.7, rank: 1, like: 'dust' },
          { name: 'Trống non gan dạ', sex: 'm', bib: 0.35, bold: 1, social: 0.35, rank: 0.35, like: 'explore' },
          { name: 'Mái nhút nhát', sex: 'f', bold: 0.15, social: 0.95, rank: 0.45, like: 'cover', buddy: 4 },
          { name: 'Mái hiền', sex: 'f', bold: 0.45, social: 0.8, rank: 0.7, like: 'sun' },
          { name: 'Trống cảnh giác', sex: 'm', bib: 0.65, bold: 0.35, social: 0.6, rank: 0.55, like: 'watch' }
        ];
        const sparrowGang = (() => {
          const rnd = Math.random, _v = new THREE.Vector3(), _vd = new THREE.Vector3(), _sd = new THREE.Vector3();
          const G = { t: 0, envT: 0, grpT: 0, bolt: storm.until, boltT: -1e9, trim: false, cutT: -1e9, eatT: -1e9, ref: null, refT: -1e9, dispT: 90 + rnd() * 120, disp: null, init: false,
            wx: { drone: null, droneP: new THREE.Vector3(), engHead: new THREE.Vector3() } };
          const near2 = (a, b) => Math.hypot(a.x - b.x, a.z - b.z), rankOf = b => b.me.rank + (b.me.sex === 'f' ? 0.35 : 0);
          const vanW = (x, y, z) => caravanObj.localToWorld(new THREE.Vector3(x, y, z));
          const vanDist = (x, z) => { const q = caravanObj.worldToLocal(_vd.set(x, caravanObj.position.y, z)); return Math.hypot(Math.max(0, Math.abs(q.x + 0.11) - 3.16), Math.max(0, Math.abs(q.z) - 1.07)) * caravanObj.scale.x; };   // tới vỏ xe
          const allSp = () => SPA.all || [songbird, ...flock.birds, ...nestPairs.flat(), ...birds];
          const taken = p => allSp().some(o => { const B = o.state, q = B.st === 'fly' ? B.to && B.to.p : B.at && B.at.p; return q && q.distanceTo(p) < 0.14; });   // chỗ đã có chim đậu / đang bay tới
          // ---- ảnh chụp môi trường dùng chung cả bầy (5 lần/s) ----
          function env() {
            const E = G.wx, st = liveWeather.state, lat = st.city?.lat ?? 14;
            E.h = liveWeather.localHour; E.awake = sparrowAwake(); E.rain = st.raining; E.wind = (st.windSpeed ?? 8) / 3.6;
            E.temp = Number.isFinite(st.temperature) ? st.temperature : 24; E.cloud = st.data?.current?.cloud_cover ?? 30; E.sunUp = sunElevSin;
            _sd.copy(sun.position).sub(sun.target.position); E.sunYaw = Math.atan2(-_sd.x, -_sd.z);   // hướng quay lưng về mặt trời
            E.eng = engObj && !engObj.inVan && engObj.g.parent === scene ? engObj.g.position : null; if (E.eng) E.engHead.copy(E.eng).y += 1.1;
            E.eat = !!E.eng && (engObj.phase === 'eat' || engObj.phase === 'eatFish') && near2(E.eng, campChairPos) < 0.8; if (E.eat) G.eatT = G.t;
            E.trim = trimKit.eng.on && E.eng ? E.eng : null; if (G.trim && !trimKit.eng.on) G.cutT = G.t; G.trim = trimKit.eng.on;   // máy vừa tắt: bãi cỏ vừa cắt
            E.van = ENGR.on;
            E.drone = null; if (droneToy.state.spin > 0.3) { droneToy.g.getWorldPosition(E.droneP); if (E.droneP.y - cowY(E.droneP.x, E.droneP.z) > 0.4) E.drone = E.droneP; }   // đang bay (còn trên bàn / đất thì chưa)
            E.rac = raccoonObj && raccoonObj.visible ? raccoonObj.position : null;
            if (storm.until > G.bolt + 0.05) { E.bolt = true; G.boltT = G.t; } G.bolt = storm.until;   // vừa có tia sét
            E.dust = !E.rain && sceneWet < 0.08 && clock.elapsedTime - carrotBed.B.lastWater > 1500 && !carrotBed.eating() && !(E.eng && near2(E.eng, carrotBed.C) < 2.2);   // luống khô, không ai ở luống
            E.breed = Math.abs(lat) < 23.5 || (lat >= 0 ? [2, 3, 4, 5, 6, 7] : [8, 9, 10, 11, 0, 1]).includes(new Date().getMonth());
          }
          // ---- chỗ đến (dựng lần đầu dùng: luống cà rốt, máy xe nằm sau tệp này trong manifest) ----
          let SI = null;
          function sites() {
            if (SI) return SI;
            const tp = (T, apple) => {   // chỗ đậu trên cành thật: inner = kín, sát thân (ngủ, trú, bóng râm) · outer = cành ngoài, cao (hót, ríu rít)
              let segs, toW, sN, c;
              if (apple) { T.updateMatrixWorld(true); segs = T.userData.limbs; toW = v => T.localToWorld(v); sN = T.scale.x; c = T.position; }
              else { sN = (T.s || 2) * NATURE_SCALE; const co = Math.cos(T.rot || 0), si = Math.sin(T.rot || 0); segs = T.V && T.V.segs; c = new THREE.Vector3(T.x, T.y, T.z);
                toW = v => { const x = v.x * sN, y = v.y * sN * 0.875, z = v.z * sN; return v.set(T.x + x * co + z * si, T.y + y, T.z - x * si + z * co); }; }
              if (!segs) return null;
              const L = branchPerches(segs, toW, sN, { rMin: 0.012, rMax: apple ? 0.07 : 0.09, y0: 0.3, y1: 0.95 }), ex = q => -near2(q.p, c) - (q.p.y - c.y);
              return { c, inner: pickPerches(L, 12, 0.2), outer: pickPerches(L.slice().sort((a, b) => ex(a) - ex(b)), 10, 0.3) };
            };
            const roostT = treeCoords.reduce((a, t) => near2(t, pf) < near2(a, pf) ? t : a, treeCoords[0]);   // cây rừng sát trại — đàn 5 con cũng ngủ cây này
            const CC = new THREE.Vector3().lerpVectors(caravanObj.position, pf, 0.55);   // giữa xe và bếp lửa
            SI = { CC, apple: appleTrees.map(T => tp(T, true)).filter(Boolean), roost: tp(roostT, false), vanC: vanW(1.2, 2.9, 0.8), barC: vanW(1.1, 2.49, 3.4),
              covers: [...appleTrees.map(T => ({ x: T.position.x, z: T.position.z, r: 0.5 })), ...treeCoords.filter(t => near2(t, CC) < 30).map(t => ({ x: t.x, z: t.z, r: 0.4 })), { x: carrotBed.C.x, z: carrotBed.C.z, r: 1 }],
              bowls: [-0.57, 0, 0.57].map(x => new THREE.Vector3(carrotBed.C.x + x, carrotBed.C.y + carrotBed.H - 0.03, carrotBed.C.z)) };   // 3 hố bụi giữa 2 hàng cà rốt
            if (!SI.roost) SI.roost = SI.apple[0];
            return SI;
          }
          const SITE = {
            roof: () => ({ p: vanW(-0.4 + rnd() * 3.1, 2.965, 0.86), yaw: caravanObj.rotation.y + (rnd() - 0.5) * 0.8, kind: 'roof', van: true }),   // mép mui phía trại
            bar: () => ({ p: vanW(-0.6 + rnd() * 3.3, 2.49, 3.4), yaw: caravanObj.rotation.y + (rnd() < 0.75 ? 0 : Math.PI), kind: 'bar', van: true }),   // thanh cuốn mép ngoài bạt hiên
            rim: () => { const s = rnd() < 0.5 ? 1 : -1, C = carrotBed.C; return { p: new THREE.Vector3(C.x + (rnd() - 0.5) * 1.7, C.y + carrotBed.H, C.z + s * (carrotBed.W / 2 - 0.0225)), yaw: s > 0 ? 0 : Math.PI, kind: 'rim' }; },   // thành gỗ luống
            trough: () => {   // thành máng nước bò (mặt nước thấp hơn miệng 8 cm), quay mặt vào lòng máng
              const s = rnd() < 0.5 ? 1 : -1, x = cowHut.x + cowHut.W / 2 + 0.95 + s * 0.315, z = cowHut.z + 0.75 + (rnd() - 0.5) * 1.1;
              return { p: new THREE.Vector3(x, cowHut.y + 0.5, z), yaw: s > 0 ? -Math.PI / 2 : Math.PI / 2, kind: 'trough', fixYaw: true, sip: 3 + ((rnd() * 4) | 0), T: 14 };
            }
          };
          const coverD = (x, z) => { let d = vanDist(x, z); for (const c of sites().covers) d = Math.min(d, Math.hypot(x - c.x, z - c.z) - c.r); return d; };   // tới chỗ nấp gần nhất
          const danger = (x, z, k) => {   // chỗ này đang gần mối nguy?
            const E = G.wx, d = q => Math.hypot(q.x - x, q.z - z);
            return !!(E.eng && d(E.eng) < (SPA.engV > 0.3 ? 2.6 : 1.5) * k || !dogRain.st && d(dogObj.position) < 3 * k || E.rac && d(E.rac) < 5 || E.trim && d(E.trim) < 8 || E.drone && d(E.drone) < 10 || E.van && vanDist(x, z) < 3);
          };
          const okG = (x, z, k) => { const i = Math.round(x2gi(x)), j = Math.round(z2gj(z)); return i > 3 && j > 3 && i < GX - 3 && j < GZ - 3 && !isWater(i, j) && envFree(x, z)
            && !obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3) && !ENG_PROPS.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.25)
            && !(cowHutRect && x > cowHutRect.x0 - 1 && x < cowHutRect.x1 + 1 && z > cowHutRect.z0 - 1 && z < cowHutRect.z1 + 1) && !danger(x, z, k); };
          const gSite = (x, z) => ({ p: new THREE.Vector3(x, cowY(x, z), z), yaw: rnd() * TAU, kind: 'ground' });
          const ringSpot = (b, c, r0, r1, n = 24) => { for (let k = 0; k < n; k++) { const a = rnd() * TAU, r = r0 + rnd() * (r1 - r0), x = c.x + Math.cos(a) * r, z = c.z + Math.sin(a) * r; if (okG(x, z, b.fidK)) return gSite(x, z); } return null; };
          const freeGen = (b, gen) => { if (G.wx.van && gen !== SITE.rim && gen !== SITE.trough || G.wx.wind > 8 && (gen === SITE.roof || gen === SITE.bar)) return null;   // máy xe nổ / gió to: không đậu xe
            for (let k = 0; k < 6; k++) { const w = gen(); if (!taken(w.p) && !danger(w.p.x, w.p.z, b.fidK * 0.6)) return w; } return null; };
          function treeSpot(b, which, from) {   // chỗ đậu trống trên cây gần (from: tránh xa điểm này)
            const s = sites(), L = [];
            for (const T of [...s.apple, s.roost]) if (T) for (const q of T[which]) if (!taken(q.p) && !(G.wx.trim && near2(q.p, G.wx.trim) < 9)) L.push({ q, k: near2(q.p, b.root.position) + (from ? -2 * Math.min(near2(q.p, from), 12) : 0) + rnd() * 6 });   // máy cắt cỏ đang chạy: không đậu cành gần
            L.sort((x, y) => x.k - y.k); const q = L[0] && L[0].q;
            return q && { p: q.p.clone(), yaw: q.yaw + (rnd() < 0.5 ? 0 : Math.PI), kind: which === 'inner' ? 'branch' : 'twig' };
          }
          function nearPerch(b, p) {   // chỗ đậu trống gần điểm p nhất (cách ≥ 0,25 m)
            const s = sites(), C = [];
            for (const T of [...s.apple, s.roost]) if (T) for (const q of [...T.outer, ...T.inner]) C.push({ p: q.p, yaw: q.yaw, kind: 'twig' });
            for (let k = 0; k < 4; k++) C.push(SITE.bar(), SITE.roof());
            let best = null, bd = 1e9; for (const w of C) { const d = w.p.distanceTo(p); if (d > 0.25 && d < bd && !taken(w.p) && !(w.van && G.wx.van)) { bd = d; best = w; } }
            return best && { ...best, p: best.p.clone() };
          }
          function groundSpot(b, mode) {
            const me = b.me, s = sites();
            // THEO BẠN: sà xuống cạnh 1 bạn đang kiếm ăn (con nhút nhát chọn đúng bạn quen)
            if (mode === 'forage' && rnd() < 0.6 * me.social) {
              const fr = birds.filter(o => o !== b && o.state.st === 'forage' && !o.state.hold && !o.state.bath), o = fr.find(q => q.i === me.buddy) || fr[(rnd() * fr.length) | 0];
              if (o) { const w = ringSpot(b, o.root.position, 0.22, 0.7, 12); if (w) return w; }
            }
            const R = me.like === 'explore' ? 16 : 9;
            for (let k = 0; k < 40; k++) {
              const a = rnd() * TAU, r = 1.5 + rnd() * R, x = s.CC.x + Math.cos(a) * r, z = s.CC.z + Math.sin(a) * r;
              if (!okG(x, z, b.fidK)) continue;
              const cd = coverD(x, z);
              if (mode === 'open' ? cd < 2 : me.bold < 0.4 ? cd > 1.4 : me.bold > 0.7 && cd < 1.2 && rnd() < 0.7) continue;   // nhút nhát: sát chỗ nấp · bạo dạn: ra giữa bãi
              return gSite(x, z);
            }
            return null;
          }
          function crumbSpot(b) {   // vụn cơm quanh chân ghế: trước mặt kỹ sư ±70°, 0,75–1,4 m, không gần hơn tầm bỏ chạy của con này
            for (let k = 0; k < 16; k++) {
              const a = campChairFaceY + (rnd() - 0.5) * 2.4, r = 0.75 + rnd() * 0.65, x = campChairPos.x + Math.sin(a) * r, z = campChairPos.z + Math.cos(a) * r;
              if (!envFree(x, z) || obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.15) || G.wx.eng && Math.hypot(x - G.wx.eng.x, z - G.wx.eng.z) < 1.2 * b.fidK) continue;
              return { ...gSite(x, z), yaw: Math.atan2(campChairPos.x - x, campChairPos.z - z) + (rnd() - 0.5) };
            }
            return null;
          }
          function bowlSpot(b) {   // hố bụi trống, hoặc hố của con thấp bậc hơn (sẽ đuổi nó ra); hết hố thì đậu thành luống chờ
            const bw = sites().bowls; let k0 = -1;
            for (let k = 0; k < bw.length; k++) { const occ = birds.find(o => o !== b && o.bowl === k); if (!occ) { k0 = k; break; } if (k0 < 0 && rankOf(occ) < rankOf(b) - 0.05) k0 = k; }
            if (k0 < 0) return freeGen(b, SITE.rim);
            b.bowl = k0; return { p: bw[k0].clone(), gy: bw[k0].y, yaw: rnd() * TAU, kind: 'ground', dust: true, bowl: k0, T: 40 };
          }
          // ---- chọn việc tiếp theo: trọng số theo tính cách + môi trường + bạn bè đang làm gì ----
          function weights(b) {
            const E = G.wx, me = b.me, hot = E.temp >= 30 && E.sunUp > 0.4, cool = E.temp < 24, sunny = E.sunUp > 0.08 && E.sunUp < 0.65 && E.cloud < 55;
            const W = { forage: 3, perch: 1.2 + (me.like === 'watch' ? 1.6 : 0) + (me.like === 'cover' ? 0.6 : 0), preen: 0.6, drink: 0.3 };
            if (me.sex === 'm') W.sing = me.like === 'sing' ? 2.2 : 0.7;
            if (E.dust) W.dust = me.like === 'dust' ? 1.6 : 0.4;
            if (sunny && cool && (E.h < 10.5 || E.h > 15.5)) W.sun = me.like === 'sun' ? 2.6 : 0.5;
            if (hot) { W.shade = 3; W.forage = 1.2; W.drink = 1.2; }
            if (E.eat || G.t - G.eatT < 180) W.crumbs = 5 * Math.max(0, me.bold - 0.3);
            if (G.t - G.cutT < 900) W.mown = 3 * (0.3 + me.bold);
            if (sceneWet > 0.3) { W.forage += 1.5; W.drink += 0.6; }   // sau mưa: sâu bọ bò lên, vũng nước
            for (const o of birds) if (o !== b && o.act in W && near2(o.root.position, b.root.position) < 25) W[o.act] += me.social * (me.buddy === o.i ? 3 : 1);
            for (const k in b.cd) if (G.t < b.cd[k]) delete W[k];   // vừa làm xong: nghỉ 1 lúc mới làm lại
            return W;
          }
          const COOL = { dust: 600, drink: 300, sun: 300, sing: 45 };   // giây nghỉ giữa 2 lần cùng việc
          function pick(W) { let s = 0; for (const k in W) s += W[k]; let r = rnd() * s; for (const k in W) if ((r -= W[k]) <= 0) return k; return 'forage'; }
          function doAct(b, act) {
            const B = b.state; let w = null;
            b.act = act; b.bowl = -1;
            if (act === 'forage') w = groundSpot(b, 'forage');
            else if (act === 'mown') w = ringSpot(b, pf, 3.6, 7);
            else if (act === 'crumbs') w = crumbSpot(b);
            else if (act === 'dust') w = bowlSpot(b);
            else if (act === 'drink') {   // sau mưa uống vũng nước ngay bãi cỏ; ngày khô bay ra máng bò (bò đang đứng máng thì thôi)
              if (sceneWet > 0.3) { w = groundSpot(b, 'forage'); if (w) w.sip = 3 + ((rnd() * 3) | 0); }
              else if (!cows.some(c => Math.hypot(c.x - cowHut.x - cowHut.W / 2 - 0.95, c.z - cowHut.z - 0.75) < 2)) w = freeGen(b, SITE.trough);
            }
            else if (act === 'sun') w = rnd() < 0.6 ? freeGen(b, SITE.roof) : groundSpot(b, 'open');
            else if (act === 'shade') w = treeSpot(b, 'inner');
            else if (act === 'sing') w = rnd() < 0.45 ? freeGen(b, SITE.roof) : rnd() < 0.6 ? freeGen(b, SITE.bar) : treeSpot(b, 'outer');
            else w = [SITE.bar, SITE.roof, SITE.rim, 'outer', 'inner'].map(q => () => typeof q === 'string' ? treeSpot(b, q) : freeGen(b, q))[(rnd() * 5) | 0]();
            if (!w) { b.act = 'forage'; w = groundSpot(b, 'forage') || treeSpot(b, 'inner'); }
            if (!w) { B.T = B.k + 5; return; }
            if (w.T == null) w.T = act === 'shade' ? 60 + rnd() * 60 : act === 'sun' ? 30 + rnd() * 30 : act === 'sing' ? 30 + rnd() * 30 : act === 'forage' || act === 'mown' || act === 'crumbs' ? 45 + rnd() * 55 : 25 + rnd() * 35;
            if (COOL[act]) b.cd[act] = G.t + COOL[act];
            if (w.kind === 'ground' && B.st === 'forage' && !w.dust && near2(w.p, b.root.position) < 0.6) { B.T = B.k + w.T; return; }   // chỗ mới ngay cạnh: nhảy tiếp, khỏi bay
            b.flyTo(w);
          }
          function nextAct(b) {
            const B = b.state, E = G.wx; B.gaze = null; B.hold = false; B.disp = 0;
            if (!E.awake) return;
            if (E.h >= 18.25 || b.act === 'dawn' && G.t < b.dawnGo) { goChorus(b); return; }   // ríu rít trước khi ngủ / sáng sớm
            // ở lại thêm 1 lúc (đỡ bay đi bay lại liên tục)
            if (['forage', 'crumbs', 'mown', 'perch', 'sing', 'shade', 'sun', 'preen'].includes(b.act) && rnd() < 0.6 && !danger(b.root.position.x, b.root.position.z, b.fidK)) { B.T = B.k + 15 + rnd() * 25; return; }
            doAct(b, pick(weights(b)));
          }
          function goChorus(b) {   // cành ngoài cây ngủ: nhảy chỗ này chỗ kia, ríu rít
            const R = sites().roost, B = b.state; b.act = b.act === 'dawn' ? 'dawn' : 'chorus';
            if (B.at && B.at.kind === 'chorus' && B.st === 'perch' && rnd() < 0.5) { B.T = B.k + 5 + rnd() * 8; return; }
            const L = R.outer.filter(q => !taken(q.p)), q = L.length && L.sort((x, y) => near2(x.p, b.root.position) - near2(y.p, b.root.position))[Math.min(L.length - 1, (rnd() * 3) | 0)];
            if (!q) { B.T = B.k + 6; return; }
            b.flyTo({ p: q.p.clone(), yaw: q.yaw + (rnd() < 0.5 ? 0 : Math.PI), kind: 'chorus', T: 6 + rnd() * 9 });
          }
          function goRoost(b) {   // ngủ chung: chỗ kín sát thân cây ngủ, mỗi con 1 chỗ
            const R = sites().roost, B = b.state, L = R.inner; b.act = 'roost'; b.wary = null; b.bowl = -1; B.gaze = null; B.hold = false; B.disp = 0;
            let q = null; for (let k = 0; k < L.length && !q; k++) { const c = L[(b.i + k) % L.length]; if (!taken(c.p)) q = c; }
            q = q || L[b.i % L.length]; b.flyTo({ p: q.p.clone(), yaw: q.yaw + (b.i % 2 ? Math.PI : 0), kind: 'roost', sleep: true });
          }
          function wake(b) {
            const B = b.state; B.st = 'perch'; B.k = 0; B.shk = 0.5;
            if (G.wx.h < 6.3) { b.act = 'dawn'; b.dawnGo = G.t + 20 + rnd() * 140 * (1.4 - b.me.bold); goChorus(b); }   // con bạo dạn tản đi trước
            else { b.act = 'perch'; B.T = 3 + rnd() * 5; }
          }
          // ---- BỎ CHẠY + BÁO ĐỘNG LAN ----
          function refuge(b, from, kind) {   // chỗ trú: tán cây (kín) · mui xe / thanh bạt (cao, thoáng — chỉ khi mối nguy dưới đất và máy xe không nổ)
            const s = sites(), C = [];
            for (const T of [...s.apple, s.roost]) if (T) C.push({ c: T.c, which: kind === 'ground' && rnd() < 0.5 ? 'outer' : 'inner' });
            if (kind === 'ground' && !G.wx.van) C.push({ c: s.vanC, gen: SITE.roof }, { c: s.barC, gen: SITE.bar });
            let best = null, bs = 1e9;
            for (const R of C) { const dT = near2(R.c, from); if (kind === 'noise' && dT < 10) continue; const sc = 0.5 * near2(R.c, b.root.position) - Math.min(dT, 12) + (rnd() - 0.5) * 3; if (sc < bs) { bs = sc; best = R; } }
            return best;
          }
          function pickIn(b, R) {
            if (R.gen) return freeGen(b, R.gen);
            const s = sites(), T = [...s.apple, s.roost].find(q => q && q.c === R.c), L = T ? T[R.which].filter(q => !taken(q.p)) : [];
            if (!L.length) return treeSpot(b, 'inner');
            const q = L[(rnd() * Math.min(4, L.length)) | 0]; return { p: q.p.clone(), yaw: q.yaw + (rnd() < 0.5 ? 0 : Math.PI), kind: 'refuge' };
          }
          function flee(b, src, kind, follow) {   // kind: 'ground' (người, chó, thú) · 'air' (drone) · 'storm' (sét) · 'noise' (máy)
            const B = b.state; if (b.act === 'roost') return;
            const from = src || b.root.position, R = follow && G.ref && G.t - G.refT < 4 && near2(G.ref.c, b.root.position) < 30 ? G.ref : refuge(b, from, kind);
            if (!follow) { G.ref = R; G.refT = G.t; }
            const w = R && pickIn(b, R); if (!w) return;
            const live = src && (src === dogObj.position || src === G.wx.rac || src === G.wx.eng) ? src : src && src.clone ? src.clone() : null;
            b.act = 'wary'; b.bowl = -1; b.wary = { kind, at: () => kind === 'air' ? G.wx.drone : kind === 'noise' ? G.wx.trim || (G.wx.van ? caravanObj.position : null) : live,
              dur: 5 + 25 * (1 - b.me.bold) * (0.6 + 0.8 * rnd()), until: null };   // đợi 5–35 s kể từ lúc đáp: con bạo dạn quay lại trước
            b.flyTo({ ...w, T: 1e9 });
            if (!follow) alarm(b, from, kind);
          }
          function alarm(b, from, kind) {   // con trong 8 m bay theo sau 0,06–0,4 s (bám bầy ⇒ nhanh hơn; đang đậu chậm hơn chút)
            for (const o of birds) { if (o === b || o.go != null || o.act === 'wary' || o.act === 'roost' || o.state.st === 'fly' || near2(o.root.position, b.root.position) > 8) continue;
              o.go = 0.06 + 0.34 * (1 - o.me.social) * rnd() + (o.state.st === 'perch' ? 0.1 : 0); o.goSrc = from; o.goKind = kind; }
            if (flock.birds.some(f => f.state.st === 'forage' && near2(f.root.position, b.root.position) < 6)) flock.scare();   // đàn 5 con gần đó cũng giật mình
          }
          const safe = b => { const W = b.wary, E = G.wx, p = b.root.position;
            return W.kind === 'air' ? !E.drone || near2(E.drone, p) > 25 : W.kind === 'storm' ? G.t - G.boltT > 25 : W.kind === 'noise' ? !(E.trim && near2(E.trim, p) < 12) && !E.van : !sparrowFlush(p, b.fidK * 1.6) && !(E.rac && near2(E.rac, p) < 8); };
          function mob(b) {   // gấu mèo: đậu cao cách 3–7 m, kêu báo động, giật đuôi, nhìn chằm chằm · con nhút nhát chỉ trốn vào tán
            const E = G.wx; if (b.me.bold < 0.3) { flee(b, E.rac, 'ground', true); return; }
            const s = sites(), L = [];
            for (const T of [...s.apple, s.roost]) if (T) for (const q of [...T.outer, ...T.inner]) { const d = near2(q.p, E.rac); if (d > 3 && d < 7 && !taken(q.p)) L.push(q); }
            for (let k = 0; k < 4 && !G.wx.van; k++) { const w = SITE.roof(); const d = near2(w.p, E.rac); if (d > 3 && d < 7 && !taken(w.p)) L.push(w); }
            if (!L.length) { flee(b, E.rac, 'ground', true); return; }
            const q = L.sort((x, y) => near2(x.p, b.root.position) - near2(y.p, b.root.position))[0]; b.act = 'mob'; b.bowl = -1;
            b.flyTo({ p: q.p.clone(), yaw: q.yaw, kind: 'mob', T: 1e9 });
          }
          // ---- kêu: mỗi tràng 0,4–4 s, nghỉ giữa tràng; bạn đậu gần có khi đáp lại vài tiếng ----
          function songTick(b, dt, g0, g1, l0, l1) {
            const B = b.state; if (B.song > 0 || (b.songGap -= dt) > 0) return;
            B.song = l0 + rnd() * (l1 - l0); b.songGap = g0 + rnd() * (g1 - g0);
            for (const o of birds) if (o !== b && o.state.st === 'perch' && o.state.song <= 0 && o.act !== 'roost' && rnd() < 0.25 && near2(o.root.position, b.root.position) < 4) o.state.song = 0.5 + rnd() * 0.7;
          }
          // ---- mỗi khung, từng con ----
          function think(b, dt) {
            const B = b.state, E = G.wx, me = b.me;
            B.cold = E.temp <= 14; B.sun = 0; B.pant = E.temp >= 34 || E.temp >= 31 && E.sunUp > 0.45 && b.act !== 'shade';
            B.fid = b.fidK * (1 + 0.06 * ((b.nGrp || 1) - 1));   // bầy đông bỏ chạy sớm hơn
            B.play = b.act === 'forage' || b.act === 'perch' || b.act === 'mown' ? b.play0 : 0;
            if (B.st === 'fly' || B.st === 'shuffle' || B.st === 'sally') return;
            if (!E.awake) { if (b.act !== 'roost') goRoost(b); else if (B.st === 'perch' && B.at && B.at.kind === 'roost') B.st = 'sleep'; return; }
            if (b.act === 'roost') { if (E.h >= 5.75 + 0.06 * (1 - me.bold)) wake(b); return; }   // sáng: con bạo dạn dậy trước (con nhút nhát muộn tới ~3,6 phút)
            if ((b.chkT = (b.chkT ?? rnd() * 0.2) - dt) <= 0) {   // mối nguy (5 lần/s)
              b.chkT = 0.2; const p = b.root.position; let src = null, kind = 'ground';
              if (E.drone && near2(E.drone, p) < 9 && !(b.act === 'wary' && b.wary.kind === 'air')) { src = E.drone; kind = 'air'; }
              else if (E.trim && near2(E.trim, p) < 7 && b.act !== 'wary') { src = E.trim; kind = 'noise'; }
              else if (E.van && (B.at && B.at.van || vanDist(p.x, p.z) < 2.5) && b.act !== 'wary') { src = caravanObj.position; kind = 'noise'; }
              else if (B.st === 'perch' && b.act !== 'roost') {   // đậu thấp: người / chó đi sát thì bay (đậu cao > 1,6 m thì chịu gần hơn)
                const dy = p.y - cowY(p.x, p.z), k = B.fid * (dy > 1.6 ? 0.55 : 1);
                if (E.eng && near2(E.eng, p) < (SPA.engV > 0.3 ? 1.6 : 0.8) * k) src = E.eng;
                else if (!dogRain.st && dy < 1.2 && near2(dogObj.position, p) < (SPA.dogV > 1.5 ? 2.6 : 1.6) * k) src = dogObj.position;
              }
              if (src) { flee(b, src, kind); return; }
              if (E.rac && b.act !== 'mob' && near2(E.rac, p) < 14) {   // gấu mèo trong 14 m: đã trốn lên cao thì kêu báo động tại chỗ, chưa thì bay tới chỗ cao cách 3–7 m
                if (b.act !== 'wary') { mob(b); return; }
                if (B.st === 'perch' && b.me.bold >= 0.3 && b.wary.at() === E.rac) { b.act = 'mob'; b.wary = null; }
              }
            }
            switch (b.act) {
              case 'wary': { B.alert = 1.8; const s = b.wary.at(); B.gaze = s && near2(s, b.root.position) < 16 ? s : null;
                if (B.st === 'perch' && b.wary.until == null) b.wary.until = G.t + b.wary.dur;
                if (B.st === 'perch' && G.t > b.wary.until) { if (safe(b)) { b.wary = null; B.alert = b.alert0; nextAct(b); } else b.wary.until = G.t + 3 + rnd() * 4; }
                break; }
              case 'mob': B.alert = 2; B.gaze = E.rac; B.flick = Math.min(B.flick, 0.8); if (B.st === 'perch') songTick(b, dt, 0.4, 1.4, 0.35, 0.9);   // "chét chét" báo động
                if (!E.rac || near2(E.rac, b.root.position) > 16) { B.alert = b.alert0; nextAct(b); } else if (near2(E.rac, b.root.position) < 2.5 && b.root.position.y - E.rac.y < 2) flee(b, E.rac, 'ground', true);
                break;
              case 'sing': if (B.st === 'perch') songTick(b, dt, 2.5, 6, 1.2, 3); break;
              case 'chorus': case 'dawn': if (B.st === 'perch') songTick(b, dt, 0.5, 2.4, 0.7, 2.2); if (b.act === 'dawn' && G.t > b.dawnGo && B.st === 'perch') { b.act = null; nextAct(b); } break;
              case 'sun': B.sun = Math.min(1, B.k / 2.5); B.yaw = E.sunYaw; if (!E.sunUp || E.sunUp < 0.05) B.T = Math.min(B.T, B.k + 2); break;
              case 'crumbs': B.gaze = E.eng && Math.sin(G.t * 0.8 + b.i * 2.1) > 0.35 ? E.engHead : null; if (!E.eat && G.t - G.eatT > 180) B.T = Math.min(B.T, B.k + 3); break;
              case 'preen': if (B.st === 'perch' && B.preen <= 0 && rnd() < dt * 0.4) B.preen = 1.6 + rnd() * 1.5; break;
            }
          }
          function onLand(b) {
            const B = b.state, w = B.at;
            if (w.dust) {   // TẮM BỤI: hố đang có con thấp bậc hơn thì đuổi nó ra (chúi đầu doạ), con trên bậc thì mình ra thành luống chờ
              const occ = birds.find(o => o !== b && o.bowl === w.bowl && o.state.bath > 0);
              if (occ && rankOf(occ) >= rankOf(b)) { b.bowl = -1; b.act = 'perch'; const r = freeGen(b, SITE.rim); if (r) b.hopTo({ ...r, T: 5 + rnd() * 6 }, 0.4); return; }
              if (occ) { occ.state.bath = 0; occ.bowl = -1; occ.act = 'perch'; B.thr = 0.5; const r = freeGen(occ, SITE.rim); if (r) occ.hopTo({ ...r, T: 6 + rnd() * 8 }, 0.4); }
              B.hold = true; B.bath = 7 + rnd() * 10; B.bathK = 'dust'; B.T = B.bath + 2.5 + rnd() * 2;
            }
          }
          // ---- VE VÃN TẬP THỂ ----
          function display(dt) {
            const E = G.wx, D = G.disp;
            if (!D) {
              if ((G.dispT -= dt) > 0) return;
              G.dispT = 20 + rnd() * 20;   // chưa đủ điều kiện: thử lại sau 20–40 s
              if (!E.breed || !E.awake || E.h < 6.4 || E.h >= 18 || E.h > 11.5 && E.h < 15) return;
              const fs = birds.filter(o => o.me.sex === 'f' && ['forage', 'mown', 'crumbs'].includes(o.act) && o.state.st === 'forage' && !o.state.bath), f = fs[(rnd() * fs.length) | 0]; if (!f) return;
              const ms = birds.filter(o => o.me.sex === 'm' && ['forage', 'perch', 'sing', 'preen', 'mown', 'crumbs'].includes(o.act) && o.state.st !== 'fly' && near2(o.root.position, f.root.position) < 15 && (o.me.bib >= 0.9 || rnd() < 0.65));
              if (!ms.length) return;
              G.dispT = 300 + rnd() * 420;   // 5–12 phút / lần
              G.disp = { f, ms, t: 0, T: 8 + rnd() * 8, lunge: 1.5 }; f.act = 'courted'; f.state.hold = true; f.state.T = 1e9;
              ms.forEach((o, k) => { o.act = 'display'; o.dA = k / ms.length * TAU + rnd(); o.hopT = 0.8; const fp = f.root.position, r = 0.22 + 0.08 * rnd();
                o.flyTo({ ...gSite(fp.x + Math.sin(o.dA) * r, fp.z + Math.cos(o.dA) * r), T: 1e9 }); });
              return;
            }
            const f = D.f, fp = f.root.position, live = D.ms.filter(o => o.act === 'display');
            D.age = (D.age || 0) + dt; if (live.some(o => o.state.st === 'forage')) D.t += dt;   // chỉ tính lúc đã có chim trống múa dưới đất
            if (D.t > D.T || D.age > D.T + 20 || f.act !== 'courted' || !live.length) {   // chim mái bay đi, các chim trống bay theo (lệch 0,2–0,7 s)
              G.disp = null; for (const o of live) { o.state.disp = 0; o.state.hold = false; }
              if (f.act === 'courted') { f.state.hold = false; doAct(f, 'perch'); const to = f.state.st === 'fly' ? f.state.to.p : null;
                for (const o of live) { o.act = 'perch'; if (to) o.go2 = { k: 0.2 + rnd() * 0.5, p: to }; else nextAct(o); } }
              else for (const o of live) nextAct(o);
              return;
            }
            // chim mái: nhìn con gần nhất, thỉnh thoảng chúi đầu mổ đuổi (nhảy tới 7 cm), con bị mổ nhảy lùi
            const nm = live.reduce((a, o) => near2(o.root.position, fp) < near2(a.root.position, fp) ? o : a, live[0]), FB = f.state;
            FB.gaze = nm.state.st === 'fly' ? null : nm.root.position;
            if ((D.lunge -= dt) <= 0 && !FB.hop && f.state.st === 'forage' && nm.state.st === 'forage' && near2(nm.root.position, fp) < 0.6) { D.lunge = 1.5 + rnd() * 1.5; FB.thr = 0.45; const a = Math.atan2(nm.root.position.x - fp.x, nm.root.position.z - fp.z), q = fp.clone().add(_v.set(Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.07)); q.y = cowY(q.x, q.z);   // chỉ mổ con đã đứng sát
              FB.yaw = a; FB.hop = { a: fp.clone(), b: q, k: 0, n: 1 }; const np = nm.root.position, b2 = np.clone().add(_v.set(Math.sin(a), 0, Math.cos(a)).multiplyScalar(0.1)); b2.y = cowY(b2.x, b2.z); if (envFree(b2.x, b2.z) && !nm.state.hop) nm.state.hop = { a: np.clone(), b: b2, k: 0.02, n: 1 }; }
            // chim trống: xù ngực, xệ cánh run, vểnh xoè đuôi, nhảy vòng quanh mái, kêu liên hồi
            for (const o of live) {
              const B = o.state; if (B.st !== 'forage') continue;
              B.hold = true; B.disp = 1; B.yaw = Math.atan2(fp.x - o.root.position.x, fp.z - o.root.position.z); songTick(o, dt, 0.2, 0.6, 2, 4);
              if ((o.hopT -= dt) <= 0 && !B.hop) { o.hopT = 0.6 + rnd() * 0.7; o.dA += (rnd() < 0.5 ? -1 : 1) * (0.4 + rnd() * 0.5); const r = 0.2 + rnd() * 0.1, q = new THREE.Vector3(fp.x + Math.sin(o.dA) * r, 0, fp.z + Math.cos(o.dA) * r); q.y = cowY(q.x, q.z);
                if (envFree(q.x, q.z)) B.hop = { a: o.root.position.clone(), b: q, k: 0, n: 1 }; }
            }
          }
          function spacing() {   // ĐỨNG SÁT QUÁ (< 14 cm) lúc kiếm ăn: con thấp bậc nhảy né, con trên chúi đầu há mỏ doạ
            const g = birds.filter(o => o.state.st === 'forage' && !o.state.hop && !o.state.bath && !o.state.hold);
            for (let i = 0; i < g.length; i++) for (let j = i + 1; j < g.length; j++) {
              const a = g[i], c = g[j]; if (near2(a.root.position, c.root.position) > 0.14) continue;
              const [hi, lo] = rankOf(a) >= rankOf(c) ? [a, c] : [c, a], p = lo.root.position, ang = Math.atan2(p.x - hi.root.position.x, p.z - hi.root.position.z);
              hi.state.thr = 0.4; hi.state.yaw = ang;
              const q = p.clone().add(_v.set(Math.sin(ang), 0, Math.cos(ang)).multiplyScalar(0.16)); q.y = cowY(q.x, q.z);
              if (envFree(q.x, q.z)) { lo.state.yaw = ang; lo.state.hop = { a: p.clone(), b: q, k: 0, n: 1 }; lo.state.nPeck = 0; }
            }
          }
          // ---- bụi tắm: 10 cụm nâu xám bay lên, phồng to, nhạt dần ----
          const dustTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'), gr = x.createRadialGradient(16, 16, 0, 16, 16, 16);
            gr.addColorStop(0, 'rgba(255,255,255,0.85)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = gr; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); })();
          const dust = Array.from({ length: 10 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex, color: 0xa89274, transparent: true, opacity: 0, depthWrite: false }));
            s.visible = false; s.name = 'Bụi chim sẻ tắm'; s.userData = { life: 0, v: new THREE.Vector3() }; scene.add(s); return s; });
          let dustI = 0;
          const puff = p => { const s = dust[dustI]; dustI = (dustI + 1) % dust.length; s.position.set(p.x + (rnd() - 0.5) * 0.12, p.y + 0.03, p.z + (rnd() - 0.5) * 0.12);
            s.userData.life = 0.9; s.userData.v.set((rnd() - 0.5) * 0.25, 0.12 + rnd() * 0.12, (rnd() - 0.5) * 0.25); s.visible = true; };
          const dustTick = dt => { for (const s of dust) { if (!s.visible) continue; const U = s.userData; if ((U.life -= dt) <= 0) { s.visible = false; continue; }
            const k = 1 - U.life / 0.9; s.position.addScaledVector(U.v, dt); s.scale.setScalar(0.05 + 0.16 * k); s.material.opacity = 0.5 * (1 - k) * Math.min(1, k * 8); } };
          // ---- 6 con ----
          const BR = { tick: (b, dt) => think(b, dt), landed: b => onLand(b), next: (b, scared) => scared ? flee(b, sparrowFlush.from, 'ground') : nextAct(b) };
          const birds = SPARROW_CAST.map((me, i) => {
            const b = makeSparrow(BR, me.sex === 'm' ? 0.93 : 0.88, { sex: me.sex, bib: me.bib || 0 });
            Object.assign(b, { me, i, act: null, bowl: -1, cd: {}, fidK: 1.45 - 0.9 * me.bold, wary: null, go: null, songGap: rnd() * 4, ph: rnd(),
              alert0: 1 + (me.like === 'watch' ? 0.6 : 0) + 0.4 * (1 - me.bold), play0: me.like === 'explore' ? 2.2 : 0.4 + me.bold });   // con cảnh giác liếc dày · con gan đuổi bướm nhiều
            b.state.alert = b.alert0; return b;
          });
          function place() {   // mở trang: ngày thì nửa bầy đang kiếm ăn, nửa đang đậu; đêm / mưa thì đã ngủ trong cây
            env();
            for (const b of birds) {
              if (!G.wx.awake) { const L = sites().roost.inner, q = L[b.i % L.length]; b.land({ p: q.p.clone(), yaw: q.yaw, kind: 'roost', sleep: true }); b.act = 'roost'; continue; }
              const w = (b.i % 2 ? treeSpot(b, 'outer') : groundSpot(b, 'forage')) || groundSpot(b, 'forage') || treeSpot(b, 'inner');
              if (w) { w.T = 4 + rnd() * 20; b.land(w); b.act = w.kind === 'ground' ? 'forage' : 'perch'; }
            }
          }
          return {
            birds, dbg: { G, doAct, flee, nextAct },   // dbg: đo kiểm (ép việc / mối nguy từ console)
            hear(p) { for (const b of birds) if (b.go == null && b.state.st === 'forage' && near2(b.root.position, p) < 6) { b.go = 0.1 + 0.3 * rnd(); b.goSrc = p.clone(); b.goKind = 'ground'; } },   // đàn khác báo động
            update(dt, t) {
              G.t = t; if (!G.init) { G.init = true; place(); }
              if ((G.envT -= dt) <= 0) { G.envT = 0.2; env(); }
              const E = G.wx;
              if (E.bolt) { E.bolt = false; for (const b of birds) if (b.act === 'roost') b.startle(); else if (b.go == null && b.act !== 'wary') { b.go = rnd() * 0.25; b.goSrc = null; b.goKind = 'storm'; } }   // sét: giật mình, lủi vào tán
              for (const b of birds) {
                if (b.go != null && (b.go -= dt) <= 0) { b.go = null; flee(b, b.goSrc, b.goKind, true); }
                if (b.go2 && (b.go2.k -= dt) <= 0) { const w = nearPerch(b, b.go2.p); b.go2 = null; if (w) b.flyTo({ ...w, T: 4 + rnd() * 5 }); else nextAct(b); }   // bay theo chim mái
                b.update(dt, t);
                if (b.state.bath > 0 && b.state.bathK === 'dust' && (b.puffT = (b.puffT || 0) - dt) <= 0) { b.puffT = 0.1 + rnd() * 0.12; puff(b.root.position); }
              }
              dustTick(dt);
              if ((G.grpT -= dt) <= 0) { G.grpT = 0.5; spacing(); }
              display(dt);
            }
          };
        })();
