        // ===== KHU TRẠI RENDER THẬT — cùng hướng 5 bước của nội thất xe (docs/architecture/render.md mục "Khu trại render thật")
        //  · Bóng góc nướng sẵn theo cụm (core/ao-bake.js, gốc = scene, hộp thế giới = hộp bao các vật của cụm + 0,6 m), mặt đất là vật chắn ⇒ chân ghế, đáy lò,
        //    khúc củi dưới cùng tối dần sát đất; kẽ củi, gầm ghế, khe đá. Lần đầu nhìn cận (zoom ≥ ×8, tâm nhìn cách cụm < 14 đv) khi mẫu 3D đã tải.
        //  · Cùng lượt: BÓNG GÓC MẶT ĐẤT — độ che bầu trời tại từng ô đất 5 cm (tia 1 m, cùng lưới ô vật chắn) ⇒ 1 tấm phủ / cụm (dịch vụ groundContact.drape):
        //    tối đúng hình gầm bàn, gầm ghế, quanh đống củi, chân lò, vòng đá — thay cho tấm cắt lát (cách cũ phủ rộng, tối đều cả vùng, mất tương phản nắng).
        //    Thảm cỏ (nature/meadow.js — meadow.shade) trong vùng tối theo bóng tại gốc lá (không thì lá sáng nổi lên giữa vùng tối).
        //  · Vật hay bị mang đi (xô, cần câu, ấm, bình tưới, máy cắt cỏ, drone, que cời) nằm ngoài cụm: không chắn ai, không để lại bóng.
        //  · Bóng góc đúng ra chỉ chắn ÁNH TRỜI (ánh lửa trực tiếp thì không): ban đêm tấm phủ nhạt còn 40 % (ánh lửa trại, đèn lồng là chính), cụm lửa trại tắt hẳn; đá + củi lòng bếp,
        //    cọc đèn lồng không nhận bóng góc (màu đỉnh nhân cả ánh lửa / ánh đèn — tối hẳn đi). Lần thử đầu (05/11): tấm phủ đủ đậm ban đêm xoá quầng lửa quanh vòng đá.
        const CAMP_AO = [
          { key: 'trại: lò · củi · ghế · bàn · luống', at: ['Lò sưởi chiminea (Chiminea)', 'Đống củi (Woodpile)', 'Ghế cắm trại (Camp Chair)', 'Bàn trà (Camp Table)', 'Luống cà rốt'] },
          { key: 'trại: lửa trại', at: ['Bếp lửa trại (Campfire)', 'Giá treo nồi (Pot Hanger)'], night: 1 },   // đêm tắt hẳn tấm phủ: quanh vòng đá chỉ có ánh lửa
          { key: 'trại: ghế câu', at: ['Ghế câu cá (Fishing Chair)'], more: () => [lanternObj.g] }];
        const CAMP_FLOOR = { r: 1.0, k: 1.0, max: 0.6, ps: 0.05, fade: 0.4, grass: 0.6, night: 0.6 };   // tia 1 m · độ mờ = độ che (≤ 0,6) · ô 5 cm · mờ về mép 0,4 m · cỏ tối 60 % theo độ mờ (90 %: lá cao sau lưng ghế thành vệt đen) · đêm tấm phủ còn 40 %
        const campNoAo = o => { for (let p = o; p; p = p.parent) if (p.name === 'Lòng bếp' || p === lanternObj.g) return true; return false; };   // đá, củi, tro lòng bếp + cọc đèn lồng: vẫn chắn, không nhận (giữ ánh lửa, ánh đèn đêm)
        const campLook = { ready: false };
        ldGate.then(() => Promise.race([Promise.all(ldNeed), new Promise(r => setTimeout(r, 8000))])).then(() => { campLook.ready = true; });
        function campAoAsk(C) {   // gốc + hộp của cụm (lần đầu), xếp hàng nướng
          if (!C.roots) {
            C.roots = C.at.map(n => scene.getObjectByName(n)).filter(Boolean).concat(C.more ? C.more() : []);
            const B = new THREE.Box3(), b = new THREE.Box3(); for (const r of C.roots) r.traverseVisible(o => { if (o.isMesh && !o.userData.noBatch) B.union(b.setFromObject(o)); });
            C.mid = B.getCenter(new THREE.Vector3()); C.box = B.expandByScalar(0.6);
          }
          if (C.go) { C.asked = true; aoBake(scene, { key: C.key, roots: C.roots, box: C.box, ground: true, skip: campNoAo, floor: { ...CAMP_FLOOR, done: f => campFloor(C, f) } }); }
        }
        function campFloor(C, f) {   // tấm phủ bóng góc mặt đất + cỏ tối theo (1 lần — nướng lại sau mất ngữ cảnh giữ nguyên)
          if (C.floorMesh) return;
          worldJoin('groundContact', 30, S => { C.floorMesh = S.drape({ ...f, name: 'Bóng góc mặt đất · ' + C.key }); });
          C.grass = meadow.shade((f.x0 + f.x1) / 2, (f.z0 + f.z1) / 2, Math.hypot(f.x1 - f.x0, f.z1 - f.z0) / 2, (x, z) => {
            const u = Math.floor((x - f.x0) / f.ps), v = Math.floor((z - f.z0) / f.ps);
            return u < 0 || v < 0 || u >= f.NX || v >= f.NZ ? 1 : 1 - CAMP_FLOOR.grass * f.px[(v * f.NX + u) * 4 + 3] / 255;
          });
        }
        worldTick('afterRender', 90, () => {   // MỖI KHUNG (sổ tick, sau khi vẽ — trước việc nướng): hỏi nướng bóng góc cụm trại lần đầu nhìn cận
          if (!campLook.ready || camera.zoom < 8) return;
          for (const C of CAMP_AO) if (!C.asked) { campAoAsk(C); if (target.distanceTo(C.mid) < 14) { C.go = true; campAoAsk(C); } }
        });
        worldTick('lamps', 60, () => {   // MỖI KHUNG (lượt đèn đêm): bóng góc chỉ chắn ánh trời — đêm ánh lửa / đèn lồng là chính ⇒ tấm phủ nhạt còn 40 % (cụm lửa trại: 0)
          for (const C of CAMP_AO) if (C.floorMesh) C.floorMesh.material.opacity = 1 - (C.night ?? CAMP_FLOOR.night) * nightFactor;
        });
