/*global GUI_ROOT */
/*jslint white: true */

(function () {

	'use strict';

	// Here you can do browser detection, redirect users to a standalone mobile view, etc.
	// In this example we just want to append our javascript once the initial page load
	// is complete

	var init, appendElement, appendScript, appendScripts;


	appendElement = function ( type, attrs, props ) {
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

		document.body.appendChild( el );
	};


	appendScripts = function ( urls, oncomplete ) {
		var i, remaining, check;

		remaining = urls.length;

		check = function () {
			if ( !--remaining && oncomplete ) {
				oncomplete();
			}
		};

		for ( i=0; i<urls.length; i+=1 ) {
			appendElement( 'script', { src: urls[i] }, { onload: check });
		}
	};

	// TODO replace with a proper DOM ready function
	window.onload = function () {
		appendScripts([ 'http://pasteup.guim.co.uk/js/lib/jquery/1.8.1/jquery.min.js', 'http://pasteup.guim.co.uk/js/lib/requirejs/2.1.1/require.min.js' ], function () {
			appendElement( 'script', { src: GUI_ROOT + 'main.js' });
		});

		appendElement( 'link', { rel: 'stylesheet', href: GUI_ROOT + 'min.css' });
	};


}());