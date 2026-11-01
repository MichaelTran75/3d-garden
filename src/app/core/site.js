        // ==== KHU TRẠI DÙNG CHUNG (tách 01/11 khỏi engineer/body/constants.js — xe, trại, đồ câu, chó, kỹ sư cùng đọc) ====
        //  CAMP_SCALE: tỉ lệ cả cụm trại (xe caravan, ghế, bàn, bếp lửa, chó, người) so với lưới voxel
        const CAMP_SCALE = 0.90;
        // ---- BẢN ĐỒ KHU TRẠI (dời 01/11 từ engineer/body/instance-gait.js + camp/chairs-lantern-fire.js — xe, trại, đồ câu, kỹ sư, chó, gà, chim sẻ, gấu mèo, cỏ cùng đọc):
        //      cả cụm câu cá (ghế · đèn · kỹ sư · caravan · lửa · phao · chó) dời về toạ độ góc (74, _, 103), xoay quanh ghế câu; ô = [i, j] theo lưới bản đầu đã xoay ----
        const _ofI = x2gi(X0 + 74) / S - 27.3, _ofJ = z2gj(Z0 + 103) / S - 30.5;   // offset cell so với ghế gốc → cụm ở (74, _, 103)
        const _rot = 35 * Math.PI / 180;   // xoay cụm ngược chiều kim đồng hồ 35°, lấy ghế làm tâm
        const _rc = (oi, oj) => { const di = oi - 27.3, dj = oj - 30.5, c = Math.cos(_rot), s = Math.sin(_rot); return [27.3 + di * c - dj * s + _ofI, 30.5 + di * s + dj * c + _ofJ]; };
        const CHAIR_CELL = _rc(27.3, 30.5), CARAVAN_CELL = _rc(23, 33);
        const _bc = _rc(29.4, 30.2); const bobberBase = worldCell(_bc[0], _bc[1]); bobberBase.y = lakeY + 0.05;   // phao nổi giữa mặt hồ, trước mặt kỹ sư
        const FISH_FACE = (c => Math.atan2(bobberBase.x - c.x, bobberBase.z - c.z))(worldCell(CHAIR_CELL[0], CHAIR_CELL[1]));   // hướng ghế câu nhìn ra phao (ghế, xô, người ngồi câu cùng đọc)
        const FIRE_CELL = _rc(25, 32);
        const pf = worldCell(FIRE_CELL[0], FIRE_CELL[1]);   // tâm bếp lửa trại (thế giới)
        const CAMP_K = 0.5;   // G 24/10 tối "em cho camp fire in screenshot nhỏ lại 50%": CẢ CỤM bếp (lòng bếp, giá treo + ấm reo, que cá) ×0,5 quanh tâm — vòng né, đèn, việc nhóm / dập lửa, cá nướng theo cùng
        const FIRE_AVOID_R = (1.17 * CAMP_K + 0.22) * CAMP_SCALE;   // vòng né = chân giá treo xa nhất (1,17 đv × CAMP_K) + nửa thân người: bếp nhỏ 50% (G 24/10 tối) ⇒ 1,2 → 0,72 m
