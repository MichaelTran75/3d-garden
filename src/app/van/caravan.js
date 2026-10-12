        const studyDeskLighting = { light: null, bulb: null, on: null };
        const studyLaptop = { hinge: null, screen: null, light: null, open: 0, target: 0 };   // laptop bàn học: nắp mở/đóng + màn hình sáng khi kỹ sư làm việc
        const studyChairRig = { obj: null, home: 0, off: 0 };   // ghế bàn học: kéo ra / đẩy vào dọc trục trước–sau (đv xe)
        function updateStudyLamp() {
          const hh = liveWeather.localHour, on = hh >= 18.5 || hh < 6;
          if (!studyDeskLighting.light || on === studyDeskLighting.on) return;
          studyDeskLighting.on = on;
          // Keep the light allocated and only change uniforms at dusk/dawn.
          studyDeskLighting.light.intensity = on ? 1.35 : 0;
          studyDeskLighting.bulb.emissiveIntensity = on ? 1.6 : 0;
        }
        function engHelmetProp() {   // mũ bảo hộ rời (đv xe = cỡ mũ đang đội: ×ENGINEER_BASE_SCALE); gốc ở đáy 2 ốp tai (mũ đặt xuống thì tì trên ốp tai)
          const g = new THREE.Group(); g.name = 'Mũ bảo hộ (đã tháo)'; g.userData.noBake = true;
          const h = legoHelmet(engHelm, caravanDark); h.position.y = 0.07; g.add(h);   // cùng hình mũ đang đội; tì trên 2 ốp tai
          g.scale.setScalar(ENGINEER_BASE_SCALE); return g;
        }
        function caravan() {
          const g = new THREE.Group();
          const base = 0.95, Dc = 3.0, dz = Dc / 2;
          const x0 = -1.2, x1 = 3.0, bLen = x1 - x0, bcx = (x0 + x1) / 2, Hc = 2.7, yRoof = base + Hc, yIn = base + 0.12, bthLen = 1.05;   // bthLen: phòng tắm nối sau đuôi (mặt sau xe = x1 + bthLen)
          const floorMat = new THREE.MeshLambertMaterial({ color: 0xb99c73 }), woodMat = new THREE.MeshLambertMaterial({ color: 0x9c7b4f }),
            cushMat = new THREE.MeshLambertMaterial({ color: 0xc94f3d }), kitMat = new THREE.MeshLambertMaterial({ color: 0x86663f }),
            litMat = new THREE.MeshLambertMaterial({ color: 0xfff3c4 }),
            vanGlass = new THREE.MeshLambertMaterial({ color: 0x8fc1e3, transparent: true, opacity: 0.25 });  // kính xe trong suốt 75%
          const chassis = bx(bLen + 0.1, 0.22, Dc * 0.7, caravanDark, true, true, lineDark); chassis.position.set(bcx, base - 0.17, 0); g.add(chassis);
          const dX0 = -0.15, dX1 = 0.81, doorW = dX1 - dX0, doorH = 2.12;
          const floor = bx(bLen - 0.1, 0.12, Dc - 0.16, floorMat); floor.position.set(bcx, base + 0.06, 0); floor.receiveShadow = true; g.add(floor);
          const roof = bx(bLen + 0.14, 0.2, Dc + 0.14, caravanRoofM); roof.position.set(bcx, yRoof, 0); g.add(roof);
          motorhomeShell(g, caravanBody, caravanRoofM, vanGlass, base, x0, x1, dz, yRoof, dX0, dX1, doorH);
          const galley = motorhomeCab(g);
          const axles = new THREE.Group(); axles.name = 'Cầu bánh xe';
          const axleGeo = new THREE.CylinderGeometry(0.065, 0.065, 1, 8);
          for (const [axleX, track] of [[-2.096956, 2.46], [1.888478, 2.80]]) {
            const shaft = new THREE.Mesh(axleGeo, caravanDark);
            shaft.rotation.x = Math.PI / 2; shaft.scale.y = track;
            shaft.position.set(axleX, 0.50561, 0); shaft.castShadow = true; axles.add(shaft);
          }
          axles.userData.noBake = true; g.add(axles);
          // tấm cửa lùa đã đẩy ra sau (nằm trên ray, ngoài vách)
          const door = bx(doorW * 0.9, doorH, 0.08, caravanBody, true, true, lineDark); door.position.set(dX1 + doorW * 0.46, base + doorH / 2, dz + 0.12); g.add(door);
          const dWin = bx(doorW * 0.5, 0.7, 0.04, vanGlass, false, true, lineDark); dWin.position.set(dX1 + doorW * 0.46, base + doorH * 0.64, dz + 0.17); g.add(dWin);
          const dRail = bx(doorW + 1.4, 0.07, 0.07, caravanDark); dRail.position.set((dX0 + dX1) / 2 + 0.5, base + doorH + 0.05, dz + 0.12); g.add(dRail);
          // Fixed two-tread entry assembly: nosings, grip strips and chassis brackets.
          const entrySteps = new THREE.Group(); entrySteps.name = 'Bậc cửa có khung đỡ';
          entrySteps.userData.noBake = true;
          const stepCx = (dX0 + dX1) / 2, stepWidth = doorW * 0.7;
          function stepBox(w, h, d, x, y, z, mat, outlined = false) {
            const m = bx(w, h, d, mat, true, outlined, lineDark); m.position.set(x, y, z); entrySteps.add(m); return m;
          }
          function stepStrut(a, b) {
            const v = new THREE.Vector3().subVectors(b, a), m = bx(.045, v.length(), .045, metalMat, true, false);
            m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v.normalize());
            m.position.copy(a).add(b).multiplyScalar(.5); entrySteps.add(m);
          }
          const stepTreads = [{ y: base * .5, z: dz + .33, depth: .5, height: .12 }, { y: base * .24, z: dz + .6, depth: .42, height: .1 }];
          for (const t of stepTreads) {
            stepBox(stepWidth, t.height, t.depth, stepCx, t.y, t.z, caravanDark, true);
            stepBox(stepWidth - .035, .014, .045, stepCx, t.y + t.height / 2 + .006, t.z + t.depth / 2 - .025, rimMat);
            for (let n = 0; n < 5; n++) stepBox(stepWidth - .085, .009, .018, stepCx, t.y + t.height / 2 + .008, t.z - t.depth / 2 + .06 + n * (t.depth - .15) / 4, tyreMat);
          }
          for (const side of [-1, 1]) {
            const sx = stepCx + side * (stepWidth / 2 - .055);
            stepBox(.06, .18, .055, sx, base - .12, dz + .005, metalMat);
            stepStrut(new THREE.Vector3(sx, base - .08, dz + .025), new THREE.Vector3(sx, .07, dz + .77));
            stepStrut(new THREE.Vector3(sx, base * .5 - .06, dz + .52), new THREE.Vector3(sx, .07, dz + .77));
            stepBox(.12, .055, .14, sx, .0275, dz + .77, tyreMat);
            for (const t of stepTreads) stepBox(.08, .038, t.depth - .03, sx, t.y - t.height / 2 - .018, t.z, metalMat);
          }
          entrySteps.userData.treads = stepTreads;
          g.add(entrySteps);
          // ---- nội thất (nhìn qua cửa mở) ----
          // ---- giường: khung gỗ + nệm kem dày + chăn đỏ phủ chân giường + 2 gối đầu giường (sát vách sau) ----
          const bedLen = bLen * 0.62, bedW = 0.98, bedCx = x0 + bedLen / 2 + .08, bedZ = -dz + 0.62; // 8 cm clearance at the front wall (screen right).
          const bed = new THREE.Group(); bed.name = 'Giường dọc vách đối diện';
          // Giường đơn khung hộp dựng bằng code:
          // hộp trắng cao 0,45 m (vách lưng · 2 đầu giường · thanh trên + chân đế + trụ giữa mặt trước), 2 ngăn kéo đen có khe tay nắm,
          // đệm xám lọt lòng nhô 4 cm, gối tựa xếp dọc vách. Không dựng nan giường bên trong. Chiều dài giữ theo khoang xe.
          const flexaWhite = new THREE.MeshLambertMaterial({ color: 0xe6e4de }), flexaBlack = new THREE.MeshLambertMaterial({ color: 0x1f2022 });
          const mattGrey = new THREE.MeshLambertMaterial({ color: 0x8c8e90 });
          const bedH = 0.45, pt = 0.02, frontZ = bedZ + bedW / 2, backZ = bedZ - bedW / 2, mattTop = bedH + 0.04;
          const bedPart = (w, h, d, x, y, z, mat, outlined = true) => { const m = bx(w, h, d, mat, true, outlined, lineDark); m.position.set(x, yIn + y, z); bed.add(m); return m; };
          bedPart(bedLen, bedH, pt, bedCx, bedH / 2, backZ + pt / 2, flexaWhite);                                                   // vách lưng
          for (const sx of [-1, 1]) bedPart(pt, bedH, bedW, bedCx + sx * (bedLen / 2 - pt / 2), bedH / 2, bedZ, flexaWhite);   // 2 đầu giường
          bedPart(bedLen, 0.12, pt, bedCx, bedH - 0.06, frontZ - pt / 2, flexaWhite);                                          // thanh trên mặt trước
          bedPart(bedLen, 0.07, pt, bedCx, 0.035, frontZ - pt / 2, flexaWhite);                                                // chân đế mặt trước
          bedPart(0.03, 0.26, pt, bedCx, 0.2, frontZ - pt / 2, flexaWhite);                                                    // trụ giữa 2 ngăn kéo
          bedPart(bedLen - 2 * pt, 0.02, bedW - 2 * pt, bedCx, bedH - 0.08, bedZ, flexaWhite, false);                         // mặt đỡ đệm
          for (const sx of [-1, 1]) {                                                                                          // 2 ngăn kéo đen + khe tay nắm trắng
            const dx = bedCx + sx * bedLen / 4;
            bedPart(bedLen / 2 - 0.05, 0.25, 0.03, dx, 0.2, frontZ - 0.03, flexaBlack);
            bedPart(0.2, 0.025, 0.006, dx, 0.31, frontZ - 0.012, flexaWhite, false);
          }
          bedPart(bedLen - 0.05, 0.146, bedW - 0.05, bedCx, mattTop - 0.073, bedZ, mattGrey);                                  // đệm
          const duvet = bx(bedLen * 0.5, 0.06, bedW - 0.02, cushMat); duvet.position.set(bedCx - bedLen * 0.22, yIn + mattTop + 0.03, bedZ + 0.01); bed.add(duvet);   // chăn đỏ gấp cuối giường
          // Gối Flexa: thân phồng (dày giữa, dẹt dần về đường may, mép hơi cong vào tạo 4 góc nhọn), viền ống may quanh mép,
          // vải họa tiết quả trám (canvas). dent > 0 tạo vết lõm giữa mặt gối chỗ gác đầu.
          function flexaPillow(w, h, t, fabric, trim, dent = 0) {
            const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
            x.fillStyle = '#' + new THREE.Color(fabric).getHexString(); x.fillRect(0, 0, 128, 128);
            x.strokeStyle = x.fillStyle = '#' + new THREE.Color(trim).getHexString(); x.lineWidth = 2.5;
            for (let k = -128; k <= 128; k += 32) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 128, 128); x.moveTo(k + 128, 0); x.lineTo(k, 128); x.stroke(); }   // lưới quả trám
            for (let i = 0; i <= 8; i++) for (let j = 0; j <= 8; j++) if ((i + j) % 2 === 0) { x.beginPath(); x.arc(i * 16, j * 16, 3, 0, 7); x.fill(); }   // nút chần ở giao điểm
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
          const backPillow = flexaPillow(0.46, 0.44, 0.15, 0x6b6d6f, 0x8f9193);
          backPillow.position.set(bedCx + 0.42, yIn + mattTop + 0.21, backZ + 0.12); backPillow.rotation.x = -0.28; bed.add(backPillow);
          const headPillow = flexaPillow(0.6, 0.4, 0.12, 0xd2cfc6, 0xa8a499, 0.035);
          headPillow.rotation.set(-Math.PI / 2, 0, Math.PI / 2); headPillow.position.set(bedCx + 0.82, yIn + mattTop + 0.045, bedZ); bed.add(headPillow);   // ngay dưới đầu kỹ sư khi ngủ
          bakeStatic(bed); bed.userData.noBake = true; g.add(bed);
          // Compact workspace in the marked rear corner, opposite the side galley.
          const study = new THREE.Group(); study.name = 'Góc học tập trong xe'; study.userData.noBake = true;
          const desk = new THREE.Group(); desk.name = 'Bàn học nhỏ';
          const deskX = 2.34, deskZ = -1.12, deskHeight = .76;
          function studyBox(parent, name, w, h, d, x, y, z, mat, outlined = false) {
            const m = bx(w, h, d, mat, true, outlined, lineDark); m.name = name; m.position.set(x, y, z); parent.add(m); return m;
          }
          function bakeStudyFurniture(assembly) {
            const original = new Set(); assembly.traverse(o => { if (o.geometry) original.add(o.geometry); });
            bakeStatic(assembly);
            const kept = new Set(); assembly.traverse(o => { if (o.geometry) kept.add(o.geometry); });
            for (const geometry of original) if (!kept.has(geometry)) geometry.dispose();
          }
          studyBox(desk, 'Mặt bàn học', 1.08, .06, .5, deskX, yIn + deskHeight - .03, deskZ, woodMat, true);
          for (const sx of [-1, 1]) for (const sz of [-1, 1])
            studyBox(desk, 'Chân bàn học', .045, .70, .045, deskX + sx * .455, yIn + .35, deskZ + sz * .195, metalMat);
          studyBox(desk, 'Thanh đỡ sau bàn', .93, .07, .035, deskX, yIn + .61, deskZ - .2, metalMat);
          studyBox(desk, 'Ngăn kéo nhỏ', .28, .11, .4, deskX + .31, yIn + .645, deskZ + .015, caravanRoofM, true);
          studyBox(desk, 'Tay nắm ngăn kéo', .115, .017, .025, deskX + .31, yIn + .645, deskZ + .227, metalMat);
          // A small closed notebook keeps the writing surface visibly usable.
          studyBox(desk, 'Sổ trên bàn', .27, .014, .2, deskX - .34, yIn + deskHeight + .01, deskZ - .09, caravanDark);   // sổ dời sang trái, nhường giữa bàn cho laptop
          studyBox(desk, 'Giấy trong sổ', .253, .009, .185, deskX - .34, yIn + deskHeight + .019, deskZ - .09, caravanRoofM);
          bakeStudyFurniture(desk); study.add(desk);
          // bàn học to thêm 20% (dài, sâu, cao), giữ góc sau–phải áp vách: phóng quanh điểm (2,88; sàn; −1,37)
          const DESK_K = 1.2; desk.scale.setScalar(DESK_K); desk.position.set(2.88 * (1 - DESK_K), yIn * (1 - DESK_K), -1.37 * (1 - DESK_K));
          const dX = 2.88 - (2.88 - deskX) * DESK_K, dZ = -1.37 + (deskZ + 1.37) * DESK_K, dH = deskHeight * DESK_K;   // tâm + chiều cao mới

          const studyChair = new THREE.Group(); studyChair.name = 'Ghế bàn học';
          const chairX = dX - .02, chairZ = -.38;   // ghế theo bàn: vẫn cách mép bàn 17,5 cm
          studyBox(studyChair, 'Đệm ghế học', .43, .065, .43, chairX, yIn + .455, chairZ, caravanRoofM, true);
          for (const sx of [-1, 1]) for (const sz of [-1, 1])
            studyBox(studyChair, 'Chân ghế học', .035, .425, .035, chairX + sx * .17, yIn + .2125, chairZ + sz * .17, metalMat);
          for (const sx of [-1, 1])
            studyBox(studyChair, 'Trụ tựa ghế', .035, .37, .035, chairX + sx * .17, yIn + .635, chairZ + .195, metalMat);
          studyBox(studyChair, 'Lưng ghế học', .43, .25, .045, chairX, yIn + .73, chairZ + .195, woodMat, true);
          bakeStudyFurniture(studyChair); study.add(studyChair); studyChairRig.obj = studyChair; studyChairRig.home = studyChair.position.z;

          // Đèn bàn: đế gỗ ở góc sau-phải mặt bàn, tay đèn vươn chéo về phía cuốn sổ; mặt LED nằm trong lòng chụp.
          const lamp = workLamp(study), lampHead = WORK_LAMP_HEAD;
          lamp.position.set(dX + .28 * DESK_K, yIn + dH + .001, dZ - .13 * DESK_K); lamp.rotation.y = -1.0;
          const bulbMat = new THREE.MeshStandardMaterial({ color: 0xE2D6C0, emissive: 0xffc46d, emissiveIntensity: 0, roughness: .65 });
          const bulb = new THREE.Mesh(new THREE.CircleGeometry(lampHead.radius * .86, 18), bulbMat);
          bulb.name = 'Bóng đèn bàn học'; bulb.rotation.x = Math.PI / 2; bulb.position.set(lampHead.x, lampHead.ledY, lampHead.z); lamp.add(bulb);
          const studyLight = new THREE.PointLight(0xffc46d, 0, 2.2 * CAMP_SCALE, 2);
          studyLight.name = 'Ánh sáng bàn học'; studyLight.position.set(lampHead.x, lampHead.ledY - .05, lampHead.z);
          studyLight.castShadow = false; lamp.add(studyLight);
          studyDeskLighting.light = studyLight; studyDeskLighting.bulb = bulbMat;
          // Lon nước ngọt ở góc trái phía trước mặt bàn, giữa nhãn quay về phía cửa hông.
          const coke = sodaCan(); coke.scale.setScalar(1.05); coke.position.set(dX - .37 * DESK_K, yIn + dH + .001, dZ + .09 * DESK_K); coke.rotation.y = -.6; coke.name = 'Lon coke trên bàn học'; study.add(coke);   // lon to thêm 5%, gốc ở tâm đáy nên vẫn đứng sát mặt bàn
          // Laptop giữa bàn, trước ghế: thân nhôm xám, bàn phím + touchpad; nắp gắn bản lề mép sau (đóng phẳng khi rảnh, mở ~106° khi làm việc)
          {
            const lap = new THREE.Group(); lap.name = 'Laptop'; lap.position.set(dX - .01, yIn + dH + .001, dZ + .05 * DESK_K); study.add(lap);
            const alu = new THREE.MeshLambertMaterial({ color: 0x3d4046 });
            const kc = document.createElement('canvas'); kc.width = 128; kc.height = 48; const kx = kc.getContext('2d');
            kx.fillStyle = '#1e2024'; kx.fillRect(0, 0, 128, 48); kx.fillStyle = '#3a3e45';
            for (let r = 0; r < 4; r++) for (let k = 0; k < 13; k++) kx.fillRect(3 + k * 9.6, 3 + r * 11, 8, 9);   // phím
            kx.fillRect(30, 3 + 4 * 11 - 1, 66, 4);
            const keyTex = new THREE.CanvasTexture(kc); keyTex.colorSpace = THREE.SRGBColorSpace;
            const base = bx(.33, .016, .23, alu, true, true, lineDark); base.position.y = .008; lap.add(base);
            const kb = new THREE.Mesh(new THREE.PlaneGeometry(.29, .105), new THREE.MeshLambertMaterial({ map: keyTex })); kb.rotation.x = -Math.PI / 2; kb.position.set(0, .0165, -.035); lap.add(kb);
            const pad = new THREE.Mesh(new THREE.PlaneGeometry(.095, .06), new THREE.MeshLambertMaterial({ color: 0x55595f })); pad.rotation.x = -Math.PI / 2; pad.position.set(0, .0166, .068); lap.add(pad);
            const hinge = new THREE.Group(); hinge.position.set(0, .016, -.115); lap.add(hinge);
            const lid = bx(.33, .01, .22, alu, true, true, lineDark); lid.position.set(0, .005, .11); hinge.add(lid);
            const sc = document.createElement('canvas'); sc.width = 256; sc.height = 160; const sx2 = sc.getContext('2d');   // màn hình: bảng vận hành 3 nguồn điện
            sx2.fillStyle = '#0f1a26'; sx2.fillRect(0, 0, 256, 160); sx2.fillStyle = '#1d3347'; sx2.fillRect(0, 0, 256, 20);
            sx2.font = 'bold 12px Arial, sans-serif'; sx2.fillStyle = '#ffd34a'; sx2.fillText('GHC · Vận hành', 8, 14);
            [['#5ec27a', 'Thủy điện'], ['#f0a040', 'Mặt trời'], ['#65b3ff', 'Gió']].forEach(([col, name], i) => {
              const y0 = 32 + i * 42; sx2.fillStyle = '#c7d3df'; sx2.font = '10px Arial, sans-serif'; sx2.fillText(name, 8, y0 + 8);
              sx2.strokeStyle = col; sx2.lineWidth = 2; sx2.beginPath();
              for (let k = 0; k <= 40; k++) { const xx = 70 + k * 4.4, yy = y0 + 22 - (Math.sin(k * 0.35 + i * 1.7) * 0.5 + 0.5) * 18 - (i === 1 ? Math.sin(k / 40 * Math.PI) * 6 : 0); k ? sx2.lineTo(xx, yy) : sx2.moveTo(xx, yy); }
              sx2.stroke();
            });
            const scrTex = new THREE.CanvasTexture(sc); scrTex.colorSpace = THREE.SRGBColorSpace;
            const screenMat = new THREE.MeshBasicMaterial({ map: scrTex, color: 0x101214 });
            const scr = new THREE.Mesh(new THREE.PlaneGeometry(.29, .18), screenMat); scr.rotation.x = Math.PI / 2; scr.position.set(0, -.0006, .112); hinge.add(scr);   // mặt trong nắp: quay xuống khi đóng, quay về người dùng khi mở
            const glow = new THREE.PointLight(0x9fc8ff, 0, 1.4 * CAMP_SCALE, 2); glow.position.set(0, .14, .02); lap.add(glow);
            lap.traverse(o => { o.userData.noBake = true; });
            Object.assign(studyLaptop, { hinge, screen: screenMat, light: glow, group: lap, canvas: sc, ctx: sx2, tex: scrTex, dash: sx2.getImageData(0, 0, sc.width, sc.height), mode: 'dash', drawnAt: -1 });
          }
          study.userData.layout = {
            desk: { center: [dX, dZ], size: [1.08 * DESK_K, .5 * DESK_K], height: dH },
            chair: { center: [chairX, chairZ], size: [.43, .43], facing: '-Z' }, lampSchedule: '18:30–06:00 Asia/Ho_Chi_Minh'
          };
          g.add(study);
          const tTop = bx(0.62, 0.08, 0.62, woodMat, true, true, lineDark); tTop.name = 'Bàn vuông'; tTop.userData.noBake = true; tTop.position.set(-0.65, yIn + 0.78, 0.8); tTop.castShadow = true; g.add(tTop);
          const tLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.78, 8), metalMat); tLeg.position.set(-0.65, yIn + 0.39, 0.8); g.add(tLeg);
          // bữa sáng trên bàn vuông (mặt bàn y = yIn + 0,82): hộp ngũ cốc & hộp cà phê nằm ngửa trên mặt bàn như 2 cuốn sách (nhãn hướng lên), chai sữa phía ngoài
          const breakfast = new THREE.Group(); breakfast.name = 'Đồ ăn sáng trên bàn vuông'; breakfast.userData.noBake = true; breakfast.position.set(-0.65, yIn + 0.821, 0.8); g.add(breakfast);
          // mỗi hộp: đáy ở y = 0, mặt nhãn hướng +z, dày size[2] ⇒ lật −90° quanh x (nhãn ngửa lên), rồi xoay yaw quanh trục đứng; đặt theo TÂM hộp (cx, cz)
          const BOOK_K = 1.1;   // 2 hộp "sách" to thêm 10%
          const layFlat = (item, cx, cz, yaw) => {
            const ext = BREAKFAST_SIZE[item.name], h = ext[1] * BOOK_K, t = ext[2] * BOOK_K;
            item.scale.setScalar(BOOK_K); item.rotation.order = 'YXZ'; item.rotation.set(-Math.PI / 2, yaw, 0);
            item.position.set(cx + Math.sin(yaw) * h / 2, t / 2, cz + Math.cos(yaw) * h / 2);
          };
          // kỹ sư ngồi ghế đẩu phía −z (lưng về giường) ⇒ 3 món xếp vào nửa phía vách, nhường mép gần cho bát ngũ cốc
          let cerealBowl = null;
          const cereal = breakfastItem('cereal'); layFlat(cereal, -0.15, 0.12, 0.14); cereal.name = 'Hộp ngũ cốc'; breakfast.add(cereal);
          const coffee = breakfastItem('coffee'); layFlat(coffee, 0.11, 0.1, -0.2); coffee.name = 'Hộp cà phê'; breakfast.add(coffee);
          const milk = breakfastItem('milk'); milk.name = 'Chai sữa'; milk.position.set(0.22, 0, -0.13); breakfast.add(milk);
          {   // bát sứ trắng: ngũ cốc vàng nổi trên sữa
            const bowl = cerealBowl = new THREE.Group(); bowl.name = 'Bát ngũ cốc'; bowl.position.set(-0.04, 0, -0.16); bowl.visible = false; breakfast.add(bowl);
            const food = new THREE.Group(); food.name = 'Ngũ cốc + sữa'; bowl.add(food); bowl.userData.food = food;
            const ceramic = new THREE.MeshLambertMaterial({ color: 0xf2efe8, side: THREE.DoubleSide });
            const shell = new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.04, 0], [0.042, 0.006], [0.07, 0.034], [0.078, 0.056], [0.073, 0.057], [0.065, 0.036], [0.036, 0.009], [0, 0.009]].map(([r, y]) => new THREE.Vector2(r, y)), 20), ceramic);
            shell.castShadow = true; bowl.add(shell);
            const milkTop = new THREE.Mesh(new THREE.CircleGeometry(0.066, 20), new THREE.MeshLambertMaterial({ color: 0xfbf6ea })); milkTop.rotation.x = -Math.PI / 2; milkTop.position.y = 0.043; food.add(milkTop);
            const flakeM = new THREE.MeshLambertMaterial({ color: 0xd9a64a });
            for (let k = 0; k < 14; k++) { const a = k * 2.4, r = 0.012 + (k % 5) * 0.011, f = new THREE.Mesh(new THREE.BoxGeometry(0.016, 0.005, 0.013), flakeM); f.position.set(Math.cos(a) * r, 0.046, Math.sin(a) * r); f.rotation.set(0.3 * Math.sin(k), a, 0.25 * Math.cos(k * 1.7)); food.add(f); }
          }
          const tableUdon = udonBowl(); tableUdon.position.set(-0.04, 0, -0.16); tableUdon.visible = false; breakfast.add(tableUdon);   // bữa trưa: bát udon đúng chỗ bát ngũ cốc
          // ghế đẩu tròn (mặt gỗ cao 0,48 m như ghế bàn học): bình thường kéo lùi chừa khe đứng giữa ghế và mép bàn, ngồi xong nhích vào
          const stool = new THREE.Group(); stool.name = 'Ghế đẩu bàn ăn'; stool.userData.noBake = true; stool.position.set(0, 0, 0); g.add(stool);
          { const sx0 = -0.65, sz0 = -0.04;
            const top = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.162, 0.05, 18), woodMat); top.position.set(sx0, yIn + 0.455, sz0); top.castShadow = true; stool.add(top);
            for (let k = 0; k < 4; k++) { const a = Math.PI / 4 + k * Math.PI / 2, leg = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.45, 6), metalMat);
              leg.position.set(sx0 + Math.cos(a) * 0.12, yIn + 0.215, sz0 + Math.sin(a) * 0.12); leg.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); leg.castShadow = true; stool.add(leg); }
            const ring = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.009, 4, 18), metalMat); ring.rotation.x = Math.PI / 2; ring.position.set(sx0, yIn + 0.15, sz0); stool.add(ring); }
          // mũ bảo hộ đặt cuối giường lúc ngủ
          const bedHelmet = engHelmetProp(); bedHelmet.position.set(bedCx - bedLen / 2 + 0.3, yIn + mattTop - 0.02, bedZ + 0.18); bedHelmet.rotation.y = 0.6; bedHelmet.visible = false; g.add(bedHelmet);
          // Mặt đá (dựng cho cao 2,07–2,14) hạ xuống ngồi khít nóc tủ bếp 1,795: hết khe hở, mặt bếp cao ~0,80 m so với sàn.
          const kitchen = motorhomeKitchen(galley);   // bếp theo mẫu: chậu, bàn sơ chế, bảng treo đồ, bếp 4 họng lửa + lò nướng
          const cup = bx(bLen * 0.62, 0.44, 0.4, caravanRoofM); cup.position.set(bcx - .55, yRoof - 0.45, -dz + 0.32); g.add(cup);
          const cabH = 1.85, cabLen = 2.0, cabX = x0 - cabLen / 2, cabDz = Dc * 0.9, wsX = cabX - cabLen / 2;
          // ---- bạt che ĐỎ trên cửa mở ----
          // bạt rộng từ mép trước cửa (x = -0,65) tới đúng mép sau xe (mặt sau phòng tắm, x1 + bthLen)
          const awFront = 1.1 - 1.75, awRear = x1 + bthLen, awLen = awRear - awFront, awC = (awFront + awRear) / 2;
          const aw = bx(awLen, 0.04, 2.4, awningMat, true, true, lineDark); aw.position.set(awC, yRoof - 0.02, dz + 1.2); aw.rotation.x = -0.16; g.add(aw);
          for (const px of [awFront + 0.1, awRear - 0.1]) { const pTop = base + Hc + 0.33, pBot = -1.4, pH = pTop - pBot; const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, pH, 6), chairFrame); pole.castShadow = true; pole.position.set(px, (pTop + pBot) / 2, dz + 2.3); g.add(pole); const cap = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), chairFrame); cap.position.set(px, pTop, dz + 2.3); cap.castShadow = true; g.add(cap); }   // 2 cột dài: vươn cao + cắm sâu hẳn xuống đất, có chỏm bịt đầu
          // ---- nóc xe: ống thông gió (dời ra sau) + điều hòa (dời ra trước) → chừa chỗ giữa cho giàn pin ----
          const roofDetails = new THREE.Group(); roofDetails.name = 'Thiết bị mái xe chi tiết';
          roofDetails.userData.noBake = true; g.add(roofDetails);
          function roofBox(w, h, d, x, y, z, mat, outlined = false) {
            const m = bx(w, h, d, mat, true, outlined, lineDark); m.position.set(x, y, z); roofDetails.add(m); return m;
          }
          // Chamfered footprint with a shallow bevel, rather than sharp cuboid lids.
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
          function roofVent(x, z, size, height) {
            const y = yRoof + .1;
            roofBox(size + .05, .025, size + .05, x, y + .0125, z, metalMat);
            roofBox(size - .065, .075, size - .065, x, y + .0625, z, caravanDark);
            roofLid(size - .035, size - .035, height - .08, .055, x, y + .08, z, caravanDark);
            for (const side of [-1, 1]) for (let n = -2; n <= 2; n++) {
              roofBox(size * .68, .012, .012, x, y + .045 + (n + 2) * .01, z + side * (size / 2 - .027), metalMat);
            }
          }
          roofVent(x1 - .45, -.55, .66, .21);
          const acX = x0 + .35, acBottom = yRoof + .1;
          roofBox(1.01, .055, .86, acX, acBottom + .0275, 0, caravanDark);
          roofLid(.995, .845, .21, .12, acX, acBottom + .055, 0, caravanRoofM);
          for (const side of [-1, 1]) {
            roofBox(.59, .12, .015, acX + .06, acBottom + .12, side * .443, caravanDark);
            for (let n = 0; n < 4; n++) roofBox(.6, .012, .022, acX + .06, acBottom + .075 + n * .028, side * .445, metalMat);
            roofBox(.012, .125, .46, acX + side * .516, acBottom + .125, 0, caravanDark);
            for (let n = 0; n < 5; n++) roofBox(.018, .12, .014, acX + side * .518, acBottom + .125, -.18 + n * .09, metalMat);
          }
          roofBox(.49, .012, .32, acX - .13, acBottom + .272, 0, caravanRoofM);
          for (const x of [-.26, .26]) for (const z of [-.16, .16]) roofBox(.026, .013, .026, acX - .13 + x, acBottom + .275, z, metalMat);
          // ==== bathroom pod at REAR (back door) of van — transparent, detailed ====
          const bthW = Dc - 0.06, bthH = Hc;        // Short wet-room extension (bthLen), keeping the shell flush with the living body.
          const bthCX = x1 + bthLen / 2;                          // pod centre, just behind rear wall (x1)
          const bthBackX = bthCX + bthLen / 2;                    // outer rear wall plane
          const bthZ = -bthW * 0.24, snkZ = bthW * 0.29;            // toilet on −Z half · sink on +Z half
          const bthWallM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0, transparent: true, opacity: 0.42, depthWrite: false });
          const twcM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }), tileM = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }),
            mirrorM = new THREE.MeshLambertMaterial({ color: 0xbfe0e8 }), towelM = new THREE.MeshLambertMaterial({ color: 0xd98c6a });
          const bath = new THREE.Group(); bath.name = 'Phòng tắm gọn';
          bath.userData.layout = { length: bthLen, width: bthW, floorArea: bthLen * bthW, entryWidth: 0.65, wetBath: [0.95, 1.0], clearAisle: 0.91, rearX: bthBackX };
          // rear chassis extension to carry the pod (cantilever behind axle)
          const bthChs = bx(bthLen + 0.18, 0.3, Dc * 0.6, caravanDark, true, true, lineDark); bthChs.position.set(bthCX, base - 0.12, 0); bath.add(bthChs);
          // tiled floor + roof
          const bthFlr = bx(bthLen, 0.1, bthW, tileM); bthFlr.position.set(bthCX, base + 0.05, 0); bthFlr.receiveShadow = true; bath.add(bthFlr);
          const bthRf = bx(bthLen + 0.16, 0.2, bthW + 0.16, caravanRoofM); bthRf.position.set(bthCX, yRoof, 0); bath.add(bthRf);
          // transparent shell: rear wall + two side walls
          const bthBk = bx(0.1, bthH, bthW, bthWallM, true, true, lineDark); bthBk.position.set(bthBackX - 0.05, base + bthH / 2, 0); bath.add(bthBk);
          for (const bsz of [-1, 1]) { const sw = bx(bthLen, bthH, 0.1, bthWallM, true, true, lineDark); sw.position.set(bthCX, base + bthH / 2, bsz * bthW / 2); bath.add(sw); }
          // frosted rear window + matching exterior stripe + roof vent
          const bthWin = bx(0.06, 0.66, bthW * 0.42, vanGlass, false, true, lineDark); bthWin.position.set(bthBackX - 0.02, base + bthH * 0.64, 0); bath.add(bthWin);
          const bthStripe = bx(0.07, 0.14, bthW + 0.02, caravanStripe); bthStripe.position.set(bthBackX - 0.11, base + bthH * 0.46, 0); bath.add(bthStripe);
          roofVent(bthCX, 0, .42, .16);
          const bthLight = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12), litMat); bthLight.position.set(bthCX, yRoof - 0.13, 0); bath.add(bthLight);
          // ---- toilet: bowl + rear cistern tank + lid + oval seat ring + flush button ----
          const twcX = bthBackX - 0.42;
          const toilet = new THREE.Group(); toilet.name = 'Bồn cầu hướng cửa hông';
          const twcBowl = bx(0.5, 0.5, 0.46, twcM, true, true, lineDark); twcBowl.position.set(twcX, base + 0.31, bthZ); toilet.add(twcBowl);
          const twcPed = bx(0.22, 0.32, 0.22, twcM, true, true, lineDark); twcPed.position.set(twcX, base + 0.16, bthZ); toilet.add(twcPed);   // pedestal base
          const twcTank = bx(0.16, 0.42, 0.46, twcM, true, true, lineDark); twcTank.position.set(bthBackX - 0.17, base + 0.82, bthZ); toilet.add(twcTank);  // flush against rear wall
          // nắp bồn cầu: bản lề ngay trước két nước, lật dựng vào két khi dùng (không gộp lưới để còn quay)
          const twcLidHinge = new THREE.Group(); twcLidHinge.name = 'Bản lề nắp bồn cầu'; twcLidHinge.userData.noBake = true; twcLidHinge.position.set(twcX + 0.15, base + 0.5925, bthZ); toilet.add(twcLidHinge);
          const twcLid = bx(0.4, 0.055, 0.44, twcM, true, true, lineDark); twcLid.position.set(-0.2, -0.0275, 0); twcLidHinge.add(twcLid);
          const twcSeat = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.045, 6, 16), twcM); twcSeat.rotation.x = Math.PI / 2; twcSeat.scale.x = 1.3; twcSeat.position.set(twcX, base + 0.535, bthZ); twcSeat.castShadow = true; toilet.add(twcSeat);
          const twcBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), metalMat); twcBtn.position.set(bthBackX - 0.17, base + 1.05, bthZ); toilet.add(twcBtn);
          for (const fixture of toilet.children) { fixture.position.x -= twcX; fixture.position.z -= bthZ; }
          toilet.rotation.y = Math.PI / 2; toilet.position.set(twcX, 0, -bthW / 2 + 0.4);
          toilet.userData.noBake = true; bakeStatic(toilet); bath.add(toilet);
          // ---- chia lại phòng tắm: buồng WC kiêm tắm vòi sen gọn ở đầu −Z (vách ngăn + cửa lùa), lavabo ra vách +Z,
          //      vách ngăn có cửa ở lối vào từ khoang sống. Vách & cửa là vỏ trong suốt (ẩn khi xem xuyên, còn nét viền). ----
          const flY = base + 0.1, ceilY = yRoof - 0.1, inBack = bthBackX - 0.1;   // mặt sàn · trần · mặt trong vách sau
          const wcZ = -0.42, wcDoor = [x1 + 0.03, x1 + 0.55], doorTop = base + 2.14;   // vách WC · khe cửa lùa WC (x) · đỉnh khung cửa
          const doorM = new THREE.MeshLambertMaterial({ color: 0xd9e3e6, transparent: true, opacity: 0.55, depthWrite: false });
          const panel = (x0p, x1p, y0, y1, z0, z1, mat = bthWallM) => { const m = bx(x1p - x0p, y1 - y0, z1 - z0, mat, mat !== doorM, true, lineDark); m.position.set((x0p + x1p) / 2, (y0 + y1) / 2, (z0 + z1) / 2); bath.add(m); return m; };
          // vách ngăn WC (dọc trục xe ở z = wcZ): đoạn đặc phía vách sau + ô trên cửa + cánh cửa lùa kính mờ
          panel(wcDoor[1], inBack, flY, ceilY, wcZ - 0.025, wcZ + 0.025);
          panel(x1, wcDoor[0], flY, ceilY, wcZ - 0.025, wcZ + 0.025);
          panel(wcDoor[0], wcDoor[1], doorTop, ceilY, wcZ - 0.025, wcZ + 0.025);
          const wcDoorG = new THREE.Group(); wcDoorG.name = 'Cửa lùa buồng WC'; wcDoorG.userData.noBake = true; bath.add(wcDoorG);   // trượt về +x khi mở
          wcDoorG.add(panel(wcDoor[0], wcDoor[1] + 0.03, flY + 0.01, doorTop - 0.01, wcZ + 0.03, wcZ + 0.055, doorM));
          const wcHandle = bx(0.03, 0.16, 0.03, caravanDark, false, false); wcHandle.position.set(wcDoor[0] + 0.06, base + 1.05, wcZ + 0.07); wcDoorG.add(wcHandle);
          // vách lối vào phòng tắm (mặt phẳng trụ vách sau khoang sống): bịt khe cạnh buồng WC, cánh cửa lùa + tấm cố định
          const entry = [wcZ + 0.025, 0.25], pierZ = 0.64;
          panel(x1 - 0.1, x1, base, doorTop, -pierZ, wcZ + 0.025);
          panel(x1 - 0.1, x1, base, doorTop, entry[1], pierZ);
          const entryDoorG = new THREE.Group(); entryDoorG.name = 'Cửa lùa phòng tắm'; entryDoorG.userData.noBake = true; bath.add(entryDoorG);   // trượt về +z khi mở
          entryDoorG.add(panel(x1 - 0.13, x1 - 0.1, base + 0.13, doorTop - 0.01, entry[0], entry[1] + 0.03, doorM));
          const entryHandle = bx(0.03, 0.16, 0.03, caravanDark, false, false); entryHandle.position.set(x1 - 0.16, base + 1.05, entry[1] - 0.06); entryDoorG.add(entryHandle);
          // vòi xịt vệ sinh gắn vách trụ phía khoang sống, cạnh bồn cầu: van góc · giá treo · đầu xịt · dây mềm buông võng
          const spX = x1 + 0.03, spZ = -1.15;
          const spValve = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 10), metalMat); spValve.rotation.z = Math.PI / 2; spValve.position.set(spX, base + 0.42, spZ); bath.add(spValve);
          const spHolder = bx(0.05, 0.06, 0.07, metalMat, false, false); spHolder.position.set(spX, base + 0.78, spZ); bath.add(spHolder);
          const spHead = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.02, 0.16, 10), metalMat); spHead.position.set(spX + 0.045, base + 0.78, spZ); spHead.castShadow = true; bath.add(spHead);
          const spNozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 10), metalMat); spNozzle.rotation.z = Math.PI / 2; spNozzle.position.set(spX + 0.07, base + 0.86, spZ); bath.add(spNozzle);
          const spHose = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
            new THREE.Vector3(spX + 0.03, base + 0.42, spZ), new THREE.Vector3(spX + 0.09, base + 0.3, spZ + 0.03),
            new THREE.Vector3(spX + 0.1, base + 0.36, spZ + 0.05), new THREE.Vector3(spX + 0.06, base + 0.6, spZ + 0.02), new THREE.Vector3(spX + 0.045, base + 0.7, spZ)
          ]), 24, 0.008, 6, false), metalMat); bath.add(spHose);
          // ---- lavabo dời ra vách +Z: tủ + mặt đá + chậu + vòi + gương, quay mặt vào phòng (−Z) ----
          const snkX = (x1 + inBack) / 2, wallZ = bthW / 2 - 0.05;
          const snkCab = bx(0.5, 0.46, 0.32, woodMat, true, true, lineDark); snkCab.position.set(snkX, base + 0.57, wallZ - 0.16); bath.add(snkCab);
          const snkTop = bx(0.54, 0.06, 0.36, tileM, true, true, lineDark); snkTop.position.set(snkX, base + 0.8, wallZ - 0.18); bath.add(snkTop);
          const snkBasin = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.11, 14), twcM); snkBasin.position.set(snkX, base + 0.85, wallZ - 0.2); snkBasin.castShadow = true; bath.add(snkBasin);
          const snkTap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.16, 8), metalMat); snkTap.position.set(snkX, base + 0.92, wallZ - 0.06); bath.add(snkTap);
          const snkSpout = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.12, 8), metalMat); snkSpout.rotation.x = -Math.PI / 2.3; snkSpout.position.set(snkX, base + 0.99, wallZ - 0.11); bath.add(snkSpout);
          const mirror = bx(0.36, 0.44, 0.04, mirrorM, false, true, lineDark); mirror.position.set(snkX, base + 1.24, wallZ - 0.02); bath.add(mirror);
          const tapWater = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.011, 0.1, 6), new THREE.MeshLambertMaterial({ color: 0xbfe2ff, transparent: true, opacity: 0.7, depthWrite: false }));
          tapWater.name = 'Nước chảy từ vòi'; tapWater.userData.noBake = true; tapWater.visible = false; tapWater.position.set(snkX, base + 0.93, wallZ - 0.165); bath.add(tapWater);
          // kệ gỗ nhỏ trên vách cạnh cửa (phía trong phòng tắm): chỗ đặt mũ bảo hộ lúc tắm
          const shelfX = x1 + 0.1, shelfZ = 0.45, shelfY = base + 1.55;
          const shelfBoard = bx(0.2, 0.025, 0.3, woodMat, true, true, lineDark); shelfBoard.position.set(shelfX, shelfY, shelfZ); bath.add(shelfBoard);
          for (const sz of [-0.1, 0.1]) { const br = bx(0.02, 0.1, 0.02, metalMat, false, false); br.position.set(x1 + 0.02, shelfY - 0.06, shelfZ + sz); bath.add(br); }
          const shelfHelmet = engHelmetProp(); shelfHelmet.position.set(shelfX + 0.02, shelfY + 0.0125, shelfZ); shelfHelmet.rotation.y = Math.PI / 2; shelfHelmet.visible = false; bath.add(shelfHelmet);
          // ---- khăn tắm treo mặt ngoài vách WC, cạnh cửa lùa ----
          const towelX = (wcDoor[1] + inBack) / 2 + 0.02;
          const towelBar = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.32, 8), metalMat); towelBar.rotation.z = Math.PI / 2; towelBar.position.set(towelX, base + 1.02, wcZ + 0.10); bath.add(towelBar);
          const towel = bx(0.3, 0.42, 0.04, towelM, true, true, lineDark); towel.position.set(towelX, base + 0.81, wcZ + 0.09); towel.name = 'Khăn tắm'; towel.userData.noBake = true; bath.add(towel);
          // ---- buồng WC là buồng tắm: vòi sen + bộ trộn trên vách −Z phía trước bồn cầu, phễu thoát sàn ----
          const shX = x1 + 0.24, sideZ = -bthW / 2 + 0.05;
          const shArm = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.24, 8), metalMat);
          shArm.rotation.x = Math.PI / 2.4; shArm.position.set(shX, base + 2.32, sideZ + 0.1); bath.add(shArm);
          const shHead = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.07, 0.06, 14), metalMat);
          shHead.rotation.x = -0.45; shHead.position.set(shX, base + 2.22, sideZ + 0.21); bath.add(shHead);
          const shMixer = bx(0.14, 0.18, 0.05, metalMat, false, true, lineDark); shMixer.position.set(shX, base + 1.15, sideZ + 0.025); bath.add(shMixer);
          const drain = bx(0.16, 0.012, 0.16, caravanDark, false, true);
          drain.position.set(x1 + 0.24, base + 0.106, -0.8); bath.add(drain);
          // xem xuyên: khung gầm, mái, vách, kính, sọc của phòng tắm là vỏ; đồ dùng bên trong giữ nguyên
          bath.userData.xray = 'shell';
          for (const item of [bthFlr, toilet, spValve, spHolder, spHead, spNozzle, spHose, snkCab, snkTop, snkBasin, snkTap, snkSpout, mirror, towelBar, towel, shArm, shHead, shMixer, drain, bthLight, tapWater, shelfBoard, shelfHelmet]) item.userData.xray = 'keep';
          const bathRig = { entryDoor: entryDoorG, wcDoor: wcDoorG, lid: twcLidHinge, towel, tapWater, shelfHelmet, doorMat: doorM, wallMat: bthWallM,
            showerHead: [shX, base + 2.22, sideZ + 0.21], mixer: [shX, base + 1.15, sideZ + 0.05], flush: [twcX, base + 1.05, -bthW / 2 + 0.15], shelf: [shelfX, shelfY, shelfZ] };
          bath.userData.noBake = true;
          bakeStatic(bath); g.add(bath);

          // ╔════════ NÂNG CẤP CHI TIẾT XE — Class-C motorhome realistic detailing ════════╗
          const solarMat = new THREE.MeshLambertMaterial({ color: 0x163a5c });   // tấm pin mặt trời xanh đậm
          const chrome = rimMat, amber = warningMat, redLamp = cushMat, stripeM = caravanStripe;

          // The connected cabover and wheel apertures are built by motorhomeShell().
          for (const mz of [-0.9, -0.45, 0, 0.45, 0.9]) {
            const marker = bx(0.075, 0.06, 0.13, amber, false, false); marker.position.set(-3.40, yRoof + 0.025, mz); g.add(marker);
          }
          for (const sz of [-1, 1]) { const flap = bx(0.04, 0.4, 0.42, tyreMat, true, false); flap.position.set(2.48, 0.27, sz * 1.29); g.add(flap); }

          // ---- giàn pin mặt trời (renewable) + thanh giá nóc + chỏm vệ tinh + ăng-ten ----
          for (const pz of [-.55, .55]) {
            // Eight separated cells inside an aluminium frame, carried on four feet.
            roofBox(1.61, .04, .79, .55, yRoof + .135, pz, caravanDark);
            for (const dx of [-.81, .81]) roofBox(.035, .065, .825, .55 + dx, yRoof + .151, pz, metalMat);
            for (const dzp of [-.405, .405]) roofBox(1.64, .065, .035, .55, yRoof + .151, pz + dzp, metalMat);
            for (let col = 0; col < 4; col++) for (let row = 0; row < 2; row++) {
              const cellX = .55 - .585 + col * .39, cellZ = pz + (row ? .195 : -.195);
              roofBox(.376, .012, .376, cellX, yRoof + .164, cellZ, solarMat);
              for (const bus of [-.075, .075]) roofBox(.003, .002, .354, cellX + bus, yRoof + .171, cellZ, rimMat);
            }
            for (const dx of [-.64, .64]) for (const dzp of [-.31, .31]) {
              roofBox(.13, .017, .13, .55 + dx, yRoof + .1085, pz + dzp, metalMat);
              roofBox(.035, .055, .07, .55 + dx, yRoof + .135, pz + dzp, metalMat);
              roofBox(.025, .014, .025, .55 + dx, yRoof + .184, pz + dzp, caravanDark);
            }
          }
          const wirePaths = [[new THREE.Vector3(1.32, yRoof + .137, -.55), new THREE.Vector3(1.48, yRoof + .119, -.55), new THREE.Vector3(1.48, yRoof + .119, -.08)], [new THREE.Vector3(1.32, yRoof + .137, .55), new THREE.Vector3(1.48, yRoof + .119, .55), new THREE.Vector3(1.48, yRoof + .119, .08)]];
          for (const points of wirePaths) {
            const wire = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points), 10, .009, 5, false), caravanDark);
            wire.castShadow = true; roofDetails.add(wire);
          }
          roofBox(.2, .06, .17, 1.48, yRoof + .13, 0, caravanRoofM);
          roofBox(.22, .018, .19, 1.48, yRoof + .108, 0, metalMat);
          for (const sz of [-1, 1]) for (const rx of [x0 + .17, .65, x1 - .2]) {
            roofBox(.13, .032, .12, rx, yRoof + .116, sz * (Dc / 2 - .06), metalMat);
            roofBox(.07, .035, .095, rx, yRoof + .147, sz * (Dc / 2 - .06), caravanDark);
          }
          for (const sz of [-1, 1]) { const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, bLen + 0.1, 6), metalMat); rail.rotation.z = Math.PI / 2; rail.position.set(bcx, yRoof + 0.12, sz * (Dc / 2 - 0.06)); rail.castShadow = true; g.add(rail); }
          const railX = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, Dc - 0.12, 6), metalMat); railX.rotation.x = Math.PI / 2; railX.position.set(x1 - 0.12, yRoof + 0.12, 0); g.add(railX);
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), caravanRoofM); dome.castShadow = true; dome.position.set(x1 - 0.5, yRoof + 0.1, 0.95); g.add(dome);
          const domeB = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.05, 12), caravanDark); domeB.position.set(x1 - 0.5, yRoof + 0.11, 0.95); g.add(domeB);
          const whip = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.72, 5), metalMat); whip.position.set(x0 + 0.3, yRoof + 0.46, -1.05); whip.castShadow = true; g.add(whip);
          // ---- chảo Starlink (đĩa phẳng nghiêng trên trụ) ngay cạnh chỏm vệ tinh ----
          const slX = x1 - 1.12, slZ = 0.95;
          const slBase = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.13, 0.05, 12), caravanDark); slBase.position.set(slX, yRoof + 0.04, slZ); g.add(slBase);
          const slPole = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.032, 0.34, 8), metalMat); slPole.position.set(slX, yRoof + 0.21, slZ); slPole.castShadow = true; g.add(slPole);
          const slBack = bx(0.42, 0.04, 0.36, caravanDark, true, false); slBack.position.set(slX - 0.045, yRoof + 0.37, slZ); slBack.rotation.z = 0.44; g.add(slBack);     // lưng đĩa xám
          const slDish = bx(0.46, 0.035, 0.4, wallMat, true, true, lineDark); slDish.position.set(slX - 0.085, yRoof + 0.39, slZ); slDish.rotation.z = 0.44; g.add(slDish);    // mặt đĩa trắng nghiêng

          // Static Wi-Fi mark printed on the tilted dish face; no texture or animation.
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

          // ---- đuôi xe: thang leo nóc · cụm đèn hậu (đỏ+hổ phách) · cản · biển số · đèn phanh cao ----
          const ladX = bthBackX + 0.1, ladH = yRoof - base + 0.25;
          for (const sz of [-0.42, 0.42]) { const lr = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, ladH, 6), metalMat); lr.castShadow = true; lr.position.set(ladX, base + ladH / 2, sz); g.add(lr); }
          for (let r = 0; r < 6; r++) { const rung = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.9, 6), metalMat); rung.rotation.x = Math.PI / 2; rung.position.set(ladX, base + 0.4 + r * 0.5, 0); g.add(rung); }
          for (const sz of [-1, 1]) {
            const tl = bx(0.06, 0.3, 0.16, redLamp, true, true, lineDark); tl.position.set(bthBackX + 0.04, base + 0.56, sz * (bthW / 2 - 0.22)); g.add(tl);
            const ta = bx(0.06, 0.15, 0.16, amber, true, true, lineDark); ta.position.set(bthBackX + 0.04, base + 0.34, sz * (bthW / 2 - 0.22)); g.add(ta);
          }
          const rbump = bx(0.14, 0.22, bthW - 0.1, caravanDark, true, true, lineDark); rbump.position.set(bthBackX + 0.06, base - 0.03, 0); g.add(rbump);
          const rplate = bx(0.04, 0.2, 0.44, litMat, false, true, lineDark); rplate.position.set(bthBackX + 0.09, base + 0.3, 0); g.add(rplate);
          const brake = bx(0.05, 0.08, 0.8, redLamp, false, true, lineDark); brake.position.set(bthBackX + 0.02, base + bthH - 0.18, 0); g.add(brake);

          // ---- ốp hông · nắp nhiên liệu · đèn định vị hông (đã bỏ sọc ngang thân + swoosh cabin) ----
          for (const sz of [-1, 1]) {
            const mR = bx(0.05, 0.07, 0.13, redLamp, false, false); mR.position.set(x1 - 0.06, base + Hc - 0.25, sz * (dz + 0.01)); g.add(mR);
          }
          const hatch = bx(0.9, 0.58, 0.04, caravanDark, true, true, lineDark); hatch.position.set(1.4, base + 0.5, -dz - 0.02); g.add(hatch);
          const hLatch = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.06, 8), chrome); hLatch.rotation.x = Math.PI / 2; hLatch.position.set(1.72, base + 0.5, -dz - 0.05); g.add(hLatch);

          // ---- tay vịn cửa + hiên kẻ sọc + ống cuốn + diềm ----
          const grab = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.92, 6), metalMat); grab.position.set(dX1 + 0.08, base + doorH * 0.5, dz + 0.17); grab.castShadow = true; g.add(grab);
          for (const gy of [base + 0.55, base + doorH - 0.12]) { const mt = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.16, 6), metalMat); mt.rotation.x = Math.PI / 2; mt.position.set(dX1 + 0.08, gy, dz + 0.1); g.add(mt); }
          const awX = 1.1; // Preserve the awning and lantern campsite anchors.
          for (let k = 0; k < 4; k++) { const band = bx(0.34, 0.045, 2.42, stripeM, false, false); band.position.set(awC + (k - 1.5) * 1.15, yRoof - 0.015, dz + 1.2); band.rotation.x = -0.16; g.add(band); }   // 4 sọc đều trên bạt dài
          const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, awLen + 0.1, 8), chrome); roll.rotation.z = Math.PI / 2; roll.position.set(awC, yRoof + 0.12, dz + 2.36); roll.castShadow = true; g.add(roll);
          const valance = bx(awLen + 0.1, 0.22, 0.03, stripeM, false, true, lineDark); valance.position.set(awC, yRoof, dz + 2.37); valance.rotation.x = -0.16; g.add(valance);

          // ---- đèn lồng treo từ thanh cuộn bạt che hiên ----
          const awCord = cyl(0.015, 0.015, 0.2, new THREE.MeshLambertMaterial({ color: 0x243240 }), false, false, null, 6); awCord.name = 'awLan'; awCord.position.set(awX, yRoof + 0.02, dz + 2.36); g.add(awCord);
          const body = lanBody(g, 'awLan');
          awLan = body.lan; awLan.position.set(awX, yRoof - 0.08, dz + 2.36);
          awLight = body.light;

          // ---- gầm xe: bình ga LPG (có đai) · ống xả · 4 chân chống cân bằng ----
          const lpg = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.82, 12), rimMat); lpg.rotation.z = Math.PI / 2; lpg.position.set(-0.3, base - 0.26, 0.72); lpg.castShadow = true; g.add(lpg);
          for (const sx of [-0.28, 0.28]) { const strap = bx(0.05, 0.12, 0.56, caravanDark, false, false); strap.position.set(-0.3 + sx, base - 0.26, 0.72); g.add(strap); }
          const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.2, 8), metalMat); exhaust.rotation.z = Math.PI / 2; exhaust.position.set(0.7, base - 0.34, -dz + 0.45); g.add(exhaust);
          const etip = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.16, 8), chrome); etip.rotation.z = Math.PI / 2; etip.position.set(1.85, base - 0.34, -dz + 0.45); g.add(etip);
          for (const jx of [x0 + 0.4, x1 - 0.2]) for (const sz of [-1, 1]) { const jack = bx(0.08, 0.42, 0.08, metalMat, true, false); jack.position.set(jx, base - 0.42, sz * (dz - 0.25)); g.add(jack); }

          // Cabin door seams, handles and front lighting are retained from the source mesh.
          // ---- váy hông (skirt) giữa 2 cầu bánh · họng nước sạch · hộp điện bờ · phản quang ----
          const wIn = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 10), chrome); wIn.rotation.x = Math.PI / 2; wIn.position.set(2.55, base + 0.74, -dz - 0.02); g.add(wIn);   // họng nạp nước sạch (city water)
          const shore = bx(0.24, 0.3, 0.05, caravanDark, false, true, lineDark); shore.position.set(2.18, base + 0.7, -dz - 0.03); g.add(shore);                                             // hộp cắm điện bờ (shore power)
          for (const sz of [-1, 1]) { const refl = bx(0.03, 0.09, 0.18, redLamp, false, false); refl.position.set(x1 - 0.35, base + 0.14, sz * (dz + 0.01)); g.add(refl); }                  // phản quang đỏ thấp hông
          // ---- tay nắm cửa lùa · bậc lên xuống thứ 2 · camera lùi sau xe ----
          const dhdl = bx(0.05, 0.32, 0.06, caravanDark, false, false); dhdl.position.set(dX1 + 0.12, base + doorH * 0.5, dz + 0.18); g.add(dhdl);

          const rcam = bx(0.09, 0.09, 0.15, caravanDark, false, true, lineDark); rcam.position.set(bthBackX + 0.05, base + bthH - 0.34, 0); g.add(rcam);
          // ╚══════════════════════════════════════════════════════════════════════════════╝
          // Bake each assembly once; release the superseded temporary geometry.
          for (const detail of [roofDetails, entrySteps]) {
            const original = new Set(); detail.traverse(o => { if (o.geometry) original.add(o.geometry); });
            bakeStatic(detail);
            const kept = new Set(); detail.traverse(o => { if (o.geometry) kept.add(o.geometry); });
            for (const geo of original) if (!kept.has(geo)) geo.dispose();
          }
          g.userData.interior = {
            bed: { center: [bedCx, bedZ], size: [bedLen, bedW] },
            table: { center: [-0.65, 0.8], size: [0.62, 0.62] },
            study: study.userData.layout,
            sleepPosition: [bedCx - 1.35 + 2.06 * (1.026 - ENGINEER_BASE_SCALE), yIn + 0.49 + 0.05, bedZ], sleepHead: [bedCx + 1.1, 4, bedZ],   // người nhỏ đi: dời gốc về phía gối để đầu vẫn gác đúng gối
            stool: { obj: stool, rest: -0.04 }, bath: bathRig, bedHelmet, kitchen, cerealBowl, tableUdon, studyCoke: coke
          };
          // xem xuyên: mặc định mọi thứ của xe là vỏ; sàn, nội thất, bánh xe & đèn lồng hiên giữ nguyên
          g.userData.xray = 'shell';
          for (const item of [floor, bed, study, tTop, tLeg, breakfast, cup, axles, awCord, awLan, stool, bedHelmet]) item.userData.xray = 'keep';
          return bakeStatic(g);
        }
        let awLight, awLan;
        const caravanObj = caravan(); caravanObj.scale.multiplyScalar(CAMP_SCALE); caravanObj.name = 'Xe Caravan (Motorhome)'; {
          const p = worldCell(CARAVAN_CELL[0], CARAVAN_CELL[1]); caravanObj.position.copy(p); caravanObj.rotation.y = Math.atan2(bobberBase.x - p.x, bobberBase.z - p.z); scene.add(caravanObj);
          // Compact rear wet room: keep the front/body avoidance anchors, shorten only the rear circle.
          // dùng 3 vòng nhỏ xếp DỌC TRỤC XE (mũi cabin · thân · khoang toilet sau) như 1 capsule
          const vc = Math.cos(caravanObj.rotation.y), vs = -Math.sin(caravanObj.rotation.y);   // local +x → world (cos ry, −sin ry)
          for (const [lx, rr] of [[-2.4, 2.5], [0.6, 2.6], [3.525, 2.15]])
            obstacleCoords.push({ x: p.x + lx * vc * CAMP_SCALE, y: p.y, z: p.z + lx * vs * CAMP_SCALE, r: rr * CAMP_SCALE, h: 3.5 * CAMP_SCALE });
        }

        updateStudyLamp();

