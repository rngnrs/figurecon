const Figurecon = require('./main.js');

let map = new Map([
  ['host', 'localhost'],
  ['some.default.value', true]
]);

let config = new Figurecon(__dirname + "/config.json", map);
console.log('host', config.get('host'));
console.log('port', config.get('port'));
console.log('not.exist', config.get('not.exist', "default_value"));
console.log('some.nested.value', config.get('some.nested.value'));

process.exit(0);
