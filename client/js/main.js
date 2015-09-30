var analytics = require('analytics');

var Threedees = require('./Threedes');
var slides;
var toggleFullScreen = require('presentation-fullscreen');

document.addEventListener('DOMContentLoaded', init);

function init() {

	analytics('UA-384699-1');

	var htmlSlidesElement = document.querySelector('.slides');
	slides = new Threedees();
	slides.init(htmlSlidesElement);

	slides.on('change', function(ev) {
		saveURL(ev.index);
	});

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
		} else if(keyCode === 51) {
			// 3 key
			slides.toggleAnaglyph();
		}

	}, false);

	window.addEventListener('resize', onWindowResized);
	onWindowResized();

	readURL();

	requestAnimationFrame(render);

}


function saveURL(index) {
	window.location.hash = index;
}


function readURL() {
	var index = 0;

	if(window.location.hash) {
		var hash = window.location.hash;
		hash = hash.replace('#', '');
		index = parseInt(hash, 10);
		if(isNaN(index)) {
			index = 0;
		}
	}
	
	slides.show(index);
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

