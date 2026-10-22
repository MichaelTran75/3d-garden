        // ===== HÁI TÁO (G 13/10: "research picking physic … add picking the apple to engineer task") =====
        //  Quả thấp nhất trên 2 cây táo cao ~3,4 m mà kỹ sư với tay tối đa ~1,9 m ⇒ dùng SÀO HÁI TRÁI RÚT (2 ống nhôm 1,8 m lồng nhau: dài 1,9 → 3,5 m),
        //  đầu là RỔ vành thép có các ngón cong và một KHE CHỮ V, túi lưới bên dưới — dụng cụ vườn nhà phổ biến.
        //  Cơ học bứt quả (hướng dẫn thu hoạch táo của các trường nông nghiệp; lực tách quả táo chín ~10–20 N nếu kéo thẳng, nhỏ hơn nhiều khi BẺ GẬP cuống):
        //   · đưa rổ từ DƯỚI lên cho quả nằm gọn, cuống lọt khe chữ V, nâng nhẹ quả (cuống chùng) rồi VẶN sào + kéo lệch sang bên ⇒ cuống bị bẻ quanh mép khe;
        //     gập tới ~40° thì gãy ở tầng rời (chỗ nối cuống–cành). Không giật thẳng xuống: dễ gãy cả chồi quả năm sau.
        //   · gãy xong cành nhỏ bật về: các quả cùng chùm đung đưa như con lắc tắt dần (~2 Hz, tắt sau vài giây).
        //   · quả rơi gọn trong túi (không dập) → rút ngắn sào, chống sào xuống đất, tay phải lấy quả, ngồi xổm đặt nhẹ vào giỏ (không thả rơi).
        //  Mỗi lượt hái 1 quả, 3 lượt = 3 quả (giỏ đựng tối đa 3), dựng sào vào gốc, xách giỏ về đặt cạnh bàn trà. Tư thế tay do IK khuỷu (engArmPost:
        //  e.reachT = điểm nắm trên sào / quả / giỏ). G 18/10: TÁO HÁI PHẢI ĂN TRONG NGÀY — giỏ còn quả thì không hái lại (lịch 16:10 và nút "Hái táo" đều
        //  chặn); kỹ sư ăn dần (eat(): ra giỏ ngồi xổm lấy 1 quả → về ghế cắm trại → 5 miếng cắn, quả vơi dần còn lõi → ném lõi vào lò chiminea), quả kế
        //  cách 20 phút, từ 19:30 thì 5 phút cho kịp hết trước khi ngủ (eatWant, gọi từ engWantAct). Sào cầm lệch sang phải người (không cắt ngang mặt);
        //  chống sào xuống đất thì rổ ngang ngực lệch trái (không chạm mũ, không vướng người khi ngồi xổm bỏ quả vào giỏ bên phải).
        //  Cảnh lặp theo ngày: 5:00 sáng táo trên cây đủ lại, giỏ rỗng về gốc cây.
        const applePick = (() => {
          const POLE_SEG = 1.8, EXT_MIN = 0.1, EXT_MAX = 1.7, GRIP_LO = 0.35, GRIP_HI = 0.85, GRIP_PLANT = 1.5, CUP_OFF = 0.05, N_PICK = 3;   // CUP_OFF: tâm quả trên đầu sào (G 17/10 quả nhỏ 30% ⇒ thấp 3 cm, vẫn tựa đáy lưới)
          const UP = new THREE.Vector3(0, 1, 0), _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _d = new THREE.Vector3();
          const lerp = (a, b, k) => a + (b - a) * k, ease = k => minJerk(Math.max(0, Math.min(1, k)));
          // ---- sào: ống dưới (tay cầm bọc cao su, khoá rút) + ống trên trượt trong ống dưới; gốc toạ độ = đầu dưới, +y dọc sào ----
          const alu = new THREE.MeshLambertMaterial({ color: 0xb9bdc1 }), aluD = new THREE.MeshLambertMaterial({ color: 0x6d7378 }), rub = new THREE.MeshLambertMaterial({ color: 0x2a2a2a });
          const wire = new THREE.MeshLambertMaterial({ color: 0x8b9197 }), net = new THREE.MeshLambertMaterial({ color: 0x3f5f3c, side: THREE.DoubleSide, transparent: true, opacity: 0.82 });
          const pole = new THREE.Group(); pole.name = 'Sào hái trái'; pole.userData.noBatch = true; scene.add(pole);
          const cyl = (r0, r1, h, m, y) => { const o = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, h, 8).translate(0, y + h / 2, 0), m); o.castShadow = true; return o; };
          pole.add(cyl(0.021, 0.023, POLE_SEG, alu, 0), cyl(0.027, 0.027, 0.75, rub, 0.2), cyl(0.03, 0.03, 0.07, aluD, POLE_SEG - 0.07));
          const upper = new THREE.Group(); pole.add(upper); upper.add(cyl(0.015, 0.017, POLE_SEG, alu, 0));
          const head = new THREE.Group(); head.position.y = POLE_SEG; upper.add(head);
          const RIM = 0.17;
          { const rim = new THREE.Mesh(new THREE.TorusGeometry(RIM, 0.008, 6, 28), wire); rim.rotation.x = Math.PI / 2; rim.position.y = 0.06; head.add(rim);
            for (let k = 0; k < 9; k++) {   // ngón cong ra ngoài; chừa khe chữ V ở hướng 0 (2 ngón cạnh khe thấp hơn để dẫn cuống vào)
              const a = (k + 0.5) / 9.5 * 6.2832 + 0.3, len = k === 0 || k === 8 ? 0.09 : 0.14, d = new THREE.Vector3(Math.cos(a) * 0.32, 1, Math.sin(a) * 0.32).normalize();
              const f = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.006, len, 4).translate(0, len / 2, 0), wire); f.position.set(Math.cos(a) * RIM, 0.06, Math.sin(a) * RIM); f.quaternion.setFromUnitVectors(UP, d); head.add(f);
            }
            for (const a of [0.4, 2.5, 4.6]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.19, 4), wire); s.position.set(Math.cos(a) * RIM * 0.5, 0.03, Math.sin(a) * RIM * 0.5); s.rotation.set(Math.sin(a) * 1.05, 0, -Math.cos(a) * 1.05); head.add(s); }   // 3 nan đỡ vành
            const bag = new THREE.Mesh(new THREE.LatheGeometry([[RIM, 0.06], [0.16, -0.04], [0.12, -0.13], [0.05, -0.18], [0, -0.19]].map(([r, y]) => new THREE.Vector2(r, y)), 14), net); head.add(bag);   // túi lưới
          }
          function poleSet(B, H) {   // đặt sào theo 2 điểm thế giới: B = đầu dưới, H = gốc rổ; tự rút/kéo ống trên cho đúng chiều dài
            _a.subVectors(H, B); const L = _a.length(); _a.divideScalar(L || 1);
            pole.position.copy(B); pole.quaternion.setFromUnitVectors(UP, _a); upper.position.y = Math.max(EXT_MIN, Math.min(EXT_MAX, L - POLE_SEG));
          }
          const onPole = (cfg, s, out) => out.subVectors(cfg.H, cfg.B).normalize().multiplyScalar(s).add(cfg.B);
          const cfgLerp = (c0, c1, k, out) => { out.B.lerpVectors(c0.B, c1.B, k); out.H.lerpVectors(c0.H, c1.H, k); return out; };
          const cfgNew = () => ({ B: new THREE.Vector3(), H: new THREE.Vector3() }), cfgCopy = (o, c) => { o.B.copy(c.B); o.H.copy(c.H); return o; };
          // ---- giỏ mây (đan): thành loe, vành, quai cong; 4 chỗ đặt quả · G 15/10: giỏ nhỏ đi 25% ⇒ mọi kích thước × BK ----
          const BK = 0.75;
          const basket = new THREE.Group(); basket.name = 'Giỏ táo'; basket.userData.noBatch = true; scene.add(basket);
          { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d');
            x.fillStyle = '#a77a43'; x.fillRect(0, 0, 64, 64);
            for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { x.fillStyle = (i + j) % 2 ? '#8c6234' : '#bf9257'; x.fillRect(i * 8 + 1, j * 8 + 1, 6, 6); }   // nan đan nong mốt
            const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(6, 2);
            const wick = new THREE.MeshLambertMaterial({ map: tex, side: THREE.DoubleSide }), rimM = new THREE.MeshLambertMaterial({ color: 0x7c5529 });
            const body = new THREE.Mesh(new THREE.LatheGeometry([[0, 0.005], [0.27, 0.005], [0.3, 0.09], [0.35, 0.27]].map(([r, y]) => new THREE.Vector2(r * BK, y * BK)), 20), wick); body.castShadow = true; basket.add(body);
            const rim = new THREE.Mesh(new THREE.TorusGeometry(0.35 * BK, 0.015, 6, 24), rimM); rim.rotation.x = Math.PI / 2; rim.position.y = 0.27 * BK; basket.add(rim);
            const handle = new THREE.Mesh(new THREE.TorusGeometry(0.34 * BK, 0.014, 6, 20, Math.PI), rimM); handle.position.y = 0.27 * BK; handle.scale.y = 0.75; basket.add(handle);   // quai cong qua miệng giỏ
          }
          const BASKET_TOP = 0.53 * BK;   // đỉnh quai (đv thế giới, tính từ đáy giỏ)
          const SLOTS = [[0.115, 0.11, 0], [-0.058, 0.11, 0.1], [-0.058, 0.11, -0.1], [0.03, 0.27, 0.02]].map(p => new THREE.Vector3(...p).multiplyScalar(0.7))
            .concat([[0.085, 0.16, 0.147], [-0.17, 0.16, 0], [0.085, 0.16, -0.147], [-0.07, 0.3, 0.06], [0.07, 0.3, -0.06]].map(p => new THREE.Vector3(...p))).slice(0, 3);   // G 18/10: giỏ đựng tối đa 3 quả (lớp đáy)   // G 17/10 "click … select pick apple": hái thêm lượt ⇒ lớp 2 vòng 3 quả sát thành giỏ + 2 quả chất ngọn (9 quả)   // × 0,7: quả nhỏ 30% (G 17/10) vẫn chạm nhau, tựa đáy giỏ   // giỏ nhỏ: 3 quả đáy xếp tam giác chạm nhau, quả thứ 4 chồng lên khe giữa (ló khỏi miệng giỏ)
          // ---- cây, quả, chỗ đứng ----
          const trees = appleTrees.map(T => { T.updateMatrixWorld(true); return { T, base: T.getWorldPosition(new THREE.Vector3()), rA: T.userData.appleR * T.scale.x, apples: T.userData.apples }; });
          for (const tr of trees) for (const a of tr.apples) { a.tr = tr; a.st = 'tree'; a.world = a.g.getWorldPosition(new THREE.Vector3()); a.stemL = tr.rA * 1.1; }
          const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
          function reachable(S, A) {   // quả A có với tới bằng sào từ chỗ đứng S? (tay dưới trước ngực 0,3 · cao ≤ 1,2; sào nghiêng ≤ 30°)
            const d = Math.hypot(A.x - S.x, A.z - S.z), h = A.y - S.y; if (d < 0.35 || d > 1.7) return false;
            const vx = d - 0.3, vy = h - 1.2 - CUP_OFF;
            return vy > 1.0 && Math.hypot(vx, vy) + GRIP_LO <= POLE_SEG + EXT_MAX - 0.05 && Math.atan2(Math.abs(vx), vy) < 0.52;
          }
          function standOK(S, tr) {
            if (isWater(Math.round(x2gi(S.x)), Math.round(z2gj(S.z))) || Math.abs(cowY(S.x, S.z) - tr.base.y) > 0.05) return false;
            for (const o of obstacleCoords) if (Math.hypot(S.x - o.x, S.z - o.z) < o.r + 0.3) return false;
            for (const o of ENG_PROPS) if (Math.hypot(S.x - o.x, S.z - o.z) < o.r + 0.6) return false;
            return true;
          }
          const plan = (() => {   // chỗ đứng cố định mỗi ngày: quanh gốc cây có nhiều quả với tới nhất
            let best = null;
            for (const tr of trees) for (let k = 0; k < 16; k++) {
              const a = k / 16 * 6.2832, S = new THREE.Vector3(tr.base.x + Math.cos(a) * 1.35, tr.base.y, tr.base.z + Math.sin(a) * 1.35);   // cách gốc 1,35 m: thân cây cong không chạm người
              if (!standOK(S, tr)) continue;
              const n = tr.apples.filter(ap => reachable(S, ap.world)).length;
              if (!best || n > best.n) best = { tr, S, n };
            }
            if (!best) return null;
            const { tr, S } = best, yaw = yawTo(S, tr.base), f = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), r = new THREE.Vector3(-f.z, 0, f.x);   // r = phía tay phải
            const bk = S.clone().addScaledVector(r, 0.55).addScaledVector(f, 0.05); bk.y = cowY(bk.x, bk.z);
            const out = S.clone().sub(tr.base).setY(0).normalize(), gy = tr.base.y;
            const stow = { B: tr.base.clone().addScaledVector(out, 0.5).addScaledVector(r, -0.25).setY(gy + 0.02), H: tr.base.clone().addScaledVector(out, 0.17).addScaledVector(r, -0.1).setY(gy + 1.86) };   // dựa vào thân cây
            return { tr, S, yaw, f, r, basketHome: bk, stow };
          })();
          if (!plan) { pole.visible = basket.visible = false; return { update() { return true; }, tick() {}, busy: false, pole, basket, avail: () => 0, room: () => 0 }; }
          // chỗ đặt giỏ sau khi hái: trên đất cạnh bàn trà, phía xa ghế cắm trại
          const table = scene.getObjectByName('Bàn trà (Camp Table)');
          const basketDrop = (() => { const tp = table ? table.position.clone() : pf.clone(); const away = tp.clone().sub(campChairPos).setY(0).normalize(); const p = tp.clone().addScaledVector(away, 0.75); p.y = cowY(p.x, p.z); return p; })();
          const basketStand = basketDrop.clone().add(plan.S.clone().sub(basketDrop).setY(0).normalize().multiplyScalar(0.62)); basketStand.y = cowY(basketStand.x, basketStand.z);
          const St = { st: 'idle', k: 0, cfg: cfgNew(), c0: cfgNew(), c1: cfgNew(), cur: null, picked: 0, inBasket: [], basketAt: 'home', day: '', handApple: null, cupApple: null, swing: [], eat: null, core: null, lastEatH: -9 };
          const placeBasket = (p, yaw) => { basket.position.copy(p); basket.rotation.set(0, yaw, 0); basket.updateMatrixWorld(true); };
          function resetDay() {   // sáng sớm: táo trên cây đủ lại, giỏ rỗng về gốc, sào dựa gốc
            for (const tr of trees) for (const a of tr.apples) { a.st = 'tree'; a.sw = a.sv = a.swy = a.svy = 0; a.g.position.copy(a.home); a.g.rotation.set(0, a.rot, 0); a.g.scale.setScalar(1); a.g.visible = true; }
            for (const tr of trees) for (const a of tr.apples) if (a.mats0) { for (const [m, mt] of a.mats0) m.material = mt; a.mats0 = null; }   // lõi táo ăn dở hôm qua → quả nguyên
            St.inBasket.length = 0; St.picked = 0; St.basketAt = 'home'; placeBasket(plan.basketHome, plan.yaw + 0.6); St.eat = St.core = null; St.lastEatH = -9;
            cfgCopy(St.cfg, plan.stow); poleSet(St.cfg.B, St.cfg.H);
          }
          resetDay();
          const setAppleWorld = (a, p, rx = 0, rz = 0, spin = 0) => { a.g.position.copy(a.tr.T.worldToLocal(_d.copy(p))); a.g.rotation.set(rx, a.rot + spin, rz); };
          const nextApple = () => plan.tr.apples.filter(a => a.st === 'tree' && reachable(plan.S, a.world)).sort((p, q) => p.world.y - q.world.y)[0] || null;
          function aimCfg(A, below, out) {   // sào nhắm quả A: tay dưới trước ngực, nâng tay khi quả cao; rổ ở dưới quả một đoạn 'below'
            const f = plan.f, H = _b.copy(A).addScaledVector(UP, -(CUP_OFF + below));
            let hl = 1.0; const G = _c;
            for (let it = 0; it < 4; it++) {
              G.copy(plan.S).addScaledVector(f, 0.34).addScaledVector(plan.r, 0.24); G.y = plan.S.y + hl;   // tay dưới lệch phải: sào đi cạnh má, không cắt ngang mặt
              if (H.distanceTo(G) + GRIP_LO <= POLE_SEG + EXT_MAX) break; hl = Math.min(1.2, hl + 0.07);
            }
            const dir = _a.subVectors(H, G).normalize(); out.B.copy(G).addScaledVector(dir, -GRIP_LO); out.H.copy(H); return out;
          }
          const readyCfg = out => { out.B.copy(plan.S).addScaledVector(plan.f, 0.34).addScaledVector(plan.r, 0.24); out.B.y = plan.S.y + 0.62; out.H.copy(out.B); out.H.y += 1.92; return out; };
          const plantCfg = out => { out.H.copy(plan.S).addScaledVector(plan.f, 0.55).addScaledVector(plan.r, -0.3); out.H.y = plan.S.y + 1.12; out.B.copy(out.H).addScaledVector(plan.f, 1.25).addScaledVector(plan.r, -0.85); out.B.y = plan.S.y + 0.01; return out; };   // chống chéo: đầu sào cắm đất xa ~1,5 m về trước–TRÁI 34° (gốc cây ngay trước mặt: sào đi cách thân ~0,8 m), rổ ngả về NGANG NGỰC lệch trái (sào ngắn nhất 1,9 m) — không chạm mũ, không vướng người khi ngồi xổm bên phải
          function plantDrop(out, sq) {   // ngồi xổm bỏ quả vào giỏ: tay trái đẩy sào ra — chân sào trượt xa 0,35 m, sào ngả thấp 12° (rổ hạ ~0,35 m, xa đầu đang cúi)
            plantCfg(out); _a.subVectors(out.H, out.B); const L = _a.length(), hz = Math.hypot(_a.x, _a.z), dx = _a.x / hz, dz = _a.z / hz, ph = Math.atan2(_a.y, hz) - 0.21 * sq;
            out.B.x -= dx * 0.35 * sq; out.B.z -= dz * 0.35 * sq; out.H.set(out.B.x + dx * Math.cos(ph) * L, out.B.y + Math.sin(ph) * L, out.B.z + dz * Math.cos(ph) * L); return out;
          }
          function snapSwing(A) {   // cành bật lại: các quả cùng chùm đung đưa (vận tốc góc tỉ lệ độ gần)
            for (const a of plan.tr.apples) {
              if (a.st !== 'tree' || a === A) continue; const d = a.world.distanceTo(A.world); if (d > 0.95) continue;
              const k = (1 - d / 0.95) * 1.6; a.sv += k * (Math.random() < 0.5 ? -1 : 1); a.svy += k * (Math.random() - 0.5);
            }
          }
          function go(st) { St.st = st; St.k = 0; cfgCopy(St.c0, St.cfg); }
          function abort() {   // việc bị cắt ngang: cất sào, quả đang cầm vào giỏ, giỏ về cạnh bàn trà
            for (const a of [St.handApple, St.cupApple]) if (a) { a.st = 'basket'; St.inBasket.push(a); }
            St.handApple = St.cupApple = null; cfgCopy(St.cfg, plan.stow); poleSet(St.cfg.B, St.cfg.H);
            if (St.inBasket.length) { St.basketAt = 'table'; placeBasket(basketDrop, 0.4); } else { St.basketAt = 'home'; placeBasket(plan.basketHome, plan.yaw + 0.6); }
            St.st = 'idle';
          }
          // ---- mỗi khung, trong pha 'apple' của kỹ sư: điều khiển dáng + sào + quả; trả true khi xong việc ----
          function update(e, dt, t) {
            const R = e.reachT = [null, null], H = e.hold || (e.hold = {}); H.pole = true;
            const lookAt = p => { _a.copy(e.g.position); _a.y += 1.45; const dy = p.y - _a.y, dh = Math.hypot(p.x - _a.x, p.z - _a.z); e.head.rotation.x = Math.max(-0.75, Math.min(0.6, -Math.atan2(dy, dh))); };
            const grips2 = () => { R[0] = onPole(St.cfg, GRIP_LO, new THREE.Vector3()); R[1] = onPole(St.cfg, GRIP_HI, new THREE.Vector3()); };
            const stand = () => { engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; e.g.rotation.y = plan.yaw; };
            if (St.st === 'idle') { if (St.inBasket.length || St.eat) return true; St.picked = 0; go(St.basketAt === 'table' ? 'toBasket' : 'walk'); }   // giỏ còn táo chưa ăn: không hái lại   // giỏ đang ở cạnh bàn trà (lượt trước): đi lấy giỏ mang ra gốc cây trước
            if (St.st === 'toBasket') { H.pole = false; if (engStep(e, basketStand, dt, t, pf, FIRE_AVOID_R)) go('liftT'); return false; }
            if (St.st === 'bring') {   // xách giỏ ra gốc cây
              H.pole = false;
              if (engStep(e, plan.S, dt, t, pf, FIRE_AVOID_R)) { e.g.position.x = plan.S.x; e.g.position.z = plan.S.z; go('setB'); }
              else { e.arms[1].rotation.x = 0.04 + 0.04 * Math.sin(e.gait || 0); (e.armRollT || (e.armRollT = [0, 0]))[1] = 0.2; e.elbowFlexT = [0, -0.03]; }
              return false;
            }
            if (St.st === 'walk') {   // tới chỗ đứng dưới tán (né thân cây, bếp lửa)
              H.pole = false;
              if (engStep(e, plan.S, dt, t, pf, FIRE_AVOID_R)) { e.g.position.x = plan.S.x; e.g.position.z = plan.S.z; go('grab'); }
              return false;
            }
            if (St.st === 'carry') {   // xách giỏ về cạnh bàn trà
              H.pole = false;
              if (engStep(e, basketStand, dt, t, pf, FIRE_AVOID_R)) go('put');
              else { e.arms[1].rotation.x = 0.04 + 0.04 * Math.sin(e.gait || 0); (e.armRollT || (e.armRollT = [0, 0]))[1] = 0.2; e.elbowFlexT = [0, -0.03]; }   // tay trái duỗi thẳng xách giỏ (vật nặng: khuỷu không gập), dang ra khỏi đùi, đung đưa ít
              return false;
            }
            stand();
            St.k += dt;
            const A = St.cur;
            switch (St.st) {
              case 'liftT': case 'setB': {   // cúi xách giỏ cạnh bàn trà · đặt giỏ xuống bên phải chỗ đứng hái (như 'lift-b' / 'put')
                const at = St.st === 'liftT' ? basket.position : plan.basketHome; H.pole = false; e.g.rotation.y = yawTo(e.g.position, at);
                const sq = Math.min(ease(St.k / 0.6), 1 - ease((St.k - 0.9) / 0.6));
                e.noFootIK = true; e.g.position.y -= 0.2 * CAMP_SCALE * ENGINEER_SIZE * sq;
                e.legs[0].rotation.x = e.legs[1].rotation.x = -0.9 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.5 * sq; e.lean = 0.1 * sq; e.spineT = { x: 0.4 * sq, y: 0.2 * sq };
                R[1] = (St.st === 'liftT' ? basket.localToWorld(_a.set(0, BASKET_TOP, 0)) : _a.copy(at).addScaledVector(UP, BASKET_TOP + 0.3 * (1 - sq))).clone(); lookAt(at);
                if (St.k > 0.8) { if (St.st === 'liftT') St.basketAt = 'hand'; else if (St.basketAt === 'hand') { St.basketAt = 'home'; placeBasket(plan.basketHome, plan.yaw + 0.6); } }
                if (St.k > 1.5) { e.noFootIK = false; go(St.st === 'liftT' ? 'bring' : 'grab'); }
                break;
              }
              case 'grab': {   // với lấy sào đang dựa gốc cây, dựng thẳng trước ngực
                const k = ease(St.k / 1.6); readyCfg(St.c1); cfgLerp(St.c0, St.c1, ease((St.k - 0.5) / 1.1), St.cfg); grips2(); lookAt(St.cfg.H);
                e.spineT = { x: 0.12 * Math.sin(Math.PI * k), y: 0 };
                if (St.k > 1.6) { St.cur = St.inBasket.length < SLOTS.length ? nextApple() : null; go(St.cur ? 'look' : 'stow'); }
                break;
              }
              case 'look': {   // ngước nhìn chọn quả chín (quả thấp nhất còn trên cành, trong tầm sào)
                grips2(); lookAt(A.world); e.spineT = { x: -0.06, y: 0 };
                if (St.k > 1.0) go('aim');
                break;
              }
              case 'aim': {   // rút dài sào, đưa rổ tới ngay dưới quả 30 cm
                aimCfg(A.world, 0.3, St.c1); cfgLerp(St.c0, St.c1, ease(St.k / 1.7), St.cfg); grips2(); lookAt(A.world); e.spineT = { x: -0.08, y: 0 };
                if (St.k > 1.7) go('cup');
                break;
              }
              case 'cup': {   // nâng rổ lên: quả lọt vào lòng rổ, cuống vào khe chữ V; cuối cùng nâng nhẹ quả 3 cm (cuống chùng)
                aimCfg(A.world, -0.03, St.c1); cfgLerp(St.c0, St.c1, ease(St.k / 0.9), St.cfg); grips2(); lookAt(A.world); e.spineT = { x: -0.08, y: 0 };
                const c = Math.max(0, Math.min(1, (St.k - 0.55) / 0.35));
                _a.subVectors(St.cfg.H, St.cfg.B).normalize(); _b.copy(St.cfg.H).addScaledVector(_a, CUP_OFF); _c.copy(A.world).lerp(_b, c); setAppleWorld(A, _c);
                if (St.k > 0.9) { go('twist'); St.spin = 0; }
                break;
              }
              case 'twist': {   // VẶN sào + kéo lệch sang bên: cuống bị bẻ quanh mép khe; gập ≥ 0,7 rad (~40°) thì gãy ở tầng rời
                aimCfg(A.world, -0.03, St.c1); St.c1.H.addScaledVector(plan.r, 0.16 * ease(St.k / 0.8)).addScaledVector(UP, -0.06 * ease(St.k / 0.8));
                cfgCopy(St.cfg, St.c1); grips2(); lookAt(A.world); e.spineT = { x: -0.08, y: 0.06 * Math.sin(St.k * 9) };
                St.spin = 1.4 * ease(St.k / 0.8); head.rotation.y = St.spin;
                _a.subVectors(St.cfg.H, St.cfg.B).normalize(); _b.copy(St.cfg.H).addScaledVector(_a, CUP_OFF);
                const anc = _c.copy(A.world).addScaledVector(UP, A.stemL), sx = _b.x - anc.x, sz = _b.z - anc.z, bend = Math.atan2(Math.hypot(sx, sz), anc.y - _b.y);
                if (!St.cupApple) {
                  setAppleWorld(A, _b, Math.atan2(sz, A.stemL) * 0.8, -Math.atan2(sx, A.stemL) * 0.8, St.spin);
                  if (bend > 0.7 || St.k > 1.0) { A.st = 'cup'; St.cupApple = A; snapSwing(A); }   // tách!
                }
                if (St.cupApple && St.k > 1.05) go('retract');
                break;
              }
              case 'retract': {   // rút ngắn sào, hạ rổ (quả nằm trong túi lưới) về trước mặt
                readyCfg(St.c1); St.c1.H.copy(St.c1.B).addScaledVector(plan.f, 0.25); St.c1.H.y += 1.9;
                cfgLerp(St.c0, St.c1, ease(St.k / 1.4), St.cfg); grips2(); lookAt(St.cfg.H); head.rotation.y = St.spin * (1 - ease(St.k / 1.4));
                if (St.k > 1.4) go('plant');
                break;
              }
              case 'plant': {   // chống đầu sào xuống đất, ngả sào vào người: rổ ngang vai — tay trái giữ sào, tay phải rảnh
                plantCfg(St.c1); cfgLerp(St.c0, St.c1, ease(St.k / 1.0), St.cfg);
                R[1] = onPole(St.cfg, lerp(GRIP_HI, GRIP_PLANT, ease(St.k / 1.0)), new THREE.Vector3()); R[0] = onPole(St.cfg, GRIP_LO, new THREE.Vector3()); lookAt(St.cfg.H);
                if (St.k > 1.0) go('take');
                break;
              }
              case 'take': {   // tay phải lấy quả trong rổ
                plantCfg(St.cfg); R[1] = onPole(St.cfg, GRIP_PLANT, new THREE.Vector3());
                const ap = St.cupApple || St.handApple; _a.subVectors(St.cfg.H, St.cfg.B).normalize(); const cupP = _b.copy(St.cfg.H).addScaledVector(_a, CUP_OFF).clone();
                R[0] = St.k < 0.6 ? cupP : cupP.clone().addScaledVector(plan.f, -0.25 * ease((St.k - 0.6) / 0.5)).addScaledVector(UP, -0.25 * ease((St.k - 0.6) / 0.5));
                lookAt(cupP);
                if (St.k > 0.55 && St.cupApple) { St.handApple = St.cupApple; St.cupApple = null; ap.st = 'hand'; }
                if (St.k > 1.1) go('drop');
                break;
              }
              case 'drop': {   // ngồi xổm, đặt quả nhẹ vào giỏ bên phải (không thả rơi cho khỏi dập), đứng lên
                const sq = Math.min(ease(St.k / 0.6), 1 - ease((St.k - 1.3) / 0.6));
                plantDrop(St.cfg, sq); R[1] = onPole(St.cfg, GRIP_PLANT, new THREE.Vector3());
                e.noFootIK = true; e.g.position.y -= 0.24 * CAMP_SCALE * ENGINEER_SIZE * sq;
                e.legs[0].rotation.x = e.legs[1].rotation.x = -1.05 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.75 * sq; e.lean = 0.12 * sq;
                e.g.rotation.y = plan.yaw - 0.9 * sq; e.spineT = { x: 0.36 * sq, y: -0.06 * sq };   // xoay cả người sang phải về phía giỏ rồi mới cúi: sào + rổ ở sau vai trái, đầu không chúi vào rổ
                const slot = basket.localToWorld(SLOTS[Math.min(SLOTS.length - 1, St.inBasket.length)].clone());
                R[0] = slot.clone().addScaledVector(UP, 0.12 * (1 - sq)); lookAt(slot);
                if (St.k > 1.0 && St.handApple) { St.handApple.st = 'basket'; St.inBasket.push(St.handApple); St.handApple = null; St.picked++; }
                if (St.k > 1.9) { e.noFootIK = false; St.cur = St.picked < N_PICK && St.inBasket.length < SLOTS.length ? nextApple() : null; go(St.cur ? 'lift' : 'stow'); }
                break;
              }
              case 'lift': {   // nhấc sào khỏi đất, hai tay nắm lại, dựng thẳng
                readyCfg(St.c1); cfgLerp(St.c0, St.c1, ease(St.k / 1.0), St.cfg);
                R[1] = onPole(St.cfg, lerp(GRIP_PLANT, GRIP_HI, ease(St.k / 1.0)), new THREE.Vector3()); R[0] = onPole(St.cfg, GRIP_LO, new THREE.Vector3()); lookAt(A ? A.world : St.cfg.H);
                if (St.k > 1.0) go('look');
                break;
              }
              case 'stow': {   // dựa sào vào gốc cây
                cfgLerp(St.c0, plan.stow, ease(St.k / 1.5), St.cfg); grips2(); lookAt(St.cfg.H);
                if (St.k > 1.5) go('lift-b');
                break;
              }
              case 'lift-b': {   // cúi xách giỏ (tay trái)
                const sq = Math.min(ease(St.k / 0.6), 1 - ease((St.k - 0.9) / 0.6));
                e.noFootIK = true; e.g.position.y -= 0.2 * CAMP_SCALE * ENGINEER_SIZE * sq;
                e.legs[0].rotation.x = e.legs[1].rotation.x = -0.9 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.5 * sq; e.lean = 0.1 * sq; e.spineT = { x: 0.4 * sq, y: 0.25 * sq };
                basket.updateMatrixWorld(true); R[1] = basket.localToWorld(_a.set(0, BASKET_TOP, 0)).clone(); lookAt(R[1]);
                if (St.k > 0.75) St.basketAt = 'hand';
                if (St.k > 1.5) { e.noFootIK = false; go('carry'); }
                break;
              }
              case 'put': {   // đặt giỏ xuống đất cạnh bàn trà
                H.pole = false; e.g.rotation.y = yawTo(e.g.position, basketDrop);
                const sq = Math.min(ease(St.k / 0.6), 1 - ease((St.k - 0.9) / 0.6));
                e.noFootIK = true; e.g.position.y -= 0.2 * CAMP_SCALE * ENGINEER_SIZE * sq;
                e.legs[0].rotation.x = e.legs[1].rotation.x = -0.9 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.5 * sq; e.spineT = { x: 0.4 * sq, y: 0.2 * sq };
                R[1] = basketDrop.clone().addScaledVector(UP, BASKET_TOP + 0.3 * (1 - sq)); lookAt(basketDrop);
                if (St.k > 0.8 && St.basketAt === 'hand') { St.basketAt = 'table'; placeBasket(basketDrop, 0.4); }
                if (St.k > 1.5) { e.noFootIK = false; St.st = 'done'; return true; }
                return false;
              }
            }
            return false;
          }
          // ---- ĂN TÁO (G 18/10 "hái táo thì phải ăn trong ngày"): ra giỏ cạnh bàn trà, ngồi xổm lấy quả trên cùng (tay phải) → về ghế cắm trại → 5 miếng:
          //      đưa lên miệng · cắn · giật nhẹ ra · hạ về đùi · nhai; quả vơi dần (bề ngang ×1 → 0,3), miếng thứ 4 lộ thịt táo màu kem ⇒ còn lõi · ném lõi
          //      theo đường đạn vào miệng lò chiminea. Ngắt giữa chừng: chưa cắn thì trả quả vào giỏ, cắn rồi thì bỏ ----
          const outV = new THREE.Vector3(Math.sin(caravanObj.rotation.y), 0, Math.cos(caravanObj.rotation.y));   // từ vách xe ra ngoài
          const eatStand = basketDrop.clone().addScaledVector(outV, 0.58); eatStand.y = cowY(eatStand.x, eatStand.z);   // phía ngoài giỏ, xa bàn trà
          const fleshM = new THREE.MeshLambertMaterial({ color: 0xf2e2b2 });   // thịt táo lộ ra sau mấy miếng cắn
          const EAT_N = 5, EAT_T = 6.5, BITE_SXZ = [1, 0.84, 0.69, 0.55, 0.42, 0.3], BITE_SY = [1, 0.97, 0.95, 0.93, 0.9, 0.86];
          const EAT_SLOT = new Set(['outdoor', 'rest', 'read', 'shelter', 'music', 'bedtime', 'explore', 'pet', 'fish', 'research']);   // việc có thể ngắt ra ăn 1 quả
          function eatWant(e, hh, act) {   // engWantAct: 'eatApple' hoặc null
            if (St.eat) return 'eatApple';   // đang ăn dở: ăn cho xong
            if (St.st !== 'idle' || !St.inBasket.length || St.basketAt !== 'table' || engForceAct || !EAT_SLOT.has(act) || (act === 'fish' && e.phase === 'fish')) return null;
            if (hh < St.lastEatH) St.lastEatH = -9;   // qua ngày
            return hh - St.lastEatH >= (hh >= 19.5 ? 0.08 : 0.33) ? 'eatApple' : null;   // cách quả trước 20 phút · từ 19:30 ăn liền cho hết trong ngày
          }
          function biteLook(a, n) {   // quả sau n miếng
            const k = Math.min(n, EAT_N); a.g.scale.set(BITE_SXZ[k], BITE_SY[k], BITE_SXZ[k]);
            if (k >= 4 && !a.mats0) { a.mats0 = []; a.g.traverse(o => { if (o.isMesh && o.geometry && o.material !== fleshM && o !== a.g.children[a.g.children.length - 1]) { a.mats0.push([o, o.material]); o.material = fleshM; } }); }   // giữ cuống (con cuối)
          }
          function eatAbort(e) {
            const E = St.eat; St.eat = null; e.noFootIK = false; if (!E || !E.a) return;
            if (E.bites) { E.a.st = 'eaten'; E.a.g.visible = false; } else { E.a.st = 'basket'; St.inBasket.push(E.a); }
          }
          function eat(e, dt, t) {   // pha 'appleEat' của kỹ sư; true khi ăn xong 1 quả
            const R = e.reachT = [null, null];
            let E = St.eat; if (!E) { if (!St.inBasket.length) return true; E = St.eat = { st: 'go', k: 0, a: null, bites: 0 }; }
            E.k += dt; const go2 = st => { E.st = st; E.k = 0; };
            if (E.st === 'go') { if (engStep(e, eatStand, dt, t, pf, FIRE_AVOID_R)) go2('take'); return false; }
            if (E.st === 'take') {   // ngồi xổm cạnh giỏ, tay phải nhặt quả trên cùng
              engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; e.g.rotation.y = yawTo(e.g.position, basket.position);
              const sq = Math.min(ease(E.k / 0.6), 1 - ease((E.k - 0.95) / 0.6));
              e.noFootIK = true; e.g.position.y -= 0.2 * CAMP_SCALE * ENGINEER_SIZE * sq;
              e.legs[0].rotation.x = e.legs[1].rotation.x = -0.9 * sq; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.5 * sq; e.lean = 0.1 * sq; e.spineT = { x: 0.4 * sq, y: -0.18 * sq };
              if (!E.a && St.inBasket.length) { R[0] = basket.localToWorld(SLOTS[St.inBasket.length - 1].clone()).addScaledVector(UP, 0.03 + 0.1 * (1 - sq)); if (E.k > 0.8) { E.a = St.inBasket.pop(); E.a.st = 'hand'; } }
              else R[0] = engBodyW(e, -0.2, 1.45, 0.3, new THREE.Vector3());   // quả trước bụng khi đứng lên
              e.head.rotation.x = 0.55 * sq;   // cúi nhìn giỏ
              if (E.k > 1.55) { e.noFootIK = false; if (!E.a) { St.eat = null; return true; } go2('sit'); }
              return false;
            }
            if (!engUseSeat(e, CAMP_SEAT, dt, t)) { if (E.st !== 'sit') go2('sit'); R[0] = engBodyW(e, -0.22, 1.5, 0.28, new THREE.Vector3()); return false; }   // mang quả về ghế (tay phải trước ngực)
            const ax = engAxesW(e), fwd = _b.copy(ax.f), sc = e.g.scale.y;
            if (E.st === 'sit') go2('bite');
            if (E.st === 'bite') {   // T = 6,5 s mỗi miếng
              const n = Math.floor(E.k / EAT_T), c = E.k % EAT_T;
              if (n >= EAT_N) { go2('toss'); return false; }
              const up = minJerk(segK(c, 0.2, 1.0)) * (1 - minJerk(segK(c, 1.5, 2.2))), pull = minJerk(segK(c, 1.05, 1.35)) * (1 - segK(c, 1.5, 2.2));
              if (c >= 1.1 && E.bites < n + 1) { E.bites = n + 1; biteLook(E.a, E.bites); }   // cắn!
              const lap = engBodyW(e, -0.16, 1.32, 0.36, new THREE.Vector3()), m = engMouthW(e, _c).addScaledVector(fwd, (0.075 + 0.05 * pull) * sc);
              R[0] = lap.lerp(m, up);
              e.seatLean = 0.05 + 0.08 * up; e.seatSwing = 0;
              e.head.rotation.x = 0.16 * (1 - up) - 0.06 * pull + (c > 2.2 ? Math.abs(Math.sin(t * 9)) * 0.04 : 0);   // nhìn quả · ngẩng đón · nhai gật gù
              return false;
            }
            if (E.st === 'toss') {   // vung tay phải quăng lõi vào miệng lò chiminea (đường đạn 0,7 s)
              const back = minJerk(segK(E.k, 0, 0.5)), fw = minJerk(segK(E.k, 0.5, 0.75)), p = engBodyW(e, -0.3, 1.72, 0.25, new THREE.Vector3());
              const to = _c.set(CHIM_MOUTH.x - e.g.position.x, 0, CHIM_MOUTH.z - e.g.position.z).normalize();
              p.addScaledVector(to, (fw * 1.2 - back * 0.7) * 0.4 * sc).y += (0.35 * back - 0.1 * fw) * sc; R[0] = p;
              e.seatLean = 0.04; e.head.rotation.x = 0.08;
              if (E.k >= 0.72 && E.a) { const p0 = E.a.g.getWorldPosition(new THREE.Vector3()), T = 0.7, v = CHIM_MOUTH.clone().sub(p0).divideScalar(T); v.y += 0.5 * 9.81 * T; St.core = { a: E.a, p0, v, t: 0, T }; E.a = null; }
              if (E.k >= 1.4) { St.eat = null; St.lastEatH = liveWeather.localHour; return true; }
            }
            return false;
          }
          const CHIM_MOUTH = (() => { const c = scene.getObjectByName('Lò sưởi chiminea (Chiminea)'); if (!c) return pf.clone().setY(pf.y + 0.3); c.updateMatrixWorld(true); return c.localToWorld(new THREE.Vector3(0, 0.5, 0.02)); })();   // tâm buồng đốt ngay sau ô cửa (cửa quay về ghế, camp/chiminea.js) · thiếu lò thì bếp lửa
          // ---- sau tư thế (bàn tay đã đúng chỗ): sào, quả trong rổ / tay / giỏ, giỏ trên tay; quả trên cây đung đưa ----
          const _w = new THREE.Vector3();
          function tick(e, dt) {
            const hh = liveWeather.localHour, day = new Date().toDateString();
            if (St.day !== day && hh >= 5 && hh < 16 && St.st === 'idle') { St.day = day; resetDay(); }
            if (St.st !== 'idle' && St.st !== 'done' && e.phase !== 'apple') abort();
            if (St.eat && e.phase !== 'appleEat') eatAbort(e);
            if (St.eat && St.eat.a) { e.wrists[0].localToWorld(_w.set(0, -0.02, 0.055)); setAppleWorld(St.eat.a, _w, 0, 0, St.eat.bites * 0.9); }   // quả đang ăn ở tay phải, xoay mặt chưa cắn về miệng
            if (St.core) { const C = St.core; C.t += Math.min(dt, 0.05); _w.copy(C.p0).addScaledVector(C.v, C.t); _w.y -= 4.905 * C.t * C.t; setAppleWorld(C.a, _w, C.t * 9, 0, C.t * 6); if (C.t >= C.T) { C.a.st = 'eaten'; C.a.g.visible = false; St.core = null; } }
            if (St.st === 'done') St.st = 'idle';
            if (St.st !== 'idle' && St.st !== 'walk') poleSet(St.cfg.B, St.cfg.H);
            if (St.basketAt === 'hand') { e.wrists[1].getWorldPosition(_w); basket.position.set(_w.x, _w.y - BASKET_TOP, _w.z); basket.rotation.set(0, e.g.rotation.y, 0); basket.updateMatrixWorld(true); }
            if (St.cupApple) { _a.subVectors(St.cfg.H, St.cfg.B).normalize(); setAppleWorld(St.cupApple, _b.copy(St.cfg.H).addScaledVector(_a, CUP_OFF + 0.02), 0, 0, St.spin || 0); }
            if (St.handApple) { e.wrists[0].localToWorld(_w.set(0, -0.02, 0.055)); setAppleWorld(St.handApple, _w); }
            St.inBasket.forEach((a, i) => setAppleWorld(a, basket.localToWorld(_w.copy(SLOTS[Math.min(i, SLOTS.length - 1)])), 0.2 * (i % 2), 0.15 * ((i + 1) % 2), i * 1.3));
            const w0 = 12.6, z = 0.07, h = Math.min(dt, 1 / 30);   // con lắc cuống quả: ω ≈ 2π·2 Hz, tắt dần ζ 0,07
            for (const tr of trees) for (const a of tr.apples) {
              if (a.st !== 'tree' || (Math.abs(a.sw) + Math.abs(a.sv) + Math.abs(a.swy) + Math.abs(a.svy) < 1e-3)) continue;
              a.sv += (-w0 * w0 * a.sw - 2 * z * w0 * a.sv) * h; a.sw += a.sv * h; a.svy += (-w0 * w0 * a.swy - 2 * z * w0 * a.svy) * h; a.swy += a.svy * h;
              _w.copy(a.world); _w.x += a.stemL * Math.sin(a.sw); _w.z += a.stemL * Math.sin(a.swy); _w.y += a.stemL * (1 - Math.cos(a.sw) * Math.cos(a.swy));
              setAppleWorld(a, _w, a.swy, -a.sw, 0);
              if (Math.abs(a.sw) + Math.abs(a.sv) + Math.abs(a.swy) + Math.abs(a.svy) < 1e-3) { a.sw = a.sv = a.swy = a.svy = 0; a.g.position.copy(a.home); a.g.rotation.set(0, a.rot, 0); }
            }
          }
          const avail = () => Math.min(N_PICK, SLOTS.length - St.inBasket.length, plan.tr.apples.filter(a => a.st === 'tree' && reachable(plan.S, a.world)).length);   // số quả lượt tới sẽ hái
          const canPick = () => St.st !== 'idle' || (!St.inBasket.length && !St.eat && avail() > 0);   // hái lại chỉ khi giỏ trống (táo hôm nay đã ăn hết)
          return { update, tick, eat, eatWant, canPick, eatStand, eatSeated: () => !!St.eat && (St.eat.st === 'sit' || St.eat.st === 'bite' || St.eat.st === 'toss'), get busy() { return St.st !== 'idle'; }, get eating() { return !!St.eat; }, state: St, plan, pole, basket, avail, room: () => SLOTS.length - St.inBasket.length, left: () => St.inBasket.length + (St.eat && St.eat.a && !St.eat.bites ? 1 : 0) };
        })();
