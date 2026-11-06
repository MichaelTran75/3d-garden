        // ===== ẢNH MÔI TRƯỜNG NỘI THẤT XE: kim loại, gương, kính phản chiếu căn phòng (G 05/11 "nội thất xe render more realistic … đỡ tốn ram nhất" — bước 2 / 5)
        //  · Một tấm toàn cảnh 64 × 32 tính từng điểm ảnh theo hướng trong toạ độ xe (mũi −X, cửa lùa +Z — van/README.md): trần kem, vách be, dải cửa sổ hai
        //    vách hông (ngày trời sáng, đêm xanh thẫm), tủ gỗ, sàn → PMREM → MỘT render target 336 × 64 HalfFloat (~0,17 MB GPU); bộ đệm luân phiên của bộ
        //    nướng giữ lại để nướng lại (~0,17 MB). RAM 8 KB. Ảnh mờ sẵn (mặt khối 16 px) nên gương / crôm chỉ thấy mảng màu căn phòng, không thấy chi tiết.
        //  · Độ sáng khớp đèn cảnh: hệ số (hemi + amb) / π = bức xạ tương đương ánh trời trong mô hình đèn vật lý three r160 ⇒ kim loại sáng ngang mặt nhám
        //    cạnh nó, chỉ khác ở chỗ đổi sáng theo góc nhìn.
        //  · Vật liệu kim loại xe (vanMetal: MeshStandard metalness 1; VAN_CHROME bóng dùng chung) có envMap TỪ LÚC TẠO ⇒ lô gộp (core/draw-batch.js)
        //    nhận luôn, không biên dịch lại. Đèn trời, ngày / đêm, hướng xe đổi đủ nhiều ⇒ vẽ lại + nướng lại vào CÙNG render target (vanEnvTick trong
        //    vanFrameTick — van/interior/caravan.js): mọi vật liệu, cả bản sao trong lô gộp, dùng chung texture nên tự đổi theo. Mất ngữ cảnh WebGL ⇒ nướng lại.
        //  · Đối tượng three tạo ở đây dùng dãy ngẫu nhiên riêng (uuid ăn Math.random — giữ nguyên dãy chung của cảnh, như core/ao-bake.js); vật liệu đổi
        //    1 : 1 tại chỗ (bếp, laptop, gương) giữ đúng số lần tạo ----
        const VENV = { tex: null, gen: null, rt: null, k: 0, n: 0, yaw: 0, rnd: mulberry32(0x5EED0E2) };
        function venvRnd(f) { const R0 = Math.random; Math.random = VENV.rnd; try { return f(); } finally { Math.random = R0; } }
        function venvPaint() {   // bức xạ tuyến tính → sRGB 8 bit; hàng 0 = nhìn thẳng xuống (DataTexture không lật), cột theo atan2(z, x) như equirectUv của three
          const W = 64, H = 32, d = VENV.tex.image.data, s = VENV.k / Math.PI, nf = VENV.n, cy = Math.cos(VENV.yaw), sy = Math.sin(VENV.yaw);
          const sm = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
          const enc = v => { v = Math.min(1, Math.max(0, v * s)); return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)); };
          const FLOOR = [0.58, 0.54, 0.48], WOOD = [0.64, 0.60, 0.54], WALL = [0.72, 0.70, 0.64], CEIL = [0.86, 0.84 - 0.03 * nf, 0.78 - 0.08 * nf],   // sàn + tủ sáng, trung tính: camera nhìn từ trên ⇒ mặt kim loại đứng soi sàn (05/11: sàn nâu tối 0,30 làm inox thành đồng thau tối) · trần ấm hơn khi đêm (đèn)
            WIN = [1.50 - 1.42 * nf, 1.62 - 1.52 * nf, 1.80 - 1.60 * nf], c = [0, 0, 0];   // cửa sổ: trời sáng → đêm xanh thẫm
          const mix = (a, t) => { for (let i = 0; i < 3; i++) c[i] += (a[i] - c[i]) * t; };
          for (let r = 0; r < H; r++) {
            const y = Math.sin(((r + 0.5) / H - 0.5) * Math.PI), kW = sm(-0.45, -0.25, y), kU = sm(-0.05, 0.05, y), kC = sm(0.45, 0.65, y);
            for (let q = 0; q < W; q++) {
              const ph = ((q + 0.5) / W - 0.5) * 2 * Math.PI, lz = Math.cos(ph) * sy + Math.sin(ph) * cy;   // lz: cos góc tới pháp tuyến vách hông (toạ độ xe)
              c[0] = FLOOR[0]; c[1] = FLOOR[1]; c[2] = FLOOR[2]; mix(WOOD, kW); mix(WALL, kU); mix(CEIL, kC);
              mix(WIN, sm(0.62, 0.8, Math.abs(lz)) * sm(0.02, 0.1, y) * (1 - sm(0.42, 0.5, y)));
              const i = (r * W + q) * 4; d[i] = enc(c[0]); d[i + 1] = enc(c[1]); d[i + 2] = enc(c[2]); d[i + 3] = 255;
            }
          }
          VENV.tex.needsUpdate = true;
        }
        function vanEnvMap() {   // texture dùng chung (render target PMREM) — nướng lần đầu khi vật liệu đầu tiên hỏi
          if (!VENV.rt) venvRnd(() => {
            const t = VENV.tex = new THREE.DataTexture(new Uint8Array(64 * 32 * 4), 64, 32);
            t.colorSpace = THREE.SRGBColorSpace; t.mapping = THREE.EquirectangularReflectionMapping; t.magFilter = t.minFilter = THREE.LinearFilter;
            VENV.gen = new THREE.PMREMGenerator(renderer); VENV.k = hemi.intensity + amb.intensity; VENV.n = nightFactor; venvPaint();
            VENV.rt = VENV.gen.fromEquirectangular(t);
          });
          return VENV.rt.texture;
        }
        function vanEnvTick() {   // mỗi khung (vanFrameTick): đèn trời đổi > 4 %, đêm / ngày đổi > 0,04 hoặc xe quay > 0,1 rad ⇒ vẽ lại + nướng lại (~0,1 ms GPU)
          const k = hemi.intensity + amb.intensity, e = caravanObj.matrixWorld.elements, yaw = Math.atan2(e[8], e[10]), dy = yaw - VENV.yaw;
          if (Math.abs(k - VENV.k) < 0.04 * k && Math.abs(nightFactor - VENV.n) < 0.04 && Math.abs(Math.atan2(Math.sin(dy), Math.cos(dy))) < 0.1) return;
          VENV.k = k; VENV.n = nightFactor; VENV.yaw = yaw; venvPaint(); venvRnd(() => VENV.gen.fromEquirectangular(VENV.tex, VENV.rt));
        }
        listen(renderer.domElement, 'webglcontextrestored', () => { VENV.k = -1; });   // nội dung render target mất cùng ngữ cảnh ⇒ khung sau nướng lại
        function vanMetal(c, rough = 0.35, o = {}) { return new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: rough, envMap: vanEnvMap(), ...o }); }
        const VAN_CHROME = venvRnd(() => vanMetal(0xc9ced2, 0.12));   // crôm dùng chung: vòi, sen, móc khăn, chân bàn ăn, ghế đẩu (khung bàn học là sắt sơn mờ ⇒ giữ metalMat)
