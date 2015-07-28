module.exports = function(THREE) {

	return function distribute(objects, options) {
		var offset = options.offset !== undefined ? options.offset : 0;
		var dimension = options.dimension !== undefined ? options.dimension : 'x';
		var direction = options.direction !== undefined ? options.direction : 1;

		objects.forEach(function(obj) {
			var objBox = new THREE.Box3();
			objBox.setFromObject(obj);
			var objDimensions = objBox.size();
			var halfDisplacement = objDimensions[dimension] * 0.5 * direction;

			obj.position[dimension] = offset + halfDisplacement;
			offset = obj.position[dimension] + halfDisplacement;
		});
	};

};
