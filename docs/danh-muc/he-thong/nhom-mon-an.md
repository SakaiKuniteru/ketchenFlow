# Danh mục Nhóm món ăn

## 1. Ý nghĩa

Phân loại món ăn theo nhóm như món chính, rau, canh, tráng miệng.

## 2. Bảng dữ liệu

- Bảng chính: `dm_nhom_mon_an`

## 3. Logic nghiệp vụ

Mã nhóm duy nhất; nhóm bị khóa không gán cho món mới; trong cùng một ngày thực đơn không cho thêm trùng cùng nhóm.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

