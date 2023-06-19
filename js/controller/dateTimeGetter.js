app.controller('dateTimeGetter', function($scope, $http, $timeout) {


    $scope.time = new Date();
    $scope.runTimer = function() {
        $scope.time = new Date();
        mytimer = $timeout($scope.runTimer, 1000);
    }
    var mytimer = $timeout($scope.runTimer, 1000);



});