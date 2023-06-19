'use strict';
app.factory('supportService', function($http, $rootScope, $state, notificationService) {
    return {
        postFeedback: function(data) {
            $rootScope.loadRunner = true;
            if (data) {
                var postdata = {
                    type:data.type,
                    comments: data.comments,
                    email: $rootScope.$user.email,
                    accountName:$rootScope.$user.accountID.accountName,
                };

                $http.post($rootScope.ipAddress + '/dailytransactional/postFeedback/', postdata).success(function(data) {
                    console.log(JSON.stringify(postdata));
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Your query has been posted..', 5000);
                    $state.go('app.Settings');
                });
            }
        },
    }

});
