import assert from "assert";
import Figurecon from "../index.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let map = {
  'host': 'localhost',
  'system': {
    'fileDownloadProxy': 'sample.local:1337',
    'fileDownloadProxyAuth': 'sampl:lamps'
  }
};

let config = new Figurecon(resolve(__dirname, "../config.json"), map);

describe('Figurecon', function () {

  it('returns a variable from file, not from defaults', function () {
    assert.strictEqual(config.get('some.nested.value'), 42);
  });

  it('returns default value if nothing is present', function () {
    let def = 'pururin';
    let key = String(Math.floor(Math.random() * 1e6));
    assert.strictEqual(config.get(key, def), def);
  });

  it('add hooks', function () {
    let def = Math.floor(Math.random() * 1e6);
    let key = 'changeme.zero';

    let hook = (_key, oldValue, newValue) => {
      assert.strictEqual(_key, key);
      assert.strictEqual(newValue, def);

      config.off(key, hook);
    }

    config.on(key, hook);
    config.set(key, def);
  });

  it('create values', function () {
    config.set('changeme.zero', 28);
    config.set('changeme.first', 7);
    config.set('changeme.second', 2010);

    assert.strictEqual(config.get('changeme.zero'), 28);
    assert.strictEqual(config.get('changeme.first'), 7);
    assert.strictEqual(config.get('changeme.second'), 2010);

    config.set('changeme.second', 2017);
    assert.strictEqual(config.get('changeme.second'), 2017);
  });

  after(() => {
    config.unwatch();
  })

});
