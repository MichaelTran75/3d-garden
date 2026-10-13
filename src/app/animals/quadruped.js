        // ===== BỘ CHÂN 4 CHI dùng chung (chó, gấu mèo) =====
        //  · nhịp chân theo QUÃNG ĐƯỜNG (pha ψ tăng = quãng / sải) ⇒ không trượt chân; mỗi dáng đi có độ lệch pha 4 chân + tỉ lệ thời gian chạm đất.
        //  · bàn chân trụ ĐỨNG YÊN trên đất (toạ độ thế giới); chân vung đi theo cung nhấc lên tới điểm đáp dự đoán (theo tốc độ + hướng thân).
        //  · đứng yên mà bàn chân lệch chỗ "nhà" ⇒ nhích từng chân một (0,22 s); đang đổi dáng (nằm / ngồi / vươn vai) thì bàn chân trượt dần về chỗ.
        //  · IK 2 đoạn (định lý cos) trong mặt phẳng dọc thân, toạ độ gốc con vật: khớp giữa chân trước chĩa ra SAU (khuỷu), chân sau chĩa ra TRƯỚC (gối);
        //    bàn chân giữ phẳng. Chân có thể "thả tự do" tới 1 điểm (o.free[i], toạ độ gốc) — vd gấu mèo đứng 2 chân, tay cầm quả táo.
        function quadRig(obj, o) {   // o: legs [{hip, knee, paw, front, L1, L2}] · gaits {tên: {off[4], duty, stride, lift}} · home(L, out) · ground(x, z)
          const feet = o.legs.map(L => ({ L, w: new THREE.Vector3(), s0: new THREE.Vector3(), tg: new THREE.Vector3(), sw: false, mode: '', u: 0 }));
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _f = new THREE.Vector3();
          const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
          let psi = 0, inited = false;
          const R = {
            feet, free: [null, null, null, null], get psi() { return psi; },
            reset() { inited = false; },
            plant(groundY) { for (const F of feet) { o.home(F.L, F.w); obj.localToWorld(F.w); F.w.y = groundY(F.w.x, F.w.z); F.sw = false; } },
            step(dt, dist, v, gaitName, h, pitch, posed) {
              const G = o.gaits[gaitName], moving = v > 0.06, S = obj.scale.y;
              obj.updateMatrixWorld(true);
              _f.set(Math.cos(obj.rotation.y), 0, -Math.sin(obj.rotation.y));   // hướng mũi (+x cục bộ) trên mặt đất
              if (!inited) { R.plant(o.ground); inited = true; }
              psi = (psi + dist / G.stride) % 1000;
              const T = G.stride / Math.max(0.05, v);
              let swinging = feet.reduce((n, F) => n + (F.sw ? 1 : 0), 0);
              feet.forEach((F, i) => {
                const L = F.L;
                o.home(L, _a); obj.localToWorld(_a); _a.y = o.ground(_a.x, _a.z);
                if (R.free[i]) { F.sw = false; F.w.copy(_a); }
                else if (moving) {
                  const ph = (psi + G.off[i]) % 1, inSwing = ph >= G.duty;
                  if (inSwing && !F.sw) { F.sw = true; F.s0.copy(F.w); F.mode = 'gait'; }
                  if (F.sw && F.mode === 'gait') {
                    const u = inSwing ? (ph - G.duty) / (1 - G.duty) : 1, ahead = ((1 - u) * (1 - G.duty) + G.duty * 0.5) * T * v;
                    F.tg.copy(_a).addScaledVector(_f, ahead); F.tg.y = o.ground(F.tg.x, F.tg.z);
                    F.w.lerpVectors(F.s0, F.tg, ease(u)); F.w.y += Math.sin(Math.PI * u) * G.lift * S;
                    if (!inSwing) { F.sw = false; F.w.copy(F.tg); }
                  }
                } else {
                  if (F.sw && F.mode === 'gait') { F.sw = false; F.w.y = o.ground(F.w.x, F.w.z); swinging--; }
                  const d = Math.hypot(F.w.x - _a.x, F.w.z - _a.z);
                  if (F.sw && F.mode === 'settle') {
                    F.u += dt / 0.22; F.w.lerpVectors(F.s0, _a, ease(F.u)); F.w.y += Math.sin(Math.PI * Math.min(1, F.u)) * 0.035 * S;
                    if (F.u >= 1) { F.sw = false; F.w.copy(_a); swinging--; }
                  } else if (posed && d < 0.16) { F.w.lerp(_a, Math.min(1, dt * 6)); F.w.y = _a.y; }
                  else if (d > 0.045 && swinging < 1) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.w); swinging++; }
                }
                // IK: hông (toạ độ gốc) theo thân cao h, chúc/ngóc pitch → bàn chân (đất hoặc điểm tự do)
                const hx = L.hip.position.x, hy = L.hip.position.y, cp = Math.cos(pitch), sp = Math.sin(pitch);
                const hipX = hx * cp - hy * sp, hipY = h + hx * sp + hy * cp;
                if (R.free[i]) _b.copy(R.free[i]); else obj.worldToLocal(_b.copy(F.w));
                const L1 = L.L1, L2 = L.L2, dx = _b.x - hipX, dy = _b.y - hipY, D = Math.max(0.15 * (L1 + L2), Math.min(L1 + L2 - 1e-4, Math.hypot(dx, dy))), th = Math.atan2(dx, -dy);
                const al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)))), be = Math.acos(Math.max(-1, Math.min(1, (L2 * L2 + D * D - L1 * L1) / (2 * L2 * D))));
                const a = L.front ? th - al : th + al, b = L.front ? al + be : -(al + be);
                L.hip.rotation.z = a - pitch; L.knee.rotation.z = b; L.paw.rotation.z = R.free[i] ? -b * 0.5 : -(a + b);
              });
            }
          };
          return R;
        }
