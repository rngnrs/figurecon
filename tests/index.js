import assert from "assert";
import Figurecon from "../index.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { readFile } from "fs/promises";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const defaultConfig = {
  "host": "localhost",
  "system": {
    "fileDownloadProxy": "sample.local:1337",
    "fileDownloadProxyAuth": "sampl:lamps"
  }
};

const currentConfig = {
  "host": "hostname",
  "port": 8080,
  "some": {
    "nested": {
      "value": 42
    },
  },
  "system": {
    "fileDownloadProxy": "sample.local:1337",
    "fileDownloadProxyAuth": "sampl:lamps"
  }
};

let config = new Figurecon(resolve(__dirname, "../config.json"), defaultConfig);

describe('Figurecon', () => {

  it('returns error with no file argument', () => {
    assert.rejects(() => {
      new Figurecon(undefined, undefined, {
        log: false
      })
    },err => {
      assert(err instanceof Error);
      assert(/No file is present/.test(err));
      return true;
    },
    'unexpected error')
  });

  it('does not return error with arguments: file <String>, options', () => {
    assert.doesNotReject( () => new Figurecon(resolve(__dirname, '../config.json'), {
      watch: false,
      log: true
    }));
  });

  it('does not return error with arguments: file <Object>, options', async () => {
    const configFile = await readFile(resolve(__dirname, '../config.json'));
    assert.doesNotReject( () => new Figurecon(configFile, {
      watch: false,
      log: true
    }));
  });

  it('does not watch any file without `file`', async () => {
    const configFile = await readFile(resolve(__dirname, '../config.json'));
    let config = new Figurecon(configFile, {
      watch: false,
      log: true
    });
    assert.strictEqual(config.watch(), false);
  });

  it('returns all the config while path is undefined', () => {
    assert.deepStrictEqual(config.get(undefined), currentConfig);
  });

  it('returns a variable from file', () => {
    assert.strictEqual(config.get('some.nested.value'), 42);
  });

  it('returns a variable from defaults, if not present in file', () => {
    assert.strictEqual(config.get('system.fileDownloadProxy'), defaultConfig.system.fileDownloadProxy);
  });

  it('returns default value if nothing is present', () => {
    let def = 'pururin';
    let key = String(Math.floor(Math.random() * 1e6));
    assert.strictEqual(config.get(key, def), def);
  });

  it('adds hooks', () => {
    let def = Math.floor(Math.random() * 1e6);
    let key1 = 'change';
    let key2 = 'change.me';

    let hook1 = (_key, oldValue, newValue) => {
      assert.strictEqual(_key, key1);
      assert.deepStrictEqual(newValue, {
        me: def
      });

      config.off(key1, hook1);
    }
    let hook2 = (_key, oldValue, newValue) => {
      assert.strictEqual(_key, key2);
      assert.strictEqual(newValue, def);

      config.off(key2, hook2);
    }
    config.on(key1, hook1);
    config.on(key2, hook2);

    config.set(key2, def);
  });

  it('returns false while adding wrong hook', () => {
    assert.strictEqual(config.on('changeme.first', 42), false);
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
  });

  it('reloads config correctly', () => {
    assert.strictEqual(config.reload(), true);
    assert.deepStrictEqual(config.get(), {
      "host": "hostname",
      "system":{
        "fileDownloadProxy": "sample.local:1337",
        "fileDownloadProxyAuth": "sampl:lamps"
      },
      "port": 8080,
      "some": {
        "nested": {
          "value": 42
        }
      },
      "change": {},
      "changeme": {}
    });
  });

  it('returns false when trying to unwatch twice', () => {
    let value1 = config.unwatch();
    let value2 = config.unwatch();

    assert.strictEqual(value1, true);
    assert.strictEqual(value2, false);
  });

});
