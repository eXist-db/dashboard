'use strict';

var gulp = require('gulp'),
    exist = require('gulp-exist'),
    watch = require('gulp-watch'),
    less = require('gulp-less'),
    del = require('del'),
    path = require('path'),
    LessAutoprefix = require('less-plugin-autoprefix')

var PRODUCTION = (!!process.env.NODE_ENV || process.env.NODE_ENV === 'production')

console.log('Production? %s', PRODUCTION)

exist.defineMimeTypes({
    'application/xml': ['odd']
})

var exClient = exist.createClient({
    host: 'localhost',
    port: '8080',
    path: '/exist/xmlrpc',
    basic_auth: {user: 'admin', pass: ''}
})

var html5TargetConfiguration = {
    target: '/db/apps/existdb-dashboard',
    html5AsBinary: true
}

var targetConfiguration = {
    target: '/db/apps/existdb-dashboard'
}

gulp.task('clean', function () {
    return del(['build/**/*']);
});

// styles //

var lessPath = './resources/css/style.less'
var stylesPath = 'resources/css/*'
var autoprefix = new LessAutoprefix({browsers: ['last 2 versions']})

gulp.task('styles', function () {
    return gulp.src(lessPath)
        .pipe(less({plugins: [autoprefix]}))
        .pipe(gulp.dest('./resources/css'))
})

gulp.task('deploy:styles', ['styles'], function () {
    return gulp.src('resources/css/*.css', {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

// odd files //

var oddPath = 'resources/odd/**/*';
gulp.task('odd:deploy', function () {
    return gulp.src(oddPath, {base: './'})
        .pipe(exClient.newer(targetConfiguration))
        .pipe(exClient.dest(targetConfiguration))
})

gulp.task('odd:watch', function () {
    gulp.watch(oddPath, ['odd:deploy'])
})

// files in project root //

var componentPaths = [
    '*.html',
    '!index.html',
    'bower_components/**/*'
];

gulp.task('deploy:components', function () {
    return gulp.src(componentPaths, {base: './'})
        .pipe(exClient.newer(html5TargetConfiguration))
        .pipe(exClient.dest(html5TargetConfiguration))
})

var otherPaths = [
    '*.html',
    '*.xql',
    'templates/**/*',
    'transforms/**/*',
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

gulp.task('deploy', ['deploy:other', 'deploy:components', 'deploy:styles'])

gulp.task('watch', function () {
    gulp.watch('resources/css/!*', ['deploy:styles'])
    gulp.watch(otherPaths, ['deploy:other'])
    gulp.watch('*.html', ['deploy:components'])
})

gulp.task('default', ['watch'])
