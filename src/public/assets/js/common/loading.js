'use strict';

window.MCS = window.MCS || {};

window.MCS.loading = {
    count: 0,

    show(message = 'Đang xử lý dữ liệu...') {
        const loading = document.getElementById('globalLoading');
        if (!loading) {
            return;
        }
        this.count += 1;
        const messageElement = document.getElementById('globalLoadingMessage');
        if (messageElement) {
            messageElement.textContent = message;
        }
        loading.hidden = false;
        loading.setAttribute('aria-busy', 'true');
    },

    hide(force = false) {
        const loading = document.getElementById('globalLoading');
        if (!loading) {
            return;
        }
        if (force) {
            this.count = 0;
        } else {
            this.count = Math.max(0, this.count - 1);
        }
        if (this.count > 0) {
            return;
        }
        loading.hidden = true;
        loading.setAttribute('aria-busy', 'false');
    },

    async wrap(callback, message) {
        this.show(message);
        try {
            return await callback();
        } finally {
            this.hide();
        }
    }
};
