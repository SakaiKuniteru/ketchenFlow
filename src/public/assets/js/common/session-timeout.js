'use strict';

window.MCS = window.MCS || {};

window.MCS.sessionTimeout = (() => {
    const CONFIG_CODE = 'THOI_GIAN_TIMEOUT';
    const LAST_ACTIVITY_KEY = 'mcsLastActivityAt';
    const ACTIVITY_SYNC_INTERVAL = 1000;

    const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'scroll', 'touchstart', 'pointerdown'];

    let timeoutMinutes = null;
    let timeoutMilliseconds = null;
    let timer = null;
    let initialized = false;
    let enabled = false;
    let lastActivityAt = 0;
    let lastActivitySyncedAt = 0;

    function getStoredLastActivity() {
        const value = Number(localStorage.getItem(LAST_ACTIVITY_KEY));

        if (!Number.isFinite(value) || value <= 0) {
            return 0;
        }

        return value;
    }

    function saveLastActivity(value) {
        lastActivityAt = value;

        localStorage.setItem(LAST_ACTIVITY_KEY, String(value));
    }

    function getLatestActivity() {
        return Math.max(
            lastActivityAt || 0,

            getStoredLastActivity()
        );
    }

    async function init() {
        if (initialized) {
            return;
        }

        initialized = true;

        const accessToken = window.MCS?.storage?.getAccessToken?.();

        if (!accessToken) {
            return;
        }

        try {
            const minutes = await getTimeoutSetting();

            if (minutes === null) {
                enabled = false;
                return;
            }

            timeoutMinutes = minutes;
            timeoutMilliseconds = timeoutMinutes * 60 * 1000;
            enabled = true;
            const now = Date.now();
            lastActivitySyncedAt = now;
            saveLastActivity(now);
            bindActivityEvents();
            startTimer();
        } catch (error) {
            console.error('[SessionTimeout] Không thể khởi tạo:', error);

            enabled = false;
        }
    }

    async function getTimeoutSetting() {
        try {
            const result = await window.MCS.api.request(
                `/api/mcs/v1/thiet-lap/gia-tri?ma=${encodeURIComponent(CONFIG_CODE)}`
            );

            const data = result?.data ?? result;
            const rawValue = data?.giaTri;

            return parseTimeoutMinutes(rawValue);
        } catch (error) {
            if (error?.statusCode === 404) {
                return null;
            }

            throw error;
        }
    }

    function parseTimeoutMinutes(value) {
        const raw = String(value ?? '').trim();

        if (!/^\d+$/.test(raw)) {
            return null;
        }

        const minutes = Number(raw);

        if (!Number.isInteger(minutes) || minutes <= 10) {
            return null;
        }

        return minutes;
    }

    function bindActivityEvents() {
        ACTIVITY_EVENTS.forEach((eventName) => {
            document.addEventListener(eventName, handleActivity, {
                passive: true
            });
        });

        document.addEventListener('visibilitychange', handleVisibilityChange);

        window.addEventListener('focus', checkTimeout);
        window.addEventListener('storage', handleStorageActivity);
    }

    function handleActivity() {
        if (!enabled) {
            return;
        }
        const now = Date.now();
        lastActivityAt = now;
        if (now - lastActivitySyncedAt >= ACTIVITY_SYNC_INTERVAL) {
            lastActivitySyncedAt = now;
            saveLastActivity(now);
        }
        restartTimer();
    }

    function handleStorageActivity(event) {
        if (event.storageArea !== localStorage || event.key !== LAST_ACTIVITY_KEY || !event.newValue) {
            return;
        }

        const value = Number(event.newValue);

        if (!Number.isFinite(value) || value <= lastActivityAt) {
            return;
        }

        lastActivityAt = value;

        restartTimer();
    }

    function handleVisibilityChange() {
        if (!enabled) {
            return;
        }

        if (document.visibilityState === 'visible') {
            checkTimeout();
        }
    }

    function startTimer() {
        clearTimer();

        if (!enabled || !timeoutMilliseconds) {
            return;
        }

        lastActivityAt = getLatestActivity();

        const elapsed = Date.now() - lastActivityAt;

        const remaining = timeoutMilliseconds - elapsed;

        if (remaining <= 0) {
            checkTimeout();

            return;
        }

        timer = window.setTimeout(checkTimeout, remaining);
    }

    function restartTimer() {
        if (!enabled) {
            return;
        }

        startTimer();
    }

    function checkTimeout() {
        if (!enabled || !timeoutMilliseconds) {
            return;
        }

        /*
         * Luôn đọc activity mới nhất
         * của TẤT CẢ tab.
         */
        lastActivityAt = getLatestActivity();

        const elapsed = Date.now() - lastActivityAt;

        if (elapsed >= timeoutMilliseconds) {
            logoutByTimeout();

            return;
        }

        startTimer();
    }

    async function logoutByTimeout() {
        if (!enabled) {
            return;
        }

        const latestActivity = getLatestActivity();

        /*
         * Có tab khác vừa thao tác
         * thì KHÔNG logout.
         */
        if (Date.now() - latestActivity < timeoutMilliseconds) {
            lastActivityAt = latestActivity;

            startTimer();

            return;
        }

        enabled = false;

        clearTimer();

        unbindActivityEvents();

        const refreshToken = window.MCS?.storage?.getRefreshToken?.();

        if (refreshToken) {
            try {
                await window.MCS.api.request('/api/mcs/v1/auth/logout', {
                    method: 'POST',

                    body: JSON.stringify({
                        refreshToken
                    }),

                    allowRefresh: false
                });
            } catch (error) {
                console.warn('[SessionTimeout] Không thể revoke token:', error);
            }
        }

        localStorage.removeItem(LAST_ACTIVITY_KEY);

        window.MCS?.storage?.clearAuthentication?.();

        window.location.replace(window.MCS?.config?.loginPath || '/auth/login');
    }

    function clearTimer() {
        if (timer !== null) {
            clearTimeout(timer);

            timer = null;
        }
    }

    function unbindActivityEvents() {
        ACTIVITY_EVENTS.forEach((eventName) => {
            document.removeEventListener(eventName, handleActivity);
        });

        document.removeEventListener('visibilitychange', handleVisibilityChange);

        window.removeEventListener('focus', checkTimeout);
        window.removeEventListener('storage', handleStorageActivity);
    }

    function destroy() {
        enabled = false;
        initialized = false;
        timeoutMinutes = null;
        timeoutMilliseconds = null;

        clearTimer();
        unbindActivityEvents();
    }

    function getState() {
        return {
            initialized,
            enabled,
            timeoutMinutes,
            lastActivityAt
        };
    }

    return {
        init,
        destroy,
        getState
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    window.MCS?.sessionTimeout?.init?.();
});
