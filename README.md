# pax.libx.js 

[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](/LICENSE)
[![npm](https://img.shields.io/npm/v/pax.libx.js.svg?maxAge=1000)](https://www.npmjs.com/package/pax.libx.js)
[![npm](https://img.shields.io/github/languages/code-size/livshitz/pax.libx.js.svg?label=source%20code%20size)](https://www.github.com/livshitz/pax.libx.js)
![Node.js CI](https://github.com/Livshitz/pax.libx.js/workflows/Node.js%20CI/badge.svg)
<!---
[![CircleCI](https://circleci.com/gh/Livshitz/libx.fuser/tree/master.svg?style=shield)](https://circleci.com/gh/Livshitz/libx.fuser)
[![npm](https://img.shields.io/bundlephobia/minzip/pax.libx.js.svg?style=plastic)](https://www.npmjs.com/package/pax.libx.js)
[![npm](https://img.shields.io/bundlephobia/min/pax.libx.js.svg?style=plastic)](https://www.npmjs.com/package/pax.libx.js)
-->

> 📦 pax.libx.js is lightweight and flexible packaging, bundling and building tool for modern web technologies

## Features: 
* Preconfigured setups for quick and easy browserifing, bundling and packaging web-based apps
* All-in-one package
* Compile and browserify Typescript files
* Watch, delete, serve local source files and compiled

## Description:
pax.libx.js is aimed to be the foundations of your webapp, providing one-stop-shop for the is needed to serve, bundle, package and more.

See examples [here](examples/browserify.js)


## Usage
> yarn: yarn add pax.libx.js   
or   
> npm: npm install --save pax.libx.js

## Commands:
> $ npx -p pax.libx.js pax-browserify src/browser.ts dist -y --minify && du -sh dist/  

> $ yarn pax-secrets --lock --folder='/./'

## Contributing

Fork into your own repo, run locally, make changes and submit PullRequests to the main repository.


## License

All projects and packages in this repository are [MIT licensed](/LICENSE).
