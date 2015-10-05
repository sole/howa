var fs = require('fs');
var Promise = require('es6-promise').Promise;
var SamplePlayer = require('openmusic-sample-player');
var decodedSample = null;
var decodedPromise = null;

var loadSample = function(context, samplePath) {
	return new Promise(function(ok, fail) {
		var req = new XMLHttpRequest();
		req.open('get', samplePath, true);
		req.responseType = 'arraybuffer';
		req.addEventListener('error', function() {
			fail(request.error);
		});
		req.addEventListener('load', function() {
			var response = req.response;
			if(response === null) {
				fail('Empty response');
			}

			console.log('Attempting to decode');
			context.decodeAudioData(response, function(buffer) {
				console.log('decoded');
				ok(buffer);
			},  function(error) {
				fail('Cannot decode sample at ' + samplePath + ' / ' + error);
			});
		});
		req.send();
	});
};

module.exports = function AmenLoop(audioContext) {

	var node;
	var sampler;

	if(decodedPromise === null) {
		decodedPromise = loadSample(audioContext, 'data/amen/amen.ogg');
	}

	node = audioContext.createGain();

	sampler = SamplePlayer(audioContext);

	decodedPromise.then(function(decodedSample) {
		console.log('using decoded promise');
		sampler.buffer = decodedSample;
	});
	
	node.sampler = sampler;

	node.start = function() {
		sampler.start();
		sampler.connect(node);
	};

	node.stop = function() {
		sampler.stop();
		sampler.disconnect();
	};

	return node;

};
