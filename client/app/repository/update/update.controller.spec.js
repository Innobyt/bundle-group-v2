'use strict';

describe('Controller: UpdateCtrl', function () {

  // load the controller's module
  beforeEach(module('gamebundleApp'));

  var UpdateCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    UpdateCtrl = $controller('UpdateCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });
});
