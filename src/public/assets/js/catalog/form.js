'use strict';

window.MCS = window.MCS || {};

window.MCS.catalog = window.MCS.catalog || {};

class MCSForm {
    constructor(form, options = {}) {
        this.form = typeof form === 'string' ? document.querySelector(form) : form;

        this.options = {
            mode: 'view',
            fields: [],
            transformPayload: null,
            onSubmit: null,
            onCancel: null,
            onDirtyChange: null,
            ...options
        };

        this.initialData = {};
        this.isDirty = false;
        this.isSubmitting = false;

        this.elements = {
            submit: this.form?.querySelector('[data-form-submit]'),
            cancel: this.form?.querySelector('[data-form-cancel]'),
            reset: this.form?.querySelector('[data-form-reset]'),
            spinner: this.form?.querySelector('[data-submit-spinner]'),
            submitLabel: this.form?.querySelector('[data-submit-label]'),
            unsaved: this.form?.querySelector('[data-form-unsaved]')
        };

        this.bindEvents();

        this.setMode(this.options.mode);
    }

    bindEvents() {
        if (!this.form) {
            return;
        }

        this.form.noValidate = true;

        if (this.elements.submit) {
            this.elements.submit.type = 'button';

            this.elements.submit.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                this.submit();
            });
        }

        this.form.addEventListener('submit', (event) => {
            event.preventDefault();

            this.submit();
        });

        this.form.addEventListener('input', (event) => {
            this.clearFieldError(event.target.name);

            this.updateDirtyState();
        });

        this.form.addEventListener('change', (event) => {
            this.clearFieldError(event.target.name);

            this.updateDirtyState();
        });

        this.elements.cancel?.addEventListener('click', () => {
            this.options.onCancel?.(this);
        });

        this.elements.reset?.addEventListener('click', () => {
            this.setData(this.initialData);
        });

        this.form.querySelectorAll('textarea[maxlength]').forEach((textarea) => {
            textarea.addEventListener('input', () => this.updateCounter(textarea));

            this.updateCounter(textarea);
        });
    }

    setMode(mode) {
        this.options.mode = mode;

        const panel = this.form?.closest('[data-detail-panel]');

        if (panel) {
            panel.dataset.mode = mode;
        }

        const readonly = mode === 'view';

        this.form?.querySelectorAll('input, textarea, select').forEach((field) => {
            if (field.type === 'hidden' || field.closest('[data-rich-text]')) {
                return;
            }

            const editableInView = field.dataset.editableInView === 'true';

            /*
             * =========================================
             * VIEW + FIELD ĐƯỢC PHÉP NHẬP
             * =========================================
             */
            if (readonly && editableInView) {
                field.disabled = false;

                if ('readOnly' in field) {
                    field.readOnly = false;
                }

                return;
            }

            /*
             * =========================================
             * VIEW BÌNH THƯỜNG
             * =========================================
             */
            if (readonly) {
                if (field.dataset.catalogOriginalDisabled === undefined) {
                    field.dataset.catalogOriginalDisabled = String(field.disabled);
                }

                if ('readOnly' in field && field.dataset.catalogOriginalReadonly === undefined) {
                    field.dataset.catalogOriginalReadonly = String(field.readOnly);
                }

                field.disabled = true;

                if ('readOnly' in field) {
                    field.readOnly = true;
                }

                return;
            }

            /*
             * =========================================
             * CREATE / UPDATE
             * =========================================
             */
            const originalDisabled = field.dataset.catalogOriginalDisabled;

            if (originalDisabled !== undefined) {
                field.disabled = originalDisabled === 'true';

                delete field.dataset.catalogOriginalDisabled;
            }

            const originalReadonly = field.dataset.catalogOriginalReadonly;

            if (originalReadonly !== undefined && 'readOnly' in field) {
                field.readOnly = originalReadonly === 'true';

                delete field.dataset.catalogOriginalReadonly;
            }
        });

        if (this.elements.submit) {
            this.elements.submit.hidden = readonly;

            if (!readonly && !this.isSubmitting) {
                this.elements.submit.disabled = false;
            }
        }

        if (this.elements.cancel) {
            this.elements.cancel.hidden = readonly;

            if (!readonly && !this.isSubmitting) {
                this.elements.cancel.disabled = false;
            }
        }

        if (this.elements.reset) {
            this.elements.reset.hidden = readonly;
        }

        this.updateSubmitLabel();

        window.MCS?.richTextEditor?.refresh?.(this.form);
    }

    updateSubmitLabel() {
        if (!this.elements.submitLabel) {
            return;
        }

        this.elements.submitLabel.textContent = 'Lưu';
    }

    setData(data = {}) {
        this.clearErrors();

        this.initialData = structuredCloneSafe(data);

        const fields = this.form?.elements || [];

        Array.from(fields).forEach((field) => {
            if (!field.name) {
                return;
            }

            const value = this.resolveValue(data, field.name);

            this.setFieldValue(field, value);
        });

        this.isDirty = false;

        this.updateUnsavedIndicator();

        this.form?.querySelectorAll('textarea[maxlength]').forEach((textarea) => this.updateCounter(textarea));

        window.MCS?.richTextEditor?.refresh?.(this.form);
    }

    reset() {
        this.setData(this.initialData);
    }

    clear() {
        this.clearErrors();

        this.form?.reset();

        this.form?.querySelectorAll("input[type='hidden']").forEach((input) => {
            input.value = '';
        });

        this.initialData = {};
        this.isDirty = false;

        this.updateUnsavedIndicator();
        window.MCS?.richTextEditor?.refresh?.(this.form);
    }

    syncRichTextFields() {
        this.form?.querySelectorAll('[data-rich-text]').forEach((root) => {
            const editor = root.richTextEditor || window.MCS?.richTextEditor?.initialize?.(root);

            if (!editor) {
                return;
            }

            const input = root.querySelector('[data-rich-text-input]');

            const value = editor.getValue?.() ?? input?.value ?? '';

            if (input) {
                input.value = String(value || '');
            }
        });
    }

    getData() {
        this.syncRichTextFields();

        const result = {};
        const fields = this.form?.elements || [];

        Array.from(fields).forEach((field) => {
            if (!field.name || field.disabled) {
                return;
            }

            let value;

            if (field.type === 'checkbox') {
                value = field.checked;
            } else if (field.type === 'number') {
                value = field.value === '' ? null : Number(field.value);
            } else if (field.type === 'file') {
                value = field.multiple ? Array.from(field.files || []) : field.files?.[0] || null;
            } else {
                value = field.value;
            }

            this.assignValue(result, field.name, value);
        });

        if (typeof this.options.transformPayload === 'function') {
            return this.options.transformPayload(result, this);
        }

        return result;
    }

    async submit() {
        if (this.isSubmitting || this.options.mode === 'view') {
            return;
        }

        this.clearErrors();

        const data = this.getData();

        const nativeValid = this.validateNative();

        let customValid = true;

        if (typeof this.options.validate === 'function') {
            const result = await this.options.validate(data, this);

            if (result === false) {
                customValid = false;
            } else if (result && typeof result === 'object') {
                const errors = result.errors || result;

                if (Object.keys(errors).length > 0) {
                    this.setErrors(errors);

                    customValid = false;
                }
            }
        }

        if (!nativeValid || !customValid) {
            this.focusFirstError();

            return;
        }

        this.setSubmitting(true);

        try {
            await this.options.onSubmit?.(data, this);

            this.initialData = structuredCloneSafe(data);

            this.isDirty = false;

            this.updateUnsavedIndicator();
        } catch (error) {
            if (error?.data?.errors) {
                this.setErrors(error.data.errors);

                this.focusFirstError();
            }

            throw error;
        } finally {
            this.setSubmitting(false);
        }
    }

    validateNative() {
        const invalidFields = Array.from(this.form?.querySelectorAll(':invalid') || []).filter(
            (field) =>
                Boolean(field.name) &&
                !field.disabled &&
                !field.closest('[data-rich-text-toolbar]') &&
                !field.closest('[data-rich-text-link-popup]')
        );

        if (invalidFields.length === 0) {
            return true;
        }

        invalidFields.forEach((field) => {
            this.setFieldError(field.name, field.validationMessage || 'Dữ liệu không hợp lệ.');
        });

        invalidFields[0]?.focus();

        return false;
    }

    setErrors(errors) {
        if (Array.isArray(errors)) {
            errors.forEach((error) => {
                this.setFieldError(error.field || error.path, error.message);
            });

            return;
        }

        Object.entries(errors || {}).forEach(([field, message]) => {
            this.setFieldError(field, Array.isArray(message) ? message[0] : message);
        });
    }

    setFieldError(name, message) {
        if (!name) {
            return;
        }

        const container = this.form.querySelector(`[data-form-field="${name}"]`);

        const field = this.form.elements[name];

        const error = this.form.querySelector(`[data-field-error="${name}"]`);

        container?.classList.add('is-invalid');

        field?.setAttribute('aria-invalid', 'true');

        if (error) {
            error.textContent = message || '';
            error.hidden = false;
        }
    }

    clearFieldError(name) {
        if (!name) {
            return;
        }

        const container = this.form.querySelector(`[data-form-field="${name}"]`);

        const field = this.form.elements[name];

        const error = this.form.querySelector(`[data-field-error="${name}"]`);

        container?.classList.remove('is-invalid');

        field?.removeAttribute('aria-invalid');

        if (error) {
            error.textContent = '';
            error.hidden = true;
        }
    }

    clearErrors() {
        this.form?.querySelectorAll('[data-form-field]').forEach((container) => {
            container.classList.remove('is-invalid');
        });

        this.form?.querySelectorAll("[aria-invalid='true']").forEach((field) => {
            field.removeAttribute('aria-invalid');
        });

        this.form?.querySelectorAll('[data-field-error]').forEach((error) => {
            error.textContent = '';
            error.hidden = true;
        });
    }

    focusFirstError() {
        const field = this.form?.querySelector("[aria-invalid='true']");

        if (!field) {
            return;
        }

        if (typeof field.focus === 'function') {
            field.focus();
        }
    }

    setSubmitting(submitting) {
        this.isSubmitting = submitting;

        if (this.elements.submit) {
            this.elements.submit.disabled = submitting;
        }

        if (this.elements.cancel) {
            this.elements.cancel.disabled = submitting;
        }

        if (this.elements.spinner) {
            this.elements.spinner.hidden = !submitting;
        }

        if (this.elements.submitLabel) {
            if (submitting) {
                this.elements.submitLabel.textContent = 'Đang lưu...';
            } else {
                this.updateSubmitLabel();
            }
        }
    }

    updateDirtyState() {
        const current = this.getData();

        const dirty = JSON.stringify(current) !== JSON.stringify(this.initialData);

        if (dirty === this.isDirty) {
            return;
        }

        this.isDirty = dirty;

        this.updateUnsavedIndicator();

        this.options.onDirtyChange?.(dirty, this);
    }

    updateUnsavedIndicator() {
        if (this.elements.unsaved) {
            this.elements.unsaved.hidden = !this.isDirty;
        }
    }

    updateCounter(textarea) {
        const counter = this.form.querySelector(`[data-character-counter="${textarea.id}"]`);

        const current = counter?.querySelector('[data-character-current]');

        if (current) {
            current.textContent = textarea.value.length;
        }
    }

    setFieldValue(field, value) {
        if (field.type === 'checkbox') {
            field.checked = Boolean(value);

            return;
        }

        if (field.type === 'radio') {
            field.checked = String(field.value) === String(value);

            return;
        }

        if (field.type === 'date' && value) {
            field.value = String(value).slice(0, 10);

            return;
        }

        if (field.type === 'datetime-local' && value) {
            field.value = this.toDateTimeLocal(value);

            return;
        }

        if (field.type === 'file') {
            return;
        }

        field.value = value ?? '';
    }

    resolveValue(object, path) {
        return String(path)
            .split('.')
            .reduce((value, key) => value?.[key], object);
    }

    assignValue(object, path, value) {
        const keys = String(path).split('.');

        let target = object;

        keys.forEach((key, index) => {
            if (index === keys.length - 1) {
                target[key] = value;

                return;
            }

            target[key] = target[key] || {};

            target = target[key];
        });
    }

    toDateTimeLocal(value) {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return '';
        }

        const offset = date.getTimezoneOffset();

        const local = new Date(date.getTime() - offset * 60000);

        return local.toISOString().slice(0, 16);
    }
}

function structuredCloneSafe(value) {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }

    return JSON.parse(JSON.stringify(value));
}

window.MCS.catalog.Form = MCSForm;
