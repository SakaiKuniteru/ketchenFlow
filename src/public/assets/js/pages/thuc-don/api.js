'use strict';

window.ThucDon = window.ThucDon || {};

window.ThucDon.api = (() => {
    const BASE = '/api/mcs/v1/thuc-don';

    function token() {
        const t = localStorage.getItem('accessToken');

        if (!t) {
            throw new Error('Không tìm thấy access token.');
        }

        return t;
    }

    async function request(url, { method = 'GET', body } = {}) {
        const response = await fetch(url, {
            method,

            headers: {
                Accept: 'application/json',

                'Content-Type': 'application/json',

                Authorization: `Bearer ${token()}`
            },

            credentials: 'include',

            body: body === undefined ? undefined : JSON.stringify(body)
        });

        let result;

        try {
            result = await response.json();
        } catch {
            throw new Error('Dữ liệu API trả về không hợp lệ.');
        }

        if (!response.ok) {
            throw new Error(result?.message || 'Yêu cầu thất bại.');
        }

        return result;
    }

    return {
        enums: () => request('/api/mcs/v1/enums'),

        setting: (ma) => request('/api/mcs/v1/thiet-lap/gia-tri' + `?ma=${encodeURIComponent(ma)}`),

        detail: (id) => request(`${BASE}/${encodeURIComponent(id)}`),

        create: (payload) =>
            request(`${BASE}/them-moi`, {
                method: 'POST',

                body: payload
            }),

        update: (id, payload) =>
            request(`${BASE}/cap-nhat/${encodeURIComponent(id)}`, {
                method: 'PATCH',

                body: payload
            }),

        approve: (id) =>
            request(`${BASE}/duyet/${encodeURIComponent(id)}`, {
                method: 'PATCH'
            }),

        unapprove: (id) =>
            request(`${BASE}/huy-duyet/${encodeURIComponent(id)}`, {
                method: 'PATCH'
            }),

        cancel: (id) =>
            request(`${BASE}/huy/${encodeURIComponent(id)}`, {
                method: 'PATCH'
            }),

        restore: (id) =>
            request(`${BASE}/hoan-huy/${encodeURIComponent(id)}`, {
                method: 'PATCH'
            })
    };
})();
