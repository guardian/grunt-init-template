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
				tasks: 'data',
				interrupt: true
			}
		},


		// lint .js files in the src/js folder
		jshint: {
			files: 'project/src/js/**/*.js',
			options: {

			}
		},

		
		// remove build/tmp folder
		clean: 'build/tmp',


		// Compile .scss files
		sass: {
			dev: {
				files: {
					'tmp/': 'project/styles/*.scss'
				},
				options: {
					debugInfo: true
				}
			},
			dist: {
				files: {
					'tmp/': 'project/styles/*.scss'
				}
			}
		},
		
		// Concatenate all the files in tmp/css and minify as project/src/min.css
		cssmin: {
			compress: {
				files: {
					'project/src/min.css': 'tmp/css/*.css'
				}
			}
		},

		// Optimize JavaScript by minifying into a single file
		requirejs: {
			compile: {
				options: {
					baseUrl: 'project/src/js/',
					out: 'build/tmp/js/main.js',
					name: 'main',
					mainConfigFile: 'project/src/js/main.js'
				}
			}
		},

		// Copy the files we need from the src folder to build/tmp
		copy: {
			src: {
				files: {
					'build/tmp/': [ 'project/src/*.html', 'project/src/require.js', 'project/src/min.css', 'project/src/assets/**', 'project/src/data/**' ]
				},
				options: {
					basePath: 'project/src'
				}
			}
		},
		
		// Compress contents of `build/tmp` and save to `build/zip` with a timestamp
		compress: {
			zip: {
				files: {
					'build/zip/build-<%= grunt.template.today("yyyy-mm-dd_HH-MM-ss") %>.zip': 'build/tmp/**'
				}
			}
		},

		// Combine contents of `project/data` into a single `data.json` file
		data: {
			root: 'project/data/',
			dest: 'project/src/data/data.json'
		},

		// launch a static server
		connect: {
			server: {
				base: 'project/src',
				port: 9876,
				keepalive: true
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
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-compress');

	grunt.loadNpmTasks('grunt-dir2json');

	// default task - compile .scss files and flatten data
	grunt.registerTask( 'default', [ 'sass', 'mincss', 'data' ] );

	// build task - link, compile, flatten, optimise, copy
	grunt.registerTask( 'build', [ 'lint', 'default', 'requirejs', 'copy' ]);

	// aliases
	grunt.registerTask( 'zip', [ 'compress' ]);
	grunt.registerTask( 'lint', [ 'jshint' ]);

};
