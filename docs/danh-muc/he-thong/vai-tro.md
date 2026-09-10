# Danh mục Vai trò

## 1. Ý nghĩa

Gom nhiều quyền để gán cho nhân viên/tài khoản.

## 2. Bảng dữ liệu

- Bảng chính: `dm_vai_tro`

## 3. Logic nghiệp vụ

Mã vai trò duy nhất; một vai trò có nhiều quyền; khi đăng nhập chỉ lấy vai trò active; vai trò bị khóa làm tập quyền qua vai trò đó không còn hiệu lực.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

