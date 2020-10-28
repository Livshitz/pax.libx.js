import { libx } from 'libx.js/build/bundles/node.essentials';
import { SHA1, Crypto } from 'libx.js/build/modules/Crypto';
import { network } from 'libx.js/build/modules/Network';

libx.di.register(Crypto, 'crypto');
libx.di.register(network, 'network');

// import * as gulp from 'gulp';
import gulp from 'gulp';
const gulpif = require('gulp-if');
const through = require('through');
const through2 = require('through2');

const path = require('path');
const connect = require('gulp-connect');
const argv = require('yargs').argv;
const cors = require('cors');
const del = require('del');
const fs = require('fs');
const shell = require('gulp-shell');
const compression = require('compression');
const exec = require('child_process').exec;
const spawn = require('child_process').spawn;
import * as typescript from "typescript";
const Stream = require('stream')
const vinyl = require('vinyl')

// const filter = require("gulp-filter");
// const chokidar = require('chokidar');

// middleweres
const minify = require("gulp-babel-minify");
const rename = require('gulp-rename');
import pug from 'pug';
const less = require('less');
const jade = require('gulp-pug');
const gulpless = require('gulp-less');
const sass = require('gulp-sass');
const nodeSass = require('node-sass');
const sass2less = require('less-plugin-sass2less')
const less2sass = require('gulp-less2sass')
const gulpBabel = require('gulp-babel');
const cleanCss = require('gulp-clean-css');
const usemin = require('gulp-usemin');
const htmlmin = require('gulp-htmlmin');
const templateCache = require('gulp-angular-templatecache');
const debug = require('gulp-debug');
const browserify = require('browserify');
const babelify = require("babelify");
const tsify = require("tsify");
const esmify = require("esmify");
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const streamify = require('gulp-streamify');
const concat = require('gulp-concat');
const cheerio = require('cheerio');
const babel = require("@babel/core");
const transform = require('vinyl-transform');
const intoStream = require('into-stream');
const uglify = require('gulp-uglify');
const vueCompiler = require('vue-template-compiler');

less.renderSync = function (input, options) {
    if (!options || typeof options != "object") options = {};
    options.sync = true;
    options.syncImport = true;
    var css;
    this.render(input, options, function (err, result) {
        if (err) throw err;
        css = result.css;
    });
    return css;
};

function string_src(filename, string) {
	var src = require('stream').Readable({ objectMode: true })
	src._read = function () {
	  this.push(new vinyl({
		cwd: "",
		base: "",
		path: filename,
		contents: Buffer.from(string)
	  }))
	  this.push(null)
	}
	return src
}

module.exports = (function(){
	var mod: any = {};

	var wrapper = function(fun) {
		var args = new Array(arguments).slice(1);
		fun.call(args);
	}

	mod.ts = ts;

	mod.tsProject = (configPath: string, extendedOptions?: {}) => {
		return ts.createProject(configPath, extendedOptions);
	};	

	//#region middlewares: 
	mod.middlewares = {};
	mod.middlewares.minify = (options) => streamify(minify(libx.merge({ mangle: false, builtIns: false }, options)));
	mod.middlewares.renameFunc = (func) => rename(func);
	mod.middlewares.rename = (to) => rename(to);
	mod.middlewares.babelify = () => gulpBabel({ presets: ['@babel/preset-env'] });
	mod.middlewares.if = (condition, middlewareAction) => gulpif(condition, middlewareAction);
	mod.middlewares.ifProd = (middleware) => mod.middlewares.if(mod.config.isProd, middleware);
	mod.middlewares.sourcemaps = sourcemaps;
	mod.middlewares.buffer = buffer;
	mod.middlewares.minifyLess = () => cleanCss();
	mod.middlewares.minifyCss = () => cleanCss();
	mod.middlewares.concat = (filename) => concat(filename);
	mod.middlewares.write = (dest) => gulp.dest(dest);
	mod.middlewares.triggerChange = (path) => {
		return through2.obj(async function(file, encoding, callback) {
			this.push(file);
			callback();
			return mod.triggerChange(path);
		});
	}
	mod.middlewares.less = () => {
		return gulpless({
			paths: [path.join(__dirname, 'less', 'includes')],
			plugins: [sass2less]
		})
	};
	mod.middlewares.sass = () => {
		return sass({
			paths: [path.join(__dirname, 'scss', 'includes')],
			plugins: []
		})
	};
	mod.middlewares.less2sass = () => {
		return less2sass();
	};
	mod.middlewares.pug = (locals) => {
		return jade({
			locals: libx.merge(locals || {}, { config: mod.projconfig }),
			// pretty: mod.config.isProd,
		})
	};
	mod.middlewares.vue = (content, file, stylesFile, compilerOptions={}) => {
		let options = {
			whitespace: 'condense',
		};
		let parsed = vueCompiler.parseComponent(content, options);
		let template = parsed.template ? parsed.template.content : '';
		let script = parsed.script ? parsed.script.content : '';
		let style = (parsed.styles && parsed.styles.length > 0) ? parsed.styles[0].content : '';
		let componentName = file.relative;
		
		if (parsed.script != null && (parsed.script.attrs.lang == 'ts')) {
			const compiled = typescript.transpileModule(script, { 
				compilerOptions: libx.merge({ 
					target: typescript.ScriptTarget.ES2015, 
					module: typescript.ModuleKind.ES2020, 
					moduleResolution: typescript.ModuleResolutionKind.NodeJs,
				}, compilerOptions)
			});
			script = compiled.outputText;

			// const p = libx.newPromise();
			// gulp.src(string_src('virtualFile.ts', script))
			// 	.pipe(mod.middlewares.ts())
			// 	.pipe(gulp.dest())
			// 	.on('end', (newStr)=>{
			// 		p.resolve(newStr);
			// 	});

			// const str = await p;
			// script = str;

			// const st = new Stream.Readable();
			// st.push(script, 'utf8');
			// st.push(null);
			// const x = mod.middlewares.ts();
			// script = x(st);
			// script = typescript.compile(script)({});
		}

		if (parsed.template != null && (parsed.template.attrs.lang == 'pug' || parsed.template.attrs.lang == 'jade')) {
			template = pug.compile(template)({});
		}
	
		if (style != null && style != ''){
			if (parsed.styles[0].attrs.lang == 'scss' || parsed.template.attrs.lang == 'sass') {
				style = nodeSass.renderSync({ data: style }).css.toString();
			} else if (parsed.styles[0].attrs.lang == 'less') {
				style = less.renderSync(style);
			}
		}
	
		if (style != null && style.trim() != "") {
			let hash = componentName.hashCode();
			if (parsed.styles[0].attrs.scoped == true) {
				template = template.replace(/>/, ` data-${hash}>`);
				let style1 = style.replace(/(.*){/g, ` [data-${hash}] $1 {`);
				let style2 = style.replace(/(\S*)\s*{/g, `$1[data-${hash}] {`);
				style = style1 + '\n' + style2;
			}
	
			let file = stylesFile; //'./build/styles/vue-components.css'; //'./build/styles/style.css'
			if (!fs.existsSync(file)) fs.writeFileSync(file, '');
			let all = fs.readFileSync(file).toString();
			let newStr = `/* ##${componentName} */\n` + style + `\n/* ##${componentName}-end */`;
			if (all.indexOf(`/* ##${componentName}`) == -1) all = (all || '') +  '\n' + newStr + '\n';
			else {
				let reg = new RegExp(`\\/\\* ##${componentName} \\*\\/([\\s\\S]\*?)\\/\\* ##${componentName}-end \\*\\/`, 'sm');
				all = all.replace(reg, newStr);
			}
			fs.writeFileSync(file, all);
		}
	
		let templateEscaped = template.trim().replace(/`/g, '\\`');
		let scriptWithTemplate = templateEscaped;
		if (script.match(/export default ?\{/)) {
			scriptWithTemplate = script.replace(/export default ?\{/, `$&\n\ttemplate: \`\n${templateEscaped}\`,`);
		} else if (script.match(/exports.default\s?\=\s?\{/)) {
			scriptWithTemplate = script.replace(/exports.default\s?\=\s?\{/, `$&\n\ttemplate: \`${templateEscaped}\`,`);
		} else if (script.match(/exports_1\(\"default\",\s?\{/)) {
			scriptWithTemplate = script.replace(/exports_1\(\"default\",\s?\{/, `$&\n\ttemplate: \`${templateEscaped}\`,`);
		} else if (script.match(/exports\s?\=\s?\{/)) {
			scriptWithTemplate = script.replace(/exports\s?\=\s?\{/, `$&\n\ttemplate: \`${templateEscaped}\`,`);
		} else {
			scriptWithTemplate = `${script}\n exports = {\n\ttemplate: \`\n${templateEscaped}\`};`;
		}

		scriptWithTemplate = scriptWithTemplate.replace(/^\s+?export default ?\{/, 'exports = {')
	
		return scriptWithTemplate;
	};
	mod.middlewares.usemin = (base) => {
		libx.log.verbose('pax.usemin: ');
		return usemin({
			// assetsDir: './tests/bundle/',
			path: base, //'./tests/bundle/',
			//outputRelativePath: "dist",
			css: [ cleanCss(), 'concat' ], // rev()
			html: [ ()=> htmlmin({ collapseWhitespace: true }) ],
			js: [ gulpif(mod.config.isProd, minify({
				mangle: {
				keepClassName: true
				}
			}) ) ],
			jsBundle: [ 'concat' ],
			sitejs: [ gulpBabel({ presets: ['es2015'] }), minify({ mangle: false }).on('error', (uglify) => {
				console.error('! Uglify error: ', uglify.message);
				console.error('usemin error: ', uglify.stack);
				this.emit('end');
			})],
			componentsjs: [ minify({ mangle: false }) ],
			inlinejs: [ minify() ],
			inlinecss: [ cleanCss(), 'concat' ]
		});
	};
	mod.middlewares.template = (name) => {
		return templateCache({
			filename: name + '-templates.js',
			// standalone: true,
			//module: 'myApp'
			base: mod.config.workdir, //process.cwd(),
			transformUrl: function(url) {
				// url = path.relative(mod.config.workdir , url);
				return '/' + url; // '/' + name +  //url.replace(/\.tpl\.html$/, '.html')
			}
		})
	};

	mod.middlewares.tsWithProject = (tsProject) => {
		return tsProject.src().pipe(tsProject());
	}

	mod.middlewares.ts = (_options) => {
		var options: any = {
			module: 'commonjs', // 'commonjs', 'amd', 'umd', 'system'.
            // outFile: 'compiled.js',
		};
		libx.merge(options, _options);

		// outFile forces the use of 'system' or 'amd'
		if (options.outFile != null) {
			options.module = "amd";
		}

		return ts(options);
	}

	mod.middlewares.tsAndSourcemaps = (_options, tsconfigCompilerOptions) => {
		var options: any = {
			module: 'commonjs', // 'commonjs', 'amd', 'umd', 'system'.
            // outFile: 'compiled.js',
		};
		libx.merge(options, _options);
		if (options.outFile != null) options.module = "amd";

		return through2.obj(async function(file, encoding, callback) {
			try {
				if (!file.isBuffer()) return;

				// let stream = fs.createReadStream(file.path);
				file.contents = intoStream(file.contents);
				
				file.contents
					.pipe(source(file.path, file.base))
					// .pipe(source(path.basename(file.path))) //getBundleName() + '.js'))
					.pipe(buffer())
					.pipe(sourcemaps.init({loadMaps: true}))
					.pipe(ts(tsconfigCompilerOptions))
					.pipe(sourcemaps.write('./'))
					// .pipe(rename(f=>f.extname = ".js"))
					.pipe(gulp.dest(options.dest));

				this.push(file);
			}
			catch (ex) {
				libx.log.e('pax.middlewares.tsAdnSourceMaps: Error: ', ex);
				throw ex;
			}
			finally {
				if (callback) callback();
			}

		});
	}

	mod.middlewares.tsify = (_options) => {
		var options = { 
			// transform: [babelify.configure({
			// 	presets: ['es2015'] //, require("@babel/preset-typescript")]
			// })],
			plugin: [tsify],
			treatChunk: (chunk, options)=> {
				if (options.sourcemaps) {
					chunk.contents
						.pipe(source(chunk.path, chunk.base)) //getBundleName() + '.js'))
						.pipe(rename(f=>f.extname = ".js"))
						// .pipe(source(path.basename(chunk.path))) //getBundleName() + '.js'))
						.pipe(buffer())
						.pipe(sourcemaps.init({loadMaps: true}))
						// Add transformation tasks to the pipeline here.
							// .pipe(uglify())
							// .on('error', log.error)
						// .pipe(minify())
						.pipe(sourcemaps.write('./'))
						.pipe(gulp.dest(options.sourcemapDest));
				} else { 
					// Just rename:
					chunk.contents.pipe(source(chunk.path, chunk.base))
						.pipe(rename(f=>f.extname = ".js"))
						.pipe(gulp.dest(options.sourcemapDest));
				}
				return chunk;
			}
		};
		libx.merge(options, _options);
		
		return mod.middlewares.browserify(options); 
	}
	mod.middlewares.browserify = (_options: any = {}) => {
		var options: any = {
			// entries: files,
			// bare: true,
			// bundleExternal: true,
			// target: { node: 'v10.15.3' },
			babelify: false,
			tsify: false,
			// paths: ['./node_modules', './app/'],
			standalone: '__libxjs',
			debug: false,
			plumber: false,
			minify: false,
			useStream: false,
			esmify: false,
		}
		options.babelifyOptions = {
			global: false,
			plugins: [
				// "transform-es2015-arrow-functions",
				// [
				// 	"@babel/plugin-transform-runtime", {
				// 		regenerator: true
				// 	}
				// ]
			],
			presets: [
				[
					'@babel/preset-env', 
					{
						targets: {
							"esmodules": true
						},
						// modules: 'ES6',
						// useBuiltIns: "entry",
					},
				]
				//[__dirname + '/../node_modules/babel-preset-es3'], //, ["@babel/preset-env", "@babel/preset-react"] es2015 env
			],
			sourceMaps: true
		};

		// if (!mod.config.isProd) {
		// 	options.debug = true;
		// 	options.plumber = true;
		// 	options.minify = false;
		// }
		libx.merge(true, options, _options);

		// options.treatChunk = (chunk, options)=>{
		// 	chunk.contents.pipe(source(chunk.path, chunk.base))
		// 		.pipe(gulpBabel({presets: ["@babel/preset-env"]}))
		// 		// .pipe(gulp.dest(options.sourcemapDest));
		// }

		var browserified = through2.obj(function(chunk, enc, callback) {
			if(chunk.isBuffer()) {
				let bundle;
				let content;

				if (!options.useStream) {
					options.entries = chunk.path;
				}
				else content = intoStream(chunk.contents);

				bundle = browserify(content, options);

				if (options.tsify) bundle.plugin(tsify, options.tsifyOptions); //, { noImplicitAny: false, target: 'es3' })
				if (options.esmify) bundle.plugin(esmify);
				if (options.babelify) bundle.transform(babelify, options.babelifyOptions);

				chunk.contents = bundle.bundle();

				if (options.treatChunk) options.treatChunk(chunk, options);

				if (options.rename) {
					let p = path.dirname(chunk.path);
					let f = path.basename(chunk.path);
					chunk.path = p + '/' + options.rename;
				}

				this.push(chunk);
			}
			if (callback) callback();
		});
		
		return browserified;
	};
	mod.middlewares.localize = (libCacheDir, dest, avoidCache) => {
		var transform = async (e, attr, avoidRenameFile?) => {
			var promise = libx.newPromise();
			var sourceDir = process.cwd(); 
			var src = e.attr(attr);
			var dest = e.attr('dest');
			if (src == null) return;
			var m = src.match(/(?:\/\/.+?\/|\.\.\/|\.\/)(.*)\/.*?([^\/]+)(\.[^\.\/\?]+).*$/);
			if (m == null || m.length == 1) return;
			var dir = dest || m[1] + '/';
			var name = m[2];
			var ext = m[3];
			var isRemote = src.match(/^(.+:)?\/\/|http/g) != null
			// if (!isRemote) return;
			var h = SHA1(src).toString();
			var p = (libCacheDir || './') + 'lib-cache/' + (avoidRenameFile ? dir : '');
			// var fname = avoidRenameFile ? `${name}${ext}` : `${h}${ext}`;
			var fname = `${name}${ext}`;
			libx.log.d('pax.localize: fname= ', fname);
			var f = p + fname;
			if (!fs.existsSync(p)) libx.node.mkdirRecursiveSync(p);

			var func = async ()=> {
				onFileReady(e, attr, f, ext, fname, avoidRenameFile ? dir : null).then(()=> {
					promise.resolve();
				});
			}
		
			if (avoidCache || !fs.existsSync(f)) {
				libx.log.d('pax.localize: getting: ', src, ext, h, dir);

				var isNetworkResource = src.startsWith("http://") || src.startsWith("https://") || src.startsWith("ftp://") || src.startsWith("//");

				var handler = (data)=> {
					if (data == null) 
						throw `Could not find "${src}"!`;
					libx.log.d('pax.localize: got data: ', data.length);
						
					try {
						fs.writeFileSync(f, data);
					} catch(err) {
						throw 'Write: error: ' + err;
					}
						func();
				}
				
				if (isNetworkResource) {
					const data = await libx.di.modules.network.httpGet(src, { dataType: '' });
					handler(data);
				} else {
					libx.log.v('pax.localize: getting local: ', src, ext, h, dir);
					let p = path.relative(process.cwd(), mod.config.workdir + '/' + src);
					const data = fs.readFileSync(p);
					handler(data);
				}
			} else {
				func();
			}
			return promise;
		}

		var onFileReady = async (elm, attr, file, ext, fname, dir) => {
			libx.log.d('pax.localize: onFileReady: ', file)
			var type = '';
			switch(ext) {
				case '.js': type = 'scripts'; break;
				case '.css': type = 'styles'; break;
				case '.jpg': 
				case '.jpeg': 
				case '.gif': 
				case '.png': type = 'imgs'; break;
				case '.otf': 
				case '.svg': 
				case '.eot': 
				case '.ttf': 
				case '.woff': type = 'fonts'; break;
			}
			dir = dir || '';
			dir = dir.replace(/^fonts(\/)?(lib)?/, '');
			var p = `/resources/${type}/lib/${dir}`;
			await mod.copy([file], dest + p)
		
			if (attr != null) elm.attr(attr, p.substr(1) + fname);
		}

		return through2.obj(async function(file, encoding, callback) {
			if(file.isBuffer()) {
				var $ = cheerio.load(file.contents);

				var p = [];

				$('script[src][type=""], script[src][type="module"], script[src][type="javascript"], script[src]:not([type])').each(async (i, e)=> {
					p.push(transform($(e), 'src'));
				})
				$('link').each(async (i, e)=> {
					p.push(transform($(e), 'href'));
				})
				$('font').each(async (i, e)=> {
					p.push(transform($(e), 'url', true));
					$(e).remove();
				});
			
				await Promise.all(p); 
			
				libx.log.i('pax.localize: all done, saving')
				file.contents = Buffer.from($.html());

				this.push(file);

			}
			callback();
		});
	}
	mod.middlewares.liveReload = () => connect.reload();

	mod.middlewares.customFileModify = (func) => {
		return through2.obj(async function(file, encoding, callback) {
			try {
				if (!file.isBuffer()) return;

				var newContent = func(file.contents, file)
				if (newContent != null) {
					if (!Buffer.isBuffer(newContent)) newContent = Buffer.from(newContent);
					file.contents = newContent;
				}

				this.push(file);
			}
			finally {
				callback();
			}

		});
	}

	//#endregion

	//#region methods: 
	mod.getArgs = () => argv;

	mod.copy = async (_source, dest, middlewares, shouldWatch, _options) => {
		if (middlewares != null && typeof middlewares != 'function') throw 'middlewares argument must be an initializator (function)!'
		if (middlewares == null) middlewares = ()=> [through()];

		var p = libx.newPromise();

		var options: any = { allowEmpty: true }; // base: mod.config.workdir };
		libx.merge(options, _options);

		// if '_source' contains 
		if (options.base == null) {
			if (!libx.isArray(_source)) _source = [_source];
			var src: any = libx._.map(_source, i=> {
				var m = i.match(/(.+?)\/\*/)
				if (m == null || m.length <= 1) return;
				return m[1];
			})
			src = libx._.reduce(src, null);
			if (src == null || src.length == 0) {
				// options.base = mod.config.workdir;
			} else {
				options.base = src;
				libx.log.verbose('pax.copy: setting base to: ', options.base);
			}
		}

		options.debug = false;
		var stream = gulp.src(_source, options);
		if (options.debug == null) options.debug = mod.config.debug;
		if (options.debug != false) stream = stream.pipe(debug())

		libx._.each(middlewares(), i=>
			stream = stream.pipe(i)
		);

		stream.pipe(gulp.dest(dest)).on('end', ()=> {
			p.resolve(stream);
			if (options.callback) options.callback(stream);
		});
		stream.on('error', (err) => libx.log.error('pax.copy: --- ERROR: --- ', err) );

		shouldWatch = shouldWatch || false;
		if (Array.isArray(_source)) _source = libx._.map(_source, i=> i.replace(/^(\!)?\.\//, '$1'));
		else _source = _source.replace(/^(\!)?\.\//, '$1');

		if (shouldWatch) mod.watch(_source, dest, middlewares, null, options);

		return p;
	};

	mod.test = async (src, dest) => {
		var p = libx.newPromise();

		gulp.src(src + '/**/*.less')
			// .pipe(concat('all.css'))
			.pipe(debug())

			.pipe(gulp.dest('./dist2/'))
			.on('error', (err) => 
				libx.log.e('pax.test: --- ERROR: --- ', err)
				)
			.on('end', ()=> {
				libx.log.i('pax.test: --- DONE --- ')
				p.resolve();
			});
	
		return p;
	}

	mod.watch = async (source, dest, middlewares, callback, _options) => {
		if (middlewares != null && typeof middlewares != 'function') throw 'middlewares arguments must be an initializator (function)!'
		
		var options: any =  {}; //{ base: path.relative(__dirname, path.dirname(source)) }; 
		libx.merge(options, _options);

		libx.log.verbose('pax.watch: Starting to watch "%s"', source);
		mod.watchSimple(source, async(ev, p)=> {
			if (mod.config.watchOnlyChanges == true && ev.type != 'changed') return;
			libx.log.verbose(`pax.watch: File "${p}" ${ev.type}, building to "${dest}"`);
			// options.base = './src'
			// p = path.relative(__dirname, p);
			await mod.copy(options.useSourceDir ? source : p, dest, middlewares, false, options);
			if (callback) callback(p);
			libx.log.verbose(`pax.watch: ${libx.log.color('Done', libx.log.colors.fgGreen)} "${p}"`);
		}, options);
	};

	mod.watchSimple = async (source, callback, _options) => {
		var dir = process.cwd();
		if (libx.isArray(source)) {
			var fixedSource = [];
			libx._.forEach(source, p => {
				fixedSource.push(path.relative(dir, p));
			})
			source = fixedSource;
		} else {
			source = path.relative(dir, source);
		}
		
		var options = { cwd: dir, throttle: 0 };
		options = libx.merge(options, _options); // {cwd: './'}

		const cbkWrapper = (eventName, _path, stats)=> {
			_path = path.relative(dir, _path);
			if (callback) callback({ type: eventName, path: _path }, _path, stats);
		};
		let cbk: Function = cbkWrapper;
		if ((<any>options).useSourceDir) {
			cbk = libx.throttle(cbkWrapper, options.throttle, false);
		}
		gulp.watch(source,  options).on('all', <any>cbk);
		// gulp.watch(source,  options).on('all', async (eventName, _path, stats)=>{
		// 	_path = path.relative(dir, _path);
		// 	if (callback) callback({ type: eventName, path: _path }, _path, stats);
		// });
	}

	mod.triggerChange = async (file) => {
		return fs.readFile(file, (err, data)=> fs.writeFile(file, data, ()=>{} ));
	}

	mod.serve = async (path, options, watchPath, watchCallback) => {
		path = path || mod.config.workdir;
		var port = mod.config.devServer.port;
		var livePort = mod.config.devServer.livePort;
		var opts = {
			livereload: livePort ? {
				port: livePort
			} : false,
			root: path,
			index: true,
			fallback: path + '/' + 'index' + '.html',
			// debug: true,
			https: mod.config.devServer.useHttps,
			/* https: {
				cert: fs.readFileSync("DevLocal.crt"),
				passphrase: "1"
				
				// key: fs.readFileSync("DevLocal.key"),
				// ca: fs.readFileSync(pathToCa),
			}, */
			host: mod.config.devServer.host || '0.0.0.0', //'liv-mac.local',
			port: port,
			middleware: () => [cors(), 
				// compression({
				// 	filter: (req) => req.url !== '/'
				// })
			],
		};
		opts = libx.merge({}, opts, options);

		if (watchPath != null) {

			if (mod.config.devServer.reloadGraceMS == null) mod.config.devServer.reloadGraceMS = 1000;
			if (mod.config.devServer.reloadDebounceMS == null) mod.config.devServer.reloadDebounceMS = mod.config.devServer.reloadGraceMS;
			
			libx.log.verbose(`pax.serve: starting watch (debounce: ${mod.config.devServer.reloadDebounceMS}ms, grace: ${mod.config.devServer.reloadGraceMS}ms)`);
			var debounce = libx.debounce((path)=> {
				libx.log.verbose('pax.serve: debounced, reloading... ', path);
				if (watchCallback) watchCallback(path);
				gulp.src(path).pipe(connect.reload());
				// setTimeout(()=>gulp.src(path).pipe(connect.reload()), 500);
			}, mod.config.devServer.reloadDebounceMS, false, true);
			// mod.watch = async (source, dest, middlewares, callback, _options) => {
			mod.watchSimple(watchPath, e => {
				libx.log.verbose('pax.serve: detected change!', e.path);
				setTimeout(()=>debounce(e.path), mod.config.devServer.reloadGraceMS);
			}); //, { cmd: path });
		}

		return connect.server(opts);
	};

	mod.delete = async (path, options) => {
		return del(path, options);
	}

	mod.exec = libx.node.exec;
	//#endregion

	mod.consts = {
		environments: { dev: 0, staging: 1, prod:2 },
		environmentsNames: { 0:'dev', 1:'staging', 2:'prod' },
		fileTypes: { other: 0, script: 1, style: 2, html:3 },
		locations: { other: 0, view: 1, component: 2 }
	}

	//#region config: 
	mod.projconfig = {};
	mod.config = {};
	mod.config.workdir = process.cwd(); //path.relative(process.cwd(), '.'); //__dirname
	mod.config.env = mod.getArgs().env || 'dev';
	mod.config.isProd = argv.env == 'prod';
	mod.config.devServer = {};
	mod.config.devServer.port = 3000;
	mod.config.devServer.host = '0.0.0.0';
	mod.config.devServer.livePort = 35729;
	mod.config.devServer.useHttps = false;
	//#endregion

	return mod;
})();