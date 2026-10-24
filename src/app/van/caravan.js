        const studyDeskLighting = { light: null, bulb: null, on: null };
        const studyLaptop = { hinge: null, screen: null, light: null, open: 0, target: 0 };   // laptop bàn học: nắp mở/đóng + màn hình sáng khi kỹ sư làm việc
        const studyChairRig = { obj: null, home: 0, off: 0, sx: 0, sw: 0 };   // ghế văn phòng bàn học: kéo ra / đẩy vào dọc trục trước–sau + trượt ngang (sx) + xoay mâm (sw) (đv xe)
        const studyBoard = { g: null };   // bảng ghim ghi chú cạnh bàn học (G 17/10)
        const LAP_K = 1.3;   // G 17/10 "macbook 30% bigger" (khung tay cầm drone giữ cỡ cũ: engineer/tasks/drone.js chia lại)
        function updateStudyLamp() {
          const hh = liveWeather.localHour, on = hh >= 18.5 || hh < 6;
          if (!studyDeskLighting.light || on === studyDeskLighting.on) return;
          studyDeskLighting.on = on;
          // Keep the light allocated and only change uniforms at dusk/dawn.
          studyDeskLighting.light.intensity = on ? 1.35 : 0;
          studyDeskLighting.bulb.emissiveIntensity = on ? 1.6 : 0;
        }
        // ---- MacBook Pro 16" (2021) dựng bằng code (G 17/10 gửi GLB "MacBook Pro 2021", KangaroOz 3D, CC-BY-NC — chỉ đo dáng; mẫu đó là đời Touch Bar 2016–20,
        //      ở đây theo đời 2021 thật): thân 355,7 × 248,1 mm, dày 16,8 mm khi gập (đế 10,5 · nắp 6,3), góc bo 1 cm, nhôm xám không gian · lòng bàn phím
        //      đen anod, phím đen cao đủ (hàng F + Touch ID), loa 2 bên đục lỗ, trackpad 160 × 100 mm · bản lề đen · nắp: kính đen viền 4,9 / 3,5 mm, màn
        //      345,9 × 223,6 mm (3456×2234 ⇒ 1,547), TAI THỎ vẽ trên màn · lưng nắp: logo táo bóng · cổng 2 cạnh (MagSafe, Thunderbolt, tai nghe | HDMI, TB, SD).
        //      Gốc = giữa đáy; bản lề quay quanh trục x ở mép sau (nắp gập: mặt màn úp xuống −y, mở: quay về +z) ----
        const MBP = { W: 0.3557, D: 0.2481, HB: 0.0105, HL: 0.0063, SW: 0.3459, SH: 0.2236, CW: 512, CH: 331 };
        function macbookPro() {
          const { W, D, HB, HL, SW, SH } = MBP, g = new THREE.Group();
          const rr = (w, h, r) => { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; };
          const slab = (th) => { const geo = new THREE.ExtrudeGeometry(rr(W, D, 0.01), { depth: th - 0.0016, bevelEnabled: true, bevelThickness: 0.0008, bevelSize: 0.0008, bevelSegments: 2, curveSegments: 4 }); geo.rotateX(-Math.PI / 2); geo.translate(0, 0.0008, 0); return geo; };   // hình bo nằm ngang, đáy y = 0
          const alu = new THREE.MeshPhongMaterial({ color: 0x6a6d73, specular: 0x5a5a5a, shininess: 45 }), dark = new THREE.MeshPhongMaterial({ color: 0x1a1a1c, specular: 0x333333, shininess: 60 });
          const base = new THREE.Mesh(slab(HB), alu); base.castShadow = true; g.add(base);
          // mặt trên đế (canvas 1024 × 714 ≈ 2,9 px/mm): lòng phím đen, phím + chữ, loa 2 bên, trackpad · ảnh phát sáng riêng (chỉ chữ phím) cho đèn nền bàn phím
          const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
          const top = cv(1024, 714), x = top.getContext('2d'), glow = cv(512, 357), gx = glow.getContext('2d'), k = 1024 / (W * 1000);   // px / mm
          const R = (X, Y, w, h, r, c, ctx = x, s = 1) => { ctx.fillStyle = c; ctx.beginPath(); ctx.roundRect(X * k * s, Y * k * s, w * k * s, h * k * s, r * k * s); ctx.fill(); };
          x.fillStyle = '#6d7076'; x.fillRect(0, 0, 1024, 714); gx.fillStyle = '#000'; gx.fillRect(0, 0, 512, 357);
          const kbX = 37, kbY = 12, kbW = 282, kbH = 113;   // mm từ góc trái–sau
          R(kbX - 3, kbY - 3, kbW + 6, kbH + 6, 4, '#141416');
          const rows = [['esc', ...'F1 F2 F3 F4 F5 F6 F7 F8 F9 F10 F11 F12'.split(' '), ''], ['`', ...'1234567890-='.split(''), 'delete'], ['tab', ...'QWERTYUIOP[]\\'.split('')], ['caps', ...'ASDFGHJKL;\''.split(''), 'return'], ['shift', ...'ZXCVBNM,./'.split(''), 'shift'], ['fn', 'ctrl', 'opt', 'cmd', ' ', 'cmd', 'opt', '◀', '▲▼', '▶']];
          const wide = { delete: 1.5, tab: 1.5, caps: 1.8, return: 1.9, shift: 2.4, ' ': 5.6, cmd: 1.25, esc: 1.5 }, P = 19.0;
          rows.forEach((row, r) => {
            const units = row.reduce((s, c) => s + (wide[c] || 1), 0); let cx = kbX, y = kbY + r * P;
            row.forEach(c => { const w = (wide[c] || 1) * (kbW / units) - 2.2;
              R(cx, y + 0.6, w, P - 3, 1.8, '#202023'); R(cx + 0.4, y + 0.8, w - 0.8, P - 4.4, 1.6, '#2a2a2e');   // phím: viền + mặt hơi sáng
              if (c) for (const [ctx, s, col] of [[x, 1, 'rgba(235,235,240,0.85)'], [gx, 0.5, '#fff']]) { ctx.fillStyle = col; ctx.font = (c.length > 2 ? 2.6 : 3.8) * k * s + 'px Arial, sans-serif'; ctx.textAlign = c.length > 2 ? 'left' : 'center'; ctx.fillText(c, (c.length > 2 ? cx + 1.6 : cx + w / 2) * k * s, (y + (c.length > 2 ? 12.5 : 10.5)) * k * s); }
              if (r === 0 && !c) { x.strokeStyle = '#444'; x.lineWidth = 1.5; x.beginPath(); x.arc((cx + w / 2) * k, (y + 8) * k, 4.5 * k, 0, 6.283); x.stroke(); }   // nút Touch ID
              cx += w + 2.2; });
          });
          for (const sx of [kbX - 25, kbX + kbW + 6]) { x.fillStyle = '#3c3e43'; for (let yy = kbY; yy < kbY + kbH; yy += 1.25) for (let xx = sx; xx < sx + 19; xx += 1.25) x.fillRect(xx * k, yy * k, 1.6, 1.6); }   // loa đục lỗ
          R((W * 1000 - 160) / 2, 248.1 - 13 - 100, 160, 100, 7, '#75787e'); x.strokeStyle = 'rgba(40,40,44,0.35)'; x.lineWidth = 2; x.beginPath(); x.roundRect((W * 1000 - 160) / 2 * k, (248.1 - 113) * k, 160 * k, 100 * k, 7 * k); x.stroke();   // trackpad
          const tt = new THREE.CanvasTexture(top), gt = new THREE.CanvasTexture(glow); tt.colorSpace = gt.colorSpace = THREE.SRGBColorSpace; tt.anisotropy = 4;
          for (const t of [tt, gt]) { t.repeat.set(1 / W, 1 / D); t.offset.set(0.5, 0.5); }
          // mặt phím / logo / màn hình nằm sát mặt nhôm dưới nó ⇒ đẩy độ sâu về phía camera (polygonOffset) — G 17/10 "laptop glitch, flashing keyboard": bản đầu
          // mặt phím chỉ cao hơn mặt đế 0,05 mm, nhỏ hơn 1 bước độ sâu của camera trực giao (gần 0,1 → xa 4.000 m ⇒ ~0,24 mm/bước) ⇒ 2 mặt giành nhau, nhấp nháy
          const near = { polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -4 };
          const keyMat = new THREE.MeshPhongMaterial({ map: tt, emissiveMap: gt, emissive: 0xfff4e0, emissiveIntensity: 0, specular: 0x333333, shininess: 30, ...near });
          const deck = new THREE.Mesh(new THREE.ShapeGeometry(rr(W - 0.0006, D - 0.0006, 0.0098), 4), keyMat); deck.rotation.x = -Math.PI / 2; deck.position.y = HB + 0.0003; g.add(deck);   // UV hình = toạ độ m ⇒ repeat 1/W, offset ½
          // cổng 2 cạnh: trái MagSafe · TB · TB · tai nghe; phải HDMI · TB · khe SD
          for (const [sx, list] of [[-1, [[-0.075, 0.016], [-0.045, 0.008], [-0.028, 0.008], [0.03, 0.004]]], [1, [[-0.07, 0.014], [-0.045, 0.008], [0.04, 0.024]]]]) for (const [z, w] of list) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.0012, 0.0032, w), dark); p.position.set(sx * (W / 2 + 0.0002), HB * 0.48, z); g.add(p); }
          const hingeBar = new THREE.Mesh(new THREE.CylinderGeometry(0.0045, 0.0045, W - 0.06, 10), dark); hingeBar.rotation.z = Math.PI / 2; hingeBar.position.set(0, HB - 0.001, -D / 2 + 0.006); g.add(hingeBar);
          const hinge = new THREE.Group(); hinge.position.set(0, HB, -D / 2 + 0.006); g.add(hinge);
          const lid = new THREE.Mesh(slab(HL), alu); lid.position.z = D / 2 - 0.006; lid.castShadow = true; hinge.add(lid);
          const glass = new THREE.Mesh(new THREE.ShapeGeometry(rr(W - 0.0016, D - 0.0016, 0.0092), 4), new THREE.MeshPhongMaterial({ color: 0x08080a, specular: 0x555555, shininess: 140, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
          glass.rotation.x = Math.PI / 2; glass.position.set(0, -0.0003, D / 2 - 0.006); hinge.add(glass);   // lớp: mặt nhôm < kính (−2) < màn (−4)   // kính đen mặt trong (úp xuống khi gập)
          const sc = cv(MBP.CW, MBP.CH), sx2 = sc.getContext('2d'); sx2.fillStyle = '#000'; sx2.fillRect(0, 0, MBP.CW, MBP.CH);
          const scrTex = new THREE.CanvasTexture(sc); scrTex.colorSpace = THREE.SRGBColorSpace; scrTex.anisotropy = 4;
          const screenMat = new THREE.MeshBasicMaterial({ map: scrTex, color: 0x101214, ...near });
          const scr = new THREE.Mesh(new THREE.PlaneGeometry(SW, SH), screenMat); scr.rotation.x = Math.PI / 2; scr.position.set(0, -0.0006, D - 0.006 - 0.0035 - SH / 2); hinge.add(scr);   // viền trên 3,5 mm (tai thỏ nằm trong màn)
          // logo táo (lưng nắp, bóng hơn nhôm): thân 2 thuỳ + vết cắn + lá — hướng lá về mép trên nắp
          const ap = new THREE.Shape(), A = 0.0125;
          ap.moveTo(0, -0.98 * A); ap.bezierCurveTo(-0.45 * A, -1.12 * A, -1.02 * A, -0.55 * A, -0.98 * A, 0.12 * A); ap.bezierCurveTo(-0.95 * A, 0.62 * A, -0.55 * A, 0.86 * A, -0.2 * A, 0.72 * A);
          ap.quadraticCurveTo(0, 0.66 * A, 0.2 * A, 0.72 * A); ap.bezierCurveTo(0.55 * A, 0.86 * A, 0.86 * A, 0.62 * A, 0.9 * A, 0.42 * A); ap.quadraticCurveTo(0.62 * A, 0.18 * A, 0.66 * A, -0.12 * A);
          ap.quadraticCurveTo(0.7 * A, -0.38 * A, 0.95 * A, -0.48 * A); ap.bezierCurveTo(0.8 * A, -0.92 * A, 0.4 * A, -1.12 * A, 0, -0.98 * A);
          const leaf = new THREE.Shape(); leaf.moveTo(0.02 * A, 0.8 * A); leaf.quadraticCurveTo(0.05 * A, 1.25 * A, 0.42 * A, 1.32 * A); leaf.quadraticCurveTo(0.42 * A, 0.92 * A, 0.02 * A, 0.8 * A);
          const logo = new THREE.Mesh(new THREE.ShapeGeometry([ap, leaf], 6), new THREE.MeshPhongMaterial({ color: 0x3a3c40, specular: 0xbbbbbb, shininess: 160, ...near }));
          logo.rotation.set(-Math.PI / 2, 0, Math.PI); logo.position.set(0, HL + 0.0004, D / 2 - 0.006); hinge.add(logo);   // xoay π quanh pháp tuyến: lá về mép trên nắp, vết cắn bên phải người nhìn lưng nắp
          return { g, hinge, screenMat, keyMat, canvas: sc, ctx: sx2, tex: scrTex };
        }
        function engHelmetProp() {   // mũ bảo hộ rời (đv xe = cỡ mũ đang đội: ×ENGINEER_BASE_SCALE); gốc ở đáy 2 ốp tai (mũ đặt xuống thì tì trên ốp tai)
          const g = new THREE.Group(); g.name = 'Mũ bảo hộ (đã tháo)'; g.userData.noBake = true;
          const h = legoHelmet(engHelm, caravanDark); h.position.y = 0.07; g.add(h);   // cùng hình mũ đang đội; tì trên 2 ốp tai
          g.scale.set(ENGINEER_BASE_SCALE * ENG_SLIM, ENGINEER_BASE_SCALE, ENGINEER_BASE_SCALE * ENG_SLIM); return g;   // gầy 5% như mũ đang đội (engineer/body/model.js)
        }
        function caravan() {
          const g = new THREE.Group();
          // khoang ở trong Transit L3H2 (đv xe, van/transit.js): sàn y 0,83 · trần 2,857 · lòng xe x −0,58 (sau ghế cabin) → 2,99 (mặt trong cửa sau), z ±0,90
          //  (G 19/10: nội thất bám lòng VỎ GLB — TR_IN, van/transit.js — trước dựng theo vỏ code rộng ±0,98, trần 2,90 nên giường, bàn, tủ, vách thò ra ngoài vỏ)
          //  bố trí giữ như xe cũ nhưng gọn lại: bàn ăn + ghế đẩu ở nửa trước ô cửa lùa · giường dọc vách −z · bếp dọc vách +z sau cửa · bàn học góc sau −z · phòng tắm ướt ở đuôi
          const yIn = TR.yIn, base = yIn - 0.12, x0 = TR.xP, x1 = 2.27, xB = 2.99, dz = TR_IN.w, wallZ = 1.06, ceil = trInCeil(0);
          const roofTop = (x, z) => trRoofY(x) - trLerp(TR_DROP, Math.abs(z)) * trS(x);
          const floorMat = new THREE.MeshLambertMaterial({ color: 0xb99c73 }), woodMat = new THREE.MeshLambertMaterial({ color: 0x9c7b4f }),
            cushMat = new THREE.MeshLambertMaterial({ color: 0xc94f3d }), litMat = new THREE.MeshLambertMaterial({ color: 0xfff3c4 });
          const vanGlass = new THREE.MeshLambertMaterial({ color: 0x8fc1e3, transparent: true, opacity: 0.25 });
          // gầm: 2 dầm khung, thùng nhiên liệu, ống xả, lốp dự phòng treo dưới đuôi, tấm gầm tối dưới sàn
          const under = new THREE.Group(); under.name = 'Gầm xe'; g.add(under);
          for (const z of [-0.52, 0.52]) { const r = bx(5.6, 0.14, 0.09, caravanDark, true, true, lineDark); r.position.set(0.15, 0.50, z); under.add(r); }
          const pan = bx(5.2, 0.02, 1.9, caravanDark, true, false); pan.position.set(0.3, base - 0.01, 0); under.add(pan);
          const tank = bx(0.8, 0.26, 0.5, caravanDark, true, true, lineDark); tank.position.set(-0.2, 0.47, -0.62); under.add(tank);
          const exh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.9, 8), metalMat); exh.rotation.z = Math.PI / 2; exh.position.set(1.3, 0.40, -0.35); under.add(exh);
          const spare = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.22, 16), tyreMat); spare.position.set(2.6, 0.45, 0); under.add(spare);
          const floor = bx(5.24, 0.12, 1.98, floorMat); floor.position.set(0.37, base + 0.06, 0); floor.receiveShadow = true; g.add(floor);   // sàn cả cabin (thảm đen phủ phía trước) lẫn khoang
          const trBody = transitBody(g);
          const galley = transitCab(g);
          transitGlb(g, trBody);   // mẫu GLB Transit nạp sau: thay vỏ, táp-lô, ghế, bánh code (van/transit.js)
          galley.position.set(1.60, yIn - 1.07, -2.04);   // tủ bếp (cục bộ: mặt tủ x 2,40 → z 0,36, lưng 2,95 → z 0,91 sát vách GLB; dài 1,82 → x 0,69 … 2,51)
          const axles = new THREE.Group(); axles.name = 'Cầu bánh xe';
          const axleGeo = new THREE.CylinderGeometry(0.055, 0.055, 1, 8);
          for (const axleX of [TR.xF, TR.xR]) { const shaft = new THREE.Mesh(axleGeo, caravanDark); shaft.rotation.x = Math.PI / 2; shaft.scale.y = 2 * TR.wz - 0.2; shaft.position.set(axleX, TR.wr, 0); shaft.castShadow = true; axles.add(shaft); }
          const diff = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 8), caravanDark); diff.scale.set(1, 0.8, 1); diff.position.set(TR.xR, TR.wr, 0); axles.add(diff);
          axles.userData.noBake = true; g.add(axles);
          // hốc bánh trong khoang (lốp 31" cao hơn mặt sàn 5 cm): vòm tôn sát vách — sau nằm dưới bàn học / tủ bếp, trước dưới chân cabin
          const tubs = new THREE.Group(); tubs.name = 'Hốc bánh trong khoang';
          for (const x of [TR.xF, TR.xR]) for (const s of [-1, 1]) { const tb = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.2, 18, 1, false, Math.PI - 1.2, 2.4), caravanDark); tb.rotation.x = Math.PI / 2; tb.position.set(x, TR.wr, s * 0.885); tb.castShadow = tb.receiveShadow = true; tubs.add(tb); }
          g.add(tubs);
          // bậc lên xuống cửa lùa: 2 bậc khung thép (bậc sàn Transit đặt sẵn ở ngưỡng) — chó và người dùng (animals/dog-brain.js — stairY)
          const entrySteps = new THREE.Group(); entrySteps.name = 'Bậc cửa có khung đỡ';
          entrySteps.userData.noBake = true;
          const stepCx = 0.345, stepWidth = 0.6;
          function stepBox(w, h, d, x, y, z, mat, outlined = false) {
            const m = bx(w, h, d, mat, true, outlined, lineDark); m.position.set(x, y, z); entrySteps.add(m); return m;
          }
          function stepStrut(a, b) {
            const v = new THREE.Vector3().subVectors(b, a), m = bx(.04, v.length(), .04, metalMat, true, false);
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
            m.position.copy(a).add(b).multiplyScalar(.5); entrySteps.add(m);
          }
          const stepTreads = [{ y: 0.53, z: wallZ + 0.19, depth: 0.36, height: 0.07 }, { y: 0.26, z: wallZ + 0.49, depth: 0.32, height: 0.07 }];
          for (const t of stepTreads) {
            stepBox(stepWidth, t.height, t.depth, stepCx, t.y, t.z, caravanDark, true);
            stepBox(stepWidth - .035, .014, .045, stepCx, t.y + t.height / 2 + .006, t.z + t.depth / 2 - .025, rimMat);
            for (let n = 0; n < 5; n++) stepBox(stepWidth - .085, .009, .018, stepCx, t.y + t.height / 2 + .008, t.z - t.depth / 2 + .06 + n * (t.depth - .15) / 4, tyreMat);
          }
          for (const side of [-1, 1]) {
            const sx = stepCx + side * (stepWidth / 2 - .055);
            stepBox(.06, .16, .055, sx, base - .1, wallZ - .02, metalMat);
            stepStrut(new THREE.Vector3(sx, base - .08, wallZ), new THREE.Vector3(sx, .06, wallZ + .66));
            stepStrut(new THREE.Vector3(sx, 0.26 - .04, wallZ + .4), new THREE.Vector3(sx, .06, wallZ + .66));
            stepBox(.11, .05, .13, sx, .025, wallZ + .66, tyreMat);
            for (const t of stepTreads) stepBox(.07, .035, t.depth - .03, sx, t.y - t.height / 2 - .017, t.z, metalMat);
          }
          entrySteps.userData.treads = stepTreads; entrySteps.userData.door = { cx: stepCx, w: stepWidth, wall: wallZ, x0: TR.door[0], x1: TR.door[1] };
          g.add(entrySteps);
          // tay vịn đứng ở trụ B (lên xuống cửa lùa) + nẹp ngưỡng cửa
          const grab = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.62, 6), metalMat); grab.position.set(TR.door[0] + 0.05, yIn + 0.95, dz - 0.02); grab.castShadow = true; g.add(grab);
          const sillPlate = bx(TR.door[1] - TR.door[0], 0.012, wallZ - dz + 0.03, metalMat, true, false); sillPlate.position.set((TR.door[0] + TR.door[1]) / 2, yIn + 0.006, (dz + wallZ) / 2); g.add(sillPlate);

          // ---- giường đơn dọc vách −z (2,0 × 0,76 đv = 1,82 × 0,69 m, mép trước giữ z −0,14 cho lối đi): khung hộp trắng, 2 ngăn kéo đen, đệm xám, chăn đỏ gấp cuối giường, gối ----
          const bedLen = 2.0, bedW = 0.76, bedX1 = x0 + bedLen, bedCx = x0 + bedLen / 2, bedZ = -dz + bedW / 2;
          const bed = new THREE.Group(); bed.name = 'Giường dọc vách đối diện';
          const flexaWhite = new THREE.MeshLambertMaterial({ color: 0xe6e4de }), flexaBlack = new THREE.MeshLambertMaterial({ color: 0x1f2022 });
          const mattGrey = new THREE.MeshLambertMaterial({ color: 0x8c8e90 });
          const bedH = 0.45, pt = 0.02, frontZ = bedZ + bedW / 2, backZ = bedZ - bedW / 2, mattTop = bedH + 0.04;
          const bedPart = (w, h, d, x, y, z, mat, outlined = true) => { const m = bx(w, h, d, mat, true, outlined, lineDark); m.position.set(x, yIn + y, z); bed.add(m); return m; };
          bedPart(bedLen, bedH, pt, bedCx, bedH / 2, backZ + pt / 2, flexaWhite);
          for (const sx of [-1, 1]) bedPart(pt, bedH, bedW, bedCx + sx * (bedLen / 2 - pt / 2), bedH / 2, bedZ, flexaWhite);
          bedPart(bedLen, 0.12, pt, bedCx, bedH - 0.06, frontZ - pt / 2, flexaWhite);
          bedPart(bedLen, 0.07, pt, bedCx, 0.035, frontZ - pt / 2, flexaWhite);
          bedPart(0.03, 0.26, pt, bedCx, 0.2, frontZ - pt / 2, flexaWhite);
          bedPart(bedLen - 2 * pt, 0.02, bedW - 2 * pt, bedCx, bedH - 0.08, bedZ, flexaWhite, false);
          for (const sx of [-1, 1]) {
            const dx = bedCx + sx * bedLen / 4;
            bedPart(bedLen / 2 - 0.05, 0.25, 0.03, dx, 0.2, frontZ - 0.03, flexaBlack);
            bedPart(0.2, 0.025, 0.006, dx, 0.31, frontZ - 0.012, flexaWhite, false);
          }
          bedPart(bedLen - 0.05, 0.146, bedW - 0.05, bedCx, mattTop - 0.073, bedZ, mattGrey);
          const duvet = bx(bedLen * 0.42, 0.06, bedW - 0.02, cushMat); duvet.position.set(x0 + bedLen * 0.25, yIn + mattTop + 0.03, bedZ + 0.01); duvet.userData.noBake = duvet.userData.noBatch = true; bed.add(duvet);
          // Gối Flexa: thân phồng (dày giữa, dẹt dần về đường may, mép hơi cong vào tạo 4 góc nhọn), viền ống may quanh mép,
          // vải họa tiết quả trám (canvas). dent > 0 tạo vết lõm giữa mặt gối chỗ gác đầu.
          function flexaPillow(w, h, t, fabric, trim, dent = 0) {
            const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
            x.fillStyle = '#' + new THREE.Color(fabric).getHexString(); x.fillRect(0, 0, 128, 128);
            x.strokeStyle = x.fillStyle = '#' + new THREE.Color(trim).getHexString(); x.lineWidth = 2.5;
            for (let k = -128; k <= 128; k += 32) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 128, 128); x.moveTo(k + 128, 0); x.lineTo(k, 128); x.stroke(); }
            for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) if ((i + j) % 2 === 0) { x.beginPath(); x.arc(i * 16, j * 16, 3, 0, 7); x.fill(); }
            const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(w / 0.3, h / 0.3);
            const edgeX = (u, v) => u * w / 2 * (1 - 0.05 * (1 - v * v)), edgeY = (u, v) => v * h / 2 * (1 - 0.05 * (1 - u * u));
            const geo = new THREE.BoxGeometry(1, 1, 1, 18, 14, 2), p = geo.attributes.position;
            for (let i = 0; i < p.count; i++) {
              const u = p.getX(i) * 2, v = p.getY(i) * 2, sd = p.getZ(i) * 2;
              const puff = Math.pow(Math.max(0, (1 - u * u) * (1 - v * v)), 0.4);
              let z = sd * t / 2 * puff;
              if (dent && sd > 0) z -= dent * Math.exp(-(u * u / 0.3 + v * v / 0.35)) * puff;
              p.setXYZ(i, edgeX(u, v), edgeY(u, v), z);
            }
            geo.computeVertexNormals();
            const pg = new THREE.Group(), body = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex }));
            body.castShadow = body.receiveShadow = true; pg.add(body);
            const seam = [];
            for (const [u0, v0, u1, v1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]])
              for (let k = 0; k < 12; k++) { const f = k / 12, u = u0 + (u1 - u0) * f, v = v0 + (v1 - v0) * f; seam.push(new THREE.Vector3(edgeX(u, v), edgeY(u, v), 0)); }
            const pipe = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(seam, true), 96, 0.007, 5, true), new THREE.MeshLambertMaterial({ color: trim }));
            pipe.castShadow = true; pg.add(pipe);
            return pg;
          }
          // gối tựa (tối) dựa vách lưng khoảng giữa giường · gối nằm (sáng) đầu giường phía +X, chỗ kỹ sư gác đầu khi ngủ
          const backPillow = flexaPillow(0.42, 0.40, 0.14, 0x6b6d6f, 0x8f9193);
          backPillow.position.set(bedCx + 0.2, yIn + mattTop + 0.2, backZ + 0.11); backPillow.rotation.x = -0.28; bed.add(backPillow);
          const headPillow = flexaPillow(0.56, 0.38, 0.12, 0xd2cfc6, 0xa8a499, 0.035);
          headPillow.rotation.set(-Math.PI / 2, 0, Math.PI / 2); headPillow.position.set(bedX1 - 0.32, yIn + mattTop + 0.045, bedZ); bed.add(headPillow);
          bakeStatic(bed); bed.userData.noBake = true; g.add(bed);
          // tủ treo trên giường (dưới góc bo mui), cửa sổ vách −z nằm ngay dưới — lưng tủ vát theo mui khum (lòng xe y 2,47 → 2,76: |z| 0,88 → 0,80)
          const cupGeo = new THREE.ExtrudeGeometry(new THREE.Shape([[-0.47, 2.47], [-trInW(2.47) + 0.012, 2.47], [-trInW(2.76) + 0.012, 2.76], [-0.47, 2.76]].map(([z, y]) => new THREE.Vector2(z, y))), { depth: 1.7, bevelEnabled: false });
          cupGeo.rotateY(-Math.PI / 2); cupGeo.translate(x0 + 1.8, 0, 0);   // mặt cắt (z, y) đùn dọc thân xe x0 + 0,1 … x0 + 1,8
          const cup = new THREE.Mesh(cupGeo, new THREE.MeshLambertMaterial({ color: 0xd8d3c6, transparent: true, opacity: 0.5, depthWrite: false })); cup.castShadow = cup.receiveShadow = true; edge(cup, cupGeo, lineDark); g.add(cup);   // tủ treo trong suốt 50% (G 19/10), nét viền giữ nguyên

          // ---- góc học tập (sau giường, sát vách phòng tắm): bàn 0,85 × 0,44, cao 0,91 (G 15/10 cho bàn cao/sâu hơn 20%; 19/10 sâu 0,52 → 0,44: lưng bàn
          //      lùi khỏi vách vỏ GLB, mép trước giữ nguyên) · mặt bàn gỗ 3,5 cm (trước 6 cm) ----
          const study = new THREE.Group(); study.name = 'Góc học tập trong xe'; study.userData.noBake = true;
          const desk = new THREE.Group(); desk.name = 'Bàn học nhỏ';
          const DW = x1 - bedX1, DD = 0.44, dX = bedX1 + DW / 2, dZ = -dz + DD / 2, dH = 0.912;
          function studyBox(parent, name, w, h, d, x, y, z, mat, outlined = false) {
            const m = bx(w, h, d, mat, true, outlined, lineDark); m.name = name; m.position.set(x, y, z); parent.add(m); return m;
          }
          function bakeStudyFurniture(assembly) {
            const original = new Set(); assembly.traverse(o => { if (o.geometry) original.add(o.geometry); });
            bakeStatic(assembly);
            const kept = new Set(); assembly.traverse(o => { if (o.geometry) kept.add(o.geometry); });
            for (const geometry of original) if (!kept.has(geometry)) geometry.dispose();
          }
          studyBox(desk, 'Mặt bàn học', DW - 0.02, .035, DD, dX, yIn + dH - .0175, dZ, woodMat, true);
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) studyBox(desk, 'Chân bàn học', .04, dH - .035, .04, dX + sx * (DW / 2 - .06), yIn + (dH - .035) / 2, dZ + sz * (DD / 2 - .05), metalMat);
          studyBox(desk, 'Thanh đỡ sau bàn', DW - .14, .07, .035, dX, yIn + dH - .2, dZ - DD / 2 + .04, metalMat);
          studyBox(desk, 'Ngăn kéo nhỏ', .3, .1, .38, dX + .2, yIn + dH - .1, dZ + .03, caravanRoofM, true);
          studyBox(desk, 'Tay nắm ngăn kéo', .12, .017, .025, dX + .2, yIn + dH - .1, dZ + .225, metalMat);
          bakeStudyFurniture(desk); study.add(desk);

          // ---- GHẾ VĂN PHÒNG (G 17/10 "add … office chair": dáng ghế giám đốc da nâu tay vịn ống crôm trong GLB "60's Office Props" — SeanNicolas,
          //      CC-BY-NC, chỉ đo). Cơ cấu ghế văn phòng: chân sao 5 nhánh có bánh xe (5 nhánh mới không lật — BIFMA X5.1), trụ ben hơi nâng hạ, mâm XOAY
          //      360°, cơ cấu NGẢ: lưng ngả theo người tựa ra sau (lò xo căng); tay vịn để chống khi ngồi xuống / đứng lên. Lối đi trong xe hẹp ⇒ không
          //      vòng ra sau ghế được: đứng cạnh ghế, XOAY ghế về phía mình, ngồi, xoay về bàn rồi lăn vào (engineer/tasks/van-stations.js). Mặt đệm cao 0,4875 đv.
          //      Nhóm: ghế (lăn: z kéo ra / đẩy vào, x trượt ngang) ⊃ chân sao + bánh (càng xoay theo hướng lăn) · mâm xoay ⊃ lưng ngả ----
          const studyChair = new THREE.Group(); studyChair.name = 'Ghế bàn học'; studyChair.userData.noBatch = true;
          const chairX = dX - .02, chairZ = dZ + DD / 2 + .39, SEAT_TOP = .4875;   // mép đệm cách mép bàn ~15 cm
          {
            const leather = new THREE.MeshLambertMaterial({ color: 0x6e4129 }), seam = new THREE.MeshLambertMaterial({ color: 0x3f2416 }), chrome = new THREE.MeshLambertMaterial({ color: 0xd4d8dc }), dark = new THREE.MeshLambertMaterial({ color: 0x35383b });
            const base = new THREE.Group(); base.position.set(chairX, yIn, chairZ); studyChair.add(base);
            const part = (geo, mat, p, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; p.add(m); return m; };
            part(new THREE.CylinderGeometry(.045, .055, .06, 10), dark, base, 0, .09, 0);
            for (let k = 0; k < 5; k++) {
              const a = k / 5 * Math.PI * 2 + Math.PI / 10, arm = part(new THREE.BoxGeometry(.27, .028, .04), dark, base, Math.cos(a) * .15, .075, Math.sin(a) * .15);
              arm.rotation.set(0, -a, -.1);
              const cg = new THREE.Group(); cg.position.set(Math.cos(a) * .285, .05, Math.sin(a) * .285); base.add(cg);
              part(new THREE.BoxGeometry(.03, .026, .03), dark, cg, -.01, 0, 0);
              const wh = part(new THREE.CylinderGeometry(.023, .023, .03, 10), dark, cg, -.024, -.026, 0); wh.rotation.x = Math.PI / 2;
            }
            part(new THREE.CylinderGeometry(.035, .035, .14, 10), dark, base, 0, .18, 0);
            part(new THREE.CylinderGeometry(.022, .022, .2, 10), chrome, base, 0, .33, 0);
            const swivel = new THREE.Group(); swivel.position.set(chairX, yIn + SEAT_TOP, chairZ); studyChair.add(swivel);
            part(new THREE.BoxGeometry(.2, .04, .22), dark, swivel, 0, -.105, .02);
            studyBox(swivel, 'Đệm ghế học', .5, .085, .48, 0, -.0425, 0, leather, true);
            studyBox(swivel, 'Đường may đệm', .502, .012, .01, 0, -.004, -.07, seam);
            const backPivot = new THREE.Group(); backPivot.position.set(0, -.02, .23); backPivot.rotation.x = .12; backPivot.userData.noBake = true; swivel.add(backPivot);
            studyBox(backPivot, 'Lưng ghế học', .48, .7, .075, 0, .4, .03, leather, true);
            for (const y of [.3, .53]) studyBox(backPivot, 'Đường may lưng', .482, .01, .077, 0, y, .03, seam);
            part(new THREE.BoxGeometry(.07, .26, .025), chrome, backPivot, 0, .07, .085);
            for (const sx of [-1, 1]) {
              const pts = [[-.17, -.03], [-.18, .1], [-.15, .2], [-.05, .225], [.08, .22], [.17, .17], [.19, .05], [.16, -.035], [.0, -.045]].map(([z, y]) => new THREE.Vector3(sx * .275, y, z));
              const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 48, .012, 6, true), chrome); tube.castShadow = true; tube.name = 'Tay vịn crôm'; swivel.add(tube);
            }
            bakeStudyFurniture(base); bakeStudyFurniture(swivel); bakeStudyFurniture(backPivot);
            Object.assign(studyChairRig, { base, swivel, back: backPivot, arm: { x: .275, y: .22 } });
          }
          study.add(studyChair); studyChairRig.obj = studyChair; studyChairRig.home = studyChair.position.z;

          // ---- BẢNG GHIM (G 17/10 "add wall board", theo bảng bần trong "60's Office Props"): khung gỗ sẫm, mặt bần, giấy ghi + đinh ghim đỏ. Treo vách
          //      trước phòng tắm, bên phải bàn học, mép dưới cao hơn mặt bàn ~9 cm: ngồi ghế xoay sang + lăn tới là với tới (engineer/tasks/laptop-work.js 'note').
          //      Toạ độ bảng: +x dọc bảng (về phía lối đi), +y lên, +z ra khỏi vách ----
          {
            const BW = .62, BH = .5, bd = new THREE.Group(); bd.name = 'Bảng ghim ghi chú'; bd.position.set(x1 - .03, yIn + 1.32, -dz + .36); bd.rotation.y = -Math.PI / 2;
            const frameM = new THREE.MeshLambertMaterial({ color: 0x5b3a22 }), pinM = new THREE.MeshLambertMaterial({ color: 0xc4362b });
            const cork = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#b48c5c'; x.fillRect(0, 0, 64, 64);
              for (let i = 0; i < 420; i++) { x.fillStyle = ['#9c7446', '#c9a272', '#a98050'][i % 3]; x.fillRect(Math.random() * 64, Math.random() * 64, 1 + Math.random() * 2, 1 + Math.random() * 2); }
              const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 2); return new THREE.MeshLambertMaterial({ map: t }); })();
            const paperTex = (() => { const c = document.createElement('canvas'); c.width = 48; c.height = 64; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 48, 64);
              x.strokeStyle = 'rgba(40,40,60,.55)'; x.lineWidth = 1.2; for (let l = 0; l < 7; l++) { x.beginPath(); let px = 6; x.moveTo(px, 9 + l * 7.5); while (px < 42 - (l % 3) * 6) { px += 3; x.lineTo(px, 9 + l * 7.5 + Math.sin(px * 1.7 + l) * 1.2); } x.stroke(); }
              const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();
            const paperM = col => new THREE.MeshLambertMaterial({ color: col, map: paperTex });
            studyBox(bd, 'Mặt bần', BW - .04, BH - .04, .012, 0, 0, .006, cork);
            for (const [w, h, x, y] of [[BW, .03, 0, BH / 2 - .015], [BW, .03, 0, -BH / 2 + .015], [.03, BH, -BW / 2 + .015, 0], [.03, BH, BW / 2 - .015, 0]]) studyBox(bd, 'Khung bảng', w, h, .03, x, y, .015, frameM);
            const pin = (x, y, z) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.007, .009, .014, 8), pinM); p.rotation.x = Math.PI / 2; p.position.set(x, y, z + .007); bd.add(p); return p; };
            for (const [x, y, w, h, r, c] of [[-.2, .1, .13, .16, .06, 0xece6d6], [-.04, .12, .12, .15, -.04, 0xf5f0e6], [.12, .09, .13, .17, .03, 0xe9e2d0], [-.18, -.12, .1, .1, -.08, 0xf2d46b], [.22, .12, .09, .09, .1, 0xf0b8c4], [.01, -.13, .14, .11, .05, 0xd6e6f2]]) {
              const pp = new THREE.Mesh(new THREE.BoxGeometry(w, h, .002), paperM(c)); pp.position.set(x, y, .014); pp.rotation.z = r; bd.add(pp); pin(x + Math.sin(r) * h * .4, y + h * .4, .015);
            }
            // giấy kỹ sư ghim thêm: 4 tờ dán (vàng) dùng xoay vòng · tờ trong tay · tập giấy dán trên bàn (phải laptop)
            const slots = [[.17, -.12], [.24, -.03], [.15, -.05], [.09, -.18]], notes = [];
            for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(new THREE.BoxGeometry(.075, .075, .002), paperM(0xf3d35e)); n.visible = false; n.userData.noBatch = true; bd.add(n); const pn = pin(0, 0, .015); pn.visible = false; pn.userData.noBatch = true; notes.push({ n, pn }); }
            const held = new THREE.Mesh(new THREE.BoxGeometry(.075, .002, .075), paperM(0xf3d35e)); held.visible = false; held.userData.noBatch = true; study.add(held);
            const pad = new THREE.Mesh(new THREE.BoxGeometry(.085, .014, .085), paperM(0xf3d35e)); pad.name = 'Tập giấy dán'; pad.position.set(dX + .32, yIn + dH + .008, dZ + .16); pad.rotation.y = -.25; study.add(pad);   // bên phải laptop: tay phải viết
            study.add(bd);
            Object.assign(studyBoard, { g: bd, BW, BH, slots, notes, held, pad, padP: pad.position.clone(), next: 0 });   // padP: toạ độ xe (tập giấy tĩnh bị gộp lượt vẽ, rời cây cảnh)
          }
          // Đèn bàn: đế ở góc sau-phải mặt bàn, tay đèn vươn chéo về phía laptop; mặt LED nằm trong lòng chụp.
          const lamp = workLamp(study), lampHead = WORK_LAMP_HEAD;
          lamp.position.set(dX + .3, yIn + dH + .001, dZ - .12); lamp.rotation.y = -1.0;
          const bulbMat = new THREE.MeshStandardMaterial({ color: 0xE2D6C0, emissive: 0xffc46d, emissiveIntensity: 0, roughness: .65 });
          const bulb = new THREE.Mesh(new THREE.CircleGeometry(lampHead.radius * .86, 18), bulbMat);
          bulb.name = 'Bóng đèn bàn học'; bulb.rotation.x = Math.PI / 2; bulb.position.set(lampHead.x, lampHead.ledY, lampHead.z); lamp.add(bulb);
          const studyLight = new THREE.PointLight(0xffc46d, 0, 2.2 * CAMP_SCALE, 2);
          studyLight.name = 'Ánh sáng bàn học'; studyLight.position.set(lampHead.x, lampHead.ledY - .05, lampHead.z);
          studyLight.castShadow = false; lamp.add(studyLight);
          studyDeskLighting.light = studyLight; studyDeskLighting.bulb = bulbMat;
          // Lon nước ngọt ở góc trái phía trước mặt bàn, giữa nhãn quay về phía lối đi.
          const coke = sodaCan(); coke.scale.setScalar(1.155); coke.position.set(dX - .345, yIn + dH + .001, dZ + .1); coke.rotation.y = -.6; coke.name = 'Lon coke trên bàn học'; study.add(coke);
          // Laptop giữa bàn, trước ghế: MacBook Pro 16" (macbookPro ở trên) — nắp gắn bản lề mép sau (gập phẳng khi rảnh, mở ~106° khi làm việc)
          {
            const M = macbookPro(), lap = M.g; lap.name = 'Laptop'; lap.position.set(dX - .01, yIn + dH + .001, dZ + DD / 2 - .185); lap.scale.setScalar(1.11 * LAP_K); study.add(lap);   // mép trước laptop cách mép bàn ~2 cm cho tay với tới bàn phím · to thêm 30% (LAP_K)
            const glow = new THREE.PointLight(0x9fc8ff, 0, 1.4 * CAMP_SCALE, 2); glow.position.set(0, .14, .02); lap.add(glow);
            lap.traverse(o => { o.userData.noBake = true; });
            Object.assign(studyLaptop, { hinge: M.hinge, screen: M.screenMat, keys: M.keyMat, light: glow, group: lap, canvas: M.canvas, ctx: M.ctx, tex: M.tex, mode: 'dash', drawnAt: -1 });
          }
          study.userData.layout = {
            desk: { center: [dX, dZ], size: [DW, DD], height: dH },
            chair: { center: [chairX, chairZ], size: [.43, .43], facing: '-Z' }, lampSchedule: '18:30–06:00 Asia/Ho_Chi_Minh'
          };
          g.add(study);
          // ---- bàn ăn nhỏ ở nửa trước ô cửa lùa (0,55 × 0,38, mặt gỗ 3 cm — G 19/10 "làm mỏng bàn"; trước dày 8 cm, thò ra ngoài vỏ; chân giữa) + ghế đẩu ----
          const TX = x0 + 0.305, TZ = dz - 0.19, TW = 0.55, TD = 0.38;
          const tTop = bx(TW, 0.03, TD, woodMat, true, true, lineDark); tTop.name = 'Bàn vuông'; tTop.userData.noBake = true; tTop.position.set(TX, yIn + 0.805, TZ); tTop.castShadow = true; g.add(tTop);
          const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.78, 8), metalMat); tLeg.position.set(TX, yIn + 0.39, TZ); g.add(tLeg);
          const tFoot = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.02, 14), metalMat); tFoot.position.set(TX, yIn + 0.01, TZ); g.add(tFoot);
          // bữa sáng trên bàn (mặt bàn y = yIn + 0,82): hộp ngũ cốc & hộp cà phê nằm ngửa như 2 cuốn sách (nhãn hướng lên), chai sữa phía ngoài
          const breakfast = new THREE.Group(); breakfast.name = 'Đồ ăn sáng trên bàn vuông'; breakfast.userData.noBake = true; breakfast.position.set(TX, yIn + 0.821, TZ); g.add(breakfast);
          const BOOK_K = 1.1;
          const layFlat = (item, cx, cz, yaw) => {
            const ext = BREAKFAST_SIZE[item.name], h = ext[1] * BOOK_K, t = ext[2] * BOOK_K;
            item.scale.setScalar(BOOK_K); item.rotation.order = 'YXZ'; item.rotation.set(-Math.PI / 2, yaw, 0);
            item.position.set(cx + Math.sin(yaw) * h / 2, t / 2, cz + Math.cos(yaw) * h / 2);
          };
          // kỹ sư ngồi ghế đẩu phía −z (lưng về giường) ⇒ 3 món xếp vào nửa phía vách, nhường mép gần cho bát ngũ cốc
          let cerealBowl = null;
          const cereal = breakfastItem('cereal'); layFlat(cereal, -0.14, -0.02, 0.14); cereal.name = 'Hộp ngũ cốc'; breakfast.add(cereal);
          const coffee = breakfastItem('coffee'); layFlat(coffee, 0.1, -0.03, -0.2); coffee.name = 'Hộp cà phê'; breakfast.add(coffee);
          const milk = breakfastItem('milk'); milk.name = 'Chai sữa'; milk.position.set(0.2, 0, -0.08); breakfast.add(milk);
          {   // bát sứ trắng: ngũ cốc vàng nổi trên sữa
            const bowl = cerealBowl = new THREE.Group(); bowl.name = 'Bát ngũ cốc'; bowl.position.set(-0.05, 0, -0.1); bowl.visible = false; breakfast.add(bowl);
            const food = new THREE.Group(); food.name = 'Ngũ cốc + sữa'; bowl.add(food); bowl.userData.food = food;
            const ceramic = new THREE.MeshLambertMaterial({ color: 0xf2efe8, side: THREE.DoubleSide });
            const shellB = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.04, 0], [0.042, 0.006], [0.07, 0.034], [0.078, 0.056], [0.073, 0.057], [0.065, 0.036], [0.036, 0.009], [0, 0.009]].map(([r, y]) => new THREE.Vector2(r, y)), 20), ceramic);
            shellB.castShadow = true; bowl.add(shellB);
            const milkTop = new THREE.Mesh(new THREE.CircleGeometry(0.066, 20), new THREE.MeshLambertMaterial({ color: 0xfbf6ea })); milkTop.rotation.x = -Math.PI / 2; milkTop.position.y = 0.043; food.add(milkTop);
            const flakeM = new THREE.MeshLambertMaterial({ color: 0xd9a64a });
            for (let k = 0; k < 14; k++) { const a = k * 2.4, r = 0.012 + (k % 5) * 0.011, f = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.005, 0.013), flakeM); f.position.set(Math.cos(a) * r, 0.046, Math.sin(a) * r); f.rotation.set(0.3 * Math.sin(k), a, 0.25 * Math.cos(k * 1.7)); food.add(f); }
          }
          const tableUdon = udonBowl(); tableUdon.position.set(-0.05, 0, -0.1); tableUdon.scale.setScalar(1.2); tableUdon.visible = false; breakfast.add(tableUdon);
          // ghế đẩu tròn (mặt gỗ cao 0,48 m như ghế bàn học): bình thường kéo lùi sát mép giường, ngồi xong nhích vào
          const STOOL_REST = 0.04, STOOL_IN = 0.16;
          const stool = new THREE.Group(); stool.name = 'Ghế đẩu bàn ăn'; stool.userData.noBake = true; stool.position.set(0, 0, 0); g.add(stool);
          { const sx0 = TX, sz0 = STOOL_REST;
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.162, 0.05, 18), woodMat); top.position.set(sx0, yIn + 0.455, sz0); top.castShadow = true; stool.add(top);
            for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.45, 6), metalMat);
              leg.position.set(sx0 + Math.cos(a) * 0.12, yIn + 0.215, sz0 + Math.sin(a) * 0.12); leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); leg.castShadow = true; stool.add(leg); }
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.009, 4, 18), metalMat); ring.rotation.x = Math.PI / 2; ring.position.set(sx0, yIn + 0.15, sz0); stool.add(ring); }
          // mũ bảo hộ đặt cuối giường lúc ngủ
          const bedHelmet = engHelmetProp(); bedHelmet.position.set(x0 + 0.28, yIn + mattTop - 0.02, bedZ + 0.16); bedHelmet.rotation.y = 0.6; bedHelmet.visible = false; g.add(bedHelmet);
          const kitchen = motorhomeKitchen(galley, trInCeil(0.75) - galley.position.y);   // ống gió máy hút mùi (z 0,60 … 0,74 kể cả mặt bích) chạy tới trần vỏ GLB chỗ đó   // bếp theo mẫu: chậu, bàn sơ chế, bảng treo đồ, bếp 4 họng lửa + lò nướng; ống hút mùi lên tới trần

          // ==== phòng tắm ướt ở đuôi xe (x 2,27 → 2,99 · cả bề ngang): bồn cầu gọn sát vách −z + vòi sen phía trên (rèm kính mờ trượt),
          //      lavabo treo vách +z (sau đầu tủ bếp, vách lùi tới x 2,535), kệ mũ, khăn trên tấm rèm cố định. Vách & cửa trong suốt (ẩn khi xem xuyên) ====
          const bthW = 2 * dz, bthLen = xB - x1, bthCX = (x1 + xB) / 2, flY = yIn, ceilY = ceil - 0.02;
          const bthWallM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.42, depthWrite: false });
          const twcM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }), tileM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }),
            mirrorM = new THREE.MeshLambertMaterial({ color: 0xbfe0e8 }), towelM = new THREE.MeshLambertMaterial({ color: 0xd98c6a });
          const bath = new THREE.Group(); bath.name = 'Phòng tắm gọn';
          bath.userData.layout = { length: bthLen, width: bthW, floorArea: bthLen * bthW, entryWidth: 0.6, wetBath: [bthLen, 0.73], rearX: xB };
          const bthFlr = bx(bthLen, 0.012, bthW, tileM); bthFlr.position.set(bthCX, flY + 0.006, 0); bthFlr.receiveShadow = true; bath.add(bthFlr);
          const bthLight = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.03, 12), litMat); bthLight.position.set(bthCX, ceil - 0.03, 0); bath.add(bthLight);
          const doorM = new THREE.MeshLambertMaterial({ color: 0xd9e3e6, transparent: true, opacity: 0.55, depthWrite: false });
          const panel = (x0p, x1p, y0, y1, z0, z1, mat = bthWallM) => { const m = bx(x1p - x0p, y1 - y0, z1 - z0, mat, mat !== doorM, true, lineDark); m.position.set((x0p + x1p) / 2, (y0 + y1) / 2, (z0 + z1) / 2); bath.add(m); return m; };
          // vách trước: đoạn đặc phía bàn học (bảng ghim treo mặt ngoài) · khe cửa lùa giữa lối đi · đoạn cạnh bếp; vách lùi sau đầu tủ bếp
          const entry = [-0.30, 0.30], doorTop = flY + 1.97, kitZ = 0.33, kitX = 2.535;
          // vách ngang xe (mặt phẳng x = xc) cắt theo lòng xe VỎ GLB (TR_IN) ⇒ không thò ra ngoài vách hông khum / góc bo mui
          const innerSec = () => { const h = [], m = 0.012;
            for (const y of [yIn, 1.6, 2.0, 2.3, 2.5, 2.6, 2.7, 2.77]) h.push([trInW(y) - m, y]);
            for (const z of [0.78, 0.75, 0.6, 0.5, 0.35, 0]) h.push([z, trInCeil(z) - m]);
            return [...h, ...h.slice(0, -1).reverse().map(([z, y]) => [-z, y])]; };
          const clip = (P, f) => { const out = []; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], fa = f(a), fb = f(b); if (fa >= 0) out.push(a); if (fa * fb < 0) { const t = fa / (fa - fb); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); } } return out; };
          const xWall = (xc, t, z0, z1, y0, y1) => { let P = innerSec(xc); for (const f of [p => p[0] - z0, p => z1 - p[0], p => p[1] - y0, p => y1 - p[1]]) P = clip(P, f);
            const geo = new THREE.ExtrudeGeometry(new THREE.Shape(P.map(([z, y]) => new THREE.Vector2(z, y))), { depth: t, bevelEnabled: false }); geo.rotateY(-Math.PI / 2); geo.translate(xc + t / 2, 0, 0);
            const m = new THREE.Mesh(geo, bthWallM); m.receiveShadow = true; edge(m, geo, lineDark); bath.add(m); return m; };
          xWall(x1, 0.05, -1.1, entry[0], flY, 3.2);
          xWall(x1, 0.05, entry[0], entry[1], doorTop, 3.2);
          xWall(x1, 0.05, entry[1], kitZ, flY, 3.2);
          panel(x1, kitX, flY, ceilY, kitZ - 0.025, kitZ + 0.025);
          xWall(kitX, 0.05, kitZ, 1.1, flY, 3.2);
          const entryDoorG = new THREE.Group(); entryDoorG.name = 'Cửa lùa phòng tắm'; entryDoorG.userData.noBake = true; bath.add(entryDoorG);   // trượt về −z (vào trong, sau vách đặc) khi mở
          entryDoorG.add(panel(x1 + 0.03, x1 + 0.055, flY + 0.02, doorTop - 0.01, entry[0] - 0.02, entry[1] + 0.02, doorM));
          const entryHandle = bx(0.03, 0.16, 0.03, caravanDark, false, false); entryHandle.position.set(x1 - 0.005, flY + 0.98, entry[1] - 0.06); entryDoorG.add(entryHandle);
          // rèm kính mờ buồng tắm (dọc trục xe ở z = wcZ): tấm cố định phía sau (treo khăn) + tấm trượt phía trước (mở: lùi về sau, chồng lên tấm cố định)
          const wcZ = -0.25, curt = [x1 + 0.05, 2.66];
          panel(curt[1], xB - 0.01, flY + 0.06, ceilY - 0.06, wcZ - 0.012, wcZ + 0.012, doorM);
          const wcDoorG = new THREE.Group(); wcDoorG.name = 'Rèm trượt buồng tắm'; wcDoorG.userData.noBake = true; bath.add(wcDoorG);   // trượt về +x khi mở
          wcDoorG.add(panel(curt[0], curt[1] + 0.02, flY + 0.06, ceilY - 0.06, wcZ - 0.04, wcZ - 0.018, doorM));
          const rail = bx(bthLen, 0.02, 0.02, metalMat, false, false); rail.position.set(bthCX, ceilY - 0.04, wcZ - 0.02); bath.add(rail);
          // bồn cầu gọn (kiểu cassette): két sát vách −z, mặt quay về +z (lối vào); nắp có bản lề lật dựng vào két
          const twcX = 2.62, twcZ = -dz + 0.29;
          const toilet = new THREE.Group(); toilet.name = 'Bồn cầu hướng cửa phòng tắm';
          const twcBowl = bx(0.42, 0.40, 0.38, twcM, true, true, lineDark); twcBowl.position.set(0, flY + 0.24, 0); toilet.add(twcBowl);
          const twcPed = bx(0.2, 0.24, 0.2, twcM, true, true, lineDark); twcPed.position.set(0.02, flY + 0.12, 0); toilet.add(twcPed);
          const twcTank = bx(0.13, 0.36, 0.38, twcM, true, true, lineDark); twcTank.position.set(0.215, flY + 0.58, 0); toilet.add(twcTank);
          const twcLidHinge = new THREE.Group(); twcLidHinge.name = 'Bản lề nắp bồn cầu'; twcLidHinge.userData.noBake = true; twcLidHinge.position.set(0.13, flY + 0.4625, 0); toilet.add(twcLidHinge);
          const twcLid = bx(0.34, 0.045, 0.36, twcM, true, true, lineDark); twcLid.position.set(-0.17, -0.0225, 0); twcLidHinge.add(twcLid);
          const twcSeat = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.038, 6, 16), twcM); twcSeat.rotation.x = Math.PI / 2; twcSeat.scale.x = 1.25; twcSeat.position.set(-0.02, flY + 0.42, 0); twcSeat.castShadow = true; toilet.add(twcSeat);
          const twcBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.03, 12), metalMat); twcBtn.position.set(0.215, flY + 0.775, 0); toilet.add(twcBtn);
          toilet.rotation.y = Math.PI / 2; toilet.position.set(twcX, 0, twcZ);   // dựng quay −x, xoay ¼ vòng ⇒ két về −z
          toilet.userData.noBake = true; bakeStatic(toilet); bath.add(toilet);
          // vòi xịt vệ sinh trên vách −z cạnh bồn cầu (phía cửa): van góc · giá treo · đầu xịt · dây mềm buông võng
          const spX = x1 + 0.1, spZ = -dz + 0.03;
          const spValve = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.05, 10), metalMat); spValve.rotation.x = Math.PI / 2; spValve.position.set(spX, flY + 0.38, spZ); bath.add(spValve);
          const spHolder = bx(0.06, 0.06, 0.05, metalMat, false, false); spHolder.position.set(spX, flY + 0.72, spZ); bath.add(spHolder);
          const spHead = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.018, 0.15, 10), metalMat); spHead.position.set(spX, flY + 0.72, spZ + 0.04); spHead.castShadow = true; bath.add(spHead);
          const spNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.045, 10), metalMat); spNozzle.rotation.x = Math.PI / 2; spNozzle.position.set(spX, flY + 0.8, spZ + 0.065); bath.add(spNozzle);
          const spHose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            new THREE.Vector3(spX, flY + 0.38, spZ + 0.03), new THREE.Vector3(spX + 0.03, flY + 0.27, spZ + 0.09),
            new THREE.Vector3(spX + 0.05, flY + 0.33, spZ + 0.1), new THREE.Vector3(spX + 0.02, flY + 0.55, spZ + 0.06), new THREE.Vector3(spX, flY + 0.65, spZ + 0.04)
          ]), 24, 0.008, 6, false), metalMat); bath.add(spHose);
          // lavabo treo vách +z (sau vách lùi): tủ + mặt đá + chậu + vòi + gương, quay mặt vào phòng (−z)
          const snkX = (kitX + xB) / 2, sWallZ = dz - 0.02;
          const snkCab = bx(0.38, 0.42, 0.3, woodMat, true, true, lineDark); snkCab.position.set(snkX, flY + 0.5, sWallZ - 0.15); bath.add(snkCab);
          const snkTop = bx(0.42, 0.05, 0.34, tileM, true, true, lineDark); snkTop.position.set(snkX, flY + 0.735, sWallZ - 0.17); bath.add(snkTop);
          const snkBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.09, 0.1, 14), twcM); snkBasin.position.set(snkX, flY + 0.78, sWallZ - 0.19); snkBasin.castShadow = true; bath.add(snkBasin);
          const snkTap = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.14, 8), metalMat); snkTap.position.set(snkX, flY + 0.83, sWallZ - 0.05); bath.add(snkTap);
          const snkSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.11, 8), metalMat); snkSpout.rotation.x = -Math.PI / 2.3; snkSpout.position.set(snkX, flY + 0.9, sWallZ - 0.1); bath.add(snkSpout);
          const mirror = bx(0.32, 0.4, 0.03, mirrorM, false, true, lineDark); mirror.position.set(snkX, flY + 1.16, sWallZ - 0.015); bath.add(mirror);
          const tapWater = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.09, 6), new THREE.MeshLambertMaterial({ color: 0xbfe2ff, transparent: true, opacity: 0.7, depthWrite: false }));
          tapWater.name = 'Nước chảy từ vòi'; tapWater.userData.noBake = true; tapWater.visible = false; tapWater.position.set(snkX, flY + 0.84, sWallZ - 0.15); bath.add(tapWater);
          // kệ gỗ nhỏ trên vách lùi (mặt trong phòng tắm): chỗ đặt mũ bảo hộ lúc tắm
          const shelfX = kitX + 0.11, shelfZ = 0.5, shelfY = flY + 1.42;
          const shelfBoard = bx(0.2, 0.025, 0.24, woodMat, true, true, lineDark); shelfBoard.position.set(shelfX, shelfY, shelfZ); bath.add(shelfBoard);
          for (const sz of [-0.08, 0.08]) { const br = bx(0.02, 0.1, 0.02, metalMat, false, false); br.position.set(kitX + 0.035, shelfY - 0.06, shelfZ + sz); bath.add(br); }
          const shelfHelmet = engHelmetProp(); shelfHelmet.position.set(shelfX + 0.02, shelfY + 0.0125, shelfZ); shelfHelmet.rotation.y = Math.PI / 2; shelfHelmet.visible = false; bath.add(shelfHelmet);
          // khăn tắm treo mặt ngoài tấm rèm cố định
          const towelX = (curt[1] + xB) / 2;
          const towelBar = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.28, 8), metalMat); towelBar.rotation.z = Math.PI / 2; towelBar.position.set(towelX, flY + 0.98, wcZ + 0.05); bath.add(towelBar);
          const towel = bx(0.26, 0.4, 0.035, towelM, true, true, lineDark); towel.position.set(towelX, flY + 0.78, wcZ + 0.045); towel.name = 'Khăn tắm'; towel.userData.noBake = true; bath.add(towel);
          // ĐỒ DỌN SAU KHI DÙNG (G 21/10 "sau khi đi vệ sinh hoặc tắm là dọn nhà vệ sinh nhà tắm"): chổi cọ bồn cầu trong cốc ở góc sau −z cạnh bồn · cây gạt
          //  nước treo vách lùi (cạnh kệ mũ) · vệt nước trên sàn buồng tắm (ướt khi tắm, gạt về phễu thì khô, tự khô ~25 phút) — engineer/tasks/van-stations.js stCleanWc / stCleanBath
          const brushM = new THREE.MeshLambertMaterial({ color: 0x5b8fb0 }), bristleM = new THREE.MeshLambertMaterial({ color: 0xe8e2d2 });
          const brCup = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.16, 12), brushM); brCup.position.set(xB - 0.09, flY + 0.08, -dz + 0.1); brCup.castShadow = true; bath.add(brCup);
          const brush = new THREE.Group(); brush.name = 'Chổi cọ bồn cầu'; brush.position.set(xB - 0.09, flY + 0.05, -dz + 0.1); bath.add(brush);
          { const h = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 8), brushM); h.position.y = 0.2; brush.add(h); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.035, 0.08, 10), bristleM); b.position.y = 0.02; brush.add(b); }
          const squee = new THREE.Group(); squee.name = 'Cây gạt nước'; squee.position.set(kitX + 0.04, flY + 1.15, 0.78); squee.rotation.y = Math.PI / 2; bath.add(squee);
          { squee.add(bx(0.26, 0.04, 0.02, caravanDark, false, false)); const hd = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), brushM); hd.position.y = -0.1; squee.add(hd); }
          const wetM = new THREE.MeshLambertMaterial({ color: 0xa8d4ea, transparent: true, opacity: 0, depthWrite: false });
          const wetFloor = new THREE.Mesh(new THREE.PlaneGeometry(xB - x1 - 0.06, wcZ + dz - 0.03), wetM); wetFloor.rotation.x = -Math.PI / 2; wetFloor.position.set((x1 + xB) / 2, flY + 0.017, (wcZ - dz) / 2); wetFloor.visible = false; wetFloor.name = 'Vệt nước sàn buồng tắm'; bath.add(wetFloor);
          for (const o of [brush, squee, wetFloor]) { o.userData.noBake = true; o.traverse(c => { c.userData.noBatch = true; }); o.userData.home = { p: o.position.clone(), q: o.quaternion.clone() }; }
          // vòi sen trên vách −z phía trên bồn cầu (trần thấp ⇒ cần sen ngắn, chếch xuống) + bộ trộn + phễu thoát sàn
          const shX = twcX, sideZ = -dz + 0.03;
          //  19/10: sen treo TRẦN (ống thả 12 cm) thay cần gắn vách — vách vỏ GLB khum vào ở độ cao này (|z| 0,81 ở y 2,74), cần cũ thò ra ngoài vỏ
          const shTop = trInCeil(sideZ + 0.19) - 0.012;
          const shArm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.12, 8), metalMat); shArm.position.set(shX, shTop - 0.06, sideZ + 0.19); bath.add(shArm);
          const shHead = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.06, 0.05, 14), metalMat); shHead.rotation.x = -0.2; shHead.position.set(shX, shTop - 0.145, sideZ + 0.19); bath.add(shHead);
          const shMixer = bx(0.12, 0.16, 0.045, metalMat, false, true, lineDark); shMixer.position.set(x1 + 0.2, flY + 1.06, sideZ + 0.02); bath.add(shMixer);
          const drain = bx(0.14, 0.01, 0.14, caravanDark, false, true); drain.position.set(twcX - 0.05, flY + 0.014, wcZ - 0.13); bath.add(drain);
          bath.userData.xray = 'shell'; bath.userData.vanWall = true;   // vách trong: thanh trượt nét viền không làm mờ (ui/xray-lifecycle.js)
          for (const item of [brCup, brush, squee, wetFloor, bthFlr, toilet, spValve, spHolder, spHead, spNozzle, spHose, snkCab, snkTop, snkBasin, snkTap, snkSpout, mirror, towelBar, towel, shArm, shHead, shMixer, drain, bthLight, tapWater, shelfBoard, shelfHelmet]) item.userData.xray = 'keep';
          const bathRig = { entryDoor: entryDoorG, wcDoor: wcDoorG, lid: twcLidHinge, towel, tapWater, shelfHelmet, doorMat: doorM, wallMat: bthWallM, group: bath, brush, squee, wetM, wetFloor, wet: 0,
            showerHead: [shX, shTop - 0.145, sideZ + 0.19], mixer: [x1 + 0.2, flY + 1.06, sideZ + 0.04], flush: [twcX, flY + 0.73, -dz + 0.08], shelf: [shelfX, shelfY, shelfZ] };
          bath.userData.noBake = true;
          bakeStatic(bath); g.add(bath);

          // ==== MÁI: quạt hút (trên giường) · giàn pin 3 tấm · ống khói bếp · quạt phòng tắm · chảo Starlink · ăng-ten · 2 thanh giá nóc ====
          const roofDetails = new THREE.Group(); roofDetails.name = 'Thiết bị mái xe chi tiết';
          roofDetails.userData.noBake = true; g.add(roofDetails);
          function roofBox(w, h, d, x, y, z, mat, outlined = false) {
            const m = bx(w, h, d, mat, true, outlined, lineDark); m.position.set(x, y, z); roofDetails.add(m); return m;
          }
          function roofLid(w, d, h, cut, x, y, z, mat) {
            const shape = new THREE.Shape();
            shape.moveTo(-w / 2 + cut, -d / 2); shape.lineTo(w / 2 - cut, -d / 2);
            shape.lineTo(w / 2, -d / 2 + cut); shape.lineTo(w / 2, d / 2 - cut);
            shape.lineTo(w / 2 - cut, d / 2); shape.lineTo(-w / 2 + cut, d / 2);
            shape.lineTo(-w / 2, d / 2 - cut); shape.lineTo(-w / 2, -d / 2 + cut); shape.closePath();
            const bevel = .018;
            const geo = new THREE.ExtrudeGeometry(shape, { depth: h - bevel * 2, bevelEnabled: true, bevelSize: bevel, bevelThickness: bevel, bevelSegments: 1, curveSegments: 1, steps: 1 });
            geo.rotateX(-Math.PI / 2); geo.translate(0, bevel, 0);
            const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true;
            edge(m, geo, lineDark); roofDetails.add(m); return m;
          }
          function roofVent(x, z, size, height) {   // đế ôm mặt mui: mui cao Transit dốc xuống đầu xe (x < 0,5) và khum xuống 2 mép ⇒ quạt nghiêng theo cả 2 chiều, tâm = trung bình 5 điểm
            const s = size / 2, Y = (dx, dz) => roofTop(x + dx, z + dz), a = Math.atan2(Y(s, 0) - Y(-s, 0), size), b = Math.atan2(Y(0, s) - Y(0, -s), size);
            const y = (Y(0, 0) + Y(s, s) + Y(s, -s) + Y(-s, s) + Y(-s, -s)) / 5, n0 = roofDetails.children.length;
            roofBox(size + .05, .025, size + .05, x, y + .0125, z, metalMat);
            roofBox(size - .065, .075, size - .065, x, y + .0625, z, caravanDark);
            roofLid(size - .035, size - .035, height - .08, .055, x, y + .08, z, caravanDark);
            for (const side of [-1, 1]) for (let n = -2; n <= 2; n++) roofBox(size * .68, .012, .012, x, y + .045 + (n + 2) * .01, z + side * (size / 2 - .027), metalMat);
            const vg = new THREE.Group(); vg.position.set(x, y, z); vg.rotation.set(-b, 0, a); for (const m of roofDetails.children.slice(n0)) { vg.add(m); m.position.sub(vg.position); } roofDetails.add(vg);
          }
          roofVent(-0.35, 0, .5, .19);   // G 21/10 "sắp xếp lại nóc xe cho gọn gàng hợp lý" (mũi tên trên ảnh): quạt hút trước về giữa mui, lùi lên đầu xe, cách giàn pin 22 cm (trước x −0,15 z −0,38 sát tấm pin đầu)
          roofVent(2.62, -0.45, .36, .15);
          {   // ống khói bếp (thông máy hút mùi): tấm bích kín nước + ống inox Ø9 cm cao 32 cm + chụp nón che mưa trên 3 chân — ngay trên bếp
            const cx = galley.position.x - 0.47, cz = 0.66, y = roofTop(cx, cz), pipe = new THREE.MeshLambertMaterial({ color: 0xa7b0b3 });   // thẳng ống gió máy hút mùi (van/kitchen.js)
            roofBox(.18, .02, .18, cx, y + .01, cz, metalMat);
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(.045, .048, .32, 14), pipe); tube.position.set(cx, y + .17, cz); tube.castShadow = true; roofDetails.add(tube);
            const cap = new THREE.Mesh(new THREE.ConeGeometry(.095, .07, 16), pipe); cap.position.set(cx, y + .395, cz); cap.castShadow = true; roofDetails.add(cap);
            for (let k = 0; k < 3; k++) { const a = k * 2.094, leg = new THREE.Mesh(new THREE.BoxGeometry(.008, .06, .008), pipe); leg.position.set(cx + Math.cos(a) * .04, y + .345, cz + Math.sin(a) * .04); roofDetails.add(leg); }
            g.userData.chimneyTop = new THREE.Vector3(cx, y + .35, cz);   // miệng thoát khói (toạ độ xe)
          }
          // ---- GIÀN PIN MẶT TRỜI (G 19/10 "tạo lại solar trên xe van cho phù hợp size của xe"; trước 2 tấm 1,24 × 0,6 đv chỉ phủ ~1/4 mui): mui cao
          //      Transit L3H2 trống ~2,4 × 1,6 đv giữa quạt hút trước, quạt phòng tắm và chảo Starlink ⇒ 3 tấm 0,75 × 1,34 đv (0,68 × 1,22 m, ~180 W/tấm,
          //      tổng ~540 W như các bản độ Transit) nằm NGANG mui, mỗi tấm gác trên 2 thanh nhôm ngang bắt vào 2 thanh giá nóc (cột ngắn ở 2 đầu);
          //      mặt pin = lưới 6 × 10 cell đơn tinh thể (canvas) viền nhôm; chừa ống khói bếp (z 0,66) phía cửa lùa ----
          const SOL = { xs: [0.5, 1.3, 2.1], w: 0.75, z0: -0.82, z1: 0.52 }, solZ = (SOL.z0 + SOL.z1) / 2, solL = SOL.z1 - SOL.z0;
          const cellTex = (() => { const c = document.createElement('canvas'); c.width = 96; c.height = 160; const x = c.getContext('2d');
            x.fillStyle = '#c9ced3'; x.fillRect(0, 0, 96, 160);   // khe sáng giữa các cell
            for (let i = 0; i < 6; i++) for (let j = 0; j < 10; j++) {
              const px = 1.2 + i * 15.6, py = 1.2 + j * 15.6; x.fillStyle = '#17273e'; x.fillRect(px, py, 14.4, 14.4);
              x.fillStyle = '#c9ced3'; for (const [a, b] of [[0, 0], [12.9, 0], [0, 12.9], [12.9, 12.9]]) x.fillRect(px + a, py + b, 1.5, 1.5);   // góc vát cell
              x.fillStyle = 'rgba(200,208,216,.6)'; for (const k of [4.4, 9.4]) x.fillRect(px + k, py, 0.7, 14.4);   // 2 thanh cái
            }
            const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; })();
          const cellMat = new THREE.MeshLambertMaterial({ map: cellTex }), aluMat = new THREE.MeshLambertMaterial({ color: 0xb9bfc4 });
          const railTop = z => roofTop(1, z) + .095;   // mặt trên thanh giá nóc (ống Ø5 cm, tâm cao hơn mui 7 cm)
          for (const px of SOL.xs) {
            let yr = 0; for (const dx of [-SOL.w / 2, 0, SOL.w / 2]) for (const z of [SOL.z0, solZ, 0, SOL.z1]) yr = Math.max(yr, roofTop(px + dx, z));
            const yb = Math.max(yr + .035, railTop(.84) + .015), yp = yb + .0325;   // tâm thanh ngang (cao hơn đỉnh mui khum) · tâm tấm pin
            const p = new THREE.Mesh(new THREE.BoxGeometry(SOL.w, .035, solL), [aluMat, aluMat, cellMat, aluMat, aluMat, aluMat]);
            p.position.set(px, yp, solZ); p.castShadow = p.receiveShadow = true; edge(p, p.geometry, lineDark); roofDetails.add(p);
            for (const dx of [-.28, .28]) {
              roofBox(.04, .03, 1.72, px + dx, yb, 0, aluMat);   // thanh ngang gác lên 2 thanh giá nóc
              for (const sz of [-1, 1]) { const h = yb - .015 - (railTop(.84) - .05); roofBox(.035, h, .035, px + dx, yb - .015 - h / 2, sz * .84, metalMat); }   // cột ngắn xuống thanh giá
              for (const zf of [SOL.z0 + .05, SOL.z1 - .05]) roofBox(.05, .025, .05, px + dx, yb + .03, zf, caravanDark);   // kẹp giữ tấm pin
            }
          }
          // dây pin: từ mép sau tấm cuối xuống hộp đấu dây + ống luồn qua mui (giữa quạt phòng tắm và chảo Starlink)
          { const jx = 2.6, jy = roofTop(jx, -.08), p0 = new THREE.Vector3(SOL.xs[2] + SOL.w / 2 - .03, roofTop(SOL.xs[2], 0) + .06, -.08);
            const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, new THREE.Vector3(jx - .06, jy + .07, -.08), new THREE.Vector3(jx - .02, jy + .05, -.08)]), 8, .009, 5, false), caravanDark);
            wire.castShadow = true; roofDetails.add(wire);
            roofBox(.14, .05, .12, jx + .04, jy + .025, -.08, caravanRoofM); }   // hộp đấu dây giàn pin
          for (const sz of [-1, 1]) {   // 2 thanh giá nóc dọc 2 mép mui, chân bắt vào gân mui
            const rz = sz * .84, y = roofTop(1, rz) + .07;
            const rl = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 3.1, 6), metalMat); rl.rotation.z = Math.PI / 2; rl.position.set(1.32, y, rz); rl.castShadow = true; roofDetails.add(rl);
            for (const rx of [-0.15, 1.3, 2.8]) roofBox(.08, .07, .07, rx, y - .035, rz, caravanDark);
          }
          // ---- chảo Starlink (đĩa phẳng nghiêng trên trụ) gần đuôi mui ----
          const slX = 2.72, slZ = 0.45, slY = roofTop(slX, slZ);   // sau giàn pin (19/10 dời từ x 2,3)
          const slBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.05, 12), caravanDark); slBase.position.set(slX, slY + 0.025, slZ); g.add(slBase);
          const slPole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.3, 8), metalMat); slPole.position.set(slX, slY + 0.18, slZ); slPole.castShadow = true; g.add(slPole);
          const slBack = bx(0.42, 0.04, 0.36, caravanDark, true, false); slBack.position.set(slX - 0.045, slY + 0.33, slZ); slBack.rotation.z = 0.44; g.add(slBack);
          const slDish = bx(0.46, 0.035, 0.4, wallMat, true, true, lineDark); slDish.position.set(slX - 0.085, slY + 0.35, slZ); slDish.rotation.z = 0.44; g.add(slDish);
          const wifiShapes = [], dotY = -0.08;
          for (const radius of [0.08, 0.135, 0.19]) {
            const shape = new THREE.Shape(), halfStroke = 0.009;
            shape.absarc(0, dotY, radius + halfStroke, Math.PI / 4, Math.PI * 3 / 4, false);
            shape.absarc(0, dotY, radius - halfStroke, Math.PI * 3 / 4, Math.PI / 4, true);
            shape.closePath(); wifiShapes.push(shape);
          }
          const wifiDot = new THREE.Shape(); wifiDot.absarc(0, dotY, 0.022, 0, Math.PI * 2, false); wifiShapes.push(wifiDot);
          const wifiGeo = new THREE.ShapeGeometry(wifiShapes, 10);
          wifiGeo.rotateX(-Math.PI / 2); wifiGeo.translate(0, 0.019, 0);
          const wifi = new THREE.Mesh(wifiGeo, new THREE.MeshBasicMaterial({ color: 0x243240, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -1 }));
          wifi.name = 'Wi-Fi trên mặt đĩa'; wifi.userData.noBake = true;
          wifi.position.copy(slDish.position); wifi.quaternion.copy(slDish.quaternion); g.add(wifi);
          // ---- thang leo nóc trên cánh cửa sau bên tài (móc qua mép mui) · chắn bùn sau bánh sau ----
          const ladX = TR.rear + 0.07, ladY0 = 0.74, ladY1 = roofTop(2.9, -0.5) + 0.04, ladder = new THREE.Group(); ladder.name = 'Thang leo nóc'; ladder.userData.noBake = true; g.add(ladder);   // nhóm không gộp: dời theo cửa sau khi vỏ GLB nạp xong
          for (const lz of [-0.32, -0.74]) { const lr = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, ladY1 - ladY0, 6), metalMat); lr.castShadow = true; lr.position.set(ladX, (ladY0 + ladY1) / 2, lz); ladder.add(lr);
            const hook = bx(0.2, 0.03, 0.03, metalMat, true, false); hook.position.set(ladX - 0.09, ladY1, lz); ladder.add(hook);
            for (const y of [0.95, 2.2]) { const st = bx(0.07, 0.03, 0.03, metalMat, true, false); st.position.set(ladX - 0.035, y, lz); ladder.add(st); } }
          for (let r = 0; r < 7; r++) { const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.42, 6), metalMat); rung.rotation.x = Math.PI / 2; rung.position.set(ladX, 0.9 + r * 0.3, -0.53); ladder.add(rung); }
          for (const sz of [-1, 1]) { const flap = bx(0.03, 0.3, 0.26, tyreMat, true, false); flap.position.set(TR.xR + 0.6, 0.3, sz * TR.wz); g.add(flap); }
          // ---- họng nạp nước sạch + hộp điện bờ (vách −z sau) · bình ga LPG treo gầm phía tài ----
          const wIn = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.04, 10), rimMat); wIn.rotation.x = Math.PI / 2; wIn.position.set(2.55, 1.25, -1.075); g.add(wIn);
          const shore = bx(0.18, 0.22, 0.04, caravanDark, false, true, lineDark); shore.position.set(2.25, 1.25, -1.08); g.add(shore);
          const lpg = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.6, 12), rimMat); lpg.rotation.z = Math.PI / 2; lpg.position.set(0.85, 0.45, -0.62); lpg.castShadow = true; g.add(lpg);
          for (const sx of [-0.2, 0.2]) { const strap = bx(0.04, 0.08, 0.38, caravanDark, false, false); strap.position.set(0.85 + sx, 0.45, -0.62); g.add(strap); }

          // ---- bạt che hiên (hộp cuốn trên mép mui bên cửa lùa): bạt kẻ sọc DỐC XUỐNG ra ngoài (từ khe hộp cuốn tới thanh trước), thanh trước, diềm, 2 chân chống
          //      cắm đất, đèn lồng treo. G 18/10 khoanh 3 chỗ: bạt nghiêng NGƯỢC (rotation.x −0,16 ⇒ mép ngoài cao hơn mép trong) nên hở cả với hộp cuốn lẫn thanh
          //      trước; hộp cuốn kéo tới x −1,15 thò ra khỏi chỗ mui cao hạ dần xuống kính lái ⇒ cả bộ bạt chỉ trên đoạn mui cao thẳng x −0,75 … 2,9 (mép mui
          //      x −0,75 ở y 2,72 = đáy hộp cuốn); chân chống đỡ ngay dưới 2 đầu thanh trước (bỏ chỏm cầu thò trên thanh), vào danh sách vật cản để lối đi vòng ----
          const awFront = -0.75, awRear = 2.9, awLen = awRear - awFront, awC = (awFront + awRear) / 2, awY = 2.62, awTilt = 0.16;
          const cass = bx(awLen + 0.06, 0.11, 0.13, caravanRoofM, true, true, lineDark); cass.name = 'Hộp cuốn bạt'; cass.position.set(awC, 2.78, 0.99); g.add(cass);
          const aw = bx(awLen, 0.014, 2.4, awningMat, true, true, lineDark); aw.position.set(awC, awY, wallZ + 1.2 - 0.06); aw.rotation.x = awTilt; g.add(aw);   // mép trong (y 2,81) nằm trong khe hộp cuốn · mép ngoài (y 2,43) ôm thanh trước
          const awEdgeZ = wallZ + 2.34, awEdgeY = awY - Math.sin(awTilt) * 1.2;
          g.userData.awPoles = [];
          for (const px of [awFront + 0.05, awRear - 0.05]) { const pTop = awEdgeY - 0.012, pBot = -1.4, pH = pTop - pBot; const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, pH, 6), chairFrame); pole.castShadow = true; pole.position.set(px, (pTop + pBot) / 2, awEdgeZ); g.add(pole); g.userData.awPoles.push([px, awEdgeZ]); }
          const stripeM = caravanStripe, chrome = rimMat;
          const awX = 1.1;
          for (let k = 0; k < 4; k++) { const band = bx(0.32, 0.018, 2.42, stripeM, false, false); band.position.set(awC + (k - 1.5) * 0.9, awY, wallZ + 1.14); band.rotation.x = awTilt; g.add(band); }   // dày hơn tấm bạt 2 mm mỗi mặt ⇒ không tranh độ sâu
          const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, awLen + 0.06, 8), chrome); roll.rotation.z = Math.PI / 2; roll.position.set(awC, awEdgeY + 0.02, awEdgeZ); roll.castShadow = true; g.add(roll);
          const valance = bx(awLen + 0.06, 0.16, 0.025, stripeM, false, true, lineDark); valance.position.set(awC, awEdgeY - 0.07, awEdgeZ + 0.01); g.add(valance);
          const awCord = cyl(0.012, 0.012, 0.18, new THREE.MeshLambertMaterial({ color: 0x243240 }), false, false, null, 6); awCord.name = 'awLan'; awCord.position.set(awX, awEdgeY - 0.07, awEdgeZ - 0.05); g.add(awCord);
          const body = lanBody(g, 'awLan');
          awLan = body.lan; awLan.position.set(awX, awEdgeY - 0.17, awEdgeZ - 0.05);
          awLight = body.light;

          // Bake each assembly once; release the superseded temporary geometry.
          for (const detail of [roofDetails, entrySteps, under]) {
            const original = new Set(); detail.traverse(o => { if (o.geometry) original.add(o.geometry); });
            bakeStatic(detail);
            const kept = new Set(); detail.traverse(o => { if (o.geometry) kept.add(o.geometry); });
            for (const geo of original) if (!kept.has(geo)) geo.dispose();
          }
          g.userData.interior = {
            bed: { center: [bedCx, bedZ], size: [bedLen, bedW] },
            table: { center: [TX, TZ], size: [TW, TD] },
            study: study.userData.layout,
            sleepPosition: [bedX1 - 0.1 - 2.33 * ENGINEER_BASE_SCALE, yIn + 0.49 + 0.05, bedZ], sleepHead: [bedX1 - 0.25, 3.2, bedZ],   // đỉnh đầu cách đầu giường 10 cm (gốc kỹ sư dưới gót 0,3 · cao 2,03 đv mẫu)
            stool: { obj: stool, rest: STOOL_REST, in: STOOL_IN, x: TX }, bath: bathRig, bedHelmet, kitchen, cerealBowl, tableUdon, studyCoke: coke,
            bedTop: yIn + mattTop, duvet, duvetMat: cushMat, bedGroup: bed   // engineer/tasks/sleep.js: mặt nệm, chăn gấp cuối giường (ẩn khi trải chăn đắp)
          };
          // xem xuyên: mặc định mọi thứ của xe là vỏ; sàn, nội thất, bánh xe & đèn lồng hiên giữ nguyên
          g.userData.xray = 'shell';
          for (const item of [floor, bed, study, tTop, tLeg, tFoot, breakfast, cup, axles, awCord, awLan, stool, bedHelmet, sillPlate, grab]) item.userData.xray = 'keep';
          return bakeStatic(g);
        }
        let awLight, awLan;
        const caravanObj = caravan(); caravanObj.scale.multiplyScalar(CAMP_SCALE); caravanObj.name = 'Xe Caravan (Motorhome)'; {
          const p = worldCell(CARAVAN_CELL[0], CARAVAN_CELL[1]); caravanObj.position.copy(p); caravanObj.rotation.y = Math.atan2(bobberBase.x - p.x, bobberBase.z - p.z); scene.add(caravanObj);
          // Transit L3H2 dài 6,6 · rộng 2,1 đv: 3 vòng xếp DỌC TRỤC XE (mũi · thân · đuôi) như 1 capsule
          const vc = Math.cos(caravanObj.rotation.y), vs = -Math.sin(caravanObj.rotation.y);   // local +x → world (cos ry, −sin ry)
          for (const [lx, rr] of [[-2.2, 1.9], [0.4, 2.0], [2.3, 1.85]])
            obstacleCoords.push({ x: p.x + lx * vc * CAMP_SCALE, y: p.y, z: p.z + lx * vs * CAMP_SCALE, r: rr * CAMP_SCALE, h: 3.0 * CAMP_SCALE });
          caravanObj.traverse(o => { if (o.isLine && o.material && o.material.isLineBasicMaterial) o.material = vanLine(o.material); });   // nét viền xe → vật liệu riêng (thanh trượt nét viền, ui/labels-controls.js) — lúc này chưa có người / chó nào trong xe
          for (const [lx, lz] of caravanObj.userData.awPoles)   // 2 chân chống bạt (local (x, z) → thế giới): lưới đường đi (flow field) vòng qua, không đâm vào cột rồi trượt qua lại
            obstacleCoords.push({ x: p.x + (lx * vc - lz * vs) * CAMP_SCALE, y: p.y, z: p.z + (lx * vs + lz * vc) * CAMP_SCALE, r: 0.12, h: 2.6 * CAMP_SCALE });
        }

        updateStudyLamp();

