        // ---- wind turbines ----
        const rotors = [];
        // Build each unit once: every turbine shares the baked tower and rotor buffers.
        towerMat.color.setHex(0xe2d6c0); bladeMat.color.setHex(0xe2d6c0); hubMat.color.setHex(0xe2d6c0);
        const turbineBeaconMat = new THREE.MeshBasicMaterial({ color: 0xc9513f });
        function turbineAirfoil() {
          // Radius, chord, thickness ratio, pitch (degrees), and swept chord centre.
          const sections = [
            [0.30, 0.28, 0.40, 38, 0], [0.55, 0.35, 0.38, 36, 0],
            [0.85, 0.58, 0.28, 30, -0.02], [1.25, 0.80, 0.22, 24, -0.08],
            [1.90, 0.83, 0.19, 18, -0.15], [2.70, 0.77, 0.17, 13, -0.20],
            [3.60, 0.67, 0.15, 9, -0.23], [4.55, 0.56, 0.14, 6, -0.20],
            [5.55, 0.44, 0.13, 3, -0.12], [6.50, 0.31, 0.12, 1, 0],
            [7.25, 0.19, 0.11, -1, 0.16], [7.65, 0.10, 0.10, -2, 0.24],
            [7.78, 0.025, 0.10, -3, 0.29]
          ];
          const vertices = [], indices = [], ringN = 24;
          for (const [r, chord, thick, pitch, sweep] of sections) {
            const a = THREE.MathUtils.degToRad(pitch), c = Math.cos(a), s = Math.sin(a);
            for (let j = 0; j < ringN; j++) {
              const phi = j / ringN * Math.PI * 2, u = (1 - Math.cos(phi)) / 2;
              // Closed NACA-style section; small camber and spanwise twist give real volume.
              const half = 5 * thick * (0.2969 * Math.sqrt(u) - 0.1260 * u - 0.3516 * u * u + 0.2843 * u ** 3 - 0.1036 * u ** 4);
              const x = (u - 0.30) * chord;
              const z = (0.025 * 4 * u * (1 - u) + (j <= ringN / 2 ? half : -half)) * chord;
              vertices.push(sweep + x * c + z * s, r, -x * s + z * c + 0.018 * r);
            }
          }
          for (let k = 0; k < sections.length - 1; k++) for (let j = 0; j < ringN; j++) {
            const a = k * ringN + j, b = k * ringN + (j + 1) % ringN, c = a + ringN, d = b + ringN;
            indices.push(a, b, c, b, d, c);
          }
          for (const k of [0, sections.length - 1]) {
            const cap = vertices.length / 3, center = [0, 0, 0];
            for (let j = 0; j < ringN; j++) for (let a = 0; a < 3; a++) center[a] += vertices[(k * ringN + j) * 3 + a] / ringN;
            vertices.push(...center);
            for (let j = 0; j < ringN; j++) {
              const a = k * ringN + j, b = k * ringN + (j + 1) % ringN;
              if (k === 0) indices.push(cap, b, a); else indices.push(cap, a, b);
            }
          }
          const geometry = new THREE.BufferGeometry();
          geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(vertices.length / 3 * 2), 2)); geometry.setIndex(indices);
          geometry.computeVertexNormals(); geometry.computeBoundingBox(); geometry.computeBoundingSphere();
          geometry.name = 'Closed swept airfoil with 13 tapered and twisted sections';
          return geometry;
        }
        function turbineNacelleGeometry() {
          const positions = [], indices = [];
          const sections = [[-1.62, 0.29, 0.25], [-1.40, 0.46, 0.36], [0.24, 0.48, 0.40], [0.58, 0.32, 0.29]];
          const profile = [[-0.70, -1], [0.70, -1], [1, -0.70], [1, 0.70], [0.70, 1], [-0.70, 1], [-1, 0.70], [-1, -0.70]];
          for (const [z, w, h] of sections) for (const [x, y] of profile) positions.push(x * w, y * h, z);
          for (let k = 0; k < sections.length - 1; k++) for (let j = 0; j < 8; j++) {
            const a = k * 8 + j, b = k * 8 + (j + 1) % 8, c = a + 8, d = b + 8;
            indices.push(a, b, c, b, d, c);
          }
          for (let j = 1; j < 7; j++) { indices.push(0, j + 1, j); indices.push(24, 24 + j, 25 + j); }
          const geometry = new THREE.BufferGeometry(); geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geometry.setAttribute('uv', new THREE.Float32BufferAttribute(new Float32Array(positions.length / 3 * 2), 2)); geometry.setIndex(indices); geometry.computeVertexNormals();
          return geometry;
        }
        const TURBINE_HEIGHT_FACTOR = 1.15, TURBINE_HUB_LIFT = 15.81 * (TURBINE_HEIGHT_FACTOR - 1);
        const turbineTowerTemplate = new THREE.Group(), turbineRotorTemplate = new THREE.Group();
        const turbineUnitBox = new THREE.BoxGeometry(1, 1, 1);
        function turbinePart(parent, geometry, material, x, y, z, scale) {
          const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z);
          if (scale) m.scale.set(...scale); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
        }
        function turbineBox(parent, material, x, y, z, sx, sy, sz) { return turbinePart(parent, turbineUnitBox, material, x, y, z, [sx, sy, sz]); }
        {
          const g = turbineTowerTemplate, baseY = 0.45, towerHeight = 15 * TURBINE_HEIGHT_FACTOR, topY = baseY + towerHeight, nacY = 15.81 * TURBINE_HEIGHT_FACTOR;
          turbinePart(g, new THREE.CylinderGeometry(0.82, 1.00, 0.45, 16), concreteMat, 0, 0.225, 0);
          turbinePart(g, new THREE.CylinderGeometry(0.50, 0.50, 0.12, 20), legMat, 0, baseY + 0.06, 0);
          turbinePart(g, new THREE.CylinderGeometry(0.20, 0.46, towerHeight, 20), towerMat, 0, baseY + towerHeight / 2, 0);
          // Flush segment seams, foundation anchors, service door and two access steps.
          for (const oldY of [5.45, 10.45]) {
            const y = baseY + (oldY - baseY) * TURBINE_HEIGHT_FACTOR;
            const r = 0.46 + (0.20 - 0.46) * (y - baseY) / towerHeight;
            turbinePart(g, new THREE.CylinderGeometry(r + 0.009, r + 0.010, 0.035, 20), legMat, 0, y, 0);
          }
          turbinePart(g, new THREE.CylinderGeometry(0.461, 0.470, 0.25, 20), warningMat, 0, baseY + 0.24, 0);
          const boltGeo = new THREE.CylinderGeometry(0.036, 0.036, 0.055, 6);
          for (let n = 0; n < 8; n++) { const a = n * Math.PI / 4; turbinePart(g, boltGeo, gateMat, Math.cos(a) * 0.57, baseY + 0.025, Math.sin(a) * 0.57); }
          turbineBox(g, legMat, 0, baseY + 0.67, 0.445, 0.35, 0.99, 0.075);
          turbineBox(g, gateMat, 0, baseY + 0.67, 0.488, 0.27, 0.88, 0.030);
          turbineBox(g, legMat, 0.085, baseY + 0.61, 0.51, 0.025, 0.14, 0.025);
          turbineBox(g, concreteMat, 0, 0.17, 0.88, 0.72, 0.20, 0.56);
          turbineBox(g, concreteMat, 0, 0.31, 0.70, 0.64, 0.18, 0.29);
          turbinePart(g, new THREE.CylinderGeometry(0.34, 0.31, 0.20, 16), legMat, 0, topY + 0.05, 0);
          turbinePart(g, turbineNacelleGeometry(), towerMat, 0, nacY, 0);
          // Recessed side cooling grilles are broad enough to read at scene scale.
          for (const side of [-1, 1]) {
            turbineBox(g, gateMat, side * 0.466, nacY + 0.025, -0.74, 0.025, 0.31, 0.68);
            for (let i = 0; i < 3; i++) turbineBox(g, legMat, side * 0.483, nacY + 0.025, -0.96 + i * 0.22, 0.025, 0.30, 0.03);
          }
          turbineBox(g, legMat, 0, nacY + 0.373, -0.68, 0.43, 0.045, 0.67);
          turbinePart(g, new THREE.CylinderGeometry(0.025, 0.025, 0.42, 6), legMat, 0.15, nacY + 0.59, -1.20);
          turbineBox(g, legMat, 0.15, nacY + 0.79, -1.20, 0.30, 0.025, 0.025);
          turbinePart(g, new THREE.SphereGeometry(0.085, 8, 6), turbineBeaconMat, 0, nacY + 0.44, -0.14);
          const shaft = turbinePart(g, new THREE.CylinderGeometry(0.18, 0.18, 0.60, 12), legMat, 0, nacY, 0.70); shaft.rotation.x = Math.PI / 2;
          bakeStatic(g);
        }
        {
          const g = turbineRotorTemplate, bladeGeo = turbineAirfoil();
          const spinnerProfile = [[0, -0.13], [0.26, -0.12], [0.39, 0.02], [0.42, 0.17], [0.35, 0.40], [0.20, 0.63], [0, 0.75]].map(p => new THREE.Vector2(...p));
          const spinner = turbinePart(g, new THREE.LatheGeometry(spinnerProfile, 16), towerMat, 0, 0, 0); spinner.rotation.x = Math.PI / 2;
          const cuffGeo = new THREE.CylinderGeometry(0.18, 0.16, 0.38, 12);
          for (let b = 0; b < 3; b++) {
            const bladeRoot = new THREE.Group(); bladeRoot.rotation.z = b * Math.PI * 2 / 3; g.add(bladeRoot);
            turbinePart(bladeRoot, cuffGeo, legMat, 0, 0.36, 0);
            turbinePart(bladeRoot, bladeGeo, towerMat, 0, 0, 0);
          }
          bakeStatic(g); g.userData.noBake = true;
        }
        function turbine(s) {
          const g = new THREE.Group(), body = turbineTowerTemplate.clone(true), rotor = turbineRotorTemplate.clone(true);
          body.scale.setScalar(s); rotor.scale.setScalar(s); rotor.position.set(0, 15.81 * TURBINE_HEIGHT_FACTOR * s, 1.10 * s);
          g.add(body, rotor); rotors.push({ rotor, sp: 0.25 + Math.random() * 0.22 });
          return g;
        }
        const windCells = [[11, 3, 1.5], [17, 6, 1.35], [23, 3, 1.55], [29, 6, 1.3], [37, 4, 1.4], [44, 8, 1.25], [7, 8, 1.45]]; // OLD coords
        const numSprites = [];                   // tất cả số (tua-bin + cột điện) — tắt cùng nút "Trục"
        function turbineNum(n) {                 // số tua-bin — kiểu giống cột điện (chữ trắng viền đậm, font Courier), nổi trên đỉnh
          const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
          x.clearRect(0, 0, 128, 128);
          x.font = '700 64px "Courier New", Courier, monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
          x.lineWidth = 7; x.strokeStyle = 'rgba(12, 18, 26, 0.95)'; x.strokeText(String(n), 64, 64);
          x.fillStyle = '#E2D6C0'; x.fillText(String(n), 64, 64);
          const tx = new THREE.CanvasTexture(c); tx.anisotropy = 4;
          const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tx, transparent: true, opacity: 0.95, depthTest: false, depthWrite: false })); sp.renderOrder = 25; sp.scale.set(3.4, 3.4, 1); return sp;
        }
        const obstacleCoords = [];
        let wtn = 0;
        for (const c of windCells) {
          const i = c[0] * S, j = c[1] * S; if (isRiver(i, j)) continue; wtn++;
          const s = c[2] * 1.22 * 1.05 * 1.1 * 1.05; const t = turbine(s);   // tua-bin cao/lớn thêm 10% + 5%
          if (wtn === 1) t.position.set(X0 + 23, 9, Z0 + 13);
          else if (wtn === 2) t.position.set(X0 + 58, 8, Z0 + 7);
          else if (wtn === 3) t.position.set(X0 + 88, 8, Z0 + 23);
          else if (wtn === 4) t.position.set(X0 + 139, 11, Z0 + 8);              // tua-bin 4 → góc (139,11,8)
          else if (wtn === 5) t.position.set(X0 + 176, 24, Z0 + 7);        // tua-bin 5 → góc (176,24,7)
          else t.position.set(wx(i), surfaceY(i, j), wz(j));
          t.rotation.y = -0.5 + Math.random(); t.name = 'Tua-bin gió #' + wtn + ' (Wind Turbine)'; scene.add(t);
          const num = turbineNum(wtn); num.position.set(0, (0.45 + 15 + 9 + TURBINE_HUB_LIFT) * s, 0); t.add(num); numSprites.push(num);
          obstacleCoords.push({ x: t.position.x, y: t.position.y, z: t.position.z, r: 3.5, h: (25 + TURBINE_HUB_LIFT) * s });
        }
        if (rotors[1]) rotors[1].sp *= 0.35;                                          // tua-bin 2 quay chậm
        if (rotors[3]) rotors[3].sp *= 2; if (rotors[4]) rotors[4].sp *= 2;            // tua-bin 4 & 5 quay nhanh gấp đôi

        // Architecture and solar shrink about their existing ground anchors; terrain, dam and poles stay fixed.
        const ARCHITECTURE_SCALE = 0.90;

