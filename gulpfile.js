'use strict';

var gulp = require('gulp'),
    exist = require('gulp-exist'),
    watch = require('gulp-watch'),
    del = require('del'),
    path = require('path')

var PRODUCTION = (!!process.env.NODE_ENV || process.env.NODE_ENV === 'production')

console.log('Production? %s', PRODUCTION)

var exClient = exist.createClient({
    host: 'localhost',
    port: '8080',
    path: '/exist/xmlrpc',
    basic_auth: {user: 'admin', pass: ''}
})

var html5TargetConfiguration = {
    target: '/db/apps/dashboard3',
    html5AsBinary: true
}

var targetConfiguration = {
    target: '/db/apps/dashboard3'
}

gulp.task('clean', function () {
    return del(['build/**/*']);
});


gulp.task('odd:watch', function () {
    gulp.watch(oddPath, ['odd:deploy'])
})

// files in project root //

var componentPaths = [
    '*.html',
    '!index.html',
    'src/**/*'
];

gulp.task('deploy:components', function () {
    return gulp.src(componentPaths, {base: './'})
        .pipe(exClient.newer(html5TargetConfiguration))
        .pipe(exClient.dest(html5TargetConfiguration))
})

var otherPaths = [
    '*.html',
    '*.xql',
    'resources/**/*',
    '!resources/css/*',
    'modules/**/*',
    'demo/*.html'
];

gulp.task('deploy:other', function () {
    return gulp.src(otherPaths, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('deploy', ['deploy:other', 'deploy:components'])

gulp.task('watch', function () {
    gulp.watch(otherPaths, ['deploy:other'])
    gulp.watch('*.html', ['deploy:components'])
})

gulp.task('default', ['watch'])
