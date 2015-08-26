module.exports = function(THREE, audioContext) {
	
	var Renderable = require('../Renderable')(THREE);
	var unlerp = require('unlerp');
	
	function Modulation() {
		
		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var oscillator;
		var lfoOscillator;
		var lfoGain;
		var gain = audioContext.createGain();
		
		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x00FF00 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		var mouseX, mouseY;
		var paramX = 0.5;
		var paramY = 0.5;

		function onMouseMove(event) {
			mouseX = event.clientX * 1.0;
			mouseY = event.clientY * 1.0;
			
			paramX = unlerp(0, window.innerWidth, mouseX);
			paramY = unlerp(0, window.innerHeight, mouseY);

			var now = audioContext.currentTime;
			lfoOscillator.frequency.setValueAtTime(paramX * 40, now);
			lfoGain.gain.setValueAtTime(paramY * 200, now);
		}

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);

			mesh.position.y = -100 * (paramY - 0.5);
			mesh.position.x = -100 * (0.5 - paramX);
		};
	
		this.activate = function() {
			var now = audioContext.currentTime;
			oscillator = audioContext.createOscillator();
			oscillator.frequency.setValueAtTime(220, now);
			oscillator.connect(gain);
			oscillator.start(now);
			gain.gain.cancelScheduledValues(now);
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(maxGain, now + 1);
			gain.connect(this.audioNode);

			lfoGain = audioContext.createGain();
			lfoGain.gain.setValueAtTime(0, now);
			lfoGain.connect(oscillator.frequency);

			lfoOscillator = audioContext.createOscillator();
			lfoOscillator.connect(lfoGain);
			lfoOscillator.frequency.setValueAtTime(10, now);
			lfoOscillator.start(now);

			window.addEventListener('mousemove', onMouseMove);
		};

		this.deactivate = function() {

			window.removeEventListener('mousemove', onMouseMove);
			
			var now = audioContext.currentTime;
			var t = 2;
			gain.gain.cancelScheduledValues(now);
			gain.gain.linearRampToValueAtTime(0, now + t);
			setTimeout(function() {
				oscillator.stop();
				lfoOscillator.stop();
				lfoOscillator.disconnect();
				oscillator.disconnect();
				gain.disconnect();
			}, (t+0.5) * 1000);
		};

	}

	Modulation.prototype = Object.create(Renderable.prototype);
	Modulation.prototype.constructor = Modulation;

	return Modulation;

};



