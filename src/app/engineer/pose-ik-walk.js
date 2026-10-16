        // ---- LỚP TƯ THẾ của kỹ sư: các pha (đi, ngồi, câu, ăn, uống, vuốt chó, bàn học...) chỉ ghi tư thế ĐÍCH; lớp này lưu đích rồi hiển thị bản
        //      đã làm mượt (lò xo giảm chấn tới hạn) cho khớp tay-chân-đầu, hướng, vị trí → đổi việc không còn "nhảy" tư thế, lên xuống bậc êm;
        //      nghiêng người (lean/bank) do pha đặt; xoay tại chỗ thì nhích chân. Vào/ra xe ngủ (đổi khung toạ độ) hoặc dịch chuyển xa thì hiện ngay ----
        const ENG_JOINT_W = 12, ENG_YAW_W = 7, ENG_POS_W = 10, ENG_LEAN_W = 8;   // tần số riêng (rad/s) của lò xo giảm chấn tới hạn: khớp · hướng · vị trí · nghiêng
        function engSpring(x, v, target, w, dt) {   // lò xo giảm chấn tới hạn (dạng SmoothDamp): bám đích không vọt quá, vận tốc liên tục → khởi động/dừng mềm
          const k = w * dt, ex = 1 / (1 + k + 0.48 * k * k + 0.235 * k * k * k), c = x - target, tmp = (v + w * c) * dt;
          engSpring.v = (v - w * tmp) * ex; return target + (c + tmp) * ex;
        }
        function engPoseBegin(e) {   // đầu frame: trả mọi thứ về giá trị ĐÍCH của frame trước (pha nào không ghi lại thì giữ đích cũ)
          e.walking = false; e.lean = 0; e.bank = 0; e.seatCtl = false; e.noFootIK = false;   // noFootIK: pha tự hạ người (ngồi xổm hái táo)   // seatCtl: bộ điều khiển ghế (ngồi xuống / đang ngồi / đứng dậy) tự tính chính xác thân + chân
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
          // cúi người như người thật: chỉ phần nhỏ nghiêng cả thân (quanh bàn chân), phần lớn GẬP EO (hông giữ trên bàn chân) — eo gập ×1,6 cho vai
          // vẫn với tới gần như cũ; bộ điều khiển ghế (direct) tự tính thân + chân nên giữ nguyên nghiêng cả thân
          const whole = direct ? P.lean : Math.max(-0.1, Math.min(0.12, P.lean)); e.waistBend = direct ? 0 : (P.lean - whole) * (P.lean > 0 ? 1.6 : 1);
          g.position.copy(P.pos); g.rotation.set(P.rawRX + whole, P.yaw, P.rawRZ + P.bank);
          // xoay tại chỗ (đang đứng, không bước) → nhích chân theo tốc độ xoay, như người thật đổi hướng
          let yr = P.yaw - prevYaw; yr = Math.abs(Math.atan2(Math.sin(yr), Math.cos(yr))) / Math.max(dt, 1e-3);
          const shufWant = (!direct && !e.walking && Math.abs(P.raw[0]) < 0.3 && Math.abs(P.raw[1]) < 0.3 && Math.abs(P.raw[2]) < 0.3 && yr > 0.6) ? Math.min(0.2, (yr - 0.6) * 0.12) : 0;
          P.shuf = (P.shuf || 0) + (shufWant - (P.shuf || 0)) * (1 - Math.exp(-dt * 8));   // biên độ nhích chân lên/xuống dần, không bật tắt đột ngột
          if (direct) P.shuf = 0;
          else if (P.shuf > 0.002) { const sh = P.shuf * Math.sin(t * 11); P.joints[0].rotation.x += sh; P.joints[1].rotation.x -= sh; }
        }
        // ---- IK 2 KHỚP cho chân kỹ sư (giải tích bằng định lý cos: đùi 0,42 · cẳng 0,36 · cổ chân→đế 0,10, đơn vị cục bộ) + cổ chân giữ đế phẳng ----
        //  Đứng / đổi dáng (FK): dáng giả định mặt đất PHẲNG ngang tâm người; địa hình voxel có bậc ⇒ mỗi bàn chân dời đúng độ chênh mặt đất dưới nó,
        //  hông hạ theo chân thấp hơn (có giới hạn), chân cao hơn gập gối với tới như bước lên bậc.
        //  ĐI BỘ (engWalkFeet): bàn chân trụ CỐ ĐỊNH trên đất (toạ độ thế giới) — gót chạm đất (mũi hếch ~13°) → cả bàn phẳng → nhón gót lăn qua mũi
        //  (~32°) rồi nhấc; chân vung theo cung tới điểm đáp phía trước (sải theo tốc độ). Chậu hông theo cơ sinh học dáng đi (Saunders 1953 và đo đạc sau
        //  này): cao nhất giữa pha một chân trụ, thấp nhất lúc 2 chân cùng chạm (~2 cm); lắc ngang về chân trụ (~2 cm); xoay ngang ±4° (hông bên chân
        //  bước tới đi trước); chậu nghiêng ±2,5° (bên chân vung hạ xuống) — ngực vặn và nghiêng NGƯỢC lại để đầu giữ yên. Tay vung ngược chân cùng bên.
        //  Chạy SAU lớp tư thế, chỉ đổi phần hiển thị (khung sau lại lấy tư thế đích gốc).
        const ENG_L1 = 0.42, ENG_L2 = 0.36, ENG_SOLE = 0.10, ENG_HIP_Y = 1.18, _ikW = new THREE.Vector3(), _ikQ = new THREE.Quaternion(), _ikM = new THREE.Matrix4(), _ikA = new THREE.Vector3(), _ikB = new THREE.Vector3(), _ikC = new THREE.Vector3(), _ikP = new THREE.Vector3();
        const ikSmooth = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
        const ENG_HEEL = 0.135, ENG_BALL = 0.13, ENG_FP_STRIKE = -0.22, ENG_FP_OFF = 0.55, _wkH = new THREE.Vector3(), _wkT = new THREE.Vector3();
        function engAnkleAt(p, fx, fz, fp, S, out) {   // cổ chân (thế giới) của bàn chân đặt tại p (điểm đất dưới cổ chân khi phẳng), mũi hướng (fx, fz), góc bàn fp (+ = nhón gót, − = hếch mũi)
          const c = Math.cos(fp), s = Math.sin(fp);
          if (fp >= 0) { const f = (ENG_BALL - ENG_BALL * c + ENG_SOLE * s) * S; return out.set(p.x + fx * f, p.y + (ENG_BALL * s + ENG_SOLE * c) * S, p.z + fz * f); }   // xoay quanh khớp ngón (mũi bàn)
          const f = (-ENG_HEEL + ENG_HEEL * c + ENG_SOLE * s) * S; return out.set(p.x + fx * f, p.y + (-ENG_HEEL * s + ENG_SOLE * c) * S, p.z + fz * f);   // xoay quanh gót
        }
        function engWalkReset(e) { if (e.wk) e.wk.on = false; e.walkW = 0; e.pelvisYaw = e.pelvisList = 0; }
        function engWalkFeet(e, dt, onFoot) {   // trạng thái 2 bàn chân khi đi; trả về e.wk (đang dùng) hoặc null
          const g = e.g, S = g.scale.y, walking = onFoot && e.walking;
          const K = e.wk || (e.wk = { on: false, feet: [0, 1].map(() => ({ w: new THREE.Vector3(), s0: new THREE.Vector3(), tg: new THREE.Vector3(), a: new THREE.Vector3(), fx: 0, fz: 1, sw: false, mode: '', u: 0, fp: 0, fp0: 0 })) });
          const yaw = g.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
          const home = (i, out) => { out.set(g.position.x + rx * (i ? 0.15 : -0.15) * S, 0, g.position.z + rz * (i ? 0.15 : -0.15) * S); out.y = cowY(out.x, out.z); return out; };
          if (!onFoot) { engWalkReset(e); return null; }
          if (!K.on) {
            if (!walking) { e.walkW = 0; return null; }
            K.feet.forEach((F, i) => { home(i, F.w); F.fx = fx; F.fz = fz; F.sw = false; F.fp = 0; engAnkleAt(F.w, fx, fz, 0, S, F.a); }); K.on = true;
          }
          const k = Math.min(1, (e.vel || 0) / 1.1), stride = e.gStride || 1.35, duty = 0.6 + 0.05 * (1 - k), phi = (((e.gait || 0) / TAU + 0.25) % 1 + 1) % 1;
          const ease = x => ikSmooth(0, 1, x), moving = walking && (e.vel || 0) > 0.05;
          let swinging = K.feet.reduce((n, F) => n + (F.sw ? 1 : 0), 0), settled = 0;
          K.feet.forEach((F, i) => {
            home(i, _wkH);
            if (F.sw && F.mode === 'gait' && !moving) { F.mode = 'settle'; F.u = 0; F.s0.copy(F.a); F.fp0 = F.fp; }   // dừng giữa bước: đưa chân về chỗ đứng
            if (F.sw && F.mode === 'settle') {
              F.u += dt / 0.32; const u = Math.min(1, F.u);
              engAnkleAt(_wkH, fx, fz, 0, S, _wkT); F.a.lerpVectors(F.s0, _wkT, ease(u)); F.a.y += Math.sin(Math.PI * u) * 0.05 * S; F.fp = F.fp0 * (1 - ease(u));
              if (F.u >= 1) { F.sw = false; F.w.copy(_wkH); F.fx = fx; F.fz = fz; F.fp = 0; swinging--; }
            } else if (moving) {
              const ph = (phi + i * 0.5) % 1, inSwing = ph >= duty;
              if (inSwing && !F.sw) { F.sw = true; F.mode = 'gait'; F.s0.copy(F.a); F.fp0 = F.fp; swinging++; }
              if (F.sw && F.mode === 'gait') {
                const u = inSwing ? (ph - duty) / (1 - duty) : 1, ahead = ((1 - u) * (1 - duty) + duty * 0.5) * stride;
                F.tg.set(_wkH.x + fx * ahead, 0, _wkH.z + fz * ahead); F.tg.y = cowY(F.tg.x, F.tg.z);
                engAnkleAt(F.tg, fx, fz, ENG_FP_STRIKE, S, _wkT);
                const dy = _wkT.y - F.s0.y, eu = ease(u);
                F.a.lerpVectors(F.s0, _wkT, eu); F.a.y = F.s0.y + dy * (dy > 0 ? ease(u * 1.7) : ease(u * 1.7 - 0.7)) + Math.sin(Math.PI * Math.pow(u, 0.8)) * 0.075 * S;   // nhấc gót sớm, đáp thấp; lên bậc: nhấc trước rồi mới đưa tới
                F.fp = F.fp0 * (1 - u) * (1 - u) + ENG_FP_STRIKE * u * u;   // vừa nhấc mũi còn chúc → giữa bước bàn chân ngang → hếch mũi đón gót chạm
                if (!inSwing) { F.sw = false; F.w.copy(F.tg); F.fx = fx; F.fz = fz; swinging--; }
              }
              if (!F.sw) {   // pha trụ: gót chạm → cả bàn → nhón gót
                const s = (ph % 1) / duty; F.fp = s < 0.12 ? ENG_FP_STRIKE * (1 - s / 0.12) : s > 0.62 ? ENG_FP_OFF * Math.pow(Math.min(1, (s - 0.62) / 0.38), 2) : 0;
                engAnkleAt(F.w, F.fx, F.fz, F.fp, S, F.a);
                // bị bỏ quá xa (ngoặt gắt, xoay người) ⇒ bước bắt kịp
                if (swinging < 1 && (Math.hypot(F.w.x - _wkH.x, F.w.z - _wkH.z) > 0.75 * stride || Math.abs((F.w.x - _wkH.x) * fz - (F.w.z - _wkH.z) * fx) > 0.2 * S)) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.a); F.fp0 = F.fp; swinging++; }
              }
            } else if (!F.sw) {   // đứng: bàn chân phẳng dần; lệch chỗ thì nhích từng chân
              F.fp *= Math.max(0, 1 - dt * 10); engAnkleAt(F.w, F.fx, F.fz, F.fp, S, F.a);
              const d = Math.hypot(F.w.x - _wkH.x, F.w.z - _wkH.z) + Math.abs(F.fx * fz - F.fz * fx) * 0.3;
              if (d > 0.07 * S && swinging < 1) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.a); F.fp0 = F.fp; swinging++; }
              else if (d < 0.02 && Math.abs(F.fp) < 0.01) settled++;
            }
          });
          if (!walking && settled === 2) { K.on = false; e.walkW = Math.max(0, (e.walkW || 0) - dt * 8); return e.walkW > 0 ? K : null; }   // 2 chân đã về chỗ đứng ⇒ trả lại cho dáng đứng (FK)
          e.walkW = Math.min(1, (e.walkW || 0) + dt * 8);
          // chậu hông (đv thế giới / rad), nhân theo tốc độ: hạ thấp + nảy (gối hơi chùng ⇒ chân với tới gót chạm / mũi nhấc) · lắc ngang · xoay · nghiêng
          const m = Math.min(1, (e.vel || 0) / 0.6) * (moving ? 1 : 0), mid = duty * 0.5;
          K.bob = (0.021 * Math.cos(4 * Math.PI * (phi - mid)) - 0.03) * m; K.lat = -0.018 * m * Math.cos(2 * Math.PI * (phi - mid));   // + = về phía chân phải (+x)
          K.yaw = 0.07 * m * Math.cos(2 * Math.PI * phi); K.list = -0.045 * m * Math.cos(2 * Math.PI * (phi - mid));
          return K;
        }
        function engFootIK(e, dt) {
          const g = e.g, P = e.pose;
          if (e.seatCtl) { e.ikW = 0; e.ikPelvis = 0; engWalkReset(e); if (e.abdOn) { e.legs[0].rotation.y = e.legs[1].rotation.y = e.ankles[0].rotation.z = e.ankles[1].rotation.z = 0; e.abdOn = false; } return; }   // ngồi / đứng dậy: bộ điều khiển ghế tự giải IK bàn chân bám đất
          const onFoot = !!P && !e.noFootIK && g.parent === scene && !e.inVan && e.phase !== 'van' && e.phase !== 'pet' && Math.abs(e.legs[0].rotation.x) < 0.95 && Math.abs(e.legs[1].rotation.x) < 0.95 && e.knees[0].rotation.x < 1.15 && e.knees[1].rotation.x < 1.15;
          e.ikW = (e.ikW || 0) + ((onFoot ? 1 : 0) - (e.ikW || 0)) * (1 - Math.exp(-dt * 6));
          if (e.ikW < 0.01) { e.ankles[0].rotation.x = e.ankles[1].rotation.x = 0; e.ikPelvis = 0; engWalkReset(e); if (e.abdOn) { for (let i = 0; i < 2; i++) e.legs[i].rotation.z = e.legs[i].rotation.y = e.ankles[i].rotation.z = 0; e.abdOn = false; } return; }
          const S = g.scale.y, K = engWalkFeet(e, dt, onFoot), ww = K ? (e.walkW || 0) : 0, w = Math.max(e.ikW, ww);   // đang đi: IK bàn chân trụ đủ trọng số ngay (không chờ IK địa hình hoà vào)
          if (ww > 0) {   // chậu hông theo nhịp bước (chỉ phần hiển thị)
            g.position.y += K.bob * ww; g.position.x += Math.cos(g.rotation.y) * K.lat * ww; g.position.z -= Math.sin(g.rotation.y) * K.lat * ww;
            g.rotation.y += K.yaw * ww; g.rotation.z += K.list * ww;
          }
          e.pelvisYaw = ww > 0 ? K.yaw * ww : 0; e.pelvisList = ww > 0 ? K.list * ww : 0;
          g.updateMatrixWorld(true);
          const plane = g.position.y + ENG_FEET, fk = [];
          let reach = 0;
          for (let i = 0; i < 2; i++) {   // vị trí cổ chân FK (mặt phẳng y–z cục bộ) → thế giới → độ chênh mặt đất dưới bàn chân
            const a = e.legs[i].rotation.x, b = e.knees[i].rotation.x;
            const ky = ENG_HIP_Y - ENG_L1 * Math.cos(a), kz = -ENG_L1 * Math.sin(a), ay = ky - ENG_L2 * Math.cos(a + b), az = kz - ENG_L2 * Math.sin(a + b);
            g.localToWorld(_ikW.set(i ? 0.15 : -0.15, ay, az));
            const lift = Math.max(0, (_ikW.y - ENG_SOLE * S) - plane);   // độ nhấc chân của nhịp bước (đv thế giới)
            const f = { a, b, ay, az, lift, delta: cowY(_ikW.x, _ikW.z) - plane, py: 0, pz: 0, ab: 0 };
            if (ww > 0) {   // bàn chân trụ cố định (cục bộ) · dạng/khép chân cho độ lệch ngang (chậu lắc, xoay, nghiêng) · hụt tầm với
              g.worldToLocal(_ikP.copy(K.feet[i].a)); const dx = _ikP.x - (i ? 0.15 : -0.15), dy = _ikP.y - ENG_HIP_Y;
              f.ab = Math.max(-0.3, Math.min(0.3, Math.atan2(dx, -dy))); f.py = ENG_HIP_Y - Math.hypot(dy, dx) * Math.cos(Math.atan2(dx, -dy) - f.ab); f.pz = _ikP.z;
              reach = Math.max(reach, Math.hypot(f.py - ENG_HIP_Y, f.pz) - (ENG_L1 + ENG_L2 - 0.012));
            }
            fk.push(f);
          }
          const po = Math.max(-0.42, Math.min(0.25, Math.min(fk[0].delta, fk[1].delta)));   // hạ hông tối đa ~0,5 m: bậc voxel cao hơn thì chân thấp hơi hổng
          const pT = po * (1 - ww) + Math.max(-0.42, -Math.max(0, reach) * S) * ww;   // khi đi: chỉ hạ hông nếu chân trụ / chân đáp ngoài tầm với
          e.ikPelvis = (e.ikPelvis || 0) + (pT - (e.ikPelvis || 0)) * (1 - Math.exp(-dt * 10));
          g.position.y += e.ikPelvis * w;
          for (let i = 0; i < 2; i++) {
            const f = fk[i];
            let ty = f.ay + (f.delta - e.ikPelvis) / S, tz = f.az;
            if (ww > 0) { ty += (f.py - e.ikPelvis * w / S - ty) * ww; tz += (f.pz - tz) * ww; }
            const vy = ty - ENG_HIP_Y, vz = tz, d = Math.min(ENG_L1 + ENG_L2 - 1e-4, Math.max(0.08, Math.hypot(vy, vz)));
            const kneeIK = Math.PI - Math.acos(Math.max(-1, Math.min(1, (ENG_L1 * ENG_L1 + ENG_L2 * ENG_L2 - d * d) / (2 * ENG_L1 * ENG_L2))));
            const hipIK = -(Math.atan2(vz, -vy) + Math.acos(Math.max(-1, Math.min(1, (ENG_L1 * ENG_L1 + d * d - ENG_L2 * ENG_L2) / (2 * ENG_L1 * d)))));   // gối luôn chĩa ra trước
            const a = f.a + (hipIK - f.a) * w, b = f.b + (kneeIK - f.b) * w;
            e.legs[i].rotation.x = a; e.knees[i].rotation.x = b;
            if (ww > 0 || e.abdOn) {   // dạng chân · xoay trong/ngoài để bàn chân trụ giữ đúng hướng lúc đặt (chậu xoay, người ngoặt) — rời IK đi bộ thì về 0
              const F = K && K.feet[i]; let tw = 0;
              if (F) { tw = F.sw ? 0 : Math.max(-0.45, Math.min(0.45, Math.atan2(Math.sin(Math.atan2(F.fx, F.fz) - g.rotation.y), Math.cos(Math.atan2(F.fx, F.fz) - g.rotation.y)))); F.tw = (F.tw || 0) + (tw - (F.tw || 0)) * Math.min(1, dt * (F.sw ? 8 : 30)); tw = F.tw; }
              e.legs[i].rotation.z = f.ab * ww; e.legs[i].rotation.y = tw * ww; e.ankles[i].rotation.z = -f.ab * ww;
            }
            const plant = 1 - ikSmooth(0.03, 0.15, f.lift);   // chân trụ: đế phẳng theo mặt đất · chân đang vung: để mũi giày buông tự nhiên
            const fpk = ww > 0 ? K.feet[i].fp : 0;
            e.ankles[i].rotation.x = -(g.rotation.x + a + b) * (plant * (w - ww) + ww) + fpk * ww;   // khi đi: góc bàn chân theo gót–bàn–mũi
          }
          e.abdOn = ww > 0;
        }
        // ---- KHUỶU TAY + EO (chạy cuối khung, sau cả cần câu): mọi pha vẫn ghi "góc vai" θ của tay thẳng (tâm bàn tay cách vai D = 0,66);
        //      ở đây giải IK 2 đoạn (định lý cos) cho tay 0,28 + 0,40 tới ĐÚNG điểm ấy: vai lùi α, khuỷu gập φ (luôn về trước, không gập ngược),
        //      cổ tay bù (φ − α) ⇒ bàn tay & đồ đang cầm giữ đúng hướng đã thiết kế. Khung sau lớp tư thế lại trả θ gốc nên không cộng dồn.
        //      Dáng đi (nghiên cứu dáng đi người: khuỷu ~15–20° khi tay lùi sau, ~40–50° khi vung trước; ngực vặn NGƯỢC chậu hông ±3–5°):
        //      tay vung trước kéo bàn tay gần vai hơn ⇒ khuỷu gập thêm; eo vặn theo nhịp bước. Pha có thể đặt e.elbowFlexT[i] (gập thêm,
        //      đơn vị = rút ngắn khoảng vai–tay) và e.spineT = {x: cúi(+)/ngửa(−), y: vặn} (vd hái táo: ngửa người với cao, cúi bỏ táo vào giỏ).
        const ENG_ARM_D = 0.66;
        //      engArmSolve(e, i): giải 1 tay, mỗi khung 1 lần — pha cần vị trí tay THẬT giữa khung (tay cầm cần câu trước khi đọc ngọn/khoen) gọi sớm,
        //      engArmPost bỏ qua tay đã giải. e.handW[i] = tâm bàn tay cuối khung trước (đồ cầm ở tay kia: cá, mồi).
        function engArmSolve(e, i, dt) {
          const S = e.armDone || (e.armDone = [0, 0, 0]), L1 = ENG_ARM_L1, L2 = ENG_ARM_L2, kf = 1 - Math.exp(-dt * 6), sp = e.spine;
          const RT = e.reachT, RW = e.reachW || (e.reachW = [0, 0]), RL = e.reachL || (e.reachL = [new THREE.Vector3(), new THREE.Vector3()]);
          if (!S[2]) {   // eo + nhịp vung tay: 1 lần/khung
            S[2] = 1;
            e.armWalk = (e.armWalk || 0) + ((e.walking ? Math.min(1, (e.vel || 0) / 1.1) : 0) - (e.armWalk || 0)) * kf;
            const st = e.spineT || { x: 0, y: 0 }, sv = e.spineV || (e.spineV = { x: 0, y: 0 });
            sv.x += (st.x - sv.x) * kf; sv.y += (st.y - sv.y) * kf;
            const pw = Math.min(1, e.walkW || 0);   // ngực vặn + nghiêng NGƯỢC chậu hông (đầu, vai giữ yên); IK chân tắt thì vặn theo nhịp cũ
            sp.rotation.set(sv.x + (e.waistBend || 0), sv.y - 1.6 * (e.pelvisYaw || 0) + 0.07 * Math.sin(e.gait || 0) * e.armWalk * (1 - pw), -0.9 * (e.pelvisList || 0));
            e.spineT = null;
            if ((RT && (RT[0] || RT[1])) || RW[0] > 1e-3 || RW[1] > 1e-3) { e.g.updateMatrixWorld(true); }
          }
          if (S[i]) return; S[i] = 1;
          const fx = e.elbowFlex || (e.elbowFlex = [0, 0]), ft = e.elbowFlexT || [0, 0];
          // với tới điểm thế giới (e.reachT[i], pha đặt mỗi khung: điểm nắm trên sào, quả, giỏ…) — hướng vai + khoảng vai–tay, hoà vào dần
          fx[i] += (ft[i] - fx[i]) * kf;
          const A = e.arms[i]; A.rotation.y = 0; let th = A.rotation.x;   // (xoắn trục y chỉ do IK chính xác đặt ở khung trước)
          const fwd = Math.max(0, Math.min(1, -th / 0.45)) * e.armWalk;
          let D = Math.max(0.3, Math.min(L1 + L2 - 1e-3, ENG_ARM_D - 0.04 * fwd - fx[i]));
          const tgt = RT && RT[i]; if (tgt) RL[i].copy(tgt);
          RW[i] += ((tgt ? 1 : 0) - RW[i]) * (1 - Math.exp(-dt * 7));
          if (RW[i] > 1e-3) {
            const v = sp.worldToLocal(_ikW.copy(RL[i])).sub(A.position), dl = v.length() || 1;
            const gm = Math.asin(Math.max(-1, Math.min(1, v.x / dl))), tr = Math.atan2(-v.z, -v.y), w = RW[i];
            th = th + Math.atan2(Math.sin(tr - th), Math.cos(tr - th)) * w; A.rotation.z += (gm - A.rotation.z) * w;
            D = D + (Math.max(0.3, Math.min(L1 + L2 - 1e-3, dl)) - D) * w;
          }
          const phi = Math.PI - Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + L2 * L2 - D * D) / (2 * L1 * L2))));
          const al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D))));
          if (RW[i] > 1e-3) {   // có đích với tay: IK CHÍNH XÁC (hệ eo) — khuỷu theo vectơ cực chĩa xuống–ra ngoài, cánh tay trên xoay đúng mặt phẳng vai–khuỷu–tay
            const cg = Math.cos(A.rotation.z), u = _ikP.set(Math.sin(A.rotation.z), -cg * Math.cos(th), -cg * Math.sin(th));   // hướng vai→tay đã hoà (thứ tự XYZ)
            const a = (L1 * L1 - L2 * L2 + D * D) / (2 * D), hh = Math.sqrt(Math.max(0, L1 * L1 - a * a));
            const pole = e.elbowPole && e.elbowPole[i] ? _ikA.copy(e.elbowPole[i]) : _ikA.set(i ? 0.6 : -0.6, -1, -0.15); pole.addScaledVector(u, -pole.dot(u)).normalize();   // e.elbowPole: pha tự chọn hướng khuỷu (ăn: khép sát thân)
            const E = _ikB.copy(u).multiplyScalar(a).addScaledVector(pole, hh);                       // khuỷu (so với vai)
            const yA = _ikW.copy(E).negate().normalize(), f = _ikC.copy(u).multiplyScalar(D).sub(E).normalize();   // trục +y cánh tay trên · hướng cẳng tay
            (e.foreW || (e.foreW = [new THREE.Vector3(), new THREE.Vector3()]))[i].copy(f).transformDirection(sp.matrixWorld);   // hướng cẳng tay thế giới (khuỷu → tay) cho pha khung sau: cổ tay thẳng
            const zA = f.addScaledVector(yA, -f.dot(yA)).normalize(), xA = _ikA.crossVectors(yA, zA);   // cẳng tay gập về +z cục bộ
            A.quaternion.setFromRotationMatrix(_ikM.makeBasis(xA, yA, zA)); e.elbows[i].rotation.x = -phi; e.wrists[i].rotation.x = phi - al;
          } else { A.rotation.x = th + al; e.elbows[i].rotation.x = -phi; e.wrists[i].rotation.x = phi - al; }
          // hướng bàn tay (e.handQ[i]: quaternion thế giới của khung cổ tay, pha đặt mỗi khung — thìa vào miệng, mép sách, que cá):
          // cổ tay gập/ngửa + cẳng tay sấp/ngửa gộp thành 1 phép quay ở cổ tay (tay LEGO xoay ở cổ tay), hoà vào/ra dần
          const hq = e.handQ && e.handQ[i], HW = e.handQW || (e.handQW = [0, 0]), HL = e.handQL || (e.handQL = [new THREE.Quaternion(), new THREE.Quaternion()]);
          if (hq) HL[i].copy(hq);
          HW[i] += ((hq ? 1 : 0) - HW[i]) * (1 - Math.exp(-dt * 8));
          if (HW[i] > 1e-3) { e.elbows[i].updateWorldMatrix(true, false); e.elbows[i].getWorldQuaternion(_ikQ).invert().multiply(HL[i]); e.wrists[i].quaternion.slerp(_ikQ, HW[i]); }
        }
        function engArmPost(e, dt) {
          if (!e.elbows) return;
          engArmSolve(e, 0, dt); engArmSolve(e, 1, dt);
          const W = e.handW || (e.handW = [new THREE.Vector3(), new THREE.Vector3()]); e.wrists[0].getWorldPosition(W[0]); e.wrists[1].getWorldPosition(W[1]);
          if (e.elbowFlexT) e.elbowFlexT[0] = e.elbowFlexT[1] = 0;
          e.reachT = null; e.handQ = null; e.elbowPole = null; e.armDone.fill(0);
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
          let nx = e.g.position.x + mx * step, nz = e.g.position.z + mz * step;
          if (COL.ready && step > 0 && COL_M.eng) {   // vật cản thật chưa có trong bảng né (gốc cây, chân cột, đồ vặt): men theo; kẹt thì đứng (core/collide.js)
            const mv = colSlide(COL_M.eng, e.g.position.x, e.g.position.z, Math.atan2(mz, mx), step, dt);
            if (!mv) { e.vel *= 0.5; e.walking = true; return false; }
            nx = mv[0]; nz = mv[1];
          }
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

