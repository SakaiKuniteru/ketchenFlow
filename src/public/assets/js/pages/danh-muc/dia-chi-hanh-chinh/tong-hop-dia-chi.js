'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const API_BASE = '/api/mcs/v1/dm-dia-chi';

    const catalog = await window.MCS.pages.createCatalogPage({
        moduleName: 'tong-hop-dia-chi',
        permissionCodes: {
            view: 'Q000510'
        },
        viewOnly: true,
        detailTitle: 'Thông tin địa chỉ hành chính',

        columns: [
            {
                key: 'maDiaChi',
                label: 'Mã địa chỉ',
                width: '140px',
                sortable: true,
                filterable: true
            },
            {
                key: 'tenDiaChi',
                label: 'Tên địa chỉ',
                width: '240px',
                sortable: true,
                filterable: true
            },
            {
                key: 'tenQuocGia',
                label: 'Tên quốc gia',
                width: '180px',
                sortable: true,
                filterable: true
            },
            {
                key: 'tenTiengAnh',
                label: 'Tên tiếng Anh',
                width: '200px',
                sortable: true,
                filterable: true
            },
            {
                key: 'quocGiaTenVietTat',
                label: 'Tên viết tắt QG',
                width: '160px',
                sortable: true,
                filterable: true
            },
            {
                key: 'maIso2',
                label: 'ISO2',
                width: '90px',
                sortable: true,
                filterable: true
            },
            {
                key: 'maIso3',
                label: 'ISO3',
                width: '90px',
                sortable: true,
                filterable: true
            },
            {
                key: 'tenTinhThanh',
                label: 'Tên Tỉnh/TP',
                width: '190px',
                sortable: true,
                filterable: true
            },
            {
                key: 'tinhThanhTenVietTat',
                label: 'Tên viết tắt Tỉnh/TP',
                width: '190px',
                sortable: true,
                filterable: true
            },
            {
                key: 'tenXaPhuong',
                label: 'Tên Xã/Phường',
                width: '190px',
                sortable: true,
                filterable: true
            },
            {
                key: 'xaPhuongTenVietTat',
                label: 'Tên viết tắt Xã/Phường',
                width: '190px',
                sortable: true,
                filterable: true
            }
        ],

        mapListResponse(response) {
            const records = Array.isArray(response?.data) ? response.data : [];

            return records.map((record) => mapAddressRecord(record));
        },

        mapRecordToForm(record) {
            return mapAddressRecordToForm(record);
        },

        getRecordSubtitle(record) {
            return record?.maDiaChi || '';
        },

        toolbarActions: [
            {
                action: 'filter',
                label: 'Tìm kiếm chi tiết',
                icon: 'search'
            },
            {
                action: 'export-tong-hop-dia-chi',
                label: 'Xuất danh mục địa chỉ tổng hợp',
                icon: 'download'
            }
        ],

        onAction(action, id, catalogInstance) {
            if (action === 'export-tong-hop-dia-chi') {
                exportData();
                return;
            }
        }
    });

    async function exportData() {
        try {
            const result = await window.MCS.api.requestFile(`${API_BASE}/xuat-du-lieu`, {
                method: 'GET'
            });

            window.MCS.api.downloadBlob(result.blob, result.fileName || 'tong_hop_dia_chi_hanh_chinh.xlsx');

            window.MCS.toast?.success('Xuất dữ liệu thành công.');
        } catch (error) {
            console.error('Xuất dữ liệu địa chỉ hành chính thất bại:', error);

            window.MCS.toast?.error(error?.message || 'Xuất dữ liệu thất bại.');
        }
    }

    return catalog;
});

function mapAddressRecord(record) {
    if (!record || typeof record !== 'object') {
        return {};
    }

    const quocGia = record.quocGia || {};
    const tinhThanh = record.tinhThanh || {};
    const xaPhuong = record.xaPhuong || {};

    return {
        ...record,

        maDiaChi:
            record.maDiaChi ||
            xaPhuong.ma ||
            xaPhuong.maXaPhuong ||
            tinhThanh.ma ||
            tinhThanh.maTinhThanh ||
            quocGia.ma ||
            quocGia.maQuocGia ||
            '',

        tenDiaChi:
            record.tenDiaChi ||
            record.diaChiDayDu ||
            xaPhuong.ten ||
            xaPhuong.tenXaPhuong ||
            tinhThanh.ten ||
            tinhThanh.tenTinhThanh ||
            quocGia.ten ||
            quocGia.tenQuocGia ||
            '',

        maQuocGia: record.maQuocGia || quocGia.ma || quocGia.maQuocGia || '',

        tenQuocGia: record.tenQuocGia || quocGia.ten || quocGia.tenQuocGia || '',

        tenTiengAnh: record.tenTiengAnh || quocGia.tenTiengAnh || '',

        quocGiaTenVietTat: record.quocGiaTenVietTat || record.tenVietTatQuocGia || quocGia.tenVietTat || '',

        maIso2: record.maIso2 || quocGia.maIso2 || '',

        maIso3: record.maIso3 || quocGia.maIso3 || '',

        maDienThoai: record.maDienThoai || quocGia.maDienThoai || '',

        maTinhThanh: record.maTinhThanh || tinhThanh.ma || tinhThanh.maTinhThanh || '',

        tenTinhThanh: record.tenTinhThanh || tinhThanh.ten || tinhThanh.tenTinhThanh || '',

        tinhThanhTenVietTat: record.tinhThanhTenVietTat || record.tenVietTatTinhThanh || tinhThanh.tenVietTat || '',

        maXaPhuong: record.maXaPhuong || xaPhuong.ma || xaPhuong.maXaPhuong || '',

        tenXaPhuong: record.tenXaPhuong || xaPhuong.ten || xaPhuong.tenXaPhuong || '',

        xaPhuongTenVietTat: record.xaPhuongTenVietTat || record.tenVietTatXaPhuong || xaPhuong.tenVietTat || '',

        diaChiDayDu: record.diaChiDayDu || record.tenDiaChi || '',

        quocGiaActive: quocGia.active !== false,

        tinhThanhActive: tinhThanh.active !== false,

        xaPhuongActive: xaPhuong.active !== false,

        active: record.active !== false
    };
}

function mapAddressRecordToForm(record) {
    const data = mapAddressRecord(record);

    return {
        id: data.id || null,

        maQuocGia: data.maQuocGia || '',

        tenQuocGia: data.tenQuocGia || '',

        tenTiengAnh: data.tenTiengAnh || '',

        tenVietTatQuocGia: data.quocGiaTenVietTat || '',

        maIso2: data.maIso2 || '',

        maIso3: data.maIso3 || '',

        maDienThoai: data.maDienThoai || '',

        maTinhThanh: data.maTinhThanh || '',

        tenTinhThanh: data.tenTinhThanh || '',

        tenVietTatTinhThanh: data.tinhThanhTenVietTat || '',

        maXaPhuong: data.maXaPhuong || '',

        tenXaPhuong: data.tenXaPhuong || '',

        tenVietTatXaPhuong: data.xaPhuongTenVietTat || '',

        diaChiDayDu: data.diaChiDayDu || '',

        quocGiaActive: data.quocGiaActive,

        tinhThanhActive: data.tinhThanhActive,

        xaPhuongActive: data.xaPhuongActive
    };
}
