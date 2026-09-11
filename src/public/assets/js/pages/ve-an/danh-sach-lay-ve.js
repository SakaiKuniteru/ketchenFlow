'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const permission = window.LayVeAn?.permission;

    if (!permission || !window.MCS?.pages?.createDataListPage) {
        return;
    }

    const root = document.querySelector('[data-data-list-page][data-module="danh-sach-lay-ve"]');

    const permissions = await permission.load();

    if (!permission.canAccessListPage(permissions)) {
        permission.showNoPermission(root);
        return;
    }

    permission.hideNoPermission(root);

    const DOI_TUONG = {
        10: 'Nhân viên',
        20: 'Đối tác',
        30: 'Khách'
    };

    const PAYMENT_METHOD = {
        10: 'Tiền mặt',
        20: 'Chuyển khoản',
        30: 'QR Code'
    };

    await window.MCS.pages.createDataListPage({
        moduleName: 'danh-sach-lay-ve',
        permission,
        canView: () => true,
        canCreate: (currentPermissions) => permission.canAccessTakePage(currentPermissions),
        pageSize: 20,
        searchId: 'layVeListSearch',
        searchKeys: [
            'soPhieu',
            'maNhanVien',
            'tenNhanVien',
            'hoTenNguoiLayVe',
            'tenCoSo',
            'tenNhaAn',
            'tenCaAn',
            'tenThucDon'
        ],

        onCreate() {
            window.location.href = '/ve-an/lay-ve-an';
        },

        getRowUrl(record) {
            if (!permission.canViewPhieu(permissions)) {
                return '';
            }

            return record?.id ? `/ve-an/lay-ve-an/${record.id}` : '';
        },

        formatCell(column, value, record) {
            switch (column.key) {
                case 'nguoiLayVe':
                    return record.tenNhanVien || record.hoTenNguoiLayVe || '-';

                case 'doiTuongLayVe':
                    return DOI_TUONG[Number(value)] || '-';

                case 'phuongThucThanhToan':
                    return PAYMENT_METHOD[Number(value)] || '-';

                case 'trangThai':
                    return renderPaymentStatus(record);

                case 'trangThaiSuDung':
                    return renderUsageStatus(record);

                default:
                    return formatCommon(column.type, value);
            }
        },

        getSummary(records) {
            const total = records.reduce((sum, item) => sum + Number(item.soLuong || 0), 0);

            const paid = records.reduce(
                (sum, item) => (Number(item.trangThai) === 40 ? sum + Number(item.soLuong || 0) : sum),
                0
            );

            return {
                total,
                paid,
                unpaid: Math.max(total - paid, 0)
            };
        },

        onExport(records) {
            exportCsv(records);
        }
    });

    function renderPaymentStatus(record) {
        const status = Number(record?.trangThai);

        if (status === 40) {
            return badge('Đã thanh toán', 'success', 'fa-regular fa-circle-check');
        }

        if (status === 50) {
            return badge('Đã hủy', 'muted', 'fa-solid fa-ban');
        }

        if (status === 60) {
            return badge('Đã hoàn', 'warning', 'fa-solid fa-arrow-rotate-left');
        }

        return badge('Chưa thanh toán', 'danger', 'fa-regular fa-circle-xmark');
    }

    function renderUsageStatus(record) {
        if (
            record?.trangThaiSuDung === null ||
            record?.trangThaiSuDung === undefined ||
            record?.trangThaiSuDung === ''
        ) {
            return '-';
        }

        const status = Number(record.trangThaiSuDung);

        if (status === 20) {
            return badge('Đã sử dụng', 'success', 'fa-regular fa-circle-check');
        }

        if (status === 30) {
            return badge('Đã hủy', 'muted', 'fa-solid fa-ban');
        }

        return badge('Chưa sử dụng', 'warning', 'fa-regular fa-clock');
    }

    function badge(label, type, iconClass) {
        return {
            html: `
                <span class="data-list-badge data-list-badge--${type}">
                    <i
                        class="${iconClass}"
                        aria-hidden="true">
                    </i>

                    ${escapeHtml(label)}
                </span>
            `
        };
    }

    function formatCommon(type, value) {
        if (value === null || value === undefined || value === '') {
            return '-';
        }

        if (type === 'money') {
            const number = Number(value);

            return Number.isFinite(number) ? `${number.toLocaleString('vi-VN', { maximumFractionDigits: 5 })} đ` : '-';
        }

        if (type === 'date') {
            const text = String(value).slice(0, 10);
            const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);

            return match ? `${match[3]}/${match[2]}/${match[1]}` : text;
        }

        if (type === 'datetime') {
            const date = new Date(value);

            if (Number.isNaN(date.getTime())) {
                return '-';
            }

            const pad = (number) => String(number).padStart(2, '0');

            return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())} ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
        }

        return String(value);
    }

    function exportCsv(records) {
        const rows = [
            [
                'Mã phiếu',
                'Người lấy vé',
                'Đối tượng',
                'Cơ sở',
                'Nhà ăn',
                'Ca ăn',
                'Ngày sử dụng',
                'Số lượng',
                'Tiền gốc',
                'Tiền miễn giảm',
                'Thành tiền'
            ],
            ...records.map((item) => [
                item.soPhieu || '',
                item.tenNhanVien || item.hoTenNguoiLayVe || '',
                DOI_TUONG[Number(item.doiTuongLayVe)] || '',
                item.tenCoSo || '',
                item.tenNhaAn || '',
                item.tenCaAn || '',
                formatCommon('date', item.ngay),
                item.soLuong || 0,
                item.tienGoc || 0,
                item.tongMienGiam || 0,
                item.thanhTien || 0
            ])
        ];

        const csv = rows.map((row) => row.map(csvCell).join(',')).join('\n');

        const blob = new Blob(['\ufeff', csv], {
            type: 'text/csv;charset=utf-8'
        });

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = 'danh-sach-lay-ve.csv';
        link.click();

        URL.revokeObjectURL(url);
    }

    function csvCell(value) {
        const text = String(value ?? '').replaceAll('"', '""');

        return `"${text}"`;
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
