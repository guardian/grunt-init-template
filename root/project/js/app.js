// This is an AMD module. For more info on AMD and RequireJS go to http://requirejs.org/

define(
	
// dependency paths go here. These could be the paths specified in main.js
[ '$' ],

function ( $ ) {

	'use strict';
	
	var app = {
		init: function () {
			$( function () {
				setTimeout( function () {
					var loading = $( '#loading' );

					loading.fadeOut( function () {
						loading.html( '<h2>ta-da!</h2>' ).fadeIn();
					});
				}, 2000 );
			});
		}
	};

	window.app = app; // useful for debugging!

	return app;

});