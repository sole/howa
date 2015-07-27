module.exports = function(THREE) {

	return makeBoundingBox;

	function makeBoundingBox(obj) {

		var minPoint = new THREE.Vector3();
		var maxPoint = new THREE.Vector3();

		// It's an object with geometry and the computeBoundingBox method is available
		if(obj.geometry && obj.geometry.computeBoundingBox) {

			obj.geometry.computeBoundingBox();
			return obj.geometry.boundingBox;

		// An object *without* geometry but with method to traverse visible children? We'll
		// calculate the overall bounding box by finding the boxes of the children
		} else if (obj.traverseVisible) {
			
			obj.traverseVisible(function(child) {
				
				// traverseVisible runs the callback with itself first, but we do not want that (?)
				if(child === obj) {
					return;
				}

				var objBox = makeBoundingBox(child);
				console.log(objBox, child.position);

				objBox.min.add(child.position);
				objBox.max.add(child.position);

				minPoint = minPoint.min(objBox.min);
				maxPoint = maxPoint.max(objBox.max);

			});

		}

		return { min: minPoint, max: maxPoint };

	}

};
