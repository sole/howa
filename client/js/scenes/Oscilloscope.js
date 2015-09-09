module.exports = function(THREE) {

	function Oscilloscope() {
		THREE.Object3D.call(this);

		this.initialise();
		
	}

	Oscilloscope.prototype = Object.create(THREE.Object3D.prototype);
	Oscilloscope.prototype.constructor = Oscilloscope;

	Oscilloscope.prototype.setData = function(data) {
		var lineGeom = this.line.geometry;
		var vertices = lineGeom.vertices;
		var numValues = Math.min(vertices.length, data.length);

		for(var i = 0; i < numValues; i++) {
			var vertex = vertices[i];
			vertex.y = data[i] * 10;
		}

		lineGeom.verticesNeedUpdate = true;
	};

	Oscilloscope.prototype.initialise = function(options) {
		if(this.line) {
			this.remove(this.line);
		}

		this.line = makeLine(options);
		this.add(this.line);

		var n = 5;
		var meshG = new THREE.BoxGeometry(n, n, n);
		var meshM = new THREE.MeshBasicMaterial({ wireframe: true, color: 0xFF00FF });
		var mesh = new THREE.Mesh(meshG, meshM);
		this.add(mesh);
	};
	
	function makeLine(options) {
		options = options || {};
		var numPoints = options.numPoints || 512;
		var width = options.width || 100;
		var dashed = options.dashed || false;
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

	return Oscilloscope;
};
