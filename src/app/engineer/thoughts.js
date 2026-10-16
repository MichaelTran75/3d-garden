        // ===== SUY NGHĨ THEO GIỜ + THỜI TIẾT + VIỆC ĐANG LÀM =====
        // Mỗi câu: 'việc|giờ|thời tiết|điều kiện|nội dung' (trường để trống = không ràng buộc; câu 4 trường = không có trường điều kiện).
        //  · giờ: khung tên (dawn, morning…) hoặc khoảng giờ '6-9.5' (lấy 1 trong số đó) + độ cao mặt trời 'sun>20', 'sun<5' (phải thoả hết).
        //    Mặt trời theo vị trí thật ở Pleiku (solarPosition): mọc ~5:20–6:10, lặn ~17:25–18:20 tuỳ mùa; dưới 20° ≈ 1 giờ 20 phút trước lúc lặn.
        //  · thời tiết: nhãn (rain, cloudy, clear…: lấy 1) · '!nhãn' (không được có) · so số 'wind>=40', 'rad<150', 'rh<60', 'temp<=15' (phải thoả hết).
        //    rad = bức xạ sóng ngắn W/m² giờ hiện tại (Open-Meteo); thiếu số đo thì ước theo Kasten–Czeplak: (910·sin h − 30)·(1 − 0,75·N^3,4).
        //  · điều kiện: trạng thái cảnh / việc đang làm (cowsOut, dogFire, toFish, headwind, tomorrowRain, evHook…) — phải thoả hết, '!' để phủ định.
        // Câu càng khớp cụ thể càng được ưu tiên; không lặp 6 câu gần nhất của cùng việc. Sự việc khi câu cá (cá rỉa, dính cá, thả cá, hụt…) nảy ý ngay.
        const ENG_SLOTS = [   // [từ giờ, mã, tên, biểu tượng]
          [0, 'night', 'Đêm khuya', '🌙'], [5, 'dawn', 'Rạng sáng', '🌄'], [7, 'morning', 'Buổi sáng', '🌤'], [11, 'noon', 'Ban trưa', '☀️'],
          [14, 'afternoon', 'Buổi chiều', '🌥'], [17, 'dusk', 'Chiều tà', '🌇'], [19, 'evening', 'Buổi tối', '🌙'], [22, 'night', 'Đêm khuya', '🌙']
        ];
        const ENG_THOUGHT_LINES = [
          // ---- hái táo bằng sào (16:10) ----
          'apple|||Đưa rổ từ dưới lên, vặn nhẹ là cuống gãy, khỏi giật cả chồi.',
          'apple|||Quả thấp nhất chín đỏ rồi, hái trước.',
          'apple|||Đặt nhẹ vào giỏ thôi, táo dập là thâm ngay.',
          'apple||wind||Gió lay cành, rổ cứ chệch khỏi quả.',
          'apple||!rain||Bốn quả là đủ cho tối nay với sáng mai.',
          'apple|15-17.5|clear,partly||Nắng chiều chiếu xuyên tán, quả nào chín nhìn rõ hẳn.',
          // ---- câu cá: theo giờ, nắng, gió ----
          'fish|6-7.5|||Sáng sớm, giờ này cá ăn mồi mạnh nhất.',
          'fish|6-8.5|humid,fog||Sương còn phủ mặt hồ, phao đỏ lúc ẩn lúc hiện.',
          'fish|6-10.5|fog||Sương mù dày quá, phao đỏ cũng chỉ thấy lờ mờ.',
          'fish|6-8,sun>-4,sun<14|clear,partly||Trời hửng dần, phao đỏ nổi rõ trên nền nước xám.',
          'fish|7.5-10.5,sun>12|clear,partly||Nắng sáng còn dịu, ngồi câu tới trưa cũng được.',
          'fish|7-17|cloudy||Trời âm u, cá dạn hơn, phao chắc sắp nhúc nhích.',
          'fish|11-14,sun>45|hot,!cloudy||Nắng gắt giữa trưa, cá lặn sâu rồi, câu cho vui thôi.',
          'fish|10.5-14.5|clear,rad>=600||Mặt hồ chói nắng, phải nheo mắt mới thấy phao.',
          'fish|11-14.5|cloudy||Mây che bớt nắng, trưa nay ngồi câu dễ chịu.',
          'fish|15.5-17.8|!rain||Chiều xuống, nước bớt nóng, cá bắt đầu ăn lại.',
          'fish|14-18|wind||Gió chiều làm phao trôi dạt, phải để mắt canh.',
          'fish|sun>-6,sun<6|!rain||Chạng vạng là lúc cá đớp mồi, ráng thêm mẻ cuối.',
          'fish|15-19,sun>-3,sun<10|clear,partly||Trời ửng cam rồi, câu nốt lượt này là về nhóm lửa.',
          'fish||wind||Gió thế này dây câu cứ võng, khó thấy cá cắn.',
          'fish||temp<=15||Lạnh cóng tay, cá cũng lười ăn mồi.',
          'fish||cold,temp>15||Trời se lạnh, cá ăn mồi chậm hơn.',
          'fish|sun>15|hot||Nóng thế này cá nằm sát đáy, phải thả mồi sâu hơn.',
          'fish||afterRain||Mưa vừa tạnh, nước đục chút, cá kéo vào bờ kiếm mồi.',
          'fish|||caught|Hôm nay dính {catch} con rồi, thả lại hồ hết.',
          'fish|||noCatch|Chưa dính con nào, kiên nhẫn thêm chút.',
          'fish|||storks|Con cò bên kia bắt cá còn giỏi hơn mình.',
          'fish|||Nước xả đập chảy mạnh, cá hay tụ quanh đó.',
          'fish|||waiting|Mồi giun ngâm lâu rồi, lượt sau thay con mới.',
          // ---- câu cá: đúng việc vừa xảy ra (nảy ý ngay lúc đó) ----
          'fish|||evCast|Quăng nhẹ thôi, phao rơi đúng chỗ cũ là được.',
          'fish|||evBite|Phao nhấp rồi… khoan, chờ nó chìm hẳn đã.',
          'fish|||evBite|Cá đang rỉa mồi, đừng giật vội.',
          'fish|||evHook|Dính rồi! Cá to, cần cong vòng, để phanh nhả dây.',
          'fish|||evHook|Nâng cần chậm, hạ cần thì quay máy, đừng để chùng dây.',
          'fish|||evRelease|Koi đẹp quá, lưỡi không ngạnh nên thả dưới nước là tuột.',
          'fish|||evKeep|Con cá rô vừa cỡ, bỏ xô mang về xiên que nướng.',
          'fish|||evKeep|Cá rô nhẹ nên nhấc lên bờ được, tối mai có cá nướng rồi.',
          'grill|||Xiên que từ đuôi ra miệng, cắm xiên cạnh than chứ đừng để vào lửa.',
          'grill|||Mười mấy phút là cá chín vàng, mai ăn vừa.',
          'eatfish|||Cá nướng thơm, cắn dọc sườn từng miếng, chừa xương.',
          'eatfish|||Ăn xong quăng que với xương vào bếp cho gọn.',
          'fish|||evRelease|Bờ cao thế này không lôi cá lên, để nó dưới nước cho khỏe.',
          'fish|||evMiss|Giật sớm quá, cá nhả mồi mất rồi.',
          'fish|||evMiss|Hụt! Lần sau đợi phao chìm hẳn mới giật.',
          'fish|||evDrift|Gió đẩy phao trôi xa quá, thu về quăng lại chỗ cũ.',
          'fish|||evRebait|Mồi bị rỉa sạch, móc con giun mới.',
          'fish|18-19.6|||Tắm xong ra câu, người nhẹ hẳn.',
          'fish|18-19.6,sun<-4|!rain||Trời tối rồi, phải nhìn phao dưới ánh đèn lồng.',
          // ---- uống trà ở ghế cắm trại ----
          'tea|6-9|||Ấm trà đầu ngày, uống xong mới tỉnh hẳn.',
          'tea|6-10|cold||Sáng se lạnh, ôm cốc trà nóng cho ấm tay.',
          'tea|6-10.5|fog||Sương chưa tan, ngồi uống trà chờ trời sáng rõ.',
          'tea|11-15|hot||Trưa nóng thế này, trà để nguội uống lại ngon.',
          'tea|14.6-15.6|||Ba giờ chiều, nghỉ tay một cốc trà là vừa.',
          'tea|13-16|cloudy||Trời kéo mây, chiều nay chắc không nắng nữa.',
          'tea|16.3-17.8,sun>3|clear,partly||Nắng đã xiên, pin mặt trời sắp nghỉ, còn tua-bin với thủy điện gánh.',
          'tea|15-19,sun>-2,sun<10|clear,partly||Trà chiều bên bếp lửa, nhìn mặt trời xuống sau đồi.',
          'tea|17-20,sun>-10,sun<2|clear||Trời quang, lát nữa sao lên kín trời.',
          'tea|19-21|!rain||Chén trà tối bên bếp lửa, nghe dế kêu ran.',
          'tea||wind||Gió lùa mạnh, giữ chặt cốc kẻo đổ.',
          'tea||afterRain||Sau mưa không khí mát hẳn, trà cũng thơm hơn.',
          'tea|7-16|!rain||Lát nữa phải lau bụi hai tấm pin trên nóc xe.',
          'tea|||dogFire|Con chó nằm cạnh bếp lửa lim dim, sướng thật.',
          // ---- bữa ăn (luôn sau một lượt câu) ----
          'eat|11-13.5|||Bữa trưa đơn giản: cá nướng với cơm nắm.',
          'eat|14-16.5|||Ăn muộn chút cũng được, chiều nay rảnh.',
          'eat|15-19,sun>-6,sun<8|clear,partly||Ăn tối sớm, còn kịp ngắm trời chuyển màu.',
          'eat|19-21|||Bữa tối bên bếp lửa, ấm bụng rồi.',
          'eat||cold||Trời lạnh, ăn đồ nóng mới thấy ngon.',
          'eat||hot||Nóng quá, chẳng muốn ăn nhiều.',
          'eat||afterRain||Mưa xong đói bụng hẳn, ăn thêm miếng cá.',
          'eat|||Cá nướng chín vừa, rắc thêm chút muối tiêu.',
          'eat|||Ăn xong phải rửa chảo ngay kẻo khô dầu.',
          // ---- uống nước (đứng nghỉ sau khi dạo) ----
          'drink||hot||Nóng thế này, cứ chốc lại phải uống nước.',
          'drink|11-14|||Giữa trưa, uống ngụm nước cho đỡ khát.',
          'drink|6-10|||Ngụm nước buổi sáng, mát cả người.',
          'drink||cold||Nước lạnh buốt răng, mai mang bình giữ nhiệt.',
          'drink||wind,rh<60||Gió hanh làm khô cổ, uống thêm ngụm nữa.',
          'drink|||Nhớ đổ đầy bình nước trước lượt câu sau.',
          // ---- chơi với chó (chó đang nằm cạnh bếp lửa) ----
          'pet|||Ngoan nào, ra đây chơi chút.',
          'pet|6-9|||Sáng nay nó dậy còn sớm hơn mình.',
          'pet|17.3-18.5|||Sắp tối rồi, lát nữa vào xe ngủ nhé.',
          'pet||cold||Lông nó ấm hơn cả tay mình.',
          'pet|sun>10|hot||Nóng thế, nó cứ nằm thè lưỡi, chẳng buồn chạy.',
          'pet||afterRain||Lông còn ẩm, lau khô cho nó đã.',
          'pet||wind||Gió to, nó cứ nheo mắt rúc vào chân mình.',
          // ---- dạo quanh trại ----
          'wander|6-6.5||cowsHome|Gà rừng gáy rồi, đàn bò sắp ra khỏi chuồng.',
          'wander|7-10.5,sun>10|clear||Nắng sớm chiếu lên cánh đồng pin, sáng nay sản lượng chắc tốt.',
          'wander|10.5-14|clear,rad>=650||Mặt trời đứng bóng, pin mặt trời đang chạy gần hết công suất.',
          'wander|13-17.5||cowsOut|Đàn bò gặm cỏ no rồi, nằm nhai lại dưới bóng cây.',
          'wander|17-19||cowsGoingHome|Chiều tà, bò lục tục về chuồng.',
          'wander||wind||Gió mạnh, tua-bin quay tít, chắc phát được nhiều điện.',
          'wander|sun>20|cloudy||Mây dày thế này, sản lượng điện mặt trời sẽ tụt.',
          'wander|16.3-17.9,sun>3|!rain||Nắng xiên khoai rồi, cánh đồng pin chỉ còn le lói chút điện.',
          'wander|sun<0|calm||Gió lặng, tua-bin đứng im, tối nay trông cả vào thủy điện.',
          'wander|sun>-4|fog||Sương dày, nhìn không rõ cả đập nước bên kia.',
          'wander||afterRain||Cỏ còn ướt, giày lấm hết bùn.',
          'wander|sun>10|hot||Đi vài bước đã toát mồ hôi.',
          'wander||cold||Đi bộ một vòng cho ấm người.',
          'wander|||Cây cổ thụ này chắc cả trăm năm tuổi.',
          'wander|||bees|Ong bay về tổ trên cây con kia.',
          // ---- đang đi tới chỗ khác (theo đúng điểm đến) ----
          'walk|||toFish|Ra ghế câu thôi, phao chờ lâu rồi.',
          'walk|6-10||toFish|Sáng rồi, ra hồ thôi.',
          'walk|||toMast|Tới giờ đọc số liệu trạm khí tượng rồi.',
          'walk|16.5-18.2||toMast|Ghé xem trạm khí tượng trước khi trời tối.',
          'walk||wind|headwind|Gió ngược, bước chậm thôi.',
          'walk||afterRain||Đất trơn sau mưa, đi cẩn thận.',
          // ---- trú mưa dưới hiên ----
          'shelter||thunder||Sấm rền gần quá, cất cần câu vào cho chắc.',
          'shelter||thunder||Chớp sáng phía hồ, ngồi yên dưới mái là hơn.',
          'shelter||rain||Mưa gõ lộp độp trên mái bạt, nghe cũng vui tai.',
          'shelter|6-17|rain||Tạnh mưa là cá ăn mồi ngay, chờ chút.',
          'shelter|6-10.5|rain||Mưa sáng thế này chắc kéo tới trưa.',
          'shelter|10.5-13.5|rain||Mưa trưa, ngồi dưới hiên nghe mưa cũng hay.',
          'shelter|13.5-17.9|rain|cowsHome|Mưa chiều, đàn bò về chuồng sớm.',
          'shelter|18-21|rain||Mưa tối, đêm nay ngủ chắc ngon.',
          'shelter|||dogVan|Con chó chui vào xe trước cả mình.',
          'shelter|6-19||Mấy con cò cũng về cây cổ thụ trú mưa.',
          'shelter|sun>15|rain||Mưa thế này, cánh đồng pin gần như không phát điện.',
          // ---- bàn học buổi tối (20:30–21:00) ----
          'study|||Viết nốt báo cáo sản lượng hôm nay.',
          'study|||Xem lại biểu đồ công suất thủy điện.',
          'study||rain||Mưa ngoài kia, ngồi trong xe gõ máy thật dễ chịu.',
          'study||thunder||Sấm to quá, lưu file lại đề phòng mất điện.',
          'study||wind||Gió rung cả xe, mai kiểm tra lại dây néo tua-bin.',
          'study||clear||Trời quang, đêm nay nhiều sao lắm.',
          'study|||tomorrowCloudy|Dự báo mai nhiều mây, sản lượng pin sẽ thấp.',
          'study|||tomorrowRain|Mai có mưa ({tPop}%), chắc ngồi hiên nhiều hơn ngồi câu.',
          'study|||tomorrowClear|Mai trời trong, pin mặt trời sẽ đẹp số.',
          'study||cold||Trời lạnh, làm xong việc là chui vào chăn.',
          'study|||Đọc dự báo thời tiết ngày mai.',
          'study|20.8-21|||Còn ít phút nữa là đi ngủ.',
          'study|||Lon coke trên bàn sắp hết rồi.',
          'evening|||Vào xe làm nốt việc rồi đi ngủ.',
          'evening||rain||Mưa rồi, vào xe làm việc cho khô.',
          'evening||clear||Ngoài trời đầy sao, tiếc là phải vào làm việc.',
          // ---- nghiên cứu ở bàn học (ban ngày) ----
          'research|7-9|||Sáng nay đối chiếu số liệu đêm qua của ba nguồn điện.',
          'research|7-11|clear,partly,rad>300||Nắng lên rồi, công suất pin mặt trời đang leo dốc.',
          'research|||Mô hình dự báo lưu lượng sông chạy lâu quá, chờ thêm chút.',
          'research||wind>=25||Gió đang mạnh, ghi lại đường cong công suất tua-bin để so với mô hình.',
          'research||rain||Mưa thế này, vài giờ nữa mực hồ chứa sẽ lên.',
          'research|11-16|hot||Tấm pin nóng quá thì hiệu suất tụt, phải ghi vào báo cáo.',
          'research|||Đọc lại bài báo về tua-bin trục đứng cho vùng gió yếu.',
          'research|||Bảng tính sản lượng tuần này gần xong rồi.',
          'research|||Làm ngụm coke cho tỉnh rồi viết tiếp.',
          'research||hot||Trời nóng, lon coke lạnh trên bàn là cứu tinh.',
          'research|13-16|||Chiều nay viết nốt phần kết luận.',
          'research|9.5-11.2|||Ngồi lâu mỏi lưng, lát nữa đứng dậy vươn vai.',
          'research|||Cần thêm số liệu nhiệt độ nước để tính lượng bốc hơi của hồ.',
          'research|||tomorrowRain|Mai mưa ({tPop}%), lưu lượng về hồ tăng, phải sửa kế hoạch xả.',
          'research||calm||Lặng gió, tua-bin đứng im, hôm nay trông vào thủy điện với pin mặt trời.',
          // ---- ăn sáng ở bàn vuông trong xe ----
          'breakfast|||Ngũ cốc với sữa, thêm cốc cà phê là đủ cho buổi sáng.',
          'breakfast||cold||Sáng lạnh, cốc cà phê nóng uống mới tỉnh.',
          'breakfast||fog||Ngoài kia sương còn dày, ăn xong chắc nó tan.',
          'breakfast||rain||Mưa sáng sớm, may mà bữa sáng ở trong xe.',
          'breakfast|||Hộp ngũ cốc sắp hết, ghi vào danh sách đi chợ.',
          'breakfast|||Ăn xong ra xem cột khí tượng rồi mới ngồi vào bàn.',
          // ---- tắm ----
          'shower|||Tắm xong ra hồ câu, giờ này cá hay ăn.',
          'shower||hot||Cả ngày nóng, tắm nước mát thật đã.',
          'shower||cold||Trời lạnh, vặn nước ấm thêm chút.',
          'shower|||Nước lấy từ bồn trên nóc, phơi nắng cả ngày nên còn ấm.',
          'shower|||Tắm xong nhớ lau khô sàn kẻo trơn.',
          'shower||rain||Mưa thế này, tắm xong chắc ngồi hiên chứ không câu được.',
          // ---- đọc sách, ăn khoai tây chiên dưới hiên ----
          'read|||Chương này hay, đọc thêm vài trang nữa.',
          'read|||Gói khoai tây chiên vơi nhanh quá.',
          'read|||Đọc sách dưới đèn lồng, nghe củi bên kia nổ lách tách.',
          'read||wind||Gió cứ lật trang sách, phải giữ chặt.',
          'read||cold||Lạnh rồi, đọc xong chương này vào xe.',
          'read||rain||Mưa rơi trên bạt hiên, đọc sách thế này dễ chịu.',
          'read|||dogFire|Con chó cứ nhìn gói khoai, không chia được đâu nhé.',
          'read||clear||Ngẩng lên là thấy sao, đọc xong chương này ngắm một lúc.',
          // ---- học bài buổi tối, laptop mở nhạc ----
          'music|||Bật nhạc nhẹ cho dễ tập trung.',
          'music|||Bài này nghe hoài không chán.',
          'music|||Nhạc nhẹ với lon coke, học bài cũng thấy vui.',
          'music||rain||Nhạc với tiếng mưa trên nóc xe, hợp nhau ghê.',
          'music|||Ôn lại phần tính thủy lực trước khi ngủ.',
          'music|20.8-21|||Hết bài này là tắt máy đi ngủ.',
          // ---- chuẩn bị ngủ ----
          'bedtime|||Mai sáu giờ dậy, ngủ thôi.',
          'bedtime||rain||Mưa đều trên nóc xe, dễ ngủ đây.',
          // ---- nấu ăn ở bếp trong xe: trưa udon, chiều cơm chiên trứng ----
          'cook|10.5-12|||Nước sôi thì thả udon, nấu chừng mười phút là vừa.',
          'cook|10.5-12|||Thái ít hành lá rắc lên cho thơm.',
          'cook|10.5-12|||Udon dai, chan nước dùng nóng là ngon.',
          'cook|10.5-12|||Sắp tới giờ ăn udon rồi, đói bụng quá.',
          'cook|16.5-17.5|||Tối nay ăn cơm chiên trứng, nhanh gọn.',
          'cook|16.5-17.5|||Lửa to, đảo đều tay kẻo cơm cháy đáy chảo.',
          'cook||rain||Mưa ngoài kia, nấu ăn trong xe ấm cúng ghê.',
          'cook||hot||Đứng cạnh bếp giữa trưa nóng thật.',
          'cook|||Bình ga còn đủ dùng hết tuần này.',
          // ---- ăn udon ở bàn vuông ----
          'udon|||Sợi udon dai, nước dùng đậm, ngon.',
          'udon||cold||Trời lạnh, húp nước udon nóng ấm cả người.',
          'udon||rain||Mưa ngoài kia, bát udon nóng là hết ý.',
          'udon|||Ăn xong rửa bát luôn cho gọn.',
          'udon|||Lát chả cá narutomaki này mua ở chợ Pleiku đấy.',
          // ---- xem trạm khí tượng (kèm số đo thật: {temp} {wind} {cloud} {rad} {rh}) ----
          'check||thunder||Có dông, ghi số liệu nhanh rồi vào trú.',
          'check||thunder,wind>=40||Gió giật kèm sấm, kim đo gió quay loạn cả lên.',
          'check||rain||Mưa đang rơi, lượng mưa hôm nay sẽ cao.',
          'check|6-11|rain|rainLong|Mưa từ sáng, chắc cả buổi không ra hồ được.',
          'check||wind>=40||Gió {wind} km/h, tua-bin chạy gần định mức.',
          'check||wind,wind<40||Gió {wind} km/h, tua-bin quay đều nhưng chưa tới định mức.',
          'check||wind>=45||Gió mạnh thế này phải kiểm tra lại neo cột đo.',
          'check|11-14|hot||{temp} °C giữa trưa, nóng thật.',
          'check|14-17,sun>10|hot,!cloudy||Nắng chiều vẫn gắt, {temp} °C.',
          'check|6-10|cold||Sáng nay chỉ {temp} °C, se lạnh.',
          'check|17-21|cold||Trời trở lạnh, {temp} °C, tối nay đốt lửa to.',
          'check|sun>15|fog||Sương mù, tầm nhìn kém, tấm pin cũng phát ít điện.',
          'check|sun<=15|fog||Sương mù dày, nhìn không quá vài chục mét.',
          'check|sun>20|cloudy||Mây che {cloud}% bầu trời, pin mặt trời sẽ giảm.',
          'check|6-10,sun>0,sun<=20|cloudy||Mây che {cloud}%, nắng sớm lại yếu, pin mặt trời khởi động chậm.',
          'check|14-18,sun>0,sun<=20|cloudy||Mây che {cloud}%, nắng chiều đã yếu, pin mặt trời coi như nghỉ.',
          'check|sun<=0|cloudy||Mây che {cloud}% bầu trời, đêm nay chắc không thấy sao.',
          'check|sun>8|rad<150,!rain,!fog||Bức xạ chỉ {rad} W/m², cánh đồng pin đang phát cầm chừng.',
          'check|6-10.5,sun>5|clear||Trời trong, sáng nay pin mặt trời sẽ đẹp số.',
          'check|10.5-14|clear,rad>=600||Nắng đứng bóng, bức xạ {rad} W/m², cao nhất ngày.',
          'check|14-16.3|clear||Chiều quang, gió {wind} km/h, dễ chịu.',
          'check|16.3-18,sun>0|clear,partly||Nắng xiên rồi, bức xạ còn {rad} W/m², pin mặt trời sắp nghỉ.',
          'check|15-18.2,sun>-1,sun<12|clear,partly||Trời quang, hoàng hôn hôm nay sẽ đẹp.',
          'check|sun<-3|clear||Trời quang, tối nay chắc nhiều sao.',
          'check||afterRain||Vừa tạnh mưa, độ ẩm còn {rh}%.',
          'check|||Số liệu ổn, ghi vào sổ rồi quay lại câu.',
          // ---- ý chung (xen vào khi đang câu, uống trà, dạo, đi) ----
          'general|6-7.5|humid,fog||Một ngày mới ở trại, hồ còn phủ sương.',
          'general|6-7.5|!humid,!fog||Một ngày mới ở trại, không khí trong lành.',
          'general|7-11,sun>10|clear||Trời đẹp thế này, điện mặt trời là nhất.',
          'general|11-14|hot,calm|cowsOut|Giữa trưa, cả trại lặng gió, bò cũng nằm nghỉ.',
          'general|14-16.5|||Chiều nay nhớ ghi số liệu trạm vào sổ.',
          'general|15-18.2,sun>-3,sun<14|||Đèn đường sáng dần lên, hết thêm một ngày.',
          'general|19-21|||Tối nay ngủ sớm, sáu giờ sáng mai còn dậy.',
          'general||wind||Gió to, nhớ buộc lại bạt hiên.',
          'general|6-13|cloudy||Trời nhiều mây, có khi chiều nay mưa.',
          'general|sun>-2|clear||Trời trong, nhìn thấy cả đỉnh đồi bên kia.',
          'general||afterRain||Mưa xong hồ đầy nước, đập xả mạnh hơn.',
          'general|sun>15|wind>=11,rad>=150||Thủy điện, mặt trời, gió, cả ba đều đang phát điện.',
          'general|sun<0|wind>=11||Trời tối rồi, giờ chỉ còn tua-bin với thủy điện phát điện.',
          'general|sun<0|calm||Tối lặng gió, cả nhà máy trông vào thủy điện.'
        ].map(compileThought);
        function compileThought(s) {   // tách sẵn điều kiện để lúc chọn câu chỉ so sánh, không phân tích chuỗi
          const p = s.split('|'), act = p[0], times = p[1], wx = p[2], need = p.length > 4 ? p[3] : '', text = p[p.length - 1];
          const tw = [], tc = [], wo = [], wc = [], nd = [];
          for (const tk of times ? times.split(',') : []) {
            const m = /^sun(<=|>=|<|>)(-?[\d.]+)$/.exec(tk);
            if (m) tc.push([m[1], +m[2]]); else if (/^[\d.]+-[\d.]+$/.test(tk)) tw.push(tk.split('-').map(Number)); else tw.push(tk);
          }
          for (const tk of wx ? wx.split(',') : []) {
            const m = /^(wind|cloud|rad|temp|rh)(<=|>=|<|>)(-?[\d.]+)$/.exec(tk);
            if (m) wc.push([m[1], m[2], +m[3]]); else if (tk[0] === '!') wc.push(['!', tk.slice(1)]); else wo.push(tk);
          }
          for (const tk of need ? need.split(',') : []) nd.push(tk[0] === '!' ? [true, tk.slice(1)] : [false, tk]);
          return { act, text, tw, tc, wo, wc, nd, ev: nd.some(([, n]) => n.startsWith('ev')), w: 1 + (tw.length || tc.length ? 3 : 0) + (wo.length || wc.length ? 5 : 0) + (nd.length ? 4 : 0) };
        }
        const _thoughtCmp = (v, op, x) => op === '<' ? v < x : op === '<=' ? v <= x : op === '>' ? v > x : v >= x;
        const THOUGHT_NEED = {   // trạng thái cảnh & việc đang làm
          caught: () => angling.catches > 0, noCatch: () => angling.catches === 0, waiting: () => angling.stage === 'wait' || angling.stage === 'approach',
          storks: () => storksAwake(), bees: () => liveWeather.wildlifeAwake && !liveWeather.state.raining,
          dogFire: () => dogPettable(), dogVan: () => !!dogRain.st && dogRain.st !== 'toFire',
          cowsHome: () => cowHutWanted(), cowsOut: () => !cowHutWanted(), cowsGoingHome: () => cowHutWanted() && cows.some(c => !(c.mode === 'home' && c.leg === 'in')),
          toFish: () => engObj.phase === 'toFish', toMast: () => engObj.phase === 'toMast',
          headwind: () => { const y = engObj.g.rotation.y; return Math.sin(y) * sceneWind.dir.x + Math.cos(y) * sceneWind.dir.y < -0.5; },   // đi ngược hướng gió thổi
          rainLong: ctx => ctx.rainLong,
          tomorrowRain: ctx => !!ctx.tmr && (ctx.tmr.code >= 51 || ctx.tmr.pop >= 60),
          tomorrowCloudy: ctx => !!ctx.tmr && ctx.tmr.code < 51 && ctx.tmr.pop < 60 && (ctx.tmr.code === 3 || ctx.tmr.code === 45 || ctx.tmr.code === 48),
          tomorrowClear: ctx => !!ctx.tmr && ctx.tmr.code <= 1 && ctx.tmr.pop < 30,
          evCast: ctx => ctx.event === 'cast', evBite: ctx => ctx.event === 'bite', evHook: ctx => ctx.event === 'hook', evRelease: ctx => ctx.event === 'release', evKeep: ctx => ctx.event === 'keep',
          evMiss: ctx => ctx.event === 'miss', evDrift: ctx => ctx.event === 'drift', evRebait: ctx => ctx.event === 'rebait'
        };
        for (const l of ENG_THOUGHT_LINES) for (const [, n] of l.nd) if (!THOUGHT_NEED[n]) console.warn('Suy nghĩ kỹ sư: thiếu điều kiện', n, l.text);
        function thoughtFits(l, act, ctx) {
          if (l.act !== act) return false;
          if (l.tw.length && !l.tw.some(w => typeof w === 'string' ? w === ctx.slot : ctx.h >= w[0] && ctx.h < w[1])) return false;
          for (const [op, x] of l.tc) if (!_thoughtCmp(ctx.sun, op, x)) return false;
          if (l.wo.length && !l.wo.some(w => ctx.tags.has(w))) return false;
          for (const c of l.wc) {
            if (c[0] === '!') { if (ctx.tags.has(c[1])) return false; }
            else { const v = ctx[c[0]]; if (!Number.isFinite(v) || !_thoughtCmp(v, c[1], c[2])) return false; }
          }
          for (const [neg, n] of l.nd) if (!!THOUGHT_NEED[n](ctx) === neg) return false;
          return true;
        }
        let lastRainSeenAt = -Infinity, rainSinceAt = null;
        function engContext(now = Date.now()) {
          const h = liveWeather.localHour, st = liveWeather.state, cur = st.fresh ? st.data?.current : null;
          let slot = ENG_SLOTS[0]; for (const s of ENG_SLOTS) if (h >= s[0]) slot = s;
          if (st.raining) { lastRainSeenAt = now; if (rainSinceAt === null) rainSinceAt = now; } else rainSinceAt = null;
          const tags = new Set(), temp = st.temperature, wind = st.windSpeed, cloud = cur && Number.isFinite(cur.cloud_cover) ? cur.cloud_cover : null;
          const rh = cur && Number.isFinite(cur.relative_humidity_2m) ? cur.relative_humidity_2m : null;
          if (st.thunder) tags.add('thunder').add('rain');
          else if (st.raining) tags.add('rain');
          else {
            if (now - lastRainSeenAt < 45 * 60000) tags.add('afterRain');               // tạnh chưa quá 45 phút
            if (cur && (cur.weather_code === 45 || cur.weather_code === 48)) tags.add('fog');
            if (cloud !== null) tags.add(cloud >= 70 ? 'cloudy' : cloud <= 35 ? 'clear' : 'partly');
          }
          if (Number.isFinite(wind) && wind >= 25) tags.add('wind');
          if (Number.isFinite(wind) && wind < 8) tags.add('calm');                       // dưới ~2 m/s: tua-bin chưa tới tốc độ khởi động
          if (Number.isFinite(temp) && temp >= 31) tags.add('hot');
          if (Number.isFinite(temp) && temp <= 18) tags.add('cold');
          if (rh !== null && rh >= 90) tags.add('humid');                                 // đủ ẩm để sương phủ mặt hồ
          const sun = Math.asin(Math.max(-1, Math.min(1, sunElevSin))) * 180 / Math.PI;    // độ cao mặt trời trên bầu trời cảnh (°)
          let rad = null; const hourly = cur ? st.data?.hourly : null;
          if (cur && Array.isArray(hourly?.time)) { const i = hourly.time.findIndex(x => x.slice(0, 13) === cur.time.slice(0, 13)); const v = i >= 0 ? hourly.shortwave_radiation?.[i] : null; if (Number.isFinite(v)) rad = v; }
          if (rad === null) rad = Math.max(0, 910 * Math.max(0, sunElevSin) - 30) * (1 - 0.75 * Math.pow((cloud ?? 50) / 100, 3.4));
          let tmr = null; const daily = st.data?.daily, today = st.data?.current?.time?.slice(0, 10);
          if (today && Array.isArray(daily?.time)) { const i = daily.time.findIndex(d => d > today); if (i >= 0 && Number.isFinite(daily.weather_code?.[i])) tmr = { code: daily.weather_code[i], pop: Number.isFinite(daily.precipitation_probability_max?.[i]) ? daily.precipitation_probability_max[i] : 0 }; }
          const wxIcon = tags.has('thunder') ? '⛈' : tags.has('rain') ? '🌧' : tags.has('fog') ? '🌫' : tags.has('wind') ? '💨' : tags.has('cloudy') ? '☁️' : sun < 0 ? '✨' : '☀️';
          return { h, slot: slot[1], slotName: slot[2], slotIcon: slot[3], tags, temp, wind, cloud, rh, sun, rad, tmr, rainLong: rainSinceAt !== null && now - rainSinceAt >= 3600000, wxIcon, event: null };
        }
        const thoughtRecent = {};
        function pickThought(act, ctx) {
          const recent = thoughtRecent[act] || (thoughtRecent[act] = []);
          const fits = l => thoughtFits(l, act, ctx);
          let pool = ENG_THOUGHT_LINES.filter(l => fits(l) && !recent.includes(l.text));
          if (!pool.length) { recent.length = 0; pool = ENG_THOUGHT_LINES.filter(fits); }
          if (ctx.event) { const evPool = pool.filter(l => l.ev); if (evPool.length) pool = evPool; }   // vừa có sự việc khi câu: nói đúng chuyện đó
          if (!pool.length) return null;
          let r = Math.random() * pool.reduce((s, l) => s + l.w, 0), pick = pool[0];   // câu đúng giờ + đúng thời tiết + đúng việc được ưu tiên rõ rệt
          for (const l of pool) { r -= l.w; if (r <= 0) { pick = l; break; } }
          recent.push(pick.text); if (recent.length > 6) recent.shift();
          return pick.text;
        }
        const fillThought = (text, ctx) => {
          const num = v => Number.isFinite(v) ? v.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '—', int = v => Number.isFinite(v) ? Math.round(v) : '—';
          return text.replace('{temp}', num(ctx.temp)).replace('{wind}', num(ctx.wind)).replace('{cloud}', ctx.cloud === null ? '—' : Math.round(ctx.cloud))
            .replace('{rad}', int(ctx.rad)).replace('{rh}', int(ctx.rh)).replace('{tPop}', ctx.tmr ? int(ctx.tmr.pop) : '—').replace('{catch}', angling.catches);
        };
        const clockText = h => { const hh = Math.floor(h), mm = Math.floor((h - hh) * 60); return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'); };

        // Tin thời tiết khi đứng xem trạm: đổi câu mỗi 15 phút thật (không gọi thêm API), hiện 60 s; câu chọn theo khung giờ + thời tiết, kèm số đo thật.
        let thoughtNextAt = 0, thoughtUntil = 0, thoughtSecond = -1, thoughtCity = '', thoughtQuality = '', thoughtRevision = 0;
        function updateEngineerWeatherThought(now = Date.now()) {
          const second = Math.floor(now / 1000); if (second === thoughtSecond) return;
          thoughtSecond = second;
          const state = sceneWeather.state, current = state.data?.current;
          const observed = current ? Date.parse(current.time + 'Z') - state.data.utc_offset_seconds * 1000 : NaN;
          const fresh = state.fresh && now - state.fetchedAt <= 3600000 && now - observed <= 3600000;
          const quality = fresh && state.phase !== 'error' ? (state.phase === 'ready' || (state.phase === 'loading' && thoughtQuality === 'live' && state.city.id === thoughtCity) ? 'live' : 'cached') : 'unavailable';
          if (state.city.id !== thoughtCity || quality !== thoughtQuality) {
            thoughtCity = state.city.id; thoughtQuality = quality; thoughtNextAt = 0;
          }
          if (now < thoughtNextAt || (fresh && state.phase === 'loading')) return;
          const ctx = engContext(now), num = v => Number.isFinite(v) ? v.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '—';
          const header = quality === 'unavailable' ? ctx.slotIcon + ' ' + clockText(ctx.h) + ' · ' + state.city.name + ' · chưa có dữ liệu mới'
            : ctx.wxIcon + ' ' + clockText(ctx.h) + ' · ' + state.city.name + ' · ' + num(state.temperature) + ' °C · gió ' + num(state.windSpeed) + ' km/h';
          const message = quality === 'unavailable' ? 'Chưa cập nhật được Open-Meteo, mình chờ dữ liệu mới.'
            : (quality === 'cached' ? 'Bản lưu: ' : '') + fillThought(pickThought('check', ctx) || 'Số liệu ổn, ghi vào sổ rồi quay lại câu.', ctx);
          thoughtRevision++;
          checkBubbleSprite.userData.thought = checkBubbleSprite.userData.weatherThought = { header, message, city: state.city.id, quality, sourceTime: current?.time || null, revision: thoughtRevision, nextAt: now + 900000, slot: ctx.slot, tags: [...ctx.tags] };
          thoughtNextAt = now + 900000; thoughtUntil = now + 60000;
        }
        // Suy nghĩ thường ngày: mỗi 100–160 s nảy 1 ý theo việc đang làm × khung giờ × thời tiết (hiện 14 s, không chen vào tin thời tiết đang hiện);
        // thỉnh thoảng (20%) xen ý chung về trại và nhà máy.
        let idleThoughtAt = Date.now() + 40000;
        function updateEngineerIdleThought(now = Date.now()) {
          if (now < idleThoughtAt || now < thoughtUntil) return;
          const e = engObj; let act, label;
          if (e.phase === 'check') return;   // đang đứng xem trạm: tin thời tiết đã hiện
          if (e.act === 'toilet' || e.act === 'sleep' || e.phase === 'nap' || e.phase === 'drone') { idleThoughtAt = now + 20000; return; }   // đang ở buồng WC / đang ngủ / bay drone (bong bóng màn hình camera): không nảy ý
          const ctx = engContext(now);
          ctx.event = angling.event && now - angling.eventAt < 6000 ? angling.event : null;
          const atStation = !!e.inVan && !!e.van && !!e.van.station;
          if (e.inVan || e.phase === 'van') {
            if (e.act === 'research') { act = atStation ? 'research' : 'walk'; label = atStation ? 'Nghiên cứu' : 'Vào bàn làm việc'; }
            else if (e.act === 'music') { act = atStation ? (Math.random() < 0.5 ? 'music' : 'study') : 'evening'; label = atStation ? 'Học bài, nghe nhạc' : 'Vào xe học bài'; }
            else if (e.act === 'breakfast') { act = 'breakfast'; label = 'Ăn sáng'; }
            else if (e.act === 'shower') { act = 'shower'; label = 'Giờ tắm'; }
            else if (e.act === 'bedtime') { act = 'bedtime'; label = 'Chuẩn bị ngủ'; }
            else if (e.act === 'cook') { act = 'cook'; label = liveWeather.localHour < 14 ? 'Nấu udon' : 'Nấu bữa tối'; }
            else if (e.act === 'lunch') { act = 'udon'; label = 'Ăn trưa: udon'; }
            else { act = 'walk'; label = 'Đang đi'; }
          }
          else if (e.phase === 'shelter' || e.phase === 'toShelter') { act = 'shelter'; label = 'Trú mưa dưới hiên'; }
          else if (e.phase === 'eatFish' || e.phase === 'tossFish' || e.phase === 'grab' || e.phase === 'toGrill') { act = 'eatfish'; label = 'Ăn cá nướng'; }
          else if (e.phase === 'toPlant' || e.phase === 'plant') { act = 'grill'; label = 'Nướng cá'; }
          else if (e.phase === 'eat' || (e.phase === 'toChair' && (e.act === 'lunch' || e.act === 'dinner'))) { act = 'eat'; label = e.act === 'lunch' ? 'Ăn trưa' : e.act === 'dinner' ? 'Ăn tối' : 'Bữa ăn'; }
          else if (e.phase === 'read' || (e.phase === 'toChair' && e.act === 'read')) { act = 'read'; label = 'Đọc sách'; }
          else if (e.phase === 'drink') { act = 'drink'; label = 'Uống nước'; }
          else if (e.phase === 'pet' || e.phase === 'toDog') { act = 'pet'; label = 'Chơi với chó'; }
          else if (e.phase === 'fish') { act = 'fish'; label = 'Đang câu cá'; }
          else if (e.phase === 'tea' || e.phase === 'toChair') { act = 'tea'; label = e.act === 'rest' ? 'Nghỉ trưa' : ctx.slot === 'dusk' || ctx.slot === 'evening' ? 'Bên bếp lửa' : 'Giờ uống trà'; }
          else if (e.phase === 'wander') { act = 'wander'; label = 'Dạo quanh trại'; }
          else if (e.phase === 'apple') { act = 'apple'; label = 'Hái táo'; }
          else { act = 'walk'; label = 'Đang đi'; }
          if (act === 'fish' && !ctx.event && !['wait', 'approach', 'settle', 'rig', 'done'].includes(angling.stage)) { idleThoughtAt = now + 4000; return; }   // đang giật/dìu/thả/thay mồi: tập trung, chưa nghĩ vẩn vơ
          if (act !== 'fish') ctx.event = null;
          if (!ctx.event && ['fish', 'tea', 'wander', 'walk', 'research'].includes(act) && Math.random() < 0.2) act = 'general';
          const text = pickThought(act, ctx); if (ctx.event) angling.event = null; if (!text) { idleThoughtAt = now + 30000; return; }
          const t = Number.isFinite(ctx.temp) ? ' · ' + ctx.wxIcon + ' ' + ctx.temp.toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + '°' : '';
          checkBubbleSprite.userData.thought = { header: ctx.slotIcon + ' ' + ctx.slotName + ' · ' + clockText(ctx.h) + ' · ' + label + t, message: fillThought(text, ctx), kind: 'idle', slot: ctx.slot, tags: [...ctx.tags], revision: ++thoughtRevision };
          thoughtUntil = now + 14000; idleThoughtAt = now + 100000 + Math.random() * 60000;
        }


