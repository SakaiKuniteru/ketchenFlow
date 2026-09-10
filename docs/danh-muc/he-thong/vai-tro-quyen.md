# Liên kết Vai trò - Quyền

## 1. Ý nghĩa

Xác định tập quyền của từng vai trò.

## 2. Bảng dữ liệu

- Bảng chính: `dm_vai_tro_quyen`

## 3. Logic nghiệp vụ

Khóa chính ghép vai trò-quyền; không trùng cặp; khi tính quyền chỉ dùng vai trò, quyền và liên kết đều active.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

