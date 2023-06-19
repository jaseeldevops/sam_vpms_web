app.controller('venueCtrl', function($scope, $state, $http, $rootScope, venueService, $window, $stateParams, $timeout, $uibModal, Upload) {
    $rootScope.loadRunner = false;
    $scope.venue = {};
    /* payment mode */
    $scope.paymentMode = [{
        name: 'hourly',
        baseAmount: 0,
        baseHours: 0,
        proceedingAmount: 0,
        concessionMinutes: 0
    }, {
        name: 'day',
        baseAmount: 0,
        baseHours: 0,
        proceedingAmount: 0,
        concessionMinutes: 0
    }, {
        name: 'fixed',
    }];

    $scope.twoLevelValidation = {};
    $scope.cashierValidateOption = {};



    $scope.init = function() {
        $rootScope.loadRunner = true;
        $scope.newvenue = {
            defaultValues: {
                free: false
            },
            settings: {
                keyandDashboardCopy: false,
                verifyOption: false,
                SMS: false,
                requestCar: true,
                parkingZoneAutomaticAllocaton: false,
                initialBillPrint: false,
                completeCar: false,
                carModalName: false,
                reverseCarState: false
            }
        };
        $scope.venue = {
            venueName: ''
        };
        if ($rootScope.$user.accountID && $rootScope.$user.role != 'accountinguser' && $rootScope.$user.role != 'chauffeur' && $state.current.name != 'settings.venue') {
            /*$http.get($rootScope.ipAddress + '/account/' + $rootScope.$user.accountID.id + '?populate=venues').success(function(data) {
                $rootScope.loadRunner = false;
                if ($rootScope.$userID) {
                    $http.get($rootScope.ipAddress + '/user/' + $rootScope.$userID + "?populate=venues").success(function(venuesData) {
                        if (venuesData.venues.length == 0) {
                            $rootScope.loadRunner = false;
                            $scope.venue = data.venues;
                        } else
                            getAssignedVenuesOnly(0);

                        function getAssignedVenuesOnly(d) {
                            if (d < data.venues.length) {
                                _.filter(venuesData.venues, function(obj) {
                                    if (data.venues[d]) {
                                        if (obj.id == data.venues[d].id) {
                                            data.venues[d].checked = true;
                                            d++;
                                            getAssignedVenuesOnly(d);
                                            return true;
                                        } else {
                                            d++;
                                            getAssignedVenuesOnly(d);
                                            return false;
                                        }
                                    } else {
                                        return false;
                                    }
                                });
                            } else {
                                $rootScope.loadRunner = false;
                                $scope.venue = data.venues;
                            }
                        }
                    });
                } else {
                    $rootScope.loadRunner = false;
                    $scope.venue = data.venues;
                }

            }).error(function(err) {
                $rootScope.loadRunner = false;
            });*/
            if ($rootScope.$user.role != 'accountadmin') {
                $http.get($rootScope.ipAddress + '/user/' + $rootScope.$user.id + "?populate=venues").success(function(data) {
                    $rootScope.loadRunner = false;
                    $scope.venue = data.venues;
                });
            } else {
                $http.post($rootScope.ipAddress + '/dailytransactional/getAccountVenuesOnly', { accountID: $rootScope.$user.accountID.id }).success(function(data) {
                    $rootScope.loadRunner = false;
                    $scope.venue = data.venues;
                    if ($state.current.name == 'app.assign_venue') {
                        if ($rootScope.$userID) {
                            $http.get($rootScope.ipAddress + '/user/' + $rootScope.$userID + "?populate=venues").success(function(venuesData) {
                                getAssignedVenuesOnly(0);

                                function getAssignedVenuesOnly(d) {
                                    if (d < $scope.venue.length) {
                                        _.filter(venuesData.venues, function(obj) {
                                            if ($scope.venue[d]) {
                                                if (obj.id == $scope.venue[d].id) {
                                                    $scope.venue[d].checked = true;
                                                    d++;
                                                    getAssignedVenuesOnly(d);
                                                    return true;
                                                } else {
                                                    d++;
                                                    getAssignedVenuesOnly(d);
                                                    return false;
                                                }
                                            } else {
                                                return false;
                                            }
                                        });
                                    } else {
                                        $rootScope.loadRunner = false;
                                    }
                                }
                            });
                        } else {
                            $rootScope.loadRunner = false;
                            $scope.venue = data.venues;
                        }
                    }
                });
            }
        }

    }
    $scope.init();

    $scope.paymentmodeHasBeenChanged = function(addorEdit) {
        if (addorEdit == 'add') {
            if ($scope.newvenue.paymentMode.name != 'fixed')
                $scope.newvenue.settings.verifyOption = true;
        } else {
            if ($scope.venueDetails.paymentMode.name != 'fixed')
                $scope.venueDetails.settings.verifyOption = true;
        }
    }

    $scope.resetExtraSettings = function() {
        if (!$scope.newvenue.defaultValues.free) {
            $scope.newvenue['settings'].SMS = false;
            $scope.newvenue['settings'].requestCar = true;
            $scope.newvenue['settings'].parkingZoneAutomaticAllocaton = false;
            $scope.newvenue['settings'].completeCar = false;
            $scope.newvenue['settings'].reverseCarState = false;
        }
        if ($scope.newvenue.defaultValues.free) {
            $scope.newvenue['settings'].keyandDashboardCopy = false;
            $scope.newvenue['settings'].verifyOption = false;
            $scope.newvenue['settings'].initialBillPrint = false;
        }
    }


    if ($rootScope.$user && $rootScope.$user.role == 'admin') {
        $http.get($rootScope.ipAddress + '/account/getRawAccountNameandID').success(function (data) {
            $rootScope.loadRunner = false;
            $scope.accountWithvenues = data;
        }).error(function (err) {
            $rootScope.loadRunner = false;
        });

    }

    $scope.defaultVenue = {};

    $scope.postDefaultVenue = function(defaultVenue) {
        if (defaultVenue != '') {
            venueService.postAccountDefaultVenue(defaultVenue);
        } else {
            alert("Please select default venue");
        }
    }

    $scope.doRefreshForVenue = function() {
        if ($rootScope.$user.accountID) {
            // $http.get($rootScope.ipAddress + '/venue/find?populate=null').success(function(data) {
            $http.get($rootScope.ipAddress + '/account/' + $rootScope.$user.accountID.id + '?populate=venues').success(function(data) {
                $rootScope.loadRunner = false;
                $scope.venue = data.venues;
                $scope.$broadcast('scroll.refreshComplete');
            }).error(function(err) {
                $rootScope.loadRunner = false;
            });
        }
    };

    $scope.postVenue = function(venue) {
        venueService.postVenue(venue);
        $scope.venue.push(venue);
        $scope.newvenue = {
            defaultValues: {
                free: false
            }
        };
    }
    $rootScope.image = {};
    $scope.postAccountVenue = function(fileInfo, venue) {
        function getFileExtension(filename) {
            return new Date().getTime() + filename
                .split('.') // Split the string on every period
                .slice(-1)[0]; // Get the last item from the split
        }
        if (Object.keys(venue).length > 0) {
            if (fileInfo) {
                // var _newFileName = Upload.rename(fileInfo, getFileExtension(fileInfo.name))
                Upload.upload({
                    url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                    file: fileInfo,
                    params: {
                        filename: fileInfo.name,
                        file: fileInfo
                    }
                }).success(function(data) {
                    venue.logo = fileInfo.name //fileInfo.name;
                    delete venue.image;
                    venueService.postAccountVenue(venue);
                    $scope.newvenue = {
                        defaultValues: {
                            free: false
                        }
                    };
                    $rootScope.image = {};
                });
            } else {
                venueService.postAccountVenue(venue);
                $scope.newvenue = {
                    defaultValues: {
                        free: false
                    }
                };
            }
        } else {
            alert("Please enter a venue");
        }
    }

    $scope.assignVenueToAccount = function() {
        venueService.assignVenueToAccount($scope.venue);
        $scope.venue.id = {};
        $scope.venue.accountID = {};
    }

    $scope.removeVenue = function(venue, userInfo) {
        venueService.removeVenue(venue, userInfo);
    }

    $scope.venueEditBtn = function() {
        $scope.enableEditor = !$scope.enableEditor;
    }

    $scope.selectedVenues = [];
    $scope.assignVenue = function(venue) {
        for (var i = 0; i < $scope.selectedVenues.length; i++) {
            if ($scope.selectedVenues[i] == venue.id) {
                $scope.selectedVenues.splice(i, 1);
                return;
            }
        }
        $scope.selectedVenues.push(venue.id);
    }
    $scope.assignVenuePush = function(venues) {
        venueService.assignVenue(_.pluck(_.where(venues, { checked: true }), 'id'));
    }

    $scope.editVenueName = function(editVenue) {
        if (!editVenue.defaultValues.free) {
            editVenue['settings'].SMS = false;
            editVenue['settings'].requestCar = true;
            editVenue['settings'].parkingZoneAutomaticAllocaton = false;
            editVenue['settings'].completeCar = false;
        }
        if (editVenue.defaultValues.free) {
            editVenue['settings'].keyandDashboardCopy = false;
            editVenue['settings'].verifyOption = false;
            editVenue['settings'].initialBillPrint = false;
        }
        if (editVenue.venuLogo) {
            Upload.upload({
                url: $rootScope.ipAddress + '/venue/UploadVenueLogo',
                params: {
                    'Content-Type': editVenue.venuLogo.type
                },
                data: {
                    file: editVenue.venuLogo
                }
            }).success(function(data) {
                editVenue.logo = editVenue.venuLogo.name; //fileInfo.name;
                delete editVenue.venuLogo;
                var venue = JSON.parse(angular.toJson(editVenue));
                venueService.editVenueName(venue);
                $('#venuEditModal').modal('hide');
            });
        } else {
            var venue = JSON.parse(angular.toJson(editVenue));
            // console.log("with out upload" + JSON.stringify(venue));
            venueService.editVenueName(venue);
            $('#venuEditModal').modal('hide');
        }
    }
    $scope.editMode = false;

    if ($rootScope.$user.role == 'accountadmin') {
        if ($state.current.name == 'settings.venue') {
            // $http.get($rootScope.ipAddress + '/account/find/' + $rootScope.$user.accountID.id + '?populate=users&populate=venues')
            $http.get($rootScope.ipAddress + '/account/find/' + $rootScope.$user.accountID.id + '?populate=venues')
                .success(function(data) {
                    $rootScope.accountadminData = data;
                    $rootScope.loadRunner = false;
                }).error(function(err) {});
        }
    }

    $scope.gettingDefaultVenue = function(data1, data2) {
        if (data1) {
            $http.get($rootScope.ipAddress + '/account/' + data1.id + "?populate=null").success(function(accountDataFound) {
                $scope.defaultVenue = accountDataFound.defaultVenue;
                $rootScope.loadRunner = false;
            });
        } else {
            $http.get($rootScope.ipAddress + '/account/' + $rootScope.$user.accountID.id + "?populate=null").success(function(accountDataFound) {
                $scope.defaultVenue = accountDataFound.defaultVenue;
                $rootScope.loadRunner = false;
            });
        }
    }

    $scope.selectAnAccount = function(data) {
        $scope.SelectedAccount = data;
    }

    $scope.venueDetails = {};
    $scope.open = function(venueDetails) {
        $scope.venueDetails = angular.copy(venueDetails);
        $('#venuEditModal').modal('show');
        // $http.get($rootScope.ipAddress + '/venue/' + venueDetails.id + "?populate=users")
        $http.post($rootScope.ipAddress + '/dailytransactional/getVenuewithFilteredDrivers', { 'venueID': venueDetails.id })
            .success(function(accountDataFound) {
                $scope.thisVenueChauffeurs = _.filter(accountDataFound.users, (y) => { return y.role == 'driver' });
            });
    };

    $scope.close = function() {
        $('.modal').modal('hide');
    }

    $scope.zonePush = function(data, index) {
        if (!data.parkingZones)
            data.parkingZones = [{ name: '' }];
        else
            data.parkingZones.push({ name: '' });
    }
    $scope.zoneRemove = function(data, index) {
        data.parkingZones.splice(index, 1);
    }

    $scope.editVenuetoGetOriginal = function(data) {
        $scope.originalVenueDataBeforeEdit = angular.copy(data);
    }

    $scope.resettoInitVenueData = function(data, index) {
        $rootScope.accountadminData.venues[index] = $scope.originalVenueDataBeforeEdit;
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