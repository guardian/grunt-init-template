/*global define */

define(
[ '<%= versionDir %>js/app' ],
function ( app ) {

	'use strict';

	return {
		boot: function ( el, window, config, mediator ) {

			var guiEl, supported, link, head;

			guiEl = el.getElementsByTagName( 'div' )[0];

			// do feature detection etc
			supported = true;

			if ( !supported ) {
				message = '<div class="GuiBrowserWarning"><h2>Time to upgrade your browser!</h2><p>Your browser lacks features necessary to view this interactive. We strongly recommend upgrading to a modern browser such as <a href="http://google.com/chrome">Google Chrome</a> or <a href="http://getfirefox.com">Mozilla Firefox</a>.</p></div>';
				guiEl.innerHTML = message;

				return;
			}

			// load CSS
			link = document.createElement( 'link' );
			link.setAttribute( 'rel', 'stylesheet' );
			link.setAttribute( 'href', '<%= versionDir %>styles/min.css' );

			head = document.getElementsByTagName( 'head' )[0];
			head.appendChild( link );


			// launch app
			app.launch( el, guiEl, window, config, mediator );
		}
	};

});