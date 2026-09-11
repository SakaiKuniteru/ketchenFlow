'use strict';

window.MCS = window.MCS || {};

window.MCS.imagePicker = {
    initialize(root) {
        if (!root) {
            return null;
        }

        if (root.imagePicker) {
            return root.imagePicker;
        }

        const input = root.querySelector('[data-image-picker-input]');

        const image = root.querySelector('[data-image-picker-image]');

        const placeholder = root.querySelector('[data-image-picker-placeholder]');

        const removeButton = root.querySelector('[data-image-picker-remove]');

        const valueInput = root.querySelector('[data-image-picker-value]');

        if (!input || !image || !placeholder) {
            return null;
        }

        const state = {
            objectUrl: '',

            existingUrl: valueInput?.value || '',

            selectedFile: null,

            removed: false
        };

        function normalizeUrl(value) {
            const text = String(value || '').trim();

            if (!text) {
                return '';
            }

            if (
                text.startsWith('http://') ||
                text.startsWith('https://') ||
                text.startsWith('blob:') ||
                text.startsWith('/')
            ) {
                return text;
            }

            return `/${text}`;
        }

        function revokeObjectUrl() {
            if (!state.objectUrl) {
                return;
            }

            URL.revokeObjectURL(state.objectUrl);

            state.objectUrl = '';
        }

        function showImage(url) {
            const value = normalizeUrl(url);

            const hasImage = Boolean(value);

            if (hasImage) {
                image.src = value;

                image.hidden = false;

                placeholder.hidden = true;

                if (removeButton) {
                    removeButton.hidden = false;
                }

                root.classList.add('has-image');

                return;
            }

            image.removeAttribute('src');

            image.hidden = true;

            placeholder.hidden = false;

            if (removeButton) {
                removeButton.hidden = true;
            }

            root.classList.remove('has-image');
        }

        function clearInput() {
            input.value = '';
        }

        function setValue(value) {
            revokeObjectUrl();

            clearInput();

            state.selectedFile = null;

            state.removed = false;

            state.existingUrl = String(value || '').trim();

            if (valueInput) {
                valueInput.value = state.existingUrl;
            }

            showImage(state.existingUrl);
        }

        function setExistingImage(value) {
            setValue(value);
        }

        function setFile(file) {
            if (!file) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                clearInput();

                return;
            }

            revokeObjectUrl();

            state.selectedFile = file;

            state.removed = false;

            state.objectUrl = URL.createObjectURL(file);

            showImage(state.objectUrl);
        }

        function clear() {
            revokeObjectUrl();

            clearInput();

            state.selectedFile = null;

            state.existingUrl = '';

            state.removed = true;

            if (valueInput) {
                valueInput.value = '';
            }

            showImage('');

            root.dispatchEvent(
                new CustomEvent('imagepicker:clear', {
                    bubbles: true
                })
            );
        }

        function setDisabled(disabled = true) {
            const value = Boolean(disabled);

            input.disabled = value;

            if (removeButton) {
                removeButton.disabled = value;
            }

            root.classList.toggle('is-disabled', value);
        }

        input.addEventListener('change', () => {
            const file = input.files?.[0] || null;

            if (!file) {
                return;
            }

            setFile(file);
        });

        removeButton?.addEventListener('click', (event) => {
            event.preventDefault();

            event.stopPropagation();

            if (input.disabled) {
                return;
            }

            clear();
        });

        const api = {
            clear,

            setValue,

            setExistingImage,

            setDisabled,

            getFile() {
                return state.selectedFile || null;
            },

            getExistingUrl() {
                return state.existingUrl || '';
            },

            getValue() {
                return state.existingUrl || '';
            },

            isRemoved() {
                return state.removed === true;
            },

            hasImage() {
                return Boolean(state.selectedFile || state.existingUrl);
            },

            getInput() {
                return input;
            }
        };

        root.imagePicker = api;

        showImage(state.existingUrl);

        return api;
    },

    initializeAll(container = document) {
        container.querySelectorAll('[data-image-picker]').forEach((root) => {
            this.initialize(root);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.MCS.imagePicker.initializeAll();
});
