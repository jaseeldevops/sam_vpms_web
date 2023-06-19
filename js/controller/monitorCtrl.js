app.controller('monitorCtrl', function($scope, $http, $rootScope, parkingService, notificationService, venueService, $window, $state, $timeout, loginService) {
    // $scope.checkDay = function(days) {
    //         console.log(days);
    //         var days = moment(days).days();

    //         return days;
    //     }
    /* Load more from server  */
    $scope.loadMoreCarInMonitor = function(carCount, carStatus, search) {
        if (carStatus == "requested") {
            parkingService.loadMoreCar(carCount, carStatus, '', $rootScope.$user.venues);

        }
    }

   

    $scope.tableViewMonit = false;
    $scope.gridViewMonit = true;
    $scope.viewToggleMonit = function (viewType) {
        if (viewType == 'table') {
            $scope.tableViewMonit = true;
            $scope.gridViewMonit = false;
            // localStorageService.set("tableView", true);
            // localStorageService.set("gridView", false);
        }
        if (viewType == 'grid') {
            $scope.tableViewMonit = false;
            $scope.gridViewMonit = true;
            // localStorageService.set("tableView", false);
            // localStorageService.set("gridView", true);
        }
    }

});