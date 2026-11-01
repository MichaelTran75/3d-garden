        // ---- MẬT HOA dùng chung cho ong + bướm: mỗi hoa 2 lượt hút rồi 30 s mới đầy lại; safeFlowerCoords = hoa có lối bay an toàn (animals/_lib/insect-flight.js) ----
        let safeFlowerCoords;
        // Shared, bounded flower supply: two completed sips, then 30 real seconds to refill.
        flowerNectar = new Map();
        for (const flower of flowerCoords) flowerNectar.set(flower, { remaining: 2, reserved: 0, readyAt: 0 });
        function flowerNectarState(flower, now = Date.now()) {
          const supply = flowerNectar?.get(flower);
          if (supply && supply.readyAt > 0 && now >= supply.readyAt) {
            supply.remaining = 2; supply.readyAt = 0;
          }
          return supply;
        }
        function flowerHasNectar(flower, now = Date.now()) {
          const supply = flowerNectarState(flower, now);
          return !!supply && supply.remaining > supply.reserved;
        }
