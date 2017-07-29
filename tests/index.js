const assert = require('assert');
const Figurecon = require('../main');

let map = {
  'host': 'localhost',
  'system': {
    'fileDownloadProxy': 'sample.local:1337',
    'fileDownloadProxyAuth': 'sampl:lamps'
  }
};

let config = new Figurecon("config.json", map);

describe('Figurecon', function () {

  it('присваивает функции конфигу', function () {
    config.proxy = function() {
      let proxy = config('system.fileDownloadProxy');
      if (!proxy) {
        return null;
      }
      let parts = proxy.replace(/https?:\/\//, '').split(':');
      let auth = config('system.fileDownloadProxyAuth');
      return {
        "host": parts[0],
        "port": parts[1]
          ? Number(parts[1])
          : null,
        "auth": auth
          ? 'Basic ' + Buffer.from(auth).toString('base64')
          : null
      };
    };
    let out = config.proxy();
    assert(typeof out === 'object' && typeof out.host !== 'undefined' && out.port !== null);
  });

  it('отдаёт значения из файла, а не из стандартных параметров', function () {
    // Console.log('Default value: ' + map.host);
    // Console.log('Config value:  ' + config.config.host);
    assert(typeof config('host') !== 'undefined');
  });

  it('отдаёт стандартное значение, если в файле его нет', function () {
    let def = 'pururin';
    assert(config(Math.floor(Math.random() * 1e6), def) === def);
  });

  it('присваивает функцию слежения', function () {
    config.on('changeme', onChange);
    config.on('changeme.zero', onChangeLocal);
    assert(config.hooks.changeme.length > 0);
  });

  it('задаёт значение', function () {
    config.set('changeme.zero', 28);
    config.set('changeme.first', 7);
    config.set('changeme.second', 2010);
    config.set('changeme.second', 2017);
    config.set('changeme.first', 7);
  });

  function onChange(key, oldValue, newValue) {
    console.log(key + ': I\'m changed from ' + oldValue + ' to ' + newValue);
  }

  function onChangeLocal(key, oldValue, newValue) {
    console.log(key + ': Woo-hoo! YAY! I\'m changed from ' + oldValue + ' to ' + newValue);
  }

});
