/*global document, window */

(function () {

	'use strict';

	// Here you can do browser detection, redirect users to a standalone mobile view, etc.
	// In this example we just want to append our javascript once the initial page load
	// is complete

	var init, createElement, appendScript, appendScripts, scripts, body, head;

	head = document.head;
	body = document.body;


	createElement = function ( type, attrs, props ) {
		var key, el = document.createElement( type );

		for ( key in attrs ) {
			if ( attrs.hasOwnProperty( key ) ) {
				el.setAttribute( key, attrs[ key] );
			}
		}

		for ( key in props ) {
			if ( props.hasOwnProperty( key ) ) {
				el[ key ] = props[ key ];
			}
		}

		return el;
	};


	appendScripts = function ( urls, oncomplete ) {
		var i, remaining, check;

		remaining = urls.length;

		if ( !remaining && oncomplete ) {
			oncomplete();
			return;
		}

		check = function () {
			if ( !--remaining && oncomplete ) {
				oncomplete();
			}
		};

		for ( i=0; i<urls.length; i+=1 ) {
			head.appendChild( createElement( 'script', { src: urls[i] }, { onload: check }) );
		}
	};

	
	// see which scripts we need to load
	scripts = [];

	// jQuery?
	if ( !window.jQuery ) {
		scripts[ scripts.length ] = 'http://pasteup.guim.co.uk/js/lib/jquery/1.8.1/jquery.min.js';
	}

	// requirejs?
	if ( !window.require ) {
		scripts[ scripts.length ] = 'http://pasteup.guim.co.uk/js/lib/requirejs/2.1.1/require.min.js';
	}

	// add those scripts, then once they've loaded, start our app
	appendScripts( scripts, function () {
		head.appendChild( createElement( 'script', { src: '<%= projectUrl %>/<%= versionDir %>/js/main.js' }) );
	});
	
	// add project CSS
	head.appendChild( createElement( 'link', { rel: 'stylesheet', href: '<%= projectUrl %>/<%= versionDir %>/min.css' }) );

}());