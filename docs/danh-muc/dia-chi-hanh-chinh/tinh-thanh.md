# Danh mục Tỉnh/Thành

## 1. Ý nghĩa

Cấp địa chỉ tỉnh/thành trực thuộc quốc gia.

## 2. Bảng dữ liệu

- Bảng chính: `dm_tinh_thanh`

## 3. Logic nghiệp vụ

Quốc gia cha phải tồn tại/active; mã tỉnh thành duy nhất; API map kèm quốc gia; tỉnh/thành bị khóa không dùng để tạo xã/phường hoặc gán địa chỉ mới.

## 4. Trạng thái

- `active = true`: đang có hiệu lực.
- `active = false`: đã khóa, không dùng cho dữ liệu nghiệp vụ mới.

## Quy tắc chung

- Dữ liệu dùng `active` để quản lý hiệu lực; ưu tiên khóa thay vì xóa cứng khi đã được tham chiếu.
- `created_at` lưu thời điểm tạo, `updated_at` lưu lần cập nhật gần nhất.
- Database dùng `snake_case`; JavaScript/API map sang `camelCase`.
- Luồng xử lý: `Route → Validation → Controller → Service → Repository → Database`.
- Khi ghi dữ liệu có liên kết, service phải kiểm tra bản ghi tham chiếu tồn tại và phù hợp trạng thái.

