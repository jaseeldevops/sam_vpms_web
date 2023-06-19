app.controller('userCtrl', function($state, $scope, $rootScope, $http, $localStorage, userService, notificationService, $stateParams, $timeout, Upload, $uibModal) {
    $rootScope.details;
    // if ($rootScope.$user && $rootScope.$user.role != 'validator' && $rootScope.$user.role != 'accountinguser') {
        // userService.userList();
        // userService.getUserDetails();
    // }


    $scope.list = function(details) {
        $rootScope.details = details;
    }

    $scope.enableEditor = false;
    $scope.edited = {
        fullName: '',
        mobile: '',
        email: '',
        companyName: ''

    };

    $scope.seletUserToVenue = function(userID, role) {
        $localStorage.userID = userID;
        $rootScope.$userID = $localStorage.userID;
        $localStorage.role = role;
        $rootScope.$role = $localStorage.role;
        //$state.go("assign_venue");
    }

    $scope.selectAccountUserToVenue = function(userID, role) {
        $localStorage.userID = userID;
        $rootScope.$userID = $localStorage.userID;
        $localStorage.role = role;
        $rootScope.$role = $localStorage.role;
        //$state.go("assignAccountVenue");
    }


    $scope.deleteUser = function() {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover user data!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            var _res = userService.deleteUser($rootScope.details);
            _res.then(function(data) {
                swal("Deleted!", "Your user data has been deleted.", "success");
                $state.go('settings.users');
                if ($rootScope.$user.role != 'chauffeur') {
                    for (var i = 0; i < $scope.managers.length; i++) {
                        if ($scope.managers[i].id == $rootScope.details.id) {
                            $scope.managers.splice(i, 1);
                        }
                    }
                    for (var j = 0; j < $scope.accountadmin.length; j++) {
                        if ($scope.accountadmin[j].id == $rootScope.details.id) {
                            $scope.accountadmin.splice(j, 1);
                        }
                    }
                    for (var k = 0; k < $scope.chauffeurs.length; k++) {
                        if ($scope.chauffeurs[k].id == $rootScope.details.id) {
                            $scope.chauffeurs.splice(k, 1);
                        }
                    }
                    for (var k = 0; k < $scope.driver.length; k++) {
                        if ($scope.driver[k].id == $rootScope.details.id) {
                            $scope.driver.splice(k, 1);
                        }
                    }
                }

            });
        });

    }
    $scope.saveEditedUser = function() {
        $scope.enableEditor = true;
        userService.saveEditedUser($rootScope.details);
        $('#userProfileEdit').modal('hide');
        notificationService.successNotify('User profile edited successfully...', 5000);
    }
    $scope.deleteAccountUser = function() {
        // alert(JSON.stringify($rootScope.thisAccountUserLogDetails));
        // if (confirm('Do you really want to delete User Data ?')) {
        //     var _user = userService.deleteAccountUser($rootScope.thisAccountUserLogDetails);
        //     _user.then(function(data) {
        //         $state.go('settings.accountUserList');
        //         for (var i = 0; i < $rootScope.thisAccount.users.length; i++) {
        //             if ($rootScope.thisAccount.users[i].id == $rootScope.thisAccountUserLogDetails.id) {
        //                 $rootScope.thisAccount.users.splice(i, 1);
        //             }
        //         }
        //     })
        // }
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover user data!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: true
        }, function() {
            var _user = userService.deleteAccountUser($rootScope.thisAccountUserLogDetails);
            _user.then(function(data) {
                swal("Deleted!", "Your user data has been deleted.", "success");
                $state.go('settings.accountUserList');
                if ($rootScope.thisAccount && $rootScope.thisAccount.users) {
                    for (var i = 0; i < $rootScope.thisAccount.users.length; i++) {
                        if ($rootScope.thisAccount.users[i].id == $rootScope.thisAccountUserLogDetails.id) {
                            $rootScope.thisAccount.users.splice(i, 1);
                        }
                    }
                }
            })
        });
    }


    $('#userProfileEdit').on('shown.bs.modal', function() {
        if ($state.current.name == 'app.userProfile') {
            $timeout(function() {
                $('#profileMobile').focus();
            }, 500);
            $(document).on('keypress', 'input, select, textarea', function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    if ($(this).attr("id") == 'profileUserName') {
                        $('#profileMobile').focus();
                    }

                    if ($(this).attr("id") == 'profileMobile') {
                        $('#profileEmail').focus();
                    }
                    if ($(this).attr("id") == 'profileEmail') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#profileUpdateBtn').click();
                        $('#profileUserName').focus();
                    }
                }
            })
        }
        if ($state.current.name == 'app.accountUserDetails') {
            $timeout(function() {
                $('#editMobile').focus();
            }, 500);
            $(document).on('keypress', 'input, select, textarea', function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    if ($(this).attr("id") == 'editUsername') {
                        $('#editMobile').focus();
                    }
                    if ($(this).attr("id") == 'editMobile') {
                        $('#editEmail').focus();
                    }
                    if ($(this).attr("id") == 'editEmail') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#updateUserBtn').click();
                        $('#editUsername').focus();
                    }
                }
            })
        }
    });

    $scope.saveEditedAccountUser = function() {
        userService.saveEditedAccountUser($rootScope.thisAccountUserLogDetails);
        // $scope.enableEditor = !$scope.enableEditor;
        notificationService.successNotify('User profile edited successfully...', 5000);
        $('#userProfileEdit').modal('hide');
    }

    $scope.saveEditedProfileUser = function() {
        userService.saveEditedProfileUser($rootScope.$user);
        // $scope.enableEditor = !$scope.enableEditor;
        notificationService.successNotify('User profile edited successfully...', 5000);
        $('#userProfileEdit').modal('hide');
    }

    // io.socket.on('user', function(obj) {
    //     if (obj.verb === 'created') {
    //         $rootScope.$apply(function() {
    //             if ($rootScope.$user.role == 'admin') {
    //                 if (obj.data.role == 'manager') {
    //                     $rootScope.managers.push(obj.data);
    //                     notificationService.successNotify('New Manager Added...', 5000);
    //                 }
    //                 if (obj.data.role == 'accountadmin') {
    //                     $rootScope.accountadmin.push(obj.data);
    //                     notificationService.successNotify('New Account Admin Added...', 5000);
    //                 }
    //                 if (obj.data.role == 'chauffeur') {
    //                     $rootScope.chauffeurs.push(obj.data);
    //                     notificationService.successNotify('New Chauffeur Added...', 5000);
    //                 }

    //             } else if ($rootScope.$user.role == 'accountadmin') {
    //                 if (obj.data.role == 'manager') {
    //                     $rootScope.managers.push(obj.data);
    //                     notificationService.successNotify('New Manager Added...', 5000);
    //                 }
    //                 if (obj.data.role == 'chauffeur') {
    //                     $rootScope.chauffeurs.push(obj.data);
    //                     notificationService.successNotify('New Chauffeur Added...', 5000);
    //                 }

    //             } else if ($rootScope.$user.role == 'manager') {
    //                 if (obj.data.role == 'chauffeur') {
    //                     $rootScope.chauffeurs.push(obj.data);
    //                     notificationService.successNotify('New Chauffeur Added...', 5000);
    //                 }
    //             }

    //             obj.verb = '';
    //         });

    //     }
    //     var processed = false;
    //     if (obj.verb === 'destroyed') {
    //         $state.go('app.userList2');
    //         if ($rootScope.$user.role != 'chauffeur') {
    //             $rootScope.$apply(function() {
    //                 if (processed == false) {
    //                     for (var i = 0; i < $scope.managers.length; i++) {
    //                         if ($scope.managers[i].id == obj.id) {
    //                             $scope.managers.splice(i, 1);
    //                             notificationService.successNotify('One Manager Deleted...', 5000);
    //                             processed = true;
    //                         }
    //                     }
    //                 }
    //                 if (processed == false) {
    //                     for (var j = 0; j < $scope.accountadmin.length; j++) {
    //                         if ($scope.accountadmin[j].id == obj.id) {
    //                             $scope.accountadmin.splice(j, 1);
    //                             notificationService.successNotify('One Account Admin Deleted...', 5000);
    //                             processed = true;
    //                         }
    //                     }
    //                 }
    //                 if (processed == false) {
    //                     for (var k = 0; k < $scope.chauffeurs.length; k++) {
    //                         if ($scope.chauffeurs[k].id == obj.id) {
    //                             $scope.chauffeurs.splice(k, 1);
    //                             notificationService.successNotify('One Chauffeur Deleted...', 5000);
    //                             processed = true;
    //                         }
    //                     }
    //                 }
    //                 obj.verb = '';

    //             });
    //         }
    //     }
    // });

    // profile upload
    $scope.hideButton = false;
    $scope.hideProfile = function() {
        $scope.hideButton = true;
    }

    $scope.cancelUpload = function() {
        $scope.hideButton = false;
    }

    $scope.UploadProFile = function(fileInfo, id) {
        $rootScope.loadRunner = true;
        if (fileInfo !== undefined && id !== undefined) {
            return Upload.upload({
                url: $rootScope.ipAddress + '/user/UploadProFile',
                params: {
                    'id': id,
                    'Content-Type': fileInfo.type
                },
                data: {
                    file: fileInfo
                }
            }).success(function(data) {
                $timeout(function() {
                    // console.log('uploaded profile img' + JSON.stringify(data));
                    notificationService.successNotify('profile image upload sucessfully...');
                });
            });
        } else {
            // $rootScope.loadRunner = false;
            // console.log('null' + JSON.stringify(file));
        }
    };

    $scope.cancelImage = false;
    // edit function
    $scope.editButton = function() {
        $scope.enableEditor = !$scope.enableEditor
    }
    $scope.getAccountUserVenueInit = function(userID) {
        $rootScope.loadRunner = true;
        $http.get($rootScope.ipAddress + '/user/' + userID + "?populate=null").success(function(data) {
            $rootScope.loadRunner = false;
            // data.master = [];
            // data.daily = [];
            // if (data.accountID) {
            //     if (data.accountID.subscriptionLog && data.accountID.subscriptionLog.length > 0) {
            //         delete data.accountID.subscriptionLog;
            //     }
            // }
            $rootScope.thisAccountUserLogDetails = data;
        }).error(function(err) {
            $rootScope.loadRunner = false;
        });
    }
    $scope.getViewedUserVenueDeatsil = function(userID) {
        $http.get($rootScope.ipAddress + '/user/' + userID + "?populate=venues").success(function(data) {
            $rootScope.details.venues = data.venues;
        }).error(function(err) {});
    }


    $scope.openUserProfileEditModal = function(type) {
        $scope.formType = type;
        $('#userProfileEdit').modal('show');
    }
    $scope.close = function() {
        $('.modal').modal('hide');
    }
    $scope.openUserCreateModal = function() {
        $('#userCreationModal').modal('show')
    }

    $scope.searchUserName2 = '';
    $scope.pressedKeyByUsername = function(data) {
        $scope.searchUserName2 = data;
    }


    $scope.filterVenueWiseUserDetails1 = function() {
        if ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) {
            $rootScope.filteredChauffeurs = _.filter($rootScope.chauffeurs, (d) => {
                return (_.filter(d.venues, (v) => { return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id })).length > 0;
            });
            $rootScope.filteredDrivers = _.filter($rootScope.drivers, (d) => {
                return (_.filter(d.venues, (v) => { return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id })).length > 0;
            });
        } else {
            $rootScope.filteredChauffeurs = angular.copy($rootScope.chauffeurs);
            $rootScope.filteredDrivers = angular.copy($rootScope.drivers);
        }
    }
    /* select reset */
    $scope.refreshResults = function($select) {
        var search = $select.search,
            list = angular.copy($select.items),
            FLAG = -1;
        //remove last user input
        list = list.filter(function(item) {
            return item.id !== FLAG;
        });

        if (!search) {
            //use the predefined list
            $select.items = list;
        } else {
            //manually add user input and set selection
            var userInputItem = {
                id: FLAG,
                description: search
            };
            $select.items = [userInputItem].concat(list);
            $select.selected = userInputItem;
        }
    }

    $scope.clear = function($event, $select) {
        $event.stopPropagation();
        //to allow empty field, in order to force a selection remove the following line
        $select.selected = undefined;
        //reset search query
        $select.search = undefined;
        //focus and open dropdown
        // $select.activate();
    }
});