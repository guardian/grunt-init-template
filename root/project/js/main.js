(function () {

	'use strict';

	require.config({
		baseUrl: '<%= projectUrl %>/<%= versionDir %>/js',
		paths: {
			$: 'lib/jquery.amd'
		}
	});

	require([ 'app' ], function ( app ) {
		app.projectUrl = '<%= projectUrl %>';
		app.versionDir = '<%= versionDir %>';

		app.init();
	});

}());