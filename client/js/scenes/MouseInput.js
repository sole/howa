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

	function onClick(event) {
		self.click(event);
	}

	function onDoubleClick(event) {
		self.doubleClick(event);
	}


	// These can be overriden by instances
	this.click = function(event) {
	};

	this.doubleClick = function(event) {
	};


	this.start = function() {
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('click', onClick);
		window.addEventListener('dblclick', onDoubleClick);
	};

	this.stop = function() {
		window.removeEventListener('mousemove', onMouseMove);
		window.removeEventListener('click', onClick);
		window.removeEventListener('dblclick', onDoubleClick);
	};
};
