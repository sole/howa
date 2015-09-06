module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var colours = require('../colours');
	var MouseInput = require('./MouseInput');
	
	function Gain() {
		
		Renderable.call(this, audioContext);

		var mouseInput = new MouseInput();

		var oscillator;
		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var controllableGain = audioContext.createGain();

		controllableGain.connect(gain);


		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.secondary1 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		this.render = function(time) {
			var now = audioContext.currentTime;
			var v = mouseInput.y;
			var s = v * 20;
			controllableGain.gain.setValueAtTime(v, now);
			mesh.scale.set(s, s, s);
		};
	
		this.activate = function() {
			mouseInput.start();
			var now = audioContext.currentTime;
			oscillator = audioContext.createOscillator();
			oscillator.frequency.setValueAtTime(880, now);
			oscillator.connect(controllableGain);
			oscillator.start(now);
			gain.start();
		};

		this.deactivate = function() {
			mouseInput.stop();
			var now = audioContext.currentTime;

			gain.stop(function() {
				oscillator.stop();
				oscillator.disconnect();
			});
		};

	}

	Gain.prototype = Object.create(Renderable.prototype);
	Gain.prototype.constructor = Gain;

	return Gain;

};



