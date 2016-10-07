var graphVisApp = angular.module('graphVisApp', []);

graphVisApp.filter('encodeURIComponent', function() {
	return window.encodeURIComponent;
});

graphVisApp.factory('graphDataFactory', function($http) {
	var factory = {};
	var restRoot = 'resource/graph/';
	factory.getNodeGraphVo = function(nodeId, width, height) {
		console.log(restRoot + 'graph/node/' + nodeId + '?width=' + width + '&height=' + height);
		return $http.get(restRoot + 'graph/node/' + nodeId + '?width=' + width + '&height=' + height);
	};
	
	factory.getSaveGraph = function(nodeGraphVo) {
		return $http.post(restRoot + 'graph/nodes/', nodeGraphVo);
	};
	
	return factory;
});

graphVisApp.controller('GraphVisCtrl', function($scope, $location, graphDataFactory, $http, $filter) {
	$scope.errors = {}
	if ($location.search().nodeId) {
	  $scope.nodeId = $filter('encodeURIComponent') ($location.search().nodeId);
	} else {
	  $scope.errors.serviceErrors = "Node Id is not specified in the URL"
	}
	var selectedNode = -1;
	var selectedEdge = false;
	var newId = 1;
	var nodeRadius = 20;
	graphDataFactory.getNodeGraphVo($scope.nodeId, $scope.width, $scope.height).then (
			function(response) { 
				console.log(response.data);
				$scope.nodeData = response.data.nodes;
				$scope.edgeData  = response.data.edges;
				drawGraph();
				
//				$scope.domainId = $scope.nodeGraph.domainId;
//				$scope.nodes = $scope.nodeGraph.nodes;
//				var edgesList = $scope.nodeGraph.edges;
//				// Edge Array for the d3 graph is still references the objects in the nodes array. Hence, iterating through the edge array 
//				// and building the edge array for the graph
//				$scope.edges = [];
//				for (i = 0; i < edgesList.length; i++) { 
				// {source:1,target:0,value:1,edgeType:'Has Child', status:'',selected:'N'}
//					$scope.edges[i] = {source: $scope.nodes[edgesList[i].source], target: $scope.nodes[edgesList[i].target]}
//				}
//				graph = new GraphCreator(svg, $scope.nodes, $scope.edges);
//				graph.setIdCt($scope.nodes.length);
//				graph.updateGraph();	  
			},
			function(response) { 
				$scope.errors.serviceErrors = response.data;
			}
	);
	
	$scope.nodeData = [{node: {id: "#20:1", name:"Myriel"},status:'', selected:'N'},{node: {id: "#20:2", name:"Napoleon"},status:'', selected:'N'},
		   			 {node: {id: "#20:3", name:"Mlle.Baptistine"},status:'',selected:'N'},{node: {id: "#20:4", name:"Mme.Magloire"},status:'', selected:'N'}];
	$scope.edgeData = [{source:1,target:0,value:1,edgeType:'Has Child', status:'',selected:'N'},{source:2,target:0,value:8,edgeType:'Has Child',status:'',selected:'N'},{source:3,target:0,value:10,edgeType:'Has Child',status:'',selected:'N'}];
		
//	drawGraph();
		
//	window.onbeforeunload = function(){
//		       return "";
//	};

	$scope.save = function() {
		console.log($scope.nodeData);
		console.log($scope.edgeData);
//		var nodeGraph = {};
//		nodeGraph.nodes = graph.getNodes();
//		var edgesFromD3Graph = graph.getEdges()
//		nodeGraph.edges = [];
//		for (i = 0; i < edgesFromD3Graph.length; i++) { 
//			nodeGraph.edges[i] = {source: edgesFromD3Graph[i].source.id, target:  edgesFromD3Graph[i].target.id}
//		}
//		nodeGraph.defaultEdgeLabel = "Has"; // Get it from dropdown
//		nodeGraph.domainId = $scope.domainId;
//		graphDataFactory.getSaveGraph(nodeGraph).then(
//			function(response) { 
//				console.log(response);
//				$scope.reset();
//			}, 
//			function(response) { 
//				$scope.errors.serviceErrors = response.data;
//			}
//		);
	};
	
	$scope.reset = function() {
		location.reload();
  	};
	$scope.addNode = function()  {
		if (document.getElementById('NodeName').value && document.getElementById('NodeName').value != '') {
			$scope.nodeData.push({node: {id: newId++, name:document.getElementById('NodeName').value},group:1, status:'N'});
			updateGraph();
		}
	}
	
	function updateGraph() {
		force.stop();
		d3.select("svg").remove();
		drawGraph();
	}

	$scope.deleteNode = function() {
		if (selectedNode != -1) {
			if ($scope.nodeData[selectedNode].status != 'D') {
				for (var i = 0; i < $scope.edgeData.length; i++) {
					if ($scope.edgeData[i].source.node.id == $scope.nodeData[selectedNode].node.id || $scope.edgeData[i].target.node.id == $scope.nodeData[selectedNode].node.id) {
						$scope.edgeData[i].status = 'D';
					}
				}
				nodeData[selectedNode].status = 'D';
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
	
	function drawGraph() {
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
			.attr("viewBox", "0 -5 10 10")
			.attr("refX", 20)
			.attr("refY", 0)
			.attr("markerWidth", 6)
			.attr("markerHeight", 6)
			.attr("orient", "auto")
			.append("svg:path")
			.attr("d", "M0,-5L10,0L0,5");
		
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
			.text(function(d) { return d.node.name });

	/*	link.append("svg:text")
			.attr("dx", nodeRadius)
			.attr("class", "nodetext")
			.attr("dy", ".35em")
			.text(function(d) { return "abc" }); */
		
		force.on("tick", tick);
		
		node.on("click", function(element) {
			for (var j = 0; j < $scope.nodeData.length; j++) {
				$scope.nodeData[j].selected = "N";
			}
			selectedNode = element.index;
			$scope.nodeData[selectedNode].selected = "Y";
			tick();
			if (d3.event.ctrlKey) {
				force.stop();
				console.log("Redirecting to node node/" + element.node.id);
			}
		});
		link.on("click", function(element, i) {
			for (var j = 0; j < $scope.edgeData.length; j++) {
				$scope.edgeData[j].selected = "N";
			}
			selectedEdge = i;
			$scope.edgeData[selectedEdge].selected = "Y";
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
				console.log('Update Graph');
				updateGraph();
			} else {
				tick();
				force.resume();
			}
		}
		
		function createEdgeIfDroppedOnNode(source) {
			var newEdgeCreated = false;
			d3.selectAll('g.node')
				.each(function(d) {
					if (source.index != d.index) {
						if (Math.abs(source.x - d.x) < nodeRadius && Math.abs(source.y - d.y) < nodeRadius) {
							if (source.status != 'D' && d.status != 'D') {
								$scope.edgeData.push({source: source.index, target: d.index, edgeType: 'Has Child'});
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

