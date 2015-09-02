module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var colours = require('../colours');
	var distributeObjects = require('../distribute-objects')(THREE);
	
	var nodes = {
		'Generation': ['Oscillator', 'BufferSource'],
		'Manipulation': ['Filter'],
		'Analysis': ['Analyser']
	};
	
	function makeText(str) {
		
		var geom = new THREE.TextGeometry(str, {
			size: 6,
			height: 1,
			curveSegments: 3
		});

		geom.computeBoundingBox();
		geom.computeVertexNormals();
		
		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.primary1, wireframeLinewidth: 1 });
		var obj = new THREE.Mesh(geom, mat);
		
		return obj;

	}

	function makeTitle(text) {
		return makeText(text);
	}

	function makeNode(text) {
		return makeText(text);
	}


	function NodesTaxonomy() {
		
		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var oscillator;
		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.secondary1 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		mesh.position.y -= n * 4;
		this.add(mesh);

		var taxonomy3D = new THREE.Object3D();
		this.add(taxonomy3D);
		
		var row = [];
		var categories = Object.keys(nodes);
		categories.forEach(function(category) {

			var column = [];
			var category3D = new THREE.Object3D();
			row.push(category3D);
			taxonomy3D.add(category3D);
			
			var title3D = makeTitle(category);
			column.push(title3D);
			category3D.add(title3D);

			var items = nodes[category];
			console.log(category, items);

			items.forEach(function(item) {
				var item3D = makeNode(item);
				column.push(item3D);
				category3D.add(item3D);
			});


			distributeObjects(column, { offset: 0, dimension: 'y', direction: -1 });

		});

		distributeObjects(row, { dimension: 'x' });

		var box = new THREE.Box3();
		box.setFromObject(taxonomy3D);
		var boxSize = box.size();
		taxonomy3D.position.x -= boxSize.x  / 2;
		taxonomy3D.position.y -= boxSize.y;

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
			mesh.position.x = pos * 80;
		};
	
		this.activate = function() {
			var now = audioContext.currentTime;
			gain.start();
		};

		this.deactivate = function() {
			var now = audioContext.currentTime;

			gain.stop(function() {
			});
		};

	}

	NodesTaxonomy.prototype = Object.create(Renderable.prototype);
	NodesTaxonomy.prototype.constructor = NodesTaxonomy;

	return NodesTaxonomy;

};



