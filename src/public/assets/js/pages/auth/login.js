'use strict';

document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        loginEndpoint: '/api/mcs/v1/auth/login',
        systemNameEndpoint: '/api/mcs/v1/thiet-lap/gia-tri-public?ma=TEN_HE_THONG',
        systemLogoEndpoint: '/api/mcs/v1/thiet-lap/gia-tri-public?ma=LOGO_CO_SO_MAC_DINH',
        defaultSystemName: 'MCS KITCHENFLOW',
        defaultSystemLogo: '/assets/images/logo/logo.png',
        homePath: '/',
        rememberedAccountKey: 'mcsKitchenFlowRememberedAccount',
        accessTokenKey: 'accessToken',
        refreshTokenKey: 'refreshToken',
        userKey: 'currentUser',
        firstLoginRequiredKey: 'mcsKitchenFlowFirstLoginRequired',
        lastActivityKey: 'mcsLastActivityAt'
    };

    const elements = {
        systemNames: document.querySelectorAll('[data-system-name]'),
        systemLogos: document.querySelectorAll('[data-system-logo]'),
        loginForm: document.getElementById('loginForm'),
        taiKhoan: document.getElementById('taiKhoan'),
        matKhau: document.getElementById('matKhau'),
        rememberAccount: document.getElementById('rememberAccount'),
        loginSubmitButton: document.getElementById('loginSubmitButton'),
        loginSubmitLabel: document.querySelector('[data-login-submit-label]'),
        loginSpinner: document.querySelector('[data-login-spinner]'),
        loginMessage: document.getElementById('loginMessage'),
        loginMessageText: document.querySelector('[data-login-message]'),
        togglePasswordButton: document.getElementById('togglePasswordButton'),
        passwordShowIcon: document.querySelector('[data-password-show-icon]'),
        passwordHideIcon: document.querySelector('[data-password-hide-icon]'),
        changePasswordModal: document.getElementById('changePasswordModal'),
        changePasswordForm: document.getElementById('changePasswordForm')
    };

    let isSubmittingLogin = false;
    let mustChangePassword = false;

    function getStoredUser() {
        const raw = localStorage.getItem(CONFIG.userKey);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return null;
        }
    }

    function isFirstLoginRequired() {
        const required = localStorage.getItem(CONFIG.firstLoginRequiredKey);

        if (required === 'true') {
            return true;
        }

        const user = getStoredUser();

        return user?.firstLogin === true;
    }

    function setFirstLoginRequired(required) {
        const value = required === true;

        if (value) {
            localStorage.setItem(CONFIG.firstLoginRequiredKey, 'true');
        } else {
            localStorage.removeItem(CONFIG.firstLoginRequiredKey);
        }

        const user = getStoredUser();

        if (!user) {
            return;
        }

        user.firstLogin = value;

        localStorage.setItem(CONFIG.userKey, JSON.stringify(user));
    }

    function initialize() {
        bindAuthenticationSync();
        bindFirstLoginEvents();
        loadSystemBranding();
        restoreRememberedAccount();
        bindLoginEvents();
        if (!hasAuthentication()) {
            return;
        }
        if (isFirstLoginRequired()) {
            clearFirstLoginAuthentication();
            hideLoginMessage();
            return;
        }
        redirectToHome();
    }

    function hasAuthentication() {
        return Boolean(localStorage.getItem(CONFIG.accessTokenKey) && localStorage.getItem(CONFIG.refreshTokenKey));
    }

    function clearFirstLoginAuthentication() {
        localStorage.removeItem(CONFIG.accessTokenKey);

        localStorage.removeItem(CONFIG.refreshTokenKey);

        localStorage.removeItem(CONFIG.userKey);

        window.MCS.authSession?.clearRefreshTimer?.();

        mustChangePassword = false;
    }

    function handleAuthenticationChanged() {
        if (!hasAuthentication()) {
            return;
        }

        if (isFirstLoginRequired()) {
            return;
        }

        redirectToHome();
    }

    function bindAuthenticationSync() {
        window.addEventListener('storage', (event) => {
            if (event.storageArea !== localStorage) {
                return;
            }

            if (
                event.key === CONFIG.accessTokenKey ||
                event.key === CONFIG.refreshTokenKey ||
                event.key === 'mcsAuthEvent' ||
                event.key === CONFIG.userKey
            ) {
                handleAuthenticationChanged();
            }
        });

        window.addEventListener('pageshow', () => {
            handleAuthenticationChanged();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                handleAuthenticationChanged();
            }
        });

        window.addEventListener('focus', () => {
            handleAuthenticationChanged();
        });
    }

    async function loadSystemBranding() {
        setSystemName(CONFIG.defaultSystemName);
        setSystemLogo(CONFIG.defaultSystemLogo);

        await Promise.allSettled([loadSystemName(), loadSystemLogo()]);
    }

    async function loadSystemName() {
        try {
            const response = await fetch(CONFIG.systemNameEndpoint, {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                return;
            }

            const result = await parseJsonResponse(response);
            const data = result?.data ?? result;
            const systemName = String(data?.giaTri ?? '').trim();

            if (!systemName) {
                return;
            }

            setSystemName(systemName);
        } catch (error) {
            console.warn('[Login] Không thể tải tên hệ thống:', error);
        }
    }

    async function loadSystemLogo() {
        try {
            const response = await fetch(CONFIG.systemLogoEndpoint, {
                method: 'GET',
                headers: {
                    Accept: 'application/json'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                return;
            }

            const result = await parseJsonResponse(response);
            const data = result?.data ?? result;
            const logo = String(data?.giaTri ?? '').trim();

            if (!logo) {
                return;
            }

            setSystemLogo(normalizeLogoUrl(logo));
        } catch (error) {
            console.warn('[Login] Không thể tải logo hệ thống:', error);
        }
    }

    function setSystemName(name) {
        const value = String(name ?? '').trim() || CONFIG.defaultSystemName;

        elements.systemNames?.forEach((element) => {
            element.textContent = value;
        });
    }

    function setSystemLogo(src) {
        const value = String(src ?? '').trim() || CONFIG.defaultSystemLogo;

        elements.systemLogos?.forEach((image) => {
            image.onerror = () => {
                image.onerror = null;
                image.src = CONFIG.defaultSystemLogo;
            };

            image.src = value;
        });
    }

    function normalizeLogoUrl(value) {
        const logo = String(value ?? '').trim();

        if (!logo) {
            return CONFIG.defaultSystemLogo;
        }

        if (/^https?:\/\//i.test(logo) || logo.startsWith('/')) {
            return logo;
        }

        return `/${logo}`;
    }

    function bindLoginEvents() {
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', handleLoginSubmit);
        }

        if (elements.togglePasswordButton) {
            elements.togglePasswordButton.addEventListener('click', togglePasswordVisibility);
        }

        [elements.taiKhoan, elements.matKhau].filter(Boolean).forEach((input) => {
            input.addEventListener('input', () => {
                clearFieldError(input.name);
                hideLoginMessage();
            });
        });
    }

    function bindFirstLoginEvents() {
        window.addEventListener('mcs:password-changed', () => {
            if (!isFirstLoginRequired() && !mustChangePassword) {
                return;
            }

            setFirstLoginRequired(false);

            mustChangePassword = false;
        });

        document.addEventListener(
            'keydown',
            (event) => {
                if (event.key !== 'Escape' || !mustChangePassword) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();
            },
            true
        );
    }

    function restoreRememberedAccount() {
        if (!elements.taiKhoan || !elements.rememberAccount) {
            return;
        }

        const rememberedAccount = localStorage.getItem(CONFIG.rememberedAccountKey);

        if (!rememberedAccount) {
            return;
        }

        elements.taiKhoan.value = rememberedAccount;
        elements.rememberAccount.checked = true;
        elements.matKhau?.focus();
    }

    function saveRememberedAccount(taiKhoan) {
        if (elements.rememberAccount?.checked) {
            localStorage.setItem(CONFIG.rememberedAccountKey, taiKhoan);

            return;
        }

        localStorage.removeItem(CONFIG.rememberedAccountKey);
    }

    function togglePasswordVisibility() {
        if (!elements.matKhau || !elements.togglePasswordButton) {
            return;
        }

        const isPasswordVisible = elements.matKhau.type === 'text';

        elements.matKhau.type = isPasswordVisible ? 'password' : 'text';

        elements.togglePasswordButton.setAttribute('aria-pressed', String(!isPasswordVisible));

        elements.togglePasswordButton.setAttribute('aria-label', isPasswordVisible ? 'Hiện mật khẩu' : 'Ẩn mật khẩu');

        if (elements.passwordShowIcon) {
            elements.passwordShowIcon.hidden = !isPasswordVisible;
        }

        if (elements.passwordHideIcon) {
            elements.passwordHideIcon.hidden = isPasswordVisible;
        }

        elements.matKhau.focus();
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();

        if (isSubmittingLogin) {
            return;
        }

        clearAllFieldErrors();
        hideLoginMessage();

        const taiKhoan = elements.taiKhoan?.value.trim() || '';
        const matKhau = elements.matKhau?.value || '';

        if (!validateLoginForm(taiKhoan, matKhau)) {
            return;
        }

        setLoginSubmitting(true);

        try {
            const response = await fetch(CONFIG.loginEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    taiKhoan,
                    matKhau
                })
            });

            const result = await parseJsonResponse(response);

            if (!response.ok || result.success === false) {
                throw createRequestError(result, response.status);
            }

            const loginData = result.data || {};

            saveRememberedAccount(taiKhoan);
            saveAuthenticationData(loginData);

            if (loginData.firstLogin === true) {
                setFirstLoginRequired(true);
                openRequiredChangePasswordModal();
                return;
            }
            setFirstLoginRequired(false);
            window.MCS.authSync?.notifyLogin();
            redirectToHome();
        } catch (error) {
            handleLoginError(error);
        } finally {
            setLoginSubmitting(false);
        }
    }

    function validateLoginForm(taiKhoan, matKhau) {
        let valid = true;

        if (!taiKhoan && !matKhau) {
            showFieldError('taiKhoan', 'Tên đăng nhập không được để trống.');

            showFieldError('matKhau', 'Mật khẩu không được để trống.');

            showLoginMessage('Tên đăng nhập và mật khẩu không được để trống.', 'error');

            elements.taiKhoan?.focus();

            return false;
        }

        if (!taiKhoan) {
            showFieldError('taiKhoan', 'Tên đăng nhập không được để trống.');

            elements.taiKhoan?.focus();

            valid = false;
        }

        if (!matKhau) {
            showFieldError('matKhau', 'Mật khẩu không được để trống.');

            if (valid) {
                elements.matKhau?.focus();
            }

            valid = false;
        }

        return valid;
    }

    function saveAuthenticationData(loginData) {
        const firstLogin = loginData.firstLogin === true;
        const userData = {
            id: loginData.id,
            nhanVienId: loginData.nhanVienId,
            maNhanVien: loginData.maNhanVien,
            hoTen: loginData.hoTen,
            taiKhoan: loginData.taiKhoan,
            email: loginData.email,
            anhDaiDien: loginData.anhDaiDien,
            coSoId: loginData.coSoId,
            coSo: loginData.coSo,
            phongBanId: loginData.phongBanId,
            phongBan: loginData.phongBan,
            chucVuId: loginData.chucVuId,
            chucVu: loginData.chucVu,
            roles: loginData.roles || [],
            dsVaiTroId: loginData.dsVaiTroId || [],
            dsVaiTro: loginData.dsVaiTro || [],
            dsQuyenId: loginData.dsQuyenId || [],
            dsQuyen: loginData.dsQuyen || [],
            firstLogin
        };

        localStorage.setItem(CONFIG.userKey, JSON.stringify(userData));
        localStorage.setItem(CONFIG.lastActivityKey, String(Date.now()));

        if (loginData.accessToken) {
            localStorage.setItem(CONFIG.accessTokenKey, loginData.accessToken);
        }

        if (loginData.refreshToken) {
            localStorage.setItem(CONFIG.refreshTokenKey, loginData.refreshToken);
        }
        if (firstLogin) {
            localStorage.setItem(CONFIG.firstLoginRequiredKey, 'true');
        } else {
            localStorage.removeItem(CONFIG.firstLoginRequiredKey);
        }
    }

    function openRequiredChangePasswordModal() {
        if (!elements.changePasswordModal) {
            showLoginMessage('Không thể mở biểu mẫu đổi mật khẩu.', 'error');

            return;
        }

        mustChangePassword = true;

        elements.changePasswordModal.classList.add('is-required');

        if (window.MCS?.modal && typeof window.MCS.modal.open === 'function') {
            window.MCS.modal.open('changePasswordModal');

            return;
        }

        elements.changePasswordModal.hidden = false;

        elements.changePasswordModal.classList.add('is-open');

        document.body.classList.add('modal-open');
    }

    function setLoginSubmitting(submitting) {
        isSubmittingLogin = submitting;

        if (elements.loginSubmitButton) {
            elements.loginSubmitButton.disabled = submitting;

            elements.loginSubmitButton.setAttribute('aria-busy', String(submitting));
        }

        if (elements.loginSpinner) {
            elements.loginSpinner.hidden = !submitting;
        }

        if (elements.loginSubmitLabel) {
            elements.loginSubmitLabel.textContent = submitting ? 'Đang đăng nhập...' : 'Đăng nhập';
        }

        if (elements.taiKhoan) {
            elements.taiKhoan.disabled = submitting;
        }

        if (elements.matKhau) {
            elements.matKhau.disabled = submitting;
        }
    }

    function showFieldError(fieldName, message) {
        const field = document.querySelector(`[data-form-field="${fieldName}"]`);

        const input = field?.querySelector(`[name="${fieldName}"]`);

        const errorElement = document.querySelector(`[data-field-error="${fieldName}"]`);

        field?.classList.add('is-invalid');

        input?.setAttribute('aria-invalid', 'true');

        if (errorElement) {
            errorElement.textContent = message;
            errorElement.hidden = false;
        }
    }

    function clearFieldError(fieldName) {
        const field = document.querySelector(`[data-form-field="${fieldName}"]`);

        const input = field?.querySelector(`[name="${fieldName}"]`);

        const errorElement = document.querySelector(`[data-field-error="${fieldName}"]`);

        field?.classList.remove('is-invalid');

        input?.removeAttribute('aria-invalid');

        if (errorElement) {
            errorElement.textContent = '';
            errorElement.hidden = true;
        }
    }

    function clearAllFieldErrors() {
        clearFieldError('taiKhoan');
        clearFieldError('matKhau');
    }

    function showLoginMessage(message, type = 'error') {
        if (!elements.loginMessage || !elements.loginMessageText) {
            return;
        }

        elements.loginMessage.classList.remove('login-card__message--success', 'login-card__message--warning');

        if (type === 'success') {
            elements.loginMessage.classList.add('login-card__message--success');
        }

        if (type === 'warning') {
            elements.loginMessage.classList.add('login-card__message--warning');
        }

        elements.loginMessageText.textContent = message;
        elements.loginMessage.hidden = false;
    }

    function hideLoginMessage() {
        if (!elements.loginMessage) {
            return;
        }

        elements.loginMessage.hidden = true;

        elements.loginMessage.classList.remove('login-card__message--success', 'login-card__message--warning');

        if (elements.loginMessageText) {
            elements.loginMessageText.textContent = '';
        }
    }

    function handleLoginError(error) {
        const message = error.message || 'Đăng nhập không thành công.';

        const type = error.statusCode === 423 ? 'warning' : 'error';

        showLoginMessage(message, type);

        if (error.statusCode === 401) {
            elements.matKhau?.focus();
            elements.matKhau?.select();
        }
    }

    async function parseJsonResponse(response) {
        const contentType = response.headers.get('content-type') || '';

        if (!contentType.includes('application/json')) {
            return {
                success: false,
                message: 'Phản hồi từ máy chủ không hợp lệ.'
            };
        }

        return await response.json();
    }

    function createRequestError(result, statusCode) {
        const message = String(result?.message || result?.data?.message || '').trim();

        const error = new Error(message);
        error.statusCode = statusCode;
        error.data = result?.data;
        return error;
    }

    function redirectToHome() {
        if (window.MCS?.authSync?.redirectAfterLogin) {
            window.MCS.authSync.redirectAfterLogin();
            return;
        }

        const params = new URLSearchParams(window.location.search);

        const redirect = params.get('redirect');

        if (redirect && redirect.startsWith('/') && !redirect.startsWith('//') && !redirect.startsWith('/auth/login')) {
            window.location.replace(redirect);

            return;
        }

        window.location.replace(CONFIG.homePath);
    }

    initialize();
});
