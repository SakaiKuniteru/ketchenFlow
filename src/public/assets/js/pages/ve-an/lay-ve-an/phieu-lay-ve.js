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
        DAILY_MEAL_STORAGE_KEY,
        TAKER_TYPE_STORAGE_KEY,
        state,
        el
    } = app;

    const closeDiscountModal = (...args) => app.closeDiscountModal(...args);
    const fillSelect = (...args) => app.fillSelect(...args);
    const markPageAsCreate = (...args) => app.markPageAsCreate(...args);
    const markPageAsExisting = (...args) => app.markPageAsExisting(...args);
    const closeRefundModal = (...args) => app.closeRefundModal(...args);
    const confirmAction = (...args) => app.confirmAction(...args);
    const escapeHtml = (...args) => app.escapeHtml(...args);
    const formatDate = (...args) => app.formatDate(...args);
    const formatMoney = (...args) => app.formatMoney(...args);
    const formatTime = (...args) => app.formatTime(...args);
    const getOrderedDoiTuong = (...args) => app.getOrderedDoiTuong(...args);
    const normalizeSearchText = (...args) => app.normalizeSearchText(...args);
    const nullableNumber = (...args) => app.nullableNumber(...args);
    const nullableText = (...args) => app.nullableText(...args);
    const renderDiscounts = (...args) => app.renderDiscounts(...args);
    const renderQrPanel = (...args) => app.renderQrPanel(...args);
    const renderStateActions = (...args) => app.renderStateActions(...args);
    const request = (...args) => app.request(...args);
    const resetPaymentSelection = (...args) => app.resetPaymentSelection(...args);
    const setLoading = (...args) => app.setLoading(...args);
    const setSelectValue = (...args) => app.setSelectValue(...args);
    const showError = (...args) => app.showError(...args);
    const stopQrPolling = (...args) => app.stopQrPolling(...args);
    const toPositiveInt = (...args) => app.toPositiveInt(...args);

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

        closeRefundModal();

        closeCancelPhieuModal();


        if (
            el.paymentInfo
        ) {

            el.paymentInfo.hidden =
                true;

        }


        if (
            el.qrPanel
        ) {

            el.qrPanel.hidden =
                true;

        }


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

        state.selectedPaymentMethod =
            null;
        
        root.dataset.phieuId =
            "";

        markPageAsCreate();

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

    async function loadExistingPhieu(
        id
    ) {
        const phieuId =
            toPositiveInt(
                id
            );

        if (
            !phieuId
        ) {
            throw new Error(
                "ID phiếu lấy vé không hợp lệ."
            );
        }

        const response =
            await request(
                `${API.phieu}/${phieuId}`
            );

        const phieu =
            response?.data;

        if (
            !phieu ||
            !phieu.id
        ) {
            throw new Error(
                "Không tìm thấy phiếu lấy vé."
            );
        }

        state.phieu =
            phieu;

        state.pricePreview =
            Number.isFinite(
                Number(
                    phieu.donGia
                )
            )
                ? {
                    donGia:
                        Number(
                            phieu.donGia
                        )
                }
                : null;

        root.dataset.phieuId =
            String(
                phieu.id
            );

        ensureExistingMeal(
            phieu
        );

        ensureExistingEmployee(
            phieu
        );

        hydratePhieuForm(
            phieu
        );

        markPageAsExisting(
            phieu.id
        );

        return phieu;
    }

    function ensureExistingMeal(
        phieu
    ) {
        const id =
            toPositiveInt(
                phieu?.thucDonNgayId
            );

        if (
            !id
        ) {
            return;
        }

        const exists =
            state.thucDonNgay
                .some(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            id
                        )
                );

        if (
            !exists
        ) {
            state.thucDonNgay.unshift({
                id,

                ngay:
                    phieu.ngay ||
                    phieu.ngaySuDung ||
                    null,

                thucDonId:
                    phieu.thucDonId ||
                    null,

                tenThucDon:
                    phieu.tenThucDon ||
                    phieu.maThucDon ||
                    "Thực đơn",

                tenNhaAn:
                    phieu.tenNhaAn ||
                    phieu.maNhaAn ||
                    "Nhà ăn",

                tenCaAn:
                    phieu.tenCaAn ||
                    phieu.maCaAn ||
                    "Ca ăn",

                thoiGianBatDau:
                    phieu.thoiGianBatDau ||
                    null,

                thoiGianKetThuc:
                    phieu.thoiGianKetThuc ||
                    null
            });
        }

        fillSelect(
            el.thucDonNgayId,
            state.thucDonNgay,
            item =>
                item.id,
            item => {
                const date =
                    formatDate(
                        item.ngay
                    );

                const ca =
                    item.tenCaAn ||
                    item.maCaAn ||
                    "Ca ăn";

                const nhaAn =
                    item.tenNhaAn ||
                    "Nhà ăn";

                return `${date} - ${ca} - ${nhaAn}`;
            }
        );
    }

    function ensureExistingEmployee(
        phieu
    ) {
        const id =
            toPositiveInt(
                phieu?.nhanVienId
            );

        if (
            !id
        ) {
            return;
        }

        const exists =
            state.employees
                .some(
                    item =>
                        Number(
                            item.id
                        ) ===
                        Number(
                            id
                        )
                );

        if (
            !exists
        ) {
            state.employees.unshift({
                id,

                maNhanVien:
                    phieu.maNhanVien ||
                    "",

                hoTen:
                    phieu.tenNhanVien ||
                    phieu.hoTenNhanVien ||
                    phieu.hoTenNguoiLayVe ||
                    "",

                tenPhongBan:
                    phieu.tenPhongBan ||
                    "",

                tenCoSo:
                    phieu.tenCoSo ||
                    "",

                soDienThoai:
                    phieu.soDienThoai ||
                    phieu.soDienThoaiNguoiLayVe ||
                    ""
            });
        }

        fillSelect(
            el.nhanVienId,
            state.employees,
            item =>
                item.id,
            item =>
                [
                    item.maNhanVien ||
                        item.ma_nhan_vien,

                    item.hoTen ||
                        item.tenNhanVien ||
                        item.ho_ten
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " - "
                    )
        );
    }

    function hydratePhieuForm(
        phieu
    ) {
        setSelectValue(
            el.thucDonNgayId,
            phieu.thucDonNgayId ??
                "",
            false
        );

        setSelectValue(
            el.doiTuongLayVe,
            phieu.doiTuongLayVe ??
                "",
            false
        );

        if (
            el.soLuong
        ) {
            el.soLuong.value =
                String(
                    phieu.soLuong ||
                    1
                );
        }

        const isEmployee =
            isNhanVienDoiTuong(
                phieu.doiTuongLayVe
            );

        if (
            isEmployee
        ) {
            setSelectValue(
                el.nhanVienId,
                phieu.nhanVienId ??
                    "",
                false
            );

            if (
                el.noteEmployee
            ) {
                el.noteEmployee.value =
                    phieu.ghiChu ||
                    "";
            }
        } else {
            if (
                el.hoTen
            ) {
                el.hoTen.value =
                    phieu.hoTenNguoiLayVe ||
                    "";
            }

            if (
                el.phone
            ) {
                el.phone.value =
                    phieu.soDienThoaiNguoiLayVe ||
                    "";
            }

            if (
                el.address
            ) {
                el.address.value =
                    phieu.diaChiNguoiLayVe ||
                    "";
            }

            if (
                el.unit
            ) {
                el.unit.value =
                    phieu.donViNguoiLayVe ||
                    "";
            }

            if (
                el.noteGuest
            ) {
                el.noteGuest.value =
                    phieu.ghiChu ||
                    "";
            }

            setDateFieldValue(
                "ngaySinhNguoiLayVe",
                phieu.ngaySinhNguoiLayVe
            );

            setSelectValue(
                el.gioiTinh,
                phieu.gioiTinhNguoiLayVe ??
                    "",
                false
            );

            if (
                el.permanentGuest
            ) {
                el.permanentGuest.checked =
                    phieu.khachLauDai ===
                        true ||
                    phieu.khachLauDai ===
                        1 ||
                    String(
                        phieu.khachLauDai
                    ).toLowerCase() ===
                        "true";
            }
        }

        renderMeal();

        renderPersonMode(
            phieu.doiTuongLayVe
        );

        renderEmployee();
    }

    function setDateFieldValue(
        id,
        value
    ) {
        const input =
            document.getElementById(
                id
            );

        if (
            !input
        ) {
            return;
        }

        const normalized =
            normalizeDateForApi(
                value
            ) ||
            "";

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

        const datePicker =
            datePickerRoot?.datePicker ||
            field?.datePicker;

        if (
            normalized &&
            datePicker
                ?.setValue
        ) {
            const parts =
                normalized
                    .split("-")
                    .map(
                        Number
                    );

            if (
                parts.length ===
                    3 &&
                parts.every(
                    Number.isFinite
                )
            ) {
                const date =
                    new Date(
                        parts[0],
                        parts[1] - 1,
                        parts[2]
                    );

                try {
                    datePicker.setValue(
                        date,
                        false
                    );
                } catch (
                    error
                ) {
                    console.warn(
                        "Không đồng bộ được date picker ngày sinh.",
                        error
                    );
                }
            }
        }

        if (
            hiddenInput
        ) {
            hiddenInput.value =
                normalized;
        }

        if (
            displayInput
        ) {
            displayInput.value =
                normalized
                    ? formatDate(
                        normalized
                    )
                    : "";
        }
    }

    async function saveDraft() {
        const payload =
            buildPhieuPayload();

        validatePhieuPayload(
            payload
        );

        const canCreate =
            permission.canCreatePhieu(
                state.permissions
            );

        const canUpdate =
            permission.canUpdatePhieu(
                state.permissions
            );

        const isCreating =
            !state.phieu;

        let response;

        if (
            isCreating
        ) {
            if (
                !canCreate
            ) {
                throw new Error(
                    "Bạn không có quyền tạo phiếu lấy vé ăn."
                );
            }

            response =
                await request(
                    `${API.phieu}/them-moi`,
                    "POST",
                    payload
                );
        } else {
            if (
                !canUpdate
            ) {
                return state.phieu;
            }

            response =
                await request(
                    `${API.phieu}/cap-nhat/${state.phieu.id}`,
                    "PATCH",
                    payload
                );
        }

        state.phieu =
            response?.data ||
            null;

        state.pricePreview =
            state.phieu
                ? {
                    donGia:
                        state.phieu.donGia
                }
                : state.pricePreview;

        root.dataset.phieuId =
            state.phieu?.id ||
            "";

        if (
            isCreating &&
            state.phieu?.id
        ) {
            markPageAsExisting(
                state.phieu.id
            );
        }

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

    async function reloadPhieu() {
        if (!state.phieu?.id) {
            return;
        }

        const response = await request(
            `${API.phieu}/${state.phieu.id}`
        );

        state.phieu = response?.data || state.phieu;
    }

    async function openCancelPhieuModal() {

        if (
            !permission.canCancelPhieu(
                state.permissions
            )
        ) {
            return;
        }


        /*
        * Chưa có record phiếu trong DB:
        * lưu draft trước khi thực hiện hủy.
        */
        if (
            !state.phieu?.id
        ) {

            try {

                setLoading(
                    true
                );


                await saveDraft();

            } catch (
                error
            ) {

                showError(
                    error
                );

                return;

            } finally {

                setLoading(
                    false
                );

            }

        }


        if (
            el.cancelPhieuReason
        ) {

            el.cancelPhieuReason.value =
                "";

        }


        if (
            el.cancelPhieuModal
        ) {

            el.cancelPhieuModal.hidden =
                false;

        }

    }

    function closeCancelPhieuModal() {

        if (
            el.cancelPhieuModal
        ) {

            el.cancelPhieuModal.hidden =
                true;

        }

    }

    function submitCancelPhieu() {

        if (
            !state.phieu?.id
        ) {
            return;
        }


        const reason =
            String(
                el.cancelPhieuReason
                    ?.value ||
                ""
            )
                .trim();


        if (
            !reason
        ) {

            showError(
                new Error(
                    "Vui lòng nhập lý do hủy phiếu."
                )
            );

            return;

        }


        const execute =
            async () => {

                try {

                    setLoading(
                        true
                    );


                    const response =
                        await request(
                            `${API.phieu}/huy/${state.phieu.id}`,
                            "PATCH",
                            {
                                lyDoHuy:
                                    reason
                            }
                        );

                    closeCancelPhieuModal();


                    await resetForNewTicket();


                    window.MCS
                        ?.toast
                        ?.success
                        ?.(
                            response?.message ||
                            "Hủy phiếu thành công."
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


        /*
        * XÁC NHẬN nằm SAU khi đã nhập lý do.
        */
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
            !permission.canPrint(
                state.permissions
            )
        ) {
            return;
        }

        let popup =
            null;

        let objectUrl =
            null;

        try {
            popup =
                window.open(
                    "",
                    "_blank",
                    "width=1000,height=800"
                );

            if (!popup) {
                throw new Error(
                    "Trình duyệt đang chặn cửa sổ in."
                );
            }

            popup.document.write(`
                <!doctype html>
                <html lang="vi">
                <head>
                    <meta charset="utf-8">
                    <title>Đang tạo báo cáo...</title>
                </head>
                <body>
                    Đang tạo báo cáo...
                </body>
                </html>
            `);

            popup.document.close();

            setLoading(
                true
            );

            if (
                !window.MCS
                    ?.api
                    ?.requestFile
            ) {
                throw new Error(
                    "Chức năng tải file chưa được khởi tạo."
                );
            }

            const file =
                await window.MCS
                    .api
                    .requestFile(
                        `${API.phieu}/in-ve/${state.phieu.id}`,
                        {
                            method:
                                "GET"
                        }
                    );

            if (
                !file?.blob ||
                !String(
                    file.contentType || ""
                ).includes(
                    "application/pdf"
                )
            ) {
                throw new Error(
                    "API in không trả về file PDF hợp lệ."
                );
            }

            objectUrl =
                URL.createObjectURL(
                    file.blob
                );

            popup.location.replace(
                objectUrl
            );

            window.setTimeout(
                () => {
                    try {
                        popup.focus();
                        popup.print();
                    } catch (
                        error
                    ) {
                        console.warn(
                            "Không thể tự mở hộp thoại in:",
                            error
                        );
                    }
                },
                1000
            );

            window.setTimeout(
                () => {
                    if (
                        objectUrl
                    ) {
                        URL.revokeObjectURL(
                            objectUrl
                        );

                        objectUrl =
                            null;
                    }
                },
                120000
            );
        } catch (
            error
        ) {
            if (
                popup &&
                !popup.closed
            ) {
                popup.close();
            }

            if (
                objectUrl
            ) {
                URL.revokeObjectURL(
                    objectUrl
                );
            }

            showError(
                error,
                "Không thể in vé ăn."
            );
        } finally {
            setLoading(
                false
            );
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

    function getDefaultDoiTuongValue() {

        const first =
            getOrderedDoiTuong()[0];


        return first?.value !==
            undefined
            ? String(
                first.value
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


        /*
        * Nếu trước đây user đã chọn thì ưu tiên
        * lựa chọn đã nhớ.
        *
        * Chỉ khi chưa có lựa chọn cũ mới dùng
        * phần tử đầu theo thiết lập.
        */
        if (
            !storedValue ||
            !exists
        ) {

            value =
                getDefaultDoiTuongValue();

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

    Object.assign(
        app,
        {
            handleLayVeStorageChange,
            bindDoiTuongLayVeEvents,
            syncDoiTuongFromSmartSelect,
            rememberDoiTuongSelection,
            handleDoiTuongLayVeChange,
            handleNewTicket,
            resetForNewTicket,
            clearEmployeeInfo,
            clearTextField,
            clearDateField,
            renderMeal,
            getDoiTuongByValue,
            isNhanVienDoiTuong,
            renderPersonMode,
            renderEmployee,
            renderSummary,
            loadExistingPhieu,
            saveDraft,
            buildPhieuPayload,
            validatePhieuPayload,
            reloadPhieu,
            openCancelPhieuModal,
            closeCancelPhieuModal,
            submitCancelPhieu,
            printTicket,
            setPricingFieldsDisabled,
            canChangePricingFields,
            restoreSelectedMeal,
            restoreDoiTuong,
            restoreEmployee,
            markDraftDirty,
            getSelectedMeal,
            getSelectedEmployee,
            getTodayKey,
            rememberDailyMealSelection,
            restoreDailyMealSelection,
            getDefaultDoiTuongValue,
            restoreDoiTuongSelection,
            loadGiaVePreview,
            enhanceQuantityField,
            normalizeDateForApi,
            normalizeQuantity
        }
    );
})();
