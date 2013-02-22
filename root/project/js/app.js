// This is an AMD module. For more info on AMD and RequireJS go to http://requirejs.org/

define(
	
// dependency paths go here. These could be the paths specified in main.js
[ '$' ],

function ( $ ) {

	'use strict';
	
	var app, deferreds;

	app = {};

	deferreds = {};

	// wait for DOM ready
	deferreds.dom = new $.Deferred();
	$(function () {
		deferreds.dom.resolve();
	});


	// load our app data
	deferreds.data = $.ajax( 'data.json' ).done( function ( data ) {
		app.data = data;
	}).fail( function () {
		throw new Error( 'Run grunt to create the data.json file, then reload' );
	});


	// when we have DOM ready and data ready, proceed
	$.when( deferreds.dom, deferreds.data ).done( function () {
		setTimeout( function () {
			var demo = $( '#gui-{%= name %}' );

			demo.fadeOut( function () {
				demo.html( app.data.scaffolding ).fadeIn();
			});
		}, 2000 );
	});

	

	window.app = app; // useful for debugging!

	return app;

});