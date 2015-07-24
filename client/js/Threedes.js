var THREE = require('n3d-threejs');
var htmlTo3D = require('./htmlTo3D');

function Threedees() {
	var renderer;
	var scene;
	var camera;

	this.init = function(htmlSlides) {

		renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;

		// Only expose the element, not the renderer
		this.domElement = renderer.domElement;

		scene = new THREE.Scene();
		scene.add(new THREE.AmbientLight(0x444444));

		camera = new THREE.PerspectiveCamera(60, 320 / 200, 1, 100000);
		var cameraTarget = new THREE.Vector3( 0, 0, 0 );
		camera.position.set(0, 0, 10);
		camera.lookAt(cameraTarget);

		var threeDeeSlides = htmlTo3D(htmlSlides);

		console.log(threeDeeSlides);
		threeDeeSlides.forEach(function(slide) {
			// TODO find bounding box per slide and position horizontally LTR
			// also use minimum separation between slide
			scene.add(slide);
		});

		var light = new THREE.DirectionalLight(0xdfebff, 1);
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
		cube = new THREE.Mesh(cubeGeometry, material);
		cube.rotation.x = Math.PI / 4;
		cube.castShadow = true;

		scene.add(cube);

	};

	this.resize = function(w, h) {
		renderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	};

	this.render = function(time) {
		renderer.render(scene, camera);
	};

}

module.exports = Threedees;
