        // ====== khu cắm trại của kỹ sư: caravan + ghế xếp câu cá bên bờ tây hồ hạ lưu ======
        // dời cả cụm câu cá (ghế · đèn · kỹ sư · caravan · lửa · phao · chó) về tọa độ góc (75, _, 99)
        const _ofI = x2gi(X0 + 74) / S - 27.3, _ofJ = z2gj(Z0 + 103) / S - 30.5;   // offset cell so với ghế gốc → cụm ở (74, _, 103)
        const _rot = 35 * Math.PI / 180;   // xoay cụm ngược chiều kim đồng hồ 35°, lấy ghế làm tâm
        const _rc = (oi, oj) => { const di = oi - 27.3, dj = oj - 30.5, c = Math.cos(_rot), s = Math.sin(_rot); return [27.3 + di * c - dj * s + _ofI, 30.5 + di * s + dj * c + _ofJ]; };
        const CHAIR_CELL = _rc(27.3, 30.5), CARAVAN_CELL = _rc(23, 33);
        const _bc = _rc(29.4, 30.2); const bobberBase = worldCell(_bc[0], _bc[1]); bobberBase.y = lakeY + 0.05;   // phao nổi giữa mặt hồ, trước mặt kỹ sư
        const engObj = (() => {
          const g = engineer();
          const wp = [_rc(20, 32), _rc(24, 30.5), _rc(26.4, 29.7), CHAIR_CELL, _rc(22, 29)].map(c => worldCell(c[0], c[1]));  // [2]=cột khí tượng · [3]=ghế câu cá
          obstacleCoords.push({ x: wp[2].x, y: wp[2].y, z: wp[2].z, r: 2.0, h: 12 });
          g.position.copy(wp[0]); g.position.y -= ENG_FEET; g.name = 'Kỹ sư (Engineer)'; g.rotation.order = 'YXZ'; scene.add(g);   // YXZ: quay hướng trước, nghiêng người theo thân sau
          const chairW = wp[3], faceWater = Math.atan2(bobberBase.x - chairW.x, bobberBase.z - chairW.z);
          return {
            g, legs: g.userData.legs, knees: g.userData.knees, ankles: g.userData.ankles, arms: g.userData.arms, head: g.userData.head,
            rodGrp: g.userData.rodGrp, rodTilt: g.userData.rodTilt, rodTip: g.userData.rodTip, rod: g.userData.rod, clip: g.userData.clip, props: g.userData.props,
            helmet: g.userData.helmet, hair: g.userData.hair, towel: g.userData.towel,
            wp, phase: 'toFish', timer: 0, wanderTgt: null, wanderTmr: 0, spd: 1.1, groundY: chairW.y, faceWater
          };
        })();
        // ---- di chuyển 1 bước tới đích: né bếp lửa + MỌI vật cản (xe van, cột, tua-bin...) bằng lực đẩy, xoay mượt, dáng đi vung tay-chân + nhún ----
        function engGait(e, dist) {   // nhịp chân theo QUÃNG ĐƯỜNG thật (1 chu kỳ 2 bước = 1,35 m) → chân không trượt; biên độ chân/tay theo tốc độ
          e.gait = ((e.gait || 0) + dist * (Math.PI * 2 / 1.35)) % (Math.PI * 2000);
          const k = Math.min(1, (e.vel || 0) / 1.1), amp = 0.52 * (0.35 + 0.65 * k), kneeAmp = 0.58 * (0.4 + 0.6 * k);
          const sw = Math.sin(e.gait) * amp, kb = Math.cos(e.gait);
          e.legs[0].rotation.x = sw; e.legs[1].rotation.x = -sw;
          e.knees[0].rotation.x = Math.max(0, kb) * kneeAmp; e.knees[1].rotation.x = Math.max(0, -kb) * kneeAmp;   // gối gập khi chân vung tới trước
          e.arms[0].rotation.x = -sw * 0.65; e.arms[1].rotation.x = sw * 0.65; e.head.rotation.x = 0.03 * k;
          return Math.abs(Math.sin(e.gait)) * 0.035 * (0.4 + 0.6 * k);   // nhún người 2 lần/chu kỳ
        }
