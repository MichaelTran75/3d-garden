        // ===== THỎ THEO TẬP TÍNH (G 20/10 "do research về thỏ n its behaviour, then improve and apply") =====
        //  Nghiên cứu: hoạt động 2 đỉnh RẠNG SÁNG + CHẠNG VẠNG, trưa nóng rút vào bóng mát nghỉ (bẫy ảnh thỏ lùn — Brachylagus, 5 điểm, mọi mùa); thỏ đi một mình
        //  kiếm ăn sát chỗ nấp, có nguy cơ thì cảnh giác + chạy nhiều hơn hẳn (Doñana 1997; Sierra Norte 2024 — rào chắn thú săn) · kiếm ăn kiểu GẶM – NHẢY 1–2
        //  cú – GẶM, xen ngồi dựng trên 2 chân sau ngó quanh (tai dựng xoay dò tiếng, mũi hít nhanh) · gặp nguy: ĐỨNG IM đánh giá → DẬM CHÂN SAU báo động →
        //  CHẠY ZÍC-ZẮC, đuôi trắng vểnh → dừng ngồi dựng ngó lại · tai úp ra sau khi sợ / nghỉ · RỬA MẶT: liếm 2 bàn tay xoa má, mũi · nghỉ trưa NẰM Ổ BÁNH MÌ
        //  (chân gập dưới bụng), an tâm thì LẬT NGHIÊNG NẰM (flop) · lúc rạng sáng / chạng vạng hay NHẢY VẶN MÌNH (binky) khi vui.
        //  ĐỢT 2 (G 23/10 "do research and study about rabbit, fish behaviour then improve its react and behaviour"): thỏ chạy về CHỖ NẤP chứ không chỉ chạy xa —
        //  mô hình "chạy đua giành mạng": con mồi chọn chỗ nấp cân giữa quãng chạy và việc phải chạy về phía kẻ săn (sóc xám, macmot); càng xa chỗ nấp càng bỏ chạy
        //  sớm (khoảng an toàn tăng theo quãng tới hang — chuột chũi đất, ~7,6 m); thỏ kiếm ăn toả quanh hang, càng xa hang càng ít gặm và cáo bắt được nhiều hơn
        //  (thỏ núi Etna) ⇒ kiếm ăn quanh gốc cây / gầm xe / gầm chuồng, xa chỗ nấp thì ngó canh nhiều hơn. CẢNH GIÁC trước (khoảng cảnh giác ≈ 1,6 × khoảng bỏ
        //  chạy): nằm im rồi ngồi dựng nhìn thẳng mối đe doạ; tới khoảng bỏ chạy mới dậm chân + chạy zíc-zắc về chỗ nấp, nằm nép 5–12 s rồi ló ra ngó. Chó (kẻ săn,
        //  chạy thì sợ hơn nữa) đáng sợ hơn người (macmot vàng: có chó ⇒ bỏ chạy xa hơn); máy cắt cỏ nổ như chó; QUEN NGƯỜI: kỹ sư đi qua nhiều lần không hại ⇒
        //  cho lại gần dần (thú vùng ven đô chịu người tới gần hơn), quên dần sau ~20 phút.
        //  Gọi trong vòng thỏ (loop/main-loop-rest.js) sau mưa + luống cà rốt; true = tự lo dáng.
        let BUN_REF = null;
        function bunRefuge(x, z, from, avoid) {   // chỗ nấp gần nhất: gốc cây (dưới tán), khe dưới hiên xe, gầm chuồng gà · from: tránh chỗ nấp nằm về phía mối đe doạ · avoid: chỗ chó nằm
          if (!BUN_REF) { BUN_REF = treeCoords.map(T => ({ x: T.x, z: T.z, r: 0.9 })); BUN_REF.push({ x: bunnyShelter.x, z: bunnyShelter.z, r: 0 }); for (const q of chickenCoop.under) BUN_REF.push({ x: q.x, z: q.z, r: 0 }); }
          let best = null, bc = 1e9;
          for (const R of BUN_REF) { const dx = R.x - x, dz = R.z - z, d = Math.hypot(dx, dz); if (d > 22) continue;
            let c = d; if (from && d > 0.8) { const fx = from.x - x, fz = from.z - z, fd = Math.hypot(fx, fz) || 1, cs = (dx * fx + dz * fz) / (d * fd);
              if (cs > 0.6) c += 3 * d * (cs - 0.6) / 0.4; if (Math.hypot(R.x - from.x, R.z - from.z) < 0.6 * d) c += 8; }   // phải chạy gần như về phía kẻ săn / kẻ săn tới chỗ nấp trước: phạt
            if (avoid) { const da = Math.hypot(R.x - avoid.x, R.z - avoid.z); if (da < 7) c += (7 - da) * 3; }   // chỗ nấp sát chỗ chó nằm: kém
            if (c < bc) { bc = c; best = R; } }
          return best;
        }
        function bunEscape(b, src) {   // điểm nấp: rìa gốc cây phía xa mối đe doạ (khuất sau thân) · khe xe / gầm chuồng: đúng điểm
          const R = bunRefuge(b.x, b.z, src, dogObj.visible !== false ? dogObj.position : null); if (!R || Math.hypot(R.x - b.x, R.z - b.z) > 18) return null;   // xa quá: chạy thẳng ra xa
          if (!R.r) return { x: R.x, z: R.z };
          const a = Math.atan2(R.z - src.z, R.x - src.x); return { x: R.x + Math.cos(a) * R.r, z: R.z + Math.sin(a) * R.r };
        }
        function bunnyDogNear(b, dt) {   // đang ở luống cà rốt (vòng thỏ gọi trước bunnyLife): chó dưới 4 m, hoặc dưới 7 m mà đang tiến lại ⇒ bỏ dở luống mà chạy
          const d = dogObj.position, dd = Math.hypot(d.x - b.x, d.z - b.z), ap = b.dd0 !== undefined && (b.dd0 - dd) / Math.max(dt, 1e-3) > 0.25; b.dd0 = dd;
          return dogObj.visible !== false && (dd < 4 || (dd < 7 && ap));
        }
        function bunnyLife(b, dt, t, gy) {
          const L = b.life || (b.life = { st: '', k: 0, d: 0, vt: 6 + 8 * Math.random(), zz: 0 }), hh = liveWeather.localHour, R = Math.random;
          const go = (st, d) => { L.st = st; L.k = 0; L.d = d; };
          const pose = (sit, low, paw, head, roll = 0) => {   // sit: ngả thân lên quanh bàn chân sau (rad) · low: hạ thân · roll: lật nghiêng (flop)
            const c = Math.cos(sit), s = Math.sin(sit), px = -0.2 * b.g.scale.x;
            b.g.rotation.set(roll, -b.ang, sit); b.g.position.set(b.x + Math.cos(b.ang) * px * (1 - c), gy - px * s - low, b.z + Math.sin(b.ang) * px * (1 - c));
            b.paws[0].rotation.z = b.paws[1].rotation.z = paw; b.head.rotation.z = head;
          };
          const hopTo = (ang, sp, f) => {   // nhảy theo hướng ang (vướng thì đổi hướng), trả độ nhấc
            b.hop = (b.hop + dt * f) % 1; const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5 * (sp > 3 ? 1.4 : 1); b.ang = ang;
            const nx = b.x + Math.cos(ang) * sp * dt, nz = b.z + Math.sin(ang) * sp * dt;
            if (bunOK(nx, nz) && (!b.col || colStepOK(b.col, b.x, b.z, nx, nz, ang))) { b.x = nx; b.z = nz; } else L.zz += 2.4;
            pose(0, -lift, -0.45 - lift * 0.4, 0); return lift;
          };
          if (!(L.rT > t)) { L.rT = t + 0.5; L.ref = bunRefuge(b.x, b.z, null, dogObj.visible !== false ? dogObj.position : null); L.dRef = L.ref ? Math.hypot(L.ref.x - b.x, L.ref.z - b.z) : 20; }   // chỗ nấp hợp nhất (0,5 s đo lại 1 lần)
          L.hab = Math.max(0, (L.hab || 0) - dt / 1200);   // quen người: quên dần (~20 phút hết)
          const dg = dogObj.position, dd = dogObj.visible !== false ? Math.hypot(dg.x - b.x, dg.z - b.z) : 99, E = engObj && !engObj.inVan ? engObj.g.position : null, ed = E ? Math.hypot(E.x - b.x, E.z - b.z) : 99;
          const dv = L.dgP ? Math.hypot(dg.x - L.dgP.x, dg.z - L.dgP.z) / Math.max(dt, 1e-3) : 0; (L.dgP || (L.dgP = new THREE.Vector3())).copy(dg);
          const cD = L.dd0 !== undefined ? (L.dd0 - dd) / Math.max(dt, 1e-3) : 0, cE = L.ed0 !== undefined ? (L.ed0 - ed) / Math.max(dt, 1e-3) : 0; L.dd0 = dd; L.ed0 = ed;   // tốc độ tiến lại (> 0: đang áp sát)
          L.apD = (L.apD || 0) + ((cD > 0.25 ? 1 : 0) - (L.apD || 0)) * Math.min(1, dt * 3); L.apE = (L.apE || 0) + ((cE > 0.25 ? 1 : 0) - (L.apE || 0)) * Math.min(1, dt * 3);
          const far = 1 + 0.08 * Math.min(12, L.dRef), roar = typeof trimKit !== 'undefined' && trimKit.eng.on;   // xa chỗ nấp ⇒ bỏ chạy sớm hơn · máy cắt cỏ đang nổ
          // khoảng bỏ chạy: chó / người — đang TIẾN LẠI mới đủ (đứng yên / đi xa: còn nửa; lao tới nhanh: ×1,4) — chó nằm nghỉ cạnh xe thì thỏ chỉ ngó canh
          const fD = 4.5 * (0.5 + 0.5 * L.apD) * (dv > 1.2 && L.apD > 0.5 ? 1.4 : 1) * far, fE = (roar ? 4.5 : 2.6 * (1 - 0.55 * L.hab) * (engObj && engObj.walking ? 0.5 + 0.5 * L.apE : 0.4)) * far;
          const kD = dd / fD, kE = ed / fE, thr = kD < 1.6 || kE < 1.6 ? (kD <= kE ? dg : E) : null, tk = Math.min(kD, kE);   // tk < 1: trong khoảng bỏ chạy · < 1,6: khoảng cảnh giác
          L.cd = (L.cd || 0) - dt;   // hồi sau 1 lần sợ: mối đe doạ đứng yên ngoài tầm thì ngồi ngó canh chừng, không giật mình lại liên tục
          const busy = b.state === 'dig' || b.state === 'eatCarrot';   // đang đào / gặm củ: chỉ bỏ dở khi mối đe doạ đã vào khoảng bỏ chạy
          if (thr && (L.cd <= 0 || tk < 1) && !/ale|thu|fle|hid/.test(L.st) && (!busy || tk < 1)) { if (busy) { b.carrot.visible = b.mound.visible = false; b.carrot.position.y = -0.1; b.state = 'sniff'; b.digTmr = 30; } L.byEng = thr === E; L.hi = 0; go('alert', 8); }
          const mid = hh >= 11 && hh < 15.5, peak = (hh >= 5.5 && hh < 8) || (hh >= 16.5 && hh < 18.5);
          if (!L.st && (b.state === 'sniff' || b.state === 'hop')) {
            if (mid) { let tb = null, bd = 12; for (const T of treeCoords) { const d = Math.hypot(T.x - b.x, T.z - b.z); if (d < bd) { bd = d; tb = T; } } if (tb) { L.to = { x: tb.x + (b.x - tb.x) / bd * 1.1, z: tb.z + (b.z - tb.z) / bd * 1.1 }; go('shade', 40); } else go('loaf', 90 + 60 * R()); }
            else if ((L.vt -= dt * (1 + 0.12 * Math.min(10, L.dRef))) <= 0) { L.vt = 6 + 10 * R(); go(R() < 0.15 ? 'groom' : 'look', 1.5 + 2.5 * R()); }   // xa chỗ nấp: ngó canh nhiều hơn
            else if (peak && b.state === 'hop' && R() < dt * 0.04) go('binky', 0.6);
          }
          if (!L.st) {   // kiếm ăn toả quanh chỗ nấp: đi xa quá 5 m thì các cú nhảy ngả dần về phía chỗ nấp
            if (b.state === 'hop' && L.ref && L.dRef > 5) { let da = Math.atan2(L.ref.z - b.z, L.ref.x - b.x) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += Math.max(-1.2 * dt, Math.min(1.2 * dt, da)); }
            if (b.state === 'hop' && dd < 2.2 * fD) { let da = Math.atan2(b.z - dg.z, b.x - dg.x) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += Math.max(-2 * dt, Math.min(2 * dt, da)); }   // "vùng sợ hãi": kiếm ăn giãn xa chỗ chó
            return false;
          }
          L.k += dt; const k = L.k; b.earB = 0; b.earY = 0; b.noseF = 3; b.tail.position.y = 0.5;
          switch (L.st) {
            case 'alert': {   // cảnh giác: nằm im 0,5 s rồi ngồi dựng quay mặt nhìn mối đe doạ, tai dựng, mũi hít nhanh — vào khoảng bỏ chạy mới chạy
              const src = thr || L.from || dg; if (thr) (L.from || (L.from = new THREE.Vector3())).copy(thr);
              let da = Math.atan2(src.z - b.z, src.x - b.x) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); if (k > 0.5) b.ang += Math.max(-2 * dt, Math.min(2 * dt, da));
              if (k < 0.5) { pose(0, 0.04, 0, -0.1); b.earB = 0.4; } else { pose(0.55, 0, -0.9, -0.05); b.earB = -0.25; } b.noseF = 8;
              if (thr && tk < 1) { L.cd = 4; L.hab = Math.min(0.8, L.hab + (L.byEng ? 0.05 : 0)); L.to = bunEscape(b, src); go(tk > 0.65 ? 'thump' : 'flee', tk > 0.65 ? 0.35 : 6); }   // đã đủ gần: báo động rồi chạy (gần quá thì chạy luôn)
              else if (!thr) { if ((L.hi += dt) > 2) { if (L.byEng) L.hab = Math.min(0.8, L.hab + 0.1); L.cd = 4; go('look', 1.5); } }   // mối đe doạ đi khỏi: quen thêm một chút
              else { L.hi = 0; if (k > 3 && (thr === dg ? L.apD : L.apE) < 0.3) { L.cd = 5; go('avoid', 2 + R()); } else if (k > L.d) { L.cd = 6; go('look', 2); } }   // canh mãi mà nó không tới: lảng ra chỗ khác
              break;
            }
            case 'avoid': { const src = L.from || dg; hopTo(Math.atan2(b.z - src.z, b.x - src.x) + 0.4 * Math.sin(k * 2) + L.zz, 2.6, 3.2); b.earB = 0.3; if (k > L.d) { L.zz = 0; go('look', 1.5); } break; }   // nhảy thong thả ra xa
            case 'thump': pose(0, 0.05 * Math.sin(Math.PI * Math.min(1, k / L.d)), 0, -0.1); b.earB = 1; if (k > L.d) go('flee', 6); break;   // dậm chân sau báo động
            case 'flee': {   // chạy zíc-zắc về chỗ nấp (không có chỗ nấp gần thì chạy thẳng ra xa), đuôi trắng vểnh
              const src = L.from || dg, T = L.to, dx = T ? T.x - b.x : 0, dz = T ? T.z - b.z : 0, home = T && (Math.hypot(dx, dz) < 0.5 || (Math.hypot(dx, dz) < 1.6 && L.zz > 4));   // tới chỗ nấp (vướng thân cây sát đích cũng coi như tới)
              if (T && !home) L.zz *= Math.exp(-dt * 2.5);   // vướng thì né lệch đi, rồi ngoặt dần về chỗ nấp
              const a = (T ? Math.atan2(dz, dx) : Math.atan2(b.z - src.z, b.x - src.x)) + (Math.hypot(dx, dz) > 1 || !T ? (Math.floor(k / 0.4) % 2 ? 0.45 : -0.45) : 0) + L.zz;
              hopTo(a, T && Math.hypot(dx, dz) < 1 ? 3 : 6.5, 5); b.earB = 1; b.tail.position.y = 0.66;
              if (home || k > L.d || (!T && k > 2.6)) { L.zz = 0; L.cd = 4; if (home) go('hide', 5 + 7 * R()); else { b.ang = a + Math.PI; go('look', 2 + R()); } }
              break;
            }
            case 'hide': { pose(0, 0.07, 0.5, 0.12); b.earB = 1; b.noseF = 5; const src = L.from || dg; if (k > L.d && !(thr && (tk < 0.6 || (tk < 1.2 && (thr === dg ? L.apD : L.apE) > 0.5)))) { b.ang = Math.atan2(src.z - b.z, src.x - b.x); go('peek', 2 + 1.5 * R()); } break; }   // nằm nép sát đất, tai úp
            case 'peek': pose(0.45, 0, -0.8, -0.05); b.earB = -0.2; b.earY = 0.6; b.noseF = 7; if (k > L.d) go('', 0); break;   // ló ra ngồi dựng ngó
            case 'look': pose(0.55, 0, -0.9, -0.1); b.earB = -0.2; b.earY = 0.5; b.noseF = 6; if (k > L.d) go(R() < 0.12 ? 'groom' : '', 4 + 2 * R()); break;   // ngồi dựng ngó quanh
            case 'groom': pose(0.4, 0, -1.3 + 0.35 * Math.sin(t * 9), 0.15 * Math.sin(t * 4.5)); b.paws[1].rotation.z = -1.3 + 0.35 * Math.sin(t * 9 + 3.1); b.earB = 0.3; if (k > L.d) go('', 0); break;   // rửa mặt
            case 'shade': { const dx = L.to.x - b.x, dz = L.to.z - b.z; if (Math.hypot(dx, dz) < 0.3 || k > L.d) go('loaf', 90 + 60 * R()); else hopTo(Math.atan2(dz, dx) + L.zz, 1.6, 3); break; }
            case 'loaf': case 'flop': {   // nằm ổ bánh mì · lật nghiêng (flop) khi an tâm; hết trưa thì dậy
              const fl = L.st === 'flop' ? Math.min(1, k / 0.4) * Math.min(1, (L.d - k) / 0.6 + 0.0001) : 0;
              pose(0, 0.05 + 0.04 * fl, 0.5, 0.1, 1.25 * Math.max(0, fl)); b.earB = 0.6; b.noseF = 1;
              if (k > L.d) { if (mid && L.st === 'loaf' && R() < 0.2) go('flop', 25 + 20 * R()); else if (mid) go('loaf', 90 + 60 * R()); else go('look', 2); }
              break;
            }
            case 'binky': { b.hop = 0; const u = k / L.d, lift = Math.sin(Math.PI * Math.min(1, u)) * 0.9; pose(0, -lift, -0.6, 0.2 * Math.sin(u * 12), 0.6 * Math.sin(u * TAU)); b.earY = 0.8; if (k > L.d) go('', 0); break; }   // nhảy vặn mình
          }
          if (!L.st) { b.g.rotation.set(0, -b.ang, 0); b.state = 'sniff'; b.tmr = 1 + R() * 2; b.earB = b.earY = 0; b.noseF = 3; }
          return true;
        }
