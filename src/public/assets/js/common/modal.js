'use strict';

window.MCS = window.MCS || {};

window.MCS.modal = {
    activeModal: null,

    open(modalOrId, options = {}) {
        const modal = typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId;

        if (!modal) {
            return;
        }

        modal.hidden = false;
        modal.classList.add('is-open');
        modal.dataset.dismissible = options.dismissible === false ? 'false' : 'true';
        document.body.classList.add('modal-open');
        this.activeModal = modal;

        const focusable = modal.querySelector(
            [
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                'button:not([disabled])'
            ].join(',')
        );

        window.setTimeout(() => {
            focusable?.focus();
        }, 30);
    },

    close(modalOrId, options = {}) {
        const modal =
            typeof modalOrId === 'string' ? document.getElementById(modalOrId) : modalOrId || this.activeModal;

        if (!modal) {
            return;
        }

        if (modal.dataset.dismissible === 'false') {
            return;
        }

        modal.hidden = true;
        modal.classList.remove('is-open');
        document.body.classList.remove('modal-open');

        if (this.activeModal === modal) {
            this.activeModal = null;
        }
    }
};

window.MCS.alert = {
    show({ title = 'Thông báo', message = '', type = 'info' } = {}) {
        const modal = document.getElementById('alertModal');

        if (!modal) {
            return;
        }

        const titleElement = modal.querySelector('[data-alert-title]');
        const messageElement = modal.querySelector('[data-alert-message]');
        const iconElement = modal.querySelector('[data-alert-icon]');

        const iconMap = {
            success: '✓',
            error: '×',
            warning: '!',
            info: 'i'
        };

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (messageElement) {
            messageElement.textContent = message;
        }

        if (iconElement) {
            iconElement.textContent = iconMap[type] || iconMap.info;
        }

        modal.dataset.alertType = type;

        window.MCS.modal.open(modal);
    },

    success(message, title = 'Thành công') {
        this.show({
            title,
            message,
            type: 'success'
        });
    },

    error(message, title = 'Lỗi') {
        this.show({
            title,
            message,
            type: 'error'
        });
    },

    warning(message, title = 'Cảnh báo') {
        this.show({
            title,
            message,
            type: 'warning'
        });
    },

    info(message, title = 'Thông báo') {
        this.show({
            title,
            message,
            type: 'info'
        });
    }
};

window.MCS.confirm = {
    callback: null,

    show({
        title = 'Xác nhận',
        message = 'Bạn có chắc chắn muốn thực hiện thao tác này?',
        confirmLabel = 'Đồng ý',
        type = 'primary',
        onConfirm = null
    } = {}) {
        const modal = document.getElementById('confirmModal');

        if (!modal) {
            return;
        }

        const confirmType = type === 'danger' ? 'danger' : 'primary';

        modal.dataset.confirmType = confirmType;

        modal.querySelector('[data-confirm-title]').textContent = title;

        modal.querySelector('[data-confirm-message]').textContent = message;

        const button = modal.querySelector('[data-confirm-submit]');

        button.textContent = confirmLabel;

        button.className = 'confirm-modal__button';

        if (confirmType === 'danger') {
            button.classList.add('confirm-modal__button--danger');
        } else {
            button.classList.add('confirm-modal__button--primary');
        }

        this.callback = onConfirm;

        window.MCS.modal.open(modal);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', async (event) => {
        const closeButton = event.target.closest('[data-modal-close]');

        if (closeButton) {
            const modal = closeButton.closest('.modal');

            window.MCS.modal.close(modal);

            return;
        }

        const confirmButton = event.target.closest('[data-confirm-submit]');

        if (confirmButton) {
            const callback = window.MCS.confirm.callback;

            if (typeof callback === 'function') {
                confirmButton.disabled = true;

                try {
                    await callback();
                } finally {
                    confirmButton.disabled = false;
                }
            }

            const modal = confirmButton.closest('.modal');

            window.MCS.modal.close(modal);

            window.MCS.confirm.callback = null;
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape') {
            return;
        }

        window.MCS.modal.close();
    });
});
