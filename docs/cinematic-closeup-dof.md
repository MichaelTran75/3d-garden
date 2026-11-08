# Góc nhìn điện ảnh khi phóng cận — mờ theo độ sâu

> Ghi cho AI sửa mã: thiết kế đang chạy + bẫy + việc còn mở. Mã: `src/app/core/lens.js`, hiện trạng ở lens.md. Chỉ mục: [ARCHITECTURE](../src/ARCHITECTURE.md).

## Đang chạy

- Camera trực giao: không có ống kính thật ⇒ vòng nhoè (CoC) tính theo khoảng cách (m); độ sâu tuyến tính `near + d·(far − near)`.
- A — bám vật ×16 → ×30: tiêu cự ở vật, vùng nét ± `LENS_RG`; đổi vật bám ⇒ nét trượt theo `target`.
- B — sa bàn từ ×3: mờ theo độ sâu thật, không theo vị trí điểm ảnh; dải nét hẹp dần khi zoom gần.
- Mặt phẳng nét ĐỨNG: CoC theo khoảng cách ngang tới camera ⇒ cột, cây mờ đều từ gốc tới ngọn; mặt đất vẫn là dải sa bàn.
- Lấy nét tự động giữa khung (trung vị 5 × 5 điểm, bỏ trời, trượt `LENS_AF_T`); bám vật thì nét ở vật.
- CoC tăng liền: chân bậc 2 (mờ bắt đầu dưới ngưỡng thấy) → tuyến tính → đuôi xa tới `LENS_FAR` × như thấu kính mỏng.
- Nửa phân giải, gom đĩa 48 mẫu scatter-as-gather: mẫu sau tâm kẹp CoC ≤ tâm (hậu cảnh không loang lên vật nét); tiền cảnh mờ loang lên nền nét (độ phủ trong alpha).
- Ba mức nét → mờ nhỏ → mờ lớn, bán kính gom theo CoC lớn nhất ô + ô quanh ⇒ chuyển nét → mờ không biên.
- Nhãn, viền rê chuột, bong bóng KHÔNG mờ (lớp `LAYER_SHARP` vẽ sau lớp mờ); chữ HTML khác mờ bằng CSS theo `lensBlurPx`.
- `lensSoft`: giảm mờ trong hộp của 1 vật (cột khí tượng, k = 0,5), không thêm lượt vẽ.

## Bẫy

- Khung tạm tuyến tính ⇒ bạc màu ⇒ `isXRRenderTarget = true`; colorSpace sRGB đặt sau `setRenderTarget` đầu (đặt trước ⇒ blit lỗi 1282, khung đen); nền xoá bằng màu đã mã hoá sRGB.
- Trộn thẳng ảnh nét với ảnh gom ⇒ ảnh lồng bản mờ của chính nó, thấy biên ⇒ cần mức mờ nhỏ ở giữa.
- Rải mẫu trên bán kính lớn nhất của cả khung ⇒ CoC nhỏ chỉ trúng vài mẫu, chỗ chuyển loang lổ.
- Dải mờ theo hàng màn hình (hay kẹp theo dải màn hình) ⇒ vật đứng trước vẫn mờ; độ sâu theo trục nhìn ⇒ tán cây cao gần camera hơn gốc, sau cột lại nét.
- Tiêu cự ở điểm nhìn `target` (thấp hơn mặt đất) ⇒ chỗ nét lệch ra sau vật giữa khung.
- CoC dừng ở mức tối đa ⇒ vật vừa qua dải nét và đồi xa mờ như nhau.
- Tách vật sang lớp / lượt riêng để chỉnh mờ ⇒ mất gộp vẽ ⇒ dùng hộp `lensSoft`.
- Đo độ mờ theo từng điểm ảnh, không theo cả hàng (vật đứng ở tiêu cự kéo σ cả hàng về 0). Đầu dò: docs/dof-probe/ (chạy bằng src/tools/debug/ev3.cjs).

## Số đo chuẩn

- Bật / tắt: 2 ảnh cùng khung (`lensRender(0)`, không cập nhật thế giới giữa hai lần) — nền khớp từng điểm ảnh.
- "Thấy mờ" = σ ≥ 0,3 px; σ tăng liền từ dải nét ra mép, không có bậc.

## Còn mở

- C: vignette nhẹ + (tuỳ) viền đen 2,39:1 trượt vào ~0,5 s khi bám vật, bật / tắt riêng.
- Bố cục khi bám: vật lệch 1/3 khung (`camFollow` tuỳ chọn `off`), hạ góc ở ×30.
- Bokeh: đang gom trên giá trị sRGB (điểm sáng hơi tối) ⇒ giải mã sRGB trước khi gom.
- Điện thoại: gom 32 mẫu hoặc tắt.
- Cỏ trong khung tạm lệch màu ~5 % so với vẽ thẳng (nền khớp) — chưa rõ vật liệu nào.
