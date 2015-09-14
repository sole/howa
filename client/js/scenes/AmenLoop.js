var fs = require('fs');
var Promise = require('es6-promise').Promise;
var SamplePlayer = require('openmusic-sample-player');
var amenSample = fs.readFileSync(__dirname + '/amen/amen.ogg');
var decodedSample = null;
var decodedPromise = null;

module.exports = function AmenLoop(audioContext) {

	var node;
	var sampler;

	if(decodedPromise === null) {
		decodedPromise = new Promise(function(ok, fail) {
			audioContext.decodeAudioData(amenSample.toArrayBuffer(), function(buffer) {
				console.log('amen promise');
				ok(buffer);
			}, function(error) {
				console.error('cannot decode amen');
				fail(error);
			});
		});
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
