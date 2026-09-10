# Danh mục Thực phẩm

## 1. Ý nghĩa

Quản lý nguyên liệu/thực phẩm dùng trong kho, nhập xuất và tồn.

## 2. Bảng dữ liệu

- Bảng chính: `dm_thuc_pham`

## 3. Logic nghiệp vụ

Mã thực phẩm duy nhất; có đơn vị sơ cấp và sử dụng; nếu hai đơn vị giống nhau thì hệ số quy đổi phải bằng 1; tỷ lệ hao hụt mặc định 0; thực phẩm bị khóa không dùng cho phiếu mới.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

