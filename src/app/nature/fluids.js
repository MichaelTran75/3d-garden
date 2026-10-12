        // ===== CHẤT LỎNG — Navier–Stokes dạng rút gọn, chạy ở LUỒNG PHỤ (Web Worker dựng từ Blob, không cần tệp ngoài) =====
        //  1) NƯỚC NÔNG (Saint-Venant = Navier–Stokes lấy trung bình theo độ sâu) trên lưới trùng ô khối địa hình (0,6 m):
        //     độ sâu h ở tâm ô, vận tốc u, v ở mặt ô (lưới so le). Mỗi bước: cuốn vận tốc theo chính nó (bán Lagrange) → mực nước đổi theo
        //     thông lượng (độ sâu lấy phía ngược dòng) → gia tốc theo độ dốc mặt nước (g = 9,81) + ma sát đáy + lớp hút sóng sát biên mở.
        //     Hồ trên đập gần lặng, trôi rất nhẹ về đập; dưới đập 3 cửa xả phụt nước (mực dâng nhẹ) → nước tự tỏa, cuộn xoáy dọc bờ, chảy về hạ lưu.
        //     Bọt chỉ sinh khi có vật khuấy nước (cá đớp, phao, cò lội), trôi theo dòng rồi tan; vật chạm nước gây sóng lan, dội bờ.
        //     Mỗi khung trả về (độ cao mặt · vận tốc · bọt) dạng half-float → texture cho shader mặt nước + đọc trên CPU cho lá, cá, phao.
        //  2) KHÓI & HƠI NƯỚC ("stable fluids" của Stam, 2D trên tấm đứng luôn quay về phía camera): khói bếp lửa + hơi ấm reo.
        //     Nổi vì nóng, bị gió thật (thành phần ngang trong mặt tấm) cuốn, xoáy nhờ "vorticity confinement", chiếu áp suất để không nén được.
        function fluidKernel() {   // JS thuần, không đọc biến bên ngoài → chạy được trong Worker lẫn trên luồng chính (dự phòng)
          const f32 = new Float32Array(1), i32 = new Int32Array(f32.buffer);
          function toHalf(val) {
            f32[0] = val; const x = i32[0];
            let bits = (x >> 16) & 0x8000, m = (x >> 12) & 0x07ff; const e = (x >> 23) & 0xff;
            if (e < 103) return bits;
            if (e > 142) return bits | 0x7c00;
            if (e < 113) { m |= 0x0800; return bits | ((m >> (114 - e)) + ((m >> (113 - e)) & 1)); }
            bits |= ((e - 112) << 10) | (m >> 1); return bits + (m & 1);
          }
          function bil(arr, w, h, fx, fz) {   // nội suy song tuyến trên lưới w × h (toạ độ theo ô, kẹp trong lưới)
            fx = fx < 0 ? 0 : fx > w - 1.0001 ? w - 1.0001 : fx; fz = fz < 0 ? 0 : fz > h - 1.0001 ? h - 1.0001 : fz;
            const a = fx | 0, b = fz | 0, tx = fx - a, tz = fz - b, c = b * w + a;
            return (arr[c] * (1 - tx) + arr[c + 1] * tx) * (1 - tz) + (arr[c + w] * (1 - tx) + arr[c + w + 1] * tx) * tz;
          }

          // ---------------- 1) NƯỚC NÔNG ----------------
          const G = 9.81, WSTEP = 1 / 60;
          let W = null;
          function initWater(g) {
            const { nx, nz, dx, mask, kind, bed, target, rest, jets, u0, v0 } = g, N = nx * nz;
            const h = new Float32Array(N), cells = [], uf = [], vf = [];
            for (let c = 0; c < N; c++) if (mask[c]) { h[c] = Math.max(0.05, target[c] - bed[c]); cells.push(c); }
            for (let b = 0; b < nz; b++) for (let a = 1; a < nx; a++) if (mask[b * nx + a - 1] && mask[b * nx + a]) uf.push(b * (nx + 1) + a);
            for (let b = 1; b < nz; b++) for (let a = 0; a < nx; a++) if (mask[(b - 1) * nx + a] && mask[b * nx + a]) vf.push(b * nx + a);
            // lớp hút sóng: hệ số cản tăng dần trong ~8 ô sát biên mở (sóng chạy ra khỏi bản đồ không dội ngược)
            const sponge = new Float32Array(N), dist = new Int16Array(N).fill(99), q = [];
            for (let c = 0; c < N; c++) if (kind[c] === 1) { dist[c] = 0; q.push(c); }
            for (let k = 0; k < q.length; k++) {
              const c = q[k], d = dist[c]; if (d >= 8) continue;
              for (const n of [c - 1, c + 1, c - nx, c + nx]) if (n >= 0 && n < N && mask[n] && dist[n] > d + 1) { dist[n] = d + 1; q.push(n); }
            }
            for (let c = 0; c < N; c++) if (dist[c] < 9) sponge[c] = 2.5 * (1 - dist[c] / 9) ** 2;
            const u = new Float32Array((nx + 1) * nz), v = new Float32Array(nx * (nz + 1));
            if (u0) { for (const f of uf) u[f] = u0[f]; for (const f of vf) v[f] = v0[f]; }
            W = { nx, nz, dx, mask, kind, bed, target, rest, jets: Int32Array.from(jets.faces), jetV: Float32Array.from(jets.speeds), h, h2: new Float32Array(N),
              u, u2: new Float32Array((nx + 1) * nz), v, v2: new Float32Array(nx * (nz + 1)),
              foam: new Float32Array(N), foam2: new Float32Array(N), cells: Int32Array.from(cells), uf: Int32Array.from(uf), vf: Int32Array.from(vf), sponge, acc: 0 };
          }
          function splashWater(imp, n) {   // imp: [x, z (ô), bán kính (ô), cường độ] — mặt nước lõm xuống rồi tự dội thành sóng tròn lan ra
            const { nx, nz, mask, kind, h, foam } = W;
            for (let k = 0; k < n; k++) {
              const cx = imp[k * 4], cz = imp[k * 4 + 1], r = Math.max(0.6, imp[k * 4 + 2]), s = imp[k * 4 + 3];
              for (let b = Math.max(0, Math.floor(cz - r)); b <= Math.min(nz - 1, Math.ceil(cz + r)); b++)
                for (let a = Math.max(0, Math.floor(cx - r)); a <= Math.min(nx - 1, Math.ceil(cx + r)); a++) {
                  const c = b * nx + a; if (!mask[c] || kind[c]) continue;
                  const d = Math.hypot(a + 0.5 - cx, b + 0.5 - cz) / r; if (d >= 1) continue;
                  const w = (1 - d) * (1 - d); h[c] = Math.max(0.05, h[c] - s * w); foam[c] = Math.min(1.5, foam[c] + s * w * 4);
                }
            }
          }
          function stepWater(dt, windX, windZ) {
            const { nx, nz, dx, kind, bed, target, h, sponge, cells, uf, vf, jets, jetV } = W;
            let { u, v, u2, v2, h2, foam, foam2 } = W;
            const idx = 1 / dx, vmax = 0.45 * dx / dt, nx1 = nx + 1;
            // 1) cuốn vận tốc theo chính nó (bán Lagrange) — tạo xoáy sau chỗ bờ lồi, dòng uốn theo lòng sông
            for (let k = 0; k < uf.length; k++) {
              const f = uf[k], b = (f / nx1) | 0, a = f - b * nx1, uu = u[f], vv = bil(v, nx, nz + 1, a - 0.5, b + 0.5);
              u2[f] = bil(u, nx1, nz, a - dt * uu * idx, b - dt * vv * idx);
            }
            for (let k = 0; k < vf.length; k++) {
              const f = vf[k], b = (f / nx) | 0, a = f - b * nx, uu = bil(u, nx1, nz, a + 0.5, b - 0.5), vv = v[f];
              v2[f] = bil(v, nx, nz + 1, a - dt * uu * idx, b - dt * vv * idx);
            }
            [u, u2] = [u2, u]; [v, v2] = [v2, v];
            for (let k = 0; k < jets.length; k++) v[jets[k]] = jetV[k];   // cửa xả: nước phụt ra hạ lưu
            // 2) mực nước theo thông lượng (độ sâu lấy phía ngược dòng → ổn định, bảo toàn khối nước)
            for (let k = 0; k < cells.length; k++) {
              const c = cells[k];
              if (kind[c]) { h2[c] = target[c] - bed[c]; continue; }   // biên mở / cửa xả / mép hồ sát đập: giữ mực
              const b = (c / nx) | 0, a = c - b * nx, fl = b * nx1 + a, uL = u[fl], uR = u[fl + 1], vB = v[c], vT = v[c + nx];
              const flux = uR * (uR > 0 ? h[c] : h[c + 1]) - uL * (uL > 0 ? h[c - 1] : h[c]) + vT * (vT > 0 ? h[c] : h[c + nx]) - vB * (vB > 0 ? h[c - nx] : h[c]);
              h2[c] = Math.max(0.05, h[c] - dt * idx * flux);
            }
            const ht = W.h; W.h = h2; W.h2 = ht;
            const H = h2;
            // 3) gia tốc theo độ dốc mặt nước + cản (tuyến tính · ma sát đáy bậc 2 · lớp hút sóng) + gió kéo mặt nước (~3% tốc độ gió)
            for (let k = 0; k < uf.length; k++) {
              const f = uf[k], b = (f / nx1) | 0, a = f - b * nx1, cR = b * nx + a, cL = cR - 1;
              let uu = u[f] - G * dt * idx * (bed[cR] + H[cR] - bed[cL] - H[cL]);
              const hf = 0.5 * (H[cL] + H[cR]), damp = 0.04 + 0.5 * (sponge[cL] + sponge[cR]) + 0.012 * Math.abs(uu) / hf;
              uu = (uu + dt * windX) / (1 + dt * damp); u[f] = uu > vmax ? vmax : uu < -vmax ? -vmax : uu;
            }
            for (let k = 0; k < vf.length; k++) {
              const f = vf[k], cT = f, cB = f - nx;
              let vv = v[f] - G * dt * idx * (bed[cT] + H[cT] - bed[cB] - H[cB]);
              const hf = 0.5 * (H[cB] + H[cT]), damp = 0.04 + 0.5 * (sponge[cB] + sponge[cT]) + 0.012 * Math.abs(vv) / hf;
              vv = (vv + dt * windZ) / (1 + dt * damp); v[f] = vv > vmax ? vmax : vv < -vmax ? -vmax : vv;
            }
            for (let k = 0; k < jets.length; k++) v[jets[k]] = jetV[k];
            // 4) bọt do vật khuấy nước (cú chạm): trôi theo dòng, tan dần (~4 s) — không tự sinh ở cửa xả hay chỗ nước xiết
            const keep = Math.exp(-dt / 4);
            for (let k = 0; k < cells.length; k++) {
              const c = cells[k], b = (c / nx) | 0, a = c - b * nx;
              const U = 0.5 * (u[b * nx1 + a] + u[b * nx1 + a + 1]), V = 0.5 * (v[c] + v[c + nx]);
              foam2[c] = kind[c] === 2 ? 0 : Math.min(1.2, bil(foam, nx, nz, a - dt * U * idx, b - dt * V * idx) * keep);
            }
            W.u = u; W.u2 = u2; W.v = v; W.v2 = v2; W.foam = foam2; W.foam2 = foam;
          }
          function encodeWater(out) {   // RGBA half-float mỗi ô: độ cao mặt so với mực tĩnh · vận tốc x · vận tốc z · bọt
            const { nx, nz, mask, bed, rest, h, u, v, foam } = W, nx1 = nx + 1;
            for (let b = 0, c = 0; b < nz; b++) for (let a = 0; a < nx; a++, c++) {
              const o = c * 4;
              if (!mask[c]) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; continue; }
              out[o] = toHalf(bed[c] + h[c] - rest[c]); out[o + 1] = toHalf(0.5 * (u[b * nx1 + a] + u[b * nx1 + a + 1]));
              out[o + 2] = toHalf(0.5 * (v[c] + v[c + nx])); out[o + 3] = toHalf(foam[c]);
            }
            return out;
          }

          // ---------------- 2) KHÓI / HƠI NƯỚC ----------------
          const plumes = new Map();
          function addPlume(id, o) {
            const N = o.nx * o.ny, F = () => new Float32Array(N);
            plumes.set(id, Object.assign({ cs: o.w / o.nx, u: F(), v: F(), u2: F(), v2: F(), s: F(), q: F(), T: F(), s2: F(), q2: F(), T2: F(), p: F(), dv: F(), cu: F(), seed: 12345 }, o));
          }
          function stepPlume(P, dt, prm) {
            const { nx, ny, cs } = P, idx = 1 / cs;
            let { u, v, u2, v2, s, q, T, s2, q2, T2 } = P;
            const rnd = () => { P.seed = (Math.imul(P.seed, 1664525) + 1013904223) >>> 0; return P.seed / 4294967296; };
            // nguồn: [x, y (ô), bán kính (ô), khói/s, nhiệt/s, hơi/s, vx, vy (đv/s)] — vận tốc nguồn rung ngẫu nhiên → luồng khói không đều
            for (const S of prm.src) {
              const [sx, sy, r, rs, rh, rq, vx, vy] = S, jx = (rnd() - 0.5) * P.jitter, jy = (rnd() - 0.5) * P.jitter;
              for (let j = Math.max(0, Math.floor(sy - r)); j <= Math.min(ny - 1, Math.ceil(sy + r)); j++)
                for (let i = Math.max(0, Math.floor(sx - r)); i <= Math.min(nx - 1, Math.ceil(sx + r)); i++) {
                  const d = Math.hypot(i - sx, j - sy) / r; if (d >= 1) continue;
                  const w = 1 - d * d, c = j * nx + i;
                  s[c] += rs * w * dt; T[c] += rh * w * dt; q[c] += rq * w * dt;
                  u[c] += (vx + jx - u[c]) * Math.min(1, w * dt * 8); v[c] += (vy + jy - v[c]) * Math.min(1, w * dt * 8);
                }
            }
            // lực: nổi (nóng lên, khói nặng xuống) · gió ngang theo độ cao kéo luồng khói · xoáy (vorticity confinement)
            const kw = Math.min(1, P.windDrag * dt);
            for (let j = 0; j < ny; j++) {
              const amb = prm.wind0 + (prm.wind1 - prm.wind0) * j / (ny - 1);
              for (let i = 0, c = j * nx; i < nx; i++, c++) { v[c] += dt * (P.buoy * T[c] - P.weight * s[c]); u[c] += (amb - u[c]) * kw * (0.35 + 0.65 * j / ny); }
            }
            const cu = P.cu;
            for (let j = 1; j < ny - 1; j++) for (let i = 1, c = j * nx + 1; i < nx - 1; i++, c++) cu[c] = 0.5 * (v[c + 1] - v[c - 1] - u[c + nx] + u[c - nx]);
            for (let j = 2; j < ny - 2; j++) for (let i = 2, c = j * nx + 2; i < nx - 2; i++, c++) {
              const gx = Math.abs(cu[c + 1]) - Math.abs(cu[c - 1]), gy = Math.abs(cu[c + nx]) - Math.abs(cu[c - nx]), l = Math.hypot(gx, gy) + 1e-5;
              u[c] += dt * P.vort * (gy / l) * cu[c]; v[c] -= dt * P.vort * (gx / l) * cu[c];
            }
            // cuốn vận tốc (bán Lagrange); ngoài mép lấy giá trị mép (gió vào/ra tự nhiên)
            for (let j = 0, c = 0; j < ny; j++) for (let i = 0; i < nx; i++, c++) {
              const x = i - dt * u[c] * idx, y = j - dt * v[c] * idx;
              u2[c] = bil(u, nx, ny, x, y); v2[c] = bil(v, nx, ny, x, y);
            }
            [u, u2] = [u2, u]; [v, v2] = [v2, v];
            for (let i = 0; i < nx; i++) if (v[i] < 0) v[i] = 0;   // mặt đất: khói không chui xuống
            // chiếu áp suất (Gauss–Seidel): mép trên/2 bên mở (p = 0), đáy kín
            const p = P.p, dv = P.dv;
            for (let j = 0, c = 0; j < ny; j++) for (let i = 0; i < nx; i++, c++) {
              const uR = i < nx - 1 ? u[c + 1] : u[c], uL = i > 0 ? u[c - 1] : u[c], vT = j < ny - 1 ? v[c + nx] : v[c], vB = j > 0 ? v[c - nx] : -v[c];
              dv[c] = 0.5 * (uR - uL + vT - vB); p[c] = 0;
            }
            for (let it = 0; it < P.iters; it++) for (let j = 0, c = 0; j < ny; j++) for (let i = 0; i < nx; i++, c++) {
              const pl = i > 0 ? p[c - 1] : 0, pr = i < nx - 1 ? p[c + 1] : 0, pb = j > 0 ? p[c - nx] : p[c], pt = j < ny - 1 ? p[c + nx] : 0;
              p[c] = (pl + pr + pb + pt - dv[c]) * 0.25;
            }
            for (let j = 0, c = 0; j < ny; j++) for (let i = 0; i < nx; i++, c++) {
              const pl = i > 0 ? p[c - 1] : 0, pr = i < nx - 1 ? p[c + 1] : 0, pb = j > 0 ? p[c - nx] : p[c], pt = j < ny - 1 ? p[c + nx] : 0;
              u[c] -= 0.5 * (pr - pl); v[c] -= 0.5 * (pt - pb);
            }
            // cuốn khói · hơi · nhiệt theo dòng; ngoài mép coi như không khí sạch; tan dần
            const ks = Math.exp(-dt / P.tauS), kq = Math.exp(-dt / P.tauQ), kt = Math.exp(-dt / P.tauT);
            const sampleS = (a, x, y) => (x < -0.5 || y < -0.5 || x > nx - 0.5 || y > ny - 0.5) ? 0 : bil(a, nx, ny, x, y);
            for (let j = 0, c = 0; j < ny; j++) for (let i = 0; i < nx; i++, c++) {
              const x = i - dt * u[c] * idx, y = j - dt * v[c] * idx;
              s2[c] = sampleS(s, x, y) * ks; q2[c] = sampleS(q, x, y) * kq; T2[c] = sampleS(T, x, y) * kt;
            }
            Object.assign(P, { u, v, u2, v2, s: s2, s2: s, q: q2, q2: q, T: T2, T2: T });
          }
          function encodePlume(P, out) {   // RGBA8: khói · hơi nước/sương · nhiệt
            const { s, q, T } = P;
            for (let c = 0, o = 0; c < s.length; c++, o += 4) { out[o] = Math.min(255, s[c] * 255) | 0; out[o + 1] = Math.min(255, q[c] * 255) | 0; out[o + 2] = Math.min(255, T[c] * 128) | 0; out[o + 3] = 255; }
            return out;
          }

          // ---------------- giao tiếp ----------------
          function handle(m) {
            if (m.t === 'water') { initWater(m.grid); for (let t = 0; t < m.warm; t += WSTEP) stepWater(WSTEP, 0, 0); return null; }   // chạy trước ~40 s cho dòng ổn định
            if (m.t === 'plume') { addPlume(m.id, m.cfg); return null; }
            if (m.t !== 'step') return null;
            const transfer = [], res = { t: 'out', plumes: {} };
            if (W) {
              splashWater(m.imp, m.nImp);
              W.acc = Math.min(W.acc + m.dt, 0.1);
              while (W.acc >= WSTEP) { stepWater(WSTEP, m.wind[0], m.wind[1]); W.acc -= WSTEP; }
              const buf = m.bufs.water && m.bufs.water.byteLength === W.nx * W.nz * 8 ? new Uint16Array(m.bufs.water) : new Uint16Array(W.nx * W.nz * 4);
              res.water = encodeWater(buf).buffer; transfer.push(res.water);
            }
            for (const [id, prm] of Object.entries(m.plumes)) {
              const P = plumes.get(id); if (!P) continue;
              const step = 1 / 30; P.acc = Math.min((P.acc || 0) + m.dt, 0.1);
              while (P.acc >= step) { stepPlume(P, step, prm); P.acc -= step; }
              const b = m.bufs[id], buf = b && b.byteLength === P.nx * P.ny * 4 ? new Uint8Array(b) : new Uint8Array(P.nx * P.ny * 4);
              res.plumes[id] = encodePlume(P, buf).buffer; transfer.push(res.plumes[id]);
            }
            return { msg: res, transfer };
          }
          return { handle };
        }

        fluids = (() => {
          // ---- lưới nước: hộp bao mọi ô nước (+1 ô viền), ô = 1 khối địa hình ----
          let i0 = 1e9, i1 = -1e9, j0 = 1e9, j1 = -1e9;
          for (let j = -MZ; j < GZ + MZ; j++) for (let i = -MX; i < GX + MX; i++) if (waterCell(i, j)) { if (i < i0) i0 = i; if (i > i1) i1 = i; if (j < j0) j0 = j; if (j > j1) j1 = j; }
          i0--; i1++; j0--; j1++;
          const nx = i1 - i0 + 1, nz = j1 - j0 + 1, N = nx * nz, dx = BLOCK, x0 = wx(i0) - dx / 2, z0 = wz(j0) - dx / 2;
          const mask = new Uint8Array(N), kind = new Uint8Array(N), bed = new Float32Array(N), target = new Float32Array(N), rest = new Float32Array(N), wCells = [];
          for (let b = 0; b < nz; b++) for (let a = 0; a < nx; a++) {
            const i = i0 + a, j = j0 + b, c = b * nx + a;
            if (!waterCell(i, j)) continue;
            mask[c] = 1; wCells.push(c); bed[c] = riverBedY(i, j); target[c] = rest[c] = waterBaseY(j);
            if (i <= -MX || i >= GX + MX - 1 || j <= -MZ || j >= GZ + MZ - 1) { kind[c] = 1; target[c] += j < DAM_J ? 0.004 : -0.06; }   // mép bản đồ: biên mở (thượng nguồn hồ dâng rất nhẹ · cuối sông thấp hơn chút cho nước chảy ra)
            else if (j === DAM_J - 1) { kind[c] = 3; target[c] -= 0.004; }   // mép hồ sát đập: nước rút qua cửa lấy nước → hồ trôi rất chậm về đập
          }
          const jets = { faces: [], speeds: [] };
          for (const [ox, oz] of DAM_OUTLETS) {   // 3 cửa xả: ô nguồn giữ mực dâng 10 cm, mặt ô phía hạ lưu phụt 2,4 m/s
            const ca = Math.floor((ox - x0) / dx), cb = Math.floor((oz - z0) / dx);
            for (let db = -1; db <= 0; db++) for (let da = -1; da <= 1; da++) {
              const c = (cb + db) * nx + ca + da; if (!mask[c]) continue;
              kind[c] = 2; target[c] = waterBaseY(j0 + cb + db) + 0.1;
              if (db === 0 && da === 0 && mask[c + nx]) { jets.faces.push(c + nx); jets.speeds.push(2.2); }
            }
          }
          // vận tốc ban đầu theo công thức dòng chảy cũ (giữa lòng nhanh, sát bờ chậm; hồ gần lặng) → mô phỏng khởi động gần trạng thái ổn định
          const u0 = new Float32Array((nx + 1) * nz), v0 = new Float32Array(nx * (nz + 1));
          const flow0 = (fi, fj) => {
            const dc = riverC(fj + 0.5) - riverC(fj - 0.5), n = Math.hypot(dc, 1), hf = Math.max(1, riverHalf(fj)), d = Math.min(1, riverDist(fi, fj) / hf);
            const sp = (fj < DAM_J ? LAKE_U : RIVER_U * RHALF / hf) * Math.max(0.15, 1 - d * d); return [dc / n * sp, sp / n];
          };
          for (let b = 0; b < nz; b++) for (let a = 0; a <= nx; a++) u0[b * (nx + 1) + a] = flow0(i0 + a - 0.5, j0 + b)[0];
          for (let b = 0; b <= nz; b++) for (let a = 0; a < nx; a++) v0[b * nx + a] = flow0(i0 + a, j0 + b - 0.5)[1];
          // ---- texture kết quả + đọc trên CPU (song tuyến, khớp đúng phép lấy mẫu LinearFilter của GPU) ----
          const wTex = new THREE.DataTexture(new Uint16Array(N * 4), nx, nz, THREE.RGBAFormat, THREE.HalfFloatType);
          wTex.magFilter = wTex.minFilter = THREE.LinearFilter; wTex.generateMipmaps = false; wTex.needsUpdate = true; wTex.name = 'Mô phỏng nước nông';
          const P2 = Array.from({ length: 31 }, (_, e) => Math.pow(2, e - 15));
          const half = hv => { const e = (hv >> 10) & 0x1f, m = hv & 0x3ff, s = hv & 0x8000 ? -1 : 1; return e ? s * P2[e] * (1 + m / 1024) : s * m * 5.960464477539063e-8; };
          let wData = null, spareW = null;
          function sampleW(x, z, ch) {
            if (!wData) return 0;
            const fx = Math.min(nx - 1.0001, Math.max(0, (x - x0) / dx - 0.5)), fz = Math.min(nz - 1.0001, Math.max(0, (z - z0) / dx - 0.5));
            const a = fx | 0, b = fz | 0, tx = fx - a, tz = fz - b, c = (b * nx + a) * 4 + ch, r = nx * 4;
            return (half(wData[c]) * (1 - tx) + half(wData[c + 4]) * tx) * (1 - tz) + (half(wData[c + r]) * (1 - tx) + half(wData[c + r + 4]) * tx) * tz;
          }
          const water = { tex: wTex, ready: false, x0, z0, nx, nz, dx,
            height: (x, z) => sampleW(x, z, 0), flow(x, z, out) { out.x = sampleW(x, z, 1); out.z = sampleW(x, z, 2); return out; }, foam: (x, z) => sampleW(x, z, 3) };
          waterU.uSim.value = wTex; waterU.uSimBox.value.set(x0, z0, 1 / (nx * dx), 1 / (nz * dx)); waterU.uSimTexel.value.set(1 / nx, 1 / nz); waterU.uSimDx.value = dx;
          // ---- khói / hơi: tấm đứng quay về camera ----
          const plumeVS = `varying vec2 vUv;
            #include <fog_pars_vertex>
            void main() { vUv = uv; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
            }`;
          const plumeFS = `uniform sampler2D uDye; uniform vec3 uSmoke, uSteam, uGlow; uniform float uOpacity, uTime, uDetail, uFadeB;
            varying vec2 vUv;
            #include <fog_pars_fragment>
            float pHash(vec2 p) { vec3 q = fract(vec3(p.xyx) * 0.1031); q += dot(q, q.yzx + 33.33); return fract((q.x + q.y) * q.z); }
            float pNoise(vec2 p) { vec2 i = floor(p), f = fract(p), u = f * f * (3.0 - 2.0 * f); return mix(mix(pHash(i), pHash(i + vec2(1, 0)), u.x), mix(pHash(i + vec2(0, 1)), pHash(i + vec2(1, 1)), u.x), u.y); }
            void main() {
              vec4 d = texture2D(uDye, vUv);
              float det = 0.7 + 0.6 * pNoise(vUv * uDetail + vec2(0.0, -uTime * 0.5)) * pNoise(vUv * uDetail * 2.3 + vec2(uTime * 0.13, -uTime * 0.9));   // chi tiết mịn hơn ô lưới
              float a = (1.0 - exp(-(d.r * 2.6 + d.g * 2.2) * det)) * uOpacity;
              a *= smoothstep(0.0, 0.07, vUv.x) * smoothstep(1.0, 0.93, vUv.x) * smoothstep(1.0, 0.88, vUv.y) * smoothstep(0.0, uFadeB, vUv.y);   // mép tấm mờ dần (đáy: khỏi lộ đường cắt mặt nước)
              if (a < 0.004) discard;
              gl_FragColor = vec4(mix(uSmoke, uSteam, d.g / (d.r + d.g + 1e-3)) + uGlow * d.b * d.b * 4.0, a);
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
              #include <fog_fragment>
            }`;
          const plumes = new Map(), _pr = new THREE.Vector3(), _pf = new THREE.Vector3(), _pd = new THREE.Vector3();
          function addPlume(id, cfg, look) {   // cfg: lưới (nx, ny, w, h) + vật lý · look: màu, độ đục, chi tiết
            const tex = new THREE.DataTexture(new Uint8Array(cfg.nx * cfg.ny * 4), cfg.nx, cfg.ny, THREE.RGBAFormat);
            tex.magFilter = tex.minFilter = THREE.LinearFilter; tex.generateMipmaps = false; tex.needsUpdate = true;
            const mat = new THREE.ShaderMaterial({ vertexShader: plumeVS, fragmentShader: plumeFS, transparent: true, depthWrite: false, fog: true, toneMapped: false, side: THREE.DoubleSide,
              uniforms: Object.assign({ uDye: { value: tex }, uSmoke: { value: new THREE.Color() }, uSteam: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() },
                uOpacity: { value: look.opacity }, uTime: { value: 0 }, uDetail: { value: look.detail }, uFadeB: { value: look.fadeBottom ?? 0.02 } }, THREE.UniformsUtils.clone(THREE.UniformsLib.fog)) });
            const geo = new THREE.PlaneGeometry(cfg.w, cfg.h); geo.translate(0, cfg.h / 2, 0);
            const mesh = new THREE.Mesh(geo, mat); mesh.name = look.name; mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.raycast = () => {};
            mesh.userData.noRainOcc = mesh.userData.noBatch = true; scene.add(mesh);
            const P = { id, cfg, look, tex, mat, mesh, data: null, spare: null, base: new THREE.Vector3(), wind0: new THREE.Vector3(), wind1: new THREE.Vector3(), sources: [], on: true, right: new THREE.Vector3(1, 0, 0) };
            plumes.set(id, P); post({ t: 'plume', id, cfg });
            return P;
          }
          // ---- luồng phụ (dự phòng: chạy ngay trên luồng chính) ----
          let worker = null, local = null, busy = false, accDt = 0, url = null;
          const imp = new Float32Array(4 * 96); let nImp = 0;
          function onOut(m) {
            busy = false;
            if (m.water) { const arr = new Uint16Array(m.water); spareW = wData ? wData.buffer : null; wData = arr; wTex.image.data = arr; wTex.needsUpdate = true; if (!water.ready) { water.ready = true; waterU.uSimOn.value = 1; } }
            for (const [id, buf] of Object.entries(m.plumes || {})) {
              const P = plumes.get(id); if (!P) continue;
              const arr = new Uint8Array(buf); P.spare = P.data ? P.data.buffer : null; P.data = arr; P.tex.image.data = arr; P.tex.needsUpdate = true;
            }
          }
          function post(m, transfer) {
            if (worker) { worker.postMessage(m, transfer || []); return; }
            const r = local.handle(m); if (r) onOut(r.msg);
          }
          try {
            url = URL.createObjectURL(new Blob(['const K = (' + fluidKernel.toString() + ')(); onmessage = e => { const r = K.handle(e.data); if (r) postMessage(r.msg, r.transfer); };'], { type: 'text/javascript' }));
            worker = new Worker(url);
            worker.onmessage = e => onOut(e.data);
            worker.onerror = e => { e.preventDefault?.(); worker.terminate(); worker = null; busy = false; local = fluidKernel(); local.handle(initMsg); for (const P of plumes.values()) local.handle({ t: 'plume', id: P.id, cfg: P.cfg }); };
          } catch (e) { worker = null; local = fluidKernel(); }
          const initMsg = { t: 'water', warm: worker ? 12 : 0, grid: { nx, nz, dx, mask, kind, bed, target, rest, jets, u0, v0 } };   // luồng phụ: chạy trước 12 s cho tia cửa xả & xoáy hình thành
          post(initMsg);
          sceneEvents.signal.addEventListener('abort', () => { worker?.terminate(); worker = null; if (url) URL.revokeObjectURL(url); });
          return {
            water, addPlume, wCells,
            splash(x, z, r, s) {   // vật chạm nước tại (x, z) thế giới: bán kính r (đv), cường độ s (m lún xuống)
              if (nImp >= 96) return;
              imp.set([(x - x0) / dx, (z - z0) / dx, r / dx, s], nImp * 4); nImp++;
            },
            update(dt, t, rain) {
              accDt += dt;
              for (const P of plumes.values()) P.mat.uniforms.uTime.value = t % 1000;
              if (busy) return;
              // giọt mưa rơi xuống mặt nước: vài cú chạm ngẫu nhiên mỗi khung theo cường độ mưa
              for (let k = Math.round(rain * 6 * (0.5 + Math.random())); k > 0; k--) { const c = wCells[(Math.random() * wCells.length) | 0], a = c % nx, b = (c / nx) | 0; this.splash(x0 + (a + 0.5) * dx, z0 + (b + 0.5) * dx, 0.5, 0.008 + 0.01 * Math.random()); }
              const msg = { t: 'step', dt: Math.min(accDt, 0.1), nImp, imp: imp.slice(0, nImp * 4), wind: [sceneWind.dir.x * sceneWind.U * 0.0036, sceneWind.dir.y * sceneWind.U * 0.0036], plumes: {}, bufs: { water: spareW } };
              const transfer = spareW ? [spareW] : []; spareW = null; nImp = 0; accDt = 0;
              camera.getWorldDirection(_pf); _pr.set(-_pf.z, 0, _pf.x).normalize();   // trục ngang của tấm khói (vuông góc hướng nhìn)
              for (const P of plumes.values()) {
                P.mesh.visible = P.on; if (!P.on) continue;
                P.mesh.position.copy(P.base); P.mesh.rotation.set(0, Math.atan2(-_pr.z, _pr.x), 0); P.right.copy(_pr);
                const cs = P.cfg.w / P.cfg.nx, src = [];
                for (const S of P.sources) {   // nguồn (thế giới) → toạ độ ô trên tấm; vận tốc nguồn chiếu lên trục ngang + đứng
                  _pd.copy(S.p).sub(P.base);
                  src.push([P.cfg.nx / 2 + _pd.dot(_pr) / cs, _pd.y / cs, S.r / cs, S.smoke, S.heat, S.steam, S.vel ? S.vel.dot(_pr) : 0, S.vel ? S.vel.y : 0]);
                }
                msg.plumes[P.id] = { src, wind0: P.wind0.dot(_pr), wind1: P.wind1.dot(_pr) };
                msg.bufs[P.id] = P.spare; if (P.spare) transfer.push(P.spare); P.spare = null;
              }
              busy = true; post(msg, transfer);
            }
          };
        })();
        const PLUME_COL = { smoke: new THREE.Color(0.42, 0.40, 0.38), steam: new THREE.Color(0.92, 0.93, 0.95), glow: new THREE.Color(1.0, 0.42, 0.1) };
        const _plumeGlow = new THREE.Color(), _plumeQ = new THREE.Quaternion();
        function plumeLight(P, smoke, steam, glow) {   // màu khói/hơi theo ánh sáng cảnh lúc này (đêm tối hẳn, chỉ sáng nơi lửa hắt lên)
          const lit = Math.min(1.05, hemi.intensity * 0.5 + amb.intensity * 0.55 + sun.intensity * 0.42), U = P.mat.uniforms;
          U.uSmoke.value.copy(smoke).multiplyScalar(lit); U.uSteam.value.copy(steam).multiplyScalar(lit); U.uGlow.value.copy(glow);
        }
        function plumeWind(P, h0, h1) {   // gió thật tại 2 độ cao trên chân tấm (mô hình log + nhiễu loạn) → mô phỏng lấy thành phần ngang trong mặt tấm
          windAt(P.base.x, P.base.y + h0, P.base.z, h0, P.wind0); windAt(P.base.x, P.base.y + h1, P.base.z, h1, P.wind1);
        }
