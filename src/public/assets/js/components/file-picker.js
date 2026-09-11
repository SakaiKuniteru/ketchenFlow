'use strict';

window.MCS = window.MCS || {};

window.MCS.filePicker = {
    initialize(root) {
        if (!root) {
            return null;
        }

        if (root.filePicker) {
            return root.filePicker;
        }

        const input = root.querySelector('[data-file-picker-input]');
        const name = root.querySelector('[data-file-picker-name]');
        const download = root.querySelector('[data-file-picker-download]');
        const upload = root.querySelector('[data-file-picker-upload]');

        if (!input || !name) {
            return null;
        }

        const placeholder = name.textContent.trim() || 'Chưa chọn file';

        const state = {
            currentFileUrl: '',
            currentFileName: '',
            selectedFile: null
        };

        input.addEventListener('change', () => {
            const file = input.files?.[0] || null;

            state.selectedFile = file;

            if (file) {
                setFile({
                    name: file.name,
                    url: ''
                });
            } else {
                setFile({
                    name: state.currentFileName,
                    url: state.currentFileUrl
                });
            }
        });

        download?.addEventListener('click', async (event) => {
            event.preventDefault();
            event.stopPropagation();

            if (state.selectedFile) {
                downloadLocalFile(state.selectedFile);
                return;
            }

            if (!state.currentFileUrl) {
                return;
            }

            await downloadServerFile();
        });

        async function downloadServerFile() {
            try {
                if (window.MCS?.api?.requestFile) {
                    const result = await window.MCS.api.requestFile(state.currentFileUrl, {
                        method: 'GET'
                    });

                    window.MCS.api.downloadBlob(result.blob, result.fileName || state.currentFileName || 'file');

                    return;
                }

                const anchor = document.createElement('a');

                anchor.href = state.currentFileUrl;
                anchor.download = state.currentFileName || '';

                document.body.appendChild(anchor);

                anchor.click();

                anchor.remove();
            } catch (error) {
                console.error('Không thể tải file:', error);

                window.MCS?.toast?.error(error?.message || 'Không thể tải file.');
            }
        }

        function downloadLocalFile(file) {
            const url = URL.createObjectURL(file);

            const anchor = document.createElement('a');

            anchor.href = url;
            anchor.download = file.name;

            document.body.appendChild(anchor);

            anchor.click();

            anchor.remove();

            URL.revokeObjectURL(url);
        }

        function setFile({ name: fileName = '', url: fileUrl = '' } = {}) {
            const normalizedName = String(fileName || '').trim();

            const normalizedUrl = String(fileUrl || '').trim();

            state.currentFileName = normalizedName;
            state.currentFileUrl = normalizedUrl;

            name.textContent = normalizedName || placeholder;

            root.classList.toggle('has-file', Boolean(normalizedName));

            root.classList.toggle('can-download', Boolean(normalizedName));

            if (download) {
                download.disabled = !normalizedName;
            }
        }

        function clear() {
            input.value = '';

            state.selectedFile = null;
            state.currentFileUrl = '';
            state.currentFileName = '';

            setFile({
                name: '',
                url: ''
            });
        }

        function setDisabled(disabled = true) {
            const value = Boolean(disabled);

            input.disabled = value;

            root.classList.toggle('is-disabled', value);

            if (upload) {
                upload.hidden = value;
            }
        }

        function setExistingFile(file = {}) {
            input.value = '';

            state.selectedFile = null;

            setFile({
                name: file.name || '',
                url: file.url || ''
            });
        }

        const api = {
            clear,
            setDisabled,
            setExistingFile,
            setFile,

            getFile() {
                return input.files?.[0] || null;
            },

            getInput() {
                return input;
            },

            getExistingFileUrl() {
                return state.currentFileUrl;
            }
        };

        root.filePicker = api;

        return api;
    },

    initializeAll(container = document) {
        container.querySelectorAll('[data-file-picker]').forEach((root) => {
            this.initialize(root);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    window.MCS.filePicker.initializeAll();
});
