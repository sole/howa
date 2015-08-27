module.exports = function(audioContext) {

	var node = audioContext.createGain();
	var maxGain = 0.25;
	var transitionLength = 1.5;

	node.start = function() {
		var now = audioContext.currentTime;
		node.gain.setValueAtTime(0, now);
		node.gain.linearRampToValueAtTime(maxGain, now + transitionLength);
	};
	
	node.stop = function(afterCallback) {
		var now = audioContext.currentTime;
		node.gain.cancelScheduledValues(now);
		node.gain.linearRampToValueAtTime(0, now + transitionLength);

		if(afterCallback) {
			setTimeout(afterCallback, transitionLength * 1000 + 1);
		}
	};

	return node;

};
