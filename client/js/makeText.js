var defined = require('defined');

var vertexShader = [
		'varying vec2 vUv;',
		'varying float time;',
	
		'float rand(float seed, float timeSeed) {',
		'	float x = seed * time * 1000.0;',
		'	x = mod( x, 13.0 ) * mod( x, 123.0 );',
		'	return mod( x, 0.02 );',
		'}',

		'void main() {',

			'vUv = uv;',

			'vec4 pos = vec4( position.xyz, 1.0 );',
			'float seed = pos.x * pos.y;',

			'pos.x += 0.1 * sin(pos.x + time);',
			//'pos.x += 0.1 * rand( seed + pos.x, time );',
			//'pos.y += rand( seed + pos.y, time );',

			'gl_Position = projectionMatrix * modelViewMatrix * pos;',

		'}'
	].join('\n');

	var fragmentShader = [
		'uniform float opacity;',
		'uniform float maxZ;',
		'uniform vec3 color;',

		'varying vec2 vUv;',
		'varying float vZ;',
		
		'void main() {',
			
		'	gl_FragColor = vec4( color, opacity );',
		'}'
	].join('\n');



module.exports = function(THREE) {
	return function makeText(str, options) {
		options = options || {};

		var font = defined(options.font, undefined);
		var color = defined(options.color, 0xFF0000);
		var size = defined(options.size, 5);
		var weight = defined(options.weight, 'normal');
		var depth = defined(options.depth, 1);
		var curveSegments = defined(options.curveSegments, 2);
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
		

		/*var material = new THREE.ShaderMaterial({
			uniforms: {
				'opacity': { type: 'f', value: 1.0 },
				'time': { type: 'f', value: 0.0 },
				'color': { type: 'c', value: new THREE.Color(color) }
			},
			vertexShader: vertexShader,
			fragmentShader: fragmentShader
		});*/

		var material = new THREE.MeshBasicMaterial({ wireframe: wireframe, color: color, wireframeLinewidth: lineWidth });

		material.wireframe = wireframe;
		material.wireframeLinewidth = 1;
		material.blending = THREE.AdditiveBlending;
		material.transparent = true;
		// material.depthWrite = false;

		var obj = new THREE.Mesh(geom, material);

		/*obj.render = function(t) {
			material.uniforms.time.value = t;
		};*/

		return obj;

	};
};
