module.exports = function() {
	var self = this;

	this.x = 0;
	this.y = 0;

	function onMouseMove(event) {
		var w = window.innerWidth;
		var h = window.innerHeight;
		var mouseX = event.clientX * 1.0;
		var mouseY = event.clientY * 1.0;
		self.x = mouseX / w;
		self.y = (h - mouseY) / h;
	}

	this.start = function() {
		window.addEventListener('mousemove', onMouseMove);
	};

	this.stop = function() {
		window.removeEventListener('mousemove', onMouseMove);
	};
};
