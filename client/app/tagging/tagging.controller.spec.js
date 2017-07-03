'use strict';

describe('Controller: TaggingCtrl', function () {

  // load the controller's module
  beforeEach(module('app.tagging'));

  var TaggingCtrl,
      scope,
      $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/shoppables')
      .respond({
            'shoppables': {
                'items': [
                    {
                        'uuid': 'd3b07384d113edec49eaa6238ad5ff00',
                        'title': 'Cozy Night In',
                        'uri': 'https://management.shoppingcarttechnologies.com/publishers/ads/d3b07384d113edec49eaa6238ad5ff00.js',
                        'status': 'active',
                        'updated': '1410715640579',
                        'count': '10'
                    },
                    {
                        'uuid': '71479bfd2c66064272ddc74bf58f9939',
                        'title': 'Cozy Night Out',
                        'uri': 'https://management.shoppingcarttechnologies.com/publishers/ads/71479bfd2c66064272ddc74bf58f9939.js',
                        'status': 'inactive',
                        'updated': '1410715640579',
                        'count': '1'
                    }
                ]
            }
        });

    scope = $rootScope.$new();
    TaggingCtrl = $controller('TaggingCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of shoppables to the scope', function () {
    $httpBackend.flush();
    expect(scope.shoppables.length).toBe(2);
  });
});
