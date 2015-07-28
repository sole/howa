var THREE = require('n3d-threejs');
var makeArray = require('make-array');

var knownNodes = ['H1', 'H2'];

function isKnownNode(name) {
	return knownNodes.indexOf(name) !== -1;
}

function make3DNode(el) {
	var n = Math.round(1 + 3 * Math.random());
	var colours = [ 0xFF0000, 0x00FF00, 0x00ffFF ];
	var randColour = (colours.length * Math.random()) | 0;
	var geom = new THREE.BoxGeometry(n, n, n); // new THREE.SphereGeometry(n, 8, 8);
	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours[randColour], wireframeLinewidth: 2 });
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
		var offsetY = 0;
		childrenObjects.forEach(function(obj, index) {

			obj.geometry.computeBoundingBox();
			var objBox = obj.geometry.boundingBox;
			var objDimensions = objBox.size();
			var halfHeight = objDimensions.y * 0.5;

			obj.position.y = offsetY - halfHeight;
			offsetY = obj.position.y - halfHeight;
			
		});


		// And this centers the children objects vertically on the slide
		var sectionBox = new THREE.Box3();
		sectionBox.setFromObject(sectionNode);
		var sectionSize = sectionBox.size();
		var halfSectionHeight = sectionSize.y * 0.5;

		childrenObjects.forEach(function(obj) {
			obj.position.y += halfSectionHeight;
		});

		return sectionNode;
	});


	return out;
};
