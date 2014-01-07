define( function ( require ) {

	'use strict';

	var app, scaffolding;

	scaffolding = require( 'text!./scaffolding.html' );

	app = {
		launch: function ( el ) {
			app.el = el;
			app.el.innerHTML = scaffolding;
		}
	};

	window.app = app; // useful for debugging!

	return app;

});