var pax = require('../build/index.js')


pax.watchSimple('../**/*.js', (ev)=> {
	console.log('change!', ev);
})
