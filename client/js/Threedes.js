var THREE = require('n3d-threejs');
var htmlTo3D = require('./htmlTo3D');
var makeBoundingBox = require('./make-bounding-box')(THREE);

window.THREE = THREE; // urgh, but required for the include below
var TrackballControls = require('./vendor/TrackballControls');

function Threedees() {
	var renderer;
	var scene;
	var camera;
	var cameraTarget;
	var controls;

	this.init = function(htmlSlides) {

		renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
		renderer.shadowMapEnabled = true;
		renderer.shadowMapSoft = true;

		// Only expose the element, not the renderer
		this.domElement = renderer.domElement;

		scene = new THREE.Scene();
		scene.add(new THREE.AmbientLight(0x444444));

		camera = new THREE.PerspectiveCamera(60, 320 / 200, 1, 100000);
		cameraTarget = new THREE.Vector3(0, 0, 0);
		camera.position.set(0, 0, 10);
		camera.lookAt(cameraTarget);

		controls = new THREE.TrackballControls(camera);
		controls.rotateSpeed = 1.0;
		controls.zoomSpeed = 1.2;
		controls.panSpeed = 0.8;

		controls.noZoom = false;
		controls.noPan = false;

		controls.staticMoving = true;
		controls.dynamicDampingFactor = 0.3;

		// controls.keys = [ 65, 83, 68 ]; TODO what are these keys? 65 is A

		var threeDeeSlides = htmlTo3D(htmlSlides);

		console.log(threeDeeSlides);

		var lastSlidePosition = new THREE.Vector3();
		threeDeeSlides.forEach(function(slide) {
			// TODO find bounding box per slide and position horizontally LTR
			// also use minimum separation between slide
			var slideBox = makeBoundingBox(slide);
			console.log('SLIDE BOX');
			console.table(slideBox);
			scene.add(slide);
			slide.position.x = lastSlidePosition.x;
			var slideDimensions = slideBox.max.sub(slideBox.min);
			lastSlidePosition = lastSlidePosition.add(slideDimensions);
			console.table(lastSlidePosition);
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

		/*var n = 5;
		var cubeGeometry = new THREE.BoxGeometry(n, n, n);
		var material = new THREE.MeshPhongMaterial({ color: 0xFFFFFF });
		cube = new THREE.Mesh(cubeGeometry, material);
		cube.rotation.x = Math.PI / 4;
		cube.castShadow = true;

		scene.add(cube);*/

	};

	this.resize = function(w, h) {
		renderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	};

	this.render = function(time) {
		controls.update();
		camera.lookAt(cameraTarget);
		renderer.render(scene, camera);
	};

}

module.exports = Threedees;
