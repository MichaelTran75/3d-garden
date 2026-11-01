        // ---- ĐUÔI MỀM = chuỗi hạt XPBD (vật lý dựa trên vị trí, tích phân Verlet): hạt gốc gắn thân; ràng buộc ĐỘ DÀI đoạn (cứng) và lực kéo mềm
        //      về DÁNG NGHỈ (mềm dần từ gốc ra ngọn) ⇒ đuôi có quán tính thật: chạy thì bị kéo về sau, dừng/quay thì vung theo, vẫy thành sóng
        //      từ gốc ra ngọn, gió thổi lệch nhẹ. Bước cố định 240 Hz + vẽ nội suy; nhảy vị trí xa (dịch chuyển tức thời) thì đặt lại về dáng nghỉ ----
        const _stA = new THREE.Vector3(), _stB = new THREE.Vector3(), _stD = new THREE.Vector3(), _stX = new THREE.Vector3(1, 0, 0), _stW = new THREE.Vector3(), _stE = new THREE.Euler();
        function makeSoftTail(host, o) {   // o: base (cục bộ), dir (hướng nghỉ cục bộ, đơn vị), n đoạn, len (dài mỗi đoạn, cục bộ), w (bề dày), mat, stiff [gốc, ngọn]
          const segs = [], P = [], Q = [], R = [];
          for (let i = 0; i < o.n; i++) { const k = 1 - 0.35 * i / o.n, m = bx(o.len * 1.2, o.w * k, o.w * k, o.mat, true, false); m.castShadow = true; host.add(m); segs.push(m); }
          for (let i = 0; i <= o.n; i++) { P.push(new THREE.Vector3()); Q.push(new THREE.Vector3()); R.push(new THREE.Vector3()); }
          return { host, o, segs, P, Q, R, init: false, last: new THREE.Vector3() };
        }
        function updateSoftTail(T, dt, wag, curl) {
          const o = T.o, M = T.host.matrixWorld; T.host.updateMatrixWorld(true);
          const S = new THREE.Vector3().setFromMatrixScale(M).x, segW = o.len * S;
          for (let i = 0; i <= o.n; i++) {   // dáng nghỉ (thế giới): hướng nghỉ quay theo lệnh vẫy (quanh trục đứng) + cuộn dần về một bên khi ngủ
            _stE.set(0, wag + curl * 0.45 * i, -curl * 0.35 * i * 0.5); _stD.copy(o.dir).applyEuler(_stE);
            if (i === 0) T.R[0].copy(o.base); else T.R[i].copy(T.R[i - 1]).sub(T.R[0]).add(o.base).addScaledVector(_stD, o.len);
          }
          for (let i = 0; i <= o.n; i++) T.R[i].applyMatrix4(M);
          if (!T.init || T.R[0].distanceTo(T.last) > 0.8) { for (let i = 0; i <= o.n; i++) { T.P[i].copy(T.R[i]); T.Q[i].copy(T.R[i]); } T.init = true; }
          T.last.copy(T.R[0]);
          windAt(T.R[0].x, T.R[0].y, T.R[0].z, 0.4, _stW);
          const al = fixedSteps(T, dt, 1 / 240, (h) => {   // bước cố định 240 Hz (core/fixed-step.js) = đúng nhịp cũ ở 60 hình/giây × 4 bước con, giờ như nhau ở mọi tốc độ khung
            if (T.kick) { for (let i = 1; i <= o.n; i++) T.Q[i].addScaledVector(T.kick, -h * i / o.n); T.kick = null; }   // cú hất (vd bò phẩy ruồi): cộng vận tốc, ngọn nhiều hơn gốc
            for (let i = 1; i <= o.n; i++) {   // Verlet: quán tính (tắt dần nhẹ) + trọng lực + kéo theo gió
              const p = T.P[i], q = T.Q[i];
              _stA.copy(p).sub(q).multiplyScalar(0.985); q.copy(p);
              p.add(_stA); p.y -= 2.5 * h * h; p.addScaledVector(_stW, 0.02 * h);
            }
            T.P[0].copy(T.R[0]); T.Q[0].copy(T.R[0]);   // gốc gắn chặt vào thân
            for (let i = 1; i <= o.n; i++) {   // kéo mềm về dáng nghỉ (gốc cứng hơn ngọn)
              const k = o.stiff[0] + (o.stiff[1] - o.stiff[0]) * (i - 1) / Math.max(1, o.n - 1);
              T.P[i].lerp(T.R[i], k);
            }
            for (let it = 0; it < 2; it++) for (let i = 1; i <= o.n; i++) {   // giữ đúng độ dài từng đoạn (hạt gốc khối lượng vô hạn)
              _stA.copy(T.P[i]).sub(T.P[i - 1]); const L = _stA.length() || 1e-6, c = (L - segW) / L;
              if (i === 1) T.P[i].addScaledVector(_stA, -c); else { T.P[i].addScaledVector(_stA, -c * 0.5); T.P[i - 1].addScaledVector(_stA, c * 0.5); }
            }
          });
          for (let i = 0; i < o.n; i++) {   // vẽ: hạt nội suy bước trước (Q) → bước mới (P); mỗi đoạn là hộp nối 2 hạt (về hệ cục bộ của thân)
            const m = T.segs[i]; T.host.worldToLocal(i ? _stA.copy(T.Q[i]).lerp(T.P[i], al) : _stA.copy(T.P[0])); T.host.worldToLocal(_stB.copy(T.Q[i + 1]).lerp(T.P[i + 1], al));
            m.position.copy(_stA).add(_stB).multiplyScalar(0.5); _stD.copy(_stB).sub(_stA).normalize(); m.quaternion.setFromUnitVectors(_stX, _stD);
          }
        }
