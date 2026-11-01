        // ====== CHÒM SAO (G 01/11 "kết nối các chòm sao trên trời, chỉ hiện tên khi hover over chòm sao") ======
        //  Nét nối 88 chòm theo bản đồ IAU / Sky & Telescope (d3-celestial — core/constellation-lines.js), vẽ trên lớp nền trời ngay sau nền, trước sao, cùng phép chiếu
        //  nổi + giờ sao với sao (core/night-sky.js) ⇒ đầu nét chạm đúng tâm chấm sao. Mỗi đoạn chia ≤ 3° theo cung lớn (chiếu nổi biến cung lớn thành cung tròn);
        //  dải rộng cố định theo điểm ảnh dựng trong shader đỉnh (gl.LINES chỉ rộng 1 px thiết bị); chừa khe quanh sao theo đúng cỡ chấm sao lúc đó (như bản đồ IAU).
        //  Hiện theo độ tối trời: cấp sao giới hạn 2,8 → 4,8 (hết chạng vạng dân sự → đêm), trăng sáng / mây làm mờ như sao, tắt dần sát chân trời.
        //  RÊ CHUỘT lên nền trời — không trên đảo (dò tia qua bản đồ độ cao mặt đất), không khi đang trỏ vật chọn được / đang kéo / chế độ chọn vật / nút "Nhãn" tắt:
        //  chòm có nét gần con trỏ nhất trong 22 px sáng + dày lên, chòm khác mờ bớt, hiện tên Hán Việt + tên La-tinh ở điểm đặt nhãn của chòm (điểm đó khuất sau
        //  đảo / ngoài khung thì đặt cạnh con trỏ). Cảm ứng: chạm 1 lần vào trời = rê 2,5 s.
        const constellations = (() => {
          let hovSel = null; worldJoin('hover', 10, H => { hovSel = H; });   // bộ chọn rê chuột (dịch vụ 'hover', ui/hover-select.js): đang bận ⇒ không sáng chòm
          const U = nightSky.U, M = U.uEq.value, raw = atob(CONST_LINES), V = [], VM = [];
          const C = CONST_INFO.map(([id, vi, la, rank, ra, de]) => ({ id, vi, la, rank, polys: [], c: new THREE.Vector3(), cr: 0, p0: 0, p1: 0,
            lab: new THREE.Vector3(Math.cos(de * RD) * Math.cos(ra * RD), Math.cos(de * RD) * Math.sin(ra * RD), Math.sin(de * RD)) }));
          let p = 0;
          for (const c of C) for (let np = raw.charCodeAt(p++), k = 0; k < np; k++) {   // giải mã như danh mục sao: cùng lượng tử ⇒ đỉnh trùng sao lấy đúng vị trí chấm sao
            const poly = [];
            for (let n = raw.charCodeAt(p++), i = 0; i < n; i++, p += 4) {
              const y = raw.charCodeAt(p) | raw.charCodeAt(p + 1) << 8 | raw.charCodeAt(p + 2) << 16 | raw.charCodeAt(p + 3) << 24, ra = (y & 16383) / 16384 * 2 * Math.PI, de = ((y >>> 14 & 8191) / 8191 * 180 - 90) * RD;
              poly.push(V.length); V.push(new THREE.Vector3(Math.cos(de) * Math.cos(ra), Math.cos(de) * Math.sin(ra), Math.sin(de))); VM.push((y >>> 27 & 15) * 0.5 - 1.5);
            }
            c.polys.push(poly);
          }
          // ---- mảnh nét: mỗi mảnh 1 dải chữ nhật 4 đỉnh (đầu mảnh này · đầu kia · bên ±1) — PA/PB/PC giữ lại để dò rê chuột ----
          const STEP = 3 * RD, pos = [], oth = [], aK = [], aL = [], idx = [], PA = [], PB = [], PC = [];
          const slerp = (a, b, L, u) => a.clone().multiplyScalar(Math.sin((1 - u) * L)).addScaledVector(b, Math.sin(u * L)).divideScalar(Math.sin(L));
          C.forEach((c, ci) => {
            const all = c.polys.flat(); for (const i of all) c.c.add(V[i]); c.c.normalize(); c.cr = Math.max(...all.map(i => c.c.angleTo(V[i])));   // chỏm cầu bao chòm (lọc nhanh khi dò)
            c.p0 = PA.length;
            for (const poly of c.polys) for (let k = 1; k < poly.length; k++) {
              const a = V[poly[k - 1]], b = V[poly[k]], L = a.angleTo(b); if (L < 1e-5) continue;
              const n = Math.ceil(L / STEP), ma = VM[poly[k - 1]], mb = VM[poly[k]];
              for (let s = 0; s < n; s++) {
                const A = slerp(a, b, L, s / n), B = slerp(a, b, L, (s + 1) / n), base = pos.length / 3; PA.push(A); PB.push(B); PC.push(ci);
                for (const [P, Q, o, u] of [[A, B, 1, s / n], [B, A, -1, (s + 1) / n]]) for (const side of [1, -1]) { pos.push(P.x, P.y, P.z); oth.push(Q.x, Q.y, Q.z); aK.push(side, o, ci, u * L); aL.push(L, ma, mb); }
                idx.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
              }
            }
            c.p1 = PA.length;
          });
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute('aB', new THREE.Float32BufferAttribute(oth, 3));
          geo.setAttribute('aK', new THREE.Float32BufferAttribute(aK, 4)); geo.setAttribute('aL', new THREE.Float32BufferAttribute(aL, 3)); geo.setIndex(idx);
          const LU = { uRes: { value: new THREE.Vector2(1, 1) }, uHov: { value: -1 }, uVis: { value: 0 } };
          const mesh = nightSky.mk(new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: { ...U, ...LU }, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
            vertexShader: `
              uniform mat3 uEq; uniform vec3 uR, uU, uF; uniform vec2 uK, uRes; uniform float uOff, uPx, uLim, uCloud, uHov, uVis;
              attribute vec3 aB, aL; attribute vec4 aK;   // aK: bên ±1 · +1 đầu mảnh / −1 cuối mảnh · số chòm · góc từ đầu đoạn (rad) — aL: dài đoạn (rad) · cấp sao 2 đầu đoạn
              varying vec3 vC; varying float vD, vW, vS, vL, vG0, vG1;
              vec2 sp(vec3 d) { return 2.0 * vec2(dot(d, uR), dot(d, uU)) / max(1.0 + dot(d, uF), 0.02) * uK + vec2(0.0, uOff); }
              float gap(float m) {   // bán kính khe quanh sao (px thiết bị) theo cỡ chấm sao lúc này — cùng công thức độ rọi / cỡ điểm với shader sao
                float b = exp2(-1.329 * (m - uLim)) * (1.0 - 0.9 * uCloud), lb = log(max(b, 1.0));
                return uPx * (b < 0.7 ? 2.0 : 2.6 + 0.5 * (1.7 + 0.6 * lb + 2.6 * smoothstep(5.0, 9.0, lb)));
              }
              void main() {
                vC = vec3(0.0); gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
                vec3 d = uEq * position, e = uEq * aB; float fd = 1.0 + dot(d, uF);
                if (max(d.y, e.y) < -0.003 || min(fd, 1.0 + dot(e, uF)) < 0.25) return;   // dưới chân trời · sau lưng người nhìn (chiếu nổi phóng vô hạn)
                vec2 h = 0.5 * uRes, s = sp(d), t = (sp(e) - s) * h * aK.y; float l = length(t); t = l > 1e-4 ? t / l : vec2(1.0, 0.0);
                bool hi = abs(aK.z - uHov) < 0.5;
                vW = uPx * (hi ? 0.6 : 0.35); vD = aK.x * (vW + 1.0);   // nửa bề rộng (G 01/11 "mảnh hơn": 0,7 px CSS, chòm đang rê 1,2 px) + 1 px làm mịn mép
                gl_Position = vec4(s + vec2(-t.y, t.x) * vD / h, 0.0, 1.0);
                float k = uK.y * uRes.y / max(fd, 0.02);   // px thiết bị / radian tại đỉnh (chiếu nổi bảo giác: như nhau mọi hướng)
                vS = aK.w; vL = aL.x; vG0 = gap(aL.y) / k; vG1 = gap(aL.z) / k;
                vC = (hi ? vec3(0.16, 0.25, 0.55) : vec3(0.018, 0.032, 0.08)) * uVis * smoothstep(-0.003, 0.045, d.y) * (uHov < -0.5 || hi ? 1.0 : 0.5);
              }`,
            fragmentShader: `
              varying vec3 vC; varying float vD, vW, vS, vL, vG0, vG1;
              void main() {
                float a = clamp(vW + 0.5 - abs(vD), 0.0, 1.0) * smoothstep(vG0, 1.3 * vG0, vS) * smoothstep(vG1, 1.3 * vG1, vL - vS);
                gl_FragColor = vec4(vC * a, 1.0);
                #include <colorspace_fragment>
              }` })), -1002.5);
          mesh.name = 'Nét nối chòm sao';
          // ---- tên khi rê chuột: thẻ HTML nổi trên khung (chữ nét, không qua WebGL) ----
          const el = document.createElement('div'), vi = document.createElement('div'), la = document.createElement('div');
          el.style.cssText = 'position:fixed;z-index:39;left:0;top:0;pointer-events:none;transform:translate(-50%,-50%);text-align:center;white-space:nowrap;color:#dce6ff;font:600 13px/1.25 system-ui,sans-serif;letter-spacing:.03em;text-shadow:0 0 3px rgba(0,0,12,.95),0 0 9px rgba(0,0,20,.85);opacity:0;transition:opacity .18s';
          la.style.cssText = 'font-weight:400;font-size:11px;font-style:italic;opacity:.7;letter-spacing:.05em';
          el.append(vi, la); document.body.appendChild(el); sceneEvents.signal.addEventListener('abort', () => el.remove());
          const cvs = renderer.domElement, S = { mx: null, my: 0, down: false, dirty: true, t: 0, pick: -1, hov: -1, touch: 0, x0: 0, y0: 0, t0: 0 };
          listen(cvs, 'pointermove', e => { if (e.pointerType === 'touch') return; S.mx = e.clientX; S.my = e.clientY; S.down = e.buttons !== 0; S.dirty = true; });
          listen(cvs, 'pointerleave', e => { if (e.pointerType !== 'touch') { S.mx = null; S.dirty = true; } });
          listen(cvs, 'pointerdown', e => { S.down = true; S.x0 = e.clientX; S.y0 = e.clientY; S.t0 = performance.now(); if (e.pointerType === 'touch') S.mx = null; });
          listen(cvs, 'pointerup', e => { S.down = false; S.dirty = true;
            if (e.pointerType === 'touch' && Math.hypot(e.clientX - S.x0, e.clientY - S.y0) < 10 && performance.now() - S.t0 < 400) { S.mx = e.clientX; S.my = e.clientY; S.touch = 2.5; } });
          listen(cvs, 'wheel', () => { S.dirty = true; }, { passive: true });
          const _n = new THREE.Vector2(), _a = new THREE.Vector2(), _b = new THREE.Vector2(), _v = new THREE.Vector3(), _w = new THREE.Vector3(), _q = new THREE.Vector3(), _Mt = new THREE.Matrix3(), ray = new THREE.Raycaster();
          let isl = null;
          function overIsland(nx, ny) {   // tia qua điểm màn hình (camera trực giao) có cắt khối đảo: bước ~0,3 m theo phương ngang, so với độ cao mặt đất từng ô
            if (!isl) { if (!terrainMeshes.length) return false; isl = new THREE.Box3(); for (const m of terrainMeshes) isl.union(new THREE.Box3().setFromObject(m)); }
            ray.setFromCamera(_n.set(nx, ny), camera); const o = ray.ray.origin, d = ray.ray.direction;
            let t0 = -Infinity, t1 = Infinity;
            for (const k of ['x', 'y', 'z']) {
              if (Math.abs(d[k]) < 1e-9) { if (o[k] < isl.min[k] || o[k] > isl.max[k]) return false; continue; }
              const a = (isl.min[k] - o[k]) / d[k], b = (isl.max[k] - o[k]) / d[k]; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b));
            }
            for (let t = t0, st = 0.5 * BLOCK / Math.max(Math.hypot(d.x, d.z), 0.2); t <= t1; t += st)
              if (o.y + d.y * t <= surfaceY(Math.round((o.x + d.x * t) / BLOCK + cx - 0.5), Math.round((o.z + d.z * t) / BLOCK + cz - 0.5))) return true;
            return false;
          }
          function pickAt(x, y) {   // chòm có nét gần điểm (x, y) nhất trong 22 px CSS, hoặc −1
            const r = cvs.getBoundingClientRect(), nx = (x - r.left) / r.width * 2 - 1, ny = 1 - (y - r.top) / r.height * 2;
            if (Math.abs(nx) > 1 || Math.abs(ny) > 1 || nightSky.fromNdc(nx, ny, _q).y < 0.004 || overIsland(nx, ny)) return -1;
            _q.applyMatrix3(_Mt.copy(M).transpose());   // hướng con trỏ → xích đạo J2000
            const hw = r.width / 2, hh = r.height / 2, px = nx * hw, py = ny * hh, F = U.uF.value;
            let best = -1, bd = 22;
            for (let ci = 0; ci < C.length; ci++) {
              const c = C[ci]; if (_q.angleTo(c.c) > c.cr + 0.1) continue;
              for (let i = c.p0; i < c.p1; i++) {
                _v.copy(PA[i]).applyMatrix3(M); _w.copy(PB[i]).applyMatrix3(M);
                if (Math.max(_v.y, _w.y) < 0.004 || 1 + _v.dot(F) < 0.25 || 1 + _w.dot(F) < 0.25) continue;
                nightSky.toNdc(_v, _a); nightSky.toNdc(_w, _b);
                const ax = _a.x * hw, ay = _a.y * hh, bx = _b.x * hw - ax, by = _b.y * hh - ay, u = Math.max(0, Math.min(1, ((px - ax) * bx + (py - ay) * by) / (bx * bx + by * by || 1)));
                const dd = Math.hypot(px - ax - bx * u, py - ay - by * u); if (dd < bd) { bd = dd; best = ci; }
              }
            }
            return best;
          }
          function place(ci) {   // thẻ tên ở điểm đặt nhãn của chòm; khuất sau đảo / ngoài khung ⇒ cạnh con trỏ
            const r = cvs.getBoundingClientRect(); let x = S.mx + 18, y = S.my - 22;
            _v.copy(C[ci].lab).applyMatrix3(M);
            if (_v.y > 0.03 && 1 + _v.dot(U.uF.value) > 0.3) { nightSky.toNdc(_v, _a); if (Math.abs(_a.x) < 0.92 && Math.abs(_a.y) < 0.92 && !overIsland(_a.x, _a.y)) { x = r.left + (_a.x + 1) / 2 * r.width; y = r.top + (1 - _a.y) / 2 * r.height; } }
            el.style.left = x.toFixed(1) + 'px'; el.style.top = y.toFixed(1) + 'px';
          }
          function tick(dt) {   // mỗi khung sau nightSky.update (loop/main-loop-rest.js)
            const vis = smooth01(2.8, 4.8, nightSky.lim) * (1 - 0.85 * U.uCloud.value) * U.uMix.value, on = nightSky.stars.visible && vis > 0.01;
            mesh.visible = on; LU.uVis.value = vis; renderer.getDrawingBufferSize(LU.uRes.value);
            if (S.touch > 0 && (S.touch -= dt) <= 0) { S.mx = null; S.dirty = true; }
            let h = -1;
            if (on && vis > 0.15 && S.mx !== null && !S.down && labelGroup.visible && !(hovSel && hovSel.busy())) {
              if (S.dirty || (S.t -= dt) <= 0) { S.dirty = false; S.t = 0.2; S.pick = pickAt(S.mx, S.my); }   // trời quay theo giờ sao + camera tự xoay ⇒ dò lại 5 lần / giây
              h = S.pick;
            }
            LU.uHov.value = h;
            if (h !== S.hov) { S.hov = h; if (h >= 0) { vi.textContent = C[h].vi; la.textContent = C[h].la; } el.style.opacity = h >= 0 ? '1' : '0'; }
            if (h >= 0) place(h);
          }
          return { tick, mesh, list: C, pickAt, overIsland, get hover() { return S.hov; } };
        })();
