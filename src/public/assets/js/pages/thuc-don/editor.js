'use strict';

window.ThucDon = window.ThucDon || {};

window.ThucDon.editor = (() => {
    function init(root, { mode, onSubmit, onSubmitApprove, onCancel } = {}) {
        const formRoot = root?.querySelector('[data-thuc-don-form]');

        if (!formRoot) {
            return null;
        }

        const settings = root._tdOptions?.settings || {};

        const directFoodMode = mode !== 'detail' && settings.batBuocChonNhomMon === false;

        /*
         * Khi không bắt buộc chọn nhóm,
         * loại luôn modal chọn nhóm khỏi DOM.
         */
        if (directFoodMode) {
            root.querySelector('[data-modal-group]')?.remove();
        }

        const form = window.ThucDon.form.init(formRoot, {
            mode,
            settings
        });

        window.ThucDon.contentEditor.init(root, form);

        root.querySelectorAll('[data-form-back]').forEach((button) => {
            button.addEventListener('click', () => {
                window.history.back();
            });
        });

        root.querySelectorAll('[data-form-cancel]').forEach((button) => {
            button.addEventListener('click', () => {
                confirmCancel(() => {
                    onCancel?.(form);
                });
            });
        });

        root.querySelectorAll('[data-form-save]').forEach((button) => {
            button.addEventListener('click', async () => {
                await onSubmit?.(form.getData());
            });
        });

        root.querySelectorAll('[data-form-save-approve]').forEach((button) => {
            button.addEventListener('click', async () => {
                await onSubmitApprove?.(form.getData());
            });
        });

        return form;
    }

    function confirmCancel(onConfirm) {
        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title: 'Hủy thay đổi',

                message: 'Toàn bộ thông tin chưa lưu sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục?',

                confirmLabel: 'Hủy thay đổi',

                type: 'warning',

                onConfirm
            });

            return;
        }

        if (window.confirm('Toàn bộ thông tin chưa lưu sẽ bị xóa. Bạn có chắc chắn muốn tiếp tục?')) {
            onConfirm();
        }
    }

    return {
        init
    };
})();
