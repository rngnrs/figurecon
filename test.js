const Figurecon = require('./main.js');

// Default parameters
let map = new Map([
  ['host', 'localhost'],
  ['some.default.value', true],
  ['system.fileDownloadProxy', 'sample.local:1337'],
  ['system.fileDownloadProxyAuth', 'ololo:epepe']
]);

let config = new Figurecon(__dirname + "/config.json", map);

// Config extension for proxy
config.proxy = function() {
  let proxy = config('system.fileDownloadProxy');
  if (!proxy) {
    return null;
  }
  let parts = proxy.replace(/https:\/\//,'').split(':'),
      auth = config('system.fileDownloadProxyAuth');
  return {
    host: parts[0],
    port: (parts[1] ? +parts[1] : null),
    auth: (auth ? `Basic ${new Buffer(auth).toString('base64')}` : null)
  };
};

console.log(config.config);
console.log('host', config('host'));
console.log('port', config('port'));
console.log('not.exist', config('not.exist', "default_value"));
console.log('some.nested.value', config('some.nested.value'));
console.log('some.nested.value (with .get)', config.get('some.nested.value'));
console.log('some.nested.value (with array, not recommended)', config.config.some.nested.value);

console.log(config.proxy());

process.exit(0);
