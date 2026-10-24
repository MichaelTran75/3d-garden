        // ---- MẶT NƯỚC & DÒNG CHẢY cho vật trôi (lá, cánh hoa) và cá ----
        //  · Mực nước tĩnh theo ô: hồ trên đập 6,6 m · sông dưới đập 3,0 m (đúng mặt lưới nước), cộng độ cao sóng của MÔ PHỎNG NƯỚC NÔNG (fluids.water).
        //    (Độ cao địa hình của vài ô nước sát bãi san phẳng bị nội suy lên 7,2 m — không dùng cho mặt nước.)
        //  · Dòng chảy mặt = vận tốc của mô phỏng nước nông khi đã có; trước đó dùng công thức: dọc tim sông về hạ lưu (+z), mặt cắt ngang parabol (giữa nhanh, sát bờ còn ~15%), lòng rộng thì chậm lại
        //    (bảo toàn lưu lượng); hồ trên đập gần như lặng; dưới đập nước tỏa ra từ 3 cửa xả rồi nhập dòng; thêm xoáy nhỏ trôi chậm.
        //  · Theo độ sâu: luật lũy thừa 1/7 — sát đáy chậm, gần mặt nhanh.
        const DAM_J1 = DAM_J + 2 * S, RIVER_U = 0.32, LAKE_U = 0.03;
        let fluids = null;   // nước nông + khói/hơi nước (nature/fluids.js gán ngay sau mảnh này)
        const DAM_OUTLETS = [[dcx - 1.8, dz + dsZ + 3.8], [dcx + 5.0, dz + dsZ + 3.8], [dcx + 11.8, dz + dsZ + 3.8]];
        const waterCell = (i, j) => isWater(i, j) && !(j >= DAM_J && j < DAM_J1);   // ô thân đập không phải mặt nước
        const waterBaseY = j => Math.round((j < DAM_J ? RES : DOWN) * S) * BLOCK;
        function waveAt(x, z) { return fluids && fluids.water.ready ? fluids.water.height(x, z) : 0; }   // đúng số liệu shader dùng để dời đỉnh mặt nước
        const waterSurfaceY = (x, z) => waterBaseY(Math.round(z2gj(z))) + waveAt(x, z);
        function riverBedY(i, j) {   // đúng công thức đáy sông lúc dựng địa hình (đáy nhấp nhô, sâu ở giữa lòng)
          const surf = Math.round((j < DAM_J ? RES : DOWN) * S), tt = Math.min(1, riverDist(i, j) / Math.max(1, riverHalf(j)));
          const bed = Math.round(surf - (1 + 2.6 * (1 - tt * tt)) + Math.sin(i * 0.5) * Math.sin(j * 0.4 + 1.1) * 0.8);
          return Math.max(0, Math.min(surf - 1, bed)) * BLOCK;
        }
        function waterFlow(x, z, t, out) {   // vận tốc dòng mặt nước (m/s) → out.x, out.z
          if (fluids && fluids.water.ready) return fluids.water.flow(x, z, out);
          const i = x2gi(x), j = z2gj(z), dc = riverC(j + 0.5) - riverC(j - 0.5), n = Math.hypot(dc, 1);
          const half = Math.max(1, riverHalf(j)), d = Math.min(1, riverDist(i, j) / half);
          const u = (j < DAM_J ? LAKE_U : RIVER_U * RHALF / half) * Math.max(0.15, 1 - d * d);
          out.x = dc / n * u; out.z = u / n;
          if (j >= DAM_J1) for (const [ox, oz] of DAM_OUTLETS) {   // dưới đập: nước tỏa ra từ cửa xả (chỉ phía hạ lưu cửa)
            const ex = x - ox, ez = z - oz, r = Math.hypot(ex, ez);
            if (r > 0.3 && r < 14 && ez > -1) { const k = 0.45 * (1 - r / 14) / r; out.x += ex * k; out.z += ez * k; }
          }
          out.x += 0.05 * Math.sin(z * 0.9 + t * 0.35); out.z += 0.05 * Math.cos(x * 0.8 - t * 0.3);   // xoáy nhỏ trôi chậm
          return out;
        }
        let waterFlowFilled = false;
        function fillWaterFlow() {   // vận tốc dòng mặt tại từng đỉnh mặt nước → shader cuốn gợn và bọt đúng chiều dòng (hồ gần như lặng, sông chảy, cửa xả tỏa ra)
          waterFlowFilled = true; if (!waterSurfMesh) return;   // gọi ở khung đầu: waterFlow cần x2gi/z2gj khai báo ở phần sau
          const P = waterSurfMesh.geometry.attributes.position, A = waterSurfMesh.geometry.attributes.aWater, f = new THREE.Vector3();
          for (let v = 0; v < P.count; v++) { waterFlow(P.getX(v), P.getZ(v), 0, f); A.setXY(v, f.x, f.z); }
          A.needsUpdate = true;
        }
        // gợn tròn nhỏ (lá chạm nước, cá đớp, bọt vỡ) + bọt khí từ miệng cá — pool cố định, không cấp phát khi chạy
        const waterFx = (() => {
          const ringGeo = new THREE.RingGeometry(0.86, 1, 24); ringGeo.rotateX(-Math.PI / 2);
          const rings = Array.from({ length: 12 }, () => {
            const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xe8f4ff, transparent: true, opacity: 0, depthWrite: false }));
            m.visible = false; m.renderOrder = 2; m.name = 'Gợn nước nhỏ'; scene.add(m); return { m, t: 1, dur: 1, size: 0.2 };
          });
          const NB = 18, bub = new THREE.InstancedMesh(new THREE.SphereGeometry(0.018, 6, 4), new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.75, depthWrite: false }), NB);
          bub.frustumCulled = false; bub.name = 'Bọt khí từ miệng cá'; scene.add(bub);
          const B = Array.from({ length: NB }, () => ({ p: new THREE.Vector3(), on: false, ph: 0, v: 0.3 })), mtx = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
          for (let k = 0; k < NB; k++) bub.setMatrixAt(k, zero);
          let ri = 0, bi = 0, active = 0;
          const fx = {
            ring(x, y, z, size) { fluids?.splash(x, z, Math.max(0.45, size * 1.6), 0.04 + size * 0.22); const r = rings[ri++ % rings.length]; Object.assign(r, { t: 0, dur: 1.1 + size * 2, size }); r.m.position.set(x, y + 0.008, z); r.m.scale.setScalar(0.01); r.m.visible = true; active = 1; },
            bubbles(x, y, z, n) { for (let k = 0; k < n; k++) { const b = B[bi++ % NB]; b.p.set(x + (Math.random() - 0.5) * 0.06, y + k * 0.03, z + (Math.random() - 0.5) * 0.06); b.on = true; b.ph = Math.random() * TAU; b.v = 0.25 + Math.random() * 0.2; } active = 1; },
            update(dt, t) {
              if (!active) return;
              let any = false;
              for (const r of rings) {
                if (!r.m.visible) continue;
                r.t += dt; const k = r.t / r.dur; if (k >= 1) { r.m.visible = false; continue; }
                any = true; r.m.scale.setScalar(r.size * (0.2 + 0.8 * Math.sqrt(k))); r.m.material.opacity = 0.5 * (1 - k);
              }
              for (let k = 0; k < NB; k++) {
                const b = B[k]; if (!b.on) continue;
                b.p.y += b.v * dt; b.p.x += Math.sin(t * 9 + b.ph) * 0.03 * dt; const top = waterSurfaceY(b.p.x, b.p.z);
                if (b.p.y >= top - 0.01) { b.on = false; bub.setMatrixAt(k, zero); fx.ring(b.p.x, top, b.p.z, 0.07); any = true; continue; }   // bọt vỡ trên mặt nước
                any = true; bub.setMatrixAt(k, mtx.makeTranslation(b.p.x, b.p.y, b.p.z));
              }
              bub.instanceMatrix.needsUpdate = true; if (!any) active = 0;
            }
          };
          return fx;
        })();
        // ---- LÁ / CÁNH HOA RỤNG THEO GIÓ (vật lý hạt, hệ thế giới) ----
        //  · RỤNG: tốc độ ∝ lực cản đang đè lên tán (|U|^1,3) → cơn giật mạnh bứt lá/cánh hoa ra hàng loạt.
        //  · RƠI: lực cản BẬC HAI theo vận tốc so với GIÓ ĐỊA PHƯƠNG (trung bình theo độ cao + nhiễu loạn 3D, kể cả luồng lên/xuống) + trọng lực;
        //    hệ số cản đặt sao cho trong không khí lặng rơi đúng vận tốc giới hạn vT ⇒ lá nhẹ bám theo từng cơn gió, có lúc bị luồng lên nâng bổng.
        //  · KIỂU RƠI (Andersen–Pesavento–Wang 2005, Re ~10³ như lá thật): ĐU ĐƯA — lượn qua lại như con lắc, rơi nhanh nhất ở giữa nhịp,
        //    chậm lại, ngóc lên và hơi NHẤC LÊN ở hai đầu nhịp; hoặc LỘN VÒNG — tự xoay quanh trục ngang và trượt chéo đều sang một bên
        //    (Maxwell: chiều xoay quyết định hướng trượt).
        //  · CHẠM ĐẤT nằm im; gió sát đất (đã gồm cơn giật) đủ mạnh thì lá trượt lăn trên cỏ (trượt qua mép bờ thì rơi xuống nước),
        //    cơn giật có luồng lên thì bốc lá bay lại; hết thời gian thì thu nhỏ biến mất rồi tái sinh trên tán.
        //  · CHẠM MẶT NƯỚC dừng lại trên mặt (gợn một vòng nhỏ), nhấp nhô & nghiêng theo sóng, trôi theo DÒNG SÔNG + vài % gió (leeway),
        //    chạm bờ thì dạt sát bờ. Thỉnh thoảng lá ngấm nước rồi CHÌM: rơi chậm, lắc lư, trôi theo dòng yếu dần về đáy, nằm lại đáy rồi mờ đi.
        //    Lá chìm (đôi khi cả lá đang nổi) làm cá gần đó chú ý bơi tới ĐỚP ----
        const _lfM = new THREE.Matrix4(), _lfQ = new THREE.Quaternion(), _lfQ2 = new THREE.Quaternion(), _lfE = new THREE.Euler(0, 0, 0, 'YXZ'), _lfP = new THREE.Vector3(), _lfS = new THREE.Vector3(), _lfW = new THREE.Vector3(), _lfA = new THREE.Vector3(), _lfF = new THREE.Vector3(), _lfN = new THREE.Vector3();
        function makeLeafFall(o) {
          const im = new THREE.InstancedMesh(o.geo, new THREE.MeshLambertMaterial({ transparent: true, opacity: o.opacity }), o.n);
          im.name = o.name; im.frustumCulled = false; im.castShadow = true; im.userData.noBake = true; im.renderOrder = -1; scene.add(im);   // vẽ trước mặt nước trong suốt ⇒ lá chìm dưới nước vẫn thấy qua làn nước
          const col = new THREE.Color(), parts = [];
          for (let k = 0; k < o.n; k++) {
            col.setHex(o.color(k)); im.setColorAt(k, col);
            parts.push({ st: 0, p: new THREE.Vector3(), v: new THREE.Vector3(), age: 0, rest: 0, life: 0, ph: 0, om: 3, ax: 0, mode: 0, rot: 0, tilt: 0, yaw: 0, spin: 0, look: 0, sinkAt: Infinity, sinkV: 0.06, fish: 0 });   // st: 0 trên tán · 1 rơi · 2 nằm đất · 3 nổi · 4 chìm · 5 nằm đáy
            im.setMatrixAt(k, _lfM.compose(_lfP.set(0, -999, 0), _lfQ.identity(), _lfS.setScalar(0)));
          }
          if (im.instanceColor) im.instanceColor.needsUpdate = true;
          return { im, parts, o, acc: Math.random() };
        }
        function updateLeafFall(L, dt, t) {
          const o = L.o, h = Math.min(dt, 0.05), tw = o.tw, cd = o.g / (o.vTerm * o.vTerm);
          // bứt lá: theo lực gió đè lên tán (F) + theo cành GIẬT mạnh (tw.shake vượt ngưỡng o.shake0 — cây có cành dao động riêng); o.rate: nguồn riêng (rừng)
          L.acc = Math.min(2, L.acc + (o.rate ? o.rate(h) : o.rate0 + o.rateK * (0.35 * Math.max(0, (tw ? tw.F : 0) - 0.15) + (tw && o.shake0 ? Math.pow(Math.max(0, tw.shake / o.shake0 - 1), 1.5) : 0))) * h);
          const M = o.group.matrixWorld;
          for (let k = 0; k < L.parts.length; k++) {
            const q = L.parts[k];
            if (q.st === 0) {   // còn trên tán
              if (L.acc < 1) { L.im.setMatrixAt(k, _lfM.compose(_lfP.set(0, -999, 0), _lfQ.identity(), _lfS.setScalar(0))); continue; }
              const P = o.pts, pt = o.pick ? o.pick() : !P.subarray ? P[(Math.random() * P.length) | 0] : P.length ? P.subarray(((Math.random() * P.length / 3) | 0) * 3).subarray(0, 3) : null;   // điểm lá: mảng [x, y, z] hoặc mảng số liền
              if (!pt) { L.acc = Math.min(L.acc, 0.99); L.im.setMatrixAt(k, _lfM.compose(_lfP.set(0, -999, 0), _lfQ.identity(), _lfS.setScalar(0))); continue; }
              L.acc -= 1;
              q.p.set(pt[0], pt[1], pt[2]).applyMatrix4(M); q.p.x += (Math.random() - 0.5) * 0.3; q.p.z += (Math.random() - 0.5) * 0.3;
              windAt(q.p.x, q.p.y, q.p.z, q.p.y - cowY(q.p.x, q.p.z), q.v); q.v.multiplyScalar(0.5);   // bứt ra mang sẵn một phần vận tốc gió
              q.st = 1; q.age = 0; q.mode = Math.random() < o.tumble ? 1 : 0; q.ph = Math.random() * TAU; q.ax = Math.random() * TAU; q.rot = 0;
              q.om = q.mode ? (o.tumbleW[0] + Math.random() * (o.tumbleW[1] - o.tumbleW[0])) * (Math.random() < 0.5 ? -1 : 1) : o.flutW[0] + Math.random() * (o.flutW[1] - o.flutW[0]);
              q.yaw = Math.random() * TAU; q.tilt = (Math.random() - 0.5) * 0.3; q.fish = 0;
            }
            let sc = o.scale;
            if (q.st === 6) {   // đang ở trên người kỹ sư (trong tay / trên mũ — engineer/mind/reactions.js): q.hold đặt vị trí + hướng; trả false ⇒ rơi tiếp
              if (q.hold && q.hold(q.p, _lfQ)) { L.im.setMatrixAt(k, _lfM.compose(_lfP.copy(q.p), _lfQ, _lfS.setScalar(sc))); continue; }
              q.hold = null; q.st = 1;
            }
            if (q.st === 1) {   // đang rơi
              q.age += h;
              const gy = cowY(q.p.x, q.p.z);
              windAt(q.p.x, q.p.y, q.p.z, Math.max(0.05, q.p.y - gy), _lfW);
              const rx = q.v.x - _lfW.x, ry = q.v.y - _lfW.y, rz = q.v.z - _lfW.z, kf = 1 / (1 + cd * Math.hypot(rx, ry, rz) * h);   // cản bậc 2, tích phân ẩn (ổn định)
              q.v.set(_lfW.x + rx * kf, _lfW.y + ry * kf - o.g * h, _lfW.z + rz * kf);
              const sx = Math.cos(q.ax), sz = Math.sin(q.ax);
              let ox = 0, oy = 0, oz = 0;
              if (q.mode === 0) {   // đu đưa: vận tốc ngang A·cos φ theo trục đu, rơi nhanh nhất giữa nhịp, nhấc nhẹ ở hai đầu
                q.ph += q.om * h; q.ax += 0.12 * h;
                const c1 = Math.cos(q.ph), s1 = Math.sin(q.ph);
                ox = sx * o.flutA * c1; oz = sz * o.flutA * c1; oy = -o.vTerm * 1.15 * Math.cos(2 * q.ph);
                _lfE.set(0.8 * s1, q.ax + q.yaw * 0.2, q.tilt); _lfQ.setFromEuler(_lfE);
              } else {              // lộn vòng: tự xoay quanh trục ngang (sx, 0, sz), trượt chéo theo hướng ⊥ trục
                q.rot += q.om * h; const dsg = q.om > 0 ? 1 : -1;
                ox = -sz * o.vTerm * 0.7 * dsg; oz = sx * o.vTerm * 0.7 * dsg; oy = o.vTerm * 0.15 * Math.sin(2 * q.rot);
                _lfQ.setFromAxisAngle(_lfA.set(sx, 0, sz), q.rot); _lfQ2.setFromAxisAngle(_lfA.set(0, 1, 0), q.yaw); _lfQ.multiply(_lfQ2);
              }
              q.p.x += (q.v.x + ox) * h; q.p.y += (q.v.y + oy) * h; q.p.z += (q.v.z + oz) * h;
              const gi = Math.round(x2gi(q.p.x)), gj = Math.round(z2gj(q.p.z)), onW = waterCell(gi, gj), gy2 = onW ? waterSurfaceY(q.p.x, q.p.z) : cowY(q.p.x, q.p.z);
              if (q.p.y <= gy2 + 0.02) {
                if (onW) {   // CHẠM MẶT NƯỚC: dừng lại trên mặt, gợn một vòng nhỏ; định trước lá này có ngấm nước chìm hay không
                  q.p.y = gy2 + 0.004; q.st = 3; q.rest = 0; q.yaw = q.ax; q.spin = (Math.random() - 0.5) * 0.6; q.look = 1 + Math.random() * 3;
                  q.life = o.floatLife[0] + Math.random() * (o.floatLife[1] - o.floatLife[0]);
                  q.sinkAt = Math.random() < o.sinkP ? 4 + Math.random() * (q.life - 8) : Infinity;
                  q.v.set(q.v.x * 0.15, 0, q.v.z * 0.15); waterFx.ring(q.p.x, gy2, q.p.z, 0.16 + 0.1 * o.scale);
                } else { q.p.y = gy2 + 0.02; q.st = 2; q.rest = 0; q.life = o.restLife[0] + Math.random() * (o.restLife[1] - o.restLife[0]); q.yaw = q.ax; }
              }
              else if (q.age > 45 || gi < -40 || gj < -40 || gi > GX + 40 || gj > GZ + 40) q.st = 0;
            }
            if (q.st === 2) {   // nằm trên đất
              q.rest += h;
              windAt(q.p.x, q.p.y, q.p.z, 0.15, _lfW); const wh = Math.hypot(_lfW.x, _lfW.z);
              if (wh > o.slideU) {   // gió sát đất đủ mạnh: lá trượt lăn trên cỏ
                const f = (wh - o.slideU) / wh * 0.6;
                q.p.x += _lfW.x * f * h; q.p.z += _lfW.z * f * h; q.yaw += 1.2 * f * h * (q.om > 0 ? 1 : -1);
                if (waterCell(Math.round(x2gi(q.p.x)), Math.round(z2gj(q.p.z)))) {   // trượt qua mép bờ: rơi xuống mặt nước bên dưới
                  q.st = 1; q.age = 0; q.mode = 0; q.v.set(_lfW.x * 0.3, 0, _lfW.z * 0.3);
                } else {
                  q.p.y = cowY(q.p.x, q.p.z) + 0.02;
                  if (wh > o.slideU * 1.6 && _lfW.y > 0.04 && Math.random() < h * 0.5) {   // cơn giật có luồng lên: bốc lá bay lại
                    q.st = 1; q.age = 0; q.v.set(_lfW.x * 0.8, 0.5 + _lfW.y * 2, _lfW.z * 0.8); q.mode = 1; q.om = (6 + Math.random() * 4) * (Math.random() < 0.5 ? -1 : 1); q.rot = 0; q.ax = Math.atan2(_lfW.z, _lfW.x) + Math.PI / 2;
                  }
                }
              }
              if (q.st === 2) {
                _lfE.set(q.tilt, q.yaw, 0); _lfQ.setFromEuler(_lfE);
                sc *= Math.max(0, Math.min(1, (q.life - q.rest) / 1.2));
                if (q.rest >= q.life) q.st = 0;
              } else _lfQ.identity();
            }
            if (q.st === 3) {   // NỔI: trôi theo dòng + một phần gió (leeway), chạm bờ thì dừng sát bờ, nhấp nhô & nghiêng theo mặt sóng
              q.rest += h;
              waterFlow(q.p.x, q.p.z, t, _lfF); windAt(q.p.x, q.p.y, q.p.z, 0.1, _lfW);
              const kr = 1 - Math.exp(-h / 0.8);   // lá có quán tính nhỏ: bám theo dòng sau ~0,8 s
              q.v.x += (_lfF.x + _lfW.x * o.leeway - q.v.x) * kr; q.v.z += (_lfF.z + _lfW.z * o.leeway - q.v.z) * kr;
              const nx = q.p.x + q.v.x * h, nz = q.p.z + q.v.z * h;
              if (waterCell(Math.round(x2gi(nx)), Math.round(z2gj(q.p.z)))) q.p.x = nx; else q.v.x *= -0.2;   // chạm bờ: dừng, nảy nhẹ
              if (waterCell(Math.round(x2gi(q.p.x)), Math.round(z2gj(nz)))) q.p.z = nz; else q.v.z *= -0.2;
              const wy = waterSurfaceY(q.p.x, q.p.z), gx = waterSurfaceY(q.p.x + 0.2, q.p.z) - wy, gz = waterSurfaceY(q.p.x, q.p.z + 0.2) - wy;
              q.p.y = wy + 0.004;
              q.spin += ((Math.random() - 0.5) * 0.8 - q.spin) * h * 0.3; q.yaw += q.spin * h;
              _lfQ.setFromUnitVectors(_lfA.set(0, 1, 0), _lfN.set(-gx / 0.2, 1, -gz / 0.2).normalize()); _lfQ2.setFromAxisAngle(_lfA.set(0, 1, 0), q.yaw); _lfQ.multiply(_lfQ2);
              if (q.rest >= q.sinkAt) {   // ngấm nước: bắt đầu chìm — cá gần đó để ý
                q.st = 4; q.sinkV = o.sinkV[0] + Math.random() * (o.sinkV[1] - o.sinkV[0]); q.ph = Math.random() * TAU; q.look = 2;
                q.p.y = wy - 0.02; fishAlertLeaf(q, 8, 0.9);
              } else {
                if ((q.look -= h) <= 0) { q.look = 3 + Math.random() * 2; if (!q.fish) fishAlertLeaf(q, 2.5, 0.15); }   // thỉnh thoảng cá ngoi lên đớp lá đang nổi
                sc *= Math.max(0, Math.min(1, (q.life - q.rest) / 1.5));
                const gi = Math.round(x2gi(q.p.x)), gj = Math.round(z2gj(q.p.z));
                if (q.rest >= q.life || gi < -MX || gj < -MZ || gi >= GX + MX || gj >= GZ + MZ) q.st = 0;
              }
            }
            if (q.st === 4) {   // CHÌM: rơi chậm trong nước, lắc lư như lá rơi trong không khí nhưng chậm hơn nhiều, trôi theo dòng yếu dần về đáy
              q.rest += h; q.ph += 2.4 * h; q.yaw += 0.2 * h;
              const gi = Math.round(x2gi(q.p.x)), gj = Math.round(z2gj(q.p.z)), top = waterSurfaceY(q.p.x, q.p.z), bed = riverBedY(gi, gj);
              const fz = Math.max(0, Math.min(1, (q.p.y - bed) / Math.max(0.2, top - bed)));
              waterFlow(q.p.x, q.p.z, t, _lfF); const kd = Math.pow(fz, 1 / 7), kr = 1 - Math.exp(-h / 0.6);
              q.v.x += (_lfF.x * kd - q.v.x) * kr; q.v.z += (_lfF.z * kd - q.v.z) * kr;
              const sw = Math.cos(q.ph) * 0.06, nx = q.p.x + (q.v.x + Math.cos(q.ax) * sw) * h, nz = q.p.z + (q.v.z + Math.sin(q.ax) * sw) * h;
              if (waterCell(Math.round(x2gi(nx)), gj)) q.p.x = nx;
              if (waterCell(gi, Math.round(z2gj(nz)))) q.p.z = nz;
              q.p.y = Math.min(q.p.y - q.sinkV * (0.7 + 0.6 * Math.abs(Math.sin(q.ph))) * h, top - 0.02);   // chìm nhanh nhất lúc lá dựng nghiêng
              _lfE.set(0.45 * Math.sin(q.ph), q.yaw, q.tilt); _lfQ.setFromEuler(_lfE);
              if (q.p.y <= bed + 0.012) { q.p.y = bed + 0.012; q.st = 5; q.rest = 0; q.life = 10 + Math.random() * 10; q.tilt = (Math.random() - 0.5) * 0.2; }
              else if ((q.look -= h) <= 0) { q.look = 2; if (!q.fish) fishAlertLeaf(q, 8, 0.6); }
            }
            if (q.st === 5) {   // nằm dưới đáy rồi mờ dần
              q.rest += h; _lfE.set(q.tilt, q.yaw, 0); _lfQ.setFromEuler(_lfE);
              sc *= Math.max(0, Math.min(1, (q.life - q.rest) / 2)); if (q.rest >= q.life) q.st = 0;
            }
            if (q.st === 0) { L.im.setMatrixAt(k, _lfM.compose(_lfP.set(0, -999, 0), _lfQ.identity(), _lfS.setScalar(0))); continue; }
            L.im.setMatrixAt(k, _lfM.compose(_lfP.copy(q.p), _lfQ, _lfS.setScalar(sc)));
          }
          L.im.instanceMatrix.needsUpdate = true;
        }
        let cherryCtl = null, oldTreeLeafCtl = null, cherryWind = null, oldTreeWind = null;
        { const ct = cherryTree(1.2); ct.position.copy(worldCell(29, 35.5)); ct.rotation.y = Math.random() * 6.28; ct.name = 'Cây anh đào (Cherry Blossom Tree)'; scene.add(ct);   // 1 cây duy nhất cạnh xe van
          cherryWind = ct.userData.treeWind; finalizeTreeWind(cherryWind, ct);
          { // cánh hoa rải sẵn dưới gốc: đặt lúc dựng cây theo độ cao cố định ⇒ lơ lửng trên mép bậc đất / lệch độ cao. Nay hạ đúng mặt ô đất;
            // cánh rơi trên mặt nước hoặc vắt qua mép bậc (4 góc không cùng độ cao) thì bỏ
            const F = ct.userData.fallen, m = new THREE.Matrix4(), p = new THREE.Vector3(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), inv = new THREE.Matrix4();
            ct.updateMatrixWorld(true); inv.copy(F.matrixWorld).invert();
            const cell = (x, z) => [Math.round(x / BLOCK + cx - 0.5), Math.round(z / BLOCK + cz - 0.5)], hd = 0.09;   // (= x2gi/z2gj, khai báo sau tệp này)
            for (let k = 0; k < F.count; k++) {
              F.getMatrixAt(k, m); m.decompose(p, q, sc); p.applyMatrix4(F.matrixWorld);
              const ys = [[-hd, -hd], [hd, -hd], [-hd, hd], [hd, hd], [0, 0]].map(([dx, dz]) => { const [i, j] = cell(p.x + dx, p.z + dz); return waterCell(i, j) ? NaN : surfaceY(i, j); });   // (cowY chưa khai báo lúc này; quanh gốc anh đào không có mặt đập nên trùng nhau)
              const ok = ys.every(y => Math.abs(y - ys[4]) < 1e-3);
              if (ok) { p.y = ys[4] + 0.01; p.applyMatrix4(inv); } else sc.setScalar(0);
              F.setMatrixAt(k, m.compose(p, q, sc));
            }
            F.instanceMatrix.needsUpdate = true;
          }
          cherryCtl = makeLeafFall({ name: 'Cánh hoa anh đào rơi theo gió', group: ct, pts: ct.userData.blossomPts, n: 36, geo: new THREE.BoxGeometry(0.19 * 1.2, 0.002 * 1.2, 0.19 * 1.2), opacity: 0.75,
            color: () => cherryPinks[(Math.random() * cherryPinks.length) | 0], scale: 1, tw: cherryWind, g: 3.5, vTerm: 0.45, flutA: 0.5, flutW: [3.5, 5], tumble: 0.15, tumbleW: [9, 14], slideU: 0.5, rate0: 0.15, rateK: 3.0, shake0: 0.02, restLife: [10, 20], floatLife: [25, 45], sinkP: 0.25, sinkV: [0.05, 0.08], leeway: 0.035 }); }

