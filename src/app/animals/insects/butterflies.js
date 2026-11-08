        // ---- BƯƠM BƯỚM (không kèm mẫu: dựng theo hình thái thật + 5 loài phổ biến ở Tây Nguyên) ----
        //  thân mảnh (ngực lông + bụng dài đốt), mắt kép to, râu dùi trống, vòi cuộn; cánh trước tam giác đỉnh nhọn, cánh sau tròn, hoa văn vẽ canvas
        //  theo loài + gân cánh toả từ gốc: Bướm giáp đỏ (Cethosia biblis) · Bướm hổ (Danaus chrysippus) · Phượng xanh lam (Graphium sarpedon) ·
        //  Bướm vàng (Eurema hecabe) · Bướm hổ xanh (Tirumala limniace). Bay: vỗ biên độ lớn (trên gần chạm nhau ~+75°, dưới ~−23°), cánh sau trễ pha
        //  cánh trước; loài hổ / phượng có pha LƯỢN cánh phẳng giữa các tràng vỗ; thân nhấp nhô theo từng nhịp (vỗ xuống nâng thân).
        const BF_SP = [   // [tên, nền cánh trước, nền cánh sau, màu thân, nhịp vỗ Hz (chậm 50% — trước 7 · 6 · 8 · 11 · 5,5 · 8), lượn (s) | null]
          ['lacewing', '#d9452c', '#e0562e', 0x3a2418, 3.5, [0.4, 1.0]], ['tiger', '#ee8a1d', '#f29a2e', 0x2b2018, 3, [0.5, 1.3]], ['bluebottle', '#1d2226', '#1d2226', 0x1a1d20, 4, [0.3, 0.8]],
          ['yellow', '#f2d82a', '#f4de3a', 0x5a4a1a, 5.5, null], ['bluetiger', '#2a2622', '#2a2622', 0x221e1a, 2.75, [0.6, 1.6]], ['bluebottle', '#1d2226', '#1d2226', 0x1a1d20, 4, [0.3, 0.8]]];
        const BF_FORE = [[0.01, 0.025], [0.12, 0.06], [0.24, 0.075], [0.31, 0.07], [0.3, 0.02], [0.25, -0.05], [0.18, -0.085], [0.06, -0.06], [0.01, -0.02]];
        const BF_HIND = [[0.01, -0.01], [0.1, -0.035], [0.19, -0.07], [0.21, -0.13], [0.17, -0.19], [0.1, -0.225], [0.04, -0.19], [0.01, -0.09]];
        function bflyTex(sp) {   // 256²: toạ độ cánh (x 0…0,32 · z −0,24…0,08) ↔ ảnh; vẽ nền → hoa văn theo loài → gân → (gương 2 bên dùng chung)
          const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), P = (u, z) => [u / 0.32 * 256, (0.25 - z / 0.32) * 256];
          const path = (pts) => { x.beginPath(); pts.forEach(([u, z], i) => { const [X, Y] = P(u, z); i ? x.lineTo(X, Y) : x.moveTo(X, Y); }); x.closePath(); };
          const dot = (u, z, r, col) => { const [X, Y] = P(u, z); x.fillStyle = col; x.beginPath(); x.arc(X, Y, r, 0, TAU); x.fill(); };
          const [name, fc, hc] = sp;
          for (const [pts, col] of [[BF_FORE, fc], [BF_HIND, hc]]) {
            x.save(); path(pts); x.clip(); x.fillStyle = col; x.fillRect(0, 0, 256, 256);
            const fore = pts === BF_FORE;
            if (name === 'tiger' || name === 'lacewing') {   // mép đen chấm trắng; đỉnh cánh trước đen + dải trắng chéo
              x.lineWidth = 16; x.strokeStyle = '#1a1512'; path(pts); x.stroke();
              for (let k = 0; k < 9; k++) { const q = pts[1 + (k % (pts.length - 2))]; dot(q[0] * 0.94, q[1] * 0.94, 2.2, '#f4f0e6'); }
              if (fore) { x.fillStyle = '#1a1512'; path([[0.19, 0.08], [0.33, 0.08], [0.33, -0.03], [0.22, 0.0]]); x.fill(); for (const [u, z] of [[0.21, 0.035], [0.24, 0.045], [0.27, 0.045], [0.25, 0.015]]) dot(u, z, 4.5, '#f6f2ea'); }
              if (!fore && name === 'tiger') for (const [u, z] of [[0.1, -0.09], [0.13, -0.12], [0.08, -0.13]]) dot(u, z, 3, '#1a1512');
              if (name === 'lacewing') { x.strokeStyle = '#f4efe2'; x.lineWidth = 2; x.beginPath(); for (let k = 0; k <= 12; k++) { const [X, Y] = P((fore ? 0.2 : 0.15) + 0.012 * (k & 1), fore ? 0.06 - k * 0.011 : -0.05 - k * 0.013); k ? x.lineTo(X, Y) : x.moveTo(X, Y); } x.stroke(); }
            } else if (name === 'yellow') {   // vàng chanh, mép ngoài cánh trước đen hình "mặt chó"
              if (fore) { x.fillStyle = '#211b12'; path([[0.2, 0.09], [0.34, 0.09], [0.34, -0.1], [0.21, -0.08], [0.25, -0.03], [0.24, 0.03]]); x.fill(); }
              else { x.lineWidth = 5; x.strokeStyle = '#211b12'; path(pts); x.stroke(); }
            } else if (name === 'bluebottle') {   // nền đen nâu + dải xanh lam ngọc chạy từ đỉnh cánh trước xuống mép trong cánh sau
              x.fillStyle = '#41c2d4'; for (let k = 0; k < 8; k++) { const t = k / 7, u = fore ? 0.24 - t * 0.17 : 0.09 - t * 0.05, z = fore ? 0.03 - t * 0.07 : -0.05 - t * 0.13; const [X, Y] = P(u, z); x.beginPath(); x.ellipse(X, Y, 11 - 3 * t, 7, -0.6, 0, TAU); x.fill(); }
              if (!fore) for (const [u, z] of [[0.15, -0.17], [0.12, -0.2]]) dot(u, z, 2.5, '#d8342a');
            } else {   // hổ xanh: vệt xanh nhạt toả giữa các gân + chấm mép
              x.fillStyle = '#bfe2f2'; for (let k = 0; k < 7; k++) { const a = (fore ? 0.55 : -0.2) - k * 0.24, L = fore ? 0.2 : 0.14; const [X0, Y0] = P(0.03 + Math.cos(a) * 0.03, Math.sin(a) * 0.03 + (fore ? 0 : -0.05)), [X1, Y1] = P(0.03 + Math.cos(a) * L, Math.sin(a) * L + (fore ? 0 : -0.05)); x.strokeStyle = '#bfe2f2'; x.lineWidth = 7; x.lineCap = 'round'; x.beginPath(); x.moveTo(X0, Y0); x.lineTo(X1, Y1); x.stroke(); }
              for (let k = 0; k < 8; k++) { const q = pts[1 + (k % (pts.length - 2))]; dot(q[0] * 0.9, q[1] * 0.9, 2.5, '#d6ecf6'); }
            }
            x.strokeStyle = 'rgba(20,14,10,0.55)'; x.lineWidth = 1.2;   // gân cánh toả từ gốc
            for (let k = 0; k < 9; k++) { const q = pts[1 + Math.floor(k / 9 * (pts.length - 2))], [X0, Y0] = P(0.015, fore ? 0.01 : -0.03), [X1, Y1] = P(q[0], q[1]); x.beginPath(); x.moveTo(X0, Y0); x.quadraticCurveTo((X0 + X1) / 2, (Y0 + Y1) / 2 - 6, X1, Y1); x.stroke(); }
            x.restore();
          }
          const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.repeat.set(1 / 0.32, 1 / 0.32); t.offset.set(0, 0.75); return t;
        }
        function butterfly(sp) {
          const g = new THREE.Group(), body = new THREE.MeshLambertMaterial({ color: sp[3], flatShading: true });
          const th = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), body); th.scale.set(0.028, 0.026, 0.05); th.position.z = 0.03; g.add(th);   // ngực lông
          const ab = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 5), body); ab.scale.set(0.02, 0.019, 0.1); ab.position.set(0, -0.004, -0.085); g.add(ab);   // bụng dài
          const hd = new THREE.Mesh(new THREE.SphereGeometry(0.022, 7, 5), body); hd.position.z = 0.09; g.add(hd);
          const eyeM = new THREE.MeshPhongMaterial({ color: 0x1a1612, shininess: 60 });
          for (const sx of [-1, 1]) {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.013, 6, 5), eyeM); e.position.set(sx * 0.016, 0.004, 0.095); g.add(e);
            rodBetween(g, new THREE.Vector3(sx * 0.008, 0.016, 0.1), new THREE.Vector3(sx * 0.045, 0.07, 0.23), 0.003, body, 3, false);   // râu
            const club = new THREE.Mesh(new THREE.SphereGeometry(0.008, 6, 4), body); club.scale.z = 1.8; club.position.set(sx * 0.046, 0.071, 0.235); g.add(club);   // dùi trống
          }
          const prob = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.0025, 4, 8, 4.7), body); prob.position.set(0, -0.02, 0.105); prob.rotation.y = Math.PI / 2; g.add(prob);   // vòi cuộn
          const tex = bflyTex(sp), wingM = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, alphaTest: 0.5 });
          const shapeGeo = (pts) => { const sh = new THREE.Shape(); pts.forEach(([u, z], i) => i ? sh.lineTo(u, z) : sh.moveTo(u, z)); const gg = new THREE.ShapeGeometry(sh); gg.rotateX(Math.PI / 2); return gg; };
          const foreG = shapeGeo(BF_FORE), hindG = shapeGeo(BF_HIND);
          const mkWing = (side) => {   // nhóm vai (gốc cánh trên lưng ngực); cánh trái = gương cánh phải (scale.x)
            const w = new THREE.Group(); w.position.set(side * 0.012, 0.022, 0.03); g.add(w);
            const inner = new THREE.Group(); inner.scale.x = side; w.add(inner);
            inner.add(new THREE.Mesh(foreG, wingM)); const hind = new THREE.Mesh(hindG, wingM); inner.add(hind);
            w.userData.hind = hind; return w;
          };
          const wingL = mkWing(1), wingR = mkWing(-1);
          wingL.userData.noBake = wingR.userData.noBake = true; bakeStatic(g);   // thân + râu gộp, 2 cánh giữ động
          g.scale.setScalar(0.78 * 0.9 * 0.9 * NATURE_SCALE); return { g, wingL, wingR };   // nhỏ lại 10% · nhỏ thêm 10%
        }
        function pickBflyTarget(from = null, out = new THREE.Vector3()) {
          for (let attempt = 0; attempt < 80; attempt++) {
            const angle = Math.random() * Math.PI * 2, radius = 4 + Math.random() * 10;
            const local = from && attempt < 60;
            const gx = local ? THREE.MathUtils.clamp(from.x + Math.cos(angle) * radius, X0 + 16, X0 + 108) : X0 + 16 + Math.random() * 92;
            const gz = local ? THREE.MathUtils.clamp(from.z + Math.sin(angle) * radius, Z0 + 16, Z0 + 108) : Z0 + 16 + Math.random() * 92;
            out.set(gx, flightNav.ground(gx, gz) + 1.8 + Math.random() * 3.6, gz);
            flightNav.snapToVoxel(out, out);
            if (flightNav.pointClear(out) && (!from || out.distanceToSquared(from) > 4)) return out;
          }
          if (from && flightNav.pointClear(from)) return out.copy(from);
          throw new Error('Không tìm được điểm bay an toàn cho bướm.');
        }
        // ---- BƯỚM SÀ QUANH NGƯỜI (dời 01/11 khỏi engineer/mind/env-react.js): bướm hay sà quanh người (áo sáng màu, mồ hôi) — ~1/4 số lần chọn điểm bay mới thì
        //      chọn quanh kỹ sư đang ở ngoài trời (cách 0,6–1,8 đv, ngang ngực – đầu), nhìn mặt kỹ sư (worldSee('engineer')) ----
        const _bfL = new THREE.Vector3();
        function bflyLure(bf) {
          const E = worldSee('engineer'); if (!E || !E.outside || liveWeather.state.raining || Math.random() > 0.25 || !flightNav) return false;
          const p = E.pos; if (Math.hypot(p.x - bf.pos.x, p.z - bf.pos.z) > 30) return false;
          for (let k = 0; k < 12; k++) {
            const a = Math.random() * TAU, r = 0.6 + Math.random() * 1.2, x = p.x + Math.cos(a) * r, z = p.z + Math.sin(a) * r;
            _bfL.set(x, flightNav.ground(x, z) + 1.1 + Math.random() * 0.8, z); flightNav.snapToVoxel(_bfL, _bfL);
            if (flightNav.pointClear(_bfL) && _bfL.distanceToSquared(bf.pos) > 4) { bf.target.copy(_bfL); return true; }
          }
          return false;
        }
        function nextButterflyTarget(bf) {
          if (!bflyLure(bf)) pickBflyTarget(bf.pos, bf.target);   // ~1/4 số lần: bay tới quanh kỹ sư đang ở ngoài trời (bflyLure)
        }
        for (let n = 0; n < 6; n++) {
          const sp = BF_SP[n], bt = butterfly(sp);
          const startP = pickBflyTarget(); bt.g.position.copy(startP); scene.add(bt.g);
          // bướm bay chậm 30% (cả lúc tìm hoa lẫn lúc đi trú mưa)
          butterflies.push({ g: bt.g, wL: bt.wingL, wR: bt.wingR, pos: startP.clone(), target: pickBflyTarget(startP), spd: (1.6 + Math.random() * 0.9) * 0.9 * 0.7, ph: Math.random() * 6.28,
            hz: sp[4], glide: sp[5], fph: Math.random() * TAU, glideT: 0, nextGlide: TAU * (2 + Math.random() * 4), ang: 0.4,
            reroute() { nextButterflyTarget(this); } });   // lưới bay (animals/_lib/insect-flight.js): kẹt ⇒ chọn điểm bay khác
        }
        function bflyFlap(bf, dt, k = 1) {   // vỗ – lượn; trả về độ nhấp nhô thân (vỗ xuống nâng thân) · k: hệ số nhịp (vội tránh mưa vỗ nhanh hơn)
          if (bf.glideT > 0) { bf.glideT -= dt; bf.ang += (0.22 - bf.ang) * Math.min(1, dt * 9); }   // lượn: cánh phẳng hơi nâng
          else {
            bf.fph += dt * bf.hz * k * TAU; bf.ang = 0.46 + 0.86 * Math.cos(bf.fph);
            if (bf.glide && bf.fph > bf.nextGlide && Math.cos(bf.fph) < 0.2) { bf.glideT = bf.glide[0] + Math.random() * (bf.glide[1] - bf.glide[0]); bf.nextGlide = bf.fph + TAU * (4 + Math.random() * 5); }
          }
          const lag = bf.glideT > 0 ? 0 : 0.46 + 0.86 * Math.cos(bf.fph - 0.45) - bf.ang;   // cánh sau trễ pha cánh trước
          bf.wL.rotation.z = bf.ang; bf.wR.rotation.z = -bf.ang; bf.wL.userData.hind.rotation.z = bf.wR.userData.hind.rotation.z = lag;
          return bf.glideT > 0 ? 0 : 0.045 * Math.sin(bf.fph);
        }
        // ---- trú mưa của bướm: mỗi con 1 chỗ đậu riêng trên mặt cành chính cây cổ thụ (dưới tán; chừa cành sông cho cò) ----
        {
          oldTreeGroup.updateMatrixWorld(true);
          const bark = []; oldTreeGroup.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.material?.color?.getHex() === 0x4a3420) bark.push(o); });
          const ray = new THREE.Raycaster(), down = new THREE.Vector3(0, -1, 0), mb = oldTreeGroup.userData.mainBranches;
          butterflies.forEach((bf, k) => {
            const br = mb[1 + (k % 4)], f = 0.3 + 0.35 * ((k / 4) | 0) + 0.1 * (k % 2), sf = f * (br.length - 1), i0 = Math.min(br.length - 2, Math.floor(sf));
            const P = br[i0].clone().lerp(br[i0 + 1], sf - i0).applyMatrix4(oldTreeGroup.matrixWorld);
            ray.set(new THREE.Vector3(P.x, P.y + 2, P.z), down); ray.far = 3.5;
            const hit = ray.intersectObjects(bark, false).find(h => Math.abs(h.point.y - P.y) < 1.2);   // bám đúng mặt trên vỏ cành
            bf.perch = hit ? hit.point.clone().setY(hit.point.y + 0.03) : P.setY(P.y + 0.35);
            bf.perchYaw = Math.random() * 6.28; bf.mode = 'nav'; bf.vis = new THREE.Vector3(); bf.back = new THREE.Vector3();
          });
        }
        const _bfSway = new THREE.Vector3();
        function bflyShelter(bf, dt, t, rain) {   // true = đang trong lộ trình trú mưa (tự lo vị trí + cánh)
          if (rain && bf.mode !== 'toPerch' && bf.mode !== 'perched') { if (bf.mode === 'nav') bf.vis.copy(bf.g.position); bf.mode = 'toPerch'; }
          else if (!rain && (bf.mode === 'toPerch' || bf.mode === 'perched')) bf.mode = 'fromPerch';
          if (bf.mode === 'nav') return false;
          if (bf.mode === 'perched') {   // khép cánh dựng đứng, thỉnh thoảng hé cánh rũ nước
            bf.g.position.copy(bf.perch).add(treeWindAt(oldTreeWind, bf.perch, _bfSway)); bf.g.rotation.y = bf.perchYaw;   // đậu trên cành: đung đưa theo cành
            const fold = 1.38 - Math.pow(Math.max(0, Math.sin(t * 0.5 + bf.ph)), 12) * 0.9; bf.wL.rotation.z = fold; bf.wR.rotation.z = -fold; bf.wL.userData.hind.rotation.z = bf.wR.userData.hind.rotation.z = 0;
            return true;
          }
          const goal = bf.mode === 'toPerch' ? bf.perch : flightNav.visualPosition(bf.pos, insectOffset.set(0, 0, 0), bf.back);   // tạnh: bay về đúng điểm dẫn đường cũ
          const dx = goal.x - bf.vis.x, dy = goal.y - bf.vis.y, dz = goal.z - bf.vis.z, dd = Math.hypot(dx, dy, dz);
          if (dd < 0.03) { if (bf.mode === 'toPerch') bf.mode = 'perched'; else { bf.mode = 'nav'; nextButterflyTarget(bf); } return true; }
          const step = Math.min(dd, bf.spd * 1.4 * dt); bf.vis.x += dx / dd * step; bf.vis.y += dy / dd * step; bf.vis.z += dz / dd * step;
          const wob = Math.min(1, dd * 0.8);   // lượn nhẹ khi còn xa, sát chỗ đậu thì vào thẳng
          bf.g.position.set(bf.vis.x + Math.cos(t * 2 + bf.ph) * 0.12 * wob, bf.vis.y + Math.sin(t * 3.5 + bf.ph) * 0.18 * wob, bf.vis.z);
          let turn = Math.atan2(dx, dz) - bf.g.rotation.y; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); bf.g.rotation.y += turn * Math.min(1, dt * 5);
          bflyFlap(bf, dt, 1.3);   // vỗ nhanh hơn khi vội tránh mưa
          return true;
        }

        // MỖI KHUNG khi côn trùng thức (loop/main-loop-rest.js, trước ong): bướm đậu tay kỹ sư / trú mưa / bay – vỗ – lượn — dời nguyên văn khỏi vòng lặp
        // ---- BƯỚM ĐẬU TAY KỸ SƯ (dời 01/11 khỏi engineer/mind/env-react.js): kỹ sư đứng yên / ngồi nghỉ chìa tay mời 1 con (mặt kỹ sư: handOffer { bf, dur }) —
        //      con được mời tự nhận lời, bay tới lòng bàn tay (palm), đậu khi tay đã chìa hẳn (palmReady), khép mở cánh; đậu đủ dur giây / 6 s chưa tới / kỹ sư
        //      rút lời mời / hạ tay / mưa ⇒ tự bay đi. Việc của nó nêu ở bf.hand { st: to | on, k, of } — kỹ sư nhìn đó mà nói, hạ tay (env-react.js envBflySync) ----
        const _bfHp = new THREE.Vector3();
        function bflyHandLeave(bf, mode) { bf.hand = null; bf.mode = mode; bf.vis.copy(bf.g.position); }   // về đường bay cũ (bflyShelter 'fromPerch') / đi trú mưa ('toPerch')
        function bflyHand(bf, dt, t, E, O) {   // true = đang bay tới / đậu trên tay kỹ sư (tự lo vị trí + cánh) · E: mặt kỹ sư, O: lời mời
          let S = bf.hand;
          if (!S) { if (!O || O.bf !== bf || bf.handOf === O) return false; S = bf.hand = { st: 'to', k: 0, of: O }; bf.handOf = O; bf.mode = 'hand'; }   // được mời: nhận lời
          if (O !== S.of) { bflyHandLeave(bf, 'fromPerch'); return false; }   // kỹ sư thôi mời / mời con khác
          if (liveWeather.state.raining) { bflyHandLeave(bf, 'toPerch'); return false; }   // mưa: đi trú như mọi con
          if (!E.handOut) { bflyHandLeave(bf, 'fromPerch'); return false; }   // tay đã hạ / vào xe
          S.k += dt; const hp = E.palm(_bfHp);
          if (S.st === 'to') {
            const p = bf.g.position, dx = hp.x - p.x, dy = hp.y - p.y, dz = hp.z - p.z, dd = Math.hypot(dx, dy, dz);
            if (dd < 0.02 && E.palmReady) { S.st = 'on'; S.k = 0; }
            else if (S.k > 6) { bflyHandLeave(bf, 'fromPerch'); return false; }
            else {
              const s = Math.min(dd, bf.spd * (dd < 0.4 ? 0.6 : 1.2) * dt), wob = Math.min(1, dd * 1.2);   // lượn vòng nhỏ, sát tay thì vào thẳng, chậm lại
              p.set(p.x + dx / dd * s + Math.cos(t * 2.3 + bf.ph) * 0.006 * wob, p.y + dy / dd * s + Math.sin(t * 3.7 + bf.ph) * 0.01 * wob, p.z + dz / dd * s);
              let turn = Math.atan2(dx, dz) - bf.g.rotation.y; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); bf.g.rotation.y += turn * Math.min(1, dt * 5);
              bflyFlap(bf, dt, dd < 0.3 ? 0.8 : 1.1);
            }
          } else {   // đậu: theo tay, cánh khép dựng rồi thỉnh thoảng mở phẳng phơi nắng
            bf.g.position.copy(hp); bf.g.rotation.y += 0.15 * dt;
            const o = Math.pow(0.5 + 0.5 * Math.sin(S.k * 1.7 + bf.ph), 3), a = 1.3 - 1.15 * o;
            bf.wL.rotation.z = a; bf.wR.rotation.z = -a; bf.wL.userData.hind.rotation.z = bf.wR.userData.hind.rotation.z = 0;
            if (S.k > O.dur) { bflyHandLeave(bf, 'fromPerch'); return false; }
          }
          return true;
        }

        worldTick('insects', 10, (dt, t, awake) => { if (awake) butterfliesTick(dt, t, liveWeather.state.raining); });   // MỖI KHUNG (sổ tick core/world.js): bướm — chỉ khi trời cho côn trùng ra
        function butterfliesTick(dt, t, rainNow) {
          const E = worldSee('engineer'), O = E && E.handOffer, SW = worldSee('raccoon')?.swipe;   // kỹ sư đang mời con nào · gấu mèo vừa vồ con nào
          for (const bf of butterflies) {
            if (SW && SW.prey === bf && bf.dodged !== SW) { bf.dodged = SW; nextButterflyTarget(bf); }   // gấu mèo vồ trúng mình: bay sang chỗ khác
            if (bflyHand(bf, dt, t, E, O)) continue;   // được mời / đang bay tới / đậu trên tay kỹ sư
            if (bflyShelter(bf, dt, t, rainNow)) continue;   // mưa: đậu cành cây cổ thụ
            if (animateInsectFlight(bf, dt) === 'arrived') nextButterflyTarget(bf);
            const beat = bflyFlap(bf, dt), bobY = Math.sin(t * 3.5 + bf.ph) * 0.18 + beat, bobX = Math.cos(t * 2.0 + bf.ph) * 0.12;   // vỗ – lượn theo loài, thân nhấp nhô theo nhịp
            setInsectVisualPosition(bf, bobX, bobY);
          }
        }
        worldJoin('dayNight', 20, G => { for (const b of butterflies) G.day.add(b.g); });   // bướm ẩn đêm cùng động vật ban ngày (core/day-night.js)
