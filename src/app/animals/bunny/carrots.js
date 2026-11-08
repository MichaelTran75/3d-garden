        // ==== THỎ ĂN CÀ RỐT Ở LUỐNG (dời 01/11 khỏi engineer/tasks/carrot-garden.js — luống giờ là vật riêng camp/carrot-bed.js) ====
        //  Ban ngày, không mưa, có khóm chín, đã 4–7 phút từ củ trước (củ đầu: 1 phút), người không ở luống ⇒ bỏ đào cà rốt hoang,
        //  nhảy theo bảng dẫn đường tới mép luống cạnh khóm chín, ngửi, nhổ củ (lá rung, củ trồi lên) rồi ngồi ôm gặm 12 s — khóm thành hố trống. Người đi sát (< 1,6) thì bỏ củ nhảy đi.
        //  Thỏ chỉ NHÌN luống qua mặt công khai (worldSee('carrotBed'): khóm chín, chỗ khóm, đường tới luống) rồi CHẠM khóm (giữ chỗ, rung lá, giật, nhổ) — luống tự
        //  đổi khóm của nó; người thì nhìn mặt kỹ sư. Kỹ sư thấy thỏ đang ăn qua mặt bầy thỏ (atBed, bedEating — animals/bunny/face.js) ----
        const BUN_BED = { eatAt: -1e9, gap: 60, who: null };   // cả bầy: củ trước gặm xong lúc nào, gap 4–7 phút giữa 2 củ (củ đầu sau 1 phút) · con đang ở luống
        const _bbA = new THREE.Vector3();
        const bunnyEngNear = (p, r, v = -1) => { const E = worldSee('engineer'); return !!E && E.out && (E.vel || 0) > v && Math.hypot(E.pos.x - p.x, E.pos.z - p.z) < r; };   // người ngoài trời, nhanh hơn v, cách < r
        function bunnyBed(b, dt, t) {   // gọi trong vòng thỏ (animals/bunny/body.js, sau bunnyRain): true = đang lo dáng thỏ
          const CB = worldSee('carrotBed'); if (!CB) return false;
          let J = b.bed;
          if (!J) {
            if (b.state === 'dig' || b.state === 'eatCarrot' || !daytimeAnimals.visible || clock.elapsedTime - BUN_BED.eatAt < BUN_BED.gap) return false;
            const C = CB.pos, R = CB.ripe(); if (!R.length || bunnyEngNear(C, 3)) return false;   // người đang ở luống: chưa tới
            const sl = R.sort((p, q) => Math.hypot(C.x + p.x - b.x, C.z + p.z - b.z) - Math.hypot(C.x + q.x - b.x, C.z + q.z - b.z))[0], side = sl.row ? 1 : -1;
            J = b.bed = { sl, st: 'go', k: 0, at: new THREE.Vector3(C.x + sl.x, 0, C.z + side * (CB.width / 2 + 0.17)) }; CB.claim(sl); BUN_BED.who = b;
          }
          J.k += dt; const sl = J.sl;
          if (J.st !== 'go' && J.st !== 'quit' && bunnyEngNear(b.g.position, 1.6, 0.3)) {   // người đi lại sát: bỏ củ, nhảy đi
            if (J.st === 'eat') { bunnyDropCarrot(b); BUN_BED.eatAt = clock.elapsedTime; } else if (sl.pull) CB.tug(sl, 0);
            J.st = 'quit';
          }
          if (J.st === 'go') {
            const dx = J.at.x - b.x, dz = J.at.z - b.z, dd = Math.hypot(dx, dz);
            if ((dd < 0.08 && !bunAir(b)) || J.k > 120) { J.st = dd < 0.5 ? 'sniff' : 'quit'; J.k = 0; b.hop = 0; }
            else {
              let ux = dx / dd, uz = dz / dd; if (dd > 1.6) { const K = bunNav(), f = ffDir(K ? J.ff || (J.ff = buildFlowField(J.at.x, J.at.z, K, 0.3, BUN_NX)) : CB.field(), b.x, b.z); if (f) { ux = f.x; uz = f.z; } }   // bảng theo va chạm thật tới đúng chỗ ngồi, luống là ô cấm (animals/bunny/hop.js bunNav) — đi vòng sang đúng mép, không lội qua luống
              const lift = bunHop(b, dt, Math.atan2(uz, ux), b.spd * HOP_GO, 3.2 * BUN_CAD, { dd, free: dd <= 0.5 });   // né vật trước khi bật (animals/bunny/hop.js) · sát mép luống (≤ 0,5 m) bỏ va chạm như trước
              b.g.position.set(b.x, cowY(b.x, b.z) + lift, b.z); b.g.rotation.set(0, -b.ang, bunnyHopPitch(b)); b.paws[0].rotation.z = b.paws[1].rotation.z = bunnyHopPaw(b); b.head.rotation.z = 0;
            }
          } else if (J.st === 'quit') { CB.release(sl); b.bed = null; BUN_BED.who = null; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0; b.state = 'hop'; b.tmr = 2.5; b.ang += Math.PI * (0.7 + 0.6 * Math.random()); return false; }
          else {
            const sp = CB.slotPos(sl, _bbA), ta = Math.atan2(sp.z - b.z, sp.x - b.x); let da = ta - b.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); b.ang += da * Math.min(1, dt * 6);
            b.g.position.set(b.x, cowY(b.x, b.z), b.z); b.g.rotation.set(0, -b.ang, 0);
            if (J.st === 'sniff') {   // ngửi khóm lá: đầu gật, lá rung
              b.head.rotation.z = -0.25 + Math.sin(t * 16) * 0.08; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; CB.rustle(sl, Math.sin(t * 9) * 0.15);
              if (J.k > 1.6) { J.st = 'pull'; J.k = 0; }
            } else if (J.st === 'pull') {   // ngoạm lá, giật lùi: củ trồi lên khỏi đất
              const u = Math.min(1, J.k / 1.6); b.head.rotation.z = -0.35 + 0.25 * u; b.paws[0].rotation.z = b.paws[1].rotation.z = 0.5 * u;
              CB.tug(sl, 0.02 + 0.13 * u * u, Math.sin(t * 22) * 0.12 * (1 - u));
              if (J.k > 1.7) { J.st = 'eat'; J.k = 0; CB.bite(sl); b.carrot.visible = true; b.carrot.scale.setScalar(1); b.carrot.position.y = -0.1 + 0.3; }
            } else if (J.st === 'eat') {   // ôm củ gặm (như đào cà rốt hoang)
              const ep = Math.min(1, J.k / 12); b.carrot.scale.setScalar(Math.max(0.06, 1 - ep * ep)); b.paws[0].rotation.z = b.paws[1].rotation.z = 0.9; b.head.rotation.z = -0.28 + Math.sin(t * 14) * 0.12;
              if (J.k > 12) { b.carrot.visible = false; b.carrot.position.y = -0.1; b.paws[0].rotation.z = b.paws[1].rotation.z = 0; b.head.rotation.z = 0; b.bed = null; BUN_BED.who = null; BUN_BED.eatAt = clock.elapsedTime; BUN_BED.gap = 240 + 180 * Math.random(); b.state = 'sniff'; b.tmr = 3 + 3 * Math.random(); b.digTmr = Math.max(b.digTmr, 90); return false; }
            }
          }
          return true;
        }
        function bunnyBedCancel(b) {   // mưa / tối / chó: bỏ dở — đang gặm thì buông củ (trước quên giấu ⇒ thỏ vừa nhảy vừa ngậm củ)
          if (!b.bed) return; const CB = worldSee('carrotBed'), sl = b.bed.sl;
          if (b.bed.st === 'eat') { bunnyDropCarrot(b); BUN_BED.eatAt = clock.elapsedTime; }
          if (CB) { CB.release(sl); if (sl.pull) CB.tug(sl, 0); } b.bed = null; BUN_BED.who = null;
        }
