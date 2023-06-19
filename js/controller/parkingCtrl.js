var scopes;
var audioElement;
app.controller('parkingCtrl', function($scope, $http, $rootScope, parkingService, notificationService, venueService, $window, $state, $timeout, loginService, $stateParams, $document, localStorageService, Upload, offlineDBService, offlineLoginService, dataService, $interval, analyticsService, DTOptionsBuilder, downloadService) { // 
    scopes = $scope;
    $rootScope.state = $state;

    $rootScope.reportno = "No Record Found ";
    $rootScope.nocarfound = "No Car Found";

    $scope.brands = dataService.getAllBrand();


    clearInterval($rootScope.interval);
    if ($rootScope.interval == null || $rootScope.interval == undefined)
        $rootScope.interval = $interval(fn60secforRequestCarNotify, 10 * 1000);


    function fn60secforRequestCarNotify() {
        // console.log("Alert running...");
        if ($rootScope.$user && $rootScope.$user.role) {
            var ringtone = _.filter($rootScope.requestedCar, function(car) {
                if (car.status == 'requested') {
                    if (car.log[1] && car.log[1].specialRequest && !car.log[1].specialRequest.accepted) {
                        return true;
                    } else if (car.log[1] && car.log[1].specialRequest && car.log[1].specialRequest.accepted) {
                        var __duration = moment.duration(moment(moment(car.log[1].specialRequest.dateTime).format()).diff(moment().format())); // car.specialRequest.timeZone
                        // console.log(__duration.asMinutes() + " >>>> " + car.log[1].specialRequest.dateTime)
                        if (__duration.asMinutes() > 15)
                            return false;
                        else {
                            var _temp = _.findIndex($rootScope.requestedCar, function(o) {
                                return o.id == car.id
                            });
                            if (!$rootScope.requestedCar[_temp]['pushNotificationSent'])
                                return true;
                            else {
                                $rootScope.requestedCar[_temp]['pushNotificationSent'] = true;
                                if ($rootScope.$user.accountID.pushNotification) {
                                    if (!$rootScope.isWebView) {
                                        // $window.requestedCarDetailsforNotification("Get car " + car.parkingID + '(' + car.plateNumber.toUpperCase() + ')');
                                        return true;
                                    } else
                                        return true;
                                } else
                                    return true;
                            }
                        }
                    } else
                        return true;
                } else
                    return false;
            }); // special request and accepted 
            // alarm automatically ring 15 minutes before ringing
            // console.log(JSON.stringify(ringtone))
            if (ringtone.length > 0) {
                parkingService.requestRingToneService(ringtone.length);
            }
        }
    }

    $rootScope.completedCar = [];

    $scope.toggle = false;
    $scope.mainimage = 'img/tyrion.jpg';

    $scope.carImagesDetails = [];
    // -------zoom image ---------
    $scope.zoomMin = 1;
    $scope.showimage = function(index, imageInfo) {
        $scope.carImagesDetails = [];

        if (imageInfo.snap != 'noImage' && imageInfo.snap != null && imageInfo.snap != undefined && imageInfo.snap != '') {
            $scope.carImagesDetails.push(imageInfo.snap);
            $scope.activeSlide = index;
        } else {
            $scope.activeSlide = index - 1;
        }
        carImages(0);

        function carImages(i) {
            if (imageInfo.scratchesSnap) {
                if (i < imageInfo.scratchesSnap.length) {
                    $scope.carImagesDetails.push(imageInfo.scratchesSnap[i]);
                    i++;
                    carImages(i);
                } else {
                    $scope.showModal('templates/gallery-zoomimage.html');
                }
            }
        }
    };

    // ConnectivityMonitor.isOnline();
    // ConnectivityMonitor.isOffline();
    // ConnectivityMonitor.startWatching();
    // if (ionic.Platform.isWebView()) {

    /* document.addEventListener('deviceready', function () {
        alert("88888")
    var url = $rootScope.ipAddress + "/images/1480664662631.jpg";
    var targetPath = 'asasa.png'//cordova.file.documentsDirectory + "testImage.png";
    var trustHosts = true;
    var options = {};

    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
        .then(function(result) {
            // Success!
            alert('successfully')
        }, function(err) {
            // Error
            alert('error')
        }, function(progress) {
            $timeout(function() {
                $scope.downloadProgress = (progress.loaded / progress.total) * 100;
            });
        });
         }, false);*/
    // }
    $scope.logout = function() {
        $rootScope.$user = {};
        localStorageService.remove("VPSUser");
        localStorageService.remove("VPSUserisLoggedIn", false);
        notificationService.successNotify('You have successfully logged out', 5000);
        $state.go('app.login');
    }

    $scope.proofImage = function(index, imageInfo) {
        $scope.carImagesDetails = [];
        $scope.activeSlide = index;
        $scope.carImagesDetails = (imageInfo);
    };
    $scope.searchDriver = '';
    $scope.removeSearch = function() {
        $scope.searchDriver = '';
    };

    // $scope.selectedBrandTemp = undefined;
    // $scope.searchandSelectModalforCarModels = function(carBrand, type) {
    //     $rootScope.modalType = type;
    //     if (type == 'editBrand') {
    //         if ($scope.editedCarDetails['color'])
    //             $scope.showColor = true;
    //         else
    //             $scope.showColor = false;
    //         if ($scope.editedCarDetails['brand'] && $scope.editedCarDetails['brand'] != 'other') {
    //             $scope.filteredBrand = _.filter($scope.brands, function(brandData) {
    //                 return brandData.brand == $scope.editedCarDetails['brand'];
    //             });
    //         } else if ($scope.editedCarDetails['brand'] == 'other') {
    //             $scope.filteredBrand = [];
    //         }
    //     }
    //     $('#carBrandColorModal').modal('show')
    // };

    $scope.selectedBrandTemp = undefined;
    $scope.searchandSelectModalforCarModels = function(carBrand) {
        $scope.filteredBrand = [];
        _.filter($scope.brands, function(brandData) {
            if (brandData.brand == carBrand) {
                $scope.filteredBrand.push(brandData.modelName)
            }
            return;
        });
    };


    $scope.searchBrandModel = undefined;
    $scope.selectedBrandedLogo = function(selectedbrand, type) {
        brand = _.clone(selectedbrand);
        if (brand != 'other' && type == 'add') {
            $scope.selectedBrandTemp = {};
            $scope.selectedBrandTemp['brand'] = brand.brand;
            $scope.filteredBrand = _.filter($scope.brands, function(brandData) {
                return brandData.brand == brand.brand;
            });
        } else if (brand == 'other' && type == 'add') {
            $scope.selectedBrandTemp = {
                brand: 'other',
                modelName: '',
                color: ''
            }
            $scope.filteredBrand = [];
        } else if (brand != 'other' && type == 'edit') {
            $scope.editedCarDetails['brand'] = brand.brand;
            // $scope.editedCarDetails['modelName'] = brand.modelName;
            $scope.filteredBrand = _.filter($scope.brands, function(brandData) {
                return brandData.brand == brand.brand;
            });
        } else if (brand == 'other' && type == 'edit') {
            $scope.editedCarDetails['brand'] = 'other';
            $scope.filteredBrand = [];
        }
        $scope.showColor = true;
    };

    $scope.removeSelectedBrand = function(type) {
        if (type == 'add') {
            $scope.selectedBrandTemp = undefined;
            $scope.filteredBrand = [];
        } else if (type == 'edit') {
            $scope.editedCarDetails['brand'] = undefined;
            $scope.editedCarDetails['modelName'] = undefined;
            $scope.editedCarDetails['color'] = undefined;
            $scope.filteredBrand = [];
        } else if (type == "addModelName") {
            $scope.selectedBrandTemp['modelName'] = undefined;
            $scope.selectedBrandTemp['color'] = undefined;
        } else if (type == "editModelName") {
            $scope.editedCarDetails['modelName'] = undefined;
            $scope.editedCarDetails['color'] = undefined;
        } else if (type == 'addColor') {
            $scope.selectedBrandTemp['color'] = undefined;
        } else if (type == 'editColor') {
            $scope.editedCarDetails['color'] = undefined;
        }
        $scope.showColor = false;
    };
    $scope.selectedBrandTemp = undefined;
    $scope.selectedBrandedLogoFinal = function(Selectedbrand, type) {
        brand = _.clone(Selectedbrand);
        if (type == 'add') {
            $scope.selectedBrandTemp = brand;
            $scope.selectedBrandTemp['color'] = undefined;
            $scope.showColor = true;
        } else if (type == 'edit') {
            $scope.editedCarDetails['brand'] = brand.brand;
            $scope.editedCarDetails['modelName'] = brand.modelName;
            $scope.showColor = true;
        } else if (type == 'otherColor') {
            $scope.selectedBrandTemp['color'] = undefined;
            $scope.showColor = true;
        } else if (type == 'otherColor-edit') {
            $scope.editedCarDetails['color'] = undefined;
            $scope.showColor = true;
        }
    };
    $scope.selectedBrandedLogoFinalColor = function(color, type) {
        if (type == 'add')
            $scope.selectedBrandTemp['color'] = color;
        else
            $scope.editedCarDetails['color'] = color;
    };

    $scope.colors = ['black', 'white', 'blue', 'red', 'yellow', 'silver', 'brown', 'green', 'gray', 'violet', 'gold', 'pink', 'orange'];

    $scope.emirates = ['DXB', 'AD', 'SHJ', 'AJN', 'UAQ', 'RAK', 'FJH', 'Al Ain', 'Oman', 'Qatar', 'KSA', 'BHN', 'KWT', 'CC', 'CD', 'UAE'];
    $scope.alphabetCode = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    // $scope.plateCode = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'];
    $scope.selectedDriversDetails = function(driver, type) {
        if (type == 'addCar')
            $rootScope.selectedDriverTemp = _.clone(driver);
        else if (type == 'editCar')
            $scope.selectedDriver2 = _.clone(driver);
        else if (type == "acceptCar")
            $scope.selectedDriver.driver = _.clone(driver);
    };

    $(document).ready(function() {
        $('.btn').click(function() {
            $('.btn').addClass('active');
        });
    });

    $scope.$watch('searchCars', function(newValue, oldValue) {
        $scope.searchCars = newValue;
    })

    $scope.animateElementIn = function($el) {
        $el.removeClass('timeline-hidden');
        $el.addClass('bounce-in');
    };

    $scope.animateElementOut = function($el) {
        $el.addClass('timeline-hidden');
        $el.removeClass('bounce-in');
    };

    $scope.reExecuteAnimation = function() {
        TM = document.getElementsByClassName('tm');
        for (var i = 0; i < TM.length; i++) {
            removeAddClass(TM[i], 'bounce-in');
        }
    }

    $scope.rePerformAnimation = function() {
        $scope.reExecuteAnimation();
    }

    function hasClass(el, className) {
        if (el.classList)
            return el.classList.contains(className)
        else
            return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
    }

    function addClass(el, className) {
        if (el.classList)
            el.classList.add(className)
        else if (!hasClass(el, className)) el.className += " " + className
    }

    function removeClass(el, className) {
        if (el.classList)
            el.classList.remove(className)
        else if (hasClass(el, className)) {
            var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
            el.className = el.className.replace(reg, ' ')
        }
    }

    function removeAddClass(el, className) {
        removeClass(el, className)
        setTimeout(function() {
            addClass(el, className);
        }, 1)

    }

    $scope.snapImage = [];

    io.socket.get($rootScope.ipAddress + '/file/upload');
    io.socket.get($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICall');
    io.socket.get($rootScope.ipAddress + '/requestcar/requestCarFromAPICall');
    io.socket.get($rootScope.ipAddress + '/dailytransactional/updateParkedZone');
    io.socket.get($rootScope.ipAddress + '/file/upload2');
    // io.socket.get($rootScope.ipAddress+'/requestcar/completeCarFromAPICall');
    // io.socket.get($rootScope.ipAddress+'/requestcar/acceptCarFromAPICall');
    // io.socket.get($rootScope.ipAddress+'/requestcar/rejectCarFromAPICall');

    io.socket.get($rootScope.ipAddress + '/account/allowBarCodeAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowCameraAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowCEDAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowMarkImageAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowFingerPrintAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowPushNotificationAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowReadPlateNumberThisAccount');
    io.socket.get($rootScope.ipAddress + '/account/allowvibrateAccesstoThisAccount');
    io.socket.get($rootScope.ipAddress + '/requestcar/onlineSync');

    io.socket.get($rootScope.ipAddress + '/requestcar/revalidatedByCashier');

    $scope.searchCars = "";
    $scope.clearSearch = function() {
        $scope.searchCars = "";
        document.getElementById("searchId").value = "";
        $scope.$parent.showHeader();
    }

    $scope.reportSearch = "";
    $scope.searchFun = function(searchCars) {
        $scope.reportSearch = searchCars;
    }

    $scope.firstParkingID = "";
    $scope.firstParkingIDcounter = 0;
    // $scope.firstParkingIDcounter1=0;
    /* $scope.funt = function(searchCars, $event) {
        // console.log($event.keyCode)
        if ($event && $event.keyCode == 13 && (searchCars && searchCars != '' && searchCars != ' ')) {
            // console.log("-----------" + searchCars)
            // $scope.searchCars = searchCars;
            // alert($scope.searchCars +">>>>>>>>>>>>>" +searchCars  )
            $scope.searchCars = searchCars;
            $scope.firstParkingID = "";
            $scope.firstParkingIDcounter = 0;
            // $scope.firstParkingIDcounter1 = 0;
            if (searchCars == '' || searchCars == ' ') {
                $scope.searchCars = '';
                _.filter($rootScope.parkedCar, (o) => {
                    $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                _.filter($rootScope.requestedCar, (o) => {
                    $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                _.filter($rootScope.completedCar, (o) => {
                    $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
            }
        } else if (($event && $event.keyCode != 13) && searchCars == '') {
            $scope.searchCars = '';
            _.filter($rootScope.parkedCar, (o) => {
                $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                return o.parkingID;
            });
            _.filter($rootScope.requestedCar, (o) => {
                $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                return o.parkingID;
            });
            _.filter($rootScope.completedCar, (o) => {
                $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                return o.parkingID;
            });
        }
    } */


    $scope.funt = function(searchCars, $event) {
        // console.log($event.keyCode)
        if ($event && $event.keyCode == 13 && (searchCars && searchCars != '' && searchCars != ' ')) {
            // console.log("-----------" + searchCars)
            // $scope.searchCars = searchCars;
            // alert($scope.searchCars +">>>>>>>>>>>>>" +searchCars  )
            $scope.searchCars = searchCars;
            $scope.firstParkingID = "";
            $scope.firstParkingIDcounter = 0;
            // $scope.firstParkingIDcounter1 = 0;
            if (searchCars == '' || searchCars == ' ') {
                $scope.searchCars = '';
                _.filter($rootScope.parkedCar, (o) => {
                    $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                _.filter($rootScope.requestedCar, (o) => {
                    $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                _.filter($rootScope.completedCar, (o) => {
                    $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
            } else {
                if ($scope.activeTabs[0]) {
                    $rootScope.parkedCar = [];
                    $rootScope.loadingScrollBusy = false;
                    var __res = parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', $scope.searchCars, $rootScope.$user.venues);
                    __res.then(() => {
                        if ($rootScope.parkedCar.length > 0) {
                            $scope.firstParkingID = "" + angular.lowercase($rootScope.parkedCar[0].parkingID);
                            // $scope.firstParkingIDcounter++;
                            $timeout(function() {
                                $('#ID' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                            }, 500);
                        }
                    });
                }
                if ($scope.activeTabs[1]) {
                    $rootScope.requestedCar = [];
                    $rootScope.loadingScrollBusy = false;
                    var __res = parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', $scope.searchCars, $rootScope.$user.venues);
                    __res.then(() => {
                        if ($rootScope.requestedCar.length > 0) {
                            if ($rootScope.requestedCar[0].status == 'requested') {
                                $scope.firstParkingID = "" + angular.lowercase($rootScope.requestedCar[0].parkingID);
                                $timeout(function() {
                                    $('#IDrequested' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                                }, 500);
                            } else if ($rootScope.requestedCar[0].status == 'accept') {
                                $scope.firstParkingID = "" + angular.lowercase($rootScope.requestedCar[0].parkingID);
                                $timeout(function() {
                                    $('#IDaccept' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                                }, 500);
                            }
                        }
                    });
                }

                if ($scope.activeTabs[2]) {
                    $rootScope.loadingScrollBusy = false;
                    $rootScope.completedCar = [];
                    var __res = parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', $scope.searchCars, $rootScope.$user.venues);
                    __res.then(() => {
                        if ($rootScope.completedCar.length > 0) {
                            $scope.firstParkingID = "" + angular.lowercase($rootScope.completedCar[0].parkingID);
                            // $scope.firstParkingIDcounter++;
                            $timeout(function() {
                                $('#IDrevalidate' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                            }, 500);
                        }
                    });
                }

                // if ($scope.activeTabs[1]) {
                //     if (row.status == 'requested') {
                //         $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                //         // $scope.firstParkingIDcounter++;
                //         $timeout(function() {
                //             $('#IDrequested' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                //         }, 500);
                //     } else if (row.status == 'accept') {
                //         $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                //         // $scope.firstParkingIDcounter++;
                //         $timeout(function() {
                //             $('#IDaccept' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                //         }, 500);
                //     }
                // }

                // if ($scope.activeTabs[2]) {
                //     $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                //     // $scope.firstParkingIDcounter++;
                //     $timeout(function() {
                //         $('#IDrevalidate' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                //     }, 500);
                // }


            }
        } else if (($event && $event.keyCode != 13) && searchCars == '') {
            $scope.searchCars = '';
            _.filter($rootScope.parkedCar, (o) => {
                $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                return o.parkingID;
            });
            _.filter($rootScope.requestedCar, (o) => {
                $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                return o.parkingID;
            });
            _.filter($rootScope.completedCar, (o) => {
                $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                return o.parkingID;
            });
        } else {
            if ($event && $event.keyCode == 13 && searchCars == '')
                $scope.clearFunctionforSearch();
        }
    }

    $scope.search = function(row) {
        // console.log("\n\n\n\n*******************Search Function called*******************\n\n\n\n");
        var query = angular.lowercase($scope.searchCars);
        if ($scope.searchCars == 'specialRequest') {
            if (row.log.length > 1)
                return row.log[1].specialRequest;
        } else {
            if (query && query.indexOf(" ") > 0) {
                query_array = query.split(" ");
                search_result = false;
                for (x in query_array) {
                    query = query_array[x];
                    if (angular.lowercase(row.parkingID).indexOf(query || '') !== -1 || angular.lowercase(row.plateNumber).indexOf(query || '') !== -1 || angular.lowercase(row.brand || '').indexOf(query || '') !== -1) {
                        search_result = true;
                    } else {
                        search_result = false;
                        break;
                    }
                }
                return search_result;
            } else {
                if ((angular.lowercase(row.parkingID).indexOf(query || '') !== -1 || angular.lowercase(row.plateNumber).indexOf(query || '') !== -1 || angular.lowercase(row.brand || '').indexOf(query || '') !== -1)) {
                    if ($scope.firstParkingIDcounter == 0 && query != "" && query != " ") {
                        // console.log("\n*******************First Parking ID***"+$scope.firstParkingID+"****************"+angular.lowercase(row.plateNumber)+"<<>>"+JSON.stringify(row));
                        if ($scope.activeTabs[0]) {
                            if (row.status == 'parked') {
                                $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                                $scope.firstParkingIDcounter++;
                                $timeout(function() {
                                    $('#ID' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                                }, 500);
                                return true;
                            }
                        }
                        if ($scope.activeTabs[1]) {
                            if (row.status == 'requested') {
                                $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                                $scope.firstParkingIDcounter++;
                                $timeout(function() {
                                    $('#IDrequested' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                                }, 500);
                            } else if (row.status == 'accept') {
                                $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                                $scope.firstParkingIDcounter++;
                                $timeout(function() {
                                    $('#IDaccept' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                                }, 500);
                            }
                            return true;
                        }

                        if ($scope.activeTabs[2]) {
                            $scope.firstParkingID = "" + angular.lowercase(row.parkingID);
                            $scope.firstParkingIDcounter++;
                            $timeout(function() {
                                $('#IDrevalidate' + ($scope.firstParkingID).toUpperCase()).css("background-color", "#7ac61c");
                            }, 500);
                            return true;
                        }
                        if ($scope.activeTabs[3]) {
                            return true;
                        }


                    } else
                        return true;
                } else
                    return false;
            }
        }
    }




    function init22222222222() {
        $scope.activeTabs = [false, false, false, false];
        var lastTab = $window.sessionStorage.getItem('activeTab');
        // console.log('Last active tab: ' + lastTab);
        if (lastTab) {
            $scope.activeTabs[lastTab] = true;
        } else {
            $scope.activeTabs[0] = true;
        }

        if ($rootScope.$user && $rootScope.$user.role && $rootScope.$user.role != 'validator' && $rootScope.$user.role!='admin') {
            $rootScope.loadingScrollBusy = false;
            $rootScope.parkedCar = [];
            parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', '', $rootScope.$user.venues).then(() => {
                $rootScope.loadingScrollBusy = false;
                $rootScope.requestedCar = [];
                parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', '', $rootScope.$user.venues).then(() => {
                    $rootScope.loadingScrollBusy = false;
                    $rootScope.completedCar = [];
                    parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', '', $rootScope.$user.venues);
                });
            });
        }
    }
    init22222222222();

    $scope.onSelectTab = function(currentTab) {
        for (var i = 0; i < $scope.activeTabs.length; i++) {
            $scope.activeTabs[i] = false;
            if (i == currentTab) {
                $scope.activeTabs[i] = true;
                if ($scope.searchCars != '') {
                    if (i == 0) {
                        $rootScope.loadingScrollBusy = false;
                        $rootScope.parkedCar = [];
                        parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', $scope.searchCars, $rootScope.$user.venues);
                    }
                    if (i == 1) {
                        $rootScope.loadingScrollBusy = false;
                        $rootScope.requestedCar = [];
                        parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', $scope.searchCars, $rootScope.$user.venues);
                    }
                    if (i == 2) {
                        $rootScope.loadingScrollBusy = false;
                        $rootScope.completedCar = [];
                        parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', $scope.searchCars, $rootScope.$user.venues);
                    }
                }

            }
        }
    }


    $scope.remember = function(tab) {
        $scope.onSelectTab(tab);
        $window.sessionStorage.setItem('activeTab', tab);
    };

    $scope.filterVenueWiseCarDetails = function() {
        // if ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) {
        //     $rootScope.filteredParkedCar = angular.copy(_.filter($rootScope.parkedCar, (p) => { return p.venue.id == $rootScope.selectedOptionsforanAnalysis.venue.id }));
        //     $rootScope.filteredRequestedCar = angular.copy(_.filter($rootScope.requestedCar, (p) => { return p.venue.id == $rootScope.selectedOptionsforanAnalysis.venue.id }));
        //     $rootScope.filteredCompletedCar = angular.copy(_.filter($rootScope.completedCar, (p) => { return p.venue.id == $rootScope.selectedOptionsforanAnalysis.venue.id }));
        // } else {
        $rootScope.filteredParkedCar = angular.copy($rootScope.parkedCar);
        $rootScope.filteredRequestedCar = angular.copy($rootScope.requestedCar);
        $rootScope.filteredCompletedCar = angular.copy($rootScope.completedCar);
        // }
    }

    $scope.toDay = function(dates) {
        var dateText = moment(dates.updatedAt).from(new Date());
        var startOfToday = moment().startOf('day');
        var startOfDate = moment(dates.updatedAt).startOf('day');
        var daysDiff = startOfDate.diff(startOfToday, 'days');
        var days = {
            '0': 'today',
            '-1': 'yesterday',
            '1': 'tomorrow'
        };
        if (Math.abs(daysDiff) <= 1) {
            if (days[daysDiff] == 'today')
                return true;
        }
    };

    $scope.previousDay = function(dates) {
        var dateText = moment(dates.updatedAt).from(new Date());
        var startOfToday = moment().startOf('day');
        var startOfDate = moment(dates.updatedAt).startOf('day');
        var daysDiff = startOfDate.diff(startOfToday, 'days');
        var days = {
            '0': 'today',
            '-1': 'yesterday',
            '1': 'tomorrow'
        };
        if (Math.abs(daysDiff) <= 1) {
            if (days[daysDiff] == 'yesterday')
                return true;
        }
    };

    $scope.search2 = function(row) {
        var query = angular.lowercase($scope.searchCars);
        if (query.indexOf(" ") > 0) {

            query_array = query.split(" ");
            search_result = false;
            for (x in query_array) {
                query = query_array[x];
                if (angular.lowercase(row.parkingID).indexOf(query || '') !== -1 || angular.lowercase(row.plateNumber).indexOf(query || '') !== -1 || angular.lowercase(row.brand || '').indexOf(query || '') !== -1) {
                    search_result = true;
                } else {
                    search_result = false;
                    break;
                }
            }
            return search_result;
        } else {
            return (angular.lowercase(row.parkingID).indexOf(query || '') !== -1 || angular.lowercase(row.plateNumber).indexOf(query || '') !== -1 || angular.lowercase(row.brand || '').indexOf(query || '') !== -1);
        }
    }

    $rootScope.requestedCar = [];
    $rootScope.parkedCar = [];
    $scope.carDetails = {};

    $scope.init = function() {
        // if ($rootScope.$user && $rootScope.$user.venues && $rootScope.$user.venues.length > 0 && $rootScope.$user.role != 'validator' && $rootScope.$user.role != 'accountinguser') {
        // parkingService.getCarDetails($rootScope.$user.venues); //lazy
        // }
        // if ($rootScope.$user && $rootScope.$user.role == 'accountadmin' && $rootScope.$user.role != 'validator' && $rootScope.$user.role != 'accountinguser') {
        //     $http.get($rootScope.ipAddress + '/account/find/' + $rootScope.$user.accountID.id + "?populate=venues").success(function(data) {
        //         if (data.venues.length > 0) {
        //             $rootScope.accountVenuesofAccountAdmin = data.venues;
        //         }
        //     });
        // }

        $rootScope.dailyReports=[];

    }
    $scope.init();


    // do refresh
    $scope.doRefresh = function() {
        // parkingService.getCarDetails($rootScope.$user.venues);//lazy
        // $scope.$broadcast('scroll.refreshComplete');
    };

    $scope.pickImg = function() {
        // $scope.imgUploadDialog = !$scope.imgUploadDialog;
    }

    Array.prototype.insert = function(index, item) {
        this.splice(index, 0, item);
    };

    $scope.listParkedDetails = function(parkedDetails) {
        // console.log("car details" + JSON.stringify(parkedDetails));
        var temp = angular.copy(parkedDetails);
        $rootScope.parkedProfile = [];
        $state.go('app.carFullDetails');
        // if (temp.changeLog && temp.changeLog.length > 0) {
        var sublogs = [];
        insertLogs(0);

        function insertLogs(logs) {
            if (logs < temp.changeLog) {
                if (temp.changeLog[logs].activity == 'parkingID' || temp.changeLog[logs].activity == 'plateNumber' || temp.changeLog[logs].activity == 'parkingZone')
                    sublogs = _.union(sublogs, temp.changeLog[logs].log);
                logs++;
                insertLogs(logs);
            } else {
                temp.log = _.union(temp.log, sublogs);

                if (parkedDetails.validatedBy) {
                    var __temp = {
                        activity: 'validateTicket',
                        loginUser: parkedDetails.validatedBy,
                        at: parkedDetails.validatedAt
                    }
                    temp.log.push(__temp);
                }
                if (parkedDetails.cashAcceptedBy) {
                    var ___temp = {
                        activity: 'cashCollect',
                        loginUser: parkedDetails.cashAcceptedBy,
                        at: parkedDetails.cashAcceptedAt
                    }
                    temp.log.push(___temp);
                }
                $rootScope.parkedProfile = temp;
                // console.log(JSON.stringify($rootScope.parkedProfile.log))
            }
        }
        /* insertLogs(0);

         function insertLogs(logs) {
             if (logs < temp.changeLog.length) {
                 if (temp.changeLog[logs].activity == 'parkingID' || temp.changeLog[logs].activity == 'plateNumber' || temp.changeLog[logs].activity == 'parkingZone')
                     temp.log.push(temp.changeLog[logs]);
                 logs++;
                 insertLogs(logs);
             } else {
                 $rootScope.parkedProfile = temp;
                 // console.log(JSON.stringify($rootScope.parkedProfile.log))
             }
         }*/
        // } else {
        //     $rootScope.parkedProfile = temp;
        // }
    }

    $scope.listRequestDetails = function(requestDetails) {
        var temp = angular.copy(requestDetails)
        $rootScope.parkedProfile = [];
        var t = {};
        if (temp.log.length > 1) {
            if (temp.log[1].specialRequest && temp.log[1].specialRequest.accepted) {
                t = _.clone(temp.log[1].specialRequest);
                // t['at' ] = temp.log[1].dateTime;
                t['activity'] = 'specialRequest';
                t["employeeName"] = temp.log[1].specialRequest.by.employeeName;
                t["at"] = temp.log[1].specialRequest.by.at;
                t["userProfile"] = temp.log[1].specialRequest.by.userProfile;
                t["by"] = temp.log[1].specialRequest.by.by;
                temp.log.push(t);
            }
        }
        // console.log(JSON.stringify(temp))
        if (temp.changeLog && temp.changeLog.length > 0) {
            var sublogs = [];
            insertLogs(0);

            function insertLogs(logs) {
                if (logs < temp.changeLog.length) {
                    if (temp.changeLog[logs].activity == 'parkingID' || temp.changeLog[logs].activity == 'plateNumber' || temp.changeLog[logs].activity == 'parkingZone')
                        sublogs = _.union(sublogs, temp.changeLog[logs].log);
                    logs++;
                    insertLogs(logs);
                } else {
                    temp.log = _.union(temp.log, sublogs)
                    $rootScope.parkedProfile = temp;
                    // console.log(JSON.stringify($rootScope.parkedProfile.log))
                }
            }
        } else {
            $rootScope.parkedProfile = temp;
        }
    }

    $scope.default1 = function($event) {
        $event.preventDefault();
    }

    $scope.enableEditor = true;
    $scope.editButton = function() {
        // $scope.enableEditor = !$scope.enableEditor;
        $scope.markedImageSRC = '';
    }

    $scope.editButton2forSaveMarkImage = function() {
        $rootScope.loadRunner = true;
        $timeout(function() {
            $scope.enableEditor = !$scope.enableEditor;
            $rootScope.loadRunner = false;
        }, 3000);
    }

    $scope.stopEventFunction = function($event) {
        $event.stopPropagation();
    };
    // EDIT Parked Zone
    $scope.tempparkingzone = "";
    $scope.editParkedZone = function(parkedDetails) {
        parkedDetails.orginalParkingzone = parkedDetails.parkingZone;
        parkedDetails.tempparkingzone = parkedDetails.parkingZone;
        // document.getElementById('zoneeditinput').value = '' + parkedDetails.tempparkingzone;
        parkedDetails.editmode = true;
    }

    $scope.updateParkedZone = function(parkedDetails, tempparkingzone) {
        parkedDetails.parkingZone = '' + tempparkingzone;
        parkedDetails.editmode = false;
        if (parkedDetails.orginalParkingzone == parkedDetails.parkingZone) {
            // console.log('no changes');
        } else {
            parkingService.updateParkedZone(parkedDetails);
            // notificationService.successNotify('Parked zone updated for ' + parkedDetails.parkingID.toUpperCase(), 5000);
        }

    }

    $scope.cancelParkedZoneEdit = function(parkedDetails) {
        parkedDetails.editmode = false;
    }

    $scope.selectedDriver = {
        driver: {}
    }

    $scope.acceptCar = function(car, driver) {
        // console.log(JSON.stringify(driver));
        if (driver && Object.keys(driver).length > 0) {
            parkingService.acceptCar(car, driver);
            $('.modal').modal('hide');
            $timeout(() => {
                $scope.searchCars = '';
                $('#searchPlateTicketNumber').focus();
                $('#searchPlateTicketNumber').val('');
                // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
                $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                $scope.close();
            }, 1000);
            audioElement ? audioElement.pause() : null;
        } else {
            alert('Please select driver');
        }
        $scope.toggle = false;
    }

    $scope.readyState = function(car) {
        parkingService.readyState(car, $rootScope.$user);
        $timeout(() => {
            $scope.searchCars = '';
            $('#searchPlateTicketNumber').focus();
            $('#searchPlateTicketNumber').val('');
            // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
            $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
            $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
        }, 1000);
        audioElement ? audioElement.pause() : null;
        $scope.toggle = false;
    }

    $scope.rejectCar = function(car) {
        parkingService.rejectCar(car);
    }

    $scope.missed = false;
    $scope.proofs = [];
    $scope.missedProofs = {
        name: '',
        mobile: '',
        cashierName: '',
        fees: 0
    }
    $rootScope.verified = false;

    $scope.completeCar = function(car, driver, imgDocumnet) {
        if (imgDocumnet && imgDocumnet.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < imgDocumnet.length) {
                    // console.log(imgDocumnet);
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: imgDocumnet[img],
                        params: {
                            filename: imgDocumnet[img].name,
                            file: imgDocumnet[img]
                        }
                    }).success(function(data) {
                        if (!car.documents)
                            car.documents = [];
                        car.documents.push(imgDocumnet[img].name);
                        img++;
                        imageUpload(img);
                    });
                } else
                    userInsert();
            }
        } else
            userInsert();

        function userInsert() {
            if (driver && Object.keys(driver).length > 0) {
                completecarforTemp(driver);
            } else {
                if ($rootScope.$user.role == 'driver') {
                    completecarforTemp($rootScope.$user);
                } else
                    alert('Please select driver');
            }
        }

        function completecarforTemp(driver) {
            if ($scope.missedProofs.cashierName || $scope.missedProofs.fees > 0 || (car.documents && car.documents.length > 0)) {
                $scope.completeCar2(car, driver);
                for (var k = 0; k < $rootScope.filteredParkedCar.length; k++) {
                    if (car.id == $rootScope.filteredParkedCar[k].id) {
                        $rootScope.filteredCompletedCar.push($rootScope.filteredParkedCar[k]);
                        notificationService.successNotify($rootScope.filteredParkedCar[k].plateNumber + '  Car is completed..', 5000);
                        $rootScope.filteredParkedCar.splice(k, 1);
                    }
                }
            } else {
                parkingService.completeCar(car, driver);
                for (var k = 0; k < $rootScope.requestedCar.length; k++) {
                    if (car.id == $rootScope.requestedCar[k].id) {
                        notificationService.successNotify($rootScope.requestedCar[k].plateNumber.toUpperCase() + '  Car is completed..', 5000);
                        $rootScope.requestedCar.splice(k, 1);
                    }
                }
                for (var k = 0; k < $rootScope.filteredParkedCar.length; k++) {
                    if (car.id == $rootScope.filteredParkedCar[k].id) {
                        $rootScope.filteredCompletedCar.push($rootScope.filteredParkedCar[k]);
                        notificationService.successNotify($rootScope.filteredParkedCar[k].plateNumber + '  Car is completed..', 5000);
                        $rootScope.filteredParkedCar.splice(k, 1);
                    }
                }
            }
            $timeout(() => {
                $scope.searchCars = '';
                $('#searchPlateTicketNumber').focus();
                $('#searchPlateTicketNumber').val('');
                // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
                $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                $scope.close();
            }, 1000);
        }
        $('.modal').modal('hide');
    }

    $scope.functionForInit = function() {
        $scope.missed = false;
        $scope.proofs = [];
        $scope.missedProofs = {
            name: '',
            mobile: ''
        }
    }

    $scope.completeCar2 = function(car, driver, imgDocumnet) {
        if (imgDocumnet && imgDocumnet.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < imgDocumnet.length) {
                    // console.log(imgDocumnet);
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: imgDocumnet[img],
                        params: {
                            filename: imgDocumnet[img].name,
                            file: imgDocumnet[img]
                        }
                    }).success(function(data) {
                        if (!car.documents)
                            car.documents = [];
                        car.documents.push(imgDocumnet[img].name);
                        img++;
                        imageUpload(img);
                    });
                } else
                    userInsert();
            }
        } else
            userInsert();

        function userInsert() {
            if (Object.keys(driver).length > 0) {
                parkingService.completeCar2(car, driver, $scope.proofs, $scope.missedProofs);
                for (var k = 0; k < $rootScope.requestedCar.length; k++) {
                    if (car.id == $rootScope.requestedCar[k].id) {
                        notificationService.successNotify($rootScope.requestedCar[k].plateNumber + '  Car is completed..', 5000);
                        $rootScope.requestedCar.splice(k, 1);
                        $scope.completeCarOnlyforDrivers ? $scope.completeCarOnlyforDrivers.hide() : null;
                    }
                }
                for (var k = 0; k < $rootScope.filteredParkedCar.length; k++) {
                    if (car.id == $rootScope.filteredParkedCar[k].id) {
                        $rootScope.filteredCompletedCar.push($rootScope.filteredParkedCar[k]);
                        notificationService.successNotify($rootScope.filteredParkedCar[k].plateNumber + '  Car is completed..', 5000);
                        $rootScope.filteredParkedCar.splice(k, 1);
                    }
                }
                $('.modal').modal('hide');
                $timeout(() => {
                    $scope.searchCars = '';
                    $('#searchPlateTicketNumber').focus();
                    $('#searchPlateTicketNumber').val('');
                    // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
                    $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                    $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                    $scope.close();
                }, 1000);
            } else {
                if ($rootScope.$user.role == 'driver') {
                    parkingService.completeCar2(car, $rootScope.$user, $scope.proofs, $scope.missedProofs);
                    for (var k = 0; k < $rootScope.requestedCar.length; k++) {
                        if (car.id == $rootScope.requestedCar[k].id) {
                            notificationService.successNotify($rootScope.requestedCar[k].plateNumber + '  Car is completed..', 5000);
                            $rootScope.requestedCar.splice(k, 1);
                            $scope.completeCarOnlyforDrivers ? $scope.completeCarOnlyforDrivers.hide() : null;
                        }
                    }
                    for (var k = 0; k < $rootScope.filteredParkedCar.length; k++) {
                        if (car.id == $rootScope.filteredParkedCar[k].id) {
                            $rootScope.filteredCompletedCar.push($rootScope.filteredParkedCar[k]);
                            notificationService.successNotify($rootScope.filteredParkedCar[k].plateNumber + '  Car is completed..', 5000);
                            $rootScope.filteredParkedCar.splice(k, 1);
                        }
                    }
                    $('.modal').modal('hide');
                    $timeout(() => {
                        $scope.searchCars = '';
                        $('#searchPlateTicketNumber').focus();
                        $('#searchPlateTicketNumber').val('');
                        // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
                        $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                        $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                        $scope.close();
                    }, 1000);
                } else
                    alert('Please select driver');
            }
        }
    }

    $scope.holdCar = function(car) {
        parkingService.holdCar(car);
    }

    $scope.requestCarByUser = function(car) {
        $scope.request = {
            ticket: car.parkingID,
            mobile: $rootScope.$user.userName, // mobile 
            plateNumber: car.plateNumber,
            profileImage: $rootScope.$user.profileImage
        };
        loginService.requestCarByUser($scope.request);
        // console.log($scope.searchCars.toUpperCase()+ '----');
        $timeout(() => {
            $scope.searchCars = '';
            $('#searchPlateTicketNumber').focus();
            $('#searchPlateTicketNumber').val('');
            // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
            $("#ID" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
            $scope.close();
        }, 1000);
    }

    $scope.goTodashboard = function(dashboard) {
        $rootScope.goDashBoard = dashboard.selected;
    }

    // io.socket.get('/hello', function serverResponded (body, JWR) {
    //all we're doing now is subscribing to a room
    // console.log(body);
    //  setTimeout(()=>{
    //       alert();
    //     $http.post($rootScope.ipAddress + '/requestcar/testPPP');
    //   }, 5000);
    //   });
    //   io.socket.on('anevent',function(message){
    // console.log('----');
    //   console.log(message);
    //   });

    $scope.cheeeeeeecking = function() {
        $http.post($rootScope.ipAddress + '/requestcar/testPPP');
    }

    $scope.socketInitForParkedCars = function() {
        // alert("function called...")
        io.socket.on('connect', function() {
            console.log('connecting to server');
            // alert("connect.............");
            io.socket.get($rootScope.ipAddress + '/file/upload');
            io.socket.get($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICall');
            io.socket.get($rootScope.ipAddress + '/requestcar/requestCarFromAPICall');
            io.socket.get($rootScope.ipAddress + '/dailytransactional/updateParkedZone');
            io.socket.get($rootScope.ipAddress + '/file/upload2');
            io.socket.get($rootScope.ipAddress + '/account/allowBarCodeAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowCameraAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowCEDAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowMarkImageAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowFingerPrintAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowPushNotificationAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowReadPlateNumberThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowvibrateAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/requestcar/onlineSync');


            io.socket.get($rootScope.ipAddress + '/requestcar/validatedByValidator');
            io.socket.get($rootScope.ipAddress + '/requestcar/validatedByCashier');
            io.socket.get($rootScope.ipAddress + '/requestcar/revalidatedByCashier');
        });
    }

    $scope.socketInitForParkedCars();


    $scope.socketDisconect = function() {
        io.socket.on('disconnect', function() {
            console.log('Lost connection to server');
            // alert("disconnect.............");
            io.socket.get($rootScope.ipAddress + '/file/upload');
            io.socket.get($rootScope.ipAddress + '/dailytransactional/getCarDetailsFromAPICall');
            io.socket.get($rootScope.ipAddress + '/requestcar/requestCarFromAPICall');
            io.socket.get($rootScope.ipAddress + '/dailytransactional/updateParkedZone');
            io.socket.get($rootScope.ipAddress + '/file/upload2');
            io.socket.get($rootScope.ipAddress + '/account/allowBarCodeAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowCameraAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowCEDAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowMarkImageAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowFingerPrintAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowPushNotificationAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowReadPlateNumberThisAccount');
            io.socket.get($rootScope.ipAddress + '/account/allowvibrateAccesstoThisAccount');
            io.socket.get($rootScope.ipAddress + '/requestcar/onlineSync');

            io.socket.get($rootScope.ipAddress + '/requestcar/validatedByValidator');
            io.socket.get($rootScope.ipAddress + '/requestcar/validatedByCashier');
            io.socket.get($rootScope.ipAddress + '/requestcar/revalidatedByCashier');
        });
    }

    $scope.socketDisconect();

    io.socket.on('account', function(obj) {
        if (obj.verb == 'updated') {
            if ($rootScope.$user && $rootScope.$user.accountID) {
                if (obj.data.id == $rootScope.$user.accountID.id) {
                    $rootScope.$user.accountID.barCodeAccess = obj.data.barCodeAccess;
                    $rootScope.$user.accountID.cameraAccess = obj.data.cameraAccess;
                    $rootScope.$user.accountID.fingerPrint = obj.data.fingerPrint;
                    $rootScope.$user.accountID.markImage = obj.data.markImage;
                    $rootScope.$user.accountID.CEDAccess = obj.data.CEDAccess;
                    $rootScope.$user.accountID.pushNotification = obj.data.pushNotification;
                    $rootScope.$user.accountID.readPlateNumber = obj.data.readPlateNumber;
                    $rootScope.$user.accountID.vibrate = obj.data.vibrate;
                    $rootScope.$apply();
                    localStorageService.set("VPSUser", $rootScope.$user);
                    $rootScope.loadRunner = false;
                    // $window.requestedCarDetailsforNotificationWithVibrate($rootScope.$user.accountID.vibrate);
                }
            }
        }
    });

    io.socket.on('mastertransactional', function(obj) {
        if (obj.verb == 'updated') {
            if ($rootScope.$user && $rootScope.$user.accountID) {
                var ___tempCarIndex = _.findIndex($rootScope.completedCar, (c) => {
                    return c.id == obj.data.id
                });
                if (___tempCarIndex > -1) {
                    $rootScope.completedCar[___tempCarIndex] = obj.data;
                    $rootScope.filteredCompletedCar[___tempCarIndex] = obj.data;
                    $scope.filterVenueWiseCarDetails();
                }
            }
        }
    });

    io.socket.on('dailytransactional', function(obj) {
        // alert("socket.....")
        // analyticsInit('count', 'all');
        if (!$rootScope.$user.extraOptions || !$rootScope.$user.extraOptions.carTransaction) {
            if (obj.data)
                obj.data.offlineEdited = 'false';
            if (obj.verb == 'created') {
                if ($rootScope.$user.role == 'manager' || $rootScope.$user.role == 'driver' || $rootScope.$user.role == 'chauffeur' || $rootScope.$user.role == 'admin') {
                    if ($rootScope.$user.userName == obj.data.loginAs) {
                        $state.go("app.carTransaction");
                        notificationService.successNotify('New ' + obj.data.plateNumber.toUpperCase() + ' Car is added..', 5000);
                        $scope.close();
                    } else {
                        for (var k = 0; k < $rootScope.$user.venues.length; k++) {
                            if (obj.data.venue.id == $rootScope.$user.venues[k].id) {
                                notificationService.successNotify('New ' + obj.data.plateNumber.toUpperCase() + ' Car is added..', 5000);
                                obj.data.editmode = false;
                                if ($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined) {
                                    if (obj.data.status == "parked") {
                                        if (_.findIndex($rootScope.parkedCar, { plateNumber: obj.data.plateNumber }) > -1)
                                            $rootScope.parkedCar[_.findIndex($rootScope.parkedCar, { plateNumber: obj.data.plateNumber })] = obj.data;
                                        else
                                            $rootScope.parkedCar.unshift(obj.data);
                                        $scope.filterVenueWiseCarDetails();
                                    } else {
                                        if (_.findIndex($rootScope.requestedCar, { plateNumber: obj.data.plateNumber }) > -1)
                                            $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { plateNumber: obj.data.plateNumber })] = obj.data;
                                        else
                                            $rootScope.requestedCar.unshift(obj.data);
                                        $scope.filterVenueWiseCarDetails();
                                    }
                                }
                                $rootScope.$apply();
                                if (obj.data.status == "parked")
                                    offlineDBService.insertNewCarOfflineforSocket('EvaletzParkedCar', obj.data);
                                else if (obj.data.status == "requested") {
                                    offlineDBService.insertNewCarOfflineforSocket('EvaletzRequestedCar', obj.data);
                                } else if (obj.data.status == "accept")
                                    offlineDBService.insertNewCarOfflineforSocket('EvaletzRequestedCar', obj.data);
                            }
                        }
                    }

                } else {
                    if ($rootScope.$user.userName == obj.data.loginAs) {
                        $state.go("app.carTransaction");
                        notificationService.successNotify('New ' + obj.data.plateNumber.toUpperCase() + ' Car is added..', 5000);
                        $scope.close();
                    } else {
                        if ($rootScope.$user.role == 'accountadmin') {
                            for (var k = 0; k < $rootScope.accountVenuesofAccountAdmin.length; k++) {
                                if (obj.data.venue.id == $rootScope.accountVenuesofAccountAdmin[k].id) {
                                    notificationService.successNotify('New ' + obj.data.plateNumber.toUpperCase() + ' Car is added..', 5000);
                                    obj.data.editmode = false;
                                    if (($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined)) { // && (($rootScope.selectedOptionsforanAnalysis.venue && !$rootScope.selectedOptionsforanAnalysis.venue.id) || ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) == obj.data.venue.id)) {
                                        // if (($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined) || (($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) == obj.data.venue.id)) {
                                        if (obj.data.status == "parked") {
                                            if (_.findIndex($rootScope.parkedCar, { plateNumber: obj.data.plateNumber }) > -1)
                                                $rootScope.parkedCar[_.findIndex($rootScope.parkedCar, { plateNumber: obj.data.plateNumber })] = obj.data;
                                            else
                                                $rootScope.parkedCar.unshift(obj.data);
                                            $scope.filterVenueWiseCarDetails();
                                        } else {
                                            if (_.findIndex($rootScope.requestedCar, { plateNumber: obj.data.plateNumber }) > -1)
                                                $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { plateNumber: obj.data.plateNumber })] = obj.data;
                                            else
                                                $rootScope.requestedCar.unshift(obj.data);
                                            $scope.filterVenueWiseCarDetails();
                                        }
                                    }
                                    if (obj.data.status == "parked")
                                        offlineDBService.insertNewCarOfflineforSocket('EvaletzParkedCar', obj.data);
                                    else if (obj.data.status == "requested")
                                        offlineDBService.insertNewCarOfflineforSocket('EvaletzRequestedCar', obj.data);
                                    else if (obj.data.status == "accept")
                                        offlineDBService.insertNewCarOfflineforSocket('EvaletzRequestedCar', obj.data);
                                }
                            }
                        }
                    }
                }
                obj.verb = '';
            }

            if (obj.verb == 'updated') {
                // alert($rootScope.$user.role + 'updated' + obj.verb + '>>>' + JSON.stringify(obj.data));
                $rootScope.$apply(function() {
                    if (obj.data.status == "accept") {
                        if ($rootScope.$user.role == 'manager' || $rootScope.$user.role == 'driver' || $rootScope.$user.role == 'chauffeur' || $rootScope.$user.role == 'admin') {
                            for (var k = 0; k < $rootScope.$user.venues.length; k++) {
                                if (obj.data.venue.id == $rootScope.$user.venues[k].id) {
                                    notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car is accepted..', 5000);
                                    if ($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined || $scope.searchCars.toLowerCase() == obj.data.plateNumber.toLowerCase() || $scope.searchCars.toLowerCase() == obj.data.parkingID.toLowerCase()) {
                                        for (var i = 0; i < $rootScope.requestedCar.length; i++) {
                                            if ($rootScope.requestedCar[i].plateNumber == obj.data.plateNumber) {
                                                changeingLocalDBCheckCarInfoExists(obj, i);
                                            }
                                        }
                                        if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                            $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { id: obj.data.id })] = obj.data;
                                        else
                                            $rootScope.requestedCar.push(obj.data);
                                        $scope.filterVenueWiseCarDetails();
                                    }
                                }
                            }
                        } else {
                            if ($rootScope.$user.role == 'accountadmin') {
                                for (var k = 0; k < $rootScope.accountVenuesofAccountAdmin.length; k++) {
                                    if (obj.data.venue.id == $rootScope.accountVenuesofAccountAdmin[k].id) {
                                        notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car is accepted..', 5000);
                                        if (($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined || $scope.searchCars.toLowerCase() == obj.data.plateNumber.toLowerCase() || $scope.searchCars.toLowerCase() == obj.data.parkingID.toLowerCase()) && (($rootScope.selectedOptionsforanAnalysis.venue && !$rootScope.selectedOptionsforanAnalysis.venue.id) || ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) == obj.data.venue.id)) {
                                            for (var i = 0; i < $rootScope.requestedCar.length; i++) {
                                                if ($rootScope.requestedCar[i].plateNumber == obj.data.plateNumber) {
                                                    changeingLocalDBCheckCarInfoExists(obj, i);
                                                }
                                            }
                                            if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                                $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { id: obj.data.id })] = obj.data;
                                            else
                                                $rootScope.requestedCar.push(obj.data);
                                            $scope.filterVenueWiseCarDetails();
                                        }
                                    }
                                }
                            }
                        }
                        audioElement ? audioElement.pause() : null;
                    } else if (obj.data.status == "requested") {
                        obj.data.offlineEdited = "false";
                        if ($rootScope.$user.role == 'manager' || $rootScope.$user.role == 'driver' || $rootScope.$user.role == 'chauffeur') {
                            for (var k = 0; k < $rootScope.$user.venues.length; k++) {
                                if (obj.data.venue.id == $rootScope.$user.venues[k].id) {
                                    notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car is requested..', 5000);
                                    if ($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined || $scope.searchCars.toLowerCase() == obj.data.plateNumber.toLowerCase() || $scope.searchCars.toLowerCase() == obj.data.parkingID.toLowerCase()) {
                                        if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                            $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { id: obj.data.id })] = obj.data;
                                        else
                                            $rootScope.requestedCar.push(obj.data);
                                        $rootScope.totalRequestedCar++;
                                        $scope.filterVenueWiseCarDetails();
                                        for (var i = 0; i < $rootScope.parkedCar.length; i++) {
                                            if ($rootScope.parkedCar[i].plateNumber == obj.data.plateNumber) {
                                                changeingLocalDBRequestMove(obj, i);
                                                $rootScope.parkedCar.splice(i, 1);
                                                $rootScope.totalParkedCar -= 1;
                                                $scope.filterVenueWiseCarDetails();
                                            }
                                        }
                                    }
                                    if ($rootScope.$user.accountID) {
                                        // parkingService.getCarDetails($rootScope.$user.venues); //lazy
                                        if ($rootScope.$user.accountID.pushNotification) {
                                            if (!$rootScope.isWebView) {
                                                if (obj.data.log.length > 0) {
                                                    // if (obj.data.log[1].specialRequest)
                                                    //     $window.requestedCarDetailsforNotification(obj.data.parkingID + '(' + obj.data.plateNumber.toUpperCase() + ') is required at ' + moment(obj.data.log[1].specialRequest.dateTime).format('hh:mm A') + '.');
                                                    // else
                                                    //     $window.requestedCarDetailsforNotification(obj.data.parkingID + '(' + obj.data.plateNumber.toUpperCase() + ') is requested.');
                                                }
                                            }
                                        }
                                        parkingService.requestRingToneService(null);
                                    }
                                }

                            }
                        } else if ($rootScope.$user.role == 'accountadmin') {
                            if ($rootScope.$user.role == 'accountadmin') {
                                for (var k = 0; k < $rootScope.accountVenuesofAccountAdmin.length; k++) {
                                    if (obj.data.venue.id == $rootScope.accountVenuesofAccountAdmin[k].id) {
                                        notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car is requested..', 5000);
                                        if (($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined || $scope.searchCars.toLowerCase() == obj.data.plateNumber.toLowerCase() || $scope.searchCars.toLowerCase() == obj.data.parkingID.toLowerCase()) &&
                                            (($rootScope.selectedOptionsforanAnalysis.venue && !$rootScope.selectedOptionsforanAnalysis.venue.id) || ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) == obj.data.venue.id)
                                        ) {
                                            if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                                $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { id: obj.data.id })] = obj.data;
                                            else
                                                $rootScope.requestedCar.push(obj.data);
                                            $rootScope.totalRequestedCar++;
                                            for (var i = 0; i < $rootScope.parkedCar.length; i++) {
                                                if ($rootScope.parkedCar[i].plateNumber == obj.data.plateNumber) {
                                                    changeingLocalDBRequestMove(obj, i);
                                                    $rootScope.parkedCar.splice(i, 1);
                                                    $rootScope.totalParkedCar -= 1;
                                                    $scope.filterVenueWiseCarDetails();
                                                }
                                            }
                                            if ($rootScope.$user.accountID) {
                                                // parkingService.getCarDetails($rootScope.$user.venues); //lazy
                                                if ($rootScope.$user.accountID.pushNotification) {
                                                    if (!$rootScope.isWebView) {
                                                        if (obj.data.log.length > 0) {
                                                            // if (obj.data.log[1].specialRequest)
                                                            //     $window.requestedCarDetailsforNotification(obj.data.parkingID + '(' + obj.data.plateNumber.toUpperCase() + ') is required at ' + moment(obj.data.log[1].specialRequest.dateTime).format('hh:mm A') + '.');
                                                            // else
                                                            //     $window.requestedCarDetailsforNotification(obj.data.parkingID + '(' + obj.data.plateNumber.toUpperCase() + ') is requested.');
                                                        }
                                                    }
                                                }
                                                parkingService.requestRingToneService(null);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                    } else if (obj.data.status == "ready") {
                        if ($rootScope.$user.role == 'manager' || $rootScope.$user.role == 'driver' || $rootScope.$user.role == 'chauffeur' || $rootScope.$user.role == 'admin') {
                            for (var k = 0; k < $rootScope.$user.venues.length; k++) {
                                if (obj.data.venue.id == $rootScope.$user.venues[k].id) {
                                    notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car status has been changed to ready to pickup...', 5000);
                                    if ($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined || $scope.searchCars.toLowerCase() == obj.data.plateNumber.toLowerCase() || $scope.searchCars.toLowerCase() == obj.data.parkingID.toLowerCase()) {
                                        for (var i = 0; i < $rootScope.requestedCar.length; i++) {
                                            if ($rootScope.requestedCar[i].plateNumber == obj.data.plateNumber) {
                                                changeingLocalDBCheckCarInfoExists(obj, i);
                                            }
                                        }
                                        if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                            $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { id: obj.data.id })] = obj.data;
                                        else
                                            $rootScope.requestedCar.push(obj.data);
                                        $scope.filterVenueWiseCarDetails();
                                    }
                                }
                            }
                        } else {
                            if ($rootScope.$user.role == 'accountadmin') {
                                for (var k = 0; k < $rootScope.accountVenuesofAccountAdmin.length; k++) {
                                    if (obj.data.venue.id == $rootScope.accountVenuesofAccountAdmin[k].id) {
                                        notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car status has been changed to ready to pickup...', 5000);
                                        if (($scope.searchCars == '' || $scope.searchCars == null || $scope.searchCars == undefined || $scope.searchCars.toLowerCase() == obj.data.plateNumber.toLowerCase() || $scope.searchCars.toLowerCase() == obj.data.parkingID.toLowerCase()) && (($rootScope.selectedOptionsforanAnalysis.venue && !$rootScope.selectedOptionsforanAnalysis.venue.id) || ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id) == obj.data.venue.id)) {
                                            for (var i = 0; i < $rootScope.requestedCar.length; i++) {
                                                if ($rootScope.requestedCar[i].plateNumber == obj.data.plateNumber) {
                                                    changeingLocalDBCheckCarInfoExists(obj, i);
                                                }
                                            }
                                            if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                                $rootScope.requestedCar[_.findIndex($rootScope.requestedCar, { id: obj.data.id })] = obj.data;
                                            else
                                                $rootScope.requestedCar.push(obj.data);
                                            $scope.filterVenueWiseCarDetails();
                                        }
                                    }
                                }
                            }
                        }
                        audioElement ? audioElement.pause() : null;
                    } 
                    
                    
                    else {
                        if (obj.data.editCar) {
                            if ($rootScope.$user.accountID) {
                                if (obj.data.accountID == $rootScope.$user.accountID.id) {
                                    for (var i = 0; i < $rootScope.parkedCar.length; i++) {
                                        if ($rootScope.parkedCar[i].id == obj.data.id) {
                                            $rootScope.parkedCar[i] = obj.data;
                                            $scope.filterVenueWiseCarDetails();
                                            if ($rootScope.$user.userName == obj.data.loginAs)
                                                $state.go("app.carTransaction");
                                            notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' has been edited successfully..', 5000);
                                            $rootScope.loadRunner = false;
                                            changeingLocalDBCheckCarInfoExists(obj, i);
                                        }
                                    }
                                }
                            }
                        } else {
                            if ($rootScope.$user.accountID) {
                                if (obj.data.accountID == $rootScope.$user.accountID.id) {
                                    for (var i = 0; i < $rootScope.parkedCar.length; i++) {
                                        if ($rootScope.parkedCar[i].id == obj.data.id) {
                                            if ($rootScope.parkedCar[i].parkingZone != obj.data.parkingZone) {
                                                $rootScope.parkedCar[i].parkingZone = obj.data.parkingZone;
                                                $rootScope.parkedCar[i] = obj.data;
                                                $scope.filterVenueWiseCarDetails();
                                                notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' parking zone has been updated..', 5000);
                                            } else if (obj.data.log[0].by != $rootScope.parkedCar[i].log[0].by) {
                                                $rootScope.parkedCar[i].log = obj.data.log;
                                                $rootScope.parkedCar[i] = obj.data;
                                                $scope.filterVenueWiseCarDetails();
                                                notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' driver has been updated..', 5000);
                                            } else {
                                                if ($rootScope.parkedCar[i].offlineEdited) {
                                                    $rootScope.parkedCar[i] = obj.data;
                                                    delete $rootScope.parkedCar[i].offlineEdited;
                                                } else {
                                                    $rootScope.parkedCar[i] = obj.data;
                                                }
                                                $scope.filterVenueWiseCarDetails();
                                                notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' has been updated..', 5000);
                                            }
                                            $rootScope.parkedCar[i].log = obj.data.log;
                                            $rootScope.$apply(function() {});
                                            $rootScope.loadRunner = false;
                                            $scope.filterVenueWiseCarDetails();
                                            changeingLocalDBCheckCarInfoExists(obj, i);
                                        }
                                    }
                                }
                            }
                        }
                    }
                });
                obj.verb = '';
            }

            if (obj.verb == 'reversed' && $rootScope.$user) {
                if ($rootScope.$user.role == 'manager' || $rootScope.$user.role == 'driver' || $rootScope.$user.role == 'chauffeur' || $rootScope.$user.role == 'admin') {
                    for (var k = 0; k < $rootScope.$user.venues.length; k++) {
                        if (obj.data.venue.id == $rootScope.$user.venues[k].id) {
                            notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car is reversed..', 5000);
                            obj.data.editmode = false;
                            if (obj.data.status == "parked") {
                                $rootScope.parkedCar.unshift(obj.data);
                                $rootScope.totalParkedCar += 1;
                                $rootScope.totalRequestedCar -= 1;
                                if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                    $rootScope.requestedCar.splice(_.findIndex($rootScope.requestedCar, { id: obj.data.id }), 1);
                                $scope.filterVenueWiseCarDetails();
                            }
                            $rootScope.$apply();
                        }
                    }
                } else {
                    for (var k = 0; k < $rootScope.accountVenuesofAccountAdmin.length; k++) {
                        if (obj.data.venue.id == $rootScope.accountVenuesofAccountAdmin[k].id) {
                            notificationService.successNotify(obj.data.plateNumber.toUpperCase() + ' Car is reversed..', 5000);
                            obj.data.editmode = false;
                            if (obj.data.status == "parked") {
                                $rootScope.parkedCar.unshift(obj.data);
                                $rootScope.totalParkedCar += 1;
                                $rootScope.totalRequestedCar -= 1;
                                if (_.findIndex($rootScope.requestedCar, { id: obj.data.id }) > -1)
                                    $rootScope.requestedCar.splice(_.findIndex($rootScope.requestedCar, { id: obj.data.id }), 1);
                                $scope.filterVenueWiseCarDetails();
                            }
                            $rootScope.$apply();
                        }
                    }
                }
                obj.verb = '';
            }

            if (obj.verb == 'destroyed') {
                if ($rootScope.$user.role) {
                    //notificationService.successNotify(' Car Is Completed..',5000); obj.data.plateNumber.toUpperCase() 
                    for (var k = 0; k < $rootScope.filteredRequestedCar.length; k++) {
                        if (obj.id == $rootScope.filteredRequestedCar[k].id) {
                            // $rootScope.completedCar.push($rootScope.filteredRequestedCar[k]);
                            $rootScope.filteredRequestedCar.splice(k, 1);
                            // $rootScope.filteredCompletedCar.push($rootScope.requestedCar[k]);
                            getCompletedCarDetails(obj.id)
                            $rootScope.totalRequestedCar -= 1;
                            $scope.filterVenueWiseCarDetails();
                            notificationService.successNotify(' Car is completed..', 5000);
                            $rootScope.$apply(function() {
                                changeingLocalDBDelete(obj, k);
                            });
                        }
                    }
                    for (var k = 0; k < $rootScope.filteredParkedCar.length; k++) {
                        if (obj.id == $rootScope.filteredParkedCar[k].id) {
                            // $rootScope.completedCar.push($rootScope.filteredParkedCar[k]);
                            $rootScope.filteredParkedCar.splice(k, 1);
                            // $rootScope.filteredCompletedCar.push($rootScope.parkedCar[k]);
                            getCompletedCarDetails(obj.id)
                            $rootScope.totalParkedCar -= 1;
                            $rootScope.parkedCar.splice(k, 1);
                            $scope.filterVenueWiseCarDetails();
                            notificationService.successNotify(' Car is completed..', 5000);
                            $rootScope.$apply(function() {
                                changeingLocalDBDelete(obj, k);
                            });
                        }
                    }
                    $rootScope.$apply(function() {
                        // changeingLocalDBDelete(obj, 0);
                    });
                }
                obj.verb = '';
            }
        }
    });

    function getCompletedCarDetails(id) {
        $http.post($rootScope.ipAddress + '/dailytransactional/getCompletedCarDetails', { transactionID: id }).then(function(data) {
            if (data.data && data.data.success) {
                $rootScope.completedCar.push(data.data.success);
                $rootScope.filteredCompletedCar.push(data.data.success);
                $rootScope.totalCompletedCar += 1;
                $scope.filterVenueWiseCarDetails();
            }
        });
    }

    function changeingLocalDBCheckCarInfoExists(obj, index) {
        if (obj.data.status == "parked")
            offlineDBService.checkCarInfoExistsforSocket('EvaletzParkedCar', _.clone(obj.data)); // _.clone($rootScope.parkedCar[index]));
        else {
            offlineDBService.checkCarInfoExistsforSocket('EvaletzRequestedCar', _.clone(obj.data));
            $rootScope.requestedCar.splice(index, 1);
        }
    }

    function changeingLocalDBRequestMove(obj, index) {
        offlineDBService.editCarOffline('EvaletzParkedCar', _.clone($rootScope.parkedCar[index]), 'requested');
    }

    function changeingLocalDBDelete(obj, index) {
        offlineDBService.deleteCarRecord('EvaletzRequestedCar', _.clone(obj));
        $timeout(function() {
            var t = _.findIndex($rootScope.requestedCar, (o) => {
                return o.id == obj.id;
            })
            if (t > -1)
                $rootScope.requestedCar.splice(t, 1);
            $scope.filterVenueWiseCarDetails();
        }, 1000);
    }


    $scope.openPopover = function($event, car) {
        $scope.carData = _.clone(car);
    };

    $scope.currentDate = new Date();

    function populateTicketNumber() {
        /* if ($rootScope.$user.role != 'accountadmin') {

             if ($rootScope.$user.venues.length > 0) {
                 if ($rootScope.$user.venues[0].short) {
                     $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $rootScope.$user.venues[0].id }).then(function(data) {
                         $scope.readedBarCode = $rootScope.$user.venues[0].short + data.data.newTicket;
                     });
                 } else {
                     $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $rootScope.$user.venues[0].id }).then(function(data) {
                         $scope.readedBarCode = data.data.newTicket;
                     });
                 }
             }
         } else {
             $scope.readedBarCode = new IDGenerator().generate();
         } */

        if ($rootScope.$user.role != 'accountadmin') {
            if ($rootScope.$user.venues.length > 0) {
                if ($rootScope.$user.venues[0].automaticTokenGeneration) {
                    if ($rootScope.$user.venues[0].short) {
                        // $scope.readedBarCode = $rootScope.$user.venues[0].short + new IDGenerator().generate();
                        $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $rootScope.$user.venues[0].id }).then(function(data) {
                            $scope.readedBarCode = $rootScope.$user.venues[0].short + data.data.newTicket;
                        });
                    } else {
                        // $scope.readedBarCode = new IDGenerator().generate();
                        $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: $rootScope.$user.venues[0].id }).then(function(data) {
                            $scope.readedBarCode = data.data.newTicket;
                        })
                    }
                } else
                    $scope.readedBarCode = "";
            }
        } else
            $scope.readedBarCode = ""; //+ new IDGenerator().generate();

    }

    $rootScope.SelectedVenueName;
    $scope.reportDetail = {};
    $scope.reportBtn = false;
    $scope.getReport = function(selectedVenue) {
        if ($rootScope.$user.role == 'accountinguser' || $rootScope.$user.role == 'chauffeur')
            selectedVenue = $rootScope.$user.venues[0].id;
        $rootScope.selectedFromDate = $scope.daterange.startDate;
        $rootScope.selectedToDate = $scope.daterange.startDate; // $scope.daterange.endDate;

        $scope.reportDetail.fromDate = new Date($scope.daterange.startDate).getTime();
        $rootScope.selectedFromDate = $rootScope.fromDate;
        $rootScope.selectedToDate = $rootScope.toDate;
        $scope.reportDetail.toDate = new Date($scope.daterange.startDate).getTime()
        $rootScope.venueName = selectedVenue;
        $rootScope.SelectedVenueName = selectedVenue;
        $scope.reportBtn = true;
        parkingService.getReport($scope.reportDetail, selectedVenue);
    }

    $scope.selectedAccountValuesforAdmin = {};

    $scope.getReportforAdmin = function (selected, search, page, selectedParameter) {
        $scope.selectedAccountValuesforAdmin  = selected;
        $scope.getReportforOscarwithPaginationforAdmin(selected, search, page, selectedParameter); 
    }

    $scope.enterKeyFunforAdmin = function(num, q, SelectedVenueName, selectedParameter, $event) {
        if ($event && $event.keyCode == 13) {
            $rootScope.searchQuery = q;
            $scope.currentPage = num;
            $scope.getReportforOscarwithPaginationforAdmin($scope.selectedAccountValuesforAdmin , q, num, selectedParameter);
        }
    }

    $scope.clearSearchedReportforAdmin = function(newPageNumber, q, SelectedVenueName, selectedParameter) {
        $rootScope.searchQuery = '';
        $scope.getReportforOscarwithPaginationforAdmin($scope.selectedAccountValuesforAdmin , $rootScope.searchQuery, newPageNumber, selectedParameter);
    }

    $scope.pageChangeHandlerforAdmin = function(num, q, SelectedVenueName, selectedParameter) {
        $scope.currentPage = num;
        $scope.getReportforOscarwithPaginationforAdmin($scope.selectedAccountValuesforAdmin , $rootScope.searchQuery, num, selectedParameter);
    };

    $scope.getReportforOscarwithPaginationforAdmin = function (selected, search, page, selectedParameter) {
        $rootScope.selectedFromDate = $scope.daterange.startDate;
        $rootScope.selectedToDate = $scope.daterange.startDate //$scope.daterange.endDate;
        $scope.reportDetail.fromDate = new Date($scope.daterange.startDate).getTime();
        $rootScope.selectedFromDate = $rootScope.fromDate;
        $rootScope.selectedToDate = $rootScope.toDate;
        $scope.reportDetail.toDate = new Date($scope.daterange.startDate).getTime()

        $scope.reportBtn = true;
        $rootScope.reportno = "Loading Record...";
        $rootScope.loadRunner = true;
        var filterstarttime = new Date($scope.reportDetail.fromDate) //.getTime();
        var filterendtime = new Date($scope.reportDetail.toDate) //.getTime();
        var venueIDs = $rootScope.$user.venues;
        $rootScope.skip = page ? (page - 1) * 10 : 0;
        var newD = new Date(($scope.reportDetail.toDate) + 86400000).getTime();
        var post = {
            fromDate: moment(filterstarttime).format('YYYY-MM-DD'), //reportDetail.fromDate,
            toDate: moment(filterendtime).format('YYYY-MM-DD'), //newD,
            venueID: (selected.venue && selected.venue.id ? selected.venue.id : 'All'),
            role: 'accountadmin', //$rootScope.$user.role,
            accountID: selected.id,
            skip: page ? (page - 1) * 10 : 0,
            limit: 10,
            search: search
        }
        if (search != '' && search != null) {
            post['query'] = selectedParameter;
        }

        $http.post($rootScope.ipAddress + '/dailytransactional/getReportforOscarwithPagination', post)
            .success(function (data) {
                $rootScope.loadRunner = false;
                $rootScope.reportno = "No Record Found ";
                if (data) {
                    $rootScope.showButton = true;
                    $rootScope.reports = data.data;
                    $rootScope.notOscarVerion = false;
                    $scope.total = data.length;
                    if (data.length == 0 && $rootScope.searchQuery != '') {
                        notificationService.errorNotify('Search keyword ' + $rootScope.searchQuery.toUpperCase() + " is not found ", 5000);
                        $rootScope.searchQuery = '';
                    }
                    $rootScope.reportsWidget = {};
                    $rootScope.reportsWidget['parked'] = data.parked;
                    $rootScope.reportsWidget['requested'] = data.requested;

                    $rootScope.reportsWidget['accept'] = data.accepted;
                    $rootScope.reportsWidget['completed'] = data.complete;

                } else {
                    $rootScope.showButton = false;
                    $rootScope.reportno = "No Record Found ";
                }
            });
    }

    $scope.sendReport = function(emailinfo) {
        // if ($scope.total < 1000) {
        $rootScope.selectedFromDate = $scope.daterange.startDate;
        $rootScope.selectedToDate = $scope.daterange.endDate;
        if ($rootScope.$user.role == 'admin')
            parkingService.sendReport(emailinfo, $rootScope.selectedFromDate, $rootScope.selectedToDate, ($scope.selectedAccountValuesforAdmin.venue && $scope.selectedAccountValuesforAdmin.venue.id ? $scope.selectedAccountValuesforAdmin.venue.id : 'All') , $scope.selectedAccountValuesforAdmin.id );
        else
            parkingService.sendReport(emailinfo, $rootScope.selectedFromDate, $rootScope.selectedToDate, $rootScope.venueName, null);
        $('#openMailModal').modal('hide');
        $scope.userEmail = '';
        // } else
        // alert("Result contains more than 1000 records. Currently we are working on this functionality, please visit after some time.");
    }

    $scope.singleReportDetail = function(reportDetails) {
        $http.get($rootScope.ipAddress + '/mastertransactional/' + reportDetails.id + '?populate=venue').success(function(data) {
                $rootScope.scratchesImages = reportDetails.transactionID;
                var temp = angular.copy(data);
                $rootScope.singleReport = [];
                var t = {};
                if (temp.log.length > 1) {
                    if (temp.log[1].specialRequest && temp.log[1].specialRequest.accepted) {
                        t = _.clone(temp.log[1].specialRequest);
                        // t['at' ] = temp.log[1].dateTime;
                        t['activity'] = 'specialRequest';
                        t["employeeName"] = temp.log[1].specialRequest.by.employeeName;
                        t["at"] = temp.log[1].specialRequest.by.at;
                        t["userProfile"] = temp.log[1].specialRequest.by.userProfile;
                        t["by"] = temp.log[1].specialRequest.by.by;
                        temp.log.push(t);
                    }
                }
                // temp.log[0].at = temp.createdAt;
                if (!temp.changeLog)
                    temp.changeLog = [];
                insertLogs(0);

                function insertLogs(logs) {
                    if (logs < temp.changeLog.length) {
                        if (temp.changeLog[logs].activity == 'parkingID' || temp.changeLog[logs].activity == 'plateNumber' || temp.changeLog[logs].activity == 'parkingZone')
                            temp.log.push(temp.changeLog[logs]);
                        logs++;
                        insertLogs(logs);
                    } else {
                        /*  temp.changeLog = _.sortBy(temp.changeLog, function(o) {
                              return -(new Date(o.at).getTime());
                          });*/
                        if (reportDetails.validatedBy) {
                            var __temp = {
                                activity: 'validateTicket',
                                loginUser: reportDetails.validatedBy,
                                at: reportDetails.validatedAt
                            }
                            temp.log.push(__temp);
                        }
                        if (reportDetails.cashAcceptedBy) {
                            var ___temp = {
                                activity: 'cashCollect',
                                loginUser: reportDetails.cashAcceptedBy,
                                at: reportDetails.cashAcceptedAt
                            }
                            temp.log.push(___temp);
                        }
                        if (temp.revalidatedBy) {
                            var ___temp = {
                                activity: 'revalidate',
                                loginUser: temp.revalidatedBy,
                                at: temp.revalidatedAt
                            }
                            temp.log.push(___temp);
                        }
                        $rootScope.singleReport = temp;
                        // console.log(JSON.stringify($rootScope.singleReport));
                    }
                }
            })
            // $rootScope.singleReport = reportDetails;
            // console.log(JSON.stringify(reportDetails));

        // } else {
        //     $rootScope.singleReport = temp;
        // }
    }

    $scope.clearEmail = function() {
        $scope.userEmail = ''; 
    }

    $scope.from = new Date();
    $scope.to = new Date();

    reportToExcel = [];

    $scope.dateMin =  new Date();
    $scope.dateMax =  new Date();

    $scope.daterange = { x: new Date(), endDate: new Date(), 
        dateMin: new Date(),
        dateMax: new Date(),
        dateLimit: {
            days: 2
        },
        ranges: {
            'Today': [new Date(), new Date()],
        },
        startDate : new Date(),
        endDate : new Date()
    
    };

    $scope.downloadReport = function() {
        // if ($scope.total < 1000) {
        $rootScope.selectedFromDate = $scope.daterange.startDate;
        $rootScope.selectedToDate = $scope.daterange.endDate;
        if ($rootScope.$user.role == 'admin')
            parkingService.downloadReport($rootScope.selectedFromDate, $rootScope.selectedToDate, ($scope.selectedAccountValuesforAdmin.venue && $scope.selectedAccountValuesforAdmin.venue.id ? $scope.selectedAccountValuesforAdmin.venue.id : 'All') , $scope.selectedAccountValuesforAdmin.id );
        else
            parkingService.downloadReport($rootScope.selectedFromDate, $rootScope.selectedToDate, $rootScope.venueName, null);

        // } else
        // alert("Result contains more than 1000 records. Currently we are working on this functionality, please visit after some time.");
    }

    $scope.driverUpdateModalOpen = function(car) {
        $('#driverUpdate').modal('show');
        $scope.carData = car;
        $scope.getVenueDrivers(car.venue.id);
    };

    $scope.updateDriverforPark = function(car, driver) {
        if (Object.keys(driver).length > 0) {
            parkingService.updateDriverforPark(car, driver);
            $('#driverUpdate').modal('hide');
            if (!$rootScope.isOnline)
                findDriverData(0);

            function findDriverData(d) {
                if (d < $rootScope.parkedCar.length) {
                    if (car.id == $rootScope.parkedCar[d].id) {
                        $rootScope.parkedCar[d].log[0]["by"] = driver.id;
                        $rootScope.parkedCar[d].log[0]["employeeName"] = driver.userName;
                        if (driver.profileImage != undefined)
                            $rootScope.parkedCar[d].log[0]["userProfile"] = $rootScope.ipAddress + '/images/' + driver.profileImage; //
                        else
                            $rootScope.parkedCar[d].log[0]["userProfile"] = null;
                        $rootScope.parkedCar[d]['employeeID'] = driver;
                        offlineDBService.editCarOffline('EvaletzParkedCar', _.clone($rootScope.parkedCar[d]), 'generalEdit');
                    } else {
                        d++;
                        findDriverData(d);
                    }
                }
            }
        } else {
            alert('Please select driver');
        }
    };

    $scope.openCompleteModal = function($event, car) {
        $scope.functionForInit();
        $scope.carData = angular.copy(car);
        $scope.defaultSelectedDriver(car);
        $scope.getVenueDrivers(car.venue.id);
        $timeout(() => {
            $('#requestComplete').modal('show');
            $scope.mouseClickEventFiles();
        });

    }


    $scope.openVerifyModal = function(info) {
        // console.log(JSON.stringify(info));
        $('#verifyModal').modal('show');
        info.cashier = false;
        info.billPrint = true;
        $scope.verifyData = info;
        var parkingfee = 0;
        // console.log("_______" + JSON.stringify(info));
        var parkedminutes = moment().diff(moment(info.createdAt), 'minutes');
        var x = moment().diff(moment(info.createdAt), 'milliseconds');
        var d = moment.duration(x, 'milliseconds');
        var hours = Math.floor(d.asHours());
        var mins = Math.floor(d.asMinutes()) - hours * 60;
        hours = hours.toString();
        mins = mins.toString();
        $scope.verifyData.duration = ((hours.length == "1" ? "0" + hours : hours) + ":" + (mins.length == "1" ? "0" + mins : mins));


        info.feeSplitUp = {
            'duration': $scope.verifyData.duration,
            'paymentType': 'cash'
        };

        if (info.venue && info.venue.defaultValues) {
            if (!info.venue.defaultValues.free) {
                if (info.venue.paymentMode) {
                    if (info.venue.paymentMode.name == 'hourly' || info.venue.paymentMode.name == 'day') {

                        let selectedsetup = 0;
                        let remainingparkedminutes = parkedminutes;
                        let dividerminutes = 60;
                        if (remainingparkedminutes > (info.venue.paymentMode.baseHours * 60)) {
                            parkingfee += info.venue.paymentMode.baseAmount;
                            remainingparkedminutes -= (info.venue.paymentMode.baseHours * 60);
                            info.venue.paymentMode.name == 'day' ? dividerminutes = info.venue.paymentMode.baseHours * 60 : dividerminutes = 60;
                            let totalpayableslots = Math.floor(remainingparkedminutes / dividerminutes);
                            parkingfee += totalpayableslots * info.venue.paymentMode.proceedingAmount;
                            remainingparkedminutes -= totalpayableslots * dividerminutes;
                            if (remainingparkedminutes > info.venue.paymentMode.concessionMinutes) {
                                parkingfee += info.venue.paymentMode.proceedingAmount;
                                // console.log("No Concession availed --- Total parking Fee is >>>> " + parkingfee);
                                discountforPaymentMode();
                            } else {
                                // console.log("Concession availed -- Total parking Fee is >>>> " + parkingfee);
                                discountforPaymentMode();
                            }
                        } else {
                            parkingfee += info.venue.paymentMode.baseAmount;
                            // console.log("Base Fare -- Total parking Fee is >>>> " + parkingfee);
                            discountforPaymentMode();
                        }
                    } else if (info.venue.paymentMode.name == 'fixed') {
                        discountforFixed();
                    } else {
                        discountforFixed();
                    }
                } else {
                    discountforFixed();
                }
            }
        } else
            discountforFixed();

        function discountforPaymentMode() {
            info.feeSplitUp['originalFees'] = parkingfee;
            if ($scope.verifyData.venue.VAT) {
                info.feeSplitUp['VAT'] = $scope.verifyData.venue.VAT;

                info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
            }

            $scope.verifyData.withoutVAT = parkingfee;
            $scope.verifyData.fees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
            $scope.verifyData.VATapplied = true;

            if (info.validatedBy) {
                if (info.validatedBy.validationType == 'type1') {
                    $scope.verifyData.fees = 0;
                } else if (info.validatedBy.validationType == 'type2') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    applyFees();
                } else if (info.validatedBy.validationType == 'type3') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (1 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type4') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (2 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type5') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (3 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type6') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (4 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type7') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (5 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type8') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (6 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type9') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (7 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'type10') {
                    parkingfee -= info.venue.paymentMode.baseAmount;
                    parkingfee -= (8 * info.venue.paymentMode.proceedingAmount);
                    applyFees();
                } else if (info.validatedBy.validationType == 'novalidate') {
                    applyFees();
                }
            } else
                applyFees();

            function applyFees() {
                if (info.validatedBy && info.validatedBy.validationType)
                    info.feeSplitUp['type'] = info.validatedBy.validationType
                parkingfee = Math.max(0, parkingfee);
                $scope.verifyData.withoutVAT = parkingfee;
                ///////////////////////////
                if ($scope.verifyData.venue && $scope.verifyData.venue.VATType) {
                    if ($scope.verifyData.venue.VATType == 'inclusive') {
                        var _parkingFee = (parkingfee / (1 + ($scope.verifyData.venue.VAT / 100)));
                        info.feeSplitUp['VATamt'] = (parkingfee - _parkingFee);
                        info.feeSplitUp['actualamt'] = _parkingFee;
                        $scope.verifyData.fees = parkingfee;
                        info.feeSplitUp['modeOfPayment'] = 'inclusive';
                    } else {
                        info.feeSplitUp['actualamt'] = parkingfee;
                        info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
                        $scope.verifyData.fees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
                        info.feeSplitUp['modeOfPayment'] = 'exclusive';
                    }
                } else {
                    info.feeSplitUp['actualamt'] = parkingfee;
                    info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
                    $scope.verifyData.fees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
                    info.feeSplitUp['modeOfPayment'] = 'exclusive';
                }
                //////////////////////////                    
                $scope.verifyData.VATapplied = true;
                info.feeSplitUp['finalFees'] = $scope.verifyData.fees;
            }
        }

        // if (info.venue.paymentMode.name == 'hourly')
        //     parkingfee -= (1 * info.venue.paymentMode.proceedingAmount);
        // else if(info.venue.paymentMode.name == 'day'){
        //     // parkingfee -=  ( 1 *  Math.floor(info.venue.paymentMode.proceedingAmount / info.venue.paymentMode.baseHours));
        // }

        function discountforFixed() {
            if (info.venue.amount) {
                if (info.validatedBy && info.validatedBy.validationType)
                    info.feeSplitUp['type'] = info.validatedBy.validationType
                if ($scope.verifyData.venue.VAT) {
                    info.feeSplitUp['VAT'] = $scope.verifyData.venue.VAT;

                    info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount;
                }

                info.feeSplitUp['originalFees'] = info.venue.amount;
                $scope.verifyData.withoutVAT = info.venue.amount || 0;

                ///////////////////////////
                if ($scope.verifyData.venue && $scope.verifyData.venue.VATType) {
                    if ($scope.verifyData.venue.VATType == 'inclusive') {
                        var _parkingFee = (info.venue.amount / (1 + ($scope.verifyData.venue.VAT / 100)));
                        info.feeSplitUp['VATamt'] = (info.venue.amount - _parkingFee);
                        info.feeSplitUp['actualamt'] = _parkingFee;
                        $scope.verifyData.fees = info.venue.amount;
                        info.feeSplitUp['modeOfPayment'] = 'inclusive';
                    } else {
                        info.feeSplitUp['actualamt'] = $scope.verifyData.venue.amount;
                        info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * info.venue.amount;
                        $scope.verifyData.fees = info.venue.amount + (($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount);
                        info.feeSplitUp['modeOfPayment'] = 'exclusive';
                    }
                } else {
                    info.feeSplitUp['actualamt'] = $scope.verifyData.venue.amount;
                    info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * info.venue.amount;
                    $scope.verifyData.fees = info.venue.amount + (($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount);
                    info.feeSplitUp['modeOfPayment'] = 'exclusive';
                }
                //////////////////////////       

                $scope.verifyData.VATapplied = true;
                info.feeSplitUp['finalFees'] = $scope.verifyData.fees;

                if (info.validatedBy) {
                    if (info.validatedBy.validationType && info.validatedBy.validationType.indexOf('type') > -1) {
                        $scope.verifyData.fees = 0;
                        info.feeSplitUp['finalFees'] = $scope.verifyData.fees;
                    }
                }
            } else {
                $scope.verifyData.fees = 0;
                info.feeSplitUp['finalFees'] = $scope.verifyData.fees;
            }

        }
    }



    $scope.cashierApplyValidation = function(info) {
        var parkingfee = 0;
        var parkedminutes = moment().diff(moment(info.createdAt), 'minutes');
        var x = moment().diff(moment(info.createdAt), 'milliseconds');
        var d = moment.duration(x, 'milliseconds');
        var hours = Math.floor(d.asHours());
        var mins = Math.floor(d.asMinutes()) - hours * 60;
        hours = hours.toString();
        mins = mins.toString();
        $scope.verifyData.duration = ((hours.length == "1" ? "0" + hours : hours) + ":" + (mins.length == "1" ? "0" + mins : mins));

        // info.feeSplitUp = {
        info.feeSplitUp['duration'] = $scope.verifyData.duration;
        // };

        if (info.venue && info.venue.defaultValues) {
            if (!info.venue.defaultValues.free) {
                if (info.venue.paymentMode) {
                    if (info.venue.paymentMode.name == 'hourly' || info.venue.paymentMode.name == 'day') {

                        let selectedsetup = 0;
                        let remainingparkedminutes = parkedminutes;

                        let dividerminutes = 60;
                        if (remainingparkedminutes > (info.venue.paymentMode.baseHours * 60)) {
                            parkingfee += info.venue.paymentMode.baseAmount;
                            remainingparkedminutes -= (info.venue.paymentMode.baseHours * 60);
                            info.venue.paymentMode.name == 'day' ? dividerminutes = info.venue.paymentMode.baseHours * 60 : dividerminutes = 60;
                            let totalpayableslots = Math.floor(remainingparkedminutes / dividerminutes);
                            parkingfee += totalpayableslots * info.venue.paymentMode.proceedingAmount;
                            remainingparkedminutes -= totalpayableslots * dividerminutes;
                            if (remainingparkedminutes > info.venue.paymentMode.concessionMinutes) {
                                parkingfee += info.venue.paymentMode.proceedingAmount;
                                // console.log("No Concession availed --- Total parking Fee is >>>> " + parkingfee);
                                discountforPaymentMode();
                            } else {
                                // console.log("Concession availed -- Total parking Fee is >>>> " + parkingfee);
                                discountforPaymentMode();
                            }
                        } else {
                            parkingfee += info.venue.paymentMode.baseAmount;
                            // console.log("Base Fare -- Total parking Fee is >>>> " + parkingfee);
                            discountforPaymentMode();
                        }
                    } else if (info.venue.paymentMode.name == 'fixed') {
                        discountforFixed();
                    } else {
                        discountforFixed();
                    }
                } else {
                    discountforFixed();
                }
            }
        }

        function discountforPaymentMode() {
            if (info.validationType)
                info.feeSplitUp['type'] = info.validationType
            info.feeSplitUp['originalFees'] = parkingfee;
            if ($scope.verifyData.venue.VAT) {
                info.feeSplitUp['VAT'] = $scope.verifyData.venue.VAT;

                info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
            }
            $scope.verifyData.withoutVAT = parkingfee;
            $scope.verifyData.fees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
            $scope.verifyData.VATapplied = true;

            if (info.validationType == 'type1') {
                parkingfee = 0;
                $scope.verifyData.fees = 0;
            } else if (info.validationType == 'type2') {
                parkingfee -= info.venue.paymentMode.baseAmount
                applyDiscount();
            } else if (info.validationType == 'type3') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (1 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type4') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (2 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type5') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (3 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type6') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (4 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type7') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (5 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type8') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (6 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type9') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (7 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type10') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (8 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'novalidate') {
                applyDiscount();
            } else { ////
                if (info.validatedBy && info.validatedBy.validationType) {
                    var typeValues = 0;
                    if (info.validatedBy.validationType != 'type1') {
                        typeValues = (parseInt(info.validatedBy.validationType.substring(4)) - 2);
                        parkingfee -= info.venue.paymentMode.baseAmount;
                        parkingfee -= (typeValues * info.venue.paymentMode.proceedingAmount);
                    }
                    if (info.validatedBy.validationType == 'type1') {
                        parkingfee = 0;
                        $scope.verifyData.fees = 0;
                    }
                    applyDiscount();
                } else
                    applyDiscount();
            }


            function applyDiscount() {
                if ($scope.verifyData.venue && $scope.verifyData.venue.VAT)
                    info.feeSplitUp['VAT'] = $scope.verifyData.venue.VAT;
                parkingfee = Math.max(0, parkingfee);

                ///////////////////////////
                if ($scope.verifyData.venue && $scope.verifyData.venue.VATType) {
                    if ($scope.verifyData.venue.VATType == 'inclusive') {
                        var _parkingFee = (parkingfee / (1 + ($scope.verifyData.venue.VAT / 100)));
                        info.feeSplitUp['VATamt'] = (parkingfee - _parkingFee);
                        info.feeSplitUp['actualamt'] = _parkingFee;
                        $scope.verifyData.fees = parkingfee;
                        info.feeSplitUp['modeOfPayment'] = 'inclusive';
                    } else {
                        info.feeSplitUp['actualamt'] = parkingfee;
                        info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
                        $scope.verifyData.fees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
                        info.feeSplitUp['modeOfPayment'] = 'exclusive';
                    }
                } else {
                    info.feeSplitUp['actualamt'] = parkingfee;
                    info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
                    $scope.verifyData.fees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
                    info.feeSplitUp['modeOfPayment'] = 'exclusive';
                }
                //////////////////////////  
                $scope.verifyData.VATapplied = true;
                info.feeSplitUp['finalFees'] = $scope.verifyData.fees;
            }
        }

        function discountforFixed() {
            if (info.venue.amount) {
                info.feeSplitUp['originalFees'] = info.venue.amount;
                if ($scope.verifyData.venue.VAT) {
                    info.feeSplitUp['VAT'] = $scope.verifyData.venue.VAT;
                }

                ///////////////////////////
                if ($scope.verifyData.venue && $scope.verifyData.venue.VATType) {
                    if ($scope.verifyData.venue.VATType == 'inclusive') {
                        var _parkingFee = (info.venue.amount / (1 + ($scope.verifyData.venue.VAT / 100)));
                        info.feeSplitUp['VATamt'] = (info.venue.amount - _parkingFee);
                        info.feeSplitUp['actualamt'] = _parkingFee;
                        $scope.verifyData.fees = info.venue.amount;
                        info.feeSplitUp['modeOfPayment'] = 'inclusive';
                    } else {
                        info.feeSplitUp['actualamt'] = $scope.verifyData.venue.amount;
                        info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * info.venue.amount;
                        $scope.verifyData.fees = info.venue.amount + (($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount);
                        info.feeSplitUp['modeOfPayment'] = 'exclusive';
                    }
                } else {
                    info.feeSplitUp['actualamt'] = $scope.verifyData.venue.amount;
                    info.feeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * info.venue.amount;
                    $scope.verifyData.fees = info.venue.amount + (($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount);
                    info.feeSplitUp['modeOfPayment'] = 'exclusive';
                }
                //////////////////////////    


                $scope.verifyData.withoutVAT = info.venue.amount;
                $scope.verifyData.VATapplied = true;

                if (info.validationType && info.validationType.indexOf('type') > -1) {
                    $scope.verifyData.fees = 0;
                    info.feeSplitUp['finalFees'] = $scope.verifyData.fees;
                }
            } else {
                $scope.verifyData.fees = 0;
                info.feeSplitUp['finalFees'] = $scope.verifyData.fees;
            }
        }
    }

    $scope.openRevalidateModal = function(info) {
        if ($scope.checkCompletedHoursLessthanDefinedHour(info)) {
            $('#revalidate').modal('show');
            info.cashier = false;
            info.billPrint = true;
            $scope.verifyData = angular.copy(info);
            var parkingfee = 0;
            // console.log("_______" + JSON.stringify(info));
            var parkedminutes = moment(info.log[1].at).diff(moment(info.createdAt), 'minutes');
            var x = moment(info.log[1].at).diff(moment(info.createdAt), 'milliseconds');
            var d = moment.duration(x, 'milliseconds');
            var hours = Math.floor(d.asHours());
            var mins = Math.floor(d.asMinutes()) - hours * 60;
            hours = hours.toString();
            mins = mins.toString();
            $scope.verifyData.duration = ((hours.length == "1" ? "0" + hours : hours) + ":" + (mins.length == "1" ? "0" + mins : mins));

            $scope.verifyData.newfees = angular.copy($scope.verifyData.fees);
            $http.get($rootScope.ipAddress + '/venue/' + info.venue.id + '?populate=null').success(function(data) {
                $scope.verifyData.venue = data;
            });
        } else {
            alert('Timeout...');
        }
    }

    $scope.cashierApplyRevalidation = function(info) {
        var parkingfee = 0;
        var parkedminutes = moment(info.log[1].at).diff(moment(info.createdAt), 'minutes');
        var x = moment(info.log[1].at).diff(moment(info.createdAt), 'milliseconds');
        var d = moment.duration(x, 'milliseconds');
        var hours = Math.floor(d.asHours());
        var mins = Math.floor(d.asMinutes()) - hours * 60;
        hours = hours.toString();
        mins = mins.toString();
        $scope.verifyData.duration = ((hours.length == "1" ? "0" + hours : hours) + ":" + (mins.length == "1" ? "0" + mins : mins));

        info.newfeeSplitUp = {};
        info.newfeeSplitUp['duration'] = $scope.verifyData.duration


        getVenueFullDetails();


        function getVenueFullDetails() {
            if (info.venue && info.venue.defaultValues) {
                if (!info.venue.defaultValues.free) {
                    if (info.venue.paymentMode) {
                        if (info.venue.paymentMode.name == 'hourly' || info.venue.paymentMode.name == 'day') {

                            let selectedsetup = 0;
                            let remainingparkedminutes = parkedminutes;

                            let dividerminutes = 60;
                            if (remainingparkedminutes > (info.venue.paymentMode.baseHours * 60)) {
                                parkingfee += info.venue.paymentMode.baseAmount;
                                remainingparkedminutes -= (info.venue.paymentMode.baseHours * 60);
                                info.venue.paymentMode.name == 'day' ? dividerminutes = info.venue.paymentMode.baseHours * 60 : dividerminutes = 60;
                                let totalpayableslots = Math.floor(remainingparkedminutes / dividerminutes);
                                parkingfee += totalpayableslots * info.venue.paymentMode.proceedingAmount;
                                remainingparkedminutes -= totalpayableslots * dividerminutes;
                                if (remainingparkedminutes > info.venue.paymentMode.concessionMinutes) {
                                    parkingfee += info.venue.paymentMode.proceedingAmount;
                                    // console.log("No Concession availed --- Total parking Fee is >>>> " + parkingfee);
                                    discountforPaymentMode();
                                } else {
                                    // console.log("Concession availed -- Total parking Fee is >>>> " + parkingfee);
                                    discountforPaymentMode();
                                }
                            } else {
                                parkingfee += info.venue.paymentMode.baseAmount;
                                // console.log("Base Fare -- Total parking Fee is >>>> " + parkingfee);
                                discountforPaymentMode();
                            }
                        } else if (info.venue.paymentMode.name == 'fixed') {
                            discountforFixed();
                        } else {
                            discountforFixed();
                        }
                    } else {
                        discountforFixed();
                    }
                }
            }
        }



        function discountforPaymentMode() {
            if (info.validationType)
                info.newfeeSplitUp['type'] = info.validationType
            info.newfeeSplitUp['originalFees'] = parkingfee;
            if ($scope.verifyData.venue.VAT) {
                info.newfeeSplitUp['VAT'] = $scope.verifyData.venue.VAT;

                info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
            }

            $scope.verifyData.withoutVAT = parkingfee;
            $scope.verifyData.newfees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
            $scope.verifyData.VATapplied = true;

            if (info.validationType == 'type1') {
                parkingfee = 0;
                $scope.verifyData.newfees = 0;
            } else if (info.validationType == 'type2') {
                parkingfee -= info.venue.paymentMode.baseAmount
                applyDiscount();
            } else if (info.validationType == 'type3') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (1 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type4') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (2 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type5') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (3 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type6') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (4 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type7') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (5 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type8') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (6 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type9') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (7 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'type10') {
                parkingfee -= info.venue.paymentMode.baseAmount;
                parkingfee -= (8 * info.venue.paymentMode.proceedingAmount);
                applyDiscount();
            } else if (info.validationType == 'novalidate') {
                applyDiscount();
            } else { ////
                if (info.validatedBy && info.validatedBy.validationType) {
                    var typeValues = 0;
                    if (info.validatedBy.validationType != 'type1') {
                        typeValues = (parseInt(info.validatedBy.validationType.substring(4)) - 2);
                        parkingfee -= info.venue.paymentMode.baseAmount;
                        parkingfee -= (typeValues * info.venue.paymentMode.proceedingAmount);
                    }
                    if (info.validatedBy.validationType == 'type1') {
                        parkingfee = 0;
                        $scope.verifyData.newfees = 0;
                    }
                    applyDiscount();
                } else
                    applyDiscount();
            }


            function applyDiscount() {
                if ($scope.verifyData.venue && $scope.verifyData.venue.VAT)
                    info.newfeeSplitUp['VAT'] = $scope.verifyData.venue.VAT;
                parkingfee = Math.max(0, parkingfee);

                ///////////////////////////
                if ($scope.verifyData.venue && $scope.verifyData.venue.VATType) {
                    if ($scope.verifyData.venue.VATType == 'inclusive') {
                        var _parkingFee = (parkingfee / (1 + ($scope.verifyData.venue.VAT / 100)));
                        info.newfeeSplitUp['VATamt'] = (parkingfee - _parkingFee);
                        info.newfeeSplitUp['actualamt'] = _parkingFee;
                        $scope.verifyData.newfees = parkingfee;
                        info.newfeeSplitUp['modeOfPayment'] = 'inclusive';
                    } else {
                        info.newfeeSplitUp['actualamt'] = parkingfee;
                        info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
                        $scope.verifyData.newfees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
                        info.newfeeSplitUp['modeOfPayment'] = 'exclusive';
                    }
                } else {
                    info.newfeeSplitUp['actualamt'] = parkingfee;
                    info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * parkingfee;
                    $scope.verifyData.newfees = parkingfee + (($scope.verifyData.venue.VAT / 100) * parkingfee);
                    info.newfeeSplitUp['modeOfPayment'] = 'exclusive';
                }
                //////////////////////////  
                $scope.verifyData.VATapplied = true;
                info.newfeeSplitUp['finalFees'] = $scope.verifyData.newfees;
            }
        }

        function discountforFixed() {
            if (info.venue.amount) {
                info.newfeeSplitUp['originalFees'] = info.venue.amount;
                if ($scope.verifyData.venue.VAT) {
                    info.newfeeSplitUp['VAT'] = $scope.verifyData.venue.VAT;

                    info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount;
                }

                ///////////////////////////
                if ($scope.verifyData.venue && $scope.verifyData.venue.VATType) {
                    if ($scope.verifyData.venue.VATType == 'inclusive') {
                        var _parkingFee = ($scope.verifyData.venue.amount / (1 + ($scope.verifyData.venue.VAT / 100)));
                        info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.amount - _parkingFee);
                        info.newfeeSplitUp['actualamt'] = _parkingFee;
                        $scope.verifyData.newfees = $scope.verifyData.venue.amount;
                        info.newfeeSplitUp['modeOfPayment'] = 'inclusive';
                    } else {
                        info.newfeeSplitUp['actualamt'] = $scope.verifyData.venue.amount;
                        info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount;
                        $scope.verifyData.newfees = $scope.verifyData.venue.amount + (($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount);
                        info.newfeeSplitUp['modeOfPayment'] = 'exclusive';
                    }
                } else {
                    info.newfeeSplitUp['actualamt'] = $scope.verifyData.venue.amount;
                    info.newfeeSplitUp['VATamt'] = ($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount;
                    $scope.verifyData.newfees = parkingfee + (($scope.verifyData.venue.VAT / 100) * $scope.verifyData.venue.amount);
                    info.newfeeSplitUp['modeOfPayment'] = 'exclusive';
                }
                //////////////////////////  

                $scope.verifyData.VATapplied = true;
                if (info.validationType && info.validationType.indexOf('type') > -1) {
                    $scope.verifyData.newfees = 0;
                    info.newfeeSplitUp['finalFees'] = $scope.verifyData.newfees;
                }
            } else {
                $scope.verifyData.newfees = 0;
                info.newfeeSplitUp['finalFees'] = $scope.verifyData.newfees;
            }
        }
    }

    $scope.openAcceptModal = function($event, car) {
        $('#acceptModal').modal('show');
        $scope.mouseClickEventFiles();
        $scope.functionForInit();
        $scope.carData = car;
        $scope.defaultSelectedDriver(car);
        $scope.getVenueDrivers(car.venue.id);
    };
    $scope.opencompleteModal = function($event, car) {
        $('#completeModal').modal('show');
        $scope.functionForInit();
        $scope.mouseClickEventFiles();
        $scope.carData = car;
        $scope.defaultSelectedDriver(car);
        $scope.getVenueDrivers(car.venue.id);
    };
    $scope.item = [];
    $scope.numberToDisplay = 9;

    $scope.loadingScrollBusy = false;
    $scope.loadParkedCar = function(parkedCar) {
        if ($scope.activeTabs[0] && parkedCar && $scope.numberToDisplay != parkedCar.length) {
            $scope.loadingScrollBusy = true;
            $timeout(() => {
                if (parkedCar) {
                    if ($scope.numberToDisplay + 9 < parkedCar.length)
                        $scope.numberToDisplay += 9;
                    else
                        $scope.numberToDisplay = parkedCar.length;
                    $scope.loadingScrollBusy = false;
                } else
                    $scope.loadingScrollBusy = false;
            }, 1000);
        } else
            $scope.loadingScrollBusy = false;

    }
    $scope.numberToDisplayRequestedCar = 9;
    $scope.loadRequestedCar = function(requeatedCar) {
        if ($scope.activeTabs[1] && requeatedCar && $scope.numberToDisplayRequestedCar != requeatedCar.length) {
            // console.log('2-----------');
            $scope.loadingScrollBusy = true;
            $timeout(() => {
                if (requeatedCar) {
                    if ($scope.numberToDisplayRequestedCar + 9 < requeatedCar.length)
                        $scope.numberToDisplayRequestedCar += 9;
                    else
                        $scope.numberToDisplayRequestedCar = requeatedCar.length;
                    $scope.loadingScrollBusy = false;
                } else
                    $scope.loadingScrollBusy = false;
            }, 1000);
        } else
            $scope.loadingScrollBusy = false;
    }

    $scope.numberToDisplayTodayCompleteCar = 9;
    $scope.loadTodayCompleteCar = function(todayComplete) {
        if ($scope.activeTabs[2] && todayComplete && $scope.numberToDisplayTodayCompleteCar != todayComplete.length) {
            $scope.loadingScrollBusy = true;
            $timeout(() => {
                if (todayComplete) {
                    if ($scope.numberToDisplayTodayCompleteCar + 9 < todayComplete.length)
                        $scope.numberToDisplayTodayCompleteCar += 9;
                    else
                        $scope.numberToDisplayTodayCompleteCar = todayComplete.length;
                    $scope.loadingScrollBusy = false;
                } else
                    $scope.loadingScrollBusy = false;
            }, 1000);
        } else
            $scope.loadingScrollBusy = false;

    }

    /* Load more from server  */
    $scope.loadMoreCar = function(carCount, carStatus, search) {
        // console.log($scope.searchCars + "<<>>>>>>>>>>>>>>>>>>>>" + search);
        if (carStatus == "parked" && $scope.activeTabs[0]) {
            if ($rootScope.totalParkedCar != carCount && $scope.searchCars.length == 0)
                parkingService.loadMoreCar(carCount, carStatus, '', $rootScope.$user.venues);
            else if ($scope.searchCars.length > 0 && $rootScope.totalParkedCar > carCount)
                parkingService.loadMoreCar(carCount, carStatus, $scope.searchCars, $rootScope.$user.venues);
        } else if (carStatus == "requested" && $scope.activeTabs[1]) {
            if ($rootScope.totalRequestedCar != carCount && $scope.searchCars.length == 0)
                parkingService.loadMoreCar(carCount, carStatus, '', $rootScope.$user.venues);
            else if ($scope.searchCars.length > 0 && $rootScope.totalRequestedCar > carCount)
                parkingService.loadMoreCar(carCount, carStatus, $scope.searchCars, $rootScope.$user.venues);
        } else if (carStatus == "complete" && $scope.activeTabs[2]) {
            if ($rootScope.totalCompletedCar != carCount && $scope.searchCars.length == 0)
                parkingService.loadMoreCar(carCount, carStatus, '', $rootScope.$user.venues);
            else if ($scope.searchCars.length > 0 && $rootScope.totalCompletedCar > carCount)
                parkingService.loadMoreCar(carCount, carStatus, $scope.searchCars, $rootScope.$user.venues);
        }
    }



    $scope.showActionsheetforDriverOnly = function(carData) {
        // console.log(JSON.stringify(carData))
        $scope.carData = _.clone(carData);
        if (carData.log[carData.log.length - 1].activity == 'requested') {
            if (carData.log[carData.log.length - 1].specialRequest && !carData.log[carData.log.length - 1].specialRequest.accepted)
                $scope.remindLaterRequestAccepted(carData, $rootScope.$user);
            else
                $scope.acceptCar(carData, $rootScope.$user);
        } else if (carData.log[carData.log.length - 1].activity == 'accept') {
            $('#acceptCompleteModal').modal('show');
            $scope.functionForInit();
            $scope.defaultSelectedDriver($scope.carData);
            $scope.getVenueDrivers($scope.carData.venue.id);
            // $scope.completeCar(carData, $rootScope.$user);
        }
    };

    $scope.openEmailModal = function($event) {
        $scope.modal.show($event);
    };
    $scope.defaultSelectedDriver = function(car) {
        // $rootScope.loadRunner = true;
        if (car.log.length > 0) {
            if (car.log[car.log.length - 1].by != 'Unassigned' || car.log[car.log.length - 1].by != '' || car.log[car.log.length - 1].by != null) {
                if (car.log[car.log.length - 1].activity == "requested") {
                    $scope.selectedDriver.driver = {};
                    if (car.venue && car.venue.defaultValues && car.venue.defaultValues.driver)
                        $scope.selectedDriver.driver = car.venue.defaultValues.driver;
                    $rootScope.loadRunner = false;
                } else {
                    $http.get($rootScope.ipAddress + '/user/' + car.log[car.log.length - 1].by + '?populate=null').success(function(data) {
                        /* delete data.master;
                         delete data.daily;
                         delete data.venues;
                         delete data.accountID;*/

                        $scope.selectedDriver.driver = data;
                        // alert($scope.selectedDriver.driver);
                        $rootScope.loadRunner = false;
                    }).error(function(err) {
                        $rootScope.loadRunner = false;
                        if (!$rootScope.isOnline) {
                            offlineLoginService.gettingAccountDriversOnly(function(drivers) {
                                // console.log(JSON.stringify(drivers))
                                var selectedVenueDD = _.filter(drivers, function(driver) {
                                    if (car.log.length > 0) {
                                        if (car.log[0].by != 'Unassigned' || car.log[0].by != '' || car.log[0].by != null) {
                                            return driver.id == car.log[0].by;
                                        } else {
                                            return driver.id == car.log[car.log.length - 1].by;
                                        }
                                    }
                                })[0];
                                // console.log(JSON.stringify(selectedVenueDD))
                                $scope.selectedDriver.driver = selectedVenueDD;
                            });
                        } else {
                            $scope.selectedDriver.driver = {};
                            if (car.status != 'parked') {
                                if (car.log.length > 0) {
                                    if (car.log[0].by != 'Unassigned' || car.log[0].by != '' || car.log[0].by != null) {
                                        var selectedVenueDD = _.filter($rootScope.accountDrivers, function(driver) {
                                            return driver.id == car.log[0].by;
                                        })[0];
                                        $scope.selectedDriver.driver = selectedVenueDD;
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                $scope.selectedDriver.driver = {};
                if (car.status != 'parked') {
                    if (car.log.length > 0) {
                        if (car.log[0].by != 'Unassigned' || car.log[0].by != '' || car.log[0].by != null) {
                            var selectedVenueDD = _.filter($rootScope.accountDrivers, function(driver) {
                                return driver.id == car.log[0].by;
                            })[0];
                            $scope.selectedDriver.driver = selectedVenueDD;
                        }
                    }
                }
            }
        }
    }

    $scope.getVenueDrivers = function(selectedVenue) {
        // $http.get($rootScope.ipAddress + '/venue/' + selectedVenue + '?populate=users')
        $http.post($rootScope.ipAddress + '/dailytransactional/getVenuewithFilteredDrivers', { 'venueID': selectedVenue })
            .success(function(data) {
                $rootScope.accountDrivers = [];
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

    $scope.openModal = function($event, car) {
        $scope.functionForInit();
        if (car.venue) {
            if (car.venue.defaultValues && car.venue.defaultValues.free)
                car.free = car.venue.defaultValues.free
        }
        $scope.carData = car;
        $scope.defaultSelectedDriver(car);
        $scope.getVenueDrivers(car.venue.id);
        $('#acceptCompleteModal').modal('show');

    };

    $('img#example').selectAreas();

    $scope.markImageHadTaken = false;
    $scope.resetMarkImageWithTimeDelay = function() {
        $timeout(function() {
            $('img#example').selectAreas();
        }, 1000);
    }

    $scope.resetMarkedImage = function() {
        marked = false;
        $('img#example').selectAreas('reset');
        $timeout(function() {
            // output()
            $('img#example').selectAreas();
        }, 500);
        $scope.markedImageSRC = '';
    }

    $scope.divClickedByUserData = false;
    $scope.divClickedByUser = function() {
        $scope.divClickedByUserData = true;
    }
    $scope.markShowww = function() {
        $('img#example').selectAreas();
        $scope.markedImageSRC = '';
        $scope.divClickedByUserData = !$scope.divClickedByUserData;
        $timeout(function() {
            $('img#example').selectAreas('reset');
        }, 500);

    }

    $scope.dBlob;
    $scope.saveImageForMarkImages = function() {
        // $scope.modal.hide();
        html2canvas(document.getElementById('screenShotImage'), {
            onrendered: function(canvas) {
                // document.body.appendChild(canvas);

                function b64toBlob(b64Data, contentType, sliceSize) {
                    contentType = contentType || '';
                    sliceSize = sliceSize || 512;

                    var byteCharacters = atob(b64Data);
                    var byteArrays = [];

                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        var slice = byteCharacters.slice(offset, offset + sliceSize);

                        var byteNumbers = new Array(slice.length);
                        for (var i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }

                        var byteArray = new Uint8Array(byteNumbers);

                        byteArrays.push(byteArray);
                    }

                    var blob = new Blob(byteArrays, { type: contentType });
                    return blob;
                }
                var a = document.createElement("a");
                a.download = "chart.png";
                a.href = canvas.toDataURL("image/png");
                var contentType = 'image/png';
                var b64Data = a.href.split(',')[1];

                var blob = b64toBlob(b64Data, contentType);
                $scope.dBlob = blob;
                var blobUrl = URL.createObjectURL(blob);

                var img = document.createElement('img');
                img.src = blobUrl;
                /* if($scope.markImageHadTaken){
                    $scope.snapImage.pop();
                    $scope.snapImage.push(blobUrl);
                 }else{
                    $scope.snapImage.push(blobUrl);
                 }*/
                // console.log("============"+blobUrl);
                $scope.markedImageSRC = blobUrl;
                $scope.bb = b64Data;
                // alert(blob)
                $scope.markImageHadTaken = true;
                marked = false;
                $(".showHideForAddCarLoader").hide();
                // $scope.resetMarkedImage();
                // $scope.modal.hide();

                $timeout(function() {
                    $scope.enableEditor = !$scope.enableEditor;
                });

            }
        });
        marked = false;
        $('img#example').selectAreas('reset');
        $timeout(function() {
            // output()
            $('img#example').selectAreas();
        }, 500);
    };
    $scope.saveImageForMarkImages2 = function() {
        // $scope.modal.hide();
        html2canvas(document.getElementById('screenShotImage2'), {
            onrendered: function(canvas) {
                var a = document.createElement("a");
                a.download = "chart.png";
                a.href = canvas.toDataURL("image/png");

                function b64toBlob(b64Data, contentType, sliceSize) {
                    contentType = contentType || '';
                    sliceSize = sliceSize || 512;

                    var byteCharacters = atob(b64Data);
                    var byteArrays = [];

                    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
                        var slice = byteCharacters.slice(offset, offset + sliceSize);

                        var byteNumbers = new Array(slice.length);
                        for (var i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }

                        var byteArray = new Uint8Array(byteNumbers);

                        byteArrays.push(byteArray);
                    }

                    var blob = new Blob(byteArrays, { type: contentType });
                    return blob;
                }

                var contentType = 'image/png';
                var b64Data = a.href.split(',')[1];

                var blob = b64toBlob(b64Data, contentType);
                $scope.dBlob = blob;
                var blobUrl = URL.createObjectURL(blob);

                var img = document.createElement('img');
                img.src = blobUrl;
                /* if($scope.markImageHadTaken){
                    $scope.snapImage.pop();
                    $scope.snapImage.push(blobUrl);
                 }else{
                    $scope.snapImage.push(blobUrl);
                 }*/
                // console.log("============"+blobUrl);
                $scope.markedImageSRC = blobUrl;
                $scope.bb = b64Data;
                // alert(blob)
                $scope.markImageHadTaken = true;
                // $scope.modal.hide();
                $rootScope.loadRunner = true;
                $timeout(function() {
                    $scope.enableEditor = !$scope.enableEditor;
                    $rootScope.loadRunner = false;
                    $(".showHideForAddCarLoader").hide();
                    marked = false;
                    $timeout(function() {
                        $window.uploadPhoto();
                    }, 1000);
                }, 1500);


            }
        });
    };
    $scope.readedBarCode;
    $scope.errorDataFound = false;
    $scope.searchParkingIdExists = function(data) {
        // $rootScope.loadRunner = true;
        $scope.errorDataFound = false;
        angular.forEach($http.pendingRequests, function(request) {
            if (request.cancel && request.timeout) {
                request.cancel.resolve();
            }
        });
        if (data != undefined && data != null && data != '' && data != NaN) {
            return $http.post($rootScope.ipAddress + "/account/EvaletzCardExistsInDaily", { parkingID: data, }).then(function(res) {
                $timeout(function() {
                    $rootScope.loadRunner = false;
                    // console.log(res.data + scope.customerInfo)
                    $scope.errorDataFound = res.data;
                    // console.log(res.data);
                    if ($scope.errorDataFound) {
                        // alert("Sorry, " + data + " is used for another car. Please use different EValetz card.");
                        $timeout(function() {
                            $rootScope.loadRunner = false;
                            // $scope.readedBarCode = "";
                            // populateTicketNumber();
                            // document.getElementById("parkingID").value = '';
                        }, 500);
                    }
                }, 500);
            });
        } else {
            $rootScope.loadRunner = false;
            $scope.errorDataFound = false;
        }
    };
    $scope.searchParkingIdExistsforEdirMode = function(data) {
        // $rootScope.loadRunner = true;
        $scope.errorDataFound = false;
        angular.forEach($http.pendingRequests, function(request) {
            if (request.cancel && request.timeout) {
                request.cancel.resolve();
            }
        });
        // console.log($scope.originalParkingID + "---------" + data)
        if ($scope.originalParkingID != data) {
            if (data != undefined && data != null && data != '' && data != NaN) {
                return $http.post($rootScope.ipAddress + "/account/EvaletzCardExistsInDaily", { parkingID: data, }).then(function(res) {
                    $timeout(function() {
                        $rootScope.loadRunner = false;
                        // console.log(res.data + scope.customerInfo)
                        $scope.errorDataFound = res.data;
                        // console.log(res.data);
                        if ($scope.errorDataFound) {
                            // alert("Sorry, " + data + " is used for another car. Please use different EValetz card.");
                            $timeout(function() {
                                $rootScope.loadRunner = false;
                                // $scope.readedBarCode = "";
                                // populateTicketNumber();
                                // document.getElementById("parkingID").value = '';
                            }, 500);
                        }
                    }, 500);
                });
            } else {
                $rootScope.loadRunner = false;
                $scope.errorDataFound = false;
            }
        }

    };
    $scope.plateNumberTherer;
    $scope.errorDataFound2 = false;
    $scope.searchPlateNumberExists = function(data) {
        $scope.errorDataFound2 = false;
        angular.forEach($http.pendingRequests, function(request) {
            if (request.cancel && request.timeout) {
                request.cancel.resolve();
            }
        });
        if (data != undefined && data != null && data != '' && data != NaN) {
            if ($rootScope.$user.accountID.timeZone == 'Asia/Dubai') {
                data = document.getElementById('emirates').value + document.getElementById('alphaCode').value + document.getElementById('plateNumber').value
            }
            return $http.post($rootScope.ipAddress + "/account/plateNumberExistsInDaily", { plateNumber: data, }).then(function(res) {
                $timeout(function() {
                    $rootScope.loadRunner = false;
                    // console.log(res.data + scope.customerInfo)
                    $scope.errorDataFound2 = res.data;
                    // console.log(res.data);
                    if ($scope.errorDataFound2) {
                        // alert("Sorry, " + data + " is used for another car. Please use different EValetz card.");
                        $timeout(function() {
                            $rootScope.loadRunner = false;
                            // populateTicketNumber();
                            // document.getElementById("parkingID").value = '';
                        }, 500);
                    }
                }, 500);
            });
        } else {
            $rootScope.loadRunner = false;
            $scope.errorDataFound2 = false;
        }
    };


    $scope.initalizeFunctionforBarreadbleCode = function() {
        $scope.errorDataFound = false;
        $scope.errorDataFound2 = false;
        // $scope.readedBarCode = "OS";
        $scope.markedImageSRC = '';
        $scope.bb = '';
        $scope.snapImage = [];
        $scope.markImageHadTaken = false;
        marked = false;
        $scope.dBlob = undefined;
        $scope.selectedBrandTemp = {};
        uploadedScratchesImages = [];
        $rootScope.selectedDriverTemp = {};
        $scope.isGroupShown = false;
        $rootScope.parkingZone = '';
        $rootScope.customerType = '';
        $scope.resetMarkImageWithTimeDelay();

        var newZones = [];
        var parkingslotcounter = 0;
        $timeout(() => {
            $('#parkingID').focus();
            if ($state.current.name == 'app.addCar')
                populateTicketNumber();
            if ($rootScope.$user.venues.length == 1) { // for chaffeur and drivers 
                if ($rootScope.$user.venues[0].defaultValues) {
                    if ($rootScope.$user.venues[0].defaultValues.customerType)
                        $rootScope.customerType = $rootScope.$user.venues[0].defaultValues.customerType;
                    if ($rootScope.$user.venues[0].defaultValues.driver) {
                        $rootScope.selectedDriverTemp = $rootScope.$user.venues[0].defaultValues.driver;
                    }
                }

                if ($rootScope.$user.venues[0].settings) {
                    $rootScope.selectedVenueSettings = $rootScope.$user.venues[0].settings;
                } else
                    $rootScope.selectedVenueSettings = {};

                if ($rootScope.$user.venues[0].parkingZones && $rootScope.$user.venues[0].parkingZones.length > 0)
                    parkingZonePopulating(0);
                else
                    $rootScope.parkingZones = ($rootScope.$user.venues[0].parkingZones ? $rootScope.$user.venues[0].parkingZones : []);

                function parkingZonePopulating(zone) {
                    parkingslotcounter = 0;
                    if (zone < $rootScope.$user.venues[0].parkingZones.length) {
                        if ($rootScope.$user.venues[0].parkingZones[zone].noofPatkingSlots) {
                            if ($rootScope.$user.venues[0].parkingZones[zone].startsfrom) {
                                printSlots($rootScope.$user.venues[0].parkingZones[zone].startsfrom);
                            } else
                                printSlots(0);

                            function printSlots(pzonessss) {
                                if (parkingslotcounter < $rootScope.$user.venues[0].parkingZones[zone].noofPatkingSlots) {
                                    newZones.push({ name: pzonessss + " " + $rootScope.$user.venues[0].parkingZones[zone].name });
                                    parkingslotcounter++;
                                    pzonessss++;
                                    printSlots(pzonessss);
                                } else {
                                    zone++;
                                    parkingZonePopulating(zone);
                                }
                            }
                        } else {
                            if ($rootScope.$user.venues[0].parkingZones[zone] && $rootScope.$user.venues[0].parkingZones[zone].name)
                                newZones.push({ name: $rootScope.$user.venues[0].parkingZones[zone].name });
                            zone++;
                            parkingZonePopulating(zone);
                        }
                    } else {
                        // console.log(JSON.stringify(newZones))
                        $rootScope.parkingZones = newZones;
                        // populateTicketNumber();
                        // alert();
                    }
                }
            }
        }, 500)

    };


    $scope.editCar = function(car) {
        // console.log(JSON.stringify(car));
        $scope.editedCarDetails = car;
        $scope.orginalCarDetailsBeforeEdit = _.clone(car);
        $scope.originalParkingID = $scope.editedCarDetails.parkingID;
        $scope.carData = car;
        if ($scope.carData.scratchesSnap == null || $scope.carData.scratchesSnap == '') {
            $scope.carData.scratchesSnap = [];
        }

        var newZones = [],
            parkingslotcounter = 0;

        if (($rootScope.$user.role == 'accountadmin' || $rootScope.$user.role == 'manager') && $scope.editedCarDetails.venue && $scope.editedCarDetails.venue.parkingZones) {
            if ($scope.editedCarDetails.venue.parkingZones.length > 0)
                parkingZonePopulating(0);
            else
                $rootScope.parkingZones = ($scope.editedCarDetails.venue.parkingZones ? $scope.editedCarDetails.venue.parkingZones : []);

            function parkingZonePopulating(zone) {
                parkingslotcounter = 0;
                if (zone < $scope.editedCarDetails.venue.parkingZones.length) {
                    if ($scope.editedCarDetails.venue.parkingZones[zone].noofPatkingSlots) {
                        if ($scope.editedCarDetails.venue.parkingZones[zone].startsfrom) {
                            printSlots($scope.editedCarDetails.venue.parkingZones[zone].startsfrom);
                        } else
                            printSlots(0);

                        function printSlots(pzonessss) {
                            if (parkingslotcounter < $scope.editedCarDetails.venue.parkingZones[zone].noofPatkingSlots) {
                                newZones.push({ name: pzonessss + " " + $scope.editedCarDetails.venue.parkingZones[zone].name });
                                parkingslotcounter++;
                                pzonessss++;
                                printSlots(pzonessss);
                            } else {
                                zone++;
                                parkingZonePopulating(zone);
                            }
                        }
                    } else {
                        if ($scope.editedCarDetails.venue.parkingZones[zone] && $scope.editedCarDetails.venue.parkingZones[zone].name)
                            newZones.push({ name: $scope.editedCarDetails.venue.parkingZones[zone].name });
                        zone++;
                        parkingZonePopulating(zone);
                    }
                } else {
                    $rootScope.parkingZones = newZones;
                }
            }
        }

        $state.go('app.editCar');
        $timeout(() => {
            $scope.resetMarkImageWithTimeDelay();
            $('#parkingID').focus();
        }, 500)
        if (car.venue) {
            if (car.venue.defaultValues && car.venue.defaultValues.free)
                $scope.editedCarDetails.free = car.venue.defaultValues.free
        }

        $rootScope.selectedVenueDetails = car.venue;
        $scope.defaultSelectedDriver2(car);
        $scope.divClickedByUserData = false;
    };
    $scope.defaultSelectedDriver2 = function(car) {
        $rootScope.loadRunner = true;
        if (car.log[0]) {
            if (car.log[0].by != 'Unassigned') {
                if (car.log[0].activity == "requested") {
                    $scope.selectedDriver2 = {};
                    if (car.venue && car.venue.defaultValues && car.venue.defaultValues.driver)
                        $scope.selectedDriver2 = car.venue.defaultValues.driver;
                    $rootScope.loadRunner = false;
                } else {
                    $http.get($rootScope.ipAddress + '/user/' + car.log[0].by + '?populate=null').success(function(data) {
                        $scope.selectedDriver2 = {};
                        $scope.selectedDriver2 = data;
                        $rootScope.loadRunner = false;
                    }).error(function(err) {
                        $rootScope.loadRunner = false;
                        if (!$rootScope.isOnline) {
                            offlineLoginService.gettingAccountDriversOnly(function(drivers) {
                                /* var selectedVenueDD = _.filter(drivers, function(driver) {
                                     return driver.id == car.log[0].by;
                                 })[0];
                                 $scope.selectedDriver2 = selectedVenueDD;*/

                                var selectedVenueDD = _.filter(drivers, function(driver) {
                                    if (car.log.length > 0) {
                                        if (car.log[0].by != 'Unassigned' || car.log[0].by != '' || car.log[0].by != null) {
                                            return driver.id == car.log[0].by;
                                        } else {
                                            return driver.id == car.log[car.log.length - 1].by;
                                        }
                                    }
                                })[0];
                                // console.log(JSON.stringify(selectedVenueDD))
                                $scope.selectedDriver2 = selectedVenueDD;

                            });
                        } else {
                            $scope.selectedDriver2 = {};
                            if (car.status != 'parked') {
                                if (car.log.length > 0) {
                                    if (car.log[0].by != 'Unassigned' || car.log[0].by != '' || car.log[0].by != null) {
                                        var selectedVenueDD = _.filter($rootScope.accountDrivers, function(driver) {
                                            return driver.id == car.log[0].by;
                                        })[0];
                                        $scope.selectedDriver2 = selectedVenueDD;
                                    }
                                }
                            }
                        }
                    });
                }
            } else {
                $rootScope.loadRunner = false;
                $scope.selectedDriver2 = {};
                if (car.status != 'parked') {
                    if (car.log.length > 0) {
                        if (car.log[0].by != 'Unassigned' || car.log[0].by != '' || car.log[0].by != null) {
                            var selectedVenueDD = _.filter($rootScope.accountDrivers, function(driver) {
                                return driver.id == car.log[0].by;
                            })[0];
                            $scope.selectedDriver2 = selectedVenueDD;
                        }
                    }
                }
            }
        } else
            $rootScope.loadRunner = false;
    }

    if ($stateParams.carDetials) {
        $scope.editedCarDetails = $stateParams.carDetials;
        $scope.orginalCarDetailsBeforeEdit = _.clone($stateParams.carDetials);
        $scope.originalParkingID = $scope.editedCarDetails.parkingID;
        $scope.carData = $stateParams.carDetials;
        $rootScope.selectedVenueDetails = $scope.editedCarDetails.venue;
        if ($scope.editedCarDetails.venue) {
            if ($scope.editedCarDetails.venue.defaultValues && $scope.editedCarDetails.venue.defaultValues.free)
                $scope.editedCarDetails.free = $scope.editedCarDetails.venue.defaultValues.free
        }
        $scope.defaultSelectedDriver2($stateParams.carDetials);
    }


    $scope.webFileUpload = function() {
        $rootScope.loadRunner = true;
        if ($scope.dBlob) {
            Upload.upload({
                url: $rootScope.ipAddress + '/file/uploadScratchesImages2',
                data: {
                    key: "uploadFile",
                    file: new File([$scope.dBlob], new Date().getTime() + ".png")
                }
            }).success(function(data) {
                $rootScope.loadRunner = true;
                // console.log('uploaded profile img' + JSON.stringify(data));
                $scope.hideButton = false;
                addCarFunction(data);
                $scope.dBlob = undefined;
            });
        } else {
            addCarFunction(null);
        }

        function addCarFunction(data) {
            // console.log('add car call');
            $('#parkingID').focus();
            if (document.addcarform.parkingID.value == null || document.addcarform.parkingID.value == "") {
                alert("Please fill Ticket Number");
                $rootScope.loadRunner = false;
            } else if (document.addcarform.plateNumber.value == null || document.addcarform.plateNumber.value == "") {
                alert("Please fill Plate Number");
                $rootScope.loadRunner = false;
            } else if (angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager == undefined && document.getElementById("employeeRole").value != 'driver' && document.getElementById("employeeRole").value != 'chauffeur') {
                alert("Please fill required fields");
                $rootScope.loadRunner = false;
            } else {
                var postData = {};
                postData = {
                    plateNumber: document.getElementById("plateNumber").value,
                    parkingZone: document.getElementById("parkingZone").value,
                    accountID: document.getElementById("accountID").value,
                    loginAs: document.getElementById("loginAs").value
                }
                if (document.getElementById("customerType") && document.getElementById("customerType").value)
                    postData['customerType'] = document.getElementById("customerType").value;
                else
                    postData['customerType'] = 'GUEST';
                // if (document.getElementById("plateNumberCode").value) {
                //     if (document.getElementById("emirates") && document.getElementById("alphaCode").value && document.getElementById("plateNumberCode").value)
                //         postData['plateNumber'] = document.getElementById("emirates").value + document.getElementById("alphaCode").value + document.getElementById("plateNumberCode").value + document.getElementById("plateNumber").value;
                // } else {
                // if (document.getElementById("emirates") && (document.getElementById("emirates").value || document.getElementById("alphaCode").value || (document.getElementById("emirates") && document.getElementById("plateNumberCode").value)))
                postData['plateNumber'] = (document.getElementById("emirates") && document.getElementById("emirates").value ? document.getElementById("emirates").value : '') + (document.getElementById("alphaCode") && document.getElementById("alphaCode").value ? document.getElementById("alphaCode").value : '') + document.getElementById("plateNumber").value;
                // }

                if (document.getElementById("emirates") && document.getElementById("emirates").value)
                    postData['emirates'] = document.getElementById("emirates").value;


                postData['loginUser'] = {
                    "id": $rootScope.$user.id,
                    "email": $rootScope.$user.email,
                    "userName": $rootScope.$user.userName,
                    "userProfile": $rootScope.$user.userProfile
                }

                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    // console.log(JSON.stringify(document.getElementById("accountDriver").value))
                    postData['employeeID'] = JSON.parse(document.getElementById("accountDriver").value).id
                    postData['employeeName'] = JSON.parse(document.getElementById("accountDriver").value).userName
                } else {
                    if ($rootScope.selectedDriverTemp) {
                        postData['employeeID'] = $rootScope.selectedDriverTemp.id;
                        postData['employeeName'] = $rootScope.selectedDriverTemp.userName;
                    } else
                        postData['employeeID'] = 'Unassigned';
                }
                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    if (JSON.parse(document.getElementById("accountDriver").value).profileImage) {
                        postData['profileImage'] = $rootScope.ipAddress + "/images/" + JSON.parse(document.getElementById("accountDriver").value).profileImage
                    }
                }
                if ($rootScope.selectedDriverTemp) {
                    postData['profileImage'] = $rootScope.ipAddress + "/images/" + $rootScope.selectedDriverTemp.profileImage;
                }

                if ($rootScope.$user.role == 'driver') {
                    postData['employeeID'] = $rootScope.$user.id;
                    postData['employeeName'] = $rootScope.$user.userName;
                    if ($rootScope.$user.profileImage) {
                        postData['profileImage'] = $rootScope.ipAddress + "/images/" + $rootScope.$user.profileImage
                    }
                }

                // if (document.getElementById("carBrand").value) {
                //     if (JSON.parse(document.getElementById("carBrand").value).brand) {
                //         postData['brand'] = JSON.parse(document.getElementById("carBrand").value).brand;
                //     }
                //     if (JSON.parse(document.getElementById("carBrand").value).modelName) {
                //         postData['modelName'] = JSON.parse(document.getElementById("carBrand").value).modelName;
                //     }
                //     if (JSON.parse(document.getElementById("carBrand").value).color) {
                //         postData['color'] = JSON.parse(document.getElementById("carBrand").value).color;
                //     }
                // }
                // if ($scope.selectedBrandTemp) {
                //     if ($scope.selectedBrandTemp.brand)
                //         postData['brand'] = $scope.selectedBrandTemp.brand;
                //     if ($scope.selectedBrandTemp.color)
                //         postData['color'] = $scope.selectedBrandTemp.color;
                // }

                if (document.getElementById("newBrand").value) {
                    postData['brand'] = document.getElementById("newBrand").value;
                }
                if ((document.getElementById("newColor").value)) {
                    postData['color'] = document.getElementById("newColor").value;
                }
                if (document.getElementById("carModel") && document.getElementById("carModel").value) {
                    postData['modelName'] = document.getElementById("carModel").value;
                }

                if (document.getElementById('parkingFees') && document.getElementById('parkingFees').value) {
                    postData['fees'] = document.getElementById('parkingFees').value;
                }
                if (document.getElementById('amountPaidCheckbox') && document.getElementById('amountPaidCheckbox').value) {
                    postData['amountPaid'] = document.getElementById('amountPaidCheckbox').value;
                }

                if (document.getElementById('remarks').value)
                    postData['remarks'] = document.getElementById('remarks').value;

                if (document.getElementById("results").innerHTML == '') {
                    postData['parkingID'] = document.getElementById("parkingID").value;
                } else {
                    postData['parkingID'] = document.getElementById("results").innerHTML;
                }
                if (uploadedScratchesImages.length == 0) {
                    uploadedScratchesImages = [];
                }
                postData['scratchesSnap'] = uploadedScratchesImages;
                if ($scope.bb) {
                    if (data != null) {
                        postData['scratchesSnap'].push(data.file);
                    }
                }
                if ($rootScope.$user.role == 'chauffeur' || $rootScope.$user.role == 'driver') {
                    postData['venueID'] = document.getElementById("venueID").value;
                } // NOT A MANAGER && NOT ACCOUNT ADMIN
                else if ($rootScope.$user.role == 'manger') {
                    // postData['venueID'] =  JSON.parse(document.getElementById("multipleVenueIDs").value).id;
                    postData['venueID'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.id
                } // MANAGER
                else if ($rootScope.$user.role == 'accountadmin') {
                    // postData['venueID'] =  JSON.parse(document.getElementById("multipleVenueIDsforAccountAdmin").value).id;
                    postData['venueID'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.id
                } //  ACCOUNT ADMIN
                if (postData['profileImage'] === $rootScope.ipAddress + '/images/undefined') {
                    postData['profileImage'] = '';
                }

                if ($rootScope.$user.role == 'chauffeur' || $rootScope.$user.role == 'driver') {
                    if ($rootScope.$user.venues.length > 0 && $rootScope.$user.venues[0].defaultValues) {
                        postData['free'] = $rootScope.$user.venues[0].defaultValues.free;
                    }
                }

                if ($rootScope.$user.role == 'accountadmin' || $rootScope.$user.role == 'manager') {
                    if (angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.defaultValues) {
                        postData['free'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.defaultValues.free;
                    }
                }


                postData['otherInfo'] = {
                    plateNumber: (document.getElementById("emirates") && document.getElementById("emirates").value ? document.getElementById("emirates").value + " " : '') +
                        (document.getElementById("alphaCode") && document.getElementById("alphaCode").value ? document.getElementById("alphaCode").value + " " : '') +
                        (document.getElementById("plateNumberCode") && document.getElementById("plateNumberCode").value ? document.getElementById("plateNumberCode").value + " " : '') +
                        document.getElementById("plateNumber").value
                };

                // console.log('car data----->' + JSON.stringify(postData) + '---' + $scope.totalFees);
                $.post($rootScope.ipAddress + "/file/uploadForOscar", postData).done(function(data) {
                    $(".showHideForAddCarLoader").hide();
                    // console.log("success");
                    if ($rootScope.selectedVenueSettings && $rootScope.selectedVenueSettings.initialBillPrint) {
                        $.post($rootScope.ipAddress + "/file/updateBillNumerforPOSPrint", data).done(function(data) {
                            // if (data.print == 'ok') {
                            //     if (document.getElementById('wantPrint') && document.getElementById('wantPrint').value) {
                            //         // print function here...
                            //         angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().printButtonClickedforPrintforBillOnly(data.data);
                            //         // $scope.printButtonClickedforPrintforBillOnly(data.data);
                            //     }
                            // }
                            // console.log(JSON.stringify(data));
                        });
                    }
                    $rootScope.loadRunner = false;
                }, function(success) {
                    $('#parkingID').focus();
                    if (success && success.success === 'subscription expired') {
                        notificationService.errorNotify('Your subscription has expired...', 2000);
                    }
                    $rootScope.loadRunner = false;
                }, function(error) {
                    $rootScope.loadRunner = false;
                });
                $timeout(function() {
                    // document.getElementById("parkingID").value = '';
                    // document.getElementById("plateNumber").value = '';
                    // document.getElementById("parkingZone").value = '';
                }, 1000);
            }
        }
    }


    $scope.setParkingZoneforID = function(data) {
        if (typeof data == 'object')
            $rootScope.parkingZone = data.name;
        else
            $rootScope.parkingZone = data;
    }

    $scope.restaurant = {};
    /* Edit car information */

    $scope.webEditCarFileUpload = function() {
        // console.log('edit car detail' + JSON.stringify($scope.editedCarDetails));
        if ($scope.editedCarDetails.images && $scope.editedCarDetails.images.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < $scope.editedCarDetails.images.length) {
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: $scope.editedCarDetails.images[img],
                        params: {
                            filename: $scope.editedCarDetails.images[img].name,
                            file: $scope.editedCarDetails.images[img]
                        }
                    }).success(function(data) {
                        if (!$scope.editedCarDetails.documents)
                            $scope.editedCarDetails.documents = [];
                        $scope.editedCarDetails.documents.push($scope.editedCarDetails.images[img].name);

                        img++;
                        imageUpload(img);
                    });
                } else
                    editUserInsert();
            }
        } else {
            editUserInsert();
        }

        function editUserInsert() {
            $rootScope.loadRunner = true;
            if ($scope.dBlob) {
                // console.log('image exists');
                Upload.upload({
                    url: $rootScope.ipAddress + '/file/uploadScratchesImages2',
                    data: {
                        key: "uploadFile",
                        file: new File([$scope.dBlob], new Date().getTime() + ".png")
                    }
                }).success(function(data) {
                    $rootScope.loadRunner = true;
                    // console.log('uploaded profile img' + JSON.stringify(data));
                    $scope.hideButton = false;
                    editCarFunction(data);
                    $scope.dBlob = undefined;
                });
            } else {
                // console.log('image notttttttttt exists')
                editCarFunction(null);
            }

            function editCarFunction(data) {
                if (document.getElementById("venueID") != undefined || document.getElementById("venueID") != null) {
                    var postData = {};

                    postData = {
                            plateNumber: document.getElementById("plateNumber").value,
                            parkingZone: document.getElementById("parkingZone").value,
                            accountID: document.getElementById("accountID").value,
                            loginAs: document.getElementById("loginAs").value,
                            id: $scope.editedCarDetails.id,
                            venueID: $scope.editedCarDetails.venue.id,
                            snap: $scope.editedCarDetails.snap
                        }
                        // console.log('Parking zone===' + document.getElementById("parkingZone").value);
                    postData['loginUser'] = {
                        "id": $rootScope.$user.id,
                        "email": $rootScope.$user.email,
                        "userName": $rootScope.$user.userName,
                        "userProfile": $rootScope.$user.userProfile
                    }

                    if ($scope.editedCarDetails.description || $scope.editedCarDetails.documents || $scope.editedCarDetails.free) {
                        postData['free'] = $scope.editedCarDetails.free;
                        postData['description'] = $scope.editedCarDetails.description;
                        postData['documents'] = $scope.editedCarDetails.documents;
                    }

                    if (document.getElementById("customerType") && document.getElementById("customerType").value)
                        postData['customerType'] = document.getElementById("customerType").value;
                    else
                        postData['customerType'] = 'GUEST';

                    if (document.getElementById("venueID") && document.getElementById("venueID").value) {
                        postData['venueID'] = document.getElementById("venueID").value
                    }

                    if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                        // console.log(JSON.stringify(document.getElementById("accountDriver").value))
                        postData['employeeID'] = JSON.parse(document.getElementById("accountDriver").value).id
                        postData['employeeName'] = JSON.parse(document.getElementById("accountDriver").value).userName
                    } else {
                        postData['employeeID'] = 'Unassigned';
                    }
                    if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                        if (JSON.parse(document.getElementById("accountDriver").value).profileImage) {
                            postData['profileImage'] = $rootScope.ipAddress + "/images/" + JSON.parse(document.getElementById("accountDriver").value).profileImage
                        }
                    }

                    if ($rootScope.$user.role == 'driver') {
                        postData['employeeID'] = $rootScope.$user.id;
                        postData['employeeName'] = $rootScope.$user.userName;
                        if ($rootScope.$user.profileImage) {
                            postData['profileImage'] = $rootScope.ipAddress + "/images/" + $rootScope.$user.profileImage
                        }
                    }

                    // if (document.getElementById("carBrand").value) {
                    //     if (JSON.parse(document.getElementById("carBrand").value).brand) {
                    //         postData['brand'] = JSON.parse(document.getElementById("carBrand").value).brand;
                    //     }
                    //     if (JSON.parse(document.getElementById("carBrand").value).modelName) {
                    //         postData['modelName'] = JSON.parse(document.getElementById("carBrand").value).modelName;
                    //     }
                    //     if (JSON.parse(document.getElementById("carBrand").value).color) {
                    //         postData['color'] = JSON.parse(document.getElementById("carBrand").value).color;
                    //     }
                    // }
                    if (document.getElementById("newBrand").value) {
                        postData['brand'] = document.getElementById("newBrand").value;
                    }
                    if (document.getElementById("carModel") && document.getElementById("carModel").value) {
                        postData['modelName'] = document.getElementById("carModel").value;
                    }
                    if ((document.getElementById("newColor").value)) {
                        postData['color'] = document.getElementById("newColor").value;
                    }


                    if (document.getElementById('remarks').value)
                        postData['remarks'] = document.getElementById('remarks').value;


                    if (document.getElementById('parkingFees') && document.getElementById('parkingFees').value) {
                        postData['fees'] = document.getElementById('parkingFees').value;
                    }
                    if (document.getElementById('amountPaidCheckbox') && document.getElementById('amountPaidCheckbox').value) {
                        postData['amountPaid'] = document.getElementById('amountPaidCheckbox').value;
                    }


                    if (document.getElementById("results").innerHTML == '') {
                        postData['parkingID'] = document.getElementById("parkingID").value;

                    } else {
                        postData['parkingID'] = document.getElementById("results").innerHTML;
                    }

                    if (uploadedScratchesImages.length == 0) {
                        uploadedScratchesImages = [];
                    }
                    postData['scratchesSnap'] = [];
                    if ($scope.editedCarDetails.scratchesSnap) {
                        if ($scope.editedCarDetails.scratchesSnap.length > 0) {
                            if ($scope.bb) {
                                checkPNGExists(0);

                                function checkPNGExists(p) {
                                    if (p < $scope.editedCarDetails.scratchesSnap.length) {
                                        if ($scope.editedCarDetails.scratchesSnap[p].endsWith('png')) {
                                            $scope.editedCarDetails.scratchesSnap.splice(p, 1);
                                        } else {
                                            p++;
                                            checkPNGExists(p);
                                        }

                                    } else {

                                    }
                                }
                            }
                        }
                    }
                    if ($scope.editedCarDetails.scratchesSnap) {
                        postData['scratchesSnap'] = $scope.editedCarDetails.scratchesSnap //.concat(postData['scratchesSnap']);
                    }
                    if ($scope.bb) {
                        if (data)
                            postData['scratchesSnap'].push(data.file);

                    }
                    if (postData['profileImage'] == $rootScope.ipAddress + '/images/undefined')
                        postData['profileImage'] = '';

                    // console.log('ful edited details' + JSON.stringify(postData));
                    $.post($rootScope.ipAddress + "/file/upload2", postData).done(function(data) {
                            $(".showHideForAddCarLoader").hide();
                            $('#parkingID').focus();
                            // console.log("success");
                            $scope.snapImage = [];
                            $scope.markedImageSRC = '';
                            $scope.selectedBrandTemp = undefined;
                        },
                        function(success) {

                            if (success && success.success === 'subscription expired') {
                                notificationService.errorNotify('Your subscription has expired...', 2000);
                            }
                            $rootScope.loadRunner = false;
                        },
                        function(error) {
                            $rootScope.loadRunner = false;
                        });
                    return;
                } else {
                    $(".showHideForAddCarLoader").hide();
                    alert('Sorry, there is no venue assigned for you...');
                    $rootScope.loadRunner = false;
                    return;
                }
            }
        }

    }

    $scope.pngIndex = -1;
    $scope.checkPNGIsexists = function(image) {
        if (image && !image.endsWith('png')) {
            return true;
        } else {
            $scope.pngIndex = _.findIndex($rootScope.parkedProfile.scratchesSnap, image);
            return false;
        }
    }
    $scope.checkPNGIsexists2 = function(image) {
        if (image && !image.endsWith('png')) {
            return true;
        } else {
            $scope.pngIndex = _.findIndex($scope.editedCarDetails.scratchesSnap, image);
            return false;
        }
    }

    $scope.reversetheCarState = function(car) {
        swal({
            title: 'Are you sure?',
            text: "Do you really want to move the car from requested to parked?",
            type: 'warning',
            showCancelButton: true,
            cancelButtonColor: '#ffffff',
            confirmButtonColor: '#ed5565',
            confirmButtonText: 'Yes, move it!',
            cancelButtonText: "No"
        }, function() {
            $http.post($rootScope.ipAddress + '/requestcar/reverseCarStatusIntoParkedState/', { id: car.id }).then(function(data) {
                $state.go('app.carTransaction');
            });
        });
    }

    $scope.remindLaterRequestAccepted = function(car, driver) {
        // swal({
        //     title: "Are you sure?",
        //     text: "Do you really want to accept remind later request?",
        //     type: "warning",
        //     showCancelButton: true,
        //     confirmButtonClass: "btn-danger",
        //     confirmButtonText: "Yes, accept it!",
        //     cancelButtonText: "No, cancel it!",
        //     closeOnConfirm: false,
        //     closeOnCancel: false
        //   },
        //   function(isConfirm) {
        //     if (isConfirm) {
        if (car['log'] && car['log'][car['log'].length - 1].activity == 'requested') {
            if (!car['log'][car['log'].length - 1]['specialRequest'])
                car['log'][car['log'].length - 1]['specialRequest'] = {};
            car['log'][car['log'].length - 1]['specialRequest']['accepted'] = true;
            car['log'][car['log'].length - 1]['specialRequest']['by'] = {
                'by': driver.id,
                'employeeName': driver.userName,
                'at': new Date(),
                'userProfile': driver.profileImage
            }
            $scope.closeModal();
            // swal("Accepted!", "Remind later request accepted.", "success");
            if ($rootScope.isOnline) {
                parkingService.specialRequestAccepted(car, driver);
            } else {
                offlineDBService.editCarOfflineforspecialRequest('EvaletzRequestedCar', _.clone(car), 'requested');
            }
            audioElement ? audioElement.pause() : null;
        }
        //     } else {
        //         swal("Cancelled!", "Cancelled...", "error");
        //     }
        //   });
    }

    $scope.checkEvaletzServerUpbeforeSync = function() {
        checkOnllineServerDownBeforeSync();

        function checkOnllineServerDownBeforeSync() {
            $http.get($rootScope.ipAddress + '/requestcar/checkEvaletzServerUpbeforeSync').success(function(data) {
                // console.log(JSON.stringify(data));
            }).error(function(err) {
                // console.log(JSON.stringify(err) + " got an error............");
                $timeout(function() {
                    checkOnllineServerDownBeforeSync();
                }, 1000);
            });
        }
    }

    /* Special request function */
    $scope.spacialRequestSearch = function() {
        // console.log($scope.searchCars)
        if ($scope.searchCars != 'specialRequest') {
            $scope.searchCars = 'specialRequest';
        } else if ($scope.searchCars == 'specialRequest') {
            $scope.searchCars = '';
        }
    }

    /* ----Analytics----------- */
    $scope.pieLabels = ["Parked Car", "Requested Car", "Spl-Requested Car", "Accepted Car", "Completed Car"];
    $scope.monthLables = [];
    $scope.displayMonth = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    $scope.pieChartColors = ['#DCDCDC', '#F7464A', '#FDB45C', '#4D5360', '#949FB1'];

    $rootScope.selectedOptionsforanAnalysis = {
        venue: {},
        type: 'count'
    };

    $scope.series = ['Count'];
    $scope.selectedYear = '' + new Date().getFullYear();
    $scope.selectedMonth = $scope.displayMonth[((new Date()).getMonth())];
    $scope.displayDaysFor5Interval = [1, , , , 5, , , , , 10, , , , , 15, , , , , 20, , , , , 25, , , , , 30, 31];
    $scope.displayDaysForAll = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
    $scope.dateLabels = [];
    // $scope.dateLabels = [];
    $scope.dayData = [];
    $scope.dayData = [
        [1, 6, 3, 8, 5, 6, 7, 8, 9, 15, 7, 25, 8, 14, 8, 16, 17, 8, 9, 2, 5, 2, 9, 24, 25, 26, 27, 28, 45, 30, 49]
    ];
    $scope.monthLables = [];
    $scope.monthData = []
    $scope.yearData = [];

    $scope.lineColor = [{ pointBackgroundColor: '#8cd9c9', borderColor: '#1ab394', fill: true }];
    $scope.barColor = [{ backgroundColor: '#8cd9c9', borderColor: '#1ab394', hoverBackgroundColor: '#ededed', hoverBorderColor: '#e0e0e0', fill: false }];

    $rootScope.max = {
        dateLabelsMAX: [],
        dayDataforMax: []
    }


    function checkandInsertMonths(monthLables, monthData) {
        setTimeout(function() {
            if ($rootScope.$user.role != 'driver')
                checkAxisExists(0);

            function checkAxisExists(x) {
                if (x < $scope.displayMonth.length) {
                    if (monthLables[x] != $scope.displayMonth[x]) {
                        monthLables.splice(x, 0, $scope.displayMonth[x]);
                        if (monthData && monthData.length > 0) // && monthData[0] && (monthData[0].length <= x || monthData[0].length >= x)) //////'
                            monthData[0].splice(x, 0, 0);
                    }
                    x++;
                    checkAxisExists(x);
                } else {
                    $scope.monthLables = monthLables;
                    $scope.monthData = monthData;
                    $scope.$apply();
                }
            }
        }, 300);
    }

    function checkandInsertDates(data, type) {
        var ____temp = [];
        insertNvd3Data(0);

        function insertNvd3Data(d) {
            if (data && data.date && d < data.date.length && data[type]) {
                ____temp.push({ x: data.date[d], y: data[type][d] });
                d++;
                insertNvd3Data(d);
            } else
                $scope.dataforNVD3 = carDataGetting(_.sortBy(____temp, (s) => { return parseInt(s.x) }));

        }
    }



    function analyticsInit(types, venueWiseData) {
        // console.log(JSON.stringify(types), JSON.stringify(venueWiseData) + '\n\n\n\n\n\n\n\n\n\n')
        var ____res = (venueWiseData != 'all' ? analyticsService.getTodayAnalyticsforaVenue() : analyticsService.getTodayAnalyticsforanAccount())
        ____res.then(function(data) {
            $scope.pieData = data;
        });
        var ____year = (venueWiseData != 'all' ? analyticsService.getVenueAnalyticsData() : analyticsService.getAccountAnalyticsData())
        ____year.then(function(data) {
            if (data['' + new Date().getFullYear()]) {
                $scope.yearLables = ["2017", "2018", "2019", "2020", "2021"];
                $scope.yearData = [
                    [
                        _.reduce(data['2017'] ? data['2017'][types] : [], function(memo, num) { return memo + num; }, 0),
                        _.reduce(data['2018'] ? data['2018'][types] : [], function(memo, num) { return memo + num; }, 0),
                        _.reduce(data['2019'] ? data['2019'][types] : [], function(memo, num) { return memo + num; }, 0),
                        _.reduce(data['2020'] ? data['2020'][types] : [], function(memo, num) { return memo + num; }, 0),
                        _.reduce(data['2021'] ? data['2021'][types] : [], function(memo, num) { return memo + num; }, 0)
                    ]
                ];
                var monthLables = _.map(data['' + new Date().getFullYear()].month, function(month) {
                    return $scope.displayMonth[month - 1];
                });
                var monthData = [
                    data['' + new Date().getFullYear()][types]
                ];

                checkandInsertMonths(monthLables, monthData);
                var __date = (venueWiseData != 'all' ? analyticsService.getYearMonthTodayRecordsVenue('year', new Date().getFullYear(), new Date().getMonth(), {}) : analyticsService.getYearMonthTodayRecords('year', new Date().getFullYear(), new Date().getMonth(), {}));
                __date.then(function(data) {
                    checkandInsertDates(data, types);
                    $rootScope.max = {
                        dateLabelsMAX: data.date,
                        dayDataforMax: [data[types]]
                    }
                });
            } else {
                $scope.dataforNVD3 = [];
                $scope.monthLables = [];
                $scope.monthData = [];
                $scope.yearData = [];
            }
        });

    }

    if ($rootScope.$user && $rootScope.$user.role != "validator" && $rootScope.$user.role != "driver") {
        // $timeout(()=> {
        if ($rootScope.$user.role != 'accountinguser' && $rootScope.$user.role != "chauffeur")
            analyticsInit('count', 'all')
        else {
            $rootScope.selectedOptionsforanAnalysis.venue = $rootScope.$user.venues[0];
            analyticsInit('count', $rootScope.$user.venues[0].id)
        }
        // }, 5000);

    }

    $rootScope.callWhenLoginTime = function() {
        analyticsInit('count', 'all');
    }

    $scope.closeModalforDatewiseChart = function() {
        $scope.DatewiseChart.hide();
    };
    $scope.maxChart = function() {
        $scope.showModalforDatewiseChart();
    }

    $scope.getAnalysisData = function(selectedOptionsforanAnalysis) {
        analyticsInit(selectedOptionsforanAnalysis.type, (selectedOptionsforanAnalysis.venue && selectedOptionsforanAnalysis.venue.id ? selectedOptionsforanAnalysis.venue.id : 'all'));
    }

    $scope.yearClicked = function(points, evt) {
        points[0] ? $scope.selectedYear = points[0]._model.label : null;
        $scope.selectedMonth = 'Jan';
        var ____year = (!$rootScope.selectedOptionsforanAnalysis.venue.id ? analyticsService.getAccountAnalyticsData() : analyticsService.getVenueAnalyticsData());
        ____year.then(function(data) {
            $scope.yearLables = ["2017", "2018", "2019", "2020", "2021"];
            $scope.yearData = [
                [
                    _.reduce(data['2017'] ? data['2017'][$rootScope.selectedOptionsforanAnalysis.type] : [], function(memo, num) { return memo + num; }, 0),
                    _.reduce(data['2018'] ? data['2018'][$rootScope.selectedOptionsforanAnalysis.type] : [], function(memo, num) { return memo + num; }, 0),
                    _.reduce(data['2019'] ? data['2019'][$rootScope.selectedOptionsforanAnalysis.type] : [], function(memo, num) { return memo + num; }, 0),
                    _.reduce(data['2020'] ? data['2020'][$rootScope.selectedOptionsforanAnalysis.type] : [], function(memo, num) { return memo + num; }, 0),
                    _.reduce(data['2021'] ? data['2021'][$rootScope.selectedOptionsforanAnalysis.type] : [], function(memo, num) { return memo + num; }, 0)
                ]
            ];

            var monthLables = _.map(data[$scope.selectedYear].month, function(month) {
                return $scope.displayMonth[month - 1];
            });
            var monthData = [
                data[$scope.selectedYear][$rootScope.selectedOptionsforanAnalysis.type]
            ];

            checkandInsertMonths(monthLables, monthData);

            var __date = (!$rootScope.selectedOptionsforanAnalysis.venue.id ? analyticsService.getYearMonthTodayRecords('year', $scope.selectedYear, 0, {}) : analyticsService.getYearMonthTodayRecordsVenue('year', $scope.selectedYear, 0, {}));
            __date.then(function(data) {
                checkandInsertDates(data, $rootScope.selectedOptionsforanAnalysis.type);
                $rootScope.max = {
                    dateLabelsMAX: data.date,
                    dayDataforMax: [data[$rootScope.selectedOptionsforanAnalysis.type]]
                }
            });
        });
    };

    $scope.monthClicked = function(points, evt) {
        points[0] ? $scope.selectedMonth = points[0]._model.label : null;
        var __date = (!$rootScope.selectedOptionsforanAnalysis.venue.id ? analyticsService.getYearMonthTodayRecords('year', $scope.selectedYear, $scope.displayMonth.indexOf($scope.selectedMonth), {}) : analyticsService.getYearMonthTodayRecordsVenue('year', $scope.selectedYear, $scope.displayMonth.indexOf($scope.selectedMonth), {}));
        __date.then(function(data) {
            checkandInsertDates(data, $rootScope.selectedOptionsforanAnalysis.type);
            $rootScope.max = {
                dateLabelsMAX: data.date,
                dayDataforMax: [data[$rootScope.selectedOptionsforanAnalysis.type]]
            }
        });
    };

    $scope.datasetOverride = [{
        yAxisID: 'y-axis-1'
    }];

    $scope.options1 = {
        maintainAspectRatio: true,
        scales: {
            yAxes: [{
                id: 'y-axis-1',
                type: 'linear',
                display: true,
                position: 'left'
            }]
        },
        responsive: true,
        animation: {
            onComplete: function() {
                var sourceCanvas = this.chart.ctx.canvas;
                var copyWidth = this.chart.controller.chartArea.left - 5;
                // the +5 is so that the bottommost y axis label is not clipped off
                // we could factor this in using measureText if we wanted to be generic
                var copyHeight = this.chart.controller.chartArea.bottom + 5; // 282 //this.scale.endPoint + 5;
                var targetCtx = document.getElementById("myChartAxis").getContext("2d");
                targetCtx.canvas.width = copyWidth;
                targetCtx.drawImage(sourceCanvas, 0, 0, copyWidth, copyHeight, 0, 0, copyWidth, copyHeight);
            }
        }
    };

    $scope.options = { legend: { display: false } };
    $scope.changeData = function() {
        $scope.data = $scope.data.map(function(data) {
            return data.map(function(y) {
                y = y + Math.random() * 10 - 5;
                return parseInt(y < 0 ? 0 : y > 100 ? 100 : y);
            });
        });
    };



    $scope.callbackFunction = function() {
        return function() {
            d3.selectAll('.nv-lineLabels text').style('fill', "white");
        }
    }


    $scope.optionsNVD3 = {
        chart: {
            showLegend: false,
            type: 'lineChart',
            height: 250,
            interpolate: 'basic',
            isArea: true,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 30
            },
            x: function(d) { return d.x; },
            y: function(d) { return d.y; },
            useInteractiveGuideline: true,
            "xDomain": [1, 31],
            xAxis: {
                // axisLabel: 'Date',
                ticks: [5]
            },
            yAxis: {
                // axisLabel: 'Car Count',
                // axisLabelDistance: -10
            },
            forceY: [0],
            "tooltips": true,
            "tooltip": {
                "duration": 100,
                "gravity": "w",
                "distance": 25,
                "snapDistance": 0,
                "classes": null,
                "chartContainer": null,
                "fixedTop": null,
                "enabled": true,
                "hideDelay": 400,
                "headerEnabled": true,
                "position": {
                    "left": null,
                    "top": null
                },
                "offset": {
                    "left": 0,
                    "top": 0
                },
                "hidden": true,
                "data": null,
                "tooltipElem": null,
                "id": "nvtooltip-76419"
            },
            callback: function(chart) {
                // console.log("!!! lineChart callback !!!");
            },
            tickFormat: function(d, i) {
                return "Year" + d //"Year1 Year2, etc depending on the tick value - 0,1,2,3,4"
            }
        },
        title: {
            enable: false,
            text: 'Title for Line Chart'
        },
        subtitle: {
            enable: false,
            text: 'Subtitle for simple line chart. Lorem ipsum dolor sit amet, at eam blandit sadipscing, vim adhuc sanctus disputando ex, cu usu affert alienum urbanitas.',
            css: {
                'text-align': 'center',
                'margin': '10px 13px 0px 7px'
            }
        },
        caption: {
            enable: false,
            html: '<b>Figure 1.</b> Lorem ipsum dolor sit amet, at eam blandit sadipscing, <span style="text-decoration: underline;">vim adhuc sanctus disputando ex</span>, cu usu affert alienum urbanitas. <i>Cum in purto erat, mea ne nominavi persecuti reformidans.</i> Docendi blandit abhorreant ea has, minim tantas alterum pro eu. <span style="color: darkred;">Exerci graeci ad vix, elit tacimates ea duo</span>. Id mel eruditi fuisset. Stet vidit patrioque in pro, eum ex veri verterem abhorreant, id unum oportere intellegam nec<sup>[1, <a href="https://github.com/krispo/angular-nvd3" target="_blank">2</a>, 3]</sup>.',
            css: {
                'text-align': 'justify',
                'margin': '10px 13px 0px 7px'
            }
        }
    };
    $scope.optionsNVD3Dashboard = {
        chart: {
            showLegend: true,
            type: 'lineChart',
            height: 250,
            interpolate: 'basic', // ,'cardinal',
            isArea: true,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
                left: 30
            },
            x: function(d) { return d.x; },
            y: function(d) { return d.y; },
            useInteractiveGuideline: true,
            "xDomain": [1, 31],
            xAxis: {
                // axisLabel: 'Date',
                ticks: [5]
            },
            yAxis: {
                // axisLabel: 'Car Count',
                // axisLabelDistance: -10
            },
            forceY: [0],
            "tooltips": true,
            "tooltip": {
                "duration": 100,
                "gravity": "w",
                "distance": 25,
                "snapDistance": 0,
                "classes": null,
                "chartContainer": null,
                "fixedTop": null,
                "enabled": true,
                "hideDelay": 400,
                "headerEnabled": true,
                "position": {
                    "left": null,
                    "top": null
                },
                "offset": {
                    "left": 0,
                    "top": 0
                },
                "hidden": true,
                "data": null,
                "tooltipElem": null,
                "id": "nvtooltip-76419"
            },
        }
    };


    $scope.isGroupShown = false;
    $scope.toggleGroup = function() {
        $scope.isGroupShown = !$scope.isGroupShown;
        $scope.$evalAsync();
    };


    $scope.dataforNVD3 = carDataGetting([]);





    function carDataGetting(data) {
        return [{
                values: data, //values - represents the array of {x,y} data points
                key: 'Count', //key  - the name of the series.
                color: '#f56c0d', //color - optional: choose your own line color.
                // strokeWidth: 2,
                // classed: 'dashed'
                area: true
            },

        ];
    };

    /* modal open */
    $scope.openAddCarModal = function() {
        $('#addCarModal').modal('show');
    }

    $scope.openMailSendModal = function() {
        $('#openMailModal').modal('show');
    }
    $scope.close = function() {
        $('.modal').modal('hide');
        $scope.searchCars = '';
        $('#searchPlateTicketNumber').focus();
        $('#searchPlateTicketNumber').val('');
        if ($rootScope.$user && $rootScope.$user.role && $rootScope.$user.role != 'validator') {
            $timeout(() => {
                _.filter($rootScope.parkedCar, (o) => {
                    $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                _.filter($rootScope.requestedCar, (o) => {
                    $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                _.filter($rootScope.completedCar, (o) => {
                    $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                    return o.parkingID;
                });
                $rootScope.loadingScrollBusy = false;
                $rootScope.parkedCar = [];
                var __res1 = parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', '', $rootScope.$user.venues);
                __res1.then(() => {
                    $rootScope.loadingScrollBusy = false;
                    $rootScope.requestedCar = [];
                    var __res2 = parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', '', $rootScope.$user.venues);
                    __res2.then(() => {
                        $rootScope.loadingScrollBusy = false;
                        $rootScope.completedCar = [];
                        parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', '', $rootScope.$user.venues);
                    });
                });
            }, 1000);
        }
    }

    $scope.venueSelectedByAccountAdmin = function() {
        $rootScope.parkedCar = [];
        $rootScope.loadingScrollBusy = false;
        var ___res1 = parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', '', $rootScope.$user.venues)
        ___res1.then(() => {
            $rootScope.loadingScrollBusy = false;
            $rootScope.requestedCar = [];
            var __res2 = parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', '', $rootScope.$user.venues)
            __res2.then(() => {
                $rootScope.loadingScrollBusy = false;
                $rootScope.completedCar = [];
                parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', '', $rootScope.$user.venues);
            });
        });
    }

    $scope.venueSelected = function(data) {
        // console.log(JSON.stringify(data))
        var newZones = [];

        if (data.defaultValues) {
            if (data.defaultValues.customerType)
                $rootScope.customerType = data.defaultValues.customerType;
            else
                $rootScope.customerType = '';
            if (data.defaultValues.driver)
                $rootScope.selectedDriverTemp = data.defaultValues.driver;
            else
                $rootScope.selectedDriverTemp = {};
        } else {
            $rootScope.customerType = '';
            $rootScope.selectedDriverTemp = {};
        }

        if (data.parkingZones && data.parkingZones.length > 0)
            parkingZonePopulating(0);
        else
            $rootScope.parkingZones = (data.parkingZones ? data.parkingZones : []);

        function parkingZonePopulating(zone) {
            var parkingslotcounter = 0;
            if (zone < data.parkingZones.length) {
                if (data.parkingZones[zone].noofPatkingSlots) {
                    if (data.parkingZones[zone].startsfrom)
                        printSlots(data.parkingZones[zone].startsfrom);
                    else
                        printSlots(0);

                    function printSlots(pzonessss) {
                        if (parkingslotcounter < data.parkingZones[zone].noofPatkingSlots) {
                            newZones.push({ name: pzonessss + " " + data.parkingZones[zone].name });
                            parkingslotcounter++;
                            pzonessss++;
                            printSlots(pzonessss);
                        } else {
                            zone++;
                            parkingZonePopulating(zone);
                        }
                    }
                } else {
                    if (data.parkingZones[zone] && data.parkingZones[zone].name)
                        newZones.push({ name: data.parkingZones[zone].name });
                    zone++;
                    parkingZonePopulating(zone);
                }
            } else {
                // console.log(JSON.stringify(newZones))
                $rootScope.parkingZones = newZones;
            }
        }
        if (data.automaticTokenGeneration && $rootScope.$user.role == 'accountadmin') {
            $http.post($rootScope.ipAddress + '/requestcar/venueWiseTotalticketUser/', { accountID: $rootScope.$user.accountID.id, venueID: data.id }).then(function(data1) {
                if (data.short)
                    $scope.readedBarCode = data.short + data1.data.newTicket;
                else
                    $scope.readedBarCode = data1.data.newTicket;
            });
        } else
            $scope.readedBarCode = "";

        if (data.settings)
            $rootScope.selectedVenueSettings = data.settings;
        else
            $rootScope.selectedVenueSettings = {};

        if ($rootScope.$user.role == 'accountadmin') {
            $rootScope.$user.venues = [];
            $rootScope.$user.venues.push(data);
        }
    }

    $scope.parkingZoneFuncClick = function(data) {
        document.getElementById("parkingZone").value = data;
    }

    // $scope.searchandSelectModalforCarModels = function(modalType) {
    //     $scope.modalType = modalType;
    //     $('#carBrandColorModal').modal('show')
    // }



    $scope.dashboardNVD3 = [];
    $scope.DashboardWidgetForcalulatingVenueWise = function(type) {
        var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        var lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        firstDay = moment(firstDay).format("YYYY-MM-DD")
        lastDay = moment(lastDay).format("YYYY-MM-DD")
        if ($rootScope.$user && $rootScope.$user.accountID) {
            var postData = { accountID: $rootScope.$user.accountID.id, fromDate: firstDay, toDate: lastDay };
            var _url = '';
            if ($rootScope.$user.role == 'accountinguser') {
                postData['venueID'] = $rootScope.$user.venues[0].id;
                _url = $rootScope.ipAddress + '/dailytransactional/assignedVenueWiseData/';
            } else
                _url = $rootScope.ipAddress + '/dailytransactional/overAllAccountVenueWiseData/';
            $http.post(_url, postData).then(function(data) {
                //    console.log(JSON.stringify(data))
                var colorSet = ['#ff7f0e', '#2ca02c', '#7777ff', 'red', 'blue', 'yellow', 'brown', 'violet', 'black', 'grey', 'pink', 'orange', '#FFC300', '#FFC300'];
                if (data.data.length > 0) {
                    var finalData = [];
                    getEachDate(0);;

                    function getEachDate(dt) {
                        if (dt < data.data.length) {
                            var ____temp = [];
                            insertNvd3Data(0);

                            function insertNvd3Data(d) {
                                if (d < data.data[dt].date.length) {
                                    // console.log(____temp)
                                    ____temp.push({ x: data.data[dt].date[d], y: data.data[dt][type][d] });
                                    d++;
                                    insertNvd3Data(d);
                                } else {
                                    if (data.data[dt].venue != 'null') {
                                        finalData.push({
                                            values: _.sortBy(____temp, (s) => { return parseInt(s.x) }),
                                            key: data.data[dt].venue,
                                            color: colorSet[dt],
                                            area: true
                                        });
                                    }
                                    dt++;
                                    getEachDate(dt);
                                }
                            }
                        } else {

                            // console.log(JSON.stringify(finalData) + "\\\\\\\\\\\\\\\\\\\\");

                            insertUnreturnDatum(0);

                            function insertUnreturnDatum(dta) {
                                if (dta < finalData.length) {
                                    if (finalData[dta] && finalData[dta].values.length > 0)
                                        increaseIndx(0);
                                    else {
                                        dta++;
                                        insertUnreturnDatum(dta);
                                    }

                                    function increaseIndx(inx) {
                                        if (inx < 31) {
                                            if (finalData[dta]) {
                                                if (_.filter(finalData[dta].values, (i) => {
                                                        return i.x == '' + inx || i.x == '0' + inx;
                                                    }).length == 0) {
                                                    finalData[dta].values.splice(inx, 0, { x: '' + inx, y: 0 });
                                                }
                                            }

                                            if (inx == new Date().getDate()) {
                                                inx = 31;
                                                increaseIndx(inx);
                                            }

                                            if (inx == new Date().getDate()) {
                                                dta++;
                                                insertUnreturnDatum(dta);
                                            }
                                            inx++;
                                            increaseIndx(inx);
                                        } else {
                                            dta++;
                                            insertUnreturnDatum(dta);
                                        }
                                    }
                                } else {
                                    $scope.dashboardNVD3 = finalData;
                                }
                            }
                        }
                    }
                }
            });
        }
    }
    if ($state.current.name == 'app.mainDashboard' || $state.current.name == 'app.dashboard') {
        $scope.DashboardWidgetForcalulatingVenueWise('count');
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
            //manually add user SelectedVenueName and set selection
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


    $scope.exportShow = false;
    $scope.expotedDate = moment().format("YYYY-MM-DD hh:mm:ss");

    $scope.exportFunction = function() {
        $scope.exportShow = true;
        $scope.expotedDate = moment().format("YYYY-MM-DD hh:mm:ss");
        $timeout(() => {
            $scope.exportShow = false;
        }, 1000);
        ///dom to svg module
        var wrapper = document.getElementById('export');
        // console.log($rootScope.selectedOptionsforanAnalysis)
        // wrapper =  wrapper.innerHTML 
        //'<div style="background-color:white">   <div class="ibox border"> <div class="ibox-content"> <h2>'+ $rootScope.$user.accountID.accountName+'</h2> <div class="row"> <div class="form-group col-lg-4"> <label class="font-normal">Venue: '+ ($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id  ? $rootScope.selectedOptionsforanAnalysis.venue.venueName : 'All Venue') +'</label> </div><div class="form-group col-lg-4"> <label class="font-normal">Exported Date: '+ moment().format("YYYY-MM-DD hh:mm:ss")+'</label> </div><div class="col-lg-4"> <label class="font-normal">Type : '+ $rootScope.selectedOptionsforanAnalysis.type + '</label> </div></div></div></div>' + wrapper.innerHTML + '</div>';
        // var str2DOMElement = function(html) {
        //     var frame = document.createElement('iframe');
        //     frame.style.display = 'none';
        //     document.body.appendChild(frame);             
        //     frame.contentDocument.open();
        //     frame.contentDocument.write(html);
        //     frame.contentDocument.close();
        //     var el = frame.contentDocument.body.firstChild;
        //     document.body.removeChild(frame);
        //     return el;
        // }
        // var el = str2DOMElement(wrapper);
        // console.log($rootScope.selectedOptionsforanAnalysis)
        //dom to image
        domtoimage.toSvg(wrapper).then(function(svgDataUrl) {
            //download function    
            downloadPNGFromAnyImageSrc(svgDataUrl);
        });
    }

    $scope.formatDate=function(date){
        return moment(date).format("YYYY-MM-DD");
    }

    $scope.showExportInfo=false;
    $scope.exportDailyReportPng=function(){
        var wrapper = document.getElementById('dailyReportChart');
        $scope.showExportInfo = true;
        $rootScope.ladaLoader = true;
        domtoimage.toSvg(wrapper).then(function (svgDataUrl) {
            //download function    
            downloadPNGFromAnyImageSrc(svgDataUrl);
        });
        $timeout(() => {
            $scope.showExportInfo = false;
            $rootScope.ladaLoader = false;
        }, 1000);
    }

    $scope.onSelected = function(selectedItem) {
        if (!$scope.selectedBrandTemp)
            $scope.selectedBrandTemp = {}
        $scope.selectedBrandTemp.brand = selectedItem.brand;
    }

    $scope.onSelected2 = function() {
        alert('onselect');
        $timeout(function() {
            $(':focus').blur();
        })
    }

    $scope.showBox1 = false;
    $scope.showBox2 = false;
    $scope.showBox3 = false;
    $scope.showBox4 = false;
    $scope.showBox5 = false;
    $scope.showSearchBox1 = function() {
        $scope.showBox1 = !$scope.showBox1;
        if ($rootScope.$user.role == 'manager') {
            $timeout(function() {
                $('#multipleVenueIDs').focus();
                $timeout(function() {
                    $scope.$broadcast('venueFocus');
                }, 500);
            }, 500);
            // var result = document.getElementById("multipleVenueIDs");
            // var uiSelect = angular.element(result).controller('uiSelect');
            // uiSelect.focusInput.focus();
            // uiSelect.activate();

        } else if ($rootScope.$user.role == 'accountadmin') {
            $timeout(function() {
                // if ($scope.showBox1) {
                //     $timeout(function() {
                //         $scope.$broadcast('venueFocus');
                //     }, 500);
                // } else {
                //     $('#multipleVenueIDsforAccountAdmin').focus();
                // }
                $('#multipleVenueIDsforAccountAdmin').focus();
            }, 500);
            // var result = document.getElementById("multipleVenueIDsforAccountAdmin");
            // var uiSelect = angular.element(result).controller('uiSelect');
            // uiSelect.activate();
            // uiSelect.activate();
        }
    }
    $scope.showSearchBox2 = function(zone) {
        // alert(zone);
        $scope.showBox2 = !$scope.showBox2;
        $rootScope.parkingZone = zone;
        // $scope.$broadcast('zoneUISelect');
        $timeout(function() {
            if ($rootScope.parkingZone) {
                if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'driver') {
                    $('#notDriverChauffeur').focus();
                }
                if ($rootScope.$user.role == 'chauffeur') {
                    $('#chauffeur').focus();
                }
                if ($rootScope.$user.role == 'driver') {
                    $('#carBrand2').focus();
                }
            }
            if ($scope.editedCarDetails && $scope.editedCarDetails.parkingZone) {
                if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'driver') {
                    $('#accountDriver').focus();
                }
                if ($rootScope.$user.role == 'chauffeur') {
                    $('#accountDriver').focus();
                }
                if ($rootScope.$user.role == 'driver') {
                    $('#carBrand2').focus();
                }
            }

        }, 500);

    }
    $scope.showSearchBox3 = function() {
        $scope.showBox3 = !$scope.showBox3;
        if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'driver') {
            $timeout(function() {
                $('#notDriverChauffeur').focus();
            }, 500);
        }
        if ($rootScope.$user.role == 'chauffeur') {
            $timeout(function() {
                $('#chauffeur').focus();
            }, 500);
        }
    }
    $scope.showSearchBox4 = function() {
        $scope.showBox4 = !$scope.showBox4;
        $timeout(function() {
            $('#carBrand2').focus();
        }, 500);
    }
    $scope.showSearchBox5 = function() {
        $scope.showBox5 = !$scope.showBox5;
        $timeout(function() {
            $('#carColor').focus();
        }, 500);
    }


    $scope.vlidateTicket = function(ticketorPlateNumber, $event) {
        if ($event && $event.keyCode == 13 && (ticketorPlateNumber && ticketorPlateNumber != '' && ticketorPlateNumber != ' ')) {
            $scope.getCarInfo(ticketorPlateNumber);
        }
    }


    $scope.mouseClickEventFiles = function() {
        $('#driverUpdate').on('shown.bs.modal', function() {
            $timeout(function() {
                $('#driverAssign').focus();
            }, 500);
            $(document).on('keypress', 'input, select, textarea', function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    // accept car modal
                    if ($(this).attr("id") == 'driverAssign') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#driverAssignBtn').click();

                    }
                }
            });
        })
        $('#acceptModal').on('shown.bs.modal', function() {
            $timeout(function() {
                $('#acceptDriver').focus();
            }, 500);
            $(document).on('keypress', 'input, select, textarea', function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    // accept car modal
                    if ($(this).attr("id") == 'acceptDriver') {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#acceptBtn').click();

                    }
                }
            });
        })


        /* complete modal enter key function */
        $('#completeModal').on('shown.bs.modal', function() {
            $timeout(function() {
                if ($rootScope.$user.role == 'driver') {
                    $('input:checkbox').focus();
                } else {
                    $('#finalCompleteDriver').focus();
                }
            }, 500);
            $(document).on('keypress', 'input, select, textarea', function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    // accept car modal
                    if ($(this).attr("id") == 'finalCompleteDriver') {
                        $('input:checkbox').focus();
                    }
                    if ($(this).attr("id") == 'checkbox9') {
                        if ($scope.missed) {
                            // $('#cmpGuestName').focus();
                            $('#cmpGuestName').focus();
                        } else {
                            // $('#cmpCashierName').focus();
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            $('#finalCompBtnCar').click();
                            // $('#finalCompBtnCar').css("background-color", "green");
                        }
                    }
                    if ($(this).attr("id") == 'cmpGuestName') {
                        $('#cmpMobileNumber').focus();
                    }
                    if ($(this).attr("id") == 'cmpMobileNumber') {
                        // $('#cmpCashierName').focus();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#finalCompBtnCar').click();
                        // $('#finalCompBtnCar').css("background-color", "green");
                    }
                    // if ($(this).attr("id") == 'cmpCashierName') {
                    //     if (!$scope.carData.free) {
                    //         $('#cmpFee').focus();
                    //     } else {
                    //         $('#cmpDescription').focus();
                    //     }
                    // }
                    // if ($(this).attr("id") == 'cmpFee') {
                    //     $('#cmpDescription').focus();
                    // }
                    // if ($(this).attr("id") == 'cmpDescription') {
                    //     $('#finalCompBtnCar').click();
                    //     $('#finalCompBtnCar').css("background-colo", "green");
                    // }
                }
            });
        })

        $('#requestComplete').on('shown.bs.modal', function() {
            $timeout(function() {
                if ($rootScope.$user.role == 'driver') {
                    $('input:checkbox').focus();
                } else {
                    $('#completeDriver').focus();
                }
            }, 500);
            $(document).on('keypress', 'input, select, textarea', function(e) {
                if (e.which == 13) {
                    e.preventDefault();
                    //parked sate complete
                    if ($(this).attr("id") == 'completeDriver') {
                        $('input:checkbox').focus();
                    }
                    if ($(this).attr("id") == 'checkbox8') {
                        if ($scope.missed) {
                            $('#guestName').focus();
                        } else {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            $('#compBtnCar').click();
                            // $('#compBtnCar').css("background-color", "green");
                        }
                    }
                    if ($(this).attr("id") == 'guestName') {
                        $('#mobileNumber').focus();
                    }
                    if ($(this).attr("id") == 'mobileNumber') {
                        // $('#nameOfCashier').focus();
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        $('#compBtnCar').click();
                        // $('#compBtnCar').css("background-color", "green");
                    }
                    // if ($(this).attr("id") == 'nameOfCashier') {
                    //     if (!$scope.carData.free) {
                    //         $('#fee').focus();
                    //     } else {
                    //         $('#description').focus();
                    //     }
                    // }
                    // if ($(this).attr("id") == 'fee') {
                    //     $('#description').focus();
                    // }
                    // if ($(this).attr("id") == 'description') {
                    //     $('#compBtnCar').click();
                    //     $('#compBtnCar').css("background-colo", "green");
                    // }
                }
            })

        })



    }


    $scope.mouseClickEventFiles();

    $(document).on('keypress', 'input, select, textarea', function(e) {
        if (e.which == 13) {
            e.preventDefault();
            if ($state.current.name == 'app.editCar') {
                if ($(this).attr("id") == 'parkingID') {
                    $('#plateNumber').focus();
                } else if ($(this).attr("id") == 'plateNumber') {
                    if ($rootScope.$user.role == 'manager') {
                        $('#multipleVenueIDs').focus();
                    }
                    if ($rootScope.$user.role == 'accountadmin') {
                        $('#venueID').focus();
                    }
                    if ($rootScope.$user.role == 'chauffeur') {
                        var result = document.getElementById("parkingZone123213");
                        var uiSelect = angular.element(result).controller('uiSelect');
                        // uiSelect.activate();
                        uiSelect.focusser[0].focus();
                    }
                    if ($rootScope.$user.role == 'driver') {
                        var result = document.getElementById("parkingZone123213");
                        var uiSelect = angular.element(result).controller('uiSelect');
                        // uiSelect.activate();
                        uiSelect.focusser[0].focus();
                    }
                } else if ($(this).attr("id") == 'venueID') {
                    if ($rootScope.parkingZones && $rootScope.parkingZones.length > 0){
                        var result = document.getElementById("parkingZone123213");
                        var uiSelect = angular.element(result).controller('uiSelect');
                        uiSelect.focusser[0].focus();
                    }                        
                    else
                        $('#parkingZone123214').focus();
                } else if ($(this).attr("id") == 'multipleVenueIDs') {
                    if ($rootScope.parkingZones && $rootScope.parkingZones.length > 0){
                        var result = document.getElementById("parkingZone123213");
                        var uiSelect = angular.element(result).controller('uiSelect');
                        uiSelect.focusser[0].focus();
                    }
                    else
                        $('#parkingZone123214').focus();
                } else if ($(this).attr("id") == 'parkingZone123213') {
                    if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'driver') {
                        $('#accountDriver').focus();
                    } else if ($rootScope.$user.role == 'chauffeur') {
                        $('#accountDriver').focus();
                    } else {
                        $('#carBrand2').focus();
                    }
                } else if ($(this).attr("id") == 'parkingZone123214') {
                    if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'driver') {
                        $('#accountDriver').focus();
                    } else if ($rootScope.$user.role == 'chauffeur') {
                        $('#accountDriver').focus();
                    } else {
                        $('#carBrand2').focus();
                    }
                }else if ($(this).attr("id") == 'accountDriver') {
                    $('#carBrand2').focus();
                } else if ($(this).attr("id") == 'carBrand2') {
                    if ($scope.editedCarDetails.venue.settings.carModalName)
                        $('#carModel').focus();
                    else
                        $('#carColor').focus();
                } else if ($(this).attr("id") == 'carModel') {
                    $('#carColor').focus();
                }else if ($(this).attr("id") == 'carColor') {
                    $('#customerType').focus();
                } else if ($(this).attr("id") == 'customerType') {
                    $('#remarks').focus();
                } else if ($(this).attr("id") == 'remarks') {
                    $('#parkingID').focus();
                    // $scope.webFileUpload();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    $('#edirCarSubmitBtn').submit();
                }
            } else if ($state.current.name == 'app.addCar') {
                if ($(this).attr("id") == 'parkingID') {
                    if ($rootScope.$user && $rootScope.$user.accountID && $rootScope.$user.accountID.timeZone == 'Asia/Dubai')
                        $('#emirates').focus();
                    else
                        $('#plateNumber').focus();
                } else if ($(this).attr("id") == 'emirates') {
                    $('#alphaCode').focus();
                } else if ($(this).attr("id") == 'alphaCode') {
                    $('#plateNumber').focus();

                }  else if ($(this).attr("id") == 'plateNumber') {
                    if ($rootScope.$user.role == 'manager') {
                        $('#multipleVenueIDs').focus();
                    }
                    if ($rootScope.$user.role == 'accountadmin') {
                        $('#multipleVenueIDsforAccountAdmin').focus();
                    }
                    if ($rootScope.$user.role == 'chauffeur') {
                        var result = document.getElementById("parkingZone123214");
                        var uiSelect = angular.element(result).controller('uiSelect');
                        // uiSelect.activate();
                        uiSelect.focusser[0].focus();
                    }
                    if ($rootScope.$user.role == 'driver') {
                        if ($rootScope.parkingZones.length > 0) {
                            var result = document.getElementById("parkingZone123214");
                            var uiSelect = angular.element(result).controller('uiSelect');
                            uiSelect.focusser[0].focus();
                        } else
                            $('#parkingZone123214').focus();
                    }
                } else if ($(this).attr("id") == 'multipleVenueIDs') {
                    // $('#parkingZone123213').focus();
                    var result = document.getElementById("parkingZone123214");
                    var uiSelect = angular.element(result).controller('uiSelect');
                    // uiSelect.activate();
                    uiSelect.focusser[0].focus();

                } else if ($(this).attr("id") == 'multipleVenueIDsforAccountAdmin') {
                    var result = document.getElementById("parkingZone123214");
                    var uiSelect = angular.element(result).controller('uiSelect');
                    if (uiSelect)
                        uiSelect.focusser[0].focus();
                    else
                        $('#parkingZone123214').focus();
                } else if ($(this).attr("id") == 'parkingZone123214') {
                    if ($rootScope.$user.role != 'chauffeur' && $rootScope.$user.role != 'driver') {
                        $('#notDriverChauffeur').focus();
                    }
                    if ($rootScope.$user.role == 'chauffeur') {
                        $('#chauffeur').focus();
                    }
                    if ($rootScope.$user.role == 'driver') {
                        $('#carBrand2').focus();
                    }
                } else if ($(this).attr("id") == 'chauffeur') {
                    $('#carBrand2').focus();
                } else if ($(this).attr("id") == 'notDriverChauffeur') {
                    $('#carBrand2').focus();
                } else if ($(this).attr("id") == 'carBrand2') {
                    if ($rootScope.selectedVenueSettings.carModalName)
                        $('#carModel').focus();
                    else
                        $('#carColor').focus();
                } else if ($(this).attr("id") == 'carModel') {
                    $('#carColor').focus();
                }else if ($(this).attr("id") == 'carColor') {
                    $('#customerType').focus();
                } else if ($(this).attr("id") == 'customerType') {
                    $('#remarks').focus();
                } else if ($(this).attr("id") == 'remarks') {
                    $('#parkingID').focus();
                    // $scope.webFileUpload();
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    $scope.webFileUpload();
                }
            }

            if ($(this).attr("id") == 'searchPlateTicketNumber') {
                // $timeout(()=>{

                // }, 100);
                // alert("general---------" + $scope.searchCars)
                if ($scope.searchCars != "" && $scope.searchCars != " ") {
                    // alert("1")
                    // e.preventDefault();
                    // e.stopImmediatePropagation();         
                    // console.log("\n\n\n\n\n >>>>>" + $scope.searchCars)       
                    var ____temp = [];
                    var ____temp1 = [];
                    if ($scope.firstParkingID) {
                        ____temp = _.filter($rootScope.parkedCar, (o) => {
                            // console.log(o.parkingID)
                            return o.parkingID.toUpperCase() == $scope.firstParkingID.toUpperCase();
                        });
                        ____temp1 = _.filter($rootScope.requestedCar, (o) => {
                            // console.log(o.parkingID +  "  >>>>>>>>") 
                            return o.parkingID.toUpperCase() == $scope.firstParkingID.toUpperCase();
                        });
                        ____temp2 = _.filter($rootScope.completedCar, (o) => {
                            // console.log(o.parkingID +  "  >>>>>>>>") 
                            return o.parkingID.toUpperCase() == $scope.firstParkingID.toUpperCase();
                        });
                        // console.log($scope.searchCars.toUpperCase() + '---->>>>>>>>>>>' +____temp );
                        // console.log($scope.searchCars.toUpperCase() + '----<<<<<<<<<<<' +____temp1 );
                        if (____temp.length > 0 && $scope.activeTabs[0]) {
                            if (____temp[0].status == 'parked')
                                $('#ID' + ($scope.firstParkingID).toUpperCase()).click();
                        }
                        if (____temp1.length > 0 && $scope.activeTabs[1]) {
                            if (____temp1[0].status == 'requested')
                                $('#IDrequested' + ($scope.firstParkingID).toUpperCase()).click();
                            if (____temp1[0].status == 'accept')
                                $('#IDaccept' + ($scope.firstParkingID).toUpperCase()).click();
                        }

                        if (____temp2.length > 0 && $scope.activeTabs[2])
                            $('#IDrevalidate' + ($scope.firstParkingID).toUpperCase()).click();

                        $scope.firstParkingID = "";
                    } else {
                        // alert("2")
                        _.filter($rootScope.parkedCar, (o) => {
                            $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                            return o.parkingID;
                        });
                        _.filter($rootScope.requestedCar, (o) => {
                            $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                            $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                            return o.parkingID;
                        });
                        _.filter($rootScope.completedCar, (o) => {
                            $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                            return o.parkingID;
                        });
                    }
                    // $('#ID' + $scope.searchCars.toUpperCase()).css("background-color", "#7ac61c");
                } else {
                    // alert("333")
                    _.filter($rootScope.parkedCar, (o) => {
                        $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        return o.parkingID;
                    });
                    _.filter($rootScope.requestedCar, (o) => {
                        $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        return o.parkingID;
                    });
                    _.filter($rootScope.completedCar, (o) => {
                        $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        return o.parkingID;
                    });
                }
            }

        }
    });

    /* car parking fee validation */
    $scope.getCarInfo = function(ticketorPlateNumber) {
        var _res = parkingService.getCarInfo(ticketorPlateNumber);
        _res.then(function(data) {
            if (data && data.venue) {
                if ((data.venue.id == $rootScope.$user.venues[0].id)) {
                    if (data.venue.twoLevelValidation) {
                        $scope.carInformation = data;
                    } else {
                        notificationService.errorNotify("Location doesn't enabled outlet validation yet. Please contact your admin.");
                        $scope.carInformation = undefined;
                    }
                } else {
                    notificationService.errorNotify("You have no rights to validate other location car. Please contact your admin.");
                    $scope.carInformation = undefined;
                }
            } else {
                notificationService.errorNotify("No car found. Please contact your admin.");
                $scope.carInformation = undefined;
                // $scope.ticketorPlateNumber = '';
            }

        });
    }

    $scope.clearforValidatorsearch = function() {
        $scope.carInformation = undefined;
        $scope.ticketorPlateNumber = '';
    }

    $scope.validatedByValidator = function(carInformation) {
        if (!carInformation.validatedBy) {
            var _res = parkingService.validatedByValidator(carInformation);
            _res.then(function(data) {
                $scope.carInformation = undefined;
                $scope.ticketorPlateNumber = '';
                notificationService.successNotify('Ticket validated successfully...', 5000);
            });
        } else {
            notificationService.errorNotify('Ticket already validated. Kindly check your ticket number...', 5000);
            $scope.carInformation = undefined;
            // $scope.ticketorPlateNumber = '';
        }
    }
    $scope.validatedByCashier = function(car, imgDocumnet) {
        // console.log("---ctrl----" + JSON.stringify(imgDocumnet));
        $rootScope.loadRunner = true;
        if (imgDocumnet && imgDocumnet.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < imgDocumnet.length) {
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: imgDocumnet[img],
                        params: {
                            filename: imgDocumnet[img].name,
                            file: imgDocumnet[img]
                        }
                    }).success(function(data) {
                        if (!car.documents)
                            car.documents = [];
                        car.documents.push(imgDocumnet[img].name);
                        img++;
                        imageUpload(img);
                    });
                } else
                    validateFunction();
            }
        } else
            validateFunction();

        function validateFunction() {
            if (car.billPrint && car.fees > 0) {
                $http.post($rootScope.ipAddress + '/requestcar/venueWiseBillNumberUser', { venueID: car.venue.id })
                    .success(function(data) {
                        //    console.log(JSON.stringify(data));
                        var input = data.newBillNumber;
                        var pad = 0;
                        var len = 4;
                        input = input.toString();
                        if (input.length >= len)
                            console.log(input);
                        else {
                            pad = (pad || 0).toString();
                            data.newBillNumber = new Array(1 + len - input.length).join(pad) + input;
                            // console.log(data.newBillNumber);
                        }
                        car.bill = (car.venue.short ? car.venue.short : '') + data.newBillNumber;
                        eventuallyCall();
                        // call print
                    });
            } else
                eventuallyCall();


            function eventuallyCall() {
                var _res = parkingService.validatedByCashier(car);
                _res.then(function(data) {
                    if (car.billPrint && car.fees > 0) {
                        $http.get($rootScope.ipAddress + '/dailytransactional/' + car.id + "?populate=venue")
                            .success(function(dataisthere) {
                                // call print
                                parkingService.printBillGlobal('guestPrint', dataisthere);
                                parkingService.printBillGlobal('chauffeurPrint', dataisthere);
                            });
                    }

                    $('.modal').modal('hide');
                    $timeout(() => {
                        $rootScope.loadRunner = false;
                        $scope.searchCars = '';
                        $('#searchPlateTicketNumber').focus();
                        $('#searchPlateTicketNumber').val('');
                        $("#ID" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9"); // 
                        // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
                        $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                        $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                        $scope.close();
                    }, 1000);
                });
            }
        }
    }

    $scope.revalidate = function(car, imgDocumnet) {
        if (imgDocumnet && imgDocumnet.length > 0) {
            imageUpload(0);

            function imageUpload(img) {
                if (img < imgDocumnet.length) {
                    Upload.upload({
                        url: $rootScope.ipAddress + '/venue/UploadVenueLogo', //S3 upload url including bucket name
                        file: imgDocumnet[img],
                        params: {
                            filename: imgDocumnet[img].name,
                            file: imgDocumnet[img]
                        }
                    }).success(function(data) {
                        if (!car.documents)
                            car.documents = [];
                        car.documents.push(imgDocumnet[img].name);
                        img++;
                        imageUpload(img);
                    });
                } else
                    validateFunction();
            }
        } else
            validateFunction();

        function validateFunction() {
            if (car.billPrint && car.newfees > 0) {
                if (!car.bill) {
                    $http.get($rootScope.ipAddress + '/mastertransactional/' + car.id + "?populate=null")
                        .success(function(dataisthere) {
                            if (dataisthere.bill) {
                                callAfter(); // already bill is available!!!!!!!!!1
                                // // call print
                                // parkingService.printBillGlobal('guestPrint',car);
                                // parkingService.printBillGlobal('chauffeurPrint',car); 
                            } else {
                                $http.post($rootScope.ipAddress + '/requestcar/venueWiseBillNumberUser', { venueID: car.venue.id })
                                    .success(function(data) {
                                        //    console.log(JSON.stringify(data));
                                        var input = data.newBillNumber;
                                        var pad = 0;
                                        var len = 4;
                                        input = input.toString();
                                        if (input.length >= len)
                                            console.log(input);
                                        else {
                                            pad = (pad || 0).toString();
                                            data.newBillNumber = new Array(1 + len - input.length).join(pad) + input;
                                            // console.log(data.newBillNumber);
                                        }
                                        car.bill = (car.venue.short ? car.venue.short : '') + data.newBillNumber;
                                        callAfter();
                                        // call print
                                        // parkingService.printBillGlobal('guestPrint',car);
                                        // parkingService.printBillGlobal('chauffeurPrint',car); 
                                    });
                            }
                        });
                } else {
                    callAfter(); // already bill is available!!!!!!!!!1
                    // call print
                    // parkingService.printBillGlobal('guestPrint',car);
                    // parkingService.printBillGlobal('chauffeurPrint',car); 
                }
            } else
                callAfter();

            function callAfter() {
                var _res = parkingService.revalidate(car);
                _res.then(function(data) {

                    if (car.billPrint && car.newfees > 0) {
                        $http.get($rootScope.ipAddress + '/mastertransactional/' + car.id + "?populate=venue")
                            .success(function(dataisthere) {
                                // call print
                                parkingService.printBillGlobal('guestPrint', dataisthere);
                                parkingService.printBillGlobal('chauffeurPrint', dataisthere);
                            });
                    }

                    $('.modal').modal('hide');
                    $timeout(() => {
                        $scope.searchCars = '';
                        $('#searchPlateTicketNumber').focus();
                        $('#searchPlateTicketNumber').val('');
                        $("#ID" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9"); // 
                        // console.log(car.parkingID+"<<car.parkingID after highlight removed>>");
                        $("#IDrequested" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                        $('#IDaccept' + (car.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
                        $("#IDrevalidate" + car.parkingID.toUpperCase()).css("background-color", "#1a7bb9");
                        $scope.close();
                    }, 1000);
                });
            }
        }
    }

    $scope.clearFunctionforSearch = function() {
        $scope.searchCars = '';
        $scope.firstParkingID = "";
        $('#searchPlateTicketNumber').focus();
        $('#searchPlateTicketNumber').val('');
        _.filter($rootScope.parkedCar, (o) => {
            $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            return o.parkingID;
        });
        _.filter($rootScope.requestedCar, (o) => {
            $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            return o.parkingID;
        });
        _.filter($rootScope.completedCar, (o) => {
            $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            return o.parkingID;
        });
        if ($scope.activeTabs[0]) {
            $rootScope.parkedCar = [];
            parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', '', $rootScope.$user.venues);
        }
        if ($scope.activeTabs[1]) {
            $rootScope.requestedCar = [];
            parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', '', $rootScope.$user.venues);
        }
        if ($scope.activeTabs[2]) {
            $rootScope.completedCar = [];
            parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', '', $rootScope.$user.venues);
        }
    }

    $scope.clearFunctionforSearch2 = function() {
        $scope.searchCars = '';
        $scope.firstParkingID = "";
        $scope.selectedOptionsforanAnalysis.venue = {};
        $('#searchPlateTicketNumber').focus();
        $('#searchPlateTicketNumber').val('');
        _.filter($rootScope.parkedCar, (o) => {
            $('#ID' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            return o.parkingID;
        });
        _.filter($rootScope.requestedCar, (o) => {
            $('#IDrequested' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            $('#IDaccept' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            return o.parkingID;
        });
        _.filter($rootScope.completedCar, (o) => {
            $('#IDrevalidate' + (o.parkingID).toUpperCase()).css("background-color", "#1a7bb9");
            return o.parkingID;
        });
        if ($scope.activeTabs[0]) {
            $rootScope.parkedCar = [];
            parkingService.loadMoreCar($rootScope.parkedCar.length, 'parked', '', $rootScope.$user.venues);
        }
        if ($scope.activeTabs[1]) {
            $rootScope.requestedCar = [];
            parkingService.loadMoreCar($rootScope.requestedCar.length, 'requested', '', $rootScope.$user.venues);
        }
        if ($scope.activeTabs[2]) {
            $rootScope.completedCar = [];
            parkingService.loadMoreCar($rootScope.completedCar.length, 'complete', '', $rootScope.$user.venues);
        }
    }


    $scope.dtOptions = DTOptionsBuilder.newOptions()
        .withOption('scrollX', '100%')
        .withDOM('<"html5buttons"B>lTfgitp')
        .withButtons([
            //    { extend: 'copy' },          
            //    { extend: 'csv' },      
            //    { extend: 'excel', title: 'ExampleFile' },
            //    { extend: 'pdf', title: 'ExampleFile' },
            //    { extend: 'print',
            //    customize: function(win) {      
            //         $(win.document.body).addClass('white-bg');                   
            //         $(win.document.body).css('font-size', '10px');                    
            //         $(win.document.body).find('table')                 
            //         .addClass('compact')      
            //         .css('font-size', 'inherit');           
            //     }  
            // }        
        ]);




    $scope.openPrintSettingModal = function() {
        $('#printSetting').modal('show');
    }


    $scope.printerIp = JSON.parse(localStorage.getItem('ls.printerIP'));
    $scope.savePrinterIp = function(ip) {
        parkingService.savePrinterIp(ip);
        $('.modal').modal('hide');
    }


    /* Printer function below*/
    $scope.printTicketorBill = function(printType, carData) {
        if (carData.bill) {
            parkingService.printBillGlobal(printType, carData);
        } else {
            if (carData.status == 'requested' || carData.status == 'accept') {
                // daildy
                // master 
                // get new and update  both 
                $http.get($rootScope.ipAddress + '/dailytransactional/' + carData.id + "?populate=null")
                    .success(function(dataisthere) {
                        if (dataisthere.bill) {
                            carData.bill = dataisthere.bill;
                            parkingService.printBillGlobal(printType, carData);
                        } else
                            generateBill();
                    });

                function generateBill() {
                    $http.post($rootScope.ipAddress + '/requestcar/venueWiseBillNumberUser', { venueID: carData.venue.id })
                        .success(function(data) {
                            //    console.log(JSON.stringify(data));
                            var input = data.newBillNumber;
                            var pad = 0;
                            var len = 4;
                            input = input.toString();
                            if (input.length >= len)
                                console.log(input);
                            else {
                                pad = (pad || 0).toString();
                                data.newBillNumber = new Array(1 + len - input.length).join(pad) + input;
                                // console.log(data.newBillNumber);
                            }
                            carData.bill = (carData.venue.short ? carData.venue.short : '') + data.newBillNumber;

                            $http.post($rootScope.ipAddress + '/file/updateBillNumertoTransaction', { id: carData.id, modalName: 'both', bill: carData.bill });
                            // call print
                            parkingService.printBillGlobal(printType, carData);
                        });
                }
            } else if (carData.status == 'completed' || carData.status == 'complete') {
                // master 
                $http.get($rootScope.ipAddress + '/mastertransactional/' + carData.id + "?populate=null")
                    .success(function(dataisthere) {
                        if (dataisthere.bill) {
                            carData.bill = dataisthere.bill;
                            parkingService.printBillGlobal(printType, carData);
                        } else
                            billExists();
                    });

                function billExists() {
                    $http.post($rootScope.ipAddress + '/requestcar/venueWiseBillNumberUser', { venueID: carData.venue.id })
                        .success(function(data) {
                            //    console.log(JSON.stringify(data));
                            var input = data.newBillNumber;
                            var pad = 0;
                            var len = 4;
                            input = input.toString();
                            if (input.length >= len)
                                console.log(input);
                            else {
                                pad = (pad || 0).toString();
                                data.newBillNumber = new Array(1 + len - input.length).join(pad) + input;
                                // console.log(data.newBillNumber);
                            }
                            carData.bill = (carData.venue.short ? carData.venue.short : '') + data.newBillNumber;

                            $http.post($rootScope.ipAddress + '/file/updateBillNumertoTransaction', { id: carData.id, modalName: 'master', bill: carData.bill });
                            // call print
                            parkingService.printBillGlobal(printType, carData);
                        });
                }
            }
        }
    }

    $rootScope.sendPrintObject = function() {
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
                alert("Callback function Error" + JSON.stringify(err));
                $('.modal').modal('hide');
                $('#printSetting').modal('show');
            }
            // console.log($rootScope.printer.toString());
        epos.send($rootScope.printer.toString());
    }

    $scope.calculateDuration = function(createdAt, updatedAt) {
        var startTime = moment.utc(createdAt);
        var endTime = moment.utc(updatedAt);
        var duration = moment.duration(endTime.diff(startTime));
        var hours = parseInt(duration.asHours());
        var minutes = parseInt(duration.asMinutes()) - hours * 60;
        return hours + ':' + minutes + '';
    }


    $scope.total = 0;
    $scope.currentPage = 1;
    $scope.pageSize = 10;
    $rootScope.searchQuery = '';

    $scope.enterKeyFun = function(num, q, SelectedVenueName, selectedParameter, $event) {
        if ($event && $event.keyCode == 13) {
            $rootScope.searchQuery = q;
            $scope.currentPage = num;
            $scope.getReportforOscarwithPagination(SelectedVenueName, q, num, selectedParameter);
        }
    }

    $scope.clearSearchedReport = function(newPageNumber, q, SelectedVenueName, selectedParameter) {
        $rootScope.searchQuery = '';
        $scope.getReportforOscarwithPagination(SelectedVenueName, $rootScope.searchQuery, newPageNumber, selectedParameter);
    }

    $scope.pageChangeHandler = function(num, q, SelectedVenueName, selectedParameter) {
        $scope.currentPage = num;
        $scope.getReportforOscarwithPagination(SelectedVenueName, $rootScope.searchQuery, num, selectedParameter);
    };

    $scope.getReportforOscarwithPagination = function(selectedVenue, search, page, selectedParameter) {
        if ($rootScope.$user.role == 'accountinguser' || $rootScope.$user.role == 'chauffeur')
            selectedVenue = $rootScope.$user.venues[0].id;
        $rootScope.selectedFromDate = $scope.daterange.startDate;
        $rootScope.selectedToDate = $scope.daterange.endDate;

        $scope.reportDetail.fromDate = new Date($scope.daterange.startDate).getTime();
        $rootScope.selectedFromDate = $rootScope.fromDate;
        $rootScope.selectedToDate = $rootScope.toDate;
        $scope.reportDetail.toDate =  new Date($scope.daterange.endDate).getTime() // new Date($scope.daterange.endDate).getTime()


        $rootScope.venueName = selectedVenue;
        $rootScope.SelectedVenueName = selectedVenue;
        $scope.reportBtn = true;
        // parkingService.getReport($scope.reportDetail, selectedVenue);

        $rootScope.reportno = "Loading Record...";
        if (selectedVenue == undefined || selectedVenue == null || selectedVenue == '')
            selectedVenue = 'All';
        $rootScope.loadRunner = true;
        var filterstarttime = new Date($scope.reportDetail.fromDate) //.getTime();
        var filterendtime = new Date($scope.reportDetail.toDate) //.getTime();
        var venueIDs = $rootScope.$user.venues;
        $rootScope.skip = page ? (page - 1) * 10 : 0;
        var newD = new Date(($scope.reportDetail.toDate) + 86400000).getTime();
        var post = {
            fromDate: moment(filterstarttime).format('YYYY-MM-DD'), //reportDetail.fromDate,
            toDate: moment(filterendtime).format('YYYY-MM-DD'), //newD,
            venueID: selectedVenue,
            role: 'accountadmin', //$rootScope.$user.role,
            accountID: $rootScope.$user.accountID.id,
            skip: page ? (page - 1) * 10 : 0,
            limit: 10,
            search: search
        }
        if (search != '' && search != null) {
            post['query'] = selectedParameter;
        }

        $http.post($rootScope.ipAddress + '/dailytransactional/getReportforOscarwithPagination', post)
            .success(function(data) {
                $rootScope.loadRunner = false;
                if (data) {
                    $rootScope.showButton = true;
                    $rootScope.reports = [];
                    if ($rootScope.$user.accountID.id == "5a063bc79f8caede0a58fd39") {
                        $rootScope.reports = data.data || [];
                        $rootScope.notOscarVerion = false;
                        $rootScope.reportno = "No Record Found ";
                    } else {
                        downloadService.convertDatatoExcelView(data.data);
                        $rootScope.notOscarVerion = true;
                    }
                    $scope.total = data.length;

                    if (data.length == 0 && $rootScope.searchQuery != '') {
                        notificationService.errorNotify('Search keyword ' + $rootScope.searchQuery.toUpperCase() + " is not found ", 5000);
                        $rootScope.searchQuery = '';
                    }

                    $rootScope.reportsWidget = {};
                    $rootScope.reportsWidget['parked'] = data.parked;
                    $rootScope.reportsWidget['requested'] = data.requested;

                    $rootScope.reportsWidget['accept'] = data.accepted;
                    $rootScope.reportsWidget['completed'] = data.complete;

                } else {
                    $rootScope.showButton = false;
                }
            });
    }

    $scope.checkCompletedHoursLessthanDefinedHour = function(car) {
        if (car.status == 'completed' || car.status == 'complete') {
            if (parseInt(moment.duration(moment().diff(moment(car.log[car.log.length - 1].at))).asHours()) == 0) return true;
            else return ($rootScope.$user.role == 'accountadmin') ? true : false;
        } else return false;
    }

    // Search plate number input box
    $scope.focusFun = function() {
        $('#searchPlateTicketNumber').focus();
    }

    $scope.tableView = false;
    $scope.gridView = true;
    $scope.tableView0 = false;
    $scope.gridView0 = true;
    $scope.tableView1 = false;
    $scope.gridView1 = true;

    $scope.viewToggle = function(viewType) {
        if (viewType == 'table') {
            $scope.tableView = true;
            $scope.gridView = false;
            localStorageService.set("tableView", true);
            localStorageService.set("gridView", false);
        }
        if (viewType == 'grid') {
            $scope.tableView = false;
            $scope.gridView = true;
            localStorageService.set("tableView", false);
            localStorageService.set("gridView", true);
        }
    }

    $scope.viewToggleLS = function(index, viewType) {
        if (index == 0 ) {
            $scope.tableView0 = (viewType == 'table' ? true : false);
            $scope.gridView0 = (viewType != 'table' ? true : false);;
            localStorageService.set("tableView0", (viewType == 'table' ? true : false));
            localStorageService.set("gridView0", (viewType != 'table' ? true : false));
        }
        if (index == 1) {
            $scope.tableView1 = (viewType == 'table' ? true : false);;
            $scope.gridView1 = (viewType != 'table' ? true : false);;
            localStorageService.set("tableView1", (viewType == 'table' ? true : false));
            localStorageService.set("gridView1", (viewType != 'table' ? true : false));
        }
    }

    if (localStorage.getItem('ls.tableView') && localStorage.getItem('ls.gridView')) {
        $scope.tableView = JSON.parse(localStorage.getItem('ls.tableView'));
        $scope.gridView = JSON.parse(localStorage.getItem('ls.gridView'));
    } else {
        $scope.tableView = false;
        $scope.gridView = true;
        localStorageService.set("tableView", false);
        localStorageService.set("gridView", true);
    }

    if (localStorage.getItem('ls.tableView1') && localStorage.getItem('ls.gridView1')) {
        $scope.tableView1 = JSON.parse(localStorage.getItem('ls.tableView1'));
        $scope.gridView1 = JSON.parse(localStorage.getItem('ls.gridView1'));
    } else {
        $scope.tableView1 = false;
        $scope.gridView1 = true;
        localStorageService.set("tableView1", false);
        localStorageService.set("gridView1", true);
    }

    if (localStorage.getItem('ls.tableView0') && localStorage.getItem('ls.gridView0')) {
        $scope.tableView0 = JSON.parse(localStorage.getItem('ls.tableView0'));
        $scope.gridView0 = JSON.parse(localStorage.getItem('ls.gridView0'));
    } else {
        $scope.tableView0 = false;
        $scope.gridView0 = true;
        localStorageService.set("tableView0", false);
        localStorageService.set("gridView0", true);
    }

    $scope.dailyReportData={
        location:'',
        guestType:'',
        date:new Date(),
        startTime:'00:00',
        endTime:'23:59'
    }

    $scope.currentPageforDailyReport = 1;
    $rootScope.totalRecord = 0;
    $scope.dailyReportPageSize = 10;

    $scope.changeWhenPageNumberClick = function(newPageNumber){
        $scope.currentPageforDailyReport = newPageNumber;
        $scope.dailyReportData.page = $scope.currentPageforDailyReport;
        parkingService.getDailyReport($scope.dailyReportData);
    }

    $scope.getDailyReport=function(type){
        if ($scope.dailyReportData.location == null || $scope.dailyReportData.location == undefined || $scope.dailyReportData.location=='')
            $scope.dailyReportData['location'] = 'All';
        if (type =='checkin'){
            $rootScope.checkinLoader = true;
            $scope.dailyReportData['status'] = 'parked';
        }    
        if (type == 'checkout'){
            $rootScope.checkoutLoader = true;
            $scope.dailyReportData['status'] = 'complete';
        }            
        if($rootScope.$user.role == 'accountinguser' || $rootScope.$user.role == 'chauffeur'){
            $scope.dailyReportData['location']  = $rootScope.selectedOptionsforanAnalysis.venue.id;
        }
        $scope.dailyReportData.page = $scope.currentPageforDailyReport;
        var _res = parkingService.getDailyReport($scope.dailyReportData);
        _res.then(function(data){
            $scope.showChart = $scope.dailyReportData.status;
            $rootScope.checkoutLoader = false;
            $rootScope.checkinLoader = false;    
            $rootScope.loadRunner=false;      
        })
    } 

    $scope.downloadDailyReport=function(type, sendEmail, email){
        if($rootScope.$user.role == 'accountinguser' || $rootScope.$user.role == 'chauffeur'){
            $scope.dailyReportData['location']  = $rootScope.selectedOptionsforanAnalysis.venue.id;
        }
        $rootScope.downloadLoader = true;
        parkingService.downloadDailyReport($scope.dailyReportData, sendEmail ,email);
        
    }

    $scope.getVenueNamebyID = function(location){
        if(location != 'All'){
            if ($rootScope.$user.role == 'accountadmin') {
                 return _.filter($rootScope.accountVenuesofAccountAdmin, (venue)=>{
                     return venue.id == location;
                 })[0].venueName;
            } else 
                return $rootScope.selectedOptionsforanAnalysis.venue.venueName;
        } else 
            return 'All';
    }
    
    $rootScope.dailyReportDataforChart = {
        data : [],
        lables : []
    }
   
});
app.factory('analyticsService', function($http, $rootScope, $state, notificationService, $q) {
    return {
        getYearMonthTodayRecords: function(type, year, month, chartData) {
            $rootScope.loadRunner = true;
            if ($rootScope.$user && $rootScope.$user.accountID) {
                var firstDay = new Date(year, month, 1);
                var lastDay = new Date(year, month + 1, 0);
                firstDay = moment(firstDay).format("YYYY-MM-DD")
                lastDay = moment(lastDay).format("YYYY-MM-DD")
                    // console.log({ fromDate : firstDay, toDate : lastDay })
                return $http.post($rootScope.ipAddress + '/dailytransactional/getYearMonthTodayRecords/', { accountID: $rootScope.$user.accountID.id, fromDate: firstDay, toDate: lastDay }).then(function(data) {
                    $rootScope.loadRunner = false;
                    return data.data;
                });
            } else {
                $rootScope.loadRunner = false;
                return $q.defer().promise;
            }
        },
        getTodayAnalyticsforanAccount: function() {
            $rootScope.loadRunner = true;
            if ($rootScope.$user && $rootScope.$user.accountID) {
                return $http.post($rootScope.ipAddress + '/dailytransactional/getTodayAnalyticsforanAccount/', { accountID: $rootScope.$user.accountID.id }).then(function(data) {
                    $rootScope.loadRunner = false;
                    return data.data;
                });
            } else {
                $rootScope.loadRunner = false;
                return $q.defer().promise;
            }
        },
        getAccountAnalyticsData: function() {
            $rootScope.loadRunner = true;
            if ($rootScope.$user && $rootScope.$user.accountID) {
                return $http.post($rootScope.ipAddress + '/dailytransactional/getAccountAnalyticsData/', { accountID: $rootScope.$user.accountID.id }).then(function(data) {
                    $rootScope.loadRunner = false;
                    return data.data;
                });
            } else {
                $rootScope.loadRunner = false;
                return $q.defer().promise;
            }
        },
        ///////////////////////////
        getYearMonthTodayRecordsVenue: function(type, year, month, chartData) {
            $rootScope.loadRunner = true;
            if ($rootScope.$user && $rootScope.$user.accountID && $rootScope.selectedOptionsforanAnalysis && $rootScope.selectedOptionsforanAnalysis.venue) {
                var firstDay = new Date(year, month, 1);
                var lastDay = new Date(year, month + 1, 0);
                firstDay = moment(firstDay).format("YYYY-MM-DD")
                lastDay = moment(lastDay).format("YYYY-MM-DD")
                    // console.log({ fromDate : firstDay, toDate : lastDay })
                return $http.post($rootScope.ipAddress + '/dailytransactional/getYearMonthTodayRecordsVenue/', { accountID: $rootScope.$user.accountID.id, fromDate: firstDay, toDate: lastDay, venueID: $rootScope.selectedOptionsforanAnalysis.venue.id }).then(function(data) {
                    $rootScope.loadRunner = false;
                    return data.data;
                });
            } else {
                $rootScope.loadRunner = false;
                return $q.defer().promise;
            }
        },
        getTodayAnalyticsforaVenue: function() {
            $rootScope.loadRunner = true;
            if ($rootScope.$user && $rootScope.$user.accountID && $rootScope.selectedOptionsforanAnalysis && $rootScope.selectedOptionsforanAnalysis.venue) {
                return $http.post($rootScope.ipAddress + '/dailytransactional/getTodayAnalyticsforaVenue/', { accountID: $rootScope.$user.accountID.id, venueID: $rootScope.selectedOptionsforanAnalysis.venue.id }).then(function(data) {
                    $rootScope.loadRunner = false;
                    return data.data;
                });
            } else {
                $rootScope.loadRunner = false;
                return $q.defer().promise;
            }
        },
        getVenueAnalyticsData: function() {
            $rootScope.loadRunner = true;
            if ($rootScope.$user && $rootScope.$user.accountID && $rootScope.selectedOptionsforanAnalysis && $rootScope.selectedOptionsforanAnalysis.venue) {
                return $http.post($rootScope.ipAddress + '/dailytransactional/getVenueAnalyticsData/', { accountID: $rootScope.$user.accountID.id, venueID: $rootScope.selectedOptionsforanAnalysis.venue.id }).then(function(data) {
                    $rootScope.loadRunner = false;
                    return data.data;
                });
            } else {
                $rootScope.loadRunner = false;
                return $q.defer().promise;
            }
        },
    }
});
app.factory('ConnectivityMonitor', function($rootScope, parkingService, localStorageService, Auth, offlineDBService, $timeout, offlineLoginService) {
    return {
        startWatching: function() {
            window.addEventListener("online", function(e) {
                $rootScope.isOnline = true;
                if ($rootScope.$user) {
                    e.stopPropagation();
                    if (!$rootScope.onlineChecked) {
                        $rootScope.onlineChecked = true;
                        $rootScope.onlineSync = true;
                        // alert('user Found online');
                        // $rootScope.$apply();
                        $timeout(function() {
                            offlineDBService.onlineSync(function() {
                                $timeout(function() {
                                    // alert()
                                    // parkingService.getCarDetails($rootScope.$user.venues);
                                    //                                    offlineDBService.checkCarbulkInfoExists('EvaletzParkedCar', $rootScope.parkedCar)
                                    // offlineDBService.checkCarbulkInfoExists('EvaletzRequestedCar',  $rootscope.requestedCar)

                                    $rootScope.onlineChecked = false;
                                }, 1000);
                            });
                        }, 5000);
                    }
                    // parkingService.getCarDetails($rootScope.$user.venues);
                } else if (!$rootScope.$user) {
                    if (localStorage.getItem('ls.VPSUser') !== null) {
                        $rootScope.$user = JSON.parse(localStorage.getItem('ls.VPSUser'));
                        $rootScope.userLogin = Auth;
                        $rootScope.userLogin.isLoggedIn = true;
                        // console.log('' + JSON.stringify(($rootScope.$user)));
                        // alert('user Found online1111')
                        // parkingService.getCarDetails($rootScope.$user.venues);
                    }
                }
            }, false);

            window.addEventListener("offline", function(e) {
                $rootScope.isOnline = false;
                if ($rootScope.$user) {
                    // alert('user Found offline')
                    // parkingService.getCarDetails($rootScope.$user.venues);
                    $rootScope.$apply();
                    // offlineLoginService.gettingAccountVenuesWithUsers(function(venues) {
                    //     $rootScope.accountVenuesofAccountAdmin = venues;
                    // });
                } else if (!$rootScope.$user) {
                    if (localStorage.getItem('ls.VPSUser') !== null) {
                        $rootScope.$user = JSON.parse(localStorage.getItem('ls.VPSUser'));
                        $rootScope.userLogin = Auth;
                        $rootScope.userLogin.isLoggedIn = true;
                        // console.log('' + JSON.stringify(($rootScope.$user)));
                        // parkingService.getCarDetails($rootScope.$user.venues);
                        // alert('user Found offline 22')
                    }
                }
            }, false);
        }
    }
});
app.filter('fromNow', function($window) {
    return function(dateString) {
        return $window.moment(new Date(dateString)).fromNow()
    };
});
app.filter('tyday', function($filter) {
    return function(input, pattern) {
        input = new Date(input);
        if (input.getDate() > new Date().getDate()) {
            if (input.getDate() == (new Date().getDate() + 1))
                return 'Tomorrow';
            else
                return moment(input).format("DD-MM-YYYY");
        } else {
            if (input.getDate() == (new Date().getDate()))
                return "Today";
            else
                return moment(input).format("DD-MM-YYYY");
        }
    };
});
app.filter('specialRequestFilter', function($filter, $rootScope) {
    return function(input) {
        // return _.filter($rootScope.requestedCar, function(car) {
        //     if(car.status == 'requested'){
        //         if(car.log[1] && car.log[1].specialRequest && !car.log[1].specialRequest.accepted){
        //             return true;
        //         } else if(car.log[1] && car.log[1].specialRequest && car.log[1].specialRequest.accepted){
        //             var __duration = moment.duration(moment(moment(car.log[1].specialRequest.dateTime).format()).diff(moment().format())); // car.specialRequest.timeZone
        //             if(__duration.asMinutes() > 15)
        //                 return false;
        //             else 
        //                 return true;
        //         } else 
        //             return true;
        //     } else
        //         return false;
        // }).length;
        return _.filter($rootScope.requestedCar, function(car) {
            if (car.log.length > 0 && car.log[1] && car.log[1].specialRequest) {
                return true;
            } else
                return false;
        }).length;
    };
});
app.filter('momentCounter', function($filter, $rootScope) {
    return function(input) {
        function millisecondstoMMHHSS(millisec) {
            var seconds = (millisec / 1000).toFixed(0);
            var minutes = Math.floor(seconds / 60);
            var hours = "";
            if (minutes > 59) {
                hours = Math.floor(minutes / 60);
                hours = (hours >= 10) ? hours : "0" + hours;
                minutes = minutes - (hours * 60);
                minutes = (minutes >= 10) ? minutes : "0" + minutes;
            }

            seconds = Math.floor(seconds % 60);
            seconds = (seconds >= 10) ? seconds : "0" + seconds;
            if (hours != "") {
                return hours + ":" + minutes + ":" + seconds;
            }
            return "00:" + minutes + ":" + seconds;
        }
        if (input) {
            // console.log(moment().diff(input) + "=======================" + input + ">>>>>>>" + millisecondstoMMHHSS(moment().diff(input)))
            return Math.abs(moment().diff(input));
        } else
            return;
    };
});

function IDGenerator() {
    this.length = 6;
    this.timestamp = +new Date;

    var _getRandomInt = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    this.generate = function() {
        var ts = this.timestamp.toString();
        var parts = ts.split("").reverse();
        var id = "";

        for (var i = 0; i < this.length; ++i) {
            var index = _getRandomInt(0, parts.length - 1);
            id += parts[index];
        }
        return id;
    }
}

function downloadPNGFromAnyImageSrc(src) {
    //recreate the image with src recieved
    var img = new Image;
    //when image loaded (to know width and height)
    img.onload = function() {
        //drow image inside a canvas
        var canvas = convertImageToCanvas(img);
        //get image/png from convas
        var pngImage = convertCanvasToImage(canvas);
        //download
        var anchor = document.createElement('a');
        anchor.setAttribute('href', pngImage.src);
        anchor.setAttribute('download', new Date().getTime() + '.png');
        anchor.click();
    };

    img.src = src;


    // Converts image to canvas; returns new canvas element
    function convertImageToCanvas(image) {
        var canvas = document.createElement("canvas");
        canvas.width = image.width;
        canvas.height = image.height;
        canvas.getContext("2d").drawImage(image, 0, 0);
        return canvas;
    }


    // Converts canvas to an image
    function convertCanvasToImage(canvas) {
        var image = new Image();
        image.src = canvas.toDataURL("image/png");
        return image;
    }
}


app.filter('propsFilter', function() {
    return function(items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function(item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }

                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    };
});

app.directive('focus',
    function($timeout) {
        return {
            scope: {
                trigger: '@focus'
            },
            link: function(scope, element) {
                scope.$watch('trigger', function(value) {
                    if (value === "true") {
                        $timeout(function() {
                            element[0].focus();
                        });
                    }
                });
            }
        };
    });
app.directive('uiSelectOpened', function($timeout) {
    return {
        restrict: 'A',
        require: 'uiSelect',
        link: function(scope, element, attrs, uiSelect) {
            $timeout(() => uiSelect.toggle())
        }
    };
});

app.directive('updateOnEnter', function() {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attrs, ctrl) {
            element.on("keyup", function(ev) {
                if (ev.keyCode == 13) {
                    ctrl.$commitViewValue();
                    scope.$apply(ctrl.$setTouched);
                }
            });
        }
    }
});