/*
 * grunt-init-gui
 */

/*global exports */

(function ( exports, child_process ) {

	'use strict';

	// Basic template description.
	exports.description = 'Create a new Guardian Interactive project.';

	// Template-specific notes to be displayed before question prompts.
	exports.after = 'Now, install project dependencies with _npm install_ (or _npm install --no-registry_ to install modules from cache, which may be much faster). This will download grunt and the plugins this project uses. For further instructions do _cat README.md_';

	// Any existing file or directory matching this wildcard will cause a warning.
	exports.warnOn = '*';

	// The actual init template.
	exports.template = function(grunt, init, done) {

		var options, prompts, complete, getDefaultPath;

		options = {};
		prompts = [
			init.prompt( 'name' )
		];


		getDefaultPath = function ( date, name ) {
			var months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ];
			return [ date.getFullYear(), months[ date.getMonth() ], name ].join( '/' );
		};


		complete = function ( err, props ) {
			var files;

			// generate a GUID for this project. Thanks, http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
			props.guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
				var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
				return v.toString(16);
			});

			// timestamp
			props.timestamp = new Date();

			// default path
			props.path = getDefaultPath( props.timestamp, props.name );

			// capitalise name
			props.Name = props.name.substr( 0, 1 ).toUpperCase() + props.name.substring( 1 );

			files = init.filesToCopy( props );

			init.copyAndProcess( files, props );
			done();
		};

		init.process( options, prompts, complete );

	};

}( exports, require( 'child_process' ) ) );