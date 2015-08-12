module.exports = function(audioContext) {
	var out = audioContext.createGain();

	out.start = function() {
		console.log('starting THX');
	};

	return out;
};
