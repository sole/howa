module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var colours = require('../colours');
	var distributeObjects = require('../distribute-objects')(THREE);
	
	var nodes = {
		'Generation': ['Oscillator', 'BufferSource', 'MediaElementAudioSource', 'MediaStreamAudioSource'],
		'Manipulation': ['BiquadFilter', 'Delay', 'Panner', 'StereoPanner', 'Convolver', 'DynamicsCompressor', 'WaveShaper'],
		'Analysis': ['Analyser']
	};
	
	function makeText(str, options) {
		
		var colour = options.colour !== undefined ? options.colour : 0xFF0000;

		var geom = new THREE.TextGeometry(str, {
			size: 6,
			height: 0,
			curveSegments: 3
		});

		geom.computeBoundingBox();
		geom.computeVertexNormals();
		
		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colour, wireframeLinewidth: 1 });
		var obj = new THREE.Mesh(geom, mat);

		var size = geom.boundingBox.size();
		var padSize = size.clone();
		padSize.x += 4;
		padSize.y += 1;

		var padGeom = new THREE.BoxGeometry(padSize.x, padSize.y, padSize.z);
		var padMaterial = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x00FF00, wireframeLinewidth: 0.1 });
		var pad = new THREE.Mesh(padGeom, padMaterial);
		obj.add(pad);
		pad.position.x += size.x * 0.5;
		pad.position.y += size.y * 0.5;
		padMaterial.transparent = true;
		padMaterial.opacity = 0;
		
		return obj;

	}

	function makeTitle(text) {
		return makeText(text, { colour: colours.primary2 });
	}

	function makeNode(text) {
		return makeText(text, { colour: colours.secondary1 });
	}


	function NodesTaxonomy() {
		
		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var oscillator;
		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

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
		taxonomy3D.position.y -= boxSize.y / 4;

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
		};
	
		this.activate = function() {
			// TODO: animate titles sizes/opacity or whatever
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



