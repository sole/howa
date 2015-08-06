module.exports = function(THREE) {

	function Slide3D() {
		THREE.Object3D.call(this);
	}

	Slide3D.prototype = Object.create(THREE.Object3D.prototype);
	Slide3D.prototype.constructor = Slide3D;

	Slide3D.prototype.iterateContents = function(callback) {
		var contentsNode = this.contentsNode;
		if(contentsNode) {
			contentsNode.children.forEach(callback);
		}
	};

	Slide3D.prototype.render = function(time) {
		this.iterateContents(function(child) {
			if(child.render) {
				child.render(time);
			}
		});
	};

	Slide3D.prototype.onActivate = function() {
		this.iterateContents(function(child) {
			if(child.onActivate) {
				child.onActivate();
			}
		});
	};

	Slide3D.prototype.onDeactivate = function() {
		this.iterateContents(function(child) {
			if(child.onDeactivate) {
				child.onDeactivate();
			}
		});
	};

	return Slide3D;

};
