'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const permission = window.LayVeAn?.permission;

    if (!permission || !window.MCS?.pages?.createDataListPage) {
        return;
    }

    const API = {
        ve: '/api/mcs/v1/ct-ve-an',

        phieu: '/api/mcs/v1/nv-phieu-lay-ve-an',

        bulkConfirm: '/api/mcs/v1/ct-ve-an/xac-nhan-su-dung-hang-loat',

        bulkCancel: '/api/mcs/v1/ct-ve-an/huy-hang-loat',

        bulkUnconfirm: '/api/mcs/v1/ct-ve-an/huy-xac-nhan-hang-loat',

        bulkUncancel: '/api/mcs/v1/ct-ve-an/huy-huy-hang-loat'
    };

    const DOI_TUONG = {
        10: 'Nhân viên',
        20: 'Đối tác',
        30: 'Khách'
    };

    let page = null;

    let statuses = [];

    let paymentStatuses = [];

    let pendingCancelRecords = [];

    let pendingCancelMode = null;

    const root = document.querySelector('[data-data-list-page][data-module="xac-nhan-su-dung-ve"]');

    const cancelModal = document.getElementById('veBulkCancelModal');

    const detailModal = document.getElementById('veDetailModal');

    const cancelReason = document.getElementById('lyDoHuyVeHangLoat');

    try {
        [statuses, paymentStatuses] = await Promise.all([loadEnum('trangThaiVe'), loadEnum('trangThaiPhieuThu')]);

        const defaultTicketStatus = getStatusValue('Chưa sử dụng');

        const defaultPaymentStatus = getPaymentStatusValue('Đã thanh toán');

        page = await window.MCS.pages.createDataListPage({
            moduleName: 'xac-nhan-su-dung-ve',

            permission,

            canView: (permissions) => permission.canViewTicketList(permissions),

            pageSize: 20,

            searchId: 'xacNhanSuDungVeSearch',

            searchKeys: [
                'maVe',
                'soPhieu',
                'maNhanVien',
                'tenNhanVien',
                'hoTenNguoiLayVe',
                'tenCoSo',
                'tenNhaAn',
                'tenCaAn',
                'tenThucDon'
            ],

            selectable: true,

            defaultFilters: {
                trangThai: defaultTicketStatus === null ? [] : [defaultTicketStatus],

                trangThaiThanhToan: defaultPaymentStatus === null ? [] : [defaultPaymentStatus]
            },

            getSelectionGroupKey: (record) => Number(record?.trangThai),

            isRowSelectable: (record, permissions) => {
                const unused = getStatusValue('Chưa sử dụng');

                const used = getStatusValue('Đã sử dụng');

                const cancelled = getStatusValue('Đã huỷ') ?? getStatusValue('Đã hủy');

                const status = Number(record?.trangThai);

                if (status === unused) {
                    return permission.canBulkUseTicket(permissions) || permission.canBulkCancelTicket(permissions);
                }

                if (status === used) {
                    return permission.canBulkUnconfirmTicket(permissions);
                }

                if (status === cancelled) {
                    return permission.canBulkUncancelTicket(permissions);
                }

                return false;
            },

            isRowClickable: (record, permissions) => canOperate(record) && permission.canUseTicket(permissions),

            onRowClick: (record) => confirmFromRow(record),

            onSelectionChange: (records) => updateBulkActions(records),

            /*
             * 4 ICON CỐ ĐỊNH:
             * xem / xác nhận / hủy / in
             */
            renderRowActions(record, permissions) {
                const actions = [];

                /*
                 * XEM
                 */
                if (permission.canViewTicketDetail(permissions)) {
                    actions.push(`
                                    <button
                                        type="button"
                                        class="data-list-row-action is-view"
                                        data-ticket-row-action="view"
                                        data-record-id="${Number(record.id)}"
                                        title="Xem chi tiết">

                                        <i class="fa-regular fa-eye"></i>

                                    </button>
                                `);
                }

                /*
                 * XÁC NHẬN
                 *
                 * Có quyền thì luôn render.
                 * Nếu trạng thái không hợp lệ
                 * thì disable để vẫn giữ vị trí icon.
                 */
                if (permission.canUseTicket(permissions)) {
                    actions.push(`
                                    <button
                                        type="button"
                                        class="data-list-row-action is-confirm"
                                        data-ticket-row-action="confirm"
                                        data-record-id="${Number(record.id)}"
                                        title="Xác nhận sử dụng"
                                        ${canOperate(record) ? '' : 'disabled'}>

                                        <i class="fa-solid fa-check"></i>

                                    </button>
                                `);
                }

                /*
                 * HỦY
                 */
                if (permission.canCancelTicket(permissions)) {
                    actions.push(`
                                    <button
                                        type="button"
                                        class="data-list-row-action is-cancel"
                                        data-ticket-row-action="cancel"
                                        data-record-id="${Number(record.id)}"
                                        title="Hủy vé"
                                        ${canOperate(record) ? '' : 'disabled'}>

                                        <i class="fa-solid fa-ban"></i>

                                    </button>
                                `);
                }

                /*
                 * IN
                 */
                if (permission.canPrint(permissions)) {
                    actions.push(`
                                    <button
                                        type="button"
                                        class="data-list-row-action is-print"
                                        data-ticket-row-action="print"
                                        data-record-id="${Number(record.id)}"
                                        title="In vé">

                                        <i class="fa-solid fa-print"></i>

                                    </button>
                                `);
                }

                return `
                                <div class="data-list-row-actions">
                                    ${actions.join('')}
                                </div>
                            `;
            },

            formatCell(column, value, record) {
                switch (column.key) {
                    case 'nguoiLayVe':
                        return record.tenNhanVien || record.hoTenNguoiLayVe || '-';

                    case 'doiTuongLayVe':
                        return DOI_TUONG[Number(value)] || '-';

                    case 'khungGio':
                        return formatMealTime(record);

                    case 'trangThai':
                        return renderStatus(record);

                    default:
                        return formatCommon(column.type, value);
                }
            },

            getSummary(records) {
                const unused = getStatusValue('Chưa sử dụng');

                const used = getStatusValue('Đã sử dụng');

                return {
                    total: records.length,

                    unused: records.filter((record) => Number(record.trangThai) === unused).length,

                    used: records.filter((record) => Number(record.trangThai) === used).length
                };
            }
        });

        if (!page) {
            return;
        }

        bindPageActions();

        updateBulkActions([]);
    } catch (error) {
        console.error(error);

        window.MCS?.toast?.error(error?.message || 'Không thể khởi tạo danh sách xác nhận sử dụng vé.');
    }

    function bindPageActions() {
        const confirmBulk = root?.querySelector('[data-list-bulk-action="confirm"]');

        const cancelBulk = root?.querySelector('[data-list-bulk-action="cancel"]');

        const unconfirmBulk = root?.querySelector('[data-list-bulk-action="unconfirm"]');

        const uncancelBulk = root?.querySelector('[data-list-bulk-action="uncancel"]');

        /*
         * Xác nhận hàng loạt:
         * KHÔNG hỏi lại.
         */
        confirmBulk?.addEventListener('click', confirmSelected);

        cancelBulk?.addEventListener('click', openCancelSelected);

        unconfirmBulk?.addEventListener('click', unconfirmSelected);

        uncancelBulk?.addEventListener('click', uncancelSelected);

        root?.addEventListener('click', async (event) => {
            const button = event.target.closest('[data-ticket-row-action]');

            if (!button || button.disabled) {
                return;
            }

            const id = Number(button.dataset.recordId);

            const record = page.state.allData.find((item) => Number(item.id) === id);

            if (!record) {
                return;
            }

            switch (button.dataset.ticketRowAction) {
                case 'view':
                    await openDetail(record.id);

                    break;

                case 'confirm':
                    await confirmDirect(record);

                    break;

                case 'cancel':
                    openCancelRecords([record], 'single');

                    break;

                case 'print':
                    await printRecord(record);

                    break;
            }
        });

        cancelModal
            ?.querySelectorAll('[data-ticket-cancel-close]')
            .forEach((button) => button.addEventListener('click', closeCancelModal));

        cancelModal?.querySelector('[data-ticket-cancel-submit]')?.addEventListener('click', submitCancelSelected);

        detailModal
            ?.querySelectorAll('[data-ticket-detail-close]')
            .forEach((button) => button.addEventListener('click', closeDetail));
    }

    function canOperate(record) {
        const unused = getStatusValue('Chưa sử dụng');

        return unused !== null && Number(record?.trangThai) === unused;
    }

    /*
     * ==========================================
     * CLICK LINE
     * ==========================================
     */

    function confirmFromRow(record) {
        if (!record?.qrToken) {
            window.MCS?.toast?.error('Vé không có QR token để xác nhận.');

            return;
        }

        window.MCS?.confirm?.show({
            title: 'Xác nhận sử dụng vé',

            message: `Xác nhận sử dụng vé ${record.maVe || ''}?`,

            confirmLabel: 'Xác nhận',

            type: 'primary',

            onConfirm: async () => confirmDirect(record)
        });
    }

    /*
     * ==========================================
     * ICON XÁC NHẬN
     * KHÔNG HIỆN CONFIRM
     * ==========================================
     */

    async function confirmDirect(record) {
        if (!record?.qrToken) {
            window.MCS?.toast?.error('Vé không có QR token để xác nhận.');

            return;
        }

        try {
            page.setLoading(true);

            const response = await window.MCS.api.request(`${API.ve}/xac-nhan-su-dung`, {
                method: 'POST',

                body: JSON.stringify({
                    qrToken: record.qrToken
                })
            });

            window.MCS?.toast?.success(response?.message || 'Xác nhận sử dụng vé thành công.');

            await page.reload();
        } catch (error) {
            window.MCS?.toast?.error(error?.message || 'Không thể xác nhận sử dụng vé.');
        } finally {
            page.setLoading(false);
        }
    }

    function updateBulkActions(records) {
        const selectedRecords = Array.isArray(records) ? records : [];

        const buttons = {
            confirm: root?.querySelector('[data-list-bulk-action="confirm"]'),

            unconfirm: root?.querySelector('[data-list-bulk-action="unconfirm"]'),

            cancel: root?.querySelector('[data-list-bulk-action="cancel"]'),

            uncancel: root?.querySelector('[data-list-bulk-action="uncancel"]')
        };

        Object.values(buttons).forEach((button) => {
            if (!button) {
                return;
            }

            button.hidden = true;

            button.disabled = true;
        });

        if (selectedRecords.length === 0) {
            return;
        }

        const count = selectedRecords.length;

        const status = Number(selectedRecords[0]?.trangThai);

        const unused = getStatusValue('Chưa sử dụng');

        const used = getStatusValue('Đã sử dụng');

        const cancelled = getStatusValue('Đã huỷ') ?? getStatusValue('Đã hủy');

        if (status === unused) {
            showBulkButton(buttons.confirm, permission.canBulkUseTicket(page.state.permissions), `Xác nhận (${count})`);

            showBulkButton(buttons.cancel, permission.canBulkCancelTicket(page.state.permissions), `Hủy (${count})`);

            return;
        }

        if (status === used) {
            showBulkButton(
                buttons.unconfirm,
                permission.canBulkUnconfirmTicket(page.state.permissions),
                `Hủy xác nhận (${count})`
            );

            return;
        }

        if (status === cancelled) {
            showBulkButton(
                buttons.uncancel,
                permission.canBulkUncancelTicket(page.state.permissions),
                `Hủy hủy (${count})`
            );
        }
    }

    function showBulkButton(button, allowed, label) {
        if (!button || !allowed) {
            return;
        }

        button.hidden = false;

        button.disabled = false;

        const labelElement = button.querySelector('[data-list-bulk-label]');

        if (labelElement) {
            labelElement.textContent = label;
        }
    }

    async function confirmSelected() {
        const records = page.getSelectedRecords().filter(canOperate);

        if (!records.length) {
            window.MCS?.toast?.error('Vui lòng chọn ít nhất một vé chưa sử dụng.');

            return;
        }

        await executeBulkConfirm(records);
    }

    async function executeBulkConfirm(records) {
        try {
            page.setLoading(true);

            const response = await window.MCS.api.request(API.bulkConfirm, {
                method: 'POST',

                body: JSON.stringify({
                    ids: records.map((record) => Number(record.id))
                })
            });

            const result = response?.data || {};

            const success = Number(result.soThanhCong || 0);

            const failed = Number(result.soThatBai || 0);

            if (success > 0) {
                window.MCS?.toast?.success(`Đã xác nhận ${success} vé.`);
            }

            if (failed > 0) {
                window.MCS?.toast?.error(`${failed} vé xác nhận không thành công.`);
            }

            page.clearSelection();

            await page.reload();
        } catch (error) {
            window.MCS?.toast?.error(error?.message || 'Không thể xác nhận các vé đã chọn.');
        } finally {
            page.setLoading(false);
        }
    }

    async function unconfirmSelected() {
        const used = getStatusValue('Đã sử dụng');

        const records = page.getSelectedRecords().filter((record) => Number(record.trangThai) === used);

        if (!records.length) {
            return;
        }

        await executeSimpleBulkAction(records, API.bulkUnconfirm, 'Hủy xác nhận');
    }

    async function uncancelSelected() {
        const cancelled = getStatusValue('Đã huỷ') ?? getStatusValue('Đã hủy');

        const records = page.getSelectedRecords().filter((record) => Number(record.trangThai) === cancelled);

        if (!records.length) {
            return;
        }

        await executeSimpleBulkAction(records, API.bulkUncancel, 'Hủy hủy');
    }

    async function executeSimpleBulkAction(records, endpoint, actionLabel) {
        try {
            page.setLoading(true);

            const response = await window.MCS.api.request(endpoint, {
                method: 'PATCH',

                body: JSON.stringify({
                    ids: records.map((record) => Number(record.id))
                })
            });

            const result = response?.data || {};

            const success = Number(result.soThanhCong || 0);

            const failed = Number(result.soThatBai || 0);

            if (success > 0) {
                window.MCS?.toast?.success(`${actionLabel} thành công ${success} vé.`);
            }

            if (failed > 0) {
                window.MCS?.toast?.error(`${failed} vé xử lý không thành công.`);
            }

            page.clearSelection();

            await page.reload();
        } catch (error) {
            window.MCS?.toast?.error(error?.message || `Không thể ${actionLabel.toLowerCase()} các vé đã chọn.`);
        } finally {
            page.setLoading(false);
        }
    }

    function openCancelSelected() {
        const records = page.getSelectedRecords().filter(canOperate);

        if (!records.length) {
            window.MCS?.toast?.error('Vui lòng chọn ít nhất một vé chưa sử dụng.');

            return;
        }

        openCancelRecords(records, 'bulk');
    }

    function openCancelRecords(records, mode) {
        pendingCancelRecords = [...records];

        pendingCancelMode = mode;

        if (cancelReason) {
            cancelReason.value = '';
        }

        window.MCS?.modal?.open(cancelModal);
    }

    function closeCancelModal() {
        pendingCancelRecords = [];

        pendingCancelMode = null;

        window.MCS?.modal?.close(cancelModal);
    }

    async function submitCancelSelected() {
        const reason = String(cancelReason?.value || '').trim();

        if (!reason) {
            window.MCS?.toast?.error('Vui lòng nhập lý do hủy.');

            cancelReason?.focus();

            return;
        }

        if (reason.length > 500) {
            window.MCS?.toast?.error('Lý do hủy không được vượt quá 500 ký tự.');

            return;
        }

        const records = [...pendingCancelRecords];

        const mode = pendingCancelMode;

        if (!records.length || !mode) {
            return;
        }

        closeCancelModal();

        try {
            page.setLoading(true);

            /*
             * HỦY TỪ ICON TỪNG DÒNG.
             */
            if (mode === 'single') {
                const record = records[0];

                const response = await window.MCS.api.request(`${API.ve}/huy/${record.id}`, {
                    method: 'PATCH',

                    body: JSON.stringify({
                        lyDoHuy: reason
                    })
                });

                window.MCS?.toast?.success(response?.message || 'Hủy vé thành công.');
            }

            /*
             * HỦY TỪ CHECKBOX.
             */
            else if (mode === 'bulk') {
                const response = await window.MCS.api.request(API.bulkCancel, {
                    method: 'PATCH',

                    body: JSON.stringify({
                        ids: records.map((record) => Number(record.id)),

                        lyDoHuy: reason
                    })
                });

                const result = response?.data || {};

                const success = Number(result.soThanhCong || 0);

                const failed = Number(result.soThatBai || 0);

                if (success > 0) {
                    window.MCS?.toast?.success(`Đã hủy ${success} vé.`);
                }

                if (failed > 0) {
                    window.MCS?.toast?.error(`${failed} vé hủy không thành công.`);
                }
            }

            page.clearSelection();

            await page.reload();
        } catch (error) {
            window.MCS?.toast?.error(error?.message || 'Không thể hủy vé.');
        } finally {
            page.setLoading(false);
        }
    }

    async function openDetail(id) {
        try {
            const response = await window.MCS.api.request(`${API.ve}/${id}`);

            const record = response?.data;

            if (!record) {
                return;
            }

            setDetail('[data-detail-ma-ve]', record.maVe);

            setDetail('[data-detail-so-phieu]', record.soPhieu);

            setDetail('[data-detail-nguoi-lay-ve]', record.tenNhanVien || record.hoTenNguoiLayVe);

            setDetail('[data-detail-trang-thai]', getEnumLabel(statuses, record.trangThai));

            setDetail('[data-detail-trang-thai-thanh-toan]', getEnumLabel(paymentStatuses, record.trangThaiThanhToan));

            setDetail('[data-detail-co-so]', record.tenCoSo);

            setDetail('[data-detail-nha-an]', record.tenNhaAn);

            setDetail('[data-detail-ca-an]', record.tenCaAn);

            setDetail('[data-detail-ngay]', formatDate(record.ngay));

            setDetail('[data-detail-thuc-don]', record.tenThucDon);

            setDetail('[data-detail-thoi-gian-tao]', formatDateTime(record.createdAt));

            setDetail('[data-detail-thoi-gian-thanh-toan]', formatDateTime(record.thoiGianThanhToan));

            window.MCS?.modal?.open(detailModal);
        } catch (error) {
            window.MCS?.toast?.error(error?.message || 'Không thể tải chi tiết vé.');
        }
    }

    function closeDetail() {
        window.MCS?.modal?.close(detailModal);
    }

    function setDetail(selector, value) {
        const element = detailModal?.querySelector(selector);

        if (element) {
            element.textContent = value === null || value === undefined || value === '' ? '-' : String(value);
        }
    }

    /*
     * ==========================================
     * IN
     * ==========================================
     */

    async function printRecord(record) {
        if (!record?.phieuLayVeId) {
            window.MCS?.toast?.error('Không xác định được phiếu lấy vé.');

            return;
        }

        if (!window.MCS?.reportPrint?.print) {
            window.MCS?.toast?.error('Chức năng in báo cáo chưa được khởi tạo.');

            return;
        }

        try {
            page.setLoading(true);

            await window.MCS.reportPrint.print(`${API.phieu}/in-ve/${record.phieuLayVeId}`);
        } catch (error) {
            window.MCS?.toast?.error(error?.message || 'Không thể in vé ăn.');
        } finally {
            page.setLoading(false);
        }
    }

    async function loadEnum(name) {
        const response = await window.MCS.api.request(`/api/mcs/v1/enums?name=${encodeURIComponent(name)}`);

        return normalizeList(response?.data);
    }

    function getEnumLabel(items, value) {
        const item = items.find((current) => Number(current?.value) === Number(value));

        return item?.name || item?.label || '-';
    }

    function getStatusValue(name) {
        const target = normalizeText(name);

        const item = statuses.find((current) => normalizeText(current?.name || current?.label) === target);

        const value = Number(item?.value);

        return Number.isFinite(value) ? value : null;
    }

    function getPaymentStatusValue(name) {
        const target = normalizeText(name);

        const item = paymentStatuses.find((current) => normalizeText(current?.name || current?.label) === target);

        const value = Number(item?.value);

        return Number.isFinite(value) ? value : null;
    }

    function renderStatus(record) {
        const label = getEnumLabel(statuses, record?.trangThai);

        const unused = getStatusValue('Chưa sử dụng');

        const used = getStatusValue('Đã sử dụng');

        const cancelled = getStatusValue('Đã huỷ') ?? getStatusValue('Đã hủy');

        if (Number(record?.trangThai) === unused) {
            return badge(label, 'warning', 'fa-regular fa-clock');
        }

        if (Number(record?.trangThai) === used) {
            return badge(label, 'success', 'fa-regular fa-circle-check');
        }

        if (Number(record?.trangThai) === cancelled) {
            return badge(label, 'danger', 'fa-solid fa-ban');
        }

        return badge(label, 'muted', 'fa-solid fa-circle-minus');
    }

    function badge(text, theme, icon) {
        return {
            html: `<span class="data-list-badge data-list-badge--${theme}">
                        <i class="${icon}"></i>
                        ${escapeHtml(text)}
                    </span>`
        };
    }

    function formatMealTime(record) {
        const start = String(record?.thoiGianBatDau || '').slice(0, 5);

        const end = String(record?.thoiGianKetThuc || '').slice(0, 5);

        if (!start && !end) {
            return '-';
        }

        return `${start || '--:--'} - ${end || '--:--'}`;
    }

    function formatCommon(type, value) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        if (type === 'date') {
            return formatDate(value);
        }

        if (type === 'datetime') {
            return formatDateTime(value);
        }

        return String(value);
    }

    function formatDate(value) {
        if (!value) {
            return '-';
        }

        const text = String(value).slice(0, 10);

        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

        return match ? `${match[3]}/${match[2]}/${match[1]}` : text;
    }

    function formatDateTime(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        const pad = (number) => String(number).padStart(2, '0');

        return (
            `${pad(date.getHours())}:` +
            `${pad(date.getMinutes())}:` +
            `${pad(date.getSeconds())} ` +
            `${pad(date.getDate())}/` +
            `${pad(date.getMonth() + 1)}/` +
            `${date.getFullYear()}`
        );
    }

    function normalizeList(data) {
        if (Array.isArray(data)) {
            return data;
        }

        return data?.items || data?.rows || data?.data || data?.danhSach || [];
    }

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
});
