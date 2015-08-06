module.exports = function(THREE) {

	function Slide3D() {
		THREE.Object3D.call(this);
	}

	Slide3D.prototype = Object.create(THREE.Object3D.prototype);
	Slide3D.prototype.constructor = Slide3D;

	Slide3D.prototype.render = function(time) {
		var contentsNode = this.contentsNode;
		if(contentsNode) {
			contentsNode.children.forEach(function(child) {
				if(child.render) {
					child.render(time);
				}
			});
		}
	};

	return Slide3D;

};
