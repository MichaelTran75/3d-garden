    function createFlightNavigator(bounds, groundAt, obstacles, terrain = null) {
      // Shared 3-D voxels; fixed caches and one search workspace keep memory bounded.
      const clearance = 0.38, cell = 1.2, bucketSize = 6, capacity = 16384, cacheCapacity = 65536;
      const cols = Math.floor((bounds.maxX - bounds.minX) / cell) + 1;
      const rows = Math.floor((bounds.maxZ - bounds.minZ) / cell) + 1, plane = cols * rows;
      let ceiling = 12;
      for (const box of obstacles) ceiling = Math.max(ceiling, box.max.y + cell * 2);
      const layers = Math.ceil(ceiling / cell), nodeCount = plane * layers;
      const axes = ['x', 'y', 'z'], bucketX = Math.floor(bounds.minX / bucketSize), bucketZ = Math.floor(bounds.minZ / bucketSize);
      const bucketCols = Math.floor(bounds.maxX / bucketSize) - bucketX + 1, bucketRows = Math.floor(bounds.maxZ / bucketSize) - bucketZ + 1;
      const buckets = new Array(bucketCols * bucketRows);
      let boxes = new Float32Array(obstacles.length * 6), checked = new Uint32Array(obstacles.length), checkId = 0;
      let nodeState = new Uint8Array(cacheCapacity), cacheKeys = new Uint32Array(cacheCapacity), closed = new Uint8Array(capacity);
      let keys = new Uint32Array(capacity), costs = new Float32Array(capacity), scores = new Float32Array(capacity);
      let parents = new Int16Array(capacity), heap = new Uint16Array(capacity), heapSlots = new Int16Array(capacity), routeScratch = new Int16Array(capacity);
      const slots = new Map(), pending = new Map();
      let active = null, heapSize = 0, used = 0, cachedNodes = 0, maxVisited = 0, disposed = false;
      const nodeP = { x: 0, y: 0, z: 0 }, nodeQ = { x: 0, y: 0, z: 0 }, routeAnchor = { x: 0, y: 0, z: 0 };
      const direct = { x: 0, y: 0, z: 0 };
      const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
      const copy = p => ({ x: p.x, y: p.y, z: p.z });
      const now = () => typeof performance === 'undefined' ? Date.now() : performance.now();
      function mix(a, b, t, out) {
        out.x = a.x + (b.x - a.x) * t; out.y = a.y + (b.y - a.y) * t; out.z = a.z + (b.z - a.z) * t;
        return out;
      }
      function assertActive() { if (disposed) throw new Error('Garden flight navigator has been disposed.'); }
      const inside = p => Number.isFinite(p.x + p.y + p.z) && p.x >= bounds.minX && p.x <= bounds.maxX && p.z >= bounds.minZ && p.z <= bounds.maxZ;
      function ground(x, z) {
        assertActive();
        let height = -Infinity;
        for (let ix = -1; ix <= 1; ix++) for (let iz = -1; iz <= 1; iz++) height = Math.max(height, groundAt(x + ix * clearance, z + iz * clearance));
        return height;
      }
      obstacles.forEach((box, id) => {
        const offset = id * 6;
        for (let axis = 0; axis < 3; axis++) { boxes[offset + axis] = box.min[axes[axis]]; boxes[offset + axis + 3] = box.max[axes[axis]]; }
        for (let x = Math.max(bucketX, Math.floor((box.min.x - clearance) / bucketSize)); x <= Math.min(bucketX + bucketCols - 1, Math.floor((box.max.x + clearance) / bucketSize)); x++) {
          for (let z = Math.max(bucketZ, Math.floor((box.min.z - clearance) / bucketSize)); z <= Math.min(bucketZ + bucketRows - 1, Math.floor((box.max.z + clearance) / bucketSize)); z++) {
            const key = x - bucketX + (z - bucketZ) * bucketCols;
            if (!buckets[key]) buckets[key] = [];
            buckets[key].push(id);
          }
        }
      });
      for (let i = 0; i < buckets.length; i++) if (buckets[i]) buckets[i] = Uint32Array.from(buckets[i]);
      obstacles = null;
      function intersects(a, b, id, margin) {
        let enter = 0, exit = 1;
        for (let k = 0; k < 3; k++) {
          const axis = axes[k], delta = b[axis] - a[axis], lo = boxes[id * 6 + k] - margin, hi = boxes[id * 6 + k + 3] + margin;
          if (Math.abs(delta) < 1e-9) { if (a[axis] < lo || a[axis] > hi) return false; }
          else {
            const t0 = (lo - a[axis]) / delta, t1 = (hi - a[axis]) / delta;
            enter = Math.max(enter, Math.min(t0, t1)); exit = Math.min(exit, Math.max(t0, t1));
            if (enter > exit) return false;
          }
        }
        return true;
      }
      function terrainTraceClear(a, b, ox, oz, margin) {
        const dx = b.x - a.x, dz = b.z - a.z, dy = b.y - a.y, size = terrain.cell;
        const x = a.x + ox, z = a.z + oz, sx = Math.sign(dx), sz = Math.sign(dz);
        let ix = Math.floor((x - terrain.originX) / size), iz = Math.floor((z - terrain.originZ) / size), t = 0;
        const deltaX = dx ? size / Math.abs(dx) : Infinity, deltaZ = dz ? size / Math.abs(dz) : Infinity;
        let edgeX = dx ? Math.max(0, (terrain.originX + (ix + (sx > 0 ? 1 : 0)) * size - x) / dx) : Infinity;
        let edgeZ = dz ? Math.max(0, (terrain.originZ + (iz + (sz > 0 ? 1 : 0)) * size - z) / dz) : Infinity;
        // Visit each crossed terrain column exactly; spaced samples can miss a thin clipped corner.
        while (true) {
          const next = Math.min(1, edgeX, edgeZ), lowestY = a.y + dy * (dy < 0 ? next : t);
          if (lowestY < groundAt(terrain.originX + (ix + .5) * size, terrain.originZ + (iz + .5) * size) + margin - 1e-6) return false;
          if (next === 1) return true;
          const crossX = edgeX <= edgeZ + 1e-10, crossZ = edgeZ <= edgeX + 1e-10;
          if (crossX) { ix += sx; edgeX += deltaX; }
          if (crossZ) { iz += sz; edgeZ += deltaZ; }
          t = next;
        }
      }
      function segmentClear(a, b, margin = clearance) {
        assertActive();
        if (!inside(a) || !inside(b)) return false;
        if (++checkId > 0xffffffff) { checked.fill(0); checkId = 1; }
        for (let x = Math.floor(Math.min(a.x, b.x) / bucketSize); x <= Math.floor(Math.max(a.x, b.x) / bucketSize); x++) {
          for (let z = Math.floor(Math.min(a.z, b.z) / bucketSize); z <= Math.floor(Math.max(a.z, b.z) / bucketSize); z++) {
            const bucket = buckets[x - bucketX + (z - bucketZ) * bucketCols];
            if (!bucket) continue;
            for (let k = 0; k < bucket.length; k++) {
              const id = bucket[k];
              if (checked[id] === checkId) continue; checked[id] = checkId;
              if (intersects(a, b, id, margin)) return false;
            }
          }
        }
        if (terrain) {
          const floor = ground(a.x, a.z) + margin - 1e-6;
          if (a.y < floor) return false;
          if (a.x === b.x && a.z === b.z) return b.y >= floor;
          if (b.y < ground(b.x, b.z) + margin - 1e-6) return false;
          for (let ix = -1; ix <= 1; ix++) for (let iz = -1; iz <= 1; iz++) if (!terrainTraceClear(a, b, ix * clearance, iz * clearance, margin)) return false;
          return true;
        }
        const steps = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.25));
        for (let i = 0; i <= steps; i++) {
          const t = i / steps, x = a.x + (b.x - a.x) * t, z = a.z + (b.z - a.z) * t;
          if (a.y + (b.y - a.y) * t < ground(x, z) + margin - 1e-6) return false;
        }
        return true;
      }
      const pointClear = p => segmentClear(p, p);
      function node(id, out) {
        const cacheIndex = id & (cacheCapacity - 1), hit = cacheKeys[cacheIndex] === id + 1;
        if (hit && nodeState[cacheIndex] === 2) return false;
        const grid = id % plane, layer = Math.floor(id / plane);
        out.x = bounds.minX + (grid % cols) * cell; out.z = bounds.minZ + Math.floor(grid / cols) * cell;
        out.y = (layer + 0.5) * cell;
        if (!hit) {
          if (!cacheKeys[cacheIndex]) cachedNodes++;
          cacheKeys[cacheIndex] = id + 1; nodeState[cacheIndex] = pointClear(out) ? 1 : 2;
        }
        return nodeState[cacheIndex] === 1;
      }
      function snapToVoxel(p, out) {
        out.x = bounds.minX + Math.max(0, Math.min(cols - 1, Math.round((p.x - bounds.minX) / cell))) * cell;
        out.z = bounds.minZ + Math.max(0, Math.min(rows - 1, Math.round((p.z - bounds.minZ) / cell))) * cell;
        out.y = (Math.max(0, Math.min(layers - 1, Math.floor(p.y / cell))) + 0.5) * cell;
        return out;
      }
      function slotFor(key) {
        if (slots.has(key)) return slots.get(key);
        if (used === capacity) return -1;
        const at = used++; slots.set(key, at); keys[at] = key;
        costs[at] = Infinity; parents[at] = heapSlots[at] = -1; closed[at] = 0;
        maxVisited = Math.max(maxVisited, used);
        return at;
      }
      function push(id, cost, point, goal) {
        costs[id] = cost; scores[id] = cost + distance(point, goal) * 1.2;
        let i = heapSlots[id];
        if (i < 0) i = heapSize++;
        while (i > 0) {
          const parent = (i - 1) >> 1, parentId = heap[parent];
          if (scores[parentId] <= scores[id]) break;
          heap[i] = parentId; heapSlots[parentId] = i; i = parent;
        }
        heap[i] = id; heapSlots[id] = i;
      }
      function pop() {
        const first = heap[0], last = heap[--heapSize]; heapSlots[first] = -1;
        if (heapSize) {
          let i = 0;
          while (i * 2 + 1 < heapSize) {
            let child = i * 2 + 1;
            if (child + 1 < heapSize && scores[heap[child + 1]] < scores[heap[child]]) child++;
            if (scores[heap[child]] >= scores[last]) break;
            heap[i] = heap[child]; heapSlots[heap[i]] = i; i = child;
          }
          heap[i] = last; heapSlots[last] = i;
        }
        return first;
      }
      function* search(start, goal) {
        yield;
        if (!pointClear(start) || !pointClear(goal)) return null;
        if (segmentClear(start, goal)) return [copy(goal)];
        slots.clear(); used = heapSize = 0;
        const si = Math.round((start.x - bounds.minX) / cell), sj = Math.round((start.z - bounds.minZ) / cell), sl = Math.floor(start.y / cell);
        for (let dl = -2; dl <= 2; dl++) for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) {
          yield;
          const i = si + di, j = sj + dj, layer = sl + dl;
          if (i < 0 || j < 0 || layer < 0 || i >= cols || j >= rows || layer >= layers) continue;
          const key = i + j * cols + layer * plane;
          if (node(key, nodeP) && segmentClear(start, nodeP)) push(slotFor(key), distance(start, nodeP), nodeP, goal);
        }
        while (heapSize) {
          yield;
          const id = pop(), key = keys[id]; closed[id] = 1;
          const grid = key % plane, layer = Math.floor(key / plane), i = grid % cols, j = Math.floor(grid / cols);
          node(key, nodeP);
          if (distance(nodeP, goal) <= cell * 3 && segmentClear(nodeP, goal)) {
            let count = 0;
            for (let at = id; at !== -1; at = parents[at]) routeScratch[count++] = at;
            const route = []; Object.assign(routeAnchor, start);
            // Keep only visible bends; do not allocate a point object for every visited voxel.
            for (let at = count - 1; at >= 0;) {
              if (segmentClear(routeAnchor, goal)) { route.push(copy(goal)); return route; }
              let next = 0;
              while (next < at) {
                node(keys[routeScratch[next]], nodeQ);
                if (segmentClear(routeAnchor, nodeQ)) break;
                next++; yield;
              }
              node(keys[routeScratch[next]], nodeQ); route.push(copy(nodeQ)); Object.assign(routeAnchor, nodeQ);
              if (route.length >= 64) return null;
              at = next - 1;
            }
            if (!segmentClear(routeAnchor, goal)) return null;
            route.push(copy(goal)); return route;
          }
          for (let dl = -1; dl <= 1; dl++) for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
            if ((!di && !dj && !dl) || layer + dl < 0 || layer + dl >= layers || i + di < 0 || j + dj < 0 || i + di >= cols || j + dj >= rows) continue;
            const nextKey = i + di + (j + dj) * cols + (layer + dl) * plane;
            const known = slots.get(nextKey);
            if ((known !== undefined && closed[known]) || !node(nextKey, nodeQ)) continue;
            const cost = costs[id] + distance(nodeP, nodeQ);
            if ((known !== undefined && cost >= costs[known]) || !segmentClear(nodeP, nodeQ)) continue;
            const next = known === undefined ? slotFor(nextKey) : known;
            if (next < 0) return null;
            parents[next] = id; push(next, cost, nodeQ, goal);
          }
        }
        return null;
      }
      function plan(start, goal) {
        assertActive();
        if (active) throw new Error('Cannot run a synchronous search while a flight search is active.');
        const iterator = search(start, goal); let result;
        do { result = iterator.next(); } while (!result.done);
        return result.value;
      }
      function update(budgetMs = 2) {
        assertActive();
        const deadline = now() + budgetMs; let slices = 0;
        // One search at a time and a small time budget keep the animation responsive.
        while (now() < deadline && slices++ < 128) {
          if (active && (active.agent.flight !== active.flight || active.flight.revision !== active.revision)) { active.iterator.return(); active = null; }
          if (!active) {
            const first = pending.entries().next(); if (first.done) break;
            const [agent, flight] = first.value; pending.delete(agent);
            if (agent.flight !== flight) continue;
            active = { agent, flight, revision: flight.revision, iterator: search(copy(agent.pos), copy(flight.goal)) };
          }
          const result = active.iterator.next();
          if (!result.done) continue;
          const flight = active.flight;
          flight.path = result.value; flight.index = 0; flight.queued = false;
          if (!flight.path) { flight.warned = true; flight.retry = 3; }
          active = null;
        }
      }
      function step(agent, dt) {
        assertActive(); dt = Math.max(0, Math.min(dt, 0.05));
        let flight = agent.flight;
        if (!flight || flight.navigator !== api) {
          flight = agent.flight = { navigator: api, goal: copy(agent.target), path: null, index: 0, retry: 0, revision: 0, velocity: { x: 0, y: 0, z: 0 } };
        } else if (distance(flight.goal, agent.target) > 0.01) {
          pending.delete(agent); flight.revision++; Object.assign(flight.goal, agent.target);
          flight.path = null; flight.index = 0; flight.retry = 0; flight.queued = flight.warned = false;
        }
        if (!flight.path) {
          flight.retry -= dt;
          if (flight.retry > 0) return 'blocked';
          if (!flight.queued && (!pointClear(agent.pos) || !pointClear(agent.target))) { flight.warned = true; flight.retry = 3; return 'blocked'; }
          if (flight.queued) return 'planning';
          // Clear nearby flights do not wait behind a longer A* job.
          if (segmentClear(agent.pos, agent.target)) { flight.path = [copy(agent.target)]; flight.index = 0; flight.warned = false; }
          else { pending.set(agent, flight); flight.queued = true; return 'planning'; }
        }
        while (flight.index < flight.path.length && distance(agent.pos, flight.path[flight.index]) < 0.02) flight.index++;
        if (flight.index === flight.path.length) return 'arrived';
        const waypoint = flight.path[flight.index], length = distance(agent.pos, waypoint), travel = Math.min(length, agent.spd * dt);
        mix(agent.pos, waypoint, travel / length, direct);
        // Follow the checked segment exactly. Wing/bobbing animation supplies the natural motion.
        if (!segmentClear(agent.pos, direct)) { flight.path = null; return 'blocked'; }
        if (dt > 0) for (const axis of axes) flight.velocity[axis] = (direct[axis] - agent.pos[axis]) / dt;
        Object.assign(agent.pos, direct);
        return distance(agent.pos, agent.target) < 0.02 ? 'arrived' : 'moving';
      }
      function visualPosition(pos, offset, out) {
        out.x = pos.x + offset.x; out.y = pos.y + offset.y; out.z = pos.z + offset.z;
        if (!segmentClear(pos, out)) Object.assign(out, pos);
        return out;
      }
      function stats() {
        let bytes = 0;
        for (const array of [boxes, checked, nodeState, cacheKeys, closed, keys, costs, scores, parents, heap, heapSlots, routeScratch]) bytes += array.byteLength;
        for (const bucket of buckets) if (bucket) bytes += bucket.byteLength;
        return {
          bytes, cachedNodes, nodeCapacity: disposed ? 0 : nodeCount, searchCapacity: disposed ? 0 : capacity,
          maxVisited, cacheCapacity: disposed ? 0 : cacheCapacity, voxelSize: cell, obstacles: boxes.length / 6, pendingSearches: pending.size + (active ? 1 : 0), disposed
        };
      }
      function dispose() {
        if (disposed) return;
        active?.iterator.return(); active = null; pending.clear(); slots.clear();
        disposed = true; buckets.length = 0; groundAt = terrain = null; cachedNodes = heapSize = used = maxVisited = 0;
        boxes = costs = scores = new Float32Array(0); checked = keys = cacheKeys = new Uint32Array(0);
        nodeState = closed = new Uint8Array(0); parents = heapSlots = routeScratch = new Int16Array(0); heap = new Uint16Array(0);
      }
      const api = { pointClear, segmentClear, plan, step, update, visualPosition, ground, snapToVoxel, clearance, stats, dispose };
      return api;
    }
