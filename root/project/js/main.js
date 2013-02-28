/*global require, document */

(function () {

	'use strict';

	var scriptTag, projectUrl, versionDir;

	// set app projectUrl and versionDir using attributes attached to this script tag
	// this allows us to not create a bunch of global variables
	scriptTag = document.getElementById( 'main-{%= name %}' );

	projectUrl = scriptTag.getAttribute( 'data-project-url' );
	versionDir = scriptTag.getAttribute( 'data-version-dir' );


	require.config({
		paths: {
			$: 'lib/jquery.amd'
		}
	});


	require([ 'app' ], function ( app ) {

		app.projectUrl = projectUrl;
		app.versionDir = versionDir;

		app.init();

	});

}());