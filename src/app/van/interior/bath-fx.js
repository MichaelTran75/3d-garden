        // ---- VÒI SEN CỦA XE (dời từ engineer/tasks/routine-fx.js 01/11): người chỉ mở / tắt (VAN.bath.shower), xe tự phun tia nước, bốc hơi làm mờ kính + vách,
        //      sàn ướt tự khô ~25 phút (người gạt nước: VAN.bath.mop). Số ngẫu nhiên riêng (mulberry32) — tắm không làm lệch Math.random của đơn vị khác ----
        const bathShower = (() => {
          const rnd = mulberry32(1800);   // số ngẫu nhiên riêng của vòi sen (tia nước, đám hơi): tắm không làm lệch Math.random của đơn vị khác
          const N = 82, pos = new Float32Array(N * 6), geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          const lines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xd4ecff, transparent: true, opacity: 0.5, depthWrite: false }));
          lines.frustumCulled = false; lines.visible = false; lines.name = 'Tia nước vòi sen'; scene.add(lines);
          const sh = VBR.showerHead, head = vanPt(sh[0], sh[1] - 0.04, sh[2]), dir = vanPt(sh[0], sh[1] - 0.9, sh[2] + 0.435).sub(vanPt(sh[0], sh[1], sh[2])).normalize();
          const side = new THREE.Vector3(Math.cos(caravanObj.rotation.y), 0, -Math.sin(caravanObj.rotation.y)), up2 = new THREE.Vector3().crossVectors(dir, side).normalize();
          const D = Array.from({ length: N }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), live: false })), floorY = dogInside.y - 0.02;
          const sc = document.createElement('canvas'); sc.width = sc.height = 64; const sx = sc.getContext('2d'), gr = sx.createRadialGradient(32, 32, 2, 32, 32, 31);
          gr.addColorStop(0, 'rgba(255,255,255,0.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); sx.fillStyle = gr; sx.fillRect(0, 0, 64, 64);
          const steamTex = new THREE.CanvasTexture(sc);
          const puffs = Array.from({ length: 14 }, (_, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false })); s.visible = false; s.name = 'Hơi nước phòng tắm'; scene.add(s); return { s, t: i * 0.43, x: 0, z: 0 }; });
          const doorOp = VBR.doorMat.opacity, wallOp = VBR.wallMat.opacity;
          let live = 0, idle = false;
          const fx = { on: false, steam: 0, update(dt) {
            if (VBR.wet > 0 || VBR.wetFloor.visible) { VBR.wet = Math.max(0, VBR.wet - dt / 1500); VBR.wetM.opacity = 0.4 * VBR.wet; VBR.wetFloor.visible = VBR.wet > 0.01; }   // sàn buồng tắm: ướt khi tắm, tự khô ~25 phút (gạt nước: van-stations.js)
            if (!fx.on && !live && !fx.steam) { if (!idle) { idle = true; lines.visible = false; for (const p of puffs) p.s.visible = false; } return; }   // tắt nước, hết hơi: không tính gì
            idle = false;
            const h = Math.min(dt, 0.05);
            const st0 = fx.steam; fx.steam = Math.max(0, Math.min(1, fx.steam + (fx.on ? h / 15 : -h / 70)));
            if (fx.steam !== st0) { VBR.doorMat.opacity = doorOp + 0.3 * fx.steam; VBR.wallMat.opacity = wallOp + 0.2 * fx.steam; }   // kính và vách mờ hơi nước
            let any = false;
            for (let i = 0; i < N; i++) {
              const d = D[i];
              if (!d.live) {
                if (!fx.on || rnd() > 0.3) { pos.fill(0, i * 6, i * 6 + 6); continue; }
                d.live = true; d.p.copy(head).addScaledVector(side, (rnd() - 0.5) * 0.1).addScaledVector(up2, (rnd() - 0.5) * 0.1);
                d.v.copy(dir).multiplyScalar(1.5 + rnd() * 0.5).addScaledVector(side, (rnd() - 0.5) * 0.32).addScaledVector(up2, (rnd() - 0.5) * 0.32);
              }
              fallStep(d.p, d.v, h);
              if (d.p.y < floorY) { d.live = false; pos.fill(0, i * 6, i * 6 + 6); continue; }
              any = true; pos[i * 6] = d.p.x; pos[i * 6 + 1] = d.p.y; pos[i * 6 + 2] = d.p.z;
              pos[i * 6 + 3] = d.p.x - d.v.x * 0.03; pos[i * 6 + 4] = d.p.y - d.v.y * 0.03; pos[i * 6 + 5] = d.p.z - d.v.z * 0.03;   // vệt nước ngắn theo hướng rơi
            }
            live = any ? 1 : 0; lines.visible = any; if (any) geo.attributes.position.needsUpdate = true;
            for (const p of puffs) {   // đám hơi nước: sinh quanh dòng nước (giữa vùng tắm ướt, cách vách hông), bốc lên dưới trần, nở ra rồi tan — tấm sprite lớn hơn khoảng cách tới vỏ thì lộ ra ngoài xe
              p.t += h; if (p.t > 6) { p.t -= 6; p.x = sh[0] + (rnd() - 0.5) * 0.35; p.z = sh[2] + 0.12 + (rnd() - 0.5) * 0.25; }
              const k = p.t / 6; p.s.visible = fx.steam > 0.02 && p.x > 0;
              if (!p.s.visible) continue;
              const w = vanPt(p.x, TR.yIn + 0.45 + k * (sh[1] - TR.yIn - 0.75), p.z); p.s.position.copy(w); p.s.scale.setScalar(0.35 + k * 0.6); p.s.material.opacity = 0.7 * Math.sin(Math.PI * k) * fx.steam;
            }
          } };
          return fx;
        })();
        // MỖI KHUNG (sổ tick core/world.js, lượt 'late' đầu tiên — ngay sau lượt kỹ sư): xe chạy phần đi sau người — bếp (van/interior/galley-fx.js: lửa ga,
        //  hơi nồi, khói ống bếp) rồi vòi sen (tia nước, hơi nước, sàn ướt tự khô)
        function vanLateTick(dt, t) { galleyTick(dt, t); bathShower.update(dt); }
        worldTick('late', 10, vanLateTick);
