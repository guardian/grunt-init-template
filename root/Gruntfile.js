/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({

		// Config
		prod: grunt.option( 'prod' ),
		min: grunt.option( 'min' ) || grunt.option( 'prod' ),
		target: '<%= min ? "min" : "dev" %>',
		tmpTarget: '<%= min ? "tmp" : "dev" %>',

		// Template tags
		require: '<%= prod ? "http://pasteup.guim.co.uk/js/lib/requirejs/2.1.5/require.min.js" : "../../offline/require.js" %>',
		codeobject: grunt.file.read( 'src/codeobject.html' ),
		projectUrl: '<%= prod ? baseUrl + projectPath : "./" %>',
		versionDir: 'v/<%= version %>/',
		fonts: '<%= prod ? "http://pasteup.guim.co.uk/0.0.5/css/fonts.pasteup.min.css" : "../../offline/fonts.css" %>',

		// Deployment-related stuff
		guid: '{%= guid %}',
		baseUrl: 'http://interactive.guim.co.uk/',
		projectPath: '{%= path %}/',
		version: 'x', // will be overridden by deploy task

		s3: {
			bucket: 'gdn-cdn'
		},

		// Main watch task. Kick this off by entering `grunt watch`. Now, any time you change the files below,
		// the relevant tasks will execute
		watch: {
			options: {
				interrupt: true
			},
			sass: {
				files: 'src/**/*.scss',
				tasks: 'sass'
			},
			data: {
				files: 'src/versioned/data/**/*',
				tasks: 'dir2json'
			},
			versioned: {
				files: [ 'src/versioned/**/*', '!src/versioned/js/**/*' ],
				tasks: 'copy:versioned'
			},
			nonVersioned: {
				files: [ 'src/**/*', '!src/versioned/**/*' ],
				tasks: 'copy:nonVersioned'
			},
			js: {
				files: 'src/versioned/js/**',
				tasks: 'copy:js'
			}
		},


		// Lint .js files in the src/js folder
		jshint: {
			files: [
				'src/versioned/js/**/*.js',

				//exclude these files:
				'!src/versioned/js/lib/**/*.js',
				'!src/versioned/js/utils/**/*.js',
				'!src/versioned/js/text.js'
			],
			options: {
				undef: true,
				unused: true,
				boss: true,
				smarttabs: true,
				globals: {
					define: true,
					window: true,
					document: true,
					navigator: true,
					XMLHttpRequest: true,
					setTimeout: true,
					clearTimeout: true,
					Image: true
				},

				// don't actually fail the build
				force: true
			}
		},


		// Clean up old cruft
		clean: {
			tmp: [ 'tmp' ],
			build: [ 'build/tmp', 'build/<%= target %>' ]
		},


		// Compile .scss files
		sass: {
			main: {
				files: [{
					src: 'src/versioned/styles/main.scss',
					dest: 'build/<%= target %>/v/x/styles/min.css'
				}],
				options: {
					debugInfo: '<%= prod ? false : true %>',
					style: ( '<%= min ? "compressed" : "expanded" %>' )
				}
			}
		},

		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'build/tmp/v/x/js/',
					out: 'build/min/v/x/js/app.js',
					name: 'app',
					optimize: 'none', // js gets uglified separately, no need to waste time here

					// If you change the paths config in boot.js, ensure the changes
					// are reflected here
					paths: {
						text: 'text' // necessary for curl, which expects plugins in a specific folder
					},

					// We don't need to include loader plugins in the build
					stubModules: [ 'text' ]
				}
			}
		},

		// Copy files
		copy: {
			versioned: {
				files: [{
					expand: true,
					cwd: 'src/versioned/files',
					src: [ '**', '!js/**/*' ],
					dest: 'build/<%= target %>/v/x/files/'
				}]
			},
			nonVersioned: {
				files: [{
					expand: true,
					cwd: 'src/',
					src: [ '**', '!versioned', '!versioned/**/*', '<%= prod ? "!" : "" %>preview.html' ],
					dest: 'build/<%= target %>/'
				}]
			},
			js: {
				files: [{
					expand: true,
					cwd: 'src/versioned/js',
					src: [ '**' ],
					dest: 'build/<%= tmpTarget %>/v/x/js' // tmp, as it needs to be optimised
				}]
			},
			options: {
				processContent: function ( content, srcpath ) {
					return grunt.template.process( content );
				},

				// We manually specify which file extensions shouldn't be processed - basically
				// any binary files such as images, audio, video etc, plus readmes
				processContentExclude: [ '**/*.{jpg,png,gif,mp3,ogg,mp4}', '**/README.md' ]
			}
		},

		// Compress all CSS
		cssmin: {
			build: {
				files: [{
					expand: true,
					cwd: 'build/min/',
					src: '**/*.css',
					dest: 'build/min/'
				}]
			}
		},

		// Minify all JS
		uglify: {
			options: {
				compress: {
					dead_code: true,
					conditionals: true // e.g. rewrite `if ( <%= production %> ) { doX(); } else { doY() }` as `doX()`
				}
			},
			build: {
				files: [{
					expand: true,
					cwd: 'build/min/',
					src: '**/*.js',
					dest: 'build/min/'
				}]
			}
		},

		// Combine contents of `src/versioned/data` into a single `data.json` file
		dir2json: {
			data: {
				root: 'src/versioned/data/',
				dest: 'build/<%= tmpTarget %>/v/x/data/data.json',
				options: {
					exclude: [ '**/README.md' ],
					space: '<%= min ? "" : "\t" %>'
				}

				// or if the data is small enough to inline:

				// dest: 'build/<%= tmpTarget %>/v/x/js/data.js',
				// options: {
				// 	exclude: [ '**/README.md' ],
				// 	space: '<%= min ? "" : "\t" %>',
				// 	amd: true
				// }
			}
		},

		// Download from S3
		downloadFromS3: {
			options: {
				bucket: '<%= s3.bucket %>'
			},
			manifest: {
				options: {
					key: '<%= projectPath %>manifest.json',
					dest: 'tmp/manifest.json'
				}
			}
		},

		// Verify manifest
		verifyManifest: {
			options: {
				src: 'tmp/manifest.json'
			}
		},

		// Lock/unlock project
		lockProject: {
			options: {
				bucket: '<%= s3.bucket %>',
				lockfile: '<%= projectPath %>/locked.txt'
			}
		},

		// Upload to S3
		uploadToS3: {
			options: {
				bucket: '<%= s3.bucket %>'
			},
			manifest: {
				options: {
					key: '<%= projectPath %>manifest.json',
					data: '{"guid":"<%= guid %>","version":<%= version %>}',
					params: {
						CacheControl: 'no-cache',
						ContentType: 'application/json'
					}
				}
			},
			version: {
				files: [{
					expand: true,
					cwd: 'build/min/v/x/',
					src: [ '**/*' ]
				}],
				options: {
					pathPrefix: '<%= projectPath %><%= versionDir %>',
					params: {
						CacheControl: 'max-age=31536000'
					}
				}
			},
			root: {
				files: [{
					expand: true,
					cwd: 'build/min',
					src: [ '*.*' ]
				}],
				options: {
					pathPrefix: '<%= projectPath %>',
					params: {
						CacheControl: 'max-age=20'
					}
				}
			}
		},

		// shell commands
		shell: {
			open: {
				command: 'open <%= projectUrl %>index.html'
			}
		}

	});


	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-dir2json');
	grunt.loadNpmTasks('grunt-shell');


	// Guardian Interactive tasks
	grunt.loadNpmTasks('grunt-gui');



	grunt.registerTask( 'setProdFlag', function () {
		grunt.config( 'prod', true );
		grunt.config( 'min', true );
	});

	grunt.registerTask( 'setMinFlag', function () {
		grunt.config( 'min', true );
	});

	var buildSequence = [
		'clean:build',
		'clean:tmp',

		'jshint',
		'copy:nonVersioned',
		'copy:js',
		'copy:versioned',
		'sass',
		'dir2json'
	];

	grunt.registerTask( 'build', buildSequence );
	grunt.registerTask( 'min', [ 'setMinFlag' ].concat( buildSequence ).concat([ 'requirejs', 'cssmin', 'uglify' ]) );

	// default task - generate dev build and watch for changes
	grunt.registerTask( 'default', [
		'build',
		'watch'
	]);

	// launch sequence
	grunt.registerTask( 'deploy', [
		// set production flag
		'setProdFlag',

		// connect to S3, establish version number
		'createS3Instance',
		'downloadFromS3:manifest',
		'verifyManifest',

		// build project
		'min',

		// upload files
		'lockProject',
		'uploadToS3:manifest',
		'uploadToS3:version',
		'uploadToS3:root',
		'lockProject:unlock',

		// point browser at newly deployed project
		'shell:open'
	]);

};
