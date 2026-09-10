# Danh mục Nhân viên

## 1. Ý nghĩa

Lưu hồ sơ nhân sự dùng xuyên suốt hệ thống.

## 2. Bảng dữ liệu

- Bảng chính: `dm_nhan_vien`

## 3. Logic nghiệp vụ

Mã nhân viên duy nhất; liên kết cơ sở/phòng ban/chức vụ/địa chỉ phải hợp lệ; email, mã thẻ, QR, barcode có ràng buộc duy nhất; một nhân viên có thể có nhiều vai trò.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

