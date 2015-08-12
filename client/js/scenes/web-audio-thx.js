module.exports = function(audioContext) {
	var out = audioContext.createGain();
	out.gain.value = 0.5;
	
	var oscillator = audioContext.createOscillator();

	oscillator.connect(out);
	
	out.start = function() {
		console.log('starting THX');
		oscillator.start();
		oscillator.stop(audioContext.currentTime + 0.5);
	};

	return out;
};
