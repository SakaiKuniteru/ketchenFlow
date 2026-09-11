module.exports = [
    {
        ma_thiet_lap: 'TEN_HE_THONG',
        ten_thiet_lap: 'Tên hệ thống',
        gia_tri: 'KITCHENFLOW',
        mo_ta: "Quy định tên hiển thị của hệ thống. Giá trị là chuỗi ký tự và được sử dụng tại các vị trí cần hiển thị tên hệ thống trên giao diện. Giá trị hiện tại 'KITCHENFLOW' có nghĩa hệ thống sử dụng KITCHENFLOW làm tên hiển thị mặc định.",
        active: true
    },

    {
        ma_thiet_lap: 'LOGO_CO_SO_MAC_DINH',
        ten_thiet_lap: 'Logo cơ sở mặc định',
        gia_tri: 'CS01',
        mo_ta: "Quy định cơ sở được sử dụng để lấy logo mặc định của hệ thống. Giá trị phải là mã cơ sở, không phải đường dẫn ảnh. Giá trị hiện tại 'CS01' có nghĩa hệ thống tìm cơ sở có mã CS01 đang hoạt động và sử dụng trường logo của cơ sở đó. Nếu không tìm thấy cơ sở tương ứng hoặc cơ sở không hoạt động thì hệ thống không có logo cơ sở mặc định.",
        active: true
    },

    {
        ma_thiet_lap: 'SO_LAN_DANG_NHAP_SAI_TOI_DA',
        ten_thiet_lap: 'Số lần đăng nhập sai tối đa',
        gia_tri: '5',
        mo_ta: "Quy định số lần người dùng được phép nhập sai mật khẩu liên tiếp trước khi tài khoản bị khóa. Giá trị phải là số nguyên lớn hơn 0. Giá trị hiện tại '5' có nghĩa khi người dùng đăng nhập sai đến lần thứ 5 thì hệ thống thực hiện khóa tài khoản. Nếu thiết lập không hoạt động hoặc giá trị không hợp lệ thì không áp dụng giới hạn đăng nhập sai từ thiết lập này.",
        active: true
    },

    {
        ma_thiet_lap: 'THOI_GIAN_KHOA_TAI_KHOAN',
        ten_thiet_lap: 'Thời gian khóa tài khoản',
        gia_tri: '30/phut',
        mo_ta: "Quy định khoảng thời gian tài khoản bị khóa khi số lần đăng nhập sai đạt giới hạn cấu hình. Giá trị có định dạng '<số lượng>/<đơn vị>', trong đó đơn vị hỗ trợ gồm 'phut', 'gio', 'ngay', 'thang', 'nam' và số lượng phải là số nguyên lớn hơn 0. Giá trị hiện tại '30/phut' có nghĩa tài khoản bị khóa trong 30 phút. Nếu giá trị không đúng định dạng thì hệ thống không xác định thời gian tự động mở khóa và tài khoản cần quản trị viên can thiệp để mở khóa.",
        active: true
    },

    {
        ma_thiet_lap: 'THOI_GIAN_ACCESS_TOKEN',
        ten_thiet_lap: 'Thời gian Access Token',
        gia_tri: '10',
        mo_ta: "Quy định thời gian hiệu lực của Access Token, tính bằng phút. Giá trị phải là số nguyên lớn hơn 0. Giá trị hiện tại '10' có nghĩa Access Token có hiệu lực trong 10 phút kể từ thời điểm được tạo. Khi Access Token hết hạn, token đó không còn được sử dụng để xác thực API nhưng người dùng chưa nhất thiết bị đăng xuất; nếu Refresh Token vẫn còn hiệu lực thì hệ thống có thể cấp Access Token mới. Nếu thiết lập không hoạt động hoặc giá trị không hợp lệ thì sử dụng thời gian Access Token mặc định của hệ thống.",
        active: true
    },

    {
        ma_thiet_lap: 'THOI_GIAN_REFRESH_TOKEN',
        ten_thiet_lap: 'Thời gian Refresh Token',
        gia_tri: '120',
        mo_ta: "Quy định thời gian hiệu lực của Refresh Token, tính bằng phút. Giá trị phải là số nguyên lớn hơn 0. Giá trị hiện tại '120' có nghĩa Refresh Token có hiệu lực trong 120 phút kể từ thời điểm được tạo và có thể được sử dụng để cấp lại Access Token khi Access Token hết hạn. Khi Refresh Token hết hạn và không còn Refresh Token hợp lệ khác thì người dùng phải đăng nhập lại. Nếu thiết lập không tồn tại, không hoạt động hoặc giá trị không hợp lệ thì hệ thống sử dụng giá trị mặc định 20 phút.",
        active: true
    },

    {
        ma_thiet_lap: 'THOI_GIAN_TIMEOUT',
        ten_thiet_lap: 'Thời gian timeout đăng nhập',
        gia_tri: '60',
        mo_ta: "Quy định khoảng thời gian tối đa người dùng không thực hiện thao tác nào trước khi hệ thống tự động đăng xuất, tính bằng phút. Giá trị phải là số nguyên lớn hơn 10. Giá trị hiện tại '60' có nghĩa nếu người dùng không có thao tác trong 60 phút liên tục thì hệ thống tự động đăng xuất; khi có thao tác hợp lệ thì thời gian chờ được tính lại từ đầu. Nếu giá trị nhỏ hơn hoặc bằng 10, không hợp lệ hoặc thiết lập không hoạt động thì không áp dụng chức năng tự động đăng xuất do không hoạt động. Thiết lập này độc lập với thời gian hết hạn của Access Token và Refresh Token.",
        active: true
    },

    {
        ma_thiet_lap: 'SIDEBAR_MAC_DINH_DONG',
        ten_thiet_lap: 'Sidebar đóng mặc định',
        gia_tri: 'true',
        mo_ta: "Quy định trạng thái mặc định của Sidebar khi người dùng tải hoặc tải lại trang. Giá trị chỉ nhận 'true' hoặc 'false' và không phân biệt chữ hoa, chữ thường. 'true' nghĩa Sidebar mặc định đóng, 'false' nghĩa Sidebar mặc định mở. Giá trị hiện tại 'true' có nghĩa Sidebar được đóng mặc định sau mỗi lần tải trang. Nếu thiết lập không hoạt động, để trống, có giá trị 'false' hoặc giá trị không hợp lệ thì Sidebar mặc định được mở. Thiết lập này không ngăn người dùng tự đóng hoặc mở Sidebar trong quá trình sử dụng.",
        active: true
    },

    {
        ma_thiet_lap: 'NGAY_BAT_DAU_TUAN_THUC_DON',
        ten_thiet_lap: 'Ngày bắt đầu tuần thực đơn',
        gia_tri: '0',
        mo_ta: "Quy định cách xác định tuần khi tạo hoặc cập nhật Thực đơn tuần. Giá trị '0' nghĩa tuần được tính từ Thứ 2 đến Chủ nhật; giá trị '1' nghĩa tuần được tính từ Thứ 7 đến Thứ 6. Giá trị hiện tại '0' có nghĩa hệ thống sử dụng tuần từ Thứ 2 đến Chủ nhật. Nếu thiết lập không hoạt động, để trống hoặc có giá trị khác '1' thì hệ thống mặc định sử dụng chế độ Thứ 2 đến Chủ nhật. Thiết lập chỉ ảnh hưởng cách xác định tuần trên giao diện và không thay đổi dữ liệu thực đơn đã lưu trước đó.",
        active: true
    },

    {
        ma_thiet_lap: 'THUC_DON_BAT_BUOC_DU_SO_NGAY',
        ten_thiet_lap: 'Thực đơn bắt buộc đủ số ngày',
        gia_tri: 'true',
        mo_ta: "Quy định người dùng có bắt buộc phải nhập đầy đủ các ngày thuộc khoảng thời gian của thực đơn trước khi được phép lưu hay không. Giá trị chỉ nhận 'true' hoặc 'false' và không phân biệt chữ hoa, chữ thường. Giá trị hiện tại 'true' có nghĩa người dùng phải nhập đầy đủ các ngày trong khoảng từ ngày bắt đầu đến ngày kết thúc trước khi lưu thực đơn. Nếu giá trị là 'false', thiết lập không hoạt động hoặc giá trị không hợp lệ thì mặc định không bắt buộc nhập đầy đủ số ngày.",
        active: true
    },

    {
        ma_thiet_lap: 'SO_TUAN_HIEN_THI_THUC_DON',
        ten_thiet_lap: 'Số tuần hiển thị thực đơn',
        gia_tri: '5',
        mo_ta: "Quy định số tuần liên tiếp được hiển thị để người dùng lựa chọn khi tạo hoặc cập nhật Thực đơn tuần. Giá trị phải là số nguyên lớn hơn 0. Giá trị hiện tại '5' có nghĩa hệ thống sinh 5 tuần liên tiếp bắt đầu từ tuần hiện tại hoặc tuần gần nhất hợp lệ theo cấu hình NGAY_BAT_DAU_TUAN_THUC_DON. Khi người dùng chọn một tuần, hệ thống tự xác định tuNgay là ngày đầu tuần và denNgay là ngày cuối tuần. Nếu thiết lập không hoạt động hoặc giá trị không hợp lệ thì mặc định sử dụng 5 tuần.",
        active: true
    },

    {
        ma_thiet_lap: 'SO_NAM_HIEN_THI_THUC_DON_THANG',
        ten_thiet_lap: 'Số năm hiển thị thực đơn tháng',
        gia_tri: '5',
        mo_ta: "Quy định số năm được phép lựa chọn khi tạo hoặc cập nhật Thực đơn tháng. Giá trị phải là số nguyên lớn hơn 0. Giá trị hiện tại '5' có nghĩa hệ thống cho phép lựa chọn năm hiện tại và 4 năm tiếp theo. Đối với năm hiện tại chỉ hiển thị từ tháng hiện tại trở đi; các năm tương lai hiển thị đầy đủ 12 tháng. Khi chọn năm và tháng, hệ thống tự xác định tuNgay là ngày đầu tháng và denNgay là ngày cuối tháng, bao gồm xử lý đúng số ngày của tháng và năm nhuận. Nếu thiết lập không hoạt động hoặc giá trị không hợp lệ thì mặc định sử dụng 5 năm.",
        active: true
    },

    {
        ma_thiet_lap: 'QUY_TAC_CHON_DON_VI_QUY_DOI',
        ten_thiet_lap: 'Quy tắc chọn đơn vị quy đổi',
        gia_tri: '4',
        mo_ta: "Quy định phạm vi Đơn vị sử dụng được phép lựa chọn dựa trên Đơn vị sơ cấp của thực phẩm. Giá trị hợp lệ gồm: '1' = cho phép quy đổi giữa mọi loại đơn vị; '2' = chỉ cho phép hai đơn vị cùng loại; '3' = Khối lượng được chọn Khối lượng hoặc Đếm, Thể tích được chọn Thể tích hoặc Đếm, Đếm được chọn mọi loại; '4' = Khối lượng chỉ được chọn Khối lượng, Thể tích chỉ được chọn Thể tích, Đếm được chọn mọi loại. Giá trị hiện tại '4' áp dụng quy tắc chặt chẽ nhất đối với Khối lượng và Thể tích. Nếu thiết lập không tồn tại, để trống hoặc giá trị khác 1, 2, 3, 4 thì mặc định sử dụng quy tắc '4'. Frontend phải lọc danh sách đơn vị sử dụng và Backend phải kiểm tra lại trước khi lưu.",
        active: true
    },

    {
        ma_thiet_lap: 'QUY_TAC_LAM_TRON',
        ten_thiet_lap: 'Quy tắc làm tròn',
        gia_tri: '0',
        mo_ta: "Quy định phương pháp làm tròn các giá trị số và được sử dụng kết hợp với thiết lập SO_CHU_SO_SAU_DAU_PHAY. Giá trị hợp lệ gồm: '0' = làm tròn thông thường, chữ số tiếp theo từ 0 đến 4 làm tròn xuống và từ 5 đến 9 làm tròn lên; '1' = luôn làm tròn lên nếu phần bị loại bỏ có giá trị khác 0; '2' = luôn làm tròn xuống bằng cách loại bỏ phần vượt quá số chữ số được giữ. Giá trị hiện tại '0' có nghĩa hệ thống sử dụng cách làm tròn thông thường. Nếu thiết lập không hoạt động hoặc giá trị không hợp lệ thì mặc định sử dụng '0'.",
        active: true
    },

    {
        ma_thiet_lap: 'SO_CHU_SO_SAU_DAU_PHAY',
        ten_thiet_lap: 'Số chữ số sau dấu phẩy',
        gia_tri: '2',
        mo_ta: "Quy định số lượng chữ số tối đa được giữ lại sau dấu phẩy khi hệ thống làm tròn giá trị số và luôn được sử dụng kết hợp với QUY_TAC_LAM_TRON. Giá trị hợp lệ gồm '0', '1', '2', '3', '4', '5'. Giá trị hiện tại '2' có nghĩa hệ thống giữ tối đa 2 chữ số sau dấu phẩy trước khi áp dụng quy tắc làm tròn. Thiết lập không bắt buộc bổ sung số 0 khi hiển thị, ví dụ 123 có thể vẫn là 123 và 123,5 có thể vẫn là 123,5. Nếu thiết lập không hoạt động, để trống, nhỏ hơn 0, lớn hơn 5 hoặc không phải số nguyên thì mặc định sử dụng giá trị '2'.",
        active: true
    },

    {
        ma_thiet_lap: 'MAT_KHAU_MAC_DINH',
        ten_thiet_lap: 'Mật khẩu mặc định',
        gia_tri: 'KitchenFlow@2026',
        mo_ta: 'Mật khẩu mặc định khi quản trị viên tạo tài khoản hoặc đặt lại mật khẩu.',
        active: true
    },

    {
        ma_thiet_lap: 'DIA_CHI_MAC_DINH',
        ten_thiet_lap: 'Địa chỉ mặc định',
        gia_tri: 'Hà Nội',
        mo_ta: 'Địa chỉ mặc định của doanh nghiệp.',
        active: true
    },

    {
        ma_thiet_lap: 'NGON_NGU_MAC_DINH',
        ten_thiet_lap: 'Ngôn ngữ mặc định',
        gia_tri: 'vi',
        mo_ta: 'Ngôn ngữ sử dụng mặc định.',
        active: true
    },

    {
        ma_thiet_lap: 'DON_VI_TIEN_TE_MAC_DINH',
        ten_thiet_lap: 'Đơn vị tiền tệ mặc định',
        gia_tri: 'VND',
        mo_ta: 'Đơn vị tiền tệ mặc định của hệ thống.',
        active: true
    },

    {
        ma_thiet_lap: 'BAT_BUOC_NHAP_XUAT_KHO',
        ten_thiet_lap: 'Bắt buộc nhập xuất kho',
        gia_tri: 'true',
        mo_ta: 'Quy định việc bắt buộc thực hiện nghiệp vụ nhập xuất kho.',
        active: true
    }
];
