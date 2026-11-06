# Research brief: three.js diorama (Safari, Wix iframe), 6 Nov 2026
[n] = source. "(uncertain)" = thin or conflicting evidence; "(arithmetic)" = my calculation; "(source check)" = I read three.js code on unpkg.

## 1. three.js r187 vs r160

**Status.** The latest release is r187 (30 Oct 2026) [1]. The manual still calls WebGPURenderer "experimental". It calls WebGLRenderer "the recommended choice for pure WebGL 2 applications" [2].

**What you gain by upgrading while staying on WebGLRenderer:**
- `SunLight` (r186): built-in cascaded shadow maps (texel-snapped, blended, now 2 cascades), refit every frame with no caching. It patches `WebGLShadowMap` and the GLSL shadow chunks, so it may clash with your own shadow patches [1][3].
- `LightProbeGridWebGL` (r186): a GPU-baked grid of L2 spherical-harmonic (SH) irradiance probes, with incremental (`start`/`count`) and multi-bounce bakes [4].
- `setNodesHandler(new WebGLNodesHandler())` (r184): TSL materials on WebGL, which eases a later move. It has no VSM and no MRT [5].
- `outputBufferType: HalfFloatType` + `setEffects()` (r182): post-processing without EffectComposer. It is experimental, and its double pass is "quite noticeable performance-wise" [6].
- Shadows and tone mapping: `PCFShadowMap` "is now soft as well" and `PCFSoftShadowMap` is deprecated (r182) [7]. `NeutralToneMapping` arrived in r162 [9]. r160's AgX lacked a gamut-mapping step that r161 added [8].
- BatchedMesh `addInstance` reuses one geometry across instances (r166), with per-instance opacity (r183) [1][7].

**WebGPURenderer:**
- It falls back to WebGL2 automatically. But `ShaderMaterial`, `RawShaderMaterial` and `onBeforeCompile` are unsupported and must be ported to TSL. EffectComposer becomes `RenderPipeline` [2][7].
- Features that need WebGPURenderer: compute, indirect draws, async per-object occlusion queries (`occlusionTest`, WebGPU backend only), TRAA, TAAU/FSR1 upscaling, SSR, SSGI and a new DOF [1][7][12][13].
- CPU cost:
  - Issue #30560 is open: 20,000 cubes ran at 60 fps on WebGL vs 15 fps on WebGPU (Chrome, M1 Pro). On r186's WebGL2 fallback (M4 Max), CPU submit was 31% higher and GL calls 80% higher, due to per-object UBO binds [14].
  - A 4,000-mesh scene on r183 took 4.5 ms CPU on WebGL, 9.7 ms on WebGPU and 10.3 ms on the WebGL2 fallback. First frames took 32, 167 and 344 ms (Chrome, Windows) [15].
  - WebGPU lacks multi-draw, so BatchedMesh drew once per visible instance until r187 merged runs of the same geometry (18,028 → 2 draws in one test) [16].
- Bundle size, tree-shaken: 124.7 KB gzip for WebGL vs 211.7 KB for WebGPU [16].
- **Verdict:** with ~1,100 draws and patched shaders, switching now likely costs CPU time, and the port is L effort.

**What breaks from r160 to r187 on WebGLRenderer** [7]:
- `onBeforeCompile`:
  - `lightmap_fragment` was removed (r164), and `Material.type` became static (r170).
  - Shadow and tone-mapping code was refactored (r182) [1].
  - `CubeUVReflectionMapping` was removed (r187), and `inverseTransformDirection()` deprecated (r185).
  - Patches that edit shadow or env-map chunks need rework. `#include`-level injections mostly survive.
- Lighting, look and RAM:
  - `envMapIntensity` no longer scales `Scene.environment`; that is now `environmentIntensity` (r163). Check how the van's PMREM map is applied.
  - Equirectangular env maps now convert to larger cube maps; "it requires more memory" (r161).
  - PBR energy conservation changed (r181), PMREM was rebuilt (r187), and `Sky` lost its legacy gamma with no way to restore the old look (r183).
  - `useLegacyLights` (deprecated since r155) is gone by r181 (source check) [36][90].
- API:
  - `ColorManagement` methods were renamed (r177), and `Clock` → `Timer` (r183). `stencil` is off by default (r163).
  - `updateWorldMatrix()` now honours `matrixWorldNeedsUpdate` (r185). Check your custom batching.
  - `setViewport`/`setScissor` no longer scale by pixel ratio on render targets (r187). Check the DOF and tilt-shift passes.
  - Colour management was already on by default in r160.

**Safari WebGPU.**
- Shipped in Safari 26.0 for macOS 26 (Tahoe), iOS/iPadOS 26 and visionOS 26 [17]. `navigator.gpu` is hidden on macOS 15 [18], so Sequoia viewers would likely get WebGPURenderer's slowest path, the WebGL2 fallback [15].
- Safari 27.2 (26 Oct 2026) fixed "a severe frame rate drop" in `executeBundles()` with indirect draws [20].

## 2. Engine practices applied to this diorama
Bold = effort / gain.

**(a) Draw calls.**
- Engines:
  - Unity's static batching duplicates shared meshes, which costs memory in forests [22].
  - Unity's animation instancing: about 1,100 draws for 250 skinned characters (3 materials plus shadows), vs about 50 for 800 with animation baked to textures [23]. Bevy 0.16's GPU-driven rendering: ~3× faster [24].
- Apply:
  - One InstancedMesh per small species (bees to bunnies), animated in the vertex shader or via baked vertex-animation textures.
  - BatchedMesh per material for static props. `WEBGL_multi_draw` is in 100% of Safari and iOS sessions [25], and BatchedMesh stores each geometry once [26].
  - `CompressedArrayTexture` layers so props can share materials [27].
- **M / high.**

**(b) Visibility.**
- Engines:
  - Godot visibility ranges set begin/end distances with hysteresis, and a "visibility parent" gives HLOD [28].
  - Godot's occlusion culling is "most effective in indoor scenes" [29]. three.js has occlusion queries only on WebGPU [30].
- Apply:
  - Make the van interior an indoor cell: render it only when the camera is near or inside, and lazy-load and dispose its GLB.
  - Give small props and fauna distance ranges.
  - `@three.ez/batched-mesh-extensions` adds LOD and BVH culling to BatchedMesh [31].
- **S–M / medium–high.**

**(c) Shadows.**
- Engines:
  - HDRP updates shadows on demand, per cascade, or when the light moves [32].
  - UE caches static shadow pages [33], and UE capsule shadows are cheaper than shadow maps for characters [34].
  - three.js caches a map with `shadow.autoUpdate=false` + `needsUpdate` [35].
- Apply:
  - Fix the shadow frustum to the island.
  - Re-render when the sun moves past a threshold (it moves 0.25° per minute, arithmetic), or at about 10 Hz for swaying foliage.
  - Give small animals blob or capsule shadows instead of shadow-map casting.
  - With the default `info.autoReset`, `renderer.info` resets *after* the shadow pass, so shadow draws aren't in your 1,100 (source check) [36].
- **S–M / high.**

**(d) GI.**
- Engines:
  - Unity's Adaptive Probe Volumes store a static sky-occlusion value per probe and multiply it by the live sky colour, so day/night needs no rebake. Lighting Scenarios blend bakes [37][38].
  - Tiny Glade runs a custom, compute-heavy Vulkan renderer [39]. Its developer cites real-time GI and heavy ray marching [40]. Coverage says rays hit proxy geometry, blended with screen-space reflections (secondhand) [41]. Its lead engineer built Embark's kajiya GI [42]; one HN commenter disputes the ray tracing (uncertain). None of it ports to WebGL; only the idea does: coarse low-frequency GI plus screen-space detail.
  - Townscaper: I found no public rendering write-up.
- Apply:
  - Bake LightProbeGrid once under a uniform white sky with the sun off, then scale it each frame by the live sky colour (Unity's trick). The sun stays shadowed direct light. This extends your canopy sky-occlusion to the moving characters and the van.
- **M (needs r186+) / high realism.**

**(e) Post and colour.**
- Engines:
  - Khronos PBR Neutral keeps base colour and hue [43].
  - Apple GPUs resolve MSAA in tile memory [44]. Whether WebKit's WebGL path does is undocumented (uncertain).
- Apply:
  - Use AgX for outdoor HDR, and crossfade a 3D LUT per time of day.
  - Use 4× MSAA on a HalfFloat target (`EXT_color_buffer_half_float`: 100% of Safari [45]) rather than TAA. WebGLRenderer's TAA pass has no motion vectors (TRAA needs WebGPURenderer [7]), so moving grass would ghost.
- **S / medium–high.**

**(f) Vegetation and wind.**
- Engines:
  - Crysis drives "main" and "detail" bending from a per-instance wind vector and vertex-colour channels [46].
  - Ghost of Tsushima animates GPU-generated grass blades individually [47]. UE scales foliage density by quality level [48].
- Apply:
  - Upload the worker's wind field as a small float texture each frame.
  - Draw grass as instanced chunks, culled per chunk, with density falling off by distance.
  - Paint Crysis-style vertex channels on the trees.
- **M / high.**

**(g) Quality tiers.**
- Engines:
  - UE scalability groups cover shadows, post, textures, effects and foliage [48].
  - UE's Animation Budget Allocator throttles skeletal updates to a millisecond budget [49].
- Safari specifics:
  - Safari reports only "Apple GPU" [50] and has no `navigator.deviceMemory` [51].
  - It caps rAF at 60 fps on ProMotion [52], and at 30 fps in cross-origin iframes until the user interacts [53].
- Apply:
  - Pick one of 3–4 tiers from a 2–3 s frame-time probe.
  - Knobs: DPR cap, shadow rate, grass density, DOF/tilt-shift, fauna count, and AI/animation tick rate (far animals at 10–15 Hz).
- **S–M / high on phones.**

**(h) Profiling.**
- Tools:
  - `EXT_disjoint_timer_query_webgl2` is in 0.22% of Safari sessions [54]. stats-gl says to enable Safari's "WebGL Timer Queries" flag [55].
  - WebGPU `timestamp-query` is in 91.5% of Safari sessions [21], and the three.js Inspector has Timeline and Memory tabs [56].
  - Safari 27's Graphics tab records canvas frames [19], and its MCP server lets an agent run JS [57].
  - Safari reportedly clamps timers to 1 ms (uncertain) [58].
- Apply:
  - Build a HUD with draws per pass, CPU ms per subsystem averaged over 60 frames, and `renderer.info.memory`.
  - Enable the timer flag on the dev Mac.
- **S / enabler.**

**(i) Assets and memory.**
- Sizes:
  - Compressed GPU textures use 4–8× less memory. A 4096² RGBA texture with mips takes about 90 MB [59]. ASTC 6×6 is 3.56 bits per pixel vs 32 for RGBA8 (arithmetic).
  - The Basis transcoder is 527 KB wasm plus 57.5 KB JS, uncompressed [60]. KTX2Loader skips it for files stored in a GPU format: r160 already uploads ASTC 6×6 directly (r187 adds 4×4), and Zstd needs only `zstddec`, 17 KB gzip (source check) [91][92][93].
  - Safari WebGL2 has ASTC in 97.8% of sessions (iOS 99.9%, Windows 2.7%) [61]. So: ASTC KTX2 for Apple devices, your current JPEGs elsewhere.
  - meshopt compresses quantised vertices a further 2–4× [62]. Quantised attributes take about 16 bytes per vertex instead of 32 (arithmetic).
- Limits:
  - WebKit kills an active macOS WebContent process at 7 GB plus 1 GB per tab, and starts purging near 1–1.5 GB [63].
  - iOS limits are undocumented: about 1.5–3 GB, anecdotally [64].
  - Without Site Isolation, a cross-site iframe shares its parent's process [65]. Safari's default is unconfirmed [66], so the Wix page likely shares your budget (uncertain).
  - A 4 MP RGBA16F target is 32 MB, or about 128 MB with 4× MSAA (arithmetic).
- **M / high RAM.**

**(j) Audio.**
- Facts:
  - HRTF runs continuous convolution, while equal-power is "rather cheap". Decoded PCM is about 23 MB per stereo minute [67].
  - An AudioContext starts suspended until a gesture [68]. The iframe `autoplay` policy blocks only playback without a gesture [69].
  - Wix sandboxes its HTML iframes and offers no `allow` attribute [70][71].
  - The iOS ringer switch mutes Web Audio unless `audioSession.type='playback'` [72][73].
- Apply:
  - Add a tap-to-enter overlay. It unlocks audio and lifts the 30 fps cap [53].
  - Drive ambient beds from the simulation: wind field, real rain, and river distance.
  - Use HRTF only for the nearest few sources.
- **M / high immersion.**

**(k) AI.**
- Engines:
  - In The Sims, objects advertise which needs they satisfy, and Sims score them with distance [74].
  - UE Smart Objects add slot reservations and tag queries [75]. UE perception has hearing via noise events with a max age [76]. Behaviour-tree/utility hybrids are common [77].
- Apply:
  - Put affordances on objects (stove, bench, trough, bin) with reserved slots.
  - Add a stimulus bus (barks, footsteps) with radius and decay, so deer and birds react.
- **M / liveliness.**

**(l) Animation.**
- Engines:
  - Inertialization handles transitions as a post-process, so source and target aren't both evaluated [78].
  - Motion matching (UE 5.4) needs large mocap databases [79], so it doesn't fit. Godot 4.6 re-added two-bone IK [80].
- Apply: inertialize the procedural transitions, and run foot IK only on quadrupeds near the camera.
- **S–M / medium.**

**(m) Threads.**
- Constraints:
  - SharedArrayBuffer needs the whole frame chain cross-origin isolated, including the top-level page [81]. That is impossible under Wix.
  - GitHub Pages can't send headers [82]. Chrome's Document-Isolation-Policy also needs a header [83].
  - OffscreenCanvas works in Safari 17+ [84], with WebGL in workers from macOS Sonoma on [85].
- Apply: ping-pong transferable ArrayBuffers, and move pathfinding and AI ticks into the existing worker.
- **M / medium.**

**(n) Persistence.**
- Facts:
  - Safari makes third-party localStorage and IndexedDB "partitioned per first-party website and also made ephemeral". It deletes first-party script-writeable storage after 7 days without interaction [86].
  - Animal Crossing time passes while you're away [87]. Stardew schedules are time → map → tile → animation entries [88].
- Apply:
  - Derive world state from seed, real time and weather, plus small deltas.
  - Run a catch-up simulation on load.
  - Send the deltas to Wix page code with `postMessage` [89].
- **S–M / continuity at almost no RAM cost.**

## 3. Shortlist, ranked by gain ÷ effort

| # | Opportunity | Effort | Gain | Needs upgrade / WebGPU |
|---|---|---|---|---|
| 1 | Per-pass HUD, tap-to-enter, off-screen pause (IntersectionObserver), `compileAsync` warm-up (parallel compile: 98.9% of Safari [10][11]) | S | Medium–high | No |
| 2 | Shadow caching plus blob/capsule shadows | S–M | High | No |
| 3 | GPU-instanced fauna | M | High | No |
| 4 | BatchedMesh plus texture arrays | M | High, less RAM | ≥r166 recommended |
| 5 | ASTC KTX2 plus quantised/meshopt GLBs | M | High (RAM) | No |
| 6 | Quality tiers plus animation/AI LOD | S–M | High on phones | No |
| 7 | Van interior cell, lazy-loaded | S–M | Medium–high | No |
| 8 | AgX/Neutral, LUTs, MSAA on HalfFloat | S | Medium–high | Neutral ≥r162 |
| 9 | SH probe grid × live sky colour | M | High (realism) | r186+ |
| 10 | Smart objects, real-clock schedules, catch-up | M | High (liveliness) | No |

**Deferred:**
- Simulation-driven audio: M effort; watch the PCM RAM.
- WebGPURenderer: L effort, **WebGPU**. Revisit once draws are consolidated and #30560 is fixed; write new materials in TSL meanwhile.

**Still open:** Safari per-draw cost; iOS memory ceilings; Safari Site Isolation; Chrome audio unlock without `allow="autoplay"`; Tiny Glade's GI; LightProbeGrid with patched materials.

## Sources
[1] https://github.com/mrdoob/three.js/releases
[2] https://threejs.org/manual/pages/webgpurenderer.html
[3] https://github.com/mrdoob/three.js/pull/34221
[4] https://threejs.org/docs/pages/LightProbeGridWebGL.html
[5] https://github.com/mrdoob/three.js/pull/32851
[6] https://github.com/mrdoob/three.js/pull/32461
[7] https://github.com/mrdoob/three.js/wiki/Migration-Guide
[8] https://discourse.threejs.org/t/is-agx-tonemapping-implemented-correctly/60609
[9] https://threejs.org/docs/pages/WebGLRenderer.html
[10] https://github.com/mrdoob/three.js/pull/19752
[11] https://web3dsurvey.com/webgl2/extensions/KHR_parallel_shader_compile
[12] https://github.com/mrdoob/three.js/pull/26335
[13] https://github.com/mrdoob/three.js/pull/33368
[14] https://github.com/mrdoob/three.js/issues/30560
[15] https://discourse.threejs.org/t/webgpurenderer-2x-slower-cpu-and-5-10x-slower-first-frame-than-webglrenderer-on-many-mesh-scenes-r183-same-on-both-backends/91904
[16] https://github.com/mrdoob/three.js/pull/35259
[17] https://webkit.org/blog/17333/webkit-features-in-safari-26-0/
[18] https://bugs.webkit.org/show_bug.cgi?id=299237
[19] https://webkit.org/blog/18325/webkit-features-for-safari-27-0/
[20] https://webkit.org/blog/18515/webkit-features-for-safari-27-2/
[21] https://web3dsurvey.com/webgpu/features/timestamp-query
[22] https://docs.unity3d.com/6000.1/Documentation/Manual/static-batching
[23] https://blog.unity.com/engine-platform/animation-instancing-for-skinnedmeshrenderer
[24] https://bevy.org/news/bevy-0-16/
[25] https://web3dsurvey.com/webgl2/extensions/WEBGL_multi_draw
[26] https://threejs.org/docs/pages/BatchedMesh.html
[27] https://threejs.org/docs/pages/CompressedArrayTexture.html
[28] https://docs.godotengine.org/en/stable/tutorials/3d/visibility_ranges.html
[29] https://docs.godotengine.org/en/stable/tutorials/3d/occlusion_culling.html
[30] https://discourse.threejs.org/t/in-three-js-have-occlusion-culling/15076
[31] https://github.com/agargaro/batched-mesh-extensions
[32] https://docs.unity3d.com/Packages/com.unity.render-pipelines.high-definition@16.0/manual/shadow-update-mode.html
[33] https://forums.unrealengine.com/t/constant-invalidation-of-vsm-dynamic-shadows-in-5-7-0/2686534
[34] https://dev.epicgames.com/documentation/en-us/unreal-engine/capsule-shadows-overview-in-unreal-engine
[35] https://threejs.org/docs/pages/LightShadow.html
[36] https://unpkg.com/three@0.160.0/src/renderers/WebGLRenderer.js (render(): shadowMap.render precedes info.reset)
[37] https://docs.unity.com/en-us/engine/current/manual/lighting-overview/lighting/probevolumes/probe-volumes-change-lighting-at-runtime/skyocclusion
[38] https://docs.unity.com/en-us/engine/current/manual/lighting-overview/lighting/probevolumes/probe-volumes-change-lighting-at-runtime/bakedifferentlightingsetups
[39] https://80.lv/articles/exclusive-tiny-glade-developers-discuss-bevy-proceduralism-publishers-cozy-games
[40] https://x.com/h3r2tic/status/1813197502411092186
[41] https://gamernet.pages.dev/posts/tiny-glade-an-indie-diorama-builder-that-proves-the-power-of-bespoke-game-engines
[42] https://news.ycombinator.com/item?id=42191172
[43] https://www.khronos.org/news/press/khronos-pbr-neutral-tone-mapper-released-for-true-to-life-color-rendering-of-3d-products
[44] https://developer.apple.com/videos/play/tech-talks/606/
[45] https://web3dsurvey.com/webgl2/extensions/EXT_color_buffer_half_float
[46] https://developer.nvidia.com/gpugems/gpugems3/part-iii-rendering/chapter-16-vegetation-procedural-animation-and-shading-crysis
[47] https://gdcvault.com/play/1027214/Advanced-Graphics-Summit-Procedural-Grass
[48] https://dev.epicgames.com/documentation/en-us/unreal-engine/scalability-reference-for-unreal-engine
[49] https://dev.epicgames.com/documentation/en-us/unreal-engine/animation-budget-allocator-in-unreal-engine
[50] https://github.com/pmndrs/detect-gpu/issues/47
[51] https://caniuse.com/mdn-api_navigator_devicememory
[52] https://bugs.webkit.org/show_bug.cgi?id=272226
[53] https://bugs.webkit.org/show_bug.cgi?id=170534
[54] https://web3dsurvey.com/webgl2/extensions/EXT_disjoint_timer_query_webgl2
[55] https://github.com/RenaudRohlinger/stats-gl
[56] https://app.unpkg.com/three@0.184.0/files/examples/jsm/inspector/Inspector.js
[57] https://webkit.org/blog/18136/introducing-the-safari-mcp-server-for-web-developers/
[58] https://groups.google.com/a/chromium.org/g/blink-dev/c/k6M3HJiqmkE
[59] https://www.donmccurdy.com/2024/02/11/web-texture-formats/
[60] https://app.unpkg.com/three@0.181.0/files/examples/jsm/libs/basis
[61] https://web3dsurvey.com/webgl2/extensions/WEBGL_compressed_texture_astc
[62] https://github.com/zeux/meshoptimizer/blob/master/README.md
[63] https://raw.githubusercontent.com/WebKit/WebKit/main/Source/WTF/wtf/MemoryPressureHandler.cpp
[64] https://github.com/Nehanth/pooled/issues/207
[65] https://docs.webkit.org/Deep%20Dive/SiteIsolation.html
[66] https://github.com/inspectdev/inspect-issues/issues/241
[67] https://padenot.github.io/web-audio-perf/
[68] https://developer.chrome.com/blog/autoplay
[69] https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy/autoplay
[70] https://support.wix.com/en/article/studio-editor-adding-an-html-iframe-element
[71] https://wix.com/wix-lp/new-wixcode/forum/coding-with-velo/autoplay-in-html-component
[72] https://bugs.webkit.org/show_bug.cgi?id=251532
[73] https://developer.mozilla.org/en-US/docs/Web/API/AudioSession/type
[74] https://gameindustrylibrary.com/documents/gmtk-the-genius-ai-behind-the-sims
[75] https://dev.epicgames.com/documentation/en-us/unreal-engine/smart-objects-in-unreal-engine---overview
[76] https://dev.epicgames.com/documentation/en-us/unreal-engine/ai-perception-in-unreal-engine
[77] https://en.wikipedia.org/wiki/Utility_system
[78] https://gdcvault.com/play/1025165/Inertialization-High-Performance-Animation-Transitions
[79] https://www.unrealengine.com/en-US/blog/unreal-engine-5-4-is-now-available
[80] https://godotengine.org/article/inverse-kinematics-returns-to-godot-4-6/
[81] https://web.dev/articles/coop-coep
[82] https://docs.wasmer.io/sdk/wasmer-js/how-to/coop-coep-headers
[83] https://developer.chrome.com/blog/document-isolation-policy
[84] https://caniuse.com/offscreencanvas
[85] https://bugs.webkit.org/show_bug.cgi?id=183720
[86] https://webkit.org/tracking-prevention/
[87] https://nookipedia.com/wiki/Animal_Crossing_series
[88] https://stardewvalleywiki.com/Modding:Schedule_data
[89] https://dev.wix.com/docs/velo/api-reference/$w/html-component/on-message
[90] https://unpkg.com/three@0.181.0/src/renderers/WebGLRenderer.js (no useLegacyLights)
[91] https://unpkg.com/three@0.160.0/examples/jsm/loaders/KTX2Loader.js (raw-format path)
[92] https://unpkg.com/three@0.187.0/examples/jsm/loaders/KTX2Loader.js
[93] https://unpkg.com/three@0.160.0/examples/jsm/libs/zstddec.module.js
