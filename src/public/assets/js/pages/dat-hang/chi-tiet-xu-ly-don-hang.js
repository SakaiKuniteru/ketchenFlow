'use strict';

(() => {
    const C = MCS.orders;

    C.pages['management-detail'] =
        async function initChiTietXuLyDonHang() {
            C.instances.managementDetail =
                await C.createOrderDetailPage({
                    management: true,
                    completed: false
                });
        };
})();