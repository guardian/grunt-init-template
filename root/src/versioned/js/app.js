/*global define, window */

define(
[ 'someDependency' ],
function ( someDep ) {

	'use strict';

	var app = {
		launch: function ( el, guiEl, context, config, mediator ) {
			guiEl.innerHTML = someDep;
		}
	};

	window.app = app; // useful for debugging!

	return app;

});