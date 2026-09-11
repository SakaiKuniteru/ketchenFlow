'use strict';

window.MCS = window.MCS || {};
window.MCS.catalog = window.MCS.catalog || {};

class MCSCatalogToolbar {
    constructor(root, options = {}) {
        this.root = typeof root === 'string' ? document.querySelector(root) : root;

        this.options = {
            actions: [],
            onAction: null,
            ...options
        };
        this.permissions = this.getPermissions();
        this.elements = {
            utility: this.root?.querySelector('[data-catalog-utility]'),
            toggle: this.root?.querySelector('[data-catalog-utility-toggle]'),
            menu: this.root?.querySelector('[data-catalog-utility-menu]')
        };

        this.bindEvents();
        this.renderActions();
    }

    setActions(actions = []) {
        this.options.actions = Array.isArray(actions) ? actions : [];
        this.renderActions();
    }

    getPermissions() {
        const value = this.root?.dataset?.permissions || '';

        return new Set(
            String(value)
                .split(',')
                .map((permission) =>
                    String(permission || '')
                        .trim()
                        .toUpperCase()
                )
                .filter(Boolean)
        );
    }

    hasPermission(permission) {
        const code = String(permission || '')
            .trim()
            .toUpperCase();

        if (!code) {
            return true;
        }

        return this.permissions.has(code);
    }

    canRenderAction(action) {
        if (!action || action.hidden === true) {
            return false;
        }

        if (action.permission) {
            return this.hasPermission(action.permission);
        }

        const actionName = String(action.action || '')
            .trim()
            .toLowerCase();

        if (actionName === 'import' || actionName.startsWith('import-')) {
            return this.hasPermission('Q100002');
        }

        if (actionName === 'export' || actionName.startsWith('export-')) {
            return this.hasPermission('Q100001');
        }

        return true;
    }

    renderActions() {
        const menu = this.elements.menu;

        if (!menu) {
            return;
        }

        menu.querySelectorAll('[data-catalog-toolbar-dynamic]').forEach((element) => element.remove());

        this.options.actions
            .filter((action) => this.canRenderAction(action))
            .forEach((action) => {
                const button = document.createElement('button');

                button.type = 'button';

                button.className = ['catalog-toolbar__utility-item', action.className || ''].filter(Boolean).join(' ');

                button.dataset.catalogToolbarDynamic = 'true';
                button.dataset.catalogToolbarAction = String(action.action || '');

                if (action.title) {
                    button.title = action.title;
                }

                if (action.disabled === true) {
                    button.disabled = true;
                }

                const icon = this.renderIcon(action.icon);

                button.innerHTML = `
                    ${icon}

                    <span>
                        ${this.escapeHtml(action.label || action.action || '')}
                    </span>
                `;

                menu.appendChild(button);
            });
    }

    bindEvents() {
        this.elements.toggle?.addEventListener('click', (event) => {
            event.preventDefault();
            event.stopPropagation();

            const menu = this.elements.menu;

            if (!menu) {
                return;
            }

            const open = menu.hidden;

            menu.hidden = !open;

            this.elements.toggle?.setAttribute('aria-expanded', String(open));
        });

        this.elements.menu?.addEventListener('click', (event) => {
            const button = event.target.closest('[data-catalog-toolbar-action]');

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const action = button.dataset.catalogToolbarAction;

            if (!action) {
                return;
            }

            this.close();

            this.options.onAction?.(action, button, this);
        });

        document.addEventListener('click', (event) => {
            if (!this.elements.utility || !this.elements.menu) {
                return;
            }

            if (this.elements.utility.contains(event.target)) {
                return;
            }

            this.close();
        });
    }

    close() {
        if (!this.elements.menu) {
            return;
        }

        this.elements.menu.hidden = true;

        this.elements.toggle?.setAttribute('aria-expanded', 'false');
    }

    renderIcon(icon) {
        if (icon === 'search') {
            return `
                <svg
                    class="catalog-toolbar__utility-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true">
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                </svg>
            `;
        }

        if (icon === 'upload') {
            return `
                <svg
                    class="catalog-toolbar__utility-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true">
                    <path d="M16 16l-4-4-4 4"></path>
                    <path d="M12 12v9"></path>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                    <path d="M16 16l-4-4-4 4"></path>

                </svg>
            `;
        }

        if (icon === 'download') {
            return `
                <svg
                    class="catalog-toolbar__utility-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true">
                    <path d="M8 17l4 4 4-4"></path>
                    <path d="M12 12v9"></path>
                    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>

                </svg>
            `;
        }

        if (!icon) {
            return '';
        }

        return `
            <i
                class="${this.escapeHtml(icon)}"
                aria-hidden="true">
            </i>
        `;
    }

    escapeHtml(value) {
        const div = document.createElement('div');

        div.textContent = String(value ?? '');

        return div.innerHTML;
    }
}

window.MCS.catalog.Toolbar = MCSCatalogToolbar;
