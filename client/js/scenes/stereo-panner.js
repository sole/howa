module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var colours = require('../colours');
	
	function StereoPanner() {
		
		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var oscillator;
		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var stereoPanner = audioContext.createStereoPanner();
		stereoPanner.connect(gain);


		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.secondary1 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		mesh.position.y -= n * 4;
		this.add(mesh);

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
			mesh.position.x = pos * 80;
			stereoPanner.pan.setValueAtTime(pos, now);
		};
	
		this.activate = function() {
			var now = audioContext.currentTime;
			oscillator = audioContext.createOscillator();
			oscillator.frequency.setValueAtTime(330, now);
			oscillator.connect(stereoPanner);
			oscillator.start(now);
			gain.start();
		};

		this.deactivate = function() {
			var now = audioContext.currentTime;

			gain.stop(function() {
				oscillator.stop();
				oscillator.disconnect();
			});
		};

	}

	StereoPanner.prototype = Object.create(Renderable.prototype);
	StereoPanner.prototype.constructor = StereoPanner;

	return StereoPanner;

};


