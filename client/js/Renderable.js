module.exports = function(THREE) {
	
	function Renderable(audioContext) {
		THREE.Object3D.call(this);
		
		var audioNode = audioContext.createGain(); // dummy
		this.audioNode = audioNode;
	}

	Renderable.prototype = Object.create(THREE.Object3D.prototype);
	Renderable.prototype.constructor = Renderable;


	Renderable.prototype.traverseChildren = function(callback) {
		var self = this;
		this.traverse(function(obj) {
			if(obj !== self) {
				callback(obj);
			}
		});
	};


	Renderable.prototype.activate = function() {
		this.traverseChildren(function(child) {
			if(child.activate) {
				child.activate();
			}
		});
	};


	Renderable.prototype.deactivate = function() {
		this.traverseChildren(function(child) {
			if(child.deactivate) {
				child.deactivate();
			}
		});
	};


	Renderable.prototype.render = function(time) {
		this.traverseChildren(function(child) {
			if(child.render) {
				child.render(time);
			}
		});
	};

	return Renderable;

};

