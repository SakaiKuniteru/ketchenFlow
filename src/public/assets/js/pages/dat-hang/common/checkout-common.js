'use strict';

(() => {
    const C = MCS.orders;
    const { $, state, mount } = C;

    function requireCart() {
        if (state.cart.length) {
            return true;
        }

        mount(
            '[data-order-page]',
            'dung-chung',
            {
                type: 'empty',
                title: 'Giỏ hàng đang trống',
                description:
                    'Chọn món trước khi nhập thông tin nhận hàng.',
                shopping: true
            }
        );

        return false;
    }

    function renderSummary(
        confirmation = false
    ) {
        const draft = state.draft;

        mount(
            '[data-checkout-summary]',
            'thanh-toan',
            {
                type: 'summary',

                ...C.cartView(),

                confirmation,

                receiver:
                    draft.tenNguoiNhan,

                phone:
                    draft.soDienThoaiNguoiNhan,

                address:
                    draft.diaChiNhan,

                deliveryTime:
                    C.deliveryTime(
                        draft.thoiGianNhanTu,
                        draft.thoiGianNhanDen
                    ),

                phuongThucThanhToan:
                    draft.phuongThucThanhToan ||
                    20,

                maVoucher:
                    state.quote
                        ?.voucher
                        ?.maVoucher,

                backUrl:
                    confirmation
                        ? C.paths.delivery(
                              state.user.taiKhoanId
                          )
                        : C.paths.catalog,

                backLabel:
                    confirmation
                        ? 'Chỉnh sửa thông tin'
                        : 'Quay lại giỏ hàng'
            }
        );
    }

    function renderVoucherBadge() {
        const node =
            $('[data-applied-voucher]');

        if (!node) return;

        const voucher =
            state.quote?.voucher;

        node.hidden = !voucher;

        node.replaceChildren();

        if (!voucher) return;

        const text =
            document.createElement('span');

        text.textContent =
            `${voucher.maVoucher} · giảm ` +
            `${C.money(voucher.soTienGiam)}`;

        const remove =
            document.createElement('button');

        remove.type = 'button';
        remove.dataset.removeVoucher = '';
        remove.textContent = '×';

        remove.setAttribute(
            'aria-label',
            'Bỏ voucher'
        );

        node.append(
            text,
            remove
        );
    }

    C.checkout = {
        requireCart,
        renderSummary,
        renderVoucherBadge
    };
})();