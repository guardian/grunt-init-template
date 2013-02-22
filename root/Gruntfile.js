/*global module:false*/
module.exports = function(grunt) {

	grunt.initConfig({
		
		pkg: grunt.file.readJSON('package.json'),

		// Main watch task. Kick this off by entering `grunt watch`. Now, any time you change the files below,
		// the relevant tasks will execute
		watch: {
			sass: {
				files: 'project/styles/*.scss',
				tasks: 'sass',
				interrupt: true
			},
			css: {
				files: 'tmp/css/*',
				tasks: 'cssmin',
				interrupt: true
			},
			data: {
				files: 'project/data/**/*',
				tasks: 'dir2json:dev',
				interrupt: true
			}
		},


		// lint .js files in the src/js folder
		jshint: {
			files: 'project/root/js/**/*.js',
			options: {

			}
		},

		
		// remove build/tmp folder
		clean: {
			dist: [ 'dist' ]
		},


		// Compile .scss files
		sass: {
			options: {
				style: 'compressed'
			},
			dev: {
				files: {
					'dev/min.css': 'project/styles/*.scss'
				},
				options: {
					debugInfo: true
				}
			},
			dist: {
				files: {
					'dist/min.css': 'project/styles/*.scss'
				}
			}
		},
		
		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'project/js/',
					out: 'dist/main.js',
					name: 'main',
					mainConfigFile: 'project/js/main.js'
				}
			}
		},

		// Copy the files we need from the src folder to build/tmp
		copy: {
			root: {
				files: [{
					expand: true,
					cwd: 'project/root',
					src: ['**'],
					dest: 'dist/'
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
				dest: 'dev/data.json'
			},
			dist: {
				root: 'project/data/',
				dest: 'dist/data.json'
			}
		},

		// launch a static server
		connect: {
			options: {
				port: 9876,
				keepalive: true
			},
			server: {
				options: {
					base: 'project/root',
					middleware: function ( connect, options ) {
						return [
							// special cases
							function ( req, res, next ) {
								var codeobject, index;

								// index page - render codeobject, insert into preview/default.html, and serve
								if ( req.url === '/' ) {
									codeobject = grunt.file.read( 'project/codeobject.html' );

									index = grunt.file.read( 'project/preview/default.html' );

									while ( codeobject.indexOf( '<%= ROOT %>' ) !== -1 ) {
										codeobject = codeobject.replace( '<%= ROOT %>', '' );
									}

									res.end( index.replace( '<%= CODEOBJECT %>', codeobject ) );
								}

								// readme - render markdown
								else if ( req.url.toLowerCase() === '/readme' ) {
									var readme, html, style;

									readme = grunt.file.read( 'README.md' );
									html = require( 'markdown' ).markdown.toHTML( readme );
									style = '<style>body{font-family:"Helvetica Neue", "Arial";font-size:16px;color:#333;}pre{background-color:#eee;display:block;padding:5px;}</style>';

									res.end( style + html );
								}

								else {
									next();
								}
							},

							// try project/root first
							connect[ 'static' ]( 'project/root' ),

							// then auto-generated files in dev
							connect[ 'static' ]( 'dev' ),

							// then javascript files
							connect[ 'static' ]( 'project/js' ),

							// then the preview files
							connect[ 'static' ]( 'project/preview' ),

							// browse directories
							connect.directory( options.base, {
								hidden: true,
								icons: true
							})
						];
					}
				}
			},
			sanitycheck: {
				options: {
					base: 'dist'
				}
			}
		},

		deploy: {
			bucket: 'gdn-cdn',
			path: '{%= path %}',
			guid: '{%= guid %}',
			root: 'dist'
		}

	});


	// These plugins provide necessary tasks.
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compress');
	grunt.loadNpmTasks('grunt-contrib-copy');

	grunt.loadNpmTasks('grunt-dir2json');
	grunt.loadNpmTasks('grunt-gui-deploy');


	// simple render task. yeah, this is filthy, refactor ASAP
	grunt.registerTask( 'render', 'Render index file and codeobject', function () {

		var codeobject, index;

		codeobject = grunt.file.read( 'project/codeobject.html' );
		index = grunt.file.read( 'project/preview/default.html' );

		while ( codeobject.indexOf( '<%= ROOT %>' ) !== -1 ) {
			codeobject = codeobject.replace( '<%= ROOT %>', '' );
		}

		index = index.replace( '<%= CODEOBJECT %>', codeobject );

		grunt.file.write( 'dist/index.html', index );
	});


	

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [ 'clean:dist', 'lint', 'sass:dist', 'dir2json:dist', 'requirejs', 'copy', 'render' ]);

	// aliases
	grunt.registerTask( 'zip', [ 'compress' ]);
	grunt.registerTask( 'lint', [ 'jshint' ]);

	grunt.registerTask( 'server', 'connect:server' );
	grunt.registerTask( 'preview', 'connect:preview' );
	grunt.registerTask( 'sanitycheck', 'connect:sanitycheck' );


	// default task - compile .scss files and flatten data
	grunt.registerTask( 'default', [ 'sass:dev', 'dir2json:dev' ] );

};
