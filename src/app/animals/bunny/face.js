        // ==== MẶT CÔNG KHAI CỦA BẦY THỎ (core/world.js): worldSee('bunnies') ----
        worldFace('bunnies', {
          get list() { return bunnies; },                              // từng con { g, x, z, shelter, home, … } — đọc, không ghi
          get atBed() { return BUN_BED.who; },                         // con đang ra luống cà rốt (animals/bunny/carrots.js) | null
          bedEating: () => { const b = BUN_BED.who; return !!b && !!b.bed && b.bed.st !== 'go'; },   // đã tới luống: ngửi / nhổ / gặm
        });
