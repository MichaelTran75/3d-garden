        // ---- ĐỘNG VẬT NGÀY / ĐÊM: nhóm cha ẩn – hiện theo giờ (cá, bướm, hươu, cua, ong ban ngày · đom đóm ban đêm) ----
        // Daytime wildlife and nocturnal fireflies use the selected city's local clock.
        // Identity parents preserve world positions and each animal's own visibility state.
        const daytimeAnimals = new THREE.Group(), nighttimeFireflies = new THREE.Group();
        daytimeAnimals.name = 'Động vật ban ngày'; nighttimeFireflies.name = 'Đom đóm ban đêm';
        scene.add(daytimeAnimals, nighttimeFireflies);
        // con vật tự xin vào nhóm (worldJoin('dayNight', thứ tự, G => G.day / G.night.add(gốc))): cá, bướm, hươu, cua, ong ban ngày · đom đóm ban đêm
        //  — thỏ: đêm nằm trong hang (animals/bunny/burrow.js) · bò không ẩn ban đêm: về ngủ trong chuồng · gấu mèo hoạt động chạng vạng → đêm: tự ẩn / hiện
        //  (animals/raccoon/brain.js) · chó không ẩn ban đêm: vào ngủ trong caravan
        worldServe('dayNight', { day: daytimeAnimals, night: nighttimeFireflies });
        function updateAnimalVisibility() {
          const isNight = !liveWeather.wildlifeAwake; // Animals return at 06:00 and rest at 18:30 in Pleiku.
          daytimeAnimals.visible = !isNight; nighttimeFireflies.visible = isNight && !liveWeather.state.raining;   // mưa: đom đóm trú dưới lá, thôi bay / nháy
        }
        updateAnimalVisibility();
        worldJoin('drawBatch', 30, B => B.draws('Động vật ban ngày', [daytimeAnimals]));   // gộp lượt vẽ cả nhóm (+ đồ đơn vị khác xin vào lô: B.with)
