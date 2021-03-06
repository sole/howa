var EventEmitter = require('events').EventEmitter;
var util = require('util');
var THREE = require('three.js');
var TWEEN = require('tween.js');
var htmlTo3D = require('./htmlTo3D')(THREE);
var distributeObjects = require('./distribute-objects')(THREE);
var colours = require('./colours');

window.THREE = THREE; // urgh, but required for the includes below
var TrackballControls = require('./vendor/TrackballControls');
var AnaglyphEffect = require('./vendor/AnaglyphEffect');

// ---

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
	var anaglyphEffect;
	var controls;
	var threeDeeSlides;
	var threeDeeWorld;
	var currentSlideNumber = -1;
	var currentRenderer = null;
	var audioContext;

	EventEmitter.call(this);

	function callCurrentRenderer(scene, camera) {
		currentRenderer.call(scene, camera);
	}

	this.init = function(htmlSlides) {

		audioContext = new AudioContext();
		limiter = audioContext.createDynamicsCompressor();

		var cheapRenderer = false;

		if(cheapRenderer) {
			renderer = new THREE.WebGLRenderer({});
		} else {
			renderer = new THREE.WebGLRenderer({ antialias: true /*, preserveDrawingBuffer: true*/ });
			renderer.setPixelRatio(window.devicePixelRatio);
		}
		renderer.setClearColor(colours.background, 1.0);


		//renderer.shadowMapEnabled = true;
		//renderer.shadowMapSoft = true;

		// Only expose the element, not the renderer
		this.domElement = renderer.domElement;

		scene = new THREE.Scene();
		// scene.add(new THREE.AmbientLight(0x444444));
		
		anaglyphEffect = new THREE.AnaglyphEffect(renderer);

		currentRenderer = renderer;

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

		//var axisHelper = new THREE.AxisHelper(100);
		//scene.add(axisHelper);
		

		threeDeeSlides = htmlTo3D(htmlSlides, {
			slidePadding: 30,
			audioContext: audioContext
		});

		threeDeeSlides.forEach(function(slide) {

			scene.add(slide);

			// TODO Insert panner node per slide using each slide absolute world position
			slide.audioNode.connect(limiter);
			
			// TMP
			//var bbhelper = new THREE.BoundingBoxHelper(slide, 0xFF00FF);
			//bbhelper.update();
			//slide.add(bbhelper); // *** TMP
			//var sceneAxis = new THREE.AxisHelper(50);
			//slide.add(sceneAxis);

		});

		// Position slides horizontally, LTR
		distributeObjects(threeDeeSlides, { dimension: 'x' });

		// Apply individual offsets
		threeDeeSlides.forEach(function(slide) {
			if(slide.options.offsetY) {
				slide.position.y += slide.options.offsetY;
			}
		});

		// Also connect the audio output of the slides to the destination!
		limiter.connect(audioContext.destination);

		/*var light = new THREE.DirectionalLight(0xdfebff, 1);
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
		scene.add(light);*/

	};

	this.resize = function(w, h) {
		renderer.setSize(w, h);
		rendererWidth = w;
		rendererHeight = h;
		anaglyphEffect.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	};

	this.toggleAnaglyph = function() {
		if(currentRenderer === renderer) {
			currentRenderer = anaglyphEffect;
		} else {
			currentRenderer = renderer;
		}
	};

	this.render = function(time) {
		controls.update();
		// Do not try to render the 'current slide' until we have been
		// told which slide is it
		if(currentSlideNumber >= 0) {
			threeDeeSlides[currentSlideNumber].render(time);
		}
		TWEEN.update(time);
		camera.lookAt(cameraTarget);
		
		currentRenderer.render(scene, camera);

	};

	
	this.show = function(slideNumber) {

		if(currentSlideNumber >= 0 && currentSlideNumber !== slideNumber) {
			var previousSlide = threeDeeSlides[currentSlideNumber];
			previousSlide.deactivate();
		}

		currentSlideNumber = slideNumber;

		var slide = threeDeeSlides[slideNumber];

		slide.activate();

		// Need to look at the center of the object
		var box = new THREE.Box3();
		box.setFromObject(slide);

		var transitionDuration = slide.options.transitionDuration !== undefined ? slide.options.transitionDuration : 1000;
		var slideCenter = box.center();

		tweenObject(cameraTarget, {
			x: slideCenter.x,
			y: slideCenter.y,
			z: slideCenter.z
		}, transitionDuration).start();

		var distance = getDistanceToFit(camera, slide.contentsObject, rendererWidth, rendererHeight);
		
		var dstCamera = slideCenter.add(new THREE.Vector3(0, 0, distance));

		// Make the camera a little more interesting by subtly going randomly left or right
		var r = 20;
		var variationX = r * (0.5 - Math.random());
		var variationY = r * (0.5 - Math.random());
		dstCamera.x += variationX;
		dstCamera.y += variationY;
		dstCamera.z += r;

		tweenObject(camera.position, {
			x: dstCamera.x,
			y: dstCamera.y,
			z: dstCamera.z
		}, transitionDuration)
			.onUpdate(function() {
				audioContext.listener.setPosition(this.x, this.y, this.z);
			})
			.start();

		this.emit('change', { index: slideNumber });

	};

	this.showNext = function() {
		var nextSlideNumber = (currentSlideNumber + 1) % threeDeeSlides.length;
		this.show(nextSlideNumber);
	};

	this.showPrevious = function() {
		var previousSlideNumber = currentSlideNumber - 1;
		if(previousSlideNumber < 0) {
			previousSlideNumber = threeDeeSlides.length - 1;
		}
		this.show(previousSlideNumber);
	};

}

util.inherits(Threedees, EventEmitter);

module.exports = Threedees;
