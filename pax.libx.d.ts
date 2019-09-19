
// declare class Pax {
	
// }

// // --------------------------------------------------------------------------------

// // enables access simply as global var.
// declare var pax: Pax;
// declare module NodeJS  {
//     interface Global {
//         pax: Pax;
//     }
// }

declare module LibxJS {
	export interface ILibxJS {
		pax: IPax;
	}

	export interface IPax {
		middlewares: IPaxMiddlewares,
		getArgs(): any;
		copy(_source, dest, middlewares, shouldWatch, _options): Promise<void>;
		watch(source, dest, middlewares, callback, _options): Promise<void>;
		watchSimple(source, callback, _options): Promise<void>;
		triggerChange(file): Promise<void>;
		serve(path, options, watchPath, watchCallback): Promise<void>;
		delete(path, options): Promise<void>;
		exec(command: string, callback?: (error, stdout: string, stderr: string) => void): any;
	}

	export interface IPaxMiddlewares {
		minify,
		renameFunc,
		rename,
		babelify,
		if,
		ifProd,
		sourcemaps,
		buffer,
		minifyLess,
		minifyCss,
		concat,
		write,
		triggerChange,
		less,
		sass,
		less2sass,
		pug,
		usemin,
		template,
		ts,
		tsAndSourcemaps,
		tsify,
		browserify,
		localize,
		liveReload,
		customFileModify,
	}
}