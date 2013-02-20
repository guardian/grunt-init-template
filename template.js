/*
 * grunt-init-gui
 */

/*global exports */

(function ( exports, child_process ) {

	'use strict';

	// Basic template description.
	exports.description = 'Create a new Guardian Interactive project.';

	// Template-specific notes to be displayed before question prompts.
	exports.after = 'Now, install project dependencies with _npm install_. This will download grunt and the plugins this project uses. For further instructions do _cat README.md_';

	// Any existing file or directory matching this wildcard will cause a warning.
	exports.warnOn = '*';

	// The actual init template.
	exports.template = function(grunt, init, done) {

		var options, prompts, complete;

		options = {};
		prompts = [
			init.prompt( 'name' )
		];

		complete = function ( err, props ) {
			var files = init.filesToCopy( props );

			init.copyAndProcess( files, props );
			done();
		};

		init.process( options, prompts, complete );

	};

}( exports, require( 'child_process' ) ) );