module.exports = function(THREE) {

	return makeBoundingBox;

	function makeBoundingBox(obj) {

		var box = new THREE.Box3();
		box.setFromObject(obj);
		return box;

	}

};
