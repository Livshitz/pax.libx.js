const libx = require('libx.js');
let bundler = require('./bundler'); 

export default module.exports = bundler;

(()=>{ // Dependency Injector auto module registration 
	libx.di.register('pax', module.exports);
})();
