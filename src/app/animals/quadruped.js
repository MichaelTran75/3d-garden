        // ===== BỘ CHÂN 4 CHI dùng chung (chó, gấu mèo, bò, hươu) =====
        //  · nhịp chân theo QUÃNG ĐƯỜNG (pha ψ tăng = quãng / sải) ⇒ không trượt chân; mỗi dáng đi có độ lệch pha 4 chân + tỉ lệ thời gian chạm đất.
        //    Dáng có vRef thì sải co giãn theo √(tốc độ / vRef) (0,55–1,25 lần): đi chậm bước ngắn mà nhịp vẫn đều, như thú thật.
        //  · bàn chân trụ ĐỨNG YÊN trên đất (toạ độ thế giới); chân vung đi theo cung nhấc lên tới điểm đáp dự đoán (theo tốc độ + hướng thân);
        //    v < 0 = đi lùi (điểm đáp ở phía sau). Lên bậc: nhấc chân lên trước rồi mới đưa tới; xuống bậc: đưa tới rồi mới hạ ⇒ không cắt qua mép bậc.
        //  · đứng yên mà bàn chân lệch chỗ "nhà" ⇒ nhích từng chân một (o.settleT giây); đang đổi dáng (nằm / ngồi / vươn vai) thì bàn chân trượt dần về chỗ;
        //    đang đi mà ngoặt gắt bỏ chân trụ quá xa (> 0,6 sải) ⇒ bước bắt kịp ngay (tối đa 2 chân cùng nhấc).
        //  · IK 2 đoạn (định lý cos) trong mặt phẳng chân, toạ độ gốc con vật; mặt phẳng chân dạng/khép ở hông (≤ 20°) theo độ lệch ngang của bàn chân. Hướng gập khớp giữa: L.bend = +1 chĩa ra TRƯỚC, −1 chĩa ra SAU
        //    (mặc định như chó: chân trước −1 = khuỷu, chân sau +1 = gối; bò ngược lại: gối chân trước chĩa trước, khuỷu chân sau chĩa sau).
        //    Bàn chân giữ phẳng. Chân có thể "thả tự do" tới 1 điểm (o.free[i], toạ độ gốc) — vd gấu mèo đứng 2 chân, tay cầm quả táo —
        //    hoặc hoà về góc khớp cho sẵn R.fk[i] = {a, b, p, w} (bò quỳ / nằm gập chân).
        //  · o.size = cỡ chân (đv thế giới, mặc định 0,35 = chó): ngưỡng nhích chân, dịch chuyển xa (> 4 lần cỡ ⇒ đặt lại chân tại chỗ).
        function quadRig(obj, o) {   // o: legs [{hip, knee, paw, front, L1, L2, bend?, ankleH?}] · gaits {tên: {off[4], duty, stride, lift, vRef?}} · home(L, out) · ground(x, z) · size?, settleT?, settleLift?
          const feet = o.legs.map(L => ({ L, w: new THREE.Vector3(), s0: new THREE.Vector3(), tg: new THREE.Vector3(), sw: false, mode: '', u: 0 }));
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _f = new THREE.Vector3(), last = new THREE.Vector3();
          const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
          const size = o.size || 0.35, settleT = o.settleT || 0.22, settleLift = o.settleLift || 0.035;
          let psi = 0, inited = false, stride = 0;
          const R = {
            feet, free: [null, null, null, null], fk: [null, null, null, null], get psi() { return psi; }, get stride() { return stride; },
            reset() { inited = false; },
            plant(groundY) { for (const F of feet) { o.home(F.L, F.w); obj.localToWorld(F.w); F.w.y = groundY(F.w.x, F.w.z); F.sw = false; } },
            support(i) { const F = feet[i]; return F.sw && F.mode === 'gait' ? F.tg.y : F.w.y; },   // cao độ đất chân i đang / sắp đứng
            step(dt, dist, v, gaitName, h, pitch, posed) {
              const G = o.gaits[gaitName], sp = Math.abs(v), dir = v < 0 ? -1 : 1, moving = sp > 0.06, S = obj.scale.y;
              obj.updateMatrixWorld(true);
              _f.set(Math.cos(obj.rotation.y), 0, -Math.sin(obj.rotation.y));   // hướng mũi (+x cục bộ) trên mặt đất
              if (!inited || last.distanceTo(obj.position) > 4 * size) { R.plant(o.ground); inited = true; }
              last.copy(obj.position);
              stride = G.vRef ? G.stride * Math.min(1.25, Math.max(0.55, Math.sqrt(sp / G.vRef))) : G.stride;
              psi = (psi + Math.abs(dist) / stride) % 1000;
              const T = stride / Math.max(0.05, sp);
              let swinging = feet.reduce((n, F) => n + (F.sw ? 1 : 0), 0);
              feet.forEach((F, i) => {
                const L = F.L;
                o.home(L, _a); obj.localToWorld(_a); _a.y = o.ground(_a.x, _a.z);
                if (R.free[i]) { F.sw = false; F.w.copy(_a); }
                else if (F.sw && F.mode === 'settle') {   // đang nhích chân về chỗ "nhà" (kể cả khi vừa bắt đầu đi): làm nốt rồi mới vào nhịp — không bỏ quên chân giữa chừng
                  F.u += dt / settleT; const k = ease(F.u), dy = _a.y - F.s0.y;
                  F.w.lerpVectors(F.s0, _a, k); F.w.y = F.s0.y + dy * (dy > 0 ? ease(F.u * 1.7) : ease(F.u * 1.7 - 0.7)) + Math.sin(Math.PI * Math.min(1, F.u)) * settleLift * S;
                  if (F.u >= 1) { F.sw = false; F.w.copy(_a); swinging--; }
                }
                else if (moving) {
                  const ph = (psi + G.off[i]) % 1, inSwing = ph >= G.duty;
                  if (inSwing && !F.sw) { F.sw = true; F.s0.copy(F.w); F.mode = 'gait'; }
                  else if (!F.sw && swinging < 2) {   // ngoặt gắt / xoay tại chỗ / bị đẩy ngang: chân trụ bị bỏ quá xa ⇒ bước bắt kịp ngay, không chờ tới lượt
                    const ex = F.w.x - _a.x, ez = F.w.z - _a.z;
                    if (Math.hypot(ex, ez) > Math.max(0.6 * stride, 0.3 * size) || Math.abs(ex * _f.z - ez * _f.x) > 0.3 * size) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.w); swinging++; }
                  }
                  if (F.sw && F.mode === 'gait') {
                    const u = inSwing ? (ph - G.duty) / (1 - G.duty) : 1, ahead = dir * ((1 - u) * (1 - G.duty) + G.duty * 0.5) * T * sp;
                    F.tg.copy(_a).addScaledVector(_f, ahead); F.tg.y = o.ground(F.tg.x, F.tg.z);
                    F.w.lerpVectors(F.s0, F.tg, ease(u));
                    const dy = F.tg.y - F.s0.y; F.w.y = F.s0.y + dy * (dy > 0 ? ease(u * 1.7) : ease(u * 1.7 - 0.7)) + Math.sin(Math.PI * u) * G.lift * S;
                    if (!inSwing) { F.sw = false; F.w.copy(F.tg); }
                  }
                } else {
                  if (F.sw && F.mode === 'gait') { F.sw = false; F.w.y = o.ground(F.w.x, F.w.z); swinging--; }
                  const d = Math.hypot(F.w.x - _a.x, F.w.z - _a.z);
                  if (posed && d < 0.46 * size) { F.w.lerp(_a, Math.min(1, dt * 6)); F.w.y = _a.y; }
                  else if ((d > 0.13 * size || Math.abs(F.w.y - _a.y) > 0.3 * size) && swinging < 1) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.w); swinging++; }
                }
                // IK: hông THẬT (toạ độ gốc con vật — đã gồm thân cao, chúc/ngóc, lắc ngang) → bàn chân (đất hoặc điểm tự do)
                L.hip.getWorldPosition(_c); obj.worldToLocal(_c); const hipX = _c.x, hipY = _c.y, roll = L.hip.parent === obj ? 0 : L.hip.parent.rotation.x;
                if (R.free[i]) _b.copy(R.free[i]); else { obj.worldToLocal(_b.copy(F.w)); _b.y += L.ankleH || 0; }   // ankleH: khớp cổ chân cao hơn đế (bò) ⇒ đích IK là cổ chân, đế phẳng ngay dưới — móng không trượt khi cẳng nghiêng
                // dạng / khép chân (quay mặt phẳng chân quanh trục dọc thân ở hông) cho bàn chân lệch ngang — xoay thân tại chỗ, ngoặt: chân trụ không trượt ngang
                const dzL = _b.z - _c.z, dyv = _b.y - hipY, ab = Math.max(-0.35, Math.min(0.35, Math.atan2(dzL, -dyv)));
                const L1 = L.L1, L2 = L.L2, dx = _b.x - hipX, dy = -Math.hypot(dyv, dzL) * Math.cos(Math.atan2(dzL, -dyv) - ab), D = Math.max(0.15 * (L1 + L2), Math.min(L1 + L2 - 1e-4, Math.hypot(dx, dy))), th = Math.atan2(dx, -dy);
                const al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)))), be = Math.acos(Math.max(-1, Math.min(1, (L2 * L2 + D * D - L1 * L1) / (2 * L2 * D))));
                const bend = L.bend !== undefined ? L.bend : (L.front ? -1 : 1);
                let a = th + bend * al, b = -bend * (al + be), pw = R.free[i] ? -b * 0.5 : -(a + b);
                const K = R.fk[i]; if (K && K.w > 0) { a += (K.a - a) * K.w; b += (K.b - b) * K.w; pw += (K.p - pw) * K.w; }
                L.hip.rotation.z = a - pitch; L.hip.rotation.x = (-ab - roll) * (1 - (K && K.w > 0 ? K.w : 0)); L.knee.rotation.z = b; L.paw.rotation.z = pw;   // bù lắc ngang của thân: chân vẫn đúng mặt phẳng đã tính
              });
            }
          };
          return R;
        }
