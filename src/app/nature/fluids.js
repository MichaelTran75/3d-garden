        // ===== CHẤT LỎNG — Navier–Stokes dạng rút gọn, chạy ở LUỒNG PHỤ (Web Worker dựng từ Blob, không cần tệp ngoài) =====
        //  1) NƯỚC NÔNG (Saint-Venant = Navier–Stokes lấy trung bình theo độ sâu) trên lưới trùng ô khối địa hình (0,6 m):
        //     độ sâu h ở tâm ô, vận tốc u, v ở mặt ô (lưới so le). Mỗi bước: cuốn vận tốc theo chính nó (bán Lagrange) → mực nước đổi theo
        //     thông lượng (độ sâu lấy phía ngược dòng) → gia tốc theo độ dốc mặt nước (g = 9,81) + ma sát đáy + lớp hút sóng sát biên mở.
        //     Hồ trên đập gần lặng, trôi rất nhẹ về đập; dưới đập 3 cửa xả phụt nước (mực dâng nhẹ) → nước tự tỏa, cuộn xoáy dọc bờ, chảy về hạ lưu.
        //     Bọt chỉ sinh khi có vật khuấy nước (cá đớp, phao, cò lội), trôi theo dòng rồi tan; vật chạm nước gây sóng lan, dội bờ.
        //     Mỗi khung trả về (độ cao mặt · vận tốc · bọt) dạng half-float → texture cho shader mặt nước + đọc trên CPU cho lá, cá, phao.
        //  2) KHÓI BẾP LỬA + HƠI ẤM REO: kỹ thuật luồng khói động cơ ở sân bay — trường Navier–Stokes đối xứng trục quanh cột khí nóng,
        //     hạt đi theo trường + rối Langevin + gió thật, vẽ thành dải sợi khói mép mềm (xem chi tiết ở mục 2 bên dưới).
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

          // ---------------- 2) KHÓI LỬA TRẠI — cùng kỹ thuật luồng khói động cơ ở sân bay (airport-gate/js/wind-worker.js) ----------------
          //  · TRƯỜNG: Navier–Stokes không nén ĐỐI XỨNG TRỤC (r, z) quanh trục đứng qua tâm lửa, lưới SO LE (u trên mặt hướng kính,
          //    w trên mặt đứng, áp suất / nhiệt T / khói S ở tâm ô). Lửa = bể nhiệt + nguồn khói; lực nổi Boussinesq kéo khí nóng lên.
          //    Nhớt rối kiểu tia tự do theo từng tầng ν_t = k·w_c·r½ (w_c vận tốc trên trục, r½ bán kính nửa vận tốc) ⇒ chùm khói nở gần thẳng.
          //    Đối lưu bán Lagrange, khuếch tán hiện (Laplace đối xứng trục), chiếu áp suất Poisson có trọng r — SOR đỏ-đen.
          //    Trục: u = 0 · mặt đất: w = 0 · vách ngoài & đỉnh hở (p = 0) ⇒ không khí xung quanh tự bị cuốn vào chùm khói.
          //  · HẠT: đi theo trường + dao động rối Langevin (Thomson 1987) σ = 1.49·√(ν_t·|S|), T_L = 1/(|S| + ½), cả theo góc vòng ⇒ khói tản 3D;
          //    gió thật (bảng 9 tầng) kéo hạt ngang với quán tính ~1 s ⇒ chùm khói ngả theo gió, càng lên cao càng ngả.
          //    Hơi ấm reo: hạt phụt khỏi vòi theo hướng vòi, tia tắt nhanh, rồi bị chùm khí nóng cuốn lên và bay hơi.
          //  · VỆT: 2 đỉnh / điểm, dải quay mặt về camera, mép mềm (1 − e² ở shader), nở ~4× về đuôi, mờ dần — dựng sẵn ở luồng phụ.
          let SM = null, gSpare = null;
          const sU = (r, z) => bil(SM.u, SM.NR + 1, SM.NZ, r / SM.H, z / SM.H - 0.5);
          const sW = (r, z) => bil(SM.w, SM.NR, SM.NZ + 1, r / SM.H - 0.5, z / SM.H);
          const sC = (a, r, z) => bil(a, SM.NR, SM.NZ, r / SM.H - 0.5, z / SM.H - 0.5);
          function gauss() { if (gSpare !== null) { const v = gSpare; gSpare = null; return v; } let u = 0; while (u < 1e-12) u = Math.random(); const m = Math.sqrt(-2 * Math.log(u)), v = 6.283185307 * Math.random(); gSpare = m * Math.sin(v); return m * Math.cos(v); }
          function initSmoke(c) {
            const { NR, NZ, NP, NT } = c, NC = NR * NZ, F = n => new Float32Array(n);
            SM = Object.assign({ NC, u: F((NR + 1) * NZ), u2: F((NR + 1) * NZ), w: F(NR * (NZ + 1)), w2: F(NR * (NZ + 1)), T: F(NC), T2: F(NC), S: F(NC), S2: F(NC), p: F(NC), dv: F(NC), SS: F(NC),
              nu: F(NZ), wc: F(NZ), acc: 0, rec: 0, spS: 0, spQ: 0, pr: F(NP), pth: F(NP), pz: F(NP), dx: F(NP), dz: F(NP), vx: F(NP), vz: F(NP), pu: F(NP), pw: F(NP), pt: F(NP),
              age: F(NP).fill(1e3), life: F(NP), pk: F(NP), pwid: F(NP), pd: F(NP), hist: F(NP * NT * 3) }, c);
            const warm = { heat: 1, smoke: 0, rF: 0.3, zF: 0.6 };
            for (let t = 0; t < 3; t += 1 / 30) stepSmoke(1 / 30, warm);   // khởi động: cột khí nóng đã thành hình
          }
          function diffuseAx(a, b, nr, nz, rOff, nuOf, dt, vec, amb) {   // b = a + dt·ν·∇²a (Laplace đối xứng trục; vec: thêm −a/r² của vận tốc hướng kính; amb: giá trị ngoài vách, null = gradient 0)
            const H2 = SM.H * SM.H;
            for (let j = 0; j < nz; j++) {
              const k = dt * nuOf(j) / H2, jm = j > 0 ? j - 1 : 0, jp = j < nz - 1 ? j + 1 : j;
              for (let i = 0; i < nr; i++) {
                const c = j * nr + i, f = a[c], rc = i + rOff;
                if (rc === 0) { b[c] = 0; continue; }   // trục: u = 0
                const fe = i < nr - 1 ? a[c + 1] : amb === null ? f : amb, fw = i > 0 ? a[c - 1] : f;
                let L = ((rc + 0.5) * (fe - f) - Math.max(0, rc - 0.5) * (f - fw)) / rc + a[jp * nr + i] + a[jm * nr + i] - 2 * f;
                if (vec) L -= f / (rc * rc);
                b[c] = f + k * L;
              }
            }
          }
          function turbAx() {   // vận tốc trục w_c, bán kính nửa vận tốc r½ → ν_t từng tầng · |S| ≈ |∂w/∂r| + |∂u/∂z| ở tâm ô (cho rối của hạt)
            const g = SM, { NR, NZ, H, w, u } = g, NU = NR + 1, wcen = (i, j) => 0.5 * (w[j * NR + i] + w[(j + 1) * NR + i]), ucen = (i, j) => 0.5 * (u[j * NU + i] + u[j * NU + i + 1]);
            for (let j = 0; j < NZ; j++) {
              let wm = 0, rh = NR * H;
              for (let i = 0; i < NR; i++) wm = Math.max(wm, wcen(i, j));
              for (let i = 0; i < NR; i++) if (wcen(i, j) < 0.5 * wm) { rh = (i + 0.5) * H; break; }
              g.wc[j] = wm; g.nu[j] = Math.min(0.045, g.nu0 + g.kNu * wm * rh);
              const jp = Math.min(NZ - 1, j + 1), jm = Math.max(0, j - 1);
              for (let i = 0; i < NR; i++) {
                const ip = Math.min(NR - 1, i + 1), im = Math.max(0, i - 1);
                g.SS[j * NR + i] = Math.abs(wcen(ip, j) - wcen(im, j)) / ((ip - im) * H) + Math.abs(ucen(i, jp) - ucen(i, jm)) / ((jp - jm) * H);
              }
            }
          }
          function advectAx(dt) {
            const g = SM, { NR, NZ, H } = g, NU = NR + 1, Rm = NR * H, Zm = NZ * H;
            for (let j = 0; j < NZ; j++) for (let i = 1; i <= NR; i++) {   // u: truy ngược; qua trục thì lấy đối xứng (u đổi dấu)
              const r = i * H, z = (j + 0.5) * H, c = j * NU + i;
              let rb = r - dt * g.u[c], sg = 1; if (rb < 0) { rb = -rb; sg = -1; }
              g.u2[c] = sg * sU(rb, z - dt * sW(r, z));
            }
            for (let j = 0; j < NZ; j++) g.u2[j * NU] = 0;
            for (let j = 1; j <= NZ; j++) for (let i = 0; i < NR; i++) {
              const r = (i + 0.5) * H, z = j * H, c = j * NR + i;
              g.w2[c] = sW(Math.abs(r - dt * sU(r, z)), z - dt * g.w[c]);
            }
            for (let i = 0; i < NR; i++) g.w2[i] = 0;   // mặt đất
            for (let j = 0; j < NZ; j++) for (let i = 0; i < NR; i++) {   // nhiệt & khói; khí đi vào từ ngoài miền = không khí sạch, nguội
              const r = (i + 0.5) * H, z = (j + 0.5) * H, c = j * NR + i, rb = Math.abs(r - dt * sU(r, z)), zb = z - dt * sW(r, z), out = rb > Rm || zb > Zm;
              g.T2[c] = out ? 0 : sC(g.T, rb, zb); g.S2[c] = out ? 0 : sC(g.S, rb, zb);
            }
            [g.u, g.u2] = [g.u2, g.u]; [g.w, g.w2] = [g.w2, g.w]; [g.T, g.T2] = [g.T2, g.T]; [g.S, g.S2] = [g.S2, g.S];
          }
          function projectAx(iters) {   // ∇·u = (1/r)∂(r·u)/∂r + ∂w/∂z = 0: Poisson có trọng r (nhân H²), SOR đỏ-đen ω 1.8, khởi động ấm
            const g = SM, { NR, NZ, H, p, dv, u, w } = g, NU = NR + 1;
            for (let j = 0; j < NZ; j++) for (let i = 0; i < NR; i++) dv[j * NR + i] = H * (((i + 1) * u[j * NU + i + 1] - i * u[j * NU + i]) / (i + 0.5) + w[(j + 1) * NR + i] - w[j * NR + i]);
            for (let it = 0; it < iters; it++) for (let par = 0; par < 2; par++) for (let j = 0; j < NZ; j++) for (let i = (j + par) & 1; i < NR; i += 2) {
              const c = j * NR + i, aE = (i + 1) / (i + 0.5), aW = i / (i + 0.5), aS = j > 0 ? 1 : 0;
              const pn = (aE * (i < NR - 1 ? p[c + 1] : 0) + aW * (i > 0 ? p[c - 1] : 0) + (j < NZ - 1 ? p[c + NR] : 0) + aS * (j > 0 ? p[c - NR] : 0) - dv[c]) / (aE + aW + 1 + aS);
              p[c] += 1.8 * (pn - p[c]);
            }
            for (let j = 0; j < NZ; j++) for (let i = 1; i <= NR; i++) u[j * NU + i] -= ((i < NR ? p[j * NR + i] : 0) - p[j * NR + i - 1]) / H;
            for (let j = 1; j <= NZ; j++) for (let i = 0; i < NR; i++) w[j * NR + i] -= ((j < NZ ? p[j * NR + i] : 0) - p[(j - 1) * NR + i]) / H;
          }
          function stepSmoke(dt, m) {
            const g = SM, { NR, NZ, H } = g, nF = Math.min(NR, Math.ceil(m.rF / H)), j1 = Math.min(NZ, Math.ceil(m.zF / H));
            for (let j = 0; j < j1; j++) for (let i = 0; i < nF; i++) {   // lòng lửa: bể nhiệt + nguồn khói theo cỡ lửa
              const c = j * NR + i, k = 1 - ((i + 0.5) * H / m.rF) ** 2; if (k <= 0) continue;
              g.T[c] = Math.max(g.T[c], m.heat * k); g.S[c] = Math.min(1.5, g.S[c] + m.smoke * k * dt);
            }
            for (let j = 1; j < NZ; j++) for (let i = 0; i < NR; i++) g.w[j * NR + i] += dt * g.buoy * 0.5 * (g.T[j * NR + i] + g.T[(j - 1) * NR + i]);   // lực nổi
            turbAx();
            diffuseAx(g.u, g.u2, NR + 1, NZ, 0, j => g.nu[j], dt, true, null); [g.u, g.u2] = [g.u2, g.u];
            diffuseAx(g.w, g.w2, NR, NZ + 1, 0.5, j => g.nu[Math.min(j, NZ - 1)], dt, false, null); [g.w, g.w2] = [g.w2, g.w];
            diffuseAx(g.T, g.T2, NR, NZ, 0.5, j => g.nu[j] * 1.1, dt, false, 0); [g.T, g.T2] = [g.T2, g.T];   // Pr_t ≈ 0.9
            diffuseAx(g.S, g.S2, NR, NZ, 0.5, j => g.nu[j] * 1.1, dt, false, 0); [g.S, g.S2] = [g.S2, g.S];
            advectAx(dt);
            const kc = Math.exp(-dt / g.tauT); for (let c = 0; c < g.NC; c++) g.T[c] *= kc;   // toả nhiệt ra môi trường
            for (let i = 0; i < NR; i++) g.w[i] = 0;
            projectAx(g.iters);
          }
          function smokeSpawn(n, m) {
            const g = SM, NT = g.NT; let x, y, z;
            if (n < g.NS) {   // hơi ấm: phụt khỏi vòi
              const s = m.spout, q = 0.75 + 0.5 * Math.random();
              x = s[0] + (Math.random() - 0.5) * 0.03; y = s[1] + (Math.random() - 0.5) * 0.03; z = s[2] + (Math.random() - 0.5) * 0.03;
              const th = Math.atan2(z, x), c = Math.cos(th), sn = Math.sin(th);
              g.pr[n] = Math.hypot(x, z); g.pth[n] = th; g.pz[n] = y; g.pu[n] = (s[3] * c + s[5] * sn) * q; g.pt[n] = (s[5] * c - s[3] * sn) * q; g.pw[n] = s[4] * q;
              g.life[n] = 1 + Math.random() * 1.2;
            } else {   // khói: bốc từ lòng lửa
              const r = m.rF * 0.85 * Math.sqrt(Math.random()), th = Math.random() * 6.2832;
              x = r * Math.cos(th); z = r * Math.sin(th); y = 0.12 + Math.random() * Math.max(0.1, m.zF - 0.12);
              g.pr[n] = r; g.pth[n] = th; g.pz[n] = y; g.pu[n] = g.pw[n] = g.pt[n] = 0; g.life[n] = 6 + Math.random() * 5;
            }
            g.dx[n] = g.dz[n] = g.vx[n] = g.vz[n] = g.pd[n] = 0; g.age[n] = 0; g.pk[n] = 0.6 + 0.5 * Math.random(); g.pwid[n] = 0.7 + 0.6 * Math.random();
            const o = n * NT * 3; for (let k = 0; k < NT; k++) { g.hist[o + k * 3] = x; g.hist[o + k * 3 + 1] = y; g.hist[o + k * 3 + 2] = z; }
          }
          function moveSmoke(dt, m, shift) {
            const g = SM, { NP, NT, H, NS } = g, Rm = g.NR * H, Zm = g.NZ * H, W = m.wind, kw = 1 - Math.exp(-dt);
            g.spS += dt * m.rate * (NP - NS) / 8.5; g.spQ += dt * m.steam * NS / 1.6;   // nhịp thả hạt ≈ số hạt / tuổi thọ trung bình
            for (let n = 0; n < NP; n++) {
              const steam = n < NS;
              if (g.age[n] >= g.life[n]) { if (steam ? g.spQ < 1 : g.spS < 1) continue; if (steam) g.spQ--; else g.spS--; smokeSpawn(n, m); }
              let r = g.pr[n], z = g.pz[n], ur = 0.04, wz = 0.3, sig = 0.06, TLi = 0.8;   // trên / ngoài miền tính: khí đã nguội, bốc chậm & tản
              if (r < Rm && z < Zm) {
                const S = sC(g.SS, r, z), j = Math.min(g.NZ - 1, (z / H) | 0);
                ur = sU(r, z); wz = sW(r, z); TLi = S + 0.5;
                g.pd[n] = Math.min(1, Math.sqrt(Math.max(0, sC(g.S, r, z))) * g.dens) * Math.exp(-Math.hypot(g.dx[n], g.dz[n]) / 4);   // độ đậm theo nồng độ khói tại chỗ (√: loãng dần đều) · gió ngang cuốn thêm khí sạch vào chùm ⇒ loãng theo quãng bị kéo đi
                sig = Math.min(0.12 * g.wc[j] + 0.03, 1.49 * Math.sqrt(Math.max(0, g.nu[j] - g.nu0) * S));   // trần σ ≈ 12 % vận tốc trục (cường độ rối đo được ở chùm nổi)
              } else g.pd[n] *= Math.exp(-dt / 1.5);   // ra khỏi miền tính: khói tiếp tục loãng, tan hẳn sau vài giây
              if (steam) { TLi += 3.5; wz += 0.2; }   // tia hơi tắt nhanh · hơi ấm nhẹ hơn không khí
              const a = Math.exp(-dt * TLi), b = sig * Math.sqrt(1 - a * a);
              g.pu[n] = g.pu[n] * a + b * gauss(); g.pw[n] = g.pw[n] * a + b * gauss(); g.pt[n] = g.pt[n] * a + b * gauss();
              r += (ur + g.pu[n]) * dt; z += (wz + g.pw[n]) * dt; let th = g.pth[n] + g.pt[n] * dt / Math.max(r, 0.05);
              if (r < 0) { r = -r; th += Math.PI; }
              if (z < 0.05) { z = 0.05; g.pw[n] = Math.abs(g.pw[n]); }
              const zl = Math.min(7.999, z), k0 = zl | 0, f = zl - k0;   // gió thật tại độ cao hạt (tầng 1 đv), quán tính ~1 s
              g.vx[n] += (W[k0 * 2] * (1 - f) + W[k0 * 2 + 2] * f - g.vx[n]) * kw; g.vz[n] += (W[k0 * 2 + 1] * (1 - f) + W[k0 * 2 + 3] * f - g.vz[n]) * kw;
              g.dx[n] += g.vx[n] * dt; g.dz[n] += g.vz[n] * dt;
              g.pr[n] = r; g.pz[n] = z; g.pth[n] = th; g.age[n] += dt; if (z > 14) g.age[n] = g.life[n];
              const o = n * NT * 3;
              if (shift) g.hist.copyWithin(o + 3, o, o + (NT - 1) * 3);
              g.hist[o] = g.dx[n] + r * Math.cos(th); g.hist[o + 1] = z; g.hist[o + 2] = g.dz[n] + r * Math.sin(th);
            }
          }
          function buildSmoke(m, P, D) {   // dải sợi khói quay mặt về camera · D = [độ đục, tỉ lệ hơi, nhiệt, mép] (Uint8)
            const g = SM, { NP, NT, H, NS } = g, cam = m.cam, Rm = g.NR * H, Zm = g.NZ * H, Hs = g.hist;
            for (let n = 0, v = 0; n < NP; n++) {
              const steam = n < NS, age = g.age[n], life = g.life[n], o = n * NT * 3;
              let a0 = 0, heat = 0;
              if (age < life) {
                const r = g.pr[n], z = g.pz[n], inD = r < Rm && z < Zm;
                if (steam) a0 = 0.85 * Math.min(1, age / 0.06) * Math.pow(1 - age / life, 1.6);
                else {
                  a0 = g.pd[n] * Math.min(1, age / 0.35) * Math.min(1, (life - age) / 2);
                  heat = inD ? Math.min(1, sC(g.T, r, z) / 1.2) : 0;
                }
                a0 *= g.pk[n];
              }
              const wid = ((steam ? 0.02 + 0.06 * Math.min(1, age / 1.2) : 0.035 + 0.09 * Math.min(1, age / 5)) + 1.4 * m.lpp) * g.pwid[n];
              const A = Math.round(Math.min(1, a0) * 255), Q = steam ? 255 : 0, TQ = Math.round(heat * 255);
              for (let j = 0; j < NT; j++, v += 2) {
                const j0 = j > 0 ? j - 1 : 0, j1 = j < NT - 1 ? j + 1 : NT - 1;
                let tx = Hs[o + j0 * 3] - Hs[o + j1 * 3], ty = Hs[o + j0 * 3 + 1] - Hs[o + j1 * 3 + 1], tz = Hs[o + j0 * 3 + 2] - Hs[o + j1 * 3 + 2];
                if (tx * tx + ty * ty + tz * tz < 1e-12) { tx = 0; ty = 1; tz = 0; }
                let sx = ty * cam[2] - tz * cam[1], sy = tz * cam[0] - tx * cam[2], sz = tx * cam[1] - ty * cam[0];
                const uu = j / (NT - 1), k = wid * (0.8 + 2.4 * uu) / (Math.hypot(sx, sy, sz) || 1);
                sx *= k; sy *= k; sz *= k;
                const q = v * 3, X = Hs[o + j * 3], Y = Hs[o + j * 3 + 1], Z = Hs[o + j * 3 + 2];
                P[q] = X + sx; P[q + 1] = Y + sy; P[q + 2] = Z + sz; P[q + 3] = X - sx; P[q + 4] = Y - sy; P[q + 5] = Z - sz;
                const al = Math.round(A * Math.pow(1 - uu, steam ? 2.4 : 1.3) * Math.min(1, j / 1.5 + 0.35)), e = v * 4;   // vệt hơi ngắn hơn (bay hơi nhanh)
                D[e] = D[e + 4] = al; D[e + 1] = D[e + 5] = Q; D[e + 2] = D[e + 6] = TQ; D[e + 3] = 255; D[e + 7] = 0;
              }
            }
          }

          // ---------------- giao tiếp ----------------
          function handle(m) {
            if (m.t === 'water') { initWater(m.grid); for (let t = 0; t < m.warm; t += WSTEP) stepWater(WSTEP, 0, 0); return null; }   // chạy trước ~40 s cho dòng ổn định
            if (m.t === 'smoke') { initSmoke(m.cfg); return null; }
            if (m.t !== 'step') return null;
            const transfer = [], res = { t: 'out' };
            if (W) {
              splashWater(m.imp, m.nImp);
              W.acc = Math.min(W.acc + m.dt, 0.1);
              while (W.acc >= WSTEP) { stepWater(WSTEP, m.wind[0], m.wind[1]); W.acc -= WSTEP; }
              const buf = m.bufs.water && m.bufs.water.byteLength === W.nx * W.nz * 8 ? new Uint16Array(m.bufs.water) : new Uint16Array(W.nx * W.nz * 4);
              res.water = encodeWater(buf).buffer; transfer.push(res.water);
            }
            if (SM && m.smoke) {
              const k = m.smoke, NV = SM.NP * SM.NT * 2, bp = m.bufs.smokeP, bd = m.bufs.smokeD;
              SM.acc = Math.min(SM.acc + m.dt, 0.1);
              while (SM.acc >= 1 / 30) { stepSmoke(1 / 30, k); SM.acc -= 1 / 30; }
              for (let s = 0; s < 2; s++) { SM.rec += m.dt / 2; const sh = SM.rec >= 0.03; if (sh) SM.rec = Math.min(0.03, SM.rec - 0.03); moveSmoke(m.dt / 2, k, sh); }   // vệt: ghi 1 điểm mỗi 30 ms (~0,4 s đường đi)
              const P = bp && bp.byteLength === NV * 12 ? new Float32Array(bp) : new Float32Array(NV * 3), D = bd && bd.byteLength === NV * 4 ? new Uint8Array(bd) : new Uint8Array(NV * 4);
              buildSmoke(k, P, D); res.smoke = { pos: P.buffer, d: D.buffer }; transfer.push(P.buffer, D.buffer);
            }
            return { msg: res, transfer };
          }
          return { handle, smokeState: () => SM };   // smokeState: cho bộ thử ngoài (Node) đọc trường khói
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
          // ---- khói lửa trại: dải sợi khói (luồng phụ dựng sẵn vị trí + độ đục), mép mềm 1 − e² như luồng khói động cơ ở sân bay ----
          const smokeVS = `attribute vec4 aD; varying vec4 vD;
            #include <fog_pars_vertex>
            void main() { vD = aD; vec4 mvPosition = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mvPosition;
            #include <fog_vertex>
            }`;
          const smokeFS = `uniform vec3 uSmoke, uSteam, uGlow; uniform float uOpacity; varying vec4 vD;
            #include <fog_pars_fragment>
            void main() {
              float e = vD.w * 2.0 - 1.0, a = vD.x * (1.0 - e * e) * uOpacity;
              if (a < 0.003) discard;
              gl_FragColor = vec4(mix(uSmoke, uSteam, vD.y) + uGlow * vD.z * vD.z * vD.z * 1.2, a);   // khói xám · hơi trắng · lửa hắt cam nhẹ lên khói nóng sát bếp
              #include <tonemapping_fragment>
              #include <colorspace_fragment>
              #include <fog_fragment>
            }`;
          let smoke = null;
          const _pf = new THREE.Vector3(), _pw = new THREE.Vector3();
          function addSmoke(cfg, look) {   // cfg: lưới (NR × NZ ô cạnh H) + số hạt NP (NS hạt đầu là hơi) × NT điểm vệt + hệ số vật lý · look: tên, độ đục
            const NT = cfg.NT, NV = cfg.NP * NT * 2, idx = new Uint16Array(cfg.NP * (NT - 1) * 6);
            for (let p = 0, o = 0; p < cfg.NP; p++) for (let j = 0; j < NT - 1; j++) { const b = (p * NT + j) * 2; idx[o++] = b; idx[o++] = b + 1; idx[o++] = b + 2; idx[o++] = b + 1; idx[o++] = b + 3; idx[o++] = b + 2; }
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(NV * 3), 3).setUsage(THREE.DynamicDrawUsage));
            geo.setAttribute('aD', new THREE.BufferAttribute(new Uint8Array(NV * 4), 4, true).setUsage(THREE.DynamicDrawUsage));
            geo.setIndex(new THREE.BufferAttribute(idx, 1));
            const mat = new THREE.ShaderMaterial({ vertexShader: smokeVS, fragmentShader: smokeFS, transparent: true, depthWrite: false, fog: true, toneMapped: false, side: THREE.DoubleSide,
              uniforms: Object.assign({ uSmoke: { value: new THREE.Color() }, uSteam: { value: new THREE.Color() }, uGlow: { value: new THREE.Color() }, uOpacity: { value: look.opacity } }, THREE.UniformsUtils.clone(THREE.UniformsLib.fog)) });
            const mesh = new THREE.Mesh(geo, mat); mesh.name = look.name; mesh.frustumCulled = false; mesh.renderOrder = 4; mesh.raycast = () => {};
            mesh.userData.noRainOcc = mesh.userData.noBatch = true; scene.add(mesh);
            smoke = { cfg, mat, mesh, geo, spare: null, base: new THREE.Vector3(), on: true, heat: 0, smoke: 0, rate: 0, steam: 0, rF: 0.3, zF: 0.7, spout: [0, 0, 0, 0, 0, 0], wind: new Array(18).fill(0) };
            post({ t: 'smoke', cfg });
            return smoke;
          }
          // ---- luồng phụ (dự phòng: chạy ngay trên luồng chính) ----
          let worker = null, local = null, busy = false, accDt = 0, url = null;
          const imp = new Float32Array(4 * 96); let nImp = 0;
          function onOut(m) {
            busy = false;
            if (m.water) { const arr = new Uint16Array(m.water); spareW = wData ? wData.buffer : null; wData = arr; wTex.image.data = arr; wTex.needsUpdate = true; if (!water.ready) { water.ready = true; waterU.uSimOn.value = 1; } }
            if (m.smoke && smoke) {
              const at = smoke.geo.attributes, P = new Float32Array(m.smoke.pos), D = new Uint8Array(m.smoke.d);
              at.position.array.set(P); at.aD.array.set(D); at.position.needsUpdate = at.aD.needsUpdate = true; smoke.spare = [P.buffer, D.buffer];
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
            worker.onerror = e => { e.preventDefault?.(); worker.terminate(); worker = null; busy = false; local = fluidKernel(); local.handle(initMsg); if (smoke) local.handle({ t: 'smoke', cfg: smoke.cfg }); };
          } catch (e) { worker = null; local = fluidKernel(); }
          const initMsg = { t: 'water', warm: worker ? 12 : 0, grid: { nx, nz, dx, mask, kind, bed, target, rest, jets, u0, v0 } };   // luồng phụ: chạy trước 12 s cho tia cửa xả & xoáy hình thành
          post(initMsg);
          sceneEvents.signal.addEventListener('abort', () => { worker?.terminate(); worker = null; if (url) URL.revokeObjectURL(url); });
          return {
            water, addSmoke, wCells,
            splash(x, z, r, s) {   // vật chạm nước tại (x, z) thế giới: bán kính r (đv), cường độ s (m lún xuống)
              if (nImp >= 96) return;
              imp.set([(x - x0) / dx, (z - z0) / dx, r / dx, s], nImp * 4); nImp++;
            },
            update(dt, t, rain) {
              accDt += dt;
              if (busy) return;
              // giọt mưa rơi xuống mặt nước: vài cú chạm ngẫu nhiên mỗi khung theo cường độ mưa
              for (let k = Math.round(rain * 6 * (0.5 + Math.random())); k > 0; k--) { const c = wCells[(Math.random() * wCells.length) | 0], a = c % nx, b = (c / nx) | 0; this.splash(x0 + (a + 0.5) * dx, z0 + (b + 0.5) * dx, 0.5, 0.008 + 0.01 * Math.random()); }
              const msg = { t: 'step', dt: Math.min(accDt, 0.1), nImp, imp: imp.slice(0, nImp * 4), wind: [sceneWind.dir.x * sceneWind.U * 0.0036, sceneWind.dir.y * sceneWind.U * 0.0036], bufs: { water: spareW } };
              const transfer = spareW ? [spareW] : []; spareW = null; nImp = 0; accDt = 0;
              if (smoke) {
                smoke.mesh.visible = smoke.on;
                if (smoke.on) {   // gió thật 9 tầng trên tâm lửa · hướng nhìn (dải quay mặt về camera) · cỡ 1 điểm ảnh (sợi xa vẫn ≥ ~2 px)
                  const B = smoke.base, W = smoke.wind; smoke.mesh.position.copy(B);
                  // gió cảnh chạy chậm (U10_cảnh = 0,25 + 0,2·U10 cho lá khỏi bay mất) còn khói bốc theo tốc độ thật ⇒ quy gió về tốc độ thật (đv/s) cho tỉ lệ gió / tốc độ bốc đúng
                  const kW = Math.min(5, Math.max(1, sceneWind.speed / 3.6 / 0.76 / Math.max(0.1, sceneWind.U)));
                  for (let k = 0; k < 9; k++) { windAt(B.x, B.y + k, B.z, k + 0.3, _pw); W[k * 2] = _pw.x * kW; W[k * 2 + 1] = _pw.z * kW; }
                  camera.getWorldDirection(_pf);
                  msg.smoke = { heat: smoke.heat, smoke: smoke.smoke, rate: smoke.rate, steam: smoke.steam, rF: smoke.rF, zF: smoke.zF, spout: smoke.spout, wind: W,
                    cam: [_pf.x, _pf.y, _pf.z], lpp: (camera.top - camera.bottom) / camera.zoom / Math.max(1, renderer.domElement.clientHeight) };
                  if (smoke.spare) { [msg.bufs.smokeP, msg.bufs.smokeD] = smoke.spare; transfer.push(...smoke.spare); smoke.spare = null; }
                }
              }
              busy = true; post(msg, transfer);
            }
          };
        })();
        const PLUME_COL = { smoke: new THREE.Color(0.42, 0.40, 0.38), steam: new THREE.Color(0.92, 0.93, 0.95), glow: new THREE.Color(1.0, 0.42, 0.1) };
        const _plumeGlow = new THREE.Color(), _plumeQ = new THREE.Quaternion(), _smokeTop = new THREE.Vector3(), _smokeJet = new THREE.Vector3();
        function plumeLight(P, smoke, steam, glow) {   // màu khói/hơi theo ánh sáng cảnh lúc này (đêm tối hẳn, chỉ sáng nơi lửa hắt lên)
          const lit = Math.min(1.05, hemi.intensity * 0.5 + amb.intensity * 0.55 + sun.intensity * 0.42), U = P.mat.uniforms;
          U.uSmoke.value.copy(smoke).multiplyScalar(lit); U.uSteam.value.copy(steam).multiplyScalar(lit); U.uGlow.value.copy(glow);
        }
