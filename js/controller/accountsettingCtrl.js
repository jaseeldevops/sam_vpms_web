app.controller('accountsettingCtrl', function($scope, $state, $rootScope, notificationService, accountsettingService, $timeout) {
    $scope.allowBarcodeAccesstoThisAccount = function() {
        accountsettingService.allowBarcodeAccesstoThisAccount()
    }
    $scope.allowCameraAccesstoThisAccount = function() {
        if (!$rootScope.$user.accountID.cameraAccess) {
            $rootScope.$user.accountID.readPlateNumber = false;
        } else {
            $rootScope.$user.accountID.readPlateNumber = true;
        }
        accountsettingService.allowCameraAccesstoThisAccount()
    }
    $scope.allowCEDAccesstoThisAccount = function() {
        accountsettingService.allowCEDAccesstoThisAccount()
    }
    $scope.allowMarkImageAccesstoThisAccount = function() {
        accountsettingService.allowMarkImageAccesstoThisAccount()
    }
    $scope.allowFingerPrintAccesstoThisAccount = function() {
        accountsettingService.allowFingerPrintAccesstoThisAccount()
    }
    $scope.allowPushNotificationAccesstoThisAccount = function() {
        accountsettingService.allowPushNotificationAccesstoThisAccount()
    }
    $scope.allowvibrateAccesstoThisAccount = function() {
        accountsettingService.allowvibrateAccesstoThisAccount()
    }
    $scope.allowReadPlateNumberThisAccount = function() {
        if (!$rootScope.$user.accountID.cameraAccess) {
            $rootScope.$user.accountID.readPlateNumber = false;
        }
        accountsettingService.allowReadPlateNumberThisAccount()
    }

});