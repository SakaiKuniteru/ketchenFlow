'use strict';

window.MCS = window.MCS || {};

window.MCS.config = {
    accessTokenKey: 'accessToken',
    refreshTokenKey: 'refreshToken',
    currentUserKey: 'currentUser',
    authEventKey: 'mcsAuthEvent',
    redirectKey: 'mcsAuthRedirect',
    loginPath: '/auth/login',
    homePath: '/',
    accessTokenRefreshBeforeSeconds: 120
};

window.MCS.storage = {
    getAccessToken() {
        return localStorage.getItem(window.MCS.config.accessTokenKey);
    },

    getRefreshToken() {
        return localStorage.getItem(window.MCS.config.refreshTokenKey);
    },

    getCurrentUser() {
        const raw = localStorage.getItem(window.MCS.config.currentUserKey);

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    },

    setCurrentUser(currentUser) {
        if (!currentUser) {
            localStorage.removeItem(window.MCS.config.currentUserKey);

            return;
        }

        localStorage.setItem(window.MCS.config.currentUserKey, JSON.stringify(currentUser));

        window.dispatchEvent(
            new CustomEvent('mcs:current-user-updated', {
                detail: {
                    currentUser
                }
            })
        );
    },

    clearAuthentication() {
        localStorage.removeItem(window.MCS.config.accessTokenKey);
        localStorage.removeItem(window.MCS.config.refreshTokenKey);
        localStorage.removeItem(window.MCS.config.currentUserKey);
        localStorage.removeItem('mcsLastActivityAt');
    }
};

window.MCS.authSync = {
    initialized: false,

    getCurrentUrl() {
        return window.location.pathname + window.location.search + window.location.hash;
    },

    isLoginPage() {
        return window.location.pathname === window.MCS.config.loginPath;
    },

    hasAuthentication() {
        return Boolean(window.MCS.storage.getAccessToken() && window.MCS.storage.getRefreshToken());
    },

    isValidRedirect(redirect) {
        return Boolean(
            redirect &&
            redirect.startsWith('/') &&
            !redirect.startsWith('//') &&
            !redirect.startsWith(window.MCS.config.loginPath)
        );
    },

    saveRedirect(url = null) {
        const redirect = url || this.getCurrentUrl();

        if (!this.isValidRedirect(redirect)) {
            return;
        }

        sessionStorage.setItem(window.MCS.config.redirectKey, redirect);
    },

    getRedirect() {
        const params = new URLSearchParams(window.location.search);
        const redirectFromQuery = params.get('redirect');

        if (this.isValidRedirect(redirectFromQuery)) {
            return redirectFromQuery;
        }

        const redirectFromSession = sessionStorage.getItem(window.MCS.config.redirectKey);

        if (this.isValidRedirect(redirectFromSession)) {
            return redirectFromSession;
        }

        return window.MCS.config.homePath;
    },

    clearRedirect() {
        sessionStorage.removeItem(window.MCS.config.redirectKey);
    },

    buildLoginUrl(redirect = null) {
        const target = redirect || this.getCurrentUrl();

        if (!this.isValidRedirect(target)) {
            return window.MCS.config.loginPath;
        }

        return window.MCS.config.loginPath + '?redirect=' + encodeURIComponent(target);
    },

    redirectToLogin() {
        if (this.isLoginPage()) {
            return;
        }

        const currentUrl = this.getCurrentUrl();

        this.saveRedirect(currentUrl);

        window.location.replace(this.buildLoginUrl(currentUrl));
    },

    redirectAfterLogin() {
        if (!this.hasAuthentication()) {
            return;
        }

        const redirect = this.getRedirect();

        this.clearRedirect();

        window.location.replace(redirect);
    },

    notify(type) {
        localStorage.setItem(
            window.MCS.config.authEventKey,
            JSON.stringify({
                type,
                timestamp: Date.now(),
                nonce: Math.random().toString(36).slice(2)
            })
        );
    },

    notifyLogin() {
        this.notify('login');
    },

    notifyLogout() {
        this.notify('logout');
    },

    handleAuthenticated() {
        if (!this.hasAuthentication()) {
            return;
        }

        window.MCS.authSession?.scheduleAccessTokenRefresh();

        if (this.isLoginPage()) {
            this.redirectAfterLogin();
        }
    },

    handleUnauthenticated() {
        window.MCS.authSession?.clearRefreshTimer();

        if (!this.isLoginPage()) {
            this.redirectToLogin();
        }
    },

    handleStorageEvent(event) {
        if (event.key === window.MCS.config.accessTokenKey) {
            if (event.newValue) {
                this.handleAuthenticated();
            } else {
                this.handleUnauthenticated();
            }

            return;
        }

        if (event.key === window.MCS.config.refreshTokenKey) {
            if (event.newValue) {
                this.handleAuthenticated();
            } else if (!window.MCS.storage.getAccessToken()) {
                this.handleUnauthenticated();
            }

            return;
        }

        if (event.key !== window.MCS.config.authEventKey || !event.newValue) {
            return;
        }

        let authEvent = null;

        try {
            authEvent = JSON.parse(event.newValue);
        } catch {
            return;
        }

        if (authEvent?.type === 'login') {
            this.handleAuthenticated();
            return;
        }

        if (authEvent?.type === 'logout') {
            this.handleUnauthenticated();
        }
    },

    checkCurrentAuthentication() {
        const authenticated = this.hasAuthentication();

        if (authenticated && this.isLoginPage()) {
            this.redirectAfterLogin();
            return;
        }

        if (!authenticated && !this.isLoginPage()) {
            this.redirectToLogin();
        }
    },

    initialize() {
        if (this.initialized) {
            return;
        }

        this.initialized = true;

        window.addEventListener('storage', (event) => {
            this.handleStorageEvent(event);
        });

        window.addEventListener('pageshow', () => {
            this.checkCurrentAuthentication();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.checkCurrentAuthentication();
            }
        });

        window.addEventListener('focus', () => {
            this.checkCurrentAuthentication();
        });

        this.checkCurrentAuthentication();
    }
};

window.MCS.authSession = {
    refreshTimer: null,

    decodeAccessToken(token) {
        if (!token) {
            return null;
        }

        try {
            const parts = token.split('.');

            if (parts.length !== 3) {
                return null;
            }

            let payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');

            while (payload.length % 4) {
                payload += '=';
            }

            const decoded = decodeURIComponent(
                atob(payload)
                    .split('')
                    .map((character) => '%' + ('00' + character.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            return JSON.parse(decoded);
        } catch (error) {
            console.warn('[Auth] Không thể đọc Access Token:', error);

            return null;
        }
    },

    clearRefreshTimer() {
        if (this.refreshTimer) {
            clearTimeout(this.refreshTimer);
            this.refreshTimer = null;
        }
    },

    scheduleRefreshRetry() {
        this.clearRefreshTimer();

        if (!window.MCS.storage.getAccessToken() || !window.MCS.storage.getRefreshToken()) {
            return;
        }

        this.refreshTimer = window.setTimeout(() => {
            this.refreshAccessTokenNow();
        }, 15000);
    },

    scheduleAccessTokenRefresh() {
        this.clearRefreshTimer();

        const accessToken = window.MCS.storage.getAccessToken();

        const refreshToken = window.MCS.storage.getRefreshToken();

        if (!accessToken || !refreshToken) {
            return;
        }

        const accessPayload = this.decodeAccessToken(accessToken);

        const refreshPayload = this.decodeAccessToken(refreshToken);

        const expirations = [Number(accessPayload?.exp), Number(refreshPayload?.exp)]
            .filter((value) => Number.isFinite(value) && value > 0)
            .map((value) => value * 1000);

        if (expirations.length === 0) {
            return;
        }

        /*
         * Token nào hết trước
         * thì refresh theo token đó.
         */
        const expiresAt = Math.min(...expirations);

        const refreshBefore = window.MCS.config.accessTokenRefreshBeforeSeconds * 1000;

        const delay = expiresAt - Date.now() - refreshBefore;

        if (delay <= 0) {
            this.refreshAccessTokenNow();

            return;
        }

        this.refreshTimer = window.setTimeout(() => {
            this.refreshAccessTokenNow();
        }, delay);
    },

    async refreshAccessTokenNow() {
        if (window.location.pathname === window.MCS.config.loginPath) {
            return;
        }

        const refreshToken = window.MCS.storage.getRefreshToken();

        if (!refreshToken) {
            return;
        }

        try {
            const refreshed = await window.MCS.api.refreshAuthentication();

            if (!refreshed) {
                this.scheduleRefreshRetry();

                return;
            }

            this.scheduleAccessTokenRefresh();
        } catch (error) {
            console.warn('[Auth] Làm mới token tự động thất bại:', error);

            this.scheduleRefreshRetry();
        }
    }
};

window.MCS.api = {
    refreshPromise: null,

    async request(url, options = {}) {
        let result = await this.send(url, options);

        if (result.response.status === 401 && options.allowRefresh !== false) {
            const refreshed = await this.refreshAuthentication();

            if (refreshed) {
                result = await this.send(url, {
                    ...options,

                    allowRefresh: false
                });
            }
        }

        if (!result.response.ok) {
            const error = new Error(result.data?.message || 'Yêu cầu không thành công.');

            error.statusCode = result.response.status;
            error.data = result.data?.data;

            throw error;
        }

        return result.data;
    },

    async send(url, options = {}) {
        const accessToken = window.MCS.storage.getAccessToken();

        const headers = {
            Accept: 'application/json',
            ...options.headers
        };

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (accessToken && options.withoutAccessToken !== true) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const fetchOptions = {
            credentials: 'include',
            ...options,
            headers
        };

        delete fetchOptions.allowRefresh;
        delete fetchOptions.withoutAccessToken;

        const response = await fetch(url, fetchOptions);

        const contentType = response.headers.get('content-type') || '';

        let data = null;

        if (contentType.includes('application/json')) {
            try {
                data = await response.json();
            } catch {
                data = null;
            }
        }

        return {
            response,
            data
        };
    },

    async requestFile(url, options = {}) {
        let result = await this.sendFile(url, options);

        if (result.response.status === 401 && options.allowRefresh !== false) {
            const refreshed = await this.refreshAuthentication();

            if (refreshed) {
                result = await this.sendFile(url, {
                    ...options,

                    allowRefresh: false
                });
            }
        }

        if (!result.response.ok) {
            let message = 'Yêu cầu không thành công.';

            if (result.contentType.includes('application/json')) {
                try {
                    const text = await result.blob.text();

                    const data = JSON.parse(text);

                    message = data?.message || message;
                } catch (error) {
                    console.warn('Không đọc được lỗi tải file:', error);
                }
            }

            const error = new Error(message);

            error.statusCode = result.response.status;

            throw error;
        }

        return {
            blob: result.blob,
            fileName: this.getDownloadFileName(result.response),
            contentType: result.contentType
        };
    },

    async sendFile(url, options = {}) {
        const accessToken = window.MCS.storage.getAccessToken();

        const headers = {
            Accept: '*/*',
            ...options.headers
        };

        if (options.body && !(options.body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        if (accessToken && options.withoutAccessToken !== true) {
            headers.Authorization = `Bearer ${accessToken}`;
        }

        const fetchOptions = {
            credentials: 'include',
            ...options,
            headers
        };

        delete fetchOptions.allowRefresh;
        delete fetchOptions.withoutAccessToken;

        const response = await fetch(url, fetchOptions);

        const contentType = response.headers.get('content-type') || '';

        const blob = await response.blob();

        return {
            response,
            blob,
            contentType
        };
    },

    getDownloadFileName(response) {
        const disposition = response.headers.get('content-disposition') || '';

        const utf8Match = disposition.match(/filename\*=UTF-8''([^;]+)/i);

        if (utf8Match?.[1]) {
            try {
                return decodeURIComponent(utf8Match[1]);
            } catch (error) {
                return utf8Match[1];
            }
        }

        const normalMatch = disposition.match(/filename="?([^";]+)"?/i);

        return normalMatch?.[1] || null;
    },

    downloadBlob(blob, fileName = 'download.xlsx') {
        if (!(blob instanceof Blob)) {
            throw new Error('Dữ liệu tải xuống không hợp lệ.');
        }

        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');

        anchor.href = objectUrl;
        anchor.download = fileName;
        anchor.style.display = 'none';

        document.body.appendChild(anchor);

        anchor.click();
        anchor.remove();

        setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
        }, 1000);
    },

    async refreshAuthentication() {
        const refreshToken = window.MCS.storage.getRefreshToken();

        if (!refreshToken) {
            return false;
        }

        if (this.refreshPromise) {
            return await this.refreshPromise;
        }

        const executeRefresh = async () => {
            const latestRefreshToken = window.MCS.storage.getRefreshToken();

            if (!latestRefreshToken) {
                return false;
            }

            if (latestRefreshToken !== refreshToken) {
                window.MCS.authSession?.scheduleAccessTokenRefresh();

                return true;
            }

            return await this.performRefresh(latestRefreshToken);
        };

        this.refreshPromise = navigator.locks?.request
            ? navigator.locks.request('mcs-auth-refresh', executeRefresh)
            : executeRefresh();

        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    },

    async performRefresh(refreshToken) {
        try {
            const response = await fetch('/api/mcs/v1/auth/lam-moi-token', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken
                })
            });

            if (!response.ok) {
                return false;
            }

            const result = await response.json();

            const data = result?.data ?? result;

            if (!data?.accessToken || !data?.refreshToken) {
                return false;
            }

            localStorage.setItem(window.MCS.config.accessTokenKey, data.accessToken);

            localStorage.setItem(window.MCS.config.refreshTokenKey, data.refreshToken);

            window.MCS.authSession?.scheduleAccessTokenRefresh();

            return true;
        } catch (error) {
            console.warn('[Auth] Không thể làm mới token:', error);

            return false;
        }
    }
};

window.MCS.escapeHtml = (value) => {
    const element = document.createElement('div');

    element.textContent = value ?? '';

    return element.innerHTML;
};

document.addEventListener('DOMContentLoaded', async () => {
    window.MCS.authSync?.initialize();

    const authenticated = window.MCS.authSync?.hasAuthentication?.() === true;

    const loginPage = window.MCS.authSync?.isLoginPage?.() === true;

    if (authenticated && !loginPage) {
        await window.MCS.api.refreshAuthentication();
    }

    window.MCS.authSession.scheduleAccessTokenRefresh();

    const currentUser = window.MCS.storage.getCurrentUser();

    document.querySelectorAll('[data-current-user-name]').forEach((element) => {
        element.textContent = currentUser?.hoTen || 'Người dùng';
    });

    const changePasswordButtons = document.querySelectorAll('#changePasswordButton, ' + '#homeChangePasswordButton');

    changePasswordButtons.forEach((button) => {
        button.addEventListener('click', () => {
            window.MCS.modal?.open('changePasswordModal');
        });
    });
});
