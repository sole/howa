// Like http://stuartmemo.com/thx-deep-note/thx-deep-note.js, but without using Theresa's helpers
// STUART MEMO IS THE BEST
// THE BEST
// T H E   B E S T
// ! ! ! ! ! ! ! ! !
module.exports = function(audioContext) {
	var out = audioContext.createGain();
	out.gain.value = 0.5;

	var oscillators = [];
	var numberOfOscillators = 30; // 30;
	var soundLength = 26;

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
			var freq = getRandomInt(200, 400);
			osc.frequency.value = freq;
			osc.frequency.setValueAtTime(freq, now);
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

			// TODO addWobble(osc) // but it doesn't seem to be used/doing anything at all anyway ?

			osc.detune.setValueAtTime(getRandomInt(-10, 10), when);

			var finalFreq;
			var finalGain = 1.0;
			var duration = 2 * soundLength / 3;
			var freqEnvEnd = when + duration;

			if(index % 2 === 0) {
				finalFreq = fundamental * 2;
				freqEnvEnd += 0.01;
			} else if(index % 3 === 0) {
				finalFreq = fundamental * 4;
				freqEnvEnd += 0.02;
				finalGain = 0.9;
			} else if(index % 4 === 0) {
				finalFreq = fundamental * 8;
				freqEnvEnd += 0.022;
				finalGain = 0.8;
			} else if(index % 5 === 0) {
				finalFreq = fundamental * 16;
				freqEnvEnd -= 0.022;
				finalGain = 0.7;
			} else if(index % 6 === 0) {
				finalFreq = fundamental * 32;
				freqEnvEnd -= 0.01;
				finalGain = 0.6;
			} else {
				finalFreq = fundamental * 64;
				finalGain = 0.3;
			}

			osc.frequency.linearRampToValueAtTime(finalFreq, freqEnvEnd);
			oscGain.gain.setValueAtTime(finalGain, when);
			
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
