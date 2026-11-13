        // ==== XEM XUYÊN XE (01/11 đợt 11 — dời nguyên văn từ ui/xray-lifecycle.js: xem xuyên là một trạng thái của xe, như cửa mở): mặt vỏ xe mờ đi, chỉ còn
        //      nét line-art; nội thất (giường, toilet, lavabo, bếp, bàn học, bàn…) giữ nguyên. Bên ngoài chỉ hỏi / bật qua mặt xe: VAN.xray, VAN.setXray(on) —
        //      người xem bấm xe (ui/xray-lifecycle.js); đề máy tự xem xuyên để thấy máy (van/engine/engine-run.js); vỏ GLB nạp sau tự vào danh sách (xrayAdopt,
        //      van/body/transit-glb.js) ----
        const caravanRole = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.xray) return p.userData.xray; return ''; };
        const caravanShell = [];
        caravanObj.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') caravanShell.push(o); });
        const shellHidden = new THREE.MeshBasicMaterial({ visible: false });   // ẩn mặt nhưng nét viền con vẫn vẽ, và vẫn bấm trúng được
        // xem xuyên = mặt vỏ còn 25% (thấy dáng xe), nét viền giữ 100%,
        //  vỏ trong khoang hàng (userData.xrayHide) ẩn hẳn ⇒ nội thất rõ; mỗi vật liệu vỏ 1 bản mờ dùng chung
        // thanh nét viền (VAN_LINES.k — core/axes-pin-bake.js; thanh trượt ở ui/labels-controls.js)
        //  làm mờ luôn mặt vỏ — độ mờ = min(xem xuyên ? 0,25 : 1, k); vách phòng tắm (userData.vanWall) không theo thanh; 0 ⇒ ẩn mặt nhưng vẫn bấm trúng
        const xrayMats = [new Map(), new Map()], xrayOf = (m, cab) => { const K = xrayMats[cab ? 1 : 0]; let x = K.get(m); if (!x) { x = m.clone(); x.transparent = true; x.depthWrite = false; x.userData.op0 = m.opacity ?? 1; K.set(m, x); } return x; };   // bản mờ riêng cho vỏ cabin (độ mờ khác phần còn lại)
        const vanWall = o => { for (let p = o; p && p !== scene; p = p.parent) if (p.userData.vanWall) return true; return false; };
        let caravanXray = false;
        function shellLook(m) {
          const base = m.userData.xrayMaterial || m.material, cab = !!m.userData.cabShell, a = Math.min(caravanXray || cab ? 0.25 : 1, m.userData.cabIn || vanWall(m) ? 1 : VAN_LINES.k);
          if (a >= 1) { if (m.userData.xrayMaterial) { m.material = base; delete m.userData.xrayMaterial; } return; }
          m.userData.xrayMaterial = base;
          if (a <= 0 || m.userData.xrayHide || !base.color) { m.material = shellHidden; return; }
          const x = xrayOf(base, cab); x.opacity = Math.min(a, x.userData.op0); m.material = x;
        }
        // VỎ QUANH CABIN LÁI LUÔN XEM XUYÊN (mặt còn 25 % ⇒ ghế trước, vô-lăng, táp-lô thấy 75 % ở mọi lúc, không cần bấm xe): tam giác vỏ có tâm trong vùng cabin
        //  (toạ độ xe, mũi = −x) tách khỏi lưới gốc thành lưới riêng dùng chung mảng đỉnh (tam giác vắt qua biên bị chẻ theo CAB_CUT), đánh dấu userData.cabShell. Vùng = phần trên đai kính từ kính lái tới
        //  cột B (phía mũi: trên đường song song kính lái, thấp hơn 25 cm ⇒ ca-pô, tai xe không bị cắt nham nhở) + 2 cửa trước cả tấm. Táp-lô / nút điều khiển (lớp dash*, ctrl của thân) là nội thất ⇒ giữ đặc; ca-pô, logo giữ đặc. Nét viền là con của lưới gốc ⇒ giữ 100 %
        const CAB = { x0: -2.9, x1: -0.55, belt: 1.5, ws: [-2.87, 1.31, 0.97], door: [-2.13, 0.6] }, _ci = new THREE.Matrix4(), _cv = [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()];
        const inCab = (x, y, z) => x > CAB.x0 && x < CAB.x1 && (y > Math.max(CAB.belt, CAB.ws[1] + (x - CAB.ws[0]) * CAB.ws[2]) || (x > CAB.door[0] && Math.abs(z) > CAB.door[1]));
        // mặt cắt của vùng (toạ độ xe): [nx, ny, nz, d] ⇒ tam giác vắt qua biên được chẻ đúng theo mặt (đỉnh mới nội suy mọi thuộc tính) ⇒ mép thẳng, không răng cưa
        const CAB_CUT = [[1, 0, 0, -CAB.x1], [1, 0, 0, -CAB.x0], [-CAB.ws[2], 1, 0, CAB.ws[2] * CAB.ws[0] - CAB.ws[1]], [0, 1, 0, -CAB.belt], [1, 0, 0, -CAB.door[0]], [0, 0, 1, -CAB.door[1]], [0, 0, 1, CAB.door[1]]];
        function cabSplit(o, root) {
          const g = o.geometry, P = g.attributes.position, I = g.index; if (!I || !I.array || !P || !P.array) return null;
          let part = ''; for (let p = o.parent; p && p !== root; p = p.parent) part = p.name || part;   // bộ phận có bản lề (cửa, tay nắm, ca-pô, logo): cả lưới theo tâm hộp bao
          if (!part && /· (dash|dashTop|ctrl)$/.test(o.name)) return null;
          _ci.copy(caravanObj.matrixWorld).invert().multiply(o.matrixWorld);
          if (part) { if (!g.boundingBox) g.computeBoundingBox(); const c = g.boundingBox.getCenter(_cv[0]).applyMatrix4(_ci); if (c.x > CAB.door[0] && c.x < CAB.x1 && Math.abs(c.z) > CAB.door[1]) o.userData.cabShell = true; return null; }
          const names = Object.keys(g.attributes), plain = names.every(n => g.attributes[n].isBufferAttribute && !g.attributes[n].isInterleavedBufferAttribute);
          const X = []; for (let i = 0; i < P.count; i++) { const v = _cv[0].fromBufferAttribute(P, i).applyMatrix4(_ci); X.push(v.x, v.y, v.z); }
          const A = I.array, cab = [], rest = [], add = names.map(() => []), memo = new Map(); let nV = P.count;
          const dist = (i, c) => c[0] * X[i * 3] + c[1] * X[i * 3 + 1] + c[2] * X[i * 3 + 2] + c[3];
          const mid = (a, b, k, ci) => {   // đỉnh mới trên cạnh a–b (dùng lại cho tam giác kề ⇒ không hở)
            const key = (a < b ? a + '_' + b : b + '_' + a) + '_' + ci, h = memo.get(key); if (h !== undefined) return h;
            names.forEach((n, q) => { const at = g.attributes[n], s = at.itemSize, src = at.array, ex = add[q]; for (let j = 0; j < s; j++) { const va = a < P.count ? src[a * s + j] : ex[(a - P.count) * s + j], vb = b < P.count ? src[b * s + j] : ex[(b - P.count) * s + j]; ex.push(va + (vb - va) * k); } });
            for (let j = 0; j < 3; j++) X.push(X[a * 3 + j] + (X[b * 3 + j] - X[a * 3 + j]) * k); memo.set(key, nV); return nV++;
          };
          const emit = poly => {   // đa giác lồi: mọi đỉnh (co 2 % về tâm) cùng phía ⇒ xuất; không thì chẻ theo mặt cắt đầu tiên vắt qua
            let cx = 0, cy = 0, cz = 0; for (const i of poly) { cx += X[i * 3]; cy += X[i * 3 + 1]; cz += X[i * 3 + 2]; } cx /= poly.length; cy /= poly.length; cz /= poly.length;
            const inC = inCab(cx, cy, cz); let same = true; for (const i of poly) if (inCab(cx + (X[i * 3] - cx) * 0.98, cy + (X[i * 3 + 1] - cy) * 0.98, cz + (X[i * 3 + 2] - cz) * 0.98) !== inC) { same = false; break; }
            if (!same && plain) for (let ci = 0; ci < CAB_CUT.length; ci++) {
              const c = CAB_CUT[ci], d = poly.map(i => dist(i, c)); if (!(Math.max(...d) > 1e-4 && Math.min(...d) < -1e-4)) continue;
              const pa = [], pb = [];
              for (let n = 0; n < poly.length; n++) {
                const i = poly[n], j = poly[(n + 1) % poly.length], di = d[n], dj = d[(n + 1) % poly.length];
                if (di >= 0) pa.push(i); if (di <= 0) pb.push(i);
                if ((di > 1e-4 && dj < -1e-4) || (di < -1e-4 && dj > 1e-4)) { const m = i < j ? mid(i, j, di / (di - dj), ci) : mid(j, i, dj / (dj - di), ci); pa.push(m); pb.push(m); }
              }
              if (pa.length >= 3) emit(pa); if (pb.length >= 3) emit(pb); return;
            }
            const out = inC ? cab : rest; for (let n = 1; n + 1 < poly.length; n++) out.push(poly[0], poly[n], poly[n + 1]);
          };
          for (let t = 0; t < A.length; t += 3) emit([A[t], A[t + 1], A[t + 2]]);
          if (!cab.length) return null; if (!rest.length) { o.userData.cabShell = true; return null; }
          if (nV > P.count) names.forEach((n, q) => { const at = g.attributes[n], arr = new at.array.constructor(nV * at.itemSize), fl = arr instanceof Float32Array; arr.set(at.array); const ex = add[q]; for (let j = 0; j < ex.length; j++) arr[P.count * at.itemSize + j] = fl ? ex[j] : Math.round(ex[j]); g.setAttribute(n, new THREE.BufferAttribute(arr, at.itemSize, at.normalized)); });
          const g2 = new THREE.BufferGeometry(); for (const n in g.attributes) g2.setAttribute(n, g.attributes[n]); g2.setIndex(cab); g.setIndex(rest);
          const c = new THREE.Mesh(g2, o.material); c.name = o.name + ' · cabin'; c.castShadow = o.castShadow; c.receiveShadow = o.receiveShadow; c.userData.cabShell = true;
          if (o.userData.xrayHide) c.userData.xrayHide = true; c.position.copy(o.position); c.quaternion.copy(o.quaternion); c.scale.copy(o.scale); o.parent.add(c); c.updateMatrixWorld(true); return c;
        }
        // NỘI THẤT CABIN MANG VAI VỎ (táp-lô, cụm đồng hồ, màn hình, thảm sàn, lớp dash* / ctrl của thân): hộp bao nằm trọn trong lòng cabin ⇒ userData.cabIn, không mờ theo thanh nét viền
        //  (thanh về 1 ⇒ vỏ gần mất, nội thất cabin vẫn đủ); bấm xe xem xuyên thì vẫn còn 25 % như vỏ
        const _cb = new THREE.Box3();
        function cabInside(o) {
          if (o.userData.cabShell || !o.geometry || !o.geometry.attributes.position) return; if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
          _cb.copy(o.geometry.boundingBox).applyMatrix4(_ci.copy(caravanObj.matrixWorld).invert().multiply(o.matrixWorld));
          if (_cb.min.x > -2.6 && _cb.max.x < CAB.x1 && _cb.min.y > 0.7 && _cb.max.y < 1.95 && _cb.min.z > -1 && _cb.max.z < 1) o.userData.cabIn = true;
        }
        function xrayAdopt(root) {   // vỏ nạp sau (mẫu GLB Transit): đưa vào danh sách vỏ, đang xem xuyên / thanh trượt < 100 thì đổi luôn
          root.updateWorldMatrix(true, true); const list = []; root.traverse(o => { if (o.isMesh && caravanRole(o) === 'shell') list.push(o); });
          for (const o of list) { const c = cabSplit(o, root); cabInside(o); caravanShell.push(o); shellLook(o); if (c) { caravanShell.push(c); shellLook(c); } }
        }
        function setCaravanXray(on) { if (on === caravanXray) return; caravanXray = on; for (const m of caravanShell) shellLook(m); }
        caravanObj.updateWorldMatrix(true, true); for (const m of caravanShell) cabInside(m);
        VAN_LINES.onShell = () => { for (const m of caravanShell) shellLook(m); }; VAN_LINES.onShell();
