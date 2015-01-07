'use strict';

describe('Controller: UsercreateCtrl', function () {

  // load the controller's module
  beforeEach(module('gamebundleApp'));

  var UsercreateCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UsercreateCtrl = $controller('UsercreateCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
