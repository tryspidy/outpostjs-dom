"use strict";

const gulp        = require("gulp");
const uglify      = require("gulp-uglify");
const babel       = require("gulp-babel");
const maps        = require("gulp-sourcemaps");
const rename      = require("gulp-rename");
const include     = require('gulp-include');
const browserify  = require("browserify");
const Babelify    = require("babelify");
const source      = require("vinyl-source-stream");
const buffer      = require('vinyl-buffer');


const dirs = {
    src: "src/dom.js",
    dest: "dest"
}


gulp.task("compile-global", function() {
    return browserify({
        entries: [dirs.src]
    })
    .transform(Babelify, {presets: ["env"]})
    .bundle()
    .pipe(source(dirs.src))
    .pipe(buffer())
    .pipe(maps.init())
    .pipe(rename("outpost-dom.min.js"))
    .pipe(uglify())
    .pipe(maps.write(".maps"))
    .pipe(gulp.dest(dirs.dest));
});

gulp.task("watch", gulp.series("compile-global", function() {
    gulp.watch(["src/*", "src/**/*"], gulp.series("compile-global"));
}));

gulp.task("default", gulp.series("compile-global"));
