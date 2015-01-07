(function() {
	'use strict';

	angular.module('gamebundleApp')
	  .controller('MainCtrl', MainCtrl);
	
	MainCtrl.$inject=['$scope', 'mainService'];

	// CreateCtrl requires 1 actions of CRUD, C as in create
	function MainCtrl($scope, mainService) {

		$scope.initialize = function(){
			$scope.formData = new mainService();
		};

		$scope.submit = function() {
			$scope.formData.$save(function(){
				$scope.initialize();
			});
		};
		
		$scope.initialize();
	}
//
})();