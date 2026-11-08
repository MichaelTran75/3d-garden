        // ---- ĐẶT CÁ THEO MIỆNG (thư viện, ai cũng gọi được): quẫy thân theo t + struggle, quay theo hướng bơi + góc ngóc, dời thân cho miệng đúng điểm cho trước.
        //      Cá hồ tự gọi khi đang trên lưỡi câu / vừa được thả (animals/fish/fish.js fishHookTick), bếp nướng gọi cho cá rô của mình (engineer/tasks/angling.js) ----
        const _mouthOff = new THREE.Vector3();
        function placeByMouth(f, mouthPoint, heading, vertical, t, struggle = 0) {
          f.swim(t, struggle);
          f.g.rotation.set(0, -heading, vertical);
          _mouthOff.copy(f.mouth).multiply(f.g.scale).applyQuaternion(f.g.quaternion);
          f.g.position.copy(mouthPoint).sub(_mouthOff);
        }
