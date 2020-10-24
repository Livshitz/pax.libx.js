import { libx } from 'libx.js/src/bundles/node.essentials';
let bundler = require('./bundler'); 

export default module.exports = bundler;

(()=>{ // Dependency Injector auto module registration   
	libx.di.register('pax', module.exports);
})();
