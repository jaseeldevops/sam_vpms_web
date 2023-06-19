'use strict';
app.factory('userService', function($http, $rootScope, notificationService, $state, $localStorage, localStorageService) {
    return {
        postUser: function(data) {
            $rootScope.loadRunner = true;
            //io.socket.get('http://192.168.1.5:1337/user/userCreationFromAPICall/');
            if (data) {
                var postdata = { userName: data.userName, password: data.password, email: data.email, mobile: data.mobile, companyName: data.companyName };
                $http.post($rootScope.ipAddress + '/user/userCreationFromAPICall/', postdata).success(function(data) {
                    $rootScope.loadRunner = false;
                });
                //notificationService.successNotify('User Registered Sucessfully...',5000); 
            }
        },
        userList: function() {
            $rootScope.loadRunner = true;
            $http.post($rootScope.ipAddress + '/user/findAllUserforOscar', { userID: $rootScope.$user.id }).success(function(data) {
                $rootScope.loadRunner = false;
                if (data.managers) {
                    $rootScope.managers = data.managers;
                }
                if (data.chauffeurs && $rootScope.$user.role != 'manager') {
                    $rootScope.chauffeurs = data.chauffeurs;
                }
                if (data.accountadmin) {
                    $rootScope.accountadmin = data.accountadmin;
                }
                if (data.drivers && $rootScope.$user.role != 'manager') {
                    $rootScope.drivers = data.drivers;
                }
                if ($rootScope.$user.role == 'manager') {
                    var tt = []
                    if ($rootScope.$user.venues.length > 0) {
                        $rootScope.chauffeurs = []
                        $rootScope.drivers = []
                        toRestrictVenueToChauffeurs(0);

                        function toRestrictVenueToChauffeurs(v) {
                            if (v < $rootScope.$user.venues.length) {
                                // $http.get($rootScope.ipAddress + '/venue/' + $rootScope.$user.venues[v].id).success(function(data) {
                                //     if (data.users.length) {
                                //         getRoleViceData(0);

                                //         function getRoleViceData(r) {
                                //             if (r < data.users.length) {
                                //                 if (data.users[r].role == 'chauffeur') {
                                //                     if (!_.findWhere($rootScope.chauffeurs, data.users[r]))
                                //                         $rootScope.chauffeurs.push(data.users[r]);
                                //                 }
                                //                 if (data.users[r].role == 'driver') {
                                //                     if (!_.findWhere($rootScope.drivers, data.users[r]))
                                //                         $rootScope.drivers.push(data.users[r]);
                                //                 }
                                //                 r++;
                                //                 getRoleViceData(r);
                                //             } else {
                                //                 v++;
                                //                 toRestrictVenueToChauffeurs(v);
                                //             }
                                //         }
                                //     }
                                // });


                                // if (data.users.length) {
                                getRoleViceData(0);

                                function getRoleViceData(r) {
                                    if (r < data.chauffeurs.length) {
                                        if (_.filter(data.chauffeurs[r].venues, (c) => { return c.id == $rootScope.$user.venues[v].id }).length > 0)
                                            $rootScope.chauffeurs.push(data.chauffeurs[r]);
                                        r++;
                                        getRoleViceData(r);
                                    } else {
                                        getRoleViceData2(0);
                                    }
                                }


                                function getRoleViceData2(r) {
                                    if (r < data.drivers.length) {
                                        if (_.filter(data.drivers[r].venues, (c) => { return c.id == $rootScope.$user.venues[v].id }).length > 0)
                                            $rootScope.drivers.push(data.drivers[r]);
                                        r++;
                                        getRoleViceData2(r);
                                    } else {
                                        v++;
                                        toRestrictVenueToChauffeurs(v);
                                    }
                                }
                                // }

                            } else {
                                $rootScope.filteredChauffeurs = angular.copy($rootScope.chauffeurs);
                                $rootScope.filteredDrivers = angular.copy($rootScope.drivers);
                                return data;
                                // console.log(JSON.stringify(tt))
                            }
                        }
                    }

                    /* if($rootScope.$user.venues.length > 0){
                       toRestrictVenueToChauffeurs(0);
                       function toRestrictVenueToChauffeurs(v){  
                         if( v < $rootScope.$user.venues.length){
                           if()
                           v++;
                           toRestrictVenueToChauffeurs(v);
                         }else{

                         }
                       }
                     }*/
                }
                //  console.log(JSON.stringify(data));
            });

        },
        postAccountAdmin: function(data) {
            var postdata = {};
            $rootScope.loadRunner = true;
            if (data) {
                if ($rootScope.$user.role == "admin") {
                    postdata = {
                        fullName: data.fullName,
                        userName: data.userName,
                        password: data.password,
                        email: data.email,
                        mobile: data.mobile,
                        companyName: data.companyName,
                        licenseNumber: data.licenseNumber,
                        role: data.role,
                        id: data.id,
                        wanttoSendEmail: false
                    };
                    if (data.licenseNumber) {
                        postdata['licenseNumber'] = data.licenseNumber;
                    }
                    if (data.documents)
                        postdata['documents'] = data.documents;
                    if (data.joiningDate)
                        postdata['joiningDate'] = data.joiningDate;
                    return $http.post($rootScope.ipAddress + '/user/accountAdminCreationFromAPICall/', postdata).then(function(data) {
                        $state.go('settings.users');
                        notificationService.successNotify('User registered sucessfully...', 5000);
                        $rootScope.loadRunner = false;
                        return data;
                    });
                } else if ($rootScope.$user.role == "accountadmin" || $rootScope.$user.role == "manager") {
                    if (!data.venue) {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            password: data.password,
                            email: data.email,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.$user.accountID.id,
                            wanttoSendEmail: false
                        };
                        if (data.licenseNumber) {
                            postdata['licenseNumber'] = data.licenseNumber;
                        }
                        if (data.documents)
                            postdata['documents'] = data.documents;
                        if (data.joiningDate)
                            postdata['joiningDate'] = data.joiningDate;


                        postdata['id'] = $rootScope.$user.accountID.id
                        return $http.post($rootScope.ipAddress + '/user/accountAdminCreationFromAPICall/', postdata).then(function(data) {
                            $state.go('settings.users');
                            notificationService.successNotify('User registered sucessfully...', 5000);
                            $rootScope.loadRunner = false;
                            return data;
                        });
                    } else {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            password: data.password,
                            email: data.email,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            licenseNumber: data.licenseNumber,
                            id: $rootScope.$user.accountID.id,
                            wanttoSendEmail: false,
                            defaultVenue: data.venue
                        };
                        if (data.licenseNumber) {
                            postdata['licenseNumber'] = data.licenseNumber;
                        }
                        if (data.documents)
                            postdata['documents'] = data.documents;
                        if (data.joiningDate)
                            postdata['joiningDate'] = data.joiningDate;
                        return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {
                            $state.go('settings.users');
                            notificationService.successNotify('User registered sucessfully...', 5000);
                            $rootScope.loadRunner = false;
                            return data;
                        });
                    }

                }

            }
        },

        /*  postUserViaAccount: function(data) {
              $rootScope.loadRunner = true;
              // console.log($rootScope.thisAccount.id);

              //console.log('22222222' + $rootScope.defaultVenueData + "<<<<<<<<<<<<<<<<<<<<<<<<<<<" +$rootScope.thisAccount.defaultVenue);
              if (data && $rootScope.$user.role == 'admin') {
                  if ($rootScope.defaultVenueData == false) {
                      var postdata = {
                          fullName: data.fullName,
                          userName: data.userName,
                          password: data.password,
                          email: data.email,
                          mobile: data.mobile,
                          companyName: data.companyName,
                          role: data.role,
                          id: $rootScope.thisAccount.id,
                          wanttoSendEmail: false
                      }; // data.wanttoSendEmail
                      return $http.post($rootScope.ipAddress + '/user/accountAdminCreationFromAPICall/', postdata).then(function(data) {

                          notificationService.successNotify('User Registered Sucessfully...', 5000);
                          $rootScope.loadRunner = false;
                          return data;
                      });
                  } else {
                      var postdata = {
                          fullName: data.fullName,
                          userName: data.userName,
                          password: data.password,
                          email: data.email,
                          mobile: data.mobile,
                          companyName: data.companyName,
                          role: data.role,
                          id: $rootScope.thisAccount.id,
                          defaultVenue: $rootScope.thisAccount.defaultVenue.id,
                          wanttoSendEmail: false
                      };
                      return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {

                          notificationService.successNotify('User Registered Sucessfully...', 5000);
                          $rootScope.loadRunner = false;
                          return data;
                      });
                  }

              } else {
                  if ($rootScope.defaultVenueData == false) {
                      var postdata = {
                          fullName: data.fullName,
                          userName: data.userName,
                          password: data.password,
                          email: data.email,
                          mobile: data.mobile,
                          companyName: data.companyName,
                          role: data.role,
                          id: $rootScope.accountadminData.id,
                          wanttoSendEmail: false
                      }; // data.wanttoSendEmail
                      return $http.post($rootScope.ipAddress + '/user/accountAdminCreationFromAPICall/', postdata).then(function(data) {

                          notificationService.successNotify('User Registered Sucessfully...', 5000);
                          $rootScope.loadRunner = false;
                          return data;
                      });
                  } else {
                      var postdata = {
                          fullName: data.fullName,
                          userName: data.userName,
                          password: data.password,
                          email: data.email,
                          mobile: data.mobile,
                          companyName: data.companyName,
                          role: data.role,
                          id: $rootScope.accountadminData.id,
                          defaultVenue: $rootScope.accountadminData.defaultVenue.id,
                          wanttoSendEmail: false
                      };

                      return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {

                          notificationService.successNotify('User Registered Sucessfully...', 5000);
                          $rootScope.loadRunner = false;
                          return data;
                      });
                  }


              }
          },*/
        postUserViaAccount: function(data) {
            $rootScope.loadRunner = true;
            var postdata = {};
            // console.log('----' + JSON.stringify(data));
            // console.log('22222222' + $rootScope.defaultVenueData + "<<<<<<<<<<<<<<<<<<<<<<<<<<<" + $rootScope.thisAccount.defaultVenue);
            if (!data.password)
                data.password = 'OSCARinfonion';
            if (data.role == 'chauffeur' || data.role == 'driver')
                $rootScope.defaultVenueData = true;

            if (data && $rootScope.$user.role == 'admin') {
                if ($rootScope.defaultVenueData == false) {
                    if (data.role == 'driver') {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            licenseNumber: data.licenseNumber,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.thisAccount.id,
                            wanttoSendEmail: false,
                            password: data.password,
                            email: data.email,
                        };
                    } else {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            password: data.password,
                            email: data.email,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.thisAccount.id,
                            wanttoSendEmail: false
                        }; // data.wanttoSendEmail
                    }
                    if (data.licenseNumber) {
                        postdata['licenseNumber'] = data.licenseNumber;
                    }
                    if (data.documents)
                        postdata['documents'] = data.documents;
                    if (data.joiningDate)
                        postdata['joiningDate'] = data.joiningDate;

                    if (data.revalidate)
                        postdata['revalidate'] = data.revalidate;

                    return $http.post($rootScope.ipAddress + '/user/accountAdminCreationFromAPICall/', postdata).then(function(data) {
                        notificationService.successNotify('User registered sucessfully...', 5000);
                        $rootScope.loadRunner = false;
                        return data;
                    });
                } else { // default venue true
                    if (data.role == 'driver') {
                        postdata = {
                            email: data.email,
                            // defaultVenue: $rootScope.thisAccount.defaultVenue.id,
                            fullName: data.fullName,
                            userName: data.userName,
                            licenseNumber: data.licenseNumber,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.thisAccount.id,
                            wanttoSendEmail: false
                        };
                    } else {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            password: data.password,
                            email: data.email,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.thisAccount.id,
                            // defaultVenue: $rootScope.thisAccount.defaultVenue.id,
                            wanttoSendEmail: false
                        };

                    }
                    if (data.licenseNumber) {
                        postdata['licenseNumber'] = data.licenseNumber;
                    }
                    if (data.documents)
                        postdata['documents'] = data.documents;
                    if (data.joiningDate)
                        postdata['joiningDate'] = data.joiningDate;

                    if (data.revalidate)
                        postdata['revalidate'] = data.revalidate;

                    postdata['id'] = $rootScope.$user.accountID.id
                    if (!data.defaultVenue) {
                        return $http.get($rootScope.ipAddress + '/account/' + $rootScope.thisAccount.id + "?populate=null").success(function(accountDataFound) {
                            postdata['defaultVenue'] = accountDataFound.defaultVenue;
                            return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {

                                notificationService.successNotify('User registered sucessfully...', 5000);
                                $rootScope.loadRunner = false;
                                // $state.go('app.accountUserList');
                                if ($rootScope.$user.role == 'admin')
                                    $rootScope.thisAccount.users.push(data.data);
                                else
                                    $rootScope.accountadminData.users.push(data.data);

                                // if($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id){
                                //     $rootScope.filteredUsers = _.filter($rootScope.accountadminData.users,(d)=>{
                                //         return (_.filter(d.venues, (v) => { return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id } ) ).length > 0 ;
                                //     });
                                // } else {
                                $http.get($rootScope.ipAddress + '/user/' + data.data.id + "?populate=venues").success((data1) => {
                                    // console.log(data1)
                                    $rootScope.filteredUsers.push(data1);
                                });
                                // $rootScope.filteredUsers.push(data.data) //   $rootScope.filteredUsers = angular.copy($rootScope.accountadminData.users);
                                // }

                                return data;
                            });
                        });
                    } else {
                        postdata['defaultVenue'] = data.defaultVenue;
                        postdata['id'] = $rootScope.$user.accountID.id
                        return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {
                            notificationService.successNotify('User registered sucessfully...', 5000);
                            $rootScope.loadRunner = false;
                            // $state.go('app.accountUserList');
                            if ($rootScope.$user.role == 'admin')
                                $rootScope.thisAccount.users.push(data.data);
                            else
                                $rootScope.accountadminData.users.push(data.data);

                            // if($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id){
                            //     $rootScope.filteredUsers = _.filter($rootScope.accountadminData.users,(d)=>{
                            //         return (_.filter(d.venues, (v) => { return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id } ) ).length > 0 ;
                            //     });
                            // } else {
                            $http.get($rootScope.ipAddress + '/user/' + data.data.id + "?populate=venues").success((data1) => {
                                // console.log(data1)
                                $rootScope.filteredUsers.push(data1);
                            });
                            // $rootScope.filteredUsers.push(data.data) //angular.copy($rootScope.accountadminData.users);
                            // }

                            return data;
                        });
                    }


                }
            } else { // superadmin false
                if ($rootScope.defaultVenueData == false) {
                    if (data.role == 'driver') {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            licenseNumber: data.licenseNumber,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.accountadminData.id,
                            wanttoSendEmail: false,
                            password: data.password,
                            email: data.email,
                        };
                    } else {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            password: data.password,
                            email: data.email,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.accountadminData.id,
                            wanttoSendEmail: false
                        }; // data.wanttoSendEmail
                    }
                    if (data.licenseNumber) {
                        postdata['licenseNumber'] = data.licenseNumber;
                    }
                    if (data.documents)
                        postdata['documents'] = data.documents;
                    if (data.joiningDate)
                        postdata['joiningDate'] = data.joiningDate;

                    if (data.revalidate)
                        postdata['revalidate'] = data.revalidate;

                    postdata['id'] = $rootScope.$user.accountID.id
                    return $http.post($rootScope.ipAddress + '/user/accountAdminCreationFromAPICall/', postdata).then(function(data) {

                        // console.log(JSON.stringify(data))
                        notificationService.successNotify('User registered sucessfully...', 5000);
                        $rootScope.loadRunner = false;
                        $http.get($rootScope.ipAddress + '/user/' + data.data.id + "?populate=venues").success((data1) => {
                            // console.log(data1)
                            $rootScope.filteredUsers.push(data1);
                        });
                        return data;
                    });
                } else {
                    if (data.role == 'driver') {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            mobile: data.mobile,
                            licenseNumber: data.licenseNumber,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.accountadminData.id,
                            // defaultVenue: $rootScope.accountadminData.defaultVenue.id,
                            wanttoSendEmail: false,
                            password: data.password,
                            email: data.email,
                        };
                    } else {
                        postdata = {
                            fullName: data.fullName,
                            userName: data.userName,
                            password: data.password,
                            email: data.email,
                            mobile: data.mobile,
                            companyName: data.companyName,
                            role: data.role,
                            id: $rootScope.accountadminData.id,
                            // defaultVenue: $rootScope.accountadminData.defaultVenue.id,
                            wanttoSendEmail: false
                        };

                    }
                    if (data.licenseNumber) {
                        postdata['licenseNumber'] = data.licenseNumber;
                    }
                    if (data.documents)
                        postdata['documents'] = data.documents;
                    if (data.joiningDate)
                        postdata['joiningDate'] = data.joiningDate;

                    if (data.revalidate)
                        postdata['revalidate'] = data.revalidate;

                    postdata['id'] = $rootScope.$user.accountID.id
                    if (!data.defaultVenue) {
                        return $http.get($rootScope.ipAddress + '/account/' + $rootScope.accountadminData.id + "?populate=null").success(function(accountDataFound) {
                            postdata['defaultVenue'] = accountDataFound.defaultVenue;
                            return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {
                                notificationService.successNotify('User registered sucessfully...', 5000);
                                $rootScope.loadRunner = false;
                                // $state.go('app.accountUserList');
                                if ($rootScope.$user.role == 'admin')
                                    $rootScope.thisAccount.users.push(data.data);
                                else
                                    $rootScope.accountadminData.users.push(data.data);

                                // if($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id){
                                //     $rootScope.filteredUsers = _.filter($rootScope.accountadminData.users,(d)=>{
                                //         return (_.filter(d.venues, (v) => { return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id } ) ).length > 0 ;
                                //     });
                                // } else {
                                $http.get($rootScope.ipAddress + '/user/' + data.data.id + "?populate=venues").success((data1) => {
                                    // console.log(data1)
                                    $rootScope.filteredUsers.push(data1);
                                });
                                // $rootScope.filteredUsers.push(data.data) // $rootScope.filteredUsers = angular.copy($rootScope.accountadminData.users);
                                // }
                                return data;
                            });
                        });
                    } else {
                        postdata['id'] = $rootScope.$user.accountID.id
                        postdata['defaultVenue'] = data.defaultVenue;
                        return $http.post($rootScope.ipAddress + '/venue/assignDefaultVenueToUserFromAPICall/', postdata).then(function(data) {
                            notificationService.successNotify('User registered sucessfully...', 5000);
                            $rootScope.loadRunner = false;
                            // $state.go('app.accountUserList');
                            if ($rootScope.$user.role == 'admin')
                                $rootScope.thisAccount.users.push(data.data);
                            else
                                $rootScope.accountadminData.users.push(data.data);

                            // if($rootScope.selectedOptionsforanAnalysis.venue && $rootScope.selectedOptionsforanAnalysis.venue.id){
                            //     $rootScope.filteredUsers = _.filter($rootScope.accountadminData.users,(d)=>{
                            //         return (_.filter(d.venues, (v) => { return v.id == $rootScope.selectedOptionsforanAnalysis.venue.id } ) ).length > 0 ;
                            //     });
                            // } else {
                            $http.get($rootScope.ipAddress + '/user/' + data.data.id + "?populate=venues").success((data1) => {
                                // console.log(data1)
                                $rootScope.filteredUsers.push(data1);
                            });
                            // $rootScope.filteredUsers = angular.copy($rootScope.accountadminData.users);
                            // }
                            return data;
                        });
                    }
                }
            }
        },
        createUserWithCustomizeData: function(thisUser) {
            $rootScope.loadRunner = true;
            var postdata = {
                userObject: {
                    fullName: thisUser.fullName,
                    userName: thisUser.userName,
                    email: thisUser.email,
                    mobile: thisUser.mobile,
                    password: thisUser.password,
                    role: thisUser.role,
                    venues: thisUser.defaultVenue,
                    joiningDate: thisUser.joiningDate,
                    documents: thisUser.documents,
                    validationType: thisUser.validationType,
                    sendReport: thisUser.sendReport,
                    outletName: thisUser.outletName,
                    extraOptions: thisUser.extraOptions
                }
            };
            if($rootScope.$user.role == 'admin')
                postdata['userObject']['accountID'] = $rootScope.thisAccount.id;
            else 
                postdata['userObject']['accountID'] = $rootScope.$user.accountID.id;

            // console.log('Admin user ' + JSON.stringify(postdata));
            return $http.post($rootScope.ipAddress + '/user/createUserWithCustomizeData/', postdata)
                .then(function(data) {
                //     console.log('Admin user ' + JSON.stringify(data));
                    notificationService.successNotify('User has been created sucessfully...', 5000);
                    $rootScope.loadRunner = false;
                    if ($rootScope.$user.role == 'admin'){
                        if(!$rootScope.thisAccount.users)
                            $rootScope.thisAccount.users = [];
                        $rootScope.thisAccount.users.push(data.data.success);
                    }
                    else
                        $rootScope.accountadminData.users.push(data.data.success);

                    $http.get($rootScope.ipAddress + '/user/' + data.data.success.id + "?populate=venues").success((data1) => {
                        if($rootScope.filteredUsers)
                            $rootScope.filteredUsers.push(data1);
                    });
                    return data.success;
                }, function(error) {
                    $rootScope.loadRunner = false;
                    return error;
                });
        },
        deleteUser: function(thisUser) {
            $rootScope.loadRunner = true;

            var postdata = { id: thisUser.id };
            return $http.post($rootScope.ipAddress + '/user/destroyUserByID/', postdata)
                .then(function(data) {
                    notificationService.successNotify('User has been deleted sucessfully...', 5000);
                    $rootScope.loadRunner = false;
                    return data;
                }, function(error) {
                    $rootScope.loadRunner = false;
                    return error;
                });

        },

        saveEditedUser: function(thisUser) {
            $rootScope.loadRunner = true;
            var postdata = {
                id: thisUser.id,
                fullName: thisUser.fullName,
                mobile: thisUser.mobile,
                email: thisUser.email,
                userName: thisUser.userName,
                companyName: thisUser.companyName
            };
            $http.post($rootScope.ipAddress + '/user/editUserByID/', postdata)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    //alert("successfully Edited...");
                    // $state.go('app.users');
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    // notificationService.errorNotify('Unable to connect to server...');
                });
        },
        deleteAccountUser: function() {
            $rootScope.loadRunner = true;
            var postdata = { id: $rootScope.thisAccountUserLogDetails.id };
            return $http.post($rootScope.ipAddress + '/user/destroyUserByID/', postdata)
                .then(function(data) {
                    $rootScope.loadRunner = false;
                    notificationService.successNotify('Account user deleted sucessfully...', 5000);
                    return data;
                }, function(error) {
                    $rootScope.loadRunner = false;
                    // notificationService.errorNotify('Unable to connect to server...');
                    return error;
                });

        },

        saveEditedAccountUser: function(thisUser) {
            $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.thisAccountUserLogDetails.id,
                fullName: $rootScope.thisAccountUserLogDetails.fullName,
                mobile: $rootScope.thisAccountUserLogDetails.mobile,
                email: $rootScope.thisAccountUserLogDetails.email,
                licenseNumber: $rootScope.thisAccountUserLogDetails.licenseNumber,
                userName: $rootScope.thisAccountUserLogDetails.userName,
                companyName: $rootScope.thisAccountUserLogDetails.companyName,
                sendReport: thisUser.sendReport,
                revalidate: thisUser.revalidate,
                extraOptions: thisUser.extraOptions
            };

            $http.post($rootScope.ipAddress + '/user/editUserByID/', postdata)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                });
        },


        saveEditedProfileUser: function(thisUser) {
            $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.$user.id,
                fullName: thisUser.fullName,
                mobile: thisUser.mobile,
                email: thisUser.email,
                userName: thisUser.userName,
                companyName: thisUser.companyName
            };
            $http.post($rootScope.ipAddress + '/user/editUserByID/', postdata)
                .success(function(data) {
                    $rootScope.loadRunner = false;

                    $rootScope.$user['fullName'] = thisUser.fullName;
                    $rootScope.$user['mobile'] = thisUser.mobile;
                    $rootScope.$user['email'] = thisUser.email;
                    $rootScope.$user['userName'] = thisUser.userName;
                    $rootScope.$user['companyName'] = thisUser.companyName;
                    localStorageService.set("VPSUser", $rootScope.$user);

                    // console.log(JSON.stringify($rootScope.$user));
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    // notificationService.errorNotify('Unable to connect to server...');
                });
        },


        getUserDetails: function() {
            $rootScope.loadRunner = true;
            var postdata = {
                id: $rootScope.$user.id
            };
            // console.log('useremail' + JSON.stringify(postdata));
            $http.post($rootScope.ipAddress + '/user/getUserDetails/', postdata)
                .success(function(data) {
                    $rootScope.loadRunner = false;
                    $rootScope.$user.profileImage = data.profileImage;
                }).error(function(data) {
                    $rootScope.loadRunner = false;
                    // notificationService.errorNotify('Unable to connect to server...');
                });

        }



    }

});