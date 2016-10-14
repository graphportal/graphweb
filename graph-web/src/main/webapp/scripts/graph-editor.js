var graphVisApp = angular.module('graphVisApp', []);

graphVisApp.filter('encodeURIComponent', function() {
	return window.encodeURIComponent;
});

graphVisApp.factory('graphDataFactory', function($http) {
	var factory = {};
	var restRoot = 'resource/graph/';
	factory.getNodeGraphVo = function(nodeId, width, height) {
		return $http.get(restRoot + 'graph/node/' + nodeId + '?width=' + width + '&height=' + height);
	};
	
	factory.getSaveGraph = function(nodeGraphVo) {
		return $http.post(restRoot + 'graph/nodes/', nodeGraphVo);
	};
	factory.getEdgeTypes = function() {
		return $http.get(restRoot + 'edge-types');
	};
	factory.getNode = function(nodeId) {
		return $http.get(restRoot + 'node/' + nodeId);
	};
	
	return factory;
});

graphVisApp.controller('GraphVisCtrl', function($scope, $location, graphDataFactory, $http, $filter) {
	$scope.alerts = [];
	$scope.closeAlert = function(index) {
		$scope.alerts.splice(index, 1);
	};
	if ($location.search().nodeId) {
	  $scope.nodeId = $filter('encodeURIComponent') ($location.search().nodeId);
	} else {
		$scope.alerts.push({type: 'danger', msg: "Node Id is not specified in the URL"});
	}
	$scope.stopAnimation = false;
	
	graphDataFactory.getNode($scope.nodeId).then(
			function(response) { 
				$scope.node = response.data;
				$scope.domainId = $scope.node.domainId;},
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
			});
	
	graphDataFactory.getEdgeTypes().then(
		function(response) { 
			$scope.edgeTypes = response.data;
			if ($scope.edgeTypes.length >= 1) {
				$scope.edgeType = $scope.edgeTypes[0].name;
			}
		},
		function(response) { 
			$scope.alerts.push({type: 'danger', msg: response.data});
		});

	var selectedNode = -1;
	var selectedEdge = false;
	var newId = 1;
	var nodeRadius = 25;
	graphDataFactory.getNodeGraphVo($scope.nodeId, $scope.width, $scope.height).then (
			function(response) { 
				console.log(response.data);
				$scope.nodeData = response.data.nodes;
				$scope.edgeData = [];
				for (var i = 0; i < response.data.edges.length; i++) {
					$scope.edgeData[i]  = {source: getNodeIndex(response.data.edges[i].source), 
										   target: getNodeIndex(response.data.edges[i].target),
										   edgeType: response.data.edges[i].edgeType, status: ''};
				}
				drawGraph($scope);
				
//				$scope.domainId = $scope.nodeGraph.domainId;
			},
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
			}
	);
	
	function getNodeIndex(nodeId) {
		for (var i=0; i < $scope.nodeData.length; i++) {
			if ($scope.nodeData[i].id == nodeId) {
				return i;
			}
		}
		return 0;
	}
	
	window.onbeforeunload = function(){
		return "";;
	};

	$scope.save = function() {
		console.log($scope.edgeType);
		var nodeGraph = {};
		nodeGraph.nodes = $scope.nodeData;
		var edgesFromD3Graph = $scope.edgeData
		nodeGraph.edges = [];
		for (i = 0; i < edgesFromD3Graph.length; i++) { 
			nodeGraph.edges[i] = {source: edgesFromD3Graph[i].source.id, target:  edgesFromD3Graph[i].target.id, edgeType: edgesFromD3Graph[i].edgeType,  status: edgesFromD3Graph[i].status}
		}
		nodeGraph.domainId = $scope.domainId;
		console.log(nodeGraph);
		graphDataFactory.getSaveGraph(nodeGraph).then(
			function(response) { 
				$scope.reset();
			}, 
			function(response) { 
				$scope.alerts.push({type: 'danger', msg: response.data});
			}
		);
	};
	
	$scope.reset = function() {
		location.reload();
  	};
	$scope.addNode = function()  {
		if (document.getElementById('NodeName').value && document.getElementById('NodeName').value != '') {
			$scope.nodeData.push({id: 'New' + newId++, name:document.getElementById('NodeName').value,status:'N'});
			updateGraph();
		}
	}
	
	function updateGraph() {
		force.stop();
		d3.select("svg").remove();
		drawGraph($scope);
	}

	$scope.deleteNode = function() {
		if (selectedNode != -1) {
			if ($scope.nodeData[selectedNode].status != 'D') {
				for (var i = 0; i < $scope.edgeData.length; i++) {
					if ($scope.edgeData[i].source.id == $scope.nodeData[selectedNode].id || $scope.edgeData[i].target.id == $scope.nodeData[selectedNode].id) {
						$scope.edgeData[i].status = 'D';
					}
				}
				$scope.nodeData[selectedNode].status = 'D';
				selectedNode = -1;
				updateGraph();
			}
		}
	}
	
	$scope.deleteEdge = function() {
		if (selectedEdge != -1) {
			if ($scope.edgeData[selectedEdge].status != 'D') {
				$scope.edgeData[selectedEdge].status = 'D';
				selectedEdge = -1;
				updateGraph();
			}
		}
	}
	
	function drawGraph($scope) {
		var width = 1200,
			height = 700;
		var graph = d3.select("#GraphEditor").append("svg:svg")
			.attr("width", width)
			.attr("height", height);

		var force = self.force = d3.layout.force()
			.nodes($scope.nodeData)
			.links($scope.edgeData)
			.gravity(.05)
			.distance(200)
			.charge(-100)
			.size([width, height])
			.start();
			
		graph.append("svg:defs").selectAll("marker")
			.data(["end-arrow"])
			.enter().append("svg:marker")
			.attr("id", String)
			.attr("viewBox", "0 -3 10 10")
			.attr("refX", 23)
			.attr("refY", 0)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M0,-3L10,0L0,3");
		
		var link = graph.selectAll("line.link")
			.data($scope.edgeData)
			.enter().append("svg:line")
			.attr("class", function (d) { return edgeStyle(d) })
			.attr("x1", function(d) { return d.source.x; })
			.attr("y1", function(d) { return d.source.y; })
			.attr("x2", function(d) { return d.target.x; })
			.attr("y2", function(d) { return d.target.y; })
			.attr("marker-end", "url(#end-arrow)");
		
		var node_drag = d3.behavior.drag()
			.on("dragstart", dragstart)
			.on("drag", drag)
			.on("dragend", dragend);

		var node = graph.selectAll("g.node")
			.data($scope.nodeData)
			.enter().append("svg:g")
			.attr("class", "node")
			.call(node_drag);

		node.append("svg:circle")
			.attr("class", function (d) { return nodeStyle(d) })
			.attr("r", nodeRadius)
			.attr("x", "-8px")
			.attr("y", "-8px");

		node.append("svg:text")
			.attr("class", function (d) { return nodeTextStyle(d) })
			.attr("dx", nodeRadius + 2)
			.attr("dy", ".35em")
			.text(function(d) { return d.name });

		link.append("svg:text")
			.attr("dx", 100)
			.attr("class", "nodetext")
			.attr("dy", 100)
			.text(function(d) { return "abxvxcvxcvxcvxcc" }); 
		
		/*link.append("svg:text")
		.attr("dx", nodeRadius)
		.attr("class", "nodetext")
		.attr("dy", ".35em")
		.text(function(d) { return "abxvxcvxcvxcvxcc" }); */
		
		force.on("tick", tick);
		
		node.on("click", function(element) {
			selectedNode = element.index;
			if ($scope.nodeData[selectedNode].selected == 'Y') {
				$scope.nodeData[selectedNode].selected = "N";
			} else {
				for (var j = 0; j < $scope.nodeData.length; j++) {
					$scope.nodeData[j].selected = "N";
				}
				$scope.nodeData[selectedNode].selected = "Y";
			}
			
			tick();
			if (d3.event.ctrlKey) {
				if ($scope.nodeData[selectedNode].status == "") { // if not a new or deleted node
					force.stop();
					window.location = "index.html#/node/" + encodeURIComponent(element.id);
				}
			} else if (d3.event.shiftKey) {
				if ($scope.nodeData[selectedNode].status == "") {
					window.location = "graph-visual-edit.html#?nodeId=" + encodeURIComponent(element.id);
					window.location.reload();
				}
			}
		});
		link.on("click", function(element, i) {
			selectedEdge = i;
			if ($scope.edgeData[selectedEdge].selected == "Y") {
				$scope.edgeData[selectedEdge].selected = "N";
			} else {
				for (var j = 0; j < $scope.edgeData.length; j++) {
					$scope.edgeData[j].selected = "N";
				}
				$scope.edgeData[selectedEdge].selected = "Y";
			}
			tick();
		});
		function tick() {
		  node.select("circle").attr("class", function(d) {  return nodeStyle(d)});
		  
		  link.attr("x1", function(d) { return d.source.x; })
			  .attr("y1", function(d) { return d.source.y; })
			  .attr("x2", function(d) { return d.target.x; })
			  .attr("y2", function(d) { return d.target.y; })
			  .attr("class", function(d) { return edgeStyle(d);});

		  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		};
		function dragstart(d, i) {
			force.stop();
		}

		function drag(d, i) {
			d.px += d3.event.dx;
			d.py += d3.event.dy;
			d.x += d3.event.dx;
			d.y += d3.event.dy; 
			tick();
		}

		function dragend(d, i) {
			if (createEdgeIfDroppedOnNode(d)) {
				updateGraph();
			} else {
				tick();
				if (!$scope.stopAnimation) {
					force.resume();
				}
			}
		}
		
		function createEdgeIfDroppedOnNode(source) {
			var newEdgeCreated = false;
			d3.selectAll('g.node')
				.each(function(d) {
					if (source.index != d.index) {
						if (Math.abs(source.x - d.x) < nodeRadius && Math.abs(source.y - d.y) < nodeRadius) {
							if (source.status != 'D' && d.status != 'D') {
								$scope.edgeData.push({source: source.index, target: d.index, edgeType: $scope.edgeType, status: 'N'});
								newEdgeCreated = true;
							}
						}
					}
				});
			return newEdgeCreated;
		}
		
		function nodeStyle(d) {
			var style = "node";
			if (d.status == "D") {
				style = "nodedeleted"
			} else if (d.status == "N") {
				style = "nodenew"
			} 
			if (d.selected == "Y") {
				style = style + " selected";
			}
			return style;
		}
		function nodeTextStyle(d) {
			if (d.status == "D") {
				return "nodetextdeleted"
			} else if (d.status == "N") {
				return "nodetextnew"
			} else {
				return "nodetext" 
			}
		}
		function edgeStyle(d) {
			var style = "edge";
			if (d.status == "D") {
				style = "edgedeleted"
			} else if (d.status == "N") {
				style = "edgenew"
			}
			if (d.selected == "Y") {
				style = style + " selectedge";
			}
			return style;
		}
		function edgeTextStyle(d) {
			if (d.status == "D") {
				return "edgetextdeleted"
			} else if (d.status == "N") {
				return "edgetextnew"
			} else {
				return "edgetext" 
			}
		}
	}	
		
});

