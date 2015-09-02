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

	function SceneAudioGraphSimple() {

		Renderable.call(this, audioContext);

		var graph = new Graph();
		graph.setData(nodes, edges);
		this.add(graph);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
		};

		this.activate = function() {
			console.log('activate audio graph scene');
		};

		this.deactivate = function() {
			console.log('deactivate audio graph scene');
		};

	}

	SceneAudioGraphSimple.prototype = Object.create(Renderable.prototype);
	SceneAudioGraphSimple.prototype.constructor = SceneAudioGraphSimple;

	return SceneAudioGraphSimple;
	
};

