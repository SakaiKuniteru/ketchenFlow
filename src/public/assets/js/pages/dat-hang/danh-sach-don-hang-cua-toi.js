'use strict';

(() => {
    const C = MCS.orders;

    C.pages['my-orders'] =
        async function initDanhSachDonHangCuaToi() {
            C.instances.myOrders =
                await C.createOrderListPage({
                    management: false
                });
        };
})();