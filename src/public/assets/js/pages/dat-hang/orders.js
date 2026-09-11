'use strict';

(() => {
    const C = MCS.orders,
        { $, $$, state, api, mount } = C;
    const actionOptions = {
        'xac-nhan': {
            label: 'Xác nhận đơn',
            theme: 'primary',
            icon: 'fa-check',
            hint: 'Đơn sẽ chuyển sang đang chuẩn bị.'
        },
        'tu-choi': { label: 'Từ chối', theme: 'danger', icon: 'fa-xmark', reason: true },
        huy: { label: 'Hủy đơn', theme: 'danger', icon: 'fa-trash-can', reason: true },
        'san-sang-giao': {
            label: 'Đánh dấu sẵn sàng giao',
            theme: 'primary',
            icon: 'fa-box',
            hint: 'Món đã chuẩn bị xong và sẵn sàng giao.'
        },
        'bat-dau-giao': {
            label: 'Bắt đầu giao',
            theme: 'primary',
            icon: 'fa-truck',
            hint: 'Đơn sẽ chuyển sang đang giao.'
        },
        'hoan-thanh': {
            label: 'Hoàn thành',
            theme: 'primary',
            icon: 'fa-circle-check',
            hint: 'Xác nhận người nhận đã nhận đủ món.'
        }
    };
    function orderView(order, management = false, completed = false) {
        const status = Number(order.trangThai);
        let actions = [];
        if (management && C.can('Q002032'))
            actions =
                {
                    20: ['tu-choi', 'xac-nhan'],
                    30: ['huy', 'san-sang-giao'],
                    40: ['bat-dau-giao', 'hoan-thanh'],
                    50: ['hoan-thanh']
                }[status] || [];
        else if (!management && [10, 20, 30].includes(status)) actions = ['huy'];
        const phone = String(order.nguoiNhan?.soDienThoai || '').replace(/[^\d+]/g, '');
        const milestones = [
            [20, 'Đã đặt hàng', 'fa-receipt'],
            [30, 'Đang chuẩn bị', 'fa-kitchen-set'],
            [40, 'Sẵn sàng giao', 'fa-box'],
            [50, 'Đang giao', 'fa-truck'],
            [60, 'Hoàn thành', 'fa-check']
        ];
        const progress = milestones.map(([value, label, icon]) => {
            const history = (order.history || []).find(
                (row) => Number(row.trangThaiMoi) >= value && Number(row.trangThaiMoi) > 0
            );
            const done = status > value || !!history;
            return {
                label,
                icon,
                className:
                    status < 0 ? (history ? 'is-done' : '') : status === value ? 'is-active' : done ? 'is-done' : '',
                description: history
                    ? C.dateTime(history.createdAt)
                    : status < 0
                      ? 'Đã dừng'
                      : status === 20 && value === 30
                        ? 'Chờ nhà ăn xác nhận'
                        : 'Chưa thực hiện'
            };
        });
        return {
            ...order,
            completed: completed && status > 0,
            management,
            progress,
            quantity: order.items.reduce((sum, item) => sum + Number(item.soLuong), 0),
            deliveryTime: C.deliveryTime(order.khungGioNhan.tu, order.khungGioNhan.den),
            phoneLink: management && phone ? `tel:${phone}` : null,
            actions: actions.map((action) => ({ action, ...actionOptions[action] })),
            canPay:
                !management &&
                status > 0 &&
                Number(order.trangThaiThanhToan) !== 30 &&
                Number(order.trangThaiThanhToan) !== 50,
            isQr: Number(order.phuongThucThanhToan) === 40,
            actionHint:
                management && !C.can('Q002032')
                    ? 'Bạn đang xem đơn hàng. Cần quyền xử lý để cập nhật trạng thái.'
                    : status < 0
                      ? `Đơn đã dừng xử lý${order.lyDoHuy ? `: ${order.lyDoHuy}` : '.'}`
                      : actions.length
                        ? actionOptions[actions.at(-1)].hint || 'Nhập lý do khi hủy hoặc từ chối đơn.'
                        : 'Đơn hàng đã hoàn tất xử lý.'
        };
    }

    async function ordersPage(page) {
        const management = page.startsWith('management'),
            isList = ['management', 'my-orders'].includes(page);
        if (management && !C.can('Q002031')) {
            mount('[data-order-page]', 'dung-chung', {
                type: 'empty',
                title: 'Bạn chưa có quyền xem đơn nhà ăn',
                description: 'Liên hệ quản trị viên để cấp quyền nhận và xử lý đơn hàng.'
            });
            return;
        }
        let order = null,
            selectedId = $('[data-order-page]').dataset.orderId || '',
            listPage = 1,
            filters = {},
            keyword = '';
        let listSequence = 0,
            detailSequence = 0,
            actionBusy = false,
            paymentBusy = false,
            pending = null;
        const detailTarget = isList ? $('[data-management-detail]') : $('[data-order-detail]');
        const dialog = $('[data-order-action-dialog]');
        const endpoint = management ? '/nv-don-hang/quan-ly' : '/nv-don-hang/cua-toi';
        async function loadDetail(id = selectedId, quiet = false) {
            if (!detailTarget || !id) return;
            selectedId = String(id);
            const current = ++detailSequence;
            if (!quiet) {
                order = null;
                mount(detailTarget, 'dung-chung', {
                    type: 'loading'
                });
            }
            try {
                const result = await api(`/nv-don-hang/${management ? 'quan-ly/' : ''}${encodeURIComponent(id)}`);
                if (current !== detailSequence) return;
                order = result;
                const view = orderView(order, management, page === 'completed');
                mount(detailTarget, management ? 'quan-ly-don' : 'chi-tiet', {
                    type: management ? 'detail-panel' : 'detail',
                    ...view
                });
                $$('[data-order-row]').forEach((row) =>
                    row.classList.toggle('is-selected', row.dataset.orderRow === selectedId)
                );
            } catch (error) {
                if (current === detailSequence) {
                    order = null;
                    mount(detailTarget, 'dung-chung', {
                        type: 'empty',
                        title: 'Không tải được đơn hàng',
                        description: error.message,
                        retry: true
                    });
                }
            }
        }
        async function loadList(quiet = false) {
            const current = ++listSequence;
            const table = $('[data-orders-table]');
            if (!quiet) {
                const row = table.insertRow();
                table.replaceChildren(row);
                const cell = row.insertCell();
                cell.colSpan = management ? 10 : 8;
                mount(cell, 'dung-chung', {
                    type: 'loading'
                });
            }
            try {
                const result = await api(`${endpoint}?${C.query({ ...filters, keyword, page: listPage, limit: 8 })}`);
                if (current !== listSequence) return;
                if (listPage > 1 && !result.items.length) {
                    listPage = Math.max(1, result.pagination.totalPages);
                    return loadList();
                }
                if (management) {
                    const counts = result.thongKe;
                    mount('[data-management-stats]', 'quan-ly-don', {
                        type: 'statistics',
                        statistics: [
                            { label: 'Chờ xác nhận', count: counts.choXacNhan, theme: 'warning', icon: 'fa-clock' },
                            {
                                label: 'Đang chuẩn bị',
                                count: counts.dangChuanBi,
                                theme: 'primary',
                                icon: 'fa-kitchen-set'
                            },
                            {
                                label: 'Sẵn sàng / đang giao',
                                count: counts.sanSangVaDangGiao,
                                theme: 'success',
                                icon: 'fa-truck'
                            },
                            { label: 'Hoàn thành', count: counts.hoanThanh, theme: 'muted', icon: 'fa-circle-check' }
                        ]
                    });
                }
                table.innerHTML = result.items
                    .map((item, index) =>
                        C.render('quan-ly-don', {
                            type: 'table-row',
                            ...item,
                            index: (listPage - 1) * 8 + index + 1,
                            management,
                            selected: String(item.id) === selectedId,
                            detailUrl: `/dat-hang/${management ? 'chi-tiet-xu-ly-don-hang' : 'chi-tiet-don-hang-cua-toi'}/${encodeURIComponent(item.id)}`
                        })
                    )
                    .join('');
                mount('[data-orders-pagination]', 'quan-ly-don', {
                    type: 'pagination',
                    ...C.pagination(result.pagination)
                });
                if (!result.items.length) {
                    const cell = table.insertRow().insertCell();
                    cell.colSpan = management ? 10 : 8;
                    mount(cell, 'dung-chung', {
                        type: 'empty',
                        title: 'Chưa có đơn hàng phù hợp',
                        description: 'Thử thay đổi từ khóa hoặc bộ lọc.'
                    });
                    if (detailTarget) {
                        selectedId = '';
                        order = null;
                        ++detailSequence;
                        mount(detailTarget, 'dung-chung', {
                            type: 'empty',
                            title: 'Chưa chọn đơn hàng'
                        });
                    }
                } else if (management) {
                    const id = result.items.some((row) => String(row.id) === selectedId)
                        ? selectedId
                        : result.items[0].id;
                    await loadDetail(id, quiet && String(id) === selectedId);
                }
            } catch (error) {
                if (current !== listSequence) return;
                table.replaceChildren();
                const cell = table.insertRow().insertCell();
                cell.colSpan = management ? 10 : 8;
                mount(cell, 'dung-chung', {
                    type: 'empty',
                    title: 'Không tải được danh sách đơn',
                    description: error.message,
                    retry: true
                });
            }
        }
        async function refresh(quiet = false) {
            return isList ? loadList(quiet) : loadDetail(selectedId, quiet);
        }
        if (isList) {
            C.setOptions(
                $('#orderStatusFilter'),
                Object.entries(C.statuses).map(([value, row]) => ({ value, label: row[0] }))
            );
            C.setOptions(
                $('#orderPaymentFilter'),
                Object.entries(C.paymentStatuses).map(([value, label]) => ({ value, label }))
            );
            $('#orderListSearch').addEventListener(
                'input',
                C.debounce((event) => {
                    keyword = event.target.value.trim();
                    listPage = 1;
                    void loadList();
                })
            );
            $('[data-search-picker-clear]', $('#orderListSearch').closest('[data-search-picker]'))?.addEventListener(
                'click',
                () => {
                    $('#orderListSearch').value = '';
                    keyword = '';
                    listPage = 1;
                    void loadList();
                }
            );
            $('[data-order-filters]').addEventListener('submit', (event) => {
                event.preventDefault();
                const form = event.currentTarget,
                    values = Object.fromEntries(new FormData(form));
                if (values.tuNgay && values.denNgay && values.denNgay < values.tuNgay) {
                    MCS.toast.warning('Ngày kết thúc phải từ ngày bắt đầu trở đi.');
                    return;
                }
                filters = values;
                listPage = 1;
                void loadList();
            });
        }
        $('[data-order-page]').addEventListener('click', async (event) => {
            const action = event.target.closest('[data-order-action]');
            if (action && order && !actionBusy) {
                const option = actionOptions[action.dataset.orderAction];
                pending = { id: order.id, version: order.version, action: action.dataset.orderAction, option };
                $('[data-action-title]', dialog).textContent = `${option.label} · ${order.maDonHang}`;
                $('[data-action-description]', dialog).textContent =
                    option.hint || 'Thao tác này sẽ dừng việc xử lý đơn. Vui lòng ghi rõ lý do.';
                const reason = $('#orderActionReason');
                reason.value = '';
                reason.required = !!option.reason;
                reason.closest('[data-form-field]').hidden = !option.reason;
                C.formErrors($('form', dialog));
                C.counters(dialog);
                dialog.showModal();
            }
            if (event.target.closest('[data-dialog-close]') && !actionBusy) dialog.close();
            const select = event.target.closest('[data-order-select]');
            if (select && management && isList) {
                event.preventDefault();
                await loadDetail(select.dataset.orderSelect);
            }
            const row = event.target.closest('[data-order-row]');
            if (row && !select) {
                if (management) await loadDetail(row.dataset.orderRow);
                else location.assign($('[data-order-select]', row).href);
            }
            const button = event.target.closest('button');
            if (!button) return;
            if (button.hasAttribute('data-page')) {
                listPage = Number(button.dataset.page);
                await loadList();
            }
            if (button.hasAttribute('data-orders-refresh') || button.hasAttribute('data-retry')) await refresh();
            if (button.hasAttribute('data-toggle-filters')) {
                const filters = $('[data-order-filters]');
                filters.hidden = !filters.hidden;
                button.setAttribute('aria-expanded', String(!filters.hidden));
            }
            if (button.hasAttribute('data-reset-filters')) {
                $('[data-order-filters]').reset();
                filters = {};
                listPage = 1;
                await loadList();
            }
            if (button.hasAttribute('data-management-export')) {
                button.disabled = true;
                try {
                    const file = await MCS.api.requestFile(
                        `/api/mcs/v1/nv-don-hang/quan-ly/xuat-du-lieu?${C.query({ ...filters, keyword })}`
                    );
                    MCS.api.downloadBlob(file.blob, file.fileName || 'don-hang.xlsx');
                } catch (error) {
                    MCS.toast.error(error.message);
                } finally {
                    button.disabled = false;
                }
            }
            if (button.hasAttribute('data-payment-create') && order && !paymentBusy) {
                paymentBusy = true;
                button.disabled = true;
                try {
                    const transaction = await api(
                        `/nv-thanh-toan-don-hang/${encodeURIComponent(order.id)}/khoi-tao`,
                        {}
                    );
                    const target = $('[data-payment-result]');
                    target.replaceChildren();
                    const qr = transaction.qrPayload || transaction.qr_payload;
                    if (typeof qr === 'string' && qr.startsWith('data:image/png;base64,')) {
                        const image = document.createElement('img');
                        image.src = qr;
                        image.alt = 'Mã QR giao dịch';
                        image.className = 'order-qr';
                        target.append(image);
                    }
                    const info = document.createElement('p');
                    info.className = 'order-notice';
                    info.textContent = `${transaction.maGiaoDich || transaction.ma_giao_dich}. ${qr ? 'Mã giao dịch nội bộ, nhà ăn xác nhận sau khi nhận thanh toán.' : 'Giao dịch đang chờ xác nhận thanh toán.'}`;
                    target.append(info);
                } catch (error) {
                    MCS.toast.error(error.message);
                } finally {
                    paymentBusy = false;
                    button.disabled = false;
                }
            }
        });
        if (dialog) {
            dialog.addEventListener('cancel', (event) => {
                if (actionBusy) event.preventDefault();
            });
            $('[data-order-action-form]').addEventListener('submit', async (event) => {
                event.preventDefault();
                if (actionBusy || !pending) return;
                const reason = $('#orderActionReason').value.trim(),
                    form = event.currentTarget;
                if (!C.formErrors(form, pending.option.reason && !reason ? { lyDo: 'Vui lòng nhập lý do.' } : {}))
                    return;
                actionBusy = true;
                $$('button', dialog).forEach((button) => (button.disabled = true));
                try {
                    const managementCancel = management && pending.action === 'huy';
                    await api(
                        `/nv-don-hang/${managementCancel ? 'quan-ly/' : ''}${encodeURIComponent(pending.id)}/${pending.action}`,
                        { version: pending.version, lyDo: reason || null },
                        'PATCH'
                    );
                    dialog.close();
                    MCS.toast.success('Đã cập nhật đơn hàng.');
                    await refresh();
                } catch (error) {
                    if (error.statusCode === 409) {
                        dialog.close();
                        MCS.toast.warning(error.message);
                        await refresh();
                    } else C.formErrors(form, { _: error.message });
                } finally {
                    actionBusy = false;
                    $$('button', dialog).forEach((button) => (button.disabled = false));
                }
            });
        }
        await refresh();
        const timer = setInterval(() => {
            if (
                !document.hidden &&
                !dialog?.open &&
                !actionBusy &&
                !paymentBusy &&
                !$('[data-payment-result]')?.childElementCount
            )
                void refresh(true);
        }, 20000);
        window.addEventListener('pagehide', () => clearInterval(timer), { once: true });
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && !dialog?.open && !actionBusy) void refresh(true);
        });
    }
    Object.assign(C, { ordersPage, orderView });
})();
