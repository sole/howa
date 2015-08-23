module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var Boid = require('./publish_me/Boid')(THREE);
	var BirdGeometry = require('./publish_me/BirdGeometry')(THREE);
	var SamplePlayer = require('openmusic-sample-player');
		var fs = require('fs');
	var birdSample = fs.readFileSync(__dirname + '/bird.wav');
	var birdSampleArrayBuffer = birdSample.toArrayBuffer();
	var birdSampleAudioBuffer = null;

	function getRandom(maxValue) {
		return maxValue * (Math.random() - 0.5);
	}

	function Panner() {

		Renderable.call(this, audioContext);

		var maxGain = 0.25;
		var birds = [];
		var boids = [];
		var worldPosition = new THREE.Vector3();
	
		var gain = audioContext.createGain();
		gain.connect(this.audioNode);
		var birdSink = audioContext.createGain();
		birdSink.gain.setValueAtTime(maxGain, audioContext.currentTime);

		audioContext.decodeAudioData(birdSampleArrayBuffer, onSampleBufferDecoded, function(err) {
			console.error('FAIL decoding audio data aaagh');
		});

		var birdMaterial = new THREE.MeshBasicMaterial({ color: 0xff00ff, side: THREE.DoubleSide });
		var maxSpeed = 0.25;
		var m = 200;
		var wide = m * 2;
		var now = audioContext.currentTime;

		for ( var i = 0; i < 50; i ++ ) {

			var boid = new Boid();
			boids.push(boid);
			boid.setMaxSpeed(2);
			boid.position.x = getRandom(wide);
			boid.position.y = getRandom(m);
			boid.position.z = getRandom(m);
			boid.velocity.x = getRandom(maxSpeed);
			boid.velocity.y = getRandom(maxSpeed);
			boid.velocity.z = getRandom(maxSpeed);
			boid.setAvoidWalls(true);

			boid.setWorldSize(wide, m, m);

			var panner = audioContext.createPanner();
			boid.panner = panner;
			panner.connect(birdSink);

			var samplePlayer = SamplePlayer(audioContext);
			samplePlayer.connect(panner);
			//samplePlayer.connect(birdSink);
			
			boid.samplePlayer = samplePlayer;
			if(birdSampleAudioBuffer !== null) {
				samplePlayer.buffer = birdSampleAudioBuffer;
			}

			boid.lastTimePlayed = now + i;

			var bird = new THREE.Mesh(new BirdGeometry(), birdMaterial);
			birds.push(bird);
			bird.phase = Math.floor( Math.random() * 62.83 );
			this.add(bird);

		}

		function onSampleBufferDecoded(buffer) {
			console.log('bird sample decoded');
			birdSampleAudioBuffer = buffer;

			boids.forEach(function(boid) {
				var player = boid.samplePlayer;
				player.buffer = buffer;
			});
		}

		this.render = function(time) {
			var now = audioContext.currentTime;
			worldPosition.setFromMatrixPosition(this.matrixWorld);

			for ( var i = 0, il = birds.length; i < il; i++ ) {

				var boid = boids[i];
				boid.run(boids);
				var position = boid.position;

				var bird = birds[i];
				bird.position.copy(position);

				boid.panner.setPosition(worldPosition.x + position.x, worldPosition.y + position.y, worldPosition.z + position.z);

				bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
				bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

				bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
				bird.geometry.vertices[ 5 ].y = bird.geometry.vertices[ 4 ].y = Math.sin( bird.phase ) * 5;
				bird.geometry.verticesNeedUpdate = true;

				if(now - boid.lastTimePlayed > 2) {
					console.log('play!', i);
					boid.samplePlayer.start(now);
					boid.lastTimePlayed = now + Math.random() * 5;
				}
			}
		};
	
		this.activate = function() {
			var now = audioContext.currentTime;
			birdSink.connect(gain);
			gain.gain.cancelScheduledValues(now);
			gain.gain.setValueAtTime(0, now);
			gain.gain.linearRampToValueAtTime(maxGain, now + 1);
		};

		this.deactivate = function() {
			var now = audioContext.currentTime;
			var t = 2;
			gain.gain.cancelScheduledValues(now);
			gain.gain.linearRampToValueAtTime(0, now + t);
			setTimeout(function() {
				//oscillator.disconnect();
				//stereoPanner.disconnect();
				birdSink.disconnect();
			}, (t+0.5) * 1000);
		};

	}

	Panner.prototype = Object.create(Renderable.prototype);
	Panner.prototype.constructor = Panner;

	return Panner;

};



