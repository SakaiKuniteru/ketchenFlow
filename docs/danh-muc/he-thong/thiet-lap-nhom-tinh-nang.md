# Liên kết Thiết lập - Nhóm tính năng

## 1. Ý nghĩa

Gom thiết lập theo module/tính năng.

## 2. Bảng dữ liệu

- Bảng chính: `dm_thiet_lap_nhom_tinh_nang`

## 3. Logic nghiệp vụ

Cặp thiết lập-nhóm là duy nhất; chỉ dùng liên kết active; không quyết định giá trị thiết lập.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

