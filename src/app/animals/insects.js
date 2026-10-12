        // ---- fireflies (3 gray bees with glowing tail box) ----
        const fireflies = [];
        function fireflyTex() { const c = document.createElement('canvas'); c.width = c.height = 32; const x = c.getContext('2d'); const g = x.createRadialGradient(16, 16, 0, 16, 16, 16); g.addColorStop(0, 'rgba(228,255,150,1)'); g.addColorStop(0.4, 'rgba(186,240,96,0.55)'); g.addColorStop(1, 'rgba(186,240,96,0)'); x.fillStyle = g; x.fillRect(0, 0, 32, 32); return new THREE.CanvasTexture(c); }
        const ffMap = fireflyTex();
        function createGlowingBee() {
          const g = new THREE.Group(), grayMat = new THREE.MeshLambertMaterial({ color: 0x5a5a5a }), stripeMat = new THREE.MeshLambertMaterial({ color: 0x828282 }), faceMat = new THREE.MeshLambertMaterial({ color: 0x333333 }), whiteMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.75, side: THREE.DoubleSide }), glowMat = new THREE.MeshBasicMaterial({ color: 0xe4ff88 });
          const body = bx(0.1, 0.08, 0.2, grayMat); body.castShadow = true; g.add(body);
          const stripe = bx(0.105, 0.085, 0.08, stripeMat); stripe.position.z = 0.02; g.add(stripe);
          const face = bx(0.09, 0.07, 0.02, faceMat); face.position.z = 0.11; g.add(face);
          const glowTail = bx(0.08, 0.06, 0.08, glowMat); glowTail.position.set(0, -0.01, -0.12); g.add(glowTail);
          const glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: ffMap, color: 0xe4ff88, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
          glowSprite.scale.set(0.5, 0.5, 1); glowSprite.position.set(0, -0.01, -0.16); g.add(glowSprite);
          const wingL = bx(0.18, 0.01, 0.12, whiteMat); wingL.position.set(0.06, 0.04, 0); g.add(wingL);
          const wingR = bx(0.18, 0.01, 0.12, whiteMat); wingR.position.set(-0.06, 0.04, 0); g.add(wingR);
          wingL.userData.noBake = wingR.userData.noBake = true; bakeStatic(g);   // thân đom đóm gộp, cánh + sprite phát sáng giữ động
          g.scale.setScalar(0.675 * NATURE_SCALE); return { g, wingL, wingR, glowSprite };
        }
        for (let n = 0; n < 3; n++) {
          const bee = createGlowingBee(); const i = (14 + n * 9) * S, j = (34 + n * 2) * S; const base = new THREE.Vector3(wx(i), surfaceY(i, j) + 2.0, wz(j));
          bee.g.position.copy(base); scene.add(bee.g);
          fireflies.push({ g: bee.g, wL: bee.wingL, wR: bee.wingR, sp: bee.glowSprite, base: base.clone(), target: base.clone(), timer: 2.0 + Math.random() * 3.0, ph: Math.random() * 6.28, r: 1.7 + Math.random() * 1.3, spd: 0.35 + Math.random() * 0.3, state: 'moving', currentSpd: 0 });
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

        // ---- bươm bướm ----
        const butterflyColors = [0xff5577, 0xffb700, 0x33ccee];
        function butterfly(col, isBlue) {   // bươm bướm kiểu MINECRAFT: thân hộp + đầu vuông + râu + cánh tấm dẹt có đốm
          const g = new THREE.Group();
          const bMat = new THREE.MeshLambertMaterial({ color: isBlue ? 0x6e5c54 : 0x2b2320 });
          const wMat = new THREE.MeshLambertMaterial({ color: col, side: THREE.DoubleSide });
          const sMat = new THREE.MeshLambertMaterial({ color: isBlue ? 0x2244bb : 0x1a1512 });
          const body = bx(0.06, 0.06, 0.3, bMat); g.add(body);
          const head = bx(0.08, 0.08, 0.08, bMat); head.position.z = 0.18; g.add(head);
          const aMat = isBlue ? new THREE.MeshLambertMaterial({ color: 0x00a8e8 }) : sMat;
          for (const sx of [-1, 1]) { const ant = bx(0.012, 0.012, 0.14, aMat); ant.position.set(sx * 0.03, 0.06, 0.26); ant.rotation.x = -0.5; g.add(ant); }
          const mkWing = (side) => {
            const w = new THREE.Group(); w.position.set(side * 0.03, 0.02, 0);
            const fore = bx(0.3, 0.001, 0.22, wMat); fore.position.set(side * 0.16, 0, 0.06); w.add(fore);
            const hind = bx(0.22, 0.001, 0.16, isBlue ? sMat : wMat); hind.position.set(side * 0.12, 0, -0.1); w.add(hind);
            const spot = bx(0.08, 0.0012, 0.08, isBlue ? wMat : sMat); spot.position.set(side * 0.19, 0.0002, 0.06); w.add(spot);
            g.add(w); return w;
          };
          const wingL = mkWing(1), wingR = mkWing(-1);
          wingL.userData.noBake = wingR.userData.noBake = true; bakeStatic(g);   // thân+đầu+râu gộp, 2 cánh giữ động để vẫy
          g.scale.setScalar((isBlue ? 0.81 : 0.765) * NATURE_SCALE); return { g, wingL, wingR };
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
          const isBlue = n >= 4;
          const bt = butterfly(isBlue ? 0x1ab2ff : butterflyColors[n % butterflyColors.length], isBlue);
          const startP = pickBflyTarget(); bt.g.position.copy(startP); scene.add(bt.g);
          butterflies.push({ g: bt.g, wL: bt.wingL, wR: bt.wingR, pos: startP.clone(), target: pickBflyTarget(startP), spd: (1.6 + Math.random() * 0.9) * 0.9, ph: Math.random() * 6.28 });
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
            const fold = 1.38 - Math.pow(Math.max(0, Math.sin(t * 0.5 + bf.ph)), 12) * 0.9; bf.wL.rotation.z = fold; bf.wR.rotation.z = -fold;
            return true;
          }
          const goal = bf.mode === 'toPerch' ? bf.perch : flightNav.visualPosition(bf.pos, insectOffset.set(0, 0, 0), bf.back);   // tạnh: bay về đúng điểm dẫn đường cũ
          const dx = goal.x - bf.vis.x, dy = goal.y - bf.vis.y, dz = goal.z - bf.vis.z, dd = Math.hypot(dx, dy, dz);
          if (dd < 0.03) { if (bf.mode === 'toPerch') bf.mode = 'perched'; else { bf.mode = 'nav'; nextButterflyTarget(bf); } return true; }
          const step = Math.min(dd, bf.spd * 1.4 * dt); bf.vis.x += dx / dd * step; bf.vis.y += dy / dd * step; bf.vis.z += dz / dd * step;
          const wob = Math.min(1, dd * 0.8);   // lượn nhẹ khi còn xa, sát chỗ đậu thì vào thẳng
          bf.g.position.set(bf.vis.x + Math.cos(t * 2 + bf.ph) * 0.12 * wob, bf.vis.y + Math.sin(t * 3.5 + bf.ph) * 0.18 * wob, bf.vis.z);
          let turn = Math.atan2(dx, dz) - bf.g.rotation.y; turn = Math.atan2(Math.sin(turn), Math.cos(turn)); bf.g.rotation.y += turn * Math.min(1, dt * 5);
          const flap = Math.sin(t * 9.5 + bf.ph) * 0.72; bf.wL.rotation.z = flap; bf.wR.rotation.z = -flap;   // vỗ nhanh hơn khi vội tránh mưa
          return true;
        }

        // ---- Ong bay tới hoa, hút mật và mang về tổ ----
        function createMinecraftBee() {
          const g = new THREE.Group(), yellowMat = new THREE.MeshLambertMaterial({ color: 0xffd13b }), darkMat = new THREE.MeshLambertMaterial({ color: 0x2b1e17 }), whiteMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.75, side: THREE.DoubleSide });
          const body = bx(0.1, 0.08, 0.3, yellowMat); body.castShadow = true; g.add(body);
          const stripe = bx(0.105, 0.085, 0.12, darkMat); stripe.position.z = -0.06; g.add(stripe);
          const face = bx(0.09, 0.07, 0.02, darkMat); face.position.z = 0.15; g.add(face);
          const wingL = bx(0.18, 0.01, 0.12, whiteMat); wingL.position.set(0.06, 0.04, 0); g.add(wingL);
          const wingR = bx(0.18, 0.01, 0.12, whiteMat); wingR.position.set(-0.06, 0.04, 0); g.add(wingR);
          wingL.userData.noBake = wingR.userData.noBake = true; bakeStatic(g);   // thân+sọc+mặt gộp, 2 cánh giữ động
          g.scale.setScalar(0.75 * NATURE_SCALE); return { g, wingL, wingR };
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
        const hiveWorldPos = new THREE.Vector3(-25.5, 9.2, 19.713);
        {
          const smallSubTreeGroup = scene.getObjectByName('Cây con (Small Sub-Tree)');
          if (smallSubTreeGroup && smallSubTreeGroup.userData.hiveGroup) {
            smallSubTreeGroup.updateMatrixWorld(true);
            const hive = smallSubTreeGroup.userData.hiveGroup;
            hive.localToWorld(hiveWorldPos.set(0, -0.19, 0));
            hiveWorldPos.y -= flightNav.clearance + 0.08;
          }
        }
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
          spr.scale.set(0.9, 0.45, 1); spr.position.set(0, 0.36, 0);
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
        for (let n = 0; n < 8; n++) {
          const bee = createMinecraftBee();
          // Ong bắt đầu tại tổ hoặc hoa
          const startP = Math.random() < 0.3 ? hiveWorldPos.clone() : pickBeeFlowerTarget();
          bee.g.position.copy(startP); scene.add(bee.g);
          const bb = {
            g: bee.g,
            wL: bee.wingL,
            wR: bee.wingR,
            pos: startP.clone(),
            target: pickBeeFlowerTarget(startP),
            spd: 1.2 + Math.random() * 0.6,
            ph: Math.random() * 6.28,
            hoverTmr: 0, nectarFlower: null, flowerRetryTmr: 0,
            state: 'foraging', // 'foraging', 'returning', 'depositing'
            flowersVisited: 0, // mỗi lượt hút mật ở hoa tăng 10%; đủ 100% về tổ
            lbl: beeLabel(), lastPct: -1
          };
          bb.g.add(bb.lbl.spr); setBeePct(bb); bees.push(bb);
        }

        // Daytime wildlife and nocturnal fireflies use the selected city's local clock.
        // Identity parents preserve world positions and each animal's own visibility state.
        const daytimeAnimals = new THREE.Group(), nighttimeFireflies = new THREE.Group();
        daytimeAnimals.name = 'Động vật ban ngày'; nighttimeFireflies.name = 'Đom đóm ban đêm';
        scene.add(daytimeAnimals, nighttimeFireflies);
        for (const group of [fishies, bunnies, butterflies, bees]) for (const animal of group) daytimeAnimals.add(animal.g);   // bò không ẩn ban đêm: về ngủ trong chuồng
        for (const animal of [stag?.g, crab?.g, raccoonObj]) if (animal) daytimeAnimals.add(animal);   // chó không ẩn ban đêm: vào ngủ trong caravan
        for (const firefly of fireflies) nighttimeFireflies.add(firefly.g);
        function updateAnimalVisibility() {
          const isNight = !liveWeather.wildlifeAwake; // Animals return at 06:00 and rest at 18:30 in Pleiku.
          daytimeAnimals.visible = !isNight; nighttimeFireflies.visible = isNight;
        }
        updateAnimalVisibility();

