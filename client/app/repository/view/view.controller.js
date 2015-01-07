(function() {
	'use strict';

	angular.module('gamebundleApp')
	  .controller('ViewCtrl', ViewCtrl);

	ViewCtrl.$inject=['$scope', '$filter', '$stateParams', 'ngTableParams', 'repository'];
	// UpdateCtrl requires 2 actions of CRUD, 
	// 'R' as in retrieve, 'U' as in update
	function ViewCtrl($scope, $filter, $stateParams, ngTableParams, repository) {
		/*jshint validthis: true */
		$scope.gamekeys = {};
		$scope.gamekeys = repository.view({ id: $stateParams.id }).$promise.then(
			function (response) {
				$scope.bundlename = response.bundlename;
				$scope.gamelist = response.gamelist;
				$scope.bundlekeys = response.redemptions;
//				console.log(response.redemptions);

				var data = response.redemptions;

				$scope.tableParams = new ngTableParams({
					page: 1,            // show first page
					count: 10,          // count per page
				}, {
					total: data.length, // length of data
					getData: function($defer, params) {
					// use build-in angular filter

						var filteredData = params.filter() ?
							$filter('filter')(data, params.filter()) :
							data;
						var orderedData = params.sorting() ?
							$filter('orderBy')(filteredData, params.orderBy()) :
							data;

						params.total(orderedData.length); // set total for recalc pagination
						$defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
					}
				});
			});
	}
})();