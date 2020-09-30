const { watch } = require('gulp');

const watcher = watch(['../**/*.js'], {}, (ev)=> {
	console.log('----', ev);
});

// watcher.on('change', function(path, stats) {
//   console.log(`File ${path} was changed`);
// });

// watcher.on('add', function(path, stats) {
//   console.log(`File ${path} was added`);
// });

// watcher.on('unlink', function(path, stats) {
//   console.log(`File ${path} was removed`);
// });

// watcher.close();   