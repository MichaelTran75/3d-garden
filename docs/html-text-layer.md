# Lớp chữ HTML

## Mã

- `core/html-text.js` (manifest ngay sau `core/world.js`): `htmlSprite(sp, { paint, w, h, tone })`, `htmlSpriteDirty`; ô tự đặt `htBox / htSize / htAt / htShow`; màu `htTone / htRaw / htToneCol`; `htmlTextTick` (`worldTick('afterRender', 5)`).
- `core/lens.js`: `lensBlurPx`, `lnReadAf`. Bộ đo: `docs/html-text-probe/`.

## Chạy

- WebGL bị `pxCap` ⇒ chữ nhoè ⇒ mỗi chữ = `div` + canvas 2D cỡ CSS × `htDpr()` trong `.html-text` (z 4, dưới `.ui`, không nhận chuột).
- `htmlSprite` tắt `material.visible`; mỗi khung đọc của sprite: chỗ, cỡ, ẩn / hiện (cả cha; chỉ lớp 31 = giấu), `opacity`, `rotation`, `renderOrder`.
- `paint` vẽ theo đơn vị nguồn w × h; không có ⇒ chép canvas `material.map` khi `map.version` đổi.
- Đang zoom: co giãn ảnh cũ; dừng 1 khung ⇒ vẽ lại ≤ `HT_REDRAW` ô / khung.
- `tone` như sprite WebGL (ACES): `'srgb'` (mặc định, như texture `SRGBColorSpace`) · `'raw'` (texture không sRGB) · `false`.
- Ngoài `LAYER_SHARP` ⇒ CSS blur = `lensBlurPx` × `userData.lensK`; tiêu cự đọc qua PBO + `fenceSync`, trễ 1–3 khung.
- Chữ luôn trên vật + mây (không theo độ sâu); chữ trên mặt vật (lon, biển, màn hình) vẫn là texture.

## Bẫy

- `#scene canvas` ép 100 % `!important` ⇒ bọc canvas trong `div` đặt cỡ.
- Lệch nửa điểm ảnh ⇒ mờ: đặt chỗ qua `htAt`.
- `shadowBlur` không theo `setTransform` ⇒ nhân `ctx.getTransform().a`.
- Đọc điểm ảnh canvas GPU (`getImageData`, chép sang canvas `willReadFrequently`) chậm ⇒ ô lớn / vẽ lại thường (bong bóng kỹ sư, đếm ngược, chó nghĩ): `tone: false`, tô sẵn bằng `htToneCol`.
- three r160 `packing.glsl`: byte cao nhất ở kênh a (giải mã tiêu cự: `lnReadAf`).
- `core/mem-trim.js` thu canvas đã lên GPU về 1 × 1; sprite chữ giữ `material.visible = false` ⇒ nguồn chép còn nguyên.
- Nút "Nhãn" chỉ ẩn `labelGroup`; bong bóng + đếm ngược kỹ sư vẫn hiện.
- Trang debug: symlink `css` cạnh trang (mkdbg không nhúng css).
