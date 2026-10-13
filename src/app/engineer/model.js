        // ---- MŨ BẢO HỘ kiểu LEGO (gốc ở tâm đầu): vỏ vòm + vành quanh + lưỡi trai trước + gờ dọc đỉnh + 2 ốp tai chống ồn ----
        function legoHelmet(shellM, padM) {
          const h = new THREE.Group();
          const dome = new THREE.Mesh(new THREE.SphereGeometry(0.235, 20, 10, 0, Math.PI * 2, 0, 1.5), shellM); dome.position.y = 0.1; dome.castShadow = true; h.add(dome);
          const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.262, 0.262, 0.024, 28), shellM); brim.position.y = 0.105; h.add(brim);
          const visor = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.022, 0.12), shellM); visor.position.set(0, 0.098, 0.25); visor.rotation.x = 0.12; h.add(visor);
          const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.42), shellM); ridge.position.y = 0.318; h.add(ridge);
          for (const sx of [-1, 1]) { const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 14), padM); pad.rotation.z = Math.PI / 2; pad.position.set(sx * 0.215, 0.0, 0); h.add(pad); }
          return h;
        }
        const ENG_ARM_L1 = 0.28, ENG_ARM_L2 = 0.40;   // cánh tay trên · cẳng tay tới tâm bàn tay (đv cục bộ kỹ sư)
        function engineer() {
          const g = new THREE.Group();
          const P = (par, w, h, d, mat, x, y, z, o) => { const m = bx(w, h, d, mat, true, o !== false, lineDark); m.position.set(x, y, z); par.add(m); return m; };
          // ==== KIỂU NHÂN VẬT LEGO (minifigure): đầu trụ có núm, in mặt cười · mũ bảo hộ trắng có vành (kỹ sư/giám sát công trường đội mũ trắng) ·
          //      thân hình thang in áo gilê cam phản quang · hông khối · chân khối liền, bàn chân nhô trước · tay tròn thuôn, bàn tay chữ C · nhựa bóng.
          //      Vị trí khớp giữ như cũ (hông y 1,18 · gối −0,42 · cổ chân −0,36 · vai ±0,34/1,86 · đầu 2,06 · đế giày 0,30) ⇒ tư thế, IK, ngồi ghế, đồ cầm tay không đổi ====
          const plastic = (color, o = {}) => new THREE.MeshPhongMaterial({ color, shininess: 70, specular: 0x2a2a2a, ...o });
          const legoYellow = plastic(LEGO_YELLOW), vestM = plastic(0xf08c00), pantsM = plastic(0x3a4a63), bootM = plastic(0x2a2622), beltM = plastic(0x34302c);
          const canvasTex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d')); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
          // ---- THÂN hình thang (đáy 0,54 · vai 0,42 · cao 0,62 · dày 0,3), mặt trước/sau in áo gilê ----
          const vestPrint = front => canvasTex(256, 256, x => {
            x.fillStyle = '#f08c00'; x.fillRect(0, 0, 256, 256);
            const refl = (rx, ry, w, h) => { x.fillStyle = '#c9ced2'; x.fillRect(rx, ry, w, h); x.fillStyle = 'rgba(255,255,255,0.55)'; x.fillRect(rx + 2, ry + 2, w - 4, Math.max(2, h * 0.25)); };
            if (front) {
              x.fillStyle = '#9cc3e6'; x.beginPath(); x.moveTo(84, 0); x.lineTo(128, 70); x.lineTo(172, 0); x.fill();   // cổ áo sơ mi xanh nhạt chữ V
              x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(84, 0); x.lineTo(110, 34); x.lineTo(104, 0); x.fill(); x.beginPath(); x.moveTo(172, 0); x.lineTo(146, 34); x.lineTo(152, 0); x.fill();
              x.strokeStyle = '#5a3d1e'; x.lineWidth = 4; x.beginPath(); x.moveTo(128, 70); x.lineTo(128, 256); x.stroke();   // khoá kéo
              refl(58, 0, 22, 256); refl(176, 0, 22, 256); refl(0, 172, 256, 22);   // 2 dải dọc + 1 dải ngang phản quang
              x.fillStyle = '#d97a00'; x.fillRect(146, 98, 28, 32); x.fillStyle = '#2f5d7c'; x.fillRect(165, 86, 5, 22);   // túi ngực + bút
              x.fillStyle = '#ffffff'; x.font = 'bold 20px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('GHC', 104, 120);
            } else {
              refl(58, 0, 22, 256); refl(176, 0, 22, 256); refl(0, 150, 256, 22);
              x.fillStyle = '#ffffff'; x.font = 'bold 36px Arial, sans-serif'; x.textAlign = 'center'; x.fillText('GHC', 128, 100);
            }
          });
          const torsoGeo = new THREE.BoxGeometry(0.54, 0.62, 0.3), tp = torsoGeo.attributes.position;
          for (let i = 0; i < tp.count; i++) if (tp.getY(i) > 0) tp.setX(i, tp.getX(i) * 0.42 / 0.54);   // vai hẹp hơn hông
          torsoGeo.computeVertexNormals();
          const torso = new THREE.Mesh(torsoGeo, [vestM, vestM, vestM, vestM, plastic(0xffffff, { map: vestPrint(true) }), plastic(0xffffff, { map: vestPrint(false) })]);
          torso.position.y = 1.55; torso.castShadow = true; torso.name = 'Thân (áo gilê)'; edge(torso, torsoGeo, lineDark); g.add(torso);
          const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.05, 14), legoYellow); neck.position.y = 1.875; g.add(neck);
          P(g, 0.55, 0.05, 0.31, beltM, 0, 1.255, 0, false);                                    // thắt lưng
          P(g, 0.07, 0.04, 0.02, metalMat, 0, 1.255, 0.16, false);                               // khoá thắt lưng
          P(g, 0.12, 0.15, 0.1, metalMat, 0.22, 1.17, 0.16, false);                              // túi đồ nghề
          const hips = new THREE.Mesh(new THREE.BoxGeometry(0.54, 0.16, 0.27), pantsM); hips.position.y = 1.18; hips.castShadow = true; edge(hips, hips.geometry, lineDark); g.add(hips);   // khối hông
          // ---- ĐẦU trụ bo cạnh (r 0,2 · cao 0,34) + núm, mặt in canvas (giữa mặt ở +z) ----
          const headG = new THREE.Group(); headG.position.y = 2.06; g.add(headG);
          const face = canvasTex(512, 128, x => {
            x.fillStyle = '#' + new THREE.Color(LEGO_YELLOW).getHexString(); x.fillRect(0, 0, 512, 128);
            x.fillStyle = '#1b1b1b'; for (const ex of [228, 284]) { x.beginPath(); x.ellipse(ex, 60, 7, 9, 0, 0, Math.PI * 2); x.fill(); }
            x.fillStyle = '#ffffff'; for (const ex of [230, 286]) { x.beginPath(); x.arc(ex, 56, 2.4, 0, Math.PI * 2); x.fill(); }
            x.strokeStyle = '#3a2a1f'; x.lineWidth = 4; x.lineCap = 'round'; for (const ex of [228, 284]) { x.beginPath(); x.moveTo(ex - 10, 40); x.quadraticCurveTo(ex, 34, ex + 10, 39); x.stroke(); }
            x.strokeStyle = '#1b1b1b'; x.beginPath(); x.ellipse(256, 74, 24, 18, 0, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();   // miệng cười
          });
          const head = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.26, 28, 1, true, Math.PI), plastic(0xffffff, { map: face })); head.castShadow = true; headG.add(head);
          const capGeo = new THREE.LatheGeometry([[0.2, 0], [0.196, 0.022], [0.182, 0.036], [0, 0.04]].map(([r, y]) => new THREE.Vector2(r, y)), 28);
          const capTop = new THREE.Mesh(capGeo, legoYellow); capTop.position.y = 0.13; headG.add(capTop);
          const capBot = new THREE.Mesh(capGeo, legoYellow); capBot.rotation.x = Math.PI; capBot.position.y = -0.13; headG.add(capBot);
          const stud = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.095, 0.06, 16), legoYellow); stud.position.y = 0.2; headG.add(stud);
          const helmet = legoHelmet(plastic(0xf4f2ec), plastic(0x5b6168)); helmet.name = 'Mũ bảo hộ'; headG.add(helmet);   // tháo ra khi tắm, khi ngủ
          const hairM = plastic(0x4a3423, { side: THREE.DoubleSide }), hair = new THREE.Group(); hair.name = 'Tóc'; hair.visible = false; headG.add(hair);   // tóc rời kiểu LEGO, chỉ thấy khi bỏ mũ
          const hairTop = new THREE.Mesh(new THREE.SphereGeometry(0.232, 18, 10, 0, Math.PI * 2, 0, 1.38), hairM); hairTop.position.y = 0.04; hair.add(hairTop);   // trùm kín núm đầu
          const hairBack = new THREE.Mesh(new THREE.CylinderGeometry(0.226, 0.226, 0.2, 18, 1, true, Math.PI / 2, Math.PI), hairM); hairBack.position.y = -0.01; hair.add(hairBack);
          // ---- TAY 3 KHỚP (G 13/10: "có khuỷu tay"): VAI (cầu) → cánh tay trên 0,28 → KHUỶU (cầu) → cẳng tay 0,40 tới tâm bàn tay → CỔ TAY.
          //      Tỉ lệ người thật: cánh tay trên ≈ 0,186·H, cẳng tay ≈ 0,146·H, nửa bàn tay ≈ 0,054·H (bảng nhân trắc Drillis–Contini / Winter) ⇒ trên : dưới ≈ 0,28 : 0,40.
          //      Tổng 0,68 > tầm với cũ 0,66 ⇒ tay buông vẫn hơi gập (~28°) như người thả lỏng. Mọi pha vẫn ghi "góc vai" của tay thẳng như trước;
          //      engArmPost (lớp tư thế) giải IK để bàn tay tới đúng chỗ đó, khuỷu luôn gập về trước, cổ tay bù để đồ cầm tay giữ hướng ----
          const handGeo = new THREE.TorusGeometry(0.068, 0.034, 8, 16, 1.62 * Math.PI); handGeo.rotateZ(-2.2); handGeo.rotateY(Math.PI / 2);   // miệng chữ C quay ra trước, hơi chúc
          const arms = [], elbows = [], wrists = [], armCore = [];
          for (const s of [-1, 1]) {
            const piv = new THREE.Group(); piv.position.set(s * 0.34, 1.86, 0); g.add(piv);
            const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.085, 12, 8), vestM); shoulder.position.y = -0.04; piv.add(shoulder);
            const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.078, 0.073, 0.26, 12), vestM); upper.position.y = -0.15; upper.castShadow = true; piv.add(upper);
            const elbow = new THREE.Group(); elbow.position.y = -ENG_ARM_L1; piv.add(elbow);   // KHỚP KHUỶU — gập quanh trục ngang (chỉ gập về trước)
            const eJoint = new THREE.Mesh(new THREE.SphereGeometry(0.074, 12, 8), vestM); elbow.add(eJoint);
            const fore = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.066, 0.28, 12), vestM); fore.position.y = -0.14; fore.castShadow = true; elbow.add(fore);
            const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.071, 0.069, 0.04, 12), plastic(0xd8dcdf)); cuff.position.y = -0.21; elbow.add(cuff);   // dải phản quang cổ tay áo
            const wrist = new THREE.Group(); wrist.position.y = -ENG_ARM_L2; elbow.add(wrist);   // KHỚP CỔ TAY (gốc = tâm bàn tay) — mọi đồ cầm tay gắn ở đây
            const wCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.07, 10), legoYellow); wCyl.position.y = 0.09; wrist.add(wCyl);
            const hand = new THREE.Mesh(handGeo, legoYellow); hand.castShadow = true; wrist.add(hand);
            arms.push(piv); elbows.push(elbow); wrists.push(wrist); armCore.push(new Set([shoulder, upper, elbow]));
          }
          const clip = bx(0.28, 0.36, 0.04, engPad, true, true, lineDark); clip.position.set(0, -0.58, 0.16); arms[1].add(clip);
          P(clip, 0.2, 0.05, 0.05, metalMat, 0, 0.14, 0.02, false);  // kẹp clipboard (con của bảng ⇒ ẩn cùng bảng, trước đây treo lơ lửng khi cất bảng)
          // ---- CHÂN khối liền (rộng 0,26 · dày 0,27, khe giữa 2 chân 4 cm), gối gập được để ngồi ghế; bàn chân nhô ra trước ----
          const legs = [], knees = [], ankles = [];
          const thighGeo = new THREE.BoxGeometry(0.26, 0.44, 0.27), shinGeo = new THREE.BoxGeometry(0.26, 0.34, 0.27), footGeo = new THREE.BoxGeometry(0.26, 0.13, 0.36);
          for (const s of [-1, 1]) {
            const piv = new THREE.Group(); piv.position.set(s * 0.15, 1.18, 0); g.add(piv);
            const thigh = new THREE.Mesh(thighGeo, pantsM); thigh.position.y = -0.21; thigh.castShadow = true; edge(thigh, thighGeo, lineDark); piv.add(thigh);
            const knee = new THREE.Group(); knee.position.set(0, -0.42, 0); piv.add(knee);   // KHỚP GỐI — cẳng chân gập độc lập với đùi
            const shin = new THREE.Mesh(shinGeo, pantsM); shin.position.y = -0.17; shin.castShadow = true; edge(shin, shinGeo, lineDark); knee.add(shin);
            const ankle = new THREE.Group(); ankle.position.set(0, -0.36, 0); knee.add(ankle);   // KHỚP CỔ CHÂN — IK giữ đế giày phẳng trên mặt đất
            const foot = new THREE.Mesh(footGeo, bootM); foot.position.set(0, -0.035, 0.045); foot.castShadow = true; edge(foot, footGeo, lineDark); ankle.add(foot);   // đế ở −0,1 như cũ
            legs.push(piv); knees.push(knee); ankles.push(ankle);
          }
          // cần câu gắn ở tay trái (arms[1]), ẩn cho tới khi ngồi câu, định vị khớp tay cầm
          const rodGrp = new THREE.Group(); rodGrp.position.set(0, -0.66, 0.02); rodGrp.rotation.order = 'YXZ'; rodGrp.rotation.x = 1.02;   // YXZ: xoay ngang cần quanh trục cẳng tay (sấp/ngửa cổ tay)
          rodGrp.visible = false; arms[1].add(rodGrp);
          const rodTilt = new THREE.Group(); rodTilt.rotation.x = 0.95; rodGrp.add(rodTilt);
          const rod = fishingRod({ flex: true }); rodTilt.add(rod); const rodTip = rod.userData.tip;   // tay nắm ống gắn máy, chuôi sau tì dưới cẳng tay; máy câu + khoen quay xuống dưới
          // đạo cụ cầm tay (ẩn sẵn): thìa khi ăn · chai nước khi uống · cốc trà khi nhấp trà
          const spoon = new THREE.Group(); spoon.position.set(0, -0.7, 0.04); spoon.visible = false; arms[0].add(spoon);
          P(spoon, 0.03, 0.025, 0.24, metalMat, 0, 0, 0.1, false);
          const spoonBowl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), metalMat); spoonBowl.scale.set(1, 0.4, 1.3); spoonBowl.position.set(0, 0.01, 0.24); spoon.add(spoonBowl);
          const bottle = new THREE.Group(); bottle.position.set(0, -0.6, 0.13); bottle.visible = false; arms[0].add(bottle);   // thân chai song song cẳng tay, nắp quay về phía mặt
          const bottleBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.3, 10), new THREE.MeshLambertMaterial({ color: 0x8cc4e0, transparent: true, opacity: 0.8 })); bottle.add(bottleBody);
          const bottleCap = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.05, 8), new THREE.MeshLambertMaterial({ color: 0x2f5f8f })); bottleCap.position.y = 0.17; bottle.add(bottleCap);
          const cup = new THREE.Group(); cup.position.set(0, -0.74, 0.08); cup.visible = false; arms[1].add(cup);
          const cupBody = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.055, 0.11, 10), new THREE.MeshLambertMaterial({ color: 0xe8e4da })); cup.add(cupBody);
          const cupHandle = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 4, 8, Math.PI), new THREE.MeshLambertMaterial({ color: 0xe8e4da })); cupHandle.position.x = 0.07; cupHandle.rotation.z = -Math.PI / 2; cup.add(cupHandle);
          // sách bìa xanh (tay phải) mở hình chữ V, gáy dọc; giơ tay ~75° thì mặt trang quay về phía mắt · trang đang lật quay quanh gáy
          const book = new THREE.Group(); book.position.set(0, -0.74, 0.1); book.rotation.x = 0.6; book.visible = false; arms[0].add(book);
          const bookCover = new THREE.MeshLambertMaterial({ color: 0x2f5d7c }), bookPage = new THREE.MeshLambertMaterial({ color: 0xf3eedf });
          for (const s of [-1, 1]) {
            const half = new THREE.Group(); half.rotation.z = s * 0.22; book.add(half);
            const cover = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.24), bookCover); cover.position.set(s * 0.08, -0.006, 0); half.add(cover);
            const pages = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.022, 0.225), bookPage); pages.position.set(s * 0.077, 0.011, 0); half.add(pages);
          }
          const bookLeaf = new THREE.Group(); bookLeaf.visible = false; book.add(bookLeaf);
          const leafM = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.22), new THREE.MeshLambertMaterial({ color: 0xfbf8ee, side: THREE.DoubleSide }));
          leafM.rotation.x = -Math.PI / 2; leafM.position.set(0.075, 0.023, 0); bookLeaf.add(leafM);
          // miếng khoai tây chiên kẹp giữa các ngón (tay trái, phía bàn trà) lúc bốc từ gói lên miệng
          const chip = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.008, 10), new THREE.MeshLambertMaterial({ color: 0xe8c25a }));
          chip.scale.z = 0.75; chip.position.set(0, -0.67, 0.11); chip.rotation.x = 0.4;   // kẹp ở đầu ngón, trước nắm tay chip.visible = false; arms[1].add(chip);
          // khăn tắm vắt qua gáy, 2 đầu buông trước ngực (sau khi tắm)
          const towel = new THREE.Group(); towel.name = 'Khăn vắt cổ'; towel.visible = false; g.add(towel);
          const towelMat = new THREE.MeshLambertMaterial({ color: 0xd98c6a });
          P(towel, 0.42, 0.05, 0.14, towelMat, 0, 1.9, -0.08, false);
          for (const sx of [-1, 1]) P(towel, 0.12, 0.4, 0.035, towelMat, sx * 0.13, 1.68, 0.176, false);
          // đồ bếp cầm tay: đũa · dao (thái hành) · xẻng xào ở tay phải; bát / chảo ở tay trái (mặt bát nằm ngang khi tay giơ ~52°)
          const kitchenWood = new THREE.MeshLambertMaterial({ color: 0xb98b55 }), kitchenSteel = new THREE.MeshLambertMaterial({ color: 0xc8ced2 });
          const chopsticks = new THREE.Group(); chopsticks.position.set(0, -0.72, 0.05); chopsticks.visible = false; arms[0].add(chopsticks);
          for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.014, 0.34), kitchenWood); st.position.set(s * 0.012, 0, 0.13); st.rotation.y = -s * 0.03; chopsticks.add(st); }
          const knife = new THREE.Group(); knife.position.set(0, -0.72, 0.05); knife.visible = false; arms[0].add(knife);
          const knifeGrip = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.035, 0.12), new THREE.MeshLambertMaterial({ color: 0x7a4a2a })); knifeGrip.position.z = 0.02; knife.add(knifeGrip);
          const knifeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.06, 0.2), kitchenSteel); knifeBlade.position.set(0, -0.012, 0.18); knife.add(knifeBlade);
          const spatula = new THREE.Group(); spatula.position.set(0, -0.72, 0.05); spatula.visible = false; arms[0].add(spatula);
          const spHandle = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.022, 0.26), kitchenWood); spHandle.position.z = 0.1; spatula.add(spHandle);
          const spBlade = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.008, 0.09), kitchenSteel); spBlade.position.set(0, -0.02, 0.26); spBlade.rotation.x = 0.35; spatula.add(spBlade);
          const handBowl = udonBowl(); handBowl.scale.setScalar(1 / ENGINEER_BASE_SCALE); handBowl.position.set(0, -0.74, 0.09); handBowl.rotation.x = 0.9; handBowl.visible = false; arms[1].add(handBowl);
          const handPan = fryPan(); handPan.scale.setScalar(1 / ENGINEER_BASE_SCALE); handPan.position.set(0, -0.8, 0.11); handPan.rotation.set(0.9, Math.PI / 2, 0); handPan.visible = false; arms[1].add(handPan);
          // đồ cầm tay ở trên đã đặt theo khung VAI kiểu tay thẳng cũ (tâm bàn tay y −0,66) → chuyển sang khung CỔ TAY (gốc = tâm bàn tay)
          for (let i = 0; i < 2; i++) for (const c of [...arms[i].children]) if (!armCore[i].has(c)) { arms[i].remove(c); c.position.y += 0.66; wrists[i].add(c); }
          // ---- EO (khớp thắt lưng, y 1,255): thân + đầu + 2 tay + khăn — vặn ngược nhịp hông khi đi, cúi / ngửa người khi với hái táo, nhặt đồ ----
          const spine = new THREE.Group(); spine.position.y = 1.255; spine.name = 'Eo'; g.add(spine);
          for (const o of [torso, neck, headG, towel, ...arms]) { g.remove(o); o.position.y -= 1.255; spine.add(o); }
          g.userData = { elbows, wrists, spine, legs, knees, ankles, arms, head: headG, helmet, hair, towel, rodGrp, rodTilt, rodTip, rod, clip, props: { spoon, bottle, cup, book, bookLeaf, chip, chopsticks, knife, spatula, handBowl, handPan } }; g.scale.setScalar(ENGINEER_BASE_SCALE * CAMP_SCALE); return g;
        }
