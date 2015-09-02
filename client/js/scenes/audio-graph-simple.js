module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var Graph = require('./Graph')(THREE, audioContext);
	var TransitionGain = require('./TransitionGain');

	var nodes = [
		'Oscillator',
		'Destination'
	];

	var edges = [
		[0, 1]
	];

	function SceneAudioGraphSimple() {

		Renderable.call(this, audioContext);

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var graph = new Graph();
		graph.setData(nodes, edges);
		this.add(graph);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
		};

		this.activate = function() {
			oscillator = audioContext.createOscillator();
			oscillator.connect(gain);
			oscillator.start();
			gain.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				oscillator.stop();
				oscillator.disconnect();
			});
		};

	}

	SceneAudioGraphSimple.prototype = Object.create(Renderable.prototype);
	SceneAudioGraphSimple.prototype.constructor = SceneAudioGraphSimple;

	return SceneAudioGraphSimple;
	
};

