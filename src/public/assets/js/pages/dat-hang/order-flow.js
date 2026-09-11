'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-order-page]');
    if (!root || !MCS.storage.getAccessToken()) return;
    try {
        await MCS.orders.initialize();
        const page = root.dataset.orderPage;
        if (['catalog', 'delivery', 'confirmation'].includes(page)) await MCS.orders[page]();
        else await MCS.orders.ordersPage(page);
    } catch (error) {
        MCS.orders.mount(root, 'dung-chung', {
            type: 'empty',
            title: 'Không thể tải trang đặt hàng',
            description: error.message,
            retry: true
        });
        root.querySelector('[data-retry]')?.addEventListener('click', () => location.reload());
    }
});
