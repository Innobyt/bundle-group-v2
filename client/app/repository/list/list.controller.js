
(function() {
	'use strict';

	angular.module('gamebundleApp')
		.controller('ListCtrl', ListCtrl);

	ListCtrl.$inject = ['$scope', '$filter', 'ngTableParams', 'repository'];

	// CreateCtrl requires 1 actions of CRUD, C as in create
	function ListCtrl($scope, $filter, ngTableParams, repository) {
		$scope.list = [];
		$scope.list = repository.query()

		.$promise.then(function(response) {
			var data = [];
			data = response;

			$scope.tableParams = new ngTableParams({
				page: 1, // show first page
				count: 10, // count per page
				filter: {
					_id: '' // initial filter
				},
				sorting: {
					_id: 'asc' // initial sorting
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