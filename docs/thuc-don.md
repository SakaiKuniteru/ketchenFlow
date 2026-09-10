# Nghiệp vụ Thực đơn

## 1. Ý nghĩa

Module **Thực đơn** dùng để quản lý kế hoạch món ăn theo từng khoảng thời gian, cơ sở, nhà ăn và ca ăn.

Một thực đơn gồm 3 cấp nội dung:

```text
Thực đơn
└── Ngày áp dụng
    └── Nhóm món
        └── Món ăn
```

Ví dụ:

```text
Thực đơn tuần 32
├── 10/08/2026
│   ├── Món chính
│   │   ├── Thịt gà luộc
│   │   └── Cá kho
│   ├── Món rau
│   │   └── Rau muống luộc
│   └── Canh
│       └── Canh rau
│
└── 11/08/2026
    └── ...
```

Thực đơn là dữ liệu nghiệp vụ, được xây dựng từ các danh mục:

- Cơ sở
- Nhà ăn
- Ca ăn
- Nhóm món ăn
- Món ăn

---

## 2. Thông tin chung

Một thực đơn có các thông tin chính:

- `maThucDon`: Mã thực đơn.
- `tenThucDon`: Tên thực đơn.
- `loaiThucDon`: Loại thực đơn.
- `tuNgay`: Ngày bắt đầu áp dụng.
- `denNgay`: Ngày kết thúc áp dụng.
- `coSoId`: Cơ sở áp dụng.
- `nhaAnId`: Nhà ăn áp dụng.
- `caAnId`: Ca ăn áp dụng.
- `moTa`: Mô tả.
- `trangThai`: Trạng thái xử lý.
- `dsNgay`: Danh sách ngày của thực đơn.

---

## 3. Loại thực đơn

Hệ thống sử dụng enum theo quy tắc `10 - 20 - 30 - ...`.

```text
10 - Theo ngày
20 - Theo tuần
30 - Theo tháng
40 - Từ ngày đến ngày
```

Loại thực đơn xác định cách hiểu khoảng thời gian áp dụng nhưng dữ liệu chi tiết vẫn được lưu theo từng ngày trong `dsNgay`.

---

## 4. Cấu trúc ngày

Mỗi phần tử trong `dsNgay` có dạng logic:

```text
Ngày
├── id
├── ngay
├── ghiChu
└── dsNhomMonAn
```

Ví dụ payload:

```json
{
  "id": 1,
  "ngay": "2026-08-10",
  "ghiChu": "Thực đơn thứ hai",
  "dsNhomMonAn": []
}
```

### Logic ngày

1. Ngày phải nằm trong khoảng `tuNgay` đến `denNgay` của thực đơn.
2. Không nên tồn tại hai ngày giống nhau trong cùng một thực đơn.
3. Khi thêm ngày mới, ngày được thêm vào `dsNgay`.
4. Xóa ngày đồng nghĩa xóa toàn bộ nhóm món và món ăn thuộc ngày đó khỏi payload hiện tại.
5. Trong giao diện tạo mới, ngày chỉ có thao tác thêm và xóa; không có luồng sửa riêng.
6. Ngày có thể đóng/mở để thu gọn nội dung hiển thị.

---

## 5. Cấu trúc nhóm món

Mỗi ngày có danh sách nhóm món:

```text
Ngày
└── Nhóm món
    ├── id
    ├── nhomMonAnId
    └── dsMonAn
```

Ví dụ:

```json
{
  "id": 1,
  "nhomMonAnId": 2,
  "dsMonAn": []
}
```

### Logic nhóm món

1. Nhóm món phải tồn tại trong danh mục `dm_nhom_mon_an`.
2. Nhóm món được chọn phải đang hoạt động.
3. Không được thêm trùng cùng một nhóm món trong cùng một ngày.
4. Mỗi nhóm món chỉ chứa các món thuộc nhóm đó.
5. Xóa nhóm món sẽ xóa toàn bộ món ăn đang nằm trong nhóm khỏi payload hiện tại.
6. Nhóm món có thể đóng/mở để thu gọn danh sách món.
7. Trong giao diện tạo mới chỉ có thêm/xóa, không có chế độ chỉnh sửa riêng cho nhóm.

---

## 6. Cấu trúc món ăn

Mỗi nhóm món có danh sách món:

```text
Nhóm món
└── Món ăn
    ├── id
    ├── monAnId
    ├── dinhLuong
    └── ghiChu
```

Ví dụ:

```json
{
  "id": 1,
  "monAnId": 15,
  "dinhLuong": 120,
  "ghiChu": "120g / suất"
}
```

### Logic món ăn

1. Món ăn phải tồn tại trong danh mục `dm_mon_an`.
2. Món ăn phải đang hoạt động.
3. Món ăn phải thuộc đúng nhóm món đang được chọn.
4. Không nên thêm trùng cùng một món trong cùng một nhóm của cùng ngày.
5. `dinhLuong` là định lượng áp dụng cho món trong thực đơn, không thay đổi dữ liệu gốc của danh mục món ăn.
6. `ghiChu` dùng để lưu thông tin bổ sung riêng cho món trong thực đơn.
7. Xóa món chỉ xóa món khỏi thực đơn, không xóa danh mục món ăn.
8. Món có thể đóng/mở ở giao diện để xem thông tin chi tiết.

---

## 7. Quan hệ Cơ sở - Nhà ăn - Ca ăn

Luồng chọn phạm vi áp dụng:

```text
Cơ sở
   ↓
Nhà ăn
   ↓
Ca ăn
```

### Logic

1. Cơ sở phải tồn tại và đang hoạt động.
2. Nhà ăn phải tồn tại và đang hoạt động.
3. Nhà ăn phải thuộc cơ sở được chọn.
4. Ca ăn phải tồn tại và đang hoạt động.
5. Khi thay đổi cơ sở, danh sách nhà ăn phải được tải lại theo cơ sở.
6. Không giữ `nhaAnId` cũ nếu nhà ăn đó không thuộc cơ sở mới.

---

## 8. Payload thực đơn

Payload logic gửi về backend:

```json
{
  "maThucDon": "TD0001",
  "tenThucDon": "Thực đơn tuần 32",
  "loaiThucDon": 20,
  "tuNgay": "2026-08-10",
  "denNgay": "2026-08-16",
  "coSoId": 1,
  "nhaAnId": 1,
  "caAnId": 1,
  "moTa": "Thực đơn tuần 32",
  "trangThai": 10,
  "dsNgay": [
    {
      "id": null,
      "ngay": "2026-08-10",
      "ghiChu": "",
      "dsNhomMonAn": [
        {
          "id": null,
          "nhomMonAnId": 1,
          "dsMonAn": [
            {
              "id": null,
              "monAnId": 1,
              "dinhLuong": 120,
              "ghiChu": ""
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 9. Trạng thái thực đơn

Trạng thái được quản lý theo enum số, theo quy tắc `10 - 20 - 30 - ...`.

Trong luồng hiện tại, trạng thái được sử dụng để quyết định các hành động có thể thực hiện trên thực đơn.

Các hành động nghiệp vụ đã có:

- Tạo mới.
- Cập nhật.
- Duyệt.
- Hủy duyệt.
- Hủy.
- Hoàn hủy.
- Xóa trong trường hợp được phép.

Không thay đổi trạng thái trực tiếp từ frontend bằng cách sửa giá trị tùy ý; trạng thái phải đi qua API nghiệp vụ tương ứng.

---

## 10. Luồng tạo mới

```text
Nhập thông tin chung
        ↓
Chọn cơ sở
        ↓
Chọn nhà ăn
        ↓
Chọn ca ăn
        ↓
Thêm ngày
        ↓
Thêm nhóm món
        ↓
Thêm món ăn
        ↓
Xem lại
        ↓
Lưu
```

### Quy tắc

1. Phải có thông tin chung hợp lệ trước khi lưu.
2. Phải kiểm tra phạm vi ngày.
3. Ngày, nhóm món và món được tạo theo cấu trúc lồng nhau.
4. Dữ liệu ở giao diện chỉ là state tạm cho đến khi người dùng bấm lưu.
5. Khi xóa ngày/nhóm/món trước khi lưu, chỉ loại khỏi state hiện tại.
6. Trước khi gửi API phải build lại payload sạch, loại bỏ các field chỉ dùng cho giao diện như:
   - `isNew`
   - `isEditing`
   - trạng thái đóng/mở
   - index đang chọn

---

## 11. Luồng xem chi tiết

Trang chi tiết tải dữ liệu bằng API theo `id`.

Ở chế độ xem:

- Hiển thị thông tin chung.
- Hiển thị ngày.
- Hiển thị nhóm món.
- Hiển thị món ăn.
- Hiển thị trạng thái.
- Hiển thị các nút nghiệp vụ phù hợp với trạng thái.

Các hành động chính:

```text
Chỉnh sửa
Duyệt
Hủy duyệt
Hủy
Hoàn hủy
```

Nút nào được hiển thị phụ thuộc trạng thái thực đơn hiện tại.

---

## 12. Luồng chỉnh sửa

Khi bấm **Chỉnh sửa**:

```text
View mode
   ↓
Edit mode
```

Ở edit mode:

- Dữ liệu hiện tại phải được giữ nguyên.
- Chỉ cho người dùng chỉnh các phần được phép.
- Header chuyển sang các hành động:
  - Hủy
  - Lưu

Không được reset dữ liệu khi chuyển từ xem sang chỉnh sửa.

Nếu người dùng bấm hủy chỉnh sửa:

- Khôi phục snapshot dữ liệu trước khi sửa.
- Quay về view mode.

---

## 13. Duyệt thực đơn

Duyệt là hành động nghiệp vụ riêng.

Luồng:

```text
Thực đơn hợp lệ
      ↓
Xác nhận duyệt
      ↓
API duyệt
      ↓
Cập nhật trạng thái
      ↓
Reload chi tiết
```

Không nên duyệt nếu dữ liệu thực đơn chưa đầy đủ hoặc không còn hợp lệ.

---

## 14. Hủy và hoàn hủy

### Hủy

Khi hủy thực đơn:

- Chuyển thực đơn sang trạng thái hủy.
- Không xóa dữ liệu gốc.
- Dữ liệu vẫn được giữ để tra cứu/lịch sử.

### Hoàn hủy

Nếu trạng thái cho phép, hệ thống có thể đưa thực đơn đã hủy trở lại trạng thái trước/được phép sử dụng theo rule của backend.

---

## 15. API hiện tại

Base API:

```text
/api/mcs/v1/thuc-don
```

Các API chính:

```text
GET    /tong-hop
GET    /:id

POST   /them-moi

PATCH  /cap-nhat/:id
PATCH  /duyet/:id
PATCH  /huy-duyet/:id
PATCH  /huy/:id
PATCH  /hoan-huy/:id
```

Ngoài ra có:

```text
GET    /xuat-du-lieu
POST   /import-du-lieu
```

Các API đều yêu cầu xác thực.

---

## 16. Import / Export

Module thực đơn có hỗ trợ:

- Xuất dữ liệu Excel.
- Import dữ liệu Excel.

Import sử dụng middleware upload file Excel trước khi gọi xử lý nghiệp vụ.

Dữ liệu import vẫn phải tuân thủ các rule giống thao tác qua form:

- Mã danh mục phải tồn tại.
- Cơ sở / nhà ăn / ca ăn phải hợp lệ.
- Nhóm món phải tồn tại.
- Món phải thuộc đúng nhóm.
- Không tạo quan hệ trùng không hợp lệ.

---

## 17. Logic giao diện tạo mới

Giao diện tạo mới sử dụng bố cục 3 phần:

```text
Ngày
│
├── Nhóm món
│   │
│   └── Món ăn
```

Thực tế hiển thị:

```text
Cột ngày | Cột nhóm món | Panel món ăn
```

### Chọn ngày

Khi người dùng chọn ngày:

- Cập nhật `selectedDayIndex`.
- Render lại nhóm món của ngày.
- Chọn nhóm đầu tiên nếu phù hợp.
- Render lại panel món.

### Chọn nhóm

Khi người dùng chọn nhóm:

- Cập nhật `selectedGroupIndex`.
- Render lại danh sách món thuộc nhóm.

### Quay lại

Nút quay lại trong panel món phải đưa giao diện về cấp điều hướng trước theo thiết kế responsive/mobile, không được làm mất state.

---

## 18. Logic thêm mới trên giao diện

### Thêm ngày

Tạo state mới:

```javascript
{
    id: null,
    ngay: "",
    ghiChu: "",
    dsNhomMonAn: [],
    isNew: true
}
```

Ngày mới được append vào danh sách và trở thành ngày đang chọn.

### Thêm nhóm

Tạo:

```javascript
{
    id: null,
    nhomMonAnId: null,
    nhomMonAn: null,
    dsMonAn: [],
    isNew: true
}
```

Nhóm mới thuộc ngày đang chọn.

### Thêm món

Tạo:

```javascript
{
    id: null,
    monAnId: null,
    monAn: null,
    dinhLuong: null,
    ghiChu: "",
    isNew: true
}
```

Món mới thuộc nhóm đang chọn.

---

## 19. Logic xóa trên giao diện

### Xóa ngày

Phải xác nhận trước khi xóa.

Khi xóa:

- Xóa toàn bộ nhóm/món con khỏi state.
- Cập nhật lại `selectedDayIndex`.
- Render lại giao diện.

### Xóa nhóm

- Xóa toàn bộ món trong nhóm khỏi state.
- Cập nhật `selectedGroupIndex`.
- Render lại panel món.

### Xóa món

- Chỉ xóa món khỏi nhóm hiện tại.
- Không ảnh hưởng danh mục `dm_mon_an`.

---

## 20. Validation quan trọng

Trước khi lưu cần kiểm tra tối thiểu:

1. Có mã thực đơn.
2. Có tên thực đơn.
3. Có loại thực đơn.
4. Có ngày bắt đầu.
5. Có ngày kết thúc.
6. `tuNgay <= denNgay`.
7. Có cơ sở.
8. Có nhà ăn.
9. Có ca ăn.
10. Các ngày nằm trong phạm vi thực đơn.
11. Không trùng ngày.
12. Không trùng nhóm trong cùng ngày.
13. Món thuộc đúng nhóm.
14. Không trùng món trong cùng nhóm.
15. Các ID danh mục phải tồn tại và đang hoạt động.

---

## 21. Quy tắc dữ liệu

- Không lưu object lookup đầy đủ vào database; chỉ lưu ID cần thiết.
- Object như `coSo`, `nhaAn`, `caAn`, `nhomMonAn`, `monAn` là dữ liệu map phục vụ hiển thị.
- Không gửi các field UI-only xuống backend.
- Backend phải là nơi kiểm tra cuối cùng cho mọi rule nghiệp vụ.
- Frontend validation chỉ giúp trải nghiệm người dùng, không thay thế validation/service backend.

---

## 22. Quan hệ với các danh mục

Thực đơn phụ thuộc trực tiếp vào:

- `dm_co_so`
- `dm_nha_an`
- `dm_ca_an`
- `dm_nhom_mon_an`
- `dm_mon_an`

Quan hệ logic:

```text
Cơ sở
   ↓
Nhà ăn
   ↓
Thực đơn
   ↓
Ngày
   ↓
Nhóm món
   ↓
Món ăn
```

`dm_mon_an` lại phụ thuộc:

```text
dm_nhom_mon_an
        ↓
    dm_mon_an
```

Do đó khi build thực đơn phải đảm bảo món được chọn thuộc đúng nhóm.

---

## 23. Quy tắc chung

- Dữ liệu danh mục tham chiếu phải tồn tại.
- Bản ghi danh mục bị khóa không dùng cho nghiệp vụ mới.
- Không xóa danh mục gốc khi xóa khỏi thực đơn.
- Logic nghiệp vụ chính đặt tại Service.
- Repository chỉ chịu trách nhiệm truy vấn/lưu database.
- Controller chỉ nhận request, gọi service và trả response.
- Validation kiểm tra format đầu vào trước khi vào Service.
- API yêu cầu `authenticate`.
