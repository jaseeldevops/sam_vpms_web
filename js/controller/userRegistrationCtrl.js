app.controller('userRegistrationCtrl', function(userService, $scope, $http, $state, $rootScope, venueService, $window, $stateParams, $timeout, $uibModal, Upload) {


    $rootScope.defaultVenueData = false;
    // ionicMaterialInk.displayEffect();

    $scope.init = function() {
        $scope.data = {
            userName: '',
            password: '',
            email: '',
            mobile: '',
            companyName: ''
        };
        $scope.accountAdminData = {
            fullName: '',
            userName: '',
            password: '',
            email: '',
            mobile: '',
            role: '',
            companyName: '',
            id: '',
            wanttoSendEmail: '',
            extraOptions: {}
        };
        $scope.images = [];

    }
    $scope.init();
    $scope.postUser = function() {
        if (userService.postUser($scope.data)) {}
        $scope.init();
    }


    $scope.postAccountAdmin = function(data, addUser) {
        // console.log(JSON.stringify($scope.accountAdminData));
        $scope.addUser = addUser;
        // $scope.addUser.submitted = true;
        // if (addUser.$valid) {
        var _res = userService.postAccountAdmin($scope.accountAdminData);
        _res.then(function(data) {
            if ($rootScope.$user.role == 'admin') {
                if ($scope.accountAdminData.role == 'manager') {
                    $rootScope.managers.push($scope.accountAdminData);
                }
                if ($scope.accountAdminData.role == 'accountadmin') {
                    $rootScope.accountadmin.push($scope.accountAdminData);
                }
                if ($scope.accountAdminData.role == 'chauffeur') {
                    $rootScope.chauffeurs.push($scope.accountAdminData);
                }
            } else if ($rootScope.$user.role == 'accountadmin') {
                if ($scope.accountAdminData.role == 'manager') {
                    $rootScope.managers.push($scope.accountAdminData);
                }
                if ($scope.accountAdminData.role == 'chauffeur') {
                    $rootScope.chauffeurs.push($scope.accountAdminData);
                }
            } else if ($rootScope.$user.role == 'manager') {
                if ($scope.accountAdminData.role == 'chauffeur') {
                    $rootScope.chauffeurs.push($scope.accountAdminData);
                }
            }
            $('.modal').modal('hide');
            $scope.init();
        });
        // }
        //       $scope.init();
        // $scope.userRegister.$setPristine(true);
    }

    $scope.defaultVenueDataFunc = function(defaultvenue) {
        if (defaultvenue == true) {
            $rootScope.defaultVenueData = true;
        } else {
            $rootScope.defaultVenueData = false;
        }

    }



    $('#addUserModal').on('shown.bs.modal', function() {
        $timeout(function() {
            $('#userName').focus();
        }, 500);
        $(document).on('keypress', 'input, select, textarea', function(e) {
            if (e.which == 13) {
                e.preventDefault();
                if ($(this).attr("id") == 'userName') {
                    $('#role').focus();
                }
                if ($(this).attr("id") == 'role') {
                    $('#venue').focus();
                }
                if ($(this).attr("id") == 'venue') {
                    if ($scope.accountAdminData.role == 'driver') {
                        $('input:checkbox').focus();
                    }
                    if ($scope.accountAdminData.role == 'chauffeur') {
                        $('#userPassword').focus();
                    }
                }
                if ($(this).attr("id") == 'driverLogin') {
                    if ($scope.accountAdminData.requiredLogin) {
                        $('#userPassword').focus();
                    } else {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#userSubmitBtn').click();
                        $('#userName').focus();
                    }
                }
                if ($(this).attr("id") == 'userPassword') {
                    if ($scope.accountAdminData.role == 'chauffeur') {
                        $('#userEmail').focus();
                    }
                    if ($scope.accountAdminData.role == 'driver') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#userSubmitBtn').click();
                        $('#userName').focus();
                    }
                }
                if ($(this).attr("id") == 'userEmail') {
                    $('#userMobile').focus();
                }
                if ($(this).attr("id") == 'userMobile') {
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    $('#userSubmitBtn').click();
                    $('#userName').focus();
                }
            }
        })

    })


    $('#userCreationModal').on('shown.bs.modal', function() {
        $timeout(function() {
            $('#userName').focus();
        }, 500);
        $(document).on('keypress', 'input, select, textarea', function(e) {
            if (e.which == 13) {
                e.preventDefault();
                if ($(this).attr("id") == 'userName') {
                    if ($rootScope.$user.role == 'manager') {
                        $('#userRole').focus();
                    }
                }
                if ($(this).attr("id") == 'userRole') {
                    if ($scope.accountAdminData.role) {
                        $('#venue').focus();
                    } else {
                        alert('Please select role..');
                    }
                }
                if ($(this).attr("id") == 'venue') {
                    $('#userEmail').focus();
                }
                if ($(this).attr("id") == 'userEmail') {
                    if ($scope.accountAdminData.role == 'driver') {
                        $('#userLicence').focus();
                    }
                    if ($scope.accountAdminData.role != 'driver') {
                        $('#userMobile').focus();
                    }
                }
                if ($(this).attr("id") == 'userLicence') {
                    $('#userMobile').focus();
                }
                if ($(this).attr("id") == 'userMobile') {
                    $('#userPassword').focus();
                }
                if ($(this).attr("id") == 'userPassword') {
                    $('#createBtn').click();
                    $timeout(function() {
                        $('#userName').focus();
                    }, 500);
                }
            }
        })

    })


    // $scope.postUserViaAccount = function(data, addAccountUser) {

    //     $scope.addAccountUser = addAccountUser;
    //     $scope.addAccountUser.submitted = true;
    //     // alert(JSON.stringify(addAccountUser.$valid));
    //     if (addAccountUser.$valid) {
    //         // alert(JSON.stringify(data));
    //         var _res = userService.postUserViaAccount($scope.accountAdminData);
    //         _res.then(function(data) {
    //             if ($rootScope.$user.role == 'admin')
    //                 $rootScope.thisAccount.users.push(data.data);
    //             else
    //                 $rootScope.accountadminData.users.push(data.data);
    //             $('.modal').modal('hide');
    //         });
    //     } else {
    //         // alert()
    //     }
    // }

    $scope.images = [];
    $scope.postUserViaAccount = function(imagesUploadedbyUser, data, addAccountUser) {
        console.log('--' + JSON.stringify(imagesUploadedbyUser));
        $scope.addAccountUser = addAccountUser;
        // $scope.addAccountUser.submitted = true;
        // if (addAccountUser.$valid) {
        if (imagesUploadedbyUser && imagesUploadedbyUser.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < imagesUploadedbyUser.length) {
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: imagesUploadedbyUser[img],
                        params: {
                            filename: imagesUploadedbyUser[img].name,
                            file: imagesUploadedbyUser[img]
                        }
                    }).success(function(data) {
                        if (!$scope.accountAdminData.documents)
                            $scope.accountAdminData.documents = [];
                        $scope.accountAdminData.documents.push(imagesUploadedbyUser[img].name);
                        // console.log('+++++{}' + $scope.accountAdminData.documents);
                        img++;
                        imageUpload(img);
                    });
                } else
                    userInsert();
            }
        } else
            userInsert();

        function userInsert() {
            var _res = userService.postUserViaAccount($scope.accountAdminData);
            _res.then(function(data) {
                $scope.addAccountUser.$setPristine();
                $('.modal').modal('hide');
                $scope.init();
                if ($rootScope.$user.role == 'admin')
                    $rootScope.thisAccount.users.push(data.data);
                else
                    $rootScope.accountadminData.users.push(data.data);

            });
        }
        // } else {
        //     // alert()
        // }
    }

    $scope.createUserWithCustomizeData = function(imagesUploadedbyUser, data, addAccountUser) {
        $rootScope.loadRunner = true;
        if (imagesUploadedbyUser && imagesUploadedbyUser.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < imagesUploadedbyUser.length) {
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: imagesUploadedbyUser[img],
                        params: {
                            filename: imagesUploadedbyUser[img].name,
                            file: imagesUploadedbyUser[img]
                        }
                    }).success(function(data) {
                        if (!$scope.accountAdminData.documents)
                            $scope.accountAdminData.documents = [];
                        $scope.accountAdminData.documents.push(imagesUploadedbyUser[img].name);
                        img++;
                        imageUpload(img);
                    });
                } else
                    userInsert();
            }
        } else 
            userInsert();

        function userInsert() {
            var _res = userService.createUserWithCustomizeData($scope.accountAdminData);
            _res.then(function(data) {
                $scope.addAccountUser.$setPristine();
                $('.modal').modal('hide');
                $scope.init();
                $rootScope.loadRunner = false;
            });
        }
    }


    $scope.close = function() {
        $scope.init();
        $('.modal').modal('hide');
        $scope.addAccountUser.$setPristine();
    }


});