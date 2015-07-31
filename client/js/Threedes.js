var EventEmitter = require('events').EventEmitter;
var util = require('util');
var THREE = require('n3d-threejs');
var TWEEN = require('tween.js');
var htmlTo3D = require('./htmlTo3D');
var distributeObjects = require('./distribute-objects')(THREE);


window.THREE = THREE; // urgh, but required for the include below
var TrackballControls = require('./vendor/TrackballControls');

function tweenObject(object, destination, duration) {
	var tween = object.__internalTween;
	if(tween) {
		tween.stop();
	}

	tween = new TWEEN.Tween(object);
	tween.easing(TWEEN.Easing.Exponential.Out);
	tween.to(destination, duration);

	object.__internalTween = tween;
	return tween;
}

function getDistanceToFit(camera, object, canvasWidth, canvasHeight) {
	// Sort of comes from here http://stackoverflow.com/a/25597836/205721 but slightly modified to fit both width and height
	var vFOV = camera.fov * Math.PI / 180.0; 
	var ratio = 2 * Math.tan(vFOV / 2);
	var screen = ratio * (canvasWidth / canvasHeight); 
	var box = new THREE.Box3();
	box.setFromObject(object);
	var size = box.size();
    var height = size.y;
	var width = size.x;
    var distance = 1.2 * (Math.max(width, height) / screen); // / 4 ;
	return distance;
}

function Threedees() {
	var renderer;
	var rendererWidth;
	var rendererHeight;
	var scene;
	var camera;
	var cameraTarget;
	var controls;
	var threeDeeSlides;
	var currentSlideNumber = 0;

	EventEmitter.call(this);

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
		rendererWidth = w;
		rendererHeight = h;
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	};

	this.render = function(time) {
		controls.update();
		TWEEN.update(time);
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

		var transitionDuration = 1500;
		var slideCenter = box.center();


		tweenObject(cameraTarget, {
			x: slideCenter.x,
			y: slideCenter.y,
			z: slideCenter.z
		}, transitionDuration).start();

		var distance = getDistanceToFit(camera, slide, rendererWidth, rendererHeight);
		console.log('dist', distance);
		
		//var dstCamera = slideCenter.add(new THREE.Vector3(0, 0, 50));
		var dstCamera = slideCenter.add(new THREE.Vector3(0, 0, distance));
		tweenObject(camera.position, {
			x: dstCamera.x,
			y: dstCamera.y,
			z: dstCamera.z
		}, transitionDuration).start();

		//cameraTarget.copy(slideCenter);
		//camera.position.copy(dstCamera);

		this.emit('change', { index: slideNumber });

	};

	this.showNext = function() {
		currentSlideNumber = ++currentSlideNumber % threeDeeSlides.length;
		this.show(currentSlideNumber);
	};

	this.showPrevious = function() {
		currentSlideNumber = --currentSlideNumber < 0 ? threeDeeSlides.length - 1 : currentSlideNumber;
		this.show(currentSlideNumber);
	};

}

util.inherits(Threedees, EventEmitter);

module.exports = Threedees;
