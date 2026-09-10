# NGHIỆP VỤ THIẾT LẬP HỆ THỐNG

## 1. TEN_HE_THONG

**Mã:** `TEN_HE_THONG`

**Giá trị:** Chuỗi ký tự.

**Mô tả:**

Quy định tên hiển thị của hệ thống.

Giá trị được sử dụng tại các vị trí cần hiển thị tên hệ thống trên giao diện.

Ví dụ:

`KitchenFlow`

---

## 2. LOGO_CO_SO_MAC_DINH

**Mã:** `LOGO_CO_SO_MAC_DINH`

**Giá trị:** Mã cơ sở.

**Mô tả:**

Quy định cơ sở được sử dụng để lấy logo mặc định của hệ thống.

Giá trị của thiết lập là `ma_co_so`, không phải đường dẫn trực tiếp tới ảnh logo.

Hệ thống sử dụng mã cơ sở được cấu hình để tìm cơ sở đang hoạt động và lấy trường `logo` của cơ sở đó.

Ví dụ:

`CS01`

có nghĩa hệ thống sử dụng logo của cơ sở có mã `CS01`.

Nếu không tìm thấy cơ sở tương ứng hoặc cơ sở không hoạt động thì không có logo cơ sở mặc định.

---

## 3. SO_LAN_DANG_NHAP_SAI_TOI_DA

**Mã:** `SO_LAN_DANG_NHAP_SAI_TOI_DA`

**Giá trị:** Số nguyên dương.

**Mô tả:**

Quy định số lần người dùng được phép nhập sai mật khẩu liên tiếp trước khi tài khoản bị khóa.

Ví dụ:

`5`

có nghĩa khi người dùng đăng nhập sai mật khẩu đến lần thứ 5, hệ thống thực hiện khóa tài khoản.

Giá trị chỉ hợp lệ khi:

- Là số nguyên.
- Lớn hơn `0`.
- Thiết lập đang hoạt động (`active = TRUE`).

Nếu thiết lập không tồn tại, bị tắt hoặc giá trị không hợp lệ thì không áp dụng giới hạn đăng nhập sai từ thiết lập này.

---

## 4. THOI_GIAN_KHOA_TAI_KHOAN

**Mã:** `THOI_GIAN_KHOA_TAI_KHOAN`

**Giá trị:** `<số lượng>/<đơn vị>`

**Mô tả:**

Quy định khoảng thời gian tài khoản bị khóa khi số lần đăng nhập sai đạt giới hạn được cấu hình tại `SO_LAN_DANG_NHAP_SAI_TOI_DA`.

Các đơn vị được hỗ trợ:

- `phut`
- `gio`
- `ngay`
- `thang`
- `nam`

Ví dụ:

`30/phut`

có nghĩa tài khoản bị khóa trong 30 phút.

`2/gio`

có nghĩa tài khoản bị khóa trong 2 giờ.

`1/ngay`

có nghĩa tài khoản bị khóa trong 1 ngày.

Số lượng phải là số nguyên lớn hơn `0`.

Nếu thiết lập không tồn tại, bị tắt hoặc giá trị không đúng định dạng thì hệ thống không xác định thời gian tự động mở khóa. Khi tài khoản đạt số lần đăng nhập sai tối đa, tài khoản sẽ bị khóa và cần quản trị viên can thiệp để mở khóa.

---

## 5. THOI_GIAN_ACCESS_TOKEN

**Mã:** `THOI_GIAN_ACCESS_TOKEN`

**Giá trị:** Số phút.

**Mô tả:**

Quy định thời gian hiệu lực của một Access Token.

Ví dụ:

`20`

có nghĩa Access Token có hiệu lực trong 20 phút kể từ thời điểm được tạo.

Khi hết thời gian này, Access Token hiện tại không còn hợp lệ và không thể tiếp tục sử dụng để xác thực API.

Access Token hết hạn **không đồng nghĩa với việc người dùng bị đăng xuất**. Nếu Refresh Token vẫn còn hiệu lực, hệ thống có thể sử dụng Refresh Token để cấp Access Token mới mà không yêu cầu người dùng đăng nhập lại.

Giá trị phải là số nguyên lớn hơn `0`.

Nếu thiết lập không tồn tại, bị tắt hoặc giá trị không hợp lệ thì sử dụng thời gian Access Token mặc định của hệ thống.

---

## 6. THOI_GIAN_REFRESH_TOKEN

**Mã:** `THOI_GIAN_REFRESH_TOKEN`

**Giá trị:** Số phút.

**Mô tả:**

Quy định thời gian hiệu lực của Refresh Token.

Ví dụ:

`30`

có nghĩa Refresh Token có hiệu lực trong 30 phút kể từ thời điểm được tạo.

Refresh Token được sử dụng để cấp lại Access Token khi Access Token hết hạn mà không yêu cầu người dùng nhập lại tài khoản và mật khẩu.

Giá trị phải:

- Là số nguyên.
- Lớn hơn `0`.
- Thiết lập đang hoạt động (`active = TRUE`).

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt.
- Giá trị không phải số.
- Giá trị bằng hoặc nhỏ hơn `0`.

thì hệ thống sử dụng giá trị mặc định là:

`20 phút`

Khi Refresh Token hết hạn và không còn Refresh Token hợp lệ khác, người dùng phải đăng nhập lại.

---

## 7. THOI_GIAN_TIMEOUT

**Mã:** `THOI_GIAN_TIMEOUT`

**Giá trị:** Số phút.

**Mô tả:**

Quy định khoảng thời gian tối đa người dùng không thực hiện bất kỳ thao tác nào trên hệ thống trước khi tự động đăng xuất.

Ví dụ:

`60`

có nghĩa nếu người dùng không có thao tác trong 60 phút liên tục thì hệ thống tự động đăng xuất.

Mỗi khi người dùng có thao tác hợp lệ, thời gian chờ được tính lại từ đầu.

Thiết lập chỉ được áp dụng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị là số nguyên.
- Giá trị lớn hơn `10`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt.
- Giá trị không phải số.
- Giá trị nhỏ hơn hoặc bằng `10`.

thì chức năng tự động đăng xuất do không hoạt động sẽ không được áp dụng.

Thiết lập này độc lập với thời gian hết hạn của Access Token và Refresh Token.

---

## 8. SIDEBAR_MAC_DINH_DONG

**Mã:** `SIDEBAR_MAC_DINH_DONG`

**Giá trị:** `true` hoặc `false`.

**Mô tả:**

Quy định trạng thái mặc định của Sidebar khi người dùng tải hoặc tải lại trang.

Nếu giá trị là:

`true`

thì Sidebar mặc định được **đóng** sau mỗi lần tải hoặc tải lại trang.

Nếu giá trị là:

`false`

thì Sidebar mặc định được **mở** sau mỗi lần tải hoặc tải lại trang.

Giá trị `true` và `false` không phân biệt chữ hoa, chữ thường.

Ví dụ các giá trị sau đều được hiểu là `true`:

- `true`
- `TRUE`
- `True`
- `tRuE`

Thiết lập chỉ làm Sidebar mặc định đóng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng và chuyển về chữ thường là `true`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị là `false`.
- Giá trị không hợp lệ.

thì Sidebar mặc định được **mở**.

Thiết lập này chỉ quy định trạng thái Sidebar khi tải hoặc tải lại trang, không làm thay đổi chức năng đóng/mở Sidebar của người dùng trong quá trình sử dụng.

---

## 9. NGAY_BAT_DAU_TUAN_THUC_DON

**Mã:** `NGAY_BAT_DAU_TUAN_THUC_DON`

**Giá trị:** `0` hoặc `1`.

**Mô tả:**

Quy định ngày bắt đầu và kết thúc tuần khi người dùng tạo hoặc cập nhật thực đơn có loại **Thực đơn tuần**.

Nếu giá trị là:

`0`

thì một tuần thực đơn được tính từ **Thứ 2 đến Chủ nhật** theo thứ tự:

- Thứ 2
- Thứ 3
- Thứ 4
- Thứ 5
- Thứ 6
- Thứ 7
- Chủ nhật

Nếu giá trị là:

`1`

thì một tuần thực đơn được tính từ **Thứ 7 đến Thứ 6** theo thứ tự:

- Thứ 7
- Chủ nhật
- Thứ 2
- Thứ 3
- Thứ 4
- Thứ 5
- Thứ 6

Thiết lập chỉ áp dụng chế độ **Thứ 7 đến Thứ 6** khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng là `1`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị là `0`.
- Giá trị khác `1`.
- Giá trị không hợp lệ.

thì mặc định một tuần thực đơn được tính từ **Thứ 2 đến Chủ nhật**.

Thiết lập này chỉ dùng để quy định cách xác định tuần trên giao diện tạo và cập nhật thực đơn, không làm thay đổi dữ liệu thực đơn đã được lưu trước đó.

---

## 10. THUC_DON_BAT_BUOC_DU_SO_NGAY

**Mã:** `THUC_DON_BAT_BUOC_DU_SO_NGAY`

**Giá trị:** `true` hoặc `false`.

**Mô tả:**

Quy định việc người dùng có bắt buộc phải nhập đầy đủ số ngày của thực đơn theo khoảng thời gian đã chọn hay không.

Nếu giá trị là:

`true`

thì người dùng **bắt buộc phải nhập đầy đủ các ngày** thuộc khoảng thời gian của thực đơn trước khi có thể lưu thực đơn.

Nếu giá trị là:

`false`

thì người dùng **không bắt buộc phải nhập đầy đủ các ngày** thuộc khoảng thời gian của thực đơn.

Giá trị `true` và `false` không phân biệt chữ hoa, chữ thường.

Ví dụ các giá trị sau đều được hiểu là `true`:

- `true`
- `TRUE`
- `True`
- `tRuE`

Thiết lập chỉ bật chế độ bắt buộc nhập đầy đủ số ngày khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng và chuyển về chữ thường là `true`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị là `false`.
- Giá trị không hợp lệ.

thì mặc định **không bắt buộc** người dùng phải nhập đầy đủ số ngày.

Thiết lập này chỉ dùng để ràng buộc và kiểm tra dữ liệu trên giao diện tạo và cập nhật thực đơn, không làm thay đổi dữ liệu thực đơn đã được lưu trước đó.

---

## 11. SO_TUAN_HIEN_THI_THUC_DON

**Mã:** `SO_TUAN_HIEN_THI_THUC_DON`

**Giá trị:** Số nguyên dương.

**Mô tả:**

Quy định số tuần được hiển thị để người dùng lựa chọn khi tạo hoặc cập nhật thực đơn có loại **Thực đơn tuần**.

Danh sách tuần được hệ thống sinh tự động bắt đầu từ **tuần hiện tại** hoặc **tuần gần nhất hợp lệ** theo thiết lập:

`NGAY_BAT_DAU_TUAN_THUC_DON`

Mỗi tuần được hiển thị theo định dạng:

`dd/mm/yyyy - dd/mm/yyyy`

Ví dụ:

`SO_TUAN_HIEN_THI_THUC_DON = 5`

thì hệ thống hiển thị **5 tuần liên tiếp** để người dùng lựa chọn.

Ví dụ:

- `17/08/2026 - 23/08/2026`
- `24/08/2026 - 30/08/2026`
- `31/08/2026 - 06/09/2026`
- `07/09/2026 - 13/09/2026`
- `14/09/2026 - 20/09/2026`

Ngày bắt đầu và ngày kết thúc của từng tuần phụ thuộc vào thiết lập:

`NGAY_BAT_DAU_TUAN_THUC_DON`

Khi người dùng chọn một tuần:

- `tuNgay` tự động bằng ngày đầu tiên của tuần.
- `denNgay` tự động bằng ngày cuối cùng của tuần.
- Người dùng không nhập trực tiếp `tuNgay`.
- Người dùng không nhập trực tiếp `denNgay`.

Thiết lập chỉ được sử dụng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng là số nguyên.
- Giá trị lớn hơn `0`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị không phải số nguyên.
- Giá trị nhỏ hơn hoặc bằng `0`.
- Giá trị không hợp lệ.

thì hệ thống sử dụng giá trị mặc định:

`5`

Thiết lập này chỉ áp dụng cho loại **Thực đơn tuần**.

---

## 12. SO_NAM_HIEN_THI_THUC_DON_THANG

**Mã:** `SO_NAM_HIEN_THI_THUC_DON_THANG`

**Giá trị:** Số nguyên dương.

**Mô tả:**

Quy định số năm được phép lựa chọn khi tạo hoặc cập nhật thực đơn có loại **Thực đơn tháng**.

Danh sách năm được sinh tự động bắt đầu từ **năm hiện tại**.

Ví dụ:

`SO_NAM_HIEN_THI_THUC_DON_THANG = 5`

và năm hiện tại là:

`2026`

thì hệ thống cho phép lựa chọn các năm:

- `2026`
- `2027`
- `2028`
- `2029`
- `2030`

Đối với **năm hiện tại**, hệ thống chỉ cho phép lựa chọn từ **tháng hiện tại trở đi**.

Ví dụ thời điểm hiện tại là:

`08/2026`

thì năm `2026` chỉ hiển thị:

- `08/2026`
- `09/2026`
- `10/2026`
- `11/2026`
- `12/2026`

Đối với các **năm tương lai**, hệ thống hiển thị đầy đủ 12 tháng:

- `01`
- `02`
- `03`
- `04`
- `05`
- `06`
- `07`
- `08`
- `09`
- `10`
- `11`
- `12`

Khi người dùng chọn một tháng:

- `tuNgay` tự động bằng ngày đầu tiên của tháng.
- `denNgay` tự động bằng ngày cuối cùng của tháng.
- Người dùng không nhập trực tiếp `tuNgay`.
- Người dùng không nhập trực tiếp `denNgay`.

Hệ thống phải tự xác định chính xác số ngày của từng tháng.

Ví dụ:

- Tháng 01 → 31 ngày.
- Tháng 04 → 30 ngày.
- Tháng 02 → 28 ngày đối với năm thường.
- Tháng 02 → 29 ngày đối với năm nhuận.

Việc xác định năm nhuận phải tuân theo quy tắc lịch Gregorian:

- Năm chia hết cho `400` là năm nhuận.
- Hoặc năm chia hết cho `4` nhưng không chia hết cho `100` là năm nhuận.

Thiết lập chỉ được sử dụng khi:

- Thiết lập tồn tại.
- `active = TRUE`.
- Giá trị sau khi loại bỏ khoảng trắng là số nguyên.
- Giá trị lớn hơn `0`.

Nếu:

- Không tồn tại thiết lập.
- Thiết lập bị tắt (`active = FALSE`).
- Giá trị để trống.
- Giá trị không phải số nguyên.
- Giá trị nhỏ hơn hoặc bằng `0`.
- Giá trị không hợp lệ.

thì hệ thống sử dụng giá trị mặc định:

`5`

Thiết lập này chỉ áp dụng cho loại **Thực đơn tháng**.

---

## Quy tắc hiển thị thời gian áp dụng theo loại thực đơn

Phần **Thời gian áp dụng** thay đổi theo giá trị của `loaiThucDon`.

### Thực đơn ngày

Hiển thị một trường:

`Ngày áp dụng`

Sử dụng:

`{{> forms/date }}`

Người dùng chọn một ngày duy nhất.

Khi chọn ngày:

`tuNgay = ngày áp dụng`

`denNgay = ngày áp dụng`

Ví dụ:

`Ngày áp dụng = 18/08/2026`

thì:

`tuNgay = 18/08/2026`

`denNgay = 18/08/2026`

---

### Thực đơn tuần

Hiển thị một trường:

`Tuần áp dụng`

Sử dụng:

`{{> forms/select }}`

Danh sách tuần được sinh tự động dựa trên:

- `NGAY_BAT_DAU_TUAN_THUC_DON`
- `SO_TUAN_HIEN_THI_THUC_DON`

Option hiển thị theo định dạng:

`dd/mm/yyyy - dd/mm/yyyy`

Ví dụ:

`17/08/2026 - 23/08/2026`

Khi người dùng chọn:

`tuNgay = 17/08/2026`

`denNgay = 23/08/2026`

Người dùng không nhập trực tiếp hai giá trị này.

---

### Thực đơn tháng

Hiển thị lựa chọn:

- `Năm`
- `Tháng`

Danh sách năm được sinh dựa trên:

`SO_NAM_HIEN_THI_THUC_DON_THANG`

Năm bắt đầu luôn là năm hiện tại.

Đối với năm hiện tại:

- Chỉ hiển thị tháng hiện tại và các tháng phía sau.

Đối với năm tương lai:

- Hiển thị từ tháng `01` đến tháng `12`.

Khi người dùng chọn năm và tháng, hệ thống tự động xác định:

`tuNgay = ngày đầu tiên của tháng`

`denNgay = ngày cuối cùng của tháng`

Ví dụ:

`Tháng = 02/2028`

thì:

`tuNgay = 01/02/2028`

`denNgay = 29/02/2028`

---

### Thực đơn từ ngày đến ngày

Hiển thị hai trường:

- `Từ ngày`
- `Đến ngày`

Sử dụng:

`{{> forms/date }}`

Người dùng được phép tự chọn khoảng thời gian.

Điều kiện:

`tuNgay <= denNgay`

Nếu:

`tuNgay > denNgay`

thì không cho phép lưu thực đơn và thông báo:

`Từ ngày không được lớn hơn đến ngày.`

---

## Quy tắc chung

Khi người dùng thay đổi `loaiThucDon`, giao diện **Thời gian áp dụng** phải được cập nhật ngay theo loại thực đơn vừa chọn.

Khi chuyển từ loại thực đơn này sang loại thực đơn khác:

- Xóa giá trị lựa chọn thời gian của loại thực đơn trước.
- Tính lại `tuNgay`.
- Tính lại `denNgay`.
- Không giữ khoảng thời gian không còn phù hợp với loại thực đơn mới.

`tuNgay` và `denNgay` vẫn là hai trường dữ liệu chuẩn được gửi lên Backend.

Các trường như:

- Ngày áp dụng.
- Tuần áp dụng.
- Năm.
- Tháng.

chỉ là các trường hỗ trợ lựa chọn trên giao diện và không cần gửi lên Backend nếu Backend không yêu cầu.

Phần **Thêm ngày** trong nội dung thực đơn tiếp tục sử dụng khoảng:

`tuNgay -> denNgay`

để sinh danh sách ngày có thể lựa chọn.

---

## 13. QUY_TAC_CHON_DON_VI_QUY_DOI

**Mã:** `QUY_TAC_CHON_DON_VI_QUY_DOI`

**Giá trị:** `1`, `2`, `3` hoặc `4`.

**Mô tả:**

Quy định phạm vi đơn vị tính được phép lựa chọn tại trường **Đơn vị sử dụng** dựa trên **Đơn vị sơ cấp** của thực phẩm.

Thiết lập này được sử dụng trong danh mục **Thực phẩm** để kiểm soát việc lựa chọn cặp:

- Đơn vị sơ cấp.
- Đơn vị sử dụng.

Các loại đơn vị tính hiện tại gồm:

- `10` → Khối lượng.
- `20` → Thể tích.
- `30` → Đếm.

Khi người dùng chọn hoặc thay đổi **Đơn vị sơ cấp**, hệ thống phải tự động lọc lại danh sách **Đơn vị sử dụng** theo giá trị của thiết lập `QUY_TAC_CHON_DON_VI_QUY_DOI`.

### Giá trị `1` - Cho phép mọi loại đơn vị

Nếu:

`QUY_TAC_CHON_DON_VI_QUY_DOI = 1`

thì **Đơn vị sử dụng** được phép chọn từ tất cả các loại đơn vị tính đang hoạt động, không phụ thuộc vào loại của **Đơn vị sơ cấp**.

Ví dụ:

- Kg → Gram: hợp lệ.
- Kg → Lít: hợp lệ.
- Kg → Chai: hợp lệ.
- Chai → Kg: hợp lệ.
- Chai → Lít: hợp lệ.

Đây là quy tắc ít hạn chế nhất.

### Giá trị `2` - Chỉ cho phép cùng loại đơn vị

Nếu:

`QUY_TAC_CHON_DON_VI_QUY_DOI = 2`

thì **Đơn vị sử dụng** bắt buộc phải có cùng loại đơn vị với **Đơn vị sơ cấp**.

Ví dụ:

Đơn vị sơ cấp thuộc loại **Khối lượng**:

- Kg → Gram: hợp lệ.
- Kg → Tấn: hợp lệ.
- Kg → Lít: không hợp lệ.
- Kg → Chai: không hợp lệ.

Đơn vị sơ cấp thuộc loại **Thể tích**:

- Lít → ml: hợp lệ.
- Lít → Kg: không hợp lệ.
- Lít → Chai: không hợp lệ.

Đơn vị sơ cấp thuộc loại **Đếm**:

- Chai → Cái: hợp lệ.
- Chai → Kg: không hợp lệ.
- Chai → Lít: không hợp lệ.

Nếu người dùng lựa chọn hai đơn vị không cùng loại thì không cho phép lưu và thông báo:

`Đơn vị sơ cấp và đơn vị sử dụng phải cùng loại đơn vị.`

### Giá trị `3` - Cho phép cùng loại hoặc quy đổi sang đơn vị Đếm

Nếu:

`QUY_TAC_CHON_DON_VI_QUY_DOI = 3`

thì hệ thống áp dụng quy tắc:

- Khối lượng → được chọn Khối lượng hoặc Đếm.
- Thể tích → được chọn Thể tích hoặc Đếm.
- Đếm → được chọn tất cả các loại đơn vị.

Ví dụ với **Khối lượng**:

- Kg → Gram: hợp lệ.
- Kg → Bao: hợp lệ nếu Bao thuộc loại Đếm.
- Kg → Lít: không hợp lệ.

Ví dụ với **Thể tích**:

- Lít → ml: hợp lệ.
- Lít → Chai: hợp lệ nếu Chai thuộc loại Đếm.
- Lít → Kg: không hợp lệ.

Ví dụ với **Đếm**:

- Bao → Cái: hợp lệ.
- Bao → Kg: hợp lệ.
- Bao → Lít: hợp lệ.

Quy tắc này cho phép thực phẩm có đơn vị sơ cấp thuộc Khối lượng hoặc Thể tích được sử dụng theo một đơn vị đóng gói hoặc đơn vị đếm.

### Giá trị `4` - Đếm được phép quy đổi sang mọi loại

Nếu:

`QUY_TAC_CHON_DON_VI_QUY_DOI = 4`

thì hệ thống áp dụng quy tắc:

- Khối lượng → chỉ được chọn Khối lượng.
- Thể tích → chỉ được chọn Thể tích.
- Đếm → được chọn tất cả các loại đơn vị.

Ví dụ với **Khối lượng**:

- Kg → Gram: hợp lệ.
- Kg → Bao: không hợp lệ.
- Kg → Lít: không hợp lệ.

Ví dụ với **Thể tích**:

- Lít → ml: hợp lệ.
- Lít → Chai: không hợp lệ.
- Lít → Kg: không hợp lệ.

Ví dụ với **Đếm**:

- Bao → Cái: hợp lệ.
- Bao → Kg: hợp lệ.
- Bao → Lít: hợp lệ.

Điểm khác biệt chính giữa giá trị `3` và `4` là:

- Giá trị `3` cho phép Khối lượng và Thể tích quy đổi sang đơn vị thuộc loại Đếm.
- Giá trị `4` không cho phép Khối lượng và Thể tích quy đổi sang Đếm.
- Cả hai giá trị đều cho phép đơn vị thuộc loại Đếm quy đổi sang các loại đơn vị khác.

### Quy tắc xử lý trên giao diện

Khi mở form thêm mới hoặc cập nhật thực phẩm, hệ thống tải giá trị thiết lập:

`QUY_TAC_CHON_DON_VI_QUY_DOI`

đồng thời tải danh sách đơn vị tính đang hoạt động.

Khi người dùng chọn **Đơn vị sơ cấp**, hệ thống phải lọc lại danh sách **Đơn vị sử dụng** ngay lập tức theo quy tắc hiện tại.

Nếu **Đơn vị sử dụng** đã được chọn trước đó nhưng không còn hợp lệ sau khi thay đổi **Đơn vị sơ cấp**, hệ thống phải tự động xóa giá trị **Đơn vị sử dụng** đang chọn.

Ví dụ:

Ban đầu:

- Quy tắc = `4`.
- Đơn vị sơ cấp = Kg.
- Đơn vị sử dụng = Gram.

Cặp đơn vị trên hợp lệ.

Nếu người dùng thay đổi **Đơn vị sơ cấp** thành Lít thì Gram không còn hợp lệ với Lít theo quy tắc `4`.

Hệ thống phải:

- Xóa lựa chọn Gram.
- Render lại danh sách Đơn vị sử dụng.
- Chỉ hiển thị các đơn vị thuộc loại Thể tích.

### Quy tắc kiểm tra trước khi lưu

Việc lọc danh sách trên giao diện không phải là bước kiểm tra duy nhất.

Trước khi thêm mới hoặc cập nhật thực phẩm, hệ thống phải kiểm tra lại cặp:

`Đơn vị sơ cấp → Đơn vị sử dụng`

theo `QUY_TAC_CHON_DON_VI_QUY_DOI`.

Nếu cặp đơn vị không hợp lệ thì không cho phép lưu dữ liệu.

Đối với quy tắc `2`, thông báo:

`Đơn vị sơ cấp và đơn vị sử dụng phải cùng loại đơn vị.`

Đối với các trường hợp không hợp lệ của quy tắc khác, thông báo theo dạng:

`Không thể quy đổi từ "<đơn vị sơ cấp>" sang "<đơn vị sử dụng>" theo quy tắc đơn vị hiện tại.`

### Giá trị mặc định

Thiết lập chỉ được sử dụng khi giá trị có thể chuyển thành một trong các số:

- `1`
- `2`
- `3`
- `4`

Nếu:

- Không tồn tại thiết lập.
- Không lấy được giá trị thiết lập.
- Giá trị để trống.
- Giá trị không phải số hợp lệ.
- Giá trị khác `1`, `2`, `3`, `4`.

thì hệ thống sử dụng giá trị mặc định:

`4`

### Phạm vi áp dụng

Thiết lập này áp dụng cho nghiệp vụ lựa chọn đơn vị quy đổi trong danh mục **Thực phẩm**.

Thiết lập ảnh hưởng đến:

- Danh sách Đơn vị sử dụng được phép lựa chọn.
- Việc tự động loại bỏ Đơn vị sử dụng không còn hợp lệ.
- Kiểm tra dữ liệu trước khi thêm mới thực phẩm.
- Kiểm tra dữ liệu trước khi cập nhật thực phẩm.

Thiết lập không làm thay đổi loại của đơn vị tính và không tự động thay đổi dữ liệu thực phẩm đã được lưu trước đó.

---

## 14. QUY_TAC_LAM_TRON

**Mã:** `QUY_TAC_LAM_TRON`

**Giá trị:** `0`, `1` hoặc `2`.

**Mô tả:**

Quy định phương pháp làm tròn số được sử dụng trong hệ thống khi các phép tính phát sinh giá trị có phần thập phân vượt quá số chữ số được phép giữ lại.

Thiết lập này được sử dụng kết hợp với thiết lập:

`SO_CHU_SO_SAU_DAU_PHAY`

Trong đó:

- `QUY_TAC_LAM_TRON` quyết định làm tròn theo hướng nào.
- `SO_CHU_SO_SAU_DAU_PHAY` quyết định giữ lại bao nhiêu chữ số sau dấu phẩy.

Thiết lập này có thể được sử dụng cho các phép tính như:

- Giá theo đơn vị sử dụng.
- Giá hao hụt.
- Giá sau hao hụt.
- Định lượng.
- Định lượng hao hụt.
- Định lượng sau hao hụt.
- Thành tiền trước hao hụt.
- Thành tiền hao hụt.
- Thành tiền sau hao hụt.
- Các phép tính số học khác có yêu cầu làm tròn trong hệ thống.

### Giá trị `0` - Làm tròn thông thường

Nếu:

`QUY_TAC_LAM_TRON = 0`

thì hệ thống thực hiện làm tròn theo chữ số ngay sau vị trí cần giữ lại.

Quy tắc:

- `0`, `1`, `2`, `3`, `4` → làm tròn xuống.
- `5`, `6`, `7`, `8`, `9` → làm tròn lên.

Ví dụ khi:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

Giá trị:

`123,454`

Kết quả:

`123,45`

Vì chữ số thứ ba sau dấu phẩy là `4`, hệ thống làm tròn xuống.

Giá trị:

`123,455`

Kết quả:

`123,46`

Vì chữ số thứ ba sau dấu phẩy là `5`, hệ thống làm tròn lên.

Giá trị:

`123,459`

Kết quả:

`123,46`

Vì chữ số thứ ba sau dấu phẩy là `9`, hệ thống làm tròn lên.

Đây là quy tắc làm tròn mặc định của hệ thống.

### Giá trị `1` - Luôn làm tròn lên

Nếu:

`QUY_TAC_LAM_TRON = 1`

thì nếu giá trị còn phần dư sau số chữ số thập phân được phép giữ lại, hệ thống luôn làm tròn lên.

Ví dụ khi:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

Giá trị:

`123,451`

Kết quả:

`123,46`

Giá trị:

`123,454`

Kết quả:

`123,46`

Giá trị:

`123,459`

Kết quả:

`123,46`

Nếu giá trị đã chính xác đến số chữ số cần giữ và không còn phần dư thì hệ thống không tăng thêm.

Ví dụ:

`123,450`

Kết quả:

`123,45`

Không được hiểu quy tắc làm tròn lên là luôn cộng thêm một đơn vị vào chữ số cuối cùng.

Hệ thống chỉ làm tròn lên khi tồn tại phần số bị loại bỏ có giá trị khác `0`.

### Giá trị `2` - Luôn làm tròn xuống

Nếu:

`QUY_TAC_LAM_TRON = 2`

thì hệ thống luôn loại bỏ phần số vượt quá số chữ số sau dấu phẩy được phép giữ lại.

Không phụ thuộc chữ số tiếp theo là:

- `1`
- `2`
- `3`
- `4`
- `5`
- `6`
- `7`
- `8`
- `9`

Ví dụ khi:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

Giá trị:

`123,451`

Kết quả:

`123,45`

Giá trị:

`123,456`

Kết quả:

`123,45`

Giá trị:

`123,459`

Kết quả:

`123,45`

Quy tắc này tương đương với việc cắt bỏ phần thập phân vượt quá số chữ số được cấu hình.

### Ví dụ kết hợp với số chữ số sau dấu phẩy

Giả sử giá trị cần xử lý:

`123,45678`

Và:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

Nếu:

`QUY_TAC_LAM_TRON = 0`

thì:

`123,45678 → 123,46`

Nếu:

`QUY_TAC_LAM_TRON = 1`

thì:

`123,45678 → 123,46`

Nếu:

`QUY_TAC_LAM_TRON = 2`

thì:

`123,45678 → 123,45`

Ví dụ khác:

`123,45111`

Nếu:

`QUY_TAC_LAM_TRON = 0`

thì:

`123,45111 → 123,45`

Nếu:

`QUY_TAC_LAM_TRON = 1`

thì:

`123,45111 → 123,46`

Nếu:

`QUY_TAC_LAM_TRON = 2`

thì:

`123,45111 → 123,45`

### Giá trị mặc định

Thiết lập chỉ được sử dụng khi giá trị có thể chuyển thành một trong các số:

- `0`
- `1`
- `2`

Nếu:

- Không tồn tại thiết lập.
- Không lấy được giá trị thiết lập.
- Thiết lập có `active = false`.
- Giá trị để trống.
- Giá trị không phải số nguyên hợp lệ.
- Giá trị khác `0`, `1`, `2`.

thì hệ thống sử dụng giá trị mặc định:

`0`

Tức là:

- `0` đến `4` → làm tròn xuống.
- `5` đến `9` → làm tròn lên.

### Quy tắc xử lý

Trước khi làm tròn một giá trị, hệ thống phải lấy đồng thời:

`QUY_TAC_LAM_TRON`

và:

`SO_CHU_SO_SAU_DAU_PHAY`

Quy trình xử lý:

1. Xác định số chữ số sau dấu phẩy cần giữ lại.
2. Xác định phần số vượt quá số chữ số được giữ.
3. Áp dụng `QUY_TAC_LAM_TRON`.
4. Trả về giá trị đã làm tròn.
5. Các phép tính tiếp theo sử dụng giá trị theo quy tắc nghiệp vụ được xác định tại từng chức năng.

Ví dụ:

Giá trị ban đầu:

`126,315789`

Số chữ số:

`2`

Quy tắc:

`0`

Kết quả:

`126,32`

Nếu quy tắc:

`1`

Kết quả:

`126,32`

Nếu quy tắc:

`2`

Kết quả:

`126,31`

### Phạm vi áp dụng

Thiết lập này là quy tắc làm tròn dùng chung của hệ thống.

Thiết lập có thể áp dụng cho:

- Giá tiền.
- Hệ số tính toán.
- Giá theo đơn vị sơ cấp.
- Giá theo đơn vị sử dụng.
- Hao hụt.
- Định lượng.
- Thành tiền.
- Tổng tiền.
- Các giá trị số được tính toán từ nghiệp vụ.

Thiết lập không tự động thay đổi dữ liệu gốc đã được lưu trong cơ sở dữ liệu nếu nghiệp vụ đó không yêu cầu làm tròn khi lưu.

Việc một trường được:

- Làm tròn trước khi lưu.
- Chỉ làm tròn khi tính toán.
- Chỉ làm tròn khi hiển thị.

sẽ được xác định riêng tại nghiệp vụ sử dụng trường đó.

---

## 15. SO_CHU_SO_SAU_DAU_PHAY

**Mã:** `SO_CHU_SO_SAU_DAU_PHAY`

**Giá trị:** `0`, `1`, `2`, `3`, `4` hoặc `5`.

**Mô tả:**

Quy định số lượng chữ số tối đa được giữ lại sau dấu phẩy khi hệ thống thực hiện làm tròn các giá trị số.

Thiết lập này luôn được sử dụng kết hợp với:

`QUY_TAC_LAM_TRON`

Trong đó:

- `SO_CHU_SO_SAU_DAU_PHAY` xác định vị trí làm tròn.
- `QUY_TAC_LAM_TRON` xác định hướng làm tròn.

### Giá trị `0`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 0`

thì hệ thống không giữ chữ số nào sau dấu phẩy.

Ví dụ:

Giá trị:

`123,45678`

Nếu:

`QUY_TAC_LAM_TRON = 0`

Kết quả:

`123`

vì chữ số đầu tiên sau dấu phẩy là `4`.

Giá trị:

`123,55678`

Kết quả:

`124`

vì chữ số đầu tiên sau dấu phẩy là `5`.

Nếu:

`QUY_TAC_LAM_TRON = 1`

thì:

`123,00001 → 124`

Nếu:

`QUY_TAC_LAM_TRON = 2`

thì:

`123,99999 → 123`

### Giá trị `1`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 1`

thì hệ thống giữ tối đa một chữ số sau dấu phẩy.

Ví dụ:

`123,45678`

Với:

`QUY_TAC_LAM_TRON = 0`

Kết quả:

`123,5`

Với:

`QUY_TAC_LAM_TRON = 1`

Kết quả:

`123,5`

Với:

`QUY_TAC_LAM_TRON = 2`

Kết quả:

`123,4`

### Giá trị `2`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

thì hệ thống giữ tối đa hai chữ số sau dấu phẩy.

Ví dụ:

`123,45678`

Với:

`QUY_TAC_LAM_TRON = 0`

Kết quả:

`123,46`

Với:

`QUY_TAC_LAM_TRON = 1`

Kết quả:

`123,46`

Với:

`QUY_TAC_LAM_TRON = 2`

Kết quả:

`123,45`

Đây là giá trị mặc định của hệ thống.

### Giá trị `3`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 3`

thì hệ thống giữ tối đa ba chữ số sau dấu phẩy.

Ví dụ:

`123,45678`

Với:

`QUY_TAC_LAM_TRON = 0`

Kết quả:

`123,457`

Với:

`QUY_TAC_LAM_TRON = 1`

Kết quả:

`123,457`

Với:

`QUY_TAC_LAM_TRON = 2`

Kết quả:

`123,456`

### Giá trị `4`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 4`

thì hệ thống giữ tối đa bốn chữ số sau dấu phẩy.

Ví dụ:

`123,45678`

Với:

`QUY_TAC_LAM_TRON = 0`

Kết quả:

`123,4568`

Với:

`QUY_TAC_LAM_TRON = 1`

Kết quả:

`123,4568`

Với:

`QUY_TAC_LAM_TRON = 2`

Kết quả:

`123,4567`

### Giá trị `5`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 5`

thì hệ thống giữ tối đa năm chữ số sau dấu phẩy.

Ví dụ:

`123,456789`

Với:

`QUY_TAC_LAM_TRON = 0`

Kết quả:

`123,45679`

Với:

`QUY_TAC_LAM_TRON = 1`

Kết quả:

`123,45679`

Với:

`QUY_TAC_LAM_TRON = 2`

Kết quả:

`123,45678`

`5` là số chữ số sau dấu phẩy tối đa mà thiết lập cho phép.

### Các giá trị hợp lệ

Thiết lập chỉ chấp nhận sáu giá trị:

- `0`
- `1`
- `2`
- `3`
- `4`
- `5`

Không chấp nhận:

- Số âm.
- Số lớn hơn `5`.
- Số thập phân.
- Chuỗi không thể chuyển thành số nguyên hợp lệ.

Ví dụ các giá trị không hợp lệ:

- `-1`
- `6`
- `10`
- `2.5`
- `abc`
- Chuỗi rỗng.

### Giá trị mặc định

Nếu:

- Không tồn tại thiết lập.
- Không lấy được giá trị thiết lập.
- Thiết lập có `active = false`.
- Giá trị để trống.
- Giá trị không phải số nguyên.
- Giá trị nhỏ hơn `0`.
- Giá trị lớn hơn `5`.

thì hệ thống sử dụng giá trị mặc định:

`2`

Tức là mặc định hệ thống giữ tối đa:

`2 chữ số sau dấu phẩy`

### Quy tắc kết hợp với QUY_TAC_LAM_TRON

Ví dụ:

Giá trị ban đầu:

`126,315789`

Nếu:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

và:

`QUY_TAC_LAM_TRON = 0`

thì:

`126,315789 → 126,32`

Nếu:

`QUY_TAC_LAM_TRON = 1`

thì:

`126,315789 → 126,32`

Nếu:

`QUY_TAC_LAM_TRON = 2`

thì:

`126,315789 → 126,31`

Ví dụ:

`SO_CHU_SO_SAU_DAU_PHAY = 4`

và giá trị:

`126,315789`

Nếu:

`QUY_TAC_LAM_TRON = 0`

thì:

`126,315789 → 126,3158`

Nếu:

`QUY_TAC_LAM_TRON = 1`

thì:

`126,315789 → 126,3158`

Nếu:

`QUY_TAC_LAM_TRON = 2`

thì:

`126,315789 → 126,3157`

### Không tự bổ sung số 0 khi tính toán

Thiết lập quy định số chữ số tối đa sau dấu phẩy được giữ lại, không bắt buộc giá trị phải luôn hiển thị đủ số chữ số.

Ví dụ:

`SO_CHU_SO_SAU_DAU_PHAY = 2`

Giá trị:

`123`

có thể giữ dưới dạng:

`123`

không bắt buộc trở thành:

`123,00`

Giá trị:

`123,5`

có thể giữ dưới dạng:

`123,5`

không bắt buộc trở thành:

`123,50`

Việc hiển thị cố định số chữ số, ví dụ luôn hiển thị:

`123,50`

thay vì:

`123,5`

thuộc về quy tắc định dạng giao diện và không thuộc trách nhiệm của thiết lập này.

### Phạm vi áp dụng

Thiết lập này được sử dụng làm số chữ số thập phân mặc định cho các phép tính trong hệ thống có yêu cầu làm tròn.

Có thể áp dụng cho:

- Giá theo đơn vị sử dụng.
- Giá hao hụt.
- Giá sau hao hụt.
- Định lượng quy đổi.
- Định lượng hao hụt.
- Định lượng sau hao hụt.
- Thành tiền.
- Tổng thành tiền.
- Các giá trị tính toán khác.

Thiết lập không thay đổi:

- Độ chính xác vật lý của cột trong cơ sở dữ liệu.
- Kiểu dữ liệu của cột.
- Giá trị gốc nếu nghiệp vụ không yêu cầu làm tròn trước khi lưu.

Nếu một nghiệp vụ có quy tắc làm tròn riêng được quy định rõ ràng thì quy tắc riêng của nghiệp vụ đó được ưu tiên áp dụng.

---

---

## 16. BAT_BUOC_CHON_NHOM_MON**

**Mã:** `BAT_BUOC_CHON_NHOM_MON`

**Giá trị:** `true` hoặc `false`.

**Mô tả:**

Quy định khi xây dựng nội dung thực đơn, hệ thống có bắt buộc người dùng phải chọn **nhóm món ăn** trước khi được phép chọn **món ăn** hay không.

Thiết lập này dùng để kiểm soát luồng:

`Nhóm món ăn → Món ăn`

---

### Giá trị `true`

Nếu:

`BAT_BUOC_CHON_NHOM_MON = true`

thì hệ thống bắt buộc người dùng phải chọn nhóm món ăn trước khi thêm hoặc chọn món ăn.

Luồng xử lý:

`Chọn nhóm món ăn → Chọn món ăn`

Nếu chưa có nhóm món ăn được chọn thì hệ thống không cho phép thực hiện thao tác chọn món.

Ví dụ:

Người dùng đang tạo nội dung thực đơn.

Chưa chọn:

`Nhóm món ăn`

và thực hiện:

`Thêm món ăn`

thì hệ thống không cho phép tiếp tục.

Có thể hiển thị thông báo:

`Vui lòng chọn nhóm món ăn trước khi chọn món ăn.`

Sau khi người dùng chọn:

`Món mặn`

thì mới có thể tiếp tục chọn các món như:

- Thịt kho tàu.
- Cá kho.
- Gà kho.
- Các món ăn khác.

Món ăn được chọn sẽ thuộc nhóm món ăn đang được thao tác.

---

### Giá trị `false`

Nếu:

`BAT_BUOC_CHON_NHOM_MON = false`

thì hệ thống không bắt buộc người dùng phải chọn nhóm món ăn trước khi chọn món.

Người dùng có thể thực hiện thao tác chọn món mà không cần phải đi qua bước chọn nhóm món trước.

Ví dụ:

Người dùng có thể mở trực tiếp chức năng:

`Chọn món ăn`

mà chưa cần chọn:

`Nhóm món ăn`

Việc xác định nhóm món của món ăn có thể được xử lý bởi nghiệp vụ khác của hệ thống, ví dụ:

- Lấy theo nhóm mặc định của món ăn.
- Lấy theo thông tin danh mục món ăn.
- Cho phép xác định nhóm ở bước tiếp theo.
- Không sử dụng nhóm món trong trường hợp nghiệp vụ cho phép.

Thiết lập này chỉ bỏ yêu cầu **phải chọn nhóm trước**, không tự động thay đổi dữ liệu nhóm món ăn.

---

### Các giá trị hợp lệ

Thiết lập chỉ chấp nhận hai giá trị:

- `true`
- `false`

Không chấp nhận các giá trị khác như:

- `1`
- `0`
- `yes`
- `no`
- `abc`
- Chuỗi rỗng.
- Giá trị `null`.
- Các chuỗi không thể xác định rõ thành `true` hoặc `false`.

---

### Giá trị mặc định

Nếu:

- Không tồn tại thiết lập.
- Không lấy được giá trị thiết lập.
- Thiết lập có `active = false`.
- Giá trị để trống.
- Giá trị không phải `true` hoặc `false`.
- Giá trị thiết lập không hợp lệ.

thì hệ thống sử dụng giá trị mặc định:

`true`

Tức là mặc định hệ thống áp dụng luồng:

`Chọn nhóm món ăn → Chọn món ăn`

Người dùng phải chọn nhóm món ăn trước khi được phép chọn món.

Việc đặt mặc định là `true` giúp giữ nguyên luồng xây dựng thực đơn hiện tại nếu thiết lập chưa được cấu hình.

---

### Quy tắc khi giá trị là `true`

Khi:

`BAT_BUOC_CHON_NHOM_MON = true`

trước khi mở chức năng chọn món, hệ thống phải kiểm tra đã xác định nhóm món ăn hay chưa.

Ví dụ:

Nếu:

`nhomMonAnId = null`

thì:

`Không cho phép chọn món`

Nếu:

`nhomMonAnId = 4`

thì:

`Cho phép chọn món`

Ví dụ luồng:

`Món kho`

↓

`Chọn món`

↓

- Thịt kho tàu.
- Cá kho.
- Gà kho.

Các món được thêm vào nhóm:

`Món kho`

---

### Quy tắc khi giá trị là `false`

Khi:

`BAT_BUOC_CHON_NHOM_MON = false`

hệ thống không được chặn thao tác chọn món chỉ vì chưa có nhóm món ăn được chọn.

Ví dụ:

`nhomMonAnId = null`

vẫn có thể:

`Mở danh sách món ăn`

và:

`Chọn món ăn`

Tuy nhiên, nếu nghiệp vụ lưu thực đơn yêu cầu món ăn cuối cùng phải thuộc một nhóm thì việc kiểm tra đó vẫn phải được thực hiện tại bước lưu hoặc bước xử lý nghiệp vụ tương ứng.

Thiết lập này không có nghĩa là:

`Món ăn không cần nhóm`

mà chỉ có nghĩa là:

`Không bắt buộc phải chọn nhóm trước khi mở hoặc thực hiện thao tác chọn món`.

---

### Phạm vi áp dụng

Thiết lập có thể được áp dụng tại các chức năng xây dựng nội dung thực đơn như:

- Tạo thực đơn.
- Cập nhật thực đơn.
- Thêm nhóm món ăn.
- Thêm món ăn vào ngày thực đơn.
- Chỉnh sửa nội dung nhóm món.
- Chọn món từ danh mục món ăn.
- Các màn hình biên tập nội dung thực đơn khác có luồng nhóm món và món ăn.

---

### Thiết lập không thay đổi

Thiết lập này không thay đổi:

- Danh mục nhóm món ăn.
- Danh mục món ăn.
- Quan hệ mặc định giữa món ăn và nhóm món ăn nếu đã tồn tại.
- Dữ liệu nhóm món đã lưu trong thực đơn.
- Dữ liệu món ăn đã lưu trong thực đơn.
- Cấu trúc bảng dữ liệu.
- Quyền thêm, sửa hoặc xóa món ăn.
- Quyền thêm, sửa hoặc xóa nhóm món ăn.

Thiết lập chỉ kiểm soát việc:

`Có bắt buộc chọn nhóm món trước khi chọn món hay không`.

---

### Ví dụ tổng quát

Nếu:

`BAT_BUOC_CHON_NHOM_MON = true`

thì:

`Chưa chọn nhóm món`

↓

`Không thể chọn món`

↓

`Chọn nhóm món`

↓

`Có thể chọn món`

Ví dụ:

`Món chiên → Gà chiên`

---

Nếu:

`BAT_BUOC_CHON_NHOM_MON = false`

thì:

`Chưa chọn nhóm món`

↓

`Vẫn có thể chọn món`

↓

Hệ thống tiếp tục xử lý nhóm món theo nghiệp vụ được cấu hình.

---

### Ý nghĩa nghiệp vụ

Thiết lập `BAT_BUOC_CHON_NHOM_MON` giúp hệ thống linh hoạt giữa hai cách xây dựng thực đơn:

**Luồng có cấu trúc chặt chẽ:**

`Nhóm món → Món ăn`

Sử dụng khi:

`BAT_BUOC_CHON_NHOM_MON = true`

**Luồng linh hoạt:**

`Có thể chọn món trước`

Sử dụng khi:

`BAT_BUOC_CHON_NHOM_MON = false`

Thiết lập này nên được kiểm tra trước khi giao diện thực hiện thao tác mở danh sách chọn món hoặc thêm món vào nội dung thực đơn.

---