module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	
	function StereoPanner() {
		
		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var oscillator;
		var gain = audioContext.createGain();
		var stereoPanner = audioContext.createStereoPanner();
		
		gain.connect(stereoPanner);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
			mesh.position.x = pos * 40;
			stereoPanner.pan.setValueAtTime(pos, now);
		};
	
		this.activate = function() {
			var now = audioContext.currentTime;
			oscillator = audioContext.createOscillator();
			oscillator.frequency.setValueAtTime(330, now);
			oscillator.connect(gain);
			oscillator.start(now);
			gain.gain.cancelScheduledValues(now);
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(maxGain, now + 1);
			stereoPanner.connect(this.audioNode);
		};

		this.deactivate = function() {
			var now = audioContext.currentTime;
			var t = 2;
			gain.gain.cancelScheduledValues(now);
			gain.gain.linearRampToValueAtTime(0, now + t);
			setTimeout(function() {
				oscillator.disconnect();
				stereoPanner.disconnect();
			}, (t+0.5) * 1000);
		};

	}

	StereoPanner.prototype = Object.create(Renderable.prototype);
	StereoPanner.prototype.constructor = StereoPanner;

	return StereoPanner;

};


