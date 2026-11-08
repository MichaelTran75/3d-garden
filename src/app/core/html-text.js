        // ==== LỚP CHỮ HTML (hạ tầng —, rồi chuyển mọi nhãn / chữ sang HTML) ====
        //  Vì sao: khung WebGL bị giới hạn điểm ảnh (core/boot.js pxCap ≤ 1,6× và ≤ 2048 × 1080) ⇒ trên màn Retina cảnh chỉ vẽ ~1×, trình duyệt kéo lên 2× ⇒ chữ
        //  vẽ trong cảnh nhoè. Lớp này vẽ chữ bằng canvas 2D trong DOM, đúng devicePixelRatio, đặt khớp điểm ảnh màn hình ⇒ nét như chữ trang web.
        //  · htBox / htSize / htAt / htShow: ô HTML tự đặt (bảng biogas, thẻ số — camp/biogas.js tự tính chỗ trên màn hình).
        //  · htmlSprite(sp, { paint, w, h, tone }): sprite chữ có sẵn trong cảnh ⇒ WebGL thôi vẽ nó (material.visible = false), mỗi khung (sau lệnh vẽ, sổ tick
        //    'afterRender') lớp này đọc chỗ, cỡ, độ mờ, góc xoay, tâm, ẩn / hiện (cả cha, lớp 31 của engine-holo declutter) của sprite rồi đặt ô HTML theo.
        //    Đơn vị cứ đặt sprite như cũ (vị trí, scale, opacity), không phải biết gì về DOM.
        //    paint(ctx, w, h): vẽ lại bằng nét chữ thật theo đơn vị nguồn w × h (lớp này nhân sẵn cỡ) ⇒ nét nhất; nội dung đổi thì gọi htmlSpriteDirty(sp).
        //    Không có paint ⇒ chép ảnh canvas của map (cắt theo repeat / offset), vẽ lại khi map.needsUpdate — dùng cho ảnh đã vẽ sẵn đúng điểm ảnh
        //    (bong bóng kỹ sư, chó nghĩ: canvas theo htDpr()).
        //  CHỈ ĐỔI ĐỘ NÉT, giữ dáng cũ trên màn hình (đo ảnh trước / sau 08/11 — docs/html-text-layer.md):
        //  · màu (htTone): sprite WebGL cũ qua tone map ACES (core/boot.js, phơi sáng 1,05) rồi mã hoá sRGB ⇒ trắng thành ~226, màu dịu lại; ảnh canvas cũ không gắn
        //    sRGB (tone 'raw' — nhãn, số tua-bin, số cột, ⚡, Zzz, Gâu, % ong…) ⇒ byte sRGB bị coi là tuyến tính, nhạt hơn nữa. Vẽ xong đổi từng điểm ảnh y như vậy.
        //  · mờ theo ống kính (core/lens.js lensBlurPx): sprite không thuộc lớp nét LAYER_SHARP (nhãn, bong bóng kỹ sư vẫn luôn nét như cũ) ⇒ CSS blur theo
        //    vòng nhoè ở độ sâu của nó ⇒ số cột / chữ la bàn ngoài vùng nét mờ cùng cảnh, vào vùng nét thì nét như chữ trang web.
        //  Khác cũ (chấp nhận): chữ luôn nằm trên vật (không bị vật che theo độ sâu: Zzz, Gâu, % ong, ⚡, chữ la bàn trước đây kiểm độ sâu), và nằm trên mây.
        //  Lớp chữ không nhận chuột (pointer-events none): bấm nhãn vẫn do đơn vị tự tính như trước. Đường dẫn nhãn (Line) vẫn là WebGL, nằm dưới lớp chữ.
        //  Chữ thuộc BỀ MẶT vật (lon Cola, biển báo, số lưng bò, màn hình laptop, OSD drone, kính thiên văn) KHÔNG vào đây: phải bị vật che và nghiêng theo mặt.
        //  Đổi cỡ (zoom) ⇒ trong lúc zoom co giãn ảnh cũ, zoom đứng yên 1 khung ⇒ vẽ lại đúng điểm ảnh (≤ HT_REDRAW ô mỗi khung, ô còn lại chờ khung sau). ====
        const HT = { root: null, list: [], zoom: 0, still: 0 }, htDpr = () => Math.min(3, Math.max(1, window.devicePixelRatio || 1));
        const HT_REDRAW = 8;   // vẽ lại tối đa 8 ô / khung khi zoom dừng (đổi màu từng điểm ảnh ~0,05–1 ms / ô) ⇒ không giật 1 khung khi cả chục chữ cùng vẽ lại
        function htBox(z, origin, rf) {   // 1 ô div + canvas (CSS "#scene canvas" ép mọi canvas 100 % ⇒ bọc div, canvas lấp đầy div) · z: thứ tự chồng · rf: canvas hay đọc lại (htTone)
          if (!HT.root) { const d = HT.root = document.createElement('div'); d.className = 'html-text'; d.setAttribute('aria-hidden', 'true');
            d.style.cssText = 'position:absolute;left:0;top:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:4'; container.appendChild(d); }   // dưới bảng giao diện (.ui z 5)
          const b = document.createElement('div'), c = document.createElement('canvas');
          b.style.cssText = 'position:absolute;left:0;top:0;display:none;pointer-events:none;transform-origin:' + (origin || '50% 100%') + ';z-index:' + (z | 0);
          b.appendChild(c); HT.root.appendChild(b); return { b, c, x: c.getContext('2d', rf ? { willReadFrequently: true } : undefined), d: 0, on: false, tf: '', op: '', mk: '', fl: '', z: z | 0, sw: 0, sh: 0 };
        }
        function htSize(o, w, h) {   // canvas = cỡ CSS × dpr (làm tròn) ⇒ 1 điểm ảnh canvas = 1 điểm ảnh màn hình; true khi đổi cỡ (phải vẽ lại)
          const d = htDpr(), bw = Math.max(1, Math.round(w * d)), bh = Math.max(1, Math.round(h * d)); if (bw === o.c.width && bh === o.c.height && d === o.d) return false;
          o.c.width = bw; o.c.height = bh; o.d = d; htStretch(o, bw / d, bh / d); return true;
        }
        function htStretch(o, w, h) { if (w !== o.sw || h !== o.sh) { o.sw = w; o.sh = h; o.b.style.width = w + 'px'; o.b.style.height = h + 'px'; } }   // cỡ ô hiện (canvas co giãn theo)
        function htAt(o, x, y, ex) { const d = o.d || htDpr(), t = 'translate(' + Math.round(x * d) / d + 'px,' + Math.round(y * d) / d + 'px)' + (ex || ''); if (t !== o.tf) { o.tf = t; o.b.style.transform = t; } }   // khớp điểm ảnh (lệch nửa điểm ⇒ nội suy, mờ)
        function htShow(o, v) { if (o.on !== v) { o.on = v; o.b.style.display = v ? 'block' : 'none'; } }
        function htOp(o, a) { const s = a >= 0.995 ? '' : a.toFixed(2); if (s !== o.op) { o.op = s; o.b.style.opacity = s; } }
        function htZ(o, z) { if (z !== o.z) { o.z = z; o.b.style.zIndex = z; } }
        function htBlur(o, s) { const f = s ? 'blur(' + s + 'px)' : ''; if (f !== o.fl) { o.fl = f; o.b.style.filter = f; } }
        // ---- màu như sprite WebGL cũ: đọc byte sRGB (tone 'srgb': giải mã như texture SRGBColorSpace · 'raw': coi thẳng là tuyến tính như texture không gắn) ×
        //  phơi sáng / 0,6 → ACES của three (ma trận vào → RRT/ODT → ma trận ra, kẹp 0..1) → mã hoá sRGB. Thử 08/11: nền nhãn cũ đo (224, 221, 214), công thức (224, 222, 219)
        const HT_DEC = Float32Array.from({ length: 256 }, (_, i) => { const c = i / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; });
        const HT_ENC = Uint8Array.from({ length: 4097 }, (_, i) => { const c = i / 4096; return Math.round(255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055)); });
        const htAces = v => (v * (v + 0.0245786) - 0.000090537) / (v * (0.983729 * v + 0.4329510) + 0.238081);
        const HT_CK = new Int32Array(65536).fill(-1), HT_CV = new Int32Array(65536);   // đệm màu đã đổi (vùng tô phẳng tính 1 lần) · đo 08/11 (DPR 2): nhãn 114 × 52 ~0,06 ms, đếm ngược 518 × 78 ~0,8 ms; ô lớn (bong bóng kỹ sư 1035 × 569 ~3,7 ms, nửa là đọc / ghi điểm ảnh) ⇒ tone: false
        let htExp = -1;
        function htToneRGB(r8, g8, b8, raw, k) {   // 1 màu (byte) ⇒ màu trên màn như sprite WebGL cũ, gói 0xRRGGBB
          const q = v => HT_ENC[Math.round(Math.min(1, Math.max(0, v)) * 4096)];
          const r = (raw ? r8 / 255 : HT_DEC[r8]) * k, g = (raw ? g8 / 255 : HT_DEC[g8]) * k, b = (raw ? b8 / 255 : HT_DEC[b8]) * k;
          const R = htAces(0.59719 * r + 0.35458 * g + 0.04823 * b), G = htAces(0.07600 * r + 0.90834 * g + 0.01566 * b), B = htAces(0.02840 * r + 0.13383 * g + 0.83777 * b);
          return q(1.60475 * R - 0.53108 * G - 0.07367 * B) << 16 | q(-0.10208 * R + 1.10813 * G - 0.00605 * B) << 8 | q(-0.00327 * R - 0.07276 * G + 1.07602 * B);
        }
        function htTone(o, raw) {
          const W0 = o.c.width, H0 = o.c.height, im = o.x.getImageData(0, 0, W0, H0), a = im.data, k = renderer.toneMappingExposure / 0.6, n = a.length, md = raw ? 1 << 24 : 0;
          if (k !== htExp) { htExp = k; HT_CK.fill(-1); }   // đổi phơi sáng ⇒ bỏ đệm
          for (let i = 0; i < n; i += 4) {
            if (!a[i + 3]) continue;
            const key = md | a[i] << 16 | a[i + 1] << 8 | a[i + 2], s = (key ^ key >>> 15 ^ key >>> 24) & 65535;
            let v; if (HT_CK[s] === key) v = HT_CV[s]; else { v = htToneRGB(a[i], a[i + 1], a[i + 2], raw, k); HT_CK[s] = key; HT_CV[s] = v; }
            a[i] = v >>> 16; a[i + 1] = v >>> 8 & 255; a[i + 2] = v & 255;
          }
          o.x.putImageData(im, 0, 0);
        }
        const _htC = document.createElement('canvas').getContext('2d');
        function htCol(col) { _htC.fillStyle = '#000'; _htC.fillStyle = col; const s = _htC.fillStyle; return s[0] === '#' ? [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16), 1] : s.match(/[\d.]+/g).map(Number); }
        function htToneCol(col, raw) {   // màu CSS ⇒ màu đã tone map như WebGL cũ (vẽ sẵn vào canvas nguồn của ô tone: false — đếm ngược kỹ sư) · phơi sáng đọc lúc gọi
          const m = htCol(col), v = htToneRGB(m[0], m[1], m[2], raw, renderer.toneMappingExposure / 0.6); return 'rgba(' + (v >>> 16) + ',' + (v >>> 8 & 255) + ',' + (v & 255) + ',' + (m[3] ?? 1) + ')';
        }
        function htRaw(col) {   // màu cho paint 'srgb' ra đúng như màu đó vẽ vào ảnh cũ KHÔNG gắn sRGB (core/labels.js: nền / viền / chấm nhãn — emoji vẫn đúng màu như bản cũ đã sửa)
          const m = htCol(col), e = v => HT_ENC[Math.round(v / 255 * 4096)]; return 'rgba(' + e(m[0]) + ',' + e(m[1]) + ',' + e(m[2]) + ',' + (m[3] ?? 1) + ')';
        }
        function htmlSprite(sp, opt = {}) {   // opt.tone: 'srgb' (mặc định: ảnh cũ gắn SRGBColorSpace) · 'raw' (ảnh cũ không gắn) · false (không tone map)
          const e = { sp, o: null, paint: opt.paint || null, w: opt.w || 0, h: opt.h || 0, tone: opt.tone === undefined ? 'srgb' : opt.tone, map: null, ver: -1, dirty: true, dw: 0, dh: 0 };
          sp.material.visible = false; sp.userData.html = e; HT.list.push(e); return sp;
        }
        function htmlSpriteDirty(sp) { const e = sp.userData.html; if (e) e.dirty = true; }
        function htDraw(e, w, h) {   // vẽ ô của sprite đúng cỡ w × h px CSS
          const o = e.o, sp = e.sp, map = sp.material.map; htSize(o, w, h); e.dw = w; e.dh = h; e.dirty = false; e.map = map; e.ver = map ? map.version : 0;
          const x = o.x, bw = o.c.width, bh = o.c.height; x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, bw, bh);
          if (e.paint) { const W0 = e.w || bw, H0 = e.h || bh; x.setTransform(bw / W0, 0, 0, bh / H0, 0, 0); e.paint(x, W0, H0); x.setTransform(1, 0, 0, 1, 0, 0); }
          else { const im = map && map.image; if (!im || !im.width) return;
            const sw = im.width * map.repeat.x, sh = im.height * map.repeat.y, sx = im.width * map.offset.x, sy = im.height * (1 - map.offset.y - map.repeat.y);   // ảnh lật Y như texture
            x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high'; x.drawImage(im, sx, sy, sw, sh, 0, 0, bw, bh); }
          if (e.tone) htTone(o, e.tone === 'raw');
        }
        const _htP = new THREE.Vector3(), HT_SHARP = 1 << LAYER_SHARP;
        function htmlTextTick() {
          const Wd = W(), Hd = Hv(); if (!Wd || !Hd || !HT.list.length) return;
          if (camera.zoom !== HT.zoom) { HT.zoom = camera.zoom; HT.still = 0; } else HT.still++;   // zoom đứng yên ≥ 1 khung ⇒ vẽ lại đúng điểm ảnh
          const kx = camera.zoom * Wd / (camera.right - camera.left), ky = camera.zoom * Hd / (camera.top - camera.bottom);   // px CSS / đv thế giới (camera trực giao)
          let bud = HT_REDRAW;
          for (const e of HT.list) {
            const sp = e.sp, mt = sp.material; let v = sp.visible && mt.opacity > 0.004 && (sp.layers.mask & 0x7fffffff) !== 0;   // chỉ ở lớp 31 = đang bị giấu (engine-holo declutter)
            if (v) for (let p = sp.parent; ; p = p.parent) { if (!p || !p.visible) { v = false; break; } if (p === scene) break; }
            if (v) { _htP.setFromMatrixPosition(sp.matrixWorld).project(camera); v = _htP.z > -1 && _htP.z < 1; }
            let w = 0, h = 0, x0 = 0, y0 = 0;
            if (v) { const m = sp.matrixWorld.elements; w = Math.hypot(m[0], m[1], m[2]) * kx; h = Math.hypot(m[4], m[5], m[6]) * ky;
              const cx = (_htP.x + 1) / 2 * Wd, cy = (1 - _htP.y) / 2 * Hd; x0 = cx - sp.center.x * w; y0 = cy - (1 - sp.center.y) * h;
              v = w >= 2 && h >= 2 && w * h < 9 * Wd * Hd && x0 < Wd && y0 < Hd && x0 + w > 0 && y0 + h > 0; }   // ngoài khung / nhỏ quá / to quá ⇒ thôi
            if (!v) { if (e.o) htShow(e.o, false); continue; }
            if (!e.o) e.o = htBox(0, (sp.center.x * 100) + '% ' + ((1 - sp.center.y) * 100) + '%', !!e.tone);   // xoay quanh tâm sprite như WebGL
            const map = mt.map, chg = !e.paint && (map !== e.map || (map && map.version !== e.ver)), first = e.dirty || chg || !e.dw || e.o.d !== htDpr();
            if (first || ((Math.abs(w - e.dw) > 0.5 || Math.abs(h - e.dh) > 0.5) && HT.still > 0 && bud > 0)) { htDraw(e, w, h); bud--; } else htStretch(e.o, w, h);   // đang zoom / hết lượt: co giãn ảnh cũ
            htAt(e.o, x0, y0, mt.rotation ? ' rotate(' + (-mt.rotation).toFixed(3) + 'rad)' : '');
            const s = (sp.layers.mask & HT_SHARP) ? 0 : lensBlurPx((_htP.z + 1) / 2, (_htP.y + 1) / 2) * (sp.userData.lensK || 1);   // camera trực giao: NDC z tuyến tính ⇒ độ sâu 0..1 như ảnh độ sâu
            htBlur(e.o, s < 0.3 ? 0 : Math.round(s * 4) / 4);
            htOp(e.o, mt.opacity); htZ(e.o, 10 + sp.renderOrder * 10 + Math.round((1 - _htP.z) * 4)); htShow(e.o, true);   // chồng theo renderOrder rồi gần trước
          }
        }
        worldTick('afterRender', 5, htmlTextTick);   // MỖI KHUNG, ngay sau lệnh vẽ (loop/main-loop-rest.js): camera đúng khung vừa vẽ ⇒ chữ khớp đường dẫn WebGL
