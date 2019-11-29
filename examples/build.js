const libx = require('libx.js');
libx.pax = require("../src/index"); //pax.libx.js
libx.node = require("libx.js/node");

(async ()=>{ /* init */
	let dir = '.'
	var src = dir + "/src";
	var dest = dir + "/build";
	var mainJS = src + '/main.js';

	debugger

	var shouldWatch = libx.node.args.watch || false;
	var shouldMinify = libx.node.args.minify || false;
	var shouldServe = libx.node.args.serve || false;
	libx.pax.config.debug = true;

	await libx.pax.delete(dest);

	var bundlerOptions = {
		tsify: true,
		// target: { node: 'v6.16.0' },
		babelifyOptions: {
			// global: true,
			// sourceMaps: false
		}
	};

	var p1 = libx.pax.copy(mainJS, dest, ()=>[
		libx.pax.middlewares.browserify(bundlerOptions),
		libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minify()),
	], shouldWatch, {
		callback: ()=> console.log('build done')
	});

	var p2 = libx.pax.copy([src + '/**/*.pug'], dest, ()=> [
		libx.pax.middlewares.pug(),
		// libx.pax.middlewares.liveReload(),
	], shouldWatch, { debug: false });

	var p3 = libx.pax.copy([src + '/styles/style.scss'], `${dest}/styles/`, ()=> [
		libx.pax.middlewares.sass(),
		// libx.pax.middlewares.liveReload(),
		libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minifyCss()),
	], shouldWatch, { debug: false });

	if (shouldServe) {
		var port = 3010
		libx.log.info(`test: serving... http://0.0.0.0:${port}/main.js`);
		libx.pax.serve(dest, { port: port }, [dest + '/**/*.*']);
	}

	await Promise.all([p1, p2, p3 ]);

	if (shouldWatch) {
		libx.pax.watchSimple([src + '/**/*.ts'], (ev, p)=>{
			if (ev.type != 'changed') return;
			libx.pax.triggerChange(mainJS);
		});
	}

	console.log('-- Ready!')
})();