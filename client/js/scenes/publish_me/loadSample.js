var Promise = require('es6-promise').Promise;

module.exports = function loadSample(context, samplePath) {
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
