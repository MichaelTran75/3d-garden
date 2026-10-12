        // ---- trong xe: đồ thị lối đi (đv xe → thế giới) · cửa lùa phòng tắm · ghế trong xe ----
        const VAN_FLOOR = dogInside.y, vanFloor = () => VAN_FLOOR, VYAW = caravanObj.rotation.y;
        const VY = { pz: VYAW, nz: VYAW + Math.PI, px: VYAW + Math.PI / 2, nx: VYAW - Math.PI / 2 };   // hướng nhìn dọc các trục của xe
        const VN = {};
        for (const [k, x, z] of [['door', 0.33, 1.0], ['hall', 0.33, 0.12], ['tbl', 0.05, 0.33], ['bed', 0.62, -0.15], ['mid', 1.45, 0.25], ['rear', 2.5, 0.08],
          ['stove', 1.33, 0.5], ['board', 2.04, 0.5], ['ksink', 2.5, 0.5], ['bathOut', 2.6, -0.145], ['bathIn', 3.3, 0.0], ['sink', 3.475, 0.74], ['shelf', 3.45, 0.45], ['towel', 3.75, 0.08], ['wcOut', 3.255, -0.2], ['wcIn', 3.255, -0.64]]) { VN[k] = vanPt(x, 1.07, z); VN[k].node = k; }
        const VAN_EDGES = [['door', 'hall'], ['hall', 'tbl'], ['hall', 'bed'], ['hall', 'mid'], ['bed', 'mid'], ['mid', 'rear'], ['rear', 'bathOut'], ['bathOut', 'bathIn', 'entry'],
          ['bathIn', 'sink'], ['bathIn', 'shelf'], ['shelf', 'sink'], ['bathIn', 'towel'], ['bathIn', 'wcOut'], ['towel', 'wcOut'], ['wcOut', 'wcIn', 'wc'],
          ['mid', 'stove'], ['mid', 'board'], ['stove', 'board'], ['board', 'ksink'], ['ksink', 'rear']];
        function vanRoute(a, b) {   // đường ngắn nhất giữa 2 nút (Dijkstra trên ~13 nút) → [{ p, door, node }] không gồm nút đầu
          const dist = { [a]: 0 }, prev = {}, todo = new Set(Object.keys(VN));
          while (todo.size) {
            let u = null; for (const k of todo) if (dist[k] !== undefined && (u === null || dist[k] < dist[u])) u = k;
            if (u === null || u === b) break; todo.delete(u);
            for (const [p, q, door] of VAN_EDGES) {
              const v = p === u ? q : q === u ? p : null; if (!v || !todo.has(v)) continue;
              const d = dist[u] + VN[u].distanceTo(VN[v]); if (dist[v] === undefined || d < dist[v]) { dist[v] = d; prev[v] = [u, door || null]; }
            }
          }
          const out = []; for (let k = b; k !== a && prev[k]; k = prev[k][0]) out.unshift({ p: VN[k], door: prev[k][1], node: k });
          return out;
        }
        const VBATH = caravanObj.userData.interior.bath, VSTOOL = caravanObj.userData.interior.stool;
        const VAN_DOORS = {   // cửa lùa: tâm khe cửa khi mở (đv thế giới) — tới gần thì nghiêng vai, cúi đầu
          entry: { g: VBATH.entryDoor, axis: 'z', slide: 0.5, c: vanPt(2.935, 1.07, -0.145), k: 0, target: 0, shown: -1 },
          wc: { g: VBATH.wcDoor, axis: 'x', slide: 0.45, c: vanPt(3.255, 1.07, -0.42), k: 0, target: 0, shown: -1 }
        };
        const LID = { k: 0, target: 0, shown: -1 };   // nắp bồn cầu: 0 đậy · 1 dựng vào két
        function vanDoorsTick(dt) {
          for (const d of Object.values(VAN_DOORS)) {
            d.k += Math.sign(d.target - d.k) * Math.min(Math.abs(d.target - d.k), dt / 0.9);
            if (d.k !== d.shown) { d.shown = d.k; d.g.position[d.axis] = d.slide * d.k * d.k * (3 - 2 * d.k); }
          }
          LID.k += Math.sign(LID.target - LID.k) * Math.min(Math.abs(LID.target - LID.k), dt / 0.7);
          if (LID.k !== LID.shown) { LID.shown = LID.k; VBATH.lid.rotation.z = -1.62 * minJerk(LID.k); }
        }
        function vanDoorsAuto(e, V) {   // cửa đã mở để đi qua: ra khỏi khe cửa (và không còn đi qua nó nữa) thì kéo đóng lại
          for (const D of V.opened) {
            const onPath = !!V.path && V.path.slice(V.pi, V.pi + 2).some(q => q.door && VAN_DOORS[q.door] === D);
            if (!onPath && Math.hypot(e.g.position.x - D.c.x, e.g.position.z - D.c.z) > 0.3) { D.target = 0; V.opened.delete(D); }
          }
        }
        const vanSqueeze = e => { let s = 0; for (const d of Object.values(VAN_DOORS)) s = Math.max(s, 1 - segK(Math.hypot(e.g.position.x - d.c.x, e.g.position.z - d.c.z), 0.18, 0.55)); return s; };
        function engSideGait(e, dist, k) {   // bước ngang (lách khe hẹp): dạng một chân rồi khép chân kia, gối chùng nhẹ; trả về độ nhún
          e.sgait = ((e.sgait || 0) + dist * (Math.PI * 2 / 0.6)) % (Math.PI * 2000);
          const s = Math.sin(e.sgait), a = Math.max(0, s), b = Math.max(0, -s), T = e.legZT || (e.legZT = [0, 0]);
          T[0] = -0.2 * a * k; T[1] = 0.2 * b * k;
          e.legs[0].rotation.x = -0.12 * a * k; e.legs[1].rotation.x = -0.12 * b * k; e.knees[0].rotation.x = 0.25 * a * k; e.knees[1].rotation.x = 0.25 * b * k;
          e.arms[0].rotation.x = e.arms[1].rotation.x = 0;
          return Math.abs(s) * 0.015 * k;
        }
        function vanPathStep(e, V, dt) {   // đi theo V.path, không dừng ở nút giữa, phanh đều về nút cuối · đoạn có cửa: mở trước, chờ mở hẳn, lách vai + cúi đầu qua khung
          const g = e.g, path = V.path;
          let q = path[V.pi], dx = q.p.x - g.position.x, dz = q.p.z - g.position.z, d = Math.hypot(dx, dz);
          while (V.pi < path.length - 1 && d < 0.1) { V.node = q.node; V.pi++; q = path[V.pi]; dx = q.p.x - g.position.x; dz = q.p.z - g.position.z; d = Math.hypot(dx, dz); }
          V.segDoor = q.door;
          for (let k = V.pi; k < Math.min(path.length, V.pi + 2); k++) if (path[k].door) { const D = VAN_DOORS[path[k].door]; D.target = 1; V.opened.add(D); }
          const D = q.door && VAN_DOORS[q.door];
          if (D && D.k < 0.92 && Math.hypot(g.position.x - D.c.x, g.position.z - D.c.z) < 0.5) {   // cửa chưa mở hẳn: đứng chờ
            e.vel = 0; engStandStill(e); g.position.y = VAN_FLOOR - ENG_FEET; return false;
          }
          if (V.pi === path.length - 1 && d < 0.012) { e.vel = 0; g.position.x = q.p.x; g.position.z = q.p.z; g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); V.node = q.node; return true; }
          let rem = d; for (let k = V.pi + 1; k < path.length; k++) rem += path[k].p.distanceTo(path[k - 1].p);
          const sq = vanSqueeze(e), head = Math.atan2(dx, dz), want = head + 1.3 * sq;
          const dy = Math.atan2(Math.sin(want - g.rotation.y), Math.cos(want - g.rotation.y));
          g.rotation.y += Math.max(-3.4 * dt, Math.min(3.4 * dt, dy * Math.min(1, dt * 9)));
          const off = Math.abs(Math.atan2(Math.sin(head - g.rotation.y), Math.cos(head - g.rotation.y)));   // thân lệch hướng đi bao nhiêu
          const vWant = Math.min(0.75 * (1 - 0.55 * sq), Math.sqrt(2 * 0.9 * rem) + 0.06) * (off > 0.6 ? 1 : Math.max(0.35, Math.cos(dy)));
          const v0 = e.vel || 0; e.vel = v0 + Math.max(-2.6 * dt, Math.min(1.8 * dt, vWant - v0));
          const st = Math.min(d, e.vel * dt); g.position.x += dx / d * st; g.position.z += dz / d * st;
          const bob = off > 0.6 ? engSideGait(e, st, Math.min(1, (off - 0.6) / 0.5)) : engGait(e, st);
          g.position.y = VAN_FLOOR - ENG_FEET + (bob - 0.05 * sq) * CAMP_SCALE;
          e.lean = Math.max(e.lean, 0.13 * sq); e.head.rotation.x = Math.max(e.head.rotation.x, 0.32 * sq);   // khung cửa phòng tắm thấp hơn đỉnh mũ: cúi đầu
          e.walking = true; return false;
        }
        function vanGoTo(e, V, node, dt) {   // tới nút trong xe theo đồ thị (đổi đích giữa chừng: quay lại nút vừa qua rồi đi đường mới)
          if (!V.path || V.goal !== node) {
            const back = V.path ? [{ p: VN[V.node], door: V.segDoor, node: V.node }] : [];
            V.path = [...back, ...vanRoute(V.node, node)]; V.pi = 0; V.goal = node;
            if (!V.path.length) { V.path = null; return true; }
          }
          if (!vanPathStep(e, V, dt)) return false;
          V.path = null; V.node = node; return true;
        }
        function vanWalkTo(e, Q, dt, spd = 0.5) {   // bước thẳng vài tấc trong buồng hẹp, dừng đúng điểm
          const g = e.g, dx = Q.x - g.position.x, dz = Q.z - g.position.z, dd = Math.hypot(dx, dz);
          if (dd < 0.012) { g.position.x = Q.x; g.position.z = Q.z; g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); e.vel = 0; return true; }
          e.vel = Math.min(spd, (e.vel || 0) + 2.0 * dt, Math.sqrt(2 * 0.9 * dd) + 0.04);
          const st = Math.min(dd, e.vel * dt); g.position.x += dx / dd * st; g.position.z += dz / dd * st;
          let d = Math.atan2(dx, dz) - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += Math.max(-3 * dt, Math.min(3 * dt, d * Math.min(1, dt * 8)));
          g.position.y = VAN_FLOOR - ENG_FEET + engGait(e, st) * CAMP_SCALE; e.walking = true; return false;
        }
        function vanSideStep(e, Q, yaw, dt) {   // bước ngang tới Q, thân giữ hướng yaw (lách giữa ghế đẩu và mép bàn)
          const g = e.g, dx = Q.x - g.position.x, dz = Q.z - g.position.z, d = Math.hypot(dx, dz);
          const dy = Math.atan2(Math.sin(yaw - g.rotation.y), Math.cos(yaw - g.rotation.y)); g.rotation.y += dy * Math.min(1, dt * 8);
          if (d < 0.01) { g.position.x = Q.x; g.position.z = Q.z; g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); e.vel = 0; return engPoseSettled(e, yaw); }
          e.vel = Math.min(0.32, (e.vel || 0) + 1.2 * dt, d * 2 + 0.03);
          const st = Math.min(d, e.vel * dt); g.position.x += dx / d * st; g.position.z += dz / d * st;
          g.position.y = VAN_FLOOR - ENG_FEET + engSideGait(e, st, 1) * CAMP_SCALE; e.walking = true; return false;
        }
        const indoorSeat = (name, x, z, yaw, o = {}) => makeSeat(Object.assign({ name, indoor: true, pos: vanPt(x, 1.07, z), yaw, seatZ: 0, standZ: STUDY_FZ * CAMP_SCALE, contactZ: 0.09,
          seatDrop: 0.56, legs: [-1.48, -1.44], knees: [0.98, 0.94], arm: null, ground: vanFloor }, o));   // ghế trong xe cao ~0,48 m như ghế bàn học
        const STOOL_IN = 0.2, STOOL_SEAT = indoorSeat('stool', -0.65, VSTOOL.rest, VY.pz), TABLE_STAND = vanPt(-0.65, 1.07, VSTOOL.rest + STUDY_FZ);
        function stoolAt(z) { VSTOOL.obj.position.z = z - VSTOOL.rest; STOOL_SEAT.pos.copy(vanPt(-0.65, 1.07, z)); }
        const BED_SEAT = indoorSeat('bed', 0.62, -0.52, VY.pz);                                   // mép đệm, đệm cao 0,49 m
        const TOILET_SEAT = indoorSeat('toilet', 3.58, -1.07, VY.pz, { standZ: 0.4 * CAMP_SCALE }); // lệch 5 cm về phía cửa cho vai không chạm vách sau
        const TOILET_STAND = seatW(TOILET_SEAT, 0, TOILET_SEAT.standZ), SHOWER_SPOT = vanPt(3.36, 1.07, -0.6);
        function engHelmet(e, where) {   // mũ bảo hộ: trên đầu · trên kệ phòng tắm · cuối giường
          e.helmet.visible = where === 'head'; e.hair.visible = where !== 'head';
          VBATH.shelfHelmet.visible = where === 'shelf'; caravanObj.userData.interior.bedHelmet.visible = where === 'bed';
        }
        function engScootPose(e, C, s, k, dt, t) {   // nhích cả ghế: 3 lần nhổm nhẹ, hai tay nắm hai bên mặt ghế
          s.lam += (0.1 - s.lam) * (1 - Math.exp(-dt * 4)); e.seatCtl = true;
          engSeatPose(e, C, 0, C.seatZ, C.hipSeat + 0.014 * Math.max(0, Math.sin(Math.PI * 3 * k)), s.lam, 0, null, 0, t);
          const rt = e.armRollT || (e.armRollT = [0, 0]); for (let i = 0; i < 2; i++) { e.arms[i].rotation.x = 0.12; rt[i] = (i ? 1 : -1) * 0.22; }
          e.head.rotation.x = 0.12;
        }
        const engNewSeat = (C, st) => ({ C, st, k: st === 'seated' ? 1 : 0, li: 0, lam: 0, sw: 0 });

