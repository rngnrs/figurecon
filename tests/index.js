const assert = require('assert');
const Figurecon = require('../main');

let map = {
  'host': 'localhost',
  'some': {
    'default': {
      'value': true
    }
  },
  'system': {
    'fileDownloadProxy': 'sample.local:1337'
  }
};

let config = new Figurecon("config.json", map);

describe('Figurecon', function () {

  it('присваивает функции конфигу', function () {
    config.proxy = function() {
      let proxy = config.get('system.fileDownloadProxy');
      if (!proxy) {
        return null;
      }
      let parts = proxy.replace(/https?:\/\//, '').split(':');
      let auth = config.get('system.fileDownloadProxyAuth');
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
    console.log(config.proxy());
    assert(typeof config.proxy() === 'object');
  });

  it('отдаёт значения из конфига', function () {
    // Console.log('Default value: ' + map.host);
    // Console.log('Config value:  ' + config.config.host);
    assert(typeof config.get('host') !== 'undefined');
  });

  it('отдаёт стандартное значение', function () {
    let def = 'pururin';
    assert(config.get(Math.floor(Math.random() * 1e6), def) === def);
  });

  it('присваивает функцию слежения', function () {
    config.on('changeme', onChange);
    assert(config.hooks.changeme.length > 0);
  });

  it('задаёт значение', function () {
    config.set('changeme', 42);
    config.set('set.changeme', 2);
  });

  function onChange(key, oldValue, newValue) {
    console.log(key + ': I\'m changed!', oldValue, newValue);
  }

});
