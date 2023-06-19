var pictureSource; // picture source
var pictureSource; // picture source
var destinationType; // sets the format of returned value 
var readPlateNumber = true;
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    pictureSource = navigator.camera.PictureSourceType;
    destinationType = navigator.camera.DestinationType;
}
var dataURL;
var uploadedScratchesImages = [];

function onPhotoFileSuccess(imageData) {
    document.getElementById("plateNumber").style.display = "block";
    document.getElementById("plateNumberLabel").style.display = "block";
    var smallImage = document.getElementById('largeImage');
    smallImage.style.display = 'block';


    var img = new Image();
    img.setAttribute('crossOrigin', 'anonymous');
    img.src = '' + imageData;

    //alert(readPlateNumber);
    if (readPlateNumber) {
        img.onload = function() {
            var c = document.getElementById("imgCanvas");
            var ctx = c.getContext("2d");
            c.width = img.width;
            c.height = img.height;
            ctx.drawImage(img, 0, 0);
            var dataurl = c.toDataURL('image/jpeg');
            // alert(">>>>"+dataurl);

            $.ajax({
                    url: "https://api.projectoxford.ai/vision/v1.0/ocr?",
                    beforeSend: function(xhrObj) {
                        // Request headers
                        xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                        xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "0973f135365e4042aec196a6f9b86edf");
                    },
                    type: "POST",
                    // The DataURL will be something like "data:image/png;base64,{image-data-in-base64}"
                    data: makeblob("" + dataurl),
                    processData: false
                })
                .success(function(data, status) {
                    // alert("Success"+JSON.stringify(data));
                    // console.log(JSON.stringify(data));
                    var str = '';
                    data1(0)

                    function data1(i) {
                        if (i < data.regions[0].lines.length) {
                            data2(0)

                            function data2(j) {
                                if (j < data.regions[0].lines[i].words.length) {
                                    str += data.regions[0].lines[i].words[j].text + ' ';
                                    j++;
                                    data2(j);
                                } else {
                                    i++;
                                    data1(i);
                                }
                            }

                        } else {
                            // alert("No is : " + str)
                            document.getElementById("plateNumber").value = str;
                        }
                    }
                    debugger;
                })
                .error(function(xhr, status, err) {
                    // alert("Error");
                    debugger;
                });
        }
    }

    /* smallImage.onload=function(){
          var canvas = document.getElementById("imgCanvas");
         var ctx = canvas.getContext("2d");
         ctx.drawImage(this, 0, 0);
         dataURL = canvas.toDataURL("image/jpeg");
         alert(dataURL+"Image Data is "+dataURL);
         $(function() {
             var params = {
                 "language": "unk",
                 "detectOrientation ": "true",
             };

             $.ajax({
                     url: "https://api.projectoxford.ai/vision/v1.0/ocr?" + $.param(params),
                     beforeSend: function(xhrObj) {
                         xhrObj.setRequestHeader("Content-Type", "application/octet-stream");
                         xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "0973f135365e4042aec196a6f9b86edf");
                     },
                     type: "POST",
                     processData: false,
                     data: makeblob(dataURL)
                 })
                 .done(function(data) {
                     alert("Result"+JSON.stringify(data))
                     var str = '';
                     data1(0)
                     function data1(i) {
                         if (i < data.regions[0].lines.length) {
                             data2(0)

                             function data2(j) {
                                 if (j < data.regions[0].lines[i].words.length) {
                                     str += data.regions[0].lines[i].words[j].text + ' ';
                                     j++;
                                     data2(j);
                                 } else {
                                     i++;
                                     data1(i);
                                 }
                             }

                         } else {
                             alert("No is : " + str)
                         }
                     }
                     // alert("success");
                 })
                 .fail(function(err) {

                     alert("error" + JSON.stringify(err) + "-----------"+JSON.stringify(makeblob(imageData)));
                 });
         });
     }*/
    smallImage.src = imageData;
    var vis;

    function hiderow() {
        if (smallImage.src == '') {
            vis.hideButton = true;
        } else {
            // alert('img data-------' + smallImage.src);
            vis.hideButton = true;
        }
    }


    //var imageDataFinal=dataURL.replace(/^data:image\/(png|jpg);base64,/, "");




    function makeblob(dataURL) {
        var BASE64_MARKER = ';base64,';
        if (dataURL.indexOf(BASE64_MARKER) == -1) {
            var parts = dataURL.split(',');
            var contentType = parts[0].split(':')[1];
            var raw = decodeURIComponent(parts[1]);
            return new Blob([raw], { type: contentType });
        }
        var parts = dataURL.split(BASE64_MARKER);
        var contentType = parts[0].split(':')[1];
        var raw = window.atob(parts[1]);
        var rawLength = raw.length;

        var uInt8Array = new Uint8Array(rawLength);

        for (var i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }

        return new Blob([uInt8Array], { type: contentType });
    }







}

function capturePhotoWithFile() {
    navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}

function proofCapture() {
    navigator.camera.getPicture(afterProofCapture, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
}

function afterProofCapture(image) {
    // angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope.snapImage.push(image);
    // alert(angular.element(document.getElementById("temppp")).scope().snapImage + "------")
    /* var scope = angular.element(document.querySelector('[ng-app="starter"]')).scope();
     console.log(scope)
     // scope.proofs.push(image)
    scope.$apply(function(){
         alert(scope.proofs)
    })*/
    scopes.$apply(function() {
        scopes.proofs.push(image);
        // alert(scopes.proofs + "================="+scopes.proofs.length)
    })

    /*        var sel = 'div[ng-controller="parkingCtrl"]';
         
           var $scope = angular.element(sel).scope();
         // $scope.proofs.push(image)
        $scope.$apply();*/
    // proofs.push(image);
    // alert(proofs);
}

function onFail(message) {
    // alert('Failed because: ' + message);
}

function captureScratchesImages() {
    navigator.camera.getPicture(onScratchImageCaptureSuccess, onScratchImageCaptureFailiure, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
    // angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.push("img/1.jpg");
}

function onScratchImageCaptureSuccess(imageData) {
    /*if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope.markImageHadTaken) {
        if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.length > 1) {
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.pop();
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.push(imageData);
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.push(angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope.markedImageSRC);

        } else if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.length == 1) {
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage = [];
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.push(imageData);
            angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.push(angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope.markedImageSRC);
        }

    } else {*/
    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage.push(imageData);
    // }
    scopes.$apply(function() {})
}

function onScratchImageCaptureFailiure(message) {
    // alert(' onScratchImageCaptureFailiure > Failed because: ' + message);
}
var stData;
var s1, s2;
var processed = 0;
var markedImageName = new Date().getTime() + ".png";

function uploadPhoto() {


    $(".showHideForAddCarLoader").show();
    // alert("UploadPhoto Started");
    var imageData = document.getElementById('largeImage').getAttribute("src");
    // alert(imageData);
    if (marked) {
        alert("Please save CED image.")
        $(".showHideForAddCarLoader").hide();
    } else {
        uploadImagesFunction();

    }

    function uploadImagesFunction() {
        markedImageName = new Date().getTime() + ".png"
        if (!imageData) {
            if (document.getElementById("venueID") != undefined || document.getElementById("venueID") != null) {
                var ddl = document.getElementById("multipleVenueIDs");
                var selectedValueforManager = ddl.options[ddl.selectedIndex].value;

                var ddl2 = document.getElementById("multipleVenueIDsforAccountAdmin");
                var selectedValueforAccountAdmin = ddl2.options[ddl2.selectedIndex].value;
                // console.log("=============="+ (document.getElementById("accountDriver").value)['userName'])
                var postData = {};
                postData = {
                    plateNumber: document.getElementById("plateNumber").value,
                    parkingZone: document.getElementById("parkingZone").value,
                    // color: document.getElementById("colorpicker").value,
                    // brand: document.getElementById("branedicons").value,
                    // employeeID: JSON.parse(document.getElementById("accountDriver").value).id, //document.getElementById("employeeID").value,
                    accountID: document.getElementById("accountID").value,
                    // employeeName: JSON.parse(document.getElementById("accountDriver").value).userName, //document.getElementById("employeeName").value,
                    //document.getElementById("profile").src
                    loginAs: document.getElementById("loginAs").value
                }

                postData['loginUser'] = {
                    "id": JSON.parse(document.getElementById("loginUser").value).id,
                    "email": JSON.parse(document.getElementById("loginUser").value).email,
                    "userName": JSON.parse(document.getElementById("loginUser").value).userName,
                    "userProfile": JSON.parse(document.getElementById("loginUser").value).userProfile
                }

                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    postData['employeeID'] = JSON.parse(document.getElementById("accountDriver").value).id
                    postData['employeeName'] = JSON.parse(document.getElementById("accountDriver").value).userName
                } else {
                    postData['employeeID'] = 'Unassigned';
                }
                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    if (JSON.parse(document.getElementById("accountDriver").value).profileImage) {
                        postData['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("accountDriver").value).profileImage
                    }
                }


                if(document.getElementById("employeeRole").value == 'driver'){
                    postData['employeeID'] = JSON.parse(document.getElementById("loginUser").value).id;
                    postData['employeeName'] = JSON.parse(document.getElementById("loginUser").value).userName;
                    if (JSON.parse(document.getElementById("loginUser").value).profileImage) {
                        postData['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("loginUser").value).profileImage;
                    }
                }


                if (document.getElementById("carBrand").value) {
                    if (JSON.parse(document.getElementById("carBrand").value).brand) {
                        postData['brand'] = JSON.parse(document.getElementById("carBrand").value).brand;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).modelName) {
                        postData['modelName'] = JSON.parse(document.getElementById("carBrand").value).modelName;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).color) {
                        postData['color'] = JSON.parse(document.getElementById("carBrand").value).color;
                    }
                }

                if (document.getElementById('remarks').value)
                    postData['remarks'] = document.getElementById('remarks').value;


                // console.log(' -----data' + JSON.stringify(postData));
                if (document.getElementById("results").innerHTML == '') {
                    postData['parkingID'] = document.getElementById("parkingID").value;

                } else {
                    postData['parkingID'] = document.getElementById("results").innerHTML;
                }
                //alert("<<scratchesSnap>>"+uploadedScratchesImages.length);
                if (uploadedScratchesImages.length == 0) {
                    uploadedScratchesImages = [];
                }
                postData['scratchesSnap'] = uploadedScratchesImages; //angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage;
                // alert("111111111111" + angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb);
                // stData = document.getElementById('markedImageSRC12').getAttribute("src");
                // if (stData) {
                //     alert("entered"+ stData);

                // if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope.markedImageSRC) {
                // alert("push"+markedImageName + "==="+ angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().markedImageSRC);
                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                    postData['scratchesSnap'].push(markedImageName);
                    var s1 = new FileTransfer();
                    var s2 = new FileUploadOptions();
                    s2.fileKey = "uploadFile";
                    s2.fileName = markedImageName;
                    // uploadedScratchesImages.push(s2.fileName);
                    // alert("Uploading File Name  > " + s2.fileName);
                    s2.mimeType = "image/png";
                    var dd = new Blob([angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb], { type: "image/png" });
                    // alert("" + dd + "-------------" + markedImageName)
                    s1.upload("data:image/png;base64," + angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb, encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), win, fail, s2);

                }
                // alert(JSON.stringify(postData['scratchesSnap']));
                //
                // }

                if (selectedValueforManager == "" && selectedValueforAccountAdmin == "") {
                    postData['venueID'] = document.getElementById("venueID").value;
                } // NOT A MANAGER && NOT ACCOUNT ADMIN 
                else if (selectedValueforManager != "") {
                    // postData['venueID'] =  JSON.parse(document.getElementById("multipleVenueIDs").value).id;
                    postData['venueID'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.id
                } // MANAGER 
                else if (selectedValueforAccountAdmin != "") {
                    // postData['venueID'] =  JSON.parse(document.getElementById("multipleVenueIDsforAccountAdmin").value).id;
                    postData['venueID'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.id
                } //  ACCOUNT ADMIN
                // console.log(JSON.stringify())
                //   ;
                /*
                 *
                 * TARGET SERVER IP ADDRESS FOR UPLOADING THE IMAGE
                 *
                 */
                // goToMainDashboardPOST(document.getElementById("gotoMain").checked);
                // alert('444444444444444444444' + postData['scratchesSnap'].length);

                $.post("https://evaletz.com:1338/file/upload", postData).success(function(data) {
                    $(".showHideForAddCarLoader").hide();
                    console.log("success");
                    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage = [];
                    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().markedImageSRC = '';
                });
                document.getElementById("parkingID").value = 'OS';
                document.getElementById("plateNumber").value = '';
                document.getElementById("parkingZone").value = '';
                return;
            } else {
                $(".showHideForAddCarLoader").hide();
                alert('Sorry, there is no venue assigned for you...');
                return;
            }
        } else {
            var options = new FileUploadOptions();
            options.fileKey = "uploadFile";
            options.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            if (document.getElementById("venueID") != undefined || document.getElementById("venueID") != null) {
                var ddl = document.getElementById("multipleVenueIDs");
                var selectedValueforManager = ddl.options[ddl.selectedIndex].value;
                var ddl2 = document.getElementById("multipleVenueIDsforAccountAdmin");
                var selectedValueforAccountAdmin = ddl2.options[ddl2.selectedIndex].value;

                options.params = {
                    plateNumber: document.getElementById("plateNumber").value,
                    parkingZone: document.getElementById("parkingZone").value,
                    // color: document.getElementById("colorpicker").value,
                    // brand: document.getElementById("branedicons").value,
                    // employeeID: JSON.parse(document.getElementById("accountDriver").value).id, //document.getElementById("employeeID").value,
                    accountID: document.getElementById("accountID").value,
                    // employeeName: JSON.parse(document.getElementById("accountDriver").value).userName, //document.getElementById("employeeName").value,
                    //profileImage: document.getElementById("profile").src
                    loginAs: document.getElementById("loginAs").value
                }

                options.params['loginUser'] = {
                    "id": JSON.parse(document.getElementById("loginUser").value).id,
                    "email": JSON.parse(document.getElementById("loginUser").value).email,
                    "userName": JSON.parse(document.getElementById("loginUser").value).userName,
                    "userProfile": JSON.parse(document.getElementById("loginUser").value).userProfile
                }
                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    options.params['employeeID'] = JSON.parse(document.getElementById("accountDriver").value).id
                    options.params['employeeName'] = JSON.parse(document.getElementById("accountDriver").value).userName
                } else {
                    options.params['employeeID'] = 'Unassigned';
                }
                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    if (JSON.parse(document.getElementById("accountDriver").value).profileImage) {
                        options.params['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("accountDriver").value).profileImage
                    }
                }

                if(document.getElementById("employeeRole").value == 'driver'){
                    options.params['employeeID'] = JSON.parse(document.getElementById("loginUser").value).id;
                    options.params['employeeName'] = JSON.parse(document.getElementById("loginUser").value).userName;
                    if (JSON.parse(document.getElementById("loginUser").value).profileImage) {
                        options.params['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("loginUser").value).profileImage;
                    }
                }

                if (document.getElementById("carBrand").value) {
                    if (JSON.parse(document.getElementById("carBrand").value).brand) {
                        options.params['brand'] = JSON.parse(document.getElementById("carBrand").value).brand;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).modelName) {
                        options.params['modelName'] = JSON.parse(document.getElementById("carBrand").value).modelName;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).color) {
                        options.params['color'] = JSON.parse(document.getElementById("carBrand").value).color;
                    }
                }

                if (document.getElementById('remarks').value)
                    options.params['remarks'] = document.getElementById('remarks').value;


                if (document.getElementById("results").innerHTML == '') {
                    options.params['parkingID'] = document.getElementById("parkingID").value;

                } else {
                    options.params['parkingID'] = document.getElementById("results").innerHTML;

                }
                if (uploadedScratchesImages.length == 0) {
                    uploadedScratchesImages = [];
                }
                // alert(">><<<"+uploadedScratchesImages.length+"uploadedScratchesImages"+uploadedScratchesImages.toString());
                options.params['scratchesSnap'] = uploadedScratchesImages; //angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage;
                // alert("22222222222");
                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                    options.params['scratchesSnap'].push(markedImageName);
                    var s1 = new FileTransfer();
                    var s2 = new FileUploadOptions();
                    s2.fileKey = "uploadFile";
                    s2.fileName = markedImageName;
                    // uploadedScratchesImages.push(s2.fileName);
                    // alert("Uploading File Name  > " + s2.fileName);
                    s2.mimeType = "image/png";
                    var dd = new Blob([angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb], { type: "image/png" });
                    // alert("" + dd + "-------------" + markedImageName)
                    s1.upload("data:image/png;base64," + angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb, encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), win, fail, s2);

                }
                // alert(JSON.stringify(options.params['scratchesSnap']));

                if (selectedValueforManager == "" && selectedValueforAccountAdmin == "") {
                    options.params['venueID'] = document.getElementById("venueID").value;
                } // NOT A MANAGER && NOT ACCOUNT ADMIN 
                else if (selectedValueforManager != "") {
                    options.params['venueID'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.id
                } // MANAGER 
                else if (selectedValueforAccountAdmin != "") {
                    options.params['venueID'] = angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager.id
                } //  ACCOUNT ADMIN


                var ft = new FileTransfer();
                /*
                 *
                 * TARGET SERVER IP ADDRESS FOR UPLOADING THE IMAGE
                 *
                 */
                // alert('00000');
                ft.upload(imageData, encodeURI("https://evaletz.com:1338/file/upload"), win, fail, options);
                document.getElementById("parkingID").value = 'OS';
                document.getElementById("plateNumber").value = '';
                document.getElementById("parkingZone").value = '';
                $(".showHideForAddCarLoader").hide();
                //  document.getElementById("colorpicker").value = '1';
                //  document.getElementById("branedicons").value = 'other';
                document.getElementById("largeImage").src = "https://www.dtic.upf.edu/~afaridi/DTIC_Seminars/archives/2010/photos/Anon.jpg";
                // document.getElementById("smallImage").src = "";
            } else {
                $(".showHideForAddCarLoader").hide();
                alert('Sorry, there is no venue assigned for you...');
            }
        }
    }

}

function onFail(message) {
    alert(message);
    // console.log('Failed because: ' + message);
}

function win(r) {
    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage = [];
    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().markedImageSRC = '';
}

function fail(error) {}

var scratchesImages = [];
var scratchesft;
var scratchesoptions;
var scratchesuploadcount = 0;

function uploadAllScratchesSnap() {
    if (document.addcarform.parkingID.value == null || document.addcarform.parkingID.value == "") {
        alert("Please fill Ticket Number");
    } else if (document.addcarform.plateNumber.value == null || document.addcarform.plateNumber.value == "") {
        alert("Please fill Plate Number");
    } else if (angular.element(document.querySelector('[ng-controller="accountCtrl"]')).scope().seletedVenueByAAandManager == undefined && document.getElementById("employeeRole").value != 'driver'  && document.getElementById("employeeRole").value != 'chauffeur') {
        alert("Please fill required fields");
    }
    //  else if (document.addcarform.parkingZone.value == null || document.addcarform.parkingZone.value == "") {
    //     alert("Parking Zone can't be blank");
    // } 
    /* else if (document.addcarform.driver.value == null || document.addcarform.driver.value == "") {
         alert("Please fill required fields");
     }*/
    else {
        scratchesImages = angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage;
        uploadedScratchesImages = [];
        scratchesuploadcount = 0
        if (scratchesImages.length > 0) {
            // alert(scratchesImages.length+"scratchesImages > "+scratchesImages.toString());    
            if (scratchesImages.length > scratchesuploadcount) {
                uploadScratchSnapOneByOne(scratchesuploadcount);
            }
        } else {
            uploadPhoto();
            // angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage=[];
        }
    }
}

uploadScratchSnapOneByOne = function(index) {
    $(".showHideForAddCarLoader").show();
    processed++;
    // alert("Uploading File Index  > "+index);
    scratchesft = new FileTransfer();
    scratchesoptions = new FileUploadOptions();
    scratchesoptions.fileKey = "uploadFile";
    scratchesoptions.fileName = scratchesImages[index].toString().substr(scratchesImages[index].toString().lastIndexOf('/') + 1);
    uploadedScratchesImages.push(scratchesoptions.fileName);
    // alert("Uploading File Name  > " + scratchesoptions.fileName);
    scratchesoptions.mimeType = "image/jpeg";
    scratchesft.upload(scratchesImages[index], encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), scratchesImageSnapUploadSuccess, scratchesImageSnapUploadFailiure, scratchesoptions);


}



//    uploadProfile =function(file, id){
//    // alert("Uploading File Index  > "+index);
//        profileImg = new FileTransfer();
//        profileimageUplod = new FileUploadOptions();
//        profileimageUplod.fileKey = "uploadFile";
//        profileimageUplod.fileName = scratchesImages[index].toString().substr(scratchesImages[index].toString().lastIndexOf('/') + 1);
//        uploadedScratchesImages.push(profileimageUplod.fileName);
//        // alert("Uploading File Name  > "+profileimageUplod.fileName);
//        profileimageUplod.mimeType = "image/jpeg";
//        profileImg.upload(scratchesImages[index], encodeURI("https://evaletz.com:1338/user/UploadFile"), );

//    }

// $scope.uploadProfile = function(file, id) {
//        console.log("file name" + JSON.stringify(id));

//        // userService.uploadProfile(file);
//        Upload.upload({
//            url: $rootScope.ipAddress + '/user/UploadFile', //S3 upload url including bucket name
//            method: 'POST',
//            data: {
//                // key: file.name, // the key to store the file on S3, could be file name or customized
//                // AWSAccessKeyId: < YOUR AWS AccessKey Id > ,
//                // acl: 'private', // sets the access to the uploaded file in the bucket: private, public-read, ...
//                // policy: $scope.policy, // base64-encoded json policy (see article below)
//                // signature: $scope.signature, // base64-encoded signature based on policy string (see article below)
//                // "Content-Type": file.type != '' ? file.type : 'application/octet-stream', // content type of the file (NotEmpty)
//                // filename: file.name, // this is needed for Flash polyfill IE8-9
//                file: file,
//                id: id
//            }
//        });
//    };

// function uplodpf() {
//  console.log('open galary');
//   // Retrieve image file location from specified source
//   navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
//     destinationType: destinationType.FILE_URI,
//     sourceType: source });
// };





function scratchesImageSnapUploadFailiure(message) {
    // alert('scratchesImageSnapUploadFailiure Failed because: ' + JSON.stringify(message));
    checkAndUploadNextImage();
}

function scratchesImageSnapUploadSuccess(r) {
    // alert('scratchesImageSnapUploadSuccess '+JSON.stringify(r));
    checkAndUploadNextImage();
}

function add() {
    // alert('scratchesImageSnapUploadSuccess '+JSON.stringify(r));
    alert();
}

function checkAndUploadNextImage() {
    scratchesuploadcount++;
    // alert(scratchesImages.length+' Uploading Next Image: '+scratchesuploadcount);
    if (scratchesImages.length > scratchesuploadcount) {
        uploadScratchSnapOneByOne(scratchesuploadcount);
    } else {
        uploadPhoto();
        //angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage=[];
    }
}

var allProofs;
var uploadedCount = 0;

function uploadAllProofs() {
    allProofs = angular.copy(scopes.proofs);
    if (allProofs.length > 0)
        runEachProofs(0);

    function runEachProofs(index) {
        if (index < allProofs.length) {
            $(".showHideForAddCarLoader").show()
            uploadedCount++;
            scratchesft = new FileTransfer();
            scratchesoptions = new FileUploadOptions();
            scratchesoptions.fileKey = "uploadFile";
            scratchesoptions.fileName = allProofs[index].toString().substr(allProofs[index].toString().lastIndexOf('/') + 1);
            // alert("Uploading File Name  >" + scratchesoptions.fileName);
            // scopes.proofs[index] = scratchesoptions.fileName;
            scratchesoptions.mimeType = "image/jpeg";
            scratchesft.upload(scopes.proofs[index], encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), KK, Failed2, scratchesoptions);
            // $setTimeout(function() {
            index++;
            runEachProofs(index);
            // }, 500);
        } else {
            $(".showHideForAddCarLoader").hide()
                // scopes.proofs = [];
        }
    }

}

function KK(fail) {
    // alert(fail + "pass")
    $(".showHideForAddCarLoader").hide()
}

function Failed2(fail) {
    // alert(JSON.stringify(fail))
    $(".showHideForAddCarLoader").hide()
}













function editCarUploadPhoto() {
    $(".showHideForAddCarLoader").show();
    var imageData = document.getElementById('largeImage').getAttribute("src");
    if (marked) {
        alert("Please save CED image.")
        $(".showHideForAddCarLoader").hide();
    } else {
        uploadImagesFunction2();
    }

    function uploadImagesFunction2() {
        markedImageName = new Date().getTime() + ".png"
        if (!imageData) {
            if (document.getElementById("venueID") != undefined || document.getElementById("venueID") != null) {
                var postData = {};
                postData = {
                    plateNumber: document.getElementById("plateNumber").value,
                    parkingZone: document.getElementById("parkingZone").value,
                    accountID: document.getElementById("accountID").value,
                    loginAs: document.getElementById("loginAs").value,
                    id: angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.id,
                    venueID: angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.venue.id,
                    snap: angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.snap
                }

                postData['loginUser'] = {
                    "id": JSON.parse(document.getElementById("loginUser").value).id,
                    "email": JSON.parse(document.getElementById("loginUser").value).email,
                    "userName": JSON.parse(document.getElementById("loginUser").value).userName,
                    "userProfile": JSON.parse(document.getElementById("loginUser").value).userProfile
                }

                if (document.getElementById("venueID") &&  document.getElementById("venueID").value) {
                    postData['venueID'] = document.getElementById("venueID").value
                }

                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    // console.log(JSON.stringify(document.getElementById("accountDriver").value))
                    postData['employeeID'] = JSON.parse(document.getElementById("accountDriver").value).id
                    postData['employeeName'] = JSON.parse(document.getElementById("accountDriver").value).userName
                } else {
                    postData['employeeID'] = 'Unassigned';
                }
                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    if (JSON.parse(document.getElementById("accountDriver").value).profileImage) {
                        postData['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("accountDriver").value).profileImage
                    }
                }

                if(document.getElementById("employeeRole").value == 'driver'){
                    postData['employeeID'] = JSON.parse(document.getElementById("loginUser").value).id;
                    postData['employeeName'] = JSON.parse(document.getElementById("loginUser").value).userName;
                    if (JSON.parse(document.getElementById("loginUser").value).profileImage) {
                        postData['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("loginUser").value).profileImage;
                    }
                }

                if (document.getElementById("carBrand").value) {
                    if (JSON.parse(document.getElementById("carBrand").value).brand) {
                        postData['brand'] = JSON.parse(document.getElementById("carBrand").value).brand;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).modelName) {
                        postData['modelName'] = JSON.parse(document.getElementById("carBrand").value).modelName;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).color) {
                        postData['color'] = JSON.parse(document.getElementById("carBrand").value).color;
                    }
                }

                if (document.getElementById('remarks').value)
                    postData['remarks'] = document.getElementById('remarks').value;


                if (document.getElementById("results").innerHTML == '') {
                    postData['parkingID'] = document.getElementById("parkingID").value;

                } else {
                    postData['parkingID'] = document.getElementById("results").innerHTML;
                }

                if (uploadedScratchesImages.length == 0) {
                    uploadedScratchesImages = [];
                }
                postData['scratchesSnap'] = uploadedScratchesImages;
                // alert(angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap)
                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap) {
                    if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.length > 0) {
                        // if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap[angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.length - 1].endsWith('png') && angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                        //     angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.pop();
                        // }
                        if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                            checkPNGExists(0);

                            function checkPNGExists(p) {
                                if (p < angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.length) {
                                    if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap[p].endsWith('png')) {
                                        angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.splice(p, 1);
                                    } else {
                                        p++;
                                        checkPNGExists(p);
                                    }

                                } else {

                                }
                            }
                        }
                    }
                }
                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap) {
                    postData['scratchesSnap'] = angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.concat(postData['scratchesSnap']);
                }


                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                    postData['scratchesSnap'].push(markedImageName);
                    var s1 = new FileTransfer();
                    var s2 = new FileUploadOptions();
                    s2.fileKey = "uploadFile";
                    s2.fileName = markedImageName;
                    s2.mimeType = "image/png";
                    var dd = new Blob([angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb], { type: "image/png" });
                    s1.upload("data:image/png;base64," + angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb, encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), win, fail, s2);
                }

                $.post("https://evaletz.com:1338/file/upload2", postData).success(function(data) {
                    $(".showHideForAddCarLoader").hide();
                    console.log("success");
                    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage = [];
                    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().markedImageSRC = '';
                });
                // document.getElementById("parkingID").value = 'OS';
                // document.getElementById("plateNumber").value = '';
                // document.getElementById("parkingZone").value = '';
                return;
            } else {
                $(".showHideForAddCarLoader").hide();
                alert('Sorry, there is no venue assigned for you...');
                return;
            }
        } else {
            var options = new FileUploadOptions();
            options.fileKey = "uploadFile";
            options.fileName = imageData.substr(imageData.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            if (document.getElementById("venueID") != undefined || document.getElementById("venueID") != null) {

                options.params = {
                    plateNumber: document.getElementById("plateNumber").value,
                    parkingZone: document.getElementById("parkingZone").value,
                    accountID: document.getElementById("accountID").value,
                    loginAs: document.getElementById("loginAs").value,
                    id: angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.id,
                    venueID: angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.venue.id,
                }

                options.params['loginUser'] = {
                    "id": JSON.parse(document.getElementById("loginUser").value).id,
                    "email": JSON.parse(document.getElementById("loginUser").value).email,
                    "userName": JSON.parse(document.getElementById("loginUser").value).userName,
                    "userProfile": JSON.parse(document.getElementById("loginUser").value).userProfile
                }
                if (document.getElementById("venueID") && document.getElementById("venueID").value) {
                    options.params['venueID'] = document.getElementById("venueID").value
                }

                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    options.params['employeeID'] = JSON.parse(document.getElementById("accountDriver").value).id
                    options.params['employeeName'] = JSON.parse(document.getElementById("accountDriver").value).userName
                } else {
                    options.params['employeeID'] = 'Unassigned';
                }
                if (document.getElementById("accountDriver") && document.getElementById("accountDriver").value) {
                    if (JSON.parse(document.getElementById("accountDriver").value).profileImage) {
                        options.params['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("accountDriver").value).profileImage
                    }
                }

                if(document.getElementById("employeeRole").value == 'driver'){
                    options.params['employeeID'] = JSON.parse(document.getElementById("loginUser").value).id;
                    options.params['employeeName'] = JSON.parse(document.getElementById("loginUser").value).userName;
                    if (JSON.parse(document.getElementById("loginUser").value).profileImage) {
                        options.params['profileImage'] = "https://evaletz.com:1338/images/" + JSON.parse(document.getElementById("loginUser").value).profileImage;
                    }
                }

                if (document.getElementById("carBrand").value) {
                    if (JSON.parse(document.getElementById("carBrand").value).brand) {
                        options.params['brand'] = JSON.parse(document.getElementById("carBrand").value).brand;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).modelName) {
                        options.params['modelName'] = JSON.parse(document.getElementById("carBrand").value).modelName;
                    }
                    if (JSON.parse(document.getElementById("carBrand").value).color) {
                        options.params['color'] = JSON.parse(document.getElementById("carBrand").value).color;
                    }
                }

                if (document.getElementById('remarks').value)
                    options.params['remarks'] = document.getElementById('remarks').value;

                if (document.getElementById("results").innerHTML == '') {
                    options.params['parkingID'] = document.getElementById("parkingID").value;

                } else {
                    options.params['parkingID'] = document.getElementById("results").innerHTML;

                }
                if (uploadedScratchesImages.length == 0) {
                    uploadedScratchesImages = [];
                }
                options.params['scratchesSnap'] = uploadedScratchesImages;
                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.length > 0) {
                    // if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap[angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.length - 1].endsWith('png') && angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                    //     angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.pop();
                    // }
                    if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                        checkPNGExists(0);

                        function checkPNGExists(p) {
                            if (p < angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.length) {
                                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap[p].endsWith('png')) {
                                    angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.splice(p, 1);
                                } else {
                                    p++;
                                    checkPNGExists(p);
                                }

                            } else {

                            }
                        }
                    }
                }
                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap) {
                    options.params['scratchesSnap'] = angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().editedCarDetails.scratchesSnap.concat(options.params['scratchesSnap']);
                }

                if (angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb) {
                    options.params['scratchesSnap'].push(markedImageName);
                    var s1 = new FileTransfer();
                    var s2 = new FileUploadOptions();
                    s2.fileKey = "uploadFile";
                    s2.fileName = markedImageName;
                    s2.mimeType = "image/png";
                    var dd = new Blob([angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb], { type: "image/png" });
                    s1.upload("data:image/png;base64," + angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().bb, encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), win, fail, s2);

                }

                var ft = new FileTransfer();
                /*
                 *
                 * TARGET SERVER IP ADDRESS FOR UPLOADING THE IMAGE
                 *
                 */
                ft.upload(imageData, encodeURI("https://evaletz.com:1338/file/upload2"), win, fail, options);
                // document.getElementById("parkingID").value = 'OS';
                // document.getElementById("plateNumber").value = '';
                // document.getElementById("parkingZone").value = '';
                $(".showHideForAddCarLoader").hide();
                //  document.getElementById("colorpicker").value = '1';
                //  document.getElementById("branedicons").value = 'other';
                // document.getElementById("largeImage").src = "img/Anon.jpg";
                // document.getElementById("largeImage").src = "https://www.dtic.upf.edu/~afaridi/DTIC_Seminars/archives/2010/photos/Anon.jpg";
                // document.getElementById("smallImage").src = "";
            } else {
                $(".showHideForAddCarLoader").hide();
                alert('Sorry, there is no venue assigned for you...');
            }
        }
    }

}


function uploadAllScratchesSnap2() {


    scratchesImages = angular.element(document.querySelector('[ng-controller="parkingCtrl"]')).scope().snapImage;
    uploadedScratchesImages = [];
    scratchesuploadcount = 0
    if (scratchesImages.length > 0) {
        if (scratchesImages.length > scratchesuploadcount) {
            uploadScratchSnapOneByOne2(scratchesuploadcount);
        }
    } else {
        editCarUploadPhoto();
    }

}

uploadScratchSnapOneByOne2 = function(index) {
    $(".showHideForAddCarLoader").show();
    processed++;
    scratchesft = new FileTransfer();
    scratchesoptions = new FileUploadOptions();
    scratchesoptions.fileKey = "uploadFile";
    scratchesoptions.fileName = scratchesImages[index].toString().substr(scratchesImages[index].toString().lastIndexOf('/') + 1);
    uploadedScratchesImages.push(scratchesoptions.fileName);
    scratchesoptions.mimeType = "image/jpeg";
    scratchesft.upload(scratchesImages[index], encodeURI("https://evaletz.com:1338/file/uploadScratchesImages"), scratchesImageSnapUploadSuccess2, scratchesImageSnapUploadFailiure2, scratchesoptions);


}


function scratchesImageSnapUploadFailiure2(message) {
    checkAndUploadNextImage2();
}

function scratchesImageSnapUploadSuccess2(r) {
    checkAndUploadNextImage2();
}


function checkAndUploadNextImage2() {
    scratchesuploadcount++;
    if (scratchesImages.length > scratchesuploadcount) {
        uploadScratchSnapOneByOne2(scratchesuploadcount);
    } else {
        editCarUploadPhoto();
    }
}

function upperCaseF(a) {
    setTimeout(function() {
        a.value = a.value.toUpperCase();
    }, 1);
}

function downloadFiles(url, targetPath, options, trustHosts, cb) {
    var fileTransfer = new FileTransfer();
    fileTransfer.download(
        url,
        targetPath,
        function(entry) {
            cb('ok')
            alert('Your file has been downloaded successfully...');
        },
        function(error) {
            cb('error')
            alert('Sorry, your file downloading failed. Try again...');
        },
        false, {}
    );
}
