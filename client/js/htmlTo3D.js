var THREE = require('n3d-threejs');
var makeArray = require('make-array');
var distributeObjects = require('./distribute-objects')(THREE);
var Renderable = require('./Renderable')(THREE);

require('./vendor/helvetiker_regular.typeface.js');

var replacementScenes = {
	'audio-context': require('./scenes/audio-context'),
	'audio-graph': require('./scenes/audio-graph'),
	'modulation': require('./scenes/modulation'),
	'stereo-panner': require('./scenes/stereo-panner'),
	'panner': require('./scenes/panner')
};

var knownNodes = {
	'H1': { size: 20 },
	'H2': { size: 10 },
	'P': { size: 8 },
	'IMG': { replace: true }
};

var knownNodesKeys = Object.keys(knownNodes);

function isKnownNode(name) {
	return knownNodesKeys.indexOf(name) !== -1;
}

function elementToObject(el, three, audioContext) {
	var nodeProperties = knownNodes[el.nodeName];
	
	if(nodeProperties.replace) {
		return elementToRenderableObject(el, three, audioContext, nodeProperties);
	} else {
		return elementToTextObject(el, three, nodeProperties);
	}
}

function elementToRenderableObject(el, three, audioContext, nodeProperties) {
	var key = el.dataset.replace;
	var ctor = replacementScenes[key](three, audioContext);
	var instance = new ctor();
	instance.isRenderable = true;
	return instance;
}

function elementToTextObject(el, THREE, nodeProperties) {
	var n = Math.round(1 + 3 * Math.random());
	var colours = [ 0xFF0000, 0x00FF00, 0x00ffFF ];
	var randColour = (colours.length * Math.random()) | 0;

	// This makes no freaking sense.
	// "height" is actually the depth (in Z),
	// "size" is the... thickness?
	//  (╯°□°）╯︵ ┻━┻
	
	var str = el.textContent;
	
	var geom = new THREE.TextGeometry(str, {
		size: nodeProperties.size,
		height: 1,
		curveSegments: 3
	});

	geom.computeBoundingBox();
	geom.computeVertexNormals();
	
	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours[randColour], wireframeLinewidth: 2 });
	var obj = new THREE.Mesh(geom, mat);
	return obj;
}

module.exports = function(html, options) {

	options = options || {};
	
	var slidePadding = options.slidePadding !== undefined ? options.slidePadding : 0;
	var audioContext = options.audioContext !== undefined ? options.audioContext : new AudioContext();
	var audioDestinationNode = audioContext.createGain();

	// Each slide is represented by a <section> element in HTML
	var slideElements = makeArray(html.querySelectorAll('section'));

	var slideObjects = slideElements.map(function(sectionElement) {

		var slideObject = new Renderable(audioContext);
		
		// We won't directly add the equivalent three dimensional objects to the slide object, but to this 
		// `contentsObject` so we can then center them inside the slide object more easily
		var contentsObject = new THREE.Object3D();

		var childElements = makeArray(sectionElement.childNodes);

		// TODO this is related to the 'empty boxes have infinity size' bug
		var dummy = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0), new THREE.MeshBasicMaterial());
		contentsObject.add(dummy);
		// ---------
		
		// Slides might have some options, let's parse them here
		var data = sectionElement.dataset;
		var slideOptions = {};
		slideObject.options = slideOptions;


		if(data.transitionDuration) {
			// In seconds - we'll convert to milliseconds
			slideOptions.transitionDuration = data.transitionDuration * 1000;
		}

		if(data.offsetY) {
			slideOptions.offsetY = data.offsetY * 1.0;
		}
		
		// Convert known element types to their counterpart 3d object representation
		var childObjects = [];
		childElements.forEach(function(el) {
			if(!isKnownNode(el.nodeName)) {
				return;
			}
			
			var obj = elementToObject(el, THREE, audioContext);
			if(obj.isRenderable) {
				slideObject.add(obj);
			} else {
				childObjects.push(obj);
				contentsObject.add(obj);
			}

			if(obj.audioNode) {
				obj.audioNode.connect(slideObject.audioNode);
			}

			//var axisHelper = new THREE.AxisHelper(50);
			//obj.add(axisHelper);

			
		});

		slideObject.add(contentsObject);

		// Keep track of which object is it-we'll use it to zoom to that object
		// and ignore other objects that might act as decorations etc
		slideObject.contentsObject = contentsObject;

		// Distributing the objects vertically, top to bottom
		distributeObjects(childObjects, { offset: 0, dimension: 'y', direction: -1 });

		var contentBox = new THREE.Box3();
		contentBox.setFromObject(contentsObject);

		// Careful here, if there are no objects inside the object, three.js creates a box
		// with "Infinity" dimensions... which messes up with everything else
		// TODO: find fix for three.js: on the setFromObject method need to detect Inf, -Inf, replace with 0, 0
		
		var boxMin = contentBox.min;
		var boxMax = contentBox.max;

		function equals(vec, value) {
			return (vec.x === value) && (vec.y === value) && (vec.z === value);
		}

		var minInf = equals(boxMin, Infinity);
		var maxInf = equals(boxMax, -Infinity);

		if(minInf && maxInf) {
			boxMin.set(0, 0, 0);
			boxMax.set(0, 0, 0);
		}

		var contentSize = contentBox.size();
		var contentCenter = contentBox.center();

		// Center objects that need to be centered horizontally
		/*childObjects.forEach(function(obj) {
			if(obj.isRenderable) {
				obj.position.x = contentCenter.x;
			}
		});*/
		
		contentsObject.position.sub(contentCenter);
	
		// Create box helper including padding so as to 'grow' the slide
		contentBox.expandByScalar(slidePadding);
		contentSize = contentBox.size();
		var containerGeom = new THREE.BoxGeometry(contentSize.x, contentSize.y, contentSize.z, 3, 2, 2);
		var containerMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, wireframe: true });
		var containerMesh = new THREE.Mesh(containerGeom, containerMat);
		containerGeom.computeFaceNormals();
		var helper = new THREE.FaceNormalsHelper(containerMesh, 30, 0xFFFF00, 1);
		helper.material.opacity = 0.75;
		helper.material.transparent = true;
		slideObject.add(helper);
		
		return slideObject;

	});

	return slideObjects;
};
