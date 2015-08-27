module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var AmenLoop = require('./AmenLoop');
	var TransitionGain = require('./TransitionGain');
	
	function BufferSource() {
		
		Renderable.call(this, audioContext);

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var amenLoop = AmenLoop(audioContext);
		amenLoop.connect(gain);
		amenLoop.sampler.loop = true;

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
			mesh.position.x = pos * 40;
		};
	
		this.activate = function() {
			gain.start();
			amenLoop.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				amenLoop.stop();
			});

		};

	}

	BufferSource.prototype = Object.create(Renderable.prototype);
	BufferSource.prototype.constructor = BufferSource;

	return BufferSource;

};



