'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-thuc-don-page][data-page-mode="detail"]');

    if (!root) return;

    const id = root.dataset.thucDonId;

    if (!id) return;

    const permission = window.ThucDon.permission;

    let permissions;

    try {
        permissions = await permission.load();
    } catch (error) {
        console.error('Không thể tải quyền thực đơn:', error);

        permission.showNoPermission(root);

        return;
    }

    if (!permission.canView(permissions)) {
        permission.showNoPermission(root);

        return;
    }

    const form = window.ThucDon.form.init(root.querySelector('[data-thuc-don-form]'), {
        mode: 'detail'
    });

    bindActions();

    await reload();

    async function reload() {
        try {
            root.classList.add('is-loading');

            const res = await window.ThucDon.api.detail(id);

            const data = res?.data ?? res;

            await window.ThucDon.options.init(root, data);

            form.setData(data);

            renderActions(data);
        } catch (e) {
            window.MCS?.toast?.error?.(e.message || 'Không thể tải thực đơn.');
        } finally {
            root.classList.remove('is-loading');
        }
    }

    function bindActions() {
        root.querySelector('[data-detail-approve]')?.addEventListener('click', () => {
            if (!permission.canApprove(permissions)) {
                return;
            }

            confirmAction(
                'Xác nhận duyệt thực đơn',
                'Bạn có chắc chắn muốn duyệt thực đơn này?',
                'Duyệt',
                'success',
                () => run(() => window.ThucDon.api.approve(id))
            );
        });

        root.querySelector('[data-detail-unapprove]')?.addEventListener('click', () => {
            if (!permission.canUnapprove(permissions)) {
                return;
            }

            confirmAction(
                'Xác nhận hủy duyệt',
                'Bạn có chắc chắn muốn hủy duyệt thực đơn này?',
                'Hủy duyệt',
                'warning',
                () => run(() => window.ThucDon.api.unapprove(id))
            );
        });

        root.querySelector('[data-detail-cancel]')?.addEventListener('click', () => {
            if (!permission.canCancel(permissions)) {
                return;
            }

            confirmAction(
                'Xác nhận hủy thực đơn',
                'Bạn có chắc chắn muốn hủy thực đơn này?',
                'Hủy thực đơn',
                'danger',
                () => run(() => window.ThucDon.api.cancel(id))
            );
        });

        root.querySelector('[data-detail-restore]')?.addEventListener('click', () => {
            if (!permission.canRestore(permissions)) {
                return;
            }

            confirmAction(
                'Xác nhận hoàn hủy',
                'Bạn có chắc chắn muốn hoàn lại thao tác hủy?',
                'Hoàn hủy',
                'warning',
                () => run(() => window.ThucDon.api.restore(id))
            );
        });
    }

    async function run(fn) {
        try {
            root.classList.add('is-loading');

            const r = await fn();

            window.MCS?.toast?.success?.(r?.message || 'Thao tác thành công.');

            await reload();
        } catch (e) {
            window.MCS?.toast?.error?.(e.message || 'Thao tác thất bại.');
        } finally {
            root.classList.remove('is-loading');
        }
    }

    function confirmAction(title, message, confirmLabel, type, onConfirm) {
        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title,
                message,
                confirmLabel,
                type,
                onConfirm
            });
        } else if (window.confirm(message)) {
            onConfirm();
        }
    }

    function renderActions(data) {
        const actions = {
            edit: root.querySelector('[data-detail-edit]'),

            approve: root.querySelector('[data-detail-approve]'),

            unapprove: root.querySelector('[data-detail-unapprove]'),

            cancel: root.querySelector('[data-detail-cancel]'),

            restore: root.querySelector('[data-detail-restore]')
        };

        hideAllActions(actions);

        const trangThai = Number(data?.trangThai);

        switch (trangThai) {
            case 10:
            case 20:
            case 40:
                if (permission.canUpdateRecord(permissions, data)) {
                    showAction(actions.edit);
                }

                if (permission.canApprove(permissions)) {
                    showAction(actions.approve);
                }

                if (permission.canCancel(permissions)) {
                    showAction(actions.cancel);
                }

                break;

            case 30:
                if (permission.canUnapprove(permissions)) {
                    showAction(actions.unapprove);
                }

                break;

            case 50:
                if (permission.canRestore(permissions)) {
                    showAction(actions.restore);
                }

                break;

            case 60:
                /*
                 * Thực đơn hết hạn:
                 * chỉ Q001004 mới được cập nhật.
                 */
                if (permission.canUpdateExpired(permissions)) {
                    showAction(actions.edit);
                }

                break;

            default:
                console.warn('Trạng thái thực đơn không hợp lệ:', data?.trangThai);

                break;
        }
    }

    function hideAllActions(actions) {
        Object.values(actions).forEach((action) => {
            if (!action) {
                return;
            }

            action.hidden = true;
        });
    }

    function showAction(action) {
        if (!action) {
            return;
        }

        action.hidden = false;
    }
});
