        // ===== CÂY CỔ THỤ: BÓNG TRỜI DƯỚI TÁN + BÓNG GÓC KẼ RỄ (G 06/11 "research … rễ cây, shadow, texture then improve cho cây cổ thụ") ----
        //  · Lớp TÁN (core/sky-shade.js): điểm lá thật của cổ thụ + cây con (vị trí thế giới + diện tích từng lá) ⇒ độ thấy trời từng ô 0,5 m dưới tán; tính 1 lần
        //    khi trang tải xong (~50 ms, chia ≤ 4 ms / khung). Dưới tán dày chỉ còn ~40 % ánh trời ⇒ vũng bóng râm sâu, đốm nắng giữ nguyên độ sáng.
        //  · Lớp SÁT ĐẤT: bóng góc mặt đất (core/ao-bake.js floor — ô 5 cm, tia 1 m): rễ, gốc thân, đá hộc chắn ⇒ kẽ giữa 2 rễ, chân đá, chỗ rễ chui vào đất tối
        //    dần như thật. Ô vật chắn chụp NGAY lúc dựng cảnh (aoVoxNow — bitset ~190 KB): lưới vỏ thân + rễ bị bỏ bản RAM sau khi lên GPU (core/mem-trim.js).
        //    Tia tính lần đầu nhìn gần (zoom ≥ ×4, tâm nhìn cách gốc < 24 đv) khi trang đã tải, xong thì bỏ bitset. recv: false — không nhận bóng theo đỉnh (vỏ
        //    cây, đá đã có bóng hốc khuất SF_CV trong shader — skyShadeMat cav).
        //  · Thay bóng tiếp đất cắt lát (world/ground-contact.js) của thân + rễ: quầng mờ đều quanh rễ (cả chỗ trống) ⇒ nhìn giả; giờ tối đúng kẽ, chỉ ánh trời.
        const OT_SHADE = { ready: false, opt: null, doneB: false, CAN: { k: 1.25, floor: 0.3 }, FLOOR: { r: 1.0, k: 1.0, max: 0.65, ps: 0.05, fade: 0.4 } };
        (function otVox() {   // hộp gốc (rễ + 1 m, đất −0,3 → +1,4) + ô vật chắn 5 cm, ngay lúc dựng cảnh
          const Rt = scene.getObjectByName('Rễ cây cổ thụ'), T = scene.getObjectByName('Cây cổ thụ (Old Tree)'), St = scene.getObjectByName('Đá hộc phủ rêu quanh gốc cổ thụ'); if (!Rt || !T) return;
          const gy = Rt.position.y, box = new THREE.Box3().setFromObject(Rt).expandByScalar(1), t0 = performance.now(); box.min.y = gy - 0.3; box.max.y = gy + 1.4;
          const roots = [Rt, T, St].filter(Boolean), occ = aoVoxNow({ roots, box, vox: 0.05 });
          OT_SHADE.opt = { key: 'cổ thụ: chân', roots, box, ground: true, vox: 0.05, recv: false, occ, floor: { ...OT_SHADE.FLOOR, done: otFloor } }; OT_SHADE.voxMs = Math.round(performance.now() - t0);
        })();
        ldGate.then(() => Promise.race([Promise.all(ldNeed), new Promise(r => setTimeout(r, 8000))])).then(() => {
          OT_SHADE.ready = true; const T = scene.getObjectByName('Cây cổ thụ (Old Tree)'); if (!T) return; T.updateMatrixWorld(true);
          const pts = [], M = new THREE.Matrix4(), a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
          T.traverse(o => {   // lá: InstancedMesh của cổ thụ + cây con — diện tích từng lá = tổng tam giác hình lá sau ma trận lá (đúng cả lá co giãn lệch)
            if (!o.isInstancedMesh) return; const P = o.geometry.attributes.position, I = o.geometry.index; if (!P.array || (I && !I.array)) return;
            for (let i = 0; i < o.count; i++) {
              o.getMatrixAt(i, M); M.premultiply(o.matrixWorld); let ar = 0;
              for (let t = 0, n = I ? I.count : P.count; t < n; t += 3) { a.fromBufferAttribute(P, I ? I.getX(t) : t).applyMatrix4(M); b.fromBufferAttribute(P, I ? I.getX(t + 1) : t + 1).applyMatrix4(M);
                c.fromBufferAttribute(P, I ? I.getX(t + 2) : t + 2).applyMatrix4(M); ar += b.sub(a).cross(c.sub(a)).length() / 2; }
              a.setFromMatrixPosition(M); pts.push(a.x, a.y, a.z, ar);
            }
          });
          if (pts.length) worldJoin('skyShade', 10, S => S.canopy({ pts: new Float32Array(pts), ...OT_SHADE.CAN }));
        });
        worldTick('afterRender', 92, () => {   // MỖI KHUNG (sau khi vẽ): lần đầu nhìn gần gốc ⇒ xếp hàng nướng bóng góc kẽ rễ (1 lần)
          const o = OT_SHADE.opt; if (!o || o.asked || !OT_SHADE.ready || camera.zoom < 4) return;
          const c = o.box.getCenter(_otC); if (Math.hypot(target.x - c.x, target.z - c.z) > 24) return;
          o.asked = true; aoBake(scene, o);
        });
        const _otC = new THREE.Vector3();
        function otFloor(f) {   // bóng góc mặt đất (RGBA, độ mờ ở A) → lớp SÁT ĐẤT RG8: R = 1 − độ mờ, G = độ cao đất (cm trên ô thấp nhất) · 1 lần (mất ngữ cảnh: ảnh RAM tự tải lại)
          if (OT_SHADE.doneB) return; OT_SHADE.doneB = true; delete OT_SHADE.opt.occ;
          const n = f.NX * f.NZ, px = new Uint8Array(n * 2), G = new Float32Array(n); let g0 = 1e9;
          for (let k = 0; k < f.NZ; k++) for (let i = 0; i < f.NX; i++) { const y = cowY(f.x0 + (i + 0.5) * f.ps, f.z0 + (k + 0.5) * f.ps); G[k * f.NX + i] = y; g0 = Math.min(g0, y); }
          for (let i = 0; i < n; i++) { px[i * 2] = 255 - f.px[i * 4 + 3]; px[i * 2 + 1] = Math.min(255, Math.round((G[i] - g0) / 0.01)); }
          worldJoin('skyShade', 10, S => S.layer('B', { px, NX: f.NX, NZ: f.NZ, x0: f.x0, z0: f.z0, x1: f.x1, z1: f.z1, y: g0, m: 0.01 }));
        }
