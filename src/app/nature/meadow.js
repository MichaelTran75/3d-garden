        // ===== THẢM CỎ MỀM (G 13/10: "research from other artist… thảm cỏ nhìn gớm, không mịn màng lãng mạn") =====
        //  Học từ cách các nghệ sĩ/studio làm cỏ:
        //   · PHÁP TUYẾN CHĨA LÊN (mẹo cỏ UE4 / cỏ chi tiết Unity: cỏ lấy pháp tuyến của mặt đất) ⇒ cỏ sáng tối y như nền, không lốm đốm từng lá.
        //   · MÀU GỐC = MÀU ĐẤT ngay dưới (đọc từ khối địa hình), NGỌN sáng & ấm hơn (cỏ hoạt hình Godot, cỏ Ghost of Tsushima: trộn màu gốc → ngọn,
        //     gốc hơi tối như che khuất) ⇒ cỏ "mọc ra" từ nền chứ không phải gai sẫm cắm trên nền; mảng ẩm xanh mướt, mảng khô ngả rơm.
        //   · LÁ MẢNH, RẤT DÀY, cong Bézier, thuôn nhọn (20 lá / ô 0,6 m khi nhìn gần); lá đang quay ngang camera được nới bề ngang trong không gian nhìn
        //     (Ghost of Tsushima) ⇒ không thành vệt kim.
        //   · GIÓ là SÓNG LỚN chạy qua đồng (cùng trường gió của cây — honami) + rung nhẹ từng lá; ngọn rạp bắt sáng ⇒ vệt sáng lăn theo sóng;
        //     nắng thấp (bình minh / hoàng hôn) ngọn lá ửng vàng (ánh xuyên lá). Người / chó / gấu mèo đi qua: cỏ rạp ra rồi bật lại.
        //   · Hoa dại li ti điểm xuyết (~6% ô).
        //   · LOD theo mức phóng: nhìn xa lá nhỏ hơn 1–2 điểm ảnh ⇒ ẩn (chỉ còn mảng màu loang trên mặt đất); gần thì đủ lá; chỉ vẽ ô trong khung nhìn
        //     (cắt theo mảng 24 × 24 ô, gom vào 1 lượt vẽ).
        const meadow = (() => {
          const rnd = mulberry32(4545), CH = 24;
          // ---- chọn ô có cỏ: điểm = nhiễu mảng 2 tầng + ẩm (gần nước) − giẫm đạp (bếp lửa, cửa xe); ngưỡng phân vị ⇒ đúng 45% số ô đất ----
          const hsh = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.545; return s - Math.floor(s); };
          const vnoise = (x, z) => { const xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi, u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf); return (hsh(xi, zi) * (1 - u) + hsh(xi + 1, zi) * u) * (1 - v) + (hsh(xi, zi + 1) * (1 - u) + hsh(xi + 1, zi + 1) * u) * v; };
          const N = GX * GZ, wd = new Uint8Array(N).fill(255), q = new Int32Array(N); let qh = 0, qt = 0;
          for (let j = 0; j < GZ; j++) for (let i = 0; i < GX; i++) if (isWater(i, j)) { wd[i + j * GX] = 0; q[qt++] = i + j * GX; }
          while (qh < qt) { const c = q[qh++], d = wd[c] + 1; if (d > 40) continue; const ci = c % GX, cj = (c / GX) | 0;
            for (const n of [ci > 0 ? c - 1 : -1, ci < GX - 1 ? c + 1 : -1, cj > 0 ? c - GX : -1, cj < GZ - 1 ? c + GX : -1]) if (n >= 0 && wd[n] > d) { wd[n] = d; q[qt++] = n; } }
          const door = vanPt(0.345, 0, 2.16), camps = [[pf.x, pf.z, 3.2], [door.x, door.z, 1.8]];
          // ---- THẢM CỎ NGẮN (G 15/10 "thảm cỏ ngắn vào khu vực này": bãi quanh khúc gỗ chết + 2 gốc cây): ô trong vùng luôn có cỏ, lá thấp 9–15 cm
          //      (cỏ mềm 15–39 cm), mảnh hơn 40%, dày gấp 3 (3 bản/ô, hạt giống khác), gốc lá tối hơn nền chút ⇒ thấy vân thảm cả khi zoom vừa; mép loang theo nhiễu cho khỏi thành hình elip. Không tính vào 45% của thảm cỏ
          //      mềm (ngưỡng chọn ô giữ nguyên, ô cỏ mềm sẵn có giữ nguyên); RNG riêng ⇒ cỏ chỗ khác y như cũ. Lõi khúc gỗ rỗng bỏ trống (nhìn qua miệng gỗ thấy cỏ) ----
          //      G 21/10 "1 chút thảm cỏ quanh gốc cây cổ thụ": vòng thảm ngắn r ~4,4 m quanh gốc (89, 117) — rễ, đá che phần lá mọc trong chúng; cụm nấm, nấm đỏ cao hơn thảm
          const LAWNS = [{ x: X0 + 103.3, z: Z0 + 109.4, rx: 8.5, rz: 10.5 }, { x: X0 + 89, z: Z0 + 117, rx: 4.6, rz: 4.2 }], lrnd = mulberry32(7171);
          const lawnAt = (i, j, x, z) => { let L = 0; for (const W of LAWNS) { const u = (x - W.x) / W.rx, v = (z - W.z) / W.rz; L = Math.max(L, 1 - u * u - v * v + 0.35 * (vnoise(i * 0.2 + 3, j * 0.2 + 11) - 0.5)); } return L > 0 && !deadLogOut(x, z, -0.15) ? L : 0; };
          let land = 0; const cand = [], lawnPad = [];
          for (let j = 4; j < GZ - 4; j++) for (let i = 4; i < GX - 4; i++) {
            if (isWater(i, j)) continue; land++;
            const x = wx(i), z = wz(j), onPad = padH(i, j) !== null, Lw = lawnAt(i, j, x, z);
            if (onPad && !Lw) continue;   // nền san phẳng: cỏ mềm không mọc, riêng vùng thảm ngắn thì có (bãi khúc gỗ nằm trên nền san phẳng)
            const moist = Math.exp(-wd[i + j * GX] / 9);
            if (roadContains(x, z, 0.3) || obstacleCoords.some(o => Math.hypot(x - o.x, z - o.z) < o.r * 0.85)) continue;   // không mọc trên đường nhựa, chân thân cây / xe / bếp / đồ đạc
            if (onPad) { lawnPad.push([0, i, j, moist, Lw]); continue; }
            let sc = 0.62 * vnoise(i * 0.045, j * 0.045) + 0.38 * vnoise(i * 0.14 + 17, j * 0.14 + 5) + 0.28 * moist;
            for (const [cx, cz, r] of camps) { const d = Math.hypot(x - cx, z - cz); if (d < r) sc -= 0.8 * (1 - d / r); }
            { const d = Math.hypot(x - pf.x, z - pf.z); if (d > 3.2 && d < 16) sc += 0.32 * Math.min(1, (d - 3.2) / 2) * Math.min(1, (16 - d) / 4); }   // vườn quanh trại: cỏ dày bao quanh (ngoài vòng đất nện)
            cand.push([sc, i, j, moist, Lw]);
          }
          const want = Math.round(0.45 * land), sorted = cand.map(c => c[0]).sort((a, b) => a - b);
          const thr = cand.length > want ? sorted[cand.length - want] : -1e9, top = sorted[sorted.length - 1] || 1;
          const cells = cand.filter(c => c[0] >= thr), lawn = [...lawnPad, ...cand.filter(c => c[4] > 0 && c[0] < thr)];   // ô cỏ mềm sẵn có trong vùng vẫn giữ lá cao (bụi cỏ giữa thảm)
          // ---- KHẢM CỎ CAO / THẤP (G 23/10 "ngoài tự nhiên nhóm cỏ cao hơn nhóm khác, nhìn nhấp nhô"): đồng cỏ có bò là KHẢM MẢNG — bò gặm đi gặm lại chỗ cỏ non
          //      thành mảng thấp (bò ưa < ~10 cm), chừa mảng cao ở chỗ cỏ già cứng và quanh BÃI PHÂN (bò tránh gặm ⇒ cỏ rậm, xanh đậm vì giàu đạm); mảng vài mét,
          //      ranh khá rõ (Plant Soil Environ. 2019 · Frontiers Vet. Sci. 2021 "patch grazing" · luận án Edinburgh: bò gặm làm thảm cỏ lệch cao thấp nhiều hơn
          //      cừu). Mảng ~2,5 m: gặm sát ×0,4 ⇄ cỏ già ×1,7 (+ gợn ~1 m ở mép); bãi phân 1/140 ô, bán kính 0,8–1,6 m: cỏ cao ×1,4–1,75, tươi đậm hơn; nền đất dưới
          //      mảng cao xanh sẫm, mảng gặm ngả vàng nhạt ⇒ nhìn xa (lá đã ẩn) vẫn thấy khảm.
          //      Trong mỗi ô cỏ mọc thành KHÓM (shader: giữa khóm cao, khe thấp, lá xoè ra — bụi cỏ cách nhau ~0,3 m, Hovanes 2018) ----
          const DUNG = [], drnd = mulberry32(2323);   // RNG riêng: không đổi chuỗi rnd() ⇒ cỏ, hoa chỗ khác giữ nguyên
          for (const c of cells) if (drnd() < 1 / 140) DUNG.push({ x: wx(c[1]) + (drnd() - 0.5) * BLOCK, z: wz(c[2]) + (drnd() - 0.5) * BLOCK, r: 0.8 + 0.8 * drnd() });
          function patchK(i, j, x, z) {
            const a = vnoise(i * 0.24 + 71, j * 0.24 + 19) + 0.3 * (vnoise(i * 0.7 + 5, j * 0.7 + 33) - 0.5);
            let k = 0.4 + 1.3 * THREE.MathUtils.smoothstep(a, 0.4, 0.62);   // gặm sát ×0,4 (3–8 cm thật) ⇄ cỏ già ×1,7
            for (const D of DUNG) { const d = Math.hypot(x - D.x, z - D.z); if (d < D.r) k = Math.max(k, 1.4 + 0.35 * Math.sqrt(1 - d / D.r)); }
            return k;
          }
          // ---- màu đất thật dưới từng ô (màu bậc địa hình × sắc độ ô × màu trung bình texture cỏ) + tô loang mảng cỏ lên mặt đất (thấy được cả khi nhìn xa) ----
          const texMean = new THREE.Color(0xd9d6c8);   // (Color(hex) đã tự đổi sRGB → tuyến tính; đổi thêm lần nữa làm gốc lá tối gấp 2,3)
          const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _c = new THREE.Color();
          // ô không phẳng có mặt trên + các mặt bên ở nhiều lưới: gom hết (lưới, chỉ số) để tô cùng màu — bảng nén kiểu CSR (G 19/10 "lưu dữ liệu cỏ gọn hơn"):
          //  tS[ô] … tS[ô + 1] = đoạn của ô trong tD, mỗi phần tử = chỉ số lưới (trong TM) << 24 | chỉ số instance. Bản Map ô → [lưới, k, …] cũ tốn ~10 MB heap JS
          const TM = terrainMeshes.filter(im => im.isInstancedMesh && im.instanceColor && (im.material === grassMat || im.material === shoreMat));
          let nT = 0; for (const im of TM) nT += im.count;
          const tKey = new Int32Array(nT), tS = new Int32Array(N + 1), tD = new Int32Array(nT);
          { let t = 0; for (const im of TM) for (let k = 0; k < im.count; k++) { im.getMatrixAt(k, _m); _p.setFromMatrixPosition(_m); const key = Math.round(x2gi(_p.x)) + Math.round(z2gj(_p.z)) * GX; tKey[t++] = key >= 0 && key < N ? key : -1; if (key >= 0 && key < N) tS[key + 1]++; }
            for (let i = 0; i < N; i++) tS[i + 1] += tS[i];
            const cur = tS.slice(0, N); t = 0; TM.forEach((im, mi) => { for (let k = 0; k < im.count; k++) { const key = tKey[t++]; if (key >= 0) tD[cur[key]++] = (mi << 24) | k; } }); }
          const topN = key => key >= 0 && key < N ? tS[key + 1] - tS[key] : 0, topIm = (key, n) => TM[tD[tS[key] + n] >>> 24], topK = (key, n) => tD[tS[key] + n] & 0xffffff;
          const lushOf = (i, j, moist) => Math.max(0, Math.min(1, 0.3 + 0.7 * moist + 0.6 * (vnoise(i * 0.09 + 41, j * 0.09 + 7) - 0.5)));
          const dirty = new Set(), _cL = new THREE.Color(), _lawnTint = new THREE.Color(0.8, 1.0, 0.62), _paleTint = new THREE.Color(1.12, 1.1, 0.78);
          for (const [sc, i, j, moist, L] of [...cells, ...lawn]) {
            const key = i + j * GX, nt = topN(key); if (!nt) continue;
            const lush = L ? 0.75 : lushOf(i, j, moist), dens = L ? 0.6 : Math.min(1, (sc - thr) / Math.max(1e-3, top - thr));
            topIm(key, 0).getColorAt(topK(key, 0), _c); _c.multiplyScalar(1.015 + 0.05 * dens).lerp(_c.clone().offsetHSL(0.012 * (lush - 0.5), 0.04, 0), 0.6);   // mặt đất dưới mảng cỏ: tươi hơn chút
            if (L) { const e = Math.min(1, L / 0.3); _c.lerp(_cL.copy(_c).multiply(_lawnTint), 0.85 * e); }   // thảm ngắn: nền xanh đậm như cỏ mượt, loang dần ra mép
            else { const pk = patchK(i, j, wx(i), wz(j)); if (pk > 1) _c.multiplyScalar(1 - 0.16 * (pk - 1)); else _c.lerp(_cL.copy(_c).multiply(_paleTint), 0.45 * (1 - pk) / 0.6); }   // khảm: mảng cỏ già sẫm · mảng gặm sát nhạt vàng
            for (let q = 0; q < nt; q++) { const im = topIm(key, q); im.setColorAt(topK(key, q), _c); dirty.add(im); }
          }
          for (const im of dirty) im.instanceColor.needsUpdate = true;
          // ---- dữ liệu từng ô (xếp theo mảng 24 × 24 ô để cắt khung nhìn) ----
          const chunks = new Map();
          for (const c of [...cells, ...lawn, ...lawn, ...lawn]) { const key = ((c[1] / CH) | 0) + ',' + ((c[2] / CH) | 0); if (!chunks.has(key)) chunks.set(key, []); chunks.get(key).push(c); }   // thảm ngắn: 3 bản/ô
          const nC = cells.length + 3 * lawn.length, R = new Float32Array(nC * 3), C4 = new Float32Array(nC * 4), BC = new Float32Array(nC * 3), IJ = new Int32Array(nC), parts = [];
          let n = 0;
          for (const list of chunks.values()) {
            const box = new THREE.Box3(); const start = n;
            for (const [sc, i, j, moist, L] of list) {
              const x = wx(i), z = wz(j), y = surfaceY(i, j);
              R[n * 3] = x; R[n * 3 + 1] = y; R[n * 3 + 2] = z; IJ[n] = i + j * GX;
              if (L && sc < thr) {   // thảm ngắn (ô cỏ mềm sẵn có trong vùng: sc ≥ thr, giữ lá cao): lá 9–15 cm (thấp dần ra mép), độ tươi mã hoá +2 (shader nhận ra để vẽ lá mảnh), hoa li ti trắng / vàng ~2,5%
                C4[n * 4] = (0.09 + 0.06 * lrnd()) * (0.45 + 0.55 * Math.min(1, L / 0.25)); C4[n * 4 + 1] = lrnd(); C4[n * 4 + 2] = 2.75 + 0.12 * (lrnd() - 0.5); C4[n * 4 + 3] = lrnd() < 0.025 ? 1 + ((lrnd() * 2) | 0) : 0;
              } else {
                const dens = Math.min(1, (sc - thr) / Math.max(1e-3, top - thr)), edge = Math.min(1, (sc - thr) / 0.09);
                const pk = patchK(i, j, x, z), lush = Math.max(0, Math.min(1, lushOf(i, j, moist) + 0.32 * (pk - 1))), h = Math.min(0.62, (0.15 + 0.17 * Math.pow(dens, 0.7) + 0.07 * moist) * (0.88 + 0.24 * rnd()) * (0.4 + 0.6 * edge) * pk);   // × khảm mảng · mảng cao tươi hơn
                C4[n * 4] = h; C4[n * 4 + 1] = rnd(); C4[n * 4 + 2] = lush; C4[n * 4 + 3] = rnd() < 0.06 ? 1 + ((rnd() * 4) | 0) : 0;   // chiều cao · hạt giống · độ tươi · hoa dại (0 = không, 1–4 = màu)
              }
              const key = i + j * GX; if (topN(key)) { topIm(key, 0).getColorAt(topK(key, 0), _c); _c.multiply(texMean); } else _c.setRGB(0.3, 0.42, 0.18);
              BC[n * 3] = _c.r; BC[n * 3 + 1] = _c.g; BC[n * 3 + 2] = _c.b;
              box.expandByPoint(_p.set(x - 0.4, y, z - 0.4)); box.expandByPoint(_p.set(x + 0.4, y + 0.6, z + 0.4));
              n++;
            }
            parts.push({ start, count: n - start, box });
          }
          // ---- hình 1 ô: K lá rải đều (lưới 4 × 4 xáo trộn) trong ô, mỗi lá N đoạn (dải thuôn + 1 đỉnh ngọn) ----
          function patchGeo(K, NS) {
            const P = [], Bl = [], Id = [], I = [], slots = [];
            for (let a = 0; a < 5; a++) for (let b = 0; b < 5; b++) slots.push([(a + 0.5) / 5 - 0.5, (b + 0.5) / 5 - 0.5]);
            for (let k = slots.length - 1; k > 0; k--) { const r = (rnd() * (k + 1)) | 0; [slots[k], slots[r]] = [slots[r], slots[k]]; }
            for (let k = 0; k < K; k++) {
              const s = slots[k % 25], ox = (s[0] + (rnd() - 0.5) * 0.18) * BLOCK, oz = (s[1] + (rnd() - 0.5) * 0.18) * BLOCK;
              const yaw = rnd() * 6.2832, hk = k === 0 ? 1 : 0.55 + 0.45 * rnd(), cv = 0.12 + 0.4 * rnd(), b0 = P.length / 3;
              for (let r = 0; r < NS; r++) { const t = r / NS; for (const sd of [-1, 1]) { P.push(ox, t, oz); Bl.push(sd, yaw, hk, cv); Id.push(k / K); } }
              P.push(ox, 1, oz); Bl.push(0, yaw, hk, cv); Id.push(k / K);
              for (let r = 0; r < NS - 1; r++) { const v = b0 + r * 2; I.push(v, v + 1, v + 2, v + 1, v + 3, v + 2); }
              const v = b0 + (NS - 1) * 2; I.push(v, v + 1, v + 2);
            }
            const g = new THREE.InstancedBufferGeometry();
            g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('aBlade', new THREE.Float32BufferAttribute(Bl, 4)); g.setAttribute('aIdx', new THREE.Float32BufferAttribute(Id, 1)); g.setIndex(I);
            return g;
          }
          const aRoot = new THREE.InstancedBufferAttribute(new Float32Array(nC * 3), 3).setUsage(THREE.DynamicDrawUsage);
          const aCell = new THREE.InstancedBufferAttribute(new Float32Array(nC * 4), 4).setUsage(THREE.DynamicDrawUsage);
          const aBase = new THREE.InstancedBufferAttribute(new Float32Array(nC * 3), 3).setUsage(THREE.DynamicDrawUsage);
          const LODS = [[patchGeo(5, 2), 10], [patchGeo(8, 3), 24], [patchGeo(20, 4), 60]];   // [hình ô, từ bao nhiêu điểm ảnh / đv] — xa · vừa · gần (≤ ~0,8 triệu đỉnh ở mọi mức phóng)
          for (const [g] of LODS) { g.setAttribute('aRoot', aRoot); g.setAttribute('aCell', aCell); g.setAttribute('aBase', aBase); g.instanceCount = 0; }
          // ---- vật liệu: Lambert của cảnh (ánh sáng, bóng đổ, sương, đèn đêm như mặt đất) + dựng lá, gió, giẫm, màu gốc → ngọn ----
          const U = { uFade: { value: 0 }, uDensity: { value: 1 }, uMTime: { value: 0 }, uCamRight: { value: new THREE.Vector3(1, 0, 0) }, uGlow: { value: new THREE.Color(0, 0, 0) },
            uPush: { value: [new THREE.Vector4(0, 0, 1, 0), new THREE.Vector4(0, 0, 1, 0), new THREE.Vector4(0, 0, 1, 0)] } };
          const mat = new THREE.MeshLambertMaterial({ color: 0xffffff, side: THREE.DoubleSide });
          mat.onBeforeCompile = shader => {
            Object.assign(shader.uniforms, sceneWind.u, U); windUniforms.set(mat.uuid, shader.uniforms);
            shader.vertexShader = WIND_GLSL_COMMON + '\n' + GRASS_GLSL + `
              attribute vec4 aBlade; attribute float aIdx; attribute vec3 aRoot; attribute vec4 aCell; attribute vec3 aBase;
              uniform float uFade, uDensity, uMTime; uniform vec3 uCamRight; uniform vec4 uPush[3];
              varying float vT, vLush, vBend, vFlower, vShade, vLawn; varying vec3 vBase;
              ` + shader.vertexShader
              .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3( 0.0, 1.0, 0.0 );   // pháp tuyến mặt đất')
              .replace('#include <begin_vertex>', `
                float t = position.y, sd = aBlade.x, seed = aCell.y, lawn = step(1.5, aCell.z);   // độ tươi > 1,5 = ô thảm cỏ ngắn
                float flower = (aIdx < 0.001 && aCell.w > 0.5) ? aCell.w : 0.0;
                float h = aCell.x * aBlade.z * uFade * step(aIdx, uDensity - 1e-4) * (flower > 0.0 ? 1.18 : 1.0);
                float ra = seed * 6.2832, cr = cos(ra), sr = sin(ra);   // xoay cả ô ⇒ ô cạnh nhau không lặp mẫu
                vec2 off = vec2(position.x * cr - position.z * sr, position.x * sr + position.z * cr);
                vec3 root = aRoot + vec3(off.x, 0.0, off.y);
                vec2 fwd = vec2(cos(aBlade.y + ra), sin(aBlade.y + ra)), s0 = vec2(-fwd.y, fwd.x), sc = normalize(uCamRight.xz + 1e-5);
                vec2 lp = position.xz / ${BLOCK.toFixed(4)}, cc = (vec2(fract(seed * 3.71), fract(seed * 5.37)) - 0.5) * 0.45, ow = lp - cc;   // KHÓM CỎ (G 23/10): tâm khóm lệch trong ô theo hạt giống ô
                float tr = 0.24 + 0.14 * fract(seed * 9.13), cd = length(ow), tw = (1.0 - 0.8 * lawn) * (h < 0.07 ? 0.3 : 1.0) * (flower > 0.0 ? 0.0 : 1.0);
                h *= mix(1.0, mix(0.35, 1.3, 1.0 - smoothstep(0.0, tr, cd)), tw);   // giữa khóm cao, khe giữa các khóm thấp (thảm cắt ngắn, cỏ vừa phát gần như đều, cọng hoa giữ nguyên)
                if (cd > 1e-3) fwd = normalize(mix(fwd, vec2(ow.x * cr - ow.y * sr, ow.x * sr + ow.y * cr) / cd, 0.55 * tw * smoothstep(0.03, 0.12, cd)));   // lá xoè ra ngoài khóm (hệ ô đã xoay)
                vec2 sv = normalize(mix(s0 * (dot(s0, sc) >= 0.0 ? 1.0 : -1.0), sc, 0.55));   // bề ngang lá: nửa theo lá, nửa vuông góc hướng nhìn
                float w = 0.016 * (1.0 - 0.86 * t) * sd * (0.8 + 0.4 * fract(seed * 7.13)) * (flower > 0.0 && t > 0.8 ? 3.2 : 1.0) * (1.0 - 0.4 * lawn);
                float bend = aBlade.w * t * t * h;
                vec3 p = root + vec3(fwd.x * bend + sv.x * w, t * h * (1.0 - 0.22 * aBlade.w * t), fwd.y * bend + sv.y * w);
                vec3 wd = grassWind(root, t, h);
                wd.xz += s0 * sin(uMTime * (4.5 + 3.0 * fract(seed * 13.7)) + aBlade.y * 3.0 + seed * 40.0) * 0.05 * h * t * t;   // rung nhẹ từng lá
                for (int k = 0; k < 3; k++) {   // giẫm: lá rạp ra xa người / thú đang đứng, rồi bật lại
                  vec2 d = root.xz - uPush[k].xy; float dl = length(d), f = uPush[k].w * (1.0 - smoothstep(uPush[k].z * 0.45, uPush[k].z, dl));
                  if (f > 0.0) { vec2 dir = dl > 1e-4 ? d / dl : fwd; wd.xz += dir * f * h * t * 0.95; wd.y -= f * h * t * t * 0.6; }
                }
                p += wd;
                vT = t; vBase = aBase; vLush = aCell.z - 2.0 * lawn; vLawn = lawn; vFlower = flower; vShade = 0.94 + 0.12 * fract(sin(aIdx * 91.7 + seed * 47.3) * 437.5);   // mỗi lá sáng tối lệch nhẹ vBend = clamp(length(wd.xz) / max(h, 0.05), 0.0, 1.0);
                vec3 transformed = p;`);
            shader.fragmentShader = `uniform vec3 uGlow; varying float vT, vLush, vBend, vFlower, vShade, vLawn; varying vec3 vBase;\n` + shader.fragmentShader
              .replace('#include <color_fragment>', `
                vec3 gBase = vBase * (0.97 - 0.13 * vLawn);                                                        // gốc: đúng màu đất (che khuất rất nhẹ) ⇒ cỏ mọc ra từ nền
                vec3 gTip = mix(vBase * vec3(1.26, 1.2, 0.84), vBase * vec3(1.2, 1.3, 1.04) + vec3(0.01, 0.02, 0.0), vLush) * (1.0 + 0.12 * vLawn);   // ngọn SÁNG hơn nền: khô ngả vàng-xanh ấm ↔ tươi xanh mướt
                vec3 gCol = mix(gBase, gTip, smoothstep(0.0, 1.0, vT)) * vShade;
                gCol *= 1.0 + 0.16 * vBend * vT;                                                 // ngọn sóng gió bắt sáng
                if (vFlower > 0.5 && vT > 0.82) gCol = vFlower < 1.5 ? vec3(0.86, 0.85, 0.8) : vFlower < 2.5 ? vec3(0.9, 0.72, 0.16) : vFlower < 3.5 ? vec3(0.88, 0.45, 0.55) : vec3(0.62, 0.48, 0.85);
                diffuseColor.rgb *= gCol;`)
              .replace('#include <normal_fragment_begin>', '#include <normal_fragment_begin>\n                normal = normalize( vNormal );   // không lật theo mặt sau: cả 2 mặt lá sáng như mặt đất')
              .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n                totalEmissiveRadiance += uGlow * vT * vT * vT * (0.7 + 0.3 * vLush);   // nắng thấp xuyên qua phần ngọn lá: ửng vàng (không phụ thuộc độ rọi)');
          };
          mat.customProgramCacheKey = () => 'meadow1';
          const mk = g => { const m = new THREE.Mesh(g, mat); m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false; m.name = 'Thảm cỏ'; m.userData.noBatch = m.userData.noRainOcc = true; m.visible = false; scene.add(m); return m; };
          const meshes = LODS.map(([g]) => mk(g));
          // ---- mỗi khung: LOD theo cỡ điểm ảnh của 1 đv · cắt khung nhìn theo mảng khi camera đổi · gió, giẫm, ráng chiều ----
          const frus = new THREE.Frustum(), _pm = new THREE.Matrix4(), last = new Float32Array(17);
          function cull() {
            _pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frus.setFromProjectionMatrix(_pm);
            let k = 0; slot.fill(-1);
            for (const pt of parts) {
              if (!frus.intersectsBox(pt.box)) continue;
              for (let q = 0; q < pt.count; q++) slot[pt.start + q] = k + q;
              aRoot.array.set(R.subarray(pt.start * 3, (pt.start + pt.count) * 3), k * 3);
              aCell.array.set(C4.subarray(pt.start * 4, (pt.start + pt.count) * 4), k * 4);
              aBase.array.set(BC.subarray(pt.start * 3, (pt.start + pt.count) * 3), k * 3);
              k += pt.count;
            }
            for (const [a, s] of [[aRoot, 3], [aCell, 4], [aBase, 3]]) { if (a.clearUpdateRanges) { a.clearUpdateRanges(); a.addUpdateRange(0, k * s); } a.needsUpdate = true; }
            for (const [g] of LODS) g.instanceCount = k;
          }
          // ---- CẮT CỎ (G 18/10: kỹ sư phát cỏ quanh trại sau mưa — engineer/tasks/trim-grass.js): ô có tâm trong tầm lưỡi ⇒ lá còn 4–6 cm, mất hoa dại; ô đang
          //      hiện trên màn hình (slot ≥ 0 sau lượt cắt khung nhìn) ghi thẳng vào thuộc tính instance, ô khác đọc lại từ C4 ở lượt cull sau ----
          const cutT = new Uint8Array(nC), slot = new Int32Array(nC).fill(-1), bS = new Int32Array(N + 1), bQ = new Int32Array(nC);   // ô lưới → các ô cỏ (CSR như tS / tD; bản cũ Map → mảng ~3 MB)
          for (let q = 0; q < nC; q++) bS[IJ[q] + 1]++;
          for (let i = 0; i < N; i++) bS[i + 1] += bS[i];
          { const cur = bS.slice(0, N); for (let q = 0; q < nC; q++) bQ[cur[IJ[q]]++] = q; }
          function cellsIn(x, z, r, fn) {   // fn(q) cho mọi ô có tâm cách (x, z) < r
            const i0 = Math.floor(x2gi(x - r)), i1 = Math.ceil(x2gi(x + r)), j0 = Math.floor(z2gj(z - r)), j1 = Math.ceil(z2gj(z + r));
            for (let j = Math.max(0, Math.min(j0, j1)); j <= Math.min(GZ - 1, Math.max(j0, j1)); j++) for (let i = Math.max(0, Math.min(i0, i1)); i <= Math.min(GX - 1, Math.max(i0, i1)); i++) { const c = i + j * GX;
              for (let a = bS[c]; a < bS[c + 1]; a++) { const q = bQ[a]; if (Math.hypot(R[q * 3] - x, R[q * 3 + 2] - z) < r) fn(q); } }
          }
          const mownKey = new Set(), _mw = new THREE.Color(), MOWN = new THREE.Color(0.36, 0.47, 0.15);   // đất dưới ô vừa phát: sáng + ngả vàng xanh như bãi vừa cắt (thấy cả khi nhìn xa, lá cỏ đã ẩn)
          function cutAt(x, z, r) {   // trả số ô vừa cắt
            let n = 0;
            cellsIn(x, z, r, q => { if (cutT[q]) return; cutT[q] = 1; n++;
              const h = Math.min(C4[q * 4], 0.03 + 0.02 * C4[q * 4 + 1]); C4[q * 4] = h; C4[q * 4 + 3] = 0;
              if (!mownKey.has(IJ[q])) { mownKey.add(IJ[q]); const key = IJ[q];
                for (let k = 0, nt = topN(key); k < nt; k++) { const im = topIm(key, k), ik = topK(key, k); im.getColorAt(ik, _mw); _mw.multiplyScalar(1.1).lerp(MOWN, 0.2); im.setColorAt(ik, _mw); im.instanceColor.needsUpdate = true; } }
              const s = slot[q]; if (s >= 0) { aCell.array[s * 4] = h; aCell.array[s * 4 + 3] = 0; if (aCell.addUpdateRange) aCell.addUpdateRange(s * 4, 4); aCell.needsUpdate = true; } });
            return n;
          }
          function grassNear(x, z, r) { let f = false; cellsIn(x, z, r, () => { f = true; }); return f; }
          function flowerNear(x, z, r) {   // ô có hoa dại (chưa cắt) gần (x, z) nhất trong bán kính r → [x, y, z] tâm ô, hoặc null (engineer/mind/env-react.js: ngồi ngửi hoa)
            let b = -1, bd = r; cellsIn(x, z, r, q => { if (!C4[q * 4 + 3] || cutT[q]) return; const d = Math.hypot(R[q * 3] - x, R[q * 3 + 2] - z); if (d < bd) { bd = d; b = q; } });
            return b < 0 ? null : [R[b * 3], R[b * 3 + 1], R[b * 3 + 2]];
          }
          function cutFrac(x, z, r0, r1) {   // phần ô đã cắt trong vành khăn r0–r1 quanh (x, z)
            let a = 0, c = 0; cellsIn(x, z, r1, q => { if (Math.hypot(R[q * 3] - x, R[q * 3 + 2] - z) < r0) return; a++; if (cutT[q]) c++; }); return a ? c / a : 1;
          }
          const _cr = new THREE.Vector3(), _cd = new THREE.Vector3(), _sd = new THREE.Vector3();
          return {
            cells: nC, land, frac: nC / land, cellAt: k => [R[k * 3], R[k * 3 + 1], R[k * 3 + 2]], cutAt, grassNear, flowerNear, cutFrac,   // (đo kiểm) · cắt cỏ
            update(dt, t) {
              const ppu = renderer.domElement.height / ((camera.top - camera.bottom) / camera.zoom);   // điểm ảnh / đv
              const fade = Math.max(0, Math.min(1, (ppu - 9) / 8));
              U.uFade.value = fade * fade * (3 - 2 * fade);
              const on = fade > 0.001; let lod = 0; for (let i = 1; i < LODS.length; i++) if (ppu >= LODS[i][1]) lod = i;
              meshes.forEach((m, i) => { m.visible = on && i === lod; });
              if (!on) return;
              U.uDensity.value = 1;
              U.uMTime.value = t % 1000;
              camera.updateMatrixWorld(); _cr.setFromMatrixColumn(camera.matrixWorld, 0); U.uCamRight.value.copy(_cr);
              let changed = last[16] !== camera.zoom; for (let i = 0; i < 16; i++) if (last[i] !== camera.matrixWorld.elements[i]) { changed = true; break; }
              if (changed) { last.set(camera.matrixWorld.elements); last[16] = camera.zoom; cull(); }
              // giẫm: kỹ sư (ngoài trời), chó, gấu mèo
              const P = U.uPush.value, put = (k, o, r, on) => { if (on) P[k].set(o.x, o.z, r, 1); else P[k].w = 0; };
              put(0, engObj.g.position, 0.55, !engObj.inVan && engObj.g.parent === scene);
              put(1, dogObj.position, 0.42, !dogRain.st || dogRain.st === 'toDoor' || dogRain.st === 'toFire');
              put(2, raccoonObj.position, 0.38, raccoonObj.visible);
              // giờ vàng: mặt trời còn trên chân trời nhưng thấp (≈1–10°) → nắng xiên xuyên qua ngọn lá, ửng vàng; tắt khi lặn
              const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
              //   nhìn NGƯỢC nắng (mặt trời ở phía trước camera) thì lá sáng xuyên rõ nhất, xuôi nắng còn ~1/3
              camera.getWorldDirection(_cd); _cd.y = 0; _sd.copy(sun.position).sub(sun.target.position); _sd.y = 0;
              const back = _cd.lengthSq() > 1e-6 && _sd.lengthSq() > 1e-6 ? Math.max(0, _cd.normalize().dot(_sd.normalize())) : 0;
              const low = sm(-0.01, 0.045, sunElevSin) * (1 - sm(0.12, 0.3, sunElevSin)) * (0.35 + 0.65 * back);
              U.uGlow.value.setRGB(0.26 * low, 0.15 * low, 0.032 * low);
            }
          };
        })();
