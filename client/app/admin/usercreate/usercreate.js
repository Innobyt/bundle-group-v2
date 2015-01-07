'use strict';

angular.module('gamebundleApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('usercreate', {
        url: '/usercreate',
        templateUrl: 'app/admin/usercreate/usercreate.html',
        controller: 'UsercreateCtrl'
      });
  });