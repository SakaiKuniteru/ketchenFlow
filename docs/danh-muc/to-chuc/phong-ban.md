# Danh mục Phòng ban

## 1. Ý nghĩa

Khai báo phòng ban trực thuộc cơ sở.

## 2. Bảng dữ liệu

- Bảng chính: `dm_phong_ban`

## 3. Logic nghiệp vụ

Cơ sở bắt buộc; mã phòng ban không trùng; logic repository/service có kiểm tra trùng mã/tên; phòng ban bị khóa không gán mới cho nhân viên.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

