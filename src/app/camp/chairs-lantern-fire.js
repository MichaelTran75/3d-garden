        // ---- ghế xếp dã ngoại (camp chair) hướng ra hồ ----
        // ghế đạo diễn gấp: khung gỗ vuông, chữ X hai bên dưới mặt ngồi, vải ngồi võng giữa có viền may sẫm, tựa lưng vải cong ôm lưng,
        // tay vịn gỗ bo đầu, túi vải treo tay vịn phải (khay cốc), chân bọc nút nhựa đen; mặt ngồi giữ cao 0,65 cho dáng ngồi của kỹ sư
        function campChair(fabricMat = chairFabric, frameMat = chairFrame) {
          const g = new THREE.Group(), W = 0.92, FZ = 0.33, BZ = -0.43, SY = 0.62;
          const hemMat = new THREE.MeshLambertMaterial({ color: fabricMat.color.clone().multiplyScalar(0.62) });
          const capMat = new THREE.MeshLambertMaterial({ color: 0x1e1f22 }), ringMat = new THREE.MeshLambertMaterial({ color: 0x3a3d42 });
          const put = (m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
          const bar = (a, b, w, d, mat) => {   // thanh gỗ vuông nối điểm a → b
            const len = a.distanceTo(b), m = new THREE.Mesh(new THREE.BoxGeometry(w, d, len), mat);
            m.position.copy(a).add(b).multiplyScalar(0.5); m.lookAt(b); return put(m);
          };
          const dowel = (y, z, r, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, W + 0.03, 10), mat); m.rotation.z = Math.PI / 2; m.position.set(0, y, z); return put(m); };
          const V = (x, y, z) => new THREE.Vector3(x, y, z);
          const sling = (w, h, sag, mat, curveAxis) => {   // tấm vải võng: uốn parabol theo bề ngang
            const geo = new THREE.BoxGeometry(w, h, 0.014, 12, 6, 1), pos = geo.attributes.position;
            for (let i = 0; i < pos.count; i++) { const u = pos.getX(i) / (w / 2), v = pos.getY(i) / (h / 2), k = (1 - u * u) * (curveAxis ? 1 : (1 - 0.35 * v * v)); pos.setZ(i, pos.getZ(i) - sag * k); }
            geo.computeVertexNormals(); return new THREE.Mesh(geo, mat);
          };
          for (const sx of [-1, 1]) {
            const x = sx * W / 2;
            bar(V(x, 0, FZ), V(x, 0.9, FZ), 0.042, 0.042, frameMat);                         // cột trước
            bar(V(x, 0, BZ), V(x, 1.42, BZ - 0.06), 0.042, 0.042, frameMat);                 // cột sau nghiêng ra sau
            bar(V(x, SY, FZ), V(x, SY, BZ - 0.035), 0.04, 0.05, frameMat);                   // thanh dọc đỡ vải ngồi
            bar(V(x * 1.0, 0.04, FZ - 0.02), V(x, SY - 0.03, BZ + 0.03), 0.032, 0.032, frameMat).position.x += sx * 0.03;   // chéo X ngoài
            bar(V(x, 0.04, BZ + 0.02), V(x, SY - 0.03, FZ - 0.03), 0.032, 0.032, frameMat).position.x -= sx * 0.005;       // chéo X trong
            const pin = put(new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.09, 8), ringMat)); pin.rotation.z = Math.PI / 2; pin.position.set(x + sx * 0.012, SY * 0.5 + 0.015, (FZ + BZ) / 2);   // chốt bản lề X
            // tay vịn: tấm gỗ bản rộng, đầu trước bo tròn
            const arm = put(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.03, 0.74), frameMat)); arm.position.set(x + sx * 0.012, 0.915, -0.03);
            const armTip = put(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 14, 1, false, -Math.PI / 2, Math.PI), frameMat)); armTip.position.set(x + sx * 0.012, 0.915, 0.34);
            for (const z of [FZ, BZ]) { const cap = put(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.032, 0.035, 8), capMat)); cap.position.set(x, 0.017, z); }   // nút chân nhựa
          }
          // vải ngồi võng + viền may ôm thanh giằng trước/sau
          dowel(SY, FZ - 0.01, 0.022, frameMat); dowel(SY, BZ + 0.0, 0.022, frameMat);
          const seat = sling(W - 0.03, 0.74, 0.045, fabricMat, true); seat.rotation.x = -Math.PI / 2; seat.position.set(0, SY + 0.012, -0.05); put(seat);
          for (const z of [FZ - 0.01, BZ]) { const hem = put(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, W - 0.05, 10), hemMat)); hem.rotation.z = Math.PI / 2; hem.position.set(0, SY, z); }
          // tựa lưng: vải cong ôm lưng giữa hai cột sau + ống viền trên/dưới
          const back = sling(W - 0.02, 0.36, 0.05, fabricMat, false); back.position.set(0, 1.17, BZ - 0.045); back.rotation.x = -0.05; put(back);
          for (const y of [1.0, 1.34]) { const hem = put(new THREE.Mesh(new THREE.BoxGeometry(W - 0.02, 0.035, 0.03), hemMat)); hem.position.set(0, y, BZ - 0.035 - (y - 1.0) * 0.17); hem.rotation.x = -0.05; }
          // giằng chân dưới thấp (trước + sau)
          bar(V(-W / 2, 0.12, FZ), V(W / 2, 0.12, FZ), 0.03, 0.03, frameMat); bar(V(-W / 2, 0.12, BZ), V(W / 2, 0.12, BZ), 0.03, 0.03, frameMat);
          // túi vải treo ngoài tay vịn phải + vòng khay cốc
          const pocket = put(new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.24, 0.3), hemMat)); pocket.position.set(W / 2 + 0.075, 0.79, -0.05);
          const cupRing = put(new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.008, 6, 18), ringMat)); cupRing.rotation.x = Math.PI / 2; cupRing.position.set(W / 2 + 0.012, 0.935, 0.2);
          g.scale.set(1.026, 0.9747, 1.026).multiplyScalar(CAMP_SCALE); return g;
        }
        { const ch = campChair(chairFabric, campFrameWood), p = worldCell(CHAIR_CELL[0], CHAIR_CELL[1]); ch.position.copy(p); ch.rotation.y = engObj.faceWater; ch.name = 'Ghế câu cá (Fishing Chair)'; scene.add(ch); }
        // ---- bên ghế câu: xô tôn nhỏ rỗng (trái) · cần câu nằm nghiêng dưới đất bên phải khi kỹ sư không ngồi câu ----
        const groundRod = fishingRod(); groundRod.name = 'Cần câu để dưới đất (Rod on Ground)';
        {
          const ch = scene.getObjectByName('Ghế câu cá (Fishing Chair)'); ch.updateMatrixWorld(true);
          const onGround = (lx, lz) => { const v = ch.localToWorld(new THREE.Vector3(lx, 0, lz)); v.y = cowY(v.x, v.z); return v; };
          const bucket = metalBucket(); bucket.scale.setScalar(0.095); bucket.position.copy(onGround(-0.9, -0.05)); bucket.rotation.y = engObj.faceWater + 0.6; scene.add(bucket);   // cao ~0,25 m
          const k = ENGINEER_BASE_SCALE * CAMP_SCALE, butt = onGround(0.85, 0.25), far = onGround(1.45, -2.85);
          const d = far.clone().sub(butt).setY(0).normalize(), side = new THREE.Vector3(d.z, 0, -d.x), chairX = new THREE.Vector3(Math.cos(ch.rotation.y), 0, -Math.sin(ch.rotation.y));
          if (side.dot(chairX) < 0) side.negate();   // máy câu chĩa ra ngoài, không đâm vào chân ghế
          groundRod.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(d, side), d, side));
          groundRod.scale.setScalar(k); groundRod.position.copy(butt).addScaledVector(d, 0.4 * k); groundRod.position.y = butt.y + 1.4 * ROD_R * k;   // nằm nghiêng một bên, máy câu tì đất
          scene.add(groundRod);
        }

        // ---- đèn lồng cắm trại treo trên cọc, cạnh ghế câu ----
        const LANTERN_CELL = _rc(26.8, 31);
        function lantern() {
          const g = new THREE.Group();
          const foot = cyl(0.16, 0.2, 0.12, caravanDark, true, false, null, 10); foot.position.y = 0.06; g.add(foot);
          const Hp = 2.5;
          const poleWoodMat = new THREE.MeshLambertMaterial({ color: 0x8b6f47 });
          const pole = cyl(0.025, 0.025, Hp, poleWoodMat, true, false, null, 8); pole.position.y = Hp / 2; g.add(pole);
          const arm = cyl(0.025, 0.025, 0.6, poleWoodMat, true, false, null, 7); arm.rotation.x = Math.PI / 2; arm.position.set(0, Hp - 0.025, 0.3); g.add(arm);
          const tip = cyl(0.025, 0.025, 0.18, poleWoodMat, true, false, null, 7); tip.position.set(0, Hp - 0.1, 0.58); g.add(tip);
          const parentLan = new THREE.Group(); parentLan.position.set(0, Hp - 0.2, 0.58); g.add(parentLan);
          const body = lanBody(parentLan);
          return { g, light: body.light, glow: body.glow, lan: body.lan };
        }

        const lanternObj = lantern();
        {
          const p = worldCell(LANTERN_CELL[0], LANTERN_CELL[1]), chW = worldCell(CHAIR_CELL[0], CHAIR_CELL[1]);
          lanternObj.g.position.copy(p); lanternObj.g.rotation.y = Math.atan2(chW.x - p.x, chW.z - p.z); scene.add(lanternObj.g);
        }

        // ---- lửa trại trước cửa caravan ----
        const FIRE_CELL = _rc(25, 32);
        const fireStone = new THREE.MeshLambertMaterial({ color: 0x9a958c }), fireAsh = new THREE.MeshLambertMaterial({ color: 0x39322e }), fireLog = new THREE.MeshLambertMaterial({ color: 0x6b4a2e });
        const flameCols = [0xff5a14, 0xffa024, 0xffd24a];
        // Củi cháy sém dựng bằng code:
        // vỏ nâu xám đen vân dọc thớ + lớp phát sáng là các vết nứt than hồng đỏ cam dồn ở đoạn giữa nằm trong lửa (vẽ canvas, không nhúng ảnh).
        function charredLogMaterial() {
          const W = 128, H = 256, rnd = (a, b) => a + Math.random() * (b - a);
          const bark = document.createElement('canvas'); bark.width = W; bark.height = H; const bx2 = bark.getContext('2d');
          bx2.fillStyle = '#2b2420'; bx2.fillRect(0, 0, W, H);
          for (let n = 0; n < 140; n++) {   // thớ dọc chạy theo chiều dài khúc củi (v)
            const x = rnd(0, W), shade = Math.round(rnd(30, 80)), warm = Math.round(rnd(0, 12));
            bx2.strokeStyle = `rgba(${shade + warm},${shade},${shade - 6},${rnd(0.35, 0.8)})`; bx2.lineWidth = rnd(0.6, 2.2);
            const y0 = rnd(-20, H), len = rnd(25, 120); bx2.beginPath(); bx2.moveTo(x, y0); bx2.lineTo(x + rnd(-3, 3), y0 + len); bx2.stroke();
          }
          for (let n = 0; n < 18; n++) { bx2.fillStyle = `rgba(150,146,138,${rnd(0.12, 0.3)})`; bx2.beginPath(); bx2.ellipse(rnd(0, W), rnd(H * 0.3, H * 0.7), rnd(4, 12), rnd(6, 18), 0, 0, 7); bx2.fill(); }   // tro bám giữa thân
          const glow = document.createElement('canvas'); glow.width = W; glow.height = H; const gx = glow.getContext('2d');
          gx.fillStyle = '#000'; gx.fillRect(0, 0, W, H);
          gx.shadowColor = 'rgba(255,40,0,0.9)'; gx.shadowBlur = 6;   // quầng đỏ quanh vết nứt
          for (let n = 0; n < 60; n++) {   // vết nứt than hồng: nét gãy khúc nóng đỏ, đậm ở giữa khúc củi, nhạt dần ra hai đầu
            const yc = H / 2 + rnd(-1, 1) * rnd(0, H * 0.36), heat = 1 - Math.abs(yc - H / 2) / (H * 0.46);
            gx.strokeStyle = `rgba(255,${Math.round(rnd(30, 95))},${Math.round(rnd(0, 18))},${Math.max(0.3, heat)})`; gx.lineWidth = rnd(1.5, 4.2);
            let x = rnd(0, W), y = yc; gx.beginPath(); gx.moveTo(x, y);
            for (let k = 0; k < 5; k++) { x += rnd(-9, 9); y += rnd(-14, 14); gx.lineTo(x, y); }
            gx.stroke();
          }
          const tex = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; };
          return new THREE.MeshLambertMaterial({ map: tex(bark), emissive: 0xff5a2a, emissiveMap: tex(glow), emissiveIntensity: 1.6 });   // nứt nóng đỏ
        }
        // Mức lửa theo giờ Pleiku: 19:00 = 100%, giảm đều tới 5% lúc 07:00; ban ngày (07:00–19:00) giữ 5%.
        const campfireLevel = h => (h >= 7 && h < 19) ? 0.05 : 1 - 0.95 * (((h - 19 + 24) % 24) / 12);
        function campfire() {
          const g = new THREE.Group();
          const ash = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.72, 0.08, 14), fireAsh); ash.position.y = 0.04; ash.receiveShadow = true; g.add(ash);
          for (let n = 0; n < 8; n++) { const a = n / 8 * 6.283; const st = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2 + Math.random() * 0.07, 0), fireStone); st.position.set(Math.cos(a) * 0.6, 0.12, Math.sin(a) * 0.6); st.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); st.scale.y = 0.72; st.castShadow = true; g.add(st); }
          const logMat = charredLogMaterial();
          for (let n = 0; n < 3; n++) { const lg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.12, 1.1, 12), logMat); lg.rotation.z = Math.PI / 2; lg.rotation.y = n / 3 * 6.283; lg.position.y = 0.14 + n * 0.065; lg.castShadow = true; g.add(lg); }
          const flameShapes = [0.72, 0.92, 0.64].map((height, variant) => {
            const positions = [], indices = [], radii = [1, 0.85, 0.55, 0.25, 0.025];
            for (let level = 0; level < 5; level++) {
              const t = level / 4, center = Math.sin(t * 2.5 + variant) * t * t * 0.13;
              for (let side = 0; side < 8; side++) {
                const angle = side / 8 * Math.PI * 2, radius = 0.17 * radii[level];
                positions.push(center + Math.cos(angle) * radius, t * height, Math.sin(angle) * radius * 0.8);
                if (level < 4) { const i = level * 8 + side, j = level * 8 + (side + 1) % 8; indices.push(i, j + 8, j, i, i + 8, j + 8); }
              }
            }
            const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setIndex(indices); geo.computeVertexNormals(); return geo;
          });
          const flames = [];
          for (let n = 0; n < 5; n++) {
            const fl = new THREE.Mesh(flameShapes[n % 3], new THREE.MeshBasicMaterial({ color: flameCols[n % 3], transparent: true, opacity: 0.9, depthWrite: false }));
            fl.position.set((Math.random() - 0.5) * 0.18, 0.24 + n * 0.008, (Math.random() - 0.5) * 0.18); fl.renderOrder = 9; g.add(fl); flames.push({ m: fl, ph: Math.random() * 6.28 });
          }
          const fireDetails = new THREE.Group(); fireDetails.name = 'Than hồng và đầu củi';
          const cutMat = new THREE.MeshLambertMaterial({ color: 0x3a2e26, emissive: 0xc2380c, emissiveIntensity: 0.6 }), coalMat = new THREE.MeshLambertMaterial({ color: 0x302720 });
          const emberMat = new THREE.MeshBasicMaterial({ color: 0xe95b17 }), endGeo = new THREE.CylinderGeometry(0.092, 0.092, 0.014, 12);
          for (let n = 0; n < 3; n++) for (const sign of [-1, 1]) {
            const end = new THREE.Mesh(endGeo, cutMat); end.rotation.z = Math.PI / 2; end.rotation.y = n / 3 * 6.283;
            end.position.set(sign * 0.551 * Math.cos(n / 3 * 6.283), 0.14 + n * 0.065, -sign * 0.551 * Math.sin(n / 3 * 6.283)); end.castShadow = true; fireDetails.add(end);
          }
          const coalGeo = new THREE.DodecahedronGeometry(0.09, 0), emberGeo = new THREE.IcosahedronGeometry(0.055, 0);
          for (let n = 0; n < 7; n++) {
            const angle = n * 2.4, radius = 0.17 + (n % 3) * 0.11;
            const coal = new THREE.Mesh(coalGeo, coalMat); coal.position.set(Math.cos(angle) * radius, 0.1, Math.sin(angle) * radius); coal.scale.set(1.1, 0.5, 0.9); fireDetails.add(coal);
            const ember = new THREE.Mesh(emberGeo, emberMat); ember.position.copy(coal.position); ember.position.y += 0.035; ember.scale.set(0.8, 0.25, 0.7); fireDetails.add(ember);
          }
          bakeStatic(fireDetails); g.add(fireDetails);
          const smoke = [];
          for (let n = 0; n < 10; n++) { const sm = new THREE.Mesh(new THREE.IcosahedronGeometry(0.21, 1), new THREE.MeshLambertMaterial({ color: 0x8d8880, transparent: true, opacity: 0, depthWrite: false })); sm.position.y = 0.9; g.add(sm); smoke.push({ m: sm, ph: n / 10 }); }   // 10 cụm khói lệch tuổi đều nhau → luồng khói liền
          const sparkGeo = new THREE.SphereGeometry(0.028, 6, 6);
          const sparks = [];
          for (let n = 0; n < 10; n++) {
            const sp = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: (n % 2 ? 0xffbb22 : 0xff5511), transparent: true, opacity: 0.9 }));
            sp.position.set((Math.random() - 0.5) * 0.3, 0.4 + Math.random() * 1.5, (Math.random() - 0.5) * 0.3);
            g.add(sp); sparks.push({ m: sp, ph: Math.random() * 6.28, spd: 0.9 + Math.random() * 0.7 });
          }

          const fsg = new THREE.Group(); fsg.position.set(0.85, 0.02, 1.05); fsg.rotation.set(-0.32, 0, 0.32); fsg.scale.setScalar(1.44); g.add(fsg);   // cá nướng ×1.44 (đã giảm 20% rồi thêm 10%), ngả nghiêng về phía lửa
          const sk = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1.2, 6), new THREE.MeshLambertMaterial({ color: 0xcca070 })); sk.position.y = 0.6; sk.castShadow = true; fsg.add(sk);
          const fg = new THREE.Group(); fg.position.set(0, 0.78, 0); fg.rotation.y = 1.2; fsg.add(fg);
          fg.name = 'Cá nướng nguyên con';
          const fMat = new THREE.MeshLambertMaterial({ color: 0xb86c3f, flatShading: true }), dMat = new THREE.MeshLambertMaterial({ color: 0x3d2216 });
          const finMat = new THREE.MeshLambertMaterial({ color: 0x99502a, side: THREE.DoubleSide, flatShading: true });
          const profile = [[0, -0.215], [0.025, -0.20], [0.075, -0.12], [0.11, 0], [0.09, 0.12], [0.06, 0.195], [0.02, 0.24], [0, 0.25]];
          const fBody = new THREE.Mesh(new THREE.LatheGeometry(profile.map(([radius, y]) => new THREE.Vector2(radius, y)), 12), fMat);
          fBody.scale.x = 0.5; fBody.castShadow = fBody.receiveShadow = true; fg.add(fBody);
          function fin(points, thickness = 0.018) {
            const shape = new THREE.Shape(points.map(([z, y]) => new THREE.Vector2(z, y)));
            const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false }); geo.rotateY(Math.PI / 2); geo.translate(-thickness / 2, 0, 0);
            const mesh = new THREE.Mesh(geo, finMat); mesh.castShadow = true; fg.add(mesh);
          }
          fin([[-0.025, -0.18], [-0.125, -0.31], [0, -0.27], [0.125, -0.31], [0.025, -0.18]], 0.024);
          fin([[0.08, -0.10], [0.17, -0.05], [0.15, 0.06], [0.085, 0.11]], 0.012);
          fin([[-0.085, -0.09], [-0.14, -0.11], [-0.12, 0.025], [-0.09, 0.04]], 0.012);
          const eyeGeo = new THREE.SphereGeometry(0.012, 6, 5), eyeMat = new THREE.MeshBasicMaterial({ color: 0x211c17 });
          for (const side of [-1, 1]) { const eye = new THREE.Mesh(eyeGeo, eyeMat); eye.position.set(side * 0.033, 0.17, 0.043); fg.add(eye); }
          const marks = [], markIndices = [];
          function fishRadius(y) { for (let i = 1; i < profile.length; i++)if (y <= profile[i][1]) { const a = profile[i - 1], b = profile[i]; return a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]); } return 0; }
          for (const side of [-1, 1]) for (const centerY of [-0.09, -0.015, 0.06]) {
            const k = marks.length / 3;
            for (let i = 0; i <= 6; i++)for (const edge of [-1, 1]) {
              const z = (i / 6 - 0.5) * 0.13, y = centerY + z * 0.32 + edge * 0.007, radius = fishRadius(y);
              marks.push(side * (Math.sqrt(Math.max(0, radius * radius - z * z)) * 0.5 + 0.0015), y, z);
            }
            for (let i = 0; i < 6; i++) { const j = k + i * 2; markIndices.push(j, j + 1, j + 3, j, j + 3, j + 2); }
          }
          const marksGeo = new THREE.BufferGeometry(); marksGeo.setAttribute('position', new THREE.Float32BufferAttribute(marks, 3)); marksGeo.setIndex(markIndices); marksGeo.computeVertexNormals(); dMat.side = THREE.DoubleSide; fg.add(new THREE.Mesh(marksGeo, dMat));
          bakeStatic(fg);

          // ---- than hồng ở tâm (dư âm ngọn lửa): quầng sáng loang trên tro + ụ than góc cạnh dưới chân củi, vẫn âm ỉ khi lửa còn 5% ----
          const glowC = document.createElement('canvas'); glowC.width = glowC.height = 128; const gc = glowC.getContext('2d');
          const grad = gc.createRadialGradient(64, 64, 4, 64, 64, 64);
          grad.addColorStop(0, 'rgba(255,190,90,1)'); grad.addColorStop(0.35, 'rgba(255,96,24,0.85)'); grad.addColorStop(0.7, 'rgba(170,30,8,0.35)'); grad.addColorStop(1, 'rgba(90,10,0,0)');
          gc.fillStyle = grad; gc.fillRect(0, 0, 128, 128);
          const glowTex = new THREE.CanvasTexture(glowC); glowTex.colorSpace = THREE.SRGBColorSpace;
          const glowMat = new THREE.MeshBasicMaterial({ map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
          const glowDisc = new THREE.Mesh(new THREE.CircleGeometry(0.42, 24), glowMat); glowDisc.rotation.x = -Math.PI / 2; glowDisc.position.y = 0.085; glowDisc.renderOrder = 8; g.add(glowDisc);
          const hotMat = new THREE.MeshBasicMaterial({ color: 0xff5a14 }), dimMat = new THREE.MeshLambertMaterial({ color: 0x2a1f1a, emissive: 0x8a1e06, emissiveIntensity: 0.8 });
          const coreGeo = new THREE.IcosahedronGeometry(0.05, 0), coreGroup = new THREE.Group(); coreGroup.name = 'Than hồng tâm lửa';
          for (let n = 0; n < 22; n++) {
            const a = n * 2.39996, r = 0.03 + Math.sqrt(n / 22) * 0.24;
            const piece = new THREE.Mesh(coreGeo, n % 3 === 1 ? dimMat : hotMat);
            piece.position.set(Math.cos(a) * r, 0.09 + (0.27 - r) * 0.18 + Math.random() * 0.02, Math.sin(a) * r);
            piece.rotation.set(Math.random() * 3, Math.random() * 3, Math.random() * 3); piece.scale.set(0.7 + Math.random() * 0.8, 0.45 + Math.random() * 0.35, 0.7 + Math.random() * 0.8);
            coreGroup.add(piece);
          }
          bakeStatic(coreGroup); g.add(coreGroup);
          const light = new THREE.PointLight(0xff7a2a, 0.6, 11, 2); light.position.y = 0.7; g.add(light);
          return { g, flames, smoke, sparks, light, logMat, cutMat, emberMat, glowMat, hotMat, dimMat };
        }
        const campObj = campfire(); campObj.g.scale.multiplyScalar(CAMP_SCALE); // Grilled fish, stones, logs and flame children inherit this once.
        { const p = worldCell(FIRE_CELL[0], FIRE_CELL[1]); campObj.g.position.copy(p); campObj.g.name = 'Bếp lửa trại (Campfire)'; scene.add(campObj.g); }

        // ---- bàn dã ngoại thấp + ghế bệt + đống củi & cọc gỗ quanh bếp lửa ----
        const pf = worldCell(FIRE_CELL[0], FIRE_CELL[1]);
        // ---- ẤM REO CẮM TRẠI dựng bằng code:
        //      thân vòm tiện theo biên dạng (đáy loe Ø1,45 · vai cong · miệng có gờ cuộn · nắp vồng), khoen nắp,
        //      quai thép dẹt uốn cung, vòi ngắn chếch 40° với nắp còi nhựa đen + cần gạt; màu tô theo vùng nhiệt:
        //      đáy muội đen → giữa ám nâu nhiệt → vai thép sáng, nắp thép mờ. Đơn vị gốc: cao 1,86 tới đỉnh quai ----
        function kettleTexture(prof) {   // tô theo tham số biên dạng (v = chỉ số điểm tiện), nhiễu tuần hoàn theo u để không lộ đường nối
          const Wt = 256, Ht = 256, cv = document.createElement('canvas'); cv.width = Wt; cv.height = Ht;
          const ctx = cv.getContext('2d'), img = ctx.createImageData(Wt, Ht), D = img.data, N = prof.length;
          const hash = (i, j) => { let h = (Math.imul(i, 374761393) + Math.imul(j, 668265263)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
          const vn = (u, v, P) => { const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, a = ((i % P) + P) % P, b = (((i + 1) % P) + P) % P, su = fu * fu * (3 - 2 * fu), sv = fv * fv * (3 - 2 * fv), h00 = hash(a, j), h10 = hash(b, j), h01 = hash(a, j + 1), h11 = hash(b, j + 1); return h00 + (h10 - h00) * su + (h01 - h00) * sv + (h00 - h10 - h01 + h11) * su * sv; };
          const fbm = (u, v, P) => { let s = 0, a = 0.5; for (let o = 0; o < 4; o++) { s += a * vn(u, v, P); u *= 2; v *= 2; P *= 2; a *= 0.5; } return s / 0.9375; };
          const sm = t => { t = Math.min(1, Math.max(0, t)); return t * t * (3 - 2 * t); };
          const mix = (A, B, t) => [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
          const hex = h => [(h >> 16) & 255, (h >> 8) & 255, h & 255];
          const SOOT = hex(0x2c2724), SOOT2 = hex(0x17130f), HEAT = hex(0x645951), RUST = hex(0x7a5a3e), STEEL = hex(0xa49f97), SHINE = hex(0xd3d3d4), LID = hex(0xb2b0ac), LIDDK = hex(0x635f58);
          const lidJ = prof.findIndex(p => p[1] >= 0.872);
          for (let r = 0; r < Ht; r++) {
            const jf = (1 - (r + 0.5) / Ht) * (N - 1), j0 = Math.min(N - 2, Math.floor(jf)), y = prof[j0][1] + (prof[j0 + 1][1] - prof[j0][1]) * (jf - j0);
            for (let q = 0; q < Wt; q++) {
              const u = (q + 0.5) / Wt, n1 = fbm(u * 8, y * 9, 8), n2 = fbm(u * 16 + 3, y * 21, 16);
              let col;
              if (jf >= lidJ) { col = mix(LID, LIDDK, Math.max(0, (n1 - 0.52) * 2.2)); if (jf < lidJ + 0.7) col = mix(col, LIDDK, 0.65); }   // nắp thép mờ + ron nắp sẫm
              else {
                const soot = 1 - sm((y - 0.2 - (n1 - 0.5) * 0.4) / 0.28), heat = 1 - sm((y - 0.5 - (n2 - 0.5) * 0.22) / 0.24);   // ranh muội gợn lưỡi lửa
                col = mix(STEEL, HEAT, heat); col = mix(col, RUST, Math.max(0, (n2 - 0.6) * 2.4) * heat * (1 - soot)); col = mix(col, mix(SOOT, SOOT2, n2), soot);
                if (y > 0.58) col = mix(col, SHINE, Math.max(0, (n1 - 0.6) * 1.9));   // mảng thép còn sáng trên vai
              }
              const o = (r * Wt + q) * 4; D[o] = col[0]; D[o + 1] = col[1]; D[o + 2] = col[2]; D[o + 3] = 255;
            }
          }
          ctx.putImageData(img, 0, 0); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; t.anisotropy = 4; return t;
        }
        function campKettle() {
          const g = new THREE.Group(); g.name = 'Ấm reo cắm trại (Campers Kettle)';
          const prof = [[0, 0.004], [0.62, 0.004], [0.705, 0.012], [0.735, 0.03], [0.728, 0.05], [0.72, 0.09], [0.72, 0.2], [0.717, 0.28], [0.711, 0.34], [0.699, 0.4], [0.683, 0.45], [0.663, 0.5], [0.641, 0.55],
            [0.613, 0.6], [0.581, 0.65], [0.543, 0.7], [0.497, 0.75], [0.441, 0.8], [0.39, 0.84], [0.375, 0.858], [0.356, 0.864], [0.345, 0.872], [0.33, 0.888], [0.28, 0.905], [0.2, 0.922], [0.1, 0.934], [0, 0.938]];
          const body = new THREE.Mesh(new THREE.LatheGeometry(prof.map(p => new THREE.Vector2(p[0], p[1])), 40), new THREE.MeshLambertMaterial({ map: kettleTexture(prof) }));
          body.castShadow = true; body.receiveShadow = true; g.add(body);
          const steel = new THREE.MeshLambertMaterial({ color: 0x66655a }), plastic = new THREE.MeshLambertMaterial({ color: 0x2a2826 }), bronze = new THREE.MeshLambertMaterial({ color: 0x534d43 }), hole = new THREE.MeshBasicMaterial({ color: 0x0b0b0b });
          const add = (m, cast = true) => { m.castShadow = cast; m.receiveShadow = true; g.add(m); return m; };
          add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.03, 10), steel)).position.y = 0.948;   // chân khoen
          add(new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 8, 20), steel)).position.y = 1.058;           // khoen nắp đứng
          // quai: dải thép dẹt (ống ép dẹt theo z), tai hai bên vai — tai phải tựa gốc vòi như mẫu
          const bailPath = new THREE.CatmullRomCurve3([[-0.47, 0.8], [-0.505, 1.0], [-0.51, 1.25], [-0.49, 1.45], [-0.4, 1.65], [-0.22, 1.8], [0, 1.86], [0.22, 1.8], [0.4, 1.65], [0.49, 1.45], [0.51, 1.25], [0.505, 1.0], [0.47, 0.8]].map(p => new THREE.Vector3(p[0], p[1], 0)));
          const bail = add(new THREE.Mesh(new THREE.TubeGeometry(bailPath, 56, 0.022, 6, false), steel)); bail.scale.z = 2.2;
          for (const sx of [-1, 1]) { const lug = add(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.13), steel)); lug.position.set(sx * 0.455, 0.8, 0); lug.rotation.z = -sx * 0.75; }   // tai quai tán đinh trên vai
          // vòi: cổ đồng ám khói gốc ngập vào thân → nắp còi nhựa đen đầu tròn có lỗ còi, cần gạt dẹt phía trên
          const sd = new THREE.Vector3(0.77, 0.64, 0).normalize(), sq = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), sd), o0 = new THREE.Vector3(0.5, 0.66, 0.07);
          const along = (m, t) => { m.quaternion.copy(sq); m.position.copy(o0).addScaledVector(sd, t); return add(m); };
          along(new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.15, 0.26, 16), bronze), 0.13);
          along(new THREE.Mesh(new THREE.CylinderGeometry(0.118, 0.118, 0.18, 16), plastic), 0.35);
          along(new THREE.Mesh(new THREE.SphereGeometry(0.118, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), plastic), 0.44);
          along(new THREE.Mesh(new THREE.CircleGeometry(0.034, 12), hole), 0.44 + 0.117).rotateX(-Math.PI / 2);   // lỗ còi nhìn theo hướng vòi
          const lever = along(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.2, 0.026), plastic), 0.36); lever.position.addScaledVector(new THREE.Vector3(-sd.y, sd.x, 0), 0.13); lever.rotateZ(-0.35);   // cần gạt mở còi
          return g;
        }
        const kettleSteam = [];   // hơi còi ấm reo (cập nhật trong vòng lặp theo cỡ lửa)
        // ---- GIÁ TREO NỒI bắc qua bếp lửa: 2 khung chữ A gỗ + thanh ngang + ấm reo treo móc (ấm thay nồi gang cũ) ----
        {
          const rg = new THREE.Group();
          const rackDarkGray = new THREE.MeshLambertMaterial({ color: 0x404346 });                 // xám đen
          const potIron = new THREE.MeshLambertMaterial({ color: 0x2e2b28, flatShading: true });  // gang đen facet
          for (const sx of [-1, 1]) for (const sz of [-1, 1]) {                                   // 4 chân — 2 khung chữ A hai bên lửa
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.0175, 0.0225, 2.1, 7), rackDarkGray);
            leg.position.set(sx * 1.05, 0.93, sz * 0.21); leg.rotation.x = -sz * 0.29; leg.castShadow = true; rg.add(leg);   // xòe chân DƯỚI · hai đầu BẮT CHÉO qua tâm (X) tạo hõm đỡ thanh ngang; ngọn nhô lên trên như kiềng cắm trại
          }
          const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 2.75, 7), rackDarkGray);  // thanh ngang gác lên 2 chạc chữ A
          bar.rotation.z = Math.PI / 2; bar.position.y = 1.66; bar.castShadow = true; rg.add(bar);
          const hook = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), potIron); hook.position.y = 1.61; rg.add(hook);            // móc sắt ngắn
          const curl = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.009, 6, 14, Math.PI * 1.35), potIron); curl.position.y = 1.545; curl.rotation.z = Math.PI * 1.08; rg.add(curl);   // đầu móc cong đỡ đỉnh quai ấm
          const kettle = campKettle(); kettle.scale.setScalar(0.4); kettle.position.y = 0.786; kettle.rotation.y = 0.92; rg.add(kettle);   // đỉnh quai (y 1,86 × 0,4) gác đúng đáy móc ở 1,53; vòi quay ngang tầm nhìn mặc định
          // hơi nước phụt từ miệng còi khi lửa lớn (động, không gộp)
          kettle.updateMatrix(); const tip = new THREE.Vector3(0.93, 1.03, 0.07).applyMatrix4(kettle.matrix), spoutDir = new THREE.Vector3(0.77, 0, 0).applyQuaternion(kettle.quaternion);
          const kSteam = new THREE.Group(); kSteam.userData.noBake = true; kSteam.position.copy(tip); rg.add(kSteam);
          for (let n = 0; n < 7; n++) {
            const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.03, 1), new THREE.MeshBasicMaterial({ color: 0xf2efe8, transparent: true, opacity: 0, depthWrite: false }));
            kSteam.add(puff); kettleSteam.push({ m: puff, ph: n / 7, dir: spoutDir });
          }
          bakeStatic(rg); rg.scale.multiplyScalar(CAMP_SCALE); rg.position.copy(pf); rg.rotation.y = -0.2; rg.name = 'Giá treo nồi (Pot Hanger)'; scene.add(rg);   // xoay nhẹ để chân né xiên cá nướng
        }
        const woodEndM = new THREE.MeshLambertMaterial({ color: 0xc8a878 });   // mặt cắt gỗ nhạt
        // Bàn gỗ nan cuộn (roll-top) chân chữ X; ca & chảo cắm trại dựng bằng code: nhôm sơn đen, quai dây thép gập.
        const campCupSteam = []; let campPanRig = null;   // chảo trên bàn trà: chỉ hiện khi bữa tối được mang ra
        function campTable() {
          const g = new THREE.Group();
          const L = 0.66, W = 0.48, H = 0.45, beech = new THREE.MeshLambertMaterial({ color: 0xd9b98a }), beech2 = new THREE.MeshLambertMaterial({ color: 0xcaa774 });
          const ironBlack = new THREE.MeshLambertMaterial({ color: 0x1e1f21 });
          const slatN = 9, slatW = (W - (slatN - 1) * 0.006) / slatN;
          for (let i = 0; i < slatN; i++) { const s2 = bx(L, 0.018, slatW, i % 2 ? beech2 : beech, true, true, lineDark); s2.position.set(0, H - 0.009, -W / 2 + slatW / 2 + i * (slatW + 0.006)); g.add(s2); }   // nan mặt bàn
          for (const sz of [-1, 1]) { const rail = bx(L - 0.04, 0.045, 0.022, beech2, true, true, lineDark); rail.position.set(0, H - 0.04, sz * (W / 2 - 0.03)); g.add(rail); }   // khung đỡ dọc
          for (const sx of [-1, 1]) {   // chân chữ X ở 2 đầu + bát sắt đen ở giao điểm và đỉnh chân
            const ex = sx * (L / 2 - 0.08), span = W / 2 - 0.02, legH = H - 0.06, len = Math.hypot(2 * span, legH), tilt = Math.atan2(2 * span, legH);
            for (const dir of [-1, 1]) { const leg = bx(0.028, len, 0.034, beech, true, true, lineDark); leg.position.set(ex, legH / 2, 0); leg.rotation.x = dir * tilt; g.add(leg); }
            const hub = bx(0.04, 0.05, 0.05, ironBlack, true, false); hub.position.set(ex, legH / 2, 0); hub.rotation.x = Math.PI / 4; g.add(hub);
            for (const sz of [-1, 1]) { const br = bx(0.034, 0.05, 0.05, ironBlack, true, false); br.position.set(ex, H - 0.05, sz * span); g.add(br); }
            const cross = bx(0.03, 0.03, W - 0.06, beech2, true, true, lineDark); cross.position.set(ex, H - 0.045, 0); g.add(cross);   // thanh ngang đầu bàn
          }
          const pot = new THREE.MeshLambertMaterial({ color: 0x2c2d31 }), potIn = new THREE.MeshLambertMaterial({ color: 0x4a4c50 });   // lòng nồi: biên dạng đi xuống-vào nên pháp tuyến đã hướng vào trong
          const wire = (pts, r = 0.0035) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map(p => new THREE.Vector3(...p))), 24, r, 5, false), pot);
          const lathe = (pts, mat) => { const m = new THREE.Mesh(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), 20), mat); m.castShadow = true; return m; };
          // ca nấu (boiler): thân trụ Ø9 cm cao 11 cm, vành cuộn, mỏ rót, quai dây gập bên hông
          const cup = new THREE.Group(); cup.position.set(0.16, H, 0.07); g.add(cup);
          cup.add(lathe([[0, 0], [0.043, 0], [0.045, 0.006], [0.045, 0.108], [0.047, 0.11]], pot));
          cup.add(lathe([[0.047, 0.11], [0.042, 0.106], [0.042, 0.008], [0, 0.008]], potIn));
          const tea = new THREE.Mesh(new THREE.CircleGeometry(0.041, 18), new THREE.MeshLambertMaterial({ color: 0x5a3a1c })); tea.rotation.x = -Math.PI / 2; tea.position.y = 0.09; cup.add(tea);   // nước trà nóng
          const spout = bx(0.018, 0.012, 0.02, pot, false, false); spout.position.set(0, 0.108, 0.048); spout.rotation.x = -0.5; cup.add(spout);
          cup.add(wire([[-0.045, 0.085, 0], [-0.085, 0.085, 0], [-0.1, 0.06, 0], [-0.085, 0.035, 0], [-0.045, 0.035, 0]]));
          // chảo: đáy Ø15 cm loe lên Ø17 cm, thành 4 cm, cán dây gập
          const pan = new THREE.Group(); pan.position.set(-0.13, H, -0.06); pan.rotation.y = 0.5; pan.userData.noBake = true; pan.visible = false; pan.name = 'Chảo cơm chiên'; g.add(pan);
          pan.add(lathe([[0, 0], [0.075, 0], [0.08, 0.008], [0.086, 0.04], [0.088, 0.042]], pot));
          pan.add(lathe([[0.088, 0.042], [0.083, 0.039], [0.077, 0.01], [0, 0.01]], potIn));
          pan.add(wire([[0.086, 0.035, 0.02], [0.2, 0.05, 0.016], [0.215, 0.05, 0], [0.2, 0.05, -0.016], [0.086, 0.035, -0.02]], 0.004));
          { const food = fryPan().userData.food; food.visible = true; pan.add(food); campPanRig = { pan, food }; }   // cơm chiên trứng, vơi dần khi ăn
          // khói nóng mỏng bốc từ ca (động, không gộp)
          const steam = new THREE.Group(); steam.userData.noBake = true; steam.position.set(cup.position.x, H + 0.1, cup.position.z); g.add(steam);
          for (let n = 0; n < 5; n++) {
            const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(0.018, 1), new THREE.MeshBasicMaterial({ color: 0xf2efe8, transparent: true, opacity: 0, depthWrite: false }));
            steam.add(puff); campCupSteam.push({ m: puff, ph: n / 5 });
          }
          return bakeStatic(g);
        }
        function woodCamp() {   // đống củi xếp tháp + cọc gỗ đóng đất
          const g = new THREE.Group();
          // củi bổ chi tiết: vỏ vân dọc thớ · mặt cắt có vòng tuổi, lõi sẫm, viền vỏ, vết nứt toả · xen khúc chẻ đôi lộ thớ gỗ sáng;
          // đường kính, chiều dài và góc xoay mỗi khúc lệch nhau nên đầu củi không thẳng tắp
          const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; };
          const barkM = new THREE.MeshLambertMaterial({ map: canvasTex(64, 128, (x, w, h) => {
            x.fillStyle = '#4a3324'; x.fillRect(0, 0, w, h);
            for (let n = 0; n < 70; n++) { const v = 40 + Math.random() * 50; x.strokeStyle = `rgba(${v + 25},${v + 8},${v - 10},0.7)`; x.lineWidth = 1 + Math.random() * 2; const px = Math.random() * w, py = Math.random() * h; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (Math.random() - 0.5) * 3, py + 20 + Math.random() * 50); x.stroke(); }
          }) });
          const ringM = new THREE.MeshLambertMaterial({ map: canvasTex(128, 128, (x, w) => {
            const c = w / 2; x.fillStyle = '#3e2a1d'; x.fillRect(0, 0, w, w);
            for (let r = c * 0.9; r > 2; r -= 3 + Math.random() * 3) { const v = Math.random(); x.fillStyle = v > 0.5 ? '#b78a58' : '#a07548'; x.beginPath(); x.arc(c + Math.random() - 0.5, c + Math.random() - 0.5, r, 0, 7); x.fill(); x.strokeStyle = 'rgba(110,72,40,0.55)'; x.lineWidth = 1; x.stroke(); }
            x.fillStyle = '#6b4526'; x.beginPath(); x.arc(c, c, 4, 0, 7); x.fill();   // lõi sẫm
            x.strokeStyle = 'rgba(60,36,20,0.85)'; x.lineWidth = 1.6;
            for (let k = 0; k < 3; k++) { const a = Math.random() * 6.28; x.beginPath(); x.moveTo(c + Math.cos(a) * 6, c + Math.sin(a) * 6); x.lineTo(c + Math.cos(a + 0.1) * c * 0.75, c + Math.sin(a + 0.1) * c * 0.75); x.stroke(); }   // vết nứt toả
            x.strokeStyle = '#3a2618'; x.lineWidth = c * 0.18; x.beginPath(); x.arc(c, c, c * 0.92, 0, 7); x.stroke();   // viền vỏ
          }) });
          const splitM = new THREE.MeshLambertMaterial({ map: canvasTex(128, 32, (x, w, h) => {
            x.fillStyle = '#c29b68'; x.fillRect(0, 0, w, h);
            for (let n = 0; n < 40; n++) { x.strokeStyle = `rgba(140,98,58,${0.3 + Math.random() * 0.4})`; x.lineWidth = 0.6 + Math.random(); const yy = Math.random() * h; x.beginPath(); x.moveTo(0, yy); x.bezierCurveTo(w * 0.3, yy + (Math.random() - 0.5) * 6, w * 0.7, yy + (Math.random() - 0.5) * 6, w, yy + (Math.random() - 0.5) * 4); x.stroke(); }
          }) });
          function firewood(r, len, half) {   // khúc củi nằm dọc trục +X; half = khúc chẻ đôi (mặt chẻ hướng +Y trước khi xoay)
            const piece = new THREE.Group(), theta = half ? Math.PI : Math.PI * 2;
            const side = new THREE.CylinderGeometry(r, r, len, 12, 1, true, 0, theta); side.rotateZ(-Math.PI / 2);
            const add = (geo, mat) => { const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; piece.add(m); };
            add(side, barkM);
            for (const sx of [-1, 1]) {
              const cap = new THREE.CircleGeometry(r * 1.002, 14, half ? Math.PI : 0, theta); cap.rotateY(sx * Math.PI / 2); cap.translate(sx * len / 2, 0, 0); add(cap, ringM);
            }
            if (half) { const face = new THREE.PlaneGeometry(len, 2 * r); face.rotateX(-Math.PI / 2); add(face, splitM); }
            return piece;
          }
          const layers = [5, 4, 3, 2], y0 = 0.09, gap = 0.135;
          for (let L = 0; L < layers.length; L++) {
            const cnt = layers[L], span = (cnt - 1) * gap;
            for (let k = 0; k < cnt; k++) {
              const half = (L + k) % 3 === 1, r = 0.058 + Math.random() * 0.016, len = 0.56 + Math.random() * 0.08;
              const lg = firewood(r, len, half);
              lg.position.set((Math.random() - 0.5) * 0.06, y0 + L * 0.122 - (half ? 0.02 : 0), -span / 2 + k * gap + (Math.random() - 0.5) * 0.02);
              lg.rotation.set(Math.random() * Math.PI * 2, (Math.random() - 0.5) * 0.08, 0); g.add(lg);
            }
          }
          const stake = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.72, 7), fireLog); stake.position.set(0.55, 0.3, 0.36); stake.rotation.z = 0.13; stake.castShadow = true; g.add(stake);
          const stakeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.02, 7), woodEndM); stakeTop.position.set(0.55 - Math.sin(0.13) * 0.36, 0.66, 0.36); stakeTop.rotation.z = 0.13; g.add(stakeTop);
          return bakeStatic(g);
        }
        const placeFire = (obj, ox, oz, ry) => { const X = pf.x + ox, Z = pf.z + oz; obj.position.set(X, cowY(X, Z), Z); if (ry != null) obj.rotation.y = ry; scene.add(obj); };
        // ---- góc bàn-ghế uống trà dời về toạ độ hover (66, _, 101), tách khỏi bếp lửa (tránh giẫm/chồng vào lửa) ----
        const restCX = X0 + 66, restCZ = Z0 + 101;
        // ---- vị trí + hướng ngồi của ghế cắm trại (dùng lại cho lịch trình kỹ sư) · bán kính né bếp lửa khi đi ngang qua ----
        const campChairPos = new THREE.Vector3(restCX - 0.85, 0, restCZ - 0.15); campChairPos.y = cowY(campChairPos.x, campChairPos.z);
        const campChairFaceY = Math.atan2(restCX - campChairPos.x, restCZ - campChairPos.z);   // ghế quay mặt vào bàn
        const FIRE_AVOID_R = 1.9 * CAMP_SCALE;
        obstacleCoords.push({ x: pf.x, y: pf.y, z: pf.z, r: FIRE_AVOID_R, h: 2.2 * CAMP_SCALE });   // bếp lửa vào danh sách vật cản → flow field & repel & côn trùng đều né
        const woodCampY = cowY(X0 + 68, Z0 + 100);
        obstacleCoords.push({ x: X0 + 68, y: woodCampY, z: Z0 + 100, r: 0.8, h: 1.0 });                 // đống củi mới vào danh sách vật cản (world coordinates)
        { const ch = campChair(campFabricYellow, campFrameWood); ch.position.copy(campChairPos); ch.rotation.y = campChairFaceY; ch.name = 'Ghế cắm trại (Camp Chair)'; scene.add(ch); }   // ghế dã ngoại dạng gấp tương tự ghế câu cá
        { const tb = campTable(); tb.position.set(X0 + 65, cowY(X0 + 65, Z0 + 99.85), Z0 + 99.85);   // toạ độ hover (65, _, 100), lùi 15 cm khỏi tay ghế cắm trại cho khỏi chạm; xa cột chống bạt ~1,4 m
           tb.rotation.y = Math.PI * 0.15; tb.name = 'Bàn trà (Camp Table)'; scene.add(tb); }
        { const wc = woodCamp(); wc.name = 'Đống củi (Woodpile)'; wc.position.set(X0 + 68, woodCampY, Z0 + 100); wc.rotation.y = 0.5; scene.add(wc); }

