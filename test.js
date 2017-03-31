const Figurecon = require('./main.js');

let map = new Map([
  ['host', 'localhost'],
  ['some.default.value', true]
]);

let config = new Figurecon(__dirname + "/config.json", map);
console.log(config.config);
console.log('host', config('host'));
console.log('port', config('port'));
console.log('not.exist', config('not.exist', "default_value"));
console.log('some.nested.value', config('some.nested.value'));
console.log('some.nested.value (with .get)', config.get('some.nested.value'));
console.log('some.nested.value (with array, not recommended)', config.config.some.nested.value);

process.exit(0);
