// This is an AMD module. For more info on AMD and RequireJS go to http://requirejs.org/

define(
	
// dependency paths go here. These could be the paths specified in main.js
[ '$', '../lib/exampleLibrary' ],

function ( $, example ) {

	'use strict';
	
	var app = {
		init: function () {
			$( function () {
				setTimeout( function () {
					var loading = $( '#loading' );

					loading.fadeOut( function () {
						loading.remove();
						$( '#gui-example' ).hide().html( '<h2>Check the console output</h2>' ).fadeIn();
					});
				}, 1000 );
			});

			example.helloworld();
			console.log( 'Now try building the project with \'grunt build\'. Unless you already did' );
		}
	};

	window.app = app; // useful for debugging!

	return app;

});