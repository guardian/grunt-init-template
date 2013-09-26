/*global define, window */

define(
[ 'someDependency' ],
function ( someDep ) {

	'use strict';

	var app = {
		launch: function ( el, context, config, mediator ) {
			el.innerHTML = someDep;
		}
	};

	window.app = app; // useful for debugging!

	return app;

});