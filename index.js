import { readFile } from 'fs/promises';

import Watch from "node-watch";
import Diff from "deep-diff";

export default class Figurecon {

	#config;
	#defaults;
	#hooks;

	#logger;
	#watcher;
	#fileName;

	/**
	 * Represents a Figurecon instance.
	 * @constructor
	 * @param file {String|Object}
	 * @param defaults {Object}
	 * @param [options] {Object}
	 * @param [options.logger] {Function}
	 * @param [options.watch] {Boolean}
	 * @param [options.watcher] {Function}
	 */
	constructor(
		file,
		defaults,
		options
	) {
		(async () => {
			[file, defaults, options] = this.#parseArguments(file, defaults, options);

			this.#logger = options.logger || console.log;
			try {
				if (typeof file === 'object') {
					this.#config = file;
				} else {
					this.#fileName = file;
					try {
						this.#config = JSON.parse((await readFile(file)).toString());
					} catch (e) {
						if (['ENOENT'].includes(e.code)) {
							return this.#logger(e.message);
						}
						this.#logger(e);
					}
				}
				this.#defaults = defaults;
				this.#hooks = {};

				if (options.watch) {
					this.watch(options.watcher);
				}
			} catch (e) {
				this.#logger(e);
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
			logger: console.log,
			watch: true,
			watcher: Watch
		}, options);

		if (!file || !defaults) {
			throw new Error('Not enough arguments');
		}
		return [file, defaults, options];
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
		return def ?? this.#deepGet(this.#defaults, key);
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
		key.toString().split('.').forEach(k => {
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
		this.#watcher = watcher(this.#fileName, async (eventType, fileName) => {
			if (eventType !== 'update') {
				return true;
			}
			let newConfig = {};
			try {
				newConfig = await readFile(new URL(`?r=${Math.random()}`, fileName));
			} catch (e) {
				return this.#logger('Syntax error?');
			}
			let diff = Diff(this.#config, newConfig);
			if (!diff) {
				return true;
			}
			for (let edit of diff) {
				this.set(edit.path.join('.'), edit.rhs);
			}
		});
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
			throw new Error('No path is specified');
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
		let obj = root;
		for (let i = 0; i < arr.length - 1; i++) {
			let n = arr[i];
			if (!(n in obj)) {
				obj[n] = {};
			}
			obj = obj[n];
		}
		obj[arr[arr.length - 1]] = value;
		return root;
	}

	#getPathArray(path) {
		return String(path).match(/([^[.\]])+/g);
	}

}
