        // ===== KỸ SƯ LÀM VIỆC TRÊN LAPTOP (G 17/10 "do research about engineer using laptop: behaviour, motion, movement, then improve") =====
        //  Nghiên cứu: làm việc máy tính là các ĐỢT GÕ vài giây – vài chục giây xen ĐỌC / lướt (cuộn 2 ngón trên trackpad) và RÊ – BẤM trackpad (người dùng
        //  chuột / trackpad còn nhiều hơn bàn phím); laptop thấp ⇒ cổ cúi 20–35°, gõ / đọc kỹ thì chồm tới, đọc lâu / nghĩ thì ngả lưng, đổi tư thế vài phút một
        //  lần (Straker et al. 2009; Szeto 2002); khi nghĩ thì NHÌN ĐI CHỖ KHÁC (Glenberg et al. 1998) và hay tự chạm mặt — chống cằm, xoa cằm (~16–23 lần/giờ,
        //  Kwok et al. 2015); gõ vẫn liếc bàn phím (phím đặc biệt); nghỉ vi mô: vươn vai, đan tay sau gáy, uống nước.
        //  Bản cũ: 2 tay giơ cố định ra trước (FK), rung 13 Hz giả gõ, không chạm phím / trackpad. Giờ: tay đặt bằng IK lên ĐIỂM THẬT trên MacBook (bàn phím,
        //  kê cổ tay, trackpad 160 × 100 mm — toạ độ MBP, gốc giữa đáy, +x bên phải người ngồi, +z phía người ngồi), máy pha việc nhỏ: type · read · point ·
        //  think · rest (đan tay sau gáy, IK) · stretch (vươn vai, ~7 phút). Bàn tay chữ C nằm DỌC cẳng tay, xoay quanh cẳng tay cho miệng chữ C úp vào trong –
        //  xuống (lapHandQ → e.handQ), nâng tâm tay đúng bằng chỗ thấp nhất của lưới tay ⇒ móng vừa chạm mặt phím. Gõ = bàn tay nảy 4–7 Hz lệch pha 2 tay,
        //  dời ngang tìm phím, thỉnh thoảng tay phải với Enter / Backspace; rê trackpad = vòng nhỏ + bấm nhấn 4 mm; cuộn = tay phải miết tới – lui.
        //  Laptop đặt cách mép bàn ~4 cm (van/caravan.js) — xa hơn thì vai không với tới bàn phím. Uống coke giữ nguyên (engCokeSip) ----
        const _lwP = [new THREE.Vector3(), new THREE.Vector3()], _lwM = new THREE.Vector3(), _lwV = new THREE.Vector3(), _lwIn = new THREE.Vector3();
        const _lwQ = [new THREE.Quaternion(), new THREE.Quaternion()], _lwQ2 = new THREE.Quaternion(), _lwR = new THREE.Vector3(), _lwS = new THREE.Vector3(), _lwA = new THREE.Vector3(), _lwB = new THREE.Vector3(), _lwC = new THREE.Vector3(), _lwX = new THREE.Matrix4();
        function lapPt(x, y, z, out) { return studyLaptop.group.localToWorld(out.set(x, MBP.HB + y, z)); }   // điểm trên mặt bàn phím (toạ độ MacBook)
        const LW_KB = -MBP.D / 2 + 0.122, LW_REST = MBP.D / 2 - 0.074, LW_PAD = MBP.D / 2 - 0.062;   // tâm bàn tay khi gõ (ngón trên hàng phím nhà) · kê cổ tay · tâm trackpad (z)
        let lwClaw = null, lwHand = null;   // đỉnh lưới bàn tay chữ C (hệ cổ tay, đã nhân tỉ lệ người) · lưới tay
        const LW_FAR = new Set(['think', 'rest', 'stretch', 'note']);   // việc nhỏ mà tay phải đi xa (lên cằm, sau gáy, vươn vai)
        function lapHandQ(e, i, dir, psi) {   // khung cổ tay i: dọc cẳng tay, xoay quanh cẳng tay cho miệng chữ C về dir, nghiêng xuống psi (rad) → e.handQ[i]
          const f = e.foreW && e.foreW[i]; if (!f || f.lengthSq() < 0.5) return null;
          const y = _lwA.copy(f).negate(), z = _lwB.copy(dir).multiplyScalar(Math.cos(psi)); z.y -= Math.sin(psi); z.addScaledVector(y, -z.dot(y)).normalize();
          return ((e.handQ || (e.handQ = [null, null]))[i] = _lwQ[i].setFromRotationMatrix(_lwX.makeBasis(_lwC.crossVectors(y, z), y, z)));
        }
        function lapClawLow(e, q) {   // chỗ thấp nhất của bàn tay chữ C so với tâm tay (m, âm) khi khung cổ tay hướng q
          if (!lwClaw) { const m = lwHand = e.wrists[0].children.find(o => o.isMesh && o.geometry.type === 'TorusGeometry'), a = m.geometry.attributes.position, s = e.wrists[0].getWorldScale(_lwV).x; lwClaw = []; for (let k = 0; k < a.count; k++) lwClaw.push(new THREE.Vector3().fromBufferAttribute(a, k).multiplyScalar(s)); }
          let lo = 0; for (const v of lwClaw) lo = Math.min(lo, _lwV.copy(v).applyQuaternion(lwHand.quaternion).applyQuaternion(q).y);   // lưới tay xoay quanh lỗ tay (β — engineer/pose-ik-walk.js engWristPeg)
          return lo;
        }
        function lapPick(L, cyc) {   // việc nhỏ kế tiếp (theo trọng số) + thời lượng
          if (cyc < 6) return ['stretch', 5.5];
          const r = Math.random();
          if (L.st === 'think' || L.st === 'rest') return r < 0.6 ? ['type', 4 + Math.random() * 8] : ['read', 3 + Math.random() * 5];
          return r < 0.36 ? ['type', 4 + Math.random() * 9] : r < 0.58 ? ['read', 3 + Math.random() * 6] : r < 0.78 ? ['point', 2 + Math.random() * 4] : r < 0.86 ? ['note', 9.4] : r < 0.96 ? ['think', 3 + Math.random() * 4] : ['rest', 6 + Math.random() * 4];
        }
        function lapPulse(x, a, b, r) {   // 0 → 1 → 0 mượt: lên dần trong [a, a + r], xuống dần trong [b − r, b]
          const u = Math.min(1, Math.max(0, (x - a) / r), Math.max(0, (b - x) / r)); return u * u * (3 - 2 * u);
        }
        function lapFKBase(e, b) {   // tư thế FK tương đương tay IK lúc này (góc vai θ, nghiêng ngang, khuỷu gập thêm) — uống coke đi ra / về đúng chỗ tay đang ở
          b = b || { th: [0, 0], z: [0, 0], fx: [0, 0] }; e.spine.updateWorldMatrix(true, false);
          for (let i = 0; i < 2; i++) {
            const v = e.spine.worldToLocal(_lwV.copy(e.handW[i])).sub(e.arms[i].position), d = v.length() || 1;
            b.th[i] = Math.atan2(-v.z, -v.y); b.z[i] = Math.asin(Math.max(-1, Math.min(1, v.x / d))); b.fx[i] = ENG_ARM_D - d;
          }
          if (e.armRoll) { e.armRoll[0] = b.z[0]; e.armRoll[1] = b.z[1]; } if (e.elbowFlex) { e.elbowFlex[0] = b.fx[0]; e.elbowFlex[1] = b.fx[1]; }   // nghiêng ngang + gập khuỷu tiếp đúng giá trị IK
          const P = e.pose; if (P) for (let i = 0; i < 2; i++) { P.shown[4 + i] = P.raw[4 + i] = b.th[i]; P.jv[4 + i] = 0; }   // lò xo góc vai (lớp tư thế) đang giữ góc FK cũ từ lúc nhích ghế: đặt lại, không thì tay giật về đó
          return b;
        }
        function lapFrom(e, L, bd) {   // bắt đầu 1 chặng tay mới: ghi chỗ tay đang ở, tay đi tới chỗ mới trong bd giây (smoothstep)
          L.b = 0; L.bd = bd; const F = L.f0 || (L.f0 = [new THREE.Vector3(), new THREE.Vector3()]); if (e.handW) { F[0].copy(e.handW[0]); F[1].copy(e.handW[1]); L.hf = 1; }
        }
        function lapDone(e, V) {   // hết giờ nghiên cứu (đổi việc, bấm "Chơi" drone…): uống nốt ngụm coke, hạ tay về kê cổ tay rồi mới nhích ghế ra — nhảy thẳng từ tư thế
          const L = V.lw, now = clock.elapsedTime;   //   sau gáy / chống cằm sang tư thế đứng dậy (FK) thì tay giật
          if (!L || now - L.at > 1) { V.lw = null; return true; }   // bàn đang học nhạc (không chạy lapWork) hoặc trạng thái cũ
          if (!L.leave) {
            L.leave = now;
            if (L.st === 'rest' || L.st === 'stretch') L.qOut = 1;   // hạ tay theo đường cũ (nhánh rest / stretch)
            else if (L.st !== 'read') { const bd = L.st === 'think' ? 0.95 : 0.45; L.st = 'read'; L.t = 0; L.dur = 99; lapFrom(e, L, bd); }
          }
          const C = studyChairRig; if ((!L.sip && L.st === 'read' && L.b >= L.bd && Math.abs(C.sx) < 0.01 && Math.abs(C.sw) < 0.02) || now - L.leave > 12) { V.lw = null; studyChairAt(C.off, 0, 0); return true; }   // ghế đã lăn / xoay về
          return false;
        }
        function lapWork(e, V, dt, t, rt) {
          let L = V.lw; const R = e.reachT || (e.reachT = [null, null]);
          if (!L) { L = V.lw = { st: 'read', t: 0, dur: 2, gl: 0, b: 0, bd: 0.45, at: t }; lapFrom(e, L, 0.6); }   // vừa ngồi vào: tay từ tư thế nhích ghế đi dần lên máy
          if (t - L.at > 0.25) lapFrom(e, L, 0.6);   // vừa quay lại sau việc khác: tay đi dần từ chỗ đang ở, không nhảy
          L.at = t;
          if (!L.sip && !L.leave && (t + V.ph * 3.1) % 190 < 0.5 && !LW_FAR.has(L.st) && e.handW) { L.sip = t; L.sb = lapFKBase(e, L.sb); }   // ~3 phút một lần uống coke — chỉ khi 2 tay đang trên máy
          if (L.sip) { const k = t - L.sip; if (k < 7.4) { engCokeSip(e, k, t, rt, L.sb); return; } L.sip = 0; lapFrom(e, L, 0.6); }   // uống (FK, bắt đầu + kết thúc đúng tư thế tay trên máy) xong: tay về máy
          L.t += dt; L.b += dt;
          if (L.t > L.dur && !L.leave) { const [st, dur] = lapPick(L, (t + V.ph) % 400), far = LW_FAR.has(st) || LW_FAR.has(L.st); L.st = st; L.t = 0; L.dur = dur; L.gl = 0; lapFrom(e, L, far ? 0.95 : 0.45); if (st === 'stretch') L.sb = lapFKBase(e, L.sb); }
          const k = Math.min(1, L.b / L.bd), sw = L.hf ? k * k * (3 - 2 * k) : 1, F = L.f0;   // vào việc mới: tay đi dần tới chỗ mới (xa: lên cằm, ra sau gáy ⇒ chậm hơn)
          const hand = (i, x, z, lift, psi) => {   // tay i đặt lên điểm (x, z) mặt máy, cao thêm lift (m)
            const p = lapPt(x, 0.001, z, _lwP[i]), q = lapHandQ(e, i, _lwIn.set(i ? 1 : -1, 0, 0).transformDirection(studyLaptop.group.matrixWorld), psi); p.y += lift - (q ? lapClawLow(e, q) : 0.06);   // móng tay vừa chạm mặt máy
            if (sw < 1) p.lerp(F[i], 1 - sw); R[i] = p;
          };
          rt[0] = rt[1] = 0; e.headYawT = 0; let hp = 0.2;   // hp: đầu cúi (rad)
          if (L.st === 'type') {   // gõ: 2 tay trên bàn phím, bàn tay nảy lệch pha, dời ngang tìm phím; ngắt quãng 0,5–1,5 s
            const bc = L.t % 5.5, f = 0.15 + 0.85 * lapPulse(bc, 0, 4.4, 0.25);   // đợt gõ 4,4 s, ngừng ~1 s
            const b0 = Math.max(0, Math.sin(t * 33 + 0.7 * Math.sin(t * 5.1))) ** 2 * 0.008 * f, b1 = Math.max(0, Math.sin(t * 29 + 1.9 + 0.8 * Math.sin(t * 4.3))) ** 2 * 0.008 * f;
            const ec = L.t % 3.7, ent = ec > 3.25 ? Math.sin(Math.PI * (ec - 3.25) / 0.45) ** 2 : 0;   // tay phải với Enter / Backspace (đi – về mượt)
            hand(0, 0.085 + 0.01 * Math.sin(t * 1.7) + (0.04 - 0.01 * Math.sin(t * 1.7)) * ent, LW_KB + 0.004 * Math.sin(t * 2.3) - 0.024 * ent, 0.003 + b0 * (1 - ent), 0.55);
            hand(1, -0.085 + 0.01 * Math.sin(t * 1.3 + 1), LW_KB + 0.004 * Math.sin(t * 2.1 + 2), 0.003 + b1, 0.55);
            if ((L.gl -= dt) < -2.5 - Math.random() * 3) L.gl = 0.55;   // liếc bàn phím ~0,5 s
            e.seatLean = 0.15; hp = L.gl > 0 ? 0.42 : 0.2 + Math.sin(t * 0.7) * 0.02;
          } else if (L.st === 'read') {   // đọc: kê cổ tay, ngả nhẹ; mắt dò dòng (đầu khẽ quay trái → phải); có lúc cuộn 2 ngón trên trackpad
            const sc = lapPulse(L.t % 4.2, 2.5, 4.2, 0.3), s = Math.sin(t * 7.5) * 0.012 * sc;   // tay phải sang trackpad cuộn rồi về
            hand(0, 0.11 - 0.09 * sc, LW_REST + (LW_PAD - LW_REST) * sc + s, 0.002, 0.3);
            hand(1, -0.11, LW_REST, 0.002, 0.3);
            e.seatLean = 0.06; hp = 0.17 + Math.sin(t * 0.5) * 0.015; e.headYawT = 0.06 * Math.sin((L.t % 3) / 3 * Math.PI * 2 - 1.2);
          } else if (L.st === 'point') {   // rê – bấm trackpad tay phải (vòng nhỏ + nhấn 4 mm), tay trái kê cổ tay
            const pc = L.t % 1.3, cl = 0.004 * (1 - (pc < 0.16 ? Math.sin(Math.PI * pc / 0.16) : 0));   // bấm: nhấn 4 mm rồi nhả
            hand(0, 0.025 + 0.02 * Math.cos(t * 1.6) + 0.006 * Math.sin(t * 4.1), LW_PAD + 0.014 * Math.sin(t * 2.2), 0.001 + cl, 0.45);
            hand(1, -0.14, LW_REST, 0.002, 0.3);
            e.seatLean = 0.09; hp = 0.19;
          } else if (L.st === 'think') {   // nghĩ: ngả lưng, chống cằm tay phải (xoa cằm), mắt nhìn ra chỗ khác; tay trái kê mép máy
            const ch = engMouthW(e, _lwM); ch.y -= 0.09 * e.g.scale.y; e.head.getWorldPosition(_lwP[0]);
            _lwP[0].sub(ch).setY(0).normalize(); ch.addScaledVector(_lwP[0], -0.06 * e.g.scale.y);   // trước cằm 6 cm
            ch.y += Math.sin(t * 2.4) * 0.006 * (L.t > 1.2 ? 1 : 0);   // xoa cằm
            lapHandQ(e, 0, _lwP[0], -0.3);   // miệng chữ C ôm cằm (quay về mặt, hơi ngửa)
            R[0] = sw < 1 ? ch.clone().lerp(F[0], 1 - sw) : ch.clone();
            hand(1, -0.13, LW_REST + 0.02, 0.002, 0.3);
            e.seatLean = -0.04; hp = -0.02; e.headYawT = 0.22 * Math.sin(V.ph * 7 + 1);
          } else if (L.st === 'note') {   // GHI CHÚ: viết giấy dán trên bàn → xoay ghế + lăn sang bảng ghim → ghim → đọc lướt bảng → lăn, xoay về (9,4 s)
            const T = L.t, Bd = studyBoard, C = studyChairRig, ph = T < 2.6 ? 0 : T < 4.4 ? 1 : T < 6.2 ? 2 : 3;
            if (L.np !== ph) { L.np = ph; lapFrom(e, L, 0.7); if (!ph) L.slotI = Bd.next; }   // mỗi bước tay đi mượt từ chỗ đang ở (0,7 s) · chỗ ghim chọn 1 lần mỗi tờ
            const sl = Bd.slots[L.slotI % Bd.slots.length];
            C.swivel.updateWorldMatrix(true, false); Bd.g.updateWorldMatrix(true, false);
            const arm = (i, out) => C.swivel.localToWorld(out.set(i ? -C.arm.x : C.arm.x, C.arm.y + 0.03, -0.02));   // tay đặt trên tay vịn crôm
            if (T < 2.6) {   // viết: tay phải viết lên tập giấy dán bên phải laptop (vòng nhỏ), tay trái kê cổ tay trên máy, cúi nhìn
              caravanObj.localToWorld(_lwR.copy(Bd.padP)); const lift = 0.035; hand(1, -0.11, LW_REST, 0.002, 0.3);
              R[0] = _lwP[0].copy(_lwR).add(_lwIn.set(0.015 + 0.012 * Math.cos(t * 9), lift + 0.006 * Math.max(0, Math.sin(t * 18)), 0.01 * Math.sin(t * 9 + 1)));
              hp = 0.5; L.hold = T > 2.2;
            } else {
              const pinAt = 5.2, pinned = Bd.notes[L.slotI % Bd.notes.length];
              if (T < 4.4 || T >= 6.2) { arm(1, _lwP[1]); R[1] = _lwP[1]; R[0] = T < 4.4 ? C.swivel.localToWorld(_lwP[0].set(0.1, 0.36, -0.24)) : arm(0, _lwP[0]); }   // lăn: tay phải cầm giấy trước ngực · về: 2 tay trên tay vịn
              else {   // ghim: với tới chỗ trống trên bảng, ấn đinh (nhích vào 1,5 cm)
                const press = T > pinAt - 0.35 && T < pinAt + 0.25 ? 0.015 * Math.sin(Math.PI * (T - pinAt + 0.35) / 0.6) : 0;
                R[0] = Bd.g.localToWorld(_lwP[0].set(sl[0], sl[1], 0.095 - press)); arm(1, _lwP[1]); R[1] = _lwP[1];
                if (T > pinAt && L.hold) { L.hold = false; pinned.n.position.set(sl[0], sl[1], 0.016); pinned.n.rotation.z = (Math.random() - 0.5) * 0.3; pinned.n.visible = true; pinned.pn.position.set(sl[0], sl[1] + 0.025, 0.022); pinned.pn.visible = true; Bd.next++; }
              }
              Bd.g.localToWorld(_lwM.set(T > 6.2 && T < 7.6 ? 0.25 * Math.sin((T - 6.2) * 2.2) : sl[0], 0, 0.05)); e.g.worldToLocal(_lwM);
              e.headYawT = T < 7.6 ? Math.max(-0.9, Math.min(0.9, Math.atan2(_lwM.x, _lwM.z))) : 0; hp = T < 7.6 ? 0.05 : 0.2;   // nhìn bảng (đọc lướt từ trái sang phải)
            }
            { const k2 = Math.min(1, L.b / L.bd), s2 = k2 * k2 * (3 - 2 * k2); if (s2 < 1) for (let i = 0; i < 2; i++) if (R[i]) R[i] = _lwP[i].copy(R[i]).lerp(F[i], 1 - s2); }
            e.seatLean = 0.04;
          } else if (L.st === 'rest') {   // ngả lưng, 2 tay đan sau gáy (dưới vành mũ), khuỷu dang rộng, mắt vẫn nhìn màn hình; đầu + cuối: tay từ kê cổ tay lên / xuống
            let q = Math.min(1, Math.sin(Math.PI * Math.min(1, L.t / L.dur)) * 1.6); const P = L.pole || (L.pole = [new THREE.Vector3(), new THREE.Vector3()]);
            if (L.leave) { L.qOut = Math.min(L.qOut, q) - dt; q = Math.max(0, L.qOut); if (q <= 0) { L.st = 'read'; L.t = 0; L.dur = 99; lapFrom(e, L, 0.45); } }   // rời bàn: hạ tay ngay theo đường cũ
            e.head.updateWorldMatrix(true, false); const c = e.head.localToWorld(_lwM.set(0, 0.05, -0.02));
            for (let i = 0; i < 2; i++) {
              const p = e.head.localToWorld(_lwP[i].set(i ? 0.085 : -0.085, 0.05, -0.27)), h = lapHandQ(e, i, _lwIn.copy(c).sub(p).normalize(), 0);   // miệng chữ C áp vào sau đầu
              if (q < 1) {   // đường cong bậc 2 kê cổ tay → cạnh thái dương → sau gáy (tay đi trước mặt rồi vòng qua tai, không xuyên đầu / vai)
                const a = lapPt(i ? -0.11 : 0.11, 0.06, LW_REST, _lwR), m = e.head.localToWorld(_lwS.set(i ? 0.34 : -0.34, 0.08, 0.22)).multiplyScalar(2).addScaledVector(a, -0.5).addScaledVector(p, -0.5);
                p.multiplyScalar(q * q).addScaledVector(m, 2 * q * (1 - q)).addScaledVector(a, (1 - q) * (1 - q));
                if (h) { _lwQ2.copy(h); const qr = lapHandQ(e, i, _lwIn.set(i ? 1 : -1, 0, 0).transformDirection(studyLaptop.group.matrixWorld), 0.3); if (qr) qr.slerp(_lwQ2, q); }
              }
              R[i] = sw < 1 ? p.lerp(F[i], 1 - sw) : p;
              P[i].set(i ? 0.6 : -0.6, -1, -0.15).lerp(_lwR.set(i ? 1 : -1, 0.45, 0.25), q);   // khuỷu: từ buông xuống (mặc định) → dang ra 2 bên, hơi ngửa lên
            }
            e.elbowPole = P; e.seatLean = -0.1 * q + 0.1 * (1 - q); hp = 0.24 - 0.26 * q;
          } else {   // vươn vai (FK): từ đúng tư thế tay trên máy (lapFKBase) giơ thẳng 2 tay lên rồi hạ về
            R[0] = R[1] = null; let q = Math.min(1, Math.sin(Math.PI * Math.min(1, L.t / L.dur)) * 1.6);
            if (L.leave) { L.qOut = Math.min(L.qOut, q) - dt / 0.8; q = Math.max(0, L.qOut); if (q <= 0) { L.st = 'read'; L.t = 0; L.dur = 99; lapFrom(e, L, 0.6); } }
            const B = L.sb || (L.sb = lapFKBase(e)), F = e.elbowFlexT || (e.elbowFlexT = [0, 0]);
            for (let i = 0; i < 2; i++) { e.arms[i].rotation.x = B.th[i] + (-2.9 - B.th[i]) * q; rt[i] = B.z[i] * (1 - q); F[i] = B.fx[i] * (1 - q); }
            e.seatLean = -0.12 * q; hp = 0.05 - 0.3 * q;
          }
          e.head.rotation.x = hp;   // lớp tư thế (lò xo) làm mượt khi đổi việc
          // ghế văn phòng theo người: đi ghi chú thì lăn + xoay sang bảng (lăn ra 2,6–4,2 s, về 7,6–9,2 s), nghĩ thì xoay nhẹ qua lại; lưng ngả theo người tựa ra sau
          const C = studyChairRig, out = L.st === 'note' && !L.leave ? lapPulse(L.t, 2.6, 9.2, 1.6) : 0, fid = L.st === 'think' ? 0.07 * Math.sin(t * 0.55) : L.st === 'read' ? 0.03 * Math.sin(t * 0.3) : 0, kc = 1 - Math.exp(-dt * 4);
          studyChairAt(C.off, C.sx + (-0.02 * out - C.sx) * kc, C.sw + (-1.0 * out + fid - C.sw) * kc);   // bảng ghim gần (Transit): chỉ xoay, không lăn sang
          C.back.rotation.x += (0.12 + Math.max(0, -(e.seatLean || 0)) * 1.6 - C.back.rotation.x) * Math.min(1, dt * 3);
        }
        function lapHeldTick(e) {   // sau IK tay: tờ giấy dán đang cầm ở tay phải (đọc đúng chỗ bàn tay đã giải xong)
          const Bd = studyBoard, V = e.van, L = V && V.lw; if (!Bd.held) return;
          const on = !!(L && L.st === 'note' && L.hold && e.act === 'research' && V.st === 'work'); Bd.held.visible = on; if (!on) return;
          e.wrists[0].updateWorldMatrix(true, false); const p = e.wrists[0].localToWorld(_lwV.set(0, -0.06, 0.05)); Bd.held.parent.worldToLocal(p); Bd.held.position.copy(p);
        }
