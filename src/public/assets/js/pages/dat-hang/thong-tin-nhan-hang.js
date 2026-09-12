'use strict';

(() => {
    const C = MCS.orders;

    C.pages.delivery = async function initThongTinNhanHang() {
        const {
            $,
            $$,
            state,
            api
        } = C;

        if (
            !C.checkout.requireCart()
        ) {
            return;
        }

        const form =
            $('#orderDeliveryForm');

        if (!form) return;
        const khungGioPicker = MCS.smartSelect.initialize(
            $('#orderKhungGio').closest('[data-smart-select]')
        );

        let checkoutSequence = 0;
        let checkoutLoading = false;

        const value = (id) =>
            $(`#${id}`)?.value?.trim() || '';

        function toggleOther() {
            const enabled =
                $('#orderDatHo')?.checked === true;

            const fields =
                $('[data-order-other-fields]');

            if (fields) {
                fields.hidden = !enabled;
                fields.disabled = !enabled;
            }

            const phone =
                $('#orderSoDienThoai');

            if (phone) {
                phone.required = !enabled;
            }
        }

        function collect() {
            const old =
                state.draft;

            const datHo =
                $('#orderDatHo')
                    ?.checked === true;

            const slot =
                state.checkout
                    ?.khungGioNhanHang
                    ?.find(
                        (row) =>
                            String(row.id) ===
                            value(
                                'orderKhungGio'
                            )
                    );

            const place =
                state.checkout
                    ?.diaDiemNhanHang
                    ?.find(
                        (row) =>
                            String(row.id) ===
                            value(
                                'orderDiaDiem'
                            )
                    );

            state.draft = {
                ...old,

                datHo,

                ngayNhan:
                    value('orderNgayNhan'),

                tenNguoiNhan:
                    datHo
                        ? value(
                              'orderNguoiNhan'
                          )
                        : state.user.hoTen,

                soDienThoaiNguoiNhan:
                    datHo
                        ? value(
                              'orderDienThoaiNguoiNhan'
                          )
                        : value(
                              'orderSoDienThoai'
                          ),

                soDienThoai:
                    value(
                        'orderSoDienThoai'
                    ),

                otherName:
                    value(
                        'orderNguoiNhan'
                    ),

                otherPhone:
                    value(
                        'orderDienThoaiNguoiNhan'
                    ),

                diaDiemNhanId:
                    Number(
                        value(
                            'orderDiaDiem'
                        )
                    ) || null,

                tenDiaDiem:
                    place?.tenDiaDiem || '',

                diaChiNhan:
                    value('orderDiaChi'),

                ghiChu:
                    $('#orderGhiChu')
                        ?.value || '',

                khungGioNhanId:
                    slot?.id || null,

                thoiGianNhanTu:
                    slot?.thoiGianNhanTu ||
                    null,

                thoiGianNhanDen:
                    slot?.thoiGianNhanDen ||
                    null,

                phuongThucThanhToan:
                    Number(
                        $(
                            'input[name="payment"]:checked'
                        )?.value || 20
                    )
            };

            delete state.draft.confirmed;
            delete state.draft.requestId;

            C.save();

            C.checkout.renderSummary();
        }

        function fillProfile() {
            $('#orderNguoiDat').value =
                state.user.hoTen || '';

            $('#orderSoDienThoai').value =
                state.user.soDienThoai || '';

            $('#orderPhongBan').value =
                state.user.phongBan
                    ?.tenPhongBan || '';
        }

        async function loadCheckout() {
            const current =
                ++checkoutSequence;

            const selectedSlot =
                value('orderKhungGio') ||
                state.draft
                    .khungGioNhanId;

            checkoutLoading = true;

            khungGioPicker.setDisabled(true);

            $('[data-slot-hint]')
                .textContent =
                    'Đang kiểm tra khung giờ còn chỗ...';

            try {
                const data = await api(
                    `/dat-hang/catalog/thong-tin-checkout?${C.query({
                        ngayNhan:
                            value(
                                'orderNgayNhan'
                            )
                    })}`
                );

                if (
                    current !==
                    checkoutSequence
                ) {
                    return;
                }

                state.checkout = data;

                C.setOptions(
                    $('#orderKhungGio'),

                    data.khungGioNhanHang.map(
                        (slot) => ({
                            value: slot.id,

                            label:
                                `${slot.tenKhungGio} · ` +
                                `${slot.gioBatDau.slice(0, 5)}–` +
                                `${slot.gioKetThuc.slice(0, 5)}` +
                                `${
                                    slot.soChoConLai == null
                                        ? ''
                                        : ` · còn ${C.number(slot.soChoConLai)} chỗ`
                                }`
                        })
                    ),

                    selectedSlot
                );

                C.setOptions(
                    $('#orderDiaDiem'),

                    data.diaDiemNhanHang.map(
                        (row) => ({
                            value: row.id,
                            label:
                                row.tenDiaDiem
                        })
                    ),

                    state.draft
                        .diaDiemNhanId
                );

                if (
                    !state.draft
                        .diaChiNhan
                ) {
                    const defaultLocation =
                        data.diaDiemNhanHang
                            .find(
                                (row) =>
                                    row.laMacDinh
                            );

                    if (defaultLocation) {
                        C.setSelectValue(
                            $('#orderDiaDiem'),
                            defaultLocation.id
                        );

                        $('#orderDiaChi').value =
                            defaultLocation
                                .moTaDiaChi || '';
                    }
                }

                $('[data-slot-hint]')
                    .textContent =
                        data
                            .khungGioNhanHang
                            .length
                            ? `Đặt trước tối thiểu ${data.soPhutDatTruoc} phút. Khung giờ được kiểm tra lại khi gửi đơn.`
                            : 'Ngày này không còn khung giờ có thể đặt. Vui lòng chọn ngày nhận khác.';

                collect();

                C.counters(form);
            } catch (error) {
                if (
                    current ===
                    checkoutSequence
                ) {
                    state.checkout = null;

                    C.setOptions(
                        $('#orderKhungGio'),
                        []
                    );

                    $('[data-slot-hint]')
                        .textContent =
                            error.message;
                }
            } finally {
                if (current === checkoutSequence) {
                    checkoutLoading = false;
                    khungGioPicker.setDisabled(false);
                }
            }
        }

        function loadDraft() {
            const draft =
                state.draft;

            fillProfile();

            $('#orderSoDienThoai').value =
                draft.soDienThoai ||
                state.user.soDienThoai ||
                '';

            const ngayNhan =
                draft.ngayNhan && draft.ngayNhan >= C.today()
                    ? draft.ngayNhan
                    : C.today();

            const dateField = $('#orderNgayNhan')
                .closest('[data-date-picker]');

            dateField.datePicker.setValue(ngayNhan, false);

            $('#orderDatHo').checked =
                !!draft.datHo;

            $('#orderNguoiNhan').value =
                draft.otherName ||
                (
                    draft.datHo
                        ? draft.tenNguoiNhan
                        : ''
                ) ||
                '';

            $('#orderDienThoaiNguoiNhan')
                .value =
                    draft.otherPhone ||
                    (
                        draft.datHo
                            ? draft.soDienThoaiNguoiNhan
                            : ''
                    ) ||
                    '';

            $('#orderDiaChi').value =
                draft.diaChiNhan || '';

            $('#orderGhiChu').value =
                draft.ghiChu || '';

            $('#orderVoucher').value =
                draft.maVoucher || '';

            const payment = $(
                `input[name="payment"][value="${Number(draft.phuongThucThanhToan) || 20}"]`
            );

            if (payment) {
                payment.checked = true;
            }

            toggleOther();

            C.counters();
        }

        function bindEvents() {
            document.addEventListener(
                'orders:cart',
                () => {
                    C.checkout
                        .renderSummary();

                    C.checkout
                        .renderVoucherBadge();
                }
            );

            form.addEventListener(
                'input',
                (event) => {
                    C.formErrors(form);

                    if (
                        ![
                            'orderNgayNhan',
                            'orderKhungGio',
                            'orderDiaDiem',
                            'orderDatHo'
                        ].includes(
                            event.target.id
                        )
                    ) {
                        collect();
                    }
                }
            );

            form.addEventListener(
                'change',
                (event) => {
                    C.formErrors(form);

                    if (
                        event.target.id ===
                        'orderNgayNhan'
                    ) {
                        void loadCheckout();
                        return;
                    }

                    if (
                        event.target.id ===
                        'orderDatHo'
                    ) {
                        toggleOther();
                    }

                    if (
                        event.target.id ===
                        'orderDiaDiem'
                    ) {
                        const place =
                            state.checkout
                                ?.diaDiemNhanHang
                                ?.find(
                                    (row) =>
                                        String(
                                            row.id
                                        ) ===
                                        value(
                                            'orderDiaDiem'
                                        )
                                );

                        if (place) {
                            $('#orderDiaChi')
                                .value =
                                    place.moTaDiaChi ||
                                    '';
                        }
                    }

                    collect();
                }
            );

            $('[data-fill-profile]')
                ?.addEventListener(
                    'click',
                    () => {
                        fillProfile();
                        collect();
                    }
                );

            $$('input[name="payment"]')
                .forEach(
                    (input) =>
                        input.addEventListener(
                            'change',
                            collect
                        )
                );

            $('[data-voucher-form]')
                ?.addEventListener(
                    'submit',
                    async (event) => {
                        event.preventDefault();

                        const button = $(
                            'button',
                            event.currentTarget
                        );

                        if (
                            !button ||
                            button.disabled
                        ) {
                            return;
                        }

                        const code =
                            value(
                                'orderVoucher'
                            );

                        if (!code) {
                            MCS.toast.warning(
                                'Vui lòng nhập mã voucher.'
                            );

                            return;
                        }

                        button.disabled = true;

                        const previous =
                            state.draft
                                .maVoucher;

                        state.draft
                            .maVoucher =
                                code;

                        C.invalidate();

                        if (
                            await C.priceCart()
                        ) {
                            MCS.toast.success(
                                'Đã áp dụng voucher.'
                            );
                        } else {
                            MCS.toast.error(
                                state.quoteError
                            );

                            state.draft
                                .maVoucher =
                                    previous ||
                                    '';

                            C.save();

                            await C.priceCart();
                        }

                        button.disabled = false;
                    }
                );

            $('[data-applied-voucher]')
                ?.addEventListener(
                    'click',
                    async (event) => {
                        if (
                            !event.target.closest(
                                '[data-remove-voucher]'
                            )
                        ) {
                            return;
                        }

                        state.draft
                            .maVoucher = '';

                        $('#orderVoucher')
                            .value = '';

                        C.invalidate();

                        await C.priceCart();
                    }
                );

            form.addEventListener(
                'submit',
                async (event) => {
                    event.preventDefault();

                    collect();

                    const errors = {};
                    const draft =
                        state.draft;

                    if (
                        !draft.ngayNhan ||
                        draft.ngayNhan <
                            C.today()
                    ) {
                        errors.ngayNhan =
                            'Chọn ngày nhận từ hôm nay.';
                    }

                    if (
                        checkoutLoading ||
                        !draft.khungGioNhanId
                    ) {
                        errors.khungGioNhanId =
                            'Vui lòng chọn khung giờ còn chỗ.';
                    }

                    if (
                        !draft.tenNguoiNhan
                    ) {
                        errors.tenNguoiNhan =
                            'Nhập tên người nhận.';
                    }

                    if (
                        !/^[+\d][\d\s().-]{7,19}$/.test(
                            draft.soDienThoaiNguoiNhan
                        )
                    ) {
                        errors[
                            draft.datHo
                                ? 'soDienThoaiNguoiNhan'
                                : 'soDienThoai'
                        ] =
                            'Nhập số điện thoại hợp lệ (8–20 ký tự).';
                    }

                    if (
                        !draft.diaChiNhan
                    ) {
                        errors.diaChiNhan =
                            'Nhập địa chỉ nhận hàng chi tiết.';
                    }

                    if (
                        C.cartView().blocked
                    ) {
                        errors._ =
                            state.quoteError ||
                            'Vui lòng đợi giỏ hàng được tính lại.';
                    }

                    if (
                        !C.formErrors(
                            form,
                            errors
                        )
                    ) {
                        return;
                    }

                    state.draft.confirmed =
                        true;

                    state.draft
                        .quoteSnapshot =
                            JSON.stringify(
                                state.quote
                            );

                    C.save();

                    location.assign(
                        C.paths.confirmation(
                            state.user
                                .taiKhoanId
                        )
                    );
                }
            );
        }

        loadDraft();
        bindEvents();

        await Promise.all([
            loadCheckout(),
            C.priceCart()
        ]);

        C.checkout.renderSummary();
        C.checkout.renderVoucherBadge();
    };
})();