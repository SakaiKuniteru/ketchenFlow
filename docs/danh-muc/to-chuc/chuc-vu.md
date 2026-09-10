# Danh mục Chức vụ

## 1. Ý nghĩa

Khai báo chức vụ của nhân viên.

## 2. Bảng dữ liệu

- Bảng chính: `dm_chuc_vu`

## 3. Logic nghiệp vụ

ID phải hợp lệ khi xem/cập nhật; mã không trùng; import có thể tìm theo ID hoặc mã; chức vụ bị khóa không dùng cho gán mới.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

