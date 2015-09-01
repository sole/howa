var TWEEN = require('tween.js');
var colours = require('../colours');

module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	
	function SceneAudioContext() {
		
		var WebAudioThx = require('./publish_me/web-audio-thx');

		Renderable.call(this, audioContext);

		this.thx = new WebAudioThx(audioContext);
		this.thx.connect(this.audioNode);

		var transitionTween = null;
		var transitionLength = 2500;

		var hemisphereGeom = new THREE.SphereGeometry(1000, 64, 64);
		var hemisphereMat = new THREE.MeshBasicMaterial({ wireframe: true, color: colours.primary2 });
		hemisphereMat.opacity = 0.0;
		hemisphereMat.transparent = true;
		var hemisphere = new THREE.Mesh(hemisphereGeom, hemisphereMat);

		var lastTime = 0;
		this.render = function(time) {
			var elapsed = (time - lastTime) * 0.001;
			lastTime = time;
		};

		function onTransition(tween) {
			hemisphereMat.opacity = this.opacity;
		}
	
		this.activate = function() {
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
			this.thx.stop();

			if(transitionTween !== null) {
				transitionTween.stop();
			}

			var self = this;
			
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
