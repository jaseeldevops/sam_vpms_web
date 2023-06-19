'use strict';
app.factory('venueService', function($http, $rootScope, notificationService, $localStorage, localStorageService, parkingService, $state) {
    return {
        postVenue: function(venue) {
            $rootScope.loadRunner = true;
            if (venue) {
                var postdata = { venueName: venue.venueName };
                $http.post($rootScope.ipAddress + '/venue/addVenueFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                });

            }
        },
        getAllVenues: function() {
            $rootScope.loadRunner = true;
            $http.get($rootScope.ipAddress + '/venue/find/').success(function(data) {
                $rootScope.loadRunner = false;
                $rootScope.venueAlls = data;
                return $rootScope.venueAlls;
            }).error(function(err) {
                $rootScope.loadRunner = false;
                // console.log("err on venue");
            });
        },
        postAccountVenue: function(venue) {
            var venue = JSON.parse(angular.toJson(venue));
            $rootScope.loadRunner = true;
            if (!venue.defaultValues)
                venue.defaultValues = { free: false };

            if (venue && $rootScope.$user.role == 'accountadmin') {
                if (!$rootScope.accountadminData.venues) {
                    $rootScope.accountadminData.venues = [];
                }
                var postdata = {
                    venueName: venue.venueName,
                    accountID: $rootScope.accountadminData.id,
                    short: venue.short,
                    parkingZones: venue.parkingZones,
                    logo: venue.logo,
                    automaticTokenGeneration: venue.automaticTokenGeneration,
                    printToken: venue.printToken,
                    amount: venue.amount,
                    VAT: venue.VAT,
                    defaultValues: venue.defaultValues,
                    paymentMode: venue.paymentMode,
                    twoLevelValidation: venue.twoLevelValidation,
                    cashierValidateOption: venue.cashierValidateOption,
                    VATType: venue.VATType,
                    settings: venue.settings
                };
                $http.post($rootScope.ipAddress + '/venue/addAccountVenueFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                    if (data.success == 'success') {
                        $rootScope.accountadminData.venues.push(data.venue);
                        notificationService.successNotify('Venue assigned...', 5000);
                    } else if (data.success == 'error') {
                        notificationService.errorNotify('Subscription expired / Venue limit reached');
                    } else
                        notificationService.errorNotify('Subscription expired / Venue limit reached');
                }).error(function(Data) {
                    $rootScope.loadRunner = false;
                    // notificationService.errorNotify('Unable to connect Server');
                });

            } else {
                if (!$rootScope.thisAccount.venues) {
                    $rootScope.thisAccount.venues = [];
                }
                var postdata = {
                    venueName: venue.venueName,
                    accountID: $rootScope.thisAccount.id,
                    short: venue.short,
                    parkingZones: venue.parkingZones,
                    logo: venue.logo,
                    automaticTokenGeneration: venue.automaticTokenGeneration,
                    printToken: venue.printToken,
                    amount: venue.amount,
                    VAT: venue.VAT,
                    defaultValues: venue.defaultValues,
                    paymentMode: venue.paymentMode,
                    twoLevelValidation: venue.twoLevelValidation,
                    cashierValidateOption: venue.cashierValidateOption,
                    VATType: venue.VATType,
                    settings: venue.settings
                };
                $http.post($rootScope.ipAddress + '/venue/addAccountVenueFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                    if (data.success == 'success') {
                        $rootScope.thisAccount.venues.push(data.venue);
                        notificationService.successNotify('Venue assigned...', 5000);
                    } else if (data.success == 'error') {
                        notificationService.errorNotify('Subscription expired / Venue limit reached');
                    } else
                        notificationService.errorNotify('Subscription expired / Venue limit reached');
                }).error(function(Data) {
                    $rootScope.loadRunner = false;
                    // notificationService.errorNotify('Unable to connect Server');
                });
            }
        },
        postAccountDefaultVenue: function(venueID) {
            $rootScope.loadRunner = true;
            if (venueID && $rootScope.$user.role == 'accountadmin') {
                var postdata = { venueID: venueID, accountID: $rootScope.accountadminData.id };
                $http.post($rootScope.ipAddress + '/venue/addAccountDefaultVenueFromAPICall/', postdata).success(function(data) {
                    $rootScope.accountadminData.defaultVenue = venueID;
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Default venue assigned...', 5000);
                }).error(function(Data) {
                    $rootScope.loadRunner = false;
                    //  notificationService.errorNotify('Unable to connect Server');
                });

            } else {
                var postdata = { venueID: venueID, accountID: $rootScope.thisAccount.id };
                $http.post($rootScope.ipAddress + '/venue/addAccountDefaultVenueFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                    $rootScope.thisAccount.defaultVenue = venueID;
                    notificationService.successNotify('Default venue assigned...', 5000);
                }).error(function(Data) {
                    $rootScope.loadRunner = false;
                    //  notificationService.errorNotify('Unable to connect Server');
                });
            }
        },
        assignVenueToAccount: function(venue) {
            $rootScope.loadRunner = true;
            if (venue) {
                var postdata = { venueID: venue.id, accountID: venue.accountID };
                $http.post($rootScope.ipAddress + '/venue/assignVenueToAccountFromAPICall/', postdata).sucess(function(data) {
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Venue assigned...', 5000);
                    $http.get($rootScope.ipAddress + '/user/' + $rootScope.$user.id + '?populate=venues').success(function(data) {
                        // console.log('Venue data changed' + JSON.stringify(data.venues))
                        $rootScope.$user.venues = data.venues;
                        localStorageService.set("VPSUser", $rootScope.$user);
                        parkingService.getCarDetails($rootScope.$user.venues);
                    }).error(function(err) {});
                });
                $rootScope.loadRunner = false;
            } else {
                $rootScope.loadRunner = false;
            }

        },
        assignVenue: function(venue) {
            $rootScope.loadRunner = true;
            var postdata = { venueIDs: venue, userID: $rootScope.$userID };
            if (venue == '' || venue == undefined) {
                notificationService.errorNotify('Please select venue...');
                $rootScope.loadRunner = false;
            } else if (venue) {
                if ($rootScope.$role == "accountadmin") {
                    if (venue.length > 10) {
                        $rootScope.loadRunner = false;
                        alert("You can't select more than 10 venues for account admin");
                        return;
                    }

                    $http.post($rootScope.ipAddress + '/venue/assignVenueToUserFromAPICall/', postdata).success(function(Data) {
                        $rootScope.loadRunner = false;
                        notificationService.successNotify('Venue assigned successfully...', 5000);
                        getLatestVenueAsignedforUser();
                        if ($rootScope.previousState.name == 'app.userProfile') {
                            $state.go('app.userProfile');
                        } else {
                            $state.go('settings.accountUserList');
                        }
                    });

                } else if ($rootScope.$role == "manager") {
                    if (venue.length > 2) {
                        $rootScope.loadRunner = false;
                        alert("You can't select more than 2 venues for manager");
                        return;
                    }

                    $http.post($rootScope.ipAddress + '/venue/assignVenueToUserFromAPICall/', postdata).success(function(Data) {
                        $rootScope.loadRunner = false;
                        notificationService.successNotify('Venue assigned successfully...', 5000);
                        getLatestVenueAsignedforUser();
                        if ($rootScope.previousState.name == 'app.userProfile') {
                            $state.go('app.userProfile');
                        } else {
                            $state.go('settings.accountUserList');
                        }
                    });
                } else if ($rootScope.$role == "chauffeur" || $rootScope.$role == "driver" || $rootScope.$role == "validator" || $rootScope.$role == "accountinguser") {
                    if (venue.length > 1) {
                        $rootScope.loadRunner = false;
                        alert("You can't select more than one venues for chauffeur/driver");
                        return;
                    }

                    $http.post($rootScope.ipAddress + '/venue/assignVenueToUserFromAPICall/', postdata).success(function(Data) {
                        $rootScope.loadRunner = false;
                        notificationService.successNotify('Venue assigned successfully...', 5000);
                        getLatestVenueAsignedforUser();
                        if ($rootScope.previousState.name == 'app.userProfile') {
                            $state.go('app.userProfile');
                        } else {
                            $state.go('settings.accountUserList');
                        }
                    });
                } else {
                    alert('error while assigning...Try again');
                    $rootScope.loadRunner = false;
                }

                function getLatestVenueAsignedforUser() {
                    $http.get($rootScope.ipAddress + '/user/' + $rootScope.$user.id + '?populate=venues').success(function(data) {
                        // console.log('Venue data changed' + JSON.stringify(data.venues))
                        $rootScope.$user.venues = data.venues;
                        localStorageService.set("VPSUser", $rootScope.$user);
                        parkingService.getCarDetails($rootScope.$user.venues);
                    }).error(function(err) {});
                }
            }
        },
        removeVenue: function(venue, userInfo) {
            $rootScope.loadRunner = true;
            // console.log('' + JSON.stringify(venue));
            if (userInfo == 'accountAdmin') {
                // console.log('' + JSON.stringify(userInfo));
                var result = confirm('Do you really want to delete Venue Data ?');
                if (result == true) {
                    $http.post($rootScope.ipAddress + '/venue/removeVenueFromAPICall/', { venueID: venue.id }).success(function(data) {
                        $rootScope.loadRunner = false;
                        $rootScope.accountadminData.venues.splice($rootScope.accountadminData.venues.indexOf(venue), 1);
                        notificationService.successNotify('Venue deleted successfully...', 5000);
                    });
                }
            } else {
                var result = confirm('Do you really want to delete Venue Data ?');
                if (result == true) {
                    $http.post($rootScope.ipAddress + '/venue/removeVenueFromAPICall/', { venueID: venue.id }).success(function(data) {
                        $rootScope.loadRunner = false;
                        $rootScope.thisAccount.venues.splice($rootScope.thisAccount.venues.indexOf(venue), 1);
                        notificationService.successNotify('Venue deleted successfully...', 5000);
                    });
                }
            }

        },
        editVenueName: function(venue) {
            $rootScope.loadRunner = true;
            $http.post($rootScope.ipAddress + '/venue/editVenueNameFromAPICall/', {
                venueID: venue.id,
                venueName: venue.venueName,
                short: venue.short,
                logo: venue.logo,
                parkingZones: venue.parkingZones,
                automaticTokenGeneration: venue.automaticTokenGeneration,
                printToken: venue.printToken,
                amount: venue.amount,
                VAT: venue.VAT,
                defaultValues: venue.defaultValues,
                paymentMode: venue.paymentMode,
                twoLevelValidation: venue.twoLevelValidation,
                cashierValidateOption: venue.cashierValidateOption,
                VATType: venue.VATType,
                settings: venue.settings
            }).success(function(data) {
                // console.log(JSON.stringify(data));
                if ($rootScope.$user.role != 'admin') {
                    $rootScope.loadRunner = false;
                    var i = _.findIndex($rootScope.accountadminData.venues, (v) => { return v.id == venue.id });
                    $rootScope.accountadminData.venues[i]['venueName'] = venue.venueName;
                    $rootScope.accountadminData.venues[i]['short'] = venue.short;
                    if (data.success && data.success.logo)
                        $rootScope.accountadminData.venues[i]['logo'] = data.success[0].logo;
                    $rootScope.accountadminData.venues[i]['parkingZones'] = venue.parkingZones;
                    $rootScope.accountadminData.venues[i]['automaticTokenGeneration'] = venue.automaticTokenGeneration;
                    $rootScope.accountadminData.venues[i]['printToken'] = venue.printToken;
                    $rootScope.accountadminData.venues[i]['amount'] = venue.amount;
                    $rootScope.accountadminData.venues[i]['VAT'] = venue.VAT;
                    $rootScope.accountadminData.venues[i]['defaultValues'] = venue.defaultValues;

                    $rootScope.accountadminData.venues[i]['paymentMode'] = venue.paymentMode;
                    $rootScope.accountadminData.venues[i]['twoLevelValidation'] = venue.twoLevelValidation
                    $rootScope.accountadminData.venues[i]['cashierValidateOption'] = venue.cashierValidateOption

                    $rootScope.accountadminData.venues[i]['VATType'] = venue.VATType;
                    notificationService.successNotify('Venue updated successfully...', 3000);
                } else {
                    notificationService.successNotify('Venue updated successfully...', 3000);
                }
            });
        },
    }
});