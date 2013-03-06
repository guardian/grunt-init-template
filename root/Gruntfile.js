/*global module:false*/
module.exports = function(grunt) {

	'use strict';

	grunt.initConfig({
		
		// Deployment-related stuff
		guid: '{%= guid %}',

		baseUrl: 'http://interactive.guim.co.uk',

		projectPath: '{%= path %}',
		versionDir: 'v/<%= version %>',
		versionPath: '<%= projectPath %>/<%= versionDir %>',
		
		projectUrl: '<%= baseUrl %>/<%= projectPath %>',
		versionUrl: '<%= baseUrl %>/<%= projectPath %>/<%= versionDir %>',

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
				tasks: 'replaceTags:devIndex'
			},
			main: {
				files: 'project/main.js',
				tasks: 'replaceTags:devMain'
			}
		},


		// Lint .js files in the src/js folder
		jshint: {
			files: 'project/**/*.js',
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
					'generated/version-x/min.css': 'project/styles/*.scss'
				},
				options: { debugInfo: true }
			},
			build: {
				files: {
					'build/version/min.css': 'project/styles/*.scss'
				}
			}
		},
		
		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'tmp/build/js/',
					out: 'build/version/js/main.js',
					name: 'main',
					mainConfigFile: 'tmp/build/js/main.js'
				}
			}
		},

		// Copy files
		copy: {
			version: {
				files: [{
					expand: true,
					cwd: 'project/files',
					src: ['**'],
					dest: 'build/version/'
				}]
			},
			boot: {
				files: [{
					expand: true,
					cwd: 'project/boot',
					src: ['**'],
					dest: 'build/'
				}]
			}
		},

		// Compress any CSS in the boot folder
		cssmin: { build: { files: [{
			expand: true,
			cwd: 'tmp/build/boot',
			src: '**/*.css',
			dest: 'build/boot/'
		}] } },

		// Minify any JS in the boot folder
		uglify: { build: { files: [{
			expand: true,
			cwd: 'tmp/build/boot',
			src: '**/*.js',
			dest: 'build/boot/'
		}] } },
		
		// Combine contents of `project/data` into a single `data.json` file
		dir2json: {
			dev: {
				root: 'project/data/',
				dest: 'generated/version-x/data.json',
				options: { space: '\t' }
			},
			build: {
				root: 'project/data/',
				dest: 'build/version/data.json'
			}
		},

		// Launch a development server, which looks for requested URLs in the folders below
		server: {
			options: { port: 80 }, // you have to do `sudo grunt server` to use port 80 (fonts etc won't work unless it's port 80)
			dev: {
				options: {
					mappings: [
						{
							prefix: '/version-x/js',
							src: 'project/js/'
						},
						{
							prefix: '/version-x',
							src: [ 'project/files/', 'generated/version-x/' ]
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
						versionDir: 'version-x' // replace occurrences of <%= versionDir %> with this during development
					}
				}
			}
		},

		
		// Replace <%= tags %> with the specified variables
		replaceTags: {
			build: {
				files: [{
					expand: true,
					cwd: 'project/',
					src: [ 'js/**/*', 'boot/**/*', 'codeobject.html' ],
					dest: 'tmp/build/'
				}],
				options: {
					variables: {
						projectUrl: '<%= projectUrl %>',
						versionDir: '<%= versionDir %>'
					}
				}
			},
			buildIndex: {
				src: 'project/index.html',
				dest: 'build/boot/index.html',
				options: {
					variables: {
						codeobject: function () {
							return grunt.file.read( 'tmp/build/codeobject.html' );
						}
					}
				}
			},
			devIndex: {
				src: 'project/index.html',
				dest: 'generated/index.html',
				options: {
					variables: {
						codeobject: function () {
							return grunt.file.read( 'project/codeobject.html' ).replace( /<%=\s*projectUrl\s*%>/g, '' );
						}
					}
				}
			},
			codeobject: {
				src: 'project/codeobject.html',
				dest: 'build/codeobject.html',
				options: {
					variables: {
						projectUrl: '<%= projectUrl %>'
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
				options: {
					root: 'build/version/',
					pathPrefix: '<%= versionPath %>',
					params: {
						CacheControl: 'max-age=31536000'
					}
				}
			},
			boot: {
				options: {
					root: 'build/boot/',
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
		'sass:dev',
		'dir2json:dev',
		//'replaceTags:devCodeobject',
		'replaceTags:devIndex',
		'watch'
	]);

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [
		// clear out previous build
		'clean:build',

		// lint code
		'jshint',

		// build our min.css, without debugging info
		'sass:build',
		'dir2json:build',

		// add project URL and version information to files
		'replaceTags:build',
		'replaceTags:buildIndex',

		// optimise JS
		'requirejs',

		// copy files from project/files to build/version and from project/boot to build/boot
		'copy',

		// optimise JS and CSS from the boot folder
		'cssmin:build',
		'uglify:build',

		// generate a codeobject (in build/) that can be used to embed this interactive wherever
		'replaceTags:codeobject'
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
		'uploadToS3:boot',
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
