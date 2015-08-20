module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);

	function SceneAudioGraph() {

		Renderable.call(this, audioContext);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
		var n = 100;
		var geom = new THREE.BoxGeometry(n, n, n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
			mesh.rotation.y += elapsed;
		};

		this.activate = function() {
			console.log('activate audio graph scene');
		};

		this.deactivate = function() {
			console.log('deactivate audio graph scene');
		};

	}

	SceneAudioGraph.prototype = Object.create(Renderable.prototype);
	SceneAudioGraph.prototype.constructor = SceneAudioGraph;

	return SceneAudioGraph;
	
};
