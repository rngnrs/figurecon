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

describe('Figurecon', () => {

  it('returns error with no file argument', () => {
    assert.rejects(() => {
      new Figurecon(undefined, undefined)
    },err => {
      assert(err instanceof Error);
      assert(/argument/.test(err));
      return true;
    },
    'unexpected error')
  });

  it('does not return error with arguments: file, options', () => {
    new Figurecon(resolve(__dirname, '../config.json'), {
      watch: true,
      logger: console.log
    });
  })

  it('returns an error while getting values without path', () => {
    assert.rejects(() => config.get(undefined), Error);
  });

  it('returns a variable from file', () => {
    assert.strictEqual(config.get('some.nested.value'), 42);
  });

  it('returns a variable from defaults, if not present in file', () => {
    assert.strictEqual(config.get('system.fileDownloadProxy'), map.system.fileDownloadProxy);
  });

  it('returns default value if nothing is present', () => {
    let def = 'pururin';
    let key = String(Math.floor(Math.random() * 1e6));
    assert.strictEqual(config.get(key, def), def);
  });

  it('adds hooks', () => {
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

  it('creates values', () => {
    config.set('changeme.zero', 28);
    config.set('changeme.first', 7);
    config.set('changeme.second', 2010);

    assert.strictEqual(config.get('changeme.zero'), 28);
    assert.strictEqual(config.get('changeme.first'), 7);
    assert.strictEqual(config.get('changeme.second'), 2010);
  });

  it('returns false when trying to set the same value twice', () => {
    assert.strictEqual(config.get('changeme.second'), 2010);

    let value1 = config.set('changeme.second', 2017);
    let value2 = config.set('changeme.second', 2017);

    assert.strictEqual(value1, true);
    assert.strictEqual(value2, false);
    assert.strictEqual(config.get('changeme.second'), 2017);
  })

  it('returns false when trying to unwatch twice', () => {
    let value1 = config.unwatch();
    let value2 = config.unwatch();

    assert.strictEqual(value1, true);
    assert.strictEqual(value2, false);
  })

});
