var THREE = require('n3d-threejs');
var rendererContainer;
var renderer;
var scene;
var camera;
var cube;
var contentWidth, contentHeight;

window.onload = function() {
	init();
};

function init() {
	initGraphics();

	window.addEventListener('resize', onWindowResized);

	onWindowResized();

	requestAnimationFrame(render);
}

function initGraphics() {

	rendererContainer = document.getElementById('renderer');
	renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
	renderer.shadowMapEnabled = true;
	renderer.shadowMapSoft = true;

	rendererContainer.appendChild(renderer.domElement);

	scene = new THREE.Scene();
	scene.add(new THREE.AmbientLight(0x444444));


	camera = new THREE.PerspectiveCamera(60, contentWidth / contentHeight, 1, 100000);
	var cameraTarget = new THREE.Vector3( 0, 0, 0 );
	camera.position.set(0, 0, 10);
	camera.lookAt(cameraTarget);

	
	var light = new THREE.DirectionalLight(0xdfebff, 1);
	//light.position.set(0, 100, 0);
	light.target.position.set(0, 0, 0);
	light.position.set(0, 200, 0);
	light.position.multiplyScalar(1.3);

	light.castShadow = true;
	light.shadowMapWidth = 1024;
	light.shadowMapHeight = 1024;
	var d = 400;
	light.shadowCameraLeft = -d;
	light.shadowCameraRight = d;
	light.shadowCameraTop = d;
	light.shadowCameraBottom = -d;

	light.shadowCameraFar = 1000;
	light.shadowDarkness = 0.5;
	scene.add(light);

	var n = 5;
	var cubeGeometry = new THREE.BoxGeometry(n, n, n);
	var material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
	//var material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
	cube = new THREE.Mesh(cubeGeometry, material);
	//material.shading = THREE.FlatShading;
	cube.rotation.x = Math.PI / 4;
	cube.castShadow = true;
	//cube.receiveShadow = true;

	scene.add(cube);


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

var lastTime = 0;

function render(t) {
	var delta = t - lastTime;
	requestAnimationFrame(render);
	cube.rotation.y += delta * 0.001;
	cube.rotation.z -= delta * 0.001;
	renderer.render(scene, camera);
	lastTime = t;
}
