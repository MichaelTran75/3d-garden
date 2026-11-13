        // ==== TẦM NHÌN CỦA NGƯỜI XEM (01/11 đợt 11 — dời nguyên văn từ ui/labels-controls.js, ui/follow-tags.js, loop/main-loop.js):
        //  camera trực giao quay quanh điểm nhìn `target` — góc theta / phi tiến êm tới đích tTheta / tPhi, khoảng cách radius, tự xoay autoRotate — phím đang giữ
        //  `keys` (W/A/S/D, mũi tên: dời điểm nhìn), bám theo vật (CAMF / camFollow). Là HẠ TẦNG: ô điều khiển (ui/labels-controls.js) ghi theo chuột / phím,
        //  vòng lặp gọi viewTick đầu khung, đồ vật nhờ camera tới gần (nhà máy đập: camFollow), bóng nắng (loop/close-up.js) / gió (nature/wind-field.js) đọc điểm nhìn ----
        let theta = Math.PI * 0.27, phi = 0.9, tTheta = theta, tPhi = phi, radius = 400, autoRotate = true;
        const target = new THREE.Vector3(0, 5, 0);
        const keys = {};
        function viewTick(dt) {   // mỗi khung (loop/main-loop.js, đầu khung): xoay êm tới góc đích, phím dời điểm nhìn, đặt camera
          const vk = 1 - Math.exp(-5 * dt);   // tiến 8 % / khung ở 60 khung/giây — tính theo dt để màn 120 Hz hay máy chậm xoay cùng tốc độ
          if (autoRotate) tTheta += 0.048 * dt; theta += (tTheta - theta) * vk; phi += (tPhi - phi) * vk;
          const panSpd = 65 * dt / camera.zoom;
          if (keys['w'] || keys['arrowup']) { target.x += Math.cos(theta) * panSpd; target.z += Math.sin(theta) * panSpd; autoRotate = false; }
          if (keys['s'] || keys['arrowdown']) { target.x -= Math.cos(theta) * panSpd; target.z -= Math.sin(theta) * panSpd; autoRotate = false; }
          if (keys['a'] || keys['arrowleft']) { target.x += Math.sin(theta) * panSpd; target.z -= Math.cos(theta) * panSpd; autoRotate = false; }
          if (keys['d'] || keys['arrowright']) { target.x -= Math.sin(theta) * panSpd; target.z += Math.cos(theta) * panSpd; autoRotate = false; }
          camera.position.set(target.x + radius * Math.sin(phi) * Math.cos(theta), target.y + radius * Math.cos(phi), target.z + radius * Math.sin(phi) * Math.sin(theta)); camera.lookAt(target);
        }
        const _vwP = new THREE.Vector3();
        // ---- CAMERA THEO KỸ SƯ (bấm kỹ sư ⇒ camera bay tới): bấm nút "Kỹ sư" mở bảng ⇒ điểm nhìn lướt tới kỹ sư 1,2 s (êm hai đầu),
        //  zoom vào ít nhất ×18, rồi bám theo kỹ sư; kéo phải (dời khung), phím W/A/S/D/mũi tên, nút về mặc định hoặc đóng bảng ⇒ thôi theo (kéo trái xoay vẫn theo) ----
        //  opt.exact: zoom đúng số (khung vừa vật — có thể zoom ra) · opt.off: điểm nhìn = gốc vật + off (thế giới; mặc định cao 1) · opt.rate: độ bám (vật bay nhanh: cao hơn)
        const CAMF = { o: null, k: 1, from: new THREE.Vector3(), z0: 1, z1: 1, off: null, rate: 3 };
        function camFollow(o, zoom = 18, opt = {}) { CAMF.o = o; CAMF.k = 0; CAMF.from.copy(target); CAMF.z0 = camera.zoom; CAMF.z1 = opt.exact ? zoom : Math.max(camera.zoom, zoom); CAMF.off = opt.off ? opt.off.clone() : null; CAMF.rate = opt.rate || 3; autoRotate = false; }
        function camFollowTick(dt) {
          if (!CAMF.o) return;
          if (CAMF.o === DRONE.object && !DRONE.flying) camFollow(ENGINEER.object, Math.min(camera.zoom, 18), { exact: true });   // drone đã hạ cánh ⇒ camera lùi về theo kỹ sư (đang đem drone cất), zoom ×18 thay cho cận cảnh drone
          const p = CAMF.o.getWorldPosition(_vwP); if (CAMF.off) p.add(CAMF.off); else p.y += 1.0;
          if (CAMF.k < 1) { CAMF.k = Math.min(1, CAMF.k + dt / 1.2); const e = CAMF.k * CAMF.k * (3 - 2 * CAMF.k); target.lerpVectors(CAMF.from, p, e); camera.zoom = CAMF.z0 + (CAMF.z1 - CAMF.z0) * e; camera.updateProjectionMatrix(); }
          else target.lerp(p, Math.min(1, dt * CAMF.rate));
        }
        worldTick('viewer', 30, camFollowTick);   // MỖI KHUNG (sổ tick core/world.js, lượt người xem — sau khung chọn, trước nhãn theo con vật): camera bám vật
