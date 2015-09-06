// Based on https://github.com/davidpiegza/Graph-Visualization/blob/master/layouts/force-directed-layout.js
// but optimised for speed & using three.js's vector math for succinctness
/**
 * graph must have nodes & edges
 * nodes must have `position`
 * edges must have `source` and `target`
 *
 * var layout = new ForceLayout({ nodes: nodes, edges: edges }, options);
 * layout.reset();
 * in requestAnimationFrame:
 *	layout.update(); // returns false when done i.e. graph is stable
 */
module.exports = function ForceLayout(graph, options) {

	this.graph = graph;

	this.attraction_multiplier = options.attraction || 5;
	this.repulsionMultiplier = options.repulsion || 0.75;
	this.maxIterations = options.iterations || 1000;
	this.width = options.width || 200;
	this.height = options.height || 200;
	this.finished = false;
	this.iterations = 0;
	this.boundingBox = options.boundingBox;

	var callback_positionUpdated = options.onNodePositionUpdated || function() { }, // Empty callback--avoids using if's
		EPSILON = 0.000001,
		attractionConstant,
		attractionConstantInverse,
		repulsionConstant,
		repulsionConstantSquared,
		repulsionConstantSquaredInverse,
		forceConstant,
		layoutIterations = 0,
		temperature = 0,
		nodesLength,
		edgesLength,
		mean_time = 0;

	this.reset = function() {
		this.finished = false;
		temperature = this.width * 0.1;
		nodesLength = this.graph.nodes.length;
		edgesLength = this.graph.edges.length;
		forceConstant = Math.sqrt(this.height * this.width / nodesLength);
		attractionConstant = this.attraction_multiplier * forceConstant;
		repulsionConstant = this.repulsionMultiplier * forceConstant;
		repulsionConstantSquared = repulsionConstant * repulsionConstant;
		repulsionConstantSquaredInverse = 1.0 / repulsionConstantSquared;
		attractionConstantInverse = 1.0 / attractionConstant;
		mean_time = 0;
	};

	this.update = function() {

		var i, delta, delta_length, edge, force, repulsion, attraction;

		if(layoutIterations >= this.maxIterations || temperature < EPSILON) {
			this.finished = true;
			return false;
		}

		var start = Date.now();

		// calculate repulsion
		for(i = 0; i < nodesLength; i++) {

			var node_v = graph.nodes[i];

			node_v.layout = node_v.layout || new ForceNodeLayout(node_v);

			if(i === 0) {
				node_v.layout.offset.set(0, 0, 0);
			}

			node_v.layout.force = 0;

			for(var j = i+1; j < nodesLength; j++) {

				var node_u = graph.nodes[j];
				
				if(i != j) {

					node_u.layout = node_u.layout || new ForceNodeLayout( node_u );

					delta = node_v.layout.tmpPosition.clone().sub(node_u.layout.tmpPosition);
					delta_length = Math.max(EPSILON, delta.length());
					force = repulsionConstantSquared / delta_length;
					repulsion = delta.divideScalar(delta_length * delta_length * repulsionConstantSquaredInverse);

					node_v.layout.force += force;
					node_u.layout.force += force;

					node_v.layout.offset.add(repulsion);

					if(i === 0) {
						node_u.layout.offset.set(0, 0, 0);
					}
					
					node_u.layout.offset.sub(repulsion);

				}
			}
		}

		// calculate attraction
		for(i = 0; i < edgesLength; i++) {
			
			edge = graph.edges[i];
			delta = edge.source.layout.tmpPosition.clone().sub(edge.target.layout.tmpPosition);
			delta_length = Math.max(EPSILON, delta.length());
			force = delta_length * delta_length * attractionConstantInverse;
			attraction = delta.multiplyScalar(delta_length * attractionConstantInverse);
			
			edge.source.layout.force -= force;
			edge.target.layout.force += force;

			edge.source.layout.offset.sub( attraction );
			edge.target.layout.offset.add( attraction );
		}

		// calculate positions
		var boundingBox = this.boundingBox;
		for(i = 0; i < nodesLength; i++) {

			var node = graph.nodes[i];
			
			delta_length = Math.max(EPSILON, node.layout.offset.length());
			coolFactor = Math.min(delta_length, temperature) / delta_length;
			multiplier = 0.1;

			node.layout.tmpPosition.add(node.layout.offset.clone().multiplyScalar(coolFactor));
			node.position.sub(node.position.clone().sub(node.layout.tmpPosition).multiplyScalar(multiplier));

			if(boundingBox !== undefined && !boundingBox.containsPoint(node.position)) {
				node.position.clamp(boundingBox.min, boundingBox.max);
			}

			callback_positionUpdated(node);

		}
		
		temperature *= (1 - (layoutIterations / this.maxIterations));
		layoutIterations++;

		this.iterations = layoutIterations;

		var end = Date.now();
		mean_time += end - start;
		
		return true;
	};
};

function ForceNodeLayout( node ) {
	this.offset = new THREE.Vector3();
	this.force = 0;
	
	this.tmpPosition = node.position.clone();
}

