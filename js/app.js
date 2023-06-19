(function() {
    angular.module('oscar', [
        'ui.router', // Routing
        'oc.lazyLoad', // ocLazyLoad
        'ui.bootstrap', // Ui Bootstrap
        'pascalprecht.translate', // Angular Translate
        'ngIdle', // Idle timer
        'ngSanitize', // ngSanitize
        'toaster',
        'LocalStorageModule',
        'ngStorage',
        'ngFileUpload',
        'chart.js',
        'nvd3',
        'oitozero.ngSweetAlert',
        'countTo',
        'infinite-scroll',
        'datatables',
        'datatables.buttons',
        'angularUtils.directives.dirPagination'
    ])
})();

// Other libraries are loaded dynamically in the config.js file using the library ocLazyLoad