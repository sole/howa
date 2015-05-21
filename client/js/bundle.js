var rendererContainer;
var renderer;
var camera;
var contentWidth, contentHeight;

window.onload = function() {
	init();
};

function init() {
	initGraphics();

	window.addEventListener('resize', onWindowResized);

	onWindowResized();
}

function initGraphics() {

	rendererContainer = document.getElementById('renderer');
	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	rendererContainer.appendChild(renderer.domElement);

	camera = new THREE.PerspectiveCamera(60, contentWidth / contentHeight, 1, 100000);
	var cameraTarget = new THREE.Vector3( 0, 0, 0 );
	camera.position.set(0, 0, 10);
	camera.lookAt(cameraTarget);
	
}

function updateWindowDimensions() {
	contentWidth = window.innerWidth;
	contentHeight = window.innerHeight;
}

function onWindowResized() {
	updateWindowDimensions();
	renderer.setSize( contentWidth, contentHeight );
	camera.aspect = contentWidth / contentHeight;
	camera.updateProjectionMatrix();
}
