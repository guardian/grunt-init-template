/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	// helpers
	var url;

	url = require( 'url' );

	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),

		// Deployment-related stuff
		guid: '{%= guid %}',

		baseUrl: 'http://interactive.guim.co.uk/',

		projectPath: '{%= path %}',
		versionDir: '/v/<%= version %>',
		versionPath: '<%= projectPath %><%= versionDir %>',
		
		projectUrl: '<%= baseUrl %><%= projectPath %>',
		versionUrl: '<%= baseUrl %><%= projectPath %><%= versionDir %>',

		s3: {
			bucket: 'gdn-cdn'
		},

		// Main watch task. Kick this off by entering `grunt watch`. Now, any time you change the files below,
		// the relevant tasks will execute
		watch: {
			sass: {
				files: 'project/styles/*.scss',
				tasks: 'sass',
				interrupt: true
			},
			data: {
				files: 'project/data/**/*',
				tasks: 'dir2json:dev',
				interrupt: true
			},
			codeobject: {
				files: 'project/codeobject.html',
				tasks: 'replaceTags:codeobject'
			},
			index: {
				files: 'project/index.html',
				tasks: [ 'replaceTags:codeobject', 'replaceTags:index' ]
			}
		},


		// lint .js files in the src/js folder
		jshint: {
			files: 'project/**/*.js',
			options: {
				jshintrc: '.jshintrc'
			}
		},

		
		// clean up old cruft
		clean: {
			tmp: [ 'tmp' ],
			dist: [ 'dist' ],
			generated: [ 'generated' ]
		},


		// Compile .scss files
		sass: {
			options: {
				style: 'compressed'
			},
			dev: {
				files: {
					'generated/version-x/min.css': 'project/styles/*.scss'
				},
				options: {
					debugInfo: true
				}
			},
			dist: {
				files: {
					'dist/version/min.css': 'project/styles/*.scss'
				}
			}
		},
		
		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'project/js/',
					out: 'dist/version/main.js',
					name: 'main',
					mainConfigFile: 'project/js/main.js'
				}
			}
		},

		// Copy the files we need from the src folder to build/tmp
		copy: {
			version: {
				files: [{
					expand: true,
					cwd: 'project/files',
					src: ['**'],
					dest: 'dist/version/'
				}]
			},
			boot: {
				files: [{
					expand: true,
					cwd: 'project/boot',
					src: ['**'],
					dest: 'dist/boot/'
				}]
			}
		},

		// Compress any CSS in the boot folder
		cssmin: {
			dist: {
				files: [{
					expand: true,
					cwd: 'project/boot',
					src: '**/*.css',
					dest: 'dist/boot/'
				}]
			}
		},

		// Minify any JS in the boot folder
		uglify: {
			dist: {
				files: [{
					expand: true,
					cwd: 'project/boot',
					src: '**/*.js',
					dest: 'dist/boot/'
				}]
			}
		},
		
		// Compress contents of `build/tmp` and save to `build/zip` with a timestamp
		compress: {
			zip: {
				files: {
					'zip/<%= pkg.name %>-<%= grunt.template.today("yyyy-mm-dd_HH-MM-ss") %>.zip': 'dist/**/*'
				}
			}
		},

		// Combine contents of `project/data` into a single `data.json` file
		dir2json: {
			dev: {
				root: 'project/data/',
				dest: 'generated/version-x/data.json'
			},
			dist: {
				root: 'project/data/',
				dest: 'dist/version/data.json'
			}
		},



		server: {
			options: {
				port: 9876
			},
			dev: {
				options: {
					mappings: [
						{
							prefix: '/version-x/',
							src: [ 'project/files/', 'generated/version-x/', 'project/js/' ]
						},
						{
							prefix: '/preview/',
							src: 'project/preview/'
						},
						{
							prefix: '/',
							src: [ 'project/boot/', 'generated/' ]
						},
						{
							prefix: '/readme',
							src: function ( req ) {
								var markdown, html, style;

								markdown = grunt.file.read( 'README.md' );
								html = require( 'markdown' ).markdown.toHTML( markdown );

								style = "<style>body {font-family: 'Helvetica Neue', 'Arial'; font-size: 16px; color: #333; } pre { background-color: #eee; padding: 0.5em; } hr { margin: 2em 0 }</style>";

								return style + html;
							}
						}
					]
				}
			}
		},

		
		// Render variables
		replaceTags: {
			predeployCodeobject: {
				src: 'project/codeobject.html',
				dest: 'tmp/codeobject.html',
				options: {
					variables: {
						projectUrl: '',
						versionDir: 'v/<%= version %>'
					}
				}
			},
			predeployIndex: {
				src: 'project/index.html',
				dest: 'dist/boot/index.html',
				options: {
					variables: {
						codeobject: function () {
							return grunt.file.read( 'tmp/codeobject.html' );
						}
					}
				}
			},
			devCodeobject: {
				src: 'project/codeobject.html',
				dest: 'generated/codeobject.html',
				options: {
					variables: {
						projectUrl: '',
						versionDir: 'version-x/'
					}
				}
			},
			devIndex: {
				src: 'project/index.html',
				dest: 'generated/index.html',
				options: {
					variables: {
						codeobject: function () {
							return grunt.file.read( 'generated/codeobject.html' );
						}
					}
				}
			}
		},


		// Download from S3
		downloadFromS3: {
			options: {
				bucket: '<%= s3.bucket %>'
			},
			manifest: {
				options: {
					key: '<%= projectPath %>/manifest.json',
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
					key: '<%= projectPath %>/manifest.json',
					data: '{"guid":"<%= guid %>","version":<%= version %>}',
					params: {
						CacheControl: 'no-cache',
						ContentType: 'application/json'
					}
				}
			},
			version: {
				options: {
					root: 'dist/version/',
					pathPrefix: '<%= versionPath %>',
					params: {
						CacheControl: 'max-age=31536000'
					}
				}
			},
			boot: {
				options: {
					root: 'dist/boot/',
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
				command: 'open <%= projectUrl %>/index.html'
			}
		}

	});


	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-dir2json');
	grunt.loadNpmTasks('grunt-shell');
	

	// Guardian Interactive tasks
	grunt.loadNpmTasks('grunt-gui');

	

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [
		'clean:dist',
		'lint',
		'sass:dist',
		'dir2json:dist',
		'requirejs',
		'copy',
		'cssmin:dist',
		'uglify:dist'
	]);

	// launch sequence
	grunt.registerTask( 'deploy', [
		'clean:tmp',
		'createS3Instance',
		'downloadFromS3:manifest',
		'verifyManifest',
		'replaceTags:predeployCodeobject',
		'replaceTags:predeployIndex',
		'lockProject',
		'uploadToS3:manifest',
		'uploadToS3:version',
		'uploadToS3:boot',
		'lockProject:unlock',
		'shell:open'
	]);

	// aliases
	grunt.registerTask( 'zip', [ 'compress' ]);
	grunt.registerTask( 'lint', [ 'jshint' ]);


	// default task - compile .scss files and flatten data
	grunt.registerTask( 'default', [ 'sass:dev', 'dir2json:dev', 'replaceTags:devCodeobject', 'replaceTags:devIndex' ] );

};
