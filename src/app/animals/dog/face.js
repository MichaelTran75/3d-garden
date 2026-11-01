        // ==== MẶT CÔNG KHAI CỦA CHÓ (core/world.js): đơn vị khác chỉ đọc qua worldSee('dog') — không đụng dogObj / dogBrain / dogRain ----
        worldFace('dog', {
          get pos() { return dogObj.position; },                       // (Vector3 sống — đọc, không ghi)
          get yaw() { return dogObj.rotation.y; },
          get head() { return dogObj.userData.head; },                 // đầu (Object3D): nhìn theo, xoa đầu
          get object() { return dogObj; },                             // cả thân (Object3D): chọn, ẩn hiện
          get shown() { return dogObj.visible !== false; },
          get shelter() { return dogRain.st; },                        // trú mưa / ngủ trong xe: null | toPorch | toDoor | toStep | in | toFire | herd …
          get st() { return dogBrain.state.st; },                      // việc: lie, follow, sniff, drink, zoom, stars, return …
          get k() { return dogBrain.state.k; },                        // đã làm việc này bao lâu (s)
          get shake() { return dogBrain.state.shake; },                // đang giũ nước (> 0)
          get patReady() { return dogBrain.state.patReady; },          // đã ngồi đúng chỗ chủ gọi xoa đầu
          get herdUsed() { return dogBrain.herd.used; },               // lượt lùa bò đang mở (từ lúc nghe mưa tới lúc tạnh)
          get herdOn() { return dogBrain.herd.on; },                   // đang lùa (chưa xong)
          get herdDone() { return dogBrain.herd.done; },               // lùa xong lượt này: con còn ngoài bãi tự về
          get herdPh() { return dogBrain.herd.ph; },                   // alert | outrun | lift | fetch | hold
          get herdGrp() { return dogBrain.herd.grp; },                 // nhóm bò chó đang nhắm (pha fetch: vừa bước vào cho cả nhóm đi) — đọc, không ghi
          herdAvail: () => dogBrain.herdAvail(),                       // chó rảnh, sắp đi lùa: bò ngoài bãi đứng chờ
          pettable: () => dogBrain.pettable(),                         // nằm sưởi đúng chỗ — vuốt được
          zoomSpot: () => dogBrain.zoomSpot(),                         // tâm bãi chạy vòng
        });
