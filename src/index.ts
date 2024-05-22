import { libx } from 'libx.js/build/bundles/node.essentials';
import bundler from "./bundler";

export default module.exports = bundler;
// export default bundler;
// export const pax = bundler;

(()=>{ // Dependency Injector auto module registration   
	libx.di.register('pax', module.exports);
})();
