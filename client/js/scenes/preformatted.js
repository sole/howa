module.exports = function(THREE, audioContext) {

	var Renderable = require('../Renderable')(THREE);
	var distributeObjects = require('../distribute-objects')(THREE);
	var makeText = require('../makeText')(THREE);
	
	function filterRawHTML(text) {
		var out = text + '';
		out = out.replace('\t', '    ');
		out = out.replace('&lt;', '<');
		out = out.replace('&gt;', '>');
		return out;
	}

	function Preformatted() {
		
		Renderable.call(this, audioContext);

		this.render = function(time) {
			var now = audioContext.currentTime;
		};
	
		this.activate = function() {
		};

		this.deactivate = function() {
		};

		this.setFromElement = function(el) {
			// look for a code child, extract text & filter it to be ready for rendering
			var codeElement = el.querySelector('code');
			var rawHTML = codeElement.innerHTML;
			var filtered = filterRawHTML(rawHTML);
			var lines = filtered.split('\n');
			
			var self = this;

			// console.log(rawHTML, filtered, lines);

			var lineObjects = [];

			// console.log(window._typeface_js.faces);
			
			lines.forEach(function(line) {
				
				var obj = makeText(line, {
					font: 'Perfect DOS VGA 437 Win'.toLowerCase(),
					weight: 'normal',
					size: 7,
					depth: 0,
					curveSegments: 2,
					wireframe: true,
					color: 0xFFFFFF,
					linewidth: 1
				});

				self.add(obj);
				lineObjects.push(obj);

			});


			distributeObjects(lineObjects, { offset: 0, dimension: 'y', direction: -1 });

		};

	}

	Preformatted.prototype = Object.create(Renderable.prototype);
	Preformatted.prototype.constructor = Preformatted;

	return Preformatted;

};




