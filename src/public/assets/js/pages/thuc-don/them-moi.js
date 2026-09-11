'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.querySelector('[data-thuc-don-page][data-page-mode="create"]');

    if (!root) return;

    let permissions;

    try {
        permissions = await window.ThucDon.permission.load();
    } catch (error) {
        console.error('Không thể tải quyền thực đơn:', error);

        window.ThucDon.permission.showNoPermission(root);

        return;
    }

    if (!window.ThucDon.permission.canCreate(permissions)) {
        window.ThucDon.permission.showNoPermission(root);

        return;
    }

    const initial = createInitialData();

    await window.ThucDon.options.init(root, initial);

    const form = window.ThucDon.editor.init(root, {
        mode: 'create',

        onSubmit: (data) => submit(data, 10),

        onCancel: (form) => {
            form.setData(createInitialData());

            window.MCS?.toast?.info?.('Đã hủy toàn bộ thông tin vừa nhập.');
        }
    });

    form.setData(initial);

    function createInitialData() {
        return {
            id: null,

            maThucDon: '',

            tenThucDon: '',

            loaiThucDon: null,

            tuNgay: null,

            denNgay: null,

            coSoId: null,

            nhaAnId: null,

            caAnId: null,

            trangThai: 0,

            moTa: '',

            active: true,

            dsNgay: []
        };
    }

    async function submit(data, status) {
        const payload = window.ThucDon.payload.build(data, status);

        form.clearErrors();

        const generalErrors = window.ThucDon.payload.validateGeneral(payload);

        if (generalErrors.length) {
            generalErrors.forEach(([fieldName, message]) => {
                form.setFieldError(fieldName, message);
            });

            form.focusFirstError();

            return;
        }

        const contentErrors = window.ThucDon.payload.validateContent(payload, root._tdOptions?.settings || {});

        if (contentErrors.length) {
            window.MCS?.toast?.error?.(contentErrors[0]);

            return;
        }

        try {
            root.classList.add('is-loading');

            const result = await window.ThucDon.api.create(payload);

            window.MCS?.toast?.success?.(result?.message || 'Thêm mới thực đơn thành công.');

            const saved = result?.data ?? result;

            if (saved?.id) {
                window.location.href = `/thuc-don/thong-tin-chi-tiet-thuc-don/${saved.id}`;
            }
        } catch (e) {
            window.MCS?.toast?.error?.(e.message || 'Thêm mới thực đơn thất bại.');
        } finally {
            root.classList.remove('is-loading');
        }
    }
});
