        // ==== VÒNG ĐỜI TRANG (01/11 đợt 11 — dời nguyên văn từ ui/xray-lifecycle.js): tab ẩn / khung 3D cuộn khuất ⇒ dừng vẽ (pauseScene, core/boot.js); hiện lại ⇒
        //      chạy tiếp vòng lặp (resumeScene); rời trang ⇒ dọn cảnh (destroyGarden, core/boot.js). started: khung đầu đã vẽ (loop/main-loop-rest.js tắt màn chờ) ====
        function resumeScene() {
          if (disposed || document.hidden || offscreen || !suspended) return;   // khung 3D bị cuộn khuất (nhúng Wix) thì giữ nghỉ
          suspended = false;
          const elapsed = clock.elapsedTime; clock.start(); clock.elapsedTime = elapsed;
          frameId = requestAnimationFrame(loop);
        }
        listen(document, 'visibilitychange', () => document.hidden ? pauseScene() : resumeScene());
        if ('IntersectionObserver' in window) {   // khung 3D ra khỏi màn hình (người xem cuộn trang) → dừng vẽ, tiết kiệm GPU/CPU; cuộn vào lại → chạy tiếp
          viewObserver = new IntersectionObserver(entries => { offscreen = !entries[entries.length - 1].isIntersecting; if (offscreen) pauseScene(); else resumeScene(); }, { threshold: 0 });
          viewObserver.observe(container);
        }
        listen(window, 'pagehide', e => e.persisted ? pauseScene() : destroyGarden());
        listen(window, 'pageshow', resumeScene);
        window.__disposeGarden = destroyGarden;
        let started = false;
        window.__info = () => renderer.info.render;   // đầu dò hiệu năng: __info().calls = draw call/frame · .triangles
