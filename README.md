# figurecon
#### Simple configuration module with real-time updates

## Description
This module is designed as a simple ES6-based advanced config module.

**WARNING: Be sure not to use this package in production.**

**It is unreliable because not tested properly.**

**Any method can be changed/removed in any time, so use it carefully!**

## Features
- Update values on-the-fly
- May use defaults if no custom config is present
- Supports update subscriptions (hooks)

## Installation
```shell script
npm i @rngnrs/figurecon

yarn add @rngnrs/figurecon
```

## Usage

### Import the module

#### [modern style] With config object, ES6 modules
```js
import Figurecon from '@rngnrs/figurecon';

const configObject = {
  'key': 'value'
}

const defaults = {
  'your.config.here': true
};

const config = new Figurecon(configObject, defaults);
// ...
```

#### [modern style] With config file, ES6 modules
```js
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import Figurecon from '@rngnrs/figurecon';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaults = {
  'your.config.here': true
};

const config = new Figurecon(resolve(__dirname, "./config.json"), defaults);
// ...
```

#### With config file
```js
const path = require('path');
const Figurecon = require('@rngnrs/figurecon');
const defaults = {
  'your.config.here': true
};

const config = new Figurecon(path.resolve(__dirname, "./config.json"), defaults);
// ...
```

#### With config object
```js
const Figurecon = require('@rngnrs/figurecon');

const configObject = {
  'key': 'value'
}

const defaults = {
  'your.config.here': true
};

const config = new Figurecon(configObject, defaults);
// ...
```

### Get a value
**Breaking:** Versions below 1.0.0 could get a value via `config(key, defaults)`.
Due to ES6 class rewrite, Figurecon does not support this behaviour:
use `config.get(key, defaults)` instead.
```js
//...
let value1 = config.get('your.config.here'); // => true
let value2 = config.get('non.existent.key', 'default'); // => 'default'
let value3 = config.get('non.existent.key'); // => undefined
```

### Set a value
```js
// ...
let isSet1 = config.set('non.existent.key'); // => true, because `undefined` is value too
let isSet2 = config.set('non.existent.key', 111); // => true
let isSet3 = config.set('non.existent.key', 111); // => false, because already has this value
let isSet4 = config.set('non.existent.key', 222); // => true, because another value
```

### Subcriptions (hooks)
```js
// ...
let func = () => { /* ... */ };

// Subscribe to `key` updates
let hook = config.on('key', func);

// Usually it is an update from config file...
// but now we create it directly
config.set('key', true);

// Unsubscribe
// Also you could use `hook` because it returns `func`
config.off('key', func);
```

### Use watcher for real-time updates
Figurecon uses real-time updates via tiny package called `node-watch` by default.
If you want change a library, just use a wrapper that implements such interface:
```js
// ...
let WatchLib = require('node-watch'); // or any other
let watcher = function (fileName, callback = async (eventType, fileName) => {}) {
  return WatchLib(fileName, callback);
};
config.watch(watcher);
// when you do not need it, use .unwatch for correct process exiting:
config.unwatch();
```
If watcher already has this interface, just use this:
```js
let WatchLib = require('node-watch');
const config = new Figurecon(configObject, defaults, {
  watch: true, // now by default!
  watcher: WatchLib
});
```

### Disable watcher (completely)
If you want to disable updates, put `{ watch: false } ` in `options`:
```js
const config = new Figurecon(configObject, defaults, {
  watch: false
});
```
