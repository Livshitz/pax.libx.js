/*
How to run:
- `node examples/browserify.js`
	To compile any TS files and browserify main.js and put compiled version in /examples/build/*.
	Open /examples/build/index.html to view, access and play around with libx.js in the browser.
- `$ node examples/browserify.js --watch --serve`
	Do the above and also watch for main.js, *.ts files and also serve the index.html file via local server/
- `$ node examples/browserify.js --watch --serve --minify`
	Do the above but also minify main.js file (slower).
*/

const libx = require('libx.js');
libx.pax = require(__dirname + "/../build/index"); //pax.libx.js
libx.node = require("libx.js/node");

(async ()=>{ /* init */
	var src = __dirname + "/src";
	var dest = __dirname + "/build";
	var mainJS = src + '/main.js';

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

	var p2 = libx.pax.copy(src + '/index.html', dest, null, shouldWatch, { debug: false });

	if (shouldServe) {
		var port = 3010
		libx.log.info(`test: serving... http://0.0.0.0:${port}/main.js`);
		libx.pax.serve(dest, { port: port }, [dest + '/**/*.*']);
	}

	await Promise.all([p1, p2, ]);

	if (shouldWatch) {
		libx.pax.watchSimple([src + '/**/*.ts'], (ev, p)=>{
			if (ev.type != 'changed') return;
			libx.pax.triggerChange(mainJS);
		});
	}

	console.log('-- Ready!')

})();