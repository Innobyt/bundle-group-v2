'use strict';

angular
	.module('gamebundleApp')
	.factory('mainService', mainService);

mainService.$inject = ['$resource'];

function mainService($resource) {
	return $resource('/api/gameredemptions/:id', {
		id: '@_id'
	}, {
		update: {
			method: 'PUT'
		}
	});
}