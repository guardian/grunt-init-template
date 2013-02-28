/*global document, window */

(function () {

	'use strict';

	// Here you can do browser detection, redirect users to a standalone mobile view, etc.
	// In this example we just want to append our javascript once the initial page load
	// is complete

	var thisScriptTag, projectUrl, versionDir, init, appendElement, appendScript, appendScripts;


	// root URL and current version path (e.g 'http://interactive.guim.co.uk/2013/feb/test/', 'v/5/' )
	thisScriptTag = document.getElementById( 'boot-gig-test-01' );
	projectUrl = thisScriptTag.getAttribute( 'data-project-url' );
	versionDir = thisScriptTag.getAttribute( 'data-version-dir' );


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
			appendElement( 'script', { src: urls[i] }, { onload: check });
		}
	};

	// TODO replace with a proper DOM ready function
	window.onload = function () {
		var scripts = [];

		if ( !window.jQuery ) {
			scripts[ scripts.length ] = 'http://pasteup.guim.co.uk/js/lib/jquery/1.8.1/jquery.min.js';
		}

		appendScripts( scripts, function () {
			appendElement( 'script', {
				id: 'main-gig-test-01',
				'data-main': projectUrl + versionDir + 'main.js',
				'data-project-url': projectUrl,
				'data-version-dir': versionDir,
				src: 'http://pasteup.guim.co.uk/js/lib/requirejs/2.1.1/require.min.js'
			});
		});

		// add project CSS
		appendElement( 'link', { rel: 'stylesheet', href: projectUrl + versionDir + 'min.css' });
	};

}());