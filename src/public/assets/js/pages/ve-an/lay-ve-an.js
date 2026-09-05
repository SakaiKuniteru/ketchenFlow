"use strict";

document.addEventListener("DOMContentLoaded", async () => {
    const root = document.querySelector("[data-lay-ve-an-page]");

    if (!root) {
        return;
    }

    const permission = window.LayVeAn?.permission;

    const API = {
        phieu: "/api/mcs/v1/nv-phieu-lay-ve-an",
        discount: "/api/mcs/v1/ct-phieu-lay-ve-mien-giam",
        payment: "/api/mcs/v1/nv-thanh-toan-ve-an",
        ticket: "/api/mcs/v1/ct-ve-an",
        employee: "/api/mcs/v1/dm-nhan-vien/tong-hop?active=true",
        enums: "/api/mcs/v1/enums"
    };

    const DAILY_MEAL_STORAGE_KEY =
        "kitchenflow.lay-ve-an.thuc-don-ngay";


    const TAKER_TYPE_STORAGE_KEY =
        "kitchenflow.lay-ve-an.doi-tuong-lay-ve";

    const state = {
        permissions: new Set(),
        thucDonNgay: [],
        doiTuong: [],
        gioiTinh: [],
        paymentMethods: [],
        discountTypes: [],
        employees: [],
        phieu: null,
        discounts: [],
        availableDiscounts: [],
        payment: null,
        qrPayment: null,
        selectedPaymentMethod: null,
        pricePreview: null
    };

    const el = {
        thucDonNgayId: byId("thucDonNgayId"),
        doiTuongLayVe: byId("doiTuongLayVe"),
        nhanVienId: byId("nhanVienId"),
        soLuong: byId("soLuong"),

        employeeSelectField: root.querySelector("[data-employee-select-field]"),
        employeeInfo: root.querySelector("[data-employee-info]"),
        guestForm: root.querySelector("[data-guest-form]"),

        hoTen: byId("hoTenNguoiLayVe"),
        ngaySinh: byId("ngaySinhNguoiLayVe"),
        gioiTinh: byId("gioiTinhNguoiLayVe"),
        phone: byId("soDienThoaiNguoiLayVe"),
        address: byId("diaChiNguoiLayVe"),
        unit: byId("donViNguoiLayVe"),
        permanentGuest: byId("khachLauDai"),
        noteEmployee: byId("ghiChuNhanVien"),
        noteGuest: byId("ghiChuKhach"),

        mealDetail: root.querySelector("[data-meal-detail]"),
        mealDate: root.querySelector("[data-meal-date]"),
        mealName: root.querySelector("[data-meal-name]"),
        mealCanteen: root.querySelector("[data-meal-canteen]"),
        mealShift: root.querySelector("[data-meal-shift]"),
        mealTime: root.querySelector("[data-meal-time]"),
        viewMenu: root.querySelector("[data-view-menu]"),

        employeeCode: root.querySelector("[data-employee-code]"),
        employeeName: root.querySelector("[data-employee-name]"),
        employeeDepartment: root.querySelector("[data-employee-department]"),
        employeeSite: root.querySelector("[data-employee-site]"),
        employeePhone: root.querySelector("[data-employee-phone]"),

        summaryTicket: root.querySelector("[data-summary-ticket]"),
        summaryQty: root.querySelector("[data-summary-qty]"),
        summaryPrice: root.querySelector("[data-summary-price]"),
        summaryOriginal: root.querySelector("[data-summary-original]"),
        summaryDiscount: root.querySelector("[data-summary-discount]"),
        summaryTotal: root.querySelector("[data-summary-total]"),

        paymentSection: root.querySelector("[data-payment-section]"),
        paymentMethodList: root.querySelector("[data-payment-method-list]"),
        qrPanel: root.querySelector("[data-qr-panel]"),
        qrCode: root.querySelector("[data-qr-code]"),

        discountOpen: root.querySelector("[data-discount-open]"),
        discountList: root.querySelector("[data-discount-list]"),
        discountModal: root.querySelector("[data-discount-modal]"),
        discountAvailable: root.querySelector("[data-discount-available]"),
        discountCreate: root.querySelector("[data-discount-create]"),
        discountType: byId("loaiMienGiam"),

        print: root.querySelector("[data-print]"),
        pay: root.querySelector("[data-pay]"),
        confirmPayment: root.querySelector("[data-confirm-payment]"),
        cancelQr: root.querySelector("[data-cancel-qr]"),
        refund: root.querySelector("[data-refund]"),
        cancelPhieu: root.querySelector("[data-cancel-phieu]"),
        newTicket: root.querySelector("[data-new-ticket]"),
        newTicketLabel: root.querySelector("[data-new-ticket-label]"),
        discountSearch: byId("mienGiamSearch"),
    };

    try {
        setLoading(true);

        state.permissions = await permission.load();

        if (!permission.canAccessPage(state.permissions)) {
            showNoPermission();
            return;
        }

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
            loadEmployees()
        ]);

        renderOptions();
        enhanceQuantityField();
        restoreDailyMealSelection();
        restoreDoiTuongSelection();
        renderPermissionActions();
        bindEvents();
        renderMeal();
        renderPersonMode();
        renderEmployee();
        await loadGiaVePreview(false);
        renderSummary();
    } catch (error) {
        showError(error, "Không thể khởi tạo trang lấy vé ăn.");
    } finally {
        setLoading(false);
    }

    function bindEvents() {
        el.thucDonNgayId?.addEventListener("change", async () => {
            if (!canChangePricingFields()) {
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

        el.nhanVienId?.addEventListener("change", () => {
            if (!canChangePricingFields()) {
                restoreEmployee();
                return;
            }

            renderEmployee();
            markDraftDirty();
        });

        el.soLuong?.addEventListener("input", () => {
            if (!canChangePricingFields()) {
                el.soLuong.value = String(state.phieu?.soLuong || 1);
                return;
            }

            normalizeQuantity();
            renderSummary();
            markDraftDirty();
        });

        root.querySelector("[data-qty-minus]")?.addEventListener("click", () => {
            if (!canChangePricingFields()) {
                return;
            }

            el.soLuong.value = String(
                Math.max(1, Number(el.soLuong.value || 1) - 1)
            );
            renderSummary();
            markDraftDirty();
        });

        root.querySelector("[data-qty-plus]")?.addEventListener("click", () => {
            if (!canChangePricingFields()) {
                return;
            }

            el.soLuong.value = String(
                Math.max(1, Number(el.soLuong.value || 1) + 1)
            );
            renderSummary();
            markDraftDirty();
        });

        el.discountOpen?.addEventListener("click", openDiscountModal);
        el.pay?.addEventListener("click", handlePay);
        el.confirmPayment?.addEventListener("click", confirmCurrentPayment);
        el.cancelQr?.addEventListener("click", cancelQr);
        el.print?.addEventListener("click", printTicket);
        el.cancelPhieu?.addEventListener("click", cancelPhieu);
        el.refund?.addEventListener("click", refundPayment);

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
        bindDiscountSearch();
        bindGiaTriMienGiamInput();
        window.addEventListener(
            "storage",
            handleLayVeStorageChange
        );
    }

    async function loadThucDonNgay() {
        const response = await request(
            `${API.phieu}/thuc-don-ngay-hop-le`
        );

        state.thucDonNgay = normalizeList(response?.data);
    }

    async function loadEmployees() {
        const response = await request(API.employee);

        state.employees = normalizeList(response?.data)
            .filter(item => item?.active !== false);
    }

    async function loadEnum(name, assign) {
        const response = await request(
            `${API.enums}?name=${encodeURIComponent(name)}`
        );

        assign(normalizeEnum(response?.data));
    }

    async function handleLayVeStorageChange(
        event
    ) {

        if (
            event.key ===
            DAILY_MEAL_STORAGE_KEY
        ) {

            restoreDailyMealSelection();

            renderMeal();


            await loadGiaVePreview(
                false
            );


            renderSummary();

            return;

        }


        if (
            event.key ===
            TAKER_TYPE_STORAGE_KEY
        ) {

            restoreDoiTuongSelection();

            renderPersonMode();


            await loadGiaVePreview(
                false
            );


            renderSummary();

        }

    }

    function bindDoiTuongLayVeEvents() {

        const select =
            el.doiTuongLayVe;


        if (
            !select ||
            select.dataset
                .layVeDoiTuongBound ===
                "true"
        ) {

            return;

        }


        select.dataset
            .layVeDoiTuongBound =
            "true";


        let timer =
            null;


        const scheduleSync =
            () => {

                if (
                    timer
                ) {

                    clearTimeout(
                        timer
                    );

                }


                timer =
                    setTimeout(
                        async () => {

                            timer =
                                null;


                            syncDoiTuongFromSmartSelect();


                            await handleDoiTuongLayVeChange();

                        },
                        0
                    );

            };


        select.addEventListener(
            "change",
            scheduleSync
        );


        select.addEventListener(
            "input",
            scheduleSync
        );


        const smartSelectRoot =
            select.closest(
                "[data-smart-select]"
            );


        smartSelectRoot
            ?.addEventListener(
                "click",
                scheduleSync
            );

    }

    function syncDoiTuongFromSmartSelect() {

        const select =
            el.doiTuongLayVe;


        if (!select) {

            return "";

        }


        const smartSelectRoot =
            select.closest(
                "[data-smart-select]"
            );


        if (!smartSelectRoot) {

            return select.value;

        }


        const display =
            smartSelectRoot.querySelector(
                [
                    ".smart-select__value",
                    "[data-smart-select-value]",
                    ".smart-select__placeholder"
                ].join(
                    ","
                )
            );


        const displayText =
            normalizeSearchText(
                display?.textContent
            );


        if (
            !displayText ||
            displayText.includes(
                "chon doi tuong"
            )
        ) {

            return select.value;

        }


        const selectedItem =
            state.doiTuong.find(
                item =>
                    normalizeSearchText(
                        item.label
                    ) ===
                    displayText
            );


        if (
            !selectedItem
        ) {

            return select.value;

        }


        const value =
            String(
                selectedItem.value
            );


        Array
            .from(
                select.options ||
                []
            )
            .forEach(
                option => {

                    option.selected =
                        option.value ===
                        value;

                }
            );


        select.value =
            value;


        return value;

    }

    function rememberDoiTuongSelection(
        selectedValue =
            null
    ) {

        const rawValue =
            selectedValue !==
                null
                ? selectedValue
                : syncDoiTuongFromSmartSelect();


        const value =
            toPositiveInt(
                rawValue
            );


        if (!value) {

            return;

        }


        localStorage.setItem(
            TAKER_TYPE_STORAGE_KEY,
            String(
                value
            )
        );

    }

    async function handleDoiTuongLayVeChange() {

        if (
            !canChangePricingFields()
        ) {

            restoreDoiTuong();

            return;

        }


        const value =
            syncDoiTuongFromSmartSelect();


        rememberDoiTuongSelection(
            value
        );


        renderPersonMode(
            value
        );


        await loadGiaVePreview(
            true
        );


        renderSummary();


        markDraftDirty();

    }

    function handleNewTicket() {

        const execute =
            async () => {

                await resetForNewTicket();

            };


        if (
            state.phieu ||
            state.payment ||
            state.discounts.length
        ) {

            confirmAction(
                "Lấy vé mới",
                "Bỏ thông tin đang nhập để chuyển sang người lấy vé mới?",
                "Tiếp tục",
                "primary",
                execute
            );

            return;

        }


        execute();

    }

    async function resetForNewTicket() {

        stopQrPolling();


        closeDiscountModal();


        state.phieu =
            null;

        state.discounts =
            [];

        state.availableDiscounts =
            [];

        state.payment =
            null;

        state.qrPayment =
            null;

        state.pricePreview =
            null;


        root.dataset.phieuId =
            "";


        setPricingFieldsDisabled(
            false
        );


        if (
            el.soLuong
        ) {

            el.soLuong.value =
                "1";

        }


        setSelectValue(
            el.nhanVienId,
            "",
            false
        );


        clearEmployeeInfo();


        clearTextField(
            el.noteEmployee
        );


        clearTextField(
            el.hoTen
        );

        clearTextField(
            el.phone
        );

        clearTextField(
            el.address
        );

        clearTextField(
            el.unit
        );

        clearTextField(
            el.noteGuest
        );


        clearDateField(
            "ngaySinhNguoiLayVe"
        );


        setSelectValue(
            el.gioiTinh,
            "",
            false
        );


        if (
            el.permanentGuest
        ) {

            el.permanentGuest.checked =
                false;

        }


        renderDiscounts();


        renderQrPanel();


        resetPaymentSelection();


        /*
        * KHÔNG xóa hai lựa chọn này:
        *
        * - thực đơn ngày
        * - đối tượng lấy vé
        *
        * vì user muốn giữ thao tác.
        */
        restoreDailyMealSelection();


        restoreDoiTuongSelection();


        renderMeal();


        renderPersonMode();


        renderEmployee();


        await loadGiaVePreview(
            false
        );


        renderSummary();


        renderStateActions();

    }

    function clearEmployeeInfo() {

        [
            el.employeeCode,
            el.employeeName,
            el.employeeDepartment,
            el.employeeSite,
            el.employeePhone
        ]
            .forEach(
                element => {

                    if (
                        element
                    ) {

                        element.textContent =
                            "-";

                    }

                }
            );

    }

    function clearTextField(
        input
    ) {

        if (!input) {
            return;
        }


        input.value =
            "";

    }

    function clearDateField(
        id
    ) {

        const input =
            document.getElementById(
                id
            );


        if (!input) {
            return;
        }


        const field =
            input.closest(
                "[data-form-field]"
            );


        const datePickerRoot =
            input.closest(
                "[data-date-picker]"
            ) ||
            field?.querySelector(
                "[data-date-picker]"
            );


        const hiddenInput =
            field?.querySelector(
                "[data-date-value]"
            ) ||
            input;


        const displayInput =
            field?.querySelector(
                "[data-date-input]"
            );


        if (
            hiddenInput
        ) {

            hiddenInput.value =
                "";

        }


        if (
            displayInput
        ) {

            displayInput.value =
                "";

        }


        (
            datePickerRoot?.datePicker ||
            field?.datePicker
        )
            ?.setValue
            ?.(
                "",
                false
            );

    }

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

    function renderOptions() {
        fillSelect(
            el.thucDonNgayId,
            state.thucDonNgay,
            item => item.id,
            item => {
                const date = formatDate(item.ngay);
                const ca = item.tenCaAn || item.maCaAn || "Ca ăn";
                const nhaAn = item.tenNhaAn || "Nhà ăn";
                return `${date} - ${ca} - ${nhaAn}`;
            }
        );

        fillSelect(
            el.doiTuongLayVe,
            state.doiTuong,
            item => item.value,
            item => item.label
        );

        fillSelect(
            el.gioiTinh,
            state.gioiTinh,
            item => item.value,
            item => item.label
        );

        fillSelect(
            el.discountType,
            state.discountTypes,
            item => item.value,
            item => item.label
        );

        fillSelect(
            el.nhanVienId,
            state.employees,
            item => item.id,
            item =>
                [
                    item.maNhanVien || item.ma_nhan_vien,
                    item.hoTen || item.tenNhanVien || item.ho_ten
                ]
                    .filter(Boolean)
                    .join(" - ")
        );

        renderPaymentMethods();
    }

    function renderPaymentMethods() {
        if (!el.paymentMethodList) {
            return;
        }

        const visible = state.paymentMethods.filter(item => {
            const isQr = isQrMethod(item);

            return isQr
                ? permission.canCreateQr(state.permissions)
                : permission.canCreatePayment(state.permissions);
        });

        el.paymentSection.hidden =
            !permission.canViewPayment(state.permissions) ||
            visible.length === 0;

        el.paymentMethodList.innerHTML = "";

        visible.forEach((item, index) => {
            const value = String(item.value);
            const label = document.createElement("label");
            label.className = "lva-payment-option";
            label.dataset.paymentOption = value;

            const icon = isQrMethod(item)
                ? "fa-qrcode"
                : "fa-building-columns";

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
                    <small>${isQrMethod(item)
                        ? "Tạo giao dịch QR để thanh toán"
                        : "Tạo giao dịch thanh toán"}
                    </small>
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
        el.discountOpen.hidden =
            !permission.canCreateDiscount(state.permissions);

        el.pay.hidden =
            !(
                permission.canCreatePayment(state.permissions) ||
                permission.canCreateQr(state.permissions)
            );

        renderStateActions();
    }

    function renderStateActions() {
        const status = Number(state.phieu?.trangThai);
        const paid = status === 40;
        const cancelled = status === 50;
        const refunded = status === 60;

        el.print.hidden =
            !paid ||
            !permission.canPrint(state.permissions);

        el.cancelPhieu.hidden =
            !state.phieu ||
            paid ||
            cancelled ||
            refunded ||
            !permission.canCancelPhieu(state.permissions);

        el.refund.hidden =
            !paid ||
            !permission.canRefund(state.permissions);

        el.confirmPayment.hidden =
            !state.payment ||
            paid ||
            !permission.canConfirmPayment(state.permissions);

        el.cancelQr.hidden =
            !state.qrPayment ||
            paid ||
            !permission.canCancelQr(state.permissions);

        if (el.pay) {
            el.pay.disabled = paid || cancelled || refunded;
        }
    }

    function renderMeal() {
        const item = getSelectedMeal();

        el.mealDetail.hidden = !item;

        if (!item) {
            return;
        }

        el.mealDate.textContent = formatDate(item.ngay);
        el.mealName.textContent =
            item.tenThucDon || item.maThucDon || "-";
        el.mealCanteen.textContent =
            item.tenNhaAn || item.maNhaAn || "-";
        el.mealShift.textContent =
            item.tenCaAn || item.maCaAn || "-";
        el.mealTime.textContent = [
            formatTime(item.thoiGianBatDau),
            formatTime(item.thoiGianKetThuc)
        ]
            .filter(Boolean)
            .join(" - ") || "-";

        if (el.viewMenu) {
            el.viewMenu.href =
                item.thucDonId
                    ? `/thuc-don/thong-tin-chi-tiet-thuc-don/${item.thucDonId}`
                    : "#";
        }
    }

    function getDoiTuongByValue(
        value
    ) {

        return state.doiTuong.find(
            item =>
                String(
                    item.value
                ) ===
                String(
                    value
                )
        ) ||
        null;

    }

    function isNhanVienDoiTuong(
        value
    ) {

        const item =
            getDoiTuongByValue(
                value
            );


        if (
            !item
        ) {

            return false;

        }


        const label =
            normalizeSearchText(
                item.label
            );


        return (
            Number(
                item.value
            ) ===
            10 ||
            label ===
                "nhan vien" ||
            label.includes(
                "nhan vien"
            )
        );

    }

    function renderPersonMode(
        selectedValue =
            null
    ) {

        const value =
            selectedValue !==
                null
                ? String(
                    selectedValue
                )
                : String(
                    el.doiTuongLayVe
                        ?.value ||
                    ""
                );


        const hasValue =
            Boolean(
                value
            );


        const isEmployee =
            isNhanVienDoiTuong(
                value
            );


        el.employeeSelectField.hidden =
            !isEmployee;


        el.employeeInfo.hidden =
            !isEmployee;


        el.guestForm.hidden =
            !hasValue ||
            isEmployee;


        if (
            isEmployee
        ) {

            renderEmployee();

        }

    }

    function renderEmployee() {
        const employee = getSelectedEmployee();

        if (!employee) {
            [
                el.employeeCode,
                el.employeeName,
                el.employeeDepartment,
                el.employeeSite,
                el.employeePhone
            ].forEach(node => {
                if (node) {
                    node.textContent = "-";
                }
            });
            return;
        }

        el.employeeCode.textContent =
            employee.maNhanVien || employee.ma_nhan_vien || "-";

        el.employeeName.textContent =
            employee.hoTen ||
            employee.tenNhanVien ||
            employee.ho_ten ||
            "-";

        el.employeeDepartment.textContent =
            employee.tenPhongBan ||
            employee.phongBan?.tenPhongBan ||
            employee.phongBan?.ten ||
            "-";

        el.employeeSite.textContent =
            employee.tenCoSo ||
            employee.coSo?.tenCoSo ||
            employee.coSo?.ten ||
            "-";

        el.employeePhone.textContent =
            employee.soDienThoai ||
            employee.so_dien_thoai ||
            "-";
    }

    function renderSummary() {
        const currentThucDonNgayId = toPositiveInt(
            el.thucDonNgayId?.value
        );
        const currentDoiTuongLayVe = toPositiveInt(
            el.doiTuongLayVe?.value
        );
        const currentSoLuong = Math.max(
            1,
            Math.floor(Number(el.soLuong?.value || 1))
        );

        const phieu =
            state.phieu &&
            Number(state.phieu.thucDonNgayId) === currentThucDonNgayId &&
            Number(state.phieu.doiTuongLayVe) === currentDoiTuongLayVe &&
            Number(state.phieu.soLuong) === currentSoLuong
                ? state.phieu
                : null;

        const preview = state.pricePreview;
        const doiTuong = state.doiTuong.find(
            item => Number(item.value) === Number(el.doiTuongLayVe?.value)
        );

        const soLuong = currentSoLuong;

        const donGia = phieu
            ? Number(phieu.donGia)
            : preview?.donGia !== undefined && preview?.donGia !== null
                ? Number(preview.donGia)
                : null;

        const tienGoc = phieu
            ? Number(phieu.tienGoc)
            : Number.isFinite(donGia)
                ? donGia * soLuong
                : null;

        const tongMienGiam = phieu
            ? Number(phieu.tongMienGiam || 0)
            : 0;

        const thanhTien = phieu
            ? Number(phieu.thanhTien)
            : Number.isFinite(tienGoc)
                ? Math.max(tienGoc - tongMienGiam, 0)
                : null;

        el.summaryTicket.textContent =
            doiTuong?.label || "-";

        el.summaryQty.textContent =
            `${soLuong} vé`;

        el.summaryPrice.textContent =
            Number.isFinite(donGia)
                ? formatMoney(donGia)
                : "-";

        el.summaryOriginal.textContent =
            Number.isFinite(tienGoc)
                ? formatMoney(tienGoc)
                : "-";

        el.summaryDiscount.textContent =
            tongMienGiam > 0
                ? `-${formatMoney(tongMienGiam)}`
                : "0 đ";

        el.summaryTotal.textContent =
            Number.isFinite(thanhTien)
                ? formatMoney(thanhTien)
                : "-";

        renderStateActions();
    }

    async function saveDraft() {
        const payload = buildPhieuPayload();

        validatePhieuPayload(payload);

        const canCreate = permission.canCreatePhieu(state.permissions);
        const canUpdate = permission.canUpdatePhieu(state.permissions);

        let response;

        if (!state.phieu) {
            if (!canCreate) {
                throw new Error("Bạn không có quyền tạo phiếu lấy vé ăn.");
            }

            response = await request(
                `${API.phieu}/them-moi`,
                "POST",
                payload
            );
        } else {
            if (!canUpdate) {
                return state.phieu;
            }

            response = await request(
                `${API.phieu}/cap-nhat/${state.phieu.id}`,
                "PATCH",
                payload
            );
        }

        state.phieu = response?.data || null;
        state.pricePreview = state.phieu
            ? {
                donGia: state.phieu.donGia
            }
            : state.pricePreview;
        root.dataset.phieuId = state.phieu?.id || "";
        renderSummary();

        return state.phieu;
    }

    function buildPhieuPayload() {

        const doiTuong =
            Number(
                el.doiTuongLayVe
                    ?.value
            );


        const isEmployee =
            isNhanVienDoiTuong(
                doiTuong
            );


        return {

            thucDonNgayId:
                toPositiveInt(
                    el.thucDonNgayId
                        ?.value
                ),

            doiTuongLayVe:
                doiTuong ||
                null,

            nhanVienId:
                isEmployee
                    ? toPositiveInt(
                        el.nhanVienId
                            ?.value
                    )
                    : null,

            hoTenNguoiLayVe:
                isEmployee
                    ? null
                    : nullableText(
                        el.hoTen
                            ?.value
                    ),

            ngaySinhNguoiLayVe:
                isEmployee
                    ? null
                    : normalizeDateForApi(
                        el.ngaySinh
                            ?.value
                    ),

            gioiTinhNguoiLayVe:
                isEmployee
                    ? null
                    : nullableNumber(
                        el.gioiTinh
                            ?.value
                    ),

            soDienThoaiNguoiLayVe:
                isEmployee
                    ? null
                    : nullableText(
                        el.phone
                            ?.value
                    ),

            diaChiNguoiLayVe:
                isEmployee
                    ? null
                    : nullableText(
                        el.address
                            ?.value
                    ),

            donViNguoiLayVe:
                isEmployee
                    ? null
                    : nullableText(
                        el.unit
                            ?.value
                    ),

            khachLauDai:
                isEmployee
                    ? false
                    : Boolean(
                        el.permanentGuest
                            ?.checked
                    ),

            soLuong:
                Math.max(
                    1,
                    Math.floor(
                        Number(
                            el.soLuong
                                ?.value ||
                            1
                        )
                    )
                ),

            ghiChu:
                nullableText(
                    isEmployee
                        ? el.noteEmployee
                            ?.value
                        : el.noteGuest
                            ?.value
                ),

            phuongThucThanhToan:
                state.selectedPaymentMethod ??
                null

        };

    }

    function validatePhieuPayload(payload) {
        if (!payload.thucDonNgayId) {
            throw new Error("Vui lòng chọn bữa ăn / thực đơn.");
        }

        if (!payload.doiTuongLayVe) {
            throw new Error("Vui lòng chọn đối tượng lấy vé.");
        }

        if (
            isNhanVienDoiTuong(
                payload.doiTuongLayVe
            ) &&
            !payload.nhanVienId
        ){
            throw new Error("Vui lòng chọn nhân viên lấy vé.");
        }

        if (
            !isNhanVienDoiTuong(
                payload.doiTuongLayVe
            ) &&
            !payload.hoTenNguoiLayVe
        ) {
            throw new Error("Vui lòng nhập họ tên người lấy vé.");
        }

        if (!Number.isInteger(payload.soLuong) || payload.soLuong < 1) {
            throw new Error("Số lượng vé phải lớn hơn 0.");
        }
    }

    async function openDiscountModal() {

        if (
            !permission.canCreateDiscount(
                state.permissions
            )
        ) {

            return;

        }


        try {

            setLoading(
                true
            );


            await saveDraft();


            if (
                el.discountSearch
            ) {

                el.discountSearch.value =
                    "";

            }


            changeDiscountTab(
                "available"
            );


            el.discountModal.hidden =
                false;

            await reloadDiscounts();

            await loadAvailableDiscounts();

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

    }

    function getManualDiscount() {

        return state.discounts.find(
            item =>
                !item.voucherId &&
                !item.chinhSachId
        ) ||
        null;

    }

    function closeDiscountModal() {
        if (el.discountModal) {
            el.discountModal.hidden = true;
        }
    }

    function changeDiscountTab(
        name
    ) {

        root.querySelectorAll(
            "[data-discount-tab]"
        )
            .forEach(
                button => {

                    button.classList.toggle(
                        "is-active",
                        button.dataset
                            .discountTab ===
                            name
                    );

                }
            );


        root.querySelectorAll(
            "[data-discount-panel]"
        )
            .forEach(
                panel => {

                    panel.hidden =
                        panel.dataset
                            .discountPanel !==
                        name;

                }
            );


        if (
            name ===
            "manual"
        ) {

            renderManualDiscountForm();

        }

    }

    function renderManualDiscountForm() {

        const manual =
            getManualDiscount();


        const maInput =
            byId(
                "maMienGiam"
            );


        const tenInput =
            byId(
                "tenMienGiam"
            );


        const giaTriInput =
            byId(
                "giaTriMienGiam"
            );


        const lyDoInput =
            byId(
                "lyDoMienGiam"
            );


        if (
            maInput
        ) {

            maInput.value =
                manual?.maMienGiam ||
                "";

        }


        if (
            tenInput
        ) {

            tenInput.value =
                manual?.tenMienGiam ||
                "";

        }


        setSelectValue(
            el.discountType,
            manual?.loaiMienGiam ??
                "",
            false
        );

        if (
            giaTriInput
        ) {

            giaTriInput.value =
                formatVietnameseNumberInput(
                    manual?.giaTri
                );

        }

        if (
            lyDoInput
        ) {

            lyDoInput.value =
                manual?.lyDoMienGiam ||
                "";

        }


        if (
            el.discountCreate
        ) {

            el.discountCreate.textContent =
                manual
                    ? "Cập nhật miễn giảm"
                    : "Thêm miễn giảm";


            el.discountCreate.dataset
                .manualDiscountId =
                manual?.id ||
                "";

        }

    }

    function bindDiscountSearch() {

        const searchRoot =
            root.querySelector(
                ".lva-discount-search"
            );


        const input =
            searchRoot?.querySelector(
                "[data-list-search]"
            ) ||
            document.getElementById(
                "mienGiamSearch"
            );


        const clearButton =
            searchRoot?.querySelector(
                "[data-list-clear-search]"
            );


        if (
            !input ||
            input.dataset
                .layVeDiscountSearchBound ===
                "true"
        ) {

            return;

        }


        input.dataset
            .layVeDiscountSearchBound =
            "true";


        input.addEventListener(
            "input",
            () => {

                const keyword =
                    input.value
                        .trim();


                if (
                    clearButton
                ) {

                    clearButton.hidden =
                        !keyword;

                }


                renderAvailableDiscounts(
                    keyword
                );

            }
        );


        clearButton
            ?.addEventListener(
                "click",
                event => {

                    event.preventDefault();


                    input.value =
                        "";


                    clearButton.hidden =
                        true;


                    renderAvailableDiscounts(
                        ""
                    );


                    input.focus();

                }
            );

    }

    function bindGiaTriMienGiamInput() {

        const input =
            byId(
                "giaTriMienGiam"
            );


        if (
            !input ||
            input.dataset
                .giaTriMienGiamBound ===
                "true"
        ) {

            return;

        }


        input.dataset
            .giaTriMienGiamBound =
            "true";


        input.addEventListener(
            "input",
            () => {

                const raw =
                    String(
                        input.value ||
                        ""
                    )
                        .replace(
                            /\s/g,
                            ""
                        );


                const commaIndex =
                    raw.indexOf(
                        ","
                    );


                let integerPart =
                    commaIndex ===
                        -1
                        ? raw
                        : raw.slice(
                            0,
                            commaIndex
                        );


                let decimalPart =
                    commaIndex ===
                        -1
                        ? ""
                        : raw.slice(
                            commaIndex +
                            1
                        );


                /*
                * Chỉ giữ số ở phần nguyên.
                *
                * 2.000.000
                * -> 2000000
                */
                integerPart =
                    integerPart
                        .replace(
                            /\D/g,
                            ""
                        )
                        .replace(
                            /^0+(?=\d)/,
                            ""
                        );


                /*
                * Sau dấu phẩy:
                * chỉ cho tối đa 5 chữ số.
                */
                decimalPart =
                    decimalPart
                        .replace(
                            /\D/g,
                            ""
                        )
                        .slice(
                            0,
                            5
                        );


                /*
                * Format hàng nghìn.
                */
                const formattedInteger =
                    integerPart
                        .replace(
                            /\B(?=(\d{3})+(?!\d))/g,
                            "."
                        );


                input.value =
                    commaIndex !==
                        -1
                        ? `${formattedInteger},${decimalPart}`
                        : formattedInteger;

            }
        );

    }

    function parseVietnameseNumber(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return null;

        }


        const text =
            String(
                value
            )
                .trim()
                .replace(
                    /\s/g,
                    ""
                );


        if (!text) {

            return null;

        }


        /*
        * 20.000,33333
        * -> 20000.33333
        *
        * 2.000.000
        * -> 2000000
        */
        const normalized =
            text
                .replace(
                    /\./g,
                    ""
                )
                .replace(
                    ",",
                    "."
                );


        const number =
            Number(
                normalized
            );


        return Number.isFinite(
            number
        )
            ? number
            : null;

    }

    function formatVietnameseNumberInput(
        value
    ) {

        if (
            value === null ||
            value === undefined ||
            value === ""
        ) {

            return "";

        }


        const text =
            String(
                value
            )
                .trim()
                .replace(
                    ",",
                    "."
                );


        const parts =
            text.split(
                "."
            );


        const integerPart =
            String(
                parts[0] ||
                "0"
            )
                .replace(
                    /\D/g,
                    ""
                )
                .replace(
                    /\B(?=(\d{3})+(?!\d))/g,
                    "."
                );


        const decimalPart =
            (
                parts[1] ??
                ""
            )
                .replace(
                    /\D/g,
                    ""
                )
                .slice(
                    0,
                    5
                );


        return decimalPart
            ? `${integerPart},${decimalPart}`
            : integerPart;

    }

    async function loadAvailableDiscounts() {

        if (
            !state.phieu ||
            !permission
                .canViewDiscount(
                    state.permissions
                )
        ) {

            state.availableDiscounts =
                [];

            renderAvailableDiscounts(
                ""
            );

            return;

        }


        const response =
            await request(
                `${API.discount}/kha-dung?phieuLayVeId=${state.phieu.id}`
            );

        state.availableDiscounts =
            normalizeList(
                response?.data
            );


        renderAvailableDiscounts(
            el.discountSearch?.value ||
            ""
        );

    }

    function getAppliedVoucherDiscount(
        voucherId
    ) {

        if (!voucherId) {

            return null;

        }


        return state.discounts.find(
            item =>
                Number(
                    item.voucherId
                ) ===
                Number(
                    voucherId
                )
        ) ||
        null;

    }

    function renderAvailableDiscounts(
        searchValue = ""
    ) {

        if (
            !el.discountAvailable
        ) {

            return;

        }


        const keyword =
            normalizeSearchText(
                searchValue
            );


        const items =
            !keyword
                ? state.availableDiscounts
                : state.availableDiscounts
                    .filter(
                        item => {

                            const searchText =
                                normalizeSearchText(
                                    [
                                        item.tenVoucher,
                                        item.maVoucher,
                                        item.tenChinhSach,
                                        item.maChinhSach,
                                        item.tenMienGiam,
                                        item.maMienGiam,
                                        item.giaTri,
                                        formatDiscountDescription(
                                            item
                                        )
                                    ]
                                        .filter(
                                            Boolean
                                        )
                                        .join(
                                            " "
                                        )
                                );


                            return searchText
                                .includes(
                                    keyword
                                );

                        }
                    );


        el.discountAvailable.innerHTML =
            "";


        if (
            !items.length
        ) {

            el.discountAvailable.innerHTML =
                `
                    <span class="lva-empty">
                        Không tìm thấy miễn giảm phù hợp.
                    </span>
                `;

            return;

        }

        items.forEach(
            item => {

                const appliedDiscount =
                    getAppliedVoucherDiscount(
                        item.voucherId
                    );


                const isApplied =
                    Boolean(
                        appliedDiscount
                    );


                const row =
                    document.createElement(
                        "div"
                    );


                row.className =
                    isApplied
                        ? "lva-available-item is-applied"
                        : "lva-available-item";

                row.className =
                    "lva-available-item";


                row.innerHTML =
                    `
                        <div>

                            <strong>
                                ${escapeHtml(
                                    item.tenVoucher ||
                                    item.maVoucher ||
                                    "Miễn giảm"
                                )}
                            </strong>

                            <small>
                                ${escapeHtml(
                                    formatDiscountDescription(item)
                                )}
                            </small>

                        </div>

                        <button
                            type="button"
                            class="
                                lva-btn
                                ${isApplied
                                    ? (
                                        permission.canDeleteDiscount(
                                            state.permissions
                                        )
                                            ? "lva-btn--danger-soft"
                                            : "lva-btn--outline"
                                    )
                                    : "lva-btn--primary"
                                }
                                lva-btn--sm
                            "
                            data-voucher-action
                            ${isApplied &&
                                !permission.canDeleteDiscount(
                                    state.permissions
                                )
                                    ? "disabled"
                                    : ""
                            }>

                            ${
                                isApplied
                                    ? (
                                        permission.canDeleteDiscount(
                                            state.permissions
                                        )
                                            ? "Hủy bỏ"
                                            : "Đã áp dụng"
                                    )
                                    : "Áp dụng"
                            }

                        </button>
                    `;

                row.querySelector(
                    "[data-voucher-action]"
                )
                    ?.addEventListener(
                        "click",
                        async () => {

                            /*
                            * Voucher đã áp dụng:
                            * không POST /ap-dung lần nữa.
                            */
                            if (
                                appliedDiscount
                            ) {

                                if (
                                    !permission.canDeleteDiscount(
                                        state.permissions
                                    )
                                ) {

                                    return;

                                }


                                deleteDiscount(
                                    appliedDiscount.id
                                );

                                return;

                            }


                            try {

                                setLoading(
                                    true
                                );


                                await request(
                                    `${API.discount}/ap-dung`,
                                    "POST",
                                    {
                                        phieuLayVeId:
                                            state.phieu.id,

                                        chinhSachId:
                                            item.chinhSachId ??
                                            null,

                                        voucherId:
                                            item.voucherId
                                    }
                                );


                                /*
                                * Phải reload state.discounts trước.
                                */
                                await refreshAfterDiscount();


                                /*
                                * Render lại danh sách để nút vừa bấm
                                * đổi ngay Áp dụng -> Hủy bỏ.
                                */
                                await loadAvailableDiscounts();

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

                        }
                    );

                el.discountAvailable
                    .appendChild(
                        row
                    );

            }
        );

    }

    function formatDiscountDescription(
        item
    ) {

        const loai =
            Number(
                item?.loaiMienGiam
            );


        const giaTri =
            Number(
                item?.giaTri
            );


        if (
            !Number.isFinite(
                giaTri
            )
        ) {

            return "Giá trị không hợp lệ";

        }


        let giaTriText =
            "";


        if (
            loai === 10
        ) {

            giaTriText =
                `Giảm ${giaTri.toLocaleString(
                    "vi-VN",
                    {
                        maximumFractionDigits:
                            5
                    }
                )}%`;

        }
        else if (
            loai === 20
        ) {

            giaTriText =
                `Giảm ${formatMoney(
                    giaTri
                )}`;

        }
        else {

            giaTriText =
                "Loại miễn giảm không hợp lệ";

        }


        if (
            Number.isFinite(
                Number(
                    item?.soTienGiamDuKien
                )
            )
        ) {

            return (
                `${giaTriText} · ` +
                `Dự kiến -${formatMoney(
                    item.soTienGiamDuKien
                )}`
            );

        }


        return giaTriText;

    }

    function normalizeSearchText(
        value
    ) {

        return String(
            value ??
            ""
        )
            .normalize(
                "NFD"
            )
            .replace(
                /[\u0300-\u036f]/g,
                ""
            )
            .replace(
                /đ/g,
                "d"
            )
            .replace(
                /Đ/g,
                "D"
            )
            .toLowerCase()
            .trim();

    }

    async function createManualDiscount() {

        if (
            !permission.canCreateDiscount(
                state.permissions
            )
        ) {

            return;

        }


        try {

            setLoading(
                true
            );


            await saveDraft();


            /*
            * State phải mới nhất.
            */
            await reloadDiscounts();


            const manual =
                getManualDiscount();


            const data = {

                maMienGiam:
                    nullableText(
                        byId(
                            "maMienGiam"
                        )
                            ?.value
                    ),

                tenMienGiam:
                    nullableText(
                        byId(
                            "tenMienGiam"
                        )
                            ?.value
                    ),

                loaiMienGiam:
                    nullableNumber(
                        byId(
                            "loaiMienGiam"
                        )
                            ?.value
                    ),

                giaTri:
                    parseVietnameseNumber(
                        byId(
                            "giaTriMienGiam"
                        )
                            ?.value
                    ),

                lyDoMienGiam:
                    nullableText(
                        byId(
                            "lyDoMienGiam"
                        )
                            ?.value
                    )

            };


            if (
                !data.tenMienGiam
            ) {

                throw new Error(
                    "Vui lòng nhập tên miễn giảm."
                );

            }


            if (
                !data.loaiMienGiam
            ) {

                throw new Error(
                    "Vui lòng chọn loại miễn giảm."
                );

            }


            if (
                !Number.isFinite(
                    data.giaTri
                ) ||
                data.giaTri <=
                    0
            ) {

                throw new Error(
                    "Giá trị miễn giảm phải lớn hơn 0."
                );

            }


            if (
                Number(
                    data.loaiMienGiam
                ) ===
                    10 &&
                data.giaTri >
                    100
            ) {

                throw new Error(
                    "Miễn giảm phần trăm không được vượt quá 100%."
                );

            }


            if (
                !data.lyDoMienGiam
            ) {

                throw new Error(
                    "Vui lòng nhập lý do miễn giảm."
                );

            }


            let response;


            /*
            * ĐÃ có manual:
            * cập nhật record cũ.
            */
            if (
                manual
            ) {

                response =
                    await request(
                        `${API.discount}/cap-nhat/${manual.id}`,
                        "PATCH",
                        data
                    );

            }
            /*
            * CHƯA có manual:
            * chỉ lúc này mới POST.
            */
            else {

                response =
                    await request(
                        `${API.discount}/them-moi`,
                        "POST",
                        {

                            phieuLayVeId:
                                state.phieu.id,

                            ...data

                        }
                    );

            }


            await refreshAfterDiscount();


            renderManualDiscountForm();


            window.MCS
                ?.toast
                ?.success
                ?.(
                    response?.message ||
                    (
                        manual
                            ? "Cập nhật miễn giảm thành công."
                            : "Thêm miễn giảm thành công."
                    )
                );


            closeDiscountModal();

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

    }

    async function reloadDiscounts() {
        if (
            !state.phieu ||
            !permission.canViewDiscount(state.permissions)
        ) {
            state.discounts = [];
            renderDiscounts();
            return;
        }

        const response = await request(
            `${API.discount}/tong-hop?phieuLayVeId=${state.phieu.id}`
        );

        state.discounts = normalizeList(response?.data);
        renderDiscounts();
    }

    function renderDiscounts() {
        el.discountList.innerHTML = "";

        if (!state.discounts.length) {
            el.discountList.innerHTML =
                '<span class="lva-empty">Chưa có miễn giảm.</span>';
            setPricingFieldsDisabled(false);
            return;
        }

        setPricingFieldsDisabled(true);

        state.discounts.forEach(item => {
            const chip = document.createElement("div");
            chip.className = "lva-discount-chip";

            chip.innerHTML = `
                <i class="fa-regular fa-circle-check"></i>
                <span>${escapeHtml(
                    item.tenMienGiam ||
                    item.tenVoucher ||
                    item.maMienGiam ||
                    "Miễn giảm"
                )}</span>
                <strong>-${escapeHtml(formatMoney(item.soTienGiam || 0))}</strong>
            `;

            if (permission.canDeleteDiscount(state.permissions)) {
                const remove = document.createElement("button");
                remove.type = "button";
                remove.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                remove.title = "Xóa miễn giảm";

                remove.addEventListener("click", () =>
                    deleteDiscount(item.id)
                );

                chip.appendChild(remove);
            }

            el.discountList.appendChild(chip);
        });
    }

    async function deleteDiscount(id) {
        if (!permission.canDeleteDiscount(state.permissions)) {
            return;
        }

        const execute = async () => {
            try {
                setLoading(true);

                await request(
                    `${API.discount}/xoa/${id}`,
                    "DELETE"
                );

                await refreshAfterDiscount();

                if (
                    el.discountModal &&
                    !el.discountModal.hidden
                ) {

                    await loadAvailableDiscounts();

                }
            } catch (error) {
                showError(error);
            } finally {
                setLoading(false);
            }
        };

        confirmAction(
            "Xóa miễn giảm",
            "Bạn có chắc chắn muốn xóa miễn giảm này?",
            "Xóa",
            "danger",
            execute
        );
    }

    async function refreshAfterDiscount() {
        await Promise.all([
            reloadPhieu(),
            reloadDiscounts()
        ]);

        renderSummary();
    }

    async function reloadPhieu() {
        if (!state.phieu?.id) {
            return;
        }

        const response = await request(
            `${API.phieu}/${state.phieu.id}`
        );

        state.phieu = response?.data || state.phieu;
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

                state.qrPayment = response?.data || null;
                state.payment = state.qrPayment;

                renderQrPanel();
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

    async function cancelQr() {
        if (
            !state.qrPayment?.id ||
            !permission.canCancelQr(state.permissions)
        ) {
            return;
        }

        try {
            setLoading(true);

            await request(
                `${API.payment}/huy-qr/${state.qrPayment.id}`,
                "PATCH",
                {
                    noiDung: "Hủy từ màn hình lấy vé ăn."
                }
            );

            stopQrPolling();
            state.qrPayment = null;
            state.payment = null;
            el.qrPanel.hidden = true;

            await reloadPhieu();
            renderSummary();
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    }

    async function cancelPhieu() {
        if (
            !state.phieu?.id ||
            !permission.canCancelPhieu(state.permissions)
        ) {
            return;
        }

        const execute = async () => {
            const reason = window.prompt("Nhập lý do hủy phiếu:");

            if (!reason?.trim()) {
                return;
            }

            try {
                setLoading(true);

                const response = await request(
                    `${API.phieu}/huy/${state.phieu.id}`,
                    "PATCH",
                    {
                        lyDoHuy: reason.trim()
                    }
                );

                state.phieu = response?.data || state.phieu;
                renderSummary();
            } catch (error) {
                showError(error);
            } finally {
                setLoading(false);
            }
        };

        confirmAction(
            "Hủy phiếu lấy vé",
            "Bạn có chắc chắn muốn hủy phiếu này?",
            "Hủy phiếu",
            "danger",
            execute
        );
    }

    async function printTicket() {
        if (
            !state.phieu?.id ||
            !permission.canPrint(state.permissions)
        ) {
            return;
        }

        try {
            setLoading(true);

            const response = await request(
                `${API.phieu}/in-ve/${state.phieu.id}`
            );

            const data = response?.data;

            if (!data) {
                return;
            }

            const popup = window.open("", "_blank", "width=860,height=720");

            if (!popup) {
                throw new Error("Trình duyệt đang chặn cửa sổ in.");
            }

            popup.document.write(buildPrintHtml(data));
            popup.document.close();
            popup.focus();
            popup.print();
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    }

    function buildPrintHtml(data) {
        return `
            <!doctype html>
            <html lang="vi">
            <head>
                <meta charset="utf-8">
                <title>Vé ăn ${escapeHtml(data.soPhieu || "")}</title>
                <style>
                    body{font-family:Arial,sans-serif;padding:28px;color:#111827}
                    .ticket{border:1px solid #cbd5e1;border-radius:12px;padding:22px;max-width:680px;margin:auto}
                    h1{font-size:22px;margin:0 0 18px}
                    .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px}
                    .label{color:#64748b;font-size:12px}
                    .value{font-weight:700;margin-top:3px}
                    .total{border-top:1px solid #e2e8f0;margin-top:18px;padding-top:14px;font-size:18px}
                </style>
            </head>
            <body>
                <div class="ticket">
                    <h1>PHIẾU / VÉ ĂN</h1>
                    <div class="grid">
                        ${printRow("Số phiếu", data.soPhieu)}
                        ${printRow("Ngày", formatDate(data.ngay))}
                        ${printRow("Nhà ăn", data.tenNhaAn)}
                        ${printRow("Ca ăn", data.tenCaAn)}
                        ${printRow("Người lấy vé", data.tenNhanVien || data.hoTenNguoiLayVe)}
                        ${printRow("Số lượng", data.soLuong)}
                    </div>
                    <div class="total">
                        Thành tiền: <strong>${escapeHtml(formatMoney(data.thanhTien))}</strong>
                    </div>
                </div>
            </body>
            </html>
        `;
    }

    function printRow(label, value) {
        return `
            <div>
                <div class="label">${escapeHtml(label)}</div>
                <div class="value">${escapeHtml(value ?? "-")}</div>
            </div>
        `;
    }

    async function refundPayment() {
        if (
            !state.phieu?.id ||
            !permission.canRefund(state.permissions)
        ) {
            return;
        }

        const amountText = window.prompt(
            "Nhập số tiền hoàn. Để trống để hoàn toàn bộ số tiền còn lại:"
        );

        if (amountText === null) {
            return;
        }

        const amount = amountText.trim()
            ? Number(amountText.replace(/\./g, "").replace(",", "."))
            : undefined;

        try {
            setLoading(true);

            await request(
                `${API.payment}/hoan-tien`,
                "POST",
                {
                    phieuLayVeId: state.phieu.id,
                    phuongThuc: Number(state.selectedPaymentMethod),
                    ...(amount !== undefined ? { soTien: amount } : {})
                }
            );

            await reloadPhieu();
            renderSummary();
        } catch (error) {
            showError(error);
        } finally {
            setLoading(false);
        }
    }

    function setPricingFieldsDisabled(disabled) {
        [
            el.thucDonNgayId,
            el.doiTuongLayVe,
            el.nhanVienId,
            el.soLuong,
            el.hoTen,
            el.ngaySinh,
            el.gioiTinh,
            el.phone,
            el.address,
            el.unit,
            el.permanentGuest
        ].forEach(input => {
            if (input) {
                input.disabled = Boolean(disabled);
            }
        });

        root.querySelector("[data-qty-minus]")?.toggleAttribute(
            "disabled",
            Boolean(disabled)
        );

        root.querySelector("[data-qty-plus]")?.toggleAttribute(
            "disabled",
            Boolean(disabled)
        );
    }

    function canChangePricingFields() {
        if (!state.discounts.length) {
            return true;
        }

        window.MCS?.toast?.info?.(
            "Hãy xóa các miễn giảm đã áp dụng trước khi thay đổi bữa ăn, đối tượng hoặc số lượng."
        );

        return false;
    }

    function restoreSelectedMeal() {
        if (state.phieu?.thucDonNgayId) {
            el.thucDonNgayId.value = String(state.phieu.thucDonNgayId);
        }
        renderMeal();
    }

    function restoreDoiTuong() {
        if (state.phieu?.doiTuongLayVe) {
            el.doiTuongLayVe.value = String(state.phieu.doiTuongLayVe);
        }
        renderPersonMode();
    }

    function restoreEmployee() {
        if (state.phieu?.nhanVienId) {
            el.nhanVienId.value = String(state.phieu.nhanVienId);
        }
        renderEmployee();
    }

    function markDraftDirty() {
        // Dữ liệu thực tế được lưu tại saveDraft() trước miễn giảm/thanh toán.
    }

    function getSelectedMeal() {
        return state.thucDonNgay.find(
            item =>
                String(item.id) ===
                String(el.thucDonNgayId?.value)
        ) || null;
    }

    function getSelectedEmployee() {
        return state.employees.find(
            item =>
                String(item.id) ===
                String(el.nhanVienId?.value)
        ) || null;
    }

    function getTodayKey() {
        const now = new Date();

        return [
            now.getFullYear(),
            String(now.getMonth() + 1).padStart(2, "0"),
            String(now.getDate()).padStart(2, "0")
        ].join("-");
    }

    function rememberDailyMealSelection() {

        const value =
            toPositiveInt(
                el.thucDonNgayId?.value
            );


        if (!value) {

            localStorage.removeItem(
                DAILY_MEAL_STORAGE_KEY
            );

            return;

        }


        localStorage.setItem(
            DAILY_MEAL_STORAGE_KEY,
            JSON.stringify({
                date:
                    getTodayKey(),

                thucDonNgayId:
                    value
            })
        );

    }

    function restoreDailyMealSelection() {

        if (
            !el.thucDonNgayId
        ) {

            return;

        }


        let stored =
            null;


        try {

            stored =
                JSON.parse(
                    localStorage.getItem(
                        DAILY_MEAL_STORAGE_KEY
                    ) ||
                    "null"
                );

        } catch {

            localStorage.removeItem(
                DAILY_MEAL_STORAGE_KEY
            );

            return;

        }


        if (
            !stored ||
            stored.date !==
                getTodayKey()
        ) {

            localStorage.removeItem(
                DAILY_MEAL_STORAGE_KEY
            );

            return;

        }


        const value =
            String(
                stored.thucDonNgayId ||
                ""
            );


        const exists =
            Array.from(
                el.thucDonNgayId.options ||
                []
            )
                .some(
                    option =>
                        option.value ===
                        value
                );


        if (!exists) {

            localStorage.removeItem(
                DAILY_MEAL_STORAGE_KEY
            );

            return;

        }


        setSelectValue(
            el.thucDonNgayId,
            value,
            false
        );

    }

    function getDefaultKhachValue() {

        const khach =
            state.doiTuong.find(
                item => {

                    const label =
                        normalizeSearchText(
                            item?.label
                        );


                    return (
                        label ===
                            "khach" ||
                        label.includes(
                            "khach"
                        )
                    );

                }
            );


        return khach?.value !==
            undefined
            ? String(
                khach.value
            )
            : "";

    }

    function restoreDoiTuongSelection() {

        if (
            !el.doiTuongLayVe
        ) {

            return;

        }


        const storedValue =
            localStorage.getItem(
                TAKER_TYPE_STORAGE_KEY
            );


        let value =
            storedValue;


        const exists =
            state.doiTuong.some(
                item =>
                    String(
                        item.value
                    ) ===
                    String(
                        storedValue
                    )
            );


        if (
            !storedValue ||
            !exists
        ) {

            value =
                getDefaultKhachValue();

        }


        if (!value) {

            return;

        }


        setSelectValue(
            el.doiTuongLayVe,
            value,
            false
        );


        renderPersonMode(
            value
        );


        localStorage.setItem(
            TAKER_TYPE_STORAGE_KEY,
            String(
                value
            )
        );

    }

    async function loadGiaVePreview(
        notifyWhenMissing = false
    ) {
        const thucDonNgayId = toPositiveInt(
            el.thucDonNgayId?.value
        );

        const doiTuongLayVe = toPositiveInt(
            el.doiTuongLayVe?.value
        );

        state.pricePreview = null;

        if (
            !thucDonNgayId ||
            !doiTuongLayVe
        ) {
            renderSummary();
            return null;
        }

        try {
            const response = await request(
                `${API.phieu}/gia-ve` +
                `?thucDonNgayId=${encodeURIComponent(thucDonNgayId)}` +
                `&doiTuongLayVe=${encodeURIComponent(doiTuongLayVe)}`
            );

            state.pricePreview =
                response?.data ||
                null;

            renderSummary();

            return state.pricePreview;
        } catch (error) {
            state.pricePreview = null;
            renderSummary();

            if (notifyWhenMissing) {
                showError(
                    error,
                    "Không tìm thấy giá vé ăn phù hợp với thực đơn ngày và đối tượng đã chọn."
                );
            }

            return null;
        }
    }

    function setSelectValue(
        select,
        value,
        triggerChange = false
    ) {

        if (!select) {

            return;

        }


        const selected =
            value === null ||
            value === undefined
                ? ""
                : String(
                    value
                );


        Array
            .from(
                select.options ||
                []
            )
            .forEach(
                option => {

                    option.selected =
                        option.value ===
                        selected;

                }
            );


        select.value =
            selected;


        const smartSelectRoot =
            select.closest(
                "[data-smart-select]"
            );


        const smartSelect =
            smartSelectRoot
                ?.smartSelect ||
            (
                smartSelectRoot &&
                window.MCS
                    ?.smartSelect
                    ?.initialize?.(
                        smartSelectRoot
                    )
            );


        smartSelect
            ?.refresh?.();


        smartSelect
            ?.setValue?.(
                selected,
                false
            );


        if (
            triggerChange
        ) {

            select.dispatchEvent(
                new Event(
                    "change",
                    {
                        bubbles:
                            true
                    }
                )
            );

        }

    }

    function enhanceQuantityField() {
        const input = el.soLuong;

        if (!input) {
            return;
        }

        if (!input.value) {
            input.value = "1";
        }

        const field = input.closest(
            "[data-form-field]"
        );

        const control = field?.querySelector(
            ".form-field__control"
        );

        if (
            !control ||
            control.dataset.quantityEnhanced === "true"
        ) {
            return;
        }

        control.dataset.quantityEnhanced = "true";
        control.classList.add(
            "lva-quantity-control"
        );

        const minus = document.createElement(
            "button"
        );

        minus.type = "button";
        minus.className = "lva-quantity-btn";
        minus.dataset.qtyMinus = "";
        minus.setAttribute(
            "aria-label",
            "Giảm số lượng"
        );
        minus.textContent = "−";

        const plus = document.createElement(
            "button"
        );

        plus.type = "button";
        plus.className = "lva-quantity-btn";
        plus.dataset.qtyPlus = "";
        plus.setAttribute(
            "aria-label",
            "Tăng số lượng"
        );
        plus.textContent = "+";

        control.insertBefore(
            minus,
            input
        );
        control.appendChild(
            plus
        );
    }

    function normalizeDateForApi(value) {
        if (!value) {
            return null;
        }

        const text = String(value).trim();

        let match = text.match(
            /^(\d{4})-(\d{2})-(\d{2})/
        );

        if (match) {
            return `${match[1]}-${match[2]}-${match[3]}`;
        }

        match = text.match(
            /^(\d{2})\/(\d{2})\/(\d{4})/
        );

        if (match) {
            return `${match[3]}-${match[2]}-${match[1]}`;
        }

        return text;
    }

    function normalizeQuantity() {
        const value = Math.max(
            1,
            Math.floor(Number(el.soLuong?.value || 1))
        );

        el.soLuong.value = String(value);
    }

    function fillSelect(
        select,
        items,
        getValue,
        getLabel
    ) {
        if (!select) {
            return;
        }

        const current = select.value;
        const firstText =
            select.options[0]?.textContent || "Chọn...";

        select.innerHTML = "";

        const empty = document.createElement("option");
        empty.value = "";
        empty.textContent = firstText;
        select.appendChild(empty);

        items.forEach(item => {
            const option = document.createElement("option");
            option.value = String(getValue(item));
            option.textContent = getLabel(item);
            select.appendChild(option);
        });

        if (
            current &&
            Array.from(select.options).some(
                option => option.value === current
            )
        ) {
            select.value = current;
        }

        const smartRoot =
            select.closest("[data-smart-select]") ||
            select.parentElement?.closest?.("[data-smart-select]");

        const smartSelect =
            smartRoot?.smartSelect ||
            (
                smartRoot &&
                window.MCS
                    ?.smartSelect
                    ?.initialize?.(
                        smartRoot
                    )
            );

        smartSelect?.refresh?.();

        if (current) {
            smartSelect?.setValue?.(
                current,
                false
            );
        }
    }

    function normalizeList(data) {
        if (Array.isArray(data)) {
            return data;
        }

        return data?.items ||
            data?.rows ||
            data?.data ||
            data?.danhSach ||
            [];
    }

    function normalizeEnum(data) {
        return normalizeList(data)
            .map(item => {
                if (item && typeof item === "object") {
                    return {
                        ...item,
                        value:
                            item.value ??
                            item.id ??
                            item.ma,
                        label:
                            item.label ??
                            item.name ??
                            item.ten ??
                            String(item.value ?? "")
                    };
                }

                return {
                    value: item,
                    label: String(item)
                };
            })
            .filter(
                item =>
                    item.value !== undefined &&
                    item.value !== null
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

    async function request(
        url,
        method = "GET",
        body = undefined
    ) {
        const options = {
            method
        };

        if (body !== undefined) {
            options.body = JSON.stringify(body);
        }

        return await window.MCS.api.request(
            url,
            options
        );
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function formatDate(value) {
        if (!value) {
            return "-";
        }

        const text = String(value).slice(0, 10);
        const parts = text.split("-");

        if (parts.length !== 3) {
            return text;
        }

        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function formatTime(value) {
        if (!value) {
            return "";
        }

        return String(value).slice(0, 5);
    }

    function formatMoney(value) {
        const number = Number(value);

        if (!Number.isFinite(number)) {
            return "-";
        }

        return `${number.toLocaleString(
            "vi-VN",
            {
                maximumFractionDigits: 5
            }
        )} đ`;
    }

    function nullableText(value) {
        const text = String(value ?? "").trim();
        return text || null;
    }

    function nullableNumber(value) {
        if (
            value === "" ||
            value === null ||
            value === undefined
        ) {
            return null;
        }

        const number = Number(value);
        return Number.isFinite(number) ? number : null;
    }

    function toPositiveInt(value) {
        const number = Number(value);

        return Number.isInteger(number) && number > 0
            ? number
            : null;
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");
    }

    function setLoading(value) {
        root.classList.toggle(
            "is-loading",
            Boolean(value)
        );
    }

    function showError(error, fallback = "Thao tác thất bại.") {
        console.error(error);

        window.MCS?.toast?.error?.(
            error?.message ||
            fallback
        );
    }

    function confirmAction(
        title,
        message,
        confirmLabel,
        type,
        onConfirm
    ) {
        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title,
                message,
                confirmLabel,
                type,
                onConfirm
            });
            return;
        }

        if (window.confirm(message)) {
            onConfirm();
        }
    }

    function showNoPermission() {
        root.innerHTML = `
            <div class="lva-no-permission">
                <h2>Không đủ quyền truy cập</h2>
                <p>Bạn không có quyền xem hoặc thao tác trên chức năng lấy vé ăn.</p>
            </div>
        `;
    }
});
