module.exports = function(THREE, audioContext) {
	
	var Renderable = require('../Renderable')(THREE);
	var unlerp = require('unlerp');
	

	function makeLine(options) {
		var numPoints = options.numPoints;
		var width = options.width;
		var dashed = options.dashed;
		var color = options.color !== undefined ? options.color : 0x00ffff;
		var x = -0.5 * width;
		var segmentWidth = width / numPoints;
		var points = [];

		for(var i = 0; i < numPoints; i++) {
			var point = new THREE.Vector3(x, 0, 0);
			points.push(point);
			x += segmentWidth;
		}

		var geometry = new THREE.Geometry();
		geometry.vertices = points;
		geometry.computeLineDistances();

		var material;
		
		if(dashed) {
			material = new THREE.LineDashedMaterial({ color: color, dashSize: 1, gapSize: 1 });
		} else {
			material = new THREE.LineBasicMaterial({ color: color });
		}

		var line = new THREE.Line(geometry, material);

		return line;
	}

	function updateLine(line, frequencies, amplitudes, time) {
		var vertices = line.geometry.vertices;
		var num = vertices.length;
		var t = time * 0.01;
		var incs = [];
		var phis = [];

		frequencies.forEach(function(f) {
			incs.push(f * 2 * Math.PI / num);
			phis.push(t);
		});

		for(var i = 0; i < num; i++) {
			var y = 0;

			phis.forEach(function(p, index) {
				y += amplitudes[index] * Math.sin(p);
				phis[index] += incs[index];
			});

			vertices[i].y = y;

		}

		line.geometry.computeLineDistances();
		line.geometry.verticesNeedUpdate = true;
	}

	function Modulation() {
		
		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var oscillator;
		var lfoOscillator;
		var lfoGain;
		var gain = audioContext.createGain();
		
		var numPoints = 200;
		var lineWidth = 400;
		var frequencyLine = makeLine({
			numPoints: numPoints,
			width: lineWidth,
			dashed: true
		});
		
		var combinedLine = makeLine({
			numPoints: numPoints,
			width: lineWidth,
			dashed: false,
			color: 0x00FF00
		});

		combinedLine.material.linewidth = 3;
		combinedLine.material.opacity = 0.75;
		combinedLine.material.transparent = true;


		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x00FF00 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		var mouseX, mouseY;
		var paramX = 0.5;
		var paramY = 0.5;
		var baseOscillatorFrequency = 220;
		var maxLfoFrequency = 100;
		var maxLfoDepth = 100;
		var lfoFrequency = maxLfoFrequency * 0.5;
		var lfoDepth = maxLfoDepth * 0.5;

		function onMouseMove(event) {
			mouseX = event.clientX * 1.0;
			mouseY = event.clientY * 1.0;

			paramX = unlerp(0, window.innerWidth, mouseX);
			paramY = unlerp(0, window.innerHeight, mouseY);

			lfoFrequency = paramX * maxLfoFrequency;
			lfoDepth = paramY * maxLfoDepth;

			var now = audioContext.currentTime;
			lfoOscillator.frequency.setValueAtTime(lfoFrequency, now);
			lfoGain.gain.setValueAtTime(lfoDepth, now);
		}

		this.render = function(time) {
			var now = audioContext.currentTime;

			mesh.position.y = -100 * (paramY - 0.5);
			mesh.position.x = -100 * (0.5 - paramX);

			var lfoAmp = 25 * lfoDepth / maxLfoDepth;
			var oscAmp = 50;

			updateLine(frequencyLine, [ lfoFrequency ], [ lfoAmp ], time);
			updateLine(combinedLine, [ lfoFrequency, baseOscillatorFrequency ], [ lfoAmp, oscAmp ], time);
		};
	
		this.activate = function() {
			var now = audioContext.currentTime;
			oscillator = audioContext.createOscillator();
			oscillator.frequency.setValueAtTime(baseOscillatorFrequency, now);
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

			this.add(frequencyLine);
			this.add(combinedLine);
			
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

			this.remove(frequencyLine);
			this.remove(combinedLine);
		};

	}

	Modulation.prototype = Object.create(Renderable.prototype);
	Modulation.prototype.constructor = Modulation;

	return Modulation;

};



