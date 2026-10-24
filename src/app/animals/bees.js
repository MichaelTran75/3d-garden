        // ===== ONG MẬT: dựng ong · chọn hoa · bay – đáp – hút mật – về tổ – xả mật (tách khỏi animals/insects.js, G 24/10 tối "kiểm tra xem tại sao ong bị
        //  stuck, có phải do trời mưa chúng ko bay đc về tổ? tách file ong và its behaviour nếu cần"). Dùng chung với insects.js: lưới bay flightNav, hoa an toàn
        //  safeFlowerCoords + kho mật hoa flowerNectar, animateInsectFlight / setInsectVisualPosition. Tổ giỏ rơm + ong trong tổ + beeWeatherOK: animals/beehive.js.
        //  Gọi mỗi khung: loop/main-loop-rest.js (beeTick) ----
        function reserveBeeNectar(bee, now = Date.now()) {
          const flower = bee.target.nectarFlower, supply = flowerNectarState(flower, now);
          if (!supply || supply.remaining <= supply.reserved || bee.nectarFlower) return false;
          supply.reserved++; bee.nectarFlower = flower; return true;
        }
        function finishBeeNectar(bee, now = Date.now()) {
          const supply = flowerNectar?.get(bee.nectarFlower);
          if (!supply) return false;
          supply.reserved = Math.max(0, supply.reserved - 1);
          supply.remaining--; bee.nectarFlower = null;
          if (supply.remaining === 0) supply.readyAt = now + 30000;
          return true;
        }
        function cancelBeeNectar(bee) {
          if (!bee.nectarFlower) return;
          const supply = flowerNectar?.get(bee.nectarFlower);
          if (supply) supply.reserved = Math.max(0, supply.reserved - 1);
          bee.nectarFlower = null; bee.hoverTmr = 0; setBeePct(bee);
        }

        // ---- ONG bay tới hoa, hút mật, mang về tổ (G 15/10: "study bee glb and improve · make bee smaller 50%") — dựng theo tỉ lệ mẫu "Bee (Low Poly)"
        //      (EsiHere, Sketchfab, CC-BY-4.0; chỉ đo): đầu ~20% · ngực ~27% · bụng ~50% chiều dài; bụng thon nhọn có kim, 4 khoang vàng cam xen đen;
        //      mắt kép đen bóng 2 bên đầu, râu gập khuỷu, 6 chân đen 2 đốt buông sau bụng khi bay; 2 cặp cánh trong (trước to, sau nhỏ). Cỡ = 75% ong cũ (G: nhỏ 50% rồi to lại 50%) ----
        function createBee() {
          const g = new THREE.Group(), dark = new THREE.MeshLambertMaterial({ color: 0x231b14, flatShading: true });
          const vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), C = (h) => new THREE.Color(h);
          const paint = (geo, f) => { const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const k = C(f(p.getX(i), p.getY(i), p.getZ(i))); c.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
          // bụng: ellipsoid kéo dài, thon nhọn về đuôi; khoang theo z (vàng cam / đen), chóp đen
          const ab = new THREE.SphereGeometry(1, 10, 8), ap = ab.attributes.position;
          for (let i = 0; i < ap.count; i++) { const z = ap.getZ(i), k = z < 0 ? 1 - 0.55 * Math.pow(-z, 1.6) : 1; ap.setXYZ(i, ap.getX(i) * 0.058 * k, ap.getY(i) * 0.054 * k, z * 0.078 - 0.08); }
          ab.computeVertexNormals(); g.add(new THREE.Mesh(paint(ab, (x, y, z) => z < -0.142 ? 0x231b14 : (Math.floor((z + 0.158) / 0.0195) & 1) ? 0x231b14 : 0xf2b21e), vc));
          const sting = new THREE.Mesh(new THREE.ConeGeometry(0.008, 0.03, 5), dark); sting.rotation.x = -Math.PI / 2; sting.position.z = -0.168; g.add(sting);
          const thx = new THREE.SphereGeometry(0.043, 9, 7); thx.translate(0, 0.004, 0.03); g.add(new THREE.Mesh(paint(thx, (x, y, z) => y > 0.03 && Math.abs(z - 0.03) < 0.018 ? 0x231b14 : 0xe0a02a), vc));   // ngực lông vàng, vạch đen trên lưng
          const hd = new THREE.SphereGeometry(0.033, 8, 6); hd.scale(1, 0.95, 0.85); hd.translate(0, 0.002, 0.098); g.add(new THREE.Mesh(paint(hd, (x, y, z) => y < -0.005 && z > 0.11 ? 0xf2b21e : 0x2a2018), vc));   // đầu sẫm, mặt dưới vàng
          const eyeM = new THREE.MeshPhongMaterial({ color: 0x0c0a08, shininess: 90, specular: 0x666666 });
          for (const sx of [-1, 1]) {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.02, 7, 5), eyeM); e.scale.set(0.5, 1, 0.8); e.position.set(sx * 0.026, 0.006, 0.104); g.add(e);   // mắt kép
            rodBetween(g, new THREE.Vector3(sx * 0.01, 0.022, 0.122), new THREE.Vector3(sx * 0.02, 0.058, 0.142), 0.0035, dark, 4, false);   // râu: đốt gốc dựng
            rodBetween(g, new THREE.Vector3(sx * 0.02, 0.058, 0.142), new THREE.Vector3(sx * 0.032, 0.062, 0.19), 0.003, dark, 4, false);   // gập khuỷu chĩa trước
            for (const [z, dz] of [[0.05, -0.02], [0.03, -0.04], [0.008, -0.07]]) {   // 6 chân: đùi chĩa ra ngoài–xuống, ống chân buông ra sau
              const k = new THREE.Vector3(sx * 0.062, -0.05, z + dz * 0.4);
              rodBetween(g, new THREE.Vector3(sx * 0.022, -0.028, z), k, 0.005, dark, 4, false); rodBetween(g, k, new THREE.Vector3(sx * 0.055, -0.1, z + dz), 0.0035, dark, 4, false);
            }
          }
          const wingM = new THREE.MeshLambertMaterial({ color: 0xe6ecef, transparent: true, opacity: 0.42, side: THREE.DoubleSide, depthWrite: false });
          const blade = (len, w) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(len * 0.3, w, len * 0.9, w * 0.9, len, 0.1 * w); sh.bezierCurveTo(len * 0.9, -w * 0.5, len * 0.3, -w * 0.5, 0, 0); const gg = new THREE.ShapeGeometry(sh, 6); gg.rotateX(Math.PI / 2); return gg; };
          const mkWing = (sx) => {   // nhóm vai ở gốc cánh (lưng ngực); cánh trước dài 0,16 xuôi chéo ra sau, cánh sau 0,1 ngay sau
            const w = new THREE.Group(); w.position.set(sx * 0.018, 0.04, 0.04); w.scale.x = sx; g.add(w);
            const f = new THREE.Mesh(blade(0.16, 0.05), wingM); f.rotation.y = 0.5; w.add(f);
            const h = new THREE.Mesh(blade(0.1, 0.035), wingM); h.position.z = -0.03; h.rotation.y = 0.85; w.add(h);
            return w;
          };
          const wingL = mkWing(1), wingR = mkWing(-1);
          const polM = new THREE.MeshLambertMaterial({ color: 0xf0a020 }), pollen = [-1, 1].map(sx => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.016, 6, 4), polM); m.position.set(sx * 0.058, -0.077, -0.04); m.visible = false; m.userData.noBake = true; g.add(m); return m; });   // giỏ phấn (corbicula) ở ống chân sau
          wingL.userData.noBake = wingR.userData.noBake = true; bakeStatic(g);   // thân + chân + râu gộp; 2 cặp cánh + giỏ phấn giữ động
          g.rotation.order = 'YXZ'; g.scale.setScalar(0.75 * NATURE_SCALE * 0.75); return { g, wingL, wingR, pollen };
        }
        // Ong chọn hoa có lối tiếp cận an toàn; ưu tiên hoa gần để không bay vòng cả khu vườn.
        //  TẦM KIẾM MẬT quanh tổ BEE_RANGE (G 24/10 tối): hoa xa tổ hơn bị phạt theo bình phương — trước đây chuỗi "hoa gần nhất kế tiếp" trôi xa tổ tới 140 m
        //  (hoa trong 35 m quanh tổ chỉ 15 / 89), đường về dài quá sức A* của lưới bay
        const BEE_RANGE = 40, beeHiveDist = p => Math.hypot(p.x - beehive.mouth.x, p.z - beehive.mouth.z);
        function pickBeeFlowerTarget(from = null, out = new THREE.Vector3()) {
          const now = Date.now();
          if (!from) {
            const near = safeFlowerCoords.filter(f => beeHiveDist(f) < BEE_RANGE), FL = near.length ? near : safeFlowerCoords, first = Math.floor(Math.random() * FL.length);   // lúc dựng: hoa ngẫu nhiên trong tầm quanh tổ
            for (let n = 0; n < FL.length; n++) {
              const flower = FL[(first + n) % FL.length];
              if (flowerHasNectar(flower, now)) { out.nectarFlower = flower; return out.copy(flower); }
            }
            out.nectarFlower = null; return out.copy(safeFlowerCoords[0]);
          }
          let best = null, fallback = null, bestScore = Infinity;
          for (const flower of safeFlowerCoords) {
            if (!flowerHasNectar(flower, now)) continue;
            if (!fallback) fallback = flower;
            const d = flower.distanceToSquared(from);
            if (d < 0.5) continue;
            let score = d * (0.7 + Math.random() * 0.6) + Math.max(0, beeHiveDist(flower) - BEE_RANGE) ** 2 * 3;
            for (const bee of bees) if (bee.target.distanceToSquared(flower) < 0.01) score += 9;
            if (score < bestScore) { best = flower; bestScore = score; }
          }
          out.nectarFlower = best || fallback;
          return out.copy(out.nectarFlower || from);
        }
        // ---- ĐIỂM DẪN ĐƯỜNG VỀ TỔ (G 24/10 tối "ong bị stuck"): ô trống gần miệng đáy giỏ nhất (ưu tiên dưới / ngang miệng, lên trên tính gấp đôi), luôn cao
        //  hơn mặt đất ≥ khoảng hở + 0,15 m. Bản cũ chỉ hạ thẳng xuống 40 × 5 cm: vướng hộp rễ + tán cây cổ thụ suốt đường nên dừng DƯỚI ĐẤT (y 6,95 < đất
        //  7,20) ⇒ mọi con ong về tổ báo 'blocked' mãi (không do mưa: mưa / 18:00 chỉ làm cả bầy cùng về một lúc nên thấy rõ). Đoạn cuối lên vành miệng giỏ
        //  do pha "đáp" lo. Lưới bay dựng lại thì tìm lại (beeTick) ----
        const hiveWorldPos = new THREE.Vector3(), _hv = new THREE.Vector3(); let hiveNavFor = null;
        function placeHiveNav() {
          hiveNavFor = flightNav; const M = beehive.mouth, C = flightNav.clearance, y0 = M.y - C - 0.08, c = [];
          for (let r = 0; r <= 4; r += 0.25) { const n = r ? Math.ceil(r * 8) : 1; for (let k = 0; k < n; k++) { const a = k / n * TAU, x = M.x + Math.cos(a) * r, z = M.z + Math.sin(a) * r, yMin = cowY(x, z) + C + 0.15;
            for (let dy = -3; dy <= 2; dy += 0.25) if (y0 + dy >= yMin) c.push([Math.hypot(r, dy > 0 ? 2 * dy : dy), x, y0 + dy, z]); } }
          c.sort((p, q) => p[0] - q[0]);
          for (const [, x, y, z] of c) if (flightNav.pointClear(_hv.set(x, y, z))) { hiveWorldPos.copy(_hv); return; }
          hiveWorldPos.set(M.x, Math.max(y0, cowY(M.x, M.z) + C + 0.15), M.z); console.warn('Ong: không có ô trống quanh miệng tổ');
        }
        placeHiveNav();   // ong đi / về ở miệng đáy giỏ rơm (animals/beehive.js)
   // điểm dẫn đường phải là ô trống (tán cây cổ thụ chặn sát tổ ⇒ trước đây ong kẹt, không về được tổ); đoạn cuối lên vành miệng giỏ do pha "đáp" lo
        let hiveHoneyPct = 0;
        let hiveSprite, hiveCanvas, hiveTex;

        function createHiveLoadingBar() {
          hiveCanvas = document.createElement('canvas'); hiveCanvas.width = 128; hiveCanvas.height = 32;
          hiveTex = new THREE.CanvasTexture(hiveCanvas);
          hiveSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: hiveTex, transparent: true, depthWrite: false, depthTest: true }));
          hiveSprite.scale.set(1.4, 0.35, 1.0).multiplyScalar(NATURE_SCALE);
          hiveSprite.position.copy(beehive.mouth).y -= 0.46 + 1.05 * NATURE_SCALE; // dưới miệng tổ (đặt theo miệng tổ: điểm dẫn đường giờ có thể lệch ngang)
          hiveSprite.name = 'Hive Loading Bar';
          scene.add(hiveSprite);
          updateHiveLoadingBar();
        }

        function updateHiveLoadingBar() {
          if (!hiveCanvas) return;
          const ctx = hiveCanvas.getContext('2d');
          ctx.clearRect(0, 0, 128, 32);
          ctx.fillStyle = 'rgba(25, 20, 15, 0.7)'; ctx.fillRect(4, 10, 80, 12); // Vẽ nền phẳng đơn giản
          ctx.fillStyle = '#ffd13b'; ctx.fillRect(4, 10, (hiveHoneyPct / 100) * 80, 12); // Vẽ thanh mật phẳng đơn giản
          ctx.font = 'bold 13px Outfit, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillStyle = '#E2D6C0'; ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 3;
          ctx.fillText(Math.floor(hiveHoneyPct) + '%', 88, 16); // % đặt cạnh bên
          hiveTex.needsUpdate = true;
        }

        createHiveLoadingBar();
        // ---- nhãn % mật trên đầu mỗi con ong: mỗi bông hoa +10%, đủ 100% bay về tổ xả về 0% → lặp ----
        function beeLabel() {
          const c = document.createElement('canvas'); c.width = 64; c.height = 32;
          const tex = new THREE.CanvasTexture(c);
          const spr = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
          spr.userData.label = true; spr.scale.set(1.2, 0.6, 1); spr.position.set(0, 0.48, 0);   // ong còn 75% cỡ cũ ⇒ nhãn ×4/3 để giữ cỡ chữ cũ
          return { c, tex, spr };
        }
        function setBeePct(b, pctOverride) {
          const pct = pctOverride !== undefined ? Math.min(100, Math.max(0, Math.floor(pctOverride))) : Math.min(100, b.flowersVisited * 10);
          if (pct === b.lastPct) return; b.lastPct = pct;
          const x = b.lbl.c.getContext('2d'); x.clearRect(0, 0, 64, 32);
          x.font = '17px Outfit, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.shadowColor = 'rgba(20,28,36,0.6)'; x.shadowBlur = 3;
          x.fillStyle = pct >= 100 ? '#8fe38f' : '#ffd13b';
          x.fillText(pct + '%', 32, 17);
          b.lbl.tex.needsUpdate = true;
        }
        // ---- HÀNH VI ONG THỢ (G 15/10 "research bee behaviour and physic, react to environment and weather", Apis mellifera / cerana):
        //  · chỉ ra khỏi tổ khi khô ráo, ban ngày (6:20–18:00), gió < 24 km/h (15 mph), ≥ 12 °C (54 °F) — ngưỡng bay của ong mật theo UMaine Extension;
        //    mưa / gió mạnh / lạnh / chiều tối thì bỏ dở hoa bay về tổ; trong tổ chờ tới khi thời tiết lại thuận.
        //  · ĐÁP = CHẠM: sát bề mặt thì giảm tốc theo khoảng cách còn lại (ong giữ tốc độ giãn ảnh không đổi khi hạ cánh — Srinivasan & cs. 2000,
        //    Baird & cs. 2013) ⇒ khoảng cách giảm theo hàm mũ, chạm nhẹ; ngóc đầu + thõng chân lúc sắp chạm. Đậu hoa: xếp cánh dọc lưng, bò vòng
        //    quanh nhuỵ, chúc đầu hút mật; giỏ phấn chân sau to dần theo số hoa. Về tổ: đáp lên vành miệng giỏ, xếp cánh, BÒ vào trong (ẩn), xả mật,
        //    nghỉ rồi bò ra, cất cánh. Khi bay, gió tại chỗ đẩy ong dạt theo chiều gió.
        const _bw = new THREE.Vector3(), _bp = new THREE.Vector3(), _bx = new THREE.Vector3(), _by = new THREE.Vector3(), _bz = new THREE.Vector3(), _bm = new THREE.Matrix4();
        const beeFlap = (b, t) => { b.wL.rotation.set(0, 0, 0.25 + Math.sin(t * 95 + b.ph) * 0.55); b.wR.rotation.set(0, 0, -b.wL.rotation.z); };   // cánh ~200 Hz: ở 60 hình/giây chỉ còn rung loang
        const beeFold = b => { b.wL.rotation.set(0, 0.9, -0.08); b.wR.rotation.set(0, -0.9, 0.08); };   // xếp cánh xuôi dọc lưng
        const beeTouch = (b, to, mode) => { b.ph2 = 'land'; b.mode2 = mode; b.to = to; b.k2 = 0; };
        // ---- về tổ đường xa / bị chặn (A* lưới bay giới hạn 16 384 ô, 64 khúc): bay qua CHẶNG TRUNG GIAN ~16 → 9 → 4 m dọc đường thẳng về tổ (lệch ngang
        //  0 / ±2 / ±4 m, cao 1,2–8 m trên đất, ô trống); tới chặng thì nhắm lại tổ ----
        function beeRelay(b) {
          const H = hiveWorldPos, dx = H.x - b.pos.x, dz = H.z - b.pos.z, D = Math.hypot(dx, dz) || 1, ux = dx / D, uz = dz / D;
          for (const L of [Math.min(16, D * 0.6), Math.min(9, D * 0.45), Math.min(4, D * 0.3)]) for (const off of [0, 2, -2, 4, -4]) for (const h of [2, 4, 1.2, 6, 8]) {
            const x = b.pos.x + ux * L - uz * off, z = b.pos.z + uz * L + ux * off;
            if (flightNav.pointClear(_hv.set(x, cowY(x, z) + h, z))) { b.target.copy(_hv); b.target.nectarFlower = null; b.via = true; return true; }
          }
          return false;
        }
        function beeTick(b, dt, t, ok) {
          if (hiveNavFor !== flightNav) placeHiveNav();
          const g = b.g, P = b.ph2 || 'fly', pk = Math.min(1, b.flowersVisited / 10);
          for (const m of b.pollen) { m.visible = pk > 0 && g.visible; m.scale.setScalar(0.5 + 0.8 * pk); }
          if (P === 'fly') {
            if (!ok && b.state !== 'returning') { cancelBeeNectar(b); b.hoverTmr = 0; b.state = 'returning'; b.via = false; b.target.copy(hiveWorldPos); setBeePct(b); }   // trở trời / chiều tối: về tổ
            beeFlap(b, t);
            if (b.state === 'foraging' && !b.target.nectarFlower) { if ((b.flowerRetryTmr -= dt) <= 0) { pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 1; } }   // hoa đều đang nghỉ: lượn chờ, 1 s thử lại
            else if (animateInsectFlight(b, dt) === 'arrived') {
              if (b.state === 'returning' && b.via) { b.via = false; b.target.copy(hiveWorldPos); }   // tới chặng trung gian: nhắm lại tổ
              else if (b.state === 'returning') { const a = Math.random() * TAU, R = beehive.rimR; b.rimA = a; beeTouch(b, beehive.mouth.clone().add(_bp.set(Math.cos(a) * R, 0.004, Math.sin(a) * R)), 'hive'); }
              else if (reserveBeeNectar(b)) { const F = b.nectarFlower; beeTouch(b, new THREE.Vector3(F.x, (F.top ?? F.y) + 0.012, F.z), 'flower'); }
              else { pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 1; }
            }
            if (b.state === 'returning' && b.blockedFor >= 2) { b.blockedFor = 0; beeRelay(b); }   // về tổ mà A* không ra đường: chặng trung gian
            if (b.ph2 === 'land') return;
            windAt(b.pos.x, b.pos.y, b.pos.z, 1, _bw); b.drift = (b.drift || new THREE.Vector3()).lerp(_bw.multiplyScalar(0.05).clampLength(0, 0.3), Math.min(1, dt * 2));
            setInsectVisualPosition(b, 0, Math.sin(t * 6 + b.ph) * 0.08); g.position.add(b.drift); g.rotation.x += (-0.12 - g.rotation.x) * Math.min(1, dt * 6);
            return;
          }
          if (P === 'land') {   // tiếp cận chạm: khoảng cách còn lại giảm theo hàm mũ (τ 0,32 s — ong bay chậm 50%) ⇒ càng sát càng chậm
            beeFlap(b, t); const L = g.position.distanceTo(b.to); g.position.lerp(b.to, 1 - Math.exp(-dt / 0.32)); g.rotation.x += (-0.5 - g.rotation.x) * Math.min(1, dt * 8);
            if (L < 0.006 || (b.k2 += dt) > 3.2) { g.position.copy(b.to); b.k2 = 0; b.ph2 = b.mode2 === 'flower' ? 'feed' : 'crawlIn'; b.hoverTmr = 3.6; }
            return;
          }
          if (P === 'feed') {   // đậu hoa: xếp cánh, bò vòng quanh nhuỵ, chúc đầu hút mật
            beeFold(b); b.hoverTmr -= dt; b.k2 += dt; const a = b.k2 * 0.9 + b.ph;
            g.position.set(b.to.x + Math.cos(a) * 0.025, b.to.y, b.to.z + Math.sin(a) * 0.025); g.rotation.set(0.35 + 0.08 * Math.sin(t * 7), Math.atan2(-Math.sin(a), Math.cos(a)), 0);
            setBeePct(b, b.flowersVisited * 10 + (1 - b.hoverTmr / 3.6) * 10);
            if (b.hoverTmr <= 0) {
              if (finishBeeNectar(b)) b.flowersVisited++;
              b.state = b.flowersVisited >= 10 || !ok ? 'returning' : 'foraging'; if (b.state === 'returning') { b.via = false; b.target.copy(hiveWorldPos); } else pickBeeFlowerTarget(b.pos, b.target);
              setBeePct(b); b.ph2 = 'takeoff'; b.k2 = 0;
            }
            return;
          }
          if (P === 'takeoff') {   // cất cánh: vỗ cánh, bốc lên về điểm dẫn đường rồi bay tiếp
            beeFlap(b, t); const goal = flightNav.visualPosition(b.pos, insectOffset.set(0, 0, 0), _bp); g.position.lerp(goal, 1 - Math.exp(-dt / 0.28));
            if (g.position.distanceTo(goal) < 0.02 || (b.k2 += dt) > 2.4) b.ph2 = 'fly';
            return;
          }
          if (P === 'crawlIn' || P === 'crawlOut') {   // bò qua vành miệng giỏ lên vách trong (lưng quay vào tâm, đầu hướng lên khi vào / xuống khi ra)
            beeFold(b); b.k2 += dt; const u = Math.min(1, b.k2 / 1.1), s = P === 'crawlIn' ? u : 1 - u, a = b.rimA, R = beehive.rimR - 0.012 - 0.05 * s, m = beehive.mouth;
            g.position.set(m.x + Math.cos(a) * R, m.y + 0.004 + 0.13 * s, m.z + Math.sin(a) * R);
            _by.set(-Math.cos(a), 0, -Math.sin(a)); _bz.set(0, P === 'crawlIn' ? 1 : -1, 0); g.quaternion.setFromRotationMatrix(_bm.makeBasis(_bx.crossVectors(_by, _bz), _by, _bz));
            if (u < 1) return;
            if (P === 'crawlOut') { b.ph2 = 'takeoff'; b.k2 = 0; return; }
            g.visible = false; b.ph2 = 'inside'; b.k2 = 0; b.inT = 2.5 + Math.random() * 3;
            if (b.flowersVisited > 0) { hiveHoneyPct = Math.min(100, hiveHoneyPct + 1); updateHiveLoadingBar(); }   // xả mật: mỗi lượt về +1% mật tổ
            b.flowersVisited = 0; setBeePct(b); return;
          }
          if (P === 'inside' && ok && (b.k2 += dt) > b.inT) { g.visible = true; b.ph2 = 'crawlOut'; b.k2 = 0; b.state = 'foraging'; pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 0; }   // thời tiết thuận: bò ra đi kiếm mật
        }
        for (let n = 0; n < 8; n++) {
          const bee = createBee(); bee.g.scale.multiplyScalar(0.85);   // G 15/10: ong đi hút mật nhỏ đi 15% (ong bay quanh tổ, ong trong tổ giữ cỡ)
          // Ong bắt đầu tại tổ hoặc hoa
          const startP = Math.random() < 0.3 ? hiveWorldPos.clone() : pickBeeFlowerTarget();
          bee.g.position.copy(startP); scene.add(bee.g);
          const bb = {
            g: bee.g,
            wL: bee.wingL,
            wR: bee.wingR,
            pollen: bee.pollen,
            pos: startP.clone(),
            target: pickBeeFlowerTarget(startP),
            spd: 0.6 + Math.random() * 0.3,   // G 15/10: bay chậm lại 50%
            ph: Math.random() * 6.28,
            hoverTmr: 0, nectarFlower: null, flowerRetryTmr: 0,
            state: 'foraging', // 'foraging', 'returning', 'depositing'
            flowersVisited: 0, // mỗi lượt hút mật ở hoa tăng 10%; đủ 100% về tổ
            lbl: beeLabel(), lastPct: -1
          };
          bb.lbl.spr.scale.multiplyScalar(1 / 0.85); bb.lbl.spr.position.y /= 0.85;   // nhãn % giữ nguyên cỡ chữ + độ cao trên đầu ong
          bb.g.add(bb.lbl.spr); setBeePct(bb); bees.push(bb);
        }
        for (const b of bees) daytimeAnimals.add(b.g);   // ẩn đêm cùng động vật ban ngày (animals/insects.js)
