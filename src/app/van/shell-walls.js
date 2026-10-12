        // Hollow walls with actual apertures, plus a continuous chamfered cabover.
        // Sleeping berth, bathroom and campsite anchors retain their coordinates.
        function motorhomeShell(g, body, roofMat, glass, base, x0, x1, dz, yRoof, dX0, dX1, doorH) {
          function opening(shape, x, y, w, h) {
            const p = new THREE.Path();
            p.moveTo(x, y); p.lineTo(x, y + h); p.lineTo(x + w, y + h); p.lineTo(x + w, y); p.closePath();
            shape.holes.push(p);
          }
          function panel(shape, depth, z, name, material = body) {
            const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 18 });
            const mesh = new THREE.Mesh(geo, material); mesh.position.z = z; mesh.name = name;
            mesh.castShadow = mesh.receiveShadow = true; edge(mesh, geo, lineDark); g.add(mesh); return mesh;
          }
          function windowAt(x, y, w, h, z) {
            const pane = bx(w, h, 0.035, glass, false, true, lineDark);
            pane.position.set(x + w / 2, y + h / 2, z); g.add(pane);
          }
          const sill = 0.56, axle = 1.888, wheelY = 0.5053, archR = 0.61;
          const a = Math.asin((sill - wheelY) / archR), half = Math.sqrt(archR * archR - (sill - wheelY) ** 2);
          for (const side of [-1, 1]) {
            const shape = new THREE.Shape(); shape.moveTo(x0, sill);
            // The side entry ends before the rear wheel; the wheel opening is a real cutout.
            if (side === 1) {
              shape.lineTo(dX0, sill); shape.lineTo(dX0, base + doorH);
              shape.lineTo(dX1, base + doorH); shape.lineTo(dX1, sill);
            }
            shape.lineTo(axle - half, sill); shape.absarc(axle, wheelY, archR, Math.PI - a, a, true);
            shape.lineTo(x1, sill); shape.lineTo(x1, yRoof - 0.02); shape.lineTo(x0, yRoof - 0.02); shape.closePath();
            const windows = side === 1 ? [[-1.03, 2.27, 0.66, 0.72], [1.39, 2.27, 1.21, 0.72]] : [[-0.63, 2.28, 2.27, 0.72]];
            for (const [x, y, w, h] of windows) { opening(shape, x, y, w, h); windowAt(x, y, w, h, side * (dz - 0.04)); }
            panel(shape, 0.1, side > 0 ? dz - 0.1 : -dz, side > 0 ? 'Vách cửa & hốc bánh sau' : 'Vách giường & hốc bánh sau');
            const arch = new THREE.Mesh(new THREE.TorusGeometry(archR + 0.018, 0.036, 6, 26, Math.PI), caravanDark);
            arch.position.set(axle, wheelY, side * (dz + 0.01)); arch.castShadow = true; g.add(arch);
          }
          // Cabin-to-living-space bulkhead: leave the central aisle open.
          for (const z of [-1.04, 1.04]) {
            const pier = bx(0.09, 1.86, 0.78, body); pier.position.set(x0, base + 0.93, z); g.add(pier);
          }
          const lintel = bx(0.09, 0.65, dz * 2, body); lintel.position.set(x0, yRoof - 0.345, 0); g.add(lintel);
          // Living room to rear bathroom: an open passage, with a partition on each side.
          for (const z of [-1.045, 1.045]) {
            const pier = bx(0.1, 2.12, 0.81, body); pier.position.set(x1 - 0.05, base + 1.06, z); g.add(pier);
          }
          const rearHeader = bx(0.1, 0.56, dz * 2, body); rearHeader.position.set(x1 - 0.05, yRoof - 0.28, 0); g.add(rearHeader);

          const profile = [[-3.9, 3.07], [-3.39, yRoof], [x0 + 0.06, yRoof], [x0 + 0.06, 2.98], [-3.61, 2.98]];
          for (const side of [-1, 1]) {
            const shape = new THREE.Shape(profile.map(p => new THREE.Vector2(...p)));
            opening(shape, -2.98, 3.17, 1.03, 0.28);
            panel(shape, 0.07, side > 0 ? dz - 0.07 : -dz, 'Khoang ngủ trên cabin');
            windowAt(-2.98, 3.17, 1.03, 0.28, side * (dz - 0.035));
          }
          function quad(a, b, z0, z1, material, name) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute([
              a[0], a[1], z0, b[0], b[1], z0, b[0], b[1], z1, a[0], a[1], z1
            ], 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
            geo.setIndex([0, 2, 1, 0, 3, 2]); geo.computeVertexNormals();
            const m = new THREE.Mesh(geo, material); m.name = name; m.castShadow = m.receiveShadow = true; edge(m, geo, lineDark); g.add(m);
          }
          const slopeBody = body.clone(); slopeBody.side = THREE.DoubleSide;
          const slopeGlass = glass.clone(); slopeGlass.side = THREE.DoubleSide;
          const topMat = roofMat.clone(); topMat.side = THREE.DoubleSide;
          // Flared returns bridge the narrower cab to the wider living shell.
          for (const side of [-1, 1]) {
            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.Float32BufferAttribute([
              -1.48, 0.56, side * 1.335, x0 + 0.015, 0.56, side * dz,
              x0 + 0.015, 2.99, side * dz, -1.48, 2.99, side * 1.335
            ], 3));
            geo.setAttribute('uv', new THREE.Float32BufferAttribute([0, 0, 1, 0, 1, 1, 0, 1], 2));
            geo.setIndex(side > 0 ? [0, 1, 2, 0, 2, 3] : [0, 2, 1, 0, 3, 2]); geo.computeVertexNormals();
            const m = new THREE.Mesh(geo, slopeBody); m.name = 'Vai nối cabin và thân ở'; m.castShadow = m.receiveShadow = true; g.add(m);
          }
          for (let i = 1; i < profile.length; i++) {
            const a = profile[i], b = profile[(i + 1) % profile.length];
            if (i === 2) continue; // Open connection to the living compartment.
            quad(a, b, -dz, dz, i === 1 ? topMat : slopeBody, 'Vỏ mui liền mạch');
          }
          const a0 = profile[0], b0 = profile[1], lerp = t => [a0[0] + (b0[0] - a0[0]) * t, a0[1] + (b0[1] - a0[1]) * t];
          const low = lerp(.20), high = lerp(.77);
          quad(a0, low, -dz, dz, slopeBody, 'Viền dưới kính mui'); quad(high, b0, -dz, dz, slopeBody, 'Viền trên kính mui');
          quad(low, high, -dz, -.95, slopeBody, 'Trụ kính mui'); quad(low, high, .95, dz, slopeBody, 'Trụ kính mui');
          quad(low, high, -.95, .95, slopeGlass, 'Kính trước khoang ngủ');
        }

