libx = <LibxJS.ILibxJS>require('libx.js/bundles/essentials');
libx.node = require('libx.js/node');
libx.pax = require('./bundler');

libx.log.isShowStacktrace = false;

const mod: any = {};
mod.options = {};

mod.options.tsconfigPath = libx.node.args.tsconfig || (__dirname + '/tsconfig.default.json');
mod.options.tsconfig = libx.node.readJsonStripComments(mod.options.tsconfigPath);
mod.options.watch = libx.node.args.watch;
mod.options.base = libx.node.args.base;
mod.options.src = libx.node.args.src || './src/**/*.ts';
mod.options.src = mod.options.src.split(';');
mod.options.dest = libx.node.args.dest || './build/';
mod.options.enableBrowserify  = libx.node.args.browserify || false;
mod.options.sourcemaps = libx.node.args.sourcemaps || true,
mod.options.execOnDone = libx.node.args.exec,
mod.options.browserifyOptions = {
	// useStream: true,
	paths: ['./node_modules', './src/'],
	sourcemaps: mod.options.sourcemaps,
	sourcemapDest: mod.options.dest,
	babelify: libx.node.args.babelify || libx.node.args.browserify || true,
	babelifyOptions: {
		global: libx.node.args.global || false,
		presets: ['@babel/preset-env'],
		// extensions : ['.js','.ts'],
		sourceMaps: true
	},
	rename: 'main.js',
	extensions : ['.ts', '.js'],
	tsify: libx.node.args.tsify || true,
	tsifyOptions: { 
		global: libx.node.args.global || false,
		files: [],
		// include: mod.options.tsconfig.include || [],
		project: mod.options.tsconfig, //__dirname + '/tsconfig.json',
	},
};
 
// var tsProject = ts.createProject(mod.options.tsconfigPath);

mod.build = async () => {
	return libx.pax.copy((mod.options.src), mod.options.dest, ()=>[
		libx.pax.middlewares.if(mod.options.sourcemaps, libx.pax.middlewares.sourcemaps.init({loadMaps: true})),
		libx.pax.middlewares.if(!mod.options.enableBrowserify, libx.pax.middlewares.ts(mod.options.tsconfig.compilerOptions)),
		libx.pax.middlewares.if(mod.options.enableBrowserify, libx.pax.middlewares.browserify(mod.options.browserifyOptions)),
		libx.pax.middlewares.ifProd(libx.pax.middlewares.minify()),
		// libx.pax.middlewares.if(mod.options.enableBrowserify, libx.pax.middlewares.renameFunc(p=>p.extname='.js')),

		libx.pax.middlewares.if(mod.options.sourcemaps, libx.pax.middlewares.buffer()),
		libx.pax.middlewares.if(mod.options.sourcemaps, libx.pax.middlewares.sourcemaps.write('./')),

	], mod.options.watch, { // options:
		useSourceDir: true,
		base: mod.options.base,
		callback: async ()=> {
			libx.log.i('build done');
			if (mod.options.execOnDone != null) {
				libx.log.v('--------------------------------------');
				await libx.node.exec(mod.options.execOnDone, true);
				libx.log.v('--------------------------------------');
			}
		}
	});
}

if (libx.node.isCalledDirectly()) {
	// execute examples:
	// 	`node src/compiler.js --src='./src/test.ts' --browserify`
	//	`node src/compiler.js --src='./src/*.ts'`
	(async () => {
		libx.node.rmdirRecursiveSync(mod.options.dest);
		await mod.build();
	})();
}

module.exports = mod;