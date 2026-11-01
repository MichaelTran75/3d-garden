        // ---- BẾP CỦA XE (dời nguyên văn từ engineer/tasks/cooking.js 01/11): lửa ga nhảy nhẹ, hơi nồi + tô udon trong xe, đèn + quạt máy hút mùi, khói ống bếp —
        //      xe tự chạy theo lửa đang cháy + món người báo (VAN.dish); người chỉ vặn núm, nhấc nồi, hất chảo (VAN.kitchen). Mỗi khung trong vanLateTick (đầu
        //      loop/main-loop-rest.js, ngay sau lượt người, trước bước mô phỏng khói fluids.update — như khi còn nằm trong lượt người) ----
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
        let ventRun = 0;
        function galleyTick(dt, t) {   // lửa ga nhảy nhẹ · hơi nước bốc từ nồi + tô udon (mặt đá, bàn ăn) · quạt hút + khói ống khói
          VK.flames.forEach((f, i) => { if (!f.visible) return; const k = 1 + Math.sin(t * 23 + i * 1.7) * 0.05 + Math.sin(t * 37 + i) * 0.04; f.scale.set(k, 1 + Math.sin(t * 29 + i * 2.3) * 0.35, k); });
          const st = VK.steam, ud = VDISH.kind === 'udon' ? 0.35 + 0.65 * VDISH.food : 1;   // tô càng vơi (ăn lâu) càng nguội, ít hơi
          for (const b of [VK.counterBowl, VIN.tableUdon]) udonSteam(t, b, ud);   // tô trên tay người: người tự toả (engineer/mind/loop-update.js)
          for (const p of VK.potSteam) {
            p.m.visible = st > 0.02; if (!p.m.visible) continue;
            const k = (t * 0.45 + p.ph) % 1;
            p.m.position.set(Math.sin(t * 1.3 + p.ph * 6) * 0.02, 0.12 + k * 0.35, Math.cos(t * 1.1 + p.ph * 5) * 0.02); p.m.scale.setScalar(0.6 + k * 1.4); p.m.material.opacity = 0.32 * st * Math.sin(Math.PI * k);
          }
          const lit = VK.flames.some(f => f.visible), fry = lit && VK.stovePan.visible && VK.stovePan.userData.food.visible;
          ventRun = lit ? 25 : Math.max(0, ventRun - dt);
          VK.hoodLamp.material.color.setHex(ventRun > 0 ? 0xfff1c9 : 0x8a8578);
          const heat = lit ? Math.max(0.35, st, fry ? 1 : 0) : 0.12 * ventRun / 25;   // còn hơi trong ống sau khi tắt lửa
          const VS = ventSmoke; VS.on = heat > 0.01;   // khói ống bếp theo độ nóng: nhiệt, lượng khói, sức đẩy quạt hút; màu hơi trắng → khói dầu xám khi chiên
          if (VS.on) { caravanObj.localToWorld(VS.base.copy(caravanObj.userData.chimneyTop)); VS.base.y -= 0.02 * caravanObj.getWorldScale(ventTop).y;
            // khí thải còn nóng. G 16/10: lượng khói −70% (số hạt thả ra × 0,3); bốc nhờ hơi nóng như lửa trại (draft 0 — dòng "VS.draft = …" cũ bị nuốt vào
            // chú thích nên chưa từng chạy); màu xám khói như lửa trại, ngả trắng hơi nước khi luộc / nấu, gần như xám hẳn khi chiên
            VS.heat = 0.8 + 0.5 * heat; VS.smoke = 1 + 0.5 * heat; VS.rate = 0.3 * (0.25 + 0.6 * heat); VS.draft = 0;
            plumeLight(VS, _plumeSmokeC.copy(PLUME_COL.smoke).lerp(PLUME_COL.steam, fry ? 0.05 : 0.3), PLUME_COL.steam, _plumeGlow.setRGB(0, 0, 0)); }
        }
