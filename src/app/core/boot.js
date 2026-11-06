    (function () {
      window.__cancelGardenBoot?.();
      window.__disposeGarden?.();
      const fail = (m) => { const e = document.getElementById('err'); if (e) { e.textContent = 'Không tải được Three.js (cần mạng). ' + m; e.style.display = 'block'; } const l = document.getElementById('loading'); if (l) l.style.display = 'none'; };
      let bootCancelled = false, cleanupBuild = null;
      function cancelBoot() {
        bootCancelled = true;
        window.removeEventListener('pagehide', onBootPageHide);
        if (window.__cancelGardenBoot === cancelBoot) delete window.__cancelGardenBoot;
      }
      const onBootPageHide = e => { if (!e.persisted) cancelBoot(); };
      window.__cancelGardenBoot = cancelBoot;
      window.addEventListener('pagehide', onBootPageHide);
      window.__ld?.(8, 18, 'Đang tải three.js…');   // SỐ % lúc mở trang (src/page.html): mã cảnh đã tải xong
      Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js')])
        .then(([m, u]) => {
          window.removeEventListener('pagehide', onBootPageHide);
          if (window.__cancelGardenBoot === cancelBoot) delete window.__cancelGardenBoot;
          if (bootCancelled) return;
          window.__ld?.(18, 19, 'Đang ghép voxel + line-art…');
          return build(m, u.mergeGeometries).then(() => { cleanupBuild = null; });
        }).catch(e => {
          if (bootCancelled) return;
          cancelBoot();
          cleanupBuild?.(); cleanupBuild = null;
          console.error(e); fail(e.message);
        });

      async function build(THREE, mergeGeometries) {
        // NHỊP TẢI (G 23/10 "add % loading number when start"): build.py chèn `if (ldStep(phần mã đã chạy)) await ldYield();` giữa các mảnh mã tới hết
        //  core/collide.js (sau đó là trình nghe sự kiện giao diện, vòng vẽ) ⇒ cứ ~70 ms nhường 1 khung cho trình duyệt vẽ số % (18 → 68%); trang ẩn thì không nhường.
        //  rAF không tới (khung nhúng ngoài màn hình) ⇒ 150 ms tự đi tiếp. ldTrack(promise): mẫu 3D / ảnh tải lúc mở trang — khung đầu chờ (tối đa 6 s, loop/main-loop-rest.js)
        let ldT = performance.now();
        //  ldGate: mở ở cuối dựng cảnh (loop/main-loop-rest.js) — mẫu 3D tải xong giữa 2 nhịp nhường vẫn chờ cổng rồi mới gắn vào cảnh (hàm gắn dùng biến của tệp sau,
        //  vd attach() xe → VPART của van/body/van-doors.js: gắn sớm = lỗi biến chưa khai báo); tải vẫn chạy song song với dựng cảnh
        let ldOpen = null; const ldGate = new Promise(r => { ldOpen = r; }), ldAfter = v => ldGate.then(() => v);   // .then(ldAfter): chờ cổng, giữ giá trị
        const ldNeed = [], ldTrack = p => { ldNeed.push(Promise.resolve(p).catch(() => {})); return p; };
        const ldStep = f => { window.__ld?.(18 + 50 * f, 19 + 50 * f); return !document.hidden && performance.now() - ldT > 70; };
        const ldYield = () => new Promise(r => { const go = () => { clearTimeout(id); ldT = performance.now(); r(); }, id = setTimeout(go, 150); requestAnimationFrame(() => setTimeout(go, 0)); });
        let disposed = false, frameId = 0, copyTimer = null, suspended = document.hidden, offscreen = false, viewObserver = null;
        const sceneEvents = new AbortController(), windUniforms = new Map(), flightRoots = [];
        const butterflies = [], bees = [], extraGeometries = new Set(), sceneWeather = window.gardenWeather;
        let flightNav = null, surfaceHeights = null, flowerNectar = null, mastGlass = null;
        let bakedFlightBounds = new WeakMap();
        const listen = (target, type, fn, options = {}) => target.addEventListener(type, fn, { ...options, signal: sceneEvents.signal });
        function disposeTree(root) {
          const geos = new Set(), mats = new Set(), textures = new Set(), skeletons = new Set();
          root.traverse(o => {
            if (o.geometry) geos.add(o.geometry);
            if (o.material) for (const m of (Array.isArray(o.material) ? o.material : [o.material])) mats.add(m);
            if (o.skeleton) skeletons.add(o.skeleton);
            if (o.isInstancedMesh) o.dispose();
            if (o.shadow) o.shadow.dispose();
          });
          for (const m of mats) {
            for (const value of Object.values(m)) if (value?.isTexture) textures.add(value);
            for (const uniform of Object.values(m.uniforms || {})) if (uniform.value?.isTexture) textures.add(uniform.value);
          }
          for (const g of geos) g.dispose();
          for (const m of mats) m.dispose();
          for (const t of textures) t.dispose();
          for (const skeleton of skeletons) skeleton.dispose();
        }
        const container = document.getElementById('scene');
        const W = () => container.clientWidth, Hv = () => container.clientHeight;
        const clock = new THREE.Clock();
        const SHADER_TIME_LOOP = 1140 * Math.PI;              // ≈ 3581 s: ω = 3,0 · 2,2 · 7,5 (nước) và 3,5 (cỏ cây) đều quay số nguyên vòng — chu kỳ thời gian đưa vào shader (dời từ loop/main-loop.js 01/11)
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        const scene = new THREE.Scene();
        function releaseScene() {
          if (disposed) return;
          disposed = true; suspended = true;
          if (frameId) cancelAnimationFrame(frameId); frameId = 0;
          viewObserver?.disconnect(); viewObserver = null;
          if (copyTimer !== null) clearTimeout(copyTimer); copyTimer = null;
          sceneEvents.abort(); sceneWeather?.destroy();
          flightNav?.dispose(); flightNav = null;
          flowerNectar?.clear(); flowerNectar = null;
          surfaceHeights = null; bakedFlightBounds = new WeakMap(); flightRoots.length = 0;
          for (const insect of [...bees, ...butterflies]) insect.flight = null;
          bees.length = butterflies.length = 0;
          disposeTree(scene); scene.clear();
          for (const geometry of extraGeometries) geometry.dispose();
          extraGeometries.clear(); windUniforms.clear();
          renderer.renderLists?.dispose(); renderer.dispose(); renderer.forceContextLoss?.();
          mastGlass?.remove(); mastGlass = null;
          renderer.domElement.remove();
          if (window.gardenWeather === sceneWeather) delete window.gardenWeather;
          if (window.__disposeGarden === destroyGarden) { delete window.__disposeGarden; delete window.__info; }
        }
        cleanupBuild = releaseScene;
        // ---- dừng vẽ / dọn cảnh (01/11 đợt 11 — dời từ ui/xray-lifecycle.js): tab ẩn, khung 3D cuộn khuất ⇒ pauseScene; rời trang ⇒ destroyGarden (báo tin
        //      'gardenGone' — đơn vị tự thả dữ liệu của mình — rồi releaseScene). Chạy tiếp + nghe sự kiện trang: loop/lifecycle.js ----
        function pauseScene() {
          suspended = true; if (frameId) cancelAnimationFrame(frameId); frameId = 0;
          clock.stop();
        }
        function destroyGarden() {
          if (disposed) return;
          pauseScene();
          worldTell('gardenGone');   // đơn vị tự thả dữ liệu của mình (đàn cò: animals/storks/face.js)
          releaseScene();
        }
        // trần ĐIỂM ẢNH khung vẽ (G 19/10 "giảm độ phân giải … ko ảnh hưởng vật lý hiệu ứng"): màn 6K 3008 × 1692 điểm × 1,6 ⇒ ~12 triệu điểm ảnh, khung hình
        // MSAA 4× ≈ 36 byte / điểm ⇒ ~440 MB RAM đồ hoạ chỉ cho khung vẽ. G 19/10 "giảm độ phân giải 6k xuống 2k": trần = 2K (2048 × 1080 ≈ 2,2 triệu điểm ảnh)
        // ⇒ khung vẽ ≤ ~80 MB ở mọi màn (6K toàn màn hình: hệ số ~0,68). Mô phỏng / hạt / gió / va chạm không phụ thuộc độ phân giải
        const PX_MAX = 2048 * 1080, pxCap = (w = innerWidth, h = innerHeight) => Math.min(window.devicePixelRatio, 1.6, Math.sqrt(PX_MAX / Math.max(1, w * h)));
        renderer.setPixelRatio(pxCap());
        renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.05;
        container.appendChild(renderer.domElement);
        const dom = renderer.domElement;   // khung vẽ: ô điều khiển, rê chuột, nhãn, radio đọc chỗ trên màn hình qua đây (dời từ ui/labels-controls.js 01/11)
        scene.background = new THREE.Color(0xE2D6C0);
        scene.fog = new THREE.Fog(0xE2D6C0, 280, 700);
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 4000); camera.zoom = 0.5;   // mặc định: zoom-out tối đa khi mở trang
        // LỚP NÉT (G 05/11, ống kính điện ảnh core/lens.js): nhãn, viền rê chuột, bong bóng nằm ở lớp riêng — lúc mờ hậu cảnh chúng vẽ SAU lớp mờ nên vẫn nét;
        //  ngoài lúc đó camera thấy lớp này như lớp thường. Vật đặt thẳng (o.layers.set) · nhóm có con sinh giữa chừng thì đưa vào sharpRoots (duyệt mỗi khung)
        const LAYER_SHARP = 29, sharpRoots = []; camera.layers.enable(LAYER_SHARP);

        const hemi = new THREE.HemisphereLight(0xffffff, 0xb6ab8e, 0.82); scene.add(hemi);
        const amb = new THREE.AmbientLight(0xffffff, 0.28); scene.add(amb);
        const sun = new THREE.DirectionalLight(0xfff4e0, 0.98);
        sun.position.set(72, 112, 52); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
        const sc = sun.shadow.camera; sc.left = -116; sc.right = 116; sc.top = 116; sc.bottom = -116; sc.near = 1; sc.far = 440;
        sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; scene.add(sun);

