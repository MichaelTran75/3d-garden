        // ===== KỸ SƯ KIỂM TRA ĐỘNG CƠ (G 18/10 "add task engineer open capo và checking the engine, start the engine for 30s"): người xem bấm động cơ (đang thấy) →
        //  bảng "▶ Khởi động máy" (ui/xray-lifecycle.js, engForceAct 'engine') → kỹ sư ra đứng trước đầu xe (đang ở hông xe thì đi vòng qua góc đầu xe, không cắt qua mũi)
        //  → tra chìa vào ổ khoá sau logo Ford ở ga-lăng (Transit Mk8 mở ca-pô bằng chìa sau logo — nên G bấm logo cũng mở ca-pô) → ca-pô bật chốt, 2 tay đỡ mép trước
        //  theo ca-pô lên tới ~35° rồi buông (ty chống đỡ tiếp) → cúi nhìn khoang máy, tay trái tì mép ga-lăng, tay phải dò quanh nắp máy (~6 s) → đứng thẳng, giơ chìa
        //  khoá điều khiển bấm nổ máy từ xa (máy chạy đúng 30 s — van/engine-run.js, vỏ máy mờ thấy cơ cấu V6; không bật xem xuyên vì ca-pô đã mở) → cúi xem máy chạy
        //  → bấm tắt → chờ máy dừng → 2 tay với mép ca-pô kéo xuống, buông ở ~15° cho ca-pô sập (chỉ đóng nếu chính kỹ sư mở) → về lịch cũ.
        //  Bị cắt ngang (mưa, giờ ngủ, đổi việc): tắt máy, đóng ca-pô nếu đã mở, cất chìa (idle, loop-update.js). Toạ độ xe (đv xe, mũi −X): đứng X −3,62 (ba-đờ-xốc −3,26),
        //  logo (−3,21, 1,15), mép trước ca-pô = (−0,82, −0,31, ±0,3) trong hệ bản lề ca-pô, máy (−2,9 … −2,4, nắp 1,2) ----
        const engineJob = (() => {
          const J = { st: 'idle', k: 0, opened: false, fob: null, h0: new THREE.Vector3(), h1: new THREE.Vector3() }, _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3();
          const V = (x, y, z, out) => caravanObj.localToWorld(out.set(x, y, z));   // toạ độ xe → thế giới
          const ease = x => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); };
          const go = st => { J.st = st; J.k = 0; };
          const hoodP = () => VPART.hoodBtn && VPART.hoodBtn.part, edge = (s, out) => hoodP().g.localToWorld(out.set(-0.82, -0.31, 0.3 * s));   // mép trước ca-pô, s = ±1
          function turnTo(e, p, dt) { const w = Math.atan2(p.x - e.g.position.x, p.z - e.g.position.z), d = Math.atan2(Math.sin(w - e.g.rotation.y), Math.cos(w - e.g.rotation.y)); e.g.rotation.y += d * Math.min(1, dt * 6); }
          function look(e, p) { e.head.getWorldPosition(_c); e.head.rotation.x = Math.max(-0.9, Math.min(0.85, -Math.atan2(p.y - _c.y, Math.hypot(p.x - _c.x, p.z - _c.z)) - 0.8 * (e.lean || 0))); }
          function stand(e, dt) { engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET; e.armsBusy = true; turnTo(e, V(-2.7, 1, 0, _b), dt); }
          function fobOn(e, on) {   // chìa khoá điều khiển (đen, 3 × 6 cm) trong tay phải
            if (!J.fob) { J.fob = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.07, 0.016), new THREE.MeshLambertMaterial({ color: 0x1c1e20 })); J.fob.name = 'Chìa khoá xe'; J.fob.position.set(0, -0.08, 0.02); e.wrists[0].add(J.fob); }
            J.fob.visible = on;
          }
          function update(e, dt, t) {   // pha 'engine' của kỹ sư (loop-update.js): true = xong
            const P = hoodP(); if (!P || !vanGlb.engine) return true;
            if (J.st === 'idle') { J.opened = false; go('walk'); idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 9000); }   // nảy 1 ý về máy khi tới nơi
            J.k += dt; const k = J.k, R = e.reachT || (e.reachT = [null, null]), eng = V(-2.65, 0.95, 0, _a);
            if (J.st === 'walk') {   // ở hông xe phía sau mũi ⇒ qua góc đầu xe trước
              caravanObj.worldToLocal(_c.copy(e.g.position)); const corner = _c.x > -3.45 && Math.abs(_c.z) > 0.95;
              if ((engStep(e, V(corner ? -4.05 : -3.62, 0, corner ? Math.sign(_c.z) * 1.65 : 0, _b), dt, t, pf, FIRE_AVOID_R) && !corner) || k > 75) go('near');
            } else if (J.st === 'near') {   // bước nốt vào đúng chỗ đứng, quay mặt vào xe
              const p = e.g.position, s = V(-3.62, 0, 0, _b), dx = s.x - p.x, dz = s.z - p.z, d = Math.hypot(dx, dz);
              if (d > 0.01) { const m = Math.min(d, 0.6 * dt); p.x += dx / d * m; p.z += dz / d * m; e.vel = 0.6; engGait(e, m); e.walking = true; }
              p.y = cowY(p.x, p.z) - ENG_FEET; turnTo(e, V(-2.7, 1, 0, _c), dt);
              if ((d < 0.02 && k > 0.6) || k > 3) go(P.open ? 'check' : 'key');
            } else if (J.st === 'key') {   // tra chìa sau logo Ford, vặn ⇒ ca-pô bật chốt (logo lún theo tay)
              stand(e, dt); e.lean = 0.3 * ease(k / 0.5); R[0] = V(-3.24, 1.15, 0.05, J.h0); look(e, J.h0);
              if (k > 0.8 && !P.open) { vanPartToggle(VPART.hoodBtn, true); J.opened = true; }
              if (k > 1.4) go('lift');
            } else if (J.st === 'lift') {   // 2 tay đỡ mép trước, theo ca-pô lên tới ~35° rồi buông
              stand(e, dt); e.lean = 0.3 * (1 - ease(k / 1.4)); edge(0, _b); look(e, _b);
              if (P.a < 0.62 && k < 2.2) { R[0] = edge(1, J.h0); R[1] = edge(-1, J.h1); }
              if (k > 2.6) go('check');
            } else if (J.st === 'check') {   // cúi xem khoang máy: tay trái tì mép ga-lăng, tay phải dò quanh nắp máy
              stand(e, dt); const w = ease(k / 0.9) * (1 - ease((k - 5.6) / 0.8)); e.lean = 0.55 * w; look(e, eng);
              if (w > 0.3) { R[1] = V(-3.22, 1.25, -0.32, J.h1); R[0] = V(-2.86 + 0.07 * Math.sin(k * 1.3), 1.24, 0.08 + 0.13 * Math.sin(k * 0.7), J.h0); }
              if (k > 6.4) go('start');
            } else if (J.st === 'start' || J.st === 'stop') {   // giơ chìa khoá trước ngực, bấm nổ / tắt máy từ xa
              stand(e, dt); e.lean = 0; fobOn(e, true); R[0] = engBodyW(e, -0.12, 1.5, 0.42, J.h0); look(e, k < 0.7 ? J.h0 : eng);
              if (k > 0.8 && ENGR.on !== (J.st === 'start')) engineToggle(J.st === 'start', true);
              if (k > 1.7) go(J.st === 'start' ? 'watch' : 'cool');
            } else if (J.st === 'watch') {   // máy chạy: cúi xem, tay trái tì mép ga-lăng, gật gù theo tiếng máy — đủ 30 s tính từ lúc bấm nổ
              stand(e, dt); e.lean = 0.35 * ease(k / 1.2); look(e, eng); e.head.rotation.x += 0.05 * Math.sin(t * 2.4); if (k > 1) R[1] = V(-3.22, 1.25, -0.32, J.h1);
              if (k > 28.3) go('stop');
            } else if (J.st === 'cool') {   // chờ máy dừng hẳn, cất chìa
              stand(e, dt); look(e, eng); if (k > 0.5) fobOn(e, false);
              if (k > 2.2) go(J.opened ? 'close' : 'done');
            } else if (J.st === 'close') {   // với mép ca-pô, kéo xuống theo, buông ở ~15° cho ca-pô sập
              stand(e, dt); e.lean = 0.12; edge(0, _b); look(e, _b);
              if (k < 0.8 || (P.open === false && P.a > 0.26)) { R[0] = edge(1, J.h0); R[1] = edge(-1, J.h1); }
              if (k > 0.8 && P.open) vanPartToggle(VPART.hoodBtn, false);
              if (k > 2.4) go('done');
            }
            if (J.st === 'done') { J.st = 'idle'; return true; }
            return false;
          }
          function idle() {   // việc bị cắt ngang: tắt máy, đóng ca-pô nếu đã mở, cất chìa
            if (J.st === 'idle') return; const P = hoodP();
            if (ENGR.on) engineToggle(false); if (J.opened && P && P.open) vanPartToggle(VPART.hoodBtn, false); if (J.fob) J.fob.visible = false; J.st = 'idle';
          }
          return { update, idle, busy: () => J.st !== 'idle', state: J };
        })();
