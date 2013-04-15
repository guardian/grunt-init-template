/*global module:false*/
module.exports = function(grunt) {

	'use strict';



	//Create some functions for replacing tags in documents
	var tagReplacer = function(tags){
		var replacer = function(content, srcpath){
			for(var tagName in tags){
				var tagValue = grunt.config.process(tags[tagName]);
				var regex = new RegExp("<%=\\s*"+tagName+"\\s*%>", "g");
				content = content.replace(regex, tagValue);
			}
			return content;
		};
		return replacer;
	};

	//Tag replacer for dev
	var devTagReplacer = tagReplacer({
		projectUrl: './',
		versionDir: 'v/x/',
		production: false,
		codeobject: grunt.file.read( 'project/src/codeobject.html' ).replace( /<%=\s*projectUrl\s*%>/g, './' )
	});
	//Tag replacer for build
	var buildTagReplacer = tagReplacer({
		projectUrl: '<%= projectUrl %>',
		versionDir: '<%= versionDir %>',
		production: true,
		codeobject: grunt.file.read( 'project/src/codeobject.html' ).replace( /<%=\s*projectUrl\s*%>/g, './' )
	});



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
				tasks: 'sass:dev',
				interrupt: true
			},
			data: {
				files: 'project/src/v/x/data/**/*',
				tasks: 'dir2json:dev',
				interrupt: true
			},
			files: {
				files: 'project/src/v/x/files/**/*',
				tasks: 'copy:filesdev',
				interrupt: true
			},
			root: {
				files: 'project/src/*.*',
				tasks: 'copy:rootdev',
				interrupt: true
			},
			js: {
				files: 'project/src/v/x/js/**',
				tasks: 'copy:jsdev',
				interrupt: true
			}
		},


		// Lint .js files in the src/js folder
		jshint: {
			files: ['project/src/v/x/js/**/*.js', 
			//exclude these files:
			'!project/src/v/x/js/almond.js', '!project/src/v/x/js/require.js', '!project/src/v/x/js/lib/**/*.js'],
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
			dev: {
				files: {
					'generated/v/x/styles/min.css': 'project/src/v/x/styles/**/*.scss'
				},
				options: { debugInfo: true }
			},
			build: {
				files: {
					'build/v/x/styles/min.css': 'project/src/v/x/styles/**/*.scss'
				},
				options: { style: 'compressed' }
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
			root: {
				files: [{
					expand: true,
					cwd: 'project/src/',
					src: ['*.*'],
					dest: 'build/'
				}],
				options: {
					processContent: buildTagReplacer
				}
			},
			js: {
				files: [{
					expand: true,
					cwd: 'project/src/v/x/js',
					src: ['**'],
					dest: 'build/v/x/js'
				}],
				options: {
					processContent: buildTagReplacer
				}
			},
			filesdev: {
				files: [{
					expand: true,
					cwd: 'project/src/v/x/files',
					src: ['**'],
					dest: 'generated/v/x/files/'
				}]
			},
			rootdev: {
				files: [{
					expand: true,
					cwd: 'project/src/',
					src: ['*.*'],
					dest: 'generated/'
				}],
				options: {
					processContent: devTagReplacer
				}
			},
			jsdev: {
				files: [{
					expand: true,
					cwd: 'project/src/v/x/js',
					src: ['**'],
					dest: 'generated/v/x/js'
				}],
				options: {
					processContent: devTagReplacer
				}
			},
		},

		// Compress any CSS in the root folder
		cssmin: {
			build: {
				files: [{
					expand: true,
					cwd: 'tmp/build/',
					src: '*.css',
					dest: 'build/'
				}]
			}
		},

		// Minify any JS in the root folder
		uglify: {
			build: {
				files: [{
				expand: true,
				cwd: 'build/',
				src: '*.js',
				dest: 'build/'}]
			}
		},
		
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
							src: [ 'generated/', 'project/root/' ]
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
		'copy:rootdev',
		'copy:jsdev',
		'copy:filesdev',
		'sass:dev',
		'dir2json:dev',
		'watch'
	]);

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [
		// clear out previous build
		'clean:build',
		'clean:tmp',

		//Lint js files!
		'jshint',

		// copy files from project/files to build/v/x/files and from project root to build root
		'copy:root',
		'copy:js',
		'copy:files',

		// build our min.css, without debugging info
		'sass:build',
		'dir2json:build',

		// optimise JS
		'requirejs',

		// optimise JS and CSS from the root folder
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
