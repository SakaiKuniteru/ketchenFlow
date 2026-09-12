'use strict';

(() => {
    const base =
        '/assets/js/pages/dat-hang';

    const pageScripts = {
        catalog:
            `${base}/dat-mon.js`,

        delivery:
            `${base}/thong-tin-nhan-hang.js`,

        confirmation:
            `${base}/xac-nhan-don-hang.js`,

        completed:
            `${base}/hoan-tat-don-hang.js`,

        'my-orders':
            `${base}/danh-sach-don-hang-cua-toi.js`,

        'my-order-detail':
            `${base}/chi-tiet-don-hang-cua-toi.js`,

        management:
            `${base}/nhan-don-hang.js`,

        'management-detail':
            `${base}/chi-tiet-xu-ly-don-hang.js`
    };

    const commonScripts = {
        checkout:
            `${base}/common/checkout-common.js`,

        detail:
            `${base}/common/order-detail.js`,

        list:
            `${base}/common/order-list.factory.js`,

        pagination:
            '/assets/js/catalog/pagination.js'
    };

    const loading =
        new Map();

    function loadScript(src) {
        if (loading.has(src)) {
            return loading.get(src);
        }

        const existing =
            [...document.scripts]
                .find((script) => {
                    if (!script.src) {
                        return false;
                    }

                    return new URL(
                        script.src,
                        location.origin
                    ).pathname === src;
                });

        if (existing) {
            return Promise.resolve();
        }

        const promise =
            new Promise(
                (
                    resolve,
                    reject
                ) => {
                    const script =
                        document.createElement(
                            'script'
                        );

                    script.src = src;
                    script.defer = true;

                    script.onload =
                        resolve;

                    script.onerror =
                        () => {
                            loading.delete(
                                src
                            );

                            reject(
                                new Error(
                                    `Không tải được ${src}.`
                                )
                            );
                        };

                    document.head
                        .appendChild(
                            script
                        );
                }
            );

        loading.set(
            src,
            promise
        );

        return promise;
    }

    async function loadDependencies(
        page
    ) {
        if (
            !window.MCS?.orders
                ?.initialize
        ) {
            await loadScript(
                `${base}/core.js`
            );
        }

        if (
            [
                'catalog',
                'my-orders',
                'management'
            ].includes(page) &&
            !window.MCS
                ?.catalog
                ?.Pagination
        ) {
            await loadScript(
                commonScripts.pagination
            );
        }

        if (
            [
                'delivery',
                'confirmation'
            ].includes(page)
        ) {
            await loadScript(
                commonScripts.checkout
            );
        }

        if (
            [
                'completed',
                'my-order-detail',
                'management',
                'management-detail'
            ].includes(page)
        ) {
            await loadScript(
                commonScripts.detail
            );
        }

        if (
            [
                'my-orders',
                'management'
            ].includes(page)
        ) {
            if (
                !window.MCS.orders
                    .createOrderDetailController
            ) {
                await loadScript(
                    commonScripts.detail
                );
            }

            await loadScript(
                commonScripts.list
            );
        }
    }

    async function bootstrap() {
        const root =
            document.querySelector(
                '[data-order-page]'
            );

        if (
            !root ||
            !MCS.storage
                .getAccessToken()
        ) {
            return;
        }

        const page =
            root.dataset.orderPage;

        try {
            await loadDependencies(
                page
            );

            const pageScript =
                pageScripts[page];

            if (!pageScript) {
                throw new Error(
                    `Chưa cấu hình JavaScript cho trang "${page}".`
                );
            }

            await loadScript(
                pageScript
            );

            await MCS.orders
                .initialize();

            const initializePage =
                MCS.orders
                    .pages?.[page];

            if (
                typeof initializePage !==
                'function'
            ) {
                throw new Error(
                    `Không tìm thấy hàm khởi tạo trang "${page}".`
                );
            }

            await initializePage({
                root
            });
        } catch (error) {
            console.error(
                `Không thể khởi tạo trang đặt hàng "${page}".`,
                error
            );

            if (
                window.MCS
                    ?.orders
                    ?.mount
            ) {
                MCS.orders.mount(
                    root,
                    'dung-chung',
                    {
                        type: 'empty',

                        title:
                            'Không thể tải trang đặt hàng',

                        description:
                            error.message,

                        retry: true
                    }
                );

                root.querySelector(
                    '[data-retry]'
                )?.addEventListener(
                    'click',
                    () =>
                        location.reload()
                );
            } else {
                MCS.toast?.error?.(
                    error.message
                );
            }
        }
    }

    if (
        document.readyState ===
        'loading'
    ) {
        document.addEventListener(
            'DOMContentLoaded',
            bootstrap,
            {
                once: true
            }
        );
    } else {
        void bootstrap();
    }
})();