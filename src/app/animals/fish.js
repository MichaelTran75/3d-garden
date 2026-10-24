        // ---- fish in the downstream river ----
        const fishies = [];
        // phân sắc tố cho đàn koi: 2 con đầu ĐEN · con thứ 3 ĐỎ-ĐEN lẫn · còn lại ĐỎ (tổng 10 con)
        let _koiN = 0;
        const koiPattern = () => { const i = _koiN++; return i < 2 ? 'black' : i === 2 ? 'mixed' : 'red'; };
        // ---- KOI (G 14/10: "study koi fish glb then improve the detail") — dáng thân ĐO từ mẫu "Koi Fish" (Xfdfgd, Sketchfab, CC-BY-4.0; chỉ đo, không
        //      nhúng lưới/ảnh): duỗi xương sống của mẫu đang uốn (vòng đẳng trắc địa từ mũi), cao thân lớn nhất ≈ 25% dài thân (mũi → cuống đuôi), rộng
        //      nhất ≈ 21% ở vùng mang; LƯNG GÙ (đường giữa nâng ~5% dài thân ở giữa mình) còn BỤNG gần thẳng; vây lưng dài từ 1/3 thân tới sát cuống
        //      đuôi, cao dần về trước; vây ngực tròn ngay sau mang; vây bụng ~0,42; vây hậu môn sát cuống; đuôi dài ~40% thân, chẻ 2 thuỳ tròn;
        //      2 cặp râu ở mép miệng; mắt thấp gần mõm có viền mống. Da = canvas riêng mỗi con: vảy xếp ngói (cung lồi về đuôi), mảng hi (đỏ) / sumi
        //      (đen) mép loang theo vảy, đốm đỏ đỉnh đầu, nắp mang, lỗ mũi; vây trắng có tia. Thân + vây chung 1 lưới, bơi = sóng ngang trên CPU ----
        const KOI_U = [0, 0.044, 0.086, 0.177, 0.25, 0.333, 0.414, 0.496, 0.576, 0.653, 0.737, 0.824, 0.911, 1.0];
        const KOI_H = [0.047, 0.104, 0.126, 0.153, 0.172, 0.179, 0.180, 0.179, 0.167, 0.154, 0.137, 0.117, 0.097, 0.089];   // nửa cao (× s)
        const KOI_W = [0.046, 0.112, 0.123, 0.126, 0.152, 0.142, 0.127, 0.123, 0.110, 0.092, 0.073, 0.063, 0.053, 0.032];   // nửa rộng
        const KOI_Y = [-0.05, -0.041, -0.016, 0.011, 0.023, 0.032, 0.033, 0.026, 0.022, 0.022, 0.013, 0.006, 0.0, -0.01];   // đường giữa (lưng gù)
        const koiFinM = new THREE.MeshPhongMaterial({ side: THREE.DoubleSide, shininess: 30, specular: 0x222222 });
        const KOI_TW = 512, KOI_TH = 256, KOI_BW = 400, KOI_SX = 408;   // canvas da: thân u∈[0,1] → x 0…400 · ô vây có tia x 408…512
        function koiFinSwatch(c, x0, w) {   // màng vây trắng hơi trong: gốc ửng hồng, ngọn xanh nhạt, tia vây xám mảnh
          const gr = c.createLinearGradient(0, KOI_TH, 0, 0); gr.addColorStop(0, '#f1dfd6'); gr.addColorStop(0.35, '#f4efe9'); gr.addColorStop(1, '#dfe9ee');
          c.fillStyle = gr; c.fillRect(x0, 0, w, KOI_TH);
          c.strokeStyle = 'rgba(128,120,118,0.55)'; c.lineWidth = 1.4;
          for (let k = 0; k <= 13; k++) { const x = x0 + 2 + k * (w - 4) / 13; c.beginPath(); c.moveTo(x, KOI_TH); c.bezierCurveTo(x, KOI_TH * 0.6, x + 1.5, KOI_TH * 0.3, x + (k % 2 ? 1 : -1), 4); c.stroke(); }
          c.fillStyle = 'rgba(150,150,155,0.35)'; c.fillRect(x0, 0, w, 3);   // mép ngọn vây
        }
        if (!koiFinM.map) { const cv = document.createElement('canvas'); cv.width = 128; cv.height = KOI_TH; koiFinSwatch(cv.getContext('2d'), 0, 128); const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; koiFinM.map = tx; }
        function koiSkin(pattern) {   // canvas da riêng mỗi con (toạ độ: x = u dọc thân, y = góc quanh thân: mép trên/dưới = bụng, giữa = sống lưng)
          const cv = document.createElement('canvas'); cv.width = KOI_TW; cv.height = KOI_TH; const c = cv.getContext('2d');
          const X = u => u * KOI_BW, Y = phi => (0.5 + phi / (2 * Math.PI)) * KOI_TH;   // phi: góc tính từ sống lưng (0), ±π = bụng
          const gr = c.createLinearGradient(0, 0, 0, KOI_TH); gr.addColorStop(0, '#f6f2ee'); gr.addColorStop(0.5, '#ece4dc'); gr.addColorStop(1, '#f6f2ee');
          c.fillStyle = gr; c.fillRect(0, 0, KOI_BW + 8, KOI_TH);
          const hi = '#d9401f', hiEdge = 'rgba(240,120,60,0.55)', sumi = '#2b2724';
          const blob = (u, phi, ru, rf, col, edge) => {   // mảng màu hữu cơ: vài elip chồng nhau + quầng mép loang
            const parts = [[0, 0, 1, 1]]; for (let k = 0; k < 3; k++) parts.push([(Math.random() - 0.5) * ru * 1.1, (Math.random() - 0.5) * rf * 0.9, 0.55 + Math.random() * 0.4, 0.55 + Math.random() * 0.4]);
            for (const pass of edge ? [1, 0] : [0]) {
              c.fillStyle = pass ? edge : col;
              for (const [du, df, ku, kf] of parts) { const g = pass ? 1.12 : 1; c.beginPath(); c.ellipse(X(u + du), Y(phi + df), X(ru * ku * g), rf * kf * g / (2 * Math.PI) * KOI_TH, 0, 0, Math.PI * 2); c.fill(); }
            }
          };
          const spot = () => ({ u: 0.2 + Math.random() * 0.62, f: (Math.random() - 0.5) * 1.4, ru: 0.06 + Math.random() * 0.08, rf: 0.55 + Math.random() * 0.5 });
          const n = 2 + (Math.random() * 3 | 0);
          if (pattern === 'black') { for (let k = 0; k < n + 1; k++) { const p = spot(); blob(p.u, p.f, p.ru * 0.8, p.rf * 0.8, sumi, null); } }   // trắng + đốm mực (kiểu Shiro Bekko)
          else {
            for (let k = 0; k < n; k++) { const p = spot(); blob(p.u, p.f, p.ru, p.rf, hi, hiEdge); }   // Kohaku: mảng hi đỏ trên lưng
            if (Math.random() < 0.6) blob(0.075 + Math.random() * 0.03, 0, 0.05, 0.6, hi, hiEdge);   // đốm đỏ đỉnh đầu
            if (pattern === 'mixed') for (let k = 0; k < 4; k++) { const p = spot(); blob(p.u, p.f, p.ru * 0.35, p.rf * 0.35, sumi, null); }   // Sanke: thêm đốm mực nhỏ
          }
          // bụng luôn trắng: phủ lại dải bụng (2 mép canvas)
          for (const y0 of [0, KOI_TH]) { const g2 = c.createLinearGradient(0, y0, 0, KOI_TH / 2); g2.addColorStop(0, '#f6f2ee'); g2.addColorStop(0.42, 'rgba(246,242,238,1)'); g2.addColorStop(0.62, 'rgba(246,242,238,0)'); c.fillStyle = g2; c.fillRect(0, Math.min(y0, KOI_TH / 2), KOI_BW + 8, KOI_TH / 2); }
          // vảy xếp ngói: hàng cung lồi về phía đuôi, so le; vùng đầu (u < 0,2) không vảy
          c.lineWidth = 1.1;
          const sw = KOI_BW / 34, sh = KOI_TH / 22, img = c.getImageData(0, 0, KOI_BW, KOI_TH).data;   // đọc màu nền 1 lần: vảy trên mảng màu thì nét đậm hơn
          for (let r = 0; r <= 22; r++) for (let q = 0; q < 34; q++) {
            const u = (q + (r % 2) * 0.5) / 34; if (u < 0.205 || u > 0.985) continue;
            const x = X(u), y = r * sh, onCol = img[((Math.min(KOI_TH - 1, y | 0) * KOI_BW) + Math.min(KOI_BW - 1, x | 0)) * 4 + 1] < 150;
            c.strokeStyle = onCol ? 'rgba(90,20,10,0.35)' : 'rgba(110,100,100,0.28)';
            c.beginPath(); c.arc(x - sw * 0.25, y, sw * 0.62, -1.15, 1.15); c.stroke();
          }
          // nắp mang (đường cong sau mắt) · lỗ mũi · khoé miệng
          c.strokeStyle = 'rgba(120,105,100,0.55)'; c.lineWidth = 2;
          for (const sd of [-1, 1]) { c.beginPath(); for (let k = 0; k <= 12; k++) { const phi = sd * (0.7 + k / 12 * 1.6), u = 0.19 - 0.035 * Math.sin(k / 12 * Math.PI); k ? c.lineTo(X(u), Y(phi)) : c.moveTo(X(u), Y(phi)); } c.stroke(); }
          c.fillStyle = 'rgba(60,45,45,0.8)'; for (const sd of [-1, 1]) { c.beginPath(); c.arc(X(0.032), Y(sd * 0.55), 2.2, 0, Math.PI * 2); c.fill(); }
          c.strokeStyle = 'rgba(150,90,85,0.7)'; c.lineWidth = 1.5; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(X(0.0), Y(sd * 2.3)); c.lineTo(X(0.03), Y(sd * 2.5)); c.stroke(); }
          koiFinSwatch(c, KOI_SX, KOI_TW - KOI_SX);
          const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 4;
          return tx;
        }
        function fish(s, pattern) {
          s *= 0.9;   // Cá koi nhỏ đi 10%
          const g = new THREE.Group();
          const L = 1.1, SL = s * L;
          function prof(arr, u) {   // Catmull-Rom qua các mốc đo
            let i = 0; while (i < KOI_U.length - 2 && u > KOI_U[i + 1]) i++;
            const t = Math.min(1, Math.max(0, (u - KOI_U[i]) / (KOI_U[i + 1] - KOI_U[i])));
            const p0 = arr[Math.max(0, i - 1)], p1 = arr[i], p2 = arr[i + 1], p3 = arr[Math.min(arr.length - 1, i + 2)];
            const t2 = t * t, t3 = t2 * t;
            return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
          }
          const NS = 34, M = 20;
          const pos = [], uv = [], idx = [];
          const xNose = 0.52 * SL, bodyLen = 1.30 * SL, xT = xNose - bodyLen;
          const UVc = (cx, cy) => uv.push(cx / KOI_TW, 1 - cy / KOI_TH);   // canvas → uv (CanvasTexture lật dọc)
          function ring(x, yc, h, w, uvf, xOfSin) {   // 1 vòng tiết diện (M+1 đỉnh: đường nối ở BỤNG, toàn trắng); lưng gồ sống · bụng tròn đầy
            const i0 = pos.length / 3;
            for (let j = 0; j <= M; j++) {
              const v = j / M, a = -Math.PI / 2 + v * Math.PI * 2, sn = Math.sin(a), cs = Math.cos(a);
              const wj = w * (sn > 0 ? 1 - 0.30 * sn * sn : 1 + 0.07 * sn * sn);
              pos.push(xOfSin ? xOfSin(sn) : x, yc + h * sn, wj * cs); uvf(v);
            }
            return i0;
          }
          function tube(r0, r1) { for (let j = 0; j < M; j++) idx.push(r0 + j, r0 + j + 1, r1 + j, r0 + j + 1, r1 + j + 1, r1 + j); }
          let prev = -1;
          for (let i = 0; i < NS; i++) {
            const u = i / (NS - 1);
            const r = ring(xNose - u * bodyLen, prof(KOI_Y, u) * s, prof(KOI_H, u) * s, prof(KOI_W, u) * s, v => UVc(u * KOI_BW, v * KOI_TH), null);
            if (prev >= 0) tube(prev, r); prev = r;
          }
          // mõm: chụp tròn
          const tip = pos.length / 3, y0 = prof(KOI_Y, 0) * s;
          pos.push(xNose + 0.03 * SL, y0 - 0.01 * s, 0); UVc(1, KOI_TH / 2);
          for (let j = 0; j < M; j++) idx.push(tip, j + 1, j);
          // --- ĐUÔI: chẻ 2 thuỳ tròn, dài ~0,4 thân; vòng đầu trùng vòng cuối thân nhưng lấy uv ở ô tia vây (tia toả từ cuống) ---
          const finStart = pos.length / 3;   // từ đây trở đi toàn màng vây → ép pháp tuyến hướng lên cho sáng
          const tailUV = (k) => v => UVc(KOI_SX + 2 + v * (KOI_TW - KOI_SX - 4), (1 - k) * KOI_TH * 0.98);
          const hP = prof(KOI_H, 1) * s, wP = prof(KOI_W, 1) * s, yP = prof(KOI_Y, 1) * s;
          prev = ring(xT, yP, hP, wP, tailUV(0), null);
          const TL = [{ dx: 0.06, h: 0.15, w: 0.022, sp: 0.02 }, { dx: 0.15, h: 0.24, w: 0.014, sp: 0.07 }, { dx: 0.25, h: 0.29, w: 0.009, sp: 0.15 }, { dx: 0.33, h: 0.30, w: 0.006, sp: 0.2 }, { dx: 0.37, h: 0.27, w: 0.004, sp: 0.18 }];
          TL.forEach((fd, k) => {
            const kk = (k + 1) / TL.length, fork = 0.11 * kk * kk;   // chẻ giữa: mép sau lùi ít ở giữa, nhiều ở 2 thuỳ
            const r = ring(0, yP - 0.004 * s, fd.h * s, fd.w * s, tailUV(kk), sn => xT - (fd.dx + fd.sp * Math.pow(Math.abs(sn), 1.15) - fork * (1 - Math.abs(sn))) * SL);
            tube(prev, r); prev = r;
          });
          // --- vây: màng 2 lớp (±δ) dùng ô tia vây; (sx, sy) = vị trí trên ô (0…1 ngang · 0 gốc → 1 ngọn) ---
          function plate(vp, vt, st) {
            const b0 = pos.length / 3, n = vp.length / 3, d = 0.005 * s;
            for (const zo of [d, -d]) for (let i = 0; i < n; i++) { pos.push(vp[i * 3], vp[i * 3 + 1], vp[i * 3 + 2] + zo); UVc(KOI_SX + 2 + st[i * 2] * (KOI_TW - KOI_SX - 4), (1 - st[i * 2 + 1]) * KOI_TH * 0.98); }
            for (let i = 0; i < vt.length; i += 3) idx.push(b0 + vt[i], b0 + vt[i + 1], b0 + vt[i + 2], b0 + n + vt[i + 2], b0 + n + vt[i + 1], b0 + n + vt[i]);
          }
          {   // vây LƯNG dài (u 0,33 → 0,93): cao ở trước, thấp dần, ngọn ngả về sau
            const vp = [], vt = [], st = [], DD = 10;
            for (let i = 0; i < DD; i++) {
              const q = i / (DD - 1), u = 0.33 + q * 0.6;
              const x = xNose - u * bodyLen, yb = (prof(KOI_Y, u) + prof(KOI_H, u)) * s - 0.01 * s, hh = (0.115 - 0.08 * q) * s * (1 - 0.6 * Math.max(0, 1 - q * 8));
              vp.push(x, yb, 0, x - 0.075 * SL * (1 - 0.35 * q), yb + hh, 0); st.push(q, 0, q, 1);
              if (i) { const a = (i - 1) * 2; vt.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
            }
            plate(vp, vt, st);
          }
          {   // vây HẬU MÔN sát cuống đuôi
            const vp = [], vt = [], st = [], AN = 4;
            for (let i = 0; i < AN; i++) {
              const q = i / (AN - 1), u = 0.82 + q * 0.14;
              const x = xNose - u * bodyLen, yb = (prof(KOI_Y, u) - prof(KOI_H, u)) * s + 0.008 * s;
              vp.push(x, yb, 0, x - 0.055 * SL, yb - (0.075 - 0.04 * q) * s, 0); st.push(q, 0, q, 1);
              if (i) { const a = (i - 1) * 2; vt.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); }
            }
            plate(vp, vt, st);
          }
          for (const sz of [-1, 1]) {   // cặp vây BỤNG (u ≈ 0,42): mái chèo tròn chếch ra sau–dưới
            const u = 0.42, x = xNose - u * bodyLen, yb = (prof(KOI_Y, u) - prof(KOI_H, u) * 0.8) * s, zb = sz * prof(KOI_W, u) * 0.55 * s;
            const vp = [x, yb, zb], st = [0.5, 0], vt = [], NPv = 5;
            for (let k = 0; k <= NPv; k++) { const a = -0.25 + k / NPv * 1.0, R = 0.15 * s; vp.push(x - Math.cos(a) * R * 1.1, yb - Math.sin(a) * R * 0.75, zb + sz * Math.sin(a) * R * 0.55); st.push(k / NPv, 1); if (k) vt.push(0, sz > 0 ? k : k + 1, sz > 0 ? k + 1 : k); }
            plate(vp, vt, st);
          }
          const bodyGeo = new THREE.BufferGeometry();
          bodyGeo.setIndex(idx);
          bodyGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
          bodyGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uv), 2));
          bodyGeo.computeVertexNormals();
          {   // đường nối ở bụng: lấy TB pháp tuyến 2 đỉnh trùng · màng vây dựng đứng bị chiếu cạnh → xám: ép pháp tuyến vây hướng lên cho màng sáng
            const nrm = bodyGeo.attributes.normal;
            for (let i = 0; i < NS; i++) { const a = i * (M + 1), b = a + M; const x = nrm.getX(a) + nrm.getX(b), y = nrm.getY(a) + nrm.getY(b), z = nrm.getZ(a) + nrm.getZ(b), l = Math.hypot(x, y, z) || 1; nrm.setXYZ(a, x / l, y / l, z / l); nrm.setXYZ(b, x / l, y / l, z / l); }
            for (let i = finStart; i < pos.length / 3; i++) nrm.setXYZ(i, 0, 1, 0);
          }
          const skin = new THREE.MeshPhongMaterial({ map: koiSkin(pattern), side: THREE.DoubleSide, shininess: 45, specular: 0x2a2a2a });   // da ướt hơi bóng
          const body = new THREE.Mesh(bodyGeo, skin);
          body.castShadow = true; body.userData.noBake = body.userData.noBatch = true; g.add(body);   // thân uốn mỗi khung (đỉnh dời trên CPU) → không gộp vẽ

          // --- cặp vây NGỰC tròn ngay sau mang (u ≈ 0,22), có tia, vỗ riêng ---
          const pects = [];
          for (const sz of [-1, 1]) {
            const NP = 7, R = 0.2 * s, d = 0.005 * s, pp = [], pi = [], pu = [], off = NP + 2;
            for (const zo of [d, -d]) { pp.push(0, 0, zo); pu.push(0.5, 0); for (let i = 0; i <= NP; i++) { const b = -0.2 + i / NP * 1.25, rr = R * (0.8 + 0.2 * Math.sin(i / NP * Math.PI)); pp.push(-rr * Math.cos(b), -rr * Math.sin(b), zo); pu.push(i / NP, 0.98); } }
            for (let i = 1; i <= NP; i++) pi.push(0, i, i + 1, off, off + i + 1, off + i);
            const pg = new THREE.BufferGeometry();
            pg.setIndex(pi); pg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pp), 3)); pg.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(pu), 2));
            const pn = new Float32Array(off * 2 * 3); for (let i = 0; i < off * 2; i++) pn[i * 3 + 2] = sz;   // pháp tuyến ép hướng lên sau khi xoay nằm ngang
            pg.setAttribute('normal', new THREE.BufferAttribute(pn, 3));
            const pec = new THREE.Mesh(pg, koiFinM);
            const u = 0.22, px = xNose - u * bodyLen;
            pec.position.set(px, (prof(KOI_Y, u) - prof(KOI_H, u) * 0.55) * s, sz * prof(KOI_W, u) * 0.85 * s);
            pec.rotation.set(-sz * 1.25, sz * 0.5, 0.3);
            pec.userData.noBake = true; pec.userData.sz = sz; pec.userData.rx0 = -sz * 1.25;
            g.add(pec); pects.push(pec);
          }
          // --- mắt thấp gần mõm: con ngươi đen + viền mống vàng nhạt · 2 cặp râu ở mép miệng (cặp trước dài, cặp sau ngắn) ---
          const ue = 0.075, ex = xNose - ue * bodyLen, ey = (prof(KOI_Y, ue) + prof(KOI_H, ue) * 0.3) * s, ez = prof(KOI_W, ue) * 0.86 * s;
          for (const sz of [-1, 1]) {
            const eye = new THREE.Mesh(new THREE.SphereGeometry(0.03 * s, 10, 8), koiEyeM); eye.position.set(ex, ey, sz * ez); g.add(eye);
            const iris = new THREE.Mesh(new THREE.TorusGeometry(0.031 * s, 0.009 * s, 6, 16), koiIrisM); iris.position.set(ex, ey, sz * (ez + 0.004 * s)); g.add(iris);
          }
          for (const [ux, len, rad, dz] of [[0.012, 0.075, 0.005, 0.045], [0.04, 0.04, 0.004, 0.07]]) for (const sz of [-1, 1]) {
            const bar = new THREE.Mesh(new THREE.CylinderGeometry(rad * 0.4 * s, rad * s, len * s, 5), koiBarbelM);
            bar.position.set(xNose - ux * bodyLen + 0.012 * s, y0 - 0.02 * s - len * s * 0.4, sz * dz * s); bar.rotation.set(sz * 0.45, 0, -0.5); g.add(bar);
          }
          bakeStatic(g);   // gộp mắt, viền mống, râu (thân + vây ngực noBake giữ nguyên)

          // --- bơi: sóng ngang chạy đầu→đuôi, biên độ tăng dần về đuôi + uốn thân theo hướng rẽ (wob) ---
          const rest = Float32Array.from(pos), posAttr = bodyGeo.attributes.position, nV = rest.length / 3;
          const swPh = Math.random() * Math.PI * 2;
          const mouth = new THREE.Vector3(xNose + 0.02 * SL, y0, 0);
          function swim(t, wob) {
            const w1 = t * 6.5 + swPh;
            mouth.z = s * .012 * Math.sin(w1 - 2.6 * .52);
            for (let i = 0; i < nV; i++) {
              const xr = rest[i * 3], p = Math.min(1, Math.max(0, (0.30 - xr / SL) / 1.42));
              posAttr.array[i * 3 + 2] = rest[i * 3 + 2] + s * (0.012 + 0.13 * p * p) * Math.sin(w1 - 2.6 * (xr / SL)) + wob * 0.30 * s * p * p;
            }
            posAttr.needsUpdate = true;
            for (const pec of pects) pec.rotation.x = pec.userData.rx0 + pec.userData.sz * Math.sin(t * 3.1 + swPh + pec.userData.sz * 1.3) * 0.16;
          }
          return { g, swim, mouth };
        }
        const fishOrigin = new THREE.Vector3(X0 + 73, lakeY - 0.62, Z0 + 113);   // đàn cá về tọa độ góc (73, _, 113)
        for (let n = 0; n < 7; n++) {
          const f = fish(0.58 + Math.random() * 0.18, koiPattern());
          f.g.position.copy(fishOrigin); scene.add(f.g);
          fishies.push(Object.assign(f, { base: fishOrigin.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.2, 0, (Math.random() - 0.5) * 1.8)), rx: 2.1 + Math.random() * 1.8, rz: 1.2 + Math.random() * 1.1, ph: Math.random() * Math.PI * 2, sp: 0.12 + Math.random() * 0.06 }));
        }
        // ---- 3 con cá thêm ở tọa độ góc (88, 6, 44) — dưới nước hồ thượng lưu ----
        const fishSpot = new THREE.Vector3(X0 + 88, 6, Z0 + 44);
        for (let n = 0; n < 3; n++) {
          const f = fish(0.58 + Math.random() * 0.18, koiPattern());
          f.g.position.copy(fishSpot); scene.add(f.g);
          fishies.push(Object.assign(f, { base: fishSpot.clone().add(new THREE.Vector3((Math.random() - 0.5) * 2.2, 0, (Math.random() - 0.5) * 1.8)), rx: 2.1 + Math.random() * 1.8, rz: 1.2 + Math.random() * 1.1, ph: Math.random() * Math.PI * 2, sp: 0.12 + Math.random() * 0.06 }));
        }


        // ---- CÁ ĐỚP LÁ: lá/cánh hoa đang chìm (hoặc thỉnh thoảng đang nổi) gần cá → con rảnh gần nhất cùng mặt nước quay lại, tăng tốc,
        //      đổi độ sâu (ngóc/chúi đầu) để miệng tới đúng chỗ lá rồi đớp: 70% nuốt (lá biến mất, sủi bọt), 30% nhả ra (lá văng nhẹ, chìm tiếp).
        //      Đớp ở mặt nước thì gợn vòng. Xong việc cá bơi về vùng quen, độ sâu & góc ngóc trả dần về như cũ; nghỉ vài giây mới để ý lá khác ----
        const _fcM = new THREE.Vector3(), _fcD = new THREE.Vector3(), FISH_SNAPPED = { st: -1 };
        const fishFree = f => f.ang !== undefined && f !== angling.fish && f !== returningFishingFish && !f.leafT && !(f.leafCool > 0);
        function fishAlertLeaf(q, radius, chance) {
          const lvl = waterBaseY(Math.round(z2gj(q.p.z))) - 0.62; let best = null, bd = radius;
          for (const f of fishies) {
            if (!fishFree(f) || Math.abs(f.base.y - lvl) > 0.8) continue;   // chỉ cá cùng mặt nước (hồ trên / sông dưới)
            const d = Math.hypot(f.cx - q.p.x, f.cz - q.p.z); if (d < bd) { bd = d; best = f; }
          }
          if (!best || Math.random() >= chance) return null;
          best.leafT = q; best.leafChase = 0; best.snap = 0; best.chaseV = best.vmag; q.fish = (q.fish || 0) + 1;
          return best;
        }
        function endLeafChase(f) { const q = f.leafT; if (q && q.fish) q.fish--; f.leafT = null; f.leafCool = 6 + Math.random() * 6; f.snap = 0; }
        function fishSwimStep(f, dt, t, yTarget, pitchTarget) {   // tiến theo hướng f.ang với f.chaseV, giữ trong nước; độ sâu & góc ngóc tiến dần tới đích
          const nx = f.cx + Math.cos(f.ang) * f.chaseV * dt, nz = f.cz + Math.sin(f.ang) * f.chaseV * dt;
          if (waterCell(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { f.cx = nx; f.cz = nz; }
          const top = waterSurfaceY(f.cx, f.cz) - 0.1, bot = riverBedY(Math.round(x2gi(f.cx)), Math.round(z2gj(f.cz))) + 0.2, y0 = f.g.position.y;
          const y = y0 + (Math.max(bot, Math.min(top, yTarget)) - y0) * Math.min(1, dt * 2.5);
          f.dy = y - (f.base.y + Math.sin(t * 0.9 + f.ph) * 0.05);
          f.pitch = (f.pitch || 0) + (pitchTarget - (f.pitch || 0)) * Math.min(1, dt * 3);
          f.g.position.set(f.cx, y, f.cz); f.g.rotation.set(0, -f.ang, f.pitch);
          f.swT = (f.swT ?? t) + dt * (1 + f.chaseV * 0.9); f.swim(f.swT, f.wob);   // quẫy đuôi nhanh theo tốc độ
        }
        function fishChaseLeaf(f, dt, t) {
          if (f.leafT === FISH_SNAPPED) {   // nhịp lao tới sau cú đớp: đi thẳng, chậm dần rồi thôi
            f.snap -= dt; f.chaseV *= Math.exp(-dt * 2.5); f.wob *= Math.exp(-dt * 4);
            fishSwimStep(f, dt, t, f.g.position.y, 0);
            if (f.snap <= 0) { f.leafT = null; f.leafCool = 6 + Math.random() * 6; }
            return true;
          }
          const q = f.leafT;
          if (!(q.st === 3 || q.st === 4) || (f.leafChase += dt) > 14) { endLeafChase(f); return false; }   // lá đã chạm đáy / bị đớp mất / đuổi mãi không tới
          f.g.updateWorldMatrix(true, false); f.g.localToWorld(_fcM.copy(f.mouth));
          const dx = q.p.x - _fcM.x, dz = q.p.z - _fcM.z, dy = q.p.y - _fcM.y, dh = Math.hypot(dx, dz), d = Math.hypot(dh, dy);
          let da = Math.atan2(dz, dx) - f.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
          const turn = Math.max(-2.6 * dt, Math.min(2.6 * dt, da)); f.ang += turn;
          f.wob += (Math.max(-1.1, Math.min(1.1, turn / Math.max(dt, 1e-3) * 0.4)) - f.wob) * Math.min(1, dt * 6);   // thân uốn theo cú rẽ
          const vT = Math.min(1.7, 0.3 + dh * 0.9) * (Math.abs(da) > 1.2 ? 0.45 : 1);                                 // xa thì lao nhanh, gần thì rón rén
          f.chaseV += (vT - f.chaseV) * Math.min(1, dt * 3);
          fishSwimStep(f, dt, t, f.g.position.y + dy, Math.max(-0.5, Math.min(0.5, Math.atan2(dy, Math.max(0.25, dh)))));
          if (d < 0.16 + f.chaseV * 0.05) {   // ĐỚP
            const eat = Math.random() < 0.7;
            if (q.st === 3) waterFx.ring(q.p.x, waterSurfaceY(q.p.x, q.p.z), q.p.z, 0.4);   // đớp ngay mặt nước: gợn vòng
            waterFx.bubbles(_fcM.x, _fcM.y, _fcM.z, eat ? 4 : 2);
            if (q.fish) q.fish--;
            if (eat) q.st = 0;
            else {   // nhả ra: lá văng tới trước, ngấm thêm nước rồi chìm tiếp chậm hơn
              q.p.addScaledVector(_fcD.set(Math.cos(f.ang), 0, Math.sin(f.ang)), 0.25); q.p.y = Math.min(q.p.y, waterSurfaceY(q.p.x, q.p.z) - 0.05);
              if (q.st === 3) { q.st = 4; q.sinkV = 0.04; q.ph = 0; } else q.sinkV *= 0.7;
              q.look = 4;
            }
            f.leafT = FISH_SNAPPED; f.snap = 0.45; f.chaseV += 0.5;   // lao tới một nhịp
          }
          return true;
        }

        // ---- TẬP TÍNH CÁ KOI (G 23/10 "do research and study about rabbit, fish behaviour then improve its react and behaviour") ----
        //  · GIẬT MÌNH CHỮ C (C-start, tế bào Mauthner): kích thích lớn tương phản mạnh — bóng cò bay thấp / cò lội sát, chó, người bước vội sát mép — sau trễ
        //    0,15–0,5 s (cá vàng: 142–716 ms, càng tương phản càng nhanh) thân cong chữ C quay đầu RA XA nguồn, đạp đuôi phóng ~2,2 m/s, lặn sát đáy; nấp đáy gần
        //    như đứng yên 6–14 s rồi mới bơi lại, còn dè chừng ~20 s (chậm, sâu). Cò lội trong 2,2 m: lảng ra
        //  · KIẾM ĂN ĐÁY: chép ăn sinh vật đáy (ấu trùng chỉ hồng, giun ít tơ, ốc) — chúc đầu ủi bùn, nhích chậm, bùn sủi; ban ngày gặm riêng lẻ, đêm bơi thành đàn
        //    (Rahman & Meyer 2009) ⇒ ngày: tản ra, mỗi con 15–45 s ủi đáy 4–9 s; chạng vạng: đàn chặt hơn
        //  · ĐÀN LỎNG: hút về tâm nhóm cùng mặt nước trong 3 m, giãn cách ≥ 0,45 m, xuôi hướng bạn gần
        //  · QUEN NGƯỜI: koi được cho ăn học đón người quen — kỹ sư đứng yên sát mép nước ⇒ con bạo dạn tới trước, con nhát theo sau, lượn sát mặt nước ngóc đầu
        //    đớp không khí; người đi chỗ khác thì tản; bước vội sát mép thì giật mình
        //  · NHIỆT ĐỘ: < 12 °C chậm hẳn, xuống sâu (koi lờ đờ quanh 10 °C, gom về chỗ nước sâu ấm), ấm > 24 °C bơi nhanh, gần mặt
        //  Gọi trong vòng cá (loop/main-loop-rest.js) trước đuổi lá; true = tự lo chuyển động khung này
        const _flS = new THREE.Vector3(), _flM = new THREE.Vector3(), FL_BEG = { p: new THREE.Vector3(), ok: false, still: 0, key: '' };
        let flDogP = null, flDogV = 0, flEngP = null, flEngV = 0, flT = -1;
        function fishStimuli(t, dt) {   // 1 lần mỗi khung: tốc độ chó / kỹ sư (độ dời), kỹ sư đứng yên bao lâu + điểm nước sát chỗ đứng
          if (flT === t) return; flT = t;
          const d = dogObj.position, e = engObj && !engObj.inVan && engObj.g.parent === scene ? engObj.g.position : null;
          flDogV = flDogP ? Math.hypot(d.x - flDogP.x, d.z - flDogP.z) / Math.max(dt, 1e-3) : 0; (flDogP || (flDogP = new THREE.Vector3())).copy(d);
          flEngV = e && flEngP ? Math.hypot(e.x - flEngP.x, e.z - flEngP.z) / Math.max(dt, 1e-3) : 0; if (e) (flEngP || (flEngP = new THREE.Vector3())).copy(e); else flEngP = null;
          const B = FL_BEG; B.still = e && flEngV < 0.15 && !angling.active ? B.still + dt : 0;
          if (B.still > 2 && e) { const key = Math.round(e.x * 4) + ':' + Math.round(e.z * 4);
            if (key !== B.key) { B.key = key; B.ok = false; let bd = 9;   // ô nước gần chỗ đứng nhất (trong 2,6 m) — cá đón ở đó, cách mép ~0,4 m
              for (let r = 0.6; r <= 2.6 && !B.ok; r += 0.4) for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, x = e.x + Math.cos(a) * r, z = e.z + Math.sin(a) * r;
                if (waterCell(Math.round(x2gi(x)), Math.round(z2gj(z))) && waterCell(Math.round(x2gi(x + Math.cos(a) * 0.4)), Math.round(z2gj(z + Math.sin(a) * 0.4))) && r < bd) { bd = r; B.p.set(x + Math.cos(a) * 0.4, 0, z + Math.sin(a) * 0.4); B.ok = true; } } } }
          else if (B.still === 0) B.key = '';
        }
        function fishThreat(f) {   // → mức kích thích (1 = giật mình · 0,5 = lảng ra), nguồn ở _flS
          const x = f.cx, z = f.cz; let lv = 0;
          const add = (p, l) => { if (l > lv) { lv = l; _flS.copy(p); } };
          const d = dogObj.position; if (dogObj.visible !== false && Math.hypot(d.x - x, d.z - z) < (flDogV > 1.5 ? 3.5 : 2.2)) add(d, 1);
          if (flEngP && flEngV > 1.0 && Math.hypot(flEngP.x - x, flEngP.z - z) < 2.2) add(flEngP, 1);
          for (const b of birds) { const p = b.m.position, dh = Math.hypot(p.x - x, p.z - z);
            if (b.state === 'wade') { if (dh < 1.0) add(p, 1); else if (dh < 2.2) add(p, 0.5); }
            else if (b.state !== 'sleep' && dh < 3.5 && p.y - f.g.position.y < 7) add(p, 1);   // bóng cò bay thấp lướt qua đầu
          }
          return lv;
        }
        function fishLife(f, dt, t) {
          const L = f.L || (f.L = { st: '', k: 0, bold: Math.random(), gz: 15 + 30 * Math.random(), cd: 0, wary: 0, d: 0, src: new THREE.Vector3(), esc: 0, gulp: 2 });
          fishStimuli(t, dt); L.k += dt; L.cd -= dt; L.wary -= dt;
          const temp = liveWeather.state.temperature ?? 24, hh = liveWeather.localHour, go = (st, d) => { L.st = st; L.k = 0; L.d = d; };
          f.vk = Math.max(0.45, Math.min(1.15, 0.45 + 0.05 * (temp - 10))) * (L.wary > 0 ? 0.6 : 1);   // tốc độ bơi theo nhiệt độ nước · dè chừng sau khi giật mình
          f.dz = (temp < 12 ? -0.25 : temp > 24 ? 0.12 : 0) + (L.wary > 0 ? -0.15 : 0);   // lạnh: xuống sâu · ấm: gần mặt
          if (L.st !== 'c' && L.st !== 'burst') {
            const lv = fishThreat(f);
            if (lv >= 1 && L.cd <= 0 && L.st !== 'lat') { if (f.leafT) endLeafChase(f); L.src.copy(_flS); go('lat', 0.15 + 0.35 * Math.random()); }
            else if (lv > 0 && (!L.st || L.st === 'graze')) { let da = Math.atan2(f.cz - _flS.z, f.cx - _flS.x) - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += Math.max(-1.5 * dt, Math.min(1.5 * dt, da)); if (L.st === 'graze') go('', 0); }   // lảng ra xa cò đang lội
          }
          const bot = () => riverBedY(Math.round(x2gi(f.cx)), Math.round(z2gj(f.cz))), surf = () => waterSurfaceY(f.cx, f.cz);
          switch (L.st) {
            case 'lat': if (L.k >= L.d) { L.esc = Math.atan2(f.cz - L.src.z, f.cx - L.src.x) + (Math.random() - 0.5) * 0.8; go('c', 0.1); } return false;   // trễ phản xạ: vẫn bơi như thường
            case 'c': {   // uốn chữ C: cả thân cong về phía quay, đầu xoay nhanh ra xa nguồn
              let da = L.esc - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += Math.max(-16 * dt, Math.min(16 * dt, da)); f.wob = Math.sign(da || 1) * 1.1; f.chaseV = 0.3;
              fishSwimStep(f, dt, t, f.g.position.y, 0); if (L.k >= L.d) { f.chaseV = 2.2; go('burst', 0.7); } return true;
            }
            case 'burst': {   // đạp đuôi duỗi thân, phóng đi rồi chậm dần, lặn sát đáy
              let da = L.esc - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += Math.max(-5 * dt, Math.min(5 * dt, da)); f.wob *= Math.exp(-dt * 10); f.chaseV *= Math.exp(-dt * 2.2);
              fishSwimStep(f, dt, t, bot() + 0.15, -0.3); if (L.k >= L.d) go('hide', 6 + 8 * Math.random()); return true;
            }
            case 'hide': f.chaseV += (0.05 - f.chaseV) * Math.min(1, dt * 2); f.wob *= Math.exp(-dt * 3); fishSwimStep(f, dt, t, bot() + 0.12, 0); if (L.k >= L.d) { L.wary = 20; L.cd = 3; go('', 0); } return true;   // nấp đáy, gần như đứng yên
            case 'graze': {   // ủi bùn: chúc đầu, nhích chậm, thỉnh thoảng sủi bùn
              f.chaseV += (0.09 - f.chaseV) * Math.min(1, dt * 2); f.wob += ((Math.random() - 0.5) * 0.8 - f.wob) * Math.min(1, dt); f.ang += f.wob * 0.4 * dt;
              fishSwimStep(f, dt, t, bot() + 0.13, -0.55);
              if ((L.gulp -= dt) <= 0) { L.gulp = 0.9 + Math.random(); f.g.localToWorld(_flM.copy(f.mouth)); waterFx.bubbles(_flM.x, _flM.y, _flM.z, 1); }
              if (L.k >= L.d) go('', 0); return true;
            }
            case 'beg': {   // đón người: lượn sát mặt nước chỗ người đứng, ngóc đầu đớp
              const B = FL_BEG; if (!B.ok || B.still === 0 || Math.hypot(B.p.x - f.cx, B.p.z - f.cz) > 7) { go('', 0); return false; }
              const a0 = L.bold * TAU + t * 0.35, tx = B.p.x + Math.cos(a0) * 0.45, tz = B.p.z + Math.sin(a0) * 0.45, dx = tx - f.cx, dz = tz - f.cz, dd = Math.hypot(dx, dz);
              let da = Math.atan2(dz, dx) - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += Math.max(-2 * dt, Math.min(2 * dt, da)); f.wob += (Math.max(-1, Math.min(1, da)) * 0.6 - f.wob) * Math.min(1, dt * 3);
              f.chaseV += ((dd > 1 ? 0.55 : 0.14) - f.chaseV) * Math.min(1, dt * 2);
              const up = dd < 1.2, gp = (L.gulp -= dt) < 0.3 && up; if (L.gulp <= 0) { L.gulp = 2 + 2 * Math.random(); if (up) { f.g.localToWorld(_flM.copy(f.mouth)); waterFx.ring(_flM.x, surf(), _flM.z, 0.18); } }
              fishSwimStep(f, dt, t, up ? surf() - 0.14 : f.base.y, up ? 0.25 + (gp ? 0.15 : 0) : 0); return true;
            }
          }
          // bơi lang thang (vòng chính) — chỉnh hướng theo đàn, rồi xét có ủi đáy / đón người không
          const tight = hh < 7 || hh > 17 ? 0.8 : 0.35; let cx = 0, cz = 0, n = 0, ax = 0, az = 0, sx = 0, sz = 0;
          for (const o of fishies) { if (o === f || o.ang === undefined || Math.abs(o.base.y - f.base.y) > 0.8 || o === angling.fish || o === returningFishingFish) continue;
            const dx = o.cx - f.cx, dz = o.cz - f.cz, d = Math.hypot(dx, dz); if (d > 3) continue;
            cx += dx; cz += dz; n++; if (d < 1.5) { ax += Math.cos(o.ang); az += Math.sin(o.ang); } if (d < 0.45 && d > 1e-3) { sx -= dx / d * (0.45 - d) * 6; sz -= dz / d * (0.45 - d) * 6; } }
          if (n) { const hx = Math.cos(f.ang) + tight * (cx / n * 0.35 + ax * 0.3) + sx, hz = Math.sin(f.ang) + tight * (cz / n * 0.35 + az * 0.3) + sz;
            let da = Math.atan2(hz, hx) - f.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); f.ang += Math.max(-0.8 * dt, Math.min(0.8 * dt, da)); }
          if (!f.leafT && L.wary <= 0) {
            const B = FL_BEG; if (B.ok && B.still > 2 + (1 - L.bold) * 8 && Math.hypot(B.p.x - f.cx, B.p.z - f.cz) < 6 && Math.abs(waterBaseY(Math.round(z2gj(B.p.z))) - 0.62 - f.base.y) < 0.8) { f.chaseV = f.vmag * f.vk; go('beg', 0); }
            else if (hh > 6.5 && hh < 17.5 && temp >= 12 && (L.gz -= dt) <= 0) { L.gz = 15 + 30 * Math.random(); f.chaseV = f.vmag * f.vk; go('graze', 4 + 5 * Math.random()); }
          }
          return false;
        }
