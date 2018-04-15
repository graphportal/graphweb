var graphApp = angular.module('graphApp', [ 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap', 'ngCookies']);

graphApp.config(function($routeProvider) {
	$routeProvider
		.when('/home', {
			controller : 'DomainListController',
			templateUrl : 'partials/domain-list.html'})
			
		.when('/domain/:domainId/edit', {
			controller : 'DomainController',
			templateUrl : 'partials/domain-edit.html'})		
		
		.when('/node/:nodeId', {
			controller : 'NodeController',
			templateUrl : 'partials/node.html'})
			
		.when('/node/:nodeId/edit', {
			controller : 'NodeController',
			templateUrl : 'partials/node-edit.html'})	
			
		.when('/:relation/node/:nodeId/new/', {
			controller : 'NodeAndLinkEditController',
			templateUrl : 'partials/node-n-link-edit.html'})	
			
		.when('/content/node/:nodeId/edit', {
			controller : 'NodeController',
			templateUrl : 'partials/node-content-edit.html'})	
		
		.when('/node/:nodeId/link', {
			controller : 'NodeLinkController',
			templateUrl : 'partials/node-link.html'})

		.when('/node/:nodeId/attach', {
			controller : 'NodeAttachmentController',
			templateUrl : 'partials/node-attach.html'})
			
		.when('/nodes/domain/:domainId/', {
			controller : 'NodeListController',
			templateUrl : 'partials/node-list.html'})
			
		.when('/search/', {
			controller : 'SearchController',
			templateUrl : 'partials/search-result.html'})
		
		.when('/queries', {
			controller : 'QueryListController',
			templateUrl : 'partials/query-list.html'})
			
		.when('/query/:queryId', {
			controller : 'QueryController',
			templateUrl : 'partials/query.html'})
			
		.when('/query/:queryId/edit/', {
			controller : 'QueryController',
			templateUrl : 'partials/query-edit.html'})
			
		.when('/cb', {
			controller : 'ClipBoardController',
			templateUrl : 'partials/cb.html'})
			
		.when('/login', {
			controller : 'AuthenticationController',
			templateUrl : 'partials/auth/login.html'})
			
		.when('/register', {
			controller : 'AuthenticationController',
			templateUrl : 'partials/auth/register.html'})
			
		.when('/forgot', {
			controller : 'AuthenticationController',
			templateUrl : 'partials/auth/forgot.html'})
			
		.when('/change-pass', {
			controller : 'AuthenticationController',
			templateUrl : 'partials/auth/change-pass.html'})			
			
		.otherwise({
			controller : 'DomainListController',
			templateUrl : 'partials/not-found.html'});
	
});

graphApp.run(function($rootScope, $cookies, graphDataFactory) {
	$rootScope.title = "Graph Portal";
	if ($cookies.get("editControl") === 'true') {
		$rootScope.showControls = true;
	} else {
		$rootScope.showControls = false;
	}
	$rootScope.setEditControll = function(value) {
		$cookies.put("editControl",value);
	};
	
	graphDataFactory.getPageFragment('header').then(
		function(response) { 
			$rootScope.header = response.data.htmlFragment }, 
		function(response) { 
	});
	graphDataFactory.getPageFragment('footer').then(
		function(response) { 
			$rootScope.footer = response.data.htmlFragment }, 
		function(response) { 
	});
	graphDataFactory.getPageFragment('menu').then(
		function(response) { 
			$rootScope.menu = response.data.htmlFragment }, 
		function(response) { 
	});
});

graphApp.filter('encodeURIComponent', function() {
	return window.encodeURIComponent;
});

graphApp.directive('fileModel', ['$parse', function ($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var model = $parse(attrs.fileModel);
            var modelSetter = model.assign;
            
            element.bind('change', function(){
                scope.$apply(function(){
                    modelSetter(scope, element[0].files[0]);
                });
            });
        }
    };
}]);

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

graphApp.directive('ckEditor', function () {
	  return {
	    require: '?ngModel',
	    link: function (scope, elm, attr, ngModel) {
	      var ck = CKEDITOR.replace(elm[0]);
	      if (!ngModel) return;
	      ck.on('instanceReady', function () {
	        ck.setData(ngModel.$viewValue);
	      });
	      function updateModel() {
	        scope.$apply(function () {
	          ngModel.$setViewValue(ck.getData());
	        });
	      }
	      ck.on('change', updateModel);
	      ck.on('key', updateModel);
	      ck.on('dataReady', updateModel);

	      ngModel.$render = function (value) {
	        ck.setData(ngModel.$viewValue);
	      };
	    }
	  };
});

graphApp.factory('graphDataFactory', function($http) {
	var factory = {};
	var restRoot = 'resource/graph/';
	var restSecRoot = 'security/graph/';
	factory.getDomainList = function() {
		return $http.get(restRoot + 'domains');
	};

	factory.getDomain = function(domainId) {
		return $http.get(restRoot + 'domain/' + domainId);
	};
	factory.saveDomain = function(domain) {
		return $http.post(restRoot + 'domain', domain);
	};
	factory.deleteDomain = function(domainId) {
		return $http.delete(restRoot + 'domain/' + domainId);
	};
	
	factory.getNodeList = function(domainId) {
		return $http.get(restRoot + 'nodes/domain/' + domainId);
	};
	factory.getPagedNodeList = function(domainId, pageNumber) {
		return $http.get(restRoot + 'nodes/domain/' + domainId + '/page/' + pageNumber + '/item-count/10')
	};
	
	factory.getNode = function(nodeId) {
		return $http.get(restRoot + 'node/' + nodeId);
	};
	factory.getNodeContent = function(nodeId) {
		return $http.get(restRoot + 'node-content/' + nodeId);
	};
	factory.saveNode = function(node) {
		return $http.post(restRoot + 'node', node);
	};
	factory.saveNodeAndLink = function(saveNodeAndLink) {
		return $http.post(restRoot + 'node-link', saveNodeAndLink);
	};
	
	factory.deleteNode = function(nodeId) {
		return $http.delete(restRoot + 'node/' + nodeId);
	};
		
	factory.getNodeGraph = function(nodeId) {
		return $http.get(restRoot + 'graph/node/' + nodeId);
	};
	
	factory.getNodeAttachments = function(nodeId) {
		return $http.get(restRoot + 'attachments/node/' + nodeId);
	};
	factory.deleteAttachment = function(attachmentId) {
		return $http.delete(restRoot + 'attachment/' + attachmentId);
	};
	factory.attachToNode = function(file, nodeId) {
		var fd = new FormData();
		fd.append('file', file);
		return $http.post(restRoot + 'attach/node/' + nodeId, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
	};
	factory.getNodeParents = function(nodeId) {
		return $http.get(restRoot + 'parents/node/' + nodeId);
	};
	factory.getNodeChildren = function(nodeId) {
		return $http.get(restRoot + 'children/node/' + nodeId);
	};
	factory.linkNodes = function(linkInfo) {
		return $http.post(restRoot + 'link', linkInfo);
	};
	factory.unlinkNodes = function(fromNode, toNode, edgeName) {
		return $http.delete(restRoot + 'unlink/from/' + fromNode + '/to/' + toNode + '/link/' + edgeName);
	};
	factory.getEdgeTypes = function() {
		return $http.get(restRoot + 'edge-types');
	};	
	
	factory.getNodeContentTypes = function() {
		return [	
		     {id: 'html', name: 'Web Content (HTML)'},
			   {id: 'text', name: 'Plain Text'},
			   {id: 'text+', name: 'Text+'}
			   ];
	};
	
	factory.getNodeTypes = function() {
		return $http.get(restRoot + 'node-types');
	};
	factory.getClipBoard = function() {
		return $http.get(restRoot + 'cb');
	};
	factory.deleteFromClipBoard = function(nodeId) {
		return $http.delete(restRoot + 'cb/node/' + nodeId);
	};
	factory.copyToCb = function(nodeId) {
		return $http.post(restRoot + 'cb', nodeId);
	};
	
	factory.getQueries = function() {
		return $http.get(restRoot + 'queries');
	};
	factory.getQuery = function(queryId) {
		return $http.get(restRoot + 'query/' + queryId);
	};
	factory.saveQuery = function(query) {
		return $http.post(restRoot + 'query', query);
	};
	factory.deleteQuery = function(queryId) {
		return $http.delete(restRoot + 'query/' + queryId);
	};
	factory.runQuery = function(query) {
		return $http.post(restRoot + 'run/query', query);
	};
	
	factory.search = function(query) {
		return $http.post(restRoot + 'search', query);
	};
	
	factory.getPageFragment = function(fragmentName) {
		return $http.get(restRoot + 'page-fragment/name/' + fragmentName);
	};

	factory.getQueryResult = function(queryName) {
		return $http.get(restRoot + 'query/result/' + queryName);
	};

	factory.getLoggedUser = function() {
		return $http.get(restSecRoot + 'user/loggedin');
	};
	factory.login = function(user) {
		return $http.post(restSecRoot + 'login', user);
	};
	factory.logout = function() {
		return $http.post(restSecRoot + 'logout');
	};
	factory.register = function(user) {
		return $http.post(restSecRoot + 'user', user);
	};
	factory.forgotPassword = function(username) {
		return $http.post(restSecRoot + 'forgot-password', username);
	};
	factory.changePassword = function(passwords) {
		return $http.post(restSecRoot + 'change-password', passwords);
	};

	
	return factory;
});

function download(filename, content) {
    var pom = document.createElement('a');
    //pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
    pom.setAttribute('href', 'data:charset=utf-8,' + encodeURIComponent(content));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
        pom.click();
    }
}

graphApp.controller('DomainController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	if ($routeParams.domainId && $routeParams.domainId != 'new') {
		graphDataFactory.getDomain($filter('encodeURIComponent')($routeParams.domainId)).then(
				function(response) {
					$scope.domain = response.data;}, 
				function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
	} else {
		$scope.domain = {};
	}
	$scope.saveDomain = function() {
		graphDataFactory.saveDomain($scope.domain).then(
				function(response) {
					window.history.back();
				}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
	};
});

graphApp.controller('DomainListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getDomainList().then(
		function(response) { 
			$scope.domains = response.data;}, 
		function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deleteDomain = function(domainId) {
		graphDataFactory.deleteDomain($filter('encodeURIComponent')(domainId)).then(
			function(response) {
				graphDataFactory.getDomainList().then(
					function(response) { 
						$scope.domains = response.data;}, 
					function(response) { 
							$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('NodeController', function($scope, $routeParams, graphDataFactory, $filter, $window) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};

	$scope.contentTypes = {
		availableOptions: graphDataFactory.getNodeContentTypes(),
	    selectedOption: {id:'html'}
	};
	
	$scope.$watch('node.nodeType', function(newValue, oldValue) {
		if (newValue && oldValue && newValue != oldValue) {
			if ($scope.node && $scope.node.nodeType) {
				if ($scope.nodeTypes) {
					for (var i = 0; i < $scope.nodeTypes.length; i++) {
					    if ($scope.nodeTypes[i].name == $scope.node.nodeType) {
							$scope.selectedNodeType = $scope.nodeTypes[i];
							break;
					    }
					}
					if ($scope.selectedNodeType && $scope.selectedNodeType.attributes) {
						$scope.node.attributes = []
						for (var i = 0; i < $scope.selectedNodeType.attributes.length; i++) {
							$scope.node.attributes.push({name: $scope.selectedNodeType.attributes[i].name, value: ""});
						}
					}
				}
			}
		}
	});
	
	graphDataFactory.getNodeTypes().then(
		function(response) {
			$scope.nodeTypes = response.data;
		}, 
		function(response) {
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	
	$scope.nodeId = $routeParams.nodeId;
	if ($routeParams.nodeId && $routeParams.nodeId != 'new') {
		graphDataFactory.getNode($filter('encodeURIComponent')($scope.nodeId)).then(
			function(response) { 
				$scope.node = response.data;
				$scope.contentTypes.selectedOption = {id: $scope.node.contentType}
				graphDataFactory.getDomain($filter('encodeURIComponent')($scope.node.domainId)).then(
					function(response) { 
						$scope.domain = response.data;
					}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});

		graphDataFactory.getNodeContent($filter('encodeURIComponent')($scope.nodeId)).then(
				function(response) { 
					$scope.content = response.data.content;
					}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
			});
		graphDataFactory.getNodeAttachments($filter('encodeURIComponent')($scope.nodeId)).then(
				function(response) {
					$scope.attachments = response.data;
				}, 
				function(response) { 
					$scope.alerts.push({type: 'danger', msg: response.data});
		});
		graphDataFactory.getNodeParents($filter('encodeURIComponent')($scope.nodeId)).then(
				function(response) {
					$scope.parents = response.data;}, 
				function(response) { 
					$scope.alerts.push({type: 'danger', msg: response.data});
		});
		graphDataFactory.getNodeChildren($filter('encodeURIComponent')($scope.nodeId)).then(
				function(response) {
					$scope.children = response.data;}, 
				function(response) { 
					$scope.alerts.push({type: 'danger', msg: response.data});
		});
	} else {
		$scope.node = {};
		$scope.node.domainId = $routeParams.domainId;
	}
	
	$scope.saveNode = function() {
		$scope.node.contentType = $scope.contentTypes.selectedOption.id
		graphDataFactory.saveNode($scope.node).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.deleteNode = function(nodeId) {
		graphDataFactory.deleteNode($filter('encodeURIComponent')(nodeId)).then(
			function(response) {
				window.history.back();}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.copyToCB = function(nodeId) {
		graphDataFactory.copyToCb($filter('encodeURIComponent')(nodeId)).then(
			function(response) {}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};	
	$scope.saveContent = function() {
		$scope.node.content = $scope.content;
		graphDataFactory.saveNode($scope.node).then(
			function(response) {
				window.history.back();}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.unlink = function(fromNodeId, toNodeId, edge) {
		graphDataFactory.unlinkNodes($filter('encodeURIComponent')(fromNodeId), $filter('encodeURIComponent')(toNodeId), edge).then(
			function(response) {
				graphDataFactory.getNodeParents($filter('encodeURIComponent')($scope.nodeId)).then(
					function(response) {
						$scope.parents = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
				graphDataFactory.getNodeChildren($filter('encodeURIComponent')($scope.nodeId)).then(
					function(node) {
						$scope.children = node.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.downloadAttachment = function(attachmentId) {
		$window.open('resource/graph/attachment/' + $filter('encodeURIComponent') (attachmentId));
//		$window.location.href = graphDataFactory.downloadAttachment($filter('encodeURIComponent')(attachmentId));
	};
	$scope.deleteAttachment = function(attachmentId) {
		graphDataFactory.deleteAttachment($filter('encodeURIComponent')(attachmentId)).then(
			function(response) {
				graphDataFactory.getNodeAttachments($filter('encodeURIComponent')($scope.nodeId)).then(
					function(response) { 
						$scope.attachments = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('NodeAndLinkEditController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	// @@
	$scope.nodeAndLink = {};
	$scope.nodeAndLink.node = {}
	$scope.nodeAndLink.relation = $routeParams.relation;
	$scope.nodeAndLink.node.topLevel = false;
	$scope.nodeAndLink.fromNodeId = $routeParams.nodeId;
	$scope.nodeAndLink.node.domainId = $routeParams.domainId;
	$scope.contentTypes = {
		    availableOptions: graphDataFactory.getNodeContentTypes(),
		    selectedOption: {id:'html'}
	};
	graphDataFactory.getNode($filter('encodeURIComponent')($routeParams.nodeId)).then(
			function(response) { 
				$scope.sourceNode = response.data;
				$scope.nodeAndLink.node.nodeType = $scope.sourceNode.nodeType
				$scope.contentTypes.selectedOption.id = $scope.sourceNode.contentType;
				
			},
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
	});
	
	graphDataFactory.getEdgeTypes().then(
		function(response) { 
			$scope.edgeTypes = response.data;
			if ($scope.edgeTypes.length == 1) {
				$scope.nodeAndLink.edgeType = $scope.edgeTypes[0].name;
			}
		},
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});

	graphDataFactory.getNodeTypes().then(
		function(response) { 
			$scope.nodeTypes = response.data;
			if ($scope.edgeTypes.length == 1) {
				scope.nodeAndLink.node.nodeType = $scope.nodeTypes[0].name;
			}
		},
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	
	$scope.saveNode = function() {
		$scope.nodeAndLink.node.contentType = $scope.contentTypes.selectedOption.id;
		graphDataFactory.saveNodeAndLink($scope.nodeAndLink).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('NodeListController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.domainId = $routeParams.domainId;
	
	graphDataFactory.getDomain($filter('encodeURIComponent')($scope.domainId)).then(
		function(response) { 
			$scope.domain = response.data }, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	graphDataFactory.getPagedNodeList($filter('encodeURIComponent')($scope.domainId), 1).then(
		function(response) { 
			$scope.nodes = response.data.nodes; 
			$scope.totalItems = response.data.totalCount}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	
	$scope.currentPage = 1;

	$scope.pageChanged = function() {
		$scope.totalItems = 50;
		graphDataFactory.getPagedNodeList($filter('encodeURIComponent')($scope.domainId), $scope.currentPage).then(
			function(response) { 
				$scope.nodes = response.data.nodes;
				$scope.totalItems = response.data.totalCount}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	};

	$scope.deleteNode = function(nodeId) {
		graphDataFactory.deleteNode($filter('encodeURIComponent')(nodeId)).then(
			function(response) {
				graphDataFactory.getNodeList($filter('encodeURIComponent')($scope.domainId)).then(
					function(response) { 
						$scope.nodes = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.copyToCB = function(nodeId) {
		graphDataFactory.copyToCb($filter('encodeURIComponent')(nodeId)).then(
				function(response) {}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
	};
});

graphApp.controller('SearchController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.query = $routeParams.query;
	if (!$scope.query) {
		$scope.alerts.push({type: 'warning', msg: "Search Query cannot be empty"});
	} else {
		graphDataFactory.search($scope.query).then(
			function(response) {
				if (response.data) {
					$scope.searchResults = response.data
				} else {
					$scope.alerts.push({type: 'danger', msg: response.data});
				}
			}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}
	$scope.deleteNode = function(nodeId) {
		graphDataFactory.deleteNode($filter('encodeURIComponent')(nodeId)).then(
			function(response) {
				graphDataFactory.getNodeList($filter('encodeURIComponent')($scope.domainId)).then(
					function(response) { 
						$scope.nodes = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.copyToCB = function(nodeId) {
		graphDataFactory.copyToCb($filter('encodeURIComponent')(nodeId)).then(
			function(response) {}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('NodeLinkController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.nodeId = $routeParams.nodeId;
	graphDataFactory.getNode($filter('encodeURIComponent')($scope.nodeId)).then(
			function(response) { 
				$scope.node = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
	});
	graphDataFactory.getEdgeTypes().then(
			function(edgeTypes) { 
				$scope.edgeTypes = edgeTypes.data;}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
	});
	graphDataFactory.getClipBoard().then(
			function(response) { 
				$scope.cbNodes = response.data;}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.linkNode = function() {
		var linkNodeInfo = {};
		linkNodeInfo.fromNode = $scope.nodeId;
		if (!$scope.selectedEdgeType || $scope.selectedNodes.length == 0) {
			$scope.alerts.push({type: 'danger', msg: "Edge Type is mandatory and at least one node must be selected from Clip Board"});
		} else {
			linkNodeInfo.linkType = $scope.selectedEdgeType.name;
			linkNodeInfo.toNodes = $scope.selectedNodes;
			graphDataFactory.linkNodes(linkNodeInfo).then(
				function(nodes) {
					window.history.back();
				}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		}
	};
	$scope.isChecked = function(nodeId) {
		for ( var i = 0; i < $scope.selectedNodes.length; i++) {
			if ($scope.selectedNodes[i].id == nodeId) {
				return true;
			};
		}
		return false;
	};
	$scope.selectedNodes = [];
	$scope.updateSelection = function(checked, item) {
		if (checked) {
			$scope.selectedNodes.push(item);
		} else {
			for ( var i = 0; i < $scope.selectedNodes.length; i++) {
				if ($scope.selectedNodes[i].id == item.id) {
					$scope.selectedNodes.splice(i, 1);
				};
			};
		};
	};
});
graphApp.controller('NodeAttachmentController', function($scope, $routeParams, graphDataFactory, $filter, $window) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.nodeId = $routeParams.nodeId;
	graphDataFactory.getNode($filter('encodeURIComponent')($scope.nodeId)).then(
		function(response) { 
			$scope.node = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	graphDataFactory.getNodeAttachments($filter('encodeURIComponent')($scope.nodeId)).then(
		function(response) { 
			$scope.attachments = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deleteAttachment = function(attachmentId) {
		graphDataFactory.deleteAttachment($filter('encodeURIComponent')(attachmentId)).then(
			function(response) {
				graphDataFactory.getNodeAttachments($filter('encodeURIComponent')($scope.nodeId)).then(
					function(response) { 
						$scope.attachments = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.attachToNode = function(){
        var file = $scope.nodeAttachment;
        graphDataFactory.attachToNode(file, $filter('encodeURIComponent')($scope.nodeId)).then(
			function(response) {
				graphDataFactory.getNodeAttachments($filter('encodeURIComponent')($scope.nodeId)).then(
					function(response) { 
						$scope.attachments = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
    };
	$scope.downloadAttachment = function(attachmentId) {
		$window.open('resource/graph/attachment/' + $filter('encodeURIComponent') (attachmentId));
	};
});

graphApp.controller('QueryController', function($scope, graphDataFactory, $routeParams, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.nodes = [];
	if ($routeParams.queryId && $routeParams.queryId != 'new') {
		graphDataFactory.getQuery($filter('encodeURIComponent')($routeParams.queryId)).then(
			function(response) {
				$scope.query = response.data;}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	} else {
		$scope.query = {};
	}
	$scope.saveQuery = function() {
		graphDataFactory.saveQuery($scope.query).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.runQuery = function() {
		$scope.nodes = graphDataFactory.runQuery($scope.query).then (
			function (response) {
				$scope.nodes = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	};
	
});

graphApp.controller('QueryListController', function($scope, graphDataFactory, $filter) {
	$scope.errors = {};
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getQueries().then(
		function(response) { 
			$scope.queries = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deleteQuery = function(queryId) {
		graphDataFactory.deleteQuery($filter('encodeURIComponent')(queryId)).then(
			function(response) {
				graphDataFactory.getQueries().then(
					function(response) { 
						$scope.queries = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('ClipBoardController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getClipBoard().then(
		function(response) { 
			$scope.cbNodes = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});

	$scope.deleteClipBoardEntry = function(nodeId) {
		graphDataFactory.deleteFromClipBoard($filter('encodeURIComponent')(nodeId)).then(
			function(response) {
				graphDataFactory.getClipBoard().then(
					function(response) { 
						$scope.cbNodes = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('LoginController', function($scope, graphDataFactory, $rootScope, $window) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$rootScope.isLoggedIn = false;
	$scope.user = {};
	$scope.errors = {}
	graphDataFactory.getLoggedUser().then(
			function(response) { 
				$rootScope.loggedinUser = response.data;
				if ($rootScope.loggedinUser) {
					$rootScope.isLoggedIn = true;
				} else {
					$rootScope.isLoggedIn = false;
				}}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.logout = function() {
		graphDataFactory.logout().then(
			function(response) {
				$rootScope.isLoggedIn = false;
			}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}
	$scope.login = function() {
		if (!($scope.user.name && $scope.user.password)) {
			$window.location.href = '#/login';
		} else {
			usr = {}
			usr.name = $scope.user.name;
			usr.password = Base64.encode($scope.user.password);
			graphDataFactory.login(usr).then(
				function(response) {
					$rootScope.isLoggedIn = true;
				}, 
				function(response) { 
					$window.location.href = '#/login?username=' + usr.name + '&error=true' ;
			});
		}
	}
});

graphApp.controller('PageController', function($scope, graphDataFactory, $filter, $rootScope) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};

});

graphApp.controller('AuthenticationController', function($scope, graphDataFactory, $filter, $rootScope) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		    $scope.alerts.splice(index, 1);
	};
	$scope.login = function() {
		user = {};
		user.name = $scope.username;
		user.password = Base64.encode($scope.password);
		graphDataFactory.login(user).then(
			function(response) { 
				$rootScope.isLoggedIn = true;
				window.history.back();
				}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}
	$scope.logout = function() {
		graphDataFactory.logout().then(
			function(response) {}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}
	$scope.saveUser = function() {
		$scope.user.password = Base64.encode($scope.user.password);
		graphDataFactory.register($scope.user).then(
			function(response) { 
				$scope.todo = response.data;
				window.history.back();
				}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}
	$scope.forgotPassword = function() {
		graphDataFactory.forgotPassword($scope.username).then(
			function(response) { 
				$scope.todo = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}
	$scope.changePassword = function() {
		//TODO
		passwords = {} 
		if ($scope.newPassword1 != $scope.newPassword2) {
			$scope.alerts.push({type: 'danger', msg: "Passwords dont match"});
			return
		}
		passwords.oldPassword = Base64.encode($scope.oldPassword);
		passwords.newPassword = Base64.encode($scope.newPassword1);
		
		graphDataFactory.changePassword(passwords).then(
			function(response) { 
				$scope.todo = response.data;}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	}

});

function search() {
	var button = document.getElementById("searchButton"),
	query =  button.form.searchQuery.value;
	window.location = "#/search?query=" + query
}

// Base64 encoding service used by AuthenticationService
// following code from https://github.com/cornflourblue/angular-registration-login-example (MIT license)
var Base64 = {

    keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        do {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output +
                this.keyStr.charAt(enc1) +
                this.keyStr.charAt(enc2) +
                this.keyStr.charAt(enc3) +
                this.keyStr.charAt(enc4);
            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";
        } while (i < input.length);

        return output;
    },

    decode: function (input) {
        var output = "";
        var chr1, chr2, chr3 = "";
        var enc1, enc2, enc3, enc4 = "";
        var i = 0;

        // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
        var base64test = /[^A-Za-z0-9\+\/\=]/g;
        if (base64test.exec(input)) {
            window.alert("There were invalid base64 characters in the input text.\n" +
                "Valid base64 characters are A-Z, a-z, 0-9, '+', '/',and '='\n" +
                "Expect errors in decoding.");
        }
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");

        do {
            enc1 = this.keyStr.indexOf(input.charAt(i++));
            enc2 = this.keyStr.indexOf(input.charAt(i++));
            enc3 = this.keyStr.indexOf(input.charAt(i++));
            enc4 = this.keyStr.indexOf(input.charAt(i++));

            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 != 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 != 64) {
                output = output + String.fromCharCode(chr3);
            }

            chr1 = chr2 = chr3 = "";
            enc1 = enc2 = enc3 = enc4 = "";

        } while (i < input.length);

        return output;
    }
};