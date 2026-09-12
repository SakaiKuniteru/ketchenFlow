'use strict';

(() => {
    const C = MCS.orders;

    C.pages['my-order-detail'] =
        async function initChiTietDonHangCuaToi() {
            C.instances.myOrderDetail =
                await C.createOrderDetailPage({
                    management: false,
                    completed: false
                });
        };
})();