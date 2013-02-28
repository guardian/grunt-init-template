/*global define, window */

define( [ '$' ],

function ( $ ) {

	'use strict';
	
	var app;

	app = {
		init: function () {
			var deferreds = {};

			// wait for DOM ready
			deferreds.dom = new $.Deferred();
			$(function () {
				deferreds.dom.resolve();
			});


			// load our app data
			deferreds.data = $.ajax( app.projectUrl + app.versionDir + 'data.json' ).done( function ( data ) {
				app.data = data;
			}).fail( function () {
				throw new Error( 'Run grunt to create the data.json file, then reload' );
			});


			// when we have DOM ready and data ready, proceed
			$.when( deferreds.dom, deferreds.data ).done( function () {
				
				console.log( 'root: %s', app.root );
				console.log( 'versionPath: %s', app.versionPath );

				setTimeout( function () {
					var demo = $( '#gui-{%= name %}' );

					demo.fadeOut( function () {
						demo.html( app.data.scaffolding ).fadeIn();
					});
				}, 2000 );
			});
		}
	};


	window.app = app; // useful for debugging!

	return app;

});