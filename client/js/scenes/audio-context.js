module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	
	function SceneAudioContext() {
		
		var WebAudioThx = require('./web-audio-thx');

		Renderable.call(this, audioContext);

		this.thx = new WebAudioThx(audioContext);
		this.thx.connect(this.audioNode);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
		var n = 10;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
			mesh.rotation.y += elapsed;
		};
	
		this.activate = function() {
			this.thx.start();

		};

		this.deactivate = function() {
			this.thx.stop();
		};

	}

	SceneAudioContext.prototype = Object.create(Renderable.prototype);
	SceneAudioContext.prototype.constructor = SceneAudioContext;

	return SceneAudioContext;

};

