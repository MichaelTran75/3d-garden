        // ---- Chú gấu mèo Raccoon voxel chạy lung tung rồi chui vào khúc gỗ ----
        // ---- GẤU MÈO (Procyon lotor) — hình thái: chân sau dài hơn chân trước ⇒ mông cao, lưng gù; đi bằng cả bàn chân (bàn chân sau dài, đen);
        //      tay trước 5 ngón rất khéo; mặt nạ đen quanh mắt + lông mày trắng, mõm trắng, tai viền trắng; đuôi rậm 5–7 khoanh đen–xám buông THẤP
        //      (không cong vểnh). Khớp như chó (thân · cổ · 4 chân 2 đoạn) để dùng chung bộ chân IK; mắt phản quang ban đêm (lớp tapetum lucidum) ----
        //  hình khối theo mẫu "Low-poly Racoon Run Animation" (avatrass, Sketchfab, CC-BY-4.0; chỉ đo): thân tròn khối
        //  gù (mông to + cao hơn ngực), đầu tròn mõm nhọn trắng, mặt nạ đen quanh mắt + mày trắng, tai tròn viền trắng, cẳng + bàn chân sẫm ("găng tay"),
        //  đuôi rậm 7 khoanh ngọn đen. Chạy kiểu phi nhảy: lưng cong lại khi gom 4 chân, duỗi ra khi vươn (gập cột sống ở ngực ↔ mông).
        function createRaccoon(s) {
          const rc = new THREE.Group();
          const grey = new THREE.MeshLambertMaterial({ color: 0x8f939a, flatShading: true }), greyD = new THREE.MeshLambertMaterial({ color: 0x5c6068, flatShading: true });
          const dark = new THREE.MeshLambertMaterial({ color: 0x2d2f33, flatShading: true }), white = new THREE.MeshLambertMaterial({ color: 0xe2d6c0, flatShading: true });
          const vc = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }), C = new THREE.Color();
          const blob = (rx, ry, rz, f, w = 9, h = 7) => { const geo = new THREE.SphereGeometry(1, w, h); geo.scale(rx * s, ry * s, rz * s); const p = geo.attributes.position, c = []; for (let i = 0; i < p.count; i++) { C.setHex(f(p.getX(i) / s, p.getY(i) / s, p.getZ(i) / s)); c.push(C.r, C.g, C.b); } geo.setAttribute('color', new THREE.Float32BufferAttribute(c, 3)); const m = new THREE.Mesh(geo, vc); m.castShadow = true; return m; };
          const fur = (x, y) => y > 0.05 ? 0x6c7077 : y < -0.04 ? 0xb4b4ae : 0x8f939a;   // lưng sẫm hoa râm · sườn xám · bụng nhạt
          const torso = new THREE.Group(); torso.position.y = 0.2 * s; rc.add(torso);
          const fore = new THREE.Group(), aft = new THREE.Group(); fore.position.y = aft.position.y = 0.02 * s; torso.add(fore, aft);   // 2 nửa thân gập quanh giữa lưng
          const chest = blob(0.12, 0.092, 0.105, fur); chest.position.set(0.09 * s, -0.025 * s, 0); fore.add(chest);
          const rump = blob(0.155, 0.125, 0.13, fur); rump.position.set(-0.1 * s, 0.005 * s, 0); aft.add(rump);   // mông to + cao ⇒ lưng gù
          const neck = new THREE.Group(); neck.position.set(0.18 * s, 0.03 * s, 0); torso.add(neck);
          const head = new THREE.Group(); head.position.set(0.07 * s, 0.05 * s, 0); neck.add(head);
          head.add(blob(0.072, 0.062, 0.078, (x, y) => y > 0.035 ? 0x7a7e85 : 0x9a9ea4));   // sọ tròn
          const mz = new THREE.Mesh(new THREE.ConeGeometry(0.038 * s, 0.085 * s, 7), white); mz.rotation.z = -Math.PI / 2; mz.position.set(0.09 * s, -0.022 * s, 0); head.add(mz);   // mõm nhọn trắng
          const nose = new THREE.Mesh(new THREE.SphereGeometry(0.014 * s, 6, 5), dark); nose.position.set(0.133 * s, -0.022 * s, 0); head.add(nose);
          for (const sz of [-1, 1]) {
            const mask = blob(0.026, 0.02, 0.034, () => 0x26282c, 7, 5); mask.position.set(0.052 * s, 0.006 * s, sz * 0.036 * s); mask.rotation.y = sz * 0.5; head.add(mask);   // mặt nạ đen quanh mắt
            const brow = blob(0.02, 0.008, 0.03, () => 0xeee6d6, 6, 4); brow.position.set(0.05 * s, 0.032 * s, sz * 0.034 * s); head.add(brow);   // mày trắng
            const cheek = blob(0.03, 0.022, 0.026, () => 0xe2d6c0, 6, 4); cheek.position.set(0.045 * s, -0.03 * s, sz * 0.045 * s); head.add(cheek);   // má trắng
          }
          const eyeM = new THREE.MeshBasicMaterial({ color: 0xd9f2a2 }), eyes = [];   // mắt phản quang (chỉ hiện khi trời tối)
          for (const sz of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.011 * s, 6, 4), eyeM); e.position.set(0.075 * s, 0.008 * s, sz * 0.038 * s); e.visible = false; head.add(e); eyes.push(e); }
          const ears = [];
          for (const sz of [-1, 1]) {
            const ep = new THREE.Group(); ep.position.set(-0.025 * s, 0.055 * s, sz * 0.05 * s); head.add(ep);
            const rim = new THREE.Mesh(new THREE.ConeGeometry(0.03 * s, 0.05 * s, 6), white); rim.position.y = 0.022 * s; ep.add(rim);   // viền tai trắng
            const ear = new THREE.Mesh(new THREE.ConeGeometry(0.024 * s, 0.044 * s, 6), greyD); ear.position.set(-0.006 * s, 0.022 * s, 0); ep.add(ear);
            ep.rotation.x = -sz * 0.22; ears.push(ep);
          }
          const legs = [];   // trước-T, trước-P, sau-T, sau-P (trái = +z) · chân trước ngắn (0,08 + 0,075), chân sau dài (0,1 + 0,1)
          for (const [fx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const fr = fx > 0, l1 = (fr ? 0.08 : 0.1) * s, l2 = (fr ? 0.075 : 0.1) * s;
            const hip = new THREE.Group(); hip.position.set(fr ? 0.12 * s : -0.15 * s, fr ? -0.06 * s : -0.04 * s, sz * (fr ? 0.075 : 0.085) * s); torso.add(hip);
            const up = new THREE.Mesh(new THREE.CylinderGeometry((fr ? 0.026 : 0.034) * s, (fr ? 0.034 : 0.044) * s, l1 * 1.15, 7), grey); up.position.y = -l1 / 2; up.castShadow = true; hip.add(up);   // đùi / cánh tay to ở gốc
            const knee = new THREE.Group(); knee.position.y = -l1; hip.add(knee);
            const lo = new THREE.Mesh(new THREE.CylinderGeometry(0.02 * s, 0.024 * s, l2 * 0.95, 6), greyD); lo.position.y = -l2 * 0.45; lo.castShadow = true; knee.add(lo);   // cẳng sẫm
            const pawG = new THREE.Group(); pawG.position.y = -l2 + 0.012 * s; knee.add(pawG);
            const paw = new THREE.Mesh(new THREE.SphereGeometry(1, 7, 4, 0, TAU, 0, Math.PI / 2), dark); paw.scale.set((fr ? 0.034 : 0.055) * s, 0.02 * s, 0.03 * s); paw.position.set((fr ? 0.012 : 0.028) * s, -0.012 * s, 0); pawG.add(paw);   // bàn đen, chân sau dài (đi cả bàn)
            legs.push({ hip, knee, paw: pawG, front: fr, side: sz, L1: l1, L2: l2 });
          }
          const tailHost = new THREE.Group(); tailHost.position.set(-0.22 * s, 0.05 * s, 0); torso.add(tailHost);
          rc.userData = { torso, fore, aft, neck, head, headGroup: head, ears, eyes, legs, tailHost, ringA: dark, ringB: grey, s, H0: 0.2 * s };
          return rc;
        }
        const raccoonObj = createRaccoon(0.99);
        raccoonObj.scale.multiplyScalar(NATURE_SCALE);
        raccoonObj.visible = false;
        scene.add(raccoonObj);
        // ---- toạ độ khúc gỗ + trạng thái gấu mèo (state machine thay đồng hồ t%360 cũ) ----
        //  hang = lòng khúc gỗ chết (nature/forest.js deadLog), cửa = miệng to (đầu a, hướng về bãi kiếm ăn): miệng = 0,3 m trong vành gỗ, chỗ ngủ = sâu 3,4 m (giữa
        //  khúc gỗ, chỗ tối) —; trước đây chỗ ngủ ngay miệng nhỏ đầu kia (ló ra rồi mới bò ngược
        //  6 m), bò lơ lửng 0,35 m trên đáy. Gấu mèo bò trên đáy lòng gỗ = mặt đất (animals/raccoon/brain.js crawl)
        const racLogPt = d => ({ x: deadLog.ax + (deadLog.bx - deadLog.ax) * d / 7.6, z: deadLog.az + (deadLog.bz - deadLog.az) * d / 7.6 });   // trên trục khúc gỗ, cách miệng to d m
        const racMouth = racLogPt(0.3), racInside = racLogPt(3.4);
        const racApproach = { x: X0 + 103, z: Z0 + 98 }, racHome = { x: X0 + 101, z: Z0 + 105 };
        const rac = { state: 'exit', tmr: 5, x: racInside.x, z: racInside.z, ang: 0, wob: 0, want: 0, stopTmr: 0, jumpTmr: 0, jumpCount: 0, wasChasing: false, roamState: 'walk', roamTmr: 3.0 };
        function racAvoidLog(px, pz) {   // đẩy 1 điểm ra khỏi trục khúc gỗ (bán kính 1.0) — trước đây logic này bị chép đôi 2 lần
          const k = 1 / Math.sqrt(40), dxd = 2 * k, dzd = -6 * k;
          const tp = THREE.MathUtils.clamp((px - racHome.x) * dxd + (pz - racHome.z) * dzd, -3.8, 3.8);
          const cx2 = racHome.x + tp * dxd, cz2 = racHome.z + tp * dzd;
          const ddx = px - cx2, ddz = pz - cz2, dd = Math.hypot(ddx, ddz);
          if (dd >= 1.0) return null;
          return [cx2 + ddx / (dd || 0.001), cz2 + ddz / (dd || 0.001)];
        }

        // dẫn đường FLOW FIELD (FF_N, ffBlocked, buildFlowField, ffDir) ở core/flow-field.js — tệp đứng ngay trước tệp này
        let racCol = null;   // VA CHẠM (core/collide.js, worldJoin('collide')): thân của gấu mèo
        worldJoin('collide', 40, C => {
          { const D = C.dims(raccoonObj.userData.torso); racCol = C.mover({ kind: 'rac', a: D.a + 0.1, b: D.b, ox: D.ox + 0.05, lo: 0.1, hi: Math.max(0.35, D.top), w: 1, x: () => raccoonObj.position.x, z: () => raccoonObj.position.z, ang: () => -raccoonObj.rotation.y, on: () => raccoonObj.visible, mask: () => /^(den|exit|peek|enter|out|toMouth)$/.test(raccoonBrain.state.st) || Math.hypot(raccoonObj.position.x - racHome.x, raccoonObj.position.z - racHome.z) < 2.5 ? 0 : 7 }); }   // chui ra / vào hang (khúc gỗ rỗng dài 7,6 m — trước chỉ bỏ trong 2,5 m quanh giữa ⇒ kẹt ở 2 đầu gỗ) và đoạn miệng hang ↔ bãi: lộ trình riêng
          C.moving(() => [raccoonObj]);
        });
