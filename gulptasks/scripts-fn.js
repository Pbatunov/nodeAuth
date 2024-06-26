/* eslint-env node */
'use strict';

const _ = require('lodash');
const fs = require('fs');
const browserify = require('browserify');
const vinylSourceStream = require('vinyl-source-stream');
const twigify = require('rbc-twig-browserify-transform');
const babelify = require('babelify');
const eventStream = require('event-stream');
const buffer = require('vinyl-buffer');
const terser = require('gulp-terser');
const notify = require('gulp-notify');
const gulpIf = require('gulp-if');
const readPaths = require('./_read-paths');
const babelConfig = require('./_babel.config');

const isDevelop = process.env.NODE_ENV && process.env.NODE_ENV === 'develop';

module.exports = {
    create: function(taskName, basePaths, config, gulp, seriaName) {
        let paths;

        if (seriaName) {
            taskName = taskName + '-' + seriaName;
        }

        if (config.paths) {
            paths = _.merge({}, basePaths.scripts, config.paths);
        } else {
            paths = basePaths.scripts;
        }

        function scriptsTask(done) {
            const sourceList = readPaths.readDir(paths.src + '/fn');
            let sourceLength = sourceList.length;
            let counter = 0;
            const streams = [];

            if (sourceLength === 0) {
                done();
                return false;
            }

            sourceList.forEach(function(filename) {
                // not UNIX hidden directory
                if (filename.charAt(0) === '.') {
                    sourceLength--;
                    return;
                }

                const filepath = paths.src + '/fn/' + filename;
                const filepaths = [];

                // is directory
                // find /fn/{name}/main.* -> build/fn/{name}.js
                if (fs.lstatSync(filepath).isDirectory()) {
                    filename = filename + '.js';

                    readPaths.readDir(filepath).forEach(function(subFilename) {
                        const subFilepath = filepath + '/' + subFilename;
                        if (!fs.lstatSync(subFilepath).isDirectory() && subFilename.startsWith('main.')) {
                            filepaths.push(subFilepath);
                        }
                    });

                // is file
                // name.* -> build/fn/name.js
                } else {
                    filepaths.push(filepath);

                    if (!filename.endsWith('.js')) {
                        const arr = filename.split('.');
                        filename = arr[0] + '.js';
                    }
                }

                if (!filepaths.length) {
                    sourceLength--;
                    return;
                }

                // create bundle
                //
                const bundler = browserify({
                    entries: filepaths,
                    paths: [paths.src, paths.common, paths.html.project, paths.html.common],
                    extensions: ['.js', '.json', '.jsx'],
                });

                // https://github.com/hughsk/uglifyify
                if (!isDevelop) {
                    bundler.transform('uglifyify', {
                        global: true,
                    });
                }

                streams.push(bundler
                    // https://babel.dev/docs/en/babel-preset-env
                    // https://github.com/browserslist/browserslist
                    // https://github.com/zloirock/core-js/blob/master/README.md - use for polyfills
                    // ----
                    // for updates caniuse-lite version in your npm:
                    // npx browserslist@latest --update-db
                    .transform(babelify.configure(babelConfig))
                    .transform(twigify({
                        minify: false,
                        extensions: ['.html'],
                        autoescape: false,
                        replacePaths: {'/app': '@app', '/common': '@common'},
                    }))
                    .bundle()
                    .on('error', function(error) {
                        notify.onError({
                            title: 'Gulp',
                            subtitle: 'Failure!',
                            message: 'Error: <%= error.message %>',
                        })(error);
                        done(error.message);
                    })
                    .pipe(vinylSourceStream('_' + filename))
                    .pipe(gulpIf(!isDevelop, buffer()))
                    .pipe(gulpIf(!isDevelop, terser()))
                    .pipe(gulp.dest(paths.dst + '/fn'))
                    .on('end', function() {
                        if (++counter === sourceLength) {
                            done();
                        }
                    }),
                );
            });

            if (!streams.length) {
                done();
                return false;
            }

            return eventStream.merge(streams);
        }

        if (config.eslint && isDevelop) {
            let eslintTaskName = 'eslint-fn';

            if (seriaName) {
                eslintTaskName += '-' + seriaName;
            }

            gulp.task(taskName, gulp.series(eslintTaskName, scriptsTask));
        } else {
            gulp.task(taskName, scriptsTask);
        }
    },
};