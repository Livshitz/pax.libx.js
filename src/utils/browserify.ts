// Usage `$ node build/utils/browserify.js ./examples/src/main.ts ./.tmp/example -y`

import { libx as libxEssentials } from 'libx.js/src/bundles/node.essentials';

const libx = { 
	...libxEssentials, 
	pax: require("../index"),
};

import * as path from 'path';


(async ()=>{ /* init */
    let sourceFile = libx.node.args._[0];
	let targetFolder = libx.node.args._[1];
	let filename = path.parse(sourceFile).name;

    let cd = process.cwd() + "/" //__dirname; 
	let src = cd;
	let dest = cd + targetFolder;
    let mainJS = src + sourceFile;

	let shouldMinify = libx.node.args.minify || false;
	libx.pax.config.debug = true;

    console.log('pax:utils:browserify: ', { mainJS, dest, basename: filename });

	if (libx.node.args.y == null && await libx.node.prompts.confirm(`We're going to delete "${dest}", ok?`) != true) return;
	await libx.pax.delete(dest);

	// const tsconfig = libx.pax.ts.createProject(__dirname + '/../../tsconfig.browser.json');
	// let tsOptions = {
	// 	...tsconfig.config.compilerOptions,
	// }
	let bundlerOptions = {
		tsify: true,
		// tsifyOptions: tsOptions,
		// target: { node: 'v6.16.0' },
		babelifyOptions: {
			// global: true,
			// sourceMaps: false
		}
	};

	let p1 = libx.pax.copy(mainJS, dest, ()=>[
		// libx.pax.middlewares.ts(tsOptions, tsconfig), //{}, tsconfig),
		libx.pax.middlewares.browserify(bundlerOptions),
		libx.pax.middlewares.if(shouldMinify, libx.pax.middlewares.minify()),
		libx.pax.middlewares.renameFunc(p=>{
			// p.dirname = p.dirname;
			p.basename = filename + '.min';
			p.extname = '.js';
		}),
	], false, {
		callback: ()=> console.log('build done')
	});

	await Promise.all([p1, ]);

	console.log('-- Done!')
})();