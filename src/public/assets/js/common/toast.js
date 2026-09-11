'use strict';

window.MCS = window.MCS || {};

window.MCS.toast = {
    show({ title = 'Thông báo', message = '', type = 'info', duration = 4000 } = {}) {
        const container = document.getElementById('toastContainer');
        const template = document.getElementById('toastTemplate');

        if (!container || !template) {
            return null;
        }

        const fragment = template.content.cloneNode(true);
        const toast = fragment.querySelector('.toast');
        const icon = fragment.querySelector('[data-toast-icon]');
        const titleElement = fragment.querySelector('[data-toast-title]');
        const messageElement = fragment.querySelector('[data-toast-message]');
        const closeButton = fragment.querySelector('[data-toast-close]');

        const iconMap = {
            success: '✓',
            error: '×',
            warning: '!',
            info: 'i'
        };

        toast.classList.add(`toast--${type}`);
        icon.textContent = iconMap[type] || iconMap.info;
        titleElement.textContent = title;
        messageElement.textContent = message;

        const remove = () => {
            if (!toast.isConnected) {
                return;
            }

            toast.classList.add('is-leaving');

            window.setTimeout(() => {
                toast.remove();
            }, 180);
        };

        closeButton.addEventListener('click', remove);

        container.appendChild(fragment);

        if (Number(duration) > 0) {
            window.setTimeout(remove, Number(duration));
        }

        return toast;
    },

    success(message, title = 'Thành công') {
        return this.show({
            title,
            message,
            type: 'success'
        });
    },

    error(message, title = 'Lỗi') {
        return this.show({
            title,
            message,
            type: 'error',
            duration: 6000
        });
    },

    warning(message, title = 'Cảnh báo') {
        return this.show({
            title,
            message,
            type: 'warning',
            duration: 5000
        });
    },

    info(message, title = 'Thông báo') {
        return this.show({
            title,
            message,
            type: 'info'
        });
    }
};
