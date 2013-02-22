/*global GUI_ROOT */
/*jslint white: true */

(function () {

	'use strict';

	// example bootstrapper follows...

	var init, appendScript, appendScripts;


	appendScript = function ( url, onload ) {
		var script = document.createElement( 'script' );

		script.onload = onload;
		script.src = url;

		document.body.appendChild( script );
	};

	appendScripts = function ( urls, oncomplete ) {
		var i, remaining, check;

		remaining = urls.length;

		check = function () {
			if ( --remaining ) {
				return;
			}

			if ( oncomplete ) {
				oncomplete();
			}
		};

		for ( i=0; i<urls.length; i+=1 ) {
			appendScript( urls[i], check );
		}
	};

	// TODO replace with a proper DOM ready function
	window.onload = function () {
		appendScripts([ 'http://code.jquery.com/jquery-1.9.1.min.js', GUI_ROOT + 'require.js' ], function () {
			appendScript( GUI_ROOT + 'main.js' );
		});
	};


}());