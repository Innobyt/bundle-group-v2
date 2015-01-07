'use strict';

angular
    .module('gamebundleApp')
    .factory('repository', repository);

repository.$inject = ['$resource'];

function repository($resource) {
	return $resource('/api/gamebundles/:id', {
		id: '@_id'
	}, {
		'update': {
			method: 'PUT'
		},
		'view': {
			method: 'GET',
			isArray: false
		},
		'query': {
			method: 'GET',
			isArray: true
		},
		'getGametitles': {
			method: 'GET',
			url: 'http://sgvps6.innobyt.com:9000/api/gamerepos',
			isArray: true
		},
		'getGameredemptions': {
			method: 'GET',
			url: '/api/gameredemptions',
			isArray: true
		}
	});
}
