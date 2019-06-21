const libx = require('libx.js');

module.exports = (function(){
	var mod = {};

	return require('./bundler'); 
})();

(()=>{ // Dependency Injector auto module registration 
	libx.di.register('pax', module.exports);
})();
