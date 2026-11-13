        // ===== LÒNG XE cho core/room-light.js: hình hộp lòng xe, các ô mở, vị trí đèn (toạ độ xe: mũi −X, cửa lùa +Z, 1,1 đv = 1 m)
        //  · vlIn: lòng xe + cabin, mép mờ 6–30 cm (sàn 0,83, trần 2,9, vách ±0,98; khoang máy ngoài hộp).
        //  · vlOpen: dải cửa sổ vách −Z (mặt quay về cửa sổ sáng hơn), ô cửa lùa +Z (x −0,55 … 0,83), kính lái.
        //  · uVlLamp: giữa đèn bàn học và đèn thả; uVlK.y lên / xuống dần theo công tắc đèn (updateStudyLamp).
        ROOM_LIT.glsl = `
          float vlIn(vec3 q) { vec3 a = smoothstep(vec3(-2.75, 0.76, -1.02), vec3(-2.45, 0.82, -0.94), q), b = 1.0 - smoothstep(vec3(3.78, 2.90, 0.94), vec3(3.86, 2.96, 1.02), q);
            return a.x * a.y * a.z * b.x * b.y * b.z; }
          float vlOpen(vec3 q, vec3 n) {
            float gW = smoothstep(0.7, -0.98, q.z) * (0.6 + 0.4 * max(0.0, -n.z));
            float gD = 1.0 - smoothstep(0.0, 1.3, length(vec2(max(abs(q.x - 0.14) - 0.69, 0.0), 0.98 - q.z)));
            return max(max(0.8 * gW, gD), smoothstep(-1.5, -2.5, q.x)); }`;
        ROOM_LIT.u.uVlLamp.value.set(2.35, 2.3, -0.5);
        const _vlC = new THREE.Vector3(), vanRoomBox = p => p.x > -2.75 && p.x < 3.86 && p.y > 0.6 && p.y < 2.96 && Math.abs(p.z) < 1.02;
        function vanRoomHas(o) {   // tâm hình của mảnh nằm trong lòng xe (lúc dựng lô)
          const g = o.geometry; if (!g.boundingSphere) g.computeBoundingSphere(); o.updateWorldMatrix(true, false);
          return vanRoomBox(caravanObj.worldToLocal(_vlC.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld)));
        }
        function vanOwnShadow() {   // đồ tự vẽ (noBatch) trong lòng xe nhận bóng mái + vách như đồ trong lô; gọi ngay trước khi dựng lô xe
          (function walk(o, nb) { nb = nb || !!o.userData.noBatch; if (o.isMesh && nb && !o.receiveShadow && !o.material.transparent && vanRoomHas(o)) o.receiveShadow = true; for (const c of o.children) walk(c, nb); })(caravanObj, false);
        }
        const vanOwnDrawn = o => { if (o.userData.lodHi !== undefined) return true; for (let p = o; p && p !== caravanObj.parent; p = p.parent) if (p.userData.noBatch) return true; return false; };   // có lúc tự vẽ: không gộp, hoặc vật tròn đổi bản nhiều cạnh khi cận cảnh
        let _vlEngIn = false;
        function vanLightTick(dt) {   // mỗi khung (vanFrameTick): ma trận thế giới → xe, độ sáng ánh đèn hắt
          ROOM_LIT.u.uVlInv.value.copy(caravanObj.matrixWorld).invert();
          const k = ROOM_LIT.u.uVlK.value; k.y += ((studyDeskLighting.on ? 1 : 0) - k.y) * Math.min(1, dt * 1.6);
          const E = worldSee('engineer').object, q = E.getWorldPosition(_vlC).applyMatrix4(ROOM_LIT.u.uVlInv.value), inside = q.y > 0.15 && vanRoomBox(q.setY(Math.max(q.y, 0.7)));   // kỹ sư trong lòng xe: nhận bóng (mái, vách chắn nắng); ra ngoài trả như cũ. Gốc thân lúc ngồi thấp hơn sàn (≈ 0,37) ⇒ chỉ chặn dưới 0,15
          if (inside !== _vlEngIn) { _vlEngIn = inside; E.traverse(o => { if (!o.isMesh) return; const u = o.userData; if (u.rsOut === undefined) u.rsOut = o.receiveShadow; o.receiveShadow = inside || u.rsOut; }); }
        }
