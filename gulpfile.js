var path = require('path');
var gulp = require('gulp');
var youKnowWhat = require('you-know-what');

var buildDir = path.join(__dirname, 'build');

gulp.task('build', ['build-static-js']);

gulp.task('build-static-js', function() {
	return youKnowWhat({
		entries: './client/js/bundle.js',
		debug: true,
		transform: []
		},
		'bundle.js'
	)
	.pipe(gulp.dest(path.join(buildDir, 'js')));
});

gulp.task('default', ['build']);
