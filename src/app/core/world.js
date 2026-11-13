        // ==== THẾ GIỚI CHUNG ====
        //  Mỗi TÁC TỬ (kỹ sư, chó, thỏ, bò…) và mỗi VẬT (xe, trại, đồ câu…) là một đơn vị tự lo thân mình; đơn vị khác chỉ thấy MẶT CÔNG KHAI của nó ở đây.
        //   · worldFace('dog', { get pos() {…}, … }) — đơn vị tự đăng ký mặt 1 lần lúc dựng: getter đọc trạng thái THẬT của chính nó (vị trí, dáng, việc
        //     đang làm, ý định, chỗ cho bên khác đứng / ngồi / bám). Mặt luôn sống (không chép số), nên đọc lúc nào cũng là trạng thái hiện tại.
        //   · worldSee('dog') — đơn vị khác đọc mặt đó (null khi chưa đăng ký ⇒ tự lo lúc vắng mặt).
        //   · TƯƠNG TÁC = hai bên nhìn mặt nhau: bên mời nêu ý định trên mặt MÌNH (kỹ sư: callPat = chỗ gọi chó lại xoa đầu), bên kia tự quyết rồi nêu
        //     lại trên mặt nó (chó đang theo chân thì chạy tới ngồi: patReady) — mỗi bên chỉ cử động thân mình, bên nào cũng rút được bất cứ lúc nào.
        //  Không tệp nào đọc / ghi biến riêng của đơn vị khác: src/tools/boundaries/check.py kiểm lúc dựng (build.py --check). Bảng mặt công khai: docs/architecture/engine.md.
        const WORLD = new Map();
        function worldFace(name, face) { WORLD.set(name, face); return face; }
        function worldSee(name) { return WORLD.get(name) || null; }
        //   · worldLazy('van') — tay cầm đọc mặt LÚC DÙNG, khai báo được trước khi đơn vị kia đăng ký: VAN.object ≡ worldSee('van').object (vật luôn có mặt)
        function worldLazy(name) { return new Proxy({}, { get: (_, k) => { const f = WORLD.get(name); return f ? f[k] : undefined; },
          set: (_, k) => { throw new Error('mặt ' + name + ' chỉ để đọc (' + String(k) + '): đổi trạng thái của nó bằng chỗ chạm trên mặt'); } }); }
        //   · worldTell('navMarks') / worldHear('navMarks', fn) — TIN BÁO: đơn vị báo "vừa đổi mặt bằng chung" (thêm đồ chặn lối…), ai cần thì nghe rồi tự cập nhật
        //     phần của mình (lưới đường đi riêng…) ngay lúc đó; bên báo không biết ai nghe
        const WORLD_EARS = new Map();
        function worldHear(news, fn) { if (!WORLD_EARS.has(news)) WORLD_EARS.set(news, []); WORLD_EARS.get(news).push(fn); }
        function worldTell(news, ...a) { for (const fn of WORLD_EARS.get(news) || []) fn(...a); }   // tin kèm số liệu: worldTell('leafOnWater', lá, bán kính, xác suất)
        //   · worldTick('wild', 40, (dt, t) => …) — SỔ TICK: đơn vị tự ghi phần chạy MỖI KHUNG của mình vào một LƯỢT của vòng lặp; vòng lặp chỉ gọi
        //     worldRun('wild', dt, t) đúng chỗ của lượt, không biết trong lượt có ai (thêm / bỏ một con vật, đồ vật không phải sửa vòng lặp). Số thứ tự
        //     (10, 20…; chèn giữa thì 15) xếp các phần trong cùng lượt — giữ thứ tự cũ để dãy số ngẫu nhiên không đổi. Lượt theo thứ tự trong khung
        //     (loop/main-loop.js → lượt kỹ sư engineer/mind/loop-update.js → loop/main-loop-rest.js): beasts (thú lớn) · lamps (đèn theo đêm) ·
        //     things (đồ quanh trại + xe, ngay trước kỹ sư) · awake (TRONG lượt kỹ sư, sau khi chọn việc, chỉ khi kỹ sư thức: cá nướng) · late (ngay sau kỹ sư) · insects (x = trời cho côn trùng ra) · glow (sáng ban đêm) ·
        //     wild (chim, thú nhỏ quanh trại) · pointer (ô toạ độ dưới con trỏ) · tools (đồ chơi, máy móc) · ground (dấu chân, gà, chuồng) · viewer (bảng người xem,
        //     ngay trước khi vẽ: thanh nét viền, viền rê chuột, khung chọn, camera bám vật, nhãn theo con vật) · sound · afterRender (sau khi vẽ: % zoom, bảng
        //     Tools, nhu cầu kỹ sư, động cơ).
        //     Ai đang ở lượt nào: grep "worldTick('wild'"
        //   · worldJoin('collide', 30, C => …) — XIN VÀO DỊCH VỤ HẠ TẦNG: đơn vị tự khai phần của mình với lớp va chạm ('collide': thân, lưới thân, thân động),
        //     nhóm ngày / đêm ('dayNight'), gộp lượt vẽ ('drawBatch'), lưới dẫn đường ('flowField'), lưới bay côn trùng ('flight'), rê chuột chọn
        //     ('hover': viền trắng + bấm — xe, máy cắt cỏ, radio, chòm sao), bóng vật nhỏ khi zoom gần ('smallShadow': dương xỉ, nấm); dịch vụ dựng tới chỗ cũ
        //     thì worldServe('collide', C) gọi lần lượt theo số thứ tự (giữ thứ tự cũ: số ngẫu nhiên, thứ tự con trong nhóm), đưa bộ công cụ C của nó —
        //     dịch vụ không biết danh sách con vật. Xin sau khi dịch vụ đã dựng ⇒ chạy ngay.
        const WORLD_TICKS = new Map(), WORLD_JOINS = new Map(), WORLD_SERVED = new Map();
        function worldHook(M, key, at, fn) { const L = M.get(key) || []; L.push({ at, fn }); L.sort((a, b) => a.at - b.at); M.set(key, L); }
        function worldTick(slot, at, fn) { worldHook(WORLD_TICKS, slot, at, fn); }
        function worldRun(slot, dt, t, x) {   // 1 phần hỏng không làm đứng cả khung (các phần sau + lượt vẽ vẫn chạy): lỗi báo 1 lần / phần, ném lại ngoài vòng lặp để console và đầu dò vẫn thấy
          const L = WORLD_TICKS.get(slot); if (!L) return;
          for (let i = 0; i < L.length; i++) { const k = L[i]; try { k.fn(dt, t, x); } catch (err) { if (!k.bad) queueMicrotask(() => { throw err; }); k.bad = (k.bad || 0) + 1; } }
        }
        function worldJoin(service, at, fn) { if (WORLD_SERVED.has(service)) fn(WORLD_SERVED.get(service)); else worldHook(WORLD_JOINS, service, at, fn); }
        function worldServe(service, api) { WORLD_SERVED.set(service, api); for (const s of WORLD_JOINS.get(service) || []) s.fn(api); }
        //   · worldPlace('chiminea', { face, tick, join, hover, job }) — MỘT CHỖ KHAI BÁO cho mỗi vật: vật tự nói trong tệp của nó mình có mặt gì (face → worldFace), chạy mỗi khung ở lượt nào (tick: [[lượt, thứ tự, fn]] → worldTick),
        //     xin dịch vụ nào (join: [[dịch vụ, thứ tự, fn]] → worldJoin), rê chuột ra sao (hover: { root, …tuỳ chọn của bộ chọn } → dịch vụ 'hover',
        //     ui/hover-select.js), bấm vào thì mời kỹ sư làm việc gì (job: { objs | box, title, act | choices, msg, go, vis, van, pick } → dịch vụ 'jobs',
        //     ui/xray-lifecycle.js). Kiểu The Sims: vật nêu việc, kỹ sư tự quyết có làm được không (ENGINEER.offer). Thêm vật mới = viết trong tệp của vật,
        //     không sửa giao diện, vòng lặp. Danh sách vật đã khai: WORLD_PLACES (gỡ lỗi: __ev('[...WORLD_PLACES.keys()]'))
        const WORLD_PLACES = new Map();
        function worldPlace(name, P) {
          if (P.face) worldFace(name, P.face);
          for (const [slot, at, fn] of P.tick || []) worldTick(slot, at, fn);
          for (const [service, at, fn] of P.join || []) worldJoin(service, at, fn);
          if (P.hover) worldJoin('hover', P.hover.at ?? 100, H => H.add(P.hover.root, P.hover));
          if (P.job) worldJoin('jobs', P.job.at ?? 100, J => J.add(P.job));
          WORLD_PLACES.set(name, P); return P.face;
        }
        const VAN = worldLazy('van');   // xe: van/face.js
        const ENGINEER = worldLazy('engineer'), DRONE = worldLazy('drone');   // kỹ sư + drone của kỹ sư (engineer/face.js, engineer/tasks/drone.js) — bảng của người xem (ui/) đọc + giao việc qua đây; tác tử khác vẫn worldSee('engineer')?.… (tự lo lúc vắng)
        const CAMP = worldLazy('camp'), CHIMINEA = worldLazy('chiminea'), TRIMMER = worldLazy('trimmer'), COOP = worldLazy('coop');   // trại: camp/chairs-lantern-fire.js, chiminea.js, trimmer.js, chicken-coop.js
        // ĐỒ ĐẠC TRÊN MẶT ĐẤT (trước là ENG_PROPS của kỹ sư): vòng {x, z, r} quanh ghế, xô, giá ba chân, bình tưới, luống… — đơn vị nào đặt đồ thì tự thêm vòng,
        //  ai đi lại (kỹ sư, chó, bò, gà, chim sẻ) cũng vòng tránh
        const PROPS = [];
        // ĐỒ CHỈ CHẶN LỐI ĐI (trước là ENG_NAV.extra của kỹ sư): vòng {x, z, r, nav: true} không đẩy người nhưng đừng giẫm qua (máy cắt cỏ đang cất: ba lô dưới
        //  đất + cần chĩa ngang gối) — ai có lưới đường đi riêng (kỹ sư: engineer/body/pose-ik-walk.js) cộng vào ô cấm; thêm sau khi lưới đã dựng thì worldTell('navMarks')
        const NAV_MARKS = [];
        // ---- LƯỚI MÔI TRƯỜNG cho thú nhỏ: ô 0,25 m, 1 = bị chắn (vật cản đã đăng ký: thân cây, cột, nhà, đồ trại; nước) —
        //      dựng 1 lần ở lần hỏi đầu (lúc đó mọi vật cản đã đăng ký); hỏi = tra bảng (dời từ animals/cows/herd-hut.js 01/11: chó, chim sẻ cùng hỏi) ----
        let envG = null;
        function envFree(x, z) {
          if (!envG || envG.n !== obstacleCoords.length + PROPS.length) {   // vật cản đăng ký thêm sau lần dựng trước → dựng lại
            const C = 0.25, x0 = wx(-MX) - BLOCK / 2, z0 = wz(-MZ) - BLOCK / 2, nx = Math.ceil((GX + 2 * MX) * BLOCK / C), nz = Math.ceil((GZ + 2 * MZ) * BLOCK / C), a = new Uint8Array(nx * nz);
            const disc = (x, z, r) => { const i0 = Math.max(0, Math.floor((x - r - x0) / C)), i1 = Math.min(nx - 1, Math.floor((x + r - x0) / C)), j0 = Math.max(0, Math.floor((z - r - z0) / C)), j1 = Math.min(nz - 1, Math.floor((z + r - z0) / C));
              for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const cx = x0 + (i + 0.5) * C - x, cz = z0 + (j + 0.5) * C - z; if (cx * cx + cz * cz <= r * r) a[i * nz + j] = 1; } };
            for (const o of obstacleCoords) disc(o.x, o.z, o.r);
            for (const o of PROPS) disc(o.x, o.z, o.r);
            for (let gi = -MX; gi < GX + MX; gi++) for (let gj = -MZ; gj < GZ + MZ; gj++) if (isWater(gi, gj)) disc(wx(gi), wz(gj), BLOCK * 0.71);
            envG = { a, C, x0, z0, nx, nz, n: obstacleCoords.length + PROPS.length };
          }
          const G = envG, i = Math.floor((x - G.x0) / G.C), j = Math.floor((z - G.z0) / G.C);
          return i >= 0 && j >= 0 && i < G.nx && j < G.nz && !G.a[i * G.nz + j];
        }
