        // ---- BẾP: nấu ăn · bát đĩa ----
        //  e.dish = { kind: 'udon' | 'cereal' | 'pan', at: 'hand' | 'table' | 'counter' | 'stove' | 'camp', food: 0–1 } — món đang ở đâu, còn bao nhiêu
        const VKIT = caravanObj.userData.interior.kitchen, VCEREAL = caravanObj.userData.interior.cerealBowl, VTUDON = caravanObj.userData.interior.tableUdon;
        VKIT.stovePan.userData.home = VKIT.stovePan.position.clone(); VKIT.pot.userData.home = VKIT.pot.position.clone();
        function setFood(food, k, drop) {   // phần thức ăn vơi dần: thu nhỏ + hạ mặt nước dùng / sữa
          if (food.userData.y0 === undefined) food.userData.y0 = food.position.y;
          food.visible = k > 0.04; if (!food.visible) return;
          const s = 0.55 + 0.45 * k; food.scale.set(s, 0.5 + 0.5 * k, s); food.position.y = food.userData.y0 - (1 - k) * drop;
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
        function kitchenTick(dt, t) {   // lửa ga nhảy nhẹ · hơi nước bốc từ nồi
          VKIT.flames.forEach((f, i) => { if (!f.visible) return; const k = 1 + Math.sin(t * 23 + i * 1.7) * 0.05 + Math.sin(t * 37 + i) * 0.04; f.scale.set(k, 1 + Math.sin(t * 29 + i * 2.3) * 0.35, k); });
          const st = VKIT.steam;
          for (const p of VKIT.potSteam) {
            p.m.visible = st > 0.02; if (!p.m.visible) continue;
            const k = (t * 0.45 + p.ph) % 1;
            p.m.position.set(Math.sin(t * 1.3 + p.ph * 6) * 0.02, 0.12 + k * 0.35, Math.cos(t * 1.1 + p.ph * 5) * 0.02); p.m.scale.setScalar(0.6 + k * 1.4); p.m.material.opacity = 0.32 * st * Math.sin(Math.PI * k);
          }
        }
        function engSay(label, text) {   // nảy ý ngay khi có sự việc (múc xong udon…): dùng chung đám mây suy nghĩ
          const now = Date.now(), ctx = engContext(now);
          const tp = Number.isFinite(ctx.temp) ? ' · ' + ctx.wxIcon + ' ' + ctx.temp.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '°' : '';
          checkBubbleSprite.userData.thought = { header: ctx.slotIcon + ' ' + ctx.slotName + ' · ' + clockText(ctx.h) + ' · ' + label + tp, message: text, kind: 'event', slot: ctx.slot, tags: [...ctx.tags], revision: ++thoughtRevision };
          thoughtUntil = now + 14000; idleThoughtAt = Math.max(idleThoughtAt, now + 60000);
        }
        function kitchenReset() {   // tắt lửa, đổ nước nồi, dao về móc (bỏ dở việc nấu / đi ngủ)
          for (const f of VKIT.flames) f.visible = false;
          VKIT.potWater.visible = VKIT.potNoodles.visible = VKIT.tapWater.visible = false; VKIT.steam = 0; VKIT.pegKnife.visible = true;
          for (const s of VKIT.scallions) s.visible = false;
          VKIT.pot.position.copy(VKIT.pot.userData.home); VKIT.pot.rotation.set(0, 0, 0);
          VKIT.stovePan.position.copy(VKIT.stovePan.userData.home); VKIT.stovePan.rotation.set(0, Math.PI, 0);
        }
        const stStove = { node: 'stove', tick(e, V, dt, t, keep) {   // bếp ga: trưa luộc udon (nồi họng sau–trái, thái hành trên thớt) · chiều chiên cơm trứng (chảo họng trước–phải)
          const K = VKIT, H = e.hold, rt = e.armRollT || (e.armRollT = [0, 0]), now = clock.elapsedTime, POT = 1, PAN = 2;
          if (!V.st) {
            V.recipe = liveWeather.localHour < 14 ? 'udon' : 'rice';
            V.T = V.recipe === 'udon' ? Math.max(420, Math.min(1320, e.actLeft - 100)) : Math.max(300, Math.min(840, e.actLeft - 100));
            V.st = V.recipe === 'udon' ? 'face' : 'toPeg'; V.chopped = false;
          }
          if (!keep && !['take', 'garnish'].includes(V.st)) {   // bỏ dở (nhảy giờ): tắt bếp, dọn, chảo về móc
            kitchenReset(); if (e.dish && e.dish.kind === 'pan') e.dish = null; if (e.dish && e.dish.at === 'counter') e.dish = null; return 'released';
          }
          const knob = (k, on, i) => {   // cúi xuống vặn núm ga ở mặt trước khối bếp
            const r = segK(k, 0, 0.6) * (1 - segK(k, 1.0, 1.5)); e.lean = 0.3 * r; e.arms[0].rotation.x = -0.6 * r; e.head.rotation.x = 0.45 * r;
            if (k > 0.7) K.flames[i].visible = on;
          };
          const lookStove = () => { e.arms[0].rotation.x = e.arms[1].rotation.x = -0.5; rt[0] = 0.1; rt[1] = -0.1; e.head.rotation.x = 0.38 + Math.sin(t * 0.5) * 0.04; e.lean = 0.06 + 0.06 * Math.max(0, Math.sin(t * 0.3)); };
          const reachUp = (k, flip) => { const r = segK(k, 0, 0.7) * (1 - segK(k, 1.0, 1.5)); e.arms[flip ? 1 : 0].rotation.x = -1.75 * r; e.head.rotation.x = -0.12 * r; return r; };
          switch (V.st) {
            // ===== udon =====
            case 'face': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'on'; V.k = 0; } break;
            case 'on': V.k += dt; knob(V.k, true, POT); if (V.k > 0.7) { K.potWater.visible = true; K.potWater.material.color.set(0x9cc7d8); } if (V.k > 1.6) { V.st = 'boil'; V.t0 = now; V.boilDur = V.T * 0.4; } break;
            case 'boil': {   // chờ nước sôi: tay chống mép bếp, nhìn nồi; giữa chừng sang thớt thái hành
              const p = (now - V.t0) / V.boilDur; K.steam = Math.min(1, p * 1.3); lookStove();
              if (!V.chopped && p > 0.3) V.st = 'toBoard';
              else if (p >= 1) { V.st = 'noodles'; V.k = 0; }
              break;
            }
            case 'toBoard': if (vanWalkTo(e, VN.board, dt, 0.45)) V.st = 'boardFace'; break;
            case 'boardFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'knifeTake'; V.k = 0; } break;
            case 'knifeTake': V.k += dt; reachUp(V.k); if (V.k > 0.75) K.pegKnife.visible = false; H.knife = V.k > 0.75; if (V.k > 1.4) { V.st = 'chop'; V.k = 0; } break;
            case 'chop': {   // thái hành lá: dao lên xuống nhanh, tay trái giữ cọng hành
              V.k += dt; H.knife = true; const n = Math.floor(Math.min(1, V.k / 40) * K.scallions.length);
              K.scallions.forEach((s, i) => { s.visible = i < n; });
              e.arms[0].rotation.x = -0.95 + Math.max(0, Math.sin(t * 16)) * 0.18; e.arms[1].rotation.x = -0.85; rt[1] = -0.12; e.lean = 0.18; e.head.rotation.x = 0.45;
              if (V.k > 40) { V.st = 'knifeBack'; V.k = 0; }
              break;
            }
            case 'knifeBack': V.k += dt; reachUp(V.k); H.knife = V.k < 0.75; if (V.k > 0.75) K.pegKnife.visible = true; if (V.k > 1.4) { V.chopped = true; V.st = 'backStove'; } break;
            case 'backStove': if (vanWalkTo(e, VN.stove, dt, 0.45)) V.st = 'backFace'; break;
            case 'backFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) V.st = 'boil'; break;
            case 'noodles': {   // thả udon vào nồi nước sôi
              V.k += dt; const r = segK(V.k, 0, 0.8) * (1 - segK(V.k, 1.6, 2.4)); e.arms[0].rotation.x = e.arms[1].rotation.x = -1.05 * r; e.lean = 0.2 * r; e.head.rotation.x = 0.4 * r;
              if (V.k > 1.0) K.potNoodles.visible = true;
              if (V.k > 2.5) { V.st = 'stir'; V.t0 = now; V.stirDur = V.T * 0.5; }
              break;
            }
            case 'stir': {   // đũa dài đảo sợi cho khỏi dính; ~30 s nghỉ tay một lần
              K.steam = 1; const rest = ((now - V.t0) % 30) > 22;
              if (rest) lookStove();
              else { H.chop = true; e.arms[0].rotation.x = -1.15 + Math.sin(t * 3.2) * 0.12; rt[0] = 0.18 + Math.cos(t * 3.2) * 0.1; e.arms[1].rotation.x = -0.5; e.lean = 0.22; e.head.rotation.x = 0.42; }
              if (now - V.t0 >= V.stirDur) { V.st = 'off'; V.k = 0; }
              break;
            }
            case 'off': V.k += dt; knob(V.k, false, V.recipe === 'udon' ? POT : PAN); if (V.k > 1.6) { V.st = V.recipe === 'udon' ? 'bowl' : 'take'; V.k = 0; } break;
            case 'bowl': {   // cúi lấy bát trong tủ dưới, đặt lên mặt đá cạnh bếp
              V.k += dt; const d = segK(V.k, 0, 0.8) * (1 - segK(V.k, 1.2, 1.8)); e.lean = 0.4 * d; e.arms[1].rotation.x = -0.45 * d; e.head.rotation.x = 0.45 * d;
              if (V.k > 0.9 && !e.dish) e.dish = { kind: 'udon', at: 'counter', food: 0 };
              if (V.k > 1.9) { V.st = 'pour'; V.k = 0; }
              break;
            }
            case 'pour': {   // nhấc nồi, nghiêng đổ sợi + nước dùng vào bát
              V.k += dt; const k = V.k, up = segK(k, 0, 0.8) * (1 - segK(k, 2.3, 3.1)), tilt = segK(k, 0.8, 1.4) * (1 - segK(k, 1.9, 2.4)), home = K.pot.userData.home;
              K.pot.position.set(home.x - 0.04 * up, home.y + 0.12 * up, home.z - 0.16 * up); K.pot.rotation.x = -0.9 * tilt;
              e.arms[0].rotation.x = e.arms[1].rotation.x = -1.05 - 0.2 * up; rt[0] = 0.25 * up; rt[1] = -0.05 * up; e.lean = 0.2 * up; e.head.rotation.x = 0.4;
              if (k > 1.5 && K.potNoodles.visible) { K.potNoodles.visible = false; K.potWater.visible = false; if (e.dish) e.dish.food = 1; }
              K.steam = Math.max(0, 1 - segK(k, 1.5, 3.1));
              if (k > 3.2) { K.pot.position.copy(home); K.pot.rotation.set(0, 0, 0); V.st = 'garnish'; V.k = 0; }
              break;
            }
            case 'garnish': {   // vốc hành lá trên thớt rắc lên bát
              V.k += dt; const r = segK(V.k, 0, 0.6) * (1 - segK(V.k, 1.2, 1.8)); e.arms[1].rotation.x = -0.9 * r; rt[1] = -0.35 * r; e.lean = 0.15 * r;
              if (V.k > 0.7) for (const s of K.scallions) s.visible = false;
              if (V.k > 1.9) { V.st = 'take'; V.k = 0; }
              break;
            }
            case 'take': {   // bưng bát (udon) / nhấc chảo (cơm chiên) lên
              V.k += dt; const r = segK(V.k, 0, 0.5); e.lean = 0.12 * r;
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
            case 'takePan': V.k += dt; reachUp(V.k, true); if (V.k > 0.8 && !e.dish) e.dish = { kind: 'pan', at: 'hand', food: 0 }; if (V.k > 1.5) V.st = 'toStove'; break;
            case 'toStove': if (vanWalkTo(e, VN.stove, dt, 0.45)) V.st = 'stoveFace'; break;
            case 'stoveFace': if (engSeatTurn(e, VY.pz, dt, vanFloor)) { V.st = 'place'; V.k = 0; } break;
            case 'place': { V.k += dt; const r = segK(V.k, 0, 0.6) * (1 - segK(V.k, 0.9, 1.4)); e.arms[1].rotation.x = -0.95 * r; e.lean = 0.2 * r; if (V.k > 0.7 && e.dish) e.dish.at = 'stove'; if (V.k > 1.5) { V.st = 'panOn'; V.k = 0; } break; }
            case 'panOn': V.k += dt; knob(V.k, true, PAN); if (V.k > 1.6) { V.st = 'heat'; V.k = 0; } break;
            case 'heat': V.k += dt; lookStove(); if (V.k > 12) { V.st = 'add'; V.k = 0; } break;
            case 'add': {   // cho cơm, trứng, hành vào chảo nóng
              V.k += dt; const r = segK(V.k, 0, 0.7) * (1 - segK(V.k, 1.5, 2.2)); e.arms[0].rotation.x = e.arms[1].rotation.x = -1.0 * r; e.lean = 0.2 * r; e.head.rotation.x = 0.4 * r;
              if (V.k > 1.1 && e.dish) e.dish.food = 1;
              if (V.k > 2.3) { V.st = 'fry'; V.t0 = now; V.fryDur = Math.max(120, V.T - 60); }
              break;
            }
            case 'fry': {   // xẻng đảo đều tay; ~7 s hất chảo một lần (tay trái nắm cán, cơm bay lên rơi xuống)
              H.spatula = true; const ph = ((now - V.t0) % 7) / 0.9, home = K.stovePan.userData.home, food = K.stovePan.userData.food;
              e.arms[0].rotation.x = -1.0 + Math.sin(t * 5) * 0.15; rt[0] = 0.15 + Math.cos(t * 5) * 0.08; e.lean = 0.2; e.head.rotation.x = 0.42;
              if (ph < 1) {
                const s = Math.sin(Math.PI * ph); e.arms[1].rotation.x = -0.85 - 0.25 * s;
                K.stovePan.position.set(home.x - 0.02 * s, home.y + 0.04 * s, home.z); K.stovePan.rotation.set(0, Math.PI, 0.25 * s); food.position.y = 0.035 * Math.sin(Math.PI * Math.min(1, ph * 1.3));
              } else { e.arms[1].rotation.x = -0.45; K.stovePan.position.copy(home); K.stovePan.rotation.set(0, Math.PI, 0); food.position.y = 0; }
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
        const VAN_STATIONS = { desk: stDesk, table: stTable, bed: stBed, wc: stWc, sink: stSink, shelfOff: stShelf(false), shelfOn: stShelf(true), shower: stShower, towel: stTowel, stove: stStove, dishes: stDishes };
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
            if (A.once && e.onceKey && e.onceKey.startsWith(act + '@')) e.doneAct = e.onceKey;
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
        function engSpawn(e, act) {   // mở trang giữa chừng một việc: đặt kỹ sư sẵn ở chỗ đang làm
          e.act = act; e.phase = engPhaseFor(act); e.timer = 0; e.enter = null;
          const A = ENG_ACTS[act];
          if (A.van) {
            const V = e.van = engVanNew('hall'); e.inVan = true; V.act = act; V.plan = A.plan || []; V.idx = 0;
            const at = (node, station, st) => { V.node = node; V.station = station; V.st = st; };
            if (act === 'research' || act === 'music') { studyChairAt(0); e.seat = engNewSeat(STUDY_SEAT, 'seated'); at('mid', 'desk', 'work'); studyLaptop.open = 1; }
            else if (act === 'breakfast' || act === 'lunch') {
              stoolAt(STOOL_IN); e.seat = engNewSeat(STOOL_SEAT, 'seated'); at('tbl', 'table', 'eat');
              e.dish = { kind: act === 'lunch' ? 'udon' : 'cereal', at: 'table', food: 1 }; V.t0 = clock.elapsedTime; V.f0 = 1; V.dur = Math.max(90, Math.min(act === 'lunch' ? 900 : 720, e.actLeft - 150));
            }
            else if (act === 'cook') { at('stove', 'stove', null); e.g.position.set(VN.stove.x, VAN_FLOOR - ENG_FEET, VN.stove.z); e.g.rotation.set(0, VY.pz, 0); }
            else if (act === 'bedtime') { e.seat = engNewSeat(BED_SEAT, 'seated'); at('bed', 'bed', 'seated'); V.k = 3; engHelmet(e, 'bed'); }
            else if (act === 'toilet') { e.seat = engNewSeat(TOILET_SEAT, 'seated'); LID.k = LID.target = 1; at('wcIn', 'wc', 'seated'); V.until = clock.elapsedTime + Math.max(30, Math.min(240, e.actLeft - 75)); }
            else if (act === 'shower') {
              engHelmet(e, 'shelf'); at('wcIn', 'shower', 'wash'); V.idx = 1; V.until = clock.elapsedTime + Math.max(60, Math.min(600, e.actLeft - 130)); showerFx.on = true; showerFx.steam = 0.6;
              e.g.position.set(SHOWER_SPOT.x, VAN_FLOOR - ENG_FEET, SHOWER_SPOT.z); e.g.rotation.set(0, VY.nz, 0);
            }
          } else if (act === 'dinner' || act === 'rest' || act === 'read' || act === 'shelter') {
            e.seat = engNewSeat(CAMP_SEAT, 'seated'); e.phase = engChairPhase(e, act);
            if (act === 'dinner') { e.dish = { kind: 'pan', at: 'camp', food: 1 }; e.eatT0 = e.timer; }
          } else if (act === 'fish') { e.seat = engNewSeat(FISH_SEAT, 'seated'); e.phase = 'fish'; e.timer = e.actLeft; }
          // dạo trại: xuất phát trước cửa xe (wp[0]) như cũ
        }

