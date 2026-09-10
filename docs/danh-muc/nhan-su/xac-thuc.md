# NGHIỆP VỤ XÁC THỰC

## 1. Tổng quan

Module xác thực chịu trách nhiệm:

- Đăng nhập.
- Kiểm tra mật khẩu.
- Quản lý số lần đăng nhập sai.
- Khóa tài khoản.
- Tự động mở khóa tài khoản.
- Sinh Access Token.
- Sinh Refresh Token.
- Làm mới Token.
- Đăng xuất.
- Đổi mật khẩu.

---

# 2. Luồng đăng nhập

Người dùng nhập:

- Tên đăng nhập.
- Mật khẩu.

Hệ thống xử lý theo thứ tự:

1. Tìm tài khoản.
2. Kiểm tra trạng thái tài khoản.
3. Kiểm tra trạng thái khóa.
4. Kiểm tra mật khẩu.
5. Xử lý đăng nhập sai nếu mật khẩu không đúng.
6. Reset số lần đăng nhập sai nếu mật khẩu đúng.
7. Cập nhật thời gian đăng nhập cuối.
8. Sinh Access Token.
9. Sinh Refresh Token.
10. Lưu Refresh Token.
11. Trả thông tin đăng nhập về frontend.

---

# 3. Kiểm tra tài khoản

## 3.1. Không tồn tại

Nếu không tìm thấy tài khoản:

HTTP:

`401`

Thông báo:

`Sai tài khoản hoặc mật khẩu.`

Không thông báo riêng "tài khoản không tồn tại" để tránh tiết lộ thông tin tài khoản.

---

# 4. Tài khoản không hoạt động

Nếu:

`active = FALSE`

thì không cho phép đăng nhập.

HTTP:

`403`

Thông báo:

`Tài khoản đã bị khóa.`

---

# 5. Kiểm tra trạng thái khóa

Tài khoản sử dụng:

- `bi_khoa`
- `khoa_den`

để xác định trạng thái khóa.

---

## 5.1. Khóa không thời hạn

Nếu:

`bi_khoa = TRUE`

và:

`khoa_den = NULL`

thì tài khoản bị khóa không xác định thời gian tự động mở.

Không cho phép đăng nhập.

HTTP:

`423`

Thông báo:

`Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.`

---

## 5.2. Khóa tạm thời

Nếu:

`bi_khoa = TRUE`

và:

`khoa_den > thời gian hiện tại`

thì tài khoản vẫn đang trong thời gian khóa.

Không kiểm tra mật khẩu tiếp.

HTTP:

`423`

Thông báo:

`Tài khoản đang bị khóa tạm thời.`

---

## 5.3. Hết thời gian khóa

Nếu:

`bi_khoa = TRUE`

nhưng:

`khoa_den <= thời gian hiện tại`

thì hệ thống tự động mở khóa.

Thực hiện:

- `bi_khoa = FALSE`
- `khoa_den = NULL`
- `so_lan_dang_nhap_sai = 0`

Sau đó tiếp tục quá trình đăng nhập.

---

# 6. Kiểm tra mật khẩu

Mật khẩu người dùng nhập được so sánh với `mat_khau_hash`.

Nếu mật khẩu đúng:

tiếp tục quá trình đăng nhập.

Nếu mật khẩu sai:

thực hiện nghiệp vụ đăng nhập sai.

---

# 7. Đăng nhập sai

Khi mật khẩu sai:

Tăng:

`so_lan_dang_nhap_sai`

thêm 1.

Sau đó lấy thiết lập:

`SO_LAN_DANG_NHAP_SAI_TOI_DA`

Ví dụ:

`5`

---

## 7.1. Chưa đạt giới hạn

Nếu:

`so_lan_dang_nhap_sai < SO_LAN_DANG_NHAP_SAI_TOI_DA`

thì chưa khóa tài khoản.

HTTP:

`401`

Thông báo:

`Sai tài khoản hoặc mật khẩu.`

Ví dụ giới hạn = 5:

- Sai lần 1 → chưa khóa.
- Sai lần 2 → chưa khóa.
- Sai lần 3 → chưa khóa.
- Sai lần 4 → chưa khóa.
- Sai lần 5 → bắt đầu xử lý khóa.

---

# 8. Đạt số lần đăng nhập sai tối đa

Nếu:

`so_lan_dang_nhap_sai >= SO_LAN_DANG_NHAP_SAI_TOI_DA`

hệ thống đọc:

`THOI_GIAN_KHOA_TAI_KHOAN`

---

## 8.1. Có thời gian khóa hợp lệ

Ví dụ:

`30/phut`

Hệ thống tính:

`khoa_den = thời gian hiện tại + 30 phút`

Sau đó:

- Đặt `bi_khoa = TRUE`.
- Lưu `khoa_den`.

HTTP:

`423`

Thông báo:

`Tài khoản đã bị khóa trong 30 phút.`

Tương tự:

`2/gio`

→ `Tài khoản đã bị khóa trong 2 giờ.`

---

## 8.2. Không có thời gian khóa hợp lệ

Nếu `THOI_GIAN_KHOA_TAI_KHOAN` không hợp lệ hoặc không được áp dụng:

- Đặt `bi_khoa = TRUE`.
- Đặt `khoa_den = NULL`.

Tài khoản không tự động mở khóa.

HTTP:

`423`

Thông báo:

`Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.`

---

# 9. Đăng nhập thành công

Khi mật khẩu đúng:

Hệ thống thực hiện:

1. Reset số lần đăng nhập sai.
2. Xóa trạng thái khóa tạm nếu có.
3. Cập nhật lần đăng nhập cuối.
4. Sinh Access Token.
5. Sinh Refresh Token.
6. Lưu Refresh Token vào database.
7. Trả thông tin tài khoản về frontend.

---

# 10. Reset trạng thái đăng nhập sai

Sau khi đăng nhập thành công:

`so_lan_dang_nhap_sai = 0`

`bi_khoa = FALSE`

`khoa_den = NULL`

Điều này đảm bảo lần đăng nhập sai tiếp theo được tính lại từ đầu.

---

# 11. Access Token

Access Token được sinh sau khi đăng nhập thành công.

Thời gian hiệu lực lấy từ:

`THOI_GIAN_ACCESS_TOKEN`

Đơn vị:

`phút`

Ví dụ:

`20`

=> Access Token hết hạn sau 20 phút.

Access Token hết hạn KHÔNG đồng nghĩa với việc người dùng phải nhập lại tài khoản và mật khẩu.

Nếu Refresh Token còn hợp lệ thì frontend có thể yêu cầu cấp Access Token mới.

---

# 12. Refresh Token

Refresh Token được sinh cùng Access Token.

Thời gian hiệu lực lấy từ:

`THOI_GIAN_REFRESH_TOKEN`

Đơn vị:

`phút`

Nếu thiết lập không hợp lệ thì sử dụng mặc định:

`20 phút`

Refresh Token được lưu vào:

`nv_refresh_token`

bao gồm tối thiểu:

- Tài khoản.
- Token.
- Thời gian hết hạn.
- Trạng thái thu hồi.

---

# 13. Làm mới Token

Khi Access Token hết hạn, frontend có thể gửi Refresh Token lên API refresh.

Backend thực hiện:

1. Kiểm tra Refresh Token có được gửi lên không.
2. Verify chữ ký và thời hạn của Refresh Token.
3. Kiểm tra token có tồn tại trong database.
4. Kiểm tra token có bị thu hồi không.
5. Kiểm tra thời gian hết hạn trong database.
6. Kiểm tra tài khoản còn tồn tại.
7. Sinh Access Token mới.
8. Sinh Refresh Token mới.
9. Thu hồi Refresh Token cũ.
10. Lưu Refresh Token mới.

Đây là cơ chế Refresh Token Rotation.

---

# 14. Khi Access Token hết hạn

Ví dụ:

`THOI_GIAN_ACCESS_TOKEN = 20`

Sau 20 phút:

Access Token A hết hạn.

Nếu Refresh Token vẫn hợp lệ:

Frontend gọi API refresh.

Backend cấp:

- Access Token B.
- Refresh Token B.

Người dùng tiếp tục sử dụng hệ thống.

Không yêu cầu đăng nhập lại chỉ vì Access Token hết hạn.

---

# 15. Khi Refresh Token hết hạn

Nếu Refresh Token:

- Hết hạn.
- Không tồn tại.
- Đã bị thu hồi.
- Không verify được.

thì không được phép cấp Access Token mới.

Khi không còn phiên Refresh Token hợp lệ, người dùng phải đăng nhập lại.

---

# 16. Timeout không hoạt động

Timeout là nghiệp vụ độc lập với thời hạn Access Token.

Thiết lập:

`THOI_GIAN_TIMEOUT`

Ví dụ:

`60`

có nghĩa nếu người dùng không thao tác trong 60 phút thì frontend thực hiện logout.

Nếu người dùng vẫn hoạt động bình thường thì bộ đếm timeout được reset theo hoạt động.

---

# 17. Đăng xuất

Khi người dùng chủ động logout:

Frontend gửi Refresh Token hiện tại lên backend.

Backend:

1. Kiểm tra Refresh Token.
2. Kiểm tra token tồn tại.
3. Verify token.
4. Thu hồi Refresh Token.

Sau đó frontend:

- Xóa Access Token.
- Xóa Refresh Token.
- Xóa dữ liệu phiên đăng nhập cần thiết.
- Chuyển về trang đăng nhập.

---

# 18. Đổi mật khẩu

Khi người dùng đổi mật khẩu:

1. Kiểm tra tài khoản tồn tại.
2. Lấy mật khẩu hiện tại.
3. Kiểm tra mật khẩu cũ.
4. Kiểm tra mật khẩu mới khác mật khẩu cũ.
5. Hash mật khẩu mới.
6. Cập nhật mật khẩu.
7. Đánh dấu không còn yêu cầu đổi mật khẩu lần đầu.
8. Thu hồi toàn bộ Refresh Token của tài khoản.

Việc thu hồi toàn bộ Refresh Token giúp các phiên đăng nhập cũ không tiếp tục sử dụng sau khi mật khẩu thay đổi.

---

# 19. Đăng nhập lần đầu

Tài khoản mới hoặc tài khoản vừa được Admin đặt lại mật khẩu có:

`doi_mat_khau_lan_dau = TRUE`

Sau khi đăng nhập thành công backend trả:

`firstLogin = true`

Frontend phải chuyển người dùng đến màn hình đổi mật khẩu.

Sau khi đổi mật khẩu thành công:

`doi_mat_khau_lan_dau = FALSE`

---

# 20. Tóm tắt luồng

Đăng nhập:

Tài khoản
→ Trạng thái active
→ Trạng thái khóa
→ Kiểm tra mật khẩu

Nếu sai:

Tăng số lần sai
→ Kiểm tra giới hạn
→ Chưa đạt giới hạn: báo sai mật khẩu
→ Đạt giới hạn: kiểm tra thời gian khóa
→ Khóa tạm thời hoặc khóa không thời hạn

Nếu đúng:

Reset đăng nhập sai
→ Cập nhật lần đăng nhập cuối
→ Sinh Access Token
→ Sinh Refresh Token
→ Lưu Refresh Token
→ Trả thông tin đăng nhập
→ Kiểm tra firstLogin