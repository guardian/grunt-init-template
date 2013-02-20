/*global Modernizr */
/*jslint white: true */

(function () {

	'use strict';

	var browserWarning, directToMobile, init, createScript;


	browserWarning = function () {
		var el = document.getElementById( 'gui-remittances' );
		el.innerHTML = "<div class='gui-browser-warning'><h2>Time to upgrade your browser!</h2><p>You're using an out of date browser which lacks features necessary to view this interactive.</p><p>We strongly recommend you upgrade to a modern, more secure browser such as <a href='http://google.com/chrome'>Google Chrome</a> or <a href='http://getfirefox.com'>Mozilla Firefox</a>.</p>";
	};

	directToMobile = function () {
		var el = document.getElementById( 'gui-remittances' );

		document.body.innerHTML = "<a class='gui-launch-mobile' target='_blank' href='index.html?mobile=true'><img src='assets/splash.png'><div class='gui-launch-mobile-title'><h2>How much money do migrants send home?</h2><p>launch &raquo;</p></div></a>";
	};

	createScript = function ( url, onload ) {
		var script = document.createElement( 'script' );

		script.onload = onload;
		script.src = url;

		document.body.appendChild( script );
	};

	init = function () {
		var jquery, require, main, conditionallyLoadMain, remaining = 2;

		conditionallyLoadMain = function () {
			if ( --remaining ) {
				return;
			}

			main = createScript( 'js/main.js' );
		};

		//jquery = createScript( 'http://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min.js', conditionallyLoadMain );
		jquery = createScript( 'lib/jquery.js', conditionallyLoadMain );
		require = createScript( 'require.js', conditionallyLoadMain );
	};



	// are we in a shit browser?
	if ( !Modernizr.svg ) {
		browserWarning();
		return;
	}


	// are we in a mobile browser, and NOT already in the mobile view?
	if ( navigator.userAgent.match( /mobile/i ) && window.location.search.indexOf( 'mobile=true' ) === -1 ) {
		directToMobile();
		return;
	}


	// still here? load the app
	init();



}());