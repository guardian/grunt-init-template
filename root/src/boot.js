/*global define */

define(
function () {

	'use strict';

	// If you alter this config, you will also need to alter the
	// requirejs task config in the Gruntfile
	var amdConfig = {
		context: '{%= name %}', // don't remove this!
		baseUrl: '<%= projectUrl %><%= versionDir %>js',

		paths: {
			text: 'text'
		}
	};

	return {
		boot: function ( el, context, config, mediator ) {

			var supported, loadCSS, head, localRequire, launch;

			// do feature detection etc
			supported = true;

			if ( !supported ) {
				message = '<div class="gui-browser-warning"><h2>Time to upgrade your browser!</h2><p>Your browser lacks features necessary to view this interactive. We strongly recommend upgrading to a modern browser such as <a href="http://google.com/chrome">Google Chrome</a> or <a href="http://getfirefox.com">Mozilla Firefox</a>.</p></div>';
				el.innerHTML = message;

				return;
			}

			// load CSS
			head = document.getElementsByTagName( 'head' )[0];

			loadCSS = function ( url ) {
				var link = document.createElement( 'link' );
				link.setAttribute( 'rel', 'stylesheet' );
				link.setAttribute( 'href', url );

				head.appendChild( link );
			};

			loadCSS( '<%= fonts %>' );
			loadCSS( '<%= projectUrl %><%= versionDir %>styles/min.css' );
			

			// determine whether we're using requirejs (i.e. we're on R2) or curl
			// (i.e. we're on next-gen), so that we can apply config appropriately
			launch = function ( app ) {
				app.launch( el, context, config, mediator );
			};

			if ( typeof require() === 'function' ) {
				// requirejs, i.e. R2
				localRequire = require.config( amdConfig );
				localRequire([ 'app' ], launch );
			}

			else {
				// curl, i.e. next-gen
				require( amdConfig, [ 'app' ]).then( launch );
			}
		}
	};

});



