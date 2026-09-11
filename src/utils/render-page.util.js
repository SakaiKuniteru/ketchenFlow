'use strict';

function buildPageData(req, options = {}) {
    const {
        layout = 'app',

        title = '',

        pageTitle = title,

        pageDescription = '',

        currentUser = req.user || null,

        currentYear = new Date().getFullYear(),

        appVersion = process.env.APP_VERSION || '1.0.0',

        breadcrumbs,

        ...data
    } = options;

    return {
        layout,

        title,

        pageTitle,

        pageDescription,

        currentUser,

        currentYear,

        appVersion,

        breadcrumbs: Array.isArray(breadcrumbs)
            ? breadcrumbs
            : title
              ? [
                    {
                        label: title
                    }
                ]
              : [],

        ...data
    };
}

function renderPage(req, res, view, options = {}) {
    return res.render(view, buildPageData(req, options));
}

module.exports = {
    buildPageData,
    renderPage
};
