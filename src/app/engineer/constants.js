        // ---- kỹ sư đi tuần & kiểm tra trạm khí tượng ----
        const hiVis = new THREE.MeshLambertMaterial({ color: 0xf0a500 }), engPants = new THREE.MeshLambertMaterial({ color: 0x3a4a63 }),
          engSkin = new THREE.MeshLambertMaterial({ color: 0xe0ac80 }), engHelm = new THREE.MeshLambertMaterial({ color: 0xf5d020 }),
          engBoot = new THREE.MeshLambertMaterial({ color: 0x2a2622 }), engPad = new THREE.MeshLambertMaterial({ color: 0xE2D6C0 }),
          rodMat = new THREE.MeshLambertMaterial({ color: 0x5a4632 });
        const CAMP_SCALE = 0.90, ENGINEER_SIZE = 0.95 * 0.95, ENGINEER_BASE_SCALE = 1.026 * ENGINEER_SIZE;   // kỹ sư nhỏ đi 5% hai lần (ghế, bàn, giường giữ nguyên)
        // Độ cao đặt gốc kỹ sư theo cỡ người: đế giày ở y cục bộ 0,30 → đứng thì gốc thấp hơn mặt đất đúng ENG_FEET;
        // mông khi ngồi ở y cục bộ ~1,06 → người nhỏ đi thì mông thấp xuống, nâng gốc ENG_SIT_LIFT để vẫn ngồi đúng mặt ghế như trước.
        const ENG_FEET = 0.30 * ENGINEER_BASE_SCALE * CAMP_SCALE, ENG_SIT_LIFT = 1.06 * 1.026 * (1 - ENGINEER_SIZE) * CAMP_SCALE;
        const engSitDrop = (k, seatDrop = 0.53 * CAMP_SCALE) => ENG_FEET * (1 - k) + (seatDrop - ENG_SIT_LIFT) * k;   // k: 0 đứng → 1 ngồi hẳn
