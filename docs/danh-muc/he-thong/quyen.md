# Danh mục Quyền

## 1. Ý nghĩa

Đơn vị quyền nhỏ nhất trong cơ chế phân quyền.

## 2. Bảng dữ liệu

- Bảng chính: `dm_quyen`

## 3. Logic nghiệp vụ

Mã quyền duy nhất; quyền gắn vai trò qua dm_vai_tro_quyen; khi đăng nhập chỉ lấy quyền active từ vai trò active; không cấp trực tiếp cho người dùng.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

