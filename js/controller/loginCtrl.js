app.controller('loginCtrl', function ($scope, $http, $state, $rootScope, loginService, localStorageService, notificationService, $localStorage, $window, toaster, parkingService, $stateParams, $timeout, $uibModal) {

    $rootScope.showpass = false;
    $rootScope.loading = false;
    $rootScope.pass = false;
    if ($rootScope.$prevState == 'attendant_profile') {
        $rootScope.pass = true;
    }

    $scope.passwordNotMatch = false;
    $scope.user = {
        email: '',
        password: ''
    };
    $scope.credential = {
        email: '',
        mobile: ''
    };
    $scope.newPass = '';
    $scope.newPass1 = '';
    $scope.request = {
        ticket: '',
        mobile: '',
        plateNumber: ''
    };

    $scope.addCar = function () {
        loginService.addCar();
    }
    $scope.refreshDashboard = function () {
        //$state.go($state.current, {}, { reload: true }); //second parameter is for $stateParams
        // parkingService.getCarDetails($rootScope.$user.venues); // after lazy
    }
    $scope.login = function () {
        if (($scope.user.email != '' && $scope.user.password != '' && $scope.user.email != undefined && $scope.user.password != undefined)) {
            // console.log('email' + $scope.user.email + 'pass' + $scope.user.password);
            var loginResponse = loginService.login($scope.user);
        } else
            notificationService.errorNotify('Please type email and password...');
    }
    $scope.logout = function () {
        // alert('logout');
        loginService.logout();
        $rootScope.$user = {};
        // $rootScope.userLogin.isLoggedIn = false;
        localStorageService.remove("VPSUser");
        localStorageService.remove("VPSUserisLoggedIn", false);
        notificationService.successNotify('You have successfully logged out', 5000);
        $state.go('login');
    }

    $scope.requestCar = function () {
        // alert(">>>>>>>>>>>>>>> requestCar");
        if ($scope.request.mobile != '' && $scope.request.mobile != undefined && $scope.request.ticket != '' && $scope.request.ticket != undefined && $scope.request.plateNumber != '' && $scope.request.plateNumber != undefined) {
            loginService.requestCar($scope.request);
        } else
            notificationService.errorNotify('Please type vaild fields...');
    }
    $scope.forgotPassReq = function (details) {
        $scope.forgotpassemail = details.email;
        if (details.email != '' && details.email != undefined && details.number != '' && details.number != undefined) {
            loginService.forgotPassReq(details);
        } else
            notificationService.errorNotify('Please type email and mobile number...');
    }
    // clear pass 
    $scope.clearpass = function () {
        $scope.user.newPass = '';
        $scope.user.newPass1 = '';
    }
    $scope.setPass = function (pass) {
        if (pass.newPass != '' && pass.newPass != undefined && pass.newPass1 != '' && pass.newPass1 != undefined) {
            if (pass.newPass == pass.newPass1) {
                $scope.passwordNotMatch = false;
                if ($rootScope.$prevState != 'attendant_profile')
                    loginService.setPass(pass.newPass, $scope.forgotpassemail);
                else
                    loginService.setPass(pass.newPass);
            } else {
                $scope.passwordNotMatch = true;
                notificationService.errorNotify("Password doesn't match...");
                return;
            }
        } else {
            notificationService.errorNotify('Please type password...');
        }
    }
    $scope.changePass = function (pass) {
        if (pass.newPass != '' && pass.newPass != undefined && pass.newPass1 != '' && pass.newPass1 != undefined) {
            if (pass.newPass == pass.newPass1) {
                $scope.passwordNotMatch = false;
                if ($state.current.name == 'app.userProfile') {
                    loginService.changePass(pass.newPass);
                } else {
                    loginService.changePass(pass.newPass);
                }
                $('#userProfileEdit').modal('hide');
            } else {
                $scope.passwordNotMatch = true;
                notificationService.errorNotify("Password doesn't match...");
                // $scope.$parent.showHeader();
                return;
            }
        } else {
            notificationService.errorNotify('Please type password...');
        }
    }
    $scope.findWhichURListhis = function () {
        let domains = ['oscar', 'app', 'tvc'];
        return domains.filter(d=>{
            return (window.location.href.indexOf(d) || document.URL.indexOf(d)) > -1;
        })[0];
    }
});