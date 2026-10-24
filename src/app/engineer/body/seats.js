        // ====== KỸ SƯ DÙNG GHẾ THEO SINH CƠ HỌC: đi tới trước ghế → quay lưng → lùi chạm mép ghế → ngồi xuống · đứng dậy → rời ghế theo làn ======
        // Tư liệu: Schenkman và cs. 1990 — đứng dậy 4 pha: (1) dồn đà, cúi thân khi mông còn trên ghế; (2) rời ghế / chuyển đà — lúc kém vững nhất,
        // trọng tâm còn lùi sau bàn chân; (3) duỗi gối–hông (~60% thời gian, cả động tác ~1,1–1,3 s); (4) ổn định. Ngồi xuống: pha cúi thân dài hơn
        // và gập thân sâu hơn lúc đứng dậy, hạ người có kiểm soát (cơ đùi co ly tâm); có tay vịn thì gập hông ít hơn (~49° so với ~63°).
        // Quay người: đầu–mắt dẫn trước, thân rồi chân nhích theo. Hướng dẫn lâm sàng: lùi tới khi bắp chân chạm mép ghế, với tay ra sau nắm tay vịn
        // rồi mới hạ người; đứng dậy thì nhích ra nửa trước mặt ghế, đặt bàn chân lùi sau gối, "mũi qua ngón chân" rồi mới duỗi.
        // Mặt ghế xếp cao ~0,52 m ≈ 71% chiều dài chân kỹ sư (như người lớn ngồi ghế quầy) ⇒ mông chạm nửa trước mặt ghế, nhích lùi vào lòng ghế,
        // bàn chân rời đất buông thõng; đứng dậy làm ngược lại. Hông và thân đi theo quỹ đạo giật tối thiểu (Flash–Hogan): vận tốc, gia tốc = 0 ở hai đầu.
        const SEAT_S = ENGINEER_BASE_SCALE * CAMP_SCALE, SEAT_HIP = ENG_HIP_Y * SEAT_S - ENG_FEET, SEAT_ANK = ENG_SOLE * SEAT_S, SEAT_LEGX = 0.15 * ENG_SLIM * SEAT_S;
        const SEAT_T_SIT = 2.3, SEAT_T_RISE = 2.2;   // giây: ngồi xuống (với tay vịn → hạ người → chạm ghế → nhích lùi) · đứng dậy (nhích ra mép → dồn đà → duỗi → ổn định)
        const minJerk = s => { s = Math.max(0, Math.min(1, s)); return s * s * s * (10 + s * (6 * s - 15)); };
        const segK = (u, a, b) => Math.max(0, Math.min(1, (u - a) / (b - a)));
        const _sp = new THREE.Vector3(), _sa = new THREE.Vector3(), _sb = new THREE.Vector3(), _sw = new THREE.Vector3();
        // toạ độ cục bộ ghế (đv thế giới): x sang phải ghế, z ra phía trước mặt ghế
        const seatW = (C, lx, lz, out = new THREE.Vector3()) => out.set(C.pos.x + C.xx * lx + C.fx * lz, C.pos.y, C.pos.z + C.xz * lx + C.fz * lz);
        const seatL = (C, x, z) => { const dx = x - C.pos.x, dz = z - C.pos.z; return [dx * C.xx + dz * C.xz, dx * C.fx + dz * C.fz]; };
        function makeSeat(o) {   // mô tả ghế: hông khi ngồi (seatZ), chỗ đứng trước mặt ghế (standZ), tay vịn, vùng cấm quanh ghế, làn tiếp cận (điểm cuối = chỗ quay người)
          const C = Object.assign({ seatZ: 0.144, standZ: 0.50, seatDrop: 0.53 * CAMP_SCALE, legs: [-1.48, -1.42], knees: [1.32, 1.25],
            arm: { x: 0.436, y: 0.83, z0: -0.32, z1: 0.30 }, keep: [0.74, -0.70, 0.56], lane: [], props: [], ground: (x, z) => cowY(x, z) }, o);
          C.fx = Math.sin(C.yaw); C.fz = Math.cos(C.yaw); C.xx = Math.cos(C.yaw); C.xz = -Math.sin(C.yaw);
          C.hipSeat = ENG_HIP_Y * SEAT_S - engSitDrop(1, C.seatDrop);   // khớp hông trên mặt đất khi đã ngồi hẳn
          if (C.contactZ === undefined) C.contactZ = C.seatZ + 0.12;      // mông chạm nửa trước mặt ghế rồi mới nhích lùi
          C.laneW = C.lane.map(([lx, lz]) => seatW(C, lx, lz));
          C.laneLen = C.lane.slice(1).map((p, i) => Math.hypot(p[0] - C.lane[i][0], p[1] - C.lane[i][1]));
          C.turn = C.lane.length ? C.lane[C.lane.length - 1] : [0, C.standZ + 0.2];
          return C;
        }
        // ghế câu: trước mặt chỉ còn dải đất ~0,3 m tới bậc xuống hồ, nước ở góc trái–trước, xô tôn bên trái, cọc đèn lồng sau–trái, vùng cột khí tượng
        // sau–phải ⇒ làn vào từ phía sau–trái: vòng ngoài xô → góc trái–trước (tay không quệt đầu tay vịn) → điểm quay giữa mặt ghế
        const FISH_SEAT = makeSeat({ name: 'fish', outdoor: true, pos: engObj.wp[3].clone(), yaw: engObj.faceWater,
          lane: [[-1.35, -0.45], [-1.30, 0.28], [-0.65, 0.72], [0, 0.62]] });
        // ghế cắm trại: phía trước thoáng (bàn trà sát tay vịn phải, xe van phía sau, bếp lửa trước–trái) ⇒ vào thẳng từ phía trước
        const CAMP_SEAT = makeSeat({ name: 'camp', outdoor: true, pos: campChairPos.clone(), yaw: campChairFaceY,
          lane: [[0.35, 1.30], [0, 0.75]] });
        const ENG_PROPS = [];   // vật nhỏ quanh 2 ghế: đi thường (lang thang, ra cột khí tượng, tới chó) cũng phải vòng tránh
        {
          const push = (C, w, r) => { ENG_PROPS.push({ x: w.x, z: w.z, r }); const [lx, lz] = seatL(C, w.x, w.z); C.props.push([lx, lz, r]); };
          for (const C of [FISH_SEAT, CAMP_SEAT]) ENG_PROPS.push(Object.assign({ r: 0.75 }, (({ x, z }) => ({ x, z }))(seatW(C, 0, -0.03))));   // vòng đẩy phủ cả 4 góc ghế (tay vịn, chân sau)
          push(FISH_SEAT, seatW(FISH_SEAT, -0.83, -0.05), 0.15);                         // xô tôn
          if (lanternObj) push(FISH_SEAT, lanternObj.g.position, 0.22);                  // cọc đèn lồng
          const table = scene.getObjectByName('Bàn trà (Camp Table)'); if (table) push(CAMP_SEAT, table.position, 0.66);   // bàn trà to thêm 25% (17/10): nửa đường chéo 0,51 m
          // chân chống bạt + đèn lồng treo mép bạt (đáy ~1,4 m — ngang đầu): G 24/10 "engineer đang bị lỗi" — kiểm tra cả ngày thấy đi xuyên cột bạt khi về ghế, xuyên đèn khi ra ghế câu
          caravanObj.updateMatrixWorld(true);
          for (const [lx, lz] of caravanObj.userData.awPoles || []) { push(CAMP_SEAT, caravanObj.localToWorld(new THREE.Vector3(lx, 0, lz)), 0.12); ENG_PROPS[ENG_PROPS.length - 1].nav = true; }
          if (awLan) { push(CAMP_SEAT, awLan.getWorldPosition(new THREE.Vector3()), 0.2); ENG_PROPS[ENG_PROPS.length - 1].nav = true; }
          // ghế vào lưới cấm của bảng DP (mọi bảng dựng sau đây — cột khí tượng, gấu mèo, chó, thỏ, bò — đều đi vòng ghế)
          for (const C of [FISH_SEAT, CAMP_SEAT]) {
            const i0 = Math.max(0, Math.floor(x2gi(C.pos.x - 1.2))), i1 = Math.min(GX - 1, Math.ceil(x2gi(C.pos.x + 1.2)));
            const j0 = Math.max(0, Math.floor(z2gj(C.pos.z - 1.2))), j1 = Math.min(GZ - 1, Math.ceil(z2gj(C.pos.z + 1.2)));
            for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
              const [lx, lz] = seatL(C, wx(i), wz(j)); if (Math.abs(lx) < 0.73 && lz > -0.69 && lz < 0.47) ffBlocked[i + j * GX] = 1;
            }
          }
          for (const o of ENG_PROPS.slice(2)) {   // xô, cọc đèn lồng, bàn trà: ô chứa tâm + các ô trong bán kính vào lưới cấm (bảng DP không dẫn xuyên qua)
            const rr = o.r + 0.15, ic = Math.round(x2gi(o.x)), jc = Math.round(z2gj(o.z)); ffBlocked[ic + jc * GX] = 1;
            for (let j = Math.max(0, jc - 2); j <= Math.min(GZ - 1, jc + 2); j++) for (let i = Math.max(0, ic - 2); i <= Math.min(GX - 1, ic + 2); i++) if (Math.hypot(wx(i) - o.x, wz(j) - o.z) < rr) ffBlocked[i + j * GX] = 1;
          }
          FISH_SEAT.field = buildFlowField(FISH_SEAT.laneW[0].x, FISH_SEAT.laneW[0].z);   // bảng DP tới cửa vào làn
          CAMP_SEAT.field = buildFlowField(CAMP_SEAT.laneW[0].x, CAMP_SEAT.laneW[0].z);
        }
        function seatSegClear(C, ax, az, bx, bz, maxLen = 1.6) {   // đoạn a→b (cục bộ ghế) đi được: ngoài vùng cấm quanh ghế, cách vật nhỏ, đất liền cùng mặt bằng
          let dx = bx - ax, dz = bz - az; const L = Math.hypot(dx, dz); if (L < 1e-4) return true;
          const len = Math.min(L, maxLen); dx /= L; dz /= L;
          for (let s = 0.06; s <= len + 1e-6; s += 0.06) {
            const x = ax + dx * s, z = az + dz * s;
            if (Math.abs(x) < C.keep[0] && z > C.keep[1] && z < C.keep[2]) return false;
            for (const [px, pz, r] of C.props) if (Math.hypot(x - px, z - pz) < r + 0.24) return false;
            if (C.outdoor) { const w = seatW(C, x, z, _sw), gi = Math.round(x2gi(w.x)), gj = Math.round(z2gj(w.z)); if (isWater(gi, gj) || Math.abs(cowY(w.x, w.z) - C.pos.y) > 0.25) return false; }
          }
          return true;
        }
        function engLineClearOfSeats(x0, z0, x1, z1) {   // đường thẳng (thế giới) không cắt vùng cấm quanh 2 ghế ngoài trời
          for (const C of [FISH_SEAT, CAMP_SEAT]) {
            const [ax, az] = seatL(C, x0, z0), [bx, bz] = seatL(C, x1, z1), L = Math.hypot(bx - ax, bz - az);
            for (let d = 0; d <= L; d += 0.1) { const k = L > 1e-3 ? d / L : 0, lx = ax + (bx - ax) * k, lz = az + (bz - az) * k; if (Math.abs(lx) < C.keep[0] && lz > C.keep[1] && lz < C.keep[2]) return false; }
          }
          return true;
        }
        function seatJoin(C, x, z) {   // nhập làn ở điểm cho tổng quãng ngắn nhất mà đoạn nối tới nó thông thoáng (−1: chưa nhập được)
          const [lx, lz] = seatL(C, x, z); if (Math.hypot(lx, lz) > 2.8) return -1;
          let best = -1, bestD = 1e9, tail = 0;
          for (let i = C.lane.length - 1; i >= 0; i--) {
            if (i < C.lane.length - 1) tail += C.laneLen[i];
            const d = Math.hypot(C.lane[i][0] - lx, C.lane[i][1] - lz);
            if (d + tail < bestD && seatSegClear(C, lx, lz, C.lane[i][0], C.lane[i][1], 9)) { bestD = d + tail; best = i; }
          }
          return best;
        }
        function engGroupMatrix(g) { g.updateMatrix(); if (g.parent) g.matrixWorld.multiplyMatrices(g.parent.matrixWorld, g.matrix); else g.matrixWorld.copy(g.matrix); }
        function engPlaceHip(e, H, lam, yaw) {   // gốc nhóm = H − R·(0, hông, 0): gập/ngả thân quay quanh KHỚP HÔNG (không quanh gốc dưới gót giày)
          const g = e.g, h = ENG_HIP_Y * g.scale.y, sl = Math.sin(lam);
          g.rotation.set(lam, yaw, 0);
          g.position.set(H.x - Math.sin(yaw) * h * sl, H.y - h * Math.cos(lam), H.z - Math.cos(yaw) * h * sl);
        }
        function engLegIK(e, ankW) {   // IK 2 khớp (định lý cos) tới cổ chân cho trước (thế giới) → [hông, gối] cục bộ; gối luôn chĩa ra trước
          const p = e.g.worldToLocal(_sb.copy(ankW)), vy = p.y - ENG_HIP_Y, vz = p.z;
          const d = Math.min(ENG_L1 + ENG_L2 - 1e-4, Math.max(0.1, Math.hypot(vy, vz)));
          const knee = Math.PI - Math.acos(Math.max(-1, Math.min(1, (ENG_L1 * ENG_L1 + ENG_L2 * ENG_L2 - d * d) / (2 * ENG_L1 * ENG_L2))));
          return [-(Math.atan2(vz, -vy) + Math.acos(Math.max(-1, Math.min(1, (ENG_L1 * ENG_L1 + d * d - ENG_L2 * ENG_L2) / (2 * ENG_L1 * d))))), knee];
        }
        // dáng ở ghế: hông (hx, hz cục bộ ghế; hy trên mặt đất), gập thân lam quanh hông, wp = mức bàn chân bám đất (1: đặt phẳng tại feet[] · 0: buông theo dáng ngồi)
        function engSeatPose(e, C, hx, hz, hy, lam, wp, feet, swing = 0, t = 0) {
          seatW(C, hx, hz, _sp); _sp.y = C.pos.y + hy;
          engPlaceHip(e, _sp, lam, C.yaw);
          if (wp > 0.001) engGroupMatrix(e.g);
          for (let i = 0; i < 2; i++) {
            let a = C.legs[i] - lam, b = C.knees[i] + swing * Math.sin(t * 2.3 + i * 2.2);   // đùi giữ hướng thế giới khi thân gập · cẳng chân buông đung đưa nhẹ
            if (wp > 0.001) { const ik = engLegIK(e, feet[i]); a += (ik[0] - a) * wp; b += (ik[1] - b) * wp; }
            e.legs[i].rotation.x = a; e.knees[i].rotation.x = b;
            e.ankles[i].rotation.x = -(lam + a + b) + 0.18 * (1 - wp);   // đế phẳng khi chạm đất · mũi giày chúc nhẹ khi buông thõng
          }
        }
        function engArmSupport(e, C, w) {   // với tay ra sau nắm tay vịn (găng tì đúng mặt trên tay vịn, sau vai) · ghế không tay vịn: chống tay hai bên mặt ghế
          const rt = e.armRollT || (e.armRollT = [0, 0]);
          if (w < 0.002) { e.arms[0].rotation.x = e.arms[1].rotation.x = 0; return; }
          if (!C.arm) { for (let i = 0; i < 2; i++) { e.arms[i].rotation.x = 0.3 * w; rt[i] = (i ? 1 : -1) * 0.2 * w; } return; }
          const g = e.g; engGroupMatrix(g);
          for (let i = 0; i < 2; i++) {
            const s = i ? 1 : -1, sh = g.localToWorld(_sa.set(s * 0.34 * ENG_SLIM, 1.86, 0)), [lx, lz] = seatL(C, sh.x, sh.z);
            const L = 0.66 * g.scale.y, hy = C.arm.y + 0.085, dxA = Math.abs(s * C.arm.x - lx), dyA = sh.y - C.pos.y - hy;
            const hz = Math.max(C.arm.z0, Math.min(C.arm.z1, lz - Math.sqrt(Math.max(0, L * L - dxA * dxA - dyA * dyA))));
            const hand = seatW(C, s * C.arm.x, hz, _sb); hand.y = C.pos.y + hy;
            const d = g.worldToLocal(hand).sub(_sa.set(s * 0.34 * ENG_SLIM, 1.86, 0)).normalize();
            e.arms[i].rotation.x = Math.atan2(-d.z, -d.y) * w;                 // gập vai ra sau
            rt[i] = Math.asin(Math.max(-1, Math.min(1, d.x))) * w;             // dang tay ra tới tay vịn
          }
        }
        function engSeatFeet(C, z) { return [-1, 1].map(s => { const p = seatW(C, s * SEAT_LEGX, z); p.y = C.ground(p.x, p.z) + SEAT_ANK; return p; }); }
        function engSeatStartSit(e, C, s) { const [lx, lz] = seatL(C, e.g.position.x, e.g.position.z); Object.assign(s, { st: 'sit', k: 0, x0: lx, z0: lz, feet: engSeatFeet(C, lz) }); }
        function engSeatStartRise(e, C, s) { Object.assign(s, { st: 'rise', k: 0, lam0: s.lam || 0, feet: engSeatFeet(C, C.standZ - 0.04) }); }   // bàn chân đặt lùi ~4 cm sau chỗ đứng cũ
        function engSitStep(e, C, s, dt, t) {   // stand-to-sit: với tay vịn → hạ người có kiểm soát (gập thân, đẩy hông ra sau) → chạm ghế, lún vải → nhích lùi, chân rời đất
          s.k = Math.min(1, s.k + dt / SEAT_T_SIT); const u = s.k;
          const a = segK(u, 0.16, 0.64), b = segK(u, 0.64, 0.73), sc = segK(u, 0.73, 1), yC = C.hipSeat + 0.022, sa = Math.sin(Math.PI * a), ss = Math.sin(Math.PI * sc);
          const hz = s.z0 + (C.contactZ - s.z0) * minJerk(Math.pow(a, 0.8)) + (C.seatZ - C.contactZ) * minJerk(sc);   // hông lùi đi trước, hạ theo sau
          const hy = SEAT_HIP - 0.012 * minJerk(segK(u, 0, 0.16)) + (yC - SEAT_HIP + 0.012) * minJerk(a) - 0.012 * minJerk(b) + (C.hipSeat - yC + 0.012) * minJerk(sc);
          const lam = 0.08 * minJerk(segK(u, 0, 0.16)) + 0.40 * sa * sa - 0.02 * minJerk(b) - 0.06 * minJerk(sc) - 0.03 * ss * ss;   // gập thân cực đại ~27° giữa pha hạ, ngả nhẹ khi nhích lùi
          engSeatPose(e, C, s.x0 * (1 - minJerk(a)), hz, hy, lam, 1 - minJerk(segK(u, 0.74, 0.93)), s.feet);
          engArmSupport(e, C, minJerk(segK(u, 0.02, 0.2)) * (1 - minJerk(segK(u, 0.8, 0.98))));
          e.head.rotation.x = 0.16 - 0.45 * lam + 0.05 * minJerk(sc);   // nhìn xuống sàn trước mặt khi hạ người
          s.lam = 0; return u >= 1;
        }
        function engRiseStep(e, C, s, dt, t) {   // sit-to-stand 4 pha: nhích ra mép + đặt chân → dồn đà gập thân → rời ghế, duỗi gối–hông → ổn định
          s.k = Math.min(1, s.k + dt / SEAT_T_RISE); const u = s.k;
          const p0 = segK(u, 0, 0.27), p1 = segK(u, 0.27, 0.48), p2 = segK(u, 0.46, 0.84), p3 = segK(u, 0.84, 1);
          const zC = C.contactZ + 0.01, yC = C.hipSeat + 0.02, zR = C.standZ - 0.04, s3 = Math.sin(Math.PI * p3);
          const hz = C.seatZ + (zC - C.seatZ) * minJerk(p0) + 0.02 * minJerk(p1) + (zR - zC - 0.02) * minJerk(Math.pow(p2, 0.8));   // hông tiến ra trước trên bàn chân
          const hy = C.hipSeat + (yC - C.hipSeat) * minJerk(p0) + (SEAT_HIP - yC) * minJerk(segK(p2, 0.08, 1));                  // rồi mới nâng (rời ghế ngay sau đỉnh gập thân)
          const lam = s.lam0 * (1 - minJerk(p0)) + 0.12 * minJerk(p0) + 0.50 * minJerk(p1) - 0.62 * minJerk(segK(p2, 0.12, 0.95)) - 0.025 * s3 * s3;   // đỉnh gập ~36° lúc rời ghế
          engSeatPose(e, C, 0, hz, hy, lam, minJerk(segK(u, 0.04, 0.26)), s.feet);
          engArmSupport(e, C, minJerk(segK(u, 0.02, 0.2)) * (1 - minJerk(segK(u, 0.56, 0.8))));   // tay đẩy tay vịn tới hết pha rời ghế
          e.head.rotation.x = 0.14 - 0.4 * lam;
          return u >= 1;
        }
        function engSeatHold(e, C, s, dt, t) {   // đang ngồi: hông trong lòng ghế, đùi trên mặt ghế, cẳng chân buông; việc đang làm đặt e.seatLean / e.seatSwing
          s.lam += ((e.seatLean || 0) - s.lam) * (1 - Math.exp(-dt * 3));
          s.sw = (s.sw || 0) + ((e.seatSwing || 0) - (s.sw || 0)) * (1 - Math.exp(-dt * 1.5));
          engSeatPose(e, C, 0, C.seatZ, C.hipSeat, s.lam, 0, null, s.sw, t);
        }
        function engStandStill(e) { e.legs[0].rotation.x = e.legs[1].rotation.x = 0; e.knees[0].rotation.x = e.knees[1].rotation.x = 0; e.arms[0].rotation.x = e.arms[1].rotation.x = 0; }
        function engPoseSettled(e, yaw) {   // lớp tư thế đã bắt kịp đích (đứng yên, thẳng chân, đúng hướng) → chuyển sang điều khiển trực tiếp không giật
          const P = e.pose; if (!P) return true;
          const dy = Math.atan2(Math.sin(yaw - P.yaw), Math.cos(yaw - P.yaw));
          return Math.abs(dy) < 0.025 && P.pos.distanceTo(P.rawPos) < 0.006 && Math.abs(P.shown[0]) + Math.abs(P.shown[1]) + Math.abs(P.shown[2]) + Math.abs(P.shown[3]) < 0.06 && (P.shuf || 0) < 0.01;
        }
        function engSeatWalk(e, pts, s, dt, stopAtEnd, ground) {   // đi thẳng qua các điểm đã kiểm tra; điểm cuối: phanh đều dừng đúng chỗ, hoặc đi tiếp không dừng
          const g = e.g; let P = pts[s.li], dx = P.x - g.position.x, dz = P.z - g.position.z, d = Math.hypot(dx, dz);
          while (s.li < pts.length - 1 && d < 0.18) { s.li++; P = pts[s.li]; dx = P.x - g.position.x; dz = P.z - g.position.z; d = Math.hypot(dx, dz); }
          const last = s.li === pts.length - 1;
          if (last && d < (stopAtEnd ? 0.015 : 0.2)) {
            if (stopAtEnd) { e.vel = 0; g.position.x = P.x; g.position.z = P.z; g.position.y = ground(P.x, P.z) - ENG_FEET; engStandStill(e); }
            return true;
          }
          let rem = d; for (let k = s.li + 1; k < pts.length; k++) rem += Math.hypot(pts[k].x - pts[k - 1].x, pts[k].z - pts[k - 1].z);
          const dy = Math.atan2(Math.sin(Math.atan2(dx, dz) - g.rotation.y), Math.cos(Math.atan2(dx, dz) - g.rotation.y));
          g.rotation.y += Math.max(-3.6 * dt, Math.min(3.6 * dt, dy * Math.min(1, dt * 9)));
          const vWant = (stopAtEnd ? Math.min(0.8, Math.sqrt(2 * 0.9 * rem) + 0.08) : 0.8) * Math.max(0.35, Math.cos(dy));   // giảm tốc đều (~0,9 m/s²) để dừng đúng điểm quay
          const v0 = e.vel || 0; e.vel = v0 + Math.max(-2.6 * dt, Math.min(1.8 * dt, vWant - v0));
          const st = Math.min(d, e.vel * dt); g.position.x += dx / d * st; g.position.z += dz / d * st;
          g.position.y = ground(g.position.x, g.position.z) - ENG_FEET + engGait(e, st) * CAMP_SCALE;
          e.lean = Math.max(-0.04, Math.min(0.08, e.vel * 0.05 + (e.vel - v0) / Math.max(dt, 1e-3) * 0.02));
          e.walking = true; return false;
        }
        function engSeatTurn(e, yaw, dt, ground) {   // quay tại chỗ về hướng ghế: đầu dẫn trước, thân theo (giới hạn ~2,4 rad/s), lớp tư thế tự nhích chân
          const g = e.g, d = Math.atan2(Math.sin(yaw - g.rotation.y), Math.cos(yaw - g.rotation.y));
          g.rotation.y += Math.sign(d) * Math.min(Math.abs(d), Math.min(2.4, 0.5 + Math.abs(d) * 2.6) * dt);
          g.position.y = ground(g.position.x, g.position.z) - ENG_FEET; engStandStill(e); e.vel = 0;
          e.headYawT = Math.max(-0.55, Math.min(0.55, d * 0.7));
          return Math.abs(d) < 0.01 && engPoseSettled(e, yaw);
        }
        function engSeatBack(e, C, s, dt) {   // lùi nửa bước tới khi bắp chân chạm mép ghế, liếc qua vai nhìn ghế
          const g = e.g;
          if (s.k < 1) {
            s.k = Math.min(1, s.k + dt / s.dur); const m = minJerk(s.k), x = s.b0.x + (s.b1.x - s.b0.x) * m, z = s.b0.z + (s.b1.z - s.b0.z) * m;
            const st = Math.hypot(x - g.position.x, z - g.position.z); g.position.x = x; g.position.z = z; e.vel = Math.min(0.5, st / Math.max(dt, 1e-3));
            g.position.y = C.ground(x, z) - ENG_FEET + engGait(e, -st) * CAMP_SCALE; e.walking = st > 1e-4;
          } else { g.position.y = C.ground(g.position.x, g.position.z) - ENG_FEET; engStandStill(e); e.vel = 0; }
          g.rotation.y = C.yaw;
          e.headYawT = 0.6 * Math.sin(Math.PI * Math.min(1, s.k * 1.25)) * s.side; e.head.rotation.x = 0.22 * Math.sin(Math.PI * s.k);
          return s.k >= 1 && engPoseSettled(e, C.yaw);
        }
        function engUseSeat(e, C, dt, t) {   // tới ghế C theo làn → quay lưng → lùi chạm mép ghế → ngồi xuống; true khi đã ngồi hẳn (giữ dáng ngồi)
          let s = e.seat;
          if (!s || s.C !== C) { s = e.seat = { C, st: 'go', k: 0, li: 0, lam: 0, sw: 0 }; e.seatLean = 0; e.seatSwing = 0; }
          const g = e.g;
          if (s.st === 'leave') s.st = 'go';
          if (s.st === 'stood') engSeatStartSit(e, C, s);   // vừa đứng lên mà lịch lại cần ngồi ghế này: ngồi lại luôn
          if (s.st === 'go') {
            const j = seatJoin(C, g.position.x, g.position.z);
            if (j < 0) { engStep(e, C.laneW[0], dt, t, pf, FIRE_AVOID_R, C.field); return false; }
            s.st = 'path'; s.li = j;
          }
          if (s.st === 'path') { if (!engSeatWalk(e, C.laneW, s, dt, true, C.ground)) return false; s.st = 'turn'; }
          if (s.st === 'turn') {
            if (!engSeatTurn(e, C.yaw, dt, C.ground)) return false;
            const [lx] = seatL(C, g.position.x, g.position.z);
            Object.assign(s, { st: 'back', k: 0, b0: g.position.clone(), b1: seatW(C, 0, C.standZ), side: lx > 0 ? -1 : 1 });
            s.dur = 0.55 + 2.2 * s.b0.distanceTo(s.b1);
          }
          if (s.st === 'back') { if (!engSeatBack(e, C, s, dt)) return false; engSeatStartSit(e, C, s); }
          if (s.st === 'sit') { e.seatCtl = true; if (!engSitStep(e, C, s, dt, t)) return false; s.st = 'seated'; }
          if (s.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, s, dt, t)) engSeatStartSit(e, C, s); return false; }
          e.seatCtl = true; engSeatHold(e, C, s, dt, t); return true;
        }
        function engSeatStartLeave(e, C, s, goal) {   // rời ghế: bước thẳng tới chỗ quay rồi đi ngược làn tới khi hướng về đích không còn vướng ghế/xô/đèn
          const [lx, lz] = seatL(C, e.g.position.x, e.g.position.z), [gx, gz] = goal ? seatL(C, goal.x, goal.z) : [lx, lz + 3], pts = [];
          let cur = [lx, lz];
          if (Math.abs(lx) < C.keep[0] && lz < C.keep[2] + 0.05) { cur = C.turn; pts.push(cur); }
          for (let k = C.lane.length - 2; k >= 0 && !seatSegClear(C, cur[0], cur[1], gx, gz); k--) { cur = C.lane[k]; pts.push(cur); }
          s.pts = pts.length ? pts.map(([x, z]) => seatW(C, x, z)) : [e.g.position.clone()]; s.li = 0; s.st = 'leave';
        }
        function engSeatGuard(e, want, goal, dt, t) {   // đang ngồi / đứng sát một ghế mà lịch đã sang việc khác → đứng dậy (nếu đang ngồi) rồi rời ghế theo làn
          const s = e.seat; if (!s || s.C === want || s.C.indoor) return false;
          const C = s.C;
          if (s.st === 'go') { e.seat = null; return false; }
          if (s.st === 'sit') { e.seatCtl = true; if (engSitStep(e, C, s, dt, t)) s.st = 'seated'; return true; }   // đang hạ người: ngồi hẳn rồi mới đứng dậy
          if (s.st === 'seated') engSeatStartRise(e, C, s);
          if (s.st === 'rise') { e.seatCtl = true; if (engRiseStep(e, C, s, dt, t)) s.st = 'stood'; return true; }
          if (s.st !== 'leave') {
            const [lx, lz] = seatL(C, e.g.position.x, e.g.position.z);
            if (s.st === 'path' && Math.hypot(lx, lz) > 1.5) { e.seat = null; return false; }   // còn xa ghế: bỏ dở, làm việc mới luôn
            engSeatStartLeave(e, C, s, goal);
          }
          if (engSeatWalk(e, s.pts, s, dt, false, C.ground)) { e.seat = null; return false; }
          return true;
        }
        const engPhaseSeat = ph => (ph === 'toFish' || ph === 'fish') ? FISH_SEAT : (ph === 'toChair' || ph === 'eat' || ph === 'eatFish' || ph === 'tossFish' || ph === 'tea' || ph === 'read' || ph === 'nap' || ph === 'toShelter' || ph === 'shelter' || (ph === 'appleEat' && applePick.eatSeated())) ? CAMP_SEAT : null;   // ăn táo: chỉ cần ghế từ lúc mang quả về ngồi
        function engPhaseGoal(e, want) {   // hướng sẽ đi sau khi rời ghế (chọn lối ra phía đó)
          if (want) return want.laneW[0];
          if (e.phase === 'appleEat') return applePick.eatStand;   // rời ghế ra giỏ táo
          if (e.phase === 'stars') return skyWatch.goal(); if (e.phase === 'garden') return gardenJob.goal(); if (e.phase === 'rainwatch') return skyWatch.rwSpot;
          if (e.phase === 'toMast' || e.phase === 'check') return e.wp[2];
          if ((e.phase === 'toDog' || e.phase === 'pet') && dogObj) return dogObj.position;
          return pf;
        }
        function engSeatPost(e, dt) {   // sau lớp tư thế: dang tay (tay vịn) · đầu quay dẫn hướng · giữ đám mây suy nghĩ thẳng đứng trên hông khi cúi/ngả người
          const ar = e.armRoll || (e.armRoll = [0, 0]), rt = e.armRollT || (e.armRollT = [0, 0]), k = 1 - Math.exp(-dt * 10);
          for (let i = 0; i < 2; i++) { ar[i] += (rt[i] - ar[i]) * k; if (!rt[i] && Math.abs(ar[i]) < 1e-4) ar[i] = 0; e.arms[i].rotation.z = ar[i]; rt[i] = 0; }
          const lz = e.legZT || (e.legZT = [0, 0]);
          for (let i = 0; i < 2; i++) { const z = e.legs[i].rotation.z + (lz[i] - e.legs[i].rotation.z) * k; e.legs[i].rotation.z = !lz[i] && Math.abs(z) < 1e-4 ? 0 : z; lz[i] = 0; }   // bước ngang: dạng / khép chân
          e.headRoll = (e.headRoll || 0) + ((e.headRollT || 0) - (e.headRoll || 0)) * (1 - Math.exp(-dt * 4)); if (Math.abs(e.headRoll) < 1e-4 && !e.headRollT) e.headRoll = 0;
          e.head.rotation.z = e.headRoll;   // nghiêng đầu: ngủ gật trên ghế, lắc theo nhạc, lau tóc
          e.headYaw = (e.headYaw || 0) + ((e.headYawT || 0) - (e.headYaw || 0)) * (1 - Math.exp(-dt * 6)); if (!e.headYawT && Math.abs(e.headYaw) < 1e-4) e.headYaw = 0;
          e.head.rotation.y = e.headYaw; e.headYawT = 0;
        }
        const mastField = buildFlowField(engObj.wp[2].x, engObj.wp[2].z);    // → cột khí tượng
        const racField = buildFlowField(racApproach.x, racApproach.z);       // → điểm về hang gấu mèo
