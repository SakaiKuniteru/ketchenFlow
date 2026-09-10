# Liên kết Nhân viên - Vai trò

## 1. Ý nghĩa

Liên kết nhiều-nhiều giữa nhân viên và vai trò.

## 2. Bảng dữ liệu

- Bảng chính: `dm_nhan_vien_vai_tro`

## 3. Logic nghiệp vụ

Không tạo trùng cặp nhân viên-vai trò; khi đăng nhập chỉ lấy liên kết và vai trò active; quyền được suy ra tiếp qua vai trò-quyền.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

