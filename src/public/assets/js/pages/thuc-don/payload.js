'use strict';

window.ThucDon = window.ThucDon || {};

window.ThucDon.payload = (() => {
    function build(data, trangThai) {
        const d = JSON.parse(JSON.stringify(data || {}));

        d.loaiThucDon = num(d.loaiThucDon);

        d.coSoId = num(d.coSoId);

        d.nhaAnId = num(d.nhaAnId);

        d.caAnId = num(d.caAnId);

        const from = date(d.tuNgay);

        const to = date(d.denNgay);

        d.tuNgay = from ? `${from}T00:00:00+07:00` : null;

        d.denNgay = to ? `${to}T23:59:59+07:00` : null;

        d.trangThai = resolveTrangThai(to, trangThai);

        d.dsNgay = (d.dsNgay || []).map((day, di) => ({
            ...persisted(day.id),

            ngay: date(day.ngay || day.ngayApDung) ? `${date(day.ngay || day.ngayApDung)}T00:00:00+07:00` : null,

            ghiChu: day.ghiChu || null,

            thuTuHienThi: day.thuTuHienThi ?? di + 1,

            dsNhomMonAn: (day.dsNhomMonAn || []).map((g, gi) => ({
                ...persisted(g.id),

                nhomMonAnId: num(g.nhomMonAnId ?? g.nhomMonAn?.id),

                thuTuHienThi: g.thuTuHienThi ?? gi + 1,

                ghiChu: g.ghiChu || null,

                dsMonAn: (g.dsMonAn || []).map((f, fi) => ({
                    ...persisted(f.id),

                    monAnId: num(f.monAnId ?? f.monAn?.id),

                    dinhLuong: f.dinhLuong ?? null,

                    donViTinhId: num(f.donViTinhId ?? f.donViTinh?.id),

                    khauPhan: f.khauPhan ?? null,

                    ghiChu: f.ghiChu || null,

                    thuTuHienThi: f.thuTuHienThi ?? fi + 1
                }))
            }))
        }));

        return d;
    }

    function resolveTrangThai(denNgay, trangThai) {
        if (denNgay && isExpired(denNgay)) {
            return 60;
        }

        return Number(trangThai);
    }

    function isExpired(denNgay) {
        const today = getTodayInVietnam();

        return String(denNgay) < today;
    }

    function getTodayInVietnam() {
        const parts = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Ho_Chi_Minh',

            year: 'numeric',

            month: '2-digit',

            day: '2-digit'
        }).formatToParts(new Date());

        const values = {};

        parts.forEach((part) => {
            values[part.type] = part.value;
        });

        return `${values.year}-` + `${values.month}-` + `${values.day}`;
    }

    function validateGeneral(d) {
        const errors = [];

        if (!String(d.maThucDon || '').trim()) {
            errors.push(['maThucDon', 'Mã thực đơn không được để trống.']);
        }

        if (!String(d.tenThucDon || '').trim()) {
            errors.push(['tenThucDon', 'Tên thực đơn không được để trống.']);
        }

        if (!d.loaiThucDon) {
            errors.push(['loaiThucDon', 'Vui lòng chọn loại thực đơn.']);
        }

        if (!d.coSoId) {
            errors.push(['coSoId', 'Vui lòng chọn cơ sở.']);
        }

        if (!d.nhaAnId) {
            errors.push(['nhaAnId', 'Vui lòng chọn nhà ăn.']);
        }

        if (!d.caAnId) {
            errors.push(['caAnId', 'Vui lòng chọn ca ăn.']);
        }

        const loaiThucDon = Number(d.loaiThucDon);

        const from = date(d.tuNgay);

        const to = date(d.denNgay);

        switch (loaiThucDon) {
            case 10:
                if (!from) {
                    errors.push(['ngayApDung', 'Vui lòng chọn ngày áp dụng.']);
                }

                break;

            case 20:
                if (!from || !to) {
                    errors.push(['tuanApDung', 'Vui lòng chọn tuần áp dụng.']);
                }

                break;

            case 30:
                if (!from || !to) {
                    errors.push(['thangApDung', 'Vui lòng chọn tháng áp dụng.']);
                }

                break;

            case 40:
                if (!from) {
                    errors.push(['tuNgayKhoang', 'Vui lòng chọn từ ngày.']);
                }

                if (!to) {
                    errors.push(['denNgayKhoang', 'Vui lòng chọn đến ngày.']);
                }

                if (from && to && from > to) {
                    errors.push(['denNgayKhoang', 'Từ ngày không được lớn hơn đến ngày.']);
                }

                break;
        }

        return errors;
    }

    function validateContent(d, settings = {}) {
        const errors = [];

        const from = date(d.tuNgay);

        const to = date(d.denNgay);

        if (!from || !to || from > to) {
            return errors;
        }

        const actualDates = new Set(
            (Array.isArray(d.dsNgay) ? d.dsNgay : []).map((day) => date(day?.ngay || day?.ngayApDung)).filter(Boolean)
        );

        const outsideDates = [...actualDates].filter((value) => value < from || value > to);

        if (outsideDates.length > 0) {
            errors.push(
                'Có ngày trong nội dung thực đơn nằm ngoài thời gian áp dụng. Vui lòng cập nhật lại danh sách ngày.'
            );

            return errors;
        }

        const required = settings?.batBuocDuSoNgay === true;

        if (!required) {
            return errors;
        }

        const requiredDates = buildDateRange(from, to);

        const missingDates = requiredDates.filter((value) => !actualDates.has(value));

        if (missingDates.length === 0) {
            return errors;
        }

        const preview = missingDates.slice(0, 5).map(formatDate).join(', ');

        const remaining = missingDates.length - Math.min(missingDates.length, 5);

        let message =
            `Thực đơn bắt buộc phải có đầy đủ ${requiredDates.length} ngày trong thời gian áp dụng. ` +
            `Hiện còn thiếu ${missingDates.length} ngày`;

        if (preview) {
            message += `: ${preview}`;
        }

        if (remaining > 0) {
            message += ` và ${remaining} ngày khác`;
        }

        message += '.';

        errors.push(message);

        return errors;
    }

    function validate(d, settings = {}) {
        const generalErrors = validateGeneral(d);

        if (generalErrors.length) {
            return generalErrors;
        }

        return validateContent(d, settings).map((message) => [null, message]);
    }

    function buildDateRange(from, to) {
        const [fromYear, fromMonth, fromDay] = String(from).split('-').map(Number);

        const [toYear, toMonth, toDay] = String(to).split('-').map(Number);

        let current = Date.UTC(fromYear, fromMonth - 1, fromDay);

        const end = Date.UTC(toYear, toMonth - 1, toDay);

        const result = [];

        while (current <= end) {
            const dateValue = new Date(current);

            result.push(
                [
                    dateValue.getUTCFullYear(),

                    String(dateValue.getUTCMonth() + 1).padStart(2, '0'),

                    String(dateValue.getUTCDate()).padStart(2, '0')
                ].join('-')
            );

            current += 24 * 60 * 60 * 1000;
        }

        return result;
    }

    function formatDate(value) {
        const normalized = date(value);

        if (!normalized) {
            return '';
        }

        const [year, month, day] = normalized.split('-');

        return `${day}/${month}/${year}`;
    }

    function persisted(id) {
        if (id == null || String(id).startsWith('tmp-')) {
            return {};
        }

        return {
            id: num(id)
        };
    }

    function num(v) {
        return v === '' || v == null ? null : Number(v);
    }

    function date(v) {
        return window.ThucDon.form.normalizeDate(v);
    }

    return {
        build,
        validate,
        validateGeneral,
        validateContent,
        resolveTrangThai
    };
})();
