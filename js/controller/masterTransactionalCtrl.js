app.controller('chauffeurCarRequest', function ($scope, $http){
    
    $scope.carDetails={};
    $scope.init=function (){  
        $http.get($rootScope.ipAddress+'/mastertransactional/find/').success(function(data){
                $scope.carDetails=data;
           }).error(function(err){alert("Err----"+JSON.stringify(err));});
    }
    $scope.init();

});

