        // ---- đi dạo khám phá: ghé 2 điểm (không lặp 4 điểm vừa xem), đứng ngắm 14–20 s, ngẩng nhìn, đưa bảng kẹp lên ghi ----
        const exploreJob = (() => {
          const POI_NAMES = ['Cây anh đào', 'Trạm khí tượng mini', 'Đèn đường (Street Lamp)', 'Trạm biến áp', 'Cột điện #1', 'Cột điện #2', 'Xưởng bảo trì', 'Móc treo hộp tổ', 'Cột khí tượng'];
          let POI = null; const X = { st: 'idle', k: 0, n: 0, p: null }, _a = new THREE.Vector3(), _b = new THREE.Box3();
          function pois() {   // điểm tham quan: vị trí, chỗ đứng cách vật cản gần nhất, độ cao điểm nhìn (đo 1 lần)
            if (POI) return POI; POI = [];
            for (const nm of POI_NAMES) { const o = scene.children.find(c => c.name && c.name.startsWith(nm)); if (!o) continue;
              const p = o.getWorldPosition(new THREE.Vector3()); _b.setFromObject(o); let r = 1.6;
              for (const ob of obstacleCoords) if (Math.hypot(ob.x - p.x, ob.z - p.z) < 3) r = Math.max(r, ob.r + 1.0);
              POI.push({ nm, p, r: Math.min(r, 9), y: Math.min(_b.max.y, p.y + 6) * 0.6 + p.y * 0.4 }); }
            return POI;
          }
          function update(e, dt, t) {   // pha 'explore' của kỹ sư: true = xong
            if (X.st === 'idle') { X.st = 'pick'; X.n = 0; }
            X.k += dt;
            if (X.st === 'pick') {
              const ci = Math.round(x2gi(e.g.position.x)) + Math.round(z2gj(e.g.position.z)) * GX, stand = q => { const dx = e.g.position.x - q.p.x, dz = e.g.position.z - q.p.z, d = Math.hypot(dx, dz) || 1; return new THREE.Vector3(q.p.x + dx / d * q.r, 0, q.p.z + dz / d * q.r); };
              const L = pois().filter(q => !AUTO.seen.includes(q.nm) && Math.hypot(q.p.x - pf.x, q.p.z - pf.z) < 40).map(q => [q, stand(q)])
                .filter(([, s]) => { if (!ENG_NAV.blk) return true; const f = engField(s.x, s.z); return !!f && f[ci] < 65535; });   // chỉ điểm đi bộ tới được (bảng riêng: bậc ≤ 1 voxel) — G 24/10: trước chọn cả điểm sau gờ cao, đứng ì
              if (!L.length || X.n >= 2) { X.st = 'idle'; return true; }
              [X.p, X.stand] = L[Math.floor(Math.random() * L.length)]; AUTO.seen.push(X.p.nm); if (AUTO.seen.length > 4) AUTO.seen.shift();
              X.st = 'go'; X.k = 0;
            } else if (X.st === 'go') {
              if (engStep(e, X.stand, dt, t, pf, FIRE_AVOID_R)) { X.st = 'look'; X.k = 0; X.dur = 14 + Math.random() * 6; }
              else if (X.k > 70) { X.st = 'pick'; X.n++; }   // kẹt đường: bỏ điểm này
            } else if (X.st === 'look') {   // đứng ngắm: quay mặt vào vật, ngẩng nhìn tầm giữa–đỉnh, thỉnh thoảng đưa bảng kẹp lên ghi
              engStandStill(e); e.vel = 0; e.g.position.y = cowY(e.g.position.x, e.g.position.z) - ENG_FEET;
              const w = Math.atan2(X.p.p.x - e.g.position.x, X.p.p.z - e.g.position.z), dw = Math.atan2(Math.sin(w - e.g.rotation.y), Math.cos(w - e.g.rotation.y)); e.g.rotation.y += dw * Math.min(1, dt * 4);
              e.head.getWorldPosition(_a); e.head.rotation.x = Math.max(-0.9, Math.min(0.5, -Math.atan2(X.p.y - _a.y, Math.hypot(X.p.p.x - _a.x, X.p.p.z - _a.z)))) + Math.sin(t * 0.7) * 0.05;
              const note = (X.k % 9) > 5.5 ? Math.sin(Math.PI * ((X.k % 9) - 5.5) / 3.5) : 0; e.arms[1].rotation.x = -1.45 * note; e.arms[0].rotation.x = -0.15;
              if (X.k > X.dur) { X.st = 'pick'; X.n++; }
            }
            return false;
          }
          return { update, reset() { X.st = 'idle'; }, state: X };
        })();
