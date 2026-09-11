'use strict';

(function initializeSearchPickerComponent(window, document) {
    window.MCS = window.MCS || {};

    function normalizeText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/đ/g, 'd')
            .replace(/Đ/g, 'D')
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function getInitials(value) {
        return normalizeText(value)
            .split(' ')
            .filter(Boolean)
            .map((word) => word.charAt(0))
            .join('');
    }

    function getCompactText(value) {
        return normalizeText(value).replace(/\s+/g, '');
    }

    function buildSearchValues(item) {
        const label = normalizeText(item.label);

        const labelWords = label.split(' ').filter(Boolean);

        const initials = labelWords.map((word) => word.charAt(0)).join('');

        const compact = labelWords.join('');

        const phrases = [];

        for (let start = 0; start < labelWords.length; start++) {
            let phrase = '';

            for (let end = start; end < labelWords.length; end++) {
                phrase += (phrase ? ' ' : '') + labelWords[end];

                phrases.push(phrase);
            }
        }

        const customKeywords = Array.isArray(item.keywords) ? item.keywords.map(normalizeText).filter(Boolean) : [];

        return [label, compact, initials, ...labelWords, ...phrases, ...customKeywords].filter(Boolean);
    }

    function getSearchScore(item, query) {
        const normalizedQuery = normalizeText(query);

        if (!normalizedQuery) {
            return 1;
        }

        const compactQuery = getCompactText(normalizedQuery);

        const values = buildSearchValues(item);

        let bestScore = 0;

        values.forEach((value) => {
            const compactValue = getCompactText(value);

            if (value === normalizedQuery || compactValue === compactQuery) {
                bestScore = Math.max(bestScore, 1000);

                return;
            }

            if (value.startsWith(normalizedQuery)) {
                bestScore = Math.max(bestScore, 850);
            }

            if (compactValue.startsWith(compactQuery)) {
                bestScore = Math.max(bestScore, 800);
            }

            if (value.includes(normalizedQuery)) {
                bestScore = Math.max(bestScore, 650);
            }

            if (compactValue.includes(compactQuery)) {
                bestScore = Math.max(bestScore, 600);
            }

            if (compactQuery.length >= 2 && isSubsequence(compactQuery, compactValue)) {
                bestScore = Math.max(bestScore, 450);
            }

            const queryWords = normalizedQuery.split(' ').filter(Boolean);

            const valueWords = value.split(' ').filter(Boolean);

            const wordPrefixMatch = queryWords.every((queryWord) =>
                valueWords.some((valueWord) => valueWord.startsWith(queryWord))
            );

            if (wordPrefixMatch) {
                bestScore = Math.max(bestScore, 750);
            }
        });

        return bestScore;
    }

    function isSubsequence(query, value) {
        if (!query || !value) {
            return false;
        }

        let queryIndex = 0;

        for (let valueIndex = 0; valueIndex < value.length; valueIndex++) {
            if (value[valueIndex] === query[queryIndex]) {
                queryIndex++;
            }

            if (queryIndex === query.length) {
                return true;
            }
        }

        return false;
    }

    function create(root, options = {}) {
        if (!root || root.searchPicker) {
            return root?.searchPicker;
        }

        const input = root.querySelector('[data-search-picker-input]');

        const dropdown = root.querySelector('[data-search-picker-dropdown]');

        const list = root.querySelector('[data-search-picker-list]');

        const empty = root.querySelector('[data-search-picker-empty]');

        if (!input || !dropdown || !list) {
            return null;
        }

        const state = {
            items: Array.isArray(options.items) ? options.items : [],
            filteredItems: [],
            activeIndex: -1
        };

        function open() {
            dropdown.hidden = false;

            root.classList.add('is-open');

            input.setAttribute('aria-expanded', 'true');
        }

        function close() {
            dropdown.hidden = true;

            root.classList.remove('is-open');

            input.setAttribute('aria-expanded', 'false');

            state.activeIndex = -1;
        }

        function select(item) {
            if (!item) {
                return;
            }

            if (typeof options.onSelect === 'function') {
                options.onSelect(item);

                return;
            }

            if (item.url) {
                window.location.href = item.url;
            }
        }

        function setActiveIndex(index) {
            const optionElements = list.querySelectorAll('[data-search-picker-option]');

            if (!optionElements.length) {
                state.activeIndex = -1;

                return;
            }

            let nextIndex = index;

            if (nextIndex < 0) {
                nextIndex = optionElements.length - 1;
            }

            if (nextIndex >= optionElements.length) {
                nextIndex = 0;
            }

            state.activeIndex = nextIndex;

            optionElements.forEach((element, elementIndex) => {
                const active = elementIndex === nextIndex;

                element.classList.toggle('is-active', active);

                element.setAttribute('aria-selected', active ? 'true' : 'false');
            });

            optionElements[nextIndex]?.scrollIntoView({
                block: 'nearest'
            });
        }

        function render(items) {
            list.innerHTML = '';

            state.filteredItems = items;

            if (!items.length) {
                if (empty) {
                    empty.hidden = false;
                }

                state.activeIndex = -1;

                open();

                return;
            }

            if (empty) {
                empty.hidden = true;
            }

            let currentGroup = null;

            items.forEach((item, index) => {
                if (item.group && item.group !== currentGroup) {
                    currentGroup = item.group;

                    const groupElement = document.createElement('div');

                    groupElement.className = 'search-picker__group';

                    groupElement.textContent = currentGroup;

                    list.appendChild(groupElement);
                }

                const button = document.createElement('button');

                button.type = 'button';

                button.className = 'search-picker__option';

                button.dataset.searchPickerOption = String(index);

                button.setAttribute('role', 'option');

                button.innerHTML = `
                        <span
                            class="search-picker__option-information">

                            <span
                                class="search-picker__option-label">
                            </span>

                        </span>
                    `;

                const label = button.querySelector('.search-picker__option-label');

                if (label) {
                    label.textContent = item.label || '';
                }

                button.addEventListener('mouseenter', () => {
                    setActiveIndex(index);
                });

                button.addEventListener('click', () => {
                    select(item);
                });

                list.appendChild(button);
            });

            open();

            setActiveIndex(0);
        }

        function search() {
            const query = input.value;

            const results = state.items
                .map((item) => ({
                    item,
                    score: getSearchScore(item, query)
                }))
                .filter((result) => result.score > 0)
                .sort((first, second) => second.score - first.score)
                .map((result) => result.item);

            render(results);
        }

        function setItems(items) {
            state.items = Array.isArray(items) ? items : [];

            if (document.activeElement === input) {
                search();
            }
        }

        input.addEventListener('focus', search);

        input.addEventListener('input', search);

        input.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();

                setActiveIndex(state.activeIndex + 1);

                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();

                setActiveIndex(state.activeIndex - 1);

                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();

                const item = state.filteredItems[state.activeIndex];

                select(item);

                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();

                close();

                input.blur();
            }
        });

        document.addEventListener('click', (event) => {
            if (!root.contains(event.target)) {
                close();
            }
        });

        const api = {
            open,
            close,
            search,
            setItems,

            focus() {
                input.focus();
                input.select();
            },

            getItems() {
                return [...state.items];
            }
        };

        document.addEventListener('keydown', (event) => {
            const isShortcut = (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k';

            if (!isShortcut) {
                return;
            }

            event.preventDefault();

            api.focus();
        });

        root.searchPicker = api;

        return api;
    }

    function initialize(root, options = {}) {
        return create(root, options);
    }

    window.MCS.searchPicker = {
        initialize,
        normalizeText,
        getInitials,
        getSearchScore
    };
})(window, document);
