module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var AmenLoop = require('./AmenLoop');
	var TransitionGain = require('./TransitionGain');
	var MouseInput = require('./MouseInput');

	var Oscilloscope = require('./Oscilloscope')(THREE);

	
	function Analyser() {
		
		Renderable.call(this, audioContext);

		var maxFrequency = audioContext.sampleRate * 0.5;
		var filterTypes = [
			"lowpass",
			"highpass",
			"bandpass",
			// these don't sound as cool
			//"lowshelf",
			//"highshelf",
			//"peaking",
			"notch",
			"allpass"
		];
		var currentType = 0;
		

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var amenLoop = AmenLoop(audioContext);
		var filter = audioContext.createBiquadFilter();
		var now = audioContext.currentTime;
		console.log('current', now);
		filter.frequency.setValueAtTime(maxFrequency * 0.5, now);
		console.log(maxFrequency);

		amenLoop.connect(filter);
		amenLoop.sampler.loop = true;

		var analyser = audioContext.createAnalyser();
		var analyserData;
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.5;
		analyserData = new Uint8Array(analyser.frequencyBinCount);
		var oscilloscopeData = new Float32Array(512);

		filter.connect(analyser);

		var mouseInput = new MouseInput();

		mouseInput.click = function() {
			filter.type = filterTypes[++currentType % filterTypes.length];
		};

		var oscilloscope = new Oscilloscope();
		this.add(oscilloscope);

		this.render = function(time) {
			var now = audioContext.currentTime;
			var f = mouseInput.y * maxFrequency;
			filter.frequency.setValueAtTime(f, now);
			analyser.getByteFrequencyData(analyserData);
			updateVisualisation(analyserData);
		};
	
		this.activate = function() {
			gain.start();
			analyser.connect(gain);
			amenLoop.start();
			mouseInput.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				amenLoop.stop();
				analyser.disconnect();
			});
			mouseInput.stop();
		};

		function updateVisualisation(data) {
			var dataLength = data.length / 4;
			var dataIndex = 0;
			var numPoints = oscilloscopeData.length;
			var skipLength = Math.round(dataLength / numPoints);

			for(var j = 0; j < numPoints; j++) {
				var v =  data[dataIndex] / 255.0;
				dataIndex += skipLength;
				oscilloscopeData[j] = v;
			}

			oscilloscope.setData(oscilloscopeData);
		}

	}

	Analyser.prototype = Object.create(Renderable.prototype);
	Analyser.prototype.constructor = Analyser;

	return Analyser;

};





