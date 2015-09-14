module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var makeText = require('../makeText')(THREE);
	var colours = require('../colours');
	var ForceLayout = require('./publish_me/ForceLayout');

	function makeNode(text) {
		
		var textObj = makeText(text, { color: colours.primary1, size: 3 });
		textObj.geometry.center();

		var box = textObj.geometry.boundingBox;
		var size = box.size().clone().multiplyScalar(1.1);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.secondary2 });
		var geom = new THREE.BoxGeometry(size.x, size.y, size.z);
		var obj = new THREE.Mesh(geom, mat);
		textObj.add(obj);

		return textObj;
	}

	function makeEdge(node1, node2) {
		var mat = new THREE.LineBasicMaterial({ color: colours.secondary1, linewidth: 2 });
		var geom = new THREE.Geometry();
		// will the line geometry update if the positions are updated? hoping so!
		geom.vertices.push(node1.position);
		geom.vertices.push(node2.position);
		var line = new THREE.Line(geom, mat);
		line.source = node1;
		line.target = node2;
		return line;
	}

	function Graph() {

		Renderable.call(this, audioContext);

	}

	Graph.prototype = Object.create(Renderable.prototype);
	Graph.prototype.constructor = Graph;


	Graph.prototype.setData = function(nodes, edges) {
		var self = this;
		var nodes3D = [];
		var edges3D = [];

		nodes.forEach(function(text) {
			var node = makeNode(text);
			nodes3D.push(node);
			self.add(node);

			// TMP
			var n = 2;
			node.position.x = n * Math.random();
			node.position.y = n * Math.random();

		});

		edges.forEach(function(edge) {
			var node1 = nodes3D[edge[0]];
			var node2 = nodes3D[edge[1]];
			var edge3D = makeEdge(node1, node2);
			self.add(edge3D);
			edges3D.push(edge3D);
		});

		this.nodes3D = nodes3D;
		this.edges3D = edges3D;
		this.edges = edges;

		var w = 60, h = w * 0.7, d = h;
		var boundingBox = new THREE.Box3(new THREE.Vector3(-w, -h, -d), new THREE.Vector3(w, h, d));

		this.layout = new ForceLayout({
			nodes: nodes3D,
			edges: edges3D
		}, {
			width: w,
			height: h,
			attraction: 2.5,
			//repulsion: 0.9,
			boundingBox: boundingBox,
			onNodePositionUpdated: function( node ) {
				// node.updateLinksGeometry();
			}
		});

		this.layout.reset();
	};

	Graph.prototype.render = function(time) {
		var updated = this.layout.update();
		if(updated) {
			this.edges3D.forEach(function(edge) {
				edge.geometry.verticesNeedUpdate = true;
			});
		}
	};

	Graph.prototype.activate = function() {
		// TODO
		this.nodes3D.forEach(function(node) {
			// tmp node.position.set(0, 0, 0);
		});

		// and distribute

	};

	Graph.prototype.deactivate = function() {
		// TODO
	};

	
	return Graph;
};
