module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var AmenLoop = require('./AmenLoop');
	var TransitionGain = require('./TransitionGain');
	
	function BufferSource() {
		
		Renderable.call(this, audioContext);

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var amenLoop = AmenLoop(audioContext);

		amenLoop.sampler.loop = true;

		this.render = function(time) {
			var now = audioContext.currentTime;
		};
	
		this.activate = function() {
			gain.start();
			amenLoop.connect(gain);
			amenLoop.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				amenLoop.stop();
				amenLoop.disconnect();
			});

		};

	}

	BufferSource.prototype = Object.create(Renderable.prototype);
	BufferSource.prototype.constructor = BufferSource;

	return BufferSource;

};



