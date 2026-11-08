        // ---- LƯỚI BAY CÔN TRÙNG dùng chung (ong, bướm): gốc vật cản bay, dựng lại lưới (refreshFlightNavigation), bay theo lưới, gỡ kẹt, vị trí hiển thị ----
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
        flightRoots.push(wmast.g, wmini.g, ...streetLamps.map(l => l.g));
        worldServe('flight', { roots: flightRoots });   // đơn vị tự thêm vật cản bay của mình (worldJoin('flight')): chuồng bò…
        // mỗi loài tự chọn đích bay (móc gắn lúc tạo con): agent.reroute() khi kẹt ≥ 2 s · agent.navReset() khi lưới bay dựng lại
        function refreshFlightNavigation() {
          const boxes = [], matrix = new THREE.Matrix4(), local = new THREE.Matrix4();
          scene.updateMatrixWorld(true);
          for (const root of flightRoots) root.traverse(obj => {
            if (!obj.isMesh || !obj.geometry || obj.userData.noFlight) return;   // noFlight: bản chỉ ghi độ sâu của vỏ cây (trùng lưới thật)
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
            insect.navReset?.();
          }
        }
        refreshFlightNavigation();
        const _flyDir = new THREE.Vector3();
        // kẹt TRONG vật cản (lưới bay dựng lại sau khi côn trùng đã đứng đó / đáp sát vật): nhích ra ô trống gần nhất — lên trước, rồi vòng ngang 0,3 → 2,4 m
        const _uv = new THREE.Vector3();
        function insectUnstick(agent) {
          for (let r = 0.3; r <= 2.4; r += 0.3) {
            if (flightNav.pointClear(_uv.set(agent.pos.x, agent.pos.y + r, agent.pos.z))) { agent.pos.copy(_uv); agent.flight = null; return true; }
            for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; if (flightNav.pointClear(_uv.set(agent.pos.x + Math.cos(a) * r, agent.pos.y, agent.pos.z + Math.sin(a) * r))) { agent.pos.copy(_uv); agent.flight = null; return true; } }
          }
          return false;
        }
        function animateInsectFlight(agent, dt) {
          const status = flightNav.step(agent, dt);
          if (status === 'blocked') agent.blockedFor = (agent.blockedFor || 0) + dt;
          else agent.blockedFor = 0;
          if (agent.blockedFor >= 2 && !flightNav.pointClear(agent.pos)) { insectUnstick(agent); agent.blockedFor = 0; }
          if (agent.blockedFor >= 2 && agent.flight?.warned && agent.state !== 'returning') {
            agent.reroute();
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
