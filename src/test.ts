
import { libx } from 'libx.js';
// import libx = require('libx.js/bundles/essentials');    
// import * as _libx from 'libx.js/bundles/essentials';
// var libx: LibxJS.ILibxJS = _libx;

class Test {
	public run () {
		libx.log.i('test...', libx.pax)
	}
}

new Test().run();