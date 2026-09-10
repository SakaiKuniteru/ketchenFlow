# Liên kết Chính sách - Tài khoản

## 1. Ý nghĩa

Gán chính sách trực tiếp cho tài khoản cụ thể.

## 2. Bảng dữ liệu

- Bảng chính: `ct_chinh_sach_tai_khoan`

## 3. Logic nghiệp vụ

Không nên tạo trùng cặp; dùng cho trường hợp cá nhân/ngoại lệ; chỉ áp dụng khi tài khoản, chính sách, liên kết đều active.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

