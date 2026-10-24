        // ===== BẢNG VIỆC DÙNG DỤNG CỤ (G 24/10 "sắp xếp lại files hành vi, để dễ chỉnh sửa") — mỗi việc 1 dòng, khoá = pha của kỹ sư (e.phase) =====
        //  run: chạy mỗi khung khi đang ở pha đó (bộ điều phối engineer/mind/loop-update.js) · tick: mỗi khung sau IK tay (đồ cầm theo bàn tay) · idle: pha khác ⇒
        //  việc bị cắt ngang (mưa, hết giờ, lệnh khác, vào giường): cất đồ về chỗ, về dáng đứng · clip: vẫn cầm bảng kẹp ghi chép (mặc định cất).
        //  Thêm việc mới: viết engineer/tasks/<việc>.js (update / idle / tick), thêm 1 dòng ở đây + 1 dòng ENG_ACTS và pha ở engPhaseFor (engineer/mind/schedule.js),
        //  khung giờ ở engineer/mind/hours.js. Các pha quanh ghế cắm trại (trú mưa, câu cá, ăn, trà, đọc, dạo, vuốt chó…): engineer/tasks/camp-routine.js. ----
        const ENG_JOBS = {
          apple: { run: (e, dt, t) => { if (applePick.update(e, dt, t)) { if (!engForceAct || (e.onceKey || '').startsWith('apples@')) engMarkDone(e); engForceAct = null; } },   // hái táo bằng sào rút: nhắm · luồn rổ · vặn bứt · bỏ giỏ · xách về (engineer/tasks/apple-pick.js); hái theo yêu cầu không đánh dấu xong việc 1-lần
            tick: (e, dt) => applePick.tick(e, dt) },   // sào, quả trong rổ / tay / giỏ theo bàn tay · quả trên cây đung đưa
          appleEat: { run: (e, dt, t) => applePick.eat(e, dt, t) },   // ăn 1 quả táo trong giỏ: lấy ở giỏ → ghế cắm trại → 5 miếng → ném lõi vào lò; xong thì lịch tự sang việc kế
          stars: { run: (e, dt, t) => { if (skyWatch.update(e, dt, t) && engForceAct === 'stars') engForceAct = null; },   // ngắm sao (lịch 20:42 / Kính thiên văn ở bảng Tools, chỉ sau 19:00): lấy thảm + kính · lắp · nằm ngửa · cuộn thảm cất (engineer/tasks/sky-watch.js)
            tick: (e, dt, t) => skyWatch.tick(e, dt, t), idle: e => skyWatch.idle(e) },   // cuộn thảm xách tay, kính, màn · bị cắt ngang: thảm + kính về góc bạt
          garden: { run: (e, dt, t) => { if (gardenJob.update(e, dt, t)) { autoDone('garden'); if (engForceAct === 'garden') engForceAct = null; } },   // luống cà rốt: trồng · tưới · xem thỏ ăn (engineer/tasks/carrot-garden.js)
            tick: (e, dt, t) => gardenJob.tick(e, dt, t), idle: () => gardenJob.idle() },   // bay xới, bình tưới, giọt nước
          wood: { run: (e, dt, t) => { if (woodJob.update(e, dt, t)) engForceAct = null; }, tick: e => woodJob.tick(e), idle: () => woodJob.idle() },
          fire: { run: (e, dt, t) => fireJob.update(e, dt, t), tick: (e, dt, t) => fireJob.tick(e, dt, t), idle: () => fireJob.idle() },   // lửa trại theo nhiệt độ: xô nước + que cời dập · que mồi + diêm nhóm (engineer/tasks/campfire-keep.js)   // ôm củi bỏ vào lò chiminea (bảng Tools / bấm lò — engineer/tasks/tool-jobs.js)
          drone: { run: (e, dt, t) => { if (droneToy.update(e, dt, t)) { if (!engForceAct || (e.onceKey || '').startsWith('drone@')) engMarkDone(e); engForceAct = null; } },   // bay drone khảo sát: lấy trên bàn trà · cất cánh · bay · hạ · cất (engineer/tasks/drone.js); bay theo yêu cầu ngoài giờ không đánh dấu xong việc 1-lần
            idle: () => { if (droneToy.state.st !== 'idle') droneToy.abort(); } },   // đổi việc giữa chừng (mưa, giờ): cất drone về bàn
          explore: { run: (e, dt, t) => { if (exploreJob.update(e, dt, t)) autoDone('explore'); }, idle: () => exploreJob.reset(), clip: true },   // đi dạo khám phá: ghé 2 công trình / cây, đứng ngắm, ghi chép (engineer/tasks/explore.js)
          engine: { run: (e, dt, t) => { if (engineJob.update(e, dt, t)) engForceAct = null; }, idle: () => engineJob.idle() },   // kiểm tra động cơ: mở ca-pô · xem máy · nổ máy 30 s · đóng (engineer/tasks/engine-check.js); bị cắt ngang: tắt máy, đóng ca-pô
          trim: { run: (e, dt, t) => { if (trimJob.update(e, dt, t)) engForceAct = null; }, idle: () => trimJob.idle() },   // phát cỏ quanh trại: giật nổ máy · đeo ba lô · lia lưỡi · cất (engineer/tasks/trim-grass.js); bị cắt ngang: máy về chỗ để
          rainwatch: { run: (e, dt, t) => { if (skyWatch.rain(e, dt, t)) { autoDone('rainwatch'); e.phase = e.act === 'rainwatch' || e.act === 'shelter' ? 'toShelter' : engPhaseFor(e.act); } } }   // ngắm mưa ở mép trước bạt: nhìn hồ, mép bạt nhỏ giọt, hứng mưa, khoanh tay (engineer/tasks/sky-watch.js)
        };
