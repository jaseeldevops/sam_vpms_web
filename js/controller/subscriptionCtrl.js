app.controller('subscriptionCtrl', function($scope, $http, $state, $rootScope, $log, subscriptionService, notificationService, $stateParams, $timeout) {
    
    $scope.searchText = '';
    $rootScope.thisAccountLogDetails = {};
    $scope.clear = function() {
        $scope.subscriptionData = {
            subscriptionName: '',
            duration: '',
            price: '',
            numberOfCars: '',
            numberOfVenues: ''
        };
    }
   
    $scope.enableEditor = true;
    $scope.init = function() {
        subscriptionService.getSubscription();
    }
    $scope.clear();
    $scope.init();
    // $scope.btnDisabled = false;
    $scope.postSubscription = function(data, addSubscription) {    
        subscriptionService.postSubscription($scope.subscriptionData);
        $scope.clear();       
    }
    $scope.list = function(data) {
        $rootScope.thisSubscription = data;
        //$state.go('subscription_details');
    }
    $scope.saveEditedSubscripton = function(subscriptionData) {
        subscriptionService.saveEditedSubscripton(subscriptionData);
        $('.modal').modal('hide');
        // $scope.enableEditor = !$scope.enableEditor;        
    }
    $scope.deleteSubscription = function(subscriptionData) {
        // if (confirm('Do you really want to delete Subscription Data ?')) {
        //     var _res = subscriptionService.deleteSubscriptionService($rootScope.thisSubscription);
        //     _res.then(function(data) {
        //         subscriptionService.getSubscription();
        //         $scope.thisSubscription = {};
        //     })
        // }

        swal({
            title: "Are you sure?",
            text: "You will not be able to recover subscription data!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, delete it!",
            closeOnConfirm: false
        }, function() {
            var _res = subscriptionService.deleteSubscriptionService($rootScope.thisSubscription);
            _res.then(function(data) {
                subscriptionService.getSubscription();
                $rootScope.thisSubscription = {};
                swal("Deleted!", "Your subscription data has been deleted.", "success");
            })
        });
    }


    // if ($rootScope.$user.role == 'accountadmin') {
    //     $http.get($rootScope.ipAddress + '/account/find/' + $rootScope.$user.accountID.id).success(function(data) {
    //         $rootScope.accountadminData = data;
    //         // console.log('account' + JSON.stringify(data));
    //     }).error(function(err) {
    //         // notificationService.errorNotify('Unable to connect to server...');
    //     });

    // }

    // io.socket.on('subscription', function(obj) {

    //     if (obj.verb === 'created') {
    //         $scope.subscriptionDatas = [];
    //         $scope.$apply(function() {
    //             $log.info(obj);
    //             $scope.subscriptionDatas.push(obj.data);
    //             if ($rootScope.$user.role == 'admin'){
    //                 notificationService.successNotify(obj.data.subscriptionName + ' Edited Successfully..', 5000);
    //             }
    //         });
    //         obj.verb = "";
    //     }
    //     if (obj.verb === 'destroyed') {
    //         alert('destroyed' +$rootScope.$user.role);
    //         $scope.$apply(function() {
    //             $log.info(obj);
    //             for (var i = 0; i < $scope.subscriptionDatas.length; i++) {
    //                 if ($scope.subscriptionDatas[i].id == obj.id) {
    //                     $scope.subscriptionDatas.splice(i, 1);
    //                 }
    //             }
    //             if ($rootScope.$user.role == 'admin') {
    //                 notificationService.successNotify('Subscription Deleted Successfully..', 5000);
    //                 $state.go('app.SubscriptionList');
    //             }
    //         });

    //         obj.verb = "";

    //     }

    // });

    // io.socket.on('subscription', function(obj) {

    //     if (obj.verb === 'created') {
    //         $scope.subscriptionDatas = [];
    //         $scope.$apply(function() {
    //             $log.info(obj);
    //             $scope.subscriptionDatas.push(obj.data);
    //             if ($rootScope.$user.role == 'admin')
    //                 notificationService.successNotify(obj.data.subscriptionName + ' Edited Successfully..', 5000);
    //         });
    //         obj.verb = "";
    //     }
    //     if (obj.verb === 'destroyed') {
    //         // alert('destroyed');
    //         if ($rootScope.$user.role == 'admin') {
    //             notificationService.successNotify('Subscription Deleted Successfully..', 5000);
    //             $state.go('app.SubscriptionList');
    //         }
    //         // $scope.$apply(function() {
    //         //     $log.info(obj);
    //         //     for (var i = 0; i < $scope.subscriptionDatas.length; i++) {
    //         //         if ($scope.subscriptionDatas[i].id == obj.id) {
    //         //             $scope.subscriptionDatas.splice(i, 1);
    //         //         }
    //         //     }
    //         //     // alert($rootScope.$user.role);
    //         //     if ($rootScope.$user.role == 'admin') {
    //         //         alert('delete');
    //         //         $state.go('app.SubscriptionList');
    //         //         notificationService.successNotify('Subscription Deleted Successfully..', 5000);
    //         //     }

    //         // });

    //         obj.verb = "";

    //     }

    // });

    $scope.editButton = function() {
        $scope.enableEditor = !$scope.enableEditor;
    }

    /* subscription modal */
    // $scope.subscriptionData = {};
    $scope.openSubscriptionModal = function(formType, data) {
        $('#subscriptionAddModal').modal('show');
        $scope.formType = formType;
        $scope.tempData = data;  
        $scope.editSubscriptionData = $scope.tempData;
    }
    $scope.close = function() {
        $('.modal').modal('hide');
    }

});