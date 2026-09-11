'use strict';

(() => {
    const app = (window.KitchenFlowLayVeAn = window.KitchenFlowLayVeAn || {});

    const normalizeSearchText = (...args) => app.normalizeSearchText(...args);
    const renderPaymentMethods = (...args) => app.renderPaymentMethods(...args);

    const root = document.querySelector('[data-lay-ve-an-page]');
    const permission = window.LayVeAn?.permission;

    const NUMERIC_ID_PATTERN = /^[1-9]\d*$/;

    const rawPageId = String(root?.dataset.pageId || '').trim();

    const rawPaymentDocumentId = String(new URLSearchParams(window.location.search).get('thanhToanId') || '').trim();

    const pageContext = {
        pageId: rawPageId,
        mode: !rawPageId ? 'create' : NUMERIC_ID_PATTERN.test(rawPageId) ? 'detail' : 'invalid',
        recordId: NUMERIC_ID_PATTERN.test(rawPageId) ? Number(rawPageId) : null,
        paymentDocumentId: NUMERIC_ID_PATTERN.test(rawPaymentDocumentId) ? Number(rawPaymentDocumentId) : null
    };

    function isExistingPage() {
        return pageContext.mode === 'detail';
    }

    function isCreatePage() {
        return pageContext.mode === 'create';
    }

    function replacePageUrl(id) {
        window.history.replaceState(window.history.state, '', `/ve-an/lay-ve-an/${encodeURIComponent(id)}`);
    }

    function markPageAsExisting(id) {
        const recordId = Number(id);

        if (!Number.isInteger(recordId) || recordId <= 0) {
            return;
        }

        pageContext.pageId = String(recordId);
        pageContext.mode = 'detail';
        pageContext.recordId = recordId;

        if (root) {
            root.dataset.pageId = String(recordId);
        }

        replacePageUrl(recordId);
    }

    function markPageAsCreate() {
        pageContext.pageId = '';
        pageContext.mode = 'create';
        pageContext.recordId = null;

        if (root) {
            root.dataset.pageId = '';
        }

        window.history.replaceState(window.history.state, '', '/ve-an/lay-ve-an');
    }

    const API = {
        phieu: '/api/mcs/v1/nv-phieu-lay-ve-an',
        discount: '/api/mcs/v1/ct-phieu-lay-ve-mien-giam',
        payment: '/api/mcs/v1/nv-thanh-toan-ve-an',
        ticket: '/api/mcs/v1/ct-ve-an',
        employee: '/api/mcs/v1/dm-nhan-vien/tong-hop?active=true',
        enums: '/api/mcs/v1/enums',
        doiTuongOrderSetting: '/api/mcs/v1/thiet-lap/gia-tri?ma=THU_TU_DOI_TUONG_LAY_VE',
        paymentVisibleSetting: '/api/mcs/v1/thiet-lap/gia-tri?ma=PHUONG_THUC_THANH_TOAN_HIEN_THI'
    };

    const DAILY_MEAL_STORAGE_KEY = 'kitchenflow.lay-ve-an.thuc-don-ngay';
    const TAKER_TYPE_STORAGE_KEY = 'kitchenflow.lay-ve-an.doi-tuong-lay-ve';

    const state = {
        permissions: new Set(),
        thucDonNgay: [],
        doiTuong: [],
        gioiTinh: [],
        paymentMethods: [],
        discountTypes: [],
        phieuStatuses: [],
        paymentStatuses: [],
        employees: [],
        doiTuongOrderRule: 1,
        paymentMethodVisibleValues: [10, 20, 30],
        phieu: null,
        discounts: [],
        availableDiscounts: [],
        payment: null,
        qrPayment: null,
        qrData: null,
        selectedPaymentMethod: null,
        pricePreview: null,
        paymentDocuments: [],
        activePaymentDocument: null,
        familyHasRefund: false,
        transactionTypes: []
    };

    const el = {
        thucDonNgayId: byId('thucDonNgayId'),
        doiTuongLayVe: byId('doiTuongLayVe'),
        nhanVienId: byId('nhanVienId'),
        soLuong: byId('soLuong'),
        employeeSelectField: root.querySelector('[data-employee-select-field]'),
        employeeInfo: root.querySelector('[data-employee-info]'),
        guestForm: root.querySelector('[data-guest-form]'),
        hoTen: byId('hoTenNguoiLayVe'),
        ngaySinh: byId('ngaySinhNguoiLayVe'),
        gioiTinh: byId('gioiTinhNguoiLayVe'),
        phone: byId('soDienThoaiNguoiLayVe'),
        address: byId('diaChiNguoiLayVe'),
        unit: byId('donViNguoiLayVe'),
        permanentGuest: byId('khachLauDai'),
        noteEmployee: byId('ghiChuNhanVien'),
        noteGuest: byId('ghiChuKhach'),
        mealDetail: root.querySelector('[data-meal-detail]'),
        mealDate: root.querySelector('[data-meal-date]'),
        mealName: root.querySelector('[data-meal-name]'),
        mealCanteen: root.querySelector('[data-meal-canteen]'),
        mealShift: root.querySelector('[data-meal-shift]'),
        mealTime: root.querySelector('[data-meal-time]'),
        viewMenu: root.querySelector('[data-view-menu]'),
        employeeCode: root.querySelector('[data-employee-code]'),
        employeeName: root.querySelector('[data-employee-name]'),
        employeeDepartment: root.querySelector('[data-employee-department]'),
        employeeSite: root.querySelector('[data-employee-site]'),
        employeePhone: root.querySelector('[data-employee-phone]'),
        summaryTicket: root.querySelector('[data-summary-ticket]'),
        summaryQty: root.querySelector('[data-summary-qty]'),
        summaryPrice: root.querySelector('[data-summary-price]'),
        summaryOriginal: root.querySelector('[data-summary-original]'),
        summaryDiscount: root.querySelector('[data-summary-discount]'),
        summaryTotal: root.querySelector('[data-summary-total]'),
        paymentSection: root.querySelector('[data-payment-section]'),
        paymentMethodList: root.querySelector('[data-payment-method-list]'),
        qrPanel: root.querySelector('[data-qr-panel]'),
        qrCode: root.querySelector('[data-qr-code]'),
        discountOpen: root.querySelector('[data-discount-open]'),
        discountList: root.querySelector('[data-discount-list]'),
        discountModal: root.querySelector('[data-discount-modal]'),
        discountAvailable: root.querySelector('[data-discount-available]'),
        discountCreate: root.querySelector('[data-discount-create]'),
        discountType: byId('loaiMienGiam'),
        print: root.querySelector('[data-print]'),
        mainPaymentAction: root.querySelector('[data-payment-main-action]'),
        mainPaymentActionLabel: root.querySelector('[data-payment-main-action-label]'),
        mainPaymentActionIcon: root.querySelector('[data-payment-main-action-icon]'),
        cancelQr: root.querySelector('[data-cancel-qr]'),
        cancelPhieu: root.querySelector('[data-cancel-phieu]'),
        cancelPayment: root.querySelector('[data-cancel-payment]'),
        recreateQr: root.querySelector('[data-recreate-qr]'),
        qrModalLoadingText: root.querySelector('[data-qr-modal-loading-text]'),
        cancelPhieuModal: root.querySelector('[data-cancel-phieu-modal]'),
        cancelPhieuReason: byId('lyDoHuyPhieu'),
        cancelPhieuSubmit: root.querySelector('[data-cancel-phieu-submit]'),
        newTicket: root.querySelector('[data-new-ticket]'),
        newTicketLabel: root.querySelector('[data-new-ticket-label]'),
        discountSearch: byId('mienGiamSearch'),
        paymentInfo: root.querySelector('[data-payment-info]'),
        paymentStatusText: root.querySelector('[data-payment-status-text]'),
        paymentCode: root.querySelector('[data-payment-code]'),
        paymentMethodText: root.querySelector('[data-payment-method-text]'),
        paymentOriginal: root.querySelector('[data-payment-original]'),
        paymentDiscount: root.querySelector('[data-payment-discount]'),
        paymentFinal: root.querySelector('[data-payment-final]'),
        paymentPayer: root.querySelector('[data-payment-payer]'),
        paymentTime: root.querySelector('[data-payment-time]'),
        viewQr: root.querySelector('[data-view-qr]'),
        qrModal: root.querySelector('[data-qr-modal]'),
        qrModalLoading: root.querySelector('[data-qr-modal-loading]'),
        qrModalContent: root.querySelector('[data-qr-modal-content]'),
        qrModalActions: root.querySelector('[data-qr-modal-actions]'),
        qrModalImage: root.querySelector('[data-qr-modal-image]'),
        qrModalAmount: root.querySelector('[data-qr-modal-amount]'),
        qrModalTransaction: root.querySelector('[data-qr-modal-transaction]'),
        qrModalCode: root.querySelector('[data-qr-modal-code]'),
        qrModalBank: root.querySelector('[data-qr-modal-bank]'),
        qrModalAccount: root.querySelector('[data-qr-modal-account]'),
        qrModalCancel: root.querySelector('[data-qr-modal-cancel]'),
        qrModalRecreate: root.querySelector('[data-qr-modal-recreate]'),
        qrModalConfirm: root.querySelector('[data-qr-modal-confirm]'),
        refundModal: root.querySelector('[data-refund-modal]'),
        refundQty: byId('soLuongHoan'),
        refundReason: byId('lyDoHoan'),
        refundMethod: byId('phuongThucHoan'),
        refundSubmit: root.querySelector('[data-refund-submit]'),
        paymentDocumentsSection: root.querySelector('[data-payment-documents-section]'),
        paymentDocumentList: root.querySelector('[data-payment-document-list]'),
        paymentDocumentCount: root.querySelector('[data-payment-document-count]'),
        paymentInfoTitle: root.querySelector('[data-payment-info-title]'),
        paymentOriginalRow: root.querySelector('[data-payment-original-row]'),
        paymentOriginalLabel: root.querySelector('[data-payment-original-label]'),
        paymentDiscountRow: root.querySelector('[data-payment-discount-row]'),
        paymentDiscountLabel: root.querySelector('[data-payment-discount-label]'),
        paymentFinalRow: root.querySelector('[data-payment-final-row]'),
        paymentFinalLabel: root.querySelector('[data-payment-final-label]'),
        paymentPayerRow: root.querySelector('[data-payment-payer-row]'),
        paymentPayerLabel: root.querySelector('[data-payment-payer-label]'),
        paymentTimeRow: root.querySelector('[data-payment-time-row]'),
        paymentTimeLabel: root.querySelector('[data-payment-time-label]')
    };

    async function loadDoiTuongOrderSetting() {
        try {
            const response = await request(API.doiTuongOrderSetting);

            const giaTri = Number(response?.data?.giaTri);

            state.doiTuongOrderRule = [1, 2, 3, 4, 5, 6].includes(giaTri) ? giaTri : 1;
        } catch (error) {
            console.warn('Không tải được thiết lập thứ tự đối tượng lấy vé.', error);

            state.doiTuongOrderRule = 1;
        }
    }

    async function loadPaymentVisibleSetting() {
        try {
            const response = await request(API.paymentVisibleSetting);

            const value = response?.data?.giaTri;

            const values = Array.isArray(value) ? value : String(value ?? '').split(',');

            const normalized = [
                ...new Set(values.map((item) => Number(item)).filter((item) => [10, 20, 30].includes(item)))
            ];

            state.paymentMethodVisibleValues = normalized.length ? normalized : [10, 20, 30];
        } catch (error) {
            console.warn('Không tải được thiết lập phương thức thanh toán.', error);

            state.paymentMethodVisibleValues = [10, 20, 30];
        }
    }

    function getDoiTuongOrder() {
        const ORDER_MAP = {
            1: [10, 20, 30],
            2: [10, 30, 20],
            3: [20, 10, 30],
            4: [20, 30, 10],
            5: [30, 10, 20],
            6: [30, 20, 10]
        };

        return ORDER_MAP[state.doiTuongOrderRule] || ORDER_MAP[1];
    }

    function getOrderedDoiTuong() {
        const order = getDoiTuongOrder();

        return [...state.doiTuong].sort((a, b) => {
            const aIndex = order.indexOf(Number(a.value));

            const bIndex = order.indexOf(Number(b.value));

            return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        });
    }

    function getEnumLabel(list, value) {
        const item = list.find((current) => Number(current.value) === Number(value));

        return item?.label || item?.name || '';
    }

    function isPhieuStatus(name) {
        return (
            normalizeSearchText(getEnumLabel(state.phieuStatuses, state.phieu?.trangThai)) === normalizeSearchText(name)
        );
    }

    function isPaymentStatus(name) {
        return (
            normalizeSearchText(getEnumLabel(state.paymentStatuses, state.payment?.trangThai)) ===
            normalizeSearchText(name)
        );
    }

    async function loadThucDonNgay() {
        if (!permission.canLoadValidMeals(state.permissions)) {
            state.thucDonNgay = [];
            return;
        }

        const response = await request(`${API.phieu}/thuc-don-ngay-hop-le`);

        state.thucDonNgay = normalizeList(response?.data);
    }

    async function loadEmployees() {
        const response = await request(API.employee);

        state.employees = normalizeList(response?.data).filter((item) => item?.active !== false);
    }

    async function loadEnum(name, assign) {
        const response = await request(`${API.enums}?name=${encodeURIComponent(name)}`);

        assign(normalizeEnum(response?.data));
    }

    function renderOptions() {
        fillSelect(
            el.thucDonNgayId,
            state.thucDonNgay,
            (item) => item.id,
            (item) => {
                const date = formatDate(item.ngay);
                const ca = item.tenCaAn || item.maCaAn || 'Ca ăn';
                const nhaAn = item.tenNhaAn || 'Nhà ăn';
                return `${date} - ${ca} - ${nhaAn}`;
            }
        );

        fillSelect(
            el.doiTuongLayVe,
            getOrderedDoiTuong(),
            (item) => item.value,
            (item) => item.label
        );

        fillSelect(
            el.gioiTinh,
            state.gioiTinh,
            (item) => item.value,
            (item) => item.label
        );

        fillSelect(
            el.discountType,
            state.discountTypes,
            (item) => item.value,
            (item) => item.label
        );

        fillSelect(
            el.nhanVienId,
            state.employees,
            (item) => item.id,
            (item) =>
                [item.maNhanVien || item.ma_nhan_vien, item.hoTen || item.tenNhanVien || item.ho_ten]
                    .filter(Boolean)
                    .join(' - ')
        );

        renderPaymentMethods();
    }

    function setSelectValue(select, value, triggerChange = false) {
        if (!select) {
            return;
        }

        const selected = value === null || value === undefined ? '' : String(value);

        Array.from(select.options || []).forEach((option) => {
            option.selected = option.value === selected;
        });

        select.value = selected;

        const smartSelectRoot = select.closest('[data-smart-select]');

        const smartSelect =
            smartSelectRoot?.smartSelect || (smartSelectRoot && window.MCS?.smartSelect?.initialize?.(smartSelectRoot));

        smartSelect?.refresh?.();

        smartSelect?.setValue?.(selected, false);

        if (triggerChange) {
            select.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );
        }
    }

    function fillSelect(select, items, getValue, getLabel) {
        if (!select) {
            return;
        }

        const current = select.value;
        const firstText = select.options[0]?.textContent || 'Chọn...';

        select.innerHTML = '';

        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = firstText;
        select.appendChild(empty);

        items.forEach((item) => {
            const option = document.createElement('option');
            option.value = String(getValue(item));
            option.textContent = getLabel(item);
            select.appendChild(option);
        });

        if (current && Array.from(select.options).some((option) => option.value === current)) {
            select.value = current;
        }

        const smartRoot =
            select.closest('[data-smart-select]') || select.parentElement?.closest?.('[data-smart-select]');

        const smartSelect = smartRoot?.smartSelect || (smartRoot && window.MCS?.smartSelect?.initialize?.(smartRoot));

        smartSelect?.refresh?.();

        if (current) {
            smartSelect?.setValue?.(current, false);
        }
    }

    function normalizeList(data) {
        if (Array.isArray(data)) {
            return data;
        }

        return data?.items || data?.rows || data?.data || data?.danhSach || [];
    }

    function normalizeEnum(data) {
        return normalizeList(data)
            .map((item) => {
                if (item && typeof item === 'object') {
                    return {
                        ...item,
                        value: item.value ?? item.id ?? item.ma,
                        label: item.label ?? item.name ?? item.ten ?? String(item.value ?? '')
                    };
                }

                return {
                    value: item,
                    label: String(item)
                };
            })
            .filter((item) => item.value !== undefined && item.value !== null);
    }

    async function request(url, method = 'GET', body = undefined) {
        const options = {
            method
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        return await window.MCS.api.request(url, options);
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function formatDate(value) {
        if (!value) {
            return '-';
        }

        const text = String(value).slice(0, 10);
        const parts = text.split('-');

        if (parts.length !== 3) {
            return text;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function formatTime(value) {
        if (!value) {
            return '';
        }

        return String(value).slice(0, 5);
    }

    function formatMoney(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return '-';
        }

        return `${number.toLocaleString('vi-VN', {
            maximumFractionDigits: 5
        })} đ`;
    }

    function nullableText(value) {
        const text = String(value ?? '').trim();
        return text || null;
    }

    function nullableNumber(value) {
        if (value === '' || value === null || value === undefined) {
            return null;
        }

        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function toPositiveInt(value) {
        const number = Number(value);

        return Number.isInteger(number) && number > 0 ? number : null;
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }

    function setLoading(value) {
        root.classList.toggle('is-loading', Boolean(value));
    }

    function showError(error, fallback = 'Thao tác thất bại.') {
        console.error(error);

        window.MCS?.toast?.error?.(error?.message || fallback);
    }

    function confirmAction(title, message, confirmLabel, type, onConfirm) {
        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title,
                message,
                confirmLabel,
                type,
                onConfirm
            });
            return;
        }

        if (window.confirm(message)) {
            onConfirm();
        }
    }

    function showNoPermission() {
        permission.showNoPermission(root);
    }

    function hideNoPermission() {
        permission.hideNoPermission(root);
    }

    Object.assign(app, {
        root,
        permission,
        API,
        DAILY_MEAL_STORAGE_KEY,
        TAKER_TYPE_STORAGE_KEY,
        state,
        el,
        pageContext,
        isExistingPage,
        isCreatePage,
        markPageAsExisting,
        markPageAsCreate,
        loadDoiTuongOrderSetting,
        loadPaymentVisibleSetting,
        getDoiTuongOrder,
        getOrderedDoiTuong,
        getEnumLabel,
        isPhieuStatus,
        isPaymentStatus,
        loadThucDonNgay,
        loadEmployees,
        loadEnum,
        renderOptions,
        setSelectValue,
        fillSelect,
        normalizeList,
        normalizeEnum,
        request,
        byId,
        formatDate,
        formatTime,
        formatMoney,
        nullableText,
        nullableNumber,
        toPositiveInt,
        escapeHtml,
        setLoading,
        showError,
        confirmAction,
        showNoPermission,
        hideNoPermission
    });
})();
