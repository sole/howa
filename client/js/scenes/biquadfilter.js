module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var AmenLoop = require('./AmenLoop');
	var TransitionGain = require('./TransitionGain');
	var MouseInput = require('./MouseInput');

	
	function BiquadFilter() {
		
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

		amenLoop.connect(filter);
		amenLoop.sampler.loop = true;

		var mouseInput = new MouseInput();

		mouseInput.click = function() {
			filter.type = filterTypes[++currentType % filterTypes.length];
			console.log(filter.type);
		};

		this.render = function(time) {
			var now = audioContext.currentTime;
			var f = mouseInput.y * maxFrequency;
			filter.frequency.setValueAtTime(f, now);
		};
	
		this.activate = function() {
			gain.start();
			filter.connect(gain);
			amenLoop.start();
			mouseInput.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				amenLoop.stop();
				filter.disconnect();
			});
			mouseInput.stop();
		};

	}

	BiquadFilter.prototype = Object.create(Renderable.prototype);
	BiquadFilter.prototype.constructor = BiquadFilter;

	return BiquadFilter;

};




