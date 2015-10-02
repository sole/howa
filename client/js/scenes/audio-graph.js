module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var Graph = require('./Graph')(THREE, audioContext);
	var TransitionGain = require('./TransitionGain');
	var MIDIUtils = require('midiutils');

	var nodes = [
		/*'Oscillator', // 0
		'Oscillator', // 1
		'Oscillator', // 2
		'BiquadFilter', // 3
		'BiquadFilter', // 4
		'BiquadFilter', // 5
		'Gain', // 6
		'Destination' // 7*/
	];

	var edges = [
		/*[0, 3],
		[1, 4],
		[2, 5],
		[3, 6],
		[4, 6],
		[5, 6],
		[6, 7]*/
	];

	function SceneAudioGraph() {

		Renderable.call(this, audioContext);

		var notes = [
			'C-2',
			'C-3', 'E-3', 'G-3',
			'C-4', 'E-4', 'G-4',
			'C-5', 'E-5', 'G-5',
			'C-6', 'E-6', 'G-6',
			'C-7', 'E-7', 'G-7'
		];
		
		var frequencies = [];
		var oscillators = [];
		var filters = [];
		var gain = TransitionGain(audioContext);
		var destinationIndex = notes.length * 2;

		var i = 0;
		notes.forEach(function(note, index) {
			var noteNumber = MIDIUtils.noteNameToNoteNumber(note);
			var frequency = MIDIUtils.noteNumberToFrequency(noteNumber);
			frequencies.push(frequency);
			nodes.push('Oscillator');
			nodes.push('Filter');
			edges.push([i, i + 1]);
			edges.push([i + 1, destinationIndex]);
			i += 2;
		});
		nodes.push('Destination');


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
			filters.length = 0;
			
			var cutOffFrequency = 400;
			var now = audioContext.currentTime;

			frequencies.forEach(function(f, index) {
				var oscillator = audioContext.createOscillator();
				oscillator.frequency.value = f;
				oscillator.type = 'square';
				var filter = audioContext.createBiquadFilter();
				filter.type = 'lowpass';
				filter.frequency.setValueAtTime(cutOffFrequency, now);
				oscillator.connect(filter);
				filter.connect(gain);
				oscillator.start();
				oscillators.push(oscillator);
				filters.push(filter);
			});

			gain.connect(this.audioNode);
			gain.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				gain.disconnect();
				oscillators.forEach(function(oscillator, index) {
					oscillator.stop();
					oscillator.disconnect();
					filters[index].disconnect();
				});
			});
		};

	}

	SceneAudioGraph.prototype = Object.create(Renderable.prototype);
	SceneAudioGraph.prototype.constructor = SceneAudioGraph;

	return SceneAudioGraph;
	
};
