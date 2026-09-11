'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-thuc-don-page][data-page-mode="update"]');

    if (!root) {
        return;
    }

    const permission = window.ThucDon.permission;

    let permissions;

    try {
        permissions = await permission.load();
    } catch (error) {
        console.error('Không thể tải quyền thực đơn:', error);

        permission.showNoPermission(root);

        return;
    }

    /*
     * Không có Q001003 hoặc Q001004
     * thì tuyệt đối không gọi API detail.
     */
    if (!permission.canUpdate(permissions)) {
        permission.showNoPermission(root);

        return;
    }

    const id = root.dataset.thucDonId;

    if (!id) {
        return;
    }

    let originalData = null;

    try {
        root.classList.add('is-loading');

        const response = await window.ThucDon.api.detail(id);

        const data = response?.data ?? response;
        if (!permission.canUpdateRecord(permissions, data)) {
            permission.showNoPermission(root);

            return;
        }

        originalData = structuredClone(data);

        await window.ThucDon.options.init(root, data);

        const form = window.ThucDon.editor.init(root, {
            mode: 'update',

            onSubmit: (current) => submit(current, Number(data.trangThai || 10)),

            onSubmitApprove: (current) => submit(current, Number(data.trangThai || 10), true),

            onCancel: (formInstance) => {
                if (!originalData) {
                    return;
                }

                const restoredData = structuredClone(originalData);

                formInstance.setData(restoredData);

                renderActions(restoredData.trangThai);

                window.MCS?.toast?.info?.('Đã hủy toàn bộ thay đổi chưa lưu.');
            }
        });

        if (!form) {
            return;
        }

        form.setData(data);

        renderActions(data.trangThai);

        async function submit(current, status, duyetSauKhiLuu = false) {
            const payload = window.ThucDon.payload.build(current, status);

            form.clearErrors();

            const generalErrors = window.ThucDon.payload.validateGeneral(payload);

            if (generalErrors.length) {
                generalErrors.forEach(([fieldName, message]) => {
                    form.setFieldError(fieldName, message);
                });

                form.focusFirstError();

                return;
            }

            const contentErrors = window.ThucDon.payload.validateContent(payload, root._tdOptions?.settings || {});

            if (contentErrors.length) {
                window.MCS?.toast?.error?.(contentErrors[0]);

                return;
            }

            try {
                let result = await window.ThucDon.api.update(id, payload);

                if (duyetSauKhiLuu) {
                    result = await window.ThucDon.api.approve(id);
                }

                window.MCS?.toast?.success?.(
                    duyetSauKhiLuu
                        ? result?.message || 'Lưu và duyệt thực đơn thành công.'
                        : result?.message || 'Cập nhật thực đơn thành công.'
                );

                window.location.href = `/thuc-don/thong-tin-chi-tiet-thuc-don/${id}`;
            } catch (error) {
                console.error(error);

                window.MCS?.toast?.error?.(error.message || 'Cập nhật thực đơn thất bại.');
            } finally {
                root.classList.remove('is-loading');
            }
        }
    } catch (error) {
        console.error(error);

        window.MCS?.toast?.error?.(error.message || 'Không thể tải thực đơn.');
    } finally {
        root.classList.remove('is-loading');
    }

    function renderActions(trangThai) {
        const cancelButton = root.querySelector('[data-form-cancel]');

        const saveButton = root.querySelector('[data-form-save]');

        const saveApproveButton = root.querySelector('[data-form-save-approve]');

        hideAction(cancelButton);

        hideAction(saveButton);

        hideAction(saveApproveButton);

        switch (Number(trangThai)) {
            case 10:
            case 20:
            case 40:
                showAction(cancelButton);

                if (
                    permission.canUpdateRecord(permissions, {
                        trangThai
                    })
                ) {
                    showAction(saveButton);
                }

                if (permission.canApprove(permissions)) {
                    showAction(saveApproveButton);
                }

                break;
            case 60:
                showAction(cancelButton);

                if (permission.canUpdateExpired(permissions)) {
                    showAction(saveButton);
                }

                break;

            case 30:
            case 50:
                showAction(cancelButton);

                break;

            default:
                console.warn('Trạng thái cập nhật không hợp lệ:', trangThai);

                break;
        }
    }

    function showAction(element) {
        if (!element) {
            return;
        }

        element.hidden = false;
    }

    function hideAction(element) {
        if (!element) {
            return;
        }

        element.hidden = true;
    }

    function resolveSaveStatus(data, currentStatus) {
        if (isExpired(data.denNgay)) {
            return 60;
        }

        return Number(currentStatus || 10);
    }

    function resolveApproveStatus(data) {
        if (isExpired(data.denNgay)) {
            return 60;
        }

        return 30;
    }

    function isExpired(denNgay) {
        const endDate = normalizeDate(denNgay);

        if (!endDate) {
            return false;
        }

        const today = getTodayInVietnam();

        return endDate < today;
    }

    function getTodayInVietnam() {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',

            year: 'numeric',

            month: '2-digit',

            day: '2-digit'
        }).formatToParts(new Date());

        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

        return `${values.year}-` + `${values.month}-` + `${values.day}`;
    }

    function normalizeDate(value) {
        if (!value) {
            return '';
        }

        const text = String(value).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return text;
        }

        const date = new Date(text);

        if (Number.isNaN(date.getTime())) {
            return text.substring(0, 10);
        }

        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',

            year: 'numeric',

            month: '2-digit',

            day: '2-digit'
        }).formatToParts(date);

        const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

        return `${values.year}-` + `${values.month}-` + `${values.day}`;
    }
});
