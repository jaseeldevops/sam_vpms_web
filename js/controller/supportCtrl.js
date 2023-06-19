app.controller('supportCtrl', function($scope, $state, $rootScope, notificationService, supportService, $timeout, ionicMaterialMotion, ionicMaterialInk) {
    $scope.$parent.showHeader();
    $scope.$parent.clearFabs();
    $scope.isExpanded = true;
    $scope.$parent.setExpanded(true);
    $scope.$parent.setHeaderFab('right');

    if ($state.current.name == 'app.subscriptionDetails' || $state.current.name == 'app.AddSubscription') {
        $timeout(function() {
            ionicMaterialMotion.fadeSlideIn({
                selector: '.animate-fade-slide-in .item'
            });
        }, 500);
        ionicMaterialInk.displayEffect();
    }
    $scope.feedback = {
        type: '',
        comments: ''
    }
    $scope.postFeedback = function(data, supportForm) {
        $scope.supportForm = supportForm;
      $scope.supportForm.submitted = true;
        if (supportForm.$valid)
            supportService.postFeedback(data);
        else{
            // alert();
        }
    }

});
