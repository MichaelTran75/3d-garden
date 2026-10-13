        // ====== CÂU CÁ THEO TƯ LIỆU THỰC TẾ (dây câu + phao + mồi + cần uốn + cá giằng co) ======
        // Quăng cần máy đứng qua vai: thu dây còn ~40 cm phao dưới ngọn, ngón trỏ giữ dây, mở càng → đưa cần ra sau tới ~1 giờ (cần "nạp lực" nhờ quán tính
        // của chính nó và phao) → vụt về trước, nhả dây ở ~10–11 giờ → theo đà hạ ngọn chỉ về phao → phao chạm nước thì đóng càng bằng tay, thu dây chùng.
        // Động học quăng: khuỷu tay biên độ + vận tốc góc lớn nhất, vai ít tham gia (Pomerantsev 2025); vận tốc đỉnh đi theo chuỗi vai → khuỷu → cổ tay
        // (fly-casting, Montana State) — kỹ sư tay cứng nên dồn vào vai dẫn trước, cổ tay (góc cần) bật theo sau.
        // Phao: rơi xuống nằm ngang, dựng đứng dần khi chì + mồi chìm; cá rỉa = phao nhấp nhẹ, cá ăn thật = phao trượt đi rồi chìm hẳn ⇒ giật cần bằng
        // 1 nhịp quét mượt lên + sang ngang (không giật cục). Dìu cá: cần ~45°, nâng từ từ (không quá ~60° = 2/3 từ ngang tới đứng) rồi hạ cần vừa quay
        // máy thu dây; cá chạy thì để phanh nhả dây, cá mệt dần, mỗi lần chạy ngắn hơn. Bờ câu cao 3,6 m trên mặt hồ, koi 0,6–0,75 m (~4–5 kg) không thể
        // nhấc lên bằng cần phao (dây đứt) ⇒ dìu cá tới mặt nước rồi thả ngay dưới nước: chùng dây + rung ngọn cho lưỡi không ngạnh tuột ra — đúng khuyến
        // cáo catch & release (cá không rời nước, không dìu tới kiệt sức). Thay mồi: thu dây còn ~2,3 m, dựng cần cho cụm phao–mồi đu vào tay.
        // Phao + mồi là 2 hạt Verlet nối dây không giãn (dây chỉ căng, không đẩy), có trọng lực, lực nổi theo phần thân phao ngập, cản nước/khí, gió trôi;
        // phao nổi theo đúng sóng đang vẽ trên mặt hồ. Máy 5.2:1 thu ~62 cm dây/vòng tay quay; phanh nhả dây khi lực > ~1,4 kg.
        const FISH_DROP = 0.42, FISH_HOOK = 0.32, FISH_SWING = 2.3, FLOAT_M = 0.012, BAIT_M = 0.006, LINE_PER_TURN = 0.62, FISH_DRAG = 14;
        const FL_N = 26;   // đỉnh polyline dây: mép lô dây + 6 khoen + ngọn (8) · ngọn → phao (16) · phao → lưỡi (2)
        const fishLinePos = new Float32Array(FL_N * 3);
        const fishLineGeo = new THREE.BufferGeometry(); fishLineGeo.setAttribute('position', new THREE.BufferAttribute(fishLinePos, 3));
        const fishLine = new THREE.Line(fishLineGeo, new THREE.LineBasicMaterial({ color: 0x2a2622, transparent: true, opacity: 0.72 })); fishLine.frustumCulled = false; fishLine.visible = false; scene.add(fishLine);
        const bobber = new THREE.Group();
        {
          const tp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), new THREE.MeshBasicMaterial({ color: 0xd84a3a })); tp.position.y = 0.06; bobber.add(tp);
          const bt = new THREE.Mesh(new THREE.SphereGeometry(0.12, 8, 8), foamMat); bt.position.y = -0.05; bobber.add(bt);
        }
        bobber.position.copy(bobberBase); bobber.visible = false; scene.add(bobber);
        // The same lake koi approaches, bites and fights on the hook; no duplicate catch model.
        const fishingBait = new THREE.Group(); fishingBait.name = 'Mồi & lưỡi câu (Fishing Bait)';
        const baitWorm = new THREE.Mesh(new THREE.CylinderGeometry(.025, .035, .12, 5), hiVis);
        baitWorm.rotation.z = .35; baitWorm.position.y = -.015; fishingBait.add(baitWorm);
        const baitHook = new THREE.Mesh(new THREE.TorusGeometry(.035, .007, 4, 8, Math.PI * 1.45), metalMat);
        baitHook.position.y = -.055; fishingBait.add(baitHook);
        fishingBait.visible = false; scene.add(fishingBait);
        const angling = {
          active: false, stage: 'rig', time: 0, wait: 0, hooked: false, catches: 0, lastOutcome: null, fish: null, approachDuration: 0, heading: 0,
          stopReq: false, rebait: false, take: false, beta: 0.6, betaV: 0, tau: 0, tauV: 0, arm: -1.02, armV: 0, crankRate: 0, crankAng: 0,
          T: 0, Tdir: new THREE.Vector3(0, -1, 0), target: new THREE.Vector3(), land: new THREE.Vector3(), adjT: 6, pump: 'lift', pumpT: 0, caught: false, flick: 0, shake: 0,
          free: { p: -0.15, pv: 0, r: -0.05, rv: 0 }, head: { p: 0.3, pv: 0, y: 0, yv: 0 }, B0: new THREE.Vector3(), biteDur: 0, takeDir: new THREE.Vector3(), lean: 0.07
        };
        // phao (F) + mồi/lưỡi (B): hạt Verlet; S = dây đang ra giữa ngọn và phao; mode: 'hang' (treo dưới ngọn) · 'fly' (đang bay, dây ra tự do) · 'water'
        const angFloat = { F: new THREE.Vector3(), Fp: new THREE.Vector3(), B: new THREE.Vector3(), Bp: new THREE.Vector3(), S: FISH_DROP, mode: 'hang', bKin: false, up: new THREE.Vector3(0, 1, 0) };
        // cá đang mắc câu: miệng M (= lưỡi), vận tốc, kiểu bơi (chạy · lắc đầu · bị kéo · đuối), sức bền, lực dây
        const angFish = { M: new THREE.Vector3(), V: new THREE.Vector3(), mode: 'run', modeT: 0, dur: 1, stam: 1, ang: 0, T: 0, ext: 0, slip: false, head: 0 };
        let anglingSeed = (0x4a6d35a1 ^ (bobberBase.x * 997 | 0) ^ (bobberBase.z * 499 | 0)) >>> 0;
        function anglingRandom() { anglingSeed = (Math.imul(1664525, anglingSeed) + 1013904223) >>> 0; return anglingSeed / 4294967296; }
        const _anglerFishStart = new THREE.Vector3(), _anglerMouth = new THREE.Vector3(), _anglerMouthOffset = new THREE.Vector3();
        const _fishReturnStart = new THREE.Vector3(), _fishReturnDir = new THREE.Vector3();
        const _aTip = new THREE.Vector3(), _aV = new THREE.Vector3(), _aV2 = new THREE.Vector3(), _aV3 = new THREE.Vector3(), _aQ = new THREE.Quaternion(), _aQ2 = new THREE.Quaternion(), _aS = new THREE.Vector3(), _aM = new THREE.Matrix4();
        let returningFishingFish = null, fishReturnTime = 0;
        function lakeSurfaceY(x, z) { return lakeY + waveAt(x, z); }   // mặt hồ câu = mực tĩnh + sóng của mô phỏng nước nông (cùng số liệu shader)
        // ---- bọt nước: vòng sóng loang + giọt bắn (pool cố định, không cấp phát khi chạy) ----
        const splashFx = (() => {
          const ringGeo = new THREE.RingGeometry(0.82, 1, 28); ringGeo.rotateX(-Math.PI / 2);
          const rings = [];
          for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: 0xe6f3ff, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide })); m.visible = false; m.renderOrder = 2; m.name = 'Vòng sóng câu cá'; scene.add(m); rings.push({ m, t: 1, dur: 1, size: 1 }); }
          const N = 28, drops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 5, 4), new THREE.MeshBasicMaterial({ color: 0xeaf6ff, transparent: true, opacity: 0.85, depthWrite: false }), N);
          drops.frustumCulled = false; drops.name = 'Giọt nước bắn (câu cá)'; scene.add(drops);
          const D = Array.from({ length: N }, () => ({ p: new THREE.Vector3(), v: new THREE.Vector3(), on: false })), mtx = new THREE.Matrix4(), zero = new THREE.Matrix4().makeScale(0, 0, 0);
          for (let k = 0; k < N; k++) drops.setMatrixAt(k, zero);
          let di = 0, live = 0;
          return {
            spawn(x, z, power) {
              fluids?.splash(x, z, 0.4 + power * 0.6, 0.1 + power * 0.25);   // phao rơi, cá quẫy → sóng lan thật trên mặt hồ
              const y = lakeSurfaceY(x, z) + 0.01, r = rings.find(o => o.t >= o.dur) || rings[0];
              Object.assign(r, { t: 0, dur: 0.9 + power * 0.6, size: 0.3 + power * 0.7 }); r.m.position.set(x, y, z); r.m.visible = true;
              for (let k = Math.round(3 + power * 9); k > 0; k--) { const d = D[di++ % N], a = anglingRandom() * 6.283, s = (0.4 + anglingRandom()) * power; d.p.set(x, y, z); d.v.set(Math.cos(a) * s, 0.9 + anglingRandom() * 1.6 * power, Math.sin(a) * s); d.on = true; }
              live = 2;
            },
            update(dt) {
              if (!live) return;
              let any = false;
              for (const r of rings) if (r.t < r.dur) { r.t += dt; const u = Math.min(1, r.t / r.dur); r.m.scale.setScalar(r.size * (0.15 + 0.85 * Math.pow(u, 0.6))); r.m.material.opacity = 0.6 * (1 - u) * (1 - u); if (u >= 1) r.m.visible = false; else any = true; }
              for (let k = 0; k < N; k++) { const d = D[k]; if (!d.on) continue; d.v.y -= 9.81 * dt; d.p.addScaledVector(d.v, dt); if (d.p.y < lakeY - 0.05) { d.on = false; drops.setMatrixAt(k, zero); continue; } any = true; drops.setMatrixAt(k, mtx.makeTranslation(d.p.x, d.p.y, d.p.z)); }
              drops.instanceMatrix.needsUpdate = true; if (!any) live--;
            }
          };
        })();
        function placeFishingFish(f, mouthPoint, heading, vertical, t, struggle = 0) {
          f.swim(t, struggle);
          f.g.rotation.set(0, -heading, vertical);
          _anglerMouthOffset.copy(f.mouth).multiply(f.g.scale).applyQuaternion(f.g.quaternion);
          f.g.position.copy(mouthPoint).sub(_anglerMouthOffset);
        }
        function releaseFishingFish(splash = false) {   // cá rời lưỡi: lấy lại thăng bằng rồi lặn ra xa bờ, sau đó bơi lang thang như cũ
          const f = angling.fish;
          if (!f) return;
          if (f.keeper) { grill.lost(); angling.fish = null; angFloat.bKin = false; return; }   // cá rô sổng (thôi câu giữa chừng): bếp vẫn trống cá
          f.g.updateWorldMatrix(true, false); f.g.localToWorld(_fishReturnStart.copy(f.mouth));
          const a = Math.atan2(_fishReturnStart.z - _aTip.z, _fishReturnStart.x - _aTip.x) + (anglingRandom() - 0.5) * 1.2;
          _fishReturnDir.set(Math.cos(a), 0, Math.sin(a));
          returningFishingFish = f; fishReturnTime = 0; f.relHeading = Math.atan2(_fishReturnDir.z, _fishReturnDir.x);
          if (splash) splashFx.spawn(_fishReturnStart.x, _fishReturnStart.z, 0.8);
          angling.fish = null; angFloat.bKin = false;
        }
        const bucketTop = (() => { let b = null; return out => { b = b || scene.getObjectByName('Xô nhỏ (Metal Bucket)'); if (!b) return out.copy(engObj.g.position); b.getWorldPosition(out); out.y += 0.24; return out; }; })();
        function beginFishingFish() {
          if (grill.st === 'empty' && (!liveWeather.wildlifeAwake || anglingRandom() < 0.6)) {   // bếp chưa có cá nướng: con cắn câu là cá rô (~0,4 kg, nhấc lên bờ được) — giữ lại mang về nướng
            const kf = grill.toKeeper(), gp = engObj.g.position, a = Math.atan2(angFloat.B.z - gp.z, angFloat.B.x - gp.x) + (anglingRandom() - 0.5) * 1.2;
            kf.g.position.set(angFloat.B.x + Math.cos(a) * 2.4, lakeY - 0.55, angFloat.B.z + Math.sin(a) * 2.4); kf.g.rotation.set(0, 0, 0); kf.g.updateWorldMatrix(true, true);
            angling.fish = kf; kf.g.localToWorld(_anglerFishStart.copy(kf.mouth));
            angling.heading = Math.atan2(angFloat.B.z - _anglerFishStart.z, angFloat.B.x - _anglerFishStart.x); angling.approachDuration = 3.5;
            anglingGo('approach'); return true;
          }
          let best = null, distance = Infinity;
          // These seven fish belong to the lower lake; leave the three upper-lake fish alone.
          for (let i = 0; i < Math.min(7, fishies.length); i++) {
            const f = fishies[i]; if (f === returningFishingFish) continue;
            const d = f.g.position.distanceToSquared(angFloat.B);
            if (d < distance) { distance = d; best = f; }
          }
          if (!best) return false;
          angling.fish = best;
          best.g.updateWorldMatrix(true, false); best.g.localToWorld(_anglerFishStart.copy(best.mouth));
          angling.heading = Math.atan2(angFloat.B.z - _anglerFishStart.z, angFloat.B.x - _anglerFishStart.x);
          angling.approachDuration = Math.max(2, Math.min(7, Math.sqrt(distance) / 2.2));
          anglingGo('approach'); return true;
        }
        function anglingGo(st) { angling.stage = st; angling.time = 0; }
        function anglingEvent(kind, p) {   // việc vừa xảy ra khi câu → nảy ý nghĩ đúng việc đó ngay (theo xác suất cho đỡ lắm lời)
          if (Math.random() >= p) return;
          angling.event = kind; angling.eventAt = Date.now();
          thoughtUntil = Math.min(thoughtUntil, Date.now()); idleThoughtAt = Math.min(idleThoughtAt, Date.now() + 600);
        }
        function resetFishingBite() {
          if (!angling.active && !angling.fish) return;
          releaseFishingFish();
          Object.assign(angling, { active: false, stage: 'rig', time: 0, hooked: false, stopReq: false, rebait: false, take: false, T: 0, crankRate: 0 });
          fishingBait.visible = false; bobber.rotation.set(0, 0, 0);
          const fx = engObj.rod && engObj.rod.userData.flex; if (fx) { fx.th.fill(0); fx.vel.fill(0); fx.n = 0; for (const s of fx.segs) s.g.rotation.set(0, 0, 0); }
          engObj.rodGrp.rotation.y = 0;
        }
        function fishingStatusText() {
          const A = angling;
          switch (A.stage) {
            case 'rig': return 'Chuẩn bị quăng';
            case 'cast': case 'flight': return 'Quăng câu';
            case 'settle': return 'Đóng càng, thu dây chùng';
            case 'approach': return 'Cá đang tới mồi';
            case 'bite': return A.take ? 'Phao chìm!' : 'Phao nhấp…';
            case 'strike': return 'Giật cần!';
            case 'fight': return angFish.slip ? 'Cá chạy, phanh nhả dây' : 'Đang dìu cá';
            case 'release': return 'Thả cá dưới nước';
            case 'land': return 'Nhấc cá rô lên bờ';
            case 'missed': return 'Hụt rồi!';
            case 'retrieve': case 'reel_in': return 'Thu dây';
            case 'rebait': return 'Thay mồi';
            case 'done': return 'Cất cần';
          }
          return "><(((('>";
        }
        function fishingEase(p) { p = Math.min(1, Math.max(0, p)); return p * p * (3 - 2 * p); }
        function anglingLean() {   // gập thân khi ngồi câu (đưa vào e.seatLean): chờ hơi đổ tới · thấy phao nhấp thì nhoài tới · giật/dìu thì ngồi thẳng · thả cá cúi nhìn xuống
          const A = angling;
          switch (A.stage) {
            case 'bite': return 0.15;
            case 'strike': return -0.03;
            case 'fight': return A.pump === 'lift' || angFish.slip ? -0.04 : 0.05;
            case 'release': return 0.2;
            case 'land': return 0.1;
            case 'cast': return A.time < 0.62 ? -0.05 : 0.1;
            case 'rebait': return 0.03;
          }
          return 0.07;
        }
        // ---- CẦN UỐN: elastica tựa tĩnh (κ = M/EI) cho từng đoạn + đáp ứng động bậc 2 (~2,6 Hz, tắt dần) ----
        //      tải: lực dây ở ngọn + trọng lượng đoạn cần + lực quán tính của chính thân cần khi tay vụt (gia tốc từng đoạn nếu cần cứng)
        function rodFlexStep(rod, dt) {
          const X = rod.userData.flex; if (!X) return;
          const S = X.segs, n = S.length, root = rod;
          root.updateWorldMatrix(true, false); root.matrixWorld.decompose(_aV3, _aQ, _aS);
          const qInv = _aQ2.copy(_aQ).invert();
          // gia tốc từng đoạn khi cần cứng (sai phân bậc 2 vị trí giữa đoạn) → lực quán tính −m·a; lọc nhẹ chống nhiễu
          let s0 = 0;
          for (let k = 0; k < n; k++) {
            const mid = S[0].g.position.y + s0 + S[k].len / 2; s0 += S[k].len;
            const pm = X.pm[k]; pm[2].copy(pm[1]); pm[1].copy(pm[0]); pm[0].set(0, mid, 0).applyMatrix4(root.matrixWorld);
            if (X.n >= 2) { _aV.copy(pm[0]).sub(pm[1]).sub(pm[1]).add(pm[2]).divideScalar(dt * dt); X.acc[k].lerp(_aV.clampLength(0, 400), 1 - Math.exp(-dt * 30)); }
          }
          X.n++;
          // hình dạng hiện tại → nút đầu mỗi đoạn trong khung gốc cần (đv cục bộ)
          const nodes = X.nodes || (X.nodes = Array.from({ length: n + 1 }, () => new THREE.Vector3())), qs = X.qs || (X.qs = Array.from({ length: n + 1 }, () => new THREE.Quaternion()));
          nodes[0].set(0, S[0].g.position.y, 0); qs[0].identity();
          for (let k = 0; k < n; k++) { _aQ.setFromEuler(S[k].g.rotation); qs[k + 1].copy(qs[k]).multiply(_aQ); nodes[k + 1].set(0, S[k].len, 0).applyQuaternion(qs[k + 1]).add(nodes[k]); }
          // tải trong khung gốc (N): lực dây tại ngọn; trọng lượng + quán tính tại giữa từng đoạn
          const Ft = _aV.copy(X.F).applyQuaternion(qInv);
          const Mo = X.Mo || (X.Mo = new THREE.Vector3()), Fs = X.Fs || (X.Fs = new THREE.Vector3());
          Mo.crossVectors(nodes[n], Ft); Fs.copy(Ft);
          for (let k = n - 1; k >= 0; k--) {
            const m = S[k].m;
            _aV2.set(0, -9.81 * m, 0).addScaledVector(X.acc[k], -m).applyQuaternion(qInv);   // trọng lực + quán tính (thế giới → gốc)
            _aV3.copy(nodes[k]).add(nodes[k + 1]).multiplyScalar(0.5);
            Mo.add(_aS.crossVectors(_aV3, _aV2)); Fs.add(_aV2);
            // mômen uốn tại nút k do mọi tải phía ngọn: Σ(r × F) − n_k × ΣF  → đổi sang khung khớp k → góc gập mục tiêu
            const Mk = _aS.copy(Mo).sub(_aV3.crossVectors(nodes[k], Fs)).applyQuaternion(_aQ.copy(qs[k]).invert());
            const c = S[k].len / S[k].ei;   // độ cứng đã hiệu chỉnh theo đv cục bộ của cần (cánh tay đòn cục bộ × lực N)
            const tx = Math.max(-0.9, Math.min(0.9, Mk.x * c)), tz = Math.max(-0.9, Math.min(0.9, Mk.z * c));
            // đáp ứng động bậc 2 về hình dạng tựa tĩnh (Euler bán ẩn, ổn định với dt ≤ 0,05)
            const w0 = 2 * Math.PI * 2.6, z0 = 0.14;
            X.vel[2 * k] += (w0 * w0 * (tx - X.th[2 * k]) - 2 * z0 * w0 * X.vel[2 * k]) * dt; X.th[2 * k] += X.vel[2 * k] * dt;
            X.vel[2 * k + 1] += (w0 * w0 * (tz - X.th[2 * k + 1]) - 2 * z0 * w0 * X.vel[2 * k + 1]) * dt; X.th[2 * k + 1] += X.vel[2 * k + 1] * dt;
            S[k].g.rotation.set(X.th[2 * k], 0, X.th[2 * k + 1]);
          }
        }
        // ---- tay & đầu người câu (chạy SAU lớp tư thế, ghi đè phần hiển thị rồi ghi ngược vào lớp tư thế cho liền mạch khi thôi câu) ----
        function anglerAim(e, i, target, out) {   // góc gập + góc dang của cánh tay cứng để găng chỉ vào điểm đích (thế giới)
          const d = e.g.worldToLocal(_aV.copy(target)).sub(_aV2.set(i ? 0.34 : -0.34, 1.86, 0)).normalize();
          out[0] = Math.atan2(-d.z, -d.y); out[1] = Math.asin(Math.max(-1, Math.min(1, d.x))); return out;
        }
        const _aimOut = [0, 0];
        function updateFishingBite(e, dt, t) {
          const A = angling, P = angFloat, rod = e.rod, U = rod.userData, g = e.g;
          const lam = g.rotation.x, awake = liveWeather.wildlifeAwake;
          if (!A.active) {   // vừa cầm cần: phao treo dưới ngọn, chọn điểm quăng (lệch ngẫu nhiên quanh điểm phao quen thuộc)
            g.updateWorldMatrix(true, true); U.tip.getWorldPosition(_aTip);
            Object.assign(A, { active: true, stopReq: false, rebait: false, take: false, T: 0, beta: 1.08, betaV: 0, tau: 0, tauV: 0, arm: -1.15, armV: 0, crankRate: 0, wait: 10 + anglingRandom() * 14 });
            e.arms[1].rotation.x = -1.15; e.rodTilt.rotation.x = Math.PI / 2 - 1.08 - 1.02 + 1.15 - lam; engArmSolve(e, 1, dt); e.armDone[1] = 0; g.updateWorldMatrix(true, true); U.tip.getWorldPosition(_aTip);
            A.free.p = e.arms[0].rotation.x; A.head.p = e.head.rotation.x; A.head.y = e.head.rotation.y;
            P.F.copy(_aTip); P.F.y -= FISH_DROP; P.Fp.copy(P.F); P.B.copy(P.F); P.B.y -= FISH_HOOK; P.Bp.copy(P.B); P.S = FISH_DROP; P.mode = 'hang'; P.bKin = false;
            anglingGo('rig'); pickCastTarget();
          }
          A.time += dt;
          const k = A.time;
          if (!awake && A.fish && !A.fish.keeper && (A.stage === 'approach' || A.stage === 'bite')) { releaseFishingFish(); anglingGo('wait'); A.wait = 15; }
          // ===== 1) giai đoạn → đích tư thế (góc cần beta, xoay cổ tay tau, vai cầm cần arm), tay kia, ánh nhìn, tốc độ quay máy =====
          let betaT = 0.6, tauT = 0, armT = -1.02, free = 'knee', crank = 0, direct = false, gaze = P.F;
          const T0 = A.T;
          switch (A.stage) {
            case 'rig': {   // phao treo ~40 cm dưới ngọn · tay phải mở càng, ngón giữ dây, rồi nắm chuôi cần — mắt nhìn điểm định quăng
              betaT = 1.08; armT = -1.15; free = k < 0.5 ? 'reel' : 'butt'; gaze = A.target; P.S = FISH_DROP;
              if (k >= 1.0) { if (A.stopReq) anglingGo('done'); else { pickCastTarget(); anglingGo('cast'); anglingEvent('cast', 0.2); } }
              break;
            }
            case 'cast': {   // ra sau tới ~1 giờ (0,5 s) · dừng nạp cần 0,12 s · vụt tới: vai dẫn trước, cổ tay bật theo sau · nhả dây khi cần qua ~10 giờ 30
              const b1 = 2.06, a1 = -2.05;
              if (k < 0.5) { const m = minJerk(k / 0.5); betaT = 1.08 + (b1 - 1.08) * m; armT = -1.15 + (a1 + 1.15) * m; }
              else if (k < 0.62) { betaT = b1; armT = a1; }
              else { const u = k - 0.62; armT = a1 + (-1.45 - a1) * minJerk(u / 0.28); betaT = b1 + (0.785 - b1) * minJerk((u - 0.06) / 0.22); }
              direct = true; free = 'butt'; gaze = A.target; P.S = FISH_DROP;
              if (k >= 0.9) { castLaunch(); anglingGo('flight'); }
              break;
            }
            case 'flight': {   // theo đà hạ ngọn chỉ về phao, dây ra tự do; tay phải về tay quay chờ đóng càng
              const m = minJerk(k / 0.55); betaT = 0.785 + (0.5 - 0.785) * m; armT = -1.45 + (-1.05 + 1.45) * m; direct = k < 0.55;
              free = 'reel'; gaze = P.F;
              if (P.mode === 'water') { anglingGo('settle'); A.land.copy(P.F); }
              else if (k > 4) { P.mode = 'water'; anglingGo('settle'); A.land.copy(P.F); }
              break;
            }
            case 'settle': {   // đóng càng bằng tay (vòng quay đầu), thu dây chùng còn chút võng; phao nằm rồi dựng đứng khi mồi chìm
              betaT = 0.5; free = 'reel';
              const D = P.F.distanceTo(_aTip), want = D + 0.12;
              if (k > 0.25 && (k < 0.8 || P.S > want)) { crank = 1.4; if (P.S > want) P.S = Math.max(want, P.S - LINE_PER_TURN * A.crankRate * dt); }
              P.S = Math.max(P.S, D + 0.05);
              if (k >= 1.8) { anglingGo('wait'); A.adjT = 5 + anglingRandom() * 5; A.land.copy(P.F); A.wait = 12 + anglingRandom() * 18; }   // mỗi lần quăng, cá tới mồi sau 12–30 s
              break;
            }
            case 'wait': case 'approach': {   // ngồi canh phao: thỉnh thoảng nâng cần nhè nhẹ rồi hạ, thu bớt dây chùng; phao trôi xa do gió thì quăng lại chỗ cũ
              A.adjT -= dt;
              const adj = A.adjT < 0 ? Math.sin(Math.min(1, -A.adjT / 2) * Math.PI) : 0;
              betaT = 0.52 + 0.1 * adj; free = adj > 0.05 ? 'reel' : 'knee'; crank = adj > 0.5 ? 0.35 : 0;
              if (A.adjT < -2) A.adjT = 7 + anglingRandom() * 6;
              const D = P.F.distanceTo(_aTip); if (crank) P.S = Math.max(D + 0.06, P.S - LINE_PER_TURN * A.crankRate * dt); P.S = Math.max(P.S, D + 0.04);
              if (A.stage === 'wait') {
                A.wait -= dt;
                const drift = Math.hypot(P.F.x - A.land.x, P.F.z - A.land.z);   // trôi so với chỗ phao đã đứng
                if (A.stopReq) { A.rebait = false; anglingGo('retrieve'); }
                else if (drift > 1.25) { A.rebait = false; anglingGo('retrieve'); anglingEvent('drift', 0.85); }   // "gió đẩy phao trôi dạt, phải quăng lại chỗ cũ"
                else if (A.wait <= 0 && (awake || grill.st === 'empty') && e.timer > 24) beginFishingFish();   // cá rô kiếm ăn cả lúc chạng vạng
              } else if (k >= A.approachDuration) {
                anglingGo('bite'); A.take = false; A.biteDur = 1.4 + anglingRandom() * 1.6; A.hooked = anglingRandom() < (A.fish && A.fish.keeper ? 0.8 : .42);   // cá rô đớp mồi mạnh, dễ dính lưỡi anglingEvent('bite', 0.55);
                A.B0.copy(P.B); P.bKin = true;
                _aV.set(P.B.x - _aTip.x, 0, P.B.z - _aTip.z).normalize(); A.takeDir.set(-_aV.z, 0, _aV.x).multiplyScalar(anglingRandom() < 0.5 ? 1 : -1).addScaledVector(_aV, 0.6).normalize();
              }
              if (A.stopReq && A.stage === 'approach') { releaseFishingFish(); A.rebait = false; anglingGo('retrieve'); }
              break;
            }
            case 'bite': {   // cá rỉa: phao nhấp nhẹ 2–4 lần → cá ăn thật: phao trượt đi rồi chìm hẳn; người nhoài tới, tay lên tay quay, hạ ngọn bớt dây chùng
              betaT = 0.45; free = 'reel';
              const nib = Math.max(0, Math.sin(k * 7.3) * Math.sin(k * 2.9 + 1.1)), m = A.take ? minJerk((k - A.biteDur) / 0.7) : 0;
              if (!A.take && k >= A.biteDur) A.take = true;
              P.B.copy(A.B0); P.B.y -= 0.07 * nib * nib + 0.32 * m; P.B.addScaledVector(A.takeDir, 0.34 * m);   // mồi bị kéo → phao bị kéo theo qua dây phao–lưỡi
              if (A.take && k >= A.biteDur + 0.45) { anglingGo('strike'); A.sb0 = A.beta; A.sa0 = A.arm; }   // phản xạ ~0,3 s sau khi phao chìm
              if (A.stopReq && !A.take) { releaseFishingFish(); A.rebait = false; anglingGo('retrieve'); }
              break;
            }
            case 'strike': {   // giật cần: 1 nhịp quét mượt lên + sang ngang (~0,3 s), không giật cục
              const m = minJerk(k / 0.3);
              betaT = A.sb0 + (1.12 - A.sb0) * m; tauT = -0.24 * m; armT = A.sa0 + (-1.3 - A.sa0) * m; direct = true; free = 'reel';
              if (!A.struck && k >= 0.1) {
                A.struck = true;
                if (A.hooked) {   // mắc câu: cá giật lại, lao đi lần đầu
                  angFish.M.copy(P.B); angFish.V.set(A.takeDir.x * 0.8, -0.2, A.takeDir.z * 0.8); angFish.stam = A.fish.keeper ? 0.45 : 1; angFish.ext = 0; angFish.slip = false; angFish.head = A.heading;
                  fishMode('run'); P.S = Math.max(P.F.distanceTo(_aTip) - 0.05, 0.5); splashFx.spawn(P.F.x, P.F.z, 0.7);
                } else { releaseFishingFish(true); A.T = 2.2; }   // hụt: cá nhả mồi, phao bật lên
              }
              if (A.hooked && A.struck) A.T = Math.max(A.T, 11 * minJerk((k - 0.1) / 0.18));
              if (k >= 0.32) { A.struck = false; if (A.hooked && A.fish) { anglingGo('fight'); A.pump = 'hold'; A.pumpT = 0; anglingEvent('hook', 0.85); } else { A.lastOutcome = 'miss'; anglingGo('missed'); anglingEvent('miss', 0.8); } }
              break;
            }
            case 'fight': {   // dìu cá: cần ~35–60°, nâng từ từ rồi hạ cần vừa quay máy; cá chạy thì giữ cần cao để phanh nhả dây; ngọn bám theo hướng cá
              const F = angFish; A.pumpT += dt; free = 'reel'; gaze = F.M;
              if (F.slip) { A.pump = 'hold'; A.pumpT = 0; }
              else if (A.pump === 'hold' && A.pumpT > 0.25) { A.pump = 'lift'; A.pumpT = 0; }
              else if (A.pump === 'lift' && A.pumpT >= 1.1) { A.pump = 'drop'; A.pumpT = 0; }
              else if (A.pump === 'drop' && A.pumpT >= 0.8) { A.pump = 'lift'; A.pumpT = 0; }
              if (A.pump === 'hold') betaT = 0.95;
              else if (A.pump === 'lift') betaT = 0.61 + 0.44 * minJerk(A.pumpT / 1.1);
              else { betaT = 1.05 - 0.44 * minJerk(A.pumpT / 0.8); crank = 1.8; P.S = Math.max(0.6, P.S - LINE_PER_TURN * A.crankRate * dt); }
              _aV.copy(F.M); g.worldToLocal(_aV); tauT = Math.max(-0.38, Math.min(0.38, -Math.atan2(_aV.x, Math.max(0.5, _aV.z)) * 0.55));   // ngọn cần nghiêng theo hướng cá
              armT = -1.1 - 0.12 * (betaT - 0.61);
              const surf = lakeSurfaceY(F.M.x, F.M.z), hd = Math.hypot(F.M.x - _aTip.x, F.M.z - _aTip.z);
              if (F.stam < 0.3 && surf - F.M.y < 0.16 && hd < 3.4) anglingGo('release');
              if (k > 30) F.stam = Math.min(F.stam, 0.25);
              break;
            }
            case 'land': {   // cá rô nhẹ: nâng cần nhấc cá khỏi mặt nước, đu lên bờ theo cung → tay phải nắm thân cá, gỡ lưỡi → bỏ vào xô bên trái ghế
              const F = angFish, kf = A.fish; free = 'knee'; gaze = F.M; betaT = 1.25; crank = k < 1.4 ? 1.5 : 0;
              P.S = Math.max(FISH_DROP, P.S - LINE_PER_TURN * A.crankRate * dt);
              if (!A.land0) { A.land0 = F.M.clone(); splashFx.spawn(F.M.x, F.M.z, 0.6); }
              if (kf) {
                const hold = g.localToWorld((A.rh || (A.rh = new THREE.Vector3())).set(-0.3, 1.55, 0.7)), R = e.reachT || (e.reachT = [null, null]);   // vector riêng: đích tay đọc ở engArmPost cuối khung
                if (k < 1.5) { const u = fishingEase(k / 1.5); F.M.lerpVectors(A.land0, hold, u); F.M.y += Math.sin(u * Math.PI) * 0.9; if (k > 1.1) R[0] = F.M; }
                else { R[0] = k < 2.5 ? hold : bucketTop(A.rb || (A.rb = new THREE.Vector3())); F.M.copy(e.handW[0]); F.M.y += 0.1; gaze = k < 2.5 ? F.M : R[0]; }   // nắm cá trong tay → bỏ xô
                if (k >= 3.3) { grill.toBucket(); A.fish = null; P.bKin = false; A.catches++; A.lastOutcome = 'catch'; anglingEvent('keep', 0.9); }
              }
              if (k >= 3.8) { A.land0 = null; A.rebait = true; anglingGo('retrieve'); }
              break;
            }
            case 'release': {   // cá đuối nổi dưới chân bờ: hạ ngọn chùng dây, rung ngọn 2 nhịp cho lưỡi không ngạnh tuột — cá không rời nước
              if (A.fish && A.fish.keeper) { anglingGo('land'); break; }
              free = 'knee'; gaze = A.fish ? angFish.M : P.F;
              const fl = (u) => Math.exp(-Math.pow((k - u) / 0.07, 2));
              betaT = 0.36 + 0.13 * (fl(0.85) + fl(1.15)); direct = k > 0.6 && k < 1.4;
              if (k < 0.6) P.S += 0.6 * dt;
              if (A.fish && k >= 1.25) { releaseFishingFish(true); A.catches++; A.lastOutcome = 'catch'; anglingEvent('release', 0.9); }
              if (k >= 2.6) { A.rebait = true; anglingGo('retrieve'); }
              break;
            }
            case 'missed': {   // hụt: lắc đầu, phao nổi lại
              betaT = 0.72; free = 'knee'; A.shake = Math.sin(k * 12) * 0.22 * Math.max(0, 1 - k / 0.9);
              if (k >= 1.3) { A.rebait = anglingRandom() < 0.6; anglingGo('retrieve'); }
              break;
            }
            case 'retrieve': {   // quay máy thu dây: phao lướt trên mặt nước về chân bờ rồi được kéo lên, đu dưới ngọn
              betaT = 0.78; free = 'reel'; crank = 2.2;
              const stop = A.rebait && !A.stopReq ? FISH_SWING : FISH_DROP;
              P.S = Math.max(stop, P.S - LINE_PER_TURN * A.crankRate * dt);
              if (P.S <= stop + 1e-3 && (P.mode === 'hang' || k > 9)) { crank = 0; if (A.stopReq) anglingGo('done'); else if (A.rebait) { anglingGo('rebait'); A.caught = false; anglingEvent('rebait', 0.35); } else anglingGo('rig'); }
              break;
            }
            case 'rebait': {   // dựng cần cho cụm phao–mồi đu vào tay, tay phải bắt lấy mồi, thay mồi, thả ra rồi thu dây về đoạn treo để quăng
              free = A.caught ? 'chest' : 'bait'; gaze = P.B;
              if (!A.caught) {
                betaT = k < 0.8 ? 1.25 + 0.2 * minJerk(k / 0.8) : 1.45 + 0.17 * Math.sin(Math.min(1, (k - 0.8) / 0.6) * Math.PI * 0.5);
                _aV2.copy(e.handW[0]);
                if (_aV2.distanceTo(P.B) < 0.2 || k > 2.6) { A.caught = true; A.catchT = k; P.bKin = true; }
              } else {
                betaT = 1.32; const h = k - A.catchT;
                _aV2.copy(e.handW[0]); P.B.lerp(_aV2, Math.min(1, dt * 14));   // mồi trong tay
                if (h > 0.4 && h < 1.6) gaze = _aV2;
                if (h >= 1.7) { P.bKin = false; A.rebait = false; anglingGo('reel_in'); }
              }
              break;
            }
            case 'reel_in': {   // thu đoạn dây về ~40 cm dưới ngọn, sẵn sàng quăng
              betaT = 1.1; free = 'reel'; crank = 1.6;
              P.S = Math.max(FISH_DROP, P.S - LINE_PER_TURN * A.crankRate * dt);
              if (P.S <= FISH_DROP + 1e-3) anglingGo(A.stopReq ? 'done' : 'rig');
              break;
            }
            case 'done': betaT = 1.0; armT = -1.1; free = 'knee'; P.S = Math.max(FISH_DROP, P.S - 1.2 * dt); break;
          }
          // ===== 2) áp tư thế cần (lò xo giảm chấn tới hạn cho mượt; pha quăng/giật bám sát quỹ đạo) =====
          A.beta = engSpring(A.beta, A.betaV, betaT, direct ? 60 : 16, dt); A.betaV = engSpring.v;
          A.arm = engSpring(A.arm, A.armV, armT, direct ? 60 : 12, dt); A.armV = engSpring.v;
          A.tau = engSpring(A.tau, A.tauV, tauT, 10, dt); A.tauV = engSpring.v;
          e.arms[1].rotation.x = A.arm; e.arms[1].rotation.z = 0;
          e.rodTilt.rotation.x = Math.PI / 2 - A.beta - 1.02 - A.arm - lam;   // cổ tay bù để ngọn đúng góc beta dù thân đang gập
          e.rodGrp.rotation.y = A.tau;
          engArmSolve(e, 1, dt);   // giải khuỷu tay cầm cần NGAY: ngọn, khoen, tay quay đọc dưới đây đúng chỗ cần được vẽ (không thì dây lệch khỏi cần)
          A.crankRate += (crank - A.crankRate) * (1 - Math.exp(-dt * 10)); A.crankAng -= A.crankRate * Math.PI * 2 * dt; U.crank.rotation.x = A.crankAng;
          // ===== 3) cần uốn theo lực dây kỳ trước + quán tính khi vụt =====
          U.flex.F.copy(A.Tdir).multiplyScalar(A.T);
          rodFlexStep(rod, dt);
          g.updateWorldMatrix(true, true); U.tip.getWorldPosition(_aTip);
          // ===== 4) cá mắc câu =====
          if (A.stage === 'fight' && A.fish) { fishFightStep(dt, t); P.B.copy(angFish.M); P.bKin = true; }
          else if (A.stage === 'land' && A.fish) { P.B.copy(angFish.M); P.bKin = true; }
          // ===== 5) phao + mồi (Verlet + ràng buộc dây) =====
          const Fbefore = _aV3.copy(P.F); let tipPull = 0;
          floatStep(dt, (pull) => { tipPull += pull; });
          // lực dây ở ngọn cho khung hình sau: cá (khi dìu) · lực giữ phao (khi treo/kéo) · rất nhỏ khi phao nổi
          if (A.stage === 'fight') A.T = angFish.T;
          else if (A.stage === 'strike') A.T *= 0.85;
          else A.T += (Math.min(6, FLOAT_M * tipPull / (dt * dt)) + (P.mode === 'water' ? 0.05 : 0) - A.T) * (1 - Math.exp(-dt * 12));
          // ===== 6) cá đang tới / đang rỉa / mắc câu: đặt mô hình koi theo miệng =====
          const f = A.fish;
          if (f) {
            if (A.stage === 'approach') {
              _anglerMouth.lerpVectors(_anglerFishStart, P.B, fishingEase(k / A.approachDuration)); _anglerMouth.y = Math.min(lakeY - .24, _anglerMouth.y);
              placeFishingFish(f, _anglerMouth, A.heading, 0, t, .08 * Math.sin(t * 4));
            } else if (A.stage === 'bite' || A.stage === 'strike') {
              placeFishingFish(f, P.B, A.heading, A.take ? 0.15 : 0, t * (A.take ? 1.5 : 1), A.take ? 0.2 : 0.05);
            } else if (A.stage === 'land') placeFishingFish(f, angFish.M, angFish.head, 1.45, t * 2.4, 0.55);   // treo dưới lưỡi, quẫy
            else {
              const F = angFish, sp = Math.hypot(F.V.x, F.V.z);
              if (sp > 0.15) F.head += Math.atan2(Math.sin(Math.atan2(F.V.z, F.V.x) - F.head), Math.cos(Math.atan2(F.V.z, F.V.x) - F.head)) * Math.min(1, dt * 5);
              const depth = lakeSurfaceY(F.M.x, F.M.z) - F.M.y, tired = F.mode === 'tired' || A.stage === 'release';
              placeFishingFish(f, F.M, F.head, tired ? 0.35 : Math.max(-0.4, Math.min(0.4, F.V.y * 0.6)), t * (F.mode === 'run' ? 2 : 1.3), F.mode === 'shake' ? 0.45 : tired ? 0.15 + 0.1 * Math.sin(t * 9) : 0.25);
              if (depth < 0.1 && (F.mode === 'shake' || F.mode === 'tired') && anglingRandom() < dt * (F.mode === 'shake' ? 3 : 0.8)) splashFx.spawn(F.M.x, F.M.z, F.mode === 'shake' ? 0.6 : 0.3);   // quẫy trên mặt nước
            }
          }
          // ===== 7) hiển thị phao, mồi, dây =====
          bobber.position.copy(P.F);
          _aV.subVectors(P.F, P.B); const lk = _aV.length();
          const upW = lk > FISH_HOOK * 0.85 ? 1 : lk / (FISH_HOOK * 0.85);
          if (lk > 1e-4) _aV.multiplyScalar(1 / lk); else _aV.set(0, 1, 0);
          _aV.lerp(_aV2.set(0, 1, 0), (1 - upW) * (P.mode === 'water' ? 0 : 1)).normalize();   // phao nằm khi mồi chưa kéo căng (vừa rơi), dựng theo dây phao–lưỡi khi căng
          P.up.lerp(_aV, 1 - Math.exp(-dt * 8)).normalize(); bobber.quaternion.setFromUnitVectors(_aV2.set(0, 1, 0), P.up);
          fishingBait.position.copy(P.B); fishingBait.quaternion.copy(bobber.quaternion); fishingBait.visible = !(A.fish && (A.stage === 'fight' || A.stage === 'release' || A.stage === 'land'));
          drawFishLine(rod);
          // ===== 8) tay kia (quay máy · nắm chuôi khi quăng · bắt mồi · nghỉ trên đùi) & ánh mắt =====
          const fr = A.free;
          let fp = -0.15, frr = -0.05;
          if (free === 'reel') { U.knob.getWorldPosition(_aV3); anglerAim(e, 0, _aV3, _aimOut); fp = _aimOut[0]; frr = _aimOut[1]; }
          else if (free === 'butt') { U.butt.getWorldPosition(_aV3); anglerAim(e, 0, _aV3, _aimOut); fp = _aimOut[0]; frr = _aimOut[1]; }
          else if (free === 'bait') { anglerAim(e, 0, P.B, _aimOut); fp = Math.max(-2.4, _aimOut[0]); frr = _aimOut[1]; }
          else if (free === 'chest') { _aV3.set(0.05, 1.5, 0.5); g.localToWorld(_aV3); anglerAim(e, 0, _aV3, _aimOut); fp = _aimOut[0] + Math.sin(t * 9) * 0.05; frr = _aimOut[1]; }   // xỏ mồi trước ngực, tay nhích nhẹ
          fr.p = engSpring(fr.p, fr.pv, fp, A.stage === 'cast' ? 30 : 14, dt); fr.pv = engSpring.v; fr.r = engSpring(fr.r, fr.rv, frr, 14, dt); fr.rv = engSpring.v;
          e.arms[0].rotation.x = fr.p; e.arms[0].rotation.z = fr.r;
          const hd = A.head, d = g.worldToLocal(_aV.copy(gaze)).sub(_aV2.set(0, 2.06, 0));
          const hy = Math.max(-0.9, Math.min(0.9, Math.atan2(d.x, d.z))) + A.shake, hp = Math.max(-0.45, Math.min(0.85, Math.atan2(-d.y, Math.hypot(d.x, d.z))));
          hd.p = engSpring(hd.p, hd.pv, hp, 9, dt); hd.pv = engSpring.v; hd.y = engSpring(hd.y, hd.yv, hy, 9, dt); hd.yv = engSpring.v; A.shake = 0;
          e.head.rotation.x = hd.p; e.head.rotation.y = hd.y;
          // ghi ngược vào lớp tư thế: khi thôi câu, tay + đầu trôi mượt về tư thế thường thay vì nhảy
          const PP = e.pose; if (PP) { PP.shown[4] = e.arms[0].rotation.x; PP.shown[5] = A.arm; PP.shown[6] = e.head.rotation.x; PP.jv[4] = PP.jv[5] = PP.jv[6] = 0; }
          const ar = e.armRoll || (e.armRoll = [0, 0]); ar[0] = e.arms[0].rotation.z; ar[1] = 0; e.headYaw = e.head.rotation.y;
          A.lean = anglingLean();
        }
        function pickCastTarget() {   // điểm định quăng: quanh chỗ phao quen (lệch ±0,4 m ngang, ±0,5 m xa gần)
          const fw = Math.sin(engObj.faceWater), fz = Math.cos(engObj.faceWater), r1 = anglingRandom() - 0.5, r2 = anglingRandom() - 0.5;
          angling.target.set(bobberBase.x + fz * 0.8 * r1 + fw * 1.0 * r2, lakeY, bobberBase.z - fw * 0.8 * r1 + fz * 1.0 * r2);
        }
        function castLaunch() {   // nhả dây: phao bay theo quỹ đạo đạn đạo có cản khí tới điểm định quăng (~1,1 s); mồi + chì nặng hơn bay dẫn trước
          const P = angFloat, A = angling, c = 0.35, Tf = 1.05 + anglingRandom() * 0.2, g = 9.81, e1 = 1 - Math.exp(-c * Tf);
          const vx = c * (A.target.x - P.F.x) / e1, vz = c * (A.target.z - P.F.z) / e1;
          const vy = (lakeY - P.F.y + g * Tf / c) * c / e1 - g / c;
          const dt = 1 / 60;
          P.Fp.set(P.F.x - vx * dt, P.F.y - vy * dt, P.F.z - vz * dt); P.Bp.copy(P.B).sub(_aV.set(vx * dt * 1.05, vy * dt, vz * dt * 1.05));
          P.mode = 'fly'; P.fdt = dt;
        }
        function floatStep(dt, onTipPull) {   // phao + mồi: Verlet + ràng buộc (ngọn–phao ≤ S, phao–mồi ≤ 0,32): trọng lực, lực nổi, cản, gió
          const P = angFloat, F = P.F, Fp = P.Fp, B = P.B, Bp = P.Bp, A = angling;
          const vdt = P.fdt || dt; P.fdt = 0;   // bước đầu sau khi nhả dây: vận tốc đã đặt theo dt chuẩn
          const surfF = lakeSurfaceY(F.x, F.z), depthF = surfF - F.y;
          // phao: lực nổi theo phần thân ngập (phao cân chì: nổi ~85% thân, chỉ cần ~0,03 N là kéo chìm); cản nước mạnh, gió đẩy trôi nhẹ
          const subm = Math.max(0, Math.min(1, (depthF + 0.07) / 0.14)), inW = subm > 0;
          let ax = 0, ay = -9.81 + subm * 15.6, az = 0;
          if (inW) { ax += sceneWind.dir.x * sceneWind.ms * 0.1; az += sceneWind.dir.y * sceneWind.ms * 0.1; }   // gió mặt nước đẩy phao trôi (~3% tốc độ gió, mồi chìm ghìm lại)
          const dF = inW ? 4.5 * subm + 0.3 : 0.35;
          const vxF = (F.x - Fp.x) / vdt, vyF = (F.y - Fp.y) / vdt, vzF = (F.z - Fp.z) / vdt;
          Fp.copy(F);
          F.x += (vxF * (1 - dF * dt) + ax * dt) * dt; F.y += (vyF * (1 - dF * dt) + ay * dt) * dt; F.z += (vzF * (1 - dF * dt) + az * dt) * dt;
          if (P.mode === 'fly' && F.y <= surfF) { P.mode = 'water'; splashFx.spawn(F.x, F.z, 0.65); Fp.lerp(F, 0.75); }
          // mồi + lưỡi + chì: chìm trong nước (~0,27 m/s), treo trong không khí
          if (!P.bKin) {
            const surfB = lakeSurfaceY(B.x, B.z), inB = B.y < surfB;
            const dB = inB ? 25 : 0.15, gB = inB ? -9.81 * 0.7 : -9.81;
            const vxB = (B.x - Bp.x) / vdt, vyB = (B.y - Bp.y) / vdt, vzB = (B.z - Bp.z) / vdt;
            Bp.copy(B);
            const kB = Math.max(0, 1 - dB * dt);
            B.x += vxB * kB * dt; B.y += (vyB * kB + gB * dt) * dt; B.z += vzB * kB * dt;
            if (P.mode === 'fly' && inB && Bp.y >= surfB) splashFx.spawn(B.x, B.z, 0.25);
          } else Bp.copy(B);
          // ràng buộc dây (chỉ căng): phao–mồi theo khối lượng, ngọn–phao (ngọn đứng yên theo tay); đang bay: dây ra tự do
          if (P.mode === 'fly') P.S = Math.max(P.S, F.distanceTo(_aTip)) + 0.35 * dt;   // dây ra tự do, lô dây xả dư chút → chạm nước thì dây chùng
          for (let it = 0; it < 4; it++) {
            _aV.subVectors(F, B); let L = _aV.length();
            if (L > FISH_HOOK) { const c = (L - FISH_HOOK) / L, wF = P.bKin ? 1 : BAIT_M / (BAIT_M + FLOAT_M), wB = P.bKin ? 0 : 1 - wF; F.addScaledVector(_aV, -c * wF); B.addScaledVector(_aV, c * wB); }
            _aV.subVectors(F, _aTip); L = _aV.length();
            if (L > P.S) { const c = (L - P.S) / L; F.addScaledVector(_aV, -c); onTipPull(L - P.S); if (P.bKin) { /* mồi bị cá giữ: phao nằm giữa 2 đầu */ } }
          }
          // phao không lún quá sâu khi cá chưa kéo (mồi tự do), mồi không xuyên vách bờ
          if (P.mode !== 'fly' && !P.bKin && F.y < surfF - 0.1 && A.stage !== 'bite') F.y = surfF - 0.1;
          if (P.mode === 'water' && F.y > surfF + 0.25 && F.distanceTo(_aTip) >= P.S - 0.01) P.mode = 'hang';   // thu dây: phao rời mặt nước, đu dưới ngọn
          if (P.mode === 'hang' && F.y <= surfF - 0.02) P.mode = 'water';
        }
        function fishMode(m) {   // đổi kiểu bơi của cá mắc câu: chạy (ra xa bờ, lặn) · lắc đầu · bị kéo (yếu, chệch ngang) · đuối (nổi lên mặt nước)
          const F = angFish; F.mode = m; F.modeT = 0;
          F.dur = m === 'run' ? 1.0 + anglingRandom() * 1.6 * F.stam : m === 'shake' ? 0.6 + anglingRandom() * 0.6 : m === 'tow' ? 1.2 + anglingRandom() * 1.2 : 99;
          F.ang = m === 'run' ? (anglingRandom() - 0.5) * 2.0 : m === 'tow' || m === 'tired' ? (anglingRandom() < 0.5 ? 1.4 : -1.4) : 0;
        }
        function fishFightStep(dt, t) {   // cá koi ~4,5 kg (+ khối nước kèm): sức bơi theo kiểu, lực dây (dây + cần đàn hồi, phanh nhả dây), cản nước bậc 2, sức bền giảm dần
          const F = angFish, A = angling, P = angFloat;
          F.modeT += dt;
          if (F.modeT >= F.dur) { if (F.stam < 0.3) fishMode('tired'); else { const r = anglingRandom(); fishMode(r < 0.12 + 0.4 * F.stam ? 'run' : r < 0.72 ? 'shake' : 'tow'); } }
          const hx = F.M.x - _aTip.x, hz = F.M.z - _aTip.z, hl = Math.hypot(hx, hz) || 1, ca = Math.cos(F.ang), sa = Math.sin(F.ang);
          let dirx = (hx * ca - hz * sa) / hl, dirz = (hx * sa + hz * ca) / hl, th = 0, depthT = 0.3;
          if (F.mode === 'run') { th = 17 * F.stam; depthT = 0.85; }
          else if (F.mode === 'shake') { th = 3 * F.stam; depthT = 0.35; const s = Math.sin(t * 24); dirx += -dirz * s; dirz += dirx * s; }
          else if (F.mode === 'tow') { th = 4 * F.stam; depthT = 0.3; }
          else { th = 0.4; depthT = 0.04; }   // đuối: chỉ vẫy nhẹ sang ngang, để dây dìu vào
          const dl = Math.hypot(dirx, dirz) || 1; dirx /= dl; dirz /= dl;
          // lực dây: cần + dây cước như lò xo mềm (~16 N/m: ngọn cong ~0,6 m + cước giãn) có giảm chấn theo vận tốc cá dọc dây;
          // vượt ngưỡng phanh → ống dây nhả vừa đủ để lực giữ đúng bằng phanh (cá chạy lấy dây), dưới ngưỡng → máy giữ dây
          const dx = _aTip.x - F.M.x, dy = _aTip.y - F.M.y, dz = _aTip.z - F.M.z, D = Math.hypot(dx, dy, dz) || 1;
          const vAway = -(F.V.x * dx + F.V.y * dy + F.V.z * dz) / D;
          const ext = D - (P.S + FISH_HOOK); F.ext = ext;
          let T = ext > 0 ? Math.max(0, 16 * ext + 10 * vAway) : 0;
          if (T > FISH_DRAG) { P.S = Math.max(P.S, D - FISH_HOOK - FISH_DRAG / 16); T = FISH_DRAG; F.slip = true; } else F.slip = false;
          F.T = T;
          const m = 5.4, sp = Math.hypot(F.V.x, F.V.z);
          F.V.x += ((th * dirx + T * dx / D) / m - 1.15 * sp * F.V.x) * dt;
          F.V.z += ((th * dirz + T * dz / D) / m - 1.15 * sp * F.V.z) * dt;
          const surf = lakeSurfaceY(F.M.x, F.M.z), depth = surf - F.M.y;
          F.V.y += ((T * dy / D) / m * 0.6 + (depth - depthT) * 5 - F.V.y * 3) * dt;
          const nx = F.M.x + F.V.x * dt, nz = F.M.z + F.V.z * dt;
          if (isWater(Math.round(x2gi(nx)), Math.round(z2gj(nz)))) { F.M.x = nx; F.M.z = nz; }
          else { F.V.x *= -0.3; F.V.z *= -0.3; if (F.mode === 'run') { F.modeT = F.dur; } }   // chạm bờ: dội lại, đổi hướng
          F.M.y = Math.max(surf - 1.1, Math.min(surf - 0.03, F.M.y + F.V.y * dt));
          F.stam = Math.max(0.12, F.stam - dt * ((F.mode === 'run' ? 0.06 : F.mode === 'shake' ? 0.045 : 0.022) + 0.0035 * T));
          A.Tdir.set(-dx / D, -dy / D, -dz / D);
        }
        function drawFishLine(rod) {   // dây: mép lô dây → 6 khoen → ngọn (theo cần đang cong) → võng tới phao (dây chùng) → lưỡi
          const U = rod.userData, P = angFloat, A = angling, pos = fishLinePos;
          let j = 0;
          U.spool.getWorldPosition(_aV); pos[j++] = _aV.x; pos[j++] = _aV.y; pos[j++] = _aV.z;
          for (const gd of U.guides) { gd.getWorldPosition(_aV); pos[j++] = _aV.x; pos[j++] = _aV.y; pos[j++] = _aV.z; }
          pos[j++] = _aTip.x; pos[j++] = _aTip.y; pos[j++] = _aTip.z;
          const D = P.F.distanceTo(_aTip), slack = Math.max(0, P.S - D);
          const sag = Math.min(D * 0.45, Math.sqrt(3 * D * slack / 8));   // võng parabol theo phần dây thừa
          _aV.subVectors(P.F, _aTip); const len = _aV.length() || 1; _aV.multiplyScalar(1 / len);
          _aV2.set(0, -1, 0).addScaledVector(_aV, _aV.y); const nl = _aV2.length(); if (nl > 1e-4) _aV2.multiplyScalar(1 / nl);   // phương trọng lực vuông góc dây
          for (let i = 0; i < 16; i++) {
            const u = i / 15, s = 4 * u * (1 - u) * sag;
            pos[j++] = _aTip.x + (P.F.x - _aTip.x) * u + _aV2.x * s; pos[j++] = _aTip.y + (P.F.y - _aTip.y) * u + _aV2.y * s; pos[j++] = _aTip.z + (P.F.z - _aTip.z) * u + _aV2.z * s;
          }
          pos[j++] = P.F.x; pos[j++] = P.F.y; pos[j++] = P.F.z; pos[j++] = P.B.x; pos[j++] = P.B.y; pos[j++] = P.B.z;
          fishLineGeo.attributes.position.needsUpdate = true;
          if (A.stage !== 'fight') A.Tdir.set(pos[27] - _aTip.x, pos[28] - _aTip.y, pos[29] - _aTip.z).normalize();   // hướng lực ở ngọn = tiếp tuyến dây
        }
        function updateReturningFishingFish(f, dt, t) {   // cá được thả: ngoi lên lấy thăng bằng, quẫy đuôi lặn ra xa bờ rồi trả về bầy
          fishReturnTime += dt;
          const u = fishReturnTime, sp = u < 0.45 ? 0.15 : 0.15 + 1.1 * Math.min(1, (u - 0.45) / 0.4) * Math.max(0.4, 1 - (u - 0.9) / 1.6);
          _fishReturnStart.addScaledVector(_fishReturnDir, sp * dt);
          const depthT = lakeY - 0.62, y = _fishReturnStart.y;
          _fishReturnStart.y = y + (depthT - y) * Math.min(1, dt * (u < 0.45 ? 0.5 : 2.2));
          placeFishingFish(f, _fishReturnStart, f.relHeading, u < 0.45 ? 0.25 * (1 - u / 0.45) : -0.35 * Math.max(0, 1 - (u - 0.45) / 1.2), t * (u < 0.45 ? 1 : 2.2), u < 0.45 ? 0.1 : 0.35);
          if (fishReturnTime >= 2.4) {
            f.cx = f.g.position.x; f.cz = f.g.position.z; f.ang = f.relHeading;
            f.g.rotation.set(0, -f.ang, 0); returningFishingFish = null;
          }
        }


