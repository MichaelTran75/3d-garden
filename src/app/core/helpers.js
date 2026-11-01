        // ==== TIỆN ÍCH DÙNG CHUNG (G 01/11 — dời NGUYÊN VĂN khỏi tệp tính năng: bò, tua-bin, gió, cây, đèn đường, trạm biến áp, ghế — để tệp tính năng thôi làm
        //      "thư viện" cho hàng chục tệp khác: bỏ / tách 1 tính năng không còn kéo gãy cả cảnh) ====
        // Đứng ngay sau core/sky-sun-moon.js (S, BLOCK, GX, GZ, cx, cz, wx, wz, surfaceY khai báo ở đó) ⇒ mọi tên dưới đây gọi được lúc dựng cảnh từ tệp kế tiếp.
        // Cùng nhóm: độ cao mặt đứng cowY ở core/ground.js (cần đập + đường đã dựng), dẫn đường flow field ở core/flow-field.js (cần đủ vật cản đã đăng ký).

        // ---- toán: 2π (trước ở nature/wind-physics.js) · quỹ đạo giật tối thiểu Flash–Hogan 0..1, vận tốc + gia tốc = 0 ở hai đầu (trước ở engineer/body/seats.js) ----
        const TAU = Math.PI * 2,
          minJerk = s => { s = Math.max(0, Math.min(1, s)); return s * s * s * (10 + s * (6 * s - 15)); };
        // ---- hướng khung: trục +z → dir, trục +y gần up nhất (trước ở engineer/tasks/meal-read.js — tay kỹ sư cầm thìa, bay, sào… · cần máy cắt cỏ) ----
        const _aqX = new THREE.Vector3(), _aqY = new THREE.Vector3(), _aqZ = new THREE.Vector3(), _aqM = new THREE.Matrix4();
        function aimQ(out, dir, up) {   // trục +z → dir, trục +y gần up nhất
          const z = _aqZ.copy(dir).normalize(), x = _aqX.crossVectors(up, z); if (x.lengthSq() < 1e-8) x.set(1, 0, 0); x.normalize();
          return out.setFromRotationMatrix(_aqM.makeBasis(x, _aqY.crossVectors(z, x), z));
        }
        // ---- vật đang hiện thật: chính nó + mọi cha đều visible (trước là hovShown ở ui/hover-select.js — viền rê chuột, nhãn theo con vật, bong bóng kỹ sư, radio,
        //      máy cắt cỏ cùng hỏi) ----
        const shownInScene = o => { for (let p = o; p; p = p.parent) if (!p.visible) return false; return true; };
        // ---- PRNG có hạt (trước ở nature/flowers-trees.js): cùng hạt ⇒ cùng dãy số mỗi lần tải — cây đệ quy, mặt đường, rêu, cỏ… tái sinh y hệt ----
        function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let z = Math.imul(a ^ a >>> 15, 1 | a); z = (z + Math.imul(z ^ z >>> 7, 61 | z)) ^ z; return ((z ^ z >>> 14) >>> 0) / 4294967296; }; }
        // ---- lưới ô ↔ thế giới: x2gi / z2gj = nghịch đảo wx / wz (chỉ số ô thực, tự làm tròn khi tra bảng; trước ở animals/cows/herd-hut.js) · worldCell = ô GỐC
        //      (oi, oj — 1 khối gốc = S ô nhỏ) → điểm trên mặt đất + y (trước ở world/substation-bess.js) ----
        const x2gi = x => x / BLOCK + cx - 0.5, z2gj = z => z / BLOCK + cz - 0.5;
        function worldCell(oi, oj, y = 0) { const i = oi * S, j = oj * S; return new THREE.Vector3(wx(i), surfaceY(i, j) + y, wz(j)); }
        // ---- cỡ cả vật tự nhiên (cây, hoa, thú, côn trùng — thu quanh gốc của vật; chỗ rải trong cảnh + đường bay / đi giữ nguyên; trước ở world/street-lamps.js) ----
        const NATURE_SCALE = 0.90; // Whole-object size; world scatter and flight/walk paths stay independent.
        // ---- DANH SÁCH VẬT CẢN CHUNG {x, y, z, r, h} (trước ở world/wind-turbines.js): công trình, cây, đồ trại tự đẩy vào lúc dựng — r = bán kính NÊN TRÁNH
        //      (đã nới), y + h cho lưới bay ong / bướm (thiếu ⇒ hộp NaN). Đọc: lưới cấm flow field, lưới môi trường thú nhỏ (envFree), né cục bộ, côn trùng ----
        const obstacleCoords = [];
