        // ---- BẾP: nấu ăn · bát đĩa ----
        //  e.dish = { kind: 'udon' | 'cereal' | 'pan', at: 'hand' | 'table' | 'counter' | 'stove' | 'camp', food: 0–1 } — món đang ở đâu, còn bao nhiêu
        const VKIT = caravanObj.userData.interior.kitchen, VCEREAL = caravanObj.userData.interior.cerealBowl, VTUDON = caravanObj.userData.interior.tableUdon;
        VKIT.stovePan.userData.home = VKIT.stovePan.position.clone(); VKIT.pot.userData.home = VKIT.pot.position.clone();
        // ---- NẤU ĂN BẰNG IK TAY: bàn tay đặt vào ĐIỂM THẬT trên đồ bếp (engArmSolve qua e.reachT) — núm ga, mép bếp, quai nồi, cán chảo, thớt, móc treo;
        //      đầu cúi nhìn đúng chỗ tay làm; cúi người = gập EO (e.lean lớn được lớp tư thế chuyển sang eo, chân vẫn đứng thẳng) ----
        const _ckP = VKIT.pot.parent, _ckT = [new THREE.Vector3(), new THREE.Vector3()], _ckA = new THREE.Vector3(), _ckB = new THREE.Vector3(), _ckE = new THREE.Vector3(), _ckL = new THREE.Vector3();
        const ckW = (x, y, z, out) => _ckP.localToWorld(out.set(x, y, z));
        // dụng cụ tay phải (G 18/10 khoanh ảnh: xẻng chĩa ngang ra khỏi tay, lưỡi không chạm chảo — trước chỉ đặt VỊ TRÍ bàn tay, hướng cổ tay để IK tự chọn):
        //  đầu dụng cụ (toạ độ khung cổ tay, model.js: xẻng / đũa gắn dọc +z) đặt đúng điểm trong chảo / nồi, cán chếch lên về phía vai phải như người cầm thật
        const CK_SPAT = new THREE.Vector3(0, -0.08, 0.31), CK_CHOP = new THREE.Vector3(0, -0.06, 0.35), _ckQ = new THREE.Quaternion(), _ckQ2 = new THREE.Quaternion(), _ckD = new THREE.Vector3(), _ckF = new THREE.Vector3(), _ckG = new THREE.Vector3();
        function ckTool(e, local, tip) {
          e.arms[0].getWorldPosition(_ckF); const d = _ckD.copy(tip).sub(_ckF.lerp(tip, 0.3)).normalize();   // hướng cán → đầu: từ vai xuống điểm khuấy
          engHandFor(e, 0, aimQ(_ckQ, d, engWristUp(e, 0, d)), local, tip);
        }
        function ckGrip(e, i, p, along) {   // nắm cán ngang (chảo): miệng chữ C úp xuống, lỗ chữ C theo cán ⇒ cán xuyên qua nắm tay
          engHandSet(e, i, p, aimQ(_ckQ2, _ckG.set(0, -1, 0), _ckF.set(-along.z, 0, along.x)));
        }   // toạ độ bếp (mặt tủ x≈2,40, vách 2,97, mặt đá y 1,865) → thế giới
        const ckS = (u, a, b) => { const k = Math.max(0, Math.min(1, (u - a) / (b - a))); return k * k * (3 - 2 * k); };
        function ckHand(e, i, p, w = 1) {   // tay i (0 phải, 1 trái) với tới p (thế giới); w < 1: đi dần từ chỗ buông cạnh hông
          const R = e.reachT || (e.reachT = [null, null]);
          if (w <= 0.02) { R[i] = null; return; }
          if (w < 1) p = engBodyW(e, i ? 0.3 : -0.3, 1.2, 0.15, _ckA).lerp(p, w);
          R[i] = _ckT[i].copy(p);
        }
        function ckLook(e, p, w = 1) {   // cúi / ngẩng đầu nhìn điểm p (trừ phần thân đã cúi)
          e.head.getWorldPosition(_ckE); const want = Math.atan2(_ckE.y + 0.15 - p.y, Math.max(0.12, Math.hypot(p.x - _ckE.x, p.z - _ckE.z))) - (e.lean || 0) * 1.1;
          e.head.rotation.x += (Math.max(-0.35, Math.min(0.75, want)) - e.head.rotation.x) * w;
        }
        function setFood(food, k, drop) {   // phần thức ăn vơi dần: thu nhỏ + hạ mặt nước dùng / sữa
          if (food.userData.y0 === undefined) food.userData.y0 = food.position.y;
          food.visible = k > 0.04; if (!food.visible) return;
          const s = 0.55 + 0.45 * k; food.scale.set(s, 0.5 + 0.5 * k, s); food.position.y = food.userData.y0 - (1 - k) * drop;
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
        function engDishShow(e) {   // mỗi món chỉ hiện đúng một chỗ (bàn, mặt đá, bếp, bàn trà, trên tay)
          const D = e.dish, H = e.hold || {}, at = D ? D.at : null, f = D ? D.food : 0, K = VKIT;
          VCEREAL.visible = at === 'table' && D.kind === 'cereal'; if (VCEREAL.visible) setFood(VCEREAL.userData.food, f, 0.012);
          VTUDON.visible = at === 'table' && D.kind === 'udon' && !H.sip; if (VTUDON.visible) setFood(VTUDON.userData.food, f, 0.022);
          K.counterBowl.visible = at === 'counter'; if (K.counterBowl.visible) setFood(K.counterBowl.userData.food, f, 0.022);
          K.stovePan.visible = at === 'stove'; if (K.stovePan.visible) setFood(K.stovePan.userData.food, f, 0);
          K.pegPan.visible = !(D && D.kind === 'pan');
          if (campPanRig) { campPanRig.pan.visible = at === 'camp'; if (campPanRig.pan.visible) setFood(campPanRig.food, f, 0); }
        }
        // ---- KHÓI ỐNG BẾP: máy hút mùi đẩy hơi nước + khói dầu lên ống gió, thoát ở chụp ống khói trên mái = SỢI KHÓI Navier–Stokes như lửa trại
        //      (G 15/10 "khói kitchen qua ống cũng giống từ camp fire"; nature/fluids.js, nguồn thứ 3): đáy miền = miệng ống Ø9 cm, chụp nón che mưa là
        //      ô đặc ⇒ khói phụt lên dội vào nón, toả ra theo khe 3 cm, vòng qua mép nón rồi mới bốc (gió thật kéo ngả). Quạt hút = sức đẩy (draft).
        //      Hơi nước trắng khi luộc/nấu, khói dầu xám khi chiên; tắt lửa quạt chạy thêm ~25 s cho hết mùi. ----
        const ventTop = new THREE.Vector3(), ventSmoke = (() => {
          const vs = caravanObj.getWorldScale(new THREE.Vector3()).y;   // ống: r 4,5 cm · khe 3 cm · nón r 9,5 cm cao 7 cm (toạ độ xe × tỉ lệ xe)
          // G 16/10 "cho khói nấu ăn giống khói fire camp": cùng độ đặc hạt (dens 0,8) + độ đục (0,6) như lửa trại (trước 1,3 × 0,75 ⇒ đặc gấp đôi),
          // vùng bốc cao 3 m (trước 2,4) cho sợi khói toả; ô 2 cm giữ nguyên để còn phân giải miệng ống 4,5 cm + nón che mưa
          const S = fluids.addSmoke({ NR: 40, NZ: 150, H: 0.02 * vs, NP: 400, NS: 0, NT: 14, buoy: 4, kNu: 0.03, nu0: 0.002, tauT: 5, iters: 30, dens: 0.8,
            inlet: { r: 0.045 * vs }, lid: { r: 0.095 * vs, z0: 0.03 * vs, z1: 0.1 * vs } }, { name: 'Khói ống bếp (sợi khói Navier–Stokes)', opacity: 0.6 });
          S.on = false; return S;
        })();
        let ventRun = 0; const _usA = new THREE.Vector3(), _usS = new THREE.Vector3();
        function udonSteam(t, bowl, heat) {   // hơi nóng tô udon: 4 cụm nhỏ bốc THẲNG LÊN (trục đứng thế giới, kể cả lúc bát nghiêng trên tay), uốn lượn, nở to, nhạt dần; nguội dần khi ăn
          const S = bowl && bowl.userData.steam; if (!S) return; const on = bowl.visible && heat > 0.03;
          if (on) { bowl.updateWorldMatrix(true, false); bowl.getWorldScale(_usS); }
          for (const p of S) {
            p.m.visible = on; if (!on) continue;
            const k = (t * 0.38 + p.ph) % 1, s = _usS.y; bowl.localToWorld(_usA.set(0, 0.058, 0));
            _usA.x += Math.sin(t * 1.3 + p.ph * 6) * 0.018 * s * (0.4 + k); _usA.z += Math.cos(t * 1.1 + p.ph * 5) * 0.018 * s * (0.4 + k); _usA.y += (0.015 + k * 0.26) * s;
            p.m.position.copy(bowl.worldToLocal(_usA)); p.m.scale.setScalar(0.55 + k * 1.7); p.m.material.opacity = 0.2 * heat * Math.sin(Math.PI * k);
          }
        }
        function kitchenTick(dt, t) {   // lửa ga nhảy nhẹ · hơi nước bốc từ nồi · quạt hút + khói ống khói
          VKIT.flames.forEach((f, i) => { if (!f.visible) return; const k = 1 + Math.sin(t * 23 + i * 1.7) * 0.05 + Math.sin(t * 37 + i) * 0.04; f.scale.set(k, 1 + Math.sin(t * 29 + i * 2.3) * 0.35, k); });
          const st = VKIT.steam, ud = engObj && engObj.dish && engObj.dish.kind === 'udon' ? 0.35 + 0.65 * engObj.dish.food : 1;   // tô càng vơi (ăn lâu) càng nguội, ít hơi
          for (const b of [VKIT.counterBowl, VTUDON, engObj && engObj.props.handBowl]) udonSteam(t, b, ud);
          for (const p of VKIT.potSteam) {
            p.m.visible = st > 0.02; if (!p.m.visible) continue;
            const k = (t * 0.45 + p.ph) % 1;
            p.m.position.set(Math.sin(t * 1.3 + p.ph * 6) * 0.02, 0.12 + k * 0.35, Math.cos(t * 1.1 + p.ph * 5) * 0.02); p.m.scale.setScalar(0.6 + k * 1.4); p.m.material.opacity = 0.32 * st * Math.sin(Math.PI * k);
          }
          const lit = VKIT.flames.some(f => f.visible), fry = lit && VKIT.stovePan.visible && VKIT.stovePan.userData.food.visible;
          ventRun = lit ? 25 : Math.max(0, ventRun - dt);
          VKIT.hoodLamp.material.color.setHex(ventRun > 0 ? 0xfff1c9 : 0x8a8578);
          const heat = lit ? Math.max(0.35, st, fry ? 1 : 0) : 0.12 * ventRun / 25;   // còn hơi trong ống sau khi tắt lửa
          const VS = ventSmoke; VS.on = heat > 0.01;   // khói ống bếp theo độ nóng: nhiệt, lượng khói, sức đẩy quạt hút; màu hơi trắng → khói dầu xám khi chiên
          if (VS.on) { caravanObj.localToWorld(VS.base.copy(caravanObj.userData.chimneyTop)); VS.base.y -= 0.02 * caravanObj.getWorldScale(ventTop).y;
            // khí thải còn nóng. G 16/10: lượng khói −70% (số hạt thả ra × 0,3); bốc nhờ hơi nóng như lửa trại (draft 0 — dòng "VS.draft = …" cũ bị nuốt vào
            // chú thích nên chưa từng chạy); màu xám khói như lửa trại, ngả trắng hơi nước khi luộc / nấu, gần như xám hẳn khi chiên
            VS.heat = 0.8 + 0.5 * heat; VS.smoke = 1 + 0.5 * heat; VS.rate = 0.3 * (0.25 + 0.6 * heat); VS.draft = 0;
            plumeLight(VS, _plumeSmokeC.copy(PLUME_COL.smoke).lerp(PLUME_COL.steam, fry ? 0.05 : 0.3), PLUME_COL.steam, _plumeGlow.setRGB(0, 0, 0)); }
        }
        function engSay(label, text) {   // nảy ý ngay khi có sự việc (múc xong udon…): dùng chung đám mây suy nghĩ
          const now = Date.now(), ctx = engContext(now);
          const tp = Number.isFinite(ctx.temp) ? ' · ' + ctx.wxIcon + ' ' + ctx.temp.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '°' : '';
          checkBubbleSprite.userData.thought = { header: ctx.slotIcon + ' ' + ctx.slotName + ' · ' + clockText(ctx.h) + ' · ' + label + tp, message: text, kind: 'event', slot: ctx.slot, tags: [...ctx.tags], revision: ++thoughtRevision };
          thoughtUntil = now + 14000; idleThoughtAt = Math.max(idleThoughtAt, now + 60000);
        }
        function kitchenReset() {   // tắt lửa, đổ nước nồi, dao về móc (bỏ dở việc nấu / đi ngủ)
          for (const f of VKIT.flames) f.visible = false;
          for (const k of VKIT.knobs) k.rotation.x = 0;
          VKIT.potWater.visible = VKIT.potNoodles.visible = VKIT.tapWater.visible = false; VKIT.steam = 0; VKIT.pegKnife.visible = true;
          for (const s of VKIT.scallions) s.visible = false;
          VKIT.pot.position.copy(VKIT.pot.userData.home); VKIT.pot.rotation.set(0, 0, 0);
          VKIT.stovePan.position.copy(VKIT.stovePan.userData.home); VKIT.stovePan.rotation.set(0, Math.PI, 0);
        }
        const stStove = { node: 'stove', tick(e, V, dt, t, keep) {   // bếp ga: trưa luộc udon (nồi họng sau–trái, thái hành trên thớt) · chiều chiên cơm trứng (chảo họng trước–trái)
          const K = VKIT, H = e.hold, rt = e.armRollT || (e.armRollT = [0, 0]), now = clock.elapsedTime, POT = 1, PAN = 0, TOP = K.TOP;
          if (!V.st) {
            V.recipe = liveWeather.localHour < 14 ? 'udon' : 'rice';
            V.T = V.recipe === 'udon' ? Math.max(420, Math.min(1320, e.actLeft - 100)) : Math.max(300, Math.min(840, e.actLeft - 100));
            V.st = V.recipe === 'udon' ? 'face' : 'toPeg'; V.chopped = false;
          }
          if (!keep && !['take', 'garnish'].includes(V.st)) {   // bỏ dở (nhảy giờ): tắt bếp, dọn, chảo về móc
            kitchenReset(); if (e.dish && e.dish.kind === 'pan') e.dish = null; if (e.dish && e.dish.at === 'counter') e.dish = null; return 'released';
          }
          if (!/^(to|back)|Face$|^face$/.test(V.st)) e.armsBusy = true;   // đi lại / quay người: tay để lớp dáng đi (bưng chảo nếu đang cầm)
          const knob = (k, on, i) => {   // tay phải với xuống núm ga ở mép trước mặt bếp, vặn ¼ vòng (gập eo, cúi nhìn núm)
            const r = ckS(k, 0, 0.55) * (1 - ckS(k, 1.05, 1.5)), kn = K.knobs[i];
            ckHand(e, 0, ckW(2.315, 1.805, kn.position.z, _ckB), r); e.lean = 0.3 * r; ckLook(e, kn.getWorldPosition(_ckL), r);
            const turn = ckS(k, 0.55, 0.85); kn.rotation.x = -1.4 * (on ? turn : 1 - turn);
            if (k > 0.7) K.flames[i].visible = on;
          };
          const lookAt = x => ckLook(e, x === 'pan' ? K.stovePan.getWorldPosition(_ckL) : K.pot.getWorldPosition(_ckL), 1);
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
            case 'on': V.k += dt; knob(V.k, true, POT); if (V.k > 0.7) { K.potWater.visible = true; K.potWater.material.color.set(0x9cc7d8); } if (V.k > 1.6) { V.st = 'boil'; V.t0 = now; V.boilDur = V.T * 0.4; } break;
            case 'boil': {   // chờ nước sôi: tay chống mép bếp, nhìn nồi; giữa chừng sang thớt thái hành
              const p = (now - V.t0) / V.boilDur; K.steam = Math.min(1, p * 1.3); brace('pot');
              if (!V.chopped && p > 0.3) V.st = 'toBoard';
              else if (p >= 1) { V.st = 'noodles'; V.k = 0; }
              break;
            }
            case 'toBoard': if (vanWalkTo(e, VN.board, dt, 0.45)) V.st = 'boardFace'; break;
            case 'boardFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'knifeTake'; V.k = 0; } break;
            case 'knifeTake': V.k += dt; reachPeg(V.k, 0, 2.87, 2.165, -0.19); if (V.k > 0.75) K.pegKnife.visible = false; H.knife = V.k > 0.75; if (V.k > 1.4) { V.st = 'chop'; V.k = 0; } break;
            case 'chop': {   // thái hành lá: tay trái giữ bó hành, lùi dần về phía dao; dao lên xuống ~3 nhát/giây ngay sát ngón
              V.k += dt; H.knife = true; const prog = Math.min(1, V.k / 40), n = Math.floor(prog * K.scallions.length), r = ckS(V.k, 0, 0.6);
              K.scallions.forEach((s, i) => { s.visible = i < n; });
              const cut = Math.max(0, Math.sin(t * 19));
              ckHand(e, 0, ckW(2.5, TOP + 0.09 + 0.05 * cut, -0.03 - 0.07 * prog, _ckB), r);
              ckHand(e, 1, ckW(2.56, TOP + 0.05, -0.21 + 0.09 * prog, _ckA.clone()), r);
              e.lean = 0.22 * r; ckLook(e, ckW(2.6, TOP, -0.12, _ckL), r);
              if (V.k > 40) { V.st = 'knifeBack'; V.k = 0; }
              break;
            }
            case 'knifeBack': V.k += dt; reachPeg(V.k, 0, 2.87, 2.165, -0.19); H.knife = V.k < 0.75; if (V.k > 0.75) K.pegKnife.visible = true; if (V.k > 1.4) { V.chopped = true; V.st = 'backStove'; } break;
            case 'backStove': if (vanWalkTo(e, VN.stove, dt, 0.45)) V.st = 'backFace'; break;
            case 'backFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) V.st = 'boil'; break;
            case 'noodles': {   // hai tay đưa nắm udon tới trên miệng nồi, thả vào nước sôi
              V.k += dt; const r = ckS(V.k, 0, 0.8) * (1 - ckS(V.k, 1.6, 2.4)), c = K.pot.getWorldPosition(_ckL);
              ckHand(e, 0, _ckB.copy(c).add(_ckA.set(0, 0.2, 0)).addScaledVector(ckW(0, 0, 1, _ckE).sub(ckW(0, 0, 0, _ckA)), 0.05), r);
              ckHand(e, 1, ckW(2.74, 2.09, 0.38, _ckA.clone()), r); e.lean = 0.2 * r; lookAt('pot');
              if (V.k > 1.0) K.potNoodles.visible = true;
              if (V.k > 2.5) { V.st = 'stir'; V.t0 = now; V.stirDur = V.T * 0.5; }
              break;
            }
            case 'stir': {   // đũa dài đảo sợi vòng tròn trong nồi cho khỏi dính; ~30 s nghỉ tay một lần
              K.steam = 1; const rest = ((now - V.t0) % 30) > 22;
              if (rest) brace('pot');
              else {
                H.chop = true; const a = t * 3.2, c = K.pot.getWorldPosition(_ckL), wy = K.potWater.getWorldPosition(_ckE).y;
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
              V.k += dt; const k = V.k, up = ckS(k, 0, 0.8) * (1 - ckS(k, 2.3, 3.1)), tilt = ckS(k, 0.8, 1.4) * (1 - ckS(k, 1.9, 2.4)), home = K.pot.userData.home, grip = ckS(k, 0, 0.35) * (1 - ckS(k, 3.0, 3.3));
              K.pot.position.set(home.x - 0.04 * up, home.y + 0.12 * up, home.z - 0.16 * up); K.pot.rotation.x = -0.9 * tilt;
              K.pot.updateWorldMatrix(true, false);
              ckHand(e, 0, K.pot.localToWorld(_ckB.set(0, 0.098, 0.11)), grip); ckHand(e, 1, K.pot.localToWorld(_ckA.set(0, 0.098, -0.11)).clone(), grip);
              e.lean = 0.12 + 0.1 * up; ckLook(e, ckW(2.6, TOP, 0.17, _ckL));
              if (k > 1.5 && K.potNoodles.visible) { K.potNoodles.visible = false; K.potWater.visible = false; if (e.dish) e.dish.food = 1; }
              K.steam = Math.max(0, 1 - ckS(k, 1.5, 3.1));
              if (k > 3.2) { K.pot.position.copy(home); K.pot.rotation.set(0, 0, 0); V.st = 'garnish'; V.k = 0; }
              break;
            }
            case 'garnish': {   // tay trái vốc hành lá trên thớt, đưa qua rắc lên bát
              V.k += dt; const r = ckS(V.k, 0, 0.5) * (1 - ckS(V.k, 1.4, 1.9)), over = ckS(V.k, 0.6, 1.0);
              ckHand(e, 1, ckW(2.58, TOP + 0.03 + 0.12 * over + 0.015 * Math.sin(t * 14) * over, -0.02 + 0.19 * over, _ckB), r); e.lean = 0.15 * r; ckLook(e, _ckB, r);
              if (V.k > 1.0) for (const s of K.scallions) s.visible = false;
              if (V.k > 1.9) { V.st = 'take'; V.k = 0; }
              break;
            }
            case 'take': {   // hai tay nâng bát (udon) / cán chảo (cơm chiên) lên
              V.k += dt; const r = ckS(V.k, 0, 0.5);
              if (V.recipe === 'udon') { ckHand(e, 0, ckW(2.56, TOP + 0.05, 0.25, _ckB), r * (1 - ckS(V.k, 0.5, 0.6))); ckHand(e, 1, ckW(2.56, TOP + 0.05, 0.09, _ckA.clone()), r * (1 - ckS(V.k, 0.5, 0.6))); }
              else ckHand(e, 1, K.stovePan.localToWorld(_ckB.set(0.175, 0.045, 0)), r * (1 - ckS(V.k, 0.5, 0.6)));
              e.lean = 0.12 * r;
              if (V.k > 0.5 && e.dish && e.dish.at !== 'hand') {
                e.dish.at = 'hand';
                if (V.recipe === 'udon') engSay('Nấu udon', 'Tới giờ ăn udon rồi!'); else engSay('Nấu bữa tối', 'Cơm chiên xong, mang ra hiên ăn thôi.');
              }
              if (V.k > 1.1) { kitchenReset(); return 'released'; }
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
              V.k += dt; const r = ckS(V.k, 0, 0.7) * (1 - ckS(V.k, 1.5, 2.2)), c = K.stovePan.getWorldPosition(_ckL);
              ckHand(e, 0, _ckB.copy(c).add(_ckE.set(0, 0.17, 0)).addScaledVector(ckW(1, 0, 0, _ckA).sub(ckW(0, 0, 0, _ckE)), -0.08), r);
              ckHand(e, 1, ckW(2.42, 2.02, 0.36, _ckA.clone()), r); e.lean = 0.2 * r; lookAt('pan');
              if (V.k > 1.1 && e.dish) e.dish.food = 1;
              if (V.k > 2.3) { V.st = 'fry'; V.t0 = now; V.fryDur = Math.max(120, V.T - 60); }
              break;
            }
            case 'fry': {   // tay phải xẻng đảo đều trong lòng chảo; tay trái nắm cán, ~7 s hất chảo một lần (cơm bay lên rơi xuống)
              H.spatula = true; const ph = ((now - V.t0) % 7) / 0.9, home = K.stovePan.userData.home, food = K.stovePan.userData.food;
              if (ph < 1) {
                const s = Math.sin(Math.PI * ph);
                K.stovePan.position.set(home.x - 0.02 * s, home.y + 0.04 * s, home.z); K.stovePan.rotation.set(0, Math.PI, 0.25 * s); food.position.y = 0.035 * Math.sin(Math.PI * Math.min(1, ph * 1.3));
              } else { K.stovePan.position.copy(home); K.stovePan.rotation.set(0, Math.PI, 0); food.position.y = 0; }
              K.stovePan.updateWorldMatrix(true, false);
              const a = t * 5, c = K.stovePan.getWorldPosition(_ckL), sx = _ckA.set(1, 0, 0).transformDirection(K.stovePan.matrixWorld).clone();   // sx: hướng cán chảo
              ckTool(e, CK_SPAT, _ckB.set(c.x + 0.05 * Math.sin(a), c.y + 0.03 + 0.008 * Math.cos(2 * a), c.z + 0.05 * Math.cos(a)));   // lưỡi xẻng đảo vòng trong lòng chảo
              ckGrip(e, 1, K.stovePan.localToWorld(_ckA.set(0.175, 0.045, 0)), sx);
              e.lean = 0.2; ckLook(e, c);
              if (now - V.t0 >= V.fryDur) { K.stovePan.position.copy(home); K.stovePan.rotation.set(0, Math.PI, 0); food.position.y = 0; V.st = 'off'; V.k = 0; }
              break;
            }
          }
          return 'busy';
        } };
        const stDishes = { node: 'ksink', tick(e, V, dt, t, keep) {   // chậu bếp: rửa bát / chảo dưới vòi rồi cất (bát vào tủ dưới chậu, chảo treo lại lên bảng)
          const D = e.dish, rt = e.armRollT || (e.armRollT = [0, 0]);
          if (!D && V.st !== 'hang' && V.st !== 'stow') return 'released';
          if (!V.st) V.st = 'face';
          if (V.st === 'face') { if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'wash'; V.k = 0; } }
          else if (V.st === 'wash') {
            V.k += dt; e.armsBusy = true; const k = V.k, dur = D.kind === 'pan' ? 30 : 22, on = k > 1 && k < dur - 1.5, reach = segK(k, 0, 0.8);
            VKIT.tapWater.visible = on; if (on) VKIT.tapWater.scale.set(1 + Math.sin(t * 40) * 0.15, 1, 1 + Math.cos(t * 37) * 0.15);
            e.arms[1].rotation.x = -0.95 * reach + (on ? Math.sin(t * 2.2) * 0.08 : 0); e.arms[0].rotation.x = -1.0 * reach + (on ? Math.sin(t * 9) * 0.12 : 0);
            rt[0] = 0.25 * reach; rt[1] = -0.15 * reach; e.lean = 0.2 * reach; e.head.rotation.x = 0.4 * reach;
            D.food = 0;   // phần thừa đổ đi, rửa sạch
            if (k > dur) { VKIT.tapWater.visible = false; V.st = D.kind === 'pan' ? 'toPeg' : 'stow'; V.k = 0; }
          }
          else if (V.st === 'stow') {   // cúi cất bát vào tủ dưới chậu
            V.k += dt; e.armsBusy = true; const d = segK(V.k, 0, 0.8) * (1 - segK(V.k, 1.4, 2.2));
            e.lean = 0.35 * d; e.arms[0].rotation.x = e.arms[1].rotation.x = -0.5 * d; e.head.rotation.x = 0.4 * d;
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
        const VAN_STATIONS = { desk: stDesk, table: stTable, bed: stBed, wc: stWc, sink: stSink, shelfOff: stShelf(false), shelfOn: stShelf(true), shower: stShower, towel: stTowel, cleanWc: stCleanWc, cleanBath: stCleanBath, stove: stStove, dishes: stDishes };
        const engVanNew = node => ({ node, path: null, pi: 0, goal: null, segDoor: null, station: null, st: null, k: 0, plan: [], idx: 0, act: null, opened: new Set(), ph: Math.random() * 100 });
        function engVan(e, dt, t, act) {   // trong xe: làm lần lượt các trạm của việc; việc ngoài trời thì ra cửa hông bước xuống bậc
          const V = e.van, A = ENG_ACTS[act], g = e.g;
          if (V.st === 'stepOut') {   // bước xuống bậc cửa hông, cúi đầu qua khung cửa
            V.k = Math.min(1, V.k + dt / 0.8); const k = V.k, Pa = dogInside, Pb = dogDoorStep, ya = VAN_FLOOR - ENG_FEET, yb = cowY(Pb.x, Pb.z) - ENG_FEET;
            g.position.set(Pa.x + (Pb.x - Pa.x) * k, ya + (yb - ya) * k + Math.sin(Math.PI * k) * 0.06, Pa.z + (Pb.z - Pa.z) * k);
            let d = Math.atan2(Pb.x - Pa.x, Pb.z - Pa.z) - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 8);
            e.vel = 0.7; engGait(e, Pa.distanceTo(Pb) * dt / 0.8); e.lean = 0.1 * Math.sin(Math.PI * k); e.head.rotation.x = 0.3 * Math.sin(Math.PI * k); e.walking = true;
            if (k >= 1) { e.inVan = false; e.van = engVanNew('door'); e.vel = 0.5; }
            return;
          }
          if (V.act !== act) {
            V.act = act; V.plan = A.van ? (A.plan || []) : ['exit']; V.idx = 0;
            if (act !== 'shower') {   // tắm dở (nhảy giờ): treo khăn, đội mũ rồi mới làm việc khác
              const fix = []; if (e.towel.visible) fix.push('towel'); if (!e.helmet.visible && VBATH.shelfHelmet.visible && act !== 'bedtime') fix.push('shelfOn');
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
            g.position.y = VAN_FLOOR - ENG_FEET; engStandStill(e); e.vel = 0; return;
          }
          const want = V.plan[V.idx];
          if (want === 'exit') { if (vanGoTo(e, V, 'door', dt)) { V.st = 'stepOut'; V.k = 0; } return; }
          if (vanGoTo(e, V, VAN_STATIONS[want].node, dt)) { V.station = want; V.st = null; V.k = 0; }
        }
        function engEnterVan(e, dt, t) {   // vào xe: tới cửa hông theo trường dòng chảy → bước lên bậc (cúi đầu qua khung cửa)
          if (!e.enter) e.enter = 'toDoor';
          if (e.enter === 'toDoor') { if (engStep(e, dogDoorFar, dt, t, pf, FIRE_AVOID_R, dogDoorField)) e.enter = 'toStep'; }
          else if (e.enter === 'toStep') { if (engStep(e, dogDoorStep, dt, t, null, 0, null)) { e.enter = 'stepIn'; e.timer = 0; } }
          else {
            e.timer = Math.min(1, e.timer + dt / 0.8); const k = e.timer, A = dogDoorStep, B = dogInside, ya = cowY(A.x, A.z) - ENG_FEET, yb = VAN_FLOOR - ENG_FEET, g = e.g;
            g.position.set(A.x + (B.x - A.x) * k, ya + (yb - ya) * k + Math.sin(Math.PI * k) * 0.12, A.z + (B.z - A.z) * k);
            let d = Math.atan2(B.x - A.x, B.z - A.z) - g.rotation.y; d = Math.atan2(Math.sin(d), Math.cos(d)); g.rotation.y += d * Math.min(1, dt * 8);
            e.vel = 0.8; engGait(e, A.distanceTo(B) * dt / 0.8); e.lean = 0.12 * Math.sin(Math.PI * k); e.head.rotation.x = 0.3 * Math.sin(Math.PI * k); e.walking = true;
            if (k >= 1) { e.enter = null; e.inVan = true; e.van = engVanNew('door'); }
          }
        }
        function engWake(e) {   // 06:00: từ tư thế nằm sang ngồi mép giường, đội mũ, vươn vai vài giây rồi đứng dậy
          scene.add(e.g); e.g.scale.setScalar(ENGINEER_BASE_SCALE * CAMP_SCALE); e.g.rotation.set(0, VY.pz, 0);
          e.legs[0].rotation.set(0, 0, 0); e.legs[1].rotation.set(0, 0, 0);
          e.inVan = true; e.van = engVanNew('bed'); e.van.station = 'bed'; e.van.st = 'seated'; e.van.k = -6;
          e.seat = engNewSeat(BED_SEAT, 'seated'); e.phase = 'van'; e.enter = null; engHelmet(e, 'head');
        }

