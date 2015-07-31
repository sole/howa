module.exports = function(THREE) {

	return function distribute(objects, options) {
		var offset = options.offset !== undefined ? options.offset : 0;
		var dimension = options.dimension !== undefined ? options.dimension : 'x';
		var direction = options.direction !== undefined ? options.direction : 1;

		objects.forEach(function(obj, index) {

			// Only translate the first one by offset in the dimension
			// the offset will be transmitted by pushing other objects after this one
			if(index === 0) {
				obj.position[dimension] += offset;
			} else {
				var previousObject = objects[index - 1];
				var previousBox = new THREE.Box3();
				previousBox.setFromObject(previousObject);

				var objBox = new THREE.Box3();
				objBox.setFromObject(obj);

				var diff;
				if(direction > 0) {
					diff = previousBox.max[dimension] - objBox.min[dimension];
				} else {
					diff = previousBox.min[dimension] - objBox.max[dimension];
				}
				obj.position[dimension] += diff;
			}

		});
	};

};
