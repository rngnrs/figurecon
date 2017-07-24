const fs = require('fs');
const path = require('path');
const diff = require('deep-diff');
const watch = require('node-watch');

function Figurecon(key, def, logger) {
  logger = logger || console.log;
  let defaults = def;
  try {
    this.config = require(path.resolve(key));
  } catch (e) {
    this.config = {};
    logger('Syntax error?');
  }
  this.hooks = {};

  watch(key, (eventType, fileName) => {
    if (eventType !== 'update') {
      return true;
    }
    let config = {};
    try {
      let id = require.resolve(path.resolve(fileName));
      delete require.cache[id];
      config = require(path.resolve(fileName));
    } catch (e) {
      return logger('Syntax error?');
    }
    let Diff = diff(this.config, config);
    if (!Diff) {
      return true;
    }
    for (let edit of Diff) {
      this.set(edit.path.join('.'), edit.rhs);
    }
  });

  this.get = (key, def) => {
    if (typeof def === 'undefined') {
      def = defaults[key];
    }
    let config = deepFind(this.config, key);
    return (typeof config !== 'undefined')
      ? config
      : def;
  };

  this.set = (key, value) => {
    if (this.hooks[key]) {
      for (let hook of this.hooks[key]) {
        hook(key, this.get(key), value);
      }
    }
    deepSet(this.config, key, value);
  };

  this.on = (key, hook) => {
    if (typeof hook !== 'function') {
      return this;
    }
    let list = this.hooks[key];
    if (!list) {
      list = [];
      this.hooks[key] = list;
    }
    list.push(hook);
    return this;
  };
}

function deepFind(obj, path) {
  let ref = obj;

  path.toString().split('.').forEach(function (key) {
    if (ref) {
      ref = ref[key];
    }
  });

  return ref;
}

function deepSet(obj, path, value) {
  let ref = obj;

  path.toString().split('.').forEach(function (key, index, arr) {
    let last = (index === arr.length - 1);
    if (last && typeof value === 'undefined') {
      delete ref[key];
      return ref;
    }
    ref = ref[key] = last
      ? value
      : {};
  });

  return obj;
}

module.exports = Figurecon;
