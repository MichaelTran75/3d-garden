        // ====== VẬT LÝ BƯỚC CỐ ĐỊNH ("Fix Your Timestep", Gaffer on Games) — xem src/ARCHITECTURE.md mục "Vật lý" ======
        //  Mô phỏng có lực (cần câu uốn, phao + mồi, cá giằng co, đuôi chó, tai thỏ) chạy từng bước ĐỀU h, không theo nhịp khung hình:
        //  thời gian thật của khung dồn vào bình tích luỹ S.acc, đủ h thì chạy 1 bước; phần dư (alpha = dư / h) dùng để VẼ NỘI SUY
        //  giữa trạng thái bước trước và bước mới ⇒ máy 30 hình/giây hay màn 144 Hz cho cùng một chuyển động, khung giật không làm nổ,
        //  không bao giờ có bước dt = 0. Trần 0,1 s mỗi khung: máy quá chậm thì cảnh chậm lại thay vì rơi vào vòng xoáy tính bù.
        const PHYS_HZ = 120, PHYS_H = 1 / PHYS_HZ;
        function fixedSteps(S, dt, h, step) {   // S: { acc } riêng của từng hệ · step(h, i) gọi cho mỗi bước · trả alpha 0..1 để nội suy khi vẽ
          S.acc = Math.min((S.acc || 0) + (dt > 0 ? dt : 0), 0.1);
          let i = 0;
          while (S.acc >= h) { S.acc -= h; step(h, i++); }
          return S.acc / h;
        }
