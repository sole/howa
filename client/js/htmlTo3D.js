module.exports = function(THREE) {

	var makeArray = require('make-array');
	var distributeObjects = require('./distribute-objects')(THREE);
	var Renderable = require('./Renderable')(THREE);
	var makeText = require('./makeText')(THREE);
	var colours = require('./colours');

	require('./vendor/helvetiker_regular.typeface.js');
	require('./vendor/437_Win_Regular.typeface.js');

	var replacementScenes = {
		'intro': require('./scenes/intro'),
		'nodes-taxonomy': require('./scenes/nodes-taxonomy'),
		'audio-graph': require('./scenes/audio-graph'),
		'audio-graph-simple': require('./scenes/audio-graph-simple'),
		'audio-graph-triple': require('./scenes/audio-graph-triple'),
		'gain': require('./scenes/gain'),
		'buffer-source': require('./scenes/buffer-source'),
		'buffer-source-bending': require('./scenes/buffer-source-bending'),
		'modulation': require('./scenes/modulation'),
		'stereo-panner': require('./scenes/stereo-panner'),
		'panner': require('./scenes/panner'),
		'preformatted': require('./scenes/preformatted'),
		'biquadfilter': require('./scenes/biquadfilter'),
		'analyser': require('./scenes/analyser')
	};

	var knownNodes = {
		'H1': { size: 20, colour: colours.primary1 },
		'H2': { size: 10, colour: colours.primary2 },
		'IMG': { replace: 'renderable' },
		'P': { size: 8, colour: colours.secondary1 },
		'PRE': { replace: 'preformatted', colour: colours.secondary2, size: 7 }
	};

	var knownNodesKeys = Object.keys(knownNodes);


	function isKnownNode(name) {
		return knownNodesKeys.indexOf(name) !== -1;
	}


	function elementToObject(el, THREE, audioContext) {
		var nodeProperties = knownNodes[el.nodeName];
		
		if(nodeProperties.replace) {
			return elementToReplacedObject(el, THREE, audioContext, nodeProperties);
		} else {
			return elementToTextObject(el, THREE, nodeProperties);
		}
	}


	function elementToReplacedObject(el, THREE, audioContext, nodeProperties) {
		if(nodeProperties.replace === 'renderable') {
			return elementToRenderableObject(el, THREE, audioContext, nodeProperties);
		} else if(nodeProperties.replace === 'preformatted') {
			var ctor = replacementScenes['preformatted'](THREE, audioContext);
			var instance = new ctor();
			instance.setFromElement(el);
			instance.isRenderable = false; //true;
			return instance;
		}
	}


	function elementToRenderableObject(el, THREE, audioContext, nodeProperties) {
		var key = el.dataset.replace;
		var ctor = replacementScenes[key](THREE, audioContext);
		var instance = new ctor();
		instance.isRenderable = true;
		return instance;
	}

	function elementToTextObject(el, THREE, nodeProperties) {
			
		var str = el.textContent;
		var colour = nodeProperties.colour !== undefined ? nodeProperties.colour : 0xFF00FF;
		
		return makeText(str, {
			size: nodeProperties.size,
			depth: 1,
			curveSegments: 3,
			wireframe: true,
			color: colour,
			lineWidth: 1
		});
	}

	return function htmlTo3D(html, options) {

		options = options || {};
		
		var slidePadding = options.slidePadding !== undefined ? options.slidePadding : 0;
		var audioContext = options.audioContext !== undefined ? options.audioContext : new AudioContext();
		var audioDestinationNode = audioContext.createGain();

		// Each slide is represented by a <section> element in HTML
		var slideElements = makeArray(html.querySelectorAll('section'));
		var slideObjects = slideElements.map(function(sectionElement, sectionIndex) {

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
			childElements.forEach(function(el, childI) {
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
			var helper = new THREE.FaceNormalsHelper(containerMesh, 30, colours.primary2, 1);
			helper.material.opacity = 0.0;
			helper.material.transparent = true;
			slideObject.add(helper);
			
			return slideObject;

		});

		return slideObjects;
	};
};
