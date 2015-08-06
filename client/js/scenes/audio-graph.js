module.exports = function(THREE, audioContext) {

	var node = new THREE.Object3D();

	var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
	var n = 200;
	var geom = new THREE.BoxGeometry(n, n, n);
	var mesh = new THREE.Mesh(geom, mat);
	node.add(mesh);

	var lastTime = 0;
	node.render = function(time) {
		var elapsed = (time - lastTime) * 0.001;
		lastTime = time;
		mesh.rotation.y += elapsed;
	};

	return node;
};
