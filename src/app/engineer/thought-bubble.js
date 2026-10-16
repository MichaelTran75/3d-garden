        // Fishing countdown + fish status (chữ vàng phía trên) và suy nghĩ của kỹ sư (trong ĐÁM MÂY suy nghĩ, 2 bong bóng nhỏ trỏ xuống đầu) dùng chung 1 nhãn.
        // G 16/10: đám mây suy nghĩ (chữ + mây + bong bóng đuôi) nhỏ 50% (THOUGHT_K), thu về đáy giữa — đuôi vẫn trỏ xuống đầu; chữ câu cá giữ cỡ cũ.
        // Canvas vẽ gấp đôi điểm ảnh (BUBBLE_RES) ⇒ chữ nhỏ đi vẫn đủ điểm ảnh, zoom gần không nhoè.
        const BUBBLE_W = 640, BUBBLE_H = 352, BUBBLE_RES = 2, THOUGHT_K = 0.5;
        const checkBubbleCanvas = document.createElement('canvas'); checkBubbleCanvas.width = BUBBLE_W * BUBBLE_RES; checkBubbleCanvas.height = BUBBLE_H * BUBBLE_RES;
        const cbCtx = checkBubbleCanvas.getContext('2d');
        const checkBubbleTex = new THREE.CanvasTexture(checkBubbleCanvas); checkBubbleTex.colorSpace = THREE.SRGBColorSpace;
        const checkBubbleSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: checkBubbleTex, transparent: true, opacity: 0.97, depthWrite: false, depthTest: false }));
        checkBubbleSprite.name = 'Nhãn kỹ sư · câu cá và đám mây suy nghĩ';
        const BUBBLE_K = 0.65;   // cả nhãn (chữ + đám mây) nhỏ lại 35%
        checkBubbleSprite.scale.set(8.5 * BUBBLE_K / ENGINEER_SIZE, 4.675 * BUBBLE_K / ENGINEER_SIZE, 1.0); checkBubbleSprite.center.set(0.5, 0);   // chia ENGINEER_SIZE: không nhỏ thêm theo người
        checkBubbleSprite.position.set(0, 2.9, 0); checkBubbleSprite.visible = false; engObj.g.add(checkBubbleSprite);
        function wrapText(ctx, text, maxW) {   // ngắt dòng theo từ cho tiếng Việt (khoảng trắng)
          const words = text.split(' '), lines = []; let line = '';
          for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test; }
          if (line) lines.push(line); return lines;
        }
        // Đám mây = hợp của hình chữ nhật bo + các "múi" tròn quanh mép. Vẽ 2 lượt: viền (bán kính + nét) rồi ruột trắng đè lên → chỉ còn đường viền ngoài.
        function drawThoughtCloud(ctx, header, message, bottom) {
          let size = 25, lines;
          for (; size >= 19; size--) { ctx.font = '600 ' + size + 'px Arial, sans-serif'; lines = wrapText(ctx, message, 470); if (lines.length <= 3) break; }
          const lineH = size + 7, msgW = Math.max(...lines.map(l => ctx.measureText(l).width));
          ctx.font = '19px Arial, sans-serif'; const headW = ctx.measureText(header).width;
          const w = Math.min(560, Math.max(250, Math.max(msgW, headW) + 56)), h = 30 + lines.length * lineH + 18;
          const x0 = BUBBLE_W / 2 - w / 2, x1 = x0 + w, y1 = bottom, y0 = y1 - h;
          const lobes = [];
          const nTop = Math.max(3, Math.round(w / 78));
          for (let k = 0; k < nTop; k++) { const u = (k + 0.5) / nTop, r = 27 + ((k * 7) % 3) * 4; lobes.push([x0 + 18 + u * (w - 36), y0 + 6, r]); }          // múi trên
          for (let k = 0; k < nTop - 1; k++) { const u = (k + 0.5) / (nTop - 1), r = 22 + ((k * 5) % 3) * 4; lobes.push([x0 + 30 + u * (w - 60), y1 - 4, r]); }  // múi dưới (nhỏ hơn)
          for (const [sx, xx] of [[-1, x0], [1, x1]]) { const r = Math.min(46, h * 0.42); lobes.push([xx - sx * 10, (y0 + y1) / 2, r]); lobes.push([xx - sx * 22, y0 + h * 0.22, r * 0.72]); lobes.push([xx - sx * 22, y1 - h * 0.2, r * 0.66]); }
          const tail = [[BUBBLE_W / 2 - 34, y1 + 26, 11], [BUBBLE_W / 2 - 56, y1 + 46, 6.5]];   // bong bóng nhỏ dẫn xuống đầu kỹ sư
          const path = (grow) => {   // hợp các hình (chữ nhật bo + múi + bong bóng đuôi) thành 1 path
            ctx.beginPath(); ctx.roundRect(x0 - grow, y0 - grow, w + grow * 2, h + grow * 2, 24 + grow);
            for (const [x, y, r] of lobes.concat(tail)) { ctx.moveTo(x + r + grow, y); ctx.arc(x, y, r + grow, 0, Math.PI * 2); }
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
          const halo = (txt, x, y, fill, lw) => { ctx.lineWidth = lw; ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)'; ctx.strokeText(txt, x, y); ctx.fillStyle = fill; ctx.fillText(txt, x, y); };
          ctx.font = '19px Arial, sans-serif'; halo(header, BUBBLE_W / 2, y0 + 17, '#2f4456', 4);
          ctx.font = '600 ' + size + 'px Arial, sans-serif';
          lines.forEach((l, i) => halo(l, BUBBLE_W / 2, y0 + 30 + lineH * (i + 0.5) + 4, '#17222c', 5));
          return { x0, y0, x1, y1, lines };
        }
        let engineerLabelKey = '';
        const fmtCountdown = s => s >= 3600 ? Math.floor(s / 3600) + ':' + String(Math.floor(s / 60) % 60).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0')
          : s >= 60 ? Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') : s + 's';
        function drawEngineerLabel(t = 0, now = Date.now()) {
          const fishing = engObj.phase === 'fish', thought = engObj.phase === 'check' ? (checkBubbleSprite.userData.weatherThought || checkBubbleSprite.userData.thought) : checkBubbleSprite.userData.thought;
          const showThought = !!thought && (now < thoughtUntil || engObj.phase === 'check');
          checkBubbleSprite.visible = (fishing || showThought) && engObj.phase !== 'drone';   // bay drone: bong bóng màn hình camera thay chỗ (engineer/drone.js)
          checkBubbleSprite.position.y = 2.9 + Math.sin(t * 3.5) * 0.06;
          if (!checkBubbleSprite.visible) return;
          const seconds = fishing ? Math.max(0, Math.ceil(engObj.timer)) : -1;
          const key = seconds + '|' + (showThought ? thought.revision : -1) + '|' + (fishing ? fishingStatusText() : '');
          if (key === engineerLabelKey) return; engineerLabelKey = key;
          cbCtx.setTransform(BUBBLE_RES, 0, 0, BUBBLE_RES, 0, 0); cbCtx.clearRect(0, 0, BUBBLE_W, BUBBLE_H);
          cbCtx.textAlign = 'center'; cbCtx.textBaseline = 'middle';
          const rows = [];
          let cloud = null;
          if (showThought) {
            // vẽ đám mây ở tỉ lệ THOUGHT_K quanh đáy giữa canvas; ys đổi toạ độ y lúc vẽ → toạ độ canvas thật
            const ys = (y) => BUBBLE_H - (BUBBLE_H - y) * THOUGHT_K;
            cbCtx.save(); cbCtx.translate(BUBBLE_W / 2, BUBBLE_H); cbCtx.scale(THOUGHT_K, THOUGHT_K); cbCtx.translate(-BUBBLE_W / 2, -BUBBLE_H);
            const c = drawThoughtCloud(cbCtx, thought.header, thought.message, 294); cbCtx.restore();
            cloud = { ...c, y0: ys(c.y0), y1: ys(c.y1) };
            rows.push({ type: 'weather', text: thought.header, y: ys(c.y0 + 17) }, ...cloud.lines.map((l, i) => ({ type: 'thought', text: l, y: 0 })));
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
          checkBubbleSprite.userData.rows = rows;
          checkBubbleTex.needsUpdate = true;
        }

