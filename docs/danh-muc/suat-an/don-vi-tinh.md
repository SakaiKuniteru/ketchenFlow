# Danh mục Đơn vị tính

## 1. Ý nghĩa

Quản lý đơn vị đo dùng cho thực phẩm và kho.

## 2. Bảng dữ liệu

- Bảng chính: `dm_don_vi_tinh`

## 3. Logic nghiệp vụ

Mã duy nhất; loại đơn vị: 10 Khối lượng, 20 Thể tích, 30 Đếm; import hỗ trợ ID/mã và khóa /k; đơn vị bị khóa không dùng cho thực phẩm mới.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

