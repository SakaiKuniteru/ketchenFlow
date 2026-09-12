'use strict';

(() => {
    const C = MCS.orders;

    C.pages.completed =
        async function initHoanTatDonHang() {
            C.instances.completed =
                await C.createOrderDetailPage({
                    management: false,
                    completed: true
                });
        };
})();