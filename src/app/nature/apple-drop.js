        // ====== TÁO RỤNG: quả chín tự rời cành (cơn giật làm rụng sớm hơn) → rơi → nảy → lăn → nằm dưới gốc tới sáng hôm sau ======
        //  Thân vật lý = vật rời dùng chung (core/gravity.js: looseBody / looseTick, rough = mặt đất gồ ghề bẻ hướng nảy). Quả vẫn là con của cây
        //  (lô gộp vẽ tự theo ma trận từng mảnh) ⇒ không thêm lưới, không thêm lượt vẽ.
        //  Chỉ rụng quả: đường rơi không vướng cành / thân, bên dưới là đất trống (không mái chuồng, không vật), kỹ sư không với tới bằng sào,
        //  không con nào đứng dưới, cây đang nằm trong khung nhìn và quả đủ lớn trên màn hình. Mỗi cây có hạn mức mỗi ngày.
        const appleFall = (() => {
          const RATE0 = 1 / 75, RATE_K = 0.12, GAP = 6, PX_MIN = 3, CLEAR = 0.04, DRIFT = 0.12, UNDER = 0.9;   // 1/s mỗi cây lúc lặng gió · hệ số cơn giật (độ giật kẹp ≤ 1) · nghỉ giữa 2 quả cùng cây (s) · quả nhỏ hơn 3 px thì thôi · hở cành · trôi ngang (m/s) · bán kính trống dưới quả
          const trees = appleTrees.map(T => ({ T, cand: null, n: 0, cap: Math.max(3, Math.min(8, Math.round(T.userData.apples.length / 9))), rw: 0, wait: 0, inv: new THREE.Matrix4(), qi: new THREE.Quaternion(), c: new THREE.Vector3() }));
          const live = [], prev = [], S = { night: false, acc: 0, lastK: 0, drops: 0, kicks: 0 };
          const _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _w = new THREE.Vector3(), _mm = new THREE.Vector3(), _cd = new THREE.Vector3(), proxy = { position: new THREE.Vector3(), quaternion: new THREE.Quaternion() };
          let seed = 20431;
          const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };   // dãy riêng: không đụng Math.random của cảnh
          function setup(R) {   // 1 lần mỗi cây khi lớp va chạm đã dựng: quả nào được phép rụng
            const T = R.T, U = T.userData, sc = T.getWorldScale(_p).x, rL = U.appleR, L = U.limbs || []; T.updateMatrixWorld(true);
            R.rw = rL * sc; R.cand = []; T.getWorldPosition(R.c);
            for (const a of U.apples) {
              const par = a.g.parent; R.inv.copy(par.matrixWorld).invert(); par.getWorldQuaternion(R.qi).invert();
              const W = a.g.getWorldPosition(new THREE.Vector3()), gy = cowY(W.x, W.z);
              if (a.pick || W.y - gy < 1 || colRestY(W.x, W.z, gy + COL_TOP, LOOSE_UP, 7) - gy > 0.05) continue;   // dưới quả có vật / mái
              const A = T.worldToLocal(_p.copy(W)); let ok = true;
              for (let i = 0; i < L.length && ok; i++) { const s = L[i]; if (Math.min(s[1], s[4]) > A.y - rL * 0.5) continue;
                const len = Math.hypot(s[3] - s[0], s[4] - s[1], s[5] - s[2]), n = Math.max(1, Math.ceil(len / 0.08));
                for (let k = 0; k <= n; k++) { const u = k / n, y = s[1] + (s[4] - s[1]) * u; if (y > A.y - rL * 0.5) continue;
                  const d = Math.hypot(s[0] + (s[3] - s[0]) * u - A.x, s[2] + (s[5] - s[2]) * u - A.z) * sc, fall = Math.sqrt(2 * (A.y - y) * sc / GRAV);
                  if (d < (s[6] + (s[7] - s[6]) * u) * sc + R.rw + CLEAR + DRIFT * fall) { ok = false; break; } }
              }
              if (ok) R.cand.push({ a, W });
            }
          }
          function gust(x, y, z) {   // cùng thước đo với lá rụng: (lực gió)² × độ giật so với nền tại chỗ
            const zu = Math.max(1, y - cowY(x, z)); windAt(x, y, z, zu, _w); windMapSample(x, z, _mm);
            const mean = Math.max(0.05, Math.hypot(_mm.x, _mm.y) * sceneWind.U * windProfile(zu)), sp = Math.hypot(_w.x, _w.z);
            return Math.pow(sp / WIND_SREF, 2.6) * Math.pow(Math.max(0, sp / mean - 1.25), 1.5);
          }
          const hanging = a => a.on && !a.raccoon && (a.st === undefined || a.st === 'tree');
          function free(R, c) {   // lúc này quả c rụng được không
            const a = c.a; if (!hanging(a)) return false;
            if (a.st !== undefined) { const E = worldSee('engineer'); if (E && E.phase === 'apple') return false; }   // đang có người hái: cây hái đứng yên
            if (R.T === appleTrees[2]) { const K = worldSee('raccoon'); if (K && K.shown && Math.hypot(K.pos.x - R.c.x, K.pos.z - R.c.z) < 9) return false; }   // gấu mèo quanh gốc / trên cây: quả nó nhắm không được rụng mất
            for (const M of COL.movers) if (M.on() && Math.hypot(M.x() - c.W.x, M.z() - c.W.z) < UNDER + M.a) return false;
            return true;
          }
          function drop(R, c, kv) {
            const a = c.a, B = looseBody(R.rw, { e: 0.22, mu: 0.55, rr: 0.13, rough: 0.11 });
            a.g.getWorldPosition(B.p); a.g.getWorldQuaternion(B.q); B.p0.copy(B.p); B.q0.copy(B.q);
            const sp = Math.hypot(_w.x, _w.z) || 1, v = Math.min(DRIFT, 0.03 + 0.05 * (kv || 0));
            B.v.set(_w.x / sp * v, 0, _w.z / sp * v); B.w.set((rnd() - 0.5) * 3, (rnd() - 0.5) * 2, (rnd() - 0.5) * 3);
            a.on = false; if (a.st !== undefined) a.st = 'fall';
            live.push({ a, R, B }); R.n++; S.drops++;
          }
          function put(F) {   // thân vật lý (toạ độ thế giới) → quả (toạ độ trong cây)
            const g = F.a.g, par = g.parent; F.R.inv.copy(par.matrixWorld).invert(); par.getWorldQuaternion(F.R.qi).invert();
            g.position.copy(proxy.position).applyMatrix4(F.R.inv); g.quaternion.copy(F.R.qi).multiply(proxy.quaternion);
          }
          function back(F) { const a = F.a; a.g.position.copy(a.home); a.g.rotation.set(0, a.rot, 0); a.on = true; if (a.st !== undefined) { a.st = 'tree'; a.sw = a.sv = a.swy = a.svy = 0; } }
          function kick(dt) {   // con vật / người bước trúng quả đang nằm: quả bị hất lăn đi, không xuyên qua chân
            const MV = COL.movers;
            for (let i = 0; i < MV.length; i++) {
              const M = MV[i], x = M.x(), z = M.z(), P = prev[i] || (prev[i] = { x, z }), vx = (x - P.x) / dt, vz = (z - P.z) / dt; P.x = x; P.z = z;
              if (!M.on() || M.ghost) continue;
              const an = M.ang(), ca = Math.cos(an), sa = Math.sin(an), cx = x + ca * (M.ox || 0), cz = z + sa * (M.ox || 0), dO = Math.max(0, M.a - M.b);
              for (const F of live) { const B = F.B; if (B.air || B.wet) continue;
                let dx = B.p.x - cx, dz = B.p.z - cz; if (Math.abs(dx) > M.a + 0.2 || Math.abs(dz) > M.a + 0.2 || Math.abs(cowY(x, z) + B.r - B.p.y) > 0.5) continue;
                const u = Math.max(-dO, Math.min(dO, dx * ca + dz * sa)); dx -= ca * u; dz -= sa * u; const d = Math.hypot(dx, dz), R0 = M.b * 0.8 + B.r * 0.5;
                if (d >= R0) continue;
                const k = d > 1e-4 ? 1 / d : 0, nx = k ? dx * k : -sa, nz = k ? dz * k : ca, sp = Math.min(2.5, Math.hypot(vx, vz));
                if (B.v.x * nx + B.v.z * nz > 0.25 + sp) continue;   // đang lăn ra rồi
                const s = 0.35 + 0.9 * sp, mx = sp > 0.05 ? vx / sp * 0.6 * sp : 0, mz = sp > 0.05 ? vz / sp * 0.6 * sp : 0;
                B.v.set(nx * s + mx, 0, nz * s + mz); B.rest = false; B.age = 0; B.still = 0; S.kicks++;
              }
            }
          }
          // QUẢ THEO XƯƠNG CÀNH (nature/wind-physics.js): quả còn trên cành dời cứng theo xương của đầu cành (rigAt = bản CPU của shader).
          //  Người đang hái, gấu mèo đang trèo, quả còn lắc sau cú hái ⇒ treeRigHold: cây về tư thế nghỉ, quả về đúng home như khi không có xương.
          const rigged = trees.filter(R => R.T.userData.treeWind), _rd = new THREE.Vector3();
          if (rigged.length) worldTick('wild', 60, () => {
            const E = worldSee('engineer'), K = worldSee('raccoon');
            for (const R of rigged) {
              const T = R.T, tw = T.userData.treeWind; if (!tw.rg) continue;
              if (!R.fq) { T.updateMatrixWorld(true); R.fq = T.getWorldQuaternion(new THREE.Quaternion()).invert(); R.fk = 1 / T.getWorldScale(new THREE.Vector3()).x; for (const a of T.userData.apples) a.wh = T.localToWorld(a.home.clone()); }
              let hold = !!((E && E.phase === 'apple' && !T.userData.noPick) || (K && K.climbing === T));
              for (const a of T.userData.apples) {
                if (!a.bind || !hanging(a)) continue;
                if (a.sw || a.sv || a.swy || a.svy) { hold = true; a.rf = false; continue; }
                rigAt(tw, a.bind, a.wh, _rd);
                if (_rd.lengthSq() > 1e-10) { a.g.position.copy(a.home).addScaledVector(_rd.applyQuaternion(R.fq), R.fk); a.rf = true; }
                else if (a.rf) { a.g.position.copy(a.home); a.rf = false; }
              }
              if (hold) treeRigHold(T, 0.5);
            }
          });
          worldTick('wild', 60, dt => {
            if (!COL.ready || !(dt > 0)) return;
            const hh = liveWeather.localHour;
            if (hh < 5) S.night = true;
            else if (S.night) { S.night = false; for (const F of live) back(F); live.length = 0; for (const R of trees) R.n = 0; }   // 5 giờ sáng (giờ cảnh): quả rụng hôm trước coi như đã được nhặt, cây đủ quả lại
            for (let i = live.length - 1; i >= 0; i--) { const F = live[i], B = F.B;
              if (F.a.st === 'tree') { F.a.on = true; live.splice(i, 1); continue; }   // cây hái đã tự trả quả về cành
              if (!B.rest || B.wet) { looseTick(B, dt, proxy); put(F); }
            }
            if (live.length) kick(dt);
            S.acc += dt; if (S.acc < 0.5) return; const T = S.acc; S.acc = 0;
            const el = renderer.domElement, ppm = (el.clientHeight || el.height) * camera.zoom / (camera.top - camera.bottom);
            const hx = (camera.right - camera.left) / 2 / camera.zoom, hy = (camera.top - camera.bottom) / 2 / camera.zoom; camera.getWorldDirection(_cd);
            const rv = Math.hypot(hx, hy / Math.max(0.12, -_cd.y));
            for (const R of trees) {
              if (!R.cand) setup(R);
              R.wait -= T;
              if (R.wait > 0 || R.n >= R.cap || !R.cand.length || 2 * R.rw * ppm < PX_MIN || Math.hypot(R.c.x - target.x, R.c.z - target.z) > rv) continue;
              const c = R.cand[(rnd() * R.cand.length) | 0], kv = Math.min(1, gust(c.W.x, c.W.y, c.W.z)); S.lastK = kv;
              if (rnd() < (RATE0 + RATE_K * kv) * T && free(R, c)) { drop(R, c, kv); R.wait = GAP; }
            }
          });
          return { state: S, trees, live, gust, back(F) { const i = live.indexOf(F); if (i >= 0) { live.splice(i, 1); F.R.n--; back(F); } },
            force(ti, k) { const R = trees[ti]; if (!R || !COL.ready) return null; if (!R.cand) setup(R); const L = R.cand.filter(c => hanging(c.a)); if (!L.length) return null;
              const c = L[k === undefined ? (rnd() * L.length) | 0 : k % L.length]; _w.set(1, 0, 0); drop(R, c, 0); return live[live.length - 1]; } };
        })();
