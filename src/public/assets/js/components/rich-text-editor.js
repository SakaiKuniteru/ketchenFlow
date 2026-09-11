'use strict';

window.MCS = window.MCS || {};

window.MCS.richTextEditor = (() => {
    const ALLOWED_TAGS = new Set([
        'B',
        'STRONG',
        'I',
        'EM',
        'U',
        'P',
        'DIV',
        'BR',
        'SPAN',
        'A',
        'UL',
        'OL',
        'LI',
        'BLOCKQUOTE'
    ]);

    const FONT_SIZES = [6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 36, 40, 48];

    const AUTO_LINK_END_PATTERN =
        /(?:^|\s)((?:https?:\/\/|www\.)[^\s<]+|(?:localhost(?::\d+)?|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:\/[^\s<]*)?)$/i;

    const AUTO_LINK_PATTERN =
        /(?:https?:\/\/|www\.)[^\s<]+|(?:localhost(?::\d+)?|(?:[a-z0-9-]+\.)+[a-z]{2,})(?::\d+)?(?:\/[^\s<]*)?/gi;

    function initialize(root) {
        if (!root) {
            return null;
        }

        if (root.richTextEditor) {
            return root.richTextEditor;
        }

        const elements = {
            input: root.querySelector('[data-rich-text-input]'),

            content: root.querySelector('[data-rich-text-content]'),

            toolbar: root.querySelector('[data-rich-text-toolbar]'),

            fontSizeRoot: root.querySelector('[data-rich-text-font-size]'),

            fontSize: root.querySelector('[data-rich-text-font-size] select'),

            linkPopup: root.querySelector('[data-rich-text-link-popup]'),

            linkText: root.querySelector('[data-rich-text-link-text]'),

            linkUrl: root.querySelector('[data-rich-text-link-url]'),

            linkSave: root.querySelector('[data-rich-text-link-save]'),

            linkCancel: root.querySelector('[data-rich-text-link-cancel]'),

            linkRemove: root.querySelector('[data-rich-text-link-remove]')
        };

        if (!elements.input || !elements.content) {
            console.error('Rich Text Editor thiếu phần tử bắt buộc.', root);

            return null;
        }

        let savedRange = null;

        let editingLink = null;

        initializeFontSizeSelect();
        bindEvents();

        const api = {
            getValue,

            setValue,

            refresh,

            setDisabled,

            focus() {
                elements.content.focus();
            }
        };

        root.richTextEditor = api;

        elements.input.richTextEditor = api;

        refresh();

        return api;

        function initializeFontSizeSelect() {
            const select = elements.fontSize;

            if (!select) {
                return;
            }

            select.innerHTML = '';

            const emptyOption = document.createElement('option');

            emptyOption.value = '';

            emptyOption.textContent = '';

            select.appendChild(emptyOption);

            FONT_SIZES.forEach((size) => {
                const option = document.createElement('option');

                option.value = String(size);

                option.textContent = String(size);

                select.appendChild(option);
            });

            getFontSizeSmartSelect()?.refresh?.();

            getFontSizeSmartSelect()?.setValue?.('', false);
        }

        function getFontSizeSmartSelect() {
            const select = elements.fontSize;

            if (!select) {
                return null;
            }

            const selectRoot = select.closest('[data-smart-select]');

            if (!selectRoot) {
                return null;
            }

            return selectRoot.smartSelect || window.MCS?.smartSelect?.initialize?.(selectRoot) || null;
        }

        function resetFontSizeSelect() {
            if (!elements.fontSize) {
                return;
            }

            elements.fontSize.value = '';

            getFontSizeSmartSelect()?.setValue?.('', false);
        }

        function bindEvents() {
            elements.content.addEventListener('input', () => {
                saveSelection();

                syncInput(true);
            });

            elements.content.addEventListener('keydown', (event) => {
                if (isDisabled()) {
                    return;
                }

                if (handleListTab(event)) {
                    return;
                }

                handleAutoLinkShortcut(event);

                handleAutoListShortcut(event);
            });

            elements.content.addEventListener('keyup', saveSelection);

            elements.content.addEventListener('mouseup', saveSelection);

            elements.content.addEventListener('focus', saveSelection);

            elements.content.addEventListener('blur', () => {
                autoLinkTextNodes();

                sanitizeEditor();

                syncInput(true);
            });

            elements.content.addEventListener('paste', (event) => {
                if (isDisabled()) {
                    return;
                }

                event.preventDefault();

                const text = event.clipboardData?.getData('text/plain') || '';

                restoreSelection();

                document.execCommand('insertText', false, text);

                syncInput(true);
            });

            elements.content.addEventListener('drop', (event) => {
                event.preventDefault();
            });

            root.querySelectorAll('[data-rich-text-command]').forEach((button) => {
                button.addEventListener('mousedown', (event) => {
                    event.preventDefault();
                });

                button.addEventListener('click', () => {
                    if (isDisabled()) {
                        return;
                    }

                    executeCommand(button.dataset.richTextCommand);
                });
            });

            root.querySelector('[data-rich-text-link]')?.addEventListener('mousedown', (event) => {
                event.preventDefault();
            });

            root.querySelector('[data-rich-text-link]')?.addEventListener('click', () => {
                if (isDisabled()) {
                    return;
                }

                openLinkPopup();
            });

            elements.fontSizeRoot?.addEventListener('mousedown', saveSelection, true);

            elements.fontSize?.addEventListener('change', () => {
                if (isDisabled()) {
                    return;
                }

                const size = Number(elements.fontSize.value);

                if (!Number.isFinite(size) || size <= 0) {
                    return;
                }

                applyFontSize(size);

                resetFontSizeSelect();
            });

            elements.linkSave?.addEventListener('click', applyLinkPopup);

            elements.linkCancel?.addEventListener('click', () => {
                closeLinkPopup(true);
            });

            elements.linkRemove?.addEventListener('click', removeCurrentLink);

            elements.content.addEventListener('click', (event) => {
                const link = event.target?.closest?.('a');

                if (!link || !elements.content.contains(link)) {
                    return;
                }

                if (isDisabled()) {
                    return;
                }

                event.preventDefault();

                event.stopPropagation();

                const range = document.createRange();

                range.selectNodeContents(link);

                savedRange = range.cloneRange();

                openLinkPopup(link);
            });

            const panel = root.closest('[data-detail-panel]');

            if (panel) {
                const observer = new MutationObserver(() => {
                    syncMode();
                });

                observer.observe(panel, {
                    attributes: true,

                    attributeFilter: ['data-mode']
                });
            }
        }

        function handleAutoLinkShortcut(event) {
            if (![' ', 'Enter'].includes(event.key) || event.ctrlKey || event.metaKey || event.altKey) {
                return false;
            }

            const selection = window.getSelection();

            if (
                !selection ||
                selection.rangeCount === 0 ||
                !selection.isCollapsed ||
                !selectionInsideEditor(selection)
            ) {
                return false;
            }

            const range = selection.getRangeAt(0);

            const textNode = range.startContainer;

            if (textNode.nodeType !== Node.TEXT_NODE) {
                return false;
            }

            if (textNode.parentElement?.closest?.('a')) {
                return false;
            }

            const beforeCaret = textNode.data.slice(0, range.startOffset);

            const match = beforeCaret.match(AUTO_LINK_END_PATTERN);

            if (!match) {
                return false;
            }

            const rawUrl = match[1];

            const { urlText, suffix } = splitTrailingUrlCharacters(rawUrl);

            const url = normalizeUrl(urlText);

            if (!url) {
                return false;
            }

            const startOffset = range.startOffset - rawUrl.length;

            const linkRange = document.createRange();

            linkRange.setStart(textNode, startOffset);

            linkRange.setEnd(textNode, startOffset + urlText.length);

            const link = createLinkElement(urlText, url);

            linkRange.deleteContents();

            linkRange.insertNode(link);

            setCaretAfterAutoLink(link, suffix.length);

            saveSelection();

            syncInput(true);

            return true;
        }

        function splitTrailingUrlCharacters(value) {
            let urlText = String(value || '');

            let suffix = '';

            while (/[.,!?;:)\]}]$/.test(urlText)) {
                suffix = urlText.slice(-1) + suffix;

                urlText = urlText.slice(0, -1);
            }

            return {
                urlText,
                suffix
            };
        }

        function setCaretAfterAutoLink(link, suffixLength = 0) {
            const selection = window.getSelection();

            if (!selection) {
                return;
            }

            const range = document.createRange();

            const next = link.nextSibling;

            if (suffixLength > 0 && next?.nodeType === Node.TEXT_NODE && next.data.length >= suffixLength) {
                range.setStart(next, suffixLength);
            } else {
                range.setStartAfter(link);
            }

            range.collapse(true);

            selection.removeAllRanges();

            selection.addRange(range);

            savedRange = range.cloneRange();
        }

        function handleListTab(event) {
            if (event.key !== 'Tab') {
                return false;
            }

            const selection = window.getSelection();

            if (!selection || selection.rangeCount === 0 || !selectionInsideEditor(selection)) {
                return false;
            }

            const node =
                selection.anchorNode?.nodeType === Node.ELEMENT_NODE
                    ? selection.anchorNode
                    : selection.anchorNode?.parentElement;

            const listItem = node?.closest?.('li');

            if (!listItem || !elements.content.contains(listItem)) {
                return false;
            }

            event.preventDefault();

            restoreSelection();

            elements.content.focus();

            document.execCommand(event.shiftKey ? 'outdent' : 'indent', false, null);

            saveSelection();

            syncInput(true);

            return true;
        }

        function handleAutoListShortcut(event) {
            if (event.key !== ' ' || event.ctrlKey || event.metaKey || event.altKey) {
                return;
            }

            const selection = window.getSelection();

            if (
                !selection ||
                selection.rangeCount === 0 ||
                !selection.isCollapsed ||
                !selectionInsideEditor(selection)
            ) {
                return;
            }

            const range = selection.getRangeAt(0);

            const block = getCurrentBlock(range);

            if (!block) {
                return;
            }

            if (block.closest?.('li')) {
                return;
            }

            const textBeforeCaret = getTextBeforeCaret(block, range);

            const unordered = /^(\*|-|\+|•)$/u.test(textBeforeCaret);

            const orderedMatch = textBeforeCaret.match(/^(\d+)[.)]$/);

            if (!unordered && !orderedMatch) {
                return;
            }

            event.preventDefault();

            deleteTextBeforeCaret(block, range);

            restoreCaretAtEnd(block);

            if (unordered) {
                document.execCommand('insertUnorderedList', false, null);
            } else {
                document.execCommand('insertOrderedList', false, null);

                const start = Number(orderedMatch[1]);

                if (Number.isInteger(start) && start > 1) {
                    const currentSelection = window.getSelection();

                    const currentNode =
                        currentSelection?.anchorNode?.nodeType === Node.ELEMENT_NODE
                            ? currentSelection.anchorNode
                            : currentSelection?.anchorNode?.parentElement;

                    const orderedList = currentNode?.closest?.('ol');

                    if (orderedList && elements.content.contains(orderedList)) {
                        orderedList.start = start;
                    }
                }
            }

            saveSelection();

            syncInput(true);
        }

        function autoLinkTextNodes() {
            const walker = document.createTreeWalker(elements.content, NodeFilter.SHOW_TEXT);

            const nodes = [];

            while (walker.nextNode()) {
                const node = walker.currentNode;

                if (node.parentElement?.closest?.('a')) {
                    continue;
                }

                nodes.push(node);
            }

            nodes.forEach((node) => {
                const text = node.nodeValue || '';

                AUTO_LINK_PATTERN.lastIndex = 0;

                let match;

                let lastIndex = 0;

                let changed = false;

                const fragment = document.createDocumentFragment();

                while ((match = AUTO_LINK_PATTERN.exec(text))) {
                    const rawUrl = match[0];

                    const { urlText, suffix } = splitTrailingUrlCharacters(rawUrl);

                    const url = normalizeUrl(urlText);

                    if (!url) {
                        continue;
                    }

                    changed = true;

                    fragment.appendChild(document.createTextNode(text.slice(lastIndex, match.index)));

                    fragment.appendChild(createLinkElement(urlText, url));

                    if (suffix) {
                        fragment.appendChild(document.createTextNode(suffix));
                    }

                    lastIndex = match.index + rawUrl.length;
                }

                if (!changed) {
                    return;
                }

                fragment.appendChild(document.createTextNode(text.slice(lastIndex)));

                node.replaceWith(fragment);
            });
        }

        function getCurrentBlock(range) {
            let node =
                range.startContainer.nodeType === Node.ELEMENT_NODE
                    ? range.startContainer
                    : range.startContainer.parentElement;

            while (node && node !== elements.content) {
                if (['P', 'DIV'].includes(node.tagName)) {
                    return node;
                }

                node = node.parentElement;
            }

            return elements.content;
        }

        function getTextBeforeCaret(block, range) {
            try {
                const beforeRange = document.createRange();

                beforeRange.selectNodeContents(block);

                beforeRange.setEnd(range.startContainer, range.startOffset);

                return beforeRange.toString().trim();
            } catch {
                return '';
            }
        }

        function deleteTextBeforeCaret(block, range) {
            const deleteRange = document.createRange();

            deleteRange.selectNodeContents(block);

            deleteRange.setEnd(range.startContainer, range.startOffset);

            deleteRange.deleteContents();
        }

        function restoreCaretAtEnd(block) {
            const selection = window.getSelection();

            if (!selection) {
                return;
            }

            const range = document.createRange();

            range.selectNodeContents(block);

            range.collapse(false);

            selection.removeAllRanges();

            selection.addRange(range);
        }

        function executeCommand(command) {
            if (!command) {
                return;
            }

            restoreSelection();

            elements.content.focus();

            document.execCommand(command, false, null);

            saveSelection();

            syncInput(true);
        }

        function openLinkPopup(link = null) {
            if (!elements.linkPopup || !elements.linkText || !elements.linkUrl) {
                return;
            }

            editingLink = link;

            let displayText = '';

            if (link) {
                displayText = link.textContent || '';
            } else if (savedRange) {
                displayText = savedRange.toString();
            }

            elements.linkText.value = displayText;

            elements.linkUrl.value = link?.getAttribute('href') || '';

            if (elements.linkRemove) {
                elements.linkRemove.hidden = !link;
            }

            elements.linkPopup.hidden = false;

            window.setTimeout(() => {
                if (displayText) {
                    elements.linkUrl?.focus();
                } else {
                    elements.linkText?.focus();
                }
            }, 0);
        }

        function closeLinkPopup(restoreFocus = false) {
            if (elements.linkPopup) {
                elements.linkPopup.hidden = true;
            }

            editingLink = null;

            if (restoreFocus && savedRange) {
                restoreSelection();

                elements.content.focus();
            }
        }

        function applyLinkPopup() {
            const text = String(elements.linkText?.value || '').trim();

            const rawUrl = String(elements.linkUrl?.value || '').trim();

            const url = normalizeUrl(rawUrl);

            if (!url) {
                window.MCS?.toast?.error('Đường dẫn không hợp lệ.');

                elements.linkUrl?.focus();

                return;
            }

            if (editingLink && elements.content.contains(editingLink)) {
                editingLink.textContent = text || rawUrl;

                setLinkAttributes(editingLink, url);

                setCaretAfterNode(editingLink);
            } else {
                const range = getSavedRange();

                if (!range) {
                    return;
                }

                const selectedText = range.toString();

                const link = createLinkElement(text || selectedText || rawUrl, url);

                range.deleteContents();

                range.insertNode(link);

                setCaretAfterNode(link);
            }

            closeLinkPopup(false);

            saveSelection();

            syncInput(true);
        }

        function removeCurrentLink() {
            if (!editingLink || !elements.content.contains(editingLink)) {
                closeLinkPopup(true);

                return;
            }

            const link = editingLink;

            const parent = link.parentNode;

            if (!parent) {
                return;
            }

            let lastNode = null;

            while (link.firstChild) {
                lastNode = link.firstChild;

                parent.insertBefore(lastNode, link);
            }

            link.remove();

            if (lastNode) {
                setCaretAfterNode(lastNode);
            }

            closeLinkPopup(false);

            saveSelection();

            syncInput(true);
        }

        function createLinkElement(text, url) {
            const link = document.createElement('a');

            link.textContent = text;

            setLinkAttributes(link, url);

            return link;
        }

        function setLinkAttributes(link, url) {
            link.setAttribute('href', url);

            link.setAttribute('target', '_blank');

            link.setAttribute('rel', 'noopener noreferrer');
        }

        function getSavedRange() {
            if (savedRange) {
                const container = savedRange.commonAncestorContainer;

                if (container === elements.content || elements.content.contains(container)) {
                    return savedRange.cloneRange();
                }
            }

            const range = document.createRange();

            range.selectNodeContents(elements.content);

            range.collapse(false);

            return range;
        }

        function setCaretAfterNode(node) {
            if (!node) {
                return;
            }

            const selection = window.getSelection();

            if (!selection) {
                return;
            }

            const range = document.createRange();

            range.setStartAfter(node);

            range.collapse(true);

            selection.removeAllRanges();

            selection.addRange(range);

            savedRange = range.cloneRange();
        }

        function applyFontSize(size) {
            restoreSelection();

            elements.content.focus();

            document.execCommand('fontSize', false, '7');

            elements.content.querySelectorAll('font[size="7"]').forEach((font) => {
                const span = document.createElement('span');

                span.style.fontSize = `${size}px`;

                while (font.firstChild) {
                    span.appendChild(font.firstChild);
                }

                font.replaceWith(span);
            });

            saveSelection();

            syncInput(true);
        }

        function saveSelection() {
            const selection = window.getSelection();

            if (!selection || selection.rangeCount === 0 || !selectionInsideEditor(selection)) {
                return;
            }

            savedRange = selection.getRangeAt(0).cloneRange();
        }

        function restoreSelection() {
            if (!savedRange) {
                return;
            }

            const selection = window.getSelection();

            selection?.removeAllRanges();

            selection?.addRange(savedRange);
        }

        function selectionInsideEditor(selection) {
            return elements.content.contains(selection.anchorNode) && elements.content.contains(selection.focusNode);
        }

        function syncInput(emit = false) {
            const html = sanitizeHtml(elements.content.innerHTML);

            const value = isEmptyHtml(html) ? '' : html;

            elements.input.value = value;

            if (!emit) {
                return;
            }

            elements.input.dispatchEvent(
                new Event('input', {
                    bubbles: true
                })
            );
        }

        function sanitizeEditor() {
            const safeHtml = sanitizeHtml(elements.content.innerHTML);

            if (safeHtml !== elements.content.innerHTML) {
                elements.content.innerHTML = safeHtml;
            }
        }

        function sanitizeHtml(html) {
            const template = document.createElement('template');

            template.innerHTML = String(html || '');

            cleanNode(template.content);

            return template.innerHTML;
        }

        function cleanNode(parent) {
            Array.from(parent.childNodes).forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) {
                    return;
                }

                const tag = node.tagName;

                if (!ALLOWED_TAGS.has(tag)) {
                    const fragment = document.createDocumentFragment();

                    while (node.firstChild) {
                        fragment.appendChild(node.firstChild);
                    }

                    node.replaceWith(fragment);

                    cleanNode(parent);

                    return;
                }

                Array.from(node.attributes).forEach((attribute) => {
                    const name = attribute.name.toLowerCase();

                    if (tag === 'A' && ['href', 'target', 'rel'].includes(name)) {
                        return;
                    }

                    if (name === 'style') {
                        const safeStyle = sanitizeStyle(tag, attribute.value);

                        if (safeStyle) {
                            node.setAttribute('style', safeStyle);

                            return;
                        }
                    }

                    if (tag === 'OL' && name === 'start') {
                        const start = Number(attribute.value);

                        if (Number.isInteger(start) && start > 0) {
                            return;
                        }
                    }

                    node.removeAttribute(attribute.name);
                });

                if (tag === 'A') {
                    const href = normalizeUrl(node.getAttribute('href'));

                    if (!href) {
                        node.removeAttribute('href');
                    } else {
                        node.setAttribute('href', href);

                        node.setAttribute('target', '_blank');

                        node.setAttribute('rel', 'noopener noreferrer');
                    }
                }

                cleanNode(node);
            });
        }

        function sanitizeStyle(tag, value) {
            const style = String(value || '').trim();

            if (!style) {
                return '';
            }

            const safe = [];

            style.split(';').forEach((declaration) => {
                const index = declaration.indexOf(':');

                if (index < 0) {
                    return;
                }

                const property = declaration.slice(0, index).trim().toLowerCase();

                const propertyValue = declaration
                    .slice(index + 1)
                    .trim()
                    .toLowerCase();

                if (
                    tag === 'SPAN' &&
                    property === 'font-size' &&
                    /^(6|8|10|12|14|16|18|20|22|24|26|28|30|32|36|40|48)px$/i.test(propertyValue)
                ) {
                    safe.push(`font-size: ${propertyValue}`);

                    return;
                }

                if (
                    ['P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(tag) &&
                    property === 'text-align' &&
                    ['left', 'center', 'right', 'justify'].includes(propertyValue)
                ) {
                    safe.push(`text-align: ${propertyValue}`);

                    return;
                }

                if (
                    ['P', 'DIV', 'LI', 'BLOCKQUOTE'].includes(tag) &&
                    property === 'margin-left' &&
                    /^(20|40|60|80|100|120)px$/i.test(propertyValue)
                ) {
                    safe.push(`margin-left: ${propertyValue}`);
                }
            });

            return safe.join('; ');
        }

        function normalizeUrl(value) {
            const url = String(value || '').trim();

            if (!url) {
                return null;
            }

            if (/^localhost(?::\d+)?(?:\/.*)?$/i.test(url)) {
                return `http://${url}`;
            }

            if (/^www\./i.test(url)) {
                return `https://${url}`;
            }

            if (url.startsWith('/') || url.startsWith('#')) {
                return url;
            }

            if (/^(https?:\/\/|mailto:|tel:)/i.test(url)) {
                return url;
            }

            /*
             * Người dùng nhập example.com
             * thì tự thêm https://
             */
            if (/^[a-z0-9.-]+\.[a-z]{2,}(\/.*)?$/i.test(url)) {
                return `https://${url}`;
            }

            return null;
        }

        function isEmptyHtml(html) {
            const div = document.createElement('div');

            div.innerHTML = String(html || '');

            const text = div.textContent
                ?.replace(/\u200B/g, '')
                .replace(/\u00A0/g, ' ')
                .trim();

            return !text;
        }

        function getValue() {
            syncInput(false);

            return elements.input.value;
        }

        function setValue(value, emit = false) {
            const html = sanitizeHtml(value);

            elements.content.innerHTML = html;

            elements.input.value = isEmptyHtml(html) ? '' : html;

            if (emit) {
                elements.input.dispatchEvent(
                    new Event('input', {
                        bubbles: true
                    })
                );
            }
        }

        function setDisabled(disabled) {
            const value = Boolean(disabled);

            root.classList.toggle('is-disabled', value);

            elements.content.setAttribute('contenteditable', value ? 'false' : 'true');

            elements.content.setAttribute('aria-disabled', String(value));

            root.querySelectorAll('[data-rich-text-toolbar] button, ' + '[data-rich-text-toolbar] select').forEach(
                (field) => {
                    field.disabled = value;
                }
            );
        }

        function isDisabled() {
            return (
                root.classList.contains('is-disabled') || elements.content.getAttribute('contenteditable') === 'false'
            );
        }

        function syncMode() {
            const panel = root.closest('[data-detail-panel]');

            const disabled = root.dataset.richTextDisabled === 'true' || panel?.dataset?.mode === 'view';

            setDisabled(disabled);
        }

        function refresh() {
            setValue(elements.input.value || '', false);

            syncMode();
        }
    }

    function refresh(scope = document) {
        const roots = scope.matches?.('[data-rich-text]')
            ? [scope]
            : Array.from(scope.querySelectorAll?.('[data-rich-text]') || []);

        roots.forEach((root) => {
            initialize(root)?.refresh?.();
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        refresh(document);
    });

    return {
        initialize,
        refresh
    };
})();
