        // ---- CHÓ TRÚ MƯA / NGỦ ĐÊM: chạy vào trong xe nằm ở khe sàn cabin; chỗ nằm sưởi cạnh bếp lửa; Zzz khi ngủ ----
        const dogLie = CAMP.fire.g.position.clone().add(new THREE.Vector3(Math.cos(-0.8) * 1.8, 0, Math.sin(-0.8) * 1.8));   // kiểm lưới: góc −0,5 / 1,55 m cũ ⇒ chó nằm lấn chân giá treo nồi + mõm chạm vòng đá bếp; −1,2 ⇒ đuôi lấn đống củi. Quét quanh bếp bằng dấu chân phủ cả đầu + đuôi: −0,7 … −0,9 rad, 1,6–2,0 m trống
        const dogFireField = buildFlowField(dogLie.x, dogLie.z);   // bảng đường về chỗ nằm cạnh lửa (tới cửa xe: vanDoorField, van/face.js)
        const dogRain = { st: null, t: 0, yaw: 0 };
        // Zzz của chó: 3 chữ z nhỏ bay ngắn ngay trên đầu chó đang ngủ (nhìn qua vách xe mờ, rõ nhất ở chế độ xem xuyên)
        const dogZzzGroup = new THREE.Group(); dogZzzGroup.visible = false; dogZzzGroup.name = 'Zzz của chó'; scene.add(dogZzzGroup);
        const dogZzz = [], _dogHead = new THREE.Vector3();
        {
          const paint = ctx => { ctx.font = 'bold 48px Outfit, sans-serif'; ctx.fillStyle = '#E2D6C0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#243240'; ctx.shadowBlur = 6 * ctx.getTransform().a; ctx.fillText('z', 32, 34); };   // lớp chữ HTML (core/html-text.js)
          for (let n = 0; n < 3; n++) { const sp = htmlSprite(new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false })), { tone: 'raw', paint, w: 64, h: 64 }); dogZzzGroup.add(sp); dogZzz.push({ m: sp, ph: n / 3 }); }
        }
        if (!liveWeather.wildlifeAwake) {   // mở trang lúc tối: chó đã nằm ngủ sẵn trong xe
          dogRain.st = 'in'; dogObj.position.set(VAN.dogBed.x, VAN.doorIn.y + 0.02 * CAMP_SCALE, VAN.dogBed.z); dogObj.rotation.y = Math.atan2(-VAN.out.z, VAN.out.x);
        }
        // (chó vào xe khi mưa / tối: animals/dog/brain.js — shelterTick)
