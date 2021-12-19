import { libx } from "libx.js/build/bundles/browser.essentials";

module.exports = (function(){
	// Include libx.js essentials in the outputted file as global (=window) variable:
	// (<any>global)._libx_avoidExtensions = true; // comment out if those extensions interfere with other libraries and uncomment the 'libx.extensions.apply*' commands bellow

	(<any>global).libx = libx;

	// libx.extensions.applyStringExtensions();
	// libx.extensions.applyDateExtensions();
	// libx.extensions.applyArrayExtensions();
	
	// libx.log.isDebug = true;

	// Register general dependencies:
	// require('libx.js/modules/network');
	// require('libx.js/modules/appEvents');
	// require('libx.js/modules/rxjs');

	// Register modules into DI:
	// window.myModule = new (require('./modules/myModule').default)();
	// libx.di.register('myModule', window.myModule);


	window.onload = (() => {
		// libx.di.register('myModule2', new (require('./modules/myModule2').default)(args));
	});

	// Example how to require DI for specific modules (note: if one of the dependencies is not yet available it'll become pending func):
	libx.di.inject((log, network, activityLog, myModule) => {
		log.isDebug = false;
		log.debug('net: ', network, activityLog)
	});

	// Example how to require DI module (not recommended, use `require`. This will fail because 'log' is not immediately available):
	// libx.di.get('log').verbose('Hello');

	// Say Hey on startup to prove we're there
	libx.log.v('main.js is ready')

	return libx;
})();
