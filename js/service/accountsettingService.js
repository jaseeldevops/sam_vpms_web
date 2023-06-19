'use strict';
app.factory('accountsettingService', function($http, $rootScope, $state, notificationService, localStorageService, $window) {
    return {
        allowBarcodeAccesstoThisAccount: function() {
            // $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.$user.accountID.id,
                barCodeAccess: $rootScope.$user.accountID.barCodeAccess
            };
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowBarcodeAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.barCodeAccess", $rootScope.$user.accountID.barCodeAccess)
                $rootScope.loadRunner = false;
                notificationService.successNotify('Your setting has been saved..', 5000);
            }).error(function(error) {
                // alert(error);
            })
        },
        allowCameraAccesstoThisAccount: function() {
            // $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.$user.accountID.id,
                cameraAccess: $rootScope.$user.accountID.cameraAccess,
                readPlateNumber: $rootScope.$user.accountID.readPlateNumber
            };
            $window.readPlateNumber = $rootScope.$user.accountID.readPlateNumber;
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowCameraAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.cameraAccess", $rootScope.$user.accountID.cameraAccess)
                $rootScope.loadRunner = false;
                notificationService.successNotify('Your setting has been saved..', 5000);
            });
        },
        allowCEDAccesstoThisAccount: function() {
            // $rootScope.loadRunner = true;
            
            var postdata = {
                id: $rootScope.$user.accountID.id,
                CEDAccess: $rootScope.$user.accountID.CEDAccess
            };
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowCEDAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.CEDAccess", $rootScope.$user.accountID.CEDAccess)
                $rootScope.loadRunner = false;
                notificationService.successNotify('Your setting has been saved..', 5000);
            });
        },
        allowMarkImageAccesstoThisAccount: function() {
            // $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.$user.accountID.id,
                markImage: $rootScope.$user.accountID.markImage
            };
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowMarkImageAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.markImage", $rootScope.$user.accountID.markImage)
                $rootScope.loadRunner = false;
                notificationService.successNotify('Your setting has been saved..', 5000);
            });
        },
        allowFingerPrintAccesstoThisAccount: function() {
            // $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.$user.accountID.id,
                fingerPrint: $rootScope.$user.accountID.fingerPrint
            };
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowFingerPrintAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.fingerPrint", $rootScope.$user.accountID.fingerPrint)
                $rootScope.loadRunner = false;
                notificationService.successNotify('Your setting has been saved..', 5000);
            });

        },
        allowPushNotificationAccesstoThisAccount: function() {
            // $rootScope.loadRunner = true;

            var postdata = {
                id: $rootScope.$user.accountID.id,
                pushNotification: $rootScope.$user.accountID.pushNotification
            };
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowPushNotificationAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.pushNotification", $rootScope.$user.accountID.pushNotification)
                $rootScope.loadRunner = false;
                // notificationService.successNotify('Your setting has been saved..', 5000);

            });

        },
        allowvibrateAccesstoThisAccount: function() {
            $rootScope.loadRunner = true;

            var postdata = {
                id: $rootScope.$user.accountID.id,
                vibrate: $rootScope.$user.accountID.vibrate
            };
            $rootScope.loadRunner = false;
            // notificationService.successNotify('Your setting has been saved..', 5000);
            $http.post($rootScope.ipAddress + '/account/allowvibrateAccesstoThisAccount/', postdata).success(function(data) {
                // localStorageService.set("VPSUser.user.accountID.vibrate", $rootScope.$user.accountID.vibrate)
                $rootScope.loadRunner = false;
                notificationService.successNotify('Your setting has been saved..', 5000);

            });

        },
        allowReadPlateNumberThisAccount: function() {
            $rootScope.loadRunner = true;
            if ($rootScope.$user.accountID.cameraAccess) {
                var postdata = {
                    id: $rootScope.$user.accountID.id,
                    readPlateNumber: $rootScope.$user.accountID.readPlateNumber
                };
                // $window.readPlateNumber = $rootScope.$user.accountID.readPlateNumber;
                $http.post($rootScope.ipAddress + '/account/allowReadPlateNumberThisAccount/', postdata).success(function(data) {
                    // localStorageService.set("VPSUser.user.accountID.readPlateNumber", $rootScope.$user.accountID.readPlateNumber)
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Your setting has been saved..', 5000);

                });
            } else {
                $rootScope.loadRunner = false;
                alert("Please allow camera for getting plate number and then enable this feature.");
            }


        },
    }

});