        // ===== NÉT MẶT, DÁNG THEO CẢM XÚC, NÓI CÓ KHẨU HÌNH, TAY NẮM / MỞ (G 23/10 "study engineer behavior emotional expression: face, mắt, miệng, body reaction —
        //  đối với thời tiết và bảng nhu cầu; animation miệng khi talking; bàn tay co lại để cầm nắm") =====
        //  Nghiên cứu:
        //   · MẶT theo FACS (Ekman & Friesen): vui thật = má nâng + khoé môi kéo lên (AU6 + AU12, mắt híp — nụ cười Duchenne) · buồn = đầu trong lông mày nhướng
        //     và chau (AU1 + AU4), khoé môi trễ (AU15) · tập trung / căng thẳng = chau mày (AU4), mí siết (AU7), môi mím / nghiến răng (AU23–24) · ngạc nhiên =
        //     nhướng mày (AU1 + 2), mở to mắt (AU5), há miệng (AU26) · khó chịu = chau đầu trong mày + khoé môi kéo ngang méo · ngượng = má hồng, cười gượng, liếc đi.
        //     Mặt LEGO là MẶT IN: vẽ lại canvas mặt (512 × 128, mặt trước nửa trụ đầu) chỉ khi nét đổi (lượng tử hoá) — như phim LEGO thay bản in mặt.
        //   · CHỚP MẮT (Bentivoglio 1997, 150 người): nghỉ ~17 lần/phút, nói chuyện ~26, đọc / nhìn màn hình ~4,5; mỗi lần ~0,15 s; mệt thì chớp chậm, mí sụp.
        //   · NÓI: tiếng Việt ~5,25 âm tiết/giây (Coupé và cs. 2019, Science Advances, 17 ngôn ngữ) — mỗi chữ là 1 âm tiết ⇒ khẩu hình theo nguyên âm chính của
        //     từng chữ (a há to · e/ê bè ngang · i/y hé dẹt · o/ô/ơ tròn · u/ư chúm), phụ âm cuối m/p khép môi; dấu phẩy nghỉ 0,22 s, chấm / chấm than / hỏi 0,35 s;
        //     câu cảm / câu hỏi nhướng mày, gật nhẹ theo nhịp âm tiết. Câu thốt ra (react, event) vẽ BÓNG THOẠI có đuôi chỉ miệng; suy nghĩ vẩn vơ (idle) giữ
        //     đám mây — mặt "đang nghĩ": liếc lên, mím một bên, nghiêng đầu.
        //   · ĂN / UỐNG: miệng há đón khi thìa / quả / que cá tới gần miệng, nhai ~1,6 Hz sau mỗi miếng; uống thì chúm môi.
        //   · DÁNG (Montepare và cs. 1987, Roether và cs. 2009): buồn / mệt cúi đầu, khom, đi chậm, ít vung tay, bước ít nảy; vui / hăng hái ngẩng đầu, ưỡn ngực,
        //     đi nhanh hơn, vung tay rộng, bước nảy; căng thẳng bước gấp, tay nắm chặt; đùa nghịch nghiêng đầu nhún nhảy; mệt ngáp che miệng, chán thì thở dài.
        //   · TAY LEGO = vòng chữ C: "nắm" = miệng C khép (morph lưới tay, engineer/body/model.js) — cầm đồ / bám sào / ôm người / căng thẳng thì khép, với tay tới đồ
        //     thì xoè trước rồi khép khi chạm, xoè lòng hứng mưa / hơ lửa, thả lỏng thì hé. Việc riêng đặt e.gripReq[i] (vd hái táo: engineer/tasks/apple-pick.js).
        //  Gọi: engFace.tick (loop-update.js, sau engArmPost) · engMoodPost (reactions.js engReactPost) · e.moodSpd / moodSwing / moodBob (đi bộ) ----
        const engFace = (() => {
          const FC = engObj.g.userData.face, x = FC.awake.image.getContext('2d'), YEL = '#' + new THREE.Color(LEGO_YELLOW).getHexString();
          const DEF = { eo: 1, eh: 0, sq: 0, lid: 0, wk: 0, gx: 0, gy: 0, by: 0, bt: 0, ba: 0, ms: 0.75, mo: 0, mr: 0, mw: 0, mt: 0, mx: 0, wob: 0, tg: 0, bl: 0, sw: 0, cn: 0, tr: 0 };
          const F = { ...DEF }, T = { ...DEF }, KEYS = Object.keys(DEF);
          const EMO = {   // nét mặt nền theo cảm xúc của bảng nhu cầu (ui/sim-needs.js simEmotion) · VERY: tổng moodlet ≥ 3
            fine: {}, happy: { ms: 1, eh: 0.35, sq: 0.3, by: 0.12 }, focused: { bt: -0.35, by: -0.25, ms: 0.25, sq: 0.2 },
            energized: { eo: 1.12, by: 0.35, ms: 1, mo: 0.28, mt: 0.7 }, inspired: { eo: 1.08, by: 0.45, bt: 0.1, ms: 0.85, gy: -0.35 },
            playful: { ms: 0.95, mx: 0.5, ba: 0.55, eh: 0.2 }, uncomfortable: { bt: 0.5, by: 0.05, ms: -0.15, wob: 0.45, mw: 0.25 },
            tense: { bt: -0.55, by: -0.3, ms: -0.1, mt: 0.45, sq: 0.3 }, sad: { bt: 0.75, by: 0.1, ms: -0.6, gy: 0.45, lid: 0.25 },
            embarrassed: { bl: 1, ms: 0.35, wob: 0.6, gx: -0.7, gy: 0.3, bt: 0.3 }
          };
          const VERY = { happy: { eh: 0.8, mo: 0.35, mt: 0.6 }, sad: { tr: 0.8, ms: -0.85 }, tense: { mt: 0.8, bt: -0.75 }, uncomfortable: { bt: 0.7, ms: -0.35 }, embarrassed: { gx: -1 } };
          const BODY = {   // đầu cúi (+) · khom (+) · tốc độ đi · vung tay · nảy bước
            fine: [0, 0, 1, 1, 1], happy: [-0.05, -0.03, 1.06, 1.2, 1.25], focused: [0.05, 0.02, 1, 0.9, 0.9], energized: [-0.07, -0.04, 1.12, 1.3, 1.3],
            inspired: [-0.08, -0.02, 1, 1.1, 1.1], playful: [-0.03, 0, 1.05, 1.25, 1.35], uncomfortable: [0.05, 0.02, 0.95, 0.85, 0.9], tense: [0.03, 0.01, 1.06, 0.85, 1],
            sad: [0.16, 0.07, 0.85, 0.55, 0.6], embarrassed: [0.12, 0.04, 0.95, 0.75, 0.8]
          };
          const GEST = {   // cử chỉ (engineer/mind/reactions.js, env-react.js) → nét mặt
            laugh: { eh: 1, ms: 1, mo: 0.7, mt: 0.5, by: 0.2 }, clap: { eh: 0.8, ms: 1, mo: 0.45, mt: 0.4 }, cough: { eo: 0.05, sq: 1, bt: -0.4, mo: 0.45, mr: 0.4 },
            wave: { sq: 0.7, bt: -0.3, ms: -0.2, mw: 0.5 }, shield: { eo: 0.05, sq: 1, mw: 0.85, mt: 1, ms: -0.25, bt: -0.3 }, catch: { tg: 1, bt: -0.3, by: -0.1, eo: 1.05 },
            look: { by: 0.55, eo: 1.15, mr: 0.6, mo: 0.22, ms: 0.4 }, drop: { ms: 0.85, eh: 0.3 }, pat: { ms: 1, eh: 0.6, by: 0.15 }, relief: { eo: 0.05, ms: 0.6, mo: 0.28, mr: 0.55, by: 0.2 },
            brr: { mt: 1, wob: 0.8, bt: 0.6, sq: 0.3 }, hug: { mt: 0.6, bt: 0.5, ms: -0.2 }, blow: { mr: 0.85, mo: 0.4, eo: 0.6, bt: 0.4 }, rub: { bt: 0.4, ms: 0.1 },
            warm: { eo: 0.5, ms: 0.7, by: 0.1 }, fan: { sq: 0.4, bt: 0.45, mo: 0.25, ms: -0.1 }, fanClip: { sq: 0.4, bt: 0.45, mo: 0.25, ms: -0.1 }, wipe: { sq: 0.6, bt: 0.4, mo: 0.2, mw: 0.4 },
            shade: { sq: 0.9, by: -0.3, bt: -0.2 }, palm: { by: 0.35, gy: -0.8, mr: 0.4, mo: 0.15 }, helmet: { eo: 1.1, by: 0.3, mo: 0.25, mr: 0.6 }, cover: { bt: 0.5, sq: 0.3, mw: 0.5 },
            shakeOff: { sq: 0.6, mw: 0.6, mt: 0.6 }, brush: { sq: 0.5, gy: -1, mx: 0.4 }, finger: { by: 0.5, eo: 1.12, ms: 0.9, mo: 0.2 }, point: { by: 0.5, eo: 1.12, ms: 0.9, mo: 0.25 },
            yawn: { eo: 0, mo: 1, mr: 0.45, by: 0.35, ms: 0 }, sigh: { lid: 0.65, mo: 0.25, mr: 0.55, bt: 0.35, ms: 0 }
          };
          const GRIP = { palm: -0.4, warm: -0.3, shade: -0.1, pat: -0.15, fan: 0.05, fanClip: 0.05, wave: 0.1, clap: 0.15, catch: -0.35, look: 0.55, drop: -0.3, brush: 0.15, helmet: 0.2,
            cover: 0.5, wipe: 0.55, rub: 0.45, blow: 0.35, hug: 0.85, brr: 0.9, shakeOff: 0.15, shield: 0.6, finger: 0.85, point: 0.85, yawn: 0.25 };
          const TWO = new Set(['clap', 'rub', 'warm', 'shield', 'blow', 'hug', 'brr', 'shakeOff']);   // cử chỉ dùng cả 2 tay
          const M = { head: 0, slump: 0, tilt: 0, nod: 0 }, S = { plan: null, t: 0, rev: -1, think: 0, amp: 0 }, B = { next: 2, t: -1, dur: 0.15, twin: false };
          const Y = { next: 90 + Math.random() * 90, sigh: 150 + Math.random() * 120, face: 0, kind: '' }, C = { near: false, chew: 0, drink: false };
          const _fa = new THREE.Vector3(), _fb = new THREE.Vector3(), CE = { E: { emo: 'fine', w: 0 }, t: 0 }, W = { t: -1, next: 8 };
          const set = (o, w) => { if (!o || w <= 0) return; const k1 = Math.min(1, w); for (const k in o) T[k] += (o[k] - T[k]) * k1; if ('eo' in o && !('eh' in o)) T.eh -= T.eh * k1; };   // lớp đặt độ mở mắt thì bỏ mắt cười ∩ của lớp dưới
          const ease = u => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
          let drawn = '', drawT = -1, lastMap = null;
          // ---- VẼ MẶT IN ----
          function line(x0, y0, x1, y1, w) { x.strokeStyle = '#1b1b1b'; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); }
          function drop(cx, cy, s, col) {   // giọt mồ hôi / nước mắt có ánh sáng
            x.fillStyle = col; x.beginPath(); x.moveTo(cx, cy - 9 * s); x.quadraticCurveTo(cx + 7 * s, cy + 2 * s, cx, cy + 7 * s); x.quadraticCurveTo(cx - 7 * s, cy + 2 * s, cx, cy - 9 * s); x.fill();
            x.fillStyle = 'rgba(255,255,255,0.8)'; x.beginPath(); x.arc(cx - 1.8 * s, cy + 1 * s, 1.6 * s, 0, TAU); x.fill();
          }
          function eye(ex, s, P) {   // s: −1 mắt bên trái canvas (mắt PHẢI nhân vật — canvas vẽ như nhìn từ trước mặt), +1 mắt trái nhân vật
            const ey = 60, open = Math.max(0, P.eo * (1 - (s > 0 ? P.wk : 0)));   // nháy 1 mắt: mắt trái nhân vật
            if (P.eh > 0.55 && open > 0.2) { x.strokeStyle = '#1b1b1b'; x.lineWidth = 4; x.lineCap = 'round'; x.beginPath(); x.arc(ex, ey + 5, 8, 1.15 * Math.PI, 1.85 * Math.PI); x.stroke(); return; }   // mắt cười ∩
            if (open < 0.14) { x.strokeStyle = '#1b1b1b'; x.lineWidth = 3.5; x.lineCap = 'round'; x.beginPath(); x.arc(ex, ey - 4, 8.5, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); return; }   // nhắm: cung mí
            const wide = Math.max(0, Math.min(1, (open - 1.15) / 0.12)), big = Math.max(0, Math.min(1, (open - 1) / 0.15)), ry = 9 * Math.min(1, open) + 1.2 * big, px = ex + 2.2 * P.gx, py = ey + 1.8 * P.gy;   // big: mắt sáng to hơn (hăng hái, hứng khởi) · wide: giật mình lộ lòng trắng
            x.save(); x.beginPath(); x.ellipse(ex, ey, 7.8 + 3 * wide, Math.max(ry, 1) + 2.5 * wide, 0, 0, TAU); x.clip();
            if (wide > 0.02) { x.fillStyle = '#ffffff'; x.fillRect(ex - 13, ey - 14, 26, 28); }   // mở to (ngạc nhiên): lộ lòng trắng
            x.fillStyle = '#1b1b1b'; x.beginPath(); x.ellipse(px, py, 7 + 0.8 * big - 2.2 * wide, Math.max(1, ry - 4 * wide), 0, 0, TAU); x.fill();
            if (open > 0.45) { x.fillStyle = '#ffffff'; x.beginPath(); x.arc(px + 2, py - 4 * Math.min(1, open), 2.4 + 0.6 * wide, 0, TAU); x.fill(); }   // ánh mắt
            const top = ey - ry - 1 - 2.5 * wide, bot = ey + ry + 1 + 2.5 * wide, lidY = top + (bot - top) * 0.55 * P.lid, sqY = bot - (bot - top) * 0.5 * P.sq;
            x.fillStyle = YEL;
            if (P.lid > 0.02) x.fillRect(ex - 13, ey - 15, 26, lidY - (ey - 15));   // mí trên sụp (mệt, buồn)
            if (P.sq > 0.02) { x.beginPath(); x.moveTo(ex - 13, ey + 15); x.lineTo(ex - 13, sqY + 2); x.quadraticCurveTo(ex, sqY - 3, ex + 13, sqY + 2); x.lineTo(ex + 13, ey + 15); x.fill(); }   // nheo: mí dưới / má nâng
            x.restore();
            if (wide > 0.02) { x.strokeStyle = '#1b1b1b'; x.lineWidth = 2; x.beginPath(); x.ellipse(ex, ey, 7.8 + 3 * wide, ry + 2.5 * wide, 0, 0, TAU); x.stroke(); }
            if (P.lid > 0.15) line(ex - 8, lidY, ex + 8, lidY + 0.5, 3);
            if (P.sq > 0.35) { x.strokeStyle = '#1b1b1b'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(ex - 8, sqY + 2); x.quadraticCurveTo(ex, sqY - 3, ex + 8, sqY + 2); x.stroke(); }
          }
          function mouthPath(cx, w, yL, yR, cU, cD) { x.beginPath(); x.moveTo(cx - w, yL); x.quadraticCurveTo(cx, cU, cx + w, yR); x.quadraticCurveTo(cx, cD, cx - w, yL); x.closePath(); }
          function mouth(P) {
            const cx = 256 + 5 * P.mx, w = Math.max(5, 21 + 6 * P.mw - 13 * P.mr), sm = P.ms, open = P.mo, yc = 82 - 5 * sm - 2 * open, yL = yc + 3 * P.mx, yR = yc - 3 * P.mx, ym = (yL + yR) / 2;
            const cD = ym + 26 * sm * (1 - 0.35 * P.mr) * (1 - 0.4 * open) + 34 * open, cU = ym + (sm > 0 ? 2 * sm : 6 * sm) - 15 * open * (0.5 + 0.7 * P.mr);
            x.lineCap = 'round'; x.lineJoin = 'round';
            if (open < 0.06 && P.mt > 0.35) {   // nghiến răng (căng thẳng, rét run): dải răng trắng kẻ dọc
              const h = 6 + 2 * P.mt; x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(cx - w * 0.85, ym - h / 2, w * 1.7, h, 3); x.fill();
              x.strokeStyle = '#1b1b1b'; x.lineWidth = 3; x.stroke(); x.lineWidth = 1.6; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(cx + k * w * 0.3, ym - h / 2); x.lineTo(cx + k * w * 0.3, ym + h / 2); x.stroke(); }
              return;
            }
            if (open < 0.06) {   // miệng khép: 1 nét (cười / mếu), méo gợn khi khó chịu
              x.strokeStyle = '#1b1b1b'; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - w, yL);
              if (P.wob > 0.05) { for (let k = 1; k <= 16; k++) { const u = k / 16, bx = cx - w + 2 * w * u, by0 = (1 - u) * (1 - u) * yL + 2 * u * (1 - u) * cD + u * u * yR; x.lineTo(bx, by0 + Math.sin(u * TAU * 2) * 2.4 * P.wob); } }
              else x.quadraticCurveTo(cx, cD, cx + w, yR);
              x.stroke();
            } else {   // há: ruột miệng đỏ sẫm, hàm răng trên, lưỡi
              mouthPath(cx, w, yL, yR, cU, cD); x.fillStyle = '#5a1f1c'; x.fill();
              x.save(); mouthPath(cx, w, yL, yR, cU, cD); x.clip();
              if (open > 0.15 || P.mt > 0.2) { x.fillStyle = '#ffffff'; x.fillRect(cx - w, Math.min(cU, ym) - 4, 2 * w, (ym - Math.min(cU, ym)) * 0.5 + 6 + 3 * P.mt); }
              if (open > 0.35) { x.fillStyle = '#d9686a'; x.beginPath(); x.ellipse(cx, (ym + cD) / 2 + 9 * open, w * 0.55, 7 * open, 0, 0, TAU); x.fill(); }
              x.restore();
              mouthPath(cx, w, yL, yR, cU, cD); x.strokeStyle = '#1b1b1b'; x.lineWidth = 3.5; x.stroke();
            }
            if (P.tg > 0.1) {   // thè lưỡi tập trung ở khoé miệng
              const tx = cx + w * 0.5, ty = (yR + cD) / 2 + 1, r = 4 + 2 * P.tg; x.fillStyle = '#e07a7c'; x.beginPath(); x.arc(tx, ty, r, 0, Math.PI); x.fill();
              x.strokeStyle = '#1b1b1b'; x.lineWidth = 2; x.beginPath(); x.arc(tx, ty, r, 0, Math.PI); x.stroke();
            }
          }
          function draw(P) {
            x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = YEL; x.fillRect(0, 0, 512, 128);
            const ck = Math.max(P.bl, 0.85 * P.cn);   // má hồng: ngượng · lạnh (đỏ hơn)
            if (ck > 0.03) { x.fillStyle = (P.bl >= P.cn ? 'rgba(255,118,118,' : 'rgba(232,84,84,') + (0.42 * ck).toFixed(3) + ')'; for (const c of [213, 299]) { x.beginPath(); x.ellipse(c, 77, 12, 6.5, 0, 0, TAU); x.fill(); } }
            eye(228, -1, P); eye(284, 1, P);
            x.strokeStyle = '#3a2a1f'; x.lineWidth = 4; x.lineCap = 'round';
            for (const [ex, s] of [[228, -1], [284, 1]]) {   // lông mày: đầu trong (gần giữa mặt) lên khi buồn / lo, xuống khi chau
              const r = 7 * P.by + 4 * P.ba * (s < 0 ? -1 : 1), yIn = 39 - r - 6 * P.bt, yOut = 40 - r + 1.5 * P.bt, xIn = ex - 10 * s, xOut = ex + 10 * s;
              x.beginPath(); x.moveTo(xOut, yOut); x.quadraticCurveTo(ex, Math.min(yIn, yOut) - 5, xIn, yIn); x.stroke();
            }
            mouth(P);
            if (P.sw > 0.05) drop(320, 47, 1, 'rgba(150,205,240,' + (0.92 * P.sw).toFixed(3) + ')');   // mồ hôi thái dương
            if (P.tr > 0.05) drop(225, 77, 0.8, 'rgba(120,180,240,' + (0.85 * P.tr).toFixed(3) + ')');   // giọt nước mắt
            FC.awake.needsUpdate = true;
          }
          // ---- NÓI: chữ → âm tiết → khẩu hình ----
          const VIS = { a: [0.85, 0, 0.35], e: [0.5, 0, 0.75], i: [0.25, 0, 0.95], o: [0.6, 0.85, 0], u: [0.32, 1, 0] };   // độ há · tròn môi · bè ngang
          function plan(text) {
            const syl = []; let t = 0.12;   // hít vào trước khi nói
            for (const w0 of text.replace(/[“”"()«»]/g, '').split(/\s+/)) {
              if (!w0) continue; const pm = w0.match(/[,.!?…:;—–-]+$/), pu = pm ? pm[0] : '', w = w0.slice(0, w0.length - pu.length).toLowerCase();
              if (/[a-zà-ỹđ0-9]/i.test(w)) {
                const b = w.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd'), v = (b.match(/[aeiouy]+/) || ['e'])[0], fin = b.replace(/^.*[aeiouy]/, '');
                const nuc = /a/.test(v) ? 'a' : /o/.test(v) ? 'o' : /e/.test(v) ? 'e' : /u/.test(v) ? 'u' : 'i', d = 0.16 + Math.min(0.06, 0.008 * w.length);   // ~5,25 âm tiết/giây
                syl.push({ t0: t, t1: t + d, nuc, close: /^[mpb]$/.test(fin) ? 1 : fin ? 0.4 : 0, emph: /[!?]/.test(pu) });
                t += d;
              }
              if (pu) t += /[.!?…]/.test(pu) ? 0.35 : 0.22;
            }
            return { syl, dur: t + 0.08 };
          }
          function speak(dt) {   // khẩu hình khung này (S.amp: độ há để gật theo nhịp)
            const P = S.plan; S.t += dt; S.amp = 0; if (!P) return null;
            if (S.t > P.dur) { S.plan = null; return null; }
            const s = P.syl.find(q => S.t >= q.t0 && S.t < q.t1); if (!s) return { mo: 0.05, mr: 0, mw: 0, emph: false };
            const u = (S.t - s.t0) / (s.t1 - s.t0), a = Math.sin(Math.PI * Math.min(1, u / (s.close >= 1 ? 0.8 : 0.95))) * (1 - 0.6 * s.close * ease((u - 0.6) / 0.4)), V = VIS[s.nuc];
            S.amp = a; return { mo: V[0] * a * (s.emph ? 1.2 : 1), mr: V[1] * (0.4 + 0.6 * a), mw: V[2] * a, emph: s.emph };
          }
          // ---- mỗi khung ----
          function tick(e, dt, t) {
            const awake = FC.mat.map === FC.awake, U = e.g.userData, now = Date.now(), th = checkBubbleSprite.userData.thought;
            if (th && th.revision !== S.rev) { S.rev = th.revision; if (now < thoughtUntil && awake) { if ((th.kind === 'react' || th.kind === 'event') && th.message) { S.plan = plan(th.message); S.t = 0; } else S.think = 2.8; } }
            S.think = Math.max(0, S.think - dt);
            if (t >= CE.t && sim.n && sim.n.energy !== undefined) { CE.E = simEmotion(); CE.t = t + 0.5; }   // cảm xúc trội: tính lại mỗi 0,5 s
            const E = CE.E, n = sim.n || {}, G = RX.gest, out = rxOutside(e);
            const tired = Math.max(0, Math.min(1, (32 - (n.energy ?? 60)) / 26)), ph = e.phase, ap = ph === 'apple' && applePick.state.st;
            for (const k of KEYS) T[k] = DEF[k];
            // nền: cảm xúc trội của bảng nhu cầu
            set(EMO[E.emo], Math.min(1, 0.55 + 0.2 * E.w)); if (E.w >= 3) set(VERY[E.emo], 1);
            // thời tiết (engineer/mind/weather-feel.js): nóng — mồ hôi, thở miệng · lạnh — má đỏ, môi run · ướt — nhăn mặt · nắng gắt — nheo
            if (out) {
              if (WX.hotK > 0.3) { T.sw = Math.max(T.sw, WX.hotK); set({ bt: 0.35, mo: WX.act > 1 ? 0.22 : 0.08, mr: 0.2 }, WX.hotK * 0.8); }
              if (WX.coldK > 0.3) { T.cn = Math.max(T.cn, WX.coldK); set({ bt: 0.45, ms: -0.1, wob: 0.6, mt: 0.4 }, WX.coldK * 0.8); }
              if (WX.wet > 0.25) set({ bt: 0.5, ms: -0.25, mw: 0.35, sq: 0.25 }, Math.min(1, WX.wet * 1.4));
              if (WX.sun > 150 && !rxDry(e.g.position)) set({ sq: 0.55, by: -0.2 }, Math.min(1, (WX.sun - 150) / 120));
            }
            // nhu cầu: mệt — mí sụp, chớp chậm · đói / buồn tiểu — chau nhẹ (cảm xúc Không thoải mái lo phần chính)
            if (tired > 0) set({ lid: 0.75, by: -0.1, ms: 0.35 }, tired);
            // việc đang làm
            const read = ph === 'read' || (e.inVan && e.van && e.van.station === 'desk' && e.van.st === 'work');
            if (read) set({ gy: 0.8, bt: -0.15, ms: 0.45 }, 0.8);
            if (ph === 'nap') set({ eo: 0, ms: 0.35, by: -0.1, lid: 0 }, 1);
            if (ph === 'stars') set({ eo: 1.08, by: 0.3, ms: 0.85, gy: -0.6 }, 0.8);
            if (ph === 'engine') set(engHolo.state.on ? { eo: 1.1, by: 0.4, ms: 0.9 } : { bt: -0.3, by: -0.15, ms: 0.3 }, 0.8);
            if (ap === 'aim' || ap === 'cup' || ap === 'twist' || ph === 'garden' || ph === 'trim') set({ tg: ap === 'twist' || ap === 'cup' ? 1 : 0.6, bt: -0.4, by: -0.2, sq: 0.25, ms: 0.2, gy: -0.3 }, 1);   // việc khéo tay: chau mày, thè lưỡi
            if (ap === 'retract' && applePick.state.k < 1) set({ ms: 1, eh: 0.6, by: 0.25 }, 1);   // bứt được quả
            if (ap === 'inspect') set(applePick.state.k < 1 ? { by: 0.45, eo: 1.08, mr: 0.45, mo: 0.15, ms: 0.5, gy: 0.2 } : { ms: 1, eh: 0.5 }, 1);   // xoay quả xem vết dập · chà bóng xong: hài lòng
            if (ap === 'drop') set({ ms: 0.7, bt: 0.15, by: 0.1, gy: 0.5 }, 1);   // đặt nhẹ tay
            if (E.emo === 'playful' && awake && W.t < 0 && (W.next -= dt) <= 0) W.t = 0;   // vui đùa: thỉnh thoảng nháy mắt
            if (W.t >= 0) { W.t += dt; T.wk = Math.sin(Math.PI * Math.min(1, W.t / 0.45)); T.mx = Math.max(T.mx, 0.6); if (W.t >= 0.45) { W.t = -1; W.next = 12 + Math.random() * 20; } }
            // suy nghĩ vẩn vơ: liếc lên, mím một bên, nhướng 1 mày
            if (S.think > 0) set({ gx: 0.6, gy: -0.7, mx: 0.45, ms: 0.25, ba: 0.45, mr: 0.3 }, Math.min(1, S.think / 0.5));
            // cử chỉ (đè nét nền)
            if (G && G.w > 0.02) { const o = GEST[G.k] || (G.k === 'finger' && ENV.bf ? GEST.look : null); if (o) set(o, G.w); }
            if (RX.flinch > 0) set({ eo: 1.3, by: 0.6, mo: 0.55, mr: 0.75, ms: 0 }, 1);   // sét: giật mình
            // ngáp (mệt) / thở dài (chán, căng thẳng): cử chỉ có tay khi ở ngoài trời tay rảnh, còn lại chỉ nét mặt
            Y.next -= dt; Y.sigh -= dt;
            if (awake && !S.plan && ph !== 'nap' && ph !== 'stars') {
              if (tired > 0.35 && Y.next <= 0) { Y.next = (100 + Math.random() * 120) * (1.6 - tired); if (!(out && !G && rxHands(e)[0] && !e.walking && rxGest('yawn', 3.1))) { Y.face = 3.1; Y.kind = 'yawn'; } }
              else if ((E.emo === 'tense' || (n.fun ?? 60) < 28) && Y.sigh <= 0) { Y.sigh = 160 + Math.random() * 140; if (!(out && !G && rxGest('sigh', 2.3))) { Y.face = 2.3; Y.kind = 'sigh'; } }
            }
            if (Y.face > 0) { Y.face -= dt; const u = 1 - Y.face / (Y.kind === 'yawn' ? 3.1 : 2.3); set(GEST[Y.kind], Math.sin(Math.PI * Math.min(1, u * 1.05))); }
            // ăn / uống: há đón đồ tới miệng, nhai sau mỗi miếng · uống chúm môi
            const H = e.hold || {}, eat = ph === 'eatFish' || ph === 'appleEat' || sim.doing === 'eat' || sim.doing === 'appleEat', drink = H.cup || H.coke || H.bottle || H.sip || ph === 'tea' || ph === 'drink';
            if ((eat || drink) && e.handW) {
              engMouthW(e, _fa); const d = Math.min(e.handW[0].distanceTo(_fa), e.handW[1].distanceTo(_fa)) / e.g.scale.y, near = d < 0.16;
              const op = 1 - ease((d - 0.07) / 0.13);
              if (op > 0.02) set(drink && !eat ? { mo: 0.3 * op, mr: 0.85 } : { mo: 0.62 * op, mr: 0.3, ms: 0.2 }, 1);
              if (C.near && !near && eat) C.chew = 1.8; C.near = near;
            }
            if (C.chew > 0) { C.chew -= dt; const c = 0.5 + 0.5 * Math.sin(t * TAU * 1.6); set({ mo: 0.08 + 0.2 * c, mx: 0.2 * Math.sin(t * TAU * 0.8), ms: 0.4, mr: 0.15 }, Math.min(1, C.chew / 0.3)); }
            // nói: khẩu hình theo âm tiết, câu cảm nhướng mày
            const sp = awake ? speak(dt) : null;
            if (sp) { T.mo = sp.mo; T.mr = sp.mr; T.mw = sp.mw; T.ms *= 0.5; T.mt = Math.min(T.mt, 0.2); T.tg = 0; if (sp.emph) T.by = Math.max(T.by, 0.35); }
            // răng run khi rét (cử chỉ brr hoặc rất lạnh)
            if ((G && G.k === 'brr') || (out && WX.coldK > 0.85)) T.mo = Math.max(T.mo, 0.05 + 0.08 * (Math.sin(t * 75) > 0 ? 1 : 0));
            // nhìn: con ngươi theo điểm đang nhìn (RX.gp) trong hệ đầu — canvas phải = bên trái nhân vật (+x đầu)
            if (RX.gw > 0.2 && !S.think && !read) { e.head.updateWorldMatrix(true, false); const v = e.head.worldToLocal(_fb.copy(RX.gp)); if (v.z > 0.05) { T.gx = Math.max(-1, Math.min(1, v.x / v.z * 1.6)) * RX.gw; T.gy = Math.max(-1, Math.min(1, -v.y / v.z * 1.6)) * RX.gw; } }
            // chớp mắt (Bentivoglio 1997): nghỉ 17/phút · nói 26 · đọc 4,5 · mệt chớp chậm
            const rate = S.plan ? 26 : read ? 4.5 : 17;
            if (B.t < 0 && (B.next -= dt) <= 0) { B.t = 0; B.dur = 0.15 + 0.12 * tired; B.twin = Math.random() < 0.12; }
            if (B.t >= 0) { B.t += dt; const u = B.t / B.dur; T.eo *= u < 0.4 ? 1 - ease(u / 0.4) : u < 0.55 ? 0 : ease((u - 0.55) / 0.45);
              if (u >= 1) { B.t = -1; B.next = B.twin ? 0.18 : -Math.log(1 - Math.random() * 0.98) * 60 / rate; B.twin = false; } }
            // làm mượt (mắt chớp và miệng nói đi nhanh, nét khác ~0,2 s)
            for (const k of KEYS) { const r = k === 'eo' || k === 'mo' || k === 'mr' || k === 'mw' || k === 'wk' ? 26 : k === 'sw' || k === 'cn' || k === 'bl' || k === 'tr' ? 2 : 8; F[k] += (T[k] - F[k]) * (1 - Math.exp(-dt * r)); }
            if (B.t >= 0) F.eo = T.eo;   // chớp: theo đích ngay
            // vẽ lại khi nét đổi (lượng tử 0,04) · ≤ 30 lần/giây
            if (awake) {
              let key = ''; for (const k of KEYS) key += Math.round(F[k] * 25) + ',';
              if (lastMap !== FC.mat.map) drawn = '';
              if (key !== drawn && t - drawT >= 1 / 30) { drawn = key; drawT = t; draw(F); }
            }
            lastMap = FC.mat.map;
            // dáng + bước theo cảm xúc (áp ở engMoodPost / đi bộ), nghiêng đầu khi nghĩ / đùa
            const b = BODY[E.emo] || BODY.fine, kk = 1 - Math.exp(-dt * 1.5), wk = Math.min(1, 0.55 + 0.2 * E.w);
            M.head += ((b[0] * wk + 0.08 * tired) - M.head) * kk; M.slump += ((b[1] * wk + 0.05 * tired) - M.slump) * kk;
            e.moodSpd = (e.moodSpd || 1) + ((1 + (b[2] - 1) * wk) * (1 - 0.1 * tired) - (e.moodSpd || 1)) * kk;
            e.moodSwing = (e.moodSwing || 1) + ((1 + (b[3] - 1) * wk) * (1 - 0.25 * tired) - (e.moodSwing || 1)) * kk;
            e.moodBob = (e.moodBob || 1) + ((1 + (b[4] - 1) * wk) * (1 - 0.25 * tired) - (e.moodBob || 1)) * kk;
            const tiltT = !awake ? 0 : S.think > 0 ? 0.13 : E.emo === 'playful' ? 0.08 * Math.sin(t * 1.1) : E.emo === 'embarrassed' ? -0.06 : 0;
            M.tilt += (tiltT - M.tilt) * (1 - Math.exp(-dt * 3)); e.head.rotation.z = M.tilt;
            M.nod = 0.035 * S.amp;
            engGrip(e, dt, E);
          }
          // ---- BÀN TAY NẮM / MỞ (morph lưới tay chữ C) ----
          function engGrip(e, dt, E) {
            const G = RX.gest, RW = e.reachW, RL = e.reachL, HW = e.handW, req = e.gripReq || (e.gripReq = [null, null]), g0 = e.grip || (e.grip = [0.35, 0.35]);
            const bias = (E.emo === 'tense' ? 0.35 : E.emo === 'happy' || E.emo === 'playful' ? -0.1 : 0) + 0.3 * WX.coldK;   // căng thẳng: nắm chặt · lạnh: co tay
            for (const i of [0, 1]) {
              let g = 0.35 + bias;
              if (req[i] !== null && req[i] !== undefined) g = req[i];
              else if (engHolding(e, i)) g = 0.9;
              else if (e.inVan && e.van && e.van.station === 'desk' && e.van.st === 'work') g = 0.1;   // gõ phím / rê trackpad: tay mở
              else if (G && G.w > 0.3 && GRIP[G.k] !== undefined && (i === 0 || TWO.has(G.k))) g = G.k === 'finger' && ENV.bf ? 0.1 : G.k === 'catch' && RX.leaf && RX.leaf.st === 'held' ? 0.6 : GRIP[G.k];
              else if (RW && RW[i] > 0.35 && RL && HW) { const d = HW[i].distanceTo(RL[i]) / e.g.scale.y; g = d > 0.16 ? -0.25 : d < 0.06 ? 0.8 : 0.8 - 1.05 * (d - 0.06) / 0.1; }   // với tới: xoè trước, chạm thì khép
              g0[i] += (Math.max(-0.6, Math.min(1, g)) - g0[i]) * (1 - Math.exp(-dt * 10));
              const P = engWristParts(e.wrists[i]); if (P.hand && P.hand.morphTargetInfluences) P.hand.morphTargetInfluences[0] = g0[i];
            }
            req[0] = req[1] = null;
          }
          return { tick, plan, state: { F, T, S, M, B, Y }, draw: () => draw(F) };
        })();
        function engMoodPost(e, dt, t) { RX.pAdd += engFace.state.M.head + engFace.state.M.nod; RX.sp.x += engFace.state.M.slump; }   // dáng theo cảm xúc (engineer/mind/reactions.js engReactPost, ngoài trời)
