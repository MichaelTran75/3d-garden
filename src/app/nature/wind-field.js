        // ====== BẢN ĐỒ GIÓ (Navier–Stokes 2D ở độ cao tán) — dựng VẬT CẢN + ĐỘ PHƠI GIÓ địa hình sau khi mọi công trình, rừng đã dựng xong ======
        //  Luồng phụ (nature/fluids.js, mục 3) giải dòng khí trên lưới này; kết quả là texture uWMap mà cây, cỏ, hoa, rừng, lá rơi, khói, phao cùng đọc
        //  qua windVec (GPU) / windAt (CPU). Vật cản đặc (nhà, xe, đập, bồn) cản gần kín theo phần chiều cao chạm lát cắt; tán rừng, cây cổ thụ, anh đào,
        //  táo là vật cản THƯA (lực cản lá ~ Cd·a·|u|u); đỉnh đồi, mặt hồ gió mạnh hơn, lòng thung lũng yếu hơn (so với độ cao trung bình xung quanh ~14 đv).
        //  Chi tiết: src/ARCHITECTURE.md mục "Gió và cây".
        let forestLeafCtl = null;
        {
          const DX = 2.4, SLICE = 4, x0 = wx(-MX) - BLOCK / 2, z0 = wz(-MZ) - BLOCK / 2;
          const nx = Math.ceil((GX + 2 * MX) * BLOCK / DX), nz = Math.ceil((GZ + 2 * MZ) * BLOCK / DX), N = nx * nz;
          const drag = new Float32Array(N), expo = new Float32Array(N), ground = new Float32Array(N), wet = new Uint8Array(N);
          for (let b = 0; b < nz; b++) for (let a = 0; a < nx; a++) {   // mặt đất (mặt nước ở ô sông/hồ) tại tâm ô
            const c = b * nx + a, x = x0 + (a + 0.5) * DX, z = z0 + (b + 0.5) * DX, gi = Math.round(x2gi(x)), gj = Math.round(z2gj(z));
            wet[c] = waterCell(gi, gj) ? 1 : 0; ground[c] = wet[c] ? waterBaseY(gj) : cowY(x, z);
          }
          const box = new THREE.Box3();
          const addBox = (bx, k) => {   // vật cản đặc: ô có tâm nằm trong hộp; cản theo phần chiều cao vật chạm lát cắt
            const a0 = Math.max(0, Math.floor((bx.min.x - x0) / DX)), a1 = Math.min(nx - 1, Math.floor((bx.max.x - x0) / DX)), b0 = Math.max(0, Math.floor((bx.min.z - z0) / DX)), b1 = Math.min(nz - 1, Math.floor((bx.max.z - z0) / DX));
            for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) { const c = b * nx + a; drag[c] = Math.max(drag[c], k * Math.min(1, Math.max(0, (bx.max.y - ground[c]) / SLICE))); }
          };
          const addDisc = (x, z, r, k) => {   // tán thưa: cản lớn ở giữa, nhạt dần ra mép
            const a0 = Math.max(0, Math.floor((x - r - x0) / DX)), a1 = Math.min(nx - 1, Math.floor((x + r - x0) / DX)), b0 = Math.max(0, Math.floor((z - r - z0) / DX)), b1 = Math.min(nz - 1, Math.floor((z + r - z0) / DX));
            for (let b = b0; b <= b1; b++) for (let a = a0; a <= a1; a++) {
              const d = Math.hypot(x0 + (a + 0.5) * DX - x, z0 + (b + 0.5) * DX - z) / Math.max(r, DX * 0.6);
              if (d < 1) { const c = b * nx + a; drag[c] = Math.max(drag[c], Math.min(0.3, drag[c] + k * (1 - d))); }
            }
          };
          const SOLID = [['Trạm thủy điện', 6], ['Nhà điều hành', 6], ['Xưởng bảo trì', 6], ['Nhà thiết bị', 6], ['Nhà kho mái pin', 5], ['Chuồng bò', 4], ['Xe Caravan', 6],
            ['Bồn chứa nước', 3], ['Bồn nước nông thôn', 3], ['Cụm pin lưu trữ', 2], ['Trạm biến áp', 0.6], ['Cánh đồng pin mặt trời', 0.02]];
          for (const o of scene.children) { const s = o.name && SOLID.find(([p]) => o.name.startsWith(p)); if (s) addBox(box.setFromObject(o), s[1]); }
          // tán rừng (khối tán instanced) + cây có mô hình thân + cây táo = vật cản thưa; đồng thời là chỗ lá rừng bứt ra khi có cơn giật
          let canopy = []; const _m = new THREE.Matrix4(), _p = new THREE.Vector3(), _q = new THREE.Quaternion(), _s = new THREE.Vector3();
          scene.traverse(o => {
            if (!o.isInstancedMesh || o.material !== leafMatInst) return;
            for (let k = 0; k < o.count; k++) { o.getMatrixAt(k, _m); _m.premultiply(o.matrixWorld).decompose(_p, _q, _s); addDisc(_p.x, _p.z, _s.x * 1.1, 0.025); canopy.push(_p.x, _p.y, _p.z, _s.x); }
          });
          for (const tw of [oldTreeWind, cherryWind]) if (tw && tw.active) addDisc(tw.crown.x, tw.crown.z, tw.R, 0.12);
          for (const T of appleTrees) {
            T.updateMatrixWorld(true); addDisc(T.position.x, T.position.z, 2.6, 0.12);
            const L = T.userData.leafPts || []; for (let k = 0; k + 2 < L.length; k += 9) { _p.set(L[k], L[k + 1], L[k + 2]).applyMatrix4(T.matrixWorld); canopy.push(_p.x, _p.y, _p.z, 0.3); }
          }
          // độ phơi gió: cao hơn mặt bằng xung quanh (~14 đv) thì gió mạnh hơn (~4,5%/đv), trũng hơn thì yếu; mặt nước nhẵn hơn cỏ cây → +12%
          const hs = new Float32Array(N), tmp = new Float32Array(N), R = 6;
          for (let b = 0; b < nz; b++) for (let a = 0; a < nx; a++) { let s = 0, n = 0; for (let d = -R; d <= R; d++) { const aa = a + d; if (aa >= 0 && aa < nx) { s += ground[b * nx + aa]; n++; } } tmp[b * nx + a] = s / n; }
          for (let b = 0; b < nz; b++) for (let a = 0; a < nx; a++) { let s = 0, n = 0; for (let d = -R; d <= R; d++) { const bb = b + d; if (bb >= 0 && bb < nz) { s += tmp[bb * nx + a]; n++; } } hs[b * nx + a] = s / n; }
          for (let c = 0; c < N; c++) expo[c] = Math.min(1.35, Math.max(0.75, 1 + 0.045 * (ground[c] - hs[c]))) * (wet[c] ? 1.12 : 1);
          fluids.initWind({ x0, z0, nx, nz, dx: DX, drag, expo, lrec: 16, conf: 0.25, iters: 30, sliceH: SLICE, ux: sceneWind.dir.x, uz: sceneWind.dir.y });
          // ---- LÁ RỪNG RỤNG THEO CƠN GIẬT: mỗi khung thử vài điểm tán trong vùng đang nhìn; cơn giật tại chỗ vượt gió trung bình tại chỗ càng nhiều
          //      (cành bị giật mạnh) thì càng nhiều lá bứt ra — cơn giật lướt qua rừng làm lá rụng thành đợt theo đúng đường đi của nó ----
          canopy = Float32Array.from(canopy);   // mảng số liền (G 19/10 "lưu điểm lá gọn hơn")
          const NC = canopy.length / 4, _w = new THREE.Vector3(), _mm = new THREE.Vector3(), _cd = new THREE.Vector3(), best = new THREE.Vector4();
          let bestK = 0;
          const nearView = () => {   // chọn ngẫu nhiên 1 điểm tán trong vùng đất đang thấy
            const hx = (camera.right - camera.left) / 2 / camera.zoom, hy = (camera.top - camera.bottom) / 2 / camera.zoom;
            camera.getWorldDirection(_cd); const rv = Math.hypot(hx, hy / Math.max(0.12, -_cd.y));
            for (let t = 0; t < 24; t++) { const i = ((Math.random() * NC) | 0) * 4; if (Math.hypot(canopy[i] - target.x, canopy[i + 2] - target.z) < rv) return i; }
            return -1;
          };
          const root = new THREE.Object3D(); root.updateMatrixWorld();
          forestLeafCtl = makeLeafFall({ name: 'Lá rừng rụng theo cơn giật', group: root, pts: [[0, -999, 0]], n: 60,
            geo: new THREE.CylinderGeometry(0.045 * 2.1, 0.045 * 2.1, 0.0015 * 2.1, 6), opacity: 0.78,
            color: () => [0xd9a93a, 0xc08a2e, 0xa8742c, 0x6f9a4b, 0x5e8c44][(Math.random() * 5) | 0],   // lá già vàng nâu bứt trước, ít lá xanh
            scale: NATURE_SCALE, tw: null, g: 3.5, vTerm: 0.7, flutA: 0.6, flutW: [2.2, 3.4], tumble: 0.35, tumbleW: [6, 10], slideU: 0.6, rate0: 0, rateK: 0,
            restLife: [10, 20], floatLife: [25, 45], sinkP: 0.3, sinkV: [0.06, 0.1], leeway: 0.03,
            rate: () => {   // số lá bứt ra mỗi giây (cộng dồn), chỉ tính các tán đang thấy
              let sum = 0; bestK = 0;
              for (let k = 0; k < 4; k++) {
                const i = nearView(); if (i < 0) continue;
                const x = canopy[i], y = canopy[i + 1], z = canopy[i + 2], zu = Math.max(1, y - cowY(x, z));
                windAt(x, y, z, zu, _w); windMapSample(x, z, _mm);
                const mean = Math.max(0.05, Math.hypot(_mm.x, _mm.y) * sceneWind.U * windProfile(zu)), sp = Math.hypot(_w.x, _w.z);
                const kk = Math.pow(sp / WIND_SREF, 2.6) * Math.pow(Math.max(0, sp / mean - 1.25), 1.5);   // (lực gió)² × độ "giật" so với nền tại chỗ: gió nhẹ hầu như không bứt lá
                sum += kk; if (kk > bestK) { bestK = kk; best.set(x, y, z, canopy[i + 3]); }
              }
              return 5 * sum;
            },
            pick: () => {   // bứt ra ở điểm tán bị giật mạnh nhất vừa thử, trên mặt khối tán
              if (bestK <= 0) return null;
              const a = Math.random() * TAU, r = best.w * 0.8;
              return [best.x + Math.cos(a) * r, best.y - Math.random() * r * 0.5, best.z + Math.sin(a) * r];
            } });
        }
