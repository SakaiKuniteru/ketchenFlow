'use strict';

(() => {
    const C = MCS.orders;

    C.pages.management =
        async function initNhanDonHang() {
            C.instances.management =
                await C.createOrderListPage({
                    management: true
                });
        };
})();