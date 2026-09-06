"use strict";

(() => {
    const app =
        window.KitchenFlowLayVeAn;

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
    const request = (...args) => app.request(...args);
    const saveDraft = (...args) => app.saveDraft(...args);
    const setLoading = (...args) => app.setLoading(...args);
    const setSelectValue = (...args) => app.setSelectValue(...args);
    const showError = (...args) => app.showError(...args);
    const toPositiveInt = (...args) => app.toPositiveInt(...args);

    function resetPaymentSelection() {

        const radios =
            el.paymentMethodList
                ?.querySelectorAll(
                    'input[name="phuongThucThanhToan"]'
                );


        if (
            !radios?.length
        ) {

            state.selectedPaymentMethod =
                null;

            return;

        }


        radios.forEach(
            (
                radio,
                index
            ) => {

                radio.checked =
                    index === 0;

            }
        );


        const first =
            radios[0];


        state.selectedPaymentMethod =
            first?.value
                ? Number(
                    first.value
                )
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

    function renderPaymentMethods() {
        if (!el.paymentMethodList) {
            return;
        }

        const visible =
            state.paymentMethods
                .filter(
                    item =>
                        state
                            .paymentMethodVisibleValues
                            .includes(
                                Number(
                                    item.value
                                )
                            )
                )
                .filter(
                    item => {

                        const isQr =
                            isQrMethod(
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
            !permission.canViewPayment(state.permissions) ||
            visible.length === 0;

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
    }

    function renderPermissionActions() {

        if (el.discountOpen) {
            el.discountOpen.hidden =
                !permission.canCreateDiscount(
                    state.permissions
                );
        }

        renderStateActions();
    }

    function renderStateActions() {
        const phieu = state.phieu;

        const paid =
            Number(phieu?.trangThai) === 40 ||
            isPhieuStatus("Đã thanh toán");

        const cancelled =
            Number(phieu?.trangThai) === 50 ||
            isPhieuStatus("Đã hủy") ||
            isPhieuStatus("Đã huỷ");

        const refunded =
            Number(phieu?.trangThai) === 60 ||
            isPhieuStatus("Đã hoàn");

        const createdQr =
            isPhieuStatus("Tạo QR");

        /*
        * IN:
        * luôn hiện khi có quyền.
        * Chưa có phiếu thì disable.
        */
        if (el.print) {
            el.print.hidden =
                !permission.canPrint(
                    state.permissions
                );

            el.print.disabled =
                !phieu?.id;
        }

        if (
            el.cancelPhieu
        ) {

            const canCancel =
                permission.canCancelPhieu(
                    state.permissions
                );


            const hasBasicData =
                Boolean(
                    toPositiveInt(
                        el.thucDonNgayId?.value
                    )
                ) &&
                Boolean(
                    toPositiveInt(
                        el.doiTuongLayVe?.value
                    )
                );


            el.cancelPhieu.hidden =
                !canCancel ||
                !hasBasicData ||
                paid ||
                cancelled ||
                refunded;

        }

        if (el.viewQr) {
            el.viewQr.hidden =
                !state.qrPayment;
        }

        if (
            el.cancelQr
        ) {

            el.cancelQr.hidden =
                !state.qrPayment?.id ||
                !permission.canCancelQr(
                    state.permissions
                );

        }

        /*
        * ACTION CHÍNH TRÊN ĐẦU
        */
        if (!el.mainPaymentAction) {
            renderPaymentInfo();
            return;
        }

        el.mainPaymentAction.hidden = true;
        el.mainPaymentAction.disabled = false;
        el.mainPaymentAction.dataset.action = "";

        /*
        * ĐÃ THANH TOÁN
        * => HOÀN THANH TOÁN
        */
        if (
            paid &&
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

            renderPaymentInfo();
            return;
        }

        /*
        * ĐÃ TẠO QR
        * => DUYỆT
        */
        if (
            createdQr &&
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

            renderPaymentInfo();
            return;
        }

        /*
        * ĐÃ CÓ TRANSACTION CHỜ XỬ LÝ
        * => DUYỆT
        */
        if (
            state.payment?.id &&
            !paid &&
            !cancelled &&
            !refunded &&
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

            renderPaymentInfo();
            return;
        }

        /*
        * BÌNH THƯỜNG
        * => THANH TOÁN
        */
        if (
            !cancelled &&
            !refunded &&
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

        renderPaymentInfo();
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
            el.mainPaymentActionLabel.textContent =
                label;
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

        const phieu =
            state.phieu;

        const payment =
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

        const methodValue =
            payment.phuongThuc ??
            phieu.phuongThucThanhToan;

        const method =
            state.paymentMethods.find(
                item =>
                    Number(item.value) ===
                    Number(methodValue)
            );

        let statusText =
            getEnumLabel(
                state.paymentStatuses,
                payment.trangThai
            ) ||
            "-";

        /*
        * Trạng thái PHIẾU mới quyết định
        * kết quả nghiệp vụ cuối.
        */
        if (
            Number(phieu.trangThai) === 40 ||
            isPhieuStatus("Đã thanh toán")
        ) {
            statusText =
                "Đã thanh toán";
        } else if (
            Number(phieu.trangThai) === 60 ||
            isPhieuStatus("Đã hoàn")
        ) {
            statusText =
                "Đã hoàn";
        } else if (
            Number(phieu.trangThai) === 50 ||
            isPhieuStatus("Đã hủy") ||
            isPhieuStatus("Đã huỷ")
        ) {
            statusText =
                "Đã hủy";
        } else if (
            isPhieuStatus("Tạo QR")
        ) {
            statusText =
                "Đã tạo QR";
        }

        el.paymentStatusText.textContent =
            statusText;

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
                Number(phieu.tienGoc)
            )
                ? formatMoney(
                    Number(phieu.tienGoc)
                )
                : "-";

        el.paymentDiscount.textContent =
            Number.isFinite(
                Number(phieu.tongMienGiam)
            )
                ? (
                    Number(phieu.tongMienGiam) > 0
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
                Number(phieu.thanhTien)
            )
                ? formatMoney(
                    Number(phieu.thanhTien)
                )
                : "-";

        el.paymentPayer.textContent =
            phieu.tenNguoiThanhToan ||
            phieu.nguoiThanhToanTenDangNhap ||
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

        const date =
            new Date(value);

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

        const hh =
            pad(
                date.getHours()
            );

        const mm =
            pad(
                date.getMinutes()
            );

        const ss =
            pad(
                date.getSeconds()
            );

        const dd =
            pad(
                date.getDate()
            );

        const month =
            pad(
                date.getMonth() + 1
            );

        const yyyy =
            date.getFullYear();

        return `${hh}:${mm}:${ss} ${dd}/${month}/${yyyy}`;
    }

    function openRefundModal() {
        if (
            !state.phieu?.id ||
            !permission.canRefund(state.permissions)
        ) {
            return;
        }

        fillSelect(
            el.refundMethod,
            state.paymentMethods.filter(item =>
                state.paymentMethodVisibleValues.includes(Number(item.value))
            ),
            item => item.value,
            item => item.label
        );

        if (el.refundQty) {
            el.refundQty.value = "1";
        }

        if (el.refundReason) {
            el.refundReason.value = "";
        }

        setSelectValue(el.refundMethod, "10", false); // mặc định tiền mặt
        el.refundModal.hidden = false;
    }

    function closeRefundModal() {
        if (el.refundModal) {
            el.refundModal.hidden = true;
        }
    }

    async function submitRefundModal() {
        if (!state.phieu?.id) {
            return;
        }

        const soLuongHoan =
            Math.floor(
                Number(
                    el.refundQty?.value ||
                    0
                )
            );

        const lyDoHoan =
            String(
                el.refundReason?.value ||
                ""
            ).trim();

        const phuongThucHoan =
            Number(
                el.refundMethod?.value ||
                10
            );

        if (
            !Number.isInteger(
                soLuongHoan
            ) ||
            soLuongHoan < 1
        ) {
            showError(
                new Error(
                    "Số lượng hoàn không hợp lệ."
                )
            );

            return;
        }

        if (
            soLuongHoan >
            Number(
                state.phieu.soLuong ||
                0
            )
        ) {
            showError(
                new Error(
                    "Số lượng hoàn không được lớn hơn số lượng vé."
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

        const thanhTien =
            Number(
                state.phieu.thanhTien ||
                0
            );

        const tongSoLuong =
            Number(
                state.phieu.soLuong ||
                1
            );

        const soTienHoan =
            Number(
                (
                    thanhTien /
                    tongSoLuong *
                    soLuongHoan
                ).toFixed(
                    5
                )
            );

        try {
            setLoading(true);

            await request(
                `${API.payment}/hoan-tien`,
                "POST",
                {
                    phieuLayVeId:
                        state.phieu.id,

                    soLuongHoan:
                        soLuongHoan,

                    lyDoHoan:
                        lyDoHoan,

                    phuongThuc:
                        phuongThucHoan,

                    soTien:
                        soTienHoan
                }
            );

            closeRefundModal();

            await Promise.all([
                reloadPhieu(),
                reloadPaymentState()
            ]);

            renderQrPanel();
            renderSummary();
            renderStateActions();

            window.MCS?.toast?.success?.(
                "Hoàn thanh toán thành công."
            );

        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
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

            if (isQrMethod(method)) {
                if (!permission.canCreateQr(state.permissions)) {
                    throw new Error("Bạn không có quyền tạo thanh toán QR.");
                }

                const response = await request(
                    `${API.payment}/tao-qr`,
                    "POST",
                    {
                        phieuLayVeId: state.phieu.id
                    }
                );

                state.qrPayment =
                    response?.data || null;

                state.payment =
                    state.qrPayment;

                await reloadPhieu();

                renderQrPanel();
                renderSummary();
                renderStateActions();

                window.MCS?.toast?.success?.(
                    response?.message ||
                    "Đã tạo giao dịch QR."
                );

                startQrPolling();
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
            return;
        }

        const response = await request(
            `${API.payment}/tong-hop?phieuLayVeId=${state.phieu.id}`
        );

        const list =
            normalizeList(
                response?.data
            );

        /*
        * loaiGiaoDich = 10:
        * giao dịch thanh toán.
        *
        * Không lấy transaction hoàn tiền làm
        * payment hiện tại.
        */
        const payment =
            list.find(
                item =>
                    Number(
                        item.loaiGiaoDich
                    ) === 10
            ) ||
            null;

        state.payment =
            payment;

        const isQr =
            Number(
                payment?.phuongThuc
            ) === 30;

        const daHuy =
            normalizeSearchText(
                getEnumLabel(
                    state.paymentStatuses,
                    payment?.trangThai
                )
            ).includes(
                "da huy"
            );

        state.qrPayment =
            isQr && !daHuy
                ? payment
                : null;
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

            state.payment = response?.data || state.payment;

            await reloadPhieu();
            renderSummary();

            window.MCS?.toast?.success?.(
                response?.message ||
                "Thanh toán thành công."
            );
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    }

    function renderQrPanel() {
        if (!state.qrPayment) {
            el.qrPanel.hidden = true;
            return;
        }

        el.qrPanel.hidden = false;
        el.qrCode.textContent =
            state.qrPayment?.qrData?.maGiaoDich ||
            state.qrPayment?.maGiaoDich ||
            "";
    }

    let qrPollTimer = null;

    function startQrPolling() {
        stopQrPolling();

        if (!state.qrPayment?.id) {
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


        const execute =
            async () => {

                try {

                    setLoading(
                        true
                    );


                    await request(
                        `${API.payment}/huy-qr/${state.qrPayment.id}`,
                        "PATCH",
                        {
                            noiDung:
                                "Hủy QR Code từ màn hình lấy vé ăn."
                        }
                    );


                    stopQrPolling();


                    state.qrPayment =
                        null;

                    state.payment =
                        null;


                    if (
                        el.qrPanel
                    ) {

                        el.qrPanel.hidden =
                            true;

                    }


                    await reloadPhieu();


                    resetPaymentSelection();

                    renderQrPanel();

                    renderSummary();

                    renderStateActions();


                    window.MCS
                        ?.toast
                        ?.success
                        ?.(
                            "Hủy QR Code thành công."
                        );

                } catch (
                    error
                ) {

                    showError(
                        error
                    );

                } finally {

                    setLoading(
                        false
                    );

                }

            };


        confirmAction(
            "Hủy QR Code",
            "Bạn có chắc chắn muốn hủy QR Code hiện tại?",
            "Hủy QR",
            "danger",
            execute
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
            isQrMethod
        }
    );
})();
