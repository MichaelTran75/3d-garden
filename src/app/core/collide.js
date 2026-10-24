        // ===== LỚP VA CHẠM (G 17/10: "nghiên cứu xem các game engine làm physic… con vật chạm, tương tác với environment chính xác") =====
        //  Như Recast (bộ dựng navmesh của Unity / Unreal): voxel hoá TAM GIÁC THẬT của mọi lưới tĩnh (nhà, xe, chuồng, thân cây rừng, cột, đồ trại…) thành
        //  các KHOẢNG ĐẶC [y0, y1] theo cột ô 0,125 m — chỉ phần thấp (≤ 2,6 m trên mặt đất: tán lá, mái cao không chạm thân con vật). Địa hình khối, cỏ,
        //  nước, khói, con vật thì bỏ. 4 lớp: chung · xe van · chuồng bò (kỹ sư / chó vào xe, bò vào ô chuồng theo lộ trình riêng thì bỏ lớp tương ứng) · cành thấp.
        //  Dựng DẦN sau khi trang chạy (~5 ms mỗi khung) ⇒ không chậm lúc mở trang; chưa xong thì không chặn gì (như trước).
        //  Dùng: con vật THỬ BƯỚC trước khi bước — dấu chân elip theo thân trong dải cao [đất + bậc bước qua được, đỉnh lưng] (colFootHits): vướng thì trượt
        //  men theo / quay đi (như "collide and slide" của character controller, colSlide); thử cả khi XOAY tại chỗ (colTurnOK); lỡ lấn vào vật thì đẩy
        //  dần ra (colPushOut — "depenetration"); con khác cũng là vật cản (COL.movers). Mặt đứng (colWalkY): mặt đất hoặc đỉnh khoảng đặc thấp hơn bậc
        //  bước — chân đặt lên được (sàn chuồng, bậc, khúc gỗ thấp).
        const COL = { C: 0.125, T: 32, L: [new Map(), new Map(), new Map(), new Map()], ready: false, queue: null, qi: 0, tris: 0, cells: 0, movers: [] };
        const COL_GEN = 0, COL_VAN = 1, COL_SHED = 2, COL_BR = 3, COL_TOP = 2.6,   // lớp 3: cành thấp cây rừng (< 1,75 m, ngoài thân) — chỉ bò tránh (hươu rúc dưới tán ăn lá, người không bị cành chặn)
        COL_SKIP = /^(Cánh đồng pin|Nhà kho mái pin)/;
        const _clA = new Float64Array(48), _clB = new Float64Array(48), _clC = new Float64Array(48), _clV = new THREE.Vector3(), _clM = new THREE.Matrix4();
        function colClip(src, n, dst, ax, v, sg) {   // Sutherland–Hodgman: giữ phần sg·(p[ax] − v) ≥ 0 của đa giác n đỉnh → số đỉnh mới
          let m = 0;
          for (let i = 0, j = n - 1; i < n; j = i, i++) {
            const da = sg * (src[j * 3 + ax] - v), db = sg * (src[i * 3 + ax] - v);
            if ((da >= 0) !== (db >= 0)) { const s = da / (da - db); for (let k = 0; k < 3; k++) dst[m * 3 + k] = src[j * 3 + k] + (src[i * 3 + k] - src[j * 3 + k]) * s; m++; }
            if (db >= 0) { for (let k = 0; k < 3; k++) dst[m * 3 + k] = src[i * 3 + k]; m++; }
          }
          return m;
        }
        function colAddSpan(layer, xi, zi, y0, y1) {   // thêm khoảng đặc vào cột (gộp khoảng chồng / cách < 3 cm), tối đa 6 khoảng mỗi cột
          const T = COL.T, ti = Math.floor(xi / T), tj = Math.floor(zi / T), key = ti * 65536 + tj, M = COL.L[layer];
          let tile = M.get(key); if (!tile) { tile = new Array(T * T); M.set(key, tile); }
          const ci = (xi - ti * T) + (zi - tj * T) * T; let s = tile[ci];
          if (!s) { tile[ci] = [y0, y1]; COL.cells++; return; }
          for (let k = 0; k < s.length; k += 2) if (y0 <= s[k + 1] + 0.03 && y1 >= s[k] - 0.03) {   // chồng: nới khoảng k rồi gộp các khoảng sau vào
            s[k] = Math.min(s[k], y0); s[k + 1] = Math.max(s[k + 1], y1);
            for (let q = s.length - 2; q > k; q -= 2) if (s[q] <= s[k + 1] + 0.03 && s[q + 1] >= s[k] - 0.03) { s[k] = Math.min(s[k], s[q]); s[k + 1] = Math.max(s[k + 1], s[q + 1]); s.splice(q, 2); }
            return;
          }
          if (s.length >= 12) { s[s.length - 1] = Math.max(s[s.length - 1], y1); return; }
          s.push(y0, y1);
        }
        function colRasterTri(layer, P) {   // 1 tam giác (P: 9 số thế giới) → các cột ô nó cắt qua; khoảng đặc = cao thấp nhất / cao nhất của phần tam giác trong cột
          const C = COL.C;
          let z0 = Infinity, z1 = -Infinity; for (let k = 2; k < 9; k += 3) { z0 = Math.min(z0, P[k]); z1 = Math.max(z1, P[k]); }
          for (let zi = Math.floor(z0 / C), ze = Math.floor(z1 / C); zi <= ze; zi++) {
            let n = colClip(P, 3, _clA, 2, zi * C, 1); if (n < 3) continue;
            n = colClip(_clA, n, _clB, 2, (zi + 1) * C, -1); if (n < 3) continue;
            let x0 = Infinity, x1 = -Infinity; for (let k = 0; k < n; k++) { x0 = Math.min(x0, _clB[k * 3]); x1 = Math.max(x1, _clB[k * 3]); }
            for (let xi = Math.floor(x0 / C), xe = Math.floor(x1 / C); xi <= xe; xi++) {
              let m = colClip(_clB, n, _clC, 0, xi * C, 1); if (m < 3) continue;
              m = colClip(_clC, m, _clA, 0, (xi + 1) * C, -1); if (m < 3) continue;
              let y0 = Infinity, y1 = -Infinity; for (let k = 0; k < m; k++) { y0 = Math.min(y0, _clA[k * 3 + 1]); y1 = Math.max(y1, _clA[k * 3 + 1]); }
              colAddSpan(layer, xi, zi, y0, y1);
            }
          }
        }
        function colCollect() {   // danh sách việc dựng: [lưới, ma trận thế giới, lớp] — bỏ con vật / người / chim / côn trùng / cá, địa hình, cỏ, nước, hiệu ứng
          const skip = new Set(), add = o => o && o.isObject3D && o.traverse(c => skip.add(c));
          for (const c of cows) add(c.g); if (stag) add(stag.g); for (const b of bunnies) add(b.g); add(dogObj); add(raccoonObj); add(engObj.g);
          for (const b of birds) add(b.m); add(songbird.root); for (const b of flock.birds) add(b.root); for (const b of nestPairs.flat()) add(b.root); for (const b of sparrowGang.birds) add(b.root);
          for (const b of butterflies) add(b.g); for (const f of fishies) add(f.g || f.m); add(campTeaCup); add(grill.keep.g); add(campObj.fish.stick);
          add(daytimeAnimals); add(nighttimeFireflies);   // côn trùng, thú nhỏ ban ngày, đom đóm
          for (const m of terrainMeshes) skip.add(m);
          const shed = scene.getObjectByName('Chuồng bò (Cow Shed)'), Q = [];
          const fx = /khói|smoke|mưa|rain|mây|cloud|gợn|ripple|lá rừng|lá cây|cánh hoa|giọt|bọt|đầm sen|lotus|vệt sáng|chùm sáng|ánh đèn|bóng đổ|zzz|nhãn|label|sóng|dây câu|phao/i;   // hiệu ứng (nước ở terrainMeshes; hoa, sỏi rải loại theo cỡ)
          scene.traverse(o => {
            if (!(o.isMesh || o.isInstancedMesh) || o.isSkinnedMesh || skip.has(o) || o.userData.noCollide) return;
            const g = o.geometry; if (!g || !g.attributes.position) return;
            if (o.isInstancedMesh && g.attributes.position.count === 24 && Math.abs((g.boundingSphere?.radius || 0) - 0.52) < 0.02) return;   // khối địa hình
            for (let p = o; p; p = p.parent) if (!p.visible) return;
            if (fx.test(o.name + '|' + (o.parent ? o.parent.name : ''))) return;
            for (let p = o; p; p = p.parent) if (COL_SKIP.test(p.name)) return;   // khu thú không vào (tốn bộ nhớ)
            const mt = Array.isArray(o.material) ? o.material[0] : o.material; if (!mt || mt.visible === false) return;
            const tree = o.isInstancedMesh && g.attributes.position.count > 1000;   // mẫu cây rừng (thân + cành)
            if ((!tree && mt.transparent && mt.opacity < 0.6) || (o.isInstancedMesh && !tree && o.count > 400)) return;
            let layer = COL_GEN; for (let p = o; p; p = p.parent) { if (p === caravanObj) { layer = COL_VAN; break; } if (p === shed) { layer = COL_SHED; break; } }
            // cây: THÂN chặn (cành trên cao không chặn — hươu, bò lách dưới tán được; cây rừng giữ thêm cành thấp < 1,3 m): giữ tam giác trong bán kính quanh gốc
            let trunk = null; for (let p = o; p && !trunk; p = p.parent) { if (appleTrees.includes(p) || /^Cây anh đào/.test(p.name)) trunk = [p.position.x, p.position.z, p.userData.colR || 0.7]; else if (/^Cây cổ thụ/.test(p.name)) trunk = [p.position.x, p.position.z, 1.6]; }
            o.updateWorldMatrix(true, false);
            if (!g.boundingSphere) g.computeBoundingSphere();
            for (let k = 0, n = o.isInstancedMesh ? o.count : 1; k < n; k++) {
              const M = new THREE.Matrix4(); if (o.isInstancedMesh) { o.getMatrixAt(k, M); M.premultiply(o.matrixWorld); } else M.copy(o.matrixWorld);
              const e = M.elements, r = g.boundingSphere.radius * Math.max(Math.hypot(e[0], e[1], e[2]), Math.hypot(e[4], e[5], e[6]), Math.hypot(e[8], e[9], e[10]));
              if (r < (o.isInstancedMesh && !tree ? 0.25 : 0.04)) continue;   // vật rải nhỏ (hoa, sỏi) · mảnh tí hon
              const c = _clV.copy(g.boundingSphere.center).applyMatrix4(M); if (c.y - r > cowY(c.x, c.z) + COL_TOP + 0.5) continue;   // cả vật ở trên cao
              Q.push([g, M, layer, tree ? [e[12], e[14], 0.7, 1.75] : trunk]);   // mẫu cây rừng: gốc = gốc toạ độ bản sao; cành thấp < 1,75 m (lưng bò ~1,6 m) vào lớp cành
            }
          });
          return Q;
        }
        // dựng dần: mỗi lần gọi làm ~budget ms (main-loop gọi mỗi khung tới khi xong)
        function colBuildTick(budget) {
          if (COL.ready) return;
          if (!COL.queue) { COL.queue = colCollect(); COL.qi = 0; COL.ti = 0; return; }
          const t0 = performance.now(), P = new Float64Array(9);
          while (performance.now() - t0 < budget) {
            const job = COL.queue[COL.qi]; if (!job) { colPack(); COL.ready = true; COL.queue = null; return; }
            const [g, M, layer, tk] = job, pos = g.attributes.position, idx = g.index, nT = (idx ? idx.count : pos.count) / 3, e = M.elements;
            for (let n = 0; n < 400 && COL.ti < nT; n++, COL.ti++) {
              let lo = Infinity, hi = -Infinity;
              for (let v = 0; v < 3; v++) {
                const i = idx ? idx.getX(COL.ti * 3 + v) : COL.ti * 3 + v, x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
                P[v * 3] = e[0] * x + e[4] * y + e[8] * z + e[12]; P[v * 3 + 1] = e[1] * x + e[5] * y + e[9] * z + e[13]; P[v * 3 + 2] = e[2] * x + e[6] * y + e[10] * z + e[14];
                lo = Math.min(lo, P[v * 3 + 1]); hi = Math.max(hi, P[v * 3 + 1]);
              }
              const mx = (P[0] + P[3] + P[6]) / 3, mz = (P[2] + P[5] + P[8]) / 3, gy = cowY(mx, mz);
              let L = layer;
              if (tk && Math.hypot(mx - tk[0], mz - tk[1]) > tk[2]) { if (tk[3] && lo < gy + tk[3]) L = COL_BR; else continue; }   // cành lá ngoài thân: bỏ — trừ cành thấp cây rừng (lớp cành)
              // mặt nằm ngang trùng mặt đất cowY đang dùng (mặt đường, mặt đập): bỏ — còn thành bên đường đắp (chặn thú đi xuyên vào thành), đỡ tốn bộ nhớ
              const ux = P[3] - P[0], uy = P[4] - P[1], uz = P[5] - P[2], vx = P[6] - P[0], vy = P[7] - P[1], vz = P[8] - P[2], nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
              if (Math.abs(ny) > 0.9 * Math.hypot(nx, ny, nz) && Math.abs((P[1] + P[4] + P[7]) / 3 - gy) < 0.06) continue;
              if (lo > gy + COL_TOP || hi < gy - 0.05) continue;   // tam giác ở trên cao / dưới đất
              colRasterTri(L, P); COL.tris++;
            }
            if (COL.ti >= nT) { COL.qi++; COL.ti = 0; }
          }
        }
        function colPack() {   // nén: mỗi ô 4 m → off (Uint16, đầu khoảng của từng cột) + y (Int16, cm) — mảng JS mỗi cột tốn ~10 lần bộ nhớ
          const T2 = COL.T * COL.T;
          for (const M of COL.L) for (const [key, tile] of M) {
            let n = 0; for (let i = 0; i < T2; i++) if (tile[i]) n += tile[i].length;
            const off = new Uint16Array(T2 + 1), y = new Int16Array(n); let k = 0;
            for (let i = 0; i < T2; i++) { off[i] = k; const s = tile[i]; if (s) for (const v of s) y[k++] = Math.round(v * 100); }
            off[T2] = k; M.set(key, { off, y });
          }
        }
        let _colT = null, _colI = 0;
        function colCell(layer, x, z) {   // ô chứa (x, z) ở 1 lớp → đặt _colT (ô 4 m) + _colI (chỉ số cột); false nếu cột trống
          const C = COL.C, T = COL.T, xi = Math.floor(x / C), zi = Math.floor(z / C), ti = Math.floor(xi / T), tj = Math.floor(zi / T);
          _colT = COL.L[layer].get(ti * 65536 + tj); if (!_colT) return false;
          _colI = (xi - ti * T) + (zi - tj * T) * T; return _colT.off[_colI + 1] > _colT.off[_colI];
        }
        function colHit(mask, x, z, y0, y1) {   // có khoảng đặc nào trong dải [y0, y1] ở cột này (các lớp trong mask: bit 0 chung · 1 xe · 2 chuồng · 3 cành thấp)
          const a = y0 * 100, b = y1 * 100;
          for (let L = 0; L < 4; L++) { if (!(mask >> L & 1) || !colCell(L, x, z)) continue; const Y = _colT.y; for (let k = _colT.off[_colI], e = _colT.off[_colI + 1]; k < e; k += 2) if (Y[k] < b && Y[k + 1] > a) return true; }
          return false;
        }
        // mặt đứng: đất (cowY) hoặc đỉnh khoảng đặc cao nhất không quá ref + up (sàn chuồng, bậc, khúc gỗ thấp) — chân đặt đúng mặt lưới
        function colWalkY(x, z, ref, up) {
          let y = cowY(x, z); if (!COL.ready) return y;
          const lim = (ref + up) * 100;
          for (let L = 0; L < 3; L++) { if (!colCell(L, x, z)) continue; const Y = _colT.y; for (let k = _colT.off[_colI], e = _colT.off[_colI + 1]; k < e; k += 2) if (Y[k + 1] > y * 100 && Y[k + 1] <= lim) y = Y[k + 1] / 100; }
          return y;
        }
        // dấu chân elip (tâm x, z · hướng mũi ang · nửa dài a · nửa rộng b) có vướng trong dải [đất + lo, đất + hi]: trả ĐỘ LẤN (lấy mẫu lưới ~ô 0,125,
        // mẫu càng gần tâm elip càng nặng: mép 0,1 → tâm 1) — trượt dọc mặt vật giữ nguyên độ lấn, đi sâu vào (lách xuyên cột mảnh) thì tăng
        function colFootHits(x, z, ang, a, b, lo, hi, mask) {
          if (!COL.ready) return 0;
          const ca = Math.cos(ang), sa = Math.sin(ang), g = cowY(x, z), C = COL.C, na = Math.max(1, Math.round(a / C)), nb = Math.max(1, Math.round(b / C));
          let n = 0;
          for (let i = -na; i <= na; i++) for (let j = -nb; j <= nb; j++) {
            const u = i / na, v = j / nb; if ((a > 1.5 * b ? u ** 4 + v ** 4 : u * u + v * v) > 1) continue;   // thân dài (bò, hươu, chó, gấu mèo): siêu elip gần chữ nhật, phủ ~93% khối thân hộp — elip chỉ ~78% ⇒ góc thân lấn thân cây không bị bắt (G 19/10); người giữ tròn
            const px = x + ca * u * a - sa * v * b, pz = z + sa * u * a + ca * v * b;
            if (colHit(mask, px, pz, g + lo, g + hi)) n += 1 - 0.9 * Math.min(1, u * u + v * v);
          }
          return n;
        }
        // dấu chân của con M tại (x, z) hướng ang — tâm thân lệch ox theo hướng mũi (chó: ngực + cổ thò trước gốc 11 cm); da / db / lo: nới cho phép thử riêng
        function colFH(M, x, z, ang, mk = M.mask(), da = 0, db = 0, lo = M.lo) {
          const o = M.ox || 0;
          return colFootHits(x + Math.cos(ang) * o, z + Math.sin(ang) * o, ang, M.a + da, M.b + db, lo, M.hi, mk);
        }
        // ---- con vật đăng ký để tránh nhau: { x(), z(), ang(), a, b, ox (lệch tâm thân), w (nặng nhẹ), on() } ----
        function colMoverAdd(o) { COL.movers.push(o); return o; }
        function colMoverHits(self, x, z, ang) {   // độ chồng với con khác (tổng phần lấn, xấp xỉ mỗi elip = 3 hình tròn dọc thân)
          let s = 0; const ca = Math.cos(ang), sa = Math.sin(ang), rS = self.b, dS = Math.max(0, self.a - self.b); x += ca * (self.ox || 0); z += sa * (self.ox || 0);
          for (const o of COL.movers) {
            if (o === self || !o.on() || (self.ignore && self.ignore(o))) continue;
            const ox = o.x(), oz = o.z(); if (Math.abs(ox - x) > self.a + o.a + 0.1 || Math.abs(oz - z) > self.a + o.a + 0.1) continue;
            const oa = o.ang(), co = Math.cos(oa), so = Math.sin(oa), rO = o.b, dO = Math.max(0, o.a - o.b), cx = ox + co * (o.ox || 0), cz = oz + so * (o.ox || 0);
            for (const u of [-1, 0, 1]) for (const v of [-1, 0, 1]) {
              const d = Math.hypot(x + ca * u * dS - (cx + co * v * dO), z + sa * u * dS - (cz + so * v * dO)), p = rS + rO - d;
              if (p > 0) s += p;
            }
          }
          return s;
        }
        // thử 1 bước của con vật M từ (x0, z0) tới (x1, z1), hướng ang: được đi nếu không vướng, hoặc không lấn sâu hơn (đang chạm: trượt dọc được,
        // đang kẹt sẵn — lọt vào bệ móng, sinh ra trong vật — thì được thoát ra)
        function colStepOK(M, x0, z0, x1, z1, ang) {
          const h1 = colFH(M, x1, z1, ang);
          let ok = true;
          if (h1 > 0) ok = h1 <= colFH(M, x0, z0, ang) + 1e-6;
          if (ok && COL.movers.length) { const m1 = colMoverHits(M, x1, z1, ang); if (m1 > 1e-3) ok = m1 <= colMoverHits(M, x0, z0, ang) + 1e-4; }
          return ok;
        }
        // ---- bước có va chạm: thử đi thẳng; vướng thì men theo (lệch ±0,4 / ±0,8 / ±1,2 rad, bước ngắn dần) → [x, z, độ lệch] hoặc null (đứng lại).
        //      bước ngang 90° khi bị chặn thẳng mặt. Kẹt liền > 1,5 s thì cho xuyên 2 s (vật cản lạ không làm con vật đứng chết — như logic "unstuck"
        //      của AI trong game) ----
        const COL_SLIDE = [0, 0.4, -0.4, 0.8, -0.8, 1.2, -1.2];
        function colStuck(M, dt) { if ((M.stuck = (M.stuck || 0) + dt) > 1.5) { M.ghost = 2; M.stuck = 0; } }
        function colSlide(M, x0, z0, ang, step, dt) {
          if (!COL.ready || M.ghost > 0) return [x0 + Math.cos(ang) * step, z0 + Math.sin(ang) * step, 0];
          for (const off of COL_SLIDE) {
            const a = ang + off, s = step * Math.cos(off * 0.8), x1 = x0 + Math.cos(a) * s, z1 = z0 + Math.sin(a) * s;
            if (colStepOK(M, x0, z0, x1, z1, ang)) { M.stuck = 0; return [x1, z1, off]; }
          }
          // chặn thẳng mặt (cột mảnh — chân mái hiên xe 12 cm, góc tường ngay trước mũi): mọi hướng còn thành phần tiến đều lấn sâu hơn ⇒ bước ngang 90°
          // (giữ bên đã chọn lần trước, khỏi lắc qua lại) tới khi hướng tiến thoáng
          const sd = M.sd || 1;
          for (const off of [1.5708 * sd, -1.5708 * sd]) {
            const a = ang + off, s = step * 0.35, x1 = x0 + Math.cos(a) * s, z1 = z0 + Math.sin(a) * s;
            if (colStepOK(M, x0, z0, x1, z1, ang)) { M.stuck = 0; M.sd = Math.sign(off); return [x1, z1, off]; }
          }
          colStuck(M, dt); return null;
        }
        // lượt xuyên là đồng hồ THỜI GIAN (main-loop gọi mỗi khung cho mọi con — trước đây chỉ giảm khi con vật đang bước ⇒ bò đứng gặm cỏ giữ lượt
        // xuyên cả phút, xoay tự do vào thân cây). Hết giờ mà thân còn lấn trong vật ⇒ đi nốt (thêm từng 0,25 s, tối đa 2 s)
        function colTick(dt) {
          for (const M of COL.movers) {
            if (!(M.ghost > 0) || (M.ghost -= dt) > 0) continue;
            if ((M.gext = (M.gext || 0) + 0.25) <= 2 && colFH(M, M.x(), M.z(), M.ang()) > 0) M.ghost = 0.25; else M.gext = 0;
          }
        }
        // xoay tại chỗ: thân dài (bò, hươu) quét vào thân cây / cột / con bên cạnh ⇒ chỉ xoay nếu không lấn sâu hơn — cho CHẠM NHẸ (≤ 4% dấu chân,
        // ≤ 5 cm với con khác): bò gặm cỏ trên mặt đập cách lan can 0,95 m vẫn quay người được (mõm quệt lan can), không thành "kẹt"
        function colFootW(M) {   // tổng trọng số mẫu của dấu chân (độ lấn khi cả dấu chân nằm trong vật)
          if (M.W === undefined) { const na = Math.max(1, Math.round(M.a / COL.C)), nb = Math.max(1, Math.round(M.b / COL.C)); M.W = 0; for (let i = -na; i <= na; i++) for (let j = -nb; j <= nb; j++) { const u = i / na, v = j / nb; if ((M.a > 1.5 * M.b ? u ** 4 + v ** 4 : u * u + v * v) <= 1) M.W += 1 - 0.9 * Math.min(1, u * u + v * v); } }
          return M.W;
        }
        function colTurnOK(M, x, z, a0, a1) {
          if (!COL.ready || M.ghost > 0 || Math.abs(a1 - a0) < 1e-4) return true;
          const mk = M.mask(), h1 = colFH(M, x, z, a1, mk);
          if (h1 > 0.04 * colFootW(M) && h1 > colFH(M, x, z, a0, mk) + 1e-6) return false;
          if (COL.movers.length) { const m1 = colMoverHits(M, x, z, a1); if (m1 > 0.05 && m1 > colMoverHits(M, x, z, a0) + 1e-4) return false; }
          return true;
        }
        // thoát kẹt (bước "depenetration" của character controller): thân lấn > 2% vào vật (G 19/10: 8% ⇒ bò / hươu đứng ăn, nằm nghỉ vẫn lấn thân cây) (sau lượt xuyên, bị đặt / sinh ra trong vật) mà không
        // trong lượt xuyên ⇒ đẩy dần ra phía thoáng nhất trong 8 hướng (≤ 0,6 m/s) → [x, z] hoặc null. Đang thoáng thì 4 lần/giây mới dò
        function colPushOut(M, x, z, ang, dt) {
          if (!COL.ready || M.ghost > 0 || !M.on()) return null;
          if (!M.pin && (M.pt = (M.pt || 0) - dt) > 0) return null;
          const mk = M.mask(), f = (px, pz) => colFH(M, px, pz, ang, mk), h0 = f(x, z);
          if (h0 <= 0.02 * colFootW(M)) { M.pin = false; M.pt = 0.25; return null; }
          let bx = 0, bz = 0, bh = h0;
          for (let k = 0; k < 8; k++) { const dx = Math.cos(k * Math.PI / 4), dz = Math.sin(k * Math.PI / 4), h = f(x + dx * 0.25, z + dz * 0.25); if (h < bh) { bh = h; bx = dx; bz = dz; } }
          M.pin = bh < h0; if (!M.pin) { M.pt = 0.25; return null; }
          return [x + bx * 0.6 * dt, z + bz * 0.6 * dt];
        }
        // LƯỚI THẬT không lấn vật (G 19/10 "check mesh của tất cả động vật sẽ ko va chạm vào các vật khác"): dấu chân lấy mẫu ô 12,5 cm theo khối thân to nhất
        //  bỏ sót đầu / cổ / đuôi và vật mảnh (thanh lan can bệ tua-bin, chân giá treo nồi) ⇒ 4 lần/giây thử đỉnh lưới THẬT (cách 1 đỉnh lấy 1) của bò, hươu, chó:
        //  đỉnh cao hơn mặt đứng ≥ 12 cm mà lọt trong khoảng đặc (lớp 0–2; cành thấp thì cho chạm) ⇒ đẩy con vật ra xa trọng tâm các điểm lấn 0,1 m / lần
        const COL_MESH = [];
        function colMeshAdd(root, M, get, set) { const P = []; root.traverse(o => { if (o.isMesh && !o.isInstancedMesh && o.geometry.attributes.position) for (let i = 0; i < o.geometry.attributes.position.count; i += 2) P.push(o, i); }); COL_MESH.push({ M, get, set, P, t: Math.random() * 0.25 }); }
        function colMeshTick(dt) {
          for (const S of COL_MESH) {
            if ((S.t -= dt) > 0 || !S.M.on() || S.M.ghost > 0) continue; S.t = 0.25;
            const mk = S.M.mask() & 7; let hx = 0, hz = 0, n = 0;
            for (let k = 0; k < S.P.length; k += 2) { const o = S.P[k], a = o.geometry.attributes.position; if (!a.array) continue; _clV.fromBufferAttribute(a, S.P[k + 1]).applyMatrix4(o.matrixWorld);
              if (_clV.y > colWalkY(_clV.x, _clV.z, _clV.y, 0) + 0.12 && colHit(mk, _clV.x, _clV.z, _clV.y - 0.02, _clV.y + 0.02)) { hx += _clV.x; hz += _clV.z; n++; } }
            if (!n) continue; const [x, z] = S.get(), dx = x - hx / n, dz = z - hz / n, d = Math.hypot(dx, dz) || 1; S.set(x + dx / d * 0.1, z + dz / d * 0.1);
          }
        }
        function colDims(root, pick) {   // khối thân lớn nhất (hệ gốc con vật): nửa dài a theo +x (mũi), nửa rộng b theo z, đỉnh / đáy — đv thế giới
          root.updateWorldMatrix(true, true);
          const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), M = new THREE.Matrix4(), B = new THREE.Box3(); let best = null, bv = 0;
          root.traverse(o => { if (!o.isMesh || (pick && !pick(o))) return; const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox(); const b = g.boundingBox.clone().applyMatrix4(M.multiplyMatrices(inv, o.matrixWorld)), s = b.getSize(_clV), v = s.x * s.y * s.z; if (v > bv) { bv = v; best = b; } });
          const S = root.scale.y; B.copy(best); const cx = (B.min.x + B.max.x) / 2, cz = (B.min.z + B.max.z) / 2;
          return { a: Math.max(B.max.x - cx, B.max.z - cz) * S, b: Math.min(B.max.x - cx, B.max.z - cz) * S, top: B.max.y * S, bot: B.min.y * S, ox: cx * S };
        }
        // ---- đăng ký các con vật (nửa dài/rộng dấu chân, dải cao [đất + lo, đất + hi], lớp va chạm) ----
        const COL_M = {};
        {
          const m = (o) => colMoverAdd(Object.assign({ stuck: 0, ghost: 0, ignore: null, mask: () => 7 }, o));
          cows.forEach(c => { const D = colDims(c.g.userData.torso || c.g), S = c.g.scale.y;
            // dấu chân kéo dài ra trước phủ cả CỔ + ĐẦU (G 19/10 kiểm lưới thú: bò nằm dưới tán, đầu / cổ lấn vào thân cây) · dải cao tới LƯNG bò (~1,6 m × cỡ con; bản đầu lấy đỉnh thân theo hệ toạ độ của thân ⇒ chỉ tới 1,13–1,26 m, cành ngang lưng xuyên qua) + lớp cành thấp
            c.col = m({ kind: 'cow', a: D.a + 0.55 * S, ox: 0.45 * S, b: D.b, lo: 0.3 * S, hi: 1.6 * S, w: 4, x: () => c.x, z: () => c.z, ang: () => c.ang, on: () => c.g.visible,
              mask: () => (c.state === 'scratch' && c.rub && c.rub.st === 'rub') ? 0 : c.mode === 'home' || (c.state === 'drink' && c.sub2 !== 'go') || (c.state === 'drink' && Math.hypot(cowHut.x + cowHut.W / 2 + 2.4 - c.x, cowHut.z + 0.75 - c.z) < 3.5) ? 9 : 13 }); });   // vào ô chuồng / tới máng: bỏ lớp chuồng (lộ trình riêng)
          for (const c of cows) colMeshAdd(c.g, c.col, () => [c.x, c.z], (x, z) => { if (cowOK(x, z)) { c.x = x; c.z = z; } });
          if (stag) { const D = colDims(stag.g, o => !/chân|leg|móng|hoof/i.test(o.name)); stag.col = m({ kind: 'deer', a: D.a + 0.3, ox: 0.25, b: D.b, lo: 0.35, hi: 1.75, w: 2, x: () => stag.x, z: () => stag.z, ang: () => -stag.g.rotation.y, on: () => stag.g.visible }); }
          { const D = colDims(dogObj.userData.torso); COL_M.dog = m({ kind: 'dog', a: D.a + 0.12, b: D.b, ox: D.ox, lo: 0.12, hi: Math.max(0.68, D.top), w: 1, x: () => dogObj.position.x, z: () => dogObj.position.z, ang: () => -dogObj.rotation.y, on: () => !dogRain.st,
            ignore: o => o.kind === 'eng' && (engPetting || !!dogBrain.state.patAt || engObj.phase === 'toDog' || engObj.phase === 'pet') }); }
          if (stag) colMeshAdd(stag.g, stag.col, () => [stag.x, stag.z], (x, z) => { stag.x = x; stag.z = z; });
          colMeshAdd(dogObj, COL_M.dog, () => [dogObj.position.x, dogObj.position.z], (x, z) => { dogObj.position.x = x; dogObj.position.z = z; });
          { const D = colDims(raccoonObj.userData.torso); COL_M.rac = m({ kind: 'rac', a: D.a + 0.1, b: D.b, ox: D.ox + 0.05, lo: 0.1, hi: Math.max(0.35, D.top), w: 1, x: () => raccoonObj.position.x, z: () => raccoonObj.position.z, ang: () => -raccoonObj.rotation.y, on: () => raccoonObj.visible, mask: () => /^(den|exit|enter|out|toMouth)$/.test(raccoonBrain.state.st) || Math.hypot(raccoonObj.position.x - racHome.x, raccoonObj.position.z - racHome.z) < 2.5 ? 0 : 7 }); }   // chui ra / vào hang (khúc gỗ rỗng dài 7,6 m — trước chỉ bỏ trong 2,5 m quanh giữa ⇒ kẹt ở 2 đầu gỗ) và đoạn miệng hang ↔ bãi: lộ trình riêng
          bunnies.forEach(b => { const D = colDims(b.g); b.col = m({ kind: 'bunny', a: D.a, b: D.b, lo: 0.12, hi: Math.max(0.5, D.top), w: 0.5, x: () => b.x, z: () => b.z, ang: () => b.ang, on: () => b.g.visible, mask: () => b.shelter ? 5 : 7 }); });   // trú mưa sát vách xe: bỏ lớp xe
          COL_M.eng = m({ kind: 'eng', a: 0.24, b: 0.24, lo: 0.25, hi: 1.85, w: 2, x: () => engObj.g.position.x, z: () => engObj.g.position.z, ang: () => 0, on: () => !engObj.inVan && engObj.g.parent === scene && engObj.phase !== 'van',
            mask: () => Math.hypot(engObj.g.position.x - dogDoorStep.x, engObj.g.position.z - dogDoorStep.z) < 1.3 ? 5 : 7,   // sát bậc cửa xe (bậc cao 26 cm lọt vào dải va chạm): bỏ lớp xe, lộ trình lên xuống bậc riêng
            ignore: o => o.kind === 'dog' && (engPetting || !!dogBrain.state.patAt || engObj.phase === 'toDog' || engObj.phase === 'pet') });
          birds.forEach(b => { if (b.m && b.foot) b.col = m({ kind: 'stork', a: 0.48, b: 0.22, lo: 0.5, hi: 1.4, w: 1, x: () => b.foot.x, z: () => b.foot.z, ang: () => Math.PI / 2 - b.m.rotation.y, on: () => b.m.visible && b.state === 'wade' }); });   // cò lội: chỉ tránh nhau (mặt nước không có vật tĩnh)
        }
        // đỉnh mặt đứng thấp tại (x, z): khoảng đặc có đỉnh cao [lo, hi] trên mặt đất, phía trên thoáng ≥ clear (đứng lên được) → độ cao tuyệt đối hoặc null
        function colTopAt(x, z, lo, hi, clear, mask = 7) {
          if (!COL.ready) return null; const g = cowY(x, z); let top = null;
          for (let L = 0; L < 3; L++) { if (!(mask >> L & 1) || !colCell(L, x, z)) continue; const Y = _colT.y, a = _colT.off[_colI], e = _colT.off[_colI + 1];
            for (let k = a; k < e; k += 2) { const t = Y[k + 1] / 100; if (t - g < lo || t - g > hi) continue; let free = true; for (let q = a; q < e; q += 2) if (Y[q] / 100 > t + 0.02 && Y[q] / 100 < t + clear) { free = false; break; } if (free && (top === null || t > top)) top = t; } }
          return top;
        }
