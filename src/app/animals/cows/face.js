        // ==== MẶT CÔNG KHAI CỦA ĐÀN BÒ + CHUỒNG (core/world.js): worldSee('cows') ----
        worldFace('cows', {
          get list() { return cows; },                                 // từng con { x, z, ang, mode, leg, … } — đọc, không ghi
          get hut() { return cowHut; },                                // chuồng: x, y, z, W, D, door
          get hutRect() { return cowHutRect; },                        // khung chuồng { x0, x1, z0, z1 } | null
          get blocked() { return cowBlocked; },                        // lưới bò đi được (1 = cấm; mặt đập = cầu) — chó lùa / về xe cũng đi lưới này
          get hutField() { return hutField; },                         // đường về cửa chuồng (bảng DP trên lưới bò)
          wantHome: () => cowHutWanted(),                              // chiều tối / mưa: bò muốn về chuồng
        });
