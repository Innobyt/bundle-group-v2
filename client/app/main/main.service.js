'use strict';

angular
	.module('gamebundleApp')
	.factory('mainService', mainService);

mainService.$inject = ['$resource'];

function mainService($resource) {
	return $resource('/api/gameredemptions/:id', {}, {
		update: {
			method: 'PUT',
			params: {
				id: '@id'
			}
		}
	});
}