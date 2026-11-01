        // ==== MẶT ĐỨNG cowY (G 01/11 — dời NGUYÊN VĂN từ animals/cows/herd-hut.js: ~43 tệp dùng — thú, chim, côn trùng, kỹ sư, đồ trại, công trình) ====
        // Đứng ngay sau world/solar-buildings-road.js: cowY gọi damDeckY (const ở world/hydro-dam.js — mặt đi trên đập), roadContains (hàm, đọc hằng roadHalf /
        // roadStartX… của world/solar-buildings-road.js), roadSurfaceAt (hàm ở world/street-lamps.js, đọc campusRoad.userData.road gán lúc dựng đường),
        // surfaceY (hàm, core/sky-sun-moon.js), x2gi / z2gj (core/helpers.js) ⇒ từ tệp kế tiếp trở đi gọi lúc dựng cảnh được (sớm hơn = vướng TDZ / đường chưa dựng).
        // độ cao mặt đứng cho mọi con vật + kỹ sư: trên đập/dốc nối = mặt đường đập · trên đường nội bộ = mặt đường (đắp cao hơn ô đất tới 1,3 m —
        // G 16/10: chim đứng mép đường bị lún; roadSurfaceAt ở world/street-lamps.js) · còn lại = ô đất
        const cowY = (x, z) => { const d = damDeckY(x, z); if (d !== null) return d; const s = surfaceY(Math.round(x2gi(x)), Math.round(z2gj(z))); if (!roadContains(x, z)) return s; const r = roadSurfaceAt(x, z).y; return r > s ? r : s; };
