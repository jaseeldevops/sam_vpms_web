'use strict';
app.factory('accountService', function($http, $rootScope, $state, notificationService, $localStorage, localStorageService) {
    return {
        postAccount: function(accountData) {
            $rootScope.loadRunner = true;
            if (accountData) {
                var postdata = {
                    accountName: accountData.accountName,
                    subscriptionID: accountData.subscriptionID,
                    paymentID: accountData.paymentID,
                    subscriptionStatus: accountData.subscriptionStatus,
                    paymentDescription: accountData.paymentDescription,
                    paymentType: accountData.paymentType,
                    amount: accountData.amount,
                    bank: accountData.bank,
                    region: accountData.region,
                    timeZone: accountData.timeZone
                };
                // console.log(JSON.stringify(accountData));
                return $http.post($rootScope.ipAddress + '/account/accountCreation', postdata).then(function(data) {
                    // console.log(JSON.stringify(data));
                    $rootScope.loadRunner = false;
                    return data;
                });
            }
        },
        postAccountSubscription: function(accountData2) {
            $rootScope.loadRunner = true;
            if (accountData2) {
                var postdata = {
                    id: $rootScope.thisAccount.id,
                    subscriptionID: accountData2.subscriptionID,
                    paymentID: accountData2.paymentID,
                    subscriptionStatus: accountData2.subscriptionStatus,
                    paymentDescription: accountData2.paymentDescription,
                    paymentType: accountData2.paymentType,
                    amount: accountData2.amount,
                    bank: accountData2.bank
                };
                return $http.post($rootScope.ipAddress + '/account/accountSubscriptionCreation', postdata).then(function(data) {
                    notificationService.successNotify('Account has been registered successfully....', 5000);
                    $rootScope.loadRunner = false;
                    return data;
                });
                //notificationService.successNotify('Account Registered successfully....',5000);
            }
        },
        saveEditedAccount: function(thisAccount) {
            $rootScope.loadRunner = true;
            var postdata = {
                id: thisAccount.id,
                accountName: thisAccount.accountName,
                paymentID: thisAccount.paymentID,
                subscriptionStatus: thisAccount.subscriptionStatus,
                subscriptionStartDate: thisAccount.subscriptionStartDate,
                subscriptionEndDate: thisAccount.subscriptionEndDate
            };
            $http.post($rootScope.ipAddress + '/account/editAccount/', postdata)
                .success(function(data) {
                    if (thisAccount.id == $rootScope.$user.accountID.id) {
                        $rootScope.$user.accountID.accountName = thisAccount.accountName;
                        localStorageService.set("VPSUser", $rootScope.$user);
                    }

                    $rootScope.loadRunner = false;
                    //alert("successfully Edited...");
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },

        sendReview: function(review) {
            // $rootScope.loadRunner = true;
            var postRate = {
                rate: review.rating,
                email: $rootScope.$user.email,
                accountName: $rootScope.$user.accountID.accountName,
                accountId: $rootScope.$user.accountID.id
            };
            $http.post($rootScope.ipAddress + '/account/sendReview/', postRate)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    $rootScope.$user.accountID.rate = review.rating;
                    localStorageService.set("VPSUser", $rootScope.$user);
                    //alert("successfully Edited...");
                    notificationService.successNotify('Thank you for your rating..', 5000);
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },

        deleteAccount: function(thisAccount) {
            $rootScope.loadRunner = true;
            // console.log(JSON.stringify(thisAccount));
            var postdata = { id: thisAccount.id };
            return $http.post($rootScope.ipAddress + '/account/deleteAccount/', postdata)
                .then(function(data) {
                    // console.log('delete success');
                    // notificationService.successNotify('Account Deleted successfully....', 5000);
                    $rootScope.loadRunner = false;
                    return data;
                }, function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },

        postAccountUserType: function(customUserTypes) {
            $rootScope.loadRunner = true;
            return $http.post($rootScope.ipAddress + '/account/updateAccountUserTypes/', { customerTypes: customUserTypes, id: $rootScope.$user.accountID.id })
                .then(function(data) {
                    // console.log('delete success');
                    notificationService.successNotify('Account user type added successfully....', 5000);
                    $rootScope.loadRunner = false;
                    $localStorage.user = $rootScope.$user;
                    localStorageService.set("VPSUser", $rootScope.$user);
                    return data;
                }, function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },
        updateAccountUserTypesForTVC : function(otherInfo) {
            $rootScope.loadRunner = true;
            return $http.post($rootScope.ipAddress + '/account/updateAccountUserTypesForTVC/', { otherInfo: otherInfo, id: $rootScope.$user.accountID.id })
                .then(function(data) {
                    // console.log('delete success');
                    notificationService.successNotify('Account user type added successfully....', 5000);
                    $rootScope.loadRunner = false;
                    $localStorage.user = $rootScope.$user;
                    localStorageService.set("VPSUser", $rootScope.$user);
                    return data;
                }, function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },

        removeCustomerType: function(customUserTypes) {
            $rootScope.loadRunner = true;
            return $http.post($rootScope.ipAddress + '/account/updateAccountUserTypes/', { customerTypes: customUserTypes, id: $rootScope.$user.accountID.id })
                .then(function(data) {
                    // console.log('delete success');
                    notificationService.successNotify('Account customer type deleted successfully....', 5000);
                    $rootScope.loadRunner = false;
                    $localStorage.user = $rootScope.$user;
                    localStorageService.set("VPSUser", $rootScope.$user);
                    return data;
                }, function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },
        gettingAccountExcelSettings: function() {
            return $http.post($rootScope.ipAddress + '/account/gettingAccountExcelSettings/', { id : $rootScope.$user.accountID.id }).then(function(data) {
                // console.log("report setting" + JSON.stringify(data));
                return data;
            }, function(data) {
                $rootScope.loadRunner = false;
            });
        },
        reportFieldSetting: function(reportField) {
            return $http.post($rootScope.ipAddress + '/account/updateExcelAccountSettings/', { id : $rootScope.$user.accountID.id, excelFormatSettings :  JSON.parse(angular.toJson(reportField)) }).then(function(data) {
                // console.log("report setting" + JSON.stringify(data));
                return data;
            }, function(data) {
                $rootScope.loadRunner = false;
            });
        },
        getReportSettingData: function() {
            return [
                {
                    'name': 'all',
                    'displayName': 'All',
                    'selected': false
                },
                {
                    'name': 'Sino',
                    'displayName': 'Sino',
                    'selected': true
                },
                {
                    'name': 'Venuename',
                    'displayName': 'Venue Name',
                    'selected': true
                },
                {
                    'name': 'Date',
                    'displayName': 'Arrival Date/Time',
                    'selected': true
                },
                {
                    'name': 'TokenNumber',
                    'displayName': 'Token Number',
                    'selected': true
                },
                {
                    'name': 'plateNumber',
                    'displayName': 'Plate Number',
                    'selected': true
                },
                {
                    'name': 'plateSnap',
                    'displayName': 'Plate Snap',
                    'selected': true
                },
                {
                    'name': 'brand',
                    'displayName': 'Brand',
                    'selected': true
                },
                {
                    'name': 'modelName',
                    'displayName': 'Model Name',
                    'selected': true
                },
                {
                    'name': 'color',
                    'displayName': 'Color',
                    'selected': true
                },
                {
                    'name': 'customerType',
                    'displayName': 'Customer Type',
                    'selected': true
                },
                {
                    'name': 'remarks',
                    'displayName': 'General Remarks',
                    'selected': true
                },
                {
                    'name': 'ParkedAtDateTime',
                    'displayName': 'Parked At',
                    'selected': true
                },
                {
                    'name': 'ParkedAtDate',
                    'displayName': 'Parked Date',
                    'selected': false
                },
                {
                    'name': 'ParkedAtTime',
                    'displayName': 'Parked Time',
                    'selected': false
                },
                {
                    'name': 'ParkedBy',
                    'displayName': 'Parked By',
                    'selected': true
                },
                {
                    'name': 'validatedBy',
                    'displayName': 'validated info',
                    'selected': false
                },
                {
                    'name': 'cashAcceptedBy',
                    'displayName': 'Fee collected info',
                    'selected': false
                },
                {
                    'name': 'RequestedAtDateTime',
                    'displayName': 'Requested At',
                    'selected': true
                },
                {
                    'name': 'RequestedAtDate',
                    'displayName': 'Requested Date',
                    'selected': false
                },
                {
                    'name': 'RequestedAtTime',
                    'displayName': 'Requested Time',
                    'selected': false
                },
                {
                    'name': 'RequestedBy',
                    'displayName': 'Requested By',
                    'selected': true
                },
                {
                    'name': 'RequestedLater',
                    'displayName': 'Requested Later',
                    'selected': true
                },
                {
                    'name': 'MoreDetails',
                    'displayName': 'More Details',
                    'selected': true
                },
                {
                    'name': 'AcceptedAtDateTime',
                    'displayName': 'Accepted At',
                    'selected': true
                },
                {
                    'name': 'AcceptedAtDate',
                    'displayName': 'Accepted Date',
                    'selected': false
                },
                {
                    'name': 'AcceptedAtTime',
                    'displayName': 'Accepted Time',
                    'selected': false
                },
                {
                    'name': 'AcceptedBy',
                    'displayName': 'Accepted By',
                    'selected': true
                },
                {
                    'name': 'CompletedAtDateTime',
                    'displayName': 'Completed At',
                    'selected': true
                },
                {
                    'name': 'CompletedAtDate',
                    'displayName': 'Completed Date',
                    'selected': true
                },
                {
                    'name': 'CompletedAtTime',
                    'displayName': 'Completed Time',
                    'selected': true
                },
                {
                    'name': 'CompletedBy',
                    'displayName': 'Completed By',
                    'selected': true
                },
                {
                    'name': 'cardMissed',
                    'displayName': 'Evaletz Card Missed',
                    'selected': true
                },
                {
                    'name': 'name',
                    'displayName': 'Name',
                    'selected': true
                },
                {
                    'name': 'mobileNumber',
                    'displayName': 'Mobile Number',
                    'selected': true
                },
                {
                    'name': 'changeLogs',
                    'displayName': 'ChangeLogs',
                    'selected': true
                },
                {
                    'name': 'cashierName',
                    'displayName': 'Cashier Name',
                    'selected': false
                },
                {
                    'name': 'fees',
                    'displayName': 'Fees',
                    'selected': false
                },
                {
                    'name': 'documents',
                    'displayName': 'Documents',
                    'selected': false
                },
                {
                    'name': 'description',
                    'displayName': 'Fees Description',
                    'selected': false
                },
                {
                    'name': 'diff',
                    'displayName': 'Duration',
                    'selected': true
                },
                {
                    'name': 'scratchesSnap',
                    'displayName': 'Camera Captures',
                    'selected': true
                },
                {
                    'name': 'proofs',
                    'displayName': 'Proofs',
                    'selected': true
                }
            ];
        },
    }

});