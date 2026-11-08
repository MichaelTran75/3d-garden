# Ống kính điện ảnh và cận cảnh

<!-- toc -->
- Mã · 0.2 KB
- Cận cảnh · 0.3 KB
- Ống kính điện ảnh · 1.5 KB
- Bẫy · 0.6 KB
<!-- /toc -->

## Mã

- `core/lens.js`: `lensRender(dt)` ← loop/main-loop-rest.js; `LENS`, `LENS_*`; lượt vẽ: đầu tệp
- `loop/close-up.js`: `fitSunShadow()`, `updateCloseLod()`, `registerCloseLod(root)`
- `core/boot.js`: `LAYER_SHARP` = 29, `sharpRoots`

## Cận cảnh

- `fitSunShadow()`: bóng ôm vùng đất đang thấy, nấc ×1,25, ≤ 116 đv, tâm bám lưới điểm bóng
- `updateCloseLod()`: vật tròn quanh kỹ sư, trại, xe: bán kính > 13 px → bản ×3 cạnh, < 9 px trả; chỉ hình nguyên gốc; bỏ `flatShading`; mảnh trong lô tạm tự vẽ (`userData.lodHi`)

## Ống kính điện ảnh

- Bật: bám vật `CAMF.o` ×16 → ×30; sa bàn nhìn chéo ×2 → ×3. `LENS.s` < 0,02 ⇒ vẽ thẳng; khung tạm trả sau 3 s; từ ×3 khung MSAA giữ suốt (~90 MB)
- CoC theo khoảng cách NGANG tới camera (mặt nét đứng), tăng liền: bậc 2 → tuyến tính → đuôi xa `LENS_FAR` ×. Kẹp dải màn hình ⇒ vật trước vẫn mờ; độ sâu trục nhìn ⇒ tán sau cột lại nét
- Nét → mờ nhỏ → ảnh gom ½ phân giải (trộn thẳng ⇒ thấy biên); bán kính gom theo CoC max ô (theo cả khung ⇒ CoC nhỏ loang lổ)
- Sa bàn: dải nét hẹp dần ×3 → ×30 (`LENS_TS_A0` → `LENS_TS_A1`); tiêu cự = lấy nét tự động giữa khung `lnAf` (ở `target` dưới đất ⇒ lệch 3–4 m sau vật)
- Bám vật: nét ± `LENS_RG`, tiêu cự ở vật (bám kỹ sư trong xe ⇒ mái mờ)
- `userData.lensSoft = { k, b }` (con trực tiếp scene, ≤ 2 hộp cục bộ): CoC × k trong hộp (world/weather-mast.js); tìm 1 lần (`LENS_SOFT.o`), 1 vật; vật khác lọt hộp (± 0,25 m) cũng bớt mờ; đừng tách vật sang lớp riêng (mất gộp vẽ)
- Chữ HTML (core/html-text.js): CSS mờ = `lensBlurPx` × `userData.lensK`; tiêu cự về CPU không chờ (`lnReadAf`)
- Lớp nét vẽ sau lớp mờ: nhãn, viền rê chuột, bong bóng, `sharpRoots`; `lnSharp` chỉ đổi vật lớp 0 (nhãn giấu lớp 31 để yên); độ sâu ghi lùi 4 cm (MSAA lệch tâm ⇒ viền lấm tấm), < 6 cm nhích viền

## Bẫy

- Hướng nắng = `sun.position − sun.target.position` (coi `sun.position` là hướng ⇒ sai bóng, sai ánh ngọn cỏ); đích nắng dời theo vùng nhìn, phải trong scene
- r160: khung tạm tuyến tính bạc màu ⇒ `isXRRenderTarget = true`; sRGB đặt SAU `setRenderTarget` đầu (trước ⇒ lỗi 1282, khung đen); đổi cỡ ⇒ `lnMake` dựng mới
- `scene.background` = lệnh xoá ⇒ vào khung tạm thay màu `convertLinearToSRGB`
- Có lại ngữ cảnh: bỏ tham chiếu khung tạm, không dispose, `lnMake` dựng lại (three tự dựng ⇒ 1282)
