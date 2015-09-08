module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var TransitionGain = require('./TransitionGain');
	var Boid = require('./publish_me/Boid')(THREE);
	var BirdGeometry = require('./publish_me/BirdGeometry')(THREE);
	var SamplePlayer = require('openmusic-sample-player');
	var fs = require('fs');
	var Promise = require('es6-promise').Promise;
	var colours = require('../colours');
	
	//var birdSample1 = fs.readFileSync(__dirname + '/birds/bird01.ogg');
	//var birdSample2 = fs.readFileSync(__dirname + '/birds/bird02.ogg');
	//var birdSample3 = fs.readFileSync(__dirname + '/birds/bird03.ogg');
	//var birdSample4 = fs.readFileSync(__dirname + '/birds/bird04.ogg');
	var birdSample5 = fs.readFileSync(__dirname + '/birds/bird05.ogg');
	var birdSample6 = fs.readFileSync(__dirname + '/birds/bird06.ogg');
	var birdSample7 = fs.readFileSync(__dirname + '/birds/bird07.ogg');
	var birdSample8 = fs.readFileSync(__dirname + '/birds/bird08.ogg');
	
	var samples = [
		/*birdSample1,
		birdSample2,
		birdSample3,
		birdSample4,*/
		birdSample5, birdSample6, birdSample7, birdSample8 ];
	
	var decodedBirdSamples = [];

	function getRandom(maxValue) {
		return maxValue * (Math.random() - 0.5);
	}

	function decodeBirdSamples(audioContext, binarySamples) {
		var decodedSamples = binarySamples.map(function(binary) {
			return new Promise(function(ok, fail) {
				audioContext.decodeAudioData(
					binary.toArrayBuffer(),
					function success(buffer) {
						ok(buffer);
					},
					function error(e) {
						fail(e);
					}
				);
			});
		});
		return Promise.all(decodedSamples);
	}

	function Panner() {

		Renderable.call(this, audioContext);
		var gain = TransitionGain(audioContext);
		gain.connect(this.audioNode);

		var maxGain = 0.95;
		var birds = [];
		var boids = [];
		var worldPosition = new THREE.Vector3();

		var m = 150;
		var wide = m * 2;
		var n = m * 1.5;
		var wide_n = n * 2;

		var cage = new THREE.Object3D();
		
		var gridXZ = new THREE.GridHelper(200, 20);
		gridXZ.position.set( 0, -20, 0 );
		cage.add(gridXZ);

		this.add(cage);
			
		//var gain = audioContext.createGain();

		var birdSink = audioContext.createGain();
		birdSink.gain.setValueAtTime(maxGain, audioContext.currentTime);

		decodeBirdSamples(audioContext, samples).then(function(buffers) {
			decodedBirdSamples = buffers;
			initBirds(buffers);
		});

		// FIXME: Urgh, if I don't add this then the position of this object is y = Infinity
		// - probably same bug as with the bounding box size
		var dummy = new THREE.Mesh(new BirdGeometry(), new THREE.MeshBasicMaterial({ color: 0xFFFF00, opacity: 0.0 }));
		dummy.material.transparent = true;
		this.add(dummy);
		// ---

		var scene = this;
		var chirpInterval = 5;

		function initBirds(soundBuffers) {
			
			var birdMaterial = new THREE.MeshBasicMaterial({ color: colours.secondary1, /*side: THREE.DoubleSide,*/ wireframe: true });
			var maxSpeed = 0.25;
			var now = audioContext.currentTime;
			var numSounds = soundBuffers.length;
			var soundIndex = 0;

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
				
				boid.samplePlayer = samplePlayer;
				samplePlayer.buffer = soundBuffers[soundIndex];

				// go to next sound but also make sure we don't go out of bounds
				soundIndex++;
				soundIndex = soundIndex % numSounds;

				boid.lastTimePlayed = now - i * 2;

				var bird = new THREE.Mesh(new BirdGeometry(), birdMaterial);
				birds.push(bird);
				bird.phase = Math.floor( Math.random() * 62.83 );
				scene.add(bird);

			}

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

				if(Math.random() > 0.7 && (now - boid.lastTimePlayed > chirpInterval + boid.samplePlayer.buffer.duration )) {
					boid.samplePlayer.start(now);
					boid.lastTimePlayed = now + Math.random() * chirpInterval;
				}
			}
		};
	
		this.activate = function() {
			birdSink.connect(gain);
			gain.start();
		};

		this.deactivate = function() {
			gain.stop(function() {
				birdSink.disconnect();
			});
		};

	}

	Panner.prototype = Object.create(Renderable.prototype);
	Panner.prototype.constructor = Panner;

	return Panner;

};



