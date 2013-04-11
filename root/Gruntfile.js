/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({
		
		// Deployment-related stuff
		guid: '{%= guid %}',

		baseUrl: 'http://interactive.guim.co.uk/',

		projectPath: '{%= path %}/',
		version: 'x',
		versionDir: 'v/<%= version %>/',
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
				files: 'project/src/v/x/styles/**/*.scss',
				tasks: 'sass',
				interrupt: true
			},
			files: {
				files: 'project/src/v/x/files/**/*',
				tasks: 'copy:filesdev',
				interrupt: true
			},
			data: {
				files: 'project/src/v/x/data/**/*',
				tasks: 'dir2json:dev',
				interrupt: true
			},
			root: {
				files: 'project/src/*.*',
				tasks: 'replaceTags:dev'
			},
			js: {
				files: 'project/src/v/x/js/**',
				tasks: 'replaceTags:dev'
			}
		},


		// Lint .js files in the src/js folder
		jshint: {
			files: 'project/src/v/x/js/**/*.js',
			options: { jshintrc: '.jshintrc' }
		},

		
		// Clean up old cruft
		clean: {
			tmp: [ 'tmp' ],
			build: [ 'build' ],
			generated: [ 'generated' ]
		},


		// Compile .scss files
		sass: {
			options: { style: 'compressed' },
			dev: {
				files: {
					'generated/v/x/styles/min.css': 'project/src/v/x/styles/**/*.scss'
				},
				options: { debugInfo: true }
			},
			build: {
				files: {
					'build/v/x/styles/min.css': 'project/src/v/x/styles/**/*.scss'
				}
			}
		},
		
		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'build/v/x/js/',
					out: 'build/v/x/js/main.js',
					name: 'almond',
					include: 'main',
					mainConfigFile: 'build/v/x/js/main.js',
					wrap: true,
					optimize: 'uglify2',
					uglify2: {
						compress: {
							dead_code: true,
							conditionals: true // e.g. rewrite `if ( <%= production %> ) { doX(); } else { doY() }` as `doX()`
						}
					}
				}
			}
		},

		// Copy files
		copy: {
			files: {
				files: [{
					expand: true,
					cwd: 'project/src/v/x/files',
					src: ['**'],
					dest: 'build/v/x/files/'
				}]
			},
			boot: {
				files: [{
					expand: true,
					cwd: 'project/',
					src: ['*.*'],
					dest: 'build/'
				}]
			},
			filesdev: {
				files: [{
					expand: true,
					cwd: 'project/src/v/x/files',
					src: ['**'],
					dest: 'generated/v/x/files/'
				}]
			},
			bootdev: {
				files: [{
					expand: true,
					cwd: 'project/src/',
					src: ['*.*'],
					dest: 'generated/'
				}]
			},
			jsdev: {
				files: [{
					expand: true,
					cwd: 'project/src/v/x/js',
					src: ['**'],
					dest: 'generated/v/x/js'
				}]
			},
		},

		// Compress any CSS in the boot folder
		cssmin: { build: { files: [{
			expand: true,
			cwd: 'tmp/build/',
			src: '*.css',
			dest: 'build/'
		}] } },

		// Minify any JS in the boot folder
		uglify: { build: { files: [{
			expand: true,
			cwd: 'tmp/build/',
			src: '*.js',
			dest: 'build/'
		}] } },
		
		// Combine contents of `project/data` into a single `data.json` file
		dir2json: {
			dev: {
				root: 'project/src/v/x/data/',
				dest: 'generated/v/x/data/data.json',
				options: { space: '\t' }
			},
			build: {
				root: 'project/src/v/x/data/',
				dest: 'build/v/x/data/data.json'
			}
		},

		// Launch a development server, which looks for requested URLs in the folders below
		server: {
			options: { port: 80 }, // you have to do `sudo grunt server` to use port 80 (fonts etc won't work unless it's port 80)
			dev: {
				options: {
					mappings: [
						{
							prefix: '/v/x/js',
							src: 'project/js/'
						},
						{
							prefix: '/v/x',
							src: [ 'project/files/', 'generated/v/x/' ]
						},
						{
							prefix: '/preview',
							src: 'preview/'
						},
						{
							prefix: '/',
							src: [ 'generated/', 'project/boot/' ]
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
					],
					variables: {
						projectUrl: '',
						versionDir: 'v/x', // replace occurrences of <%= versionDir %> with this during development
						production: 'false'
					}
				}
			}
		},

		
		// Replace <%= tags %> with the specified variables
		replaceTags: {
			build: {
				files: [{
					expand: true,
					cwd: 'project/src/',
					src: [ '*.*' , 'v/x/js/**/*'],
					dest: 'build/'
				}],
				options: {
					variables: {
						projectUrl: '<%= projectUrl %>',
						versionDir: '<%= versionDir %>',
						production: false,
						codeobject: function () {
							return grunt.file.read( 'project/src/codeobject.html' ).replace( /<%=\s*projectUrl\s*%>/g, './' );
						}
					}
				}
			},
			dev: {
				files: [{
					expand: true,
					cwd: 'project/src/',
					src: [ '*.*' , 'v/x/js/**/*'],
					dest: 'generated/'
				}],
				options: {
					variables: {
						projectUrl: './',
						versionDir: 'v/x/',
						production: false,
						codeobject: function () {
							return grunt.file.read( 'project/src/codeobject.html' ).replace( /<%=\s*projectUrl\s*%>/g, './' );
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
					key: '<%= projectPath %>/manifest.json',
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
					cwd: 'build/v/x/',
					src: [ '**/*' ]
				}],
				options: {
					pathPrefix: '<%= versionPath %>',
					params: {
						CacheControl: 'max-age=31536000'
					}
				}
			},
			root: {
				files: [{
					expand: true,
					cwd: 'build/',
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

	

	
	// default task - compile .scss files and flatten data
	grunt.registerTask( 'default', [
		'copy:filesdev',
		'sass:dev',
		'dir2json:dev',
		'replaceTags:dev',
		'watch'
	]);

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [
		// clear out previous build
		'clean:build',
		'clean:tmp',

		// copy files from project/files to build/version and from project/boot to build/boot
		'copy:files',
		'copy:boot',

		// build our min.css, without debugging info
		'sass:build',
		'dir2json:build',


		// add project URL and version information to files
		'replaceTags:build',

		// optimise JS
		'requirejs',


		// optimise JS and CSS from the boot folder
		'cssmin:build',
		'uglify:build',

	]);

	// launch sequence
	grunt.registerTask( 'deploy', [
		// clear the tmp folder
		'clean:tmp',

		// connect to S3, establish version number
		'createS3Instance',
		'downloadFromS3:manifest',
		'verifyManifest',

		// build project
		'build',

		// upload files
		'lockProject',
		'uploadToS3:manifest',
		'uploadToS3:version',
		'uploadToS3:root',
		'lockProject:unlock',

		// point browser at newly deployed project
		'shell:open'
	]);

	grunt.registerTask( 'deploy:simulate', [
		// clear the tmp folder
		'clean:tmp',

		// connect to S3, establish version number
		'createS3Instance',
		'downloadFromS3:manifest',
		'verifyManifest',

		// build project
		'build'
	]);

};
