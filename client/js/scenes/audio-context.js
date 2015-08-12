module.exports = function(THREE, audioContext) {

	var WebAudioThx = require('./web-audio-thx');
	var thx = new WebAudioThx(audioContext);
	var audioNode = audioContext.createGain();
	thx.connect(audioNode);

	var node = new THREE.Object3D();

	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
	var n = 10;
	var geom = new THREE.SphereGeometry(n);
	var mesh = new THREE.Mesh(geom, mat);
	node.add(mesh);

	var lastTime = 0;
	node.render = function(time) {
		var elapsed = (time - lastTime) * 0.001;
		lastTime = time;
		mesh.rotation.y += elapsed;
	};

	node.onActivate = function() {
		console.log('activate audio context scene');
		thx.start();
	};

	node.onDeactivate = function() {
		console.log('deactivate audio context scene');
	};

	return {
		graphicNode: node,
		audioNode: audioNode
	};
};

