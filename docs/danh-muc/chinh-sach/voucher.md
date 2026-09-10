# Danh mục Voucher

## 1. Ý nghĩa

Quản lý voucher/giá trị miễn giảm dùng trong chính sách hỗ trợ.

## 2. Bảng dữ liệu

- Bảng chính: `dm_voucher`

## 3. Logic nghiệp vụ

Mã voucher duy nhất; loại miễn giảm chỉ nhận 10 hoặc 20; theo dõi số lượng và đã sử dụng; xét active và thời gian hiệu lực; voucher đang được chính sách dùng không xóa cứng.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

