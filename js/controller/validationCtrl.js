app.controller('validationCtrl',function($scope){

    
    $scope.myCustomValidator = function(text){      
        return true;
    };

    $scope.submitMyForm = function(){
        alert("Form submitted");
    };

    $scope.passwordValidator = function(password) {

        if(!password){return;}
        
        if (password.length < 6) {
            return "Password must be at least " + 6 + " characters long";
        }

        if (!password.match(/[A-Z]/)) {
             return "Password must have at least one capital letter";
        }

        if (!password.match(/[0-9]/)) {
             return "Password must have at least one number";
        }

        return true;
    };



});