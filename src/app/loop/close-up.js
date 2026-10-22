        // ====== CẬN CẢNH SẮC NÉT + ĐỘ PHÂN GIẢI TỰ ĐIỀU CHỈNH — xem src/ARCHITECTURE.md mục "Cận cảnh" và "Hiệu năng" ======
        //  1) Bóng nắng ôm vùng đang nhìn: cùng 1 tấm bóng 2048² nhưng zoom gần thì phủ vùng nhỏ ⇒ mỗi điểm bóng nhỏ đi (zoom tối đa ~0,01 đv thay vì
        //     0,11 đv: bóng người, cần câu, quai ấm sắc nét). Cỡ vùng đổi theo nấc ×1,25 (lăn zoom không làm bóng "bơi" liên tục), tâm bám lưới điểm bóng
        //     (kéo cảnh không làm viền bóng "bò"); độ lệch chống sọc bóng co theo cỡ điểm bóng. Hướng nắng = sun.position − sun.target.position.
        //  2) Vật tròn nhỏ (cốc, chai, que, khúc gỗ, ấm, đèn, bánh xe…) đổi sang bản nhiều cạnh khi đủ lớn trên màn hình (bán kính > 13 điểm ảnh, lùi < 9 thì
        //     trả lại): hình dựng lại từ .parameters của hình gốc ×3 số cạnh; chỉ nhận hình còn nguyên như lúc tạo (không xoay/dời/sửa đỉnh), bỏ vật liệu
        //     flatShading (mặt vát cố ý). Mảnh đang trong lô gộp vẽ thì tạm tự vẽ khi dùng bản nhiều cạnh (draw-batch: userData.lodHi), lùi xa trả về lô.
        //  3) Độ phân giải tự điều chỉnh: đo khoảng giữa các khung (rAF) — chậm (< ~45 hình/giây) 1,5 s thì hạ mật độ điểm ảnh ×0,85, nhanh 4 s thì nâng ×1,1
        //     (vùng đệm 17,8–22 ms chống dao động), sàn 0,6. Hạ mà không nhanh lên (màn 30 Hz, trình duyệt bóp nhịp, nghẽn ở CPU) thì trả lại và thôi thử 60 s.
        //     Trang thử nghiệm đặt window.__resLock = true để ảnh chụp giữ đúng cỡ.
        scene.add(sun.target);   // đích nắng di chuyển theo vùng nhìn → phải nằm trong cảnh để ma trận được cập nhật
        const _cuX = new THREE.Vector3(), _cuY = new THREE.Vector3(), _cuZ = new THREE.Vector3(), _cuC = new THREE.Vector3(), _cuUp = new THREE.Vector3(0, 1, 0);
        let cuR = 116;
        function fitSunShadow() {
          const hx = (camera.right - camera.left) / 2 / camera.zoom, hy = (camera.top - camera.bottom) / 2 / camera.zoom;
          camera.getWorldDirection(_cuX); const se = Math.max(0.12, -_cuX.y);   // vùng đất trong khung nhìn dài thêm 1/sin(góc chúc) theo hướng nhìn
          const want = Math.min(116, Math.max(8, 1.15 * Math.hypot(hx, hy / se) + 3));   // + lề cho bóng của vật cao đứng ngoài khung
          const R = 116 / Math.pow(1.25, Math.floor(Math.log(116 / want) / Math.log(1.25)));
          _cuZ.copy(sun.position).sub(sun.target.position).normalize();
          _cuX.crossVectors(_cuUp, _cuZ); if (_cuX.lengthSq() < 1e-8) _cuX.set(1, 0, 0); _cuX.normalize(); _cuY.crossVectors(_cuZ, _cuX);   // trục máy chụp bóng (như lookAt)
          const tx = 2 * R / sun.shadow.mapSize.x, cx = target.dot(_cuX), cy = target.dot(_cuY);
          _cuC.copy(target).addScaledVector(_cuX, Math.round(cx / tx) * tx - cx).addScaledVector(_cuY, Math.round(cy / tx) * tx - cy);
          sun.target.position.copy(_cuC); sun.position.copy(_cuC).addScaledVector(_cuZ, 150);
          if (R !== cuR) {
            cuR = R; const sc = sun.shadow.camera, k = Math.max(0.1, R / 116); sc.left = sc.bottom = -R; sc.right = sc.top = R; sc.updateProjectionMatrix();
            sun.shadow.bias = -0.0004 * k; sun.shadow.normalBias = 0.04 * k;
          }
        }
        const closeLod = [];
        function lodBuild(g, k) {   // dựng lại hình gốc với số cạnh ×k (k = 1: bản y hệt để kiểm tra hình còn nguyên như lúc tạo)
          const P = g.parameters, s = n => k === 1 ? n : Math.min(48, Math.max(24, n * k));
          if (!P) return null;
          switch (g.type) {
            case 'CylinderGeometry': return new THREE.CylinderGeometry(P.radiusTop, P.radiusBottom, P.height, s(P.radialSegments), P.heightSegments, P.openEnded, P.thetaStart, P.thetaLength);
            case 'ConeGeometry': return new THREE.ConeGeometry(P.radius, P.height, s(P.radialSegments), P.heightSegments, P.openEnded, P.thetaStart, P.thetaLength);
            case 'SphereGeometry': return new THREE.SphereGeometry(P.radius, s(P.widthSegments), k === 1 ? P.heightSegments : Math.max(16, P.heightSegments * 2), P.phiStart, P.phiLength, P.thetaStart, P.thetaLength);
            case 'TorusGeometry': return new THREE.TorusGeometry(P.radius, P.tube, k === 1 ? P.radialSegments : Math.max(12, P.radialSegments * 2), s(P.tubularSegments), P.arc);
            case 'LatheGeometry': return new THREE.LatheGeometry(P.points, s(P.segments), P.phiStart, P.phiLength);
            case 'CapsuleGeometry': return new THREE.CapsuleGeometry(P.radius, P.length, k === 1 ? P.capSegments : P.capSegments * 2, s(P.radialSegments));
          }
          return null;
        }
        function registerCloseLod(root) {
          if (!root) return;
          root.traverse(o => {
            if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || o.userData.lodHi !== undefined) return;
            const m = o.material, g = o.geometry; if (!m || Array.isArray(m) || m.flatShading || m.wireframe || !g || g.morphAttributes.position) return;
            const ref = lodBuild(g, 1); if (!ref) return;
            const a = g.attributes.position, b = ref.attributes.position; let same = a.count === b.count && !!g.index === !!ref.index;
            for (let i = 0; same && i < a.array.length; i++) if (Math.abs(a.array[i] - b.array[i]) > 1e-5) same = false;
            ref.dispose(); if (!same) return;   // hình đã bị xoay/dời/sửa đỉnh sau khi tạo → không dựng lại được đúng
            g.computeBoundingSphere(); closeLod.push({ o, lo: g, hi: null, r: g.boundingSphere.radius, on: false }); o.userData.lodHi = false;
          });
        }
        registerCloseLod(engObj && engObj.g); registerCloseLod(caravanObj);
        for (const o of scene.children) if (o.name && ['Ghế câu cá', 'Ghế cắm trại', 'Bếp lửa trại', 'Bàn trà', 'Giá treo nồi', 'Ấm reo', 'Cần câu để dưới đất', 'Xô nhỏ', 'Đống củi', 'Khúc gỗ đứng'].some(p => o.name.startsWith(p))) registerCloseLod(o);
        let lodPpu = -1;
        function updateCloseLod() {
          const ppu = renderer.domElement.height * camera.zoom / (camera.top - camera.bottom);   // điểm ảnh / đv thế giới
          if (Math.abs(ppu - lodPpu) < 1e-3 * ppu) return; lodPpu = ppu;
          for (const L of closeLod) {
            const px = L.r * L.o.matrixWorld.getMaxScaleOnAxis() * ppu, on = L.on ? px > 9 : px > 13;
            if (on === L.on) continue;
            L.on = on; if (on && !L.hi) L.hi = lodBuild(L.lo, 3);
            L.o.geometry = on ? L.hi : L.lo; L.o.userData.lodHi = on;
          }
        }
        const DRES = { max: Math.min(window.devicePixelRatio, 1.6), min: Math.max(0.6, renderer.getPixelRatio() * 0.5), last: 0, ema: 0, slow: 0, fast: 0, hold: 2, test: null };
        function adaptResolution(ts) {   // ts: mốc thời gian rAF (khung do __dbg.frames() gọi thẳng thì không có → bỏ qua)
          const D = DRES, ms = D.last ? ts - D.last : 0; D.last = ts;
          if (window.__resLock || !(ms > 0) || ms > 250) return;   // khung đầu / vừa quay lại tab
          D.ema = D.ema ? D.ema + (ms - D.ema) * 0.08 : ms;
          const s = ms / 1000; if (D.hold > 0) { D.hold -= s; return; }
          const pr = renderer.getPixelRatio();
          if (D.test) {   // vừa hạ: phải nhanh lên ≥ 8% mới giữ
            if ((D.test.t -= s) > 0) return;
            if (D.ema > D.test.ema * 0.92) { renderer.setPixelRatio(D.test.pr); D.hold = 60; D.ema = 0; }
            D.test = null; return;
          }
          D.slow = D.ema > 22 ? D.slow + s : 0; D.fast = D.ema < 17.8 ? D.fast + s : 0;
          if (D.slow > 1.5 && pr > D.min + 1e-3) { D.test = { pr, ema: D.ema, t: 1.5 }; renderer.setPixelRatio(Math.max(D.min, pr * 0.85)); D.slow = 0; }
          else if (D.fast > 4 && pr < Math.min(D.max, pxCap()) - 1e-3) { renderer.setPixelRatio(Math.min(D.max, pxCap(), pr * 1.1)); D.fast = 0; D.hold = 1; }   // không vượt trần điểm ảnh (core/boot.js)
        }
