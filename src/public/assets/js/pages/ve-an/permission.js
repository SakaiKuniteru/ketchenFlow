"use strict";

window.MCS = window.MCS || {};
window.LayVeAn = window.LayVeAn || {};

window.LayVeAn.permission = (() => {
    const CODES = Object.freeze({
        PHIEU_VIEW: "Q001032",
        PHIEU_CREATE: "Q001033",
        PHIEU_UPDATE: "Q001034",
        PHIEU_CANCEL: "Q001035",
        PHIEU_PRINT: "Q001036",

        DISCOUNT_VIEW: "Q001037",
        DISCOUNT_CREATE: "Q001038",
        DISCOUNT_UPDATE: "Q001039",
        DISCOUNT_DELETE: "Q001040",

        PAYMENT_VIEW: "Q001041",
        PAYMENT_CREATE: "Q001042",
        PAYMENT_QR_CREATE: "Q001043",
        PAYMENT_QR_CANCEL: "Q001044",
        PAYMENT_CONFIRM: "Q001045",
        PAYMENT_REFUND: "Q001046",

        TICKET_VIEW: "Q001047",
        TICKET_CHECK: "Q001048",
        TICKET_USE: "Q001049",
        TICKET_CANCEL: "Q001050"
    });

    let cache = null;
    let promise = null;

    function normalize(value) {
        return String(value || "").trim().toUpperCase();
    }

    function extractPermissions(response) {
        const data = response?.data ?? response ?? {};
        const result = [];

        if (Array.isArray(data.permissions)) {
            data.permissions.forEach(item => {
                const code = normalize(
                    typeof item === "string"
                        ? item
                        : item?.maQuyen ?? item?.ma_quyen ?? item?.code
                );

                if (code) {
                    result.push(code);
                }
            });
        }

        if (Array.isArray(data.dsQuyen)) {
            data.dsQuyen.forEach(item => {
                const code = normalize(
                    item?.maQuyen ?? item?.ma_quyen ?? item
                );

                if (code) {
                    result.push(code);
                }
            });
        }

        return new Set(result);
    }

    async function load(force = false) {
        if (cache && !force) {
            return cache;
        }

        if (promise && !force) {
            return promise;
        }

        promise = window.MCS.api
            .request("/api/mcs/v1/auth/nhan-vien-hien-tai")
            .then(response => {
                cache = extractPermissions(response);
                return cache;
            })
            .finally(() => {
                promise = null;
            });

        return promise;
    }

    function has(permissions, code) {
        return permissions instanceof Set &&
            permissions.has(normalize(code));
    }

    function hasAny(permissions, ...codes) {
        return codes.some(code => has(permissions, code));
    }

    function canAccessPage(permissions) {
        return hasAny(
            permissions,
            CODES.PHIEU_VIEW,
            CODES.PHIEU_CREATE,
            CODES.PHIEU_UPDATE
        );
    }

    function canCreatePhieu(permissions) {
        // Backend route /them-moi cho phép Q001033 hoặc Q001034.
        return hasAny(
            permissions,
            CODES.PHIEU_CREATE,
            CODES.PHIEU_UPDATE
        );
    }

    function canUpdatePhieu(permissions) {
        return has(permissions, CODES.PHIEU_UPDATE);
    }

    return {
        CODES,
        load,
        has,
        hasAny,
        canAccessPage,
        canCreatePhieu,
        canUpdatePhieu,
        canCancelPhieu: p => has(p, CODES.PHIEU_CANCEL),
        canPrint: p => has(p, CODES.PHIEU_PRINT),

        canViewDiscount: p => hasAny(
            p,
            CODES.DISCOUNT_VIEW,
            CODES.DISCOUNT_CREATE,
            CODES.DISCOUNT_UPDATE
        ),
        canCreateDiscount: p => hasAny(
            p,
            CODES.DISCOUNT_CREATE,
            CODES.DISCOUNT_UPDATE
        ),
        canUpdateDiscount: p => has(p, CODES.DISCOUNT_UPDATE),
        canDeleteDiscount: p => has(p, CODES.DISCOUNT_DELETE),

        canViewPayment: p => hasAny(
            p,
            CODES.PAYMENT_VIEW,
            CODES.PAYMENT_CREATE,
            CODES.PAYMENT_QR_CREATE,
            CODES.PAYMENT_QR_CANCEL,
            CODES.PAYMENT_CONFIRM,
            CODES.PAYMENT_REFUND
        ),
        canCreatePayment: p => has(p, CODES.PAYMENT_CREATE),
        canCreateQr: p => has(p, CODES.PAYMENT_QR_CREATE),
        canCancelQr: p => has(p, CODES.PAYMENT_QR_CANCEL),
        canConfirmPayment: p => has(p, CODES.PAYMENT_CONFIRM),
        canRefund: p => has(p, CODES.PAYMENT_REFUND),

        canViewTicket: p => hasAny(
            p,
            CODES.TICKET_VIEW,
            CODES.TICKET_CHECK,
            CODES.TICKET_USE,
            CODES.TICKET_CANCEL
        )
    };
})();
