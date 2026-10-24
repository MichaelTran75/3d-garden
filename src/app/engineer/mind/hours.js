        // ===== GIỜ GIẤC CỦA KỸ SƯ (giờ Pleiku) — SỬA GIỜ Ở ĐÂY (G 24/10 "ngắm sao chỉ có thể làm sau 19:00 pm, sắp xếp lại files hành vi, để dễ chỉnh sửa") =====
        //  Lịch cả ngày (khung giờ → việc) là ENG_DAY ở engineer/mind/schedule.js. Bảng dưới là khung giờ ĐƯỢC PHÉP của từng việc: lịch, tự chủ theo nhu cầu
        //  (engineer/mind/autonomy.js), lệnh bảng Tools (ui/tools-panel.js) và bấm vật trong cảnh (ui/xray-lifecycle.js) đều hỏi engHourOk(việc, giờ).
        //  [từ, tới) theo giờ thập phân (19.5 = 19:30); tới < từ ⇒ qua nửa đêm. Đổi số ở đây là đổi cho mọi nơi.
        const ENG_WAKE_H = 6, ENG_SLEEP_H = 21.75;   // thức 06:00 · lên giường 21:45 (G 19/10 "cho engineer ngắm sao 1 tiếng buổi tối trước khi đi ngủ lúc 9:45")
        const ENG_HOURS = {
          stars: [19, ENG_SLEEP_H - 0.03],   // ngắm sao: chỉ sau 19:00 (G 24/10), cất trước giờ ngủ — còn cần mặt trời < −8°, không mưa, mây < 60% (engineer/tasks/sky-watch.js)
          fish: [6.5, 19.5],                 // câu cá: tự chủ + lệnh Tools
          garden: [6.8, 17.6],               // chăm luống cà rốt tự chủ (engineer/tasks/carrot-garden.js gardenWant)
          gardenCmd: [6.5, 18.3],            // trồng cà rốt theo lệnh Tools
          trim: [6.66, 17.33],               // cắt cỏ tự làm sau mưa (engineer/tasks/trim-grass.js trimWant)
          trimCmd: [6.5, 18.2],              // cắt cỏ theo lệnh (bấm máy cắt cỏ / Tools)
          dark: [18.7, 6.3]                  // "trời tối": tự chủ lấp vui / tò mò bằng nghe nhạc, đọc sách thay câu cá, dạo khám phá
        };
        const ENG_CMD_HOURS = { stars: 'stars', fish: 'fish', garden: 'gardenCmd', trim: 'trimCmd' };   // lệnh Tools / bấm vật → khung giờ phải hỏi trước khi bắt đầu (engineer/mind/schedule.js engWantAct0)
        const engHourOk = (k, hh) => { const [a, b] = ENG_HOURS[k]; return a <= b ? hh >= a && hh < b : hh >= a || hh < b; };
        const engAwake = hh => hh >= ENG_WAKE_H && hh < ENG_SLEEP_H;
        const engHM = h => Math.floor(h) + ':' + String(Math.round(h % 1 * 60)).padStart(2, '0');   // 19 → "19:00" (chữ trên bảng Tools)
