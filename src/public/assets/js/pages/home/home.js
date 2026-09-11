'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    const nhanVienId = currentUser?.nhanVienId;

    const CONFIG = {
        summaryEndpoint: `/api/mcs/v1/auth/nhan-vien/${nhanVienId}`,

        currentUserKey: 'currentUser',

        fallbackUserName: 'Người dùng'
    };

    const HOME_PERMISSION = 'Q000001';

    const root = document.querySelector('[data-home-page]');

    const homeContent = root?.querySelector('[data-home-content]');

    const noPermission = root?.querySelector('[data-catalog-no-permission]');

    const elements = {
        currentDate: document.querySelector('[data-current-date]'),

        currentTime: document.querySelector('[data-current-time]'),

        dateTimeTrigger: document.querySelector('[data-datetime-trigger]'),

        dateTimePopup: document.querySelector('[data-datetime-popup]'),

        popupTime: document.querySelector('[data-popup-time]'),

        popupDate: document.querySelector('[data-popup-date]'),

        popupTimezone: document.querySelector('[data-popup-timezone]'),

        popupWeekday: document.querySelector('[data-popup-weekday]'),

        popupDay: document.querySelector('[data-popup-day]'),

        popupMonth: document.querySelector('[data-popup-month]'),

        popupYear: document.querySelector('[data-popup-year]'),

        homeUserName: document.querySelector('[data-home-user-name]'),

        currentUserNames: document.querySelectorAll('[data-current-user-name]'),

        changePasswordButton: document.getElementById('homeChangePasswordButton'),

        summaryCards: document.querySelectorAll('[data-summary-card]')
    };

    async function checkHomePermission() {
        if (!window.MCS?.api?.request) {
            showNoPermission();

            return false;
        }

        try {
            const result = await window.MCS.api.request('/api/mcs/v1/auth/nhan-vien-hien-tai');

            const dsQuyen = Array.isArray(result?.data?.dsQuyen) ? result.data.dsQuyen : [];

            const permissions = new Set(
                dsQuyen
                    .map((item) =>
                        String(item?.maQuyen || '')
                            .trim()
                            .toUpperCase()
                    )
                    .filter(Boolean)
            );

            return permissions.has(HOME_PERMISSION);
        } catch (error) {
            console.error('Không thể kiểm tra quyền Trang chủ.', error);

            return false;
        }
    }

    function showNoPermission() {
        if (!root) {
            return;
        }

        const pageContent = root.closest('.page-content') || document.querySelector('.page-content');

        /*
         * Ẩn toàn bộ Home.
         */
        if (homeContent) {
            homeContent.hidden = true;
        }

        root.classList.add('is-permission-hidden');

        /*
         * Đưa màn báo quyền ra ngoài Home
         * và trực tiếp vào page-content.
         */
        if (noPermission && pageContent) {
            pageContent.appendChild(noPermission);

            noPermission.hidden = false;
        }

        document.documentElement.classList.add('catalog-permission-denied');

        document.body.classList.add('catalog-permission-denied');
    }

    function showHome() {
        if (!root) {
            return;
        }

        root.classList.remove('is-permission-hidden');

        if (homeContent) {
            homeContent.hidden = false;
        }

        if (noPermission) {
            noPermission.hidden = true;
        }

        document.documentElement.classList.remove('catalog-permission-denied');

        document.body.classList.remove('catalog-permission-denied');
    }

    async function initialize() {
        const allowed = await checkHomePermission();
        if (!allowed) {
            showNoPermission();
            return;
        }
        showHome();
        renderCurrentDateTime();
        initializeClock();
        renderCurrentUser();
        bindEvents();
        await loadSummary();
    }

    function bindEvents() {
        elements.dateTimeTrigger?.addEventListener('click', (event) => {
            event.preventDefault();

            event.stopPropagation();

            toggleDateTimePopup();
        });

        document.addEventListener('click', (event) => {
            if (event.target.closest('.home-page__datetime')) {
                return;
            }

            closeDateTimePopup();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeDateTimePopup();
            }
        });

        elements.changePasswordButton?.addEventListener('click', openChangePasswordModal);

        document.querySelectorAll('.home-summary-card__link, ' + '.home-quick-link').forEach((link) => {
            link.addEventListener('click', (event) => {
                if (link.getAttribute('href') === '#') {
                    event.preventDefault();
                }
            });
        });
    }

    function toggleDateTimePopup() {
        if (!elements.dateTimePopup) {
            return;
        }

        const open = elements.dateTimePopup.hidden;

        elements.dateTimePopup.hidden = !open;

        elements.dateTimeTrigger?.setAttribute('aria-expanded', String(open));
    }

    function closeDateTimePopup() {
        if (!elements.dateTimePopup) {
            return;
        }

        elements.dateTimePopup.hidden = true;

        elements.dateTimeTrigger?.setAttribute('aria-expanded', 'false');
    }

    function renderCurrentDateTime() {
        const date = new Date();

        const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });

        const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        let dateValue = dateFormatter.format(date);

        dateValue = dateValue.charAt(0).toUpperCase() + dateValue.slice(1);

        const timeValue = timeFormatter.format(date);

        if (elements.currentDate) {
            elements.currentDate.textContent = dateValue;
        }

        if (elements.currentTime) {
            elements.currentTime.textContent = timeValue;
        }

        if (elements.popupTime) {
            elements.popupTime.textContent = timeValue;
        }

        if (elements.popupDate) {
            elements.popupDate.textContent = dateValue;
        }

        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        if (elements.popupTimezone) {
            elements.popupTimezone.textContent = timeZone || 'Múi giờ hệ thống';
        }

        if (elements.popupWeekday) {
            let weekday = new Intl.DateTimeFormat('vi-VN', {
                weekday: 'long'
            }).format(date);

            weekday = weekday.charAt(0).toUpperCase() + weekday.slice(1);

            elements.popupWeekday.textContent = weekday;
        }

        if (elements.popupDay) {
            elements.popupDay.textContent = new Intl.DateTimeFormat('vi-VN', {
                day: '2-digit'
            }).format(date);
        }

        if (elements.popupMonth) {
            const month = new Intl.DateTimeFormat('vi-VN', {
                month: '2-digit'
            }).format(date);

            elements.popupMonth.textContent = `Tháng ${month}`;
        }

        if (elements.popupYear) {
            elements.popupYear.textContent = new Intl.DateTimeFormat('vi-VN', {
                year: 'numeric'
            }).format(date);
        }
    }

    function getCurrentUser() {
        if (window.MCS?.storage?.getCurrentUser) {
            return window.MCS.storage.getCurrentUser();
        }

        const raw = localStorage.getItem(CONFIG.currentUserKey);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            console.warn('Không thể đọc thông tin người dùng.', error);

            return null;
        }
    }

    function initializeClock() {
        window.setInterval(() => {
            renderCurrentDateTime();
        }, 1000);
    }

    function renderCurrentUser() {
        // const user =
        //     getCurrentUser();

        // const hoTen =
        //     user?.hoTen ||
        //     CONFIG.fallbackUserName;

        const user = getCurrentUser();

        console.log(getCurrentUser());

        const currentUser = user?.nhanVien || user;

        const hoTen = currentUser?.hoTen || CONFIG.fallbackUserName;

        if (elements.homeUserName) {
            elements.homeUserName.textContent = hoTen;
        }

        elements.currentUserNames.forEach((element) => {
            element.textContent = hoTen;
        });

        setTextContent('[data-home-profile-name]', hoTen);

        setTextContent(
            '[data-home-profile-username]',
            user?.taiKhoan || user?.tenDangNhap || 'Chưa có thông tin tài khoản'
        );

        setTextContent('[data-home-profile-employee-code]', currentUser?.maNhanVien || '—');

        setTextContent('[data-home-profile-facility]', getRelationName(currentUser?.coSo));

        setTextContent('[data-home-profile-department]', getRelationName(currentUser?.phongBan));

        setTextContent('[data-home-profile-position]', getRelationName(currentUser?.chucVu));

        renderAvatar(
            // user
            currentUser
        );
    }

    function getRelationName(relation) {
        if (!relation) {
            return '—';
        }

        return relation.ten || relation.tenCoSo || relation.tenPhongBan || relation.tenChucVu || '—';
    }

    function renderAvatar(user) {
        const avatarContainer = document.querySelector('.home-profile__avatar');

        if (!avatarContainer) {
            return;
        }

        const imageUrl = user?.anhDaiDien;

        if (!imageUrl) {
            return;
        }

        avatarContainer.innerHTML = '';

        const image = document.createElement('img');

        image.src = imageUrl;

        image.alt = `Ảnh đại diện của ${user.hoTen || 'người dùng'}`;

        image.addEventListener(
            'error',
            () => {
                avatarContainer.innerHTML = '<span aria-hidden="true">👤</span>';
            },
            {
                once: true
            }
        );

        avatarContainer.appendChild(image);
    }

    async function loadSummary() {
        if (!window.MCS?.api?.request) {
            return;
        }

        setSummaryLoading(true);

        try {
            const result = await window.MCS.api.request(CONFIG.summaryEndpoint);

            const data = result?.data;

            if (!data) {
                return;
            }

            updateSummaryValue('co-so', data.tongCoSo);

            updateSummaryValue('nha-an', data.tongNhaAn);

            updateSummaryValue('kho', data.tongKho);

            updateSummaryValue('nhan-vien', data.tongNhanVien);
        } catch (error) {
            console.info('API thống kê trang chủ chưa sẵn sàng:', error.message);
        } finally {
            setSummaryLoading(false);
        }
    }

    function updateSummaryValue(key, value) {
        if (value === undefined || value === null) {
            return;
        }

        const element = document.querySelector(`[data-summary-value="${key}"]`);

        if (!element) {
            return;
        }

        const numericValue = Number(value);

        element.textContent = Number.isFinite(numericValue)
            ? new Intl.NumberFormat('vi-VN').format(numericValue)
            : value;
    }

    function setSummaryLoading(loading) {
        elements.summaryCards.forEach((card) => {
            card.classList.toggle('is-loading', loading);

            card.setAttribute('aria-busy', String(loading));
        });
    }

    function openChangePasswordModal() {
        const modal = document.getElementById('changePasswordModal');

        if (!modal) {
            window.MCS?.toast?.warning('Chức năng đổi mật khẩu chưa được cấu hình.');

            return;
        }

        if (window.MCS?.modal?.open) {
            window.MCS.modal.open(modal);

            return;
        }

        modal.hidden = false;

        document.body.classList.add('modal-open');
    }

    function setTextContent(selector, value) {
        const element = document.querySelector(selector);

        if (!element) {
            return;
        }

        element.textContent = value ?? '—';
    }

    initialize();
});
