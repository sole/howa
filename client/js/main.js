var Threedees = require('./Threedes');
var slides;

document.addEventListener('DOMContentLoaded', init);

function init() {

	var htmlSlidesElement = document.querySelector('.slides');
	slides = new Threedees();
	slides.init(htmlSlidesElement);

	var rendererContainer = document.getElementById('renderer');
	rendererContainer.appendChild(slides.domElement);

	window.addEventListener('keyup', function(ev) {

		var keyCode = ev.keyCode;

		// Left arrow
		if(keyCode === 37 || keyCode === 33) {
			slides.showPrevious();
			// Right arrow
		} else if(keyCode === 39 || keyCode === 34) {
			slides.showNext();
			// F key
		} else if(keyCode === 70) {
			toggleFullScreen();
		}

	}, false);

	window.addEventListener('resize', onWindowResized);
	onWindowResized();

	requestAnimationFrame(render);

	slides.show(0);

}

function onWindowResized() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	slides.resize(w, h);
}

function render(t) {
	requestAnimationFrame(render);
	slides.render(t);
}

function toggleFullScreen() {
	console.error('full screen not implemented yet :(');
}
