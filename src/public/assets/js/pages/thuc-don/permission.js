'use strict';

window.MCS = window.MCS || {};

window.ThucDon = window.ThucDon || {};

window.ThucDon.permission = (() => {
    const CODES = Object.freeze({
        VIEW: 'Q001001',

        CREATE: 'Q001002',

        UPDATE: 'Q001003',

        UPDATE_EXPIRED: 'Q001004',

        DELETE: 'Q001005',

        APPROVE: 'Q001006',

        UNAPPROVE: 'Q001007',

        CANCEL: 'Q001008',

        RESTORE: 'Q001009'
    });

    let permissionCache = null;

    let permissionPromise = null;

    function normalize(value) {
        return String(value || '')
            .trim()
            .toUpperCase();
    }

    function extractPermissions(response) {
        const data = response?.data ?? response ?? {};

        const result = [];

        if (Array.isArray(data.permissions)) {
            data.permissions.forEach((permission) => {
                const code = normalize(permission);

                if (code) {
                    result.push(code);
                }
            });
        }

        if (Array.isArray(data.dsQuyen)) {
            data.dsQuyen.forEach((permission) => {
                const code = normalize(permission?.maQuyen ?? permission?.ma_quyen);

                if (code) {
                    result.push(code);
                }
            });
        }

        return new Set(result);
    }

    async function load(force = false) {
        if (permissionCache && !force) {
            return permissionCache;
        }

        if (permissionPromise && !force) {
            return permissionPromise;
        }

        permissionPromise = window.MCS.api
            .request('/api/mcs/v1/auth/nhan-vien-hien-tai')
            .then((response) => {
                permissionCache = extractPermissions(response);

                return permissionCache;
            })
            .finally(() => {
                permissionPromise = null;
            });

        return permissionPromise;
    }

    function has(permissions, code) {
        if (!(permissions instanceof Set)) {
            return false;
        }

        return permissions.has(normalize(code));
    }

    function hasAny(permissions, ...codes) {
        return codes.some((code) => has(permissions, code));
    }

    function canView(permissions) {
        return hasAny(
            permissions,

            CODES.VIEW,
            CODES.CREATE,
            CODES.UPDATE,
            CODES.UPDATE_EXPIRED
        );
    }

    function canCreate(permissions) {
        return hasAny(
            permissions,

            CODES.CREATE,
            CODES.UPDATE,
            CODES.UPDATE_EXPIRED
        );
    }

    function canUpdate(permissions) {
        return hasAny(
            permissions,

            CODES.UPDATE,
            CODES.UPDATE_EXPIRED
        );
    }

    function canUpdateExpired(permissions) {
        return has(permissions, CODES.UPDATE_EXPIRED);
    }

    function canDelete(permissions) {
        return has(permissions, CODES.DELETE);
    }

    function canApprove(permissions) {
        return has(permissions, CODES.APPROVE);
    }

    function canUnapprove(permissions) {
        return has(permissions, CODES.UNAPPROVE);
    }

    function canCancel(permissions) {
        return has(permissions, CODES.CANCEL);
    }

    function canRestore(permissions) {
        return has(permissions, CODES.RESTORE);
    }

    function canUpdateRecord(permissions, data) {
        if (isExpired(data)) {
            return canUpdateExpired(permissions);
        }

        return canUpdate(permissions);
    }

    function isExpired(data) {
        if (Number(data?.trangThai) === 60) {
            return true;
        }

        const denNgay = normalizeDate(data?.denNgay);

        if (!denNgay) {
            return false;
        }

        return denNgay < todayVietnam();
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

        const values = Object.fromEntries(parts.map((item) => [item.type, item.value]));

        return `${values.year}-` + `${values.month}-` + `${values.day}`;
    }

    function todayVietnam() {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',

            year: 'numeric',

            month: '2-digit',

            day: '2-digit'
        }).formatToParts(new Date());

        const values = Object.fromEntries(parts.map((item) => [item.type, item.value]));

        return `${values.year}-` + `${values.month}-` + `${values.day}`;
    }

    function showNoPermission(root) {
        if (!root) {
            return;
        }

        const pageContent = root.closest('.page-content') || document.querySelector('.page-content');

        if (!pageContent) {
            console.warn('Không tìm thấy .page-content.');

            return;
        }

        const noPermission =
            root.querySelector('[data-catalog-no-permission]') ||
            document.querySelector('[data-catalog-no-permission]');

        if (!noPermission) {
            console.warn('Không tìm thấy form không đủ quyền truy cập.');

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

    function hideNoPermission(root) {
        if (!root) {
            return;
        }

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

    return {
        CODES,

        load,

        has,
        hasAny,

        canView,
        canCreate,
        canUpdate,
        canUpdateExpired,
        canUpdateRecord,

        canDelete,
        canApprove,
        canUnapprove,
        canCancel,
        canRestore,

        isExpired,

        showNoPermission,
        hideNoPermission
    };
})();
