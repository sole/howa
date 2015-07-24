var Threedees = require('./Threedes');
var slides;

document.addEventListener('DOMContentLoaded', init);

function init() {
	console.log('ooh yea');

	var htmlSlidesElement = document.querySelector('.slides');
	slides = new Threedees();
	slides.init(htmlSlidesElement);

	var rendererContainer = document.getElementById('renderer');
	rendererContainer.appendChild(slides.domElement);

	window.addEventListener('resize', onWindowResized);

	onWindowResized();
	slides.render(0);
}

function onWindowResized() {
	var w = window.innerWidth;
	var h = window.innerHeight;
	slides.resize(w, h);
}

