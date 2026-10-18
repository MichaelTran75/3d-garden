        // ---- hiệu ứng: tia nước vòi sen + hơi nước làm mờ kính · nốt nhạc bay từ laptop · Zzz ngủ trưa · gói khoai tây chiên · màn hình trình phát nhạc ----
        const showerFx = (() => {
          const N = 96, pos = new Float32Array(N * 6), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xd4ecff, transparent: true, opacity: 0.8, depthWrite: false }));
          lines.frustumCulled = false; lines.visible = false; lines.name = 'Tia nước vòi sen'; scene.add(lines);
          const sh = VBATH.showerHead, head = vanPt(sh[0], sh[1] - 0.04, sh[2]), dir = vanPt(sh[0], sh[1] - 0.9, sh[2] + 0.435).sub(vanPt(sh[0], sh[1], sh[2])).normalize();
          const side = new THREE.Vector3(Math.cos(VYAW), 0, -Math.sin(VYAW)), up2 = new THREE.Vector3().crossVectors(dir, side).normalize();
          const D = Array.from({ length: N }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), live: false })), floorY = VAN_FLOOR - 0.02;
          const sc = document.createElement('canvas'); sc.width = sc.height = 64; const sx = sc.getContext('2d'), gr = sx.createRadialGradient(32, 32, 2, 32, 32, 31);
          gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
          const steamTex = new THREE.CanvasTexture(sc);
          const puffs = Array.from({ length: 7 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; s.name = 'Hơi nước phòng tắm'; scene.add(s); return { s, t: i * 0.85, x: 0, z: 0 }; });
          const doorOp = VBATH.doorMat.opacity, wallOp = VBATH.wallMat.opacity;
          let live = 0, idle = false;
          const fx = { on: false, steam: 0, update(dt) {
            if (!fx.on && !live && !fx.steam) { if (!idle) { idle = true; lines.visible = false; for (const p of puffs) p.s.visible = false; } return; }   // tắt nước, hết hơi: không tính gì
            idle = false;
            const h = Math.min(dt, 0.05);
            const st0 = fx.steam; fx.steam = Math.max(0, Math.min(1, fx.steam + (fx.on ? h / 40 : -h / 70)));
            if (fx.steam !== st0) { VBATH.doorMat.opacity = doorOp + 0.3 * fx.steam; VBATH.wallMat.opacity = wallOp + 0.2 * fx.steam; }   // kính và vách mờ hơi nước
            let any = false;
            for (let i = 0; i < N; i++) {
              const d = D[i];
              if (!d.live) {
                if (!fx.on || Math.random() > 0.3) { pos.fill(0, i * 6, i * 6 + 6); continue; }
                d.live = true; d.p.copy(head).addScaledVector(side, (Math.random() - 0.5) * 0.1).addScaledVector(up2, (Math.random() - 0.5) * 0.1);
                d.v.copy(dir).multiplyScalar(1.5 + Math.random() * 0.5).addScaledVector(side, (Math.random() - 0.5) * 0.4).addScaledVector(up2, (Math.random() - 0.5) * 0.4);
              }
              d.v.y -= 9.8 * h; d.p.addScaledVector(d.v, h);
              if (d.p.y < floorY) { d.live = false; pos.fill(0, i * 6, i * 6 + 6); continue; }
              any = true; pos[i * 6] = d.p.x; pos[i * 6 + 1] = d.p.y; pos[i * 6 + 2] = d.p.z;
              pos[i * 6 + 3] = d.p.x - d.v.x * 0.04; pos[i * 6 + 4] = d.p.y - d.v.y * 0.04; pos[i * 6 + 5] = d.p.z - d.v.z * 0.04;   // vệt nước ngắn theo hướng rơi
            }
            live = any ? 1 : 0; lines.visible = any; if (any) geo.attributes.position.needsUpdate = true;
            for (const p of puffs) {   // đám hơi nước: sinh sát sàn buồng WC, bốc lên trần, nở ra rồi tan
              p.t += h; if (p.t > 6) { p.t -= 6; p.x = 3.08 + Math.random() * 0.75; p.z = -1.35 + Math.random() * 0.8; }
              const k = p.t / 6; p.s.visible = fx.steam > 0.02 && p.x > 0;
              if (!p.s.visible) continue;
              const w = vanPt(p.x, TR.yIn + 0.55 + k * 1.45, p.z); p.s.position.copy(w); p.s.scale.setScalar(0.35 + k * 0.7); p.s.material.opacity = 0.28 * Math.sin(Math.PI * k) * fx.steam;
            }
          } };
          return fx;
        })();
        const musicFx = (() => {   // nốt nhạc (vẽ bằng nét, không phụ thuộc font) bay lên từ laptop, đung đưa, xuyên qua mái xe bay lên trời rồi mờ dần
          const cols = ['#ffd34a', '#7fd1ff', '#ff8fb1', '#a6f08c'];
          const texs = [0, 1, 2, 3].map(i => {
            const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
            const draw = () => {
              x.beginPath();
              if (i % 2 === 0) {   // ♪ nốt móc đơn
                x.ellipse(22, 46, 11, 8, -0.45, 0, Math.PI * 2); x.moveTo(31, 44); x.lineTo(31, 10); x.quadraticCurveTo(36, 22, 48, 26); x.quadraticCurveTo(40, 18, 33, 14);
              } else {             // ♫ hai nốt nối gạch
                x.ellipse(16, 48, 9, 7, -0.45, 0, Math.PI * 2); x.moveTo(23, 47); x.lineTo(23, 16);
                x.moveTo(50, 42); x.ellipse(43, 43, 9, 7, -0.45, 0, Math.PI * 2); x.moveTo(50, 41); x.lineTo(50, 10);
              }
            };
            x.lineCap = 'round'; x.lineJoin = 'round';
            x.strokeStyle = 'rgba(20,28,36,0.7)'; x.lineWidth = 9; draw(); x.stroke(); if (i % 2) { x.beginPath(); x.moveTo(23, 16); x.lineTo(50, 10); x.lineWidth = 14; x.stroke(); }
            x.strokeStyle = x.fillStyle = cols[i]; x.lineWidth = 4; draw(); x.stroke(); x.fill();
            if (i % 2) { x.beginPath(); x.moveTo(23, 16); x.lineTo(50, 10); x.lineWidth = 8; x.stroke(); }
            const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace; return tx;
          });
          const pool = Array.from({ length: 14 }, (_, i) => {
            const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: texs[i % 4], transparent: true, opacity: 0, depthWrite: false })); m.visible = false; m.name = 'Nốt nhạc từ laptop'; scene.add(m);
            return { m, t: 0, life: 3, o: new THREE.Vector3(), ph: 0, dx: 0, dz: 0 };
          });
          let acc = 0, idx = 0; const src = new THREE.Vector3();
          return { update(dt, t, on) {
            if (on && studyLaptop.group) {
              acc += dt;
              if (acc > 0.5) {
                acc = 0; const n = pool[idx++ % pool.length]; studyLaptop.group.getWorldPosition(src);
                n.o.set(src.x + (Math.random() - 0.5) * 0.12, src.y + 0.2, src.z + (Math.random() - 0.5) * 0.12); n.t = 0; n.life = 4 + Math.random() * 1.5;
                n.ph = Math.random() * 6.28; n.dx = (Math.random() - 0.5) * 0.6; n.dz = (Math.random() - 0.5) * 0.6; n.m.visible = true;
              }
            }
            for (const n of pool) {
              if (!n.m.visible) continue;
              n.t += dt; const k = n.t / n.life; if (k >= 1) { n.m.visible = false; continue; }
              n.m.position.set(n.o.x + Math.sin(n.t * 2.4 + n.ph) * 0.1 + n.dx * k, n.o.y + k * 3.2, n.o.z + n.dz * k);
              n.m.material.opacity = Math.min(1, n.t * 3) * (1 - k * k); n.m.material.rotation = Math.sin(n.t * 3 + n.ph) * 0.35; n.m.scale.setScalar(0.16 + 0.16 * Math.sin(Math.PI * Math.min(1, k * 1.4)));
            }
          } };
        })();
        const napFx = (() => {   // 3 chữ z nhỏ bay trên đầu khi ngủ trưa trên ghế
          const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
          x.font = 'bold 46px Outfit, sans-serif'; x.fillStyle = '#E2D6C0'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.shadowColor = '#243240'; x.shadowBlur = 6; x.fillText('z', 32, 34);
          const tex = new THREE.CanvasTexture(c), grp = new THREE.Group(); grp.name = 'Zzz ngủ trưa'; grp.visible = false; scene.add(grp);
          const zs = [0, 1, 2].map(n => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false })); grp.add(s); return { s, ph: n / 3 }; });
          const hp = new THREE.Vector3();
          return { update(dt, t, e) {
            grp.visible = !!e; if (!e) return;
            e.head.getWorldPosition(hp);
            for (const z of zs) {
              const k = (t * 0.3 + z.ph) % 1;
              z.s.position.set(hp.x + Math.sin(t * 1.6 + z.ph * 6) * 0.08, hp.y + 0.28 + k * 1.1, hp.z);
              z.s.material.opacity = 0.9 * Math.min(1, (1 - k) * 2.5); z.s.scale.setScalar(0.16 + k * 0.3);
            }
          } };
        })();
        const chipsBag = (() => {   // gói khoai tây chiên mở miệng trên bàn trà, góc gần ghế cắm trại (chỉ hiện lúc đọc sách)
          const g = new THREE.Group(); g.name = 'Gói khoai tây chiên'; g.visible = false;
          const table = scene.getObjectByName('Bàn trà (Camp Table)'); if (!table) return g;
          const c = document.createElement('canvas'); c.width = 128; c.height = 160; const x = c.getContext('2d');
          x.fillStyle = '#d6332a'; x.fillRect(0, 0, 128, 160);
          x.fillStyle = '#f7c948'; x.beginPath(); x.ellipse(64, 100, 42, 30, -0.3, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#e3a334'; for (let k = 0; k < 5; k++) { x.beginPath(); x.ellipse(38 + k * 13, 96 + (k % 2) * 10, 12, 8, k, 0, Math.PI * 2); x.fill(); }
          x.fillStyle = '#fff'; x.textAlign = 'center'; x.font = 'bold 21px Arial, sans-serif'; x.fillText('KHOAI TÂY', 64, 36); x.font = 'bold 15px Arial, sans-serif'; x.fillText('chiên giòn', 64, 56);
          x.fillStyle = '#9e1f19'; x.fillRect(0, 0, 128, 7); x.fillRect(0, 153, 128, 7);
          const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
          const geo = new THREE.BoxGeometry(0.12, 0.16, 0.05, 4, 6, 1), p = geo.attributes.position;
          for (let i = 0; i < p.count; i++) {   // đáy gấp dẹt, thân phồng, miệng mở loe
            const y = p.getY(i), u = y / 0.08; let z = p.getZ(i), xx = p.getX(i);
            if (u < -0.8) z *= 0.35; else if (u > 0.6) { z *= 1.3; xx *= 1.04; } else z *= 0.85 + 0.15 * Math.cos(u * 1.6);
            p.setXYZ(i, xx, y + 0.08, z);
          }
          geo.computeVertexNormals();
          const red = new THREE.MeshLambertMaterial({ color: 0xd6332a }), label = new THREE.MeshLambertMaterial({ map: tex }), inside = new THREE.MeshLambertMaterial({ color: 0x5a1712 });
          const bag = new THREE.Mesh(geo, [red, red, inside, red, label, label]); bag.castShadow = true; g.add(bag);
          const chipM = new THREE.MeshLambertMaterial({ color: 0xe8c25a });
          for (let k = 0; k < 4; k++) { const ch = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.004, 9), chipM); ch.scale.z = 0.75; ch.position.set(-0.03 + k * 0.02, 0.163 + (k % 2) * 0.006, (k - 1.5) * 0.008); ch.rotation.set(0.9 + k * 0.3, k, 0.4 * (k - 1.5)); g.add(ch); }
          table.add(g); table.updateMatrixWorld(true);
          const chair = table.worldToLocal(campChairPos.clone()), best = [chair.x > 0 ? 0.25 : -0.25, 0.2];   // góc gần ghế (17/10: nửa xa ghế là chỗ drone DJI — drone.js tableLay lật theo cùng phía)
          g.position.set(best[0], table.userData.top ?? 0.45, best[1]); g.rotation.y = Math.atan2(chair.x - best[0], chair.z - best[1]);   // mặt nhãn quay về phía ghế
          return g;
        })();
        // ---- MÀN HÌNH MacBook (G 15/10 "add animation vào laptop screen" · G 17/10 "keep and improve the screen animation"): màn 3456×2234 ⇒ canvas 512×331,
        //      vẽ 8 hình/giây khi nắp mở. Kiểu macOS: hình nền sóng tím–xanh (vẽ sẵn 1 lần) · thanh menu mờ, TAI THỎ camera giữa mép trên, giờ thật, Wi-Fi, pin ·
        //      Dock (ứng dụng đang mở có chấm) · cửa sổ "GHC · Vận hành": 3 biểu đồ công suất cuộn theo số liệu cảnh thật (thủy điện ~28,2 · mặt trời 51,58 MWp ×
        //      độ cao nắng × mây/mưa · gió 80 MW theo đường cong công suất: cắt vào 3 m/s, định mức 12 m/s, gió thật Pleiku), vùng tô dưới đường, tổng MW + %
        //      công suất, la bàn hướng gió thật · cửa sổ Ghi chú đang gõ + con trỏ · CON TRỎ CHUỘT lượn qua biểu đồ hiện nhãn giá trị · THÔNG BÁO trượt vào góc
        //      phải 45 s/lần · mở nắp: MÀN KHOÁ (giờ to, Touch ID) 1,8 s rồi mở khoá · buổi tối: cửa sổ Nhạc (đĩa quay, phổ nhạc, tiến độ) ----
        const LAP_NOTE = ['Đối chiếu sản lượng thủy điện với mực hồ…', 'Tấm pin: −0,4%/°C khi nóng; kiểm nhiệt độ tấm', 'Tuabin: cắt vào 3 m/s, định mức 12 m/s', 'Pin lưu trữ san tải giờ cao điểm 17–20 h', 'Mai kiểm tra cánh tuabin #2'];
        const lapHist = [[], [], []], LW = MBP.CW, LH = MBP.CH, LAP_CH = [['#5ec27a', 'Thủy điện', 30], ['#f0a040', 'Mặt trời', 55], ['#65b3ff', 'Gió', 80]];
        let lapWall = null;
        const lapRR = (x, X, Y, w, h, r, fill) => { x.fillStyle = fill; x.beginPath(); x.roundRect(X, Y, w, h, r); x.fill(); };
        const lapClock = (hh, sec) => String(Math.floor(hh)).padStart(2, '0') + ':' + String(Math.floor(hh * 60 % 60)).padStart(2, '0') + (sec ? ':' + String(Math.floor(hh * 3600 % 60)).padStart(2, '0') : '');
        function lapWallpaper() {   // hình nền: gradient + 3 dải sóng (vẽ 1 lần)
          const c = document.createElement('canvas'); c.width = LW; c.height = LH; const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, LW, LH);
          g.addColorStop(0, '#1d2a6e'); g.addColorStop(0.55, '#5b3c9c'); g.addColorStop(1, '#d4627c'); x.fillStyle = g; x.fillRect(0, 0, LW, LH);
          [['#3b52c8', 0.5, 110], ['#9152cc', 0.66, 80], ['#ff8f7c', 0.82, 55]].forEach(([col, yk, A]) => { x.globalAlpha = 0.5; x.fillStyle = col; x.beginPath(); x.moveTo(0, LH * yk); x.bezierCurveTo(LW * 0.3, LH * yk - A, LW * 0.62, LH * yk + A * 0.6, LW, LH * yk - A * 0.4); x.lineTo(LW, LH); x.lineTo(0, LH); x.fill(); });
          x.globalAlpha = 1; return c;
        }
        function lapChrome(x, app, dock) {   // thanh menu (logo táo nhỏ, tên app, menu, Wi-Fi, pin, giờ) + tai thỏ + Dock
          x.fillStyle = 'rgba(16,16,22,0.5)'; x.fillRect(0, 0, LW, 14);
          x.fillStyle = '#fff'; x.beginPath(); x.arc(10.5, 7.6, 3.4, 0, TAU); x.fill(); x.fillRect(10.2, 2, 1.6, 2.4);
          x.textAlign = 'left'; x.font = 'bold 8px Arial, sans-serif'; x.fillText(app, 20, 10); let mx = 26 + x.measureText(app).width; x.font = '8px Arial, sans-serif';
          for (const m of ['Tệp', 'Sửa', 'Xem', 'Cửa sổ', 'Trợ giúp']) { x.fillText(m, mx, 10); mx += x.measureText(m).width + 9; }
          x.textAlign = 'right'; x.fillText(['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][new Date().getDay()] + ' ' + lapClock(liveWeather.localHour), LW - 8, 10);
          x.strokeStyle = '#fff'; x.lineWidth = 1; x.strokeRect(LW - 72, 4, 14, 6.5); x.fillRect(LW - 57.5, 5.8, 1.4, 3); x.fillRect(LW - 71, 5, 9, 4.5);   // pin
          for (const r of [2, 4.5, 7]) { x.beginPath(); x.arc(LW - 87, 11, r, -2.4, -0.74); x.stroke(); }   // Wi-Fi
          lapRR(x, LW / 2 - 23, -5, 46, 16, 5, '#000');   // tai thỏ (camera 1080p)
          const icons = ['#3d8bfd', '#5ac8fa', '#34c759', '#ffcc00', '#ff375f', '#8e8e93', '#ff9f0a'], n = icons.length, DW = n * 26 + 10, D0 = (LW - DW) / 2;
          lapRR(x, D0, LH - 31, DW, 28, 8, 'rgba(255,255,255,0.22)');
          icons.forEach((c, i) => { const ix = D0 + 6 + i * 26; lapRR(x, ix, LH - 28, 22, 22, 6, c); x.fillStyle = 'rgba(255,255,255,0.85)'; x.fillRect(ix + 6, LH - 22, 10, 10); if (dock.includes(i)) { x.beginPath(); x.arc(ix + 11, LH - 4.5, 1.3, 0, TAU); x.fill(); } });
        }
        function lapWin(x, X, Y, w, h, title, focus) {   // cửa sổ: bóng, nền tối, thanh tiêu đề + 3 nút đèn giao thông
          x.save(); x.shadowColor = 'rgba(0,0,0,0.45)'; x.shadowBlur = 12; x.shadowOffsetY = 4; lapRR(x, X, Y, w, h, 7, '#1d2129'); x.restore();
          lapRR(x, X, Y, w, 16, 7, '#2b303b'); x.fillStyle = '#2b303b'; x.fillRect(X, Y + 9, w, 7);
          ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => { x.fillStyle = focus ? c : '#555a63'; x.beginPath(); x.arc(X + 9 + i * 10, Y + 8, 3, 0, TAU); x.fill(); });
          x.fillStyle = '#d6dbe3'; x.font = 'bold 8px Arial, sans-serif'; x.textAlign = 'center'; x.fillText(title, X + w / 2, Y + 11); x.textAlign = 'left';
        }
        function laptopDash(t, x, L) {
          const w = liveWeather.state, v = (w.windSpeed || 0) / 3.6, cl = w.data?.current?.cloud_cover ?? 30;
          const P = [28.2 + 0.25 * Math.sin(t / 7) + 0.08 * Math.sin(t * 1.7), 51.58 * Math.min(1, Math.max(0, sunElevSin) * 1.25) * (1 - 0.006 * cl) * (w.raining ? 0.3 : 1), 80 * Math.max(0, Math.min(1, (v ** 3 - 27) / 1701))];
          if (!lapHist[0].length) P.forEach((p, i) => { for (let k = 0; k < 61; k++) lapHist[i].push(p * (1 + 0.04 * Math.sin(k * 0.37 + i) + (Math.random() - 0.5) * 0.03)); });   // mở máy: 30 s gần nhất đã có sẵn
          if (!L.histAt || t - L.histAt > 0.5) { L.histAt = t; P.forEach((p, i) => { const h = lapHist[i]; h.push(p * (1 + (Math.random() - 0.5) * 0.03)); if (h.length > 61) h.shift(); }); }
          // cửa sổ vận hành
          const X = 16, Y = 22, WW = 318, WH = 248; lapWin(x, X, Y, WW, WH, 'GHC · Vận hành', true);
          if (t % 1.2 < 0.7) { x.fillStyle = '#ff5a5a'; x.beginPath(); x.arc(X + WW - 70, Y + 8, 2.6, 0, TAU); x.fill(); x.fillStyle = '#ffb0b0'; x.font = '7px Arial, sans-serif'; x.fillText('TRỰC TIẾP', X + WW - 64, Y + 10.5); }
          x.fillStyle = '#c7d3df'; x.font = '7px Arial, sans-serif'; x.textAlign = 'right'; x.fillText(lapClock(liveWeather.localHour, true), X + WW - 8, Y + 10.5); x.textAlign = 'left';
          const cx0 = X + 74, cw = WW - 86, rows = [];
          LAP_CH.forEach(([col, name, max], i) => {
            const y0 = Y + 24 + i * 58, h = lapHist[i], st = cw / 60; rows.push([cx0, y0, cw, 44, i]);
            x.fillStyle = '#9aa7b6'; x.font = '8px Arial, sans-serif'; x.fillText(name, X + 8, y0 + 12);
            x.fillStyle = col; x.font = 'bold 13px Arial, sans-serif'; x.fillText(P[i].toFixed(1).replace('.', ','), X + 8, y0 + 30); x.font = '7px Arial, sans-serif'; x.fillText('MW', X + 8, y0 + 40);
            lapRR(x, cx0, y0, cw, 44, 4, 'rgba(255,255,255,0.04)');
            x.strokeStyle = 'rgba(199,211,223,0.08)'; x.lineWidth = 1; for (let q = 1; q < 4; q++) { x.beginPath(); x.moveTo(cx0, y0 + q * 11); x.lineTo(cx0 + cw, y0 + q * 11); x.stroke(); }
            if (h.length > 1) {
              const px = k => cx0 + (k + 61 - h.length) * st, py = p => y0 + 43 - Math.min(1, p / max) * 40;
              const gr = x.createLinearGradient(0, y0, 0, y0 + 44); gr.addColorStop(0, col + '66'); gr.addColorStop(1, col + '05');
              x.fillStyle = gr; x.beginPath(); x.moveTo(px(0), y0 + 44); h.forEach((p, k) => x.lineTo(px(k), py(p))); x.lineTo(px(h.length - 1), y0 + 44); x.fill();
              x.strokeStyle = col; x.lineWidth = 1.6; x.beginPath(); h.forEach((p, k) => k ? x.lineTo(px(k), py(p)) : x.moveTo(px(k), py(p))); x.stroke();
              x.fillStyle = col; x.beginPath(); x.arc(px(h.length - 1), py(h[h.length - 1]), 2.4, 0, TAU); x.fill();
            }
          });
          // tổng + la bàn gió
          const tot = P[0] + P[1] + P[2], yS = Y + WH - 28; x.fillStyle = '#e6ecf3'; x.font = 'bold 10px Arial, sans-serif'; x.fillText('Tổng ' + tot.toFixed(1).replace('.', ',') + ' MW', X + 8, yS + 12);
          x.fillStyle = '#9aa7b6'; x.font = '8px Arial, sans-serif'; x.fillText(Math.round(tot / 1.6158) + '% công suất lắp đặt · gió ' + v.toFixed(1).replace('.', ',') + ' m/s', X + 100, yS + 12);
          const ox = X + WW - 22, oy = yS + 8, wd = (w.windDirection ?? 200) * Math.PI / 180;
          x.strokeStyle = '#5d6b7c'; x.lineWidth = 1; x.beginPath(); x.arc(ox, oy, 9, 0, TAU); x.stroke(); x.fillStyle = '#9aa7b6'; x.font = '6px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('B', ox, oy - 10.5); x.textAlign = 'left';
          x.save(); x.translate(ox, oy); x.rotate(wd + Math.PI); x.fillStyle = '#65b3ff'; x.beginPath(); x.moveTo(0, -8); x.lineTo(3, 4); x.lineTo(0, 2); x.lineTo(-3, 4); x.fill(); x.restore();   // mũi tên: hướng gió thổi tới
          // ghi chú đang gõ
          const NX = 344, NY = 40, NW = 152, NH = 138; lapWin(x, NX, NY, NW, NH, 'Ghi chú', false);
          const ni = Math.floor(t / 9) % LAP_NOTE.length, typed = LAP_NOTE[ni].slice(0, Math.floor((t % 9) * 14));
          x.font = '7px Arial, sans-serif'; x.fillStyle = '#7d8896';
          for (let q = 0; q < 3; q++) { const s0 = LAP_NOTE[(ni + LAP_NOTE.length - 3 + q) % LAP_NOTE.length]; x.fillText('• ' + (s0.length > 30 ? s0.slice(0, 29) + '…' : s0), NX + 8, NY + 30 + q * 13); }
          x.fillStyle = '#c9f0d4'; const wrap = typed.length > 30 ? [typed.slice(0, 30), typed.slice(30)] : [typed];
          wrap.forEach((ln, q) => x.fillText((q ? '  ' : '• ') + ln, NX + 8, NY + 76 + q * 12));
          if (t % 0.8 < 0.45) { x.fillRect(NX + 10 + x.measureText((wrap.length > 1 ? '  ' : '• ') + wrap[wrap.length - 1]).width, NY + 69 + (wrap.length - 1) * 12, 1.4, 9); }
          return rows;
        }
        function lapMusic(t, x) {   // cửa sổ Nhạc (buổi tối học bài)
          const X = 92, Y = 54, WW = 328, WH = 196, mm = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0'); lapWin(x, X, Y, WW, WH, 'Nhạc', true);
          const cg = x.createLinearGradient(X + 16, Y + 28, X + 120, Y + 132); cg.addColorStop(0, '#ff9a5a'); cg.addColorStop(1, '#c2457a'); lapRR(x, X + 16, Y + 28, 104, 104, 6, cg);
          x.fillStyle = 'rgba(20,16,30,0.9)'; x.beginPath(); x.arc(X + 68, Y + 80, 36, 0, TAU); x.fill();
          x.strokeStyle = 'rgba(255,255,255,0.3)'; x.lineWidth = 1.5; for (const r of [16, 24, 31]) { const a = t * 3 + r; x.beginPath(); x.arc(X + 68, Y + 80, r, a, a + 1.3); x.stroke(); }   // rãnh đĩa quay
          x.fillStyle = '#ffd34a'; x.beginPath(); x.arc(X + 68, Y + 80, 7, 0, TAU); x.fill();
          x.fillStyle = '#f3eaff'; x.font = 'bold 14px Arial, sans-serif'; x.fillText('Gió cao nguyên', X + 134, Y + 46); x.fillStyle = '#b8a8d8'; x.font = '9px Arial, sans-serif'; x.fillText('lo-fi · nhạc nền học bài', X + 134, Y + 62);
          for (let i = 0; i < 18; i++) { const hgt = 4 + 30 * Math.abs(Math.sin(t * (2.1 + i * 0.37) + i * 1.3)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 1.45 * Math.PI))); x.fillStyle = i % 2 ? '#7fd1ff' : '#ff8fb1'; x.fillRect(X + 134 + i * 10, Y + 112 - hgt, 7, hgt); }
          const dur = 194, at = t % dur, px = X + 16 + (WW - 32) * at / dur;
          lapRR(x, X + 16, Y + 148, WW - 32, 4, 2, '#4a3f66'); lapRR(x, X + 16, Y + 148, px - X - 16, 4, 2, '#ffd34a'); x.beginPath(); x.arc(px, Y + 150, 4, 0, TAU); x.fill();
          x.fillStyle = '#b8a8d8'; x.font = '8px Arial, sans-serif'; x.fillText(mm(at), X + 16, Y + 166); x.textAlign = 'right'; x.fillText(mm(dur), X + WW - 16, Y + 166); x.textAlign = 'left';
          const bx0 = X + WW / 2; x.fillStyle = '#f3eaff'; x.fillRect(bx0 - 6, Y + 172, 4, 14); x.fillRect(bx0 + 2, Y + 172, 4, 14);   // tạm dừng = đang phát
          for (const sg of [-1, 1]) { const q = bx0 + sg * 30; x.fillRect(q + sg * 5, Y + 173, 2, 12); x.beginPath(); x.moveTo(q + sg * 5, Y + 179); x.lineTo(q - sg * 4, Y + 173); x.lineTo(q - sg * 4, Y + 185); x.fill(); }   // bài trước / sau
        }
        function laptopScreenTick(t, music) {   // màn hình laptop: bảng vận hành (nghiên cứu) · Nhạc (buổi tối) · màn khoá khi vừa mở nắp
          const L = studyLaptop; if (!L.ctx) return;
          if (L.open < 0.3) L.awake = false;
          if (L.open < 0.5 || Math.abs(t - L.drawnAt) < 0.125) return;
          if (!L.awake) { L.awake = true; L.wakeAt = t; }
          L.drawnAt = t; L.mode = music ? 'music' : 'dash';
          const x = L.ctx; lapWall = lapWall || lapWallpaper(); x.drawImage(lapWall, 0, 0);
          if (t - L.wakeAt < 1.8) {   // màn khoá: giờ to, ngày, ảnh đại diện, Touch ID
            x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(0, 0, LW, LH); x.textAlign = 'center'; x.fillStyle = '#fff';
            x.font = '10px Arial, sans-serif'; const d = new Date(); x.fillText(['Chủ nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][d.getDay()] + ', ' + d.getDate() + ' tháng ' + (d.getMonth() + 1), LW / 2, 50);
            x.font = 'bold 54px Arial, sans-serif'; x.fillText(lapClock(liveWeather.localHour), LW / 2, 104);
            x.fillStyle = '#f08c00'; x.beginPath(); x.arc(LW / 2, 220, 18, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.font = 'bold 13px Arial, sans-serif'; x.fillText('KS', LW / 2, 225);
            x.font = '9px Arial, sans-serif'; x.fillText('Engineer GHC', LW / 2, 252); x.fillStyle = 'rgba(255,255,255,0.7)'; x.fillText('Chạm Touch ID để mở khoá', LW / 2, 268); x.textAlign = 'left';
            lapRR(x, LW / 2 - 23, -5, 46, 16, 5, '#000'); L.tex.needsUpdate = true; return;
          }
          let rows = [];
          if (music) lapMusic(t, x); else rows = laptopDash(t, x, L);
          lapChrome(x, music ? 'Nhạc' : 'GHC Monitor', music ? [0, 4] : [0, 2, 3]);
          // thông báo trượt vào góc phải (45 s/lần, hiện 6 s)
          const np = t % 45;
          if (!music && np < 6) {
            const k = Math.min(1, np / 0.4, (6 - np) / 0.4), nx = LW - 6 - 176 * (1 - (1 - k) * (1 - k)), w = liveWeather.state, v = (w.windSpeed || 0) / 3.6;
            const msg = [['Gió ' + v.toFixed(1).replace('.', ',') + ' m/s', v > 3 ? 'Tuabin đang phát ' + Math.round(100 * Math.min(1, (v ** 3 - 27) / 1701)) + '% định mức' : 'Dưới tốc độ cắt vào 3 m/s'], ['Nắng cao ' + Math.round(Math.asin(Math.max(0, Math.min(1, sunElevSin))) * 57.3) + '°', w.raining ? 'Mưa: mặt trời giảm còn 30%' : 'Mặt trời gần đỉnh công suất'], ['Hồ thủy điện', 'Mực nước ổn định · 2 tổ máy']][Math.floor(t / 45) % 3];
            x.save(); x.shadowColor = 'rgba(0,0,0,0.4)'; x.shadowBlur = 10; lapRR(x, nx, 20, 170, 38, 8, 'rgba(40,44,54,0.92)'); x.restore();
            lapRR(x, nx + 8, 28, 22, 22, 6, '#ffcc00'); x.fillStyle = '#1d2129'; x.font = 'bold 9px Arial, sans-serif'; x.fillText('GHC', nx + 9, 42);
            x.fillStyle = '#fff'; x.font = 'bold 8px Arial, sans-serif'; x.fillText(msg[0], nx + 36, 35); x.fillStyle = '#c7d3df'; x.font = '7px Arial, sans-serif'; x.fillText(msg[1], nx + 36, 48);
          }
          // con trỏ chuột: lượn tới điểm mới mỗi ~2,5 s (biểu đồ / ghi chú / Dock); trên biểu đồ hiện nhãn giá trị
          const C = L.cur || (L.cur = { x: 200, y: 150, tx: 200, ty: 150, at: 0 });
          if (t - C.at > 2.2 + 1.3 * Math.random()) { C.at = t; const r = rows.length && Math.random() < 0.7 ? rows[(Math.random() * rows.length) | 0] : null; if (r) { C.tx = r[0] + 10 + Math.random() * (r[2] - 20); C.ty = r[1] + 6 + Math.random() * 32; } else { C.tx = 350 + Math.random() * 140; C.ty = 60 + Math.random() * 230; } }
          C.x += (C.tx - C.x) * 0.35; C.y += (C.ty - C.y) * 0.35;
          for (const r of rows) if (C.x > r[0] && C.x < r[0] + r[2] && C.y > r[1] && C.y < r[1] + r[3]) {
            const h = lapHist[r[4]], k = Math.round((C.x - r[0]) / (r[2] / 60)) - (61 - h.length);
            if (k >= 0 && k < h.length) { x.strokeStyle = 'rgba(255,255,255,0.35)'; x.lineWidth = 1; x.beginPath(); x.moveTo(C.x, r[1]); x.lineTo(C.x, r[1] + r[3]); x.stroke();
              const lab = h[k].toFixed(1).replace('.', ',') + ' MW'; x.font = 'bold 7px Arial, sans-serif'; const lw = x.measureText(lab).width + 8; lapRR(x, C.x + 6, C.y - 16, lw, 12, 3, 'rgba(10,12,16,0.85)'); x.fillStyle = LAP_CH[r[4]][0]; x.fillText(lab, C.x + 10, C.y - 7.5); }
          }
          x.fillStyle = '#fff'; x.strokeStyle = '#000'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(C.x, C.y); x.lineTo(C.x, C.y + 11); x.lineTo(C.x + 3, C.y + 8); x.lineTo(C.x + 5.5, C.y + 13); x.lineTo(C.x + 7, C.y + 12.3); x.lineTo(C.x + 4.6, C.y + 7.4); x.lineTo(C.x + 8, C.y + 7.4); x.closePath(); x.fill(); x.stroke();
          L.tex.needsUpdate = true;
        }
