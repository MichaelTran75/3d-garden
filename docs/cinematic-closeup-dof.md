# Góc nhìn điện ảnh khi phóng cận — mờ theo độ sâu

Mã `src/app/core/lens.js`; hiện trạng + bẫy: architecture/lens.md (`LAYER_SHARP`, `lensBlurPx`, `isXRRenderTarget = true`, `setRenderTarget`).

## Đang chạy

- Camera trực giao ⇒ CoC theo khoảng cách (m); độ sâu tuyến tính `near + d·(far − near)`
- A bám vật: nét ± `LENS_RG`; đổi vật ⇒ nét trượt theo `target`
- B sa bàn: mặt nét đứng ⇒ cột, cây mờ đều gốc → ngọn
- Lấy nét tự động: trung vị 5 × 5 điểm giữa khung, bỏ trời, trượt `LENS_AF_T`
- Đuôi xa tới `LENS_FAR` × (thấu kính mỏng); kẹp ở tối đa ⇒ vật vừa qua dải nét và đồi xa mờ như nhau
- ½ phân giải, gom đĩa 48 mẫu scatter-as-gather: mẫu sau tâm kẹp CoC ≤ tâm; tiền cảnh loang lên nền nét (độ phủ trong alpha); bán kính gom = CoC max ô + ô quanh
- `lensSoft`: cột khí tượng k = 0,5, không thêm lượt vẽ

## Số đo chuẩn

- Bật / tắt: 2 ảnh cùng khung (`lensRender(0)`, không cập nhật thế giới giữa) ⇒ nền khớp từng điểm ảnh
- Thấy mờ = σ ≥ 0,3 px; σ tăng liền từ dải nét ra mép, không bậc
- Đo σ từng điểm ảnh, không cả hàng (vật ở tiêu cự kéo σ hàng về 0); đầu dò docs/dof-probe/ (src/tools/debug/ev3.cjs)

## Còn mở

- C: vignette nhẹ + (tuỳ) viền đen 2,39:1 trượt vào ~0,5 s khi bám vật, bật / tắt riêng
- Bố cục bám: vật lệch 1/3 khung (`camFollow` tuỳ chọn `off`), hạ góc ở ×30
- Bokeh: gom trên giá trị sRGB (điểm sáng hơi tối) ⇒ giải mã sRGB trước khi gom
- Điện thoại: gom 32 mẫu hoặc tắt
- Cỏ trong khung tạm lệch màu ~5 % so với vẽ thẳng (nền khớp), chưa rõ vật liệu
