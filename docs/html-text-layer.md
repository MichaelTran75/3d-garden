# Lớp chữ HTML

> Ghi cho AI sửa mã: hiện trạng + bẫy. Chỉ mục: [ARCHITECTURE](../src/ARCHITECTURE.md).

## Mã

- `core/html-text.js` (manifest: ngay sau `core/world.js`) — `htmlSprite(sp, { paint, w, h, tone })`, `htmlSpriteDirty`; ô tự đặt `htBox / htSize / htAt / htShow`; màu `htTone / htRaw / htToneCol`; `htmlTextTick` (`worldTick('afterRender', 5)`).
- `core/lens.js` — `lensBlurPx`, `lnReadAf`. Bộ đo: `docs/html-text-probe/`.

## Chạy thế nào

- Khung WebGL bị giới hạn điểm ảnh (`pxCap`) ⇒ chữ trong cảnh nhoè. Mỗi chữ = `div` + canvas 2D cỡ CSS × `htDpr()` trong `.html-text` (z 4, dưới `.ui`, không nhận chuột).
- `htmlSprite` tắt `material.visible`; mỗi khung đọc chỗ, cỡ, ẩn / hiện (cả cha; chỉ lớp 31 = giấu), `opacity`, `rotation`, `renderOrder` của sprite.
- `paint` vẽ theo đơn vị nguồn w × h; không có ⇒ chép canvas `material.map` khi `map.version` đổi. Đang zoom thì co giãn ảnh đang có, dừng 1 khung ⇒ vẽ lại (≤ `HT_REDRAW` ô / khung).
- `tone` tô như sprite WebGL (ACES): `'srgb'` (mặc định, như texture `SRGBColorSpace`) · `'raw'` (như texture không gắn sRGB) · `false`.
- Sprite ngoài `LAYER_SHARP` ⇒ CSS blur theo `lensBlurPx` × `userData.lensK`; tiêu cự đọc qua PBO + `fenceSync`, trễ 1–3 khung.
- Chữ luôn trên vật và mây (không che theo độ sâu). Chữ trên bề mặt vật (lon, biển, màn hình) giữ là texture.

## Bẫy

- `#scene canvas` ép 100 % `!important` ⇒ bọc canvas trong `div` đặt cỡ.
- Lệch nửa điểm ảnh ⇒ mờ: đặt chỗ qua `htAt`.
- `shadowBlur` không theo `setTransform` ⇒ nhân `ctx.getTransform().a`.
- Đọc điểm ảnh canvas GPU (`getImageData`, chép sang canvas `willReadFrequently`) chậm ⇒ ô lớn / vẽ lại thường (bong bóng kỹ sư, đếm ngược, chó nghĩ) để `tone: false`, tô sẵn màu bằng `htToneCol`.
- three r160 `packing.glsl`: byte cao nhất ở kênh a (giải mã tiêu cự trong `lnReadAf`).
- `core/mem-trim.js` thu canvas đã lên GPU về 1 × 1; sprite chữ giữ `material.visible = false` nên nguồn của cách chép còn nguyên.
- Nút "Nhãn" chỉ ẩn `labelGroup`; bong bóng + đếm ngược kỹ sư vẫn hiện.
- Trang debug cần symlink `css` cạnh trang (mkdbg không nhúng css).
