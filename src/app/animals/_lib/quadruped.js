        // ===== BỘ CHÂN 4 CHI dùng chung (chó, gấu mèo, bò, hươu) =====
        //  · nhịp chân theo QUÃNG ĐƯỜNG (pha ψ tăng = quãng / sải) ⇒ không trượt chân; mỗi dáng đi có độ lệch pha 4 chân + tỉ lệ thời gian chạm đất.
        //    Dáng có vRef thì sải co giãn theo √(tốc độ / vRef) (0,55–1,25 lần): đi chậm bước ngắn mà nhịp vẫn đều, như thú thật.
        //  · bàn chân trụ ĐỨNG YÊN trên đất (toạ độ thế giới); chân vung đi theo cung nhấc lên tới điểm đáp dự đoán (theo tốc độ + hướng thân);
        //    v < 0 = đi lùi (điểm đáp ở phía sau). Lên bậc: nhấc chân lên trước rồi mới đưa tới; xuống bậc: đưa tới rồi mới hạ ⇒ không cắt qua mép bậc.
        //  · đứng yên mà bàn chân lệch chỗ "nhà" ⇒ nhích từng chân một (o.settleT giây); đang đổi dáng (nằm / ngồi / vươn vai) thì bàn chân trượt dần về chỗ;
        //    đang đi mà ngoặt gắt bỏ chân trụ quá xa (> 0,6 sải) ⇒ bước bắt kịp ngay (tối đa 2 chân cùng nhấc).
        //  · XOAY TẠI CHỖ (không đi, không đổi dáng, tốc độ xoay > TURN_ON): 2 cặp chân chéo thay nhau bước; điểm đáp = chỗ "nhà" xoay tới trước nửa cung trụ
        //    ⇒ bàn chân trụ nằm quanh chỗ "nhà", không bị bỏ lại sau; xoay càng nhanh bước càng gấp (≥ TURN_TMIN × o.settleT); cặp vừa bước nhường cặp đang chờ;
        //    bàn chân hết tầm với thì nhấc ngay. Tối đa 2 chân trên không. Xoay nhanh hơn mức bước ngắn nhất theo kịp ⇒ chân trụ vẫn bị kéo lê: nơi gọi phải giới hạn tốc độ xoay.
        //  · IK 2 đoạn (định lý cos) trong mặt phẳng chân, toạ độ gốc con vật; mặt phẳng chân dạng/khép ở hông (≤ 20°) theo độ lệch ngang của bàn chân. Hướng gập khớp giữa: L.bend = +1 chĩa ra TRƯỚC, −1 chĩa ra SAU
        //    (mặc định như chó: chân trước −1 = khuỷu, chân sau +1 = gối; bò ngược lại: gối chân trước chĩa trước, khuỷu chân sau chĩa sau).
        //    Bàn chân giữ phẳng. Chân có thể "thả tự do" tới 1 điểm (o.free[i], toạ độ gốc) — vd gấu mèo đứng 2 chân, tay cầm quả táo —
        //    hoặc hoà về góc khớp cho sẵn R.fk[i] = {a, b, p, w} (bò quỳ / nằm gập chân).
        //  · o.size = cỡ chân (đv thế giới, mặc định 0,35 = chó): ngưỡng nhích chân, dịch chuyển xa (> 4 lần cỡ ⇒ đặt lại chân tại chỗ).
        function quadRig(obj, o) {   // o: legs [{hip, knee, paw, front, L1, L2, bend?, ankleH?}] · gaits {tên: {off[4], duty, stride, lift, vRef?}} · home(L, out) · ground(x, z) · size?, settleT?, settleLift?, pivot?, split?
          const feet = o.legs.map(L => ({ L, w: new THREE.Vector3(), s0: new THREE.Vector3(), tg: new THREE.Vector3(), sw: false, mode: '', u: 0 }));
          // bàn chân trụ bị bỏ quá tầm với (hông → điểm đặt > 97% chiều dài chân) ⇒ IK hết tầm, chân hổng khỏi đất (đo: chó 86% lần đo lệch > 3 cm,
          // bò gặm cỏ nhích chậm bỏ chân lại 0,8 m) ⇒ coi như phải bước bắt kịp ngay
          // (chỉ khi bước về chỗ "nhà" thì với tới — đứng mép bậc cao mà nhà cũng ngoài tầm thì bước mãi vô ích)
          const _hw = new THREE.Vector3(), REACH = 0.97;   // _hw: khớp cổ chân lúc chân duỗi hết nằm trên mặt cầu tâm này (hông thật, hạ ankleH) — tính 1 lần / chân / khung, dùng cho cả IK
          const outReach = (F, home) => { const L = F.L, R0 = (L.L1 + L.L2) * obj.scale.y * REACH; return _hw.distanceTo(F.w) > R0 && _hw.distanceTo(home) < R0; };
          const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _c = new THREE.Vector3(), _f = new THREE.Vector3(), _t = new THREE.Vector3(), _m = new THREE.Vector3(), _n = new THREE.Vector3(), last = new THREE.Vector3();
          const ease = k => { k = Math.max(0, Math.min(1, k)); return k * k * (3 - 2 * k); };
          const size = o.size || 0.35, settleT = o.settleT || 0.22, settleLift = o.settleLift || 0.035;
          // XOAY TẠI CHỖ: tốc độ xoay om (rad/s, làm mượt) · chân chéo mate[i] được nhấc cùng lúc · điểm đáp = "nhà" xoay tới trước nửa quãng trụ (lead)
          const TURN_ON = 0.35, TURN_REACH = 0.3, TURN_THR = 0.05, TURN_TMIN = 0.5;   // rad/s bắt đầu tính là xoay · quãng 1 nhịp trụ (× size) · ngưỡng nhấc (× size) · bước nhanh nhất (× settleT)
          let psi = 0, inited = false, stride = 0, yaw0 = 0, om = 0, rTurn = size, mate = null, lastPair = -1, pivot = false;
          // o.split (đv thế giới): chênh cao tối đa giữa 2 chân CÙNG ĐẦU thân mà IK còn dựng được. Con thấp hơn bậc đất (bê, bậc 0,6 m) đứng 1 chân trên 1 chân dưới
          //   ⇒ thân theo chân thấp, cổ chân kia ngang / cao hơn hông: chân gập vào ngực, bàn chân chìm trong bậc. Có split: điểm đặt chân lệch mức quá split so với
          //   chân cùng đầu thì kéo về mức đất dưới ĐIỂM GIỮA cặp (fit: cả 2 chân cùng 1 phép chọn ⇒ không đổi mức qua lại); đang đi mà chân kia còn trụ ở mức cũ
          //   ⇒ chân kia nhấc cùng (F.hop, pha mượn F.dp tới lúc đáp): cả cặp qua bậc 1 nhịp như nhảy chồm, đầu thân lên / xuống trong lúc 2 chân trên không
          const split = o.split || 0, pal = o.legs.map((L, i) => o.legs.findIndex((M, j) => j !== i && M.front === L.front));
          const fit = (P, i, ahead) => {
            o.home(feet[i].L, _m); o.home(feet[pal[i]].L, _n); _m.add(_n).multiplyScalar(0.5); obj.localToWorld(_m); _m.addScaledVector(_f, ahead);
            const yM = o.ground(_m.x, _m.z); if (Math.abs(P.y - yM) <= split) return;
            for (let k = 0; k < 2; k++) { const t = k ? 0.9 : 0.5, x = P.x + (_m.x - P.x) * t, z = P.z + (_m.z - P.z) * t, y = o.ground(x, z); if (Math.abs(y - yM) <= split * 0.5) { P.set(x, y, z); return; } }
            P.set(_m.x, yM, _m.z);
          };
          const R = {
            feet, free: [null, null, null, null], fk: [null, null, null, null], get psi() { return psi; }, get stride() { return stride; },
            reset() { inited = false; },
            plant(groundY) { for (const F of feet) { o.home(F.L, F.w); obj.localToWorld(F.w); F.w.y = groundY(F.w.x, F.w.z); F.sw = false; } },
            support(i) { const F = feet[i]; return F.sw && F.mode === 'gait' ? F.tg.y : F.w.y; },   // cao độ đất chân i đang / sắp đứng
            pairY(i, j, slack) { const a = R.support(i), b = R.support(j); return Math.min(a, b) + Math.min(Math.abs(a - b) / 2, slack); },   // cao độ đỡ thân của 1 cặp chân: trung bình khi 2 chân gần bằng nhau; lệch 1 bậc ⇒ theo chân THẤP + độ dư tầm với (lấy trung bình ⇒ chân thấp không với tới đất, treo lơ lửng; chân cao chỉ cần co thêm)
            step(dt, dist, v, gaitName, h, pitch, posed) {
              const G = o.gaits[gaitName], sp = Math.abs(v), dir = v < 0 ? -1 : 1, S = obj.scale.y; let moving = sp > 0.06;
              obj.updateMatrixWorld(true);
              _f.set(Math.cos(obj.rotation.y), 0, -Math.sin(obj.rotation.y));   // hướng mũi (+x cục bộ) trên mặt đất
              if (!inited || last.distanceTo(obj.position) > 4 * size) { R.plant(o.ground); inited = true; yaw0 = obj.rotation.y; om = 0; }
              last.copy(obj.position);
              const dyaw = Math.atan2(Math.sin(obj.rotation.y - yaw0), Math.cos(obj.rotation.y - yaw0)); yaw0 = obj.rotation.y;
              om += ((dt > 1e-6 && Math.abs(dyaw) < 1 ? dyaw / dt : 0) - om) * Math.min(1, dt * 20);   // lệch > 1 rad / khung = đặt lại hướng, không phải xoay
              // o.pivot: vừa nhích vừa xoay gắt (tốc độ bàn chân do xoay > tốc độ đi × o.pivot) ⇒ bước như xoay tại chỗ, điểm đáp cộng thêm nửa quãng đi
              //   (nhịp đi theo quãng đường quá chậm so với cú xoay: chân trụ bị bỏ lại, kéo lê). Vào 0,8 / ra 1,25: không đổi qua lại từng khung
              pivot = !!o.pivot && moving && !posed && Math.abs(om) > TURN_ON && sp < o.pivot * Math.abs(om) * rTurn * (pivot ? 1.25 : 0.8); if (pivot) moving = false;
              const turning = !moving && !posed && Math.abs(om) > TURN_ON, wT = Math.abs(om) * rTurn + (pivot ? sp : 0);
              const Ts = turning ? Math.max(TURN_TMIN * settleT, Math.min(settleT, TURN_REACH * size / wT)) : settleT, phi = turning ? om * Ts * 0.5 : 0, cph = Math.cos(phi), sph = Math.sin(phi), lead = pivot ? v * Ts * 0.5 : 0;
              if (!mate) { const hz = o.legs.map(L => { o.home(L, _a); return _a.z; }); mate = o.legs.map((L, i) => o.legs.findIndex((M, j) => M.front !== L.front && hz[j] * hz[i] < 0)); }
              let rNow = 0;
              stride = G.vRef ? G.stride * Math.min(1.25, Math.max(0.55, Math.sqrt(sp / G.vRef))) : G.stride;
              psi = (psi + Math.abs(dist) / stride) % 1000;
              let swinging = feet.reduce((n, F) => n + (F.sw ? 1 : 0), 0);
              feet.forEach((F, i) => {
                const L = F.L, aH = (L.ankleH || 0) * S;
                L.hip.getWorldPosition(_hw); obj.worldToLocal(_c.copy(_hw)); _hw.y -= aH;
                const hipX = _c.x, hipY = _c.y, hipZ = _c.z;
                o.home(L, _a); obj.localToWorld(_a); _a.y = o.ground(_a.x, _a.z);
                const hx = _a.x - obj.position.x, hz = _a.z - obj.position.z, rH = Math.hypot(hx, hz); if (rH > rNow) rNow = rH;
                if (phi) { _t.set(obj.position.x + hx * cph + hz * sph + _f.x * lead, 0, obj.position.z - hx * sph + hz * cph + _f.z * lead); _t.y = o.ground(_t.x, _t.z); } else _t.copy(_a);   // điểm đáp khi nhích chân
                if (split) { const lone = Math.abs(_a.y - feet[pal[i]].hy) > split; F.hy = _a.y; if (lone) fit(_t, i, 0); }   // hy: mức đất chỗ "nhà" chưa chỉnh (so 2 chân cùng đầu; đất phẳng ⇒ không dò thêm)
                if (R.free[i]) { F.sw = false; F.w.copy(_a); }
                else if (F.sw && F.mode === 'settle') {   // đang nhích chân về chỗ "nhà" (kể cả khi vừa bắt đầu đi): làm nốt rồi mới vào nhịp — không bỏ quên chân giữa chừng
                  F.u += dt / Ts; const k = ease(F.u), dy = _t.y - F.s0.y;
                  F.w.lerpVectors(F.s0, _t, k); F.w.y = F.s0.y + dy * (dy > 0 ? ease(F.u * 1.7) : ease(F.u * 1.7 - 0.7)) + Math.sin(Math.PI * Math.min(1, F.u)) * settleLift * S;
                  if (F.u >= 1) { F.sw = false; F.w.copy(_t); swinging--; }
                }
                else if (moving) {
                  const ph = (psi + G.off[i] + (F.dp || 0)) % 1, inSwing = ph >= G.duty;
                  // tầm với ngang quanh chỗ "nhà": hông cao hy trên đất, "nhà" lệch ef theo hướng đi so với hông ⇒ bàn chân đặt trước nhà tối đa rx − ef.
                  // Quãng trụ của dáng (duty × sải) dài hơn 2 × tầm với (kiệu nhanh, phi) ⇒ đáp gần lại + nhấc sớm: chân trụ không bị kéo lê / hổng đất, nhịp bay dài hơn
                  const R0 = (L.L1 + L.L2) * S * REACH, hy = _hw.y - _a.y, hx0 = _a.x - _hw.x, hz0 = _a.z - _hw.z, ef = (hx0 * _f.x + hz0 * _f.z) * dir, r2 = R0 * R0 - hy * hy - (hx0 * hx0 + hz0 * hz0 - ef * ef);
                  const rx = r2 > 0 ? Math.sqrt(r2) : 0, can = rx > Math.abs(ef) && !R.fk[i], td = can ? Math.min(G.duty * 0.5 * stride, 0.9 * (rx - ef)) : G.duty * 0.5 * stride;
                  let up = inSwing || !!F.hop;
                  if (!F.sw && !up && can) { const bx = F.w.x - _hw.x, bz = F.w.z - _hw.z, by = F.w.y - _hw.y; up = (bx * _f.x + bz * _f.z) * dir < 0 && bx * bx + by * by + bz * bz > R0 * R0; }
                  if (up && !F.sw) { F.sw = true; F.s0.copy(F.w); F.mode = 'gait'; F.p0 = F.pp = ph; F.hop = 0; }
                  else if (!F.sw && swinging < 2) {   // ngoặt gắt / xoay tại chỗ / bị đẩy ngang: chân trụ bị bỏ quá xa ⇒ bước bắt kịp ngay, không chờ tới lượt
                    const ex = F.w.x - _a.x, ez = F.w.z - _a.z;
                    if (Math.hypot(ex, ez) > Math.max(0.6 * stride, 0.3 * size) || Math.abs(ex * _f.z - ez * _f.x) > 0.3 * size || (!R.fk[i] && outReach(F, _a))) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.w); swinging++; }
                  }
                  if (F.sw && F.mode === 'gait') {
                    const land = ph < F.pp, u = land ? 1 : (ph - F.p0) / (1 - F.p0), ahead = dir * (land ? td : td + (1 - ph) * stride); F.pp = ph;   // nhấc ở pha p0 (đúng nhịp: ≥ duty; nhấc sớm: < duty), đáp khi pha quay vòng
                    F.tg.copy(_a).addScaledVector(_f, ahead); F.tg.y = o.ground(F.tg.x, F.tg.z);
                    if (split && Math.abs(F.tg.y - R.support(pal[i])) > split) {
                      const j = pal[i], M = feet[j]; fit(F.tg, i, ahead);
                      if (!land && !M.sw && !M.hop && !R.fk[j] && !R.free[j] && Math.abs(F.tg.y - M.w.y) > split) { M.hop = 1; M.dp = 1 + Math.min(ph, G.duty + 0.4 * (1 - G.duty)) - (psi + G.off[j]) % 1; }   // nhấc muộn nhất ở 40% nhịp vung: không thành cú giật 1 khung
                    }
                    F.w.lerpVectors(F.s0, F.tg, ease(u));
                    const dy = F.tg.y - F.s0.y; F.w.y = F.s0.y + dy * (dy > 0 ? ease(u * 1.7) : ease(u * 1.7 - 0.7)) + Math.sin(Math.PI * u) * G.lift * S;
                    if (land) { F.sw = false; F.w.copy(F.tg); F.dp = 0; }
                  }
                } else {
                  if (F.sw && F.mode === 'gait') { F.sw = false; F.w.y = o.ground(F.w.x, F.w.z); swinging--; }
                  F.hop = F.dp = 0;
                  const hm = phi ? _a : _t, d = Math.hypot(F.w.x - hm.x, F.w.z - hm.z);
                  if (posed && d < 0.46 * size) { F.w.lerp(_a, Math.min(1, dt * 6)); F.w.y = _a.y; }
                  else if (turning) {   // nhấc khi "nhà" đã vượt qua bàn chân quá ngưỡng (bàn chân còn ở phía trước nhà thì chưa); từng cặp chéo, cặp kia chờ cặp này đáp
                    const drag = !R.fk[i] && outReach(F, _a), far = F.far = drag || Math.hypot(F.w.x - _t.x, F.w.z - _t.z) > rH * Math.abs(phi) + Math.abs(lead) + TURN_THR * size || Math.abs(F.w.y - _a.y) > 0.3 * size;   // drag: hết tầm chân, đang bị kéo lê ⇒ nhấc ngay cả khi lệch cặp
                    const M = feet[mate[i]], pr = M ? Math.min(i, mate[i]) : i;
                    const wait = pr === lastPair && feet.some((G, j) => j !== i && j !== mate[i] && G.far && !G.sw);   // cặp vừa bước nhường cặp đang chờ (không nhường ⇒ 2 chân 1 cặp thay nhau nhấc lệch nhịp, cặp kia bị kéo lê cả cú xoay)
                    if (far && ((swinging < 1 && !wait) || (swinging < 2 && (drag || (M && M.sw && M.mode === 'settle' && (M.u < 0.5 || !wait)))))) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.w); F.far = false; swinging++; lastPair = pr; }
                  }
                  else if ((d > 0.13 * size || Math.abs(F.w.y - hm.y) > 0.3 * size || (!posed && !R.fk[i] && outReach(F, _a))) && swinging < 1) { F.sw = true; F.mode = 'settle'; F.u = 0; F.s0.copy(F.w); swinging++; }
                }
                // IK: hông THẬT (toạ độ gốc con vật — đã gồm thân cao, chúc/ngóc, lắc ngang) → bàn chân (đất hoặc điểm tự do)
                const roll = L.hip.parent === obj ? 0 : L.hip.parent.rotation.x;
                if (R.free[i]) _b.copy(R.free[i]); else { obj.worldToLocal(_b.copy(F.w)); _b.y += L.ankleH || 0; }   // ankleH: khớp cổ chân cao hơn đế (bò) ⇒ đích IK là cổ chân, đế phẳng ngay dưới — móng không trượt khi cẳng nghiêng
                // dạng / khép chân (quay mặt phẳng chân quanh trục dọc thân ở hông) cho bàn chân lệch ngang — xoay thân tại chỗ, ngoặt: chân trụ không trượt ngang
                const dzL = _b.z - hipZ, dyv = _b.y - hipY, AB = R.abMax || 0.35, ab = Math.max(-AB, Math.min(AB, Math.atan2(dzL, R.abMax ? Math.max(-dyv, 0.3 * Math.abs(_b.x - hipX)) : -dyv)));   // abMax: người gọi nới lúc ôm thân cây (mặc định 0,35 rad); khi đó đích ngang / trên hông (tay ôm táo) không làm góc dạng nhảy dấu
                const L1 = L.L1, L2 = L.L2, dx = _b.x - hipX, dy = -Math.hypot(dyv, dzL) * Math.cos(Math.atan2(dzL, -dyv) - ab), D = Math.max(0.15 * (L1 + L2), Math.min(L1 + L2 - 1e-4, Math.hypot(dx, dy))), th = Math.atan2(dx, -dy);
                const al = Math.acos(Math.max(-1, Math.min(1, (L1 * L1 + D * D - L2 * L2) / (2 * L1 * D)))), be = Math.acos(Math.max(-1, Math.min(1, (L2 * L2 + D * D - L1 * L1) / (2 * L2 * D))));
                const bend = L.bend !== undefined ? L.bend : (L.front ? -1 : 1);
                let a = th + bend * al, b = -bend * (al + be), pw = R.free[i] ? -b * 0.5 : -(a + b);
                const K = R.fk[i]; if (K && K.w > 0) { a += (K.a - a) * K.w; b += (K.b - b) * K.w; pw += (K.p - pw) * K.w; }
                L.hip.rotation.z = a - pitch; L.hip.rotation.x = (-ab - roll) * (1 - (K && K.w > 0 ? K.w : 0)); L.knee.rotation.z = b; L.paw.rotation.z = pw;   // bù lắc ngang của thân: chân vẫn đúng mặt phẳng đã tính
              });
              rTurn = rNow || size;
            }
          };
          return R;
        }
