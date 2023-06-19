'use strict';
app.factory('parkingService', function($http, $rootScope, notificationService, downloadService, $window, $timeout, pullToRefreshService, offlineDBService, $q, $localStorage, localStorageService) {
    return {
        getCarDetails: function(venueID) {},
        loadMoreCar: function(carCount, carStatus, search, venueID) {
            var deferred = $q.defer();
            $rootScope.onlineSync = false;
            if ($rootScope.$user.role == 'admin')
                return;
            var postData = {};
            if ($rootScope.$user && $rootScope.$user.role != 'validator') {
                $rootScope.nocarfound = "Loading Record...";
                if ($rootScope.$user.role != 'accountadmin' && $rootScope.$user.accountID != undefined) {
                    postData = {
                        venueID: venueID,
                        role: $rootScope.$user.role,
                        accountID: $rootScope.$user.accountID.id
                    };
                } else if ($rootScope.$user.role == 'accountadmin' && $rootScope.$user.accountID != undefined) {
                    postData = {
                        role: $rootScope.$user.role,
                        accountID: $rootScope.$user.accountID.id
                    };
                } else if ($rootScope.$user.role == 'admin') {
                    postData = {
                        venueID: venueID,
                        role: $rootScope.$user.role
                    };
                } else if ($rootScope.$user.accountID == undefined) {
                    // notificationService.errorNotify('You have no account...');
                    return deferred.promise;
                }

                if ($rootScope.$user.role != 'accountadmin') {
                    postData['venueID'] = $rootScope.$user.venues;
                } else if ($rootScope.$user.role == 'accountadmin') {
                    if ($rootScope.selectedOptionsforanAnalysis && $rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) {
                        postData['venueID'] = [$rootScope.selectedOptionsforanAnalysis.venue];
                    }
                }

                postData['search'] = search;
                postData['status'] = carStatus;
                postData['skip'] = carCount;
                postData['limit'] = 9;
                if (carStatus == 'requested')
                    postData['limit'] = 18;

                if ($rootScope.$user.accountID && $rootScope.$user.accountID.timeZone != 'Asia/Dubai')
                    postData['sortByRequested'] = 'indianSort';

                if ($rootScope.loadingScrollBusy) return;
                $rootScope.loadingScrollBusy = true;
                $rootScope.loading = true;
                return $http.post($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICallOnlyforOscarwithLazyLoading', postData)
                    .then(function(data) {
                        data = data.data;
                        $timeout(function() {
                            $rootScope.loadRunner = false;
                        }, 2000);
                        if(data.car){
                            if (carStatus == 'parked') { // && search == ''){ 
                                for (var i = 0; i < data.car.length; i++) {
                                    $rootScope.parkedCar.push(data.car[i]);
                                    if ($rootScope.parkedCar[i].scratchesSnap == null) {
                                        $rootScope.parkedCar[i].scratchesSnap = [];
                                    }
                                }
                                $rootScope.totalParkedCar = data.length;
                                $rootScope.loadingScrollBusy = false;
                                $rootScope.filteredParkedCar = angular.copy($rootScope.parkedCar);
                            }

                            if (carStatus == 'requested') {
                                for (var i = 0; i < data.car.length; i++) {
                                    $rootScope.requestedCar.push(data.car[i]);
                                    if ($rootScope.requestedCar[i].scratchesSnap == null) {
                                        $rootScope.requestedCar[i].scratchesSnap = [];
                                    }
                                }
                                $rootScope.totalRequestedCar = data.length;
                                $rootScope.loadingScrollBusy = false;
                                $rootScope.filteredRequestedCar = angular.copy($rootScope.requestedCar);
                            }

                            if (carStatus == 'complete') {
                                for (var i = 0; i < data.car.length; i++) {
                                    $rootScope.completedCar.push(data.car[i]);
                                    if ($rootScope.completedCar[i].scratchesSnap == null) {
                                        $rootScope.completedCar[i].scratchesSnap = [];
                                    }
                                }
                                $rootScope.totalCompletedCar = data.length;
                                $rootScope.loadingScrollBusy = false;
                                $rootScope.filteredCompletedCar = angular.copy($rootScope.completedCar);
                            }

                            if (JSON.stringify(data.accountVenues) && $rootScope.$user.role == 'accountadmin') {
                                $rootScope.accountVenuesofAccountAdmin = data.accountVenues;
                            }
                        }

                        $rootScope.nocarfound = "No Car Found";
                        $rootScope.loading = false;
                        return data;
                    }).catch((data) => {
                        return data;
                    });
                // return deferred.promise;  
            }
        },
        acceptCar: function(car, driver) {
            $rootScope.loadRunner = true;
            if (car) {
                //var postdata = { dailytransactionalID: car.id, employeeID: $rootScope.$user.id, employeeName: $rootScope.$user.fullName, profileImage: $rootScope.$user.profileImage };
                var postdata = { dailytransactionalID: car.id, employeeID: driver.id, employeeName: driver.userName, };
                if ($rootScope.$user.role != 'driver')
                    postdata['assignedBy'] = $rootScope.$user.userName;
                if (driver.profileImage != undefined && driver.profileImage != 'undefined') {
                    postdata['profileImage'] = driver.profileImage;
                } else {
                    postdata['profileImage'] = null;
                }

                $http.post($rootScope.ipAddress + '/requestcar/acceptCarFromAPICall/', postdata).success(function(data) {
                    // console.log('Server Response Received (success-accept car)...');
                    if (data) {
                        if (data.car == 'carAlreadyInacceptedState') {
                            // alert(car.plateNumber.toUpperCase() + " is already in accepted state.");
                            pullToRefreshService.getCarDetails($rootScope.$user.venues);
                        } else {
                            $rootScope.loadRunner = false;
                        }
                    } else
                        $rootScope.loadRunner = false;

                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    console.log('Server Response Received (error-accept car)...');
                });
                //alert("Sucessfully send...");
            }
        },
        readyState: function(car, driver) {
            $rootScope.loadRunner = true;
            if (car) {
                var postdata = { dailytransactionalID: car.id, employeeID: driver.id, employeeName: driver.userName, };
                if (driver.profileImage != undefined && driver.profileImage != 'undefined') {
                    postdata['profileImage'] = driver.profileImage;
                } else {
                    postdata['profileImage'] = null;
                }

                $http.post($rootScope.ipAddress + '/requestcar/readyStateApiCall/', postdata).success(function(data) {
                    if (data) {
                        if (data.car == 'carAlreadyInacceptedState') {
                            // alert(car.plateNumber.toUpperCase() + " is already in accepted state.");
                            pullToRefreshService.getCarDetails($rootScope.$user.venues);
                        } else {
                            $rootScope.loadRunner = false;
                        }
                    } else
                        $rootScope.loadRunner = false;

                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    console.log('Server Response Received (error-accept car)...');
                });
                //alert("Sucessfully send...");
            }
        },
        specialRequestAccepted: function(car, driver) {
            $rootScope.loadRunner = true;
            if (car) {
                var postdata = { dailytransactionalID: car.id, log: car.log };
                $http.post($rootScope.ipAddress + '/requestcar/specialRequestAccepted/', postdata).success(function(data) {
                    // console.log('Server Response Received (success-special-accept car)...');
                    $rootScope.loadRunner = false;
                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (error-accept car)...');
                });
            }
        },
        rejectCar: function(car) {
            $rootScope.loadRunner = true;
            if (car) {
                var postdata = { dailytransactionalID: car.id, employeeID: $rootScope.$user.id, employeeName: $rootScope.$user.userName };
                $http.post($rootScope.ipAddress + '/requestcar/rejectCarFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (success-reject car)...');
                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (error-reject car)...');
                });
            }
        },
        completeCar: function(car, driver) {
            $rootScope.loadRunner = true;
            if (car) {
                //var postdata = { dailytransactionalID: car.id, employeeID: $rootScope.$user.id, employeeName: $rootScope.$user.fullName, profileImage: $rootScope.$user.profileImage };
                var postdata = { dailytransactionalID: car.id, employeeID: driver.id, employeeName: driver.userName, free: car.free, description: car.description, documents: car.documents };
                if (driver.profileImage != undefined && driver.profileImage != 'undefined') {
                    postdata['profileImage'] = driver.profileImage;
                } else {
                    postdata['profileImage'] = null;
                }

                if (car.free) {
                    postdata['userObject'] = {};
                    postdata['userObject'].fees = 0;
                } else {
                    postdata['userObject'] = {};
                    if(car.customerType.toLowerCase() === 'vip' && car.venue.id === '5ccee033b7765041792353a8') // TVC - Reem island tent 
                        postdata['userObject'].fees = $rootScope.$user.accountID.otherInfo.vip; ////
                    else 
                        postdata['userObject'].fees = car.fees; ////
                    if(car.amountPaid == true || car.amountPaid == false)  //////////
                        postdata['amountPaid'] = car.amountPaid;
                }

                // console.log("--=-=-==-" + JSON.stringify(postdata));
                $http.post($rootScope.ipAddress + '/requestcar/completeCarFromAPICall/', postdata).success(function(data) {
                    // console.log('Server Response Received (success-complete car)...' + JSON.stringify(data));
                    if (data) {
                        if (data.car == 'carAlreadyInCompletedState') {
                            alert(car.plateNumber.toUpperCase() + " is already in completed state.");
                            pullToRefreshService.getCarDetails($rootScope.$user.venues);
                        } else {
                            $rootScope.loadRunner = false;
                        }
                    } else
                        $rootScope.loadRunner = false;
                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (error-complete car)...');
                });
            }
        },
        holdCar: function(car) {
            $rootScope.loadRunner = true;
            if (car) {
                var postdata = { dailytransactionalID: car.id, employeeID: $rootScope.$user.id, employeeName: $rootScope.$user.userName };
                $http.post($rootScope.ipAddress + '/requestcar/holdCarFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (success-hold car)...');
                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (error-hold car)...');
                });
            }
        },
        completeCar2: function(car, driver, proofs, userObject) {
            $rootScope.loadRunner = true;
            // alert(scopes.proofs + "++++++" + scopes.proofs.length);
            var testtt = angular.copy(scopes.proofs)

            runEachProofs(0);

            function runEachProofs(index) {
                if (index < testtt.length) {
                    testtt[index] = testtt[index].toString().substr(testtt[index].toString().lastIndexOf('/') + 1);
                    index++;
                    runEachProofs(index);
                } else {
                    $timeout(function() {
                        if (car) {
                            // alert('inside')
                            $window.uploadAllProofs();
                            //var postdata = { dailytransactionalID: car.id, employeeID: $rootScope.$user.id, employeeName: $rootScope.$user.fullName, profileImage: $rootScope.$user.profileImage };
                            $rootScope.loadRunner = true;

                            if (car.free) {
                                userObject.fees = 0;
                            } else {
                                userObject.fees = car.fees; ////
                            }
                            var postdata = {
                                dailytransactionalID: car.id,
                                employeeID: driver.id,
                                employeeName: driver.userName,
                                proofs: testtt,
                                userObject: userObject,
                                free: car.free,
                                documents: car.documents,
                                description: car.description,
                                fees: car.fees,
                                amountPaid: car.amountPaid
                            };
                            if (driver.profileImage != undefined && driver.profileImage != 'undefined') {
                                postdata['profileImage'] = driver.profileImage;
                            } else {
                                postdata['profileImage'] = null;
                            }

                            // console.log('Completed car data' + JSON.stringify(postdata));
                            $http.post($rootScope.ipAddress + '/requestcar/completeCarFromAPICall/', postdata).success(function(data) {
                                // console.log('Server Response Received (success-complete car)...' + JSON.stringify(data));
                                if (data) {
                                    if (data.car == 'carAlreadyInCompletedState') {
                                        alert(car.plateNumber.toUpperCase() + " is already in completed state.");
                                        pullToRefreshService.getCarDetails($rootScope.$user.venues);
                                    } else {
                                        $rootScope.loadRunner = false;
                                    }
                                } else
                                    $rootScope.loadRunner = false;
                            }).error(function(err) {
                                $rootScope.loadRunner = false;
                                // console.log('Server Response Received (error-complete car)...');
                            });
                        }
                    }, 3000);

                }
            }


        },
        // updateParking zone
        updateParkedZone: function(zoneDetail) {
            $rootScope.loadRunner = true;
            // console.log('Zone update------------' + JSON.stringify(zoneDetail));
            var post = {
                id: zoneDetail.id,
                parkingZone: zoneDetail.parkingZone
            };
            // console.log('posted data' + JSON.stringify(post));
            $http.post($rootScope.ipAddress + '/dailytransactional/updateParkedZone/', post).success(function(data) {
                $rootScope.loadRunner = false;
                // console.log('Server Response Received (success-updateParked Zone)...');
                notificationService.successNotify('Parking zone has been updated..', 5000);
            }).error(function(err) {
                $rootScope.loadRunner = false;
                // console.log('Server Response Received (error-updateParked Zone)...');
            });
        },
        getReport: function(reportDetail, selectedVenue) {
            $rootScope.reportno = "Loading Record...";
            if (selectedVenue == undefined || selectedVenue == null || selectedVenue == '')
                selectedVenue = 'All';
            $rootScope.loadRunner = true;
            var filterstarttime = new Date(reportDetail.fromDate) //.getTime();
            var filterendtime = new Date(reportDetail.toDate) //.getTime();
            var venueIDs = $rootScope.$user.venues;

            var newD = new Date((reportDetail.toDate) + 86400000).getTime();
            var post = {
                    fromDate: moment(filterstarttime).format('YYYY-MM-DD'), //reportDetail.fromDate,
                    toDate: moment(filterendtime).format('YYYY-MM-DD'), //newD,
                    venueID: selectedVenue,
                    role: 'accountadmin', //$rootScope.$user.role,
                    accountID: $rootScope.$user.accountID.id
                }
                // console.log('get report data---info' + JSON.stringify(post));
            var __url = '';
            if ($rootScope.$user.accountID.id == "5a063bc79f8caede0a58fd39") {
                __url = $rootScope.ipAddress + '/dailytransactional/getReportforOscar';
            } else {
                __url = $rootScope.ipAddress + '/dailytransactional/getReport';
            }
            $http.post(__url, post)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    if (data) {
                        $rootScope.showButton = true;
                        $rootScope.reports = [];
                        if ($rootScope.$user.accountID.id == "5a063bc79f8caede0a58fd39") {
                            $rootScope.reports = data;
                            $rootScope.notOscarVerion = false;
                            $rootScope.reportno = "No Record Found ";
                        } else {
                            downloadService.convertDatatoExcelView(data);
                            $rootScope.notOscarVerion = true;
                        }

                        $rootScope.reportsWidget = {};
                        $rootScope.reportsWidget['parked'] = _.filter(data, function(obj) {
                            return (obj.log[obj.log.length - 1].activity == 'parked' || obj.log[obj.log.length - 1].activity == 'plateNumber' || obj.log[obj.log.length - 1].activity == 'parkingID' || obj.log[obj.log.length - 1].activity == 'parkingZone');
                        }).length
                        $rootScope.reportsWidget['requested'] = _.filter(data, function(obj) {
                            return obj.log[obj.log.length - 1].activity == 'requested';
                        }).length

                        $rootScope.reportsWidget['accept'] = _.filter(data, function(obj) {
                            return obj.log[obj.log.length - 1].activity == 'accept';
                        }).length

                        $rootScope.reportsWidget['completed'] = _.filter(data, function(obj) {
                            return obj.log[obj.log.length - 1].activity == 'completed';
                        }).length

                    } else {
                        $rootScope.showButton = false;
                    }
                });
            $rootScope.loadRunner = false;
        },
        getReportforAdmin: function(reportDetail) {
            $rootScope.reportno = "Loading Record...";
            $rootScope.loadRunner = true;
            var filterstarttime = new Date(reportDetail.fromDate) //.getTime();
            var filterendtime = new Date(reportDetail.toDate) //.getTime();
            var newD = new Date((reportDetail.toDate) + 86400000).getTime();
            var post = {
                    fromDate: moment(filterstarttime).format('YYYY-MM-DD'), //reportDetail.fromDate,
                    toDate: moment(filterendtime).format('YYYY-MM-DD'), //newD,
                    role: $rootScope.$user.role,
                    accountID: reportDetail.account
                }
                // console.log(JSON.stringify(post))
            $http.post($rootScope.ipAddress + '/dailytransactional/getReportforAdmin', post)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    $rootScope.reportno = "No Record Found ";
                    if (data) {
                        $rootScope.showButton = true;
                        $rootScope.reports = data;
                        $rootScope.reportsWidget = {};
                        $rootScope.reportsWidget['parked'] = _.filter(data, function(obj) {
                            return (obj.log[obj.log.length - 1].activity == 'parked' || obj.log[obj.log.length - 1].activity == 'plateNumber' || obj.log[obj.log.length - 1].activity == 'parkingID' || obj.log[obj.log.length - 1].activity == 'parkingZone');
                        }).length
                        $rootScope.reportsWidget['requested'] = _.filter(data, function(obj) {
                            return obj.log[obj.log.length - 1].activity == 'requested';
                        }).length

                        $rootScope.reportsWidget['accept'] = _.filter(data, function(obj) {
                            return obj.log[obj.log.length - 1].activity == 'accept';
                        }).length

                        $rootScope.reportsWidget['completed'] = _.filter(data, function(obj) {
                            return obj.log[obj.log.length - 1].activity == 'completed';
                        }).length
                    } else {
                        $rootScope.showButton = false;
                    }
                });
            $rootScope.loadRunner = false;
        },
        sendReport: function(emailInfo, fromDate, toDate, venueid, account) {
            var newD = new Date(toDate).getTime() + 86400000;
            $rootScope.loadRunner = true;
            var post = {
                email: emailInfo, //'aravinth.b@infonion.com',// emailInfo,
                venueID: venueid,
                fromDate: moment(fromDate).format('YYYY-MM-DD'), //fromDate,
                toDate: moment(toDate).format('YYYY-MM-DD') //toDate// new Date(newD),
            };
            if ($rootScope.$user.role != 'admin') {
                post['accountID'] = $rootScope.$user.accountID.id
            } else {
                post['accountID'] = account;
            }
            // console.log('send report data---info' + JSON.stringify(post));
            $http.post((($rootScope.$user.role == 'admin') ? $rootScope.ipAddress + '/dailytransactional/sendReportLargeData/' : $rootScope.ipAddress + '/dailytransactional/sendReportLargeData/'), post).success(function(data) {
                $rootScope.loadRunner = false;
                if (data == "no.xlsx")
                    notificationService.successNotify('Report has more number of transactions. System will send the report to your given email id once its ready.', 5000);
                else
                    notificationService.successNotify('Mail sent successfully..', 5000);
            }).error(function(err) {
                $rootScope.loadRunner = false;
                // console.log('Server Response Received (error-send mail)...');
            });
        },
        downloadReport: function(fromDate, toDate, venueid, account) {
            var newD = new Date(toDate).getTime() + 86400000;
            $rootScope.loadRunner = true;
            var post = {
                venueID: venueid,
                fromDate: moment(fromDate).format('YYYY-MM-DD'), //fromDate,
                toDate: moment(toDate).format('YYYY-MM-DD'), //toDate// new Date(newD),
                //  accountID: $rootScope.$user.accountID.id
                email: $rootScope.$user.email //'aravinth.b@infonion.com' // $rootScope.$user.email
            };
            if ($rootScope.$user.role != 'admin') {
                post['accountID'] = $rootScope.$user.accountID.id
            } else {
                post['accountID'] = account;
                post['email']  = 'solutions@infonion.com';
            }
            $rootScope.loadRunner = true;
            $http.post((($rootScope.$user.role == 'admin') ? $rootScope.ipAddress + '/dailytransactional/downloadReportLargeData/' : $rootScope.ipAddress + '/dailytransactional/downloadReportLargeData/'), post).success(function(data) {
                // $rootScope.loadRunner = false;
                // console.log('download link' + data);
                if (data != "no.xlsx") {
                    fun(data);
                } else {
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Report has more number of transactions. System will send the report to your registered email id once its ready.', 5000);
                }

                function fun(data) {
                    if (data) {
                        var res = downloadService.downloadFunction(data);
                        res.then(function(res) {
                            if (res == 0) {
                                $timeout(function() {
                                    fun(data);
                                }, 1000);
                            }
                        });
                    }
                }
            }).error(function(err) {
                $rootScope.loadRunner = false;
                // console.log('Server Response Received (error-send mail)...');
            });
        },
        updateDriverforPark: function(car, driver) {
            $rootScope.loadRunner = true;
            if (car) {
                var postdata = { dailytransactionalID: car.id, employeeID: driver.id, employeeName: driver.userName, };
                if (driver.profileImage) {
                    postdata['profileImage'] = driver.profileImage;
                }
                // console.log('update car ' + JSON.stringify(postdata));
                notificationService.successNotify('Driver has been updated..', 5000);
                $http.post($rootScope.ipAddress + '/requestcar/updateDriverforParkFromAPICall/', postdata).success(function(data) {
                    // console.log('Server Response Received (success-update-driver)...');
                    $rootScope.loadRunner = false;
                }).error(function(err) {
                    $rootScope.loadRunner = false;
                    // console.log('Server Response Received (error-update-driver)...');
                });
                //alert("Sucessfully send...");
            }
        },
        requestRingToneService: function(data) {
            if ($rootScope.$user.role != 'accountadmin' && $rootScope.$user.role != 'manager') {
                if (data != null) {
                    // notificationService.successNotify(data + ' car(s) requested. Kindly process immediately', 10000);
                    // ionic.Platform.isWebView() ? $window.requestedCarDetailsforNotificationWithVibrate(true) : null;
                }
                audioElement = document.createElement('audio');
                audioElement.setAttribute('src', "img/mp3/wake-up-will-you.mp3");
                audioElement.play();
            }
            return;
        },
        getCarInfo: function(carInfo) {
            var postData = {
                search: carInfo
            };
            return $http.post($rootScope.ipAddress + '/requestcar/getCarDetailsforValidationforSearch', postData).then(function(data) {
                $rootScope.loadRunner = false;
                // console.log('validate Info' + JSON.stringify(data));
                return data.data.car[0];
            })
        },
        validatedByValidator: function(carInformation) {
            var postData = {
                id: carInformation.id,
                validatedBy: {
                    by: $rootScope.$user.id,
                    userName: $rootScope.$user.userName,
                    email: $rootScope.$user.email,
                    mobile: $rootScope.$user.mobile,
                    userProfile: $rootScope.$user.profileImage,
                    role: $rootScope.$user.role,
                    validationType: $rootScope.$user.validationType,
                    outletName: $rootScope.$user.outletName
                }
            };
            // console.log('validate Info' + JSON.stringify(postData));
            return $http.post($rootScope.ipAddress + '/requestcar/validatedByValidator', postData).success(function(data) {
                $rootScope.loadRunner = false;
                return data.car;
            }).error(function(err) {
                $rootScope.loadRunner = false;
            });
        },
        validatedByCashier: function(verifyData) {
            var postData = {
                cashAcceptedBy: {
                    by: $rootScope.$user.id,
                    userName: $rootScope.$user.userName,
                    email: $rootScope.$user.email,
                    mobile: $rootScope.$user.mobile,
                    userProfile: $rootScope.$user.profileImage,
                    role: $rootScope.$user.role
                },
                documents: verifyData.documents,
                description: verifyData.description,
                validationType: verifyData.validationType,
                id: verifyData.id,
                fees: verifyData.fees,
                feeSplitUp: verifyData.feeSplitUp
            }
            if (verifyData.bill)
                postData['bill'] = verifyData.bill;
            // console.log("--------->" + JSON.stringify(postData));
            return $http.post($rootScope.ipAddress + '/requestcar/validatedByCashier', postData).success(function(data) {
                return data.car;
            }).error(function(err) {
                $rootScope.loadRunner = false;
            });
        },
        revalidate: function(verifyData) {
            // console.log(JSON.stringify(verifyData));
            var postData = {
                revalidatedBy: {
                    by: $rootScope.$user.id,
                    userName: $rootScope.$user.userName,
                    email: $rootScope.$user.email,
                    mobile: $rootScope.$user.mobile,
                    userProfile: $rootScope.$user.profileImage,
                    role: $rootScope.$user.role,
                },
                documents: verifyData.documents,
                description: verifyData.description,
                validationType: verifyData.validationType,
                id: verifyData.id,
                fees: verifyData.newfees,
                feeSplitUp: verifyData.feeSplitUp,
                newfeeSplitUp: verifyData.newfeeSplitUp,
                accountID: $rootScope.$user.accountID.id,
                venueID: verifyData.venue.id
            };
            if (verifyData.bill)
                postData['bill'] = verifyData.bill;
            // console.log("--------->22222" + JSON.stringify(postData));
            return $http.post($rootScope.ipAddress + '/requestcar/revalidatedByCashier', postData).success(function(data) {
                $rootScope.loadRunner = false;
                return data.car;
            }).error(function(err) {
                $rootScope.loadRunner = false;
            });
        },
        printBillGlobal: function(printType, carData) {
            /* Printer function below*/
            if ($rootScope.$user && $rootScope.$user.accountID && $rootScope.$user.accountID.timeZone == "Asia/Dubai") { //&& $rootScope.$user.accountID.id == '5a063bc79f8caede0a58fd39') {
                var printer = new epson.ePOSBuilder();
                if (JSON.parse(localStorage.getItem('ls.printerIP'))) {
                    printBill();
                } else {
                    notificationService.errorNotify('Please check the printer configuration...');
                    $('.modal').modal('hide');
                    $('#printSetting').modal('show');
                }
            }

            function checkandReplaceEmirates(str) {
                var emirates = ['DXB', 'AD', 'SHJ', 'AJN', 'UAQ', 'RAK', 'FJH', 'Al Ain', 'Oman', 'Qatar', 'KSA', 'BHN', 'KWT', 'CC', 'CD', 'UAE'];
                var emiy = _.findIndex(emirates, (e) => { return e.toLowerCase() == str.substring(0, e.toLowerCase().length).toLowerCase() });

                // console.log(emiy)
                var optained = '',
                    final;
                if (emiy > -1) {
                    // console.log(emirates[emiy] + '====')
                    optained = str.toLowerCase().replace(emirates[emiy].toLowerCase(), '');
                    // console.log(optained + "??????")
                    if (parseInt(optained))
                        final = emirates[emiy] + '-' + optained;
                    else {
                        final = emirates[emiy] + '-' + optained.charAt(0) + "-" + optained.substring(1);
                    }
                    return final.toUpperCase();
                } else
                    return str.toUpperCase();
            }

            function printBill() {
                //  console.log("guestPrint------" + JSON.stringify(carData));
                console.log('logo\n');
                console.log('-----\n');
                // var fullDate = moment().format('DD-MM-YYYY');
                // var billDate = moment().format('hh:mm A');
                // console.log('Date/Time:' + fullDate + ':' + billDate + '\n\n');
                // console.log('Bill no:' + carData.venue.short + '\n');
                // console.log('Location:' + carData.venue.venueName + '\n');
                // if (carData.cashAcceptedBy)
                //     console.log('Cashier:' + carData.cashAcceptedBy.userName + '\n');
                // console.log('--------------\n');
                // console.log('Ticket No:' + carData.parkingID + '\n');
                // console.log('Plate No:' + carData.plateNumber + '\n');
                // console.log('--------------\n');
                // var checkin = moment(carData.createdAt).format('DD-MM-YYYY') + ":" + moment(carData.createdAt).format('hh:mm A');
                // var checkout = moment(carData.updatedAt).format('DD-MM-YYYY') + ":" + moment(carData.updatedAt).format('hh:mm A');
                // console.log('Check in time:' + checkin + '\n');
                // console.log('Check out time:' + checkout + '\n');
                // if (carData.feeSplitUp) {
                //     console.log('Duration:' + carData.feeSplitUp.duration + '\n');
                //     console.log('VAT @ :' + carData.feeSplitUp.VAT + '%\n');
                //     console.log('Parking Cost: ' + carData.fees + 'AED\n');
                // }
                console.log('=====Thank you for using our valet service.======\n');


                if (carData.feeSplitUp)
                    console.log("feeSplitUp >>>> " + JSON.stringify(carData.feeSplitUp))
                if (carData.newfeeSplitUp)
                    console.log("new feeSplitUp >>>> " + JSON.stringify(carData.newfeeSplitUp))
                if (carData.bill)
                    console.log("bill >>>> " + JSON.stringify(carData.bill))

                if (printer != null || printer != undefined) {
                    printer.addTextAlign(printer.ALIGN_CENTER);
                    var canvas = $('#canvas').get(0);
                    var context = canvas.getContext('2d');
                    context.drawImage($('#logo').get(0), 0, 0, 300, 150);
                    printer.addImage(context, 0, 0, 300, 150);
                    printer.addTextSize(1, 1);
                    printer.addText("\n");
                    printer.addTextAlign(printer.ALIGN_CENTER);
                    printer.addText("-----------------------------\n");
                    printer.addTextAlign(printer.ALIGN_LEFT);
                    printer.addTextStyle(false, false, false, printer.COLOR_NONE);
                    printer.addTextSize(1, 1);
                    printer.addTextAlign(printer.ALIGN_LEFT);
                    var fullDate = moment().format('DD-MM-YYYY');
                    var billDate = moment().format('hh:mm A');
                    printer.addText("\tDate/Time:\t" + fullDate + ':' + billDate + "\n");
                    printer.addTextAlign(printer.ALIGN_LEFT);
                    printer.addTextSize(1, 1);

                    if (carData.bill) {
                        printer.addText("\tBill no:\t" + carData.bill.toUpperCase() + "\n");
                    }

                    printer.addText("\tLocation:\t" + carData.venue.venueName.toUpperCase() + "\n");
                    if (carData.cashAcceptedBy)
                        printer.addText("\tCashier:\t" + carData.cashAcceptedBy.userName.toUpperCase() + "\n");
                    printer.addTextAlign(printer.ALIGN_CENTER);
                    printer.addText("-----------------------------\n");
                    printer.addTextAlign(printer.ALIGN_LEFT);
                    printer.addText("\tTicket No:\t" + carData.parkingID.toUpperCase() + "\n");
                    ////////////////////////
                    if (carData.otherInfo && carData.otherInfo.plateNumber)
                        printer.addText("\tPlate No:\t" + carData.otherInfo.plateNumber.toUpperCase() + "\n");
                    else
                        printer.addText("\tPlate No:\t" + checkandReplaceEmirates(carData.plateNumber) + "\n");
                    //////////////////////////
                    printer.addTextAlign(printer.ALIGN_CENTER);
                    printer.addText("-----------------------------\n");
                    printer.addTextAlign(printer.ALIGN_LEFT);
                    printer.addTextSize(1, 1);
                    var checkin = moment(carData.createdAt).format('DD-MM-YYYY') + ":" + moment(carData.createdAt).format('hh:mm A');
                    // if(carData.status == 'completed'){
                    //     var checkout = moment(carData.log[carData.log.length - 1].at).format('DD-MM-YYYY') + ":" + moment(carData.log[carData.log.length - 1].at).format('hh:mm A');
                    // }else {
                    //     var checkout = moment(carData.updatedAt).format('DD-MM-YYYY') + ":" + moment(carData.updatedAt).format('hh:mm A');
                    // }

                    var requestedLog = _.filter(carData.log, (l) => {
                        return l.activity == 'requested';
                    });
                    if (requestedLog.length > 0) {
                        var checkout = moment(requestedLog[0].at).format('DD-MM-YYYY') + ":" + moment(requestedLog[0].at).format('hh:mm A');
                    } else {
                        // direct completed ...
                        var checkout = moment(carData.log[carData.log.length - 1].at).format('DD-MM-YYYY') + ":" + moment(carData.log[carData.log.length - 1].at).format('hh:mm A');
                    }

                    printer.addText("\tCheck in time:\t" + checkin + "\n");
                    printer.addText("\tCheck out time:\t" + checkout + "\n");
                    printer.addTextSize(1, 1);

                    if (carData.feeSplitUp && carData.feeSplitUp.paymentType)
                        printer.addText("\tPayment Type:\t" + carData.feeSplitUp.paymentType.toUpperCase() + "\n");
                    else if (carData.newfeeSplitUp && carData.newfeeSplitUp.paymentType)
                        printer.addText("\tPayment Type:\t" + carData.newfeeSplitUp.paymentType.toUpperCase() + "\n");

                    if (carData.feeSplitUp && !carData.newfeeSplitUp) {
                        if (carData.feeSplitUp) {
                            printer.addText("\tDuration:\t" + carData.feeSplitUp.duration + "\n");
                            if (carData.feeSplitUp.VAT) {
                                if (carData.feeSplitUp.VATamt)
                                    printer.addText("\tVAT:\t\t" + parseFloat(carData.feeSplitUp.VATamt).toFixed(2) + "(" + carData.feeSplitUp.VAT + "%)\n");
                                else {
                                    if (carData.venue && carData.venue.VATType) {
                                        if (carData.venue.VATType == 'inclusive') {
                                            var _parkingFee = (carData.fees / (1 + (carData.feeSplitUp.VAT / 100)));
                                            var vatamt = (carData.fees - _parkingFee);
                                            printer.addText("\tVAT:\t\t" + parseFloat(vatamt).toFixed(2) + "(" + carData.feeSplitUp.VAT + "%)\n");
                                        } else {
                                            var _parkingFee = (carData.fees / (1 + (carData.feeSplitUp.VAT / 100)));
                                            var vatamt = (carData.fees - _parkingFee);
                                            printer.addText("\tVAT:\t\t" + parseFloat(vatamt).toFixed(2) + "(" + carData.feeSplitUp.VAT + "%)\n");
                                        }
                                    } else {
                                        var _parkingFee = (carData.fees / (1 + (carData.feeSplitUp.VAT / 100)));
                                        var vatamt = (carData.fees - _parkingFee);
                                        printer.addText("\tVAT:\t\t" + parseFloat(vatamt).toFixed(2) + "(" + carData.feeSplitUp.VAT + "%)\n");
                                    }
                                }
                            } else
                                printer.addText("\tVAT:\t\t0%\n");
                        }
                    }

                    if (carData.newfeeSplitUp) {
                        printer.addText("\tDuration:\t" + carData.newfeeSplitUp.duration + "\n");
                        if (carData.newfeeSplitUp.VAT) {
                            if (carData.newfeeSplitUp.VATamt)
                                printer.addText("\tVAT:\t\t" + parseFloat(carData.newfeeSplitUp.VATamt).toFixed(2) + "(" + carData.newfeeSplitUp.VAT + "%)\n");
                            else {
                                if (carData.venue && carData.venue.VATType) {
                                    if (carData.venue.VATType == 'inclusive') {
                                        var _parkingFee = (carData.fees / (1 + (carData.newfeeSplitUp.VAT / 100)));
                                        var vatamt = (carData.fees - _parkingFee);
                                        printer.addText("\tVAT:\t\t" + parseFloat(vatamt).toFixed(2) + "(" + carData.newfeeSplitUp.VAT + "%)\n");
                                    } else {
                                        var _parkingFee = (carData.fees / (1 + (carData.newfeeSplitUp.VAT / 100)));
                                        var vatamt = (carData.fees - _parkingFee);
                                        printer.addText("\tVAT:\t\t" + parseFloat(vatamt).toFixed(2) + "(" + carData.newfeeSplitUp.VAT + "%)\n");
                                    }
                                } else {
                                    var _parkingFee = (carData.fees / (1 + (carData.newfeeSplitUp.VAT / 100)));
                                    var vatamt = (carData.fees - _parkingFee);
                                    printer.addText("\tVAT:\t\t" + parseFloat(vatamt).toFixed(2) + "(" + carData.newfeeSplitUp.VAT + "%)\n");
                                }
                            }
                        } else
                            printer.addText("\tVAT:\t\t0%\n");
                    }
                    printer.addText("\tParking Cost:\t" + carData.fees + "\n\n");
                    if (printType == 'chauffeurPrint') {
                        if (carData.description)
                            printer.addText("\tDescription:\t" + carData.description + "\n\n");
                    }
                    printer.addTextAlign(printer.ALIGN_CENTER);
                    printer.addTextSize(1, 1);
                    printer.addText("-----------------------------\n");
                    printer.addText("Thank you for using our valet service.\n");
                    if (printType == 'guestPrint') {
                        printer.addText("****Customer's Copy****\n");
                    }

                    if (printType == 'chauffeurPrint') {
                        printer.addText("****Cashier's Copy****\n");
                    }
                    printer.addText("\n");
                    printer.addText("\n");
                    printer.addCut(printer.CUT_FEED);

                    var url = 'http://' + JSON.parse(localStorage.getItem('ls.printerIP')) + '/cgi-bin/epos/service.cgi?devid=local_printer&timeout=10000';
                    // alert('Url: ' + url);
                    var epos = new epson.ePOSPrint(url);
                    // register callback function
                    epos.onreceive = function(res) {
                        if (!res.success) {
                            console.log('callback function Not success' + res);
                        }
                    }

                    // register callback function
                    epos.onerror = function(err) {
                            // alert("Callback function Error --> " + JSON.stringify(err));
                            notificationService.errorNotify('Printer not connected. Please check the printer configuration...');
                            $('.modal').modal('hide');
                            $('#printSetting').modal('show');
                        }
                        // console.log(printer.toString());
                    epos.send(printer.toString());
                } else
                    notificationService.errorNotify('Printer not connected. Please check the printer configuration...');
            }
        },
        savePrinterIp: function(ipInfo) {
            localStorageService.set("printerIP", ipInfo);
        },
        getDailyReport:function(reportRequestInfo) {                        
           var postData={
               venueID: reportRequestInfo.location,
                accountID: $rootScope.$user.accountID.id,
                status: reportRequestInfo.status,
                date: moment(reportRequestInfo.date).format("YYYY-MM-DD"),
                fromTime: reportRequestInfo.startTime,
                toTime: reportRequestInfo.endTime,
                customerType: ( reportRequestInfo.guestType ? reportRequestInfo.guestType : 'All'),
                skip: reportRequestInfo.page ? (reportRequestInfo.page - 1) * 10 : 0,
                limit:10
            }
            // console.log("--------->"+JSON.stringify(postData));
            return $http.post($rootScope.ipAddress + '/dailytransactional/getHourWiseReportforVenues', postData).success(function (data) {
                $rootScope.loadRunner = false;                
                $rootScope.dailyReports = data.data;
                $rootScope.totalRecord = data.length;
                var dataSplitups = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']; 

                if (postData.skip == 0){
                    data.chart2 = [];
                    findandInsertDatainanArray(0); 
                }
                function findandInsertDatainanArray(insert) { 
                    if (insert < dataSplitups.length) { 
                        var y = 0;
                        if(_.find(data.chart, function(value, key) {
                            if(key.indexOf(dataSplitups[insert]) >= 0){
                                return value.y;
                            }
                        }))
                        y = _.find(data.chart, function(value, key) {
                            if(key.indexOf(dataSplitups[insert]) >= 0){
                                return value.y;
                            }
                        }).y
                        else 
                         y = 0
                        data.chart2.push({
                            x: dataSplitups[insert], y: y || 0
                        });       
                        insert++; 
                        findandInsertDatainanArray(insert); 
                        } else { 
                            // console.log([..._.pluck(data.chart2, 'y')])
                            // scales: { yAxes: [{ ticks: { fixedStepSize: 1 } }] , }
                            $rootScope.dailyReportDataforChart = { 
                                data: [[..._.pluck(data.chart2, 'y')]], lables: _.pluck(data.chart2, 'x'), series :  ['Count'], options: { showTooltips: false, 
                            } 
                        } 
                    } 
                }
                return data;                  
            }).error(function (err) {
                $rootScope.loadRunner = false;
            });
        },
        downloadDailyReport:function(reportRequestInfo, sendEmail, email) {            
            var postData = {
                venueID: reportRequestInfo.location,
                 accountID: $rootScope.$user.accountID.id,
                 status: reportRequestInfo.status,
                 date: moment(reportRequestInfo.date).format("YYYY-MM-DD"),
                 fromTime: reportRequestInfo.startTime,
                 toTime: reportRequestInfo.endTime,
                 customerType: (reportRequestInfo.guestType ? reportRequestInfo.guestType : 'All'),
                 sendEmail : sendEmail,
                 email : email
             }
             return $http.post($rootScope.ipAddress + '/dailytransactional/downloadandSendHourWiseReportforVenues', postData).success(function (data) {
                 $rootScope.downloadLoader = false;
                if (data != "mail sent") {
                    fun(data);
                } else {
                    $('#openMailModal').modal('hide');
                    $rootScope.downloadLoader = false;
                    notificationService.successNotify('Mail sent successfully....', 5000);
                }

                function fun(data) {
                    if (data) {
                        var res = downloadService.downloadFunction(data);
                        res.then(function(res) {
                            if (res == 0) {
                                $timeout(function() {
                                    fun(data);
                                }, 1000);
                            }
                        });
                    }
                }
             }).error(function (err) {
                 $rootScope.downloadLoader = false;
             });
         }
    }
});


app.factory('downloadService', function($rootScope, $http, $timeout, $window, accountService) { // $cordovaFileTransfer
    return {
        downloadFunction: function(data) {
            return $http.get($rootScope.ipAddress + "/images/" + data).then(function(data1) {
                $rootScope.loadRunner = false;
                window.location.href = $rootScope.ipAddress + "/images/" + data;
            }, function(data) {
                $rootScope.loadRunner = false;
                return 0;
            });
        },
        convertDatatoExcelView: function(master) {
            var formattedData = [];
            var _res = accountService.gettingAccountExcelSettings();
            _res.then(function(data) {
                if (data.data && data.data.settings && data.data.settings.length > 0)
                    formattedData = data.data.settings;
                else
                    formattedData = accountService.getReportSettingData();

                var masterData = master;
                var momentDateformat = 'DD/MM/YYYY HH:mm';
                var obj = {};
                var masterDatas = [];
                masterAllReport(0);

                function masterAllReport(j) {
                    if (j < masterData.length) {
                        obj = {};
                        obj.Sino = ($rootScope.skip) + (masterDatas.length + 1);

                        if (masterData[j].venue) {
                            obj.Venuename = masterData[j].venue.venueName;
                        }
                        obj.Date = moment.utc(masterData[j].createdAt).format(momentDateformat);
                        obj.TokenNumber = masterData[j].parkingID;
                        obj.plateNumber = masterData[j].plateNumber;
                        obj.brand = masterData[j].brand;
                        obj.modelName = masterData[j].modelName;
                        obj.color = masterData[j].color;
                        obj.remarks = masterData[j].remarks;
                        obj.customerType = masterData[j].customerType;
                        obj.description = masterData[j].description;


                        if (masterData[j].snap == null || masterData[j].snap == undefined || masterData[j].snap == '' || masterData[j].snap == 'undefined')
                            obj.plateSnap = 'noImage';
                        else
                            obj.plateSnap = masterData[j].snap;


                        obj.scratchesSnap = _.map(masterData[j].scratchesSnap, (p) => {
                            p = ("\nhttps://evaletz.com:1338/images/" + p);
                            return p;
                        }).toString();

                        if (masterData[j].documents && masterData[j].documents.length > 0) {
                            obj.documents = _.map(masterData[j].documents, (p) => {
                                p = ("\nhttps://evaletz.com:1338/images/" + p);
                                return p;
                            }).toString();
                        }

                        if (masterData[j].validatedBy) {
                            if (masterData[j].validatedBy.userName)
                                masterData[j].validatedBy.userName = (masterData[j].validatedBy.userName.toString().substring(0, 1).toUpperCase() + masterData[j].validatedBy.userName.toString().substring(1));
                            // masterData[j].validatedBy.role = (masterData[j].validatedBy.role.toString().substring(0, 1).toUpperCase() + masterData[j].validatedBy.role.toString().substring(1));
                            // if (masterData[j].validatedBy.validationType)
                            //     masterData[j].validatedBy.validationType = (masterData[j].validatedBy.validationType.toString().substring(0, 1).toUpperCase() + masterData[j].validatedBy.validationType.toString().substring(1));
                            // if (masterData[j].validatedBy.outletName)
                            // masterData[j].validatedBy.outletName = (masterData[j].validatedBy.outletName.toString().substring(0, 1).toUpperCase() + masterData[j].validatedBy.outletName.toString().substring(1));

                            obj.validatedBy = masterData[j].validatedBy.userName || '';
                            // obj.validatedBy = "Validated By :" + masterData[j].validatedBy.userName + "(" + masterData[j].validatedBy.email + ") \nRole : " + masterData[j].validatedBy.role + " (" + masterData[j].validatedBy.validationType + ") \nOutlet : " + masterData[j].validatedBy.outletName + " @ " + moment.utc(obj.validatedAt).format(momentDateformat); + " \n\n";
                        }

                        if (masterData[j].cashAcceptedBy) {
                            if (masterData[j].cashAcceptedBy.userName)
                                masterData[j].cashAcceptedBy.userName = (masterData[j].cashAcceptedBy.userName.toString().substring(0, 1).toUpperCase() + masterData[j].cashAcceptedBy.userName.toString().substring(1));
                            // masterData[j].cashAcceptedBy.role = (masterData[j].cashAcceptedBy.role.toString().substring(0, 1).toUpperCase() + masterData[j].cashAcceptedBy.role.toString().substring(1));

                            obj.cashAcceptedBy = masterData[j].cashAcceptedBy.userName || '';
                            // obj.cashAcceptedBy = "Cash collected By :" + masterData[j].cashAcceptedBy.userName + "(" + masterData[j].cashAcceptedBy.email + ") \nRole : " + masterData[j].cashAcceptedBy.role + " (" + masterData[j].cashAcceptedBy.validationType + ") \n @ " + moment.utc(obj.cashAcceptedAt).format(momentDateformat); + " \n\n";
                        }

                        if (masterData[j].revalidatedBy) {
                            if (masterData[j].revalidatedBy.userName)
                                masterData[j].revalidatedBy.userName = (masterData[j].revalidatedBy.userName.toString().substring(0, 1).toUpperCase() + masterData[j].revalidatedBy.userName.toString().substring(1));
                            // masterData[j].revalidatedBy.role = (masterData[j].revalidatedBy.role.toString().substring(0, 1).toUpperCase() + masterData[j].revalidatedBy.role.toString().substring(1));

                            // if(!masterData[j].revalidatedBy.validationType)
                            //     masterData[j].revalidatedBy.validationType = "-";
                            obj.revalidatedBy = masterData[j].revalidatedBy.userName || '';
                            // obj.revalidatedBy = "Cash recollected By :" + masterData[j].revalidatedBy.userName  + "(" + masterData[j].revalidatedBy.email + ") \nRole : " +  masterData[j].revalidatedBy.role  + " ("+ masterData[j].revalidatedBy.validationType +") \n @ " +  moment.utc(obj.revalidatedAt).tz(timezone).format(momentDateformat); + " \n\n";
                        }


                        getData(0);

                        function getData(l) {
                            if (l < masterData[j].log.length) {
                                if (masterData[j].log[l].activity == 'parked') {
                                    obj.ParkedAtDateTime = moment.utc(masterData[j].createdAt).format(momentDateformat);
                                    obj.ParkedBy = masterData[j].log[l].employeeName;

                                    obj.ParkedAtDate = moment.utc(masterData[j].createdAt).format("DD/MM/YYYY");
                                    obj.ParkedAtTime = moment.utc(masterData[j].createdAt).format("HH:mm");

                                }
                                if (masterData[j].log[l].activity == 'requested') {
                                    obj.RequestedAtDateTime = moment.utc(masterData[j].log[l].at).format(momentDateformat);
                                    obj.RequestedBy = masterData[j].log[l].by;

                                    obj.RequestedAtDate = moment.utc(masterData[j].log[l].at).format("DD/MM/YYYY");
                                    obj.RequestedAtTime = moment.utc(masterData[j].log[l].at).format("HH:mm");

                                    if (masterData[j].log[l].specialRequest) {
                                        obj.MoreDetails = "Required At : " + moment.utc(masterData[j].log[l].specialRequest.dateTime).format(momentDateformat) + "\nConfirmed By : " + (masterData[j].log[l].specialRequest.accepted ? obj.ConfirmedBy = (masterData[j].log[l].specialRequest.by.employeeName.toString().substring(0, 1).toUpperCase() + masterData[j].log[l].specialRequest.by.employeeName.toString().substring(1)) : 'Yet to confirm') + "\nConfirmed At : " + (masterData[j].log[l].specialRequest.accepted ? moment.utc(masterData[j].log[l].specialRequest.by.at).format(momentDateformat) : 'Yet to confirm') + " \n\n";
                                    }
                                }
                                if (masterData[j].log[l].activity == 'accept') {
                                    obj.AcceptedAtDateTime = moment.utc(masterData[j].log[l].at).format(momentDateformat);
                                    obj.AcceptedBy = masterData[j].log[l].employeeName;

                                    obj.AcceptedAtDate = moment.utc(masterData[j].log[l].at).format("DD/MM/YYYY");
                                    obj.AcceptedAtTime = moment.utc(masterData[j].log[l].at).format("HH:mm");
                                }
                                if (masterData[j].log[l].activity == 'completed') {
                                    obj.CompletedAtDateTime = moment.utc(masterData[j].log[l].at).format(momentDateformat);
                                    obj.CompletedBy = masterData[j].log[l].employeeName;

                                    obj.CompletedAtDate = moment.utc(masterData[j].log[l].at).format("DD/MM/YYYY");
                                    obj.CompletedAtTime = moment.utc(masterData[j].log[l].at).format("HH:mm");


                                    /////
                                    var startTime = moment.utc(masterData[j].createdAt);
                                    var endTime = moment.utc(masterData[j].log[l].at);
                                    var duration = moment.duration(endTime.diff(startTime));
                                    var hours = parseInt(duration.asHours());
                                    var minutes = parseInt(duration.asMinutes()) - hours * 60;
                                    obj.diff = hours + ' hours and ' + minutes + ' minutes.';

                                    if (masterData[j].log[l].cashierName)
                                        obj.cashierName = masterData[j].log[l].cashierName

                                    if (masterData[j].log[l].fees)
                                        obj.fees = masterData[j].log[l].fees

                                    ////
                                }
                                if (masterData[j].log[l].activity == 'ready') {
                                    obj.ReadyAt = moment.utc(masterData[j].log[l].at).format(momentDateformat);
                                    obj.ReadyBy = masterData[j].log[l].employeeName;
                                }
                                if (masterData[j].log[l].activity == 'completed' && masterData[j].log[l].proofs) {
                                    if (masterData[j].log[l].proofs.length > 0) {
                                        obj.cardMissed = 'yes';
                                        obj.name = masterData[j].log[l].missedUserName;
                                        obj.mobileNumber = masterData[j].log[l].missedUserMobile;
                                        obj.proofs = _.map(masterData[j].log[l].proofs, (p) => {
                                            p = ("\nhttps://evaletz.com:1338/images/" + p)
                                            return p;
                                        }).toString();
                                    }

                                }
                                l++;
                                getData(l);
                            } else {
                                if (!masterData[j].changeLog)
                                    masterData[j].changeLog = [];
                                var changeLogs = []
                                getChangeLogData(0);

                                function getChangeLogData(cl) {
                                    if (cl < masterData[j].changeLog.length) {
                                        if (masterData[j].changeLog[cl]) {
                                            changeLogs = _.union(changeLogs, masterData[j].changeLog[cl].log);
                                            // setTimeout(() => {
                                            cl++;
                                            getChangeLogData(cl);
                                            // }, 1);
                                        } else {
                                            // setTimeout(() => {
                                            cl++;
                                            getChangeLogData(cl);
                                            // }, 1);
                                        }
                                    } else {
                                        changeLogs = _.sortBy(changeLogs, function(obj) {
                                            return obj.at;
                                        });
                                        makinglogColumn(0);

                                        function makinglogColumn(col) {
                                            if (col < changeLogs.length) {
                                                if (changeLogs[col].activity && changeLogs[col].loginUser) {
                                                    if (changeLogs[col].activity != "parkingID")
                                                        changeLogs[col].activity = changeLogs[col].activity.toString().replace(/([a-z])([A-Z])/g, "$1 $2").substring(0, 1).toUpperCase() + changeLogs[col].activity.toString().replace(/([a-z])([A-Z])/g, "$1 $2").substring(1);
                                                    else
                                                        changeLogs[col].activity = 'Ticket Number';
                                                    changeLogs[col].at = moment.utc(changeLogs[col].at).format(momentDateformat);
                                                    if (obj.changeLogs) {
                                                        obj.changeLogs += "" + changeLogs[col].activity + " : " + changeLogs[col].changes + "\nBy :" + (changeLogs[col].loginUser.userName.toString().substring(0, 1).toUpperCase() + changeLogs[col].loginUser.userName.toString().substring(1)) + " (" + changeLogs[col].loginUser.email + ") \nAt : " + changeLogs[col].at + " \n\n";
                                                    } else {
                                                        obj.changeLogs = "" + changeLogs[col].activity + " : " + changeLogs[col].changes + "\nBy :" + (changeLogs[col].loginUser.userName.toString().substring(0, 1).toUpperCase() + changeLogs[col].loginUser.userName.toString().substring(1)) + "(" + changeLogs[col].loginUser.email + ") \nAt : " + changeLogs[col].at + " \n\n";
                                                    }
                                                }
                                                col++;
                                                makinglogColumn(col);
                                            } else {
                                                masterDatas.push(obj);
                                                j++;
                                                masterAllReport(j);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        $rootScope.excellFormatedData = _.filter(formattedData, (c) => {
                            return (c.selected == true && c.name != 'all');
                        });

                        var _final = [];
                        var _t = _.pluck($rootScope.excellFormatedData, 'name');
                        pushFinalData(0);

                        function pushFinalData(p) {
                            if (p < masterDatas.length) {
                                var obj = {}
                                yy(0);

                                function yy(k) {
                                    if (k < _t.length) {
                                        // console.log(_t[k])
                                        obj[_t[k]] = masterDatas[p][_t[k]];
                                        // setTimeout(() => {
                                        k++;
                                        yy(k);
                                        // }, 1)
                                    } else {
                                        _final.push(obj)
                                        obj = {}
                                        p++;
                                        pushFinalData(p);
                                    }
                                }
                            } else {
                                //  console.log(JSON.stringify(_final))
                                $rootScope.reports = _final;
                                $rootScope.reportno = "No Record Found ";
                            }
                        }
                    }
                }
            });
        }
    }
})



app.factory('pullToRefreshService', function($http, $rootScope, notificationService, downloadService, $window, $timeout) {
    return {
        getCarDetails: function(venueID) {
            $rootScope.onlineSync = false;
            $rootScope.loadRunner = true;
            $rootScope.nocarfound = "Loading Record...";
            if ($rootScope.$user.role != 'admin' && $rootScope.$user.accountID != undefined) {
                var postData = {
                    venueID: venueID,
                    role: $rootScope.$user.role,
                    accountID: $rootScope.$user.accountID.id
                };
            } else if ($rootScope.$user.role == 'admin') {
                var postData = {
                    venueID: venueID,
                    role: $rootScope.$user.role
                };
            } else if ($rootScope.$user.accountID == undefined) {
                notificationService.errorNotify('You have no account...');
            }
            $rootScope.loading = true;
            var result = $http.post($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICallOnlyforOscar', postData)
                .success(function(data) {
                    $timeout(function() {
                        $rootScope.loadRunner = false;
                    }, 2000);


                    if (JSON.stringify(data.parked)) {
                        $rootScope.parkedCar = data.parked;
                        //$rootScope.parkedCar.reverse();
                        // console.log("Parked Car >>>>" + JSON.stringify($rootScope.parkedCar));
                        for (var i = 0; i < $rootScope.parkedCar.length; i++) {
                            $rootScope.parkedCar[i].editmode = false;
                            if ($rootScope.parkedCar[i].scratchesSnap == null) {
                                $rootScope.parkedCar[i].scratchesSnap = [];
                            }
                            if ($rootScope.parkedCar[i].snap != null) {
                                // $rootScope.parkedCar[i].scratchesSnap.unshift($rootScope.parkedCar[i].snap);
                            }
                        }
                    }
                    if (JSON.stringify(data.requested)) {
                        $rootScope.requestedCar = data.requested;
                        //$rootScope.requestedCar.reverse();
                        for (var i = 0; i < $rootScope.requestedCar.length; i++) {
                            if ($rootScope.requestedCar[i].scratchesSnap == null) {
                                $rootScope.requestedCar[i].scratchesSnap = [];
                            }
                            if ($rootScope.requestedCar[i].scratchesSnap == null) {
                                $rootScope.requestedCar[i].scratchesSnap = [];
                            }
                            if ($rootScope.requestedCar[i].snap != null) {
                                // $rootScope.requestedCar[i].scratchesSnap.unshift($rootScope.requestedCar[i].snap);
                            }
                        }
                        //console.log(">>>>"+JSON.stringify(data.requested));
                    }
                    if (JSON.stringify(data.accountVenues)) {
                        $rootScope.accountVenuesofAccountAdmin = data.accountVenues;
                    }
                    $rootScope.loading = false;
                    $rootScope.nocarfound = "No Car Found";
                    // return false;             
                }).error(function() {
                    $rootScope.loadRunner = false;
                    $rootScope.nocarfound = "No Car Found";
                });
            // if(result!=''|| result!=undefined){
            //    $rootScope.loading = false;alert();}

        },
    }
})

function converToLocalTime(serverDate) {

    var dt = new Date(Date.parse(serverDate));
    var localDate = dt;

    var gmt = localDate;
    var min = gmt.getTime() / 1000 / 60; // convert gmt date to minutes
    var localNow = new Date().getTimezoneOffset(); // get the timezone
    // offset in minutes
    var localTime = min - localNow; // get the local time

    var dateStr = new Date(localTime * 1000 * 60);
    dateStr = dateStr.toISOString("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"); // this will return as just the server date format i.e., yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
    //dateStr = dateStr.toString("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
    return dateStr;
}

app.factory('offlineDBService', function($rootScope, $exceptionHandler, $http, Upload, notificationService, $timeout) {
    var insertData = '';
    return {
        checkCarInfoExists: function(DB, car) {},
        checkCarInfoExistsforSocket: function(DB, car) {},
        insertNewCarOffline: function(DB, car) {},
        insertNewCarOfflineforSocket: function(DB, car) {},
        editCarOffline: function(DB, car, editType) {},
        editCarOfflineforspecialRequest: function(DB, car, editType) {},
        checkCarbulkInfoExists: function(DB, car) {},
        checkCarbulkInfoExistswithCallback: function(DB, car, callfunc) {},
        deleteCarRecord: function(DB, car) {},
        getOfflineCareData: function(DB, cb) {},
        dropTableFrom: function(DB) {},
        onlineSync: function(main) {},
    }
})