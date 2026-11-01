        // ==== VIỆC NHẬN LÀM THEO LỆNH NGƯỜI XEM (01/11 đợt 10, dời nguyên văn từ ui/tools-panel.js + ui/xray-lifecycle.js — G "mọi tương tác là độc lập"):
        //      mỗi việc bảng Tools / bấm dụng cụ trong cảnh giao được tự nói plan() sẽ làm gì · why() vì sao chưa làm được ('' = làm được) · call() lời mời
        //      trên bảng dụng cụ (thiếu ⇒ plan). Bảng chỉ hỏi qua mặt ENGINEER.offer(k), giao bằng ENGINEER.ask(k) — không đọc biến riêng của kỹ sư.
        //      Thêm việc mới: 1 dòng ở đây + 1 dòng ở bảng (icon, tên, nút) ====
        const offerBusy = () => !engAwake(liveWeather.localHour) ? 'Engineer đang ngủ (21:45 – 6:00).' : liveWeather.localHour > ENG_SLEEP_H - 0.1 ? 'Sắp tới giờ ngủ (21:45).'
          : engForceAct === 'drone' || droneToy.state.st !== 'idle' ? 'Engineer đang bay drone.' : engForceAct === 'apples' || applePick.busy ? 'Engineer đang hái táo.' : applePick.eating ? 'Engineer đang ăn táo.'
          : engForceAct === 'engine' || engineJob.busy() ? 'Engineer đang kiểm tra máy.' : engForceAct === 'trim' || trimJob.busy() ? 'Engineer đang cắt cỏ.'
          : engForceAct ? 'Engineer đang ' + ENG_ACTS[engForceAct].label.toLowerCase() + '.' : '';   // đang ngủ / sắp ngủ / đang làm việc vừa giao (ngắm sao, câu cá, chăm luống, ngồi ghế, bỏ củi…)
        const ENG_OFFERS = {
          stars: { plan: () => 'Lấy thảm + kính trong xe ra bãi cỏ, dựng kính, nằm ngắm sao (≤ 1 tiếng, sắp tới giờ ngủ thì cất).',
            why: () => { const hh = liveWeather.localHour; return offerBusy() || (skyWatch.busy() ? 'Engineer đang ngắm sao.' : liveWeather.state.raining ? 'Đang mưa, không thấy sao.'
              : !engHourOk('stars', hh) ? 'Ngắm sao chỉ sau ' + engHM(ENG_HOURS.stars[0]) + '.' : sunElevSin > -0.139 ? 'Trời chưa tối hẳn, chưa thấy sao.' : !skyWatch.ok(hh) ? 'Trời nhiều mây, không thấy sao.' : ''); } },
          fish: { plan: () => 'Ra ghế câu bên hồ, quăng cần câu 15 phút.',
            why: () => { const hh = liveWeather.localHour, p = engObj.phase; return offerBusy() || (p === 'fish' || p === 'toFish' ? 'Engineer đang câu cá.' : liveWeather.state.raining ? 'Đang mưa, đợi tạnh rồi câu.' : !engHourOk('fish', hh) ? 'Trời tối, để mai câu.' : ''); } },
          smoke: { plan: () => { const O = CHIMINEA.oven; return CAMP.grill.st === 'held' ? 'Về ghế ăn cá đang cầm.' : O.fish.ready() >= 0 ? 'Mở lò nướng lấy cá đã chín khói, ra ghế dưới bạt ăn.'
              : O.fish.n() ? 'Cá trong lò đang hun: ngồi ghế uống trà chờ chín (lửa sắp tàn thì thêm củi), rồi lấy ra ăn.' : CAMP.grill.st === 'ready' || CAMP.grill.st === 'cooking' ? 'Rút que cá cạnh bếp lửa, cho cá vào vỉ lò nướng, chất củi, ngồi chờ cá chín khói (~25 phút) rồi lấy ra ăn.'
              : 'Ra hồ câu 1 con cá, cho vào vỉ lò nướng, chất củi, ngồi chờ cá chín khói (~25 phút) rồi lấy ra ăn.'; },
            why: () => { const O = CHIMINEA.oven, hh = liveWeather.localHour, need = smokeNeedFish(); return offerBusy() || (need && liveWeather.state.raining ? 'Đang mưa, đợi tạnh rồi ra câu cá.'
              : need && !engHourOk('fish', hh) ? 'Trời tối, hết giờ câu cá — để mai nướng.' : O.fish.free() < 0 && O.fish.ready() < 0 ? 'Vỉ lò đầy cá đang hun, chờ chín đã.' : ''); } },
          apples: { plan: () => 'Gọi Engineer ra gốc cây hái ' + applePick.avail() + ' quả táo bằng sào' + (applePick.state && applePick.state.basketAt === 'table' ? ' (lấy giỏ ở bàn trà mang ra trước).' : '.'),
            why: () => offerBusy() || (liveWeather.state.raining ? 'Đang mưa, đợi tạnh rồi hái.' : applePick.left() || applePick.eating ? 'Giỏ còn ' + Math.max(1, applePick.left()) + ' quả táo chưa ăn — táo hái phải ăn trong ngày, ăn hết rồi mới hái tiếp.' : !applePick.avail() ? 'Táo trong tầm sào đã hái hết; 5:00 sáng cây đủ quả lại.' : '') },
          garden: { plan: () => { const CB = worldSee('carrotBed'), n = CB.empty().length, r = CB.slots.filter(s => s.st === 'grow' && s.g >= 1).length;   // luống đọc qua mặt (camp/carrot-bed.js)
              return n ? 'Ra luống trồng ' + n + ' cây con vào hố trống, rồi tưới.' : r ? 'Nhổ ' + Math.min(2, r) + ' củ chín, trồng cây con thay, rồi tưới.' : 'Luống đủ cây, chưa có củ chín — ra tưới luống.'; },
            why: () => { const hh = liveWeather.localHour; return offerBusy() || (gardenJob.busy() ? 'Engineer đang chăm luống.' : liveWeather.state.raining ? 'Đang mưa, đợi tạnh rồi trồng.' : !engHourOk('gardenCmd', hh) ? 'Trời tối, để mai trồng.' : ''); } },
          trim: { plan: () => 'Giật nổ máy, đeo ba lô máy, phát cỏ các vòng quanh bếp lửa (~6 phút) rồi cất máy.',
            call: () => 'Gọi Engineer giật nổ máy, đeo ba lô máy, lia lưỡi phát cỏ các vòng quanh bếp lửa (~6 phút) rồi cất máy về cạnh đống củi.',
            why: () => { const hh = liveWeather.localHour; return offerBusy() || (liveWeather.state.raining ? 'Đang mưa, đợi tạnh và cỏ ráo đã.' : sceneWet > 0.3 ? 'Cỏ còn ướt, đợi ráo bớt rồi cắt.'
              : !engHourOk('trimCmd', hh) ? 'Trời tối, để mai cắt.' : !TRIMMER.ready ? 'Mẫu máy cắt cỏ đang tải…' : trimJob.cutFrac() > 0.85 ? 'Cỏ quanh trại vừa cắt xong.' : ''); } },
          cook: { plan: () => liveWeather.localHour < 14 ? 'Vào bếp trong xe luộc udon, thái hành, rồi ăn ở bàn vuông và rửa bát.' : 'Vào bếp trong xe chiên cơm trứng, bưng chảo ra ghế dưới bạt ăn (5 phút).',
            why: () => offerBusy() || (['cook', 'lunch', 'dinner'].includes(engObj.act) && !engForceAct ? 'Engineer đang ' + ENG_ACTS[engObj.act].label.toLowerCase() + '.' : '') },
          chair: { plan: () => 'Ra ghế cắm trại dưới bạt đọc sách, xen nhấp trà (10 phút).', why: () => offerBusy() || (engObj.phase === 'read' || engObj.phase === 'tea' ? 'Engineer đang ngồi ghế.' : '') },
          research: { plan: () => 'Vào xe ngồi bàn học, mở laptop nghiên cứu (20 phút) rồi về lịch.',
            why: () => offerBusy() || ((engObj.act === 'research' || engObj.act === 'music') && !engForceAct ? 'Engineer đang ngồi bàn học.' : '') },
          drone: { plan: () => 'Lấy drone ở bàn trà, bay 1 vòng quanh đảo rồi cất về.', call: () => 'Gọi Engineer ra bàn trà lấy drone bay 1 vòng quanh đảo.',
            why: () => { const w = liveWeather.state; return offerBusy() || (w.raining ? 'Đang mưa, drone không bay được.' : (w.windSpeed || 0) / 3.6 > 9 ? 'Gió mạnh quá (> 9 m/s).' : !droneToy.ready() ? 'Mẫu drone đang tải…' : ''); } },
          wood: { plan: () => 'Ra đống củi ôm 2 khúc, bỏ vào lò: lửa bùng, cháy ~10 phút.', why: () => offerBusy() || (CHIMINEA.fuel() > 300 ? 'Lò vừa thêm củi, còn cháy to.' : '') },
          engine: { plan: () => 'Gọi Engineer ra ' + (VAN.hood && VAN.hood.open ? '' : 'mở ca-pô, ') + 'kiểm tra máy rồi nổ máy 30 giây.',   // ca-pô đọc qua mặt xe (van/face.js)
            why: () => offerBusy() || (liveWeather.state.raining ? 'Đang mưa, không mở ca-pô.' : VAN.engineOn ? 'Máy đang chạy.' : '') },
        };
