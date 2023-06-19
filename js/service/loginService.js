'use strict';
app.factory('loginService', function($http, Auth, $rootScope, $state, $localStorage, $window, notificationService, localStorageService, parkingService, offlineLoginService, offlineDBCreateandDelteService, dataService) {
    return {
        login: function(user) {
            $rootScope.loadRunner = true;
            $rootScope.userLogin = Auth;
            var postData = { email: user.email, password: user.password };
            // console.log(JSON.stringify(user));
            $http.post($rootScope.ipAddress + '/session/SessionCreate', postData)
                .success(function(data) {
                    // console.log('----->' + JSON.stringify(data))
                    setTimeout(() => {
                        $rootScope.loadRunner = false;
                    }, 1000);
                    $rootScope.reports = [];
                    // $rootScope.SelectedVenueName ='';
                    // console.log('session '+JSON.stringify(data));
                    $rootScope.toDate = new Date(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + (new Date().getDate() + 1));
                    $rootScope.fromDate = new Date(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate());

                    if (JSON.stringify(data.user)) {
                        $localStorage.user = data.user;
                        $rootScope.$user = data.user;
                        if ($rootScope.$user.accountID) {
                            if ($rootScope.$user.accountID.readPlateNumber) {
                                $window.readPlateNumber = $rootScope.$user.accountID.readPlateNumber;
                            }
                        }
                        // $rootScope.callWhenLoginTime(); // for analysis init
                        if ($rootScope.$user) {
                            $rootScope.requestedCar = [];
                            $rootScope.parkedCar = [];
                            // if ($rootScope.$user.venues.length > 0)
                            //     parkingService.getCarDetails($rootScope.$user.venues);
                            // else {
                            //     if (data.user.role == "admin")
                            //         parkingService.getCarDetails($rootScope.$user.venues);
                            // }
                        }
                        dataService.socketConnect();
                        if (data.user.role == "admin") {
                            localStorageService.set("VPSUser", $rootScope.$user);
                            localStorageService.set("VPSUserisLoggedIn", true);
                            $rootScope.userLogin.isLoggedIn = true;
                            $state.go('app.superadminDashboard');
                            notificationService.successNotify('You have successfully logged in..', 5000);
                            checkUserInfoExists();
                        } else if (data.user.role == "accountadmin") {
                            localStorageService.set("VPSUser", $rootScope.$user);
                            localStorageService.set("VPSUserisLoggedIn", true);
                            $rootScope.userLogin.isLoggedIn = true;
                            $state.go('app.mainDashboard');
                            notificationService.successNotify('You have successfully logged in..', 5000);
                            checkUserInfoExists();
                        } else if (data.user.role == "manager") {
                            localStorageService.set("VPSUser", $rootScope.$user);
                            localStorageService.set("VPSUserisLoggedIn", true);
                            $rootScope.userLogin.isLoggedIn = true;
                            $state.go('app.carTransaction');
                            notificationService.successNotify('You have successfully logged in..', 5000);
                            checkUserInfoExists();
                        } else if (data.user.role == "chauffeur" || data.user.role == "driver") {
                            localStorageService.set("VPSUser", $rootScope.$user);
                            localStorageService.set("VPSUserisLoggedIn", true);
                            $rootScope.userLogin.isLoggedIn = true;
                            $state.go('app.carTransaction');
                            notificationService.successNotify('You have successfully logged in..', 5000);
                            checkUserInfoExists();
                        } else if (data.user.role == "validator") {
                            localStorageService.set("VPSUser", $rootScope.$user);
                            localStorageService.set("VPSUserisLoggedIn", true);
                            $rootScope.userLogin.isLoggedIn = true;
                            $state.go('app.validate');
                            notificationService.successNotify('You have successfully logged in..', 5000);
                            checkUserInfoExists();
                        } else if (data.user.role == "accountinguser") {
                            localStorageService.set("VPSUser", $rootScope.$user);
                            localStorageService.set("VPSUserisLoggedIn", true);
                            $rootScope.userLogin.isLoggedIn = true;
                            $state.go('app.dashboard');
                            notificationService.successNotify('You have successfully logged in..', 5000);
                            checkUserInfoExists();
                        } else
                            alert('other');

                        function checkUserInfoExists() {
                            // check();
                        }

                        function isJSON(str) {
                            try {
                                JSON.parse(str);
                            } catch (e) {
                                return false;
                            }
                            return true;
                        }

                        function check() {
                            // alert('check')
                            db.transaction(function(transaction) {
                                transaction.executeSql('SELECT count(*) AS c FROM EvaletzUsers', [], function(trx, result) {
                                    if (result.rows.item(0).c != 0) {
                                        transaction.executeSql('SELECT * FROM EvaletzUsers', [], function(trx, result) {
                                            if (result.rows.item.length > 0) {
                                                var accountExists = (isJSON(result.rows.item(0).accountID) ? JSON.parse(result.rows.item(0).accountID) : result.rows.item(0).accountID)
                                                    // console.log(JSON.stringify(accountExists))
                                                if (accountExists.id != data.user.accountID) {
                                                    offlineDBCreateandDelteService.deleteDBs(function() {
                                                        offlineDBCreateandDelteService.createDBs();
                                                        storeUserInfo();
                                                    });
                                                } else {
                                                    transaction.executeSql('DELETE FROM EvaletzUsers WHERE id = ?', [data.user.id], function(trx, result) {
                                                        storeUserInfo();
                                                    }, function(transaction, error) {
                                                        storeUserInfo();
                                                    });
                                                }
                                            } else {
                                                transaction.executeSql('DELETE FROM EvaletzUsers WHERE id = ?', [data.user.id], function(trx, result) {
                                                    storeUserInfo();
                                                }, function(transaction, error) {
                                                    storeUserInfo();
                                                });
                                            }
                                        }, function() {
                                            if (data.user.role != 'admin') {
                                                storeUserInfo();
                                            }
                                        });
                                    } else {
                                        if (data.user.role != 'admin') {
                                            storeUserInfo();
                                        }
                                    }
                                }, function() {
                                    if (data.user.role != 'admin') {
                                        storeUserInfo();
                                    }
                                });
                            });
                        }

                        function storeUserInfo() {
                            // alert("storeInfo")
                            db.transaction(
                                function(transaction) {
                                    transaction.executeSql(
                                        'INSERT INTO EvaletzUsers (fullName, userName, email, mobile, role, profileImage, id, venues, accountID, licenseNumber) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', [
                                            data.user.fullName,
                                            data.user.userName,
                                            data.user.email,
                                            data.user.mobile,
                                            data.user.role,
                                            data.user.profileImage,
                                            data.user.id,
                                            JSON.stringify(data.user.venues),
                                            JSON.stringify(data.user.accountID),
                                            data.user.licenseNumber
                                        ],
                                        function() {
                                            if (data.user.role != 'admin') {
                                                // offlineLoginService.needToStoreAccountUsers();
                                                // offlineLoginService.needToStoreAccountVenues();
                                                // parkingService.getCarDetails($rootScope.$user.venues);
                                            }
                                        },
                                    );
                                }
                            );
                        }
                    } else if (JSON.stringify(data.notMatchingPassword)) {
                        notificationService.errorNotify("Your password doesn't match..");
                    } else if (JSON.stringify(data.blocked)) {
                        notificationService.errorNotify("Your account is blocked, Contact Super Admin");
                    } else if (JSON.stringify(data.expired)) {
                        notificationService.errorNotify("Your account is expired...");
                    } else {
                        notificationService.errorNotify("Email/Password doesn’t match..");
                    }
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    notificationService.errorNotify("Unable to connect server. Kindly check your internet connection.");
                    return;
                });
        },
        offlineLogin: function(user) {
            // $rootScope.loadRunner = true;
            // $rootScope.userLogin = Auth;
            // var postData = { email: user.email, password: user.password };

            // var array = [];

            // function isJSON(str) {
            //     try {
            //         JSON.parse(str);
            //     } catch (e) {
            //         return false;
            //     }
            //     return true;
            // }
            // db.transaction(function(transaction) {
            //     transaction.executeSql('SELECT * FROM EvaletzUsers WHERE email = ?', [user.email], function(trx, result) {
            //         if (result.rows.length != 0)
            //             getData(0);
            //         else
            //             notificationService.errorNotify("User not found..");

            //         function getData(i) {
            //             if (i < result.rows.length) {
            //                 $rootScope.$user = {
            //                     fullName: result.rows.item(i).fullName,
            //                     userName: result.rows.item(i).userName,
            //                     email: result.rows.item(i).email,
            //                     mobile: result.rows.item(i).mobile,
            //                     profileImage: result.rows.item(i).profileImage,
            //                     role: result.rows.item(i).role,
            //                     venues: (isJSON(result.rows.item(i).venues) ? JSON.parse(result.rows.item(i).venues) : result.rows.item(i).venues),
            //                     accountID: (isJSON(result.rows.item(i).accountID) ? JSON.parse(result.rows.item(i).accountID) : result.rows.item(i).accountID),
            //                     id: result.rows.item(i).id,
            //                     licenseNumber: result.rows.item(i).licenseNumber
            //                 };
            //                 i++;
            //                 getData(i);
            //             } else {
            //                 $rootScope.loadRunner = false;
            //                 $rootScope.reports = [];
            //                 $rootScope.toDate = new Date(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + (new Date().getDate() + 1));
            //                 $rootScope.fromDate = new Date(new Date().getFullYear() + "/" + (new Date().getMonth() + 1) + "/" + new Date().getDate());
            //                 if (JSON.stringify($rootScope.$user)) {
            //                     $localStorage.user = $rootScope.$user;
            //                     if ($rootScope.$user.accountID) {
            //                         if ($rootScope.$user.accountID.readPlateNumber) {
            //                             $window.readPlateNumber = $rootScope.$user.accountID.readPlateNumber;
            //                         }
            //                     }
            //                     if ($rootScope.$user) {
            //                         $rootScope.requestedCar = [];
            //                         $rootScope.parkedCar = [];
            //                         if ($rootScope.$user.venues.length > 0)
            //                             parkingService.getCarDetails($rootScope.$user.venues);
            //                         else {
            //                             if ($rootScope.$user.role == "admin")
            //                                 parkingService.getCarDetails($rootScope.$user.venues);
            //                         }
            //                     }

            //                     if ($rootScope.$user.role == "admin") {
            //                         localStorageService.set("VPSUser", $rootScope.$user);
            //                         localStorageService.set("VPSUserisLoggedIn", true);
            //                         $rootScope.userLogin.isLoggedIn = true;
            //                         $state.go('app.tabview.parkedcar');
            //                         notificationService.successNotify('You have successfully logged in..', 5000);
            //                     } else if ($rootScope.$user.role == "accountadmin") {
            //                         localStorageService.set("VPSUser", $rootScope.$user);
            //                         localStorageService.set("VPSUserisLoggedIn", true);
            //                         $rootScope.userLogin.isLoggedIn = true;
            //                         $state.go('app.tabview.parkedcar');
            //                         notificationService.successNotify('You have successfully logged in..', 5000);
            //                         // checkUserInfoExists();
            //                     } else if ($rootScope.$user.role == "manager") {
            //                         localStorageService.set("VPSUser", $rootScope.$user);
            //                         localStorageService.set("VPSUserisLoggedIn", true);
            //                         $rootScope.userLogin.isLoggedIn = true;
            //                         $state.go('app.tabview.parkedcar');
            //                         notificationService.successNotify('You have successfully logged in..', 5000);
            //                         // checkUserInfoExists();
            //                     } else if ($rootScope.$user.role == "chauffeur" || $rootScope.$user.role == "driver") {
            //                         localStorageService.set("VPSUser", $rootScope.$user);
            //                         localStorageService.set("VPSUserisLoggedIn", true);
            //                         $rootScope.userLogin.isLoggedIn = true;
            //                         $state.go('app.tabview.parkedcar');
            //                         notificationService.successNotify('You have successfully logged in..', 5000);
            //                         // checkUserInfoExists();
            //                     } else
            //                         alert('other');
            //                 }
            //             }
            //         }
            //         $rootScope.loadRunner = false;
            //     }, function(trx, result) {
            //         console.log(JSON.stringify(result))
            //         return;
            //     });
            // });
        },
        logout: function() {
            // $rootScope.loadRunner = true;
            // var postData = { userID: $rootScope.$user.id };
            // $http.post($rootScope.ipAddress + '/session/deleteSessionObject', postData)
            //     .success(function(data) {
            // $rootScope.loadRunner = false;
            localStorageService.remove("VPSUser");
            localStorageService.remove("VPSUserisLoggedIn", false);
            $rootScope.userLogin.isLoggedIn = false;
            $rootScope.$user = {};
            $localStorage.user = {};
            $rootScope.parkedCar = [];
            $rootScope.requestedCar = [];
            $rootScope.filteredParkedCar = [];
            $rootScope.completedCar = [];
            $rootScope.filteredRequestedCar = [];
            $rootScope.filteredCompletedCar = [];
            dataService.socketDisconnect();
            angular.forEach($http.pendingRequests, function(request) {
                if (request.cancel) {
                    request.cancel.resolve();
                }
            });
            // });
        },
        requestCar: function(request) {
            $rootScope.loadRunner = true;
            // console.log('request car called');
            // replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
            var postData = { mobile: request.mobile, plateNumber: request.plateNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase(), parkingID: request.ticket };
            // console.log('====' + request.plateNumber.replace(/[^a-zA-Z0-9]/g, "").toLowerCase());
            $http.post($rootScope.ipAddress + '/requestcar/requestCarFromAPICall', postData)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    // console.log('request process'+JSON.stringify(data.car));
                    if (JSON.stringify(data.car)) {
                        // alert(">>> "+data.car.message)
                        if (data.car.message == undefined) {
                            // notificationService.successNotify('Request send successfully...', 5000);
                        } else {
                            // notificationService.successNotify("" + data.car.message, 5000);
                        }
                        //notificationService.successNotify('Request Send Successfully...', 5000);
                        //$window.location.href = "response_car_request.html";
                    } else if (JSON.stringify(data.notValidCar)) {
                        $rootScope.notValidCar = true;
                        notificationService.errorNotify("Car is not found...");
                        //$window.location.href = "response_car_error.html";
                    } else {
                        $rootScope.notFound = true;
                        notificationService.errorNotify("Car is not found...");
                        //$window.location.href = "response_car_error.html";
                    }

                });
        },
        requestCarByUser: function(request) {
            $rootScope.loadRunner = true;
            var postData = { mobile: request.mobile, plateNumber: request.plateNumber, parkingID: request.ticket, profileImage: request.profileImage };
            // console.log('request car from service' + JSON.stringify(postData));
            $http.post($rootScope.ipAddress + '/requestcar/requestCarFromAPICall', postData)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    if (JSON.stringify(data.car)) {
                        // notificationService.successNotify('Request send successfully...', 5000);
                    } else if (JSON.stringify(data.notValidCar)) {
                        $rootScope.notValidCar = true;
                        notificationService.errorNotify("Car is not found...");
                    } else {
                        $rootScope.notFound = true;
                        notificationService.errorNotify("Car is not found...");
                    }

                });
        },

        forgotPassReq: function(credential) {
            $rootScope.loadRunner = true;
            $rootScope.foremail = credential.email;
            // console.log('forgot pass' + JSON.stringify(credential));
            var postData = { email: credential.email, mobile: credential.number };
            $http.post($rootScope.ipAddress + '/user/forgotPasswordRequest', postData).success(function(data) {
                $rootScope.loadRunner = false;
                if (data.notValid) {
                    notificationService.errorNotify("Email not found...");
                    return;
                }
                if (data.notMatchingMobile) {
                    notificationService.errorNotify("Credentials not matching!");
                    return;
                } else
                    $rootScope.showpass = true;
            });
        },
        setPass: function(newPass, ids) {
            $rootScope.loadRunner = true;
            if ($rootScope.$prevState != 'attendant_profile') {
                var postData = { newPassword: newPass, email: ids };
            } else {
                var postData = { newPassword: newPass, email: $rootScope.$user.email };
                // console.log('pass in service else' + JSON.stringify(postData));
            }

            $http.post($rootScope.ipAddress + '/user/changePassword', postData).success(function(data) {
                $rootScope.loadRunner = false;
                if (!data.result) {
                    notificationService.errorNotify("Password set failed!");
                    return;
                } else {
                    notificationService.successNotify('Password changed successfully...', 5000);
                    $state.go('login');
                }
            });
        },
        changePass: function(newPass) {
            $rootScope.loadRunner = true;
            var postData = { newPassword: newPass, email: $rootScope.$user.email };
            $http.post($rootScope.ipAddress + '/user/changePassword', postData).success(function(data) {
                $rootScope.loadRunner = false;
                if (!data.result) {
                    notificationService.errorNotify("Password set failed!");
                    return;
                } else {
                    notificationService.successNotify('Password changed successfully...', 5000);
                    $state.go('app.userProfile');

                }
            });
        },
        addCar: function() {
            $rootScope.loadRunner = true;
            var postData = {
                accountID: $rootScope.$user.accountID.id
            };
            $http.post($rootScope.ipAddress + '/file/upload', postData).success(function(data) {
                $rootScope.loadRunner = false;
                if (data.success == 'success') {
                    $state.go("add_car");
                } else //if(data.success=='error')
                {
                    // console.log('Reached the maximil limit / subscription expired Error!!!');
                    notificationService.errorNotify("Subscription Expired / Maximum Car Parked");
                }
            }).error(function(data) {
                $rootScope.loadRunner = false;
                // notificationService.errorNotify("Unable to connect Server ");
            });
        }
    }

});

app.factory('offlineLoginService', function($rootScope, $http) {
    return {
        needToStoreAccountUsers: function() { return; },
        needToStoreAccountVenues: function() { return; },
        gettingAccountUsers: function(cb) { return cb(); },
        gettingAccountVenuesWithUsers: function(cb) { return cb(); },
        gettingAccountDriversOnly: function(cb) { return cb(); },
        dropTableFrom: function(DB) {
            // db.transaction(function(transaction) {
            //     transaction.executeSql('DROP TABLE ' + DB);
            // });
        },
    }
})