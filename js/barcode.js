var resultValue;

//document.addEventListener("deviceready", init, false);
function barcodeInit() {
    // document.querySelector("#startScan").addEventListener("touchend", startScan, true);
    // resultValue = document.querySelector("#results");

}

function startScan() {
    // document.getElementById("parkingID").style.visibility = "hidden";
    cordova.plugins.barcodeScanner.scan(
        function(result) {
            var s = result.text;
            // resultValue.innerHTML = s;                        
            document.getElementById("parkingID").value = s;
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().searchParkingIdExists(s);
        },
        function(error) {
            alert("Scanning failed: " + error);
        }
    );

}
barcodeInit();

function barcodeReaderforSearch() {
    // document.getElementById("parkingID").style.visibility = "hidden";
    cordova.plugins.barcodeScanner.scan(
        function(result) {
            var s = result.text;
            // resultValue.innerHTML = s;   
            scr = ''
            // alert(s)
                // angular.element('[ng-model="searchCars"]') = s;
                // alert(angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().searchCars)
                // angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().searchCars = s;
            document.getElementById("searchId").value = s;
            // document.getElementById("searchId").setAttrubute("ng-model", s);
            scr = s;
            var aa = document.querySelector('[ng-app=starter]');
            var $scope = angular.element(aa).scope();
            var rr = $scope.$$childHead;
            rr.$digest();
            // $scope.$apply(function() {
            //     $scope.searchCars = s;
            //     alert('inside scope');
            //     $scope.$watch('searchCars', function(newValue, oldValue) {
            //         alert(newValue + "new");
            //         $scope.searchCars = s;
            //         // $scope.search45();
            //         alert(oldValue + "old");
            //     })
            // })
        },
        function(error) {
            alert("Scanning failed: " + error);
        }
    );

}
