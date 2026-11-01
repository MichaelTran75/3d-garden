        // ==== MẶT CÔNG KHAI CỦA ĐÀN CÒ (core/world.js): worldSee('storks') ----
        worldFace('storks', {
          get birds() { return birds; },                               // từng con { m, state, foot, … } — đọc, không ghi
          get group() { return storksGroup; },                         // cả đàn (Object3D)
          get awake() { return storksAwake(); },                       // giờ cò ra đồng (6–19 h, không mưa)
        });
        worldHear('gardenGone', () => { birds.length = 0; storkDefinition = null; });   // trang đóng (core/boot.js destroyGarden): thả dữ liệu đàn cò
