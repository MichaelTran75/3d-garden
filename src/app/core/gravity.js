        // ====== TRỌNG LỰC DÙNG CHUNG ======
        //  Mọi vật rơi / bay / nhảy trong cảnh đọc cùng một g và cùng một cách tích phân (Euler nửa ẩn: đổi vận tốc trước rồi mới dời chỗ — ổn định ở bước lớn):
        //  cá nướng ném vào lò, lõi táo gấu mèo vứt, giọt nước vòi sen, giọt lăn khỏi lá sen, giọt bắn khi câu, vụn cỏ máy cắt, kỹ sư bước xuống bậc, thỏ nhảy.
        //  Đơn vị: đv thế giới coi như mét (như các chỗ cũ đã dùng 9,8 / 9,81 trực tiếp).
        const GRAV = 9.81;
        function fallStep(p, v, h, drag = 0, g = GRAV) {   // 1 bước rơi tự do: v += g·h (cản không khí drag/s, lá nhẹ ~2,6), p += v·h
          if (drag) { const k = Math.exp(-drag * h); v.x *= k; v.z *= k; v.y = v.y * k - g * h; } else v.y -= g * h;
          p.x += v.x * h; p.y += v.y * h; p.z += v.z * h; return p;
        }
        function fallLand(p, v, floorY, bounce = 0, fric = 0.6) {   // chạm mặt floorY: nảy lại (hệ số bounce) hoặc nằm yên · trả true khi đã nằm yên
          if (p.y > floorY) return false;
          p.y = floorY;
          if (bounce > 0 && v.y < -0.6) { v.y = -v.y * bounce; v.x *= fric; v.z *= fric; return false; }
          v.set(0, 0, 0); return true;
        }
        function launchV(from, to, T, out, g = GRAV) {   // vận tốc ném từ `from` để sau T giây rơi đúng `to` (ném xiên)
          return out.set((to.x - from.x) / T, (to.y - from.y) / T + 0.5 * g * T, (to.z - from.z) / T);
        }
        // cung nhảy đạn đạo: pha u 0 → 1 của 1 cú nhảy bay T giây ⇒ độ cao trên đất = ½·g·T²·u(1−u) (đỉnh g·T²/8 giữa cú) — rời đất và chạm đất với vận tốc dọc ±g·T/2
        const hopLift = (u, T, g = GRAV) => 0.5 * g * T * T * Math.max(0, u * (1 - u));
        const HOP_GO = 0.818;   // tốc độ ngang khi bay (đạn đạo: không đổi trong cú nhảy) — bằng trung bình hệ số cũ 0,5 + ½·sin(πu) ⇒ quãng nhảy giữ nguyên
