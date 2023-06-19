var accountAdminCtrl = angular.module("oscar").controller("accountAdminCtrl", function($scope, $http) {

    $scope.accountadmin = [
        { accountadminname: "admin1" },
        { accountadminname: "admin2" },
        { accountadminname: "Kety" },
        { accountadminname: "Dubai1_admin3" },
        { accountadminname: "Dubai2_admin3" },
        { accountadminname: "john" },
        { accountadminname: "edward" },
    ];

    $scope.addAccountAdmin = function(accountadmin) {
        $scope.accountadmin.push(accountadmin);
        $scope.accountadmins = {};

    }



    $scope.removeAccountAdmin = function(index) {
        $scope.accountadmin.splice(index, 1);
    }


});