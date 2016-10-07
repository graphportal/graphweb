var graphApp = angular.module('graphApp', [ 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap']);

graphApp.filter('encodeURIComponent', function() {
  return window.encodeURIComponent;
});

graphApp.config(function($routeProvider) {
	$routeProvider
		.when('/home', {
			controller : 'EdgeTypeListController',
			templateUrl : 'partials/admin/edge-type-list.html'})
			
		.when('/node-type/:nodeTypeId', {
			controller : 'NodeTypeController',
			templateUrl : 'partials/admin/node-type.html'})
			
		.when('/edit/node-type/:nodeTypeId', {
			controller : 'NodeTypeController',
			templateUrl : 'partials/admin/node-type-edit.html'})		
		
		.when('/edge-type/', {
			controller : 'EdgeTypeListController',
			templateUrl : 'partials/admin/edge-type-list.html'})
			
		.when('/edge-type/:edgeTypeId', {
			controller : 'EdgeTypeController',
			templateUrl : 'partials/admin/edge-type.html'})	
			
		.when('/edit/edge-type/:edgeTypeId/', {
			controller : 'EdgeTypeController',
			templateUrl : 'partials/admin/edge-type-edit.html'})	

		.when('/page-fragment/', {
			controller : 'PageFragmentListController',
			templateUrl : 'partials/admin/page-fragment-list.html'})
			
		.when('/page-fragment/:pageFragmentId', {
			controller : 'PageFragmentController',
			templateUrl : 'partials/admin/page-fragment.html'})	
			
		.when('/edit/page-fragment/:pageFragmentId/', {
			controller : 'PageFragmentController',
			templateUrl : 'partials/admin/page-fragment-edit.html'})			
			
		.otherwise({
			controller : 'NodeTypeListController',
			templateUrl : 'partials/not-found.html'});
});

graphApp.directive('confirm', [function () {
    return {
        priority: 100,
        restrict: 'A',
        link: {
            pre: function (scope, element, attrs) {
                var msg = attrs.confirm || "Are you sure?";

                element.bind('click', function (event) {
                    if (!confirm(msg)) {
                        event.stopImmediatePropagation();
                        event.preventDefault;
                    }
                });
            }
        }
    };
}]);

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

graphApp.factory('graphDataFactory', function($http) {
	var factory = {};
	var restRoot = 'resource/graph/'; 
	
	factory.getNodeTypeList = function() {
		return $http.get(restRoot + 'node-types');
	};

	factory.getNodeType = function(nodeTypeId) {
		return $http.get(restRoot + 'node-type/' + nodeTypeId);
	};
	factory.saveNodeType = function(nodeType) {
		return $http.post(restRoot + 'node-type', nodeType);
	};
	factory.deleteNodeType = function(nodeTypeId) {
		return $http.delete(restRoot + 'node-type/' + nodeTypeId);
	};
	factory.getEdgeTypeList = function() {
		return $http.get(restRoot + 'edge-types');
	};

	factory.getEdgeType = function(edgeTypeId) {
		return $http.get(restRoot + 'edge-type/' + edgeTypeId);
	};
	factory.saveEdgeType = function(edgeType) {
		return $http.post(restRoot + 'edge-type', edgeType);
	};
	factory.deleteEdgeType = function(edgeTypeId) {
		return $http.delete(restRoot + 'edge-type/' + edgeTypeId);
	};
	factory.getPageFragmentList = function() {
		return $http.get(restRoot + 'page-fragments');
	};

	factory.getPageFragment = function(pageFragmentId) {
		return $http.get(restRoot + 'page-fragment/' + pageFragmentId);
	};
	factory.savePageFragment = function(pageFragment) {
		return $http.post(restRoot + 'page-fragment', pageFragment);
	};
	factory.deletePageFragment = function(pageFragmentId) {
		return $http.delete(restRoot + 'page-fragment/' + pageFragmentId);
	};
	
	return factory;
});

graphApp.controller('NodeTypeListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getNodeTypeList().then(
		function(response) { 
			$scope.nodeTypes = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deleteNodeType = function(nodeTypeId) {
		graphDataFactory.deleteNodeType($filter('encodeURIComponent')(nodeTypeId)).then(
			function(response) {
				graphDataFactory.getNodeTypeList().then(
					function(response) { 
						$scope.nodeTypes = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('NodeTypeController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.nodeTypeId = $routeParams.nodeTypeId;
		if ($routeParams.nodeTypeId && $routeParams.nodeTypeId != 'new') {
		graphDataFactory.getNodeType($filter('encodeURIComponent')($scope.nodeTypeId)).then(
			function(response) { 
				$scope.nodeType = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	} else {
		$scope.nodeType = {};
	};
	$scope.deleteNodeType = function(nodeTypeId) {
		graphDataFactory.deleteNodeType($filter('encodeURIComponent')(nodeTypeId)).then(
			function(response) {
				graphDataFactory.getNodeTypes().then(
					function(response) { 
						$scope.nodeTypes = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.saveNodeType = function() {
		graphDataFactory.saveNodeType($scope.nodeType).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.errors.serviceErrors = response.data;
			});
	};
});

graphApp.controller('EdgeTypeListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		 $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getEdgeTypeList().then(
		function(response) { 
			$scope.edgeTypes = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deleteEdgeType = function(edgeTypeId) {
		graphDataFactory.deleteEdgeType($filter('encodeURIComponent')(edgeTypeId)).then(
			function(response) {
				graphDataFactory.getEdgeTypeList().then(
					function(response) { 
						$scope.edgeTypes = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('EdgeTypeController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.edgeTypeId = $routeParams.edgeTypeId;
	if ($routeParams.edgeTypeName && $routeParams.edgeTypeName != 'new') {
		graphDataFactory.getEdgeType($filter('encodeURIComponent')($scope.edgeTypeId)).then(
			function(response) { 
				$scope.edgeType = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	} else {
		$scope.edgeType = {};
	};
	$scope.deleteEdgeType = function(edgeTypeName) {
		graphDataFactory.deleteEdgeType($filter('encodeURIComponent')(edgeTypeName)).then(
			function(response) {
				graphDataFactory.getEdgeTypes().then(
					function(edgeTypes) { 
						$scope.edgeTypes = edgeTypes.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.saveEdgeType = function() {
		graphDataFactory.saveEdgeType($scope.edgeType).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('PageFragmentListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getPageFragmentList().then(
		function(response) { 
			$scope.pageFragments = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deletePageFragment = function(pageFragmentId) {
		graphDataFactory.deletePageFragment($filter('encodeURIComponent')(pageFragmentId)).then(
			function(response) {
				graphDataFactory.getPageFragmentList().then(
					function(response) { 
						$scope.pageFragments = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('PageFragmentController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	$scope.pageFragmentId = $routeParams.pageFragmentId;
	if ($routeParams.pageFragmentId && $routeParams.pageFragmentId != 'new') {
		graphDataFactory.getPageFragment($filter('encodeURIComponent')($scope.pageFragmentId)).then(
			function(response) { 
				$scope.pageFragment = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	} else {
		$scope.pageFragment = {};
	};
	$scope.deletePageFragment = function(pageFragmentName) {
		graphDataFactory.deletePageFragment($filter('encodeURIComponent')(pageFragmentName)).then(
			function(response) {
				graphDataFactory.getPageFragments().then(
					function(pageFragments) { 
						$scope.pageFragments = pageFragments.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.savePageFragment = function() {
		graphDataFactory.savePageFragment($scope.pageFragment).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});