var defined = require('defined');

module.exports = function(THREE) {
	return function makeText(str, options) {
		options = options || {};

		var font = defined(options.font, undefined);
		var color = defined(options.color, 0xFF0000);
		var size = defined(options.size, 5);
		var weight = defined(options.weight, 'normal');
		var depth = defined(options.depth, 1);
		var curveSegments = defined(options.curveSegments, 3);
		var lineWidth = defined(options.lineWidth, 1);
		var wireframe = defined(options.wireframe, false);

		// This makes no freaking sense.
		// "height" is actually the depth (in Z),
		// "size" is the... thickness?
		//  (╯°□°）╯︵ ┻━┻
		var geom = new THREE.TextGeometry(str, {
			font: font,
			size: size,
			height: depth,
			weight: weight,
			curveSegments: curveSegments
		});

		geom.computeBoundingBox();
		geom.computeVertexNormals();
		
		var mat = new THREE.MeshBasicMaterial({ wireframe: wireframe, color: color, wireframeLinewidth: lineWidth });
		var obj = new THREE.Mesh(geom, mat);

		return obj;

	};
};
