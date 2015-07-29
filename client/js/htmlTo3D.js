var THREE = require('n3d-threejs');
var makeArray = require('make-array');
var distributeObjects = require('./distribute-objects')(THREE);
var makeTextGeometry = require('./make-text-geometry');

//require('./vendor/optimer_bold.typeface.js');
//require('./vendor/helvetiker_bold.typeface.js');
require('./vendor/helvetiker_regular.typeface.js');


var knownNodes = ['H1', 'H2'];

function isKnownNode(name) {
	return knownNodes.indexOf(name) !== -1;
}

function make3DNode(el) {
	var n = Math.round(1 + 3 * Math.random());
	var colours = [ 0xFF0000, 0x00FF00, 0x00ffFF ];
	var randColour = (colours.length * Math.random()) | 0;

	// This makes no freaking sense.
	// "height" is actually the depth (in Z),
	// "size" is the... thickness?
	//  (╯°□°）╯︵ ┻━┻
	
	var str = el.textContent;
	
	var geom = new THREE.TextGeometry(str, {
		size: 10,
		height: 1,
		curveSegments: 5
	});

	geom.computeBoundingBox();
	geom.computeVertexNormals();
	
	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours[randColour] });
	var obj = new THREE.Mesh(geom, mat);
	return obj;
}

module.exports = function(html) {
	
	var sections = makeArray(html.querySelectorAll('section'));
	
	var out = sections.map(function(section) {
		var sectionNode = new THREE.Object3D();
		var children = makeArray(section.childNodes);

		// Create and add nodes to section
		var childrenObjects = children.map(function(el) {
			if(isKnownNode(el.nodeName)) {
				var obj = make3DNode(el);
				sectionNode.add(obj);
				return obj;
			
			}
		}).filter(function(obj) {
			return obj !== undefined;
		});

		// Distributing the objects vertically, top to bottom
		distributeObjects(childrenObjects, { offset: 0, dimension: 'y', direction: -1 });


		// And this centers the children objects vertically on the slide
		/*var sectionBox = new THREE.Box3();
		sectionBox.setFromObject(sectionNode);
		var sectionSize = sectionBox.size();
		var halfSectionHeight = sectionSize.y * 0.5;

		childrenObjects.forEach(function(obj) {
			obj.position.y += halfSectionHeight;
			console.log(obj);
		});*/

		return sectionNode;
	});


	return out;
};
