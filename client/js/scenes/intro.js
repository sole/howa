var TWEEN = require('tween.js');
var colours = require('../colours');

module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var WebAudioThx = require('./publish_me/web-audio-thx');

	function rangeRand(v) {
		return (Math.random() - 0.5) * v;
	}

	function rand(v) {
		// return (Math.random() - 0.5) * v;
		return Math.random() * v;
	}

	function generateRandomObjects(num, minRadius, maxRadius) {
		var out = new THREE.Object3D();
		var s;
		var phi = 2 * Math.PI;
		var twopi = 2 * Math.PI;
		var inc = 1;
		var material = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.secondary1 });
		material.transparent = true;
		material.opacity = 0.5;

		for(var i = 0; i < num; i++) {
			s = 3 + Math.random() * 100;
			var geom = new THREE.BoxGeometry(s, s, s);
			var obj = new THREE.Mesh(geom, material);
			var alpha = rand(twopi);
			var beta = rand(twopi);
			var gamma = rand(twopi);
			obj.position.set(Math.sin(alpha), Math.sin(beta), Math.sin(gamma));
			obj.position.multiplyScalar(minRadius + rand(maxRadius));
			obj.rotation.set(rand(phi), rand(phi), rand(phi));
			out.add(obj);
			obj.rotationIncrement = new THREE.Vector3(rangeRand(inc), rangeRand(inc), rangeRand(inc));
		}

		return out;
	}

	function SceneAudioContext() {
		
		Renderable.call(this, audioContext);

		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var transitionTween = null;
		var transitionLength = 2500;

		var hemisphereGeom = new THREE.SphereGeometry(1000, 64, 64);
		var hemisphereMat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.primary2 });
		hemisphereMat.opacity = 0.0;
		hemisphereMat.transparent = true;
		var hemisphere = new THREE.Mesh(hemisphereGeom, hemisphereMat);

		var randomObjects = generateRandomObjects(100, 100, 900);
		this.add(randomObjects);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;

			var numObjects = randomObjects.children.length;

			for(var i = 0; i < numObjects; i++) {
				var obj = randomObjects.children[i];
				var rotInc = obj.rotationIncrement;
				//obj.rotation.add(obj.rotationIncrement.clone().multiplyScalar(elapsed));
				obj.rotation.x += rotInc.x * elapsed;
				obj.rotation.y += rotInc.y * elapsed;
				obj.rotation.z += rotInc.z * elapsed;
			}
		};

		function onTransition(tween) {
			hemisphereMat.opacity = this.opacity;
		}
	
		this.activate = function() {

			gain.start();

			this.thx = new WebAudioThx(audioContext);
			this.thx.connect(gain);
			this.thx.start();

			hemisphereMat.opacity = 0;
			this.add(hemisphere);

			if(transitionTween !== null) {
				transitionTween.stop();
			}

			transitionTween = new TWEEN.Tween({ opacity: 0 })
				.to({ opacity: 0.5 }, transitionLength)
				.onUpdate(onTransition)
				.start();

		};

		this.deactivate = function() {
		
			var self = this;
			
			this.thx.stop();
			gain.stop(function() {
				self.thx.disconnect();
				self.thx = null;
			});

			if(transitionTween !== null) {
				transitionTween.stop();
			}
			
			transitionTween = new TWEEN.Tween({ opacity: hemisphereMat.opacity })
				.to({ opacity: 0 }, transitionLength)
				.onUpdate(onTransition)
				.onComplete(function() {
					self.remove(hemisphere);
				})
				.start();
			
		};

	}

	SceneAudioContext.prototype = Object.create(Renderable.prototype);
	SceneAudioContext.prototype.constructor = SceneAudioContext;

	return SceneAudioContext;

};

