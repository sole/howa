module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var Boid = require('./publish_me/Boid')(THREE);
	var BirdGeometry = require('./publish_me/BirdGeometry')(THREE);
	
	function Panner() {
		
		Renderable.call(this, audioContext);

		var birds = [];
		var boids = [];
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

		
		//
		
		var birdMaterial = new THREE.MeshBasicMaterial({ color:Math.random() * 0xffffff, side: THREE.DoubleSide });

		for ( var i = 0; i < 20; i ++ ) {

			var boid = new Boid();
			boids.push(boid);
			boid.position.x = Math.random() * 400 - 200;
			boid.position.y = Math.random() * 400 - 200;
			boid.position.z = Math.random() * 400 - 200;
			boid.velocity.x = Math.random() * 2 - 1;
			boid.velocity.y = Math.random() * 2 - 1;
			boid.velocity.z = Math.random() * 2 - 1;
			boid.setAvoidWalls(true);
			boid.setWorldSize(500, 500, 400);

			var panner = audioContext.createPanner();
			boid.panner = panner;

			var bird = new THREE.Mesh(new BirdGeometry(), birdMaterial);
			birds.push(bird);
			bird.phase = Math.floor( Math.random() * 62.83 );
			this.add(bird);

		}


		//


		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
			mesh.position.x = pos * 40;
			stereoPanner.pan.setValueAtTime(pos, now);

			for ( var i = 0, il = birds.length; i < il; i++ ) {

				var boid = boids[i];
				boid.run(boids);
				var position = boid.position;

				var bird = birds[i];
				bird.position.copy(position);

				boid.panner.setPosition(position.x, position.y, position.z);

				//color = bird.material.color;
				//color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

				bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
				bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

				bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
				bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;

			}
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

	Panner.prototype = Object.create(Renderable.prototype);
	Panner.prototype.constructor = Panner;

	return Panner;

};



