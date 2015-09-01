module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var distributeObjects = require('../distribute-objects')(THREE);
	
	function filterRawHTML(text) {
		var out = text + '';
		out = out.replace('&lt;', '<');
		out = out.replace('&gt;', '>');
		return out;
	}

	function Preformatted() {
		
		Renderable.call(this, audioContext);

		var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF0000 });
		var n = 5;
		var geom = new THREE.SphereGeometry(n);
		var mesh = new THREE.Mesh(geom, mat);
		this.add(mesh);

		this.render = function(time) {
			var now = audioContext.currentTime;
			var pos = Math.sin(time * 0.001);
			mesh.position.x = pos * 40;
		};
	
		this.activate = function() {
		};

		this.deactivate = function() {
		};

		this.setFromElement = function(el) {
			// look for a code child, extract text & filter it to be ready for rendering
			var codeElement = el.querySelector('code');
			var rawHTML = codeElement.innerHTML;
			var filtered = filterRawHTML(rawHTML);
			var lines = filtered.split('\n');
			
			var self = this;

			console.log(rawHTML, filtered, lines);

			var lineObjects = [];

			console.log(window._typeface_js.faces);
			
			lines.forEach(function(line) {
				var geom = new THREE.TextGeometry(line, {
					font: 'Perfect DOS VGA 437 Win'.toLowerCase(),
					weight: 'normal',
					size: 7,
					height: 1,
					curveSegments: 2
				});

				geom.computeBoundingBox();
				geom.computeVertexNormals();
				
				var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFFFFFF, wireframeLinewidth: 1 });
				var obj = new THREE.Mesh(geom, mat);

				self.add(obj);
				lineObjects.push(obj);

			});


			distributeObjects(lineObjects, { offset: 0, dimension: 'y', direction: -1 });

		};

	}

	Preformatted.prototype = Object.create(Renderable.prototype);
	Preformatted.prototype.constructor = Preformatted;

	return Preformatted;

};




