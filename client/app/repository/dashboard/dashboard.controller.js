
(function() {
	'use strict';

	angular.module('gamebundleApp')
		.controller('DashboardCtrl', DashboardCtrl);

	DashboardCtrl.$inject = ['$scope', '$filter', 'ngTableParams', 'repository'];

	// CreateCtrl requires 1 actions of CRUD, C as in create
	function DashboardCtrl($scope, $filter, ngTableParams, repository) {
		$scope.dashboard = [];
		$scope.dashboard = repository.getGameredemptions()

		.$promise.then(function(response) {
			var data = [];
			data = response;

			$scope.tableParams = new ngTableParams({
				page: 1, // show first page
				count: 10, // count per page
				filter: {
					gamebundlename: '' // initial filter
				},
				sorting: {
					gamebundlename: 'asc' // initial sorting
				}
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