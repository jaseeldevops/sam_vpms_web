'use strict';
app.factory('subscriptionService', function($http, $rootScope, $state, notificationService) {
    return {
        postSubscription: function(subscriptionData) {
            $rootScope.loadRunner = true;
            if (subscriptionData) {
                console.log(JSON.stringify(subscriptionData));
                var postdata = {
                    subscriptionName: subscriptionData.subscriptionName,
                    duration: subscriptionData.duration,
                    price: subscriptionData.price,
                    numberOfCars: subscriptionData.numberOfCars,
                    numberOfVenues: subscriptionData.numberOfVenues
                };

                $http.post($rootScope.ipAddress + '/subscription/createSubscriptonFromAPICall/', postdata).success(function(data) {
                    console.log('subscription data' + JSON.stringify(data));
                    $rootScope.subscriptionDatas.push(subscriptionData);
                    $('.modal').modal('hide');
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Subscription registered successfully..', 5000);
                    // $state.go('app.SubscriptionList');
                });
            }
        },
        getSubscription: function() {
            if($rootScope.$user && $rootScope.$user.role == 'admin'){
                $rootScope.loadRunner = true;
                $http.get($rootScope.ipAddress + '/subscription/find/').success(function(data) {
                    $rootScope.loadRunner = false;
                    $rootScope.subscriptionDatas = data;
                });
            }
        },
        saveEditedSubscripton: function(thisSubscription) {
            $rootScope.loadRunner = true;
            var postdata = {
                id: thisSubscription.id,
                subscriptionName: thisSubscription.subscriptionName,
                duration: thisSubscription.duration,
                price: thisSubscription.price,
                numberOfCars: thisSubscription.numberOfCars,
                numberOfVenues: thisSubscription.numberOfVenues
            };
            $http.post($rootScope.ipAddress + '/subscription/editSubscription/', postdata)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    //alert("successfully Edited...");
                    notificationService.successNotify('Subscription edited successfully..', 5000);
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    //alert('Try Again...');
                });
        },
        deleteSubscriptionService: function(thisSubscription) {
            $rootScope.loadRunner = true;
            var postdata = { id: thisSubscription.id };
            // console.log('delete subscription' + JSON.stringify(postdata));
            return $http.post($rootScope.ipAddress + '/subscription/deleteSubscription/', postdata).success(function(data) {
                $rootScope.loadRunner = false;
                notificationService.successNotify('Subscription deleted successfully..', 5000);
                // console.log("*******************************************************successfully deleted...");
                // $state.go('app.SubscriptionList');
                return data;
            }).error(function(data) {
                $rootScope.loadRunner = false;
                // console.log('error');
            });
        },
        // deleteSubscriptionService: function(thisSubscription) {

        //     var postdata = { id: thisSubscription.id };

        //     var res = $http.post($rootScope.ipAddress + '/subscription/deleteSubscription/', postdata);
        //     res.success(function(data) {
        //         notificationService.successNotify('Subscription Deleted Successfully..', 5000);
        //         console.log("*******************************************************successfully deleted...");
        //     });
        //     res.error(function(data) {
        //         console.log('error');
        //     });
        // },
    }

});