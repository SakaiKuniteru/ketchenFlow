"use strict";

(() => {
    const app = window.KitchenFlowLayVeAn;

    if (!app) {
        return;
    }

    const {
        root,
        permission,
        API,
        state,
        el
    } = app;

    const QR_MIN_LOADING_MS = 1000;

    const confirmAction = (...args) => app.confirmAction(...args);
    const escapeHtml = (...args) => app.escapeHtml(...args);
    const fillSelect = (...args) => app.fillSelect(...args);
    const formatMoney = (...args) => app.formatMoney(...args);
    const getEnumLabel = (...args) => app.getEnumLabel(...args);
    const isPhieuStatus = (...args) => app.isPhieuStatus(...args);
    const normalizeList = (...args) => app.normalizeList(...args);
    const normalizeSearchText = (...args) => app.normalizeSearchText(...args);
    const reloadPhieu = (...args) => app.reloadPhieu(...args);
    const renderSummary = (...args) => app.renderSummary(...args);
    const renderEditLocks = (...args) => app.renderEditLocks(...args);
    const request = (...args) => app.request(...args);
    const saveDraft = (...args) => app.saveDraft(...args);
    const setLoading = (...args) => app.setLoading(...args);
    const setSelectValue = (...args) => app.setSelectValue(...args);
    const showError = (...args) => app.showError(...args);
    const toPositiveInt = (...args) => app.toPositiveInt(...args);

    function resetPaymentSelection() {
        const radios = el.paymentMethodList
            ?.querySelectorAll(
                'input[name="phuongThucThanhToan"]'
            );

        if (!radios?.length) {
            state.selectedPaymentMethod = null;
            return;
        }

        radios.forEach(
            (
                radio,
                index
            ) => {
                radio.checked = index === 0;
            }
        );

        const first = radios[0];

        state.selectedPaymentMethod =
            first?.value
                ? Number(first.value)
                : null;

        el.paymentMethodList
            ?.querySelectorAll(
                "[data-payment-option]"
            )
            .forEach(
                option => {
                    option.classList
                        .remove(
                            "is-selected"
                        );
                }
            );

        first
            ?.closest(
                "[data-payment-option]"
            )
            ?.classList
            ?.add(
                "is-selected"
            );
    }

    function setSelectedPaymentMethod(value) {
        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {
            return;
        }

        const methodValue = Number(value);

        if (
            !Number.isFinite(methodValue)
        ) {
            return;
        }

        state.selectedPaymentMethod = methodValue;

        const radios = Array.from(
            el.paymentMethodList
                ?.querySelectorAll(
                    'input[name="phuongThucThanhToan"]'
                ) ||
            []
        );

        radios.forEach(
            radio => {
                radio.checked =
                    Number(
                        radio.value
                    ) ===
                    methodValue;
            }
        );

        el.paymentMethodList
            ?.querySelectorAll(
                "[data-payment-option]"
            )
            .forEach(
                option => {
                    option.classList.toggle(
                        "is-selected",
                        Number(
                            option.dataset.paymentOption
                        ) ===
                        methodValue
                    );
                }
            );
    }

    function renderPaymentMethods() {
        if (!el.paymentMethodList) {
            return;
        }

        const visible = state.paymentMethods
            .filter(
                item =>
                    state.paymentMethodVisibleValues
                        .includes(
                            Number(item.value)
                        )
            )
            .filter(
                item => {
                    const isQr = isQrMethod(
                        item
                    );

                    return isQr
                        ? permission.canCreateQr(
                            state.permissions
                        )
                        : permission.canCreatePayment(
                            state.permissions
                        );
                }
            );

        el.paymentSection.hidden =
            visible.length ===
            0;

        el.paymentMethodList.innerHTML = "";

        visible.forEach((item, index) => {
            const value = String(item.value);
            const methodValue = Number(item.value);

            const label = document.createElement("label");
            label.className = "lva-payment-option";
            label.dataset.paymentOption = value;

            const iconMap = {
                10: "fa-money-bill-wave",
                20: "fa-building-columns",
                30: "fa-qrcode"
            };

            const descMap = {
                10: "Thanh toán bằng tiền mặt",
                20: "Tạo giao dịch chuyển khoản",
                30: "Tạo giao dịch QR để thanh toán"
            };

            const icon = iconMap[methodValue] || "fa-money-bill-wave";
            const description = descMap[methodValue] || "Tạo giao dịch thanh toán";

            label.innerHTML = `
                <input
                    type="radio"
                    name="phuongThucThanhToan"
                    value="${escapeHtml(value)}"
                    ${index === 0 ? "checked" : ""}
                >
                <span class="lva-payment-option__icon">
                    <i class="fa-solid ${icon}"></i>
                </span>
                <span class="lva-payment-option__text">
                    <strong>${escapeHtml(item.label)}</strong>
                    <small>${description}</small>
                </span>
            `;

            el.paymentMethodList.appendChild(label);
        });

        const first = el.paymentMethodList.querySelector(
            'input[name="phuongThucThanhToan"]:checked'
        );

        state.selectedPaymentMethod =
            first?.value ? Number(first.value) : null;

        el.paymentMethodList
            .querySelectorAll('input[name="phuongThucThanhToan"]')
            .forEach(input => {
                input.addEventListener("change", () => {
                    state.selectedPaymentMethod = Number(input.value);

                    el.paymentMethodList
                        .querySelectorAll("[data-payment-option]")
                        .forEach(option => {
                            option.classList.toggle(
                                "is-selected",
                                option.dataset.paymentOption === input.value
                            );
                        });
                });
            });

        first?.closest("[data-payment-option]")?.classList.add("is-selected");
        renderEditLocks();
    }

    function renderPermissionActions() {
        if (el.newTicket) {
            el.newTicket.hidden =
                !permission.canCreatePhieu(
                    state.permissions
                );
        }

        if (el.discountOpen) {
            const canManual =
                permission.canCreateDiscount(
                    state.permissions
                );

            const canAvailable =
                permission.canLoadAvailableDiscount(
                    state.permissions
                ) &&
                permission.canApplyDiscount(
                    state.permissions
                );

            el.discountOpen.hidden =
                !canManual &&
                !canAvailable;
        }

        renderStateActions();
    }

    function renderStateActions() {
        const {
            isRefund,
            isPaid,
            isUnpaid,
            pendingQr
        } = getDocumentMode();

        const document = state.activePaymentDocument;

        const hasRefundForCurrentPayment =
            isPaid &&
            (
                state.paymentDocuments ||
                []
            ).some(
                item =>
                    item.loai ===
                        "PHIEU_HOAN" &&
                    Number(
                        item.thanhToanGocId
                    ) ===
                    Number(
                        document?.thanhToanId
                    )
            );

        const hasQr = Boolean(
            document?.qrThanhToanId
        );

        const qrMutable =
            hasQr &&
            isUnpaid &&
            pendingQr;

        if (el.print) {
            const canPrintDocument = isRefund
                ? permission.canPrintRefund(
                    state.permissions
                )
                : permission.canPrint(
                    state.permissions
                );

            el.print.hidden = !canPrintDocument;

            el.print.disabled =
                !(
                    isPaid || isRefund
                );
        }

        if (el.cancelPhieu) {
            el.cancelPhieu.hidden =
                !permission.canCancelPhieu(
                    state.permissions
                ) ||
                !isUnpaid;

            el.cancelPhieu.disabled = Boolean(
                state.familyHasRefund
            );
        }

        if (el.cancelPayment) {
            el.cancelPayment.hidden =
                !isPaid ||
                !permission.canCancelPayment(
                    state.permissions
                );

            el.cancelPayment.disabled =
                hasRefundForCurrentPayment;
        }

        if (el.viewQr) {
            el.viewQr.hidden =
                !hasQr ||
                !permission.canViewQr(
                    state.permissions
                );

            el.viewQr.disabled = false;
        }

        if (el.recreateQr) {
            el.recreateQr.hidden =
                !hasQr ||
                !permission.canCreateQr(
                    state.permissions
                );

            el.recreateQr.disabled =
                !qrMutable;
        }

        if (el.cancelQr) {
            el.cancelQr.hidden =
                !hasQr ||
                !permission.canCancelQr(
                    state.permissions
                );

            el.cancelQr.disabled =
                !qrMutable;
        }

        if (!el.mainPaymentAction) {
            renderEditLocks();
            renderPaymentInfo();
            return;
        }

        el.mainPaymentAction.hidden = true;
        el.mainPaymentAction.disabled = false;
        el.mainPaymentAction.dataset.action = "";

        const refundableQty =
            isPaid
                ? getRefundableQuantity()
                : 0;

        if (
            isPaid &&
            refundableQty > 0 &&
            permission.canRefund(
                state.permissions
            )
        ) {
            setMainPaymentAction({
                action: "refund",
                label: "Hoàn thanh toán",
                icon: "fa-rotate-left",
                type: "outline"
            });
        }

        else if (
            isUnpaid &&
            state.payment?.id &&
            permission.canConfirmPayment(
                state.permissions
            )
        ) {
            setMainPaymentAction({
                action: "confirm",
                label: "Duyệt",
                icon: "fa-check",
                type: "success"
            });
        }

        else if (
            isUnpaid &&
            !state.payment?.id &&
            (
                permission.canCreatePayment(
                    state.permissions
                ) ||
                permission.canCreateQr(
                    state.permissions
                )
            )
        ) {
            setMainPaymentAction({
                action: "pay",
                label: "Thanh toán",
                icon: "fa-credit-card",
                type: "primary"
            });
        }

        if (isRefund) {
            el.mainPaymentAction.hidden = true;
        }

        renderEditLocks();
        renderPaymentInfo();
    }

    function cancelPayment() {
        if (
            !state.payment?.id ||
            !permission.canCancelPayment(
                state.permissions
            )
        ) {
            return;
        }

        confirmAction(
            "Hủy thanh toán",
            "Bạn có chắc chắn muốn hủy thanh toán? Phiếu sẽ quay lại trạng thái chưa thanh toán.",
            "Hủy thanh toán",
            "danger",
            async () => {
                try {
                    setLoading(true);

                    await request(
                        `${API.payment}/huy-thanh-toan/${state.payment.id}`,
                        "PATCH",
                        {
                            noiDung: "Hủy thanh toán từ màn hình lấy vé ăn."
                        }
                    );

                    stopQrPolling();

                    state.qrPayment = null;
                    state.qrData = null;

                    await reloadPhieu();
                    await reloadPaymentState();

                    resetPaymentSelection();
                    renderQrPanel();
                    renderSummary();
                    renderStateActions();

                    window.MCS
                        ?.toast
                        ?.success
                        ?.(
                            "Đã hủy thanh toán. Phiếu đã quay lại trạng thái chưa thanh toán."
                        );
                } catch (error) {
                    showError(
                        error
                    );
                } finally {
                    setLoading(false);
                }
            }
        );
    }

    function setMainPaymentAction({
        action,
        label,
        icon,
        type
    }) {
        if (!el.mainPaymentAction) {
            return;
        }

        el.mainPaymentAction.hidden = false;
        el.mainPaymentAction.dataset.action = action;

        el.mainPaymentAction.classList.remove(
            "lva-btn--primary",
            "lva-btn--success",
            "lva-btn--outline",
            "lva-btn--danger",
            "lva-btn--danger-soft"
        );

        el.mainPaymentAction.classList.add(
            `lva-btn--${type}`
        );

        if (el.mainPaymentActionLabel) {
            el.mainPaymentActionLabel.textContent = label;
        }

        if (el.mainPaymentActionIcon) {
            el.mainPaymentActionIcon.className =
                `fa-solid ${icon}`;
        }
    }

    function renderPaymentInfo() {
        if (!el.paymentInfo) {
            return;
        }

        const phieu = state.phieu;
        const document = state.activePaymentDocument;

        const payment =
            document?.transaction ||
            state.payment;

        el.paymentInfo.hidden =
            !phieu?.id ||
            !payment;

        if (
            !phieu ||
            !payment
        ) {
            return;
        }

        const isRefund =
            document?.loai ===
            "PHIEU_HOAN";

        const method = state.paymentMethods.find(
            item =>
                Number(
                    item.value
                ) ===
                Number(
                    payment.phuongThuc
                )
        );

        /*
        * =============================
        * PHIẾU HOÀN
        * =============================
        */
        if (isRefund) {
            if (el.paymentInfoTitle) {
                el.paymentInfoTitle.textContent =
                    "Thông tin phiếu hoàn";
            }

            el.paymentStatusText.textContent =
                Number(
                    payment.trangThai
                ) ===
                    30
                    ? "Đã hoàn"
                    : (
                        getEnumLabel(
                            state.paymentStatuses,
                            payment.trangThai
                        ) ||
                        "-"
                    );

            el.paymentCode.textContent =
                payment.maGiaoDich ||
                "-";

            el.paymentMethodText.textContent =
                method?.label ||
                method?.name ||
                "-";

            if (el.paymentOriginalLabel) {
                el.paymentOriginalLabel.textContent =
                    "Số tiền hoàn:";
            }

            el.paymentOriginal.textContent =
                formatMoney(
                    payment.soTien
                );

            if (el.paymentDiscountLabel) {
                el.paymentDiscountLabel.textContent =
                    "Lý do hoàn:";
            }

            el.paymentDiscount.textContent =
                payment.noiDungLoi ||
                "-";

            if (el.paymentFinalRow) {
                el.paymentFinalRow.hidden = true;
            }

            if (el.paymentPayerLabel) {
                el.paymentPayerLabel.textContent =
                    "Người hoàn:";
            }

            el.paymentPayer.textContent =
                payment.tenNguoiXacNhan ||
                payment.nguoiXacNhanTenDangNhap ||
                (
                    payment.nguoiXacNhanId
                        ? `#${payment.nguoiXacNhanId}`
                        : "-"
                );

            if (el.paymentTimeLabel) {
                el.paymentTimeLabel.textContent =
                    "Thời gian hoàn:";
            }

            el.paymentTime.textContent =
                formatDateTime(
                    payment.thoiGianThanhToan ||
                    payment.createdAt
                );

            return;
        }

        /*
        * =============================
        * PHIẾU THU
        * =============================
        */

        if (el.paymentInfoTitle) {
            el.paymentInfoTitle.textContent =
                "Thông tin thanh toán";
        }

        if (el.paymentOriginalLabel) {
            el.paymentOriginalLabel.textContent =
                "Tiền ban đầu:";
        }

        if (el.paymentDiscountLabel) {
            el.paymentDiscountLabel.textContent =
                "Tiền miễn giảm:";
        }

        if (el.paymentFinalLabel) {
            el.paymentFinalLabel.textContent =
                "Thành tiền:";
        }

        if (el.paymentFinalRow) {
            el.paymentFinalRow.hidden = false;
        }

        if (el.paymentPayerLabel) {
            el.paymentPayerLabel.textContent =
                "Người thanh toán:";
        }

        if (el.paymentTimeLabel) {
            el.paymentTimeLabel.textContent =
                "Thời gian thanh toán:";
        }

        let statusText =
            getEnumLabel(
                state.paymentStatuses,
                payment.trangThai
            ) ||
            "-";

        if (
            Number(
                phieu.trangThai
            ) ===
                40 ||
            isPhieuStatus(
                "Đã thanh toán"
            )
        ) {
            statusText = "Đã thanh toán";
        } else if (
            Number(
                phieu.trangThai
            ) ===
                60 ||
            isPhieuStatus(
                "Đã hoàn"
            )
        ) {
            statusText = "Đã hoàn";
        } else if (
            Number(
                phieu.trangThai
            ) ===
                50 ||
            isPhieuStatus(
                "Đã hủy"
            ) ||
            isPhieuStatus(
                "Đã huỷ"
            )
        ) {
            statusText = "Đã hủy";
        } else if (
            isPhieuStatus(
                "Tạo QR"
            )
        ) {
            statusText = "Đã tạo QR";
        }

        el.paymentStatusText.textContent = statusText;

        el.paymentCode.textContent =
            payment.maGiaoDich ||
            payment.maThamChieu ||
            payment.maChuanChi ||
            "-";

        el.paymentMethodText.textContent =
            method?.label ||
            method?.name ||
            "-";

        el.paymentOriginal.textContent =
            Number.isFinite(
                Number(
                    phieu.tienGoc
                )
            )
                ? formatMoney(
                    Number(
                        phieu.tienGoc
                    )
                )
                : "-";

        el.paymentDiscount.textContent =
            Number.isFinite(
                Number(
                    phieu.tongMienGiam
                )
            )
                ? (
                    Number(
                        phieu.tongMienGiam
                    ) >
                        0
                        ? `-${formatMoney(
                            Number(
                                phieu.tongMienGiam
                            )
                        )}`
                        : "0 đ"
                )
                : "-";

        el.paymentFinal.textContent =
            Number.isFinite(
                Number(
                    phieu.thanhTien
                )
            )
                ? formatMoney(
                    Number(
                        phieu.thanhTien
                    )
                )
                : "-";

        el.paymentPayer.textContent =
            phieu.tenNguoiThanhToan ||
            phieu.nguoiThanhToanTenDangNhap ||
            payment.tenNguoiXacNhan ||
            payment.nguoiXacNhanTenDangNhap ||
            "-";

        el.paymentTime.textContent =
            formatDateTime(
                phieu.thoiGianThanhToan ||
                payment.thoiGianThanhToan ||
                payment.createdAt
            );
    }

    function formatDateTime(value) {
        if (!value) {
            return "-";
        }

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return "-";
        }

        const pad =
            number =>
                String(number)
                    .padStart(
                        2,
                        "0"
                    );

        const hh = pad(date.getHours());
        const mm = pad(date.getMinutes());
        const ss = pad(date.getSeconds());
        const dd = pad(date.getDate());
        const month = pad(date.getMonth() + 1);
        const yyyy = date.getFullYear();

        return `${hh}:${mm}:${ss} ${dd}/${month}/${yyyy}`;
    }

    function openRefundModal() {
        if (
            !permission.canRefund(
                state.permissions
            )
        ) {
            return;
        }

        const soLuongConLai = getRefundableQuantity();

        if (
            soLuongConLai <= 0
        ) {
            showError(
                new Error(
                    "Phiếu đã hoàn toàn bộ vé."
                )
            );

            return;
        }

        fillSelect(
            el.refundMethod,
            state.paymentMethods
                .filter(
                    item =>
                        state.paymentMethodVisibleValues
                            .includes(
                                Number(item.value)
                            )
                ),
            item => item.value,
            item => item.label
        );

        el.refundQty.value = String(
            soLuongConLai
        );

        el.refundQty.max = String(
            soLuongConLai
        );

        el.refundReason.value = "";

        setSelectValue(
            el.refundMethod,
            "10",
            false
        );

        el.refundModal.hidden = false;
    }

    function getRefundableQuantity() {
        const document = state.activePaymentDocument;

        if (
            document?.loai !==
                "PHIEU_THU" ||
            document?.trangThaiHienThi !==
                "DA_THANH_TOAN" ||
            !document?.thanhToanId
        ) {
            return 0;
        }

        const daHoan =
            (
                state.paymentDocuments ||
                []
            )
                .filter(
                    item =>
                        item.loai ===
                            "PHIEU_HOAN" &&
                        Number(
                            item.thanhToanGocId
                        ) ===
                        Number(
                            document.thanhToanId
                        )
                )
                .reduce(
                    (
                        total,
                        item
                    ) =>
                        total +
                        Number(
                            item.soLuong ||
                            0
                        ),
                    0
                );

        return Math.max(
            Number(
                document.soLuong ||
                0
            ) -
            daHoan,
            0
        );
    }

    function closeRefundModal() {
        if (el.refundModal) {
            el.refundModal.hidden = true;
        }
    }

    async function submitRefundModal() {
        const document = state.activePaymentDocument;

        if (
            document?.loai !==
                "PHIEU_THU" ||
            !document?.thanhToanId
        ) {
            showError(
                new Error(
                    "Không xác định được phiếu thu cần hoàn."
                )
            );

            return;
        }

        const soLuongHoan = Math.floor(
            Number(
                el.refundQty?.value ||
                0
            )
        );

        const soLuongConLai = getRefundableQuantity();

        const lyDoHoan = String(
            el.refundReason?.value ||
            ""
        ).trim();

        const phuongThucHoan = Number(
            el.refundMethod?.value ||
            10
        );

        if (
            !Number.isInteger(
                soLuongHoan
            ) ||
            soLuongHoan < 1 ||
            soLuongHoan > soLuongConLai
        ) {
            showError(
                new Error(
                    `Số lượng hoàn phải từ 1 đến ${soLuongConLai}.`
                )
            );

            return;
        }

        if (!lyDoHoan) {
            showError(
                new Error(
                    "Vui lòng nhập lý do hoàn."
                )
            );

            return;
        }

        try {
            setLoading(true);

            const response = await request(
                `${API.payment}/hoan-tien`,
                "POST",
                {
                    thanhToanId: Number(
                        document.thanhToanId
                    ),
                    soLuongHoan,
                    lyDoHoan,
                    phuongThuc: phuongThucHoan
                }
            );

            closeRefundModal();

            window.MCS
                ?.toast
                ?.success
                ?.(
                    "Hoàn thanh toán thành công."
                );

            const phieuMoiId = Number(
                response?.data?.phieuMoiId
            );

            /*
            * Hoàn xong luôn chuyển sang
            * phiếu CHƯA THANH TOÁN vừa sinh.
            */
            if (
                Number.isInteger(
                    phieuMoiId
                ) &&
                phieuMoiId > 0
            ) {
                window.location.href =
                    `/ve-an/lay-ve-an/${phieuMoiId}`;

                return;
            }

            await reloadPhieu();
            await reloadPaymentState();

            renderQrPanel();
            renderSummary();
            renderStateActions();
        } catch (error) {
            showError(
                error
            );
        } finally {
            setLoading(false);
        }
    }

    function delay(milliseconds) {
        return new Promise(
            resolve =>
                window.setTimeout(
                    resolve,
                    Math.max(
                        0,
                        Number(
                            milliseconds
                        ) ||
                        0
                    )
                )
        );
    }

    async function runWithQrBankLoading(
        task,
        message = "Đang kết nối ngân hàng. Vui lòng chờ!"
    ) {
        const startedAt = performance.now();

        setQrModalLoading(
            true,
            message
        );

        try {
            return await task();
        } finally {
            /*
            * TEST hiện tại phản hồi quá nhanh:
            * giữ spinner ít nhất 1 giây.
            *
            * Sau này ngân hàng thật mất 2s, 3s...
            * thì KHÔNG cộng thêm 1 giây.
            * Spinner chỉ tồn tại bằng đúng thời gian
            * ngân hàng trả lời.
            */
            const elapsed =
                performance.now() -
                startedAt;

            const remaining =
                QR_MIN_LOADING_MS -
                elapsed;

            if (
                remaining > 0
            ) {
                await delay(
                    remaining
                );
            }
        }
    }

    async function handlePay() {
        try {
            setLoading(true);
            await saveDraft();

            if (!state.selectedPaymentMethod) {
                throw new Error("Vui lòng chọn phương thức thanh toán.");
            }

            const method = state.paymentMethods.find(
                item =>
                    Number(item.value) ===
                    Number(state.selectedPaymentMethod)
            );

            if (
                isQrMethod(
                    method
                )
            ) {
                if (
                    !permission.canCreateQr(
                        state.permissions
                    )
                ) {
                    throw new Error(
                        "Bạn không có quyền tạo thanh toán QR."
                    );
                }

                /*
                * Không dùng loading toàn trang nữa.
                * Modal tự có loading riêng.
                */
                setLoading(false);

                await createQrPayment({
                    openModal: true
                });

                window.MCS
                    ?.toast
                    ?.success
                    ?.(
                        "Đã tạo giao dịch QR."
                    );

                return;
            }

            if (!permission.canCreatePayment(state.permissions)) {
                throw new Error("Bạn không có quyền tạo giao dịch thanh toán.");
            }

            const response = await request(
                `${API.payment}/them-moi`,
                "POST",
                {
                    phieuLayVeId: state.phieu.id,
                    phuongThuc: Number(state.selectedPaymentMethod)
                }
            );

            state.payment = response?.data || null;
            renderStateActions();

            if (permission.canConfirmPayment(state.permissions)) {
                await confirmCurrentPayment();
            } else {
                window.MCS?.toast?.success?.(
                    "Đã tạo giao dịch. Giao dịch đang chờ người có quyền xác nhận."
                );
            }
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    }

    async function reloadPaymentState() {
        if (!state.phieu?.id) {
            state.payment = null;
            state.qrPayment = null;
            state.qrData = null;
            state.paymentDocuments = [];
            state.activePaymentDocument = null;
            state.familyHasRefund = false;

            renderPaymentDocuments();
            renderPaymentInfo();
            renderEditLocks();

            return;
        }

        const canLoadTransactions =
            permission.canViewPayment(
                state.permissions
            );

        const canLoadDocuments =
            permission.canViewPaymentDocuments(
                state.permissions
            );

        const [
            transactionResponse,
            documentResponse
        ] = await Promise.all([
            canLoadTransactions
                ? request(
                    `${API.payment}/tong-hop?phieuLayVeId=${state.phieu.id}`
                )
                : Promise.resolve({
                    data: []
                }),

            canLoadDocuments
                ? request(
                    `${API.payment}/danh-sach-phieu/${state.phieu.id}`
                )
                : Promise.resolve({
                    data: []
                })
        ]);

        const transactions = normalizeList(
            transactionResponse?.data
        );

        const documents = normalizeList(
            documentResponse?.data
        );

        state.paymentDocuments = documents;

        state.familyHasRefund =
            documents.some(
                item =>
                    item.loai ===
                    "PHIEU_HOAN"
            );

        const requestedRefundId = Number(
            app.pageContext?.paymentDocumentId
        );

        const currentReceipt =
            documents.find(
                item =>
                    item.loai ===
                        "PHIEU_THU" &&
                    Number(
                        item.phieuLayVeId
                    ) ===
                    Number(
                        state.phieu.id
                    )
            ) ||
            null;

        const requestedRefund =
            Number.isInteger(
                requestedRefundId
            ) &&
            requestedRefundId > 0
                ? documents.find(
                    item =>
                        item.loai ===
                            "PHIEU_HOAN" &&
                        Number(
                            item.thanhToanId
                        ) ===
                        requestedRefundId
                ) ||
                null
                : null;

        const activeSummary =
            requestedRefund ||
            currentReceipt;

        let activeTransaction = null;

        if (
            activeSummary?.thanhToanId
        ) {
            activeTransaction =
                transactions.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            activeSummary.thanhToanId
                        )
                ) ||
                null;

            if (
                !activeTransaction &&
                permission.canViewPaymentDetail(
                    state.permissions
                )
            ) {
                const transactionDetailResponse =
                    await request(
                        `${API.payment}/${activeSummary.thanhToanId}`
                    );

                activeTransaction =
                    transactionDetailResponse?.data ||
                    null;
            }
        }

        state.activePaymentDocument =
            activeSummary
                ? {
                    ...activeSummary,
                    transaction: activeTransaction
                }
                : null;

        state.payment =
            activeSummary?.loai ===
                "PHIEU_THU"
                ? activeTransaction
                : null;

        if (
            app.pageContext?.paymentDocumentId &&
            !requestedRefund
        ) {
            app.pageContext.paymentDocumentId = null;

            window.history
                .replaceState(
                    window.history.state,
                    "",
                    `/ve-an/lay-ve-an/${encodeURIComponent(
                        state.phieu.id
                    )}`
                );
        }

        const qrThanhToanId = Number(
            state.activePaymentDocument?.qrThanhToanId
        );

        if (qrThanhToanId) {
            state.qrPayment =
                transactions.find(
                    item =>
                        Number(
                            item.id
                        ) ===
                        qrThanhToanId
                ) ||
                null;

            if (
                !state.qrPayment &&
                permission.canViewPaymentDetail(
                    state.permissions
                )
            ) {
                state.qrPayment =
                    (
                        await request(
                            `${API.payment}/${qrThanhToanId}`
                        )
                    )?.data ||
                    null;
            }

            if (
                !state.qrPayment &&
                permission.canViewQr(
                    state.permissions
                )
            ) {
                state.qrPayment = {
                    id: qrThanhToanId,
                    phuongThuc: 30
                };
            }
        } else {
            state.qrPayment = null;
        }

        if (
            state.activePaymentDocument?.loai ===
                "PHIEU_THU" &&
            state.activePaymentDocument?.trangThaiHienThi ===
                "CHUA_THANH_TOAN" &&
            !state.activePaymentDocument?.thanhToanId
        ) {
            state.payment = null;
            state.qrPayment = null;
        }

        state.qrData = null;

        renderPaymentDocuments();
        renderPaymentInfo();
        renderQrPanel();
        renderEditLocks();
    }

    function getDocumentMode() {
        const document = state.activePaymentDocument;

        const hasDocument = Boolean(
            document
        );

        const isRefund =
            document?.loai ===
            "PHIEU_HOAN";

        const isPaid =
            document?.loai ===
                "PHIEU_THU" &&
            document?.trangThaiHienThi ===
                "DA_THANH_TOAN";

        const isUnpaid =
            hasDocument
                ? (
                    document.loai ===
                        "PHIEU_THU" &&
                    document.trangThaiHienThi ===
                        "CHUA_THANH_TOAN"
                )
                : (
                    !state.phieu?.id ||
                    [
                        0,
                        10,
                        20
                    ].includes(
                        Number(
                            state.phieu?.trangThai ||
                            0
                        )
                    )
                );

        const pendingQr =
            isUnpaid &&
            Number(
                state.qrPayment?.phuongThuc
            ) ===
                30 &&
            [
                10,
                20
            ].includes(
                Number(
                    state.qrPayment?.trangThai
                )
            );

        return {
            isRefund,
            isPaid,
            isUnpaid,
            pendingQr
        };
    }

    function isFinancialLocked() {
        const {
            isRefund,
            isPaid,
            pendingQr
        } = getDocumentMode();

        const phieuStatus = Number(
            state.phieu?.trangThai
        );

        const lockedByPhieuStatus =
            [
                -10,
                10,
                30,
                40,
                60
            ].includes(
                phieuStatus
            );

        return (
            isRefund ||
            isPaid ||
            pendingQr ||
            (
                !state.activePaymentDocument &&
                lockedByPhieuStatus
            )
        );
    }

    function renderPaymentDocuments() {
        if (
            !el.paymentDocumentList ||
            !el.paymentDocumentsSection
        ) {
            return;
        }

        if (
            !permission.canViewPaymentDocuments(
                state.permissions
            )
        ) {
            el.paymentDocumentsSection.hidden = true;
            el.paymentDocumentList.innerHTML = "";
            return;
        }

        const list =
            Array.isArray(
                state.paymentDocuments
            )
                ? state.paymentDocuments
                : [];

        el.paymentDocumentsSection.hidden =
            list.length ===
            0;

        if (el.paymentDocumentCount) {
            el.paymentDocumentCount.textContent =
                `${list.length} phiếu`;
        }

        if (!list.length) {
            el.paymentDocumentList.innerHTML = "";
            return;
        }

        const refunds =
            list
                .filter(
                    item =>
                        item.loai ===
                        "PHIEU_HOAN"
                )
                .slice()
                .sort(
                    (
                        a,
                        b
                    ) =>
                        new Date(
                            a.thoiGian ||
                            0
                        ).getTime() -
                        new Date(
                            b.thoiGian ||
                            0
                        ).getTime()
                );

        const refundIndexes =
            new Map(
                refunds.map(
                    (
                        item,
                        index
                    ) => [
                        Number(
                            item.thanhToanId
                        ),
                        index + 1
                    ]
                )
            );

        const statusMap = {
            DA_THANH_TOAN: "Đã thanh toán",
            DA_HOAN: "Đã hoàn",
            CHUA_THANH_TOAN: "Chưa thanh toán"
        };

        const active = state.activePaymentDocument;

        const isCurrent =
            item => {
                if (
                    item.loai ===
                    "PHIEU_HOAN"
                ) {
                    return (
                        active?.loai ===
                            "PHIEU_HOAN" &&
                        Number(
                            active.thanhToanId
                        ) ===
                        Number(
                            item.thanhToanId
                        )
                    );
                }

                return (
                    active?.loai ===
                        "PHIEU_THU" &&
                    Number(
                        active.phieuLayVeId
                    ) ===
                    Number(
                        item.phieuLayVeId
                    )
                );
            };

        el.paymentDocumentList.innerHTML =
            list
                .map(
                    item => {
                        const isRefund =
                            item.loai ===
                            "PHIEU_HOAN";

                        const activeItem = isCurrent(
                            item
                        );

                        const title =
                            isRefund
                                ? `Phiếu hoàn ${
                                    refundIndexes.get(
                                        Number(
                                            item.thanhToanId
                                        )
                                    ) ||
                                    ""
                                }`
                                : "Phiếu thu";

                        const method =
                            getEnumLabel(
                                state.paymentMethods,
                                item.phuongThuc
                            ) ||
                            "-";

                        const status =
                            statusMap[
                                item.trangThaiHienThi
                            ] ||
                            "-";

                        const content =
                            `

                                <div
                                    class="lva-payment-document__icon">

                                    <i
                                        class="fa-solid ${
                                            isRefund
                                                ? "fa-rotate-left"
                                                : "fa-receipt"
                                        }">
                                    </i>

                                </div>


                                <div
                                    class="lva-payment-document__main">

                                    <div
                                        class="lva-payment-document__header">

                                        <strong>
                                            ${escapeHtml(
                                                title
                                            )}
                                        </strong>

                                        <span>
                                            ${escapeHtml(
                                                status
                                            )}
                                        </span>

                                    </div>


                                    <div
                                        class="lva-payment-document__code">

                                        ${escapeHtml(
                                            item.maGiaoDich ||
                                            item.soPhieu ||
                                            "-"
                                        )}

                                    </div>


                                    <div
                                        class="lva-payment-document__meta">

                                        <span>
                                            ${escapeHtml(
                                                method
                                            )}
                                        </span>

                                        <span>
                                            ${escapeHtml(
                                                formatDateTime(
                                                    item.thoiGian
                                                )
                                            )}
                                        </span>

                                        <span>
                                            ${escapeHtml(
                                                `${Number(
                                                    item.soLuong ||
                                                    0
                                                )} vé`
                                            )}
                                        </span>

                                    </div>

                                </div>


                                <strong
                                    class="lva-payment-document__amount">

                                    ${
                                        isRefund
                                            ? "-"
                                            : ""
                                    }${escapeHtml(
                                        formatMoney(
                                            item.soTien
                                        )
                                    )}

                                </strong>

                            `;

                        /*
                        * Dòng đang xem:
                        * ARTICLE, KHÔNG CLICK.
                        */
                        if (activeItem) {
                            return `

                                <article
                                    class="
                                        lva-payment-document
                                        ${
                                            isRefund
                                                ? "is-refund"
                                                : "is-receipt"
                                        }
                                        is-active
                                    "
                                    aria-current="page">

                                    ${content}

                                </article>

                            `;
                        }

                        /*
                        * Phiếu hoàn:
                        * giữ phieu ID nguồn +
                        * thanhToanId.
                        *
                        * Phiếu thu:
                        * chuyển thẳng sang phieu ID đó.
                        */
                        const href =
                            isRefund
                                ? (
                                    `/ve-an/lay-ve-an/${encodeURIComponent(
                                        item.phieuLayVeId
                                    )}` +
                                    `?thanhToanId=${encodeURIComponent(
                                        item.thanhToanId
                                    )}`
                                )
                                : `/ve-an/lay-ve-an/${encodeURIComponent(
                                    item.phieuLayVeId
                                )}`;

                        return `

                            <a
                                class="
                                    lva-payment-document
                                    ${
                                        isRefund
                                            ? "is-refund"
                                            : "is-receipt"
                                    }
                                    is-clickable
                                "
                                href="${href}">

                                ${content}

                            </a>

                        `;
                    }
                )
                .join(
                    ""
                );
    }

    async function confirmCurrentPayment() {
        if (
            !state.payment?.id ||
            !permission.canConfirmPayment(state.permissions)
        ) {
            return;
        }

        try {
            setLoading(true);

            const response = await request(
                `${API.payment}/xac-nhan/${state.payment.id}`,
                "PATCH",
                {}
            );

            state.payment =
                response?.data ||
                state.payment;

            await reloadPhieu();

            stopQrPolling();

            await reloadPaymentState();

            state.qrData = null;

            closeQrModal();
            renderQrPanel();
            renderSummary();
            renderStateActions();

            window.MCS
                ?.toast
                ?.success
                ?.(
                    response?.message ||
                    "Thanh toán thành công."
                );
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    }

    function setQrModalLoading(
        loading,
        message = "Đang kết nối ngân hàng. Vui lòng chờ!"
    ) {
        if (!el.qrModal) {
            return;
        }

        el.qrModal.classList.toggle(
            "is-loading",
            Boolean(
                loading
            )
        );

        if (el.qrModalLoading) {
            el.qrModalLoading.hidden = !loading;
        }

        if (el.qrModalLoadingText) {
            el.qrModalLoadingText.textContent = message;
        }

        if (el.qrModalContent) {
            el.qrModalContent.hidden = loading;
        }

        if (el.qrModalActions) {
            el.qrModalActions.hidden = loading;
        }
    }

    function openQrModal(
        loading = false,
        message = "Đang kết nối ngân hàng. Vui lòng chờ!"
    ) {
        if (!el.qrModal) {
            return;
        }

        el.qrModal.hidden = false;

        document.body
            .classList
            .add(
                "lva-qr-modal-open"
            );

        setQrModalLoading(
            loading,
            message
        );
    }

    function closeQrModal() {
        if (el.qrModal) {
            el.qrModal.hidden = true;
        }

        document.body
            .classList
            .remove(
                "lva-qr-modal-open"
            );
    }

    function renderQrModal() {
        const payment = state.qrPayment;

        const qr =
            state.qrData ||
            payment?.qrData ||
            null;

        if (
            !payment ||
            !qr
        ) {
            return;
        }

        setQrModalLoading(false);

        if (el.qrModalImage) {
            el.qrModalImage.src =
                qr.qrDataURL ||
                "";
        }

        if (el.qrModalAmount) {
            el.qrModalAmount.textContent =
                formatMoney(
                    payment.soTien ??
                    state.phieu?.thanhTien ??
                    0
                );
        }

        if (el.qrModalTransaction) {
            el.qrModalTransaction.textContent =
                payment.maGiaoDich ||
                "";
        }

        if (el.qrModalCode) {
            el.qrModalCode.textContent =
                payment.maGiaoDich ||
                "-";
        }

        if (el.qrModalBank) {
            el.qrModalBank.textContent =
                qr.bankName ||
                (
                    qr.provider ===
                    "TEST"
                        ? "KITCHENFLOW TEST BANK"
                        : "VietQR"
                );
        }

        if (el.qrModalAccount) {
            el.qrModalAccount.textContent =
                [
                    qr.accountName,
                    qr.accountNo
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " - "
                    ) ||
                "-";
        }

        const {
            isUnpaid,
            pendingQr
        } = getDocumentMode();

        const qrMutable =
            isUnpaid &&
            pendingQr;

        if (el.qrModalCancel) {
            el.qrModalCancel.hidden =
                !permission.canCancelQr(
                    state.permissions
                );

            el.qrModalCancel.disabled =
                !qrMutable;
        }

        if (el.qrModalRecreate) {
            el.qrModalRecreate.hidden =
                !permission.canCancelQr(
                    state.permissions
                ) ||
                !permission.canCreateQr(
                    state.permissions
                );

            el.qrModalRecreate.disabled =
                !qrMutable;
        }

        if (el.qrModalConfirm) {
            el.qrModalConfirm.hidden =
                !permission.canConfirmPayment(
                    state.permissions
                );

            el.qrModalConfirm.disabled =
                !qrMutable;
        }
    }

    async function loadCurrentQr() {
        if (
            !state.qrPayment?.id ||
            !permission.canViewQr(
                state.permissions
            )
        ) {
            return;
        }

        openQrModal(true);

        try {
            const response =
                await runWithQrBankLoading(
                    () =>
                        request(
                            `${API.payment}/qr/${state.qrPayment.id}`
                        ),
                    "Đang tải thông tin QR Code. Vui lòng chờ!"
                );

            state.qrPayment =
                response?.data ||
                state.qrPayment;

            state.payment =
                state.qrPayment;

            state.qrData =
                response?.data?.qrData ||
                null;

            renderQrModal();
        } catch (error) {
            closeQrModal();

            showError(
                error
            );
        }
    }

    async function createQrPayment({
        openModal = true,
        loadingMessage = "Đang tạo QR Code. Vui lòng chờ ngân hàng phản hồi!"
    } = {}) {
        if (!state.phieu?.id) {
            throw new Error(
                "Phiếu lấy vé chưa được tạo."
            );
        }

        if (openModal) {
            openQrModal(
                true,
                loadingMessage
            );
        } else {
            setQrModalLoading(
                true,
                loadingMessage
            );
        }

        try {
            const response =
                await runWithQrBankLoading(
                    () =>
                        request(
                            `${API.payment}/tao-qr`,
                            "POST",
                            {
                                phieuLayVeId: state.phieu.id
                            }
                        ),
                    loadingMessage
                );

            state.qrPayment =
                response?.data ||
                null;

            state.payment =
                state.qrPayment;

            const createdQrData =
                response?.data?.qrData ||
                null;

            state.qrData =
                createdQrData;

            await reloadPhieu();
            await reloadPaymentState();

            state.qrData =
                createdQrData;

            if (
                state.qrPayment &&
                createdQrData
            ) {
                state.qrPayment = {
                    ...state.qrPayment,
                    qrData: createdQrData
                };
            }

            renderQrPanel();
            renderSummary();
            renderStateActions();
            renderQrModal();

            startQrPolling();

            return state.qrPayment;
        } catch (error) {
            closeQrModal();

            throw error;
        }
    }

    function isCancelledPayment(payment) {
        if (!payment) {
            return false;
        }

        const label =
            normalizeSearchText(
                getEnumLabel(
                    state.paymentStatuses,
                    payment.trangThai
                )
            );

        return (
            Number(
                payment.trangThai
            ) ===
                50 ||
            label ===
                "da huy"
        );
    }

    async function cancelCurrentQr({
        closeModalAfter = true,
        showToast = true
    } = {}) {
        if (!state.qrPayment?.id) {
            return;
        }

        await request(
            `${API.payment}/huy-qr/${state.qrPayment.id}`,
            "PATCH",
            {
                noiDung: "Hủy QR Code từ màn hình lấy vé ăn."
            }
        );

        stopQrPolling();

        state.qrPayment = null;
        state.payment = null;
        state.qrData = null;

        await reloadPhieu();
        await reloadPaymentState();

        resetPaymentSelection();
        renderQrPanel();
        renderSummary();
        renderStateActions();

        if (closeModalAfter) {
            closeQrModal();
        }

        if (showToast) {
            window.MCS
                ?.toast
                ?.success
                ?.(
                    "Hủy QR Code thành công."
                );
        }
    }

    async function recreateQr() {
        if (
            !state.qrPayment?.id ||
            !permission.canCancelQr(
                state.permissions
            ) ||
            !permission.canCreateQr(
                state.permissions
            )
        ) {
            return;
        }

        const loadingMessage =
            "Đang cập nhật QR Code. Vui lòng chờ ngân hàng phản hồi!";

        /*
        * QUAN TRỌNG:
        *
        * Bấm "Cập nhật QR" ngoài màn hình
        * thì modal đang đóng.
        *
        * Phải mở modal NGAY trước khi
        * bắt đầu hủy QR cũ.
        */
        openQrModal(
            true,
            loadingMessage
        );

        try {
            /*
            * 1. Hủy transaction QR cũ.
            *
            * Không đóng modal vì modal
            * hiện đang dùng để hiển thị loading.
            */
            await cancelCurrentQr({
                closeModalAfter: false,
                showToast: false
            });

            /*
            * 2. Sau khi hủy QR cũ,
            * cancelCurrentQr() đã reset
            * phương thức thanh toán.
            *
            * Chọn lại QR = 30.
            */
            setSelectedPaymentMethod(
                30
            );

            /*
            * 3. Sinh transaction mới +
            * QR Code hoàn toàn mới.
            *
            * Modal đã mở nên không mở lại.
            */
            const newQrPayment =
                await createQrPayment({
                    openModal: false,
                    loadingMessage
                });

            if (!newQrPayment?.id) {
                throw new Error(
                    "Không nhận được giao dịch QR mới."
                );
            }

            /*
            * createQrPayment()
            * đã:
            *
            * state.qrPayment = QR mới
            * state.qrData = dữ liệu QR mới
            * renderQrModal()
            *
            * => spinner biến mất
            * => QR mới hiện ngay.
            */

            window.MCS
                ?.toast
                ?.success
                ?.(
                    "Đã cập nhật QR Code."
                );
        } catch (error) {
            closeQrModal();

            showError(
                error,
                "Không thể cập nhật QR Code."
            );
        }
    }

    function renderQrPanel() {
        const payment = state.qrPayment;

        const isPendingQr =
            Boolean(
                payment?.id
            ) &&
            Number(
                payment.phuongThuc
            ) ===
                30 &&
            [
                10,
                20
            ].includes(
                Number(
                    payment.trangThai
                )
            ) &&
            Number(
                state.phieu?.trangThai
            ) !==
                40;

        if (!isPendingQr) {
            el.qrPanel.hidden = true;
            return;
        }

        el.qrPanel.hidden = false;

        el.qrCode.textContent =
            payment?.qrData?.maGiaoDich ||
            payment?.maGiaoDich ||
            "";
    }

    let qrPollTimer = null;

    function startQrPolling() {
        stopQrPolling();

        if (
            !state.qrPayment?.id ||
            Number(
                state.phieu?.trangThai
            ) ===
                40 ||
            Number(
                state.qrPayment?.trangThai
            ) ===
                30
        ) {
            return;
        }

        qrPollTimer = window.setInterval(
            async () => {
                try {
                    const response = await request(
                        `${API.payment}/${state.qrPayment.id}`
                    );

                    state.qrPayment = response?.data || state.qrPayment;
                    state.payment = state.qrPayment;

                    await reloadPhieu();
                    renderSummary();

                    if (Number(state.phieu?.trangThai) === 40) {
                        stopQrPolling();
                        el.qrPanel.hidden = true;

                        window.MCS?.toast?.success?.(
                            "Thanh toán QR thành công."
                        );
                    }
                } catch (error) {
                    console.warn(
                        "Không thể kiểm tra trạng thái QR:",
                        error
                    );
                }
            },
            5000
        );
    }

    function stopQrPolling() {
        if (qrPollTimer) {
            window.clearInterval(qrPollTimer);
            qrPollTimer = null;
        }
    }

    function cancelQr() {
        if (
            !state.qrPayment?.id ||
            !permission.canCancelQr(
                state.permissions
            )
        ) {
            return;
        }

        confirmAction(
            "Hủy QR Code",
            "Bạn có chắc chắn muốn hủy QR Code hiện tại?",
            "Hủy QR",
            "danger",
            async () => {
                try {
                    setQrModalLoading(
                        true
                    );

                    await cancelCurrentQr({
                        closeModalAfter: true,
                        showToast: true
                    });
                } catch (error) {
                    setQrModalLoading(
                        false
                    );

                    showError(
                        error
                    );
                }
            }
        );
    }

    function isQrMethod(item) {
        const name = String(
            item?.name ??
            item?.label ??
            ""
        )
            .trim()
            .toLowerCase();

        return name === "qr code" ||
            name.includes("qr");
    }

    Object.assign(
        app,
        {
            resetPaymentSelection,
            setSelectedPaymentMethod,
            renderPaymentMethods,
            renderPermissionActions,
            renderStateActions,
            setMainPaymentAction,
            renderPaymentInfo,
            formatDateTime,
            openRefundModal,
            closeRefundModal,
            submitRefundModal,
            handlePay,
            reloadPaymentState,
            confirmCurrentPayment,
            renderQrPanel,
            startQrPolling,
            stopQrPolling,
            cancelQr,
            isQrMethod,
            openQrModal,
            closeQrModal,
            setQrModalLoading,
            renderQrModal,
            loadCurrentQr,
            createQrPayment,
            cancelCurrentQr,
            recreateQr,
            isCancelledPayment,
            renderPaymentDocuments,
            getDocumentMode,
            isFinancialLocked,
            cancelPayment
        }
    );
})();