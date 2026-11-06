        // ==== MẶT CÔNG KHAI CỦA KỸ SƯ (core/world.js · G 01/11 "mọi tương tác là độc lập"): đơn vị khác chỉ đọc qua worldSee('engineer'), không đụng
        //      engObj hay biến riêng của kỹ sư. Getter đọc lúc chạy nên dùng được tên khai báo ở tệp sau (RX, skyWatch, trimJob, CAMP_SEAT…) ----
        let engPetting = false;   // tay đang vuốt lưng / xoa đầu chó (dời từ animals/dog/shelter.js 01/11)
        worldFace('engineer', {
          get pos() { return engObj.g.position; },                     // gốc thân (Vector3 sống — đọc, không ghi)
          get yaw() { return engObj.g.rotation.y; },                   // hướng mặt
          get head() { return engObj.head; },                          // đầu (Object3D): nhìn theo
          get object() { return engObj.g; },                           // cả thân (Object3D): chọn, ẩn hiện
          get inVan() { return engObj.inVan; },                        // đang trong xe
          get inScene() { return engObj.g.parent === scene; },         // đang đứng trong cảnh
          get out() { return !engObj.inVan && engObj.g.parent === scene; },   // ngoài trời — ai cũng thấy
          get walking() { return engObj.walking; },
          get vel() { return engObj.vel; },                            // tốc độ đi (m/s)
          get phase() { return engObj.phase; },                        // việc đang làm: toDog, pet, eat, eatFish, stars, van, …
          get seat() { return engObj.seat; },                          // ghế đang dùng { st: go | seated | leave | stood, C } | null
          chairs: () => [CAMP_SEAT, FISH_SEAT].map(C => ({ pos: C.pos, yaw: C.yaw })),   // ghế của mình: cắm trại, câu cá
          get petting() { return engPetting; },                        // tay đang vuốt / xoa chó
          get callPat() { return RX.patCall; },                        // gọi chó lại xoa đầu: chỗ chó ngồi { x, z } | null (engineer/mind/reactions.js)
          get withDog() { return engPetting || !!RX.patCall || engObj.phase === 'toDog' || engObj.phase === 'pet'; },   // đang chơi với chó: người – chó không đẩy nhau
          get trimming() { return trimJob.busy(); },                   // đang trong việc phát cỏ
          get engineCheck() { return engineJob.busy(); },              // đang trong việc kiểm tra động cơ (ca-pô, chìa, hình nổi thuộc việc này — người khác đừng bấm)
          get helmetPaint() { return engHelm; },                       // vật liệu vỏ mũ bảo hộ — mũ rời trong xe sơn cùng màu
          size: { base: ENGINEER_BASE_SCALE, slim: ENG_SLIM },         // cỡ người: tỉ lệ thân · bề ngang gầy — đồ của mình đặt rời (mũ trên kệ, cần dưới đất, chỗ nằm) theo cỡ này
          get outside() { return rxOutside(engObj); },                 // ở ngoài bãi (không trong xe, không đang vào / ra xe)
          get handOffer() { return ENV.bf; },                          // mời bướm đậu tay: { bf: con được mời, dur: cho đậu bao lâu (s), st } | null (engineer/mind/env-react.js)
          get handOut() { const G = RX.gest; return !!G && G.k === 'finger' && !!engObj.handW && rxOutside(engObj); },   // tay mời đang chìa ra
          get palmReady() { const G = RX.gest; return !!G && G.k === 'finger' && G.w > 0.95; },   // đã chìa hẳn ra — bướm đáp được
          palm: out => { const w = engObj.wrists[0]; w.updateWorldMatrix(true, false); return w.localToWorld(out.set(0, 0.02, 0.055)); },   // giữa lòng bàn tay chữ C (+z cổ tay), nhỉnh lên
          starInvite: () => skyWatch.dogWant(),                        // nằm ngắm sao, mời chó ra nằm cạnh
          starSpot: () => skyWatch.dogSpot(),                          // chỗ chó nằm sát thảm { x, z, yaw }
          get anglingOn() { return angling.active; },                  // đang ngồi câu (engineer/tasks/angling.js)
          get hookFish() { return angling.fish; },                     // con cá đang tới mồi / trên lưỡi (null: không có)
          get hook() { return anglerHook; },                           // lưỡi câu { n, fish, mouth, heading, vertical, t, struggle }: n tăng mỗi lần nêu — con cá tự đặt thân theo
          get released() { return anglerRelease; },                    // lần thả cá gần nhất { n, fish, start, dir, heading } — con cá tự bơi đi
          get pointDir() { const P = skyWatch.state.pt; return P && P.dir ? P.dir : null; },   // đang chỉ sao băng: hướng tay chỉ
          // ---- BẢNG CỦA NGƯỜI XEM (01/11 đợt 10 — ui/sim-needs.js, ui/tools-panel.js, ui/xray-lifecycle.js, ui/hover-select.js đọc qua ENGINEER = worldLazy('engineer')):
          //      đọc nhu cầu + việc nhận làm, giao việc; đồ của mình bấm được ----
          get needs() { return ENG_NEEDS; },                           // nhu cầu kiểu Sims 4: mức, cảm xúc, kỹ năng… (engineer/mind/needs.js)
          offer: k => ENG_OFFERS[k],                                   // việc nhận làm: plan() · why() ('' = làm được) · call() (engineer/mind/offers.js)
          get asked() { return engForceAct; },                         // việc người xem đang giao | null (theo lịch / tự chủ)
          ask: k => { if (k === 'udon' || k === 'rice') { engMealPick = k; k = 'cook'; } else engMealPick = null; engForceAct = k; },   // giao việc: bỏ việc đang làm, làm việc đó, xong về lịch (engineer/mind/schedule.js) · 'udon' / 'rice' = nấu món đó
          askNeed: k => autoCommand(k),                                // bấm thanh nhu cầu: '' = đã giao, hoặc lý do chưa làm được (engineer/mind/autonomy.js)
          actLabel: k => ENG_ACTS[k].label,                            // tên việc (lịch / lệnh)
          get rod() { return engObj.rod; },                            // cần câu cầm tay
          get applePole() { return applePick.pole; }, get appleBasket() { return applePick.basket; },   // sào + giỏ hái táo
        });
