module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var MouseInput = require('./MouseInput');
	var colours = require('../colours');
	var Oscilloscope = require('./Oscilloscope')(THREE);

	navigator.getUserMedia = ( navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia ||
		navigator.msGetUserMedia);
	
	function Realtime() {
		
		Renderable.call(this, audioContext);

		var source = null;
		var stream = null;

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var now = audioContext.currentTime;

		var delay = audioContext.createDelay();
		var dryGain = audioContext.createGain();
		var delayGain = audioContext.createGain();
		var wetGain = audioContext.createGain();
		var mixGain = audioContext.createGain();

		var analyser = audioContext.createAnalyser();
		var analyserData;
		analyser.fftSize = 2048;
		analyser.smoothingTimeConstant = 0.5;
		analyserData = new Uint8Array(analyser.frequencyBinCount);
		var oscilloscopeData = new Float32Array(512);
		var analyserFunctions = [ analyser.getByteTimeDomainData, analyser.getByteFrequencyData ];
		var currentAnalyserFunction = analyser.getByteTimeDomainData;
		var currentAnalyserFunctionIndex = 0;

		dryGain.connect(delay);
		dryGain.connect(mixGain);
		wetGain.connect(mixGain);
		delay.connect(wetGain);
		mixGain.connect(analyser);
		mixGain.connect(delayGain);
		delayGain.connect(delay);

		var mouseInput = new MouseInput();

		mouseInput.doubleClick = function() {
			currentAnalyserFunctionIndex = ++currentAnalyserFunctionIndex % analyserFunctions.length;
			currentAnalyserFunction = analyserFunctions[currentAnalyserFunctionIndex];
		};

		var oscilloscope = new Oscilloscope();
		oscilloscope.initialise({
			width: 150,
			color: colours.primary2,
			lineWidth: 3
		});
		this.add(oscilloscope);

		this.render = function(time) {
			var now = audioContext.currentTime;
		
			delay.delayTime.setValueAtTime(0.1 + mouseInput.x * 1, now);
			delayGain.gain.setValueAtTime(1 - mouseInput.y * 1, now);
			currentAnalyserFunction.call(analyser, analyserData);
			updateVisualisation(analyserData);
		};
	
		this.activate = function() {
			gain.start();
			analyser.connect(gain);
			mouseInput.start();

			startAudioStream();
		};

		this.deactivate = function() {
			gain.stop(function() {
				analyser.disconnect();
				stopAudioStream();
			});
			mouseInput.stop();
		};


		function startAudioStream() {
			navigator.getUserMedia(
				{ audio: true },
				function yay(_stream) {
					stream = _stream;
					source = audioContext.createMediaStreamSource(stream);
					source.connect(dryGain);
				},
				function nope(err) {
					console.err("oh noes", err);
				}
			);
		}

		function stopAudioStream() {
			if(source !== null) {
				source.stop();
				source.disconnect();
			}
			if(stream !== null) {
				stream.stop();
			}
			source = null;
			stream = null;
		}

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

	Realtime.prototype = Object.create(Renderable.prototype);
	Realtime.prototype.constructor = Realtime;

	return Realtime;

};


