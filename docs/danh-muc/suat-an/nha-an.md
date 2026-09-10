# Danh mục Nhà ăn

## 1. Ý nghĩa

Quản lý nhà ăn/căng tin trực thuộc cơ sở.

## 2. Bảng dữ liệu

- Bảng chính: `dm_nha_an`

## 3. Logic nghiệp vụ

Mã nhà ăn duy nhất; cơ sở phải tồn tại; danh sách nhà ăn thường lọc theo cơ sở; nhà ăn bị khóa không dùng cho kho, thực đơn, bình chọn mới.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

