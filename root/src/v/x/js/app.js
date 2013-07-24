/*global define, window */

define(
[],
function () {

	'use strict';

	var app = {
		launch: function ( el, guiEl, window, config, mediator ) {
			console.log( 'launching app' );
		}
	};

	window.app = app; // useful for debugging!

	return app;

});