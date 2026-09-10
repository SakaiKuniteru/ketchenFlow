# Database KitchenFlow

Thư mục này lưu cấu trúc cơ sở dữ liệu của KitchenFlow.

``` text
database/
├── README.md
└── schema.sql
```

## Nội dung schema

File `schema.sql` là cấu trúc cơ sở dữ liệu chính thức của dự án. Mọi
thay đổi về cấu trúc database đều phải được cập nhật vào file này.

Schema hiện bao gồm:

-   44 bảng
-   37 sequence được tạo tự động từ `SERIAL` và `BIGSERIAL`
-   Primary Key và Composite Primary Key
-   Foreign Key
-   Unique Constraint
-   Check Constraint
-   Index
-   Function tự động cập nhật `updated_at`
-   Trigger tự động cập nhật `updated_at`

> Không sao chép lại toàn bộ câu lệnh SQL vào README. Khi cấu trúc thay
> đổi, chỉ cần cập nhật `schema.sql` để tránh hai file bị lệch nhau.

------------------------------------------------------------------------

## Yêu cầu

-   PostgreSQL 18
-   Tài khoản PostgreSQL có quyền tạo database và tạo bảng
-   Database đích phải là database rỗng
-   Nếu database đã tồn tại bảng, hãy xóa và tạo lại database trước khi
    chạy `schema.sql`

Kiểm tra phiên bản PostgreSQL:

``` bash
psql --version
```

Nếu sử dụng PostgreSQL từ Postgres.app:

``` bash
/Applications/Postgres.app/Contents/Versions/latest/bin/psql --version
```

------------------------------------------------------------------------

## Tạo database mới

> `quochuy` chỉ là ví dụ, hãy thay bằng user PostgreSQL của bạn nếu
> khác.

``` bash
createdb -U quochuy kitchenflow
```

Hoặc:

``` bash
psql -U quochuy -c "CREATE DATABASE kitchenflow;"
```

------------------------------------------------------------------------

## Chạy schema

``` bash
psql \
  -U quochuy \
  -d kitchenflow \
  -v ON_ERROR_STOP=1 \
  -f database/schema.sql
```

Tham số `-v ON_ERROR_STOP=1` sẽ dừng ngay khi gặp lỗi thay vì tiếp tục
thực thi các câu lệnh phía sau.

> **Lưu ý:** `schema.sql` chỉ dùng để khởi tạo database mới. Không sử
> dụng file này để cập nhật database đang có dữ liệu.

------------------------------------------------------------------------

## Kiểm tra sau khi tạo

Kết nối vào database:

``` bash
psql -U quochuy -d kitchenflow
```

Hiển thị danh sách bảng:

``` sql
\dt
```

Kết quả mong đợi:

``` text
44 rows
```

Hiển thị danh sách sequence:

``` sql
\ds
```

Kết quả mong đợi:

``` text
37 rows
```

Hiển thị toàn bộ relation:

``` sql
\d
```

Kết quả mong đợi:

``` text
81 rows
```

Trong đó:

``` text
44 bảng
37 sequence
------------
81 relation
```

------------------------------------------------------------------------

## Kiểm tra tổng số bảng

``` sql
SELECT COUNT(*) AS tong_so_bang
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

Kết quả mong đợi:

``` text
44
```

------------------------------------------------------------------------

## Kiểm tra tổng số cột

``` sql
SELECT COUNT(*) AS tong_so_cot
FROM information_schema.columns
WHERE table_schema = 'public';
```

Kết quả mong đợi:

``` text
395
```

------------------------------------------------------------------------

## Kiểm tra tất cả bảng đều có khóa chính

``` sql
SELECT t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
  ON tc.table_schema = t.table_schema
 AND tc.table_name = t.table_name
 AND tc.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND tc.constraint_name IS NULL
ORDER BY t.table_name;
```

Kết quả mong đợi:

``` text
0 rows
```

------------------------------------------------------------------------

## Chạy dữ liệu mẫu (Seed)

Sau khi tạo schema thành công:

``` bash
node src/seeds/index.js
```

------------------------------------------------------------------------

## Cập nhật database

Không sử dụng `schema.sql` để cập nhật database đang có dữ liệu.

Mỗi thay đổi về cấu trúc phải tạo một file migration riêng.

``` text
database/
└── migrations/
    └── YYYYMMDD_HHMM_mo_ta.sql
```

Ví dụ:

``` text
database/migrations/20260801_1400_add_index_dm_chinh_sach.sql
```

Chạy migration:

``` bash
psql \
  -U quochuy \
  -d kitchenflow \
  -v ON_ERROR_STOP=1 \
  -f database/migrations/20260801_1400_add_index_dm_chinh_sach.sql
```

------------------------------------------------------------------------

## Xóa database

``` bash
dropdb -U quochuy kitchenflow
```