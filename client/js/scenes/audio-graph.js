module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var Graph = require('./Graph')(THREE, audioContext);

	var nodes = [
		'Oscillator',
		'Destination'
	];

	var edges = [
		[0, 1]
	];

	var nodes2 = [
		'Oscillator',
		'Oscillator',
		'Oscillator',
		'Destination'
	];
	var edges2 = [
		[0, 3],
		[1, 3],
		[2, 3]
	];

	var nodes3 = [
		'Oscillator', // 0
		'Oscillator', // 1
		'BiquadFilter', // 2
		'WaveShaper', // 3
		'Convolution', // 4
		'Destination' // 5
	];

	var edges3 = [
		[0, 2],
		[1, 3],
		[2, 4],
		[3, 4],
		[4, 5]
	];

	function SceneAudioGraph() {

		Renderable.call(this, audioContext);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
		var n = 100;
		var geom = new THREE.BoxGeometry(n, n, n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		var graph = new Graph();
		graph.setData(nodes3, edges3);
		this.add(graph);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
			mesh.rotation.y += elapsed;
		};

		this.activate = function() {
			console.log('activate audio graph scene');
		};

		this.deactivate = function() {
			console.log('deactivate audio graph scene');
		};

	}

	SceneAudioGraph.prototype = Object.create(Renderable.prototype);
	SceneAudioGraph.prototype.constructor = SceneAudioGraph;

	return SceneAudioGraph;
	
};
