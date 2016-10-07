var graphApp = angular.module("graphApp", ['textAngular', 'ngRoute', 'ngAnimate', 'ui.bootstrap']);


graphApp.factory('graphDataFactory', function($http) {
	var factory = {};
	var restRoot = 'resource/graph/';
	
	factory.getDomain = function(domainId) {
		return $http.get(restRoot + 'domain/' + domainId);
	};
	factory.saveDomain = function(domain) {
		return $http.post(restRoot + 'domain', domain);
	};
	
	factory.getNode = function(nodeId) {
		return $http.get(restRoot + 'node/' + nodeId);
	};
	factory.saveNode = function(node) {
		return $http.post(restRoot + 'node', node);
	};
	
	return factory;
});

graphApp.directive('back', ['$window', function($window) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {
            elem.bind('click', function () {
                $window.history.back();
            });
        }
    };
}]);

graphApp.filter('encodeURIComponent', function() {
	return window.encodeURIComponent;
});

graphApp.controller('TextEditorController', function($scope, graphDataFactory, $location, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	var queryParam = $location.search();
	console.log(queryParam);
	$scope.contentFor
	if (queryParam.domainId) {
		$scope.id = queryParam.domainId
		$scope.contentFor = "domain"
		graphDataFactory.getDomain($filter('encodeURIComponent')($scope.id)).then(
			function(response) {
				$scope.domain = response.data;
				$scope.content = $scope.domain.description;
				$scope.name = $scope.domain.name;	
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	} else if (queryParam.nodeId) {
		$scope.id = queryParam.nodeId
		$scope.contentFor = "node"
		graphDataFactory.getNode($filter('encodeURIComponent')($scope.id)).then(
			function(response) {
				$scope.node = response.data;
				$scope.content = $scope.node.content;
				$scope.name = $scope.node.name;	
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.disabled = false;
	
	$scope.save = function() {
		if ($scope.contentFor == "domain") {
			$scope.domain.description = $scope.content
			graphDataFactory.saveDomain($scope.domain).then(
				function(response) {
					window.history.back();
				}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		} else if ($scope.contentFor == "node") {
			$scope.node.content = $scope.content
			graphDataFactory.saveNode($scope.node).then(
				function(response) {
					window.history.back();
				}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		} else {
			$scope.errors.serviceErrors = "Can't determine the content type"
		}
	};
});
