        // ---- CHÓ NGHĨ GÌ (G 05/11 "add simple emoji thought cho chó"): đám mây kính mờ nhỏ trên đầu chó, MỘT emoji theo việc chó đang làm — hiện ~4,5 s lúc
        //      đổi việc (cách nhau ≥ 12 s, trừ lúc được vuốt / chủ gọi / giũ nước) và thỉnh thoảng (25–50 s một lần) khi đang yên. Ngủ (Zzz — animals/dog/shelter.js)
        //      thì không hiện. Dãy ngẫu nhiên riêng (mulberry32): không đổi dãy Math.random của các con khác trong lượt 'wild'. Chủ: đọc mặt worldSee('engineer') ----
        const DOG_THINK = {   // việc → các emoji (chọn 1)
          lie: ['🔥', '🦴', '😌'], doze: ['💤'], getup: ['🥱'], follow: ['❤️', '🐾'], sniff: ['👃', '🌼', '🐾'], drink: ['💧'], zoom: ['⚡', '🎾'], perch: ['👀'],
          stars: ['✨', '🌙'], herdHome: ['🐄'], herd: ['🐄'], return: ['🏕️'], rain: ['🌧️', '☔'], shakeOff: ['💦'], toFire: ['🔥'], pet: ['🥰', '❤️'], called: ['❤️'], fish: ['🍖', '🐟']
        };
        const DOG_THINK_NOW = new Set(['pet', 'called', 'shakeOff']), DOG_THINK_SHOW = 4.5, DOG_THINK_PX = 128;   // hiện ngay dù vừa nghĩ · giây hiện · cỡ vẽ (đv canvas)
        const DTH = { key: null, show: 0, gap: 0, next: 20, emo: '', rnd: mulberry32(5821) };
        function dogThinkKey() {   // chó đang "nghĩ" về gì · null: không có gì để nghĩ (đang xoay vòng nằm xuống, đi vào xe lúc tạnh…)
          const B = dogBrain.state, D = dogRain.st, EF = worldSee('engineer'), rain = liveWeather.state.raining;
          if (D === 'in' || D === 'porch') return B.dozing ? null : rain ? 'rain' : null;   // nằm trong xe / dưới hiên: ngủ thì Zzz
          if (D === 'shakeOff' || D === 'herd' || D === 'toFire') return D;
          if (D) return rain ? 'rain' : null;
          if (EF && EF.petting) return 'pet';
          if (EF && EF.phase === 'toDog') return 'called';
          if (B.st === 'lie') return B.dozing ? 'doze' : EF && EF.phase === 'eatFish' ? 'fish' : 'lie';
          return DOG_THINK[B.st] ? B.st : null;
        }
        const dtCanvas = document.createElement('canvas'), dtCtx = dtCanvas.getContext('2d'); let dtRes = 0, dtEmo = '';
        const dtTex = new THREE.CanvasTexture(dtCanvas); dtTex.colorSpace = THREE.SRGBColorSpace; dtTex.generateMipmaps = false; dtTex.minFilter = THREE.LinearFilter;
        const dogThinkSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dtTex, transparent: true, depthWrite: false, depthTest: false }));
        dogThinkSprite.name = 'Chó nghĩ (emoji)'; dogThinkSprite.center.set(0.5, 0); dogThinkSprite.scale.set(0.9, 0.9, 1); dogThinkSprite.renderOrder = 20;
        dogThinkSprite.visible = false; dogThinkSprite.layers.set(LAYER_SHARP); scene.add(dogThinkSprite);   // lớp nét: không mờ theo hậu cảnh (core/lens.js)
        function dogThinkDraw(emo, res) {   // mây = các múi tròn hợp lại + 2 bong bóng nhỏ dẫn xuống đầu · viền mảnh, ruột trắng 42% (kính mờ như mây của kỹ sư)
          dtCanvas.width = dtCanvas.height = Math.round(DOG_THINK_PX * res); dtTex.dispose();
          const x = dtCtx, L = [[64, 50, 30], [40, 57, 21], [88, 57, 21], [51, 35, 19], [78, 36, 19], [64, 70, 19], [54, 100, 8], [60, 118, 5]];
          x.setTransform(dtCanvas.width / DOG_THINK_PX, 0, 0, dtCanvas.height / DOG_THINK_PX, 0, 0); x.clearRect(0, 0, DOG_THINK_PX, DOG_THINK_PX);
          const path = g => { x.beginPath(); for (const [cx, cy, r] of L) { x.moveTo(cx + r + g, cy); x.arc(cx, cy, r + g, 0, TAU); } };
          x.fillStyle = 'rgba(40, 52, 64, 0.38)'; path(2); x.fill();
          x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; path(0); x.fill(); x.globalCompositeOperation = 'source-over';
          x.fillStyle = 'rgba(255, 255, 255, 0.42)'; path(0); x.fill();
          x.font = '40px Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#17222c'; x.fillText(emo, 64, 53);
          dtTex.needsUpdate = true;
        }
        function dogThinkRes() {   // điểm ảnh màn hình / 1 đv canvas (camera trực giao) — chữ nét như nhãn kỹ sư (engineer/mind/thought-bubble.js bubbleFitRes)
          if (!camera.isOrthographicCamera) return 2;
          const ppu = renderer.getPixelRatio() * Math.max(1, W()) * camera.zoom / (camera.right - camera.left);
          return Math.min(4, Math.max(1, ppu * dogThinkSprite.scale.x / DOG_THINK_PX));
        }
        function dogThinkPop(key) { const L = DOG_THINK[key]; DTH.emo = L[Math.floor(DTH.rnd() * L.length)]; DTH.show = DOG_THINK_SHOW; DTH.gap = 0; DTH.next = 25 + 25 * DTH.rnd(); }
        const _dtP = new THREE.Vector3();
        worldTick('wild', 41, (dt, t) => {   // sau hành vi chó (lượt 40): chọn emoji, đặt mây trên đầu
          if (!dogObj) return;
          const key = dogObj.visible !== false ? dogThinkKey() : null;
          DTH.gap += dt; DTH.next -= dt; DTH.show -= dt;
          const topic = key === 'doze' || key === 'fish' ? 'lie' : key;   // nằm ↔ lim dim ↔ thèm cá: cùng một chuyện (không bật mây mỗi lần đổi)
          if (topic !== DTH.key) { DTH.key = topic; if (key && (DOG_THINK_NOW.has(key) || DTH.gap > 12)) dogThinkPop(key); else if (!key) DTH.show = Math.min(DTH.show, 0.5); }
          else if (key && DTH.show <= 0 && DTH.next <= 0) dogThinkPop(key);
          const S = dogThinkSprite; S.visible = DTH.show > 0; if (!S.visible) return;
          const res = dogThinkRes(); if (DTH.emo !== dtEmo || Math.abs(res / dtRes - 1) > 0.15) { dtEmo = DTH.emo; dtRes = res; dogThinkDraw(DTH.emo, res); }
          dogObj.userData.head.getWorldPosition(_dtP); S.position.set(_dtP.x, _dtP.y + 0.1 + Math.sin(t * 3) * 0.02, _dtP.z);
          S.material.opacity = Math.max(0, Math.min(1, (DOG_THINK_SHOW - DTH.show) / 0.25, DTH.show / 0.5));
        });
