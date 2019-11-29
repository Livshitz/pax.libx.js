const libx = require('libx.js');
libx.pax = require("../src/index"); //pax.libx.js
libx.node = require("libx.js/node");

(async ()=>{ /* init */
	let dir = '.'
	var src = dir + "/src";
	var dest = dir + "/build";

	var shouldWatch = libx.node.args.watch || false;
	var shouldMinify = libx.node.args.minify || false;
	var shouldServe = libx.node.args.serve || false;
	libx.pax.config.debug = true;

	// await libx.pax.delete(dest);

	var p1 = libx.pax.copy([src + '/**/*.pug'], dest, ()=> [
		libx.pax.middlewares.pug(),
		// libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minify()),
		// libx.pax.middlewares.liveReload(),
	], shouldWatch, { debug: false });

	if (shouldServe) {
		var port = 3010
		libx.log.info(`test: serving... http://0.0.0.0:${port}/`);
		libx.pax.serve(dest, { port: port }, [dest + '/**/*.*']);
	}

	await Promise.all([p1, ]);

	console.log('-- Ready!')
})();