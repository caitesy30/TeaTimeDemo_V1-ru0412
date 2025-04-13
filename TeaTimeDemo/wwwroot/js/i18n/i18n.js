// 確保 jQuery 和 i18next 已透過 HTML 引入
$(document).ready(function () {
    i18next
        .use(i18nextHttpBackend)
        .use(i18nextBrowserLanguageDetector)
        .init({
            fallbackLng: 'zh',
            debug: true,
            backend: {
                loadPath: '/js/i18n/locales/{{lng}}/Home.json',
            },
        }, () => {
            jqueryI18next.init(i18next, $, {
                useOptionsAttr: true // 允許使用 data-i18n-options 屬性
            });
            $('body').localize();
            console.log($('body'));
        });

    $('.language-option').on('click', function (e) {
        e.preventDefault();
        const selectedLang = $(this).data('lang');
        i18next.changeLanguage(selectedLang, () => {
            $('body').localize();
        });
    });
});
