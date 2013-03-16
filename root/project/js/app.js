/*global define, window */

define( [ '$' ],

function ( $ ) {

	'use strict';
	
	var app;

	app = {};


	
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
		
		app.el = $( '#Gui{%= Name %}' );

		app.el.fadeOut( function () {
			app.el.html( app.data.scaffolding ).fadeIn();
		});
	});


	window.app = app; // useful for debugging!

	return app;

});