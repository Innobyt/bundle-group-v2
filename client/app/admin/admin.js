'use strict';

angular.module('gamebundleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      })
      .state('usercreate', {
        url: '/admin/usercreate',
        templateUrl: 'app/admin/usercreate/usercreate.html',
        controller: 'UsercreateCtrl'
      });
  });