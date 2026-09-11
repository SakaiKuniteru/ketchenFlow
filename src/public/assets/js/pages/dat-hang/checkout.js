'use strict';

(() => {
    const C = MCS.orders,
        { $, $$, state, mount, api } = C;

    function summary(confirmation = false) {
        const draft = state.draft;
        mount('[data-checkout-summary]', 'thanh-toan', {
            type: 'summary',
            ...C.cartView(),
            confirmation,
            receiver: draft.tenNguoiNhan,
            phone: draft.soDienThoaiNguoiNhan,
            address: draft.diaChiNhan,
            deliveryTime: C.deliveryTime(draft.thoiGianNhanTu, draft.thoiGianNhanDen),
            phuongThucThanhToan: draft.phuongThucThanhToan || 20,
            maVoucher: state.quote?.voucher?.maVoucher,
            backUrl: confirmation ? C.paths.delivery : C.paths.catalog,
            backLabel: confirmation ? 'Chỉnh sửa thông tin' : 'Quay lại giỏ hàng'
        });
    }

    async function catalog() {
        let products = [],
            category = '',
            page = 1,
            keyword = '',
            group = '',
            sequence = 0;
        const dialog = $('[data-product-filter]');
        function productView() {
            mount('[data-product-grid]', 'dat-mon', {
                type: 'grid',
                items: products.map((product) => {
                    const quantity =
                        state.cart.find((row) => String(row.sanPhamId) === String(product.id))?.soLuong || 0;
                    return {
                        ...product,
                        quantity,
                        atMax: product.soLuongToiDa != null && quantity >= Number(product.soLuongToiDa)
                    };
                })
            });
        }
        function renderCart() {
            mount('[data-cart-panel]', 'gio-hang', {
                type: 'panel',
                ...C.cartView()
            });
        }
        async function load() {
            const request = ++sequence;
            mount('[data-product-grid]', 'dung-chung', {
                type: 'loading'
            });
            try {
                const result = await api(
                    `/dat-hang/catalog/san-pham?${C.query({
                        page,
                        limit: 12,
                        keyword,
                        loaiSanPham: category === 'new' ? '' : category,
                        laSanPhamMoi: category === 'new' ? true : '',
                        nhomSanPhamId: group
                    })}`
                );
                if (request !== sequence) return;
                products = result.items;
                productView();
                mount('[data-catalog-pagination]', 'quan-ly-don', {
                    type: 'pagination',
                    ...C.pagination(result.pagination, 'sản phẩm')
                });
            } catch (error) {
                if (request === sequence) {
                    mount('[data-product-grid]', 'dung-chung', {
                        title: 'Không tải được sản phẩm',
                        description: error.message,
                        retry: true,
                        type: 'empty'
                    });
                    $('[data-catalog-pagination]').replaceChildren();
                }
            }
        }
        function tabs() {
            mount('[data-category-tabs]', 'dat-mon', {
                type: 'tabs',
                categories: C.categories.map((item) => ({ ...item, selected: category === item.value }))
            });
        }
        tabs();
        renderCart();
        document.addEventListener('orders:cart', renderCart);
        $('[data-order-page]').addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            if (button.hasAttribute('data-category')) {
                category = button.dataset.category;
                page = 1;
                tabs();
                void load();
            }
            if (button.hasAttribute('data-page')) {
                page = Number(button.dataset.page);
                void load();
            }
            const id = button.dataset.add || button.dataset.quantity;
            if (id) {
                const product =
                    products.find((row) => String(row.id) === id) ||
                    state.cart.find((row) => String(row.sanPhamId) === id)?.product;
                if (product) {
                    C.changeQuantity(product, Number(button.dataset.delta || 1));
                    productView();
                }
            }
            if (button.dataset.remove) {
                state.cart = state.cart.filter((row) => String(row.sanPhamId) !== button.dataset.remove);
                C.invalidate();
                void C.priceCart();
                productView();
            }
            if (button.hasAttribute('data-clear-cart'))
                MCS.confirm.show({
                    title: 'Xóa giỏ hàng',
                    message: 'Xóa tất cả món đang chọn?',
                    type: 'danger',
                    onConfirm() {
                        state.cart = [];
                        C.invalidate();
                        void C.priceCart();
                        productView();
                    }
                });
            if (button.hasAttribute('data-checkout') && !C.cartView().blocked) location.assign(C.paths.delivery);
            if (button.hasAttribute('data-filter-open')) dialog.showModal();
            if (button.hasAttribute('data-filter-reset')) {
                group = '';
                $('#orderGroupFilter').value = '';
                page = 1;
                dialog.close();
                void load();
            }
            if (button.hasAttribute('data-retry')) {
                void load();
                void C.priceCart();
            }
        });
        document.addEventListener('input', (event) => {
            if (event.target.id === 'orderCartNote') {
                state.draft.ghiChu = event.target.value;
                delete state.draft.confirmed;
                C.save();
            }
        });
        $('#orderCatalogSearch').addEventListener(
            'input',
            C.debounce((event) => {
                keyword = event.target.value.trim();
                page = 1;
                void load();
            })
        );
        $('[data-search-picker-clear]', $('#orderCatalogSearch').closest('[data-search-picker]'))?.addEventListener(
            'click',
            () => {
                $('#orderCatalogSearch').value = '';
                keyword = '';
                page = 1;
                void load();
            }
        );
        $('[data-product-filter-form]').addEventListener('submit', (event) => {
            if (event.submitter?.value === 'apply') {
                group = $('#orderGroupFilter').value;
                page = 1;
                void load();
            }
        });
        await Promise.all([
            load(),
            C.priceCart(),
            api('/dat-hang/catalog/thong-tin-checkout')
                .then((data) => {
                    C.setOptions(
                        $('#orderGroupFilter'),
                        data.nhomSanPham.map((row) => ({ value: row.id, label: row.tenNhomSanPham }))
                    );
                })
                .catch((error) => MCS.toast.error(error.message))
        ]);
    }

    function requireCart() {
        if (state.cart.length) return true;
        mount('[data-order-page]', 'dung-chung', {
            title: 'Giỏ hàng đang trống',
            description: 'Chọn món trước khi nhập thông tin nhận hàng.',
            shopping: true,
            type: 'empty'
        });
        return false;
    }

    async function delivery() {
        if (!requireCart()) return;
        const form = $('#orderDeliveryForm');
        let checkoutSequence = 0,
            checkoutLoading = false;
        const value = (id) => $('#' + id).value.trim();
        function toggleOther() {
            const enabled = $('#orderDatHo').checked,
                fields = $('[data-order-other-fields]');
            fields.hidden = !enabled;
            fields.disabled = !enabled;
            $('#orderSoDienThoai').required = !enabled;
        }
        function collect() {
            const old = state.draft,
                datHo = $('#orderDatHo').checked;
            const slot = state.checkout?.khungGioNhanHang.find((row) => String(row.id) === value('orderKhungGio'));
            const location = state.checkout?.diaDiemNhanHang.find((row) => String(row.id) === value('orderDiaDiem'));
            state.draft = {
                ...old,
                datHo,
                ngayNhan: value('orderNgayNhan'),
                tenNguoiNhan: datHo ? value('orderNguoiNhan') : state.user.hoTen,
                soDienThoaiNguoiNhan: datHo ? value('orderDienThoaiNguoiNhan') : value('orderSoDienThoai'),
                soDienThoai: value('orderSoDienThoai'),
                otherName: value('orderNguoiNhan'),
                otherPhone: value('orderDienThoaiNguoiNhan'),
                diaDiemNhanId: Number(value('orderDiaDiem')) || null,
                tenDiaDiem: location?.tenDiaDiem || '',
                diaChiNhan: value('orderDiaChi'),
                ghiChu: $('#orderGhiChu').value,
                khungGioNhanId: slot?.id || null,
                thoiGianNhanTu: slot?.thoiGianNhanTu || null,
                thoiGianNhanDen: slot?.thoiGianNhanDen || null,
                phuongThucThanhToan: Number($('input[name="payment"]:checked')?.value || 20)
            };
            delete state.draft.confirmed;
            delete state.draft.requestId;
            C.save();
            summary();
        }
        function fillProfile() {
            $('#orderNguoiDat').value = state.user.hoTen || '';
            $('#orderSoDienThoai').value = state.user.soDienThoai || '';
            $('#orderPhongBan').value = state.user.phongBan?.tenPhongBan || '';
        }
        async function loadCheckout() {
            const current = ++checkoutSequence,
                selectedSlot = value('orderKhungGio') || state.draft.khungGioNhanId;
            checkoutLoading = true;
            $('#orderKhungGio').disabled = true;
            $('[data-slot-hint]').textContent = 'Đang kiểm tra khung giờ còn chỗ...';
            try {
                const data = await api(
                    `/dat-hang/catalog/thong-tin-checkout?${C.query({ ngayNhan: value('orderNgayNhan') })}`
                );
                if (current !== checkoutSequence) return;
                state.checkout = data;
                C.setOptions(
                    $('#orderKhungGio'),
                    data.khungGioNhanHang.map((slot) => ({
                        value: slot.id,
                        label: `${slot.tenKhungGio} · ${slot.gioBatDau.slice(0, 5)}–${slot.gioKetThuc.slice(0, 5)}${slot.soChoConLai == null ? '' : ` · còn ${C.number(slot.soChoConLai)} chỗ`}`
                    })),
                    selectedSlot
                );
                C.setOptions(
                    $('#orderDiaDiem'),
                    data.diaDiemNhanHang.map((row) => ({ value: row.id, label: row.tenDiaDiem })),
                    state.draft.diaDiemNhanId
                );
                if (!state.draft.diaChiNhan) {
                    const defaultLocation = data.diaDiemNhanHang.find((row) => row.laMacDinh);
                    if (defaultLocation) {
                        $('#orderDiaDiem').value = defaultLocation.id;
                        $('#orderDiaChi').value = defaultLocation.moTaDiaChi || '';
                    }
                }
                $('[data-slot-hint]').textContent = data.khungGioNhanHang.length
                    ? `Đặt trước tối thiểu ${data.soPhutDatTruoc} phút. Khung giờ được kiểm tra lại khi gửi đơn.`
                    : 'Ngày này không còn khung giờ có thể đặt. Vui lòng chọn ngày nhận khác.';
                collect();
                C.counters(form);
            } catch (error) {
                if (current === checkoutSequence) {
                    state.checkout = null;
                    C.setOptions($('#orderKhungGio'), []);
                    $('[data-slot-hint]').textContent = error.message;
                }
            } finally {
                if (current === checkoutSequence) {
                    checkoutLoading = false;
                    $('#orderKhungGio').disabled = false;
                }
            }
        }
        fillProfile();
        const draft = state.draft;
        $('#orderSoDienThoai').value = draft.soDienThoai || state.user.soDienThoai || '';
        $('#orderNgayNhan').value = draft.ngayNhan && draft.ngayNhan >= C.today() ? draft.ngayNhan : C.today();
        $('#orderNgayNhan').min = C.today();
        $('#orderDatHo').checked = !!draft.datHo;
        $('#orderNguoiNhan').value = draft.otherName || (draft.datHo ? draft.tenNguoiNhan : '') || '';
        $('#orderDienThoaiNguoiNhan').value = draft.otherPhone || (draft.datHo ? draft.soDienThoaiNguoiNhan : '') || '';
        $('#orderDiaChi').value = draft.diaChiNhan || '';
        $('#orderGhiChu').value = draft.ghiChu || '';
        $('#orderVoucher').value = draft.maVoucher || '';
        const payment = $(`input[name="payment"][value="${Number(draft.phuongThucThanhToan) || 20}"]`);
        if (payment) payment.checked = true;
        toggleOther();
        C.counters();
        document.addEventListener('orders:cart', () => {
            summary();
            voucherBadge();
        });
        form.addEventListener('input', (event) => {
            C.formErrors(form);
            if (!['orderNgayNhan', 'orderKhungGio', 'orderDiaDiem', 'orderDatHo'].includes(event.target.id)) collect();
        });
        form.addEventListener('change', (event) => {
            C.formErrors(form);
            if (event.target.id === 'orderNgayNhan') {
                void loadCheckout();
                return;
            }
            if (event.target.id === 'orderDatHo') toggleOther();
            if (event.target.id === 'orderDiaDiem') {
                const place = state.checkout?.diaDiemNhanHang.find((row) => String(row.id) === value('orderDiaDiem'));
                if (place) $('#orderDiaChi').value = place.moTaDiaChi || '';
            }
            collect();
        });
        $('[data-fill-profile]').addEventListener('click', () => {
            fillProfile();
            collect();
        });
        $$('input[name="payment"]').forEach((input) => input.addEventListener('change', collect));
        $('[data-voucher-form]').addEventListener('submit', async (event) => {
            event.preventDefault();
            const button = $('button', event.currentTarget);
            if (button.disabled) return;
            const code = value('orderVoucher');
            if (!code) {
                MCS.toast.warning('Vui lòng nhập mã voucher.');
                return;
            }
            button.disabled = true;
            const previous = state.draft.maVoucher;
            state.draft.maVoucher = code;
            C.invalidate();
            if (await C.priceCart()) MCS.toast.success('Đã áp dụng voucher.');
            else {
                MCS.toast.error(state.quoteError);
                state.draft.maVoucher = previous || '';
                C.save();
                await C.priceCart();
            }
            button.disabled = false;
        });
        $('[data-applied-voucher]').addEventListener('click', async (event) => {
            if (event.target.closest('[data-remove-voucher]')) {
                state.draft.maVoucher = '';
                $('#orderVoucher').value = '';
                C.invalidate();
                await C.priceCart();
            }
        });
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            collect();
            const errors = {},
                d = state.draft;
            if (!d.ngayNhan || d.ngayNhan < C.today()) errors.ngayNhan = 'Chọn ngày nhận từ hôm nay.';
            if (checkoutLoading || !d.khungGioNhanId) errors.khungGioNhanId = 'Vui lòng chọn khung giờ còn chỗ.';
            if (!d.tenNguoiNhan) errors.tenNguoiNhan = 'Nhập tên người nhận.';
            if (!/^[+\d][\d\s().-]{7,19}$/.test(d.soDienThoaiNguoiNhan))
                errors[d.datHo ? 'soDienThoaiNguoiNhan' : 'soDienThoai'] = 'Nhập số điện thoại hợp lệ (8–20 ký tự).';
            if (!d.diaChiNhan) errors.diaChiNhan = 'Nhập địa chỉ nhận hàng chi tiết.';
            if (C.cartView().blocked) errors._ = state.quoteError || 'Vui lòng đợi giỏ hàng được tính lại.';
            if (!C.formErrors(form, errors)) return;
            state.draft.confirmed = true;
            state.draft.quoteSnapshot = JSON.stringify(state.quote);
            C.save();
            location.assign(C.paths.confirmation);
        });
        await Promise.all([loadCheckout(), C.priceCart()]);
    }

    function voucherBadge() {
        const node = $('[data-applied-voucher]');
        if (!node) return;
        const voucher = state.quote?.voucher;
        node.hidden = !voucher;
        node.replaceChildren();
        if (voucher) {
            const text = document.createElement('span');
            text.textContent = `${voucher.maVoucher} · giảm ${C.money(voucher.soTienGiam)}`;
            const remove = document.createElement('button');
            remove.type = 'button';
            remove.dataset.removeVoucher = '';
            remove.textContent = '×';
            remove.setAttribute('aria-label', 'Bỏ voucher');
            node.append(text, remove);
        }
    }

    async function confirmation() {
        if (!requireCart()) return;
        if (!state.draft.confirmed || !state.draft.khungGioNhanId) {
            location.replace(C.paths.delivery);
            return;
        }
        const d = state.draft;
        mount('[data-confirm-information]', 'chi-tiet', {
            type: 'receiver',
            nguoiDat: state.user,
            phongBan: state.user.phongBan,
            datHo: d.datHo,
            nguoiNhan: { hoTen: d.tenNguoiNhan, soDienThoai: d.soDienThoaiNguoiNhan },
            diaDiemNhan: { tenDiaDiem: d.tenDiaDiem, diaChi: d.diaChiNhan },
            deliveryTime: C.deliveryTime(d.thoiGianNhanTu, d.thoiGianNhanDen),
            ghiChu: d.ghiChu
        });
        function render() {
            summary(true);
            mount('[data-confirm-items]', 'thanh-toan', {
                type: 'confirmation-items',
                ...C.cartView()
            });
        }
        document.addEventListener('orders:cart', render);
        await C.priceCart();
        render();
        $('[data-order-page]').addEventListener('click', async (event) => {
            const button = event.target.closest('[data-place-order]');
            if (!button || state.submitting || C.cartView().blocked) return;
            state.submitting = true;
            render();
            const previous = JSON.stringify(state.quote);
            try {
                if (!(await C.priceCart())) return;
                if (JSON.stringify(state.quote) !== previous) {
                    MCS.toast.warning('Giá hoặc ưu đãi vừa thay đổi. Vui lòng kiểm tra tổng tiền và xác nhận lại.');
                    return;
                }
                d.requestId ||= crypto.randomUUID();
                C.save();
                const payload = {
                    ...C.cartPayload(),
                    clientRequestId: d.requestId,
                    datHo: d.datHo,
                    nguoiNhanId: d.datHo ? null : Number(state.user.nhanVienId),
                    tenNguoiNhan: d.tenNguoiNhan,
                    soDienThoaiNguoiNhan: d.soDienThoaiNguoiNhan,
                    diaDiemNhanId: d.diaDiemNhanId,
                    diaChiNhan: d.diaChiNhan,
                    khungGioNhanId: Number(d.khungGioNhanId),
                    thoiGianNhanTu: d.thoiGianNhanTu,
                    thoiGianNhanDen: d.thoiGianNhanDen,
                    ghiChu: d.ghiChu,
                    phuongThucThanhToan: d.phuongThucThanhToan
                };
                const order = await api('/nv-don-hang/tao-moi', payload);
                state.cart = [];
                state.draft = {};
                C.save();
                location.assign(`/dat-hang/hoan-tat-don-hang/${encodeURIComponent(order.id)}`);
            } catch (error) {
                MCS.toast.error(error.message);
            } finally {
                state.submitting = false;
                render();
            }
        });
    }
    Object.assign(C, { catalog, delivery, confirmation });
})();
