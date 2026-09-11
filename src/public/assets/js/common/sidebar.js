'use strict';

(function initializeSidebar() {
    const sidebar = document.querySelector('[data-app-sidebar]');
    if (!sidebar) {
        return;
    }
    const mainToggle = document.querySelector('[data-sidebar-main-toggle]');
    const overlay = document.querySelector('[data-sidebar-overlay]');
    const searchInput = sidebar.querySelector('[data-list-search]');
    const searchClear = sidebar.querySelector('[data-list-clear-search]');
    const expandToggleButton = sidebar.querySelector('[data-sidebar-expand-toggle]');
    const expandToggleLabel = sidebar.querySelector('[data-sidebar-expand-label]');
    const expandToggleIcon = sidebar.querySelector('[data-sidebar-expand-icon]');
    const sortStartButton = sidebar.querySelector('[data-sidebar-sort-start]');
    const sortActions = sidebar.querySelector('[data-sidebar-sort-actions]');
    const sortSaveButton = sidebar.querySelector('[data-sidebar-sort-save]');
    const sortResetButton = sidebar.querySelector('[data-sidebar-sort-reset]');
    const sortCancelButton = sidebar.querySelector('[data-sidebar-sort-cancel]');
    const SIDEBAR_ORDER_KEY = 'kitchenflow.sidebar.order';
    let sortMode = false;
    let sortSnapshot = null;
    let systemOrder = null;
    let openStateBeforeSort = null;

    function isMobile() {
        return window.innerWidth <= 1024;
    }

    async function getSidebarDongMacDinh() {
        try {
            const result = await window.MCS?.api?.request('/api/mcs/v1/thiet-lap/gia-tri?ma=SIDEBAR_MAC_DINH_DONG');

            const data = result?.data ?? result;

            return data?.giaTri === true;
        } catch (error) {
            return false;
        }
    }

    async function applySidebarDefaultState() {
        if (isMobile()) {
            document.body.classList.remove('sidebar-open');
            document.body.classList.remove('sidebar-hidden');

            if (overlay) {
                overlay.hidden = true;
            }

            mainToggle?.setAttribute('aria-expanded', 'false');

            return;
        }

        const dongMacDinh = await getSidebarDongMacDinh();

        document.body.classList.toggle('sidebar-hidden', dongMacDinh);

        mainToggle?.setAttribute('aria-expanded', String(!dongMacDinh));
    }

    function openMobileSidebar() {
        document.body.classList.add('sidebar-open');

        if (overlay) {
            overlay.hidden = false;
        }

        mainToggle?.setAttribute('aria-expanded', 'true');
    }

    function closeMobileSidebar() {
        document.body.classList.remove('sidebar-open');

        if (overlay) {
            overlay.hidden = true;
        }

        mainToggle?.setAttribute('aria-expanded', 'false');
    }

    mainToggle?.addEventListener('click', (event) => {
        event.preventDefault();

        if (isMobile()) {
            const opened = document.body.classList.contains('sidebar-open');

            if (opened) {
                closeMobileSidebar();
            } else {
                openMobileSidebar();
            }

            return;
        }

        const hidden = document.body.classList.toggle('sidebar-hidden');

        mainToggle.setAttribute('aria-expanded', String(!hidden));
    });

    overlay?.addEventListener('click', closeMobileSidebar);

    window.addEventListener('resize', () => {
        if (!isMobile()) {
            closeMobileSidebar();

            if (overlay) {
                overlay.hidden = true;
            }
        }
    });

    function getGroupButtons() {
        return Array.from(sidebar.querySelectorAll('[data-sidebar-toggle]'));
    }

    function getSubmenus() {
        return Array.from(sidebar.querySelectorAll('[data-sidebar-submenu]'));
    }

    function setGroupOpen(name, open) {
        const button = sidebar.querySelector(`[data-sidebar-toggle="${name}"]`);

        const submenu = sidebar.querySelector(`[data-sidebar-submenu="${name}"]`);

        if (!button || !submenu) {
            return;
        }

        submenu.hidden = !open;

        button.setAttribute('aria-expanded', String(open));

        button.classList.toggle('is-open', open);
    }

    function closeAllGroups(exceptName = null) {
        getGroupButtons().forEach((button) => {
            const name = button.dataset.sidebarToggle;

            if (name === exceptName) {
                return;
            }

            setGroupOpen(name, false);
        });
    }

    function expandAllGroups() {
        getGroupButtons().forEach((button) => {
            setGroupOpen(button.dataset.sidebarToggle, true);
        });

        updateExpandToggle();
    }

    function collapseAllGroups() {
        closeAllGroups();

        updateExpandToggle();
    }

    function hasOpenedGroup() {
        return getGroupButtons().some((button) => button.getAttribute('aria-expanded') === 'true');
    }

    function updateExpandToggle() {
        if (!expandToggleButton) {
            return;
        }

        const hasOpen = hasOpenedGroup();

        expandToggleButton.dataset.mode = hasOpen ? 'collapse' : 'expand';

        if (expandToggleLabel) {
            expandToggleLabel.textContent = hasOpen ? 'Thu gọn' : 'Mở rộng';
        }

        if (expandToggleIcon) {
            expandToggleIcon.className = hasOpen ? 'fa-solid fa-angles-up' : 'fa-solid fa-angles-down';
        }
    }

    expandToggleButton?.addEventListener('click', (event) => {
        event.preventDefault();

        if (hasOpenedGroup()) {
            collapseAllGroups();
        } else {
            expandAllGroups();
        }
    });

    sidebar.addEventListener('click', (event) => {
        const groupButton = event.target.closest('[data-sidebar-toggle]');

        if (groupButton) {
            if (event.target.closest('[data-sidebar-drag-handle]')) {
                return;
            }

            event.preventDefault();

            const name = groupButton.dataset.sidebarToggle;

            const isOpen = groupButton.getAttribute('aria-expanded') === 'true';

            setGroupOpen(name, !isOpen);

            updateExpandToggle();

            return;
        }

        const link = event.target.closest('a[href]');

        if (link && isMobile()) {
            closeMobileSidebar();
        }
    });

    function normalizePath(path) {
        if (!path) {
            return '/';
        }

        let value = String(path).split('?')[0].split('#')[0];

        if (value.length > 1 && value.endsWith('/')) {
            value = value.slice(0, -1);
        }

        return value || '/';
    }

    function applySidebarPermissions(currentUser = null) {
        const navigation = window.MCS.navigation;

        if (!navigation) {
            return;
        }

        const user = currentUser || window.MCS.storage?.getCurrentUser?.() || null;

        sidebar.querySelectorAll('a[data-sidebar-link][href]').forEach((link) => {
            const href = link.getAttribute('href');

            const navigationItem = navigation.findByUrl(href);

            const allowed = navigationItem ? navigation.canAccess(navigationItem, user) : false;

            const item = link.closest('li');

            if (item) {
                item.hidden = !allowed;
            }
        });

        sidebar.querySelectorAll('[data-sidebar-group-item]').forEach((group) => {
            const submenu = group.querySelector(':scope > ' + '[data-sidebar-submenu]');

            if (!submenu) {
                group.hidden = true;

                return;
            }

            const children = Array.from(submenu.children);

            const hasAllowedChild = children.some((item) => item.hidden !== true);

            group.hidden = !hasAllowedChild;

            if (!hasAllowedChild) {
                const button = group.querySelector(':scope > ' + '[data-sidebar-toggle]');

                if (button) {
                    setGroupOpen(button.dataset.sidebarToggle, false);
                }
            }
        });

        activateCurrentMenu();

        updateExpandToggle();
    }

    function activateCurrentMenu() {
        const currentPath = normalizePath(window.location.pathname);

        const links = Array.from(sidebar.querySelectorAll('a[data-sidebar-link][href]'));

        links.forEach((link) => {
            link.classList.remove('is-active');
        });

        let bestMatch = null;

        links.forEach((link) => {
            const href = normalizePath(link.getAttribute('href'));

            let matched = false;

            if (href === '/') {
                matched = currentPath === '/';
            } else {
                matched = currentPath === href || currentPath.startsWith(`${href}/`);
            }

            if (!matched) {
                return;
            }

            if (!bestMatch || href.length > bestMatch.href.length) {
                bestMatch = {
                    link,
                    href
                };
            }
        });

        if (!bestMatch) {
            return;
        }

        bestMatch.link.classList.add('is-active');

        const group = bestMatch.link.closest('[data-sidebar-group-item]');

        const groupButton = group?.querySelector(':scope > [data-sidebar-toggle]');

        if (groupButton) {
            setGroupOpen(groupButton.dataset.sidebarToggle, true);
        }
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .trim();
    }

    function getSidebarSearchScore(value, query) {
        const searchPicker = window.MCS?.searchPicker;
        if (searchPicker && typeof searchPicker.getSearchScore === 'function') {
            return searchPicker.getSearchScore(
                {
                    label: String(value || '').trim()
                },
                query
            );
        }
        const normalizedValue = normalizeSearchText(value);
        const normalizedQuery = normalizeSearchText(query);
        if (!normalizedQuery) {
            return 1;
        }
        return normalizedValue.includes(normalizedQuery) ? 1 : 0;
    }

    function searchSidebar(value) {
        const keyword = String(value || '').trim();

        if (searchClear) {
            searchClear.hidden = !keyword;
        }

        const rootItem = sidebar.querySelector('.app-sidebar__menu > ' + '.app-sidebar__menu-item');

        if (rootItem) {
            const rootLink = rootItem.querySelector('[data-sidebar-link]');

            const score = getSidebarSearchScore(rootLink?.textContent, keyword);

            rootItem.classList.toggle('is-search-hidden', Boolean(keyword) && score <= 0);
        }

        sidebar.querySelectorAll('[data-sidebar-group-item]').forEach((group) => {
            const button = group.querySelector(':scope > ' + '[data-sidebar-toggle]');

            const submenu = group.querySelector(':scope > ' + '[data-sidebar-submenu]');

            if (!button || !submenu) {
                return;
            }

            const groupScore = getSidebarSearchScore(button.textContent, keyword);

            const groupMatched = !keyword || groupScore > 0;

            let childMatched = false;

            Array.from(submenu.children).forEach((item) => {
                if (item.hidden) {
                    return;
                }

                const link = item.querySelector('[data-sidebar-link]');

                const childScore = getSidebarSearchScore(link?.textContent, keyword);

                const matched = !keyword || groupMatched || childScore > 0;

                item.classList.toggle('is-search-hidden', !matched);

                if (keyword && childScore > 0) {
                    childMatched = true;
                }
            });

            const visible = !keyword || groupMatched || childMatched;

            group.classList.toggle('is-search-hidden', !visible);

            if (keyword && visible) {
                setGroupOpen(button.dataset.sidebarToggle, true);
            }
        });

        if (!keyword) {
            collapseAllGroups();
            activateCurrentMenu();
        }

        updateExpandToggle();
    }

    searchInput?.addEventListener('input', (event) => {
        searchSidebar(event.target.value);
    });

    searchClear?.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }

        searchSidebar('');
    });

    document.addEventListener('keydown', (event) => {
        if (event.key !== 'Escape' || document.activeElement !== searchInput) {
            return;
        }

        if (searchInput.value) {
            searchInput.value = '';
            searchSidebar('');
            return;
        }

        searchInput.blur();
    });

    function getSortableContainers() {
        return [
            sidebar.querySelector('.app-sidebar__menu'),
            ...sidebar.querySelectorAll('[data-sidebar-submenu]')
        ].filter(Boolean);
    }

    function getContainerKey(container) {
        if (container.classList.contains('app-sidebar__menu')) {
            return 'root';
        }

        if (container.dataset.sidebarSubmenu) {
            return 'submenu:' + container.dataset.sidebarSubmenu;
        }

        return null;
    }

    function getSortableKey(item) {
        const groupButton = item.querySelector(':scope > ' + '[data-sidebar-toggle]');

        if (groupButton) {
            return 'group:' + groupButton.dataset.sidebarToggle;
        }

        const link = item.querySelector(':scope > ' + '[data-sidebar-link]');

        if (link) {
            return 'link:' + link.dataset.sidebarLink;
        }

        return null;
    }

    function captureSidebarOrder() {
        const result = {};

        getSortableContainers().forEach((container) => {
            const key = getContainerKey(container);

            if (!key) {
                return;
            }

            result[key] = Array.from(container.children).map(getSortableKey).filter(Boolean);
        });

        return result;
    }

    function applySidebarOrder(state) {
        if (!state) {
            return;
        }

        getSortableContainers().forEach((container) => {
            const key = getContainerKey(container);
            const order = state[key];

            if (!Array.isArray(order)) {
                return;
            }

            order.forEach((itemKey) => {
                const item = Array.from(container.children).find((child) => getSortableKey(child) === itemKey);

                if (item) {
                    container.appendChild(item);
                }
            });
        });
    }

    function saveSidebarOrder() {
        localStorage.setItem(SIDEBAR_ORDER_KEY, JSON.stringify(captureSidebarOrder()));
    }

    function restoreSidebarOrder() {
        try {
            const saved = JSON.parse(localStorage.getItem(SIDEBAR_ORDER_KEY));

            if (saved) {
                applySidebarOrder(saved);
            }
        } catch {
            localStorage.removeItem(SIDEBAR_ORDER_KEY);
        }
    }

    function captureOpenState() {
        return getGroupButtons().map((button) => ({
            name: button.dataset.sidebarToggle,
            open: button.getAttribute('aria-expanded') === 'true'
        }));
    }

    function restoreOpenState(state) {
        if (!Array.isArray(state)) {
            return;
        }

        closeAllGroups();

        state.forEach((item) => {
            if (item.open) {
                setGroupOpen(item.name, true);
            }
        });

        updateExpandToggle();
    }

    function removeDragHandles() {
        sidebar.querySelectorAll('[data-sidebar-drag-handle]').forEach((handle) => handle.remove());
    }

    function createDragHandles() {
        removeDragHandles();

        getSortableContainers().forEach((container) => {
            Array.from(container.children).forEach((item) => {
                if (!getSortableKey(item)) {
                    return;
                }

                const target = item.querySelector(':scope > button, ' + ':scope > a');

                if (!target) {
                    return;
                }

                const handle = document.createElement('span');

                handle.className = 'app-sidebar__drag-handle';

                handle.dataset.sidebarDragHandle = '';

                handle.innerHTML = '<i class="fa-solid fa-grip-vertical"></i>';

                handle.draggable = true;

                target.appendChild(handle);
            });
        });
    }

    function getDragAfterElement(container, y) {
        const elements = Array.from(container.children).filter((element) => !element.classList.contains('is-dragging'));

        return elements.reduce(
            (closest, element) => {
                const box = element.getBoundingClientRect();

                const offset = y - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) {
                    return {
                        offset,
                        element
                    };
                }

                return closest;
            },
            {
                offset: Number.NEGATIVE_INFINITY,
                element: null
            }
        ).element;
    }

    function startSorting() {
        if (sortMode) {
            return;
        }

        if (searchInput) {
            searchInput.value = '';

            searchSidebar('');

            searchInput.disabled = true;
        }

        sortSnapshot = captureSidebarOrder();
        openStateBeforeSort = captureOpenState();
        sortMode = true;

        sidebar.classList.add('is-sorting');

        if (sortActions) {
            sortActions.hidden = false;
        }

        collapseAllGroups();
        createDragHandles();
    }

    function finishSorting() {
        sortMode = false;

        sidebar.classList.remove('is-sorting');

        removeDragHandles();

        if (sortActions) {
            sortActions.hidden = true;
        }

        if (searchInput) {
            searchInput.disabled = false;
        }

        restoreOpenState(openStateBeforeSort);

        activateCurrentMenu();

        sortSnapshot = null;
        openStateBeforeSort = null;
    }

    sidebar.addEventListener('dragstart', (event) => {
        if (!sortMode) {
            return;
        }

        const handle = event.target.closest('[data-sidebar-drag-handle]');

        if (!handle) {
            return;
        }

        const item = handle.closest('li');

        if (!item) {
            return;
        }

        item.classList.add('is-dragging');

        event.dataTransfer.setData('text/plain', getSortableKey(item) || '');

        event.dataTransfer.effectAllowed = 'move';
    });

    sidebar.addEventListener('dragover', (event) => {
        if (!sortMode) {
            return;
        }

        const dragging = sidebar.querySelector('.is-dragging');

        if (!dragging) {
            return;
        }

        const container = event.target.closest('.app-sidebar__menu, ' + '[data-sidebar-submenu]');

        if (!container || dragging.parentElement !== container) {
            return;
        }

        event.preventDefault();

        const after = getDragAfterElement(container, event.clientY);

        if (after) {
            container.insertBefore(dragging, after);
        } else {
            container.appendChild(dragging);
        }
    });

    sidebar.addEventListener('dragend', () => {
        sidebar.querySelector('.is-dragging')?.classList.remove('is-dragging');
    });

    sortStartButton?.addEventListener('click', (event) => {
        event.preventDefault();

        startSorting();
    });

    sortSaveButton?.addEventListener('click', () => {
        saveSidebarOrder();

        finishSorting();
    });

    sortCancelButton?.addEventListener('click', () => {
        applySidebarOrder(sortSnapshot);

        finishSorting();
    });

    sortResetButton?.addEventListener('click', () => {
        applySidebarOrder(systemOrder);
    });

    async function initialize() {
        systemOrder = captureSidebarOrder();
        restoreSidebarOrder();
        applySidebarPermissions();
        collapseAllGroups();
        activateCurrentMenu();
        updateExpandToggle();
        await applySidebarDefaultState();
    }

    window.addEventListener('mcs:current-user-updated', (event) => {
        applySidebarPermissions(event.detail?.currentUser || null);
    });

    initialize();
})();
