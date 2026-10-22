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
      Promise.all([import('https://esm.sh/three@0.160.0'), import('https://esm.sh/three@0.160.0/examples/jsm/utils/BufferGeometryUtils.js')])
        .then(([m, u]) => {
          window.removeEventListener('pagehide', onBootPageHide);
          if (window.__cancelGardenBoot === cancelBoot) delete window.__cancelGardenBoot;
          if (bootCancelled) return;
          build(m, u.mergeGeometries); cleanupBuild = null;
        }).catch(e => {
          if (bootCancelled) return;
          cancelBoot();
          cleanupBuild?.(); cleanupBuild = null;
          console.error(e); fail(e.message);
        });

      function build(THREE, mergeGeometries) {
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
        scene.background = new THREE.Color(0xE2D6C0);
        scene.fog = new THREE.Fog(0xE2D6C0, 280, 700);
        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 4000); camera.zoom = 0.5;   // mặc định: zoom-out tối đa khi mở trang

        const hemi = new THREE.HemisphereLight(0xffffff, 0xb6ab8e, 0.82); scene.add(hemi);
        const amb = new THREE.AmbientLight(0xffffff, 0.28); scene.add(amb);
        const sun = new THREE.DirectionalLight(0xfff4e0, 0.98);
        sun.position.set(72, 112, 52); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
        const sc = sun.shadow.camera; sc.left = -116; sc.right = 116; sc.top = 116; sc.bottom = -116; sc.near = 1; sc.far = 440;
        sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; scene.add(sun);

