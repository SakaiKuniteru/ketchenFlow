'use strict';

(() => {
    const C = MCS.orders;
    const {
        $,
        $$,
        api,
        mount
    } = C;

    const actionOptions = {
        'xac-nhan': {
            label: 'Xác nhận đơn',
            theme: 'primary',
            icon: 'fa-check',
            hint:
                'Đơn sẽ chuyển sang đang chuẩn bị.'
        },

        'tu-choi': {
            label: 'Từ chối',
            theme: 'danger',
            icon: 'fa-xmark',
            reason: true
        },

        huy: {
            label: 'Hủy đơn',
            theme: 'danger',
            icon: 'fa-trash-can',
            reason: true
        },

        'san-sang-giao': {
            label:
                'Đánh dấu sẵn sàng giao',
            theme: 'primary',
            icon: 'fa-box',
            hint:
                'Món đã chuẩn bị xong và sẵn sàng giao.'
        },

        'bat-dau-giao': {
            label: 'Bắt đầu giao',
            theme: 'primary',
            icon: 'fa-truck',
            hint:
                'Đơn sẽ chuyển sang đang giao.'
        },

        'hoan-thanh': {
            label: 'Hoàn thành',
            theme: 'primary',
            icon: 'fa-circle-check',
            hint:
                'Xác nhận người nhận đã nhận đủ món.'
        }
    };

    function orderView(
        order,
        management = false,
        completed = false
    ) {
        const status =
            Number(order.trangThai);

        let actions = [];

        if (
            management &&
            C.can('Q002032')
        ) {
            actions =
                {
                    20: [
                        'tu-choi',
                        'xac-nhan'
                    ],

                    30: [
                        'huy',
                        'san-sang-giao'
                    ],

                    40: [
                        'bat-dau-giao',
                        'hoan-thanh'
                    ],

                    50: [
                        'hoan-thanh'
                    ]
                }[status] || [];
        } else if (
            !management &&
            [10, 20, 30]
                .includes(status)
        ) {
            actions = ['huy'];
        }

        const phone = String(
            order.nguoiNhan
                ?.soDienThoai || ''
        ).replace(
            /[^\d+]/g,
            ''
        );

        const milestones = [
            [
                20,
                'Đã đặt hàng',
                'fa-receipt'
            ],

            [
                30,
                'Đang chuẩn bị',
                'fa-kitchen-set'
            ],

            [
                40,
                'Sẵn sàng giao',
                'fa-box'
            ],

            [
                50,
                'Đang giao',
                'fa-truck'
            ],

            [
                60,
                'Hoàn thành',
                'fa-check'
            ]
        ];

        const progress =
            milestones.map(
                ([
                    value,
                    label,
                    icon
                ]) => {
                    const history =
                        (
                            order.history ||
                            []
                        ).find(
                            (row) =>
                                Number(
                                    row.trangThaiMoi
                                ) >= value &&
                                Number(
                                    row.trangThaiMoi
                                ) > 0
                        );

                    const done =
                        status > value ||
                        !!history;

                    return {
                        label,
                        icon,

                        className:
                            status < 0
                                ? (
                                      history
                                          ? 'is-done'
                                          : ''
                                  )
                                : status ===
                                    value
                                  ? 'is-active'
                                  : done
                                    ? 'is-done'
                                    : '',

                        description:
                            history
                                ? C.dateTime(
                                      history.createdAt
                                  )
                                : status < 0
                                  ? 'Đã dừng'
                                  : status ===
                                          20 &&
                                      value ===
                                          30
                                    ? 'Chờ nhà ăn xác nhận'
                                    : 'Chưa thực hiện'
                    };
                }
            );

        return {
            ...order,

            completed:
                completed &&
                status > 0,

            management,

            progress,

            quantity:
                (order.items || [])
                    .reduce(
                        (sum, item) =>
                            sum +
                            Number(
                                item.soLuong
                            ),
                        0
                    ),

            deliveryTime:
                C.deliveryTime(
                    order.khungGioNhan?.tu,
                    order.khungGioNhan?.den
                ),

            phoneLink:
                management &&
                phone
                    ? `tel:${phone}`
                    : null,

            actions:
                actions.map(
                    (action) => ({
                        action,
                        ...actionOptions[
                            action
                        ]
                    })
                ),

            canPay:
                !management &&
                status > 0 &&
                Number(
                    order.trangThaiThanhToan
                ) !== 30 &&
                Number(
                    order.trangThaiThanhToan
                ) !== 50,

            isQr:
                Number(
                    order.phuongThucThanhToan
                ) === 40,

            actionHint:
                management &&
                !C.can('Q002032')
                    ? 'Bạn đang xem đơn hàng. Cần quyền xử lý để cập nhật trạng thái.'
                    : status < 0
                      ? `Đơn đã dừng xử lý${order.lyDoHuy ? `: ${order.lyDoHuy}` : '.'}`
                      : actions.length
                        ? actionOptions[
                              actions.at(-1)
                          ].hint ||
                          'Nhập lý do khi hủy hoặc từ chối đơn.'
                        : 'Đơn hàng đã hoàn tất xử lý.'
        };
    }

    function createOrderDetailController(
        options = {}
    ) {
        const root =
            options.root ||
            $('[data-order-page]');

        const management =
            options.management === true;

        const completed =
            options.completed === true;

        const detailTarget =
            typeof options.detailTarget ===
            'string'
                ? $(options.detailTarget)
                : options.detailTarget ||
                  $('[data-order-detail]');

        const dialog =
            options.dialog ||
            $('[data-order-action-dialog]');

        let selectedId =
            options.orderId || '';

        let order = null;
        let detailSequence = 0;
        let actionBusy = false;
        let paymentBusy = false;
        let pending = null;
        let timer = null;
        let bound = false;

        async function changed() {
            if (
                typeof options.onChanged ===
                'function'
            ) {
                await options.onChanged();
                return;
            }

            await load(
                selectedId
            );
        }

        async function load(
            id = selectedId,
            quiet = false
        ) {
            if (
                !detailTarget ||
                !id
            ) {
                return null;
            }

            selectedId =
                String(id);

            const current =
                ++detailSequence;

            if (!quiet) {
                order = null;

                mount(
                    detailTarget,
                    'dung-chung',
                    {
                        type: 'loading'
                    }
                );
            }

            try {
                const result =
                    await api(
                        `/nv-don-hang/${management ? 'quan-ly/' : ''}${encodeURIComponent(id)}`
                    );

                if (
                    current !==
                    detailSequence
                ) {
                    return null;
                }

                order = result;

                const view =
                    orderView(
                        order,
                        management,
                        completed
                    );

                mount(
                    detailTarget,

                    management
                        ? 'quan-ly-don'
                        : 'chi-tiet',

                    {
                        type:
                            management
                                ? 'detail-panel'
                                : 'detail',

                        ...view
                    }
                );

                $$('[data-order-row]')
                    .forEach(
                        (row) =>
                            row.classList
                                .toggle(
                                    'is-selected',

                                    row.dataset
                                        .orderRow ===
                                        selectedId
                                )
                    );

                return order;
            } catch (error) {
                if (
                    current ===
                    detailSequence
                ) {
                    order = null;

                    mount(
                        detailTarget,
                        'dung-chung',
                        {
                            type: 'empty',
                            title:
                                'Không tải được đơn hàng',
                            description:
                                error.message,
                            retry: true
                        }
                    );
                }

                return null;
            }
        }

        async function openAction(
            button
        ) {
            if (
                !dialog ||
                !order ||
                actionBusy
            ) {
                return;
            }

            const action =
                button.dataset.orderAction;

            const option =
                actionOptions[action];

            if (!option) return;

            pending = {
                id: order.id,
                version:
                    order.version,
                action,
                option
            };

            $('[data-action-title]',
                dialog
            ).textContent =
                `${option.label} · ${order.maDonHang}`;

            $('[data-action-description]',
                dialog
            ).textContent =
                option.hint ||
                'Thao tác này sẽ dừng việc xử lý đơn. Vui lòng ghi rõ lý do.';

            const reason =
                $('#orderActionReason');

            reason.value = '';
            reason.required =
                !!option.reason;

            const field =
                reason.closest(
                    '[data-form-field]'
                );

            if (field) {
                field.hidden =
                    !option.reason;
            }

            C.formErrors(
                $('form', dialog)
            );

            C.counters(dialog);

            dialog.showModal();
        }

        async function createPayment(
            button
        ) {
            if (
                !order ||
                paymentBusy
            ) {
                return;
            }

            paymentBusy = true;
            button.disabled = true;

            try {
                const transaction =
                    await api(
                        `/nv-thanh-toan-don-hang/${encodeURIComponent(order.id)}/khoi-tao`,
                        {}
                    );

                const target =
                    $('[data-payment-result]');

                if (!target) return;

                target.replaceChildren();

                const qr =
                    transaction.qrPayload ||
                    transaction.qr_payload;

                if (
                    typeof qr ===
                        'string' &&
                    qr.startsWith(
                        'data:image/png;base64,'
                    )
                ) {
                    const image =
                        document.createElement(
                            'img'
                        );

                    image.src = qr;
                    image.alt =
                        'Mã QR giao dịch';

                    image.className =
                        'order-qr';

                    target.append(image);
                }

                const info =
                    document.createElement(
                        'p'
                    );

                info.className =
                    'order-notice';

                info.textContent =
                    `${transaction.maGiaoDich || transaction.ma_giao_dich}. ` +
                    (
                        qr
                            ? 'Mã giao dịch nội bộ, nhà ăn xác nhận sau khi nhận thanh toán.'
                            : 'Giao dịch đang chờ xác nhận thanh toán.'
                    );

                target.append(info);
            } catch (error) {
                MCS.toast.error(
                    error.message
                );
            } finally {
                paymentBusy = false;
                button.disabled = false;
            }
        }

        function bind() {
            if (
                bound ||
                !root
            ) {
                return;
            }

            bound = true;

            root.addEventListener(
                'click',
                async (event) => {
                    const action =
                        event.target.closest(
                            '[data-order-action]'
                        );

                    if (action) {
                        await openAction(
                            action
                        );

                        return;
                    }

                    if (
                        event.target.closest(
                            '[data-dialog-close]'
                        ) &&
                        !actionBusy
                    ) {
                        dialog?.close();

                        return;
                    }

                    const button =
                        event.target.closest(
                            'button'
                        );

                    if (!button) return;

                    if (
                        button.hasAttribute(
                            'data-payment-create'
                        )
                    ) {
                        await createPayment(
                            button
                        );
                    }

                    if (
                        button.hasAttribute(
                            'data-retry'
                        )
                    ) {
                        await changed();
                    }
                }
            );

            if (!dialog) return;

            dialog.addEventListener(
                'cancel',
                (event) => {
                    if (actionBusy) {
                        event.preventDefault();
                    }
                }
            );

            $('[data-order-action-form]')
                ?.addEventListener(
                    'submit',
                    async (event) => {
                        event.preventDefault();

                        if (
                            actionBusy ||
                            !pending
                        ) {
                            return;
                        }

                        const form =
                            event.currentTarget;

                        const reason =
                            $('#orderActionReason')
                                .value
                                .trim();

                        const errors =
                            pending.option
                                .reason &&
                            !reason
                                ? {
                                      lyDo:
                                          'Vui lòng nhập lý do.'
                                  }
                                : {};

                        if (
                            !C.formErrors(
                                form,
                                errors
                            )
                        ) {
                            return;
                        }

                        actionBusy = true;

                        $$(
                            'button',
                            dialog
                        ).forEach(
                            (button) => {
                                button.disabled =
                                    true;
                            }
                        );

                        try {
                            const managementCancel =
                                management &&
                                pending.action ===
                                    'huy';

                            await api(
                                `/nv-don-hang/${managementCancel ? 'quan-ly/' : ''}${encodeURIComponent(pending.id)}/${pending.action}`,

                                {
                                    version:
                                        pending.version,

                                    lyDo:
                                        reason ||
                                        null
                                },

                                'PATCH'
                            );

                            dialog.close();

                            MCS.toast.success(
                                'Đã cập nhật đơn hàng.'
                            );

                            await changed();
                        } catch (error) {
                            if (
                                error.statusCode ===
                                409
                            ) {
                                dialog.close();

                                MCS.toast.warning(
                                    error.message
                                );

                                await changed();
                            } else {
                                C.formErrors(
                                    form,
                                    {
                                        _:
                                            error.message
                                    }
                                );
                            }
                        } finally {
                            actionBusy = false;

                            $$(
                                'button',
                                dialog
                            ).forEach(
                                (button) => {
                                    button.disabled =
                                        false;
                                }
                            );
                        }
                    }
                );
        }

        function startAutoRefresh() {
            if (
                options.autoRefresh ===
                false
            ) {
                return;
            }

            timer = setInterval(
                () => {
                    if (
                        !document.hidden &&
                        !dialog?.open &&
                        !actionBusy &&
                        !paymentBusy &&
                        !$(
                            '[data-payment-result]'
                        )
                            ?.childElementCount
                    ) {
                        void load(
                            selectedId,
                            true
                        );
                    }
                },
                20000
            );

            document.addEventListener(
                'visibilitychange',
                () => {
                    if (
                        !document.hidden &&
                        !dialog?.open &&
                        !actionBusy
                    ) {
                        void load(
                            selectedId,
                            true
                        );
                    }
                }
            );

            window.addEventListener(
                'pagehide',
                () => {
                    if (timer) {
                        clearInterval(
                            timer
                        );
                    }
                },
                {
                    once: true
                }
            );
        }

        bind();
        startAutoRefresh();

        return {
            load,

            refresh() {
                return load(
                    selectedId
                );
            },

            getOrder() {
                return order;
            },

            getSelectedId() {
                return selectedId;
            }
        };
    }

    async function createOrderDetailPage(
        options = {}
    ) {
        const root =
            $('[data-order-page]');

        if (!root) return null;

        if (
            options.management &&
            !C.can('Q002031')
        ) {
            mount(
                root,
                'dung-chung',
                {
                    type: 'empty',
                    title:
                        'Bạn chưa có quyền xem đơn nhà ăn',
                    description:
                        'Liên hệ quản trị viên để cấp quyền nhận và xử lý đơn hàng.'
                }
            );

            return null;
        }

        const controller =
            createOrderDetailController({
                ...options,

                root,

                orderId:
                    root.dataset
                        .orderId,

                detailTarget:
                    $('[data-order-detail]')
            });

        await controller.load(
            root.dataset.orderId
        );

        return controller;
    }

    Object.assign(C, {
        actionOptions,
        orderView,
        createOrderDetailController,
        createOrderDetailPage
    });
})();