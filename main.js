const FSWatcher = require('./watcher.js');
const _ = require('underscore');

let Figurecon = function (file, defaults) {
  this.defaults = defaults;
  this.hooks = {};
  let self = this;
  this.config = FSWatcher.createWatchedResource(file, (path) => {
    return require(path);
  }, async function(path) {
    let oldConfig = self.config;
    let id = require.resolve(path);
    if (require.cache.hasOwnProperty(id)) {
      delete require.cache[id];
    }
    let keys = _(oldConfig).reduce((acc, _1, key) => {
      acc[key] = true;
      return acc;
    }, {});
    _(self.config).each((_1, key) => { keys[key] = true; });
    keys = _(keys).pick((_1, key) => { return self.hooks.hasOwnProperty(key); });
    oldConfig = _(keys).reduce((acc, _1, key) => {
      acc[key] = c(key);
      return acc;
    }, {});
        self.config = require(id);
    _(keys).each((_1, key) => {
      self.hooks[key].forEach((hook) => {
        hook(c(key), oldConfig[key], key);
      });
    });
  }) || {};
};

Figurecon.prototype.get = function (key, def) {
  if (typeof def === 'undefined') {
    def = this.defaults.get(key);
  }
  let parts = key.split('.');
  let o = this.config;
  while (parts.length > 0) {
    if (typeof o !== 'object') {
      return def;
    }
    o = o[parts.shift()];
  }
  return (typeof o !== 'undefined') ? o : def;
};

Figurecon.prototype.on = function(key, hook) {
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

module.exports = Figurecon;
module.exports.watcher = FSWatcher;
