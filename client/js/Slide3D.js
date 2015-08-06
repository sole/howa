module.exports = function(THREE) {

	function Slide3D() {
		THREE.Object3D.call(this);
	}

	Slide3D.prototype = Object.create(THREE.Object3D.prototype);
	Slide3D.prototype.constructor = Slide3D;

	Slide3D.prototype.render = function(time) {
	};

	return Slide3D;

};
