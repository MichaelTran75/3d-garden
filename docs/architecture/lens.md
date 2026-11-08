# Ống kính điện ảnh và cận cảnh

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../../src/ARCHITECTURE.md).

<!-- toc -->
- Mã · 0.3 KB
- Cận cảnh · 0.4 KB
- Ống kính điện ảnh · 1.1 KB
- Bẫy · 1.4 KB
<!-- /toc -->

## Mã

- `core/lens.js` — `lensRender(dt)` (gọi ở loop/main-loop-rest.js), `LENS`, hằng `LENS_*`; lượt vẽ: chú thích đầu tệp.
- `loop/close-up.js` — `fitSunShadow()`, `updateCloseLod()`, `registerCloseLod(root)`.
- `core/boot.js` — `LAYER_SHARP` = 29, `sharpRoots`.

## Cận cảnh

- `fitSunShadow()`: tấm bóng ôm vùng đất đang thấy, nấc ×1,25 (rộng nhất 116 đv), tâm bám lưới điểm bóng.
- `updateCloseLod()`: vật tròn quanh kỹ sư, trại, xe → bản ×3 cạnh khi bán kính > 13 px (< 9 trả); chỉ hình còn nguyên như lúc tạo, bỏ `flatShading`; mảnh trong lô gộp tạm tự vẽ (`userData.lodHi`).

## Ống kính điện ảnh

- Bật: bám vật (`CAMF.o`) ×16 → ×30, hoặc sa bàn ×2 → ×3 khi nhìn chéo; `LENS.s` < 0,02 ⇒ vẽ thẳng, khung tạm trả sau 3 s.
- Vòng nhoè theo khoảng cách NGANG tới camera (mặt phẳng nét đứng), tăng liền: chân bậc 2 → tuyến tính → đuôi xa tới `LENS_FAR` ×.
- Ba mức nét → mờ nhỏ → ảnh gom nửa phân giải; bán kính gom theo từng điểm ảnh (CoC lớn nhất theo ô).
- Sa bàn: dải nét hẹp dần ×3 → ×30 (`LENS_TS_A0` → `LENS_TS_A1`), tiêu cự = lấy nét tự động giữa khung (`lnAf`). Bám vật: vùng nét ± `LENS_RG`, tiêu cự ở vật.
- `userData.lensSoft = { k, b }` (con trực tiếp của scene, ≤ 2 hộp cục bộ): CoC × k trong hộp — world/weather-mast.js.
- Chữ HTML (core/html-text.js) mờ bằng CSS theo `lensBlurPx` × `userData.lensK`; tiêu cự đọc về CPU không chờ (`lnReadAf`).
- Lớp nét vẽ sau lớp mờ: nhãn, viền rê chuột, bong bóng, nhóm trong `sharpRoots`; `lnSharp` chỉ đổi vật ở lớp 0 (nhãn giấu ở lớp 31 để yên).

## Bẫy

- Hướng nắng = `sun.position − sun.target.position`; đích nắng dời theo vùng nhìn, phải nằm trong scene.
- three r160: khung tạm tuyến tính ⇒ bạc màu ⇒ `isXRRenderTarget = true`; colorSpace sRGB đặt SAU lần `setRenderTarget` đầu (đặt trước ⇒ blit lỗi 1282, khung đen); đổi cỡ ⇒ `lnMake` dựng mới.
- `scene.background` là lệnh xoá ⇒ lúc vẽ vào khung tạm thay bằng màu đã `convertLinearToSRGB`.
- Có lại ngữ cảnh WebGL ⇒ bỏ tham chiếu khung tạm (không dispose) để `lnMake` dựng lại; three tự dựng thì dính lỗi 1282.
- Độ sâu ghi lùi 4 cm (độ sâu MSAA lấy mẫu lệch tâm ⇒ viền rê chuột lấm tấm); giữ < 6 cm nhích của viền.
- Trộn thẳng nét với ảnh gom ⇒ thấy biên; bán kính gom theo cả khung ⇒ CoC nhỏ loang lổ.
- Kẹp sa bàn theo dải màn hình ⇒ vật đứng trước vẫn mờ; độ sâu trục nhìn ⇒ tán cây sau cột lại nét.
- Tiêu cự ở điểm nhìn `target` (dưới mặt đất) ⇒ nét lệch 3–4 m sau vật.
- `lensSoft` tìm 1 lần (`LENS_SOFT.o`), chỉ 1 vật; đừng tách vật sang lớp riêng (mất gộp vẽ). Vật khác lọt hộp (± 0,25 m) cũng mờ ít đi.
- Bám kỹ sư trong xe ⇒ mái xe mờ (tiêu cự ở kỹ sư).
- Từ ×3 khung tạm MSAA giữ suốt (~90 MB).
