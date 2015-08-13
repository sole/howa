// Like http://stuartmemo.com/thx-deep-note/thx-deep-note.js, but without using Theresa's helpers
// STUART MEMO IS THE BEST
// THE BEST
// T H E   B E S T
// ! ! ! ! ! ! ! ! !
module.exports = function(audioContext) {
	var out = audioContext.createGain();
	out.gain.value = 0.5;

	var oscillators = [];
	var numberOfOscillators = 3; // 30;
	var soundLength = 1;

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function createOscillators(amount) {
		// brutal reset
		oscillators.length = 0;
		var now = audioContext.currentTime;

		for(var i = 0; i < amount; i++) {
			var osc = audioContext.createOscillator();
			osc.type = 'sawtooth';
			osc.frequency.setValueAtTime(getRandomInt(200, 400), now);
			oscillators.push(osc);
		}
		oscillators.sort(); // TODO: why and based on which criteria

	}

	function makeFilter(osc) {
		// TODO actually implement
		return audioContext.createGain();
	}

	function playOscillators(timeOffset, soundLength) {

		var when = audioContext.currentTime + timeOffset;
		var fundamental = 20.02357939482212;
		var outNode = audioContext.createGain();

		// tmp
		outNode.gain.value = 0.1;

		oscillators.forEach(function(osc, index) {

			var panner = audioContext.createStereoPanner();
			panner.pan.value = getRandomInt(-0.5, 0.5);

			var oscGain = audioContext.createGain();

			// TODO addWobble(osc)

			osc.detune.setValueAtTime(getRandomInt(-10, 10), when);

			// TODO block of if's
			
			var filter = makeFilter(osc);
			
			osc.connect(panner);
			panner.connect(filter);
			filter.connect(oscGain);
			oscGain.connect(outNode);

			osc.start(when);
			osc.stop(when + soundLength);

		});

		//outNode.gain.setValueAtTime(1.0 / oscillators.length, when);
		//TODO outNode gain envelope

		outNode.connect(out);

	}

	function stopOscillators(timeOffset) {
	}
	
	out.start = function() {
		console.log('starting THX');

		createOscillators(numberOfOscillators);
		playOscillators(0, soundLength);
	};


	out.stop = function() {
		stopOscillators(0);
	};

	return out;
};
