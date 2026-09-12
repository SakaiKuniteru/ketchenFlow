'use strict';

(() => {
    const C = MCS.orders;

    C.pages.confirmation = async function initXacNhanDonHang() {
        const {
            $,
            state,
            mount,
            api
        } = C;

        if (
            !C.checkout.requireCart()
        ) {
            return;
        }

        if (
            !state.draft.confirmed ||
            !state.draft.khungGioNhanId
        ) {
            location.replace(
                C.paths.delivery(
                    state.user.taiKhoanId
                )
            );

            return;
        }

        const root =
            $('[data-order-page]');

        const draft =
            state.draft;

        mount(
            '[data-confirm-information]',
            'chi-tiet',
            {
                type: 'receiver',

                nguoiDat:
                    state.user,

                phongBan:
                    state.user.phongBan,

                datHo:
                    draft.datHo,

                nguoiNhan: {
                    hoTen:
                        draft.tenNguoiNhan,

                    soDienThoai:
                        draft.soDienThoaiNguoiNhan
                },

                diaDiemNhan: {
                    tenDiaDiem:
                        draft.tenDiaDiem,

                    diaChi:
                        draft.diaChiNhan
                },

                deliveryTime:
                    C.deliveryTime(
                        draft.thoiGianNhanTu,
                        draft.thoiGianNhanDen
                    ),

                ghiChu:
                    draft.ghiChu
            }
        );

        function render() {
            C.checkout
                .renderSummary(true);

            mount(
                '[data-confirm-items]',
                'thanh-toan',
                {
                    type:
                        'confirmation-items',

                    ...C.cartView()
                }
            );
        }

        document.addEventListener(
            'orders:cart',
            render
        );

        root.addEventListener(
            'click',
            async (event) => {
                const button =
                    event.target.closest(
                        '[data-place-order]'
                    );

                if (
                    !button ||
                    state.submitting ||
                    C.cartView().blocked
                ) {
                    return;
                }

                state.submitting = true;

                render();

                const previous =
                    JSON.stringify(
                        state.quote
                    );

                try {
                    if (
                        !(await C.priceCart())
                    ) {
                        return;
                    }

                    if (
                        JSON.stringify(
                            state.quote
                        ) !== previous
                    ) {
                        MCS.toast.warning(
                            'Giá hoặc ưu đãi vừa thay đổi. Vui lòng kiểm tra tổng tiền và xác nhận lại.'
                        );

                        return;
                    }

                    draft.requestId ||=
                        crypto.randomUUID();

                    C.save();

                    const payload = {
                        ...C.cartPayload(),

                        clientRequestId:
                            draft.requestId,

                        datHo:
                            draft.datHo,

                        nguoiNhanId:
                            draft.datHo
                                ? null
                                : Number(
                                      state.user
                                          .nhanVienId
                                  ),

                        tenNguoiNhan:
                            draft.tenNguoiNhan,

                        soDienThoaiNguoiNhan:
                            draft.soDienThoaiNguoiNhan,

                        diaDiemNhanId:
                            draft.diaDiemNhanId,

                        diaChiNhan:
                            draft.diaChiNhan,

                        khungGioNhanId:
                            Number(
                                draft.khungGioNhanId
                            ),

                        thoiGianNhanTu:
                            draft.thoiGianNhanTu,

                        thoiGianNhanDen:
                            draft.thoiGianNhanDen,

                        ghiChu:
                            draft.ghiChu,

                        phuongThucThanhToan:
                            draft.phuongThucThanhToan
                    };

                    const order =
                        await api(
                            '/nv-don-hang/tao-moi',
                            payload
                        );

                    const taiKhoanId =
                        state.user.taiKhoanId;

                    const donHangId =
                        order.id;

                    state.cart = [];
                    state.draft = {};

                    C.save();

                    location.assign(
                        C.paths.completed(
                            taiKhoanId,
                            donHangId
                        )
                    );
                } catch (error) {
                    MCS.toast.error(
                        error.message
                    );
                } finally {
                    state.submitting = false;

                    render();
                }
            }
        );

        await C.priceCart();

        render();
    };
})();