        // ---- hiệu ứng ngủ Zzz bay lên (Zzz sleep particles) — của KỸ SƯ (engineer/tasks/sleep.js vẽ), gắn vào thân xe qua chỗ chạm VAN.mount ----
        const zzzs = [];
        const zzzGroup = new THREE.Group(); zzzGroup.visible = false; VAN.mount(zzzGroup);
        {
          const paint = ctx => { ctx.font = 'bold 48px Outfit, sans-serif'; ctx.fillStyle = '#E2D6C0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#243240'; ctx.shadowBlur = 6 * ctx.getTransform().a; ctx.fillText('Z', 32, 32); };   // lớp chữ HTML (core/html-text.js), đơn vị 64 × 64
          for (let n = 0; n < 3; n++) { const sp = htmlSprite(new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false })), { tone: 'raw', paint, w: 64, h: 64 }); zzzGroup.add(sp); zzzs.push({ m: sp, ph: n * 1.6 }); }
        }

        // ---- bảng đếm ngược giấc ngủ (sleep timer UI card) ----
        let sleepStr = '';   // chuỗi giờ đang hiện (engineer/tasks/sleep.js đặt + htmlSpriteDirty)
        const sleepSprite = htmlSprite(new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, opacity: 0.92, depthWrite: false, depthTest: false })), { tone: 'raw', w: 256, h: 64,   // lớp chữ HTML (core/html-text.js)
          paint: x => { x.font = '26px Outfit, sans-serif'; x.fillStyle = '#ffd34a'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(sleepStr, 128, 32); } });
        sleepSprite.scale.set(7.5, 1.87, 1.0); sleepSprite.position.set(VAN.inside.bed.center[0] - 0.15, 3.65, VAN.inside.bed.center[1]); sleepSprite.visible = false;
        VAN.mount(sleepSprite);
        let lastSleepStr = '';   // chỉ vẽ lại canvas khi chuỗi giờ đổi (1 lần/giây thay vì mỗi frame)

