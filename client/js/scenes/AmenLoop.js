var fs = require('fs');
var SamplePlayer = require('openmusic-sample-player');
var amenSample = fs.readFileSync(__dirname + '/amen/amen.ogg');
var decodedSample = null;

module.exports = function AmenLoop(audioContext) {

	var node;
	var sampler;

	if(decodedSample === null) {
		audioContext.decodeAudioData(amenSample.toArrayBuffer(), function(buffer) {
			console.log('amen decoded');
			decodedSample = buffer;
			if(sampler) {
				sampler.buffer = buffer;
			}
		}, function(error) {
			console.error('cannot decode amen');
		});
	}

	node = audioContext.createGain();

	sampler = SamplePlayer(audioContext);
	sampler.connect(node);
	sampler.buffer = decodedSample;
	node.sampler = sampler;

	node.start = function() {
		sampler.start();
	};

	node.stop = function() {
		sampler.stop();
	};

	return node;

};
