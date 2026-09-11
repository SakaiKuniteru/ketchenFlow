'use strict';
window.MCS = window.MCS || {};
window.MCS.pages = window.MCS.pages || {};
window.MCS.pages.instances = window.MCS.pages.instances || {};
let currentPermissionsPromise = null;

async function loadCurrentPermissions() {
    if (currentPermissionsPromise) {
        return currentPermissionsPromise;
    }

    currentPermissionsPromise = window.MCS.api
        .request('/api/mcs/v1/auth/nhan-vien-hien-tai')
        .then((result) => {
            const dsQuyen = Array.isArray(result?.data?.dsQuyen) ? result.data.dsQuyen : [];

            return [
                ...new Set(
                    dsQuyen
                        .map((item) =>
                            String(item?.maQuyen || '')
                                .trim()
                                .toUpperCase()
                        )
                        .filter(Boolean)
                )
            ];
        })
        .catch((error) => {
            currentPermissionsPromise = null;

            throw error;
        });

    return currentPermissionsPromise;
}

function normalizePermissionCode(value) {
    return String(value || '')
        .trim()
        .toUpperCase();
}

function normalizePermissionCodes(value) {
    const values = Array.isArray(value) ? value : [value];

    return [...new Set(values.map(normalizePermissionCode).filter(Boolean))];
}

function resolveCatalogPermissionState(permissionCodes, currentPermissions = []) {
    const codes = {
        required: normalizePermissionCodes(permissionCodes?.required),

        view: normalizePermissionCodes(permissionCodes?.view),

        create: normalizePermissionCodes(permissionCodes?.create),

        update: normalizePermissionCodes(permissionCodes?.update)
    };

    const configured = Object.values(codes).some((items) => items.length > 0);

    if (!configured) {
        return {
            configured: false,
            codes,
            canView: true,
            canCreate: true,
            canUpdate: true
        };
    }

    const permissionSet = new Set(currentPermissions.map(normalizePermissionCode).filter(Boolean));

    const hasRequired = codes.required.every((code) => permissionSet.has(code));

    const hasView = codes.view.some((code) => permissionSet.has(code));

    const hasCreate = codes.create.some((code) => permissionSet.has(code));

    const hasUpdate = codes.update.some((code) => permissionSet.has(code));

    return {
        configured: true,
        codes,

        canView: hasRequired && (hasView || hasCreate || hasUpdate),

        canCreate: hasRequired && (hasCreate || hasUpdate),

        canUpdate: hasRequired && hasUpdate
    };
}

window.MCS.pages.createCatalogPage = async function createCatalogPage(options = {}) {
    const {
        moduleName,
        permissionCodes = null,
        columns = [],
        defaultValues = {
            active: true
        },
        detailTitle,
        createTitle,
        updateTitle,
        mapRecordToForm,
        transformPayload,
        validation = {},
        validate,
        onSubmitError,
        getRecordSubtitle,
        headerActions = [],
        onHeaderAction,
        mapListResponse,
        mapDetailResponse,
        actions,
        toolbarActions = [],
        onRecordLoaded,
        onAction,
        viewOnly = false
    } = options;

    if (!moduleName) {
        throw new Error('moduleName là bắt buộc.');
    }

    const root = document.querySelector(`[data-catalog-page][data-module="${moduleName}"]`);

    if (!root) {
        console.warn(`Không tìm thấy màn hình ${moduleName}.`);

        return null;
    }

    let currentPermissions = [];

    try {
        currentPermissions = await loadCurrentPermissions();

        root.dataset.permissions = currentPermissions.join(',');
    } catch (error) {
        console.error('Không thể tải quyền người dùng hiện tại.', error);

        currentPermissions = [];
        root.dataset.permissions = '';
    }

    const permissionState = resolveCatalogPermissionState(permissionCodes, currentPermissions);

    root.dataset.canView = String(permissionState.canView);

    root.dataset.canCreate = String(permissionState.canCreate);

    root.dataset.canUpdate = String(permissionState.canUpdate);

    const configElement = document.getElementById(`${moduleName}PageConfig`);

    let pageConfig = {};

    if (configElement) {
        try {
            pageConfig = JSON.parse(configElement.textContent);
        } catch (error) {
            console.error(`Cấu hình trang ${moduleName} không hợp lệ.`, error);
        }
    }

    const apiBase = pageConfig.apiBase || root.dataset.apiBase || '';

    const endpoints = {
        list: pageConfig.listEndpoint || (apiBase ? `${apiBase}/tong-hop` : ''),

        detail: viewOnly ? '' : pageConfig.detailEndpoint || apiBase,

        create: pageConfig.createEndpoint || (apiBase ? `${apiBase}/them-moi` : ''),

        update: pageConfig.updateEndpoint || (apiBase ? `${apiBase}/cap-nhat` : '')
    };

    let catalogInstance = null;

    const commonValidate = async (data, form) => {
        const errors = {};

        Object.entries(validation).forEach(([fieldName, rules]) => {
            const value = data?.[fieldName];

            const text = value === null || value === undefined ? '' : String(value).trim();

            if (rules.required === true && !text) {
                errors[fieldName] = rules.requiredMessage || 'Vui lòng điền vào trường này.';

                return;
            }

            if (rules.maxLength && text.length > rules.maxLength) {
                errors[fieldName] =
                    rules.maxLengthMessage ||
                    `${rules.label || fieldName} không được vượt quá ${rules.maxLength} ký tự.`;
            }
        });

        const currentId = catalogInstance?.state?.selectedId;

        Object.entries(validation).forEach(([fieldName, rules]) => {
            if (rules.unique !== true) {
                return;
            }

            const value = data?.[fieldName];

            const normalizedValue = normalizeValidationValue(value);

            if (!normalizedValue) {
                return;
            }

            const duplicate = catalogInstance?.state?.allData?.find((record) => {
                if (currentId !== null && currentId !== undefined && String(record?.id) === String(currentId)) {
                    return false;
                }

                return normalizeValidationValue(record?.[fieldName]) === normalizedValue;
            });

            if (duplicate) {
                errors[fieldName] = rules.uniqueMessage || `${rules.label || fieldName} đã tồn tại.`;
            }
        });

        if (typeof validate === 'function') {
            const customResult = await validate(data, form, catalogInstance);

            if (customResult && typeof customResult === 'object') {
                Object.assign(errors, customResult.errors || customResult);
            } else if (customResult === false) {
                return false;
            }
        }

        return errors;
    };

    const catalog = new window.MCS.catalog.Catalog({
        root,
        endpoints,
        columns,
        permissions: permissionState,
        currentPermissionCodes: currentPermissions,
        toolbarActions,
        detailTitle,
        createTitle,
        updateTitle,
        headerActions,
        onHeaderAction,
        defaultValues,
        mapRecordToForm,
        getRecordSubtitle,
        viewOnly,
        mapListResponse: mapListResponse || ((result) => result?.data || []),

        mapDetailResponse: mapDetailResponse || ((result) => result?.data || null),

        table: {
            actions
        },

        form: {
            transformPayload,
            validate: commonValidate
        },
        onSubmitError,
        onRecordLoaded,
        onAction
    });

    catalogInstance = catalog;

    window.MCS.pages.instances[moduleName] = catalog;

    await catalog.initialize();
    return catalog;
};

window.MCS.pages.initializeCatalogPage = function initializeCatalogPage(options = {}) {
    document.addEventListener('DOMContentLoaded', async () => {
        try {
            await window.MCS.pages.createCatalogPage(options);
        } catch (error) {
            console.error(`Không thể khởi tạo trang ${options.moduleName}.`, error);

            window.MCS.toast?.error(error.message || 'Không thể khởi tạo màn hình danh mục.');
        }
    });
};

window.createStatusBadge = function createStatusBadge(value) {
    const badge = document.createElement('span');

    badge.className = value ? 'status-badge status-badge--success' : 'status-badge status-badge--danger';

    badge.innerHTML = `
            <span
                class="status-badge__dot"
                aria-hidden="true">
            </span>

            <span>
                ${value ? 'TRUE' : 'FALSE'}
            </span>
        `;

    return badge;
};

window.normalizeNumberArray = function normalizeNumberArray(value) {
    if (Array.isArray(value)) {
        return value.map(Number).filter(Number.isInteger);
    }

    if (value === null || value === undefined || value === '') {
        return [];
    }

    return String(value)
        .split(',')
        .map((item) => Number(item.trim()))
        .filter(Number.isInteger);
};

function normalizeValidationValue(value) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase();
}
