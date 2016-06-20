/*jshint camelcase: false */

'use strict';

module.exports = function (grunt) {
    // show elapsed time at the end
    require('time-grunt')(grunt);
    // load all grunt tasks
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        // configurable paths
        yeoman: {
            app: 'app',
            dist: 'dist',
            tmp: '.tmp',
            trackingID: process.env.BEATREALTIME_TRACKING_ID,
            api: {
                clientId: process.env.BEATREALTIME_GA_CLIENT_ID,
                apiKey: process.env.BEATREALTIME_GA_API_KEY
            },
            deploy: {
                user: process.env.BEATREALTIME_DEPLOY_USER
            }
        },
        watch: {
            compass: {
                files: ['<%= yeoman.app %>/sass/{,*/}*.{scss,sass}'],
                tasks: ['compass:server', 'autoprefixer']
            },
            styles: {
                files: ['<%= yeoman.tmp %>/styles/{,*/}*.css'],
                tasks: ['copy:styles']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= yeoman.app %>/*.html',
                    '<%= yeoman.tmp %>/styles/{,*/}*.css',
                    '{<%= yeoman.tmp %>,<%= yeoman.app %>}/scripts/{,*/}*.js',
                    '<%= yeoman.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },
        connect: {
            options: {
                port: 9000,
                livereload: 35729,
                // change this to '0.0.0.0' to access the server from outside
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    open: true,
                    base: [
                        '<%= yeoman.tmp %>',
                        '<%= yeoman.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    open: true,
                    base: '<%= yeoman.dist %>'
                }
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '<%= yeoman.tmp %>',
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
                    ]
                }]
            },
            server: '<%= yeoman.tmp %>'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= yeoman.app %>/scripts/{,*/}*.js',
                '!<%= yeoman.app %>/scripts/vendor/*',
                '!<%= yeoman.app %>/scripts/require.js'
            ]
        },
        compass: {
            options: {
                sassDir: '<%= yeoman.app %>/sass',
                cssDir: '<%= yeoman.tmp %>/styles',
                generatedImagesDir: '<%= yeoman.tmp %>/images/generated',
                imagesDir: '<%= yeoman.app %>/images',
                javascriptsDir: '<%= yeoman.app %>/scripts',
                fontsDir: '<%= yeoman.app %>/styles/fonts',
                importPath: '<%= yeoman.app %>/bower_components',
                httpImagesPath: '/images',
                httpGeneratedImagesPath: '/images/generated',
                httpFontsPath: '/styles/fonts',
                relativeAssets: false,
                assetCacheBuster: false
            },
            dist: {
                options: {
                    generatedImagesDir: '<%= yeoman.dist %>/images/generated',
                    outputStyle: 'compressed'
                }
            },
            server: {
                options: {
                    debugInfo: true
                }
            }
        },
        autoprefixer: {
            options: {
                browsers: ['last 1 version']
            },
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.tmp %>/styles/',
                    src: '{,*/}*.css',
                    dest: '<%= yeoman.tmp %>/styles/'
                }]
            }
        },
        requirejs: {
            compile: {
                options: {
                    paths: {
                        requireLib: 'require'
                    },
                    mainConfigFile: '<%= yeoman.app %>/scripts/main.js',
                    name: 'main',
                    include: ['requireLib'],
                    out: '<%= yeoman.dist %>/scripts/require.js'
                }
            }
        },
        rev: {
            dist: {
                files: {
                    src: [
                        '<%= yeoman.dist %>/scripts/{,*/}*.js',
                        '<%= yeoman.dist %>/styles/{,*/}*.css',
                        '<%= yeoman.dist %>/images/{,*/}*.{png,jpg,jpeg,gif,webp}',
                        '<%= yeoman.dist %>/styles/fonts/{,*/}*.*'
                    ]
                }
            }
        },
        useminPrepare: {
            options: {
                dest: '<%= yeoman.dist %>'
            },
            html: '<%= yeoman.app %>/index.html'
        },
        usemin: {
            options: {
                dirs: ['<%= yeoman.dist %>']
            },
            html: ['<%= yeoman.dist %>/{,*/}*.html'],
            css: ['<%= yeoman.dist %>/styles/{,*/}*.css']
        },
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.{png,jpg,jpeg}',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>/images',
                    src: '{,*/}*.svg',
                    dest: '<%= yeoman.dist %>/images'
                }]
            }
        },
        cssmin: {
            // This task is pre-configured if you do not wish to use Usemin
            // blocks for your CSS. By default, the Usemin block from your
            // `index.html` will take care of minification, e.g.
            //
            //     <!-- build:css({.tmp,app}) styles/main.css -->
            //
            // dist: {
            //     files: {
            //         '<%= yeoman.dist %>/styles/main.css': [
            //             '.tmp/styles/{,*/}*.css',
            //             '<%= yeoman.app %>/styles/{,*/}*.css'
            //         ]
            //     }
            // }
        },
        htmlmin: {
            dist: {
                options: {
                    /*removeCommentsFromCDATA: true,
                    // https://github.com/yeoman/grunt-usemin/issues/44
                    //collapseWhitespace: true,
                    collapseBooleanAttributes: true,
                    removeAttributeQuotes: true,
                    removeRedundantAttributes: true,
                    useShortDoctype: true,
                    removeEmptyAttributes: true,
                    removeOptionalTags: true*/
                },
                files: [{
                    expand: true,
                    cwd: '<%= yeoman.app %>',
                    src: '*.html',
                    dest: '<%= yeoman.dist %>'
                }]
            }
        },
        // Put files not handled in other tasks here
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.app %>',
                    dest: '<%= yeoman.dist %>',
                    src: [
                        '*.{ico,png,txt}',
                        'images/{,*/}*.{webp,gif}',
                        'styles/{,*/}*.*',
                        'data/*.*'
                    ]
                }]
            },
            styles: {
                expand: true,
                dot: true,
                cwd: '<%= yeoman.tmp %>/styles',
                dest: '<%= yeoman.app %>/styles/',
                src: '{,*/}*.css'
            }
        },
        concurrent: {
            server: [
                'compass',
                'copy:styles',
                'template:config'
            ],
            dist: [
                'copy:styles',
                'imagemin',
                'svgmin',
                'htmlmin'
            ]
        },
        environments: {
            options: {
                local_path: 'dist',
                current_symlink: 'current',
                deploy_path: '/data/www/beatrealtime.com'
            },
            production: {
                options: {
                    host: '52.208.104.124',
                    username: '<%= yeoman.deploy.user %>',
                    privateKey: require('fs').readFileSync(process.env.BEATREALTIME_DEPLOY_KEY),
                    port: 22,
                    releases_to_keep: '5'
                }
            }
        },
        template: {
            options: {
                data: {
                    trackingID: '<%= yeoman.deploy.trackingID %>',
                    clientId: '<%= yeoman.api.clientId %>',
                    apiKey: '<%= yeoman.api.apiKey %>'
                }
            },
            index: {
                files: {
                    '<%= yeoman.dist %>/index.html': ['<%= yeoman.dist %>/index.html']
                }
            },
            config: {
                files: {
                    '<%= yeoman.app %>/scripts/config.js': ['<%= yeoman.app %>/scripts/config.js.dist']
                }
            }
        }
    });

    grunt.registerTask('server', function (target) {
        if (target === 'dist') {
            return grunt.task.run(['build', 'connect:dist:keepalive']);
        }

        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'connect:livereload',
            'watch'
        ]);
    });

    grunt.registerTask('fullwatch', function () {
        grunt.task.run([
            'clean:server',
            'concurrent:server',
            'autoprefixer',
            'watch'
        ]);
    });

    grunt.registerTask('build', [
        'clean:dist',
        'template:config',
        'requirejs',
        'compass:dist',
        'autoprefixer',
        'useminPrepare',
        'concurrent:dist',
        'copy:dist',
        'rev',
        'usemin',
        'template:index'
    ]);

    grunt.registerTask('test', [
        'jshint'
    ]);

    grunt.registerTask('default', [
        'test',
        'build'
    ]);

    grunt.registerTask('deploy', [
        'ssh_deploy:production'
    ]);
};
