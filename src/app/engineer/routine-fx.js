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
              const w = vanPt(p.x, 1.6 + k * 1.7, p.z); p.s.position.copy(w); p.s.scale.setScalar(0.35 + k * 0.7); p.s.material.opacity = 0.28 * Math.sin(Math.PI * k) * fx.steam;
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
          const chair = table.worldToLocal(campChairPos.clone()); let best = null, bd = 1e9;
          for (const s of [[0.17, -0.15], [0.18, 0.16], [-0.2, 0.16]]) { const d = Math.hypot(s[0] - chair.x, s[1] - chair.z); if (d < bd) { bd = d; best = s; } }
          g.position.set(best[0], 0.45, best[1]); g.rotation.y = Math.atan2(chair.x - best[0], chair.z - best[1]);   // mặt nhãn quay về phía ghế
          return g;
        })();
        // ---- bảng vận hành CHẠY (G 15/10 "add animation vào laptop screen"): 3 đường công suất cuộn theo thời gian, số MW theo cảnh thật
        //      (thủy điện ~28,2 · mặt trời 51,58 MWp × độ cao nắng × mây/mưa · gió 80 MW theo đường cong công suất: cắt vào 3 m/s, định mức 12 m/s,
        //      tốc độ gió thật Pleiku), chấm "TRỰC TIẾP" nhấp nháy, đồng hồ, dòng ghi chú nghiên cứu đang gõ + con trỏ. Vẽ ~6 hình/giây, chỉ khi nắp mở ----
        const LAP_NOTE = ['Đối chiếu sản lượng thủy điện với mực hồ…', 'Tấm pin: −0,4%/°C khi nóng; kiểm nhiệt độ tấm', 'Tuabin: cắt vào 3 m/s, định mức 12 m/s', 'Pin lưu trữ san tải giờ cao điểm 17–20 h', 'Mai kiểm tra cánh tuabin #2'];
        const lapHist = [[], [], []];
        function laptopDash(t) {
          const L = studyLaptop, x = L.ctx, w = liveWeather.state, v = (w.windSpeed || 0) / 3.6, cl = w.data?.current?.cloud_cover ?? 30;
          const P = [28.2 + 0.25 * Math.sin(t / 7) + 0.08 * Math.sin(t * 1.7), 51.58 * Math.min(1, Math.max(0, sunElevSin) * 1.25) * (1 - 0.006 * cl) * (w.raining ? 0.3 : 1), 80 * Math.max(0, Math.min(1, (v ** 3 - 27) / 1701))];
          if (!L.histAt || t - L.histAt > 0.5) { L.histAt = t; P.forEach((p, i) => { const h = lapHist[i]; h.push(p * (1 + (Math.random() - 0.5) * 0.03)); if (h.length > 41) h.shift(); }); }
          x.fillStyle = '#0f1a26'; x.fillRect(0, 0, 256, 160); x.fillStyle = '#1d3347'; x.fillRect(0, 0, 256, 20);
          x.textAlign = 'left'; x.font = 'bold 12px Arial, sans-serif'; x.fillStyle = '#ffd34a'; x.fillText('GHC · Vận hành', 8, 14);
          const hh = liveWeather.localHour; x.font = '10px Arial, sans-serif'; x.fillStyle = '#c7d3df'; x.fillText(String(Math.floor(hh)).padStart(2, '0') + ':' + String(Math.floor(hh * 60 % 60)).padStart(2, '0') + ':' + String(Math.floor(hh * 3600 % 60)).padStart(2, '0'), 196, 14);
          if (t % 1.2 < 0.7) { x.fillStyle = '#ff5a5a'; x.beginPath(); x.arc(118, 10, 3.5, 0, TAU); x.fill(); x.fillStyle = '#ffb0b0'; x.fillText('TRỰC TIẾP', 125, 14); }
          [['#5ec27a', 'Thủy điện', 30], ['#f0a040', 'Mặt trời', 55], ['#65b3ff', 'Gió', 80]].forEach(([col, name, max], i) => {
            const y0 = 28 + i * 38, h = lapHist[i]; x.fillStyle = '#c7d3df'; x.font = '10px Arial, sans-serif'; x.fillText(name, 8, y0 + 9);
            x.fillStyle = col; x.font = 'bold 11px Arial, sans-serif'; x.fillText(P[i].toFixed(1).replace('.', ',') + ' MW', 8, y0 + 23);
            x.strokeStyle = 'rgba(199,211,223,0.15)'; x.lineWidth = 1; x.strokeRect(70, y0, 178, 28);
            x.strokeStyle = col; x.lineWidth = 2; x.beginPath(); h.forEach((p, k) => { const xx = 70 + (k + 41 - h.length) * 4.45, yy = y0 + 27 - Math.min(1, p / max) * 26; k ? x.lineTo(xx, yy) : x.moveTo(xx, yy); }); x.stroke();
            if (h.length) { x.fillStyle = col; x.beginPath(); x.arc(70 + 40 * 4.45, y0 + 27 - Math.min(1, h[h.length - 1] / max) * 26, 2.5, 0, TAU); x.fill(); }
          });
          const note = LAP_NOTE[Math.floor(t / 9) % LAP_NOTE.length], typed = note.slice(0, Math.floor((t % 9) * 14));
          x.fillStyle = '#16283a'; x.fillRect(0, 142, 256, 18); x.fillStyle = '#9fe0b0'; x.font = '10px Arial, sans-serif'; x.fillText('> ' + typed, 6, 155);
          if (t % 0.8 < 0.45) { x.fillStyle = '#9fe0b0'; x.fillRect(10 + x.measureText('> ' + typed).width - 4, 146, 5, 11); }   // con trỏ nhấp nháy
          L.tex.needsUpdate = true;
        }
        function laptopScreenTick(t, music) {   // màn hình laptop: bảng vận hành chạy (nghiên cứu) · trình phát nhạc có đĩa quay, sóng nhạc, thanh tiến độ (buổi tối)
          const L = studyLaptop; if (!L.ctx || L.open < 0.5) return;
          if (Math.abs(t - L.drawnAt) < (music ? 0.12 : 0.16)) return;
          if (!music) { L.mode = 'dash'; L.drawnAt = t; laptopDash(t); return; }
          L.mode = 'music'; L.drawnAt = t;
          const x = L.ctx, W = 256, H = 160, mm = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
          const bg = x.createLinearGradient(0, 0, W, H); bg.addColorStop(0, '#1b1530'); bg.addColorStop(1, '#2c2048'); x.fillStyle = bg; x.fillRect(0, 0, W, H);
          const cg = x.createLinearGradient(12, 20, 84, 92); cg.addColorStop(0, '#ff9a5a'); cg.addColorStop(1, '#c2457a'); x.fillStyle = cg; x.fillRect(12, 20, 72, 72);
          x.fillStyle = 'rgba(20,16,30,0.88)'; x.beginPath(); x.arc(48, 56, 24, 0, Math.PI * 2); x.fill();
          x.strokeStyle = 'rgba(255,255,255,0.28)'; x.lineWidth = 1.5; for (const r of [11, 17]) { const a = t * 3 + r; x.beginPath(); x.arc(48, 56, r, a, a + 1.3); x.stroke(); }   // rãnh đĩa quay
          x.fillStyle = '#ffd34a'; x.beginPath(); x.arc(48, 56, 5, 0, Math.PI * 2); x.fill();
          x.textAlign = 'left'; x.fillStyle = '#f3eaff'; x.font = 'bold 14px Arial, sans-serif'; x.fillText('Gió cao nguyên', 94, 36);
          x.fillStyle = '#b8a8d8'; x.font = '11px Arial, sans-serif'; x.fillText('lo-fi · nhạc nền học bài', 94, 53);
          for (let i = 0; i < 14; i++) {
            const hgt = 5 + 22 * Math.abs(Math.sin(t * (2.1 + i * 0.37) + i * 1.3)) * (0.55 + 0.45 * Math.abs(Math.sin(t * 1.45 * Math.PI)));
            x.fillStyle = i % 2 ? '#7fd1ff' : '#ff8fb1'; x.fillRect(94 + i * 10, 92 - hgt, 7, hgt);
          }
          const dur = 194, at = t % dur, px = 12 + 232 * at / dur;
          x.fillStyle = '#4a3f66'; x.fillRect(12, 112, 232, 4); x.fillStyle = '#ffd34a'; x.fillRect(12, 112, px - 12, 4); x.beginPath(); x.arc(px, 114, 4.5, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#b8a8d8'; x.font = '10px Arial, sans-serif'; x.fillText(mm(at), 12, 132); x.textAlign = 'right'; x.fillText(mm(dur), 244, 132); x.textAlign = 'left';
          x.fillStyle = '#f3eaff'; x.fillRect(119, 138, 5, 14); x.fillRect(129, 138, 5, 14);   // nút tạm dừng = đang phát
          x.fillRect(90, 139, 2, 12); x.beginPath(); x.moveTo(92, 145); x.lineTo(101, 139); x.lineTo(101, 151); x.fill();       // bài trước
          x.fillRect(161, 139, 2, 12); x.beginPath(); x.moveTo(161, 145); x.lineTo(152, 139); x.lineTo(152, 151); x.fill();   // bài sau
          L.tex.needsUpdate = true;
        }
