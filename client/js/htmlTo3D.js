var THREE = require('n3d-threejs');
var makeArray = require('make-array');

var knownNodes = ['H1', 'H2'];

function isKnownNode(name) {
	return knownNodes.indexOf(name) !== -1;
}

function make3DNode(el) {
	var n = 5;
	var geom = new THREE.BoxGeometry(n, n, n);
	var mat = new THREE.MeshBasicMaterial({ color: 0xFF0000 });
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

		return sectionNode;
	});


	return out;
};
