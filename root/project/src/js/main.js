require.config({
	baseUrl: 'js/',
	
	shim: {
		// Here is where you define modules that haven't been written for AMD.
		// For example let's shim jQuery
		$: {
			exports: 'jQuery'
		}
	},

	paths: {
		// You can define paths here and use them within modules. Paths are
		// relative to `baseUrl` defined above. Example:
		$: '../lib/jquery'
	}
});

require(
	[
		// There are many ways to approach this. Here's one: Specify which
		// modules need to be loaded before the app can start, then call an
		// app.init() method. Or something. E.g.:
		//
		//     'app',
		//     'model',
		//     'views/main',
		//     'views/list'
		//
		// For this example there is only one module - app.
		'app'
	],

	function ( app ) {
		app.init();
	});