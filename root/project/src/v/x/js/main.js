/*global require */
(function () {

	'use strict';

	require.config({
		baseUrl: '<%= projectUrl %><%= versionDir %>js',
		paths: {
			$: 'lib/jquery.amd'
		}
	});

	require([ 'app' ]);

}());