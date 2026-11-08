        // ==== MẶT CÔNG KHAI CỦA ĐÀN GÀ (core/world.js): worldSee('chickens') ----
        worldFace('chickens', {
          get list() { return chickens.list; },                        // từng con { g, level, st, … } — đọc, không ghi
          get allIn() { return chickens.allIn; },                      // cả đàn đã lên sào ngủ (chuồng thấy thì hạ cửa)
        });
