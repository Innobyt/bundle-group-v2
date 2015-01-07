(function() {
	'use strict';

	angular.module('gamebundleApp')
	  .controller('UpdateCtrl', UpdateCtrl);
	
	UpdateCtrl.$inject=['$scope', '$stateParams', '$location', 'repository'];

	// CreateCtrl requires 1 actions of CRUD, C as in create
	function UpdateCtrl($scope, $stateParams, $location, repository) {
		//get /:bundlename from url and populate to $scope.bundlename
		$scope.formData = {};
		$scope.oldData = {};


		$scope.id = $stateParams.id;

		repository.view({
				id: $stateParams.id
			})
			.$promise.then(function(response) {

				$scope.oldData.bundlename = response.bundlename;
				$scope.oldData.gamelist = response.gamelist;
				$scope.oldData.merchant = response.merchant;

			});

		// post, repository creation ('C' in Crud)
		$scope.submit = function() {

			$scope.formData.bundlename = $scope.oldData.bundlename;
			$scope.formData.gamelist = $scope.oldData.gamelist;
			$scope.formData.merchant = $scope.oldData.merchant;

			repository.update({
				id: $scope.id
			}, $scope.formData).$promise.then(function() {

				$location.path('/list');
			});
		};

	}
})();

