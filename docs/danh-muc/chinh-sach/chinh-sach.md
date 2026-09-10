# Danh mục Chính sách

## 1. Ý nghĩa

Quản lý chính sách hỗ trợ/miễn giảm áp dụng cho người dùng hoặc nhóm đối tượng.

## 2. Bảng dữ liệu

- Bảng chính: `dm_chinh_sach`

## 3. Logic nghiệp vụ

Mã chính sách duy nhất; voucher phải tồn tại; mức ưu tiên không âm; phạm vi áp dụng qua vai trò/chức vụ/tài khoản; ưu tiên khóa thay vì xóa khi đã phát sinh liên kết.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

