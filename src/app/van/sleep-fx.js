        // ---- hiệu ứng ngủ Zzz bay lên (Zzz sleep particles) ----
        const zzzs = [];
        const zzzGroup = new THREE.Group(); zzzGroup.visible = false; caravanObj.add(zzzGroup);
        {
          const c = document.createElement('canvas'); c.width = c.height = 64; const ctx = c.getContext('2d');
          ctx.font = 'bold 48px Outfit, sans-serif'; ctx.fillStyle = '#E2D6C0'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.shadowColor = '#243240'; ctx.shadowBlur = 6; ctx.fillText('Z', 32, 32);
          const zTex = new THREE.CanvasTexture(c);
          for (let n = 0; n < 3; n++) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: zTex, transparent: true, opacity: 0, depthWrite: false })); zzzGroup.add(sp); zzzs.push({ m: sp, ph: n * 1.6 }); }
        }

        // ---- bảng đếm ngược giấc ngủ (sleep timer UI card) ----
        const sleepCanvas = document.createElement('canvas'); sleepCanvas.width = 256; sleepCanvas.height = 64;
        const sleepCtx = sleepCanvas.getContext('2d');
        const sleepTex = new THREE.CanvasTexture(sleepCanvas);
        const sleepSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: sleepTex, transparent: true, opacity: 0.92, depthWrite: false, depthTest: false }));
        sleepSprite.scale.set(7.5, 1.87, 1.0); sleepSprite.position.set(caravanObj.userData.interior.bed.center[0] - 0.15, 4.4, caravanObj.userData.interior.bed.center[1]); sleepSprite.visible = false;
        caravanObj.add(sleepSprite);
        let lastSleepStr = '';   // chỉ vẽ lại canvas khi chuỗi giờ đổi (1 lần/giây thay vì mỗi frame)

