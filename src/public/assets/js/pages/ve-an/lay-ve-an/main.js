"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const app = window.KitchenFlowLayVeAn;

    if (!app) {
        return;
    }

    const {
        root,
        permission,
        state,
        el
    } = app;

    const bindDiscountSearch = (...args) => app.bindDiscountSearch(...args);
    const bindDoiTuongLayVeEvents = (...args) => app.bindDoiTuongLayVeEvents(...args);
    const bindGiaTriMienGiamInput = (...args) => app.bindGiaTriMienGiamInput(...args);
    const canChangeFinancialFields = (...args) => app.canChangeFinancialFields(...args);
    const changeDiscountTab = (...args) => app.changeDiscountTab(...args);
    const confirmCurrentPayment = (...args) => app.confirmCurrentPayment(...args);
    const closeQrModal = (...args) => app.closeQrModal(...args);
    const loadCurrentQr = (...args) => app.loadCurrentQr(...args);
    const recreateQr = (...args) => app.recreateQr(...args);

    const enhanceQuantityField = (...args) => {
        if (
            typeof app
                .enhanceQuantityField !==
            "function"
        ) {
            console.warn(
                "enhanceQuantityField chưa được khởi tạo."
            );

            return;
        }

        return app
            .enhanceQuantityField(
                ...args
            );
    };

    const handlePay = (...args) => app.handlePay(...args);
    const loadDoiTuongOrderSetting = (...args) => app.loadDoiTuongOrderSetting(...args);
    const loadEmployees = (...args) => app.loadEmployees(...args);
    const loadEnum = (...args) => app.loadEnum(...args);
    const loadGiaVePreview = (...args) => app.loadGiaVePreview(...args);
    const loadPaymentVisibleSetting = (...args) => app.loadPaymentVisibleSetting(...args);
    const loadThucDonNgay = (...args) => app.loadThucDonNgay(...args);
    const markDraftDirty = (...args) => app.markDraftDirty(...args);
    const normalizeQuantity = (...args) => app.normalizeQuantity(...args);
    const openRefundModal = (...args) => app.openRefundModal(...args);
    const rememberDailyMealSelection = (...args) => app.rememberDailyMealSelection(...args);
    const renderEmployee = (...args) => app.renderEmployee(...args);
    const renderMeal = (...args) => app.renderMeal(...args);
    const renderOptions = (...args) => app.renderOptions(...args);
    const renderPermissionActions = (...args) => app.renderPermissionActions(...args);
    const renderPersonMode = (...args) => app.renderPersonMode(...args);
    const renderSummary = (...args) => app.renderSummary(...args);
    const restoreDailyMealSelection = (...args) => app.restoreDailyMealSelection(...args);
    const restoreDoiTuongSelection = (...args) => app.restoreDoiTuongSelection(...args);
    const restoreEmployee = (...args) => app.restoreEmployee(...args);
    const restoreSelectedMeal = (...args) => app.restoreSelectedMeal(...args);
    const setLoading = (...args) => app.setLoading(...args);
    const showError = (...args) => app.showError(...args);
    const showNoPermission = (...args) => app.showNoPermission(...args);
    const cancelQr = (...args) => app.cancelQr(...args);
    const closeCancelPhieuModal = (...args) => app.closeCancelPhieuModal(...args);
    const closeDiscountModal = (...args) => app.closeDiscountModal(...args);
    const closeRefundModal = (...args) => app.closeRefundModal(...args);
    const createManualDiscount = (...args) => app.createManualDiscount(...args);
    const handleLayVeStorageChange = (...args) => app.handleLayVeStorageChange(...args);
    const handleNewTicket = (...args) => app.handleNewTicket(...args);
    const openCancelPhieuModal = (...args) => app.openCancelPhieuModal(...args);
    const openDiscountModal = (...args) => app.openDiscountModal(...args);
    const printTicket = (...args) => app.printTicket(...args);
    const submitCancelPhieu = (...args) => app.submitCancelPhieu(...args);
    const submitRefundModal = (...args) => app.submitRefundModal(...args);
    const isExistingPage = (...args) => app.isExistingPage(...args);
    const isCreatePage = (...args) => app.isCreatePage(...args);
    const loadExistingPhieu = (...args) => app.loadExistingPhieu(...args);
    const reloadDiscounts = (...args) => app.reloadDiscounts(...args);
    const reloadPaymentState = (...args) => app.reloadPaymentState(...args);
    const renderQrPanel = (...args) => app.renderQrPanel(...args);
    const renderStateActions = (...args) => app.renderStateActions(...args);
    const setSelectedPaymentMethod = (...args) => app.setSelectedPaymentMethod(...args);
    const startQrPolling = (...args) => app.startQrPolling(...args);
    const cancelPayment = (...args) => app.cancelPayment(...args);

    if (!root) {
        return;
    }

    try {
        setLoading(true);

        state.permissions = await permission.load();

        if (
            !permission.canAccessTakePage(state.permissions)
        ) {
            showNoPermission();
            return;
        }

        app.hideNoPermission();

        await Promise.all([
            loadThucDonNgay(),
            loadEnum("doiTuongLayVe", value => {
                state.doiTuong = value;
            }),
            loadEnum("gioiTinh", value => {
                state.gioiTinh = value;
            }),
            loadEnum("phuongThucThanhToan", value => {
                state.paymentMethods = value;
            }),
            loadEnum("loaiMienGiam", value => {
                state.discountTypes = value;
            }),
            loadEnum("trangThaiPhieuThu", value => {
                state.phieuStatuses = value;
            }),
            loadEnum("trangThaiThanhToan", value => {
                state.paymentStatuses = value;
            }),
            loadEnum(
                "loaiGiaoDich",
                value => {
                    state.transactionTypes = value;
                }
            ),
            loadEmployees(),
            loadDoiTuongOrderSetting(),
            loadPaymentVisibleSetting()
        ]);

        renderOptions();
        enhanceQuantityField();

        if (isExistingPage()) {
            if (
                !permission.canViewPhieu(state.permissions)
            ) {
                showNoPermission();
                return;
            }
            await loadExistingPhieu(app.pageContext.recordId);
            const tasks = [
                reloadDiscounts()
            ];

            if (
                permission.canViewPayment(
                    state.permissions
                ) ||
                permission.canViewPaymentDocuments(
                    state.permissions
                ) ||
                permission.canViewPaymentDetail(
                    state.permissions
                )
            ) {
                tasks.push(
                    reloadPaymentState()
                );
            }

            await Promise.all(
                tasks
            );

            const existingPaymentMethod =
                state.payment?.phuongThuc ??
                state.phieu?.phuongThucThanhToan;

            if (
                existingPaymentMethod !==
                    null &&
                existingPaymentMethod !==
                    undefined
            ) {
                setSelectedPaymentMethod(
                    existingPaymentMethod
                );
            }

            renderMeal();
            renderPersonMode(
                state.phieu?.doiTuongLayVe
            );
            renderEmployee();
            renderQrPanel();
            renderSummary();
            renderPermissionActions();
            renderStateActions();

            if (state.qrPayment?.id) {
                startQrPolling();
            }
        } else if (isCreatePage()) {
            restoreDailyMealSelection();
            restoreDoiTuongSelection();
            renderMeal();
            renderPersonMode();
            renderEmployee();
            await loadGiaVePreview(false);
            renderSummary();
            renderPermissionActions();
        } else {
            throw new Error("Đường dẫn phiếu lấy vé không hợp lệ.");
        }

        bindEvents();
    } catch (error) {
        showError(error, "Không thể khởi tạo trang lấy vé ăn.");
    } finally {
        setLoading(false);
    }

    function bindEvents() {
        el.thucDonNgayId?.addEventListener("change", async () => {
            if (!canChangeFinancialFields()) {
                restoreSelectedMeal();
                return;
            }

            rememberDailyMealSelection();
            renderMeal();
            await loadGiaVePreview(true);
            renderSummary();
            markDraftDirty();
        });

        el.newTicket?.addEventListener(
            "click",
            handleNewTicket
        );

        bindDoiTuongLayVeEvents();

        el.nhanVienId
            ?.addEventListener(
                "change",
                () => {
                    renderEmployee();
                    markDraftDirty();
                }
            );

        el.soLuong?.addEventListener("input", () => {
            if (!canChangeFinancialFields()) {
                el.soLuong.value = String(state.phieu?.soLuong || 1);
                return;
            }

            normalizeQuantity();
            renderSummary();
            markDraftDirty();
        });

        root.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
            if (!canChangeFinancialFields()) {
                return;
            }

            el.soLuong.value = String(
                Math.max(1, Number(el.soLuong.value || 1) - 1)
            );

            renderSummary();
            markDraftDirty();
        });

        root.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
            if (!canChangeFinancialFields()) {
                return;
            }

            el.soLuong.value = String(
                Math.max(1, Number(el.soLuong.value || 1) + 1)
            );

            renderSummary();
            markDraftDirty();
        });

        el.viewQr
            ?.addEventListener(
                "click",
                async () => {
                    await loadCurrentQr();
                }
            );

        el.recreateQr
            ?.addEventListener(
                "click",
                recreateQr
            );

        el.cancelQr
            ?.addEventListener(
                "click",
                cancelQr
            );

        el.mainPaymentAction?.addEventListener(
            "click",
            async () => {
                const action =
                    el.mainPaymentAction
                        .dataset
                        .action;

                if (action === "pay") {
                    await handlePay();
                    return;
                }

                if (action === "confirm") {
                    await confirmCurrentPayment();
                    return;
                }

                if (action === "refund") {
                    openRefundModal();
                }
            }
        );

        root.querySelectorAll("[data-refund-close]").forEach(button => {
            button.addEventListener("click", closeRefundModal);
        });

        el.refundSubmit?.addEventListener("click", submitRefundModal);
        el.discountOpen?.addEventListener("click", openDiscountModal);
        el.print?.addEventListener("click", printTicket);

        el.cancelPhieu?.addEventListener(
            "click",
            openCancelPhieuModal
        );

        root
            .querySelectorAll(
                "[data-cancel-phieu-close]"
            )
            .forEach(
                button => {
                    button.addEventListener(
                        "click",
                        closeCancelPhieuModal
                    );
                }
            );

        el.cancelPhieuSubmit
            ?.addEventListener(
                "click",
                submitCancelPhieu
            );

        root.querySelectorAll("[data-discount-close]").forEach(button => {
            button.addEventListener("click", closeDiscountModal);
        });

        root.querySelectorAll("[data-discount-tab]").forEach(button => {
            button.addEventListener("click", () =>
                changeDiscountTab(button.dataset.discountTab)
            );
        });

        el.discountCreate?.addEventListener(
            "click",
            createManualDiscount
        );

        root
            .querySelectorAll(
                "[data-qr-modal-close]"
            )
            .forEach(
                button => {
                    button.addEventListener(
                        "click",
                        closeQrModal
                    );
                }
            );

        el.qrModalCancel
            ?.addEventListener(
                "click",
                cancelQr
            );

        el.qrModalRecreate
            ?.addEventListener(
                "click",
                recreateQr
            );

        el.qrModalConfirm
            ?.addEventListener(
                "click",
                confirmCurrentPayment
            );

        el.cancelPayment
            ?.addEventListener(
                "click",
                cancelPayment
            );

        bindDiscountSearch();
        bindGiaTriMienGiamInput();

        if (isCreatePage()) {
            window.addEventListener(
                "storage",
                handleLayVeStorageChange
            );
        }
    }
});