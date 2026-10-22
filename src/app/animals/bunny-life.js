        // ===== THỎ THEO TẬP TÍNH (G 20/10 "do research về thỏ n its behaviour, then improve and apply") =====
        //  Nghiên cứu: hoạt động 2 đỉnh RẠNG SÁNG + CHẠNG VẠNG, trưa nóng rút vào bóng mát nghỉ (bẫy ảnh thỏ lùn — Brachylagus, 5 điểm, mọi mùa); thỏ đi một mình
        //  kiếm ăn sát chỗ nấp, có nguy cơ thì cảnh giác + chạy nhiều hơn hẳn (Doñana 1997; Sierra Norte 2024 — rào chắn thú săn) · kiếm ăn kiểu GẶM – NHẢY 1–2
        //  cú – GẶM, xen ngồi dựng trên 2 chân sau ngó quanh (tai dựng xoay dò tiếng, mũi hít nhanh) · gặp nguy: ĐỨNG IM đánh giá → DẬM CHÂN SAU báo động →
        //  CHẠY ZÍC-ZẮC, đuôi trắng vểnh → dừng ngồi dựng ngó lại · tai úp ra sau khi sợ / nghỉ · RỬA MẶT: liếm 2 bàn tay xoa má, mũi · nghỉ trưa NẰM Ổ BÁNH MÌ
        //  (chân gập dưới bụng), an tâm thì LẬT NGHIÊNG NẰM (flop) · lúc rạng sáng / chạng vạng hay NHẢY VẶN MÌNH (binky) khi vui.
        //  Chó lại gần < 5 / kỹ sư đang đi < 3 ⇒ chuỗi sợ. Gọi trong vòng thỏ (loop/main-loop-rest.js) sau mưa + luống cà rốt; true = tự lo dáng.
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
          const dg = dogObj.position, dd = Math.hypot(dg.x - b.x, dg.z - b.z), E = engObj && !engObj.inVan ? engObj.g.position : null, ed = E ? Math.hypot(E.x - b.x, E.z - b.z) : 99;
          const thr = dd < 5 ? dg : ed < 3 && engObj.walking ? E : null;
          L.cd = (L.cd || 0) - dt;   // hồi sau 1 lần sợ: mối đe doạ đứng yên ngoài tầm thì ngồi ngó canh chừng, không giật mình lại liên tục
          if (thr && L.cd <= 0 && !/fre|thu|fle/.test(L.st) && b.state !== 'dig' && b.state !== 'eatCarrot') go('freeze', 0.8 + 0.5 * R());
          const mid = hh >= 11 && hh < 15.5, peak = (hh >= 5.5 && hh < 8) || (hh >= 16.5 && hh < 18.5);
          if (!L.st && (b.state === 'sniff' || b.state === 'hop')) {
            if (mid) { let tb = null, bd = 12; for (const T of treeCoords) { const d = Math.hypot(T.x - b.x, T.z - b.z); if (d < bd) { bd = d; tb = T; } } if (tb) { L.to = { x: tb.x + (b.x - tb.x) / bd * 1.1, z: tb.z + (b.z - tb.z) / bd * 1.1 }; go('shade', 40); } else go('loaf', 90 + 60 * R()); }
            else if ((L.vt -= dt) <= 0) { L.vt = 6 + 10 * R(); go(R() < 0.15 ? 'groom' : 'look', 1.5 + 2.5 * R()); }
            else if (peak && b.state === 'hop' && R() < dt * 0.04) go('binky', 0.6);
          }
          if (!L.st) return false;
          L.k += dt; const k = L.k; b.earB = 0; b.earY = 0; b.noseF = 3; b.tail.position.y = 0.5;
          switch (L.st) {
            case 'freeze': pose(0, 0.03, 0, -0.1); b.earB = 1; b.noseF = 8; if (k > L.d) { if (thr && Math.hypot(thr.x - b.x, thr.z - b.z) < 4.5) go('thump', 0.35); else { L.cd = 5; go('look', 2.5); } } break;   // đứng im đánh giá
            case 'thump': pose(0, 0.05 * Math.sin(Math.PI * Math.min(1, k / L.d)), 0, -0.1); b.earB = 1; if (k > L.d) { L.from = thr || dg; go('flee', 2.2 + R()); } break;   // dậm chân sau
            case 'flee': {   // chạy zíc-zắc ra xa, đuôi trắng vểnh
              const a = Math.atan2(b.z - L.from.z, b.x - L.from.x) + (Math.floor(k / 0.4) % 2 ? 0.5 : -0.5) + L.zz;
              hopTo(a, 6.5, 5); b.earB = 1; b.tail.position.y = 0.66; if (k > L.d) { b.ang = a + Math.PI; L.zz = 0; L.cd = 4; go('look', 2 + R()); }
              break;
            }
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
