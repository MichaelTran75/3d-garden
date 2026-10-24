        // ===== KỸ SƯ KIỂM TRA ĐỘNG CƠ (G 18/10 "add task engineer open capo và checking the engine, start the engine for 30s"): người xem bấm động cơ (đang thấy) →
        //  bảng "▶ Khởi động máy" (ui/xray-lifecycle.js, engForceAct 'engine') → kỹ sư ra đứng trước đầu xe (đang ở hông xe thì đi vòng qua góc đầu xe, không cắt qua mũi)
        //  → tra chìa vào ổ khoá sau logo Ford ở ga-lăng (Transit Mk8 mở ca-pô bằng chìa sau logo — nên G bấm logo cũng mở ca-pô) → ca-pô bật chốt, 2 tay đỡ mép trước
        //  theo ca-pô lên tới ~35° rồi buông (ty chống đỡ tiếp) → cúi nhìn khoang máy, tay trái tì mép ga-lăng, tay phải dò quanh nắp máy (~6 s) → đứng thẳng, giơ chìa
        //  khoá điều khiển bấm nổ máy từ xa (máy chạy đúng 30 s — van/engine/engine-run.js, vỏ máy mờ thấy cơ cấu V6; không bật xem xuyên vì ca-pô đã mở) → cúi xem máy chạy
        //  → bấm tắt → chờ máy dừng → 2 tay với mép ca-pô kéo xuống, buông ở ~15° cho ca-pô sập (chỉ đóng nếu chính kỹ sư mở) → về lịch cũ.
        //  Bị cắt ngang (mưa, giờ ngủ, đổi việc): tắt máy, đóng ca-pô nếu đã mở, cất chìa (idle, loop-update.js). Toạ độ xe (đv xe, mũi −X): đứng X −3,62 (ba-đờ-xốc −3,26),
        //  logo (−3,21, 1,15), mép trước ca-pô = (−0,82, −0,31, ±0,3) trong hệ bản lề ca-pô, máy (−2,9 … −2,4, nắp 1,2)
        //  GHẾ BẬC (G 22/10 "cho engineer sử dụng step stool để nhìn máy"): đứng đất mắt kỹ sư chỉ cao hơn nắp máy 0,32 đv, cách đầu máy ~0,65 ⇒ mặt ca-lăng che khoang
        //  máy. Mở ca-pô xong (tra chìa, nâng mép từ dưới đất như cũ) thì nảy ý "cao quá" → vòng qua góc đầu xe ra chỗ cất ghế (cạnh bánh trước, sát vách bên cửa lùa)
        //  → ngồi xổm nhấc ghế, ôm trước bụng (lưng ghế phẳng áp bụng, bậc quay ra trước — quay vào người thì bậc dưới đâm vào đùi) → về đầu xe, đặt ghế sát cản (xoay
        //  nửa vòng cho bậc quay về mình) → trèo 2 bậc kiểu cầu thang: chân phải lên bậc dưới, chân trái vượt lên mặt trên, chân phải theo — chân trụ duỗi nâng người,
        //  thân đổ tới, hông dồn sang chân trụ, tay trái tì mép ga-lăng → cúi xem máy, hình động cơ nổi, nổ máy, đóng ca-pô — đều trên ghế → lùi xuống (mũi chân chạm
        //  trước, gót hạ sau) → ôm ghế cất về chỗ cũ. Ghế nhựa đúc 2 bậc: bậc dưới 0,14, mặt trên 0,28 đv (≈ 31 cm thật — mỗi bậc ≈ ¼ chiều dài chân như bậc thang) ⇒
        //  mắt cao hơn nắp máy ~0,6. Chân đặt lên bậc nhờ engSupports / e.footPlan (engineer/body/pose-ik-walk.js) ----
        const engineJob = (() => {
          const J = { st: 'idle', k: 0, opened: false, fob: null, h0: new THREE.Vector3(), h1: new THREE.Vector3(), at: 'home', on: false, top: 0, turn: 1, w: new THREE.Vector3(), said: -1 };
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3(), _q = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0);
          const V = (x, y, z, out) => caravanObj.localToWorld(out.set(x, y, z));   // toạ độ xe → thế giới
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const bump = (u, a, b) => Math.sin(Math.PI * Math.max(0, Math.min(1, (u - a) / (b - a))));   // 0 → 1 → 0 trong [a, b]
          const go = st => { J.st = st; J.k = 0; J.cn = false; };
          const hoodP = () => VPART.hoodBtn && VPART.hoodBtn.part, edge = (s, out) => hoodP().g.localToWorld(out.set(-0.82, -0.31, 0.3 * s));   // mép trước ca-pô, s = ±1
          function turnTo(e, p, dt) { const w = Math.atan2(p.x - e.g.position.x, p.z - e.g.position.z), d = Math.atan2(Math.sin(w - e.g.rotation.y), Math.cos(w - e.g.rotation.y)); e.g.rotation.y += d * Math.min(1, dt * 6); }
          function look(e, p) { e.head.getWorldPosition(_c); e.head.rotation.x = Math.max(-0.9, Math.min(0.85, -Math.atan2(p.y - _c.y, Math.hypot(p.x - _c.x, p.z - _c.z)) - 0.8 * (e.lean || 0))); }
          function stand(e, dt) { engStandStill(e); e.vel = 0; e.g.position.y = (J.on ? J.top : cowY(e.g.position.x, e.g.position.z)) - ENG_FEET; e.armsBusy = true; turnTo(e, V(-2.7, 1, 0, _b), dt); }
          function fobOn(e, on) {   // chìa khoá điều khiển (đen, 3 × 6 cm) trong tay phải
            if (!J.fob) { J.fob = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.016), new THREE.MeshLambertMaterial({ color: 0x1c1e20 })); J.fob.name = 'Chìa khoá xe'; J.fob.position.set(0, -0.08, 0.02); e.wrists[0].add(J.fob); }
            J.fob.visible = on;
          }
          function bubble(head, msg, ms) {   // 1 câu trong bong bóng suy nghĩ (không chờ hồi như câu phản ứng)
            const now = Date.now(), ctx = engContext(now);
            checkBubbleSprite.userData.thought = { header: ctx.wxIcon + ' ' + clockText(ctx.h) + ' · ' + head, message: msg, kind: 'react', revision: ++thoughtRevision };
            thoughtUntil = now + ms; idleThoughtAt = Math.max(idleThoughtAt, now + 30000);
          }
          // ---- GHẾ BẬC: hệ ghế (đv thế giới) gốc = tâm đáy, +z = phía bậc (người trèo), x ngang · mặt trên z −0,20 … 0,05, bậc dưới 0,04 … 0,20 ----
          const ST = { W: 0.38, D: 0.4, h1: 0.14, h2: 0.28, zTop: -0.07, zLow: 0.14, zFoot: 0.42, zGrip: -0.075, yGrip: 0.27 };   // zLow: cổ chân trên bậc dưới — mũi giày vừa chạm vách đứng giữa 2 bậc
          const stool = new THREE.Group(); stool.name = 'Ghế bậc 2 bậc (Step Stool)'; scene.add(stool);
          {
            const sh = new THREE.Shape();   // vách hông hình bậc thang (mặt z–y), khoét vòm dưới
            sh.moveTo(0.2, 0); sh.lineTo(0.2, 0.125); sh.lineTo(0.045, 0.125); sh.lineTo(0.045, 0.265); sh.lineTo(-0.2, 0.265); sh.lineTo(-0.2, 0); sh.lineTo(-0.14, 0); sh.quadraticCurveTo(0, 0.17, 0.14, 0); sh.closePath();
            const plast = [], rub = [], box = (list, w, h, d, x, y, z) => list.push(new THREE.BoxGeometry(w, h, d).toNonIndexed().translate(x, y, z));
            for (const s of [-1, 1]) { const g = new THREE.ExtrudeGeometry(sh, { depth: 0.022, bevelEnabled: false, curveSegments: 6 }); g.rotateY(-Math.PI / 2); g.translate(s > 0 ? ST.W / 2 : -ST.W / 2 + 0.022, 0, 0); plast.push(g); }   // dày theo x
            box(plast, ST.W, 0.03, 0.25, 0, 0.265, -0.075); box(plast, ST.W, 0.025, 0.16, 0, 0.1275, 0.12);   // mặt trên (đỉnh 0,28) · bậc dưới (đỉnh 0,14)
            box(plast, ST.W - 0.044, 0.07, 0.016, 0, 0.08, 0.192); box(plast, ST.W - 0.044, 0.125, 0.016, 0, 0.2, 0.037); box(plast, ST.W - 0.044, 0.12, 0.016, 0, 0.2, -0.192);   // vách đứng bậc dưới · giữa 2 bậc · lưng
            for (const z of [-0.11, -0.065, -0.02, 0.025]) box(rub, ST.W - 0.05, 0.004, 0.018, 0, 0.282, z);   // gân cao su chống trượt
            for (const z of [0.075, 0.12, 0.165]) box(rub, ST.W - 0.05, 0.004, 0.018, 0, 0.142, z);
            box(rub, 0.13, 0.004, 0.035, 0, 0.2815, -0.165);   // khe tay xách
            for (const x of [-1, 1]) for (const z of [-1, 1]) box(rub, 0.03, 0.012, 0.05, x * (ST.W / 2 - 0.011), 0.006, z * 0.17);   // đế chân
            for (const [list, color] of [[plast, 0x55708c], [rub, 0x2b2f33]]) {
              for (const g of list) g.deleteAttribute('uv');
              const m = new THREE.Mesh(mergeGeometries(list, false), new THREE.MeshLambertMaterial({ color })); m.castShadow = m.receiveShadow = true; stool.add(m); for (const g of list) g.dispose();
            }
            stool.traverse(o => { o.userData.noBatch = o.userData.noBake = o.userData.noCollide = true; });
          }
          caravanObj.updateMatrixWorld(true);
          const pose = (x, z, dx, dz) => { const p = V(x, 0, z, new THREE.Vector3()), q = V(x + dx, 0, z + dz, _a); p.y = cowY(p.x, p.z); return { p, yaw: Math.atan2(q.x - p.x, q.z - p.z) }; };   // trục +z ghế theo hướng xe (dx, dz)
          const sc = caravanObj.scale.x, HOME = pose(-1.45, 1.08 + ST.D / 2 / sc, 0, 1), FRONT = pose(-3.28 - ST.D / 2 / sc, 0, -1, 0);   // cất: lưng sát vách bên cửa lùa, bậc quay ra ngoài · làm việc: lưng sát cản (nhô nhất x −3,27; dưới 0,35 trống), bậc quay ra đầu xe
          const SP = { p: new THREE.Vector3(), yaw: 0 }, CP = { p: new THREE.Vector3(), yaw: 0 }, A0 = { p: new THREE.Vector3(), yaw: 0 };
          const SL = (P, lx, ly, lz, out) => { const c = Math.cos(P.yaw), s = Math.sin(P.yaw); return out.set(P.p.x + lx * c + lz * s, P.p.y + ly, P.p.z - lx * s + lz * c); };   // điểm hệ ghế (đặt theo P) → thế giới
          function putStool(P) { stool.position.copy(P.p); stool.rotation.set(0, P.yaw, 0); stool.updateMatrixWorld(true); }
          putStool(HOME);
          engSupports.push((x, z) => {   // ghế đặt ở đầu xe: mặt trên / bậc dưới đỡ bàn chân
            if (J.at !== 'front') return -Infinity;
            const dx = x - FRONT.p.x, dz = z - FRONT.p.z, c = Math.cos(FRONT.yaw), s = Math.sin(FRONT.yaw), lx = dx * c - dz * s, lz = dx * s + dz * c;
            return Math.abs(lx) > ST.W / 2 || Math.abs(lz) > ST.D / 2 ? -Infinity : FRONT.p.y + (lz < 0.045 ? ST.h2 : ST.h1);
          });
          function carryPose(e, out) {   // ôm trước bụng: tâm mặt trên ở eo +0,34 trước, cao ngang tay; bậc quay ra trước
            const B = engBodyW(e, 0, 1.42, 0.34, _d), y = e.g.rotation.y; out.yaw = y; out.p.set(B.x - ST.zGrip * Math.sin(y), B.y - ST.h2, B.z - ST.zGrip * Math.cos(y)); return out;
          }
          function blend(A, B, u, uy, out) {   // A → B quanh tâm mặt trên (giữa 2 tay nắm — quay quanh gốc ghế thì 2 mép văng ngang kéo tay theo): tâm đi thẳng (u), ghế quay (uy)
            let d = Math.atan2(Math.sin(B.yaw - A.yaw), Math.cos(B.yaw - A.yaw)); if (Math.abs(d) > 2.4 && d * J.turn < 0) d += J.turn * TAU;   // theo chiều J.turn khi lệch ~nửa vòng
            const y = A.yaw + d * uy, g = SL(A, 0, ST.h2, ST.zGrip, _a).lerp(SL(B, 0, ST.h2, ST.zGrip, _b), u);
            out.yaw = y; out.p.set(g.x - ST.zGrip * Math.sin(y), g.y - ST.h2, g.z - ST.zGrip * Math.cos(y)); return out;
          }
          function grip(e) {   // 2 tay nắm 2 mép mặt trên ghế: miệng chữ C quay vào ghế, trục lỗ tay dọc mép — tay phải lấy mép phía phải người
            const ax = engAxesW(e), c = stool.localToWorld(_c.set(0, ST.yGrip, ST.zGrip)), g0 = stool.localToWorld(_a.set(-ST.W / 2, ST.yGrip, ST.zGrip)), g1 = stool.localToWorld(_b.set(ST.W / 2, ST.yGrip, ST.zGrip));
            const gR = g0.dot(ax.r) > g1.dot(ax.r) ? g0 : g1; J.h0.copy(gR); J.h1.copy(gR === g0 ? g1 : g0);
            for (const i of [0, 1]) { const p = i ? J.h1 : J.h0; engHandSet(e, i, p, aimQ(_q, _d.subVectors(c, p).setY(0).normalize(), UP)); }
            e.armsBusy = true;
          }
          function lift(e, up, S, k, dt) {   // cúi nắm 2 mép ghế, chuyển ghế giữa chỗ đặt S và trước bụng (up: đất → tay · ngược lại: tay → đất, buông tay ở 0,95 s)
            //  cúi gập ở eo, chân thẳng, đứng lùi 0,42 (ghế nhẹ ~2 kg; bản đầu ngồi xổm sát ghế: gối cắm vào mặt trên, tay còn hụt 0,22) · ghế rời đất rồi mới
            //  xoay nửa vòng (đặt: xoay xong mới hạ) cho các góc ghế khỏi quét qua chân
            const s = ease(k / 0.55) * (1 - ease((k - (up ? 1.0 : 1.05)) / 0.6)), u = up ? ease((k - 0.7) / 0.7) : ease((k - 0.1) / 0.8), uy = up ? ease((u - 0.3) / 0.7) : ease(u / 0.6);   // độ cúi qua lò xo trễ ~0,2 s: tay tới mép rồi ghế mới rời đất · đặt: ghế hạ đợi người cúi kịp
            engStandStill(e); e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; e.lean = 0.8 * s; e.spineT = { x: 0.25 * s, y: 0 }; turnTo(e, S.p, dt); look(e, S.p);
            carryPose(e, CP); putStool(up ? blend(S, CP, u, uy, SP) : blend(CP, S, u, uy, SP));
            if (k > 0.2 && (up || k < 0.95)) grip(e);
            e.armsBusy = true; e.vel = 0; return u;
          }
          function approach(e, P, dt) {   // bước nốt vào đúng chỗ đứng sau bậc ghế P (cách tâm ghế zFoot), quay mặt vào ghế; true = tới
            const p = e.g.position, s = SL(P, 0, 0, ST.zFoot, _c), dx = s.x - p.x, dz = s.z - p.z, d = Math.hypot(dx, dz);
            if (d > 0.01) { const m = Math.min(d, 0.6 * dt); p.x += dx / d * m; p.z += dz / d * m; e.vel = 0.6; engGait(e, m); e.walking = true; }
            p.y = cowY(p.x, p.z) - ENG_FEET; turnTo(e, SL(P, 0, 0, -1, _d), dt);
            return (d < 0.02 && J.k > 0.6) || J.k > 3;
          }
          function vanWalk(e, w, dt, t) {   // đi tới điểm thế giới w, không cắt qua mũi xe: hông xe ⇄ đầu xe thì vòng qua góc trước (đv xe x −4,05, z ±1,65)
            caravanObj.worldToLocal(_c.copy(e.g.position)); caravanObj.worldToLocal(_d.copy(w));
            const side = p => p.x > -3.45 && Math.abs(p.z) > 0.95, front = p => p.x <= -3.45;
            if (!J.cn && ((side(_c) && front(_d)) || (front(_c) && side(_d)))) {
              const cz = Math.sign(side(_c) ? _c.z : _d.z) * 1.65; if (Math.hypot(_c.x + 4.05, _c.z - cz) > 0.3) { engStep(e, V(-4.05, 0, cz, _b), dt, t, pf, FIRE_AVOID_R); return false; }
              J.cn = true;   // đã tới góc: đi thẳng tới đích (bản đầu cứ rời góc 0,3 lại quay về góc ⇒ lượn quanh góc tới hết giờ)
            }
            return engStep(e, w, dt, t, pf, FIRE_AVOID_R);
          }
          function climb(e, dt, u, up) {   // trèo lên (up) / lùi xuống 2 bậc, u 0 → 1: chân phải bậc dưới → chân trái mặt trên → chân phải theo (xuống: ngược lại)
            const fx = 0.15 * e.g.scale.y, P = FRONT, pl = e.footPlan || (e.footPlan = { p: [new THREE.Vector3(), new THREE.Vector3()], fp: [0, 0] });
            const Rf = [[fx, 0, ST.zFoot], [fx, ST.h1, ST.zLow], [fx, ST.h2, ST.zTop]], Lf = [[-fx, 0, ST.zFoot], [-fx, ST.h2, ST.zTop]];   // chân phải (0) bên +x ghế (mặt quay vào xe = −z ghế)
            const W = [[0.02, 0.34], [0.36, 0.68], [0.70, 0.98]], v = j => Math.max(0, Math.min(1, (u - W[j][0]) / (W[j][1] - W[j][0])));
            const yAt = (F, out) => { SL(P, F[0], 0, F[2], out); return F[1] > 0 ? P.p.y + F[1] : cowY(out.x, out.z); };   // độ cao mặt đặt chân: bậc ghế hoặc đất thật
            const foot = (A, B, s, out) => {   // bàn chân vung A → B (s 0 → 1): lên = nhấc trước rồi mới đưa tới · xuống = lùi trước rồi mới hạ
              const hz = up ? ease((s - 0.15) / 0.75) : ease(s / 0.6), hy = up ? ease(s / 0.55) : ease((s - 0.35) / 0.6), ya = yAt(A, _a), yb = yAt(B, _a);
              SL(P, A[0] + (B[0] - A[0]) * hz, 0, A[2] + (B[2] - A[2]) * hz, out); out.y = ya + (yb - ya) * hy + (up ? 0.05 * Math.sin(Math.PI * s) : 0.03 * bump(s, 0, 0.6)); return out;
            };
            if (up) foot(u < W[1][1] ? Rf[0] : Rf[1], u < W[1][1] ? Rf[1] : Rf[2], v(u < W[1][1] ? 0 : 2), pl.p[0]); else foot(u < W[1][0] ? Rf[2] : Rf[1], u < W[1][0] ? Rf[1] : Rf[0], v(u < W[1][0] ? 0 : 2), pl.p[0]);
            foot(up ? Lf[0] : Lf[1], up ? Lf[1] : Lf[0], v(1), pl.p[1]);
            const sw = j => up ? 0.35 * bump(v(j), 0, 0.4) : 0.35 * bump(v(j), 0.5, 1);   // nhấc gót lúc đạp đi (lên) · mũi chạm trước rồi hạ gót (xuống)
            pl.fp[0] = Math.max(sw(0), sw(2)); pl.fp[1] = sw(1);
            const zb = up ? ST.zFoot + (ST.zTop - ST.zFoot) * ease((u - 0.08) / 0.85) : ST.zTop + (ST.zFoot - ST.zTop) * ease((u - 0.05) / 0.85);
            const yb = up ? ST.h1 * ease((u - 0.3) / 0.28) + (ST.h2 - ST.h1) * ease((u - 0.64) / 0.28) : ST.h2 - (ST.h2 - ST.h1) * ease((u - 0.08) / 0.3) - ST.h1 * ease((u - 0.42) / 0.3);   // chân trụ duỗi nâng người / co hạ người
            const xb = 0.03 * (-bump(u, 0, 0.36) + bump(u, 0.32, 0.7) - bump(u, 0.66, 1));   // hông dồn sang chân trụ
            const p = e.g.position; SL(P, xb, 0, zb, p); const g = cowY(p.x, p.z), base = up ? g + (P.p.y - g) * ease(u / 0.5) : P.p.y + (g - P.p.y) * ease((u - 0.5) / 0.5);
            p.y = base + yb - ENG_FEET; engStandStill(e); e.vel = 0; e.armsBusy = true; turnTo(e, V(-2.7, 1, 0, _b), dt);
            e.lean = up ? 0.08 + 0.14 * bump(u, 0.2, 1) : 0.1; look(e, SL(P, 0, up ? ST.h2 : ST.h1, up ? ST.zTop : ST.zLow, _a));
            if (up ? u > 0.45 : u < 0.5) (e.reachT || (e.reachT = [null, null]))[1] = V(-3.22, 1.25, -0.32, J.h1);   // tay trái tì mép ga-lăng giữ thăng bằng
          }
          function update(e, dt, t) {   // pha 'engine' của kỹ sư (loop-update.js): true = xong
            const P = hoodP(); if (!P || !vanGlb.engine) return true;
            if (J.st === 'idle') { J.opened = false; go('walk'); idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 9000); }   // nảy 1 ý về máy khi tới nơi
            J.k += dt; const k = J.k, R = e.reachT || (e.reachT = [null, null]), eng = V(-2.65, 0.95, 0, _a);
            if (J.st !== 'holo') engHolo.warm();   // dựng dần hình động cơ nổi (mỗi khung 1 bộ phận) trong lúc ra đầu xe, mang ghế — vào pha 'holo' không giật
            if (J.st === 'walk') {   // ở hông xe phía sau mũi ⇒ qua góc đầu xe trước
              caravanObj.worldToLocal(_c.copy(e.g.position)); const corner = _c.x > -3.45 && Math.abs(_c.z) > 0.95;
              if ((engStep(e, V(corner ? -4.05 : -3.62, 0, corner ? Math.sign(_c.z) * 1.65 : 0, _b), dt, t, pf, FIRE_AVOID_R) && !corner) || k > 75) go('near');
            } else if (J.st === 'near') {   // bước nốt vào đúng chỗ đứng, quay mặt vào xe
              const p = e.g.position, s = V(-3.62, 0, 0, _b), dx = s.x - p.x, dz = s.z - p.z, d = Math.hypot(dx, dz);
              if (d > 0.01) { const m = Math.min(d, 0.6 * dt); p.x += dx / d * m; p.z += dz / d * m; e.vel = 0.6; engGait(e, m); e.walking = true; }
              p.y = cowY(p.x, p.z) - ENG_FEET; turnTo(e, V(-2.7, 1, 0, _c), dt);
              if ((d < 0.02 && k > 0.6) || k > 3) go(P.open ? 'fetch' : 'key');
            } else if (J.st === 'key') {   // tra chìa sau logo Ford, vặn ⇒ ca-pô bật chốt (logo lún theo tay)
              stand(e, dt); e.lean = 0.3 * ease(k / 0.5); R[0] = V(-3.24, 1.15, 0.05, J.h0); look(e, J.h0);
              if (k > 0.8 && !P.open) { vanPartToggle(VPART.hoodBtn, true); J.opened = true; }
              if (k > 1.4) go('lift');
            } else if (J.st === 'lift') {   // 2 tay đỡ mép trước, theo ca-pô lên tới ~35° rồi buông
              stand(e, dt); e.lean = 0.3 * (1 - ease(k / 1.4)); edge(0, _b); look(e, _b);
              if (P.a < 0.62 && k < 2.2) { R[0] = edge(1, J.h0); R[1] = edge(-1, J.h1); }
              if (k > 2.6) go('fetch');
            } else if (J.st === 'fetch' || J.st === 'carry' || J.st === 'back') {   // đi lấy ghế · ôm ghế ra đầu xe · ôm ghế về chỗ cất
              if (k < dt * 1.5 && J.st === 'fetch') bubble('Kiểm tra máy', 'Khoang máy cao quá, đứng đất nhìn không rõ — lấy ghế bậc đã.', 3600);
              const D = J.st === 'carry' ? FRONT : HOME; if (J.st !== 'fetch') { putStool(carryPose(e, CP)); grip(e); }
              if (vanWalk(e, SL(D, 0, 0, ST.zFoot + 0.3, J.w), dt, t) || k > 75) go(J.st + 'N');
            } else if (J.st === 'fetchN' || J.st === 'carryN' || J.st === 'backN') {
              if (J.st !== 'fetchN') { putStool(carryPose(e, CP)); grip(e); }
              if (approach(e, J.st === 'carryN' ? FRONT : HOME, dt)) { J.turn = Math.random() < 0.5 ? 1 : -1; go({ fetchN: 'pick', carryN: 'set', backN: 'stow' }[J.st]); }
            } else if (J.st === 'pick' || J.st === 'grab') {   // ngồi xổm nắm 2 mép mặt trên, nhấc ghế lên trước bụng (xoay nửa vòng: bậc quay ra trước)
              if (lift(e, true, J.st === 'pick' ? HOME : FRONT, k, dt) > 0) J.at = 'hand';
              if (k > 1.8) go(J.st === 'pick' ? 'carry' : 'back');
            } else if (J.st === 'set' || J.st === 'stow') {   // ngồi xổm đặt ghế xuống (xoay nửa vòng: bậc quay về mình), buông tay, đứng dậy
              if (lift(e, false, J.st === 'set' ? FRONT : HOME, k, dt) >= 1) J.at = J.st === 'set' ? 'front' : 'home';
              if (k > 1.7) { if (J.st === 'set') { J.at = 'front'; putStool(FRONT); go('up'); } else { J.at = 'home'; putStool(HOME); go('done'); } }
            } else if (J.st === 'up' || J.st === 'down') {   // trèo lên / lùi xuống 2 bậc ghế (2,1 s)
              if (J.st === 'down') J.on = false;
              climb(e, dt, Math.min(1, k / 2.1), J.st === 'up');
              if (k > 2.1) { e.footPlan = null; if (J.st === 'up') { J.on = true; J.top = FRONT.p.y + ST.h2; go('check'); } else go('grab'); }
            } else if (J.st === 'check') {   // cúi xem khoang máy: tay trái tì mép ga-lăng, tay phải dò quanh nắp máy
              stand(e, dt); const w = ease(k / 0.9) * (1 - ease((k - 5.6) / 0.8)); e.lean = 0.55 * w; look(e, eng);
              if (w > 0.3) { R[1] = V(-3.22, 1.25, -0.32, J.h1); R[0] = V(-2.86 + 0.07 * Math.sin(k * 1.3), 1.24, 0.08 + 0.13 * Math.sin(k * 0.7), J.h0); }
              if (k > 6.4) go('holo');
            } else if (J.st === 'holo') {   // G 22/10: hình động cơ ×3 nổi trên đầu, tách rời thành từng bộ phận, soi lần lượt (van/engine/engine-holo.js) — nhìn theo, giơ tay chỉ, nhận xét
              stand(e, dt); e.lean = 0;
              if (!engHolo.state.on && !engHolo.start(e)) { go('start'); return false; }
              const r = engHolo.tick(e, dt, t); R[1] = engBodyW(e, 0.1, 1.45, 0.42, J.h1);   // bảng ghi chép giơ trước ngực (đối chiếu chi tiết đang soi)
              if (r) {
                look(e, r.look); e.head.getWorldPosition(_c); let yw = Math.atan2(r.look.x - _c.x, r.look.z - _c.z) - e.g.rotation.y; yw = Math.atan2(Math.sin(yw), Math.cos(yw)); e.headYawT = Math.max(-0.8, Math.min(0.8, yw));
                if (r.point) { e.arms[0].getWorldPosition(_b); R[0] = J.h0.copy(r.point).sub(_b).normalize().multiplyScalar(0.46 * e.g.scale.y / 0.79).add(_b); }
                if (r.part && (r.idx !== J.said || r.sidx !== J.saidS)) { J.said = r.idx; J.saidS = r.sidx; holoSay(r.part, r.sub); }   // bộ phận mới / chi tiết con mới: nhận xét
              }
              if (engHolo.state.done) { J.said = -1; go('start'); }
            } else if (J.st === 'start' || J.st === 'stop') {   // giơ chìa khoá trước ngực, bấm nổ / tắt máy từ xa
              stand(e, dt); e.lean = 0; fobOn(e, true); R[0] = engBodyW(e, -0.12, 1.5, 0.42, J.h0); look(e, k < 0.7 ? J.h0 : eng);
              if (k > 0.8 && ENGR.on !== (J.st === 'start')) engineToggle(J.st === 'start', true);
              if (k > 1.7) go(J.st === 'start' ? 'watch' : 'cool');
            } else if (J.st === 'watch') {   // máy chạy: cúi xem, tay trái tì mép ga-lăng, gật gù theo tiếng máy — đủ 30 s tính từ lúc bấm nổ
              stand(e, dt); e.lean = 0.35 * ease(k / 1.2); look(e, eng); e.head.rotation.x += 0.05 * Math.sin(t * 2.4); if (k > 1) R[1] = V(-3.22, 1.25, -0.32, J.h1);
              if (k > 28.3) go('stop');
            } else if (J.st === 'cool') {   // chờ máy dừng hẳn, cất chìa
              stand(e, dt); look(e, eng); if (k > 0.5) fobOn(e, false);
              if (k > 2.2) go(J.opened ? 'close' : J.on ? 'down' : 'done');
            } else if (J.st === 'close') {   // với mép ca-pô, kéo xuống theo, buông ở ~15° cho ca-pô sập (đứng trên ghế: mép ca-pô ngang vai)
              stand(e, dt); e.lean = J.on ? 0.04 : 0.12; edge(0, _b); look(e, _b);
              if (k < 0.8 || (P.open === false && P.a > 0.26)) { R[0] = edge(1, J.h0); R[1] = edge(-1, J.h1); }
              if (k > 0.8 && P.open) vanPartToggle(VPART.hoodBtn, false);
              if (k > 2.4) go(J.on ? 'down' : 'done');
            }
            if (J.st === 'done') { J.st = 'idle'; return true; }
            return false;
          }
          const HOLO_TXT = { intake: 'Cổ hút kín, bướm ga điện tử đóng mở êm, không lọt gió sau turbo.', fuel: 'Phun kép: bơm cao áp giữ áp, kim phun trực tiếp và cửa nạp không rò.',
            ignition: 'Sáu bô-bin đánh lửa đều, bugi khe hở chuẩn, máy không bỏ lửa.', turboR: 'Turbo hàng 1: trục không rơ, van xả điện đóng mở đủ hành trình.', turboL: 'Turbo hàng 2: cánh nén sạch, ống dầu hồi không rỉ.',
            fead: 'Dây curoa còn căng, puli giảm chấn không nứt cao su, máy phát sạc đều.', timing: 'Xích cam kép không giãn, thanh dẫn nhựa chưa mòn khuyết.',
            headR: 'Nắp máy hàng 1: gioăng kín, nắp dàn cò khô dầu.', headL: 'Nắp máy hàng 2: gioăng thép kín, van PCV thông.', valvetrain: 'Trục cam mòn đều, bộ chỉnh cam VCT không kêu lạch cạch lúc đề.',
            pistons: 'Piston, xéc-măng còn tốt, vòi phun dầu làm mát piston thông.', crank: 'Trục khuỷu rèn cân bằng, nắp cổ trục 6 bu-lông chắc.', oil: 'Cacte khô, bơm dầu biến thiên giữ áp, dầu còn trong.',
            block: 'Thân nhôm 60° không nứt, cảm biến kích nổ sạch.' };   // G 24/10 khuya: nhận xét theo bộ phận của hình Ford 3.5L EcoBoost (van/engine/engine-holo.js)
          function holoSay(P, Q) { bubble('Phân tích động cơ · ' + P.name + (Q ? ' › ' + Q.name : ''), HOLO_TXT[P.k] || P.name, 2600); }   // nhận xét bộ phận đang soi (› chi tiết con)
          function idle() {   // việc bị cắt ngang: tắt máy, đóng ca-pô nếu đã mở, cất chìa, tắt hình động cơ nổi, ghế bậc về chỗ cất
            if (J.st === 'idle') return; const P = hoodP(); engHolo.stop();
            if (ENGR.on) engineToggle(false); if (J.opened && P && P.open) vanPartToggle(VPART.hoodBtn, false); if (J.fob) J.fob.visible = false;
            J.on = false; engObj.footPlan = null; if (J.at !== 'home') { J.at = 'home'; putStool(HOME); } J.st = 'idle';
          }
          return { update, idle, busy: () => J.st !== 'idle', state: J, stool };
        })();
