'use strict';

angular.module('gamebundleApp')
  .controller('AdminCtrl', function ($scope, $http, Auth, Modal, User) {

    // Use the User $resource to fetch all users
    $scope.users = User.query().$promise.then(
      function (response) {

        $scope.users = response;
        // Modal.confirm.delete returns a function that will open a modal when ran
        // We use closure to define the callback for the modal's confirm action here in the controller
        $scope.delete = Modal.confirm.delete(function(user) { // callback when modal is confirmed
          User.remove({ id: user._id });
          angular.forEach($scope.users, function(u, i) {
            if (u === user) {
              $scope.users.splice(i, 1);
            }
          });
        });
      });
  });