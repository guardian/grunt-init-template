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
			deferreds.data = $.ajax( '<%= projectUrl %>/<%= versionDir %>/data.json' ).done( function ( data ) {
				app.data = data;
			}).fail( function () {
				throw new Error( 'Run grunt to create the data.json file, then reload' );
			});


			// when we have DOM ready and data ready, proceed
			$.when( deferreds.dom, deferreds.data ).done( function () {
				
				console.log( 'projectUrl: %s', app.projectUrl );
				console.log( 'versionDir: %s', app.versionDir );

				var demo = $( '#gui-{%= name %}' );

				demo.fadeOut( function () {
					demo.html( app.data.scaffolding ).fadeIn();
				});
			});
		}
	};


	window.app = app; // useful for debugging!

	return app;

});