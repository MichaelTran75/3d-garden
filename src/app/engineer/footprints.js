        // ===== DẤU CHÂN TRÊN ĐẤT ƯỚT (G 18/10 "trời mưa xong mà engineer cắt cỏ, thì đi có dấu chân 2-3 bước") =====
        //  ĐỘ ẨM ĐẤT (soil 0–1) tách khỏi độ ướt MẶT cỏ (sceneWet — khô sau ~5 phút): mưa thì đất ngấm nhanh (~2 phút mưa vừa là đẫm), tạnh thì khô chậm —
        //  ban ngày ~50 phút, đêm ~2,5 giờ ⇒ lúc kỹ sư cắt cỏ sau mưa (cỏ đã ráo, đất còn mềm) mỗi bước để lại dấu đế ủng. Mỗi lần 1 bàn chân đặt xuống (chân
        //  vung → trụ, engWalkFeet ở engineer/pose-ik-walk.js) ⇒ 1 dấu: đế ủng bảo hộ có gai (vẽ canvas), màu bùn ướt, nằm phẳng trên đất dưới bàn chân, đúng
        //  hướng bàn chân, chân trái lật gương. Chỉ 3 dấu mới nhất còn thấy (đậm → nhạt), dấu thứ 4 mờ đi trong ~0,5 s ⇒ vệt 2–3 bước sau lưng; đứng yên lâu
        //  thì dấu cũ nhạt dần (sau 20 s). Không in trong xe, trên đường nhựa, mép nước; trong cỏ cao dấu khuất dưới lá như thật, cỏ vừa cắt thì rõ ----
        const footprints = (() => {
          const N = 6, FW = 0.19, FL = 0.27, F = { soil: 0, n: 0, prev: [false, false] };   // cỡ dấu (m): đế ủng 0,26 × 0,36 đv mẫu người × 0,79
          const tex = (() => {   // đế ủng: gót – eo – mũi bè, gai ngang (khe trống), mép mềm; mũi ở đỉnh ảnh
            const c = document.createElement('canvas'); c.width = 64; c.height = 128; const x = c.getContext('2d');
            x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 5;
            x.beginPath(); x.moveTo(32, 10); x.bezierCurveTo(50, 10, 56, 26, 55, 44); x.bezierCurveTo(54, 60, 47, 70, 46, 82); x.bezierCurveTo(45, 96, 50, 104, 47, 114);
            x.bezierCurveTo(44, 122, 20, 122, 17, 114); x.bezierCurveTo(14, 104, 19, 96, 18, 82); x.bezierCurveTo(17, 70, 9, 60, 9, 44); x.bezierCurveTo(8, 26, 14, 10, 32, 10); x.fill();
            x.shadowBlur = 0; x.globalCompositeOperation = 'destination-out'; x.fillStyle = 'rgba(0,0,0,0.55)';
            for (let y = 20; y < 74; y += 9) x.fillRect(12, y, 40, 3);   // gai mũi
            for (let y = 92; y < 116; y += 8) x.fillRect(19, y, 26, 3);  // gai gót
            x.fillRect(14, 78, 36, 6);                                   // eo đế (lõm, ít chạm đất)
            const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
          })();
          const geo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);   // nằm ngang; đỉnh ảnh (mũi) hướng −Z cục bộ
          const prints = Array.from({ length: N }, () => {
            const m = new THREE.Mesh(geo, new THREE.MeshLambertMaterial({ map: tex, color: 0x47382a, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide,
              polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
            m.name = 'Dấu chân'; m.visible = false; m.receiveShadow = true; m.raycast = () => {}; Object.assign(m.userData, { seq: -99, t: 0, op: 0, s: 0, noBatch: true }); scene.add(m); return m;
          });
          const RANK = [0.78, 0.62, 0.42];   // độ đậm theo thứ tự mới → cũ; dấu thứ 4 trở đi mờ hẳn
          function place(Ft, i, s) {
            const x = Ft.w.x + Ft.fx * 0.036, z = Ft.w.z + Ft.fz * 0.036;   // tâm đế ở trước cổ chân 0,045 đv mẫu
            if (roadContains(x, z, 0.1) || isWater(Math.round(x2gi(x)), Math.round(z2gj(z)))) return;
            const m = prints[++F.n % N], U = m.userData; Object.assign(U, { seq: F.n, t: 0, s, op: RANK[0] * s });
            m.position.set(x, cowY(x, z) + 0.004, z); m.rotation.set(0, Math.atan2(Ft.fx, Ft.fz) + Math.PI, 0); m.scale.set(i ? -FW : FW, 1, FL);   // i = 1: chân trái, lật gương
            m.material.opacity = U.op; m.visible = true;
          }
          function tick(dt) {   // mỗi khung (loop/main-loop-rest.js), sau khi kỹ sư đã bước
            F.soil = Math.max(0, Math.min(1, F.soil + (liveWeather.state.raining ? dt * 0.008 * (0.4 + rainK) : -dt / (nightFactor > 0.5 ? 9000 : 3000))));
            const e = engObj, K = e.wk, s = Math.max(0, Math.min(1, (F.soil - 0.12) / 0.45));
            if (K && K.on && !e.inVan && e.g.parent === scene) for (let i = 0; i < 2; i++) { const Ft = K.feet[i]; if (F.prev[i] && !Ft.sw && s > 0) place(Ft, i, s); F.prev[i] = Ft.sw; }
            else F.prev[0] = F.prev[1] = false;
            for (const m of prints) {
              if (!m.visible) continue; const U = m.userData, rank = F.n - U.seq; U.t += dt;
              const want = (RANK[rank] || 0) * U.s * Math.max(0, 1 - Math.max(0, U.t - 20) / 10);
              U.op += (want - U.op) * Math.min(1, dt * 4); m.material.opacity = U.op; if (want === 0 && U.op < 0.01) m.visible = false;
            }
          }
          return Object.assign(F, { tick });
        })();
