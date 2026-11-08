        // Fishing countdown + fish status (chữ vàng phía trên) và suy nghĩ của kỹ sư (trong ĐÁM MÂY suy nghĩ, 2 bong bóng nhỏ trỏ xuống đầu) dùng chung 1 nhãn.
        // thẻ "👷🏻‍♂️ việc đang làm" (trước ở ui/follow-tags.js) thành DÒNG ĐẦU đám mây; không có suy nghĩ mà nút
        // Nhãn đang bật thì hiện đám mây gọn chỉ 1 dòng đó. Đám mây đặt theo ĐỈNH ĐẦU (thế giới) — trước theo trục thân nên nằm / ngồi bệt thì lệch ngang.
        // đám mây suy nghĩ (chữ + mây + bong bóng đuôi) nhỏ 50% (THOUGHT_K), thu về đáy giữa — đuôi vẫn trỏ xuống đầu; chữ câu cá giữ cỡ cũ.
        // canvas vẽ ĐÚNG số điểm ảnh bong bóng chiếm trên màn hình (BUBBLE_RES theo mức zoom × tỉ lệ điểm ảnh
        //  thiết bị, vẽ lại khi zoom đổi > 10%), không mipmap ⇒ 1 điểm ảnh canvas = 1 điểm ảnh màn hình, chữ nét như chữ trang web. Bản cũ cố định ×2 (thử ×4 cũng vậy):
        //  bong bóng nhỏ trên màn hình thì card đồ hoạ thu ảnh qua mipmap ⇒ chữ nhoè bất kể canvas to cỡ nào.
        const BUBBLE_W = 640, BUBBLE_H = 352, THOUGHT_K = 0.5; let BUBBLE_RES = 2;
        const checkBubbleCanvas = document.createElement('canvas'); checkBubbleCanvas.width = BUBBLE_W * BUBBLE_RES; checkBubbleCanvas.height = BUBBLE_H * BUBBLE_RES;
        const cbCtx = checkBubbleCanvas.getContext('2d');
        const checkBubbleTex = new THREE.CanvasTexture(checkBubbleCanvas); checkBubbleTex.colorSpace = THREE.SRGBColorSpace; checkBubbleTex.generateMipmaps = false; checkBubbleTex.minFilter = THREE.LinearFilter;
        const checkBubbleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: checkBubbleTex, transparent: true, opacity: 0.97, depthWrite: false, depthTest: false }));
        htmlSprite(checkBubbleSprite, { tone: false }); checkBubbleSprite.name = 'Nhãn Engineer · câu cá và đám mây suy nghĩ';   // lớp chữ HTML (core/html-text.js): chép ảnh canvas đúng điểm ảnh · không tone map: ô lớn vẽ lại mỗi giây lúc câu cá (đổi từng điểm ảnh 3,7–5,9 ms), mây trong mờ trên cỏ lệch bản cũ ≤ 5 mức màu
        checkBubbleSprite.layers.set(LAYER_SHARP);   // lớp nét: không mờ theo hậu cảnh (core/lens.js)
        const BUBBLE_K = 0.65;   // cả nhãn (chữ + đám mây) nhỏ lại 35%
        checkBubbleSprite.scale.set(8.5 * BUBBLE_K / ENGINEER_SIZE, 4.675 * BUBBLE_K / ENGINEER_SIZE, 1.0); checkBubbleSprite.center.set(0.5, 0);   // chia ENGINEER_SIZE: không nhỏ thêm theo người
        checkBubbleSprite.position.set(0, 2.9, 0); checkBubbleSprite.visible = false; engObj.g.add(checkBubbleSprite);
        // ĐẾM NGƯỢC VIỆC ĐANG LÀM (engineer/mind/countdown.js) — sprite nhỏ riêng phía trên đám mây (không có mây: ngay trên đầu), cùng cỡ chữ / màu với
        //  đếm ngược câu cá; vẽ lại mỗi giây chỉ ô nhỏ này, không vẽ lại cả đám mây
        const CD_W = 320, CD_H = 48;
        const cdCanvas = document.createElement('canvas'), cdCtx = cdCanvas.getContext('2d');
        const cdTex = new THREE.CanvasTexture(cdCanvas); cdTex.colorSpace = THREE.SRGBColorSpace; cdTex.generateMipmaps = false; cdTex.minFilter = THREE.LinearFilter;
        const cdSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: cdTex, transparent: true, opacity: 0.97, depthWrite: false, depthTest: false }));
        htmlSprite(cdSprite, { tone: false }); cdSprite.name = 'Nhãn Engineer · đếm ngược việc đang làm'; cdSprite.layers.set(LAYER_SHARP); cdSprite.visible = false; engObj.g.add(cdSprite);
        cdSprite.scale.set(checkBubbleSprite.scale.x * CD_W / BUBBLE_W, checkBubbleSprite.scale.y * CD_H / BUBBLE_H, 1);
        function wrapText(ctx, text, maxW) {   // ngắt dòng theo từ cho tiếng Việt (khoảng trắng)
          const words = text.split(' '), lines = []; let line = '';
          for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
          if (line) lines.push(line); return lines;
        }
        // Đám mây = hợp của hình chữ nhật bo + các "múi" tròn quanh mép. Vẽ 2 lượt: viền (bán kính + nét) rồi ruột trắng đè lên → chỉ còn đường viền ngoài.
        function drawThoughtCloud(ctx, header, message, bottom, speech) {   // speech: BÓNG THOẠI (câu thốt ra — miệng nói theo, engineer/body/face.js) thay đám mây
          let size = 25, lines = [];
          if (message) for (; size >= 19; size--) { ctx.font = '600 ' + size + 'px Arial, sans-serif'; lines = wrapText(ctx, message, 470); if (lines.length <= 3) break; }
          const lineH = size + 7, msgW = lines.length ? Math.max(...lines.map(l => ctx.measureText(l).width)) : 0, only = !lines.length; let hs = only ? 23 : 19;   // only: chỉ dòng việc đang làm
          for (; ; hs--) { ctx.font = (only ? '600 ' : '') + hs + 'px Arial, sans-serif'; if (hs <= 15 || ctx.measureText(header).width <= 520) break; }   // dòng đầu dài thu chữ cho vừa mây (trước tràn "km/h" ra mép)
          const headW = ctx.measureText(header).width;
          const w = Math.min(560, Math.max(only ? 150 : 250, Math.max(msgW, headW) + 56)), h = only ? 50 : 30 + lines.length * lineH + 18;
          const x0 = BUBBLE_W / 2 - w / 2, x1 = x0 + w, y1 = bottom, y0 = y1 - h;
          const lobes = [];
          const nTop = Math.max(3, Math.round(w / 78));
          for (let k = 0; k < nTop; k++) { const u = (k + 0.5) / nTop, r = 27 + ((k * 7) % 3) * 4; lobes.push([x0 + 18 + u * (w - 36), y0 + 6, r]); }          // múi trên
          for (let k = 0; k < nTop - 1; k++) { const u = (k + 0.5) / (nTop - 1), r = 22 + ((k * 5) % 3) * 4; lobes.push([x0 + 30 + u * (w - 60), y1 - 4, r]); }  // múi dưới (nhỏ hơn)
          for (const [sx, xx] of [[-1, x0], [1, x1]]) { const r = Math.min(46, h * 0.42); lobes.push([xx - sx * 10, (y0 + y1) / 2, r]); lobes.push([xx - sx * 22, y0 + h * 0.22, r * 0.72]); lobes.push([xx - sx * 22, y1 - h * 0.2, r * 0.66]); }
          const tail = [[BUBBLE_W / 2 - 34, y1 + 26, 11], [BUBBLE_W / 2 - 56, y1 + 46, 6.5]];   // bong bóng nhỏ dẫn xuống đầu kỹ sư
          const path = (grow) => {   // hợp các hình (chữ nhật bo + múi + bong bóng đuôi) thành 1 path
            ctx.beginPath(); ctx.roundRect(x0 - grow, y0 - grow, w + grow * 2, h + grow * 2, 24 + grow);
            if (speech) { const bx = BUBBLE_W / 2 - 18; ctx.moveTo(bx - 22 - grow, y1 - 4); ctx.lineTo(bx + 14 + grow, y1 - 4); ctx.lineTo(bx - 36 - grow * 1.4, y1 + 46 + grow * 1.8); ctx.closePath(); }   // đuôi nhọn chỉ xuống miệng (cùng chiều quay với khung — tô nonzero không thủng)
            else for (const [x, y, r] of lobes.concat(tail)) { ctx.moveTo(x + r + grow, y); ctx.arc(x, y, r + grow, 0, Math.PI * 2); }
          };
          // NỀN KÍNH MỜ (frosted) 75% trong suốt: viền mảnh → khoét ruột → phủ trắng 25% + vệt sáng phía trên + hạt mờ li ti (cố định theo hạt giống, không nhấp nháy khi vẽ lại)
          ctx.fillStyle = 'rgba(40, 52, 64, 0.38)'; path(2.5); ctx.fill();
          ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000'; path(0); ctx.fill(); ctx.globalCompositeOperation = 'source-over';
          ctx.save(); path(0); ctx.clip();
          ctx.fillStyle = 'rgba(255, 255, 255, 0.25)'; ctx.fillRect(0, 0, BUBBLE_W, BUBBLE_H);
          const sheen = ctx.createLinearGradient(0, y0 - 40, 0, y1); sheen.addColorStop(0, 'rgba(255, 255, 255, 0.16)'); sheen.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = sheen; ctx.fillRect(0, 0, BUBBLE_W, BUBBLE_H);
          const rnd = mulberry32(7331);
          for (let k = 0; k < 900; k++) { const v = rnd(); ctx.fillStyle = v < 0.6 ? 'rgba(255, 255, 255, ' + (0.10 + 0.14 * rnd()).toFixed(2) + ')' : 'rgba(150, 165, 178, ' + (0.06 + 0.08 * rnd()).toFixed(2) + ')'; ctx.fillRect(x0 - 50 + rnd() * (w + 100), y0 - 50 + rnd() * (h + 110), 1 + rnd() * 1.6, 1 + rnd() * 1.6); }
          ctx.restore();
          // chữ tối + quầng trắng mỏng: vẫn đọc rõ trên nền gần trong suốt (cỏ, nước, mái xe)
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
          const halo = (txt, x, y, fill) => { ctx.fillStyle = fill; ctx.fillText(txt, x, y); };   // bỏ viền trắng quanh chữ (làm chữ nhoè)
          ctx.font = (only ? '600 ' : '') + hs + 'px Arial, sans-serif'; halo(header, BUBBLE_W / 2, only ? (y0 + y1) / 2 : y0 + 17, '#17222c');   // dòng đầu cùng màu đậm (xám xanh cũ chìm vào kính mờ trên nền cỏ)
          ctx.font = '600 ' + size + 'px Arial, sans-serif';
          lines.forEach((l, i) => halo(l, BUBBLE_W / 2, y0 + 30 + lineH * (i + 0.5) + 4, '#17222c'));
          return { x0, y0, x1, y1, lines };
        }
        let engineerLabelKey = ''; const _tbP = new THREE.Vector3(), _tbS = new THREE.Vector3();
        function bubbleFitRes() {   // điểm ảnh màn hình (thật) / 1 đv canvas; đổi > 10% thì đổi cỡ canvas + vẽ lại
          if (!camera.isOrthographicCamera) return;
          const ppu = htDpr() * Math.max(1, W()) * camera.zoom / (camera.right - camera.left);   // điểm ảnh thật / 1 đv thế giới (camera trực giao) · hiện ở lớp chữ HTML ⇒ theo dpr màn hình, không theo khung WebGL
          const res = Math.min(6, Math.max(1, checkBubbleSprite.getWorldScale(_tbS).x * ppu / BUBBLE_W));
          if (Math.abs(res / BUBBLE_RES - 1) < 0.1) return;
          BUBBLE_RES = res; checkBubbleCanvas.width = Math.round(BUBBLE_W * res); checkBubbleCanvas.height = Math.round(BUBBLE_H * res);
          checkBubbleTex.dispose(); engineerLabelKey = '';   // cỡ ảnh đổi ⇒ cấp lại bộ nhớ ảnh trên card
        }
        const fmtCountdown = s => s >= 3600 ? Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
          : s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : s + 's';
        let cdKey = ''; const _cdP = new THREE.Vector3();
        function drawEngineerCountdown(t, top) {   // top: mép trên phần đang hiện của nhãn (toạ độ canvas nhãn) · null: nhãn ẩn ⇒ ngay trên đầu
          const e = engObj, cd = engCountdown(e);   // gọi mỗi khung: số hiện chạy đều
          cdSprite.visible = !!cd && !droneToy.bub.visible;   // bay drone: số nằm trong OSD khung camera (engineer/tasks/drone.js)
          if (!cdSprite.visible) return;
          bubbleFitRes();
          const yc = top === null ? 306 : Math.max(CD_H / 2, top - CD_H / 2 - 4);
          e.head.getWorldPosition(_cdP); _cdP.y += 0.78 + Math.sin(t * 3.5) * 0.05 + (BUBBLE_H - yc) / BUBBLE_H * checkBubbleSprite.getWorldScale(_tbS).y;
          cdSprite.position.copy(e.g.worldToLocal(_cdP));
          const key = cd.icon + cd.sec + '|' + BUBBLE_RES; if (key === cdKey) return; cdKey = key;
          if (cdCanvas.width !== Math.round(CD_W * BUBBLE_RES)) { cdCanvas.width = Math.round(CD_W * BUBBLE_RES); cdCanvas.height = Math.round(CD_H * BUBBLE_RES); cdTex.dispose(); }
          cdCtx.setTransform(cdCanvas.width / CD_W, 0, 0, cdCanvas.height / CD_H, 0, 0); cdCtx.clearRect(0, 0, CD_W, CD_H);
          const text = cd.icon + ' ' + fmtCountdown(cd.sec);
          cdCtx.textAlign = 'center'; cdCtx.textBaseline = 'middle'; cdCtx.font = '34px Arial, sans-serif';
          cdCtx.lineWidth = 5; cdCtx.strokeStyle = htToneCol('rgba(20, 28, 36, 0.55)'); cdCtx.strokeText(text, CD_W / 2, CD_H / 2);   // màu đã tone map như sprite WebGL cũ (ô HTML tone: false)
          cdCtx.fillStyle = htToneCol('#ffd34a'); cdCtx.fillText(text, CD_W / 2, CD_H / 2);
          cdTex.needsUpdate = true;
        }
        function drawEngineerLabel(t = 0, now = Date.now()) {
          const fishing = engObj.phase === 'fish', thought = engObj.phase === 'check' ? (checkBubbleSprite.userData.weatherThought || checkBubbleSprite.userData.thought) : checkBubbleSprite.userData.thought;
          const showThought = !!thought && (now < thoughtUntil || engObj.phase === 'check');
          const lab = (SIM_DO[simDoing(engObj)] || {}).lab || 'Đi lại', tagOn = labelGroup.visible && shownInScene(engObj.g);   // việc đang làm (bảng Kỹ sư) · nút Nhãn
          checkBubbleSprite.visible = (fishing || showThought || tagOn) && engObj.phase !== 'drone';   // bay drone: bong bóng màn hình camera thay chỗ (engineer/tasks/drone.js)
          engObj.head.getWorldPosition(_tbP); _tbP.y += 0.78 + Math.sin(t * 3.5) * 0.05; checkBubbleSprite.position.copy(engObj.g.worldToLocal(_tbP));   // trên đỉnh đầu dù đứng, ngồi bệt hay nằm
          if (!checkBubbleSprite.visible) { drawEngineerCountdown(t, null); return; }
          bubbleFitRes();
          const seconds = fishing ? Math.max(0, Math.ceil(engObj.timer)) : -1;
          const key = seconds + '|' + (showThought ? thought.revision : -1) + '|' + (fishing ? fishingStatusText() : '') + '|' + lab;
          if (key === engineerLabelKey) { drawEngineerCountdown(t, checkBubbleSprite.userData.top ?? null); return; } engineerLabelKey = key;
          cbCtx.setTransform(checkBubbleCanvas.width / BUBBLE_W, 0, 0, checkBubbleCanvas.height / BUBBLE_H, 0, 0); cbCtx.clearRect(0, 0, BUBBLE_W, BUBBLE_H);
          cbCtx.textAlign = 'center'; cbCtx.textBaseline = 'middle';
          const rows = [], ys = (y) => BUBBLE_H - (BUBBLE_H - y) * THOUGHT_K;   // vẽ đám mây ở tỉ lệ THOUGHT_K quanh đáy giữa canvas; ys đổi toạ độ y lúc vẽ → toạ độ canvas thật
          let cloud = null, top = null;
          if (showThought) {
            cbCtx.save(); cbCtx.translate(BUBBLE_W / 2, BUBBLE_H); cbCtx.scale(THOUGHT_K, THOUGHT_K); cbCtx.translate(-BUBBLE_W / 2, -BUBBLE_H);
            const rest = (thought.header || '').split(' · ').filter(x => x && x !== lab).join(' · '), head = '👷🏻‍♂️ ' + lab + (rest ? ' · ' + rest : '');   // dòng đầu: việc đang làm + giờ / buổi của suy nghĩ (bỏ chữ việc lặp lại)
            const c = drawThoughtCloud(cbCtx, head, thought.message, 294, thought.kind === 'react' || thought.kind === 'event'); cbCtx.restore();
            cloud = { ...c, y0: ys(c.y0), y1: ys(c.y1) }; top = ys(c.y0 - 29);   // múi trên nhô ~29 trên mép chữ nhật
            rows.push({ type: 'weather', text: head, y: ys(c.y0 + 17) }, ...cloud.lines.map((l, i) => ({ type: 'thought', text: l, y: 0 })));
          } else if (tagOn && !fishing) {   // không có suy nghĩ: đám mây gọn chỉ dòng việc đang làm
            cbCtx.save(); cbCtx.translate(BUBBLE_W / 2, BUBBLE_H); cbCtx.scale(THOUGHT_K, THOUGHT_K); cbCtx.translate(-BUBBLE_W / 2, -BUBBLE_H);
            const c = drawThoughtCloud(cbCtx, '👷🏻‍♂️ ' + lab, '', 294, false); cbCtx.restore(); top = ys(c.y0 - 29);
          }
          if (fishing) {   // đếm ngược + trạng thái cá: phía trên đám mây (hoặc sát đầu nếu không có suy nghĩ)
            const top = cloud ? Math.max(30, cloud.y0 - 82) : 260;
            for (const [type, text, y, size, color] of [['countdown', '🎣 ' + fmtCountdown(seconds), top, 34, '#ffd34a'], ['fish', fishingStatusText(), top + 46, 34, '#65b3ff']]) {
              let s = size; cbCtx.font = s + 'px Arial, sans-serif';
              while (cbCtx.measureText(text).width > 600 && s > 17) { s--; cbCtx.font = s + 'px Arial, sans-serif'; }
              cbCtx.lineWidth = 5; cbCtx.strokeStyle = 'rgba(20, 28, 36, 0.55)'; cbCtx.strokeText(text, 320, y);
              cbCtx.fillStyle = color; cbCtx.fillText(text, 320, y); rows.unshift({ type, text, y });
            }
          }
          checkBubbleSprite.userData.rows = rows; checkBubbleSprite.userData.top = top;
          checkBubbleTex.needsUpdate = true;
          drawEngineerCountdown(t, top);
        }

