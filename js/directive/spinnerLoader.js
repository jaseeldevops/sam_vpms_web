/* Directives*/
 app.directive('loading', function () {
      return {
        restrict: 'E',
        replace:true,
        template: '<div class="loading ajax-loader"><img src="img/loading.gif" width="30" height="30" /></div>',
        link: function (rootScope, element, attr) {
              rootScope.$watch('loading', function (val) {
                  if (val)
                      $(element).show();
                  else
                      $(element).hide();
              });
        }
      }
  })
