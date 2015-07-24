var Threedees = require('./Threedes');
var slides;

document.addEventListener('DOMContentLoaded', init);

function init() {

	var htmlSlidesElement = document.querySelector('.slides');
	slides = new Threedees();
	slides.init(htmlSlidesElement);

	var rendererContainer = document.getElementById('renderer');
	rendererContainer.appendChild(slides.domElement);

	window.addEventListener('resize', onWindowResized);

	onWindowResized();

	requestAnimationFrame(render);

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
