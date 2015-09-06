module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var Graph = require('./Graph')(THREE, audioContext);
	var TransitionGain = require('./TransitionGain');
	var MIDIUtils = require('midiutils');

	var nodes = [
		'Oscillator',
		'Oscillator',
		'Oscillator',
		'Destination'
	];

	var edges = [
		[0, 3],
		[1, 3],
		[2, 3]
	];

	function SceneAudioGraphTriple() {

		Renderable.call(this, audioContext);

		var notes = ['C-4', 'E-4', 'G-4'];
		var frequencies = [];
		var oscillators = [];
		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		notes.forEach(function(note) {
			var noteNumber = MIDIUtils.noteNameToNoteNumber(note);
			var frequency = MIDIUtils.noteNumberToFrequency(noteNumber);
			frequencies.push(frequency);
		});

		var graph = new Graph();
		graph.setData(nodes, edges);
		this.add(graph);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
		};

		this.activate = function() {
			oscillators.length = 0;
			frequencies.forEach(function(f) {
				oscillator = audioContext.createOscillator();
				oscillator.connect(gain);
				oscillator.frequency.value = f;
				oscillator.start();
				oscillators.push(oscillator);
			});
			gain.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				oscillators.forEach(function(oscillator) {
					oscillator.stop();
					oscillator.disconnect();
				});
			});
		};

	}

	SceneAudioGraphTriple.prototype = Object.create(Renderable.prototype);
	SceneAudioGraphTriple.prototype.constructor = SceneAudioGraphTriple;

	return SceneAudioGraphTriple;
	
};

