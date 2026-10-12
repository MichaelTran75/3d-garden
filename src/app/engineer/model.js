        function engineer() {
          const g = new THREE.Group();
          const P = (par, w, h, d, mat, x, y, z, o) => { const m = bx(w, h, d, mat, true, o !== false, lineDark); m.position.set(x, y, z); par.add(m); return m; };
          const refl = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 });
          // ---- THÂN: áo gilê phản quang ghép nhiều khối ----
          P(g, 0.5, 0.4, 0.32, hiVis, 0, 1.66, 0);                  // ngực
          P(g, 0.46, 0.34, 0.3, hiVis, 0, 1.34, 0);                 // bụng
          P(g, 0.52, 0.05, 0.33, refl, 0, 1.57, 0, false);           // dải phản quang ngang trên
          P(g, 0.52, 0.05, 0.33, refl, 0, 1.43, 0, false);           // dải ngang dưới
          for (const sx of [-1, 1]) P(g, 0.05, 0.42, 0.33, refl, sx * 0.17, 1.62, 0, false);  // dải dọc ngực
          P(g, 0.2, 0.18, 0.2, engSkin, 0, 1.92, 0, false);          // cổ
          P(g, 0.48, 0.16, 0.34, engBoot, 0, 1.14, 0, false);        // đai dụng cụ
          P(g, 0.12, 0.16, 0.1, metalMat, 0.22, 1.08, 0.16, false);  // túi đồ nghề
          const hips = bx(0.46, 0.2, 0.3, engPants, true, true, lineDark); hips.position.y = 1.18; g.add(hips);
          // ---- ĐẦU: mũ bảo hộ + ốp tai chống ồn ----
          const headG = new THREE.Group(); headG.position.y = 2.06; g.add(headG);
          const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), engSkin); head.castShadow = true; headG.add(head);
          const helmet = new THREE.Group(); helmet.name = 'Mũ bảo hộ'; headG.add(helmet);   // tháo ra khi tắm, khi ngủ
          const hat = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 8, 0, 6.3, 0, 1.5), engHelm); hat.castShadow = true; hat.position.y = 0.06; helmet.add(hat);
          P(helmet, 0.06, 0.08, 0.44, engHelm, 0, 0.18, 0, false);     // gờ mũ dọc (phía trên đầu) chạy từ trước ra sau
          for (const sx of [-1, 1]) P(helmet, 0.07, 0.12, 0.13, engPad, sx * 0.2, -0.02, 0, false);  // ốp tai
          const hair = new THREE.Mesh(new THREE.SphereGeometry(0.212, 12, 8, 0, Math.PI * 2, 0, 1.2), new THREE.MeshLambertMaterial({ color: 0x3a2a1f }));   // tóc ngắn, chỉ thấy khi bỏ mũ
          hair.rotation.x = -0.35; hair.position.set(0, 0.012, -0.012); hair.visible = false; headG.add(hair);
          for (const sx of [-1, 1]) { const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 6, 6), engBoot); eye.position.set(sx * 0.07, 0.02, 0.185); headG.add(eye); }
          // ---- TAY: cánh tay trên + cuff + cẳng tay + găng ----
          const arms = [];
          for (const s of [-1, 1]) {
            const piv = new THREE.Group(); piv.position.set(s * 0.34, 1.86, 0); g.add(piv);
            P(piv, 0.15, 0.34, 0.17, hiVis, 0, -0.18, 0);            // cánh tay trên
            P(piv, 0.16, 0.05, 0.18, refl, 0, -0.35, 0, false);       // cuff phản quang
            P(piv, 0.13, 0.3, 0.15, hiVis, 0, -0.5, 0, false);        // cẳng tay
            const glove = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), engBoot); glove.position.y = -0.66; piv.add(glove);
            arms.push(piv);
          }
          const clip = bx(0.28, 0.36, 0.04, engPad, true, true, lineDark); clip.position.set(0, -0.58, 0.16); arms[1].add(clip);
          P(arms[1], 0.2, 0.05, 0.05, metalMat, 0, -0.44, 0.18, false);  // kẹp clipboard
          // ---- CHÂN: đùi + ống quyển + giày bảo hộ ----
          const legs = [], knees = [], ankles = [];
          for (const s of [-1, 1]) {
            const piv = new THREE.Group(); piv.position.set(s * 0.15, 1.18, 0); g.add(piv);
            P(piv, 0.19, 0.42, 0.2, engPants, 0, -0.22, 0);          // đùi
            const knee = new THREE.Group(); knee.position.set(0, -0.42, 0); piv.add(knee);   // KHỚP GỐI — cẳng chân gập độc lập với đùi
            P(knee, 0.17, 0.36, 0.18, engPants, 0, -0.18, 0, false);    // ống quyển
            const ankle = new THREE.Group(); ankle.position.set(0, -0.36, 0); knee.add(ankle);   // KHỚP CỔ CHÂN — IK giữ đế giày phẳng trên mặt đất
            P(ankle, 0.19, 0.12, 0.22, engBoot, 0, 0.02, 0.02, false); // cổ giày
            P(ankle, 0.2, 0.14, 0.34, engBoot, 0, -0.03, 0.08);        // bàn giày
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
          chip.scale.z = 0.75; chip.position.set(0, -0.76, 0.07); chip.rotation.x = 0.4; chip.visible = false; arms[1].add(chip);
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
          g.userData = { legs, knees, ankles, arms, head: headG, helmet, hair, towel, rodGrp, rodTilt, rodTip, rod, clip, props: { spoon, bottle, cup, book, bookLeaf, chip, chopsticks, knife, spatula, handBowl, handPan } }; g.scale.setScalar(ENGINEER_BASE_SCALE * CAMP_SCALE); return g;
        }
