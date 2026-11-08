        worldFace('fish', {   // MẶT CÔNG KHAI CỦA CÁ (core/world.js): người câu chọn con gần mồi nhất, bỏ qua con đang được thả về
          get list() { return fishies; },                          // đàn cá: 7 con đầu ở hồ dưới (chỗ câu), 3 con hồ trên — mỗi con { g, mouth, swim, cx, cz, ang… }
          get returning() { return returningFishingFish; },        // con vừa được thả, đang lặn ra xa (null: không có)
        });
