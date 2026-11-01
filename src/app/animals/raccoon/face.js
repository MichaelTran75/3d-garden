        // ==== MẶT CÔNG KHAI CỦA GẤU MÈO (core/world.js): worldSee('raccoon') ----
        worldFace('raccoon', {
          get pos() { return raccoonObj.position; },
          get shown() { return raccoonObj.visible; },                  // đang ở ngoài (ban ngày ngủ trong hang: ẩn)
          get object() { return raccoonObj; },
          get swipe() { return raccoonBrain.state.swipe || null; },     // cú vồ gần nhất { prey: con ong / bướm, t } — con mồi tự né (bees.js, butterflies.js)
        });
