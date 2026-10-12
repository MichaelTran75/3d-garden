        // ---- LỚP TƯ THẾ của kỹ sư: các pha (đi, ngồi, câu, ăn, uống, vuốt chó, bàn học...) chỉ ghi tư thế ĐÍCH; lớp này lưu đích rồi hiển thị bản
        //      đã làm mượt (lò xo giảm chấn tới hạn) cho khớp tay-chân-đầu, hướng, vị trí → đổi việc không còn "nhảy" tư thế, lên xuống bậc êm;
        //      nghiêng người (lean/bank) do pha đặt; xoay tại chỗ thì nhích chân. Vào/ra xe ngủ (đổi khung toạ độ) hoặc dịch chuyển xa thì hiện ngay ----
        const ENG_JOINT_W = 12, ENG_YAW_W = 7, ENG_POS_W = 10, ENG_LEAN_W = 8;   // tần số riêng (rad/s) của lò xo giảm chấn tới hạn: khớp · hướng · vị trí · nghiêng
        function engSpring(x, v, target, w, dt) {   // lò xo giảm chấn tới hạn (dạng SmoothDamp): bám đích không vọt quá, vận tốc liên tục → khởi động/dừng mềm
          const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = x - target, tmp = (v + w * c) * dt;
          engSpring.v = (v - w * tmp) * ex; return target + (c + tmp) * ex;
        }
        function engPoseBegin(e) {   // đầu frame: trả mọi thứ về giá trị ĐÍCH của frame trước (pha nào không ghi lại thì giữ đích cũ)
          e.walking = false; e.lean = 0; e.bank = 0; e.seatCtl = false;   // seatCtl: bộ điều khiển ghế (ngồi xuống / đang ngồi / đứng dậy) tự tính chính xác thân + chân
          const P = e.pose; if (!P) return;
          for (let i = 0; i < P.joints.length; i++) P.joints[i].rotation.x = P.raw[i];
          e.g.position.copy(P.rawPos); e.g.rotation.set(P.rawRX, P.rawYaw, P.rawRZ);
        }
        function engPoseEnd(e, dt, t) {   // cuối frame: lưu đích, hiển thị bản đã qua lò xo
          const g = e.g;
          if (!e.pose) { const joints = [e.legs[0], e.legs[1], e.knees[0], e.knees[1], e.arms[0], e.arms[1], e.head];
            e.pose = { joints, raw: joints.map(o => o.rotation.x), shown: joints.map(o => o.rotation.x), jv: joints.map(() => 0), rawPos: g.position.clone(), pos: g.position.clone(), pv: [0, 0, 0],
              rawYaw: g.rotation.y, yaw: g.rotation.y, yv: 0, rawRX: g.rotation.x, rawRZ: g.rotation.z, lean: 0, lv: 0, bank: 0, bv: 0, parent: g.parent }; }
          const P = e.pose;
          P.rawPos.copy(g.position); P.rawYaw = g.rotation.y; P.rawRX = g.rotation.x; P.rawRZ = g.rotation.z;
          const jump = g.parent !== P.parent || P.rawPos.distanceTo(P.pos) > 1.5; P.parent = g.parent;   // vào/ra xe ngủ, dịch chuyển xa → hiện ngay
          const direct = !jump && !!e.seatCtl, idt = 1 / Math.max(dt, 1e-3);   // bộ điều khiển ghế đã tính quỹ đạo mượt + IK chính xác: hiện nguyên, chỉ ghi vận tốc
          for (let i = 0; i < P.joints.length; i++) {
            const raw = P.joints[i].rotation.x; P.raw[i] = raw;
            if (jump) { P.shown[i] = raw; P.jv[i] = 0; }
            else if (direct && i < 4) { P.jv[i] = (raw - P.shown[i]) * idt; P.shown[i] = raw; }
            else { P.shown[i] = engSpring(P.shown[i], P.jv[i], raw, ENG_JOINT_W, dt); P.jv[i] = engSpring.v; }
            P.joints[i].rotation.x = P.shown[i];
          }
          const prevYaw = P.yaw;
          if (jump) { P.yaw = P.rawYaw; P.yv = 0; P.pos.copy(P.rawPos); P.pv[0] = P.pv[1] = P.pv[2] = 0; }
          else if (direct) {
            P.yv = Math.atan2(Math.sin(P.rawYaw - P.yaw), Math.cos(P.rawYaw - P.yaw)) * idt; P.yaw = P.rawYaw;
            P.pv[0] = (P.rawPos.x - P.pos.x) * idt; P.pv[1] = (P.rawPos.y - P.pos.y) * idt; P.pv[2] = (P.rawPos.z - P.pos.z) * idt; P.pos.copy(P.rawPos);
          }
          else {
            let dy = P.rawYaw - P.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));   // đi đường vòng ngắn nhất
            P.yaw = engSpring(P.yaw, P.yv, P.yaw + dy, ENG_YAW_W, dt); P.yv = engSpring.v;
            for (const [i, ax] of [[0, 'x'], [1, 'y'], [2, 'z']]) { P.pos[ax] = engSpring(P.pos[ax], P.pv[i], P.rawPos[ax], ENG_POS_W, dt); P.pv[i] = engSpring.v; }
          }
          if (direct) { P.lv = (e.lean - P.lean) * idt; P.lean = e.lean; P.bv = (e.bank - P.bank) * idt; P.bank = e.bank; }
          else { P.lean = engSpring(P.lean, P.lv, e.lean, ENG_LEAN_W, dt); P.lv = engSpring.v; P.bank = engSpring(P.bank, P.bv, e.bank, ENG_LEAN_W, dt); P.bv = engSpring.v; }
          g.position.copy(P.pos); g.rotation.set(P.rawRX + P.lean, P.yaw, P.rawRZ + P.bank);
          // xoay tại chỗ (đang đứng, không bước) → nhích chân theo tốc độ xoay, như người thật đổi hướng
          let yr = P.yaw - prevYaw; yr = Math.abs(Math.atan2(Math.sin(yr), Math.cos(yr))) / Math.max(dt, 1e-3);
          const shufWant = (!direct && !e.walking && Math.abs(P.raw[0]) < 0.3 && Math.abs(P.raw[1]) < 0.3 && Math.abs(P.raw[2]) < 0.3 && yr > 0.6) ? Math.min(0.2, (yr - 0.6) * 0.12) : 0;
          P.shuf = (P.shuf || 0) + (shufWant - (P.shuf || 0)) * (1 - Math.exp(-dt * 8));   // biên độ nhích chân lên/xuống dần, không bật tắt đột ngột
          if (direct) P.shuf = 0;
          else if (P.shuf > 0.002) { const sh = P.shuf * Math.sin(t * 11); P.joints[0].rotation.x += sh; P.joints[1].rotation.x -= sh; }
        }
        // ---- IK 2 KHỚP cho chân kỹ sư (giải tích bằng định lý cos: đùi 0,42 · cẳng 0,36 · cổ chân→đế 0,10, đơn vị cục bộ) + cổ chân giữ đế phẳng ----
        //  Dáng đi/đứng (FK) giả định mặt đất PHẲNG ngang tâm người; địa hình voxel có bậc ⇒ mỗi bàn chân dời đúng độ chênh mặt đất dưới nó,
        //  hông hạ theo chân thấp hơn (có giới hạn), chân cao hơn gập gối với tới như bước lên bậc; giữ nguyên độ nhấc chân của nhịp bước,
        //  chân trụ không nhún theo nhịp nhún của thân (không trượt/lún). Chạy SAU lớp tư thế, chỉ đổi phần hiển thị (khung sau lại lấy tư thế đích gốc).
        const ENG_L1 = 0.42, ENG_L2 = 0.36, ENG_SOLE = 0.10, ENG_HIP_Y = 1.18, _ikW = new THREE.Vector3();
        const ikSmooth = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
        function engFootIK(e, dt) {
          const g = e.g, P = e.pose;
          if (e.seatCtl) { e.ikW = 0; e.ikPelvis = 0; return; }   // ngồi / đứng dậy: bộ điều khiển ghế tự giải IK bàn chân bám đất
          const onFoot = !!P && g.parent === scene && !e.inVan && e.phase !== 'van' && e.phase !== 'pet' && Math.abs(e.legs[0].rotation.x) < 0.95 && Math.abs(e.legs[1].rotation.x) < 0.95 && e.knees[0].rotation.x < 1.15 && e.knees[1].rotation.x < 1.15;
          e.ikW = (e.ikW || 0) + ((onFoot ? 1 : 0) - (e.ikW || 0)) * (1 - Math.exp(-dt * 6));
          if (e.ikW < 0.01) { e.ankles[0].rotation.x = e.ankles[1].rotation.x = 0; e.ikPelvis = 0; return; }
          const w = e.ikW, S = g.scale.y; g.updateMatrixWorld(true);
          const plane = g.position.y + ENG_FEET, fk = [];
          for (let i = 0; i < 2; i++) {   // vị trí cổ chân FK (mặt phẳng y–z cục bộ) → thế giới → độ chênh mặt đất dưới bàn chân
            const a = e.legs[i].rotation.x, b = e.knees[i].rotation.x;
            const ky = ENG_HIP_Y - ENG_L1 * Math.cos(a), kz = -ENG_L1 * Math.sin(a), ay = ky - ENG_L2 * Math.cos(a + b), az = kz - ENG_L2 * Math.sin(a + b);
            g.localToWorld(_ikW.set(i ? 0.15 : -0.15, ay, az));
            const lift = Math.max(0, (_ikW.y - ENG_SOLE * S) - plane);   // độ nhấc chân của nhịp bước (đv thế giới)
            fk.push({ a, b, ay, az, lift, delta: cowY(_ikW.x, _ikW.z) - plane });
          }
          const po = Math.max(-0.42, Math.min(0.25, Math.min(fk[0].delta, fk[1].delta)));   // hạ hông tối đa ~0,5 m: bậc voxel cao hơn thì chân thấp hơi hổng
          e.ikPelvis = (e.ikPelvis || 0) + (po - (e.ikPelvis || 0)) * (1 - Math.exp(-dt * 10));
          g.position.y += e.ikPelvis * w;
          for (let i = 0; i < 2; i++) {
            const f = fk[i], ty = f.ay + (f.delta - e.ikPelvis) / S, tz = f.az;
            const vy = ty - ENG_HIP_Y, vz = tz, d = Math.min(ENG_L1 + ENG_L2 - 1e-4, Math.max(0.08, Math.hypot(vy, vz)));
            const kneeIK = Math.PI - Math.acos(Math.max(-1, Math.min(1, (ENG_L1 * ENG_L1 + ENG_L2 * ENG_L2 - d * d) / (2 * ENG_L1 * ENG_L2))));
            const hipIK = -(Math.atan2(vz, -vy) + Math.acos(Math.max(-1, Math.min(1, (ENG_L1 * ENG_L1 + d * d - ENG_L2 * ENG_L2) / (2 * ENG_L1 * d)))));   // gối luôn chĩa ra trước
            const a = f.a + (hipIK - f.a) * w, b = f.b + (kneeIK - f.b) * w;
            e.legs[i].rotation.x = a; e.knees[i].rotation.x = b;
            const plant = 1 - ikSmooth(0.03, 0.15, f.lift);   // chân trụ: đế phẳng theo mặt đất · chân đang vung: để mũi giày buông tự nhiên
            e.ankles[i].rotation.x = -(g.rotation.x + a + b) * plant * w;
          }
        }
        function engSitLean(e, k) { e.lean = Math.max(e.lean, 1.15 * k * (1 - k)); }   // ngồi xuống / đứng dậy: dồn trọng tâm, cúi người về trước giữa chừng
        function engStep(e, tgt, dt, t, avoidPt, avoidR, field) {
          const dx = tgt.x - e.g.position.x, dz = tgt.z - e.g.position.z, dist = Math.hypot(dx, dz);
          const arrive = () => { e.vel = 0; e.legs[0].rotation.x = e.legs[1].rotation.x = 0; e.knees[0].rotation.x = e.knees[1].rotation.x = 0; e.arms[0].rotation.x = e.arms[1].rotation.x = 0; return true; };   // tới nơi: đứng thẳng (lớp tư thế khép chân dần, không đơ giữa bước)
          if (dist < 0.25) return arrive();
          let ux = dx / dist, uz = dz / dist;
          const fdir = (field && dist > 1.5) ? ffDir(field, e.g.position.x, e.g.position.z) : null;
          if (fdir) {                                                                                  // bảng DP dẫn đường: đường ngắn nhất, né mọi vật cản từ xa — hết kẹt loop
            ux = fdir.x; uz = fdir.z; const gx0 = ux, gz0 = uz;
            for (const ob of ENG_PROPS) {   // vật nhỏ lọt giữa các ô lưới 0,6 m (cọc đèn lồng, xô, ghế, bàn trà): đẩy ra + trượt vòng qua
              const fx = e.g.position.x - ob.x, fz = e.g.position.z - ob.z, fd = Math.hypot(fx, fz), rr = ob.r + 0.32;
              if (fd >= rr || fd < 1e-4) continue;
              const push = (rr - fd) / rr, nx2 = fx / fd, nz2 = fz / fd, s = (gx0 * -nz2 + gz0 * nx2) >= 0 ? 1 : -1;
              ux += nx2 * push * 3.4 - nz2 * s * push * 2.6; uz += nz2 * push * 3.4 + nx2 * s * push * 2.6;
            }
            const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
          }
          else {                                                                                       // sát đích / không có bảng → né cục bộ bằng lực đẩy như cũ
            const gx0 = ux, gz0 = uz;                                                                    // hướng đích GỐC — dùng chọn phía vòng tránh
            const repel = (ox, oz, rr) => {
              const fx = e.g.position.x - ox, fz = e.g.position.z - oz, fd = Math.hypot(fx, fz);
              if (fd >= rr || fd < 1e-4) return;
              const push = (rr - fd) / rr, nx2 = fx / fd, nz2 = fz / fd;
              ux += nx2 * push * 3.4; uz += nz2 * push * 3.4;                                            // lực ĐẨY RA: giữ khoảng cách với vật cản
              const dotT = gx0 * -nz2 + gz0 * nx2;                                                       // đích lệch về phía nào? → vòng theo phía đó
              let s; if (Math.abs(dotT) < 0.15) s = e.avoidSide || 1; else { s = dotT >= 0 ? 1 : -1; e.avoidSide = s; }   // hysteresis: đích thẳng tâm thì giữ phía cũ, không rung lắc đổi chiều
              ux += -nz2 * s * push * 2.6; uz += nx2 * s * push * 2.6;                                   // lực TIẾP TUYẾN: trượt VÒNG QUANH vật cản — triệt tiêu điểm cân bằng chết gây kẹt
            };
            if (avoidPt) repel(avoidPt.x, avoidPt.z, avoidR);                                            // bếp lửa
            for (const ob of obstacleCoords) {                                                           // xe van · cột đèn · tua-bin · trạm...
              if (Math.hypot(tgt.x - ob.x, tgt.z - ob.z) < ob.r + 0.6) continue;                         // đích nằm sát/vào vật cản này → chủ đích tới đó, không đẩy (vd: đi tới cột khí tượng)
              repel(ob.x, ob.z, ob.r + 0.35);
            }
            for (const ob of ENG_PROPS) repel(ob.x, ob.z, ob.r + 0.32);   // ghế · xô · cọc đèn · bàn trà: không bao giờ là đích đi bộ thường ⇒ luôn đẩy
            const ul = Math.hypot(ux, uz) || 1; ux /= ul; uz /= ul;
          }
          // ---- vật lý bước đi: xoay thân có giới hạn tốc độ góc · tăng/giảm tốc mượt · chậm lại khi phải ngoặt gắt hoặc sắp tới đích ·
          //      bước THEO HƯỚNG THÂN (không trượt ngang kiểu moonwalk) · nhịp chân theo quãng đường · ngả người theo tốc độ, nghiêng vào khúc cua ----
          const want = Math.atan2(ux, uz); let dturn = want - e.g.rotation.y; dturn = Math.atan2(Math.sin(dturn), Math.cos(dturn));
          const turn = Math.max(-4.2 * dt, Math.min(4.2 * dt, dturn * Math.min(1, dt * 7)));
          e.g.rotation.y += turn;
          const v0 = e.vel || 0, vWant = e.spd * (0.3 + 0.7 * Math.max(0, Math.cos(dturn))) * Math.min(1, 0.35 + dist / 0.9);
          const acc = vWant > v0 ? 2.4 : 4.5; e.vel = v0 + Math.max(-acc * dt, Math.min(acc * dt, vWant - v0));
          let mx = Math.sin(e.g.rotation.y) * 0.75 + ux * 0.25, mz = Math.cos(e.g.rotation.y) * 0.75 + uz * 0.25; const ml = Math.hypot(mx, mz) || 1; mx /= ml; mz /= ml;
          const step = Math.min(e.vel * dt, dist);
          const nx = e.g.position.x + mx * step, nz = e.g.position.z + mz * step;
          const gi = Math.round(x2gi(nx)), gj = Math.round(z2gj(nz));
          if (isWater(gi, gj)) { e.vel = 0; return arrive(); }   // chạm mép nước → coi như đã tới, không lội xuống
          e.g.position.x = nx; e.g.position.z = nz;
          const bob = engGait(e, step);
          e.g.position.y = cowY(nx, nz) - ENG_FEET + bob * CAMP_SCALE;   // bậc địa hình được lớp tư thế làm êm (bước lên/xuống, không giật thẳng)
          e.lean = Math.max(-0.05, Math.min(0.1, e.vel * 0.05 + (e.vel - v0) / Math.max(dt, 1e-3) * 0.02));   // ngả trước khi đi nhanh / tăng tốc, ngửa nhẹ khi phanh
          e.bank = Math.max(-0.08, Math.min(0.08, -turn / Math.max(dt, 1e-3) * 0.025));                     // nghiêng vào trong khúc cua
          e.walking = true;
          return false;
        }

