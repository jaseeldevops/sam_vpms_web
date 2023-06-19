// var db = openDatabase("Database", "1.0", "EValetz Offline DB", 200000);
// var app = angular.module('oscar');

function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, IdleProvider, KeepaliveProvider) {
    // Configure Idle settings
    IdleProvider.idle(5); // in seconds
    IdleProvider.timeout(120); // in seconds

    $urlRouterProvider.otherwise("/login");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            controller: 'loginCtrl',
            data: { pageTitle: 'Login Page', specialClass: 'gray-bg', requiresLogin: false },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        serie: true,
                        name: 'angular-ladda',
                        files: ['js/plugins/ladda/spin.min.js', 'js/plugins/ladda/ladda.min.js', 'css/plugins/ladda/ladda-themeless.min.css', 'js/plugins/ladda/angular-ladda.min.js']
                    }]);
                }
            }
        })
        .state('forgot_password', {
            url: "/forgot_password",
            templateUrl: "views/forgot_password.html",
            controller: 'loginCtrl',
            data: { pageTitle: 'Forgot password', specialClass: 'gray-bg', requiresLogin: false }
        })
        .state('register', {
            url: "/register",
            templateUrl: "views/register.html",
            data: { pageTitle: 'Register', specialClass: 'gray-bg' }
        })
        .state('app', {
            abstract: true,
            url: "/app",
            templateUrl: "views/common/content.html",
            controller: "parkingCtrl",
            data: { requiresLogin: true }
        })
        .state('monitor', {
            url: "/monitor",
            templateUrl: "views/monitor.html",
            // controller: "parkingCtrl",
            data: { pageTitle: 'Monitor', specialClass: 'gray-bg', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'timer',
                        files: ['js/angular-timer.min.js', 'js/HumanizeDuration.js']
                    }]);
                }
            }
        })
        .state('app.superadminDashboard', {
            url: "/superadminDashboard",
            templateUrl: "views/superadminDashboard.html",
            data: { pageTitle: 'Main Dashboard', requiresLogin: true },
            controller: 'dashboardCtrl',
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'datePicker',
                        files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                    },{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    },{
                        serie: true,
                        name: 'angular-flot',
                        files: ['js/plugins/flot/jquery.flot.js', 'js/plugins/flot/jquery.flot.time.js', 'js/plugins/flot/jquery.flot.tooltip.min.js', 'js/plugins/flot/jquery.flot.spline.js', 'js/plugins/flot/jquery.flot.resize.js', 'js/plugins/flot/jquery.flot.pie.js', 'js/plugins/flot/curvedLines.js', 'js/plugins/flot/angular-flot.js',]
                    },
                    {
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    },
                    {
                        serie: true,
                        files: ['js/plugins/jvectormap/jquery-jvectormap-2.0.2.min.js', 'js/plugins/jvectormap/jquery-jvectormap-2.0.2.css']
                    },
                    {
                        serie: true,
                        files: ['js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js']
                    },
                    {
                        name: 'ui.checkbox',
                        files: ['js/bootstrap/angular-bootstrap-checkbox.js']
                    }
                    ]);
                }
            }
        })
        .state('app.mainDashboard', {
            url: "/mainDashboard",
            templateUrl: "views/mainDashboard.html",
            data: { pageTitle: 'Main Dashboard', requiresLogin: true },
            // controller: 'parkingCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                            serie: true,
                            name: 'angular-flot',
                            files: ['js/plugins/flot/jquery.flot.js', 'js/plugins/flot/jquery.flot.time.js', 'js/plugins/flot/jquery.flot.tooltip.min.js', 'js/plugins/flot/jquery.flot.spline.js', 'js/plugins/flot/jquery.flot.resize.js', 'js/plugins/flot/jquery.flot.pie.js', 'js/plugins/flot/curvedLines.js', 'js/plugins/flot/angular-flot.js', ]
                        },
                        {
                            files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                        },
                        {
                            serie: true,
                            files: ['js/plugins/jvectormap/jquery-jvectormap-2.0.2.min.js', 'js/plugins/jvectormap/jquery-jvectormap-2.0.2.css']
                        },
                        {
                            serie: true,
                            files: ['js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js']
                        },
                        {
                            name: 'ui.checkbox',
                            files: ['js/bootstrap/angular-bootstrap-checkbox.js']
                        }
                    ]);
                }
            }
        })
        .state('app.dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html",
            data: { pageTitle: 'Accounting User Dashboard', requiresLogin: true },
            // controller: 'parkingCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                            serie: true,
                            name: 'angular-flot',
                            files: ['js/plugins/flot/jquery.flot.js', 'js/plugins/flot/jquery.flot.time.js', 'js/plugins/flot/jquery.flot.tooltip.min.js', 'js/plugins/flot/jquery.flot.spline.js', 'js/plugins/flot/jquery.flot.resize.js', 'js/plugins/flot/jquery.flot.pie.js', 'js/plugins/flot/curvedLines.js', 'js/plugins/flot/angular-flot.js', ]
                        },
                        {
                            files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                        },
                        {
                            serie: true,
                            files: ['js/plugins/jvectormap/jquery-jvectormap-2.0.2.min.js', 'js/plugins/jvectormap/jquery-jvectormap-2.0.2.css']
                        },
                        {
                            serie: true,
                            files: ['js/plugins/jvectormap/jquery-jvectormap-world-mill-en.js']
                        },
                        {
                            name: 'ui.checkbox',
                            files: ['js/bootstrap/angular-bootstrap-checkbox.js']
                        }
                    ]);
                }
            }
        })
        .state('app.addCar', {
            url: "/addCar",
            templateUrl: "views/addCar.html",
            data: { pageTitle: 'Add Car', requiresLogin: true },
            // controller: 'parkingCtrl'
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }, {
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }, {
                        files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                    }, {
                        name: 'ui.switchery',
                        files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                    }]);
                }
            }
        })
        .state('app.editCar', {
            url: "/editCar",
            templateUrl: "views/editCar.html",
            params: { carDetials: null },
            data: { pageTitle: 'Edit Car', requiresLogin: true },
            // controller: 'parkingCtrl'
        })
        .state('app.carTransaction', {
            url: "/carTransaction",
            templateUrl: "views/carDashboard.html",
            data: { pageTitle: 'Car Transaction', requiresLogin: true },
            // controller: 'parkingCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }, {
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }, {
                        files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                    }, {
                        name: 'ui.switchery',
                        files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                    }]);
                }
            }
        })
        .state('app.carFullDetails', {
            url: "/carFullDetails",
            templateUrl: "views/carFullDetails.html",
            data: { pageTitle: 'Car Fulldetails', requiresLogin: true },
            // controller: 'parkingCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        files: ['js/plugins/blueimp/jquery.blueimp-gallery.min.js', 'css/plugins/blueimp/css/blueimp-gallery.min.css']
                    }]);
                }
            }
        })
        .state('app.reportCarDetails', {
            url: "/reportCarDetails",
            templateUrl: "views/reportCarDetails.html",
            data: { pageTitle: 'Car Fulldetails', requiresLogin: true },
            // controller: 'parkingCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        files: ['js/plugins/blueimp/jquery.blueimp-gallery.min.js', 'css/plugins/blueimp/css/blueimp-gallery.min.css']
                    }]);
                }
            }
        })
        .state('settings', {
            abstract: true,
            url: "/settings",
            templateUrl: "views/common/content.html",
        })
        .state('settings.accountUserList', {
            url: "/accountUserList",
            templateUrl: "views/accountUserList.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'Account User List', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }, {
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }, {
                        files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                    }, {
                        name: 'ui.switchery',
                        files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                    }]);
                }
            }

        })
        .state('settings.subscription', {
            url: "/subscription",
            templateUrl: "views/accountSubscriptionList.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'subscription Pgae', requiresLogin: true }
        })
        .state('settings.subscriptionList', {
            url: "/subscriptionList",
            templateUrl: "views/subscriptionList.html",
            controller: 'subscriptionCtrl',
            data: { pageTitle: 'subscription Pgae', requiresLogin: true }
        })
        .state('settings.accountList', {
            url: "/accountList",
            templateUrl: "views/accountList.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'subscription Pgae', requiresLogin: true }
        })
        .state('settings.accountDetails', {
            url: "/accountDetails",
            templateUrl: "views/accountDetails.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'subscription Pgae', requiresLogin: true }
        })
        .state('settings.reportSetting', {
            url: "/reportSetting",
            templateUrl: "views/reportSetting.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'Account User List', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }, {
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }, {
                        files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                    }, {
                        name: 'ui.switchery',
                        files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                    }]);
                }
            }

        })
        .state('settings.support', {
            url: "/support",
            templateUrl: "views/support.html",
        })
        .state('settings.users', {
            url: "/users",
            templateUrl: "views/userlist2.html",
            controller: 'userCtrl',
            data: { requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.switchery',
                        files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                    }]);
                }
            }
        })
        .state('app.admins', {
            url: "/admins",
            templateUrl: "views/admins.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'Admin User List', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }, {
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }, {
                        files: ['css/plugins/awesome-bootstrap-checkbox/awesome-bootstrap-checkbox.css']
                    }, {
                        name: 'ui.switchery',
                        files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                    }]);
                }
            }

        })
        .state('settings.aboutus', {
            url: "/aboutus",
            templateUrl: "views/about_us.html",
            data: { pageTitle: 'About Us Pgae', requiresLogin: true }
        })
        .state('settings.policies', {
            url: "/policies",
            templateUrl: "views/policies.html",
            data: { pageTitle: 'Policies Pgae', requiresLogin: true }
        })
        .state('settings.venue', {
            url: "/venue",
            templateUrl: "views/addAccountVenue.html",
            controller: 'venueCtrl',
            data: { pageTitle: 'Account Venue', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                            name: 'ui.select',
                            files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                        },
                        {
                            files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                        },
                        {
                            name: 'ui.switchery',
                            files: ['css/plugins/switchery/switchery.css', 'js/plugins/switchery/switchery.js', 'js/plugins/switchery/ng-switchery.js']
                        }
                    ]);
                }
            }
        })
        .state('settings.accountCustomerTypes', {
            url: "/accountCustomerTypes",
            templateUrl: "views/accountCustomerTypes.html",
            controller: 'accountCtrl',
            data: { pageTitle: 'Custom User Types', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }, ]);
                }
            }
        })
        .state('app.report', {
            url: "/report",
            templateUrl: "views/report.html",
            // controller: 'parkingCtrl',
            data: { pageTitle: 'Report Page', requiresLogin: true },
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                            name: 'datePicker',
                            files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                        },
                        {
                            name: 'ui.select',
                            files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                        },
                        {
                            serie: true,
                            files: ['js/plugins/daterangepicker/daterangepicker.js', 'css/plugins/daterangepicker/daterangepicker-bs3.css']
                        },
                        {
                            name: 'daterangepicker',
                            files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
                        }
                    ]);
                }
            }
        })
        .state('app.dailyReport', {
            url: "/dailyReport",
            templateUrl: "views/dailyReport.html",
            // controller: 'parkingCtrl',
            data: { pageTitle: 'Daily Report Page', requiresLogin: true },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'datePicker',
                        files: ['css/plugins/datapicker/angular-datapicker.css', 'js/plugins/datapicker/angular-datepicker.js']
                    },
                    {
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    },
                    {
                        serie: true,
                        files: ['js/plugins/daterangepicker/daterangepicker.js', 'css/plugins/daterangepicker/daterangepicker-bs3.css']
                    },
                    {
                        name: 'daterangepicker',
                        files: ['js/plugins/daterangepicker/angular-daterangepicker.js']
                    }, {
                        files: ['css/plugins/clockpicker/clockpicker.css', 'js/plugins/clockpicker/clockpicker.js']
                    },
                    ]);
                }
            }
        })
        .state('app.userProfile', {
            url: "/userProfile",
            templateUrl: "views/user_profile.html",
            data: { pageTitle: 'Profile Page', requiresLogin: true },
            controller: 'userCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }]);
                }
            }
        })
        .state('app.accountUserDetails', {
            url: "/accountUserDetails",
            templateUrl: "views/accountUserDetails.html",
            data: { pageTitle: 'Profile Page', requiresLogin: true },
            controller: 'userCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }]);
                }
            }

        })
        .state('app.userDetails', {
            url: "/userDetails",
            templateUrl: "views/userDetails.html",
            data: { pageTitle: 'Profile Page', requiresLogin: true },
            controller: 'userCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        files: ['css/plugins/iCheck/custom.css', 'js/plugins/iCheck/icheck.min.js']
                    }]);
                }
            }

        })
        .state('app.chart', {
            url: "/chart",
            templateUrl: "views/chart.html",
            data: { pageTitle: 'chart', requiresLogin: true },
            // controller: 'parkingCtrl',
            resolve: {
                loadPlugin: function($ocLazyLoad) {
                    return $ocLazyLoad.load([{
                        name: 'ui.select',
                        files: ['js/plugins/ui-select/select.min.js', 'css/plugins/ui-select/select.min.css']
                    }]);
                }
            }
        })
        .state('app.assign_venue', {
            url: "/assign_venue",
            templateUrl: "views/assign_venue.html",
            data: { pageTitle: 'Assign Venue', requiresLogin: true },
            controller: 'venueCtrl'
        })
        .state('app.validate', {
            url: "/validate",
            templateUrl: "views/validate.html",
            data: { pageTitle: 'Assign Venue', requiresLogin: true },
            // controller: 'venueCtrl'
        })
        .state('lockscreen', {
            url: "/lockscreen",
            templateUrl: "views/lockscreen.html",
            data: { pageTitle: 'Lockscreen', specialClass: 'gray-bg' }
        })
        .state('errorOne', {
            url: "/errorOne",
            templateUrl: "views/errorOne.html",
            data: { pageTitle: '404', specialClass: 'gray-bg' }
        })
        .state('errorTwo', {
            url: "/errorTwo",
            templateUrl: "views/errorTwo.html",
            data: { pageTitle: '500', specialClass: 'gray-bg' }
        });

}
var app = angular
    .module('oscar')
    .config(config)
    .run(function($state, $rootScope, $window, localStorageService, Auth, $exceptionHandler, offlineDBCreateandDelteService, ConnectivityMonitor, offlineDBService) {
        $rootScope.pageView = "";
        $rootScope.toDate = new Date(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + (new Date().getDate() + 1));
        $rootScope.fromDate = new Date(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate());

        $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
            var isAuthenticationRequired = toState.data && toState.data.requiresLogin && !Auth.isLoggedIn;
            if (isAuthenticationRequired) {
                event.preventDefault();
                $state.go('login');
            }
        });
        // offlineDBCreateandDelteService.createDBs();
        // offlineDBCreateandDelteService.deleteDBs(function(){});
        $rootScope.onlineSync = false;

        $rootScope.$on("$locationChangeSuccess", function() {
            if (!$rootScope.$user) {
                if (localStorage.getItem('ls.VPSUser') !== null) {
                    $rootScope.$user = JSON.parse(localStorage.getItem('ls.VPSUser'));
                    $rootScope.userLogin = Auth;
                    $rootScope.userLogin.isLoggedIn = true;
                    // console.log('' + JSON.stringify(($rootScope.$user)))
                    getUserRightsPages();

                    setTimeout(() => {
                        getUserRightsPages();
                    }, 500)

                } else {
                    localStorageService.remove("VPSUser");
                    localStorageService.remove("VPSUserisLoggedIn", false);
                }
            } else {
                if (Auth.isLoggedIn) {
                    setTimeout(() => {
                        getUserRightsPages();
                    }, 500)
                }
            }
            $rootScope.selectedDriverTemp = undefined;
        });


        function getUserRightsPages() {
            if ($state.current.name == 'login') {
                if ($rootScope.$user.role == 'accountadmin') {
                    $state.go('app.mainDashboard');
                } else if ($rootScope.$user.role == 'driver' || $rootScope.$user.role == 'chauffeur') {
                    $state.go('app.carTransaction');
                } else if ($rootScope.$user.role == 'accountinguser')
                    $state.go('app.dashboard');
                else if ($rootScope.$user.role == 'validator')
                    $state.go('app.validate');
                else if ($rootScope.$user.role == 'admin')
                    $state.go('app.superadminDashboard');
            }
        }
        // io.socket.on('connect', function() {
        //     io.socket.get($rootScope.ipAddress + '/file/upload');
        //     io.socket.get($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICall');
        //     io.socket.get($rootScope.ipAddress + '/requestcar/requestCarFromAPICall');
        //     io.socket.get($rootScope.ipAddress + '/file/upload2');
        //     io.socket.get($rootScope.ipAddress + '/requestcar/onlineSync');
        //     $rootScope.isOnline = true;
        // });
        // io.socket.on('disconnect', function() {
        //     console.log('Lost connection to server');
        //     // alert("disconnect.............");
        //     io.socket.get($rootScope.ipAddress + '/file/upload');
        //     io.socket.get($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICall');
        //     io.socket.get($rootScope.ipAddress + '/requestcar/requestCarFromAPICall');
        //     io.socket.get($rootScope.ipAddress + '/file/upload2');
        //     io.socket.get($rootScope.ipAddress + '/requestcar/onlineSync');
        //     // ConnectivityMonitor.isOnline();
        //     // ConnectivityMonitor.isOffline();
        //     // ConnectivityMonitor.startWatching();
        //     $rootScope.isOnline = false;
        // });
        /*
         *
         * 
         * IP ADDRESS FOR SAILS SOCKETS
         *
         * 
         */
        $rootScope.loadRunner = false;
        $rootScope.ipAddress = io.sails.url;
        // $rootScope.ipAddress = "https://evaletz.com:1338"; //172.246.84.116
        $rootScope.loaded = false;
        $rootScope.parkedCarTab = false;
        $rootScope._ = window._;
        $rootScope.syncAlreadyStrated = false;

        $rootScope.filteredRequestedCar = [];
        $rootScope.filteredParkedCar = [];
        $rootScope.filteredCompletedCar = [];
        $rootScope.interval;

        if (!angular.merge) {
            angular.merge = (function mergePollyfill() {
                function setHashKey(obj, h) {
                    if (h) {
                        obj.$$hashKey = h;
                    } else {
                        delete obj.$$hashKey;
                    }
                }

                function baseExtend(dst, objs, deep) {
                    var h = dst.$$hashKey;

                    for (var i = 0, ii = objs.length; i < ii; ++i) {
                        var obj = objs[i];
                        if (!angular.isObject(obj) && !angular.isFunction(obj)) continue;
                        var keys = Object.keys(obj);
                        for (var j = 0, jj = keys.length; j < jj; j++) {
                            var key = keys[j];
                            var src = obj[key];

                            if (deep && angular.isObject(src)) {
                                if (angular.isDate(src)) {
                                    dst[key] = new Date(src.valueOf());
                                } else {
                                    if (!angular.isObject(dst[key])) dst[key] = angular.isArray(src) ? [] : {};
                                    baseExtend(dst[key], [src], true);
                                }
                            } else {
                                dst[key] = src;
                            }
                        }
                    }

                    setHashKey(dst, h);
                    return dst;
                }

                return function merge(dst) {
                    return baseExtend(dst, [].slice.call(arguments, 1), true);
                }
            })();
        }

        $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
            //save the previous state in a rootScope variable so that it's accessible from everywhere
            $rootScope.previousState = from;
        });
    });

app.factory('Auth', function() {
    return { isLoggedIn: false };
});

app.filter('completedStatusFilter', function() {
    return function(entries) {
        var filtered = [];
        angular.forEach(entries, function(entry) {
            if (entry.status != 'completed')
                filtered.push(entry);
        });
        return filtered;
    };
});

app.filter('allUpperCase', function() {
    return function(input, scope) {
        if (input) {
            if (typeof input != 'string')
                input = input.toString();
            return input.toString().toUpperCase();
        } else
            return;
    }
});

// Capitalize directive
app.filter('capitalize', function() {
    return function(input, scope) {
        if (input) {
            if (typeof input != 'string')
                input = input.toString();
            return input.substring(0, 1).toUpperCase() + input.substring(1);
        } else
            return;
    }
});



app.directive('tabsSwipable', ['$ionicGesture', function($ionicGesture) {
    return {
        restrict: 'A',
        require: 'ionTabs',
        link: function(scope, elm, attrs, tabsCtrl) {
            var onSwipeLeft = function() {
                var target = tabsCtrl.selectedIndex() + 1;
                if (target < tabsCtrl.tabs.length) {
                    scope.$apply(tabsCtrl.select(target));
                }
            };
            var onSwipeRight = function() {
                var target = tabsCtrl.selectedIndex() - 1;
                if (target >= 0) {
                    scope.$apply(tabsCtrl.select(target));
                }
            };

            var swipeGesture = $ionicGesture.on('swipeleft', onSwipeLeft, elm)
                .on('swiperight', onSwipeRight);
            scope.$on('$destroy', function() {
                $ionicGesture.off(swipeGesture, 'swipeleft', onSwipeLeft);
                $ionicGesture.off(swipeGesture, 'swiperight', onSwipeRight);
            });
        }
    };
}]);

app.directive('showWithDelay', ['$timeout', function($timeout) {
    return {
        restrict: 'A',
        link: function($scope, $element, attrs) {
            // console.log("called")
            $element.addClass("ng-hide");
            $timeout(function() {
                $element.removeClass("ng-hide");
            }, attrs.showWithDelay || 5000);
        }
    }
}]);

app.filter('unique', function() {
    return function(collection, keyname) {
        var output = [],
            keys = [];
        angular.forEach(collection, function(item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });
        return output;
    };
});

app.factory('offlineDBCreateandDelteService', function($rootScope, notificationService, $timeout) {
    return {
        createDBs: function() {
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'CREATE TABLE IF NOT EXISTS EvaletzUsers' +
                        '  (fullName TEXT, userName TEXT, email TEXT, mobile TEXT, role TEXT, profileImage TEXT, id TEXT, venues TEXT, accountID TEXT, licenseNumber TEXT);'
                    );
                }
            );
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'CREATE TABLE IF NOT EXISTS EvaletzDrivers' +
                        '  (fullName TEXT, userName TEXT, licenseNumber TEXT, mobile TEXT, role TEXT, profileImage TEXT, id TEXT, companyName TEXT, accountID TEXT, email TEXT);'
                    );
                }
            );
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'CREATE TABLE IF NOT EXISTS EvaletzParkedCar' +
                        '  (parkingID TEXT, plateNumber TEXT, snap TEXT, parkingZone TEXT, status TEXT, employeeID TEXT, venue TEXT, accountID TEXT, log TEXT,scratchesSnap TEXT,loginAs TEXT, ownerMobileNumber TEXT, id TEXT, markImageIsThere TEXT, markImageBlob TEXT, offlineEdited TEXT, createdAt NUMERIC, remarks TEXT, brand TEXT, modelName TEXT, color TEXT, changeLog TEXT);'
                    );
                }
            );
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'CREATE TABLE IF NOT EXISTS EvaletzRequestedCar' +
                        '  (parkingID TEXT, plateNumber TEXT, snap TEXT, parkingZone TEXT, status TEXT, employeeID TEXT, venue TEXT, accountID TEXT, log TEXT,scratchesSnap TEXT,loginAs TEXT, ownerMobileNumber TEXT, id TEXT, markImageIsThere TEXT, markImageBlob TEXT, offlineEdited TEXT, createdAt NUMERIC, remarks TEXT, brand TEXT, modelName TEXT, color TEXT, changeLog TEXT);'
                    );
                }
            );
            db.transaction(
                function(transaction) {
                    transaction.executeSql(
                        'CREATE TABLE IF NOT EXISTS EvaletzVenues' +
                        '  (users TEXT, account TEXT, venueName TEXT, id TEXT);'
                    );
                }
            );
        },
        deleteDBs: function(cb) {
            db.transaction(
                function(transaction) {
                    transaction.executeSql('DROP TABLE EvaletzVenues');
                    transaction.executeSql('DROP TABLE EvaletzDrivers');
                    transaction.executeSql('DROP TABLE EvaletzUsers');
                    transaction.executeSql('DROP TABLE EvaletzParkedCar');
                    transaction.executeSql('DROP TABLE EvaletzRequestedCar');
                    $timeout(function() {
                        cb();
                    }, 1000);

                }
            );
        },
    }
});

app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];
        if (angular.isArray(items)) {
            var keys = Object.keys(props);
            items.forEach(function(item) { var itemMatches = false; for (var i = 0; i < keys.length; i++) { var prop = keys[i]; var text = props[prop].toLowerCase(); if (item[prop].toString().toLowerCase().indexOf(text) !== -1) { itemMatches = true; break; } } if (itemMatches) { out.push(item); } });
        } else { out = items; }
        return out;
    };
});

app.filter('custom', function() {
    return function(input, search) {
        if (!input) return input;
        if (!search) return input;
        var expected = ('' + search).toLowerCase();
        var result = {};
        angular.forEach(input, function(value, key) {
            var actual = ('' + value).toLowerCase();
            if (actual.indexOf(expected) !== -1) {
                result[key] = value;
            }
        });
        return result;
    }
});

app.directive('usernameAvailable', function($timeout, $q, $http, $rootScope) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope, elm, attr, model) {
            model.$asyncValidators.usernameAvailable = function() {
                var defer = $q.defer();
                if (elm.val() !== undefined && elm.val() !== '') {
                    return $http.post($rootScope.ipAddress + '/session/usernameExists', { username: elm.val() }).success(function(result) {
                        //   console.log(JSON.stringify(result))
                        if (result && result.success && result.success > 0) {
                            model.$setValidity('usernameAvailable', false);
                            scope.$parent.accountAdminData ? scope.$parent.accountAdminData.userName = elm.val() : null;
                            // deferr.resolve;
                            $rootScope.erroridentified = true;
                        } else {
                            model.$setValidity('usernameAvailable', true);
                            scope.$parent.accountAdminData ? scope.$parent.accountAdminData.userName = elm.val() : null;
                            // defer.resolve;
                            $rootScope.erroridentified = false;
                        }
                    }).error(function(err) {
                        // console.log(JSON.stringify(err))
                    });
                }
                //   return defer.promise;
            };
        }
    }
});

app.directive('emailAvailable', function($timeout, $q, $http, $rootScope) {
    return {
        restrict: 'AE',
        require: 'ngModel',
        link: function(scope, elm, attr, model) {
            model.$asyncValidators.emailAvailable = function() {
                var defer = $q.defer();
                return $http.post($rootScope.ipAddress + '/session/emailExistsChecking', { email: elm.val() }).success(function(result) {
                    //   console.log(JSON.stringify(result))
                    if (result && result.success && result.success > 0) {
                        model.$setValidity('emailAvailable', false);
                        scope.$parent.accountAdminData ? scope.$parent.accountAdminData.email = elm.val() : null;
                        // deferr.resolve;
                        $rootScope.erroridentified2 = true;
                    } else {
                        model.$setValidity('emailAvailable', true);
                        scope.$parent.accountAdminData ? scope.$parent.accountAdminData.email = elm.val() : null;
                        // defer.resolve;
                        $rootScope.erroridentified2 = false;
                    }
                }).error(function(err) {
                    // console.log(JSON.stringify(err))

                });
                //   return defer.promise;
            };
        }
    }
});

app.directive('disallowSpaces', function() {
    return {
        restrict: 'A',

        link: function($scope, $element) {
            $element.bind('input', function() {
                $(this).val($(this).val().replace(/ /g, ''));
            });
        }
    };
});
app.filter('minLength', function() {
    return function(input, len, pad) {
        if (input) {
            input = input.toString();
            if (input.length >= len) return input;
            else {
                pad = (pad || 0).toString();
                return new Array(1 + len - input.length).join(pad) + input;
            }
        } else
            return input;
    };
});
app.controller('dashboardMap', function dashboardMap() {
    var data = {
        "AE": 120
    };

    this.data = data;
});