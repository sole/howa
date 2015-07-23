var path = require('path');
var gulp = require('gulp');
var watch = require('gulp-watch');
var batch = require('gulp-batch');
var youKnowWhat = require('you-know-what');

var buildDir = path.join(__dirname, 'build');
var clientDir = path.join(__dirname, 'client');

gulp.task('build', ['build-client']);

gulp.task('build-client', ['build-static-js', 'build-static-html', 'build-static-css']);

gulp.task('build-static-js', function() {
	return youKnowWhat({
		entries: path.join(clientDir, 'js/main.js'),
		debug: true,
		transform: []
		},
		'bundle.js'
	)
	.pipe(gulp.dest(path.join(buildDir, 'js')));
});

gulp.task('build-static-html', function() {
	return gulp.src([
		path.join(clientDir, 'index.html')
	]).pipe(gulp.dest(buildDir));
});

gulp.task('build-static-css', function() {
	return gulp.src([
		path.join(clientDir, 'css/style.css')
	]).pipe(gulp.dest(path.join(buildDir, 'css')));
});

gulp.task('watch', function () {
	watch(path.join(clientDir, '**/*'), batch(function(events, done) {
        gulp.start('build', done);
    }));
});

gulp.task('default', ['build', 'watch']);
