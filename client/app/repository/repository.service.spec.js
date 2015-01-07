'use strict';

describe('Service: repository', function () {

  // load the service's module
  beforeEach(module('gamebundleApp'));

  // instantiate service
  var repository;
  beforeEach(inject(function (_repository_) {
    repository = _repository_;
  }));

  it('should do something', function () {
    expect(!!repository).toBe(true);
  });

});
