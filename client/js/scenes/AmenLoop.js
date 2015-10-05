var fs = require('fs');
var Promise = require('es6-promise').Promise;
var SamplePlayer = require('openmusic-sample-player');
var decodedSample = null;
var decodedPromise = null;

var loadSample = require('./publish_me/loadSample');

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
