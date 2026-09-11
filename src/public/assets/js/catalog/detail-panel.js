'use strict';

window.MCS = window.MCS || {};

window.MCS.catalog = window.MCS.catalog || {};

class MCSDetailPanel {
    constructor(root, options = {}) {
        this.root = typeof root === 'string' ? document.querySelector(root) : root;

        this.options = {
            mobileBreakpoint: 1100,
            defaultTitle: 'Thông tin chi tiết',
            onEdit: null,
            onClose: null,
            headerActions: [],
            currentPermissions: [],
            onHeaderAction: null,
            ...options
        };

        this.panel = this.root?.querySelector('[data-detail-panel]') || this.root;
        this.form = this.panel?.querySelector('[data-catalog-form]');
        this.title = this.panel?.querySelector('[data-detail-title]');
        this.subtitle = this.panel?.querySelector('[data-detail-subtitle]');
        this.editButton = this.panel?.querySelector('[data-detail-edit]');
        this.headerActions = this.panel?.querySelector('[data-detail-header-actions]');
        this.currentHeaderActions = [];
        this.permissionSet = new Set(
            (Array.isArray(this.options.currentPermissions) ? this.options.currentPermissions : [])
                .map((item) =>
                    String(item || '')
                        .trim()
                        .toUpperCase()
                )
                .filter(Boolean)
        );

        this.closeButtons = this.panel?.querySelectorAll(['[data-detail-back]'].join(','));

        this.mode = 'view';
        this.record = null;

        this.bindEvents();
    }

    bindEvents() {
        this.editButton?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (!this.record) {
                return;
            }

            this.options.onEdit?.(this.record, this);
        });

        this.closeButtons?.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                this.close();

                this.options.onClose?.(this);
            });
        });

        this.headerActions?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-detail-header-action]');

            if (!button || button.disabled) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const actionName = button.dataset.action;

            const action = this.currentHeaderActions.find((item) => item.action === actionName);

            if (!action) {
                return;
            }

            this.options.onHeaderAction?.({
                action: actionName,

                config: action,

                mode: this.mode,

                record: this.record,

                panel: this
            });
        });
    }

    getHeaderActions() {
        const source =
            typeof this.options.headerActions === 'function'
                ? this.options.headerActions({
                      mode: this.mode,

                      record: this.record,

                      panel: this,

                      permissions: this.permissionSet
                  })
                : this.options.headerActions;

        return Array.isArray(source) ? source : [];
    }

    hasHeaderActionPermission(action) {
        const permissions = action.permission
            ? [action.permission]
            : Array.isArray(action.permissions)
              ? action.permissions
              : [];

        if (permissions.length === 0) {
            return true;
        }

        const normalized = permissions
            .map((item) =>
                String(item || '')
                    .trim()
                    .toUpperCase()
            )
            .filter(Boolean);

        if (action.permissionMode === 'all') {
            return normalized.every((code) => this.permissionSet.has(code));
        }

        return normalized.some((code) => this.permissionSet.has(code));
    }

    isHeaderActionVisible(action) {
        if (!action || !action.action) {
            return false;
        }

        if (Array.isArray(action.modes) && !action.modes.includes(this.mode)) {
            return false;
        }

        if (!this.hasHeaderActionPermission(action)) {
            return false;
        }

        if (typeof action.when === 'function') {
            return (
                action.when({
                    mode: this.mode,

                    record: this.record,

                    panel: this,

                    permissions: this.permissionSet
                }) === true
            );
        }

        return true;
    }

    isHeaderActionDisabled(action) {
        if (typeof action.disabled === 'function') {
            return (
                action.disabled({
                    mode: this.mode,

                    record: this.record,

                    panel: this,

                    permissions: this.permissionSet
                }) === true
            );
        }

        return action.disabled === true;
    }

    syncHeaderActions() {
        if (!this.headerActions) {
            return;
        }

        const actions = this.getHeaderActions().filter((action) => this.isHeaderActionVisible(action));

        this.currentHeaderActions = actions;

        this.headerActions.replaceChildren();

        this.headerActions.hidden = actions.length === 0;

        actions.forEach((action) => {
            const button = document.createElement('button');

            button.type = 'button';

            button.className = [
                'detail-panel__header-action',

                `detail-panel__header-action--${action.variant || 'secondary'}`
            ].join(' ');

            button.dataset.detailHeaderAction = '';

            button.dataset.action = action.action;

            button.disabled = this.isHeaderActionDisabled(action);

            if (action.title) {
                button.title = action.title;
            }

            if (action.icon) {
                const icon = document.createElement('i');

                icon.className = action.icon;

                icon.setAttribute('aria-hidden', 'true');

                button.appendChild(icon);
            }

            if (action.label) {
                const label = document.createElement('span');

                label.textContent = action.label;

                button.appendChild(label);
            }

            this.headerActions.appendChild(button);
        });
    }

    setHeaderActions(actions) {
        this.options.headerActions = actions || [];

        this.syncHeaderActions();
    }

    showDefault({ title, subtitle = '' } = {}) {
        this.mode = 'view';
        this.record = null;

        if (this.form) {
            this.form.hidden = false;
        }

        if (this.panel) {
            this.panel.dataset.mode = 'view';
        }

        this.setTitle(title || this.options.defaultTitle);

        this.setSubtitle(subtitle);

        if (this.editButton) {
            this.editButton.hidden = true;
        }

        this.syncHeaderActions();
        this.close();
    }

    showPlaceholder(options = {}) {
        this.showDefault(options);
    }

    showForm({ mode = 'view', record = null, title, subtitle = '' } = {}) {
        this.mode = mode;
        this.record = record;

        if (this.form) {
            this.form.hidden = false;
        }

        if (this.panel) {
            this.panel.dataset.mode = mode;
        }

        this.setTitle(title || this.getModeTitle(mode));

        this.setSubtitle(subtitle);

        if (this.editButton) {
            this.editButton.hidden = mode !== 'view' || !record;
        }

        this.syncHeaderActions();
        this.open();
    }

    getModeTitle(mode) {
        const titles = {
            view: this.options.defaultTitle,
            create: 'Thêm mới',
            update: 'Cập nhật'
        };

        return titles[mode] || this.options.defaultTitle;
    }

    setTitle(value) {
        if (!this.title) {
            return;
        }

        this.title.textContent = value || this.options.defaultTitle;
    }

    setSubtitle(value) {
        if (!this.subtitle) {
            return;
        }

        this.subtitle.textContent = value || '';
        this.subtitle.hidden = !value;
    }

    openMobile() {
        if (!this.isMobile()) {
            return;
        }

        this.root?.classList.add('is-open');

        document.body.classList.add('catalog-panel-open');
    }

    closeMobile() {
        this.root?.classList.remove('is-open');

        document.body.classList.remove('catalog-panel-open');
    }

    open() {
        if (!this.root) {
            return;
        }

        this.root.hidden = false;

        this.root.classList.add('is-open');

        this.root.dataset.panelMode = this.mode;

        if (this.isMobile()) {
            document.body.classList.add('catalog-panel-open');
        }
    }

    setExpanded(expanded) {
        this.root?.classList.toggle('is-expanded', Boolean(expanded));
    }

    close() {
        if (!this.root) {
            return;
        }

        this.root.classList.remove('is-expanded');

        if (!this.isMobile()) {
            return;
        }

        this.root.classList.remove('is-open');

        this.root.hidden = true;
        this.root.dataset.panelMode = 'closed';

        document.body.classList.remove('catalog-panel-open');
    }

    isMobile() {
        return window.innerWidth <= this.options.mobileBreakpoint;
    }
}

window.MCS.catalog.DetailPanel = MCSDetailPanel;
