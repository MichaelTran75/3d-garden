        // ---- đàn bò: trường về cửa chuồng; con nào không có lối về (bên kia sông, không cầu) dời sang bãi cỏ phía bắc chuồng ----
        // Lưới riêng cho bò: như lưới chung, cộng thêm (1) mặt đập + dốc nối = cầu qua sông, dải lan can hai bên đập bị cấm;
        // (2) sân trước cửa chuồng và bãi đất ngay đầu chiếu nghỉ đập nằm trên nền san phẳng (pad) → mở cho bò đi.
        const cowBlocked = ffBlocked.slice();
        { const r = cowHutRect, ax0 = r.x0 - 0.6, ax1 = r.x1 + 2.2, az0 = r.z1, az1 = cowHut.door.z + 3.2;
          for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) {
            const x = wx(i), z = wz(j), n = i + j * GX, w = damWalkAt(x, z);
            if (w) { cowBlocked[n] = w.off <= 0 ? 0 : 1; continue; }
            if (padH(i, j) === null || isWater(i, j)) continue;
            if (((x > ax0 && x < ax1 && z > az0 && z < az1) || damExits.some(e => Math.hypot(x - e.x, z - e.z) < 2.6)) && !obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.3)) cowBlocked[n] = 0;
          } }
        hutField = buildFlowField(cowHut.door.x, cowHut.door.z, cowBlocked);
        { const reach = (f, x, z) => f[Math.round(x2gi(x)) + Math.round(z2gj(z)) * GX] < 65535;
          for (const c of cows) {
            if (reach(hutField, c.x, c.z)) continue;
            for (let k = 0; k < 300; k++) { const a = Math.random() * Math.PI, r = 9 + Math.random() * 18, x = cowHut.x + Math.cos(a) * r, z = cowHut.z - Math.sin(a) * r; if (cowOK(x, z) && reach(hutField, x, z)) { c.x = x; c.z = z; c.g.position.set(x, cowY(x, z), z); break; } }
          }
          for (const c of cows) if (!c.dam) { c.homeX = c.x; c.homeZ = c.z; c.homeField = buildFlowField(c.x, c.z, cowBlocked); }   // bãi gặm quen = chỗ xuất phát
          for (const c of cows) if (c.dam) { c.homeX = c.dam.homeX; c.homeZ = c.dam.homeZ; c.homeField = c.dam.homeField; }   // bê ra khỏi chuồng thì về bãi của mẹ
          if (cowHutWanted()) for (const c of cows) {   // mở trang lúc tối / mưa: bò đã nằm sẵn trong chuồng
            const st = cowHut.stalls[c.stall % cowHut.stalls.length]; c.mode = 'home'; c.leg = 'in'; c.sub = 'rest'; c.tmr = 30 + Math.random() * 60; c.restY = 1;
            c.x = st.x; c.z = st.z; c.ang = -Math.PI / 2; c.g.position.set(c.x, cowY(c.x, c.z) - 0.8 * NATURE_SCALE, c.z); c.g.rotation.y = Math.PI / 2;
          } }

