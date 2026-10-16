        // ===== KỸ SƯ PHẢN ỨNG VỚI CẢNH XUNG QUANH (G 16/10: "add thêm animation cho engineer, react với chó, gió, raining time, lá rơi…") =====
        //  Lớp phủ lên việc đang làm, không đổi lịch:
        //   · NHÌN: mỗi khung chọn 1 thứ đáng nhìn nhất — sét > chó giũ nước sát người > tay mình (bắt lá, hứng mưa) > lá / cánh hoa rơi ngang mặt >
        //     chó chạy vòng (nhìn theo 5 s, thôi 2,5 s) > gió quất mặt (ngoảnh đi) > chó lại gần (liếc). Đầu quay rồi mới cúi (thứ tự YXZ), ngoái xa
        //     thì vặn thêm eo. Mức tự do theo việc: đang ăn / đọc chỉ liếc khi có chuyện lớn, ngủ trưa chỉ giật mình vì sét.
        //   · TAY (IK, chỉ khi tay rảnh; ngồi uống trà thì chỉ lúc tay nghỉ trên đùi): giữ mũ khi gió giật · ngửa tay hứng mưa · với bắt lá / cánh
        //     hoa bay ngang tầm với, giơ lên ngắm rồi thả cho gió cuốn · phủi lá rơi trúng mũ · xua khói bay vào mặt (đo khói thật trên sợi khói NS
        //     của lửa trại + lò chiminea) · hơ tay về phía lửa khi lạnh · xoa tay · lau trán khi nắng nóng · vỗ tay khi chó chạy vòng · giơ tay che
        //     khi chó giũ nước.
        //   · MƯA: bắt đầu mưa lúc đang đứng / đi ngoài mái hiên ⇒ đứng lại ngẩng nhìn trời, ngửa tay ~2,7 s rồi đi vội vào hiên (×1,55 tốc độ, khom
        //     người, ôm bảng ghi chép vào ngực, tay phải che mũ); ngồi dưới hiên thì ngẩng nhìn ra; trú mưa: lúc ngắm mưa, lúc hứng mưa, xoa tay, hơ
        //     tay bên lò; tạnh thì ngẩng nhìn trời, đưa tay ra thử. Sét: giật mình (cúi đầu, ngả ra sau, rụt tay) rồi ngoái nhìn tia sét.
        //   · GIÓ (đo tại đầu, m/s thật = gió cảnh × sceneWind.ms / U): nghiêng người đón gió, đi ngược gió chậm lại, cơn giật mạnh thì giữ mũ.
        //   · CHÓ: đang theo chân mà chủ dừng lại (đứng xem trạm, dạo trại) ⇒ chó tới trước mặt ngồi, chủ ngồi xổm xoa đầu 3 cái.
        //  Gọi trong engineer/loop-update.js: engReactHold (đứng lại thay việc) · engReactPre (trước lớp tư thế) · engReactPost (sau IK chân: nhìn,
        //  nhịp cử chỉ — trước engSeatPost) · engReactArms (đích tay — sau engSeatPost, trước engArmPost).
        const RX_NO = [false, false], RX_YES = [true, true], RX_R = [true, false];
        const RX_BUSY = new Set(['pet', 'apple', 'drone', 'drink', 'grab', 'plant', 'toPlant', 'toGrill', 'eatFish', 'tossFish', 'fish', 'eat', 'read', 'nap']);
        const RX_STOP = new Set(['wander', 'check', 'toMast', 'toChair', 'toShelter', 'toFish', 'toDog']);   // việc đi / đứng dừng lại được
        // ưu tiên cử chỉ: cử chỉ cao hơn mới chen ngang được
        const RX_GP = { wipe: 1, rub: 1, warm: 1, palm: 2, clap: 2, laugh: 2, wave: 3, cough: 3, catch: 3, look: 3, drop: 3, brush: 3, helmet: 4, pat: 4, shield: 5, cover: 6 };
        const RX_TXT = {
          rain: ['Mưa rồi! Vào hiên thôi.', 'Ơ, mưa rồi kìa.', 'Mưa nặng hạt dần, chạy vào mái hiên đã.'],
          rainSeat: ['Mưa rồi, may mà đang ngồi dưới hiên.', 'Mưa xuống rồi, nghe lộp độp trên mái bạt.'],
          rainFish: ['Mưa rồi, thu cần vào hiên thôi.'],
          dry: ['Tạnh mưa rồi.', 'Hết mưa rồi, trời sáng dần lên.'],
          bolt: ['Sét gần quá!', 'Chớp loé cả mặt hồ.'],
          gust: ['Gió giật mạnh quá, giữ mũ cái đã.', 'Suýt nữa bay cả mũ.'],
          petal: ['Bắt được một cánh hoa anh đào.', 'Cánh hoa bay tận đến đây.'],
          leaf: ['Bắt được một chiếc lá.', 'Lá rơi đúng vào tay.'],
          miss: ['Hụt mất rồi.'],
          hat: ['Lá rơi trúng mũ.'],
          zoom: ['Chạy vòng hăng thế, lát lại thở dốc cho xem.', 'Nó lại lên cơn chạy vòng rồi.'],
          pat: ['Ngoan, ngồi đây nào.', 'Đi theo mình cả buổi rồi à?'],
          shake: ['Ướt hết rồi, giũ xa xa ra chứ!'],
          smoke: ['Khói bay hết vào mặt.', 'Gió đổi chiều, khói cay mắt quá.'],
          warm: ['Hơ tay bên lửa cho ấm.'],
          cold: ['Lạnh tay quá, xoa cho ấm.'],
          hot: ['Nóng quá, mồ hôi nhễ nhại.']
        };
        const RX_CLIP = new THREE.Vector3(0, 0.08, 0.16);   // tâm bảng ghi chép trong khung cổ tay trái (engineer/model.js)
        const RX_LEAF_Q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), Math.PI / 2);   // lá nằm ngửa trong tay: pháp tuyến lá (+y) = miệng chữ C (+z cổ tay)
        const RX_SMOKE0 = 0.6;   // độ đậm khói ở mặt (tổng độ đục điểm sợi khói trong 0,4 đv) coi là cay mắt
        const _rxA = new THREE.Vector3(), _rxB = new THREE.Vector3(), _rxC = new THREE.Vector3(), _rxD = new THREE.Vector3(), _rxE = new THREE.Vector3(), _rxL = new THREE.Vector3();
        const _rxQ = new THREE.Quaternion(), _rxQ2 = new THREE.Quaternion(), _rxQ3 = new THREE.Quaternion(), _rxUp = new THREE.Vector3(0, 1, 0), _rxDn = new THREE.Vector3(0, -1, 0);
        const RX = { t: 0, rain: null, hold: null, gest: null, look: null, lookP: new THREE.Vector3(), gp: new THREE.Vector3(), gw: 0, po: 0, pAdd: 0, sp: { x: 0, y: 0 },
          wv: new THREE.Vector3(), wm: 0, calm: 0, leaf: null, leafT: 0, bolt: -1, boltP: new THREE.Vector3(), flinch: 0, smkT: 0, smkN: 0,
          zoomSeen: false, zc: 0, dc: 0, still: 0, idle: 0, teaW: false, nx: {}, say: {}, pole: [new THREE.Vector3(), new THREE.Vector3()], poles: [null, null], patSpot: new THREE.Vector3() };
        // mái bạt hiên xe (hệ toạ độ xe): đứng trong vùng này là đã khỏi mưa
        const RX_AW = (() => {
          let a = null; caravanObj.traverse(o => { const p = o.isMesh && o.geometry.parameters; if (p && p.height === 0.04 && p.depth === 2.4) a = o; });
          if (!a) return null; const w = a.geometry.parameters.width / 2;
          return { x0: a.position.x - w + 0.1, x1: a.position.x + w - 0.1, z0: a.position.z - 1.2, z1: a.position.z + 1.05 };
        })();
        const rxDry = p => { if (!RX_AW) return false; const l = caravanObj.worldToLocal(_rxL.copy(p)); return l.x > RX_AW.x0 && l.x < RX_AW.x1 && l.z > RX_AW.z0 && l.z < RX_AW.z1; };
        const rxRaining = () => !!(liveWeather.state.fresh && liveWeather.state.raining);
        const rxOutside = e => !e.inVan && e.phase !== 'van' && e.g.parent === scene;
        const rxSS = (x, a, b) => THREE.MathUtils.smoothstep(x, a, b);
        const rxTeaLeft = e => e.phase === 'tea' ? (e.teaIdle ? TEA_T - (e.teaT % TEA_T) : 0) : Infinity;   // uống trà: còn bao lâu tay nghỉ trên đùi (cử chỉ phải xong trước đó, không thì tay giật về cốc)
        // tay rảnh cho cử chỉ [phải, trái] — trái đang cầm bảng ghi chép (đi ngoài trời) thì chỉ tay phải
        function rxHands(e, clipOk) {
          if (!rxOutside(e)) return RX_NO;
          const s = e.seat && e.seat.st, P = e.phase, H = e.hold || {};
          if (s && s !== 'go' && s !== 'leave' && s !== 'stood') return s === 'seated' && (P === 'shelter' || (P === 'tea' && e.teaIdle)) ? RX_YES : RX_NO;
          if (e.armsBusy || e.noFootIK && !(RX.hold && RX.hold.k === 'pat') || RX_BUSY.has(P) || grill.st === 'held' || grill.st === 'carried') return RX_NO;
          if (H.spoon || H.bottle || H.book || H.chop || H.knife || H.spatula || H.coke || H.cup || (e.dish && e.dish.at === 'hand')) return RX_NO;
          return !clipOk && e.clip && e.clip.visible ? RX_R : RX_YES;
        }
        // mức tự do quay đầu nhìn quanh (0–1) theo việc đang làm
        function rxGazeFree(e) {
          if (!rxOutside(e)) return 0;
          const s = e.seat && e.seat.st, P = e.phase;
          if (s === 'sit' || s === 'rise' || s === 'back' || s === 'turn') return 0.3;
          if (P === 'tea') return e.teaIdle ? 1 : 0.35;
          if (P === 'read') return 0.5;
          if (P === 'fish') return angling.stage === 'wait' || angling.stage === 'approach' ? 0.8 : 0.15;
          if (P === 'eat' || P === 'eatFish' || P === 'tossFish') return 0.35;
          if (P === 'nap') return 0;
          if (P === 'pet' || P === 'apple' || P === 'grab' || P === 'plant' || P === 'toPlant' || P === 'toGrill') return 0.25;
          return 1;
        }
        function rxSay(kind, lines, label, urgent) {   // câu nghĩ ngắn khi có chuyện (mỗi loại ≥ 4 phút, chung ≥ 25 s; không chen tin đang hiện trừ khi gấp)
          const now = Date.now(); if (now < (RX.say[kind] || 0) || (!urgent && (now < thoughtUntil || now < (RX.say._ || 0)))) return;
          const ctx = engContext(now);
          checkBubbleSprite.userData.thought = { header: ctx.wxIcon + ' ' + clockText(ctx.h) + ' · ' + label, message: lines[(Math.random() * lines.length) | 0], kind: 'react', revision: ++thoughtRevision };
          thoughtUntil = now + 7000; idleThoughtAt = Math.max(idleThoughtAt, now + 45000); RX.say[kind] = now + 240000; RX.say._ = now + 25000;
        }
        function rxGest(k, dur, o) { if (RX.gest && RX_GP[RX.gest.k] >= RX_GP[k]) return false; RX.gest = Object.assign({ k, t: 0, dur }, o); return true; }
        function rxGestEnd(G) { if (G && G.dur > G.t + 0.35) G.dur = G.t + 0.35; }
        function rxLook(k, prio, dur, p) { if (RX.look && RX.t < RX.look.until && RX.look.prio > prio) return; RX.look = { k, prio, until: RX.t + dur }; if (p) RX.lookP.copy(p); }
        function rxLookAway(e, src, prio, dur) {   // ngoảnh mặt tránh src (khói, chó giũ nước) sang phía ít phải xoay hơn
          e.head.getWorldPosition(_rxA); const yaw = e.g.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw);
          let ax = _rxA.x - src.x, az = _rxA.z - src.z; const l = Math.hypot(ax, az) || 1; ax /= l; az /= l;
          const side = (-az * fx + ax * fz) >= 0 ? 1 : -1;
          rxLook('away', prio, dur, _rxB.set(_rxA.x + (ax * 0.6 - az * side) * 2.5, _rxA.y - 0.25, _rxA.z + (az * 0.6 + ax * side) * 2.5));
        }
        function rxSky(e, out) { const yaw = e.g.rotation.y; e.head.getWorldPosition(out); return out.set(out.x + Math.sin(yaw) * 2.5, out.y + 4.5, out.z + Math.cos(yaw) * 2.5); }
        // khung cổ tay: miệng chữ C hướng dir, cổ tay thẳng theo cẳng tay
        const rxQ = (e, i, dir, out) => aimQ(out, dir, engWristUp(e, i, dir));
        function rxHand(e, i, p, q, w) {   // đích tay i hoà với đích của việc đang làm (ngồi uống trà: tay nghỉ trên đùi) theo w
          if (w < 1e-3) return;
          const R = e.reachT, Q = e.handQ;
          if (R && R[i]) { _rxE.copy(R[i]).lerp(p, w); _rxQ3.copy(Q && Q[i] ? Q[i] : q).slerp(q, w); engHandSet(e, i, _rxE, _rxQ3); }
          else if (w > 0.4) engHandSet(e, i, p, q);   // tay đang buông: IK tự hoà vào / ra
        }
        function rxHandAt(e, i, q, local, worldP, w) { rxHand(e, i, _rxD.copy(local).multiplyScalar(e.g.scale.y).applyQuaternion(q).negate().add(worldP), q, w); }   // điểm local (khung cổ tay) phải nằm ở worldP
        function rxPole(e, i, x, y, z) {   // hướng khuỷu (hệ eo) — mảng riêng, không ghi vào mảng hằng của pha khác (EAT_POLE)
          const EP = e.elbowPole, P = RX.poles; P[0] = EP ? EP[0] : null; P[1] = EP ? EP[1] : null; P[i] = RX.pole[i].set(x, y, z); e.elbowPole = P;
        }
        function rxFire(e) {   // lửa đang cháy gần (lò chiminea khi mưa / lửa trại buổi tối) để hơ tay
          const g = e.g.position;
          if (chiminea.lit() > 0.2 && chiminea.g.position.distanceTo(g) < 3.8) return _rxC.copy(chiminea.g.position).setY(chiminea.g.position.y + 0.5);
          if (campfireLevel(liveWeather.localHour) * campRain.flameK > 0.25 && Math.hypot(pf.x - g.x, pf.z - g.z) < 4) return _rxC.set(pf.x, pf.y + 0.4, pf.z);
          return null;
        }
        function rxSmokeAt(S, p, r) {   // độ đậm khói quanh p: tổng độ đục các điểm sợi khói trong bán kính r (toạ độ sợi khói tính từ gốc nguồn)
          if (!S || !S.on) return 0; const B = S.mesh.position, P = S.geo.attributes.position.array, D = S.geo.attributes.aD.array, px = p.x - B.x, py = p.y - B.y, pz = p.z - B.z, r2 = r * r;
          let s = 0; for (let v = 0, n = P.length / 3; v < n; v += 2) { const dx = P[v * 3] - px, dy = P[v * 3 + 1] - py, dz = P[v * 3 + 2] - pz, d2 = dx * dx + dy * dy + dz * dz; if (d2 < r2) s += D[v * 4] * (1 - Math.sqrt(d2) / r); }
          return s / 255;
        }
        // ---- lá đang ở trên người (q.st 6: water-leaves.js gọi q.hold mỗi khung để lấy vị trí, hướng) ----
        function rxHoldHand(p, q) {
          const L = RX.leaf; if (!L || L.q.hold !== rxHoldHand) return false;
          const w = engObj.wrists[0]; w.updateWorldMatrix(true, false); w.localToWorld(p.set(0, 0, 0.035)); w.getWorldQuaternion(q).multiply(RX_LEAF_Q); return true;
        }
        function rxHoldHat(p, q) {
          const L = RX.leaf; if (!L || L.q.hold !== rxHoldHat) return false;
          const h = engObj.head; h.updateWorldMatrix(true, false); h.localToWorld(p.copy(L.lp)); h.getWorldQuaternion(q).multiply(L.lq); return true;
        }
        function rxLeafLet(vx, vy, vz) { const L = RX.leaf; if (!L) return; const q = L.q; if (q.st === 6) { q.st = 1; q.hold = null; q.v.set(vx, vy, vz); q.rxNo = RX.t + 4; } RX.leaf = null; }   // rxNo: 4 s không tính rơi trúng mũ lại
        function rxReset(e) {
          if (RX.leaf) { const q = RX.leaf.q; if (q.st === 6) rxLeafLet(0, 0, 0); RX.leaf = null; }
          if (RX.hold) rxHoldEnd(); RX.gest = null; RX.look = null; RX.gw = 0; RX.po = 0; RX.flinch = 0;
          e.spd = 1.1;
        }
        function rxHoldEnd() { RX.hold = null; const B = dogBrain.state; B.patAt = null; B.patReady = false; }
        function rxRainEvent(e, start) {
          const s = e.seat && e.seat.st, seated = !!s && s !== 'go' && s !== 'leave' && s !== 'stood';
          if (start) {
            if (!seated && !rxDry(e.g.position) && RX_STOP.has(e.phase) && !RX.hold) RX.hold = { k: 'rain', t: 0, dur: 2.7 };
            rxLook('sky', 3, 2.6);
            rxSay('rain', !seated ? RX_TXT.rain : e.seat.C === CAMP_SEAT ? RX_TXT.rainSeat : RX_TXT.rainFish, 'Trời đổ mưa', true);
          } else {
            rxLook('sky', 3, 2.2);
            if (seated && rxHands(e)[0] && rxTeaLeft(e) > 2.7) rxGest('palm', 2.2);
            rxSay('dry', RX_TXT.dry, 'Tạnh mưa', true);
          }
        }
        // ---- đứng lại thay việc đang làm: mưa bắt đầu (ngẩng nhìn trời, ngửa tay) · ngồi xổm xoa đầu chó ----
        function engReactHold(e, dt, t) {
          const H = RX.hold; if (!H) return false;
          const s = e.seat && e.seat.st;
          if (!rxOutside(e) || (s && s !== 'go' && s !== 'leave' && s !== 'stood')) { rxHoldEnd(); return false; }
          H.t += dt; const g = e.g, gp = g.position;
          engStandStill(e); e.vel = 0; gp.y = cowY(gp.x, gp.z) - ENG_FEET;
          if (H.k === 'rain') {
            if (H.t > 0.35 && H.t < 0.5 && rxHands(e)[0]) rxGest('palm', 2.1);
            if (H.t >= H.dur) rxHoldEnd();
          } else if (H.k === 'pat') {
            const B = dogBrain.state, dp = dogObj.position;
            if (B.st !== 'follow' || dogRain.st || H.t > 10) { rxHoldEnd(); return true; }
            if (!H.on) {
              if (B.patReady || (H.t > 4 && Math.hypot(dp.x - gp.x, dp.z - gp.z) < 1)) { H.on = true; H.t0 = H.t; rxSay('pat', RX_TXT.pat, 'Chơi với chó', false); }
              else if (H.t > 6.5) { rxHoldEnd(); return true; }
            }
            // quay mặt về chỗ chó ngồi
            const yt = Math.atan2(dp.x - gp.x, dp.z - gp.z); g.rotation.y += Math.atan2(Math.sin(yt - g.rotation.y), Math.cos(yt - g.rotation.y)) * Math.min(1, dt * 3);
            if (H.on) {
              const u = H.t - H.t0, k = 0.85 * rxSS(u, 0, 0.7) * (1 - rxSS(u, 3.0, 3.7));
              e.noFootIK = true; gp.y -= 0.24 * CAMP_SCALE * ENGINEER_SIZE * k;   // ngồi xổm (như lúc đặt táo vào giỏ)
              e.legs[0].rotation.x = e.legs[1].rotation.x = -1.05 * k; e.knees[0].rotation.x = e.knees[1].rotation.x = 1.75 * k; e.lean = 0.12 * k;
              H.k2 = k; engPetting = u > 0.7 && u < 3.0;
              if (u > 0.55 && u < 0.7) rxGest('pat', 2.6);
              if (u > 3.8) rxHoldEnd();
            }
          }
          return true;
        }
        // ---- trước lớp tư thế: sự kiện (mưa, sét, chó, lá, khói), gió, tốc độ, nghiêng người ----
        function engReactPre(e, dt, t) {
          RX.t = t; if (RX.bolt < 0) RX.bolt = storm.until;
          const out = rxOutside(e), rain = rxRaining();
          if (RX.rain === null) { if (liveWeather.state.fresh) RX.rain = rain; }   // mở trang giữa cơn mưa: không giật mình
          else if (rain !== RX.rain) { RX.rain = rain; if (out) rxRainEvent(e, rain); }
          if (storm.until > RX.bolt + 1e-3) {   // tia sét mới
            RX.bolt = storm.until;
            if (out && lightning.visible) {
              const a = lightning.geometry.attributes.position.array; RX.boltP.set(a[18], a[19], a[20]);
              RX.flinch = 0.75; rxLook('bolt', 6, 1.8, RX.boltP);
              if (RX.boltP.distanceTo(e.g.position) < 90) rxSay('bolt', RX_TXT.bolt, 'Sấm chớp', false);
            }
          }
          if (!out) { if (RX.gest || RX.hold || RX.leaf || e.spd !== 1.1) rxReset(e); return; }
          const g = e.g, s = e.seat && e.seat.st, onFoot = !e.seatCtl && (!s || s === 'go' || s === 'leave' || s === 'stood'), seated = s === 'seated';
          const yaw = g.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw);
          // ---- gió tại đầu (m/s thật, ngang): mượt ~0,25 s · nền ~8 s ----
          e.head.getWorldPosition(_rxA);
          windAt(_rxA.x, _rxA.y, _rxA.z, Math.max(0.3, _rxA.y - cowY(_rxA.x, _rxA.z)), _rxB); _rxB.y = 0; _rxB.multiplyScalar(sceneWind.ms / Math.max(0.25, sceneWind.U));
          RX.wv.lerp(_rxB, 1 - Math.exp(-dt * 4)); const ws = RX.wv.length(); RX.wm += (ws - RX.wm) * (1 - Math.exp(-dt / 8));
          const head = -(RX.wv.x * fx + RX.wv.z * fz);   // thành phần gió thổi vào mặt
          // ---- mưa: đi vội vào hiên (khom người, cúi đầu, tay che mũ, ôm bảng) ----
          const dash = (rain || rainK > 0.2) && onFoot && e.walking && !RX.hold && !rxDry(g.position);
          e.spd = 1.1 * (dash ? 1.55 : 1) * (1 - Math.min(0.2, Math.max(0, head - 2.5) * 0.03));   // ngược gió: bước chậm lại (dùng ở khung sau)
          if (dash) { e.lean = Math.max(e.lean, 0.09); e.head.rotation.x += 0.14; if (rxHands(e, true)[0]) rxGest('cover', Infinity); }
          else if (RX.gest && RX.gest.k === 'cover') rxGestEnd(RX.gest);
          // ---- đón gió: nghiêng người ngược chiều gió (đứng / đi) ----
          if (onFoot && ws > 2.2) {
            const k = Math.min(0.06, (ws - 2.2) * 0.012) / ws;
            e.lean += head * k; e.bank += (RX.wv.x * Math.cos(yaw) - RX.wv.z * Math.sin(yaw)) * k;
          }
          // ---- cơn giật mạnh: giữ mũ (tới khi lặng ≥ 0,8 s) · gió quất mặt lúc đứng: ngoảnh đi ----
          const G = RX.gest;
          if (G && G.k === 'helmet') { RX.calm = ws < 3.4 ? RX.calm + dt : 0; if (G.t > 1.4 && RX.calm > 0.8) { rxGestEnd(G); RX.nx.helmet = t + 3; } }
          else if (onFoot && !dash && ((ws >= 4.3 && ws >= 1.2 * RX.wm + 0.3) || ws >= 6.5) && t >= (RX.nx.helmet || 0) && rxHands(e)[0] && rxGest('helmet', Infinity)) { RX.calm = 0; if (Math.random() < 0.4) rxSay('gust', RX_TXT.gust, 'Gió giật', false); }
          if (onFoot && !e.walking && ws >= 3.8 && head > 0.6 * ws) { const sd = (RX.wv.x * Math.cos(yaw) - RX.wv.z * Math.sin(yaw)) >= 0 ? 1 : -1, a = yaw + sd * 1.0; e.head.getWorldPosition(_rxA); rxLook('wind', 2.2, 0.3, _rxB.set(_rxA.x + Math.sin(a) * 3, _rxA.y - 0.2, _rxA.z + Math.cos(a) * 3)); }
          // ---- sét: giật mình ----
          if (RX.flinch > 0) {
            RX.flinch = Math.max(0, RX.flinch - dt); const f = Math.sin(Math.PI * (1 - RX.flinch / 0.75));
            e.lean -= 0.07 * f; const ft = e.elbowFlexT || (e.elbowFlexT = [0, 0]); ft[0] = Math.max(ft[0], 0.12 * f); ft[1] = Math.max(ft[1], 0.12 * f);
          }
          RX.still = onFoot && !e.walking && !RX.hold ? RX.still + dt : 0;
          rxDog(e, dt, t, onFoot, seated);
          rxLeafScan(e, t, onFoot);
          rxSmoke(e, t);
          rxIdle(e, t, onFoot, seated);
          // cử chỉ cần dáng thân (trước lớp tư thế)
          const C = RX.gest;
          if (C && C.k === 'shield') e.lean -= 0.08 * rxSS(C.t, 0, 0.25);
        }
        function rxDog(e, dt, t, onFoot, seated) {
          if (!dogObj || dogRain.st) { RX.zoomSeen = false; return; }
          const B = dogBrain.state, dp = dogObj.position, gp = e.g.position, d = Math.hypot(dp.x - gp.x, dp.z - gp.z);
          if (B.shake > 0.3 && d < 1.8 && !(RX.gest && RX.gest.k === 'shield')) {   // chó giũ nước sát người: giơ tay che, ngoảnh đi
            if (rxHands(e, true)[0] && rxTeaLeft(e) > 1.5 && rxGest('shield', 0.45 + B.shake / 1.2)) rxSay('shake', RX_TXT.shake, 'Chơi với chó', false);
            rxLookAway(e, dp, 4, 0.5 + B.shake / 1.2);
          }
          if (B.st === 'zoom') {   // chạy vòng: nhìn theo; lần đầu mỗi đợt thì cười (vỗ tay nếu 2 tay rảnh)
            if (!RX.zoomSeen && B.k > 2.5 && d < 18 && rxGazeFree(e) > 0.7) {
              RX.zoomSeen = true; const hf = rxHands(e), clap = hf[0] && hf[1] && rxTeaLeft(e) > 2.3; rxGest(clap ? 'clap' : 'laugh', clap ? 1.7 : 1.3); rxSay('zoom', RX_TXT.zoom, 'Chơi với chó', false);
            }
          } else RX.zoomSeen = false;
          // chó đang theo chân, chủ đứng lại ≥ 1,5 s (xem trạm, dạo trại) ⇒ gọi lại, ngồi xổm xoa đầu
          if (B.st === 'follow' && !RX.hold && onFoot && RX.still > 1.5 && (e.phase === 'check' || e.phase === 'wander') && d < 3.5 && t >= (RX.nx.pat || 0) && rxHands(e)[0] && !RX.gest) {
            // chỗ chó ngồi: thử trước–phải → phải → trước → ... (tay phải xoa); chỉ loại nước, đất chênh, vật nhỏ thật (cọc, gốc cây, đồ trại) — vùng tránh
            // nới rộng của vật lớn thì bỏ qua (xem trạm: kỹ sư đứng ngay tâm vùng tránh 2 m của cột khí tượng)
            const yaw = e.g.rotation.y, gy = cowY(gp.x, gp.z), sp = RX.patSpot; let ok = false;
            for (const a of [-0.6, -1.2, 0, -1.8, 0.6]) {
              sp.set(gp.x + Math.sin(yaw + a) * 0.62, 0, gp.z + Math.cos(yaw + a) * 0.62);
              if (isWater(Math.round(x2gi(sp.x)), Math.round(z2gj(sp.z))) || Math.abs(cowY(sp.x, sp.z) - gy) > 0.3) continue;
              if (ENG_PROPS.some(o => Math.hypot(sp.x - o.x, sp.z - o.z) < o.r + 0.25) || obstacleCoords.some(o => o.r < 1.2 && Math.hypot(sp.x - o.x, sp.z - o.z) < o.r + 0.2)) continue;
              ok = true; break;
            }
            RX.nx.pat = t + (ok ? 75 : 5);
            if (ok) { B.patAt = sp; B.patReady = false; RX.hold = { k: 'pat', t: 0, dur: 10 }; }
          }
        }
        // ---- lá / cánh hoa đang rơi gần mặt: theo dõi (chọn lại mỗi 0,15 s); rơi trúng mũ (xét mỗi khung) thì nằm lại trên mũ ----
        function rxLeafScan(e, t, onFoot) {
          const cur = RX.leaf; if (cur && cur.st !== 'track') return;
          e.head.updateWorldMatrix(true, false); e.head.getWorldPosition(_rxA); const top = e.head.localToWorld(_rxC.set(0, 0.345, 0)), S = e.g.scale.y, pick = t >= RX.leafT;
          if (pick) RX.leafT = t + 0.15;
          const yaw = e.g.rotation.y, fx = Math.sin(yaw), fz = Math.cos(yaw);
          let best = null, bL = null, bd = 1e9;
          for (const L of [cherryCtl, forestLeafCtl, oldTreeLeafCtl]) if (L && L.o.group?.visible !== false) for (const q of L.parts) {
            if (q.st !== 1 || q.hold) continue;
            const dx = q.p.x - _rxA.x, dy = q.p.y - _rxA.y, dz = q.p.z - _rxA.z, dh = Math.hypot(dx, dz);
            if (dh < 0.6 && !(q.rxNo > t) && Math.hypot(q.p.x - top.x, q.p.z - top.z) < 0.2 * S && q.p.y - top.y > -0.1 && q.p.y - top.y < 0.06 && q.v.y < 0.2) {   // rơi trúng mũ
              const lp = e.head.worldToLocal(_rxD.copy(q.p)).sub(_rxE.set(0, 0.1, 0)); lp.y = Math.max(lp.y, 0.12); lp.setLength(0.25).add(_rxE);
              q.st = 6; q.hold = rxHoldHat; RX.leaf = { q, L, st: 'hat', t: 0, lp: lp.clone(), lq: new THREE.Quaternion().setFromAxisAngle(_rxUp, Math.random() * TAU) };
              rxSay('hat', RX_TXT.hat, 'Lá rơi', false); return;
            }
            if (!pick || dh > 3.2 || dy < -1.4 || dy > 2.8) continue;
            const fr = (dx * fx + dz * fz) / Math.max(dh, 1e-3); if (fr < -0.35 && dh > 0.6) continue;   // sau lưng: không thấy
            const sc = dh + Math.abs(dy) * 0.4 - fr * 0.5; if (sc < bd) { bd = sc; best = q; bL = L; }
          }
          if (pick) RX.leaf = best ? (cur && cur.q === best ? cur : { q: best, L: bL, st: 'track', t: 0 }) : null;
        }
        function rxSmoke(e, t) {   // khói lửa trại / lò bay vào mặt (đo trên sợi khói thật) ⇒ xua tay, ho, ngoảnh đi
          if (t < RX.smkT) return; RX.smkT = t + 0.3;
          e.head.updateWorldMatrix(true, false); const f = e.head.localToWorld(_rxA.set(0, -0.02, 0.22));
          let s = 0, src = null;
          for (const S of [campSmoke, chiminea.smoke]) { if (!S || !S.on || S.mesh.position.distanceTo(f) > 5) continue; const v = rxSmokeAt(S, f, 0.4); if (v > s) { s = v; src = S.mesh.position; } }
          RX.smkN = s > RX_SMOKE0 ? RX.smkN + 1 : 0; RX.smk = s;
          if (RX.smkN >= 2 && t >= (RX.nx.smoke || 0)) {
            RX.nx.smoke = t + 9; rxGest(rxHands(e)[0] && rxTeaLeft(e) > 3 ? 'wave' : 'cough', 2.6); rxLookAway(e, src, 3.5, 2.6); rxSay('smoke', RX_TXT.smoke, 'Khói lửa trại', false);
          }
        }
        function rxIdle(e, t, onFoot, seated) {   // việc vặt lúc rảnh: trú mưa · tay nghỉ khi uống trà · đứng ngoài trời lúc lạnh / nóng
          if (!e.teaIdle) RX.teaW = false;
          if (RX.gest || RX.hold) return;
          const P = e.phase, temp = liveWeather.state.temperature, hf = rxHands(e);
          if (P === 'shelter' && seated && hf[0] && hf[1]) {
            if (t < RX.idle) return; RX.idle = t + 9 + Math.random() * 10;
            const F = rxFire(e), r = Math.random(), cold = Number.isFinite(temp) && temp <= 21;
            if (F && (cold || Number.isFinite(temp) && temp <= 24) && r < 0.35) { rxGest('warm', 6, { F: F.clone() }); if (cold) rxSay('warm', RX_TXT.warm, 'Trú mưa dưới hiên', false); }
            else if (cold && r < 0.55) rxGest('rub', 3);
            else if (rxRaining() && r < 0.8) rxGest('palm', 2.4);
            else rxLook('rainOut', 1.6, 4.5, _rxB.set(e.g.position.x + Math.sin(e.g.rotation.y + (Math.random() - 0.5) * 1.6) * 6, e.g.position.y + 2.6, e.g.position.z + Math.cos(e.g.rotation.y + (Math.random() - 0.5) * 1.6) * 6));
          } else if (P === 'tea' && seated && e.teaIdle && hf[0]) {
            if (RX.teaW) return; RX.teaW = true;
            const left = TEA_T - (e.teaT % TEA_T), F = rxFire(e), cold = Number.isFinite(temp) && temp <= 22;
            if (F && cold && left > 7 && Math.random() < 0.4) rxGest('warm', 6, { F: F.clone() });
            else if (Number.isFinite(temp) && temp <= 18 && left > 4 && Math.random() < 0.3) rxGest('rub', 3);
          } else if (onFoot && hf[0] && t >= (RX.nx.idle || 0)) {
            if (Number.isFinite(temp) && temp >= 30 && sunElevSin > 0.35 && Math.random() < 0.5) { rxGest('wipe', 1.4); rxSay('hot', RX_TXT.hot, 'Trời nóng', false); }
            else if (Number.isFinite(temp) && temp <= 17 && !e.walking && RX.still > 2 && hf[1]) { rxGest('rub', 3); rxSay('cold', RX_TXT.cold, 'Trời lạnh', false); }
            RX.nx.idle = t + 50 + Math.random() * 60;
          }
        }
        // ---- sau lớp tư thế, TRƯỚC engSeatPost: lá (bắt, cầm, phủi), nhịp cử chỉ (đầu cúi, thân vặn), nhìn ----
        //      đích tay tính SAU engSeatPost (engReactArms) khi đầu đã quay / cúi xong khung này — tính trước thì tay "úp mũ" lệch khỏi mũ
        //      đúng bằng độ cúi/quay đầu vừa thêm (đứng xem trạm ngửa nhìn đỉnh cột: tay lơ lửng cách mũ ~0,17)
        function engReactPost(e, dt, t) {
          if (!rxOutside(e)) return;
          RX.pAdd = 0; RX.sp.x = RX.sp.y = 0;
          rxLeafTick(e, dt, t);
          rxGestStep(e, dt, t);
          rxGazeTick(e, dt, t);
          if (RX.sp.x || RX.sp.y) { const st = e.spineT; e.spineT = { x: (st ? st.x : 0) + RX.sp.x, y: (st ? st.y : 0) + RX.sp.y }; }
        }
        function rxLeafTick(e, dt, t) {
          const L = RX.leaf; if (!L) return; const q = L.q, S = e.g.scale.y; L.t += dt;
          if (L.st === 'track') {
            if (q.st !== 1) { RX.leaf = null; return; }
            if ((e.vel || 0) < 0.45 && !RX.gest && t >= (RX.nx.catch || 0) && !(q.rxNo > t) && rxHands(e)[0] && rxTeaLeft(e) > 4) {   // bay ngang tầm với phía trước ⇒ với bắt (lá vừa phủi / vừa buông thì thôi)
              e.arms[0].getWorldPosition(_rxA); const ax = engAxesW(e), d = _rxA.distanceTo(q.p);
              if (d < 0.65 * S && (q.p.x - _rxA.x) * ax.f.x + (q.p.z - _rxA.z) * ax.f.z > 0.05 && q.p.y > _rxA.y - 0.45 && rxGest('catch', 1.4)) { L.st = 'catch'; RX.nx.catch = t + 4; }
            }
          } else if (L.st === 'catch') {
            const G = RX.gest;
            if (q.st !== 1 || !G || G.k !== 'catch') { L.st = 'track'; return; }
            e.arms[0].getWorldPosition(_rxA);
            if (e.handW && e.handW[0].distanceTo(q.p) < 0.075) { q.st = 6; q.hold = rxHoldHand; L.st = 'held'; RX.gest = null; rxGest('look', 1.8); rxSay('catch', L.L === cherryCtl ? RX_TXT.petal : RX_TXT.leaf, 'Lá rơi', false); }
            else if (G.t > 1.2 || _rxA.distanceTo(q.p) > 0.72 * S) { L.st = 'track'; rxGestEnd(G); if (Math.random() < 0.3) rxSay('miss', RX_TXT.miss, 'Lá rơi', false); }
          } else if (L.st === 'held') {
            const G = RX.gest;
            if (!G || (G.k !== 'look' && G.k !== 'drop')) rxLeafLet(0, 0.1, 0);   // bị ngắt giữa chừng: buông lá
          } else if (L.st === 'hat') {
            if (L.t > 0.7 && !RX.gest && rxHands(e)[0] && rxTeaLeft(e) > 1.6) { rxGest('brush', 1.15); L.st = 'brush'; }
            else if (L.t > 9) rxLeafLet(RX.wv.x * 0.3, 0.3, RX.wv.z * 0.3);   // tay bận mãi: gió thổi bay đi
          } else if (L.st === 'brush') {
            const G = RX.gest; if (!G || G.k !== 'brush') rxLeafLet(0, 0.2, 0);
          }
        }
        function rxGestStep(e, dt, t) {   // nhịp cử chỉ: thời gian, trọng số, tay còn rảnh không, phần đầu / thân
          const G = RX.gest; if (!G) return;
          G.t += dt;
          if (G.t >= G.dur) { RX.gest = null; if (G.k === 'look' && RX.leaf && RX.leaf.st === 'held' && rxGest('drop', 0.9)) RX.gest.w = 1; return; }
          const w = G.w = rxSS(G.t, 0, 0.3) * (1 - rxSS(G.t, G.dur - 0.35, G.dur)), hf = rxHands(e, G.k === 'shield' || G.k === 'cover'), u = G.t;
          const need = G.k === 'clap' || G.k === 'rub' || G.k === 'warm' || G.k === 'shield' ? 2 : G.k === 'laugh' || G.k === 'cough' ? 0 : 1;
          if ((need >= 1 && !hf[0]) || (need === 2 && !hf[1])) { if (G.k === 'cover' || G.k === 'helmet') { rxGestEnd(G); G.w = 0; } else RX.gest = null; return; }
          if (G.k === 'brush') RX.pAdd += 0.25 * w;   // cúi đầu cho đỉnh mũ ngả tới
          else if (G.k === 'wave' || G.k === 'cough') RX.pAdd += 0.07 * Math.pow(Math.max(0, Math.sin(u * TAU * 1.3)), 6) * w;   // ho
          else if (G.k === 'clap' || G.k === 'laugh') { const b = Math.abs(Math.sin(u * 10)); RX.pAdd += (-0.05 + 0.05 * b) * w; RX.sp.x -= 0.03 * b * w; }   // cười rung vai
          else if (G.k === 'shield') RX.pAdd += 0.1 * w;
          else if (G.k === 'wipe') RX.pAdd -= 0.06 * w;
          else if (G.k === 'pat') RX.sp.x += 0.5 * w * (RX.hold && RX.hold.k2 !== undefined ? RX.hold.k2 / 0.85 : 1);
          else if (G.k === 'warm') {   // vặn eo về phía lửa theo hướng thân (không theo ngực đang vặn ⇒ không cộng dồn); lửa lệch bên mà không vặn thì tay kia với không tới
            const ch = engBodyW(e, 0, 1.52, 0.1, _rxA), a = Math.atan2(G.F.x - ch.x, G.F.z - ch.z) - e.g.rotation.y;
            RX.sp.y += Math.max(-0.4, Math.min(0.4, 0.6 * Math.atan2(Math.sin(a), Math.cos(a)))) * w;
          }
        }
        // ---- đích tay của cử chỉ (sau engSeatPost: đầu đã quay / cúi xong khung này, trước engArmPost) ----
        function engReactArms(e, dt, t) {
          const G = RX.gest; if (!G || !G.w || !rxOutside(e)) return;
          const w = G.w, u = G.t, ax = engAxesW(e);
          switch (G.k) {
            case 'helmet': case 'cover': {   // tay phải úp lên vỏ mũ (phải–trên–trước) · che mưa: thêm tay trái ôm bảng ghi chép áp ngực
              e.head.updateWorldMatrix(true, false); const p = e.head.localToWorld(_rxA.set(-0.2, 0.34, 0.12)), c = e.head.localToWorld(_rxB.set(0, 0.1, 0));
              rxHand(e, 0, p, rxQ(e, 0, c.sub(p).normalize(), _rxQ), w); rxPole(e, 0, -1, -0.1, 0.5);
              if (G.k === 'cover' && e.clip && e.clip.visible) { engBodyW(e, 0.03, 1.58, 0.19, _rxC); rxHandAt(e, 1, rxQ(e, 1, _rxB.copy(ax.f).negate(), _rxQ2), RX_CLIP, _rxC, w); }
              break;
            }
            case 'palm': {   // ngửa tay hứng mưa / thử xem còn mưa không: tay phải đưa ra trước, miệng chữ C ngửa lên
              const p = engBodyW(e, -0.36, 1.6 + 0.008 * Math.sin(t * 13), 0.5, _rxA); rxHand(e, 0, p, rxQ(e, 0, _rxUp, _rxQ), w); break;
            }
            case 'catch': {   // với tới chỗ lá sắp tới (đón trước 0,12 s), lòng tay ngửa
              const q = RX.leaf && RX.leaf.q; if (!q) { RX.gest = null; break; }
              rxHand(e, 0, _rxA.copy(q.v).multiplyScalar(0.12).add(q.p), rxQ(e, 0, _rxUp, _rxQ), w); break;
            }
            case 'look': {   // giơ chiếc lá lên trước mặt ngắm
              const p = engBodyW(e, -0.1, 1.9, 0.4, _rxA); rxHand(e, 0, p, rxQ(e, 0, _rxUp, _rxQ), Math.max(w, 0.999)); break;
            }
            case 'drop': {   // hạ tay ra trước, buông lá cho gió cuốn
              const k = rxSS(u, 0, 0.5), p = engBodyW(e, -0.1 - 0.1 * k, 1.9 - 0.18 * k, 0.4 + 0.12 * k, _rxA); rxHand(e, 0, p, rxQ(e, 0, _rxUp, _rxQ), u < 0.6 ? 1 : w);   // nối tiếp tay đang giơ, không hụt
              if (u > 0.25 && RX.leaf && RX.leaf.st === 'held') rxLeafLet(ax.f.x * 0.35 + RX.wv.x * 0.08, 0.3, ax.f.z * 0.35 + RX.wv.z * 0.08);
              break;
            }
            case 'brush': {   // phủi lá trên mũ: tay tới chạm lá rồi gạt ra phải–trước
              const L = RX.leaf; e.head.updateWorldMatrix(true, false);
              const P0 = _rxA.set(-0.24, 0.44, 0.18), P1 = _rxB.copy(L && L.lp ? L.lp : _rxB.set(0, 0.35, 0)).add(_rxC.set(0, 0.075, 0)), P2 = _rxC.set(-0.34, 0.36, 0.34);
              const hl = u < 0.45 ? P0.lerp(P1, rxSS(u, 0, 0.45)) : P1.lerp(P2, rxSS(u, 0.45, 0.8)), p = e.head.localToWorld(_rxD.copy(hl));
              rxHand(e, 0, p, rxQ(e, 0, _rxDn, _rxQ), w); rxPole(e, 0, -1, -0.1, 0.5);
              if (u > 0.45 && L && L.st === 'brush' && L.q.hold === rxHoldHat) L.q.hold = rxHoldHand;   // chạm lá: lá dính theo tay lúc gạt
              if (u > 0.75 && L && L.st === 'brush') { const v = e.head.localToWorld(_rxE.set(-0.34, 0.36, 0.34)).sub(e.head.localToWorld(_rxB.set(0, 0.36, 0))).normalize(); rxLeafLet(v.x * 1.1, 0.35, v.z * 1.1); }   // cuối cú gạt (đã ra ngoài mũ): buông
              break;
            }
            case 'wave': {   // xua khói: phẩy tay qua lại trước mặt
              const s = Math.sin(u * TAU * 2.6), p = engBodyW(e, -0.12 + 0.13 * s, 1.98, 0.38, _rxA);
              rxHand(e, 0, p, rxQ(e, 0, _rxB.copy(ax.f).addScaledVector(ax.r, -0.5 * s).normalize(), _rxQ), w); break;
            }
            case 'warm': {   // hơ 2 tay về phía lửa (ngực đã vặn ở rxGestStep), lòng tay hướng lửa, xoa nhẹ
              const F = G.F, ch = engBodyW(e, 0, 1.52, 0.1, _rxA), sf = Math.atan2(ax.f.x, ax.f.z), ra = Math.atan2(F.x - ch.x, F.z - ch.z) - sf;
              const a = Math.max(-0.45, Math.min(0.45, Math.atan2(Math.sin(ra), Math.cos(ra)))), sa = Math.sin(a), ca = Math.cos(a), rub = 0.015 * Math.sin(t * 7.5);   // góc lửa còn lại so với ngực (dương = bên trái)
              for (let i = 0; i < 2; i++) {
                const sd = (i ? 1 : -1) * 0.12 + (i ? rub : -rub), p = engBodyW(e, sa * 0.34 + ca * sd, 1.52, 0.1 + ca * 0.34 - sa * sd, i ? _rxC : _rxD);
                rxHand(e, i, p, rxQ(e, i, _rxB.set(Math.sin(sf + a), 0, Math.cos(sf + a)), i ? _rxQ2 : _rxQ), w);
              }
              break;
            }
            case 'rub': {   // xoa 2 tay trước ngực
              const s = 0.03 * Math.sin(u * TAU * 3);
              rxHand(e, 0, engBodyW(e, -0.045, 1.5 + s, 0.3, _rxA), rxQ(e, 0, _rxB.copy(ax.r).negate(), _rxQ), w);
              rxHand(e, 1, engBodyW(e, 0.045, 1.5 - s, 0.3, _rxC), rxQ(e, 1, _rxD.copy(ax.r), _rxQ2), w);
              break;
            }
            case 'clap': {   // vỗ tay 3 cái
              const sep = 0.03 + 0.15 * (0.5 + 0.5 * Math.cos(Math.max(0, u - 0.2) * TAU * 2.2));
              rxHand(e, 0, engBodyW(e, -sep / 2, 1.62, 0.36, _rxA), rxQ(e, 0, _rxB.copy(ax.r).negate(), _rxQ), w);
              rxHand(e, 1, engBodyW(e, sep / 2, 1.62, 0.36, _rxC), rxQ(e, 1, _rxD.copy(ax.r), _rxQ2), w);
              break;
            }
            case 'shield': {   // giơ 2 cẳng tay che trước mặt
              for (let i = 0; i < 2; i++) { const sd = i ? 1 : -1; rxHand(e, i, engBodyW(e, sd * 0.13, 2.0, 0.33, i ? _rxC : _rxA), rxQ(e, i, _rxB.copy(ax.f).addScaledVector(_rxUp, 0.2).addScaledVector(ax.r, -0.3 * sd).normalize(), i ? _rxQ2 : _rxQ), w); }
              break;
            }
            case 'wipe': {   // lau mồ hôi trán bằng mu bàn tay phải
              const p = engBodyW(e, -0.2 + 0.32 * rxSS(u, 0.25, 0.95), 2.15, 0.31, _rxA); rxHand(e, 0, p, rxQ(e, 0, ax.f, _rxQ), w); break;
            }
            case 'pat': {   // xoa đầu chó: lòng tay úp lên đỉnh đầu, vỗ nhẹ 3 cái
              const hd = dogObj.userData.head.getWorldPosition(_rxA); hd.y += 0.08 + 0.035 * Math.max(0, Math.sin(u * TAU * 1.7));
              rxHand(e, 0, hd, rxQ(e, 0, _rxDn, _rxQ), w); break;
            }
          }
        }
        function rxGazeTick(e, dt, t) {
          const free = rxGazeFree(e), P = RX.gp, G = RX.gest, L = RX.look; let bp = 0;
          const cand = (p, prio) => { if (prio > bp) { bp = prio; P.copy(p); } };
          if (L && t < L.until) cand(L.k === 'sky' ? rxSky(e, _rxA) : RX.lookP, L.prio);
          if (G && (G.k === 'look' || G.k === 'catch' || G.k === 'drop' || (G.k === 'palm' && G.t > 0.5 && G.t < 1.5))) cand(e.wrists[0].getWorldPosition(_rxA), 3.2);
          if ((G && G.k === 'pat') || (RX.hold && RX.hold.k === 'pat')) cand(dogObj.userData.head.getWorldPosition(_rxA), 4);
          if (RX.leaf && (RX.leaf.st === 'track' || RX.leaf.st === 'catch')) cand(RX.leaf.q.p, 3);
          if (dogObj && !dogRain.st) {
            const B = dogBrain.state, dp = dogObj.position, d = Math.hypot(dp.x - e.g.position.x, dp.z - e.g.position.z);
            if (B.st === 'zoom' && d < 18) { RX.zc += dt; if (RX.zc % 7.5 < 5) cand(dogObj.userData.head.getWorldPosition(_rxA), 2.6); } else RX.zc = 0;
            if (d < 2.6 && B.st !== 'lie') { RX.dc += dt; if (RX.dc % 8 < 1.6) cand(dogObj.userData.head.getWorldPosition(_rxA), 1.5); } else RX.dc = 0;
          }
          const wT = bp > 0 ? (free >= 0.8 || bp >= 3 ? free : bp >= 2 ? free * 0.6 : 0) * (e.walking && bp < 4 ? 0.75 : 1) : 0;
          RX.gw += (wT - RX.gw) * (1 - Math.exp(-dt * 5));
          let pT = RX.pAdd + (RX.flinch > 0 ? 0.22 * Math.sin(Math.PI * (1 - RX.flinch / 0.75)) : 0);
          if (RX.gw > 0.01) {   // quay đầu về điểm nhìn (hệ eo): đầu quay trước, xa quá thì vặn thêm eo
            e.head.updateWorldMatrix(true, false); e.head.getWorldPosition(_rxA); e.spine.getWorldQuaternion(_rxQ3).invert();
            const d = _rxB.subVectors(P, _rxA).applyQuaternion(_rxQ3);
            let yaw = Math.atan2(d.x, d.z); const pitch = Math.max(-0.7, Math.min(0.55, Math.atan2(-d.y, Math.hypot(d.x, d.z))));
            if (Math.abs(yaw) < 2.4 || bp >= 5) {
              const tw = !e.walking && Math.abs(yaw) > 0.9 ? Math.sign(yaw) * Math.min(0.35, (Math.abs(yaw) - 0.9) * 0.6) : 0, lim = e.walking ? 0.75 : 1.25;
              yaw = Math.max(-lim, Math.min(lim, yaw - tw));
              e.headYawT = (e.headYawT || 0) + (yaw - (e.headYawT || 0)) * RX.gw; RX.sp.y += tw * RX.gw;
              pT += (pitch - e.head.rotation.x) * RX.gw;
            }
          }
          RX.po += (pT - RX.po) * (1 - Math.exp(-dt * 7)); e.head.rotation.x += RX.po;
        }
