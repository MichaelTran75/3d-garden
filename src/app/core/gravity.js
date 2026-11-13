        // ====== TRỌNG LỰC DÙNG CHUNG ======
        //  Mọi vật rơi / bay / nhảy trong cảnh đọc cùng một g và cùng một cách tích phân — nghiệm ĐÚNG của v' = −g − drag·v trong 1 bước (không phải Euler):
        //  rơi cùng quỹ đạo ở 20, 60 hay 144 khung/giây, và khớp launchV / hopLift (ném T giây thì đúng T giây tới đích).
        //  cá nướng ném vào lò, lõi táo gấu mèo vứt, táo rụng, giọt nước vòi sen, giọt lăn khỏi lá sen, giọt bắn khi câu, vụn cỏ máy cắt, đất gà bới, thỏ rơi khỏi mép.
        //  Đơn vị: đv thế giới coi như mét (như các chỗ cũ đã dùng 9,8 / 9,81 trực tiếp).
        const GRAV = 9.81;
        function fallStep(p, v, h, drag = 0, g = GRAV) {   // 1 bước rơi h giây · drag (1/s): cản không khí tuyến tính, lá nhẹ ~2,6 ⇒ vận tốc rơi tới hạn g / drag
          if (drag > 1e-6) { const e = Math.exp(-drag * h), a = (1 - e) / drag, vt = g / drag;
            p.x += v.x * a; p.z += v.z * a; p.y += (v.y + vt) * a - vt * h; v.x *= e; v.z *= e; v.y = (v.y + vt) * e - vt;
          } else { p.x += v.x * h; p.z += v.z * h; p.y += (v.y - 0.5 * g * h) * h; v.y -= g * h; }
          return p;
        }
        // ====== VẬT RỜI: rơi → nảy → lăn → nằm yên (hoặc nổi trên nước) ======
        //  B = looseBody(r, { e độ nảy · mu ma sát lúc chạm · rr cản lăn (× g) · rough độ gồ ghề (0 = nảy thẳng) · mask lớp va chạm }) — p tâm, v vận tốc, w vận tốc góc (rad/s), q hướng.
        //  looseTick(B, dt, obj): chạy bước cố định 120 Hz (fixedSteps) rồi đặt obj ở trạng thái nội suy ⇒ cùng kết quả ở mọi tốc độ khung.
        //  Sàn = đất (cowY) hoặc đỉnh khoảng đặc ngay dưới điểm đó (colRestY, đúng ô con 3 cm) · vách = mặt cao hơn đáy vật quá LOOSE_UP hoặc khoảng đặc ngang thân vật
        //  (gỡ theo từng trục: trượt dọc vách, dội lại theo e) · dốc: chênh đỉnh 2 cột kề (bỏ mép bàn / vực > 0,15 m) ⇒ lăn xuống với 5/7·g·dốc (quả cầu đặc lăn không trượt).
        const LOOSE_UP = 0.03, LOOSE_VB = 0.35, LOOSE_EDGE = 0.15;   // bậc lăn qua được · dưới vận tốc chạm này thì không nảy nữa (m/s) · chênh lớn hơn = mép, không tính là dốc
        function looseBody(r, o) {
          return Object.assign({ p: new THREE.Vector3(), v: new THREE.Vector3(), w: new THREE.Vector3(), q: new THREE.Quaternion(), p0: new THREE.Vector3(), q0: new THREE.Quaternion(),
            r, e: 0.3, mu: 0.5, rr: 0.12, mask: 7, air: true, rest: false, wet: false, hits: 0, age: 0, still: 0, acc: 0 }, o);
        }
        function looseBlocked(B, x, z, lo) {   // đứng ở (x, z) với đáy không thấp hơn lo: có vách (đất / khoảng đặc) chắn không
          const f = colRestY(x, z, lo, LOOSE_UP, B.mask); if (f > lo + LOOSE_UP + 1e-6) return true;
          const b = Math.max(lo, f); return COL.ready && (colSub(B.mask, x, z, b + LOOSE_UP, b + 2 * B.r) & colBit(x, z)) !== 0;
        }
        let _lsX = 0, _lsZ = 0;
        function looseSlope(B, x, z, f) {   // dốc của mặt đang nằm → _lsX, _lsZ (chênh cao / mét)
          const d = COL.C * 0.5, E = LOOSE_EDGE, lo = f + E;
          let a = colRestY(x + d, z, lo, 0, B.mask) - f, b = colRestY(x - d, z, lo, 0, B.mask) - f; if (a > E || a < -E) a = 0; if (b > E || b < -E) b = 0; _lsX = (a - b) / (2 * d);
          a = colRestY(x, z + d, lo, 0, B.mask) - f; b = colRestY(x, z - d, lo, 0, B.mask) - f; if (a > E || a < -E) a = 0; if (b > E || b < -E) b = 0; _lsZ = (a - b) / (2 * d);
        }
        const _lsQ = new THREE.Quaternion(), _lsA = new THREE.Vector3();
        function looseStep(B, h) {   // 1 bước vật lý h giây (gọi qua looseTick)
          if (B.rest) return;
          const p = B.p, v = B.v, w = B.w, r = B.r, x0 = p.x, z0 = p.z, b0 = p.y - r; B.age += h;
          if (B.wet) {   // nổi: chìm 6/10 thân, nhấp nhô theo sóng, trôi chậm dần, không lên bờ
            const k = Math.exp(-3 * h); v.x *= k; v.z *= k; w.multiplyScalar(k); p.x += v.x * h; p.z += v.z * h;
            if (!isWater(Math.round(x2gi(p.x)), Math.round(z2gj(p.z)))) { p.x = x0; p.z = z0; v.x *= -0.3; v.z *= -0.3; }
            v.y += ((waterSurfaceY(p.x, p.z) - 0.2 * r - p.y) * 60 - v.y * 6) * h; p.y += v.y * h;
          } else {
            if (B.air) { fallStep(p, v, h);   // trần: đang đi lên mà đỉnh thân chạm đáy 1 khoảng đặc ngay trên đầu thì dội xuống
              if (v.y > 0 && COL.ready && (colSub(B.mask, x0, z0, b0 + 2 * r, p.y + r) & colBit(x0, z0))) { p.y = b0 + r; v.y *= -B.e; }
            }
            else {   // đang nằm trên mặt: dốc đẩy, cản lăn hãm; hết đà trên chỗ đủ phẳng thì nằm yên
              looseSlope(B, x0, z0, b0); const K = 5 / 7 * GRAV; v.x -= K * _lsX * h; v.z -= K * _lsZ * h;
              const s = Math.hypot(v.x, v.z), dec = B.rr * GRAV * h;
              if (s <= dec || B.age > 12) { v.set(0, 0, 0); w.set(0, 0, 0); B.rest = true; return; }
              const k = 1 - dec / s; v.x *= k; v.z *= k; p.x += v.x * h; p.z += v.z * h;
            }
            const lo = Math.max(b0, p.y - r);
            if ((p.x !== x0 || p.z !== z0) && looseBlocked(B, p.x, p.z, lo)) {   // vách: thử giữ từng trục
              if (!looseBlocked(B, p.x, z0, lo)) { p.z = z0; v.z *= -B.e; } else if (!looseBlocked(B, x0, p.z, lo)) { p.x = x0; v.x *= -B.e; } else { p.x = x0; p.z = z0; v.x *= -B.e; v.z *= -B.e; }
            }
            const f = colRestY(p.x, p.z, lo, LOOSE_UP, B.mask), wy = isWater(Math.round(x2gi(p.x)), Math.round(z2gj(p.z))) ? waterSurfaceY(p.x, p.z) : -1e9;
            if (p.y - r < wy && f < wy) {   // rơi xuống nước: toé + vòng sóng, rồi nổi
              waterFx.ring(p.x, wy, p.z, Math.min(0.35, r * (2 + Math.min(4, Math.abs(v.y)))));
              B.wet = true; B.air = false; v.x *= 0.5; v.z *= 0.5; v.y *= 0.15;
            } else if (!B.air) {   // đang lăn: bám mặt (bậc ≤ LOOSE_UP), hụt chân thì rơi · quay theo quãng thật sự đi được · kẹt sát vách 1/4 giây thì nằm yên
              if (f < b0 - LOOSE_UP) B.air = true; else p.y = f + r;
              const dx = p.x - x0, dz = p.z - z0; w.set(dz / (h * r), 0, -dx / (h * r));
              if (dx * dx + dz * dz < 1e-10) { if (++B.still > 30) { v.set(0, 0, 0); w.set(0, 0, 0); B.rest = true; } } else B.still = 0;
            } else if (p.y - r <= f) {   // chạm mặt
              p.y = f + r; const vn = -v.y;
              if (vn > LOOSE_VB) {   // nảy: mất năng lượng theo e, ma sát bẻ vận tốc ngang (tối đa tới mức lăn không trượt: 2/7)
                v.y = vn * B.e; B.hits++; const vt = Math.hypot(v.x, v.z);
                if (vt > 1e-6) { const k = 1 - Math.min(B.mu * (1 + B.e) * vn, vt * 2 / 7) / vt; v.x *= k; v.z *= k; }
                if (B.rough) {   // mặt đất gồ ghề / vật không tròn đều: cú nảy lệch ngang 1 phần xung lượng, hướng lấy từ chỗ chạm (không ngẫu nhiên: cùng chỗ rơi ⇒ cùng đường nảy)
                  let hh = Math.sin(p.x * 127.1 + p.z * 311.7 + B.hits * 74.7) * 43758.5453; hh -= Math.floor(hh); let h2 = hh * 7.13; h2 -= Math.floor(h2);
                  const an = hh * 2 * Math.PI, k = (1 + B.e) * vn * B.rough * (0.4 + 0.6 * h2); v.x += Math.cos(an) * k; v.z += Math.sin(an) * k;
                }
                w.set(v.z / r, w.y * 0.5, -v.x / r);
              } else { v.y = 0; B.air = false; }
            }
          }
          const wl = w.length(); if (wl > 1e-4) B.q.premultiply(_lsQ.setFromAxisAngle(_lsA.copy(w).multiplyScalar(1 / wl), wl * h)).normalize();
          if (!Number.isFinite(p.x + p.y + p.z + v.x + v.y + v.z)) { p.copy(B.p0); v.set(0, 0, 0); w.set(0, 0, 0); B.rest = true; }   // số hỏng: nằm lại chỗ cũ
        }
        let _looseB = null;
        const _looseSub = h => { const B = _looseB; B.p0.copy(B.p); B.q0.copy(B.q); looseStep(B, h); };
        function looseTick(B, dt, obj) {   // gọi mỗi khung: bước 120 Hz + đặt obj (nội suy giữa 2 bước gần nhất) · trả true khi đã nằm yên
          if (!B.rest) { _looseB = B; const a = fixedSteps(B, dt, PHYS_H, _looseSub); if (obj && !B.rest) { obj.position.lerpVectors(B.p0, B.p, a); obj.quaternion.slerpQuaternions(B.q0, B.q, a); } }
          if (B.rest && obj) { obj.position.copy(B.p); obj.quaternion.copy(B.q); }
          return B.rest;
        }
        function launchV(from, to, T, out, g = GRAV) {   // vận tốc ném từ `from` để sau T giây rơi đúng `to` (ném xiên)
          return out.set((to.x - from.x) / T, (to.y - from.y) / T + 0.5 * g * T, (to.z - from.z) / T);
        }
        // cung nhảy đạn đạo: pha u 0 → 1 của 1 cú nhảy bay T giây ⇒ độ cao trên đất = ½·g·T²·u(1−u) (đỉnh g·T²/8 giữa cú) — rời đất và chạm đất với vận tốc dọc ±g·T/2
        const hopLift = (u, T, g = GRAV) => 0.5 * g * T * T * Math.max(0, u * (1 - u));
        const HOP_GO = 0.818;   // tốc độ ngang khi bay (đạn đạo: không đổi trong cú nhảy) — bằng trung bình hệ số cũ 0,5 + ½·sin(πu) ⇒ quãng nhảy giữ nguyên
