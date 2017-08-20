const fs = require('fs');
const path = require('path');
const diff = require('deep-diff');
const watch = require('node-watch');

function Wrapper(key, def, watchFile, logger) {
  return Figurecon.init(key, def, watchFile, logger || console.log);
}

function Figurecon(key, def) {
  return Figurecon.get(...arguments);
}

Figurecon.init = (key, def, watchFile, logger) => {
  Figurecon.defaults = def;
  Figurecon.hooks = {};
  Figurecon.logger = logger;
  Figurecon.config = {};

  if (fs.existsSync(key)) {
    try {
      Figurecon.config = require(path.resolve(key));
    } catch (e) {
      logger('Syntax error?');
    }
    if (watchFile) {
      Figurecon.watchFile(key);
    }
  }
  return Figurecon;
};

Figurecon.watchFile = (file) => {
  Figurecon.watcher = watch(file, (eventType, fileName) => {
    if (eventType !== 'update') {
      return true;
    }
    let config = {};
    try {
      let id = require.resolve(path.resolve(fileName));
      delete require.cache[id];
      config = require(path.resolve(fileName));
    } catch (e) {
      return Figurecon.logger('Syntax error?');
    }
    let Diff = diff(Figurecon.config, config);
    if (!Diff) {
      return true;
    }
    for (let edit of Diff) {
      Figurecon.set(edit.path.join('.'), edit.rhs);
    }
  });
};

Figurecon.unwatchFile = () => {
  if (Figurecon.watcher) {
    Figurecon.watcher.close();
    return true;
  }
  return false;
};

Figurecon.get = (key, def) => {
  let config = deepFind(Figurecon.config, key);
  if (typeof config !== 'undefined') {
    return config;
  }
  return (typeof def === 'undefined')
    ? deepFind(Figurecon.defaults, key)
    : def;
};

Figurecon.set = (key, value) => {
  let array = [];
  if (Figurecon(key) === value) {
    return false;
  }
  let config = JSON.parse(JSON.stringify(Figurecon.config));
  deepSet(Figurecon.config, key, value);
  key.toString().split('.').forEach(function (k, i) {
    array.push(k);
    let part = array.join('.');
    if (Figurecon.hooks[part]) {
      for (let hook of Figurecon.hooks[part]) {
        let obj = Figurecon(part) || {};
        hook(part, deepFind(config, part), obj);
      }
    }
  });
  return true;
};

Figurecon.on = (key, hook) => {
  if (typeof hook !== 'function') {
    return false;
  }
  let list = Figurecon.hooks[key];
  if (!list) {
    list = [];
    Figurecon.hooks[key] = list;
  }
  list.push(hook);
  return true;
};

Figurecon.off = (key, hook) => {
  let list = Figurecon.hooks[key];
  Figurecon.hooks[key] = list.filter((lhook) => {
    return hook !== lhook;
  });
};

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
  let a = path.split('.');
  let o = obj;
  for (let i = 0; i < a.length - 1; i++) {
    let n = a[i];
    if (n in o) {
      o = o[n];
    } else {
      o[n] = {};
      o = o[n];
    }
  }
  o[a[a.length - 1]] = value;
  return obj;
}

module.exports = Wrapper;
