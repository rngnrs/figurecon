const Watch = require('node-watch');
const Diff = require('./Diff.cjs');

module.exports = class Figurecon {

	#config;
	#defaults;
	#hooks;

	#logger = () => {};
	#watcher;
	#fileName;

	/**
	 * Represents a Figurecon instance.
	 * @constructor
	 * @param {String|Object} file
	 * @param {Object} defaults
	 * @param {Object} [options]
	 * @param {Boolean} [options.log]
	 * @param {Function} [options.logger]
	 * @param {Boolean} [options.watch]
	 * @param {Function} [options.watcher]
	 */
	constructor(
		file,
		defaults,
		options
	) {
		(async () => {
			[file, defaults, options] = this.#parseArguments(file, defaults, options);

			if (options.log) {
				this.#logger = options.logger || console.error;
			}
			if (!file) {
				throw new Error('No file is present');
			}
			this.#defaults = defaults;
			this.#hooks = {};

			if (typeof file === 'object') {
				this.#config = file;
				return this;
			}
			// else if typeof file is 'string'
			this.#fileName = file;
			this.#config = this.#require(file);
			if (options.watch) {
				this.watch(options.watcher);
			}
		})();
	}

	#parseArguments(file, defaults, options) {
		// config [object|string], defaults [string], options
		// => Coming soon!

		// config [object|string], defaults [object], options
		// => Do nothing...

		// config [object|string], options
		if (!options && typeof defaults === 'object' && (
			'watch' in defaults || 'logger' in defaults
		)) {
			[options, defaults] = [defaults, options];
		}

		// Apply custom options upon defaults
		options = Object.assign({
			log: false,
			logger: console.log,
			watch: true,
			watcher: Watch
		}, options);

		return [file, defaults, options];
	}

	#require(file) {
		let config = {};
		try {
			if (require.cache[file]) {
				delete require.cache[file];
			}
			let config = require(file);
			if (typeof config === 'string') {
				config = JSON.parse(config);
			}
			return config;
		} catch (e) {
			this.#logger(e);
		}
		return config;
	}

	/**
	 *
	 * @param key {String[]|String}
	 * @param [def] {*}
	 * @returns {*}
	 */
	get(key, def) {
		let config = this.#deepGet(this.#config, key);
		if (typeof config !== 'undefined') {
			return config;
		}
		return this.#deepGet(this.#defaults, key) ?? def;
	}

	/**
	 *
	 * @param key {String[]|String}
	 * @param value {*}
	 * @returns {boolean}
	 */
	set(key, value) {
		let array = [];
		if (this.get(key) === value) {
			return false;
		}
		let config = Object.assign({}, this.#config);
		this.#deepSet(this.#config, key, value);
		this.#getPathArray(key).forEach(k => {
			array.push(k);
			let part = array.join('.');
			if (this.#hooks[part]) {
				for (let hook of this.#hooks[part]) {
					let obj = this.get(part) || {};
					hook(part, this.#deepGet(config, part), obj);
				}
			}
		});
		return true;
	}

	/**
	 *
	 * @param key {String[]|String}
	 * @param hook {Function}
	 * @returns {boolean|Function}
	 */
	on(key, hook) {
		if (typeof hook !== 'function') {
			return false;
		}
		let list = this.#hooks[key];
		if (!list) {
			list = [];
			this.#hooks[key] = list;
		}
		list.push(hook);
		return hook;
	}

	/**
	 *
	 * @param key {String[]|String}
	 * @param hook {Function}
	 */
	off(key, hook) {
		this.#hooks[key] = this.#hooks[key].filter(lhook => hook !== lhook);
	}

	watch(watcher) {
		if (!this.#fileName) {
			return false;
		}
		this.#watcher = watcher(this.#fileName, async (eventType, fileName) => {
			if (this.#fileName !== fileName || eventType !== 'update') {
				return;
			}
			await this.reload();
		});
	}

	reload() {
		if (!this.#fileName) {
			return false;
		}
		let newConfig = this.#require(this.#fileName);
		let diff = Diff(this.#config, newConfig);
		if (!diff) {
			return true;
		}
		for (let edit of diff) {
			this.set(edit.path, edit.after);
		}
		return true;
	}

	unwatch() {
		if (this.#watcher) {
			this.#watcher.close();
			this.#watcher = null;
			return true;
		}
		return false;
	}

	/**
	 *
	 * @param root {Object}
	 * @param path {String[]|String}
	 * @returns {*}
	 */
	#deepGet(root, path) {
		if (!path) {
			let obj = this.#deepClone(root);
			return this.#deepClone(this.#defaults, obj);
		}
		const pathArray = Array.isArray(path)
			? path
			: this.#getPathArray(path);
		return pathArray.reduce((prevObj, key) => prevObj && prevObj[key], root);
	}

	/**
	 *
	 * @param root {Object}
	 * @param path {String[]|String}
	 * @param value {*}
	 * @returns {*}
	 */
	#deepSet(root, path, value) {
		let arr = this.#getPathArray(path);
		for (let i = 0; i < arr.length - 1; i++) {
			let n = arr[i];
			if (!(n in root)) {
				root[n] = {};
			}
			root = root[n];
		}
		if (typeof value === 'undefined') {
			delete root[arr[arr.length - 1]];
			return root;
		}
		root[arr[arr.length - 1]] = value;
		return root;
	}

	/**
	 * @see https://habr.com/ru/post/480786/
	 * @param root {Object}
	 * @param obj {Object}
	 * @returns {Object}
	 */
	#deepClone(root, obj) {
		const out = (!(obj instanceof Object) || Object.getOwnPropertyNames(root).length)
			? this.#deepClone({}, root)
			: root;
		for (const i in obj) {
			if (obj[i] instanceof Object) {
				out[i] = this.#deepClone({}, obj[i]);
				continue;
			}
			out[i] = obj[i];
		}
		return out;
	}

	#getPathArray(path) {
		return String(path).match(/([^[.\]])+/g) || [''];
	}

}
