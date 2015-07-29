var THREE = require('n3d-threejs');
var htmlTo3D = require('./htmlTo3D');
var distributeObjects = require('./distribute-objects')(THREE);

window.THREE = THREE; // urgh, but required for the include below
var TrackballControls = require('./vendor/TrackballControls');

function Threedees() {
	var renderer;
	var scene;
	var camera;
	var cameraTarget;
	var controls;
	var threeDeeSlides;

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
		camera.position.set(0, 20, 40);
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

		var axisHelper = new THREE.AxisHelper(100);
		scene.add(axisHelper);
		
		threeDeeSlides = htmlTo3D(htmlSlides);

		var lastSlidePosition = new THREE.Vector3();
		threeDeeSlides.forEach(function(slide) {

			scene.add(slide);
			
			// TMP
			var bbhelper = new THREE.BoundingBoxHelper(slide, 0xFF00FF);
			bbhelper.update();
			slide.add(bbhelper); // *** TMP

		});

		// Position slides horizontally, LTR
		// TODO use minimum separation between slide
		distributeObjects(threeDeeSlides, { dimension: 'x' });


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

	this.show = function(slideNumber) {
		console.log('showing slide', slideNumber);

		var slide = threeDeeSlides[slideNumber];
		console.log('position', slide.position);

		// Need to look at the center of the object
		var box = new THREE.Box3();
		box.setFromObject(slide);

		var slideCenter = box.center();

		cameraTarget.copy(slideCenter);
		camera.position.copy(slideCenter.add(new THREE.Vector3(0, 0, 50)));

	};

}

module.exports = Threedees;
