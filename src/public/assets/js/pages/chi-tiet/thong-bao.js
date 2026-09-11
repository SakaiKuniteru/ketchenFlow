'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const root = document.querySelector('[data-notification-page]');

    if (!root) {
        return;
    }

    const API = {
        list: '/api/mcs/v1/thong-bao/cua-toi',
        markAll: '/api/mcs/v1/thong-bao/cua-toi/da-doc-tat-ca'
    };

    const elements = {
        content: root.querySelector('[data-notification-page-content]'),
        noPermission: root.querySelector('[data-catalog-no-permission]'),
        list: root.querySelector('[data-notification-page-list]'),
        loading: root.querySelector('[data-notification-page-loading]'),
        empty: root.querySelector('[data-notification-page-empty]'),
        markAll: root.querySelector('[data-notification-page-mark-all]'),
        total: root.querySelector('[data-notification-page-total]'),
        unread: root.querySelector('[data-notification-page-unread]'),
        filters: root.querySelectorAll('[data-notification-page-filter]')
    };

    const state = {
        items: [],
        filter: 'all',
        openedIds: new Set(),
        loading: false,
        markingAll: false,
        refreshTimer: null
    };

    initialize();

    async function initialize() {
        bindEvents();

        const permissions = getPermissionSet();

        if (!permissions.has('Q001016')) {
            showNoPermission();
            return;
        }

        hideNoPermission();

        elements.markAll.hidden = !permissions.has('Q001017');

        await load();
        startAutoRefresh();
    }

    async function load({ silent = false } = {}) {
        if (state.loading) {
            return;
        }

        state.loading = true;

        if (!silent) {
            setLoading(true);
        }

        try {
            const result = await window.MCS.api.request(API.list, {
                method: 'GET'
            });

            const data = result?.data ?? result;

            state.items = Array.isArray(data) ? data : [];

            render();
        } catch (error) {
            if (!silent) {
                state.items = [];

                render();

                window.MCS?.toast?.error?.(error?.message || 'Không thể tải danh sách thông báo.');
            } else {
                console.error('Không thể cập nhật danh sách thông báo:', error);
            }
        } finally {
            state.loading = false;

            if (!silent) {
                setLoading(false);
            }
        }
    }

    function startAutoRefresh() {
        stopAutoRefresh();

        state.refreshTimer = window.setInterval(() => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            load({
                silent: true
            });
        }, 60000);
    }

    function stopAutoRefresh() {
        if (!state.refreshTimer) {
            return;
        }

        window.clearInterval(state.refreshTimer);

        state.refreshTimer = null;
    }

    function bindEvents() {
        elements.filters.forEach((button) => {
            button.addEventListener('click', () => {
                state.filter = button.dataset.notificationPageFilter || 'all';

                render();
            });
        });

        elements.markAll?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            markAllRead();
        });

        elements.list?.addEventListener('click', handleListClick);

        window.addEventListener('mcs:notification-count-changed', () => {
            load({
                silent: true
            });
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState !== 'visible') {
                return;
            }

            load({
                silent: true
            });
        });
    }

    async function handleListClick(event) {
        const toggle = event.target.closest('[data-notification-toggle]');

        if (!toggle) {
            return;
        }

        const id = Number(toggle.dataset.notificationToggle);

        if (!id) {
            return;
        }

        const item = state.items.find((current) => Number(current?.id) === id);

        if (!item) {
            return;
        }

        if (state.openedIds.has(id)) {
            state.openedIds.delete(id);

            render();

            return;
        }

        state.openedIds.add(id);

        if (item.daDoc !== true) {
            try {
                await window.MCS.api.request(`${API.list}/${id}/da-doc`, {
                    method: 'PATCH'
                });

                item.daDoc = true;

                window.dispatchEvent(new CustomEvent('mcs:notifications-changed'));
            } catch (error) {
                window.MCS?.toast?.error?.(error?.message || 'Không thể đánh dấu thông báo đã đọc.');
            }
        }

        render();
    }

    async function markAllRead() {
        if (state.markingAll) {
            return;
        }

        const unread = state.items.filter((item) => item?.daDoc !== true);

        if (unread.length === 0) {
            return;
        }

        state.markingAll = true;

        updateMarkAllButton();

        try {
            const result = await window.MCS.api.request(API.markAll, {
                method: 'PATCH'
            });

            await load({
                silent: true
            });

            window.dispatchEvent(
                new CustomEvent('mcs:notifications-changed', {
                    detail: {
                        type: 'mark-all-read',
                        result: result?.data ?? result
                    }
                })
            );

            window.MCS?.toast?.success?.(result?.message || 'Đã đánh dấu tất cả thông báo là đã đọc.');
        } catch (error) {
            console.error('Đánh dấu tất cả đã đọc thất bại:', error);

            window.MCS?.toast?.error?.(error?.message || 'Không thể đánh dấu tất cả thông báo là đã đọc.');
        } finally {
            state.markingAll = false;

            updateMarkAllButton();
        }
    }

    function updateMarkAllButton() {
        if (!elements.markAll) {
            return;
        }

        const unreadCount = state.items.filter((item) => item?.daDoc !== true).length;

        const disabled = state.markingAll || unreadCount === 0;

        elements.markAll.disabled = disabled;

        if (state.markingAll) {
            elements.markAll.innerHTML = `
                    <i
                        class="
                            fa-solid
                            fa-spinner
                            fa-spin
                        ">
                    </i>

                    <span>
                        Đang xử lý...
                    </span>
                `;

            return;
        }

        elements.markAll.innerHTML = `
                <i
                    class="
                        fa-regular
                        fa-circle-check
                    ">
                </i>

                <span>
                    Đánh dấu tất cả đã đọc
                </span>
            `;
    }

    function render() {
        const unread = state.items.filter((item) => item?.daDoc !== true);

        elements.total.textContent = String(state.items.length);
        elements.unread.textContent = String(unread.length);

        elements.filters.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.notificationPageFilter === state.filter);
        });

        updateMarkAllButton();

        const source = state.filter === 'unread' ? unread : state.items;

        elements.list.innerHTML = source.map(renderItem).join('');

        elements.empty.hidden = source.length > 0;
    }

    function renderItem(item) {
        const id = Number(item?.id);
        const unread = item?.daDoc !== true;
        const opened = state.openedIds.has(id);
        const icon = getIcon(item);

        const previewContent = stripHtml(item?.noiDung || '');

        const richContent = sanitizeRichTextHtml(item?.noiDung || '');

        const creator = getCreatorName(item);

        return `
                <article
                    class="
                        notification-page__item
                        ${unread ? 'is-unread' : ''}
                    "
                    data-notification-item="${id}">

                    <button
                        type="button"
                        class="
                            notification-page__summary
                        "
                        data-notification-toggle="${id}"
                        aria-expanded="${opened ? 'true' : 'false'}">

                        <span
                            class="
                                notification-page__icon
                                ${icon.className}
                            "
                            aria-hidden="true">

                            <i class="${icon.icon}">
                            </i>

                        </span>

                        <span
                            class="
                                notification-page__summary-main
                            ">

                            <strong
                                class="
                                    notification-page__title
                                ">
                                ${escapeHtml(item?.tieuDe || 'Thông báo')}
                            </strong>

                            <span
                                class="
                                    notification-page__preview
                                ">
                                ${escapeHtml(previewContent)}
                            </span>

                        </span>

                        <span
                            class="
                                notification-page__time
                            ">
                            ${escapeHtml(formatRelativeTime(item?.thoiGianGui || item?.createdAt))}
                        </span>

                        <i
                            class="
                                fa-solid
                                fa-chevron-down
                                notification-page__chevron
                            "
                            aria-hidden="true">
                        </i>

                    </button>

                    <div
                        class="
                            notification-page__detail
                        "
                        ${opened ? '' : 'hidden'}>

                        <div
                            class="
                                notification-page__information
                            ">

                            <div
                                class="
                                    notification-page__information-row
                                ">

                                <span
                                    class="
                                        notification-page__information-label
                                    ">

                                    <i
                                        class="
                                            fa-regular
                                            fa-file-lines
                                        ">
                                    </i>

                                    Nội dung

                                </span>

                                <div
                                    class="
                                        notification-page__information-value
                                        notification-page__rich-text
                                    ">
                                    ${richContent}
                                </div>

                            </div>

                            <div
                                class="
                                    notification-page__information-row
                                ">

                                <span
                                    class="
                                        notification-page__information-label
                                    ">

                                    <i
                                        class="
                                            fa-regular
                                            fa-user
                                        ">
                                    </i>

                                    Người tạo

                                </span>

                                <span
                                    class="
                                        notification-page__information-value
                                    ">
                                    ${escapeHtml(creator)}
                                </span>

                            </div>

                            <div
                                class="
                                    notification-page__information-row
                                ">

                                <span
                                    class="
                                        notification-page__information-label
                                    ">

                                    <i
                                        class="
                                            fa-regular
                                            fa-clock
                                        ">
                                    </i>

                                    Thời gian gửi

                                </span>

                                <span
                                    class="
                                        notification-page__information-value
                                    ">
                                    ${escapeHtml(formatDateTime(item?.thoiGianGui))}
                                </span>

                            </div>

                            ${
                                item?.duongDan
                                    ? `
                                        <div
                                            class="
                                                notification-page__information-row
                                            ">

                                            <span
                                                class="
                                                    notification-page__information-label
                                                ">

                                                <i
                                                    class="
                                                        fa-solid
                                                        fa-link
                                                    ">
                                                </i>

                                                Đường dẫn

                                            </span>

                                            <span
                                                class="
                                                    notification-page__information-value
                                                ">

                                                <a
                                                    href="${escapeAttribute(item.duongDan)}"
                                                    class="
                                                        notification-page__link
                                                    ">

                                                    Xem chi tiết

                                                    <i
                                                        class="
                                                            fa-solid
                                                            fa-arrow-up-right-from-square
                                                        ">
                                                    </i>

                                                </a>

                                            </span>

                                        </div>
                                    `
                                    : ''
                            }

                        </div>

                    </div>

                </article>
            `;
    }

    function getPermissionSet() {
        let currentUser = null;

        try {
            currentUser =
                window.MCS?.storage?.getCurrentUser?.() || JSON.parse(localStorage.getItem('currentUser') || 'null');
        } catch (error) {
            currentUser = null;
        }

        const permissions = Array.isArray(currentUser?.dsQuyen) ? currentUser.dsQuyen : [];

        return new Set(
            permissions
                .map((item) => (typeof item === 'string' ? item : item?.maQuyen || item?.ma_quyen || ''))
                .map((item) => String(item).trim().toUpperCase())
                .filter(Boolean)
        );
    }

    function getCreatorName(item) {
        return item?.nguoiTao?.nhanVien?.hoTen || item?.nguoiTao?.tenDangNhap || 'Hệ thống';
    }

    function getIcon(item) {
        const text = String(item?.maSuKien || item?.loaiThamChieu || '').toUpperCase();

        if (text.includes('VOUCHER')) {
            return {
                icon: 'fa-solid fa-ticket',
                className: 'notification-page__icon--success'
            };
        }

        if (text.includes('NHAN_VIEN') || text.includes('TAI_KHOAN')) {
            return {
                icon: 'fa-regular fa-user',
                className: 'notification-page__icon--purple'
            };
        }

        if (text.includes('BAO_CAO')) {
            return {
                icon: 'fa-solid fa-chart-column',
                className: 'notification-page__icon--warning'
            };
        }

        return {
            icon: 'fa-regular fa-bell',
            className: ''
        };
    }

    function setLoading(loading) {
        elements.loading.hidden = !loading;
        elements.list.hidden = loading;

        if (loading) {
            elements.empty.hidden = true;
        }
    }

    function showNoPermission() {
        stopAutoRefresh();
        setLoading(false);

        const pageContent = root.closest('.page-content') || document.querySelector('.page-content');

        const noPermission =
            root.querySelector('[data-catalog-no-permission]') ||
            document.querySelector('[data-catalog-no-permission]');

        if (!pageContent || !noPermission) {
            return;
        }

        if (!noPermission._mcsOriginalParent) {
            noPermission._mcsOriginalParent = noPermission.parentElement;
        }

        if (noPermission.parentElement !== pageContent) {
            pageContent.appendChild(noPermission);
        }

        root.classList.add('is-permission-hidden');

        noPermission.hidden = false;

        document.documentElement.classList.add('catalog-permission-denied');

        document.body.classList.add('catalog-permission-denied');

        root.dataset.permissionDenied = 'true';
    }

    function hideNoPermission() {
        const pageContent = root.closest('.page-content') || document.querySelector('.page-content');

        const noPermission =
            pageContent?.querySelector(':scope > [data-catalog-no-permission]') ||
            document.querySelector('[data-catalog-no-permission]');

        if (noPermission) {
            noPermission.hidden = true;

            const originalParent = noPermission._mcsOriginalParent;

            if (originalParent && originalParent.isConnected) {
                originalParent.appendChild(noPermission);
            }
        }

        root.classList.remove('is-permission-hidden');

        document.documentElement.classList.remove('catalog-permission-denied');

        document.body.classList.remove('catalog-permission-denied');

        delete root.dataset.permissionDenied;
    }

    function sanitizeRichTextHtml(value) {
        const allowedTags = new Set([
            'B',
            'STRONG',
            'I',
            'EM',
            'U',
            'P',
            'DIV',
            'BR',
            'SPAN',
            'A',
            'UL',
            'OL',
            'LI',
            'BLOCKQUOTE'
        ]);

        const template = document.createElement('template');

        template.innerHTML = String(value || '');

        cleanNode(template.content);

        return template.innerHTML;

        function cleanNode(parent) {
            Array.from(parent.childNodes).forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                const tag = node.tagName;

                if (!allowedTags.has(tag)) {
                    const fragment = document.createDocumentFragment();

                    while (node.firstChild) {
                        fragment.appendChild(node.firstChild);
                    }

                    node.replaceWith(fragment);

                    cleanNode(parent);

                    return;
                }

                Array.from(node.attributes).forEach((attribute) => {
                    const name = attribute.name.toLowerCase();

                    if (tag === 'A' && ['href', 'target', 'rel'].includes(name)) {
                        return;
                    }

                    if (name === 'style') {
                        const safeStyle = sanitizeRichTextStyle(tag, attribute.value);

                        if (safeStyle) {
                            node.setAttribute('style', safeStyle);

                            return;
                        }
                    }

                    if (tag === 'OL' && name === 'start') {
                        const start = Number(attribute.value);

                        if (Number.isInteger(start) && start > 0) {
                            return;
                        }
                    }

                    node.removeAttribute(attribute.name);
                });

                if (tag === 'A') {
                    const href = normalizeRichTextUrl(node.getAttribute('href'));

                    if (!href) {
                        node.removeAttribute('href');
                        node.removeAttribute('target');
                        node.removeAttribute('rel');
                    } else {
                        node.setAttribute('href', href);

                        node.setAttribute('target', '_blank');

                        node.setAttribute('rel', 'noopener noreferrer');
                    }
                }

                cleanNode(node);
            });
        }
    }

    function sanitizeRichTextStyle(tag, value) {
        const style = String(value || '').trim();

        if (!style) {
            return '';
        }

        const safe = [];

        style.split(';').forEach((declaration) => {
            const index = declaration.indexOf(':');

            if (index < 0) {
                return;
            }

            const property = declaration.slice(0, index).trim().toLowerCase();

            const propertyValue = declaration
                .slice(index + 1)
                .trim()
                .toLowerCase();

            if (
                tag === 'SPAN' &&
                property === 'font-size' &&
                /^(6|8|10|12|14|16|18|20|22|24|26|28|30|32|36|40|48)px$/i.test(propertyValue)
            ) {
                safe.push(`font-size: ${propertyValue}`);

                return;
            }

            if (
                ['P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(tag) &&
                property === 'text-align' &&
                ['left', 'center', 'right', 'justify'].includes(propertyValue)
            ) {
                safe.push(`text-align: ${propertyValue}`);

                return;
            }

            if (
                ['P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(tag) &&
                property === 'margin-left' &&
                /^(20|40|60|80|100|120)px$/i.test(propertyValue)
            ) {
                safe.push(`margin-left: ${propertyValue}`);
            }
        });

        return safe.join('; ');
    }

    function normalizeRichTextUrl(value) {
        const url = String(value || '').trim();

        if (!url) {
            return null;
        }

        if (/^localhost(?::\d+)?(?:\/.*)?$/i.test(url)) {
            return `http://${url}`;
        }

        if (/^www\./i.test(url)) {
            return `https://${url}`;
        }

        if (url.startsWith('/') || url.startsWith('#')) {
            return url;
        }

        if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
            return url;
        }

        if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) {
            return `https://${url}`;
        }

        return null;
    }

    function stripHtml(value) {
        const element = document.createElement('div');

        element.innerHTML = String(value || '');

        return (element.textContent || element.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function escapeAttribute(value) {
        return escapeHtml(value);
    }

    function formatRelativeTime(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const diff = Math.max(0, Date.now() - date.getTime());

        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) {
            return 'Vừa xong';
        }

        if (minutes < 60) {
            return `${minutes} phút trước`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} giờ trước`;
        }

        const days = Math.floor(hours / 24);

        if (days === 1) {
            return 'Hôm qua';
        }

        if (days < 7) {
            return `${days} ngày trước`;
        }

        return date.toLocaleDateString('vi-VN');
    }

    function formatDateTime(value) {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '-';
        }

        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    }
});
