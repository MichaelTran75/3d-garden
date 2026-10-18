        // ===== CHUỒNG GÀ NHỎ cho 3 gà mái (G 18/10 "add chuồng gà nhỏ tại x61 z91 cho 3 con gà, make it 75% transparent, only line border art visible 100%") =====
        //  Đặt ở toạ độ trang (61,4; 91) — trang hiện X = x − X0, Z = z − Z0 — trên khoảnh đất phẳng giữa bậc cao (tây) và bậc thấp (đông); cửa chui quay về
        //  nam–đông nam (về phía trại / bãi kiếm ăn). Kiểu chuồng gà sân vườn: nhà gỗ 1,0 × 0,7 m trên 4 chân cao 0,5 m (gà 0,44 m chui gầm trú mưa / nắng
        //  được), mái tôn 2 mái chữ Λ, cửa chui 0,26 × 0,34 m sát sàn có CỬA TỰ ĐỘNG trượt dọc (mở lúc mặt trời mọc, đóng khi cả 3 con đã lên sào), cầu
        //  thang ván 0,22 m dốc 34° (dài 0,8 m) có nẹp ngang chống trượt, sào đậu Ø 3,6 cm cao 0,26 m trên sàn (3 chỗ), ổ đẻ chìa hông trái có rơm.
        //  Vật liệu như hộp tổ chim sẻ: ván thông vân gỗ — mặt 25% (75% trong suốt, thấy gà ngủ bên trong), nét viền đen 100%. Gà: animals/chickens.js ----
        const chickenCoop = (() => {
          const PX = X0 + 61.4, PZ = Z0 + 91.0, YAW = 0.42, gY = cowY(PX, PZ);
          const g = new THREE.Group(); g.name = 'Chuồng gà (Chicken coop)'; g.position.set(PX, gY, PZ); g.rotation.y = YAW; scene.add(g);
          const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
          c.fillStyle = '#c99a62'; c.fillRect(0, 0, 128, 128);
          for (let k = 0; k < 70; k++) { const x = Math.random() * 128; c.strokeStyle = `rgba(${Math.random() < 0.5 ? '125,80,40' : '232,190,135'},${0.25 + Math.random() * 0.3})`; c.lineWidth = 0.6 + Math.random() * 1.3; c.beginPath(); c.moveTo(x, 0); c.bezierCurveTo(x + 4, 40, x - 4, 88, x + 2, 128); c.stroke(); }
          const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace;
          const see = (m, o = 0.25) => Object.assign(m, { transparent: true, opacity: o, depthWrite: false, side: THREE.DoubleSide });   // mặt 25%, nét viền giữ 100%
          const wood = see(new THREE.MeshLambertMaterial({ map: tx })), tin = see(new THREE.MeshLambertMaterial({ color: 0x8a3b2f })), straw = see(new THREE.MeshLambertMaterial({ color: 0xd9b45a }), 0.45);
          const pnl = (w, h, d, x, y, z, m = wood) => { const o = bx(w, h, d, m, false, true, lineDark); o.position.set(x, y, z); g.add(o); return o; };
          const LEG = 0.5, W = 1.0, D = 0.7, H = 0.55, th = 0.02, FY = LEG + 0.03, PEAK = 0.22;   // FY: mặt sàn · chân 0,5 m: gà (to thêm 10%, cao ~0,46 m) vẫn chui gầm
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) pnl(0.06, LEG, 0.06, sx * (W / 2 - 0.03), LEG / 2, sz * (D / 2 - 0.03));   // 4 chân
          pnl(W, 0.03, D, 0, LEG + 0.015, 0);   // sàn
          pnl(W, H, th, 0, FY + H / 2, -D / 2 + th / 2);   // vách sau
          const HOLE = { x: 0.27, w: 0.26, h: 0.34 };   // cửa chui cho gà 0,44 m (cúi đầu khi qua, như chuồng thật 30–35 cm)
          {   // vách trước có cửa chui sát sàn (lệch phải)
            const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(W / 2, H); sh.lineTo(-W / 2, H); sh.closePath();
            const hole = new THREE.Path(); hole.moveTo(HOLE.x - HOLE.w / 2, 0.01); hole.lineTo(HOLE.x - HOLE.w / 2, HOLE.h); hole.lineTo(HOLE.x + HOLE.w / 2, HOLE.h); hole.lineTo(HOLE.x + HOLE.w / 2, 0.01); hole.closePath(); sh.holes.push(hole);
            const fg = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); fg.translate(0, FY, D / 2 - th);
            const f = new THREE.Mesh(fg, wood); edge(f, fg, lineDark); g.add(f);
          }
          for (const s of [-1, 1]) {   // 2 vách hồi có đỉnh nhọn đỡ nóc
            const sh = new THREE.Shape(); sh.moveTo(-D / 2, 0); sh.lineTo(D / 2, 0); sh.lineTo(D / 2, H); sh.lineTo(0, H + PEAK); sh.lineTo(-D / 2, H); sh.closePath();
            const sg = new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }); sg.rotateY(Math.PI / 2); sg.translate(s * (W / 2) - (s > 0 ? th : 0), FY, 0);
            const m = new THREE.Mesh(sg, wood); edge(m, sg, lineDark); g.add(m);
          }
          {   // mái tôn 2 mái chữ Λ: nóc dọc trục x, chìa 6 cm mỗi đầu hồi và 8 cm ở mép mái
            const run = D / 2 + 0.08, ang = Math.atan2(PEAK, D / 2), len = run / Math.cos(ang);
            for (const s of [-1, 1]) { const r = pnl(W + 0.12, 0.015, len, 0, FY + H + PEAK - Math.tan(ang) * run / 2 + 0.014, s * run / 2, tin); r.rotation.x = s * ang; }
          }
          const perchY = FY + 0.26;
          { const p = cyl(0.018, 0.018, W - 0.06, see(new THREE.MeshLambertMaterial({ color: 0x8c6a45 })), false, true, lineDark, 8); p.rotation.z = Math.PI / 2; p.position.set(0, perchY - 0.018, -0.08); g.add(p);
            for (const sx of [-1, 1]) pnl(0.04, perchY - FY, 0.04, sx * (W / 2 - 0.05), FY + (perchY - FY) / 2 - 0.02, -0.08); }   // sào đậu + 2 cột đỡ
          {   // ổ đẻ chìa hông trái (ngoài vách hồi −x): hộp + nắp dốc + rơm
            const nx = -W / 2 - 0.14; pnl(0.26, 0.24, 0.4, nx, FY + 0.12, -0.02); const lid = pnl(0.3, 0.015, 0.44, nx, FY + 0.27, -0.02, tin); lid.rotation.z = 0.32;
            pnl(0.22, 0.05, 0.36, nx, FY + 0.03, -0.02, straw);
          }
          // cầu thang: từ ngưỡng cửa chui xuống đất trước chuồng, ván + nẹp ngang cách 11 cm
          const RAMP_L = 0.8, rampAng = Math.atan2(FY, RAMP_L), rampLen = Math.hypot(FY, RAMP_L), ramp = new THREE.Group(); g.add(ramp);
          ramp.position.set(HOLE.x, FY, D / 2); ramp.rotation.x = rampAng;   // trục +z cục bộ đi xuống dọc ván
          { const plank = bx(0.22, 0.02, rampLen, wood, false, true, lineDark); plank.position.set(0, -0.01, rampLen / 2); ramp.add(plank);
            for (let s = 0.08; s < rampLen - 0.04; s += 0.11) { const cl = bx(0.2, 0.014, 0.02, wood, false, true, lineDark); cl.position.set(0, 0.006, s); ramp.add(cl); } }
          // cửa tự động trượt dọc trong 2 ray (mặt trong vách trước): 0 = đóng, 1 = mở
          const door = bx(HOLE.w + 0.03, HOLE.h + 0.02, 0.012, wood, false, true, lineDark); door.userData.noBatch = true; g.add(door);
          for (const s of [-1, 1]) pnl(0.015, H * 0.95, 0.025, HOLE.x + s * (HOLE.w / 2 + 0.025), FY + H * 0.475, D / 2 - th - 0.015);
          const C = { g, door, open: 1, want: 1, FY, perchY, YAW, H, W, D, LEG };
          const L2W = (x, y, z) => g.localToWorld(new THREE.Vector3(x, y, z));
          g.updateMatrixWorld(true);
          C.rampFoot = L2W(HOLE.x, 0, D / 2 + RAMP_L + 0.12); C.rampFoot.y = cowY(C.rampFoot.x, C.rampFoot.z);
          C.rampTop = L2W(HOLE.x, FY, D / 2 + 0.02); C.entry = L2W(HOLE.x, FY, D / 2 - 0.16);
          C.perch = [-0.3, 0, 0.3].map(x => ({ below: L2W(x, FY, 0.06), on: L2W(x, perchY, -0.08), yaw: YAW }));   // chỗ đậu: đứng trên sào, mặt quay ra cửa
          C.under = [[-0.22, 0.02], [0.05, -0.08], [0.28, 0.06]].map(([x, z]) => L2W(x, 0, z).setY(gY));   // gầm chuồng: chỗ trú mưa / nắng
          C.legs = [];
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const p = L2W(sx * (W / 2 - 0.03), 0, sz * (D / 2 - 0.03)); C.legs.push([p.x, p.z, 0.05]); }
          C.rampY = (x, z) => {   // độ cao mặt ván cầu thang tại (x, z) (null nếu ngoài ván)
            const q = g.worldToLocal(new THREE.Vector3(x, gY, z)); if (Math.abs(q.x - HOLE.x) > 0.13 || q.z < D / 2 - 0.02 || q.z > D / 2 + RAMP_L + 0.02) return null;
            return gY + FY * Math.max(0, Math.min(1, 1 - (q.z - D / 2) / RAMP_L));
          };
          C.inside = (x, z) => { const q = g.worldToLocal(new THREE.Vector3(x, gY, z)); return Math.abs(q.x) < W / 2 - 0.03 && Math.abs(q.z) < D / 2 - 0.03; };
          obstacleCoords.push({ x: PX, z: PZ, r: 0.8, y: gY, h: LEG + 0.03 + H + PEAK + 0.04, coop: true });   // y / h: lưới bay của ong, bướm cũng đọc (thiếu ⇒ hộp NaN, hỏng cả lưới)   // người / chó / bò đi vòng chuồng (gà thì chui gầm — animals/chickens.js bỏ vòng này, chỉ né 4 chân)
          C.tick = dt => { C.open += (C.want - C.open) * Math.min(1, dt * 1.5); door.position.set(HOLE.x, FY + (HOLE.h + 0.02) / 2 + 0.005 + C.open * (HOLE.h + 0.02), D / 2 - th - 0.012); };
          C.tick(1);
          return C;
        })();
