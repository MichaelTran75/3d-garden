        // ---- BẾP: nấu ăn · bát đĩa ----
        //  e.dish = { kind: 'udon' | 'cereal' | 'pan', at: 'hand' | 'table' | 'counter' | 'stove' | 'camp', food: 0–1 } — món đang ở đâu, còn bao nhiêu
        const VKIT = VAN.kitchen;   // bếp trong xe (van/face.js): số đo + chỗ chạm — người vặn núm, nhấc nồi, hất chảo, thái hành; lửa, hơi, khói ống bếp xe tự lo
        // ---- NẤU ĂN BẰNG IK TAY: bàn tay đặt vào ĐIỂM THẬT trên đồ bếp (engArmSolve qua e.reachT) — núm ga, mép bếp, quai nồi, cán chảo, thớt, móc treo;
        //      đầu cúi nhìn đúng chỗ tay làm; cúi người = gập EO (e.lean lớn được lớp tư thế chuyển sang eo, chân vẫn đứng thẳng) ----
        const _ckT = [new THREE.Vector3(), new THREE.Vector3()], _ckA = new THREE.Vector3(), _ckB = new THREE.Vector3(), _ckE = new THREE.Vector3(), _ckL = new THREE.Vector3();
        const ckW = VKIT.toWorld;
        // dụng cụ tay phải (khoanh ảnh: xẻng chĩa ngang ra khỏi tay, lưỡi không chạm chảo — trước chỉ đặt VỊ TRÍ bàn tay, hướng cổ tay để IK tự chọn):
        //  đầu dụng cụ (toạ độ khung cổ tay, model.js: xẻng / đũa gắn dọc +z) đặt đúng điểm trong chảo / nồi, cán chếch lên về phía vai phải như người cầm thật
        const CK_SPAT = new THREE.Vector3(0, -0.08, 0.31), CK_CHOP = new THREE.Vector3(0, -0.06, 0.35), CK_EDGE = new THREE.Vector3(0, -0.102, 0.23), CK_GAP = 0.085, CK_UP = new THREE.Vector3(0, 1, 0), _ckQ = new THREE.Quaternion(), _ckQ2 = new THREE.Quaternion(), _ckD = new THREE.Vector3(), _ckF = new THREE.Vector3(), _ckG = new THREE.Vector3();
        function ckTool(e, local, tip) {
          e.arms[0].getWorldPosition(_ckF); const d = _ckD.copy(tip).sub(_ckF.lerp(tip, 0.3)).normalize();   // hướng cán → đầu: từ vai xuống điểm khuấy
          engHandFor(e, 0, aimQ(_ckQ, d, engWristUp(e, 0, d)), local, tip);
        }
        function ckGrip(e, i, p, along) {   // nắm cán ngang (chảo): miệng chữ C úp xuống, lỗ chữ C theo cán ⇒ cán xuyên qua nắm tay
          engHandSet(e, i, p, aimQ(_ckQ2, _ckG.set(0, -1, 0), _ckF.set(-along.z, 0, along.x)));
        }   // toạ độ bếp (mặt tủ x≈2,40, vách 2,97, mặt đá y 1,865) → thế giới
        const ckS = (u, a, b) => { const k = Math.max(0, Math.min(1, (u - a) / (b - a))); return k * k * (3 - 2 * k); };
        function ckHand(e, i, p, w = 1, from = null) {   // tay i (0 phải, 1 trái) với tới p (thế giới); w < 1: đi dần từ chỗ buông cạnh hông (hoặc từ điểm `from`: tay đang ở đó lúc bắt đầu)
          const R = e.reachT || (e.reachT = [null, null]);
          if (w <= 0.02 && !from) { R[i] = null; return; }
          if (w < 1) p = (from ? _ckA.copy(from) : engBodyW(e, i ? 0.3 : -0.3, 1.2, 0.15, _ckA)).lerp(p, w);
          R[i] = _ckT[i].copy(p);
        }
        function ckLook(e, p, w = 1) {   // cúi / ngẩng đầu nhìn điểm p (trừ phần thân đã cúi)
          e.head.getWorldPosition(_ckE); const want = Math.atan2(_ckE.y + 0.15 - p.y, Math.max(0.12, Math.hypot(p.x - _ckE.x, p.z - _ckE.z))) - (e.lean || 0) * 1.1;
          e.head.rotation.x += (Math.max(-0.35, Math.min(0.75, want)) - e.head.rotation.x) * w;
        }
        // ---- UỐNG COKE ở bàn học: với tay trái lấy lon trên góc bàn → đưa lên miệng, ngửa cổ uống (yết hầu nhấp nhô) → đặt lại đúng chỗ.
        //      Lon trên bàn ẩn khi đang cầm; lon cầm tay tạo lần đầu dùng (cùng mẫu lon), mặt lon thẳng đứng khi tay với ra bàn, nghiêng rót khi đưa lên miệng ----
        function engCokeSip(e, k, t, rt, b) {   // k: giây trong lượt uống (0 → 7,4) · b: tư thế FK tương đương lúc bắt đầu (laptop-work.js: tay đang đặt IK trên máy), không có = tư thế gõ cũ
          const ease = (a, b, q) => a + (b - a) * minJerk(Math.max(0, Math.min(1, q)));
          const a0 = b ? b.th[1] : -1.1, z0 = b ? b.z[1] : 0;
          let ax, roll;
          if (k < 1.0) { ax = ease(a0, -0.95, k); roll = ease(z0, 0.35, k); }                          // với ra góc bàn
          else if (k < 1.3) { ax = -0.95; roll = 0.35; }                                               // nắm lon
          else if (k < 2.4) { ax = ease(-0.95, -2.25, (k - 1.3) / 1.1); roll = ease(0.35, -0.2, (k - 1.3) / 1.1); }
          else if (k < 5.2) { ax = -2.25 + Math.sin(t * 6) * 0.03; roll = -0.2; }                     // uống 2–3 ngụm
          else if (k < 6.3) { ax = ease(-2.25, -0.95, (k - 5.2) / 1.1); roll = ease(-0.2, 0.35, (k - 5.2) / 1.1); }
          else { ax = ease(-0.95, a0, (k - 6.3) / 1.1); roll = ease(0.35, z0, (k - 6.3) / 1.1); }     // tay về bàn phím
          e.arms[1].rotation.x = ax; rt[1] = roll; e.arms[0].rotation.x = b ? b.th[0] : -1.05;
          if (b) { rt[0] = b.z[0]; const F = e.elbowFlexT || (e.elbowFlexT = [0, 0]); F[0] = b.fx[0]; F[1] = b.fx[1] * (k < 1 ? 1 - minJerk(k) : k > 6.3 ? minJerk(Math.min(1, (k - 6.3) / 1.1)) : 0); }   // tay phải nằm yên trên máy
          const drink = k < 1.3 ? 0 : k < 2.4 ? (k - 1.3) / 1.1 : k < 5.2 ? 1 : k < 6.3 ? 1 - (k - 5.2) / 1.1 : 0;
          e.head.rotation.x = 0.15 - 0.5 * minJerk(drink) + (k > 2.4 && k < 5.2 ? Math.sin(t * 6) * 0.02 : 0);
          e.seatLean = 0.06 - 0.1 * minJerk(drink);
          e.hold.coke = k > 1.15 && k < 6.2;
        }
        function engHandCoke(e) {   // lon coke cầm tay trái: tâm lon ở lòng bàn tay chữ C
          const holder = new THREE.Group(); holder.name = 'Lon coke cầm tay'; holder.position.set(0, -0.69, 0.05); holder.rotation.x = 0.95; holder.visible = false;
          const k = 1.155 / ENGINEER_BASE_SCALE, can = sodaCan(); can.scale.setScalar(k); can.position.y = -0.058 * k; holder.add(can);
          e.arms[1].add(holder); e.props.coke = holder; return holder;
        }
        function engDishShow(e) {   // mỗi món chỉ hiện đúng một chỗ (bàn, mặt đá, bếp, bàn trà, trên tay): người báo món đang ở đâu — xe / trại tự hiện bát, chảo của mình
          const D = e.dish, H = e.hold || {}, at = D ? D.at : null, f = D ? D.food : 0;
          VAN.dish(D ? D.kind : null, at, f, !!H.sip);
          CAMP.servePan(at === 'camp', f);
        }
        function engSay(label, text) {   // nảy ý ngay khi có sự việc (múc xong udon…): dùng chung đám mây suy nghĩ
          const now = Date.now(), ctx = engContext(now);
          const tp = Number.isFinite(ctx.temp) ? ' · ' + ctx.wxIcon + ' ' + ctx.temp.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '°' : '';
          checkBubbleSprite.userData.thought = { header: ctx.slotIcon + ' ' + ctx.slotName + ' · ' + clockText(ctx.h) + ' · ' + label + tp, message: text, kind: 'event', slot: ctx.slot, tags: [...ctx.tags], revision: ++thoughtRevision };
          thoughtUntil = now + 14000; idleThoughtAt = Math.max(idleThoughtAt, now + 60000);
        }
        const stStove = { node: 'stove', tick(e, V, dt, t, keep) {   // bếp ga: trưa luộc udon (nồi họng sau–trái, thái hành trên thớt) · chiều chiên cơm trứng (chảo họng trước–trái)
          const K = VKIT, H = e.hold, rt = e.armRollT || (e.armRollT = [0, 0]), now = clock.elapsedTime, POT = 1, PAN = 0, TOP = K.TOP;
          if (!V.st) {
            V.recipe = engMealPick || (liveWeather.localHour < 14 ? 'udon' : 'rice'); engMealPick = null;   // món chọn ở bếp (bấm bếp trong xe) · không chọn: trưa udon, chiều cơm chiên
            V.T = V.recipe === 'udon' ? Math.max(420, Math.min(1320, e.actLeft - 100)) : Math.max(300, Math.min(840, e.actLeft - 100));
            V.st = V.recipe === 'udon' ? 'face' : 'toPeg'; V.chopped = false;
          }
          if (!keep && !['take', 'garnish'].includes(V.st)) {   // bỏ dở (nhảy giờ): tắt bếp, dọn, chảo về móc
            K.reset(); if (e.dish && e.dish.kind === 'pan') e.dish = null; if (e.dish && e.dish.at === 'counter') e.dish = null; return 'released';
          }
          if (!/^(to|back)|Face$|^face$/.test(V.st)) e.armsBusy = true;   // đi lại / quay người: tay để lớp dáng đi (bưng chảo nếu đang cầm)
          const knob = (k, on, i) => {   // tay phải với xuống núm ga ở mép trước mặt bếp, vặn ¼ vòng (gập eo, cúi nhìn núm)
            const r = ckS(k, 0, 0.55) * (1 - ckS(k, 1.05, 1.5));
            ckHand(e, 0, ckW(2.315, 1.805, K.knobZ(i), _ckB), r); e.lean = 0.3 * r; ckLook(e, K.knobAt(i, _ckL), r);
            const turn = ckS(k, 0.55, 0.85); K.knob(i, on ? turn : 1 - turn);   // vặn quá nửa vòng thì họng tự bén lửa, về dưới nửa thì tắt (xe)
          };
          const lookAt = x => ckLook(e, x === 'pan' ? K.panAt(_ckL) : K.potAt(_ckL), 1);
          const brace = (what) => {   // chờ: hai tay chống mép mặt đá / viền bếp, cúi nhìn nồi (chảo)
            ckHand(e, 1, ckW(2.43, TOP + 0.035, 0.2, _ckB)); ckHand(e, 0, ckW(2.43, TOP + 0.035, 0.93, _ckA.clone()));
            e.lean = 0.1 + 0.05 * Math.max(0, Math.sin(t * 0.3)); lookAt(what);
          };
          const reachPeg = (k, i, lx, ly, lz) => {   // với lên móc trên bảng đục lỗ (dao / chảo)
            const r = ckS(k, 0, 0.7) * (1 - ckS(k, 1.0, 1.5)), p = ckW(lx, ly, lz, _ckB);
            ckHand(e, i, p, r); ckLook(e, p, r); e.lean = -0.04 * r; return r;
          };
          switch (V.st) {
            // ===== udon =====
            case 'face': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'on'; V.k = 0; } break;
            case 'on': V.k += dt; knob(V.k, true, POT); if (V.k > 0.7) K.fillPot(); if (V.k > 1.6) { V.st = 'boil'; V.t0 = now; V.boilDur = V.T * 0.4; } break;
            case 'boil': {   // chờ nước sôi: tay chống mép bếp, nhìn nồi; giữa chừng sang thớt thái hành
              const p = (now - V.t0) / V.boilDur; K.steam(Math.min(1, p * 1.3)); brace('pot');
              if (!V.chopped && p > 0.3) V.st = 'toBoard';
              else if (p >= 1) { V.st = 'noodles'; V.k = 0; }
              break;
            }
            case 'toBoard': if (vanWalkTo(e, VN.board, dt, 0.45)) V.st = 'boardFace'; break;
            case 'boardFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'knifeTake'; V.k = 0; } break;
            case 'knifeTake': V.k += dt; reachPeg(V.k, 0, 2.87, 2.165, -0.19); if (V.k > 0.75) K.knifeOnPeg(false); H.knife = V.k > 0.75; K.bundle(K.CUT.z0); if (V.k > 1.4) { V.st = 'chop'; V.k = 0; } break;
            case 'chop': {   // thái hành lá (trước chỉ đặt chỗ cổ tay, IK tự xoay ⇒ dao chĩa chéo sang trái, lưỡi dài 20 cm chém lên mu tay trái 3 nhát/giây):
              //  dao cầm thẳng hướng vách (+x tủ bếp), lưỡi đứng, cạnh lưỡi xuống — ĐẶT CẠNH LƯỠI (CK_EDGE, khung cổ tay) lên đường cắt; đường cắt lùi dần sang trái,
              //  tay trái giữ bó hành bên trái đường cắt, luôn cách mặt lưỡi CK_GAP ⇒ lưỡi không bao giờ tới tay
              V.k += dt; H.knife = true; const C = K.CUT, prog = Math.min(1, V.k / 40), n = Math.floor(prog * K.scallionN), r = ckS(V.k, 0, 0.6), zc = C.z0 - C.len * prog;
              K.chopped(n); K.bundle(zc);
              const cut = Math.max(0, Math.sin(t * 19)), o = ckW(0, 0, 0, _ckE), fx = ckW(1, 0, 0, _ckF).sub(o).normalize();
              aimQ(_ckQ, fx, CK_UP);
              const tip = ckW(C.x, C.y + 0.004 + 0.045 * cut, zc, _ckB);   // cạnh lưỡi chạm thớt ở đáy nhát (bó hành dày ~1,8 cm: lưỡi đi qua hết)
              if (r < 1) tip.lerp(_ckG.copy(e.wrists[0].getWorldPosition(_ckL)), 1 - r);   // 0,6 s đầu: dao từ chỗ tay vừa lấy trên móc trượt dần về thớt
              engHandFor(e, 0, _ckQ, CK_EDGE, tip);
              ckHand(e, 1, ckW(C.x - 0.01, C.y + 0.03, zc - CK_GAP, _ckA.clone()), r);
              e.lean = 0.22 * r; ckLook(e, ckW(C.x, TOP, zc - 0.03, _ckL), r);
              if (V.k > 40) { V.st = 'knifeBack'; V.k = 0; }
              break;
            }
            case 'knifeBack': V.k += dt; reachPeg(V.k, 0, 2.87, 2.165, -0.19); H.knife = V.k < 0.75; K.bundle(null); if (V.k > 0.75) K.knifeOnPeg(true); if (V.k > 1.4) { V.chopped = true; V.st = 'backStove'; } break;
            case 'backStove': if (vanWalkTo(e, VN.stove, dt, 0.45)) V.st = 'backFace'; break;
            case 'backFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) V.st = 'boil'; break;
            case 'noodles': {   // hai tay đưa nắm udon tới trên miệng nồi, thả vào nước sôi
              V.k += dt; const r = ckS(V.k, 0, 0.8) * (1 - ckS(V.k, 1.6, 2.4)), c = K.potAt(_ckL);
              ckHand(e, 0, _ckB.copy(c).add(_ckA.set(0, 0.2, 0)).addScaledVector(ckW(0, 0, 1, _ckE).sub(ckW(0, 0, 0, _ckA)), 0.05), r);
              ckHand(e, 1, ckW(2.74, 2.09, 0.38, _ckA.clone()), r); e.lean = 0.2 * r; lookAt('pot');
              if (V.k > 1.0) K.noodles(true);
              if (V.k > 2.5) { V.st = 'stir'; V.t0 = now; V.stirDur = V.T * 0.5; }
              break;
            }
            case 'stir': {   // đũa dài đảo sợi vòng tròn trong nồi cho khỏi dính; ~30 s nghỉ tay một lần
              K.steam(1); const rest = ((now - V.t0) % 30) > 22;
              if (rest) brace('pot');
              else {
                H.chop = true; const a = t * 3.2, c = K.potAt(_ckL), wy = K.waterAt(_ckE).y;
                ckTool(e, CK_CHOP, _ckB.set(c.x + 0.03 * Math.cos(a), wy - 0.01, c.z + 0.03 * Math.sin(a))); ckHand(e, 1, ckW(2.43, TOP + 0.035, 0.2, _ckA.clone()));   // đầu đũa vẽ vòng trong nước
                e.lean = 0.18; lookAt('pot');
              }
              if (now - V.t0 >= V.stirDur) { V.st = 'off'; V.k = 0; }
              break;
            }
            case 'off': V.k += dt; knob(V.k, false, V.recipe === 'udon' ? POT : PAN); if (V.k > 1.6) { V.st = V.recipe === 'udon' ? 'bowl' : 'take'; V.k = 0; } break;
            case 'bowl': {   // cúi (gập eo) lấy bát trong tủ dưới, đặt lên mặt đá cạnh bếp
              V.k += dt; const d = ckS(V.k, 0, 0.8) * (1 - ckS(V.k, 1.2, 1.8)), up = ckS(V.k, 1.0, 1.7);
              ckHand(e, 1, ckW(2.36, 1.28 + (TOP + 0.05 - 1.28) * up, 0.17, _ckB), Math.max(d, up * (1 - ckS(V.k, 1.7, 1.95)))); e.lean = 0.5 * d; ckLook(e, _ckB, 0.8);
              if (V.k > 0.9 && !e.dish) e.dish = { kind: 'udon', at: 'counter', food: 0 };
              if (V.k > 1.9) { V.st = 'pour'; V.k = 0; }
              break;
            }
            case 'pour': {   // hai tay nắm 2 quai nồi, nhấc lên, nghiêng đổ sợi + nước dùng vào bát
              V.k += dt; const k = V.k, up = ckS(k, 0, 0.8) * (1 - ckS(k, 2.3, 3.1)), tilt = ckS(k, 0.8, 1.4) * (1 - ckS(k, 1.9, 2.4)), grip = ckS(k, 0, 0.35) * (1 - ckS(k, 3.0, 3.3));
              K.potLift(up, tilt);   // nồi nhấc lên + nghiêng rót: xe đặt nồi, tay theo 2 quai
              ckHand(e, 0, K.potHandle(0, _ckB), grip); ckHand(e, 1, K.potHandle(1, _ckA).clone(), grip);
              e.lean = 0.12 + 0.1 * up; ckLook(e, ckW(2.6, TOP, 0.17, _ckL));
              if (k > 1.5 && K.noodlesIn) { K.pourOut(); if (e.dish) e.dish.food = 1; }
              K.steam(Math.max(0, 1 - ckS(k, 1.5, 3.1)));
              if (k > 3.2) { K.potHome(); V.st = 'garnish'; V.k = 0; }
              break;
            }
            case 'garnish': {   // tay trái vốc hành lá trên thớt, đưa qua rắc lên bát
              V.k += dt; const r = ckS(V.k, 0, 0.5) * (1 - ckS(V.k, 1.4, 1.9)), over = ckS(V.k, 0.6, 1.0);
              ckHand(e, 1, ckW(2.58, TOP + 0.03 + 0.12 * over + 0.015 * Math.sin(t * 14) * over, -0.02 + 0.19 * over, _ckB), r); e.lean = 0.15 * r; ckLook(e, _ckB, r);
              if (V.k > 1.0) K.chopped(0);
              if (V.k > 1.9) { V.st = 'take'; V.k = 0; }
              break;
            }
            case 'take': {   // hai tay nâng bát (udon) / cán chảo (cơm chiên) lên
              V.k += dt; const r = ckS(V.k, 0, 0.5);
              if (V.recipe === 'udon') { ckHand(e, 0, ckW(2.56, TOP + 0.05, 0.25, _ckB), r * (1 - ckS(V.k, 0.5, 0.6))); ckHand(e, 1, ckW(2.56, TOP + 0.05, 0.09, _ckA.clone()), r * (1 - ckS(V.k, 0.5, 0.6))); }
              else ckHand(e, 1, K.panHandle(_ckB), r * (1 - ckS(V.k, 0.5, 0.6)));
              e.lean = 0.12 * r;
              if (V.k > 0.5 && e.dish && e.dish.at !== 'hand') {
                e.dish.at = 'hand';
                if (V.recipe === 'udon') engSay('Nấu udon', 'Tới giờ ăn udon rồi!'); else engSay('Nấu bữa tối', 'Cơm chiên xong, mang ra hiên ăn thôi.');
              }
              if (V.k > 1.1) { K.reset(); return 'released'; }
              break;
            }
            // ===== cơm chiên trứng =====
            case 'toPeg': if (vanWalkTo(e, VN.board, dt, 0.45)) V.st = 'pegFace'; break;
            case 'pegFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'takePan'; V.k = 0; } break;
            case 'takePan': V.k += dt; reachPeg(V.k, 1, 2.86, 2.17, 0.12); if (V.k > 0.8 && !e.dish) e.dish = { kind: 'pan', at: 'hand', food: 0 }; if (V.k > 1.5) V.st = 'toStove'; break;
            case 'toStove': if (vanWalkTo(e, VN.stove, dt, 0.45)) V.st = 'stoveFace'; break;
            case 'stoveFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'place'; V.k = 0; } break;
            case 'place': {   // tay trái đặt chảo lên họng trước–trái (cán quay ra lối đi)
              V.k += dt; const r = ckS(V.k, 0, 0.6) * (1 - ckS(V.k, 0.9, 1.4)); ckHand(e, 1, ckW(2.375, 1.94, 0.43, _ckB), r); e.lean = 0.2 * r; ckLook(e, _ckB, r);
              if (V.k > 0.7 && e.dish) e.dish.at = 'stove';
              if (V.k > 1.5) { V.st = 'panOn'; V.k = 0; }
              break;
            }
            case 'panOn': V.k += dt; knob(V.k, true, PAN); if (V.k > 1.6) { V.st = 'heat'; V.k = 0; } break;
            case 'heat': V.k += dt; brace('pan'); if (V.k > 12) { V.st = 'add'; V.k = 0; } break;
            case 'add': {   // hai tay đổ cơm, trứng, hành vào chảo nóng
              V.k += dt; const r = ckS(V.k, 0, 0.7) * (1 - ckS(V.k, 1.5, 2.2)), c = K.panAt(_ckL);
              ckHand(e, 0, _ckB.copy(c).add(_ckE.set(0, 0.17, 0)).addScaledVector(ckW(1, 0, 0, _ckA).sub(ckW(0, 0, 0, _ckE)), -0.08), r);
              ckHand(e, 1, ckW(2.42, 2.02, 0.36, _ckA.clone()), r); e.lean = 0.2 * r; lookAt('pan');
              if (V.k > 1.1 && e.dish) e.dish.food = 1;
              if (V.k > 2.3) { V.st = 'fry'; V.t0 = now; V.fryDur = Math.max(120, V.T - 60); }
              break;
            }
            case 'fry': {   // tay phải xẻng đảo đều trong lòng chảo; tay trái nắm cán, ~7 s hất chảo một lần (cơm bay lên rơi xuống)
              H.spatula = true; const ph = ((now - V.t0) % 7) / 0.9;
              K.panToss(ph);   // ~7 s hất chảo một lần: xe cho chảo nảy lên, nghiêng, cơm bay lên rơi xuống theo nhịp hất
              const a = t * 5, c = K.panAt(_ckL), sx = K.panAxis(_ckA).clone();   // sx: hướng cán chảo
              ckTool(e, CK_SPAT, _ckB.set(c.x + 0.05 * Math.sin(a), c.y + 0.03 + 0.008 * Math.cos(2 * a), c.z + 0.05 * Math.cos(a)));   // lưỡi xẻng đảo vòng trong lòng chảo
              ckGrip(e, 1, K.panHandle(_ckA), sx);
              e.lean = 0.2; ckLook(e, c);
              if (now - V.t0 >= V.fryDur) { K.panHome(); V.st = 'off'; V.k = 0; }
              break;
            }
          }
          return 'busy';
        } };
        // ---- RỬA BÁT / CHẢO bằng IK: bản cũ lắc cả cánh tay quanh vai (sin 9 rad/s, ±0,12 rad) ở tư thế FK — đo:
        //      bát nổi 32 cm trên đáy dòng nước, tay phải cách bát 42 cm, rung 4,3 cm, gia tốc tay tới 44 m/s². Giờ: bước sát chậu đúng chỗ dòng nước (V.spot),
        //      cúi eo; tay trái giữ mép bát / cán chảo ngay dưới vòi, tay phải kỳ tròn trong lòng bát (~3 cm, ~1 vòng/s); dòng nước dừng ở lòng bát;
        //      cuối lượt nghiêng bát đổ nước, tắt vòi. Bát / chảo đặt theo bàn tay trái THẬT sau IK (engDishPose — loop-update.js, sau engArmPost) ----
        const DW_F = 0.47, DW_R = 0.02, DW_U = 0.7917;   // dòng nước cách chân DW_F về trước, DW_R sang phải (đv thế giới ở cỡ người mặc định e.g.scale.y = DW_U)
        const _dw = { S: new THREE.Vector3(), T: new THREE.Vector3(), C: new THREE.Vector3(), U: new THREE.Vector3(), G: new THREE.Vector3(), H: new THREE.Vector3(), A: new THREE.Vector3(), B: new THREE.Vector3(),
          q: new THREE.Quaternion(), q2: new THREE.Quaternion(), m: new THREE.Matrix4(), Y: new THREE.Vector3(0, 1, 0), X: new THREE.Vector3(1, 0, 0) };
        function dishSpot(e, S, out) {   // chỗ đứng: dòng nước nằm DW_F trước chân, DW_R lệch phải khi quay mặt VY.pz vào tủ
          const u = e.g.scale.y / DW_U, y = VY.pz;
          return out.set(S.x - Math.sin(y) * DW_F * u + Math.cos(y) * DW_R * u, e.g.position.y, S.z - Math.cos(y) * DW_F * u - Math.sin(y) * DW_R * u);
        }
        const stDishes = { node: 'ksink', tick(e, V, dt, t, keep) {   // chậu bếp: rửa bát / chảo dưới vòi rồi cất (bát vào tủ dưới chậu, chảo treo lại lên bảng)
          const D = e.dish;
          if (!D && V.st !== 'hang' && V.st !== 'stow') return 'released';
          if (!V.st) { V.st = 'face'; V.spot = dishSpot(e, VKIT.tapAt(1, _dw.S), V.spot || new THREE.Vector3()); V.stepped = false; }
          if (V.st === 'face') { if (!V.stepped) V.stepped = vanWalkTo(e, V.spot, dt, 0.35); else if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'wash'; V.k = 0; V.h0 = null; } }
          else if (V.st === 'wash') {
            V.k += dt; e.armsBusy = true; const k = V.k, pan = D.kind === 'pan', dur = pan ? 30 : 22, u = e.g.scale.y / DW_U;
            if (!V.h0) V.h0 = e.handW ? [e.handW[0].clone(), e.handW[1].clone()] : [engBodyW(e, -0.3, 1.2, 0.15, new THREE.Vector3()), engBodyW(e, 0.3, 1.2, 0.15, new THREE.Vector3())];   // tay đang bưng ở đâu: vào / ra từ đó (không vòng qua cạnh hông)
            { const rt = e.armRollT || (e.armRollT = [0, 0]); if (pan) e.arms[1].rotation.x = -0.8; else { e.arms[0].rotation.x = e.arms[1].rotation.x = -0.85; rt[0] = 0.28; rt[1] = -0.28; } }   // dáng bưng (loop-update.js) làm nền FK: IK hoà vào / ra không giật
            const w = ckS(k, 0, 1.1) * (1 - ckS(k, dur - 1.0, dur));            // với tay vào chậu → rút về
            const on = k > 1.0 && k < dur - 1.6;                                 // vòi mở
            const scrub = ckS(k, 1.3, 2.2) * (1 - ckS(k, dur - 3.6, dur - 3.0));   // kỳ tròn
            const pour = ckS(k, dur - 3.0, dur - 2.2) * (1 - ckS(k, dur - 1.4, dur - 0.6));   // nghiêng đổ nước
            const ax = engAxesW(e), R = ax.r, F = ax.f, Y = _dw.Y;
            const S = VKIT.tapAt(1, _dw.S), T = VKIT.tapAt(0, _dw.T);
            // tâm đáy bát / chảo: ngay dưới dòng nước, lùi về phía người một chút (dòng nước rơi vào nửa xa lòng bát), cao hơn đáy dòng ~4 cm
            const C = _dw.C.copy(S).addScaledVector(F, (pan ? -0.02 : -0.045) * u); C.y += 0.05 * u + 0.006 * u * Math.sin(k * 0.9);
            // trục lòng bát: ngả về phía người (thấy lòng bát), đổ nước thì ngả ra xa
            const tilt = (pan ? 0.22 : 0.42) * (1 - pour) - 1.0 * pour + 0.04 * Math.sin(k * 0.7);
            const U = _dw.U.copy(Y).multiplyScalar(Math.cos(tilt)).addScaledVector(F, -Math.sin(tilt)).normalize();
            let q, grip;
            if (pan) {   // cán chảo chĩa về tay trái (ra sau, sang trái), mặt chảo vuông góc U
              const hx = _dw.A.copy(R).multiplyScalar(-0.75).addScaledVector(F, -0.66); hx.addScaledVector(U, -hx.dot(U)).normalize();
              q = _dw.q.setFromRotationMatrix(_dw.m.makeBasis(hx, U, _dw.B.crossVectors(hx, U)));
              grip = _dw.G.set(0.175, 0.045, 0).multiplyScalar(e.props.handPan.userData.wS || 0.9).applyQuaternion(q).add(C);
              ckGrip(e, 1, w < 1 ? _dw.B.copy(V.h0[1]).lerp(grip, w) : grip, hx);   // vào / ra: đi dần từ chỗ tay đang bưng
            } else {   // tay trái giữ mép trái bát
              q = _dw.q.setFromUnitVectors(Y, U);
              grip = _dw.G.copy(C).addScaledVector(U, 0.055 * u).addScaledVector(R, -0.11 * u);
              ckHand(e, 1, grip, w, V.h0[1]);
            }
            // tay phải: vòng tròn trong lòng bát (mặt phẳng vuông góc U), đổ nước thì đặt lên mép phải
            const ph = k * 2 * Math.PI * 0.95, rr = (pan ? 0.04 : 0.028) * u * scrub, e2 = _dw.B.crossVectors(U, R).normalize();
            const H = _dw.H.copy(C).addScaledVector(U, (pan ? 0.035 : 0.05) * u).addScaledVector(R, rr * Math.cos(ph)).addScaledVector(e2, rr * Math.sin(ph));
            H.addScaledVector(R, (pan ? 0.06 : 0.1) * u * pour).addScaledVector(U, 0.03 * u * pour);
            ckHand(e, 0, H, w, V.h0[0]);
            VKIT.tap(on, t, w > 0.6 ? Math.min(1, Math.max(0.1, (T.y - C.y - (pan ? 0.02 : 0.04) * u) / Math.max(1e-3, T.y - S.y))) : 1);   // dòng nước dừng ở lòng bát
            e.dishPose = { obj: pan ? e.props.handPan : e.props.handBowl, pos: C, q, grip, w };   // engDishPose đặt bát / chảo theo tay trái sau IK
            e.lean = 0.3 * w; ckLook(e, C, w);
            D.food = 0;   // phần thừa đổ đi, rửa sạch
            if (k > dur) { VKIT.tap(false); V.st = pan ? 'toPeg' : 'stow'; V.k = 0; V.h0 = null; }
          }
          else if (V.st === 'stow') {   // cúi cất bát vào tủ dưới chậu
            V.k += dt; e.armsBusy = true; const d = ckS(V.k, 0, 0.9) * (1 - ckS(V.k, 1.3, 2.2)), rt = e.armRollT || (e.armRollT = [0, 0]);
            const ax = V.k < 1.1 ? -0.85 + 0.35 * ckS(V.k, 0, 0.9) : -0.5 * (1 - ckS(V.k, 1.3, 2.2)), rl = 0.28 * (1 - ckS(V.k, 0.6, 1.8));   // từ dáng bưng cúi xuống tủ, buông bát, đứng thẳng
            e.lean = 0.35 * d; e.arms[0].rotation.x = e.arms[1].rotation.x = ax; rt[0] = rl; rt[1] = -rl; e.head.rotation.x = 0.4 * d;
            if (V.k > 1.0) e.dish = null;
            if (V.k > 2.3) return 'released';
          }
          else if (V.st === 'toPeg') { if (vanWalkTo(e, VN.board, dt, 0.45)) V.st = 'pegFace'; }
          else if (V.st === 'pegFace') { if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'hang'; V.k = 0; } }
          else if (V.st === 'hang') {   // với tay treo chảo lên móc
            V.k += dt; e.armsBusy = true; const r = segK(V.k, 0, 0.8) * (1 - segK(V.k, 1.3, 2.0));
            e.arms[1].rotation.x = -1.7 * r; e.lean = 0.12 * r; e.head.rotation.x = -0.1 * r;
            if (V.k > 0.9) e.dish = null;
            if (V.k > 2.1) { V.endNode = 'board'; return 'released'; }
          }
          return 'busy';
        } };
        const _dp = { a: new THREE.Vector3(), b: new THREE.Vector3(), q: new THREE.Quaternion(), q2: new THREE.Quaternion() };
        function engDishPose(e) {   // sau IK tay: bát / chảo đang rửa nằm theo bàn tay trái thật (lệch tay ↔ đích dời cả bát), hoà dần từ chỗ bưng mặc định
          const P = e.props; if (!P) return; const DP = e.dishPose; e.dishPose = null;
          for (const o of [P.handBowl, P.handPan]) {
            const H = o.userData.home || (o.userData.home = { p: o.position.clone(), q: o.quaternion.clone() });
            o.position.copy(H.p); o.quaternion.copy(H.q);
            if (!DP || DP.obj !== o || DP.w <= 1e-3) continue;
            const A = o.parent; A.updateWorldMatrix(true, false); o.updateWorldMatrix(false, false);
            if (!o.userData.wS) o.userData.wS = o.getWorldScale(_dp.b).x;
            const p0 = o.getWorldPosition(_dp.a), q0 = o.getWorldQuaternion(_dp.q);
            const hand = engWristParts(e.wrists[1]).hand || e.wrists[1]; hand.getWorldPosition(_dp.b);
            _dp.b.sub(DP.grip); if (_dp.b.length() > 0.12) _dp.b.setLength(0.12);   // tay trái chưa tới / lệch đích: bát đi theo tay (giới hạn 12 cm)
            p0.lerp(_dp.b.add(DP.pos), DP.w); q0.slerp(DP.q, DP.w);
            o.position.copy(A.worldToLocal(p0)); o.quaternion.copy(A.getWorldQuaternion(_dp.q2).invert().multiply(q0));
          }
        }
        const VAN_STATIONS = { desk: stDesk, table: stTable, bed: stBed, wc: stWc, sink: stSink, shelfOff: stShelf(false), shelfOn: stShelf(true), shower: stShower, towel: stTowel, cleanWc: stCleanWc, cleanBath: stCleanBath, stove: stStove, dishes: stDishes };
        const engVanNew = node => ({ node, path: null, pi: 0, goal: null, segDoor: null, station: null, st: null, k: 0, plan: [], idx: 0, act: null, opened: new Set(), ph: Math.random() * 100 });
        function engVan(e, dt, t, act) {   // trong xe: làm lần lượt các trạm của việc; việc ngoài trời thì ra cửa hông bước xuống bậc
          const V = e.van, A = ENG_ACTS[act], g = e.g;
          if (V.st === 'stepOut') {   // bước xuống bậc cửa hông, cúi đầu qua khung cửa
            if (!(e.ledge && e.ledge.stairs)) engVanStairs(e, true);   // từng bậc: sàn → bậc trên → bậc dưới → đất, tay nắm tay vịn (engineer/body/ledge.js)
            if (engStairsStep(e, dt)) { e.inVan = false; e.van = engVanNew('door'); e.vel = 0; }
            return;
          }
          if (V.act !== act) {
            V.act = act; V.plan = A.van ? (A.plan || []) : ['exit']; V.idx = 0;
            if (act !== 'shower') {   // tắm dở (nhảy giờ): treo khăn, đội mũ rồi mới làm việc khác
              const fix = []; if (e.towel.visible) fix.push('towel'); if (!e.helmet.visible && VBATH.helmetOn && act !== 'bedtime') fix.push('shelfOn');
              if (fix.length) V.plan = [...fix, ...V.plan];
            }
          }
          vanDoorsAuto(e, V);
          if (V.station) {
            const keep = V.plan[V.idx] === V.station;
            if (VAN_STATIONS[V.station].tick(e, V, dt, t, keep) !== 'released') return;
            V.node = V.endNode || VAN_STATIONS[V.station].node; V.endNode = null; V.station = null; V.st = null; V.k = 0;
            if (keep) V.idx++;
          }
          if (e.dish && e.dish.at === 'hand' && V.plan[V.idx] !== 'dishes' && (e.dish.food < 0.05 || !(act === 'cook' || act === 'lunch' || act === 'dinner')))
            V.plan = [...V.plan.slice(0, V.idx), 'dishes', ...V.plan.slice(V.idx)];   // bát / chảo đã ăn xong (hoặc bỏ dở): rửa trước rồi mới làm việc khác
          if (V.idx >= V.plan.length) {   // xong kế hoạch: việc có điểm dừng thì đánh dấu đã xong (lịch chuyển sang việc kế), không thì đứng chờ
            if (A.once && e.onceKey && e.onceKey.startsWith(act + '@')) engMarkDone(e);
            autoDone(act);   // việc tự chủ / theo lệnh (ăn nhẹ, vệ sinh, tắm) xong ⇒ về lịch
            if (engForceAct === act) engForceAct = act === 'cook' ? (V.recipe === 'udon' ? 'lunch' : 'dinner') : null;   // lệnh Nấu ăn (bảng Tools): nấu xong ⇒ ăn (udon ở bàn vuông · cơm chiên ra ghế dưới bạt), ăn + rửa xong ⇒ về lịch
            g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); e.vel = 0; return;
          }
          const want = V.plan[V.idx];
          if (want === 'exit') { if (vanGoTo(e, V, 'door', dt)) { V.st = 'stepOut'; V.k = 0; } return; }
          if (vanGoTo(e, V, VAN_STATIONS[want].node, dt)) { V.station = want; V.st = null; V.k = 0; }
        }
        function engEnterVan(e, dt, t) {   // vào xe: tới cửa hông theo trường dòng chảy → bước lên bậc (cúi đầu qua khung cửa)
          if (!e.enter) e.enter = 'toDoor';
          if (e.enter === 'toDoor') { if (engStep(e, VAN.doorFar, dt, t, pf, FIRE_AVOID_R, VAN.doorField)) e.enter = 'toStep'; }
          else if (e.enter === 'toStep') { if (engStep(e, VAN.doorStep, dt, t, null, 0, null)) { e.enter = 'stepIn'; e.timer = 0; } }
          else {   // bước từng bậc: đất → bậc dưới → bậc trên → sàn, tay nắm tay vịn trụ B (engineer/body/ledge.js engVanStairs)
            if (!(e.ledge && e.ledge.stairs)) engVanStairs(e, false);
            if (engStairsStep(e, dt)) { e.enter = null; e.inVan = true; e.van = engVanNew('door'); }
          }
        }
        function engWake(e) {   // 06:00: từ tư thế nằm sang ngồi mép giường, đội mũ, vươn vai vài giây rồi đứng dậy
          scene.add(e.g); e.g.scale.setScalar(ENGINEER_BASE_SCALE * CAMP_SCALE); e.g.rotation.set(0, VY.pz, 0);
          e.legs[0].rotation.set(0, 0, 0); e.legs[1].rotation.set(0, 0, 0);
          e.inVan = true; e.van = engVanNew('bed'); e.van.station = 'bed'; e.van.st = 'seated'; e.van.k = -6;
          e.seat = engNewSeat(BED_SEAT, 'seated'); e.phase = 'van'; e.enter = null; engHelmet(e, 'head');
        }

