        // ===== KỸ SƯ NHẬN XÉT THỜI TIẾT: CHỌN ĐIỀU ĐÁNG NÓI RỒI MỚI GHÉP CÂU =====
        //  Sinh câu từ số đo theo luật (data-to-text), không học từ dữ liệu. 4 bước:
        //   1. CHẤM — 5 chỉ số (temp nhiệt · wind gió · rad bức xạ · hum ẩm · cloud mây) → mức (lv) + độ nổi bật = (độ cực đoan của mức + đổi nhanh) × liên quan tới việc đang làm × độ quen.
        //   2. NHỚ — chỉ số đã nói ở mức nào, lúc nào: cùng mức thì im 25 phút rồi nhắc kiểu "vẫn"; đổi mức thì nói kiểu "bớt / hơn" (giai đoạn new · still · up · down).
        //   3. GỘP — tối đa 2 chỉ số khác họ (rad + cloud cùng họ bầu trời). Cặp có ý vật lý riêng (gió lạnh, nắng mà mát, mây che nắng, đêm quang mất nhiệt…) dùng câu cặp;
        //      còn lại nối theo dễ chịu / khó chịu (lại thêm · may mà · chỉ tội).
        //   4. VIẾT — mảnh câu theo mức × giai đoạn, thêm 1 câu hệ quả cho việc đang làm hoặc cho nhà máy (pin, tua-bin: số ước từ số đo). Quá 118 ký tự: bỏ câu hệ quả; câu 2 chỉ số quá 96: bỏ chỉ số thứ hai.
        //  Không chỉ số nào nổi bật ⇒ không nói gì về thời tiết (câu theo việc của engineer/mind/thoughts.js chạy như cũ).
        //  Công thức: nhiệt độ biểu kiến Steadman trong bóng râm (engineer/mind/weather-feel.js cộng thêm nắng / việc đang làm / lửa / áo ướt để ra cử chỉ; ở đây nắng là chỉ số riêng) · điểm sương Magnus · bức xạ trời quang Kasten–Czeplak 910·sin h − 30 ·
        //  nhiệt độ tấm pin NOCT 45 °C: Tcell = Ta + G/32, hụt 0,4 %/°C trên 25 °C · tua-bin: lập phương tốc độ gió giữa 11 km/h (khởi động) và 43 km/h (định mức).
        //  Lõi WXN không đụng cảnh (chạy trong node: docs/thought-probe); wxnObs / wxnThought ở cuối tệp nối vào cảnh.
        const WXN = (() => {
          const fin = Number.isFinite, cl = (x, a, b) => Math.max(a, Math.min(b, x));
          // mảnh câu: FR[chỉ số][mức][giai đoạn] — viết thường, không dấu chấm cuối; 'n' = bản ban đêm của 'new'
          const FR = {
            temp: {
              ret: { new: ['rét buốt, có {temp} độ', 'mới {temp} độ, lạnh tê cả tai', '{buoi} rét thật', 'rét run người, thở ra toàn khói'], still: ['vẫn rét như lúc nãy', 'rét mãi chưa đỡ'], down: ['càng lúc càng rét, còn {temp} độ', 'lạnh thêm rồi, rét cắt da'] },
              lanh: { new: ['lạnh, {temp} độ', '{buoi} lạnh, chỉ {temp} độ', 'lạnh tay thật', '{buoi} trời lạnh'], still: ['vẫn lạnh, {temp} độ', 'trời vẫn chưa ấm lên'], down: ['lạnh hẳn xuống, còn {temp} độ', 'trời trở lạnh rồi'], up: ['đỡ rét hơn lúc nãy, lên {temp} độ', 'bớt buốt rồi nhưng vẫn lạnh'] },
              se: { new: ['se lạnh, {temp} độ', '{buoi} se se, {temp} độ', 'hơi lạnh', '{buoi} trời se lạnh'], still: ['vẫn se lạnh', 'trời vẫn se se như lúc nãy'], down: ['mát dần thành se lạnh, {temp} độ', 'bắt đầu se lạnh rồi'], up: ['ấm lên chút rồi, {temp} độ', 'bớt lạnh rồi, còn hơi se'] },
              vua: { new: ['{temp} độ, dễ chịu', '{buoi} mát mẻ, {temp} độ', 'trời không nóng không lạnh'], still: ['trời vẫn dễ chịu', 'vẫn {temp} độ, mát mẻ'], down: ['dịu hẳn rồi, còn {temp} độ', 'mát lại rồi'], up: ['ấm lên rồi, {temp} độ', 'hết lạnh rồi, {temp} độ là vừa', 'trời ấm dần lên'] },
              am: { new: ['hơi nóng, {temp} độ', '{buoi} {temp} độ, bắt đầu thấy nóng', 'trời hơi nóng'], still: ['vẫn hơi nóng', 'vẫn {temp} độ, chưa dịu'], up: ['nóng dần lên, {temp} độ rồi', 'trời nóng dần lên'], down: ['bớt nóng rồi, còn {temp} độ', 'đỡ nóng hơn lúc nãy'] },
              nong: { new: ['nóng thật, {temp} độ', '{buoi} nóng, {temp} độ', 'nóng rát cả mặt', '{buoi} nóng thật'], still: ['vẫn nóng như lúc nãy', 'nóng mãi chưa dịu, vẫn {temp} độ'], up: ['càng lúc càng nóng, {temp} độ rồi', 'nóng hơn lúc nãy rồi'], down: ['bớt gắt hơn lúc nãy nhưng vẫn nóng', 'hạ được chút, còn {temp} độ'] },
              gat: { new: ['nóng hầm hập, {temp} độ', '{temp} độ, nóng như đứng cạnh lò', '{buoi} oi bức', 'nóng hầm hập'], still: ['vẫn nóng hầm hập', 'nóng chưa hạ được chút nào'], up: ['nóng lên tới {temp} độ rồi', 'càng lúc càng hầm'] }
            },
            wind: {
              lang: { new: ['lặng gió', 'không một chút gió', 'trời đứng gió, lá không buồn động'], still: ['vẫn lặng gió', 'gió vẫn chưa nổi lại'], down: ['gió tắt hẳn rồi', 'gió lặng dần, giờ đứng hẳn'] },
              hiu: { new: ['gió hiu hiu', 'gió nhẹ, cỡ {wind} km/h', 'có chút gió {dir}'], still: ['gió vẫn hiu hiu'], up: ['bắt đầu có gió', 'gió nổi lại rồi, nhè nhẹ'], down: ['gió dịu lại rồi, còn hiu hiu', 'gió yếu hẳn, còn {wind} km/h'] },
              vua: { new: ['gió {dir} thổi đều, {wind} km/h', 'gió khá, {wind} km/h', 'gió lộng'], still: ['gió vẫn thổi đều', 'gió vẫn cỡ {wind} km/h'], up: ['gió mạnh dần lên, {wind} km/h', 'gió nổi lên rồi'], down: ['gió bớt rồi, còn {wind} km/h', 'gió dịu bớt'] },
              manh: { new: ['gió mạnh, {wind} km/h', 'gió {dir} thổi mạnh, cấp {bf}', 'gió quật ràn rạt'], still: ['gió vẫn mạnh', 'gió chưa chịu ngớt, vẫn {wind} km/h'], up: ['gió mạnh hẳn lên, {wind} km/h', 'gió nổi to rồi'], down: ['gió bớt dữ nhưng vẫn mạnh', 'gió có dịu chút, còn {wind} km/h'] },
              giat: { new: ['gió rất mạnh, {wind} km/h', 'gió cấp {bf}, đi ngược gió phải cúi người', 'gió giật tới {gust} km/h'], still: ['gió vẫn dữ', 'gió vẫn {wind} km/h, chưa ngớt'], up: ['gió lên tới {wind} km/h rồi', 'gió càng lúc càng dữ'] },
              gusty: ['gió giật từng cơn, có lúc tới {gust} km/h', 'gió lúc lặng lúc giật, tới {gust} km/h']
            },
            rad: {
              gat: { new: ['nắng gắt', 'nắng chang chang', 'nắng như đổ lửa, bức xạ {rad} W/m²'], still: ['nắng vẫn gắt', 'nắng chưa dịu chút nào'], up: ['nắng gắt lên rồi', 'nắng lên đỉnh, {rad} W/m²'] },
              nang: { new: ['nắng đẹp', 'nắng vàng', 'trời nắng, bức xạ {rad} W/m²'], still: ['vẫn nắng đều', 'nắng vẫn đẹp'], up: ['hửng nắng rồi', 'nắng lên lại rồi'], down: ['nắng dịu bớt', 'nắng bớt gắt rồi'] },
              nhat: { new: ['nắng nhạt', 'nắng yếu, lúc có lúc không', 'nắng lọc qua mây, còn {rad} W/m²'], still: ['nắng vẫn nhạt', 'nắng vẫn lúc có lúc không'], up: ['bắt đầu hửng nắng', 'nắng le lói trở lại'], down: ['nắng nhạt dần', 'nắng yếu hẳn đi, còn {rad} W/m²'] },
              u: { new: ['trời âm u, không thấy mặt trời', 'không có nắng', 'trời xám, bức xạ chỉ {rad} W/m²'], still: ['trời vẫn âm u', 'vẫn chưa thấy nắng'], down: ['nắng tắt hẳn rồi', 'trời sầm xuống, bức xạ còn {rad} W/m²'] },
              xien: { new: ['{nang} xiên ngang, bóng đổ dài', '{nang} vàng nhạt, chiếu ngang tầm mắt'], still: ['{nang} vẫn xiên ngang'] }
            },
            hum: {
              suong: { new: ['không khí đẫm hơi nước', 'ẩm {rh}%, sương bắt đầu xuống', 'hơi nước bão hoà, cỏ ướt như vừa mưa'], still: ['sương vẫn chưa tan', 'vẫn ẩm ướt, sương đọng khắp nơi'] },
              oi: { new: ['oi, không khí đặc quánh', 'trời nồm, ẩm {rh}%', 'oi bức, điểm sương tới {dew} độ'], still: ['vẫn oi', 'trời vẫn nồm, mồ hôi không khô nổi'] },
              am: { new: ['không khí ẩm, {rh}%', 'trời ẩm, quần áo phơi lâu khô'], still: ['vẫn ẩm'], up: ['ẩm dần lên, {rh}% rồi'] },
              kho: { new: ['trời hanh, ẩm chỉ {rh}%', 'không khí khô, môi nẻ', 'hanh khô, độ ẩm {rh}%'], still: ['vẫn hanh khô'], down: ['trời khô dần, ẩm còn {rh}%'] }
            },
            cloud: {
              quang: { new: ['trời quang, không một gợn mây', 'trời trong xanh', 'trời quang, mây chỉ {cloud}%'], n: ['trời quang, sao dày đặc', 'đêm trong, thấy rõ từng vì sao'], still: ['trời vẫn quang', 'vẫn chưa thấy mây'], down: ['mây tan hết rồi', 'trời quang hẳn ra'] },
              it: { new: ['trời ít mây', 'lác đác vài đám mây'], down: ['mây tan bớt rồi', 'mây thưa dần'], up: ['bắt đầu có mây', 'mây lác đác kéo về'] },
              nhieu: { new: ['trời nhiều mây', 'mây che cỡ {cloud}% trời', 'mây từng mảng lớn'], still: ['mây vẫn lúc che lúc hở'], up: ['mây kéo tới nhiều dần', 'mây dày lên, che {cloud}% rồi'], down: ['mây bớt dày, hở ra từng khoảng xanh'] },
              day: { new: ['mây phủ gần kín trời', 'mây dày, che {cloud}% trời', 'trời đầy mây'], n: ['đêm nhiều mây, sao chỉ lấp ló'], still: ['mây vẫn dày'], up: ['mây kéo tới kín dần', 'mây đùn lên nhanh, che {cloud}% rồi'], down: ['mây bắt đầu hở ra'] },
              kin: { new: ['mây kín trời', 'trời xám một màu, mây phủ kín', 'mây che hết cả trời'], n: ['mây kín trời, không thấy một vì sao'], still: ['mây vẫn kín trời', 'trời vẫn xám xịt'], up: ['mây kéo kín trời rồi', 'trời tối sầm lại'] }
            }
          };
          // câu cặp: [điều kiện(L, o, d), chỉ số a, chỉ số b, câu] — L: mức 5 chỉ số, o: số đo, d: số suy ra
          const hot = L => L.temp && L.temp.side > 0, cold = L => L.temp && L.temp.side < 0, wl = (L, s) => !!L.wind && s.split(' ').includes(L.wind.lv), rl = (L, s) => !!L.rad && s.split(' ').includes(L.rad.lv);
          const PAIR = [
            [(L, o, d) => cold(L) && wl(L, 'vua manh giat') && d.chill !== null && d.chill <= o.temp - 2.5, 'temp', 'wind', ['{temp} độ mà gió {wind} km/h, cảm giác chỉ còn như {chill} độ', 'gió {dir} {wind} km/h thổi vào, {temp} độ thành ra lạnh như {chill} độ']],
            [L => hot(L) && wl(L, 'lang'), 'temp', 'wind', ['nóng mà đứng gió, không khí như đặc lại', '{temp} độ, lại không một chút gió, ngột ngạt thật']],
            [L => hot(L) && wl(L, 'hiu'), 'temp', 'wind', ['nóng nhưng may còn chút gió {dir}', 'trời nóng, được cái có gió hiu hiu']],
            [L => hot(L) && wl(L, 'vua'), 'temp', 'wind', ['nóng nhưng may còn gió {dir}, {wind} km/h', 'trời nóng, được cái gió thổi đều nên đỡ hẳn']],
            [(L, o) => rl(L, 'gat nang') && o.rad >= 600 && o.temp <= 24, 'rad', 'temp', ['nắng to mà không khí vẫn mát, {temp} độ', 'nắng thế này mà vào bóng râm là mát ngay, {temp} độ']],
            [(L, o) => rl(L, 'gat') && o.temp >= 29, 'rad', 'temp', ['nắng gắt, {temp} độ, đứng ngoài một lúc là rát da', 'nắng {rad} W/m² dội xuống, nhiệt kế lên {temp} độ']],
            [L => hot(L) && !!L.hum && L.hum.lv === 'oi', 'hum', 'temp', ['nóng mà ẩm tới {rh}%, mồ hôi ra không khô nổi', 'oi bức, điểm sương {dew} độ, người lúc nào cũng dính dấp']],
            [L => !!L.hum && L.hum.lv === 'kho' && wl(L, 'vua manh giat'), 'hum', 'wind', ['gió khô, ẩm chỉ {rh}%, tàn lửa bay ra cỏ là nguy', 'hanh khô lại có gió, phải canh bếp lửa kỹ hơn']],
            [L => !!L.cloud && L.cloud.tr > 0 && rl(L, 'u nhat'), 'cloud', 'rad', ['mây kéo tới che nắng, bức xạ tụt còn {rad} W/m²', 'mây che mất mặt trời, nắng tắt hẳn']],
            [L => !!L.cloud && L.cloud.tr > 0 && !!L.wind && L.wind.tr > 0, 'cloud', 'wind', ['gió nổi lên, mây kéo về, coi chừng sắp mưa', 'mây đùn lên, gió cũng mạnh dần, kiểu này dễ có mưa']],
            [(L, o, d) => !d.day && o.sun < -6 && !!L.cloud && L.cloud.lv === 'quang' && wl(L, 'lang hiu') && o.temp <= 20, 'cloud', 'wind', ['trời quang lại lặng gió, mặt đất toả nhiệt nhanh, sáng mai sẽ lạnh', 'đêm quang mây, không gió, kiểu này gần sáng nhiệt độ tụt sâu']],
            [(L, o, d) => !d.day && !!L.hum && L.hum.lv === 'suong' && wl(L, 'lang hiu'), 'hum', 'wind', ['lặng gió, ẩm {rh}%, thế nào cũng có sương', 'hơi nước bão hoà mà không có gió thổi đi, sương xuống dày']],
            [(L, o, d) => d.day && cold(L) && !!L.cloud && L.cloud.lv === 'quang', 'cloud', 'temp', ['trời quang, có nắng mà vẫn lạnh, {temp} độ']]
          ];
          // câu hệ quả: TAIL[nhóm việc] = [['chỉ số:mức,mức' | 'chỉ số:^up' | 'chỉ số:^down', câu, điều kiện(o, d)?]]
          const TAIL = {
            fish: [
              ['wind:manh,giat', ['Phao dạt hết vào bờ, phải quăng lại.', 'Dây câu bị gió thổi võng thành vòng cung.', 'Sóng lăn tăn, phao nhúc nhích cũng khó thấy.']],
              ['wind:vua', ['Phao cứ trôi dần về một phía.', 'Mặt hồ gợn sóng nhỏ, phao dập dềnh.']],
              ['wind:lang', ['Mặt hồ phẳng như gương, phao động một chút là thấy.']],
              ['rad:gat', ['Mặt hồ loá, phải kéo vành mũ xuống mới thấy phao.', 'Giờ này cá lặn sâu tránh nắng.']],
              ['rad:u', ['Trời râm, cá dạn hơn, hay lên ăn nổi.']], ['cloud:day,kin', ['Trời râm, cá dạn hơn, hay lên ăn nổi.'], (o, d) => d.day],
              ['temp:lanh,ret', ['Ngón tay cóng, gỡ lưỡi câu vụng hẳn.', 'Nước lạnh, cá ăn chậm.']],
              ['temp:nong,gat', ['Bờ hồ không có bóng râm, ngồi lâu chắc không nổi.']],
              ['hum:suong', ['Sương là là mặt hồ, phao lúc ẩn lúc hiện.']]
            ],
            tea: [
              ['temp:lanh,ret,se', ['Cốc trà nguội nhanh hẳn.', 'Kéo ghế sát bếp lửa thêm chút nữa.']],
              ['temp:nong,gat', ['Ngồi dưới bạt vẫn thấy hầm.', 'Trà nóng lúc này uống không nổi, để nguội đã.']],
              ['wind:manh,giat', ['Bạt hiên phần phật, phải xem lại dây neo.', 'Tàn lửa bay tạt cả sang một bên.']],
              ['wind:hiu,vua', ['Khói bếp bay thẳng một hướng, ngồi đầu gió là vừa.']],
              ['rad:xien', ['Nắng rọi tới tận chân ghế.']],
              ['cloud:quang', ['Ngồi đây ngửa cổ lên là thấy sao.'], (o, d) => !d.day && o.sun < -6],
              ['hum:kho', ['Củi khô, bén lửa nhanh.']], ['hum:suong,am', ['Củi ẩm, lửa cháy lèo xèo.']]
            ],
            walk: [
              ['temp:nong,gat', ['Đi một vòng là lưng áo đẫm mồ hôi.', 'Tìm chỗ râm đứng nghỉ đã.']],
              ['temp:lanh,ret', ['Đi cho ấm người, đứng yên là run.', 'Hai tay đút túi áo cho đỡ cóng.']],
              ['temp:vua', ['Trời này đi bộ cả buổi không mệt.']],
              ['wind:manh,giat', ['Đi ngược gió phải giữ mũ.', 'Cỏ rạp cả về một phía.']],
              ['rad:gat', ['Đường đất hắt nóng lên tận mặt.']],
              ['hum:kho', ['Đất khô, bước tới đâu bụi bay tới đó.']], ['hum:suong,am', ['Cỏ ướt, ủng dính đầy nước.']],
              ['cloud:^up', ['Đi gần trại thôi, lỡ mưa còn kịp vào hiên.']]
            ],
            work: [
              ['temp:am,nong,gat', ['Làm thêm chút nữa rồi nghỉ uống nước.', 'Mồ hôi chảy vào mắt cay xè.']],
              ['temp:se,vua', ['Trời này làm việc ngoài trời là vừa sức.']],
              ['hum:oi', ['Áo dính cả vào lưng.']], ['hum:kho', ['Đất mau se mặt, cây con cần tưới thêm.']],
              ['wind:manh,giat', ['Bụi với lá khô bay tạt cả vào người.']],
              ['rad:gat', ['Kéo vành mũ xuống che gáy đã.']]
            ],
            plant: [
              ['rad:gat', ['Tấm pin nóng cỡ {cell} độ, hiệu suất hụt chừng {loss}%.'], (o, d) => d.cell >= 45],
              ['rad:gat,nang', ['Pin mặt trời đang phát cỡ {pv}% công suất đỉnh.', 'Cánh đồng pin giờ này chạy khoẻ.']],
              ['rad:nhat,xien', ['Pin mặt trời chỉ phát cỡ {pv}% công suất đỉnh.']],
              ['rad:u', ['Pin mặt trời gần như nghỉ, còn cỡ {pv}% công suất đỉnh.']],
              ['wind:lang,hiu', ['Tua-bin đứng cánh, chưa đủ gió để khởi động.'], o => o.wind < 11],
              ['wind:hiu,vua', ['Tua-bin mới quay chậm, chưa phát được bao nhiêu.'], (o, d) => o.wind >= 11 && d.tb < 8],
              ['wind:vua,manh', ['Theo đường cong công suất, tua-bin đang cỡ {tb}% định mức.'], (o, d) => d.tb >= 8 && d.tb < 90],
              ['wind:manh,giat', ['Tua-bin đã gần chạm công suất định mức.'], (o, d) => d.tb >= 90],
              ['cloud:^up', ['Sản lượng pin sắp tụt theo mây.'], (o, d) => d.day],
              ['cloud:quang', ['Trời thế này cánh đồng pin phát trọn cả ngày.'], (o, d) => d.day && o.h < 13],
              ['cloud:day,kin', ['Mây giữ nhiệt, đêm nay sẽ đỡ lạnh hơn.'], (o, d) => !d.day && o.sun < -6],
              ['hum:suong', ['Mặt tấm pin đọng sương, sáng ra phải lau.']],
              ['temp:lanh,ret,se', ['Trời lạnh mà nắng, tấm pin mát nên phát tốt hơn.'], (o, d) => d.day && d.kc >= 0.7]
            ],
            stars: [
              ['cloud:quang,it', ['Đúng là đêm để ngắm sao.']], ['cloud:nhieu,day,kin', ['Sao bị che gần hết rồi.']],
              ['temp:lanh,ret,se', ['Nằm trên thảm mà hơi lạnh ngấm lên lưng.']]
            ],
            in: [
              ['temp:am,nong,gat', ['Trong xe hầm, mở cửa mui cho thoáng.', 'Bật quạt mui lên thôi.']],
              ['temp:lanh,ret,se', ['Khoác thêm áo rồi làm tiếp.', 'Thành xe lạnh ngắt.']],
              ['wind:manh,giat', ['Nghe gió rít qua khe cửa lùa.', 'Xe rung nhẹ theo từng cơn gió.']]
            ]
          };
          const GROUP = { fish: 'fish', tea: 'tea', read: 'tea', eat: 'tea', eatfish: 'tea', grill: 'tea', appleEat: 'tea', shelter: 'tea', rainwatch: 'tea', wander: 'walk', walk: 'walk', explore: 'walk', evening: 'walk', drink: 'walk', pet: 'walk',
            trim: 'work', garden: 'work', apple: 'work', engine: 'work', check: 'plant', research: 'plant', general: 'plant', stars: 'stars' };
          const REL = { fish: { wind: 1.3, rad: 1.15 }, tea: { temp: 1.15 }, walk: {}, work: { temp: 1.3, hum: 1.3 }, plant: { rad: 1.3, wind: 1.3, cloud: 1.1, hum: 0.7 }, stars: { cloud: 1.6, temp: 1.1, rad: 0 }, in: { rad: 0, cloud: 0, hum: 0 } };
          const REL_DESK = { rad: 0.8, wind: 0.8, cloud: 0.4, hum: 0.3 };   // ngồi bàn nghiên cứu trong xe: đọc số đo trên màn hình
          const MIN = { temp: 1.5, wind: 6, rad: 120, hum: 8, cloud: 15 }, FAM = { rad: 'sky', cloud: 'sky' }, KEYS = ['temp', 'wind', 'rad', 'hum', 'cloud'];
          const EX = { temp: { ret: 1.5, lanh: 1.1, se: 0.6, vua: 0.15, am: 0.6, nong: 1.1, gat: 1.5 }, wind: { lang: 0.35, hiu: 0.3, vua: 0.6, manh: 1.1, giat: 1.5 }, rad: { gat: 1.2, nang: 0.5, nhat: 0.35, u: 0.7, xien: 0.5 },
            hum: { suong: 0.9, oi: 1.0, am: 0.45, kho: 0.8 }, cloud: { quang: 0.5, it: 0.2, nhieu: 0.3, day: 0.55, kin: 0.75 } };
          const DIRS = ['bắc', 'đông bắc', 'đông', 'đông nam', 'nam', 'tây nam', 'tây', 'tây bắc'], BF = [1, 6, 12, 20, 29, 39, 50, 62, 75, 89, 103, 118];
          for (const g in TAIL) for (const t of TAIL[g]) { const [k, s] = t[0].split(':'); t.k = k; t.st = s[0] === '^' ? s.slice(1) : null; t.lv = t.st ? null : s.split(','); }
          const mem = {}, recent = [];
          let cur = null, lastAt = -Infinity;
          const vap = (t, rh) => rh / 100 * 6.105 * Math.exp(17.27 * t / (237.7 + t));
          function derive(o) {   // số suy ra từ số đo
            const e = fin(o.temp) && fin(o.rh) ? vap(o.temp, o.rh) : null, v10 = fin(o.wind) ? o.wind / 3.6 : 2, v = fin(o.v) ? o.v : o.out ? Math.max(0.3, v10 * 0.6) : 0.1;
            const d = { day: o.sun > 6 && !o.rain, clear: Math.max(0, 910 * Math.sin((fin(o.sunR) ? o.sunR : o.sun) * Math.PI / 180) - 30) };
            d.kc = d.day && fin(o.rad) && d.clear > 40 ? cl(o.rad / d.clear, 0, 1.3) : null;
            const Q = o.out && o.sunlit && d.day && fin(o.rad) ? 0.2 * o.rad : 0;
            d.feel = fin(o.temp) ? o.temp + 0.348 * (e === null ? 18 : e) - 0.70 * v - 4.25 + (o.out ? 0 : 1.5 + 2 * (o.night || 0)) : null;   // cảm giác trong bóng râm (ẩm + gió tại chỗ): mức nhiệt lấy theo số này
            d.sunFeel = d.feel !== null ? d.feel + 0.70 * Q / (v + 10) : null;   // đứng giữa nắng
            d.chill = e !== null ? o.temp + 0.33 * e - 0.70 * v10 - 4 : null;
            if (e !== null) { const g = Math.log(Math.max(1, o.rh) / 100) + 17.27 * o.temp / (237.7 + o.temp); d.dew = 237.7 * g / (17.27 - g); } else d.dew = null;
            d.cell = fin(o.temp) && fin(o.rad) ? o.temp + o.rad / 32 : null;
            d.pv = d.cell !== null ? cl(o.rad / 1000 * (1 - 0.004 * (d.cell - 25)), 0, 1.1) * 100 : null;
            d.loss = d.cell !== null ? 0.4 * (d.cell - 25) : null;
            d.tb = fin(o.wind) ? cl((o.wind ** 3 - 11 ** 3) / (43 ** 3 - 11 ** 3), 0, 1) * 100 : null;
            return d;
          }
          function levels(o, d) {   // mức + giá trị + độ cực đoan + xu hướng (tr: +1 tăng nhanh, −1 giảm nhanh so với 1–2 giờ trước) của từng chỉ số
            const L = {}, set = (k, lv, v, tr, ex) => { L[k] = { lv, v, tr: tr || 0, ex: ex ?? EX[k][lv] }; };
            const step = (a, b, n) => fin(a) && fin(b) && Math.abs(a - b) >= n ? Math.sign(a - b) : 0;
            if (d.feel !== null) { const f = d.feel; set('temp', f < 9 ? 'ret' : f < 14 ? 'lanh' : f < 19 ? 'se' : f < 27.5 ? 'vua' : f < 31 ? 'am' : f < 35 ? 'nong' : 'gat', f, step(o.temp, o.t2, 4)); L.temp.side = f >= 27.5 ? 1 : f < 19 ? -1 : 0; }
            const side = L.temp ? L.temp.side : 0;
            if (fin(o.wind)) {
              const w = o.wind, lv = w < 5 ? 'lang' : w < 14 ? 'hiu' : w < 27 ? 'vua' : w < 42 ? 'manh' : 'giat';
              set('wind', lv, w, step(w, o.w1, 10), side > 0 && lv === 'lang' ? 0.8 : side > 0 && lv === 'hiu' ? 0.6 : undefined);
              if (fin(o.gust) && o.gust - w >= 18 && o.gust >= 30) { L.wind.gusty = true; L.wind.ex += 0.3; }
            }
            if (d.day && fin(o.rad) && d.kc !== null) set('rad', o.rad >= 780 ? 'gat' : o.sun < 12 && d.kc >= 0.6 ? 'xien' : d.kc >= 0.72 ? 'nang' : d.kc >= 0.35 ? 'nhat' : 'u', o.rad, 0);
            if (fin(o.rh) && fin(o.temp) && !o.rain) {
              const lv = o.rh >= 93 && (!fin(o.wind) || o.wind < 8) && o.temp - d.dew < 1.6 ? 'suong' : d.dew >= 23.5 ? 'oi' : o.rh >= 85 ? 'am' : o.rh <= 40 ? 'kho' : null;
              if (lv) set('hum', lv, o.rh, 0, lv === 'kho' && o.rh <= 28 ? 1.1 : undefined);
            }
            if (fin(o.cloud) && !o.rain) { const c = o.cloud, lv = c <= 12 ? 'quang' : c <= 40 ? 'it' : c <= 75 ? 'nhieu' : c < 95 ? 'day' : 'kin'; set('cloud', lv, c, step(c, o.c1, 30), lv === 'quang' && !d.day && o.sun < -6 ? 0.7 : undefined); }
            return L;
          }
          function valence(k, L) {   // dễ chịu +, khó chịu − (gió / nắng / mây tuỳ đang nóng hay lạnh)
            const lv = L[k].lv, s = L.temp ? L.temp.side : 0;
            if (k === 'temp') return lv === 'vua' ? 1 : lv === 'se' ? 0 : lv === 'am' ? -0.5 : -1;
            if (k === 'wind') return lv === 'giat' ? -1 : lv === 'manh' ? (s > 0 ? -0.5 : -1) : lv === 'vua' ? (s > 0 ? 1 : s < 0 ? -1 : 0) : lv === 'hiu' ? (s < 0 ? 0 : 1) : s > 0 ? -1 : s < 0 ? 0.5 : 0;
            if (k === 'rad') return lv === 'gat' ? (s < 0 ? 1 : -1) : lv === 'nang' ? (s > 0 ? -0.5 : 1) : lv === 'u' ? (s > 0 ? 1 : -0.5) : lv === 'xien' ? 1 : 0;
            if (k === 'hum') return lv === 'oi' ? -1 : lv === 'kho' ? -0.5 : lv === 'am' ? -0.3 : 0;
            return lv === 'quang' ? (s > 0 ? 0 : 1) : lv === 'it' ? 0.5 : lv === 'day' ? (s > 0 ? 0.5 : -0.3) : lv === 'kin' ? -0.5 : 0;
          }
          function stage(k, c, m, now) {   // giai đoạn + độ quen: chưa nói / nói đã lâu → new (hoặc up / down theo xu hướng); đã nói cùng mức → still sau 25 phút; đổi mức → up / down
            if (!m || now - m.at > 3 * 3600000) return { st: c.tr > 0 ? 'up' : c.tr < 0 ? 'down' : 'new', hab: 1, bump: c.tr ? 0.4 : 0 };
            const age = (now - m.at) / 60000, dv = c.v - m.v, far = Math.abs(dv) >= MIN[k];
            if ((c.lv !== m.lv && far) || Math.abs(dv) >= 2 * MIN[k]) return { st: dv > 0 ? 'up' : 'down', hab: age >= 6 ? (c.lv !== m.lv ? 1 : 0.8) : 0, bump: 0.5 };
            return { st: 'still', hab: 0.7 * cl((age - 25) / 65, 0, 1), bump: 0 };
          }
          function plan(o, act) {   // → danh sách chỉ số đáng nói, nổi bật nhất trước: [{ k, lv, st, s, v }]
            const d = derive(o), L = levels(o, d), g0 = GROUP[act] || 'in', g = o.out || g0 === 'plant' ? g0 : 'in', rel = !o.out && g === 'plant' ? REL_DESK : REL[g], P = [];
            cur = { o, d, L, g, at: o.now };
            for (const k of KEYS) {
              const c = L[k]; if (!c) continue;
              let r = rel[k] ?? 1;
              if (g === 'in' && k === 'wind' && c.lv !== 'manh' && c.lv !== 'giat') r = 0;
              if (k === 'temp' && ((o.hotK > 0.5 && c.side <= 0) || (o.coldK > 0.5 && c.side >= 0 && c.lv !== 'se'))) r *= 0.2;   // người đang nóng vì việc / lạnh vì áo ướt: không khen trời dễ chịu
              const S = stage(k, c, mem[k], o.now), s = (c.ex + S.bump) * r * S.hab;
              if (s > 0) P.push({ k, lv: c.lv, v: c.v, st: S.st, s });
            }
            P.sort((a, b) => b.s - a.s); P.d = d; P.L = L; P.g = g; P.o = o;
            return P;
          }
          const N = v => Math.round(v), N5 = v => Math.max(5, Math.round(v / 5) * 5);
          function fill(text, o, d) {   // thay chữ trong ngoặc nhọn; thiếu số đo → null (bỏ mảnh câu đó)
            let ok = true;
            const out = text.replace(/\{(\w+)\}/g, (_, k) => {
              const h = o.h, v = k === 'temp' ? o.temp : k === 'wind' ? o.wind : k === 'gust' ? o.gust : k === 'rad' ? o.rad : k === 'cloud' ? o.cloud : k === 'rh' ? o.rh : k === 'feel' ? d.feel : k === 'sunFeel' ? d.sunFeel : k === 'chill' ? d.chill : k === 'dew' ? d.dew : k === 'cell' ? d.cell : k === 'loss' ? d.loss : k === 'tmr' ? o.tm : null;
              if (k === 'buoi') return h < 5 ? 'đêm nay' : h < 10.5 ? 'sáng nay' : h < 13.5 ? 'trưa nay' : h < 18 ? 'chiều nay' : h < 22 ? 'tối nay' : 'đêm nay';
              if (k === 'nang') return h < 12 ? 'nắng sớm' : 'nắng chiều';
              if (k === 'dir') { if (!fin(o.dir)) { ok = false; return ''; } return DIRS[Math.round(((o.dir % 360) + 360) % 360 / 45) % 8]; }
              if (k === 'bf') { if (!fin(o.wind)) ok = false; return BF.filter(x => o.wind >= x).length; }
              if (k === 'pv' || k === 'tb') { const x = d[k]; if (!fin(x)) { ok = false; return ''; } return N5(x); }
              if (!fin(v)) { ok = false; return ''; }
              return N(v);
            });
            return ok ? out : null;
          }
          function choose(list, o, d, rnd, gap, noTroi) {   // 1 mảnh câu chưa dùng gần đây, đủ số đo; nhiệt kế lệch cảm giác ≥ 3 °C thì không nêu số nhiệt kế kèm lời khen chê
            let pool = (list || []).filter(t => !(gap && t.includes('{temp}'))).map(t => [t, fill(t, o, d)]).filter(x => x[1] !== null);
            if (noTroi) { const q = pool.filter(x => !/trời/.test(x[1])); if (q.length) pool = q; }   // mảnh thứ hai: tránh lặp chữ "trời" của mảnh đầu
            const fresh = pool.filter(x => !recent.includes(x[0])); if (fresh.length) pool = fresh;
            if (!pool.length) return null;
            const p = pool[Math.floor(rnd() * pool.length) % pool.length];
            recent.push(p[0]); if (recent.length > 24) recent.shift();
            return p[1];
          }
          const cap = s => s[0].toUpperCase() + s.slice(1);
          function frag(p, P, rnd, noTroi) {   // mảnh câu của 1 chỉ số
            const o = P.o, d = P.d, F = FR[p.k][p.lv], gap = p.k === 'temp' && Math.abs(d.feel - o.temp) >= 3;
            if (p.k === 'wind' && P.L.wind.gusty && p.st !== 'still' && rnd() < 0.5) { const t = choose(FR.wind.gusty, o, d, rnd); if (t) return t; }
            const night = !d.day && o.sun < -6 && F.n && (p.st === 'new' || !F[p.st]);
            return choose(night ? F.n : F[p.st] || F.new, o, d, rnd, gap, noTroi) || choose(F.new, o, d, rnd, gap, noTroi) || choose(F.new, o, d, rnd);
          }
          function tail(P, picks, rnd, station) {   // câu hệ quả: việc đang làm trước, nhà máy sau; nhiệt kế lệch cảm giác; dự báo mai cùng giờ
            const o = P.o, d = P.d, C = [];
            const add = (g, w) => { for (const t of TAIL[g] || []) for (const p of picks) if (t.k === p.k && (t.st ? t.st === p.st : t.lv.includes(p.lv)) && (!t[2] || t[2](o, d))) for (const s of t[1]) C.push([s, w]); };
            add(P.g, 3); if (P.g !== 'plant' && P.g !== 'in' && P.g !== 'stars') add('plant', station ? 3 : 0.7);
            const tp = picks.find(p => p.k === 'temp'), rp = picks.find(p => p.k === 'rad');
            if (!picks.pair && o.out && fin(d.feel)) {
              if (rp && (rp.lv === 'gat' || rp.lv === 'nang') && o.sunlit && d.sunFeel - o.temp >= 4) C.push(['Nhiệt kế chỉ {temp} độ mà đứng nắng cảm giác như {sunFeel}.', 2.5]);
              else if (tp && o.temp - d.feel >= 3 && o.wind >= 14) C.push(['Nhiệt kế {temp} độ mà gió thổi, cảm giác chỉ như {feel}.', 2.5]);
            }
            if (tp && fin(o.tm) && Math.abs(o.tm - o.temp) >= 3) C.push(['Dự báo mai giờ này {tmr} độ, ' + (o.tm < o.temp ? 'lạnh' : o.tm >= 28 ? 'nóng' : 'ấm') + ' hơn hôm nay.', 1.2]);
            const pool = C.map(([s, w]) => [s, w * (recent.includes(s) ? 0.15 : 1), fill(s, o, d)]).filter(x => x[2] !== null);
            if (!pool.length || (!station && rnd() > 0.7)) return null;
            let r = rnd() * pool.reduce((a, x) => a + x[1], 0), pick = pool[0];
            for (const x of pool) { r -= x[1]; if (r <= 0) { pick = x; break; } }
            recent.push(pick[0]); if (recent.length > 24) recent.shift();
            return pick[2];
          }
          function say(P, opt = {}) {   // ghép câu từ kế hoạch P (plan) → { text, picks } · ghi nhớ điều vừa nói
            const rnd = opt.rnd || Math.random, min = opt.min ?? 0.55, o = P.o, d = P.d, L = P.L;
            if (!P.length || P[0].s < min) return null;
            const A = P[0], picks = [A]; let body = null;
            if (A.st !== 'still') for (const B of P.slice(1)) {   // (nhắc lại kiểu "vẫn" thì nói riêng 1 chỉ số) cặp có ý vật lý riêng (kể cả cùng họ bầu trời, kể cả chỉ số thứ hai ở mức thường: nắng to mà mát)
              const pr = PAIR.find(q => ((q[1] === A.k && q[2] === B.k) || (q[1] === B.k && q[2] === A.k)) && q[0](L, o, d));
              const t = pr && choose(pr[3], o, d, rnd, false);
              if (t) { body = t; picks.push(B); picks.pair = true; break; }
            }
            if (!body) {
              body = frag(A, P, rnd); if (!body) return null;
              const B = P.slice(1).find(q => q.s >= 0.45 && (FAM[q.k] || q.k) !== (FAM[A.k] || A.k));
              if (B && rnd() < 0.6) {
                const tb = frag(B, P, rnd, /trời/.test(body)), va = valence(A.k, L), vb = valence(B.k, L);
                const body2 = A.k === 'temp' || A.k === 'hum' || B.k === 'temp' || B.k === 'hum';   // lời nối khen chê chỉ khi có nhiệt / ẩm (chuyện dễ chịu của người); gió với nắng với mây thì kể liền
                const C = !body2 ? ['{A}, {B}'] : va < 0 && vb < 0 ? ['{A}, lại thêm {B}', '{A}, {B}'] : va < 0 && vb > 0 ? ['{A}, may mà {B}', '{A}, được cái {B}'] : va > 0 && vb < 0 ? ['{A}, chỉ tội {B}', '{A}, có điều {B}'] : ['{A}, {B}'];
                if (tb) { const two = C[Math.floor(rnd() * C.length) % C.length].replace('{A}', body).replace('{B}', tb); if (two.length <= 96) { body = two; picks.push(B); } }
              }
            }
            const one = cap(body) + '.', t = tail(P, picks, rnd, opt.station), text = t && one.length + t.length + 1 <= 118 ? one + ' ' + t : one;
            for (const p of picks) mem[p.k] = { at: o.now, lv: p.lv, v: p.v };
            lastAt = o.now;
            return { text, picks };
          }
          function touch(keys, now) {   // câu của thoughts.js vừa nhắc tới chỉ số này: coi như đã nói ở mức hiện tại
            if (cur) for (const k of keys) if (cur.L[k]) mem[k] = { at: now, lv: cur.L[k].lv, v: cur.L[k].v };
          }
          const told = (keys, now) => keys.some(k => mem[k] && now - mem[k].at < 600000);   // chỉ số vừa được nói trong 10 phút
          return { FR, PAIR, TAIL, derive, levels, plan, say, touch, told, mem, recent, lastAt: () => lastAt, reset() { for (const k in mem) delete mem[k]; recent.length = 0; lastAt = -Infinity; cur = null; } };
        })();
        // ---- nối vào cảnh ----
        const WXN_TAG = { hot: 'temp', cold: 'temp', feelHot: 'temp', feelCold: 'temp', nice: 'temp', temp: 'temp', wind: 'wind', calm: 'wind', clear: 'cloud', cloudy: 'cloud', partly: 'cloud', cloud: 'cloud', rad: 'rad', humid: 'hum', fog: 'hum', rh: 'hum' };
        const wxnTopics = l => [...new Set([...l.wo, ...l.wc.filter(c => c[0] !== '!').map(c => c[0])].map(t => WXN_TAG[t]).filter(Boolean))];   // câu của thoughts.js nhắc tới chỉ số nào
        const _wxnP = new THREE.Vector3();
        function wxnObs(ctx, e) {   // số đo tại chỗ kỹ sư đứng + số 1–2 giờ trước, mai cùng giờ (mảng theo giờ của Open-Meteo)
          const st = liveWeather.state, cur = st.data?.current, hr = st.data?.hourly;
          const i = cur && Array.isArray(hr?.time) ? hr.time.findIndex(x => x.slice(0, 13) === cur.time.slice(0, 13)) : -1;
          const at = (k, d) => { const v = i >= 0 ? hr[k]?.[i + d] : null; return Number.isFinite(v) ? v : null; };
          const out = rxOutside(e), dry = out && rxDry(e.g.position), same = st.data?.utc_offset_seconds === SUN_TZ * 3600;   // thành phố thời tiết lệch múi giờ cảnh: bức xạ không khớp mặt trời cảnh ⇒ bỏ chỉ số nắng
          return { now: ctx.now, h: ctx.h, sun: ctx.sun, sunR: solarPosition(Math.floor(ctx.h) - 0.5).el * 180 / Math.PI, night: nightFactor, out, sunlit: out && !dry, v: out ? Math.max(0.3, (dry ? 0.5 : 1) * RX.wm) : 0.1,
            rain: ctx.tags.has('rain'), temp: ctx.temp, wind: ctx.wind, gust: st.windGusts, dir: st.windDirection, cloud: ctx.cloud, rh: ctx.rh, rad: same ? ctx.rad : null,
            t2: at('temperature_2m', -2), w1: at('wind_speed_10m', -1), c1: at('cloud_cover', -1), tm: at('temperature_2m', 24), hotK: WX.hotK, coldK: WX.coldK };
        }
        function wxnThought(act, ctx, e, now, station) {   // → câu nhận xét thời tiết, hoặc null (không gì nổi bật / vừa nói xong / tới lượt câu theo việc)
          if (!liveWeather.state.fresh || !Number.isFinite(ctx.temp)) return null;
          const P = WXN.plan(wxnObs(ctx, e), act), top = P.length ? P[0].s : 0;
          if (station ? top < 0.3 : top < 0.55 || (now - WXN.lastAt() < 240000 && top < 1.3) || Math.random() > Math.min(0.9, 0.3 + 0.45 * top)) return null;
          const r = WXN.say(P, { station, min: station ? 0.3 : 0.55 }); if (!r) return null;
          if (P.o.out && !e.seat) {   // ngước nhìn trời khi nói về mây / nắng, quay về phía gió khi nói về gió mạnh
            const g = e.g.position, k = r.picks[0].k, y = e.g.rotation.y;
            if (k === 'cloud' || k === 'rad') rxLook('wxn', 1.1, 3.5, _wxnP.set(g.x + Math.sin(y) * 4, g.y + 7, g.z + Math.cos(y) * 4));
            else if (k === 'wind' && RX.wm > 3) rxLook('wxn', 1.1, 3, _wxnP.set(g.x - RX.wv.x / RX.wm * 6, g.y + 1.6, g.z - RX.wv.z / RX.wm * 6));
          }
          return r.text;
        }
