'use strict';

window.MCS = window.MCS || {};
window.MCS.orders = (() => {
    const base = '/api/mcs/v1';
    const paths = {
        catalog: '/dat-hang/dat-mon',
        delivery: '/dat-hang/thong-tin-nhan-hang',
        confirmation: '/dat-hang/xac-nhan-don-hang',
        mine: '/dat-hang/danh-sach-don-hang-cua-toi'
    };
    const statuses = {
        '-20': ['Đã từ chối', 'danger', 'fa-circle-xmark'],
        '-10': ['Đã hủy', 'danger', 'fa-ban'],
        10: ['Đơn nháp', 'muted', 'fa-pen'],
        20: ['Chờ xác nhận', 'warning', 'fa-clock'],
        30: ['Đang chuẩn bị', 'primary', 'fa-kitchen-set'],
        40: ['Sẵn sàng giao', 'success', 'fa-box'],
        50: ['Đang giao', 'primary', 'fa-truck'],
        60: ['Hoàn thành', 'success', 'fa-circle-check'],
        70: ['Đã đóng đơn', 'muted', 'fa-circle-check']
    };
    const payments = { 10: 'Thanh toán nội bộ', 20: 'Tiền mặt khi nhận', 30: 'Chuyển khoản', 40: 'QR Code' };
    const paymentStatuses = {
        10: 'Chưa thanh toán',
        20: 'Chờ thanh toán',
        30: 'Đã thanh toán',
        40: 'Thanh toán thất bại',
        50: 'Đã hoàn tiền'
    };
    const categories = [
        { value: '', label: 'Tất cả', icon: 'fa-border-all' },
        { value: '10', label: 'Đồ ăn', icon: 'fa-utensils' },
        { value: '20', label: 'Đồ uống', icon: 'fa-mug-hot' },
        { value: '30', label: 'Tráng miệng', icon: 'fa-cake-candles' },
        { value: '40', label: 'Dịch vụ khác', icon: 'fa-box' },
        { value: 'new', label: 'Món mới', icon: 'fa-star' }
    ];
    const placeholder = '/assets/images/order-placeholder.svg';
    const number = (value) => new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 3 }).format(Number(value) || 0);
    const money = (value) => `${number(Math.round(Number(value) || 0))}đ`;
    const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
    const dateTime = (value) => {
        const date = new Date(value);
        return value && !Number.isNaN(date.getTime())
            ? new Intl.DateTimeFormat('vi-VN', {
                  timeZone: 'Asia/Ho_Chi_Minh',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
              }).format(date)
            : '—';
    };
    const imageUrl = (value) => {
        if (typeof value !== 'string' || !value.trim()) return placeholder;
        try {
            const url = new URL(value, location.origin);
            return ['http:', 'https:'].includes(url.protocol) ? url.href : placeholder;
        } catch {
            return placeholder;
        }
    };
    Handlebars.registerHelper({
        eq: (a, b) => String(a) === String(b),
        gt: (a, b) => Number(a) > Number(b),
        inc: (value) => Number(value) + 1,
        money,
        number,
        dateTime,
        imageUrl,
        statusName: (value) => statuses[value]?.[0] || 'Không xác định',
        statusTheme: (value) => statuses[value]?.[1] || 'muted',
        statusIcon: (value) => statuses[value]?.[2] || 'fa-circle',
        paymentName: (value) => payments[value] || '—',
        paymentStatusName: (value) => paymentStatuses[value] || '—',
        paymentTheme: (value) => ({ 30: 'success', 40: 'danger', 50: 'muted' })[value] || 'warning',
        categoryName: (value) => categories.find((c) => c.value === String(value))?.label || 'Sản phẩm'
    });
    const state = {
        cart: [],
        draft: {},
        quote: null,
        quoteError: '',
        quoting: false,
        user: null,
        checkout: null,
        submitting: false
    };
    let storageKey = '',
        quoteSequence = 0;
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
    const render = (name, data = {}) => Handlebars.partials[`dat-hang/${name}`](data);
    const mount = (selector, name, data = {}) => {
        const node = typeof selector === 'string' ? $(selector) : selector;
        if (node) {
            node.innerHTML = render(name, data);
            counters(node);
        }
    };
    async function api(path, body, method) {
        const result = await MCS.api.request(
            `${base}${path}`,
            body === undefined
                ? {}
                : {
                      method: method || 'POST',
                      body: JSON.stringify(body)
                  }
        );
        return result.data;
    }
    function query(params) {
        return new URLSearchParams(
            Object.entries(params).filter(([, value]) => value !== '' && value !== null && value !== undefined)
        ).toString();
    }
    function save() {
        try {
            localStorage.setItem(storageKey, JSON.stringify({ cart: state.cart, draft: state.draft }));
        } catch {
            MCS.toast.warning('Trình duyệt không lưu được giỏ hàng. Hãy giữ trang này mở.');
        }
    }
    function invalidate() {
        delete state.draft.requestId;
        delete state.draft.confirmed;
        state.quote = null;
        save();
    }
    function cartPayload() {
        return {
            coSoId: Number(state.user.coSoId),
            maVoucher: state.draft.maVoucher || '',
            items: state.cart.map((item) => ({ sanPhamId: Number(item.sanPhamId), soLuong: Number(item.soLuong) }))
        };
    }
    function cartView() {
        const items = state.cart.map((item) => {
            const priced = state.quote?.items.find((row) => String(row.sanPhamId) === String(item.sanPhamId));
            return {
                ...item.product,
                ...priced,
                id: item.sanPhamId,
                quantity: item.soLuong,
                soLuong: item.soLuong,
                donGia: priced?.donGia ?? item.product?.giaBan,
                thanhTien: priced?.thanhTien ?? Math.round(item.soLuong * Number(item.product?.giaBan || 0)),
                atMax: item.product?.soLuongToiDa != null && item.soLuong >= Number(item.product.soLuongToiDa)
            };
        });
        const tamTinh = items.reduce((sum, item) => sum + item.thanhTien, 0);
        return {
            items,
            tamTinh,
            tongThanhToan: tamTinh,
            tongMienGiam: 0,
            phiDichVu: 0,
            ...state.quote,
            // Giữ metadata số lượng kể cả khi kết quả tính tiền không chứa các giới hạn.
            items,
            quantity: items.reduce((sum, item) => sum + Number(item.soLuong), 0),
            note: state.draft.ghiChu || '',
            error: state.quoteError,
            loading: state.quoting,
            blocked: state.quoting || !!state.quoteError || !state.quote || !items.length || state.submitting
        };
    }
    const emitCart = () => document.dispatchEvent(new CustomEvent('orders:cart'));
    async function priceCart() {
        const sequence = ++quoteSequence;
        state.quoteError = '';
        state.quote = null;
        if (!state.cart.length) {
            state.quoting = false;
            emitCart();
            return false;
        }
        state.quoting = true;
        emitCart();
        try {
            const quote = await api('/dat-hang/catalog/tinh-gio-hang', cartPayload());
            if (sequence !== quoteSequence) return false;
            state.quote = quote;
            return true;
        } catch (error) {
            if (sequence === quoteSequence) state.quoteError = error.message;
            return false;
        } finally {
            if (sequence === quoteSequence) {
                state.quoting = false;
                emitCart();
            }
        }
    }
    function changeQuantity(product, direction) {
        const id = String(product.id);
        const row = state.cart.find((item) => String(item.sanPhamId) === id);
        const minimum = Number(product.soLuongToiThieu) || 1,
            step = Number(product.buocSoLuong) || 1;
        const next = row ? Number((row.soLuong + direction * step).toFixed(3)) : minimum;
        if (product.soLuongToiDa != null && next > Number(product.soLuongToiDa)) {
            MCS.toast.warning(`Số lượng tối đa của ${product.tenSanPham} là ${number(product.soLuongToiDa)}.`);
            return;
        }
        if (next < minimum) state.cart = state.cart.filter((item) => String(item.sanPhamId) !== id);
        else if (row) row.soLuong = next;
        else state.cart.push({ sanPhamId: id, soLuong: next, product });
        invalidate();
        void priceCart();
    }
    function counters(root = document) {
        $$('[data-character-counter]', root).forEach((counter) => {
            const input = document.getElementById(counter.dataset.characterCounter);
            const current = $('[data-character-current]', counter);
            if (input && current) current.textContent = input.value.length;
        });
    }
    function formErrors(form, errors = {}) {
        $$('[data-field-error]', form).forEach((node) => {
            const name = node.dataset.fieldError,
                message = errors[name] || '';
            node.textContent = message;
            node.hidden = !message;
            const input = form.elements.namedItem(name);
            if (input?.setAttribute) input.setAttribute('aria-invalid', String(!!message));
        });
        const summary = $('[data-form-error]', form);
        if (summary) {
            summary.textContent = errors._ || '';
            summary.hidden = !errors._;
        }
        const first = Object.keys(errors).find((key) => key !== '_');
        if (first) form.elements.namedItem(first)?.focus();
        return Object.keys(errors).length === 0;
    }
    function setOptions(select, items, selected = '', placeholderText) {
        if (!select) return;
        const placeholderTextValue = placeholderText ?? select.options[0]?.textContent ?? 'Chọn...';
        select.replaceChildren(
            new Option(placeholderTextValue, ''),
            ...items.map((item) => {
                const option = new Option(item.label, String(item.value));
                option.disabled = !!item.disabled;
                return option;
            })
        );
        select.value = String(selected || '');
    }
    function pagination(p, noun = 'đơn') {
        const page = Number(p.page),
            totalPages = Number(p.totalPages),
            pages = [];
        const visible = new Set([1, totalPages, page - 1, page, page + 1]);
        let previous = 0;
        [...visible]
            .filter((i) => i > 0 && i <= totalPages)
            .sort((a, b) => a - b)
            .forEach((value) => {
                if (previous && value - previous > 1) pages.push({ gap: true });
                pages.push({ value, active: value === page });
                previous = value;
            });
        return {
            ...p,
            noun,
            pages,
            from: (page - 1) * p.limit + 1,
            to: Math.min(page * p.limit, p.total),
            previous: page - 1,
            next: page + 1,
            hasPrevious: page > 1,
            hasNext: page < totalPages
        };
    }
    function deliveryTime(from, to) {
        if (!from || !to) return 'Chưa chọn khung giờ';
        const end = new Date(to);
        if (Number.isNaN(end.getTime())) return 'Chưa chọn khung giờ';
        return `${dateTime(from)} – ${new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', hour: '2-digit', minute: '2-digit' }).format(end)}`;
    }
    function debounce(fn, delay = 280) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    }
    async function initialize() {
        state.user = await api('/auth/nhan-vien-hien-tai');
        storageKey = `kitchenflow.orders.v1.${state.user.nhanVienId}.${state.user.coSoId}`;
        try {
            const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
            state.cart = Array.isArray(stored.cart)
                ? stored.cart.filter((item) => Number(item.sanPhamId) > 0 && Number(item.soLuong) > 0 && item.product)
                : [];
            state.draft = stored.draft && typeof stored.draft === 'object' ? stored.draft : {};
        } catch {
            state.cart = [];
            state.draft = {};
        }
        $$('[data-order-manager-link]').forEach((link) => {
            link.hidden = !can('Q002031');
        });
        $$('.order-nav a').forEach((link) => {
            if (link.pathname === location.pathname) link.setAttribute('aria-current', 'page');
        });
        document.addEventListener('input', () => counters());
        document.addEventListener(
            'error',
            (event) => {
                if (
                    event.target instanceof HTMLImageElement &&
                    event.target.src !== new URL(placeholder, location.origin).href
                )
                    event.target.src = placeholder;
            },
            true
        );
        window.addEventListener('storage', (event) => {
            if (event.key === storageKey) {
                // Một trang đã xác nhận / thay đổi giỏ: tải trạng thái mới trước khi gửi đơn tiếp.
                if (['catalog', 'delivery', 'confirmation'].includes($('[data-order-page]')?.dataset.orderPage))
                    location.reload();
            }
        });
        counters();
    }
    function can(code) {
        return (state.user?.dsQuyen || []).some((item) => item.maQuyen === code);
    }
    return {
        $,
        $$,
        api,
        query,
        render,
        mount,
        state,
        paths,
        statuses,
        payments,
        paymentStatuses,
        categories,
        number,
        money,
        today,
        dateTime,
        imageUrl,
        save,
        invalidate,
        cartPayload,
        cartView,
        emitCart,
        priceCart,
        changeQuantity,
        counters,
        formErrors,
        setOptions,
        pagination,
        deliveryTime,
        debounce,
        initialize,
        can
    };
})();
