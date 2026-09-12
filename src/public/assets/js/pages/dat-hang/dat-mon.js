'use strict';

(() => {
    const C = MCS.orders;

    C.pages.catalog = async function initDatMon() {
        const {
            $,
            state,
            mount,
            api
        } = C;

        let products = [];
        let category = '';
        let page = 1;
        let pageSize = 20;
        let keyword = '';
        let group = '';
        let sequence = 0;

        const root =
            $('[data-order-page]');

        const dialog =
            $('[data-product-filter]');

        const pagination =
            C.createPagination(
                $('[data-order-catalog-pagination]'),
                {
                    page,
                    pageSize,
                    total: 0,

                    onChange(paginationState) {
                        page =
                            paginationState.page;

                        pageSize =
                            paginationState.pageSize;

                        void loadProducts();
                    }
                }
            );

        function renderProducts() {
            mount(
                '[data-product-grid]',
                'dat-mon',
                {
                    type: 'grid',

                    items: products.map(
                        (product) => {
                            const quantity =
                                state.cart.find(
                                    (row) =>
                                        String(
                                            row.sanPhamId
                                        ) ===
                                        String(
                                            product.id
                                        )
                                )?.soLuong || 0;

                            return {
                                ...product,
                                quantity,

                                atMax:
                                    product.soLuongToiDa != null &&
                                    quantity >=
                                        Number(
                                            product.soLuongToiDa
                                        )
                            };
                        }
                    )
                }
            );
        }

        function renderCart() {
            mount(
                '[data-cart-panel]',
                'gio-hang',
                {
                    type: 'panel',
                    ...C.cartView()
                }
            );
        }

        function renderTabs() {
            mount(
                '[data-category-tabs]',
                'dat-mon',
                {
                    type: 'tabs',

                    categories:
                        C.categories.map(
                            (item) => ({
                                ...item,

                                selected:
                                    category ===
                                    item.value
                            })
                        )
                }
            );
        }

        async function loadProducts() {
            const request =
                ++sequence;

            mount(
                '[data-product-grid]',
                'dung-chung',
                {
                    type: 'loading'
                }
            );

            try {
                const result = await api(
                    `/dat-hang/catalog/san-pham?${C.query({
                        page,
                        limit: pageSize,
                        keyword,

                        loaiSanPham:
                            category === 'new'
                                ? ''
                                : category,

                        laSanPhamMoi:
                            category === 'new'
                                ? true
                                : '',

                        nhomSanPhamId:
                            group
                    })}`
                );

                if (
                    request !== sequence
                ) {
                    return;
                }

                products =
                    result.items || [];

                renderProducts();

                pagination?.setData({
                    page:
                        Number(
                            result.pagination.page
                        ),

                    pageSize:
                        Number(
                            result.pagination.limit ||
                            pageSize
                        ),

                    total:
                        Number(
                            result.pagination.total ||
                            0
                        )
                });
            } catch (error) {
                if (
                    request !== sequence
                ) {
                    return;
                }

                mount(
                    '[data-product-grid]',
                    'dung-chung',
                    {
                        type: 'empty',
                        title:
                            'Không tải được sản phẩm',
                        description:
                            error.message,
                        retry: true
                    }
                );

                pagination?.setData({
                    page: 1,
                    pageSize,
                    total: 0
                });
            }
        }

        async function loadOptions() {
            try {
                const data = await api(
                    '/dat-hang/catalog/thong-tin-checkout'
                );

                C.setOptions(
                    $('#orderGroupFilter'),

                    data.nhomSanPham.map(
                        (row) => ({
                            value: row.id,
                            label:
                                row.tenNhomSanPham
                        })
                    )
                );
            } catch (error) {
                MCS.toast.error(
                    error.message
                );
            }
        }

        function bindEvents() {
            document.addEventListener(
                'orders:cart',
                renderCart
            );

            root.addEventListener(
                'click',
                (event) => {
                    const button =
                        event.target.closest(
                            'button'
                        );

                    if (!button) return;

                    if (
                        button.hasAttribute(
                            'data-category'
                        )
                    ) {
                        category =
                            button.dataset.category;

                        page = 1;

                        renderTabs();

                        void loadProducts();

                        return;
                    }

                    const id =
                        button.dataset.add ||
                        button.dataset.quantity;

                    if (id) {
                        const product =
                            products.find(
                                (row) =>
                                    String(row.id) ===
                                    String(id)
                            ) ||
                            state.cart.find(
                                (row) =>
                                    String(
                                        row.sanPhamId
                                    ) ===
                                    String(id)
                            )?.product;

                        if (product) {
                            C.changeQuantity(
                                product,
                                Number(
                                    button.dataset
                                        .delta || 1
                                )
                            );

                            renderProducts();
                        }

                        return;
                    }

                    if (
                        button.dataset.remove
                    ) {
                        state.cart =
                            state.cart.filter(
                                (row) =>
                                    String(
                                        row.sanPhamId
                                    ) !==
                                    String(
                                        button.dataset
                                            .remove
                                    )
                            );

                        C.invalidate();

                        void C.priceCart();

                        renderProducts();

                        return;
                    }

                    if (
                        button.hasAttribute(
                            'data-clear-cart'
                        )
                    ) {
                        MCS.confirm.show({
                            title:
                                'Xóa giỏ hàng',

                            message:
                                'Xóa tất cả món đang chọn?',

                            type: 'danger',

                            onConfirm() {
                                state.cart = [];

                                C.invalidate();

                                void C.priceCart();

                                renderProducts();
                            }
                        });

                        return;
                    }

                    if (
                        button.hasAttribute(
                            'data-checkout'
                        ) &&
                        !C.cartView().blocked
                    ) {
                        location.assign(
                            C.paths.delivery(
                                state.user
                                    .taiKhoanId
                            )
                        );

                        return;
                    }

                    if (
                        button.hasAttribute(
                            'data-filter-open'
                        )
                    ) {
                        dialog?.showModal();

                        return;
                    }

                    if (
                        button.hasAttribute(
                            'data-filter-reset'
                        )
                    ) {
                        group = '';

                        C.setSelectValue(
                            $('#orderGroupFilter'),
                            ''
                        );

                        page = 1;

                        dialog?.close();

                        void loadProducts();

                        return;
                    }

                    if (
                        button.hasAttribute(
                            'data-retry'
                        )
                    ) {
                        void loadProducts();
                        void C.priceCart();
                    }
                }
            );

            document.addEventListener(
                'input',
                (event) => {
                    if (
                        event.target.id !==
                        'orderCartNote'
                    ) {
                        return;
                    }

                    state.draft.ghiChu =
                        event.target.value;

                    delete state.draft
                        .confirmed;

                    C.save();
                }
            );

            $('#orderCatalogSearch')
                ?.addEventListener(
                    'input',

                    C.debounce(
                        (event) => {
                            keyword =
                                event.target
                                    .value
                                    .trim();

                            page = 1;

                            void loadProducts();
                        }
                    )
                );

            const search =
                $('#orderCatalogSearch');

            $('[data-search-picker-clear]',
                search?.closest(
                    '[data-search-picker]'
                )
            )?.addEventListener(
                'click',
                () => {
                    search.value = '';

                    keyword = '';
                    page = 1;

                    void loadProducts();
                }
            );

            $('[data-product-filter-form]')
                ?.addEventListener(
                    'submit',
                    (event) => {
                        if (
                            event.submitter
                                ?.value !==
                            'apply'
                        ) {
                            return;
                        }

                        group =
                            $('#orderGroupFilter')
                                ?.value || '';

                        page = 1;

                        void loadProducts();
                    }
                );
        }

        renderTabs();
        renderCart();
        bindEvents();

        await Promise.all([
            loadProducts(),
            C.priceCart(),
            loadOptions()
        ]);
    };
})();