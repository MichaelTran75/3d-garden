        // ===== HANG THỎ (G 30/10 "tạo hang thỏ ở vị trí này, … tối về thỏ vào đây đầu thỏ hướng ra ngoài hang") =====
        //  Miệng hang khoét ở vách bậc đất phía tây chuồng gà (toạ độ trang x59,7 z92,4 — vách mặt đông của bậc cao 0,6 m, đo bằng tia từ ảnh G), quay +x.
        //  Khối địa hình không khoét được ⇒ miệng hang là đĩa tối loang dần ra mép (tối sâu ở giữa) + gờ đất cong trên miệng + rễ cây thòng xuống + ụ đất
        //  đào ra trước cửa (thỏ thật đẩy đất ra thành dải trước hang) — thân thỏ lùi vào vách bị chính khối đất che, chỉ đầu + 2 tay trước thò ra.
        //  Lịch: 18:00 (trước giờ thú ban ngày nghỉ 18:30) bỏ mọi việc, nhảy về cửa hang theo bảng loang → quay đầu chui vào → khuất trong hang quay mình
        //  → bò ra nằm ổ bánh mì ở miệng hang, ĐẦU HƯỚNG RA NGOÀI (tai úp, mũi khụt khịt, thỉnh thoảng ngóc đầu dựng tai nghe ngóng) — sáng (thú dậy 06:00)
        //  bò ra khỏi hang rồi kiếm ăn như thường. Thỏ không còn ẩn ban đêm cùng nhóm "Động vật ban ngày" (animals/insects.js) mà ở nhóm "Thỏ" riêng ----
        const bunnyRoot = new THREE.Group(); bunnyRoot.name = 'Thỏ'; scene.add(bunnyRoot);
        for (const b of bunnies) bunnyRoot.attach(b.g);
        const bunnyBurrow = (() => {
          const FX = X0 + 59.7, FZ = Z0 + 92.4, gY = cowY(FX + 0.3, FZ);   // mặt vách (ranh 2 ô, bậc cao 7,2 phía tây · nền 6,6 phía đông)
          const g = new THREE.Group(); g.name = 'Hang thỏ'; g.position.set(FX, gY, FZ); scene.add(g);
          const mouth = new THREE.Group(); mouth.rotation.y = Math.PI / 2; g.add(mouth);   // mặt phẳng XY cục bộ = mặt vách, +z cục bộ = +x thế giới (ra ngoài)
          const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
          const gr = c.createRadialGradient(64, 70, 4, 64, 64, 64);
          gr.addColorStop(0, 'rgba(10,6,4,1)'); gr.addColorStop(0.55, 'rgba(26,17,11,1)'); gr.addColorStop(0.8, 'rgba(58,40,27,0.95)'); gr.addColorStop(1, 'rgba(78,56,38,0)');
          c.fillStyle = gr; c.fillRect(0, 0, 128, 128);
          const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
          const hole = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshLambertMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
          hole.scale.set(0.2, 0.18, 1); hole.position.set(0, 0.14, 0.004); mouth.add(hole);   // đáy elip chìm dưới nền ⇒ miệng hang đáy bằng
          const soil = new THREE.MeshLambertMaterial({ color: 0x5c4331, flatShading: true }), soilLt = new THREE.MeshLambertMaterial({ color: 0x86705a, flatShading: true });
          const rim = new THREE.Mesh(new THREE.TorusGeometry(1, 0.13, 6, 22, Math.PI * 1.16), soil);
          rim.rotation.z = -Math.PI * 0.08; rim.scale.set(0.215, 0.195, 0.45); rim.position.set(0, 0.14, 0.012); mouth.add(rim);   // gờ đất vòng cung trên miệng, 2 chân cắm xuống nền
          const heap = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 8, 0, TAU, 0, Math.PI / 2), soilLt);
          heap.scale.set(0.24, 0.05, 0.21); heap.position.set(0.24, -0.004, 0); heap.receiveShadow = true; g.add(heap);   // ụ đất đẩy ra trước cửa
          for (const [x, z, r] of [[0.44, 0.15, 0.026], [0.5, -0.1, 0.02], [0.36, -0.2, 0.022], [0.55, 0.04, 0.016]]) { const k = new THREE.Mesh(new THREE.DodecahedronGeometry(r, 0), soil); k.position.set(x, r * 0.4, z); k.rotation.set(x * 9, z * 7, x * z * 13); g.add(k); }   // cục đất vụn
          for (const [z, y1, bend] of [[0.07, 0.17, 0.03], [-0.1, 0.21, -0.02]]) {   // rễ cây thòng qua mép trên
            const crv = new THREE.CatmullRomCurve3([new THREE.Vector3(0.006, 0.33, z), new THREE.Vector3(0.03, 0.28, z + bend), new THREE.Vector3(0.022, y1, z + bend * 0.4)]);
            g.add(new THREE.Mesh(new THREE.TubeGeometry(crv, 8, 0.005, 4, false), new THREE.MeshLambertMaterial({ color: 0x4a382a })));
          }
          g.scale.setScalar(1.15);   // G 31/10 "hang thỏ to thêm 15%": cả miệng hang, gờ, rễ, ụ đất phình quanh mặt vách
          g.traverse(o => { if (o.isMesh) { o.userData.noCollide = true; o.castShadow = false; } });
          const door = new THREE.Vector3(FX + 0.63, gY, FZ);   // ngoài mép ụ đất (0,48 × 1,15)
          return { g, fx: FX, z: FZ, y: gY, door, field: buildFlowField(door.x, door.z) };
        })();
        // Zzz của thỏ (G 31/10 "thỏ ngủ có chữ Zzz khi về hang"): như Zzz của chó (animals/rain-shelter.js) nhưng nhỏ + bay thấp theo cỡ thỏ,
        //  mỗi con 3 chữ z bay lên từ đầu khi nằm ngủ ở miệng hang · tắt lúc ngóc đầu nghe ngóng, bò ra hay chưa về hang
        const bunZzzGroup = new THREE.Group(); bunZzzGroup.name = 'Zzz của thỏ'; scene.add(bunZzzGroup);
        const bunZTex = (() => {
          const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d');
          ctx.font = 'bold 48px Outfit, sans-serif'; ctx.fillStyle = '#E2D6C0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#243240'; ctx.shadowBlur = 6; ctx.fillText('z', 32, 34);
          return new THREE.CanvasTexture(c);
        })();
        const _bunHead = new THREE.Vector3();
        function bunnyZzz(b, on, t) {
          if (!b.zzz) {
            if (!on) return;
            const g = new THREE.Group(); bunZzzGroup.add(g); b.zzz = { g, z: [] };
            for (let n = 0; n < 3; n++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: bunZTex, transparent: true, opacity: 0, depthWrite: false })); g.add(sp); b.zzz.z.push({ m: sp, ph: n / 3 }); }
          }
          b.zzz.g.visible = on; if (!on) return;
          b.head.getWorldPosition(_bunHead);
          for (const z of b.zzz.z) { const k = (t * 0.3 + z.ph) % 1; z.m.position.set(_bunHead.x + 0.04 + k * 0.12, _bunHead.y + 0.08 + k * 0.55, _bunHead.z + Math.sin(t * 1.6 + z.ph * 6) * 0.04); z.m.material.opacity = 0.9 * Math.min(1, (1 - k) * 2.6); z.m.scale.setScalar(0.06 + k * 0.12); }
        }
        function bunnyHome(b, dt, t) {   // true = đang về hang / trong hang / chui ra (tự lo dáng) · gọi đầu bunnyTick (animals/bunny/body.js)
          const H = bunnyBurrow, hh = liveWeather.localHour, night = !liveWeather.wildlifeAwake || hh >= 18;
          if (night && !b.home) {
            b.home = 'go'; b.homeT = 0; b.shelter = null; if (b.bed) bunnyBedCancel(b); bunnyDropCarrot(b); bunnyUpright(b);
            if (b.life) b.life.st = ''; if (b.state === 'dig' || b.state === 'eatCarrot') { b.state = 'sniff'; b.digTmr = 30; } b.mound.visible = false;
          } else if (!night && b.home && b.home !== 'out') { if (b.home === 'go') { b.home = null; return false; } b.home = 'out'; }   // trời sáng mà chưa tới hang: thôi về
          if (!b.home) { if (b.zzz) bunnyZzz(b, false, t); return false; }
          b.homeT += dt; const R = Math.random;
          const sit = (x, low, paw, head) => { b.g.position.set(x, H.y - low, H.z); b.g.rotation.set(0, -b.ang, 0); b.paws[0].rotation.z = b.paws[1].rotation.z = paw; b.head.rotation.z = head; };
          const hopX = (to, sp, f) => {   // nhảy dọc trục hang tới x = to (độ cao nền ngoài cửa, xuyên vách)
            b.hop = (b.hop + dt * f * BUN_CAD) % 1; const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.35, dx = to - b.x;
            b.x += Math.sign(dx) * Math.min(Math.abs(dx), sp * dt * (0.5 + lift)); b.z += (H.z - b.z) * Math.min(1, dt * 4);
            b.g.position.set(b.x, H.y + lift, b.z); b.g.rotation.set(0, -b.ang, bunnyHopPitch(b)); b.paws[0].rotation.z = b.paws[1].rotation.z = bunnyHopPaw(b); b.head.rotation.z = 0;
            return Math.abs(to - b.x) < 0.01;
          };
          b.earY = 0; b.noseF = 3;
          switch (b.home) {
            case 'go': {   // nhảy về cửa hang theo bảng loang (như trú mưa) · kẹt / quá lâu (tua giờ) thì đặt thẳng trước cửa
              const dx = H.door.x - b.x, dz = H.door.z - b.z, dd = Math.hypot(dx, dz);
              if (dd < 0.15 || b.homeT > 300) { b.x = H.door.x; b.z = H.door.z; b.hop = 0; b.home = 'in'; b.homeT = 0; break; }
              let ux = dx / dd, uz = dz / dd;
              if (dd > 1.5) { const f = ffDir(H.field, b.x, b.z); if (f) { ux = f.x; uz = f.z; } }
              let da = Math.atan2(uz, ux) - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += dd < 1 ? da : da * Math.min(1, dt * 6);
              b.hop = (b.hop + dt * 3.6 * BUN_CAD) % 1; const lift = Math.max(0, Math.sin(b.hop * Math.PI)) * 0.5, step = Math.min(dd, b.spd * 1.25 * dt * (0.5 + lift));
              const mv = b.col ? colSlide(b.col, b.x, b.z, b.ang, step, dt) : [b.x + Math.cos(b.ang) * step, b.z + Math.sin(b.ang) * step]; if (mv) { b.x = mv[0]; b.z = mv[1]; }
              b.g.position.set(b.x, cowY(b.x, b.z) + lift, b.z); b.g.rotation.set(0, -b.ang, bunnyHopPitch(b));
              b.paws[0].rotation.z = b.paws[1].rotation.z = bunnyHopPaw(b); b.head.rotation.z = 0;
              break;
            }
            case 'in': {   // trước cửa: ngồi ngó quanh 1 chút, quay đầu vào vách rồi chui vào
              let da = Math.PI - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da));
              if (b.homeT < 1.2) { sit(b.x, 0, -0.6, -0.1); b.earB = -0.2; b.earY = 0.5; b.noseF = 6; break; }
              if (Math.abs(da) > 0.05) { b.ang += Math.sign(da) * Math.min(Math.abs(da), 3 * dt); sit(b.x, 0, 0, -0.1); break; }
              b.ang = Math.PI; b.earB = 0.5; if (hopX(H.fx - 0.5, 0.8, 3.2)) { b.home = 'turn'; b.homeT = 0; }
              break;
            }
            case 'turn': b.g.position.set(b.x, H.y - 0.03, b.z); if (b.homeT > 1.5) { b.ang = 0; b.g.rotation.set(0, 0, 0); b.home = 'creep'; b.homeT = 0; } break;   // khuất trong hang: quay mình
            case 'creep': {   // bò lên miệng hang, đầu ra ngoài
              const to = H.fx - 0.08; b.x = Math.min(to, b.x + 0.12 * dt); sit(b.x, 0.03, 0.3, 0.05 * Math.sin(b.homeT * 6)); b.earB = 0.3; b.noseF = 6;
              if (b.x >= to) { b.home = 'den'; b.homeT = 0; b.lookT = 6 + 10 * R(); }
              break;
            }
            case 'den': {   // nằm ổ bánh mì ở miệng hang: tai úp, mũi khụt khịt chậm · thỉnh thoảng ngóc đầu dựng tai nghe ngóng 2–3 s
              const look = b.homeT > b.lookT && b.homeT < b.lookT + 2.5;
              if (b.homeT > b.lookT + 2.5) { b.homeT = 0; b.lookT = 8 + 16 * R(); }
              sit(b.x, look ? 0.01 : 0.03, 0.5, look ? 0.08 : 0.14); b.earB = look ? -0.15 : 0.65; b.earY = look ? 0.6 : 0; b.noseF = look ? 7 : 1.5;
              bunnyZzz(b, !look, t);
              break;
            }
            case 'out': {   // sáng: (đang ở trong) bò ra, nhảy ra khỏi bãi đất trước cửa rồi kiếm ăn như thường
              b.ang = 0; b.earB = 0; if (hopX(H.door.x + 0.6, 0.9, 3.2)) { b.home = null; b.state = 'sniff'; b.tmr = 2 + R() * 2; b.g.rotation.set(0, 0, 0); }
              break;
            }
          }
          if (b.home !== 'den' && b.zzz) bunnyZzz(b, false, t);
          bunnyEars(b, dt, t);
          return true;
        }
        worldJoin('drawBatch', 50, B => B.draws('Thỏ', [bunnyRoot]));   // gộp lượt vẽ (core/draw-batch.js) — đêm vẫn hiện: nằm ở miệng hang
