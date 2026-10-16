        // ---- ĐOM ĐÓM (G 15/10: "study and improve đom đóm" — theo mẫu "Metal FireFly Final" của PJ/jpvamp, Sketchfab, CC-BY-4.0; chỉ đo + họ Lampyridae thật):
        //      thân thon dẹt; khiên ngực che đầu (cam, đốm sẫm giữa); mắt hổ phách to (mắt "đá quý" của mẫu); râu dài 2 đốt; cánh cứng sẫm viền vàng nhạt có
        //      2 gân đồng (gợi lồng cánh kim loại của mẫu) nâng chếch khi bay; cánh màng trong ~30% vỗ nhanh; 2 đốt bụng cuối là ĐÈN (ngà khi tắt → vàng
        //      xanh rực khi chớp); 6 chân mảnh. Nháy kiểu Luciola: chớp ~0,5 s mỗi 2–2,6 s, giữa các lần chỉ le lói; lúc chớp bay vọt nhẹ lên (nét "J");
        //      con gần nhau kéo nhịp về đồng bộ dần (ghép pha xung kiểu Mirollo–Strogatz) ----
        const fireflies = [];
        function fireflyTex() { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(228,255,150,1)'); g.addColorStop(0.4, 'rgba(186,240,96,0.55)'); g.addColorStop(1, 'rgba(186,240,96,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); }
        const ffMap = fireflyTex();
        function createFirefly() {
          const g = new THREE.Group(), dark = new THREE.MeshLambertMaterial({ color: 0x1f1913, flatShading: true }), vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
          const paint = (geo, f) => { const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { const k = new THREE.Color(f(p.getX(i), p.getY(i), p.getZ(i))); c.push(k.r, k.g, k.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); return geo; };
          const ab = new THREE.SphereGeometry(1, 10, 6); ab.scale(0.034, 0.02, 0.072); ab.translate(0, -0.004, -0.045); g.add(new THREE.Mesh(paint(ab, (x, y, z) => (Math.floor((z + 0.12) / 0.018) & 1) ? 0x3a2c1c : 0x2a2016), vc));   // bụng đốt
          const lampM = new THREE.MeshBasicMaterial({ color: 0xd9d2a8 });
          const lamp = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), lampM); lamp.scale.set(0.031, 0.018, 0.034); lamp.position.set(0, -0.007, -0.098); g.add(lamp);   // 2 đốt đèn cuối bụng
          const pr = new THREE.SphereGeometry(1, 10, 5, 0, TAU, 0, Math.PI / 2); pr.scale(0.04, 0.017, 0.036); pr.translate(0, 0.004, 0.058);
          g.add(new THREE.Mesh(paint(pr, (x, y, z) => Math.hypot(x / 0.4, (z - 0.06) / 0.5) < 0.03 ? 0x2a1d14 : 0xe8823a), vc));   // khiên ngực cam, đốm sẫm giữa
          const hd = new THREE.Mesh(new THREE.SphereGeometry(0.017, 7, 5), dark); hd.position.set(0, -0.004, 0.092); g.add(hd);
          const eyeM = new THREE.MeshPhongMaterial({ color: 0xc8902c, shininess: 90, specular: 0x887755 });
          for (const sx of [-1, 1]) {
            const e = new THREE.Mesh(new THREE.SphereGeometry(0.011, 7, 5), eyeM); e.position.set(sx * 0.015, -0.002, 0.097); g.add(e);   // mắt hổ phách
            rodBetween(g, new THREE.Vector3(sx * 0.007, 0.002, 0.108), new THREE.Vector3(sx * 0.026, 0.024, 0.15), 0.0028, dark, 4, false);
            rodBetween(g, new THREE.Vector3(sx * 0.026, 0.024, 0.15), new THREE.Vector3(sx * 0.04, 0.03, 0.2), 0.0022, dark, 4, false);   // râu
            for (const z of [0.06, 0.035, 0.01]) { const k = new THREE.Vector3(sx * 0.05, -0.022, z - 0.008); rodBetween(g, new THREE.Vector3(sx * 0.015, -0.012, z), k, 0.0032, dark, 3, false); rodBetween(g, k, new THREE.Vector3(sx * 0.06, -0.05, z - 0.03), 0.0024, dark, 3, false); }   // 6 chân
          }
          const elyG = new THREE.SphereGeometry(1, 8, 5, 0, TAU, 0, Math.PI / 2); elyG.scale(0.022, 0.011, 0.082); elyG.translate(0.02, 0, -0.072);   // cánh cứng: vỏ nửa elip, khớp ở gốc (z = 0)
          paint(elyG, (x) => { const u = (x - 0.002) / 0.04; return u > 0.86 || u < 0.05 ? 0xd9c27a : Math.abs(u - 0.35) < 0.05 || Math.abs(u - 0.62) < 0.05 ? 0xb07a3a : 0x2a2218; });   // viền vàng nhạt + 2 gân đồng
          const wingM = new THREE.MeshLambertMaterial({ color: 0xc8d0d6, transparent: true, opacity: 0.3, side: THREE.DoubleSide, depthWrite: false });
          const blade = (len, w) => { const sh = new THREE.Shape(); sh.moveTo(0, 0); sh.bezierCurveTo(len * 0.3, w, len * 0.9, w * 0.8, len, 0); sh.bezierCurveTo(len * 0.85, -w * 0.45, len * 0.3, -w * 0.4, 0, 0); const gg = new THREE.ShapeGeometry(sh, 6); gg.rotateX(Math.PI / 2); return gg; };
          const side = (sx) => { const s = new THREE.Group(); s.scale.x = sx; s.position.y = 0.014; g.add(s); return s; };
          const els = [], wings = [];
          for (const sx of [1, -1]) {
            const S = side(sx), el = new THREE.Group(); el.position.set(0.004, 0, 0.03); S.add(el); el.add(new THREE.Mesh(elyG, vc)); els.push(el);   // nâng chếch khi bay
            const w = new THREE.Group(); w.position.set(0.01, 0, 0.012); S.add(w); const m = new THREE.Mesh(blade(0.13, 0.04), wingM); m.rotation.y = 0.55; w.add(m); wings.push(w);
          }
          const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: ffMap, color: 0xe4ff88, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
          glowSprite.scale.set(0.5, 0.5, 1); glowSprite.position.set(0, -0.01, -0.105); g.add(glowSprite);
          for (const o of [...els, ...wings, glowSprite, lamp]) o.userData.noBake = true;
          bakeStatic(g);   // thân + khiên + chân + râu gộp; cánh cứng, cánh màng, đèn, quầng sáng giữ động
          g.scale.setScalar(0.62 * NATURE_SCALE); return { g, wingL: wings[0], wingR: wings[1], elL: els[0], elR: els[1], lampM, glowSprite };
        }
        for (let n = 0; n < 9; n++) {   // 9 con rải 3 cụm trên bãi cỏ (trước chỉ 3)
          const ff = createFirefly(), i = (12 + (n % 3) * 9 + Math.random() * 3) * S, j = (32 + ((n / 3) | 0) * 3 + Math.random() * 2) * S, base = new THREE.Vector3(wx(i), surfaceY(i, j) + 1.2 + Math.random() * 1.2, wz(j));
          ff.g.position.copy(base); scene.add(ff.g);
          fireflies.push({ g: ff.g, wL: ff.wingL, wR: ff.wingR, elL: ff.elL, elR: ff.elR, lampM: ff.lampM, sp: ff.glowSprite, base: base.clone(), target: base.clone(), timer: 2.0 + Math.random() * 3.0, ph: Math.random() * 6.28, r: 1.7 + Math.random() * 1.3, spd: 0.35 + Math.random() * 0.3, state: 'moving', currentSpd: 0,
            per: 2.0 + Math.random() * 0.6, fp: Math.random(), fl: 9 });   // chu kỳ gần nhau (2,0–2,6 s) ⇒ ghép xung đủ kéo các con gần nhau về cùng nhịp
        }

        const flightRootNames = new Set([
          'Trạm thủy điện (Hydro Dam)', 'Cánh đồng pin mặt trời (Solar Farm)',
          'Nhà điều hành hai tầng', 'Xưởng bảo trì', 'Nhà thiết bị & dịch vụ',
          'Bồn chứa nước (Water Silo)', 'Trạm biến áp (Substation)', 'Cụm pin lưu trữ (Battery Storage)',
          'Gốc cây nhỏ rải rác (Small Stump)', 'Khúc gỗ đứng (Wood Post)',
          'Cây anh đào (Cherry Blossom Tree)', 'Cây cổ thụ (Old Tree)',
          'Nhà kho mái pin mặt trời (Solar Warehouse)', 'Bồn nước nông thôn (Rural Water Tank)',
          'Xe Caravan (Motorhome)', 'Ghế câu cá (Fishing Chair)', 'Ghế cắm trại (Camp Chair)',
          'Bàn trà (Camp Table)', 'Đống củi (Woodpile)', 'Giá treo nồi (Pot Hanger)'
        ]);
        for (const root of scene.children) {
          if (flightRootNames.has(root.name) || root.name.startsWith('Tua-bin gió #') || root.name.startsWith('Cột điện #')) flightRoots.push(root);
        }
        flightRoots.push(wmast.g, wmini.g, ...streetLamps.map(l => l.g), cowHut.g);
        let safeFlowerCoords;
        // Shared, bounded flower supply: two completed sips, then 30 real seconds to refill.
        flowerNectar = new Map();
        for (const flower of flowerCoords) flowerNectar.set(flower, { remaining: 2, reserved: 0, readyAt: 0 });
        function flowerNectarState(flower, now = Date.now()) {
          const supply = flowerNectar?.get(flower);
          if (supply && supply.readyAt > 0 && now >= supply.readyAt) {
            supply.remaining = 2; supply.readyAt = 0;
          }
          return supply;
        }
        function flowerHasNectar(flower, now = Date.now()) {
          const supply = flowerNectarState(flower, now);
          return !!supply && supply.remaining > supply.reserved;
        }
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
        function refreshFlightNavigation() {
          const boxes = [], matrix = new THREE.Matrix4(), local = new THREE.Matrix4();
          scene.updateMatrixWorld(true);
          for (const root of flightRoots) root.traverse(obj => {
            if (!obj.isMesh || !obj.geometry) return;
            if (!obj.geometry.boundingBox) obj.geometry.computeBoundingBox();
            if (obj.isInstancedMesh) {
              const clusters = new Map(), center = new THREE.Vector3();
              for (let i = 0; i < obj.count; i++) {
                obj.getMatrixAt(i, local); matrix.multiplyMatrices(obj.matrixWorld, local);
                const box = obj.geometry.boundingBox.clone().applyMatrix4(matrix);
                if (flightRoots.includes(obj)) boxes.push(box);
                else {
                  // Small world-space leaf clusters leave real gaps beneath leaning canopies.
                  box.getCenter(center);
                  const key = Math.floor(center.x) + ',' + Math.floor(center.y) + ',' + Math.floor(center.z);
                  if (clusters.has(key)) clusters.get(key).union(box); else clusters.set(key, box);
                }
              }
              boxes.push(...clusters.values());
            } else {
              const packed = bakedFlightBounds.get(obj.geometry);
              if (packed) {
                for (let i = 0; i < packed.length; i += 6) {
                  boxes.push(new THREE.Box3(new THREE.Vector3(packed[i], packed[i + 1], packed[i + 2]), new THREE.Vector3(packed[i + 3], packed[i + 4], packed[i + 5])).applyMatrix4(obj.matrixWorld));
                }
              } else {
                boxes.push(obj.geometry.boundingBox.clone().applyMatrix4(obj.matrixWorld));
              }
            }
          });
          for (const ob of obstacleCoords) {
            boxes.push(new THREE.Box3(new THREE.Vector3(ob.x - ob.r, ob.y, ob.z - ob.r), new THREE.Vector3(ob.x + ob.r, ob.y + ob.h, ob.z + ob.r)));
          }
          const next = createFlightNavigator({ minX: wx(2), maxX: wx(GX - 3), minZ: wz(2), maxZ: wz(GZ - 3) }, cowY, boxes,
            { cell: BLOCK, originX: wx(0) - BLOCK / 2, originZ: wz(0) - BLOCK / 2 });
          const flowers = flowerCoords.filter(f => next.pointClear(f));
          if (!flowers.length) { next.dispose(); throw new Error('Không có hoa với lối tiếp cận an toàn cho ong/bướm.'); }
          flightNav?.dispose();
          flightNav = next; safeFlowerCoords = flowers;
          for (const group of [bees, butterflies]) for (const insect of group) {
            insect.flight = null; insect.blockedFor = 0;
            if (insect.state === 'foraging') { cancelBeeNectar(insect); pickBeeFlowerTarget(insect.pos, insect.target); }
          }
        }
        refreshFlightNavigation();

        // ---- BƯƠM BƯỚM (G 15/10 "study and improve butterfly" — không kèm mẫu: dựng theo hình thái thật + 5 loài phổ biến ở Tây Nguyên) ----
        //  thân mảnh (ngực lông + bụng dài đốt), mắt kép to, râu dùi trống, vòi cuộn; cánh trước tam giác đỉnh nhọn, cánh sau tròn, hoa văn vẽ canvas
        //  theo loài + gân cánh toả từ gốc: Bướm giáp đỏ (Cethosia biblis) · Bướm hổ (Danaus chrysippus) · Phượng xanh lam (Graphium sarpedon) ·
        //  Bướm vàng (Eurema hecabe) · Bướm hổ xanh (Tirumala limniace). Bay: vỗ biên độ lớn (trên gần chạm nhau ~+75°, dưới ~−23°), cánh sau trễ pha
        //  cánh trước; loài hổ / phượng có pha LƯỢN cánh phẳng giữa các tràng vỗ; thân nhấp nhô theo từng nhịp (vỗ xuống nâng thân).
        const BF_SP = [   // [tên, nền cánh trước, nền cánh sau, màu thân, nhịp vỗ Hz (G 15/10: chậm 50% — trước 7 · 6 · 8 · 11 · 5,5 · 8), lượn (s) | null]
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
          g.scale.setScalar(0.78 * NATURE_SCALE); return { g, wingL, wingR };
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
        function nextButterflyTarget(bf) {
          pickBflyTarget(bf.pos, bf.target);
        }
        for (let n = 0; n < 6; n++) {
          const sp = BF_SP[n], bt = butterfly(sp);
          const startP = pickBflyTarget(); bt.g.position.copy(startP); scene.add(bt.g);
          // G 16/10: bướm bay chậm 30% (cả lúc tìm hoa lẫn lúc đi trú mưa)
          butterflies.push({ g: bt.g, wL: bt.wingL, wR: bt.wingR, pos: startP.clone(), target: pickBflyTarget(startP), spd: (1.6 + Math.random() * 0.9) * 0.9 * 0.7, ph: Math.random() * 6.28,
            hz: sp[4], glide: sp[5], fph: Math.random() * TAU, glideT: 0, nextGlide: TAU * (2 + Math.random() * 4), ang: 0.4 });
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
        function pickBeeFlowerTarget(from = null, out = new THREE.Vector3()) {
          const now = Date.now();
          if (!from) {
            const first = Math.floor(Math.random() * safeFlowerCoords.length);
            for (let n = 0; n < safeFlowerCoords.length; n++) {
              const flower = safeFlowerCoords[(first + n) % safeFlowerCoords.length];
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
            let score = d * (0.7 + Math.random() * 0.6);
            for (const bee of bees) if (bee.target.distanceToSquared(flower) < 0.01) score += 9;
            if (score < bestScore) { best = flower; bestScore = score; }
          }
          out.nectarFlower = best || fallback;
          return out.copy(out.nectarFlower || from);
        }
        const hiveWorldPos = beehive.mouth.clone(); hiveWorldPos.y -= flightNav.clearance + 0.08;   // ong đi / về ở miệng đáy giỏ rơm (animals/beehive.js)
        for (let k = 0; k < 40 && !flightNav.pointClear(hiveWorldPos); k++) hiveWorldPos.y -= 0.05;   // điểm dẫn đường phải là ô trống (tán cây cổ thụ chặn sát tổ ⇒ trước đây ong kẹt, không về được tổ); đoạn cuối lên vành miệng giỏ do pha "đáp" lo
        let hiveHoneyPct = 0;
        let hiveSprite, hiveCanvas, hiveTex;

        function createHiveLoadingBar() {
          hiveCanvas = document.createElement('canvas'); hiveCanvas.width = 128; hiveCanvas.height = 32;
          hiveTex = new THREE.CanvasTexture(hiveCanvas);
          hiveSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: hiveTex, transparent: true, depthWrite: false, depthTest: true }));
          hiveSprite.scale.set(1.4, 0.35, 1.0).multiplyScalar(NATURE_SCALE);
          hiveSprite.position.copy(hiveWorldPos).y -= 1.05 * NATURE_SCALE; // Hạ thanh bar xuống thêm một chút
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
          spr.scale.set(1.2, 0.6, 1); spr.position.set(0, 0.48, 0);   // ong còn 75% cỡ cũ ⇒ nhãn ×4/3 để giữ cỡ chữ cũ
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
        const _flyDir = new THREE.Vector3();
        function animateInsectFlight(agent, dt) {
          const status = flightNav.step(agent, dt);
          if (status === 'blocked') agent.blockedFor = (agent.blockedFor || 0) + dt;
          else agent.blockedFor = 0;
          if (agent.blockedFor >= 2 && agent.flight?.warned && agent.state !== 'returning') {
            if (agent.state) pickBeeFlowerTarget(agent.pos, agent.target);
            else nextButterflyTarget(agent);
            agent.blockedFor = 0;
          }
          const velocity = agent.flight?.velocity;
          if (velocity && Math.hypot(velocity.x, velocity.z) > 0.001) {
            let angle = Math.atan2(velocity.x, velocity.z) - agent.g.rotation.y;
            angle = Math.atan2(Math.sin(angle), Math.cos(angle));
            agent.g.rotation.y += angle * Math.min(1, dt * 5);
          }
          return status;
        }
        const insectVisual = new THREE.Vector3(), insectOffset = new THREE.Vector3();
        function setInsectVisualPosition(agent, x, y) {
          const p = flightNav.visualPosition(agent.pos, insectOffset.set(x, y, 0), insectVisual);
          agent.g.position.set(p.x, p.y, p.z);
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
        function beeTick(b, dt, t, ok) {
          const g = b.g, P = b.ph2 || 'fly', pk = Math.min(1, b.flowersVisited / 10);
          for (const m of b.pollen) { m.visible = pk > 0 && g.visible; m.scale.setScalar(0.5 + 0.8 * pk); }
          if (P === 'fly') {
            if (!ok && b.state !== 'returning') { cancelBeeNectar(b); b.hoverTmr = 0; b.state = 'returning'; b.target.copy(hiveWorldPos); setBeePct(b); }   // trở trời / chiều tối: về tổ
            beeFlap(b, t);
            if (b.state === 'foraging' && !b.target.nectarFlower) { if ((b.flowerRetryTmr -= dt) <= 0) { pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 1; } }   // hoa đều đang nghỉ: lượn chờ, 1 s thử lại
            else if (animateInsectFlight(b, dt) === 'arrived') {
              if (b.state === 'returning') { const a = Math.random() * TAU, R = beehive.rimR; b.rimA = a; beeTouch(b, beehive.mouth.clone().add(_bp.set(Math.cos(a) * R, 0.004, Math.sin(a) * R)), 'hive'); }
              else if (reserveBeeNectar(b)) { const F = b.nectarFlower; beeTouch(b, new THREE.Vector3(F.x, (F.top ?? F.y) + 0.012, F.z), 'flower'); }
              else { pickBeeFlowerTarget(b.pos, b.target); b.flowerRetryTmr = 1; }
            }
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
              b.state = b.flowersVisited >= 10 || !ok ? 'returning' : 'foraging'; if (b.state === 'returning') b.target.copy(hiveWorldPos); else pickBeeFlowerTarget(b.pos, b.target);
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

        // Daytime wildlife and nocturnal fireflies use the selected city's local clock.
        // Identity parents preserve world positions and each animal's own visibility state.
        const daytimeAnimals = new THREE.Group(), nighttimeFireflies = new THREE.Group();
        daytimeAnimals.name = 'Động vật ban ngày'; nighttimeFireflies.name = 'Đom đóm ban đêm';
        scene.add(daytimeAnimals, nighttimeFireflies);
        for (const group of [fishies, bunnies, butterflies, bees]) for (const animal of group) daytimeAnimals.add(animal.g);   // bò không ẩn ban đêm: về ngủ trong chuồng
        for (const animal of [stag?.g, crab?.g]) if (animal) daytimeAnimals.add(animal);   // gấu mèo hoạt động chạng vạng → đêm: tự ẩn/hiện (animals/raccoon-brain.js)   // chó không ẩn ban đêm: vào ngủ trong caravan
        for (const firefly of fireflies) nighttimeFireflies.add(firefly.g);
        function updateAnimalVisibility() {
          const isNight = !liveWeather.wildlifeAwake; // Animals return at 06:00 and rest at 18:30 in Pleiku.
          daytimeAnimals.visible = !isNight; nighttimeFireflies.visible = isNight;
        }
        updateAnimalVisibility();

