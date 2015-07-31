var THREE = require('n3d-threejs');
var makeArray = require('make-array');
var distributeObjects = require('./distribute-objects')(THREE);

require('./vendor/helvetiker_regular.typeface.js');


var knownNodes = {
	'H1': { size: 20 },
	'H2': { size: 10 },
	'P': { size: 8 }
};

var knownNodesKeys = Object.keys(knownNodes);

function isKnownNode(name) {
	return knownNodesKeys.indexOf(name) !== -1;
}

function make3DNode(el) {
	var n = Math.round(1 + 3 * Math.random());
	var colours = [ 0xFF0000, 0x00FF00, 0x00ffFF ];
	var randColour = (colours.length * Math.random()) | 0;
	var nodeProperties = knownNodes[el.nodeName];

	// This makes no freaking sense.
	// "height" is actually the depth (in Z),
	// "size" is the... thickness?
	//  (╯°□°）╯︵ ┻━┻
	
	var str = el.textContent;
	
	var geom = new THREE.TextGeometry(str, {
		size: nodeProperties.size,
		height: 1,
		curveSegments: 5
	});

	geom.computeBoundingBox();
	geom.computeVertexNormals();
	
	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours[randColour] });
	var obj = new THREE.Mesh(geom, mat);
	return obj;
}

module.exports = function(html, options) {

	options = options || {};
	
	var slidePadding = options.slidePadding !== undefined ? options.slidePadding : 0;

	var sections = makeArray(html.querySelectorAll('section'));
	
	var out = sections.map(function(section) {
		var sectionNode = new THREE.Object3D();
		var contentsNode = new THREE.Object3D();
		var children = makeArray(section.childNodes);

		// Create and add nodes to section
		var childrenObjects = children.map(function(el) {
			if(isKnownNode(el.nodeName)) {
				var obj = make3DNode(el);
				contentsNode.add(obj);
				return obj;
			
			}
		}).filter(function(obj) {
			return obj !== undefined;
		});

		sectionNode.add(contentsNode);

		// Distributing the objects vertically, top to bottom
		distributeObjects(childrenObjects, { offset: 0, dimension: 'y', direction: -1 });

		var contentBox = new THREE.Box3();
		contentBox.setFromObject(contentsNode);
		var contentSize = contentBox.size();
		var contentCenter = contentBox.center();
		contentsNode.position.sub(contentCenter);

		// Create box helper including padding so as to 'grow' the slide
		contentBox.setFromObject(contentsNode);
		contentBox.expandByScalar(slidePadding);
		contentSize = contentBox.size();
		var containerGeom = new THREE.BoxGeometry(contentSize.x, contentSize.y, contentSize.z, 3, 2, 2);
		var containerMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, wireframe: true });
		var containerMesh = new THREE.Mesh(containerGeom, containerMat);
		containerGeom.computeFaceNormals();
		var helper = new THREE.FaceNormalsHelper(containerMesh, 30, 0xFFFF00, 1);
		//var helper = new THREE.EdgesHelper(containerMesh, 0xFFFF00);
		helper.material.opacity = 0.75;
		helper.material.transparent = true;
		sectionNode.add(helper);
		// sectionNode.add(containerMesh);

		return sectionNode;
	});


	return out;
};
