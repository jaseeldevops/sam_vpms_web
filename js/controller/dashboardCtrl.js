app.controller('dashboardCtrl', function ($scope, $http, $stateParams, $rootScope,notificationService,$timeout, $state, ) {
    
    
    $scope.init=function(){   
        if ($rootScope.$user && $rootScope.$user.role == 'admin') {
            $http.get($rootScope.ipAddress + '/account/getRawAccountNameandID').success(function (data) {
               $scope.accountListforAdmin = data;
            }).error(function (err) {
                $rootScope.loadRunner = false;
            });
        }
    }
    $scope.init();
    $scope.selectedAccountforAdmin = {};
    $scope.carDataforAdminforAccount= function (type,selectedAccount) {
        $scope.adminDashboardNVD3={};
        var firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        var lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);
        firstDay = moment(firstDay).format("YYYY-MM-DD")
        lastDay = moment(lastDay).format("YYYY-MM-DD")

        var postData = { accountID: selectedAccount.id, fromDate: firstDay, toDate: lastDay };
        var _url = '';
        _url = $rootScope.ipAddress + '/dailytransactional/overAllAccountVenueWiseData/';
        $http.post(_url, postData).then(function (data) {
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
                                $scope.adminDashboardNVD3 = finalData;
                            }
                        }
                    }
                }
            }
        });
        
    }
    
    $scope.getAccountDashboardInfo = function (accountInfo) {
        $scope.dashboardDate = {
            date: new Date()
        };
        if (accountInfo){
            $scope.carDataforAdminforAccount('count', accountInfo);
            $scope.getDeviceInformation('All', new Date(), accountInfo);                     
            $http.post($rootScope.ipAddress + '/dailytransactional/dashboardDatum/', {
                accountID: accountInfo.id,
                date: moment().format("YYYY-MM-DD")
            }).then(function (data) {
                if (data.data.length > 0) {
                    $scope.dashboardDatumAdmin = data.data;
                    $http.post($rootScope.ipAddress + '/dailytransactional/accountAdminDashboardDatum/', {
                        accountID: accountInfo.id
                    }).then(function (data) {
                        if (data.data) {
                            $scope.dashboardDatumAdminforWidgets = data.data;
                        }

                    });
                }
            });
        }            
        
    }

    $scope.SelectedVenueNameforDeviceInfo={
        venue:''
    };

    $scope.dashboardDate = {
        date:new Date()
    };
    // '#F44336', '#E91E63', '#9C27B0', '#795548', '#607D8B', '#1B5E20'
    $scope.dashboardPieChartColors = ['#ff6384', '#1B5E20', '#F44336', '#9C27B0', '#ffcd56', '#36a2eb'];
    $scope.dashboardOptions = { legend: { display: true, position: 'right', fullWidth: false, labels: { fontSize: 15, fontColor: '#000'} },  };

    $scope.getDeviceInformation = function (venue, date, accountID) {
        $http.post($rootScope.ipAddress + '/dailytransactional/getDeviceInformationByAccountIDforAdmin',{
            date: moment(date).format("YYYY-MM-DD"),
            accountID: accountID.id,
            venueID: (venue && venue.id ? venue.id:"All")
        }).success(function (data) {
            $scope.pieDashboardData = _.values(data.devices);
            $scope.dashboardPieLabels=_.keys(data.devices);
        }).error(function (err) {
            $rootScope.loadRunner = false;
        });
    }


    $scope.clear = function ($event, $select) {
        $scope.SelectedVenueNameforDeviceInfo = {
            venue: ''
        };
        $event.stopPropagation();
        //to allow empty field, in order to force a selection remove the following line
        $select.selected = undefined;
        //reset search query
        $select.search = undefined;
        //focus and open dropdown
        // $select.activate();
    }

    $scope.getOnlineUsers = function(){
        $http.post($rootScope.ipAddress + '/user/getRoomsList').success(function (data) {
            $scope.onlineUsers = data.count;
        }).error(function (err) {
            $rootScope.loadRunner = false;
        });
    }
    
})