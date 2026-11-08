        // ==== ĐỘ ẨM ĐẤT 0–1 (dời từ engineer/body/footprints.js 01/11: dấu chân kỹ sư, gà bới đất cùng đọc) ====
        //  Tách khỏi độ ướt MẶT cỏ (sceneWet — khô sau ~5 phút): mưa thì đất ngấm nhanh (~2 phút mưa vừa là đẫm), tạnh thì khô chậm — ban ngày ~50 phút,
        //  đêm ~2,5 giờ. Mỗi khung: soilTick (loop/main-loop-rest.js, ngay trước dấu chân)
        const soilWet = { v: 0 };
        function soilTick(dt) { soilWet.v = Math.max(0, Math.min(1, soilWet.v + (liveWeather.state.raining ? dt * 0.008 * (0.4 + rainK) : -dt / (nightFactor > 0.5 ? 9000 : 3000)))); }
