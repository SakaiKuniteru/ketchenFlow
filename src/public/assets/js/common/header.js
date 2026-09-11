'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        enumsEndpoint: '/api/mcs/v1/enums',
        employeeDetailEndpoint: '/api/mcs/v1/dm-nhan-vien',
        employeeUpdateEndpoint: '/api/mcs/v1/dm-nhan-vien/cap-nhat',
        countryEndpoint: '/api/mcs/v1/dm-quoc-gia/tong-hop?active=true',
        provinceEndpoint: '/api/mcs/v1/dm-tinh-thanh/tong-hop?active=true',
        wardEndpoint: '/api/mcs/v1/dm-xa-phuong/tong-hop?active=true',
        currentUserEndpoint: '/api/mcs/v1/auth/nhan-vien-hien-tai',
        systemNameEndpoint: '/api/mcs/v1/thiet-lap/gia-tri?ma=TEN_HE_THONG',
        systemLogoEndpoint: '/api/mcs/v1/thiet-lap/gia-tri?ma=LOGO_CO_SO_MAC_DINH',
        notificationListEndpoint: '/api/mcs/v1/thong-bao/cua-toi',
        notificationUnreadEndpoint: '/api/mcs/v1/thong-bao/cua-toi/so-chua-doc',
        notificationMarkAllEndpoint: '/api/mcs/v1/thong-bao/cua-toi/da-doc-tat-ca',
        notificationPageUrl: '/thong-bao',
        notificationAllLimit: 20,
        notificationUnreadLimit: 10,
        notificationVisibleRows: 5,
        notificationRefreshInterval: 60000,
        currentUserKey: 'currentUser',
        accessTokenKey: 'accessToken',
        refreshTokenKey: 'refreshToken',
        fallbackUserName: 'Người dùng',
        fallbackAccountName: 'Chưa có tài khoản',
        fallbackSystemName: 'MCS KITCHENFLOW',
        fallbackSystemLogo: '/assets/images/logo/logo.png'
    };

    const elements = {
        systemName: document.querySelector('[data-header-system-name]'),
        systemLogo: document.querySelector('[data-header-system-logo]'),
        userButton: document.querySelector('[data-header-user-button]'),
        userMenu: document.querySelector('[data-header-user-menu]'),
        userArrow: document.querySelector('[data-header-user-arrow]'),
        userNames: document.querySelectorAll('[data-header-user-name]'),
        accountNames: document.querySelectorAll('[data-header-account-name]'),
        userAvatars: document.querySelectorAll('[data-header-user-avatar]'),
        changePasswordButton: document.querySelector('[data-header-change-password]'),
        logoutButton: document.querySelector('[data-header-logout]'),
        notificationButton: document.querySelector('[data-header-notification-button]'),
        notificationMenu: document.querySelector('[data-header-notification-menu]'),
        notificationRoot: document.querySelector('[data-header-notification]'),
        notificationCount: document.querySelector('[data-header-notification-count]'),
        notificationList: document.querySelector('[data-header-notification-list]'),
        notificationContent: document.querySelector('.app-header__notification-content'),
        notificationEmpty: document.querySelector('[data-header-notification-empty]'),
        notificationLoading: document.querySelector('[data-header-notification-loading]'),
        notificationMarkAll: document.querySelector('[data-header-notification-mark-all]'),
        notificationViewAll: document.querySelector('[data-header-notification-view-all]'),
        notificationFilters: document.querySelectorAll('[data-header-notification-filter]'),
        notificationTotal: document.querySelector('[data-header-notification-total]'),
        notificationUnreadTotal: document.querySelector('[data-header-notification-unread-total]'),
        profileOpenButton: document.querySelector('[data-header-profile-open]'),
        profileModal: document.getElementById('employeeProfileModal'),
        profileForm: document.getElementById('employeeProfileForm'),
        profileAvatar: document.querySelector('[data-employee-profile-avatar]'),
        profileAvatarInput: document.querySelector('[data-employee-avatar-input]'),
        profileMessage: document.querySelector('[data-employee-profile-message]'),
        genderSelect: document.getElementById('gioiTinh'),
        countrySelect: document.getElementById('quocGiaId'),
        provinceSelect: document.getElementById('tinhThanhId'),
        wardSelect: document.getElementById('xaPhuongId'),
        featureSearch: document.getElementById('headerFeatureSearch')
    };

    const enumState = {
        gioiTinh: []
    };

    const addressState = {
        countries: [],
        provinces: [],
        wards: []
    };

    const PROFILE_FIELD_LABELS = {
        hoTen: 'Họ tên',
        email: 'Email',
        soDienThoai: 'Số điện thoại',
        ngaySinh: 'Ngày sinh',
        gioiTinh: 'Giới tính',
        quocGiaId: 'Quốc gia',
        tinhThanhId: 'Tỉnh thành',
        xaPhuongId: 'Xã/phường',
        diaChi: 'Địa chỉ',
        anhDaiDien: 'Ảnh đại diện'
    };

    let avatarPreviewUrl = null;
    const notificationState = {
        items: [],
        filter: 'all',
        unreadCount: 0,
        loaded: false,
        loading: false,
        refreshTimer: null,
        countInitialized: false
    };

    function initialize() {
        initializeAddressSmartSelects();
        initializeProfileFieldValidation();
        bindEvents();
        renderStoredCurrentUser();
        initializeNotifications();
        Promise.allSettled([loadCurrentUser(), loadSystemInformation()]).then(() => {
            initializeNotifications();
        });
    }

    function initializeHeaderSearch(currentUser = null) {
        if (!elements.featureSearch || !window.MCS?.searchPicker) {
            return;
        }

        const items = window.MCS.navigation?.getAllowedItems?.(currentUser) || [];

        window.MCS.searchPicker.initialize(elements.featureSearch, {
            items,

            onSelect(item) {
                if (!item?.url) {
                    return;
                }

                window.location.href = item.url;
            }
        });
    }

    async function loadProfileEnums() {
        try {
            const result = await authenticatedRequest(CONFIG.enumsEndpoint, {
                method: 'GET'
            });

            const enums = result?.data || result || {};

            enumState.gioiTinh = Array.isArray(enums.gioiTinh) ? enums.gioiTinh : [];

            setSmartSelectOptions(
                elements.genderSelect,
                enumState.gioiTinh.map((item) => ({
                    value: String(item.value),
                    label: item.label || item.name || ''
                })),
                null
            );
        } catch (error) {
            console.error('Không thể tải enum cho thông tin nhân viên:', error);

            enumState.gioiTinh = [];

            setSmartSelectOptions(elements.genderSelect, [], null);
        }
    }

    async function loadCurrentUser() {
        const accessToken = localStorage.getItem(CONFIG.accessTokenKey);

        if (!accessToken) {
            clearAuthentication();
            redirectToLogin();
            return;
        }

        try {
            let result;

            if (window.MCS?.api?.request) {
                result = await window.MCS.api.request(CONFIG.currentUserEndpoint, {
                    method: 'GET'
                });
            } else {
                const response = await fetch(CONFIG.currentUserEndpoint, {
                    method: 'GET',
                    headers: {
                        Accept: 'application/json',
                        Authorization: `Bearer ${accessToken}`
                    }
                });

                const responseData = await response.json();

                if (!response.ok) {
                    const error = new Error(responseData?.message || 'Không thể lấy thông tin người dùng.');

                    error.status = response.status;
                    throw error;
                }

                result = responseData;
            }

            const currentUser = result?.data;

            console.log('Current user API:', currentUser);

            if (!currentUser) {
                throw new Error('API không trả về thông tin người dùng.');
            }

            saveCurrentUser(currentUser);
            renderCurrentUser(currentUser);
            initializeHeaderSearch(currentUser);
        } catch (error) {
            console.error('Không thể tải thông tin người dùng:', error);

            if (error?.status === 401 || error?.status === 403) {
                clearAuthentication();
                redirectToLogin();
                return;
            }

            const storedUser = getStoredCurrentUser();

            if (storedUser) {
                renderCurrentUser(storedUser);
                initializeHeaderSearch(storedUser);
            }
        }
    }

    async function loadSystemInformation() {
        let systemName = CONFIG.fallbackSystemName;
        let systemLogo = CONFIG.fallbackSystemLogo;

        try {
            const [nameResult, logoResult] = await Promise.allSettled([
                authenticatedRequest(CONFIG.systemNameEndpoint, {
                    method: 'GET'
                }),
                authenticatedRequest(CONFIG.systemLogoEndpoint, {
                    method: 'GET'
                })
            ]);

            if (nameResult.status === 'fulfilled') {
                const value = String(nameResult.value?.data?.giaTri ?? '').trim();

                if (value) {
                    systemName = value;
                }
            }

            if (logoResult.status === 'fulfilled') {
                const value = String(logoResult.value?.data?.giaTri ?? '').trim();

                if (value) {
                    systemLogo = value;
                }
            }
        } catch (error) {
            console.error('Không thể tải thông tin hệ thống:', error);
        }

        if (elements.systemName) {
            elements.systemName.textContent = systemName;
        }

        renderSystemLogo(systemLogo, systemName);
    }

    async function openEmployeeProfile() {
        const currentUser = getStoredCurrentUser();
        const nhanVienId = Number(currentUser?.nhanVienId);

        if (!Number.isInteger(nhanVienId) || nhanVienId <= 0) {
            window.MCS?.toast?.error('Không xác định được nhân viên đang đăng nhập.');
            return;
        }

        try {
            setProfileMessage('');

            if (elements.profileAvatarInput) {
                elements.profileAvatarInput.value = '';
            }

            const result = await authenticatedRequest(`${CONFIG.employeeDetailEndpoint}/${nhanVienId}`, {
                method: 'GET'
            });

            const employee = result?.data;

            if (!employee) {
                throw new Error('API không trả về thông tin nhân viên.');
            }

            elements.profileForm.dataset.employeeId = String(nhanVienId);

            await Promise.all([loadProfileEnums(), loadAddressOptions(employee)]);

            fillEmployeeProfile(employee);

            window.MCS.modal.open(elements.profileModal);
        } catch (error) {
            window.MCS?.toast?.error(error.message || 'Không thể tải thông tin nhân viên.');
        }
    }

    async function updateEmployeeProfile(event) {
        event.preventDefault();

        const formValid = validateEmployeeProfileForm();

        if (!formValid) {
            return;
        }

        const form = elements.profileForm;
        const nhanVienId = Number(form.dataset.employeeId);

        if (!Number.isInteger(nhanVienId) || nhanVienId <= 0) {
            setProfileMessage('ID nhân viên không hợp lệ.');
            return;
        }

        const submitButton = form.querySelector('[data-employee-profile-submit]');

        const formData = new FormData();

        const editableFields = [
            'hoTen',
            'email',
            'soDienThoai',
            'ngaySinh',
            'gioiTinh',
            'diaChi',
            'quocGiaId',
            'tinhThanhId',
            'xaPhuongId'
        ];

        editableFields.forEach((fieldName) => {
            const field = form.elements.namedItem(fieldName);

            if (!field) {
                return;
            }

            formData.append(fieldName, field.value ?? '');
        });

        const avatarInput = form.elements.namedItem('anhDaiDien');

        if (avatarInput?.files?.[0]) {
            formData.append('anhDaiDien', avatarInput.files[0]);
        }

        submitButton.disabled = true;
        submitButton.textContent = 'Đang cập nhật...';

        try {
            const result = await authenticatedRequest(`${CONFIG.employeeUpdateEndpoint}/${nhanVienId}`, {
                method: 'PATCH',
                body: formData
            });

            const updatedEmployee = result?.data;

            if (updatedEmployee) {
                const currentUser = getStoredCurrentUser() || {};

                const updatedCurrentUser = {
                    ...currentUser,
                    hoTen: updatedEmployee.hoTen,
                    email: updatedEmployee.email,
                    soDienThoai: updatedEmployee.soDienThoai,
                    anhDaiDien: updatedEmployee.anhDaiDien,
                    ngaySinh: updatedEmployee.ngaySinh,
                    gioiTinh: updatedEmployee.gioiTinh,
                    diaChi: updatedEmployee.diaChi,
                    quocGiaId: updatedEmployee.quocGiaId,
                    tinhThanhId: updatedEmployee.tinhThanhId,
                    xaPhuongId: updatedEmployee.xaPhuongId
                };

                saveCurrentUser(updatedCurrentUser);
                renderCurrentUser(updatedCurrentUser);
            }

            window.MCS.modal.close(elements.profileModal);

            window.MCS?.toast?.success(result?.message || 'Cập nhật thông tin nhân viên thành công.');
        } catch (error) {
            const handled = applyProfileApiErrors(error);

            if (!handled) {
                setProfileMessage(error.message || 'Không thể cập nhật thông tin nhân viên.');
            }
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Cập nhật';
        }
    }

    async function authenticatedRequest(url, options = {}) {
        if (!window.MCS?.api?.request) {
            throw new Error('MCS API chưa được khởi tạo.');
        }

        return await window.MCS.api.request(url, options);
    }

    function applyProfileApiErrors(error) {
        clearAllProfileErrors();

        const fieldErrors = extractProfileApiFieldErrors(error);
        const entries = Object.entries(fieldErrors);

        if (!entries.length) {
            return false;
        }

        entries.forEach(([fieldName, message]) => {
            setProfileFieldError(fieldName, message);
        });

        focusFirstProfileError();

        return true;
    }

    function extractProfileApiFieldErrors(error) {
        const errors = {};

        const responseErrors = error?.data?.errors || error?.errors || error?.response?.data?.errors;

        if (responseErrors && typeof responseErrors === 'object' && !Array.isArray(responseErrors)) {
            Object.entries(responseErrors).forEach(([fieldName, message]) => {
                const normalizedField = normalizeProfileFieldName(fieldName);

                if (normalizedField && message) {
                    errors[normalizedField] = Array.isArray(message) ? message.join(' ') : String(message);
                }
            });
        }

        const message = String(error?.message || '').trim();

        if (!message) {
            return errors;
        }

        const messageParts = message
            .split(/,|\n|;/)
            .map((item) => item.trim())
            .filter(Boolean);

        messageParts.forEach((part) => {
            const fieldName = detectProfileFieldFromMessage(part);

            if (fieldName && !errors[fieldName]) {
                errors[fieldName] = normalizeProfileErrorMessage(fieldName, part);
            }
        });

        return errors;
    }

    function normalizeProfileFieldName(fieldName) {
        const normalized = String(fieldName || '')
            .trim()
            .toLowerCase()
            .replace(/[_\-\s]/g, '');

        const fieldMap = {
            hoten: 'hoTen',
            email: 'email',
            sodienthoai: 'soDienThoai',
            ngaysinh: 'ngaySinh',
            gioitinh: 'gioiTinh',
            quocgiaid: 'quocGiaId',
            tinhthanhid: 'tinhThanhId',
            xaphuongid: 'xaPhuongId',
            diachi: 'diaChi',
            anhdaidien: 'anhDaiDien'
        };

        return fieldMap[normalized] || null;
    }

    function detectProfileFieldFromMessage(message) {
        const normalized = normalizeSearchText(message);

        if (normalized.includes('ho ten')) {
            return 'hoTen';
        }

        if (normalized.includes('email')) {
            return 'email';
        }

        if (normalized.includes('so dien thoai') || normalized.includes('dien thoai')) {
            return 'soDienThoai';
        }

        if (normalized.includes('ngay sinh')) {
            return 'ngaySinh';
        }

        if (normalized.includes('gioi tinh')) {
            return 'gioiTinh';
        }

        if (normalized.includes('quoc gia')) {
            return 'quocGiaId';
        }

        if (
            normalized.includes('tinh/thanh') ||
            normalized.includes('tinh thanh') ||
            normalized.includes('tinh/thanh pho')
        ) {
            return 'tinhThanhId';
        }

        if (normalized.includes('xa/phuong') || normalized.includes('xa phuong')) {
            return 'xaPhuongId';
        }

        if (normalized.includes('dia chi')) {
            return 'diaChi';
        }

        if (
            normalized.includes('anh dai dien') ||
            normalized.includes('jpg') ||
            normalized.includes('png') ||
            normalized.includes('webp')
        ) {
            return 'anhDaiDien';
        }

        return null;
    }

    function normalizeProfileErrorMessage(fieldName, message) {
        const normalized = normalizeSearchText(message);

        if (fieldName === 'quocGiaId' && normalized.includes('phai la so')) {
            return 'Vui lòng chọn quốc gia hợp lệ.';
        }

        if (fieldName === 'tinhThanhId' && normalized.includes('phai la so')) {
            return 'Vui lòng chọn tỉnh thành hợp lệ.';
        }

        if (fieldName === 'xaPhuongId' && normalized.includes('phai la so')) {
            return 'Vui lòng chọn xã/phường hợp lệ.';
        }

        return message;
    }

    function extractArrayData(result) {
        if (Array.isArray(result?.data)) {
            return result.data;
        }

        if (Array.isArray(result?.data?.items)) {
            return result.data.items;
        }

        if (Array.isArray(result?.data?.rows)) {
            return result.data.rows;
        }

        return [];
    }

    async function loadAddressOptions(employee) {
        const [countryResult, provinceResult, wardResult] = await Promise.all([
            authenticatedRequest(CONFIG.countryEndpoint, {
                method: 'GET'
            }),
            authenticatedRequest(CONFIG.provinceEndpoint, {
                method: 'GET'
            }),
            authenticatedRequest(CONFIG.wardEndpoint, {
                method: 'GET'
            })
        ]);

        addressState.countries = extractArrayData(countryResult).filter((item) => item.active === true);

        addressState.provinces = extractArrayData(provinceResult).filter((item) => item.active === true);

        addressState.wards = extractArrayData(wardResult).filter((item) => item.active === true);

        const currentCountryId = toPositiveInteger(employee?.quocGiaId);
        const currentProvinceId = toPositiveInteger(employee?.tinhThanhId);
        const currentWardId = toPositiveInteger(employee?.xaPhuongId);

        setSmartSelectOptions(
            elements.countrySelect,
            addressState.countries.map((country) => ({
                value: String(country.id),
                label: getCountryLabel(country)
            })),
            currentCountryId
        );

        renderProvinceOptions(currentCountryId, currentProvinceId);

        renderWardOptions(currentProvinceId, currentWardId);
    }

    function initializeProfileFieldValidation() {
        const form = elements.profileForm;

        if (!form) {
            return;
        }

        form.addEventListener('input', (event) => {
            const fieldName = getProfileFieldNameFromTarget(event.target);

            if (fieldName) {
                clearProfileFieldError(fieldName);
            }
        });

        form.addEventListener('change', (event) => {
            const fieldName = getProfileFieldNameFromTarget(event.target);

            if (fieldName) {
                clearProfileFieldError(fieldName);
            }
        });
    }

    function getProfileFieldNameFromTarget(target) {
        if (!(target instanceof Element)) {
            return null;
        }

        if (target.matches('[data-date-input]')) {
            return target.closest('[data-form-field]')?.dataset.formField || null;
        }

        const namedField = target.closest('[name]');

        if (namedField?.name) {
            return namedField.name;
        }

        return target.closest('[data-form-field]')?.dataset.formField || null;
    }

    function getProvinceCountryId(province) {
        return Number(
            province?.quocGiaId ?? province?.quoc_gia_id ?? province?.quocGia?.id ?? province?.quoc_gia?.id ?? 0
        );
    }

    function getWardProvinceId(ward) {
        return Number(ward?.tinhThanhId ?? ward?.tinh_thanh_id ?? ward?.tinhThanh?.id ?? ward?.tinh_thanh?.id ?? 0);
    }

    function getProvinceLabel(province) {
        return (
            province?.tenTinhThanh ||
            province?.ten_tinh_thanh ||
            province?.ten ||
            province?.name ||
            `Tỉnh/thành #${province?.id || ''}`
        );
    }

    function getWardLabel(ward) {
        return ward?.tenXaPhuong || ward?.ten_xa_phuong || ward?.ten || ward?.name || `Xã/phường #${ward?.id || ''}`;
    }

    function getCountryLabel(country) {
        return (
            country?.tenQuocGia ||
            country?.ten_quoc_gia ||
            country?.ten ||
            country?.name ||
            `Quốc gia #${country?.id || ''}`
        );
    }

    function normalizeAssetUrl(url, fallback = '') {
        const value = url || fallback;

        if (!value) {
            return '';
        }

        if (
            value.startsWith('blob:') ||
            value.startsWith('data:') ||
            value.startsWith('http://') ||
            value.startsWith('https://') ||
            value.startsWith('/')
        ) {
            return value;
        }

        return `/${value}`;
    }

    function renderSystemLogo(logo, systemName) {
        if (!elements.systemLogo) {
            return;
        }

        elements.systemLogo.src = normalizeAssetUrl(logo, CONFIG.fallbackSystemLogo);

        elements.systemLogo.alt = `Logo ${systemName}`;

        elements.systemLogo.onerror = () => {
            elements.systemLogo.onerror = null;
            elements.systemLogo.src = CONFIG.fallbackSystemLogo;
        };
    }

    function getStoredCurrentUser() {
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
            console.warn('Không thể đọc currentUser:', error);

            localStorage.removeItem(CONFIG.currentUserKey);

            return null;
        }
    }

    function saveCurrentUser(currentUser) {
        if (window.MCS?.storage?.setCurrentUser) {
            window.MCS.storage.setCurrentUser(currentUser);
            return;
        }

        localStorage.setItem(CONFIG.currentUserKey, JSON.stringify(currentUser));
    }

    function renderStoredCurrentUser() {
        const currentUser = getStoredCurrentUser();

        if (!currentUser) {
            return;
        }

        renderCurrentUser(currentUser);
    }

    function renderCurrentUser(currentUser) {
        const hoTen = currentUser?.hoTen || CONFIG.fallbackUserName;

        const taiKhoan = currentUser?.taiKhoan || currentUser?.tenDangNhap || CONFIG.fallbackAccountName;

        elements.userNames.forEach((element) => {
            element.textContent = hoTen;
        });

        elements.accountNames.forEach((element) => {
            element.textContent = taiKhoan;
        });

        document.querySelectorAll('[data-current-user-name]').forEach((element) => {
            element.textContent = hoTen;
        });

        renderAvatar(currentUser);
    }

    function renderAvatar(currentUser) {
        const imageUrl = currentUser?.anhDaiDien;

        elements.userAvatars.forEach((container) => {
            if (!imageUrl) {
                container.innerHTML = `
                    <span aria-hidden="true">
                        👤
                    </span>
                `;

                return;
            }

            container.innerHTML = '';

            const image = document.createElement('img');

            image.src = normalizeAssetUrl(imageUrl);

            image.alt = `Ảnh đại diện của ${currentUser?.hoTen || CONFIG.fallbackUserName}`;

            image.addEventListener(
                'error',
                () => {
                    container.innerHTML = `
                        <span aria-hidden="true">
                            👤
                        </span>
                    `;
                },
                {
                    once: true
                }
            );

            container.appendChild(image);
        });
    }

    function renderProvinceOptions(countryId, selectedProvinceId = null) {
        const normalizedCountryId = toPositiveInteger(countryId);

        const provinces = normalizedCountryId
            ? addressState.provinces.filter((province) => getProvinceCountryId(province) === normalizedCountryId)
            : [];

        setSmartSelectOptions(
            elements.provinceSelect,
            provinces.map((province) => ({
                value: String(province.id),
                label: getProvinceLabel(province)
            })),
            selectedProvinceId
        );

        setSmartSelectDisabled(
            elements.provinceSelect,
            !normalizedCountryId,
            normalizedCountryId
                ? provinces.length > 0
                    ? 'Tỉnh/Thành phố...'
                    : 'Quốc gia chưa có tỉnh thành'
                : 'Chọn quốc gia trước'
        );
    }

    function renderWardOptions(provinceId, selectedWardId = null) {
        const normalizedProvinceId = toPositiveInteger(provinceId);

        const wards = normalizedProvinceId
            ? addressState.wards.filter((ward) => getWardProvinceId(ward) === normalizedProvinceId)
            : [];

        setSmartSelectOptions(
            elements.wardSelect,
            wards.map((ward) => ({
                value: String(ward.id),
                label: getWardLabel(ward)
            })),
            selectedWardId
        );

        setSmartSelectDisabled(
            elements.wardSelect,
            !normalizedProvinceId,
            normalizedProvinceId
                ? wards.length > 0
                    ? 'Xã/Phường...'
                    : 'Tỉnh thành chưa có xã/phường'
                : 'Chọn tỉnh thành trước'
        );
    }

    function setTextContent(element, value) {
        if (!element) {
            return;
        }

        element.textContent = value ?? '';
    }

    function isUserMenuOpen() {
        return elements.userMenu && elements.userMenu.hidden === false;
    }

    function isNotificationMenuOpen() {
        return elements.notificationMenu && elements.notificationMenu.hidden === false;
    }

    function openUserMenu() {
        if (!elements.userMenu || !elements.userButton) {
            return;
        }

        closeNotificationMenu();

        elements.userMenu.hidden = false;
        elements.userMenu.classList.add('is-open');
        elements.userButton.classList.add('is-open');
        elements.userArrow?.classList.add('is-open');

        elements.userButton.setAttribute('aria-expanded', 'true');
    }

    function closeUserMenu() {
        if (!elements.userMenu || !elements.userButton) {
            return;
        }

        elements.userMenu.hidden = true;
        elements.userMenu.classList.remove('is-open');
        elements.userButton.classList.remove('is-open');
        elements.userArrow?.classList.remove('is-open');

        elements.userButton.setAttribute('aria-expanded', 'false');
    }

    function toggleUserMenu() {
        if (isUserMenuOpen()) {
            closeUserMenu();
        } else {
            openUserMenu();
        }
    }

    function getCurrentPermissionSet(currentUser = getStoredCurrentUser()) {
        const permissions = Array.isArray(currentUser?.dsQuyen) ? currentUser.dsQuyen : [];

        return new Set(
            permissions
                .map((item) => {
                    if (typeof item === 'string') {
                        return item;
                    }

                    return item?.maQuyen || item?.ma_quyen || item?.code || '';
                })
                .map((item) => String(item).trim().toUpperCase())
                .filter(Boolean)
        );
    }

    function hasNotificationPermission(code) {
        return getCurrentPermissionSet().has(String(code).trim().toUpperCase());
    }

    function canViewNotifications() {
        return hasNotificationPermission('Q001016');
    }

    function canMarkAllNotificationsRead() {
        return hasNotificationPermission('Q001017');
    }

    function initializeNotifications() {
        if (!elements.notificationRoot) {
            return;
        }

        const currentUser = getStoredCurrentUser();

        if (!currentUser) {
            return;
        }

        const canView = canViewNotifications();

        elements.notificationRoot.hidden = !canView;

        if (!canView) {
            stopNotificationPolling();
            updateNotificationBadge(0);
            return;
        }

        if (elements.notificationMarkAll) {
            elements.notificationMarkAll.hidden = !canMarkAllNotificationsRead();
        }

        loadNotificationCount();
        startNotificationPolling();
    }

    async function loadNotificationCount() {
        if (!canViewNotifications()) {
            updateNotificationBadge(0);
            return;
        }

        try {
            const result = await authenticatedRequest(CONFIG.notificationUnreadEndpoint, {
                method: 'GET'
            });

            const data = result?.data ?? result ?? {};

            const count = Math.max(0, Number(data?.soChuaDoc ?? 0) || 0);

            const previousCount = notificationState.unreadCount;

            const countChanged = notificationState.countInitialized && count !== previousCount;

            if (count !== previousCount) {
                notificationState.loaded = false;
            }

            notificationState.unreadCount = count;

            notificationState.countInitialized = true;

            updateNotificationBadge(count);

            if (countChanged) {
                window.dispatchEvent(
                    new CustomEvent('mcs:notification-count-changed', {
                        detail: {
                            previousCount,
                            count
                        }
                    })
                );
            }

            if (elements.notificationUnreadTotal) {
                elements.notificationUnreadTotal.textContent = String(count);
            }
        } catch (error) {
            if (error?.status === 403 || error?.statusCode === 403) {
                elements.notificationRoot.hidden = true;

                stopNotificationPolling();

                return;
            }

            console.warn('Không thể lấy số thông báo chưa đọc:', error);
        }
    }

    function updateNotificationBadge(count) {
        if (!elements.notificationCount) {
            return;
        }

        const value = Math.max(0, Number(count) || 0);

        elements.notificationCount.hidden = value <= 0;

        elements.notificationCount.textContent = value > 99 ? '99+' : String(value);

        elements.notificationButton?.classList.toggle('has-unread', value > 0);
    }

    function startNotificationPolling() {
        stopNotificationPolling();

        notificationState.refreshTimer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                loadNotificationCount();
            }
        }, CONFIG.notificationRefreshInterval);
    }

    function stopNotificationPolling() {
        if (notificationState.refreshTimer) {
            clearInterval(notificationState.refreshTimer);

            notificationState.refreshTimer = null;
        }
    }

    async function loadHeaderNotifications(force = false) {
        if (notificationState.loading || !canViewNotifications()) {
            return;
        }

        if (notificationState.loaded && !force) {
            renderHeaderNotifications();
            return;
        }

        notificationState.loading = true;

        setHeaderNotificationLoading(true);

        try {
            const result = await authenticatedRequest(CONFIG.notificationListEndpoint, {
                method: 'GET'
            });

            const data = result?.data ?? result;

            notificationState.items = Array.isArray(data) ? data : [];

            notificationState.loaded = true;

            notificationState.unreadCount = notificationState.items.filter((item) => item?.daDoc !== true).length;

            updateNotificationBadge(notificationState.unreadCount);

            renderHeaderNotifications();
        } catch (error) {
            console.error('Không thể tải thông báo:', error);

            if (elements.notificationEmpty) {
                elements.notificationEmpty.hidden = false;

                elements.notificationEmpty.innerHTML = `
                    <i class="fa-solid fa-triangle-exclamation"></i>

                    <strong>
                        Không thể tải thông báo
                    </strong>

                    <span>
                        Vui lòng thử lại sau.
                    </span>
                `;
            }
        } finally {
            notificationState.loading = false;

            setHeaderNotificationLoading(false);
        }
    }

    function setHeaderNotificationLoading(loading) {
        if (elements.notificationLoading) {
            elements.notificationLoading.hidden = !loading;
        }

        if (loading && elements.notificationEmpty) {
            elements.notificationEmpty.hidden = true;
        }
    }

    function renderHeaderNotifications() {
        if (!elements.notificationList) {
            return;
        }

        const sortedItems = [...notificationState.items].sort(
            (a, b) => getNotificationTime(b) - getNotificationTime(a)
        );

        const allUnreadItems = sortedItems.filter((item) => item?.daDoc !== true);

        const recentAll = sortedItems.slice(0, CONFIG.notificationAllLimit);

        const recentUnread = allUnreadItems.slice(0, CONFIG.notificationUnreadLimit);

        if (elements.notificationTotal) {
            elements.notificationTotal.textContent = String(recentAll.length);
        }

        if (elements.notificationUnreadTotal) {
            elements.notificationUnreadTotal.textContent = String(recentUnread.length);
        }

        notificationState.unreadCount = allUnreadItems.length;

        updateNotificationBadge(allUnreadItems.length);

        const visibleItems = notificationState.filter === 'unread' ? recentUnread : recentAll;

        elements.notificationList.innerHTML = visibleItems.map(renderHeaderNotificationItem).join('');

        if (elements.notificationEmpty) {
            elements.notificationEmpty.hidden = visibleItems.length > 0;
        }

        elements.notificationFilters.forEach((button) => {
            button.classList.toggle('is-active', button.dataset.headerNotificationFilter === notificationState.filter);
        });

        if (elements.notificationMarkAll) {
            elements.notificationMarkAll.hidden = !canMarkAllNotificationsRead();

            elements.notificationMarkAll.disabled = allUnreadItems.length === 0;
        }
    }

    function getNotificationTime(item) {
        const value = item?.thoiGianGui || item?.createdAt || null;

        if (!value) {
            return 0;
        }

        const time = new Date(value).getTime();

        return Number.isFinite(time) ? time : 0;
    }

    function renderHeaderNotificationItem(item) {
        const unread = item?.daDoc !== true;

        const icon = getNotificationIcon(item);

        const content = stripNotificationHtml(item?.noiDung || '');

        return `
            <button
                type="button"
                class="
                    app-header__notification-item
                    ${unread ? 'is-unread' : ''}
                "
                data-header-notification-id="${Number(item?.id) || ''}">

                <span
                    class="
                        app-header__notification-icon
                        ${icon.className}
                    "
                    aria-hidden="true">

                    <i class="${icon.icon}">
                    </i>

                </span>

                <span
                    class="
                        app-header__notification-main
                    ">

                    <strong
                        class="
                            app-header__notification-item-title
                        ">
                        ${escapeNotificationHtml(item?.tieuDe || 'Thông báo')}
                    </strong>

                    <span
                        class="
                            app-header__notification-preview
                        ">
                        ${escapeNotificationHtml(content)}
                    </span>

                </span>

                <span
                    class="
                        app-header__notification-meta
                    ">

                    <span
                        class="
                            app-header__notification-time
                        ">
                        ${escapeNotificationHtml(formatNotificationRelativeTime(item?.thoiGianGui || item?.createdAt))}
                    </span>

                    ${
                        unread
                            ? `
                                <span
                                    class="
                                        app-header__notification-unread-dot
                                    "
                                    aria-label="Chưa đọc">
                                </span>
                            `
                            : ''
                    }

                </span>

            </button>
        `;
    }

    function getNotificationIcon(item) {
        const text = String(item?.maSuKien || item?.loaiThamChieu || '').toUpperCase();

        if (text.includes('VOUCHER')) {
            return {
                icon: 'fa-solid fa-ticket',
                className: 'app-header__notification-icon--success'
            };
        }

        if (text.includes('NHAN_VIEN') || text.includes('TAI_KHOAN') || text.includes('USER')) {
            return {
                icon: 'fa-regular fa-user',
                className: 'app-header__notification-icon--purple'
            };
        }

        if (text.includes('BAO_CAO') || text.includes('REPORT')) {
            return {
                icon: 'fa-solid fa-chart-column',
                className: 'app-header__notification-icon--warning'
            };
        }

        return {
            icon: 'fa-regular fa-bell',
            className: ''
        };
    }

    async function markHeaderNotificationRead(id) {
        const notification = notificationState.items.find((item) => Number(item?.id) === Number(id));

        if (!notification) {
            return null;
        }

        if (notification.daDoc !== true) {
            await authenticatedRequest(`${CONFIG.notificationListEndpoint}/${id}/da-doc`, {
                method: 'PATCH'
            });

            notification.daDoc = true;

            notificationState.unreadCount = Math.max(0, notificationState.unreadCount - 1);

            updateNotificationBadge(notificationState.unreadCount);

            renderHeaderNotifications();

            window.dispatchEvent(new CustomEvent('mcs:notifications-changed'));
        }

        return notification;
    }

    async function markAllHeaderNotificationsRead() {
        if (!canMarkAllNotificationsRead()) {
            return;
        }

        const button = elements.notificationMarkAll;

        if (button) {
            button.disabled = true;
        }

        try {
            await authenticatedRequest(CONFIG.notificationMarkAllEndpoint, {
                method: 'PATCH'
            });

            notificationState.items.forEach((item) => {
                item.daDoc = true;
            });

            notificationState.unreadCount = 0;

            updateNotificationBadge(0);
            renderHeaderNotifications();

            window.dispatchEvent(new CustomEvent('mcs:notifications-changed'));

            window.MCS?.toast?.success?.('Đã đánh dấu tất cả thông báo là đã đọc.');
        } catch (error) {
            window.MCS?.toast?.error?.(error?.message || 'Không thể đánh dấu tất cả thông báo là đã đọc.');
        } finally {
            if (button) {
                button.disabled = false;
            }
        }
    }

    function stripNotificationHtml(value) {
        const element = document.createElement('div');

        element.innerHTML = String(value || '');

        return (element.textContent || element.innerText || '').replace(/\s+/g, ' ').trim();
    }

    function escapeNotificationHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatNotificationRelativeTime(value) {
        if (!value) {
            return '';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const diff = Math.max(0, Date.now() - date.getTime());

        const seconds = Math.floor(diff / 1000);

        if (seconds < 60) {
            return 'Vừa xong';
        }

        const minutes = Math.floor(seconds / 60);

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

    function openNotificationMenu() {
        if (!elements.notificationMenu || !elements.notificationButton || !canViewNotifications()) {
            return;
        }

        closeUserMenu();

        elements.notificationMenu.hidden = false;

        elements.notificationMenu.classList.add('is-open');

        elements.notificationButton.classList.add('is-open');

        elements.notificationButton.setAttribute('aria-expanded', 'true');

        loadHeaderNotifications();
    }

    function closeNotificationMenu() {
        if (!elements.notificationMenu || !elements.notificationButton) {
            return;
        }

        elements.notificationMenu.hidden = true;
        elements.notificationMenu.classList.remove('is-open');
        elements.notificationButton.classList.remove('is-open');
        elements.notificationButton.setAttribute('aria-expanded', 'false');
    }

    function toggleNotificationMenu() {
        if (isNotificationMenuOpen()) {
            closeNotificationMenu();
        } else {
            openNotificationMenu();
        }
    }

    function openChangePasswordModal() {
        closeUserMenu();

        const modal = document.getElementById('changePasswordModal');

        if (!modal) {
            window.MCS?.toast?.error('Không tìm thấy cửa sổ đổi mật khẩu.');
            return;
        }

        window.MCS?.modal?.open(modal);
    }

    async function logout() {
        closeUserMenu();

        const executeLogout = async () => {
            const refreshToken = localStorage.getItem(CONFIG.refreshTokenKey);

            const currentUrl = window.location.pathname + window.location.search + window.location.hash;

            window.MCS.authSync?.saveRedirect(currentUrl);

            try {
                if (refreshToken && window.MCS?.api?.request) {
                    await window.MCS.api.request('/api/mcs/v1/auth/logout', {
                        method: 'POST',
                        allowRefresh: false,
                        body: JSON.stringify({
                            refreshToken
                        })
                    });
                }
            } catch (error) {
                console.info('Không thể thu hồi refresh token:', error.message);
            } finally {
                clearAuthentication();

                window.MCS.authSession?.clearRefreshTimer();
                window.MCS.authSync?.notifyLogout();

                if (window.MCS.authSync?.redirectToLogin) {
                    window.MCS.authSync.redirectToLogin();
                } else {
                    redirectToLogin();
                }
            }
        };

        if (window.MCS?.confirm?.show) {
            window.MCS.confirm.show({
                title: 'Xác nhận đăng xuất',
                message: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
                confirmLabel: 'Đăng xuất',
                type: 'danger',
                onConfirm: executeLogout
            });

            return;
        }

        const confirmed = window.confirm('Bạn có chắc chắn muốn đăng xuất?');

        if (confirmed) {
            await executeLogout();
        }
    }

    function clearAuthentication() {
        localStorage.removeItem(CONFIG.accessTokenKey);
        localStorage.removeItem(CONFIG.refreshTokenKey);
        localStorage.removeItem(CONFIG.currentUserKey);
    }

    function redirectToLogin() {
        if (window.location.pathname === '/auth/login') {
            return;
        }

        const currentUrl = window.location.pathname + window.location.search + window.location.hash;

        sessionStorage.setItem('mcsAuthRedirect', currentUrl);

        window.location.replace('/auth/login?redirect=' + encodeURIComponent(currentUrl));
    }

    function initializeAddressSmartSelects() {
        elements.countrySelect?.addEventListener('change', handleCountryChange);

        elements.provinceSelect?.addEventListener('change', handleProvinceChange);

        elements.wardSelect?.addEventListener('change', handleWardChange);
    }

    function handleCountryChange() {
        const countryId = toPositiveInteger(elements.countrySelect?.value);

        renderProvinceOptions(countryId, null);

        renderWardOptions(null, null);
    }

    function handleProvinceChange() {
        const provinceId = toPositiveInteger(elements.provinceSelect?.value);

        renderWardOptions(provinceId, null);
    }

    function handleWardChange() {
        const wardId = toPositiveInteger(elements.wardSelect?.value);

        console.log('Xã/phường đã chọn:', wardId);
    }

    function bindEvents() {
        elements.userButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleUserMenu();
        });

        elements.notificationButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            toggleNotificationMenu();
        });

        elements.userMenu?.addEventListener('click', (event) => {
            event.stopPropagation();
        });

        elements.notificationMenu?.addEventListener('click', async (event) => {
            event.stopPropagation();

            const filterButton = event.target.closest('[data-header-notification-filter]');

            if (filterButton) {
                notificationState.filter = filterButton.dataset.headerNotificationFilter || 'all';

                renderHeaderNotifications();

                if (elements.notificationContent) {
                    elements.notificationContent.scrollTop = 0;
                }

                return;
            }

            const markAllButton = event.target.closest('[data-header-notification-mark-all]');

            if (markAllButton) {
                await markAllHeaderNotificationsRead();
                return;
            }

            const itemButton = event.target.closest('[data-header-notification-id]');

            if (!itemButton) {
                return;
            }

            const id = Number(itemButton.dataset.headerNotificationId);

            if (!id) {
                return;
            }

            try {
                const notification = await markHeaderNotificationRead(id);

                if (notification?.duongDan) {
                    window.location.href = notification.duongDan;
                }
            } catch (error) {
                window.MCS?.toast?.error?.(error?.message || 'Không thể mở thông báo.');
            }
        });

        elements.changePasswordButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            openChangePasswordModal();
        });

        elements.logoutButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();
            logout();
        });

        elements.profileOpenButton?.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();
            closeUserMenu();
            await openEmployeeProfile();
        });

        elements.profileForm?.addEventListener('submit', updateEmployeeProfile);

        elements.profileAvatarInput?.addEventListener('change', handleAvatarPreview);

        document.addEventListener('click', (event) => {
            const clickedInsideUser =
                elements.userMenu?.contains(event.target) || elements.userButton?.contains(event.target);

            if (!clickedInsideUser) {
                closeUserMenu();
            }

            const clickedInsideNotification =
                elements.notificationMenu?.contains(event.target) ||
                elements.notificationButton?.contains(event.target);

            if (!clickedInsideNotification) {
                closeNotificationMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') {
                return;
            }

            closeUserMenu();
            closeNotificationMenu();
        });

        window.addEventListener('mcs:notifications-changed', () => {
            loadNotificationCount();

            if (isNotificationMenuOpen()) {
                loadHeaderNotifications(true);
            }
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                loadNotificationCount();
            }
        });
    }

    function handleAvatarPreview(event) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            event.target.value = '';

            setProfileFieldError('anhDaiDien', 'Ảnh đại diện chỉ hỗ trợ JPG, PNG hoặc WEBP.');

            return;
        }

        const maxSize = 5 * 1024 * 1024;

        if (file.size > maxSize) {
            event.target.value = '';

            setProfileFieldError('anhDaiDien', 'Ảnh đại diện không được vượt quá 5 MB.');

            return;
        }

        clearProfileFieldError('anhDaiDien');

        if (avatarPreviewUrl) {
            URL.revokeObjectURL(avatarPreviewUrl);
        }

        avatarPreviewUrl = URL.createObjectURL(file);

        renderProfileAvatar(avatarPreviewUrl);
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function fillEmployeeProfile(employee) {
        const form = elements.profileForm;

        if (!form) {
            return;
        }

        setFormValue(form, 'maNhanVien', employee.maNhanVien);

        setFormValue(form, 'hoTen', employee.hoTen);

        setFormValue(form, 'email', employee.email);

        setFormValue(form, 'soDienThoai', employee.soDienThoai);

        setFormValue(form, 'coSo', employee.coSo?.ten || '');

        setFormValue(form, 'phongBan', employee.phongBan?.ten || '');

        setFormValue(form, 'chucVu', employee.chucVu?.ten || '');

        setDatePickerValue(form, 'ngaySinh', employee.ngaySinh);

        const genderNativeSelect = form.elements.namedItem('gioiTinh');

        const genderSmartSelectRoot = genderNativeSelect?.closest('[data-smart-select]');

        if (genderSmartSelectRoot) {
            window.MCS.smartSelect.initialize(genderSmartSelectRoot);

            genderSmartSelectRoot.smartSelect.setValue(String(employee.gioiTinh ?? ''), false);
        }

        setFormValue(form, 'diaChi', employee.diaChi);

        renderProfileAvatar(employee.anhDaiDien);
    }

    function setFormValue(form, name, value) {
        const field = form?.elements?.namedItem(name);

        if (!field) {
            return;
        }

        field.value = value ?? '';
    }

    function setDatePickerValue(form, fieldName, value) {
        const fieldContainer = form.querySelector(`[data-form-field="${fieldName}"]`);

        if (!fieldContainer) {
            return;
        }

        const hiddenInput = fieldContainer.querySelector('[data-date-value]');

        const displayInput = fieldContainer.querySelector('[data-date-input]');

        const databaseValue = normalizeDateValue(value);
        const displayValue = formatDateDisplay(databaseValue);

        if (hiddenInput) {
            hiddenInput.value = databaseValue;
        }

        if (displayInput) {
            displayInput.value = displayValue;
        }

        const datePickerApi = fieldContainer.datePicker || fieldContainer.querySelector('.date-picker')?.datePicker;

        if (datePickerApi?.setValue) {
            datePickerApi.setValue(databaseValue, false);
        }

        hiddenInput?.dispatchEvent(
            new Event('change', {
                bubbles: true
            })
        );
    }

    function setSmartSelectOptions(nativeSelect, options, selectedValue = null) {
        if (!nativeSelect) {
            return;
        }

        const smartSelectRoot = nativeSelect.closest('[data-smart-select]');

        const normalizedOptions = Array.isArray(options) ? options : [];

        const normalizedSelectedValue =
            selectedValue === null || selectedValue === undefined || selectedValue === '' ? '' : String(selectedValue);

        nativeSelect.innerHTML = '';

        const placeholderOption = document.createElement('option');

        placeholderOption.value = '';
        placeholderOption.textContent = '';

        nativeSelect.appendChild(placeholderOption);

        normalizedOptions.forEach((option) => {
            const optionElement = document.createElement('option');

            optionElement.value = String(option.value);
            optionElement.textContent = option.label || '';
            optionElement.disabled = option.disabled === true;
            optionElement.selected = String(option.value) === normalizedSelectedValue;

            nativeSelect.appendChild(optionElement);
        });

        nativeSelect.value = normalizedSelectedValue;

        if (!smartSelectRoot) {
            return;
        }

        window.MCS?.smartSelect?.initialize(smartSelectRoot);

        if (typeof smartSelectRoot.smartSelect?.setOptions === 'function') {
            smartSelectRoot.smartSelect.setOptions(normalizedOptions, false);
        }

        if (typeof smartSelectRoot.smartSelect?.setValue === 'function') {
            smartSelectRoot.smartSelect.setValue(normalizedSelectedValue, false);
        } else {
            nativeSelect.dispatchEvent(
                new Event('change', {
                    bubbles: true
                })
            );
        }
    }

    function setSmartSelectDisabled(nativeSelect, disabled, placeholder) {
        if (!nativeSelect) {
            return;
        }

        const smartSelectRoot = nativeSelect.closest('[data-smart-select]');

        if (!smartSelectRoot) {
            return;
        }

        const searchInput = smartSelectRoot.querySelector('[data-smart-select-search]');

        const toggleButton = smartSelectRoot.querySelector('[data-smart-select-toggle]');

        const isDisabled = Boolean(disabled);

        nativeSelect.disabled = isDisabled;

        if (searchInput) {
            searchInput.disabled = isDisabled;
            searchInput.placeholder = '';
        }

        if (toggleButton) {
            toggleButton.disabled = isDisabled;
        }

        smartSelectRoot.classList.toggle('is-disabled', isDisabled);

        if (placeholder) {
            smartSelectRoot.dataset.selectPlaceholder = placeholder;
        }

        const api = smartSelectRoot.smartSelect;

        if (typeof api?.setDisabled === 'function') {
            api.setDisabled(isDisabled);
        }

        if (typeof api?.refresh === 'function') {
            api.refresh();
        }
    }

    function toPositiveInteger(value) {
        const number = Number(value);

        if (!Number.isInteger(number) || number <= 0) {
            return null;
        }

        return number;
    }

    function normalizeDateValue(value) {
        if (!value) {
            return '';
        }

        const rawValue = String(value).trim();

        const databaseMatch = rawValue.match(/^(\d{4})-(\d{2})-(\d{2})/);

        if (databaseMatch) {
            return [databaseMatch[1], databaseMatch[2], databaseMatch[3]].join('-');
        }

        const displayMatch = rawValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

        if (displayMatch) {
            return [displayMatch[3], displayMatch[2], displayMatch[1]].join('-');
        }

        const date = new Date(rawValue);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const year = date.getFullYear();

        const month = String(date.getMonth() + 1).padStart(2, '0');

        const day = String(date.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    function formatDateDisplay(databaseValue) {
        if (!databaseValue) {
            return '';
        }

        const match = String(databaseValue).match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (!match) {
            return '';
        }

        return [match[3], match[2], match[1]].join('/');
    }

    function renderProfileAvatar(imageUrl) {
        const container = elements.profileAvatar;

        if (!container) {
            return;
        }

        if (!imageUrl) {
            container.innerHTML = '<span aria-hidden="true">👤</span>';

            return;
        }

        container.innerHTML = '';

        const image = document.createElement('img');

        image.src = normalizeAssetUrl(imageUrl);
        image.alt = 'Ảnh đại diện nhân viên';

        image.addEventListener(
            'error',
            () => {
                container.innerHTML = '<span aria-hidden="true">👤</span>';
            },
            {
                once: true
            }
        );

        container.appendChild(image);
    }

    function setProfileFieldError(fieldName, message) {
        const form = elements.profileForm;

        if (!form) {
            return;
        }

        const fieldContainer = form.querySelector(`[data-form-field="${fieldName}"]`);

        const errorElement = form.querySelector(`[data-field-error="${fieldName}"]`);

        const field = form.elements.namedItem(fieldName);

        fieldContainer?.classList.add('is-invalid');

        if (field) {
            field.setAttribute('aria-invalid', 'true');

            field.setAttribute('aria-describedby', `${fieldName}Error`);
        }

        const dateInput = fieldContainer?.querySelector('[data-date-input]');

        if (dateInput) {
            dateInput.setAttribute('aria-invalid', 'true');

            dateInput.setAttribute('aria-describedby', `${fieldName}Error`);
        }

        const smartSelect = fieldContainer?.querySelector('[data-smart-select]');

        const smartSelectControl = smartSelect?.querySelector('[data-smart-select-control]');

        if (smartSelect) {
            smartSelect.classList.add('is-invalid');
        }

        if (smartSelectControl) {
            smartSelectControl.setAttribute('aria-invalid', 'true');

            smartSelectControl.setAttribute('aria-describedby', `${fieldName}Error`);
        }

        if (errorElement) {
            errorElement.id = `${fieldName}Error`;
            errorElement.textContent = message;
            errorElement.hidden = false;
        }
    }

    function clearProfileFieldError(fieldName) {
        const form = elements.profileForm;

        if (!form) {
            return;
        }

        const fieldContainer = form.querySelector(`[data-form-field="${fieldName}"]`);

        const errorElement = form.querySelector(`[data-field-error="${fieldName}"]`);

        const field = form.elements.namedItem(fieldName);

        fieldContainer?.classList.remove('is-invalid');

        field?.removeAttribute('aria-invalid');
        field?.removeAttribute('aria-describedby');

        const dateInput = fieldContainer?.querySelector('[data-date-input]');

        dateInput?.removeAttribute('aria-invalid');
        dateInput?.removeAttribute('aria-describedby');

        const smartSelect = fieldContainer?.querySelector('[data-smart-select]');

        const smartSelectControl = smartSelect?.querySelector('[data-smart-select-control]');

        smartSelect?.classList.remove('is-invalid');

        smartSelectControl?.removeAttribute('aria-invalid');

        smartSelectControl?.removeAttribute('aria-describedby');

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.hidden = true;
        }
    }

    function clearAllProfileErrors() {
        Object.keys(PROFILE_FIELD_LABELS).forEach((fieldName) => {
            clearProfileFieldError(fieldName);
        });

        setProfileMessage('');
    }

    function validateEmployeeProfileForm() {
        const form = elements.profileForm;

        if (!form) {
            return false;
        }

        clearAllProfileErrors();

        let valid = true;

        const hoTen = String(form.elements.namedItem('hoTen')?.value || '').trim();

        const email = String(form.elements.namedItem('email')?.value || '').trim();

        const soDienThoai = String(form.elements.namedItem('soDienThoai')?.value || '').trim();

        const ngaySinhField = form.querySelector('[data-form-field="ngaySinh"]');

        const ngaySinh = String(form.elements.namedItem('ngaySinh')?.value || '').trim();

        const ngaySinhDisplay = String(ngaySinhField?.querySelector('[data-date-input]')?.value || '').trim();

        const gioiTinh = String(form.elements.namedItem('gioiTinh')?.value || '').trim();

        const quocGiaId = String(form.elements.namedItem('quocGiaId')?.value || '').trim();

        const tinhThanhId = String(form.elements.namedItem('tinhThanhId')?.value || '').trim();

        const xaPhuongId = String(form.elements.namedItem('xaPhuongId')?.value || '').trim();

        if (!hoTen) {
            setProfileFieldError('hoTen', 'Vui lòng nhập họ tên.');

            valid = false;
        } else if (hoTen.length < 2) {
            setProfileFieldError('hoTen', 'Họ tên phải có ít nhất 2 ký tự.');

            valid = false;
        } else if (hoTen.length > 255) {
            setProfileFieldError('hoTen', 'Họ tên không được vượt quá 255 ký tự.');

            valid = false;
        }

        if (!email) {
            setProfileFieldError('email', 'Vui lòng nhập email.');

            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setProfileFieldError('email', 'Email không đúng định dạng.');

            valid = false;
        }

        if (!soDienThoai) {
            setProfileFieldError('soDienThoai', 'Vui lòng nhập số điện thoại.');

            valid = false;
        } else if (!/^(0|\+84)[0-9]{8,10}$/.test(soDienThoai.replace(/[\s.-]/g, ''))) {
            setProfileFieldError('soDienThoai', 'Số điện thoại không đúng định dạng.');

            valid = false;
        }

        if (!ngaySinh && !ngaySinhDisplay) {
            setProfileFieldError('ngaySinh', 'Vui lòng chọn ngày sinh.');

            valid = false;
        } else if (!ngaySinh || !isValidDatabaseDate(ngaySinh)) {
            setProfileFieldError('ngaySinh', 'Ngày sinh không hợp lệ.');

            valid = false;
        }

        if (!gioiTinh) {
            setProfileFieldError('gioiTinh', 'Vui lòng chọn giới tính.');

            valid = false;
        } else if (!enumState.gioiTinh.some((item) => String(item.value) === gioiTinh)) {
            setProfileFieldError('gioiTinh', 'Giới tính không hợp lệ.');

            valid = false;
        }

        if (!quocGiaId) {
            setProfileFieldError('quocGiaId', 'Vui lòng chọn quốc gia.');

            valid = false;
        } else if (!toPositiveInteger(quocGiaId)) {
            setProfileFieldError('quocGiaId', 'Quốc gia không hợp lệ.');

            valid = false;
        }

        if (!tinhThanhId) {
            setProfileFieldError('tinhThanhId', 'Vui lòng chọn tỉnh thành.');

            valid = false;
        } else if (!toPositiveInteger(tinhThanhId)) {
            setProfileFieldError('tinhThanhId', 'Tỉnh thành không hợp lệ.');

            valid = false;
        }

        if (!xaPhuongId) {
            setProfileFieldError('xaPhuongId', 'Vui lòng chọn xã/phường.');

            valid = false;
        } else if (!toPositiveInteger(xaPhuongId)) {
            setProfileFieldError('xaPhuongId', 'Xã/phường không hợp lệ.');

            valid = false;
        }

        if (!valid) {
            focusFirstProfileError();
        }

        return valid;
    }

    function isValidDatabaseDate(value) {
        const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);

        if (!match) {
            return false;
        }

        const year = Number(match[1]);
        const month = Number(match[2]);
        const day = Number(match[3]);

        const date = new Date(year, month - 1, day);

        return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    }

    function focusFirstProfileError() {
        const form = elements.profileForm;

        const invalidContainer = form?.querySelector('.form-field.is-invalid');

        if (!invalidContainer) {
            return;
        }

        const focusable = invalidContainer.querySelector(
            [
                '[data-date-input]',
                '[data-smart-select-search]',
                "input:not([type='hidden']):not([disabled])",
                'select:not([disabled])',
                'textarea:not([disabled])',
                'button:not([disabled])'
            ].join(',')
        );

        focusable?.focus({
            preventScroll: false
        });

        invalidContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }

    function setProfileMessage(message = '', type = 'error') {
        const element = elements.profileMessage;

        if (!element) {
            return;
        }

        if (!message) {
            element.hidden = true;
            element.textContent = '';

            element.classList.remove('is-success', 'is-error');

            return;
        }

        element.hidden = false;
        element.textContent = message;

        element.classList.remove('is-success', 'is-error');

        element.classList.add(type === 'success' ? 'is-success' : 'is-error');
    }

    initialize();
});
