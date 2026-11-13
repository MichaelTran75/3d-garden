        // ---- CHÓ — mô hình khớp thật (toạ độ cục bộ: +x mũi, +y lên, ±z hai bên):
        //      thân = khung ngực + hông trên khớp THÂN (cao, chúc/ngóc quanh trục ngang) · CỔ (ngẩng/cúi, quay) → đầu, mõm, mũi, mắt, 2 TAI cụp (lò xo) ·
        //      4 chân 2 đoạn (vai/hông → khuỷu/gối → bàn chân): chân trước khớp gập chĩa RA SAU (khuỷu), chân sau chĩa RA TRƯỚC (gối) như chó thật;
        //      bàn chân giữ phẳng. Toàn bộ dáng (đứng · ngồi · nằm sấp · cúi chào vươn vai · đánh hơi) do animals/dog/brain.js đặt bằng IK bàn chân ----
        function dogModel(s) {
          const g = new THREE.Group();
          const fur = new THREE.MeshLambertMaterial({ color: 0xc19a6b }), furL = new THREE.MeshLambertMaterial({ color: 0xe0c49a }), dark = new THREE.MeshLambertMaterial({ color: 0x4a3621 }), black = new THREE.MeshLambertMaterial({ color: 0x111111 });
          const torso = new THREE.Group(); torso.position.y = 0.32 * s; g.add(torso);
          const chest = bx(0.27 * s, 0.22 * s, 0.25 * s, fur, true, true, lineDark); chest.position.x = 0.1 * s; torso.add(chest);
          const rear = bx(0.29 * s, 0.2 * s, 0.23 * s, fur, true, true, lineDark); rear.position.set(-0.14 * s, 0.005 * s, 0); torso.add(rear);
          const belly = bx(0.4 * s, 0.04 * s, 0.18 * s, furL, false, false); belly.position.set(-0.01 * s, -0.1 * s, 0); torso.add(belly);
          const neck = new THREE.Group(); neck.position.set(0.21 * s, 0.07 * s, 0); torso.add(neck);
          const neckM = bx(0.12 * s, 0.15 * s, 0.13 * s, fur, true, false); neckM.position.set(0.03 * s, 0.05 * s, 0); neckM.rotation.z = -0.35; neck.add(neckM);
          const head = new THREE.Group(); head.position.set(0.08 * s, 0.13 * s, 0); neck.add(head);
          const skull = bx(0.2 * s, 0.19 * s, 0.2 * s, fur, true, true, lineDark); head.add(skull);
          const snout = bx(0.13 * s, 0.1 * s, 0.12 * s, furL, true, true, lineDark); snout.position.set(0.15 * s, -0.04 * s, 0); head.add(snout);
          const nose = bx(0.04 * s, 0.04 * s, 0.05 * s, black, false, false); nose.position.set(0.22 * s, -0.02 * s, 0); head.add(nose);
          const eyes = [];   // mắt: scale.y = độ mở (chớp, nhắm khi ngủ — animals/dog/brain.js)
          for (const sz of [-1, 1]) { const eye = bx(0.015 * s, 0.03 * s, 0.03 * s, black, false, false); eye.position.set(0.1 * s, 0.03 * s, sz * 0.055 * s); head.add(eye); eyes.push(eye); }
          const tongue = bx(0.06 * s, 0.012 * s, 0.045 * s, new THREE.MeshLambertMaterial({ color: 0xd9788a }), false, false); tongue.position.set(0.2 * s, -0.085 * s, 0); tongue.visible = false; head.add(tongue);   // lưỡi: liếm mép
          const ears = [];
          for (const sz of [-1, 1]) { const ep = new THREE.Group(); ep.position.set(-0.02 * s, 0.09 * s, sz * 0.1 * s); head.add(ep); const ear = bx(0.07 * s, 0.14 * s, 0.035 * s, dark, true, false); ear.position.y = -0.06 * s; ep.add(ear); ears.push(ep); }
          const legs = [];   // thứ tự: trước-trái, trước-phải, sau-trái, sau-phải (trái = +z)
          for (const [fx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
            const hip = new THREE.Group(); hip.position.set(fx > 0 ? 0.17 * s : -0.2 * s, -0.08 * s, sz * 0.09 * s); torso.add(hip);
            const up = bx(0.075 * s, 0.13 * s, 0.075 * s, fur, true, false); up.position.y = -0.06 * s; hip.add(up);
            const knee = new THREE.Group(); knee.position.y = -0.12 * s; hip.add(knee);
            const lo = bx(0.06 * s, 0.11 * s, 0.06 * s, fur, true, false); lo.position.y = -0.05 * s; knee.add(lo);
            const pawG = new THREE.Group(); pawG.position.y = -0.105 * s; knee.add(pawG);
            const paw = bx(0.09 * s, 0.035 * s, 0.07 * s, furL, true, false); paw.position.x = 0.015 * s; pawG.add(paw);
            legs.push({ hip, knee, paw: pawG, front: fx > 0, side: sz });
          }
          const tail = bx(0.18 * s, 0.06 * s, 0.06 * s, dark, true, false); tail.position.set(-0.3 * s, 0.08 * s, 0); tail.visible = false; torso.add(tail);   // giữ "lệnh vẫy" (rotation.y) cho đuôi mềm đọc
          g.userData = { torso, neck, head, ears, eyes, tongue, legs, tail, body: chest, s, L1: 0.12 * s, L2: 0.1225 * s, H0: 0.32 * s };
          return g;
        }
        const dogObj = dogModel(1.1); dogObj.scale.multiplyScalar(CAMP_SCALE * 1.1); dogObj.name = 'Chó (Dog)';
        const dogP = worldCell(FIRE_CELL[0], FIRE_CELL[1]).add(new THREE.Vector3(0.9, 0, 0.3));
        dogObj.position.copy(dogP); dogObj.rotation.y = Math.atan2(-0.3, -0.9); scene.add(dogObj);
        const dogTail = makeSoftTail(dogObj.userData.torso, { base: new THREE.Vector3(-0.28 * 1.1, 0.07 * 1.1, 0), dir: new THREE.Vector3(-Math.cos(0.5), Math.sin(0.5), 0), n: 4, len: 0.055 * 1.1, w: 0.06 * 1.1, mat: dogObj.userData.tail.material, stiff: [0.22, 0.07] });
        let dogCol = null;   // VA CHẠM (core/collide.js, worldJoin('collide')): thân của chó — men theo vật cản (colSlide), xuyên tạm khi kẹt (ghost)
        worldJoin('collide', 30, C => {
          // dấu chân với VẬT: 4 hình tròn bán kính 17 cm từ hông (−0,34) tới mũi (+0,59) — đo trên lưới thật ở mọi dáng (đứng, đánh hơi, uống, theo chủ);
          // a / b / ox (hộp thân) chỉ còn dùng cho né CON KHÁC (colMoverHits). Đuôi mềm không tính.
          // noGo: lòng bếp lửa — tâm các hình tròn thân phải cách tâm lửa ≥ FIRE_AVOID_R (= vòng chân giá treo nồi + nửa thân)
          { const D = C.dims(dogObj.userData.torso), S = dogObj.scale.x;
            dogCol = C.mover({ kind: 'dog', a: D.a + 0.12, b: D.b, ox: D.ox, caps: [-0.172, 0.172, 0.05, 0.172, 0.242, 0.172, 0.424, 0.172].map(q => q * S), lo: 0.12, hi: Math.max(0.68, D.top), noGo: [{ x: pf.x, z: pf.z, r: FIRE_AVOID_R }], w: 1, x: () => dogObj.position.x, z: () => dogObj.position.z, ang: () => -dogObj.rotation.y, on: () => !dogRain.st,
            ignore: o => o.kind === 'eng' && !!worldSee('engineer')?.withDog }); }
          C.mesh(dogObj, dogCol, () => [dogObj.position.x, dogObj.position.z], (x, z) => { dogObj.position.x = x; dogObj.position.z = z; });
          C.moving(() => [dogObj]);
        });
        worldJoin('drawBatch', 10, B => B.draws('Chó', [dogObj]));   // gộp lượt vẽ (core/draw-batch.js)
