        // ---- 1 chú hươu có sừng ----
        function createStag() {
          const g = new THREE.Group();
          const deerMat = new THREE.MeshLambertMaterial({ color: 0x9b6e43 });
          const bellyMat = new THREE.MeshLambertMaterial({ color: 0xd2b48c });
          const hornMat = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
          const P = (par, w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
            const m = bx(w, h, d, mat, true, true); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); par.add(m); return m;
          };
          P(g, 1.4, 0.72, 0.64, deerMat, 0, 1.6, 0);
          P(g, 1.0, 0.12, 0.44, bellyMat, 0, 1.25, 0);
          const neckG = new THREE.Group(); neckG.position.set(0.65, 1.85, 0); neckG.rotation.z = -0.42; g.add(neckG);
          const neck = P(neckG, 0.36, 0.8, 0.36, deerMat, 0, 0.4, 0);
          const headG = new THREE.Group(); headG.position.set(0, 0.8, 0); neckG.add(headG);
          const head = P(headG, 0.55, 0.4, 0.4, deerMat, 0.1, 0.2, 0);
          P(head, 0.34, 0.26, 0.28, bellyMat, 0.44, 0.15, 0);
          P(head, 0.08, 0.08, 0.1, new THREE.MeshLambertMaterial({ color: 0x111111 }), 0.6, 0.18, 0);
          for (const sz of [-1, 1]) { P(head, 0.1, 0.35, 0.14, deerMat, -0.15, 0.38, sz * 0.18, 0.35 * sz, 0, -0.4); }
          for (const sz of [-1, 1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 6), new THREE.MeshBasicMaterial({ color: 0x111111 })); eye.position.set(0.24, 0.28, sz * 0.21); head.add(eye);
          }
          for (const sz of [-1, 1]) {
            const baseHorn = P(head, 0.08, 0.45, 0.08, hornMat, -0.05, 0.6, sz * 0.12, 0.2 * sz, 0, -0.15);
            P(baseHorn, 0.06, 0.3, 0.06, hornMat, 0.08, 0.12, sz * 0.08, 0.3 * sz, 0, 0.5);
            P(baseHorn, 0.06, 0.25, 0.06, hornMat, -0.08, 0.24, -sz * 0.04, -0.2 * sz, 0, -0.4);
          }
          const legs = [];
          const legDefs = [[0.45, 0.22], [0.45, -0.22], [-0.48, 0.22], [-0.48, -0.22]];
          for (const lp of legDefs) {
            const hip = new THREE.Group(); hip.position.set(lp[0], 1.25, lp[1]); g.add(hip);
            P(hip, 0.18, 0.55, 0.18, deerMat, 0, -0.275, 0);
            const knee = new THREE.Group(); knee.position.y = -0.55; hip.add(knee);
            P(knee, 0.14, 0.6, 0.14, deerMat, 0, -0.3, 0);
            P(knee, 0.16, 0.08, 0.16, new THREE.MeshLambertMaterial({ color: 0x222222 }), 0, -0.64, 0);
            legs.push({ hip, knee });
          }
          P(g, 0.12, 0.35, 0.12, deerMat, -0.72, 1.82, 0, 0, 0, -0.55);
          g.userData = { neck: neckG, legs };
          return g;
        }
        let stag = null;
        {
          const m = createStag(); m.scale.multiplyScalar(NATURE_SCALE);
          const x = X0 + 176, z = Z0 + 171;
          m.position.set(x, cowY(x, z), z);   // bám mặt địa hình thay vì y cứng 4.0
          m.rotation.y = -0.8;
          m.name = 'Chú hươu có sừng (Stag)';
          scene.add(m);
          stag = {
            g: m,
            neck: m.userData.neck,
            legs: m.userData.legs,
            x, z,
            ang: -0.8,
            tmr: 5.0,
            state: 'walk',
            targetX: x, targetZ: z
          };
        }

        // ---- 1 chú cua bể ----
        function createCrab() {
          const g = new THREE.Group();
          const redMat = new THREE.MeshLambertMaterial({ color: 0xe0533c });
          const darkMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
          const shellMat = new THREE.MeshLambertMaterial({ color: 0xf06c54 });
          const P = (par, w, h, d, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
            const m = bx(w, h, d, mat, true, true); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); par.add(m); return m;
          };
          P(g, 0.44, 0.16, 0.32, shellMat, 0, 0.08, 0);
          for (const sz of [-1, 1]) {
            const stalk = P(g, 0.04, 0.15, 0.04, redMat, 0.12, 0.2, sz * 0.08, 0, 0, 0.2);
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.035, 6, 6), darkMat); eye.position.set(0, 0.08, 0); stalk.add(eye);
          }
          const claws = [];
          for (const sz of [-1, 1]) {
            const arm = new THREE.Group(); arm.position.set(0.18, 0.08, sz * 0.14); arm.rotation.set(0, -0.3 * sz, 0.2); g.add(arm);
            P(arm, 0.16, 0.1, 0.1, redMat, 0.08, 0, 0);
            const pincher = new THREE.Group(); pincher.position.set(0.16, 0, 0); arm.add(pincher);
            P(pincher, 0.18, 0.12, 0.12, redMat, 0.09, 0, 0);
            const thumb = P(pincher, 0.1, 0.06, 0.06, redMat, 0.12, 0, -0.04 * sz, 0, -0.3 * sz, 0);
            claws.push({ arm, pincher, thumb, sz });
          }
          const legs = [];
          const legOffsets = [[-0.1, -0.16], [-0.02, -0.18], [0.06, -0.16], [-0.1, 0.16], [-0.02, 0.18], [0.06, 0.16]];
          for (let i = 0; i < legOffsets.length; i++) {
            const lo = legOffsets[i]; const sz = lo[1] > 0 ? 1 : -1;
            const leg = new THREE.Group(); leg.position.set(lo[0], 0.04, lo[1]); leg.rotation.y = (i % 3 === 0 ? -0.4 : (i % 3 === 2 ? 0.4 : 0)) + (sz > 0 ? 0 : Math.PI); g.add(leg);
            P(leg, 0.18, 0.05, 0.05, redMat, 0.09, 0, 0, 0, 0, -0.4);
            P(leg, 0.14, 0.04, 0.04, redMat, 0.16, -0.06, 0, 0, 0, 0.8);
            legs.push({ leg, sz, baseRotY: leg.rotation.y });
          }
          g.userData = { legs, claws };
          return g;
        }
        let crab = null;
        {
          const cx = X0 + 102, cz = Z0 + 196;
          const gi = Math.round(x2gi(cx)), gj = Math.round(z2gj(cz));
          const surf = Math.round((gj < DAM_J ? RES : DOWN) * S);
          const dd = riverDist(gi, gj), hh = Math.max(1, riverHalf(gj)), tt = Math.min(1, dd / hh);
          let bed = Math.round(surf - (1 + 2.6 * (1 - tt * tt)) + Math.sin(gi * 0.5) * Math.sin(gj * 0.4 + 1.1) * 0.8);
          bed = Math.max(0, Math.min(surf - 1, bed));
          const cy = bed * BLOCK;
          const m = createCrab();
          m.position.set(cx, cy, cz);
          m.scale.setScalar(1.2);
          m.name = 'Chú cua (Crab)';
          scene.add(m);
          crab = { g: m, legs: m.userData.legs, claws: m.userData.claws, x: cx, z: cz, y: cy, baseX: cx, baseZ: cz, ang: 0, targetAng: 0, state: 'walk', tmr: 5.0 };
          // ---- lời chào của cua: text nổi trên đầu ----
          const cbc = document.createElement('canvas'); cbc.width = 256; cbc.height = 64;
          const cbx = cbc.getContext('2d');
          cbx.font = '28px Outfit, sans-serif'; cbx.textAlign = 'center'; cbx.textBaseline = 'middle';
          cbx.shadowColor = 'rgba(20,28,36,0.7)'; cbx.shadowBlur = 4;
          cbx.fillStyle = '#ffe9b8'; cbx.fillText('^^! hello world', 128, 32);
          const crabSay = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cbc), transparent: true, depthWrite: false, depthTest: false }));   // depthTest false → không bị mặt nước che
          crabSay.scale.set(2.6, 0.65, 1); crabSay.position.set(0, 0.85, 0);
          m.add(crabSay);
        }

        // ---- 1 chú thỏ random-walk ở tọa độ góc (31, _, 110) ----
        const bunnies = [];
        const digMarks = [];   // dấu vết ụ đất vĩnh viễn thỏ để lại: tối đa 10 hố, tự mờ sau 20 phút
        let _digTick = -1;     // throttle kiểm tra fade ~1 lần/giây
        const digMarkGeo = new THREE.SphereGeometry(0.18, 8, 6);
        extraGeometries.add(digMarkGeo);
        const dropDigMark = (e) => { scene.remove(e.m); e.m.material.dispose(); };
        const bunOK = (x, z) => { const gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z)); return gi > 2 && gi < GX - 2 && gj > 2 && gj < GZ - 2 && !isWater(gi, gj) && padH(gi, gj) === null; };
        function bunny() {
          const g = new THREE.Group();
          const body = new THREE.Mesh(new THREE.SphereGeometry(0.34, 14, 12), cowWhite); body.scale.set(1.25, 0.95, 0.95); body.position.y = 0.42; body.castShadow = true; g.add(body);
          const rump = new THREE.Mesh(new THREE.SphereGeometry(0.3, 12, 12), cowWhite); rump.position.set(-0.28, 0.46, 0); rump.castShadow = true; g.add(rump);
          const head = new THREE.Group(); head.position.set(0.4, 0.62, 0); g.add(head);
          const hd = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 12), cowWhite); hd.castShadow = true; head.add(hd);
          const sn = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), cowWhite); sn.position.set(0.2, -0.04, 0); head.add(sn);
          const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), cowPink); nose.position.set(0.3, -0.02, 0); head.add(nose);
          for (const e of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), cowDark); eye.position.set(0.14, 0.06, e * 0.13); head.add(eye); }
          const ears = [];
          for (const e of [-1, 1]) {
            const ear = new THREE.Group(); ear.position.set(-0.02, 0.18, e * 0.1); head.add(ear);
            const outer = bx(0.12, 0.46, 0.06, cowWhite, true, false); outer.position.y = 0.23; ear.add(outer);
            const inner = bx(0.07, 0.34, 0.04, cowPink, false, false); inner.position.set(0, 0.22, 0.04); ear.add(inner);
            ears.push(ear);
          }
          // chân sau: đùi tròn + bàn chân TO duỗi về trước (đặc trưng thỏ) — thay 4 chân hộp giống nhau
          for (const e of [-1, 1]) {
            const thigh = new THREE.Mesh(new THREE.SphereGeometry(0.17, 10, 10), cowWhite); thigh.position.set(-0.26, 0.28, e * 0.2); thigh.castShadow = true; g.add(thigh);
            const foot = bx(0.3, 0.09, 0.13, cowWhite, true, false); foot.position.set(-0.16, 0.05, e * 0.2); g.add(foot);
          }
          // 2 tay trước có KHỚP VAI (group pivot) để hoạt cảnh cào đất
          const paws = [];
          for (const e of [-1, 1]) {
            const paw = new THREE.Group(); paw.position.set(0.28, 0.36, e * 0.16); g.add(paw);
            const seg = bx(0.09, 0.28, 0.09, cowWhite, true, false); seg.position.y = -0.12; paw.add(seg);
            paws.push(paw);
          }
          const tail = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), cowWhite); tail.position.set(-0.5, 0.5, 0); tail.castShadow = true; g.add(tail);
          // cà rốt + ụ đất (ẩn sẵn) ngay trước mũi — hiện ra khi đào
          const carrot = new THREE.Group(); carrot.position.set(0.62, -0.1, 0); carrot.visible = false; g.add(carrot);
          const crBody = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.32, 7), bunnyCarrotMat); crBody.rotation.x = Math.PI; crBody.position.y = 0.16; crBody.castShadow = true; carrot.add(crBody);
          for (let i = 0; i < 3; i++) { const lf = bx(0.045, 0.16, 0.045, bunnyLeafMat, false, false); lf.position.y = 0.38; lf.rotation.z = (i - 1) * 0.5; lf.rotation.y = i * 2.1; carrot.add(lf); }
          const mound = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), bunnyMoundMat); mound.scale.y = 0.32; mound.position.set(0.62, 0.02, 0); mound.visible = false; g.add(mound);
          g.userData.ears = ears; g.userData.head = head; g.userData.paws = paws; g.userData.carrot = carrot; g.userData.mound = mound; return g;
        }
        const bunnyCarrotMat = new THREE.MeshLambertMaterial({ color: 0xe8762c }), bunnyLeafMat = new THREE.MeshLambertMaterial({ color: 0x4f8a3d }), bunnyMoundMat = new THREE.MeshLambertMaterial({ color: 0x6e5744 });
        (function () {
          const bx0 = X0 + 31, bz0 = Z0 + 110, g = bunny();
          g.scale.setScalar(0.8 * 0.8 * NATURE_SCALE); // nhỏ đi thêm 20%
          g.position.set(bx0, cowY(bx0, bz0), bz0); g.rotation.y = Math.random() * 6.28; scene.add(g);
          bunnies.push({ g, ears: g.userData.ears, head: g.userData.head, paws: g.userData.paws, carrot: g.userData.carrot, mound: g.userData.mound, x: bx0, z: bz0, ang: Math.random() * 6.28, spd: 2.4, state: 'sniff', tmr: 1 + Math.random() * 2, ph: Math.random() * 6, hop: 0, digTmr: 60 });
        })();

