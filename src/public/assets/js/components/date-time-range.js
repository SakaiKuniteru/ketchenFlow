'use strict';

(function initializeDateTimeRanges() {
    document.querySelectorAll('[data-date-time-range]').forEach((root) => {
        const defaultToday = root.dataset.defaultToday === 'true';

        if (!defaultToday) {
            return;
        }

        const fromId = root.dataset.rangeFrom;
        const toId = root.dataset.rangeTo;

        const fromInput = document.getElementById(fromId);
        const toInput = document.getElementById(toId);

        if (!fromInput || !toInput) {
            return;
        }

        const today = new Date();

        if (!fromInput.value) {
            fromInput.value = formatDateTime(today, '00:00:00');
        }

        if (!toInput.value) {
            toInput.value = formatDateTime(today, '23:59:59');
        }
    });

    function formatDateTime(date, time) {
        const day = String(date.getDate()).padStart(2, '0');

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const year = date.getFullYear();

        return `${day}/${month}/${year} ${time}`;
    }
})();
