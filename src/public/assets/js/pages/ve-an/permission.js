"use strict";

window.MCS = window.MCS || {};
window.LayVeAn = window.LayVeAn || {};

window.LayVeAn.permission = (() => {
    const CODES = Object.freeze({
        PAGE_LIST: "Q000030",
        PAGE_TAKE: "Q000031",

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
        TICKET_CANCEL: "Q001050",

        PHIEU_VALID_MEAL: "Q001051",
        PHIEU_PRICE: "Q001052",

        DISCOUNT_AVAILABLE: "Q001053",
        DISCOUNT_APPLY: "Q001054",
        DISCOUNT_DETAIL: "Q001055",

        PAYMENT_QR_VIEW: "Q001056",
        PAYMENT_DOCUMENT_LIST: "Q001058",
        PAYMENT_REFUND_PRINT: "Q001059",
        PAYMENT_DETAIL: "Q001060",

        TICKET_DETAIL: "Q001061"
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
                    item?.maQuyen ??
                    item?.ma_quyen ??
                    item
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
            permissions.has(
                normalize(code)
            );
    }

    function hasAny(permissions, ...codes) {
        return codes.some(
            code => has(
                permissions,
                code
            )
        );
    }

    function showNoPermission(root) {
        if (root) {
            root.hidden = true;
        }

        const noPermission = document.querySelector(
            "[data-catalog-no-permission]"
        );

        if (noPermission) {
            noPermission.hidden = false;
        }
    }

    function hideNoPermission(root) {
        if (root) {
            root.hidden = false;
        }

        const noPermission = document.querySelector(
            "[data-catalog-no-permission]"
        );

        if (noPermission) {
            noPermission.hidden = true;
        }
    }

    return {
        CODES,
        load,
        has,
        hasAny,
        showNoPermission,
        hideNoPermission,

        canAccessListPage: p =>
            has(
                p,
                CODES.PAGE_LIST
            ),

        canAccessTakePage: p =>
            has(
                p,
                CODES.PAGE_TAKE
            ),

        canAccessPage: p =>
            has(
                p,
                CODES.PAGE_TAKE
            ),

        canViewPhieu: p =>
            hasAny(
                p,
                CODES.PHIEU_VIEW,
                CODES.PHIEU_CREATE,
                CODES.PHIEU_UPDATE
            ),

        canCreatePhieu: p =>
            hasAny(
                p,
                CODES.PHIEU_CREATE,
                CODES.PHIEU_UPDATE
            ),

        canUpdatePhieu: p =>
            has(
                p,
                CODES.PHIEU_UPDATE
            ),

        canCancelPhieu: p =>
            has(
                p,
                CODES.PHIEU_CANCEL
            ),

        canPrint: p =>
            has(
                p,
                CODES.PHIEU_PRINT
            ),

        canLoadValidMeals: p =>
            has(
                p,
                CODES.PHIEU_VALID_MEAL
            ),

        canLoadPrice: p =>
            has(
                p,
                CODES.PHIEU_PRICE
            ),

        canViewDiscount: p =>
            has(
                p,
                CODES.DISCOUNT_VIEW
            ),

        canCreateDiscount: p =>
            hasAny(
                p,
                CODES.DISCOUNT_CREATE,
                CODES.DISCOUNT_UPDATE
            ),

        canUpdateDiscount: p =>
            has(
                p,
                CODES.DISCOUNT_UPDATE
            ),

        canDeleteDiscount: p =>
            has(
                p,
                CODES.DISCOUNT_DELETE
            ),

        canLoadAvailableDiscount: p =>
            has(
                p,
                CODES.DISCOUNT_AVAILABLE
            ),

        canApplyDiscount: p =>
            has(
                p,
                CODES.DISCOUNT_APPLY
            ),

        canViewDiscountDetail: p =>
            hasAny(
                p,
                CODES.DISCOUNT_DETAIL,
                CODES.DISCOUNT_CREATE,
                CODES.DISCOUNT_UPDATE
            ),

        canViewPayment: p =>
            has(
                p,
                CODES.PAYMENT_VIEW
            ),

        canCreatePayment: p =>
            has(
                p,
                CODES.PAYMENT_CREATE
            ),

        canCreateQr: p =>
            has(
                p,
                CODES.PAYMENT_QR_CREATE
            ),

        canCancelQr: p =>
            has(
                p,
                CODES.PAYMENT_QR_CANCEL
            ),

        canConfirmPayment: p =>
            has(
                p,
                CODES.PAYMENT_CONFIRM
            ),

        canRefund: p =>
            has(
                p,
                CODES.PAYMENT_REFUND
            ),

        canCancelPayment: p =>
            has(
                p,
                CODES.PAYMENT_REFUND
            ),

        canViewQr: p =>
            hasAny(
                p,
                CODES.PAYMENT_QR_VIEW,
                CODES.PAYMENT_QR_CREATE,
                CODES.PAYMENT_QR_CANCEL,
                CODES.PAYMENT_CONFIRM
            ),

        canViewPaymentDocuments: p =>
            has(
                p,
                CODES.PAYMENT_DOCUMENT_LIST
            ),

        canPrintRefund: p =>
            has(
                p,
                CODES.PAYMENT_REFUND_PRINT
            ),

        canViewPaymentDetail: p =>
            has(
                p,
                CODES.PAYMENT_DETAIL
            ),

        canViewTicket: p =>
            has(
                p,
                CODES.TICKET_VIEW
            ),

        canCheckTicket: p =>
            has(
                p,
                CODES.TICKET_CHECK
            ),

        canUseTicket: p =>
            has(
                p,
                CODES.TICKET_USE
            ),

        canCancelTicket: p =>
            has(
                p,
                CODES.TICKET_CANCEL
            ),

        canViewTicketDetail: p =>
            has(
                p,
                CODES.TICKET_DETAIL
            )
    };
})();