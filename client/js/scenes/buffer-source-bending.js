module.exports = function(THREE, audioContext) {

	var lerp = require('lerp');
	var Renderable = require('../Renderable')(THREE);
	var AmenLoop = require('./AmenLoop');
	var TransitionGain = require('./TransitionGain');
	var MouseInput = require('./MouseInput');
	
	function BufferSourceBending() {
		
		Renderable.call(this, audioContext);

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var amenLoop = AmenLoop(audioContext);
		amenLoop.connect(gain);
		amenLoop.sampler.loop = true;

		var mouseInput = new MouseInput();

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFFFF00 });
		var n = 100;
		var geom = new THREE.CylinderGeometry(n, n, 0.5, 16, 1);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		mesh.position.y = -20;
		//mesh.rotation.x = Math.PI / 2;

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = time - lastTime;
			lastTime = time;
			var now = audioContext.currentTime;
			var pitchBendValue = lerp(-1, 1, mouseInput.y);
			mesh.rotation.y -= Math.max(0, (elapsed*0.06 + pitchBendValue ) * 0.025);


			amenLoop.sampler.pitchBend.setValueAtTime(pitchBendValue, now);
		};
	
		this.activate = function() {
			gain.start();
			amenLoop.start();
			mouseInput.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				amenLoop.stop();
			});
			mouseInput.stop();
		};

	}

	BufferSourceBending.prototype = Object.create(Renderable.prototype);
	BufferSourceBending.prototype.constructor = BufferSourceBending;

	return BufferSourceBending;

};




