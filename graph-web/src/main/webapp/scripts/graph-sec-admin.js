var graphApp = angular.module('graphApp', [ 'ngRoute', 'ngSanitize', 'ngAnimate', 'ui.bootstrap']);

graphApp.filter('encodeURIComponent', function() {
  return window.encodeURIComponent;
});

graphApp.config(function($routeProvider) {
	$routeProvider
		.when('/home', {
			controller : 'UserListController',
			templateUrl : 'partials/sec-admin/user-list.html'})
			
		.when('/user/:userId', {
			controller : 'UserController',
			templateUrl : 'partials/sec-admin/user.html'})
			
		.when('/edit/user/:userId', {
			controller : 'UserController',
			templateUrl : 'partials/sec-admin/user-edit.html'})		
		
		.when('/role/', {
			controller : 'RoleListController',
			templateUrl : 'partials/sec-admin/role-list.html'})
			
		.when('/role/:roleId', {
			controller : 'RoleController',
			templateUrl : 'partials/sec-admin/role.html'})	
			
		.when('/edit/role/:roleId/', {
			controller : 'RoleController',
			templateUrl : 'partials/sec-admin/role-edit.html'})	

		.when('/service/', {
			controller : 'ServiceListController',
			templateUrl : 'partials/sec-admin/service-list.html'})
			
		.when('/service/:serviceId', {
			controller : 'ServiceController',
			templateUrl : 'partials/sec-admin/service.html'})	
			
		.when('/edit/service/:serviceId/', {
			controller : 'ServiceController',
			templateUrl : 'partials/sec-admin/service-edit.html'})			
			
		.otherwise({
			controller : 'UserListController',
			templateUrl : 'partials/not-found.html'});
	});

graphApp.factory('graphDataFactory', function($http) {
	var factory = {};
	var restRoot = 'security/graph/'; //todo
	
	factory.getUserList = function() {
		return $http.get(restRoot + 'users');
	};

	factory.getPagedUserList = function(pageNumber) {
		return $http.get(restRoot + 'users/page/' + pageNumber + '/item-count/10')
	};

	factory.getUser = function(userId) {
		return $http.get(restRoot + 'user/' + userId);
	};
	factory.saveUser = function(user) {
		return $http.post(restRoot + 'user', user);
	};
	factory.deleteUser = function(userId) {
		return $http.delete(restRoot + 'user/' + userId);
	};
	factory.getUserRoleByUserId = function(userId) {
		return $http.get(restRoot + 'role/user/' + userId);
	};
	factory.addUserRole = function(roleId, userId) {
		return $http.post(restRoot + 'role/' + roleId + '/user/' + userId);
	};
	factory.deleteUserRole = function(roleId, userId) {
		return $http.delete(restRoot + 'role/' + roleId + '/user/' + userId);
	};
	factory.getUserPermissionByUserId = function(userId) {
		return $http.get(restRoot + 'permission/user/' + userId);
	};
	factory.addUserPermission = function(permissionId, userId) {
		return $http.post(restRoot + 'permission/' + permissionId + '/user/' + userId);
	};
	factory.deleteUserPermission = function(permissionId, userId) {
		return $http.delete(restRoot + 'permission/' + permissionId + '/user/' + userId);
	};
	
	factory.getRoleList = function() {
		return $http.get(restRoot + 'roles');
	};

	factory.getRole = function(roleId) {
		return $http.get(restRoot + 'role/' + roleId);
	};
	factory.saveRole = function(role) {
		return $http.post(restRoot + 'role', role);
	};
	factory.deleteRole = function(roleId) {
		return $http.delete(restRoot + 'role/' + roleId);
	};
	factory.getRolePermissionByRoleId = function(roleId) {
		return $http.get(restRoot + 'permission/role/' + roleId);
	};
	factory.addRolePermission = function(permissionId, roleId) {
		return $http.post(restRoot + 'permission/' + permissionId + '/role/' + roleId);
	};
	factory.deleteRolePermission = function(permissionId, roleId) {
		return $http.delete(restRoot + 'permission/' + permissionId + '/role/' + roleId);
	};
	
	factory.getServiceList = function() {
		return $http.get(restRoot + 'services');
	};
	factory.getService = function(serviceId) {
		return $http.get(restRoot + 'service/' + serviceId);
	};
	factory.getServicePermissionByServiceId = function(serviceId) {
		return $http.get(restRoot + 'permission/service/' + serviceId);
	};
	factory.addServicePermission = function(permissionId, serviceId) {
		return $http.post(restRoot + 'permission/' + permissionId + '/service/' + serviceId);
	};
	factory.deleteServicePermission = function(serviceId) {
		return $http.delete(restRoot + 'permission/service/' + serviceId);
	};
	
	factory.getPermissionList = function() {
		return $http.get(restRoot + 'permissions');
	};
	
	return factory;
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

graphApp.controller('UserController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	if ($routeParams.userId && $routeParams.userId != 'new') {
		$scope.newUser = false;
		graphDataFactory.getUser($filter('encodeURIComponent')($routeParams.userId)).then(
				function(response) {
					$scope.user = response.data;}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		graphDataFactory.getUserRoleByUserId($filter('encodeURIComponent')($routeParams.userId)).then(
				function(response) {
					$scope.roles = response.data;}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		graphDataFactory.getUserPermissionByUserId($filter('encodeURIComponent')($routeParams.userId)).then(
				function(response) {
					$scope.permissions = response.data;}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		graphDataFactory.getRoleList().then(
				function(response) {
					$scope.allRoles = response.data;}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
		graphDataFactory.getPermissionList().then(
				function(response) {
					$scope.allPermissions = response.data;}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
	} else {
		$scope.user = {};
		$scope.newUser = true;
	}
	$scope.saveUser = function() {
		if ($scope.newUser) {
			$scope.user.password = Base64.encode($scope.user.password);
			console.log($scope.user)
		}
		graphDataFactory.saveUser($scope.user).then(
				function(response) {
					window.history.back();
				}, 
				function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
				});
	};
	$scope.addUserRole = function() {
		graphDataFactory.addUserRole($filter('encodeURIComponent') ($scope.selectedRole.id), $filter('encodeURIComponent') ($scope.user.id)).then(
			function(response) {
				graphDataFactory.getUserRoleByUserId($filter('encodeURIComponent')($routeParams.userId)).then(
					function(response) {
						$scope.roles = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
					});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
		
	};
	$scope.delUserRole = function(roleId, userId) {
		graphDataFactory.deleteUserRole($filter('encodeURIComponent') (roleId), $filter('encodeURIComponent') (userId)).then(
			function(response) {
				graphDataFactory.getUserRoleByUserId($filter('encodeURIComponent')($routeParams.userId)).then(
					function(response) {
						$scope.roles = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
					});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.addUserPermission = function() {
		graphDataFactory.addUserPermission($filter('encodeURIComponent') ($scope.selectedPermission.id), $filter('encodeURIComponent') ($scope.user.id)).then(
			function(response) {
				graphDataFactory.getUserPermissionByUserId($filter('encodeURIComponent')($routeParams.userId)).then(
					function(response) {
						$scope.permissions = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
					});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.delUserPermission = function(permissionId, userId) {
		graphDataFactory.deleteUserPermission($filter('encodeURIComponent') (permissionId), $filter('encodeURIComponent') (userId)).then(
			function(response) {
				graphDataFactory.getUserPermissionByUserId($filter('encodeURIComponent')($routeParams.userId)).then(
					function(response) {
						$scope.permissions = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
					});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('UserListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	$scope.currentPage = 1;
	graphDataFactory.getPagedUserList($scope.currentPage).then(
		function(response) { 
			$scope.users = response.data.users;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	
	$scope.pageChanged = function() {
		$scope.totalItems = 50;
		graphDataFactory.getPagedUserList($scope.currentPage).then(
			function(response) { 
				$scope.nodes = response.data.users;
				$scope.totalItems = response.data.totalCount}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	};

	$scope.deleteUser = function(userId) {
		graphDataFactory.deleteUser($filter('encodeURIComponent')(userId)).then(
			function(response) {
				graphDataFactory.getUserList().then(
					function(response) { 
						$scope.users = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('RoleController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	if ($routeParams.roleId && $routeParams.roleId != 'new') {
		graphDataFactory.getRole($filter('encodeURIComponent')($routeParams.roleId)).then(
			function(response) {
				$scope.role = response.data;}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
		graphDataFactory.getRolePermissionByRoleId($filter('encodeURIComponent')($routeParams.roleId)).then(
			function(response) {
				$scope.permissions = response.data;}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
		graphDataFactory.getPermissionList().then(
			function(response) {
				$scope.allPermissions = response.data;}, 
			function(response) {
					$scope.alerts.push({type: 'danger', msg: response.data});
			});
	} else {
		$scope.role = {};
	}
	$scope.saveRole = function() {
		graphDataFactory.saveRole($scope.role).then(
			function(response) {
				window.history.back();
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.addRolePermission = function() {
		graphDataFactory.addRolePermission($filter('encodeURIComponent') ($scope.selectedPermission.id), $filter('encodeURIComponent') ($scope.role.id)).then(
			function(response) {
				graphDataFactory.getRolePermissionByRoleId($filter('encodeURIComponent')($routeParams.roleId)).then(
					function(response) {
						$scope.permissions = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
					});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
	$scope.delRolePermission = function(permissionId, roleId) {
		graphDataFactory.deleteRolePermission($filter('encodeURIComponent') (permissionId), $filter('encodeURIComponent') (roleId)).then(
			function(response) {
				graphDataFactory.getRolePermissionByRoleId($filter('encodeURIComponent')($routeParams.roleId)).then(
					function(response) {
						$scope.permissions = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
					});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('RoleListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getRoleList().then(
		function(response) { 
			$scope.roles = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.deleteRole = function(roleId) {
		graphDataFactory.deleteRole($filter('encodeURIComponent')(roleId)).then(
			function(response) {
				graphDataFactory.getRoleList().then(
					function(response) { 
						$scope.roles = response.data;}, 
					function(response) { 
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	};
});

graphApp.controller('ServiceController', function($scope, $routeParams, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getService($filter('encodeURIComponent')($routeParams.serviceId)).then(
		function(response) {
			$scope.service = response.data;}, 
		function(response) {
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	graphDataFactory.getServicePermissionByServiceId($filter('encodeURIComponent')($routeParams.serviceId)).then(
		function(response) {
			$scope.permission = response.data;}, 
		function(response) {
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	graphDataFactory.getPermissionList().then(
		function(response) {
			$scope.allPermissions = response.data;}, 
		function(response) {
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
	$scope.addServicePermission = function() {
		graphDataFactory.addServicePermission($filter('encodeURIComponent') ($scope.selectedPermission.id), $filter('encodeURIComponent') ($scope.service.id)).then(
			function(response) {
				graphDataFactory.getServicePermissionByServiceId($filter('encodeURIComponent')($routeParams.serviceId)).then(
					function(response) {
						$scope.permission = response.data;}, 
					function(response) {
							$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	};
	$scope.delServicePermission = function(serviceId) {
		graphDataFactory.deleteServicePermission($filter('encodeURIComponent') (serviceId)).then(
			function(response) {
				graphDataFactory.getServicePermissionByServiceId($filter('encodeURIComponent')($routeParams.serviceId)).then(
					function(response) {
						$scope.permission = response.data;}, 
					function(response) {
						$scope.alerts.push({type: 'danger', msg: response.data});
				});
			}, 
			function(response) {
				$scope.alerts.push({type: 'danger', msg: response.data});
		});
	};
});

graphApp.controller('ServiceListController', function($scope, graphDataFactory, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
	    $scope.alerts.splice(index, 1);
	};
	graphDataFactory.getServiceList().then(
		function(response) { 
			$scope.services = response.data;}, 
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
	});
});

//Base64 encoding service used by AuthenticationService
//following code from https://github.com/cornflourblue/angular-registration-login-example (MIT license)
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