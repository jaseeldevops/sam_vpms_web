app.controller('accountCtrl', function($scope, $http, $rootScope, $state, accountService, notificationService, $stateParams, $timeout, offlineLoginService, dataService) {
    $scope.clear = function() {
        $scope.accountData = {
            accountName: '',
            subscriptionID: '',
            paymentID: '',
            subscriptionStatus: '',
            paymentDescription: '',
            paymentType: '',
            amount: '',
            bank: ''
        };
        $scope.accountData2 = {
            subscriptionID: '',
            paymentID: '',
            subscriptionStatus: '',
            paymentDescription: '',
            paymentType: '',
            amount: '',
            bank: ''
        };
    }

    $rootScope.accountDatas = [];

    $scope.regions = dataService.getAllTimeZone();

    $scope.regionSelected = function(region) {
        $scope.timeZone = _.filter($scope.regions, function(r) {
            return r.group == region;
        })[0].zones;
    }

    $scope.init = function() {
        // if ($rootScope.$user && $rootScope.$user.role == 'admin' || $rootScope.$user.role == 'accountadmin') {
        //     $http.get($rootScope.ipAddress + '/account?populate=users&populate=venues').success(function(data) {
        //         $rootScope.accountDatas = data;
        //         // console.log('sub' + JSON.stringify($rootScope.accountDatas));
        //         for (var k = 0; k < $scope.accountDatas.length; k++) {
        //             if ($rootScope.$user.role != 'admin') {
        //                 if ($scope.accountDatas[k].id == $rootScope.$user.accountID.id) {
        //                     $rootScope.AccountAdminVenues = $scope.accountDatas[k].venues;
        //                 }
        //                 if ($scope.accountDatas[k].id == $rootScope.$user.accountID.id) {}
        //             }
        //         };
        //     }).error(function(err) {
        //         $rootScope.loadRunner = false;
        //     });
        // }


        if ($rootScope.$user && $rootScope.$user.role == 'admin') {
            $http.get($rootScope.ipAddress + '/account?populate=users&populate=venues').success(function(data) {
                $rootScope.accountDatas = data;
            }).error(function(err) {
                $rootScope.loadRunner = false;
            });
        }

        /* if ($rootScope.$user && $rootScope.$user.role == 'accountadmin') {
            $http.get($rootScope.ipAddress + '/account/' + $rootScope.$user.accountID.id + '?populate=users&populate=venues').success(function(data) {
                $rootScope.accountDatas = data;
                $rootScope.AccountAdminVenues = data.venues;
            }).error(function(err) {
                $rootScope.loadRunner = false;
            });
        } */ ////


        if ($rootScope.$user.accountID && $rootScope.$user.role != 'accountinguser' && $rootScope.$user.role != 'chauffeur' && $state.current.name == 'settings.accountUserList') {
            if ($rootScope.$user.role != 'accountadmin') {
                $http.get($rootScope.ipAddress + '/user/' + $rootScope.$user.id + "?populate=venues").success(function(data) {
                    $rootScope.loadRunner = false;
                    $scope.venue = data.venues;
                });
            } else {
                $http.post($rootScope.ipAddress + '/dailytransactional/getAccountVenuesOnly', { accountID: $rootScope.$user.accountID.id }).success(function(data) {
                    $rootScope.loadRunner = false;
                    $scope.venue = data.venues;
                });
            }
        }





        $rootScope.accountDrivers = [];
        if ($rootScope.$user.role == "chauffeur") {
            if ($rootScope.$user.venues) {
                if ($rootScope.$user.venues.length > 0) {
                    // $http.get($rootScope.ipAddress + '/venue/' +  $rootScope.$user.venues[0].id + "?populate=users")
                    $http.post($rootScope.ipAddress + '/dailytransactional/getVenuewithFilteredDrivers', { 'venueID': $rootScope.$user.venues[0].id })
                        .success(function(venuesData) {
                            if (venuesData && venuesData.users)
                                getDriversOnly(0);

                            function getDriversOnly(d) {
                                if (d < venuesData.users.length) {
                                    if (venuesData.users[d].role == 'driver') {
                                        $rootScope.accountDrivers.push(venuesData.users[d]);
                                    }
                                    d++;
                                    getDriversOnly(d);
                                } else {}
                            }
                        }).error(function(err) {});
                }
            }
        }
    }

    $scope.searchText = '';
    $rootScope.thisAccountLog=[];
    $rootScope.thisAccountLogDetails = {};
    $rootScope.selectedDriverTemp = {};

    $scope.changeSelectedItem = function(sel) {
        $rootScope.selectedDriverTemp = sel;
    }

    $scope.assignSelectedObj = function(selectedObj) {
        $rootScope.selectedDriverTemp = selectedObj;
    }

    $scope.assignVenueObj = function(venuesObj) {
        $scope.seletedVenueByAAandManager = venuesObj;
    }

    $scope.onSelected2 = function() {
        // alert('onselect');
        $timeout(function() {
            $(':focus').blur();
        })
    }

    if ($rootScope.$user) {
        if ($rootScope.$user.role == 'accountadmin') {
            if ($state.current.name == 'settings.accountUserList') {
                $http.post($rootScope.ipAddress + '/dailytransactional/populateAccoutUsersVenues/', {
                    "accountID": $rootScope.$user.accountID.id
                }).success(function(data) {
                    $rootScope.accountadminData = {};
                    $rootScope.accountadminData.users = data;
                    $scope.filterVenueWiseUserDetails();
                });
            }
            if ($state.current.name == 'settings.subscription') {
                // $http.get($rootScope.ipAddress + '/account/' + $rootScope.$user.accountID.id + '?populate=null')
                $http.post($rootScope.ipAddress + '/account/getAccountSubscriptionLogs', { accountID: $rootScope.$user.accountID.id })
                    .success(function(result) {
                        $rootScope.accountadminData = {};
                        $rootScope.accountadminData.subscriptionLog = _.filter(result, (obj)=>{
                            if (moment(moment(obj.subscriptionEndDate).format("YYYY-MM-DD")).diff(moment(), 'days') < 0){
                                obj.subscriptionStatus ='expired';
                                return obj
                            }else{
                                return obj
                            }
                        })
                    });
            }
        }
    }

    $scope.accountVenuesandDrivers = [];
    var driv = [];
    if ($rootScope.$user && ($state.current.name == 'app.addCar' || $state.current.name == 'app.editCar')) { // || $state.current.name == 'app.mainDashboard')) { /////'|| $state.current.name == 'app.mainDashboard'
        if ($rootScope.$user.role == 'accountadmin') {
            $scope.accountVenuesandDrivers = [];
            $http.post($rootScope.ipAddress + '/dailytransactional/getAccountVenueswithUsers', { 'accountID': $rootScope.$user.accountID.id }).success(function(data) {
                if (data.venues.length > 0) {
                    driv = [];
                    getVenueAssignedUsers(0);

                    function getVenueAssignedUsers(v) {
                        if (v < data.venues.length) {
                            driv = [];
                            getDriversOnly(0)

                            function getDriversOnly(d) {
                                if (d < data.venues[v].users.length) {
                                    if (data.venues[v].users[d].role == 'driver') {
                                        driv.push(data.venues[v].users[d]);
                                    }
                                    d++;
                                    getDriversOnly(d);
                                } else {
                                    $scope.accountVenuesandDrivers.push(data.venues[v]);
                                    //     {
                                    //     venueName: data.venues[v].venueName,
                                    //     id: data.venues[v].id,
                                    //     users: driv,
                                    //     short: data.venues[v].short,
                                    //     parkingZones: data.venues[v].parkingZones,
                                    //     VAT: data.venues[v].VAT,
                                    //     amount: data.venues[v].amount,
                                    //     defaultValues: data.venues[v].defaultValues,
                                    //     automaticTokenGeneration: data.venues[v].automaticTokenGeneration
                                    // })
                                    v++;
                                    getVenueAssignedUsers(v);
                                }
                            }
                        } else {
                            // console.log(JSON.stringify($scope.accountVenuesandDrivers))
                            if ($scope.accountVenuesandDrivers.length == 1) {
                                $scope.seletedVenueByAAandManager = $scope.accountVenuesandDrivers[0];


                                var newZones = [];
                                var parkingslotcounter = 0;
                                if ($scope.accountVenuesandDrivers[0].parkingZones && $scope.accountVenuesandDrivers[0].parkingZones.length > 0)
                                    parkingZonePopulating(0);
                                else
                                    $rootScope.parkingZones = $scope.accountVenuesandDrivers[0].parkingZones ? $scope.accountVenuesandDrivers[0].parkingZones : [];

                                if ($scope.accountVenuesandDrivers[0].defaultValues && $scope.accountVenuesandDrivers[0].defaultValues.driver)
                                    $rootScope.selectedDriverTemp = $scope.accountVenuesandDrivers[0].defaultValues.driver;

                                if ($scope.accountVenuesandDrivers[0].defaultValues && $scope.accountVenuesandDrivers[0].defaultValues.customerType)
                                    $rootScope.customerType = $scope.accountVenuesandDrivers[0].defaultValues.customerType;


                                if ($state.current.name == 'app.addCar') {
                                    if ($scope.accountVenuesandDrivers[0].automaticTokenGeneration) {
                                        if ($scope.accountVenuesandDrivers[0].short) {
                                            // $scope.readedBarCode = $rootScope.$user.venues[0].short + new IDGenerator().generate();
                                            $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $scope.accountVenuesandDrivers[0].id }).then(function(data) {
                                                $scope.readedBarCode = $scope.accountVenuesandDrivers[0].short + data.data.newTicket;
                                            });
                                        } else {
                                            // $scope.readedBarCode = new IDGenerator().generate();
                                            $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $scope.accountVenuesandDrivers[0].id }).then(function(data) {
                                                $scope.readedBarCode = data.data.newTicket;
                                            })
                                        }
                                    } else
                                        $scope.readedBarCode = "";
                                }




                                function parkingZonePopulating(zone) {
                                    parkingslotcounter = 0
                                    if (zone < $scope.accountVenuesandDrivers[0].parkingZones.length) {
                                        if ($scope.accountVenuesandDrivers[0].parkingZones[zone].noofPatkingSlots) {
                                            if ($scope.accountVenuesandDrivers[0].parkingZones[zone].startsfrom)
                                                printSlots($scope.accountVenuesandDrivers[0].parkingZones[zone].startsfrom);
                                            else
                                                printSlots(0);

                                            function printSlots(pzonessss) {
                                                if (parkingslotcounter <= $scope.accountVenuesandDrivers[0].parkingZones[zone].noofPatkingSlots) {
                                                    newZones.push({
                                                        name: pzonessss + " " + $scope.accountVenuesandDrivers[0].parkingZones[zone].name
                                                    });
                                                    parkingslotcounter++;
                                                    pzonessss++;
                                                    printSlots(pzonessss);
                                                } else {
                                                    zone++;
                                                    parkingZonePopulating(zone);
                                                }
                                            }
                                        } else {
                                            if ($scope.accountVenuesandDrivers[0].parkingZones[zone] && $scope.accountVenuesandDrivers[0].parkingZones[zone].name)
                                                newZones.push({
                                                    name: $scope.accountVenuesandDrivers[0].parkingZones[zone].name
                                                });
                                            zone++;
                                            parkingZonePopulating(zone);
                                        }
                                    } else {
                                        // console.log(JSON.stringify(newZones))
                                        $rootScope.parkingZones = newZones;
                                    }
                                }


                            }

                            $rootScope.loadRunner = false;
                        }
                    }
                }
                $rootScope.loadRunner = false;
            });

            /* $http.get($rootScope.ipAddress + '/account/find/' + $rootScope.$user.accountID.id + "?populate=venues").success(function(data) {
                if (data.venues.length > 0) {
                    driv = []
                    getVenueAssignedUsers(0);

                    function getVenueAssignedUsers(v) {
                        if (v < data.venues.length) {
                            driv = [];
                            $http.get($rootScope.ipAddress + '/venue/' + data.venues[v].id + "?populate=users").success(function(venuesData) {
                                driv = [];
                                getDriversOnly(0)

                                function getDriversOnly(d) {
                                    if (d < venuesData.users.length) {
                                        if (venuesData.users[d].role == 'driver') {
                                            driv.push(venuesData.users[d]);
                                        }
                                        d++;
                                        getDriversOnly(d);
                                    } else {
                                        $scope.accountVenuesandDrivers.push({
                                            venueName: data.venues[v].venueName,
                                            id: data.venues[v].id,
                                            users: driv,
                                            short: data.venues[v].short,
                                            parkingZones: data.venues[v].parkingZones,
                                            VAT: data.venues[v].VAT,
                                            amount: data.venues[v].amount,
                                            defaultValues: data.venues[v].defaultValues,
                                            automaticTokenGeneration: data.venues[v].automaticTokenGeneration
                                        })
                                        v++;
                                        getVenueAssignedUsers(v);
                                    }
                                }
                            }).error(function(err) {
                                v++;
                                getVenueAssignedUsers(v);
                            });
                        } else {
                            // console.log(JSON.stringify($scope.accountVenuesandDrivers))
                            if ($scope.accountVenuesandDrivers.length == 1) {
                                $scope.seletedVenueByAAandManager = $scope.accountVenuesandDrivers[0];


                                var newZones = [];
                                var parkingslotcounter = 0;
                                if ($scope.accountVenuesandDrivers[0].parkingZones && $scope.accountVenuesandDrivers[0].parkingZones.length > 0)
                                    parkingZonePopulating(0);
                                else
                                    $rootScope.parkingZones = $scope.accountVenuesandDrivers[0].parkingZones ? $scope.accountVenuesandDrivers[0].parkingZones : [];

                                if ($scope.accountVenuesandDrivers[0].defaultValues && $scope.accountVenuesandDrivers[0].defaultValues.driver)
                                    $rootScope.selectedDriverTemp = $scope.accountVenuesandDrivers[0].defaultValues.driver;

                                if ($scope.accountVenuesandDrivers[0].defaultValues && $scope.accountVenuesandDrivers[0].defaultValues.customerType)
                                    $rootScope.customerType = $scope.accountVenuesandDrivers[0].defaultValues.customerType;


                                if ($state.current.name == 'app.addCar') {
                                    if ($scope.accountVenuesandDrivers[0].automaticTokenGeneration) {
                                        if ($scope.accountVenuesandDrivers[0].short) {
                                            // $scope.readedBarCode = $rootScope.$user.venues[0].short + new IDGenerator().generate();
                                            $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $scope.accountVenuesandDrivers[0].id }).then(function(data) {
                                                $scope.readedBarCode = $scope.accountVenuesandDrivers[0].short + data.data.newTicket;
                                            });
                                        } else {
                                            // $scope.readedBarCode = new IDGenerator().generate();
                                            $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $scope.accountVenuesandDrivers[0].id }).then(function(data) {
                                                $scope.readedBarCode = data.data.newTicket;
                                            })
                                        }
                                    } else
                                        $scope.readedBarCode = "";
                                }




                                function parkingZonePopulating(zone) {
                                    parkingslotcounter = 0
                                    if (zone < $scope.accountVenuesandDrivers[0].parkingZones.length) {
                                        if ($scope.accountVenuesandDrivers[0].parkingZones[zone].noofPatkingSlots) {
                                            if ($scope.accountVenuesandDrivers[0].parkingZones[zone].startsfrom)
                                                printSlots($scope.accountVenuesandDrivers[0].parkingZones[zone].startsfrom);
                                            else
                                                printSlots(0);

                                            function printSlots(pzonessss) {
                                                if (parkingslotcounter <= $scope.accountVenuesandDrivers[0].parkingZones[zone].noofPatkingSlots) {
                                                    newZones.push({
                                                        name: pzonessss + " " + $scope.accountVenuesandDrivers[0].parkingZones[zone].name
                                                    });
                                                    parkingslotcounter++;
                                                    pzonessss++;
                                                    printSlots(pzonessss);
                                                } else {
                                                    zone++;
                                                    parkingZonePopulating(zone);
                                                }
                                            }
                                        } else {
                                            if ($scope.accountVenuesandDrivers[0].parkingZones[zone] && $scope.accountVenuesandDrivers[0].parkingZones[zone].name)
                                                newZones.push({
                                                    name: $scope.accountVenuesandDrivers[0].parkingZones[zone].name
                                                });
                                            zone++;
                                            parkingZonePopulating(zone);
                                        }
                                    } else {
                                        // console.log(JSON.stringify(newZones))
                                        $rootScope.parkingZones = newZones;
                                    }
                                }


                            }

                            $rootScope.loadRunner = false;
                        }
                    }
                }
                $rootScope.loadRunner = false;
                // console.log('account' + JSON.stringify(data));
            }).error(function(err) {
                $rootScope.loadRunner = false;
                offlineLoginService.gettingAccountVenuesWithUsers(function(drivers) {
                    $scope.accountVenuesandDrivers = drivers;
                    if ($scope.accountVenuesandDrivers.length == 1) {
                        $scope.seletedVenueByAAandManager = $scope.accountVenuesandDrivers[0];
                        $rootScope.parkingZones = $scope.accountVenuesandDrivers[0].parkingZones ? $scope.accountVenuesandDrivers[0].parkingZones : [];
                    }
                });
            }); */
        } else if ($rootScope.$user.role == 'manager') {
            if ($rootScope.$user.venues.length > 0 && $rootScope.isOnline) {
                getVenueAssignedUsers(0)

                function getVenueAssignedUsers(v) {
                    if (v < $rootScope.$user.venues.length) {
                        driv = []
                            // console.log($rootScope.$user.venues[v].venueName)
                        $http.get($rootScope.ipAddress + '/venue/' + $rootScope.$user.venues[v].id + "?populate=users").success(function(venuesData) {
                            driv = [];
                            getDriversOnly(0)

                            function getDriversOnly(d) {
                                if (d < venuesData.users.length) {
                                    if (venuesData.users[d].role == 'driver') {
                                        driv.push(venuesData.users[d]);
                                    }
                                    d++;
                                    getDriversOnly(d);
                                } else {
                                    $scope.accountVenuesandDrivers.push({
                                        venueName: $rootScope.$user.venues[v].venueName,
                                        id: $rootScope.$user.venues[v].id,
                                        users: driv,
                                        short: $rootScope.$user.venues[v].short,
                                        parkingZones: $rootScope.$user.venues[v].parkingZones,
                                        VAT: $rootScope.$user.venues[v].VAT,
                                        amount: $rootScope.$user.venues[v].amount,
                                        defaultValues: $rootScope.$user.venues[v].defaultValues
                                    })
                                    v++;
                                    getVenueAssignedUsers(v);
                                }
                            }
                        }).error(function(err) {
                            v++;
                            getVenueAssignedUsers(v);
                        });
                    } else {
                        // console.log(JSON.stringify($scope.accountVenuesandDrivers))
                        if ($scope.accountVenuesandDrivers.length == 1) {
                            $scope.seletedVenueByAAandManager = $scope.accountVenuesandDrivers[0];
                            var newZones = [];
                            if ($scope.accountVenuesandDrivers[0].parkingZones && $scope.accountVenuesandDrivers[0].parkingZones.length)
                                parkingZonePopulating(0);
                            else
                                $rootScope.parkingZones = $scope.accountVenuesandDrivers[0].parkingZones ? $scope.accountVenuesandDrivers[0].parkingZones : [];

                            if ($scope.accountVenuesandDrivers[0].defaultValues.customerType)
                                $rootScope.customerType = $scope.accountVenuesandDrivers[0].defaultValues.customerType;

                            if ($scope.accountVenuesandDrivers[0].defaultValues.driver)
                                $rootScope.selectedDriverTemp = $scope.accountVenuesandDrivers[0].defaultValues.driver;




                            function parkingZonePopulating(zone) {
                                if (zone < $scope.accountVenuesandDrivers[0].parkingZones.length) {
                                    if ($scope.accountVenuesandDrivers[0].parkingZones[zone].noofPatkingSlots) {
                                        if ($scope.accountVenuesandDrivers[0].parkingZones[zone].startsfrom)
                                            printSlots($scope.accountVenuesandDrivers[0].parkingZones[zone].startsfrom);
                                        else
                                            printSlots(0);

                                        function printSlots(pzonessss) {
                                            if (pzonessss <= $scope.accountVenuesandDrivers[0].parkingZones[zone].noofPatkingSlots) {
                                                newZones.push({
                                                    name: pzonessss + " " + $scope.accountVenuesandDrivers[0].parkingZones[zone].name
                                                });
                                                pzonessss++;
                                                printSlots(pzonessss);
                                            } else {
                                                zone++;
                                                parkingZonePopulating(zone);
                                            }
                                        }
                                    } else {
                                        if ($scope.accountVenuesandDrivers[0].parkingZones[zone] && $scope.accountVenuesandDrivers[0].parkingZones[zone].name)
                                            newZones.push({
                                                name: $scope.accountVenuesandDrivers[0].parkingZones[zone].name
                                            });
                                        zone++;
                                        parkingZonePopulating(zone);
                                    }
                                } else {
                                    // console.log(JSON.stringify(newZones))
                                    $rootScope.parkingZones = newZones;
                                }
                            }

                        }
                    }
                }
            } else if (!$rootScope.isOnline) {
                offlineLoginService.gettingAccountVenuesWithUsers(function(venues) {
                    getVenueAssignedUsers(0);

                    function getVenueAssignedUsers(v) {
                        if (v < $rootScope.$user.venues.length) {
                            $scope.accountVenuesandDrivers.push(_.filter(venues, function(venue) {
                                return venue.id == $rootScope.$user.venues[v].id;
                            })[0]);
                            v++;
                            getVenueAssignedUsers(v);
                        } else {
                            if ($scope.accountVenuesandDrivers.length == 1) {
                                $scope.seletedVenueByAAandManager = $scope.accountVenuesandDrivers[0]
                                $rootScope.parkingZones = $scope.accountVenuesandDrivers[0].parkingZones ? $scope.accountVenuesandDrivers[0].parkingZones : [];
                            }
                        }
                    }
                });
            }
        }
    }

    if ($rootScope.selectedVenueDetails && $state.current.name == 'app.editCar') {
        // alert(JSON.stringify($rootScope.selectedVenueDetails));
        if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'accountinguser' && $rootScope.$user.role != 'validator') {
            driv = [];
            $http.post($rootScope.ipAddress + '/dailytransactional/getVenuewithFilteredDrivers', { 'venueID': $rootScope.selectedVenueDetails.id }).then(function(venuesData) {
                    console.log(JSON.stringify(venuesData))
                    venuesData = venuesData.data;
                    driv = [];
                    // if(venuesData && venuesData.users)
                    getDriversOnly(0);

                    function getDriversOnly(d) {
                        if (d < venuesData.users.length) {
                            if (venuesData.users[d].role == 'driver') {
                                driv.push(venuesData.users[d]);
                            }
                            d++;
                            getDriversOnly(d);
                        } else {
                            $scope.seletedVenueByAAandManager = venuesData;
                            //  {
                            //     venueName: $rootScope.selectedVenueDetails.venueName,
                            //     id: $rootScope.selectedVenueDetails.id,
                            //     users: driv,
                            //     short: $rootScope.selectedVenueDetails.short,
                            //     parkingZones: $rootScope.selectedVenueDetails.parkingZones,
                            //     VAT: $rootScope.selectedVenueDetails.VAT,
                            //     amount: $rootScope.selectedVenueDetails.amount,
                            //     defaultValues: $rootScope.selectedVenueDetails.defaultValues
                            // };
                        }
                    }

                })
                // .error(function(err) {
                // });
        }
    }

    $scope.getVenueUsers = function(selectedVenue) {
        $rootScope.loadRunner = true;
        // $http.get($rootScope.ipAddress + '/venue/' + selectedVenue + "?populate=users")
        $http.post($rootScope.ipAddress + '/dailytransactional/getVenuewithFilteredDrivers', { 'venueID': selectedVenue }).success(function(data) {
            // $rootScope.accountDrivers = data.users;
            $rootScope.accountDrivers = [];
            if (data && data.users)
                getDrivers(0);

            function getDrivers(d) {
                if (d < data.users.length) {
                    if (data.users[d].role == 'driver') {
                        $rootScope.accountDrivers.push(data.users[d]);
                    }
                    d++;
                    getDrivers(d)
                } else {
                    $rootScope.loadRunner = false;
                }
            }
        }).error(function(err) {
            $rootScope.loadRunner = false;
        });
    }
    $scope.getVenueDrivers = function(selectedVenue) {
        $rootScope.loadRunner = true;
        // $http.get($rootScope.ipAddress + '/venue/' + selectedVenue + "?populate=users")
        $http.post($rootScope.ipAddress + '/dailytransactional/getVenuewithFilteredDrivers', { 'venueID': selectedVenue }).success(function(data) {
            // $rootScope.accountDrivers = data.users;
            $rootScope.accountDrivers = [];
            if (data && data.users)
                getDrivers(0);

            function getDrivers(d) {
                if (d < data.users.length) {
                    if (data.users[d].role == 'driver') {
                        $rootScope.accountDrivers.push(data.users[d]);
                    }
                    d++;
                    getDrivers(d);
                } else {
                    $rootScope.loadRunner = false;
                }
            }
        }).error(function(err) {
            $rootScope.loadRunner = false;
        });
    }

    $scope.editButton = function() {
        $scope.enableEditor = !$scope.enableEditor;
    }
    $scope.clear();
    if ($state.current.name != 'app.Settings') {
        if ($rootScope.$user)
            $scope.init();
    }
    $scope.enableEditor = true;
    $scope.btnDisabled = false;

    $scope.postAccount = function(data, addAccount) {
        $scope.btnDisabled = true;
        var _resforAccountCreation = accountService.postAccount($scope.accountData);
        _resforAccountCreation.then(function(data) {
            $scope.accountDatas.push(data.data);
            $('.modal').modal('hide');
            if ($rootScope.$user.role == 'admin' || $rootScope.$user.role == 'accountadmin')
                notificationService.successNotify('Account has been created Successfully..', 5000);
        });
        $scope.clear();
    }

    $scope.postAccountSubscription = function() {
        var _res = accountService.postAccountSubscription($scope.accountData2);
        _res.then(function(data) {
            $rootScope.thisAccount.subscriptionLog.push(data.data[0].subscriptionLog[data.data[0].subscriptionLog.length - 1]);
            $scope.clear();
            $state.go('app.accountSubscriptionList')
        });
    }

    $scope.list = function(data) {
        $rootScope.thisAccount = data;
    }

    $scope.listofAccountSubscription = function(data) {
        $http.post($rootScope.ipAddress + '/account/getAccountSubscriptionLogs', { accountID: data.id })
            .success(function (result) {
                $rootScope.thisAccountLog = result;
                $rootScope.thisAccountLog =_.filter($rootScope.thisAccountLog, (obj)=>{
                    if (moment(moment(obj.subscriptionEndDate).format("YYYY-MM-DD")).diff(moment(), 'days') < 0){
                        obj.subscriptionStatus ='expired';
                        return obj
                    }else{
                        return obj
                    }
                })
            });
    }
    $scope.listofAccountSubscriptionDetails = function(data) {
        $rootScope.thisAccountLogDetails = data;
        //$state.go('accountSubscriptionDetails');
    }

    $scope.listofAccountUser = function(data) {
        $rootScope.thisAccountUserLog = data.users;
        //$state.go('accountUserList');
    }
    $scope.listofAccountUserDetails = function(data) {
        $rootScope.thisAccountUserLogDetails = data;
        // console.log(JSON.stringify(data));
        // $state.go('accountUserDetails');
    }
    $scope.listofAccountVenue = function(data) {
        //$state.go('addAccountVenue');
    }

    $scope.saveEditedAccount1 = function(accontDetails) {
        accountService.saveEditedAccount(accontDetails);
        // $scope.enableEditor = !$scope.enableEditor;
        notificationService.successNotify('Account edited successfully..', 5000);
        $scope.editButton();
    }

    $scope.saveEditedAccount = function() {
        accountService.saveEditedAccount($rootScope.accountadminData);
        $scope.filterVenueWiseUserDetails();
        notificationService.successNotify('Account edited successfully..', 5000);
        $scope.editButton();
    }

    $scope.rateFunction = function(rating) {
        console.log("Rating selected: " + rating);
    };

    $scope.sendReview = function(review) {
        accountService.sendReview(review);
    }
    $scope.deleteAccount = function() {
        swal({
            title: "Are you sure?",
            text: "You will not be able to recover this account!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            var _resforDeleteAccount = accountService.deleteAccount($rootScope.thisAccount);
            _resforDeleteAccount.then(function(data) {
                swal("Deleted!", "Your account has been deleted.", "success");
                notificationService.successNotify('Account has been deleted successfully....', 5000);
                $state.go('settings.accountList');
            });
        });
    }
    $scope.openAddUserModal = function() {
        $('#addUserModal').modal('show');

    }
    $scope.close = function() {
        $('.modal').modal('hide');
    }

    $scope.openAddSubscriptionModal = function() {
        $('#subscriptionAddModal').modal('show')
    }

    $scope.postAccountUserType = function(customUserTypes) {
        if (!$rootScope.$user.accountID.customerTypes)
            $rootScope.$user.accountID.customerTypes = [];
        $rootScope.$user.accountID.customerTypes.push(customUserTypes);
        accountService.postAccountUserType($rootScope.$user.accountID.customerTypes);
        $scope.newUserType = '';
    }
    //
    $scope.editVIPamount = function(amount) {
        if (!$rootScope.$user.accountID.otherInfo)
            $rootScope.$user.accountID.otherInfo = {};
        $rootScope.$user.accountID.otherInfo.vip = amount;
        accountService.updateAccountUserTypesForTVC({ vip : amount});
        $('#vipModal').modal('hide');
        $scope.VIP = {
            vipAmount: amount
        };
    }
    $scope.VIP = {
        vipAmount: ( $rootScope.$user.accountID && $rootScope.$user.accountID.otherInfo  ?  $rootScope.$user.accountID.otherInfo.vip  : 0)
    };
    $scope.openVIPmodal = function(){
        $('#vipModal').modal('show');
    }
    $scope.closeVIPmodal = function(){
        $('#vipModal').modal('hide');
    }
    //
    $scope.removeCustomerType = function(removeCustomTypes, index) {
        $rootScope.$user.accountID.customerTypes.splice(index, 1);
        accountService.removeCustomerType($rootScope.$user.accountID.customerTypes);
    }


    if ($state.current.name == 'app.mainDashboard') {
        $http.post($rootScope.ipAddress + '/dailytransactional/dashboardDatum/', {
            accountID: $rootScope.$user.accountID.id,
            date: moment().format("YYYY-MM-DD")
        }).then(function(data) {
            if (data.data.length > 0) {
                $scope.dashboardDatum = data.data;
                $http.post($rootScope.ipAddress + '/dailytransactional/accountAdminDashboardDatum/', {
                    accountID: $rootScope.$user.accountID.id
                }).then(function(data) {
                    // console.log(JSON.stringify(data));
                    if (data.data) {
                        $scope.dashboardDatumforWidgets = data.data;
                    }
                });
            }
        });
    } else if ($state.current.name == 'app.dashboard') {
        $http.post($rootScope.ipAddress + '/dailytransactional/gettingAccountingUserDashboardDatum/', {
            venueID: $rootScope.$user.venues[0].id,
            date: moment().format("YYYY-MM-DD"),
            timezone: ($rootScope.$user.accountID.timeZone ? $rootScope.$user.accountID.timeZone : "Asia/Kolkata")
        }).then(function(data) {
            if (data.data) {
                $scope.dashboardDatum = data.data;
            }
        });
    }


    $scope.filterVenueWiseUserDetails = function() {
        if ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) {
            $rootScope.filteredUsers = _.filter($rootScope.accountadminData.users, (d) => {
                return (_.filter(d.venues, (v) => {
                    return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id
                })).length > 0;
            });
        } else {
            $rootScope.filteredUsers = angular.copy($rootScope.accountadminData.users);
        }
    }

    $scope.searchUserName = '';
    $scope.pressedKeyByUsername1 = function(data) {
        $scope.searchUserName = data;
    }

    $scope.reportSettings = [];

    if ($state.current.name == 'settings.reportSetting') {
        var _res = accountService.gettingAccountExcelSettings();
        _res.then(function(data) {
            if (data.data && data.data.settings && data.data.settings.length > 0) {
                var _tempIndexforValidator = _.findIndex(data.data.settings, (obj) => {
                    return obj.name == 'validatedBy';
                });
                var _parkedIndex = -1;
                if (_tempIndexforValidator == -1) {
                    _parkedIndex = _.findIndex(data.data.settings, (obj) => {
                        return obj.name == 'ParkedBy';
                    });
                    data.data.settings.splice(_parkedIndex + 1, 0, {
                        'name': 'validatedBy',
                        'displayName': 'validated info',
                        'selected': false
                    });
                    data.data.settings.splice(_parkedIndex + 2, 0, {
                        'name': 'cashAcceptedBy',
                        'displayName': 'Fee collected info',
                        'selected': false
                    });
                }
                // Emirates
                var _tempIndexforEmirates = _.findIndex(data.data.settings, (obj) => {
                    return obj.name == 'emirates';
                });
                var _emirates = -1;
                if (_tempIndexforEmirates == -1) {
                    _emirates = _.findIndex(data.data.settings, (obj) => {
                        return obj.name == 'TokenNumber';
                    });
                    data.data.settings.splice(_emirates + 1, 0, {
                        'name': 'emirates',
                        'displayName': 'Emirates',
                        'selected': false
                    });
                }
                // Revalidated by 
                var _tempIndexforRevalidatedBy = _.findIndex(data.data.settings, (obj) => {
                    return obj.name == 'revalidatedBy';
                });
                var _revalidatedBy = -1;
                if (_tempIndexforRevalidatedBy == -1) {
                    _revalidatedBy = _.findIndex(data.data.settings, (obj) => {
                        return obj.name == 'CompletedBy';
                    });
                    data.data.settings.splice(_revalidatedBy + 1, 0, {
                        'name': 'revalidatedBy',
                        'displayName': 'Revalidated By',
                        'selected': false
                    });
                }
                // Payment Type
                var _tempIndexforPaymentType = _.findIndex(data.data.settings, (obj) => {
                    return obj.name == 'paymentType';
                });
                var _payment = -1;
                if (_tempIndexforPaymentType == -1) {
                    _payment = _.findIndex(data.data.settings, (obj) => {
                        return obj.name == 'cashierName';
                    });
                    data.data.settings.splice(_payment + 1, 0, {
                        'name': 'paymentType',
                        'displayName': 'Payment Type',
                        'selected': false
                    });
                }
                // Ready state
                var _readyState = _.findIndex(data.data.settings, (obj) => {
                    return obj.name == 'ReadyAtDateTime';
                });
                var _readyStateValue = -1;
                if (_readyState == -1) {
                    _readyStateValue = _.findIndex(data.data.settings, (obj) => {
                        return obj.name == 'AcceptedBy';
                    });
                    data.data.settings.splice(_readyStateValue + 1, 0, {
                        'name': 'ReadyAtDateTime',
                        'displayName': 'Readied At',
                        'selected': false
                    });
                    data.data.settings.splice(_readyStateValue + 2, 0,{
                        'name': 'ReadyAtDate',
                        'displayName': 'Readied Date',
                        'selected': false
                    });
                    data.data.settings.splice(_readyStateValue + 3, 0, {
                        'name': 'ReadyAtTime',
                        'displayName': 'Readied Time',
                        'selected': false
                    });
                    data.data.settings.splice(_readyStateValue + 4, 0, {
                        'name': 'ReadydBy',
                        'displayName': 'Readied By',
                        'selected': false
                    });
                }


                $scope.reportSettings = data.data.settings;
            } else
                $scope.reportSettings = accountService.getReportSettingData();
        });
    }

    $scope.reportFieldSetting = function() {
        var _res = accountService.reportFieldSetting($scope.reportSettings);
        _res.then(function(data) {
            notificationService.successNotify('Report field added successfully....', 5000);
        });
    }

    $scope.CheckUncheckAll = function(checked, name) {
        if (name == 'all') {
            $scope.reportSettings = _.filter($scope.reportSettings, function(value) {
                value.selected = checked;
                return value;
            });
        } else {
            $scope.reportSettings = _.filter($scope.reportSettings, function(value) {
                if (value.name == 'all') {
                    value.selected = false;
                }
                return value;
            });


        }
    };
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

app.filter('listVenues', function() {
    return function(list) {
        return _.pluck(list, 'venueName').toString();
    }
});