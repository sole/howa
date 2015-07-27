var THREE = require('n3d-threejs');
var makeArray = require('make-array');

var knownNodes = ['H1', 'H2'];

function isKnownNode(name) {
	return knownNodes.indexOf(name) !== -1;
}

function make3DNode(el) {
	var n = Math.round(3 + 5 * Math.random());
	var colours = [ 0xFF0000, 0x00FF00, 0x0000FF ];
	var randColour = (colours.length * Math.random()) | 0;
	var geom = new THREE.BoxGeometry(n, n, n);
	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours[randColour] });
	var obj = new THREE.Mesh(geom, mat);
	return obj;
}

module.exports = function(html) {
	
	var sections = makeArray(html.querySelectorAll('section'));
	
	var out = sections.map(function(section) {
		var sectionNode = new THREE.Object3D();
		var children = makeArray(section.childNodes);
		var nextChildrenPosition = new THREE.Vector3();

		children.forEach(function(el) {
			if(isKnownNode(el.nodeName)) {
				var obj = make3DNode(el);

				obj.position.copy(nextChildrenPosition);
				
				obj.geometry.computeBoundingBox();
				var box = obj.geometry.boundingBox;
				var dimensions = box.max.sub(box.min);

				// Top to bottom text actually goes 'down' on the Y axis
				nextChildrenPosition.y -= dimensions.y;
				
				sectionNode.add(obj);
			}
		});

		/*// Need to "center" the children vertically so our 0.0 is the center of the objects
		console.log('nex', nextChildrenPosition.y);
		var offsetY = -0.5 * nextChildrenPosition.y;
		sectionNode.traverseVisible(function(obj) {
			obj.position.y += offsetY;
		});*/

		return sectionNode;
	});


	return out;
};
